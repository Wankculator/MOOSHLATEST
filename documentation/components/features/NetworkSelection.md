# Network Selection

**Status**: 🟡 Beta
**Type**: Core Feature
**Security Critical**: Yes
**Implementation**: /public/js/moosh-wallet.js:1376-1424, 2010-2011

## Overview
Network selection allows users to switch between Bitcoin mainnet and testnet environments. This feature is essential for development, testing, and learning purposes, enabling users to experiment without risking real funds.

## User Flow
```
[Toggle Network Switch] → [Confirm Network Change] → [Wallet Reinitializes] → [UI Updates] → [New Network Active]
```

## Technical Implementation

### Frontend
- **Entry Point**: Network toggle switch in UI
- **UI Components**: 
  - Network toggle switch
  - Visual network indicator
  - Confirmation dialog
  - Network status badge
- **State Changes**: 
  - `isMainnet` state flag
  - API endpoint updates
  - Address format changes
  - Balance refresh

### Backend
- **API Endpoints**: 
  - Mainnet: `https://mempool.space/api/`
  - Testnet: `https://mempool.space/testnet/api/`
- **Services Used**: 
  - Network-specific block explorers
  - Testnet faucets (for testing)
- **Data Flow**: 
  1. User toggles network
  2. State updates to new network
  3. API endpoints reconfigured
  4. Wallets regenerated for network
  5. UI reflects network change

## Code Example
```javascript
// Network selection implementation
class NetworkManager {
    constructor(app) {
        this.app = app;
        this.networks = {
            mainnet: {
                name: 'Bitcoin Mainnet',
                apiUrl: 'https://mempool.space/api',
                explorerUrl: 'https://mempool.space',
                addressPrefix: 'bc1',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4
                }
            },
            testnet: {
                name: 'Bitcoin Testnet',
                apiUrl: 'https://mempool.space/testnet/api',
                explorerUrl: 'https://mempool.space/testnet',
                addressPrefix: 'tb1',
                bip32: {
                    public: 0x043587cf,
                    private: 0x04358394
                }
            }
        };
        
        this.currentNetwork = 'mainnet';
    }
    
    getCurrentNetwork() {
        return this.networks[this.currentNetwork];
    }
    
    async switchNetwork(network) {
        if (!this.networks[network]) {
            throw new Error(`Unknown network: ${network}`);
        }
        
        // Confirm with user if switching from mainnet
        if (this.currentNetwork === 'mainnet' && network === 'testnet') {
            const confirmed = await this.confirmNetworkSwitch(network);
            if (!confirmed) return false;
        }
        
        // Save current state
        this.saveNetworkState();
        
        // Update network
        this.currentNetwork = network;
        this.app.state.set('isMainnet', network === 'mainnet');
        
        // Update API endpoints
        this.updateApiEndpoints();
        
        // Regenerate addresses for new network
        await this.regenerateWallets();
        
        // Update UI
        this.updateNetworkUI();
        
        // Notify user
        this.app.showNotification(
            `Switched to ${this.networks[network].name}`,
            'success'
        );
        
        return true;
    }
    
    async confirmNetworkSwitch(targetNetwork) {
        return new Promise((resolve) => {
            const modal = new ConfirmModal({
                title: 'Switch Network',
                message: `
                    <p>You are about to switch to <strong>${this.networks[targetNetwork].name}</strong>.</p>
                    <p>Important:</p>
                    <ul>
                        <li>Addresses will be different on each network</li>
                        <li>Testnet coins have no real value</li>
                        <li>Do not send mainnet coins to testnet addresses</li>
                    </ul>
                    <p>Continue with network switch?</p>
                `,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
            modal.show();
        });
    }
    
    updateApiEndpoints() {
        const network = this.getCurrentNetwork();
        
        // Update API service
        this.app.apiService.updateBaseUrl(network.apiUrl);
        
        // Update explorer links
        this.app.config.explorerUrl = network.explorerUrl;
    }
    
    async regenerateWallets() {
        const accounts = this.app.accountManager.getAccounts();
        
        for (const account of accounts) {
            if (account.type === 'spark') {
                // Regenerate addresses for new network
                const seed = this.app.getSeedForAccount(account.id);
                const addresses = await this.generateNetworkAddresses(seed);
                
                // Update account
                account.addresses = addresses;
                account.balance = '0.00000000'; // Reset balance
                account.transactions = []; // Clear transactions
            }
        }
        
        // Save updated accounts
        this.app.accountManager.saveAccounts();
        
        // Refresh balances
        await this.app.refreshAllBalances();
    }
    
    updateNetworkUI() {
        // Update toggle switch
        const toggle = document.querySelector('.network-toggle');
        if (toggle) {
            toggle.classList.toggle('testnet', this.currentNetwork === 'testnet');
        }
        
        // Update network badge
        const badge = document.querySelector('.network-badge');
        if (badge) {
            badge.textContent = this.currentNetwork.toUpperCase();
            badge.style.background = this.currentNetwork === 'testnet' ? '#ff6b6b' : '#00d632';
        }
        
        // Update address displays
        document.querySelectorAll('.wallet-address').forEach(element => {
            const address = element.getAttribute('data-address');
            if (address) {
                // Update address prefix visual indicator
                const isCorrectNetwork = this.currentNetwork === 'mainnet' 
                    ? address.startsWith('bc1')
                    : address.startsWith('tb1');
                
                element.classList.toggle('wrong-network', !isCorrectNetwork);
            }
        });
    }
}

// CSS for network toggle
const networkToggleStyles = `
.network-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    background: #1a1a1a;
    border-radius: 20px;
    cursor: pointer;
}

.toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    background: #00d632;
    border-radius: 12px;
    transition: background 0.3s;
}

.toggle-switch.testnet {
    background: #ff6b6b;
}

.toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
}

.toggle-switch.testnet .toggle-slider {
    transform: translateX(24px);
}

.network-label {
    font-size: 7px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.7;
}
`;
```

## Configuration
- **Settings**: 
  - Available networks: mainnet, testnet
  - Default network: mainnet
  - Network persistence: localStorage
  - Auto-switch prevention
- **Defaults**: 
  - Start on mainnet
  - Confirm before switching
  - Clear data on switch
  - Visual indicators always shown
- **Limits**: 
  - Two networks supported
  - No custom networks yet
  - One network at a time

## Security Considerations
- **Network Isolation**:
  - Separate addresses per network
  - No cross-network transactions
  - Clear visual indicators
  - Confirmation required
- **Data Safety**:
  - Network state persisted
  - Addresses regenerated
  - No key reuse across networks
  - Testnet clearly marked

## Performance Impact
- **Load Time**: Network switch ~2s
- **Memory**: Minimal overhead
- **Network**: New API endpoints

## Mobile Considerations
- Touch-friendly toggle switch
- Clear network indicators
- Responsive confirmation dialog
- Visual feedback on switch
- Persistent network selection

## Error Handling
- **Common Errors**: 
  - Network API unavailable
  - Address generation failure
  - State corruption
  - API endpoint mismatch
- **Recovery**: 
  - Fallback to mainnet
  - Retry mechanisms
  - Clear error messages
  - Manual network reset

## Testing
```bash
# Test network selection
1. Test network toggle:
   - Switch to testnet
   - Verify confirmation dialog
   - Check address prefixes change
   - Verify API calls use testnet
   
2. Test data isolation:
   - Create wallet on mainnet
   - Switch to testnet
   - Verify different addresses
   - Switch back to mainnet
   - Verify original addresses
   
3. Test visual indicators:
   - Check toggle color (green/red)
   - Verify network badge
   - Check address warnings
   
4. Test persistence:
   - Switch to testnet
   - Refresh page
   - Verify still on testnet
```

## Future Enhancements
- **Additional Networks**:
  - Signet support
  - Regtest for developers
  - Custom network configuration
  - Lightning network selection
- **Advanced Features**:
  - Network-specific wallets
  - Automatic faucet integration
  - Network status monitoring
  - Cross-network warnings
  - Network performance metrics
- **Developer Tools**:
  - Network simulation
  - Transaction broadcasting
  - Block explorer integration
  - Debug network mode
  - API response mocking