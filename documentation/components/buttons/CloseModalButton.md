# Close Modal Button (X Button)

## Overview
The Close Modal Button is a universal component used to dismiss modal dialogs throughout the application. It typically appears as an "X" in the top-right corner of modals.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Multiple instances**: Lines 9980-9982, 10114-10117, 10221-10224, 10354-10357, 10435-10438

### Visual Specifications
- **Class**: `modal-close`
- **Symbol**: "×" (multiplication symbol)
- **Position**: Absolute, top-right
- **Size**: 24px × 24px (clickable area: 44px × 44px)
- **Background**: Transparent
- **Color**: `#666666` (default), `#ffffff` on hover
- **Font Size**: 24px
- **Border**: None
- **Cursor**: Pointer

### Implementation

```javascript
$.button({
    className: 'modal-close',
    onclick: () => this.closeModal()
}, ['×'])
```

### CSS Styles
```css
.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    color: #666666;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    padding: 10px;
    transition: color 0.2s ease;
    z-index: 10;
}

.modal-close:hover {
    color: #ffffff;
}

.modal-close:active {
    transform: scale(0.9);
}

/* Larger touch target for mobile */
@media (max-width: 768px) {
    .modal-close {
        padding: 15px;
        top: 10px;
        right: 10px;
    }
}
```

### Click Handler

```javascript
closeModal() {
    // Get current modal element
    const modal = this.currentModal;
    
    if (!modal) return;
    
    // Trigger close animation
    modal.classList.add('closing');
    
    // Wait for animation
    setTimeout(() => {
        // Remove modal from DOM
        modal.remove();
        
        // Clear modal reference
        this.currentModal = null;
        
        // Remove backdrop if present
        this.removeBackdrop();
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Emit close event
        this.emit('modalClosed');
        
        // Return focus to trigger element
        if (this.modalTrigger) {
            this.modalTrigger.focus();
        }
    }, 200);
}
```

### Variations

1. **Standard Modal Close**
   ```javascript
   onclick: () => this.closeModal()
   ```

2. **With Confirmation**
   ```javascript
   onclick: () => this.confirmClose()
   ```

3. **With Cleanup**
   ```javascript
   onclick: () => {
       this.cleanup();
       this.closeModal();
   }
   ```

### Keyboard Support
- **Escape Key**: Closes modal
- **Tab Navigation**: Included in tab order
- **Enter/Space**: Activates close

```javascript
// Keyboard handler
handleKeyDown(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        this.closeModal();
    }
}
```

### Accessibility Features
- ARIA label: "Close dialog"
- Role: "button"
- Keyboard accessible
- Focus visible indicator
- Screen reader announcement

### Modal Types Using Close Button
1. **Send Modal**: Transaction form
2. **Receive Modal**: Address display
3. **Settings Modal**: Configuration options
4. **Seed Phrase Modal**: Security display
5. **Password Modal**: Authentication
6. **Error Modal**: Error messages
7. **Confirmation Modal**: Action confirmation

### Animation
```css
@keyframes modalFadeOut {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.9);
    }
}

.modal.closing {
    animation: modalFadeOut 0.2s ease-out;
}
```

### Best Practices
- Always in consistent position (top-right)
- Large enough touch target (44px minimum)
- Clear visual indicator on hover
- Prevents accidental closes with confirmation
- Maintains focus management

### Mobile Considerations
- Enlarged touch target
- Position adjusted for thumb reach
- Swipe-down gesture support (optional)
- Prevents accidental activation

### Related Components
- Modal Overlay
- Modal Container
- Backdrop
- Focus Trap
- Confirmation Dialog