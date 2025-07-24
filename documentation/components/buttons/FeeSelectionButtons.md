# Fee Selection Buttons

## Overview
Fee Selection Buttons allow users to choose transaction priority by selecting different fee rates. They appear in the send modal and affect transaction confirmation speed.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Context**: Send modal, transaction forms
- **Purpose**: Select network fee tier

### Visual Specifications
- **Type**: Radio button group or segmented control
- **Options**: Low, Medium, High, Custom
- **Active State**: Highlighted with accent color
- **Layout**: Horizontal button group

### Implementation

```javascript
renderFeeSelector() {
    const currentFeeRate = this.selectedFeeRate || 'medium';
    
    return $.div({ className: 'fee-selector' }, [
        $.label({ className: 'fee-label' }, ['Network Fee']),
        
        $.div({ className: 'fee-buttons' }, [
            this.renderFeeButton('low', 'Slow', '10+ blocks'),
            this.renderFeeButton('medium', 'Normal', '3-6 blocks'),
            this.renderFeeButton('high', 'Fast', '1-2 blocks'),
            this.renderFeeButton('custom', 'Custom', 'Set manually')
        ]),
        
        $.div({ className: 'fee-details' }, [
            this.renderFeeDetails(currentFeeRate)
        ])
    ]);
}

renderFeeButton(rate, label, time) {
    const isActive = this.selectedFeeRate === rate;
    
    return $.button({
        className: `fee-btn ${isActive ? 'active' : ''}`,
        onclick: () => this.selectFeeRate(rate),
        'data-rate': rate
    }, [
        $.div({ className: 'fee-btn-label' }, [label]),
        $.div({ className: 'fee-btn-time' }, [time])
    ]);
}
```

### Fee Rate Handler

```javascript
async selectFeeRate(rate) {
    // Update selected rate
    this.selectedFeeRate = rate;
    
    // Update UI
    document.querySelectorAll('.fee-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.rate === rate);
    });
    
    if (rate === 'custom') {
        // Show custom fee input
        this.showCustomFeeInput();
    } else {
        // Get recommended fee for selected speed
        const feeRate = await this.getFeeRate(rate);
        this.updateFeeDisplay(feeRate);
        this.recalculateTotal();
    }
    
    // Save preference
    localStorage.setItem('preferred_fee_rate', rate);
}
```

### Fee Estimation

```javascript
async getFeeRate(priority) {
    try {
        // Fetch current fee estimates
        const fees = await this.app.apiService.request('/api/bitcoin/fees');
        
        const feeRates = {
            low: fees.hourFee,          // ~6 blocks
            medium: fees.halfHourFee,   // ~3 blocks
            high: fees.fastestFee       // ~1 block
        };
        
        return feeRates[priority] || feeRates.medium;
        
    } catch (error) {
        // Fallback to default rates
        const fallbackRates = {
            low: 5,      // sat/vB
            medium: 15,
            high: 30
        };
        
        return fallbackRates[priority];
    }
}
```

### Custom Fee Input

```javascript
showCustomFeeInput() {
    const container = $.div({ className: 'custom-fee-input' }, [
        $.input({
            type: 'number',
            id: 'customFeeRate',
            placeholder: 'sat/vB',
            min: '1',
            max: '1000',
            value: this.customFeeRate || '20',
            oninput: (e) => this.updateCustomFee(e.target.value)
        }),
        $.span({ className: 'fee-unit' }, ['sat/vB'])
    ]);
    
    document.querySelector('.fee-details').appendChild(container);
}

updateCustomFee(value) {
    const feeRate = parseInt(value);
    
    if (feeRate < 1) {
        this.showWarning('Fee too low - transaction may never confirm');
    } else if (feeRate > 100) {
        this.showWarning('Fee seems high - please double-check');
    }
    
    this.customFeeRate = feeRate;
    this.updateFeeDisplay(feeRate);
    this.recalculateTotal();
}
```

### Fee Details Display

```javascript
renderFeeDetails(rate) {
    const feeRate = this.getFeeRateValue(rate);
    const txSize = this.estimateTransactionSize();
    const totalFee = (txSize * feeRate) / 100000000; // Convert to BTC
    const totalFeeUSD = totalFee * this.btcPrice;
    
    return $.div({ className: 'fee-info' }, [
        $.div({ className: 'fee-row' }, [
            $.span({}, ['Fee Rate:']),
            $.span({}, [`${feeRate} sat/vB`])
        ]),
        $.div({ className: 'fee-row' }, [
            $.span({}, ['Estimated Fee:']),
            $.span({}, [`${totalFee.toFixed(8)} BTC ($${totalFeeUSD.toFixed(2)})`])
        ]),
        $.div({ className: 'fee-row' }, [
            $.span({}, ['Confirmation Time:']),
            $.span({}, [this.getConfirmationTime(rate)])
        ])
    ]);
}
```

### CSS Styles

```css
.fee-selector {
    margin: 20px 0;
    padding: 16px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
    border-radius: 8px;
}

.fee-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 12px 0;
}

.fee-btn {
    padding: 12px 8px;
    background: transparent;
    border: 2px solid #333333;
    color: #999999;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    position: relative;
}

.fee-btn:hover {
    border-color: #666666;
    color: #ffffff;
}

.fee-btn.active {
    background: rgba(245, 115, 21, 0.1);
    border-color: #f57315;
    color: #f57315;
}

.fee-btn-label {
    font-weight: 600;
    font-size: 14px;
}

.fee-btn-time {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 4px;
}

.fee-details {
    margin-top: 16px;
    font-size: 13px;
}

.fee-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.fee-row {
    display: flex;
    justify-content: space-between;
    color: #999999;
}

.custom-fee-input {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
}

.custom-fee-input input {
    width: 100px;
    padding: 8px;
    background: #000000;
    border: 1px solid #333333;
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace;
}
```

### Fee Warnings

```javascript
checkFeeWarnings(feeRate, priority) {
    const warnings = [];
    
    // Check if fee is too low
    if (feeRate < 2) {
        warnings.push({
            level: 'danger',
            message: 'Transaction may never confirm with this fee'
        });
    }
    
    // Check if fee is unusually high
    if (feeRate > 100) {
        warnings.push({
            level: 'warning',
            message: 'Fee is unusually high for current network conditions'
        });
    }
    
    // Check mempool congestion
    if (this.mempoolSize > 100000 && priority === 'low') {
        warnings.push({
            level: 'info',
            message: 'Network is congested - consider using higher fee'
        });
    }
    
    return warnings;
}
```

### RBF (Replace-By-Fee) Support

```javascript
// Enable RBF for fee bumping later
enableRBF() {
    return $.div({ className: 'rbf-option' }, [
        $.input({
            type: 'checkbox',
            id: 'enableRBF',
            checked: true,
            onchange: (e) => this.setRBF(e.target.checked)
        }),
        $.label({ for: 'enableRBF' }, [
            'Enable fee bumping (RBF)',
            $.span({ className: 'tooltip' }, ['?'])
        ])
    ]);
}
```

### Mobile Optimizations
- Larger touch targets
- Vertical layout on small screens
- Simplified time estimates
- Clear active state indication

### Related Components
- Transaction Size Calculator
- Fee Estimator Service
- Total Amount Display
- Send Button (disabled if fee too high)
- RBF Options