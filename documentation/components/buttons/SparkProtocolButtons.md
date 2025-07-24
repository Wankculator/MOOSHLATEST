# Spark Protocol Buttons

## Overview
A collection of buttons specific to Spark Protocol (Layer 2 Bitcoin) functionality, including wallet creation, channel management, and Lightning operations.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 6370-6408, 6605-6630, 6840-6863

## 1. Create Spark Wallet Button

### Visual Specifications
- **Class**: `spark-action-btn primary`
- **Background**: Linear gradient `#FFD700` to `#f57315`
- **Text Color**: Black (`#000000`)
- **Padding**: 16px 32px
- **Font Weight**: 600
- **Border Radius**: 8px

### Implementation
```javascript
ElementFactory.button({
    className: 'spark-action-btn primary',
    style: {
        background: 'linear-gradient(90deg, #FFD700 0%, #f57315 100%)',
        color: '#000000',
        padding: '16px 32px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.3s ease'
    },
    onclick: () => this.createNewSparkWallet()
}, ['Create Spark Wallet'])
```

### Click Handler
```javascript
async createNewSparkWallet() {
    try {
        this.showLoading('Creating Spark wallet...');
        
        // Generate Spark-compatible wallet
        const sparkWallet = await this.app.apiService.request('/api/spark/generate-wallet', {
            method: 'POST',
            body: JSON.stringify({ strength: 256 })
        });
        
        // Initialize Spark features
        await this.initializeSparkFeatures(sparkWallet);
        
        // Update UI
        this.hideLoading();
        this.showSuccess('Spark wallet created successfully!');
        
    } catch (error) {
        this.hideLoading();
        this.showError('Failed to create Spark wallet');
    }
}
```

## 2. Refresh Spark Data Button

### Visual Specifications
- **Class**: `spark-action-btn secondary`
- **Background**: Transparent
- **Border**: 2px solid white
- **Text Color**: White
- **Hover**: White background, black text

### Implementation
```javascript
ElementFactory.button({
    className: 'spark-action-btn secondary',
    style: {
        background: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    onclick: () => this.refreshSparkData()
}, ['Refresh Data'])
```

## 3. Create Deposit Button

### Visual Specifications
- **Background**: `rgba(255, 215, 0, 0.2)`
- **Border**: 2px solid `#FFD700`
- **Text Color**: `#FFD700`
- **Flex**: 1 (grows to fill space)

### Implementation
```javascript
ElementFactory.button({
    style: {
        flex: '1',
        padding: '12px',
        background: 'rgba(255, 215, 0, 0.2)',
        border: '2px solid #FFD700',
        color: '#FFD700',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    onclick: () => this.processSparkDeposit()
}, ['Create Deposit'])
```

### Deposit Handler
```javascript
async processSparkDeposit() {
    const amount = document.getElementById('sparkDepositAmount').value;
    
    if (!amount || parseFloat(amount) <= 0) {
        this.showError('Please enter a valid amount');
        return;
    }
    
    try {
        // Create Lightning invoice
        const invoice = await this.createLightningInvoice(amount);
        
        // Show payment instructions
        this.showDepositInstructions(invoice);
        
        // Monitor for payment
        this.monitorDeposit(invoice.paymentHash);
        
    } catch (error) {
        this.showError('Failed to create deposit');
    }
}
```

## 4. Open Lightning Channel Button

### Visual Specifications
- **Class**: `spark-feature-btn`
- **Background**: `rgba(255, 215, 0, 0.1)`
- **Border**: 1px solid `#FFD700`
- **Hover Effect**: Glow animation

### Implementation
```javascript
createFeatureButton(text, handler) {
    return ElementFactory.button({
        style: {
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid #FFD700',
            color: '#FFD700',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            fontWeight: '500'
        },
        onclick: handler,
        onmouseover: function() {
            this.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
            this.style.transform = 'translateY(-2px)';
        },
        onmouseout: function() {
            this.style.boxShadow = 'none';
            this.style.transform = 'translateY(0)';
        }
    }, [text]);
}
```

## 5. Spark Terminal Toggle Button

### Visual Specifications
- **Class**: `spark-toggle`
- **Position**: Top-right of Spark terminal
- **Background**: Transparent
- **Text**: "Toggle"

### Implementation
```javascript
$.button({
    className: 'spark-toggle',
    onclick: () => this.toggleSparkTerminal()
}, ['Toggle'])
```

### Toggle Handler
```javascript
toggleSparkTerminal() {
    const terminal = document.querySelector('.spark-terminal');
    const isVisible = terminal.style.display !== 'none';
    
    if (isVisible) {
        // Collapse terminal
        terminal.style.height = '0';
        setTimeout(() => {
            terminal.style.display = 'none';
        }, 300);
    } else {
        // Expand terminal
        terminal.style.display = 'block';
        setTimeout(() => {
            terminal.style.height = 'auto';
        }, 10);
    }
    
    // Save preference
    localStorage.setItem('spark_terminal_visible', !isVisible);
}
```

## Common Spark Button Features

### Loading States
```javascript
// Disable button and show spinner
button.disabled = true;
button.innerHTML = '<span class="spinner"></span> Processing...';

// Restore after operation
button.disabled = false;
button.innerHTML = originalText;
```

### Error Handling
```javascript
// Spark-specific error messages
const sparkErrors = {
    'CHANNEL_CLOSED': 'Lightning channel is closed',
    'INSUFFICIENT_CAPACITY': 'Not enough channel capacity',
    'ROUTING_FAILED': 'Payment routing failed',
    'INVOICE_EXPIRED': 'Invoice has expired'
};
```

### Animation Classes
```css
.spark-action-btn {
    animation: spark-glow 2s ease-in-out infinite;
}

@keyframes spark-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
}

.spark-pulse {
    animation: pulse 1s ease-in-out infinite;
}
```

### Mobile Optimizations
- Larger touch targets for channel operations
- Simplified UI on small screens
- Touch feedback animations
- Gesture support for terminal

### Related Components
- Spark Terminal
- Channel List
- Invoice Display
- Payment History
- Node Information