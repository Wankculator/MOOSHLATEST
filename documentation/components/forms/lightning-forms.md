# Lightning Forms Documentation

## Overview
Lightning forms handle Lightning Network invoice creation, payment processing, and channel management in MOOSH Wallet's Spark Protocol integration.

## 1. Lightning Invoice Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 26194-26197
- **Component**: LightningSendModal

### Implementation
```javascript
$.textarea({
    id: 'lightningInvoice',
    placeholder: 'lnbc10u1pjk8w...',
    className: 'lightning-invoice-input',
    style: {
        width: '100%',
        height: '80px',
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: '0',
        color: '#ffffff',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        padding: '12px',
        resize: 'vertical'
    },
    autocomplete: 'off',
    spellcheck: false,
    oninput: (e) => this.validateInvoice(e.target.value),
    onpaste: (e) => this.handleInvoicePaste(e)
})
```

### Invoice Validation
```javascript
validateInvoice(invoice) {
    // Remove whitespace and convert to lowercase
    invoice = invoice.trim().toLowerCase();
    
    // Check prefix
    if (!invoice.startsWith('lnbc')) {
        return { 
            valid: false, 
            error: 'Invalid invoice: must start with lnbc' 
        };
    }
    
    // Basic BOLT11 validation
    const parts = this.decodeBolt11(invoice);
    
    if (!parts) {
        return { 
            valid: false, 
            error: 'Invalid BOLT11 invoice format' 
        };
    }
    
    // Check expiry
    const expiry = parts.timestamp + (parts.expiry || 3600);
    if (expiry < Date.now() / 1000) {
        return { 
            valid: false, 
            error: 'Invoice has expired' 
        };
    }
    
    return { 
        valid: true, 
        amount: parts.amount,
        description: parts.description,
        paymentHash: parts.paymentHash,
        expiry: new Date(expiry * 1000)
    };
}
```

### Invoice Decoder
```javascript
decodeBolt11(invoice) {
    try {
        // Parse human-readable part
        const match = invoice.match(/^ln([a-z]+)(\d*)([munp]?)/);
        if (!match) return null;
        
        const [, network, amountStr, multiplier] = match;
        
        // Calculate amount in satoshis
        let amount = 0;
        if (amountStr) {
            const multipliers = {
                'm': 0.001,
                'u': 0.000001,
                'n': 0.000000001,
                'p': 0.000000000001
            };
            amount = parseInt(amountStr) * (multipliers[multiplier] || 1) * 100000000;
        }
        
        // Extract other fields (simplified)
        return {
            network,
            amount,
            timestamp: Date.now() / 1000,
            description: 'Lightning payment',
            paymentHash: this.extractPaymentHash(invoice)
        };
    } catch (error) {
        return null;
    }
}
```

---

## 2. Lightning Send Amount

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 26208-26211
- **Component**: LightningSendForm

### Implementation
```javascript
$.input({
    id: 'sendAmount',
    type: 'number',
    placeholder: '1000',
    min: '1',
    max: '10000000',
    step: '1',
    className: 'amount-input',
    disabled: this.invoiceHasAmount,
    oninput: (e) => this.updateSendAmount(e.target.value),
    style: {
        width: '100%',
        padding: '12px',
        background: '#000',
        border: '1px solid #333',
        color: '#fff',
        fontSize: '16px'
    }
})
```

### Amount Validation
```javascript
updateSendAmount(satoshis) {
    const amount = parseInt(satoshis);
    
    // Validate amount
    if (isNaN(amount) || amount < 1) {
        this.showError('Amount must be at least 1 satoshi');
        return;
    }
    
    if (amount > 10000000) { // 0.1 BTC limit
        this.showError('Maximum amount is 10,000,000 satoshis');
        return;
    }
    
    // Check channel capacity
    const available = this.getAvailableBalance();
    if (amount > available) {
        this.showError(`Insufficient balance. Available: ${available} sats`);
        return;
    }
    
    // Update display
    this.displayBTCEquivalent(amount);
    this.calculateRoutingFee(amount);
}
```

---

## 3. Lightning Receive Forms

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 26358-26376
- **Component**: LightningReceiveModal

### Implementation
```javascript
// Amount input
$.input({
    id: 'receiveAmount',
    type: 'number',
    placeholder: '100000',
    min: '1',
    max: '10000000',
    step: '1',
    className: 'amount-input',
    oninput: (e) => this.updateReceiveAmount(e.target.value)
})

// Description input
$.input({
    id: 'receiveDescription',
    type: 'text',
    placeholder: 'Payment for...',
    maxlength: '255',
    className: 'description-input',
    oninput: (e) => this.updateDescription(e.target.value)
})
```

### Invoice Generation
```javascript
async generateInvoice() {
    const amount = document.getElementById('receiveAmount').value;
    const description = document.getElementById('receiveDescription').value;
    
    // Validate inputs
    if (!amount || amount < 1) {
        this.showError('Please enter an amount');
        return;
    }
    
    try {
        const invoice = await this.app.sparkService.createInvoice({
            amount: parseInt(amount),
            description: description || 'Payment to MOOSH Wallet',
            expiry: 3600 // 1 hour
        });
        
        this.displayInvoice(invoice);
        this.startExpiryCountdown(3600);
        
    } catch (error) {
        this.showError('Failed to generate invoice: ' + error.message);
    }
}
```

