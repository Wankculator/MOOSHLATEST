// MOOSH WALLET - Wallet Settings Modal Module
// Terminal-style wallet type selector
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class WalletSettingsModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
        }
        
        show() {
            const $ = window.ElementFactory || window.$;
            
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
                    zIndex: '10000',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
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
                        fontFamily: 'monospace',
                        transform: 'scale(0.9)',
                        transition: 'transform 0.3s ease'
                    }
                }, [
                    this.createTerminalHeader(themeColor),
                    this.createTerminalContent(themeColor, borderColor)
                ])
            ]);
            
            // Close on overlay click
            this.modal.onclick = (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            };
            
            document.body.appendChild(this.modal);
            
            // Show with fade-in
            setTimeout(() => {
                this.modal.style.opacity = '1';
                const terminalBox = this.modal.querySelector('.terminal-box');
                if (terminalBox) {
                    terminalBox.style.transform = 'scale(1)';
                }
            }, 10);
        }
        
        createTerminalHeader(themeColor) {
            const $ = window.ElementFactory || window.$;
            
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
            const $ = window.ElementFactory || window.$;
            
            // Get wallet addresses
            const addresses = this.getWalletAddresses();
            
            // Create wallet types with real addresses
            const walletTypes = [
                { 
                    value: 'spark', 
                    label: 'Spark Protocol', 
                    address: addresses.spark || 'Not generated',
                    type: 'Lightning', 
                    permission: 'drwxr-xr-x',
                    icon: '⚡'
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
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '60px' } }, [
                                new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()
                            ]),
                            $.span({ style: { color: '#888', marginRight: '10px', minWidth: '50px' } }, [
                                new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                            ]),
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
        
        getWalletAddresses() {
            // Get wallet data from storage
            const sparkWallet = this.app.state.get('sparkWallet') || JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            // Get addresses
            const addresses = {};
            
            // Priority: sparkWallet > currentWallet
            if (sparkWallet && sparkWallet.addresses) {
                addresses.spark = sparkWallet.addresses.spark || 'Not available';
                
                if (sparkWallet.bitcoinAddresses) {
                    addresses.segwit = sparkWallet.bitcoinAddresses.segwit || sparkWallet.addresses.bitcoin || 'Not available';
                    addresses.taproot = sparkWallet.bitcoinAddresses.taproot || 'Not available';
                    addresses.nestedSegwit = sparkWallet.bitcoinAddresses.nestedSegwit || sparkWallet.bitcoinAddresses.nestedSegWit || 'Not available';
                    addresses.legacy = sparkWallet.bitcoinAddresses.legacy || 'Not available';
                } else {
                    addresses.segwit = sparkWallet.addresses.bitcoin || 'Not available';
                }
            } else if (currentWallet) {
                addresses.spark = currentWallet.sparkAddress || 'Not available';
                addresses.segwit = currentWallet.addresses?.segwit || currentWallet.bitcoinAddress || 'Not available';
                addresses.taproot = currentWallet.addresses?.taproot || 'Not available';
                addresses.nestedSegwit = currentWallet.addresses?.nestedSegwit || currentWallet.addresses?.nestedSegWit || 'Not available';
                addresses.legacy = currentWallet.addresses?.legacy || 'Not available';
            }
            
            return addresses;
        }
        
        viewAccountDetails(walletType) {
            this.close();
            if (this.app && this.app.router) {
                this.app.router.navigate(`wallet-details?type=${walletType}`);
            } else {
                window.location.hash = `#wallet-details?type=${walletType}`;
            }
        }
        
        close() {
            if (this.modal) {
                this.modal.style.opacity = '0';
                const terminalBox = this.modal.querySelector('.terminal-box');
                if (terminalBox) {
                    terminalBox.style.transform = 'scale(0.9)';
                }
                setTimeout(() => {
                    if (this.modal && this.modal.parentNode) {
                        this.modal.parentNode.removeChild(this.modal);
                    }
                    this.modal = null;
                }, 300);
            }
        }
    }

    // Make available globally
    window.WalletSettingsModal = WalletSettingsModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.WalletSettingsModal = WalletSettingsModal;
    }

})(window);