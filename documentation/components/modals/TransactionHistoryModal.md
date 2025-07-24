# TransactionHistoryModal Documentation

## Overview
The TransactionHistoryModal displays a comprehensive list of all Bitcoin transactions for the current wallet, including sent, received, and pending transactions with filtering and export capabilities.

## Location in Codebase
- **File**: `/public/js/moosh-wallet.js`
- **Class Definition**: Lines 20236-20400 (approximately)
- **Triggers**: Lines 9936, 12830, 14979, 15740 (from various dashboard pages)
- **API Integration**: Uses `fetchTransactionHistory` method

## Component Structure

### Modal Container
```javascript
// Line 20236
class TransactionHistoryModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.transactions = [];
    }
}
```

### Modal Dimensions and Styling
- **Container Class**: `modal-container transaction-history-modal`
- **Width**: 800px maximum (90% on mobile)
- **Height**: 600px with scroll
- **Background**: `var(--bg-primary)`
- **Border**: 2px solid theme color
- **Overflow**: Vertical scroll for transaction list

## Modal Sections

### 1. Header Section
```javascript
$.div({ className: 'modal-header' }, [
    $.h2({ className: 'modal-title' }, [
        $.span({ className: 'text-dim' }, ['<']),
        ' Transaction History ',
        $.span({ className: 'text-dim' }, ['/>'])
    ]),
    $.button({
        className: 'modal-close',
        onclick: () => this.close()
    }, ['×'])
])
```

### 2. Filter Controls
Horizontal filter bar with:
- **Type Filter**: All, Sent, Received
- **Date Range**: Last 7/30/90 days, All time
- **Status**: All, Confirmed, Pending
- **Search**: Transaction ID or address

### 3. Summary Statistics
Quick stats bar showing:
- Total transactions
- Total received
- Total sent
- Net balance change

### 4. Transaction List
Scrollable list with each transaction showing:
- **Icon**: ↓ (received) or ↑ (sent)
- **Amount**: In BTC and USD equivalent
- **Date/Time**: Formatted timestamp
- **Status**: Confirmations count
- **Address**: Counterparty address (truncated)
- **Transaction ID**: Clickable to explorer

### 5. Transaction Item Structure
```javascript
$.div({ className: 'transaction-item' }, [
    $.div({ className: 'tx-icon' }, [icon]),
    $.div({ className: 'tx-details' }, [
        $.div({ className: 'tx-main' }, [
            $.span({ className: 'tx-amount' }, [amount]),
            $.span({ className: 'tx-address' }, [address])
        ]),
        $.div({ className: 'tx-meta' }, [
            $.span({ className: 'tx-date' }, [date]),
            $.span({ className: 'tx-status' }, [status])
        ])
    ]),
    $.div({ className: 'tx-actions' }, [
        $.button({ className: 'tx-details-btn' }, ['Details'])
    ])
])
```

### 6. Footer Actions
- **Export CSV**: Download transaction history
- **Load More**: Pagination for large histories
- **Close**: Dismiss modal

## Data Structure

### Transaction Object
```javascript
{
    txid: "abc123...",
    type: "sent" | "received",
    amount: 0.001,
    fee: 0.00001,
    timestamp: 1634567890,
    confirmations: 6,
    status: "confirmed" | "pending",
    addresses: {
        from: ["bc1q..."],
        to: ["bc1p..."]
    },
    block: {
        height: 700000,
        hash: "000000..."
    }
}
```

## API Calls

### 1. Fetch Transaction History
```javascript
async loadTransactions() {
    const currentAccount = this.app.state.getCurrentAccount();
    const addresses = [
        currentAccount.addresses.taproot,
        currentAccount.addresses.segwit,
        currentAccount.addresses.legacy
    ];
    
    for (const address of addresses) {
        const txs = await this.app.apiService.fetchTransactionHistory(address);
        this.transactions.push(...txs);
    }
    
    // Sort by timestamp
    this.transactions.sort((a, b) => b.timestamp - a.timestamp);
}
```

### 2. Transaction Details
```javascript
// Fetch full transaction details
const details = await this.app.apiService.getTransaction(txid);
```

