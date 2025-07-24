# WalletLockOverlay

**Status**: 🟢 Active
**Type**: Security UI Component
**Location**: /public/js/moosh-wallet.js:4050-4328
**Mobile Support**: Yes
**Theme Support**: Dark/Light

## Visual Design

```
┌─────────────────────────────────────────────────────────┐
│                    Full Screen Overlay                   │
│                   (blur background)                      │
│                                                         │
│        ┌─────────────────────────────────┐            │
│        │ ~/moosh/security $              │            │
│        ├─────────────────────────────────┤            │
│        │                                 │            │
│        │         [MOOSH LOGO]           │            │
│        │                                 │            │
│        │       Wallet Locked            │            │
│        │  Enter your password to unlock  │            │
│        │                                 │            │
│        │  ┌─────────────────┬──────┐   │            │
│        │  │ ••••••••••••••  │ Show │   │            │
│        │  └─────────────────┴──────┘   │            │
│        │                                 │            │
│        │  [    UNLOCK WALLET    ]       │            │
│        │                                 │            │
│        │     3 attempts remaining       │            │
│        └─────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Structure
- **Container**: `div.wallet-lock-overlay` (full screen)
- **Children**: 
  - Terminal-styled lock box (`div.terminal-box.wallet-lock-container`)
  - Header with terminal prompt
  - Logo and title section
  - Password input with toggle visibility
  - Error message container
  - Unlock button
  - Attempts counter
- **Layout**: Fixed positioning, centered flexbox

## Styling
- **Base Classes**: 
  - `wallet-lock-overlay` - Full screen backdrop
  - `terminal-box` - Terminal-styled container
  - `wallet-lock-container` - Lock screen specific styling
  - `lock-attempts` - Attempts counter
  - `lock-shake` - Shake animation on failure
- **Responsive**: Adapts to mobile screens (90% width, max 480px)
- **Animations**: 
  - Shake animation on incorrect password (500ms)
  - Backdrop blur effect

## State Management
- **States**: 
  - Locked (visible)
  - Unlocking (processing)
  - Unlocked (removed)
  - Error states (1-5 failed attempts)
- **Updates**: 
  - Real-time attempt counter
  - Error messages with auto-dismiss
  - Password visibility toggle

## Implementation
```javascript
class WalletLockScreen extends Component {
    constructor(app) {
        super(app);
        this.failedAttempts = 0;
        this.maxAttempts = 5;
    }

    handleUnlock() {
        const enteredPassword = passwordInput.value;
        const storedPassword = localStorage.getItem('walletPassword');
        
        if (enteredPassword === storedPassword) {
            // Success flow
            sessionStorage.setItem('walletUnlocked', 'true');
            this.app.showNotification('Wallet unlocked successfully', 'success');
            lockOverlay.remove();
            document.body.style.overflow = 'auto';
            this.app.continueInitAfterUnlock();
        } else {
            // Failure flow
            this.failedAttempts++;
            if (this.failedAttempts >= this.maxAttempts) {
                this.handleMaxAttemptsReached();
            } else {
                this.showError('Incorrect password');
                this.updateAttemptsDisplay();
                this.shakeContainer();
            }
        }
    }
}
```

## Security Features
1. **Password Protection**: Validates against stored password
2. **Attempt Limiting**: Max 5 attempts before lockout
3. **Visual Feedback**: 
   - Color coding for remaining attempts
   - Shake animation on failure
   - Clear error messaging
4. **Session Management**: Uses sessionStorage for unlock state
5. **Auto-clear**: Clears password field on failure

## Accessibility
- **ARIA Labels**: Implicit through semantic HTML
- **Keyboard Support**: 
  - Enter key submits password
  - Tab navigation between fields
  - Focus management on input
- **Screen Reader**: Clear labels and error messages
- **Visual Indicators**: 
  - High contrast borders (#f57315)
  - Clear focus states
  - Color-coded warnings

## Performance
- **Render Strategy**: Immediate blocking render
- **Updates**: Minimal DOM updates (only error/attempts)
- **Cleanup**: Removes overlay completely on unlock
- **Memory**: Clears password references after validation

## Connected Components
- **Parent**: MooshWallet main app
- **Children**: None
- **Events**: 
  - Triggers `continueInitAfterUnlock()` on success
  - Shows notifications via `app.showNotification()`
- **Dependencies**: 
  - localStorage for password validation
  - sessionStorage for unlock state

## Error Handling
```javascript
showError(message) {
    const errorContainer = document.getElementById('lockErrorContainer');
    if (errorContainer) {
        errorContainer.innerHTML = '';
        const errorDiv = ElementFactory.div({ 
            style: 'color: #ff4444; font-size: 12px; text-align: center;'
        }, [message]);
        errorContainer.appendChild(errorDiv);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            errorContainer.innerHTML = '';
        }, 3000);
    }
}
```

## CSS Requirements
```css
.wallet-lock-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(5px);
    z-index: 999999;
}

.lock-attempts.warning {
    color: #ff9800;
}

.lock-attempts.danger {
    color: #ff4444;
    font-weight: bold;
}

.lock-shake {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}
```

## Mobile Considerations
- Touch-friendly button sizes (min 44px height)
- Password visibility toggle for mobile typing
- Responsive container width (90% on mobile)
- Prevents body scroll while locked
- Optimized for portrait orientation