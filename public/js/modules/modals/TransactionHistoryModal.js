// TransactionHistoryModal Module for MOOSH Wallet
// This modal displays transaction history for the current wallet

(function(window) {
    'use strict';

    class TransactionHistoryModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.transactions = [];
        }
        
        async show() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Fetch transactions for current account
            await this.fetchTransactions();
            
            this.modal = $.div({
                className: 'modal-overlay',
                onclick: (e) => {
                    if (e.target === this.modal) this.close();
                }
            }, [
                $.div({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        maxWidth: 'calc(800px * var(--scale-factor))',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: 'calc(24px * var(--scale-factor))'
                    }
                }, [
                    this.createHeader(),
                    this.createFilterSection(),
                    this.createTransactionList(),
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
                }, ['TRANSACTION_HISTORY']),
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
        
        createFilterSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'flex',
                    gap: 'calc(12px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    alignItems: 'center'
                }
            }, [
                $.create('select', {
                    style: {
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        padding: 'calc(8px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(12px * var(--scale-factor))',
                        cursor: 'pointer'
                    },
                    onchange: (e) => this.filterTransactions(e.target.value)
                }, [
                    $.create('option', { value: 'all' }, ['All Transactions']),
                    $.create('option', { value: 'sent' }, ['Sent Only']),
                    $.create('option', { value: 'received' }, ['Received Only'])
                ]),
                $.div({
                    style: {
                        marginLeft: 'auto',
                        color: 'var(--text-dim)',
                        fontSize: 'calc(12px * var(--scale-factor))'
                    }
                }, [`${this.transactions.length} transactions found`])
            ]);
        }
        
        createTransactionList() {
            const $ = window.ElementFactory || ElementFactory;
            
            if (this.transactions.length === 0) {
                return $.div({
                    style: {
                        textAlign: 'center',
                        padding: 'calc(40px * var(--scale-factor))',
                        color: 'var(--text-dim)'
                    }
                }, ['No transactions found. Start using your wallet!']);
            }
            
            return $.div({
                style: {
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, this.transactions.map(tx => {
                const date = new Date(tx.time * 1000);
                const isReceive = tx.value > 0;
                
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
                    },
                    onclick: () => this.showTransactionDetails(tx)
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
                                    background: isReceive ? 'var(--text-accent)' : 'var(--text-primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000',
                                    fontSize: 'calc(18px * var(--scale-factor))'
                                }
                            }, [isReceive ? '↙' : '↗']),
                            $.div({}, [
                                $.div({
                                    style: {
                                        color: 'var(--text-primary)',
                                        fontWeight: '600',
                                        fontSize: 'calc(14px * var(--scale-factor))'
                                    }
                                }, [isReceive ? 'Received' : 'Sent']),
                                $.div({
                                    style: {
                                        color: 'var(--text-dim)',
                                        fontSize: 'calc(12px * var(--scale-factor))'
                                    }
                                }, [date.toLocaleString()])
                            ])
                        ]),
                        $.div({
                            style: {
                                textAlign: 'right'
                            }
                        }, [
                            $.div({
                                style: {
                                    color: isReceive ? 'var(--text-accent)' : 'var(--text-primary)',
                                    fontWeight: '600',
                                    fontSize: 'calc(16px * var(--scale-factor))'
                                }
                            }, [`${isReceive ? '+' : '-'}${Math.abs(tx.value / 100000000).toFixed(8)} BTC`]),
                            $.div({
                                style: {
                                    color: 'var(--text-dim)',
                                    fontSize: 'calc(11px * var(--scale-factor))'
                                }
                            }, [`${tx.confirmations || 0} confirmations`])
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
                    justifyContent: 'center'
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
                    onclick: () => this.exportTransactions()
                }, ['Export CSV']),
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
        
        async fetchTransactions() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount) {
                this.transactions = [];
                return;
            }
            
            // Get the current Bitcoin address
            const address = currentAccount.addresses?.bitcoin || 
                           currentAccount.addresses?.segwit || 
                           currentAccount.addresses?.taproot;
                           
            if (!address) {
                this.transactions = [];
                return;
            }
            
            try {
                // Fetch real transactions from the API
                const response = await this.app.api.getTransactions(address);
                
                if (response.success && response.data) {
                    // Format transactions for display
                    this.transactions = this.formatTransactions(response.data, address);
                } else {
                    this.transactions = [];
                }
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
                this.transactions = [];
            }
        }
        
        // Add this method to format blockchain transactions
        formatTransactions(txData, myAddress) {
            if (!Array.isArray(txData)) return [];
            
            return txData.map(tx => {
                // Determine if this is a send or receive
                const isSend = tx.vin?.some(input => 
                    input.prevout?.scriptpubkey_address === myAddress
                );
                
                let amount = 0;
                let toAddress = '';
                
                if (isSend) {
                    // For sends, calculate the amount sent (excluding change)
                    const myOutputs = tx.vout?.filter(output => 
                        output.scriptpubkey_address === myAddress
                    ) || [];
                    const otherOutputs = tx.vout?.filter(output => 
                        output.scriptpubkey_address !== myAddress
                    ) || [];
                    
                    amount = otherOutputs.reduce((sum, output) => sum + output.value, 0);
                    toAddress = otherOutputs[0]?.scriptpubkey_address || 'Unknown';
                } else {
                    // For receives, sum all outputs to our address
                    const myOutputs = tx.vout?.filter(output => 
                        output.scriptpubkey_address === myAddress
                    ) || [];
                    amount = myOutputs.reduce((sum, output) => sum + output.value, 0);
                    toAddress = myAddress;
                }
                
                return {
                    id: tx.txid,
                    type: isSend ? 'send' : 'receive',
                    amount: amount, // In satoshis
                    value: isSend ? -amount : amount, // Negative for sends
                    hash: tx.txid,
                    time: tx.status?.block_time || Math.floor(Date.now() / 1000),
                    confirmations: tx.status?.confirmed ? 6 : 0, // Simplified
                    address: isSend ? toAddress : (tx.vin[0]?.prevout?.scriptpubkey_address || 'Unknown'),
                    fee: tx.fee || 0,
                    status: tx.status?.confirmed ? 'confirmed' : 'pending'
                };
            }).sort((a, b) => b.time - a.time); // Sort by date, newest first
        }
        
        filterTransactions(filter) {
            // TODO: Implement filtering
            this.app.showNotification(`Filtering by ${filter}`, 'info');
        }
        
        showTransactionDetails(tx) {
            this.app.showNotification('Opening transaction in explorer...', 'info');
            // TODO: Open blockchain explorer
        }
        
        exportTransactions() {
            this.app.showNotification('Export feature coming soon', 'info');
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
    window.TransactionHistoryModal = TransactionHistoryModal;

})(window);