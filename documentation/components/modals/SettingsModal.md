# SettingsModal (WalletSettingsModal) Component Documentation

## Overview
The WalletSettingsModal provides a terminal-style interface for viewing and managing all wallet types in MOOSH Wallet. It displays addresses for Spark Protocol, Taproot, Native SegWit, Nested SegWit, and Legacy wallets in a Linux file system format.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 24634-25153
- **Class Definition**: `class WalletSettingsModal`

## Visual Design

### ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│ ~/moosh/wallet/settings $ ls -la accounts/         [×]  │
├─────────────────────────────────────────────────────────┤
│ total 5 wallets                                         │
│                                                         │
│ drwxr-xr-x 1 moosh moosh 4096 Jan 15 14:23 spark/     │
│     ⚡ sp1q...                                          │
│                                                         │
│ drwxr-xr-x 1 moosh moosh 4096 Jan 15 14:23 taproot/   │
│     ₿ bc1p...                                          │
│                                                         │
│ drwxr-xr-x 1 moosh moosh 4096 Jan 15 14:23 nativeSegWit/│
│     ₿ bc1q...                                          │
│                                                         │
│ drwxr-xr-x 1 moosh moosh 4096 Jan 15 14:23 nestedSegWit/│
│     ₿ 3...                                              │
│                                                         │
│ drwxr-xr-x 1 moosh moosh 4096 Jan 15 14:23 legacy/    │
│     ₿ 1...                                             │
│                                                         │
│ ~/moosh/wallet/settings $ echo "Click on any wallet     │
│ to view full details and private keys"                  │
│ █                                                       │
└─────────────────────────────────────────────────────────┘
```

### Specifications
- **Max Width**: 800px
- **Width**: 90% of viewport
- **Max Height**: 80vh
- **Background**: var(--bg-primary) (black)
- **Border**: 2px solid theme color (orange/#f57315 or green/#69fd97)
- **Terminal Style**: Monospace font throughout

## Constructor

```javascript
class WalletSettingsModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
    }
}
```

## Key Methods

### show()
**Location**: Lines 24640-24697
Creates and displays the settings modal with terminal styling.

```javascript
show() {
    const $ = window.ElementFactory || ElementFactory;
    
    // Get current theme
    const isMooshMode = document.body.classList.contains('moosh-mode');
    const themeColor = isMooshMode ? '#69fd97' : '#f57315';
    const borderColor = isMooshMode ? '#232b2b' : '#333333';
    
    this.modal = $.div({ 
        className: 'modal-overlay',
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000'
        }
    }, [
        $.div({ 
            className: 'terminal-box settings-terminal',
            // Terminal-style content
        })
    ]);
    
    document.body.appendChild(this.modal);
}
```

### createTerminalHeader(themeColor)
**Location**: Lines 24699-24731
Creates the terminal command line header.

```javascript
createTerminalHeader(themeColor) {
    return $.div({
        style: {
            background: '#000000',
            borderBottom: `2px solid ${themeColor}`,
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }
    }, [
        $.div({
            style: {
                color: themeColor,
                fontSize: '14px',
                fontFamily: 'monospace'
            }
        }, ['~/moosh/wallet/settings $ ls -la accounts/']),
        // Close button
    ]);
}
```

### createTerminalContent(themeColor, borderColor)
**Location**: Lines 24733-24875
Creates the main wallet listing in terminal format.

```javascript
createTerminalContent(themeColor, borderColor) {
    // Get wallet data
    const sparkWallet = this.app.state.get('sparkWallet') || {};
    const currentWallet = this.app.state.get('currentWallet') || {};
    
    // Get real addresses
    const walletDetailsPage = new WalletDetailsPage(this.app);
    const addresses = walletDetailsPage.getRealWalletAddresses(sparkWallet, currentWallet);
    
    // Create wallet types array
    const walletTypes = [
        { 
            value: 'spark', 
            label: 'Spark Protocol', 
            address: addresses.spark || 'Not generated',
            type: 'Lightning', 
            permission: 'drwxr-xr-x',
            icon: 'MOOSH'
        },
        // ... other wallet types
    ];
    
    // Return terminal-style listing
}
```

## Modal Components

### Terminal Header
- Command prompt: `~/moosh/wallet/settings $ ls -la accounts/`
- Close button (×) aligned to right
- Theme-colored border bottom

### Wallet Listing
Each wallet entry shows:
1. **File Permissions**: `drwxr-xr-x` (directory format)
2. **Owner/Group**: `moosh moosh`
3. **Size**: `4096` (standard directory size)
4. **Date**: Current date in terminal format
5. **Time**: Current time in 24-hour format
6. **Directory Name**: `spark/`, `taproot/`, etc.
7. **Label**: `[Spark Protocol]`, `[Bitcoin Taproot]`, etc.

Below each entry:
- Wallet icon (MOOSH for Spark, ₿ for Bitcoin)
- Actual wallet address (truncated if needed)

### Footer Section
- Terminal prompt showing instructions
- Blinking cursor (█) for authenticity

## Wallet Types Configuration

```javascript
const walletTypes = [
    { 
        value: 'spark', 
        label: 'Spark Protocol', 
        icon: 'MOOSH',
        type: 'Lightning'
    },
    { 
        value: 'taproot', 
        label: 'Bitcoin Taproot', 
        icon: '₿',
        type: 'Primary'
    },
    { 
        value: 'nativeSegWit', 
        label: 'Native SegWit', 
        icon: '₿',
        type: 'BIP84'
    },
    { 
        value: 'nestedSegWit', 
        label: 'Nested SegWit', 
        icon: '₿',
        type: 'BIP49'
    },
    { 
        value: 'legacy', 
        label: 'Bitcoin Legacy', 
        icon: '₿',
        type: 'BIP44'
    }
];
```

## Interactive Features

### Hover Effects
- Background highlight with 20% opacity of theme color
- Left border appears (3px solid theme color)
- Smooth transition (0.2s ease)

### Click Actions
- Clicking any wallet navigates to wallet details page
- Passes wallet type as query parameter
- Closes modal before navigation

### Navigation
```javascript
viewAccountDetails(walletType) {
    this.close();
    if (this.app && this.app.router) {
        this.app.router.navigate(`wallet-details?type=${walletType}`);
    } else {
        window.location.hash = `#wallet-details?type=${walletType}`;
    }
}
```

## Styling Details

### Terminal Aesthetics
- Monospace font throughout
- Black background (#000000)
- Theme-colored borders and accents
- No border radius (sharp corners)
- Terminal-style spacing and alignment

### Color Scheme
- File permissions: #888 (gray)
- Wallet names: Theme color (orange/green)
- Labels: #666 (dark gray)
- Addresses: #666 with theme-colored icon

### Responsive Design
- 90% viewport width
- Maximum 800px width
- 80vh maximum height
- Scrollable content area

## State Integration

### Data Sources
- `sparkWallet` from state/localStorage
- `currentWallet` from state
- Real addresses via `WalletDetailsPage.getRealWalletAddresses()`

### Theme Detection
- Checks `moosh-mode` class on body
- Green theme (#69fd97) for moosh mode
- Orange theme (#f57315) for default

## Password Protection

Before showing the settings modal, password verification is required:
1. Password prompt appears first
2. Verifies against stored password
3. Shows settings only after verification
4. Handled by parent components

## Usage Examples

### Opening Settings
```javascript
// From dashboard
handleSettings() {
    const modal = new WalletSettingsModal(this.app);
    modal.show();
}

// With password verification
showWalletSettings() {
    this.showPasswordVerification(() => {
        const modal = new WalletSettingsModal(this.app);
        modal.show();
    });
}
```

### Direct Invocation
**Location**: Multiple dashboard implementations
- Line 9930: Dashboard handler
- Line 12825: Alternative dashboard
- Line 14974: Another dashboard variant
- Line 15750: After password verification

## Security Considerations

1. **Password Required**: Settings access requires password verification
2. **No Private Keys**: Only shows addresses, not keys
3. **Navigation Only**: Clicking navigates to details page for key viewing
4. **Read-Only Display**: No editing capabilities in this modal

## Animation and Transitions

### Show Animation
- Fade in with opacity transition
- 10ms delay for smooth appearance

### Close Animation
- Opacity fade to 0
- 300ms delay before DOM removal
- Smooth transition effect

## Best Practices

1. **Always verify password** before showing settings
2. **Use real addresses** from wallet state
3. **Maintain terminal authenticity** in styling
4. **Handle missing addresses** gracefully ("Not generated")
5. **Test theme switching** for both modes
6. **Ensure navigation** works correctly
7. **Keep monospace formatting** consistent