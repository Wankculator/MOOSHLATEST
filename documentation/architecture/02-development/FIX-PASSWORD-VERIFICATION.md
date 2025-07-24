# 🔧 Fix: Password Verification for Sensitive Operations

## Current Issue
The password modal appears but doesn't actually verify passwords for sensitive operations like viewing seed phrases or sending transactions.

## Complete Fix Implementation

### 1. Create Password Manager Service

First, add a password management system to the StateManager:

```javascript
// Add these methods to the StateManager class (around line 1800)

setWalletPassword(password) {
    if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }
    
    // Hash the password (never store plain text)
    const hashedPassword = this.hashPassword(password);
    
    // Store in sessionStorage (not localStorage for security)
    sessionStorage.setItem('moosh_wallet_pwd_hash', hashedPassword);
    
    // Set password timeout (15 minutes)
    this.startPasswordTimeout();
    
    return true;
}

verifyPassword(password) {
    const storedHash = sessionStorage.getItem('moosh_wallet_pwd_hash');
    
    if (!storedHash) {
        return false;
    }
    
    const inputHash = this.hashPassword(password);
    return inputHash === storedHash;
}

hasPassword() {
    return !!sessionStorage.getItem('moosh_wallet_pwd_hash');
}

clearPassword() {
    sessionStorage.removeItem('moosh_wallet_pwd_hash');
    this.clearPasswordTimeout();
}

// Simple hash function (in production, use bcrypt or similar)
hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
}

startPasswordTimeout() {
    // Clear password after 15 minutes of inactivity
    this.clearPasswordTimeout();
    this.passwordTimeout = setTimeout(() => {
        this.clearPassword();
        this.notifySubscribers('security', { event: 'password_timeout' });
    }, 15 * 60 * 1000); // 15 minutes
}

clearPasswordTimeout() {
    if (this.passwordTimeout) {
        clearTimeout(this.passwordTimeout);
        this.passwordTimeout = null;
    }
}
```

### 2. Update PasswordModal to Actually Verify

Find the `PasswordModal` class and update it:

