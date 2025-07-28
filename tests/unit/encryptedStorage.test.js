/**
 * Unit tests for Encrypted Storage
 * Tests client-side encryption and secure persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Web Crypto API
const mockCrypto = {
    getRandomValues: (array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    },
    subtle: {
        importKey: vi.fn().mockResolvedValue('mockKey'),
        deriveKey: vi.fn().mockResolvedValue('mockDerivedKey'),
        encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
    }
};

// Mock window
global.window = {
    crypto: mockCrypto
};

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
    clear: vi.fn(() => { localStorageMock.store = {}; })
};

global.localStorage = localStorageMock;

// Import after mocking
import { EncryptedStorage } from '../../public/js/modules/core/encrypted-storage.js';
import { SecureStatePersistence } from '../../public/js/modules/core/secure-state-persistence.js';

describe('EncryptedStorage', () => {
    let encryptedStorage;

    beforeEach(() => {
        encryptedStorage = new EncryptedStorage();
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should check Web Crypto API support', () => {
            expect(encryptedStorage.isSupported()).toBe(true);
        });

        it('should use correct encryption parameters', () => {
            expect(encryptedStorage.algorithm).toBe('AES-GCM');
            expect(encryptedStorage.keyDerivationAlgorithm).toBe('PBKDF2');
            expect(encryptedStorage.iterations).toBe(100000);
            expect(encryptedStorage.saltLength).toBe(16);
        });
    });

    describe('Key Derivation', () => {
        it('should derive key from password', async () => {
            const password = 'testPassword123!';
            const salt = new Uint8Array(16);
            
            await encryptedStorage.deriveKey(password, salt);
            
            expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
                'raw',
                expect.any(Uint8Array),
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                }),
                'mockKey',
                expect.objectContaining({
                    name: 'AES-GCM',
                    length: 256
                }),
                false,
                ['encrypt', 'decrypt']
            );
        });
    });

    describe('Encryption', () => {
        it('should encrypt data with password', async () => {
            const data = { 
                accounts: ['wallet1', 'wallet2'],
                settings: { theme: 'dark' }
            };
            const password = 'securePassword123!';
            
            // Mock TextEncoder
            const encoder = { encode: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])) };
            global.TextEncoder = vi.fn(() => encoder);
            
            const encrypted = await encryptedStorage.encrypt(data, password);
            
            expect(encrypted).toHaveProperty('encrypted');
            expect(encrypted).toHaveProperty('timestamp');
            expect(encrypted).toHaveProperty('version');
            expect(encrypted.version).toBe('1.0');
            expect(typeof encrypted.encrypted).toBe('string');
        });

        it('should generate random salt and IV', async () => {
            const data = { test: 'data' };
            const password = 'password';
            
            const getRandomValuesSpy = vi.spyOn(mockCrypto, 'getRandomValues');
            
            await encryptedStorage.encrypt(data, password);
            
            // Should call getRandomValues for salt (16 bytes) and IV (12 bytes)
            expect(getRandomValuesSpy).toHaveBeenCalledTimes(2);
            expect(getRandomValuesSpy).toHaveBeenCalledWith(expect.any(Uint8Array));
        });
    });

    describe('Decryption', () => {
        it('should decrypt data with correct password', async () => {
            const originalData = { test: 'data' };
            const password = 'correctPassword';
            
            // Mock successful decryption
            const decoder = { decode: vi.fn().mockReturnValue(JSON.stringify(originalData)) };
            global.TextDecoder = vi.fn(() => decoder);
            
            const encryptedData = {
                encrypted: btoa('mockencrypteddata'),
                timestamp: Date.now(),
                version: '1.0'
            };
            
            const decrypted = await encryptedStorage.decrypt(encryptedData, password);
            
            expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
            expect(decrypted).toEqual(originalData);
        });

        it('should fail with incorrect password', async () => {
            const encryptedData = {
                encrypted: btoa('mockencrypteddata'),
                timestamp: Date.now(),
                version: '1.0'
            };
            
            mockCrypto.subtle.decrypt.mockRejectedValueOnce(new Error('Decryption failed'));
            
            await expect(
                encryptedStorage.decrypt(encryptedData, 'wrongPassword')
            ).rejects.toThrow('Failed to decrypt data');
        });
    });

    describe('Storage Operations', () => {
        it('should save encrypted data to localStorage', async () => {
            const data = { accounts: ['wallet1'] };
            const password = 'password123';
            
            await encryptedStorage.save(data, password);
            
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'moosh_encrypted_vault',
                expect.any(String)
            );
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'moosh_vault_metadata',
                expect.any(String)
            );
        });

        it('should load encrypted data from localStorage', async () => {
            const originalData = { accounts: ['wallet1'] };
            const password = 'password123';
            
            // Mock stored data
            localStorageMock.store['moosh_encrypted_vault'] = JSON.stringify({
                encrypted: btoa('encrypted'),
                timestamp: Date.now(),
                version: '1.0'
            });
            
            // Mock successful decryption
            const decoder = { decode: vi.fn().mockReturnValue(JSON.stringify(originalData)) };
            global.TextDecoder = vi.fn(() => decoder);
            
            const loaded = await encryptedStorage.load(password);
            
            expect(localStorage.getItem).toHaveBeenCalledWith('moosh_encrypted_vault');
            expect(loaded).toEqual(originalData);
        });

        it('should check if encrypted data exists', () => {
            // No data
            expect(encryptedStorage.hasEncryptedData()).toBe(false);
            
            // With metadata
            localStorageMock.store['moosh_vault_metadata'] = JSON.stringify({
                hasData: true,
                lastSaved: Date.now()
            });
            
            expect(encryptedStorage.hasEncryptedData()).toBe(true);
        });

        it('should clear all encrypted data', () => {
            encryptedStorage.clear();
            
            expect(localStorage.removeItem).toHaveBeenCalledWith('moosh_encrypted_vault');
            expect(localStorage.removeItem).toHaveBeenCalledWith('moosh_vault_metadata');
        });
    });

    describe('Password Management', () => {
        it('should change password for encrypted data', async () => {
            const oldPassword = 'oldPassword123';
            const newPassword = 'newPassword456';
            const data = { accounts: ['wallet1'] };
            
            // Mock successful load with old password
            const decoder = { decode: vi.fn().mockReturnValue(JSON.stringify(data)) };
            global.TextDecoder = vi.fn(() => decoder);
            
            // Store encrypted data
            localStorageMock.store['moosh_encrypted_vault'] = JSON.stringify({
                encrypted: btoa('encrypted'),
                timestamp: Date.now(),
                version: '1.0'
            });
            
            const result = await encryptedStorage.changePassword(oldPassword, newPassword);
            
            expect(result).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        it('should generate secure random password', () => {
            const password1 = encryptedStorage.generateSecurePassword(32);
            const password2 = encryptedStorage.generateSecurePassword(32);
            
            expect(password1).toHaveLength(32);
            expect(password2).toHaveLength(32);
            expect(password1).not.toBe(password2);
            
            // Check password contains various character types
            expect(/[A-Z]/.test(password1)).toBe(true); // Uppercase
            expect(/[a-z]/.test(password1)).toBe(true); // Lowercase
            expect(/[0-9]/.test(password1)).toBe(true); // Numbers
        });
    });

    describe('Backup and Restore', () => {
        it('should export encrypted backup', () => {
            localStorageMock.store['moosh_encrypted_vault'] = JSON.stringify({
                encrypted: 'encryptedData'
            });
            localStorageMock.store['moosh_vault_metadata'] = JSON.stringify({
                hasData: true
            });
            
            const backup = encryptedStorage.exportBackup();
            
            expect(backup).toHaveProperty('data');
            expect(backup).toHaveProperty('metadata');
            expect(backup).toHaveProperty('exportedAt');
            expect(backup.version).toBe('1.0');
        });

        it('should import encrypted backup', () => {
            const backup = {
                data: JSON.stringify({ encrypted: 'backupData' }),
                metadata: JSON.stringify({ hasData: true }),
                exportedAt: Date.now(),
                version: '1.0'
            };
            
            const result = encryptedStorage.importBackup(backup);
            
            expect(result).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'moosh_encrypted_vault',
                backup.data
            );
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'moosh_vault_metadata',
                backup.metadata
            );
        });
    });
});

describe('SecureStatePersistence', () => {
    let persistence;
    let mockStateManager;

    beforeEach(() => {
        mockStateManager = {
            getState: vi.fn().mockReturnValue({
                accounts: ['wallet1'],
                currentPage: 'dashboard',
                theme: 'dark',
                privateKeys: 'should-not-persist'
            }),
            set: vi.fn()
        };

        persistence = new SecureStatePersistence(mockStateManager);
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('Data Segregation', () => {
        it('should separate data by security level', async () => {
            const password = 'testPassword';
            await persistence.saveSecureState(password);
            
            // Check that public data was saved separately
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'moosh_public_state',
                expect.stringContaining('currentPage')
            );
            
            // Check that encrypted vault was created
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'moosh_encrypted_vault',
                expect.any(String)
            );
        });

        it('should never persist blacklisted keys', async () => {
            const password = 'testPassword';
            await persistence.saveSecureState(password);
            
            // Get all calls to localStorage.setItem
            const calls = localStorage.setItem.mock.calls;
            
            // Check that privateKeys was not saved anywhere
            calls.forEach(call => {
                const [key, value] = call;
                expect(value).not.toContain('should-not-persist');
            });
        });
    });

    describe('Auto-save', () => {
        it('should start auto-save on initialization', async () => {
            const password = 'testPassword';
            await persistence.initialize(password);
            
            expect(persistence.autoSaveInterval).toBeDefined();
            persistence.stopAutoSave(); // Clean up
        });

        it('should respect minimum time between saves', async () => {
            const password = 'testPassword';
            await persistence.initialize(password);
            
            // First save
            await persistence.autoSave();
            const firstCallCount = localStorage.setItem.mock.calls.length;
            
            // Immediate second save should be skipped
            await persistence.autoSave();
            const secondCallCount = localStorage.setItem.mock.calls.length;
            
            expect(secondCallCount).toBe(firstCallCount);
            
            persistence.stopAutoSave(); // Clean up
        });
    });

    describe('Lock/Unlock', () => {
        it('should lock wallet and clear session', () => {
            persistence.sessionKey = 'testKey';
            persistence.lock();
            
            expect(persistence.sessionKey).toBeNull();
            expect(persistence.isLocked()).toBe(true);
        });

        it('should unlock wallet with correct password', async () => {
            const password = 'correctPassword';
            
            // Mock successful decryption
            const decoder = { decode: vi.fn().mockReturnValue('{}') };
            global.TextDecoder = vi.fn(() => decoder);
            
            const unlocked = await persistence.unlock(password);
            
            expect(unlocked).toBe(true);
            expect(persistence.isLocked()).toBe(false);
        });
    });
});