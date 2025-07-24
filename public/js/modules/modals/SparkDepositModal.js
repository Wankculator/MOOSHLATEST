// SparkDepositModal Module for MOOSH Wallet
// This modal handles Bitcoin deposits into the Spark Protocol Layer 2

(function(window) {
    'use strict';

    class SparkDepositModal {
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
                    className: 'modal spark-deposit-modal',
                    style: {
                        maxWidth: '500px',
                        background: '#0A0F25',
                        borderRadius: '20px',
                        color: '#ffffff',
                        border: '1px solid #00D4FF'
                    }
                }, [
                    $.div({
                        className: 'modal-header',
                        style: {
                            background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)',
                            padding: '20px',
                            borderRadius: '20px 20px 0 0',
                            color: '#000',
                            textAlign: 'center'
                        }
                    }, [
                        $.h2({}, ['Spark Protocol Deposit']),
                        $.p({}, ['Deposit Bitcoin into Spark for instant Layer 2 transactions'])
                    ]),
                    $.div({
                        className: 'modal-body',
                        style: { padding: '20px' }
                    }, [
                        $.div({
                            style: { marginBottom: '20px' }
                        }, [
                            $.label({
                                style: { display: 'block', marginBottom: '10px', color: '#00D4FF' }
                            }, ['Amount to Deposit (BTC)']),
                            $.input({
                                type: 'number',
                                step: '0.00000001',
                                placeholder: '0.00000000',
                                id: 'spark-deposit-amount',
                                style: {
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #00D4FF',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff'
                                }
                            })
                        ]),
                        $.div({
                            style: {
                                background: 'rgba(0, 212, 255, 0.1)',
                                padding: '15px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                border: '1px solid rgba(0, 212, 255, 0.3)'
                            }
                        }, [
                            $.h4({
                                style: { color: '#00D4FF', marginBottom: '10px' }
                            }, ['Spark Protocol Benefits']),
                            $.ul({
                                style: { margin: '0', paddingLeft: '20px' }
                            }, [
                                $.create('li', {}, ['Instant Layer 2 transactions']),
                                $.create('li', {}, ['Ultra-low fees (< 1 sat)']),
                                $.create('li', {}, ['7-day exit challenge period']),
                                $.create('li', {}, ['Non-custodial security'])
                            ])
                        ]),
                        $.div({
                            style: { display: 'flex', gap: '10px' }
                        }, [
                            $.button({
                                style: {
                                    flex: '1',
                                    background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                },
                                onclick: () => this.processSparkDeposit()
                            }, ['Create Deposit']),
                            $.button({
                                style: {
                                    flex: '0 0 auto',
                                    background: 'transparent',
                                    border: '1px solid #ffffff',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    cursor: 'pointer'
                                },
                                onclick: () => this.hide()
                            }, ['Cancel'])
                        ])
                    ])
                ])
            ]);

            document.body.appendChild(this.modal);
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });
        }

        async processSparkDeposit() {
            const amountInput = document.getElementById('spark-deposit-amount');
            const amount = parseFloat(amountInput.value);

            if (!amount || amount <= 0) {
                this.app.showNotification('Please enter a valid amount', 'error');
                return;
            }

            try {
                this.app.showNotification('Creating Spark deposit transaction...', 'info');

                // Create Spark deposit transaction
                const transaction = await this.app.sparkBitcoinManager.createSparkDeposit(
                    Math.floor(amount * 100000000), // Convert to satoshis
                    'bc1quser_bitcoin_address' // User's Bitcoin address
                );

                // Show transaction details
                alert(`
🔥 SPARK DEPOSIT CREATED!

Transaction ID: ${transaction.txid}
Amount: ${amount} BTC
Spark Address: ${transaction.outputs[0].address}
Status: Pending confirmation

Your Bitcoin will be available on Spark Layer 2 after 1 confirmation!
                `);

                this.app.showNotification('Spark deposit transaction created!', 'success');
                this.hide();

            } catch (error) {
                console.error('Failed to create Spark deposit:', error);
                this.app.showNotification('Failed to create Spark deposit', 'error');
            }
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
    window.SparkDepositModal = SparkDepositModal;

})(window);