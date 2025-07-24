// MOOSH WALLET - Wallet Created Page Module
// Confirmation page after successful wallet creation
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class WalletCreatedPage extends Component {
        render() {
            const $ = window.ElementFactory || window.$;
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
            const $ = window.ElementFactory || window.$;
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
            const $ = window.ElementFactory || window.$;
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
            const $ = window.ElementFactory || window.$;
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
            const $ = window.ElementFactory || window.$;
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
            const $ = window.ElementFactory || window.$;
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
    }

    // Make available globally and maintain compatibility
    window.WalletCreatedPage = WalletCreatedPage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.WalletCreatedPage = WalletCreatedPage;
    }

})(window);