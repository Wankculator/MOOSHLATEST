# Component: Security Features

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 5500-6000 (Lock screen, password protection)
- `/public/js/moosh-wallet.js` - Lines 10000-10500 (Privacy mode)
- `/src/server/services/securityService.js` - Encryption and key management

## Overview
MOOSH Wallet implements multiple layers of security to protect user funds and privacy, including password protection, automatic locking, privacy mode, and secure key storage.

## Security Architecture

### Core Security Components
1. **Lock Screen** - Session timeout and manual locking
2. **Password Protection** - Wallet encryption with user password
3. **Privacy Mode** - Hide sensitive information
4. **Secure Storage** - Encrypted key management
5. **Session Management** - Auto-logout and timeout

## Implementation Details

### Lock Screen System
```javascript
class LockScreen {
    constructor(app) {
        this.app = app;
        this.lockTimeout = 15 * 60 * 1000; // 15 minutes
        this.lastActivity = Date.now();
        this.isLocked = false;
        
        this.initializeActivityMonitor();
    }
    
    initializeActivityMonitor() {
        // Monitor user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            });
        });
        
        // Check for timeout every minute
        setInterval(() => {
            if (Date.now() - this.lastActivity > this.lockTimeout) {
                this.lockWallet();
            }
        }, 60000);
    }
    
    lockWallet() {
        this.isLocked = true;
        this.app.state.set('isLocked', true);
        
        // Clear sensitive data from memory
        this.clearSensitiveData();
        
        // Show lock screen
        this.showLockScreen();
    }
}
```

### Password Protection
```javascript
class PasswordManager {
    async setPassword(password) {
        // Validate password strength
        if (!this.validatePasswordStrength(password)) {
            throw new Error('Password does not meet security requirements');
        }
        
        // Generate salt
        const salt = crypto.randomBytes(32);
        
        // Derive key using PBKDF2
        const key = await this.deriveKey(password, salt);
        
        // Store hashed password
        const hash = await this.hashPassword(password, salt);
        await this.storage.setPasswordHash(hash, salt);
        
        return key;
    }
    
    validatePasswordStrength(password) {
        const requirements = {
            minLength: 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*]/.test(password)
        };
        
        return password.length >= requirements.minLength &&
               requirements.hasUpperCase &&
               requirements.hasLowerCase &&
               requirements.hasNumbers;
    }
}
```

### Privacy Mode Implementation
```javascript
class PrivacyMode {
    constructor(app) {
        this.app = app;
        this.isEnabled = false;
        this.hiddenElements = new Map();
    }
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.hidePrivateInfo();
        } else {
            this.showPrivateInfo();
        }
        
        this.app.state.set('privacyMode', this.isEnabled);
    }
    
    hidePrivateInfo() {
        // Hide balances
        document.querySelectorAll('.balance-amount').forEach(el => {
            this.hiddenElements.set(el, el.textContent);
            el.textContent = '••••••';
        });
        
        // Hide addresses
        document.querySelectorAll('.address-display').forEach(el => {
            const original = el.textContent;
            this.hiddenElements.set(el, original);
            el.textContent = original.substring(0, 6) + '...' + original.slice(-4);
        });
        
        // Hide transaction amounts
        document.querySelectorAll('.tx-amount').forEach(el => {
            this.hiddenElements.set(el, el.textContent);
            el.textContent = '•••';
        });
    }
}
```

## Visual Specifications

### Lock Screen UI
```css
.lock-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.lock-form {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    padding: 40px;
    width: 90%;
    max-width: 400px;
    text-align: center;
}

.password-input {
    width: 100%;
    padding: 12px;
    margin: 20px 0;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
}

.unlock-button {
    background: var(--text-accent);
    color: var(--bg-primary);
    border: none;
    padding: 12px 30px;
    cursor: pointer;
    font-weight: 600;
}
```

### Privacy Mode Indicators
```css
.privacy-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(233, 69, 96, 0.9);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
}

.hidden-value {
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 2px;
    opacity: 0.6;
}
```

## DOM Structure

### Lock Screen
```html
<div class="lock-screen">
    <div class="lock-form">
        <img src="images/Moosh-logo.png" class="lock-logo">
        <h2>Wallet Locked</h2>
        <p>Enter your password to unlock</p>
        <input type="password" class="password-input" placeholder="Password">
        <button class="unlock-button">Unlock</button>
        <div class="lock-footer">
            <a href="#" class="forgot-password">Forgot password?</a>
        </div>
    </div>
</div>
```

### Security Settings Panel
```html
<div class="security-settings">
    <div class="setting-item">
        <label>Auto-lock timeout</label>
        <select class="timeout-select">
            <option value="300000">5 minutes</option>
            <option value="900000">15 minutes</option>
            <option value="1800000">30 minutes</option>
            <option value="3600000">1 hour</option>
        </select>
    </div>
    
    <div class="setting-item">
        <label>Privacy mode</label>
        <button class="toggle-privacy">
            <span class="toggle-icon">👁</span>
        </button>
    </div>
    
    <div class="setting-item">
        <label>Change password</label>
        <button class="change-password-btn">Change</button>
    </div>
</div>
```

## Encryption Standards

### Key Derivation
```javascript
async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        true,
        ['encrypt', 'decrypt']
    );
}
```

### Secure Storage
```javascript
class SecureStorage {
    async storeEncrypted(key, data, password) {
        const salt = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const derivedKey = await this.deriveKey(password, salt);
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            derivedKey,
            new TextEncoder().encode(JSON.stringify(data))
        );
        
        const storageData = {
            encrypted: Array.from(new Uint8Array(encrypted)),
            salt: Array.from(salt),
            iv: Array.from(iv)
        };
        
        localStorage.setItem(key, JSON.stringify(storageData));
    }
}
```

## Session Management
```javascript
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.maxSessionAge = 15 * 60 * 1000; // 15 minutes
    }
    
    createSession(walletId) {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const session = {
            id: sessionId,
            walletId: walletId,
            created: Date.now(),
            lastActivity: Date.now()
        };
        
        this.sessions.set(sessionId, session);
        return sessionId;
    }
    
    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;
        
        if (Date.now() - session.lastActivity > this.maxSessionAge) {
            this.sessions.delete(sessionId);
            return false;
        }
        
        session.lastActivity = Date.now();
        return true;
    }
}
```

## Security Best Practices

1. **Never store plaintext passwords**
2. **Use crypto.randomBytes() for all randomness**
3. **Clear sensitive data from memory after use**
4. **Implement rate limiting for password attempts**
5. **Use secure headers (CSP, HSTS, etc.)**
6. **Validate all inputs on both client and server**
7. **Implement proper CORS policies**

## Testing
```bash
# Test encryption/decryption
npm run test:security:encryption

# Test password validation
npm run test:security:password

# Test session management
npm run test:security:session

# Test privacy mode
npm run test:security:privacy
```

## Known Security Considerations
1. Password recovery needs secure implementation
2. Hardware wallet integration pending
3. 2FA support planned but not implemented
4. Biometric authentication for mobile planned

## Git Recovery Commands
```bash
# Restore security features
git checkout 0f92f5d -- public/js/moosh-wallet.js

# View security implementation history
git log -p --grep="security\|password\|encryption" -- public/js/moosh-wallet.js

# Restore security service
git checkout HEAD -- src/server/services/securityService.js
```

## Related Components
- [Password Modal](../modals/PasswordModal.md)
- [Settings Modal](../modals/SettingsModal.md)
- [Lock/Unlock Button](../buttons/LockUnlockButton.md)
- [Privacy Toggle Button](../buttons/PrivacyToggleButton.md)