# UI Section: Balance Display Section

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 9114-9200 (Main balance section)
- `/public/js/moosh-wallet.js` - Lines 11820-11900 (Balance methods)
- `/public/js/moosh-wallet.js` - Lines 13950-14050 (Balance display)

## Overview
The Balance Display Section is a prominent UI component that shows wallet balances for both Bitcoin and Spark Protocol, with real-time USD conversion and privacy mode support.

## Component Architecture

### Visual Layout
```javascript
createBalanceSection() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ 
        className: 'balance-section',
        style: {
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(105, 253, 151, 0.05) 100%)',
            border: '2px solid var(--border-color)',
            borderRadius: '12px',
            padding: 'calc(32px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }
    }, [
        this.createBalanceBackground(),
        this.createBalanceContent()
    ]);
}
```

## Visual Specifications

### Container Styling
```css
.balance-section {
    position: relative;
    min-height: 200px;
    backdrop-filter: blur(10px);
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
        rgba(105, 253, 151, 0.1) 0%,
        transparent 50%
    );
    animation: rotate 30s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.balance-content {
    position: relative;
    z-index: 1;
}
```

### Balance Typography
```css
.balance-header {
    font-size: calc(14px * var(--scale-factor));
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 24px;
}

.btc-balance-display {
    font-size: calc(48px * var(--scale-factor));
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    line-height: 1.2;
    margin-bottom: 8px;
}

.balance-unit {
    font-size: calc(24px * var(--scale-factor));
    font-weight: 400;
    opacity: 0.8;
}

.usd-equivalent {
    font-size: calc(20px * var(--scale-factor));
    color: var(--text-dim);
    margin-bottom: 32px;
}

.spark-balance {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-top: 24px;
}
```

## DOM Structure
```html
<div class="balance-section">
    <div class="balance-background"></div>
    
    <div class="balance-content">
        <div class="balance-header">
            <span class="bracket">&lt;</span>
            TOTAL BALANCE
            <span class="bracket">/&gt;</span>
        </div>
        
        <div class="btc-balance-container">
            <div class="btc-balance-display">
                <span id="btc-balance-main">0.00123456</span>
                <span class="balance-unit">BTC</span>
            </div>
            <div class="usd-equivalent">
                ≈ <span id="usd-value">$53,721.89</span>
                <span class="price-change positive">+2.34%</span>
            </div>
        </div>
        
        <div class="spark-balance">
            <img src="images/spark-icon.png" class="spark-icon" alt="Spark">
            <div class="spark-amount">
                <span id="spark-balance">1,000</span>
                <span class="spark-unit">SPARK</span>
            </div>
        </div>
        
        <div class="balance-actions">
            <button class="balance-refresh" title="Refresh balance">🔄</button>
            <button class="balance-privacy" title="Toggle privacy">👁</button>
        </div>
    </div>
</div>
```

## Interactive Features

### Privacy Mode Toggle
```javascript
togglePrivacyMode() {
    const isPrivate = !this.state.privacyMode;
    this.state.privacyMode = isPrivate;
    
    const balanceElements = [
        document.getElementById('btc-balance-main'),
        document.getElementById('usd-value'),
        document.getElementById('spark-balance')
    ];
    
    balanceElements.forEach(el => {
        if (isPrivate) {
            el.dataset.originalValue = el.textContent;
            el.textContent = '••••••';
            el.classList.add('blurred');
        } else {
            el.textContent = el.dataset.originalValue || el.textContent;
            el.classList.remove('blurred');
        }
    });
    
    // Update button icon
    const privacyBtn = document.querySelector('.balance-privacy');
    privacyBtn.textContent = isPrivate ? '🙈' : '👁';
}
```

### Balance Animation
```javascript
animateBalanceUpdate(element, oldValue, newValue) {
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentValue = oldValue + (newValue - oldValue) * easeOutQuart;
        element.textContent = this.formatBalance(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Final value
            element.textContent = this.formatBalance(newValue);
            
            // Flash effect
            element.classList.add('balance-updated');
            setTimeout(() => element.classList.remove('balance-updated'), 300);
        }
    };
    
    requestAnimationFrame(animate);
}
```

## Responsive Design

### Mobile Layout
```css
@media (max-width: 768px) {
    .balance-section {
        padding: calc(24px * var(--scale-factor));
    }
    
    .btc-balance-display {
        font-size: calc(36px * var(--scale-factor));
    }
    
    .balance-unit {
        font-size: calc(18px * var(--scale-factor));
    }
    
    .usd-equivalent {
        font-size: calc(16px * var(--scale-factor));
    }
    
    .spark-balance {
        flex-direction: column;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .btc-balance-display {
        font-size: calc(28px * var(--scale-factor));
    }
    
    .balance-header {
        font-size: calc(12px * var(--scale-factor));
    }
}
```

## Loading States
```javascript
showLoadingState() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'balance-loading' }, [
        $.div({ className: 'skeleton-loader balance-skeleton' }),
        $.div({ className: 'skeleton-loader usd-skeleton' }),
        $.div({ className: 'skeleton-loader spark-skeleton' })
    ]);
}
```

### Loading Animation
```css
.skeleton-loader {
    background: linear-gradient(
        90deg,
        var(--bg-secondary) 0%,
        rgba(255, 255, 255, 0.1) 50%,
        var(--bg-secondary) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.balance-skeleton {
    width: 200px;
    height: 48px;
    margin: 0 auto 16px;
}

.usd-skeleton {
    width: 150px;
    height: 24px;
    margin: 0 auto 16px;
}
```

## Real-time Updates
```javascript
subscribeToBalanceUpdates() {
    // Update every 30 seconds
    this.balanceInterval = setInterval(() => {
        this.refreshBalance();
    }, 30000);
    
    // Update on transaction
    this.app.events.on('newTransaction', () => {
        this.refreshBalance();
    });
    
    // Update on price change
    this.app.events.on('priceUpdate', (data) => {
        this.updateUsdValue(data.price);
    });
}
```

## Performance Optimizations
1. **Debounced updates** to prevent flashing
2. **Number formatting** cached for common values
3. **Animation frame** usage for smooth transitions
4. **Selective DOM updates** only for changed values

## Accessibility
- ARIA live regions for balance updates
- High contrast mode support
- Screen reader friendly number formatting
- Keyboard shortcuts for privacy toggle

## Testing
```bash
# Test balance display
npm run test:ui:balance-display

# Test privacy mode
npm run test:ui:balance-privacy

# Test animations
npm run test:ui:balance-animations
```

## Known Issues
1. USD value can be stale if price updates fail
2. Animation can stutter on low-end devices
3. Privacy mode state not persisted

## Git Recovery Commands
```bash
# Restore balance display
git checkout 1981e5a -- public/js/moosh-wallet.js

# View balance implementation
git log -p --grep="balance.*display\|createBalance" -- public/js/moosh-wallet.js
```

## Related Components
- [Balance Display Feature](../features/BalanceDisplay.md)
- [Dashboard Widgets](../features/DashboardWidgets.md)
- [Privacy Toggle Button](../buttons/PrivacyToggleButton.md)
- [Real-time Price Updates](../features/RealTimePriceUpdates.md)