/**
 * Spark Compatible Service
 * Transforms wallet data to match the MOOSH Wallet UI expectations
 */

import { generateMnemonic, generateBitcoinWallet, generateSparkAddress, importWallet } from './walletService.js';
import fetch from 'node-fetch';

/**
 * Generate wallet in Spark-compatible format
 * @param {number} strength - 128 for 12 words, 256 for 24 words
 * @returns {object} Wallet data formatted for UI
 */
async function generateSparkCompatibleWallet(strength = 256) {
    // Generate mnemonic
    const mnemonic = generateMnemonic(strength);
    
    // Generate wallets
    const bitcoinWallet = await generateBitcoinWallet(mnemonic, 'MAINNET');
    const sparkWallet = await generateSparkAddress(mnemonic);
    
    // Format response to match UI expectations
    return {
        success: true,
        data: {
            mnemonic: mnemonic, // UI expects string, not array
            addresses: {
                bitcoin: bitcoinWallet.addresses.segwit.address, // Primary Bitcoin address
                spark: sparkWallet.address
            },
            privateKeys: {
                bitcoin: {
                    wif: bitcoinWallet.addresses.segwit.wif || bitcoinWallet.addresses.segwit.privateKey,
                    hex: bitcoinWallet.addresses.segwit.privateKey
                },
                spark: {
                    hex: sparkWallet.privateKey
                }
            },
            // Additional data the UI might use
            bitcoinAddresses: {
                segwit: bitcoinWallet.addresses.segwit.address,
                taproot: bitcoinWallet.addresses.taproot.address,
                legacy: bitcoinWallet.addresses.legacy.address,
                nestedSegwit: bitcoinWallet.addresses.nestedSegwit?.address || ''
            },
            allPrivateKeys: {
                segwit: {
                    wif: bitcoinWallet.addresses.segwit.wif || bitcoinWallet.addresses.segwit.privateKey,
                    hex: bitcoinWallet.addresses.segwit.privateKey
                },
                taproot: {
                    wif: bitcoinWallet.addresses.taproot.wif || bitcoinWallet.addresses.taproot.privateKey,
                    hex: bitcoinWallet.addresses.taproot.privateKey
                },
                legacy: {
                    wif: bitcoinWallet.addresses.legacy.wif || bitcoinWallet.addresses.legacy.privateKey,
                    hex: bitcoinWallet.addresses.legacy.privateKey
                },
                nestedSegwit: {
                    wif: bitcoinWallet.addresses.nestedSegwit?.wif || bitcoinWallet.addresses.nestedSegwit?.privateKey || '',
                    hex: bitcoinWallet.addresses.nestedSegwit?.privateKey || ''
                },
                spark: {
                    hex: sparkWallet.privateKey
                }
            },
            xpub: bitcoinWallet.xpub || '',
            xpriv: bitcoinWallet.xpriv || '',
            sparkPath: sparkWallet.path,
            wordCount: strength === 256 ? 24 : 12
        }
    };
}

/**
 * Import wallet in Spark-compatible format
 * @param {string} mnemonic - Seed phrase
 * @returns {object} Wallet data formatted for UI
 */
async function importSparkCompatibleWallet(mnemonic) {
    const wallet = await importWallet(mnemonic, 'MAINNET');
    
    // Transform to UI format
    return {
        success: true,
        data: {
            mnemonic: mnemonic,
            addresses: {
                bitcoin: wallet.bitcoin.addresses.segwit.address,
                spark: wallet.spark.address
            },
            privateKeys: {
                bitcoin: {
                    wif: wallet.bitcoin.addresses.segwit.wif || wallet.bitcoin.addresses.segwit.privateKey,
                    hex: wallet.bitcoin.addresses.segwit.privateKey
                },
                spark: {
                    hex: wallet.spark.privateKey
                }
            },
            bitcoinAddresses: {
                segwit: wallet.bitcoin.addresses.segwit.address,
                taproot: wallet.bitcoin.addresses.taproot.address,
                legacy: wallet.bitcoin.addresses.legacy.address,
                nestedSegwit: wallet.bitcoin.addresses.nestedSegwit?.address || ''
            },
            allPrivateKeys: {
                segwit: {
                    wif: wallet.bitcoin.addresses.segwit.wif || wallet.bitcoin.addresses.segwit.privateKey,
                    hex: wallet.bitcoin.addresses.segwit.privateKey
                },
                taproot: {
                    wif: wallet.bitcoin.addresses.taproot.wif || wallet.bitcoin.addresses.taproot.privateKey,
                    hex: wallet.bitcoin.addresses.taproot.privateKey
                },
                legacy: {
                    wif: wallet.bitcoin.addresses.legacy.wif || wallet.bitcoin.addresses.legacy.privateKey,
                    hex: wallet.bitcoin.addresses.legacy.privateKey
                },
                nestedSegwit: {
                    wif: wallet.bitcoin.addresses.nestedSegwit?.wif || wallet.bitcoin.addresses.nestedSegwit?.privateKey || '',
                    hex: wallet.bitcoin.addresses.nestedSegwit?.privateKey || ''
                },
                spark: {
                    hex: wallet.spark.privateKey
                }
            },
            xpub: wallet.bitcoin.xpub || '',
            wordCount: mnemonic.trim().split(/\s+/).length
        }
    };
}

