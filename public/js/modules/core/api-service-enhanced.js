// MOOSH WALLET - Enhanced API Service Module
// API communication with comprehensive error handling
// Includes retry logic, caching, and error recovery

(function(window) {
    'use strict';

    class EnhancedAPIService {
        constructor(stateManager, errorHandler) {
            this.stateManager = stateManager;
            this.errorHandler = errorHandler || new (window.ApiErrorHandler || ApiErrorHandler)();
            
            // Set base URL
            this.setupBaseURL();
            
            // Configure endpoints
            this.setupEndpoints();
            
            // Request configuration
            this.defaultTimeout = 30000; // 30 seconds
            this.defaultHeaders = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            
            // Cache configuration
            this.cache = new Map();
            this.cacheExpiry = {
                price: 5 * 60 * 1000,      // 5 minutes
                balance: 30 * 1000,        // 30 seconds
                transactions: 60 * 1000,    // 1 minute
                static: 24 * 60 * 60 * 1000 // 24 hours
            };
            
            // Retry configuration
            this.setupRetryConfigs();
        }

        setupBaseURL() {
            const currentHost = window.location.hostname;
            if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
                this.baseURL = window.MOOSH_API_URL || `${window.location.protocol}//127.0.0.1:3001`;
            } else {
                this.baseURL = window.MOOSH_API_URL || `${window.location.protocol}//${currentHost}:3001`;
            }
        }

        setupEndpoints() {
            const isMainnet = this.stateManager.get('isMainnet') !== false;
            
            this.endpoints = {
                // Internal API endpoints
                generateWallet: '/api/wallet/generate',
                importWallet: '/api/wallet/import',
                generateSparkWallet: '/api/spark/generate-wallet',
                importSparkWallet: '/api/spark/import-wallet',
                
                // Proxy endpoints (to avoid CORS)
                bitcoinPrice: '/api/proxy/bitcoin-price',
                coingeckoPrice: '/api/proxy/coingecko-price',
                blockstreamUtxo: '/api/proxy/blockstream/address',
                feeEstimates: '/api/proxy/blockstream/fee-estimates',
                bip39Wordlist: '/api/proxy/bip39-wordlist',
                
                // External endpoints (for reference)
                external: {
                    blockstream: isMainnet ? 'https://blockstream.info/api' : 'https://blockstream.info/testnet/api',
                    blockcypher: isMainnet ? 'https://api.blockcypher.com/v1/btc/main' : 'https://api.blockcypher.com/v1/btc/test3',
                    mempool: isMainnet ? 'https://mempool.space/api' : 'https://mempool.space/testnet/api'
                }
            };
        }

        setupRetryConfigs() {
            // Configure retry behavior for different endpoints
            this.errorHandler.configureRetry('/api/wallet/generate', {
                maxRetries: 3,
                backoff: 'exponential',
                initialDelay: 2000
            });
            
            this.errorHandler.configureRetry('/api/spark/generate-wallet', {
                maxRetries: 5,
                backoff: 'exponential',
                initialDelay: 5000,
                maxDelay: 60000
            });
            
            this.errorHandler.configureRetry('/api/proxy/bitcoin-price', {
                maxRetries: 3,
                backoff: 'linear',
                initialDelay: 1000
            });
        }

        /**
         * Make HTTP request with error handling
         */
        async request(endpoint, options = {}) {
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
            const method = options.method || 'GET';
            const cacheKey = `${method}:${url}:${JSON.stringify(options.body)}`;
            
            // Check cache for GET requests
            if (method === 'GET' && options.cache !== false) {
                const cached = this.getFromCache(cacheKey, options.cacheType);
                if (cached) {
                    ComplianceUtils.log('APIService', `Using cached data for ${endpoint}`);
                    return cached;
                }
            }
            
            // Build request configuration
            const config = {
                method,
                headers: { ...this.defaultHeaders, ...options.headers },
                signal: this.createAbortSignal(options.timeout),
                ...options
            };
            
            if (options.body && typeof options.body === 'object') {
                config.body = JSON.stringify(options.body);
            }
            
            try {
                // Make request with retry logic
                const response = await this.errorHandler.executeWithRetry(
                    () => this.performRequest(url, config),
                    endpoint,
                    { method, body: options.body }
                );
                
                // Cache successful GET responses
                if (method === 'GET' && response) {
                    this.setCache(cacheKey, response, options.cacheType);
                }
                
                return response;
            } catch (error) {
                // Handle error
                const errorResult = await this.errorHandler.handleError(error, {
                    endpoint,
                    method,
                    body: options.body
                });
                
                // Check for fallback
                if (options.fallback) {
                    ComplianceUtils.log('APIService', `Using fallback for ${endpoint}`);
                    return options.fallback;
                }
                
                throw error;
            }
        }

        /**
         * Perform the actual HTTP request
         */
        async performRequest(url, config) {
            const response = await fetch(url, config);
            
            // Check response status
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.response = {
                    status: response.status,
                    data: await this.parseResponse(response)
                };
                throw error;
            }
            
            return await this.parseResponse(response);
        }

        /**
         * Parse response based on content type
         */
        async parseResponse(response) {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else if (contentType && contentType.includes('text/')) {
                return await response.text();
            }
            
            return await response.blob();
        }

        /**
         * Create abort signal for timeout
         */
        createAbortSignal(timeout) {
            const controller = new AbortController();
            const timeoutMs = timeout || this.defaultTimeout;
            
            setTimeout(() => controller.abort(), timeoutMs);
            
            return controller.signal;
        }

        /**
         * Cache management
         */
        getFromCache(key, type = 'default') {
            const cached = this.cache.get(key);
            
            if (!cached) return null;
            
            const expiry = this.cacheExpiry[type] || this.cacheExpiry.default || 60000;
            const age = Date.now() - cached.timestamp;
            
            if (age > expiry) {
                this.cache.delete(key);
                return null;
            }
            
            return cached.data;
        }

        setCache(key, data, type = 'default') {
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                type
            });
            
            // Limit cache size
            if (this.cache.size > 100) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
        }

        clearCache(type) {
            if (type) {
                for (const [key, value] of this.cache.entries()) {
                    if (value.type === type) {
                        this.cache.delete(key);
                    }
                }
            } else {
                this.cache.clear();
            }
        }

        // Convenience methods
        async get(endpoint, options = {}) {
            return this.request(endpoint, { ...options, method: 'GET' });
        }

        async post(endpoint, data, options = {}) {
            return this.request(endpoint, { ...options, method: 'POST', body: data });
        }

        async put(endpoint, data, options = {}) {
            return this.request(endpoint, { ...options, method: 'PUT', body: data });
        }

        async delete(endpoint, options = {}) {
            return this.request(endpoint, { ...options, method: 'DELETE' });
        }

        // Bitcoin-specific endpoints with enhanced error handling
        async getBitcoinPrice() {
            try {
                const data = await this.get(this.endpoints.bitcoinPrice, {
                    cache: true,
                    cacheType: 'price',
                    fallback: this.getLastKnownPrice()
                });
                
                // Store as last known good price
                if (data && data.usd) {
                    this.storeLastKnownPrice(data.usd);
                }
                
                return data;
            } catch (error) {
                ComplianceUtils.log('APIService', 'Failed to get Bitcoin price, using fallback', 'warn');
                return this.getLastKnownPrice();
            }
        }

        async getBitcoinBalance(address) {
            return this.get(`/api/bitcoin/balance/${address}`, {
                cache: true,
                cacheType: 'balance',
                fallback: { balance: 0, txCount: 0 }
            });
        }

        async getBitcoinTransactions(address, limit = 20) {
            return this.get(`/api/bitcoin/transactions/${address}`, {
                cache: true,
                cacheType: 'transactions',
                params: { limit },
                fallback: []
            });
        }

        async broadcastTransaction(txHex) {
            return this.post('/api/bitcoin/broadcast', { tx: txHex }, {
                cache: false,
                timeout: 60000 // 60 seconds for broadcast
            });
        }

        // Spark Protocol endpoints
        async generateSparkWallet(strength = 128) {
            return this.post(this.endpoints.generateSparkWallet, { strength }, {
                timeout: 120000, // 2 minutes for Spark SDK
                cache: false
            });
        }

        async importSparkWallet(mnemonic) {
            return this.post(this.endpoints.importSparkWallet, { mnemonic }, {
                timeout: 120000,
                cache: false
            });
        }

        // Helper methods
        getLastKnownPrice() {
            try {
                const stored = this.stateManager.get('lastKnownBTCPrice');
                if (stored && stored.price && stored.timestamp) {
                    const age = Date.now() - stored.timestamp;
                    if (age < 24 * 60 * 60 * 1000) { // 24 hours
                        return { usd: stored.price, usd_24h_change: 0 };
                    }
                }
            } catch (error) {
                ComplianceUtils.log('APIService', 'Error reading last known price', 'error');
            }
            
            // Default fallback price
            return { usd: 50000, usd_24h_change: 0 };
        }

        storeLastKnownPrice(price) {
            try {
                this.stateManager.set('lastKnownBTCPrice', {
                    price,
                    timestamp: Date.now()
                });
            } catch (error) {
                ComplianceUtils.log('APIService', 'Error storing last known price', 'error');
            }
        }

        // Health check
        async healthCheck() {
            try {
                const response = await this.get('/api/health', {
                    timeout: 5000,
                    cache: false
                });
                return response.status === 'ok';
            } catch (error) {
                return false;
            }
        }

        // Get API status
        getStatus() {
            return {
                baseURL: this.baseURL,
                cacheSize: this.cache.size,
                errorCount: this.errorHandler.getErrorLog().length,
                healthy: this.healthCheck()
            };
        }
    }

    // Make available globally
    window.EnhancedAPIService = EnhancedAPIService;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.EnhancedAPIService = EnhancedAPIService;
    }

})(window);