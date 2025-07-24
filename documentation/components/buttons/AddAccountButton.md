# Add Account Button

## Overview
The Add Account Button allows users to create additional accounts/addresses within their wallet for better privacy and organization. It's part of the multi-account management system.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 
  - 9027-9029 (Dashboard "+ Accounts" button)
  - 9087-9090 (Header "+" button)
  - 4632-4635 (Account switcher)

### Visual Specifications

#### Dashboard Version
- **Class**: `btn-secondary dashboard-btn`
- **Text**: "+ Accounts"
- **Background**: Black (`#000000`)
- **Border**: 2px solid `var(--border-active)`
- **Padding**: 8px 16px

#### Header Icon Version
- **Class**: `header-btn`
- **Text**: "+"
- **Title**: "Add Account"
- **Size**: 32px × 32px
- **Border Radius**: 4px

### Implementation

```javascript
// Dashboard button
$.button({
    className: 'btn-secondary dashboard-btn',
    onclick: () => this.showMultiAccountManager()
}, ['+ Accounts'])

// Header button
$.button({
    className: 'header-btn',
    title: 'Add Account',
    onclick: () => this.showMultiAccountManager()
}, ['+'])
```

### Click Handler

```javascript
showMultiAccountManager() {
    // Create modal for account management
    const modal = new MultiAccountModal({
        currentAccounts: this.getAllAccounts(),
        onAddAccount: (accountName) => this.createNewAccount(accountName),
        onSwitchAccount: (accountId) => this.switchToAccount(accountId),
        onDeleteAccount: (accountId) => this.deleteAccount(accountId)
    });
    
    modal.show();
}

async createNewAccount(accountName) {
    try {
        // Validate account name
        if (!accountName || accountName.trim().length === 0) {
            throw new Error('Account name is required');
        }
        
        // Check for duplicate names
        if (this.accountExists(accountName)) {
            throw new Error('Account name already exists');
        }
        
        // Generate new account
        const accountIndex = this.getNextAccountIndex();
        const account = await this.deriveAccount(accountIndex);
        
        // Save account
        const newAccount = {
            id: this.generateAccountId(),
            name: accountName,
            index: accountIndex,
            address: account.address,
            publicKey: account.publicKey,
            balance: '0',
            createdAt: Date.now()
        };
        
        // Add to storage
        this.addAccount(newAccount);
        
        // Update UI
        this.refreshAccountList();
        this.showToast(`Account "${accountName}" created`, 'success');
        
        return newAccount;
        
    } catch (error) {
        this.showError(error.message);
        throw error;
    }
}
```

### Account Derivation
```javascript
async deriveAccount(index) {
    // Use BIP44 derivation path
    // m/44'/0'/0'/0/index for Bitcoin mainnet
    const path = `m/44'/0'/0'/0/${index}`;
    
    // Derive from master seed
    const masterSeed = await this.getMasterSeed();
    const hdWallet = this.createHDWallet(masterSeed);
    const account = hdWallet.derivePath(path);
    
    return {
        address: account.getAddress(),
        publicKey: account.getPublicKey(),
        path: path
    };
}
```

### Features
- BIP44 HD wallet derivation
- Custom account naming
- Account balance tracking
- Quick account switching
- Account activity history
- Import/export accounts

### UI Components
1. **Account List**
   - Current accounts display
   - Balance for each account
   - Active account indicator
   - Switch/delete options

2. **Add Account Form**
   - Account name input
   - Optional description
   - Advanced options (custom path)
   - Create button

### Validation
- Unique account names required
- Name length: 1-50 characters
- Special characters allowed
- No duplicate addresses
- Maximum 20 accounts (configurable)

### State Management
```javascript
// Account state structure
{
    accounts: [
        {
            id: 'acc_1234567890',
            name: 'Main Wallet',
            index: 0,
            address: 'bc1q...',
            balance: '0.00000000',
            createdAt: 1634567890123,
            lastUsed: 1634567890123
        }
    ],
    activeAccountId: 'acc_1234567890'
}
```

### Accessibility Features
- Keyboard navigation in modal
- Screen reader announcements
- Clear focus indicators
- Descriptive labels

### Mobile Optimizations
- Full-screen modal on mobile
- Touch-friendly form inputs
- Swipe to delete gesture
- Responsive account list

### Security Considerations
- Accounts derived from single seed
- No private keys in account data
- Secure account switching
- Activity logging per account

### Related Components
- Multi-Account Modal
- Account Switcher Dropdown
- Account List Item
- Delete Account Confirmation
- Account Balance Display