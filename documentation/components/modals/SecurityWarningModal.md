# SecurityWarningModal Component Documentation

## Overview
Security warnings in MOOSH Wallet are currently implemented as inline messages and confirmation dialogs rather than a dedicated modal. This documentation covers the existing security warning patterns and proposes a unified SecurityWarningModal for critical security alerts.

## Current Implementation
- **Inline Warnings**: Lines 10308, 10333, 25494, 25583
- **Console Warnings**: Line 10420
- **Failed Attempt Warnings**: Line 4202
- **Confirmation Dialogs**: Delete wallet, export keys

## Visual Design

### Current Inline Warning
```
[Show Seed Phrase]
Requires password verification

[Delete Wallet]
This action cannot be undone
```

### Proposed SecurityWarningModal ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│  ⚠ Security Warning                               [×]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│      ╔═══════════════════════════════════════╗        │
│      ║           ⚠ WARNING ⚠                 ║        │
│      ╚═══════════════════════════════════════╝        │
│                                                         │
│  You are about to view your seed phrase.               │
│                                                         │
│  IMPORTANT:                                             │
│  • Never share your seed phrase with anyone            │
│  • Anyone with this phrase can steal your funds        │
│  • Write it down and store it securely offline         │
│  • MOOSH support will NEVER ask for your seed phrase   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☐ I understand the risks and have prepared      │   │
│  │   a secure location to store my seed phrase     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [ Continue at My Own Risk ]    [ Cancel ]             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Proposed Implementation

### Class Structure
```javascript
class SecurityWarningModal {
    constructor(app, options = {}) {
        this.app = app;
        this.modal = null;
        this.options = {
            type: options.type || 'generic',
            title: options.title || 'Security Warning',
            message: options.message || '',
            warnings: options.warnings || [],
            requireConfirmation: options.requireConfirmation || false,
            confirmText: options.confirmText || 'I understand the risks',
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {}),
            severity: options.severity || 'warning' // warning, danger, critical
        };
        this.confirmed = false;
    }
}
```

### Warning Types Configuration
```javascript
const warningTypes = {
    seedPhrase: {
        title: 'Seed Phrase Security',
        severity: 'critical',
        warnings: [
            'Never share your seed phrase with anyone',
            'Anyone with this phrase can steal your funds',
            'Write it down and store it securely offline',
            'MOOSH support will NEVER ask for your seed phrase'
        ],
        confirmText: 'I understand the risks and have prepared a secure location'
    },
    privateKey: {
        title: 'Private Key Export',
        severity: 'critical',
        warnings: [
            'Private keys provide full access to your funds',
            'Never enter private keys on websites',
            'Store private keys encrypted and offline',
            'Consider using a hardware wallet instead'
        ],
        confirmText: 'I understand the security implications'
    },
    deleteWallet: {
        title: 'Delete Wallet',
        severity: 'danger',
        warnings: [
            'This action cannot be undone',
            'All wallet data will be permanently deleted',
            'Ensure you have backed up your seed phrase',
            'You will lose access to all funds without backup'
        ],
        confirmText: 'I have backed up my wallet and want to delete'
    },
    testnet: {
        title: 'Testnet Mode',
        severity: 'warning',
        warnings: [
            'You are using Bitcoin Testnet',
            'Testnet coins have no real value',
            'Do not send real Bitcoin to testnet addresses',
            'Addresses look different on testnet'
        ],
        confirmText: 'I understand this is testnet'
    }
};
```

## Modal Components

### Header Section
- Warning icon (⚠) with animation
- Title with severity-based color
- Close button (may be disabled for critical warnings)

### Warning Display
```javascript
createWarningDisplay() {
    return $.div({ className: 'warning-display' }, [
        $.div({ className: `warning-icon ${this.options.severity}` }, ['⚠']),
        $.h2({ className: 'warning-title' }, [this.options.title]),
        $.p({ className: 'warning-message' }, [this.options.message]),
        this.createWarningList()
    ]);
}
```

### Warning List
```javascript
createWarningList() {
    return $.div({ className: 'warning-list' }, [
        $.h4({}, ['IMPORTANT:']),
        $.ul({}, 
            this.options.warnings.map(warning => 
                $.li({}, [warning])
            )
        )
    ]);
}
```

