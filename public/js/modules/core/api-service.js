// MOOSH WALLET - API Service Module
// External Data Integration and API Management
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class APIService {
        constructor(stateManager) {
            this.stateManager = stateManager;
            // Dynamically set API URL based on current host
            const currentHost = window.location.hostname;
            if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
                this.baseURL = window.MOOSH_API_URL || `${window.location.protocol}//127.0.0.1:3001`;
            } else {
                // Use same host as the page (for WSL or remote access)
                this.baseURL = window.MOOSH_API_URL || `${window.location.protocol}//${currentHost}:3001`;
            }
            // Determine if we're on mainnet or testnet
            const isMainnet = this.stateManager.get('isMainnet') !== false;
            
            this.endpoints = {
                coingecko: 'https://api.coingecko.com/api/v3',
                blockstream: isMainnet ? 'https://blockstream.info/api' : 'https://blockstream.info/testnet/api',
                blockcypher: isMainnet ? 'https://api.blockcypher.com/v1/btc/main' : 'https://api.blockcypher.com/v1/btc/test3'
            };
        }
        
        async fetchBitcoinPrice() {
            return ComplianceUtils.measurePerformance('Bitcoin Price Fetch', async () => {
                try {
                    const cache = this.stateManager.get('apiCache');
                    const now = Date.now();
                    
                    // Use cache if fresh (5 minutes)
                    if (cache.prices?.bitcoin && cache.lastUpdate && (now - cache.lastUpdate) < 300000) {
                        ComplianceUtils.log('APIService', 'Using cached Bitcoin price', 'info');
                        return cache.prices.bitcoin;
                    }
                    
                    // Get last known price for fallback
                    const lastKnownPrice = this.getLastKnownPrice();
                    
                    // Use proxy endpoint to avoid CORS issues
                    let data;
                    try {
                        const response = await fetch(`${this.baseURL}/api/proxy/bitcoin-price`, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        data = await response.json();
                    } catch (directError) {
                        ComplianceUtils.log('APIService', 'Direct API failed, trying proxy: ' + directError.message, 'warn');
                        // Try CORS proxy
                        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')}`;
                        const proxyResponse = await fetch(proxyUrl);
                        data = await proxyResponse.json();
                    }
                    ComplianceUtils.log('APIService', 'Bitcoin price fetched successfully', 'info');
                    
                    // Validate API response
                    if (!data || !data.bitcoin || typeof data.bitcoin.usd !== 'number') {
                        throw new Error('Invalid API response format');
                    }
                    
                    // Transform CoinGecko response to expected format
                    const priceData = {
                        usd: data.bitcoin.usd,
                        usd_24h_change: data.bitcoin.usd_24h_change || 0
                    };
                    
                    // Store as last known good price
                    this.storeLastKnownPrice(priceData.usd);
                    
                    // Update cache
                    cache.prices = { bitcoin: priceData };
                    cache.lastUpdate = now;
                    this.stateManager.set('apiCache', cache);
                    
                    // Return the bitcoin price data
                    return priceData;
                } catch (error) {
                    ComplianceUtils.log('APIService', 'Failed to fetch Bitcoin price: ' + error.message, 'error');
                    // Try backup API
                    try {
                        const backupResponse = await fetch(`${this.baseURL}/api/proxy/bitcoin-price`);
                        const backupData = await backupResponse.json();
                        
                        if (backupData && backupData.USD && typeof backupData.USD.last === 'number') {
                            const priceData = {
                                usd: backupData.USD.last,
                                usd_24h_change: 0 // Blockchain.info doesn't provide 24h change
                            };
                            
                            this.storeLastKnownPrice(priceData.usd);
                            return priceData;
                        }
                        
                        throw new Error('Invalid backup API response');
                    } catch (backupError) {
                        ComplianceUtils.log('APIService', 'Backup API also failed: ' + backupError.message, 'error');
                        // Return last known price instead of 0
                        return { 
                            usd: lastKnownPrice || 0, 
                            usd_24h_change: 0 
                        };
                    }
                }
            });
        }
        
        getLastKnownPrice() {
            try {
                const stored = localStorage.getItem('mooshLastKnownBTCPrice');
                if (stored) {
                    const data = JSON.parse(stored);
                    // Use price if less than 24 hours old
                    if (Date.now() - data.timestamp < 86400000) {
                        return data.price;
                    }
                }
            } catch (e) {
                ComplianceUtils.log('APIService', 'Error reading last known price', 'error');
            }
            return null;
        }
        
        storeLastKnownPrice(price) {
            try {
                localStorage.setItem('mooshLastKnownBTCPrice', JSON.stringify({
                    price: price,
                    timestamp: Date.now()
                }));
            } catch (e) {
                ComplianceUtils.log('APIService', 'Error storing last known price', 'error');
            }
        }
        
        async fetchBlockHeight() {
            const endpoints = [
                `${this.endpoints.blockstream}/blocks/tip/height`,
                'https://mempool.space/api/blocks/tip/height',
                'https://api.blockcypher.com/v1/btc/main'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    
                    const response = await fetch(endpoint, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) continue;
                    
                    let height;
                    if (endpoint.includes('blockcypher')) {
                        const data = await response.json();
                        height = data.height;
                    } else {
                        const text = await response.text();
                        height = parseInt(text);
                    }
                    
                    const cache = this.stateManager.get('apiCache');
                    cache.blockHeight = height;
                    this.stateManager.set('apiCache', cache);
                    
                    return height;
                } catch (error) {
                    console.warn(`Block height fetch failed for ${endpoint}:`, error.message);
                }
            }
            
            console.error('All block height endpoints failed');
            return this.stateManager.get('apiCache').blockHeight || 0;
        }
        
        async fetchAddressBalance(address) {
            try {
                console.log(`[APIService] Fetching balance for address: ${address}`);
                console.log(`[APIService] Using endpoint: ${this.endpoints.blockstream}/address/${address}`);
                
                const response = await fetch(`${this.endpoints.blockstream}/address/${address}`);
                
                if (!response.ok) {
                    console.error(`[APIService] API returned status: ${response.status}`);
                    throw new Error(`API returned status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('[APIService] Balance data:', data);
                
                const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
                
                return {
                    balance: balance,
                    txCount: data.chain_stats.tx_count
                };
            } catch (error) {
                console.error('[APIService] Failed to fetch address balance:', error);
                console.error('[APIService] Address was:', address);
                
                // Try alternative API if Blockstream fails
                try {
                    console.log('[APIService] Trying alternative API...');
                    const isMainnet = this.stateManager.get('isMainnet') !== false;
                    const network = isMainnet ? 'main' : 'test3';
                    const altResponse = await fetch(`https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/balance`);
                    
                    if (altResponse.ok) {
                        const altData = await altResponse.json();
                        console.log('[APIService] Alternative API data:', altData);
                        return {
                            balance: altData.balance,
                            txCount: altData.n_tx || 0
                        };
                    }
                } catch (altError) {
                    console.error('[APIService] Alternative API also failed:', altError);
                }
                
                return { balance: 0, txCount: 0 };
            }
        }
        
        async fetchTransactionHistory(address, limit = 10) {
            const endpoints = [
                `${this.endpoints.blockstream}/address/${address}/txs`,
                `https://mempool.space/api/address/${address}/txs`
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    
                    const response = await fetch(endpoint, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) continue;
                    
                    const txs = await response.json();
                    
                    return txs.slice(0, limit).map(tx => ({
                        txid: tx.txid,
                        time: tx.status?.block_time || 0,
                        confirmations: tx.status?.confirmed ? tx.status.block_height : 0,
                        value: this.calculateTxValue(tx, address),
                        fee: tx.fee || 0
                    }));
                } catch (error) {
                    console.warn(`Transaction history fetch failed for ${endpoint}:`, error.message);
                }
            }
            
            console.error('All transaction history endpoints failed');
            return [];
        }
        
        calculateTxValue(tx, address) {
            let value = 0;
            
            // Calculate incoming value
            tx.vout.forEach(output => {
                if (output.scriptpubkey_address === address) {
                    value += output.value;
                }
            });
            
            // Calculate outgoing value
            tx.vin.forEach(input => {
                if (input.prevout && input.prevout.scriptpubkey_address === address) {
                    value -= input.prevout.value;
                }
            });
            
            return value;
        }
        
        // Lightning Network API methods
        async fetchLightningBalance() {
            try {
                // Placeholder - integrate with actual Lightning node API
                // For demo purposes, return mock data
                // Use deterministic value for demo instead of random
                const mockBalance = 123456; // Fixed demo balance in sats
                return mockBalance;
            } catch (error) {
                console.error('Failed to fetch Lightning balance:', error);
                return 0;
            }
        }
        
        async getActiveChannels() {
            try {
                // Placeholder - integrate with Lightning node
                // For demo purposes, return mock data
                // Use deterministic value for demo instead of random
                return 3; // Fixed demo channel count
            } catch (error) {
                console.error('Failed to fetch active channels:', error);
                return 0;
            }
        }
        
        // Stablecoin API methods
        async fetchStablecoinBalance() {
            try {
                // Placeholder - integrate with token contract APIs
                // For demo purposes, return mock data
                // Use deterministic values for demo instead of random
                return {
                    usdt: 1000,
                    usdc: 2000,
                    dai: 500
                };
            } catch (error) {
                console.error('Failed to fetch stablecoin balance:', error);
                return { usdt: 0, usdc: 0, dai: 0 };
            }
        }
        
        // Ordinals API methods
        async fetchOrdinalsCount() {
            try {
                const currentAccount = this.app.state.getCurrentAccount();
                if (!currentAccount || !currentAccount.addresses?.taproot) {
                    return 0;
                }
                
                const address = currentAccount.addresses.taproot;
                console.log('[Dashboard] Fetching ordinals count for:', address);
                
                // Call the API to get real inscription count
                const response = await fetch(`${this.app.apiService.baseURL}/api/ordinals/inscriptions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ address }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    console.error('[Dashboard] Failed to fetch ordinals:', response.status);
                    return 0;
                }
                
                const result = await response.json();
                if (result.success) {
                    const count = result.data.inscriptions.length;
                    console.log('[Dashboard] Found inscriptions:', count);
                    
                    // Update the display immediately
                    const ordinalsCountElement = document.getElementById('ordinalsCount');
                    if (ordinalsCountElement) {
                        ordinalsCountElement.textContent = count > 0 ? `${count} NFTs` : '0 NFTs';
                    }
                    
                    // Show ordinals section if inscriptions exist
                    const ordinalsSection = document.getElementById('ordinalsSection');
                    if (ordinalsSection && count > 0) {
                        ordinalsSection.style.display = 'block';
                    }
                    
                    return count;
                }
                
                return 0;
            } catch (error) {
                console.error('[Dashboard] Failed to fetch ordinals count:', error);
                return 0;
            }
        }
        
        // Network fee estimation
        async estimateFees() {
            try {
                const response = await fetch('https://mempool.space/api/v1/fees/recommended');
                const fees = await response.json();
                
                return {
                    fast: fees.fastestFee,
                    medium: fees.halfHourFee,
                    slow: fees.hourFee
                };
            } catch (error) {
                console.error('Failed to fetch fee estimates:', error);
                return { fast: 20, medium: 10, slow: 5 };
            }
        }
        
        // Send transaction method
        async sendTransaction(txData) {
            try {
                const response = await fetch(`${this.baseURL}/api/transaction/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(txData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Send transaction error:', error);
                throw error;
            }
        }
        
        // Get transactions method
        async getTransactions(address) {
            try {
                // Try multiple API endpoints for better reliability
                const endpoints = [
                    {
                        url: `https://mempool.space/api/address/${address}/txs`,
                        parser: (data) => data
                    },
                    {
                        url: `https://blockstream.info/api/address/${address}/txs`,
                        parser: (data) => data
                    }
                ];
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(endpoint.url);
                        
                        if (response.ok) {
                            const data = await response.json();
                            return {
                                success: true,
                                data: endpoint.parser(data)
                            };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch from ${endpoint.url}:`, err);
                        continue;
                    }
                }
                
                // If all external APIs fail, try our own
                const response = await fetch(`${this.baseURL}/api/transactions/${address}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
                
            } catch (error) {
                console.error('Get transactions error:', error);
                return {
                    success: false,
                    data: [],
                    error: error.message
                };
            }
        }
        
        // Network info aggregation
        async fetchNetworkInfo() {
            try {
                // Fetch multiple network metrics in parallel
                const [height, fees, mempoolInfo] = await Promise.all([
                    this.fetchBlockHeight(),
                    this.estimateFees(),
                    fetch('https://mempool.space/api/mempool')
                        .then(r => r.json())
                        .catch(() => ({ count: 0, vsize: 0 }))
                ]);
                
                return {
                    height: height || 0,
                    fees: fees || { fast: 20, medium: 10, slow: 5 },
                    mempool: {
                        size: mempoolInfo.count || 0,
                        bytes: mempoolInfo.vsize || 0
                    },
                    connected: true,
                    network: 'mainnet'
                };
            } catch (error) {
                console.error('Failed to fetch network info:', error);
                return {
                    height: 0,
                    fees: { fast: 20, medium: 10, slow: 5 },
                    mempool: { size: 0, bytes: 0 },
                    connected: false,
                    network: 'mainnet'
                };
            }
        }
        
        // Spark wallet API methods
        async generateSparkWallet(wordCount = 24) {
            try {
                // Convert wordCount to strength: 12 words = 128 bits, 24 words = 256 bits
                const strength = wordCount === 24 ? 256 : 128;
                
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for SDK
                
                const response = await fetch(`${this.baseURL}/api/spark/generate-wallet`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        strength: strength,
                        network: 'MAINNET' 
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error('Spark wallet generation timed out after 20 seconds');
                    throw new Error('Request timeout - seed generation is taking longer than expected');
                }
                console.error('Failed to generate Spark wallet:', error);
                throw error;
            }
        }
        
        async importSparkWallet(mnemonic) {
            try {
                const response = await fetch(`${this.baseURL}/api/spark/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ mnemonic })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to import Spark wallet:', error);
                throw error;
            }
        }
        
        async getSparkBalance(address) {
            try {
                // First try the API server
                const response = await fetch(`${this.baseURL}/api/balance/${address}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to get balance from API server, trying direct blockchain API:', error);
                
                // Fallback to direct blockchain API call
                try {
                    // Try Blockstream API directly from frontend
                    const blockstreamResponse = await fetch(`https://blockstream.info/api/address/${address}`);
                    if (blockstreamResponse.ok) {
                        const data = await blockstreamResponse.json();
                        const balance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
                        return {
                            success: true,
                            data: {
                                address,
                                balance: balance.toFixed(8),
                                unconfirmed: '0.00000000',
                                total: balance.toFixed(8),
                                currency: 'BTC',
                                source: 'blockstream-direct'
                            }
                        };
                    }
                } catch (blockstreamError) {
                    console.error('Blockstream API also failed:', blockstreamError);
                }
                
                // Return zero balance as last resort
                return {
                    success: false,
                    data: {
                        address,
                        balance: '0.00000000',
                        unconfirmed: '0.00000000',
                        total: '0.00000000',
                        currency: 'BTC',
                        error: 'All API calls failed'
                    }
                };
            }
        }
        
        async getSparkTransactions(address) {
            try {
                const response = await fetch(`${this.baseURL}/api/transactions/${address}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to get Spark transactions:', error);
                throw error;
            }
        }

        // Generic request method for CORS-compliant API calls
        async request(url, options = {}) {
            try {
                // Ensure all requests go through our proxy
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    // External URL - use proxy
                    const proxyUrl = `${this.baseURL}/api/proxy`;
                    const response = await fetch(proxyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers
                        },
                        body: JSON.stringify({
                            url: url,
                            method: options.method || 'GET',
                            headers: options.headers || {},
                            body: options.body
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Proxy request failed: ${response.status}`);
                    }
                    
                    return await response.json();
                } else {
                    // Internal API call
                    const fullUrl = url.startsWith('/') ? `${this.baseURL}${url}` : `${this.baseURL}/${url}`;
                    const response = await fetch(fullUrl, options);
                    
                    if (!response.ok) {
                        throw new Error(`Request failed: ${response.status}`);
                    }
                    
                    return await response.json();
                }
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        }
    }

    // Make available globally and maintain compatibility
    window.APIService = APIService;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.APIService = APIService;
    }

})(window);