```javascript
class PasswordModal {
    constructor(app, options = {}) {
        this.app = app;
        this.options = {
            title: options.title || 'Password Required',
            message: options.message || 'Enter your password to continue',
            onSuccess: options.onSuccess || (() => {}),
            onCancel: options.onCancel || (() => {}),
            showSetPassword: options.showSetPassword !== false,
            requireNewPassword: options.requireNewPassword || false
        };
        this.attempts = 0;
        this.maxAttempts = 3;
    }
    
    show() {
        const $ = window.ElementFactory || ElementFactory;
        
        // Check if password is required but not set
        if (!this.app.state.hasPassword() && !this.options.requireNewPassword) {
            this.showSetPasswordDialog();
            return;
        }
        
        this.backdrop = $.div({
            className: 'modal-backdrop',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }
        });
        
        this.modal = $.div({
            className: 'password-modal',
            style: {
                background: 'var(--bg-primary)',
                border: '2px solid var(--text-primary)',
                borderRadius: '0',
                padding: '30px',
                minWidth: '400px',
                maxWidth: '500px',
                width: '90%'
            }
        }, [
            // Terminal header
            $.div({
                style: {
                    borderBottom: '1px solid var(--text-primary)',
                    paddingBottom: '10px',
                    marginBottom: '20px',
                    fontFamily: 'monospace'
                }
            }, [
                $.span({ style: { color: 'var(--text-accent)' } }, ['~/moosh/security $ '])
            ]),
            
            // Title
            $.h2({
                style: {
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    fontSize: '20px'
                }
            }, [this.options.title]),
            
            // Message
            $.p({
                style: {
                    color: 'var(--text-dim)',
                    marginBottom: '20px',
                    fontSize: '14px'
                }
            }, [this.options.message]),
            
            // Password input
            $.div({ style: { marginBottom: '20px' } }, [
                $.input({
                    id: 'password-input',
                    type: 'password',
                    placeholder: 'Enter password',
                    style: {
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                    },
                    onkeydown: (e) => {
                        if (e.key === 'Enter') {
                            this.verifyPassword();
                        } else if (e.key === 'Escape') {
                            this.cancel();
                        }
                    }
                })
            ]),
            
            // Error message
            $.div({
                id: 'password-error',
                style: {
                    color: '#ff4444',
                    fontSize: '12px',
                    marginBottom: '20px',
                    display: 'none'
                }
            }),
            
            // Buttons
            $.div({
                style: {
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }
            }, [
                $.button({
                    style: {
                        background: 'transparent',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                    },
                    onclick: () => this.verifyPassword()
                }, ['Verify']),
                
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--text-dim)',
                        borderRadius: '0',
                        color: 'var(--text-dim)',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                    },
                    onclick: () => this.cancel()
                }, ['Cancel'])
            ])
        ]);
        
        this.backdrop.appendChild(this.modal);
        document.body.appendChild(this.backdrop);
        
        // Focus password input
        setTimeout(() => {
            document.getElementById('password-input')?.focus();
        }, 100);
    }
    
    verifyPassword() {
        const input = document.getElementById('password-input');
        const errorDiv = document.getElementById('password-error');
        
        if (!input) return;
        
        const password = input.value;
        
        if (!password) {
            this.showError('Please enter a password');
            return;
        }
        
        // Verify the password
        if (this.app.state.verifyPassword(password)) {
            // Success
            this.close();
            this.options.onSuccess();
            
            // Reset password timeout
            this.app.state.startPasswordTimeout();
        } else {
            // Failed attempt
            this.attempts++;
            
            if (this.attempts >= this.maxAttempts) {
                this.showError('Too many failed attempts. Please reload the page.');
                setTimeout(() => {
                    this.close();
                    this.options.onCancel();
                }, 2000);
            } else {
                this.showError(`Incorrect password. ${this.maxAttempts - this.attempts} attempts remaining.`);
                input.value = '';
                input.focus();
            }
        }
    }
    
    showSetPasswordDialog() {
        const $ = window.ElementFactory || ElementFactory;
        
        this.backdrop = $.div({
            className: 'modal-backdrop',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }
        });
        
        this.modal = $.div({
            style: {
                background: 'var(--bg-primary)',
                border: '2px solid var(--text-accent)',
                padding: '30px',
                minWidth: '400px',
                maxWidth: '500px'
            }
        }, [
            $.h2({ style: { marginBottom: '20px' } }, ['Set Wallet Password']),
            
            $.p({
                style: {
                    color: 'var(--text-dim)',
                    marginBottom: '20px',
                    fontSize: '14px'
                }
            }, ['Set a password to protect sensitive operations like viewing seed phrases and sending transactions.']),
            
            $.div({ style: { marginBottom: '15px' } }, [
                $.label({ style: { display: 'block', marginBottom: '5px' } }, ['New Password']),
                $.input({
                    id: 'new-password',
                    type: 'password',
                    placeholder: 'Enter password (min 8 characters)',
                    style: {
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace'
                    }
                })
            ]),
            
            $.div({ style: { marginBottom: '15px' } }, [
                $.label({ style: { display: 'block', marginBottom: '5px' } }, ['Confirm Password']),
                $.input({
                    id: 'confirm-password',
                    type: 'password',
                    placeholder: 'Confirm password',
                    style: {
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace'
                    }
                })
            ]),
            
            $.div({
                id: 'password-error',
                style: {
                    color: '#ff4444',
                    fontSize: '12px',
                    marginBottom: '20px',
                    display: 'none'
                }
            }),
            
            $.div({
                style: {
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }
            }, [
                $.button({
                    style: {
                        background: 'transparent',
                        border: '2px solid var(--text-accent)',
                        color: 'var(--text-accent)',
                        padding: '10px 20px',
                        cursor: 'pointer'
                    },
                    onclick: () => this.setNewPassword()
                }, ['Set Password']),
                
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--text-dim)',
                        color: 'var(--text-dim)',
                        padding: '10px 20px',
                        cursor: 'pointer'
                    },
                    onclick: () => {
                        this.close();
                        this.options.onCancel();
                    }
                }, ['Skip'])
            ])
        ]);
        
        this.backdrop.appendChild(this.modal);
        document.body.appendChild(this.backdrop);
    }
    
    setNewPassword() {
        const newPwd = document.getElementById('new-password')?.value;
        const confirmPwd = document.getElementById('confirm-password')?.value;
        
        if (!newPwd || !confirmPwd) {
            this.showError('Please fill in both password fields');
            return;
        }
        
        if (newPwd.length < 8) {
            this.showError('Password must be at least 8 characters');
            return;
        }
        
        if (newPwd !== confirmPwd) {
            this.showError('Passwords do not match');
            return;
        }
        
        try {
            this.app.state.setWalletPassword(newPwd);
            this.app.showNotification('Password set successfully', 'success');
            this.close();
            this.options.onSuccess();
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('password-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
    
    cancel() {
        this.close();
        this.options.onCancel();
    }
    
    close() {
        if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
            this.modal = null;
        }
    }
}
```

### 3. Protect Sensitive Operations

Update sensitive operations to require password verification:

#### For Viewing Seed Phrase:

```javascript
// In the showSeedPhrase method
showSeedPhrase() {
    const passwordModal = new PasswordModal(this.app, {
        title: 'Password Required',
        message: 'Enter your password to view seed phrase',
        onSuccess: () => {
            // Show the actual seed phrase
            this.displaySeedPhrase();
        },
        onCancel: () => {
            this.app.showNotification('Password required to view seed phrase', 'error');
        }
    });
    
    passwordModal.show();
}

displaySeedPhrase() {
    // Existing code to show seed phrase
    const seedElement = document.getElementById('seed-phrase-display');
    if (seedElement && this.currentAccount) {
        seedElement.textContent = this.currentAccount.mnemonic || 'No seed phrase available';
        seedElement.style.filter = 'none';
    }
}
```

