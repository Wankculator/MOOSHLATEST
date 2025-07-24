# Fee Forms Documentation

## Overview
Fee forms in MOOSH Wallet handle transaction fee configuration, including preset options, custom fee rates, and Replace-By-Fee (RBF) settings.

## 1. Fee Option Radio Buttons

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10545-10548
- **Component**: FeeSelector

### Implementation
```javascript
// Fee preset radio buttons
['low', 'medium', 'high', 'custom'].forEach(level => {
    $.div({ className: 'fee-option' }, [
        $.input({
            type: 'radio',
            name: 'fee-option',
            value: level,
            id: `fee-${level}`,
            checked: level === this.defaultFeeLevel,
            onchange: (e) => this.updateFeeSelection(e.target.value)
        }),
        $.label({ 
            for: `fee-${level}`,
            className: 'fee-label'
        }, [
            $.span({ className: 'fee-level' }, feePresets[level].label),
            $.span({ className: 'fee-time' }, feePresets[level].confirmationTime),
            $.span({ className: 'fee-rate' }, `${this.getFeeRate(level)} sat/vB`)
        ])
    ])
});
```

### Fee Presets Configuration
```javascript
const feePresets = {
    low: {
        label: 'Economy',
        multiplier: 0.5,
        confirmationTime: '2-24 hours',
        description: 'Lowest fee, slowest confirmation'
    },
    medium: {
        label: 'Normal',
        multiplier: 1.0,
        confirmationTime: '30-60 minutes',
        description: 'Standard fee for most transactions'
    },
    high: {
        label: 'Priority',
        multiplier: 1.5,
        confirmationTime: '10-20 minutes',
        description: 'Higher fee for faster confirmation'
    },
    custom: {
        label: 'Custom',
        multiplier: null,
        confirmationTime: 'Variable',
        description: 'Set your own fee rate'
    }
};
```

---

## 2. Custom Fee Rate Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 22561-22564
- **Component**: CustomFeeInput

### Implementation
```javascript
$.input({
    type: 'number',
    id: 'custom-fee-rate',
    className: 'custom-fee-input',
    placeholder: '10',
    min: '1',
    max: '1000',
    step: '1',
    value: this.customFeeRate || '',
    disabled: this.selectedFeeLevel !== 'custom',
    oninput: (e) => this.validateCustomFee(e.target.value),
    onblur: (e) => this.updateCustomFee(e.target.value)
})
```

### Custom Fee Validation
```javascript
validateCustomFee(value) {
    const fee = parseFloat(value);
    
    // Basic validation
    if (isNaN(fee) || fee <= 0) {
        return { 
            valid: false, 
            error: 'Fee must be a positive number' 
        };
    }
    
    // Range validation
    if (fee < 1) {
        return { 
            valid: false, 
            error: 'Minimum fee is 1 sat/vB' 
        };
    }
    
    if (fee > 1000) {
        return { 
            valid: false, 
            error: 'Maximum fee is 1000 sat/vB' 
        };
    }
    
    // Warning thresholds
    const warnings = [];
    if (fee < 2) {
        warnings.push('Very low fee - transaction may not confirm');
    }
    if (fee > 100) {
        warnings.push('High fee warning - consider using a lower rate');
    }
    if (fee > 500) {
        warnings.push('Extremely high fee - are you sure?');
    }
    
    return { 
        valid: true, 
        value: fee, 
        warnings 
    };
}
```

---

## 3. Fee Estimation Display

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: FeeEstimator

### Implementation
```javascript
// Dynamic fee display
$.div({ className: 'fee-estimation' }, [
    $.div({ className: 'fee-details' }, [
        $.span({ className: 'label' }, 'Transaction size:'),
        $.span({ id: 'tx-size' }, '0 vBytes')
    ]),
    $.div({ className: 'fee-details' }, [
        $.span({ className: 'label' }, 'Fee rate:'),
        $.span({ id: 'fee-rate' }, '0 sat/vB')
    ]),
    $.div({ className: 'fee-details total' }, [
        $.span({ className: 'label' }, 'Total fee:'),
        $.span({ id: 'total-fee' }, '0 BTC'),
        $.span({ id: 'fee-usd' }, '($0.00)')
    ])
])
```

### Fee Calculation
```javascript
calculateTransactionFee(inputs, outputs, feeRate) {
    // Calculate transaction size (vBytes)
    // P2WPKH: 68 vBytes per input, 31 vBytes per output
    // P2PKH: 148 vBytes per input, 34 vBytes per output
    
    let vBytes = 10; // Base transaction size
    
    inputs.forEach(input => {
        switch(input.type) {
            case 'P2WPKH':
                vBytes += 68;
                break;
            case 'P2PKH':
                vBytes += 148;
                break;
            case 'P2SH-P2WPKH':
                vBytes += 91;
                break;
            case 'P2TR':
                vBytes += 57.5;
                break;
            default:
                vBytes += 148; // Conservative estimate
        }
    });
    
    outputs.forEach(output => {
        switch(output.type) {
            case 'P2WPKH':
            case 'P2SH':
                vBytes += 31;
                break;
            case 'P2PKH':
                vBytes += 34;
                break;
            case 'P2TR':
                vBytes += 43;
                break;
            default:
                vBytes += 34;
        }
    });
    
    // Calculate fee
    const totalFeeSats = Math.ceil(vBytes * feeRate);
    const totalFeeBTC = totalFeeSats / 100000000;
    
    return {
        vBytes: Math.ceil(vBytes),
        feeRate,
        totalSats: totalFeeSats,
        totalBTC: totalFeeBTC,
        totalUSD: totalFeeBTC * this.btcPrice
    };
}
```

---

## 4. Replace-By-Fee (RBF) Toggle

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: AdvancedTransactionOptions

