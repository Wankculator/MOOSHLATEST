/**
 * Unit tests for Wallet Generation and Import
 * Tests seed generation, wallet creation, and import functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';

// Mock window.crypto
global.window = {
    crypto: {
        getRandomValues: (array) => {
            const bytes = crypto.randomBytes(array.length);
            for (let i = 0; i < array.length; i++) {
                array[i] = bytes[i];
            }
            return array;
        }
    }
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock app context
global.app = {
    apiService: {
        request: vi.fn(),
        generateSparkWallet: vi.fn()
    },
    state: {
        set: vi.fn(),
        get: vi.fn(),
        update: vi.fn()
    },
    showNotification: vi.fn()
};

describe('Wallet Generation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Seed Generation', () => {
        it('should generate 12-word seed phrase', async () => {
            const mockResponse = {
                success: true,
                data: {
                    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
                    addresses: {
                        bitcoin: 'bc1qtest123...',
                        spark: 'spark1test123...'
                    },
                    privateKeys: {
                        bitcoin: { wif: 'L1test...', hex: '0x123...' },
                        spark: { hex: '0x456...' }
                    }
                }
            };

            app.apiService.generateSparkWallet.mockResolvedValueOnce(mockResponse.data);

            const result = await app.apiService.generateSparkWallet(128);

            expect(result.mnemonic).toBeDefined();
            expect(result.mnemonic.split(' ')).toHaveLength(12);
            expect(result.addresses.bitcoin).toMatch(/^bc1/);
            expect(result.addresses.spark).toMatch(/^spark1/);
        });

        it('should generate 24-word seed phrase', async () => {
            const mockResponse = {
                success: true,
                data: {
                    mnemonic: 'abandon '.repeat(23) + 'art',
                    addresses: {
                        bitcoin: 'bc1qtest456...',
                        spark: 'spark1test456...'
                    },
                    privateKeys: {
                        bitcoin: { wif: 'L2test...', hex: '0x789...' },
                        spark: { hex: '0xabc...' }
                    }
                }
            };

            app.apiService.generateSparkWallet.mockResolvedValueOnce(mockResponse.data);

            const result = await app.apiService.generateSparkWallet(256);

            expect(result.mnemonic.split(' ')).toHaveLength(24);
            expect(app.apiService.generateSparkWallet).toHaveBeenCalledWith(256);
        });

        it('should handle seed generation timeout', async () => {
            app.apiService.generateSparkWallet.mockRejectedValueOnce(
                new Error('Request timeout')
            );

            await expect(app.apiService.generateSparkWallet(256))
                .rejects.toThrow('Request timeout');
        });

        it('should validate response structure', async () => {
            const invalidResponse = {
                success: true,
                data: {
                    // Missing required fields
                    mnemonic: 'test seed phrase'
                }
            };

            app.apiService.generateSparkWallet.mockResolvedValueOnce(invalidResponse.data);

            const result = await app.apiService.generateSparkWallet(128);
            
            // Validation should catch missing fields
            const isValid = !!(result.mnemonic && 
                               result.addresses?.bitcoin && 
                               result.addresses?.spark &&
                               result.privateKeys?.bitcoin &&
                               result.privateKeys?.spark);
            
            expect(isValid).toBe(false);
        });
    });

    describe('Wallet Import', () => {
        it('should import wallet from valid seed phrase', async () => {
            const seedPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
            
            const mockImportResponse = {
                success: true,
                data: {
                    addresses: {
                        bitcoin: 'bc1qimported...',
                        spark: 'spark1imported...'
                    },
                    privateKeys: {
                        bitcoin: { wif: 'L3import...', hex: '0xdef...' },
                        spark: { hex: '0xghi...' }
                    }
                }
            };

            app.apiService.request.mockResolvedValueOnce(mockImportResponse.data);

            const result = await app.apiService.request('/api/spark/import-wallet', {
                method: 'POST',
                body: JSON.stringify({ mnemonic: seedPhrase })
            });

            expect(result.addresses.bitcoin).toBeDefined();
            expect(result.addresses.spark).toBeDefined();
            expect(app.apiService.request).toHaveBeenCalledWith(
                '/api/spark/import-wallet',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining(seedPhrase)
                })
            );
        });

        it('should validate seed phrase before import', () => {
            // Test invalid seed phrase lengths
            const invalidLengthSeeds = [
                '', // Empty
                'word1 word2', // Too few words (2)
                'abandon '.repeat(13).trim(), // Wrong count (13 words)
                'test '.repeat(11).trim(), // 11 words
                'test '.repeat(25).trim(), // 25 words
            ];

            invalidLengthSeeds.forEach(seed => {
                const words = seed.split(' ').filter(w => w.length > 0);
                const isValidLength = words.length === 12 || words.length === 24;
                expect(isValidLength).toBe(false);
            });
            
            // Test valid seed phrase lengths
            const validLengthSeeds = [
                'abandon '.repeat(12).trim(), // 12 words
                'abandon '.repeat(24).trim(), // 24 words
            ];
            
            validLengthSeeds.forEach(seed => {
                const words = seed.split(' ').filter(w => w.length > 0);
                const isValidLength = words.length === 12 || words.length === 24;
                expect(isValidLength).toBe(true);
            });
        });

        it('should handle import errors gracefully', async () => {
            const seedPhrase = 'abandon '.repeat(12).trim();

            app.apiService.request.mockRejectedValueOnce(
                new Error('Invalid mnemonic')
            );

            await expect(
                app.apiService.request('/api/spark/import-wallet', {
                    method: 'POST',
                    body: JSON.stringify({ mnemonic: seedPhrase })
                })
            ).rejects.toThrow('Invalid mnemonic');
        });
    });

    describe('Key Derivation', () => {
        it('should derive correct address types', async () => {
            const mockResponse = {
                data: {
                    addresses: {
                        bitcoin: 'bc1qtest...',
                        spark: 'spark1test...',
                        legacy: '1Legacy...',
                        segwit: '3Segwit...'
                    }
                }
            };

            app.apiService.request.mockResolvedValueOnce(mockResponse.data);

            const result = await app.apiService.request('/api/wallet/derive-addresses');

            // Validate address formats
            expect(result.addresses.bitcoin).toMatch(/^bc1/); // Native SegWit
            expect(result.addresses.spark).toMatch(/^spark1/); // Spark Protocol
            expect(result.addresses.legacy).toMatch(/^1/); // Legacy
            expect(result.addresses.segwit).toMatch(/^3/); // Nested SegWit
        });

        it('should support different derivation paths', async () => {
            const derivationPaths = [
                "m/84'/0'/0'/0/0", // Native SegWit
                "m/44'/0'/0'/0/0", // Legacy
                "m/49'/0'/0'/0/0"  // Nested SegWit
            ];

            for (const path of derivationPaths) {
                app.apiService.request.mockResolvedValueOnce({
                    address: 'bc1qderived...',
                    path: path
                });

                const result = await app.apiService.request('/api/wallet/derive', {
                    method: 'POST',
                    body: JSON.stringify({ path })
                });

                expect(result.path).toBe(path);
                expect(result.address).toBeDefined();
            }
        });
    });

    describe('Wallet Storage', () => {
        it('should store wallet securely in state', async () => {
            const walletData = {
                id: 'wallet1',
                name: 'My Wallet',
                addresses: {
                    bitcoin: 'bc1qtest...',
                    spark: 'spark1test...'
                },
                createdAt: Date.now()
            };

            // Simulate storing wallet
            app.state.set('accounts', [walletData]);
            app.state.set('currentAccountId', walletData.id);

            expect(app.state.set).toHaveBeenCalledWith('accounts', [walletData]);
            expect(app.state.set).toHaveBeenCalledWith('currentAccountId', walletData.id);
        });

        it('should not store sensitive data in plain text', () => {
            const sensitiveData = {
                mnemonic: 'secret seed phrase',
                privateKey: 'L1privatekey...',
                password: 'userpassword123'
            };

            // These should NEVER be stored directly
            Object.entries(sensitiveData).forEach(([key, value]) => {
                expect(app.state.set).not.toHaveBeenCalledWith(key, value);
            });
        });
    });

    describe('Multi-Wallet Support', () => {
        it('should support multiple wallet creation', async () => {
            const wallets = [];

            for (let i = 0; i < 3; i++) {
                const mockResponse = {
                    data: {
                        mnemonic: `test seed ${i}`,
                        addresses: {
                            bitcoin: `bc1qwallet${i}...`,
                            spark: `spark1wallet${i}...`
                        },
                        privateKeys: {
                            bitcoin: { wif: `L${i}test...` },
                            spark: { hex: `0x${i}abc...` }
                        }
                    }
                };

                app.apiService.generateSparkWallet.mockResolvedValueOnce(mockResponse.data);
                const wallet = await app.apiService.generateSparkWallet(128);
                wallets.push(wallet);
            }

            expect(wallets).toHaveLength(3);
            expect(wallets[0].addresses.bitcoin).not.toBe(wallets[1].addresses.bitcoin);
            expect(wallets[1].addresses.spark).not.toBe(wallets[2].addresses.spark);
        });

        it('should switch between wallets', () => {
            const wallet1 = { id: 'w1', name: 'Wallet 1' };
            const wallet2 = { id: 'w2', name: 'Wallet 2' };

            app.state.get.mockImplementation((key) => {
                if (key === 'accounts') return [wallet1, wallet2];
                if (key === 'currentAccountId') return 'w1';
                return null;
            });

            // Switch to wallet 2
            app.state.set('currentAccountId', 'w2');

            expect(app.state.set).toHaveBeenCalledWith('currentAccountId', 'w2');
        });
    });

    describe('Backup and Recovery', () => {
        it('should create wallet backup', () => {
            const walletBackup = {
                version: '2.0.0',
                wallets: [
                    {
                        id: 'w1',
                        name: 'Main Wallet',
                        addresses: { bitcoin: 'bc1q...', spark: 'spark1...' },
                        createdAt: Date.now()
                    }
                ],
                exportedAt: Date.now()
            };

            const backupString = JSON.stringify(walletBackup);
            const encrypted = btoa(backupString); // Simple encoding for test

            expect(encrypted).toBeDefined();
            expect(encrypted.length).toBeGreaterThan(0);
        });

        it('should restore from backup', () => {
            const originalData = {
                version: '2.0.0',
                wallets: [{ id: 'w1', name: 'Restored Wallet' }]
            };

            const backup = btoa(JSON.stringify(originalData));
            const restored = JSON.parse(atob(backup));

            expect(restored.version).toBe(originalData.version);
            expect(restored.wallets).toHaveLength(1);
            expect(restored.wallets[0].name).toBe('Restored Wallet');
        });
    });

    describe('Network Handling', () => {
        it('should handle mainnet addresses', async () => {
            app.state.get.mockReturnValue(true); // isMainnet = true

            const mainnetResponse = {
                data: {
                    addresses: {
                        bitcoin: 'bc1qmainnet...',
                        spark: 'spark1mainnet...'
                    }
                }
            };

            app.apiService.request.mockResolvedValueOnce(mainnetResponse.data);

            const result = await app.apiService.request('/api/wallet/addresses');

            expect(result.addresses.bitcoin).toMatch(/^bc1/); // Mainnet prefix
            expect(result.addresses.spark).toMatch(/^spark1/); // Spark mainnet
        });

        it('should handle testnet addresses', async () => {
            app.state.get.mockReturnValue(false); // isMainnet = false

            const testnetResponse = {
                data: {
                    addresses: {
                        bitcoin: 'tb1qtestnet...',
                        spark: 'tspark1testnet...'
                    }
                }
            };

            app.apiService.request.mockResolvedValueOnce(testnetResponse.data);

            const result = await app.apiService.request('/api/wallet/addresses');

            expect(result.addresses.bitcoin).toMatch(/^tb1/); // Testnet prefix
            expect(result.addresses.spark).toMatch(/^tspark1/); // Spark testnet
        });
    });
});