// TokenMenuModal Module for MOOSH Wallet
// This modal displays available tokens and their prices

(function(window) {
    'use strict';

    class TokenMenuModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.tokens = [
                { symbol: 'BTC', name: 'Bitcoin', type: 'Native', balance: 0, price: 0, change: 0 },
                { symbol: 'USDT', name: 'Tether', type: 'Stablecoin', balance: 0, price: 1, change: 0 },
                { symbol: 'USDC', name: 'USD Coin', type: 'Stablecoin', balance: 0, price: 1, change: 0 },
                { symbol: 'MOOSH', name: 'MOOSH Token', type: 'Spark Token', balance: 0, price: 0.0058, change: 420.69 }
            ];
        }
        
        async show() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Fetch latest prices
            await this.fetchPrices();
            
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
                    zIndex: '1000',
                    padding: 'calc(20px * var(--scale-factor))'
                },
                onclick: (e) => {
                    if (e.target === this.modal) this.close();
                }
            }, [
                $.div({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        maxWidth: 'calc(700px * var(--scale-factor))',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: 'calc(24px * var(--scale-factor))'
                    }
                }, [
                    this.createHeader(),
                    this.createTokenList(),
                    this.createActions()
                ])
            ]);
            
            document.body.appendChild(this.modal);
            
            // Show the modal by adding the 'show' class
            setTimeout(() => {
                this.modal.classList.add('show');
            }, 10);
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 'calc(16px * var(--scale-factor))'
                }
            }, [
                $.h2({
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(20px * var(--scale-factor))',
                        fontWeight: '600',
                        fontFamily: "'JetBrains Mono', monospace"
                    }
                }, ['TOKEN_MENU']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        padding: '0',
                        width: 'calc(32px * var(--scale-factor))',
                        height: 'calc(32px * var(--scale-factor))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    onclick: () => this.close()
                }, ['×'])
            ]);
        }
        
        createTokenList() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, this.tokens.map(token => {
                const changeColor = token.change > 0 ? 'var(--text-accent)' : 
                                   token.change < 0 ? '#ff4444' : 'var(--text-dim)';
                const changeSymbol = token.change > 0 ? '+' : '';
                
                return $.div({
                    style: {
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        padding: 'calc(16px * var(--scale-factor))',
                        marginBottom: 'calc(12px * var(--scale-factor))',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    },
                    onmouseover: (e) => {
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(245, 115, 21, 0.05)';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.background = 'transparent';
                    }
                }, [
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }
                    }, [
                        $.div({
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'calc(12px * var(--scale-factor))'
                            }
                        }, [
                            $.div({
                                style: {
                                    width: 'calc(40px * var(--scale-factor))',
                                    height: 'calc(40px * var(--scale-factor))',
                                    background: token.symbol === 'BTC' ? '#ff9500' : 
                                               token.symbol === 'MOOSH' ? 'var(--text-accent)' : 
                                               'var(--border-color)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    fontSize: 'calc(12px * var(--scale-factor))'
                                }
                            }, [token.symbol.slice(0, 2)]),
                            $.div({}, [
                                $.div({
                                    style: {
                                        color: 'var(--text-primary)',
                                        fontWeight: '600',
                                        fontSize: 'calc(16px * var(--scale-factor))'
                                    }
                                }, [token.symbol]),
                                $.div({
                                    style: {
                                        color: 'var(--text-dim)',
                                        fontSize: 'calc(12px * var(--scale-factor))'
                                    }
                                }, [`${token.name} • ${token.type}`])
                            ])
                        ]),
                        $.div({
                            style: {
                                textAlign: 'right'
                            }
                        }, [
                            $.div({
                                style: {
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    fontSize: 'calc(16px * var(--scale-factor))'
                                }
                            }, [`$${token.price.toFixed(token.price < 1 ? 4 : 2)}`]),
                            $.div({
                                style: {
                                    color: changeColor,
                                    fontSize: 'calc(12px * var(--scale-factor))'
                                }
                            }, [`${changeSymbol}${token.change.toFixed(2)}%`])
                        ])
                    ])
                ]);
            }));
        }
        
        createActions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'flex',
                    gap: 'calc(12px * var(--scale-factor))',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }
            }, [
                $.button({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '600'
                    },
                    onclick: () => this.app.showNotification('Token swap coming soon', 'info')
                }, ['Swap Tokens']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-dim)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.close()
                }, ['Close'])
            ]);
        }
        
        async fetchPrices() {
            try {
                const priceData = await this.app.apiService.fetchBitcoinPrice();
                const btcToken = this.tokens.find(t => t.symbol === 'BTC');
                if (btcToken) {
                    btcToken.price = priceData.usd || 0;
                    btcToken.change = priceData.usd_24h_change || 0;
                }
            } catch (error) {
                console.error('Failed to fetch token prices:', error);
            }
        }
        
        close() {
            if (this.modal) {
                this.modal.classList.remove('show');
                setTimeout(() => {
                    this.modal.remove();
                    this.modal = null;
                }, 300);
            }
        }
    }

    // Export to window
    window.TokenMenuModal = TokenMenuModal;

})(window);