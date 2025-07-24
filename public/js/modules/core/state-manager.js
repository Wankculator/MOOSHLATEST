// MOOSH WALLET - State Manager Module
// Central state management with event system
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class StateManager {
        constructor() {
            this.state = {
                selectedMnemonic: 12,
                isMainnet: true,
                isSparkTheme: false,
                currentPage: 'home',
                navigationHistory: ['home'],
                walletPassword: null,
                generatedSeed: null,
                verificationWords: [],
                walletType: null, // 'create' or 'import'
                
                // Multi-account management
                accounts: [],
                currentAccountId: null,
                
                // Wallet data
                walletData: {
                    addresses: {},
                    balances: {},
                    transactions: []
                },
                
                // Privacy settings
                isBalanceHidden: false,
                
                // API data cache
                apiCache: {
                    prices: {},
                    blockHeight: null,
                    lastUpdate: null
                }
            };
            
            this.listeners = new Map();
            
            // Initialize secure storage
            this.secureStorage = new SecureStorage();
            
            this.loadPersistedState();
            this.loadAccounts();
            
            // Migrate old unencrypted seeds if they exist
            this.migrateUnencryptedSeeds();
        }

        get(key) {
            return this.state[key];
        }

        set(key, value) {
            const oldValue = this.state[key];
            this.state[key] = value;
            this.emit(key, value, oldValue);
        }

        update(updates) {
            Object.entries(updates).forEach(([key, value]) => {
                this.set(key, value);
            });
        }

        delete(key) {
            const oldValue = this.state[key];
            delete this.state[key];
            this.emit(key, undefined, oldValue);
        }

        on(key, callback) {
            if (!this.listeners.has(key)) {
                this.listeners.set(key, []);
            }
            this.listeners.get(key).push(callback);
        }

        off(key, callback) {
            if (this.listeners.has(key)) {
                const callbacks = this.listeners.get(key);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        }

        emit(key, newValue, oldValue) {
            if (this.listeners.has(key)) {
                this.listeners.get(key).forEach(callback => {
                    callback(newValue, oldValue);
                });
            }
            // Auto-persist certain state changes
            if (['accounts', 'currentAccountId', 'isBalanceHidden', 'apiCache'].includes(key)) {
                this.persistState();
            }
        }
        
        // Alias methods for consistency
        subscribe(key, callback) {
            return this.on(key, callback);
        }
        
        removeListener(key, callback) {
            return this.off(key, callback);
        }
        
        loadPersistedState() {
            try {
                const saved = localStorage.getItem('mooshWalletState');
                if (saved) {
                    const data = JSON.parse(saved);
                    // Only load safe data
                    if (data.accounts) this.state.accounts = data.accounts;
                    if (data.currentAccountId) this.state.currentAccountId = data.currentAccountId;
                    // Handle legacy activeAccountIndex
                    if (typeof data.activeAccountIndex === 'number' && !data.currentAccountId && data.accounts) {
                        // Migrate from old index-based system
                        const account = data.accounts[data.activeAccountIndex];
                        if (account) this.state.currentAccountId = account.id;
                    }
                    if (typeof data.isBalanceHidden === 'boolean') this.state.isBalanceHidden = data.isBalanceHidden;
                    if (data.apiCache) this.state.apiCache = data.apiCache;
                }
            } catch (e) {
                console.error('Failed to load persisted state:', e);
            }
        }
        
        persistState() {
            try {
                const toPersist = {
                    accounts: this.state.accounts,
                    currentAccountId: this.state.currentAccountId,
                    isBalanceHidden: this.state.isBalanceHidden,
                    apiCache: this.state.apiCache
                };
                localStorage.setItem('mooshWalletState', JSON.stringify(toPersist));
            } catch (e) {
                if (window.ComplianceUtils) {
                    window.ComplianceUtils.log('StateManager', 'Failed to persist state: ' + e.message, 'error');
                } else {
                    console.error('[StateManager] Failed to persist state:', e);
                }
            }
        }
        
        async migrateUnencryptedSeeds() {
            // Check for old unencrypted seeds
            const generatedSeed = localStorage.getItem('generatedSeed');
            const importedSeed = localStorage.getItem('importedSeed');
            
            if (generatedSeed || importedSeed) {
                if (window.ComplianceUtils) {
                    window.ComplianceUtils.log('StateManager', 'Found unencrypted seeds, migration required', 'warn');
                } else {
                    console.warn('[StateManager] Found unencrypted seeds, migration required');
                }
                
                // Store flag that migration is needed
                this.state.needsSeedMigration = true;
                
                // Do NOT automatically migrate - wait for user to set password
                // Seeds will be migrated when user unlocks wallet with password
            }
        }
        
        switchAccount(accountId) {
            const account = this.state.accounts.find(a => a.id === accountId);
            if (account) {
                console.log('[StateManager] Switching to account:', account.name);
                
                // Update state - this will trigger listeners
                this.set('currentAccountId', accountId);
                account.lastUsed = Date.now();
                this.persistAccounts();
                
                // Emit event for any listeners
                this.emit('accountSwitched', account);
                
                return true;
            }
            return false;
        }
        
        getCurrentAccount() {
            return this.state.accounts.find(a => a.id === this.state.currentAccountId) || null;
        }
        
        getAccounts() {
            return this.state.accounts || [];
        }
        
        getAccountById(id) {
            return this.getAccounts().find(acc => acc.id === id) || null;
        }
        
        deleteAccount(accountId) {
            const accounts = this.getAccounts();
            
            // Check if we can delete (prevent last account deletion)
            if (window.ComplianceUtils && !window.ComplianceUtils.canDelete(accounts.length)) {
                console.warn('[StateManager] Cannot delete the last account');
                this.app?.showNotification?.('Cannot delete the last account', 'error');
                return false;
            }
            
            const index = accounts.findIndex(acc => acc.id === accountId);
            if (index > -1) {
                accounts.splice(index, 1);
                
                // If we deleted the current account, switch to the first available
                if (this.state.currentAccountId === accountId) {
                    this.state.currentAccountId = accounts[0].id;
                }
                
                // Fix currentAccountIndex if it's out of bounds
                if (this.state.currentAccountIndex >= accounts.length) {
                    this.state.currentAccountIndex = window.ComplianceUtils ? 
                        window.ComplianceUtils.fixArrayIndex(this.state.currentAccountIndex, accounts.length) :
                        Math.max(0, accounts.length - 1);
                }
                
                this.persistAccounts();
                if (window.ComplianceUtils) {
                    window.ComplianceUtils.log('StateManager', `Account ${accountId} deleted successfully`);
                }
                return true;
            }
            
            return false;
        }
        
        persistAccounts() {
            try {
                // Also update the accounts in the main state
                this.state.accounts = this.getAccounts();
                
                // Persist to local storage
                const dataToStore = {
                    accounts: this.state.accounts,
                    currentAccountId: this.state.currentAccountId
                };
                localStorage.setItem('mooshAccounts', JSON.stringify(dataToStore));
                
                // Also update the main state persistence
                this.persistState();
            } catch (e) {
                console.error('[StateManager] Failed to persist accounts:', e);
            }
        }
        
        loadAccounts() {
            try {
                console.log('[StateManager] Loading accounts from storage...');
                const stored = localStorage.getItem('mooshAccounts');
                if (stored) {
                    const data = JSON.parse(stored);
                    console.log('[StateManager] Found stored accounts data:', {
                        accountCount: data.accounts?.length || 0,
                        currentAccountId: data.currentAccountId
                    });
                    
                    if (data.accounts && data.accounts.length > 0) {
                        // Validate account structure
                        const validAccounts = data.accounts.filter(acc => {
                            return acc.id && acc.name && acc.addresses;
                        });
                        
                        if (validAccounts.length > 0) {
                            // Migrate accounts without colors
                            validAccounts.forEach((account, index) => {
                                if (!account.color) {
                                    const defaultColors = ['#69fd97', '#f57315', '#00D4FF', '#FF006E', '#FFBE0B', '#FB5607', '#8338EC', '#3A86FF'];
                                    account.color = defaultColors[index % defaultColors.length];
                                }
                            });
                            
                            this.state.accounts = validAccounts;
                            
                            // Set current account ID
                            if (data.currentAccountId) {
                                const accountExists = validAccounts.some(acc => acc.id === data.currentAccountId);
                                if (accountExists) {
                                    this.state.currentAccountId = data.currentAccountId;
                                } else {
                                    this.state.currentAccountId = validAccounts[0].id;
                                }
                            } else {
                                this.state.currentAccountId = validAccounts[0].id;
                            }
                            
                            console.log('[StateManager] Loaded accounts:', {
                                count: this.state.accounts.length,
                                currentId: this.state.currentAccountId
                            });
                        }
                    }
                }
            } catch (e) {
                console.error('[StateManager] Failed to load accounts:', e);
            }
        }
        
        // Password management methods
        setPassword(password) {
            if (!password || password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            
            // Hash the password (never store plain text)
            const hashedPassword = this.hashPassword(password);
            
            // Store in sessionStorage (not localStorage for security)
            sessionStorage.setItem('moosh_wallet_pwd_hash', hashedPassword);
            
            // Set password timeout (15 minutes)
            this.startPasswordTimeout();
            
            return true;
        }
        
        verifyPassword(password) {
            const storedHash = sessionStorage.getItem('moosh_wallet_pwd_hash');
            
            if (!storedHash) {
                return false;
            }
            
            const inputHash = this.hashPassword(password);
            return inputHash === storedHash;
        }
        
        hasPassword() {
            return !!sessionStorage.getItem('moosh_wallet_pwd_hash');
        }
        
        clearPassword() {
            sessionStorage.removeItem('moosh_wallet_pwd_hash');
            this.clearPasswordTimeout();
        }
        
        // Simple hash function (in production, use bcrypt or similar)
        hashPassword(password) {
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString(16);
        }
        
        startPasswordTimeout() {
            // Clear password after 15 minutes of inactivity
            this.clearPasswordTimeout();
            this.passwordTimeout = setTimeout(() => {
                this.clearPassword();
                this.notifySubscribers('security', { event: 'password_timeout' });
            }, 15 * 60 * 1000); // 15 minutes
        }
        
        clearPasswordTimeout() {
            if (this.passwordTimeout) {
                clearTimeout(this.passwordTimeout);
                this.passwordTimeout = null;
            }
        }
        
        notifySubscribers(channel, data) {
            // This method allows custom event channels
            if (this.listeners.has(channel)) {
                this.listeners.get(channel).forEach(callback => {
                    callback(data);
                });
            }
        }
        
        // Utility methods
        hashSeed(seed) {
            // Simple hash for verification (not for security)
            const str = Array.isArray(seed) ? seed.join(' ') : seed;
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString(36);
        }
        
        // NOTE: The createAccount method is implemented in the main app
        // due to its dependency on API calls. It will be added via prototype
        // extension in the main app initialization.
        
        // NOTE: The fixMissingAddresses method is also implemented in the main app
        // due to its dependency on API calls.
    }

    // Make available globally and maintain compatibility
    window.StateManager = StateManager;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.StateManager = StateManager;
    }

})(window);