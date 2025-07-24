// ReceivePaymentModal Module for MOOSH Wallet
// Handles receiving Lightning and Bitcoin payments

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // RECEIVE PAYMENT MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class ReceivePaymentModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.currentInvoice = null;
        }
        
        show() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.modal = $.div({ className: 'modal-backdrop' }, [
                $.div({ className: 'modal', style: 'max-width: 500px;' }, [
                    this.createHeader(),
                    this.createContent(),
                    this.createFooter()
                ])
            ]);
            
            document.body.appendChild(this.modal);
            // Store event handler for cleanup
            this.modalClickHandler = (e) => {
                if (e.target === this.modal) this.close();
            };
            this.modal.onclick = this.modalClickHandler;
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'modal-header' }, [
                $.h2({ className: 'modal-title' }, ['Receive Payment']),
                $.button({
                    className: 'close-btn',
                    onclick: () => this.close()
                }, ['×'])
            ]);
        }
        
        createContent() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'modal-content' }, [
                // Terminal-style header
                $.div({ 
                    className: 'terminal-box',
                    style: 'margin-bottom: 20px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
                }, [
                    $.div({ 
                        className: 'terminal-header',
                        style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 12px;'
                    }, [
                        $.span({}, ['~/moosh/lightning/receive $']),
                        $.span({ style: 'color: var(--text-primary); margin-left: 8px;' }, ['invoice'])
                    ])
                ]),
                
                // Payment Type Selector
                $.div({ className: 'form-group' }, [
                    $.label({ 
                        style: 'color: #888888; font-size: 12px; display: block; margin-bottom: 8px;'
                    }, ['Payment Type']),
                    $.div({ style: 'display: flex; gap: 8px; flex-wrap: wrap;' }, [
                        $.button({
                            id: 'btnSpark',
                            className: 'payment-type-btn active',
                            style: 'flex: 1; background: var(--text-primary); color: #000000; border: 1px solid var(--text-primary); border-radius: 0; padding: 8px; font-family: JetBrains Mono, monospace; font-size: 11px; cursor: pointer; min-width: 80px;',
                            onclick: () => this.selectPaymentType('spark')
                        }, [$.span({ style: { color: 'var(--text-accent)', fontWeight: 'bold' } }, ['MOOSH']), ' Spark']),
                        $.button({
                            id: 'btnOnchain',
                            className: 'payment-type-btn',
                            style: 'flex: 1; background: #000000; color: var(--text-primary); border: 1px solid var(--text-primary); border-radius: 0; padding: 8px; font-family: JetBrains Mono, monospace; font-size: 11px; cursor: pointer; min-width: 80px;',
                            onclick: () => this.selectPaymentType('onchain')
                        }, ['Bitcoin']),
                        $.button({
                            id: 'btnLightning',
                            className: 'payment-type-btn',
                            style: 'flex: 1; background: #000000; color: var(--text-primary); border: 1px solid var(--text-primary); border-radius: 0; padding: 8px; font-family: JetBrains Mono, monospace; font-size: 11px; cursor: pointer; min-width: 80px;',
                            onclick: () => this.selectPaymentType('lightning')
                        }, ['Lightning'])
                    ])
                ]),
                
                // Amount Input
                $.div({ className: 'form-group' }, [
                    $.label({ 
                        style: 'color: #888888; font-size: 12px; display: block; margin-bottom: 8px;'
                    }, ['Amount (sats)']),
                    $.input({
                        id: 'receiveAmount',
                        type: 'number',
                        placeholder: '100000',
                        style: 'width: 100%; background: #000000; border: 1px solid #333333; border-radius: 0; color: #ffffff; font-family: JetBrains Mono, monospace; font-size: 12px; padding: 12px;',
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = '#333333'; }
                    })
                ]),
                
                // Description
                $.div({ className: 'form-group' }, [
                    $.label({ 
                        style: 'color: #888888; font-size: 12px; display: block; margin-bottom: 8px;'
                    }, ['Description (optional)']),
                    $.input({
                        id: 'receiveDescription',
                        type: 'text',
                        placeholder: 'Payment for...',
                        style: 'width: 100%; background: #000000; border: 1px solid #333333; border-radius: 0; color: #ffffff; font-family: JetBrains Mono, monospace; font-size: 12px; padding: 12px;',
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = '#333333'; }
                    })
                ]),
                
                // Generated Address/Invoice Display
                $.div({ 
                    id: 'receiveDisplay',
                    style: 'display: none; margin-top: 20px;'
                }, [
                    $.div({ 
                        style: 'background: #000000; border: 1px solid var(--text-primary); border-radius: 0; padding: 16px; text-align: center;'
                    }, [
                        $.div({ 
                            id: 'qrCode',
                            style: 'width: 200px; height: 200px; margin: 0 auto 16px; background: #ffffff; border: 2px solid #000000;'
                        }, [
                            $.div({ style: 'padding: 90px 0; color: #000000;' }, ['QR Code'])
                        ]),
                        $.div({ 
                            id: 'receiveAddress',
                            style: 'font-family: JetBrains Mono, monospace; font-size: 11px; color: var(--text-primary); word-break: break-all; margin-bottom: 12px;'
                        }, ['...generating...']),
                        $.button({
                            onclick: () => this.copyAddress(),
                            style: 'background: #000000; border: 1px solid var(--text-primary); color: var(--text-primary); padding: 8px 16px; font-family: JetBrains Mono, monospace; font-size: 11px; cursor: pointer;'
                        }, ['Copy Address'])
                    ])
                ])
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'modal-footer' }, [
                $.button({
                    id: 'generateBtn',
                    className: 'btn btn-primary',
                    onclick: () => this.generateAddress()
                }, ['Generate Address']),
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.close()
                }, ['Close'])
            ]);
        }
        
        selectPaymentType(type) {
            const sparkBtn = document.getElementById('btnSpark');
            const onchainBtn = document.getElementById('btnOnchain');
            const lightningBtn = document.getElementById('btnLightning');
            const generateBtn = document.getElementById('generateBtn');
            
            // Reset all buttons
            [sparkBtn, onchainBtn, lightningBtn].forEach(btn => {
                btn.style.background = '#000000';
                btn.style.color = 'var(--text-primary)';
            });
            
            // Highlight selected button
            if (type === 'spark') {
                sparkBtn.style.background = 'var(--text-primary)';
                sparkBtn.style.color = '#000000';
                generateBtn.textContent = 'Generate Spark Address';
            } else if (type === 'onchain') {
                onchainBtn.style.background = 'var(--text-primary)';
                onchainBtn.style.color = '#000000';
                generateBtn.textContent = 'Generate Bitcoin Address';
            } else {
                lightningBtn.style.background = 'var(--text-primary)';
                lightningBtn.style.color = '#000000';
                generateBtn.textContent = 'Generate Invoice';
            }
        }
        
        generateAddress() {
            const amount = document.getElementById('receiveAmount').value;
            const isSpark = document.getElementById('btnSpark').style.background !== 'rgb(0, 0, 0)';
            const isLightning = document.getElementById('btnLightning').style.background !== 'rgb(0, 0, 0)';
            
            if (isLightning && !amount) {
                this.app.showNotification('Amount is required for Lightning invoices', 'error');
                return;
            }
            
            // Show the display area
            document.getElementById('receiveDisplay').style.display = 'block';
            
            // Get real wallet data from state
            const currentWallet = this.app.state.get('currentWallet');
            const sparkWallet = this.app.state.get('sparkWallet');
            
            if (isLightning) {
                // Generate Lightning invoice (still mock for now)
                this.currentInvoice = 'lnbc' + amount + 'u1pjk8wkkpp5q9jgp7nz8x0vz9xgq5jmv6jgp7nz8x0vz9xgq5jmv6';
                document.getElementById('receiveAddress').textContent = this.currentInvoice;
                this.app.showNotification('Lightning invoice generated', 'success');
            } else if (isSpark) {
                // Use real Spark address
                if (currentWallet && currentWallet.sparkAddress) {
                    this.currentInvoice = currentWallet.sparkAddress;
                } else if (sparkWallet && sparkWallet.addresses && sparkWallet.addresses.spark) {
                    this.currentInvoice = sparkWallet.addresses.spark;
                } else {
                    // Fallback to mock Spark address
                    this.currentInvoice = 'sp1pgss88jsfr948dtgvvwueyk8l4cev3xaf6qn8hhc724kje44mny6cae8h9s0ml';
                }
                document.getElementById('receiveAddress').textContent = this.currentInvoice;
                this.app.showNotification('Spark address generated', 'success');
            } else {
                // Use Bitcoin address
                if (currentWallet && currentWallet.bitcoinAddress) {
                    this.currentInvoice = currentWallet.bitcoinAddress;
                } else if (sparkWallet && sparkWallet.addresses && sparkWallet.addresses.bitcoin) {
                    this.currentInvoice = sparkWallet.addresses.bitcoin;
                } else {
                    // Fallback to mock Bitcoin address
                    this.currentInvoice = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
                }
                document.getElementById('receiveAddress').textContent = this.currentInvoice;
                this.app.showNotification('Bitcoin address generated', 'success');
            }
        }
        
        copyAddress() {
            if (this.currentInvoice) {
                // Enhanced copy with fallback
                const copyWithFallback = () => {
                    const textArea = document.createElement('textarea');
                    textArea.value = this.currentInvoice;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        this.app.showNotification('Copied to clipboard', 'success');
                        this.addCopyFeedback();
                    } catch (err) {
                        this.app.showNotification('Failed to copy. Please copy manually.', 'error');
                        prompt('Copy the address:', this.currentInvoice);
                    } finally {
                        document.body.removeChild(textArea);
                    }
                };
                
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(this.currentInvoice).then(() => {
                        this.app.showNotification('Copied to clipboard', 'success');
                        this.addCopyFeedback();
                    }).catch(() => {
                        copyWithFallback();
                    });
                } else {
                    copyWithFallback();
                }
            }
        }
        
        addCopyFeedback() {
            const copyButton = this.modal.querySelector('button[onclick*="copyAddress"]');
            if (copyButton) {
                const originalText = copyButton.textContent;
                copyButton.textContent = '✓ Copied!';
                copyButton.style.background = 'var(--text-accent)';
                copyButton.style.color = '#000000';
                
                this.copyFeedbackTimeout = setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.style.background = '';
                    copyButton.style.color = '';
                }, 1500);
            }
        }
        
        close() {
            if (this.modal && this.modal.parentNode) {
                // Remove event listeners
                if (this.modalClickHandler) {
                    this.modal.onclick = null;
                    this.modalClickHandler = null;
                }
                
                // Clear input event handlers
                const inputs = this.modal.querySelectorAll('input');
                inputs.forEach(input => {
                    input.onfocus = null;
                    input.onblur = null;
                });
                
                // Clear button handlers
                const buttons = this.modal.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.onclick = null;
                });
                
                // Clear timeout if exists
                if (this.copyFeedbackTimeout) {
                    clearTimeout(this.copyFeedbackTimeout);
                    this.copyFeedbackTimeout = null;
                }
                
                this.modal.parentNode.removeChild(this.modal);
                this.modal = null;
                this.currentInvoice = null;
            }
        }
    }

    // Export to window
    window.ReceivePaymentModal = ReceivePaymentModal;

})(window);