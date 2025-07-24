# DashboardPage Component

## Component Name
DashboardPage

## Exact Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 26566-31065 (main class)
- **Class Definition**: `class DashboardPage extends Component`
- **Key Methods**:
  - `render()`: Lines 26702-26837
  - `createDashboard()`: Lines 26839-26846
  - `createDashboardHeader()`: Lines 26848-27113
  - `createDashboardContent()`: Lines 27115-27140

## UI Design (Visual Details for AI Recreation)

### Overall Layout
- Dark background (#000000)
- Card container with standard padding
- Terminal-style header box at top
- Content sections below

### Terminal Header Box
- **Container**: Black background, orange border (#f57315)
- **Terminal Path**: `~/moosh/wallet/dashboard $` in gray (#666666)
- **Hover Effect**: Path turns orange, background gets subtle highlight
- **Click Action**: Shows terminal commands menu

### Control Bar (Inside Terminal Box)
- **Layout**: Centered flex container with controls
- **Account Switcher**: Dropdown showing current account name
- **Action Buttons**:
  - "Manage" - Green border (#69fd97), manages accounts
  - "Refresh" - Orange border, refreshes balances
  - "USD" - Currency selector, shows dropdown on click
  - Hide/Show - Eye icon button for balance privacy
  - Lock - Lock icon for wallet security

### Balance Display Section
- **Container**: Black background, 2px orange border
- **Balance Amount**: 
  - Font: JetBrains Mono, 32px
  - Format: "0.00000000 BTC"
  - Hidden state: "******** BTC"
- **USD Value**: Below BTC, smaller text
- **Price Info**: Current BTC price and 24h change

### Address Display
- **Wallet Type Selector**: Dropdown for address types
- **Address Display**: 
  - Monospace font
  - Click to copy functionality
  - QR code button

### Quick Actions Grid
- 4x2 grid on desktop, 2x4 on mobile
- Each button:
  - Icon + Label
  - Orange border
  - Hover: Inverted colors
  - Actions: Send, Receive, Swap, Buy, History, Settings, Ordinals, Backup

### Transaction History
- **Title**: "Recent Transactions"
- **List**: Shows last 5 transactions
- **Each Item**:
  - Type (Sent/Received)
  - Amount in BTC
  - USD value
  - Time ago
  - Address (truncated)

### Charts Section
- **Balance Chart**: Line graph showing balance over time
- **Portfolio Distribution**: Pie chart of holdings

## Function (What It Does)

1. **Main Wallet Interface**: Primary control center after wallet creation
2. **Balance Management**: Shows current balance with privacy options
3. **Transaction Hub**: Send, receive, and view transaction history
4. **Account Management**: Switch between multiple accounts
5. **Real-time Updates**: Live price data and balance refresh
6. **Security**: Lock screen protection when password set

## Architecture (Code Structure)

```javascript
class DashboardPage extends Component {
    constructor(app) {
        super(app);
        this.debouncedUpdateLiveData = debounce(() => {
            this.updateLiveData();
        }, 300);
    }
    
    afterMount() {
        // Initialize live data updates
        this.updateLiveData();
        this.liveDataInterval = setInterval(() => {
            this.updateLiveData();
        }, 30000);
        
        // Listen for account changes
        this.listenToState('currentAccountId', (newId, oldId) => {
            this.updateAccountDisplay();
            this.loadCurrentAccountData();
        });
        
        // Load initial data
        setTimeout(() => {
            this.loadCurrentAccountData();
            this.refreshBalances();
            this.initializeOrdinalsDisplay();
        }, 100);
    }
    
    render() {
        // Security check first
        const hasPassword = localStorage.getItem('walletPassword');
        const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
        
        if (hasPassword && !isUnlocked) {
            // Show lock screen
            return this.renderLockScreen();
        }
        
        // Show dashboard
        return $.div({ className: 'dashboard-container' }, [
            $.div({ className: 'card dashboard-page' }, [
                this.createDashboard()
            ])
        ]);
    }
}
```

## Connections (Related Components)

### Parent Components
- **Router** - Manages navigation to dashboard
- **MooshWallet** - Main app container

### Child Components
- **WalletLockScreen** - Security screen when locked
- **AccountSwitcher** - Dropdown for account selection
- **TransactionModal** - For send/receive operations
- **MultiAccountModal** - Account management
- **OrdinalsDisplay** - NFT/inscription viewer

### Data Dependencies
- **State Keys**: `currentAccountId`, `accounts`, `isBalanceHidden`
- **LocalStorage**: `sparkWallet`, `generatedSeed`, `walletPassword`
- **SessionStorage**: `walletUnlocked`
- **API Calls**: Balance updates, price data, transactions

### Navigation Flow
1. **To Dashboard**: From wallet creation/import success
2. **From Dashboard**: 
   - Settings page
   - Transaction details
   - Back to home (logout)

## Purpose in Wallet

1. **Central Hub**: Main interface users interact with daily
2. **Account Overview**: Quick view of balance and recent activity
3. **Transaction Center**: Initiate and monitor transactions
4. **Security Gateway**: Ensures wallet protection with lock screen
5. **Multi-Account**: Manage multiple wallets from one interface

## MCP Validation Status

### TestSprite Compliance
- ✅ Uses ElementFactory for all DOM
- ✅ API calls through app.apiService
- ✅ Proper event cleanup in unmount()
- ✅ Debounced updates for performance

### Memory Management
- ✅ Clears all intervals on unmount
- ✅ Removes event listeners properly
- ✅ State listeners cleaned up
- ⚠️ Large component - candidate for splitting

### Security
- ✅ Lock screen for password protection
- ✅ Session-based unlock mechanism
- ✅ No sensitive data in DOM
- ✅ Privacy mode for balance hiding

## Backtrack Info (Git Commands)

### View Dashboard Implementation
```bash
# View current dashboard
git show HEAD:public/js/moosh-wallet.js | grep -A 500 "class DashboardPage"

# View working version
git show 7b831715:public/js/moosh-wallet.js | grep -A 500 "class DashboardPage"
```

### Find Dashboard Changes
```bash
git log -p --follow -S "DashboardPage" -- public/js/moosh-wallet.js
```

### Key Working Commits
```bash
# Multi-wallet implementation
git show 5da1f5b

# Performance optimization
git show 467f756
```

## Implementation Notes for AI

### Critical Patterns
1. **Always check wallet existence** before rendering
2. **Security first**: Check lock status before content
3. **Use state listeners** not polling for updates
4. **Debounce frequent operations** (refresh, updates)

### Required State Flow
1. Check for wallet in localStorage/state
2. Verify password/unlock status
3. Initialize account data
4. Start live data updates
5. Set up state listeners

### Common Issues to Avoid
1. Don't render without wallet check
2. Don't skip lock screen when password set
3. Clean up ALL intervals/listeners
4. Use proper responsive breakpoints
5. Handle account switching properly

### Testing Checklist
1. Lock screen appears when password set
2. Balance updates on refresh
3. Account switcher works correctly
4. All action buttons navigate properly
5. Transaction history loads
6. Privacy mode hides balance
7. Mobile layout responsive