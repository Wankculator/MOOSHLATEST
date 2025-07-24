# NotificationSystem

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:31446-31490
**Mobile Support**: Yes
**Theme Support**: Dark/Light (Moosh/Original)

## Visual Design

```
┌─────────────────────────────────────────┐
│                                         │
│  ✓ Transaction completed successfully   │
│                                         │
└─────────────────────────────────────────┘
   ↑ Border color changes based on type
   
Types:
- success: Green/Theme primary color
- error: Red (#ff4444)
- info: Theme primary color
- moosh: Green (#69fd97)
- original: Orange (#f57315)
```

## Structure
- **Container**: `div.notification`
- **Children**: Text content only
- **Layout**: Fixed positioning, appended to body

## Styling
- **Base Classes**: `notification`, `show` (for animation)
- **Responsive**: Adapts to screen width
- **Animations**: Fade in/out with CSS transitions (300ms)

## State Management
- **States**: hidden → showing → visible → hiding → removed
- **Updates**: Auto-dismiss after 2.5 seconds
- **Multiple**: Can stack multiple notifications

## Implementation
```javascript
showNotification(message, type = 'info') {
    const $ = window.ElementFactory || ElementFactory;
    const notification = $.div({ className: 'notification' });
    notification.textContent = message;
    
    // Type-specific styling
    const isCurrentlyMooshTheme = document.body.classList.contains('moosh-mode');
    const primaryColor = isCurrentlyMooshTheme ? '#69fd97' : '#f57315';
    
    // Color mapping based on type
    if (type === 'moosh') {
        notification.style.borderColor = '#69fd97';
        notification.style.color = '#69fd97';
    } else if (type === 'error') {
        notification.style.borderColor = '#ff4444';
        notification.style.color = '#ff4444';
    }
    // ... more type handling
    
    document.body.appendChild(notification);
    
    // Animation sequence
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto-dismiss
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}
```

## Usage Patterns
```javascript
// Success notification
app.showNotification('Wallet created successfully', 'success');

// Error notification
app.showNotification('Invalid password', 'error');

// Info notification (default)
app.showNotification('Synchronizing wallet...');

// Theme-specific
app.showNotification('Moosh mode activated', 'moosh');
```

## Accessibility
- **ARIA Labels**: None (uses text content)
- **Keyboard Support**: Not interactive
- **Screen Reader**: Announces text content
- **Focus Management**: Does not steal focus

## Performance
- **Render Strategy**: Immediate DOM append
- **Updates**: Uses requestAnimationFrame for smooth animation
- **Cleanup**: Auto-removes after 2.8 seconds total

## Connected Components
- **Parent**: Document body (global)
- **Children**: None
- **Events**: None emitted
- **Triggered By**: 
  - Wallet operations (lock/unlock)
  - Transaction events
  - Theme changes
  - Error conditions
  - Account operations

## CSS Requirements
```css
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid;
    border-radius: 8px;
    z-index: 10000;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.notification.show {
    opacity: 1;
    transform: translateY(0);
}
```

## Known Limitations
- No queuing system (multiple notifications can overlap)
- No persistent notifications option
- No action buttons or interaction
- No dismiss button (only auto-dismiss)
- No position customization

## Best Practices
1. Keep messages concise (under 50 characters)
2. Use appropriate type for context
3. Avoid showing multiple notifications rapidly
4. Include actionable information when relevant
5. Use error type sparingly to maintain impact