#### For Send Transactions:

```javascript
// Update processSend method
async processSend() {
    const address = document.getElementById('recipient-address')?.value;
    const amount = document.getElementById('send-amount')?.value;
    
    // Validate inputs first
    if (!address || !amount) {
        this.app.showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Require password for sending
    const passwordModal = new PasswordModal(this.app, {
        title: 'Confirm Transaction',
        message: `Enter password to send ${amount} BTC to ${this.formatAddress(address)}`,
        onSuccess: () => {
            this.executeTransaction(address, amount);
        },
        onCancel: () => {
            this.app.showNotification('Transaction cancelled', 'info');
        }
    });
    
    passwordModal.show();
}

async executeTransaction(address, amount) {
    // Actual transaction sending code here
    // ... existing transaction code ...
}
```

#### For Exporting Private Keys:

```javascript
// In the export private key method
exportPrivateKey(keyType) {
    const passwordModal = new PasswordModal(this.app, {
        title: 'Export Private Key',
        message: 'Enter password to export private key',
        onSuccess: () => {
            this.displayPrivateKey(keyType);
        },
        onCancel: () => {
            this.app.showNotification('Password required to export private key', 'error');
        }
    });
    
    passwordModal.show();
}
```

### 4. Add Password Settings

Add a settings option to change password:

```javascript
// In WalletSettingsModal
createPasswordSettings() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ style: { marginBottom: '30px' } }, [
        $.h3({ style: { marginBottom: '15px' } }, ['Security Settings']),
        
        $.div({ style: { marginBottom: '15px' } }, [
            $.button({
                style: {
                    background: 'transparent',
                    border: '1px solid var(--text-primary)',
                    color: 'var(--text-primary)',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    marginRight: '10px'
                },
                onclick: () => this.changePassword()
            }, [this.app.state.hasPassword() ? 'Change Password' : 'Set Password']),
            
            this.app.state.hasPassword() && $.button({
                style: {
                    background: 'transparent',
                    border: '1px solid #ff4444',
                    color: '#ff4444',
                    padding: '10px 20px',
                    cursor: 'pointer'
                },
                onclick: () => this.removePassword()
            }, ['Remove Password'])
        ])
    ]);
}

changePassword() {
    if (this.app.state.hasPassword()) {
        // First verify current password
        const verifyModal = new PasswordModal(this.app, {
            title: 'Verify Current Password',
            message: 'Enter your current password',
            onSuccess: () => {
                // Then show new password dialog
                const changeModal = new PasswordModal(this.app, {
                    title: 'Set New Password',
                    requireNewPassword: true,
                    onSuccess: () => {
                        this.app.showNotification('Password changed successfully', 'success');
                    }
                });
                changeModal.show();
            }
        });
        verifyModal.show();
    } else {
        // No current password, just set new one
        const setModal = new PasswordModal(this.app, {
            title: 'Set Wallet Password',
            requireNewPassword: true,
            onSuccess: () => {
                this.app.showNotification('Password set successfully', 'success');
            }
        });
        setModal.show();
    }
}
```

### 5. Auto-lock Feature

Add auto-lock after inactivity:

```javascript
// Add to MooshWalletApp initialization
initializeAutoLock() {
    let activityTimer;
    const lockTimeout = 5 * 60 * 1000; // 5 minutes
    
    const resetTimer = () => {
        clearTimeout(activityTimer);
        activityTimer = setTimeout(() => {
            if (this.state.hasPassword()) {
                this.lockWallet();
            }
        }, lockTimeout);
    };
    
    // Monitor user activity
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
}

lockWallet() {
    // Clear sensitive data from memory
    this.state.clearPassword();
    
    // Show lock screen
    const passwordModal = new PasswordModal(this, {
        title: 'Wallet Locked',
        message: 'Enter password to unlock wallet',
        onSuccess: () => {
            this.showNotification('Wallet unlocked', 'success');
        },
        onCancel: () => {
            // Redirect to home if cancelled
            this.router.navigate('/');
        }
    });
    
    passwordModal.show();
}
```

## Security Best Practices

1. **Never store passwords in plain text**
2. **Use sessionStorage instead of localStorage**
3. **Clear passwords on timeout**
4. **Limit password attempts**
5. **Use strong password requirements**
6. **Consider biometric authentication for mobile**

## Testing

1. Set a password in wallet settings
2. Try viewing seed phrase - should ask for password
3. Try sending a transaction - should ask for password
4. Wait 15 minutes - password should timeout
5. Enter wrong password 3 times - should lock out