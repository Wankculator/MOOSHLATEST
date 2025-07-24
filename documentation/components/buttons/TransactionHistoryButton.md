# Transaction History Button

## Overview
The Transaction History Button opens a detailed view of all wallet transactions, including sent, received, and pending transactions. It's accessible from the main dashboard.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 9262-9264, 11962-11967 (Dashboard buttons)

### Visual Specifications
- **Class**: `btn-secondary`
- **Background**: Black (`#000000`)
- **Border**: 2px solid `var(--border-active)`
- **Text Color**: `var(--text-primary)`
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px × scale factor
- **Width**: 100%
- **Padding**: 12px × scale factor

### Implementation

```javascript
$.button({
    className: 'btn-secondary',
    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
    onclick: () => this.showTransactionHistory(),
    onmouseover: function() { 
        this.style.background = 'var(--text-accent)'; 
        this.style.color = '#000000'; 
    },
    onmouseout: function() { 
        this.style.background = '#000000'; 
        this.style.color = 'var(--text-primary)'; 
    }
}, ['Transaction History'])
```

### Click Handler

```javascript
async showTransactionHistory() {
    // Show loading state
    this.showLoading('Loading transactions...');
    
    try {
        // Fetch all transactions
        const transactions = await this.fetchAllTransactions();
        
        // Create history modal
        const modal = new TransactionHistoryModal({
            transactions: transactions,
            currentAddress: this.currentAddress,
            onTransactionClick: (tx) => this.showTransactionDetails(tx),
            onRefresh: () => this.refreshTransactions()
        });
        
        // Hide loading and show modal
        this.hideLoading();
        modal.show();
        
    } catch (error) {
        console.error('Failed to load transactions:', error);
        this.hideLoading();
        this.showError('Failed to load transaction history');
    }
}
```

### Transaction Data Structure

```javascript
{
    txid: 'abc123...',
    type: 'sent' | 'received' | 'self',
    amount: '0.00100000', // BTC
    fee: '0.00000500',
    confirmations: 6,
    timestamp: 1634567890,
    inputs: [...],
    outputs: [...],
    status: 'confirmed' | 'pending' | 'failed',
    label: 'Payment to John', // optional
    note: 'Invoice #123' // optional
}
```

### History Modal Features

1. **Transaction List**
   ```javascript
   renderTransactionList(transactions) {
       return $.div({ className: 'tx-list' }, 
           transactions.map(tx => this.renderTransactionItem(tx))
       );
   }
   ```

2. **Transaction Item**
   ```javascript
   renderTransactionItem(tx) {
       return $.div({ 
           className: `tx-item ${tx.status}`,
           onclick: () => this.onTransactionClick(tx)
       }, [
           $.div({ className: 'tx-icon' }, [
               tx.type === 'sent' ? '↗' : '↘'
           ]),
           $.div({ className: 'tx-details' }, [
               $.div({ className: 'tx-amount' }, [
                   `${tx.type === 'sent' ? '-' : '+'} ${tx.amount} BTC`
               ]),
               $.div({ className: 'tx-time' }, [
                   this.formatTime(tx.timestamp)
               ])
           ]),
           $.div({ className: 'tx-status' }, [
               this.getStatusBadge(tx)
           ])
       ]);
   }
   ```

### Filtering and Sorting

```javascript
// Filter controls
const filters = {
    type: 'all' | 'sent' | 'received',
    status: 'all' | 'confirmed' | 'pending',
    dateRange: { from: Date, to: Date },
    minAmount: number,
    search: string
};

// Sort options
const sortOptions = {
    date: 'desc' | 'asc',
    amount: 'desc' | 'asc',
    status: 'confirmed_first' | 'pending_first'
};
```

### Transaction Details View

```javascript
showTransactionDetails(tx) {
    const details = new TransactionDetailsModal({
        transaction: tx,
        onAddLabel: (label) => this.addTransactionLabel(tx.txid, label),
        onViewInExplorer: () => this.openInBlockExplorer(tx.txid),
        onSpeedUp: () => this.speedUpTransaction(tx) // RBF
    });
    
    details.show();
}
```

### Features
1. **Real-time Updates**: WebSocket subscriptions
2. **Pagination**: Load more on scroll
3. **Export**: CSV/JSON export options
4. **Labels**: Custom transaction labeling
5. **Search**: By address, txid, label
6. **Analytics**: Spending patterns, charts

### Performance Optimization
```javascript
// Virtual scrolling for long lists
const visibleRange = this.calculateVisibleRange();
const visibleTransactions = transactions.slice(
    visibleRange.start,
    visibleRange.end
);

// Lazy loading
if (scrollPosition > threshold) {
    this.loadMoreTransactions();
}
```

### Mobile Optimizations
- Swipe gestures for actions
- Condensed view on small screens
- Touch-friendly transaction items
- Pull-to-refresh support

### Export Functionality
```javascript
exportTransactions(format) {
    const data = this.prepareExportData(this.transactions);
    
    switch(format) {
        case 'csv':
            this.downloadCSV(data);
            break;
        case 'json':
            this.downloadJSON(data);
            break;
        case 'pdf':
            this.generatePDF(data);
            break;
    }
}
```

### Related Components
- Transaction List Item
- Transaction Details Modal
- Transaction Filters
- Export Dialog
- Block Explorer Link