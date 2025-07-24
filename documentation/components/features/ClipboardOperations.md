# Clipboard Operations

**Status**: 🟢 Active
**Type**: Core Feature
**Security Critical**: Yes
**Implementation**: /public/js/moosh-wallet.js:7997-8065, 10685-10690, 13464-13520, 26503-26552

## Overview
Clipboard operations enable users to copy sensitive wallet data like addresses, private keys, and seed phrases. The system implements secure clipboard access with fallback methods for older browsers and provides visual feedback for successful operations.

## User Flow
```
[Click Copy Button] → [Data Copied to Clipboard] → [Visual Feedback] → [Notification Shown]
```

## Technical Implementation

### Frontend
- **Entry Point**: `copyToClipboard()` method in `moosh-wallet.js:13464`
- **UI Components**: 
  - Copy buttons throughout the interface
  - Visual feedback (button state change)
  - Success/error notifications
- **State Changes**: 
  - Button text/style during copy
  - Notification display

### Backend
- **API Endpoints**: None (client-side only)
- **Services Used**: Browser Clipboard API
- **Data Flow**: 
  1. User clicks copy button
  2. System attempts modern Clipboard API
  3. Falls back to execCommand if needed
  4. Shows manual copy prompt as last resort

## Code Example
```javascript
// Enhanced clipboard implementation with fallback
copyToClipboard(text, successMessage) {
    // Fallback for older browsers
    const copyToClipboardFallback = () => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.app.showNotification(successMessage || 'Copied to clipboard!', 'success');
                return true;
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.app.showNotification('Failed to copy. Please copy manually.', 'error');
            
            // Show text in prompt as last resort
            prompt('Copy the text below:', text);
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    };
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            this.app.showNotification(successMessage || 'Copied to clipboard!', 'success');
            this.addCopyButtonFeedback();
        }).catch((err) => {
            console.error('Clipboard API failed:', err);
            copyToClipboardFallback();
        });
    } else {
        copyToClipboardFallback();
    }
}
```

## Configuration
- **Settings**: 
  - Feedback duration: 1500ms
  - Success color: var(--text-accent)
  - Secure context required for modern API
- **Defaults**: 
  - Generic success message if none provided
  - Automatic fallback to legacy methods
  - Visual feedback on all copy buttons
- **Limits**: 
  - Text-only copying (no rich content)
  - Browser clipboard size limits apply

## Security Considerations
- **Sensitive Data Handling**:
  - Private keys cleared from memory after copy
  - No clipboard data persistence
  - Secure context (HTTPS) required for modern API
- **User Consent**:
  - Explicit user action required
  - No automatic clipboard access
  - Clear visual feedback
- **Browser Permissions**:
  - Fallback for restricted environments
  - Manual copy option always available

## Performance Impact
- **Load Time**: None
- **Memory**: Minimal (temporary textarea)
- **Network**: None (client-side only)

## Mobile Considerations
- Touch feedback on copy buttons
- Larger tap targets for mobile
- iOS clipboard permission handling
- Android clipboard app integration
- Visual feedback crucial on mobile

## Error Handling
- **Common Errors**: 
  - Clipboard API permission denied
  - Browser doesn't support clipboard access
  - Secure context not available (HTTP)
  - Mobile browser restrictions
- **Recovery**: 
  - Automatic fallback chain:
    1. Modern Clipboard API
    2. document.execCommand
    3. Manual selection prompt
  - Clear error messages
  - Alternative copy methods provided

## Testing
```bash
# Test clipboard operations
1. Test address copying:
   - Click copy button on wallet address
   - Paste in text editor to verify
   
2. Test seed phrase copying:
   - Generate new wallet
   - Copy seed phrase
   - Verify all words copied correctly
   
3. Test fallback methods:
   - Disable clipboard permissions
   - Test copy still works via fallback
   
4. Test mobile copying:
   - Test on iOS Safari
   - Test on Android Chrome
   - Verify touch feedback works
```

## Future Enhancements
- Clipboard history (with encryption)
- Rich text/QR code copying
- Automatic clipboard clearing after timeout
- Copy with formatting preservation
- Multi-item clipboard queue
- Clipboard content validation
- Integration with password managers
- Copy operation analytics
- Customizable feedback animations