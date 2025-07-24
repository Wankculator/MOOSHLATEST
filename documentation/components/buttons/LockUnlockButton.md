# Lock/Unlock Button

## Overview
The Lock/Unlock Button manages wallet security by locking the wallet when not in use and unlocking it with password verification. It's a critical security component.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 
  - 4152-4161 (Unlock button in lock screen)
  - 9369-9372 (Lock button in settings)

### Visual Specifications

#### Unlock Button
- **Class**: `btn-primary`
- **Background**: Black (`#000000`)
- **Border**: 2px solid `#f57315`
- **Text Color**: `#f57315`
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px
- **Font Weight**: 600
- **Padding**: 12px
- **Width**: 100%
- **Border Radius**: 0

#### Lock Button
- **Class**: `btn-secondary`
- **Background**: Black with red border on hover
- **Text**: "Lock Wallet"
- **Icon**: 🔒 (optional)

### Unlock Button Implementation

```javascript
$.button({
    className: 'btn-primary',
    style: 'width: 100%; padding: 12px; background: #000000; border: 2px solid #f57315; color: #f57315; font-family: JetBrains Mono, monospace; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border-radius: 0;',
    onclick: () => this.handleUnlock(),
    onmouseover: (e) => { 
        e.target.style.background = '#f57315';
        e.target.style.color = '#000000';
    },
    onmouseout: (e) => { 
        e.target.style.background = '#000000';
        e.target.style.color = '#f57315';
    }
}, ['Unlock'])
```

### Lock Button Implementation

```javascript
$.button({
    className: 'btn-secondary',
    onclick: () => this.logout(),
    style: {
        background: '#000000',
        border: '2px solid #ff4444',
        color: '#ff4444',
        padding: '12px 24px',
        width: '100%',
        transition: 'all 0.2s ease'
    }
}, ['Lock Wallet'])
```

### Click Handlers

#### handleUnlock()
```javascript
async handleUnlock() {
    const passwordInput = document.getElementById('lockPassword');
    const password = passwordInput.value;
    
    if (!password) {
        this.showError('Please enter your password');
        return;
    }
    
    try {
        // Verify password
        const isValid = await this.verifyPassword(password);
        
        if (isValid) {
            // Decrypt wallet data
            await this.decryptWallet(password);
            
            // Update UI state
            this.app.state.set('isLocked', false);
            this.app.state.set('lastActivity', Date.now());
            
            // Navigate to dashboard
            this.app.navigate('dashboard');
            
            // Start auto-lock timer
            this.startAutoLockTimer();
        } else {
            this.showError('Incorrect password');
            this.incrementFailedAttempts();
        }
    } catch (error) {
        this.showError('Failed to unlock wallet');
    }
}
```

#### logout() / Lock Wallet
```javascript
logout() {
    // Clear sensitive data from memory
    this.clearSensitiveData();
    
    // Update state
    this.app.state.set('isLocked', true);
    
    // Clear auto-lock timer
    this.clearAutoLockTimer();
    
    // Navigate to lock screen
    this.app.navigate('lock');
    
    // Show confirmation
    this.showToast('Wallet locked successfully', 'success');
}
```

### Security Features
- Password verification before unlock
- Failed attempt tracking
- Account lockout after 5 failed attempts
- Auto-lock after inactivity (5 minutes default)
- Memory clearing on lock
- Secure password hashing

### States
1. **Locked**: Wallet inaccessible, password required
2. **Unlocking**: Password verification in progress
3. **Unlocked**: Full wallet access granted
4. **Failed**: Incorrect password entered
5. **Lockout**: Too many failed attempts

### Auto-Lock Settings
- Configurable timeout (1-60 minutes)
- Activity detection
- Manual lock option
- Lock on browser close
- Lock on network change

### Accessibility Features
- Password field auto-focus on lock screen
- Enter key submits password
- Clear error messages
- Screen reader announcements
- Keyboard navigation

### Mobile Optimizations
- Biometric unlock option (Face ID/Touch ID)
- PIN code alternative
- Large touch targets
- Auto-hide keyboard after unlock

### Error Handling
- Clear password validation
- Network error recovery
- Lockout countdown display
- Password recovery option

### Related Components
- Lock Screen
- Password Input
- Auto-Lock Timer
- Settings Panel
- Biometric Prompt