# AccountListModal Documentation

## Overview
The AccountListModal is a comprehensive multi-account management interface that allows users to view, create, edit, switch between, and manage multiple wallet accounts with real-time balance updates and currency conversion.

## Location in Codebase
- **File**: `/public/js/moosh-wallet.js`
- **Class Definition**: Lines 18159-20000 (approximately)
- **Main Implementation Start**: Line 18159
- **Show Method**: Line 18429
- **Balance Management**: Lines 18240-18415
- **Account Grid Rendering**: Lines 18550-19000

## Component Structure

### Class Initialization
```javascript
// Line 18159
class AccountListModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.searchQuery = '';
        this.selectedAccounts = new Set();
        
        // Balance tracking
        this.balanceLoading = new Map();
        this.lastBalanceUpdate = new Map();
        this.editingAccountId = null;
    }
}
```

### Modal Dimensions and Styling
- **Container Class**: `account-list-modal terminal-box`
- **Width**: 90% (max 900px)
- **Height**: 90vh (max 800px)
- **Background**: `var(--bg-primary)`
- **Border**: 2px solid theme color (orange/green)
- **Layout**: Flexbox column

## Modal Sections

### 1. Header Section (Lines 18560-18600)
```javascript
$.div({ className: 'modal-header' }, [
    $.h2({ className: 'modal-title' }, [
        $.span({ className: 'text-dim' }, ['<']),
        ' Manage Accounts ',
        $.span({ className: 'text-dim' }, ['/>'])
    ]),
    // Currency selector
    // Search input
    // Close button
])
```

### 2. Currency Selector
Dropdown with supported currencies:
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- JPY (¥) - Japanese Yen
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- CHF (Fr) - Swiss Franc
- CNY (¥) - Chinese Yuan
- INR (₹) - Indian Rupee
- KRW (₩) - Korean Won

### 3. Search Bar
- **Placeholder**: "Search accounts..."
- **Real-time filtering**: Filters by name, address
- **Debounced**: 300ms delay

### 4. Account Grid (Lines 18650-19000)
Grid layout displaying account cards:
```javascript
$.div({ className: 'account-grid' }, [
    // Account cards rendered here
])
```

### 5. Account Card Structure
Each account card contains:
- **Color Bar**: Account color indicator
- **Account Name**: Editable on click
- **Balance Display**:
  - BTC amount (8 decimals)
  - Fiat equivalent
  - Loading/refresh state
- **Address Preview**: Truncated taproot address
- **Action Buttons**:
  - Switch to account
  - Copy address
  - Edit details
  - Delete (if not active)

### 6. Add Account Button
Floating action button:
- **Position**: Bottom right
- **Icon**: Plus sign
- **Action**: Opens account creation

## Balance Management System

### Price Fetching (Lines 18240-18261)
```javascript
async fetchBTCPrice() {
    const prices = await this.app.apiService.getBTCPrices();
    
    this.currencyPrices = new Map([
        ['usd', prices.usd],
        ['eur', prices.eur],
        ['gbp', prices.gbp],
        // ... other currencies
    ]);
}
```

### Balance Updates (Lines 18263-18345)
```javascript
async refreshAccountBalance(account) {
    // Check if already loading
    if (this.balanceLoading.get(account.id)) return;
    
    this.balanceLoading.set(account.id, true);
    
    try {
        const balance = await this.app.apiService.getBalance(account.addresses);
        this.updateBalanceDisplay(account.id, balance);
    } finally {
        this.balanceLoading.set(account.id, false);
    }
}
```

### Currency Conversion (Lines 18360-18390)
Real-time currency switching updates all displayed values

## State Management

### Account State
- Current accounts list
- Active account ID
- Selected accounts (for bulk actions)
- Editing state

### Balance State
- Balance cache per account
- Loading states
- Last update timestamps
- Currency selection

## API Calls

