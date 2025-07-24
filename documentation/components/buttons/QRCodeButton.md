# QR Code Button

## Overview
The QR Code Button displays a QR code for wallet addresses, payment requests, or other data. It's commonly used in the receive modal and for sharing wallet information.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Context**: Receive modal, address display sections
- **Usage**: Shows QR codes for easy scanning

### Visual Specifications
- **Class**: `btn-qr` or `qr-toggle`
- **Icon**: 📱 or QR symbol
- **Background**: Transparent
- **Border**: 1px solid `#666666`
- **Text**: "Show QR" / "Hide QR"
- **Size**: Varies by context

### Implementation

```javascript
renderQRButton() {
    return $.button({
        className: 'btn-qr',
        onclick: () => this.toggleQRCode(),
        title: 'Show QR Code'
    }, [
        $.span({ className: 'qr-icon' }, ['◳']), // QR icon
        $.span({ className: 'btn-text' }, ['QR Code'])
    ]);
}
```

### QR Code Generation

```javascript
async toggleQRCode() {
    const qrContainer = document.getElementById('qr-container');
    
    if (qrContainer.style.display === 'none') {
        // Generate and show QR code
        await this.showQRCode();
    } else {
        // Hide QR code
        this.hideQRCode();
    }
}

async showQRCode() {
    const address = this.currentAddress;
    const amount = document.getElementById('receiveAmount')?.value;
    
    // Build Bitcoin URI
    let uri = `bitcoin:${address}`;
    if (amount) {
        uri += `?amount=${amount}`;
    }
    
    // Generate QR code
    const qrCode = await this.generateQRCode(uri);
    
    // Display QR code
    const container = document.getElementById('qr-container');
    container.innerHTML = '';
    container.appendChild(qrCode);
    container.style.display = 'block';
    
    // Update button text
    const button = event.currentTarget;
    button.querySelector('.btn-text').textContent = 'Hide QR';
}
```

### QR Code Generator

```javascript
async generateQRCode(data, options = {}) {
    const defaultOptions = {
        width: 256,
        height: 256,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    
    // Using QRCode.js library
    const qrContainer = document.createElement('div');
    new QRCode(qrContainer, {
        text: data,
        width: qrOptions.width,
        height: qrOptions.height,
        colorDark: qrOptions.color.dark,
        colorLight: qrOptions.color.light,
        correctLevel: QRCode.CorrectLevel[qrOptions.errorCorrectionLevel]
    });
    
    // Add styling
    qrContainer.style.padding = '20px';
    qrContainer.style.background = 'white';
    qrContainer.style.borderRadius = '8px';
    qrContainer.style.display = 'inline-block';
    
    return qrContainer;
}
```

### QR Code Display Modal

```javascript
showQRModal(data, title = 'QR Code') {
    const modal = $.div({ className: 'qr-modal modal-overlay' }, [
        $.div({ className: 'modal-content' }, [
            $.div({ className: 'modal-header' }, [
                $.h3({}, [title]),
                $.button({
                    className: 'modal-close',
                    onclick: () => modal.remove()
                }, ['×'])
            ]),
            
            $.div({ className: 'qr-display' }, [
                $.div({ id: 'qr-code-container' }),
                
                $.div({ className: 'qr-data' }, [
                    $.p({ className: 'qr-text' }, [data]),
                    $.button({
                        className: 'btn-copy',
                        onclick: () => this.copyToClipboard(data)
                    }, ['Copy'])
                ])
            ]),
            
            $.div({ className: 'qr-actions' }, [
                $.button({
                    className: 'btn-secondary',
                    onclick: () => this.downloadQR()
                }, ['Download QR']),
                $.button({
                    className: 'btn-secondary',
                    onclick: () => this.shareQR()
                }, ['Share'])
            ])
        ])
    ]);
    
    document.body.appendChild(modal);
    this.generateQRCode(data, { width: 300, height: 300 })
        .then(qr => {
            document.getElementById('qr-code-container').appendChild(qr);
        });
}
```

### Download QR Code

```javascript
downloadQR() {
    const canvas = document.querySelector('#qr-code-container canvas');
    if (!canvas) return;
    
    // Convert to blob
    canvas.toBlob((blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `moosh-wallet-qr-${Date.now()}.png`;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
    });
}
```

### Payment Request QR

```javascript
generatePaymentQR(amount, label, message) {
    // BIP21 Bitcoin URI format
    const params = new URLSearchParams();
    
    if (amount) params.append('amount', amount);
    if (label) params.append('label', label);
    if (message) params.append('message', message);
    
    const uri = `bitcoin:${this.currentAddress}?${params.toString()}`;
    
    return this.generateQRCode(uri, {
        width: 300,
        height: 300,
        errorCorrectionLevel: 'H' // High for payment data
    });
}
```

### Lightning Invoice QR

```javascript
generateLightningQR(invoice) {
    // BOLT11 invoice format
    const uri = `lightning:${invoice}`;
    
    return this.generateQRCode(uri, {
        color: {
            dark: '#f57315', // Orange for Lightning
            light: '#ffffff'
        }
    });
}
```

### CSS Styles

```css
.btn-qr {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #666666;
    color: #999999;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-qr:hover {
    border-color: #f57315;
    color: #f57315;
}

.qr-icon {
    font-size: 18px;
}

.qr-container {
    text-align: center;
    margin: 20px 0;
    animation: fadeIn 0.3s ease;
}

.qr-display {
    background: white;
    padding: 20px;
    border-radius: 8px;
    display: inline-block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}
```

### Mobile Optimizations
- Responsive QR size
- Touch-to-zoom functionality
- Native share sheet integration
- Save to photos option

### Security Considerations
- No private keys in QR codes
- Address validation before encoding
- Warning for large amounts
- Privacy mode hides QR codes

### Accessibility
- Alt text for screen readers
- Keyboard navigation
- High contrast option
- Text alternative always visible

### Related Components
- QR Scanner (for sending)
- Address Display
- Copy Button
- Share Button
- Download Manager