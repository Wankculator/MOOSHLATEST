# ModalOverlay

**Status**: 🟢 Active
**Type**: UI Component/Layout System
**Location**: /public/js/moosh-wallet.js:10927-10947, 16061-16094
**Mobile Support**: Yes
**Theme Support**: Dark/Light

## Visual Design

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                 Semi-transparent Overlay                │
│                      (click to close)                   │
│                                                         │
│         ┌─────────────────────────────────┐            │
│         │  < Modal Title />            [×] │            │
│         ├─────────────────────────────────┤            │
│         │                                 │            │
│         │         Modal Content           │            │
│         │                                 │            │
│         │  - Forms                        │            │
│         │  - Information                  │            │
│         │  - Actions                      │            │
│         │                                 │            │
│         ├─────────────────────────────────┤            │
│         │    [Cancel]        [Confirm]    │            │
│         └─────────────────────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Structure
- **Container**: `div.modal-overlay` (full screen backdrop)
- **Children**: 
  - Modal container (`div.modal-container`)
  - Modal header with title and close button
  - Modal content area
  - Modal footer with actions
- **Layout**: Fixed positioning, flexbox centering

## Styling
- **Base Classes**: 
  - `modal-overlay` - Full screen backdrop
  - `modal-container` - Content container
  - `modal-header` - Header section
  - `modal-content` - Scrollable content area
  - `modal-footer` - Action buttons area
  - `show` - Animation class
- **Responsive**: 
  - Desktop: max-width 500px
  - Mobile: Full width with rounded top corners
- **Animations**: 
  - Fade in overlay (300ms)
  - Scale/fade content

## State Management
- **States**: 
  - Hidden (not in DOM)
  - Showing (animating in)
  - Visible (interactive)
  - Hiding (animating out)
- **Updates**: 
  - Click outside to close
  - ESC key to close
  - Programmatic show/hide

## Implementation
```javascript
// Base modal structure
show() {
    const $ = window.ElementFactory || ElementFactory;
    
    this.modal = $.div({
        className: 'modal-overlay',
        onclick: (e) => {
            if (e.target === this.modal) this.hide();
        }
    }, [
        $.div({
            className: 'modal-container',
            style: {
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                maxWidth: '500px',
                width: '100%'
            }
        }, [
            this.createHeader(),
            this.createContent(),
            this.createFooter()
        ])
    ]);
    
    document.body.appendChild(this.modal);
    
    // Trigger animation
    requestAnimationFrame(() => {
        this.modal.classList.add('show');
    });
}

hide() {
    if (this.modal) {
        this.modal.classList.remove('show');
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.remove();
            }
        }, 300);
    }
}
```

## Modal Types
1. **SendPaymentModal** - Bitcoin transactions
2. **ReceivePaymentModal** - Address & QR display
3. **MultiAccountModal** - Account management
4. **TransactionHistoryModal** - TX list
5. **TokenMenuModal** - Token selection
6. **SwapModal** - Token swapping
7. **WalletSettingsModal** - Configuration
8. **SparkDashboardModal** - Spark stats
9. **OrdinalsModal** - Inscription viewer

## CSS Requirements
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

.modal-container {
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-overlay.show .modal-container {
    transform: scale(1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 0;
        align-items: flex-end;
    }
    
    .modal-container {
        border-radius: 16px 16px 0 0;
        width: 100%;
        max-height: 90vh;
    }
}
```

## Accessibility
- **ARIA Labels**: 
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby` for title
- **Keyboard Support**: 
  - ESC to close
  - Tab trapping within modal
  - Focus on first input/button
- **Screen Reader**: 
  - Announces modal opening
  - Describes purpose
- **Focus Management**: 
  - Trap focus within modal
  - Return focus on close

## Performance
- **Render Strategy**: On-demand creation
- **Updates**: Minimal DOM manipulation
- **Cleanup**: Complete removal on close
- **Memory**: Event listeners cleaned up

## Connected Components
- **Parent**: Various app components
- **Children**: Modal-specific content
- **Events**: 
  - `modalOpen` - When shown
  - `modalClose` - When hidden
- **Manager**: `app.modalManager`

## Best Practices
1. **One modal at a time** - Close existing before opening new
2. **Loading states** - Show spinner for async operations
3. **Error handling** - Display inline errors, don't close on error
4. **Confirmation** - Use for destructive actions
5. **Mobile first** - Design for touch interactions

## Common Patterns
```javascript
// Creating a custom modal
class CustomModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
    }
    
    show() {
        // Clean up existing
        this.hide();
        
        // Create new modal
        this.modal = this.createModal();
        document.body.appendChild(this.modal);
        
        // Animate in
        requestAnimationFrame(() => {
            this.modal.classList.add('show');
        });
    }
    
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
            setTimeout(() => {
                this.modal?.remove();
                this.modal = null;
            }, 300);
        }
    }
}
```

## Mobile Considerations
- Bottom sheet style on mobile
- Touch-friendly close areas
- Prevent body scroll when open
- Safe area insets for notched devices
- Swipe down to dismiss (optional)