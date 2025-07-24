# Fee Customization

**Status**: 🟢 Active
**Type**: Core Feature
**Security Critical**: No
**Implementation**: /public/js/moosh-wallet.js:3250-3264

## Overview
Fee customization allows users to set transaction priorities by adjusting network fees. The system provides real-time fee estimates and lets users choose between speed and cost, ensuring transactions confirm according to their preferences.

## User Flow
```
[Initiate Transaction] → [View Fee Options] → [Select/Customize Fee] → [Preview Total Cost] → [Confirm Transaction]
```

## Technical Implementation

### Frontend
- **Entry Point**: `estimateFees()` method in `moosh-wallet.js:3251`
- **UI Components**: 
  - Fee selection slider
  - Preset fee buttons (Slow/Medium/Fast)
  - Custom fee input
  - Estimated confirmation time
  - Total cost preview
- **State Changes**: 
  - Selected fee rate
  - Transaction total update
  - Confirmation time estimate

### Backend
- **API Endpoints**: 
  - `https://mempool.space/api/v1/fees/recommended`
  - `/api/bitcoin/estimate-fee` (internal)
- **Services Used**: 
  - Mempool.space fee API
  - Internal fee calculation
- **Data Flow**: 
  1. Fetch current fee estimates
  2. Calculate transaction size
  3. Present fee options
  4. User selects/customizes
  5. Update transaction parameters

## Code Example
```javascript
// Fee customization implementation
class FeeManager {
    constructor(app) {
        this.app = app;
        this.feeCache = null;
        this.cacheTimeout = 60000; // 1 minute cache
        this.lastFetch = 0;
    }
    
    async estimateFees() {
        // Check cache
        if (this.feeCache && Date.now() - this.lastFetch < this.cacheTimeout) {
            return this.feeCache;
        }
        
        try {
            const response = await fetch('https://mempool.space/api/v1/fees/recommended');
            const fees = await response.json();
            
            this.feeCache = {
                fast: fees.fastestFee,      // ~10 minutes
                medium: fees.halfHourFee,    // ~30 minutes
                slow: fees.hourFee,          // ~60 minutes
                minimum: fees.minimumFee || 1
            };
            
            this.lastFetch = Date.now();
            return this.feeCache;
            
        } catch (error) {
            console.error('Failed to fetch fee estimates:', error);
            
            // Fallback to defaults
            return {
                fast: 20,
                medium: 10,
                slow: 5,
                minimum: 1
            };
        }
    }
    
    calculateTransactionFee(txSize, feeRate) {
        // Transaction size in vBytes * fee rate in sats/vB
        return txSize * feeRate;
    }
    
    estimateTransactionSize(inputs, outputs) {
        // Rough estimation for P2WPKH transactions
        // Input: ~68 vBytes, Output: ~31 vBytes, Overhead: ~11 vBytes
        const inputSize = inputs * 68;
        const outputSize = outputs * 31;
        const overhead = 11;
        
        return inputSize + outputSize + overhead;
    }
    
    createFeeSelector(transaction) {
        const $ = window.ElementFactory;
        
        return $.div({ className: 'fee-selector' }, [
            $.h4({}, ['Transaction Fee']),
            
            // Preset buttons
            $.div({ className: 'fee-presets' }, [
                this.createFeeButton('slow', 'Slow (~1 hour)'),
                this.createFeeButton('medium', 'Medium (~30 min)'),
                this.createFeeButton('fast', 'Fast (~10 min)')
            ]),
            
            // Custom fee input
            $.div({ className: 'custom-fee' }, [
                $.label({}, ['Custom Fee Rate (sats/vB):']),
                $.input({
                    type: 'number',
                    id: 'customFeeRate',
                    min: 1,
                    max: 1000,
                    value: 10,
                    oninput: (e) => this.updateFeePreview(e.target.value, transaction)
                }),
                $.span({ className: 'fee-warning' }, [])
            ]),
            
            // Fee preview
            $.div({ className: 'fee-preview' }, [
                $.div({ id: 'feeAmount' }, ['Fee: 0.00000000 BTC']),
                $.div({ id: 'feeUSD' }, ['~$0.00 USD']),
                $.div({ id: 'confirmTime' }, ['Estimated confirmation: ~30 minutes'])
            ])
        ]);
    }
    
    createFeeButton(preset, label) {
        const $ = window.ElementFactory;
        
        return $.button({
            className: `fee-preset ${preset}`,
            onclick: async () => {
                const fees = await this.estimateFees();
                const rate = fees[preset];
                
                document.getElementById('customFeeRate').value = rate;
                this.updateFeePreview(rate);
                
                // Update active state
                document.querySelectorAll('.fee-preset').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');
            }
        }, [
            $.div({ className: 'preset-label' }, [label]),
            $.div({ className: 'preset-rate' }, [`${this.feeCache?.[preset] || '...'} sats/vB`])
        ]);
    }
    
    async updateFeePreview(feeRate, transaction) {
        const txSize = this.estimateTransactionSize(
            transaction.inputs.length,
            transaction.outputs.length
        );
        
        const feeSats = this.calculateTransactionFee(txSize, feeRate);
        const feeBTC = feeSats / 100000000;
        
        // Update preview
        document.getElementById('feeAmount').textContent = 
            `Fee: ${feeBTC.toFixed(8)} BTC`;
        
        // Get USD value
        const btcPrice = await this.app.getBTCPrice();
        const feeUSD = feeBTC * btcPrice;
        document.getElementById('feeUSD').textContent = 
            `~$${feeUSD.toFixed(2)} USD`;
        
        // Estimate confirmation time
        const confirmTime = this.estimateConfirmationTime(feeRate);
        document.getElementById('confirmTime').textContent = 
            `Estimated confirmation: ${confirmTime}`;
        
        // Show warnings
        this.showFeeWarnings(feeRate);
    }
    
    estimateConfirmationTime(feeRate) {
        const fees = this.feeCache || { fast: 20, medium: 10, slow: 5 };
        
        if (feeRate >= fees.fast) return '~10 minutes';
        if (feeRate >= fees.medium) return '~30 minutes';
        if (feeRate >= fees.slow) return '~1 hour';
        if (feeRate >= fees.minimum) return '2+ hours';
        return 'May not confirm';
    }
    
    showFeeWarnings(feeRate) {
        const warning = document.querySelector('.fee-warning');
        const fees = this.feeCache || { fast: 20, medium: 10, slow: 5, minimum: 1 };
        
        if (feeRate < fees.minimum) {
            warning.textContent = '⚠️ Fee too low - transaction may not confirm';
            warning.style.color = '#ff4444';
        } else if (feeRate > fees.fast * 2) {
            warning.textContent = '⚠️ Fee higher than necessary';
            warning.style.color = '#ff9944';
        } else {
            warning.textContent = '';
        }
    }
}
```

