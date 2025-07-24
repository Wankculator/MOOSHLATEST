# TokenMenuModal Component Documentation

## Overview
The TokenMenuModal displays a comprehensive list of supported tokens (BTC, USDT, USDC, MOOSH) with real-time pricing, 24-hour change percentages, and quick actions. It serves as a central hub for token management and information.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 20615-20883
- **Class Definition**: `class TokenMenuModal`

## Visual Design

### ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│  TOKEN_MENU                                        [×]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [BTC] Bitcoin                        $45,320.00   │  │
│  │  BT   Bitcoin • Native               +2.45%       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [TE] Tether                          $1.00        │  │
│  │  TE   Tether • Stablecoin            0.00%        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [US] USD Coin                        $1.00        │  │
│  │  US   USD Coin • Stablecoin          0.00%        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [MO] MOOSH Token                     $0.0058      │  │
│  │  MO   MOOSH Token • Spark Token      +420.69%     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│         [ Swap Tokens ]         [ Close ]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Specifications
- **Max Width**: 700px (scaled)
- **Width**: 90% of viewport
- **Background**: var(--bg-primary)
- **Border**: 2px solid var(--text-primary)
- **Border Radius**: 0 (sharp corners)
- **Padding**: 24px (scaled)

## Constructor

```javascript
class TokenMenuModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.tokens = [
            { symbol: 'BTC', name: 'Bitcoin', type: 'Native', balance: 0, price: 0, change: 0 },
            { symbol: 'USDT', name: 'Tether', type: 'Stablecoin', balance: 0, price: 1, change: 0 },
            { symbol: 'USDC', name: 'USD Coin', type: 'Stablecoin', balance: 0, price: 1, change: 0 },
            { symbol: 'MOOSH', name: 'MOOSH Token', type: 'Spark Token', balance: 0, price: 0.0058, change: 420.69 }
        ];
    }
}
```

## Key Methods

### show()
**Location**: Lines 20627-20676
Displays the modal and fetches latest token prices.

```javascript
async show() {
    const $ = window.ElementFactory || ElementFactory;
    
    // Fetch latest prices
    await this.fetchPrices();
    
    this.modal = $.div({
        className: 'modal-overlay',
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            padding: 'calc(20px * var(--scale-factor))'
        },
        onclick: (e) => {
            if (e.target === this.modal) this.close();
        }
    }, [
        // Modal content...
    ]);
    
    document.body.appendChild(this.modal);
    
    setTimeout(() => {
        this.modal.classList.add('show');
    }, 10);
}
```

### createTokenList()
**Location**: Lines 20718-20816
Generates the list of token cards with interactive hover effects.

```javascript
createTokenList() {
    return $.div({
        style: {
            marginBottom: 'calc(24px * var(--scale-factor))'
        }
    }, this.tokens.map(token => {
        const changeColor = token.change > 0 ? 'var(--text-accent)' : 
                           token.change < 0 ? '#ff4444' : 'var(--text-dim)';
        const changeSymbol = token.change > 0 ? '+' : '';
        
        return $.div({
            style: {
                border: '1px solid var(--border-color)',
                borderRadius: '0',
                padding: 'calc(16px * var(--scale-factor))',
                marginBottom: 'calc(12px * var(--scale-factor))',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            },
            onmouseover: (e) => {
                e.currentTarget.style.borderColor = 'var(--text-primary)';
                e.currentTarget.style.background = 'rgba(245, 115, 21, 0.05)';
            },
            onmouseout: (e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'transparent';
            }
        }, [
            // Token card content...
        ]);
    }));
}
```

### fetchPrices()
**Location**: Lines 20861-20872
Fetches latest price data from the API.

```javascript
async fetchPrices() {
    try {
        const priceData = await this.app.apiService.fetchBitcoinPrice();
        const btcToken = this.tokens.find(t => t.symbol === 'BTC');
        if (btcToken) {
            btcToken.price = priceData.usd || 0;
            btcToken.change = priceData.usd_24h_change || 0;
        }
    } catch (error) {
        console.error('Failed to fetch token prices:', error);
    }
}
```

