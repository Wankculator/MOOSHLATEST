# MOOSH Wallet Forms Documentation

## Overview
This directory contains comprehensive documentation for all forms and input fields in MOOSH Wallet. Each form type is documented with its validation rules, security considerations, and implementation details.

## Form Categories

### 1. Security Forms
- [Password Forms](./password-forms.md) - Lock screen, wallet creation, settings protection
- [Seed Phrase Forms](./seed-phrase-forms.md) - Seed generation, import, and recovery
- [PIN Forms](./pin-forms.md) - PIN-based authentication (if implemented)

### 2. Transaction Forms
- [Send Transaction Forms](./transaction-send-forms.md) - Bitcoin/Spark sending
- [Receive Forms](./transaction-receive-forms.md) - Address generation and amount requests
- [Fee Selection Forms](./fee-forms.md) - Transaction fee configuration
- [Lightning Forms](./lightning-forms.md) - Lightning invoice and payment forms

### 3. Wallet Management Forms
- [Account Forms](./account-forms.md) - Account creation, import, and renaming
- [Search Forms](./search-forms.md) - Account and transaction search
- [Settings Forms](./settings-forms.md) - Application configuration

### 4. Specialized Forms
- [Ordinals Forms](./ordinals-forms.md) - Inscription transfers and management
- [Terminal Input Forms](./terminal-forms.md) - Command-line interfaces
- [Exchange Forms](./exchange-forms.md) - Slippage and swap configuration

## Common Validation Patterns

### Input Sanitization
All user inputs are sanitized using the `ComplianceUtils.validateInput()` method:

```javascript
// Location: /public/js/moosh-wallet.js:330-363
static validateInput(value, type) {
    switch(type) {
        case 'accountName':
            // Max 50 chars, alphanumeric and spaces
            const sanitized = value.trim().replace(/[^a-zA-Z0-9\s]/g, '');
            if (sanitized.length === 0) {
                return { valid: false, error: 'Account name cannot be empty' };
            }
            if (sanitized.length > 50) {
                return { valid: false, error: 'Account name too long (max 50 characters)' };
            }
            return { valid: true, sanitized: value.trim() };
            
        case 'seedPhrase':
            // BIP39 validation
            const words = value.trim().toLowerCase().split(/\s+/);
            if (words.length !== 12 && words.length !== 24) {
                return { valid: false, error: 'Seed phrase must be 12 or 24 words' };
            }
            return { valid: true, sanitized: words.join(' ') };
    }
}
```

### Common Input Attributes

#### Security Inputs
- `autocomplete="off"` - Prevents browser autofill on sensitive fields
- `spellcheck="false"` - Disables spell checking on seed phrases
- `autocorrect="off"` - Prevents auto-correction on mobile

#### Numeric Inputs
- `inputMode="decimal"` - Shows decimal keyboard on mobile
- `pattern="[0-9]*\.?[0-9]*"` - Validates numeric format
- `step="0.00000001"` - Bitcoin precision (8 decimals)

#### Text Inputs
- `maxlength` - Enforces character limits
- `placeholder` - Provides user guidance
- `required` - Browser-level validation

## Mobile Optimizations

All forms include mobile-specific enhancements:
- Touch-friendly input sizes (min 44px height)
- Appropriate keyboard types (`inputMode`)
- Viewport management to prevent zoom
- Gesture support for form navigation

## Accessibility Features

All forms implement WCAG 2.1 AA compliance:
- Proper label associations
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Error announcements

## Security Considerations

### Password Fields
- Never logged or stored in plain text
- Minimum 8 characters enforced
- Real-time strength validation
- Secure comparison using constant-time algorithms

### Seed Phrases
- Never sent to external services
- Validated locally before API calls
- Cleared from memory after use
- No autocomplete or history

### Bitcoin Addresses
- Format validation (P2PKH, P2SH, P2WPKH, P2TR)
- Checksum verification
- Network-specific validation (mainnet/testnet)

## State Management

All form inputs integrate with the MOOSH Wallet state management system:
- Real-time validation feedback
- Persistent form state during navigation
- Automatic cleanup on component unmount
- Event-driven updates

## Error Handling

Consistent error handling across all forms:
- Inline validation messages
- Toast notifications for async errors
- Detailed error descriptions
- Recovery suggestions

## Testing Guidelines

Each form should be tested for:
1. Input validation (valid/invalid cases)
2. Edge cases (empty, max length, special chars)
3. Mobile keyboard behavior
4. Accessibility compliance
5. Security vulnerabilities
6. Performance (large inputs)
7. Browser compatibility

## Form Implementation Checklist

When implementing a new form:
- [ ] Add input sanitization
- [ ] Implement validation rules
- [ ] Add error messages
- [ ] Test on mobile devices
- [ ] Verify accessibility
- [ ] Add security headers
- [ ] Document in this guide
- [ ] Write unit tests