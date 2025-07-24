# Refresh Balance Button

## Overview
The Refresh Balance Button updates wallet balances and transaction history from the blockchain. It's located in the dashboard header and provides manual sync functionality.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 
  - 9031-9033 (Dashboard action bar)
  - 11736-11740 (Main dashboard)
  - 9094-9096 (Header buttons)

### Visual Specifications
- **Class**: `btn-secondary dashboard-btn`
- **Background**: Black (`#000000`)
- **Border**: 2px solid `var(--border-active)`
- **Text Color**: `var(--text-primary)`
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px × scale factor
- **Padding**: 8px 16px
- **Border Radius**: 0
- **Cursor**: Pointer

### Variations

#### Dashboard Action Bar Version
```javascript
$.button({
    className: 'btn-secondary dashboard-btn',
    onclick: () => this.handleRefresh()
}, ['Refresh'])
```

#### Header Button Version
```javascript
$.button({
    className: 'header-btn',
    title: 'Refresh',
    onclick: () => this.handleRefresh()
}, ['REFRESH'])
```

### Click Handler
The `handleRefresh()` function:
1. Shows loading spinner
2. Fetches latest balance from API
3. Updates transaction history
4. Refreshes exchange rates
5. Updates UI components
6. Shows success/error feedback

### Implementation

```javascript
async handleRefresh() {
    // Prevent multiple simultaneous refreshes
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    const btn = event.currentTarget;
    const originalText = btn.textContent;
    
    try {
        // Show loading state
        btn.textContent = 'Refreshing...';
        btn.disabled = true;
        
        // Fetch all data in parallel
        const [balance, transactions, rates] = await Promise.all([
            this.fetchBalance(),
            this.fetchTransactions(),
            this.fetchExchangeRates()
        ]);
        
        // Update state
        this.updateBalance(balance);
        this.updateTransactions(transactions);
        this.updateRates(rates);
        
        // Success feedback
        btn.textContent = 'Updated!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
        
    } catch (error) {
        console.error('Refresh failed:', error);
        btn.textContent = 'Failed';
        this.showToast('Failed to refresh data', 'error');
        
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
        
    } finally {
        btn.disabled = false;
        this.isRefreshing = false;
    }
}
```

### API Calls
- `/api/bitcoin/balance` - Get current balance
- `/api/bitcoin/transactions` - Fetch transaction history
- `/api/rates/btc-usd` - Get exchange rates
- `/api/bitcoin/utxos` - Update unspent outputs

### Loading States
1. **Idle**: Normal button appearance
2. **Loading**: "Refreshing..." text, disabled state
3. **Success**: "Updated!" with green accent
4. **Error**: "Failed" with red accent

### Refresh Scope
- Wallet balance (confirmed/unconfirmed)
- Transaction history
- UTXO set
- Exchange rates
- Fee estimates
- Network status

### Auto-Refresh
- WebSocket subscriptions for real-time updates
- Automatic refresh on network reconnection
- Periodic background sync (every 5 minutes)
- Manual refresh overrides auto-refresh timer

### Accessibility Features
- Loading state announcements
- Keyboard shortcut: `Ctrl+R` or `Cmd+R`
- Disabled state during refresh
- Clear status feedback

### Mobile Optimizations
- Pull-to-refresh gesture support
- Reduced text on small screens ("↻" icon)
- Touch feedback animations
- Network-aware refresh strategy

### Error Handling
- Network timeout (30 seconds)
- Retry logic with exponential backoff
- Partial update support
- Offline mode detection

### Performance
- Debounced to prevent rapid clicks
- Cached data with TTL
- Incremental updates when possible
- Background refresh queue

### Related Components
- Balance Display
- Transaction List
- Loading Spinner
- Toast Notifications
- Network Status Indicator