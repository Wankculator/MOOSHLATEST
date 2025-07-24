// MOOSH WALLET - Dashboard Page Module
// Main wallet interface that ties all components together
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class DashboardPage extends Component {
        constructor(app) {
            super(app);
            
            // Create debounced version of updateLiveData
            this.debouncedUpdateLiveData = ComplianceUtils.debounce(() => {
                this.updateLiveData();
            }, 300);
            
            // Component instances
            this.transactionHistory = null;
            this.ordinalsManager = new OrdinalsManager(app);
        }
        
        afterMount() {
            // Start updating live data
            this.updateLiveData();
            
            // Set up interval to update live data every 30 seconds
            this.liveDataInterval = setInterval(() => {
                this.updateLiveData();
            }, 30000);
            
            // Listen for account changes
            this.listenToState('currentAccountId', (newAccountId, oldAccountId) => {
                ComplianceUtils.log('DashboardPage', 'Account changed from ' + oldAccountId + ' to ' + newAccountId, 'info');
                this.updateAccountDisplay();
                this.loadCurrentAccountData();
            });
            
            // Load initial data
            setTimeout(() => {
                this.loadCurrentAccountData();
                this.refreshBalances();
                this.initializeOrdinalsDisplay();
            }, 100);
            
            // Listen for accounts array changes
            this.listenToState('accounts', (newAccounts, oldAccounts) => {
                ComplianceUtils.log('DashboardPage', 'Accounts array changed', 'info');
                this.updateAccountDisplay();
            });
            
            // Initialize wallet type
            setTimeout(() => {
                const savedType = localStorage.getItem('selectedWalletType') || 'nativeSegWit';
                this.app.state.set('selectedWalletType', savedType);
                this.updateAddressDisplay();
            }, 100);
        }
        
        unmount() {
            // Clean up interval
            if (this.liveDataInterval) {
                clearInterval(this.liveDataInterval);
                this.liveDataInterval = null;
            }
            
            // Call parent unmount
            super.unmount();
        }
        
        render() {
            const $ = window.ElementFactory || window.$;
            
            // Check if wallet exists
            const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            // Verify wallet exists
            const hasSparkWallet = sparkWallet && sparkWallet.addresses && (sparkWallet.addresses.bitcoin || sparkWallet.addresses.spark);
            const hasSeed = Array.isArray(generatedSeed) && generatedSeed.length > 0;
            const hasCurrentWallet = currentWallet && currentWallet.isInitialized;
            
            if (!hasSparkWallet && !hasSeed && !hasCurrentWallet) {
                ComplianceUtils.log('Dashboard', 'No wallet found, redirecting to home');
                this.app.showNotification('Please create or import a wallet first', 'warning');
                this.app.router.navigate('home');
                return $.div();
            }
            
            // Check lock status
            const hasPassword = localStorage.getItem('walletPassword');
            const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
            
            // If locked, router should handle lock screen
            if (hasPassword && !isUnlocked) {
                return $.div();
            }
            
            // Render dashboard
            const dashboardContainer = $.div({ className: 'dashboard-container' }, [
                $.div({ className: 'card dashboard-page' }, [
                    this.createDashboard()
                ])
            ]);
            
            // Initialize functionality after render
            setTimeout(() => {
                this.initializeDashboard();
            }, 100);

            return dashboardContainer;
        }
        
        createDashboard() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'wallet-dashboard-container' }, [
                this.createDashboardHeader(),
                this.createDashboardContent()
            ]);
        }
        
        createDashboardHeader() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ 
                className: 'terminal-box dashboard-terminal-box', 
                style: {
                    marginBottom: '20px',
                    overflow: 'visible',
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#000000',
                    border: '1px solid #f57315',
                    borderRadius: '0',
                    position: 'relative',
                    zIndex: '10'
                }
            }, [
                // Terminal header
                $.div({ 
                    className: 'terminal-header',
                    style: {
                        padding: '8px 12px',
                        borderBottom: '1px solid #333333',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.handleTerminalClick(),
                    onmouseover: (e) => {
                        e.currentTarget.style.background = 'rgba(245, 115, 21, 0.1)';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '';
                    }
                }, [
                    $.span({ style: 'color: #666666;' }, ['~/moosh/wallet/dashboard $'])
                ]),
                
                // Main content
                $.div({ 
                    className: 'terminal-content',
                    style: {
                        padding: '12px 16px',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'visible',
                        position: 'relative'
                    }
                }, [
                    // Account info and balance
                    this.createAccountSection(),
                    this.createBalanceSection(),
                    this.createWalletTypeSelector()
                ])
            ]);
        }
        
        createAccountSection() {
            const $ = window.ElementFactory || window.$;
            const currentAccount = this.app.state.getCurrentAccount();
            
            return $.div({
                id: 'account-display-section',
                style: {
                    marginBottom: 'calc(16px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                }, [
                    $.h2({
                        id: 'account-name-display',
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(20px * var(--scale-factor))',
                            margin: 0
                        }
                    }, [currentAccount?.name || 'Main Account']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-dim)',
                            color: 'var(--text-dim)',
                            padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        },
                        onclick: () => this.showAccountMenu()
                    }, ['Manage'])
                ])
            ]);
        }
        
        createBalanceSection() {
            const $ = window.ElementFactory || window.$;
            const balance = this.app.state.get('currentBalance') || 0;
            const btcPrice = this.app.state.get('bitcoinPrice') || 0;
            const usdValue = balance * btcPrice;
            
            return $.div({
                id: 'balance-section',
                style: {
                    textAlign: 'center',
                    padding: 'calc(24px * var(--scale-factor)) 0',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: 'calc(16px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        fontSize: 'calc(36px * var(--scale-factor))',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, [`${balance.toFixed(8)} BTC`]),
                $.div({
                    style: {
                        fontSize: 'calc(20px * var(--scale-factor))',
                        color: 'var(--text-dim)'
                    }
                }, [`≈ $${usdValue.toFixed(2)} USD`]),
                $.div({
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        color: 'var(--text-dim)',
                        marginTop: 'calc(8px * var(--scale-factor))'
                    }
                }, [`1 BTC = $${btcPrice.toFixed(2)}`])
            ]);
        }
        
        createWalletTypeSelector() {
            const $ = window.ElementFactory || window.$;
            const selectedType = this.app.state.get('selectedWalletType') || 'nativeSegWit';
            
            return $.div({
                style: {
                    marginBottom: 'calc(16px * var(--scale-factor))'
                }
            }, [
                $.label({
                    style: {
                        display: 'block',
                        color: 'var(--text-dim)',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['Wallet Type']),
                $.select({
                    id: 'wallet-type-selector',
                    style: {
                        width: '100%',
                        padding: 'calc(8px * var(--scale-factor))',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontFamily: 'monospace',
                        cursor: 'pointer'
                    },
                    value: selectedType,
                    onchange: (e) => this.handleWalletTypeChange(e.target.value)
                }, [
                    $.option({ value: 'spark' }, ['Spark Protocol (Lightning)']),
                    $.option({ value: 'taproot' }, ['Bitcoin Taproot (P2TR)']),
                    $.option({ value: 'nativeSegWit' }, ['Bitcoin Native SegWit (P2WPKH)']),
                    $.option({ value: 'nestedSegWit' }, ['Bitcoin Nested SegWit (P2SH)']),
                    $.option({ value: 'legacy' }, ['Bitcoin Legacy (P2PKH)'])
                ])
            ]);
        }
        
        createDashboardContent() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ 
                className: 'dashboard-content',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(20px * var(--scale-factor))'
                }
            }, [
                // Quick actions
                this.createQuickActionsBar(),
                
                // Address display
                this.createAddressDisplay(),
                
                // Transaction history
                this.createTransactionHistory(),
                
                // Ordinals section (if taproot)
                this.createOrdinalsSection()
            ]);
        }
        
        createQuickActionsBar() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                className: 'quick-actions-bar',
                style: {
                    display: 'flex',
                    gap: 'calc(12px * var(--scale-factor))',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }
            }, [
                $.button({
                    className: 'action-button',
                    style: {
                        flex: '1',
                        minWidth: 'calc(120px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor))',
                        background: 'transparent',
                        border: '2px solid var(--text-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.handleSend(),
                    onmouseover: function() {
                        this.style.background = 'var(--text-primary)';
                        this.style.color = 'var(--bg-primary)';
                    },
                    onmouseout: function() {
                        this.style.background = 'transparent';
                        this.style.color = 'var(--text-primary)';
                    }
                }, ['↗ Send']),
                
                $.button({
                    className: 'action-button',
                    style: {
                        flex: '1',
                        minWidth: 'calc(120px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor))',
                        background: 'transparent',
                        border: '2px solid var(--text-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.handleReceive(),
                    onmouseover: function() {
                        this.style.background = 'var(--text-primary)';
                        this.style.color = 'var(--bg-primary)';
                    },
                    onmouseout: function() {
                        this.style.background = 'transparent';
                        this.style.color = 'var(--text-primary)';
                    }
                }, ['↙ Receive']),
                
                $.button({
                    className: 'action-button',
                    style: {
                        flex: '1',
                        minWidth: 'calc(120px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor))',
                        background: 'transparent',
                        border: '2px solid var(--text-dim)',
                        color: 'var(--text-dim)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.handleSettings(),
                    onmouseover: function() {
                        this.style.background = 'var(--text-dim)';
                        this.style.color = 'var(--bg-primary)';
                    },
                    onmouseout: function() {
                        this.style.background = 'transparent';
                        this.style.color = 'var(--text-dim)';
                    }
                }, ['⚙ Settings'])
            ]);
        }
        
        createAddressDisplay() {
            const $ = window.ElementFactory || window.$;
            const currentAccount = this.app.state.getCurrentAccount();
            const selectedType = this.app.state.get('selectedWalletType') || 'nativeSegWit';
            const address = this.getSelectedAddress();
            
            return $.div({
                id: 'address-display-section',
                style: {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    $.label({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(12px * var(--scale-factor))'
                        }
                    }, ['Current Address']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-dim)',
                            color: 'var(--text-dim)',
                            padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                            fontSize: 'calc(11px * var(--scale-factor))',
                            cursor: 'pointer'
                        },
                        onclick: () => this.copyAddress(address)
                    }, ['Copy'])
                ]),
                $.div({
                    id: 'current-address-display',
                    style: {
                        fontFamily: 'monospace',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        color: 'var(--text-primary)',
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                    }
                }, [address || 'Loading...'])
            ]);
        }
        
        createTransactionHistory() {
            // Use the TransactionHistory component
            this.transactionHistory = new TransactionHistory(this.app);
            return this.transactionHistory.render();
        }
        
        createOrdinalsSection() {
            const $ = window.ElementFactory || window.$;
            const selectedType = this.app.state.get('selectedWalletType');
            
            // Only show for taproot addresses
            if (selectedType !== 'taproot') {
                return $.div();
            }
            
            return $.div({
                id: 'ordinals-section',
                style: {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))',
                    marginTop: 'calc(20px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(16px * var(--scale-factor))',
                            margin: 0
                        }
                    }, ['Ordinals/Inscriptions']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-dim)',
                            color: 'var(--text-dim)',
                            padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            cursor: 'pointer'
                        },
                        onclick: () => this.showOrdinalsGallery()
                    }, ['View All'])
                ]),
                $.div({
                    id: 'ordinals-count-display',
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(14px * var(--scale-factor))'
                    }
                }, ['Checking for inscriptions...'])
            ]);
        }
        
        // Event handlers
        handleSend() {
            const modal = new SendModal(this.app);
            modal.show();
        }
        
        handleReceive() {
            const selectedType = this.app.state.get('selectedWalletType') || 'nativeSegWit';
            const modal = new ReceiveModal(this.app, selectedType);
            modal.show();
        }
        
        handleSettings() {
            const modal = new WalletSettingsModal(this.app);
            modal.show();
        }
        
        handleTerminalClick() {
            // Toggle terminal display or show commands
            this.app.showNotification('Terminal commands coming soon', 'info');
        }
        
        handleWalletTypeChange(newType) {
            this.app.state.set('selectedWalletType', newType);
            localStorage.setItem('selectedWalletType', newType);
            
            // Update displays
            this.updateAddressDisplay();
            this.refreshBalances();
            
            // Update ordinals section visibility
            const ordinalsSection = document.getElementById('ordinals-section');
            if (ordinalsSection) {
                ordinalsSection.style.display = newType === 'taproot' ? 'block' : 'none';
            }
        }
        
        showAccountMenu() {
            this.app.showNotification('Account management coming soon', 'info');
        }
        
        showOrdinalsGallery() {
            const modal = new OrdinalsModal(this.app);
            modal.show();
        }
        
        copyAddress(address) {
            if (!address) return;
            
            navigator.clipboard.writeText(address).then(() => {
                this.app.showNotification('Address copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.app.showNotification('Failed to copy address', 'error');
            });
        }
        
        // Data management methods
        async updateLiveData() {
            try {
                // Update Bitcoin price
                const price = await this.app.getBitcoinPrice();
                this.app.state.set('bitcoinPrice', price);
                
                // Update balance display
                this.updateBalanceDisplay();
            } catch (error) {
                console.error('Failed to update live data:', error);
            }
        }
        
        async loadCurrentAccountData() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount) return;
            
            // Load balance
            await this.refreshBalances();
            
            // Load transactions
            if (this.transactionHistory) {
                await this.transactionHistory.loadTransactions();
            }
        }
        
        async refreshBalances() {
            try {
                const currentAccount = this.app.state.getCurrentAccount();
                if (!currentAccount) return;
                
                const selectedType = this.app.state.get('selectedWalletType') || 'nativeSegWit';
                const address = this.getSelectedAddress();
                
                if (!address || address === 'Not available') return;
                
                // Fetch balance from API
                const response = await this.app.apiService.request('/api/bitcoin/balance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                });
                
                if (response.success) {
                    const balance = response.data.balance / 100000000; // Convert satoshis to BTC
                    this.app.state.set('currentBalance', balance);
                    this.updateBalanceDisplay();
                }
            } catch (error) {
                console.error('Failed to refresh balance:', error);
            }
        }
        
        updateBalanceDisplay() {
            const balance = this.app.state.get('currentBalance') || 0;
            const btcPrice = this.app.state.get('bitcoinPrice') || 0;
            const usdValue = balance * btcPrice;
            
            const balanceSection = document.getElementById('balance-section');
            if (!balanceSection) return;
            
            const $ = window.ElementFactory || window.$;
            
            balanceSection.innerHTML = '';
            balanceSection.appendChild(
                $.div({}, [
                    $.div({
                        style: {
                            fontSize: 'calc(36px * var(--scale-factor))',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            marginBottom: 'calc(8px * var(--scale-factor))'
                        }
                    }, [`${balance.toFixed(8)} BTC`]),
                    $.div({
                        style: {
                            fontSize: 'calc(20px * var(--scale-factor))',
                            color: 'var(--text-dim)'
                        }
                    }, [`≈ $${usdValue.toFixed(2)} USD`]),
                    $.div({
                        style: {
                            fontSize: 'calc(14px * var(--scale-factor))',
                            color: 'var(--text-dim)',
                            marginTop: 'calc(8px * var(--scale-factor))'
                        }
                    }, [`1 BTC = $${btcPrice.toFixed(2)}`])
                ])
            );
        }
        
        updateAccountDisplay() {
            const currentAccount = this.app.state.getCurrentAccount();
            const nameDisplay = document.getElementById('account-name-display');
            
            if (nameDisplay && currentAccount) {
                nameDisplay.textContent = currentAccount.name || 'Main Account';
            }
        }
        
        updateAddressDisplay() {
            const address = this.getSelectedAddress();
            const addressDisplay = document.getElementById('current-address-display');
            
            if (addressDisplay) {
                addressDisplay.textContent = address || 'Not available';
            }
        }
        
        getSelectedAddress() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount) return 'Not available';
            
            const selectedType = this.app.state.get('selectedWalletType') || 'nativeSegWit';
            
            // Get address based on selected type
            switch (selectedType) {
                case 'spark':
                    return currentAccount.addresses?.spark || currentAccount.sparkAddress || 'Not available';
                case 'taproot':
                    return currentAccount.addresses?.taproot || currentAccount.taprootAddress || 'Not available';
                case 'nativeSegWit':
                    return currentAccount.addresses?.segwit || currentAccount.bitcoinAddress || 'Not available';
                case 'nestedSegWit':
                    return currentAccount.addresses?.nestedSegwit || currentAccount.nestedSegWitAddress || 'Not available';
                case 'legacy':
                    return currentAccount.addresses?.legacy || currentAccount.legacyAddress || 'Not available';
                default:
                    return currentAccount.address || currentAccount.bitcoinAddress || 'Not available';
            }
        }
        
        async initializeOrdinalsDisplay() {
            const selectedType = this.app.state.get('selectedWalletType');
            if (selectedType !== 'taproot') return;
            
            const result = await this.ordinalsManager.fetchOrdinalsCount();
            const countDisplay = document.getElementById('ordinals-count-display');
            
            if (countDisplay) {
                if (result.count > 0) {
                    countDisplay.textContent = `You have ${result.count} inscriptions`;
                    countDisplay.style.color = 'var(--text-accent)';
                } else {
                    countDisplay.textContent = 'No inscriptions found';
                }
            }
        }
        
        initializeDashboard() {
            // Any additional initialization after render
            this.updateAddressDisplay();
            this.updateBalanceDisplay();
            this.updateAccountDisplay();
        }
    }

    // Make available globally
    window.DashboardPage = DashboardPage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.DashboardPage = DashboardPage;
    }

})(window);