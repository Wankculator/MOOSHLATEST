# FeeCustomizationModal Component Documentation

## Overview
The Fee Customization functionality in MOOSH Wallet is currently integrated within the Send modal rather than being a standalone modal. It allows users to select transaction priority levels that determine the fee rate. This documentation covers the current implementation and a proposed enhanced modal version.

## Current Implementation
- **Location**: Within Send modal (Lines 10574, 10625, 22640)
- **Type**: Radio button selection
- **Options**: Low, Normal, High priority

## Visual Design

### Current Fee Selection (in Send Modal)
```
Fee Priority:
◉ Low (10+ min) - 1 sat/vB
○ Normal (30 min) - 5 sat/vB  
○ High (10 min) - 15 sat/vB
```

### Proposed Standalone Modal ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│  Transaction Fee Customization                     [×]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Current Network Conditions:                            │
│  • Next Block: 25 sat/vB                               │
│  • 30 minutes: 15 sat/vB                               │
│  • 1 hour: 8 sat/vB                                    │
│                                                         │
│  Select Fee Priority:                                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ◉ High Priority                                   │  │
│  │   ~10 minutes • 25 sat/vB                         │  │
│  │   Estimated Fee: 0.00003750 BTC (~$1.69)         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ○ Medium Priority                                 │  │
│  │   ~30 minutes • 15 sat/vB                         │  │
│  │   Estimated Fee: 0.00002250 BTC (~$1.01)         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ○ Low Priority                                    │  │
│  │   ~1 hour • 8 sat/vB                              │  │
│  │   Estimated Fee: 0.00001200 BTC (~$0.54)         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ○ Custom                                          │  │
│  │   ┌─────────────┐ sat/vB                         │  │
│  │   │     10      │                                 │  │
│  │   └─────────────┘                                 │  │
│  │   Estimated Fee: 0.00001500 BTC (~$0.68)         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Transaction Size: ~150 vBytes                         │
│                                                         │
│              [ Confirm Fee Selection ]                  │
└─────────────────────────────────────────────────────────┘
```

## Current Implementation Details

### Fee Rate Selection
**Location**: Line 10574

```javascript
const feeRate = document.getElementById('fee-rate')?.value || 'normal';
```

### Fee Option Creation
**Location**: Lines 10544-10559

```javascript
createFeeOption(id, label, time, rate, isSelected) {
    return $.div({ className: 'fee-option' }, [
        $.input({
            type: 'radio',
            name: 'feeRate',
            id: `fee-${id}`,
            value: id,
            checked: isSelected
        }),
        $.div({ className: 'fee-details' }, [
            $.div({ className: 'fee-label' }, [label]),
            $.div({ className: 'fee-info' }, [
                $.span({ className: 'fee-time' }, [time]),
                $.span({ className: 'fee-rate' }, [rate])
            ])
        ])
    ]);
}
```

### Transaction Execution
**Location**: Line 10625

```javascript
async executeTransaction(address, amountSats, feeRate) {
    const transaction = await this.app.createTransaction({
        to: address,
        amount: amountSats,
        feeRate: feeRate,
        privateKey: currentAccount.privateKeys?.bitcoin?.wif
    });
}
```

## Proposed Modal Implementation

### Class Structure
```javascript
class FeeCustomizationModal {
    constructor(app, options = {}) {
        this.app = app;
        this.modal = null;
        this.options = {
            transactionSize: options.transactionSize || 150,
            amount: options.amount || 0,
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {})
        };
        this.selectedPriority = 'medium';
        this.customFeeRate = 10;
        this.feeEstimates = null;
    }
}
```

### Fee Levels Configuration
```javascript
const feeLevels = {
    high: {
        name: 'High Priority',
        targetBlocks: 1,
        estimatedTime: '~10 minutes',
        multiplier: 1.5  // 50% above medium
    },
    medium: {
        name: 'Medium Priority',
        targetBlocks: 3,
        estimatedTime: '~30 minutes',
        multiplier: 1.0
    },
    low: {
        name: 'Low Priority',
        targetBlocks: 6,
        estimatedTime: '~1 hour',
        multiplier: 0.5  // 50% of medium
    },
    custom: {
        name: 'Custom',
        allowInput: true
    }
};
```

## Fee Estimation

### API Integration
```javascript
async fetchFeeEstimates() {
    try {
        // Primary: mempool.space API
        const response = await fetch('https://mempool.space/api/v1/fees/recommended');
        const data = await response.json();
        
        return {
            fastest: data.fastestFee,      // Next block
            halfHour: data.halfHourFee,     // 3 blocks
            hour: data.hourFee,             // 6 blocks
            economy: data.economyFee,       // 144 blocks
            minimum: data.minimumFee        // Minimum relay
        };
    } catch (error) {
        // Fallback estimates
        return {
            fastest: 25,
            halfHour: 15,
            hour: 8,
            economy: 3,
            minimum: 1
        };
    }
}
```

### Fee Calculation
```javascript
calculateFee(feeRate, transactionSize) {
    const feeInSatoshis = feeRate * transactionSize;
    const feeInBTC = feeInSatoshis / 100000000;
    const feeInUSD = feeInBTC * this.app.state.get('btcPrice');
    
    return {
        satoshis: feeInSatoshis,
        btc: feeInBTC,
        usd: feeInUSD,
        rate: feeRate
    };
}
```

## UI Components

### Priority Option Card
```javascript
createPriorityOption(level, config, isSelected) {
    const fee = this.calculateFee(config.rate, this.options.transactionSize);
    
    return $.div({
        className: `fee-priority-option ${isSelected ? 'selected' : ''}`,
        onclick: () => this.selectPriority(level)
    }, [
        $.div({ className: 'priority-radio' }, [
            $.input({
                type: 'radio',
                name: 'feePriority',
                value: level,
                checked: isSelected
            })
        ]),
        $.div({ className: 'priority-details' }, [
            $.div({ className: 'priority-name' }, [config.name]),
            $.div({ className: 'priority-info' }, [
                $.span({ className: 'time' }, [config.estimatedTime]),
                $.span({ className: 'rate' }, [`${config.rate} sat/vB`])
            ]),
            $.div({ className: 'priority-cost' }, [
                `Estimated Fee: ${fee.btc.toFixed(8)} BTC (~$${fee.usd.toFixed(2)})`
            ])
        ])
    ]);
}
```

### Custom Fee Input
```javascript
createCustomFeeInput() {
    return $.div({ className: 'custom-fee-input' }, [
        $.input({
            type: 'number',
            id: 'customFeeRate',
            value: this.customFeeRate,
            min: '1',
            max: '1000',
            disabled: this.selectedPriority !== 'custom',
            oninput: (e) => this.updateCustomFee(e.target.value)
        }),
        $.span({}, ['sat/vB'])
    ]);
}
```

## Network Conditions Display

### Real-time Fee Market
```javascript
createNetworkConditions() {
    return $.div({ className: 'network-conditions' }, [
        $.h4({}, ['Current Network Conditions:']),
        $.ul({}, [
            $.li({}, [`Next Block: ${this.feeEstimates.fastest} sat/vB`]),
            $.li({}, [`30 minutes: ${this.feeEstimates.halfHour} sat/vB`]),
            $.li({}, [`1 hour: ${this.feeEstimates.hour} sat/vB`])
        ])
    ]);
}
```

## State Management

### Fee Selection State
```javascript
{
    feeCustomization: {
        selectedPriority: 'medium',
        customRate: 10,
        estimates: {
            high: 25,
            medium: 15,
            low: 8
        },
        lastUpdated: timestamp
    }
}
```

### Integration with Send Modal
```javascript
// In send modal
showFeeCustomization() {
    const modal = new FeeCustomizationModal(this.app, {
        transactionSize: this.estimatedSize,
        amount: this.sendAmount,
        onConfirm: (feeRate) => {
            this.selectedFeeRate = feeRate;
            this.updateTransactionSummary();
        }
    });
    modal.show();
}
```

## Mobile Responsiveness

### Mobile Layout
- Single column layout
- Larger touch targets
- Simplified network conditions
- Prominent fee amounts

### Touch Interactions
- Tap to select priority
- Number pad for custom input
- Swipe down to dismiss

## Security Considerations

1. **Fee Validation**
   - Minimum 1 sat/vB
   - Maximum reasonable limit
   - Warn about stuck transactions

2. **Cost Display**
   - Always show total cost
   - Update with BTC price
   - Warn about high fees

3. **Network Safety**
   - Prevent zero fee
   - Warn about low fees
   - Show confirmation time

## User Experience

### Fee Selection Flow
1. Open fee customization
2. See current network conditions
3. Compare priority options
4. View estimated costs
5. Select or enter custom
6. Confirm selection

### Visual Feedback
- Selected option highlighted
- Real-time cost updates
- Network status indicators
- Clear time estimates

## Best Practices

1. **Always fetch latest** fee estimates
2. **Show total cost** in BTC and USD
3. **Explain time estimates** clearly
4. **Allow custom fees** for advanced users
5. **Validate reasonable** fee ranges
6. **Update dynamically** as user types
7. **Save preferences** for future use

## Future Enhancements

1. **Advanced Features**
   - RBF (Replace-By-Fee) support
   - CPFP (Child-Pays-For-Parent)
   - Batch transaction support
   - Fee bumping

2. **Analytics**
   - Historical fee charts
   - Prediction accuracy
   - Optimal timing suggestions

3. **Integrations**
   - Multiple fee APIs
   - Lightning fee comparison
   - Exchange withdrawal fees