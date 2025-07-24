# ReceiveModal Documentation

## Overview
The ReceiveModal provides a user-friendly interface for receiving Bitcoin. It displays the wallet address with a QR code, copy functionality, and optional amount specification for payment requests.

## Location in Codebase
- **File**: `/public/js/moosh-wallet.js`
- **Main Implementation**: Lines 10090-10188
- **QR Code Generation**: Lines 10124 (calls `createQRCode` method)
- **Copy Address Handler**: Line 10144
- **Modal Trigger**: Multiple locations via `showReceiveModal()`

## Component Structure

### Modal Container
```javascript
// Lines 10098-10105
const overlay = $.div({ 
    className: 'modal-overlay',
    onclick: (e) => {
        if (e.target.className === 'modal-overlay') {
            this.closeModal();
        }
    }
})
```

### Modal Dimensions and Styling
- **Overlay**: Full viewport with semi-transparent background
- **Container Class**: `modal-container receive-modal`
- **Width**: Typically 450-500px
- **Height**: Auto-adjusting
- **QR Code Size**: 200x200px (responsive on mobile)
- **Background**: `var(--bg-primary)`
- **Border**: 2px solid theme color

## Modal Sections

### 1. Header Section (Lines 10107-10118)
```javascript
$.div({ className: 'modal-header' }, [
    $.h2({ className: 'modal-title' }, [
        $.span({ className: 'text-dim' }, ['<']),
        ' Receive Bitcoin ',
        $.span({ className: 'text-dim' }, ['/>'])
    ]),
    $.button({
        className: 'modal-close',
        onclick: () => this.closeModal()
    }, ['×'])
])
```

### 2. QR Code Section (Lines 10122-10125)
- **Container Class**: `qr-section`
- **Content**: QR code generated from wallet address
- **Size**: 200x200px default, scales on mobile
- **Error Correction**: Medium level
- **Color Scheme**: Adapts to theme (orange/green)

### 3. Address Display Section (Lines 10127-10147)
Features:
- **Label**: "< Your Bitcoin Address />"
- **Input Field**:
  - ID: `wallet-address-display`
  - Class: `address-input form-input`
  - Value: Current wallet address
  - Readonly: true
  - Selectable for manual copying
- **Copy Button**:
  - Class: `copy-btn`
  - Action: Copies address to clipboard
  - Shows success notification

### 4. Optional Amount Input (Lines 10149-10170)
- **Label**: "< Amount (Optional) />"
- **Purpose**: Generate payment request with specific amount
- **Input Group**:
  - Amount input field
  - Unit selector (BTC/USD)
- **Updates**: QR code regenerates with amount

### 5. Footer Actions (Lines 10173-10182)
Single button:
- **Done Button**:
  - Class: `btn btn-primary`
  - Action: Closes modal
  - Full width on mobile

## Address Generation

### Address Source
```javascript
// Line 10095
const currentAccount = this.app.state.getCurrentAccount();
const walletAddress = currentAccount?.address || this.generateWalletAddress('taproot');
```

### Address Types Supported
1. **Taproot** (bc1p...) - Default
2. **SegWit** (bc1q...)
3. **Legacy** (1... or 3...)

## QR Code Implementation

### Generation Method
```javascript
createQRCode(data) {
    // Creates QR code using QRCode.js library
    // Adapts colors based on theme
    // Returns canvas or SVG element
}
```

### QR Code Content Formats
1. **Simple Address**: `bitcoin:bc1p...`
2. **With Amount**: `bitcoin:bc1p...?amount=0.001`
3. **With Label**: `bitcoin:bc1p...?label=Payment`
4. **Full URI**: `bitcoin:bc1p...?amount=0.001&label=Payment&message=Invoice123`

## Copy Functionality

### Copy Address Implementation
```javascript
// Line 10144
onclick: () => this.copyAddress(walletAddress)
```

### Copy Method Features
1. Uses Clipboard API when available
2. Fallback to document.execCommand
3. Shows success notification
4. Visual feedback on button

## State Management

### On Modal Open
1. Retrieves current account address
2. Generates QR code
3. Populates address field
4. Sets focus to amount field (if user wants to add amount)

### During Interaction
1. Amount changes trigger QR regeneration
2. Copy action updates button state
3. Address remains static

## API Calls

### 1. Address Validation
```javascript
// Implied validation
this.app.walletService.validateAddress(address)
```

### 2. Payment Request Generation
```javascript
// When amount is specified
this.app.walletService.createPaymentRequest({
    address: walletAddress,
    amount: amountInBTC,
    label: 'Payment Request'
})
```

## Security Considerations

1. **Address Verification**: Shows only verified wallet addresses
2. **Read-Only Display**: Address field cannot be edited
3. **Secure Copy**: Uses secure clipboard APIs
4. **QR Validation**: Ensures QR contains valid Bitcoin URI
5. **No Private Data**: Never displays private keys or seeds

## Event Handlers

### Modal Events
- **Overlay Click**: Closes modal
- **Close Button**: Dismisses modal
- **Done Button**: Closes modal

### Interaction Events
- **Copy Button**: Copies address with feedback
- **Amount Input**: Updates QR code
- **Unit Change**: Converts amount and updates QR

## Styling Classes
- `.modal-overlay` - Full screen overlay
- `.receive-modal` - Specific modal styling
- `.qr-section` - QR code container
- `.address-section` - Address display area
- `.address-display` - Address and copy button group
- `.address-input` - Read-only address field
- `.copy-btn` - Copy button styling
- `.amount-input-group` - Optional amount section

## Mobile Responsiveness
- QR code scales to fit screen
- Address text size adjusts
- Copy button remains touch-friendly
- Modal height adapts to content
- Increased padding on small screens

## Visual Features

### QR Code Styling
- **Orange Theme**: Black QR on white background with orange border
- **Green Theme**: Black QR on white background with green border
- **Error Correction**: Medium (15%)
- **Quiet Zone**: 4 modules

### Address Display
- Monospace font for clarity
- Truncated with ellipsis on mobile
- Full address on hover/tap
- High contrast for readability

## Error Handling
1. **QR Generation Failure**: Shows text fallback
2. **Copy Failure**: Shows error notification
3. **Invalid Amount**: Highlights field, shows error
4. **No Address**: Shows loading or error state

## Connected Components
- **WalletDashboard**: Parent component
- **QRCode Library**: For QR generation
- **NotificationSystem**: For copy feedback
- **StateManager**: For current account data

## Usage Example
```javascript
// From dashboard or wallet pages
handleReceive() {
    this.showReceiveModal();
}
```

## Mobile-Specific Features
1. **Share Button**: Native share API on mobile
2. **QR Scanner Link**: Open wallet apps that can scan
3. **Touch Feedback**: Visual feedback on interactions
4. **Responsive QR**: Larger QR on small screens

## Advanced Features

### Payment Request Options
```javascript
// Extended payment request
{
    address: "bc1p...",
    amount: "0.001",
    label: "Invoice #123",
    message: "Payment for services",
    req_url: "https://merchant.com/verify"
}
```

### Multiple Address Types
- User can switch between address types
- Each type generates new QR
- Preference saved in settings

## Notes for Recreation
1. QR code library must be included separately
2. Modal animations use CSS transitions
3. Copy functionality needs clipboard permissions
4. Address generation happens in wallet service
5. Theme colors applied dynamically
6. Mobile share requires HTTPS context