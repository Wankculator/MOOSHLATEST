# LoadingIndicator

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:21537-21548
**Mobile Support**: Yes
**Theme Support**: Inherits from parent

## Visual Design

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│     Loading recursive content...    │
│                                     │
│                                     │
└─────────────────────────────────────┘
         Centered in container

Text-based indicators:
- "Loading..."
- "Loading recursive content..."
- "Synchronizing..."
- "Please wait..."
```

## Structure
- **Container**: `div.loading-indicator`
- **Children**: Text content only
- **Layout**: Absolute positioning, centered

## Styling
- **Base Classes**: `loading-indicator`
- **Responsive**: Scales with parent container
- **Animations**: None (static text)

## State Management
- **States**: 
  - Visible (during loading)
  - Hidden (removed from DOM when complete)
- **Updates**: 
  - Created when content starts loading
  - Removed when content loads or fails

## Implementation
```javascript
// Iframe/recursive content loading
const loading = $.div({
    className: 'loading-indicator',
    style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#666',
        fontSize: '14px',
        fontFamily: 'monospace'
    }
}, ['Loading recursive content...']);

container.appendChild(loading);

// Remove when content loads
iframe.onload = function() {
    const loading = this.parentNode.querySelector('.loading-indicator');
    if (loading) loading.remove();
};

// Balance loading pattern
$.span({ id: 'btc-balance' }, ['Loading...'])
// Updates to actual value when data arrives
```

## Usage Patterns
1. **Iframe Content Loading**
   ```javascript
   // Show while iframe loads
   container.appendChild(loadingIndicator);
   container.appendChild(iframe);
   ```

2. **Balance Placeholders**
   ```javascript
   // Initial state
   <span>Loading...</span>
   // Updated with actual data
   <span>0.00435621</span>
   ```

3. **Async Content**
   ```javascript
   // Show during fetch
   showLoadingIndicator();
   const data = await fetchData();
   hideLoadingIndicator();
   displayContent(data);
   ```

## CSS Requirements
```css
.loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
    font-size: 14px;
    font-family: monospace;
    z-index: 10;
}

/* Optional animation */
@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}

.loading-indicator {
    animation: pulse 1.5s ease-in-out infinite;
}
```

## Variations

### Text-Only Loading
- Simple text replacement
- No additional elements
- Minimal performance impact

### Spinner Loading (Not implemented but common pattern)
```javascript
// Potential spinner implementation
const spinner = $.div({
    className: 'loading-spinner',
    style: {
        width: '20px',
        height: '20px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid var(--text-accent)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
});
```

### Progress Loading (For known durations)
```javascript
// Progress bar for operations with known steps
const progress = $.div({
    className: 'loading-progress',
    style: {
        width: `${percentage}%`,
        transition: 'width 0.3s ease'
    }
});
```

## Accessibility
- **ARIA Labels**: 
  - `aria-busy="true"` on container
  - `role="status"` for screen readers
  - `aria-live="polite"` for updates
- **Screen Reader**: Announces loading state
- **Keyboard**: Not interactive

## Performance
- **Render Strategy**: Minimal DOM impact
- **Updates**: Direct removal, no animation overhead
- **Memory**: Cleaned up immediately after use

## Connected Components
- **Parent**: 
  - Inscription viewers
  - Balance displays
  - Modal content areas
- **Children**: None
- **Events**: None

## Best Practices
1. **Always remove** when loading completes
2. **Provide context** - "Loading transactions..." vs generic "Loading..."
3. **Set timeout** - Remove or show error after reasonable time
4. **Position carefully** - Don't block important UI
5. **Keep it simple** - Text often suffices over complex animations

## Known Limitations
- No animated spinner (just text)
- No progress indication
- No cancel option
- Basic styling only
- No standardized component (inline implementations)

## Recommended Improvements
1. Create reusable LoadingIndicator component
2. Add spinner animation option
3. Implement progress bar variant
4. Add timeout handling
5. Standardize loading states across app