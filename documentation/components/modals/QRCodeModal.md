# QRCodeModal Component Documentation

## Overview
The QR Code functionality in MOOSH Wallet is currently embedded within the Receive modal rather than being a standalone modal. It generates QR codes for Bitcoin addresses to facilitate easy sharing and receiving of funds. The implementation includes a custom QR pattern generator using HTML5 Canvas.

## Component Location
- **QR Code Generation**: Lines 10693-10785
- **Integration**: Within ReceiveModal (showReceiveModal method)
- **Canvas Implementation**: Custom QR-like pattern generator

## Visual Design

### ASCII Layout (Within Receive Modal)
```
┌─────────────────────────────────────────────────────────┐
│              Receive Bitcoin                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │     ╔═══╗ ▪ ▪ ▪ ▪ ▪ ╔═══╗                    │   │
│  │     ║   ║ ▪ ▪ ▪ ▪ ▪ ║   ║                    │   │
│  │     ╚═══╝ ▪ ▪ ▪ ▪ ▪ ╚═══╝                    │   │
│  │     ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪                      │   │
│  │     ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪                      │   │
│  │     ╔═══╗ ▪ ▪ ▪ ▪ ▪ ╔═══╗                    │   │
│  │     ║   ║ ▪ ▪ ▪ ▪ ▪ ║   ║                    │   │
│  │     ╚═══╝ ▪ ▪ ▪ ▪ ▪ ╚═══╝                    │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│         Scan with any Bitcoin wallet                    │
│                                                         │
│  Your Address:                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│               [ Copy Address ]                          │
└─────────────────────────────────────────────────────────┘
```

