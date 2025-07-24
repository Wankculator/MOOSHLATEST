# Exchange Forms Documentation

## Overview
Exchange forms handle cryptocurrency swaps, slippage settings, and decentralized exchange interactions within MOOSH Wallet.

## 1. Swap Amount Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 23992-23995
- **Component**: SwapInterface

### Implementation
```javascript
// From amount input
$.input({
    type: 'text',
    inputMode: 'decimal',
    placeholder: '0.00',
    className: 'swap-amount-input from-amount',
    value: this.fromAmount,
    oninput: (e) => this.handleFromAmountChange(e.target.value),
    onblur: (e) => this.formatSwapAmount(e),
    style: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'right',
        border: 'none',
        background: 'transparent'
    }
})

// To amount input (usually read-only)
$.input({
    type: 'text',
    inputMode: 'decimal',
    placeholder: '0.00',
    className: 'swap-amount-input to-amount',
    value: this.toAmount,
    readOnly: true,
    style: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'right',
        border: 'none',
        background: 'transparent',
        color: '#888'
    }
})
```

### Amount Validation and Conversion
```javascript
handleFromAmountChange(value) {
    // Sanitize input
    value = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimals
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Update state
    this.fromAmount = value;
    
    // Debounced quote fetch
    clearTimeout(this.quoteTimeout);
    this.quoteTimeout = setTimeout(() => {
        if (value && parseFloat(value) > 0) {
            this.fetchSwapQuote();
        } else {
            this.toAmount = '';
            this.clearQuote();
        }
    }, 500);
    
    // Check balance
    this.validateSwapBalance(value);
}

async fetchSwapQuote() {
    try {
        this.showQuoteLoading();
        
        const quote = await this.swapService.getQuote({
            fromToken: this.fromToken,
            toToken: this.toToken,
            amount: this.fromAmount,
            slippage: this.slippage
        });
        
        this.displayQuote(quote);
        this.toAmount = quote.estimatedOutput;
        
    } catch (error) {
        this.showQuoteError(error.message);
    }
}
```

---

## 2. Token/Asset Selector

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: TokenSelector

### Implementation
```javascript
// Token dropdown with search
$.div({ className: 'token-selector' }, [
    $.input({
        type: 'text',
        placeholder: 'Search tokens...',
        className: 'token-search',
        oninput: (e) => this.filterTokens(e.target.value)
    }),
    $.div({ className: 'token-list' }, 
        this.filteredTokens.map(token => 
            $.div({
                className: 'token-item',
                onclick: () => this.selectToken(token),
                children: [
                    $.img({ 
                        src: token.logo, 
                        className: 'token-logo',
                        onerror: (e) => e.target.src = '/images/default-token.png'
                    }),
                    $.div({ className: 'token-info' }, [
                        $.div({ className: 'token-symbol' }, token.symbol),
                        $.div({ className: 'token-name' }, token.name)
                    ]),
                    $.div({ className: 'token-balance' }, [
                        $.div({}, this.formatBalance(token.balance)),
                        $.div({ className: 'token-value' }, 
                            `$${this.calculateValue(token.balance, token.price)}`
                        )
                    ])
                ]
            })
        )
    )
])
```

### Token Search and Filtering
```javascript
filterTokens(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
        this.filteredTokens = this.allTokens;
        return;
    }
    
    this.filteredTokens = this.allTokens.filter(token => {
        return (
            token.symbol.toLowerCase().includes(query) ||
            token.name.toLowerCase().includes(query) ||
            token.address?.toLowerCase().includes(query)
        );
    });
    
    // Sort by relevance and balance
    this.filteredTokens.sort((a, b) => {
        // Exact symbol match first
        if (a.symbol.toLowerCase() === query) return -1;
        if (b.symbol.toLowerCase() === query) return 1;
        
        // Then by balance
        return b.balanceUSD - a.balanceUSD;
    });
}
```

---

## 3. Slippage Settings

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 24509-24512
- **Component**: SlippageSettings

### Implementation
```javascript
// Slippage preset buttons
$.div({ className: 'slippage-presets' }, [
    [0.1, 0.5, 1.0, 3.0].map(value => 
        $.button({
            className: `slippage-preset ${this.slippage === value ? 'active' : ''}`,
            onclick: () => this.setSlippage(value),
            children: [`${value}%`]
        })
    ),
    
    // Custom slippage input
    $.input({
        type: 'number',
        value: this.slippage,
        placeholder: 'Custom',
        min: '0.01',
        max: '50',
        step: '0.01',
        className: 'custom-slippage',
        oninput: (e) => this.setCustomSlippage(e.target.value),
        style: {
            width: '80px',
            marginLeft: '8px'
        }
    }),
    $.span({}, '%')
])
```

### Slippage Validation
```javascript
setCustomSlippage(value) {
    const slippage = parseFloat(value);
    
    // Validation
    if (isNaN(slippage) || slippage < 0) {
        this.showError('Invalid slippage value');
        return;
    }
    
    // Warnings
    if (slippage > 10) {
        this.showWarning('High slippage! You may lose significant value');
    } else if (slippage < 0.05) {
        this.showWarning('Very low slippage may cause transaction to fail');
    }
    
    // Max limit
    if (slippage > 50) {
        this.showError('Maximum slippage is 50%');
        return;
    }
    
    this.slippage = slippage;
    this.updateQuoteWithNewSlippage();
}
```

---

## 4. Swap Route Display

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: SwapRoute

