# WalletLockScreen

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 4050-4321)

## Overview
The WalletLockScreen provides a secure authentication interface that prevents unauthorized access to wallet data. It appears automatically when the app detects existing wallets but no active session, requiring users to enter their password to unlock access.

## Class Definition

```javascript
class WalletLockScreen extends Component {
    constructor(app) {
        super(app);
        this.failedAttempts = 0;
        this.maxAttempts = 5;
    }
}
```

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `app` | MOOSHWalletApp | Main application instance |
| `failedAttempts` | Number | Count of failed unlock attempts |
| `maxAttempts` | Number | Maximum attempts before lockout |
| `lockoutEndTime` | Number | Timestamp when lockout ends |
| `element` | HTMLElement | Lock screen overlay element |

## Core Methods

### `render()`
Creates the lock screen overlay interface.

```javascript
render() {
    const $ = window.ElementFactory || ElementFactory;
    
    this.element = $.div({ 
        className: 'wallet-lock-overlay',
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease-out'
        }
    }, [
        this.createLockCard()
    ]);
    
    // Add keyboard event listener
    this.setupKeyboardHandling();
    
    return this.element;
}
```

### `createLockCard()`
Creates the main lock card with password input.

```javascript
createLockCard() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({
        className: 'lock-card',
        style: {
            background: 'var(--bg-secondary)',
            borderRadius: 'calc(16px * var(--scale-factor))',
            padding: 'calc(40px * var(--scale-factor))',
            maxWidth: 'calc(400px * var(--scale-factor))',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.4s ease-out'
        }
    }, [
        this.createHeader(),
        this.createPasswordForm(),
        this.createFooter()
    ]);
}
```

### `createHeader()`
Creates the lock screen header with icon and title.

```javascript
createHeader() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({
        style: {
            textAlign: 'center',
            marginBottom: 'calc(32px * var(--scale-factor))'
        }
    }, [
        // Lock icon
        $.div({
            style: {
                width: 'calc(80px * var(--scale-factor))',
                height: 'calc(80px * var(--scale-factor))',
                margin: '0 auto calc(24px * var(--scale-factor)) auto',
                background: 'var(--accent-bg)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'calc(40px * var(--scale-factor))',
                border: '2px solid var(--border-active)'
            }
        }, ['🔒']),
        
        $.h2({
            style: {
                margin: '0 0 calc(8px * var(--scale-factor)) 0',
                fontSize: 'calc(24px * var(--scale-factor))',
                fontWeight: '600',
                color: 'var(--text-primary)'
            }
        }, ['Wallet Locked']),
        
        $.p({
            style: {
                margin: 0,
                fontSize: 'calc(14px * var(--scale-factor))',
                color: 'var(--text-dim)'
            }
        }, ['Enter your password to unlock'])
    ]);
}
```

### `createPasswordForm()`
Creates the password input form.

```javascript
createPasswordForm() {
    const $ = window.ElementFactory || ElementFactory;
    
    const isLocked = this.isCurrentlyLocked();
    
    return $.div({
        style: {
            marginBottom: 'calc(32px * var(--scale-factor))'
        }
    }, [
        // Password input group
        $.div({
            style: {
                position: 'relative',
                marginBottom: 'calc(16px * var(--scale-factor))'
            }
        }, [
            $.input({
                type: 'password',
                id: 'unlock-password',
                placeholder: 'Enter password',
                disabled: isLocked,
                autocomplete: 'current-password',
                style: {
                    width: '100%',
                    padding: 'calc(16px * var(--scale-factor))',
                    paddingRight: 'calc(50px * var(--scale-factor))',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'calc(8px * var(--scale-factor))',
                    color: 'var(--text-secondary)',
                    fontSize: 'calc(16px * var(--scale-factor))',
                    fontFamily: 'monospace',
                    transition: 'border-color 0.2s ease'
                },
                onfocus: (e) => {
                    e.target.style.borderColor = 'var(--border-active)';
                },
                onblur: (e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                },
                onkeypress: (e) => {
                    if (e.key === 'Enter' && !isLocked) {
                        this.handleUnlock();
                    }
                }
            }),
            
            // Show/hide password toggle
            this.createPasswordToggle()
        ]),
        
        // Error message
        $.div({
            id: 'unlock-error',
            style: {
                minHeight: 'calc(20px * var(--scale-factor))',
                fontSize: 'calc(14px * var(--scale-factor))',
                color: '#F44336',
                textAlign: 'center',
                marginBottom: 'calc(16px * var(--scale-factor))'
            }
        }),
        
        // Unlock button
        $.button({
            className: 'btn-primary',
            onclick: () => this.handleUnlock(),
            disabled: isLocked,
            style: {
                width: '100%',
                padding: 'calc(16px * var(--scale-factor))',
                fontSize: 'calc(16px * var(--scale-factor))',
                fontWeight: '500',
                opacity: isLocked ? '0.5' : '1',
                cursor: isLocked ? 'not-allowed' : 'pointer'
            }
        }, [isLocked ? this.getLockoutMessage() : 'Unlock Wallet'])
    ]);
}
```

