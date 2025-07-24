# EmptyStates

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:9450-9468, 12345-12363, 14494-14512, 28518-28536
**Mobile Support**: Yes
**Theme Support**: Dark/Light

## Visual Design

```
Standard Empty State:
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│        No transactions yet              │
│                                         │
│   Your transaction history will         │
│        appear here                      │
│                                         │
│                                         │
└─────────────────────────────────────────┘

With Action:
┌─────────────────────────────────────────┐
│                                         │
│            📭                           │
│                                         │
│      No inscriptions found              │
│                                         │
│   Start collecting Bitcoin NFTs         │
│                                         │
│      [Browse Marketplace]               │
│                                         │
└─────────────────────────────────────────┘
```

## Structure
- **Container**: `div` with centered content
- **Children**: 
  - Primary message (larger text)
  - Secondary message (smaller, dimmed)
  - Optional icon/illustration
  - Optional action button
- **Layout**: Centered text, vertical alignment

## Styling
- **Base Classes**: None (inline styles)
- **Text**: 
  - Primary: 14px, normal color
  - Secondary: 12px, 70% opacity
- **Spacing**: 40px padding, 8px between messages
- **Colors**: Uses --text-dim variable

## Implementation
```javascript
// Basic empty state for transactions
return $.div({ 
    style: {
        textAlign: 'center',
        padding: 'calc(40px * var(--scale-factor))',
        color: 'var(--text-dim)',
        fontFamily: "'JetBrains Mono', monospace"
    }
}, [
    $.div({ 
        style: {
            fontSize: 'calc(14px * var(--scale-factor))',
            marginBottom: 'calc(8px * var(--scale-factor))'
        }
    }, ['No transactions yet']),
    $.div({ 
        style: {
            fontSize: 'calc(12px * var(--scale-factor))',
            opacity: '0.7'
        }
    }, ['Your transaction history will appear here'])
]);
```

## Common Empty State Types

### 1. Transaction History
```javascript
{
    primary: 'No transactions yet',
    secondary: 'Your transaction history will appear here'
}
```

### 2. Wallet/Account
```javascript
{
    primary: 'No wallet found',
    secondary: 'Generate or import a wallet to get started',
    action: 'Create Wallet'
}
```

### 3. Search Results
```javascript
{
    primary: 'No results found',
    secondary: 'Try adjusting your search terms'
}
```

### 4. Inscriptions/NFTs
```javascript
{
    primary: 'No inscriptions yet',
    secondary: 'Start your collection of Bitcoin NFTs',
    action: 'Browse Ordinals'
}
```

### 5. Network Error
```javascript
{
    primary: 'Unable to load data',
    secondary: 'Check your connection and try again',
    action: 'Retry'
}
```

## Advanced Empty State Pattern
```javascript
createEmptyState(config) {
    const $ = window.ElementFactory || ElementFactory;
    const {
        icon = '',
        primary = 'No data',
        secondary = '',
        action = null,
        onAction = null
    } = config;
    
    return $.div({ 
        className: 'empty-state',
        style: {
            textAlign: 'center',
            padding: 'calc(60px * var(--scale-factor)) calc(20px * var(--scale-factor))',
            color: 'var(--text-dim)',
            fontFamily: "'JetBrains Mono', monospace",
            maxWidth: '400px',
            margin: '0 auto'
        }
    }, [
        icon && $.div({ 
            style: {
                fontSize: 'calc(48px * var(--scale-factor))',
                marginBottom: 'calc(16px * var(--scale-factor))',
                opacity: '0.5'
            }
        }, [icon]),
        
        $.div({ 
            style: {
                fontSize: 'calc(16px * var(--scale-factor))',
                marginBottom: 'calc(8px * var(--scale-factor))',
                fontWeight: '600'
            }
        }, [primary]),
        
        secondary && $.div({ 
            style: {
                fontSize: 'calc(13px * var(--scale-factor))',
                opacity: '0.7',
                marginBottom: action ? 'calc(20px * var(--scale-factor))' : '0'
            }
        }, [secondary]),
        
        action && $.button({
            className: 'btn btn-primary',
            onclick: onAction,
            style: {
                marginTop: 'calc(16px * var(--scale-factor))'
            }
        }, [action])
    ]);
}
```

## CSS Requirements
```css
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .empty-state {
        padding: 30px 15px;
        font-size: 0.9em;
    }
}
```

## Best Practices

### 1. Clear Messaging
- Primary text: State what's missing
- Secondary text: Explain why or what happens next
- Keep messages concise and friendly

### 2. Helpful Actions
- Provide a clear next step when possible
- Make action buttons prominent
- Link to relevant features

### 3. Visual Hierarchy
- Use size and opacity to create hierarchy
- Icons can add visual interest
- Don't overwhelm with too many elements

### 4. Contextual Relevance
- Tailor messages to specific contexts
- Consider user's journey stage
- Provide relevant suggestions

## Accessibility
- **Semantic HTML**: Use appropriate heading levels
- **Color Contrast**: Ensure readable text on dim opacity
- **Screen Reader**: Clear, descriptive messages
- **Focus Management**: Action buttons are focusable

## Performance
- **Render Strategy**: Lightweight DOM structure
- **Animations**: CSS-only, optional
- **Conditional Rendering**: Only show when needed

## Connected Components
- **Parent**: 
  - Transaction lists
  - Search results
  - Data tables
  - Gallery views
- **Children**: Text and optional button
- **Events**: Action button clicks

## Examples by Context

### First-Time User
```javascript
createEmptyState({
    icon: '🚀',
    primary: 'Welcome to MOOSH Wallet!',
    secondary: 'Create your first wallet to start using Bitcoin',
    action: 'Create Wallet',
    onAction: () => router.navigate('wallet-setup')
})
```

### Loading Failed
```javascript
createEmptyState({
    icon: '⚠️',
    primary: 'Failed to load transactions',
    secondary: 'Please check your internet connection',
    action: 'Try Again',
    onAction: () => loadTransactions()
})
```

### Search No Results
```javascript
createEmptyState({
    icon: '🔍',
    primary: 'No matching transactions',
    secondary: 'Try different filters or search terms'
})
```

## Mobile Considerations
- Reduce padding on small screens
- Ensure touch-friendly action buttons
- Consider horizontal space constraints
- Test message wrapping on narrow screens