// MOOSH WALLET - Wallet Detector Module
// Multi-Wallet Type Detection System
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class WalletDetector {
        constructor(app) {
            this.app = app;
            this.knownPaths = {
                // Standard Bitcoin wallets
                'bitcoin-core': {
                    name: 'Bitcoin Core',
                    paths: ["m/0'/0'", "m/0'/1'"],
                    type: 'legacy'
                },
                'electrum': {
                    name: 'Electrum',
                    paths: ["m/0'", "m/1'", "m/44'/0'/0'", "m/49'/0'/0'", "m/84'/0'/0'"],
                    type: 'multi'
                },
                'xverse': {
                    name: 'Xverse',
                    paths: ["m/84'/0'/0'", "m/86'/0'/0'"],
                    type: 'segwit-taproot'
                },
                'ledger': {
                    name: 'Ledger',
                    paths: ["m/44'/0'/0'", "m/49'/0'/0'", "m/84'/0'/0'"],
                    type: 'multi'
                },
                'trezor': {
                    name: 'Trezor',
                    paths: ["m/44'/0'/0'", "m/49'/0'/0'", "m/84'/0'/0'", "m/86'/0'/0'"],
                    type: 'multi'
                },
                'exodus': {
                    name: 'Exodus',
                    paths: ["m/44'/0'/0'", "m/84'/0'/0'"],
                    type: 'legacy-segwit'
                },
                'trust-wallet': {
                    name: 'Trust Wallet',
                    paths: ["m/84'/0'/0'"],
                    type: 'segwit'
                },
                'metamask': {
                    name: 'MetaMask (Bitcoin)',
                    paths: ["m/44'/0'/0'"],
                    type: 'legacy'
                },
                'sparrow': {
                    name: 'Sparrow',
                    paths: ["m/84'/0'/0'", "m/86'/0'/0'", "m/44'/0'/0'", "m/49'/0'/0'"],
                    type: 'multi'
                },
                'bluewallet': {
                    name: 'BlueWallet',
                    paths: ["m/84'/0'/0'", "m/44'/0'/0'", "m/49'/0'/0'"],
                    type: 'multi'
                }
            };
        }

        async detectWalletType(mnemonic, knownAddress = null) {
            console.log('[WalletDetector] Starting wallet detection...');
            
            const detectionResults = {
                detected: false,
                walletType: 'unknown',
                walletName: 'Unknown Wallet',
                activePaths: [],
                suggestedPath: null,
                balances: {},
                usedAddresses: []
            };

            try {
                // If we have a known address, try to match it first
                if (knownAddress) {
                    console.log('[WalletDetector] Checking known address:', knownAddress);
                    const matchResult = await this.matchKnownAddress(mnemonic, knownAddress);
                    if (matchResult.found) {
                        detectionResults.detected = true;
                        detectionResults.walletType = matchResult.walletType;
                        detectionResults.walletName = matchResult.walletName;
                        detectionResults.suggestedPath = matchResult.path;
                        detectionResults.activePaths.push(matchResult.path);
                    }
                }

                // Check all known wallet paths
                const pathChecks = [];
                for (const [walletId, wallet] of Object.entries(this.knownPaths)) {
                    for (const path of wallet.paths) {
                        pathChecks.push(this.checkPath(mnemonic, path, walletId, wallet.name));
                    }
                }

                // Execute all checks in parallel for performance
                const results = await Promise.all(pathChecks);
                
                // Process results
                for (const result of results) {
                    if (result.hasActivity) {
                        detectionResults.activePaths.push({
                            path: result.path,
                            walletId: result.walletId,
                            walletName: result.walletName,
                            balance: result.balance,
                            addresses: result.addresses
                        });
                        
                        if (result.balance > 0 && !detectionResults.detected) {
                            detectionResults.detected = true;
                            detectionResults.walletType = result.walletId;
                            detectionResults.walletName = result.walletName;
                            detectionResults.suggestedPath = result.path;
                        }
                        
                        detectionResults.balances[result.path] = result.balance;
                        detectionResults.usedAddresses.push(...result.addresses);
                    }
                }

                // If no activity found, suggest most common type
                if (!detectionResults.detected) {
                    detectionResults.walletType = 'moosh';
                    detectionResults.walletName = 'MOOSH Wallet (New)';
                    detectionResults.suggestedPath = "m/84'/0'/0'"; // Default to Native SegWit
                }

                console.log('[WalletDetector] Detection complete:', detectionResults);
                return detectionResults;

            } catch (error) {
                console.error('[WalletDetector] Detection error:', error);
                return detectionResults;
            }
        }

        async checkPath(mnemonic, path, walletId, walletName) {
            try {
                // Generate first 5 addresses for this path
                const addresses = await this.deriveAddressesForPath(mnemonic, path, 5);
                
                // Check each address for activity
                let totalBalance = 0;
                const activeAddresses = [];
                
                for (const addr of addresses) {
                    try {
                        const balance = await this.checkAddressActivity(addr.address);
                        if (balance > 0 || addr.address === this.app.state.get('knownImportAddress')) {
                            totalBalance += balance;
                            activeAddresses.push({
                                address: addr.address,
                                index: addr.index,
                                balance: balance
                            });
                        }
                    } catch (error) {
                        console.warn(`[WalletDetector] Failed to check address ${addr.address}:`, error);
                    }
                }
                
                return {
                    path,
                    walletId,
                    walletName,
                    hasActivity: activeAddresses.length > 0,
                    balance: totalBalance,
                    addresses: activeAddresses
                };
                
            } catch (error) {
                console.error(`[WalletDetector] Error checking path ${path}:`, error);
                return {
                    path,
                    walletId,
                    walletName,
                    hasActivity: false,
                    balance: 0,
                    addresses: []
                };
            }
        }

        async deriveAddressesForPath(mnemonic, path, count = 5) {
            const addresses = [];
            
            try {
                // Use the API to generate addresses for this specific path
                const response = await fetch(`${this.app.apiUrl}/api/wallet/test-paths`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        mnemonic,
                        customPath: path,
                        addressCount: count
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to derive addresses');
                }
                
                const data = await response.json();
                return data.addresses || [];
                
            } catch (error) {
                console.error('[WalletDetector] Failed to derive addresses:', error);
                return [];
            }
        }

        async checkAddressActivity(address) {
            try {
                // Use mempool.space API to check address
                const response = await fetch(`https://mempool.space/api/address/${address}`);
                if (!response.ok) return 0;
                
                const data = await response.json();
                return (data.chain_stats?.funded_txo_sum || 0) / 100000000; // Convert sats to BTC
                
            } catch (error) {
                // Fallback to our API
                try {
                    const response = await fetch(`${this.app.apiUrl}/api/balance/${address}`);
                    if (response.ok) {
                        const data = await response.json();
                        return data.balance || 0;
                    }
                } catch (fallbackError) {
                    console.warn('[WalletDetector] Address check failed:', address);
                }
                return 0;
            }
        }

        async matchKnownAddress(mnemonic, knownAddress) {
            // Check if the known address matches any standard derivation
            for (const [walletId, wallet] of Object.entries(this.knownPaths)) {
                for (const path of wallet.paths) {
                    const addresses = await this.deriveAddressesForPath(mnemonic, path, 10);
                    const match = addresses.find(addr => addr.address === knownAddress);
                    
                    if (match) {
                        return {
                            found: true,
                            walletType: walletId,
                            walletName: wallet.name,
                            path: path,
                            index: match.index
                        };
                    }
                }
            }
            
            return { found: false };
        }
    }

    // Make available globally and maintain compatibility
    window.WalletDetector = WalletDetector;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.WalletDetector = WalletDetector;
    }

})(window);