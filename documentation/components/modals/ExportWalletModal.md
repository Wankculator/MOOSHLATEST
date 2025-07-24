# ExportWalletModal Component Documentation

## Overview
The Export Wallet functionality in MOOSH Wallet consists of two separate modal displays: one for showing the seed phrase and another for exporting private keys. Both require password verification before displaying sensitive information.

## Component Location
- **Seed Phrase Display**: Lines 25444-25509
- **Private Key Export**: Lines 25526-25599
- **Password Verification**: Lines 25428-25441, 25511-25524
- **Invocation**: From WalletDetails settings page

## Visual Design

### ASCII Layout - Seed Phrase Display
```
┌─────────────────────────────────────────────────────────┐
│                Your Seed Phrase                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ word1 word2 word3 word4 word5 word6              │  │
│  │ word7 word8 word9 word10 word11 word12           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ⚠ WARNING: Never share your seed phrase with      │  │
│  │ anyone. Write it down and store it in a safe     │  │
│  │ place.                                            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│                     [ Close ]                           │
└─────────────────────────────────────────────────────────┘
```

### ASCII Layout - Private Keys Display
```
┌─────────────────────────────────────────────────────────┐
│                  Private Keys                           │
│                                                         │
│  Bitcoin Private Key                                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ L1234567890abcdefghijklmnopqrstuvwxyz...         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Spark Private Key                                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ cT987654321zyxwvutsrqponmlkjihgfedcba...         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ⚠ WARNING: Never share your private keys with     │  │
│  │ anyone. Anyone with these keys can steal your     │  │
│  │ funds.                                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│                     [ Close ]                           │
└─────────────────────────────────────────────────────────┘
```

## Implementation

### showSeedPhrase() Method
**Location**: Lines 25428-25442

```javascript
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
```

### displaySeedPhrase() Method
**Location**: Lines 25444-25509

```javascript
displaySeedPhrase() {
    const $ = window.ElementFactory || ElementFactory;
    const currentAccount = this.app.state.getCurrentAccount();
    
    if (!currentAccount || !currentAccount.mnemonic) {
        this.app.showNotification('No seed phrase available', 'error');
        return;
    }
    
    // Create modal to display seed phrase
    const modal = $.div({
        className: 'modal-overlay',
        onclick: (e) => {
            if (e.target.className === 'modal-overlay') {
                e.currentTarget.remove();
            }
        }
    }, [
        // Modal content with seed phrase display
    ]);
    
    document.body.appendChild(modal);
}
```

### exportPrivateKey() Method
**Location**: Lines 25511-25524

```javascript
exportPrivateKey() {
    const passwordModal = new PasswordModal(this.app, {
        title: 'Export Private Key',
        message: 'Enter password to export private key',
        onSuccess: () => {
            this.displayPrivateKeys();
        },
        onCancel: () => {
            this.app.showNotification('Password required to export private key', 'error');
        }
    });
    
    passwordModal.show();
}
```

### displayPrivateKeys() Method
**Location**: Lines 25526-25599

```javascript
displayPrivateKeys() {
    const $ = window.ElementFactory || ElementFactory;
    const currentAccount = this.app.state.getCurrentAccount();
    
    if (!currentAccount || !currentAccount.privateKeys) {
        this.app.showNotification('No private keys available', 'error');
        return;
    }
    
    // Create modal to display private keys
    // Shows all available private keys (Bitcoin, Spark, etc.)
}
```

## Modal Components

### Seed Phrase Modal
1. **Title**: "Your Seed Phrase"
2. **Content Box**: 
   - Background: var(--bg-secondary)
   - Monospace font for clarity
   - Word-break for long phrases
   - Border for visual separation
3. **Warning Box**:
   - Red background (#ffeeee)
   - Red border (#ff4444)
   - Security warning text
4. **Close Button**: Standard button styling

### Private Keys Modal
1. **Title**: "Private Keys"
2. **Key Sections**: For each key type
   - Capitalized type name (Bitcoin, Spark, etc.)
   - Monospace display box
   - WIF format display
3. **Warning Box**: Same as seed phrase
4. **Close Button**: Standard button styling

## Security Flow

### Password Verification
1. User clicks export button
2. Password modal appears
3. User enters password
4. System verifies password
5. On success: Display sensitive data
6. On failure: Error notification

### Data Protection
- No sensitive data in component state
- Password required for every access
- Clear warnings about security
- Click-outside-to-close functionality

## Styling Details

### Modal Container
```javascript
style: {
    background: 'var(--bg-primary)',
    border: '2px solid var(--text-primary)',
    padding: '30px',
    maxWidth: '600px', // 700px for private keys
    width: '90%'
}
```

### Content Display Box
```javascript
style: {
    background: 'var(--bg-secondary)',
    padding: '20px', // 15px for private keys
    borderRadius: '4px',
    marginBottom: '20px',
    fontFamily: 'monospace',
    fontSize: '14px', // 12px for private keys
    wordBreak: 'break-all',
    border: '1px solid var(--border-color)'
}
```

### Warning Box
```javascript
style: {
    background: '#ffeeee',
    border: '1px solid #ff4444',
    padding: '10px',
    marginBottom: '20px',
    fontSize: '12px',
    color: '#ff4444'
}
```

## Data Access

### Seed Phrase
- Retrieved from: `currentAccount.mnemonic`
- Format: Space-separated word list
- Validation: Check if exists before display

### Private Keys
- Retrieved from: `currentAccount.privateKeys`
- Format: Object with key types
- Display: WIF format (Wallet Import Format)
- Multiple keys shown if available

## Error Handling

### No Data Available
- "No seed phrase available" - Missing mnemonic
- "No private keys available" - Missing keys
- Prevents modal display
- Shows error notification

### Password Failures
- Incorrect password: Modal stays closed
- Cancel action: Error notification
- No retry limit (user can try again)

## User Experience

### Access Flow
1. Navigate to wallet settings
2. Click "Show Seed Phrase" or "Export Private Key"
3. Enter wallet password
4. View sensitive information
5. Click "Close" or outside modal

### Security Warnings
- Prominent red warning boxes
- Clear security messages
- Positioned before close button
- Cannot be dismissed separately

## Integration Points

### Invocation Examples
```javascript
// Show seed phrase button
$.button({
    className: 'btn btn-warning',
    onclick: () => this.showSeedPhrase()
}, ['Show Seed Phrase'])

// Export private key button
$.button({
    className: 'btn btn-warning',
    onclick: () => this.exportPrivateKey()
}, ['Export Private Key'])
```

### State Dependencies
- Current account from state
- Password verification via PasswordModal
- No persistent storage of displayed data

## Mobile Responsiveness

- 90% width on all devices
- Appropriate font sizes
- Touch-friendly close areas
- Scrollable if content overflows

## Best Practices

1. **Always require password** for sensitive data
2. **Display clear warnings** about security
3. **Use monospace fonts** for keys/phrases
4. **Enable word-break** for long strings
5. **Don't store sensitive data** in component
6. **Clean up modals** properly on close
7. **Test with various key formats**

## Future Enhancements

1. **Copy to Clipboard**
   - One-click copy functionality
   - Clear clipboard after timeout

2. **QR Code Display**
   - Generate QR for easy transfer
   - Warning about QR security

3. **Export to File**
   - Encrypted file export
   - Standard wallet formats

4. **Partial Display**
   - Show first/last few characters
   - Reveal on demand

5. **Time-Limited Display**
   - Auto-close after timeout
   - Security enhancement