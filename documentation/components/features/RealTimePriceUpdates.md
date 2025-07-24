# Component: Real-Time Price Updates

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 3500-4000 (Price fetching and updates)
- `/public/js/moosh-wallet.js` - Lines 28000-28500 (Price chart implementation)
- `/src/server/api-server.js` - Lines 250-300 (Price API endpoints)

## Overview
The Real-Time Price Updates system provides live Bitcoin price data, historical charts, and currency conversion throughout the wallet interface. It supports multiple fiat currencies and automatic updates.

## Component Architecture

### Core Components
1. **PriceService** - Fetches and caches price data
2. **PriceChart** - Renders price history charts
3. **CurrencyConverter** - Handles BTC/fiat conversions
4. **PriceWebSocket** - Real-time price streaming

## Implementation Details

### Price Service
```javascript
class PriceService {
    constructor(app) {
        this.app = app;
        this.currentPrice = 0;
        this.priceHistory = [];
        this.currency = 'USD';
        this.updateInterval = 30000; // 30 seconds
        this.cache = new Map();
        
        this.startPriceUpdates();
    }
    
    async fetchCurrentPrice() {
        const cacheKey = `price_${this.currency}`;
        const cached = this.cache.get(cacheKey);
        
        // Use cache if fresh (< 30 seconds)
        if (cached && Date.now() - cached.timestamp < 30000) {
            return cached.price;
        }
        
        try {
            const response = await this.app.apiService.request(
                `/api/bitcoin/price?currency=${this.currency}`
            );
            
            if (response.success) {
                this.currentPrice = response.data.price;
                this.cache.set(cacheKey, {
                    price: this.currentPrice,
                    timestamp: Date.now()
                });
                
                // Emit price update event
                this.app.events.emit('priceUpdate', {
                    price: this.currentPrice,
                    currency: this.currency,
                    change24h: response.data.change24h
                });
                
                return this.currentPrice;
            }
        } catch (error) {
            console.error('Failed to fetch price:', error);
            return this.currentPrice; // Return last known price
        }
    }
    
    startPriceUpdates() {
        // Initial fetch
        this.fetchCurrentPrice();
        
        // Set up interval updates
        this.updateTimer = setInterval(() => {
            this.fetchCurrentPrice();
        }, this.updateInterval);
        
        // Set up WebSocket for real-time updates
        this.connectWebSocket();
    }
}
```

### WebSocket Integration
```javascript
connectWebSocket() {
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    
    this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.c); // Current price
        
        // Update if significant change (> 0.1%)
        const priceChange = Math.abs(price - this.currentPrice) / this.currentPrice;
        if (priceChange > 0.001) {
            this.currentPrice = price;
            this.app.events.emit('priceUpdate', {
                price: price,
                currency: 'USD',
                realtime: true
            });
        }
    };
    
    this.ws.onerror = () => {
        // Reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
    };
}
```

### Price Chart Implementation
```javascript
class PriceChart {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            interval: '1h',
            points: 24,
            showGrid: true,
            animate: true,
            ...options
        };
        
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        
        this.init();
    }
    
    async fetchChartData() {
        const response = await fetch(
            `/api/bitcoin/price-history?interval=${this.options.interval}&points=${this.options.points}`
        );
        
        const data = await response.json();
        if (data.success) {
            this.data = data.prices.map(p => ({
                time: new Date(p.timestamp),
                price: p.price
            }));
            this.render();
        }
    }
    
    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate scales
        const prices = this.data.map(d => d.price);
        const minPrice = Math.min(...prices) * 0.98;
        const maxPrice = Math.max(...prices) * 1.02;
        const priceScale = height / (maxPrice - minPrice);
        
        // Draw grid
        if (this.options.showGrid) {
            this.drawGrid(ctx, width, height);
        }
        
        // Draw price line
        ctx.beginPath();
        ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-accent');
        ctx.lineWidth = 2;
        
        this.data.forEach((point, index) => {
            const x = (index / (this.data.length - 1)) * width;
            const y = height - ((point.price - minPrice) * priceScale);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw area fill
        this.drawAreaFill(ctx, width, height, minPrice, priceScale);
        
        // Draw labels
        this.drawLabels(ctx, width, height, minPrice, maxPrice);
    }
}
```

