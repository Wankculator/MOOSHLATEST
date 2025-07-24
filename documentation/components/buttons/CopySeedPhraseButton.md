# Copy Seed Phrase Button

## Overview
The Copy Seed Phrase Button allows users to copy their wallet's recovery seed phrase to the clipboard. It appears in the seed phrase display modal after password verification.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10461-10465 (within seed phrase modal)

### Visual Specifications
- **Class**: `btn btn-secondary`
- **Background**: Transparent
- **Border**: 2px solid `#666666`
- **Text Color**: `#999999`
- **Font**: JetBrains Mono, monospace
- **Font Size**: 14px
- **Padding**: 10px 20px
- **Cursor**: Pointer
- **Transition**: all 0.2s ease

### Implementation

```javascript
$.button({
    className: 'btn btn-secondary',
    onclick: () => this.copySeedPhrase(seedPhrase)
}, ['Copy Seed Phrase'])
```

### Click Handler

```javascript
async copySeedPhrase(seedPhrase) {
    try {
        // Security check - confirm action
        const confirmed = await this.confirmAction(
            'Copy Seed Phrase?',
            'The seed phrase will be copied to your clipboard. Make sure no one can see your screen.'
        );
        
        if (!confirmed) return;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(seedPhrase);
        
        // Visual feedback
        const btn = event.currentTarget;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('success');
        
        // Log security event
        this.logSecurityEvent('SEED_PHRASE_COPIED');
        
        // Clear clipboard after 30 seconds
        setTimeout(() => {
            this.clearClipboard();
        }, 30000);
        
        // Reset button after 2 seconds
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('success');
        }, 2000);
        
        // Show warning
        this.showToast(
            'Seed phrase copied. Clipboard will be cleared in 30 seconds.',
            'warning',
            5000
        );
        
    } catch (error) {
        console.error('Failed to copy seed phrase:', error);
        this.showError('Failed to copy seed phrase');
    }
}
```

### Security Features

1. **Confirmation Dialog**
   - Requires explicit user confirmation
   - Warns about clipboard visibility
   - Can be disabled in settings

2. **Clipboard Auto-Clear**
   ```javascript
   clearClipboard() {
       // Overwrite clipboard with empty string
       navigator.clipboard.writeText('').catch(() => {
           // Fallback for older browsers
           const textArea = document.createElement('textarea');
           textArea.value = '';
           document.body.appendChild(textArea);
           textArea.select();
           document.execCommand('copy');
           document.body.removeChild(textArea);
       });
   }
   ```

3. **Security Logging**
   - Timestamp of copy action
   - Device information
   - Optional notification to email

### Visual States
1. **Default**: "Copy Seed Phrase"
2. **Hover**: Highlighted border and text
3. **Confirming**: Shows confirmation dialog
4. **Success**: "✓ Copied!" with green accent
5. **Error**: "Failed" with red accent

### CSS Styles
```css
.btn-secondary {
    background: transparent;
    border: 2px solid #666666;
    color: #999999;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    border-color: #f57315;
    color: #f57315;
}

.btn-secondary.success {
    border-color: #00ff00;
    color: #00ff00;
}
```

### Accessibility Features
- Keyboard accessible (Enter/Space)
- Screen reader announcements
- Clear success/error feedback
- Focus management after action

### Mobile Optimizations
- Larger touch target (min 44px height)
- Haptic feedback on copy
- Native clipboard API usage
- Clear visual confirmation

### Browser Compatibility
- Modern browsers: Clipboard API
- Legacy fallback: execCommand
- Secure context required (HTTPS)
- Permission handling

### Warning Messages
- Pre-copy: "Make sure no one can see your screen"
- Post-copy: "Clipboard will be cleared in 30 seconds"
- Error: "Failed to copy seed phrase"

### Related Components
- Seed Phrase Display Modal
- Confirmation Dialog
- Toast Notifications
- Security Event Logger
- Clipboard Manager