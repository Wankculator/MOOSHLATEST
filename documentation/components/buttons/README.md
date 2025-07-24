# MOOSH Wallet Button Components Documentation

This directory contains comprehensive documentation for all button components in the MOOSH Wallet application. Each button is documented with its visual specifications, implementation details, and usage patterns.

## Button Categories

### 🔑 Core Wallet Actions
- [**Create New Wallet Button**](./CreateNewWalletButton.md) - Generates a new Bitcoin wallet with seed phrase
- [**Import Wallet Button**](./ImportWalletButton.md) - Restores existing wallet from seed phrase
- [**Delete Wallet Button**](./DeleteWalletButton.md) - Permanently removes wallet with multi-step confirmation

### 💸 Transaction Buttons
- [**Send Button**](./SendButton.md) - Initiates Bitcoin transactions
- [**Receive Button**](./ReceiveButton.md) - Displays receiving address and QR code
- [**Max Amount Button**](./MaxAmountButton.md) - Auto-fills maximum spendable amount
- [**Fee Selection Buttons**](./FeeSelectionButtons.md) - Choose transaction priority/fees
- [**Transaction History Button**](./TransactionHistoryButton.md) - View all wallet transactions

### 📋 Utility Buttons
- [**Copy Address Button**](./CopyAddressButton.md) - One-click address copying
- [**Copy Seed Phrase Button**](./CopySeedPhraseButton.md) - Secure seed phrase copying
- [**Paste Button**](./PasteButton.md) - Quick clipboard paste for addresses
- [**Share Button**](./ShareButton.md) - Share addresses via multiple channels
- [**QR Code Button**](./QRCodeButton.md) - Display/hide QR codes

### 🔒 Security Buttons
- [**Lock/Unlock Button**](./LockUnlockButton.md) - Wallet security lock/unlock
- [**Show Seed Phrase Button**](./ShowSeedPhraseButton.md) - Reveal recovery seed with password
- [**Password Toggle Button**](./PasswordToggleButton.md) - Show/hide password input
- [**Privacy Toggle Button**](./PrivacyToggleButton.md) - Hide sensitive information

### 👤 Account Management
- [**Add Account Button**](./AddAccountButton.md) - Create additional wallet accounts
- [**Delete Account Button**](./DeleteAccountButton.md) - Remove wallet accounts

### ⚡ Spark Protocol (Lightning)
- [**Spark Protocol Buttons**](./SparkProtocolButtons.md) - All Lightning/Layer 2 related buttons

### ⚙️ Settings & Configuration
- [**Settings Button**](./SettingsButton.md) - Access wallet configuration
- [**Network Toggle Button**](./NetworkToggleButton.md) - Switch between mainnet/testnet
- [**Theme Toggle Button**](./ThemeToggleButton.md) - Dark/light mode switching
- [**Export Wallet Button**](./ExportWalletButton.md) - Backup wallet data
- [**Refresh Balance Button**](./RefreshBalanceButton.md) - Manual balance/data refresh

### 🚀 Navigation & UI Controls
- [**Back Button**](./BackButton.md) - Navigate to previous screens
- [**Close Modal Button**](./CloseModalButton.md) - Dismiss modals and dialogs
- [**Confirm and Cancel Buttons**](./ConfirmCancelButtons.md) - Standard action buttons

## Common Button Patterns

### Visual Hierarchy
1. **Primary Actions**: Orange border (`#f57315`), black background
2. **Secondary Actions**: Gray border (`#666666`), transparent background
3. **Danger Actions**: Red border (`#ff4444`), red text
4. **Success States**: Green accents (`#00ff00`)

### Standard Sizes
- **Desktop**: 48px height, 12px padding
- **Mobile**: 44px minimum touch target
- **Icon Buttons**: 32px × 32px

### Consistent Behaviors
- Hover states with color transitions
- Active states with slight scale
- Disabled states with 50% opacity
- Loading states with spinner
- Success feedback (2 seconds)

## Implementation Guidelines

### Basic Button Structure
```javascript
$.button({
    className: 'btn-primary',
    onclick: () => this.handleClick(),
    onmouseover: (e) => { /* hover effect */ },
    onmouseout: (e) => { /* revert hover */ }
}, ['Button Text'])
```

### Accessibility Requirements
- All buttons must have:
  - Descriptive text or aria-label
  - Keyboard accessibility (Tab navigation)
  - Focus indicators
  - Screen reader support
  - Minimum 44px touch targets on mobile

### State Management
- Loading states prevent multiple clicks
- Disabled states for invalid conditions
- Visual feedback for all actions
- Error handling with user feedback

## File Organization
Each button documentation includes:
- **Overview**: Purpose and function
- **Component Details**: File location and line numbers
- **Visual Specifications**: Styling details
- **Implementation**: Code examples
- **Click Handlers**: Action logic
- **Related Components**: Connected features
- **Mobile Optimizations**: Touch enhancements
- **Security Considerations**: Safety features

## Quick Reference

### Most Used Buttons
1. Send/Receive (primary wallet actions)
2. Copy Address (frequently used utility)
3. Refresh Balance (data updates)
4. Lock/Unlock (security)
5. Settings (configuration)

### Critical Security Buttons
- Delete Wallet (irreversible action)
- Show Seed Phrase (requires password)
- Export Wallet (sensitive data)
- Lock Wallet (security measure)

### Mobile-Specific Considerations
- Larger touch targets
- Swipe gestures where applicable
- Native share sheets
- Haptic feedback
- Responsive layouts

## Contributing
When adding new buttons:
1. Follow existing visual patterns
2. Include comprehensive documentation
3. Ensure accessibility compliance
4. Test on mobile devices
5. Add to this index