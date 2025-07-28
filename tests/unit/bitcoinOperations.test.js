/**
 * Unit tests for Bitcoin Operations
 * Tests address validation, transaction building, and Bitcoin-specific functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock app context
global.app = {
    apiService: {
        request: vi.fn(),
        getBitcoinBalance: vi.fn(),
        getBitcoinPrice: vi.fn()
    },
    state: {
        get: vi.fn(),
        set: vi.fn()
    },
    showNotification: vi.fn()
};

// Mock window
global.window = {
    app: global.app
};

describe('Bitcoin Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Address Validation', () => {
        it('should validate mainnet addresses', () => {
            const validMainnetAddresses = [
                { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', type: 'legacy' },
                { address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', type: 'p2sh' },
                { address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', type: 'segwit' },
                { address: 'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr', type: 'taproot' }
            ];

            validMainnetAddresses.forEach(({ address, type }) => {
                const isValid = validateBitcoinAddress(address, true);
                expect(isValid).toBe(true);
            });
        });

        it('should validate testnet addresses', () => {
            const validTestnetAddresses = [
                { address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', type: 'legacy' },
                { address: '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc', type: 'p2sh' },
                { address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', type: 'segwit' },
                { address: 'tb1pqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesrxh6hy', type: 'taproot' }
            ];

            validTestnetAddresses.forEach(({ address, type }) => {
                const isValid = validateBitcoinAddress(address, false);
                expect(isValid).toBe(true);
            });
        });

        it('should reject invalid addresses', () => {
            const invalidAddresses = [
                '1234567890', // Too short
                '1' + 'a'.repeat(40), // Too long
                'bc2qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', // Wrong prefix
                '0x742d35Cc6634C0532925a3b844Bc9e7595f87E3', // Ethereum address
                '', // Empty
                'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // URI format
                'BC1QAR0SRRR7XFKVY5L643LYDNW9RE59GTZZWF5MDQ', // Uppercase (Bech32 must be lowercase)
            ];

            invalidAddresses.forEach(address => {
                const isValid = validateBitcoinAddress(address, true);
                expect(isValid).toBe(false);
            });
        });

        // Helper function for tests
        function validateBitcoinAddress(address, isMainnet) {
            if (!address || typeof address !== 'string') return false;
            
            const patterns = isMainnet ? [
                /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // P2PKH
                /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // P2SH
                /^bc1[a-z0-9]{39,59}$/,            // Bech32
                /^bc1p[a-z0-9]{58}$/               // Taproot
            ] : [
                /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Testnet P2PKH/P2SH
                /^tb1[a-z0-9]{39,59}$/,               // Testnet Bech32
                /^tb1p[a-z0-9]{58}$/                  // Testnet Taproot
            ];
            
            return patterns.some(pattern => pattern.test(address));
        }
    });

    describe('Balance Operations', () => {
        it('should fetch Bitcoin balance', async () => {
            const mockBalance = {
                balance: 100000000, // 1 BTC in satoshis
                txCount: 5,
                unconfirmedBalance: 0
            };

            app.apiService.getBitcoinBalance.mockResolvedValueOnce(mockBalance);

            const balance = await app.apiService.getBitcoinBalance('bc1qtest...');

            expect(balance.balance).toBe(100000000);
            expect(balance.txCount).toBe(5);
            expect(app.apiService.getBitcoinBalance).toHaveBeenCalledWith('bc1qtest...');
        });

        it('should convert satoshis to BTC', () => {
            const testCases = [
                { sats: 100000000, btc: 1 },
                { sats: 50000000, btc: 0.5 },
                { sats: 1, btc: 0.00000001 },
                { sats: 123456789, btc: 1.23456789 },
                { sats: 0, btc: 0 }
            ];

            testCases.forEach(({ sats, btc }) => {
                const converted = satsToBTC(sats);
                expect(converted).toBeCloseTo(btc, 8);
            });
        });

        it('should convert BTC to satoshis', () => {
            const testCases = [
                { btc: 1, sats: 100000000 },
                { btc: 0.5, sats: 50000000 },
                { btc: 0.00000001, sats: 1 },
                { btc: 1.23456789, sats: 123456789 },
                { btc: 0, sats: 0 }
            ];

            testCases.forEach(({ btc, sats }) => {
                const converted = btcToSats(btc);
                expect(converted).toBe(sats);
            });
        });

        // Helper functions
        function satsToBTC(sats) {
            return sats / 100000000;
        }

        function btcToSats(btc) {
            return Math.round(btc * 100000000);
        }
    });

    describe('Transaction Building', () => {
        it('should build simple transaction', async () => {
            const txRequest = {
                from: 'bc1qfrom...',
                to: 'bc1qto...',
                amount: 50000, // satoshis
                fee: 1000 // satoshis
            };

            const mockTx = {
                hex: '0200000001...',
                txid: 'abc123...',
                size: 250,
                vsize: 141,
                fee: 1000
            };

            app.apiService.request.mockResolvedValueOnce(mockTx);

            const tx = await app.apiService.request('/api/bitcoin/build-tx', {
                method: 'POST',
                body: JSON.stringify(txRequest)
            });

            expect(tx.hex).toBeDefined();
            expect(tx.txid).toBeDefined();
            expect(tx.fee).toBe(1000);
        });

        it('should validate transaction amounts', () => {
            const testCases = [
                { amount: 0, valid: false }, // Zero amount
                { amount: -1000, valid: false }, // Negative
                { amount: 2100000000000001, valid: false }, // More than max supply
                { amount: 1000, valid: true }, // Valid amount
                { amount: 100000000, valid: true }, // 1 BTC
            ];

            testCases.forEach(({ amount, valid }) => {
                const isValid = validateTransactionAmount(amount);
                expect(isValid).toBe(valid);
            });
        });

        it('should calculate transaction fee', async () => {
            const mockFeeRates = {
                fastestFee: 10, // sat/vB
                halfHourFee: 8,
                hourFee: 5,
                economyFee: 2,
                minimumFee: 1
            };

            app.apiService.request.mockResolvedValueOnce(mockFeeRates);

            const feeRates = await app.apiService.request('/api/bitcoin/fee-estimates');

            // Calculate fee for 200 vByte transaction
            const txVSize = 200;
            const fastFee = feeRates.fastestFee * txVSize;
            const normalFee = feeRates.hourFee * txVSize;
            const slowFee = feeRates.economyFee * txVSize;

            expect(fastFee).toBe(2000); // 10 * 200
            expect(normalFee).toBe(1000); // 5 * 200
            expect(slowFee).toBe(400); // 2 * 200
        });

        it('should handle UTXO selection', async () => {
            const utxos = [
                { txid: 'tx1', vout: 0, value: 100000 },
                { txid: 'tx2', vout: 1, value: 50000 },
                { txid: 'tx3', vout: 0, value: 75000 }
            ];

            const targetAmount = 120000;
            const selectedUTXOs = selectUTXOs(utxos, targetAmount);

            const totalSelected = selectedUTXOs.reduce((sum, utxo) => sum + utxo.value, 0);
            expect(totalSelected).toBeGreaterThanOrEqual(targetAmount);
            expect(selectedUTXOs.length).toBeGreaterThan(0);
        });

        // Helper functions
        function validateTransactionAmount(amount) {
            return amount > 0 && amount <= 2100000000000000 && Number.isInteger(amount);
        }

        function selectUTXOs(utxos, targetAmount) {
            // Simple greedy algorithm for tests
            const sorted = [...utxos].sort((a, b) => b.value - a.value);
            const selected = [];
            let total = 0;

            for (const utxo of sorted) {
                if (total >= targetAmount) break;
                selected.push(utxo);
                total += utxo.value;
            }

            return selected;
        }
    });

    describe('Price Operations', () => {
        it('should fetch Bitcoin price', async () => {
            const mockPrice = {
                usd: 65000,
                usd_24h_change: 2.5,
                usd_market_cap: 1270000000000,
                last_updated_at: Date.now() / 1000
            };

            app.apiService.getBitcoinPrice.mockResolvedValueOnce(mockPrice);

            const price = await app.apiService.getBitcoinPrice();

            expect(price.usd).toBe(65000);
            expect(price.usd_24h_change).toBe(2.5);
        });

        it('should calculate USD value', () => {
            const btcAmount = 0.5;
            const btcPrice = 65000;
            const usdValue = btcAmount * btcPrice;

            expect(usdValue).toBe(32500);
        });

        it('should format currency values', () => {
            const testCases = [
                { value: 65000, expected: '$65,000.00' },
                { value: 1234.56, expected: '$1,234.56' },
                { value: 0.99, expected: '$0.99' },
                { value: 1000000, expected: '$1,000,000.00' }
            ];

            testCases.forEach(({ value, expected }) => {
                const formatted = formatUSD(value);
                expect(formatted).toBe(expected);
            });
        });

        function formatUSD(value) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(value);
        }
    });

    describe('Transaction History', () => {
        it('should fetch transaction history', async () => {
            const mockHistory = [
                {
                    txid: 'tx1',
                    time: Date.now() / 1000,
                    confirmations: 6,
                    value: 100000,
                    type: 'receive'
                },
                {
                    txid: 'tx2',
                    time: Date.now() / 1000 - 3600,
                    confirmations: 1,
                    value: -50000,
                    type: 'send'
                }
            ];

            app.apiService.request.mockResolvedValueOnce(mockHistory);

            const history = await app.apiService.request('/api/bitcoin/transactions/bc1qtest...');

            expect(history).toHaveLength(2);
            expect(history[0].confirmations).toBeGreaterThanOrEqual(6);
            expect(history[1].type).toBe('send');
        });

        it('should parse transaction types', () => {
            const transactions = [
                { value: 100000, expectedType: 'receive' },
                { value: -50000, expectedType: 'send' },
                { value: 0, expectedType: 'self' } // Self-transfer or fee-only
            ];

            transactions.forEach(({ value, expectedType }) => {
                const type = value > 0 ? 'receive' : value < 0 ? 'send' : 'self';
                expect(type).toBe(expectedType);
            });
        });
    });

    describe('PSBT Operations', () => {
        it('should create PSBT for signing', async () => {
            const psbtRequest = {
                inputs: [
                    { txid: 'abc123', vout: 0, value: 100000 }
                ],
                outputs: [
                    { address: 'bc1qto...', value: 90000 }
                ]
            };

            const mockPSBT = {
                base64: 'cHNidP8BAH...',
                hex: '70736274ff0100...'
            };

            app.apiService.request.mockResolvedValueOnce(mockPSBT);

            const psbt = await app.apiService.request('/api/bitcoin/create-psbt', {
                method: 'POST',
                body: JSON.stringify(psbtRequest)
            });

            expect(psbt.base64).toBeDefined();
            expect(psbt.hex).toBeDefined();
        });
    });

    describe('Network Detection', () => {
        it('should detect network from address', () => {
            const testCases = [
                { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', network: 'mainnet' },
                { address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', network: 'mainnet' },
                { address: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', network: 'testnet' },
                { address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', network: 'testnet' }
            ];

            testCases.forEach(({ address, network }) => {
                const detected = detectNetwork(address);
                expect(detected).toBe(network);
            });
        });

        function detectNetwork(address) {
            if (address.match(/^[13]/) || address.match(/^bc1/)) {
                return 'mainnet';
            } else if (address.match(/^[mn2]/) || address.match(/^tb1/)) {
                return 'testnet';
            }
            return 'unknown';
        }
    });
});