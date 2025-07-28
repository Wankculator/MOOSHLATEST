// MOOSH WALLET - Multi-Wallet Manager
// Manages multiple wallets with isolated accounts and settings
// Following all MOOSH security and performance guidelines

(function(window) {
    'use strict';

    class MultiWalletManager {
        constructor(app) {
            this.app = app;
            this.wallets = [];
            this.activeWalletId = null;
            this.STORAGE_KEY = 'moosh_wallets';
            this.ACTIVE_WALLET_KEY = 'moosh_active_wallet';
            
            // Wallet data structure version for future migrations
            this.DATA_VERSION = '1.0';
            
            // Initialize from storage
            this.loadWallets();
        }
        
        // Create a new wallet
        createWallet(name, options = {}) {
            const walletId = this.generateWalletId();
            
            const wallet = {
                id: walletId,
                name: name || `Wallet ${this.wallets.length + 1}`,
                createdAt: Date.now(),
                lastAccessedAt: Date.now(),
                version: this.DATA_VERSION,
                
                // Wallet settings
                settings: {
                    color: options.color || '#f57315',
                    icon: options.icon || 'wallet',
                    passwordProtected: false,
                    passwordHash: null,
                    autoLockTimeout: 300000, // 5 minutes
                    currency: 'USD',
                    explorerPreference: 'mempool',
                    ...options.settings
                },
                
                // Wallet metadata
                metadata: {
                    accountCount: 0,
                    totalBalance: 0,
                    lastSync: null,
                    backupDate: null,
                    ...options.metadata
                },
                
                // Associated accounts (stored separately for security)
                accountIds: []
            };
            
            this.wallets.push(wallet);
            
            // Set as active if it's the first wallet
            if (this.wallets.length === 1) {
                this.activeWalletId = walletId;
            }
            
            this.saveWallets();
            this.app.state.set('currentWallet', wallet);
            
            console.log(`[MultiWalletManager] Created wallet: ${wallet.name} (${walletId})`);
            return wallet;
        }
        
        // Switch to a different wallet
        switchWallet(walletId) {
            const wallet = this.getWallet(walletId);
            if (!wallet) {
                console.error(`[MultiWalletManager] Wallet not found: ${walletId}`);
                return false;
            }
            
            // Update last accessed time
            wallet.lastAccessedAt = Date.now();
            
            // Set as active wallet
            this.activeWalletId = walletId;
            localStorage.setItem(this.ACTIVE_WALLET_KEY, walletId);
            
            // Update app state
            this.app.state.set('currentWallet', wallet);
            
            // Load wallet's accounts
            this.loadWalletAccounts(walletId);
            
            // Save updated wallets
            this.saveWallets();
            
            console.log(`[MultiWalletManager] Switched to wallet: ${wallet.name}`);
            this.app.showNotification(`Switched to ${wallet.name}`, 'success');
            
            // Refresh the current page to reflect wallet change
            this.refreshCurrentView();
            
            // Emit wallet change event for any listeners
            if (window.CustomEvent) {
                const event = new CustomEvent('walletChanged', {
                    detail: {
                        walletId: walletId,
                        walletName: wallet.name
                    }
                });
                window.dispatchEvent(event);
            }
            
            return true;
        }
        
        // Get a specific wallet
        getWallet(walletId) {
            return this.wallets.find(w => w.id === walletId);
        }
        
        // Get the active wallet
        getActiveWallet() {
            return this.getWallet(this.activeWalletId);
        }
        
        // Update wallet settings
        updateWalletSettings(walletId, settings) {
            const wallet = this.getWallet(walletId);
            if (!wallet) return false;
            
            wallet.settings = {
                ...wallet.settings,
                ...settings
            };
            
            this.saveWallets();
            
            // Update state if this is the active wallet
            if (walletId === this.activeWalletId) {
                this.app.state.set('currentWallet', wallet);
            }
            
            return true;
        }
        
        // Delete a wallet
        deleteWallet(walletId) {
            // Prevent deleting the last wallet
            if (this.wallets.length <= 1) {
                this.app.showNotification('Cannot delete the last wallet', 'error');
                return false;
            }
            
            const walletIndex = this.wallets.findIndex(w => w.id === walletId);
            if (walletIndex === -1) return false;
            
            const wallet = this.wallets[walletIndex];
            
            // Remove associated accounts from storage
            this.deleteWalletAccounts(walletId);
            
            // Remove wallet
            this.wallets.splice(walletIndex, 1);
            
            // If this was the active wallet, switch to another
            if (walletId === this.activeWalletId) {
                const newActiveWallet = this.wallets[0];
                this.switchWallet(newActiveWallet.id);
            }
            
            this.saveWallets();
            
            console.log(`[MultiWalletManager] Deleted wallet: ${wallet.name}`);
            this.app.showNotification(`Deleted ${wallet.name}`, 'success');
            
            return true;
        }
        
        // Rename a wallet
        renameWallet(walletId, newName) {
            const wallet = this.getWallet(walletId);
            if (!wallet) return false;
            
            const oldName = wallet.name;
            wallet.name = newName;
            
            this.saveWallets();
            
            // Update state if this is the active wallet
            if (walletId === this.activeWalletId) {
                this.app.state.set('currentWallet', wallet);
            }
            
            console.log(`[MultiWalletManager] Renamed wallet: ${oldName} -> ${newName}`);
            return true;
        }
        
        // Export wallet data (for backup)
        exportWallet(walletId, includeAccounts = true) {
            const wallet = this.getWallet(walletId);
            if (!wallet) return null;
            
            const exportData = {
                version: this.DATA_VERSION,
                exportDate: Date.now(),
                wallet: { ...wallet },
                accounts: includeAccounts ? this.getWalletAccounts(walletId) : []
            };
            
            // Update backup date
            wallet.metadata.backupDate = Date.now();
            this.saveWallets();
            
            return exportData;
        }
        
        // Import wallet data
        importWallet(exportData, options = {}) {
            try {
                // Validate export data
                if (!exportData.version || !exportData.wallet) {
                    throw new Error('Invalid wallet export data');
                }
                
                // Check for duplicate
                const existingWallet = this.wallets.find(w => w.id === exportData.wallet.id);
                if (existingWallet && !options.overwrite) {
                    throw new Error('Wallet already exists');
                }
                
                // Import wallet
                const wallet = {
                    ...exportData.wallet,
                    lastAccessedAt: Date.now()
                };
                
                if (existingWallet) {
                    // Overwrite existing
                    const index = this.wallets.findIndex(w => w.id === wallet.id);
                    this.wallets[index] = wallet;
                } else {
                    // Add new wallet
                    this.wallets.push(wallet);
                }
                
                // Import accounts if included
                if (exportData.accounts && exportData.accounts.length > 0) {
                    this.importWalletAccounts(wallet.id, exportData.accounts);
                }
                
                this.saveWallets();
                
                console.log(`[MultiWalletManager] Imported wallet: ${wallet.name}`);
                return wallet;
                
            } catch (error) {
                console.error('[MultiWalletManager] Import failed:', error);
                throw error;
            }
        }
        
        // Get all wallets sorted by last accessed
        getAllWallets() {
            return [...this.wallets].sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
        }
        
        // Update wallet metadata
        updateWalletMetadata(walletId, metadata) {
            const wallet = this.getWallet(walletId);
            if (!wallet) return false;
            
            wallet.metadata = {
                ...wallet.metadata,
                ...metadata
            };
            
            this.saveWallets();
            return true;
        }
        
        // Load wallet accounts
        loadWalletAccounts(walletId) {
            const storageKey = `moosh_wallet_accounts_${walletId}`;
            const accountsData = localStorage.getItem(storageKey);
            
            if (accountsData) {
                try {
                    const accounts = JSON.parse(accountsData);
                    this.app.state.set('accounts', accounts);
                    
                    // Set first account as current if none selected
                    if (accounts.length > 0 && !this.app.state.get('currentAccount')) {
                        this.app.state.set('currentAccount', accounts[0]);
                        this.app.state.set('currentAccountIndex', 0);
                    }
                    
                    console.log(`[MultiWalletManager] Loaded ${accounts.length} accounts for wallet ${walletId}`);
                } catch (error) {
                    console.error('[MultiWalletManager] Failed to load accounts:', error);
                    this.app.state.set('accounts', []);
                }
            } else {
                // No accounts for this wallet yet
                this.app.state.set('accounts', []);
                this.app.state.set('currentAccount', null);
                this.app.state.set('currentAccountIndex', -1);
            }
        }
        
        // Save wallet accounts
        saveWalletAccounts(walletId, accounts) {
            const storageKey = `moosh_wallet_accounts_${walletId}`;
            localStorage.setItem(storageKey, JSON.stringify(accounts));
            
            // Update account count in wallet metadata
            const wallet = this.getWallet(walletId);
            if (wallet) {
                wallet.metadata.accountCount = accounts.length;
                this.saveWallets();
            }
        }
        
        // Get wallet accounts
        getWalletAccounts(walletId) {
            const storageKey = `moosh_wallet_accounts_${walletId}`;
            const accountsData = localStorage.getItem(storageKey);
            
            if (accountsData) {
                try {
                    return JSON.parse(accountsData);
                } catch (error) {
                    console.error('[MultiWalletManager] Failed to parse accounts:', error);
                    return [];
                }
            }
            
            return [];
        }
        
        // Delete wallet accounts
        deleteWalletAccounts(walletId) {
            const storageKey = `moosh_wallet_accounts_${walletId}`;
            localStorage.removeItem(storageKey);
        }
        
        // Import wallet accounts
        importWalletAccounts(walletId, accounts) {
            this.saveWalletAccounts(walletId, accounts);
            
            // Load if this is the active wallet
            if (walletId === this.activeWalletId) {
                this.loadWalletAccounts(walletId);
            }
        }
        
        // Generate unique wallet ID
        generateWalletId() {
            const bytes = new Uint8Array(16);
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Load wallets from localStorage
        loadWallets() {
            const walletsData = localStorage.getItem(this.STORAGE_KEY);
            
            if (walletsData) {
                try {
                    this.wallets = JSON.parse(walletsData);
                    console.log(`[MultiWalletManager] Loaded ${this.wallets.length} wallets`);
                } catch (error) {
                    console.error('[MultiWalletManager] Failed to load wallets:', error);
                    this.wallets = [];
                }
            }
            
            // Load active wallet ID
            this.activeWalletId = localStorage.getItem(this.ACTIVE_WALLET_KEY);
            
            // If no wallets exist, create a default one
            if (this.wallets.length === 0) {
                this.createWallet('Main Wallet');
            }
            
            // If no active wallet, set the first one
            if (!this.activeWalletId && this.wallets.length > 0) {
                this.activeWalletId = this.wallets[0].id;
                localStorage.setItem(this.ACTIVE_WALLET_KEY, this.activeWalletId);
            }
            
            // Load the active wallet
            if (this.activeWalletId) {
                this.switchWallet(this.activeWalletId);
            }
        }
        
        // Save wallets to localStorage
        saveWallets() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.wallets));
                console.log('[MultiWalletManager] Wallets saved');
            } catch (error) {
                console.error('[MultiWalletManager] Failed to save wallets:', error);
                this.app.showNotification('Failed to save wallet data', 'error');
            }
        }
        
        // Check if wallet requires password
        isWalletLocked(walletId) {
            const wallet = this.getWallet(walletId);
            return wallet && wallet.settings.passwordProtected && !wallet.unlocked;
        }
        
        // Set wallet password
        setWalletPassword(walletId, password) {
            const wallet = this.getWallet(walletId);
            if (!wallet) return false;
            
            // Hash password using crypto (not bcrypt in browser)
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            
            crypto.subtle.digest('SHA-256', data).then(hash => {
                const hashArray = Array.from(new Uint8Array(hash));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                wallet.settings.passwordProtected = true;
                wallet.settings.passwordHash = hashHex;
                
                this.saveWallets();
                
                console.log('[MultiWalletManager] Password set for wallet:', walletId);
            });
            
            return true;
        }
        
        // Verify wallet password
        async verifyWalletPassword(walletId, password) {
            const wallet = this.getWallet(walletId);
            if (!wallet || !wallet.settings.passwordProtected) return true;
            
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex === wallet.settings.passwordHash;
        }
        
        // Get wallet statistics
        getWalletStats(walletId) {
            const wallet = this.getWallet(walletId);
            if (!wallet) return null;
            
            const accounts = this.getWalletAccounts(walletId);
            
            return {
                walletId: walletId,
                name: wallet.name,
                accountCount: accounts.length,
                totalBalance: accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
                createdAt: wallet.createdAt,
                lastAccessedAt: wallet.lastAccessedAt,
                lastBackup: wallet.metadata.backupDate
            };
        }
        
        // Refresh the current view after wallet switch
        refreshCurrentView() {
            const currentPage = this.app.state.get('currentPage');
            
            // If on dashboard, re-render it
            if (currentPage === 'dashboard') {
                // Force dashboard to re-render with new wallet data
                const dashboardPage = this.app.router.currentPage;
                if (dashboardPage && dashboardPage.render) {
                    dashboardPage.render();
                }
            } else if (currentPage === 'wallet-details') {
                // If viewing wallet details, navigate back to dashboard
                this.app.router.navigate('dashboard');
            }
            
            // Update any open modals
            const openModal = document.querySelector('.modal-base');
            if (openModal) {
                // Close account-related modals since they're from previous wallet
                const accountModals = ['account-list-modal', 'send-modal', 'receive-modal'];
                const modalClass = openModal.className;
                
                if (accountModals.some(modal => modalClass.includes(modal))) {
                    // Close the modal
                    const closeBtn = openModal.querySelector('button');
                    if (closeBtn) closeBtn.click();
                }
            }
        }
    }
    
    // Make available globally
    window.MultiWalletManager = MultiWalletManager;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.MultiWalletManager = MultiWalletManager;
    }
    
})(window);