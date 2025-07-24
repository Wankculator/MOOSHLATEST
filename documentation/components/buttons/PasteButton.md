# Paste Button

## Overview
The Paste Button allows users to quickly paste addresses or other data from the clipboard into input fields. It appears next to address inputs and provides one-click paste functionality.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Context**: Address input fields, send modal, import screens
- **Purpose**: Quick clipboard paste action

### Visual Specifications
- **Class**: `paste-btn`
- **Icon**: 📋 or "Paste" text
- **Position**: Absolute within input container
- **Size**: Small, inline with input
- **Background**: Transparent
- **Border**: 1px solid `#333333`

### Implementation

```javascript
renderPasteButton(inputId) {
    return $.button({
        className: 'paste-btn',
        title: 'Paste from clipboard',
        onclick: () => this.pasteFromClipboard(inputId)
    }, ['📋'])
}

// Input with paste button
renderAddressInput() {
    return $.div({ className: 'input-with-paste' }, [
        $.input({
            type: 'text',
            id: 'recipientAddress',
            placeholder: 'Bitcoin address',
            className: 'address-input',
            oninput: (e) => this.validateAddress(e.target.value)
        }),
        this.renderPasteButton('recipientAddress')
    ]);
}
```

### Paste Handler

```javascript
async pasteFromClipboard(inputId) {
    try {
        // Check clipboard permission
        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
        
        if (permission.state === 'denied') {
            this.showError('Clipboard access denied');
            return;
        }
        
        // Read from clipboard
        const text = await navigator.clipboard.readText();
        
        if (!text) {
            this.showToast('Clipboard is empty', 'info');
            return;
        }
        
        // Process pasted text
        const processed = this.processPastedText(text);
        
        // Set value in input
        const input = document.getElementById(inputId);
        input.value = processed;
        
        // Trigger validation
        input.dispatchEvent(new Event('input'));
        
        // Visual feedback
        this.showPasteSuccess();
        
    } catch (error) {
        console.error('Paste failed:', error);
        this.fallbackPaste(inputId);
    }
}
```

### Text Processing

```javascript
processPastedText(text) {
    // Trim whitespace
    text = text.trim();
    
    // Extract Bitcoin address from various formats
    const patterns = {
        // Plain address
        plain: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
        
        // Bitcoin URI
        uri: /bitcoin:([bc13][a-zA-HJ-NP-Z0-9]{25,62})/,
        
        // Address with label
        labeled: /.*?(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}/
    };
    
    // Try to extract address
    for (const [type, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
            return type === 'plain' ? match[0] : match[1];
        }
    }
    
    // Return original if no pattern matches
    return text;
}
```

### Fallback Paste (for older browsers)

```javascript
fallbackPaste(inputId) {
    const input = document.getElementById(inputId);
    
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // Focus and paste
    textarea.focus();
    
    try {
        // Execute paste command
        document.execCommand('paste');
        
        // Get pasted value
        const pastedText = textarea.value;
        
        if (pastedText) {
            input.value = this.processPastedText(pastedText);
            input.dispatchEvent(new Event('input'));
            this.showPasteSuccess();
        }
        
    } catch (error) {
        this.showManualPastePrompt();
    } finally {
        document.body.removeChild(textarea);
    }
}
```

### Manual Paste Prompt

```javascript
showManualPastePrompt() {
    const modal = $.div({ className: 'paste-modal' }, [
        $.h3({}, ['Paste Address']),
        $.p({}, ['Please paste your Bitcoin address below:']),
        
        $.textarea({
            id: 'manualPasteArea',
            placeholder: 'Paste here...',
            style: 'width: 100%; height: 100px; margin: 16px 0;'
        }),
        
        $.div({ className: 'modal-buttons' }, [
            $.button({
                className: 'btn-secondary',
                onclick: () => modal.remove()
            }, ['Cancel']),
            
            $.button({
                className: 'btn-primary',
                onclick: () => {
                    const text = document.getElementById('manualPasteArea').value;
                    if (text) {
                        const processed = this.processPastedText(text);
                        document.getElementById(this.targetInputId).value = processed;
                        document.getElementById(this.targetInputId).dispatchEvent(new Event('input'));
                    }
                    modal.remove();
                }
            }, ['Use Address'])
        ])
    ]);
    
    document.body.appendChild(modal);
    document.getElementById('manualPasteArea').focus();
}
```

### Visual Feedback

```javascript
showPasteSuccess() {
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    
    // Change button appearance
    btn.innerHTML = '✓';
    btn.classList.add('success');
    
    // Revert after delay
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.remove('success');
    }, 2000);
}
```

### CSS Styles

```css
.input-with-paste {
    position: relative;
    width: 100%;
}

.paste-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: 1px solid #333333;
    color: #666666;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
}

.paste-btn:hover {
    border-color: #f57315;
    color: #f57315;
    background: rgba(245, 115, 21, 0.1);
}

.paste-btn.success {
    border-color: #00ff00;
    color: #00ff00;
    background: rgba(0, 255, 0, 0.1);
}

.address-input {
    padding-right: 50px; /* Space for paste button */
}

/* Mobile styles */
@media (max-width: 768px) {
    .paste-btn {
        padding: 8px 12px;
        font-size: 14px;
    }
}
```

### Smart Paste Features

```javascript
// Auto-detect and handle different formats
smartPaste(text) {
    // Bitcoin address
    if (this.isBitcoinAddress(text)) {
        return { type: 'address', value: text };
    }
    
    // Bitcoin URI
    if (text.startsWith('bitcoin:')) {
        const parsed = this.parseBitcoinURI(text);
        return { type: 'uri', value: parsed };
    }
    
    // Lightning invoice
    if (text.toLowerCase().startsWith('lnbc')) {
        return { type: 'lightning', value: text };
    }
    
    // Transaction ID
    if (text.match(/^[a-f0-9]{64}$/i)) {
        return { type: 'txid', value: text };
    }
    
    return { type: 'unknown', value: text };
}
```

### Permissions Handling

```javascript
async checkClipboardPermission() {
    try {
        const permission = await navigator.permissions.query({ 
            name: 'clipboard-read' 
        });
        
        if (permission.state === 'prompt') {
            // Show explanation before requesting
            this.showPermissionExplanation();
        }
        
        return permission.state === 'granted';
        
    } catch (error) {
        // Permissions API not supported
        return true; // Try anyway
    }
}
```

### Mobile Optimizations
- Larger touch target
- Long-press to paste (native)
- Clear visual feedback
- Fallback for iOS Safari

### Security Considerations
- Validates pasted addresses
- Sanitizes input
- No automatic actions without user interaction
- Clear permission requests

### Related Components
- Address Input Field
- Address Validator
- Copy Button
- QR Scanner
- Clipboard Manager