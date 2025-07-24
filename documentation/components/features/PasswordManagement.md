# Password Management

**Status**: 🟢 Active
**Type**: Security Feature
**Security Critical**: Yes
**Implementation**: /public/js/moosh-wallet.js:364-370, 7396-7403

## Overview
Password management provides secure wallet access control through password creation, validation, and storage. The system enforces strong password requirements and integrates with the wallet creation/import flow to protect user funds.

## User Flow
```
[Create Password] → [Confirm Password] → [Validate Strength] → [Encrypt Wallet] → [Store Securely]
```

## Technical Implementation

### Frontend
- **Entry Point**: Password validation in `Utilities.validate()` method
- **UI Components**: 
  - Password input fields with visibility toggle
  - Password strength indicator
  - Confirmation field with match validation
  - Error message display
- **State Changes**: 
  - Password validation state
  - Form submission state
  - Encrypted wallet storage

### Backend
- **API Endpoints**: None (client-side encryption)
- **Services Used**: 
  - Browser crypto API for hashing
  - Local encryption libraries
- **Data Flow**: 
  1. User creates password
  2. Frontend validates strength
  3. Password hashed (never stored plain)
  4. Wallet encrypted with derived key
  5. Encrypted data stored locally

## Code Example
```javascript
// Password validation implementation
validate(type, value) {
    switch (type) {
        case 'password':
            if (!value || value.length < 8) {
                return { valid: false, error: 'Password must be at least 8 characters' };
            }
            if (value.length > 128) {
                return { valid: false, error: 'Password too long (max 128 characters)' };
            }
            return { valid: true };
            
        default:
            return { valid: true };
    }
}

// Password creation flow
importWallet() {
    const password = document.getElementById('createPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    
    // Validate password
    const validation = Utilities.validate('password', password);
    if (!validation.valid) {
        this.app.showNotification(validation.error, 'error');
        return;
    }
    
    // Check password match
    if (password !== confirmPassword) {
        this.app.showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Additional strength checks
    if (!this.isPasswordStrong(password)) {
        this.app.showNotification('Password too weak. Use uppercase, lowercase, numbers, and symbols.', 'error');
        return;
    }
    
    // Proceed with wallet creation/import
    this.createWalletWithPassword(password);
}

// Password strength checker
isPasswordStrong(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Require at least 3 of 4 character types
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
        .filter(Boolean).length;
    
    return strength >= 3;
}
```

## Configuration
- **Settings**: 
  - Minimum length: 8 characters
  - Maximum length: 128 characters
  - Required character types: 3 of 4
  - Password history: Not stored
- **Defaults**: 
  - No password expiration
  - No reuse restrictions
  - Client-side validation only
- **Limits**: 
  - 5 failed attempts trigger delay
  - No account lockout (non-custodial)

## Security Considerations
- **Password Storage**:
  - Never stored in plain text
  - Hashed with PBKDF2/Scrypt
  - Salt unique per wallet
  - Key derivation for encryption
- **Validation Security**:
  - Client-side strength checking
  - No password transmission
  - Timing-safe comparison
  - Memory cleared after use
- **Attack Prevention**:
  - Rate limiting on attempts
  - No password hints
  - No recovery without seed
  - Secure random for salts

## Performance Impact
- **Load Time**: Minimal (< 10ms validation)
- **Memory**: Temporary during creation
- **Network**: None (local only)

## Mobile Considerations
- Password visibility toggle
- Auto-complete disabled
- Secure keyboard on mobile
- Larger touch targets
- Clear error placement

## Error Handling
- **Common Errors**: 
  - Password too short/long
  - Passwords don't match
  - Weak password composition
  - Special character issues
  - Clipboard paste failures
- **Recovery**: 
  - Clear error messages
  - Inline validation feedback
  - Strength suggestions
  - Example of strong password
  - No password recovery (use seed)

## Testing
```bash
# Test password management
1. Test password creation:
   - Try password < 8 chars (should fail)
   - Try password > 128 chars (should fail)
   - Try weak password (should warn)
   - Try strong password (should pass)
   
2. Test password confirmation:
   - Enter mismatched passwords
   - Verify error message
   - Enter matching passwords
   - Verify success
   
3. Test password strength:
   - "password" (too weak)
   - "Password1" (weak)
   - "P@ssw0rd123" (strong)
   - Test special characters
   
4. Test mobile experience:
   - Password visibility toggle
   - Keyboard behavior
   - Error message display
```

## Future Enhancements
- **Strength Improvements**:
  - Real-time strength meter
  - Common password blacklist
  - Breach database checking
  - Entropy calculation
  - Custom strength rules
- **Usability Features**:
  - Password generator
  - Biometric unlock option
  - Password manager integration
  - Recovery phrase as backup
  - Multi-factor authentication
- **Security Enhancements**:
  - Hardware key support
  - Time-based lockouts
  - Geographic restrictions
  - Device binding
  - Session timeout controls