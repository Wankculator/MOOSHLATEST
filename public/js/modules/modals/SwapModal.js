// SwapModal Module for MOOSH Wallet
// This modal provides token swapping functionality

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // SWAP MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class SwapModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.fromToken = 'BTC';
            this.toToken = 'USDT';
            this.fromAmount = '';
            this.toAmount = '';
            this.slippage = 0.5; // 0.5% default
            this.showSettings = false;
            this.tokens = {
                'BTC': { name: 'Bitcoin', symbol: 'BTC', decimals: 8, price: 45320 },
                'USDT': { name: 'Tether', symbol: 'USDT', decimals: 6, price: 1 },
                'USDC': { name: 'USD Coin', symbol: 'USDC', decimals: 6, price: 1 },
                'MOOSH': { name: 'MOOSH', symbol: 'MOOSH', decimals: 18, price: 0.0058 }
            };
        }
        
        show() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Check if we're in MOOSH mode
            const isMooshMode = document.body.classList.contains('moosh-mode');
            
            // Detect viewport size
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            const isDesktop = window.innerWidth > 1024;
            
            // Store event handler for cleanup
            this.modalClickHandler = (e) => {
                if (e.target === this.modal) this.close();
            };
            
            this.modal = $.div({ 
                className: 'modal-overlay',
                onclick: this.modalClickHandler,
                style: {
                    background: isMobile ? 'var(--bg-primary)' : 'rgba(0, 0, 0, 0.8)'
                }
            }, [
                $.div({ 
                    className: 'modal-container swap-modal',
                    style: {
                        background: isMooshMode ? '#000000' : 'var(--bg-primary)',
                        border: isMobile ? 'none' : '2px solid var(--text-keyword)',
                        borderRadius: isMobile ? '16px 16px 0 0' : '0',
                        maxWidth: isDesktop ? '520px' : (isTablet ? '600px' : '100%'),
                        width: isMobile ? '100%' : '90%',
                        maxHeight: isMobile ? '100vh' : '90vh',
                        height: isMobile ? '100vh' : 'auto',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: isMobile ? 'fixed' : 'relative',
                        bottom: isMobile ? '0' : 'auto',
                        left: isMobile ? '0' : 'auto',
                        right: isMobile ? '0' : 'auto',
                        animation: isMobile ? 'slideUp 0.3s ease-out' : 'fadeInScale 0.3s ease-out',
                        boxShadow: isMobile ? '0 -4px 20px rgba(0, 0, 0, 0.2)' : '0 0 40px rgba(255, 140, 66, 0.2)'
                    }
                }, [
                    this.createHeader(),
                    this.createSwapInterface(),
                    this.createFooter()
                ])
            ]);
            
            document.body.appendChild(this.modal);
            this.addStyles();
            this.addResponsiveStyles();
            
            // Prevent body scroll on mobile
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
            
            // Show the modal by adding the 'show' class
            setTimeout(() => {
                this.modal.classList.add('show');
            }, 10);
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            const isMobile = window.innerWidth <= 768;
            
            return $.div({ 
                className: 'modal-header',
                style: {
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: isMobile ? '16px' : 'calc(20px * var(--scale-factor))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                    minHeight: isMobile ? '56px' : '64px'
                }
            }, [
                // Drag handle for mobile
                isMobile && $.div({
                    style: {
                        position: 'absolute',
                        top: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '36px',
                        height: '4px',
                        background: isMooshMode ? '#69fd97' : '#ff8c42',
                        borderRadius: '2px',
                        boxShadow: isMooshMode 
                            ? '0 2px 4px rgba(105, 253, 151, 0.3)' 
                            : '0 2px 4px rgba(255, 140, 66, 0.3)'
                    }
                }),
                
                $.div({
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    $.span({
                        style: {
                            color: 'var(--text-keyword)',
                            fontSize: isMobile ? '20px' : 'calc(24px * var(--scale-factor))',
                            fontWeight: 'bold'
                        }
                    }, ['⇄']),
                    $.h2({ 
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: isMobile ? '16px' : 'calc(18px * var(--scale-factor))',
                            fontWeight: '600',
                            margin: '0',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.05em'
                        }
                    }, ['MOOSH SWAP'])
                ]),
                $.div({
                    style: {
                        display: 'flex',
                        gap: isMobile ? '8px' : 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            padding: isMobile ? '8px' : 'calc(8px * var(--scale-factor))',
                            cursor: 'pointer',
                            fontSize: isMobile ? '16px' : 'calc(14px * var(--scale-factor))',
                            transition: 'all 0.2s ease',
                            width: isMobile ? '40px' : 'auto',
                            height: isMobile ? '40px' : 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: isMobile ? '8px' : '0'
                        },
                        onclick: () => this.toggleSettings(),
                        onmouseover: !isMobile ? (e) => {
                            e.target.style.borderColor = 'var(--text-keyword)';
                            e.target.style.color = 'var(--text-keyword)';
                        } : null,
                        onmouseout: !isMobile ? (e) => {
                            e.target.style.borderColor = 'var(--border-color)';
                            e.target.style.color = 'var(--text-secondary)';
                        } : null,
                        ontouchstart: isMobile ? (e) => {
                            e.target.style.background = 'var(--bg-primary)';
                        } : null,
                        ontouchend: isMobile ? (e) => {
                            e.target.style.background = 'transparent';
                        } : null
                    }, ['⚙']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: isMobile ? '24px' : 'calc(24px * var(--scale-factor))',
                            cursor: 'pointer',
                            padding: '0',
                            width: isMobile ? '40px' : 'calc(32px * var(--scale-factor))',
                            height: isMobile ? '40px' : 'calc(32px * var(--scale-factor))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            borderRadius: isMobile ? '8px' : '0'
                        },
                        onclick: () => this.close(),
                        onmouseover: !isMobile ? (e) => {
                            e.target.style.color = 'var(--text-keyword)';
                        } : null,
                        onmouseout: !isMobile ? (e) => {
                            e.target.style.color = 'var(--text-primary)';
                        } : null,
                        ontouchstart: isMobile ? (e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        } : null,
                        ontouchend: isMobile ? (e) => {
                            e.target.style.background = 'transparent';
                        } : null
                    }, ['×'])
                ])
            ]);
        }
        
        createSwapInterface() {
            const $ = window.ElementFactory || ElementFactory;
            const isMobile = window.innerWidth <= 768;
            
            return $.div({ 
                className: 'swap-interface',
                style: {
                    padding: isMobile ? '16px' : 'calc(24px * var(--scale-factor))',
                    background: 'var(--bg-primary)',
                    flex: '1',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch'
                }
            }, [
                // Settings panel (hidden by default)
                this.showSettings && this.createSettingsPanel(),
                
                // From section
                this.createTokenSection('from'),
                
                // Swap button with connecting line
                $.div({ 
                    style: {
                        position: 'relative',
                        margin: isMobile ? '12px 0' : 'calc(20px * var(--scale-factor)) 0',
                        height: isMobile ? '40px' : '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }, [
                    // Connecting line
                    $.div({
                        style: {
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '1px',
                            height: '100%',
                            background: 'var(--border-color)',
                            zIndex: '1'
                        }
                    }),
                    // Swap button
                    $.button({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '2px solid var(--text-keyword)',
                            color: 'var(--text-keyword)',
                            width: isMobile ? '40px' : 'calc(48px * var(--scale-factor))',
                            height: isMobile ? '40px' : 'calc(48px * var(--scale-factor))',
                            borderRadius: '0',
                            fontSize: isMobile ? '20px' : 'calc(24px * var(--scale-factor))',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: '2',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        },
                        onclick: () => this.swapTokens(),
                        onmouseover: !isMobile ? (e) => {
                            e.target.style.background = 'var(--text-keyword)';
                            e.target.style.color = 'var(--bg-primary)';
                            e.target.style.transform = 'rotate(180deg) scale(1.1)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.4)';
                        } : null,
                        onmouseout: !isMobile ? (e) => {
                            e.target.style.background = 'var(--bg-secondary)';
                            e.target.style.color = 'var(--text-keyword)';
                            e.target.style.transform = 'rotate(0deg) scale(1)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                        } : null,
                        ontouchstart: isMobile ? (e) => {
                            e.target.style.transform = 'scale(0.95)';
                        } : null,
                        ontouchend: isMobile ? (e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.background = e.target.style.background === 'var(--text-keyword)' 
                                ? 'var(--bg-secondary)' 
                                : 'var(--text-keyword)';
                            e.target.style.color = e.target.style.color === 'var(--bg-primary)' 
                                ? 'var(--text-keyword)' 
                                : 'var(--bg-primary)';
                        } : null
                    }, ['⇄'])
                ]),
                
                // To section
                this.createTokenSection('to'),
                
                // Transaction details
                this.createTransactionDetails()
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || ElementFactory;
            const canSwap = this.fromAmount && parseFloat(this.fromAmount) > 0;
            const hasBalance = this.getTokenBalance(this.fromToken) >= parseFloat(this.fromAmount || 0);
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            
            return $.div({ 
                style: {
                    background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border-color)',
                    padding: isMobile ? '16px' : 'calc(20px * var(--scale-factor))',
                    display: 'flex',
                    gap: isMobile ? '8px' : 'calc(12px * var(--scale-factor))',
                    flexShrink: 0,
                    flexDirection: isMobile ? 'column-reverse' : 'row',
                    position: 'relative'
                }
            }, [
                // Mobile: Show estimated output above buttons
                isMobile && this.fromAmount && parseFloat(this.fromAmount) > 0 && $.div({
                    style: {
                        position: 'absolute',
                        top: '-40px',
                        left: '16px',
                        right: '16px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    'You receive: ',
                    $.span({
                        style: {
                            color: 'var(--text-accent)',
                            fontWeight: '700'
                        }
                    }, [`~${this.toAmount} ${this.toToken}`])
                ]),
                
                // Cancel button
                $.button({
                    style: {
                        flex: isMobile ? '0 0 auto' : '1',
                        width: isMobile ? '100%' : 'auto',
                        background: 'transparent',
                        border: '2px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-secondary)',
                        padding: isMobile ? '14px' : 'calc(16px * var(--scale-factor))',
                        fontSize: isMobile ? '14px' : 'calc(16px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        height: isMobile ? '48px' : 'auto',
                        minHeight: '44px',
                        WebkitTapHighlightColor: 'transparent'
                    },
                    onclick: () => this.close(),
                    onmouseover: !isMobile ? (e) => {
                        e.target.style.borderColor = 'var(--text-dim)';
                        e.target.style.color = 'var(--text-primary)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    } : null,
                    onmouseout: !isMobile ? (e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.color = 'var(--text-secondary)';
                        e.target.style.background = 'transparent';
                    } : null,
                    ontouchstart: isMobile ? (e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'scale(0.98)';
                    } : null,
                    ontouchend: isMobile ? (e) => {
                        setTimeout(() => {
                            e.target.style.background = 'transparent';
                            e.target.style.transform = 'scale(1)';
                        }, 100);
                    } : null
                }, [isMobile ? 'Cancel' : 'CANCEL']),
                
                // Execute swap button
                $.button({
                    id: 'swapExecuteBtn',
                    style: {
                        flex: isMobile ? '0 0 auto' : '2',
                        width: isMobile ? '100%' : 'auto',
                        background: canSwap && hasBalance ? 'var(--text-keyword)' : 'var(--border-color)',
                        border: '2px solid ' + (canSwap && hasBalance ? 'var(--text-keyword)' : 'var(--border-color)'),
                        borderRadius: '0',
                        color: canSwap && hasBalance ? 'var(--bg-primary)' : 'var(--text-dim)',
                        padding: isMobile ? '14px' : 'calc(16px * var(--scale-factor))',
                        fontSize: isMobile ? '14px' : 'calc(16px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: '700',
                        cursor: canSwap && hasBalance ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.05em',
                        height: isMobile ? '48px' : 'auto',
                        minHeight: '44px',
                        position: 'relative',
                        overflow: 'hidden',
                        WebkitTapHighlightColor: 'transparent'
                    },
                    onclick: canSwap && hasBalance ? () => this.executeSwap() : null,
                    onmouseover: !isMobile && canSwap && hasBalance ? (e) => {
                        e.target.style.background = '#ff6600';
                        e.target.style.borderColor = '#ff6600';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.4)';
                    } : null,
                    onmouseout: !isMobile && canSwap && hasBalance ? (e) => {
                        e.target.style.background = 'var(--text-keyword)';
                        e.target.style.borderColor = 'var(--text-keyword)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    } : null,
                    ontouchstart: isMobile && canSwap && hasBalance ? (e) => {
                        e.target.style.transform = 'scale(0.98)';
                        e.target.style.background = '#ff6600';
                    } : null,
                    ontouchend: isMobile && canSwap && hasBalance ? (e) => {
                        setTimeout(() => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.background = 'var(--text-keyword)';
                        }, 100);
                    } : null,
                    disabled: !canSwap || !hasBalance
                }, [
                    // Button content with icon
                    $.div({
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }
                    }, [
                        // Icon based on state
                        canSwap && hasBalance && $.span({
                            style: {
                                fontSize: isMobile ? '16px' : '18px',
                                display: 'inline-block',
                                animation: 'pulse 2s infinite'
                            }
                        }, [$.span({ style: { color: 'var(--text-accent)', fontWeight: 'bold' } }, ['MOOSH'])]),
                        
                        // Text
                        $.span({}, [
                            !canSwap ? (isMobile ? 'Enter Amount' : 'ENTER AMOUNT') : 
                            !hasBalance ? (isMobile ? 'Insufficient Balance' : 'INSUFFICIENT BALANCE') : 
                            (isMobile ? 'Swap Now' : 'EXECUTE SWAP')
                        ])
                    ])
                ])
            ]);
        }
        
        handleFromAmountChange(e) {
            this.fromAmount = e.target.value;
            this.calculateToAmount();
            
            // Update USD value display
            const usdElement = e.target.parentElement.querySelector('.amount-usd');
            if (usdElement && this.fromAmount && parseFloat(this.fromAmount) > 0) {
                usdElement.textContent = this.getUSDValue(this.fromToken, parseFloat(this.fromAmount));
            } else if (usdElement) {
                usdElement.textContent = '';
            }
            
            // Update "to" amount USD value
            const toInput = document.getElementById('toAmountInput');
            if (toInput) {
                const toUsdElement = toInput.parentElement.querySelector('.amount-usd');
                if (toUsdElement && this.toAmount && parseFloat(this.toAmount) > 0) {
                    toUsdElement.textContent = this.getUSDValue(this.toToken, parseFloat(this.toAmount));
                } else if (toUsdElement) {
                    toUsdElement.textContent = '';
                }
            }
        }
        
        handleFromTokenChange(e) {
            this.fromToken = e.target.value;
            this.calculateToAmount();
        }
        
        handleToTokenChange(e) {
            this.toToken = e.target.value;
            this.calculateToAmount();
        }
        
        swapTokens() {
            const temp = this.fromToken;
            this.fromToken = this.toToken;
            this.toToken = temp;
            const tempAmount = this.toAmount;
            this.toAmount = this.fromAmount;
            this.fromAmount = tempAmount;
            this.calculateToAmount();
            
            // Close and reopen to refresh UI
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            this.show();
        }
        
        calculateToAmount() {
            // Placeholder calculation
            if (this.fromAmount && parseFloat(this.fromAmount) > 0) {
                const amount = parseFloat(this.fromAmount);
                let rate = 1;
                
                if (this.fromToken === 'BTC' && this.toToken === 'USDT') rate = 45320;
                else if (this.fromToken === 'USDT' && this.toToken === 'BTC') rate = 0.000022;
                else if (this.fromToken === 'MOOSH' && this.toToken === 'USDT') rate = 0.0058;
                else if (this.fromToken === 'USDT' && this.toToken === 'MOOSH') rate = 172.41;
                
                this.toAmount = (amount * rate * 0.997).toFixed(8); // 0.3% fee
            } else {
                this.toAmount = '';
            }
        }
        
        executeSwap() {
            if (!this.fromAmount || parseFloat(this.fromAmount) <= 0) {
                this.app.showNotification('Please enter a valid amount', 'error');
                return;
            }
            
            const hasBalance = this.getTokenBalance(this.fromToken) >= parseFloat(this.fromAmount);
            if (!hasBalance) {
                this.app.showNotification('Insufficient balance', 'error');
                return;
            }
            
            // Show processing state
            const swapButton = this.modal.querySelector('button:last-child');
            const originalText = swapButton.textContent;
            swapButton.textContent = 'PROCESSING...';
            swapButton.style.background = 'var(--text-dim)';
            swapButton.style.borderColor = 'var(--text-dim)';
            swapButton.style.cursor = 'wait';
            swapButton.disabled = true;
            
            this.app.showNotification(`Swapping ${this.fromAmount} ${this.fromToken} for ${this.toAmount} ${this.toToken}...`, 'info');
            
            // Simulate swap with animation
            setTimeout(() => {
                // Update balances (mock)
                this.app.showNotification('✓ Swap executed successfully!', 'success');
                
                // Show success animation
                swapButton.textContent = '✓ SUCCESS';
                swapButton.style.background = 'var(--text-accent)';
                swapButton.style.borderColor = 'var(--text-accent)';
                swapButton.style.color = 'var(--bg-primary)';
                
                // Close after delay
                setTimeout(() => {
                    this.close();
                }, 1500);
            }, 2000);
        }
        
        addStyles() {
            // No additional styles needed - all inline styles are used
            // This ensures perfect control over the swap modal appearance
        }
        
        addResponsiveStyles() {
            if (document.getElementById('swap-modal-responsive-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'swap-modal-responsive-styles';
            style.textContent = `
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeInScale {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }
                
                @keyframes rotateSwap {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(180deg);
                    }
                }
                
                /* Smooth scrolling */
                .swap-interface {
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                
                /* Input number spinner removal */
                .swap-modal input[type="number"]::-webkit-inner-spin-button,
                .swap-modal input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                
                .swap-modal input[type="number"] {
                    -moz-appearance: textfield;
                }
                
                /* Mobile specific styles */
                @media (max-width: 768px) {
                    .modal-overlay {
                        padding: 0 !important;
                    }
                    
                    .swap-modal {
                        border-radius: 16px 16px 0 0 !important;
                        margin: 0 !important;
                    }
                    
                    /* Touch-friendly tap targets */
                    .swap-modal button {
                        min-height: 44px;
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    /* Optimize for thumb reach */
                    .swap-interface {
                        padding-bottom: env(safe-area-inset-bottom, 20px);
                    }
                    
                    /* Prevent zoom on input focus */
                    .swap-modal input,
                    .swap-modal textarea,
                    .swap-modal select {
                        font-size: 16px !important;
                    }
                }
                
                /* Tablet specific */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .swap-modal {
                        max-width: 600px !important;
                    }
                }
                
                /* High DPI screens */
                @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                    .swap-modal {
                        box-shadow: 0 0 1px rgba(255, 140, 66, 0.5);
                    }
                }
                
                /* Landscape mobile */
                @media (max-width: 768px) and (orientation: landscape) {
                    .swap-modal {
                        max-height: 100vh !important;
                        overflow-y: auto !important;
                    }
                }
                
                /* Dark mode specific enhancements */
                @media (prefers-color-scheme: dark) {
                    .swap-modal {
                        box-shadow: 0 0 40px rgba(255, 140, 66, 0.3);
                    }
                }
                
                /* Reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    .swap-modal,
                    .swap-modal * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                
                /* Loading shimmer effect */
                .shimmer-loading {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.2) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }
        
        createTokenSection(type) {
            const $ = window.ElementFactory || ElementFactory;
            const isFrom = type === 'from';
            const token = isFrom ? this.fromToken : this.toToken;
            const amount = isFrom ? this.fromAmount : this.toAmount;
            const balance = this.getTokenBalance(token);
            const isMobile = window.innerWidth <= 768;
            
            return $.div({
                style: {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: isMobile ? '16px' : 'calc(24px * var(--scale-factor))',
                    marginBottom: isFrom ? '0' : (isMobile ? '16px' : 'calc(20px * var(--scale-factor))'),
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.2s ease'
                }
            }, [
                // Token header
                $.div({
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: isMobile ? '12px' : 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.label({
                        style: {
                            color: 'var(--text-secondary)',
                            fontSize: isMobile ? '11px' : 'calc(12px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: '600'
                        }
                    }, [isFrom ? 'FROM' : 'TO']),
                    $.span({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: isMobile ? '11px' : 'calc(12px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, [`Balance: ${balance.toFixed(8)}`])
                ]),
                
                // Mobile: Stacked layout, Desktop: Horizontal layout
                $.div({
                    style: {
                        display: isMobile ? 'flex' : 'grid',
                        flexDirection: isMobile ? 'column' : 'row',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                        gap: isMobile ? '12px' : 'calc(16px * var(--scale-factor))',
                        alignItems: isMobile ? 'stretch' : 'center'
                    }
                }, [
                    // Token selector (mobile: top, desktop: right)
                    isMobile && this.createTokenSelector(type),
                    
                    // Amount input container
                    $.div({
                        style: {
                            position: 'relative',
                            width: '100%'
                        }
                    }, [
                        // Amount input
                        $.input({
                            type: 'text',
                            inputMode: 'decimal',
                            placeholder: '0.00',
                            value: amount,
                            readOnly: !isFrom,
                            id: isFrom ? 'fromAmountInput' : 'toAmountInput',
                            style: {
                                width: '100%',
                                background: 'var(--bg-primary)',
                                border: '2px solid var(--border-color)',
                                borderRadius: '0',
                                color: 'var(--text-primary)',
                                padding: isMobile ? '14px 16px' : 'calc(16px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                                paddingRight: isMobile ? '60px' : '80px', // Space for USD value
                                fontSize: isMobile ? '20px' : 'calc(24px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: '700',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                height: isMobile ? '48px' : '56px',
                                textAlign: 'left',
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield',
                                cursor: !isFrom ? 'not-allowed' : 'text',
                                opacity: !isFrom ? '0.7' : '1'
                            },
                            oninput: isFrom ? (e) => {
                                // Smart formatting - allow only numbers and one decimal
                                let value = e.target.value;
                                value = value.replace(/[^0-9.]/g, '');
                                const parts = value.split('.');
                                if (parts.length > 2) {
                                    value = parts[0] + '.' + parts.slice(1).join('');
                                }
                                if (parts[1] && parts[1].length > 8) {
                                    value = parts[0] + '.' + parts[1].substring(0, 8);
                                }
                                e.target.value = value;
                                this.handleFromAmountChange(e);
                            } : null,
                            onfocus: isFrom ? (e) => {
                                e.target.style.borderColor = 'var(--text-keyword)';
                                e.target.style.boxShadow = '0 0 0 1px var(--text-keyword)';
                                e.target.parentElement.querySelector('.amount-usd').style.color = 'var(--text-keyword)';
                                // Select all text on focus for easy replacement
                                if (e.target.value === '0' || e.target.value === '0.00') {
                                    e.target.select();
                                }
                            } : null,
                            onblur: isFrom ? (e) => {
                                e.target.style.borderColor = 'var(--border-color)';
                                e.target.style.boxShadow = 'none';
                                e.target.parentElement.querySelector('.amount-usd').style.color = 'var(--text-secondary)';
                                // Format value on blur
                                if (e.target.value && !isNaN(e.target.value)) {
                                    const num = parseFloat(e.target.value);
                                    if (num > 0) {
                                        e.target.value = num.toFixed(num < 1 ? 8 : 2);
                                    }
                                }
                            } : null,
                            onkeydown: isFrom ? (e) => {
                                // Allow: backspace, delete, tab, escape, enter, decimal
                                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                    (e.keyCode === 65 && e.ctrlKey === true) ||
                                    (e.keyCode === 67 && e.ctrlKey === true) ||
                                    (e.keyCode === 86 && e.ctrlKey === true) ||
                                    (e.keyCode === 88 && e.ctrlKey === true) ||
                                    // Allow: home, end, left, right
                                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                                    return;
                                }
                                // Ensure that it is a number and stop the keypress
                                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                    e.preventDefault();
                                }
                            } : null
                        }),
                        
                        // USD value display
                        $.span({
                            className: 'amount-usd',
                            style: {
                                position: 'absolute',
                                right: isMobile ? '12px' : '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: isMobile ? '11px' : 'calc(12px * var(--scale-factor))',
                                color: 'var(--text-secondary)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: '500',
                                pointerEvents: 'none',
                                transition: 'color 0.2s ease'
                            }
                        }, [
                            amount && parseFloat(amount) > 0 
                                ? this.getUSDValue(token, parseFloat(amount))
                                : ''
                        ])
                    ]),
                    
                    // Token selector (desktop: right)
                    !isMobile && this.createTokenSelector(type)
                ]),
                
                // Quick percentage buttons (only for 'from')
                isFrom && $.div({
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: isMobile ? '8px' : 'calc(8px * var(--scale-factor))',
                        marginTop: isMobile ? '12px' : 'calc(16px * var(--scale-factor))'
                    }
                }, ['25%', '50%', '75%', 'MAX'].map(percent => 
                    $.button({
                        style: {
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0',
                            color: 'var(--text-secondary)',
                            padding: isMobile ? '10px 8px' : 'calc(10px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            fontSize: isMobile ? '12px' : 'calc(12px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: isMobile ? '40px' : '36px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        },
                        onclick: () => this.setPercentage(percent),
                        onmouseover: !isMobile ? (e) => {
                            e.target.style.background = 'var(--text-keyword)';
                            e.target.style.color = 'var(--bg-primary)';
                            e.target.style.borderColor = 'var(--text-keyword)';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 2px 4px rgba(255, 140, 66, 0.3)';
                        } : null,
                        onmouseout: !isMobile ? (e) => {
                            e.target.style.background = 'var(--bg-primary)';
                            e.target.style.color = 'var(--text-secondary)';
                            e.target.style.borderColor = 'var(--border-color)';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        } : null,
                        ontouchstart: isMobile ? (e) => {
                            e.target.style.background = 'var(--text-keyword)';
                            e.target.style.color = 'var(--bg-primary)';
                            e.target.style.borderColor = 'var(--text-keyword)';
                        } : null,
                        ontouchend: isMobile ? (e) => {
                            setTimeout(() => {
                                e.target.style.background = 'var(--bg-primary)';
                                e.target.style.color = 'var(--text-secondary)';
                                e.target.style.borderColor = 'var(--border-color)';
                            }, 100);
                        } : null
                    }, [percent])
                ))
            ]);
        }
        
        createTokenSelector(type) {
            const $ = window.ElementFactory || ElementFactory;
            const token = type === 'from' ? this.fromToken : this.toToken;
            const balance = this.getTokenBalance(token);
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            
            return $.button({
                style: {
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '0',
                    color: 'var(--text-primary)',
                    padding: isMobile ? '12px 16px' : 'calc(12px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                    fontSize: isMobile ? '14px' : 'calc(16px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? '12px' : 'calc(12px * var(--scale-factor))',
                    transition: 'all 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: isMobile ? 'auto' : (isTablet ? '140px' : '160px'),
                    height: isMobile ? '48px' : '56px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    WebkitTapHighlightColor: 'transparent'
                },
                onclick: () => this.showTokenSelector(type),
                onmouseover: !isMobile ? (e) => {
                    e.currentTarget.style.borderColor = 'var(--text-keyword)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--text-keyword), 0 4px 8px rgba(255, 140, 66, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                } : null,
                onmouseout: !isMobile ? (e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                } : null,
                ontouchstart: isMobile ? (e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                    e.currentTarget.style.transform = 'scale(0.98)';
                } : null,
                ontouchend: isMobile ? (e) => {
                    setTimeout(() => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }, 100);
                } : null
            }, [
                // Token info section
                $.div({
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '10px' : 'calc(12px * var(--scale-factor))',
                        flex: '1'
                    }
                }, [
                    // Token icon
                    $.span({
                        style: {
                            fontSize: isMobile ? '20px' : 'calc(24px * var(--scale-factor))',
                            width: isMobile ? '24px' : 'calc(28px * var(--scale-factor))',
                            height: isMobile ? '24px' : 'calc(28px * var(--scale-factor))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-primary)',
                            borderRadius: '50%',
                            flexShrink: 0
                        }
                    }, [this.getTokenIcon(token)]),
                    
                    // Token details
                    $.div({
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '2px'
                        }
                    }, [
                        // Token symbol
                        $.span({
                            style: {
                                fontSize: isMobile ? '14px' : 'calc(15px * var(--scale-factor))',
                                fontWeight: '700',
                                letterSpacing: '0.02em'
                            }
                        }, [token]),
                        
                        // Balance (mobile: show abbreviated)
                        $.span({
                            style: {
                                fontSize: isMobile ? '11px' : 'calc(11px * var(--scale-factor))',
                                color: 'var(--text-secondary)',
                                fontWeight: '500'
                            }
                        }, [
                            isMobile && balance > 1000 
                                ? `${(balance / 1000).toFixed(1)}k` 
                                : balance.toFixed(isMobile ? 2 : 4)
                        ])
                    ])
                ]),
                
                // Dropdown indicator
                $.div({
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '6px' : 'calc(8px * var(--scale-factor))',
                        color: 'var(--text-secondary)'
                    }
                }, [
                    // Optional: Show USD value on desktop
                    !isMobile && $.span({
                        style: {
                            fontSize: 'calc(11px * var(--scale-factor))',
                            color: 'var(--text-dim)',
                            fontWeight: '500'
                        }
                    }, [this.getUSDValue(token, balance)]),
                    
                    // Arrow
                    $.span({
                        style: {
                            fontSize: isMobile ? '12px' : 'calc(14px * var(--scale-factor))',
                            transition: 'transform 0.2s ease',
                            transform: 'rotate(0deg)'
                        }
                    }, ['▼'])
                ])
            ]);
        }
        
        createTransactionDetails() {
            const $ = window.ElementFactory || ElementFactory;
            const rate = this.getExchangeRate();
            const fee = this.fromAmount ? (parseFloat(this.fromAmount) * 0.003).toFixed(8) : '0.00';
            const priceImpact = this.calculatePriceImpact();
            const isMobile = window.innerWidth <= 768;
            
            return $.div({
                style: {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: isMobile ? '12px' : 'calc(16px * var(--scale-factor))',
                    marginTop: isMobile ? '12px' : 'calc(16px * var(--scale-factor))',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.2s ease'
                }
            }, [
                // Header
                $.div({
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: isMobile ? '8px' : 'calc(12px * var(--scale-factor))',
                        paddingBottom: isMobile ? '8px' : 'calc(8px * var(--scale-factor))',
                        borderBottom: '1px solid var(--border-color)'
                    }
                }, [
                    $.span({
                        style: {
                            fontSize: isMobile ? '11px' : 'calc(12px * var(--scale-factor))',
                            color: 'var(--text-secondary)',
                            fontFamily: "'JetBrains Mono', monospace",
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: '600'
                        }
                    }, ['Transaction Details']),
                    // Info icon
                    $.span({
                        style: {
                            fontSize: isMobile ? '12px' : 'calc(14px * var(--scale-factor))',
                            color: 'var(--text-dim)',
                            cursor: 'help',
                            transition: 'color 0.2s ease'
                        },
                        onmouseover: !isMobile ? (e) => {
                            e.target.style.color = 'var(--text-keyword)';
                        } : null,
                        onmouseout: !isMobile ? (e) => {
                            e.target.style.color = 'var(--text-dim)';
                        } : null,
                        title: 'Transaction details are estimates'
                    }, ['ⓘ'])
                ]),
                
                // Detail rows
                $.div({
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '6px' : 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    this.createDetailRow('Exchange Rate', `1 ${this.fromToken} = ${rate.toFixed(2)} ${this.toToken}`, null, true),
                    this.createDetailRow('Network Fee', `${fee} ${this.fromToken}`, null, false, 'Low network congestion'),
                    this.createDetailRow('Slippage Tolerance', `${this.slippage}%`, null, false, 'Max price movement allowed'),
                    priceImpact > 1 && this.createDetailRow(
                        'Price Impact', 
                        `${priceImpact.toFixed(2)}%`, 
                        priceImpact > 5 ? 'var(--error-color)' : 'var(--text-keyword)',
                        false,
                        priceImpact > 5 ? 'High price impact warning!' : 'Expected price movement'
                    ),
                    // Estimated output
                    this.fromAmount && parseFloat(this.fromAmount) > 0 && $.div({
                        style: {
                            marginTop: isMobile ? '8px' : 'calc(8px * var(--scale-factor))',
                            paddingTop: isMobile ? '8px' : 'calc(8px * var(--scale-factor))',
                            borderTop: '1px solid var(--border-color)'
                        }
                    }, [
                        this.createDetailRow(
                            'You will receive', 
                            `~${this.toAmount} ${this.toToken}`,
                            'var(--text-accent)',
                            true
                        )
                    ])
                ].filter(Boolean))
            ]);
        }
        
        createDetailRow(label, value, valueColor = 'var(--text-primary)', isImportant = false, tooltip = '') {
            const $ = window.ElementFactory || ElementFactory;
            const isMobile = window.innerWidth <= 768;
            
            return $.div({
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isMobile ? '4px 0' : 'calc(4px * var(--scale-factor)) 0',
                    borderRadius: '0',
                    transition: 'background 0.2s ease',
                    cursor: tooltip ? 'help' : 'default'
                },
                title: tooltip,
                onmouseover: !isMobile && tooltip ? (e) => {
                    e.currentTarget.style.background = 'rgba(255, 140, 66, 0.05)';
                } : null,
                onmouseout: !isMobile && tooltip ? (e) => {
                    e.currentTarget.style.background = 'transparent';
                } : null
            }, [
                $.span({
                    style: {
                        color: isImportant ? 'var(--text-secondary)' : 'var(--text-dim)',
                        fontSize: isMobile ? '11px' : 'calc(12px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: isImportant ? '600' : '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }
                }, [
                    label,
                    tooltip && $.span({
                        style: {
                            fontSize: '10px',
                            color: 'var(--text-dim)',
                            opacity: '0.7'
                        }
                    }, ['ⓘ'])
                ]),
                $.span({
                    style: {
                        color: valueColor,
                        fontSize: isMobile ? (isImportant ? '12px' : '11px') : `calc(${isImportant ? 13 : 12}px * var(--scale-factor))`,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: isImportant ? '700' : '600',
                        textAlign: 'right',
                        maxWidth: '60%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                }, [value])
            ]);
        }
        
        createSettingsPanel() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--text-keyword)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))',
                    marginBottom: 'calc(20px * var(--scale-factor))'
                }
            }, [
                $.h3({
                    style: {
                        color: 'var(--text-keyword)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: 'calc(12px * var(--scale-factor))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }
                }, ['TRANSACTION SETTINGS']),
                
                // Slippage tolerance
                $.div({
                    style: {
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.label({
                        style: {
                            color: 'var(--text-secondary)',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            display: 'block',
                            marginBottom: 'calc(8px * var(--scale-factor))'
                        }
                    }, ['Slippage Tolerance']),
                    $.div({
                        style: {
                            display: 'flex',
                            gap: 'calc(8px * var(--scale-factor))'
                        }
                    }, [
                        ...[0.1, 0.5, 1.0].map(value => 
                            $.button({
                                style: {
                                    background: this.slippage === value ? 'var(--text-keyword)' : 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0',
                                    color: this.slippage === value ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                    padding: 'calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                                    fontSize: 'calc(12px * var(--scale-factor))',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: () => this.setSlippage(value)
                            }, [`${value}%`])
                        ),
                        $.input({
                            type: 'number',
                            value: this.slippage,
                            placeholder: 'Custom',
                            style: {
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0',
                                color: 'var(--text-primary)',
                                padding: 'calc(8px * var(--scale-factor))',
                                fontSize: 'calc(12px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace",
                                width: 'calc(80px * var(--scale-factor))',
                                outline: 'none'
                            },
                            oninput: (e) => this.setSlippage(parseFloat(e.target.value) || 0.5)
                        })
                    ])
                ])
            ]);
        }
        
        getTokenBalance(token) {
            // Mock balances - in real app, fetch from wallet
            const balances = {
                'BTC': 0.15234567,
                'USDT': 4532.50,
                'USDC': 2150.25,
                'MOOSH': 150000.00
            };
            return balances[token] || 0;
        }
        
        getTokenIcon(token) {
            const icons = {
                'BTC': '₿',
                'USDT': '₮',
                'USDC': '$',
                'MOOSH': 'M'
            };
            return icons[token] || '○';
        }
        
        getExchangeRate() {
            const fromPrice = this.tokens[this.fromToken].price;
            const toPrice = this.tokens[this.toToken].price;
            return fromPrice / toPrice;
        }
        
        calculatePriceImpact() {
            if (!this.fromAmount || parseFloat(this.fromAmount) === 0) return 0;
            // Mock calculation - in real app, calculate based on liquidity
            const amount = parseFloat(this.fromAmount);
            const impact = amount * 0.1; // 0.1% per unit
            return Math.min(impact, 10); // Cap at 10%
        }
        
        getUSDValue(token, balance) {
            const price = this.tokens[token].price;
            const value = balance * price;
            if (value < 0.01) return '$0.00';
            if (value < 1) return `$${value.toFixed(3)}`;
            if (value > 1000) return `$${(value / 1000).toFixed(1)}k`;
            return `$${value.toFixed(2)}`;
        }
        
        setPercentage(percent) {
            const balance = this.getTokenBalance(this.fromToken);
            if (percent === 'MAX') {
                this.fromAmount = balance.toString();
            } else {
                const percentage = parseFloat(percent) / 100;
                this.fromAmount = (balance * percentage).toFixed(8);
            }
            this.calculateToAmount();
            
            // Close and reopen to refresh UI
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            this.show();
        }
        
        setSlippage(value) {
            this.slippage = value;
            
            // Close and reopen to refresh UI
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            this.show();
        }
        
        toggleSettings() {
            this.showSettings = !this.showSettings;
            
            // Close and reopen to refresh UI
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            this.show();
        }
        
        showTokenSelector(type) {
            // TODO: Implement token selector modal
            this.app.showNotification('Token selector coming soon...', 'info');
        }
        
        close() {
            if (this.modal) {
                // Remove event listeners
                if (this.modalClickHandler) {
                    this.modal.onclick = null;
                    this.modalClickHandler = null;
                }
                
                // Clear any input handlers
                const inputs = this.modal.querySelectorAll('input');
                inputs.forEach(input => {
                    input.onkeydown = null;
                    input.oninput = null;
                });
                
                this.modal.classList.remove('show');
                setTimeout(() => {
                    if (this.modal) {
                        this.modal.remove();
                        this.modal = null;
                    }
                }, 300);
            }
        }
    }

    // Export to window
    window.SwapModal = SwapModal;

})(window);