# Transaction Send Forms Documentation

## Overview
Transaction send forms handle Bitcoin and Spark Protocol transactions, including recipient addresses, amounts, and fee configurations.

## 1. Recipient Address Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 9994-9997
- **Component**: SendTransactionPanel

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'recipient-address',
    className: 'form-input',
    placeholder: 'Enter Bitcoin address (bc1q..., 1..., 3...)',
    autocomplete: 'off',
    spellcheck: false,
    oninput: (e) => this.validateAddress(e.target.value),
    onpaste: (e) => this.handleAddressPaste(e)
})
```

### Address Validation
```javascript
validateBitcoinAddress(address) {
    // Remove whitespace
    address = address.trim();
    
    // Validation patterns
    const patterns = {
        // P2PKH (Legacy) - starts with 1
        legacy: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        
        // P2SH (SegWit-compatible) - starts with 3
        p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        
        // P2WPKH (Native SegWit) - starts with bc1q
        bech32: /^bc1q[a-z0-9]{39,59}$/,
        
        // P2TR (Taproot) - starts with bc1p
        taproot: /^bc1p[a-z0-9]{58}$/,
        
        // Testnet addresses
        testnet: /^(tb1|[2mn])[a-zA-Z0-9]{25,62}$/
    };
    
    // Check each pattern
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(address)) {
            return { valid: true, type, address };
        }
    }
    
    return { valid: false, error: 'Invalid Bitcoin address format' };
}
```

### QR Code Scanner Integration
```javascript
$.button({
    className: 'scan-qr-button',
    onclick: () => this.scanQRCode(),
    children: [$.i({ className: 'icon-qr' })]
})
```

### Paste Handler
```javascript
handleAddressPaste(event) {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    
    // Extract address from Bitcoin URI if present
    const bitcoinURI = pastedText.match(/bitcoin:([^?]+)/);
    const address = bitcoinURI ? bitcoinURI[1] : pastedText;
    
    // Validate and set
    const validation = this.validateBitcoinAddress(address);
    if (validation.valid) {
        event.target.value = validation.address;
        this.showAddressType(validation.type);
    }
}
```

---

## 2. Amount Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10011-10014, 23992-23995
- **Component**: SendTransactionPanel

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'send-amount',
    className: 'form-input amount-input',
    placeholder: '0.00000000',
    inputMode: 'decimal',
    pattern: '[0-9]*\.?[0-9]*',
    oninput: (e) => this.handleAmountInput(e),
    onblur: (e) => this.formatAmount(e)
})
```

### Amount Validation
```javascript
handleAmountInput(event) {
    let value = event.target.value;
    
    // Allow only numbers and one decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 8 decimal places (Bitcoin precision)
    if (parts[1] && parts[1].length > 8) {
        value = parts[0] + '.' + parts[1].slice(0, 8);
    }
    
    event.target.value = value;
    
    // Update USD equivalent
    this.updateFiatEquivalent(value);
    
    // Validate against balance
    this.validateSufficientBalance(value);
}
```

### Balance Validation
```javascript
validateSufficientBalance(amountBTC) {
    const amount = parseFloat(amountBTC) || 0;
    const balance = this.currentAccount.balance || 0;
    const estimatedFee = this.estimatedFee || 0.0001;
    
    const total = amount + estimatedFee;
    
    if (total > balance) {
        return {
            valid: false,
            error: `Insufficient balance. Available: ${balance.toFixed(8)} BTC`,
            missing: total - balance
        };
    }
    
    return { valid: true, remaining: balance - total };
}
```

### Max Button
```javascript
$.button({
    className: 'max-button',
    onclick: () => this.setMaxAmount(),
    children: ['MAX']
})

setMaxAmount() {
    const balance = this.currentAccount.balance || 0;
    const estimatedFee = this.estimatedFee || 0.0001;
    const maxAmount = Math.max(0, balance - estimatedFee);
    
    document.getElementById('send-amount').value = maxAmount.toFixed(8);
    this.updateFiatEquivalent(maxAmount);
}
```

---

## 3. Fee Selection Forms

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10545-10548, 22561-22564
- **Component**: FeeSelector

