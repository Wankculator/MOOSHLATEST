# SparkDepositModal

**Last Updated**: 2025-07-21
**Location**: `/public/js/moosh-wallet.js` - Lines 6520-6690
**Type**: UI Modal Component

## Overview

The `SparkDepositModal` provides a user interface for creating Bitcoin deposits into the Spark Protocol Layer 2 network. It handles amount input, displays protocol benefits, and processes deposit transactions.

## Class Definition

```javascript
class SparkDepositModal {
    constructor(app)
    show()
    async processSparkDeposit()
    hide()
}
```

## Properties

### Core Properties

- **app** (`Object`): Reference to main application instance
- **modal** (`HTMLElement`): Modal DOM element

## UI Structure

### Modal Layout

```
┌─────────────────────────────────────────┐
│        Spark Protocol Deposit            │
│  Deposit Bitcoin into Spark for instant  │
│        Layer 2 transactions              │
├─────────────────────────────────────────┤
│  Amount to Deposit (BTC)                 │
│  ┌─────────────────────────────────┐    │
│  │ 0.00000000                      │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Spark Protocol Benefits                 │
│  • Instant Layer 2 transactions          │
│  • Ultra-low fees (< 1 sat)             │
│  • 7-day exit challenge period          │
│  • Non-custodial security               │
├─────────────────────────────────────────┤
│  [Create Deposit]        [Cancel]        │
└─────────────────────────────────────────┘
```

## Methods

### show()

Displays the deposit modal with fade-in animation.

**Process:**
1. Creates modal overlay
2. Builds deposit form
3. Attaches event handlers
4. Adds to DOM with animation

**Example:**
```javascript
const depositModal = new SparkDepositModal(app);
depositModal.show();
```

### processSparkDeposit()

Processes the deposit transaction when user clicks "Create Deposit".

**Process:**
1. Validates input amount
2. Creates deposit transaction via SparkBitcoinManager
3. Shows transaction details
4. Displays success notification
5. Closes modal

**Example Flow:**
```javascript
// Internal process when user submits
async processSparkDeposit() {
    // 1. Get amount
    const amount = parseFloat(amountInput.value);
    
    // 2. Validate
    if (!amount || amount <= 0) {
        showNotification('Invalid amount', 'error');
        return;
    }
    
    // 3. Create transaction
    const tx = await sparkBitcoinManager.createSparkDeposit(
        amount * 100000000,  // Convert to sats
        userAddress
    );
    
    // 4. Show result
    alert(`Deposit created: ${tx.txid}`);
}
```

### hide()

Closes the modal with fade-out animation.

**Process:**
1. Removes 'show' class for fade-out
2. Waits for animation to complete
3. Removes modal from DOM

## Integration Examples

### Basic Implementation

```javascript
// In main app
class WalletApp {
    constructor() {
        this.sparkDepositModal = null;
    }
    
    showDepositModal() {
        if (!this.sparkDepositModal) {
            this.sparkDepositModal = new SparkDepositModal(this);
        }
        this.sparkDepositModal.show();
    }
    
    // Required methods for modal
    showNotification(message, type) {
        // Show notification to user
    }
}
```

### Extended Deposit Modal

```javascript
// Extend with additional features
class ExtendedDepositModal extends SparkDepositModal {
    show() {
        super.show();
        
        // Add fee estimation
        this.addFeeEstimation();
        
        // Add balance check
        this.addBalanceDisplay();
    }
    
    addFeeEstimation() {
        const feeDisplay = ElementFactory.div({
            className: 'fee-estimation',
            textContent: 'Estimated fee: calculating...'
        });
        
        // Insert after amount input
        const amountSection = this.modal.querySelector('.amount-section');
        amountSection.appendChild(feeDisplay);
        
        // Update fee on amount change
        const amountInput = document.getElementById('spark-deposit-amount');
        amountInput.addEventListener('input', () => {
            this.updateFeeEstimate(amountInput.value);
        });
    }
    
    async updateFeeEstimate(btcAmount) {
        const satAmount = parseFloat(btcAmount) * 100000000;
        const fee = this.app.sparkBitcoinManager.calculateFee();
        
        const feeDisplay = this.modal.querySelector('.fee-estimation');
        feeDisplay.textContent = `Estimated fee: ${fee} sats`;
    }
}
```

### Deposit Validation

