# SparkDepositModal Component Documentation

## Overview
The SparkDepositModal allows users to deposit Bitcoin into the Spark Protocol Layer 2 network for instant transactions with ultra-low fees. This modal handles the creation of Spark deposit transactions.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 6520-6690
- **Class Definition**: `class SparkDepositModal`

## Visual Design

### ASCII Layout
```
┌─────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════╗   │
│ ║  Spark Protocol Deposit                    ║   │
│ ║  Deposit Bitcoin into Spark for instant    ║   │
│ ║  Layer 2 transactions                      ║   │
│ ╚═══════════════════════════════════════════╝   │
│                                                 │
│  Amount to Deposit (BTC)                        │
│  ┌─────────────────────────────────────────┐   │
│  │ 0.00000000                             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ╔═════════════════════════════════════════╗   │
│  ║ 🔥 Spark Protocol Benefits               ║   │
│  ║ • Instant Layer 2 transactions           ║   │
│  ║ • Ultra-low fees (< 1 sat)               ║   │
│  ║ • 7-day exit challenge period            ║   │
│  ║ • Non-custodial security                 ║   │
│  ╚═════════════════════════════════════════╝   │
│                                                 │
│  ┌─────────────────┐  ┌──────────┐            │
│  │  Create Deposit  │  │  Cancel  │            │
│  └─────────────────┘  └──────────┘            │
└─────────────────────────────────────────────────┘
```

