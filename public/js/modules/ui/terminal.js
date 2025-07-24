// MOOSH WALLET - Terminal Component Module
// Terminal-style UI component with network toggle and radio options
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class Terminal extends Component {
        constructor(app, props = {}) {
            super(app);
            this.props = props;
        }

        render() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ 
                className: 'terminal-box',
                style: { position: 'relative' }
            }, [
                this.props.showNetworkToggle ? this.createNetworkToggle() : null,
                $.div({ className: 'terminal-header' }, [
                    $.span({}, ['~/moosh/spark-wallet $'])
                ]),
                this.props.radioSection ? this.createRadioSection() : null,
                this.props.radioSection ? this.createStatusIndicator() : null,
                this.createTerminalContent()
            ]);
        }

        createRadioSection() {
            const $ = window.ElementFactory || window.$;
            const selectedMnemonic = this.app.state.get('selectedMnemonic');
            
            return $.div({
                style: {
                    marginBottom: 'calc(var(--spacing-unit) * 1.5 * var(--scale-factor))',
                    padding: 'calc(var(--spacing-unit) * var(--scale-factor))',
                    background: 'rgba(245, 115, 21, 0.05)',
                    border: 'calc(1px * var(--scale-factor)) solid var(--border-color)',
                    borderRadius: '0'
                }
            }, [
                $.div({
                    className: 'security-seed-header',
                    style: {
                        marginBottom: 'calc(var(--spacing-unit) * var(--scale-factor))',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        fontWeight: '600',
                        textAlign: 'center',
                        lineHeight: 'var(--mobile-line-height)',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease'
                    },
                    onmouseover: function() { 
                        // Only the text turns orange on hover, brackets stay grey
                        this.querySelector('.button-text').style.color = 'var(--text-primary)';
                    },
                    onmouseout: function() {
                        // Reset text to grey
                        this.querySelector('.button-text').style.color = 'var(--text-dim)';
                    }
                }, [
                    $.span({ 
                        className: 'bracket-left',
                        style: { 
                            color: '#666666',
                            fontSize: 'calc(9px * var(--scale-factor))',
                            transition: 'color 0.2s ease'
                        } 
                    }, ['<']),
                    $.span({ 
                        className: 'button-text',
                        style: { 
                            color: 'var(--text-dim)',
                            transition: 'color 0.2s ease'
                        } 
                    }, [' Select Security Seed ']),
                    $.span({ 
                        className: 'bracket-right',
                        style: { 
                            color: '#666666',
                            fontSize: 'calc(9px * var(--scale-factor))',
                            transition: 'color 0.2s ease'
                        } 
                    }, ['/>']),
                ]),
                $.div({
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 'calc(var(--spacing-unit) * 2 * var(--scale-factor))',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }
                }, [
                    this.createRadioOption(12, selectedMnemonic === 12),
                    this.createRadioOption(24, selectedMnemonic === 24)
                ])
            ]);
        }

        createNetworkToggle() {
            const $ = window.ElementFactory || window.$;
            const isMainnet = this.app.state.get('isMainnet');
            
            return $.div({
                className: 'network-toggle',
                style: {
                    position: 'absolute',
                    top: 'calc(8px * var(--scale-factor))',
                    right: 'calc(12px * var(--scale-factor))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'calc(var(--spacing-unit) * var(--scale-factor))',
                    zIndex: 10
                }
            }, [
                $.span({
                    id: 'networkLabel',
                    className: 'network-label'
                }, [isMainnet ? '.mainnet' : '.testnet']),
                $.div({
                    id: 'networkToggle',
                    className: isMainnet ? 'toggle-switch' : 'toggle-switch testnet',
                    onclick: () => this.toggleNetwork()
                }, [
                    $.div({ className: 'toggle-slider' })
                ])
            ]);
        }

        toggleNetwork() {
            const isMainnet = !this.app.state.get('isMainnet');
            this.app.state.set('isMainnet', isMainnet);
            
            const toggle = document.getElementById('networkToggle');
            const label = document.getElementById('networkLabel');
            
            if (isMainnet) {
                toggle.classList.remove('testnet');
                label.textContent = '.mainnet';
                console.log('[Network] Switched to Bitcoin MAINNET');
            } else {
                toggle.classList.add('testnet');
                label.textContent = '.testnet';
                console.log('[Network] Switched to Bitcoin TESTNET');
            }
            
            this.app.showNotification(`Network: ${isMainnet ? '.mainnet' : '.testnet'}`, 'network');
        }

        createRadioOption(words, isSelected) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 'calc(var(--spacing-unit) * var(--scale-factor))',
                    minHeight: 'calc(var(--touch-target-min) * 0.8 * var(--scale-factor))'
                },
                onclick: () => this.selectMnemonic(words)
            }, [
                $.div({
                    id: `radio${words}`,
                    className: 'custom-radio',
                    style: {
                        marginRight: 'calc(var(--spacing-unit) * var(--scale-factor))'
                    }
                }, [
                    $.div({
                        className: 'radio-inner',
                        style: {
                            background: isSelected ? 'var(--text-primary)' : 'transparent'
                        }
                    })
                ]),
                $.span({
                    style: {
                        fontSize: 'calc(10px * var(--scale-factor))',
                        fontWeight: '500',
                        userSelect: 'none',
                        color: 'var(--text-primary)',
                        lineHeight: 'var(--mobile-line-height)'
                    }
                }, [`${words} Word`])
            ]);
        }

        selectMnemonic(words) {
            this.app.state.set('selectedMnemonic', words);
            
            // Update radio appearance
            const radio12 = document.getElementById('radio12');
            const radio24 = document.getElementById('radio24');
            
            if (radio12 && radio24) {
                const inner12 = radio12.querySelector('.radio-inner');
                const inner24 = radio24.querySelector('.radio-inner');
                
                if (words === 12) {
                    inner12.style.background = 'var(--text-primary)';
                    inner24.style.background = 'transparent';
                } else {
                    inner24.style.background = 'var(--text-primary)';
                    inner12.style.background = 'transparent';
                }
            }
            
            this.app.showNotification(words + ' Word Mnemonic selected', 'success');
        }

        createStatusIndicator() {
            const $ = window.ElementFactory || window.$;
            
            return $.span({ 
                className: 'status-indicator-small',
                style: { 
                    color: 'var(--text-primary)'
                }
            }, [
                'Bitcoin Ready ',
                $.span({
                    className: 'blink',
                    style: { 
                        color: 'var(--text-primary)'
                    }
                }, ['●'])
            ]);
        }

        createTerminalContent() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'terminal-content' }, [
                $.span({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(9px * var(--scale-factor))',
                        lineHeight: 'var(--mobile-line-height)'
                    }
                }, ['# MOOSH Spark Protocol Wallet']),
                $.create('br'),
                $.span({
                    className: 'text-keyword',
                    style: {
                        fontSize: 'calc(9px * var(--scale-factor))',
                        lineHeight: 'var(--mobile-line-height)'
                    }
                }, ['import']),
                ' ',
                $.span({
                    className: 'text-primary',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['{']),
                ' ',
                $.span({
                    className: 'text-variable',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['SparkWallet']),
                ' ',
                $.span({
                    className: 'text-primary',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['}']),
                ' ',
                $.span({
                    className: 'text-keyword',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['from']),
                ' ',
                $.span({
                    className: 'text-keyword',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['"@buildonspark/spark-sdk"']),
                $.span({
                    className: 'text-primary',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, [';']),
                $.create('br'),
                $.span({
                    className: 'text-keyword',
                    style: {
                        fontSize: 'calc(9px * var(--scale-factor))',
                        lineHeight: 'var(--mobile-line-height)'
                    }
                }, ['const']),
                ' ',
                $.span({
                    className: 'text-variable',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['wallet']),
                ' ',
                $.span({
                    className: 'text-primary',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['=']),
                ' ',
                $.span({
                    className: 'text-keyword',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['await']),
                ' ',
                $.span({
                    className: 'text-variable',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['SparkWallet']),
                $.span({
                    className: 'text-primary',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['.']),
                $.span({
                    className: 'text-variable',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['initialize']),
                $.span({
                    className: 'text-primary',
                    style: { fontSize: 'calc(9px * var(--scale-factor))' }
                }, ['();']),
                $.create('br'),
                $.span({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(9px * var(--scale-factor))',
                        lineHeight: 'var(--mobile-line-height)'
                    }
                }, ['# Real sp1... addresses + Bitcoin Layer 2']),
                $.create('br'),
                $.span({
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(9px * var(--scale-factor))',
                        lineHeight: 'var(--mobile-line-height)'
                    }
                }, ['# Development Server: Bitcoin Blockchain'])
            ]);
        }
    }

    // Make available globally and maintain compatibility
    window.Terminal = Terminal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.Terminal = Terminal;
    }

})(window);