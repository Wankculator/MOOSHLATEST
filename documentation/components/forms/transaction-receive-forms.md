# Transaction Receive Forms Documentation

## Overview
Transaction receive forms handle Bitcoin address generation, amount requests, and QR code generation for receiving payments in MOOSH Wallet.

## 1. Receive Amount Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10157-10160
- **Component**: ReceivePanel

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'receive-amount',
    className: 'form-input amount-input',
    placeholder: '0.00000000',
    inputMode: 'decimal',
    pattern: '[0-9]*\.?[0-9]*',
    oninput: (e) => this.handleReceiveAmountInput(e),
    onblur: (e) => this.formatReceiveAmount(e),
    style: {
        fontSize: '18px',
        textAlign: 'right',
        fontFamily: 'JetBrains Mono, monospace'
    }
})
```

### Amount Handling
```javascript
handleReceiveAmountInput(event) {
    let value = event.target.value;
    
    // Only allow numbers and decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Handle decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 8 decimal places
    if (parts[1] && parts[1].length > 8) {
        value = parts[0] + '.' + parts[1].slice(0, 8);
    }
    
    event.target.value = value;
    
    // Update QR code with amount
    if (value && parseFloat(value) > 0) {
        this.updateQRCodeWithAmount(value);
    } else {
        this.updateQRCodeWithoutAmount();
    }
    
    // Update fiat equivalent
    this.updateReceiveFiatAmount(value);
}
```

---

## 2. Receive Address Display

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10135-10138
- **Component**: ReceivePanel

### Implementation
```javascript
$.input({
    type: 'text',
    className: 'address-input form-input',
    value: walletAddress,
    readOnly: true,
    onclick: (e) => e.target.select(),
    style: {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'all'
    }
})
```

### Address Type Selector
```javascript
$.select({
    id: 'address-type',
    className: 'address-type-selector',
    value: this.selectedAddressType,
    onchange: (e) => this.changeAddressType(e.target.value),
    children: [
        $.option({ value: 'segwit' }, 'SegWit (bc1q...)'),
        $.option({ value: 'legacy' }, 'Legacy (1...)'),
        $.option({ value: 'taproot' }, 'Taproot (bc1p...)'),
        $.option({ value: 'nested' }, 'Nested SegWit (3...)')
    ]
})
```

### Address Generation
```javascript
generateNewAddress(type = 'segwit') {
    const account = this.getCurrentAccount();
    
    // Get next unused address index
    const addressIndex = this.getNextAddressIndex(account.id, type);
    
    // Derive new address
    const address = this.deriveAddress(
        account.xpub,
        type,
        0, // external chain
        addressIndex
    );
    
    // Store address metadata
    this.storeAddressMetadata({
        address,
        accountId: account.id,
        type,
        index: addressIndex,
        created: Date.now(),
        used: false
    });
    
    return address;
}
```

---

## 3. Payment Request Description

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: PaymentRequestForm

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'payment-description',
    className: 'form-input',
    placeholder: 'What is this payment for? (optional)',
    maxlength: '100',
    oninput: (e) => this.updatePaymentLabel(e.target.value),
    style: {
        width: '100%',
        marginBottom: '16px'
    }
})
```

### Label Storage
```javascript
updatePaymentLabel(label) {
    this.currentPaymentRequest.label = label.trim();
    
    // Update BIP21 URI
    if (label) {
        this.updateBIP21URI({
            ...this.currentPaymentRequest,
            label: encodeURIComponent(label)
        });
    }
    
    // Store with address
    if (this.currentAddress) {
        this.addressLabels[this.currentAddress] = label;
        this.saveAddressLabels();
    }
}
```

---

## 4. BIP21 URI Builder

### Implementation
```javascript
buildBIP21URI(address, options = {}) {
    let uri = `bitcoin:${address}`;
    const params = [];
    
    // Add amount if specified
    if (options.amount && options.amount > 0) {
        params.push(`amount=${options.amount}`);
    }
    
    // Add label if specified
    if (options.label) {
        params.push(`label=${encodeURIComponent(options.label)}`);
    }
    
    // Add message if specified
    if (options.message) {
        params.push(`message=${encodeURIComponent(options.message)}`);
    }
    
    // Add Lightning invoice if available
    if (options.lightning) {
        params.push(`lightning=${options.lightning}`);
    }
    
    // Append parameters
    if (params.length > 0) {
        uri += '?' + params.join('&');
    }
    
    return uri;
}
```

---

## 5. QR Code Display

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: QRCodeDisplay

