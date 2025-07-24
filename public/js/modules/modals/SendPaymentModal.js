// SendPaymentModal Module for MOOSH Wallet
// Handles sending Lightning and Bitcoin payments

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // SEND PAYMENT MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class SendPaymentModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
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
                $.h2({ className: 'modal-title' }, ['Send Lightning Payment']),
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
                        $.span({}, ['~/moosh/lightning/send $']),
                        $.span({ style: 'color: var(--text-primary); margin-left: 8px;' }, ['payment'])
                    ])
                ]),
                
                // Lightning Invoice Input
                $.div({ className: 'form-group' }, [
                    $.label({ 
                        style: 'color: #888888; font-size: 12px; display: block; margin-bottom: 8px;'
                    }, ['Lightning Invoice / Payment Request']),
                    $.textarea({
                        id: 'lightningInvoice',
                        placeholder: 'lnbc10u1pjk8w...',
                        style: 'width: 100%; height: 80px; background: #000000; border: 1px solid #333333; border-radius: 0; color: #ffffff; font-family: JetBrains Mono, monospace; font-size: 12px; padding: 12px; resize: vertical;',
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = '#333333'; }
                    })
                ]),
                
                // Amount Input (for keysend)
                $.div({ className: 'form-group' }, [
                    $.label({ 
                        style: 'color: #888888; font-size: 12px; display: block; margin-bottom: 8px;'
                    }, ['Amount (sats) - Optional for keysend']),
                    $.input({
                        id: 'sendAmount',
                        type: 'number',
                        placeholder: '1000',
                        style: 'width: 100%; background: #000000; border: 1px solid #333333; border-radius: 0; color: #ffffff; font-family: JetBrains Mono, monospace; font-size: 12px; padding: 12px;',
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = '#333333'; }
                    })
                ]),
                
                // Fee estimate
                $.div({ 
                    style: 'background: rgba(245, 115, 21, 0.1); border: 1px solid rgba(245, 115, 21, 0.3); border-radius: 0; padding: 12px; margin-top: 16px;'
                }, [
                    $.div({ style: 'font-size: 11px; color: #888888;' }, ['Estimated Fee: ']),
                    $.div({ style: 'font-size: 14px; color: var(--text-primary); font-weight: 600;' }, ['~1-3 sats']),
                    $.div({ style: 'font-size: 10px; color: #666666; margin-top: 4px;' }, ['Lightning payments have minimal fees'])
                ])
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'modal-footer' }, [
                $.button({
                    className: 'btn btn-primary',
                    onclick: () => this.sendPayment()
                }, ['Send Payment']),
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.close()
                }, ['Cancel'])
            ]);
        }
        
        sendPayment() {
            const invoice = document.getElementById('lightningInvoice').value;
            const amount = document.getElementById('sendAmount').value;
            
            if (!invoice && !amount) {
                this.app.showNotification('Please enter a Lightning invoice or amount', 'error');
                return;
            }
            
            this.app.showNotification('Processing Lightning payment...', 'info');
            
            // Simulate payment processing
            this.processTimeout = setTimeout(() => {
                this.app.showNotification('Payment sent successfully!', 'success');
                this.close();
            }, 2000);
        }
        
        close() {
            if (this.modal && this.modal.parentNode) {
                // Remove event listeners
                if (this.modalClickHandler) {
                    this.modal.onclick = null;
                    this.modalClickHandler = null;
                }
                
                // Clear input event handlers
                const inputs = this.modal.querySelectorAll('input, textarea');
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
                if (this.processTimeout) {
                    clearTimeout(this.processTimeout);
                    this.processTimeout = null;
                }
                
                this.modal.parentNode.removeChild(this.modal);
                this.modal = null;
            }
        }
    }

    // Export to window
    window.SendPaymentModal = SendPaymentModal;

})(window);