### Implementation
```javascript
// Fee rate radio buttons
$.input({
    type: 'radio',
    name: 'fee-option',
    value: id,
    id: `fee-${id}`,
    checked: id === 'medium',
    onchange: (e) => this.updateFeeSelection(e.target.value)
})

// Custom fee input
$.input({
    type: 'number',
    id: 'custom-fee-rate',
    placeholder: 'sat/vB',
    min: '1',
    max: '1000',
    step: '1',
    className: 'custom-fee-input',
    oninput: (e) => this.updateCustomFee(e.target.value)
})
```

### Fee Presets
```javascript
const feePresets = {
    low: {
        label: 'Economy (10+ blocks)',
        multiplier: 0.5,
        confirmationTime: '2-24 hours'
    },
    medium: {
        label: 'Normal (3-6 blocks)',
        multiplier: 1,
        confirmationTime: '30-60 minutes'
    },
    high: {
        label: 'Priority (1-2 blocks)',
        multiplier: 1.5,
        confirmationTime: '10-20 minutes'
    },
    custom: {
        label: 'Custom',
        multiplier: null,
        confirmationTime: 'Variable'
    }
};
```

### Fee Calculation
```javascript
calculateTransactionFee(feeRate, txSize = 250) {
    // Average transaction size in vBytes
    const estimatedSize = txSize; // Simple 1-input, 2-output tx
    const feeInSatoshis = feeRate * estimatedSize;
    const feeInBTC = feeInSatoshis / 100000000;
    
    return {
        satoshis: feeInSatoshis,
        btc: feeInBTC,
        rate: feeRate,
        size: estimatedSize
    };
}
```

---

## 4. Transaction Memo/Label

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: Transaction metadata

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'tx-memo',
    className: 'form-input',
    placeholder: 'Optional: Add a note (stored locally)',
    maxlength: 100,
    autocomplete: 'off'
})
```

### Memo Storage
```javascript
saveTransactionMemo(txId, memo) {
    const memos = JSON.parse(localStorage.getItem('txMemos') || '{}');
    memos[txId] = {
        memo: memo.trim(),
        timestamp: Date.now(),
        accountId: this.currentAccount.id
    };
    localStorage.setItem('txMemos', JSON.stringify(memos));
}
```

---

## 5. Replace-By-Fee (RBF)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: Advanced transaction options

### Implementation
```javascript
$.input({
    type: 'checkbox',
    id: 'enable-rbf',
    className: 'rbf-checkbox',
    onchange: (e) => this.toggleRBF(e.target.checked)
})
```

---

## Common Patterns

### 1. Real-time Validation
```javascript
// Debounced validation
const validateWithDebounce = debounce((value) => {
    const result = this.validateField(value);
    this.updateFieldStatus(result);
}, 300);
```

### 2. Format Display
```javascript
formatBitcoinAmount(amount) {
    const num = parseFloat(amount) || 0;
    return num.toFixed(8).replace(/\.?0+$/, '');
}

formatUSDAmount(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
```

### 3. Error Display
```javascript
showFieldError(fieldId, error) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    const errorDiv = $.div({
        className: 'field-error',
        children: [error]
    });
    
    field.parentElement.appendChild(errorDiv);
}
```

## Mobile Optimizations

### Touch-friendly Inputs
- Minimum 44px touch targets
- Larger buttons for MAX/SEND
- Numeric keyboard for amounts
- Address paste optimization

### Responsive Layout
```css
@media (max-width: 768px) {
    .amount-input {
        font-size: 18px;
        padding: 12px;
    }
    
    .address-input {
        font-size: 14px;
    }
}
```

## Security Considerations

### Address Verification
- Checksum validation
- Visual address confirmation
- Warning for similar addresses
- Network mismatch detection

### Amount Protection
- Balance validation
- Fee inclusion check
- Dust detection (< 546 sats)
- Large amount warnings

## Testing Checklist

- [ ] Valid address formats (all types)
- [ ] Invalid address rejection
- [ ] Amount decimal precision
- [ ] Balance validation
- [ ] Fee calculation accuracy
- [ ] Max amount calculation
- [ ] RBF toggle functionality
- [ ] Memo character limit
- [ ] Mobile keyboard types
- [ ] Paste functionality