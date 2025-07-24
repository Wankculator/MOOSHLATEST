# SeedPhraseModal Documentation

## Overview
The SeedPhraseModal is a high-security component that displays the wallet's seed phrase after password verification. It includes multiple security warnings and safeguards to protect users' funds.

## Location in Codebase
- **File**: `/public/js/moosh-wallet.js`
- **Main Implementation**: Lines 10339-10450 (approximately)
- **Trigger**: Line 10306 - Button in wallet settings
- **Password Verification**: Integrated into modal flow

## Component Structure

### Two-Phase Modal System
1. **Phase 1**: Password verification modal
2. **Phase 2**: Seed phrase display modal (after successful verification)

### Modal Dimensions and Styling
- **Container Class**: `modal-container seed-phrase-modal`
- **Width**: 600px maximum
- **Height**: Auto-adjusting
- **Background**: `var(--bg-primary)`
- **Border**: 2px solid red (danger indication)
- **Special**: Red theme to indicate sensitivity

## Phase 1: Password Verification Modal

### Structure (Lines 10342-10390)
```javascript
const passwordOverlay = $.div({ 
    className: 'modal-overlay',
    onclick: (e) => {
        if (e.target.className === 'modal-overlay') {
            e.currentTarget.remove();
        }
    }
})
```

### Password Input Section
- **Header**: "Password Required"
- **Warning Text**: "Enter your password to view seed phrase"
- **Input Field**:
  - Type: password
  - ID: `verify-password`
  - Placeholder: "Enter password..."
  - Auto-focus on modal open

### Verification Buttons
1. **Cancel**: Closes without showing seed
2. **Verify**: Checks password and proceeds

## Phase 2: Seed Phrase Display Modal

### Security Warning Section
Large, prominent warning box containing:
```
⚠️ CRITICAL SECURITY WARNING ⚠️

Never share your seed phrase with anyone!
Anyone with these words can steal your funds.

- Write it down on paper
- Store in a secure location
- Never screenshot or email
- MOOSH Support will NEVER ask for it
```

### Seed Phrase Display (Lines 10400-10440)
- **Container**: Grid layout
- **Word Display**: 
  - Each word numbered (1-12 or 1-24)
  - Monospace font
  - High contrast
  - Selectable for copying
- **Layout**: 
  - 3 columns for 12 words
  - 4 columns for 24 words
  - Responsive on mobile

### Word Display Format
```javascript
$.div({ className: 'seed-word' }, [
    $.span({ className: 'word-number' }, [`${index + 1}.`]),
    $.span({ className: 'word-text' }, [word])
])
```

### Action Buttons
1. **Copy All**: Copies entire seed phrase
2. **Download**: Saves as encrypted text file
3. **Done**: Closes modal (with confirmation)

## Security Features

### 1. Password Protection
```javascript
async verifyPassword(inputPassword) {
    const storedHash = await this.app.securityService.getPasswordHash();
    const inputHash = await this.app.securityService.hashPassword(inputPassword);
    return storedHash === inputHash;
}
```

### 2. Visual Security Indicators
- Red border on modal
- Warning icon (⚠️)
- Danger-themed colors
- Countdown timer option

### 3. Auto-Close Features
- Optional: Auto-close after 60 seconds
- Idle detection (no mouse movement)
- Background blur when inactive

### 4. Copy Protection
- Disable right-click in modal
- CSS to prevent selection (optional)
- Warning on copy action

## API Calls

### 1. Password Verification
```javascript
this.app.securityService.verifyPassword(password)
```

### 2. Seed Phrase Retrieval
```javascript
// Decrypt and retrieve seed phrase
const encryptedSeed = this.app.state.get('encryptedSeed');
const seed = await this.app.securityService.decrypt(encryptedSeed, password);
```

### 3. Audit Logging
```javascript
// Log seed phrase access
this.app.auditService.log({
    action: 'SEED_PHRASE_VIEWED',
    timestamp: Date.now(),
    success: true
})
```

## State Management

### Security State
- Track failed password attempts
- Lock after 3 failures
- Cooldown period

### Display State
- Current view (password/seed)
- Timer state
- Copy status

## Styling Classes

### Password Modal
- `.password-modal` - Password verification container
- `.password-input-group` - Input and label group
- `.password-warning` - Warning message styling

### Seed Display Modal
- `.seed-phrase-modal` - Main container (red theme)
- `.security-warning` - Warning box
- `.seed-phrase-grid` - Word grid container
- `.seed-word` - Individual word container
- `.word-number` - Word index styling
- `.word-text` - Actual word styling

### Security Styling
```css
.seed-phrase-modal {
    border: 3px solid #ff4444 !important;
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}

.security-warning {
    background: rgba(255, 68, 68, 0.1);
    border: 2px solid #ff4444;
    color: #ff4444;
    padding: 20px;
    margin-bottom: 20px;
    font-weight: bold;
}
```

## Mobile Responsiveness
- Larger touch targets
- Adjusted grid layout (2 columns)
- Increased font size
- Simplified interactions
- Native sharing (with warning)

## Word Grid Responsive Layout
```javascript
// Mobile: 2 columns
// Tablet: 3 columns  
// Desktop: 4 columns (for 24 words)
gridTemplateColumns: ResponsiveUtils.getResponsiveValue(
    'repeat(2, 1fr)',  // mobile
    'repeat(3, 1fr)',  // tablet
    'repeat(4, 1fr)'   // desktop
)
```

## Error Handling

### Password Errors
- "Incorrect password" - Wrong password
- "Too many attempts" - Locked after failures
- "Session expired" - Timeout

### Seed Retrieval Errors
- "Unable to decrypt seed" - Corruption
- "Seed not found" - Missing data
- "Security violation" - Tampering detected

## Event Handlers

### Password Modal
- **Password Input**: Enter key submits
- **Cancel Button**: Closes without action
- **Verify Button**: Validates password

### Seed Display Modal
- **Copy Button**: Copy with confirmation
- **Download Button**: Save encrypted file
- **Done Button**: Confirm before closing
- **Timer**: Auto-close when expires

## Security Best Practices

### Display Security
1. No screenshots (CSS/JS prevention)
2. Blur on window switch
3. Clear clipboard after delay
4. No browser history

### Access Control
1. Password required every time
2. No "remember me" option
3. Session timeout
4. Rate limiting

### Audit Trail
1. Log all access attempts
2. Track viewing duration
3. Record copy actions
4. Monitor failed attempts

## Download Feature

### Encrypted File Format
```javascript
{
    version: "1.0",
    encrypted: true,
    timestamp: Date.now(),
    data: encryptedSeedData,
    checksum: sha256(encryptedSeedData)
}
```

### File Naming
- Default: `moosh-wallet-backup-${date}.enc`
- User can customize name
- Auto-adds .enc extension

## Connected Components
- **SecurityService**: Password verification
- **WalletService**: Seed retrieval
- **AuditService**: Access logging
- **NotificationSystem**: User feedback

## Usage Example
```javascript
// From wallet settings
showSeedPhraseModal() {
    // First verify password
    // Then show seed phrase
    // Log access
    // Handle security
}
```

## Testing Considerations
1. Test password failure lockout
2. Verify auto-close functionality
3. Check copy/paste behavior
4. Test mobile responsiveness
5. Verify encryption/decryption

## Notes for Recreation
1. Implement strong password verification
2. Use secure encryption for storage
3. Add comprehensive audit logging
4. Follow security best practices
5. Test across all devices
6. Consider biometric authentication option