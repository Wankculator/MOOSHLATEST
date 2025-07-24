// MOOSH WALLET - Transaction History Module
// Displays recent Bitcoin transactions with filtering
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class TransactionHistory extends Component {
        constructor(app) {
            super(app);
            this.transactions = [];
            this.filter = 'all'; // all, sent, received
        }

        render() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ 
                style: {
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))'
                }
            }, [
                // Section header
                $.div({ 
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.h3({ 
                        style: {
                            fontSize: 'calc(16px * var(--scale-factor))',
                            color: 'var(--text-primary)',
                            margin: '0',
                            fontWeight: '600'
                        }
                    }, ['Recent Transactions']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-dim)',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(12px * var(--scale-factor))',
                            padding: 'calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => this.handleFilter(),
                        onmouseover: function() {
                            this.style.borderColor = 'var(--text-primary)';
                            this.style.color = 'var(--text-primary)';
                        },
                        onmouseout: function() {
                            this.style.borderColor = 'var(--border-color)';
                            this.style.color = 'var(--text-dim)';
                        }
                    }, ['Filter'])
                ]),
                
                // Transaction list
                $.div({ 
                    id: 'transaction-list',
                    style: {
                        minHeight: 'calc(100px * var(--scale-factor))'
                    }
                }, [
                    this.transactions.length > 0 
                        ? this.renderTransactions() 
                        : this.createEmptyState()
                ])
            ]);
        }

        createEmptyState() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ 
                style: {
                    textAlign: 'center',
                    padding: 'calc(40px * var(--scale-factor))',
                    color: 'var(--text-dim)',
                    fontFamily: "'JetBrains Mono', monospace"
                }
            }, [
                $.div({ 
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['No transactions yet']),
                $.div({ 
                    style: {
                        fontSize: 'calc(12px * var(--scale-factor))',
                        opacity: '0.7'
                    }
                }, ['Send or receive Bitcoin to see transactions here'])
            ]);
        }

        renderTransactions() {
            const $ = window.ElementFactory || window.$;
            
            const filteredTransactions = this.getFilteredTransactions();
            
            return $.div({ className: 'transaction-list' }, 
                filteredTransactions.map(tx => this.createTransactionItem(tx))
            );
        }

        createTransactionItem(tx) {
            const $ = window.ElementFactory || window.$;
            const isSent = tx.type === 'sent';
            const typeColor = isSent ? '#ff4444' : '#00ff00';
            const typeSymbol = isSent ? '↗' : '↙';
            
            return $.div({ 
                className: 'transaction-item',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'calc(16px * var(--scale-factor))',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                },
                onclick: () => this.viewTransactionDetails(tx),
                onmouseover: function() {
                    this.style.background = 'rgba(255, 255, 255, 0.02)';
                },
                onmouseout: function() {
                    this.style.background = 'transparent';
                }
            }, [
                // Left side - Type and info
                $.div({ 
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    // Type icon
                    $.div({ 
                        style: {
                            width: 'calc(32px * var(--scale-factor))',
                            height: 'calc(32px * var(--scale-factor))',
                            borderRadius: '50%',
                            background: `${typeColor}20`,
                            border: `1px solid ${typeColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'calc(16px * var(--scale-factor))',
                            color: typeColor
                        }
                    }, [typeSymbol]),
                    
                    // Transaction info
                    $.div({}, [
                        $.div({ 
                            style: {
                                fontSize: 'calc(14px * var(--scale-factor))',
                                color: 'var(--text-primary)',
                                marginBottom: 'calc(4px * var(--scale-factor))'
                            }
                        }, [isSent ? 'Sent' : 'Received']),
                        $.div({ 
                            style: {
                                fontSize: 'calc(12px * var(--scale-factor))',
                                color: 'var(--text-dim)',
                                fontFamily: "'JetBrains Mono', monospace"
                            }
                        }, [this.truncateAddress(tx.address)])
                    ])
                ]),
                
                // Right side - Amount and time
                $.div({ 
                    style: {
                        textAlign: 'right'
                    }
                }, [
                    $.div({ 
                        style: {
                            fontSize: 'calc(14px * var(--scale-factor))',
                            color: typeColor,
                            fontWeight: '600',
                            marginBottom: 'calc(4px * var(--scale-factor))'
                        }
                    }, [`${isSent ? '-' : '+'}${this.formatBitcoin(tx.amount)} BTC`]),
                    $.div({ 
                        style: {
                            fontSize: 'calc(11px * var(--scale-factor))',
                            color: 'var(--text-dim)'
                        }
                    }, [this.formatTime(tx.timestamp)])
                ])
            ]);
        }

        getFilteredTransactions() {
            if (this.filter === 'all') {
                return this.transactions;
            }
            return this.transactions.filter(tx => tx.type === this.filter);
        }

        handleFilter() {
            const $ = window.ElementFactory || window.$;
            
            // Create filter dropdown
            const filterOptions = ['all', 'sent', 'received'];
            const currentIndex = filterOptions.indexOf(this.filter);
            const nextIndex = (currentIndex + 1) % filterOptions.length;
            
            this.filter = filterOptions[nextIndex];
            this.update();
        }

        viewTransactionDetails(tx) {
            // Open transaction details in block explorer
            const explorerUrl = `https://mempool.space/tx/${tx.txid}`;
            window.open(explorerUrl, '_blank');
        }

        truncateAddress(address) {
            if (!address) return '';
            return `${address.slice(0, 8)}...${address.slice(-8)}`;
        }

        formatBitcoin(satoshis) {
            return (satoshis / 100000000).toFixed(8);
        }

        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            // Less than 1 hour
            if (diff < 3600000) {
                const minutes = Math.floor(diff / 60000);
                return `${minutes}m ago`;
            }
            
            // Less than 24 hours
            if (diff < 86400000) {
                const hours = Math.floor(diff / 3600000);
                return `${hours}h ago`;
            }
            
            // Less than 7 days
            if (diff < 604800000) {
                const days = Math.floor(diff / 86400000);
                return `${days}d ago`;
            }
            
            // Default to date
            return date.toLocaleDateString();
        }

        async loadTransactions() {
            try {
                // Get current address
                const currentAccount = this.app.state.getCurrentAccount();
                if (!currentAccount || !currentAccount.address) return;
                
                // TODO: Implement actual transaction loading from API
                // For now, use mock data
                this.transactions = this.generateMockTransactions();
                
                this.update();
            } catch (error) {
                console.error('Failed to load transactions:', error);
            }
        }

        generateMockTransactions() {
            // Generate some mock transactions for testing
            const mockTxs = [];
            const types = ['sent', 'received'];
            const now = Date.now();
            
            for (let i = 0; i < 5; i++) {
                mockTxs.push({
                    txid: this.generateRandomTxId(),
                    type: types[Math.floor(Math.random() * types.length)],
                    address: this.generateRandomAddress(),
                    amount: Math.floor(Math.random() * 10000000) + 1000000, // 0.01 - 0.1 BTC
                    timestamp: now - (i * 3600000 * 24), // Each day back
                    confirmations: 6 + i * 10
                });
            }
            
            return mockTxs;
        }

        generateRandomTxId() {
            const bytes = new Uint8Array(32);
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        generateRandomAddress() {
            const prefixes = ['bc1q', '1', '3'];
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const bytes = new Uint8Array(20);
            window.crypto.getRandomValues(bytes);
            const suffix = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 30);
            return prefix + suffix;
        }

        mount() {
            super.mount();
            // Load transactions when component mounts
            this.loadTransactions();
        }
    }

    // Make available globally
    window.TransactionHistory = TransactionHistory;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.TransactionHistory = TransactionHistory;
    }

})(window);