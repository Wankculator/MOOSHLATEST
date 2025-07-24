# UI Section: Transaction List

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 20360-20500 (createTransactionList)
- `/public/js/moosh-wallet.js` - Lines 9381-9450 (Transaction history widget)

## Overview
The Transaction List displays wallet transactions in a clean, scannable format with real-time updates, status indicators, and expandable details. It supports both Bitcoin and Spark Protocol transactions.

## Component Architecture

### Implementation
```javascript
createTransactionList() {
    const $ = window.ElementFactory || ElementFactory;
    const transactions = this.getRecentTransactions();
    
    return $.div({
        className: 'transaction-list',
        style: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px'
        }
    }, [
        this.createListHeader(),
        this.createTransactionItems(transactions),
        transactions.length === 0 && this.createEmptyState(),
        transactions.length > 5 && this.createViewAllButton()
    ]);
}
```

## Visual Specifications

### List Container
```css
.transaction-list {
    max-height: 400px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--text-dim) var(--bg-primary);
}

.transaction-list::-webkit-scrollbar {
    width: 8px;
}

.transaction-list::-webkit-scrollbar-thumb {
    background: var(--text-dim);
    border-radius: 4px;
}

.transaction-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
}

.transaction-count {
    font-size: 12px;
    color: var(--text-dim);
}
```

### Transaction Item
```css
.transaction-item {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;
}

.transaction-item:hover {
    background: rgba(105, 253, 151, 0.05);
    padding-left: 8px;
    margin-left: -8px;
    margin-right: -8px;
    padding-right: 8px;
}

.transaction-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}

.transaction-icon.send {
    background: rgba(233, 69, 96, 0.15);
    color: #E94560;
}

.transaction-icon.receive {
    background: rgba(105, 253, 151, 0.15);
    color: #69FD97;
}

.transaction-icon.pending {
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
```

## DOM Structure
```html
<div class="transaction-list">
    <div class="transaction-list-header">
        <h3>Recent Transactions</h3>
        <span class="transaction-count">Showing 5 of 23</span>
    </div>
    
    <div class="transaction-items">
        <div class="transaction-item" data-txid="abc123...">
            <div class="transaction-icon receive">
                <span>↓</span>
            </div>
            
            <div class="transaction-details">
                <div class="transaction-type">Received</div>
                <div class="transaction-meta">
                    <span class="transaction-time">2 hours ago</span>
                    <span class="transaction-confirmations">6 confirmations</span>
                </div>
            </div>
            
            <div class="transaction-amount">
                <div class="amount-btc positive">+0.00123456 BTC</div>
                <div class="amount-usd">$53.45</div>
            </div>
        </div>
        
        <!-- More transaction items -->
    </div>
    
    <button class="view-all-transactions">
        View All Transactions →
    </button>
</div>
```

## Implementation Details

### Transaction Item Creation
```javascript
createTransactionItem(tx) {
    const $ = window.ElementFactory || ElementFactory;
    const isReceive = tx.type === 'receive';
    const timeAgo = this.getTimeAgo(tx.timestamp);
    
    return $.div({
        className: `transaction-item ${tx.status === 'pending' ? 'pending' : ''}`,
        'data-txid': tx.id,
        onclick: () => this.showTransactionDetails(tx)
    }, [
        // Icon
        $.div({
            className: `transaction-icon ${tx.type} ${tx.status}`,
        }, [isReceive ? '↓' : '↑']),
        
        // Details
        $.div({ className: 'transaction-details' }, [
            $.div({ className: 'transaction-type' }, [
                isReceive ? 'Received' : 'Sent'
            ]),
            $.div({ className: 'transaction-meta' }, [
                $.span({ className: 'transaction-time' }, [timeAgo]),
                tx.confirmations > 0 && $.span({ 
                    className: 'transaction-confirmations' 
                }, [`${tx.confirmations} confirmations`])
            ])
        ]),
        
        // Amount
        $.div({ className: 'transaction-amount' }, [
            $.div({ 
                className: `amount-btc ${isReceive ? 'positive' : 'negative'}` 
            }, [
                `${isReceive ? '+' : '-'}${this.formatBtc(tx.amount)} BTC`
            ]),
            $.div({ className: 'amount-usd' }, [
                this.formatUsd(tx.amount * this.btcPrice)
            ])
        ])
    ]);
}
```

### Time Formatting
```javascript
getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return new Date(timestamp).toLocaleDateString();
}
```

### Empty State
```javascript
createEmptyState() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({
        className: 'transaction-empty-state',
        style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-dim)'
        }
    }, [
        $.div({ style: { fontSize: '48px', marginBottom: '16px' } }, ['📭']),
        $.p({}, ['No transactions yet']),
        $.p({ style: { fontSize: '14px' } }, [
            'Your transactions will appear here once you send or receive Bitcoin.'
        ])
    ]);
}
```

## Real-time Updates

### Transaction Monitoring
```javascript
monitorTransactions() {
    // Poll for new transactions
    this.transactionPoller = setInterval(async () => {
        const latestTx = await this.fetchLatestTransaction();
        
        if (latestTx && !this.transactionIds.has(latestTx.id)) {
            this.addNewTransaction(latestTx);
            this.showNotification('New transaction received!');
        }
    }, 10000); // Check every 10 seconds
}

addNewTransaction(tx) {
    const item = this.createTransactionItem(tx);
    const container = document.querySelector('.transaction-items');
    
    // Add with animation
    item.style.opacity = '0';
    item.style.transform = 'translateY(-20px)';
    container.insertBefore(item, container.firstChild);
    
    requestAnimationFrame(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    });
    
    this.transactionIds.add(tx.id);
}
```

## Filtering and Sorting

### Filter Implementation
```javascript
filterTransactions(type = 'all', dateRange = null) {
    let filtered = [...this.transactions];
    
    // Type filter
    if (type !== 'all') {
        filtered = filtered.filter(tx => tx.type === type);
    }
    
    // Date range filter
    if (dateRange) {
        filtered = filtered.filter(tx => 
            tx.timestamp >= dateRange.start && 
            tx.timestamp <= dateRange.end
        );
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    this.renderTransactionItems(filtered);
}
```

## Performance Optimizations

### Virtual Scrolling
```javascript
implementVirtualScrolling() {
    const itemHeight = 72; // Height of each transaction item
    const containerHeight = 400;
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const buffer = 5; // Extra items to render
    
    this.virtualScroller = new VirtualScroller({
        items: this.transactions,
        itemHeight: itemHeight,
        containerHeight: containerHeight,
        renderItem: (tx) => this.createTransactionItem(tx),
        buffer: buffer
    });
}
```

## Accessibility
- Keyboard navigation between items
- Screen reader announcements for updates
- High contrast mode support
- Focus indicators

## Testing
```bash
# Test transaction rendering
npm run test:ui:transaction-list

# Test real-time updates
npm run test:ui:transaction-updates

# Test filtering
npm run test:ui:transaction-filter
```

## Known Issues
1. Scroll position lost on update
2. Time ago doesn't auto-update
3. Large transaction lists can lag

## Git Recovery Commands
```bash
# Restore transaction list
git checkout 1981e5a -- public/js/moosh-wallet.js

# View implementation history
git log -p --grep="transaction.*list" -- public/js/moosh-wallet.js
```

## Related Components
- [Transaction History](../features/TransactionHistory.md)
- [Transaction History Modal](../modals/TransactionHistoryModal.md)
- [Dashboard Page](../pages/DashboardPage.md)
- [Send Modal](../modals/SendModal.md)