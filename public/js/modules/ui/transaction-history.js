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
            this.showFilters = false;
            this.filterOptions = {
                type: 'all', // all, sent, received
                dateRange: 'all', // all, today, week, month, custom
                amountRange: 'all', // all, small, medium, large, custom
                customDateFrom: null,
                customDateTo: null,
                customAmountMin: null,
                customAmountMax: null,
                searchText: ''
            };
            
            // Blockchain explorer preferences
            this.explorerPreference = localStorage.getItem('explorerPreference') || 'mempool';
            this.explorers = {
                mempool: {
                    name: 'Mempool.space',
                    url: 'https://mempool.space/tx/',
                    addressUrl: 'https://mempool.space/address/'
                },
                blockstream: {
                    name: 'Blockstream.info',
                    url: 'https://blockstream.info/tx/',
                    addressUrl: 'https://blockstream.info/address/'
                },
                blockchain: {
                    name: 'Blockchain.com',
                    url: 'https://www.blockchain.com/btc/tx/',
                    addressUrl: 'https://www.blockchain.com/btc/address/'
                },
                btc: {
                    name: 'BTC.com',
                    url: 'https://btc.com/btc/transaction/',
                    addressUrl: 'https://btc.com/btc/address/'
                }
            };
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
                    }, [
                        'Recent Transactions',
                        this.hasActiveFilters() && ` (${this.getFilteredTransactions().length}/${this.transactions.length})`
                    ]),
                    $.div({ 
                        style: { 
                            display: 'flex', 
                            gap: 'calc(8px * var(--scale-factor))',
                            alignItems: 'center'
                        } 
                    }, [
                        // Explorer selector
                        $.select({
                            style: {
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-dim)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(11px * var(--scale-factor))',
                                padding: 'calc(4px * var(--scale-factor))',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            value: this.explorerPreference,
                            onchange: (e) => {
                                this.explorerPreference = e.target.value;
                                localStorage.setItem('explorerPreference', e.target.value);
                                this.app.showNotification(`Explorer changed to ${this.explorers[e.target.value].name}`, 'success');
                            },
                            onmouseover: function() {
                                this.style.borderColor = 'var(--text-primary)';
                                this.style.color = 'var(--text-primary)';
                            },
                            onmouseout: function() {
                                this.style.borderColor = 'var(--border-color)';
                                this.style.color = 'var(--text-dim)';
                            }
                        }, Object.entries(this.explorers).map(([key, explorer]) => 
                            $.option({ value: key }, [explorer.name])
                        )),
                        $.button({
                            style: {
                                background: this.showFilters ? 'var(--text-primary)' : 'transparent',
                                border: '1px solid var(--border-color)',
                                color: this.showFilters ? 'var(--bg-primary)' : 'var(--text-dim)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(12px * var(--scale-factor))',
                                padding: 'calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            onclick: () => this.toggleFilters(),
                            onmouseover: function() {
                                this.style.borderColor = 'var(--text-primary)';
                                this.style.color = this.showFilters ? 'var(--bg-primary)' : 'var(--text-primary)';
                            },
                            onmouseout: function() {
                                this.style.borderColor = 'var(--border-color)';
                                this.style.color = this.showFilters ? 'var(--bg-primary)' : 'var(--text-dim)';
                            }
                        }, ['Filter ' + (this.hasActiveFilters() ? '●' : '')])])
                ]),
                
                // Filter panel
                this.showFilters && this.createFilterPanel(),
                
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
                    const hint = this.querySelector('.explorer-hint');
                    if (hint) hint.style.opacity = '1';
                },
                onmouseout: function() {
                    this.style.background = 'transparent';
                    const hint = this.querySelector('.explorer-hint');
                    if (hint) hint.style.opacity = '0';
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
                                fontFamily: "'JetBrains Mono', monospace",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'calc(8px * var(--scale-factor))'
                            }
                        }, [
                            this.truncateAddress(tx.address),
                            // Address explorer link
                            $.button({
                                style: {
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#f57315',
                                    cursor: 'pointer',
                                    padding: '0',
                                    fontSize: 'calc(11px * var(--scale-factor))',
                                    opacity: '0.7',
                                    transition: 'opacity 0.2s ease'
                                },
                                title: 'View address on explorer',
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.viewAddressDetails(tx.address);
                                },
                                onmouseover: function() {
                                    this.style.opacity = '1';
                                },
                                onmouseout: function() {
                                    this.style.opacity = '0.7';
                                }
                            }, ['[→]'])
                        ]),
                        // Transaction ID with copy button
                        $.div({ 
                            style: {
                                fontSize: 'calc(11px * var(--scale-factor))',
                                color: 'var(--text-dim)',
                                fontFamily: "'JetBrains Mono', monospace",
                                marginTop: 'calc(4px * var(--scale-factor))',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'calc(8px * var(--scale-factor))'
                            }
                        }, [
                            `TX: ${this.truncateAddress(tx.txid)}`,
                            // Copy transaction ID
                            $.button({
                                style: {
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#69fd97',
                                    cursor: 'pointer',
                                    padding: '0',
                                    fontSize: 'calc(11px * var(--scale-factor))',
                                    opacity: '0.7',
                                    transition: 'opacity 0.2s ease'
                                },
                                title: 'Copy transaction ID',
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.copyToClipboard(tx.txid);
                                },
                                onmouseover: function() {
                                    this.style.opacity = '1';
                                },
                                onmouseout: function() {
                                    this.style.opacity = '0.7';
                                }
                            }, ['[⧉]'])
                        ])
                    ])
                ]),
                
                // Right side - Amount and time
                $.div({ 
                    style: {
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'calc(4px * var(--scale-factor))'
                    }
                }, [
                    $.div({ 
                        style: {
                            fontSize: 'calc(14px * var(--scale-factor))',
                            color: typeColor,
                            fontWeight: '600'
                        }
                    }, [`${isSent ? '-' : '+'}${this.formatBitcoin(tx.amount)} BTC`]),
                    $.div({ 
                        style: {
                            fontSize: 'calc(11px * var(--scale-factor))',
                            color: 'var(--text-dim)'
                        }
                    }, [this.formatTime(tx.timestamp)]),
                    // Confirmations
                    $.div({ 
                        style: {
                            fontSize: 'calc(10px * var(--scale-factor))',
                            color: tx.confirmations >= 6 ? '#69fd97' : '#f57315'
                        }
                    }, [
                        tx.confirmations >= 6 
                            ? `✓ ${tx.confirmations} conf`
                            : `⏳ ${tx.confirmations || 0} conf`
                    ]),
                    // Explorer link hint
                    $.div({ 
                        style: {
                            fontSize: 'calc(10px * var(--scale-factor))',
                            color: '#f57315',
                            opacity: '0',
                            transition: 'opacity 0.2s ease',
                            marginTop: 'calc(4px * var(--scale-factor))'
                        },
                        className: 'explorer-hint'
                    }, ['View on explorer →'])
                ])
            ]);
        }

        getFilteredTransactions() {
            let filtered = [...this.transactions];
            
            // Type filter
            if (this.filterOptions.type !== 'all') {
                filtered = filtered.filter(tx => tx.type === this.filterOptions.type);
            }
            
            // Date range filter
            if (this.filterOptions.dateRange !== 'all') {
                const now = Date.now();
                const ranges = {
                    today: 86400000, // 24 hours
                    week: 604800000, // 7 days
                    month: 2592000000 // 30 days
                };
                
                if (this.filterOptions.dateRange === 'custom') {
                    if (this.filterOptions.customDateFrom) {
                        filtered = filtered.filter(tx => 
                            tx.timestamp >= new Date(this.filterOptions.customDateFrom).getTime()
                        );
                    }
                    if (this.filterOptions.customDateTo) {
                        filtered = filtered.filter(tx => 
                            tx.timestamp <= new Date(this.filterOptions.customDateTo).getTime()
                        );
                    }
                } else if (ranges[this.filterOptions.dateRange]) {
                    filtered = filtered.filter(tx => 
                        (now - tx.timestamp) <= ranges[this.filterOptions.dateRange]
                    );
                }
            }
            
            // Amount range filter
            if (this.filterOptions.amountRange !== 'all') {
                const ranges = {
                    small: { min: 0, max: 1000000 }, // < 0.01 BTC
                    medium: { min: 1000000, max: 10000000 }, // 0.01 - 0.1 BTC
                    large: { min: 10000000, max: Infinity } // > 0.1 BTC
                };
                
                if (this.filterOptions.amountRange === 'custom') {
                    if (this.filterOptions.customAmountMin !== null) {
                        filtered = filtered.filter(tx => 
                            tx.amount >= this.filterOptions.customAmountMin * 100000000
                        );
                    }
                    if (this.filterOptions.customAmountMax !== null) {
                        filtered = filtered.filter(tx => 
                            tx.amount <= this.filterOptions.customAmountMax * 100000000
                        );
                    }
                } else if (ranges[this.filterOptions.amountRange]) {
                    const range = ranges[this.filterOptions.amountRange];
                    filtered = filtered.filter(tx => 
                        tx.amount >= range.min && tx.amount <= range.max
                    );
                }
            }
            
            // Search text filter
            if (this.filterOptions.searchText) {
                const search = this.filterOptions.searchText.toLowerCase();
                filtered = filtered.filter(tx => 
                    tx.txid.toLowerCase().includes(search) ||
                    tx.address.toLowerCase().includes(search)
                );
            }
            
            return filtered;
        }


        viewTransactionDetails(tx) {
            // Open transaction details in selected block explorer
            const explorer = this.explorers[this.explorerPreference];
            const explorerUrl = `${explorer.url}${tx.txid}`;
            window.open(explorerUrl, '_blank');
        }
        
        viewAddressDetails(address) {
            // Open address details in selected block explorer
            const explorer = this.explorers[this.explorerPreference];
            const explorerUrl = `${explorer.addressUrl}${address}`;
            window.open(explorerUrl, '_blank');
        }
        
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.app.showNotification('Copied to clipboard', 'success');
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.app.showNotification('Failed to copy', 'error');
            });
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
                const currentAccount = this.app.state.get('currentAccount');
                if (!currentAccount || !currentAccount.addresses?.bitcoin) {
                    console.log('No current account or address');
                    return;
                }
                
                const address = currentAccount.addresses.bitcoin;
                
                // Load real transactions from API
                const response = await this.app.apiService.get(`/api/bitcoin/transactions/${address}`, {
                    limit: 20,
                    offset: 0
                });
                
                if (response.success && response.data) {
                    // Transform API data to our format
                    this.transactions = response.data.transactions.map(tx => ({
                        txid: tx.txid,
                        type: tx.type === 'receive' ? 'received' : 'sent',
                        address: tx.type === 'receive' ? tx.from[0] : tx.to[0],
                        amount: tx.amount,
                        timestamp: tx.timestamp,
                        confirmations: tx.confirmations,
                        fee: tx.fee,
                        status: tx.status
                    }));
                    
                    // Update account activity tracking
                    this.updateAccountActivity(currentAccount.id, this.transactions);
                    
                    console.log(`Loaded ${this.transactions.length} transactions`);
                } else {
                    // Fallback to mock data if API fails
                    console.warn('Failed to load transactions from API, using mock data');
                    this.transactions = this.generateMockTransactions();
                    // Update with mock data too
                    this.updateAccountActivity(currentAccount.id, this.transactions);
                }
                
                this.update();
            } catch (error) {
                console.error('Failed to load transactions:', error);
                // Fallback to mock data
                this.transactions = this.generateMockTransactions();
                this.update();
            }
        }
        
        updateAccountActivity(accountId, transactions) {
            if (!accountId || !transactions || transactions.length === 0) return;
            
            // Find the most recent transaction
            const mostRecentTx = transactions.reduce((latest, tx) => {
                return (!latest || tx.timestamp > latest.timestamp) ? tx : latest;
            }, null);
            
            if (mostRecentTx) {
                // Update account with activity data
                const accounts = this.app.state.get('accounts') || [];
                const account = accounts.find(acc => acc.id === accountId);
                
                if (account) {
                    account.lastActivity = mostRecentTx.timestamp;
                    account.transactionCount = transactions.length;
                    
                    // Update state
                    this.app.state.set('accounts', accounts);
                    
                    console.log(`[TransactionHistory] Updated activity for account ${accountId}: ${transactions.length} transactions, last activity: ${new Date(mostRecentTx.timestamp).toLocaleString()}`);
                }
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
        
        toggleFilters() {
            this.showFilters = !this.showFilters;
            this.update();
        }
        
        hasActiveFilters() {
            return this.filterOptions.type !== 'all' ||
                   this.filterOptions.dateRange !== 'all' ||
                   this.filterOptions.amountRange !== 'all' ||
                   this.filterOptions.searchText !== '';
        }
        
        createFilterPanel() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))',
                    marginBottom: 'calc(16px * var(--scale-factor))',
                    // Animation will be handled by transition on mount
                }
            }, [
                // Search bar
                $.div({
                    style: {
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.input({
                        type: 'text',
                        placeholder: 'Search by transaction ID or address...',
                        value: this.filterOptions.searchText,
                        style: {
                            width: '100%',
                            padding: 'calc(8px * var(--scale-factor))',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(12px * var(--scale-factor))'
                        },
                        oninput: (e) => {
                            this.filterOptions.searchText = e.target.value;
                            this.update();
                        }
                    })
                ]),
                
                // Filter controls grid
                $.div({
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    // Type filter
                    this.createFilterControl('Type', 'type', [
                        { value: 'all', label: 'All' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'received', label: 'Received' }
                    ]),
                    
                    // Date range filter
                    this.createFilterControl('Date', 'dateRange', [
                        { value: 'all', label: 'All Time' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'Last Week' },
                        { value: 'month', label: 'Last Month' },
                        { value: 'custom', label: 'Custom Range' }
                    ]),
                    
                    // Amount range filter
                    this.createFilterControl('Amount', 'amountRange', [
                        { value: 'all', label: 'Any Amount' },
                        { value: 'small', label: '< 0.01 BTC' },
                        { value: 'medium', label: '0.01 - 0.1 BTC' },
                        { value: 'large', label: '> 0.1 BTC' },
                        { value: 'custom', label: 'Custom Range' }
                    ])
                ]),
                
                // Custom date inputs (shown when date range is custom)
                this.filterOptions.dateRange === 'custom' && $.div({
                    style: {
                        marginTop: 'calc(16px * var(--scale-factor))',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.div({}, [
                        $.label({
                            style: {
                                display: 'block',
                                marginBottom: 'calc(4px * var(--scale-factor))',
                                fontSize: 'calc(11px * var(--scale-factor))',
                                color: 'var(--text-dim)'
                            }
                        }, ['From Date']),
                        $.input({
                            type: 'date',
                            value: this.filterOptions.customDateFrom || '',
                            style: {
                                width: '100%',
                                padding: 'calc(6px * var(--scale-factor))',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(12px * var(--scale-factor))'
                            },
                            onchange: (e) => {
                                this.filterOptions.customDateFrom = e.target.value;
                                this.update();
                            }
                        })
                    ]),
                    $.div({}, [
                        $.label({
                            style: {
                                display: 'block',
                                marginBottom: 'calc(4px * var(--scale-factor))',
                                fontSize: 'calc(11px * var(--scale-factor))',
                                color: 'var(--text-dim)'
                            }
                        }, ['To Date']),
                        $.input({
                            type: 'date',
                            value: this.filterOptions.customDateTo || '',
                            style: {
                                width: '100%',
                                padding: 'calc(6px * var(--scale-factor))',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(12px * var(--scale-factor))'
                            },
                            onchange: (e) => {
                                this.filterOptions.customDateTo = e.target.value;
                                this.update();
                            }
                        })
                    ])
                ]),
                
                // Custom amount inputs (shown when amount range is custom)
                this.filterOptions.amountRange === 'custom' && $.div({
                    style: {
                        marginTop: 'calc(16px * var(--scale-factor))',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.div({}, [
                        $.label({
                            style: {
                                display: 'block',
                                marginBottom: 'calc(4px * var(--scale-factor))',
                                fontSize: 'calc(11px * var(--scale-factor))',
                                color: 'var(--text-dim)'
                            }
                        }, ['Min Amount (BTC)']),
                        $.input({
                            type: 'number',
                            value: this.filterOptions.customAmountMin || '',
                            placeholder: '0.00',
                            step: '0.00000001',
                            style: {
                                width: '100%',
                                padding: 'calc(6px * var(--scale-factor))',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(12px * var(--scale-factor))'
                            },
                            onchange: (e) => {
                                this.filterOptions.customAmountMin = parseFloat(e.target.value) || null;
                                this.update();
                            }
                        })
                    ]),
                    $.div({}, [
                        $.label({
                            style: {
                                display: 'block',
                                marginBottom: 'calc(4px * var(--scale-factor))',
                                fontSize: 'calc(11px * var(--scale-factor))',
                                color: 'var(--text-dim)'
                            }
                        }, ['Max Amount (BTC)']),
                        $.input({
                            type: 'number',
                            value: this.filterOptions.customAmountMax || '',
                            placeholder: '0.00',
                            step: '0.00000001',
                            style: {
                                width: '100%',
                                padding: 'calc(6px * var(--scale-factor))',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'calc(12px * var(--scale-factor))'
                            },
                            onchange: (e) => {
                                this.filterOptions.customAmountMax = parseFloat(e.target.value) || null;
                                this.update();
                            }
                        })
                    ])
                ]),
                
                // Clear filters button
                this.hasActiveFilters() && $.div({
                    style: {
                        marginTop: 'calc(16px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, [
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-dim)',
                            color: 'var(--text-dim)',
                            padding: 'calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace",
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: function() {
                            this.style.borderColor = 'var(--text-primary)';
                            this.style.color = 'var(--text-primary)';
                        },
                        onmouseout: function() {
                            this.style.borderColor = 'var(--text-dim)';
                            this.style.color = 'var(--text-dim)';
                        },
                        onclick: () => this.clearFilters()
                    }, ['Clear All Filters'])
                ])
            ]);
        }
        
        createFilterControl(label, filterKey, options) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({}, [
                $.label({
                    style: {
                        display: 'block',
                        marginBottom: 'calc(4px * var(--scale-factor))',
                        fontSize: 'calc(11px * var(--scale-factor))',
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase'
                    }
                }, [label]),
                $.select({
                    style: {
                        width: '100%',
                        padding: 'calc(6px * var(--scale-factor))',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(12px * var(--scale-factor))',
                        cursor: 'pointer'
                    },
                    value: this.filterOptions[filterKey],
                    onchange: (e) => {
                        this.filterOptions[filterKey] = e.target.value;
                        this.update();
                    }
                }, options.map(opt => 
                    $.option({ value: opt.value }, [opt.label])
                ))
            ]);
        }
        
        clearFilters() {
            this.filterOptions = {
                type: 'all',
                dateRange: 'all',
                amountRange: 'all',
                customDateFrom: null,
                customDateTo: null,
                customAmountMin: null,
                customAmountMax: null,
                searchText: ''
            };
            this.update();
        }

        addTransaction(transaction) {
            // Add a new transaction to the list
            this.transactions.unshift(transaction);
            // Keep only the latest 20 transactions
            if (this.transactions.length > 20) {
                this.transactions = this.transactions.slice(0, 20);
            }
            this.update();
        }

        refreshTransactions() {
            // Refresh transaction list from API
            this.loadTransactions();
        }

        mount() {
            super.mount();
            // Load transactions when component mounts
            this.loadTransactions();
            
            // Set up refresh interval (every 30 seconds)
            this.refreshInterval = setInterval(() => {
                this.loadTransactions();
            }, 30000);
        }

        unmount() {
            // Clear refresh interval
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
            super.unmount();
        }
    }

    // Make available globally
    window.TransactionHistory = TransactionHistory;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.TransactionHistory = TransactionHistory;
    }

})(window);