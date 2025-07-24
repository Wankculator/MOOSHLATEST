# LightningChannelModal Component Documentation

## Overview
The LightningChannelModal provides a comprehensive Lightning Network management interface for MOOSH Wallet users. It allows management of Lightning channels, creation of invoices, sending payments, and monitoring channel balances through an intuitive interface.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 6692-6954
- **Class Definition**: `class LightningChannelModal`

## Visual Design

### ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════╗   │
│ ║     MOOSH Lightning Network Manager                ║   │
│ ║     Manage Lightning channels and instant          ║   │
│ ║     payments                                       ║   │
│ ╚═══════════════════════════════════════════════════╝   │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    LOCAL    │  │   REMOTE    │  │  CAPACITY   │    │
│  │ Local Bal.  │  │ Remote Bal. │  │ Total Cap.  │    │
│  │  0.005 BTC  │  │  0.010 BTC  │  │  0.015 BTC  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  Lightning Features                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   Send Payment      │  │  Create Invoice     │      │
│  └─────────────────────┘  └─────────────────────┘      │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   Open Channel      │  │   Channel Info      │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│         [ Refresh ]            [ Close ]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Specifications
- **Max Width**: 600px
- **Background**: #0A0F25 (dark blue)
- **Border**: 1px solid #FFD700 (gold)
- **Border Radius**: 20px
- **Header Gradient**: linear-gradient(90deg, #FFD700 0%, #f57315 100%)
- **Gold Theme**: Lightning Network branded with gold accents

## Constructor

```javascript
class LightningChannelModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
    }
}
```

## Key Methods

### show()
**Location**: Lines 6698-6745
Creates and displays the Lightning Network management modal.

```javascript
show() {
    this.modal = ElementFactory.div({
        className: 'modal-overlay',
        onclick: (e) => {
            if (e.target === this.modal) this.hide();
        }
    }, [
        ElementFactory.div({
            className: 'modal lightning-channel-modal',
            style: {
                maxWidth: '600px',
                background: '#0A0F25',
                borderRadius: '20px',
                color: '#ffffff',
                border: '1px solid #FFD700'
            }
        }, [
            // Modal content...
        ])
    ]);
    
    document.body.appendChild(this.modal);
    requestAnimationFrame(() => {
        this.modal.classList.add('show');
    });
    
    this.loadChannelData();
}
```

### createChannelStats()
**Location**: Lines 6747-6760
Creates the channel balance statistics display.

```javascript
createChannelStats() {
    return ElementFactory.div({
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '20px'
        }
    }, [
        this.createStatCard('Local Balance', '0.005 BTC', 'LOCAL'),
        this.createStatCard('Remote Balance', '0.010 BTC', 'REMOTE'),
        this.createStatCard('Total Capacity', '0.015 BTC', 'CAPACITY')
    ]);
}
```

### sendLightningPayment()
**Location**: Lines 6876-6894
Handles sending Lightning payments via invoice.

```javascript
async sendLightningPayment() {
    const invoice = prompt('Enter Lightning invoice:');
    if (!invoice) return;

    try {
        const result = await this.app.sparkLightningManager.sendSparkLightning(invoice, 1000);
        alert(`
⚡ LIGHTNING PAYMENT SENT!

Payment Hash: ${result.preimage}
Fee: ${result.fee} sats
Route: ${result.route.hops.length} hops
Status: Confirmed
        `);
        this.app.showNotification('Lightning payment sent successfully!', 'success');
    } catch (error) {
        this.app.showNotification('Lightning payment failed: ' + error.message, 'error');
    }
}
```

### createLightningInvoice()
**Location**: Lines 6896-6922
Creates Lightning invoices for receiving payments.

```javascript
async createLightningInvoice() {
    const amount = prompt('Enter amount in satoshis:', '1000');
    const description = prompt('Enter description:', 'Spark Lightning Payment');
    
    if (!amount) return;

    try {
        const invoice = await this.app.sparkLightningManager.createSparkInvoice(
            parseInt(amount),
            description
        );

        alert(`
⚡ LIGHTNING INVOICE CREATED!

Payment Request: ${invoice.payment_request}
Amount: ${amount} sats
Description: ${description}
Expires: ${new Date(invoice.expires_at).toLocaleString()}

Share this invoice to receive payment!
        `);
        this.app.showNotification('Lightning invoice created!', 'success');
    } catch (error) {
        this.app.showNotification('Failed to create invoice: ' + error.message, 'error');
    }
}
```

## Modal Components

### Header Section
- **Title**: "MOOSH Lightning Network Manager"
- **Subtitle**: "Manage Lightning channels and instant payments"
- **Background**: Gold to orange gradient
- **Text Color**: Black (#000)
- **MOOSH Branding**: Uses accent color for "MOOSH"

### Channel Statistics Grid
Three stat cards showing:
1. **Local Balance**: Available funds on your side
2. **Remote Balance**: Available funds on remote side
3. **Total Capacity**: Total channel capacity

Each stat card features:
- Background: rgba(255, 215, 0, 0.1) (transparent gold)
- Border: 1px solid rgba(255, 215, 0, 0.3)
- Icon/Label at top
- Title in gold (#FFD700)
- Value in bold white

### Lightning Features Grid
2x2 grid of action buttons:
- **Send Payment**: Opens payment dialog
- **Create Invoice**: Generates payment request
- **Open Channel**: Channel creation (coming soon)
- **Channel Info**: Shows detailed channel info

Feature button styling:
- Background: rgba(255, 215, 0, 0.1)
- Border: 1px solid #FFD700
- Text Color: #FFD700
- Padding: 12px
- Border Radius: 8px

### Action Buttons
- **Refresh Button**:
  - Background: Gold to orange gradient
  - No border
  - Black text
  - Refreshes channel data
  
- **Close Button**:
  - Transparent background
  - White border
  - White text
  - Closes modal

## Lightning Network Integration

### Spark Lightning Manager
The modal integrates with `app.sparkLightningManager`:

```javascript
// Get channel balance
const balance = this.app.sparkLightningManager.getChannelBalance();

// Send payment
const result = await this.app.sparkLightningManager.sendSparkLightning(invoice, amount);

// Create invoice
const invoice = await this.app.sparkLightningManager.createSparkInvoice(amount, description);
```

### Data Structure

#### Channel Balance
```javascript
{
    local: 500000,    // satoshis
    remote: 1000000,  // satoshis
    total: 1500000    // satoshis
}
```

#### Payment Result
```javascript
{
    preimage: "payment_hash",
    fee: 10,          // satoshis
    route: {
        hops: [...]   // routing path
    }
}
```

#### Invoice Object
```javascript
{
    payment_request: "lnbc...",     // bolt11 invoice
    expires_at: 1234567890000,      // timestamp
    amount: 1000,                   // satoshis
    description: "Payment for..."
}
```

## User Interactions

### Payment Flow
1. User clicks "Send Payment"
2. Prompt for Lightning invoice
3. Validate and parse invoice
4. Send payment via Lightning Network
5. Show success with payment details

### Invoice Creation Flow
1. User clicks "Create Invoice"
2. Prompt for amount (satoshis)
3. Prompt for description
4. Generate invoice via API
5. Display invoice for sharing

### Channel Info Display
Shows alert with:
- Local balance
- Remote balance
- Total capacity
- Channel status

## Error Handling

### Payment Errors
- Invalid invoice format
- Insufficient balance
- No route available
- Network errors

### Invoice Errors
- Invalid amount
- API failures
- Network timeouts

All errors show user-friendly notifications.

## Loading States

### Initial Load
- Calls `loadChannelData()` on modal open
- Shows success notification when loaded
- Updates UI with real channel data

### Refresh
- Manual refresh button
- Reloads channel balances
- Updates all statistics

## Styling Details

### Color Scheme
- Primary: #FFD700 (gold)
- Secondary: #f57315 (orange)
- Background: #0A0F25 (dark blue)
- Text: #ffffff (white)

### Animations
- Modal fade-in with `requestAnimationFrame`
- 300ms fade-out on close
- Smooth transitions on buttons

### Responsive Design
- Max width of 600px
- Grid layout adjusts to content
- Maintains readability on all devices

## Future Enhancements

### Planned Features
1. **Channel Opening**: Currently shows "coming soon"
2. **Channel List**: Display all active channels
3. **Payment History**: Show recent transactions
4. **Auto-refresh**: Update balances periodically
5. **QR Code Scanner**: For invoice input

### Potential Improvements
1. Better invoice input (paste detection)
2. Payment amount preview
3. Fee estimation
4. Channel routing visualization
5. Batch payments support

## Integration Points

### Modal Manager
**Invocation**: Lines 6489, 15960
```javascript
handleLightningManager() {
    this.app.modalManager.createLightningChannelModal();
}
```

### API Dependencies
- `sparkLightningManager.getChannelBalance()`
- `sparkLightningManager.sendSparkLightning()`
- `sparkLightningManager.createSparkInvoice()`

### State Management
- No internal state persistence
- Fetches fresh data on each open
- Updates via manual refresh

## Security Considerations

1. **Invoice Validation**: Always validate invoice format
2. **Amount Limits**: Consider maximum payment amounts
3. **User Confirmation**: Show payment details before sending
4. **Error Messages**: Don't expose sensitive routing info
5. **Secure Storage**: Don't store payment preimages

## Best Practices

1. **Always validate** user inputs before API calls
2. **Show loading states** during async operations
3. **Provide clear feedback** for all actions
4. **Handle edge cases** gracefully
5. **Test payment flows** thoroughly
6. **Keep UI responsive** during network operations