### Implementation
```javascript
// QR Code container
$.div({
    id: 'qr-code-container',
    className: 'qr-code-display',
    style: {
        width: '256px',
        height: '256px',
        margin: '0 auto',
        padding: '16px',
        background: '#ffffff',
        borderRadius: '8px'
    }
})

// Generate QR Code
generateQRCode(data) {
    const container = document.getElementById('qr-code-container');
    container.innerHTML = ''; // Clear existing
    
    new QRCode(container, {
        text: data,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M, // Medium error correction
        quiet: 2 // Border size
    });
    
    // Add logo overlay (optional)
    this.addQRLogo(container);
}
```

### QR Code Options
```javascript
$.div({ className: 'qr-options' }, [
    $.button({
        onclick: () => this.downloadQRCode(),
        children: ['Download QR']
    }),
    $.button({
        onclick: () => this.shareQRCode(),
        children: ['Share']
    }),
    $.button({
        onclick: () => this.printQRCode(),
        children: ['Print']
    })
])
```

---

## 6. Address Reuse Warning

### Implementation
```javascript
// Check for address reuse
checkAddressReuse(address) {
    const metadata = this.getAddressMetadata(address);
    
    if (metadata && metadata.used) {
        return $.div({
            className: 'address-reuse-warning',
            children: [
                $.i({ className: 'icon-warning' }),
                $.span({}, 'This address has been used before. '),
                $.a({
                    href: '#',
                    onclick: (e) => {
                        e.preventDefault();
                        this.generateNewAddress();
                    }
                }, 'Generate new address'),
                $.span({}, ' for better privacy.')
            ]
        });
    }
    
    return null;
}
```

---

## 7. Payment History

### Implementation
```javascript
// Recent payments to this address
$.div({ className: 'payment-history' }, [
    $.h4({}, 'Recent Payments'),
    $.div({ className: 'payments-list' }, 
        this.getRecentPayments(address).map(payment => 
            $.div({ className: 'payment-item' }, [
                $.span({ className: 'amount' }, 
                    `${payment.amount} BTC`
                ),
                $.span({ className: 'date' }, 
                    new Date(payment.timestamp).toLocaleDateString()
                ),
                $.span({ className: 'confirmations' }, 
                    `${payment.confirmations} confirmations`
                )
            ])
        )
    )
])
```

---

## Common Patterns

### 1. Copy Address Functionality
```javascript
copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        // Visual feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
        
        // Track usage
        this.trackAddressCopy(address);
    }).catch(err => {
        // Fallback method
        this.fallbackCopy(address);
    });
}
```

### 2. Share Functionality
```javascript
async sharePaymentRequest() {
    const shareData = {
        title: 'Bitcoin Payment Request',
        text: `Send ${this.requestAmount || 'any amount'} BTC to ${this.currentAddress}`,
        url: this.buildBIP21URI(this.currentAddress, {
            amount: this.requestAmount,
            label: this.paymentLabel
        })
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback to copy
            this.copyToClipboard(shareData.url);
            this.showNotification('Payment link copied!');
        }
    } catch (err) {
        console.error('Share failed:', err);
    }
}
```

### 3. Address Monitoring
```javascript
monitorAddress(address) {
    // Set up WebSocket or polling
    this.addressMonitor = setInterval(async () => {
        const transactions = await this.checkAddressTransactions(address);
        
        if (transactions.length > this.lastKnownTxCount) {
            // New transaction detected
            const newTx = transactions[0];
            this.onPaymentReceived(newTx);
            
            // Mark address as used
            this.markAddressAsUsed(address);
            
            // Generate new address for next payment
            this.generateNewAddress();
        }
        
        this.lastKnownTxCount = transactions.length;
    }, 10000); // Check every 10 seconds
}
```

## Mobile Considerations

### QR Code Display
```css
@media (max-width: 768px) {
    .qr-code-display {
        width: calc(100vw - 64px);
        max-width: 256px;
        height: auto;
        aspect-ratio: 1;
    }
}
```

### Touch Interactions
- Tap address to select all
- Long press to copy
- Pinch to zoom QR code
- Swipe for address history

## Security Considerations

### Address Validation
- Always validate generated addresses
- Check derivation path correctness
- Verify address belongs to wallet
- Monitor for address substitution attacks

### Privacy
- Encourage new address for each payment
- Warn about address reuse
- Don't log full addresses
- Clear clipboard after timeout

## Testing Checklist

- [ ] Amount input validation
- [ ] Address type switching
- [ ] QR code generation
- [ ] BIP21 URI format
- [ ] Copy functionality
- [ ] Share functionality
- [ ] Address reuse detection
- [ ] Payment monitoring
- [ ] Mobile QR display
- [ ] Accessibility compliance