## Modal Components

### Header
- **Title**: "TOKEN_MENU" in monospace font
- **Close Button**: × symbol, 32px × 32px
- **Border Bottom**: Separates header from content

### Token Cards
Each token card displays:

#### Token Icon
- **Size**: 40px × 40px circle
- **Colors**:
  - BTC: #ff9500 (orange)
  - MOOSH: var(--text-accent) (green in moosh mode)
  - Others: var(--border-color)
- **Content**: First 2 letters of symbol

#### Token Information
- **Symbol**: Bold, 16px font
- **Name & Type**: Dimmed text, 12px font
- **Format**: "{Name} • {Type}"

#### Price Information
- **Current Price**: Right-aligned, bold
- **24h Change**: Colored based on value
  - Positive: var(--text-accent)
  - Negative: #ff4444
  - Zero: var(--text-dim)

### Action Buttons
- **Swap Tokens Button**:
  - Background: var(--bg-primary)
  - Border: 2px solid var(--text-primary)
  - Shows info notification (feature coming soon)
  
- **Close Button**:
  - Background: transparent
  - Border: 1px solid var(--border-color)
  - Color: var(--text-dim)

## Token Data Structure

```javascript
{
    symbol: 'BTC',           // Trading symbol
    name: 'Bitcoin',         // Full name
    type: 'Native',          // Token type
    balance: 0,              // User balance (not displayed)
    price: 45320,            // Current USD price
    change: 2.45             // 24h percentage change
}
```

### Token Types
- **Native**: Bitcoin (BTC)
- **Stablecoin**: USDT, USDC
- **Spark Token**: MOOSH

## Interactive Features

### Hover Effects
- Border color changes to primary
- Background gains subtle orange tint
- Smooth 0.2s transition

### Click Actions
- Token cards are clickable (future functionality)
- Currently no action implemented

### Price Updates
- Fetches live BTC price on modal open
- Updates change percentage from API
- Static prices for stablecoins

## Usage Examples

### Opening the Modal
```javascript
// From dashboard
handleTokenMenu() {
    const modal = new TokenMenuModal(this.app);
    modal.show();
}

// Direct invocation
showTokenMenu() {
    const modal = new TokenMenuModal(this.app);
    modal.show();
}
```

### Integration Points
**Invocation Locations**:
- Line 9809: Dashboard handler
- Line 12704: Alternative dashboard
- Line 14853: Another dashboard variant
- Line 15730: Direct method
- Line 28877: Additional dashboard

## Styling Details

### CSS Variables Used
- `--bg-primary`: Modal background
- `--text-primary`: Title and prices
- `--text-dim`: Subtitles and zero changes
- `--text-accent`: Positive changes
- `--border-color`: Default borders
- `--scale-factor`: Responsive scaling

### Responsive Behavior
- Width scales with viewport (90% max)
- Font sizes use calc() with scale factor
- Padding adjusts based on screen size
- Maximum width prevents oversizing on large screens

## State Management

### Internal State
- `tokens`: Array of token objects
- `modal`: DOM reference to modal element

### External Dependencies
- `app.apiService.fetchBitcoinPrice()`: Price data
- `app.showNotification()`: User feedback

## Future Enhancements

### Planned Features
1. **Token Swapping**: Currently shows "coming soon"
2. **Balance Display**: Token balances not shown
3. **More Tokens**: Expandable token list
4. **Portfolio Value**: Total USD value display

### Potential Improvements
1. Real-time price updates while modal is open
2. Search/filter functionality
3. Favorite tokens feature
4. Historical price charts
5. Direct trading from token cards

## Best Practices

1. **Always fetch prices** before showing modal
2. **Handle API errors** gracefully
3. **Use consistent styling** with CSS variables
4. **Maintain responsive design** across devices
5. **Provide visual feedback** for interactions
6. **Keep token data** in single source of truth