// MOOSH WALLET - Receive Modal Module
// Bitcoin receiving interface with QR code generation
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class ReceiveModal extends ModalBase {
        constructor(app, walletType = 'taproot') {
            super(app);
            this.walletType = walletType;
            
            // Debounce utility method
            this.debounce = (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            };
        }

        show() {
            const $ = window.ElementFactory || window.$;
            
            // Get current wallet address
            const walletAddress = this.getWalletAddress();
            
            const content = $.div({ className: 'modal-container receive-modal' }, [
                this.createHeader('Receive Bitcoin'),
                this.createContent(walletAddress),
                this.createFooter([
                    { text: 'Done', className: 'btn btn-primary full-width', onClick: () => this.close() }
                ])
            ]);
            
            this.createOverlay(content);
            this.addModalStyles();
            this.addReceiveModalStyles();
            super.show();
            
            // Generate QR code after modal is shown
            setTimeout(() => {
                this.generateQRCode(walletAddress);
            }, 100);
            
            // Setup event listeners
            this.setupEventListeners();
        }

        createContent(walletAddress) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'modal-content' }, [
                // QR Code section
                $.div({ className: 'qr-section' }, [
                    $.div({ 
                        id: 'qr-code-container',
                        className: 'qr-code-container' 
                    }, [
                        $.div({ className: 'qr-loading' }, ['Generating QR Code...'])
                    ])
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
                        $.create('select', { 
                            id: 'receive-unit',
                            className: 'amount-unit' 
                        }, [
                            $.create('option', { value: 'btc' }, ['BTC']),
                            $.create('option', { value: 'usd' }, ['USD'])
                        ])
                    ])
                ]),
                
                // Share options
                $.div({ className: 'share-section' }, [
                    $.div({ className: 'share-title' }, ['Share via']),
                    $.div({ className: 'share-buttons' }, [
                        $.button({ 
                            className: 'share-btn',
                            onclick: () => this.shareViaEmail(walletAddress)
                        }, ['Email']),
                        $.button({ 
                            className: 'share-btn',
                            onclick: () => this.shareViaMessage(walletAddress)
                        }, ['Message']),
                        $.button({ 
                            className: 'share-btn',
                            onclick: () => this.shareViaLink(walletAddress)
                        }, ['Link'])
                    ])
                ])
            ]);
        }

        getWalletAddress() {
            const currentAccount = this.app.state.getCurrentAccount();
            
            if (currentAccount && currentAccount.addresses) {
                // Get address based on wallet type
                switch (this.walletType) {
                    case 'spark':
                        return currentAccount.addresses.spark || currentAccount.sparkAddress || 'Not available';
                    case 'taproot':
                        return currentAccount.addresses.taproot || currentAccount.taprootAddress || 'Not available';
                    case 'segwit':
                    case 'nativeSegWit':
                        return currentAccount.addresses.segwit || currentAccount.bitcoinAddress || 'Not available';
                    case 'nestedSegWit':
                        return currentAccount.addresses.nestedSegwit || currentAccount.nestedSegWitAddress || 'Not available';
                    case 'legacy':
                        return currentAccount.addresses.legacy || currentAccount.legacyAddress || 'Not available';
                    default:
                        return currentAccount.address || currentAccount.bitcoinAddress || 'Not available';
                }
            }
            
            // Fallback to generated address
            return this.generateWalletAddress(this.walletType);
        }

        generateWalletAddress(type) {
            // This is a placeholder - in production, addresses should come from the wallet
            const prefixes = {
                taproot: 'bc1p',
                segwit: 'bc1q',
                nestedSegWit: '3',
                legacy: '1',
                spark: 'sp1p'
            };
            
            const prefix = prefixes[type] || 'bc1q';
            const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(20)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            return prefix + randomPart.substring(0, 40);
        }

        async generateQRCode(address) {
            const container = document.getElementById('qr-code-container');
            if (!container) return;
            
            try {
                // Clear loading message
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                
                // Create QR code using qrcode.js if available
                if (typeof QRCode !== 'undefined') {
                    new QRCode(container, {
                        text: `bitcoin:${address}`,
                        width: 200,
                        height: 200,
                        colorDark: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        colorLight: getComputedStyle(document.body).getPropertyValue('--bg-primary'),
                        correctLevel: QRCode.CorrectLevel.L
                    });
                } else {
                    // Fallback to simple text display
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.style.cssText = `
                        padding: 20px;
                        border: 2px solid var(--text-primary);
                        font-family: monospace;
                        font-size: 10px;
                        word-break: break-all;
                        text-align: center;
                    `;
                    fallbackDiv.textContent = `bitcoin:${address}`;
                    container.appendChild(fallbackDiv);
                }
            } catch (error) {
                console.error('Failed to generate QR code:', error);
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                const errorDiv = document.createElement('div');
                errorDiv.className = 'qr-error';
                errorDiv.textContent = 'Failed to generate QR code';
                container.appendChild(errorDiv);
            }
        }

        setupEventListeners() {
            const amountInput = document.getElementById('receive-amount');
            const unitSelect = document.getElementById('receive-unit');
            
            if (amountInput && unitSelect) {
                // Create debounced handler for cleanup
                const updateQR = () => {
                    const amount = parseFloat(amountInput.value);
                    if (amount > 0) {
                        const address = document.getElementById('wallet-address-display')?.value;
                        if (address) {
                            // Update QR code with amount
                            const unit = unitSelect.value;
                            if (unit === 'btc') {
                                this.generateQRCodeWithAmount(address, amount);
                            } else {
                                // Convert USD to BTC first
                                this.app.getBitcoinPrice().then(price => {
                                    const btcAmount = amount / price;
                                    this.generateQRCodeWithAmount(address, btcAmount);
                                });
                            }
                        }
                    }
                };
                
                // Store debounced handler for cleanup
                this.updateQRHandler = this.debounce(updateQR, 300);
                
                amountInput.addEventListener('input', this.updateQRHandler);
                unitSelect.addEventListener('change', this.updateQRHandler);
            }
        }

        async generateQRCodeWithAmount(address, amount) {
            const container = document.getElementById('qr-code-container');
            if (!container) return;
            
            const uri = `bitcoin:${address}?amount=${amount.toFixed(8)}`;
            
            try {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                
                if (typeof QRCode !== 'undefined') {
                    new QRCode(container, {
                        text: uri,
                        width: 200,
                        height: 200,
                        colorDark: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        colorLight: getComputedStyle(document.body).getPropertyValue('--bg-primary'),
                        correctLevel: QRCode.CorrectLevel.L
                    });
                }
            } catch (error) {
                console.error('Failed to update QR code:', error);
            }
        }

        copyAddress(address) {
            navigator.clipboard.writeText(address).then(() => {
                this.app.showNotification('Address copied to clipboard!', 'success');
                
                // Visual feedback
                const copyBtn = document.querySelector('.copy-btn');
                if (copyBtn) {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    copyBtn.style.background = 'var(--text-accent)';
                    copyBtn.style.color = '#000';
                    
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.background = '';
                        copyBtn.style.color = '';
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.app.showNotification('Failed to copy address', 'error');
            });
        }

        shareViaEmail(address) {
            const amount = document.getElementById('receive-amount')?.value;
            const subject = 'Bitcoin Payment Request';
            let body = `Please send Bitcoin to this address:\n\n${address}`;
            
            if (amount && parseFloat(amount) > 0) {
                body += `\n\nAmount: ${amount} ${document.getElementById('receive-unit')?.value.toUpperCase()}`;
            }
            
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }

        shareViaMessage(address) {
            const amount = document.getElementById('receive-amount')?.value;
            let text = `Bitcoin address: ${address}`;
            
            if (amount && parseFloat(amount) > 0) {
                text += ` | Amount: ${amount} ${document.getElementById('receive-unit')?.value.toUpperCase()}`;
            }
            
            if (navigator.share) {
                navigator.share({
                    title: 'Bitcoin Payment Request',
                    text: text
                }).catch(err => console.log('Share cancelled:', err));
            } else {
                this.copyAddress(text);
                this.app.showNotification('Payment details copied!', 'success');
            }
        }

        shareViaLink(address) {
            const amount = document.getElementById('receive-amount')?.value;
            let uri = `bitcoin:${address}`;
            
            if (amount && parseFloat(amount) > 0) {
                const unit = document.getElementById('receive-unit')?.value;
                if (unit === 'btc') {
                    uri += `?amount=${parseFloat(amount).toFixed(8)}`;
                } else {
                    // Convert USD to BTC
                    this.app.getBitcoinPrice().then(price => {
                        const btcAmount = parseFloat(amount) / price;
                        const finalUri = `bitcoin:${address}?amount=${btcAmount.toFixed(8)}`;
                        this.copyAddress(finalUri);
                        this.app.showNotification('Payment URI copied!', 'success');
                    });
                    return;
                }
            }
            
            this.copyAddress(uri);
            this.app.showNotification('Payment URI copied!', 'success');
        }

        addReceiveModalStyles() {
            if (document.getElementById('receive-modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'receive-modal-styles';
            style.textContent = `
                .receive-modal .qr-section {
                    display: flex;
                    justify-content: center;
                    margin-bottom: calc(20px * var(--scale-factor));
                }
                
                .receive-modal .qr-code-container {
                    padding: calc(20px * var(--scale-factor));
                    background: white;
                    border: 2px solid var(--text-primary);
                    display: inline-block;
                }
                
                .receive-modal .qr-loading {
                    padding: calc(80px * var(--scale-factor));
                    color: #666;
                    text-align: center;
                }
                
                .receive-modal .qr-error {
                    padding: calc(40px * var(--scale-factor));
                    color: var(--text-error);
                    text-align: center;
                }
                
                .receive-modal .address-section {
                    margin-bottom: calc(20px * var(--scale-factor));
                }
                
                .receive-modal .address-display {
                    display: flex;
                    gap: calc(10px * var(--scale-factor));
                }
                
                .receive-modal .address-input {
                    flex: 1;
                    font-family: monospace;
                    font-size: calc(12px * var(--scale-factor));
                }
                
                .receive-modal .copy-btn {
                    padding: calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor));
                    background: transparent;
                    border: 1px solid var(--text-primary);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .receive-modal .copy-btn:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }
                
                .receive-modal .form-group {
                    margin-bottom: calc(20px * var(--scale-factor));
                }
                
                .receive-modal .form-label {
                    display: block;
                    margin-bottom: calc(8px * var(--scale-factor));
                    color: var(--text-primary);
                    font-size: calc(12px * var(--scale-factor));
                    font-weight: 600;
                }
                
                .receive-modal .form-input {
                    width: 100%;
                    padding: calc(10px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: monospace;
                    font-size: calc(14px * var(--scale-factor));
                }
                
                .receive-modal .amount-input-group {
                    display: flex;
                    gap: calc(10px * var(--scale-factor));
                }
                
                .receive-modal .amount-input {
                    flex: 1;
                }
                
                .receive-modal .amount-unit {
                    padding: calc(10px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: monospace;
                    cursor: pointer;
                }
                
                .receive-modal .share-section {
                    border-top: 1px solid var(--border-color);
                    padding-top: calc(20px * var(--scale-factor));
                }
                
                .receive-modal .share-title {
                    font-weight: 600;
                    margin-bottom: calc(10px * var(--scale-factor));
                    color: var(--text-primary);
                }
                
                .receive-modal .share-buttons {
                    display: flex;
                    gap: calc(10px * var(--scale-factor));
                }
                
                .receive-modal .share-btn {
                    flex: 1;
                    padding: calc(10px * var(--scale-factor));
                    background: transparent;
                    border: 1px solid var(--text-dim);
                    color: var(--text-dim);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .receive-modal .share-btn:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }
            `;
            
            document.head.appendChild(style);
        }
    }

        close() {
            // Clean up event listeners
            const amountInput = document.getElementById('receive-amount');
            const unitSelect = document.getElementById('receive-unit');
            
            if (amountInput && this.updateQRHandler) {
                amountInput.removeEventListener('input', this.updateQRHandler);
            }
            
            if (unitSelect && this.updateQRHandler) {
                unitSelect.removeEventListener('change', this.updateQRHandler);
            }
            
            // Call parent close method
            super.close();
        }
    }

    // Make available globally
    window.ReceiveModal = ReceiveModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ReceiveModal = ReceiveModal;
    }

})(window);