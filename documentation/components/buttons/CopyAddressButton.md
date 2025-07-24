# Copy Address Button

## Overview
The Copy Address Button provides one-click copying of Bitcoin addresses to the clipboard. It appears in the receive modal and anywhere addresses are displayed.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10142-10146 (within showReceiveModal)

### Visual Specifications
- **Class**: `copy-btn`
- **Background**: Transparent initially
- **Border**: 1px solid `#333333`
- **Text Color**: `#999999`
- **Font Size**: 12px
- **Padding**: 4px 8px
- **Border Radius**: 4px
- **Cursor**: Pointer
- **Position**: Absolute or inline-flex

### Hover State
- **Background**: `rgba(245, 115, 21, 0.1)`
- **Border Color**: `#f57315`
- **Text Color**: `#f57315`

### Implementation

```javascript
$.button({
    className: 'copy-btn',
    onclick: () => this.copyAddress(walletAddress)
}, ['Copy'])
```

### CSS Styles
```css
.copy-btn {
    background: transparent;
    border: 1px solid #333333;
    color: #999999;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.copy-btn:hover {
    background: rgba(245, 115, 21, 0.1);
    border-color: #f57315;
    color: #f57315;
}

.copy-btn.copied {
    background: rgba(0, 255, 0, 0.1);
    border-color: #00ff00;
    color: #00ff00;
}
```

### Click Handler
The `copyAddress()` function:
1. Uses Clipboard API to copy address
2. Shows success feedback
3. Temporarily changes button text to "Copied!"
4. Reverts after 2 seconds
5. Handles copy failures gracefully

### Implementation Details

```javascript
async copyAddress(address) {
    try {
        await navigator.clipboard.writeText(address);
        
        // Update button state
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        // Revert after 2 seconds
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
        
        // Show toast notification
        this.showToast('Address copied to clipboard', 'success');
    } catch (err) {
        // Fallback for older browsers
        this.fallbackCopy(address);
    }
}
```

### Browser Compatibility
- Modern browsers: Clipboard API
- Fallback: document.execCommand('copy')
- Mobile Safari: Special handling
- Secure context required (HTTPS)

### Accessibility Features
- ARIA label: "Copy wallet address to clipboard"
- Keyboard accessible (Enter/Space)
- Screen reader announcements
- Visual and audio feedback

### Mobile Optimizations
- Larger touch target on mobile (min 44px)
- Haptic feedback on supported devices
- Native clipboard integration
- No long-press conflicts

### States
1. **Default**: "Copy" text, normal styling
2. **Hover**: Highlighted with accent color
3. **Active**: Pressed state animation
4. **Success**: "Copied!" with green styling
5. **Error**: "Failed" with red styling

### Error Handling
- Clipboard API not available
- User denies clipboard permission
- Copy operation fails
- Fallback methods provided

### Related Components
- Address Display
- QR Code
- Share Button
- Toast Notifications

### Security Considerations
- Only copies validated addresses
- No automatic clipboard reading
- Clear user action required
- Secure context enforcement