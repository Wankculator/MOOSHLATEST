# Max Amount Button

## Overview
The Max Amount Button automatically fills the maximum spendable amount in transaction forms, accounting for fees. It appears in the send modal next to the amount input field.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Context**: Send Modal amount input section

### Visual Specifications
- **Text**: "MAX"
- **Class**: `max-amount-btn`
- **Position**: Absolute right within amount input container
- **Background**: Transparent
- **Border**: 1px solid `#666666`
- **Text Color**: `#999999`
- **Font Size**: 11px
- **Padding**: 4px 8px
- **Border Radius**: 3px

### Implementation

```javascript
$.button({
    className: 'max-amount-btn',
    style: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: '1px solid #666666',
        color: '#999999',
        fontSize: '11px',
        padding: '4px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    onclick: () => this.setMaxAmount(),
    onmouseover: function() {
        this.style.borderColor = '#f57315';
        this.style.color = '#f57315';
    },
    onmouseout: function() {
        this.style.borderColor = '#666666';
        this.style.color = '#999999';
    }
}, ['MAX'])
```

### Click Handler

```javascript
async setMaxAmount() {
    try {
        // Get current balance
        const balance = await this.getSpendableBalance();
        
        // Get selected fee rate
        const feeRate = this.getSelectedFeeRate();
        
        // Estimate transaction size (approximate)
        const txSize = this.estimateTransactionSize({
            inputCount: this.utxos.length,
            outputCount: 2 // recipient + change
        });
        
        // Calculate fee
        const estimatedFee = (txSize * feeRate) / 100000000; // Convert to BTC
        
        // Calculate max amount (balance - fee)
        const maxAmount = Math.max(0, balance - estimatedFee);
        
        // Check if amount is dust
        if (maxAmount < 0.00000546) { // Bitcoin dust limit
            this.showError('Insufficient balance after fees');
            return;
        }
        
        // Set amount in input
        const amountInput = document.getElementById('sendAmount');
        amountInput.value = maxAmount.toFixed(8);
        
        // Trigger input event for validation
        amountInput.dispatchEvent(new Event('input'));
        
        // Update USD conversion
        this.updateUsdConversion(maxAmount);
        
        // Show fee warning
        this.showToast(`Max amount: ${maxAmount.toFixed(8)} BTC (Fee: ${estimatedFee.toFixed(8)} BTC)`, 'info');
        
    } catch (error) {
        console.error('Failed to calculate max amount:', error);
        this.showError('Failed to calculate maximum amount');
    }
}
```

### Balance Calculation

```javascript
async getSpendableBalance() {
    // Get confirmed UTXOs only
    const confirmedUtxos = this.utxos.filter(utxo => utxo.confirmations >= 1);
    
    // Sum up spendable balance
    const balance = confirmedUtxos.reduce((sum, utxo) => {
        return sum + utxo.value;
    }, 0);
    
    return balance / 100000000; // Convert satoshis to BTC
}
```

### Transaction Size Estimation

```javascript
estimateTransactionSize({ inputCount, outputCount }) {
    // P2WPKH (native segwit) calculations
    const baseSize = 10; // version (4) + locktime (4) + input count (1) + output count (1)
    const inputSize = 68; // prevout (36) + scriptSig (1) + sequence (4) + witness (27)
    const outputSize = 31; // value (8) + scriptPubKey (23)
    
    const totalSize = baseSize + (inputCount * inputSize) + (outputCount * outputSize);
    
    // Add 10% buffer for estimation errors
    return Math.ceil(totalSize * 1.1);
}
```

### Edge Cases

1. **Insufficient Balance**
   ```javascript
   if (balance <= estimatedFee) {
       this.showError('Balance too low to cover transaction fees');
       return;
   }
   ```

2. **Dust Amount**
   ```javascript
   const DUST_LIMIT = 546; // satoshis
   if (maxAmountSatoshis < DUST_LIMIT) {
       this.showError('Amount too small (dust)');
       return;
   }
   ```

3. **Unconfirmed Balance**
   ```javascript
   if (confirmedBalance < totalBalance) {
       this.showWarning('Using confirmed balance only');
   }
   ```

### Visual States
- **Default**: Gray border and text
- **Hover**: Orange accent color
- **Active**: Slight scale down
- **Disabled**: Opacity 0.5 when no balance

### Mobile Behavior
- Larger touch target (min 44px)
- Clear tap feedback
- Prevents accidental taps
- Updates amount immediately

### Fee Considerations
- Updates when fee tier changes
- Accounts for witness discount
- Includes change output if needed
- Reserves fee before setting amount

### User Feedback
- Shows fee amount in toast
- Indicates if using partial balance
- Warns about dust amounts
- Updates USD value display

### Related Components
- Amount Input Field
- Fee Selector
- Balance Display
- USD Converter
- Send Button