# Component: Balance Display System

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 9114-9200 (createBalanceSection)
- `/public/js/moosh-wallet.js` - Lines 11820-11900 (Balance display methods)
- `/public/js/moosh-wallet.js` - Lines 13950-14050 (Balance updates)

## Overview
The Balance Display System shows wallet balances across Bitcoin and Spark Protocol, with real-time USD conversion, privacy mode support, and multi-account aggregation.

## Component Architecture

### Core Components
1. **BalanceDisplay** - Main balance presentation
2. **BalanceUpdater** - Real-time balance fetching
3. **BalanceAggregator** - Multi-account totals
4. **BalanceFormatter** - Number formatting and conversion

## Implementation Details

### Balance Display Component
```javascript
createBalanceSection() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ 
        className: 'balance-section',
        style: {
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-color)',
            borderRadius: '8px',
            padding: 'calc(24px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            textAlign: 'center'
        }
    }, [
        this.createBalanceHeader(),
        this.createBitcoinBalance(),
        this.createSparkBalance(),
        this.createTotalValue(),
        this.createBalanceActions()
    ]);
}

createBitcoinBalance() {
    const $ = window.ElementFactory || ElementFactory;
    const isHidden = this.app.state.get('privacyMode');
    
    return $.div({
        className: 'bitcoin-balance',
        style: {
            marginBottom: 'calc(16px * var(--scale-factor))'
        }
    }, [
        $.div({
            style: {
                fontSize: 'calc(32px * var(--scale-factor))',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 'calc(8px * var(--scale-factor))'
            }
        }, [
            $.span({ 
                id: 'btc-balance',
                className: isHidden ? 'balance-hidden' : ''
            }, [
                isHidden ? '••••••••' : 'Loading...'
            ]),
            $.span({ 
                style: { 
                    fontSize: 'calc(18px * var(--scale-factor))' 
                } 
            }, [' BTC'])
        ]),
        $.div({
            style: {
                fontSize: 'calc(16px * var(--scale-factor))',
                color: 'var(--text-dim)',
                fontFamily: "'JetBrains Mono', monospace"
            }
        }, [
            '≈ $',
            $.span({ 
                id: 'btc-usd-value',
                className: isHidden ? 'balance-hidden' : ''
            }, [
                isHidden ? '•••••' : '0.00'
            ])
        ])
    ]);
}
```

### Balance Updater
```javascript
class BalanceUpdater {
    constructor(app) {
        this.app = app;
        this.updateInterval = 60000; // 1 minute
        this.isUpdating = false;
        
        this.startAutoUpdate();
    }
    
    async updateBalances() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        
        try {
            const wallet = this.app.state.get('currentWallet');
            if (!wallet || !wallet.addresses) return;
            
            // Fetch balances in parallel
            const [btcBalance, sparkBalance] = await Promise.all([
                this.fetchBitcoinBalance(wallet.addresses.bitcoin),
                this.fetchSparkBalance(wallet.addresses.spark)
            ]);
            
            // Update state
            wallet.balances = {
                bitcoin: btcBalance,
                spark: sparkBalance
            };
            
            this.app.state.set('currentWallet', wallet);
            
            // Update UI
            this.updateBalanceDisplay(btcBalance, sparkBalance);
            
            // Calculate USD values
            await this.updateUsdValues(btcBalance);
            
        } catch (error) {
            console.error('Failed to update balances:', error);
        } finally {
            this.isUpdating = false;
        }
    }
    
    async fetchBitcoinBalance(address) {
        const response = await this.app.apiService.request(
            `/api/bitcoin/balance/${address}`
        );
        
        if (response.success) {
            return response.data.balance;
        }
        
        throw new Error('Failed to fetch Bitcoin balance');
    }
}
```

### Balance Aggregator
```javascript
class BalanceAggregator {
    constructor(app) {
        this.app = app;
    }
    
    async calculateTotalBalance() {
        const activeAccounts = this.app.state.get('activeAccounts') || [];
        const wallets = this.app.state.get('wallets') || [];
        
        let totalBtc = 0;
        let totalSpark = 0;
        
        // Only aggregate active accounts
        for (const accountId of activeAccounts) {
            const wallet = wallets.find(w => w.id === accountId);
            if (wallet && wallet.balances) {
                totalBtc += wallet.balances.bitcoin || 0;
                totalSpark += wallet.balances.spark || 0;
            }
        }
        
        // Update aggregated display
        this.updateAggregatedDisplay(totalBtc, totalSpark);
        
        return { totalBtc, totalSpark };
    }
    
    updateAggregatedDisplay(totalBtc, totalSpark) {
        const btcElement = document.getElementById('total-btc-balance');
        const sparkElement = document.getElementById('total-spark-balance');
        
        if (btcElement) {
            btcElement.textContent = this.formatBalance(totalBtc, 8);
        }
        
        if (sparkElement) {
            sparkElement.textContent = this.formatBalance(totalSpark, 0);
        }
    }
}
```

