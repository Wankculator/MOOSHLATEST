# WalletDetailsPage

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 9022-9387)

## Overview
The WalletDetailsPage provides a comprehensive view of a single wallet, displaying balance, transaction history, addresses, and wallet management options. It serves as the main dashboard for interacting with an individual wallet.

## Class Definition

```javascript
class WalletDetailsPage extends Component {
    constructor(app) {
        super(app);
        this.wallet = null;
        this.activeTab = 'overview';
        this.refreshInterval = null;
    }
}
```

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `app` | MOOSHWalletApp | Main application instance |
| `wallet` | Object | Current wallet data |
| `activeTab` | String | Currently active tab |
| `refreshInterval` | Number | Auto-refresh timer ID |

## Core Methods

### `render()`
Main render method that creates the wallet details interface.

```javascript
render() {
    const walletId = this.app.router.params.id || this.app.walletManager.activeWalletId;
    this.wallet = this.app.walletManager.getWallet(walletId);
    
    if (!this.wallet) {
        this.app.router.navigate('/dashboard');
        return $.div();
    }
    
    const container = $.div({ className: 'wallet-details-container' }, [
        this.createHeader(),
        this.createBalanceCard(),
        this.createTabNavigation(),
        this.createTabContent(),
        this.createQuickActions()
    ]);
    
    // Start auto-refresh
    this.startAutoRefresh();
    
    return container;
}
```

### `createHeader()`
Creates the page header with wallet name and options.

```javascript
createHeader() {
    return $.div({
        className: 'wallet-header',
        style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'calc(24px * var(--scale-factor))',
            padding: 'calc(20px * var(--scale-factor))',
            background: 'var(--bg-secondary)',
            borderRadius: 'calc(12px * var(--scale-factor))',
            border: '1px solid var(--border-color)'
        }
    }, [
        $.div({
            style: { display: 'flex', alignItems: 'center', gap: '16px' }
        }, [
            // Wallet icon/color
            $.div({
                style: {
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: this.wallet.color || 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'var(--bg-primary)',
                    fontWeight: '600'
                }
            }, [this.wallet.name.charAt(0).toUpperCase()]),
            
            // Wallet info
            $.div({}, [
                $.h2({
                    style: {
                        margin: 0,
                        fontSize: 'calc(24px * var(--scale-factor))',
                        color: 'var(--text-primary)'
                    }
                }, [this.wallet.name]),
                
                $.p({
                    style: {
                        margin: '4px 0 0 0',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        color: 'var(--text-dim)'
                    }
                }, [`Created ${this.formatDate(this.wallet.createdAt)}`])
            ])
        ]),
        
        // Options menu
        this.createOptionsMenu()
    ]);
}
```

### `createBalanceCard()`
Creates the main balance display card.

```javascript
createBalanceCard() {
    const { balance = {} } = this.wallet;
    const totalBalance = (balance.confirmed || 0) + (balance.unconfirmed || 0);
    
    return $.div({
        className: 'balance-card',
        style: {
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            borderRadius: 'calc(16px * var(--scale-factor))',
            padding: 'calc(32px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
        }
    }, [
        // Background pattern
        $.div({
            style: {
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'var(--text-primary)',
                opacity: 0.05,
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
            }
        }),
        
        // Balance content
        $.div({
            style: { position: 'relative', zIndex: 1 }
        }, [
            $.div({
                style: {
                    fontSize: 'calc(14px * var(--scale-factor))',
                    color: 'var(--text-dim)',
                    marginBottom: 'calc(8px * var(--scale-factor))'
                }
            }, ['Total Balance']),
            
            $.div({
                style: {
                    fontSize: 'calc(42px * var(--scale-factor))',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: 'calc(8px * var(--scale-factor))',
                    lineHeight: 1
                }
            }, [this.formatBitcoin(totalBalance)]),
            
            $.div({
                style: {
                    fontSize: 'calc(18px * var(--scale-factor))',
                    color: 'var(--text-secondary)',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [`≈ ${this.formatUSD(totalBalance)} USD`]),
            
            // Balance breakdown
            this.createBalanceBreakdown(balance)
        ])
    ]);
}
```

### `createTabNavigation()`
Creates the tab navigation bar.

```javascript
createTabNavigation() {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'transactions', label: 'Transactions', icon: '💸' },
        { id: 'addresses', label: 'Addresses', icon: '📍' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    return $.div({
        className: 'tab-navigation',
        style: {
            display: 'flex',
            gap: 'calc(4px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            background: 'var(--bg-secondary)',
            padding: 'calc(4px * var(--scale-factor))',
            borderRadius: 'calc(12px * var(--scale-factor))',
            border: '1px solid var(--border-color)'
        }
    }, tabs.map(tab => 
        $.button({
            className: `tab-button ${this.activeTab === tab.id ? 'active' : ''}`,
            onclick: () => this.switchTab(tab.id),
            style: {
                flex: 1,
                padding: 'calc(12px * var(--scale-factor))',
                background: this.activeTab === tab.id ? 'var(--accent-bg)' : 'transparent',
                border: this.activeTab === tab.id ? '1px solid var(--border-active)' : 'none',
                borderRadius: 'calc(8px * var(--scale-factor))',
                color: this.activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 'calc(14px * var(--scale-factor))',
                fontWeight: this.activeTab === tab.id ? '500' : '400'
            }
        }, [`${tab.icon} ${tab.label}`])
    ));
}
```

