# SwapModal Component Documentation

## Overview
The SwapModal is a comprehensive token swapping interface that allows users to exchange between BTC, USDT, USDC, and MOOSH tokens. It features a modern, responsive design with real-time price calculations, slippage protection, and mobile-optimized interactions.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 23175-24639
- **Class Definition**: `class SwapModal`

## Visual Design

### ASCII Layout (Desktop)
```
┌────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐   │
│ │  ⇄  MOOSH SWAP                    [⚙] [×]    │   │
│ └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ From:                             [BTC  ▼]   │   │
│  │ ┌───────────────────────────────────────┐   │   │
│  │ │ 0.000000                             │   │   │
│  │ └───────────────────────────────────────┘   │   │
│  │ Balance: 1.234567 BTC | MAX | ~$55,890.12   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│                    [⇄]                              │
│                     │                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ To:                              [USDT ▼]   │   │
│  │ ┌───────────────────────────────────────┐   │   │
│  │ │ 0.00                                  │   │   │
│  │ └───────────────────────────────────────┘   │   │
│  │ Balance: 1,234.56 USDT      ~$1,234.56      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Exchange Rate: 1 BTC = 45,320 USDT          │   │
│  │ Price Impact: ~0.02%                        │   │
│  │ Minimum Received: 45,093.34 USDT            │   │
│  │ Network Fee: ~0.0001 BTC                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────┐    ┌─────────────────────────┐   │
│  │    CANCEL    │    │    EXECUTE SWAP         │   │
│  └──────────────┘    └─────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### ASCII Layout (Mobile)
```
┌─────────────────────────┐
│    ─── (drag handle)    │
│  ⇄ MOOSH SWAP   [⚙][×]  │
├─────────────────────────┤
│ From: [BTC ▼]           │
│ ┌─────────────────────┐ │
│ │ 0.000000           │ │
│ └─────────────────────┘ │
│ Balance: 1.23 | MAX     │
│ ~$55,890.12             │
│                         │
│        [⇄]              │
│         │               │
│ To: [USDT ▼]           │
│ ┌─────────────────────┐ │
│ │ 0.00               │ │
│ └─────────────────────┘ │
│ Balance: 1,234.56       │
│ ~$1,234.56              │
│                         │
│ Rate: 1 BTC = 45,320    │
│ Impact: ~0.02%          │
│ Min: 45,093.34 USDT     │
│ Fee: ~0.0001 BTC        │
├─────────────────────────┤
│ You receive: ~0 USDT    │
├─────────────────────────┤
│ [    EXECUTE SWAP    ]  │
│ [      CANCEL        ]  │
└─────────────────────────┘
```

### Specifications
- **Desktop Width**: 520px max
- **Tablet Width**: 600px max
- **Mobile**: Full width, slide-up animation
- **Background**: Dynamic (moosh-mode aware)
- **Border**: 2px solid var(--text-keyword)
- **Animations**: fadeInScale (desktop), slideUp (mobile)

## Constructor

```javascript
class SwapModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.fromToken = 'BTC';
        this.toToken = 'USDT';
        this.fromAmount = '';
        this.toAmount = '';
        this.slippage = 0.5; // 0.5% default
        this.showSettings = false;
        this.tokens = {
            'BTC': { name: 'Bitcoin', symbol: 'BTC', decimals: 8, price: 45320 },
            'USDT': { name: 'Tether', symbol: 'USDT', decimals: 6, price: 1 },
            'USDC': { name: 'USD Coin', symbol: 'USDC', decimals: 6, price: 1 },
            'MOOSH': { name: 'MOOSH', symbol: 'MOOSH', decimals: 18, price: 0.0058 }
        };
    }
}
```

## Key Methods

### show()
**Location**: Lines 23193-23253
Creates and displays the swap modal with responsive design.

```javascript
show() {
    const $ = window.ElementFactory || ElementFactory;
    const isMooshMode = document.body.classList.contains('moosh-mode');
    const isMobile = window.innerWidth <= 768;
    
    this.modal = $.div({ 
        className: 'modal-overlay',
        onclick: (e) => {
            if (e.target === this.modal) this.close();
        },
        style: {
            background: isMobile ? 'var(--bg-primary)' : 'rgba(0, 0, 0, 0.8)'
        }
    }, [
        // Modal content...
    ]);
    
    document.body.appendChild(this.modal);
    this.addStyles();
    this.addResponsiveStyles();
    
    if (isMobile) {
        document.body.style.overflow = 'hidden';
    }
}
```

### createTokenSection(type)
**Location**: Lines 23693-23940
Creates the from/to token input sections.

```javascript
createTokenSection(type) {
    return $.div({
        className: `swap-section ${type}-section`,
        style: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0',
            padding: isMobile ? '12px' : 'calc(16px * var(--scale-factor))',
            marginBottom: type === 'from' ? '0' : 'calc(12px * var(--scale-factor))'
        }
    }, [
        // Section content including token selector and amount input
    ]);
}
```

### calculateToAmount()
**Location**: Lines 23941-23960
Calculates the output amount based on exchange rates.

```javascript
calculateToAmount() {
    if (!this.fromAmount || parseFloat(this.fromAmount) === 0) {
        this.toAmount = '';
        return;
    }
    
    const fromPrice = this.tokens[this.fromToken].price;
    const toPrice = this.tokens[this.toToken].price;
    const rate = fromPrice / toPrice;
    const amount = parseFloat(this.fromAmount) * rate;
    
    // Apply slippage
    const slippageMultiplier = 1 - (this.slippage / 100);
    const finalAmount = amount * slippageMultiplier;
    
    this.toAmount = this.formatAmount(finalAmount, this.tokens[this.toToken].decimals);
}
```

### executeSwap()
**Location**: Lines 24530-24595
Processes the token swap transaction.

```javascript
async executeSwap() {
    try {
        this.showLoading();
        
        // Validate transaction
        if (!this.validateSwap()) {
            throw new Error('Invalid swap parameters');
        }
        
        // Create swap transaction
        const swapTx = {
            from: this.fromToken,
            to: this.toToken,
            amount: this.fromAmount,
            expectedOutput: this.toAmount,
            slippage: this.slippage
        };
        
        // Execute swap
        const result = await this.app.swapService.executeSwap(swapTx);
        
        this.app.showNotification('Swap executed successfully!', 'success');
        this.close();
        
    } catch (error) {
        console.error('Swap failed:', error);
        this.app.showNotification('Swap failed: ' + error.message, 'error');
    } finally {
        this.hideLoading();
    }
}
```

## Modal Components

### Header Section
- **Title**: "MOOSH SWAP" with swap icon (⇄)
- **Settings Button**: Opens slippage settings
- **Close Button**: Closes modal
- **Mobile Drag Handle**: 36px × 4px rounded bar

### Token Sections
Each token section (from/to) includes:
- **Token Selector**: Dropdown with token icons
- **Amount Input**: Numeric input with decimal support
- **Balance Display**: Current token balance
- **MAX Button**: Sets maximum available amount
- **USD Value**: Real-time USD conversion

### Swap Button
- **Icon**: ⇄ symbol
- **Animation**: 180° rotation on hover/click
- **Connecting Line**: Visual connection between sections

### Transaction Details
- **Exchange Rate**: Current conversion rate
- **Price Impact**: Estimated price impact percentage
- **Minimum Received**: After slippage calculation
- **Network Fee**: Estimated transaction fee

### Settings Panel
**Location**: Lines 24091-24179
- **Slippage Tolerance**: 0.1%, 0.5%, 1%, or custom
- **Transaction Deadline**: Time limit for swap
- **Expert Mode**: Advanced settings toggle

## Token Support

### Available Tokens
```javascript
{
    'BTC': { name: 'Bitcoin', symbol: 'BTC', decimals: 8, price: 45320 },
    'USDT': { name: 'Tether', symbol: 'USDT', decimals: 6, price: 1 },
    'USDC': { name: 'USD Coin', symbol: 'USDC', decimals: 6, price: 1 },
    'MOOSH': { name: 'MOOSH', symbol: 'MOOSH', decimals: 18, price: 0.0058 }
}
```

## Responsive Design

### Mobile Optimizations
- **Full Screen**: Takes entire viewport on mobile
- **Slide-up Animation**: Smooth entrance from bottom
- **Touch Gestures**: Optimized for touch interactions
- **Larger Targets**: 48px minimum touch targets
- **Simplified Layout**: Stacked elements for better usability

### Tablet Adjustments
- **Width**: 600px max
- **Padding**: Increased for better spacing
- **Font Sizes**: Slightly larger than desktop

### Desktop Features
- **Hover Effects**: Enhanced visual feedback
- **Keyboard Navigation**: Tab support
- **Tooltips**: Additional information on hover

## State Management

### Internal State
- `fromToken`: Selected source token
- `toToken`: Selected destination token
- `fromAmount`: Input amount
- `toAmount`: Calculated output
- `slippage`: Slippage tolerance percentage
- `showSettings`: Settings panel visibility

### Integration with App State
- Reads wallet balances from `app.state`
- Updates transaction history after swap
- Triggers balance refresh after completion

## Validation

### Input Validation
- Numeric only with decimal support
- Maximum decimals based on token
- Prevents negative values
- Real-time balance checking

### Swap Validation
- Sufficient balance check
- Minimum amount requirements
- Maximum slippage protection
- Network fee coverage

## Error Handling

### Common Errors
1. **Insufficient Balance**: Shows in button, disables swap
2. **Invalid Amount**: Clears calculation, shows warning
3. **Network Error**: Shows notification with retry option
4. **Price Update Failed**: Uses cached prices with warning

## Animations and Transitions

### CSS Animations
```css
@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}
```

### Interactive Elements
- Button hover states with color transitions
- Swap button rotation on interaction
- Smooth opacity transitions
- Scale effects on touch

## Best Practices

1. **Always validate amounts** before executing swaps
2. **Show loading states** during async operations
3. **Provide clear error messages** with actionable solutions
4. **Update prices regularly** (every 30 seconds)
5. **Save user preferences** (slippage, default tokens)
6. **Test on all screen sizes** for responsive behavior
7. **Handle edge cases** (zero amounts, same token swap)