### Specifications
- **QR Size**: 200px × 200px
- **Border**: 2px solid var(--text-primary)
- **Background**: White (#ffffff)
- **Padding**: 10px (scaled)
- **Module Size**: 8px squares

## Implementation

### createQRCode(data) Method
**Location**: Lines 10693-10730

```javascript
createQRCode(data) {
    const $ = window.ElementFactory || ElementFactory;
    const size = 200; // QR code size
    
    // Create canvas for QR code
    const canvas = $.create('canvas', {
        width: size,
        height: size,
        style: {
            width: `calc(${size}px * var(--scale-factor))`,
            height: `calc(${size}px * var(--scale-factor))`,
            border: '2px solid var(--text-primary)',
            borderRadius: '0',
            padding: 'calc(10px * var(--scale-factor))',
            background: 'white'
        }
    });
    
    // Generate QR code pattern
    const ctx = canvas.getContext('2d');
    if (ctx) {
        this.drawQRPattern(ctx, data, size);
    }
    
    return $.div({ className: 'qr-code-container' }, [
        canvas,
        $.div({ className: 'qr-label' }, ['Scan with any Bitcoin wallet'])
    ]);
}
```

### drawQRPattern(ctx, data, size) Method
**Location**: Lines 10732-10769

```javascript
drawQRPattern(ctx, data, size) {
    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Generate pattern based on data hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash = hash & hash;
    }
    
    // Draw modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            const shouldFill = ((hash + row * modules + col) % 3) !== 0;
            if (shouldFill) {
                ctx.fillRect(
                    col * moduleSize + moduleSize/4,
                    row * moduleSize + moduleSize/4,
                    moduleSize - moduleSize/2,
                    moduleSize - moduleSize/2
                );
            }
        }
    }
    
    // Add corner markers
    this.drawCornerMarker(ctx, 0, 0, moduleSize * 3);
    this.drawCornerMarker(ctx, size - moduleSize * 3, 0, moduleSize * 3);
    this.drawCornerMarker(ctx, 0, size - moduleSize * 3, moduleSize * 3);
}
```

### drawCornerMarker(ctx, x, y, size) Method
**Location**: Lines 10771-10785

```javascript
drawCornerMarker(ctx, x, y, size) {
    // Outer square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, size, size);
    
    // Inner white square
    ctx.fillStyle = '#ffffff';
    const padding = size / 7;
    ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
    
    // Center black square
    ctx.fillStyle = '#000000';
    const innerPadding = size / 3.5;
    ctx.fillRect(x + innerPadding, y + innerPadding, size - innerPadding * 2, size - innerPadding * 2);
}
```

## QR Code Components

### Canvas Element
- **Size**: 200px × 200px (actual)
- **Display Size**: Scaled with var(--scale-factor)
- **Border**: Theme-colored 2px border
- **Background**: Pure white for contrast

### Pattern Generation
1. **Module Grid**: 25×25 modules (8px each)
2. **Hash Algorithm**: Simple hash from address data
3. **Fill Pattern**: Deterministic based on hash
4. **Corner Markers**: Three positioning squares

### Corner Markers
Standard QR code positioning markers:
- **Outer Square**: Black fill
- **Middle Ring**: White fill
- **Inner Square**: Black fill
- **Size**: 3×3 modules (24px)

## Integration Usage

### Within Receive Modal
```javascript
showReceiveModal() {
    const overlay = $.div({ 
        className: 'modal-overlay',
        // ... modal setup
    }, [
        $.div({ className: 'modal-content' }, [
            // QR Code section
            $.div({ className: 'qr-section' }, [
                this.createQRCode(walletAddress)
            ]),
            // Address display and copy button
        ])
    ]);
}
```

### Standalone Usage (Future)
```javascript
showQRCode() {
    // Currently shows notification
    this.app.showNotification('QR code modal coming soon', 'info');
}
```

## Styling

### Container Styles
```css
.qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qr-code-container canvas {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### Label Styles
```javascript
style: {
    marginTop: 'calc(12px * var(--scale-factor))',
    fontSize: 'calc(12px * var(--scale-factor))',
    color: 'var(--text-dim)',
    textAlign: 'center'
}
```

## Current Limitations

1. **Simplified Pattern**: Not a true QR code encoder
2. **No Error Correction**: Basic pattern only
3. **Fixed Size**: 200px not configurable
4. **No Logo Support**: Plain QR only
5. **Limited Data Types**: Designed for addresses

## Future Enhancements

### True QR Code Library
```javascript
// Future implementation with proper QR library
async generateQRCode(text) {
    // Use QRCode.js or similar library
    const qr = new QRCode({
        text: text,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    return qr.makeImage();
}
```

### Standalone Modal
```javascript
class QRCodeModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
    }
    
    show(data, options = {}) {
        // Create dedicated QR modal
        // Support multiple data types
        // Add sharing options
    }
}
```

### Additional Features
1. **Multiple Formats**: Address, Lightning invoice, contact info
2. **Size Options**: Small, medium, large
3. **Download QR**: Save as image file
4. **Share QR**: Direct sharing options
5. **Custom Styling**: Colors, logo, frames

## Security Considerations

1. **Data Validation**: Ensure valid Bitcoin address
2. **Canvas Security**: No external resources
3. **CORS Compliance**: Local generation only
4. **No Network Calls**: Pure client-side

## Mobile Responsiveness

- Canvas scales with --scale-factor
- Touch-friendly size
- Clear visibility on small screens
- Adequate padding for scanning

## Best Practices

1. **Validate data** before generating QR
2. **Provide context** (what the QR represents)
3. **Include text fallback** (address display)
4. **Test scanning** with multiple apps
5. **Maintain contrast** for reliable scanning
6. **Consider size** for different screen sizes

## Integration Examples

### Lightning Invoice QR
```javascript
// In SparkLightningManager
async generateQRCode(text) {
    return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${text}</svg>`)}`;
}
```

### Address Book QR
```javascript
// Future address book implementation
showContactQR(contact) {
    const qrData = `bitcoin:${contact.address}?label=${contact.name}`;
    const qrModal = new QRCodeModal(this.app);
    qrModal.show(qrData);
}
```