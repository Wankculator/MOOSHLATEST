# Password Toggle Button

## Overview
The Password Toggle Button allows users to show/hide password input fields for better usability. It appears as a "Show/Hide" button within password input containers.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 4142-4150 (Lock screen password toggle)
- **Method**: `createPasswordToggle()` at lines 7225-7243

### Visual Specifications
- **Position**: Absolute within input container
- **Size**: 46px width, full height of input
- **Background**: Black (`#000000`)
- **Border**: Left border 1px solid `#333333`
- **Text Color**: `var(--text-dim)` (`#666666`)
- **Font Size**: 11px
- **Text**: "Show" / "Hide"
- **Cursor**: Pointer

### Implementation

```javascript
$.button({
    type: 'button',
    style: 'position: absolute; right: 2px; top: 2px; bottom: 2px; width: 46px; background: #000000; border: none; border-left: 1px solid #333333; color: var(--text-dim); cursor: pointer; font-size: 11px; transition: color 0.2s ease;',
    onclick: () => this.togglePasswordVisibility(),
    onmouseover: (e) => { e.target.style.color = 'var(--text-primary)'; },
    onmouseout: (e) => { e.target.style.color = 'var(--text-dim)'; },
    id: 'togglePasswordBtn'
}, ['Show'])
```

### Reusable Method

```javascript
createPasswordToggle(inputId) {
    const toggleId = `toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`;
    
    return $.button({
        id: toggleId,
        type: 'button',
        style: {
            position: 'absolute',
            right: '2px',
            top: '2px',
            bottom: '2px',
            width: '46px',
            background: '#000000',
            border: 'none',
            borderLeft: '1px solid #333333',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: '11px',
            transition: 'color 0.2s ease',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        onclick: () => this.togglePasswordVisibility(inputId),
        onmouseover: (e) => { e.target.style.color = 'var(--text-primary)'; },
        onmouseout: (e) => { e.target.style.color = 'var(--text-dim)'; }
    }, ['Show']);
}
```

### Toggle Handler

```javascript
togglePasswordVisibility(inputId = 'lockPassword') {
    const input = document.getElementById(inputId);
    const toggleBtn = document.getElementById(`toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`);
    
    if (!input || !toggleBtn) return;
    
    if (input.type === 'password') {
        // Show password
        input.type = 'text';
        toggleBtn.textContent = 'Hide';
        
        // Auto-hide after 10 seconds for security
        this.autoHideTimeout = setTimeout(() => {
            if (input.type === 'text') {
                input.type = 'password';
                toggleBtn.textContent = 'Show';
            }
        }, 10000);
        
    } else {
        // Hide password
        input.type = 'password';
        toggleBtn.textContent = 'Show';
        
        // Clear auto-hide timeout
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
    }
    
    // Maintain focus on input
    input.focus();
}
```

### Container Structure

```html
<div style="position: relative;">
    <input type="password" id="lockPassword" />
    <button id="toggleLockPassword">Show</button>
</div>
```

### Features
1. **Toggle States**
   - "Show" - Password hidden (type="password")
   - "Hide" - Password visible (type="text")

2. **Security Features**
   - Auto-hide after 10 seconds
   - Clears on window blur
   - No password logging

3. **User Experience**
   - Maintains input focus
   - Smooth transitions
   - Clear visual feedback

### CSS for Container
```css
.password-input-container {
    position: relative;
    width: 100%;
}

.password-input-container input {
    padding-right: 50px; /* Space for toggle button */
    width: 100%;
}
```

### Accessibility
- Keyboard accessible (Tab navigation)
- ARIA labels for screen readers
- Announces state changes
- High contrast mode support

### Mobile Optimizations
- Larger touch target on mobile
- Prevents zoom on input focus
- Native password managers compatible
- Touch feedback

### Security Considerations
- Password never logged to console
- Auto-hide timeout for security
- Clears visibility on page hide
- No password in DOM attributes

### Browser Compatibility
- Works with password managers
- Compatible with autofill
- Supports all modern browsers
- Graceful degradation

### Variations
1. **With Icon**
   ```javascript
   toggleBtn.innerHTML = showPassword ? '👁️' : '👁️‍🗨️';
   ```

2. **With Tooltip**
   ```javascript
   toggleBtn.title = showPassword ? 'Hide password' : 'Show password';
   ```

### Related Components
- Password Input Field
- Lock Screen
- Password Change Modal
- Security Settings
- Form Validation