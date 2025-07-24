# Component: Account Switching System

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 4319-4560 (AccountSwitcher class)
- `/public/js/moosh-wallet.js` - Lines 18564-19600 (MultiAccountModal)

## Overview
The Account Switching System allows users to manage multiple Bitcoin/Spark accounts within a single wallet, with support for drag-and-drop reordering, multi-select operations, and color-coded identification.

## Component Architecture

### Main Classes
1. **AccountSwitcher** (Lines 4319-4560)
   - Manages the dropdown UI in the dashboard header
   - Handles account selection and active account tracking
   - Provides quick account switching functionality

2. **MultiAccountModal** (Lines 18564-19600)
   - Full account management interface
   - Drag-and-drop reordering
   - Bulk operations (delete, rename)
   - Account creation and import

## Implementation Details

### AccountSwitcher Component
```javascript
class AccountSwitcher extends Component {
    constructor(app) {
        super(app);
        this.state = {
            isOpen: false,
            activeAccounts: this.app.state.get('activeAccounts') || []
        };
    }
    
    render() {
        // Lines 4374-4440
        // Creates dropdown with account list
        // Shows active accounts with checkmarks
        // Handles click events for switching
    }
}
```

### Key Methods

#### Account Selection
```javascript
switchToAccount(accountId) {
    // Lines 4384-4400
    ComplianceUtils.log('AccountSwitcher', 'Switching to account: ' + accountId);
    
    const wallets = this.app.state.get('wallets') || [];
    const targetWallet = wallets.find(w => w.id === accountId);
    
    if (targetWallet) {
        this.app.state.set('currentWallet', targetWallet);
        this.app.state.set('currentWalletId', accountId);
        this.app.router.navigate('dashboard');
    }
}
```

#### Multi-Select Toggle
```javascript
toggleActiveAccount(accountId) {
    // Lines 4407-4425
    const activeAccounts = [...this.state.activeAccounts];
    const index = activeAccounts.indexOf(accountId);
    
    if (index === -1) {
        activeAccounts.push(accountId);
    } else {
        activeAccounts.splice(index, 1);
    }
    
    this.state.activeAccounts = activeAccounts;
    this.app.state.set('activeAccounts', activeAccounts);
}
```

## Visual Specifications

### Dropdown Styles
```css
.account-switcher-dropdown {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
}

.account-item {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.account-color {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
}
```

### Account Colors
The system uses a predefined color palette for visual identification:
```javascript
const ACCOUNT_COLORS = [
    '#69FD97', // Green (default)
    '#E94560', // Red
    '#FDB54A', // Orange
    '#5C7CFA', // Blue
    '#9775FA', // Purple
    '#FF6B6B', // Pink
    '#4ECDC4', // Teal
    '#FFE66D'  // Yellow
];
```

## DOM Structure
```html
<div class="account-switcher">
    <button class="account-switcher-toggle">
        <div class="account-color"></div>
        <span class="account-name">Account 1</span>
        <span class="dropdown-arrow">▼</span>
    </button>
    <div class="account-switcher-dropdown">
        <div class="account-item">
            <div class="account-color"></div>
            <span class="account-name">Account 1</span>
            <span class="checkmark">✓</span>
        </div>
        <!-- More account items -->
        <button class="manage-accounts-btn">
            + Manage Accounts
        </button>
    </div>
</div>
```

## Event Handlers

### Toggle Dropdown
```javascript
// Line 4374
toggleDropdown() {
    this.state.isOpen = !this.state.isOpen;
    ComplianceUtils.log('AccountSwitcher', 'New state: ' + this.state.isOpen);
    this.render();
}
```

### Outside Click Handler
```javascript
// Lines 4430-4435
document.addEventListener('click', (e) => {
    if (!this.element.contains(e.target) && this.state.isOpen) {
        this.state.isOpen = false;
        this.render();
    }
});
```

## State Management
- **currentWalletId**: Active wallet ID
- **activeAccounts**: Array of selected account IDs for multi-view
- **wallets**: Complete wallet array with account data

## API Connections
- None directly - operates on local state
- Balance updates trigger through state changes

## Performance Considerations
1. **Virtualization**: Account list virtualizes after 50 accounts
2. **Debouncing**: Search input debounced at 300ms
3. **Memoization**: Account color assignments cached

## Testing
```bash
# Test account switching
node tests/unit/accountSwitcher.test.js

# Test multi-select functionality
node tests/unit/multiAccountSelect.test.js

# Test drag-and-drop
node tests/e2e/accountReordering.test.js
```

## Known Issues
1. Dropdown positioning can overflow on small screens
2. Drag-and-drop performance degrades with 100+ accounts
3. Color assignments may repeat after 8 accounts

## Git Recovery Commands
```bash
# Restore account switcher functionality
git checkout 4a1397e -- public/js/moosh-wallet.js

# Restore multi-account modal
git checkout 690aca1 -- public/js/moosh-wallet.js

# View implementation history
git log -p --grep="account.*switch" -- public/js/moosh-wallet.js
```

## Related Components
- [MultiAccountModal](./MultiAccountModal.md)
- [WalletSettingsModal](./WalletSettingsModal.md)
- [Dashboard Header](../ui-sections/DashboardHeader.md)