# Privacy Toggle Button

## Overview
The Privacy Toggle Button hides/shows sensitive information like balances and addresses. It's a key privacy feature that replaces values with asterisks when activated.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 
  - 9034-9038 (Dashboard visibility toggle)
  - 9098-9102 (Header privacy toggle)
  - 11740-11744 (Additional instance)

### Visual Specifications
- **Class**: `btn-secondary dashboard-btn visibility-toggle` or `header-btn privacy-toggle`
- **Icon**: 👁️ (visible) / 👁️‍🗨️ (hidden)
- **Background**: Black (`#000000`)
- **Border**: 2px solid `var(--border-active)`
- **Toggle State**: Changes icon and applies blur/hide effect

### Implementation

```javascript
// Dashboard version
$.button({
    className: 'btn-secondary dashboard-btn visibility-toggle',
    onclick: () => this.toggleBalanceVisibility(),
    title: 'Toggle balance visibility'
}, [this.isBalanceVisible ? '👁️' : '👁️‍🗨️'])

// Header version
$.button({
    className: 'header-btn privacy-toggle',
    title: 'Toggle Privacy',
    onclick: () => this.togglePrivacyMode()
}, [this.privacyMode ? '👁️‍🗨️' : '👁️'])
```

### Toggle Handlers

```javascript
toggleBalanceVisibility() {
    // Toggle state
    this.isBalanceVisible = !this.isBalanceVisible;
    
    // Save preference
    localStorage.setItem('balance_visible', this.isBalanceVisible);
    
    // Update all balance displays
    this.updateBalanceDisplay();
    
    // Update button icon
    const button = event.currentTarget;
    button.textContent = this.isBalanceVisible ? '👁️' : '👁️‍🗨️';
    
    // Announce change
    this.announceToScreenReader(
        this.isBalanceVisible ? 'Balance visible' : 'Balance hidden'
    );
}

togglePrivacyMode() {
    // Toggle global privacy mode
    this.privacyMode = !this.privacyMode;
    this.app.state.set('privacyMode', this.privacyMode);
    
    // Apply privacy mode to all sensitive elements
    document.querySelectorAll('.sensitive-data').forEach(element => {
        if (this.privacyMode) {
            element.classList.add('hidden-data');
        } else {
            element.classList.remove('hidden-data');
        }
    });
    
    // Update displays
    this.updatePrivacyDisplay();
    
    // Save preference
    localStorage.setItem('privacy_mode', this.privacyMode);
}
```

### Privacy Display Methods

```javascript
updateBalanceDisplay() {
    const balanceElement = document.getElementById('wallet-balance');
    const btcBalance = this.wallet.balance;
    const usdBalance = btcBalance * this.btcPrice;
    
    if (this.isBalanceVisible) {
        // Show actual balance
        balanceElement.innerHTML = `
            <div class="btc-balance">${btcBalance.toFixed(8)} BTC</div>
            <div class="usd-balance">$${usdBalance.toFixed(2)} USD</div>
        `;
    } else {
        // Show hidden balance
        balanceElement.innerHTML = `
            <div class="btc-balance">••••••• BTC</div>
            <div class="usd-balance">$•••••• USD</div>
        `;
    }
}

formatSensitiveData(data, isVisible) {
    if (isVisible) {
        return data;
    }
    
    // Different hiding strategies based on data type
    if (typeof data === 'number') {
        return '•••••';
    } else if (data.includes('bc1')) { // Bitcoin address
        return data.substring(0, 6) + '...';
    } else {
        return '••••••••';
    }
}
```

### CSS Styles

```css
.visibility-toggle {
    font-size: 16px;
    padding: 8px 12px;
}

.privacy-toggle {
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.privacy-toggle:hover {
    opacity: 1;
}

/* Hidden data styles */
.hidden-data {
    filter: blur(5px);
    user-select: none;
    pointer-events: none;
}

.hidden-data::selection {
    background: transparent;
}

/* Alternative hiding method */
.sensitive-data.masked {
    font-family: 'Password', monospace;
    letter-spacing: 2px;
}

/* Smooth transition */
.sensitive-data {
    transition: filter 0.3s ease;
}
```

### Privacy Scope

Elements affected by privacy mode:
1. **Balance Display**
   - BTC amount
   - USD equivalent
   - Unconfirmed balance

2. **Addresses**
   - Receiving addresses
   - Transaction addresses
   - QR codes (blurred)

3. **Transaction Details**
   - Transaction amounts
   - Fee information
   - Total values

4. **Account Information**
   - Account balances
   - Total portfolio value

### Advanced Privacy Features

```javascript
// Screenshot prevention (mobile)
preventScreenshots() {
    if (this.privacyMode && window.isSecureContext) {
        // iOS
        window.addEventListener('screenshot', this.onScreenshot);
        
        // Android - set secure flag via plugin
        if (window.plugins?.preventScreenshot) {
            window.plugins.preventScreenshot.enable();
        }
    }
}

// Clipboard protection
protectClipboard() {
    if (this.privacyMode) {
        document.addEventListener('copy', (e) => {
            if (e.target.classList.contains('sensitive-data')) {
                e.preventDefault();
                this.showToast('Copying disabled in privacy mode', 'warning');
            }
        });
    }
}
```

### Auto-Privacy Features

```javascript
// Enable privacy mode automatically
enableAutoPrivacy() {
    // On app minimize/background
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.autoPrivacyEnabled) {
            this.previousPrivacyState = this.privacyMode;
            this.togglePrivacyMode(true);
        } else if (!document.hidden && this.previousPrivacyState !== undefined) {
            this.togglePrivacyMode(this.previousPrivacyState);
        }
    });
    
    // In public places (based on network)
    if (this.isPublicNetwork()) {
        this.suggestPrivacyMode();
    }
}
```

### Mobile Optimizations
- Larger touch target
- Haptic feedback on toggle
- Quick toggle gesture (3D touch)
- Status bar indicator

### Accessibility
- Clear state announcements
- Keyboard shortcut: `Ctrl+Shift+P`
- Screen reader friendly
- High contrast icons

### Related Components
- Balance Display
- Address Display
- Transaction List
- Settings Privacy Section
- Auto-Privacy Timer