### Balance Formatter
```javascript
class BalanceFormatter {
    static formatBitcoin(amount, decimals = 8) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        
        // Format with proper decimal places
        const formatted = amount.toFixed(decimals);
        
        // Remove trailing zeros for display
        return formatted.replace(/\.?0+$/, '') || '0';
    }
    
    static formatUsd(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    static formatSpark(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' SPARK';
    }
    
    static abbreviateBalance(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(2) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(2) + 'K';
        }
        return amount.toFixed(2);
    }
}
```

## Visual Specifications

### Balance Display Styles
```css
.balance-section {
    position: relative;
    overflow: hidden;
}

.balance-section::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
        circle at center,
        rgba(105, 253, 151, 0.05) 0%,
        transparent 70%
    );
    animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

.bitcoin-balance {
    position: relative;
    z-index: 1;
}

.balance-hidden {
    filter: blur(8px);
    user-select: none;
}

.balance-change-indicator {
    display: inline-block;
    margin-left: 8px;
    font-size: 14px;
    padding: 2px 8px;
    border-radius: 4px;
}

.balance-change-indicator.positive {
    background: rgba(105, 253, 151, 0.2);
    color: #69FD97;
}

.balance-change-indicator.negative {
    background: rgba(233, 69, 96, 0.2);
    color: #E94560;
}
```

## DOM Structure
```html
<div class="balance-section">
    <div class="balance-header">
        <h3>Wallet Balance</h3>
        <button class="privacy-toggle">👁</button>
    </div>
    
    <div class="bitcoin-balance">
        <div class="balance-amount">
            <span id="btc-balance">0.00123456</span>
            <span class="balance-unit">BTC</span>
        </div>
        <div class="balance-usd">
            ≈ $<span id="btc-usd-value">53,721.45</span>
            <span class="balance-change-indicator positive">+2.34%</span>
        </div>
    </div>
    
    <div class="spark-balance">
        <div class="balance-amount">
            <span id="spark-balance">1,000</span>
            <span class="balance-unit">SPARK</span>
        </div>
    </div>
    
    <div class="total-value">
        <span class="label">Total Value:</span>
        <span class="value">$53,721.45</span>
    </div>
</div>
```

## Real-time Updates

### Balance Refresh Logic
```javascript
async refreshBalances() {
    // Show loading state
    this.setLoadingState(true);
    
    try {
        // Update current wallet
        await this.balanceUpdater.updateBalances();
        
        // Update aggregated totals if multi-account
        if (this.hasMultipleActiveAccounts()) {
            await this.balanceAggregator.calculateTotalBalance();
        }
        
        // Emit balance update event
        this.app.events.emit('balanceUpdated', {
            wallet: this.app.state.get('currentWallet'),
            timestamp: Date.now()
        });
        
    } catch (error) {
        this.showError('Failed to update balance');
    } finally {
        this.setLoadingState(false);
    }
}

// Auto-refresh on network change
app.events.on('networkChange', () => {
    this.refreshBalances();
});

// Refresh on new transaction
app.events.on('newTransaction', () => {
    this.refreshBalances();
});
```

## Privacy Mode Integration
```javascript
togglePrivacyMode() {
    const isPrivate = !this.app.state.get('privacyMode');
    this.app.state.set('privacyMode', isPrivate);
    
    // Update all balance displays
    document.querySelectorAll('.balance-amount').forEach(el => {
        if (isPrivate) {
            el.dataset.originalValue = el.textContent;
            el.textContent = '••••••••';
            el.classList.add('balance-hidden');
        } else {
            el.textContent = el.dataset.originalValue || el.textContent;
            el.classList.remove('balance-hidden');
        }
    });
}
```

## Performance Optimizations
1. **Debounced Updates**: Balance updates debounced to prevent API spam
2. **Parallel Fetching**: Bitcoin and Spark balances fetched simultaneously
3. **Smart Caching**: Balance cached for 1 minute to reduce API calls
4. **Selective Updates**: Only update changed values in DOM

## Testing
```bash
# Test balance fetching
npm run test:balance:fetch

# Test formatting
npm run test:balance:format

# Test aggregation
npm run test:balance:aggregate

# Test privacy mode
npm run test:balance:privacy
```

## Known Issues
1. Balance can briefly show stale data on network switch
2. USD conversion doesn't update when Bitcoin price changes
3. Aggregation can be slow with many accounts

## Git Recovery Commands
```bash
# Restore balance display
git checkout 1981e5a -- public/js/moosh-wallet.js

# View balance implementation history
git log -p --grep="balance" -- public/js/moosh-wallet.js

# Restore specific balance functions
git show HEAD:public/js/moosh-wallet.js | grep -A 50 "createBalanceSection"
```

## Related Components
- [Dashboard Widgets](./DashboardWidgets.md)
- [Real-time Price Updates](./RealTimePriceUpdates.md)
- [Privacy Mode](./SecurityFeatures.md#privacy-mode)
- [Multi-Account Management](./MultiWalletManagement.md)