// MOOSH WALLET - Spark Wallet Manager Module
// Main manager for Spark Protocol wallet operations
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class SparkWalletManager {
        constructor() {
            this.wallets = new Map();
            this.activeWallet = null;
            this.sparkProtocol = new (window.SparkStateManager || SparkStateManager)();
            this.bitcoinManager = new (window.SparkBitcoinManager || SparkBitcoinManager)();
            this.lightningManager = new (window.SparkLightningManager || SparkLightningManager)();
        }

        async createWallet(mnemonic, password) {
            try {
                // Generate wallet ID
                const walletId = 'spark_wallet_' + Date.now();
                
                // Derive keys from mnemonic
                const keys = await this.deriveKeys(mnemonic);
                
                // Create wallet object
                const wallet = {
                    id: walletId,
                    publicKey: keys.publicKey,
                    sparkAddress: this.generateSparkAddress(keys.publicKey),
                    bitcoinAddress: keys.bitcoinAddress,
                    createdAt: Date.now(),
                    encrypted: password ? true : false
                };

                // Store wallet
                this.wallets.set(walletId, wallet);
                this.activeWallet = wallet;

                return wallet;
            } catch (error) {
                console.error('Failed to create Spark wallet:', error);
                throw error;
            }
        }

        async deriveKeys(mnemonic) {
            // Simulate key derivation
            // In production, use proper BIP32/BIP39 derivation
            const seedPhrase = Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic;
            const hash = await this.hashString(seedPhrase);
            
            return {
                publicKey: 'spark_pub_' + hash.substring(0, 32),
                privateKey: 'spark_priv_' + hash.substring(32, 64),
                bitcoinAddress: 'bc1q' + hash.substring(0, 20)
            };
        }

        async hashString(str) {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        generateSparkAddress(publicKey) {
            // Generate Spark Protocol address from public key
            return 'spark1' + publicKey.substring(10, 42);
        }

        async importWallet(mnemonic, password) {
            return this.createWallet(mnemonic, password);
        }

        getActiveWallet() {
            return this.activeWallet;
        }

        getAllWallets() {
            return Array.from(this.wallets.values());
        }

        setActiveWallet(walletId) {
            const wallet = this.wallets.get(walletId);
            if (wallet) {
                this.activeWallet = wallet;
                return true;
            }
            return false;
        }

        async getBalance(walletId) {
            const wallet = walletId ? this.wallets.get(walletId) : this.activeWallet;
            if (!wallet) {
                throw new Error('No wallet selected');
            }

            // Get balances from managers
            const sparkBalance = await this.bitcoinManager.getSparkBalance(wallet.sparkAddress);
            const lightningBalance = this.lightningManager.getChannelBalance();

            return {
                spark: sparkBalance.spark,
                bitcoin: sparkBalance.bitcoin,
                lightning: {
                    local: lightningBalance.localBalance,
                    remote: lightningBalance.remoteBalance,
                    capacity: lightningBalance.totalCapacity
                }
            };
        }

        async sendTransaction(to, amount, fee) {
            if (!this.activeWallet) {
                throw new Error('No active wallet');
            }

            try {
                // Create Spark transaction
                const tx = {
                    from: this.activeWallet.sparkAddress,
                    to,
                    amount,
                    fee,
                    timestamp: Date.now(),
                    nonce: Math.floor(Math.random() * 1000000)
                };

                // Submit to Spark network
                const txHash = await this.sparkProtocol.submitTransaction(tx);

                return {
                    success: true,
                    txHash,
                    tx
                };
            } catch (error) {
                console.error('Failed to send transaction:', error);
                throw error;
            }
        }

        async deposit(amount) {
            if (!this.activeWallet) {
                throw new Error('No active wallet');
            }

            return this.bitcoinManager.createSparkDeposit(
                amount,
                this.activeWallet.bitcoinAddress
            );
        }

        async withdraw(amount, bitcoinAddress) {
            if (!this.activeWallet) {
                throw new Error('No active wallet');
            }

            return this.bitcoinManager.requestWithdrawal(
                amount,
                this.activeWallet.sparkAddress,
                bitcoinAddress
            );
        }

        async openLightningChannel(capacity, peerNode) {
            return this.lightningManager.openChannel(capacity, peerNode);
        }

        async createLightningInvoice(amount, memo) {
            return this.lightningManager.createInvoice(amount, memo);
        }

        async payLightningInvoice(paymentRequest) {
            return this.lightningManager.payInvoice(paymentRequest);
        }

        getNetworkStats() {
            return this.sparkProtocol.getNetworkStats();
        }

        exportWallet(walletId) {
            const wallet = walletId ? this.wallets.get(walletId) : this.activeWallet;
            if (!wallet) {
                throw new Error('Wallet not found');
            }

            // Return non-sensitive wallet data
            return {
                id: wallet.id,
                sparkAddress: wallet.sparkAddress,
                bitcoinAddress: wallet.bitcoinAddress,
                createdAt: wallet.createdAt
            };
        }

        deleteWallet(walletId) {
            if (this.wallets.has(walletId)) {
                this.wallets.delete(walletId);
                if (this.activeWallet?.id === walletId) {
                    this.activeWallet = null;
                }
                return true;
            }
            return false;
        }
    }

    // Make available globally
    window.SparkWalletManager = SparkWalletManager;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.SparkWalletManager = SparkWalletManager;
    }

})(window);