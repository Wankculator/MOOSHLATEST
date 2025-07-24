# Component: Transaction History

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 3094-3150 (fetchTransactionHistory)
- `/public/js/moosh-wallet.js` - Lines 20267-20500 (TransactionHistoryModal)
- `/public/js/moosh-wallet.js` - Lines 9381-9450, 12276-12340, 14425-14490 (createTransactionHistory)

## Overview
The Transaction History system provides a comprehensive view of all Bitcoin and Spark Protocol transactions, with real-time updates, filtering capabilities, and detailed transaction information.

## Component Architecture

### Main Components
1. **TransactionHistoryModal** - Full transaction list modal
2. **Transaction List Widget** - Dashboard transaction preview
3. **Transaction Details View** - Expandable transaction information

## Implementation Details

### API Integration
```javascript
async fetchTransactionHistory(address, limit = 10) {
    // Lines 3094-3150
    try {
        const response = await this.apiService.request(`/api/bitcoin/transactions/${address}?limit=${limit}`);
        
        if (response.success) {
            // Process and format transactions
            const transactions = response.data.map(tx => ({
                id: tx.txid,
                type: tx.value > 0 ? 'receive' : 'send',
                amount: Math.abs(tx.value),
                fee: tx.fee || 0,
                timestamp: tx.time,
                confirmations: tx.confirmations,
                status: tx.confirmations > 0 ? 'confirmed' : 'pending'
            }));
            
            return transactions;
        }
    } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        return [];
    }
}
```

### Transaction List Creation
```javascript
createTransactionHistory() {
    // Lines 9381-9450
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({
        className: 'transaction-history-widget',
        style: {
            marginTop: 'calc(24px * var(--scale-factor))',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: 'calc(16px * var(--scale-factor))'
        }
    }, [
        this.createTransactionHeader(),
        this.createTransactionList(),
        this.createViewAllButton()
    ]);
}
```

## Visual Specifications

### Transaction Item Layout
```css
.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background 0.2s;
}

.transaction-item:hover {
    background: rgba(105, 253, 151, 0.05);
}

.transaction-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.transaction-icon.send {
    background: rgba(233, 69, 96, 0.1);
    color: #E94560;
}

.transaction-icon.receive {
    background: rgba(105, 253, 151, 0.1);
    color: #69FD97;
}
```

## DOM Structure
```html
<div class="transaction-history-modal">
    <div class="modal-header">
        <h2>Transaction History</h2>
        <button class="close-btn">×</button>
    </div>
    
    <div class="transaction-filters">
        <select class="filter-type">
            <option value="all">All Transactions</option>
            <option value="send">Sent</option>
            <option value="receive">Received</option>
        </select>
        <input type="date" class="filter-date-from">
        <input type="date" class="filter-date-to">
    </div>
    
    <div class="transaction-list">
        <div class="transaction-item">
            <div class="transaction-icon receive">↓</div>
            <div class="transaction-details">
                <div class="transaction-type">Received</div>
                <div class="transaction-time">2 hours ago</div>
            </div>
            <div class="transaction-amount">
                <div class="amount-btc">+0.00123 BTC</div>
                <div class="amount-usd">$53.21</div>
            </div>
        </div>
    </div>
</div>
```

## Transaction Data Structure
```javascript
{
    id: 'txid123...',
    type: 'send' | 'receive',
    amount: 0.00123, // in BTC
    fee: 0.00001,
    timestamp: 1627384920,
    confirmations: 6,
    status: 'confirmed' | 'pending',
    address: 'bc1q...',
    memo: 'Payment for services',
    network: 'bitcoin' | 'spark'
}
```

## Event Handlers

### Transaction Click
```javascript
handleTransactionClick(transaction) {
    // Expand to show full details
    const details = this.createTransactionDetails(transaction);
    this.showTransactionDetails(details);
}
```

### Filter Change
```javascript
handleFilterChange(filterType, dateFrom, dateTo) {
    const filtered = this.transactions.filter(tx => {
        if (filterType !== 'all' && tx.type !== filterType) return false;
        if (dateFrom && tx.timestamp < dateFrom) return false;
        if (dateTo && tx.timestamp > dateTo) return false;
        return true;
    });
    
    this.renderTransactionList(filtered);
}
```

## Real-time Updates
```javascript
// WebSocket connection for real-time updates
subscribeToTransactionUpdates() {
    this.ws = new WebSocket('wss://api.mooshwallet.com/transactions');
    
    this.ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        if (update.address === this.currentAddress) {
            this.addNewTransaction(update.transaction);
            this.updateBalances();
        }
    };
}
```

## Performance Optimizations

### Pagination
```javascript
loadMoreTransactions() {
    const offset = this.transactions.length;
    const limit = 20;
    
    this.fetchTransactionHistory(this.address, limit, offset)
        .then(newTransactions => {
            this.transactions.push(...newTransactions);
            this.renderNewTransactions(newTransactions);
        });
}
```

### Virtual Scrolling
- Implements virtual scrolling for lists > 100 items
- Only renders visible transactions + buffer
- Smooth scrolling with 60fps target

## API Endpoints
- `GET /api/bitcoin/transactions/:address` - Fetch transaction history
- `GET /api/spark/transactions/:address` - Fetch Spark transactions
- `WS /api/transactions/subscribe` - Real-time updates

## State Management
- Transactions cached in `app.state.transactions`
- Filters stored in component state
- Updates trigger balance recalculation

## Testing
```bash
# Test transaction fetching
npm run test:transactions

# Test filtering logic
npm run test:transaction-filters

# Test real-time updates
npm run test:websocket-transactions
```

## Known Issues
1. Large transaction histories (>1000) can slow initial load
2. WebSocket reconnection needs improvement
3. Date filtering doesn't account for timezones properly

## Git Recovery Commands
```bash
# Restore transaction history functionality
git checkout 1981e5a -- public/js/moosh-wallet.js

# View transaction history implementation
git log -p --grep="transaction.*history" -- public/js/moosh-wallet.js

# Restore API endpoints
git checkout 0f92f5d -- src/server/api-server.js
```

## Related Components
- [Dashboard](../pages/DashboardPage.md)
- [Send Modal](../modals/SendModal.md)
- [Receive Modal](../modals/ReceiveModal.md)
- [Balance Display](./BalanceDisplay.md)