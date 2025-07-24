# NetworkSelectorModal Component Documentation

## Overview
The Network Selector functionality in MOOSH Wallet is currently implemented as a toggle switch in the Terminal component rather than a full modal. It allows users to switch between Bitcoin Mainnet and Testnet. This documentation covers both the current implementation and a proposed enhanced modal version.

## Current Implementation
- **Location**: Terminal component (Lines 5265-5297)
- **Type**: Toggle switch
- **Networks**: Mainnet and Testnet only

## Visual Design

### Current Toggle Switch
```
Terminal:  .mainnet  [====○]
           .testnet  [○====]
```

### Proposed Modal ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│  Network Selection                                 [×]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select Bitcoin Network:                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ◉ Bitcoin Mainnet                                │  │
│  │   Production network with real Bitcoin            │  │
│  │   Status: Connected ✓                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ○ Bitcoin Testnet                                │  │
│  │   Test network for development                    │  │
│  │   Status: Available                               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ○ Bitcoin Signet                                 │  │
│  │   Predictable test network                        │  │
│  │   Status: Coming Soon                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ⚠ Warning: Switching networks will refresh all data    │
│                                                         │
│              [ Switch Network ]                         │
└─────────────────────────────────────────────────────────┘
```

## Current Implementation Details

### Toggle Switch Code
**Location**: Lines 5265-5277

```javascript
createNetworkToggle() {
    const isMainnet = this.app.state.get('isMainnet') !== false;
    
    return $.div({ className: 'network-toggle' }, [
        $.span({
            id: 'networkLabel',
            className: 'network-label'
        }, [isMainnet ? '.mainnet' : '.testnet']),
        $.div({
            id: 'networkToggle',
            className: isMainnet ? 'toggle-switch' : 'toggle-switch testnet',
            onclick: () => this.toggleNetwork()
        }, [
            $.div({ className: 'toggle-slider' })
        ])
    ]);
}
```

### toggleNetwork() Method
**Location**: Lines 5279-5297

```javascript
toggleNetwork() {
    const isMainnet = !this.app.state.get('isMainnet');
    this.app.state.set('isMainnet', isMainnet);
    
    const toggle = document.getElementById('networkToggle');
    const label = document.getElementById('networkLabel');
    
    if (isMainnet) {
        toggle.classList.remove('testnet');
        label.textContent = '.mainnet';
        console.log('[Network] Switched to Bitcoin MAINNET');
    } else {
        toggle.classList.add('testnet');
        label.textContent = '.testnet';
        console.log('[Network] Switched to Bitcoin TESTNET');
    }
    
    this.app.showNotification(`Network: ${isMainnet ? '.mainnet' : '.testnet'}`, 'network');
}
```

## Network Configuration

### API Endpoints
**Location**: Lines 2874-2881

```javascript
const isMainnet = this.stateManager.get('isMainnet') !== false;

this.endpoints = {
    coingecko: 'https://api.coingecko.com/api/v3',
    blockstream: isMainnet ? 
        'https://blockstream.info/api' : 
        'https://blockstream.info/testnet/api',
    blockcypher: isMainnet ? 
        'https://api.blockcypher.com/v1/btc/main' : 
        'https://api.blockcypher.com/v1/btc/test3'
};
```

## Styling

### Toggle Switch Styles
```css
.toggle-switch {
    /* Default mainnet style */
    background: var(--text-primary);
}