### `handleUnlock()`
Processes the unlock attempt.

```javascript
async handleUnlock() {
    const passwordInput = document.getElementById('unlock-password');
    const errorDiv = document.getElementById('unlock-error');
    const password = passwordInput.value;
    
    if (!password) {
        this.showError('Please enter your password');
        return;
    }
    
    // Show loading state
    this.showLoadingState();
    
    try {
        // Verify password against all wallets
        const isValid = await this.verifyPassword(password);
        
        if (isValid) {
            // Success - unlock wallet
            this.unlockSuccess();
        } else {
            // Failed attempt
            this.handleFailedAttempt();
        }
    } catch (error) {
        console.error('[WalletLockScreen] Unlock error:', error);
        this.showError('An error occurred. Please try again.');
        this.hideLoadingState();
    }
}
```

### `verifyPassword(password)`
Verifies the password against stored wallets.

```javascript
async verifyPassword(password) {
    const wallets = this.app.walletManager.getAllWallets();
    
    // Check password against each wallet
    for (const wallet of wallets) {
        try {
            // Attempt to decrypt wallet data with password
            const decrypted = await this.app.walletManager.decryptWallet(wallet.id, password);
            if (decrypted) {
                // Password is correct for at least one wallet
                this.app.walletManager.setMasterPassword(password);
                return true;
            }
        } catch (error) {
            // Continue checking other wallets
            continue;
        }
    }
    
    return false;
}
```

### `handleFailedAttempt()`
Handles failed unlock attempts with progressive lockout.

```javascript
handleFailedAttempt() {
    this.failedAttempts++;
    const remainingAttempts = this.maxAttempts - this.failedAttempts;
    
    if (remainingAttempts <= 0) {
        // Implement lockout
        this.implementLockout();
    } else {
        // Show error with remaining attempts
        const message = remainingAttempts === 1 
            ? 'Incorrect password. 1 attempt remaining.'
            : `Incorrect password. ${remainingAttempts} attempts remaining.`;
        
        this.showError(message);
        
        // Shake animation
        this.shakeCard();
        
        // Clear password field
        const passwordInput = document.getElementById('unlock-password');
        passwordInput.value = '';
        passwordInput.focus();
    }
    
    this.hideLoadingState();
}
```

### `implementLockout()`
Implements progressive lockout after max failed attempts.

```javascript
implementLockout() {
    // Calculate lockout duration (exponential backoff)
    const lockoutCount = parseInt(localStorage.getItem('lockoutCount') || '0');
    const lockoutMinutes = Math.min(Math.pow(2, lockoutCount) * 5, 60); // Max 60 minutes
    
    this.lockoutEndTime = Date.now() + (lockoutMinutes * 60 * 1000);
    
    // Save lockout info
    localStorage.setItem('lockoutEndTime', this.lockoutEndTime.toString());
    localStorage.setItem('lockoutCount', (lockoutCount + 1).toString());
    
    // Update UI
    this.showLockoutState();
    
    // Start countdown timer
    this.startLockoutTimer();
}
```

### `unlockSuccess()`
Handles successful unlock.

```javascript
unlockSuccess() {
    // Set session flag
    sessionStorage.setItem('walletUnlocked', 'true');
    sessionStorage.setItem('unlockTime', Date.now().toString());
    
    // Reset failed attempts and lockout
    this.failedAttempts = 0;
    localStorage.removeItem('lockoutCount');
    localStorage.removeItem('lockoutEndTime');
    
    // Animate out
    this.element.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        // Remove lock screen
        this.element.remove();
        
        // Notify app
        this.app.onWalletUnlocked();
        
        // Navigate to dashboard if on home page
        if (window.location.pathname === '/') {
            this.app.navigateTo('/dashboard');
        }
    }, 300);
}
```

### `createPasswordToggle()`
Creates the show/hide password toggle button.

