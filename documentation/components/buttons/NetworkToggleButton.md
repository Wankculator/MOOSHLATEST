# Network Toggle Button

## Overview
The Network Toggle Button allows users to switch between Bitcoin mainnet and testnet. It provides visual feedback about the current network and prevents accidental network switches.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 5269-5283 (renderNetworkToggle method)

### Visual Specifications
- **Container**: Network toggle switch
- **Mainnet Color**: Orange (`#f57315`)
- **Testnet Color**: Green (`#00ff00`)
- **Background**: Dark with gradient
- **Size**: 60px × 30px toggle
- **Border Radius**: 15px
- **Transition**: Smooth 0.3s slide

### Implementation

```javascript
renderNetworkToggle() {
    const isMainnet = this.app.state.get('network') === 'mainnet';
    
    return $.div({ className: 'network-toggle-container' }, [
        $.label({ className: 'network-label' }, ['Network']),
        $.div({ 
            className: isMainnet ? 'toggle-switch' : 'toggle-switch testnet',
            onclick: () => this.toggleNetwork()
        }, [
            $.div({ className: 'toggle-slider' }),
            $.span({ className: 'network-name' }, [isMainnet ? 'Mainnet' : 'Testnet'])
        ])
    ]);
}
```

### CSS Styles
```css
.network-toggle-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
}

.toggle-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background: #333333;
    border-radius: 15px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.toggle-switch.testnet {
    background: #00ff00;
}

.toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.testnet .toggle-slider {
    transform: translateX(30px);
}

.network-name {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
}
```

### Toggle Handler

```javascript
async toggleNetwork() {
    // Show confirmation dialog
    const currentNetwork = this.app.state.get('network');
    const newNetwork = currentNetwork === 'mainnet' ? 'testnet' : 'mainnet';
    
    const confirmed = await this.showConfirmDialog({
        title: 'Switch Network?',
        message: `Switch from ${currentNetwork} to ${newNetwork}? This will reload the wallet.`,
        confirmText: 'Switch',
        warning: newNetwork === 'mainnet' ? 
            'Mainnet uses real Bitcoin. Be careful!' : 
            'Testnet Bitcoin has no real value.'
    });
    
    if (!confirmed) return;
    
    try {
        // Show loading state
        this.showLoading('Switching network...');
        
        // Update network setting
        await this.app.setNetwork(newNetwork);
        
        // Clear network-specific data
        this.clearNetworkData();
        
        // Reload wallet with new network
        await this.reloadWallet();
        
        // Update UI
        this.hideLoading();
        this.showToast(`Switched to ${newNetwork}`, 'success');
        
    } catch (error) {
        console.error('Network switch failed:', error);
        this.showError('Failed to switch network');
    }
}
```

### Network-Specific Features

```javascript
getNetworkConfig(network) {
    return {
        mainnet: {
            name: 'Bitcoin Mainnet',
            color: '#f57315',
            apiUrl: 'https://api.blockcypher.com/v1/btc/main',
            explorerUrl: 'https://blockstream.info',
            bip44: "m/44'/0'/0'/0",
            warning: 'Real Bitcoin - Transactions are irreversible!'
        },
        testnet: {
            name: 'Bitcoin Testnet',
            color: '#00ff00',
            apiUrl: 'https://api.blockcypher.com/v1/btc/test3',
            explorerUrl: 'https://blockstream.info/testnet',
            bip44: "m/44'/1'/0'/0",
            info: 'Test network - Free coins from faucets'
        }
    }[network];
}
```

### Visual Indicators
1. **Color Coding**
   - Mainnet: Orange theme throughout UI
   - Testnet: Green theme with clear labels

2. **Warning Badges**
   - Mainnet: "REAL" badge
   - Testnet: "TEST" badge

3. **Address Prefixes**
   - Mainnet: bc1... (bech32)
   - Testnet: tb1... (bech32)

### State Management
```javascript
// Network state affects:
- API endpoints
- Address generation
- Transaction signing
- Block explorer links
- Fee estimates
- Balance displays
```

### Security Features
- Confirmation required for switching
- Clear network indicators
- Separate data storage per network
- Warning messages for mainnet
- No accidental mixing of networks

### Mobile Behavior
- Larger touch target
- Swipe gesture support (optional)
- Clear visual feedback
- Confirmation always required

### Related Features
- Separate wallets per network
- Network-specific transaction history
- Different fee structures
- Testnet faucet integration
- Network status indicator

### Data Isolation
```javascript
// Network-specific storage keys
const storageKey = `wallet_${network}_${key}`;

// Separate:
- Addresses
- Transactions  
- UTXOs
- Settings
- Price data
```

### Related Components
- Network Status Indicator
- Address Display (with prefix)
- Transaction List
- Fee Estimator
- Block Explorer Links