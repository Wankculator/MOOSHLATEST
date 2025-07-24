# SparkDashboardModal

**Last Updated**: 2025-07-21
**Location**: `/public/js/moosh-wallet.js` - Lines 6151-6518
**Type**: UI Modal Component

## Overview

The `SparkDashboardModal` provides a comprehensive dashboard interface for managing Spark Protocol features. It displays wallet balances, protocol statistics, and provides access to various Spark Protocol operations through an intuitive UI.

## Class Definition

```javascript
class SparkDashboardModal {
    constructor(app)
    show()
    createHeader()
    createSparkStats()
    createStatCard(title, value, subtitle, icon)
    createFeatureGrid()
    createFeatureCard(title, description, buttonText, clickHandler)
    createActionButtons()
    async initializeSparkData()
    async updateSparkBalances()
    async createNewSparkWallet()
    async refreshSparkData()
    handleSparkDeposit()
    handleLightningManager()
    handleSparkExit()
    handleMarketData()
    handleDeFiIntegration()
    handleSecurity()
    hide()
}
```

## Properties

### Core Properties

- **app** (`Object`): Reference to main application instance
- **modal** (`HTMLElement`): Modal DOM element
- **sparkWallet** (`Object`): Active Spark wallet reference

## UI Structure

### Modal Layout

```
┌─────────────────────────────────────────┐
│          SPARK PROTOCOL DASHBOARD        │
│   Real Bitcoin Spark Integration...      │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Bitcoin │ │  Spark  │ │Lightning│   │
│  │ Balance │ │ Balance │ │ Balance │   │
│  └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐        │
│  │   Spark     │ │  Lightning  │        │
│  │  Deposits   │ │   Network   │        │
│  └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐        │
│  │   Spark     │ │   Market    │        │
│  │   Exits     │ │Intelligence │        │
│  └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────┤
│ [Create Wallet] [Refresh] [Close]        │
└─────────────────────────────────────────┘
```

## Methods

### show()

Displays the Spark Dashboard modal with fade-in animation.

**Example:**
```javascript
const dashboard = new SparkDashboardModal(app);
dashboard.show();
```

### createSparkStats()

Creates the statistics grid showing balance information across protocols.

**Returns:**
- `HTMLElement`: Stats grid container with balance cards

### createFeatureGrid()

Creates the feature grid with interactive cards for each Spark Protocol feature.

**Features Included:**
- Spark Deposits
- Lightning Network Manager
- Spark Exits
- Market Intelligence
- DeFi Integration
- Advanced Security

### initializeSparkData()

Initializes wallet data and creates a new Spark wallet if none exists.

**Process:**
1. Checks for existing Spark wallet
2. Creates new wallet if needed
3. Updates balance displays
4. Shows notifications

### updateSparkBalances()

Updates all balance displays with current wallet values.

**Updates:**
- Bitcoin balance
- Spark Protocol balance
- Lightning Network balance
- Total combined value

## Integration Examples

### Basic Dashboard Implementation

```javascript
// Initialize and show dashboard
class MyApp {
    constructor() {
        this.sparkDashboard = null;
    }
    
    showSparkDashboard() {
        if (!this.sparkDashboard) {
            this.sparkDashboard = new SparkDashboardModal(this);
        }
        this.sparkDashboard.show();
    }
}

// Usage
const app = new MyApp();
app.showSparkDashboard();
```

### Custom Feature Integration

```javascript
// Extend dashboard with custom features
class ExtendedSparkDashboard extends SparkDashboardModal {
    createFeatureGrid() {
        const grid = super.createFeatureGrid();
        
        // Add custom feature card
        grid.appendChild(
            this.createFeatureCard(
                'Custom Feature',
                'My custom Spark Protocol integration',
                'Launch Feature',
                () => this.handleCustomFeature()
            )
        );
        
        return grid;
    }
    
    handleCustomFeature() {
        console.log('Custom feature launched');
        // Custom implementation
    }
}
```

### Balance Update Automation