---

## 4. Channel Management Forms

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: ChannelManagement

### Implementation
```javascript
// Open channel form
$.div({ className: 'channel-form' }, [
    $.input({
        id: 'node-pubkey',
        type: 'text',
        placeholder: 'Node public key (02...)',
        className: 'pubkey-input',
        pattern: '^0[23][0-9a-fA-F]{64}$',
        maxlength: '66',
        oninput: (e) => this.validatePubkey(e.target.value)
    }),
    
    $.input({
        id: 'channel-amount',
        type: 'number',
        placeholder: 'Channel size (sats)',
        min: '20000',
        max: '16777215',
        className: 'amount-input',
        oninput: (e) => this.validateChannelAmount(e.target.value)
    }),
    
    $.input({
        id: 'push-amount',
        type: 'number',
        placeholder: 'Push amount (optional)',
        min: '0',
        className: 'amount-input',
        oninput: (e) => this.validatePushAmount(e.target.value)
    })
])
```

### Pubkey Validation
```javascript
validatePubkey(pubkey) {
    // Remove whitespace
    pubkey = pubkey.trim();
    
    // Check format
    const regex = /^0[23][0-9a-fA-F]{64}$/;
    if (!regex.test(pubkey)) {
        return { 
            valid: false, 
            error: 'Invalid public key format' 
        };
    }
    
    // Verify it's a valid curve point (optional)
    try {
        const isValid = this.verifyPubkeyOnCurve(pubkey);
        if (!isValid) {
            return { 
                valid: false, 
                error: 'Invalid public key (not on curve)' 
            };
        }
    } catch (e) {
        // Skip curve validation if not available
    }
    
    return { valid: true, pubkey: pubkey.toLowerCase() };
}
```

---

## 5. Lightning Address Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: LightningAddress

### Implementation
```javascript
$.input({
    id: 'lightning-address',
    type: 'email',
    placeholder: 'user@domain.com',
    className: 'lightning-address-input',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    oninput: (e) => this.validateLightningAddress(e.target.value)
})
```

### Lightning Address Validation
```javascript
async validateLightningAddress(address) {
    // Basic email format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(address)) {
        return { 
            valid: false, 
            error: 'Invalid Lightning address format' 
        };
    }
    
    // Check if domain supports Lightning
    try {
        const [user, domain] = address.split('@');
        const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${user}`;
        
        const response = await fetch(lnurlpUrl);
        if (!response.ok) {
            return { 
                valid: false, 
                error: 'Lightning address not found' 
            };
        }
        
        const data = await response.json();
        return { 
            valid: true, 
            callback: data.callback,
            minSendable: data.minSendable,
            maxSendable: data.maxSendable
        };
        
    } catch (error) {
        return { 
            valid: false, 
            error: 'Cannot verify Lightning address' 
        };
    }
}
```

---

## Common Patterns

### 1. QR Code Generation
```javascript
generateQRCode(data, elementId) {
    const qr = new QRCode(document.getElementById(elementId), {
        text: data,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
    });
}
```

### 2. Copy to Clipboard
```javascript
copyInvoice(invoice) {
    navigator.clipboard.writeText(invoice).then(() => {
        this.showNotification('Invoice copied to clipboard');
        
        // Add visual feedback
        const button = event.target;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}
```

### 3. Invoice Status Monitoring
```javascript
monitorInvoiceStatus(paymentHash) {
    this.invoiceMonitor = setInterval(async () => {
        const status = await this.checkInvoiceStatus(paymentHash);
        
        if (status.paid) {
            clearInterval(this.invoiceMonitor);
            this.onPaymentReceived(status);
        } else if (status.expired) {
            clearInterval(this.invoiceMonitor);
            this.onInvoiceExpired();
        }
    }, 5000); // Check every 5 seconds
}
```

## Mobile Considerations

### Invoice Scanning
```javascript
// Camera permission and QR scanning
async scanInvoice() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        const scanner = new QRScanner(stream);
        scanner.onScan = (data) => {
            if (data.startsWith('lnbc')) {
                document.getElementById('lightningInvoice').value = data;
                this.validateInvoice(data);
            }
        };
    } catch (error) {
        this.showError('Camera access denied');
    }
}
```

### Touch Optimizations
- Large tap targets for QR scan button
- Numeric keyboard for amount inputs
- Auto-focus on paste events

## Security Considerations

### Invoice Verification
- Always validate payment hash
- Check invoice signature
- Verify amount matches request
- Confirm destination node

### Privacy
- Don't log full invoices
- Clear sensitive data after use
- Use Tor for invoice lookups when enabled

## Testing Checklist

- [ ] Invoice format validation
- [ ] Amount limits enforcement
- [ ] Expiry time checking
- [ ] QR code generation
- [ ] Copy functionality
- [ ] Channel size limits
- [ ] Pubkey validation
- [ ] Lightning address lookup
- [ ] Mobile QR scanning
- [ ] Error message clarity