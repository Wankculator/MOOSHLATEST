/**
 * WalletCreatedPage Module
 * 
 * Displays the newly created wallet information including seed phrase,
 * addresses, and private keys. Provides options to access the dashboard.
 * 
 * Dependencies:
 * - Component (base class)
 * - ElementFactory ($)
 * - ComplianceUtils
 * - ResponsiveUtils
 */

(function(window) {
    'use strict';

    // Import dependencies from window
    const Component = window.Component;
    const $ = window.ElementFactory || window.$;
    const ComplianceUtils = window.ComplianceUtils;
    const ResponsiveUtils = window.ResponsiveUtils;
    class WalletCreatedPage extends Component {
        render() {
            const isMainnet = this.app.state.get('isMainnet');
            const selectedMnemonic = this.app.state.get('selectedMnemonic');
            
            const card = $.div({ className: 'card' }, [
                this.createTitle(),
                this.createSuccessAnimation(),
                this.createWalletInfo(isMainnet, selectedMnemonic),
                this.createActionButtons()
            ]);

            return card;
        }

        createTitle() {
            return $.div({
                style: {
                    textAlign: 'center',
                    marginBottom: 'calc(32px * var(--scale-factor))'
                }
            }, [
                $.h1({
                    style: {
                        fontSize: 'calc(32px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    $.img({
                        src: 'images/Moosh-logo.png',
                        alt: 'MOOSH',
                        style: {
                            width: 'calc(48px * var(--scale-factor))',
                            height: 'calc(48px * var(--scale-factor))',
                            objectFit: 'contain'
                        },
                        onerror: function() { this.style.display = 'none'; }
                    }),
                    $.span({ className: 'moosh-flash' }, ['WALLET']),
                    ' ',
                    $.span({ className: 'text-dim' }, ['CREATED'])
                ])
            ]);
        }

        createSuccessAnimation() {
            return $.div({}, [
                $.div({
                    style: {
                        fontSize: 'calc(64px * var(--scale-factor))',
                        color: 'var(--text-primary)',
                        margin: 'calc(24px * var(--scale-factor)) 0',
                        animation: 'pulse 2s infinite',
                        textAlign: 'center'
                    }
                }, ['✓']),
                $.p({
                    style: {
                        fontSize: 'calc(16px * var(--scale-factor))',
                        color: 'var(--text-secondary)',
                        marginBottom: 'calc(24px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, ['Your MOOSH Wallet has been successfully created!'])
            ]);
        }

        createWalletInfo(isMainnet, selectedMnemonic) {
            return $.div({
                style: {
                    background: 'rgba(245, 115, 21, 0.1)',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(16px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, [
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    ' WALLET DETAILS ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                $.div({
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'calc(12px * var(--scale-factor))',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace"
                    }
                }, [
                    this.createInfoRow('Network:', isMainnet ? 'MAINNET' : 'TESTNET'),
                    this.createInfoRow('Seed Words:', `${selectedMnemonic} Words`),
                    this.createInfoRow('Address Type:', 'Spark Protocol'),
                    this.createInfoRow('Reward:', '+1,000 MOOSH', true)
                ])
            ]);
        }

        createInfoRow(label, value, isReward = false) {
            return $.div({
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                $.span({ style: { color: 'var(--text-dim)' } }, [label]),
                $.span({
                    style: {
                        color: isReward ? 'var(--text-keyword)' : 'var(--text-primary)',
                        fontWeight: '600'
                    }
                }, [value])
            ]);
        }

        createActionButtons() {
            return $.div({
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(16px * var(--scale-factor))'
                }
            }, [
                new Button(this.app, {
                    text: 'Open Wallet Dashboard',
                    onClick: async () => {
                        // Initialize multi-account system if needed
                        const accounts = this.app.state.getAccounts();
                        console.log('[WalletDetails] Current accounts:', accounts.length);
                        
                        if (accounts.length === 0) {
                            console.log('[WalletDetails] No accounts found, initializing multi-account system');
                            
                            // Get the seed and wallet data
                            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
                            const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                            
                            if (generatedSeed.length > 0) {
                                // Create the first account using the generated seed
                                const mnemonic = Array.isArray(generatedSeed) ? generatedSeed.join(' ') : generatedSeed;
                                const isImport = !!localStorage.getItem('importedSeed');
                                
                                try {
                                    await this.app.state.createAccount('Main Account', mnemonic, isImport);
                                    console.log('[WalletDetails] First account created successfully');
                                    this.app.showNotification('Account initialized successfully', 'success');
                                } catch (error) {
                                    console.error('[WalletDetails] Failed to create first account:', error);
                                    this.app.showNotification('Failed to initialize account', 'error');
                                }
                            }
                        }
                        
                        // Mark wallet as ready for dashboard
                        localStorage.setItem('walletReady', 'true');
                        this.app.state.set('walletReady', true);
                        // Unlock for this session
                        sessionStorage.setItem('walletUnlocked', 'true');
                        this.app.router.navigate('dashboard');
                    }
                }).render(),
                new Button(this.app, {
                    text: 'Create Another Wallet',
                    variant: 'back',
                    onClick: () => this.app.router.goBack()
                }).render()
            ]);
        }

        async openWalletDashboard() {
            this.app.showNotification('Opening wallet dashboard...', 'success');
            
            // Initialize multi-account system if needed
            const accounts = this.app.state.getAccounts();
            console.log('[WalletDetails] Current accounts:', accounts.length);
            
            if (accounts.length === 0) {
                console.log('[WalletDetails] No accounts found, initializing multi-account system');
                
                // Get the seed and wallet data
                const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
                const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                
                if (generatedSeed.length > 0) {
                    // Create the first account using the generated seed
                    const mnemonic = Array.isArray(generatedSeed) ? generatedSeed.join(' ') : generatedSeed;
                    const isImport = !!localStorage.getItem('importedSeed');
                    
                    try {
                        await this.app.state.createAccount('Main Account', mnemonic, isImport);
                        console.log('[WalletDetails] First account created successfully');
                        this.app.showNotification('Account initialized successfully', 'success');
                    } catch (error) {
                        console.error('[WalletDetails] Failed to create first account:', error);
                        this.app.showNotification('Failed to initialize account', 'error');
                    }
                }
            }
            
            // Mark wallet as ready and navigate properly through router
            localStorage.setItem('walletReady', 'true');
            this.app.state.set('walletReady', true);
            
            // Unlock the wallet for this session (user just created/imported it)
            sessionStorage.setItem('walletUnlocked', 'true');
            console.log('[WalletDetails] Wallet unlocked for this session');
            
            this.app.router.navigate('dashboard');
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
            
            return $.div({ className: 'terminal-box', style: 'margin-bottom: calc(24px * var(--scale-factor));' }, [
                $.div({ className: 'terminal-header' }, [
                    $.span({}, ['~/moosh/wallet/dashboard $'])
                ]),
                $.div({ className: 'terminal-content' }, [
                    $.div({ 
                        style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(12px * var(--scale-factor));'
                    }, [
                        // Left side: Terminal title
                        $.h2({ 
                            style: 'font-size: calc(20px * var(--scale-factor)); font-weight: 600; font-family: JetBrains Mono, monospace; margin: 0;'
                        }, [
                        ]),
                        
                        // Right side: Header buttons
                        $.div({ 
                            className: 'header-buttons',
                            style: 'display: flex; gap: calc(8px * var(--scale-factor)); align-items: center;'
                        }, [
                            $.button({
                                className: 'btn-secondary dashboard-btn',
                                onclick: () => this.showMultiAccountManager()
                            }, ['+ Accounts']),
                            $.button({
                                className: 'btn-secondary dashboard-btn',
                                onclick: () => this.handleRefresh()
                            }, ['Refresh']),
                            $.button({
                                className: 'btn-secondary dashboard-btn visibility-toggle',
                                onclick: () => this.toggleBalanceVisibility(),
                                style: {
                                    padding: '8px 12px',
                                    minWidth: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            }, [this.createLockIcon()])
                        ])
                    ]),
                    
                    // Account indicator
                    $.div({ 
                        id: 'currentAccountIndicator',
                        className: 'account-indicator',
                        style: 'font-family: JetBrains Mono, monospace; font-size: calc(11px * var(--scale-factor)); color: var(--text-accent); margin-top: calc(8px * var(--scale-factor)); padding: calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor)); background: rgba(105, 253, 151, 0.1); border: 1px solid var(--text-accent); border-radius: 0; display: inline-block; cursor: pointer; transition: all 0.2s ease;',
                        onclick: () => this.showMultiAccountManager(),
                        onmouseover: (e) => e.currentTarget.style.background = 'rgba(105, 253, 151, 0.2)',
                        onmouseout: (e) => e.currentTarget.style.background = 'rgba(105, 253, 151, 0.1)'
                    }, [this.getAccountDisplayName()])
                ])
            ]);
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
                this.createMainActionButtons()
            ]);
        }
        
        createBalanceSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    textAlign: 'center'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(14px * var(--scale-factor))'
                    }
                }, [
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    ' WALLET BALANCE ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                
                // Bitcoin balance
                $.div({
                    style: {
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.div({
                        style: {
                            fontSize: 'calc(32px * var(--scale-factor))',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace",
                            marginBottom: 'calc(8px * var(--scale-factor))'
                        }
                    }, [
                        $.span({ id: 'btc-balance' }, ['Loading...']),
                        $.span({ style: { fontSize: 'calc(18px * var(--scale-factor))' } }, [' BTC'])
                    ]),
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(14px * var(--scale-factor))'
                        }
                    }, [
                        '≈ $',
                        $.span({ id: 'usd-balance' }, ['Loading...']),
                        ' USD'
                    ])
                ]),
                
                // Other balances
                $.div({
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'calc(16px * var(--scale-factor))',
                        marginTop: 'calc(24px * var(--scale-factor))',
                        paddingTop: 'calc(24px * var(--scale-factor))',
                        borderTop: '1px solid var(--border-color)'
                    }
                }, [
                    this.createMiniBalance('Lightning', '0 sats'),
                    this.createMiniBalance('MOOSH', '0.00'),
                    this.createMiniBalance('USDT', '0.00')
                ])
            ]);
        }
        
        createMiniBalance(label, amount) {
            const $ = window.ElementFactory || ElementFactory;
            return $.div({
                style: {
                    textAlign: 'center'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginBottom: 'calc(4px * var(--scale-factor))'
                    }
                }, [label]),
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontWeight: '600'
                    }
                }, [amount])
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
,
                    onmouseover: function() { this.style.background = 'var(--text-primary)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-primary)'; }
                }, ['Send Lightning Payment']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showReceivePayment(),
                    onmouseover: function() { this.style.background = 'var(--text-primary)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-primary)'; }
                }, ['Receive Payment']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showTokenMenu(),
                    onmouseover: function() { this.style.background = 'var(--text-primary)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-primary)'; }
                }, ['Token Menu']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showTransactionHistory()
