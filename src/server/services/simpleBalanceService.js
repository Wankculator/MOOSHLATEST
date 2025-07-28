/**
 * Simple Balance Service
 * Provides balance checking without external dependencies
 */

const https = require('https');

// Simple fetch wrapper
const fetch = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
};

/**
 * Get address balance
 */
async function getAddressBalance(address, network = 'mainnet') {
    try {
        // Check if it's a Bitcoin address
        if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
            // Bitcoin address - use Blockstream API
            const baseUrl = network === 'testnet' 
                ? 'https://blockstream.info/testnet/api' 
                : 'https://blockstream.info/api';
            
            const data = await fetch(`${baseUrl}/address/${address}`);
            
            const balanceSatoshis = data.chain_stats.funded_txo_sum - 
                                   data.chain_stats.spent_txo_sum;
            
            return {
                success: true,
                address,
                balance: {
                    satoshis: balanceSatoshis,
                    btc: (balanceSatoshis / 100000000).toFixed(8)
                },
                currency: 'BTC',
                network,
                transactions: data.chain_stats.tx_count
            };
        } else if (address.startsWith('sp1')) {
            // Spark address - return mock data for now
            return {
                success: true,
                address,
                balance: {
                    wei: '0',
                    spark: '0'
                },
                currency: 'SPARK',
                network,
                message: 'Spark balance checking coming soon'
            };
        } else {
            throw new Error('Unknown address format');
        }
    } catch (error) {
        console.error('Balance fetch error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get transaction history
 */
async function getTransactionHistory(address, network = 'mainnet', limit = 10) {
    try {
        if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
            const baseUrl = network === 'testnet' 
                ? 'https://blockstream.info/testnet/api' 
                : 'https://blockstream.info/api';
            
            const transactions = await fetch(`${baseUrl}/address/${address}/txs`);
            
            return transactions.slice(0, limit).map(tx => ({
                txid: tx.txid,
                time: tx.status.block_time,
                confirmations: tx.status.confirmed ? tx.status.block_height : 0,
                value: calculateTxValue(tx, address),
                fee: tx.fee
            }));
        } else {
            // Return empty array for non-Bitcoin addresses
            return [];
        }
    } catch (error) {
        console.error('Transaction history error:', error);
        return [];
    }
}

/**
 * Calculate transaction value for an address
 */
function calculateTxValue(tx, address) {
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

module.exports = {
    getAddressBalance,
    getTransactionHistory
};