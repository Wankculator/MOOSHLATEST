// SparkDashboardModal Module for MOOSH Wallet
// This modal displays the Spark Protocol dashboard with stats and features

(function(window) {
    'use strict';

    class SparkDashboardModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.sparkWallet = app.sparkWalletManager.activeWallet;
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
                    className: 'modal spark-dashboard-modal',
                    style: {
                        maxWidth: '900px',
                        height: '80vh',
                        background: 'linear-gradient(135deg, #0A0F25 0%, #1A2332 100%)', // SparkSat colors
                        borderRadius: '20px',
                        color: '#ffffff',
                        border: '1px solid #00D4FF'
                    }
                }, [
                    this.createHeader(),
                    this.createSparkStats(),
                    this.createFeatureGrid(),
                    this.createActionButtons()
                ])
            ]);

            document.body.appendChild(this.modal);
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });

            this.initializeSparkData();
        }

        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'modal-header spark-header',
                style: {
                    background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)',
                    padding: '20px',
                    borderRadius: '20px 20px 0 0',
                    color: '#000',
                    textAlign: 'center'
                }
            }, [
                $.h2({}, ['SPARK PROTOCOL DASHBOARD']),
                $.p({
                    style: { margin: '5px 0 0 0', opacity: '0.8' }
                }, ['Real Bitcoin Spark Integration - Authentic SparkSat Features'])
            ]);
        }

        createSparkStats() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'spark-stats-grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    padding: '20px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    margin: '0 20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                }
            }, [
                this.createStatCard('Bitcoin Balance', '0.00000000 BTC', '$0.00', '₿'),
                this.createStatCard('Spark Balance', '0.00000000 BTC', 'Layer 2', 'SPARK'),
                this.createStatCard('Lightning Balance', '0.00000000 BTC', 'Instant Payments', 'LN'),
                this.createStatCard('Total Value', '0.00000000 BTC', '$0.00', 'TOTAL')
            ]);
        }

        createStatCard(title, value, subtitle, icon) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'spark-stat-card',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    style: { fontSize: '12px', color: '#00D4FF', marginBottom: '5px' }
                }, [title]),
                $.div({
                    className: `${title.toLowerCase().replace(' ', '-')}-value`,
                    style: { fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }
                }, [value]),
                $.div({
                    style: { fontSize: '10px', opacity: '0.7' }
                }, [subtitle])
            ]);
        }

        createFeatureGrid() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'spark-features',
                style: {
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '15px'
                }
            }, [
                this.createFeatureCard(
                    'Spark Deposits',
                    'Deposit Bitcoin into Spark Protocol for instant Layer 2 transactions',
                    'Create Deposit',
                    () => this.handleSparkDeposit()
                ),
                this.createFeatureCard(
                    '⚡ Lightning Network',
                    'Open Lightning channels and make instant payments',
                    'Lightning Manager',
                    () => this.handleLightningManager()
                ),
                this.createFeatureCard(
                    'Spark Exits',
                    'Exit from Spark Protocol back to Bitcoin mainnet',
                    'Exit to Bitcoin',
                    () => this.handleSparkExit()
                ),
                this.createFeatureCard(
                    'Market Intelligence',
                    'Real-time Bitcoin and DeFi market data',
                    'Market Data',
                    () => this.handleMarketData()
                ),
                this.createFeatureCard(
                    'DeFi Integration',
                    'Access DeFi protocols through Spark',
                    'DeFi Dashboard',
                    () => this.handleDeFiIntegration()
                ),
                this.createFeatureCard(
                    'Advanced Security',
                    'Hardware wallet and multi-sig support',
                    'Security Settings',
                    () => this.handleSecurity()
                )
            ]);
        }

        createFeatureCard(title, description, buttonText, clickHandler) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'spark-feature-card',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                },
                onmouseenter: function() {
                    this.style.background = 'rgba(0, 212, 255, 0.1)';
                    this.style.borderColor = '#00D4FF';
                },
                onmouseleave: function() {
                    this.style.background = 'rgba(255, 255, 255, 0.05)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
            }, [
                $.h3({
                    style: { color: '#00D4FF', marginBottom: '10px', fontSize: '18px' }
                }, [title]),
                $.p({
                    style: { color: '#ffffff', opacity: '0.8', marginBottom: '15px', fontSize: '14px' }
                }, [description]),
                $.button({
                    className: 'spark-feature-btn',
                    style: {
                        background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        color: '#000',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%'
                    },
                    onclick: clickHandler
                }, [buttonText])
            ]);
        }

        createActionButtons() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'spark-actions',
                style: {
                    padding: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                }
            }, [
                $.button({
                    className: 'spark-action-btn primary',
                    style: {
                        background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '10px',
                        color: '#000',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    },
                    onclick: () => this.createNewSparkWallet()
                }, ['Create Spark Wallet']),
                $.button({
                    className: 'spark-action-btn secondary',
                    style: {
                        background: 'transparent',
                        border: '2px solid #00D4FF',
                        padding: '12px 30px',
                        borderRadius: '10px',
                        color: '#00D4FF',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    },
                    onclick: () => this.refreshSparkData()
                }, ['Refresh Data']),
                $.button({
                    className: 'spark-action-btn close',
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '12px 30px',
                        borderRadius: '10px',
                        color: '#ffffff',
                        cursor: 'pointer'
                    },
                    onclick: () => this.hide()
                }, ['Close'])
            ]);
        }

        async initializeSparkData() {
            try {
                // Initialize or get current Spark wallet
                if (!this.sparkWallet) {
                    this.sparkWallet = await this.app.sparkWalletManager.createSparkWallet();
                    this.app.showNotification('Spark wallet created successfully!', 'success');
                }

                // Update balance displays
                await this.updateSparkBalances();

            } catch (error) {
                console.error('Failed to initialize Spark data:', error);
                this.app.showNotification('Failed to initialize Spark Protocol', 'error');
            }
        }

        async updateSparkBalances() {
            try {
                const balance = await this.app.sparkWalletManager.getSparkBalance(this.sparkWallet?.id);

                // Update UI elements
                const bitcoinValue = document.querySelector('.bitcoin-balance-value');
                const sparkValue = document.querySelector('.spark-balance-value');
                const lightningValue = document.querySelector('.lightning-balance-value');
                const totalValue = document.querySelector('.total-value-value');

                if (bitcoinValue) bitcoinValue.textContent = `${(balance.bitcoin / 100000000).toFixed(8)} BTC`;
                if (sparkValue) sparkValue.textContent = `${(balance.spark / 100000000).toFixed(8)} BTC`;
                if (lightningValue) lightningValue.textContent = `${(balance.lightning / 100000000).toFixed(8)} BTC`;
                if (totalValue) totalValue.textContent = `${(balance.total / 100000000).toFixed(8)} BTC`;

            } catch (error) {
                console.error('Failed to update Spark balances:', error);
            }
        }

        async createNewSparkWallet() {
            try {
                const walletName = prompt('Enter wallet name:', 'My Spark Wallet');
                if (!walletName) return;

                const wallet = await this.app.sparkWalletManager.createSparkWallet(walletName);
                this.sparkWallet = wallet;

                this.app.showNotification(`Spark wallet "${walletName}" created successfully!`, 'success');
                await this.updateSparkBalances();

                // Show wallet details
                alert(`
🔥 SPARK WALLET CREATED!

Name: ${wallet.name}
Type: ${wallet.type}
Bitcoin Address: ${wallet.addresses.bitcoin}
Spark Address: ${wallet.addresses.spark}
Lightning Address: ${wallet.addresses.lightning}

Your wallet is ready for Spark Protocol operations!
                `);

            } catch (error) {
                console.error('Failed to create Spark wallet:', error);
                this.app.showNotification('Failed to create Spark wallet', 'error');
            }
        }

        async refreshSparkData() {
            this.app.showNotification('Refreshing Spark data...', 'info');
            await this.updateSparkBalances();
            this.app.showNotification('Spark data refreshed!', 'success');
        }

        handleSparkDeposit() {
            this.app.modalManager.createSparkDepositModal();
        }

        handleLightningManager() {
            this.app.modalManager.createLightningChannelModal();
        }

        handleSparkExit() {
            this.app.showNotification('Spark exit functionality coming soon', 'info');
        }

        handleMarketData() {
            this.app.showNotification('Market intelligence dashboard coming soon', 'info');
        }

        handleDeFiIntegration() {
            this.app.showNotification('DeFi integration coming soon', 'info');
        }

        handleSecurity() {
            this.app.showNotification('Advanced security settings coming soon', 'info');
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
    window.SparkDashboardModal = SparkDashboardModal;

})(window);