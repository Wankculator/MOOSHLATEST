# Import Wallet Button

## Overview
The Import Wallet Button allows users to restore an existing wallet using a seed phrase. It's displayed on the main screen when no wallet is present and is crucial for wallet recovery.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Line**: ~8200-8250 (within WalletCreation class)

### Visual Specifications
- **Background**: Transparent
- **Border**: 2px solid white (`#ffffff`)
- **Text Color**: White (`#ffffff`)
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px
- **Padding**: 12px
- **Width**: 260px (fixed)
- **Height**: 48px
- **Border Radius**: 0 (sharp corners)
- **Cursor**: Pointer

### Hover State
- **Background**: White (`#ffffff`)
- **Text Color**: Black (`#000000`)
- **Transition**: all 0.2s ease

### Implementation

```javascript
$.button({
    style: {
        background: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
        padding: '12px',
        width: '260px',
        height: '48px',
        fontSize: '14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '600',
        cursor: 'pointer',
        borderRadius: '0',
        transition: 'all 0.2s ease',
        marginTop: '16px'
    },
    onclick: () => this.showImportWallet(),
    onmouseover: function() {
        this.style.background = '#ffffff';
        this.style.color = '#000000';
    },
    onmouseout: function() {
        this.style.background = 'transparent';
        this.style.color = '#ffffff';
    }
}, ['Import Existing Wallet'])
```

### Click Handler
The button triggers `showImportWallet()` which:
1. Transitions to the import wallet interface
2. Displays seed phrase input fields
3. Shows word count selector (12/24 words)
4. Provides validation for entered seed phrases

### State Changes
- Sets `app.currentView` to 'import'
- Updates UI to show seed phrase entry form
- Initializes validation listeners

### Accessibility Features
- Full keyboard navigation support
- Tab index properly set
- Hover states provide visual feedback
- Clear contrast ratios (white on black)

### Mobile Optimizations
- Touch target size meets accessibility standards (48px height)
- Responsive scaling with CSS variables
- Tap highlight disabled for native feel
- No hover states on touch devices

### Related Components
- Seed phrase input grid
- Word count selector
- Validation feedback
- Back button to return to main screen

### Security Considerations
- No seed phrase data stored in button attributes
- Click handler validates security context
- Prevents multiple rapid clicks
- Clear visual distinction from create wallet button