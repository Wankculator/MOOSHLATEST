// MOOSH WALLET - Send Modal Module
// Bitcoin transaction sending interface
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class SendModal extends ModalBase {
        constructor(app) {
            super(app);
            this.selectedFee = 'slow';
            this.feeRates = {
                slow: { rate: 1, time: '~60 min' },
                medium: { rate: 5, time: '~30 min' },
                fast: { rate: 15, time: '~10 min' }
            };
            
            // Initialize transaction signer
            this.transactionSigner = new window.TransactionSigner();
            
            // Create debounced version of updateAmountConversion
            this.debouncedUpdateAmountConversion = this.debounce(() => {
                this.updateAmountConversion();
            }, 300);
        }
        
        // Debounce utility method
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        show() {
            const $ = window.ElementFactory || window.$;
            
            const content = $.div({ className: 'modal-container send-modal' }, [
                this.createHeader('Send Bitcoin'),
                this.createContent(),
                this.createFooter([
                    { text: 'Cancel', className: 'btn btn-secondary', onClick: () => this.close() },
                    { text: 'Send Bitcoin', className: 'btn btn-primary', onClick: () => this.processSend() }
                ])
            ]);
            
            this.createOverlay(content);
            this.addModalStyles();
            this.addSendModalStyles();
            super.show();
            
            // Focus on address input
            setTimeout(() => {
                document.getElementById('recipient-address')?.focus();
            }, 100);
            
            // Setup event listeners
            this.setupEventListeners();
        }

        createContent() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'modal-content' }, [
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
                        $.create('select', { 
                            id: 'amount-unit',
                            className: 'amount-unit' 
                        }, [
                            $.create('option', { value: 'btc' }, ['BTC']),
                            $.create('option', { value: 'usd' }, ['USD'])
                        ])
                    ]),
                    $.div({ 
                        id: 'amount-conversion',
                        className: 'amount-conversion' 
                    }, [
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
                        $.span({ id: 'summary-amount', className: 'summary-value' }, ['0.00000000 BTC'])
                    ]),
                    $.div({ className: 'summary-row' }, [
                        $.span({ className: 'summary-label' }, ['Network Fee:']),
                        $.span({ id: 'summary-fee', className: 'summary-value' }, ['0.00000001 BTC'])
                    ]),
                    $.div({ className: 'summary-row total' }, [
                        $.span({ className: 'summary-label' }, ['Total:']),
                        $.span({ id: 'summary-total', className: 'summary-value' }, ['0.00000001 BTC'])
                    ])
                ])
            ]);
        }

        createFeeOption(value, label, time, rate, checked = false) {
            const $ = window.ElementFactory || window.$;
            
            return $.label({ className: 'fee-option' }, [
                $.input({
                    type: 'radio',
                    name: 'network-fee',
                    value: value,
                    checked: checked,
                    onchange: () => this.selectFee(value)
                }),
                $.div({ className: 'fee-option-content' }, [
                    $.div({ className: 'fee-option-label' }, [label]),
                    $.div({ className: 'fee-option-details' }, [
                        $.span({ className: 'fee-time' }, [time]),
                        $.span({ className: 'fee-rate' }, [rate])
                    ])
                ])
            ]);
        }

        setupEventListeners() {
            // Amount input change
            const amountInput = document.getElementById('send-amount');
            const unitSelect = document.getElementById('amount-unit');
            
            // Store handlers for cleanup
            this.amountInputHandler = () => this.debouncedUpdateAmountConversion();
            this.unitSelectHandler = () => this.debouncedUpdateAmountConversion();
            
            if (amountInput) {
                amountInput.addEventListener('input', this.amountInputHandler);
            }
            
            if (unitSelect) {
                unitSelect.addEventListener('change', this.unitSelectHandler);
            }
        }

        selectFee(feeType) {
            this.selectedFee = feeType;
            this.updateTransactionSummary();
        }

        async updateAmountConversion() {
            const amountInput = document.getElementById('send-amount');
            const unitSelect = document.getElementById('amount-unit');
            const conversionDiv = document.getElementById('amount-conversion');
            
            if (!amountInput || !unitSelect || !conversionDiv) return;
            
            const amount = parseFloat(amountInput.value) || 0;
            const unit = unitSelect.value;
            
            try {
                const bitcoinPrice = await this.app.getBitcoinPrice();
                let convertedAmount;
                
                if (unit === 'btc') {
                    convertedAmount = amount * bitcoinPrice;
                    // Clear and set content safely
                    while (conversionDiv.firstChild) {
                        conversionDiv.removeChild(conversionDiv.firstChild);
                    }
                    const span = document.createElement('span');
                    span.className = 'text-dim';
                    span.textContent = `≈ $${convertedAmount.toFixed(2)} USD`;
                    conversionDiv.appendChild(span);
                } else {
                    convertedAmount = amount / bitcoinPrice;
                    // Clear and set content safely
                    while (conversionDiv.firstChild) {
                        conversionDiv.removeChild(conversionDiv.firstChild);
                    }
                    const span = document.createElement('span');
                    span.className = 'text-dim';
                    span.textContent = `≈ ${convertedAmount.toFixed(8)} BTC`;
                    conversionDiv.appendChild(span);
                }
            } catch (error) {
                console.error('Failed to update conversion:', error);
            }
            
            this.updateTransactionSummary();
        }

        updateTransactionSummary() {
            const amountInput = document.getElementById('send-amount');
            const unitSelect = document.getElementById('amount-unit');
            const summaryAmount = document.getElementById('summary-amount');
            const summaryFee = document.getElementById('summary-fee');
            const summaryTotal = document.getElementById('summary-total');
            
            if (!amountInput || !unitSelect) return;
            
            const amount = parseFloat(amountInput.value) || 0;
            const unit = unitSelect.value;
            const feeRate = this.feeRates[this.selectedFee].rate;
            const estimatedFee = 0.00000001 * feeRate * 250; // Estimate 250 bytes transaction
            
            if (unit === 'btc') {
                summaryAmount.textContent = `${amount.toFixed(8)} BTC`;
                summaryFee.textContent = `${estimatedFee.toFixed(8)} BTC`;
                summaryTotal.textContent = `${(amount + estimatedFee).toFixed(8)} BTC`;
            } else {
                // Convert USD to BTC for summary
                this.app.getBitcoinPrice().then(price => {
                    const btcAmount = amount / price;
                    summaryAmount.textContent = `${btcAmount.toFixed(8)} BTC`;
                    summaryFee.textContent = `${estimatedFee.toFixed(8)} BTC`;
                    summaryTotal.textContent = `${(btcAmount + estimatedFee).toFixed(8)} BTC`;
                });
            }
        }

        async processSend() {
            const recipientAddress = document.getElementById('recipient-address')?.value;
            const amountInput = document.getElementById('send-amount')?.value;
            const unitSelect = document.getElementById('amount-unit')?.value;
            
            if (!recipientAddress || !amountInput) {
                this.app.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Validate Bitcoin address
            if (!this.isValidBitcoinAddress(recipientAddress)) {
                this.app.showNotification('Invalid Bitcoin address', 'error');
                return;
            }
            
            // Convert amount to BTC if needed
            let amountBTC = parseFloat(amountInput);
            if (unitSelect === 'usd') {
                const bitcoinPrice = await this.app.getBitcoinPrice();
                amountBTC = amountBTC / bitcoinPrice;
            }
            
            // Convert BTC to satoshis
            const amountSatoshis = Math.floor(amountBTC * 100000000);
            
            // Show confirmation
            const confirmed = confirm(`Send ${amountBTC.toFixed(8)} BTC to ${recipientAddress}?`);
            if (!confirmed) return;
            
            try {
                // Show loading state
                this.app.showNotification('Preparing transaction...', 'info');
                
                // Get current account
                const currentAccount = this.app.state.get('currentAccount');
                if (!currentAccount || !currentAccount.privateKeys) {
                    throw new Error('No wallet selected or private keys not available');
                }
                
                // Get sender address
                const senderAddress = currentAccount.addresses?.bitcoin;
                if (!senderAddress) {
                    throw new Error('Sender address not found');
                }
                
                // Fetch UTXOs for the sender address
                const utxosResponse = await this.app.apiService.get(`/api/bitcoin/utxos/${senderAddress}`);
                if (!utxosResponse.success || !utxosResponse.data) {
                    throw new Error('Failed to fetch UTXOs');
                }
                
                const utxos = utxosResponse.data;
                if (!utxos || utxos.length === 0) {
                    throw new Error('No unspent outputs available');
                }
                
                // Get network type
                const network = this.app.state.get('network') || 'mainnet';
                
                // Create and sign transaction on client side
                const signedTx = await this.transactionSigner.createAndSignTransaction({
                    from: senderAddress,
                    to: recipientAddress,
                    amount: amountSatoshis,
                    feeRate: this.feeRates[this.selectedFee].rate,
                    privateKey: currentAccount.privateKeys.bitcoin,
                    utxos: utxos,
                    network: network
                });
                
                if (!signedTx.success) {
                    throw new Error(signedTx.error || 'Failed to sign transaction');
                }
                
                // Broadcast the signed transaction (only the hex, no private keys!)
                const broadcastResponse = await this.app.apiService.post('/api/bitcoin/broadcast', {
                    hex: signedTx.transaction.hex
                });
                
                if (!broadcastResponse.success) {
                    throw new Error(broadcastResponse.error || 'Failed to broadcast transaction');
                }
                
                // Success!
                this.app.showNotification(
                    `Transaction sent successfully! TxID: ${signedTx.transaction.txId}`, 
                    'success',
                    10000
                );
                
                // Update balance
                this.app.updateBalance();
                
                // Add to transaction history
                if (this.app.transactionHistory) {
                    this.app.transactionHistory.addTransaction({
                        txid: signedTx.transaction.txId,
                        type: 'send',
                        amount: amountSatoshis,
                        fee: signedTx.transaction.fee,
                        confirmations: 0,
                        timestamp: Date.now(),
                        from: [senderAddress],
                        to: [recipientAddress],
                        status: 'pending'
                    });
                }
                
                this.close();
                
            } catch (error) {
                console.error('Transaction error:', error);
                this.app.showNotification(
                    `Failed to send transaction: ${error.message}`, 
                    'error',
                    10000
                );
            }
        }

        isValidBitcoinAddress(address) {
            // Basic Bitcoin address validation
            // P2PKH: 1...
            // P2SH: 3...
            // Bech32: bc1...
            // Bech32m (Taproot): bc1p...
            
            const patterns = [
                /^1[a-zA-Z0-9]{25,34}$/,        // Legacy
                /^3[a-zA-Z0-9]{25,34}$/,        // Nested SegWit
                /^bc1[a-z0-9]{39,59}$/,         // Native SegWit
                /^bc1p[a-z0-9]{58}$/,           // Taproot
                /^tb1[a-z0-9]{39,59}$/,         // Testnet SegWit
                /^[mn2][a-zA-Z0-9]{25,34}$/     // Testnet Legacy
            ];
            
            return patterns.some(pattern => pattern.test(address));
        }

        close() {
            // Clean up event listeners
            const amountInput = document.getElementById('send-amount');
            const unitSelect = document.getElementById('amount-unit');
            
            if (amountInput && this.amountInputHandler) {
                amountInput.removeEventListener('input', this.amountInputHandler);
            }
            
            if (unitSelect && this.unitSelectHandler) {
                unitSelect.removeEventListener('change', this.unitSelectHandler);
            }
            
            // Call parent close method
            super.close();
        }

        addSendModalStyles() {
            if (document.getElementById('send-modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'send-modal-styles';
            style.textContent = `
                .send-modal .form-group {
                    margin-bottom: calc(20px * var(--scale-factor));
                }
                
                .send-modal .form-label {
                    display: block;
                    margin-bottom: calc(8px * var(--scale-factor));
                    color: var(--text-primary);
                    font-size: calc(12px * var(--scale-factor));
                    font-weight: 600;
                }
                
                .send-modal .form-input {
                    width: 100%;
                    padding: calc(10px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: monospace;
                    font-size: calc(14px * var(--scale-factor));
                }
                
                .send-modal .amount-input-group {
                    display: flex;
                    gap: calc(10px * var(--scale-factor));
                }
                
                .send-modal .amount-input {
                    flex: 1;
                }
                
                .send-modal .amount-unit {
                    padding: calc(10px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: monospace;
                    cursor: pointer;
                }
                
                .send-modal .amount-conversion {
                    margin-top: calc(8px * var(--scale-factor));
                    font-size: calc(12px * var(--scale-factor));
                }
                
                .send-modal .fee-options {
                    display: flex;
                    gap: calc(10px * var(--scale-factor));
                }
                
                .send-modal .fee-option {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    padding: calc(10px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .send-modal .fee-option:hover {
                    border-color: var(--text-primary);
                }
                
                .send-modal .fee-option input[type="radio"] {
                    margin-right: calc(10px * var(--scale-factor));
                }
                
                .send-modal .fee-option-content {
                    flex: 1;
                }
                
                .send-modal .fee-option-label {
                    font-weight: 600;
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .send-modal .fee-option-details {
                    display: flex;
                    justify-content: space-between;
                    font-size: calc(11px * var(--scale-factor));
                    color: var(--text-dim);
                }
                
                .send-modal .transaction-summary {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border-color);
                    padding: calc(15px * var(--scale-factor));
                    margin-top: calc(20px * var(--scale-factor));
                }
                
                .send-modal .summary-title {
                    font-weight: 600;
                    margin-bottom: calc(10px * var(--scale-factor));
                    color: var(--text-primary);
                }
                
                .send-modal .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: calc(5px * var(--scale-factor)) 0;
                    font-size: calc(13px * var(--scale-factor));
                }
                
                .send-modal .summary-row.total {
                    border-top: 1px solid var(--border-color);
                    margin-top: calc(5px * var(--scale-factor));
                    padding-top: calc(10px * var(--scale-factor));
                    font-weight: 600;
                    color: var(--text-primary);
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    // Make available globally
    window.SendModal = SendModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.SendModal = SendModal;
    }

})(window);