```javascript
createPasswordToggle() {
    const $ = window.ElementFactory || ElementFactory;
    let isVisible = false;
    
    return $.button({
        type: 'button',
        className: 'password-toggle',
        onclick: (e) => {
            const input = document.getElementById('unlock-password');
            isVisible = !isVisible;
            input.type = isVisible ? 'text' : 'password';
            e.target.textContent = isVisible ? '👁️‍🗨️' : '👁️';
        },
        style: {
            position: 'absolute',
            right: 'calc(12px * var(--scale-factor))',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: 'calc(20px * var(--scale-factor))',
            padding: 'calc(4px * var(--scale-factor))'
        }
    }, ['👁️']);
}
```

## Security Features

### Auto-Lock Implementation
```javascript
setupAutoLock() {
    const AUTO_LOCK_TIME = 15 * 60 * 1000; // 15 minutes
    let lockTimer;
    
    const resetTimer = () => {
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => {
            this.app.lockWallet();
        }, AUTO_LOCK_TIME);
    };
    
    // Reset on user activity
    ['mousedown', 'keydown', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });
    
    // Start timer
    resetTimer();
}
```

### Biometric Authentication
```javascript
async checkBiometricSupport() {
    if ('credentials' in navigator) {
        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (available) {
                this.showBiometricOption();
            }
        } catch (error) {
            console.log('Biometric auth not available');
        }
    }
}
```

## Common Issues

### Issue: Password Input Not Focusing
**Problem**: Password field doesn't get focus on mobile
**Solution**: 
```javascript
// Force focus with delay
focusPasswordInput() {
    setTimeout(() => {
        const input = document.getElementById('unlock-password');
        if (input) {
            input.focus();
            // For iOS
            input.click();
        }
    }, 500);
}
```

### Issue: Lockout Timer Persists
**Problem**: Lockout continues after browser restart
**Solution**:
```javascript
// Check lockout on init
checkExistingLockout() {
    const lockoutEndTime = localStorage.getItem('lockoutEndTime');
    if (lockoutEndTime) {
        const remaining = parseInt(lockoutEndTime) - Date.now();
        if (remaining > 0) {
            this.lockoutEndTime = parseInt(lockoutEndTime);
            this.showLockoutState();
            this.startLockoutTimer();
        } else {
            // Lockout expired
            localStorage.removeItem('lockoutEndTime');
        }
    }
}
```

## Testing Approaches

### Unit Testing
```javascript
describe('WalletLockScreen', () => {
    let app, lockScreen;
    
    beforeEach(() => {
        app = new MOOSHWalletApp();
        app.walletManager = {
            decryptWallet: jest.fn(),
            setMasterPassword: jest.fn()
        };
        lockScreen = new WalletLockScreen(app);
    });
    
    test('should render lock screen', () => {
        const element = lockScreen.render();
        expect(element.querySelector('.lock-card')).toBeTruthy();
        expect(element.querySelector('#unlock-password')).toBeTruthy();
    });
    
    test('should handle failed attempts', () => {
        lockScreen.handleFailedAttempt();
        expect(lockScreen.failedAttempts).toBe(1);
        
        // Test lockout after max attempts
        lockScreen.failedAttempts = 4;
        lockScreen.handleFailedAttempt();
        expect(localStorage.getItem('lockoutEndTime')).toBeTruthy();
    });
    
    test('should verify password correctly', async () => {
        app.walletManager.decryptWallet.mockResolvedValueOnce(true);
        const result = await lockScreen.verifyPassword('correct');
        expect(result).toBe(true);
        expect(app.walletManager.setMasterPassword).toHaveBeenCalledWith('correct');
    });
});
```

## Best Practices

1. **Never log passwords** in any form
2. **Implement progressive lockout** to prevent brute force
3. **Clear sensitive data** from memory after use
4. **Use secure session storage** for unlock state
5. **Provide clear feedback** for all user actions

## UI/UX Enhancements

### Shake Animation
```javascript
shakeCard() {
    const card = this.element.querySelector('.lock-card');
    card.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        card.style.animation = '';
    }, 500);
}

// CSS for shake animation
const shakeKeyframes = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
```

### Loading State
```javascript
showLoadingState() {
    const button = this.element.querySelector('.btn-primary');
    button.disabled = true;
    button.innerHTML = `
        <span style="display: inline-block; animation: spin 1s linear infinite;">⟳</span>
        Verifying...
    `;
}
```

## Related Components

- [MOOSHWalletApp](./MOOSHWalletApp.md) - Main application
- [WalletManager](./WalletManager.md) - Wallet encryption/decryption
- [Router](./Router.md) - Navigation after unlock
- [SettingsManager](./SettingsManager.md) - Security settings
- [NotificationSystem](./NotificationSystem.md) - User feedback