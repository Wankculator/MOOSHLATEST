# Share Button

## Overview
The Share Button enables users to share wallet addresses, payment requests, or transaction details through various channels. It integrates with native share APIs and provides fallback options.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10173-10179 (Share section in receive modal)
- **Context**: Receive modal, transaction details, QR displays

### Visual Specifications
- **Class**: `share-btn`
- **Icon**: Share symbol or platform-specific icon
- **Background**: Platform-themed or transparent
- **Layout**: Horizontal button group
- **Text**: "Email", "Message", "Link", etc.

### Implementation

```javascript
renderShareSection() {
    return $.div({ className: 'share-section' }, [
        $.div({ className: 'share-title' }, ['Share via']),
        $.div({ className: 'share-buttons' }, [
            $.button({ 
                className: 'share-btn',
                onclick: () => this.shareVia('email')
            }, ['Email']),
            $.button({ 
                className: 'share-btn',
                onclick: () => this.shareVia('message')
            }, ['Message']),
            $.button({ 
                className: 'share-btn',
                onclick: () => this.shareVia('link')
            }, ['Link'])
        ])
    ]);
}
```

### Native Share API Implementation

```javascript
async shareAddress(address, amount = null) {
    // Build share data
    const shareData = {
        title: 'MOOSH Wallet Address',
        text: amount ? 
            `Send ${amount} BTC to: ${address}` : 
            `My Bitcoin address: ${address}`,
        url: `bitcoin:${address}${amount ? `?amount=${amount}` : ''}`
    };
    
    // Check if native share is available
    if (navigator.share && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            this.logEvent('SHARE_NATIVE', { method: 'native' });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                this.showFallbackShare(shareData);
            }
        }
    } else {
        // Use fallback share methods
        this.showFallbackShare(shareData);
    }
}
```

### Share Methods

```javascript
shareVia(method) {
    const address = this.currentAddress;
    const amount = document.getElementById('receiveAmount')?.value;
    
    switch(method) {
        case 'email':
            this.shareViaEmail(address, amount);
            break;
        case 'message':
            this.shareViaMessage(address, amount);
            break;
        case 'link':
            this.copyShareLink(address, amount);
            break;
        case 'qr':
            this.shareQRCode(address, amount);
            break;
        default:
            this.shareAddress(address, amount);
    }
}

shareViaEmail(address, amount) {
    const subject = 'Bitcoin Payment Request';
    const body = amount ? 
        `Please send ${amount} BTC to:\n\n${address}\n\nBitcoin URI: bitcoin:${address}?amount=${amount}` :
        `My Bitcoin address:\n\n${address}\n\nBitcoin URI: bitcoin:${address}`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    this.logEvent('SHARE_EMAIL');
}

shareViaMessage(address, amount) {
    const message = amount ?
        `Send ${amount} BTC to: ${address}` :
        `Bitcoin address: ${address}`;
    
    // Try SMS first, then fallback to copy
    if (this.isMobile()) {
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    } else {
        this.copyToClipboard(message);
        this.showToast('Address copied - paste in your message app', 'success');
    }
    
    this.logEvent('SHARE_MESSAGE');
}
```

### Copy Share Link

```javascript
async copyShareLink(address, amount) {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    params.append('address', address);
    if (amount) params.append('amount', amount);
    
    const shareUrl = `${baseUrl}/pay?${params.toString()}`;
    
    try {
        await navigator.clipboard.writeText(shareUrl);
        this.showToast('Payment link copied!', 'success');
        this.logEvent('SHARE_LINK_COPIED');
    } catch (error) {
        this.fallbackCopy(shareUrl);
    }
}
```

### QR Code Sharing

```javascript
async shareQRCode(address, amount) {
    // Generate QR code as image
    const qrCanvas = await this.generateQRCanvas(address, amount);
    
    // Convert to blob
    qrCanvas.toBlob(async (blob) => {
        const file = new File([blob], 'bitcoin-qr.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Bitcoin Payment QR',
                    text: `Bitcoin address: ${address}`
                });
            } catch (error) {
                // Fallback to download
                this.downloadQRCode(blob);
            }
        } else {
            this.downloadQRCode(blob);
        }
    });
}
```

### Platform-Specific Share

```javascript
showFallbackShare(shareData) {
    const modal = $.div({ className: 'share-modal' }, [
        $.h3({}, ['Share']),
        
        $.div({ className: 'share-options' }, [
            // Social platforms
            this.createShareButton('WhatsApp', () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`);
            }, 'whatsapp'),
            
            this.createShareButton('Telegram', () => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`);
            }, 'telegram'),
            
            this.createShareButton('Twitter', () => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}`);
            }, 'twitter'),
            
            // Copy option
            this.createShareButton('Copy', () => {
                this.copyToClipboard(shareData.text);
                modal.remove();
            }, 'copy')
        ]),
        
        $.button({
            className: 'btn-cancel',
            onclick: () => modal.remove()
        }, ['Cancel'])
    ]);
    
    document.body.appendChild(modal);
}

createShareButton(platform, handler, icon) {
    return $.button({
        className: `share-platform-btn ${platform.toLowerCase()}`,
        onclick: handler
    }, [
        $.span({ className: `share-icon ${icon}` }),
        $.span({}, [platform])
    ]);
}
```

### CSS Styles

```css
.share-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
}

.share-title {
    color: var(--text-secondary);
    font-size: 12px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.share-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.share-btn {
    flex: 1;
    min-width: 80px;
    padding: 10px 16px;
    background: transparent;
    border: 1px solid #333333;
    color: #999999;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 6px;
}

.share-btn:hover {
    border-color: #f57315;
    color: #f57315;
    background: rgba(245, 115, 21, 0.1);
}

/* Platform-specific styles */
.share-platform-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    margin: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.share-platform-btn.whatsapp {
    background: #25D366;
    color: white;
}

.share-platform-btn.telegram {
    background: #0088cc;
    color: white;
}

.share-platform-btn.twitter {
    background: #1DA1F2;
    color: white;
}

/* Mobile optimizations */
@media (max-width: 480px) {
    .share-buttons {
        flex-direction: column;
    }
    
    .share-btn {
        width: 100%;
    }
}
```

### Mobile Detection

```javascript
isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Platform-specific sharing
shareOnMobile(data) {
    if (this.isIOS()) {
        // iOS specific share sheet
        window.webkit?.messageHandlers?.share?.postMessage(data);
    } else if (this.isAndroid()) {
        // Android intent
        window.Android?.share(JSON.stringify(data));
    }
}
```

### Analytics

```javascript
logShareEvent(method, success = true) {
    this.analytics.track('share_action', {
        method: method,
        success: success,
        platform: this.getPlatform(),
        has_amount: !!this.shareAmount
    });
}
```

### Related Components
- Native Share API
- Copy Button
- QR Code Generator
- Social Platform APIs
- Analytics Tracker