// MOOSH WALLET - Multi-Wallet Integration
// Hooks the multi-wallet system into the state manager
// This patches the state manager to use per-wallet account storage

(function(window) {
    'use strict';
    
    // Wait for all modules to be loaded
    window.addEventListener('moosh-wallet-ready', function() {
        console.log('[MultiWalletIntegration] Patching state manager for multi-wallet support');
        
        const StateManager = window.StateManager;
        if (!StateManager) {
            console.error('[MultiWalletIntegration] StateManager not found');
            return;
        }
        
        // Override the set method to intercept account saves
        const originalSet = StateManager.prototype.set;
        StateManager.prototype.set = function(key, value) {
            // Call original method first
            const result = originalSet.call(this, key, value);
            
            // If accounts are being saved, also save to wallet-specific storage
            if (key === 'accounts' && this.app && this.app.walletManager) {
                const activeWallet = this.app.walletManager.getActiveWallet();
                if (activeWallet) {
                    this.app.walletManager.saveWalletAccounts(activeWallet.id, value);
                    console.log(`[MultiWalletIntegration] Saved ${value.length} accounts to wallet ${activeWallet.id}`);
                }
            }
            
            return result;
        };
        
        // Add createAccount method that works with multi-wallet
        StateManager.prototype.createAccount = async function(name, mnemonic, isImport = false, type = 'HD Wallet', variant = null) {
            try {
                console.log('[StateManager] Creating account:', { name, isImport, type });
                
                // Generate account data using API
                const response = await this.app.apiService.post('/api/spark/generate-wallet', {
                    mnemonic: mnemonic,
                    strength: mnemonic.split(' ').length === 12 ? 128 : 256
                });
                
                if (!response.success || !response.data) {
                    throw new Error('Failed to generate wallet data');
                }
                
                // Create account object
                const account = {
                    id: this.generateAccountId(),
                    name: name,
                    type: type,
                    variant: variant,
                    createdAt: Date.now(),
                    isImport: isImport,
                    mnemonic: response.data.mnemonic,
                    addresses: response.data.addresses,
                    privateKeys: response.data.privateKeys,
                    balance: 0,
                    color: this.getNextAccountColor(),
                    order: (this.get('accounts') || []).length
                };
                
                // Add to accounts
                const accounts = this.get('accounts') || [];
                accounts.push(account);
                this.set('accounts', accounts);
                
                // Set as current account if it's the first one
                if (accounts.length === 1 || !this.get('currentAccount')) {
                    this.set('currentAccount', account);
                    this.set('currentAccountIndex', 0);
                }
                
                console.log('[StateManager] Account created successfully:', account.name);
                return account;
                
            } catch (error) {
                console.error('[StateManager] Failed to create account:', error);
                throw error;
            }
        };
        
        // Helper to generate unique account ID
        StateManager.prototype.generateAccountId = function() {
            const bytes = new Uint8Array(16);
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        };
        
        // Get next color for account
        StateManager.prototype.getNextAccountColor = function() {
            const colors = ['#f57315', '#69fd97', '#ff4444', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
            const accounts = this.get('accounts') || [];
            return colors[accounts.length % colors.length];
        };
        
        // Update the hasWallet method to check active wallet
        const originalHasWallet = StateManager.prototype.hasWallet;
        StateManager.prototype.hasWallet = function() {
            // First check if multi-wallet manager exists
            if (this.app && this.app.walletManager) {
                const activeWallet = this.app.walletManager.getActiveWallet();
                if (activeWallet) {
                    const accounts = this.app.walletManager.getWalletAccounts(activeWallet.id);
                    return accounts && accounts.length > 0;
                }
            }
            
            // Fallback to original method
            return originalHasWallet ? originalHasWallet.call(this) : false;
        };
        
        console.log('[MultiWalletIntegration] State manager patched successfully');
    });
    
})(window);