### `createTabContent()`
Creates content based on active tab.

```javascript
createTabContent() {
    const content = $.div({
        className: 'tab-content',
        style: {
            minHeight: 'calc(300px * var(--scale-factor))'
        }
    });
    
    switch (this.activeTab) {
        case 'overview':
            content.appendChild(this.createOverviewTab());
            break;
        case 'transactions':
            content.appendChild(this.createTransactionsTab());
            break;
        case 'addresses':
            content.appendChild(this.createAddressesTab());
            break;
        case 'settings':
            content.appendChild(this.createSettingsTab());
            break;
    }
    
    return content;
}
```

### `createOverviewTab()`
Creates the overview tab content.

```javascript
createOverviewTab() {
    return $.div({
        className: 'overview-tab'
    }, [
        // Recent activity
        this.createRecentActivity(),
        
        // Statistics grid
        this.createStatisticsGrid(),
        
        // Price chart (if available)
        this.createPriceChart()
    ]);
}
```

### `createTransactionsTab()`
Creates the transactions tab with full history.

```javascript
createTransactionsTab() {
    const transactions = this.wallet.transactions || [];
    
    return $.div({
        className: 'transactions-tab'
    }, [
        // Filter controls
        this.createTransactionFilters(),
        
        // Transaction list
        $.div({
            className: 'transaction-list',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 'calc(12px * var(--scale-factor))'
            }
        }, transactions.length > 0 ?
            transactions.map(tx => this.createTransactionItem(tx)) :
            this.createEmptyState('No transactions yet')
        ),
        
        // Load more button
        transactions.length >= 20 ? this.createLoadMoreButton() : null
    ]);
}
```

### `createAddressesTab()`
Creates the addresses tab showing all wallet addresses.

```javascript
createAddressesTab() {
    const addresses = this.wallet.addresses || [];
    
    return $.div({
        className: 'addresses-tab'
    }, [
        // Address type filter
        this.createAddressTypeFilter(),
        
        // Address list
        $.div({
            className: 'address-list',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 'calc(16px * var(--scale-factor))'
            }
        }, [
            this.createAddressSection('Receiving Addresses', addresses.receiving),
            this.createAddressSection('Change Addresses', addresses.change),
            this.wallet.sparkAddress ? 
                this.createAddressSection('Spark Addresses', [this.wallet.sparkAddress]) : 
                null
        ]),
        
        // Generate new address button
        this.createNewAddressButton()
    ]);
}
```

### `createTransactionItem(tx)`
Creates a single transaction item display.

```javascript
createTransactionItem(tx) {
    const isIncoming = tx.type === 'receive';
    const amount = tx.amount;
    
    return $.div({
        className: 'transaction-item',
        onclick: () => this.showTransactionDetails(tx),
        style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'calc(16px * var(--scale-factor))',
            background: 'var(--bg-secondary)',
            borderRadius: 'calc(8px * var(--scale-factor))',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }
    }, [
        // Left side - transaction info
        $.div({
            style: { display: 'flex', alignItems: 'center', gap: '12px' }
        }, [
            // Direction icon
            $.div({
                style: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isIncoming ? '#4CAF5020' : '#F4433620',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                }
            }, [isIncoming ? '↓' : '↑']),
            
            // Transaction details
            $.div({}, [
                $.div({
                    style: {
                        fontSize: 'calc(16px * var(--scale-factor))',
                        fontWeight: '500',
                        color: 'var(--text-secondary)'
                    }
                }, [isIncoming ? 'Received' : 'Sent']),
                
                $.div({
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        color: 'var(--text-dim)'
                    }
                }, [this.formatDate(tx.timestamp)])
            ])
        ]),
        
        // Right side - amount and status
        $.div({
            style: { textAlign: 'right' }
        }, [
            $.div({
                style: {
                    fontSize: 'calc(16px * var(--scale-factor))',
                    fontWeight: '600',
                    color: isIncoming ? '#4CAF50' : '#F44336'
                }
            }, [`${isIncoming ? '+' : '-'}${this.formatSatoshis(amount)} sats`]),
            
            $.div({
                style: {
                    fontSize: 'calc(12px * var(--scale-factor))',
                    color: tx.confirmations > 0 ? '#4CAF50' : '#FFA500',
                    marginTop: '4px'
                }
            }, [tx.confirmations > 0 ? `${tx.confirmations} confirmations` : 'Pending'])
        ])
    ]);
}
```

### `createQuickActions()`
Creates quick action buttons.

```javascript
createQuickActions() {
    return $.div({
        className: 'quick-actions',
        style: {
            position: 'fixed',
            bottom: 'calc(24px * var(--scale-factor))',
            right: 'calc(24px * var(--scale-factor))',
            display: 'flex',
            gap: 'calc(12px * var(--scale-factor))'
        }
    }, [
        this.createActionButton('Send', '↑', () => this.showSendModal()),
        this.createActionButton('Receive', '↓', () => this.showReceiveModal())
    ]);
}
```

