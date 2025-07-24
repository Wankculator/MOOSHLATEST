# MOOSH Wallet - Complete Dashboard & Account Management Documentation

## Table of Contents
1. [Dashboard Overview](#dashboard-overview)
2. [Account Management](#account-management)
3. [Currency Selection](#currency-selection)
4. [Balance Display](#balance-display)
5. [Price Chart](#price-chart)
6. [Live Price Ticker](#live-price-ticker)
7. [Address Management](#address-management)
8. [Network Status](#network-status)
9. [Additional Features](#additional-features)
10. [Technical Implementation](#technical-implementation)

---

## Dashboard Overview

The MOOSH Wallet dashboard provides a comprehensive view of your Bitcoin holdings with real-time price data and account management features.

### Layout Structure
```
+================================+
|     Account Selector           |
|--------------------------------|
|     Currency & Hide Toggle     |
|--------------------------------|
|     Active Address Display     |
|--------------------------------|
|     Price Chart & Balance      |
|--------------------------------|
|     Live Price Ticker          |
|--------------------------------|
|     Balance Cards              |
|--------------------------------|
|     Network Status             |
+================================+
```

---

## Account Management

### Account Selector
**Location**: Top of dashboard  
**Current Display**: "My main account baby ▼"

#### Features:
1. **Account Name Display**
   - Shows currently selected account name
   - Dropdown arrow (▼) indicates expandable menu
   - Click to open account switcher

2. **Account Switcher Modal**
   - Lists all wallet accounts
   - Shows balance for each account
   - Color-coded account cards
   - Quick switch between accounts

3. **Manage Button**
   - Opens Account Management Modal
   - Features:
     - View all accounts
     - See individual balances
     - Currency conversion display
     - Account colors
     - Create new accounts
     - Import existing wallets

4. **Refresh Button**
   - Manually refreshes account balance
   - Fetches latest blockchain data
   - Updates price information
   - Shows loading state during refresh

### Account Creation Flow
1. Click "Manage" → "Create New Account"
2. Enter account name (validated, no emojis)
3. Choose account color
4. Generate new seed or import existing
5. Account added to list with 0 balance

### Account Import Flow
1. Click "Manage" → "Import Account"
2. Enter 12/24 word seed phrase
3. System validates BIP39 compliance
4. Generates all address types:
   - Legacy (1...)
   - Nested SegWit (3...)
   - Native SegWit (bc1q...)
   - Taproot (bc1p...)
   - Spark Protocol (sp1...)

---

## Currency Selection

### Dashboard Currency Selector
**Current Selection**: GBP (British Pounds)

#### Supported Currencies:
- USD (US Dollar) - $
- EUR (Euro) - €
- GBP (British Pound) - £
- CAD (Canadian Dollar) - C$
- AUD (Australian Dollar) - A$
- JPY (Japanese Yen) - ¥
- CNY (Chinese Yuan) - ¥
- INR (Indian Rupee) - ₹
- KRW (South Korean Won) - ₩
- BRL (Brazilian Real) - R$
- MXN (Mexican Peso) - $
- CHF (Swiss Franc) - Fr
- RUB (Russian Ruble) - ₽
- ZAR (South African Rand) - R
- And 10+ more currencies

#### Features:
1. **Real-time Conversion**
   - Updates all values instantly
   - Persists selection across sessions
   - Syncs between dashboard and modals

2. **Theme-Aware Styling**
   - Orange theme: #f57315 borders
   - Moosh mode: #69fd97 borders
   - Smooth hover transitions

---

## Balance Display

### Hide/Show Toggle
**Purpose**: Privacy feature to hide sensitive balance information

#### States:
1. **Visible** (default)
   - Shows all balances and values
   - Displays full addresses

2. **Hidden**
   - Replaces balances with "••••••••"
   - Maintains layout structure
   - Toggle persists across sessions

---

## Active Address Display

**Example**: `bc1qnl8rzz6ch58ldxltjv35x2gfrglx2xmt8pszxf`

### Address Types:
1. **Native SegWit** (bc1q...)
   - Lower transaction fees
   - Default for most wallets
   - Best compatibility

2. **Taproot** (bc1p...)
   - Latest Bitcoin upgrade
   - Enhanced privacy
   - Required for Ordinals

3. **Legacy** (1...)
   - Original address format
   - Higher fees
   - Maximum compatibility

4. **Spark Protocol** (sp1...)
   - Privacy-focused addresses
   - Separate balance tracking

### Features:
- Click to copy address
- QR code generation
- Address type selector
- Visual confirmation on copy

---

## Price Chart

### Main Balance Display
```
BTC Price
£88,288.00
My Balance
£113.01
0.00128000 BTC
```

### Chart Visualization
```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```
- ASCII sparkline chart
- 20-point price history
- Updates every 30 seconds
- Shows price trend visually

### Price Statistics
```
24h: +0.0%
7d: +0.0%
30d: +0.0%
```
- Real-time percentage changes
- Color-coded (green: up, red: down)
- Updates with price data

---

## Live Price Ticker

**Display**: `BTC: $118,331.00 ↓ 0.2% | Next Block: ~1 min | Fee: 4 sat/vB`

### Components:
1. **BTC Price**
   - Current USD price
   - Price change indicator (↑/↓)
   - 24h percentage change
   - Updates every 30 seconds

2. **Next Block Estimate**
   - Time to next Bitcoin block
   - Based on current hashrate
   - Updates dynamically

3. **Fee Rate**
   - Current network fee in sat/vB
   - Helps estimate transaction costs
   - Updates every minute

---

## Balance Cards

### Bitcoin Balance Card
```
Bitcoin Balance
0.00128000 BTC
≈ £113.01 GBP
```
- Shows BTC amount (8 decimals)
- Converted value in selected currency
- Updates on refresh

### Lightning Balance Card
```
Lightning Balance
0 sats
0 active channels
```
- Lightning Network balance
- Channel count
- Future: Channel management

### Stablecoins Card
```
Stablecoins
0 USDT
On Lightning Network
```
- USDT balance tracking
- Lightning-based stablecoins
- Future: Multiple stablecoin support

---

## Network Status

```
Network Status
Connected
Block 905,965
```

### Information Displayed:
1. **Connection Status**
   - Connected/Disconnected
   - Color indicator (green/red)
   - Auto-reconnect on disconnect

2. **Current Block Height**
   - Latest Bitcoin block number
   - Updates in real-time
   - Links to block explorer

---

## Additional Features

### Theme Support
1. **Original Theme** (Orange/Black)
   - Primary: #f57315
   - Accent: #ff8c42
   - Background: #000000

2. **Moosh Mode** (Green/Black)
   - Primary: #69fd97
   - Accent: #7fffb3
   - Background: #000000

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 480px, 768px
- Touch-optimized controls
- Scales to any screen size

### Security Features
1. **Password Lock**
   - Auto-lock after inactivity
   - Secure seed encryption
   - No plain text storage

2. **Privacy Mode**
   - Hide balances on demand
   - Secure clipboard operations
   - No tracking/analytics

---

## Technical Implementation

### Data Flow
1. **Price Data**
   - Primary: CoinGecko API
   - Backup: Blockchain.info
   - 5-minute cache
   - LocalStorage fallback

2. **Balance Data**
   - Direct blockchain queries
   - Multiple API fallbacks
   - Satoshi to BTC conversion
   - Real-time updates

### State Management
```javascript
{
  currentAccountId: "uuid",
  accounts: [{
    id: "uuid",
    name: "My main account baby",
    addresses: { ... },
    balances: { bitcoin: 128000 },
    color: "#ff6b6b"
  }],
  btcPrice: 118331,
  selectedCurrency: "GBP",
  isBalanceHidden: false
}
```

### Update Intervals
- Price refresh: 30 seconds
- Balance refresh: On demand
- Network status: 60 seconds
- Fee estimates: 60 seconds

### API Integration
1. **Price APIs**
   - CoinGecko (primary)
   - Blockchain.info (backup)
   - Coinbase (future)

2. **Blockchain APIs**
   - Mempool.space
   - Blockstream.info
   - BlockCypher

3. **Fee Estimation**
   - Mempool.space recommended fees
   - Dynamic adjustment
   - Priority levels

---

## Keyboard Shortcuts

- `R` - Refresh balances
- `H` - Toggle hide balances
- `C` - Copy active address
- `M` - Open manage accounts
- `ESC` - Close modals

---

## Error Handling

1. **API Failures**
   - Automatic fallback to backup APIs
   - Cache last known values
   - User-friendly error messages
   - Retry with exponential backoff

2. **Network Issues**
   - Offline mode support
   - Queue actions for retry
   - Show connection status
   - Auto-reconnect

3. **Invalid Data**
   - Input validation
   - Sanitization
   - Error boundaries
   - Graceful degradation

---

## Future Enhancements

1. **Multi-Wallet Mode**
   - Select multiple accounts
   - Aggregate balances
   - Unified transaction view
   - Bulk operations

2. **Advanced Features**
   - Transaction history
   - UTXO management
   - Fee bumping
   - Coin control

3. **Integrations**
   - Hardware wallet support
   - Lightning Network
   - DeFi protocols
   - Ordinals marketplace

---

## Compliance & Standards

- NO EMOJI policy enforced
- ASCII indicators only
- Monospace font (Courier New)
- Sharp corners (no border-radius)
- Terminal aesthetic maintained
- 100% ComplianceUtils usage
- Debounced inputs (300ms)
- Mobile-first responsive

---

This dashboard represents a professional, secure, and user-friendly Bitcoin wallet interface with real-time data, comprehensive account management, and a unique terminal aesthetic that sets MOOSH Wallet apart from traditional cryptocurrency wallets.