### 3. Price History
```javascript
// Get historical BTC price for transaction date
const historicalPrice = await this.app.apiService.getHistoricalPrice(timestamp);
```

## Filtering and Sorting

### Filter Implementation
```javascript
filterTransactions() {
    let filtered = [...this.transactions];
    
    // Type filter
    if (this.filterType !== 'all') {
        filtered = filtered.filter(tx => tx.type === this.filterType);
    }
    
    // Date range filter
    if (this.dateRange !== 'all') {
        const cutoff = this.getDateCutoff(this.dateRange);
        filtered = filtered.filter(tx => tx.timestamp > cutoff);
    }
    
    // Status filter
    if (this.filterStatus !== 'all') {
        filtered = filtered.filter(tx => tx.status === this.filterStatus);
    }
    
    // Search filter
    if (this.searchQuery) {
        filtered = filtered.filter(tx => 
            tx.txid.includes(this.searchQuery) ||
            tx.addresses.from.some(addr => addr.includes(this.searchQuery)) ||
            tx.addresses.to.some(addr => addr.includes(this.searchQuery))
        );
    }
    
    return filtered;
}
```

### Sort Options
- Date (newest first) - Default
- Date (oldest first)
- Amount (high to low)
- Amount (low to high)

## State Management

### Modal State
- Current filters
- Sort order
- Page number (pagination)
- Selected transactions

### Updates
- Real-time updates for pending transactions
- Periodic refresh (every 30 seconds)
- Manual refresh button

## Styling Classes

### Container Classes
- `.transaction-history-modal` - Main modal
- `.tx-filters` - Filter controls
- `.tx-summary` - Statistics bar
- `.tx-list` - Scrollable list
- `.tx-empty` - Empty state

### Transaction Item Classes
- `.transaction-item` - Individual transaction
- `.tx-received` - Green theme
- `.tx-sent` - Red theme
- `.tx-pending` - Yellow theme
- `.tx-icon` - Direction arrow
- `.tx-amount` - Amount display
- `.tx-status` - Confirmation status

### Visual States
```css
.transaction-item:hover {
    background: var(--bg-hover);
    border-color: var(--border-active);
}

.tx-pending {
    opacity: 0.7;
    border-left: 3px solid #faa307;
}

.tx-confirmed {
    border-left: 3px solid #69fd97;
}
```

## Mobile Responsiveness
- Simplified layout on mobile
- Swipe to reveal actions
- Condensed information display
- Touch-friendly controls
- Responsive table/list switch

## Advanced Features

### 1. Transaction Details Modal
Click on transaction opens detailed view:
- Full transaction data
- Input/output breakdown
- Fee details
- Block information
- Raw transaction hex

### 2. Export Functionality
```javascript
exportToCSV() {
    const csv = this.convertToCSV(this.filteredTransactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${Date.now()}.csv`;
    a.click();
}
```

### 3. Pagination
- 50 transactions per page
- Infinite scroll option
- Jump to page
- Total count display

## Performance Optimization

### 1. Virtual Scrolling
For large transaction lists:
```javascript
// Only render visible items
const visibleRange = this.getVisibleRange();
const visibleTransactions = this.transactions.slice(
    visibleRange.start,
    visibleRange.end
);
```

### 2. Caching
- Cache transaction details
- Store historical prices
- Memoize filter results

### 3. Lazy Loading
- Load transactions on demand
- Progressive enhancement
- Background data fetching

## Error Handling
- "No transactions found" - Empty state
- "Failed to load transactions" - API error
- "Transaction not found" - Invalid TXID
- "Network error" - Connectivity issue

## Connected Components
- **ApiService**: Transaction data fetching
- **PriceService**: Historical prices
- **ExportService**: CSV generation
- **NotificationSystem**: Status updates

## Usage Example
```javascript
// From dashboard
handleFilter() {
    const modal = new TransactionHistoryModal(this.app);
    modal.show();
}
```

## Notes for Recreation
1. Implement efficient data fetching
2. Add proper pagination
3. Cache transaction data
4. Use virtual scrolling for performance
5. Include export functionality
6. Add real-time updates for pending TXs