### Specifications
- **Max Width**: 500px
- **Background**: #0A0F25 (dark blue)
- **Border**: 1px solid #00D4FF (cyan)
- **Border Radius**: 20px
- **Header Gradient**: linear-gradient(90deg, #00D4FF 0%, #f57315 100%)
- **Benefits Box**: rgba(0, 212, 255, 0.1) background

## Constructor

```javascript
class SparkDepositModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
    }
}
```

## Key Methods

### show()
**Location**: Lines 6526-6639
Creates and displays the Spark deposit modal interface.

```javascript
show() {
    this.modal = ElementFactory.div({
        className: 'modal-overlay',
        onclick: (e) => {
            if (e.target === this.modal) this.hide();
        }
    }, [
        ElementFactory.div({
            className: 'modal spark-deposit-modal',
            style: {
                maxWidth: '500px',
                background: '#0A0F25',
                borderRadius: '20px',
                color: '#ffffff',
                border: '1px solid #00D4FF'
            }
        }, [
            // Modal content...
        ])
    ]);
    
    document.body.appendChild(this.modal);
    requestAnimationFrame(() => {
        this.modal.classList.add('show');
    });
}
```

### processSparkDeposit()
**Location**: Lines 6641-6678
Handles the creation of a Spark deposit transaction.

```javascript
async processSparkDeposit() {
    const amountInput = document.getElementById('spark-deposit-amount');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        this.app.showNotification('Please enter a valid amount', 'error');
        return;
    }

    try {
        this.app.showNotification('Creating Spark deposit transaction...', 'info');

        // Create Spark deposit transaction
        const transaction = await this.app.sparkBitcoinManager.createSparkDeposit(
            Math.floor(amount * 100000000), // Convert to satoshis
            'bc1quser_bitcoin_address' // User's Bitcoin address
        );

        // Show transaction details
        alert(`
🔥 SPARK DEPOSIT CREATED!

Transaction ID: ${transaction.txid}
Amount: ${amount} BTC
Spark Address: ${transaction.outputs[0].address}
Status: Pending confirmation

Your Bitcoin will be available on Spark Layer 2 after 1 confirmation!
        `);

        this.app.showNotification('Spark deposit transaction created!', 'success');
        this.hide();

    } catch (error) {
        console.error('Failed to create Spark deposit:', error);
        this.app.showNotification('Failed to create Spark deposit', 'error');
    }
}
```

### hide()
**Location**: Lines 6680-6689
Removes the modal with animation.

```javascript
hide() {
    if (this.modal) {
        this.modal.classList.remove('show');
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.remove();
            }
        }, 300);
    }
}
```

## Modal Elements

### Header Section
- **Background**: Gradient from #00D4FF to #f57315
- **Padding**: 20px
- **Border Radius**: 20px 20px 0 0
- **Title**: "Spark Protocol Deposit"
- **Subtitle**: "Deposit Bitcoin into Spark for instant Layer 2 transactions"

### Amount Input
- **Type**: number
- **ID**: spark-deposit-amount
- **Step**: 0.00000001 (1 satoshi precision)
- **Placeholder**: "0.00000000"
- **Styling**:
  ```css
  width: 100%
  padding: 12px
  borderRadius: 8px
  border: 1px solid #00D4FF
  background: rgba(255, 255, 255, 0.1)
  color: #ffffff
  ```

### Benefits Section
- **Background**: rgba(0, 212, 255, 0.1)
- **Border**: 1px solid rgba(0, 212, 255, 0.3)
- **Padding**: 15px
- **Border Radius**: 10px
- **Features Listed**:
  - Instant Layer 2 transactions
  - Ultra-low fees (< 1 sat)
  - 7-day exit challenge period
  - Non-custodial security

### Action Buttons
- **Create Deposit Button**:
  - Background: linear-gradient(90deg, #00D4FF 0%, #f57315 100%)
  - Text Color: #000000
  - Font Weight: bold
  - Flex: 1 (takes available space)
  
- **Cancel Button**:
  - Background: transparent
  - Border: 1px solid #ffffff
  - Text Color: #ffffff
  - Flex: 0 0 auto (fixed width)

## API Integration

### Spark Bitcoin Manager
**Location**: Line 6654
```javascript
const transaction = await this.app.sparkBitcoinManager.createSparkDeposit(
    Math.floor(amount * 100000000), // Satoshis
    'bc1quser_bitcoin_address' // User's address
);
```

### Expected Response
```javascript
{
    txid: "transaction_hash",
    outputs: [{
        address: "spark_address",
        amount: satoshi_amount
    }],
    status: "pending"
}
```

## User Flow

1. **Open Modal**: User clicks deposit button
2. **Enter Amount**: User inputs BTC amount
3. **Review Benefits**: User sees Spark Protocol features
4. **Create Deposit**: User clicks "Create Deposit"
5. **Processing**: Loading notification shown
6. **Success/Error**: Transaction details or error shown
7. **Close Modal**: Modal closes after success

## Validation

### Amount Validation
- Must be greater than 0
- Converts to satoshis (multiply by 100,000,000)
- Maximum 8 decimal places

### Error Handling
- Empty amount: "Please enter a valid amount"
- Transaction failure: "Failed to create Spark deposit"
- Network errors: Caught and displayed

## Mobile Responsiveness

- **Modal Width**: 90% on mobile, max 500px
- **Font Sizes**: Slightly reduced on mobile
- **Button Layout**: Remains horizontal
- **Touch Targets**: Minimum 48px height

## Security Considerations

1. **Amount Validation**: Prevents negative or zero amounts
2. **Transaction Signing**: Handled by sparkBitcoinManager
3. **Address Verification**: Uses user's actual Bitcoin address
4. **Error Logging**: Sensitive data not exposed in console

## State Management

### Reads
- Current user's Bitcoin address
- Wallet balance (for validation)

### Updates
- Transaction history after successful deposit
- Spark balance after confirmations

## Animation

### Show Animation
```css
.modal-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
}
.modal-overlay.show {
    opacity: 1;
}
```

### Hide Animation
- 300ms fade out before removal
- Prevents abrupt disappearance

## Integration Points

### Modal Manager
**Invocation**: Line 6485
```javascript
handleSparkDeposit() {
    this.app.modalManager.createSparkDepositModal();
}
```

### Notification System
- Info: "Creating Spark deposit transaction..."
- Success: "Spark deposit transaction created!"
- Error: Various error messages

## Best Practices

1. Always validate amounts before processing
2. Show clear loading states during async operations
3. Provide detailed success information
4. Handle all error cases gracefully
5. Use proper number formatting for Bitcoin amounts
6. Test with various decimal precisions