### Confirmation Checkbox
```javascript
createConfirmationCheckbox() {
    if (!this.options.requireConfirmation) return null;
    
    return $.div({ className: 'confirmation-section' }, [
        $.label({ className: 'confirmation-label' }, [
            $.input({
                type: 'checkbox',
                id: 'security-confirmation',
                onchange: (e) => {
                    this.confirmed = e.target.checked;
                    this.updateButtonState();
                }
            }),
            $.span({}, [this.options.confirmText])
        ])
    ]);
}
```

## Severity Levels

### Critical (Red)
- Seed phrase exposure
- Private key export
- Irreversible actions
- Requires confirmation checkbox

### Danger (Orange)
- Wallet deletion
- Large transactions
- Address changes
- May require confirmation

### Warning (Yellow)
- Network changes
- Fee warnings
- Best practices
- Informational only

## Styling

### Severity-Based Colors
```css
.warning-icon.critical {
    color: #ff4444;
    animation: pulse 1s infinite;
}

.warning-icon.danger {
    color: #ff8c42;
}

.warning-icon.warning {
    color: #ffd700;
}
```

### Animation
```css
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}
```

## Integration Examples

### Before Showing Seed Phrase
```javascript
showSeedPhraseWarning() {
    const modal = new SecurityWarningModal(this.app, {
        type: 'seedPhrase',
        ...warningTypes.seedPhrase,
        onConfirm: () => {
            this.displaySeedPhrase();
        }
    });
    modal.show();
}
```

### Before Wallet Deletion
```javascript
confirmDeleteWallet() {
    const modal = new SecurityWarningModal(this.app, {
        type: 'deleteWallet',
        ...warningTypes.deleteWallet,
        onConfirm: () => {
            this.executeWalletDeletion();
        }
    });
    modal.show();
}
```

### Network Switch Warning
```javascript
showTestnetWarning() {
    const modal = new SecurityWarningModal(this.app, {
        type: 'testnet',
        ...warningTypes.testnet,
        requireConfirmation: false,
        onConfirm: () => {
            this.switchToTestnet();
        }
    });
    modal.show();
}
```

## User Flow

### Critical Actions
1. User initiates sensitive action
2. Security warning appears
3. User reads warnings
4. User must check confirmation
5. Continue button enables
6. Action proceeds or cancels

### Informational Warnings
1. Condition triggers warning
2. Warning displays
3. User acknowledges
4. Modal closes

## Mobile Considerations

### Responsive Design
- Full screen on mobile
- Larger touch targets
- Scrollable warning list
- Sticky action buttons

### Touch Interactions
- Checkbox size increased
- Button spacing improved
- Swipe down to scroll
- No accidental dismissal

## Accessibility

### Screen Reader Support
- Proper heading hierarchy
- Warning severity announced
- Checkbox state changes
- Button states clear

### Keyboard Navigation
- Tab through elements
- Space to check box
- Enter to confirm
- Escape to cancel

## Security Best Practices

1. **No Auto-Dismiss**
   - Critical warnings stay visible
   - User must actively dismiss

2. **Clear Consequences**
   - Explain what will happen
   - Use simple language
   - Highlight irreversible actions

3. **Confirmation Requirements**
   - Checkbox for critical actions
   - Disabled continue button
   - No default focus on confirm

4. **Audit Trail**
   - Log warning displays
   - Track user confirmations
   - Record dismissals

## State Management

### Warning State
```javascript
{
    securityWarnings: {
        displayed: ['seedPhrase', 'testnet'],
        confirmed: ['testnet'],
        dismissed: [],
        lastShown: {
            seedPhrase: timestamp,
            testnet: timestamp
        }
    }
}
```

## Testing Considerations

1. **Warning Triggers**
   - All sensitive actions covered
   - Proper warning type selected
   - Confirmation required when needed

2. **User Interaction**
   - Checkbox enables button
   - Cancel works properly
   - Modal prevents background interaction

3. **Mobile Testing**
   - Touch targets adequate
   - Scrolling works
   - Keyboard doesn't cover buttons

## Future Enhancements

1. **Enhanced Warnings**
   - Biometric confirmation
   - Time delays for critical actions
   - Progressive disclosure
   - Educational links

2. **Warning History**
   - Track warnings shown
   - User acknowledgment log
   - Security audit trail

3. **Custom Warnings**
   - User-defined warnings
   - Third-party integrations
   - Phishing protection