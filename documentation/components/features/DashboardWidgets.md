# Component: Dashboard Widgets

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 13700-14500 (Dashboard components)
- `/public/js/moosh-wallet.js` - Lines 27000-28500 (Widget implementations)
- `/documentation/guides/DASHBOARD-FEATURES-DOCUMENTATION.md`

## Overview
The Dashboard contains multiple widgets that provide real-time information and quick access to wallet functionality. Each widget is designed to be modular, responsive, and theme-aware.

## Widget Architecture

### Core Widgets
1. **Balance Display Widget** - Shows BTC/USD balances
2. **Price Chart Widget** - Real-time price tracking
3. **Quick Actions Widget** - Send/Receive/Swap buttons
4. **Transaction Preview Widget** - Recent transactions
5. **Account Summary Widget** - Multi-account overview
6. **Network Status Widget** - Connection indicators
7. **News Feed Widget** - Bitcoin news and updates

## Implementation Details

### Balance Display Widget
```javascript
class BalanceWidget extends Component {
    constructor(app) {
        super(app);
        this.state = {
            btcBalance: 0,
            usdValue: 0,
            sparkBalance: 0,
            isLoading: true,
            isVisible: true
        };
    }
    
    render() {
        const $ = window.ElementFactory || ElementFactory;
        
        return $.div({
            className: 'balance-widget',
            style: {
                background: 'var(--bg-secondary)',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center'
            }
        }, [
            this.createHeader(),
            this.createBalanceDisplay(),
            this.createSparkBalance(),
            this.createTotalValue()
        ]);
    }
    
    createBalanceDisplay() {
        if (!this.state.isVisible) {
            return $.div({ className: 'balance-hidden' }, ['••••••••']);
        }
        
        return $.div({ className: 'balance-main' }, [
            $.div({ className: 'btc-balance' }, [
                $.span({ className: 'amount' }, [this.state.btcBalance.toFixed(8)]),
                $.span({ className: 'unit' }, [' BTC'])
            ]),
            $.div({ className: 'usd-value' }, [
                '$', this.state.usdValue.toLocaleString('en-US', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            ])
        ]);
    }
}
```

### Price Chart Widget
```javascript
class PriceChartWidget extends Component {
    constructor(app) {
        super(app);
        this.chartData = [];
        this.chartInterval = '1h';
        this.canvas = null;
    }
    
    async fetchPriceData() {
        try {
            const response = await this.app.apiService.request(
                `/api/bitcoin/price-history?interval=${this.chartInterval}`
            );
            
            if (response.success) {
                this.chartData = response.data;
                this.renderChart();
            }
        } catch (error) {
            console.error('Failed to fetch price data:', error);
        }
    }
    
    renderChart() {
        const ctx = this.canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set theme-aware colors
        ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-accent');
        ctx.lineWidth = 2;
        
        // Draw chart
        this.drawPriceLine(ctx);
        this.drawGrid(ctx);
        this.drawLabels(ctx);
    }
}
```

### Quick Actions Widget
```javascript
createQuickActionsWidget() {
    const $ = window.ElementFactory || ElementFactory;
    
    const actions = [
        { icon: '↑', label: 'Send', handler: () => this.showSendModal() },
        { icon: '↓', label: 'Receive', handler: () => this.showReceiveModal() },
        { icon: '↔', label: 'Swap', handler: () => this.showSwapModal() },
        { icon: '⚡', label: 'Lightning', handler: () => this.showLightningModal() }
    ];
    
    return $.div({
        className: 'quick-actions-widget',
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginTop: '24px'
        }
    }, actions.map(action => this.createActionButton(action)));
}

createActionButton({ icon, label, handler }) {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.button({
        className: 'quick-action-btn',
        onclick: handler,
        style: {
            background: 'var(--bg-primary)',
            border: '2px solid var(--border-color)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center'
        },
        onmouseover: function() {
            this.style.background = 'var(--text-accent)';
            this.style.color = 'var(--bg-primary)';
        },
        onmouseout: function() {
            this.style.background = 'var(--bg-primary)';
            this.style.color = 'var(--text-primary)';
        }
    }, [
        $.div({ className: 'action-icon' }, [icon]),
        $.div({ className: 'action-label' }, [label])
    ]);
}
```