,
                    onmouseover: function() { this.style.background = 'var(--text-primary)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-primary)'; }
                }, ['Transaction History']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showWalletSettings(),
                    onmouseover: function() { this.style.background = 'var(--text-primary)'; this.style.color = 'var(--bg-primary)'; },
                    onmouseout: function() { this.style.background = '#000000'; this.style.color = 'var(--text-primary)'; }
                }, ['Wallet Settings']),
                
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
                }, ['Import Wallet 📥'])
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
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Bitcoin Balance']),
                    $.div({ 
                        id: 'btcBalance',
                        className: 'text-primary',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315; word-break: break-all;'
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
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Lightning Balance']),
                    $.div({ 
                        id: 'lightningBalance',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315;'
                    }, ['0 sats']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, [$.span({ id: 'activeChannels' }, ['0']), ' active channels'])
                ]),
                
                // Stablecoins
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Stablecoins']),
                    $.div({ 
                        id: 'stablecoinBalance',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315;'
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
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315;'
                    }, ['0 NFTs']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['Click to view gallery'])
                ]),
                
                // Network Status
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
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
            this.showSendModal();
        }
        
        handleReceive() {
            this.showReceiveModal();
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
            
            // Mount the AccountSwitcher component
            const accountSwitcherContainer = document.getElementById('accountSwitcherContainer');
            if (accountSwitcherContainer) {
                this.accountSwitcher = new AccountSwitcher(this.app);
                this.accountSwitcher.mount(accountSwitcherContainer);
                console.log('[Dashboard] AccountSwitcher mounted successfully');
            } else {
                console.log('[Dashboard] AccountSwitcher container not found');
            }
            
            // Start data loading
            setTimeout(() => {
                this.loadWalletData();
            }, 500);
        }
        
        addDashboardStyles() {
            // No additional styles needed - using inline styles for consistency
        }
        
        loadWalletData() {
            // Placeholder for API integration
            this.app.showNotification('Wallet data loaded', 'success');
        }
        
        // Modal Methods
        showSendModal() {
            const modal = new SendModal(this.app);
            modal.show();
            return;
            
            // Original implementation below (kept for reference but unreachable)
            const $ = window.ElementFactory || ElementFactory;
            
            // Create modal overlay
            const overlay = $.div({ 
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        this.closeModal();
                    }
                }
            }, [
                $.div({ className: 'modal-container send-modal' }, [
                    // Modal header
                    $.div({ className: 'modal-header' }, [
                        $.h2({ className: 'modal-title' }, [
                            $.span({ className: 'text-dim' }, ['<']),
                            ' Send Bitcoin ',
                            $.span({ className: 'text-dim' }, ['/>'])
                        ]),
                        $.button({
                            className: 'modal-close',
                            onclick: () => this.closeModal()
                        }, ['×'])
                    ]),
                    
                    // Modal content
                    $.div({ className: 'modal-content' }, [
                        // Recipient address input
                        $.div({ className: 'form-group' }, [
                            $.label({ className: 'form-label' }, [
                                $.span({ className: 'text-dim ui-bracket' }, ['<']),
                                ' Recipient Address ',
                                $.span({ className: 'text-dim ui-bracket' }, ['/>']),
                            ]),
                            $.input({
                                type: 'text',
                                id: 'recipient-address',
                                className: 'form-input',
                                placeholder: 'Enter Bitcoin address...',
                                spellcheck: 'false'
                            })
                        ]),
                        
                        // Amount input
                        $.div({ className: 'form-group' }, [
                            $.label({ className: 'form-label' }, [
                                $.span({ className: 'text-dim ui-bracket' }, ['<']),
                                ' Amount ',
                                $.span({ className: 'text-dim ui-bracket' }, ['/>']),
                            ]),
                            $.div({ className: 'amount-input-group' }, [
                                $.input({
                                    type: 'text',
                                    id: 'send-amount',
                                    className: 'form-input amount-input',
                                    placeholder: '0.00000000',
                                    spellcheck: 'false'
                                }),
                                $.create('select', { className: 'amount-unit' }, [
                                    $.create('option', { value: 'btc' }, ['BTC']),
                                    $.create('option', { value: 'usd' }, ['USD'])
                                ])
                            ]),
                            $.div({ className: 'amount-conversion' }, [
                                $.span({ className: 'text-dim' }, ['≈ $0.00 USD'])
                            ])
                        ]),
                        
                        // Fee selector
                        $.div({ className: 'form-group' }, [
                            $.label({ className: 'form-label' }, [
                                $.span({ className: 'text-dim ui-bracket' }, ['<']),
                                ' Network Fee ',
                                $.span({ className: 'text-dim ui-bracket' }, ['/>']),
                            ]),
                            $.div({ className: 'fee-options' }, [
                                this.createFeeOption('slow', 'Slow', '~60 min', '1 sat/vB', true),
                                this.createFeeOption('medium', 'Medium', '~30 min', '5 sat/vB'),
                                this.createFeeOption('fast', 'Fast', '~10 min', '15 sat/vB')
                            ])
                        ]),
                        
                        // Transaction summary
                        $.div({ className: 'transaction-summary' }, [
                            $.div({ className: 'summary-title' }, ['Transaction Summary']),
                            $.div({ className: 'summary-row' }, [
                                $.span({ className: 'summary-label' }, ['Amount:']),
                                $.span({ className: 'summary-value' }, ['0.00000000 BTC'])
                            ]),
                            $.div({ className: 'summary-row' }, [
                                $.span({ className: 'summary-label' }, ['Network Fee:']),
                                $.span({ className: 'summary-value' }, ['0.00000001 BTC'])
                            ]),
                            $.div({ className: 'summary-row total' }, [
                                $.span({ className: 'summary-label' }, ['Total:']),
                                $.span({ className: 'summary-value' }, ['0.00000001 BTC'])
                            ])
                        ])
                    ]),
                    
                    // Modal footer
                    $.div({ className: 'modal-footer' }, [
                        $.button({
                            className: 'btn btn-secondary',
                            onclick: () => this.closeModal()
                        }, ['Cancel']),
                        $.button({
                            className: 'btn btn-primary',
                            onclick: () => this.processSend()
                        }, ['Send Bitcoin'])
                    ])
                ])
            ]);
            
            document.body.appendChild(overlay);
            this.addModalStyles();
            
            // Show the modal by adding the 'show' class
            setTimeout(() => {
                overlay.classList.add('show');
            }, 10);
            
            // Show the modal by adding the 'show' class
            setTimeout(() => {
                overlay.classList.add('show');
                // Focus on address input
                document.getElementById('recipient-address')?.focus();
            }, 10);
        }
        
        showReceiveModal() {
            const modal = new ReceiveModal(this.app, 'taproot');
            modal.show();
            return;
            
            // Original implementation below (kept for reference but unreachable)
            const $ = window.ElementFactory || ElementFactory;
            
            // Get current wallet address
            const currentAccount = this.app.state.getCurrentAccount();
            const walletAddress = currentAccount?.address || this.generateWalletAddress('taproot');
            
            // Create modal overlay
            const overlay = $.div({ 
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        this.closeModal();
                    }
                }
            }, [
                $.div({ className: 'modal-container receive-modal' }, [
                    // Modal header
                    $.div({ className: 'modal-header' }, [
                        $.h2({ className: 'modal-title' }, [
                            $.span({ className: 'text-dim' }, ['<']),
                            ' Receive Bitcoin ',
                            $.span({ className: 'text-dim' }, ['/>'])
                        ]),
                        $.button({
                            className: 'modal-close',
                            onclick: () => this.closeModal()
                        }, ['×'])
                    ]),
                    
                    // Modal content
                    $.div({ className: 'modal-content' }, [
                        // QR Code section
                        $.div({ className: 'qr-section' }, [
                            this.createQRCode(walletAddress)
                        ]),
                        
                        // Address display
                        $.div({ className: 'address-section' }, [
                            $.label({ className: 'form-label' }, [
                                $.span({ className: 'text-dim ui-bracket' }, ['<']),
                                ' Your Bitcoin Address ',
                                $.span({ className: 'text-dim ui-bracket' }, ['/>']),
                            ]),
                            $.div({ className: 'address-display' }, [
                                $.input({
                                    type: 'text',
                                    className: 'address-input form-input',
                                    value: walletAddress,
                                    readonly: true,
                                    id: 'wallet-address-display'
                                }),
                                $.button({
                                    className: 'copy-btn',
                                    onclick: () => this.copyAddress(walletAddress)
                                }, ['Copy'])
                            ])
                        ]),
                        
                        // Amount input (optional)
                        $.div({ className: 'form-group' }, [
                            $.label({ className: 'form-label' }, [
                                $.span({ className: 'text-dim ui-bracket' }, ['<']),
                                ' Amount (Optional) ',
                                $.span({ className: 'text-dim ui-bracket' }, ['/>']),
                            ]),
                            $.div({ className: 'amount-input-group' }, [
                                $.input({
                                    type: 'text',
                                    id: 'receive-amount',
                                    className: 'form-input amount-input',
                                    placeholder: '0.00000000',
                                    spellcheck: 'false'
                                }),
                                $.create('select', { className: 'amount-unit' }, [
                                    $.create('option', { value: 'btc' }, ['BTC']),
                                    $.create('option', { value: 'usd' }, ['USD'])
                                ])
                            ])
                        ]),
                        
                        // Share options
                        $.div({ className: 'share-section' }, [
                            $.div({ className: 'share-title' }, ['Share via']),
                            $.div({ className: 'share-buttons' }, [
                                $.button({ className: 'share-btn' }, ['Email']),
                                $.button({ className: 'share-btn' }, ['Message']),
                                $.button({ className: 'share-btn' }, ['Link'])
                            ])
                        ])
                    ]),
                    
                    // Modal footer
                    $.div({ className: 'modal-footer' }, [
                        $.button({
                            className: 'btn btn-primary full-width',
                            onclick: () => this.closeModal()
                        }, ['Done'])
                    ])
                ])
            ]);
            
            document.body.appendChild(overlay);
            this.addModalStyles();
            
            // Show the modal by adding the 'show' class
            setTimeout(() => {
                overlay.classList.add('show');
            }, 10);
        }
        
        showSettingsModal() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Create modal overlay
            const overlay = $.div({ 
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        this.closeModal();
                    }
                }
            }, [
                $.div({ className: 'modal-container settings-modal' }, [
                    // Modal header
                    $.div({ className: 'modal-header' }, [
                        $.h2({ className: 'modal-title' }, [
                            $.span({ className: 'text-dim' }, ['<']),
                            ' Wallet Settings ',
                            $.span({ className: 'text-dim' }, ['/>'])
                        ]),
                        $.button({
                            className: 'modal-close',
                            onclick: () => this.closeModal()
                        }, ['×'])
                    ]),
                    
                    // Modal content
                    $.div({ className: 'modal-content' }, [
                        // Settings sections
                        this.createSettingsSection('Account', [
                            this.createSettingItem('Account Name', 'text', 'Account 1'),
                            this.createSettingItem('Default Currency', 'select', 'btc', ['btc', 'usd', 'eur'])
                        ]),
                        
                        this.createSettingsSection('Security', [
                            this.createSettingItem('Auto-lock Timer', 'select', '30', ['15', '30', '60', 'never']),
                            this.createPasswordChangeSection(),
                            this.createSeedPhraseSection()
                        ]),
                        
                        this.createSettingsSection('Network', [
                            this.createSettingItem('Network', 'select', 'mainnet', ['mainnet', 'testnet']),
                            this.createSettingItem('RPC Endpoint', 'text', 'Default')
                        ]),
                        
                        this.createSettingsSection('Advanced', [
                            this.createExportSection(),
                            this.createDeleteWalletSection()
                        ])
                    ])
                ])
            ]);
            
            document.body.appendChild(overlay);
            this.addModalStyles();
            
            // Show the modal by adding the 'show' class
            setTimeout(() => {
                overlay.classList.add('show');
            }, 10);
        }
        
        createSettingsSection(title, items) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-section-title' }, [title]),
                $.div({ className: 'settings-items' }, items)
            ]);
        }
        
        createSettingItem(label, type, value, options = []) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, [label]),
                type === 'select' ? 
                    $.create('select', { className: 'setting-input' }, 
                        options.map(opt => $.create('option', { value: opt }, [opt]))
                    ) :
                    $.input({ 
                        type: type, 
                        className: 'setting-input', 
                        value: value 
                    })
            ]);
        }
        
        createPasswordChangeSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'setting-item' }, [
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.showPasswordChangeModal()
                }, ['Change Password'])
            ]);
        }
        
        createSeedPhraseSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'setting-item danger-zone' }, [
                $.button({
                    className: 'btn btn-danger',
                    onclick: () => this.showSeedPhraseModal()
                }, ['Show Seed Phrase']),
                $.div({ className: 'setting-warning' }, [
                    'Requires password verification'
                ])
            ]);
        }
        
        createExportSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'setting-item' }, [
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.exportWalletData()
                }, ['Export Wallet Data'])
            ]);
        }
        
        createDeleteWalletSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'setting-item danger-zone' }, [
                $.button({
                    className: 'btn btn-danger',
                    onclick: () => this.confirmDeleteWallet()
                }, ['Delete Wallet']),
                $.div({ className: 'setting-warning' }, [
                    'This action cannot be undone'
                ])
            ]);
        }
        
        showSeedPhraseModal() {
            const $ = window.ElementFactory || ElementFactory;
            
            // First show password verification modal
            const passwordOverlay = $.div({ 
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({ className: 'modal-container password-modal' }, [
                    $.div({ className: 'modal-header' }, [
                        $.h2({ className: 'modal-title' }, ['Verify Password']),
                        $.button({
                            className: 'modal-close',
                            onclick: () => passwordOverlay.remove()
                        }, ['×'])
                    ]),
                    
                    $.div({ className: 'modal-content' }, [
                        $.div({ className: 'form-group' }, [
                            $.label({ className: 'form-label' }, ['Enter your password to view seed phrase']),
                            $.input({
                                type: 'password',
                                id: 'verify-password',
                                className: 'form-input',
                                placeholder: 'Enter password...',
                                onkeypress: (e) => {
                                    if (e.key === 'Enter') {
                                        this.verifyPasswordAndShowSeed(passwordOverlay);
                                    }
                                }
                            })
                        ])
                    ]),
                    
                    $.div({ className: 'modal-footer' }, [
                        $.button({
                            className: 'btn btn-secondary',
                            onclick: () => passwordOverlay.remove()
                        }, ['Cancel']),
                        $.button({
                            className: 'btn btn-primary',
                            onclick: () => this.verifyPasswordAndShowSeed(passwordOverlay)
                        }, ['Verify'])
                    ])
                ])
            ]);
            
            document.body.appendChild(passwordOverlay);
            
            // Focus on password input
            setTimeout(() => {
                document.getElementById('verify-password')?.focus();
            }, 100);
        }
        
        verifyPasswordAndShowSeed(passwordOverlay) {
            const password = document.getElementById('verify-password')?.value;
            const storedPassword = localStorage.getItem('walletPassword');
            
            if (password === storedPassword) {
                passwordOverlay.remove();
                this.displaySeedPhrase(); // async call is fine here
            } else {
                this.app.showNotification('Incorrect password', 'error');
            }
        }
        
        async displaySeedPhrase() {
            const $ = window.ElementFactory || ElementFactory;
            // NEVER store seed phrases in localStorage - security risk!
            // Seeds should only be generated server-side and shown once
            
            // Show loading while generating
            this.app.showNotification('Generating secure seed phrase...', 'info');
            const seedPhrase = await this.generateSeedPhrase();
            
            // WARNING: Seed phrase will only be shown once
            console.warn('[Security] Seed phrase generated - user must save it immediately');
            
            const words = seedPhrase.split(' ');
            
            const seedOverlay = $.div({ 
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({ className: 'modal-container seed-modal' }, [
                    $.div({ className: 'modal-header' }, [
                        $.h2({ className: 'modal-title' }, ['Your Seed Phrase']),
                        $.button({
                            className: 'modal-close',
                            onclick: () => seedOverlay.remove()
                        }, ['×'])
                    ]),
                    
                    $.div({ className: 'modal-content' }, [
                        $.div({ className: 'seed-warning' }, [
                            $.div({ className: 'warning-icon' }, ['WARNING']),
                            $.div({ className: 'warning-text' }, [
                                'Never share your seed phrase with anyone!',
                                $.br(),
                                'Write it down and store it securely.'
                            ])
                        ]),
                        
                        $.div({ className: 'seed-grid' }, 
                            words.map((word, index) => 
                                $.div({ className: 'seed-word' }, [
                                    $.span({ className: 'seed-number' }, [`${index + 1}.`]),
                                    $.span({ className: 'seed-text' }, [word])
                                ])
                            )
                        ),
                        
                        $.div({ className: 'seed-actions' }, [
                            $.button({
                                className: 'btn btn-secondary',
                                onclick: () => this.copySeedPhrase(seedPhrase)
                            }, ['Copy Seed Phrase'])
                        ])
                    ]),
                    
                    $.div({ className: 'modal-footer' }, [
                        $.button({
                            className: 'btn btn-primary full-width',
                            onclick: () => seedOverlay.remove()
                        }, ['I have saved my seed phrase'])
                    ])
                ])
            ]);
            
            document.body.appendChild(seedOverlay);
        }
        
        async generateSeedPhrase() {
            try {
                // Try to use the real API first
                const response = await this.app.apiService.request('/api/spark/generate-wallet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ strength: 256 }) // 24 words
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && result.data.mnemonic) {
                        console.log('[Wallet] Real wallet generated via API');
                        // Store additional wallet data
                        if (result.data.addresses) {
                            localStorage.setItem('sparkAddress', result.data.addresses.spark || '');
                            localStorage.setItem('bitcoinAddress', result.data.addresses.bitcoin || '');
                        }
                        return result.data.mnemonic;
                    }
                }
            } catch (error) {
                console.log('[Wallet] API not available, using local generation');
            }
            
            // Fallback to local BIP39 generation - MUST use crypto secure random
            const wordlist = this.getBIP39Wordlist();
            const words = [];
            
            // Generate cryptographically secure random indices
            const randomBytes = new Uint8Array(24 * 2); // 2 bytes per word for 11-bit indices
            window.crypto.getRandomValues(randomBytes);
            
            for (let i = 0; i < 24; i++) {
                // Use 2 bytes to get a number between 0-2047 (11 bits for BIP39)
                const byte1 = randomBytes[i * 2];
                const byte2 = randomBytes[i * 2 + 1];
                const index = ((byte1 << 8) | byte2) & 0x7FF; // Mask to 11 bits (0-2047)
                words.push(wordlist[index]);
            }
            return words.join(' ');
        }
        
        getBIP39Wordlist() {
            // Return the global BIP39_WORDS if loaded, otherwise empty array to force API usage
            if (BIP39_WORDS && BIP39_WORDS.length > 0) {
                return BIP39_WORDS;
            }
            // Return empty array to force API usage
            console.warn('BIP39 wordlist not loaded, will use API');
            return [];
        }
        
        copySeedPhrase(seedPhrase) {
            navigator.clipboard.writeText(seedPhrase).then(() => {
                this.app.showNotification('Seed phrase copied to clipboard', 'success');
            }).catch(() => {
                this.app.showNotification('Failed to copy seed phrase', 'error');
            });
        }
        
        createFeeOption(id, label, time, rate, selected = false) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.label({ className: 'fee-option' }, [
                $.input({
                    type: 'radio',
                    name: 'fee-option',
                    value: id,
                    checked: selected
                }),
                $.div({ className: 'fee-details' }, [
                    $.div({ className: 'fee-label' }, [label]),
                    $.div({ className: 'fee-info' }, [
                        $.span({ className: 'fee-time' }, [time]),
                        $.span({ className: 'fee-rate' }, [rate])
                    ])
                ])
            ]);
        }
        
        closeModal() {
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
        }
        
        async processSend() {
            const address = document.getElementById('recipient-address')?.value;
            const amount = document.getElementById('send-amount')?.value;
            const feeRate = document.getElementById('fee-rate')?.value || 'normal';
            
            if (!address || !amount) {
                this.app.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Validate address
            if (!this.validateBitcoinAddress(address)) {
                this.app.showNotification('Invalid Bitcoin address', 'error');
                return;
            }
            
            // Validate amount
            const amountBTC = parseFloat(amount);
            if (isNaN(amountBTC) || amountBTC <= 0) {
                this.app.showNotification('Invalid amount', 'error');
                return;
            }
            
            // Convert to satoshis
            const amountSats = Math.floor(amountBTC * 100000000);
            
            // Check minimum amount (dust limit)
            if (amountSats < 546) {
                this.app.showNotification('Amount too small (minimum 546 satoshis)', 'error');
                return;
            }
            
            // Get current account
            const currentAccount = this.app.state.get('currentAccount');
            if (!currentAccount) {
                this.app.showNotification('No wallet selected', 'error');
                return;
            }
            
            // Require password for sending
            const passwordModal = new PasswordModal(this.app, {
                title: 'Confirm Transaction',
                message: `Enter password to send ${amount} BTC to ${this.formatAddress(address)}`,
                onSuccess: () => {
                    this.executeTransaction(address, amountSats, feeRate);
                },
                onCancel: () => {
                    this.app.showNotification('Transaction cancelled', 'info');
                }
            });
            
            passwordModal.show();
        }
        
        async executeTransaction(address, amountSats, feeRate) {
            // Get current account again
            const currentAccount = this.app.state.get('currentAccount');
            
            // Show loading state
            const sendButton = document.querySelector('.btn-primary');
            const originalText = sendButton?.textContent || 'Send Bitcoin';
            if (sendButton) {
                sendButton.textContent = 'Processing...';
                sendButton.disabled = true;
            }
            
            try {
                // Call API to create and broadcast transaction
                const response = await this.app.api.sendTransaction({
                    from: currentAccount.addresses.bitcoin || currentAccount.addresses.segwit,
                    to: address,
                    amount: amountSats,
                    feeRate: feeRate,
                    privateKey: currentAccount.privateKeys?.bitcoin?.wif // This should be handled securely
                });
                
                if (response.success) {
                    this.app.showNotification(`Transaction sent! TX ID: ${response.data.txid}`, 'success');
                    this.closeModal();
                    
                    // Refresh balance
                    this.loadWalletData();
                } else {
                    throw new Error(response.error || 'Transaction failed');
                }
            } catch (error) {
                console.error('Send transaction error:', error);
                this.app.showNotification(error.message || 'Failed to send transaction', 'error');
            } finally {
                if (sendButton) {
                    sendButton.textContent = originalText;
                    sendButton.disabled = false;
                }
            }
        }
        
        // Add this validation method if it doesn't exist
        validateBitcoinAddress(address) {
            // Basic Bitcoin address validation
            const patterns = {
                segwit: /^bc1[a-z0-9]{39,59}$/,
                taproot: /^bc1p[a-z0-9]{58}$/,
                legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
                testnet: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
            };
            
            return Object.values(patterns).some(pattern => pattern.test(address));
        }
        
        formatAddress(address) {
            if (!address) return 'Unknown';
            return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
        }
        
        copyAddress(address) {
            navigator.clipboard.writeText(address).then(() => {
                this.app.showNotification('Address copied to clipboard', 'success');
            }).catch(() => {
                this.app.showNotification('Failed to copy address', 'error');
            });
        }
        
        createQRCode(data) {
            const $ = window.ElementFactory || ElementFactory;
            const size = 200; // QR code size
            
            // Create canvas for QR code
            const canvas = $.create('canvas', {
                width: size,
                height: size,
                style: {
                    width: `calc(${size}px * var(--scale-factor))`,
                    height: `calc(${size}px * var(--scale-factor))`,
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(10px * var(--scale-factor))',
                    background: 'white'
                }
            });
            
            // Generate QR code pattern (simplified for pure JS)
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Create a simple QR-like pattern (placeholder)
                this.drawQRPattern(ctx, data, size);
            }
            
            return $.div({ className: 'qr-code-container' }, [
                canvas,
                $.div({ 
                    className: 'qr-label',
                    style: {
                        marginTop: 'calc(12px * var(--scale-factor))',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        color: 'var(--text-dim)',
                        textAlign: 'center'
                    }
                }, ['Scan with any Bitcoin wallet'])
            ]);
        }
        
        drawQRPattern(ctx, data, size) {
            // Create a deterministic pattern based on the data
            const moduleSize = 8;
            const modules = Math.floor(size / moduleSize);
            
            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            // Generate pattern based on data hash
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data.charCodeAt(i);
                hash = hash & hash;
            }
            
            // Draw modules
            ctx.fillStyle = '#000000';
            for (let row = 0; row < modules; row++) {
                for (let col = 0; col < modules; col++) {
                    // Use hash to determine if module should be filled
                    const shouldFill = ((hash + row * modules + col) % 3) !== 0;
                    if (shouldFill) {
                        ctx.fillRect(
                            col * moduleSize + moduleSize/4,
                            row * moduleSize + moduleSize/4,
                            moduleSize - moduleSize/2,
                            moduleSize - moduleSize/2
                        );
                    }
                }
            }
            
            // Add corner markers (QR code style)
            this.drawCornerMarker(ctx, 0, 0, moduleSize * 3);
            this.drawCornerMarker(ctx, size - moduleSize * 3, 0, moduleSize * 3);
            this.drawCornerMarker(ctx, 0, size - moduleSize * 3, moduleSize * 3);
        }
        
        drawCornerMarker(ctx, x, y, size) {
            // Outer square
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, size, size);
            
            // Inner white square
            ctx.fillStyle = '#ffffff';
            const padding = size / 7;
            ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
            
            // Center black square
            ctx.fillStyle = '#000000';
            const innerPadding = size / 3.5;
            ctx.fillRect(x + innerPadding, y + innerPadding, size - innerPadding * 2, size - innerPadding * 2);
        }
        
        addAccountSwitcherStyles() {
            if (document.getElementById('account-switcher-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'account-switcher-styles';
            style.textContent = `
                /* Account Switcher Styles */
                .account-switcher {
                    position: relative;
                    display: inline-block;
                }
                
                .account-switcher-trigger {
                    min-width: 150px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding: calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor));
                    background: transparent;
                    border: 1px solid #69fd97;
                    color: #69fd97;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: calc(14px * var(--scale-factor));
                    transition: all 0.3s ease;
                }
                
                .account-switcher-trigger:hover {
                    background: rgba(105, 253, 151, 0.1);
                    border-color: #f57315;
                    color: #f57315;
                }
                
                .account-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 4px;
                    background: #000000;
                    border: 1px solid #69fd97;
                    min-width: 200px;
                    max-width: 300px;
                    z-index: 1000;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    max-height: 400px;
                    overflow-y: auto;
                    display: none;
                }
                
                .account-dropdown.show {
                    display: block;
                }
                
                .account-item {
                    padding: calc(12px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid rgba(105, 253, 151, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .account-item:last-child {
                    border-bottom: none;
                }
                
                .account-item:hover {
                    background: rgba(105, 253, 151, 0.1);
                    color: #f57315;
                }
                
                .account-item.active {
                    background: rgba(245, 115, 21, 0.1);
                    color: #f57315;
                }
                
                .account-item .account-name {
                    font-weight: 500;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 150px;
                }
                
                .account-item .account-balance {
                    font-size: calc(12px * var(--scale-factor));
                    color: #69fd97;
                    opacity: 0.8;
                }
                
                .account-item.active .account-balance {
                    color: #f57315;
                }
            `;
            
            document.head.appendChild(style);
        }
        
        addModalStyles() {
            if (document.getElementById('modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                /* Custom Scrollbar Styles */
                textarea::-webkit-scrollbar,
                .modal-container::-webkit-scrollbar,
                *::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                textarea::-webkit-scrollbar-track,
                .modal-container::-webkit-scrollbar-track,
                *::-webkit-scrollbar-track {
                    background: #000000;
                    border: 1px solid #333333;
                }
                
                textarea::-webkit-scrollbar-thumb,
                .modal-container::-webkit-scrollbar-thumb,
                *::-webkit-scrollbar-thumb {
                    background: var(--text-primary);
                    border-radius: 0;
                }
                
                textarea::-webkit-scrollbar-thumb:hover,
                .modal-container::-webkit-scrollbar-thumb:hover,
                *::-webkit-scrollbar-thumb:hover {
                    background: #FF9900;
                }
                
                /* Firefox Scrollbar */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: var(--text-primary) #000000;
                }
                
                /* Modal Overlay */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: calc(20px * var(--scale-factor));
                }
                
                /* Modal Container */
                .modal-container {
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    border-radius: 0;
                    max-width: calc(500px * var(--scale-factor));
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 0 calc(20px * var(--scale-factor)) rgba(0, 0, 0, 0.5);
                    animation: modalIn 0.2s ease-out;
                }
                
                @keyframes modalIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                /* Modal Header */
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: calc(20px * var(--scale-factor));
                    border-bottom: calc(1px * var(--scale-factor)) solid var(--border-color);
                }
                
                .modal-title {
                    font-size: calc(20px * var(--scale-factor));
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: calc(24px * var(--scale-factor));
                    color: var(--text-dim);
                    cursor: pointer;
                    padding: 0;
                    width: calc(32px * var(--scale-factor));
                    height: calc(32px * var(--scale-factor));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }
                
                .modal-close:hover {
                    color: var(--text-primary);
                }
                
                /* Modal Content */
                .modal-content {
                    padding: calc(24px * var(--scale-factor));
                }
                
                /* Form Groups */
                .form-group {
                    margin-bottom: calc(20px * var(--scale-factor));
                }
                
                .form-label {
                    display: block;
                    margin-bottom: calc(8px * var(--scale-factor));
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .form-input {
                    width: 100%;
                    padding: calc(12px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    font-size: calc(14px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    transition: border-color 0.2s;
                }
                
                .form-input:focus {
                    outline: none;
                    border-color: var(--text-primary);
                }
                
                /* Amount Input Group */
                .amount-input-group {
                    display: flex;
                    gap: calc(8px * var(--scale-factor));
                }
                
                .amount-input {
                    flex: 1;
                }
                
                .amount-unit {
                    padding: calc(12px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    cursor: pointer;
                }
                
                .amount-conversion {
                    margin-top: calc(8px * var(--scale-factor));
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                }
                
                /* Fee Options */
                .fee-options {
                    display: grid;
                    gap: calc(12px * var(--scale-factor));
                }
                
                .fee-option {
                    display: flex;
                    align-items: center;
                    padding: calc(12px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                
                .fee-option:hover {
                    border-color: var(--text-dim);
                }
                
                .fee-option input[type="radio"] {
                    margin-right: calc(12px * var(--scale-factor));
                }
                
                .fee-details {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .fee-label {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .fee-info {
                    display: flex;
                    gap: calc(16px * var(--scale-factor));
                    font-size: calc(12px * var(--scale-factor));
                }
                
                .fee-time {
                    color: var(--text-dim);
                }
                
                .fee-rate {
                    color: var(--text-primary);
                }
                
                /* Transaction Summary */
                .transaction-summary {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(16px * var(--scale-factor));
                    margin-top: calc(24px * var(--scale-factor));
                }
                
                .summary-title {
                    font-weight: 600;
                    margin-bottom: calc(12px * var(--scale-factor));
                    color: var(--text-primary);
                    font-size: calc(14px * var(--scale-factor));
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: calc(8px * var(--scale-factor));
                    font-size: calc(12px * var(--scale-factor));
                }
                
                .summary-row.total {
                    margin-top: calc(8px * var(--scale-factor));
                    padding-top: calc(8px * var(--scale-factor));
                    border-top: calc(1px * var(--scale-factor)) solid var(--border-color);
                    font-weight: 600;
                }
                
                .summary-label {
                    color: var(--text-dim);
                }
                
                .summary-value {
                    color: var(--text-primary);
                }
                
                /* Modal Footer */
                .modal-footer {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: calc(12px * var(--scale-factor));
                    padding: calc(20px * var(--scale-factor));
                    border-top: calc(1px * var(--scale-factor)) solid var(--border-color);
                }
                
                /* Modal Footer Button Overrides - High Specificity */
                .modal-footer .btn,
                .modal-footer .btn-primary,
                .modal-footer .btn-secondary {
                    padding: calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor)) !important;
                    font-size: calc(14px * var(--scale-factor)) !important;
                    font-weight: 600 !important;
                    font-family: 'JetBrains Mono', monospace !important;
                    border: calc(2px * var(--scale-factor)) solid var(--border-color) !important;
                    border-radius: 0 !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    background: transparent !important;
                    color: var(--text-primary) !important;
                    min-width: calc(120px * var(--scale-factor)) !important;
                    transform: none !important;
                    box-shadow: none !important;
                    position: relative !important;
                    overflow: visible !important;
                }
                
                .modal-footer .btn:hover,
                .modal-footer .btn-primary:hover,
                .modal-footer .btn-secondary:hover {
                    background: var(--bg-hover) !important;
                    border-color: var(--text-primary) !important;
                    transform: none !important;
                    box-shadow: none !important;
                    color: var(--text-primary) !important;
                }
                
                /* Additional override for MOOSH mode within modals */
                body.moosh-mode .modal-footer .btn,
                body.moosh-mode .modal-footer .btn-primary,
                body.moosh-mode .modal-footer .btn-secondary {
                    background: #000000 !important;
                    border: 2px solid #232b2b !important;
                    color: #69fd97 !important;
                    border-radius: 0 !important;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                body.moosh-mode .modal-footer .btn:hover,
                body.moosh-mode .modal-footer .btn-primary:hover,
                body.moosh-mode .modal-footer .btn-secondary:hover {
                    border: 2px solid #69fd97 !important;
                    background: #000000 !important;
                    color: #69fd97 !important;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                .btn.full-width {
                    width: 100%;
                }
                
                /* Receive Modal Specific */
                .qr-section {
                    display: flex;
                    justify-content: center;
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .qr-code-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .qr-code-container canvas {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .qr-placeholder {
                    width: calc(200px * var(--scale-factor));
                    height: calc(200px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .qr-text {
                    font-size: calc(32px * var(--scale-factor));
                    font-weight: 600;
                    color: var(--text-dim);
                }
                
                .qr-subtext {
                    font-size: calc(16px * var(--scale-factor));
                    color: var(--text-dim);
                }
                
                .address-display {
                    display: flex;
                    gap: calc(8px * var(--scale-factor));
                }
                
                .address-input {
                    flex: 1;
                    font-size: calc(12px * var(--scale-factor));
                }
                
                .copy-btn {
                    padding: calc(12px * var(--scale-factor)) calc(20px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .copy-btn:hover {
                    background: var(--text-keyword);
                    color: var(--bg-primary);
                    border-color: var(--text-keyword);
                }
                
                .share-section {
                    margin-top: calc(24px * var(--scale-factor));
                }
                
                .share-title {
                    font-size: calc(14px * var(--scale-factor));
                    font-weight: 600;
                    margin-bottom: calc(12px * var(--scale-factor));
                    color: var(--text-primary);
                }
                
                .share-buttons {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: calc(8px * var(--scale-factor));
                }
                
                .share-btn {
                    padding: calc(8px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .share-btn:hover {
                    background: var(--text-dim);
                    color: var(--bg-primary);
                    border-color: var(--text-dim);
                }
                
                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .modal-container {
                        margin: calc(10px * var(--scale-factor));
                    }
                    
                    .fee-info {
                        flex-direction: column;
                        gap: calc(4px * var(--scale-factor));
                        align-items: flex-end;
                    }
                }
                
                /* Settings Modal Styles */
                .settings-modal .modal-content {
                    padding: 0;
                }
                
                .settings-section {
                    border-bottom: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(20px * var(--scale-factor));
                }
                
                .settings-section:last-child {
                    border-bottom: none;
                }
                
                .settings-section-title {
                    font-size: calc(16px * var(--scale-factor));
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 calc(16px * var(--scale-factor)) 0;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .settings-items {
                    display: flex;
                    flex-direction: column;
                    gap: calc(12px * var(--scale-factor));
                }
                
                .setting-item {
                    display: flex;
                    flex-direction: column;
                    gap: calc(8px * var(--scale-factor));
                }
                
                .setting-label {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .setting-input {
                    padding: calc(10px * var(--scale-factor));
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(14px * var(--scale-factor));
                    border-radius: 0;
                }
                
                .setting-input:focus {
                    outline: none;
                    border-color: var(--text-primary);
                }
                
                .setting-warning {
                    font-size: calc(11px * var(--scale-factor));
                    color: var(--text-dim);
                    font-style: italic;
                }
                
                .danger-zone .btn-danger {
                    background: transparent;
                    color: #ff4444;
                    border-color: #ff4444;
                }
                
                .danger-zone .btn-danger:hover {
                    background: #ff4444;
                    color: var(--bg-primary);
                }
                
                /* Seed Modal Styles */
                .seed-warning {
                    background: rgba(255, 68, 68, 0.1);
                    border: calc(1px * var(--scale-factor)) solid #ff4444;
                    padding: calc(16px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                    border-radius: 0;
                    display: flex;
                    align-items: center;
                    gap: calc(12px * var(--scale-factor));
                }
                
                .warning-icon {
                    font-size: calc(24px * var(--scale-factor));
                }
                
                .warning-text {
                    font-size: calc(12px * var(--scale-factor));
                    color: #ff4444;
                    line-height: 1.5;
                }
                
                .seed-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: calc(12px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                @media (max-width: 600px) {
                    .seed-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                .seed-word {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(12px * var(--scale-factor));
                    display: flex;
                    gap: calc(8px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    border-radius: 0;
                }
                
                .seed-number {
                    color: var(--text-dim);
                    font-size: calc(12px * var(--scale-factor));
                }
                
                .seed-text {
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: calc(14px * var(--scale-factor));
                }
                
                .seed-actions {
                    display: flex;
                    justify-content: center;
                    margin-bottom: calc(16px * var(--scale-factor));
                }
            `;
            document.head.appendChild(style);
        }
        showExportWallet() {
            console.log('[WalletCreatedPage] Opening export wallet modal');
            
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
            console.log('[WalletCreatedPage] Opening import wallet modal');
            
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
        
        showWalletSettings() {
            console.log('[WalletCreatedPage] Opening wallet settings modal');
            const modal = new window.WalletSettingsModal(this.app);
            modal.show();
        }
        
        showTokenMenu() {
            console.log('[WalletCreatedPage] Opening token menu modal');
            const modal = new window.TokenMenuModal(this.app);
            modal.show();
        }
        
        showTransactionHistory() {
            console.log('[WalletCreatedPage] Opening transaction history modal');
            const modal = new window.TransactionHistoryModal(this.app);
            modal.show();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════

    // Export to window
    window.WalletCreatedPage = WalletCreatedPage;

})(window);
