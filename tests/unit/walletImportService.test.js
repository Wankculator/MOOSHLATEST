/**
 * Wallet Import Service Test Suite
 * MAJOR DELTA-4-1 - Quality Defenders Division
 * Testing decryption, validation, and edge cases for wallet import functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import crypto from 'crypto';
import { WalletImportService } from '../../src/server/services/walletImportService.js';
import { WalletExportService } from '../../src/server/services/walletExportService.js';
import * as bip39 from 'bip39';

// Mock bip39
jest.mock('bip39', () => ({
    validateMnemonic: jest.fn()
}));

describe('WalletImportService', () => {
    let importService;
    let exportService;
    let mockWalletData;
    let mockEncryptedData;

    beforeEach(async () => {
        importService = new WalletImportService();
        exportService = new WalletExportService();
        
        // Reset mocks
        bip39.validateMnemonic.mockReturnValue(true);

        // Mock wallet data
        mockWalletData = {
            walletId: 'test-wallet-123',
            name: 'Test Wallet',
            mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            network: 'MAINNET',
            addresses: {
                bitcoin: 'bc1qtest123456789',
                spark: 'spark1test123456789'
            },
            privateKeys: {
                bitcoin: { wif: 'L1test...', hex: '0x123...' },
                spark: { hex: '0x456...' }
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            type: 'standard'
        };

        // Create encrypted data for testing
        const password = 'testPassword123456';
        const exportResult = await exportService.exportWallet(mockWalletData, password, 'json');
        mockEncryptedData = exportResult.data.content;
    });

    describe('constructor', () => {
        it('should initialize with correct configuration', () => {
            expect(importService.SUPPORTED_FORMATS).toEqual(['json', 'qr', 'paper']);
            expect(importService.SUPPORTED_VERSIONS).toEqual(['1.0']);
            expect(importService.KEY_LENGTH).toBe(32);
        });
    });

    describe('importWallet', () => {
        it('should successfully import encrypted wallet with correct password', async () => {
            const password = 'testPassword123456';
            const result = await importService.importWallet(mockEncryptedData, password);

            expect(result.success).toBe(true);
            expect(result.data.walletId).toBe(mockWalletData.walletId);
            expect(result.data.name).toBe(mockWalletData.name);
            expect(result.data.mnemonic).toBe(mockWalletData.mnemonic);
            expect(result.metadata.importedAt).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const wrongPassword = 'wrongPassword123456';

            await expect(importService.importWallet(mockEncryptedData, wrongPassword))
                .rejects.toThrow('Failed to decrypt wallet data. Please check your password.');
        });

        it('should handle string input', async () => {
            const password = 'testPassword123456';
            const stringData = JSON.stringify(mockEncryptedData);

            const result = await importService.importWallet(stringData, password);

            expect(result.success).toBe(true);
            expect(result.data.walletId).toBe(mockWalletData.walletId);
        });

        it('should reject null encrypted data', async () => {
            const password = 'testPassword123456';

            await expect(importService.importWallet(null, password))
                .rejects.toThrow('No encrypted data provided');
        });

        it('should reject short passwords', async () => {
            await expect(importService.importWallet(mockEncryptedData, 'short'))
                .rejects.toThrow('Invalid password');
        });

        it('should reject empty password', async () => {
            await expect(importService.importWallet(mockEncryptedData, ''))
                .rejects.toThrow('Invalid password');
        });

        it('should include duplicate check information', async () => {
            const password = 'testPassword123456';
            const result = await importService.importWallet(mockEncryptedData, password);

            expect(result.metadata.isDuplicate).toBeDefined();
            expect(result.metadata.duplicateInfo).toBeDefined();
        });
    });

    describe('importBatch', () => {
        let batchEncryptedData;

        beforeEach(async () => {
            // Create a batch export for testing
            const walletsData = {
                'wallet-1': { ...mockWalletData, walletId: 'wallet-1' },
                'wallet-2': { ...mockWalletData, walletId: 'wallet-2' },
                'wallet-3': { ...mockWalletData, walletId: 'wallet-3' }
            };

            const password = 'testPassword123456';
            const batchResult = await exportService.exportMultiple(
                ['wallet-1', 'wallet-2', 'wallet-3'],
                walletsData,
                password
            );

            batchEncryptedData = batchResult.data;
        });

        it('should import multiple wallets from batch', async () => {
            const password = 'testPassword123456';
            const result = await importService.importBatch(batchEncryptedData, password);

            expect(result.success).toBe(true);
            expect(result.summary.imported).toBe(3);
            expect(result.summary.failed).toBe(0);
            expect(result.results).toHaveLength(3);
        });

        it('should handle progress callback', async () => {
            const password = 'testPassword123456';
            const progressUpdates = [];

            const progressCallback = (progress) => {
                progressUpdates.push(progress);
            };

            await importService.importBatch(batchEncryptedData, password, progressCallback);

            expect(progressUpdates.length).toBeGreaterThan(0);
            expect(progressUpdates[progressUpdates.length - 1]).toMatchObject({
                current: 3,
                total: 3,
                percentage: 100
            });
        });

        it('should handle partial failures gracefully', async () => {
            // Corrupt one wallet in the batch
            const password = 'testPassword123456';
            const decrypted = await importService.decryptWalletData(batchEncryptedData.bundle, password);
            const batchInfo = JSON.parse(decrypted);
            
            // Make one wallet invalid
            batchInfo.wallets[1] = { invalid: 'data' };
            
            // Re-encrypt
            const corruptedBundle = await exportService.encryptWalletData(
                JSON.stringify(batchInfo),
                password
            );

            const result = await importService.importBatch(
                { bundle: corruptedBundle },
                password
            );

            expect(result.success).toBe(true);
            expect(result.summary.imported).toBe(2);
            expect(result.summary.failed).toBe(1);
            expect(result.errors).toHaveLength(1);
        });

        it('should reject invalid batch format', async () => {
            const password = 'testPassword123456';
            const invalidBundle = await exportService.encryptWalletData(
                JSON.stringify({ invalid: 'format' }),
                password
            );

            await expect(importService.importBatch({ bundle: invalidBundle }, password))
                .rejects.toThrow('Invalid batch format');
        });
    });

    describe('validateImportData', () => {
        it('should validate correct wallet data', async () => {
            const validated = await importService.validateImportData(mockWalletData);

            expect(validated.walletId).toBe(mockWalletData.walletId);
            expect(validated.mnemonic).toBe(mockWalletData.mnemonic);
            expect(validated.type).toBe('imported');
            expect(validated.importedAt).toBeDefined();
        });

        it('should handle mnemonic as array', async () => {
            const dataWithArrayMnemonic = {
                ...mockWalletData,
                mnemonic: mockWalletData.mnemonic.split(' ')
            };

            const validated = await importService.validateImportData(dataWithArrayMnemonic);

            expect(validated.mnemonic).toBe(mockWalletData.mnemonic);
        });

        it('should reject missing required fields', async () => {
            const invalidData = { walletId: 'test' };

            await expect(importService.validateImportData(invalidData))
                .rejects.toThrow('Missing required field: mnemonic');
        });

        it('should reject invalid mnemonic', async () => {
            bip39.validateMnemonic.mockReturnValue(false);
            
            await expect(importService.validateImportData(mockWalletData))
                .rejects.toThrow('Invalid mnemonic phrase');
        });

        it('should reject wallet without addresses', async () => {
            const noAddresses = { ...mockWalletData, addresses: {} };

            await expect(importService.validateImportData(noAddresses))
                .rejects.toThrow('No valid addresses found in wallet data');
        });

        it('should add default values for optional fields', async () => {
            const minimalData = {
                walletId: 'test',
                mnemonic: mockWalletData.mnemonic,
                addresses: { bitcoin: 'test' }
            };

            const validated = await importService.validateImportData(minimalData);

            expect(validated.name).toMatch(/Imported Wallet \d+/);
            expect(validated.network).toBe('MAINNET');
            expect(validated.type).toBe('imported');
            expect(validated.createdAt).toBeDefined();
        });

        it('should handle string input', async () => {
            const stringData = JSON.stringify(mockWalletData);
            const validated = await importService.validateImportData(stringData);

            expect(validated.walletId).toBe(mockWalletData.walletId);
        });
    });

    describe('validateEncryptedBundle', () => {
        it('should validate correct bundle structure', () => {
            expect(() => importService.validateEncryptedBundle(mockEncryptedData))
                .not.toThrow();
        });

        it('should reject unsupported version', () => {
            const invalidBundle = { ...mockEncryptedData, version: '2.0' };

            expect(() => importService.validateEncryptedBundle(invalidBundle))
                .toThrow('Unsupported version: 2.0');
        });

        it('should reject unsupported algorithm', () => {
            const invalidBundle = { ...mockEncryptedData, algorithm: 'AES-128-CBC' };

            expect(() => importService.validateEncryptedBundle(invalidBundle))
                .toThrow('Unsupported algorithm: AES-128-CBC');
        });

        it('should reject missing required fields', () => {
            const invalidBundle = { version: '1.0', algorithm: 'AES-256-GCM' };

            expect(() => importService.validateEncryptedBundle(invalidBundle))
                .toThrow('Missing encryption field: keyDerivation');
        });

        it('should reject invalid key derivation parameters', () => {
            const invalidBundle = {
                ...mockEncryptedData,
                keyDerivation: { method: 'scrypt' } // Missing salt
            };

            expect(() => importService.validateEncryptedBundle(invalidBundle))
                .toThrow('Invalid key derivation parameters');
        });

        it('should reject invalid encryption parameters', () => {
            const invalidBundle = {
                ...mockEncryptedData,
                encryption: { data: 'test' } // Missing iv and authTag
            };

            expect(() => importService.validateEncryptedBundle(invalidBundle))
                .toThrow('Invalid encryption parameters');
        });
    });

    describe('decryptWalletData', () => {
        it('should decrypt data with correct password', async () => {
            const password = 'testPassword123456';
            const decrypted = await importService.decryptWalletData(mockEncryptedData, password);
            const data = JSON.parse(decrypted);

            expect(data.walletId).toBe(mockWalletData.walletId);
            expect(data.mnemonic).toBe(mockWalletData.mnemonic);
        });

        it('should fail with incorrect password', async () => {
            const wrongPassword = 'wrongPassword123456';

            await expect(importService.decryptWalletData(mockEncryptedData, wrongPassword))
                .rejects.toThrow('Failed to decrypt wallet data. Please check your password.');
        });

        it('should handle corrupted data', async () => {
            const corruptedBundle = {
                ...mockEncryptedData,
                encryption: {
                    ...mockEncryptedData.encryption,
                    data: 'corrupted-base64-data!!!'
                }
            };

            const password = 'testPassword123456';

            await expect(importService.decryptWalletData(corruptedBundle, password))
                .rejects.toThrow('Failed to decrypt wallet data. Please check your password.');
        });

        it('should handle modified auth tag', async () => {
            const modifiedBundle = {
                ...mockEncryptedData,
                encryption: {
                    ...mockEncryptedData.encryption,
                    authTag: Buffer.from('modified').toString('base64')
                }
            };

            const password = 'testPassword123456';

            await expect(importService.decryptWalletData(modifiedBundle, password))
                .rejects.toThrow('Failed to decrypt wallet data. Please check your password.');
        });
    });

    describe('processQRChunks', () => {
        let qrChunks;

        beforeEach(async () => {
            // Create QR chunks for testing
            const largeData = JSON.stringify(mockEncryptedData);
            qrChunks = exportService.createQRChunks(largeData);
        });

        it('should reassemble QR chunks correctly', async () => {
            const result = await importService.processQRChunks(qrChunks);

            expect(result).toEqual(mockEncryptedData);
        });

        it('should handle single chunk', async () => {
            const singleChunk = [{
                index: 1,
                total: 1,
                data: JSON.stringify({ test: 'data' }),
                checksum: 'abc123'
            }];

            const result = await importService.processQRChunks(singleChunk);

            expect(result).toEqual({ test: 'data' });
        });

        it('should reject missing chunks', async () => {
            const missingChunk = qrChunks.filter(chunk => chunk.index !== 2);

            await expect(importService.processQRChunks(missingChunk))
                .rejects.toThrow(/Missing QR chunks/);
        });

        it('should reject out-of-order chunks', async () => {
            const outOfOrder = [...qrChunks];
            outOfOrder[0] = { ...outOfOrder[0], index: 3 };

            await expect(importService.processQRChunks(outOfOrder))
                .rejects.toThrow('Missing chunk 1');
        });

        it('should handle chunks in random order', async () => {
            const randomOrder = [...qrChunks].sort(() => Math.random() - 0.5);
            const result = await importService.processQRChunks(randomOrder);

            expect(result).toEqual(mockEncryptedData);
        });
    });

    describe('extractFromPaperWallet', () => {
        let paperHTML;

        beforeEach(() => {
            const printable = exportService.createPrintableVersion(mockEncryptedData);
            paperHTML = printable;
        });

        it('should extract data from paper wallet HTML', () => {
            const extracted = importService.extractFromPaperWallet(paperHTML);

            expect(extracted).toEqual(mockEncryptedData);
        });

        it('should handle malformed HTML', () => {
            const malformedHTML = '<html><body>No data here</body></html>';

            expect(() => importService.extractFromPaperWallet(malformedHTML))
                .toThrow('Could not find wallet data in paper backup');
        });

        it('should handle HTML with extra whitespace', () => {
            const htmlWithWhitespace = paperHTML.replace(
                '<div class="data">',
                '<div class="data">   \n\n   '
            );

            const extracted = importService.extractFromPaperWallet(htmlWithWhitespace);

            expect(extracted).toEqual(mockEncryptedData);
        });
    });

    describe('checkForDuplicates', () => {
        it('should check for duplicate wallets', async () => {
            const result = await importService.checkForDuplicates(mockWalletData);

            expect(result.isDuplicate).toBeDefined();
            expect(result.info).toBeDefined();
        });

        // Note: In production, this would check against actual database
        it('should currently return no duplicates', async () => {
            const result = await importService.checkForDuplicates(mockWalletData);

            expect(result.isDuplicate).toBe(false);
            expect(result.info).toBe(null);
        });
    });

    describe('preValidateImport', () => {
        it('should validate encrypted file', async () => {
            const result = await importService.preValidateImport(mockEncryptedData);

            expect(result.isValid).toBe(true);
            expect(result.format).toBe('encrypted');
            expect(result.version).toBe('1.0');
            expect(result.encrypted).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect unencrypted data', async () => {
            const unencryptedData = { wallet: 'data' };
            const result = await importService.preValidateImport(unencryptedData);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('File does not appear to be encrypted');
        });

        it('should detect invalid bundle structure', async () => {
            const invalidBundle = {
                version: '1.0',
                algorithm: 'AES-256-GCM'
                // Missing encryption fields
            };

            const result = await importService.preValidateImport(invalidBundle);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should handle parse errors gracefully', async () => {
            const result = await importService.preValidateImport('not-json');

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases and Security', () => {
        it('should handle very large wallets', async () => {
            const largeWallet = {
                ...mockWalletData,
                extraData: 'x'.repeat(1000000) // 1MB of data
            };

            const password = 'testPassword123456';
            const exported = await exportService.exportWallet(largeWallet, password);
            const imported = await importService.importWallet(exported.data.content, password);

            expect(imported.success).toBe(true);
            expect(imported.data.extraData).toBe(largeWallet.extraData);
        });

        it('should handle special characters in passwords', async () => {
            const specialPassword = 'Test!@#$%^&*()_+{}[]|\\:";\'<>?,./`~Password123';
            
            const exported = await exportService.exportWallet(mockWalletData, specialPassword);
            const imported = await importService.importWallet(exported.data.content, specialPassword);

            expect(imported.success).toBe(true);
            expect(imported.data.walletId).toBe(mockWalletData.walletId);
        });

        it('should handle unicode in wallet data', async () => {
            const unicodeWallet = {
                ...mockWalletData,
                name: '🚀 Wallet 中文 नाम 🔒'
            };

            const password = 'testPassword123456';
            const exported = await exportService.exportWallet(unicodeWallet, password);
            const imported = await importService.importWallet(exported.data.content, password);

            expect(imported.success).toBe(true);
            expect(imported.data.name).toBe(unicodeWallet.name);
        });

        it('should prevent timing attacks on password verification', async () => {
            const password = 'testPassword123456';
            const wrongPassword = 'wrongPassword123456';

            const timings = [];

            // Measure multiple attempts
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                try {
                    await importService.importWallet(mockEncryptedData, wrongPassword);
                } catch (e) {
                    // Expected to fail
                }
                timings.push(Date.now() - start);
            }

            // Check that timings are consistent (within 100ms variance)
            const avgTime = timings.reduce((a, b) => a + b) / timings.length;
            const maxVariance = Math.max(...timings.map(t => Math.abs(t - avgTime)));

            expect(maxVariance).toBeLessThan(100);
        });
    });

    describe('Memory and Performance', () => {
        it('should handle concurrent imports efficiently', async () => {
            const password = 'testPassword123456';
            const promises = [];

            // Create 10 different encrypted wallets
            for (let i = 0; i < 10; i++) {
                const wallet = { ...mockWalletData, walletId: `concurrent-${i}` };
                const exported = await exportService.exportWallet(wallet, password);
                promises.push(importService.importWallet(exported.data.content, password));
            }

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            results.forEach((result, index) => {
                expect(result.success).toBe(true);
                expect(result.data.walletId).toBe(`concurrent-${index}`);
            });
        });

        it('should not leak sensitive data in errors', async () => {
            const sensitiveWallet = {
                ...mockWalletData,
                mnemonic: 'super secret mnemonic phrase',
                privateKeys: {
                    bitcoin: { wif: 'SECRET_PRIVATE_KEY' }
                }
            };

            const password = 'testPassword123456';
            const exported = await exportService.exportWallet(sensitiveWallet, password);

            try {
                await importService.importWallet(exported.data.content, 'wrongPassword');
            } catch (error) {
                // Error message should not contain sensitive data
                expect(error.message).not.toContain('super secret');
                expect(error.message).not.toContain('SECRET_PRIVATE_KEY');
                expect(error.message).not.toContain(sensitiveWallet.mnemonic);
            }
        });
    });
});