### Implementation
```javascript
$.div({ className: 'rbf-container' }, [
    $.input({
        type: 'checkbox',
        id: 'enable-rbf',
        className: 'rbf-checkbox',
        checked: this.rbfEnabled,
        onchange: (e) => this.toggleRBF(e.target.checked)
    }),
    $.label({ 
        for: 'enable-rbf',
        className: 'rbf-label'
    }, [
        'Enable Replace-By-Fee (RBF)',
        $.span({ 
            className: 'info-icon',
            title: 'Allows fee bumping if transaction is stuck'
        }, '?')
    ])
])
```

---

## 5. CPFP (Child Pays For Parent) Options

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: CPFPOptions

### Implementation
```javascript
// CPFP fee input for stuck transactions
$.div({ className: 'cpfp-options' }, [
    $.h4({}, 'Boost stuck transaction'),
    $.input({
        type: 'number',
        id: 'cpfp-fee-rate',
        placeholder: 'New fee rate (sat/vB)',
        min: '1',
        className: 'cpfp-input',
        oninput: (e) => this.calculateCPFPCost(e.target.value)
    }),
    $.div({ id: 'cpfp-cost-estimate' }, [
        'Additional cost: 0 BTC'
    ])
])
```

### CPFP Calculation
```javascript
calculateCPFPCost(newFeeRate) {
    const parentTx = this.stuckTransaction;
    const parentFeeRate = parentTx.feeRate;
    const parentSize = parentTx.vBytes;
    
    // Estimate child transaction size (1 input, 1 output)
    const childSize = 110; // vBytes
    
    // Calculate required fee for child
    const targetTotalFee = (parentSize + childSize) * newFeeRate;
    const parentFee = parentSize * parentFeeRate;
    const childFee = targetTotalFee - parentFee;
    
    if (childFee <= 0) {
        return { 
            valid: false, 
            error: 'New fee rate must be higher than parent' 
        };
    }
    
    const childFeeRate = childFee / childSize;
    
    return {
        valid: true,
        childFee: childFee / 100000000, // BTC
        childFeeRate,
        effectiveFeeRate: newFeeRate
    };
}
```

---

## 6. Fee Slider (Alternative UI)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: FeeSlider

### Implementation
```javascript
$.div({ className: 'fee-slider-container' }, [
    $.input({
        type: 'range',
        id: 'fee-slider',
        className: 'fee-slider',
        min: '1',
        max: '200',
        step: '1',
        value: this.currentFeeRate,
        oninput: (e) => this.updateFeeFromSlider(e.target.value)
    }),
    $.div({ className: 'slider-labels' }, [
        $.span({ className: 'min-label' }, 'Slow'),
        $.span({ className: 'current-rate' }, `${this.currentFeeRate} sat/vB`),
        $.span({ className: 'max-label' }, 'Fast')
    ])
])
```

### Slider Styling
```css
.fee-slider {
    width: 100%;
    height: 6px;
    background: linear-gradient(
        to right,
        #ff0000 0%,
        #ffff00 50%,
        #00ff00 100%
    );
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.fee-slider:hover {
    opacity: 1;
}

.fee-slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 50%;
    cursor: pointer;
}
```

---

## Common Patterns

### 1. Fee Market Data Integration
```javascript
async fetchFeeEstimates() {
    try {
        const response = await this.app.apiService.request('/api/fees/recommended');
        
        return {
            fastest: response.fastestFee,    // Next block
            halfHour: response.halfHourFee,   // 3 blocks
            hour: response.hourFee,           // 6 blocks
            economy: response.economyFee      // 10+ blocks
        };
    } catch (error) {
        // Fallback to local estimates
        return {
            fastest: 50,
            halfHour: 20,
            hour: 10,
            economy: 5
        };
    }
}
```

### 2. Dynamic Fee Updates
```javascript
// Update fees based on mempool conditions
setInterval(async () => {
    const estimates = await this.fetchFeeEstimates();
    this.updateFeePresets(estimates);
    this.refreshFeeDisplay();
}, 60000); // Every minute
```

### 3. Fee Bump for RBF
```javascript
calculateRBFBumpFee(originalFeeRate) {
    // BIP 125 requires at least 1 sat/vB increase
    const minBump = originalFeeRate + 1;
    
    // Recommend 25% increase or market rate
    const recommendedBump = Math.max(
        originalFeeRate * 1.25,
        this.currentMarketRate
    );
    
    return {
        minimum: minBump,
        recommended: Math.ceil(recommendedBump),
        maximum: originalFeeRate * 3 // 3x cap
    };
}
```

## Mobile Considerations

### Touch-Friendly Controls
- Large radio button touch targets (44px minimum)
- Slider with increased thumb size on mobile
- Number input with numeric keyboard

### Responsive Layout
```css
@media (max-width: 768px) {
    .fee-option {
        padding: 16px;
        margin-bottom: 8px;
    }
    
    .custom-fee-input {
        font-size: 18px;
        padding: 12px;
    }
}
```

## Accessibility

### ARIA Labels
```javascript
$.input({
    type: 'range',
    'aria-label': 'Transaction fee rate',
    'aria-valuemin': '1',
    'aria-valuemax': '200',
    'aria-valuenow': this.currentFeeRate,
    'aria-valuetext': `${this.currentFeeRate} satoshis per virtual byte`
})
```

## Testing Checklist

- [ ] Fee preset selection
- [ ] Custom fee validation
- [ ] Fee calculation accuracy
- [ ] RBF toggle functionality
- [ ] CPFP calculation
- [ ] Slider responsiveness
- [ ] Market rate updates
- [ ] Warning thresholds
- [ ] Mobile numeric input
- [ ] Accessibility labels