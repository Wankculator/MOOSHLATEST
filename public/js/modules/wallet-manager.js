/**
 * Wallet Manager Module
 * Handles wallet operations, multi-wallet support, and wallet state
 * Integrates with API service for blockchain operations
 */

import { apiService } from './api-service.js';
import { stateManager } from './state-manager.js';
import CryptoUtils from './crypto-utils.js';

export class WalletManager {
    constructor() {
        this.wallets = [];
        this.activeWalletIndex = 0;
        this.maxWallets = 8;
        
        // Session storage for wallet metadata (not sensitive data)
        this.storageKey = 'moosh_wallet_metadata';
        
        // Initialize from storage
        this.loadWalletMetadata();
    }

    /**
     * Initialize wallet manager
     */
    async initialize() {
        // Check for existing wallets
        const metadata = this.loadWalletMetadata();
        
        if (metadata && metadata.wallets.length > 0) {
            this.wallets = metadata.wallets;
            this.activeWalletIndex = metadata.activeIndex || 0;
            
            // Update state
            stateManager.set('wallet.exists', true);
            stateManager.set('wallets.count', this.wallets.length);
            stateManager.set('wallets.activeIndex', this.activeWalletIndex);
            
            // Load active wallet balance
            await this.refreshActiveWallet();
        }
    }

    /**
     * Generate a new wallet
     */
    async generateWallet(options = {}) {
        const {
            wordCount = 12,
            label = null,
            color = null
        } = options;

        try {
            // Check wallet limit
            if (this.wallets.length >= this.maxWallets) {
                throw new Error(`Maximum wallet limit (${this.maxWallets}) reached`);
            }

            // Show loading state
            stateManager.set('ui.loading', true);

            // Map word count to strength
            const strengthMap = {
                12: 128,
                24: 256
            };
            const strength = strengthMap[wordCount] || 128;

            // Generate wallet via API
            const response = await apiService.generateSparkWallet(strength);

            if (!response.success) {
                throw new Error(response.error || 'Failed to generate wallet');
            }

            // Create wallet object
            const wallet = {
                id: CryptoUtils.generateWalletId(),
                label: label || `Wallet ${this.wallets.length + 1}`,
                color: color || this.getRandomColor(),
                created: new Date().toISOString(),
                addresses: response.data.addresses,
                imported: false,
                locked: false,
                balance: {
                    bitcoin: '0',
                    spark: '0',
                    usd: '0'
                },
                transactions: []
            };

            // Add to wallets array
            this.wallets.push(wallet);
            this.activeWalletIndex = this.wallets.length - 1;

            // Save metadata
            this.saveWalletMetadata();

            // Update state
            stateManager.update({
                'wallet.exists': true,
                'wallet.imported': false,
                'wallets.count': this.wallets.length,
                'wallets.activeIndex': this.activeWalletIndex,
                'wallets.list': this.wallets
            });

            // Return wallet data with sensitive info
            return {
                ...wallet,
                mnemonic: response.data.mnemonic,
                privateKeys: response.data.privateKeys
            };

        } catch (error) {
            console.error('Wallet generation error:', error);
            throw error;
        } finally {
            stateManager.set('ui.loading', false);
        }
    }

