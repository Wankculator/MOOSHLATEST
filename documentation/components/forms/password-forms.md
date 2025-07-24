# Password Forms Documentation

## Overview
Password forms in MOOSH Wallet are used for wallet security, including lock screen authentication, wallet creation, and settings protection.

## 1. Lock Screen Password

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 4112-4115
- **Component**: LockScreen

### Implementation
```javascript
$.input({
    type: 'password',
    id: 'lockPassword',
    placeholder: 'Enter password',
    className: 'lock-password-input',
    autofocus: true,
    onkeypress: (e) => {
        if (e.key === 'Enter') {
            this.handleUnlock();
        }
    }
})
```

### Attributes
- **Type**: `password`
- **ID**: `lockPassword`
- **Placeholder**: "Enter password"
- **Autofocus**: Yes
- **Keyboard Behavior**: Enter key triggers unlock

### Validation
- Minimum length: 8 characters
- No maximum length enforced
- Case-sensitive comparison
- No special character requirements

### Security
- Password never logged
- Failed attempts tracked
- Rate limiting after 5 failed attempts
- Auto-lock after inactivity

### Error Messages
- "Incorrect password" - Invalid password
- "Too many attempts. Please wait." - Rate limited
- "Password cannot be empty" - Empty submission

---

## 2. Wallet Creation Password

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 7208-7211, 26002-26022
- **Component**: CreatePasswordModal

### Implementation
```javascript
// New password input
$.input({
    id: 'new-password',
    type: 'password',
    placeholder: 'Enter password (min 8 characters)',
    className: 'form-input',
    autocomplete: 'new-password',
    oninput: () => this.validatePasswords()
})

// Confirm password input
$.input({
    id: 'confirm-password',
    type: 'password',
    placeholder: 'Confirm password',
    className: 'form-input',
    autocomplete: 'new-password',
    oninput: () => this.validatePasswords()
})
```

### Validation Rules
```javascript
validatePasswords() {
    const password = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    
    // Length validation
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }
    
    // Match validation
    if (password !== confirm) {
        return { valid: false, error: 'Passwords do not match' };
    }
    
    // Strength check (optional)
    const strength = this.calculatePasswordStrength(password);
    
    return { valid: true, strength };
}
```

### Password Strength Indicators
- **Weak**: < 8 chars or common patterns
- **Medium**: 8-12 chars with mixed case
- **Strong**: 12+ chars with numbers/symbols

### Security Requirements
- Minimum 8 characters
- Real-time validation feedback
- Strength meter display
- No password history
- Secure storage using bcrypt/argon2

---

## 3. Settings Password Verification

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 12058-12061, 14207-14210, 15847-15850
- **Component**: Settings panels

### Implementation
```javascript
$.input({
    type: 'password',
    id: 'settingsPasswordInput',
    placeholder: 'Enter password',
    className: 'setting-password-input',
    onkeypress: (e) => {
        if (e.key === 'Enter') {
            this.verifySettingsPassword();
        }
    }
})
```

### Use Cases
- Viewing seed phrase
- Exporting private keys
- Changing security settings
- Deleting wallets

### Validation
- Compares against stored password hash
- Single attempt before re-prompting
- Session-based authentication

---

## 4. Transaction Verification Password

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10363-10366
- **Component**: TransactionConfirmationModal

### Implementation
```javascript
$.input({
    type: 'password',
    id: 'verify-password',
    className: 'form-input',
    placeholder: 'Enter password to confirm',
    autocomplete: 'off'
})
```

### Security Features
- Required for transactions > 0.01 BTC
- No caching of password
- Cleared immediately after use
- Timeout after 60 seconds

---

## Common Security Patterns

### 1. Password Hashing
```javascript
async hashPassword(password) {
    const salt = crypto.randomBytes(32);
    const hash = await crypto.pbkdf2(password, salt, 100000, 64, 'sha512');
    return { salt: salt.toString('hex'), hash: hash.toString('hex') };
}
```

### 2. Secure Comparison
```javascript
async verifyPassword(password, storedHash, storedSalt) {
    const hash = await crypto.pbkdf2(
        password, 
        Buffer.from(storedSalt, 'hex'), 
        100000, 
        64, 
        'sha512'
    );
    return crypto.timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
}
```

### 3. Password Input Clearing
```javascript
clearPasswordFields() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.value = '';
        input.blur();
    });
}
```

## Mobile Considerations

### Keyboard Behavior
- Auto-capitalize: off
- Auto-correct: off
- Spell check: off
- Password managers: supported

### Touch ID / Face ID
- Biometric unlock option
- Fallback to password
- Secure enclave storage

## Accessibility

### Screen Reader Support
```javascript
$.input({
    type: 'password',
    'aria-label': 'Wallet password',
    'aria-describedby': 'password-requirements',
    'aria-invalid': hasError ? 'true' : 'false'
})
```

### Keyboard Navigation
- Tab order maintained
- Enter key submission
- Escape key cancellation
- Focus trap in modals

## Testing Checklist

- [ ] Minimum length validation
- [ ] Maximum length handling
- [ ] Special character support
- [ ] Copy/paste disabled
- [ ] Autocomplete behavior
- [ ] Mobile keyboard type
- [ ] Password visibility toggle
- [ ] Error message clarity
- [ ] Session timeout
- [ ] Memory cleanup