## Configuration
- **Settings**: 
  - Fee cache duration: 1 minute
  - Min fee rate: 1 sat/vB
  - Max fee rate: 1000 sat/vB
  - Default presets: Slow/Medium/Fast
- **Defaults**: 
  - Medium fee preset selected
  - Auto-fetch current rates
  - Show USD equivalent
  - Confirmation time estimates
- **Limits**: 
  - Custom fee 1-1000 sat/vB
  - Cache refresh every minute
  - 3 preset options

## Security Considerations
- Fee API calls use HTTPS
- No fee manipulation possible
- Validation of custom inputs
- Warning for unusual fees
- No sensitive data exposed

## Performance Impact
- **Load Time**: API call ~200ms
- **Memory**: Minimal (fee cache)
- **Network**: One API call per minute

## Mobile Considerations
- Large touch targets for presets
- Number pad for custom input
- Clear fee impact display
- Responsive layout
- Swipe between presets (planned)

## Error Handling
- **Common Errors**: 
  - Fee API unavailable
  - Invalid fee rate entered
  - Network congestion
  - Price API failure
- **Recovery**: 
  - Fallback to default fees
  - Cache previous values
  - Show last known rates
  - Clear error messages

## Testing
```bash
# Test fee customization
1. Test preset selection:
   - Click each preset
   - Verify fee rate updates
   - Check confirmation estimates
   
2. Test custom fees:
   - Enter 1 sat/vB (minimum)
   - Enter 100 sat/vB (high)
   - Enter 0 (should warn)
   - Enter 1001 (should limit)
   
3. Test fee calculation:
   - Create transaction
   - Change fee rate
   - Verify total updates
   - Check USD conversion
   
4. Test API failures:
   - Block fee API
   - Verify fallback works
   - Check cached values
```

## Future Enhancements
- **Advanced Features**:
  - RBF (Replace-By-Fee) support
  - CPFP (Child-Pays-For-Parent)
  - Fee bumping interface
  - Mempool visualization
  - Priority queue position
- **Estimation Improvements**:
  - Machine learning predictions
  - Historical fee analysis
  - Network congestion alerts
  - Smart fee recommendations
  - Batch transaction discounts
- **User Experience**:
  - Fee impact calculator
  - Saved fee preferences
  - Fee limit alerts
  - Transaction scheduling
  - Fee market analytics