### Currency Converter
```javascript
class CurrencyConverter {
    constructor(priceService) {
        this.priceService = priceService;
        this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
        this.rates = new Map();
    }
    
    async btcToFiat(btcAmount, currency = 'USD') {
        const price = await this.priceService.getPrice(currency);
        return btcAmount * price;
    }
    
    async fiatToBtc(fiatAmount, currency = 'USD') {
        const price = await this.priceService.getPrice(currency);
        return fiatAmount / price;
    }
    
    formatBtc(amount) {
        return amount.toFixed(8) + ' BTC';
    }
    
    formatFiat(amount, currency = 'USD') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(amount);
    }
}
```

## Visual Specifications

### Price Display Styles
```css
.price-display {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
}

.price-change {
    font-size: 14px;
    margin-left: 8px;
}

.price-change.positive {
    color: #69FD97;
}

.price-change.negative {
    color: #E94560;
}

.price-chart-container {
    position: relative;
    width: 100%;
    height: 200px;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 16px;
}

.price-chart-canvas {
    width: 100%;
    height: 100%;
}
```

## DOM Structure
```html
<div class="price-widget">
    <div class="price-header">
        <h3>Bitcoin Price</h3>
        <select class="currency-selector">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
        </select>
    </div>
    
    <div class="price-display">
        <span class="price-value">$43,567.89</span>
        <span class="price-change positive">+2.34%</span>
    </div>
    
    <div class="price-chart-container">
        <canvas class="price-chart-canvas"></canvas>
        <div class="chart-controls">
            <button data-interval="1h">1H</button>
            <button data-interval="1d">1D</button>
            <button data-interval="1w">1W</button>
            <button data-interval="1m">1M</button>
        </div>
    </div>
</div>
```

## Event System

### Price Update Events
```javascript
// Subscribe to price updates
app.events.on('priceUpdate', (data) => {
    // Update all price displays
    document.querySelectorAll('.btc-price').forEach(el => {
        el.textContent = data.price.toFixed(2);
    });
    
    // Update change indicators
    document.querySelectorAll('.price-change').forEach(el => {
        el.textContent = `${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%`;
        el.className = `price-change ${data.change24h > 0 ? 'positive' : 'negative'}`;
    });
    
    // Update balance values
    this.updateBalanceValues(data.price);
});

// Manual refresh
app.priceService.refresh = async function() {
    await this.fetchCurrentPrice();
    await this.fetchChartData();
};
```

## Performance Optimizations

### Throttling Updates
```javascript
class PriceUpdateThrottler {
    constructor() {
        this.lastUpdate = 0;
        this.minInterval = 1000; // 1 second minimum between updates
        this.pendingUpdate = null;
    }
    
    update(callback) {
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastUpdate;
        
        if (timeSinceLastUpdate >= this.minInterval) {
            this.lastUpdate = now;
            callback();
        } else {
            // Schedule update for later
            clearTimeout(this.pendingUpdate);
            this.pendingUpdate = setTimeout(() => {
                this.lastUpdate = Date.now();
                callback();
            }, this.minInterval - timeSinceLastUpdate);
        }
    }
}
```

### Canvas Optimization
```javascript
optimizeChartRendering() {
    // Use offscreen canvas for complex calculations
    const offscreen = new OffscreenCanvas(this.canvas.width, this.canvas.height);
    const offCtx = offscreen.getContext('2d');
    
    // Render to offscreen
    this.renderToContext(offCtx);
    
    // Transfer to main canvas
    this.ctx.drawImage(offscreen, 0, 0);
    
    // Request animation frame for smooth updates
    if (this.options.animate) {
        requestAnimationFrame(() => this.render());
    }
}
```

## API Integration
- `GET /api/bitcoin/price` - Current price
- `GET /api/bitcoin/price-history` - Historical data
- `WS wss://stream.binance.com` - Real-time price stream

## State Management
- Current price stored in `app.state.btcPrice`
- Price history cached for chart rendering
- Currency preference saved to localStorage

## Testing
```bash
# Test price fetching
npm run test:price:fetch

# Test WebSocket connection
npm run test:price:websocket

# Test chart rendering
npm run test:price:chart

# Test currency conversion
npm run test:price:converter
```

## Known Issues
1. WebSocket can disconnect in poor network conditions
2. Chart animation can stutter on low-end devices
3. Currency rates need more frequent updates

## Git Recovery Commands
```bash
# Restore price functionality
git checkout 1981e5a -- public/js/moosh-wallet.js

# View price implementation history
git log -p --grep="price" -- public/js/moosh-wallet.js

# Restore API endpoints
git checkout HEAD -- src/server/api-server.js
```

## Related Components
- [Dashboard Widgets](./DashboardWidgets.md)
- [Balance Display](./BalanceDisplay.md)
- [Currency Converter](./CurrencyConverter.md)
- [Chart Components](../ui-sections/ChartComponents.md)