/**
 * Blockchain Service - Real Bitcoin Balance and Transaction Fetching
 * Uses public blockchain APIs to get real-time data
 */

import fetch from 'node-fetch';

// Blockchain API endpoints
const BLOCKCHAIN_APIS = {
    // Blockstream API (reliable, no API key needed)
    blockstream: {
        mainnet: 'https://blockstream.info/api',
        testnet: 'https://blockstream.info/testnet/api'
    },
    // Mempool.space API (alternative)
    mempool: {
        mainnet: 'https://mempool.space/api',
        testnet: 'https://mempool.space/testnet/api'
    }
};

/**
 * Get Bitcoin balance from blockchain
 * @param {string} address - Bitcoin address
 * @param {string} network - 'mainnet' or 'testnet'
 * @returns {object} Balance data
 */
export async function getBitcoinBalance(address, network = 'mainnet') {
    try {
        // Validate address format
        if (!address || typeof address !== 'string') {
            throw new Error('Invalid address');
        }

        // Skip if it's a Spark address
        if (address.startsWith('sp1')) {
            return getSparkBalance(address);
        }

        // Use Blockstream API
        const baseUrl = BLOCKCHAIN_APIS.blockstream[network];
        const response = await fetch(`${baseUrl}/address/${address}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                // Address not found - return 0 balance
                return {
                    success: true,
                    data: {
                        address,
                        balance: '0.00000000',
                        unconfirmed: '0.00000000',
                        total: '0.00000000',
                        currency: 'BTC',
                        txCount: 0
                    }
                };
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Calculate balances in BTC
        const confirmedBalance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
        const unconfirmedBalance = (data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum) / 100000000;
        const totalBalance = confirmedBalance + unconfirmedBalance;

        return {
            success: true,
            data: {
                address,
                balance: confirmedBalance.toFixed(8),
                unconfirmed: unconfirmedBalance.toFixed(8),
                total: totalBalance.toFixed(8),
                currency: 'BTC',
                txCount: data.chain_stats.tx_count + data.mempool_stats.tx_count,
                // Additional data
                fundedTxoCount: data.chain_stats.funded_txo_count,
                spentTxoCount: data.chain_stats.spent_txo_count
            }
        };
    } catch (error) {
        console.error('Error fetching Bitcoin balance:', error);
        
        // Try fallback API (Mempool.space)
        try {
            const baseUrl = BLOCKCHAIN_APIS.mempool[network];
            const response = await fetch(`${baseUrl}/address/${address}`);
            
            if (response.ok) {
                const data = await response.json();
                const totalBalance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
                
                return {
                    success: true,
                    data: {
                        address,
                        balance: totalBalance.toFixed(8),
                        unconfirmed: '0.00000000',
                        total: totalBalance.toFixed(8),
                        currency: 'BTC',
                        txCount: data.chain_stats.tx_count
                    }
                };
            }
        } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
        }

        // Return error response
        return {
            success: false,
            error: error.message,
            data: {
                address,
                balance: '0.00000000',
                unconfirmed: '0.00000000',
                total: '0.00000000',
                currency: 'BTC',
                error: true
            }
        };
    }
}

/**
 * Get Bitcoin transactions for an address
 * @param {string} address - Bitcoin address
 * @param {string} network - 'mainnet' or 'testnet'
 * @param {number} limit - Maximum number of transactions to return
 * @returns {object} Transaction list
 */
export async function getBitcoinTransactions(address, network = 'mainnet', limit = 50) {
    try {
        const baseUrl = BLOCKCHAIN_APIS.blockstream[network];
        const response = await fetch(`${baseUrl}/address/${address}/txs`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return {
                    success: true,
                    data: {
                        address,
                        transactions: [],
                        count: 0
                    }
                };
            }
            throw new Error(`API error: ${response.status}`);
        }

        const transactions = await response.json();
        
        // Format transactions
        const formattedTxs = transactions.slice(0, limit).map(tx => {
            // Calculate value for this address
            let value = 0;
            let type = 'unknown';
            
            // Check inputs (if address is in inputs, it's a send)
            const isInInputs = tx.vin.some(input => 
                input.prevout && input.prevout.scriptpubkey_address === address
            );
            
            // Check outputs
            const outputsToAddress = tx.vout.filter(output => 
                output.scriptpubkey_address === address
            );
            
            if (isInInputs && outputsToAddress.length === 0) {
                // Pure send
                type = 'sent';
                value = -tx.vin
                    .filter(input => input.prevout && input.prevout.scriptpubkey_address === address)
                    .reduce((sum, input) => sum + input.prevout.value, 0);
            } else if (!isInInputs && outputsToAddress.length > 0) {
                // Pure receive
                type = 'received';
                value = outputsToAddress.reduce((sum, output) => sum + output.value, 0);
            } else if (isInInputs && outputsToAddress.length > 0) {
                // Self-transfer or change
                type = 'self';
                const inputValue = tx.vin
                    .filter(input => input.prevout && input.prevout.scriptpubkey_address === address)
                    .reduce((sum, input) => sum + input.prevout.value, 0);
                const outputValue = outputsToAddress.reduce((sum, output) => sum + output.value, 0);
                value = outputValue - inputValue;
            }

            return {
                txid: tx.txid,
                type,
                value: (value / 100000000).toFixed(8),
                fee: tx.fee ? (tx.fee / 100000000).toFixed(8) : '0.00000000',
                confirmations: tx.status.confirmed ? tx.status.block_height : 0,
                timestamp: tx.status.block_time || Date.now() / 1000,
                status: tx.status.confirmed ? 'confirmed' : 'pending'
            };
        });

        return {
            success: true,
            data: {
                address,
                transactions: formattedTxs,
                count: formattedTxs.length,
                hasMore: transactions.length > limit
            }
        };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return {
            success: false,
            error: error.message,
            data: {
                address,
                transactions: [],
                count: 0
            }
        };
    }
}

/**
 * Get current Bitcoin price in USD
 * @returns {number} Bitcoin price in USD
 */
export async function getBitcoinPrice() {
    try {
        // Use multiple price sources
        const sources = [
            'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
            'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
            'https://api.kraken.com/0/public/Ticker?pair=XBTUSD'
        ];

        // Try Coinbase first
        try {
            const response = await fetch(sources[0]);
            const data = await response.json();
            return parseFloat(data.data.rates.USD);
        } catch (e) {
            // Try Binance
            try {
                const response = await fetch(sources[1]);
                const data = await response.json();
                return parseFloat(data.price);
            } catch (e2) {
                // Try Kraken
                const response = await fetch(sources[2]);
                const data = await response.json();
                const price = data.result.XXBTZUSD.c[0];
                return parseFloat(price);
            }
        }
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        return 0; // Return 0 if all sources fail
    }
}

/**
 * Get Spark balance (placeholder - needs Spark API integration)
 * @param {string} address - Spark address
 * @returns {object} Balance data
 */
export function getSparkBalance(address) {
    // TODO: Integrate with Spark Protocol API when available
    // For now, return mock data
    return {
        success: true,
        data: {
            address,
            balance: '0.00000000',
            unconfirmed: '0.00000000',
            total: '0.00000000',
            currency: 'SPARK',
            lightning: {
                balance: 0,
                channels: 0
            },
            stablecoins: {
                USDT: 0
            }
        }
    };
}

/**
 * Get network status and block height
 * @param {string} network - 'mainnet' or 'testnet'
 * @returns {object} Network status
 */
export async function getNetworkStatus(network = 'mainnet') {
    try {
        const baseUrl = BLOCKCHAIN_APIS.blockstream[network];
        const response = await fetch(`${baseUrl}/blocks/tip/height`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch block height');
        }

        const blockHeight = await response.text();
        
        // Get latest block details
        const blockResponse = await fetch(`${baseUrl}/blocks/tip/hash`);
        const blockHash = await blockResponse.text();

        return {
            success: true,
            data: {
                connected: true,
                blockHeight: parseInt(blockHeight),
                blockHash: blockHash.trim(),
                network
            }
        };
    } catch (error) {
        console.error('Error fetching network status:', error);
        return {
            success: false,
            error: error.message,
            data: {
                connected: false,
                blockHeight: 0,
                network
            }
        };
    }
}

export default {
    getBitcoinBalance,
    getBitcoinTransactions,
    getBitcoinPrice,
    getSparkBalance,
    getNetworkStatus
};