/**
 * Get real balance from blockchain
 * @param {string} address - Bitcoin or Spark address
 * @returns {object} Balance data
 */
async function getBalance(address) {
    try {
        // For Spark addresses, return mock data for now
        if (address.startsWith('sp1')) {
            return {
                success: true,
                data: {
                    address,
                    balance: '0.00000000',
                    unconfirmed: '0.00000000',
                    total: '0.00000000',
                    currency: 'SPARK'
                }
            };
        }
        
        // For Bitcoin addresses, fetch real balance from blockchain
        // Try multiple APIs for reliability
        let balanceData = null;
        
        // Try mempool.space first
        try {
            const response = await fetch(`https://mempool.space/api/address/${address}`, {
                timeout: 5000
            });
            if (response.ok) {
                const data = await response.json();
                const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
                const unconfirmed = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
                balanceData = {
                    balance: balance,
                    unconfirmed: unconfirmed,
                    txCount: data.chain_stats.tx_count
                };
            }
        } catch (e) {
            console.log('Mempool.space failed, trying blockstream...');
        }
        
        // Try blockstream.info as fallback
        if (!balanceData) {
            try {
                const response = await fetch(`https://blockstream.info/api/address/${address}`, {
                    timeout: 5000
                });
                if (response.ok) {
                    const data = await response.json();
                    const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
                    const unconfirmed = data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum;
                    balanceData = {
                        balance: balance,
                        unconfirmed: unconfirmed,
                        txCount: data.chain_stats.tx_count
                    };
                }
            } catch (e) {
                console.log('Blockstream failed, trying blockchain.info...');
            }
        }
        
        // Try blockchain.info as last resort
        if (!balanceData) {
            try {
                const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`, {
                    timeout: 5000
                });
                if (response.ok) {
                    const balance = parseInt(await response.text());
                    balanceData = {
                        balance: balance,
                        unconfirmed: 0,
                        txCount: 0
                    };
                }
            } catch (e) {
                throw new Error('All balance APIs failed');
            }
        }
        
        if (!balanceData) {
            throw new Error('Unable to fetch balance from any API');
        }
        
        // Convert satoshis to BTC
        const btcBalance = (balanceData.balance / 100000000).toFixed(8);
        const btcUnconfirmed = (balanceData.unconfirmed / 100000000).toFixed(8);
        const btcTotal = ((balanceData.balance + balanceData.unconfirmed) / 100000000).toFixed(8);
        
        return {
            success: true,
            data: {
                address,
                balance: btcBalance,
                unconfirmed: btcUnconfirmed,
                total: btcTotal,
                currency: 'BTC',
                txCount: balanceData.txCount
            }
        };
    } catch (error) {
        console.error('Failed to fetch balance:', error);
        return {
            success: true,
            data: {
                address,
                balance: '0.00000000',
                unconfirmed: '0.00000000',
                total: '0.00000000',
                currency: address.startsWith('sp1') ? 'SPARK' : 'BTC',
                error: error.message
            }
        };
    }
}

/**
 * Get mock transactions (for now)
 * @param {string} address - Bitcoin or Spark address
 * @returns {object} Transaction list
 */
function getTransactions(address) {
    // Mock transactions for UI testing
    return {
        success: true,
        data: {
            address,
            transactions: [],
            count: 0
        }
    };
}

export {
    generateSparkCompatibleWallet,
    importSparkCompatibleWallet,
    getBalance,
    getTransactions
};