.toggle-switch.testnet .toggle-slider {
    background: #ff6b6b;  /* Red for testnet */
}
```

## Proposed Modal Implementation

### Class Structure
```javascript
class NetworkSelectorModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.selectedNetwork = this.app.state.get('network') || 'mainnet';
        this.networks = [
            {
                id: 'mainnet',
                name: 'Bitcoin Mainnet',
                description: 'Production network with real Bitcoin',
                color: '#f57315',
                endpoints: {
                    blockstream: 'https://blockstream.info/api',
                    mempool: 'https://mempool.space/api'
                }
            },
            {
                id: 'testnet',
                name: 'Bitcoin Testnet',
                description: 'Test network for development',
                color: '#ff6b6b',
                endpoints: {
                    blockstream: 'https://blockstream.info/testnet/api',
                    mempool: 'https://mempool.space/testnet/api'
                }
            },
            {
                id: 'signet',
                name: 'Bitcoin Signet',
                description: 'Predictable test network',
                color: '#9b59b6',
                enabled: false
            }
        ];
    }
}
```

### Network Features

#### Mainnet
- Real Bitcoin transactions
- Production addresses
- Live market prices
- Full functionality

#### Testnet
- Test Bitcoin (no value)
- Testnet addresses (different prefix)
- Free faucets available
- Safe for testing

#### Signet (Future)
- Controlled block production
- Reliable for testing
- No unexpected reorgs

## State Management

### Current State
```javascript
// Network state
this.app.state.set('isMainnet', true/false);

// Access in components
const isMainnet = this.app.state.get('isMainnet') !== false;
```

### Proposed Enhanced State
```javascript
{
    network: {
        current: 'mainnet',
        available: ['mainnet', 'testnet', 'signet'],
        status: {
            mainnet: { connected: true, height: 750000 },
            testnet: { connected: true, height: 2500000 },
            signet: { connected: false }
        },
        lastSwitch: timestamp
    }
}
```

## Network-Specific Features

### Address Validation
```javascript
// Different regex patterns per network
const patterns = {
    mainnet: {
        taproot: /^bc1p[a-z0-9]{58}$/,
        legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
    },
    testnet: {
        taproot: /^tb1p[a-z0-9]{58}$/,
        legacy: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
    }
};
```

### Explorer URLs
```javascript
// Network-specific explorers
getExplorerUrl(address) {
    const network = this.app.state.get('network');
    if (network === 'testnet') {
        return `https://mempool.space/testnet/address/${address}`;
    }
    return `https://mempool.space/address/${address}`;
}
```

## User Experience

### Network Switch Flow
1. User clicks network toggle/opens modal
2. Sees current network highlighted
3. Selects new network
4. Warning about data refresh
5. Confirmation required
6. Network switches
7. All data refreshes

### Visual Indicators
- Network name in UI
- Color coding (orange/red)
- Connection status
- Block height display

## Security Considerations

1. **Clear Network Display**
   - Always show current network
   - Prominent testnet indicators
   - Warning colors for non-mainnet

2. **Data Isolation**
   - Separate storage per network
   - No address reuse between networks
   - Clear cache on switch

3. **User Warnings**
   - Confirm network switches
   - Warn about testnet coins
   - Prevent accidental sends

## Mobile Considerations

### Current Toggle
- Touch-friendly size
- Clear visual feedback
- Accessible location

### Proposed Modal
- Full-screen on mobile
- Large touch targets
- Swipe to dismiss
- Clear network badges

## Integration Examples

### Component Usage
```javascript
// Check network in components
const isTestnet = this.app.state.get('network') === 'testnet';
if (isTestnet) {
    this.showTestnetWarning();
}
```

### API Calls
```javascript
// Network-aware API calls
async fetchBalance(address) {
    const endpoint = this.getEndpointForNetwork();
    return this.apiService.request(`${endpoint}/address/${address}`);
}
```

## Future Enhancements

1. **Additional Networks**
   - Liquid Network
   - Lightning Network view
   - Custom RPC endpoints

2. **Network Stats**
   - Block height
   - Mempool size
   - Fee estimates
   - Peer count

3. **Advanced Features**
   - Auto-switch based on address
   - Network-specific settings
   - Connection diagnostics

## Testing Considerations

1. **Network Switching**
   - Data persistence
   - API endpoint updates
   - UI updates

2. **Address Handling**
   - Validation per network
   - Correct prefixes
   - Explorer links

3. **State Management**
   - Consistent network state
   - Component updates
   - Storage isolation