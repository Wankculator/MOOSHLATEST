# UI Section: Account Dropdown

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 4319-4560 (AccountSwitcher implementation)
- `/public/js/moosh-wallet.js` - Lines 10787-10850 (Dropdown styles)

## Overview
The Account Dropdown provides quick access to account switching functionality directly from the navigation bar. It displays the current account with its color indicator and allows instant switching between accounts.

## Component Architecture

### Implementation
```javascript
class AccountDropdown {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.element = null;
    }
    
    render() {
        const $ = window.ElementFactory || ElementFactory;
        const currentWallet = this.app.state.get('currentWallet');
        const wallets = this.app.state.get('wallets') || [];
        
        return $.div({
            className: 'account-dropdown',
            style: {
                position: 'relative',
                display: 'inline-block'
            }
        }, [
            this.createDropdownToggle(currentWallet),
            this.isOpen && this.createDropdownMenu(wallets, currentWallet)
        ]);
    }
}
```

## Visual Specifications

### Dropdown Toggle
```css
.account-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 180px;
}

.account-dropdown-toggle:hover {
    border-color: var(--text-accent);
    background: rgba(105, 253, 151, 0.05);
}

.account-color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    flex-shrink: 0;
}

.account-name {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--text-primary);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dropdown-arrow {
    color: var(--text-dim);
    transition: transform 0.2s ease;
}

.account-dropdown.open .dropdown-arrow {
    transform: rotate(180deg);
}
```

### Dropdown Menu
```css
.account-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1001;
    animation: dropdownSlide 0.2s ease;
}

@keyframes dropdownSlide {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.account-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.account-item:hover {
    background: rgba(105, 253, 151, 0.1);
}

.account-item.active {
    background: rgba(105, 253, 151, 0.15);
}

.account-balance {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-dim);
    font-family: 'JetBrains Mono', monospace;
}
```

## DOM Structure
```html
<div class="account-dropdown">
    <button class="account-dropdown-toggle">
        <div class="account-color-indicator" style="background: #69FD97;"></div>
        <span class="account-name">Main Account</span>
        <span class="dropdown-arrow">▼</span>
    </button>
    
    <div class="account-dropdown-menu">
        <div class="account-item active">
            <div class="account-color-indicator" style="background: #69FD97;"></div>
            <span class="account-name">Main Account</span>
            <span class="account-balance">0.00123 BTC</span>
        </div>
        
        <div class="account-item">
            <div class="account-color-indicator" style="background: #E94560;"></div>
            <span class="account-name">Trading</span>
            <span class="account-balance">0.00456 BTC</span>
        </div>
        
        <div class="dropdown-divider"></div>
        
        <button class="manage-accounts-btn">
            <span class="icon">+</span>
            <span>Manage Accounts</span>
        </button>
    </div>
</div>
```

## Implementation Details

### Toggle Functionality
```javascript
createDropdownToggle(currentWallet) {
    const $ = window.ElementFactory || ElementFactory;
    const accountColor = currentWallet?.color || '#69FD97';
    const accountName = currentWallet?.name || 'No Account';
    
    return $.button({
        className: 'account-dropdown-toggle',
        onclick: (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        }
    }, [
        $.div({
            className: 'account-color-indicator',
            style: { background: accountColor }
        }),
        $.span({ className: 'account-name' }, [accountName]),
        $.span({ className: 'dropdown-arrow' }, ['▼'])
    ]);
}
```

### Menu Creation
```javascript
createDropdownMenu(wallets, currentWallet) {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'account-dropdown-menu' }, [
        ...wallets.map(wallet => this.createAccountItem(wallet, currentWallet)),
        $.div({ className: 'dropdown-divider' }),
        $.button({
            className: 'manage-accounts-btn',
            onclick: () => {
                this.closeDropdown();
                this.app.showMultiAccountModal();
            }
        }, [
            $.span({ className: 'icon' }, ['+']),
            $.span({}, ['Manage Accounts'])
        ])
    ]);
}
```

### Account Item
```javascript
createAccountItem(wallet, currentWallet) {
    const $ = window.ElementFactory || ElementFactory;
    const isActive = wallet.id === currentWallet?.id;
    
    return $.div({
        className: `account-item ${isActive ? 'active' : ''}`,
        onclick: () => this.switchToAccount(wallet.id)
    }, [
        $.div({
            className: 'account-color-indicator',
            style: { background: wallet.color }
        }),
        $.span({ className: 'account-name' }, [wallet.name]),
        $.span({ className: 'account-balance' }, [
            this.formatBalance(wallet.balances?.bitcoin || 0) + ' BTC'
        ])
    ]);
}
```

## Event Handling

### Click Outside
```javascript
initializeClickOutside() {
    document.addEventListener('click', (e) => {
        if (!this.element?.contains(e.target) && this.isOpen) {
            this.closeDropdown();
        }
    });
}
```

### Keyboard Navigation
```javascript
handleKeyboardNavigation(e) {
    if (!this.isOpen) return;
    
    switch(e.key) {
        case 'Escape':
            this.closeDropdown();
            break;
        case 'ArrowDown':
            this.focusNextItem();
            break;
        case 'ArrowUp':
            this.focusPreviousItem();
            break;
        case 'Enter':
            this.selectFocusedItem();
            break;
    }
}
```

## State Management
- Current account in `app.state.currentWallet`
- Dropdown state managed locally
- Account list from `app.state.wallets`

## Responsive Behavior

### Mobile Adjustments
```css
@media (max-width: 768px) {
    .account-dropdown-toggle {
        min-width: auto;
        padding: 8px 12px;
    }
    
    .account-name {
        max-width: 100px;
    }
    
    .account-dropdown-menu {
        position: fixed;
        left: 16px;
        right: 16px;
        top: 70px;
    }
}
```

## Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Performance
- Virtual scrolling for > 50 accounts
- Debounced search in dropdown
- Memoized balance calculations

## Testing
```bash
# Test dropdown functionality
npm run test:ui:account-dropdown

# Test account switching
npm run test:ui:account-switch

# Test keyboard navigation
npm run test:ui:dropdown-keyboard
```

## Known Issues
1. Dropdown can be cut off at screen edges
2. Long account names overflow on mobile
3. Balance updates not always immediate

## Git Recovery Commands
```bash
# Restore dropdown implementation
git checkout 4a1397e -- public/js/moosh-wallet.js

# View dropdown history
git log -p --grep="dropdown\|account.*switch" -- public/js/moosh-wallet.js
```

## Related Components
- [Account Switching System](../features/AccountSwitchingSystem.md)
- [Navigation Bar](./NavigationBar.md)
- [Multi Account Modal](../modals/MultiAccountModal.md)
- [Balance Display](./BalanceDisplay.md)