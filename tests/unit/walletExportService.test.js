/**
 * Wallet Export Service Test Suite
 * MAJOR DELTA-4-1 - Quality Defenders Division
 * Testing encryption, formats, and edge cases for wallet export functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import crypto from 'crypto';
import { WalletExportService } from '../../src/server/services/walletExportService.js';

describe('WalletExportService', () => {
    let exportService;
    let mockWalletData;

    beforeEach(() => {
        exportService = new WalletExportService();
        
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
            type: 'standard',
            // Server-side metadata that should be removed
            lastAccessed: '2024-01-02T00:00:00.000Z',
            sessionId: 'session-123',
            apiKeys: { test: 'key' }
        };
    });

    describe('constructor', () => {
        it('should initialize with correct encryption configuration', () => {
            expect(exportService.PBKDF2_ITERATIONS).toBe(100000);
            expect(exportService.SALT_LENGTH).toBe(32);
            expect(exportService.IV_LENGTH).toBe(16);
            expect(exportService.TAG_LENGTH).toBe(16);
            expect(exportService.KEY_LENGTH).toBe(32);
        });

        it('should initialize with correct format options', () => {
            expect(exportService.FORMATS).toEqual({
                JSON: 'json',
                QR: 'qr',
                PAPER: 'paper'
            });
        });
    });

    describe('exportWallet', () => {
        it('should successfully export wallet with valid data and password', async () => {
            const password = 'testPassword123456';
            const result = await exportService.exportWallet(mockWalletData, password, 'json');

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.metadata).toMatchObject({
                format: 'json',
                version: '1.0',
                walletId: mockWalletData.walletId
            });
            expect(result.metadata.exportedAt).toBeDefined();
        });

        it('should reject invalid wallet data', async () => {
            const invalidData = { invalid: 'data' };
            const password = 'testPassword123456';

            await expect(exportService.exportWallet(invalidData, password))
                .rejects.toThrow('Invalid wallet data');
        });

        it('should reject short passwords', async () => {
            const shortPassword = 'short';

            await expect(exportService.exportWallet(mockWalletData, shortPassword))
                .rejects.toThrow('Password must be at least 12 characters');
        });

        it('should reject invalid export formats', async () => {
            const password = 'testPassword123456';

            await expect(exportService.exportWallet(mockWalletData, password, 'invalid'))
                .rejects.toThrow('Invalid format');
        });

        it('should handle null wallet data', async () => {
            const password = 'testPassword123456';

            await expect(exportService.exportWallet(null, password))
                .rejects.toThrow('Invalid wallet data');
        });

        it('should handle empty password', async () => {
            await expect(exportService.exportWallet(mockWalletData, ''))
                .rejects.toThrow('Password must be at least 12 characters');
        });
    });

    describe('exportMultiple', () => {
        let walletsData;

        beforeEach(() => {
            walletsData = {
                'wallet-1': { ...mockWalletData, walletId: 'wallet-1' },
                'wallet-2': { ...mockWalletData, walletId: 'wallet-2' },
                'wallet-3': { ...mockWalletData, walletId: 'wallet-3' }
            };
        });

        it('should export multiple wallets successfully', async () => {
            const walletIds = ['wallet-1', 'wallet-2', 'wallet-3'];
            const password = 'testPassword123456';

            const result = await exportService.exportMultiple(walletIds, walletsData, password);

            expect(result.success).toBe(true);
            expect(result.data.bundle).toBeDefined();
            expect(result.data.summary.exported).toBe(3);
            expect(result.data.summary.failed).toBe(0);
        });

        it('should handle progress callback', async () => {
            const walletIds = ['wallet-1', 'wallet-2'];
            const password = 'testPassword123456';
            const progressUpdates = [];

            const progressCallback = (progress) => {
                progressUpdates.push(progress);
            };

            await exportService.exportMultiple(walletIds, walletsData, password, progressCallback);

            expect(progressUpdates.length).toBeGreaterThan(0);
            expect(progressUpdates[progressUpdates.length - 1]).toMatchObject({
                current: 2,
                total: 2,
                percentage: 100
            });
        });

        it('should handle missing wallets gracefully', async () => {
            const walletIds = ['wallet-1', 'missing-wallet', 'wallet-3'];
            const password = 'testPassword123456';

            const result = await exportService.exportMultiple(walletIds, walletsData, password);

            expect(result.success).toBe(true);
            expect(result.data.summary.exported).toBe(2);
            expect(result.data.summary.failed).toBe(1);
            expect(result.data.summary.errors).toHaveLength(1);
        });

        it('should process large batches efficiently', async () => {
            // Create 50 wallets
            const largeWalletsData = {};
            const largeWalletIds = [];
            for (let i = 0; i < 50; i++) {
                const id = `wallet-${i}`;
                largeWalletIds.push(id);
                largeWalletsData[id] = { ...mockWalletData, walletId: id };
            }

            const password = 'testPassword123456';
            const startTime = Date.now();

            const result = await exportService.exportMultiple(largeWalletIds, largeWalletsData, password);

            const duration = Date.now() - startTime;
            expect(result.success).toBe(true);
            expect(result.data.summary.exported).toBe(50);
            // Should complete in reasonable time (less than 10 seconds)
            expect(duration).toBeLessThan(10000);
        });

        it('should reject empty wallet list', async () => {
            const password = 'testPassword123456';

            await expect(exportService.exportMultiple([], walletsData, password))
                .rejects.toThrow('No wallets specified for export');
        });

        it('should reject invalid wallet IDs array', async () => {
            const password = 'testPassword123456';

            await expect(exportService.exportMultiple('not-an-array', walletsData, password))
                .rejects.toThrow('No wallets specified for export');
        });
    });

    describe('prepareWalletData', () => {
        it('should remove sensitive server-side metadata', () => {
            const prepared = exportService.prepareWalletData(mockWalletData);

            expect(prepared.walletId).toBe(mockWalletData.walletId);
            expect(prepared.name).toBe(mockWalletData.name);
            expect(prepared.mnemonic).toBe(mockWalletData.mnemonic);
            expect(prepared.lastAccessed).toBeUndefined();
            expect(prepared.sessionId).toBeUndefined();
            expect(prepared.apiKeys).toBeUndefined();
        });

        it('should preserve essential wallet data', () => {
            const prepared = exportService.prepareWalletData(mockWalletData);

            expect(prepared).toMatchObject({
                walletId: mockWalletData.walletId,
                name: mockWalletData.name,
                mnemonic: mockWalletData.mnemonic,
                network: mockWalletData.network,
                addresses: mockWalletData.addresses,
                privateKeys: mockWalletData.privateKeys,
                createdAt: mockWalletData.createdAt,
                type: mockWalletData.type
            });
        });

        it('should add default values for missing fields', () => {
            const minimalData = {
                walletId: 'test',
                mnemonic: 'test mnemonic',
                addresses: {},
                privateKeys: {}
            };

            const prepared = exportService.prepareWalletData(minimalData);

            expect(prepared.network).toBe('MAINNET');
            expect(prepared.type).toBe('standard');
        });
    });

    describe('encryptWalletData', () => {
        it('should encrypt data successfully', async () => {
            const data = { test: 'data' };
            const password = 'testPassword123456';

            const encrypted = await exportService.encryptWalletData(data, password);

            expect(encrypted.version).toBe('1.0');
            expect(encrypted.algorithm).toBe('AES-256-GCM');
            expect(encrypted.keyDerivation).toBeDefined();
            expect(encrypted.encryption).toBeDefined();
            expect(encrypted.metadata.encrypted).toBe(true);
        });

        it('should generate unique salt and IV for each encryption', async () => {
            const data = { test: 'data' };
            const password = 'testPassword123456';

            const encrypted1 = await exportService.encryptWalletData(data, password);
            const encrypted2 = await exportService.encryptWalletData(data, password);

            expect(encrypted1.keyDerivation.salt).not.toBe(encrypted2.keyDerivation.salt);
            expect(encrypted1.encryption.iv).not.toBe(encrypted2.encryption.iv);
        });

        it('should handle string data', async () => {
            const data = 'test string data';
            const password = 'testPassword123456';

            const encrypted = await exportService.encryptWalletData(data, password);

            expect(encrypted).toBeDefined();
            expect(encrypted.encryption.data).toBeDefined();
        });

        it('should produce valid base64 encoded outputs', async () => {
            const data = { test: 'data' };
            const password = 'testPassword123456';

            const encrypted = await exportService.encryptWalletData(data, password);

            // Test base64 validity
            expect(() => Buffer.from(encrypted.keyDerivation.salt, 'base64')).not.toThrow();
            expect(() => Buffer.from(encrypted.encryption.iv, 'base64')).not.toThrow();
            expect(() => Buffer.from(encrypted.encryption.authTag, 'base64')).not.toThrow();
            expect(() => Buffer.from(encrypted.encryption.data, 'base64')).not.toThrow();
        });
    });

    describe('formatOutput', () => {
        let encryptedBundle;

        beforeEach(() => {
            encryptedBundle = {
                version: '1.0',
                algorithm: 'AES-256-GCM',
                keyDerivation: { salt: 'test' },
                encryption: { data: 'test' }
            };
        });

        it('should format JSON output correctly', async () => {
            const output = await exportService.formatOutput(encryptedBundle, 'json');

            expect(output.format).toBe('json');
            expect(output.content).toEqual(encryptedBundle);
            expect(output.filename).toMatch(/moosh-wallet-export-\d+\.json/);
        });

        it('should format QR output with chunks', async () => {
            const output = await exportService.formatOutput(encryptedBundle, 'qr');

            expect(output.format).toBe('qr');
            expect(output.content).toBeInstanceOf(Array);
            expect(output.totalChunks).toBe(output.content.length);
            expect(output.filename).toMatch(/moosh-wallet-export-\d+-qr\.json/);
        });

        it('should format paper output with HTML', async () => {
            const output = await exportService.formatOutput(encryptedBundle, 'paper');

            expect(output.format).toBe('paper');
            expect(output.content.encrypted).toEqual(encryptedBundle);
            expect(output.content.printable).toContain('<!DOCTYPE html>');
            expect(output.content.printable).toContain('MOOSH Wallet Paper Backup');
            expect(output.filename).toMatch(/moosh-wallet-export-\d+-paper\.html/);
        });

        it('should reject unsupported formats', async () => {
            await expect(exportService.formatOutput(encryptedBundle, 'unsupported'))
                .rejects.toThrow('Unsupported format: unsupported');
        });
    });

    describe('createQRChunks', () => {
        it('should create chunks for large data', () => {
            const largeData = 'x'.repeat(5000); // 5000 characters
            const chunks = exportService.createQRChunks(largeData);

            expect(chunks.length).toBe(3); // Should be 3 chunks at 2000 chars max
            expect(chunks[0].index).toBe(1);
            expect(chunks[0].total).toBe(3);
            expect(chunks[0].data.length).toBeLessThanOrEqual(2000);
        });

        it('should handle small data in single chunk', () => {
            const smallData = 'small data';
            const chunks = exportService.createQRChunks(smallData);

            expect(chunks.length).toBe(1);
            expect(chunks[0].data).toBe(smallData);
            expect(chunks[0].index).toBe(1);
            expect(chunks[0].total).toBe(1);
        });

        it('should add checksums to each chunk', () => {
            const data = 'test data for chunks';
            const chunks = exportService.createQRChunks(data);

            chunks.forEach(chunk => {
                expect(chunk.checksum).toBeDefined();
                expect(chunk.checksum).toHaveLength(8);
            });
        });

        it('should handle exact chunk boundary', () => {
            const exactData = 'x'.repeat(2000); // Exactly one chunk
            const chunks = exportService.createQRChunks(exactData);

            expect(chunks.length).toBe(1);
            expect(chunks[0].data).toBe(exactData);
        });
    });

    describe('createPrintableVersion', () => {
        it('should create valid HTML document', () => {
            const bundle = { test: 'data' };
            const html = exportService.createPrintableVersion(bundle);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html>');
            expect(html).toContain('</html>');
            expect(html).toContain('MOOSH Wallet Paper Backup');
        });

        it('should include formatted JSON data', () => {
            const bundle = { test: 'data', nested: { value: 123 } };
            const html = exportService.createPrintableVersion(bundle);

            expect(html).toContain(JSON.stringify(bundle, null, 2));
        });

        it('should include checksum', () => {
            const bundle = { test: 'data' };
            const html = exportService.createPrintableVersion(bundle);

            expect(html).toMatch(/Checksum: [a-f0-9]{8}/);
        });

        it('should include print button and styles', () => {
            const bundle = { test: 'data' };
            const html = exportService.createPrintableVersion(bundle);

            expect(html).toContain('window.print()');
            expect(html).toContain('@media print');
            expect(html).toContain('.no-print { display: none; }');
        });

        it('should include security warning', () => {
            const bundle = { test: 'data' };
            const html = exportService.createPrintableVersion(bundle);

            expect(html).toContain('WARNING');
            expect(html).toContain('encrypted backup');
            expect(html).toContain('secure location');
        });
    });

    describe('calculateChecksum', () => {
        it('should generate consistent checksum for same data', () => {
            const data = 'test data';
            const checksum1 = exportService.calculateChecksum(data);
            const checksum2 = exportService.calculateChecksum(data);

            expect(checksum1).toBe(checksum2);
        });

        it('should generate different checksums for different data', () => {
            const checksum1 = exportService.calculateChecksum('data1');
            const checksum2 = exportService.calculateChecksum('data2');

            expect(checksum1).not.toBe(checksum2);
        });

        it('should return 8-character hex string', () => {
            const checksum = exportService.calculateChecksum('test');

            expect(checksum).toMatch(/^[a-f0-9]{8}$/);
        });

        it('should handle empty string', () => {
            const checksum = exportService.calculateChecksum('');

            expect(checksum).toBeDefined();
            expect(checksum).toHaveLength(8);
        });

        it('should handle unicode data', () => {
            const checksum = exportService.calculateChecksum('🚀 Unicode test 测试');

            expect(checksum).toBeDefined();
            expect(checksum).toHaveLength(8);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle circular references in wallet data', async () => {
            const circularData = { ...mockWalletData };
            circularData.circular = circularData;

            const password = 'testPassword123456';

            await expect(exportService.exportWallet(circularData, password))
                .rejects.toThrow();
        });

        it('should handle very long passwords', async () => {
            const longPassword = 'x'.repeat(1000);
            const result = await exportService.exportWallet(mockWalletData, longPassword);

            expect(result.success).toBe(true);
        });

        it('should handle special characters in wallet names', async () => {
            const specialWallet = {
                ...mockWalletData,
                name: 'Test <Wallet> & "Special" \'Chars\' 中文'
            };

            const password = 'testPassword123456';
            const result = await exportService.exportWallet(specialWallet, password);

            expect(result.success).toBe(true);
        });

        it('should handle concurrent exports', async () => {
            const password = 'testPassword123456';
            const promises = [];

            // Start 10 concurrent exports
            for (let i = 0; i < 10; i++) {
                const wallet = { ...mockWalletData, walletId: `concurrent-${i}` };
                promises.push(exportService.exportWallet(wallet, password));
            }

            const results = await Promise.all(promises);
            
            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Memory and Performance', () => {
        it('should not leak memory on repeated exports', async () => {
            const password = 'testPassword123456';
            const initialMemory = process.memoryUsage().heapUsed;

            // Perform multiple exports
            for (let i = 0; i < 100; i++) {
                await exportService.exportWallet(mockWalletData, password);
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be minimal (less than 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });
    });
});