## Event Handlers

### `switchTab(tabId)`
Switches between tabs.

```javascript
switchTab(tabId) {
    this.activeTab = tabId;
    
    // Re-render tab navigation and content
    const container = document.querySelector('.wallet-details-container');
    if (container) {
        // Update only tab content to avoid full re-render
        const tabContent = container.querySelector('.tab-content');
        const newContent = this.createTabContent();
        tabContent.replaceWith(newContent);
        
        // Update tab buttons
        const tabButtons = container.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabId));
        });
    }
    
    // Save preference
    localStorage.setItem('walletDetailsActiveTab', tabId);
}
```

### `startAutoRefresh()`
Starts automatic data refresh.

```javascript
startAutoRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
    }
    
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
        this.refreshWalletData();
    }, 30000);
    
    // Initial refresh
    this.refreshWalletData();
}

async refreshWalletData() {
    try {
        // Update balance
        const newBalance = await this.app.apiService.getBalance(this.wallet.address);
        this.wallet.balance = newBalance;
        
        // Update transactions
        const newTxs = await this.app.apiService.getTransactions(this.wallet.address);
        this.wallet.transactions = newTxs;
        
        // Update UI if still on same wallet
        if (this.wallet.id === this.app.walletManager.activeWalletId) {
            this.updateBalanceDisplay();
            if (this.activeTab === 'transactions') {
                this.updateTransactionList();
            }
        }
    } catch (error) {
        console.error('[WalletDetailsPage] Refresh error:', error);
    }
}
```

## Common Issues

### Issue: Tab Content Not Updating
**Problem**: Tab content doesn't refresh when switching
**Solution**: 
```javascript
// Force complete re-render of tab content
forceTabUpdate(tabId) {
    this.activeTab = tabId;
    
    // Remove old content
    const oldContent = document.querySelector('.tab-content');
    if (oldContent) {
        oldContent.remove();
    }
    
    // Insert new content
    const tabNav = document.querySelector('.tab-navigation');
    if (tabNav) {
        tabNav.insertAdjacentElement('afterend', this.createTabContent());
    }
}
```

### Issue: Memory Leaks from Intervals
**Problem**: Refresh intervals not cleared properly
**Solution**:
```javascript
// Implement proper cleanup
cleanup() {
    if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Clear references
    this.wallet = null;
}

// Call cleanup when leaving page
componentWillUnmount() {
    this.cleanup();
}
```

## Testing Approaches

### Unit Testing
```javascript
describe('WalletDetailsPage', () => {
    let app, page;
    
    beforeEach(() => {
        app = new MOOSHWalletApp();
        app.walletManager.wallets = [{
            id: 'test-wallet',
            name: 'Test Wallet',
            balance: { confirmed: 100000, unconfirmed: 5000 },
            transactions: []
        }];
        
        page = new WalletDetailsPage(app);
    });
    
    test('should display wallet information', () => {
        const element = page.render();
        expect(element.textContent).toContain('Test Wallet');
        expect(element.textContent).toContain('105,000');
    });
    
    test('should switch tabs correctly', () => {
        page.render();
        page.switchTab('transactions');
        expect(page.activeTab).toBe('transactions');
    });
    
    test('should format transaction items correctly', () => {
        const tx = {
            type: 'receive',
            amount: 50000,
            timestamp: Date.now(),
            confirmations: 6
        };
        
        const item = page.createTransactionItem(tx);
        expect(item.textContent).toContain('+50,000 sats');
        expect(item.textContent).toContain('6 confirmations');
    });
});
```

## Best Practices

1. **Always cleanup intervals** when leaving page
2. **Debounce refresh calls** to prevent API spam
3. **Show loading states** during data updates
4. **Cache tab content** for better performance
5. **Implement error boundaries** for failed updates

## Performance Optimization

```javascript
// Virtualize long transaction lists
createVirtualizedTransactionList(transactions) {
    const ITEMS_PER_PAGE = 20;
    const container = $.div({ className: 'virtualized-list' });
    
    // Only render visible items
    const visibleItems = transactions.slice(0, ITEMS_PER_PAGE);
    visibleItems.forEach(tx => {
        container.appendChild(this.createTransactionItem(tx));
    });
    
    // Add intersection observer for infinite scroll
    if (transactions.length > ITEMS_PER_PAGE) {
        const loader = $.div({ className: 'list-loader' });
        container.appendChild(loader);
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.loadMoreTransactions();
            }
        });
        
        observer.observe(loader);
    }
    
    return container;
}
```

## Related Components

- [WalletManager](../core/WalletManager.md) - Wallet data management
- [TransactionList](./TransactionList.md) - Transaction display
- [AddressManager](./AddressManager.md) - Address generation
- [SendModal](../modals/SendModal.md) - Send functionality
- [ReceiveModal](../modals/ReceiveModal.md) - Receive functionality