### Implementation
```javascript
// Route visualization
$.div({ className: 'swap-route' }, [
    $.div({ className: 'route-header' }, 'Best Route'),
    $.div({ className: 'route-path' }, 
        route.path.map((hop, index) => [
            $.div({ className: 'route-token' }, [
                $.img({ src: hop.token.logo, className: 'token-icon' }),
                $.span({}, hop.token.symbol)
            ]),
            index < route.path.length - 1 && 
                $.div({ className: 'route-arrow' }, '→')
        ]).flat()
    ),
    $.div({ className: 'route-details' }, [
        $.div({}, `DEX: ${route.dex}`),
        $.div({}, `Gas: $${route.estimatedGas}`),
        $.div({}, `Price Impact: ${route.priceImpact}%`)
    ])
])
```

---

## 5. Transaction Settings

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: SwapTransactionSettings

### Implementation
```javascript
// Gas price selector
$.select({
    className: 'gas-price-select',
    value: this.gasPrice,
    onchange: (e) => this.updateGasPrice(e.target.value),
    children: [
        $.option({ value: 'slow' }, 'Slow (5 gwei)'),
        $.option({ value: 'standard' }, 'Standard (15 gwei)'),
        $.option({ value: 'fast' }, 'Fast (30 gwei)'),
        $.option({ value: 'instant' }, 'Instant (50 gwei)')
    ]
})

// Deadline input
$.div({ className: 'deadline-setting' }, [
    $.label({}, 'Transaction deadline:'),
    $.input({
        type: 'number',
        value: this.deadline,
        min: '1',
        max: '60',
        className: 'deadline-input',
        onchange: (e) => this.updateDeadline(e.target.value)
    }),
    $.span({}, 'minutes')
])

// MEV Protection
$.label({ className: 'mev-protection' }, [
    $.input({
        type: 'checkbox',
        checked: this.mevProtection,
        onchange: (e) => this.toggleMEVProtection(e.target.checked)
    }),
    $.span({}, 'Enable MEV Protection')
])
```

---

## 6. Swap Confirmation

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: SwapConfirmation

### Implementation
```javascript
// Confirmation modal inputs
$.div({ className: 'swap-confirmation' }, [
    // Summary (read-only)
    $.input({
        type: 'text',
        value: `Swap ${this.fromAmount} ${this.fromToken.symbol} for ${this.toAmount} ${this.toToken.symbol}`,
        readOnly: true,
        className: 'swap-summary'
    }),
    
    // Price impact warning
    this.priceImpact > 3 && $.div({
        className: 'price-impact-warning',
        children: [
            $.i({ className: 'icon-warning' }),
            $.span({}, `Price impact: ${this.priceImpact}%`)
        ]
    }),
    
    // Final confirmation checkbox
    $.label({ className: 'confirmation-check' }, [
        $.input({
            type: 'checkbox',
            id: 'confirm-swap',
            onchange: (e) => this.enableSwapButton(e.target.checked)
        }),
        $.span({}, 'I understand the risks and want to proceed')
    ])
])
```

---

## Common Patterns

### 1. Rate Refresh
```javascript
// Auto-refresh quotes
startQuoteRefresh() {
    this.refreshInterval = setInterval(() => {
        if (this.fromAmount && this.toToken) {
            this.fetchSwapQuote();
        }
    }, 15000); // Every 15 seconds
}

// Manual refresh button
$.button({
    className: 'refresh-quote',
    onclick: () => this.fetchSwapQuote(),
    children: [
        $.i({ className: 'icon-refresh' }),
        $.span({}, 'Refresh')
    ]
})
```

### 2. Balance Validation
```javascript
validateSwapBalance(amount) {
    const balance = this.getTokenBalance(this.fromToken);
    const amountNum = parseFloat(amount) || 0;
    
    if (amountNum > balance) {
        this.showError(`Insufficient balance. Available: ${balance}`);
        this.disableSwapButton();
        return false;
    }
    
    // Check for gas
    const estimatedGas = this.estimateGasCost();
    const nativeBalance = this.getNativeBalance();
    
    if (estimatedGas > nativeBalance) {
        this.showError('Insufficient gas for transaction');
        this.disableSwapButton();
        return false;
    }
    
    this.enableSwapButton();
    return true;
}
```

### 3. Price Impact Calculation
```javascript
calculatePriceImpact(quote) {
    const expectedPrice = quote.fromTokenPrice / quote.toTokenPrice;
    const executionPrice = quote.fromAmount / quote.toAmount;
    const priceImpact = ((executionPrice - expectedPrice) / expectedPrice) * 100;
    
    return {
        impact: Math.abs(priceImpact),
        severity: this.getPriceImpactSeverity(priceImpact)
    };
}

getPriceImpactSeverity(impact) {
    if (impact < 1) return 'low';
    if (impact < 3) return 'medium';
    if (impact < 5) return 'high';
    return 'severe';
}
```

## Mobile Considerations

### Touch-Friendly Swap
```javascript
// Swap direction button
$.button({
    className: 'swap-direction',
    onclick: () => this.reverseSwapDirection(),
    'aria-label': 'Reverse swap direction',
    children: [$.i({ className: 'icon-swap' })]
})
```

### Responsive Token List
```css
@media (max-width: 768px) {
    .token-list {
        max-height: 60vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    .swap-amount-input {
        font-size: 20px;
    }
}
```

## Security Considerations

### Quote Verification
- Verify quote signatures
- Check price oracle data
- Validate contract addresses
- Monitor for sandwich attacks

### Transaction Safety
- Show clear warnings for high slippage
- Require confirmation for large swaps
- Display all fees upfront
- Allow transaction cancellation

## Testing Checklist

- [ ] Amount input validation
- [ ] Token search functionality
- [ ] Slippage calculations
- [ ] Quote fetching and refresh
- [ ] Balance validation
- [ ] Price impact warnings
- [ ] Gas estimation
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Transaction confirmation flow