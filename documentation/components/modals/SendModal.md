# SendModal Documentation

## Overview
The SendModal is the primary interface for sending Bitcoin transactions in MOOSH Wallet. It provides a comprehensive form for specifying recipient addresses, amounts, and network fees with real-time validation and transaction preview.

## Location in Codebase
- **File**: `/public/js/moosh-wallet.js`
- **Main Implementation**: Lines 9959-10088
- **Fee Option Helper**: Lines 10036-10038
- **Process Send Handler**: Referenced but implementation varies by context
- **Modal Styles**: Added via `addModalStyles()` method

## Component Structure

### Modal Container
```javascript
// Lines 9963-9970
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
- **Overlay**: Full viewport coverage with semi-transparent background
- **Container Class**: `modal-container send-modal`
- **Width**: Default modal width (typically 500-600px)
- **Height**: Auto-adjusting based on content
- **Border**: 2px solid with theme-dependent color
- **Background**: `var(--bg-primary)` (black)
- **Border Radius**: 0 (sharp corners per MOOSH design)

## Modal Sections

### 1. Header Section (Lines 9972-9983)
```javascript
$.div({ className: 'modal-header' }, [
    $.h2({ className: 'modal-title' }, [
        $.span({ className: 'text-dim' }, ['<']),
        ' Send Bitcoin ',
        $.span({ className: 'text-dim' }, ['/>'])
    ]),
    $.button({
        className: 'modal-close',
        onclick: () => this.closeModal()
    }, ['×'])
])
```

### 2. Recipient Address Input (Lines 9987-10001)
- **Label**: "< Recipient Address />"
- **Input ID**: `recipient-address`
- **Class**: `form-input`
- **Placeholder**: "Enter Bitcoin address..."
- **Validation**: Bitcoin address format validation
- **Spellcheck**: Disabled

### 3. Amount Input Section (Lines 10004-10026)
Features:
- **Dual Unit Input**: BTC/USD selector
- **Input ID**: `send-amount`
- **Placeholder**: "0.00000000"
- **Unit Selector**: Dropdown with BTC and USD options
- **Conversion Display**: Real-time USD equivalent shown below
- **Validation**: 
  - Minimum: 0.00000001 BTC (1 satoshi)
  - Maximum: Available balance minus fees
  - Format: Up to 8 decimal places for BTC

### 4. Network Fee Selector (Lines 10029-10040)
Three fee options:
1. **Slow** (Default selected)
   - Label: "Slow"
   - Time: "~60 min"
   - Rate: "1 sat/vB"
   
2. **Medium**
   - Label: "Medium"
   - Time: "~30 min"
   - Rate: "5 sat/vB"
   
3. **Fast**
   - Label: "Fast"
   - Time: "~10 min"
   - Rate: "15 sat/vB"

### 5. Transaction Summary (Lines 10043-10057)
Displays:
- **Amount**: Selected amount in BTC
- **Network Fee**: Calculated fee based on selection
- **Total**: Amount + Fee
- **Styling**: Highlighted total row with different styling

### 6. Footer Actions (Lines 10061-10070)
Two buttons:
1. **Cancel Button**
   - Class: `btn btn-secondary`
   - Action: Closes modal without sending
   
2. **Send Bitcoin Button**
   - Class: `btn btn-primary`
   - Action: Calls `processSend()` method

## Form Fields and Validation

### Recipient Address
- **Validation Rules**:
  - Must be valid Bitcoin address format
  - Supports Legacy, SegWit, and Taproot addresses
  - Cannot be empty
  - Cannot be sender's own address

### Amount
- **Validation Rules**:
  - Must be numeric
  - Minimum: 0.00000001 BTC
  - Maximum: Available balance - fees
  - Auto-converts between BTC and USD
  - Updates conversion rate in real-time

### Fee Selection
- **Dynamic Calculation**: Based on transaction size and selected speed
- **Updates**: Transaction summary updates when fee option changes
- **Validation**: Ensures total doesn't exceed balance

## API Calls

### 1. Fee Estimation
```javascript
// Implied API call for fee rates
this.app.apiService.getFeeRates()
```

### 2. Send Transaction
```javascript
// In processSend() method
this.app.apiService.sendTransaction({
    to: recipientAddress,
    amount: amountInSatoshis,
    feeRate: selectedFeeRate
})
```

### 3. Price Conversion
```javascript
// For BTC/USD conversion
this.app.apiService.getBTCPrice()
```

## State Updates

### On Modal Open
1. Fetches current BTC price
2. Gets current fee rates
3. Retrieves wallet balance
4. Sets default fee option to "slow"

### During Interaction
1. Updates conversion display on amount change
2. Recalculates total on fee selection change
3. Validates inputs in real-time

### On Send
1. Updates wallet balance
2. Records transaction in history
3. Shows success/error notification
4. Closes modal on success

## Security Considerations

1. **Address Validation**: Prevents sending to invalid addresses
2. **Balance Check**: Ensures sufficient funds before sending
3. **Fee Protection**: Prevents transactions with insufficient fees
4. **Double-Send Prevention**: Disables send button during processing
5. **Secure Input**: No autocomplete on sensitive fields
6. **XSS Prevention**: All user inputs are sanitized

## Event Handlers

### Input Events
- **Amount Input**: `oninput` - Updates conversion and validation
- **Address Input**: `onblur` - Validates address format
- **Fee Selection**: `onclick` - Updates fee calculation

### Modal Events
- **Overlay Click**: Closes modal if clicked outside
- **Close Button**: Immediate modal dismissal
- **Cancel Button**: Close without action
- **Send Button**: Validate and process transaction

## Styling Classes
- `.modal-overlay` - Full viewport overlay
- `.modal-container` - Main modal wrapper
- `.send-modal` - Specific to send modal
- `.modal-header` - Header section
- `.modal-content` - Main content area
- `.modal-footer` - Action buttons area
- `.form-group` - Input group wrapper
- `.form-label` - Input labels
- `.form-input` - Text inputs
- `.amount-input-group` - Amount and unit selector
- `.fee-options` - Fee selection area
- `.transaction-summary` - Summary section

## Mobile Responsiveness
- Modal width adjusts to viewport
- Touch-friendly button sizes
- Increased padding on mobile
- Simplified layout on small screens
- Native number keyboard for amount input

## Error Handling
1. **Invalid Address**: Shows error message below input
2. **Insufficient Balance**: Disables send button, shows warning
3. **Network Error**: Display error notification
4. **Transaction Failed**: Shows detailed error message

## Connected Components
- **WalletDashboard**: Parent component that triggers modal
- **NotificationSystem**: For success/error messages
- **ApiService**: For blockchain interactions
- **StateManager**: For balance and transaction updates

## Usage Example
```javascript
// From WalletCreatedPage or DashboardPage
handleSend() {
    this.showSendModal();
}
```

## Notes for Recreation
1. Modal uses MOOSH Wallet's custom ElementFactory ($) for DOM creation
2. All styling follows the terminal/code editor aesthetic
3. Colors adapt based on theme (orange or green mode)
4. Modal animations use CSS transitions
5. Form validation happens client-side before API calls
6. Transaction signing happens in the wallet service layer