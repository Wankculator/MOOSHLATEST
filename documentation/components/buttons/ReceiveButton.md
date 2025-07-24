# Receive Button

## Overview
The Receive Button displays the wallet's receiving address and QR code for accepting Bitcoin payments. It's a primary action button in the wallet dashboard.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 11941-11946 (within Dashboard.renderDashboard)

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
    onclick: () => this.showReceiveModal(),
    onmouseover: function() { 
        this.style.background = 'var(--text-accent)'; 
        this.style.color = '#000000'; 
    },
    onmouseout: function() { 
        this.style.background = '#000000'; 
        this.style.color = 'var(--text-primary)'; 
    }
}, ['Receive Payment'])
```

### Click Handler
The `showReceiveModal()` function:
1. Opens the receive payment modal
2. Displays current wallet address
3. Generates QR code for the address
4. Shows copy-to-clipboard button
5. Provides sharing options
6. Optional: Amount-specific QR codes

### Features
- Address display with monospace font
- High-resolution QR code generation
- One-click copy functionality
- Share via email/message/link
- Address refresh capability
- Payment request with specific amounts

### State Management
- Current active address tracking
- Address derivation path management
- QR code caching for performance
- Share history tracking

### API Integration
- Address generation if needed
- Balance monitoring for received funds
- WebSocket subscription for real-time updates

### Accessibility Features
- Clear address announcement for screen readers
- Keyboard navigation in modal
- High contrast QR codes
- Text alternatives for QR code

### Mobile Optimizations
- QR code sizing for mobile screens
- Native share sheet integration
- Touch-friendly copy button
- Responsive modal layout

### Security Considerations
- Address validation on display
- Secure QR code generation
- No address reuse warnings
- Clear ownership verification

### Related Components
- Receive Modal
- QR Code Generator
- Copy Address Button
- Share Options
- Address Display

### User Experience
- Immediate QR code generation
- Multiple sharing methods
- Clear success feedback
- Address verification tools