# StatusIndicator

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:912-945, 5359-5374, 15298-15306
**Mobile Support**: Yes (responsive sizing)
**Theme Support**: Uses CSS variables

## Visual Design

```
Small Status Indicator:
┌─────────────────────────┐
│ Bitcoin Ready ●         │  <- Blinking dot
└─────────────────────────┘

Full Status Indicator:
┌─────────────────────────┐
│ ● Connected             │  <- Pulsing green dot
└─────────────────────────┘

States:
● Connected (green, pulsing)
● Syncing (yellow, spinning)
● Offline (red, static)
○ Disconnected (gray, static)
```

## Structure
- **Container**: `span.status-indicator` or `span.status-indicator-small`
- **Children**: 
  - Text content
  - Status dot (`span.blink` or animated element)
- **Layout**: Inline-flex, aligned items

## Styling
- **Base Classes**: 
  - `status-indicator` - Full size with pulse animation
  - `status-indicator-small` - Compact responsive version
  - `blink` - Blinking dot animation
- **Responsive**: 
  - Desktop: 8px font
  - Mobile (480px): 7px font
  - Small mobile (360px): 6px font
- **Animations**: 
  - Pulse (2s infinite opacity fade)
  - Blink (CSS animation)

## State Management
- **States**: 
  - Ready/Connected (green)
  - Active (with animations)
  - Inactive (no animations)
- **Updates**: 
  - Static after initial render
  - Color changes based on connection state

## Implementation
```javascript
// Small status indicator (responsive)
createStatusIndicator() {
    return $.span({ 
        className: 'status-indicator-small',
        style: { 
            color: 'var(--text-primary)'
        }
    }, [
        'Bitcoin Ready ',
        $.span({
            className: 'blink',
            style: { 
                color: 'var(--text-primary)'
            }
        }, ['●'])
    ]);
}

// Full status indicator with pulse
<span class="status-indicator">● Connected</span>
```

## CSS Requirements
```css
/* Small responsive version */
.status-indicator-small {
    color: #009f6b;
    font-size: clamp(6px, 1.2vw, 8px) !important;
    line-height: 1.2;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 1px;
    flex-shrink: 0;
    position: relative;
    float: right;
    clear: both;
    margin-top: 4px;
    margin-right: 8px;
    z-index: 5;
    padding: 2px 4px;
}

/* Full version with animation */
.status-indicator {
    color: #00ff00;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Blinking dot */
.blink {
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 50%, 100% { opacity: 1; }
    25%, 75% { opacity: 0; }
}

/* Responsive sizing */
@media (max-width: 479px) {
    .status-indicator-small {
        font-size: clamp(5px, 1vw, 7px) !important;
        margin-top: 3px;
        margin-right: 6px;
        padding: 1px 3px;
    }
}

@media (max-width: 360px) {
    .status-indicator-small {
        font-size: clamp(4px, 0.8vw, 6px) !important;
        margin-top: 2px;
        margin-right: 4px;
    }
}
```

## Usage Patterns
1. **Connection Status**
   ```javascript
   // Show network connection state
   <span class="status-indicator">● Connected</span>
   ```

2. **Feature Ready State**
   ```javascript
   // Indicate feature availability
   createStatusIndicator() // "Bitcoin Ready ●"
   ```

3. **Sync Status**
   ```javascript
   // Show synchronization progress
   <span class="status-indicator syncing">⟳ Syncing...</span>
   ```

## Variations

### Color States
- **Green (#00ff00)**: Connected, ready, active
- **Yellow (#ffff00)**: Syncing, processing
- **Red (#ff0000)**: Error, offline
- **Gray (#666666)**: Disconnected, inactive

### Animation States
- **Pulse**: Active connection
- **Blink**: Activity/updates
- **Spin**: Processing/syncing
- **Static**: Inactive/error

## Accessibility
- **ARIA Labels**: 
  - `role="status"` for dynamic updates
  - `aria-live="polite"` for changes
  - `aria-label` with full status text
- **Screen Reader**: 
  - Announces status changes
  - Describes current state
- **Color Independence**: 
  - Uses text alongside color
  - Icons provide additional context

## Performance
- **Render Strategy**: Lightweight inline elements
- **Updates**: CSS animations (GPU accelerated)
- **Memory**: Minimal DOM footprint

## Connected Components
- **Parent**: 
  - Header navigation
  - Wallet setup screens
  - Dashboard sections
- **Children**: Text and dot elements
- **Events**: None (presentational only)

## Best Practices
1. **Always include text** with color indicators
2. **Keep animations subtle** to avoid distraction
3. **Position consistently** across views
4. **Use semantic colors** (green=good, red=bad)
5. **Ensure sufficient contrast** for visibility

## Mobile Considerations
- Responsive font sizing with clamp()
- Touch-friendly padding on mobile
- Positioned to avoid blocking content
- Scales with viewport for readability
- Maintains visibility at all screen sizes

## Common Patterns
```javascript
// Dynamic status updates
function updateStatus(isConnected) {
    const indicator = document.querySelector('.status-indicator');
    if (isConnected) {
        indicator.textContent = '● Connected';
        indicator.style.color = '#00ff00';
    } else {
        indicator.textContent = '○ Disconnected';
        indicator.style.color = '#666666';
    }
}

// Activity indicator
function showActivity() {
    const dot = document.querySelector('.status-dot');
    dot.classList.add('blink');
    setTimeout(() => dot.classList.remove('blink'), 2000);
}
```