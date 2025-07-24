# Confirm and Cancel Buttons

## Overview
Confirm and Cancel buttons are used throughout the wallet in forms, modals, and dialogs. They follow consistent patterns for user actions and confirmations.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Multiple instances**: Found in modals, forms, and dialogs throughout the application

## Cancel Button

### Visual Specifications
- **Class**: `btn btn-secondary` or `btn-cancel`
- **Background**: Transparent or `#000000`
- **Border**: 2px solid `#666666`
- **Text Color**: `#999999`
- **Text**: "Cancel", "Close", or "Back"
- **Position**: Usually left side of button group

### Implementation
```javascript
$.button({
    className: 'btn btn-secondary',
    onclick: () => this.handleCancel()
}, ['Cancel'])
```

### Cancel Handler
```javascript
handleCancel() {
    // Check for unsaved changes
    if (this.hasUnsavedChanges()) {
        this.confirmCancel();
    } else {
        this.performCancel();
    }
}

performCancel() {
    // Clear form data
    this.clearFormData();
    
    // Close modal/dialog
    this.close();
    
    // Emit cancel event
    this.emit('cancelled');
    
    // Return focus to trigger
    if (this.triggerElement) {
        this.triggerElement.focus();
    }
}
```

## Confirm Button

### Visual Specifications
- **Class**: `btn btn-primary` or `btn-confirm`
- **Background**: `#000000` or accent color
- **Border**: 2px solid `#f57315`
- **Text Color**: `#f57315` or white
- **Text**: "Confirm", "Submit", "Save", "OK", "Send"
- **Position**: Usually right side of button group

### Implementation
```javascript
$.button({
    className: 'btn btn-primary',
    onclick: () => this.handleConfirm()
}, ['Confirm'])
```

### Confirm Handler
```javascript
async handleConfirm() {
    // Validate form
    if (!this.validateForm()) {
        return;
    }
    
    // Disable button to prevent double-submit
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Processing...';
    
    try {
        // Process action
        await this.processAction();
        
        // Success handling
        this.showSuccess('Action completed successfully');
        this.close();
        
    } catch (error) {
        // Error handling
        this.showError(error.message);
        
    } finally {
        // Re-enable button
        button.disabled = false;
        button.textContent = 'Confirm';
    }
}
```

## Common Patterns

### 1. Modal Footer Pattern
```javascript
renderModalFooter() {
    return $.div({ className: 'modal-footer' }, [
        $.button({
            className: 'btn btn-secondary',
            onclick: () => this.close()
        }, ['Cancel']),
        $.button({
            className: 'btn btn-primary',
            onclick: () => this.submit()
        }, ['Submit'])
    ]);
}
```

### 2. Dangerous Action Pattern
```javascript
renderDangerousActionButtons() {
    return $.div({ className: 'button-group' }, [
        $.button({
            className: 'btn btn-secondary',
            onclick: () => this.cancel()
        }, ['Cancel']),
        $.button({
            className: 'btn btn-danger',
            onclick: () => this.confirmDangerousAction()
        }, ['Delete Permanently'])
    ]);
}
```

### 3. Multi-Step Form Pattern
```javascript
renderStepButtons(currentStep, totalSteps) {
    return $.div({ className: 'step-buttons' }, [
        currentStep > 1 && $.button({
            className: 'btn btn-secondary',
            onclick: () => this.previousStep()
        }, ['Previous']),
        
        currentStep < totalSteps ? $.button({
            className: 'btn btn-primary',
            onclick: () => this.nextStep()
        }, ['Next']) : $.button({
            className: 'btn btn-primary',
            onclick: () => this.submit()
        }, ['Finish'])
    ]);
}
```

## Button States

### Loading State
```javascript
setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="spinner"></span> Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}
```

### Disabled State
```javascript
// Disable when form is invalid
updateSubmitButton() {
    const isValid = this.validateForm();
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.disabled = !isValid;
    submitBtn.style.opacity = isValid ? '1' : '0.5';
}
```

## CSS Styles

```css
/* Button group layout */
.modal-footer,
.button-group {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid var(--border-color);
}

/* Cancel button styles */
.btn-secondary {
    background: transparent;
    border: 2px solid #666666;
    color: #999999;
    padding: 12px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    border-color: #999999;
    color: #ffffff;
}

/* Confirm button styles */
.btn-primary {
    background: #000000;
    border: 2px solid #f57315;
    color: #f57315;
    padding: 12px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background: #f57315;
    color: #000000;
}

/* Danger button variant */
.btn-danger {
    border-color: #ff4444;
    color: #ff4444;
}

.btn-danger:hover {
    background: #ff4444;
    color: #ffffff;
}
```

## Keyboard Support
- **Enter**: Activates confirm button when focused
- **Escape**: Activates cancel button
- **Tab**: Navigate between buttons
- **Space**: Activate focused button

## Mobile Considerations
1. **Full-width on mobile**
   ```css
   @media (max-width: 480px) {
       .modal-footer {
           flex-direction: column;
       }
       
       .modal-footer button {
           width: 100%;
       }
   }
   ```

2. **Touch feedback**
3. **Larger touch targets (min 44px)**
4. **Prevent accidental taps**

## Accessibility Features
- Clear button labels
- Proper button roles
- Focus management
- Disabled state indication
- Loading state announcements

## Best Practices
1. Cancel button always on the left
2. Primary action on the right
3. Dangerous actions require confirmation
4. Loading states prevent double-submit
5. Clear, action-oriented labels
6. Consistent styling across app

## Related Components
- Modal Component
- Form Validation
- Loading Spinner
- Toast Notifications
- Confirmation Dialogs