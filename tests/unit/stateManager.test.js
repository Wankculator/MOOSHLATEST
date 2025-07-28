/**
 * Unit tests for StateManager
 * Tests state management, persistence, and reactive updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

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
import { StateManager } from '../../public/js/modules/core/state-manager.js';

describe('StateManager', () => {
    let stateManager;

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        stateManager = new StateManager();
    });

    describe('Basic State Operations', () => {
        it('should initialize with default state', () => {
            expect(stateManager.get('isMainnet')).toBe(true);
            expect(stateManager.get('currentPage')).toBe('home');
            expect(stateManager.get('accounts')).toEqual([]);
        });

        it('should set and get values', () => {
            stateManager.set('testKey', 'testValue');
            expect(stateManager.get('testKey')).toBe('testValue');
        });

        it('should update multiple values', () => {
            stateManager.update({
                isMainnet: false,
                currentPage: 'dashboard'
            });
            
            expect(stateManager.get('isMainnet')).toBe(false);
            expect(stateManager.get('currentPage')).toBe('dashboard');
        });

        it('should remove values', () => {
            stateManager.set('tempKey', 'tempValue');
            expect(stateManager.get('tempKey')).toBe('tempValue');
            
            stateManager.remove('tempKey');
            expect(stateManager.get('tempKey')).toBeUndefined();
        });

        it('should return entire state', () => {
            const state = stateManager.getState();
            expect(state).toHaveProperty('isMainnet');
            expect(state).toHaveProperty('currentPage');
            expect(state).toHaveProperty('accounts');
        });
    });

    describe('Persistence', () => {
        it('should persist state to localStorage', async () => {
            stateManager.set('persistentKey', 'persistentValue');
            await stateManager.saveState();
            
            expect(localStorageMock.setItem).toHaveBeenCalled();
            const savedData = JSON.parse(localStorageMock.store.mooshWalletState);
            expect(savedData.persistentKey).toBe('persistentValue');
        });

        it('should load state from localStorage', async () => {
            const mockState = {
                isMainnet: false,
                currentPage: 'wallet-details'
            };
            
            localStorageMock.store.mooshWalletState = JSON.stringify(mockState);
            
            await stateManager.loadState();
            expect(stateManager.get('isMainnet')).toBe(false);
            expect(stateManager.get('currentPage')).toBe('wallet-details');
        });

        it('should not persist sensitive data', async () => {
            stateManager.set('walletPassword', 'secret123');
            stateManager.set('privateKeys', { btc: 'key123' });
            
            await stateManager.saveState();
            
            const savedData = JSON.parse(localStorageMock.store.mooshWalletState);
            expect(savedData.walletPassword).toBeUndefined();
            expect(savedData.privateKeys).toBeUndefined();
        });
    });

    describe('Reactive Updates', () => {
        it('should notify listeners on state change', (done) => {
            const listener = vi.fn((newValue, oldValue) => {
                expect(oldValue).toBe('home');
                expect(newValue).toBe('dashboard');
                done();
            });
            
            stateManager.subscribe('currentPage', listener);
            stateManager.set('currentPage', 'dashboard');
        });

        it('should support multiple listeners', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            
            stateManager.subscribe('testKey', listener1);
            stateManager.subscribe('testKey', listener2);
            
            stateManager.set('testKey', 'newValue');
            
            expect(listener1).toHaveBeenCalledWith('newValue', undefined);
            expect(listener2).toHaveBeenCalledWith('newValue', undefined);
        });

        it('should unsubscribe listeners', () => {
            const listener = vi.fn();
            
            const unsubscribe = stateManager.subscribe('testKey', listener);
            stateManager.set('testKey', 'value1');
            expect(listener).toHaveBeenCalledTimes(1);
            
            unsubscribe();
            stateManager.set('testKey', 'value2');
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('should not notify if value unchanged', () => {
            const listener = vi.fn();
            
            stateManager.set('testKey', 'sameValue');
            stateManager.subscribe('testKey', listener);
            stateManager.set('testKey', 'sameValue');
            
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('Account Management', () => {
        it('should add new account', () => {
            const account = {
                id: 'acc1',
                name: 'Test Account',
                address: 'bc1qtest...'
            };
            
            stateManager.addAccount(account);
            const accounts = stateManager.getAccounts();
            
            expect(accounts).toHaveLength(1);
            expect(accounts[0]).toEqual(account);
        });

        it('should update existing account', () => {
            const account = {
                id: 'acc1',
                name: 'Test Account',
                balance: 0
            };
            
            stateManager.addAccount(account);
            stateManager.updateAccount('acc1', { balance: 100000 });
            
            const updated = stateManager.getAccount('acc1');
            expect(updated.balance).toBe(100000);
            expect(updated.name).toBe('Test Account');
        });

        it('should remove account', () => {
            stateManager.addAccount({ id: 'acc1', name: 'Account 1' });
            stateManager.addAccount({ id: 'acc2', name: 'Account 2' });
            
            expect(stateManager.getAccounts()).toHaveLength(2);
            
            stateManager.removeAccount('acc1');
            expect(stateManager.getAccounts()).toHaveLength(1);
            expect(stateManager.getAccount('acc1')).toBeUndefined();
        });

        it('should set current account', () => {
            const account = { id: 'acc1', name: 'Test Account' };
            stateManager.addAccount(account);
            
            stateManager.setCurrentAccount('acc1');
            expect(stateManager.get('currentAccountId')).toBe('acc1');
            expect(stateManager.getCurrentAccount()).toEqual(account);
        });
    });

    describe('Wallet Detection', () => {
        it('should detect no wallet initially', () => {
            expect(stateManager.hasWallet()).toBe(false);
        });

        it('should detect wallet after adding account', () => {
            stateManager.addAccount({
                id: 'acc1',
                name: 'Test Account',
                address: 'bc1qtest...'
            });
            
            expect(stateManager.hasWallet()).toBe(true);
        });

        it('should check for legacy wallet data', async () => {
            localStorageMock.store.generatedSeed = JSON.stringify(['word1', 'word2']);
            
            await stateManager.migrateUnencryptedSeeds();
            expect(stateManager.hasWallet()).toBe(true);
        });
    });

    describe('Price Cache', () => {
        it('should store last known Bitcoin price', () => {
            stateManager.setLastKnownPrice(65000);
            
            const price = stateManager.getLastKnownPrice();
            expect(price).toBe(65000);
        });

        it('should return null for expired price', () => {
            const cache = stateManager.get('apiCache');
            cache.prices = { bitcoin: { usd: 50000 } };
            cache.lastUpdate = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
            stateManager.set('apiCache', cache);
            
            const price = stateManager.getLastKnownPrice();
            expect(price).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should handle corrupted localStorage data', async () => {
            localStorageMock.store.mooshWalletState = 'invalid json';
            
            await expect(stateManager.loadState()).resolves.not.toThrow();
            expect(stateManager.get('currentPage')).toBe('home'); // Default value
        });

        it('should handle localStorage quota exceeded', async () => {
            localStorageMock.setItem.mockImplementationOnce(() => {
                throw new Error('QuotaExceededError');
            });
            
            await expect(stateManager.saveState()).resolves.not.toThrow();
        });
    });
});