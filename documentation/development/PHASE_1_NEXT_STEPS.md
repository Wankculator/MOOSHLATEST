# 🚀 Phase 1: Multi-Wallet UI Components - Next Steps

## Overview
With Phase 0 complete and all foundation bugs fixed, we're ready to build the multi-wallet UI components that will enable users to manage multiple accounts seamlessly.

## Phase 1 Goals
1. **Account Switcher Component** - Quick switching between accounts
2. **Visual Account Indicators** - Clear display of active account
3. **Account List View** - See all accounts at a glance
4. **Enhanced Account Management** - Create, rename, delete accounts

---

## 📋 Implementation Tasks

### 1. Account Switcher Component
**Location**: Dashboard header area
**Features**:
- Dropdown showing all accounts
- Current account highlighted
- Quick switch on click
- Account balances preview

**Code Structure**:
```javascript
createAccountSwitcher() {
  // Display current account name
  // Dropdown with all accounts
  // Click handler for switching
  // Update UI on switch
}
```

### 2. Visual Account Indicators
**Locations**: Multiple UI areas
**Features**:
- Active account badge
- Account type icons
- Balance indicators
- Last activity timestamp

**Implementation**:
- Use reactive state updates
- CSS classes for active state
- Consistent color coding

### 3. Account List Modal
**Trigger**: "Manage Accounts" button
**Features**:
- List all accounts with details
- Add new account button
- Rename account inline
- Delete with confirmation
- Reorder accounts (drag & drop)

**UI Layout**:
```
┌─────────────────────────────────┐
│ 📊 Your Accounts                │
├─────────────────────────────────┤
│ ✓ Main Wallet      ₿0.00128    │
│   Personal Wallet  ₿0.00000    │
│   Trading Account  ₿0.00543    │
│                                 │
│ [+ Add Account] [Import Wallet] │
└─────────────────────────────────┘
```

### 4. Account Creation Flow Enhancement
**Current**: Basic name input
**Enhanced**:
- Account type selection
- Custom icons/colors
- Advanced options
- Import detection integration

---

## 🛠️ Technical Implementation

### State Management Updates
```javascript
// Enhanced state structure
state: {
  accounts: [...],
  currentAccountId: 'xxx',
  selectedAccountIds: [], // For Phase 2
  accountPreferences: {
    sortOrder: [],
    displaySettings: {}
  }
}
```

### Event System
```javascript
// Account events
'accountCreated'
'accountSwitched'
'accountUpdated'
'accountDeleted'
'accountsReordered'
```

### Component Structure
```javascript
// New components to create
AccountSwitcher
AccountListModal
AccountCard
AccountCreationWizard
AccountIndicator
```

---

## 📐 UI/UX Guidelines

### Design Principles
1. **Clarity**: Always show which account is active
2. **Speed**: Quick account switching (< 100ms)
3. **Consistency**: Same account colors/icons everywhere
4. **Accessibility**: Keyboard navigation support

### Visual Design
- Maintain retro terminal aesthetic
- Use ASCII art for icons where appropriate
- Consistent color scheme (orange accent)
- Smooth transitions between states

---

## 🔧 Implementation Order

### Week 1: Core Components
1. Create AccountSwitcher component
2. Implement switching logic
3. Add visual indicators
4. Test state persistence

### Week 2: Account Management
1. Build AccountListModal
2. Add rename functionality
3. Implement delete with confirmation
4. Create account reordering

### Week 3: Polish & Integration
1. Add animations/transitions
2. Implement keyboard shortcuts
3. Add account search/filter
4. Performance optimization

---

## 🧪 Testing Requirements

### Functional Tests
- [ ] Account switching works correctly
- [ ] State persists after refresh
- [ ] All UI updates reflect current account
- [ ] Delete confirmation prevents accidents
- [ ] Rename updates everywhere

### Performance Tests
- [ ] Switching is instant (< 100ms)
- [ ] No memory leaks with many accounts
- [ ] Smooth animations (60fps)
- [ ] Fast initial load

### Edge Cases
- [ ] Handle 50+ accounts gracefully
- [ ] Long account names display properly
- [ ] Deleted account handling
- [ ] Concurrent state updates

---

## 🎯 Success Criteria

### User Experience
- Users can switch accounts with one click
- Always clear which account is active
- Account management feels intuitive
- No confusion about account state

### Technical
- All tests passing
- No performance regression
- State management reliable
- Code maintainable

---

## 📝 Code Examples

### Account Switcher
```javascript
createAccountSwitcher() {
  const $ = window.ElementFactory;
  const currentAccount = this.app.state.getCurrentAccount();
  const accounts = this.app.state.getAccounts();
  
  return $.div({ className: 'account-switcher' }, [
    $.button({
      className: 'account-switcher-trigger',
      onclick: () => this.toggleDropdown()
    }, [
      $.span({}, [currentAccount.name]),
      $.span({ className: 'account-balance' }, [
        `₿${currentAccount.balances.bitcoin}`
      ])
    ]),
    
    this.state.dropdownOpen && $.div({
      className: 'account-dropdown'
    }, accounts.map(account => 
      $.div({
        className: `account-item ${account.id === currentAccount.id ? 'active' : ''}`,
        onclick: () => this.switchToAccount(account.id)
      }, [
        $.span({}, [account.name]),
        $.span({}, [`₿${account.balances.bitcoin}`])
      ])
    ))
  ]);
}
```

### State Update Handler
```javascript
switchToAccount(accountId) {
  // Update state
  this.app.state.switchAccount(accountId);
  
  // Close dropdown
  this.setState({ dropdownOpen: false });
  
  // Refresh dashboard data
  this.app.dashboard.loadCurrentAccountData();
}
```

---

## 🚦 Ready to Start!

All foundation work is complete:
- ✅ Bugs fixed
- ✅ State persistence working
- ✅ Tests passing
- ✅ Documentation ready

Let's build amazing multi-wallet features! 🎉