## Widget Layouts

### Grid System
```css
.dashboard-widgets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    padding: 24px;
}

.widget-full-width {
    grid-column: 1 / -1;
}

.widget-half-width {
    grid-column: span 2;
}

@media (max-width: 768px) {
    .dashboard-widgets {
        grid-template-columns: 1fr;
    }
}
```

### Widget Container
```css
.widget-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
}

.widget-container:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
}

.widget-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.widget-actions {
    display: flex;
    gap: 8px;
}
```

## Real-time Updates

### WebSocket Integration
```javascript
class DashboardUpdater {
    constructor(widgets) {
        this.widgets = widgets;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket('wss://api.mooshwallet.com/dashboard');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleUpdate(data);
        };
        
        this.ws.onerror = () => {
            this.reconnect();
        };
    }
    
    handleUpdate(data) {
        switch (data.type) {
            case 'price':
                this.widgets.priceChart.updatePrice(data.price);
                this.widgets.balance.updateUsdValue(data.price);
                break;
            case 'transaction':
                this.widgets.transactions.addTransaction(data.transaction);
                this.widgets.balance.refreshBalance();
                break;
            case 'network':
                this.widgets.network.updateStatus(data.status);
                break;
        }
    }
}
```

## Widget State Management
```javascript
class WidgetStateManager {
    constructor() {
        this.widgetStates = new Map();
        this.loadSavedStates();
    }
    
    saveWidgetState(widgetId, state) {
        this.widgetStates.set(widgetId, state);
        localStorage.setItem(
            `widget_${widgetId}_state`,
            JSON.stringify(state)
        );
    }
    
    getWidgetState(widgetId) {
        return this.widgetStates.get(widgetId) || {};
    }
    
    toggleWidget(widgetId) {
        const state = this.getWidgetState(widgetId);
        state.visible = !state.visible;
        this.saveWidgetState(widgetId, state);
    }
}
```

## Performance Optimizations

### Lazy Loading
```javascript
class LazyWidget extends Component {
    constructor(app, loader) {
        super(app);
        this.loader = loader;
        this.widget = null;
        this.isVisible = false;
        
        this.observer = new IntersectionObserver(
            entries => this.handleIntersection(entries),
            { threshold: 0.1 }
        );
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.widget) {
                this.loadWidget();
            }
        });
    }
    
    async loadWidget() {
        this.widget = await this.loader();
        this.render();
    }
}
```

### Update Batching
```javascript
class BatchUpdater {
    constructor() {
        this.pendingUpdates = new Map();
        this.updateTimer = null;
    }
    
    scheduleUpdate(widgetId, updateFn) {
        this.pendingUpdates.set(widgetId, updateFn);
        
        if (!this.updateTimer) {
            this.updateTimer = requestAnimationFrame(() => {
                this.flushUpdates();
            });
        }
    }
    
    flushUpdates() {
        this.pendingUpdates.forEach((updateFn, widgetId) => {
            updateFn();
        });
        
        this.pendingUpdates.clear();
        this.updateTimer = null;
    }
}
```

## Testing
```bash
# Test individual widgets
npm run test:widgets:balance
npm run test:widgets:chart
npm run test:widgets:actions

# Test real-time updates
npm run test:widgets:websocket

# Test responsive layout
npm run test:widgets:responsive
```

## Known Issues
1. Chart rendering can be slow with large datasets
2. WebSocket reconnection needs improvement
3. Widget state persistence across sessions incomplete

## Git Recovery Commands
```bash
# Restore dashboard widgets
git checkout 1981e5a -- public/js/moosh-wallet.js

# View widget implementation history
git log -p --grep="widget\|dashboard" -- public/js/moosh-wallet.js

# Restore specific widget
git show HEAD:public/js/moosh-wallet.js | grep -A 100 "BalanceWidget"
```

## Related Components
- [Dashboard Page](../pages/DashboardPage.md)
- [Balance Display](./BalanceDisplay.md)
- [Real-time Price Updates](./RealTimePriceUpdates.md)
- [Quick Actions](../ui-sections/QuickActions.md)