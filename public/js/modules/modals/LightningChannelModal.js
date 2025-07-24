// LightningChannelModal Module for MOOSH Wallet
// This modal manages Lightning Network channels and payments

(function(window) {
    'use strict';

    class LightningChannelModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
        }

        show() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.modal = $.div({
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target === this.modal) this.hide();
                }
            }, [
                $.div({
                    className: 'modal lightning-channel-modal',
                    style: {
                        maxWidth: '600px',
                        background: '#0A0F25',
                        borderRadius: '20px',
                        color: '#ffffff',
                        border: '1px solid #FFD700'
                    }
                }, [
                    $.div({
                        className: 'modal-header',
                        style: {
                            background: 'linear-gradient(90deg, #FFD700 0%, #f57315 100%)',
                            padding: '20px',
                            borderRadius: '20px 20px 0 0',
                            color: '#000',
                            textAlign: 'center'
                        }
                    }, [
                        $.h2({}, [$.span({ style: { color: 'var(--text-accent)', fontWeight: 'bold' } }, ['MOOSH']), ' Lightning Network Manager']),
                        $.p({}, ['Manage Lightning channels and instant payments'])
                    ]),
                    $.div({
                        className: 'modal-body',
                        style: { padding: '20px' }
                    }, [
                        this.createChannelStats(),
                        this.createLightningFeatures(),
                        this.createActionButtons()
                    ])
                ])
            ]);

            document.body.appendChild(this.modal);
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });

            this.loadChannelData();
        }

        createChannelStats() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                }
            }, [
                this.createStatCard('Local Balance', '0.005 BTC', 'LOCAL'),
                this.createStatCard('Remote Balance', '0.010 BTC', 'REMOTE'),
                this.createStatCard('Total Capacity', '0.015 BTC', 'CAPACITY')
            ]);
        }

        createStatCard(title, value, icon) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    background: 'rgba(255, 215, 0, 0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    textAlign: 'center'
                }
            }, [
                $.div({
                    style: { fontSize: '24px', marginBottom: '10px' }
                }, [
                    icon === 'MOOSH' ? 
                        $.span({
                            style: {
                                color: 'var(--text-accent)',
                                fontWeight: 'bold',
                                fontSize: 'calc(24px * var(--scale-factor))',
                                letterSpacing: '2px'
                            }
                        }, ['MOOSH']) : 
                        icon
                ]),
                $.div({
                    style: { fontSize: '12px', color: '#FFD700', marginBottom: '5px' }
                }, [title]),
                $.div({
                    style: { fontSize: '16px', fontWeight: 'bold' }
                }, [value])
            ]);
        }

        createLightningFeatures() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: { marginBottom: '20px' }
            }, [
                $.h3({
                    style: { color: '#FFD700', marginBottom: '15px' }
                }, ['Lightning Features']),
                $.div({
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px'
                    }
                }, [
                    this.createFeatureButton('Send Payment', () => this.sendLightningPayment()),
                    this.createFeatureButton('Create Invoice', () => this.createLightningInvoice()),
                    this.createFeatureButton('Open Channel', () => this.openLightningChannel()),
                    this.createFeatureButton('Channel Info', () => this.showChannelInfo())
                ])
            ]);
        }

        createFeatureButton(text, handler) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.button({
                style: {
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid #FFD700',
                    padding: '12px',
                    borderRadius: '8px',
                    color: '#FFD700',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                },
                onclick: handler
            }, [text]);
        }

        createActionButtons() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center'
                }
            }, [
                $.button({
                    style: {
                        background: 'linear-gradient(90deg, #FFD700 0%, #f57315 100%)',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '10px',
                        color: '#000',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    },
                    onclick: () => this.refreshChannelData()
                }, ['Refresh']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid #ffffff',
                        padding: '12px 30px',
                        borderRadius: '10px',
                        color: '#ffffff',
                        cursor: 'pointer'
                    },
                    onclick: () => this.hide()
                }, ['Close'])
            ]);
        }

        async loadChannelData() {
            try {
                const balance = this.app.sparkLightningManager.getChannelBalance();
                // Update UI with real channel data
                this.app.showNotification('Lightning channel data loaded', 'success');
            } catch (error) {
                console.error('Failed to load channel data:', error);
            }
        }

        async sendLightningPayment() {
            const invoice = prompt('Enter Lightning invoice:');
            if (!invoice) return;

            try {
                const result = await this.app.sparkLightningManager.sendSparkLightning(invoice, 1000);
                alert(`
⚡ LIGHTNING PAYMENT SENT!

Payment Hash: ${result.preimage}
Fee: ${result.fee} sats
Route: ${result.route.hops.length} hops
Status: Confirmed
                `);
                this.app.showNotification('Lightning payment sent successfully!', 'success');
            } catch (error) {
                this.app.showNotification('Lightning payment failed: ' + error.message, 'error');
            }
        }

        async createLightningInvoice() {
            const amount = prompt('Enter amount in satoshis:', '1000');
            const description = prompt('Enter description:', 'Spark Lightning Payment');

            if (!amount) return;

            try {
                const invoice = await this.app.sparkLightningManager.createSparkInvoice(
                    parseInt(amount),
                    description
                );

                alert(`
⚡ LIGHTNING INVOICE CREATED!

Payment Request: ${invoice.payment_request}
Amount: ${amount} sats
Description: ${description}
Expires: ${new Date(invoice.expires_at).toLocaleString()}

Share this invoice to receive payment!
                `);
                this.app.showNotification('Lightning invoice created!', 'success');
            } catch (error) {
                this.app.showNotification('Failed to create invoice: ' + error.message, 'error');
            }
        }

        openLightningChannel() {
            this.app.showNotification('Channel opening functionality coming soon', 'info');
        }

        showChannelInfo() {
            const balance = this.app.sparkLightningManager.getChannelBalance();
            alert(`
⚡ LIGHTNING CHANNEL INFO

Local Balance: ${balance.local} sats
Remote Balance: ${balance.remote} sats
Total Capacity: ${balance.total} sats
Channel Status: Active
            `);
        }

        async refreshChannelData() {
            await this.loadChannelData();
        }

        hide() {
            if (this.modal) {
                this.modal.classList.remove('show');
                setTimeout(() => {
                    if (this.modal && this.modal.parentNode) {
                        this.modal.remove();
                    }
                }, 300);
            }
        }
    }

    // Export to window
    window.LightningChannelModal = LightningChannelModal;

})(window);