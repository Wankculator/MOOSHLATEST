# Delete Account Button

## Overview
The Delete Account Button removes additional wallet accounts while preserving the main account. It appears in the account management interface with appropriate warnings.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 4817-4822 (Within account dropdown)

### Visual Specifications
- **Symbol**: "×" or trash icon
- **Position**: Right side of account item
- **Size**: 24px × 24px
- **Color**: `#666666` (default), `#ff4444` on hover
- **Background**: Transparent
- **Padding**: 4px
- **Border Radius**: 4px

### Implementation

```javascript
$.button({
    style: {
        marginLeft: 'auto',
        padding: '4px',
        background: 'transparent',
        border: 'none',
        color: '#666666',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
    },
    onclick: (e) => {
        e.stopPropagation();
        this.confirmDeleteAccount(account.id);
    },
    onmouseover: function() { 
        this.style.color = '#ff4444'; 
        this.style.background = 'rgba(255, 68, 68, 0.1)';
    },
    onmouseout: function() { 
        this.style.color = '#666666'; 
        this.style.background = 'transparent';
    }
}, ['×'])
```

### Delete Confirmation Flow

```javascript
async confirmDeleteAccount(accountId) {
    // Prevent deleting the main account
    if (accountId === this.getMainAccountId()) {
        this.showError('Cannot delete the main account');
        return;
    }
    
    // Check if account has balance
    const account = this.getAccount(accountId);
    const hasBalance = parseFloat(account.balance) > 0;
    
    // Show appropriate warning
    const message = hasBalance 
        ? `Account "${account.name}" has a balance of ${account.balance} BTC. Are you sure you want to delete it? You will need the seed phrase to recover it.`
        : `Are you sure you want to delete account "${account.name}"?`;
    
    const confirmed = await this.showConfirmDialog({
        title: 'Delete Account',
        message: message,
        confirmText: 'Delete',
        confirmClass: 'btn-danger',
        requireDoubleConfirm: hasBalance
    });
    
    if (confirmed) {
        await this.deleteAccount(accountId);
    }
}

async deleteAccount(accountId) {
    try {
        // If this is active account, switch to main first
        if (this.activeAccountId === accountId) {
            await this.switchToAccount(this.getMainAccountId());
        }
        
        // Remove from storage
        this.removeAccountFromStorage(accountId);
        
        // Update UI
        this.refreshAccountList();
        this.closeDropdown();
        
        // Show success message
        this.showToast('Account deleted successfully', 'success');
        
        // Log event
        this.logEvent('ACCOUNT_DELETED', { accountId });
        
    } catch (error) {
        console.error('Failed to delete account:', error);
        this.showError('Failed to delete account');
    }
}
```

### Double Confirmation for Accounts with Balance

```javascript
showDoubleConfirmDialog(config) {
    return new Promise((resolve) => {
        // First confirmation
        const modal1 = this.createConfirmModal({
            ...config,
            onConfirm: () => {
                modal1.close();
                
                // Second confirmation with typing requirement
                const modal2 = this.createTypeConfirmModal({
                    title: 'Type "DELETE" to confirm',
                    message: 'This action cannot be undone.',
                    confirmWord: 'DELETE',
                    onConfirm: () => resolve(true),
                    onCancel: () => resolve(false)
                });
                modal2.show();
            },
            onCancel: () => resolve(false)
        });
        modal1.show();
    });
}
```

### Validation Rules
1. Cannot delete main account (index 0)
2. Cannot delete last remaining account
3. Warning if account has balance
4. Warning if account has transaction history
5. Cannot delete during pending transactions

### Visual States
- **Default**: Gray "×" symbol
- **Hover**: Red color with light red background
- **Active**: Slightly scaled down
- **Disabled**: Opacity 0.5 (for main account)

### Security Features
- Double confirmation for funded accounts
- Clear warnings about irrecoverability
- Activity logging
- Cannot be undone warning
- Seed phrase reminder

### Warning Messages
```javascript
const warnings = {
    hasBalance: "This account has funds that will be inaccessible after deletion.",
    mainAccount: "The main account cannot be deleted.",
    lastAccount: "You must have at least one account.",
    activeAccount: "Switching to main account before deletion.",
    irrecoverable: "Deleted accounts can only be recovered with the seed phrase."
};
```

### Mobile Behavior
- Swipe-to-delete gesture (optional)
- Larger touch target
- Confirmation required
- Haptic feedback on delete

### Account Cleanup
```javascript
cleanupAccount(accountId) {
    // Remove from local storage
    const accounts = this.getAccounts();
    const filtered = accounts.filter(a => a.id !== accountId);
    localStorage.setItem('wallet_accounts', JSON.stringify(filtered));
    
    // Clear account-specific data
    localStorage.removeItem(`transactions_${accountId}`);
    localStorage.removeItem(`labels_${accountId}`);
    localStorage.removeItem(`settings_${accountId}`);
    
    // Update state
    this.state.set('accounts', filtered);
}
```

### Related Components
- Account List
- Confirmation Modal
- Type-to-Confirm Modal
- Account Switcher
- Toast Notifications