### 1. Balance Fetching
```javascript
// For each account
const balance = await this.app.apiService.getBalance({
    taproot: account.addresses.taproot,
    segwit: account.addresses.segwit,
    legacy: account.addresses.legacy
});
```

### 2. Price Data
```javascript
// Fetch current BTC prices
const prices = await this.app.apiService.getBTCPrices([
    'usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'inr', 'krw'
]);
```

### 3. Account Operations
```javascript
// Create new account
await this.app.walletService.createAccount(accountData);

// Update account
await this.app.walletService.updateAccount(accountId, changes);

// Delete account
await this.app.walletService.deleteAccount(accountId);
```

## Event Handlers

### Account Actions
- **Switch Account**: Changes active wallet
- **Edit Name**: Inline editing with save/cancel
- **Copy Address**: Clipboard with notification
- **Delete**: Confirmation dialog required
- **Refresh Balance**: Individual balance update

### Modal Events
- **Search Input**: Filters accounts
- **Currency Change**: Updates all displays
- **Create Account**: Opens creation flow
- **Close Modal**: Cleanup and unmount

## Styling Classes

### Container Classes
- `.account-list-modal` - Main modal container
- `.account-grid` - Grid layout for cards
- `.account-card` - Individual account
- `.account-card-active` - Active account styling
- `.account-color-bar` - Color indicator

### Balance Display Classes
- `.balance-btc-{id}` - BTC amount
- `.balance-usd-{id}` - Fiat amount (dynamic class)
- `.balance-loading` - Loading state
- `.balance-error` - Error state

### Responsive Grid
```css
.account-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 20px;
    overflow-y: auto;
}
```

## Mobile Responsiveness
- Single column on mobile
- Touch-friendly card actions
- Swipe gestures for delete
- Simplified balance display
- Bottom sheet style on small screens

## Advanced Features

### 1. Bulk Operations
- Select multiple accounts
- Bulk export
- Bulk delete (with protection)
- Group by type/balance

### 2. Account Templates
Quick create with presets:
- Savings Account
- Trading Account
- Cold Storage
- Daily Spending

### 3. Balance Analytics
- Total portfolio value
- Balance distribution chart
- Historical balance tracking
- Performance metrics

### 4. Import/Export
- Export account list
- Import from backup
- QR code generation
- Encrypted export option

## Security Considerations

### 1. Delete Protection
- Cannot delete active account
- Cannot delete last account
- Confirmation required
- Backup reminder

### 2. Balance Privacy
- Option to hide balances
- Blur on screenshot
- Privacy mode toggle
- Masked values option

### 3. Access Control
- Password required for sensitive actions
- Session timeout
- Audit logging

## Performance Features

### 1. Lazy Loading
- Load balances on scroll
- Staggered API calls
- Request queuing

### 2. Caching
- Balance cache (5 minutes)
- Price cache (1 minute)
- Address cache (permanent)

### 3. Optimizations
```javascript
// Batch balance updates
const batchSize = 5;
for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);
    await Promise.all(batch.map(acc => this.refreshAccountBalance(acc)));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
}
```

## Error Handling
- "Failed to load balance" - API error
- "Account name required" - Validation
- "Cannot delete active account" - Logic error
- "Network error" - Connectivity issue

## Connected Components
- **StateManager**: Account persistence
- **ApiService**: Balance and price data
- **WalletService**: Account operations
- **NotificationSystem**: User feedback

## Usage Example
```javascript
// From AccountSwitcher dropdown
const modal = new AccountListModal(this.app);
modal.show();

// From dashboard
showMultiAccountManager() {
    const modal = new AccountListModal(this.app);
    modal.show();
}
```

## Testing Considerations
1. Test with many accounts (100+)
2. Verify balance update performance
3. Test currency switching speed
4. Verify search functionality
5. Test mobile responsiveness
6. Check error states

## Notes for Recreation
1. Implement efficient balance fetching
2. Add proper rate limiting
3. Cache price data appropriately
4. Use virtual scrolling for many accounts
5. Implement proper error boundaries
6. Add comprehensive loading states