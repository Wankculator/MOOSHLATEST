# Delete Wallet Button

## Overview
The Delete Wallet Button permanently removes the wallet from the device. This is a high-risk action located in the danger zone of settings with multiple confirmation steps.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10328-10335 (renderDeleteWallet method)
- **Section**: Settings > Danger Zone

### Visual Specifications
- **Class**: `btn btn-danger`
- **Background**: Transparent (red on hover)
- **Border**: 2px solid `#ff4444`
- **Text Color**: `#ff4444` (white on hover)
- **Text**: "Delete Wallet"
- **Icon**: ⚠️ (warning)
- **Container**: Red-bordered danger zone

### Implementation

```javascript
renderDeleteWallet() {
    return $.div({ className: 'setting-item danger-zone' }, [
        $.button({
            className: 'btn btn-danger',
            onclick: () => this.confirmDeleteWallet()
        }, ['Delete Wallet']),
        $.div({ className: 'setting-warning' }, [
            '⚠️ This will permanently delete your wallet. Make sure you have backed up your seed phrase!'
        ])
    ]);
}
```

### Multi-Step Confirmation Flow

```javascript
async confirmDeleteWallet() {
    // Step 1: Initial warning
    const firstConfirm = await this.showConfirmDialog({
        title: '⚠️ Delete Wallet',
        message: 'Are you absolutely sure you want to delete your wallet? This action cannot be undone!',
        confirmText: 'Yes, I understand',
        confirmClass: 'btn-danger',
        cancelText: 'Cancel'
    });
    
    if (!firstConfirm) return;
    
    // Step 2: Backup reminder
    const hasBackup = await this.showConfirmDialog({
        title: '📝 Backup Reminder',
        message: 'Have you saved your seed phrase? Without it, you will lose access to your funds forever!',
        confirmText: 'Yes, I have my seed phrase',
        confirmClass: 'btn-warning',
        cancelText: 'No, let me backup first'
    });
    
    if (!hasBackup) {
        this.showSeedPhraseModal();
        return;
    }
    
    // Step 3: Type confirmation
    const typed = await this.showTypeConfirmDialog({
        title: 'Final Confirmation',
        message: 'Type "DELETE WALLET" to confirm',
        placeholder: 'Type here...',
        confirmText: 'DELETE WALLET',
        confirmClass: 'btn-danger'
    });
    
    if (!typed) return;
    
    // Step 4: Password verification
    const password = await this.showPasswordDialog({
        title: 'Enter Password',
        message: 'Enter your password to delete the wallet'
    });
    
    if (!password || !await this.verifyPassword(password)) {
        this.showError('Incorrect password');
        return;
    }
    
    // Proceed with deletion
    await this.deleteWallet();
}
```

### Type Confirmation Dialog

```javascript
showTypeConfirmDialog(options) {
    return new Promise((resolve) => {
        const modal = $.div({ className: 'type-confirm-modal' }, [
            $.h3({}, [options.title]),
            $.p({}, [options.message]),
            
            $.input({
                type: 'text',
                id: 'typeConfirmInput',
                placeholder: options.placeholder,
                style: 'width: 100%; padding: 12px; margin: 20px 0; font-family: JetBrains Mono;'
            }),
            
            $.div({ className: 'modal-footer' }, [
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => {
                        modal.remove();
                        resolve(false);
                    }
                }, ['Cancel']),
                
                $.button({
                    className: options.confirmClass || 'btn btn-danger',
                    onclick: () => {
                        const input = document.getElementById('typeConfirmInput');
                        const isCorrect = input.value === options.confirmText;
                        modal.remove();
                        resolve(isCorrect);
                    }
                }, ['Delete'])
            ])
        ]);
        
        document.body.appendChild(modal);
        document.getElementById('typeConfirmInput').focus();
    });
}
```

### Wallet Deletion Process

```javascript
async deleteWallet() {
    try {
        // Show deletion progress
        this.showLoading('Deleting wallet...');
        
        // Clear all wallet data
        await this.clearWalletData();
        
        // Clear local storage
        this.clearLocalStorage();
        
        // Clear session storage
        this.clearSessionStorage();
        
        // Clear IndexedDB
        await this.clearIndexedDB();
        
        // Clear cookies
        this.clearCookies();
        
        // Log deletion event
        this.logSecurityEvent('WALLET_DELETED', {
            timestamp: Date.now(),
            reason: 'User initiated'
        });
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to welcome screen
        window.location.href = '/';
        
    } catch (error) {
        console.error('Failed to delete wallet:', error);
        this.showError('Failed to delete wallet completely');
    }
}
```

### Data Cleanup

```javascript
async clearWalletData() {
    // Clear memory
    this.wallet = null;
    this.accounts = [];
    this.transactions = [];
    this.settings = {};
    
    // Clear crypto keys
    if (this.cryptoKeys) {
        this.cryptoKeys = null;
    }
    
    // Force garbage collection
    if (global.gc) {
        global.gc();
    }
}

clearLocalStorage() {
    const keysToPreserve = ['theme_preference', 'language'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
            localStorage.removeItem(key);
        }
    });
}

async clearIndexedDB() {
    const databases = await indexedDB.databases();
    
    for (const db of databases) {
        await indexedDB.deleteDatabase(db.name);
    }
}
```

### Visual Warning Styles

```css
.danger-zone {
    border: 2px solid #ff4444;
    background: rgba(255, 68, 68, 0.05);
    padding: 20px;
    border-radius: 8px;
    margin-top: 40px;
}

.setting-warning {
    color: #ff4444;
    font-size: 12px;
    margin-top: 8px;
    line-height: 1.4;
}

.btn-danger {
    background: transparent;
    border: 2px solid #ff4444;
    color: #ff4444;
    transition: all 0.2s ease;
}

.btn-danger:hover {
    background: #ff4444;
    color: #ffffff;
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}
```

### Security Measures
1. Multiple confirmation steps
2. Password verification required
3. Type-to-confirm protection
4. Backup reminder
5. Irreversible action warning
6. Security event logging

### Post-Deletion
- All data permanently removed
- No recovery possible without seed
- Browser redirects to start
- Cookies cleared
- Sessions terminated

### Related Components
- Confirmation Dialogs
- Type-to-Confirm Modal
- Password Verification
- Seed Phrase Display
- Security Event Logger