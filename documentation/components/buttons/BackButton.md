# Back Button

## Overview
The Back Button provides navigation to return to previous screens or cancel current operations. It's used throughout the wallet for hierarchical navigation.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: NavigationButton class (lines ~5485-5520)
- **Multiple instances throughout modals and screens

### Visual Specifications
- **Variant**: 'back' (special variant of NavigationButton)
- **Background**: Transparent
- **Border**: 2px solid white
- **Text Color**: White
- **Icon**: "←" (left arrow)
- **Padding**: 12px 24px
- **Border Radius**: 0 (sharp corners)

### Implementation

```javascript
// Using NavigationButton component
new NavigationButton({
    text: '← Back',
    onClick: () => this.goBack(),
    variant: 'back'
}).render()

// Direct implementation
$.button({
    className: 'btn-back',
    style: {
        background: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
        padding: '12px 24px',
        fontSize: '14px',
        fontFamily: 'JetBrains Mono, monospace',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    onclick: () => this.handleBack()
}, ['← Back'])
```

### NavigationButton Component

```javascript
class NavigationButton {
    constructor(props) {
        this.props = {
            text: '',
            onClick: () => {},
            variant: 'primary', // 'primary', 'secondary', 'back'
            disabled: false,
            ...props
        };
    }
    
    getStyles() {
        const baseStyles = {
            padding: '12px 24px',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: '600',
            cursor: this.props.disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '0',
            opacity: this.props.disabled ? '0.5' : '1'
        };
        
        const variants = {
            back: {
                background: 'transparent',
                border: '2px solid #ffffff',
                color: '#ffffff'
            }
        };
        
        return { ...baseStyles, ...variants[this.props.variant] };
    }
    
    render() {
        return $.button({
            style: this.getStyles(),
            onclick: this.props.onClick,
            disabled: this.props.disabled
        }, [this.props.text]);
    }
}
```

### Navigation Handling

```javascript
handleBack() {
    // Check if there's navigation history
    if (this.navigationHistory.length > 1) {
        // Remove current view
        this.navigationHistory.pop();
        
        // Get previous view
        const previousView = this.navigationHistory[this.navigationHistory.length - 1];
        
        // Navigate to previous view
        this.navigateTo(previousView);
    } else {
        // No history, go to default view
        this.navigateTo('dashboard');
    }
}

goBack() {
    // Alternative implementation with state management
    const currentView = this.app.state.get('currentView');
    const viewHierarchy = {
        'seedPhrase': 'createWallet',
        'importWallet': 'welcome',
        'sendModal': 'dashboard',
        'settings': 'dashboard',
        'transactionDetails': 'transactionHistory'
    };
    
    const previousView = viewHierarchy[currentView] || 'dashboard';
    this.app.navigate(previousView);
}
```

### Context-Specific Behavior

1. **In Modals**
   ```javascript
   // Closes modal instead of navigating
   onclick: () => this.closeModal()
   ```

2. **In Multi-Step Forms**
   ```javascript
   // Goes to previous step
   onclick: () => this.previousStep()
   ```

3. **In Settings**
   ```javascript
   // Returns to main settings if in subsection
   onclick: () => this.exitSubsection()
   ```

### Keyboard Support
```javascript
// ESC key triggers back action
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && this.canGoBack()) {
        this.handleBack();
    }
});
```

### Mobile Gestures
```javascript
// Swipe right to go back
let touchStartX = 0;

element.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

element.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    
    if (swipeDistance > 50) { // Right swipe
        this.handleBack();
    }
});
```

### Visual States
- **Default**: White border and text
- **Hover**: Inverted (white background, black text)
- **Active**: Slight scale down (0.98)
- **Disabled**: 50% opacity

### Accessibility
- ARIA label: "Go back to previous screen"
- Keyboard navigation (Tab accessible)
- Clear focus indicator
- Screen reader announcements

### Best Practices
1. Always visible in sub-screens
2. Consistent position (top-left)
3. Clear labeling ("← Back" or "Cancel")
4. Preserves form data when going back
5. Confirms before losing unsaved changes

### Warning Prompts
```javascript
async handleBackWithWarning() {
    if (this.hasUnsavedChanges()) {
        const confirmed = await this.showConfirm(
            'Unsaved Changes',
            'You have unsaved changes. Are you sure you want to go back?'
        );
        
        if (!confirmed) return;
    }
    
    this.handleBack();
}
```

### Related Components
- Navigation History Manager
- Breadcrumb Trail
- Cancel Button
- Close Button
- Browser Back Button Handler