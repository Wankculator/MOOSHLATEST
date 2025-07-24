# Show Seed Phrase Button

## Overview
The Show Seed Phrase Button reveals the wallet's recovery seed phrase after password verification. This is a high-security action located in the wallet settings.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10304-10308 (within renderShowSeedPhrase)

### Visual Specifications
- **Class**: `btn btn-danger`
- **Background**: Transparent with red theme
- **Border**: 2px solid `#ff4444`
- **Text Color**: `#ff4444` (danger red)
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px
- **Padding**: 12px 24px
- **Width**: Auto
- **Cursor**: Pointer

### Implementation

```javascript
$.button({
    className: 'btn btn-danger',
    onclick: () => this.showSeedPhraseModal()
}, ['Show Seed Phrase'])
```

### CSS Styles
```css
.btn-danger {
    background: transparent;
    border: 2px solid #ff4444;
    color: #ff4444;
    padding: 12px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-danger:hover {
    background: #ff4444;
    color: #ffffff;
}

.setting-item.danger-zone {
    border: 1px solid #ff4444;
    padding: 20px;
    margin-top: 40px;
    position: relative;
}
```

### Click Handler Flow

1. **showSeedPhraseModal()**
   - Shows password verification modal
   - Requires current password
   - Implements time delay for security

2. **Password Verification Modal**
```javascript
const passwordModal = this.createPasswordModal({
    title: 'Verify Password',
    message: 'Enter your password to view seed phrase',
    onConfirm: (password) => this.verifyPasswordAndShowSeed(password)
});
```

3. **verifyPasswordAndShowSeed()**
```javascript
async verifyPasswordAndShowSeed(password) {
    try {
        // Verify password
        const isValid = await this.verifyPassword(password);
        
        if (!isValid) {
            this.showError('Incorrect password');
            return;
        }
        
        // Decrypt and show seed phrase
        const seedPhrase = await this.decryptSeedPhrase(password);
        this.displaySeedPhraseModal(seedPhrase);
        
        // Log security event
        this.logSecurityEvent('SEED_PHRASE_VIEWED');
        
    } catch (error) {
        this.showError('Failed to retrieve seed phrase');
    }
}
```

4. **Seed Phrase Display Modal**
   - Shows 12/24 word grid
   - Copy button for seed phrase
   - Warning messages
   - Auto-close after 5 minutes

### Security Measures
- Password required every time
- No seed phrase caching
- Auto-close timeout
- Blur/hide on window blur
- Security event logging
- Warning messages displayed

### Warning Messages
```javascript
const warnings = [
    "⚠️ Never share your seed phrase with anyone",
    "⚠️ Anyone with this phrase can steal your funds",
    "⚠️ Write it down and store securely offline",
    "⚠️ MOOSH Wallet staff will never ask for this"
];
```

### UI Components
- Password verification modal
- Seed phrase display grid
- Copy button with confirmation
- Timer showing auto-close
- Warning banner
- Close button

### Accessibility Features
- Clear warning announcements
- Keyboard navigation in grid
- Screen reader friendly
- High contrast warnings
- Focus management

### Mobile Considerations
- Responsive word grid
- Touch-friendly spacing
- Screen lock reminder
- Screenshot prevention (where supported)
- Landscape orientation support

### Additional Features
- Word numbering (1people-24)
- Word validation indicators
- Export options (print/save)
- QR code generation (optional)
- Recovery test prompt

### Related Components
- Password Modal
- Seed Phrase Grid
- Copy Seed Button
- Security Warning Banner
- Settings Panel