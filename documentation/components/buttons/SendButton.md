# Send Button

## Overview
The Send Button initiates Bitcoin transactions from the wallet. It's prominently displayed in the wallet dashboard and opens the send transaction modal.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 11935-11940 (within Dashboard.renderDashboard)

### Visual Specifications
- **Background**: Black (`#000000`)
- **Border**: 2px solid `var(--border-active)` (#f57315)
- **Text Color**: `var(--text-primary)` (#ffffff)
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px × scale factor
- **Padding**: 12px × scale factor
- **Width**: 100%
- **Border Radius**: 0
- **Cursor**: Pointer
- **Transition**: all 0.2s ease

### Hover State
- **Background**: `var(--text-accent)` (#f57315)
- **Text Color**: Black (`#000000`)

### Implementation

```javascript
$.button({
    className: 'btn-secondary',
    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
    onclick: () => this.showSendModal(),
    onmouseover: function() { 
        this.style.background = 'var(--text-accent)'; 
        this.style.color = '#000000'; 
    },
    onmouseout: function() { 
        this.style.background = '#000000'; 
        this.style.color = 'var(--text-primary)'; 
    }
}, ['Send Lightning Payment'])
```

### Click Handler
The `showSendModal()` function:
1. Opens the send transaction modal overlay
2. Initializes recipient address input
3. Sets up amount input with BTC/USD conversion
4. Displays current balance
5. Configures fee selection options
6. Prepares transaction preview

### State Management
- Checks wallet balance before allowing send
- Validates sufficient funds including fees
- Updates transaction history after successful send
- Manages pending transaction states

### API Calls
- `/api/bitcoin/fee-estimates` - Get current network fees
- `/api/bitcoin/create-transaction` - Build transaction
- `/api/bitcoin/broadcast` - Send to network

### Accessibility Features
- ARIA labels for screen readers
- Keyboard shortcut: `Ctrl+S` or `Cmd+S`
- Focus management when modal opens
- Clear button states (enabled/disabled)

### Mobile Optimizations
- Full-width button on mobile
- Large touch target (min 44px)
- Responsive text scaling
- Native tap feedback

### Error Handling
- Insufficient balance warnings
- Network error notifications
- Invalid address detection
- Fee estimation failures

### Related Components
- Send Modal
- Address Input
- Amount Input
- Fee Selector
- Transaction Preview

### Security Features
- Address validation before sending
- Confirmation step for large amounts
- Password verification for high-value transactions
- Clear fee display to prevent overpayment