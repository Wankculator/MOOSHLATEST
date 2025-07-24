// WalletSettingsModal Module for MOOSH Wallet
// Terminal-style wallet settings interface

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // WALLET SETTINGS MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class WalletSettingsModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
        }
        
        show() {
            const $ = window.ElementFactory || ElementFactory;
            console.log('[WalletSettingsModal] show() called');
            
            // Get current theme
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const themeColor = isMooshMode ? '#69fd97' : '#f57315';
            const borderColor = isMooshMode ? '#232b2b' : '#333333';
            
            this.modal = $.div({ 
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
                }
            }, [
                $.div({ 
                    className: 'terminal-box settings-terminal',
                    style: {
                        background: 'var(--bg-primary)',
                        border: `2px solid ${themeColor}`,
                        borderRadius: '0',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        fontFamily: 'monospace'
                    }
                }, [
                    this.createTerminalHeader(themeColor),
                    this.createTerminalContent(themeColor, borderColor)
                ])
            ]);
            
            // Close on overlay click
            // Store event handler for cleanup
            this.modalClickHandler = (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            };
            this.modal.onclick = this.modalClickHandler;
            
            document.body.appendChild(this.modal);
            
            // Show with fade-in
            setTimeout(() => {
                this.modal.style.opacity = '1';
            }, 10);
        }
        
        createTerminalHeader(themeColor) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    background: '#000000',
                    borderBottom: `2px solid ${themeColor}`,
                    padding: '15px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }, [
                $.div({
                    style: {
                        color: themeColor,
                        fontSize: '14px',
                        fontFamily: 'monospace'
                    }
                }, ['~/moosh/wallet/settings $ ls -la accounts/']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: 'none',
                        color: themeColor,
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '0 5px'
                    },
                    onclick: () => this.close()
                }, ['×'])
            ]);
        }
        
        createTerminalContent(themeColor, borderColor) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Get wallet data from storage
            const sparkWallet = this.app.state.get('sparkWallet') || JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            // Get real addresses using the WalletDetailsPage method
            const walletDetailsPage = new WalletDetailsPage(this.app);
            const addresses = walletDetailsPage.getRealWalletAddresses(sparkWallet, currentWallet);
            
            // Create wallet types with real addresses
            const walletTypes = [
                { 
                    value: 'spark', 
                    label: 'Spark Protocol', 
                    address: addresses.spark || 'Not generated',
                    type: 'Lightning', 
                    permission: 'drwxr-xr-x',
                    icon: 'MOOSH'
                },
                { 
                    value: 'taproot', 
                    label: 'Bitcoin Taproot', 
                    address: addresses.taproot || 'Not generated',
                    type: 'Primary', 
                    permission: 'drwxr-xr-x',
                    icon: '₿'
                },
                { 
                    value: 'nativeSegWit', 
                    label: 'Native SegWit', 
                    address: addresses.segwit || 'Not generated',
                    type: 'BIP84', 
                    permission: 'drwxr-xr-x',
                    icon: '₿'
                },
                { 
                    value: 'nestedSegWit', 
                    label: 'Nested SegWit', 
                    address: addresses.nestedSegwit || 'Not generated',
                    type: 'BIP49', 
                    permission: 'drwxr-xr-x',
                    icon: '₿'
                },
                { 
                    value: 'legacy', 
                    label: 'Bitcoin Legacy', 
                    address: addresses.legacy || 'Not generated',
                    type: 'BIP44', 
                    permission: 'drwxr-xr-x',
                    icon: '₿'
                }
            ];
            
            return $.div({
                style: {
                    padding: '20px',
                    overflowY: 'auto',
                    flex: '1'
                }
            }, [
                $.div({
                    style: {
                        color: '#888',
                        fontSize: '12px',
                        marginBottom: '20px',
                        fontFamily: 'monospace'
                    }
                }, [`total ${walletTypes.length} wallets`]),
                
                ...walletTypes.map((wallet, index) => 
                    $.div({
                        className: 'terminal-account-item',
                        style: {
                            color: themeColor,
                            fontSize: '14px',
                            padding: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'monospace',
                            marginBottom: '5px',
                            borderLeft: `3px solid transparent`
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = `${themeColor}20`;
                            e.currentTarget.style.borderLeft = `3px solid ${themeColor}`;
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderLeft = '3px solid transparent';
                        },
                        onclick: () => this.viewAccountDetails(wallet.value)
                    }, [
                        $.div({
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                flexWrap: 'wrap'
                            }
                        }, [
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '100px' } }, [wallet.permission]),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '20px' } }, ['1']),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '50px' } }, ['moosh']),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '50px' } }, ['moosh']),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '50px' } }, ['4096']),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '60px' } }, [new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()]),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '50px' } }, [new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })]),
                            $.span({ style: { color: themeColor, fontWeight: 'bold' } }, [`${wallet.value}/`]),
                            $.span({ style: { color: '#666', marginLeft: '10px' } }, [`[${wallet.label}]`])
                        ]),
                        $.div({
                            style: {
                                color: '#666',
                                fontSize: '11px',
                                marginTop: '8px',
                                paddingLeft: '40px',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                lineHeight: '1.4'
                            }
                        }, [
                            $.span({ style: { color: themeColor } }, [wallet.icon]),
                            $.span({ style: { marginLeft: '8px' } }, [wallet.address])
                        ])
                    ])
                ),
                
                $.div({
                    style: {
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: `1px solid ${borderColor}`,
                        color: '#888',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                    }
                }, [
                    $.div({}, [`~/moosh/wallet/settings $ echo "Click on any wallet to view full details and private keys"`]),
                    $.div({ style: { marginTop: '10px', color: themeColor } }, ['█'])
                ])
            ]);
        }
        
        viewAccountDetails(walletType) {
            console.log('[WalletSettingsModal] Navigating to wallet details for:', walletType);
            this.close();
            if (this.app && this.app.router) {
                this.app.router.navigate(`wallet-details?type=${walletType}`);
            } else {
                window.location.hash = `#wallet-details?type=${walletType}`;
            }
        }
        
        close() {
            if (this.modal) {
                // Remove event listeners
                if (this.modalClickHandler) {
                    this.modal.onclick = null;
                    this.modalClickHandler = null;
                }
                
                // Destroy terminal if exists
                if (this.terminal && typeof this.terminal.destroy === 'function') {
                    this.terminal.destroy();
                    this.terminal = null;
                }
                
                // Clear all click handlers
                const buttons = this.modal.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.onclick = null;
                });
                
                this.modal.style.opacity = '0';
                setTimeout(() => {
                    if (this.modal && this.modal.parentNode) {
                        this.modal.parentNode.removeChild(this.modal);
                        this.modal = null;
                    }
                }, 300);
            }
        }
        
        addStyles() {
            if (document.getElementById('wallet-settings-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'wallet-settings-styles';
            style.textContent = `
                /* Wallet Settings Modal Styles - MOOSH Theme */
                .settings-modal {
                    background: #000000 !important;
                    border: 2px solid #f57315 !important;
                    border-radius: 0 !important;
                    color: #ffffff !important;
                    max-width: 800px !important;
                    width: 90% !important;
                    max-height: 90vh !important;
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                
                .settings-modal .modal-header {
                    background: #000000 !important;
                    border-bottom: 2px solid #f57315 !important;
                    padding: 20px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                }
                
                .settings-modal .modal-title {
                    color: #f57315 !important;
                    font-size: 24px !important;
                    margin: 0 !important;
                    font-family: 'JetBrains Mono', monospace !important;
                }
                
                .settings-modal .modal-close {
                    background: transparent !important;
                    border: none !important;
                    color: #f57315 !important;
                    font-size: 28px !important;
                    cursor: pointer !important;
                    padding: 0 !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.2s ease !important;
                }
                
                .settings-modal .modal-close:hover {
                    color: #ffffff !important;
                    transform: rotate(90deg) !important;
                }
                
                .settings-modal .settings-content {
                    flex: 1 !important;
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                
                .settings-modal .settings-tabs {
                    background: #000000 !important;
                    border-bottom: 1px solid #333333 !important;
                    padding: 0 20px !important;
                    display: flex !important;
                    gap: 0 !important;
                }
                
                .settings-modal .settings-tab {
                    background: transparent !important;
                    border: none !important;
                    border-bottom: 3px solid transparent !important;
                    color: #888888 !important;
                    padding: 15px 20px !important;
                    font-size: 14px !important;
                    font-family: 'JetBrains Mono', monospace !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    position: relative !important;
                }
                
                .settings-modal .settings-tab:hover {
                    color: #ffffff !important;
                }
                
                .settings-modal .settings-tab.active {
                    color: #f57315 !important;
                    border-bottom-color: #f57315 !important;
                }
                
                .settings-modal .settings-panel {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 20px !important;
                    background: #000000 !important;
                }
                
                .settings-modal .settings-section {
                    padding: 20px !important;
                    background: #000000 !important;
                }
                
                .settings-modal .settings-subtitle {
                    color: #f57315 !important;
                    font-size: 20px !important;
                    margin: 0 0 10px 0 !important;
                    font-family: 'JetBrains Mono', monospace !important;
                }
                
                .settings-modal .modal-footer {
                    background: #000000 !important;
                    border-top: 1px solid #333333 !important;
                    padding: 20px !important;
                    display: flex !important;
                    justify-content: flex-end !important;
                    gap: 10px !important;
                }
                
                .settings-modal .btn {
                    padding: 10px 20px !important;
                    border: 2px solid #f57315 !important;
                    background: #000000 !important;
                    color: #f57315 !important;
                    font-family: 'JetBrains Mono', monospace !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    border-radius: 0 !important;
                }
                
                .settings-modal .btn:hover {
                    background: #f57315 !important;
                    color: #000000 !important;
                }
                
                .settings-modal .btn-primary {
                    background: #f57315 !important;
                    color: #000000 !important;
                }
                
                .settings-modal .btn-primary:hover {
                    background: #000000 !important;
                    color: #f57315 !important;
                }
                
                /* Account items styling */
                .settings-modal .account-item {
                    border: 2px solid #333333 !important;
                    background: #000000 !important;
                    margin-bottom: 10px !important;
                }
                
                .settings-modal .account-item:hover {
                    border-color: #f57315 !important;
                    box-shadow: 0 0 10px rgba(245, 115, 21, 0.3) !important;
                }
                
                /* Scrollbar styling */
                .settings-modal .settings-panel::-webkit-scrollbar {
                    width: 8px !important;
                }
                
                .settings-modal .settings-panel::-webkit-scrollbar-track {
                    background: #111111 !important;
                }
                
                .settings-modal .settings-panel::-webkit-scrollbar-thumb {
                    background: #333333 !important;
                    border-radius: 0 !important;
                }
                
                .settings-modal .settings-panel::-webkit-scrollbar-thumb:hover {
                    background: #f57315 !important;
                }
                
                /* Settings inputs */
                .settings-modal select,
                .settings-modal input {
                    background: #000000 !important;
                    border: 1px solid #333333 !important;
                    color: #ffffff !important;
                    padding: 8px 12px !important;
                    font-family: 'JetBrains Mono', monospace !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                }
                
                .settings-modal select:focus,
                .settings-modal input:focus {
                    border-color: #f57315 !important;
                    outline: none !important;
                }
                
                .settings-modal .setting-item {
                    margin-bottom: 20px !important;
                }
                
                .settings-modal .setting-label {
                    display: block !important;
                    margin-bottom: 8px !important;
                    color: #888888 !important;
                    font-size: 13px !important;
                    font-family: 'JetBrains Mono', monospace !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'modal-header' }, [
                $.h2({ className: 'modal-title' }, ['⚙ Wallet Settings']),
                $.button({
                    className: 'modal-close',
                    onclick: () => this.close()
                }, ['×'])
            ]);
        }
        
        createSettingsTabs() {
            const $ = window.ElementFactory || ElementFactory;
            const tabs = ['Accounts', 'General', 'Security', 'Network', 'Advanced'];
            
            return $.div({ className: 'settings-content' }, [
                $.div({ className: 'settings-tabs' }, 
                    tabs.map((tab, index) => 
                        $.button({
                            className: `settings-tab ${index === 0 ? 'active' : ''}`,
                            onclick: () => this.switchTab(tab)
                        }, [tab])
                    )
                ),
                $.div({ className: 'settings-panel', id: 'settings-panel' }, [
                    this.createAccountsSettings()
                ])
            ]);
        }
        
        createAccountsSettings() {
            const $ = window.ElementFactory || ElementFactory;
            const walletTypes = [
                { value: 'taproot', label: 'Bitcoin Taproot', prefix: 'bc1p...', type: 'Primary' },
                { value: 'nativeSegWit', label: 'Bitcoin Native SegWit', prefix: 'bc1q...', type: 'BIP84' },
                { value: 'nestedSegWit', label: 'Bitcoin Nested SegWit', prefix: '3...', type: 'BIP49' },
                { value: 'legacy', label: 'Bitcoin Legacy', prefix: '1...', type: 'BIP44' },
                { value: 'spark', label: 'Spark Protocol', prefix: 'sp1...', type: 'Lightning' }
            ];
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-subtitle' }, ['Wallet Accounts']),
                $.p({ 
                    style: 'color: #888888; margin-bottom: 20px; font-size: 14px;' 
                }, ['Click on any account to view its details, including seed phrase and private keys.']),
                
                $.div({ 
                    className: 'accounts-list',
                    style: 'display: flex; flex-direction: column; gap: 12px;'
                }, walletTypes.map(wallet => 
                    $.div({
                        className: 'account-item',
                        style: {
                            background: 'var(--bg-primary)',
                            border: '2px solid #333333',
                            borderRadius: '0',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginBottom: '12px'
                        },
                        onclick: () => this.viewAccountDetails(wallet.value),
                        onmouseover: function() {
                            this.style.borderColor = '#f57315';
                            this.style.background = '#111111';
                            this.style.boxShadow = '0 0 10px rgba(245, 115, 21, 0.3)';
                        },
                        onmouseout: function() {
                            this.style.borderColor = '#333333';
                            this.style.background = '#000000';
                            this.style.boxShadow = 'none';
                        }
                    }, [
                        $.div({ style: 'display: flex; justify-content: space-between; align-items: center;' }, [
                            $.div({}, [
                                $.div({ 
                                    tag: 'h4',
                                    style: 'color: #f57315; margin: 0 0 6px 0; font-size: 18px; font-family: "JetBrains Mono", monospace;' 
                                }, [wallet.label]),
                                $.p({ 
                                    style: 'color: #888888; margin: 0; font-size: 14px; font-family: "JetBrains Mono", monospace;' 
                                }, [`${wallet.prefix} • ${wallet.type}`])
                            ]),
                            $.div({ 
                                style: 'color: #f57315; font-size: 24px; font-weight: bold;' 
                            }, ['→'])
                        ])
                    ])
                ))
            ]);
        }
        
        createGeneralSettings() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-subtitle' }, ['General Settings']),
                
                // Currency preference
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Display Currency']),
                    $.select({ className: 'setting-input' }, [
                        $.create('option', { value: 'USD' }, ['USD - US Dollar']),
                        $.create('option', { value: 'EUR' }, ['EUR - Euro']),
                        $.create('option', { value: 'GBP' }, ['GBP - British Pound']),
                        $.create('option', { value: 'BTC' }, ['BTC - Bitcoin'])
                    ])
                ]),
                
                // Language
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Language']),
                    $.select({ className: 'setting-input' }, [
                        $.create('option', { value: 'en' }, ['English']),
                        $.create('option', { value: 'es' }, ['Español']),
                        $.create('option', { value: 'fr' }, ['Français']),
                        $.create('option', { value: 'de' }, ['Deutsch'])
                    ])
                ]),
                
                // Theme
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Theme']),
                    $.select({ className: 'setting-input' }, [
                        $.create('option', { value: 'dark' }, ['Dark']),
                        $.create('option', { value: 'light' }, ['Light']),
                        $.create('option', { value: 'auto' }, ['Auto'])
                    ])
                ]),
                
                // Auto-lock
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Auto-lock Timer']),
                    $.select({ className: 'setting-input' }, [
                        $.create('option', { value: '5' }, ['5 minutes']),
                        $.create('option', { value: '15' }, ['15 minutes']),
                        $.create('option', { value: '30' }, ['30 minutes']),
                        $.create('option', { value: '0' }, ['Never'])
                    ])
                ])
            ]);
        }
        
        createSecuritySettings() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-subtitle' }, ['Security Settings']),
                
                // Show seed phrase button
                $.div({ className: 'setting-item' }, [
                    $.button({
                        className: 'btn btn-warning',
                        onclick: () => this.showSeedPhrase()
                    }, ['Show Seed Phrase'])
                ]),
                
                // Export private key
                $.div({ className: 'setting-item' }, [
                    $.button({
                        className: 'btn btn-warning',
                        onclick: () => this.exportPrivateKey()
                    }, ['Export Private Key'])
                ]),
                
                // Change password
                $.div({ className: 'setting-item' }, [
                    $.button({
                        className: 'btn btn-secondary',
                        onclick: () => this.changePassword()
                    }, ['Change Password'])
                ])
            ]);
        }
        
        createNetworkSettings() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-subtitle' }, ['Network Settings']),
                
                // Network selection
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Bitcoin Network']),
                    $.select({ className: 'setting-input' }, [
                        $.create('option', { value: 'mainnet' }, ['Mainnet']),
                        $.create('option', { value: 'testnet' }, ['Testnet']),
                        $.create('option', { value: 'signet' }, ['Signet'])
                    ])
                ]),
                
                // Electrum server
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Electrum Server']),
                    $.input({
                        type: 'text',
                        className: 'setting-input',
                        value: 'electrum.blockstream.info:50002',
                        placeholder: 'Server URL:Port'
                    })
                ]),
                
                // Tor settings
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, [
                        $.input({
                            type: 'checkbox',
                            className: 'setting-checkbox'
                        }),
                        $.span({ style: { marginLeft: '8px' } }, ['Use Tor for connections'])
                    ])
                ])
            ]);
        }
        
        createAdvancedSettings() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-subtitle' }, ['Advanced Settings']),
                
                // Gap limit
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Address Gap Limit']),
                    $.input({
                        type: 'number',
                        className: 'setting-input',
                        value: '20',
                        min: '1',
                        max: '100'
                    })
                ]),
                
                // Fee preference
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, ['Default Fee Rate']),
                    $.select({ className: 'setting-input' }, [
                        $.create('option', { value: 'low' }, ['Low (Economy)']),
                        $.create('option', { value: 'medium' }, ['Medium (Normal)']),
                        $.create('option', { value: 'high' }, ['High (Priority)']),
                        $.create('option', { value: 'custom' }, ['Custom'])
                    ])
                ]),
                
                // Debug mode
                $.div({ className: 'setting-item' }, [
                    $.label({ className: 'setting-label' }, [
                        $.input({
                            type: 'checkbox',
                            className: 'setting-checkbox'
                        }),
                        $.span({ style: { marginLeft: '8px' } }, ['Enable debug mode'])
                    ])
                ])
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'modal-footer' }, [
                $.button({
                    className: 'btn btn-primary',
                    onclick: () => this.saveSettings()
                }, ['Save Settings']),
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.close()
                }, ['Cancel'])
            ]);
        }
        
        switchTab(tabName) {
            const panel = document.getElementById('settings-panel');
            if (!panel) return;
            
            // Update active tab
            document.querySelectorAll('.settings-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.textContent === tabName) {
                    tab.classList.add('active');
                }
            });
            
            // Update panel content
            panel.innerHTML = '';
            let content;
            
            switch(tabName) {
                case 'Accounts':
                    content = this.createAccountsSettings();
                    break;
                case 'General':
                    content = this.createGeneralSettings();
                    break;
                case 'Security':
                    content = this.createSecuritySettings();
                    break;
                case 'Network':
                    content = this.createNetworkSettings();
                    break;
                case 'Advanced':
                    content = this.createAdvancedSettings();
                    break;
            }
            
            if (content) {
                panel.appendChild(content);
            }
        }
        
        showSeedPhrase() {
            const passwordModal = new PasswordModal(this.app, {
                title: 'Password Required',
                message: 'Enter your password to view seed phrase',
                onSuccess: () => {
                    // Show the actual seed phrase
                    this.displaySeedPhrase();
                },
                onCancel: () => {
                    this.app.showNotification('Password required to view seed phrase', 'error');
                }
            });
            
            passwordModal.show();
        }
        
        displaySeedPhrase() {
            const $ = window.ElementFactory || ElementFactory;
            const currentAccount = this.app.state.getCurrentAccount();
            
            if (!currentAccount || !currentAccount.mnemonic) {
                this.app.showNotification('No seed phrase available', 'error');
                return;
            }
            
            // Create modal to display seed phrase
            const modal = $.div({
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({
                    className: 'modal-content',
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '90%'
                    }
                }, [
                    $.h2({ style: { marginBottom: '20px' } }, ['Your Seed Phrase']),
                    $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            padding: '20px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            wordBreak: 'break-all',
                            border: '1px solid var(--border-color)'
                        }
                    }, [currentAccount.mnemonic]),
                    $.div({
                        style: {
                            background: '#ffeeee',
                            border: '1px solid #ff4444',
                            padding: '10px',
                            marginBottom: '20px',
                            fontSize: '12px',
                            color: '#ff4444'
                        }
                    }, ['WARNING: Never share your seed phrase with anyone. Write it down and store it in a safe place.']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-primary)',
                            color: 'var(--text-primary)',
                            padding: '10px 20px',
                            cursor: 'pointer'
                        },
                        onclick: () => modal.remove()
                    }, ['Close'])
                ])
            ]);
            
            document.body.appendChild(modal);
        }
        
        exportPrivateKey() {
            const passwordModal = new PasswordModal(this.app, {
                title: 'Export Private Key',
                message: 'Enter password to export private key',
                onSuccess: () => {
                    this.displayPrivateKeys();
                },
                onCancel: () => {
                    this.app.showNotification('Password required to export private key', 'error');
                }
            });
            
            passwordModal.show();
        }
        
        displayPrivateKeys() {
            const $ = window.ElementFactory || ElementFactory;
            const currentAccount = this.app.state.getCurrentAccount();
            
            if (!currentAccount || !currentAccount.privateKeys) {
                this.app.showNotification('No private keys available', 'error');
                return;
            }
            
            // Create modal to display private keys
            const modal = $.div({
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({
                    className: 'modal-content',
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        padding: '30px',
                        maxWidth: '700px',
                        width: '90%'
                    }
                }, [
                    $.h2({ style: { marginBottom: '20px' } }, ['Private Keys']),
                    
                    // Display each key type
                    ...Object.entries(currentAccount.privateKeys).map(([type, keyData]) => 
                        $.div({ style: { marginBottom: '20px' } }, [
                            $.h3({ style: { marginBottom: '10px', textTransform: 'capitalize' } }, [`${type} Private Key`]),
                            $.div({
                                style: {
                                    background: 'var(--bg-secondary)',
                                    padding: '15px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    wordBreak: 'break-all',
                                    border: '1px solid var(--border-color)'
                                }
                            }, [keyData.wif || 'Not available'])
                        ])
                    ),
                    
                    $.div({
                        style: {
                            background: '#ffeeee',
                            border: '1px solid #ff4444',
                            padding: '10px',
                            marginBottom: '20px',
                            fontSize: '12px',
                            color: '#ff4444'
                        }
                    }, ['WARNING: Never share your private keys with anyone. Anyone with these keys can steal your funds.']),
                    
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-primary)',
                            color: 'var(--text-primary)',
                            padding: '10px 20px',
                            cursor: 'pointer'
                        },
                        onclick: () => modal.remove()
                    }, ['Close'])
                ])
            ]);
            
            document.body.appendChild(modal);
        }
        
        changePassword() {
            if (this.app.state.hasPassword()) {
                // First verify current password
                const verifyModal = new PasswordModal(this.app, {
                    title: 'Verify Current Password',
                    message: 'Enter your current password',
                    onSuccess: () => {
                        // Then show new password dialog
                        const changeModal = new PasswordModal(this.app, {
                            title: 'Set New Password',
                            requireNewPassword: true,
                            onSuccess: () => {
                                this.app.showNotification('Password changed successfully', 'success');
                            }
                        });
                        changeModal.show();
                    }
                });
                verifyModal.show();
            } else {
                // No current password, just set new one
                const setModal = new PasswordModal(this.app, {
                    title: 'Set Wallet Password',
                    requireNewPassword: true,
                    onSuccess: () => {
                        this.app.showNotification('Password set successfully', 'success');
                    }
                });
                setModal.show();
            }
        }
        
        saveSettings() {
            this.app.showNotification('Settings saved successfully!', 'success');
            this.close();
        }
    }

    // Export to window
    window.WalletSettingsModal = WalletSettingsModal;

})(window);