```javascript
// Add comprehensive validation
function validateDepositAmount(amount, userBalance) {
    const errors = [];
    
    // Check if amount is valid
    if (!amount || isNaN(amount)) {
        errors.push('Please enter a valid amount');
    }
    
    // Check minimum amount (dust limit)
    const MIN_DEPOSIT = 0.0001; // 10,000 sats
    if (amount < MIN_DEPOSIT) {
        errors.push(`Minimum deposit is ${MIN_DEPOSIT} BTC`);
    }
    
    // Check maximum amount
    const MAX_DEPOSIT = 1; // 1 BTC
    if (amount > MAX_DEPOSIT) {
        errors.push(`Maximum deposit is ${MAX_DEPOSIT} BTC`);
    }
    
    // Check user balance
    if (amount > userBalance) {
        errors.push('Insufficient balance');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}
```

## Styling

### Modal Styles

```css
/* Spark deposit modal specific styles */
.spark-deposit-modal {
    max-width: 500px;
    background: #0A0F25;
    border-radius: 20px;
    color: #ffffff;
    border: 1px solid #00D4FF;
}

/* Input styling */
#spark-deposit-amount {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #00D4FF;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 16px;
}

/* Benefits box */
.benefits-box {
    background: rgba(0, 212, 255, 0.1);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid rgba(0, 212, 255, 0.3);
}
```

## User Flow

### Complete Deposit Process

```javascript
// 1. User opens deposit modal
app.showSparkDepositModal();

// 2. User enters amount
// Input: 0.005 BTC

// 3. User clicks "Create Deposit"
// Modal validates and processes

// 4. Transaction created
// Shows confirmation:
/*
Spark Deposit Created!
Transaction ID: spark_deposit_1234567890
Amount: 0.005 BTC
Spark Address: bc1qsparkprotocoladdress
Status: Pending confirmation

Your Bitcoin will be available on Spark Layer 2 
after 1 confirmation!
*/

// 5. Modal closes
// User can monitor transaction
```

## Error Handling

### Input Validation Errors

```javascript
// Handle various error cases
async processSparkDeposit() {
    try {
        const amount = parseFloat(amountInput.value);
        
        // Validation
        if (!amount) {
            throw new Error('Please enter an amount');
        }
        
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        
        if (amount < 0.0001) {
            throw new Error('Minimum deposit is 0.0001 BTC');
        }
        
        // Process deposit
        const tx = await this.createDeposit(amount);
        
    } catch (error) {
        this.app.showNotification(error.message, 'error');
    }
}
```

### Network Errors

```javascript
// Handle network failures
try {
    const transaction = await sparkBitcoinManager.createSparkDeposit(
        satoshis,
        address
    );
} catch (error) {
    if (error.message.includes('network')) {
        this.app.showNotification(
            'Network error. Please try again.',
            'error'
        );
    } else if (error.message.includes('insufficient')) {
        this.app.showNotification(
            'Insufficient funds for deposit',
            'error'
        );
    } else {
        this.app.showNotification(
            'Deposit failed. Please try again.',
            'error'
        );
    }
}
```

## Benefits Display

The modal displays key Spark Protocol benefits:

1. **Instant Layer 2 transactions**: Near-instant confirmations
2. **Ultra-low fees**: Less than 1 satoshi per transaction
3. **7-day exit challenge period**: Security mechanism for exits
4. **Non-custodial security**: Users maintain control of funds

## Transaction Details

### Deposit Transaction Structure

```javascript
{
    txid: 'spark_deposit_1642536000000',
    inputs: [{
        txid: 'previous_tx',
        vout: 0,
        scriptSig: '',
        sequence: 0xffffffff
    }],
    outputs: [
        {
            address: 'bc1qsparkprotocoladdress',  // Spark
            value: 500000  // Deposit amount
        },
        {
            address: 'bc1quser...',  // Change
            value: 450000  // Change back
        }
    ],
    version: 2,
    locktime: 0
}
```

## Performance Considerations

- Input validation is performed client-side first
- Amount conversion handles precision correctly
- Modal cleanup removes event listeners
- Transaction creation is async to prevent UI blocking

## Security Notes

1. **Amount Validation**: Always validate amounts before processing
2. **Address Verification**: Verify Spark Protocol address
3. **User Confirmation**: Show clear transaction details
4. **Error Messages**: Don't expose sensitive information

## Dependencies

- `SparkBitcoinManager`: For creating deposit transactions
- `ElementFactory`: For DOM element creation
- Main app instance for notifications

## Future Enhancements

- QR code scanning for addresses
- Fee slider for priority selection
- Batch deposit support
- Transaction history integration
- Real-time fee estimation
- Multi-language support