```javascript
// Auto-refresh balances
function setupAutoRefresh(dashboard) {
    // Initial update
    dashboard.updateSparkBalances();
    
    // Refresh every 30 seconds
    const refreshInterval = setInterval(() => {
        if (dashboard.modal && dashboard.modal.parentNode) {
            dashboard.updateSparkBalances();
        } else {
            // Modal closed, stop refreshing
            clearInterval(refreshInterval);
        }
    }, 30000);
    
    return refreshInterval;
}
```

## Styling

### Color Scheme

```css
/* Spark Protocol Brand Colors */
--spark-primary: #00D4FF;      /* Cyan */
--spark-secondary: #f57315;    /* Orange */
--spark-background: #0A0F25;   /* Dark Blue */
--spark-surface: #1A2332;      /* Lighter Blue */
```

### Gradient Styles

```javascript
// Header gradient
background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)'

// Button gradient
background: 'linear-gradient(90deg, #00D4FF 0%, #f57315 100%)'

// Modal background
background: 'linear-gradient(135deg, #0A0F25 0%, #1A2332 100%)'
```

## Event Handlers

### Feature Button Handlers

- **handleSparkDeposit()**: Opens Spark deposit modal
- **handleLightningManager()**: Opens Lightning channel manager
- **handleSparkExit()**: Initiates Spark to Bitcoin exit
- **handleMarketData()**: Shows market intelligence (placeholder)
- **handleDeFiIntegration()**: Shows DeFi features (placeholder)
- **handleSecurity()**: Opens security settings (placeholder)

### Action Button Handlers

- **createNewSparkWallet()**: Creates new Spark wallet with prompt
- **refreshSparkData()**: Manually refreshes all data
- **hide()**: Closes modal with fade-out animation

## User Interactions

### Wallet Creation Flow

```javascript
// User clicks "Create Spark Wallet"
async function walletCreationFlow() {
    // 1. Prompt for wallet name
    const walletName = prompt('Enter wallet name:', 'My Spark Wallet');
    
    if (walletName) {
        // 2. Create wallet
        const wallet = await sparkWalletManager.createSparkWallet(walletName);
        
        // 3. Show success notification
        showNotification(`Wallet "${walletName}" created!`, 'success');
        
        // 4. Display wallet details
        alert(`
            Spark Wallet Created!
            Name: ${wallet.name}
            Bitcoin Address: ${wallet.addresses.bitcoin}
            Spark Address: ${wallet.addresses.spark}
        `);
        
        // 5. Update dashboard
        await updateSparkBalances();
    }
}
```

### Balance Display Format

```javascript
// Format balance for display
function formatBalance(satoshis) {
    const btc = satoshis / 100000000;
    return `${btc.toFixed(8)} BTC`;
}

// Format USD value
function formatUSD(satoshis, btcPrice) {
    const btc = satoshis / 100000000;
    const usd = btc * btcPrice;
    return `$${usd.toFixed(2)}`;
}
```

## Animation Effects

### Modal Animations

```css
/* Fade in effect */
.modal-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay.show {
    opacity: 1;
}

/* Hover effects for feature cards */
.spark-feature-card:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00D4FF;
    transition: all 0.3s ease;
}
```

## Error Handling

```javascript
try {
    await dashboard.initializeSparkData();
} catch (error) {
    if (error.message.includes('wallet creation')) {
        app.showNotification('Failed to create Spark wallet', 'error');
    } else if (error.message.includes('balance')) {
        app.showNotification('Failed to fetch balances', 'error');
    } else {
        console.error('Dashboard error:', error);
        app.showNotification('Dashboard initialization failed', 'error');
    }
}
```

## Accessibility

- Keyboard navigation support (ESC to close)
- Click outside to close functionality
- ARIA labels for screen readers (to be implemented)
- High contrast color scheme

## Performance Considerations

- Lazy loading of balance data
- Debounced refresh operations
- Efficient DOM updates
- Memory cleanup on modal close

## Dependencies

- `SparkWalletManager`: For wallet operations
- `SparkDepositModal`: For deposit functionality
- `LightningChannelModal`: For Lightning features
- `ElementFactory`: For DOM element creation
- Main app instance for notifications

## Future Enhancements

- Real-time price updates
- Chart visualizations
- Transaction history view
- Advanced wallet management
- Mobile-responsive design
- Internationalization support