    /**
     * Import wallet from mnemonic
     */
    async importWallet(mnemonic, options = {}) {
        const {
            label = null,
            color = null
        } = options;

        try {
            // Check wallet limit
            if (this.wallets.length >= this.maxWallets) {
                throw new Error(`Maximum wallet limit (${this.maxWallets}) reached`);
            }

            // Show loading state
            stateManager.set('ui.loading', true);

            // Import wallet via API
            const response = await apiService.importSparkWallet(mnemonic);

            if (!response.success) {
                throw new Error(response.error || 'Failed to import wallet');
            }

            // Create wallet object
            const wallet = {
                id: CryptoUtils.generateWalletId(),
                label: label || `Imported ${this.wallets.length + 1}`,
                color: color || this.getRandomColor(),
                created: new Date().toISOString(),
                addresses: response.data.addresses,
                imported: true,
                locked: false,
                balance: {
                    bitcoin: '0',
                    spark: '0',
                    usd: '0'
                },
                transactions: []
            };

            // Add to wallets array
            this.wallets.push(wallet);
            this.activeWalletIndex = this.wallets.length - 1;

            // Save metadata
            this.saveWalletMetadata();

            // Update state
            stateManager.update({
                'wallet.exists': true,
                'wallet.imported': true,
                'wallets.count': this.wallets.length,
                'wallets.activeIndex': this.activeWalletIndex,
                'wallets.list': this.wallets
            });

            // Load balance
            await this.refreshActiveWallet();

            return wallet;

        } catch (error) {
            console.error('Wallet import error:', error);
            throw error;
        } finally {
            stateManager.set('ui.loading', false);
        }
    }

    /**
     * Get active wallet
     */
    getActiveWallet() {
        return this.wallets[this.activeWalletIndex] || null;
    }

    /**
     * Switch active wallet
     */
    async switchWallet(index) {
        if (index < 0 || index >= this.wallets.length) {
            throw new Error('Invalid wallet index');
        }

        this.activeWalletIndex = index;
        
        // Update state
        stateManager.set('wallets.activeIndex', index);
        
        // Save metadata
        this.saveWalletMetadata();
        
        // Refresh new active wallet
        await this.refreshActiveWallet();
    }

    /**
     * Update wallet label
     */
    updateWalletLabel(index, label) {
        if (this.wallets[index]) {
            this.wallets[index].label = label;
            this.saveWalletMetadata();
            stateManager.set('wallets.list', this.wallets);
        }
    }

    /**
     * Update wallet color
     */
    updateWalletColor(index, color) {
        if (this.wallets[index]) {
            this.wallets[index].color = color;
            this.saveWalletMetadata();
            stateManager.set('wallets.list', this.wallets);
        }
    }

    /**
     * Delete wallet
     */
    deleteWallet(index) {
        if (this.wallets.length <= 1) {
            throw new Error('Cannot delete the last wallet');
        }

        // Remove wallet
        this.wallets.splice(index, 1);

        // Adjust active index if needed
        if (this.activeWalletIndex >= this.wallets.length) {
            this.activeWalletIndex = this.wallets.length - 1;
        }

        // Save metadata
        this.saveWalletMetadata();

        // Update state
        stateManager.update({
            'wallets.count': this.wallets.length,
            'wallets.activeIndex': this.activeWalletIndex,
            'wallets.list': this.wallets
        });
    }

    /**
     * Lock/unlock wallet
     */
    toggleWalletLock(index) {
        if (this.wallets[index]) {
            this.wallets[index].locked = !this.wallets[index].locked;
            this.saveWalletMetadata();
            stateManager.set('wallets.list', this.wallets);
        }
    }

    /**
     * Refresh active wallet data
     */
    async refreshActiveWallet() {
        const wallet = this.getActiveWallet();
        if (!wallet) return;

        try {
            // Update loading state
            stateManager.set('wallet.loading', true);

            // Fetch balances in parallel
            const [btcBalance, sparkBalance, btcPrice] = await Promise.all([
                apiService.getBitcoinBalance(wallet.addresses.bitcoin),
                apiService.getSparkBalance(wallet.addresses.spark),
                apiService.getBitcoinPrice()
            ]);

            // Update wallet balance
            wallet.balance = {
                bitcoin: btcBalance.balance || '0',
                spark: sparkBalance.balance || '0',
                usd: this.calculateUSDValue(btcBalance.balance || 0, btcPrice.bitcoin.usd)
            };

            // Update state
            stateManager.update({
                'wallet.address': wallet.addresses.bitcoin,
                'wallet.balance': wallet.balance.bitcoin,
                'wallet.balanceUSD': wallet.balance.usd
            });

            // Fetch recent transactions
            await this.loadTransactions(wallet.addresses.bitcoin);

        } catch (error) {
            console.error('Failed to refresh wallet:', error);
        } finally {
            stateManager.set('wallet.loading', false);
        }
    }

