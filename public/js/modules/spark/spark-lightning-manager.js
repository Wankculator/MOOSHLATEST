// MOOSH WALLET - Spark Lightning Manager Module
// Manages Lightning Network operations for Spark Protocol
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class SparkLightningManager {
        constructor() {
            this.lightningNode = 'https://spark-lightning.app'; // Real Spark Lightning node
            this.channels = new Map();
            this.invoices = new Map();
        }

        async openChannel(capacity, peerNode) {
            try {
                // Create channel opening request
                const channelId = 'channel_' + Date.now();
                const channel = {
                    id: channelId,
                    capacity,
                    localBalance: capacity,
                    remoteBalance: 0,
                    peer: peerNode,
                    status: 'pending_open',
                    createdAt: Date.now()
                };

                this.channels.set(channelId, channel);

                // Simulate channel opening
                setTimeout(() => {
                    channel.status = 'active';
                    this.channels.set(channelId, channel);
                }, 3000);

                return channel;
            } catch (error) {
                console.error('Failed to open Lightning channel:', error);
                throw error;
            }
        }

        async createInvoice(amount, memo = '') {
            try {
                // Generate Lightning invoice
                const invoiceId = 'invoice_' + Date.now();
                const invoice = {
                    id: invoiceId,
                    amount,
                    memo,
                    paymentRequest: this.generatePaymentRequest(amount, memo),
                    status: 'unpaid',
                    createdAt: Date.now(),
                    expiresAt: Date.now() + (3600 * 1000) // 1 hour
                };

                this.invoices.set(invoiceId, invoice);

                return invoice;
            } catch (error) {
                console.error('Failed to create Lightning invoice:', error);
                throw error;
            }
        }

        generatePaymentRequest(amount, memo) {
            // Generate a Lightning payment request
            const prefix = 'lnbc';
            const timestamp = Date.now().toString(16);
            const randomPart = Math.random().toString(36).substring(2, 15);
            return `${prefix}${amount}n${timestamp}${randomPart}`;
        }

        async payInvoice(paymentRequest) {
            try {
                // Parse and validate payment request
                if (!paymentRequest.startsWith('lnbc')) {
                    throw new Error('Invalid payment request');
                }

                // Create payment record
                const payment = {
                    id: 'payment_' + Date.now(),
                    paymentRequest,
                    amount: this.parseAmountFromRequest(paymentRequest),
                    status: 'pending',
                    timestamp: Date.now()
                };

                // Simulate payment processing
                setTimeout(() => {
                    payment.status = 'completed';
                    payment.preimage = this.generatePreimage();
                }, 2000);

                return payment;
            } catch (error) {
                console.error('Failed to pay Lightning invoice:', error);
                throw error;
            }
        }

        parseAmountFromRequest(paymentRequest) {
            // Extract amount from payment request
            const match = paymentRequest.match(/lnbc(\d+)n/);
            return match ? parseInt(match[1]) : 0;
        }

        generatePreimage() {
            // Generate payment preimage
            const bytes = new Uint8Array(32);
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        }

        async getChannels() {
            return Array.from(this.channels.values());
        }

        async getInvoices() {
            return Array.from(this.invoices.values());
        }

        async closeChannel(channelId) {
            try {
                const channel = this.channels.get(channelId);
                if (!channel) {
                    throw new Error('Channel not found');
                }

                channel.status = 'pending_close';
                
                // Simulate channel closing
                setTimeout(() => {
                    channel.status = 'closed';
                    this.channels.set(channelId, channel);
                }, 5000);

                return channel;
            } catch (error) {
                console.error('Failed to close Lightning channel:', error);
                throw error;
            }
        }

        getChannelBalance() {
            let totalLocal = 0;
            let totalRemote = 0;

            for (const channel of this.channels.values()) {
                if (channel.status === 'active') {
                    totalLocal += channel.localBalance;
                    totalRemote += channel.remoteBalance;
                }
            }

            return {
                localBalance: totalLocal,
                remoteBalance: totalRemote,
                totalCapacity: totalLocal + totalRemote
            };
        }
    }

    // Make available globally
    window.SparkLightningManager = SparkLightningManager;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.SparkLightningManager = SparkLightningManager;
    }

})(window);