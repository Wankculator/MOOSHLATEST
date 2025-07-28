/**
 * DashboardPage Module
 * 
 * The main dashboard component for MOOSH Wallet.
 * Displays wallet balances, transaction history, and provides access to all wallet features.
 * 
 * Dependencies:
 * - Component (base class)
 * - ElementFactory ($)
 * - ComplianceUtils
 * - ResponsiveUtils
 * - Various Modal classes (SendModal, ReceiveModal, etc.)
 * - AccountSwitcher
 */

(function(window) {
    'use strict';

    // Import dependencies from window
    const Component = window.Component;
    const $ = window.ElementFactory || window.$;
    const ComplianceUtils = window.ComplianceUtils;
    const ResponsiveUtils = window.ResponsiveUtils;
    
    // Modal dependencies (will be loaded dynamically)
    const SendModal = window.SendModal;
    const ReceiveModal = window.ReceiveModal;
    const WalletSettingsModal = window.WalletSettingsModal;
    const TransactionHistoryModal = window.TransactionHistoryModal;
    const TokenMenuModal = window.TokenMenuModal;
    const OrdinalsModal = window.OrdinalsModal;
    const MultiAccountModal = window.MultiAccountModal;
    const AccountSwitcher = window.AccountSwitcher;

        class DashboardPage extends Component {
        constructor(app) {
            super(app);
            
            // Create debounced version of updateLiveData early to avoid errors
            this.debouncedUpdateLiveData = ComplianceUtils.debounce(() => {
                this.updateLiveData();
            }, 300);
        }
        
        afterMount() {
            // Start updating live data (BTC price, etc.)
            this.updateLiveData();
            
            // Set up interval to update live data every 30 seconds
            this.liveDataInterval = setInterval(() => {
                this.updateLiveData();
            }, 30000);
            
            // Listen for account changes using reactive state
            this.listenToState('currentAccountId', (newAccountId, oldAccountId) => {
                ComplianceUtils.log('DashboardPage', 'Account changed from ' + oldAccountId + ' to ' + newAccountId, 'info');
                this.updateAccountDisplay();
                this.loadCurrentAccountData();
            });
            
            // Load initial account data after mount
            setTimeout(() => {
                this.loadCurrentAccountData();
                // Also refresh balances on initial load
                if (this.refreshBalances) {
                    this.refreshBalances().then(() => {
                        // Refresh the chart after balance is loaded
                        const chartSection = document.getElementById('balanceChartSection');
                        if (chartSection) {
                            while (chartSection.firstChild) {
                                chartSection.removeChild(chartSection.firstChild);
                            }
                            const newChart = this.createBalanceChart();
                            chartSection.appendChild(newChart);
                        }
                    });
                } else {
                    // Ensure refreshBalances is called even if not yet defined
                    setTimeout(() => {
                        if (this.refreshBalances) {
                            this.refreshBalances();
                        }
                    }, 1000);
                }
                
                // Check for Taproot address and initialize Ordinals
                this.initializeOrdinalsDisplay();
            }, 100);
            
            // Also listen for accounts array changes (for renaming)
            this.listenToState('accounts', (newAccounts, oldAccounts) => {
                ComplianceUtils.log('DashboardPage', 'Accounts array changed', 'info');
                this.updateAccountDisplay();
            });
            
            // Keep backward compatibility with event listener
            this.accountSwitchHandler = (account) => {
                console.log('[DashboardPage] Account switched event:', account.name);
                this.updateAccountDisplay();
                this.loadCurrentAccountData();
            };
            
            // Listen for wallet change events
            this.walletChangeHandler = (e) => {
                console.log('[DashboardPage] Wallet changed:', e.detail);
                // Update wallet name display
                const walletNameElement = document.querySelector('#walletNameDisplay');
                if (walletNameElement && e.detail.walletName) {
                    walletNameElement.textContent = e.detail.walletName;
                }
                // Refresh account display since accounts changed
                this.updateAccountDisplay();
                this.loadCurrentAccountData();
            };
            window.addEventListener('walletChanged', this.walletChangeHandler);
            
            // Subscribe to account switch events as well
            this.app.state.on('accountSwitched', this.accountSwitchHandler);
            
            // Initialize the address display and wallet type on mount
            setTimeout(() => {
                // Ensure correct wallet type is selected (default to nativeSegWit for your address)
                const savedType = localStorage.getItem('selectedWalletType') || 'nativeSegWit';
                this.app.state.set('selectedWalletType', savedType);
                
                // Update the selector if it exists
                const selector = document.getElementById('walletTypeSelector') || document.getElementById('wallet-type-selector');
                if (selector) {
                    selector.value = savedType;
                }
                
                this.updateAddressDisplay();
                
                // Also refresh balances for the selected wallet type
                if (this.refreshBalances) {
                    setTimeout(() => this.refreshBalances(), 500);
                }
            }, 100);
        }
        
        unmount() {
            // Clean up listener
            if (this.accountSwitchHandler) {
                this.app.state.off('accountSwitched', this.accountSwitchHandler);
            }
            
            // Clean up live data interval
            if (this.liveDataInterval) {
                clearInterval(this.liveDataInterval);
                this.liveDataInterval = null;
            }
            
            // Call parent unmount
            super.unmount();
        }
        
        destroy() {
            console.log('[DashboardPage] Destroying dashboard - cleaning up intervals');
            
            // Stop all intervals
            if (this.stopAutoRefresh) {
                this.stopAutoRefresh();
            }
            
            // Clean up any other intervals that might be running
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
            
            if (this.priceInterval) {
                clearInterval(this.priceInterval);
                this.priceInterval = null;
            }
            
            if (this.mempoolInterval) {
                clearInterval(this.mempoolInterval);
                this.mempoolInterval = null;
            }
            
            // Remove event listeners
            if (this.accountSwitchHandler) {
                this.app.state.off('accountSwitched', this.accountSwitchHandler);
            }
            
            // Remove wallet change listener
            if (this.walletChangeHandler) {
                window.removeEventListener('walletChanged', this.walletChangeHandler);
            }
            
            // Call parent destroy to clean up state listeners
            super.destroy();
        }
        
        render() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Check if wallet exists before rendering dashboard
            const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            ComplianceUtils.log('Dashboard', 'Wallet check initiated');
            ComplianceUtils.log('Dashboard', '- sparkWallet exists: ' + (sparkWallet ? 'yes' : 'no'));
            ComplianceUtils.log('Dashboard', '- addresses found: ' + (sparkWallet?.addresses ? 'yes' : 'no'));
            ComplianceUtils.log('Dashboard', '- Wallet initialized: ' + (generatedSeed.length > 0 ? 'yes' : 'no'));
            ComplianceUtils.log('Dashboard', '- currentWallet exists: ' + (currentWallet ? 'yes' : 'no'));
            
            // If no wallet exists, redirect to home
            // Check multiple conditions to ensure wallet exists
            const hasSparkWallet = sparkWallet && sparkWallet.addresses && (sparkWallet.addresses.bitcoin || sparkWallet.addresses.spark);
            const hasSeed = Array.isArray(generatedSeed) && generatedSeed.length > 0;
            const hasCurrentWallet = currentWallet && currentWallet.isInitialized;
            
            if (!hasSparkWallet && !hasSeed && !hasCurrentWallet) {
                ComplianceUtils.log('Dashboard', 'No wallet found, redirecting to home');
                ComplianceUtils.log('Dashboard', '- hasSparkWallet: ' + hasSparkWallet);
                ComplianceUtils.log('Dashboard', '- Has valid wallet: ' + hasSeed);
                ComplianceUtils.log('Dashboard', '- hasCurrentWallet: ' + hasCurrentWallet);
                this.app.showNotification('Please create or import a wallet first', 'warning');
                this.app.router.navigate('home');
                return $.div();
            }
            
            // Check lock status BEFORE creating any content
            const hasPassword = localStorage.getItem('walletPassword');
            const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
            
            console.log('[Dashboard] Security Check:');
            console.log('  - Has password:', !!hasPassword);
            console.log('  - Is unlocked:', isUnlocked);
            console.log('  - Will show lock:', hasPassword && !isUnlocked);
            
            // If wallet has password and is not unlocked, show ONLY lock screen
            if (hasPassword && !isUnlocked) {
                console.log('[Dashboard] Wallet locked - showing lock screen');
                console.log('[Dashboard] Password protected wallet detected');
                
                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
                
                // Create a full viewport container for the lock screen
                const lockContainer = $.div({
                    style: {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        background: 'var(--bg-primary)',
                        zIndex: '999999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                });
                
                // Create and mount the lock screen
                const lockScreen = new WalletLockScreen(this.app);
                const lockElement = lockScreen.render();
                
                // Ensure lock element fills container
                lockElement.style.width = '100%';
                lockElement.style.height = '100%';
                
                lockContainer.appendChild(lockElement);
                
                // Add debug indicator
                console.log('[Dashboard] Lock screen element created:', !!lockElement);
                console.log('[Dashboard] Lock screen container created:', !!lockContainer);
                
                // Add visual debug indicator if lock screen fails
                if (!lockElement || !lockContainer) {
                    return $.div({
                        style: {
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            width: '100vw',
                            height: '100vh',
                            background: '#ff0000',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontFamily: 'JetBrains Mono, monospace',
                            zIndex: '999999'
                        }
                    }, ['LOCK SCREEN ERROR - Check Console']);
                }
                
                // Focus password input after mount
                setTimeout(() => {
                    const passwordInput = document.getElementById('lockPassword');
                    if (passwordInput) {
                        passwordInput.focus();
                        console.log('[Dashboard] Password input focused');
                    } else {
                        console.error('[Dashboard] Password input NOT FOUND!');
                    }
                }, 100);
                
                return lockContainer;
            }
            
            // Wallet is unlocked or no password - show dashboard
            console.log('[Dashboard] Wallet unlocked - showing dashboard');
            document.body.style.overflow = 'auto';
            
            // Create dashboard container
            const dashboardContainer = $.div({ 
                className: 'dashboard-container',
                style: {
                    position: 'relative',
                    zIndex: '1'
                }
            }, [
                $.div({ className: 'card dashboard-page' }, [
                    this.createDashboard()
                ])
            ]);
            
            // Initialize dashboard functionality
            setTimeout(() => {
                this.initializeDashboard();
            }, 100);

            return dashboardContainer;
        }
        
        createDashboard() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'wallet-dashboard-container' }, [
                this.createDashboardHeader(),
                this.createDashboardContent()
            ]);
        }
        
        createDashboardHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Get current responsive breakpoint
            const breakpoint = ResponsiveUtils.getBreakpoint();
            const isXS = breakpoint === 'xs';
            const isSM = breakpoint === 'sm';
            const isCompact = isXS || isSM;
            
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
                // Terminal header with path
                $.div({ 
                    className: 'terminal-header',
                    style: {
                        padding: '8px 12px',
                        borderBottom: '1px solid #333333',
                        fontSize: isXS ? '10px' : '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.handleTerminalClick(),
                    onmouseover: (e) => {
                        e.currentTarget.style.background = 'rgba(245, 115, 21, 0.1)';
                        const span = e.currentTarget.querySelector('span');
                        if (span) span.style.color = '#f57315';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '';
                        const span = e.currentTarget.querySelector('span');
                        if (span) span.style.color = '#666666';
                    },
                    title: 'Click to show terminal commands'
                }, [
                    $.span({ style: 'color: #666666;' }, ['~/moosh/wallet/dashboard $'])
                ]),
                
                // Main content area
                $.div({ 
                    className: 'terminal-content',
                    style: {
                        padding: isXS ? '8px 12px' : '12px 16px',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'visible',
                        position: 'relative'
                    }
                }, [
                    // Dashboard header row
                    $.div({ 
                        className: 'dashboard-header-row',
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            marginBottom: 'calc(8px * var(--scale-factor))',
                            gap: 'calc(8px * var(--scale-factor))',
                            flexWrap: 'nowrap',
                            padding: '0 calc(16px * var(--scale-factor))'
                        }
                    }, [
                        // Centered container for all controls
                        $.div({ 
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'calc(8px * var(--scale-factor))',
                                flexShrink: 0
                            }
                        }, [
                            // Account switcher
                            $.div({ 
                                id: 'accountSwitcherContainer',
                                style: {
                                    display: 'inline-block',
                                    position: 'relative',
                                    overflow: 'visible',
                                    zIndex: '1000'
                                }
                            }),
                            
                            // Action buttons
                            // Temporary: Add Account button until AccountListModal is complete
                            $.button({
                                className: 'dashboard-btn',
                                style: {
                                    padding: 'calc(5px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                                    fontSize: 'calc(10px * var(--scale-factor))',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    background: 'var(--bg-primary)',
                                    border: 'calc(1px * var(--scale-factor)) solid #69fd97',
                                    color: '#69fd97',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    minWidth: 'calc(70px * var(--scale-factor))',
                                    height: 'calc(24px * var(--scale-factor))',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    lineHeight: '1'
                                },
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = '#69fd97';
                                    e.currentTarget.style.color = '#000000';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = '#000000';
                                    e.currentTarget.style.color = '#69fd97';
                                },
                                onclick: () => this.showMultiAccountManager(),
                                title: 'Manage Accounts'
                            }, ['Manage']),
                            
                            // Refresh button
                            $.button({
                                className: 'dashboard-btn',
                                style: {
                                    padding: isXS ? 'calc(3px * var(--scale-factor)) calc(5px * var(--scale-factor))' : 'calc(5px * var(--scale-factor)) calc(7px * var(--scale-factor))',
                                    fontSize: isXS ? 'calc(9px * var(--scale-factor))' : 'calc(10px * var(--scale-factor))',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    background: 'var(--bg-primary)',
                                    border: 'calc(1px * var(--scale-factor)) solid #f57315',
                                    color: '#f57315',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    minWidth: isXS ? 'calc(25px * var(--scale-factor))' : 'calc(50px * var(--scale-factor))',
                                    height: isXS ? 'calc(20px * var(--scale-factor))' : 'calc(24px * var(--scale-factor))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box'
                                },
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = '#f57315';
                                    e.currentTarget.style.color = '#000000';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = '#000000';
                                    e.currentTarget.style.color = '#f57315';
                                },
                                onclick: () => this.handleRefresh(),
                                title: 'Refresh Data'
                            }, [isXS ? 'R' : 'Refresh']),
                            
                            // Currency selector button
                            $.button({
                                className: 'dashboard-btn',
                                style: {
                                    padding: isXS ? 'calc(3px * var(--scale-factor)) calc(5px * var(--scale-factor))' : 'calc(5px * var(--scale-factor)) calc(7px * var(--scale-factor))',
                                    fontSize: isXS ? 'calc(9px * var(--scale-factor))' : 'calc(10px * var(--scale-factor))',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    background: 'var(--bg-primary)',
                                    border: 'calc(1px * var(--scale-factor)) solid #f57315',
                                    color: '#f57315',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    minWidth: isXS ? 'calc(32px * var(--scale-factor))' : 'calc(45px * var(--scale-factor))',
                                    height: isXS ? 'calc(20px * var(--scale-factor))' : 'calc(24px * var(--scale-factor))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    position: 'relative'
                                },
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = '#f57315';
                                    e.currentTarget.style.color = '#000000';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = '#000000';
                                    e.currentTarget.style.color = '#f57315';
                                },
                                onclick: (e) => this.showCurrencyDropdown(e),
                                title: 'Select Currency'
                            }, [
                                $.span({}, [(localStorage.getItem('mooshPreferredCurrency') || 'USD').toUpperCase()])
                            ]),
                            
                            // Hide/Show button
                            $.button({
                                className: 'dashboard-btn',
                                style: {
                                    padding: isXS ? 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))' : 'calc(5px * var(--scale-factor)) calc(10px * var(--scale-factor))',
                                    fontSize: isXS ? 'calc(9px * var(--scale-factor))' : 'calc(10px * var(--scale-factor))',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    background: 'var(--bg-primary)',
                                    border: 'calc(1px * var(--scale-factor)) solid #f57315',
                                    color: '#f57315',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    height: isXS ? 'calc(20px * var(--scale-factor))' : 'calc(24px * var(--scale-factor))',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    overflow: 'visible'
                                },
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = '#f57315';
                                    e.currentTarget.style.color = '#000000';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = '#000000';
                                    e.currentTarget.style.color = '#f57315';
                                },
                                onclick: () => this.toggleBalanceVisibility(),
                                title: 'Toggle Balance Visibility'
                            }, [this.app.state.get('isBalanceHidden') ? 'Show' : 'Hide']),
                            
                            // Manage Wallets button
                            $.button({
                                className: 'dashboard-btn',
                                style: {
                                    padding: isXS ? 'calc(3px * var(--scale-factor)) calc(5px * var(--scale-factor))' : 'calc(5px * var(--scale-factor)) calc(7px * var(--scale-factor))',
                                    fontSize: isXS ? 'calc(9px * var(--scale-factor))' : 'calc(10px * var(--scale-factor))',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    background: 'var(--bg-primary)',
                                    border: 'calc(1px * var(--scale-factor)) solid #ff44ff',
                                    color: '#ff44ff',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    minWidth: isXS ? 'calc(40px * var(--scale-factor))' : 'calc(70px * var(--scale-factor))',
                                    height: isXS ? 'calc(20px * var(--scale-factor))' : 'calc(24px * var(--scale-factor))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box'
                                },
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = '#ff44ff';
                                    e.currentTarget.style.color = '#000000';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = '#000000';
                                    e.currentTarget.style.color = '#ff44ff';
                                },
                                onclick: () => this.showWalletManager(),
                                title: 'Manage Multiple Wallets'
                            }, [isXS ? 'Wallets' : 'Wallets'])
                        ])
                    ]),
                    
                    // Container to center the address frame with responsive width
                    $.div({
                        style: {
                            textAlign: 'center',
                            marginTop: '6px',
                            maxWidth: '100%',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                            boxSizing: 'border-box'
                        }
                    }, [
                        // Current wallet indicator with dropdown
                        this.app.walletManager && $.div({
                            style: {
                                display: 'inline-block',
                                position: 'relative'
                            }
                        }, [
                            $.div({
                                style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    background: 'rgba(255, 68, 255, 0.1)',
                                    border: '1px solid rgba(255, 68, 255, 0.3)',
                                    borderRadius: '0',
                                    fontSize: '10px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    color: '#ff44ff',
                                    marginBottom: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => this.toggleWalletDropdown(e),
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = 'rgba(255, 68, 255, 0.2)';
                                    e.currentTarget.style.borderColor = '#ff44ff';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = 'rgba(255, 68, 255, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 68, 255, 0.3)';
                                },
                                title: 'Click for quick wallet switch'
                            }, [
                                $.span({ style: { fontWeight: 'bold' } }, ['Wallet: ']),
                                $.span({ id: 'walletNameDisplay' }, [this.getCurrentWalletName()]),
                                $.span({ style: { marginLeft: '6px', fontSize: '8px' } }, ['▼'])
                            ])
                        ]),
                        
                        // Wallet address display - with frame that fits content and click to copy
                        $.div({
                            id: 'walletAddressDisplay',
                            style: {
                                padding: '6px 10px',
                                background: 'rgba(245, 115, 21, 0.05)',
                                border: '1px solid rgba(245, 115, 21, 0.2)',
                                borderRadius: '0',
                                fontSize: isXS ? '9px' : '10px',
                                fontFamily: 'JetBrains Mono, monospace',
                                color: 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: '1.2',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                maxWidth: '100%',
                                overflow: 'hidden'
                            },
                            onclick: () => this.copyActiveAddress(),
                            onmouseover: (e) => {
                                e.currentTarget.style.background = 'rgba(245, 115, 21, 0.1)';
                                e.currentTarget.style.borderColor = '#f57315';
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.background = 'rgba(245, 115, 21, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(245, 115, 21, 0.2)';
                            },
                            title: 'Click to copy full address'
                        }, [
                            $.span({ 
                                style: { 
                                    color: 'var(--text-primary)', 
                                    fontWeight: '500',
                                    whiteSpace: 'nowrap',
                                    flexShrink: '0'
                                } 
                            }, ['Active Address: ']),
                            $.span({ 
                                id: 'currentWalletAddress',
                                style: {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    minWidth: '0',
                                    flexShrink: '1'
                                }
                            }, [this.truncateAddress(this.getCurrentWalletAddress())])
                        ])
                    ]),
                    
                    // Balance Chart Section
                    $.div({
                        id: 'balanceChartSection',
                        style: {
                            marginTop: '12px',
                            textAlign: 'center'
                        }
                    }, [
                        this.createBalanceChart()
                    ])
                ])
            ]);
        }
        
        createBalanceChart() {
            const $ = window.ElementFactory || ElementFactory;
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const themeColor = isMooshMode ? '#69fd97' : '#f57315';
            const isXS = window.innerWidth < 400;
            
            // Get currency info
            const currency = this.app.state.get('dashboardCurrency') || 'USD';
            const symbol = this.getCurrencySymbol(currency);
            
            // Get real BTC price from state or API data
            const btcPrice = this.app.state.get('btcPrice') || this.app.btcPrice || 0;
            const convertedPrice = this.convertToSelectedCurrency(btcPrice, currency);
            
            // Get real wallet balance from current account state
            let walletBTC = 0;
            const currentAccount = this.app.state.getCurrentAccount();
            ComplianceUtils.log('Chart', 'Current account: ' + (currentAccount ? currentAccount.name : 'undefined'), 'info');
            
            if (currentAccount && currentAccount.balances && currentAccount.balances.bitcoin !== undefined) {
                // Balance is stored in satoshis in the account state
                walletBTC = currentAccount.balances.bitcoin / 100000000;
                ComplianceUtils.log('Chart', 'Got balance from state: ' + walletBTC + ' BTC (satoshis: ' + currentAccount.balances.bitcoin + ')', 'info');
            } else {
                ComplianceUtils.log('Chart', 'No balance in state, trying DOM...', 'warn');
                // Fallback: try to get from DOM element if state not loaded yet
                const btcBalanceElement = document.getElementById('btc-balance') || document.getElementById('btcBalance');
                if (btcBalanceElement) {
                    const balanceText = btcBalanceElement.getAttribute('data-original') || btcBalanceElement.textContent;
                    const match = balanceText.match(/(\d+\.?\d*)/);
                    if (match) {
                        walletBTC = parseFloat(match[1]);
                        ComplianceUtils.log('Chart', 'Got balance from DOM: ' + walletBTC + ' BTC from text: ' + balanceText, 'info');
                    } else {
                        ComplianceUtils.log('Chart', 'Could not parse balance from DOM text: ' + balanceText, 'error');
                    }
                } else {
                    ComplianceUtils.log('Chart', 'No balance element found in DOM', 'error');
                }
            }
            
            ComplianceUtils.log('Chart', 'Final wallet BTC: ' + walletBTC + ' BTC Price: ' + btcPrice, 'info');
            
            // Calculate wallet value
            const walletValue = walletBTC * btcPrice;
            const convertedWalletValue = this.convertToSelectedCurrency(walletValue, currency);
            
            // Get real price changes from API or calculate
            const priceChanges = this.calculatePriceChanges();
            
            // Check if balances are hidden
            const isHidden = this.app.state.get('isBalanceHidden');
            
            return $.div({
                id: 'priceChart',
                style: {
                    padding: '12px',
                    background: '#000',
                    border: `2px solid ${themeColor}`,
                    borderRadius: '0',
                    fontFamily: 'JetBrains Mono, monospace',
                    display: 'block',
                    width: '100%',
                    marginTop: '10px',
                    boxSizing: 'border-box'
                }
            }, [
                // BTC Price and Wallet Balance
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                    }
                }, [
                    // BTC Price
                    $.div({}, [
                        $.div({
                            style: { 
                                fontSize: '11px',
                                color: themeColor,
                                opacity: '0.7',
                                marginBottom: '2px'
                            }
                        }, ['BTC Price']),
                        $.div({
                            style: { 
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: themeColor
                            }
                        }, [isHidden ? '••••••••' : `${symbol}${this.formatCurrencyAmount(convertedPrice, currency)}`])
                    ]),
                    // Wallet Balance
                    $.div({
                        style: { textAlign: 'right' }
                    }, [
                        $.div({
                            style: { 
                                fontSize: '11px',
                                color: themeColor,
                                opacity: '0.7',
                                marginBottom: '2px'
                            }
                        }, ['My Balance']),
                        $.div({
                            style: { 
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: themeColor
                            },
                            'data-original': `${symbol}${this.formatCurrencyAmount(convertedWalletValue, currency)}`
                        }, [isHidden ? '••••••••' : `${symbol}${this.formatCurrencyAmount(convertedWalletValue, currency)}`]),
                        $.div({
                            style: { 
                                fontSize: '10px',
                                color: themeColor,
                                opacity: '0.6'
                            },
                            'data-original': `${walletBTC.toFixed(8)} BTC`
                        }, [isHidden ? '•••••••• BTC' : `${walletBTC.toFixed(8)} BTC`])
                    ])
                ]),
                
                // Simple price chart
                $.div({
                    id: 'miniChart',
                    style: {
                        height: '60px',
                        position: 'relative',
                        backgroundColor: '#000',
                        border: `1px solid ${themeColor}`,
                        overflow: 'hidden',
                        marginBottom: '8px'
                    }
                }, [this.renderMiniPriceChart(themeColor)]),
                
                // Real price stats
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        color: '#888'
                    }
                }, [
                    $.span({
                        style: { color: priceChanges.day1 >= 0 ? '#00ff88' : '#ff4444' }
                    }, [`24h: ${priceChanges.day1 >= 0 ? '+' : ''}${priceChanges.day1.toFixed(1)}%`]),
                    $.span({
                        style: { color: priceChanges.day7 >= 0 ? '#00ff88' : '#ff4444' }
                    }, [`7d: ${priceChanges.day7 >= 0 ? '+' : ''}${priceChanges.day7.toFixed(1)}%`]),
                    $.span({
                        style: { color: priceChanges.day30 >= 0 ? '#00ff88' : '#ff4444' }
                    }, [`30d: ${priceChanges.day30 >= 0 ? '+' : ''}${priceChanges.day30.toFixed(1)}%`])
                ])
            ]);
        }
        
        calculatePriceChanges() {
            // Get price history from state or use defaults
            const priceHistory = this.app.state.get('btcPriceHistory') || [];
            const currentPrice = this.app.state.get('btcPrice') || this.app.btcPrice || 0;
            
            // If we have real data, calculate real changes
            if (priceHistory.length > 0) {
                const now = Date.now();
                const day1Ago = priceHistory.find(p => p.timestamp > now - 86400000) || { price: currentPrice * 0.98 };
                const day7Ago = priceHistory.find(p => p.timestamp > now - 604800000) || { price: currentPrice * 0.95 };
                const day30Ago = priceHistory.find(p => p.timestamp > now - 2592000000) || { price: currentPrice * 0.88 };
                
                return {
                    day1: ((currentPrice - day1Ago.price) / day1Ago.price) * 100,
                    day7: ((currentPrice - day7Ago.price) / day7Ago.price) * 100,
                    day30: ((currentPrice - day30Ago.price) / day30Ago.price) * 100
                };
            }
            
            // Return zeros until we have real data
            return {
                day1: 0,
                day7: 0,
                day30: 0
            };
        }
        
        getBitcoinPriceData() {
            // Get real Bitcoin price data
            const btcPrice = this.app.btcPrice || this.app.state.get('btcPrice') || 0;
            const priceHistory = this.app.state.get('btcPriceHistory') || [];
            
            // Generate OHLC data for the current period
            const period = this.app.state.get('tradingPeriod') || '1D';
            const candles = this.generateCandlestickData(btcPrice, period);
            
            // Calculate 24h change
            const price24hAgo = priceHistory.length > 0 ? priceHistory[0].price : btcPrice * 0.98;
            const priceChange = ((btcPrice - price24hAgo) / price24hAgo) * 100;
            
            // Calculate high/low from candles
            const high24h = Math.max(...candles.map(c => c.high));
            const low24h = Math.min(...candles.map(c => c.low));
            
            return {
                currentPrice: `$${btcPrice.toLocaleString()}`,
                priceChange: priceChange,
                high24h: high24h.toLocaleString(),
                low24h: low24h.toLocaleString(),
                volume24h: '1.2K BTC',
                open: candles[0].open.toLocaleString(),
                high: candles[candles.length - 1].high.toLocaleString(),
                low: candles[candles.length - 1].low.toLocaleString(),
                close: btcPrice.toLocaleString(),
                candles: candles
            };
        }
        
        generateCandlestickData(currentPrice, period) {
            // Generate realistic candlestick data
            const candles = [];
            let candleCount = 24; // Default for 1D
            
            switch(period) {
                case '1H': candleCount = 60; break;
                case '4H': candleCount = 42; break;
                case '1D': candleCount = 24; break;
                case '1W': candleCount = 28; break;
                case '1M': candleCount = 30; break;
            }
            
            let price = currentPrice * 0.98; // Start 2% lower
            
            for (let i = 0; i < candleCount; i++) {
                const volatility = 0.002; // 0.2% volatility
                const trend = (i / candleCount) * 0.02; // 2% upward trend
                
                const open = price;
                // Use deterministic values for demo chart
                const change = (0.5 - 0.5) * volatility + trend / candleCount;
                const high = open * (1 + 0.3 * volatility);
                const low = open * (1 - 0.3 * volatility);
                const close = open * (1 + change);
                
                candles.push({
                    open: open,
                    high: Math.max(open, close, high),
                    low: Math.min(open, close, low),
                    close: close,
                    volume: 50 + (i % 20), // Deterministic volume
                    timestamp: Date.now() - (candleCount - i) * 3600000
                });
                
                price = close;
            }
            
            return candles;
        }
        
        renderMiniPriceChart(themeColor) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Create a simple ASCII sparkline - but indicate we're loading real data
            const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
            const points = 20;
            let sparkline = '';
            
            // Get price history from state if available
            const priceHistory = this.app.state.get('btcPriceHistory') || [];
            const currentPrice = this.app.state.get('btcPrice') || this.app.btcPrice || 0;
            
            if (currentPrice === 0) {
                // If no price data yet, show loading indicator
                sparkline = '-- Loading price data --';
            } else if (priceHistory.length > 0) {
                // Use real price history if available
                const recentPrices = priceHistory.slice(-points).map(p => p.price);
                const min = Math.min(...recentPrices);
                const max = Math.max(...recentPrices);
                const range = max - min || 1;
                
                recentPrices.forEach(price => {
                    const normalized = (price - min) / range;
                    const blockIndex = Math.floor(normalized * (blocks.length - 1));
                    sparkline += blocks[blockIndex];
                });
            } else {
                // Show a flat line until we have history
                sparkline = blocks[3].repeat(points);
            }
            
            // Continue with the rest of the rendering code unchanged
            const values = [];
            let baseValue = 5;
            
            for (let i = 0; i < points; i++) {
                // Use deterministic variation for demo
                const variation = ((i % 10) / 10 - 0.5) * 2;
                const trend = (i / points) * 2;
                baseValue = Math.max(0, Math.min(7, baseValue + variation * 0.3));
                values.push(baseValue + trend * 0.1);
            }
            
            // Only use these values if we don't have real data
            if (sparkline === '' || sparkline.includes('Loading')) {
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                
                values.forEach(value => {
                    const normalized = (value - min) / range;
                    const blockIndex = Math.floor(normalized * (blocks.length - 1));
                    sparkline += blocks[blockIndex];
                });
            }
            
            return $.div({
                style: { 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '20px',
                    letterSpacing: '2px',
                    color: themeColor,
                    lineHeight: '1',
                    background: '#000'
                }
            }, [sparkline]);
        }
        
        showCandleTooltip(event, candle, index) {
            const tooltip = document.getElementById('candleTooltip');
            if (!tooltip) return;
            
            const date = new Date(candle.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Clear tooltip first
            while (tooltip.firstChild) {
                tooltip.removeChild(tooltip.firstChild);
            }
            
            // Create tooltip content with DOM elements
            const dateDiv = document.createElement('div');
            dateDiv.style.cssText = 'color: var(--text-primary); margin-bottom: 4px;';
            dateDiv.textContent = `${date.toLocaleDateString()} ${timeStr}`;
            
            const openDiv = document.createElement('div');
            openDiv.style.color = '#00ff88';
            openDiv.textContent = `O: $${candle.open.toLocaleString()}`;
            
            const highDiv = document.createElement('div');
            highDiv.style.color = '#00ff88';
            highDiv.textContent = `H: $${candle.high.toLocaleString()}`;
            
            const lowDiv = document.createElement('div');
            lowDiv.style.color = '#ff4444';
            lowDiv.textContent = `L: $${candle.low.toLocaleString()}`;
            
            const closeDiv = document.createElement('div');
            closeDiv.style.color = candle.close >= candle.open ? '#00ff88' : '#ff4444';
            closeDiv.textContent = `C: $${candle.close.toLocaleString()}`;
            
            const volumeDiv = document.createElement('div');
            volumeDiv.style.cssText = 'color: #888; margin-top: 4px;';
            volumeDiv.textContent = `Vol: ${candle.volume.toFixed(2)} BTC`;
            
            tooltip.appendChild(dateDiv);
            tooltip.appendChild(openDiv);
            tooltip.appendChild(highDiv);
            tooltip.appendChild(lowDiv);
            tooltip.appendChild(closeDiv);
            tooltip.appendChild(volumeDiv);
            
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.target.offsetLeft + 10}px`;
            tooltip.style.top = `${event.target.offsetTop - 80}px`;
        }
        
        hideCandleTooltip() {
            const tooltip = document.getElementById('candleTooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        }
        
        changeTradingPeriod(period, event) {
            this.app.state.set('tradingPeriod', period);
            
            // Update button styles
            const buttons = event.target.parentElement.querySelectorAll('button');
            const themeColor = document.body.classList.contains('moosh-mode') ? '#69fd97' : '#f57315';
            
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent === period) {
                    btn.classList.add('active');
                    btn.style.background = themeColor;
                    btn.style.color = '#000';
                } else {
                    btn.style.background = 'transparent';
                    btn.style.color = themeColor;
                }
            });
            
            // Refresh chart
            this.refreshDashboard();
        }
        
        getCurrencySymbol(currency) {
            const symbols = {
                usd: '$', eur: '€', gbp: '£', jpy: '¥', cad: 'C$',
                aud: 'A$', chf: 'Fr', cny: '¥', inr: '₹', krw: '₩',
                brl: 'R$', mxn: 'Mex$', rub: '₽', zar: 'R', aed: 'د.إ',
                sgd: 'S$', hkd: 'HK$', nzd: 'NZ$', sek: 'kr', nok: 'kr',
                try: '₺', thb: '฿', pln: 'zł', php: '₱', idr: 'Rp'
            };
            return symbols[currency.toLowerCase()] || '$';
        }
        
        convertToSelectedCurrency(usdValue, currency) {
            // Get exchange rates from app state
            const rates = this.app.state.get('exchangeRates') || {};
            const rate = rates[currency.toLowerCase()] || 1;
            return usdValue * rate;
        }
        
        formatCurrencyAmount(amount, currency) {
            // Special formatting for certain currencies
            const noDecimalCurrencies = ['jpy', 'krw', 'idr'];
            const decimals = noDecimalCurrencies.includes(currency.toLowerCase()) ? 0 : 2;
            
            return amount.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }
        
        refreshDashboard() {
            // Refresh the dashboard view to update chart
            const chartSection = document.getElementById('balanceChartSection');
            if (chartSection) {
                // Clear existing content
                while (chartSection.firstChild) {
                    chartSection.removeChild(chartSection.firstChild);
                }
                // Re-create the chart
                const newChart = this.createBalanceChart();
                chartSection.appendChild(newChart);
            }
            
            // Also update existing chart colors if it exists
            this.updateChartTheme();
        }
        
        updateChartTheme() {
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const themeColor = isMooshMode ? '#69fd97' : '#f57315';
            
            // Update main chart container
            const priceChart = document.getElementById('priceChart');
            if (priceChart) {
                priceChart.style.border = `2px solid ${themeColor}`;
                priceChart.style.borderColor = themeColor;
            }
            
            // Update all elements within the chart
            const chartContainer = document.getElementById('priceChart');
            if (chartContainer) {
                // Update all divs that might have inline styles
                const allDivs = chartContainer.querySelectorAll('div');
                allDivs.forEach(div => {
                    // Check for labels (BTC Price, My Balance)
                    if (div.textContent === 'BTC Price' || div.textContent === 'My Balance') {
                        div.style.color = themeColor;
                        div.style.opacity = '0.7';
                    }
                    // Check for value displays
                    else if (div.textContent.includes('$') && !div.textContent.includes('%')) {
                        div.style.color = themeColor;
                    }
                    // Check for BTC amount
                    else if (div.textContent.includes('BTC') && !div.textContent.includes('Price')) {
                        div.style.color = themeColor;
                        div.style.opacity = '0.6';
                    }
                });
                
                // Update spans for percentage stats
                const spans = chartContainer.querySelectorAll('span');
                spans.forEach(span => {
                    if (span.textContent.includes('%')) {
                        // Keep red/green for positive/negative
                        const isPositive = span.textContent.includes('+');
                        span.style.color = isPositive ? '#00ff88' : '#ff4444';
                    }
                });
            }
            
            // Update mini chart border and content
            const miniChart = document.getElementById('miniChart');
            if (miniChart) {
                miniChart.style.border = `1px solid ${themeColor}`;
                miniChart.style.borderColor = themeColor;
                
                // Update sparkline color inside mini chart
                const sparklineDiv = miniChart.querySelector('div');
                if (sparklineDiv) {
                    sparklineDiv.style.color = themeColor;
                }
            }
        }
        
        getCurrentWalletAddress() {
            // Get the selected wallet type - default to nativeSegWit to match the user's address
            const selectedType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'nativeSegWit';
            
            console.log('[Dashboard] Getting wallet address for type:', selectedType);
            
            // Get current account
            const currentAccount = this.app.state.getCurrentAccount();
            
            if (currentAccount && currentAccount.addresses) {
                console.log('[Dashboard] Current account:', currentAccount);
                console.log('[Dashboard] Current account addresses:', currentAccount.addresses);
                console.log('[Dashboard] Spark address value:', currentAccount.addresses.spark);
                
                // Map wallet types to their addresses from current account
                const addressMap = {
                    'taproot': currentAccount.addresses.taproot || '',
                    'nativeSegWit': currentAccount.addresses.segwit || currentAccount.addresses.bitcoin || '',
                    'segwit': currentAccount.addresses.segwit || currentAccount.addresses.bitcoin || '',
                    'nestedSegWit': currentAccount.addresses.nestedSegwit || '',
                    'legacy': currentAccount.addresses.legacy || '',
                    'spark': currentAccount.addresses.spark || ''
                };
                
                // Return the selected address without fallback
                const selectedAddress = addressMap[selectedType];
                console.log('[Dashboard] Returning address for type', selectedType, ':', selectedAddress || 'Not available');
                
                // Special handling for Spark addresses - check if it's truly missing
                if (selectedType === 'spark' && (!selectedAddress || selectedAddress === '')) {
                    // Try to get from sparkWallet as fallback
                    const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                    if (sparkWallet.addresses?.spark) {
                        return sparkWallet.addresses.spark;
                    }
                }
                
                return selectedAddress || 'Not available';
                
                // Fallback to any available address
                const fallbackAddress = currentAccount.addresses.spark || 
                                      currentAccount.addresses.segwit || 
                                      currentAccount.addresses.taproot || 
                                      currentAccount.addresses.bitcoin ||
                                      currentAccount.addresses.legacy;
                
                if (fallbackAddress) {
                    console.log('[Dashboard] Using fallback address:', fallbackAddress);
                    return fallbackAddress;
                }
                
                return 'No address found';
            }
            
            // Legacy fallback for old wallet data
            const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            
            // Map wallet types to their addresses - check bitcoinAddresses first
            const addressMap = {
                'taproot': currentWallet.taprootAddress || sparkWallet.bitcoinAddresses?.taproot || sparkWallet.addresses?.taproot || '',
                'nativeSegWit': currentWallet.bitcoinAddress || sparkWallet.bitcoinAddresses?.segwit || sparkWallet.addresses?.bitcoin || sparkWallet.addresses?.segwit || '',
                'nestedSegWit': currentWallet.nestedSegWitAddress || sparkWallet.bitcoinAddresses?.nestedSegwit || sparkWallet.addresses?.nestedSegWit || '',
                'legacy': currentWallet.legacyAddress || sparkWallet.bitcoinAddresses?.legacy || sparkWallet.addresses?.legacy || '',
                'spark': currentWallet.sparkAddress || sparkWallet.addresses?.spark || ''
            };
            
            // Return the selected address or indicate type not available
            const selectedAddress = addressMap[selectedType];
            if (selectedAddress) {
                return selectedAddress;
            }
            
            // Don't fallback to wrong type - return a clear message
            return `No ${selectedType} address available`;
        }
        
        truncateAddress(address) {
            // Handle various input types
            if (!address) return '';
            
            // If address is an object, try to extract the actual address
            if (typeof address === 'object') {
                // Check common property names
                address = address.address || address.bitcoin || address.spark || address.value || '';
            }
            
            // Convert to string and validate
            address = String(address);
            if (!address || address.length <= 20) return address;
            
            // Check if mobile
            const isMobile = window.innerWidth <= 768;
            const isXS = window.innerWidth <= 375;
            
            // Different truncation lengths based on screen size
            let visibleChars = isXS ? 8 : (isMobile ? 12 : 16);
            
            // Show first N and last N characters
            const start = address.substring(0, visibleChars);
            const end = address.substring(address.length - visibleChars);
            
            return `${start}...${end}`;
        }
        
        handleTerminalClick() {
            // Show a terminal command palette
            const $ = window.ElementFactory || ElementFactory;
            
            // Remove existing command palette if any
            const existingPalette = document.getElementById('terminal-command-palette');
            if (existingPalette) {
                existingPalette.remove();
                return;
            }
            
            // Create command palette
            const commands = [
                { cmd: 'balance', desc: 'Show detailed balance information', action: () => this.showDetailedBalance() },
                { cmd: 'export', desc: 'Export wallet data', action: () => this.exportWalletData() },
                { cmd: 'history', desc: 'Show transaction history', action: () => this.showTransactionHistory() },
                { cmd: 'refresh', desc: 'Refresh all data', action: () => this.handleRefresh() },
                { cmd: 'accounts', desc: 'Manage accounts', action: () => this.showMultiAccountManager() },
                { cmd: 'help', desc: 'Show available commands', action: () => this.showHelp() }
            ];
            
            const palette = $.div({
                id: 'terminal-command-palette',
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    marginTop: '4px',
                    background: '#000',
                    border: '1px solid #f57315',
                    borderRadius: '0',
                    zIndex: '1000',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                }
            }, [
                // Command input
                $.div({
                    style: {
                        padding: '10px',
                        borderBottom: '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }
                }, [
                    $.span({ style: { color: '#f57315', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' } }, ['$']),
                    $.input({
                        type: 'text',
                        id: 'terminal-command-input',
                        placeholder: 'Type a command...',
                        style: {
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#f57315',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '12px',
                            flex: '1'
                        },
                        onkeydown: (e) => {
                            if (e.key === 'Enter') {
                                const value = e.target.value.trim();
                                const command = commands.find(c => c.cmd === value);
                                if (command) {
                                    command.action();
                                    palette.remove();
                                } else {
                                    this.app.showNotification(`Command not found: ${value}`, 'error');
                                }
                            } else if (e.key === 'Escape') {
                                palette.remove();
                            }
                        },
                        oninput: (e) => {
                            const value = e.target.value.toLowerCase();
                            const items = palette.querySelectorAll('.command-item');
                            items.forEach(item => {
                                const cmd = item.getAttribute('data-cmd');
                                if (cmd.includes(value) || value === '') {
                                    item.style.display = 'flex';
                                } else {
                                    item.style.display = 'none';
                                }
                            });
                        }
                    })
                ]),
                
                // Command list
                $.div({
                    style: {
                        padding: '5px'
                    }
                }, commands.map(cmd => 
                    $.div({
                        className: 'command-item',
                        'data-cmd': cmd.cmd,
                        style: {
                            padding: '8px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '11px',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => {
                            cmd.action();
                            palette.remove();
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = 'rgba(245, 115, 21, 0.1)';
                            e.currentTarget.style.color = '#ff8c42';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = '';
                            e.currentTarget.style.color = '';
                        }
                    }, [
                        $.span({ style: { color: '#f57315' } }, [cmd.cmd]),
                        $.span({ style: { color: '#666', fontSize: '10px' } }, [cmd.desc])
                    ])
                ))
            ]);
            
            // Add to terminal box
            const terminalBox = document.querySelector('.dashboard-terminal-box');
            if (terminalBox) {
                terminalBox.style.position = 'relative';
                terminalBox.appendChild(palette);
                
                // Focus input
                setTimeout(() => {
                    const input = document.getElementById('terminal-command-input');
                    if (input) input.focus();
                }, 100);
            }
            
            // Close palette when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeCommandPalette(e) {
                    if (!palette.contains(e.target) && !e.target.closest('.terminal-header')) {
                        palette.remove();
                        document.removeEventListener('click', closeCommandPalette);
                    }
                });
            }, 100);
        }
        
        showDetailedBalance() {
            // Show detailed balance breakdown
            const accounts = this.app.state.getAccounts();
            let totalBTC = 0;
            
            accounts.forEach(account => {
                if (account.balance) {
                    totalBTC += parseFloat(account.balance) || 0;
                }
            });
            
            this.app.showNotification(`Total Balance: ${totalBTC.toFixed(8)} BTC across ${accounts.length} accounts`, 'info');
        }
        
        exportWalletData() {
            this.app.showNotification('Export feature coming soon', 'info');
        }
        
        showTransactionHistory() {
            this.app.showNotification('Transaction history coming soon', 'info');
        }
        
        showHelp() {
            this.app.showNotification('Commands: balance, export, history, refresh, accounts, help', 'info');
        }
        
        async copyActiveAddress() {
            const addressElement = document.getElementById('currentWalletAddress');
            if (!addressElement) return;
            
            // Get the full address from getCurrentWalletAddress, not the truncated display
            const address = this.getCurrentWalletAddress();
            if (!address || address.includes('Not available') || address === 'Loading...') {
                this.app.showNotification('No address to copy', 'error');
                return;
            }
            
            try {
                await navigator.clipboard.writeText(address);
                
                // Visual feedback - temporarily change the display
                const displayElement = document.getElementById('walletAddressDisplay');
                const originalBg = displayElement.style.background;
                const originalBorder = displayElement.style.borderColor;
                const originalContent = addressElement.textContent;
                
                // Show success state
                displayElement.style.background = 'rgba(105, 253, 151, 0.1)';
                displayElement.style.borderColor = '#69fd97';
                addressElement.textContent = '✓ Copied!';
                
                // Restore after 1.5 seconds
                setTimeout(() => {
                    displayElement.style.background = originalBg;
                    displayElement.style.borderColor = originalBorder;
                    addressElement.textContent = originalContent;
                }, 1500);
                
                this.app.showNotification('Address copied to clipboard!', 'success');
            } catch (error) {
                console.error('Failed to copy address:', error);
                this.app.showNotification('Failed to copy address', 'error');
            }
        }
        
        createAccountSelector() {
            const $ = window.ElementFactory || ElementFactory;
            const accountName = this.getAccountDisplayName();
            
            return $.div({ className: 'account-selector' }, [
                $.button({
                    className: 'account-dropdown-btn',
                    onclick: () => this.toggleAccountDropdown()
                }, [
                    $.span({ className: 'account-name' }, [accountName]),
                    $.span({ className: 'dropdown-arrow' }, ['▼'])
                ])
            ]);
        }
        
        createHeaderButtons() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'header-buttons' }, [
                $.button({
                    className: 'header-btn',
                    title: 'Token Menu',
                    onclick: () => this.handleTokenMenu()
                }, ['💰']),
                
                $.button({
                    className: 'header-btn',
                    title: 'Add Account',
                    onclick: () => this.handleAddAccount()
                }, ['+']),
                
                $.button({
                    className: 'header-btn',
                    title: 'Refresh',
                    onclick: () => this.handleRefresh()
                }, ['REFRESH']),
                
                $.button({
                    className: 'header-btn privacy-toggle',
                    title: 'Toggle Privacy',
                    onclick: () => this.handlePrivacyToggle()
                }, ['👁'])
            ]);
        }
        
        createDashboardContent() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'dashboard-content' }, [
                this.createPriceTicker(),
                this.createStatsGrid(),
                this.createWalletTypeSelector(),
                this.createMainActionButtons(),
                this.createQuickActionsBar(),
                this.createWalletHealthIndicator(),
                this.createRecentActivityFeed(),
                this.createKeyboardShortcutHint()
            ]);
        }
        
        createBalanceSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'balance-section' }, [
                // Primary balance
                $.div({ className: 'primary-balance' }, [
                    $.div({ className: 'balance-label' }, ['Total Balance']),
                    $.div({ className: 'balance-amount' }, [
                        $.span({ id: 'btc-balance', className: 'btc-value' }, ['0.00000000']),
                        $.span({ className: 'btc-unit' }, [' BTC'])
                    ]),
                    $.div({ className: 'balance-usd' }, [
                        $.span({ className: 'usd-symbol' }, ['≈ $']),
                        $.span({ id: 'usd-balance' }, ['0.00']),
                        $.span({ className: 'usd-label' }, [' USD'])
                    ])
                ]),
                
                // Token balances
                $.div({ className: 'token-grid' }, [
                    this.createTokenCard('MOOSH', '0.00', '$0.00'),
                    this.createTokenCard('USDT', '0.00', '$0.00'),
                    this.createTokenCard('SPARK', '0.00', '$0.00'),
                    this.createNetworkCard()
                ])
            ]);
        }
        
        createTokenCard(name, amount, value) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'token-card' }, [
                $.div({ className: 'token-name' }, [name]),
                $.div({ className: 'token-amount' }, [amount]),
                $.div({ className: 'token-value' }, [value])
            ]);
        }
        
        createMainActionButtons() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'wallet-actions',
                style: 'display: flex; flex-direction: column; gap: calc(12px * var(--scale-factor)); margin-top: calc(24px * var(--scale-factor));'
            }, [
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showSendPayment()
                }, ['Send Lightning Payment']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showReceivePayment()
                }, ['Receive Payment']),
                
                // Export Wallet button
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--text-accent); color: var(--text-accent); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer; margin-top: calc(16px * var(--scale-factor));',
                    onclick: () => this.showExportWallet(),
                    onmouseover: function() { this.style.background = 'var(--text-accent)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-accent)'; }
                }, ['Export Wallet 📤']),
                
                // Import Wallet button
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--text-accent); color: var(--text-accent); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showImportWallet(),
                    onmouseover: function() { this.style.background = 'var(--text-accent)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-accent)'; }
                }, ['Import Wallet 📥']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--text-accent); color: var(--text-accent); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer; font-weight: 600; margin-top: calc(16px * var(--scale-factor));',
                    onclick: () => this.showOrdinalsTerminal(),
                    onmouseover: (e) => {
                        e.currentTarget.style.background = 'var(--text-accent)';
                        e.currentTarget.style.color = 'var(--bg-primary)';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = 'var(--text-accent)';
                    }
                }, ['Inscriptions - Ordinals']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showTokenMenu()
                }, ['Token Menu']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid #69fd97; color: #69fd97; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer; font-weight: 600;',
                    onclick: () => this.app.showWalletManager(),
                    onmouseover: (e) => {
                        e.currentTarget.style.background = '#69fd97';
                        e.currentTarget.style.color = '#000000';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = '#69fd97';
                    }
                }, ['Manage Wallets']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showTransactionHistory()
                }, ['Transaction History']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid #f57315; color: #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => {
                        // Navigate to wallet details page to show private keys and all addresses
                        this.app.router.navigate('wallet-details?type=all');
                    },
                    onmouseover: (e) => {
                        e.currentTarget.style.background = '#1a0a00';
                        e.currentTarget.style.borderColor = '#ff8c42';
                        e.currentTarget.style.color = '#ff8c42';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.borderColor = '#f57315';
                        e.currentTarget.style.color = '#f57315';
                    }
                }, ['View Private Keys & Addresses']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => {
                        console.log('[WalletSettings] Button clicked, this context:', this);
                        console.log('[WalletSettings] showWalletSettings exists:', !!this.showWalletSettings);
                        
                        // Try multiple approaches to show wallet settings
                        if (this.showWalletSettings && typeof this.showWalletSettings === 'function') {
                            console.log('[WalletSettings] Using this.showWalletSettings');
                            this.showWalletSettings();
                        } else if (window.DashboardPage && window.DashboardPage.showWalletSettingsStatic) {
                            console.log('[WalletSettings] Using static method');
                            window.DashboardPage.showWalletSettingsStatic(window.mooshWallet);
                        } else {
                            console.log('[WalletSettings] Direct modal creation');
                            // Direct approach - show password verification then settings
                            const showPasswordModal = () => {
                                const $ = window.ElementFactory;
                                const passwordOverlay = $.div({ 
                                    className: 'modal-overlay',
                                    style: {
                                        position: 'fixed',
                                        top: '0',
                                        left: '0',
                                        right: '0',
                                        bottom: '0',
                                        background: 'rgba(0, 0, 0, 0.8)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: '10000'
                                    },
                                    onclick: (e) => {
                                        if (e.target.className === 'modal-overlay') {
                                            e.currentTarget.remove();
                                        }
                                    }
                                }, [
                                    $.div({
                                        className: 'modal-container',
                                        style: {
                                            background: 'var(--bg-primary)',
                                            border: '2px solid #f57315',
                                            borderRadius: '0',
                                            padding: '30px',
                                            minWidth: '400px',
                                            maxWidth: '90%'
                                        }
                                    }, [
                                        $.h3({
                                            style: {
                                                color: '#f57315',
                                                marginBottom: '20px',
                                                fontSize: '18px'
                                            }
                                        }, ['Password Required']),
                                        
                                        $.p({
                                            style: {
                                                color: '#888888',
                                                marginBottom: '20px',
                                                fontSize: '14px'
                                            }
                                        }, ['Enter your wallet password to access settings']),
                                        
                                        $.input({
                                            type: 'password',
                                            id: 'settingsPasswordInput',
                                            placeholder: 'Enter password',
                                            style: {
                                                width: '100%',
                                                padding: '12px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid #f57315',
                                                color: '#f57315',
                                                fontSize: '14px',
                                                borderRadius: '0',
                                                marginBottom: '10px'
                                            },
                                            onkeydown: (e) => {
                                                if (e.key === 'Enter') {
                                                    const enteredPassword = e.target.value;
                                                    const storedPassword = localStorage.getItem('walletPassword');
                                                    if (enteredPassword === storedPassword) {
                                                        passwordOverlay.remove();
                                                        const modal = new WalletSettingsModal(window.mooshWallet);
                                                        modal.show();
                                                    } else {
                                                        const errorMsg = document.getElementById('passwordErrorMsg');
                                                        if (errorMsg) {
                                                            errorMsg.textContent = 'Incorrect password';
                                                            errorMsg.style.display = 'block';
                                                        }
                                                    }
                                                }
                                            }
                                        }),
                                        
                                        $.div({
                                            id: 'passwordErrorMsg',
                                            style: {
                                                color: '#ff4444',
                                                fontSize: '12px',
                                                marginTop: '10px',
                                                display: 'none'
                                            }
                                        }),
                                        
                                        $.div({ 
                                            style: {
                                                display: 'flex',
                                                gap: '10px',
                                                marginTop: '20px',
                                                justifyContent: 'flex-end'
                                            }
                                        }, [
                                            $.button({
                                                style: {
                                                    padding: '10px 20px',
                                                    background: 'var(--bg-primary)',
                                                    border: '1px solid #666666',
                                                    color: '#888888',
                                                    cursor: 'pointer',
                                                    borderRadius: '0'
                                                },
                                                onclick: () => passwordOverlay.remove()
                                            }, ['Cancel']),
                                            
                                            $.button({
                                                style: {
                                                    padding: '10px 20px',
                                                    background: '#f57315',
                                                    border: '1px solid #f57315',
                                                    color: '#000000',
                                                    cursor: 'pointer',
                                                    borderRadius: '0'
                                                },
                                                onclick: () => {
                                                    const passwordInput = document.getElementById('settingsPasswordInput');
                                                    const errorMsg = document.getElementById('passwordErrorMsg');
                                                    const enteredPassword = passwordInput.value;
                                                    const storedPassword = localStorage.getItem('walletPassword');
                                                    
                                                    if (!enteredPassword) {
                                                        errorMsg.textContent = 'Please enter a password';
                                                        errorMsg.style.display = 'block';
                                                        return;
                                                    }
                                                    
                                                    if (enteredPassword === storedPassword) {
                                                        passwordOverlay.remove();
                                                        const modal = new WalletSettingsModal(window.mooshWallet);
                                                        modal.show();
                                                    } else {
                                                        errorMsg.textContent = 'Incorrect password';
                                                        errorMsg.style.display = 'block';
                                                    }
                                                }
                                            }, ['Verify'])
                                        ])
                                    ])
                                ]);
                                
                                document.body.appendChild(passwordOverlay);
                                setTimeout(() => {
                                    const input = document.getElementById('settingsPasswordInput');
                                    if (input) input.focus();
                                }, 100);
                            };
                            
                            showPasswordModal();
                        }
                    }
                }, ['Wallet Settings'])
            ]);
        }
        
        createSparkProtocolSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: 'margin-top: 24px; padding-top: 24px; border-top: 1px solid #333333;'
            }, [
                $.h3({ 
                    className: 'text-white', style: 'margin-bottom: 16px;'
                }, ['Spark Protocol Features']),
                
                $.div({ 
                    style: 'background: rgba(105, 253, 151, 0.1); border: 1px solid #69fd97; border-radius: 8px; padding: 16px; margin-bottom: 16px;'
                }, [
                    $.div({ 
                        className: 'text-primary', style: 'font-weight: 600; margin-bottom: 8px;'
                    }, ['Lightning Network Integration']),
                    $.div({ 
                        className: 'text-dim',
                        style: 'font-size: 12px;'
                    }, [
                        'Send instant Bitcoin payments • Sub-second confirmations • Minimal fees',
                        $.br(),
                        'Compatible with all Lightning wallets and services'
                    ])
                ]),
                
                $.div({ 
                    className: 'wallet-actions',
                    style: 'display: flex; gap: 16px; margin-bottom: 24px;'
                }, [
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.showStablecoinSwap(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease; flex: 1;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, ['Swap BTC ↔ USDT']),
                    
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.openLightningChannel(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease; flex: 1;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, ['Open Lightning Channel']),
                    
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.createStablecoin(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease; flex: 1;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, ['Mint Stablecoins'])
                ]),
                
                $.div({ 
                    className: 'terminal-box',
                    style: 'margin-top: 24px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
                }, [
                    $.div({ 
                        className: 'terminal-header',
                        style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 14px;'
                    }, [
                        $.span({}, ['~/moosh/wallet/spark $']),
                        $.span({ 
                            id: 'sparkConnectionStatus',
                            className: 'text-accent',
                            style: 'margin-left: 8px;'
                        }, ['connected'])
                    ]),
                    $.div({ 
                        className: 'terminal-content',
                        id: 'sparkInfo',
                        style: 'padding: 16px; font-family: JetBrains Mono, monospace; font-size: 12px;'
                    }, [
                        $.span({ className: 'text-comment' }, ['# Spark Protocol Status']),
                        $.br(),
                        $.span({ className: 'text-keyword' }, ['const']),
                        ' ',
                        $.span({ className: 'text-variable text-primary' }, ['spark']),
                        ' = ',
                        $.span({ className: 'text-string' }, ['ready']),
                        ';',
                        $.br(),
                        $.span({ className: 'text-comment' }, ['# Mint MOOSH tokens for 0.0000058 BTC'])
                    ])
                ]),
                
                $.div({ 
                    className: 'wallet-actions',
                    style: 'margin-top: 24px;'
                }, [
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.logout(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, [
                        '<Logout ',
                        $.span({ style: 'opacity: 0.7;' }, ['Esc />']),
                    ])
                ])
            ]);
        }
        
        createTransactionHistory() {
            // Use the new TransactionHistory component
            const transactionHistory = new TransactionHistory(this.app);
            return transactionHistory.render();
            
            // Original implementation below (kept for reference but unreachable)
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))'
                }
            }, [
                // Section header
                $.div({ 
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.h3({ 
                        style: {
                            fontSize: 'calc(16px * var(--scale-factor))',
                            color: 'var(--text-primary)',
                            margin: '0',
                            fontWeight: '600'
                        }
                    }, ['Recent Transactions']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-dim)',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(12px * var(--scale-factor))',
                            padding: 'calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => this.handleFilter(),
                        onmouseover: function() {
                            this.style.borderColor = 'var(--text-primary)';
                            this.style.color = 'var(--text-primary)';
                        },
                        onmouseout: function() {
                            this.style.borderColor = 'var(--border-color)';
                            this.style.color = 'var(--text-dim)';
                        }
                    }, ['Filter'])
                ]),
                
                // Transaction list
                $.div({ 
                    id: 'transaction-list',
                    style: {
                        minHeight: 'calc(100px * var(--scale-factor))'
                    }
                }, [
                    this.createEmptyTransactions()
                ])
            ]);
        }
        
        createEmptyTransactions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    textAlign: 'center',
                    padding: 'calc(40px * var(--scale-factor))',
                    color: 'var(--text-dim)',
                    fontFamily: "'JetBrains Mono', monospace"
                }
            }, [
                $.div({ 
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['No transactions yet']),
                $.div({ 
                    style: {
                        fontSize: 'calc(12px * var(--scale-factor))',
                        opacity: '0.7'
                    }
                }, ['Your transaction history will appear here'])
            ]);
        }
        
        // Missing dashboard component methods
        createStatusBanner() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    background: 'rgba(245, 115, 21, 0.1)',
                    border: '1px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    textAlign: 'center'
                }
            }, [
                $.div({ 
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        lineHeight: '1.5'
                    }
                }, [
                    $.span({ style: { fontWeight: '600' } }, ['Spark Protocol Active']),
                    ' • Lightning Network Ready • ',
                    $.span({ style: { color: 'var(--text-keyword)' } }, ['Live Data'])
                ])
            ]);
        }
        
        createWalletTypeSelector() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'terminal-box',
                style: 'margin-bottom: 20px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 14px;'
                }, [
                    $.span({}, ['~/moosh/wallet-selector $']),
                    $.span({ 
                        className: 'text-keyword',
                        id: 'walletSelectorStatus',
                        className: 'text-primary', style: 'margin-left: 8px;'
                    }, ['active'])
                ]),
                $.div({ 
                    className: 'terminal-content',
                    style: 'padding: 16px;'
                }, [
                    $.div({ style: 'margin-bottom: 12px;' }, [
                        $.label({ 
                            style: 'color: #ffffff; font-size: 12px; font-weight: 600; margin-bottom: 8px; display: block;'
                        }, ['Select Active Wallet:']),
                        $.select({
                            id: 'walletTypeSelector',
                            className: 'terminal-select',
                            style: 'width: 100%; background: #000000; border: 2px solid #ffffff; border-radius: 0; color: #ffffff; font-family: JetBrains Mono, monospace; font-size: 12px; padding: 8px; cursor: pointer; transition: all 0.2s ease;',
                            onchange: (e) => this.switchWalletType(e),
                            onmouseover: (e) => { e.target.style.borderColor = '#ff8c42'; e.target.style.background = '#000000'; },
                            onmouseout: (e) => { e.target.style.borderColor = '#ffffff'; e.target.style.background = '#000000'; },
                            onfocus: (e) => { e.target.style.borderColor = '#ff8c42'; e.target.style.boxShadow = '0 0 0 1px #ff8c42'; e.target.style.background = '#000000'; },
                            onblur: (e) => { e.target.style.borderColor = '#ffffff'; e.target.style.boxShadow = 'none'; e.target.style.background = '#000000'; }
                        }, [
                            $.option({ value: 'taproot' }, ['Bitcoin Taproot (bc1p...) - Primary']),
                            $.option({ value: 'nativeSegWit' }, ['Bitcoin Native SegWit (bc1q...) - BIP84']),
                            $.option({ value: 'nestedSegWit' }, ['Bitcoin Nested SegWit (3...) - BIP49']),
                            $.option({ value: 'legacy' }, ['Bitcoin Legacy (1...) - BIP44']),
                            $.option({ value: 'spark' }, ['Spark Protocol (sp1...) - Lightning'])
                        ])
                    ]),
                    
                    $.div({ 
                        id: 'selectedWalletDisplay',
                        style: 'margin-top: 12px;'
                    }, [
                        $.div({ 
                            style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;'
                        }, [
                            $.span({ 
                                style: 'color: #888888; font-size: 11px;',
                                id: 'selectedWalletLabel'
                            }, ['Bitcoin Taproot Address:']),
                            $.span({ 
                                style: 'color: #ffffff; font-size: 11px;',
                                id: 'selectedWalletBalance'
                            }, ['0.00000000 BTC'])
                        ]),
                        $.div({ 
                            style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: 8px; font-family: JetBrains Mono, monospace; word-break: break-all; color: #f57315; font-size: 11px; cursor: pointer; transition: all 0.2s ease; min-height: 20px;',
                            id: 'selectedWalletAddress',
                            onclick: () => this.openSelectedWalletExplorer(),
                            onmouseover: (e) => { e.target.style.borderColor = '#ff8c42'; e.target.style.color = '#ff8c42'; },
                            onmouseout: (e) => { e.target.style.borderColor = '#f57315'; e.target.style.color = '#f57315'; }
                        }, [this.getCurrentWalletAddress()])
                    ])
                ])
            ]);
        }
        
        createStatsGrid() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'stats-grid',
                style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(calc(160px * var(--scale-factor)), 1fr)); gap: calc(12px * var(--scale-factor)); margin-bottom: calc(20px * var(--scale-factor));'
            }, [
                // Bitcoin Balance
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: var(--bg-primary); border: 2px solid var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Bitcoin Balance']),
                    $.div({ 
                        id: 'btcBalance',
                        className: 'text-primary',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: var(--text-primary); word-break: break-all;'
                    }, ['Loading...']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, [
                        '≈ ', 
                        $.span({ id: 'currencySymbol' }, ['$']),
                        $.span({ id: 'btcUsdValue' }, ['...']), 
                        ' ', 
                        $.span({ id: 'currencyCode' }, ['USD'])
                    ])
                ]),
                
                // Lightning Balance
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: var(--bg-primary); border: 2px solid var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Lightning Balance']),
                    $.div({ 
                        id: 'lightningBalance',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: var(--text-primary);'
                    }, ['0 sats']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, [$.span({ id: 'activeChannels' }, ['0']), ' active channels'])
                ]),
                
                // Stablecoins
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: var(--bg-primary); border: 2px solid var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Stablecoins']),
                    $.div({ 
                        id: 'stablecoinBalance',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: var(--text-primary);'
                    }, ['0 USDT']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['On Lightning Network'])
                ]),
                
                // Ordinals (NFTs)
                $.div({ 
                    id: 'ordinalsSection',
                    className: 'stats-grid-item',
                    style: `background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden; display: ${this.shouldShowOrdinals() ? 'block' : 'none'}; cursor: pointer;`,
                    onclick: () => this.openOrdinalsGallery(),
                    onmouseover: (e) => { e.currentTarget.style.borderColor = '#ff8c42'; e.currentTarget.style.background = '#1a1a1a'; },
                    onmouseout: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#000000'; }
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Ordinals (NFTs)']),
                    $.div({ 
                        id: 'ordinalsCount',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: var(--text-primary);'
                    }, ['0 NFTs']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['Click to view gallery'])
                ]),
                
                // Network Status
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: var(--bg-primary); border: 2px solid var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Network Status']),
                    $.div({ 
                        id: 'sparkNetworkStatus',
                        className: 'text-primary',
                        style: 'font-size: calc(14px * var(--scale-factor));'
                    }, ['Connected']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['Block ', $.span({ id: 'blockHeight' }, ['000000'])])
                ])
            ]);
        }
        
        createStatCard(title, primary, secondary, iconClass) {
            // No longer needed
            return null;
        }
        
        shouldShowOrdinals() {
            // Check if current wallet type is taproot
            const selectedWalletType = this.app.state.get('selectedWalletType') || 
                                       localStorage.getItem('selectedWalletType') || 
                                       'taproot'; // Default to taproot
            
            console.log('[Dashboard] Should show ordinals? Wallet type:', selectedWalletType);
            return selectedWalletType === 'taproot';
        }
        
        createSparkProtocolSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'spark-protocol-section' }, [
                $.div({ className: 'spark-header' }, [
                    $.h3({ className: 'spark-title' }, ['Spark Protocol Terminal']),
                    $.button({
                        className: 'spark-toggle',
                        onclick: () => this.toggleSparkTerminal()
                    }, ['Toggle'])
                ]),
                $.div({ id: 'spark-terminal', className: 'spark-terminal hidden' }, [
                    $.div({ className: 'terminal-output' }, [
                        $.div({ className: 'terminal-line' }, ['> Spark Protocol v2.0.0 initialized']),
                        $.div({ className: 'terminal-line' }, ['> Connection: ACTIVE']),
                        $.div({ className: 'terminal-line' }, ['> Nodes: 12 connected']),
                        $.div({ className: 'terminal-line' }, ['> Privacy: MAXIMUM'])
                    ]),
                    $.input({
                        className: 'terminal-input',
                        placeholder: 'Enter Spark command...',
                        onkeypress: (e) => {
                            if (e.key === 'Enter') this.handleSparkCommand(e.target.value);
                        }
                    })
                ])
            ]);
        }
        
        createNetworkCard() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'token-card network-card' }, [
                $.div({ className: 'token-name' }, ['Network']),
                $.div({ className: 'network-status' }, ['● Connected']),
                $.div({ className: 'network-block' }, ['Block 000000'])
            ]);
        }
        
        // New event handlers
        handleWalletTypeChange(e) {
            const walletType = e.target.value;
            this.app.showNotification(`Switching to ${walletType} wallet...`, 'success');
            
            // Show/hide ordinals based on wallet type
            const ordinalsCard = document.querySelector('.ordinals-icon')?.parentElement?.parentElement;
            if (ordinalsCard) {
                ordinalsCard.style.display = walletType === 'taproot' ? 'flex' : 'none';
            }
            
            // Store selected wallet type
            if (this.app.state) {
                this.app.state.set('selectedWalletType', walletType);
            }
        }
        
        toggleSparkTerminal() {
            const terminal = document.getElementById('spark-terminal');
            if (terminal) {
                terminal.classList.toggle('hidden');
                this.app.showNotification(
                    terminal.classList.contains('hidden') ? 'Spark terminal hidden' : 'Spark terminal shown',
                    'success'
                );
            }
        }
        
        handleSparkCommand(command) {
            const terminal = document.querySelector('.terminal-output');
            const input = document.querySelector('.terminal-input');
            
            if (!terminal || !input) return;
            
            // Add user command to terminal
            const userLine = document.createElement('div');
            userLine.className = 'terminal-line';
            userLine.style.color = '#00ff00';
            userLine.textContent = `> ${command}`;
            terminal.appendChild(userLine);
            
            // Process command
            let response = '';
            const cmd = command.toLowerCase().trim();
            
            if (cmd === 'help') {
                response = 'Available commands: status, balance, network, privacy, clear, help';
            } else if (cmd === 'status') {
                response = 'Spark Protocol: ACTIVE | Privacy: MAXIMUM | Nodes: 12';
            } else if (cmd === 'balance') {
                const btcBalance = document.getElementById('btc-balance')?.textContent || '0.00000000';
                response = `Current balance: ${btcBalance} BTC`;
            } else if (cmd === 'network') {
                const networkBlock = document.querySelector('.network-block')?.textContent || 'Unknown';
                response = `Network: Mainnet | ${networkBlock}`;
            } else if (cmd === 'privacy') {
                response = 'Privacy mode: ENABLED | Tor: ACTIVE | VPN: CONNECTED';
            } else if (cmd === 'clear') {
                terminal.innerHTML = '';
                response = 'Terminal cleared.';
            } else if (cmd === '') {
                response = '';
            } else {
                response = `Unknown command: ${command}. Type 'help' for available commands.`;
            }
            
            // Add response to terminal
            if (response) {
                const responseLine = document.createElement('div');
                responseLine.className = 'terminal-line';
                responseLine.style.color = '#888888';
                responseLine.textContent = response;
                terminal.appendChild(responseLine);
            }
            
            // Clear input
            input.value = '';
            
            // Scroll to bottom
            terminal.scrollTop = terminal.scrollHeight;
            
            this.app.showNotification('Command executed', 'success');
        }
        
        // Dashboard action handlers
        handleTokenMenu() {
            const modal = new TokenMenuModal(this.app);
            modal.show();
        }
        
        toggleAccountDropdown() {
            const modal = new MultiAccountModal(this.app);
            modal.show();
        }
        
        handleAddAccount() {
            const modal = new MultiAccountModal(this.app);
            modal.show();
        }
        
        async handleRefresh() {
            this.app.showNotification('Refreshing wallet data...', 'success');
            
            try {
                // Fetch Bitcoin price
                const priceData = await this.app.apiService.fetchBitcoinPrice();
                console.log('[Dashboard] Price data received:', priceData);
                // Handle both nested and flat response structures
                const btcPrice = priceData?.bitcoin?.usd || priceData?.usd || 0;
                console.log('[Dashboard] BTC price extracted:', btcPrice);
                
                // Get current account
                const currentAccount = this.app.state.getCurrentAccount();
                if (currentAccount && currentAccount.addresses) {
                    // Fetch balance for the current address type
                    const walletType = this.app.state.get('selectedWalletType') || 'taproot';
                    let address = currentAccount.addresses.taproot;
                    
                    if (walletType === 'segwit') address = currentAccount.addresses.segwit;
                    else if (walletType === 'legacy') address = currentAccount.addresses.legacy;
                    
                    const balanceData = await this.app.apiService.fetchAddressBalance(address);
                    const btcBalance = balanceData.balance / 100000000; // Convert from satoshis
                    const usdBalance = (btcBalance * btcPrice).toFixed(2);
                    
                    // Update UI - check both ID variations
                    const btcElement = document.getElementById('btc-balance') || document.getElementById('btcBalance');
                    const usdElement = document.getElementById('usd-balance') || document.getElementById('btcUsdValue');
                    
                    if (btcElement) {
                        if (btcElement.id === 'btcBalance') {
                            btcElement.textContent = btcBalance.toFixed(8) + ' BTC';
                        } else {
                            btcElement.textContent = btcBalance.toFixed(8);
                        }
                    }
                    if (usdElement) {
                        if (usdElement.id === 'btcUsdValue') {
                            usdElement.textContent = usdBalance;
                        } else {
                            usdElement.textContent = usdBalance;
                        }
                    }
                    
                    // Update stats grid
                    const networkInfo = await this.app.apiService.fetchNetworkInfo();
                    const networkCard = document.querySelector('.network-block');
                    if (networkCard) {
                        networkCard.textContent = `Block ${networkInfo.height || '000000'}`;
                    }
                    
                    // Update network status elements
                    const sparkNetworkStatus = document.getElementById('sparkNetworkStatus');
                    if (sparkNetworkStatus) {
                        sparkNetworkStatus.textContent = networkInfo.connected ? 'Connected' : 'Disconnected';
                        sparkNetworkStatus.style.color = networkInfo.connected ? 'var(--primary)' : '#ff3333';
                    }
                    
                    const blockHeightElement = document.getElementById('blockHeight');
                    if (blockHeightElement) {
                        blockHeightElement.textContent = networkInfo.height ? networkInfo.height.toLocaleString() : '000000';
                    }
                    
                    this.app.showNotification('Wallet data refreshed!', 'success');
                } else {
                    this.app.showNotification('No wallet selected', 'error');
                }
            } catch (error) {
                console.error('Refresh error:', error);
                this.app.showNotification('Failed to refresh data', 'error');
            }
        }
        
        handlePrivacyToggle() {
            const balances = document.querySelectorAll('.btc-value, #usd-balance, .token-amount');
            const isHidden = balances[0]?.textContent === '••••••••';
            
            balances.forEach(el => {
                if (isHidden) {
                    // Show real values - restore from data-original attribute
                    const originalValue = el.getAttribute('data-original');
                    if (originalValue) {
                        el.textContent = originalValue;
                    }
                } else {
                    // Hide values
                    el.textContent = '••••••••';
                }
            });
            
            this.app.showNotification(isHidden ? 'Balances shown' : 'Balances hidden', 'success');
        }
        
        handleSend() {
            // Find the WalletCreatedPage methods and reuse them
            const walletPage = new WalletCreatedPage(this.app);
            walletPage.showSendModal();
        }
        
        handleReceive() {
            // Find the WalletCreatedPage methods and reuse them
            const walletPage = new WalletCreatedPage(this.app);
            walletPage.showReceiveModal();
        }
        
        handleSwap() {
            const modal = new SwapModal(this.app);
            modal.show();
        }
        
        handleSettings() {
            const modal = new WalletSettingsModal(this.app);
            modal.show();
        }
        
        handleFilter() {
            const modal = new TransactionHistoryModal(this.app);
            modal.show();
        }
        
        initializeDashboard() {
            // Add dashboard-specific styles
            this.addDashboardStyles();
            // AccountSwitcher will add its own styles when mounted
            
            // Mount the AccountSwitcher component
            const accountSwitcherContainer = document.getElementById('accountSwitcherContainer');
            if (accountSwitcherContainer) {
                this.accountSwitcher = new AccountSwitcher(this.app);
                this.accountSwitcher.mount(accountSwitcherContainer);
            }
            
            // Start data loading
            setTimeout(async () => {
                // Fetch initial BTC price for dashboard and chart
                try {
                    const priceData = await this.app.apiService.fetchBitcoinPrice();
                    const btcPrice = priceData?.bitcoin?.usd || priceData?.usd || 0;
                    
                    // Store the price in app state for use in charts
                    this.app.state.set('btcPrice', btcPrice);
                    this.app.btcPrice = btcPrice;
                    
                    ComplianceUtils.log('Dashboard', 'Initial BTC price fetched: $' + btcPrice);
                } catch (error) {
                    ComplianceUtils.log('Dashboard', 'Failed to fetch initial BTC price: ' + error.message, 'error');
                    // Set a fallback price
                    this.app.state.set('btcPrice', 0);
                    this.app.btcPrice = 0;
                }
                
                this.loadWalletData();
                // Initial live data update - use debounced version
                this.debouncedUpdateLiveData();
                // Initialize wallet type selector and display
                this.initializeWalletTypeSelector();
            }, 500);
            
            // Start auto-refresh (every 30 seconds)
            this.startAutoRefresh();
            
            // Set up periodic updates for live data
            this.startLiveDataUpdates();
        }
        
        
        updateAccountDisplay() {
            // Update all account indicators
            const accountIndicators = this.element.querySelectorAll('.account-indicator, #currentAccountIndicator');
            const newAccountName = this.getAccountDisplayName();
            
            accountIndicators.forEach(indicator => {
                if (indicator) {
                    indicator.textContent = newAccountName;
                    console.log('[DashboardPage] Updated indicator to:', newAccountName);
                }
            });
            
            // Update wallet type selector to show current address
            this.updateAccountIndicator();
            
            // Also trigger a data refresh for the new account
            this.loadWalletData();
        }
        
        initializeWalletTypeSelector() {
            // Get the selected wallet type from state or localStorage
            const selectedType = this.app.state.get('selectedWalletType') || 
                               localStorage.getItem('selectedWalletType') || 
                               'taproot';
            
            // Ensure it's saved in state
            this.app.state.set('selectedWalletType', selectedType);
            
            // Update the selector if it exists
            const selector = document.getElementById('wallet-type-selector') || 
                           document.getElementById('walletTypeSelector');
            if (selector) {
                selector.value = selectedType;
            }
            
            // Update the address display
            this.updateAddressDisplay();
        }
        
        startLiveDataUpdates() {
            // Clear any existing intervals
            if (this.priceInterval) clearInterval(this.priceInterval);
            if (this.mempoolInterval) clearInterval(this.mempoolInterval);
            
            // Update price every 30 seconds
            this.priceInterval = setInterval(() => {
                this.updateLiveData();
            }, 30000);
            
            // Update mempool data every 60 seconds
            this.mempoolInterval = setInterval(() => {
                this.updateMempoolData();
            }, 60000);
            
            // Store intervals for cleanup
            this.app.state.set('priceUpdateInterval', this.priceInterval);
            this.app.state.set('mempoolUpdateInterval', this.mempoolInterval);
        }
        
        startAutoRefresh() {
            // Clear any existing interval
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
            
            // Set up 30-second refresh
            this.refreshInterval = setInterval(() => {
                this.handleRefresh();
            }, 30000);
            
            // Store interval ID for cleanup
            this.app.state.set('dashboardRefreshInterval', this.refreshInterval);
        }
        
        stopAutoRefresh() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
            
            // Also clear live data intervals
            if (this.priceInterval) {
                clearInterval(this.priceInterval);
                this.priceInterval = null;
            }
            if (this.mempoolInterval) {
                clearInterval(this.mempoolInterval);
                this.mempoolInterval = null;
            }
        }
        
        addDashboardStyles() {
            if (document.getElementById('dashboard-page-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'dashboard-page-styles';
            style.textContent = `
                /* Dashboard Container */
                .wallet-dashboard-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: calc(20px * var(--scale-factor));
                    width: 100%;
                    box-sizing: border-box;
                    min-height: 100vh;
                    background: var(--bg-primary);
                }
                
                /* Dashboard Header */
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: calc(20px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    border-radius: 0;
                    margin-bottom: calc(24px * var(--scale-factor));
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .terminal-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(18px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                }
                
                .title-text {
                    color: var(--text-primary);
                }
                
                .cursor-blink {
                    color: var(--text-primary);
                    animation: blink 1s infinite;
                    margin-left: calc(2px * var(--scale-factor));
                }
                
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                
                /* Header Actions */
                .header-actions {
                    display: flex;
                    gap: calc(16px * var(--scale-factor));
                    align-items: center;
                }
                
                .account-selector {
                    position: relative;
                }
                
                .account-dropdown-btn {
                    background: transparent;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    padding: calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: calc(8px * var(--scale-factor));
                    transition: all 0.2s ease;
                }
                
                .account-dropdown-btn:hover {
                    border-color: var(--text-primary);
                }
                
                .dropdown-arrow {
                    font-size: calc(10px * var(--scale-factor));
                    opacity: 0.7;
                }
                
                .header-buttons {
                    display: flex;
                    gap: calc(8px * var(--scale-factor));
                }
                
                .header-btn {
                    background: transparent;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    width: calc(32px * var(--scale-factor));
                    height: calc(32px * var(--scale-factor));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: calc(16px * var(--scale-factor));
                    transition: all 0.2s ease;
                }
                
                .header-btn:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }
                
                /* Balance Section */
                .balance-section {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(24px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .primary-balance {
                    text-align: center;
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .balance-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-bottom: calc(8px * var(--scale-factor));
                }
                
                .balance-amount {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(32px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                    line-height: 1.2;
                }
                
                .btc-unit {
                    font-size: calc(18px * var(--scale-factor));
                    margin-left: calc(4px * var(--scale-factor));
                }
                
                .balance-usd {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(14px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-top: calc(8px * var(--scale-factor));
                }
                
                .token-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(calc(120px * var(--scale-factor)), 1fr));
                    gap: calc(16px * var(--scale-factor));
                    padding-top: calc(24px * var(--scale-factor));
                    border-top: calc(1px * var(--scale-factor)) solid var(--border-color);
                }
                
                .token-card {
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(12px * var(--scale-factor));
                    text-align: center;
                    transition: all 0.2s ease;
                }
                
                .token-card:hover {
                    border-color: var(--text-primary);
                }
                
                .token-name {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .token-amount {
                    font-size: calc(16px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                }
                
                .token-value {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-top: calc(4px * var(--scale-factor));
                }
                
                /* Quick Actions */
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(calc(120px * var(--scale-factor)), 1fr));
                    gap: calc(16px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .action-button {
                    background: var(--bg-primary);
                    border: calc(2px * var(--scale-factor)) solid var(--text-primary);
                    color: var(--text-primary);
                    padding: calc(20px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .action-button:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }
                
                .action-icon {
                    font-size: calc(24px * var(--scale-factor));
                    margin-bottom: calc(8px * var(--scale-factor));
                }
                
                .action-label {
                    font-size: calc(14px * var(--scale-factor));
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                /* Transaction History */
                .transaction-history {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(24px * var(--scale-factor));
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: calc(20px * var(--scale-factor));
                }
                
                .section-title {
                    font-size: calc(16px * var(--scale-factor));
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .filter-button {
                    background: transparent;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-dim);
                    padding: calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor));
                    font-size: calc(12px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .filter-button:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }
                
                .empty-transactions {
                    text-align: center;
                    padding: calc(40px * var(--scale-factor));
                    color: var(--text-dim);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .empty-text {
                    font-size: calc(14px * var(--scale-factor));
                    margin-bottom: calc(8px * var(--scale-factor));
                }
                
                .empty-subtext {
                    font-size: calc(12px * var(--scale-factor));
                    opacity: 0.7;
                }
                
                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        gap: calc(16px * var(--scale-factor));
                        align-items: stretch;
                    }
                    
                    .header-actions {
                        justify-content: space-between;
                    }
                    
                    .balance-amount {
                        font-size: calc(24px * var(--scale-factor));
                    }
                    
                    .quick-actions {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        loadWalletData() {
            // Load current account data
            this.loadCurrentAccountData();
        }
        
        loadCurrentAccountData() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount) {
                console.log('[DashboardPage] No current account found');
                return;
            }
            
            console.log('[DashboardPage] Loading data for account:', currentAccount.name);
            
            // Update wallet addresses display
            this.updateWalletAddresses(currentAccount);
            
            // Refresh balances for current account
            if (this.refreshBalances) {
                this.refreshBalances();
            }
            
            // Update account indicator
            this.updateAccountIndicator();
            
            // Fetch ordinals if we're on taproot wallet and have a taproot address
            const selectedWalletType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'taproot';
            if (selectedWalletType === 'taproot' && currentAccount.addresses?.taproot) {
                console.log('[DashboardPage] Fetching ordinals for taproot wallet');
                this.fetchOrdinalsCount().catch(err => {
                    console.error('[DashboardPage] Failed to fetch ordinals on account load:', err);
                });
            }
            
            console.log('[DashboardPage] Loaded account data for:', currentAccount.name);
        }
        
        updateWalletAddresses(account) {
            // Update all address displays with current account's addresses
            const addressElements = {
                spark: this.element.querySelector('[data-address-type="spark"]'),
                segwit: this.element.querySelector('[data-address-type="segwit"]'),
                taproot: this.element.querySelector('[data-address-type="taproot"]'),
                legacy: this.element.querySelector('[data-address-type="legacy"]')
            };
            
            // Update each address display
            Object.entries(addressElements).forEach(([type, element]) => {
                if (element && account.addresses && account.addresses[type]) {
                    const addressText = element.querySelector('.address-text');
                    if (addressText) {
                        addressText.textContent = account.addresses[type];
                    }
                }
            });
            
            // Also update the main wallet address if displayed
            const mainAddressElement = this.element.querySelector('.wallet-address');
            if (mainAddressElement && account.addresses) {
                const mainAddress = account.addresses.spark || account.addresses.segwit || 
                                  account.addresses.taproot || account.addresses.legacy || 
                                  'No address found';
                mainAddressElement.textContent = mainAddress;
            }
        }
        
        async initializeOrdinalsDisplay() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount || !currentAccount.addresses?.taproot) {
                console.log('[Dashboard] No taproot address, skipping ordinals initialization');
                return;
            }
            
            console.log('[Dashboard] Initializing ordinals display for taproot address');
            
            // Check if current wallet type is taproot
            const selectedWalletType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'taproot';
            
            // Show the ordinals section if we're on taproot wallet
            const ordinalsSection = document.getElementById('ordinalsSection');
            if (ordinalsSection && selectedWalletType === 'taproot') {
                console.log('[Dashboard] Showing ordinals section for taproot wallet');
                ordinalsSection.style.display = 'block';
                
                // Immediately show loading state
                this.updateOrdinalsDisplay('Loading...');
                
                // Fetch ordinals count in the background
                if (this.fetchOrdinalsCount) {
                    // Start prefetch immediately
                    this.fetchOrdinalsCount()
                        .then(count => {
                            console.log(`[Dashboard] Prefetched ${count} ordinals`);
                            // Pre-initialize ordinals modal if we have ordinals
                            if (count > 0 && !this.app.ordinalsModal && typeof OrdinalsModal !== 'undefined') {
                                console.log('[Dashboard] Pre-initializing ordinals modal');
                                this.app.ordinalsModal = new OrdinalsModal(this.app);
                            }
                        })
                        .catch(err => {
                            console.error('[Dashboard] Failed to fetch ordinals on init:', err);
                            this.updateOrdinalsDisplay(0);
                        });
                }
            } else {
                console.log('[Dashboard] Not showing ordinals - wallet type is:', selectedWalletType);
            }
        }
        
        createStatusBanner() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    background: 'rgba(105, 253, 151, 0.1)',
                    border: '1px solid var(--text-accent)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-accent)',
                        fontWeight: '600',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['Spark Protocol Active']),
                $.div({
                    className: 'text-dim',
                    style: { fontSize: 'calc(12px * var(--scale-factor))' }
                }, [
                    'Lightning-fast Bitcoin transfers • Native stablecoins • Instant settlements',
                    $.br(),
                    $.span({ style: { color: 'var(--text-keyword)' } }, [
                        'Live blockchain data • Real-time prices • Auto-refresh every 30s'
                    ])
                ])
            ]);
        }
        
        createWalletTypeSelector() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Get the currently selected wallet type from state - default to taproot
            const selectedWalletType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'taproot';
            
            const selectorElement = $.div({
                className: 'terminal-box',
                style: { marginBottom: 'calc(20px * var(--scale-factor))' }
            }, [
                $.div({ className: 'terminal-header' }, [
                    $.span({}, ['~/moosh/wallet-selector $']),
                    $.span({ 
                        className: 'text-keyword',
                        id: 'wallet-selector-status'
                    }, ['active'])
                ]),
                $.div({ className: 'terminal-content' }, [
                    $.div({ style: { marginBottom: 'calc(12px * var(--scale-factor))' } }, [
                        $.label({
                            style: {
                                color: 'var(--text-primary)',
                                fontSize: 'calc(12px * var(--scale-factor))',
                                fontWeight: '600',
                                marginBottom: 'calc(8px * var(--scale-factor))',
                                display: 'block'
                            }
                        }, ['Select Active Wallet:']),
                        $.create('select', {
                            id: 'wallet-type-selector',
                            className: 'terminal-select',
                            onchange: () => this.switchWalletType(),
                            style: {
                                width: '100%',
                                padding: 'calc(8px * var(--scale-factor))',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                border: '2px solid var(--text-primary)',
                                borderRadius: '0',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(12px * var(--scale-factor))'
                            }
                        }, [
                            $.create('option', { value: 'taproot', selected: selectedWalletType === 'taproot' }, ['Bitcoin Taproot (bc1p...) - Primary']),
                            $.create('option', { value: 'nativeSegWit', selected: selectedWalletType === 'nativeSegWit' }, ['Bitcoin Native SegWit (bc1q...) - BIP84']),
                            $.create('option', { value: 'nestedSegWit', selected: selectedWalletType === 'nestedSegWit' }, ['Bitcoin Nested SegWit (3...) - BIP49']),
                            $.create('option', { value: 'legacy', selected: selectedWalletType === 'legacy' }, ['Bitcoin Legacy (1...) - BIP44']),
                            $.create('option', { value: 'spark', selected: selectedWalletType === 'spark' }, ['Spark Protocol (sp1...) - Lightning'])
                        ])
                    ]),
                    this.createSelectedWalletDisplay()
                ])
            ]);
            
            // Set the selector value after it's rendered and update display
            setTimeout(() => {
                const selector = document.getElementById('wallet-type-selector');
                if (selector) {
                    selector.value = selectedWalletType;
                }
                // Update the display immediately
                this.updateAddressDisplay();
            }, 0);
            
            return selectorElement;
        }
        
        createSelectedWalletDisplay() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                id: 'selected-wallet-display',
                style: { marginTop: 'calc(12px * var(--scale-factor))' }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    $.span({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(11px * var(--scale-factor))'
                        },
                        id: 'selected-wallet-label'
                    }, ['Bitcoin Taproot Address:']),
                    $.span({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(11px * var(--scale-factor))'
                        },
                        id: 'selected-wallet-balance'
                    }, ['0.00000000 BTC'])
                ]),
                $.div({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        padding: 'calc(8px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        wordBreak: 'break-all',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(11px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: 'calc(20px * var(--scale-factor))'
                    },
                    id: 'selected-wallet-address',
                    onclick: () => this.openSelectedWalletExplorer()
                }, ['Select wallet to view address']),
                $.button({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(10px * var(--scale-factor))',
                        padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        marginTop: 'calc(8px * var(--scale-factor))'
                    },
                    onclick: () => this.copySelectedWalletAddress()
                }, ['Copy Selected Address'])
            ]);
        }
        
        createNetworkCard() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'token-card' }, [
                $.div({ className: 'token-name' }, ['Network Status']),
                $.div({ 
                    className: 'token-amount',
                    style: { color: 'var(--text-accent)' }
                }, ['Connected']),
                $.div({ 
                    className: 'token-value',
                    style: { fontSize: 'calc(11px * var(--scale-factor))' }
                }, [
                    'Block ',
                    $.span({ id: 'block-height' }, ['000000'])
                ])
            ]);
        }
        
        createSparkProtocolFeatures() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    marginTop: 'calc(24px * var(--scale-factor))',
                    paddingTop: 'calc(24px * var(--scale-factor))',
                    borderTop: '1px solid var(--border-color)'
                }
            }, [
                $.h3({
                    style: {
                        color: 'var(--text-primary)',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, ['Spark Protocol Features']),
                $.div({
                    style: {
                        background: 'rgba(105, 253, 151, 0.1)',
                        border: '1px solid var(--text-accent)',
                        borderRadius: 'calc(8px * var(--scale-factor))',
                        padding: 'calc(16px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.div({
                        style: {
                            color: 'var(--text-accent)',
                            fontWeight: '600',
                            marginBottom: 'calc(8px * var(--scale-factor))'
                        }
                    }, ['Lightning Network Integration']),
                    $.div({
                        className: 'text-dim',
                        style: { fontSize: 'calc(12px * var(--scale-factor))' }
                    }, [
                        'Send instant Bitcoin payments • Sub-second confirmations • Minimal fees',
                        $.br(),
                        'Compatible with all Lightning wallets and services'
                    ])
                ]),
                $.div({ className: 'wallet-actions' }, [
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.showStablecoinSwap()
                    }, ['Swap BTC ↔ USDT']),
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.openLightningChannel()
                    }, ['Open Lightning Channel']),
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.showTokenMenu()
                    }, ['Token Menu'])
                ])
            ]);
        }
        
        // Enhanced action handlers
        async handleRefresh() {
            this.app.showNotification('Refreshing wallet data...', 'success');
            await this.refreshBalances();
            await this.fetchTransactionHistory();
        }
        
        getCurrencyInfo() {
            const currencyData = {
                usd: { symbol: '$', name: 'US Dollar' },
                eur: { symbol: '€', name: 'Euro' },
                gbp: { symbol: '£', name: 'British Pound' },
                jpy: { symbol: '¥', name: 'Japanese Yen' },
                cad: { symbol: 'C$', name: 'Canadian Dollar' },
                aud: { symbol: 'A$', name: 'Australian Dollar' },
                chf: { symbol: 'Fr', name: 'Swiss Franc' },
                cny: { symbol: '¥', name: 'Chinese Yuan' },
                inr: { symbol: '₹', name: 'Indian Rupee' },
                krw: { symbol: '₩', name: 'South Korean Won' },
                brl: { symbol: 'R$', name: 'Brazilian Real' },
                mxn: { symbol: 'Mex$', name: 'Mexican Peso' },
                rub: { symbol: '₽', name: 'Russian Ruble' },
                zar: { symbol: 'R', name: 'South African Rand' },
                aed: { symbol: 'د.إ', name: 'UAE Dirham' },
                sgd: { symbol: 'S$', name: 'Singapore Dollar' },
                hkd: { symbol: 'HK$', name: 'Hong Kong Dollar' },
                nzd: { symbol: 'NZ$', name: 'New Zealand Dollar' },
                sek: { symbol: 'kr', name: 'Swedish Krona' },
                nok: { symbol: 'kr', name: 'Norwegian Krone' },
                try: { symbol: '₺', name: 'Turkish Lira' },
                thb: { symbol: '฿', name: 'Thai Baht' },
                pln: { symbol: 'zł', name: 'Polish Złoty' },
                php: { symbol: '₱', name: 'Philippine Peso' },
                idr: { symbol: 'Rp', name: 'Indonesian Rupiah' }
            };
            
            const selectedCurrency = localStorage.getItem('mooshPreferredCurrency') || 'usd';
            return {
                code: selectedCurrency,
                ...currencyData[selectedCurrency]
            };
        }
        
        formatCurrencyValue(value, currencyCode) {
            const noDecimalCurrencies = ['jpy', 'krw', 'idr'];
            
            if (noDecimalCurrencies.includes(currencyCode)) {
                return Math.round(value).toLocaleString();
            }
            
            return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        async refreshBalances() {
            try {
                console.log('[Dashboard] Starting balance refresh...');
                
                // Get selected currency
                const currencyInfo = this.getCurrencyInfo();
                const selectedCurrency = currencyInfo.code;
                
                // Fetch Bitcoin price for selected currency
                let priceData;
                try {
                    // Try with proper CORS headers
                    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${selectedCurrency}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        mode: 'cors'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    priceData = await response.json();
                } catch (error) {
                    ComplianceUtils.log('Dashboard', 'CoinGecko direct fetch failed, trying proxy: ' + error.message, 'warn');
                    
                    // Try using a CORS proxy as fallback
                    try {
                        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${selectedCurrency}`)}`;
                        const proxyResponse = await fetch(proxyUrl);
                        priceData = await proxyResponse.json();
                    } catch (proxyError) {
                        ComplianceUtils.log('Dashboard', 'Proxy fetch failed, using API service: ' + proxyError.message, 'warn');
                        // Final fallback through API service
                        priceData = await this.app.apiService.fetchBitcoinPrice();
                    }
                }
                
                console.log('[Dashboard] Price data received:', priceData);
                // Handle both nested and flat response structures
                const btcPrice = priceData?.bitcoin?.[selectedCurrency] || priceData?.[selectedCurrency] || priceData?.bitcoin?.usd || priceData?.usd || 0;
                console.log(`[Dashboard] BTC price extracted for ${selectedCurrency.toUpperCase()}:`, btcPrice);
                
                // Store the price in app state for use in charts
                this.app.state.set('btcPrice', btcPrice);
                this.app.btcPrice = btcPrice;
                
                // Update network info
                const networkInfo = await this.app.apiService.fetchNetworkInfo();
                
                // Update block height in main display
                const blockElement = document.getElementById('block-height');
                if (blockElement) {
                    blockElement.textContent = networkInfo.height ? networkInfo.height.toLocaleString() : '000000';
                }
                
                // Update network status card elements
                const sparkNetworkStatus = document.getElementById('sparkNetworkStatus');
                if (sparkNetworkStatus) {
                    sparkNetworkStatus.textContent = networkInfo.connected ? 'Connected' : 'Disconnected';
                    sparkNetworkStatus.style.color = networkInfo.connected ? 'var(--primary)' : '#ff3333';
                }
                
                const blockHeightElement = document.getElementById('blockHeight');
                if (blockHeightElement) {
                    blockHeightElement.textContent = networkInfo.height ? networkInfo.height.toLocaleString() : '000000';
                }
                
                // Get current account and fetch fresh balance
                const currentAccount = this.app.state.getCurrentAccount();
                if (currentAccount && currentAccount.addresses) {
                    // Get the selected wallet type to determine which address to use
                    const walletType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'nativeSegWit'; // Default to nativeSegWit
                    let address = '';
                    
                    // Select the appropriate address based on wallet type
                    switch(walletType) {
                        case 'segwit':
                        case 'nativeSegWit':
                            address = currentAccount.addresses.segwit || currentAccount.addresses.bitcoin || '';
                            break;
                        case 'nestedSegWit':
                            address = currentAccount.addresses.nestedSegWit || currentAccount.addresses.nestedSegwit || '';
                            break;
                        case 'legacy':
                            address = currentAccount.addresses.legacy || '';
                            break;
                        case 'spark':
                            address = currentAccount.addresses.spark || '';
                            break;
                        case 'taproot':
                        default:
                            address = currentAccount.addresses.taproot || '';
                            break;
                    }
                    
                    if (address) {
                        console.log('[Dashboard] Fetching balance for address:', address, 'Type:', walletType);
                        
                        try {
                        
                        // Don't fetch balance for Spark addresses using Bitcoin API
                        if (walletType === 'spark') {
                            console.log('[Dashboard] Spark Protocol address - setting balance to 0');
                            // For Spark Protocol, we would need a different API
                            // For now, just show 0 balance
                            const btcBalance = 0;
                            const currencyValue = 0;
                            
                            // Update UI elements
                            this.updateBalanceDisplay(btcBalance, currencyValue, btcPrice, selectedCurrency, currencyInfo);
                            
                            // Also update the wallet selector balance display
                            const balanceElement = document.getElementById('selectedWalletBalance');
                            if (balanceElement) {
                                balanceElement.textContent = btcBalance.toFixed(8) + ' BTC';
                            }
                            
                            // Refresh the balance chart for Spark wallet (0 balance)
                            const chartSection = document.getElementById('balanceChartSection');
                            if (chartSection) {
                                console.log('[Dashboard] Refreshing balance chart for Spark wallet');
                                // Clear existing content
                                while (chartSection.firstChild) {
                                    chartSection.removeChild(chartSection.firstChild);
                                }
                                // Re-create the chart with 0 balance
                                const newChart = this.createBalanceChart();
                                chartSection.appendChild(newChart);
                            }
                            
                            return;
                        }
                        
                        // Fetch fresh balance from blockchain
                        const balanceData = await this.app.apiService.fetchAddressBalance(address);
                        console.log('[Dashboard] Balance data received:', balanceData);
                        
                        // Balance is in satoshis from the API
                        const balanceSats = balanceData.balance || 0;
                        const btcBalance = balanceSats / 100000000; // Convert from satoshis
                        const currencyValue = btcBalance * btcPrice;
                        
                        console.log('[Dashboard] Balance calculations:', { balanceSats, btcBalance, currencyValue, currency: selectedCurrency });
                        
                        // Update the account's balance in state
                        currentAccount.balances = currentAccount.balances || {};
                        currentAccount.balances.bitcoin = balanceSats;
                        currentAccount.balances[selectedCurrency] = currencyValue;
                        
                        // Update UI elements - check both ID variations
                        const btcElement = document.getElementById('btc-balance') || document.getElementById('btcBalance');
                        const usdElement = document.getElementById('usd-balance') || document.getElementById('btcUsdValue');
                        
                        if (btcElement) {
                            // Update the complete text for BTC balance display
                            if (btcElement.id === 'btcBalance') {
                                const balanceText = `${btcBalance.toFixed(8)} BTC`;
                                btcElement.setAttribute('data-original', balanceText);
                                // Only show if not hidden
                                if (!this.app.state.get('isBalanceHidden')) {
                                    btcElement.textContent = balanceText;
                                } else {
                                    btcElement.textContent = '••••••••';
                                }
                            } else {
                                btcElement.setAttribute('data-original', btcBalance.toFixed(8));
                                if (!this.app.state.get('isBalanceHidden')) {
                                    btcElement.textContent = btcBalance.toFixed(8);
                                } else {
                                    btcElement.textContent = '••••••••';
                                }
                            }
                            console.log('[Dashboard] Updated BTC balance display:', btcBalance.toFixed(8));
                        } else {
                            console.warn('[Dashboard] BTC balance element not found');
                        }
                        
                        if (usdElement) {
                            // Update the currency value display
                            const currencyText = this.formatCurrencyValue(currencyValue, selectedCurrency);
                            usdElement.setAttribute('data-original', currencyText);
                            // Only show if not hidden
                            if (!this.app.state.get('isBalanceHidden')) {
                                usdElement.textContent = currencyText;
                            } else {
                                usdElement.textContent = '••••••••';
                            }
                            console.log(`[Dashboard] Updated ${selectedCurrency.toUpperCase()} balance display:`, currencyText);
                        } else {
                            console.warn('[Dashboard] Currency value element not found');
                        }
                        
                        // Update currency symbol and code
                        const symbolElement = document.getElementById('currencySymbol');
                        const codeElement = document.getElementById('currencyCode');
                        
                        if (symbolElement) {
                            symbolElement.textContent = currencyInfo.symbol;
                        }
                        
                        if (codeElement) {
                            codeElement.textContent = selectedCurrency.toUpperCase();
                        }
                        
                        // Also update wallet selector balance displays
                        const walletSelectorBalances = document.querySelectorAll('#selectedWalletBalance, #selected-wallet-balance');
                        walletSelectorBalances.forEach(element => {
                            if (element) {
                                const balanceText = `${btcBalance.toFixed(8)} BTC`;
                                element.setAttribute('data-original', balanceText);
                                // Only show if not hidden
                                if (!this.app.state.get('isBalanceHidden')) {
                                    element.textContent = balanceText;
                                } else {
                                    element.textContent = '••••••••';
                                }
                            }
                        });
                        console.log('[Dashboard] Updated wallet selector balances');
                        
                        // Refresh the balance chart after balance update
                        const chartSection = document.getElementById('balanceChartSection');
                        if (chartSection) {
                            console.log('[Dashboard] Refreshing balance chart after balance update');
                            // Clear existing content
                            while (chartSection.firstChild) {
                                chartSection.removeChild(chartSection.firstChild);
                            }
                            // Re-create the chart with updated balance
                            const newChart = this.createBalanceChart();
                            chartSection.appendChild(newChart);
                        }
                        
                        } catch (error) {
                            console.error('[Dashboard] Error fetching balance:', error);
                            this.app.showNotification('Failed to fetch balance', 'error');
                            // Set balance to 0 on error
                            this.updateBalanceDisplay(0, 0, btcPrice, selectedCurrency, currencyInfo);
                        }
                    } else {
                        // No address available for selected wallet type
                        console.log('[Dashboard] No address available for wallet type:', walletType);
                        this.updateBalanceDisplay(0, 0, btcPrice, selectedCurrency, currencyInfo);
                    }
                }
                
                // Also fetch ordinals count if we have a taproot address
                if (currentAccount && currentAccount.addresses?.taproot) {
                    console.log('[Dashboard] Fetching ordinals count in balance refresh');
                    // Use proper method binding
                    if (typeof this.fetchOrdinalsCount === 'function') {
                        this.fetchOrdinalsCount().catch(err => {
                            console.error('[Dashboard] Failed to fetch ordinals in refresh:', err);
                        });
                    } else {
                        console.error('[Dashboard] fetchOrdinalsCount method not found on this instance');
                        // Try to find it on the dashboard instance
                        const dashboard = this.app?.router?.currentPageInstance;
                        if (dashboard && typeof dashboard.fetchOrdinalsCount === 'function') {
                            dashboard.fetchOrdinalsCount().catch(err => {
                                console.error('[Dashboard] Failed to fetch ordinals via dashboard instance:', err);
                            });
                        }
                    }
                }
                
            } catch (error) {
                console.error('Failed to refresh balances:', error);
                this.app.showNotification('Failed to update balances', 'error');
            }
        }
        
        updateBalanceDisplay(btcBalance, currencyValue, btcPrice, selectedCurrency, currencyInfo) {
            // If currency parameters not provided, get them
            if (!selectedCurrency || !currencyInfo) {
                currencyInfo = this.getCurrencyInfo();
                selectedCurrency = currencyInfo.code;
            }
            
            console.log('[Dashboard] updateBalanceDisplay called with:', { btcBalance, currencyValue, btcPrice, selectedCurrency });
            // Update UI elements - check both ID variations
            const btcElement = document.getElementById('btc-balance') || document.getElementById('btcBalance');
            const valueElement = document.getElementById('usd-balance') || document.getElementById('btcUsdValue');
            
            if (btcElement) {
                const balanceText = btcElement.id === 'btcBalance' ? `${btcBalance.toFixed(8)} BTC` : btcBalance.toFixed(8);
                btcElement.setAttribute('data-original', balanceText);
                // Only show if not hidden
                if (!this.app.state.get('isBalanceHidden')) {
                    btcElement.textContent = balanceText;
                } else {
                    btcElement.textContent = '••••••••';
                }
            }
            
            if (valueElement) {
                const currencyText = this.formatCurrencyValue(currencyValue, selectedCurrency);
                valueElement.setAttribute('data-original', currencyText);
                // Only show if not hidden
                if (!this.app.state.get('isBalanceHidden')) {
                    valueElement.textContent = currencyText;
                } else {
                    valueElement.textContent = '••••••••';
                }
            }
            
            // Update currency symbol and code
            const symbolElement = document.getElementById('currencySymbol');
            const codeElement = document.getElementById('currencyCode');
            
            if (symbolElement) {
                symbolElement.textContent = currencyInfo.symbol;
            }
            
            if (codeElement) {
                codeElement.textContent = selectedCurrency.toUpperCase();
            }
            
            // Also update wallet selector balance displays
            const walletSelectorBalances = document.querySelectorAll('#selectedWalletBalance, #selected-wallet-balance');
            walletSelectorBalances.forEach(element => {
                if (element) {
                    const balanceText = `${btcBalance.toFixed(8)} BTC`;
                    element.setAttribute('data-original', balanceText);
                    // Only show if not hidden
                    if (!this.app.state.get('isBalanceHidden')) {
                        element.textContent = balanceText;
                    } else {
                        element.textContent = '••••••••';
                    }
                }
            });
            
            // Refresh the balance chart with the new data
            const chartSection = document.getElementById('balanceChartSection');
            if (chartSection) {
                // Clear existing content
                while (chartSection.firstChild) {
                    chartSection.removeChild(chartSection.firstChild);
                }
                // Re-create the chart with updated balance
                const newChart = this.createBalanceChart();
                chartSection.appendChild(newChart);
            }
        }
        
        async fetchTransactionHistory() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount || !currentAccount.addresses.taproot) return;
            
            try {
                const txs = await this.app.apiService.fetchTransactionHistory(currentAccount.addresses.taproot);
                this.updateTransactionList(txs);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        }
        
        updateTransactionList(transactions) {
            const listElement = document.getElementById('transaction-list');
            if (!listElement) return;
            
            if (transactions.length === 0) {
                listElement.innerHTML = '';
                listElement.appendChild(this.createEmptyTransactions());
                return;
            }
            
            const $ = window.ElementFactory || ElementFactory;
            listElement.innerHTML = '';
            
            transactions.forEach(tx => {
                const date = new Date(tx.time * 1000);
                const isReceive = tx.value > 0;
                
                const txElement = $.div({ className: 'transaction-item' }, [
                    $.div({ className: 'tx-icon' }, [isReceive ? '↙' : '↗']),
                    $.div({ className: 'tx-details' }, [
                        $.div({ className: 'tx-type' }, [isReceive ? 'Received' : 'Sent']),
                        $.div({ className: 'tx-date' }, [date.toLocaleDateString()])
                    ]),
                    $.div({ className: 'tx-amount' }, [
                        $.span({ 
                            className: isReceive ? 'amount-positive' : 'amount-negative' 
                        }, [(tx.value / 100000000).toFixed(8)]),
                        $.span({ className: 'btc-unit' }, [' BTC'])
                    ])
                ]);
                
                listElement.appendChild(txElement);
            });
        }
        
        updateAccountIndicator() {
            const currentAccount = this.app.state.getCurrentAccount();
            const indicator = document.querySelector('.account-indicator');
            if (indicator && currentAccount) {
                indicator.textContent = `Active: ${currentAccount.name}`;
            }
        }
        
        switchWalletType(event) {
            const selector = event ? event.target : document.getElementById('walletTypeSelector') || document.getElementById('wallet-type-selector');
            if (selector) {
                const walletType = selector.value;
                
                // Save selected wallet type to state and localStorage
                this.app.state.set('selectedWalletType', walletType);
                localStorage.setItem('selectedWalletType', walletType);
                
                // Update the address display
                this.updateAddressDisplay();
                
                // Update the label in the wallet selector display
                const labelElement = document.getElementById('selected-wallet-label');
                if (labelElement) {
                    const labels = {
                        'taproot': 'Bitcoin Taproot Address:',
                        'nativeSegWit': 'Bitcoin Native SegWit Address:',
                        'nestedSegWit': 'Bitcoin Nested SegWit Address:',
                        'legacy': 'Bitcoin Legacy Address:',
                        'spark': 'Spark Protocol Address:'
                    };
                    labelElement.textContent = labels[walletType] || 'Bitcoin Address:';
                }
                
                // Show notification
                const walletNames = {
                    'taproot': 'Bitcoin Taproot',
                    'nativeSegWit': 'Bitcoin Native SegWit',
                    'nestedSegWit': 'Bitcoin Nested SegWit',
                    'legacy': 'Bitcoin Legacy',
                    'spark': 'Spark Protocol'
                };
                this.app.showNotification(`Switched to ${walletNames[walletType] || walletType} wallet`, 'success');
                
                // Update ordinals display based on wallet type
                const ordinalsSection = document.getElementById('ordinalsSection');
                if (ordinalsSection) {
                    if (walletType === 'taproot') {
                        ordinalsSection.style.display = 'block';
                        // Fetch ordinals count when switching to taproot
                        this.fetchOrdinalsCount();
                    } else {
                        ordinalsSection.style.display = 'none';
                    }
                }
            }
        }
        
        updateAddressDisplay() {
            // Get the current wallet address
            const currentAddress = this.getCurrentWalletAddress();
            
            // Update the main address display under the buttons with truncated version
            const currentAddressElement = document.getElementById('currentWalletAddress');
            if (currentAddressElement) {
                currentAddressElement.textContent = this.truncateAddress(currentAddress);
                // Store full address as data attribute for copy function
                currentAddressElement.setAttribute('data-full-address', currentAddress);
            }
            
            // Update all instances of selectedWalletAddress
            const selectedAddressElements = document.querySelectorAll('#selectedWalletAddress, #selected-wallet-address');
            selectedAddressElements.forEach(element => {
                if (element) {
                    element.textContent = currentAddress;
                }
            });
            
            // Also trigger balance refresh for the selected address type
            if (this.refreshBalances) {
                this.refreshBalances();
            }
        }
        
        openSelectedWalletExplorer() {
            const addressElement = document.getElementById('selected-wallet-address') || document.getElementById('selectedWalletAddress');
            if (!addressElement || !addressElement.textContent || addressElement.textContent === 'Select wallet to view address') {
                this.app.showNotification('No address selected', 'error');
                return;
            }
            
            const address = addressElement.textContent;
            const selectedType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'nativeSegWit';
            
            let explorerUrl = '';
            
            // Choose explorer based on wallet type and network
            const isMainnet = this.app.state.get('isMainnet');
            
            if (selectedType === 'spark') {
                // Spark Protocol uses their own explorer
                explorerUrl = `https://sparkscan.io/address/${address}`;
            } else {
                // All Bitcoin address types use Mempool.space
                if (isMainnet) {
                    explorerUrl = `https://mempool.space/address/${address}`;
                } else {
                    explorerUrl = `https://mempool.space/testnet/address/${address}`;
                }
            }
            
            // Open in new tab
            window.open(explorerUrl, '_blank');
            this.app.showNotification('Opening blockchain explorer...', 'success');
        }
        
        copySelectedWalletAddress() {
            const addressElement = document.getElementById('selected-wallet-address');
            if (addressElement && addressElement.textContent !== 'Select wallet to view address') {
                navigator.clipboard.writeText(addressElement.textContent);
                this.app.showNotification('Address copied to clipboard', 'success');
            }
        }
        
        showMultiAccountManager() {
            const modal = new AccountListModal(this.app);
            modal.show();
        }
        
        showWalletManager() {
            const WalletManagerModal = window.WalletManagerModal;
            if (WalletManagerModal) {
                const modal = new WalletManagerModal(this.app);
                modal.show();
            } else {
                this.app.showNotification('Wallet Manager not available yet', 'error');
            }
        }
        
        toggleWalletDropdown(e) {
            e.stopPropagation();
            
            // Check if dropdown already exists
            const existingDropdown = document.getElementById('wallet-quick-dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
                return;
            }
            
            if (!this.app.walletManager) return;
            
            const $ = window.ElementFactory || window.$;
            const wallets = this.app.walletManager.getAllWallets();
            const activeWalletId = this.app.walletManager.activeWalletId;
            
            // Create dropdown
            const dropdown = $.div({
                id: 'wallet-quick-dropdown',
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '4px',
                    background: '#000',
                    border: '1px solid #ff44ff',
                    borderRadius: '0',
                    minWidth: '200px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: '10000',
                    boxShadow: '0 2px 10px rgba(255, 68, 255, 0.3)'
                }
            }, wallets.map(wallet => 
                $.div({
                    style: {
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: wallet.id === activeWalletId ? '#ff44ff' : '#888',
                        background: wallet.id === activeWalletId ? 'rgba(255, 68, 255, 0.1)' : 'transparent',
                        cursor: wallet.id === activeWalletId ? 'default' : 'pointer',
                        borderBottom: '1px solid #222',
                        transition: 'all 0.2s ease'
                    },
                    onmouseover: (e) => {
                        if (wallet.id !== activeWalletId) {
                            e.currentTarget.style.background = 'rgba(255, 68, 255, 0.05)';
                            e.currentTarget.style.color = '#ff44ff';
                        }
                    },
                    onmouseout: (e) => {
                        if (wallet.id !== activeWalletId) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#888';
                        }
                    },
                    onclick: () => {
                        if (wallet.id !== activeWalletId) {
                            this.app.walletManager.switchWallet(wallet.id);
                            dropdown.remove();
                        }
                    }
                }, [
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }
                    }, [
                        $.span({}, [wallet.name]),
                        wallet.id === activeWalletId && $.span({
                            style: {
                                fontSize: '9px',
                                color: '#ff44ff',
                                marginLeft: '8px'
                            }
                        }, ['(active)'])
                    ]),
                    $.div({
                        style: {
                            fontSize: '9px',
                            color: '#666',
                            marginTop: '2px'
                        }
                    }, [`${this.app.walletManager.getWalletStats(wallet.id).accountCount} accounts`])
                ])
            ));
            
            // Add to parent container
            e.currentTarget.parentElement.appendChild(dropdown);
            
            // Close on outside click
            const closeDropdown = (event) => {
                if (!dropdown.contains(event.target) && event.target !== e.currentTarget) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 0);
        }
        
        getCurrentWalletName() {
            if (!this.app.walletManager) {
                return 'Main Wallet';
            }
            
            const activeWallet = this.app.walletManager.getActiveWallet();
            return activeWallet ? activeWallet.name : 'Main Wallet';
        }
        
        getAccountDisplayName() {
            const accounts = this.app.state.get('accounts') || [];
            const currentAccountId = this.app.state.get('currentAccountId');
            
            console.log('[Dashboard] Getting account display name - accounts:', accounts.length, 'currentId:', currentAccountId);
            
            if (accounts.length === 0) {
                // Check if we have a legacy wallet without multi-account support
                const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                const hasLegacyWallet = sparkWallet.addresses || this.app.state.get('currentWallet')?.isInitialized;
                
                if (hasLegacyWallet) {
                    return 'Account 1'; // Default for legacy single account
                }
                return 'No Account';
            }
            
            const currentAccount = accounts.find(acc => acc.id === currentAccountId);
            console.log('[Dashboard] Current account:', currentAccount);
            
            return currentAccount ? `Active: ${currentAccount.name}` : 'Active: Account 1';
        }
        
        showTokenMenu() {
            const modal = new TokenMenuModal(this.app);
            modal.show();
        }
        
        showOrdinalsTerminal() {
            const modal = new OrdinalsModal(this.app);
            modal.show();
        }
        
        toggleBalanceVisibility() {
            // Toggle the hidden state
            const isHidden = this.app.state.get('isBalanceHidden');
            this.app.state.set('isBalanceHidden', !isHidden);
            
            // Get all balance elements
            const btcBalance = document.getElementById('btcBalance');
            const btcUsdValue = document.getElementById('btcUsdValue');
            const lightningBalance = document.getElementById('lightningBalance');
            const stablecoinBalance = document.getElementById('stablecoinBalance');
            const ordinalsCount = document.getElementById('ordinalsCount');
            
            // Also get wallet selector balance elements
            const walletSelectorBalances = document.querySelectorAll('#selectedWalletBalance, #selected-wallet-balance');
            
            if (!isHidden) {
                // Hide balances
                if (btcBalance) {
                    btcBalance.setAttribute('data-original', btcBalance.textContent);
                    btcBalance.textContent = '••••••••';
                }
                if (btcUsdValue) {
                    btcUsdValue.setAttribute('data-original', btcUsdValue.textContent);
                    btcUsdValue.textContent = '••••••••';
                }
                if (lightningBalance) {
                    lightningBalance.setAttribute('data-original', lightningBalance.textContent);
                    lightningBalance.textContent = '••••••••';
                }
                if (stablecoinBalance) {
                    stablecoinBalance.setAttribute('data-original', stablecoinBalance.textContent);
                    stablecoinBalance.textContent = '••••••••';
                }
                if (ordinalsCount) {
                    ordinalsCount.setAttribute('data-original', ordinalsCount.textContent);
                    ordinalsCount.textContent = '••••••••';
                }
                
                // Hide wallet selector balances
                walletSelectorBalances.forEach(element => {
                    if (element) {
                        element.setAttribute('data-original', element.textContent);
                        element.textContent = '••••••••';
                    }
                });
            } else {
                // Show balances
                if (btcBalance) {
                    const original = btcBalance.getAttribute('data-original');
                    if (original) btcBalance.textContent = original;
                }
                if (btcUsdValue) {
                    const original = btcUsdValue.getAttribute('data-original');
                    if (original) btcUsdValue.textContent = original;
                }
                if (lightningBalance) {
                    const original = lightningBalance.getAttribute('data-original');
                    if (original) lightningBalance.textContent = original;
                }
                if (stablecoinBalance) {
                    const original = stablecoinBalance.getAttribute('data-original');
                    if (original) stablecoinBalance.textContent = original;
                }
                if (ordinalsCount) {
                    const original = ordinalsCount.getAttribute('data-original');
                    if (original) ordinalsCount.textContent = original;
                }
                
                // Show wallet selector balances
                walletSelectorBalances.forEach(element => {
                    if (element) {
                        const original = element.getAttribute('data-original');
                        if (original) element.textContent = original;
                    }
                });
                
                // Refresh balances to get latest values
                if (this.refreshBalances) {
                    this.refreshBalances();
                }
            }
            
            // Update chart by refreshing it completely
            // This ensures the chart respects the hidden state
            if (this.refreshDashboard) {
                this.refreshDashboard();
            } else {
                // Fallback: recreate chart if dashboard instance not available
                const chartSection = document.getElementById('balanceChartSection');
                if (chartSection && this.createBalanceChart) {
                    while (chartSection.firstChild) {
                        chartSection.removeChild(chartSection.firstChild);
                    }
                    const newChart = this.createBalanceChart();
                    chartSection.appendChild(newChart);
                }
            }
            
            // Update the button text
            const hideShowButtons = document.querySelectorAll('.dashboard-btn');
            hideShowButtons.forEach(btn => {
                if (btn.textContent === 'Hide' || btn.textContent === 'Show') {
                    btn.textContent = isHidden ? 'Hide' : 'Show';
                }
            });
            
            this.app.showNotification(isHidden ? 'Balances shown' : 'Balances hidden', 'success');
        }
        
        showCurrencyDropdown(event) {
            // Prevent button click from propagating
            event.stopPropagation();
            
            // Remove any existing dropdown
            const existingDropdown = document.getElementById('dashboard-currency-dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
                return;
            }
            
            const $ = window.ElementFactory || ElementFactory;
            
            // Get button position
            const button = event.currentTarget;
            const rect = button.getBoundingClientRect();
            
            // Check if we're in Moosh mode
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const themeColor = isMooshMode ? '#69fd97' : '#f57315';
            
            // Add custom scrollbar styles
            const styleId = 'currency-dropdown-scrollbar-styles';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    #dashboard-currency-dropdown::-webkit-scrollbar {
                        width: 8px;
                    }
                    #dashboard-currency-dropdown::-webkit-scrollbar-track {
                        background: #000;
                        border-left: 1px solid ${themeColor};
                    }
                    #dashboard-currency-dropdown::-webkit-scrollbar-thumb {
                        background: ${themeColor};
                        border-radius: 0;
                    }
                    #dashboard-currency-dropdown::-webkit-scrollbar-thumb:hover {
                        background: ${isMooshMode ? '#7fffb3' : '#ff8c42'};
                    }
                    
                    /* Firefox scrollbar */
                    #dashboard-currency-dropdown {
                        scrollbar-width: thin;
                        scrollbar-color: ${themeColor} #000;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Create dropdown container
            const dropdown = $.div({
                id: 'dashboard-currency-dropdown',
                style: {
                    position: 'absolute',
                    top: `${rect.bottom + 5}px`,
                    left: `${rect.left}px`,
                    zIndex: '10000',
                    background: '#000',
                    border: `2px solid ${themeColor}`,
                    borderRadius: '0',
                    minWidth: '200px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px'
                }
            }, []);
            
            // Get supported currencies from AccountListModal
            const supportedCurrencies = [
                { code: 'usd', symbol: '$', name: 'US Dollar' },
                { code: 'eur', symbol: '€', name: 'Euro' },
                { code: 'gbp', symbol: '£', name: 'British Pound' },
                { code: 'jpy', symbol: '¥', name: 'Japanese Yen' },
                { code: 'cad', symbol: 'C$', name: 'Canadian Dollar' },
                { code: 'aud', symbol: 'A$', name: 'Australian Dollar' },
                { code: 'chf', symbol: 'Fr', name: 'Swiss Franc' },
                { code: 'cny', symbol: '¥', name: 'Chinese Yuan' },
                { code: 'inr', symbol: '₹', name: 'Indian Rupee' },
                { code: 'krw', symbol: '₩', name: 'South Korean Won' },
                { code: 'brl', symbol: 'R$', name: 'Brazilian Real' },
                { code: 'mxn', symbol: 'Mex$', name: 'Mexican Peso' },
                { code: 'rub', symbol: '₽', name: 'Russian Ruble' },
                { code: 'zar', symbol: 'R', name: 'South African Rand' },
                { code: 'aed', symbol: 'د.إ', name: 'UAE Dirham' },
                { code: 'sgd', symbol: 'S$', name: 'Singapore Dollar' },
                { code: 'hkd', symbol: 'HK$', name: 'Hong Kong Dollar' },
                { code: 'nzd', symbol: 'NZ$', name: 'New Zealand Dollar' },
                { code: 'sek', symbol: 'kr', name: 'Swedish Krona' },
                { code: 'nok', symbol: 'kr', name: 'Norwegian Krone' },
                { code: 'try', symbol: '₺', name: 'Turkish Lira' },
                { code: 'thb', symbol: '฿', name: 'Thai Baht' },
                { code: 'pln', symbol: 'zł', name: 'Polish Złoty' },
                { code: 'php', symbol: '₱', name: 'Philippine Peso' },
                { code: 'idr', symbol: 'Rp', name: 'Indonesian Rupiah' }
            ];
            
            const currentCurrency = localStorage.getItem('mooshPreferredCurrency') || 'usd';
            
            // Add currency options
            supportedCurrencies.forEach(currency => {
                const option = $.div({
                    style: {
                        padding: '10px 15px',
                        cursor: 'pointer',
                        color: currency.code === currentCurrency ? '#000' : themeColor,
                        background: currency.code === currentCurrency ? themeColor : 'transparent',
                        borderBottom: '1px solid #333',
                        transition: 'all 0.2s ease'
                    },
                    onmouseover: (e) => {
                        if (currency.code !== currentCurrency) {
                            e.currentTarget.style.background = '#1a1a1a';
                            e.currentTarget.style.color = isMooshMode ? '#7fffb3' : '#ff8c42';
                        }
                    },
                    onmouseout: (e) => {
                        if (currency.code !== currentCurrency) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = themeColor;
                        }
                    },
                    onclick: () => {
                        this.changeDashboardCurrency(currency.code);
                        dropdown.remove();
                        // Remove the scrollbar styles when dropdown closes
                        const styleEl = document.getElementById(styleId);
                        if (styleEl) styleEl.remove();
                    }
                }, [`${currency.symbol} ${currency.code.toUpperCase()} - ${currency.name}`]);
                
                dropdown.appendChild(option);
            });
            
            // Add to document
            document.body.appendChild(dropdown);
            
            // Close dropdown when clicking elsewhere
            const closeDropdown = (e) => {
                if (!dropdown.contains(e.target) && e.target !== button) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                    // Remove the scrollbar styles when dropdown closes
                    const styleEl = document.getElementById(styleId);
                    if (styleEl) styleEl.remove();
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 0);
        }
        
        changeDashboardCurrency(currency) {
            // Save preference
            localStorage.setItem('mooshPreferredCurrency', currency);
            this.app.state.set('dashboardCurrency', currency);
            
            // Update button text
            const currencyButtons = document.querySelectorAll('.dashboard-btn');
            currencyButtons.forEach(btn => {
                const span = btn.querySelector('span');
                if (span && span.textContent.length === 3) {
                    // This is likely our currency button
                    span.textContent = currency.toUpperCase();
                }
            });
            
            // Update USD value display if visible
            const btcUsdValue = document.getElementById('btcUsdValue');
            if (btcUsdValue && !btcUsdValue.textContent.includes('•')) {
                // Get BTC balance
                const btcBalanceEl = document.getElementById('btcBalance');
                if (btcBalanceEl) {
                    const btcText = btcBalanceEl.textContent;
                    const btcMatch = btcText.match(/(\d+\.?\d*)/);
                    
                    if (btcMatch) {
                        const btcAmount = parseFloat(btcMatch[1]);
                        
                        // Refresh to get new prices in the selected currency
                        this.refreshBalances();
                        
                        // Also update AccountListModal if it exists
                        if (window.accountListModalInstance) {
                            const modal = window.accountListModalInstance;
                            modal.selectedCurrency = currency;
                            modal.changeCurrency(currency);
                        }
                    }
                }
            }
            
            // Refresh the chart to update currency display
            if (this.refreshDashboard) {
                this.refreshDashboard();
            }
            
            // Show notification
            this.app.showNotification(`Currency changed to ${currency.toUpperCase()}`, 'success');
        }
        
        showStablecoinSwap() {
            this.app.showNotification('Stablecoin swap coming soon', 'info');
        }
        
        openLightningChannel() {
            this.app.showNotification('Lightning channel management coming soon', 'info');
        }
        
        // New dashboard features
        createPriceTicker() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Fetch initial data asynchronously - use debounced version
            this.debouncedUpdateLiveData();
            
            return $.div({ 
                className: 'price-ticker',
                style: 'background: #000000; border: 1px solid #333333; border-radius: 0; padding: 8px 16px; margin-bottom: 16px; font-family: JetBrains Mono, monospace; font-size: 11px; color: #888888; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;'
            }, [
                $.span({}, [
                    'BTC: $',
                    $.span({ id: 'btcPrice', style: 'color: #f57315; font-weight: 600;' }, ['0.00']),
                    ' ',
                    $.span({ id: 'priceChange', style: 'color: #69fd97;' }, [''])
                ]),
                $.span({}, [
                    'Next Block: ~',
                    $.span({ id: 'nextBlock', style: 'color: #f57315;' }, ['10']),
                    ' min'
                ]),
                $.span({}, [
                    'Fee: ',
                    $.span({ id: 'feeRate', style: 'color: #f57315;' }, ['1']),
                    ' sat/vB'
                ])
            ]);
        }
        
        async updateLiveData() {
            try {
                // Fetch Bitcoin price
                const priceData = await this.app.apiService.fetchBitcoinPrice();
                const priceElement = document.getElementById('btcPrice');
                const changeElement = document.getElementById('priceChange');
                
                // Handle both response formats
                const btcPriceValue = priceData?.bitcoin?.usd || priceData?.usd || 0;
                const priceChange = priceData?.bitcoin?.usd_24h_change || priceData?.usd_24h_change || 0;
                
                // Store the price in app state for use in charts and other components
                if (btcPriceValue > 0) {
                    this.app.state.set('btcPrice', btcPriceValue);
                    this.app.btcPrice = btcPriceValue;
                }
                
                if (priceElement && btcPriceValue) {
                    priceElement.textContent = btcPriceValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
                
                if (changeElement && priceChange !== undefined) {
                    const change = priceChange;
                    const arrow = change >= 0 ? '↑' : '↓';
                    const color = change >= 0 ? '#69fd97' : '#ff4444';
                    changeElement.textContent = `${arrow} ${Math.abs(change).toFixed(1)}%`;
                    changeElement.style.color = color;
                }
                
                // Fetch mempool data
                this.updateMempoolData();
                
                // Fetch and update network status
                const networkInfo = await this.app.apiService.fetchNetworkInfo();
                
                // Update network status elements
                const sparkNetworkStatus = document.getElementById('sparkNetworkStatus');
                if (sparkNetworkStatus) {
                    sparkNetworkStatus.textContent = networkInfo.connected ? 'Connected' : 'Disconnected';
                    sparkNetworkStatus.style.color = networkInfo.connected ? 'var(--primary)' : '#ff3333';
                }
                
                const blockHeightElement = document.getElementById('blockHeight');
                if (blockHeightElement) {
                    blockHeightElement.textContent = networkInfo.height ? networkInfo.height.toLocaleString() : '000000';
                }
                
                // Also refresh account balances when updating live data
                if (this.refreshBalances) {
                    await this.refreshBalances();
                }
                
            } catch (error) {
                ComplianceUtils.log('Dashboard', 'Failed to update live data: ' + error.message, 'error');
                // Set fallback values on error
                const priceElement = document.getElementById('btcPrice');
                if (priceElement) {
                    // Try to use last known price instead of 0
                    const lastPrice = this.app.state.get('btcPrice') || 0;
                    priceElement.textContent = lastPrice > 0 ? lastPrice.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) : '0.00';
                }
            }
        }
        
        async updateMempoolData() {
            try {
                // Fetch recommended fees from mempool.space
                const feesResponse = await fetch('https://mempool.space/api/v1/fees/recommended', {
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const feesData = await feesResponse.json();
                
                const feeElement = document.getElementById('feeRate');
                if (feeElement && feesData.halfHourFee) {
                    feeElement.textContent = feesData.halfHourFee.toString();
                }
                
                // Fetch latest blocks from mempool.space
                const blocksResponse = await fetch('https://mempool.space/api/blocks/0', {
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const blocks = await blocksResponse.json();
                
                if (blocks && blocks.length > 0) {
                    // Calculate time since last block
                    const lastBlockTime = blocks[0].timestamp;
                    const currentTime = Date.now() / 1000;
                    const minutesSinceLastBlock = Math.floor((currentTime - lastBlockTime) / 60);
                    const estimatedTimeToNext = Math.max(1, 10 - minutesSinceLastBlock);
                    
                    const blockElement = document.getElementById('nextBlock');
                    if (blockElement) {
                        blockElement.textContent = estimatedTimeToNext.toString();
                    }
                }
            } catch (error) {
                console.error('Failed to fetch mempool data:', error);
                // Try backup endpoint
                try {
                    const backupResponse = await fetch('https://api.blockchain.info/stats');
                    const backupData = await backupResponse.json();
                    
                    const feeElement = document.getElementById('feeRate');
                    if (feeElement) {
                        // Estimate fee based on market price (rough approximation)
                        const estimatedFee = Math.round(backupData.market_price_usd * 0.0001);
                        feeElement.textContent = estimatedFee.toString();
                    }
                    
                    const blockElement = document.getElementById('nextBlock');
                    if (blockElement) {
                        // Default to 10 minutes if we can't calculate
                        blockElement.textContent = '10';
                    }
                } catch (backupError) {
                    console.error('Backup API also failed:', backupError);
                    // Set fallback values on error
                    const feeElement = document.getElementById('feeRate');
                    if (feeElement) {
                        feeElement.textContent = '1';
                    }
                    const blockElement = document.getElementById('nextBlock');
                    if (blockElement) {
                        blockElement.textContent = '10';
                    }
                }
            }
        }
        
        createQuickActionsBar() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'terminal-box',
                style: 'margin-top: 24px; margin-bottom: 20px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 12px;'
                }, [
                    $.span({}, ['~/moosh/quick-actions $']),
                    $.span({ 
                        style: 'color: #f57315; margin-left: 8px;'
                    }, ['execute'])
                ]),
                $.div({ 
                    className: 'terminal-content',
                    style: 'padding: 12px; display: flex; gap: 8px; flex-wrap: wrap;'
                }, [
                    $.button({
                        style: 'background: #000000; border: 1px solid #666666; border-radius: 0; color: #f57315; font-family: JetBrains Mono, monospace; font-size: 11px; padding: 6px 12px; cursor: pointer; transition: all 0.2s ease;',
                        onclick: () => this.copyCurrentAddress(),
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#111111'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#666666'; e.currentTarget.style.background = '#000000'; }
                    }, ['Copy Address']),
                    
                    $.button({
                        style: 'background: #000000; border: 1px solid #666666; border-radius: 0; color: #f57315; font-family: JetBrains Mono, monospace; font-size: 11px; padding: 6px 12px; cursor: pointer; transition: all 0.2s ease;',
                        onclick: () => this.showQRCode(),
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#111111'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#666666'; e.currentTarget.style.background = '#000000'; }
                    }, ['Show QR']),
                    
                    $.button({
                        style: 'background: #000000; border: 1px solid #666666; border-radius: 0; color: #f57315; font-family: JetBrains Mono, monospace; font-size: 11px; padding: 6px 12px; cursor: pointer; transition: all 0.2s ease;',
                        onclick: () => this.viewOnExplorer(),
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#111111'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#666666'; e.currentTarget.style.background = '#000000'; }
                    }, ['View on Explorer']),
                    
                    $.button({
                        style: 'background: #000000; border: 1px solid #666666; border-radius: 0; color: #f57315; font-family: JetBrains Mono, monospace; font-size: 11px; padding: 6px 12px; cursor: pointer; transition: all 0.2s ease;',
                        onclick: () => this.exportXPub(),
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#111111'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#666666'; e.currentTarget.style.background = '#000000'; }
                    }, ['Export xPub']),
                    
                    $.button({
                        style: 'background: #000000; border: 1px solid #666666; border-radius: 0; color: #f57315; font-family: JetBrains Mono, monospace; font-size: 11px; padding: 6px 12px; cursor: pointer; transition: all 0.2s ease;',
                        onclick: () => this.manageUTXOs(),
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#111111'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#666666'; e.currentTarget.style.background = '#000000'; }
                    }, ['Manage UTXOs'])
                ])
            ]);
        }
        
        createWalletHealthIndicator() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'terminal-box',
                style: 'margin-bottom: 20px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 12px;'
                }, [
                    $.span({}, ['~/moosh/health $']),
                    $.span({ 
                        style: 'margin-left: 8px;'
                    }, ['status'])
                ]),
                $.div({ 
                    className: 'terminal-content',
                    style: 'padding: 12px; font-family: JetBrains Mono, monospace; font-size: 11px;'
                }, [
                    $.div({ style: 'display: flex; align-items: center; gap: 16px; flex-wrap: wrap;' }, [
                        $.span({}, [
                            'Security: ',
                            $.span({ style: 'color: #69fd97;' }, ['████████']),
                            $.span({ style: 'color: #333333;' }, ['░░']),
                            $.span({ style: 'color: #f57315; margin-left: 8px;' }, [' 80%'])
                        ]),
                        $.span({}, [
                            'Backup: ',
                            $.span({ style: 'color: #69fd97;' }, ['✓'])
                        ]),
                        $.span({}, [
                            '2FA: ',
                            $.span({ style: 'color: #ff4444;' }, ['✗'])
                        ]),
                        $.button({
                            style: 'background: transparent; border: 1px solid #666666; border-radius: 0; color: #888888; font-size: 10px; padding: 2px 8px; cursor: pointer; margin-left: auto;',
                            onclick: () => this.improvesSecurity(),
                            onmouseover: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.color = '#f57315'; },
                            onmouseout: (e) => { e.currentTarget.style.borderColor = '#666666'; e.currentTarget.style.color = '#888888'; }
                        }, ['Improve Security'])
                    ])
                ])
            ]);
        }
        
        createRecentActivityFeed() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'terminal-box',
                style: 'margin-top: 20px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 12px;'
                }, [
                    $.span({}, ['~/moosh/activity $']),
                    $.span({ 
                        style: 'color: #f57315; margin-left: 8px;'
                    }, ['tail -5'])
                ]),
                $.div({ 
                    className: 'terminal-content',
                    style: 'padding: 12px; font-family: JetBrains Mono, monospace; font-size: 11px; color: #888888;'
                }, [
                    $.div({ style: 'margin-bottom: 6px;' }, [
                        $.span({ style: 'color: #69fd97;' }, ['> ']),
                        'Received 0.00012000 BTC from bc1q... ',
                        $.span({ style: 'color: #666666;' }, ['(2 hours ago)'])
                    ]),
                    $.div({ style: 'margin-bottom: 6px;' }, [
                        $.span({ style: 'color: #ff6b6b;' }, ['> ']),
                        'Sent 0.00005000 BTC to 3A1b... ',
                        $.span({ style: 'color: #666666;' }, ['(1 day ago)'])
                    ]),
                    $.div({ style: 'margin-bottom: 6px;' }, [
                        $.span({ className: 'text-primary' }, ['> ']),
                        'Lightning payment 1,000 sats ',
                        $.span({ style: 'color: #666666;' }, ['(3 days ago)'])
                    ]),
                    $.div({ style: 'margin-bottom: 6px;' }, [
                        $.span({ style: 'color: #69fd97;' }, ['> ']),
                        'Channel opened with ACINQ ',
                        $.span({ style: 'color: #666666;' }, ['(1 week ago)'])
                    ]),
                    $.div({ style: 'margin-bottom: 0;' }, [
                        $.span({ style: 'color: #888888;' }, ['> ']),
                        'Wallet created ',
                        $.span({ style: 'color: #666666;' }, ['(2 weeks ago)'])
                    ])
                ])
            ]);
        }
        
        createKeyboardShortcutHint() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: 'text-align: center; margin-top: 20px; padding: 16px; background: rgba(245, 115, 21, 0.05); border: 1px solid rgba(245, 115, 21, 0.2); border-radius: 0;'
            }, [
                $.span({ 
                    style: 'color: #888888; font-size: 11px; font-family: JetBrains Mono, monospace;'
                }, ['Press ']),
                $.span({ 
                    style: 'color: #f57315; font-weight: 600; font-size: 12px; font-family: JetBrains Mono, monospace;'
                }, ['?']),
                $.span({ 
                    style: 'color: #888888; font-size: 11px; font-family: JetBrains Mono, monospace;'
                }, [' for keyboard shortcuts'])
            ]);
        }
        
        // Quick action methods
        copyCurrentAddress() {
            const address = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
            navigator.clipboard.writeText(address);
            this.app.showNotification('Address copied to clipboard', 'success');
        }
        
        showQRCode() {
            this.app.showNotification('QR code modal coming soon', 'info');
        }
        
        viewOnExplorer() {
            window.open('https://mempool.space/address/bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', '_blank');
        }
        
        exportXPub() {
            this.app.showNotification('xPub export requires additional verification', 'warning');
        }
        
        manageUTXOs() {
            this.app.showNotification('UTXO management interface coming soon', 'info');
        }
        
        improvesSecurity() {
            this.showWalletSettings();
        }
        
        async fetchOrdinalsCount() {
            console.log('[Dashboard] fetchOrdinalsCount called');
            
            // Check cache first
            const cacheKey = 'ordinals_cache';
            const cached = this._ordinalsCache || sessionStorage.getItem(cacheKey);
            if (cached) {
                const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
                if (data.timestamp && Date.now() - data.timestamp < 60000) { // 1 minute cache
                    console.log('[Dashboard] Using cached ordinals data');
                    this.updateOrdinalsDisplay(data.count);
                    this.ordinalsData = data.inscriptions;
                    window.CURRENT_ORDINALS_DATA = data.inscriptions;
                    return data.count;
                }
            }
            
            // Prevent multiple simultaneous requests
            if (this._fetchingOrdinals) {
                console.log('[Dashboard] Already fetching ordinals, skipping...');
                return this._fetchingOrdinals;
            }
            
            try {
                const currentAccount = this.app.state.getCurrentAccount();
                if (!currentAccount || !currentAccount.addresses?.taproot) {
                    console.log('[Dashboard] No taproot address found');
                    this.updateOrdinalsDisplay(0);
                    return 0;
                }
                
                const address = currentAccount.addresses.taproot;
                console.log('[Dashboard] Fetching ordinals for:', address);
                
                // Set loading state
                this.updateOrdinalsDisplay('Loading...');
                
                // Mark as fetching
                this._fetchingOrdinals = fetch(`${this.app.apiService.baseURL}/api/ordinals/inscriptions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                })
                .then(response => {
                    if (!response.ok) throw new Error(`API error: ${response.status}`);
                    return response.json();
                })
                .then(result => {
                    if (result.success && result.data) {
                        const inscriptions = result.data.inscriptions || [];
                        const count = inscriptions.length;
                        console.log(`[Dashboard] Found ${count} ordinals`);
                        
                        // Cache the result
                        const cacheData = {
                            count,
                            inscriptions,
                            timestamp: Date.now()
                        };
                        this._ordinalsCache = cacheData;
                        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
                        
                        // Update display
                        this.updateOrdinalsDisplay(count);
                        
                        // Store the data
                        this.ordinalsData = inscriptions;
                        window.CURRENT_ORDINALS_DATA = inscriptions;
                        
                        return count;
                    }
                    return 0;
                })
                .catch(error => {
                    console.error('[Dashboard] Error fetching ordinals:', error);
                    this.updateOrdinalsDisplay(0);
                    return 0;
                })
                .finally(() => {
                    this._fetchingOrdinals = null;
                });
                
                return await this._fetchingOrdinals;
                
            } catch (error) {
                console.error('[Dashboard] Error in fetchOrdinalsCount:', error);
                this.updateOrdinalsDisplay(0);
                return 0;
            }
        }
        
        updateOrdinalsDisplay(count) {
            const displayText = typeof count === 'number' ? `${count} NFTs` : count;
            
            // Update all possible elements
            const updateElements = [
                document.getElementById('ordinalsCount'),
                document.getElementById('ordinals-count'),
                ...document.querySelectorAll('.ordinals-count'),
                ...document.querySelectorAll('[data-ordinals-count]')
            ];
            
            updateElements.forEach(el => {
                if (el) {
                    el.textContent = displayText;
                    el.style.color = '#f57315';
                }
            });
            
            // Update text nodes
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue && (node.nodeValue.includes('0 NFTs') || node.nodeValue.includes('Loading...'))) {
                    node.nodeValue = node.nodeValue.replace(/(?:0 NFTs|Loading\.\.\.)/, displayText);
                }
            }
        }
        
        openOrdinalsGallery() {
            console.log('[Dashboard] openOrdinalsGallery called');
            
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount || !currentAccount.addresses?.taproot) {
                this.app.showNotification('No Taproot address found. Ordinals require a Taproot wallet.', 'error');
                return;
            }
            
            // Create and show the OrdinalsModal
            if (!this.app.ordinalsModal) {
                if (typeof OrdinalsModal !== 'undefined') {
                    this.app.ordinalsModal = new OrdinalsModal(this.app);
                } else {
                    this.app.showNotification('Ordinals gallery not available', 'error');
                    return;
                }
            }
            
            // Pre-populate with cached data if available
            if (this.ordinalsData && this.ordinalsData.length > 0) {
                console.log('[Dashboard] Pre-populating gallery with cached data');
                this.app.ordinalsModal.inscriptions = this.ordinalsData;
                this.app.ordinalsModal.isLoading = false;
            } else {
                this.app.ordinalsModal.isLoading = true;
            }
            
            this.app.ordinalsModal.show();
        }
        
        showExportWallet() {
            console.log('[DashboardPage] Opening export wallet modal');
            
            // Dynamically load the ExportWalletModal if not already loaded
            if (!window.ExportWalletModal) {
                const script = document.createElement('script');
                script.src = '/js/modules/modals/ExportWalletModal.js';
                script.onload = () => {
                    this.openExportModal();
                };
                document.head.appendChild(script);
            } else {
                this.openExportModal();
            }
        }
        
        openExportModal() {
            // Get current wallet data
            const currentAccount = this.app.state.get('currentAccount');
            const walletData = {
                id: currentAccount?.id || 'default',
                name: currentAccount?.name || 'Main Wallet',
                addresses: currentAccount?.addresses || {},
                spark: currentAccount?.spark || false
            };
            
            const modal = new window.ExportWalletModal(this.app, walletData);
            modal.show();
        }
        
        showImportWallet() {
            console.log('[DashboardPage] Opening import wallet modal');
            
            // Dynamically load the ImportWalletModal if not already loaded
            if (!window.ImportWalletModal) {
                const script = document.createElement('script');
                script.src = '/js/modules/modals/ImportWalletModal.js';
                script.onload = () => {
                    this.openImportModal();
                };
                document.head.appendChild(script);
            } else {
                this.openImportModal();
            }
        }
        
        openImportModal() {
            const modal = new window.ImportWalletModal(this.app);
            modal.show();
        }
    }


    // Export to window
    window.DashboardPage = DashboardPage;

})(window);