    /**
     * Load transactions for address
     */
    async loadTransactions(address) {
        try {
            const transactions = await apiService.getBitcoinTransactions(address);
            
            const wallet = this.getActiveWallet();
            if (wallet) {
                wallet.transactions = transactions;
                stateManager.set('wallet.transactions', transactions);
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }

    /**
     * Calculate USD value
     */
    calculateUSDValue(btcAmount, btcPrice) {
        const btc = parseFloat(btcAmount) || 0;
        const price = parseFloat(btcPrice) || 0;
        return (btc * price).toFixed(2);
    }

    /**
     * Get random color for wallet
     */
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#6C5CE7', '#A29BFE', '#FD79A8',
            '#FDCB6E', '#6C5CE7', '#00B894', '#00CEC9'
        ];
        const randomIndex = CryptoUtils.getRandomInt(0, colors.length);
        return colors[randomIndex];
    }

    /**
     * Save wallet metadata to storage
     */
    saveWalletMetadata() {
        const metadata = {
            wallets: this.wallets.map(w => ({
                id: w.id,
                label: w.label,
                color: w.color,
                created: w.created,
                addresses: w.addresses,
                imported: w.imported,
                locked: w.locked
            })),
            activeIndex: this.activeWalletIndex,
            lastUpdated: new Date().toISOString()
        };

        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(metadata));
        } catch (error) {
            console.warn('Failed to save wallet metadata:', error);
        }
    }

    /**
     * Load wallet metadata from storage
     */
    loadWalletMetadata() {
        try {
            const data = sessionStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Failed to load wallet metadata:', error);
        }
        return null;
    }

    /**
     * Clear all wallet data
     */
    clearAllData() {
        this.wallets = [];
        this.activeWalletIndex = 0;
        sessionStorage.removeItem(this.storageKey);
        
        stateManager.update({
            'wallet.exists': false,
            'wallet.imported': false,
            'wallets.count': 0,
            'wallets.activeIndex': 0,
            'wallets.list': []
        });
    }

    /**
     * Export wallet metadata (for backup)
     */
    exportMetadata() {
        return {
            wallets: this.wallets,
            activeIndex: this.activeWalletIndex,
            exported: new Date().toISOString()
        };
    }

    /**
     * Import wallet metadata (from backup)
     */
    importMetadata(metadata) {
        if (metadata.wallets && Array.isArray(metadata.wallets)) {
            this.wallets = metadata.wallets;
            this.activeWalletIndex = metadata.activeIndex || 0;
            this.saveWalletMetadata();
            
            stateManager.update({
                'wallet.exists': this.wallets.length > 0,
                'wallets.count': this.wallets.length,
                'wallets.activeIndex': this.activeWalletIndex,
                'wallets.list': this.wallets
            });
        }
    }

    /**
     * Check if any wallet exists
     */
    hasWallet() {
        return this.wallets.length > 0;
    }

    /**
     * Get wallet statistics
     */
    getStatistics() {
        const totalBitcoin = this.wallets.reduce((sum, w) => {
            return sum + (parseFloat(w.balance?.bitcoin) || 0);
        }, 0);

        const totalUSD = this.wallets.reduce((sum, w) => {
            return sum + (parseFloat(w.balance?.usd) || 0);
        }, 0);

        return {
            walletCount: this.wallets.length,
            totalBitcoin: totalBitcoin.toFixed(8),
            totalUSD: totalUSD.toFixed(2),
            activeWallet: this.activeWalletIndex
        };
    }

    /**
     * Debug method
     */
    debug() {
        console.group('Wallet Manager Debug');
        console.log('Wallets:', this.wallets);
        console.log('Active Index:', this.activeWalletIndex);
        console.log('Statistics:', this.getStatistics());
        console.groupEnd();
    }
}

// Export singleton instance
export const walletManager = new WalletManager();

// Default export
export default WalletManager;