# DetailRow

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:24391-24447
**Mobile Support**: Yes (responsive)
**Theme Support**: Uses CSS variables

## Visual Design

```
Standard Row:
┌─────────────────────────────────────────┐
│ Label                          Value    │
└─────────────────────────────────────────┘

With Tooltip:
┌─────────────────────────────────────────┐
│ Label ⓘ                   0.00234 BTC  │
└─────────────────────────────────────────┘
        ↑ Hover shows tooltip

Important Row (bold):
┌─────────────────────────────────────────┐
│ Total Balance              1.2345 BTC   │
└─────────────────────────────────────────┘
```

## Structure
- **Container**: `div` with flex layout
- **Children**: 
  - Label span (with optional info icon)
  - Value span (right-aligned)
- **Layout**: Flexbox, space-between

## Styling
- **Base Classes**: None (inline styles)
- **Responsive**: 
  - Desktop: 12px font, calc() based
  - Mobile: 11px font, fixed sizes
- **Hover Effect**: Light background on tooltip rows

## State Management
- **States**: 
  - Normal
  - Important (bold styling)
  - Hover (with tooltip)
- **Updates**: Static after render

## Implementation
```javascript
createDetailRow(label, value, valueColor = 'var(--text-primary)', isImportant = false, tooltip = '') {
    const $ = window.ElementFactory || ElementFactory;
    const isMobile = window.innerWidth <= 768;
    
    return $.div({
        style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '4px 0' : 'calc(4px * var(--scale-factor)) 0',
            borderRadius: '0',
            transition: 'background 0.2s ease',
            cursor: tooltip ? 'help' : 'default'
        },
        title: tooltip,
        onmouseover: !isMobile && tooltip ? (e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 66, 0.05)';
        } : null,
        onmouseout: !isMobile && tooltip ? (e) => {
            e.currentTarget.style.background = 'transparent';
        } : null
    }, [
        // Label with optional info icon
        $.span({
            style: {
                color: isImportant ? 'var(--text-secondary)' : 'var(--text-dim)',
                fontSize: isMobile ? '11px' : 'calc(12px * var(--scale-factor))',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: isImportant ? '600' : '500'
            }
        }, [
            label,
            tooltip && $.span({
                style: {
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    opacity: '0.7'
                }
            }, ['ⓘ'])
        ]),
        // Value
        $.span({
            style: {
                color: valueColor,
                fontSize: isMobile ? (isImportant ? '12px' : '11px') : 
                         `calc(${isImportant ? 13 : 12}px * var(--scale-factor))`,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: isImportant ? '700' : '600',
                textAlign: 'right',
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }
        }, [value])
    ]);
}
```

## Usage Patterns
```javascript
// Basic detail row
createDetailRow('Network Fee', '0.00012 BTC')

// With custom color
createDetailRow('Profit', '+0.5 BTC', '#00ff00')

// Important row (bold)
createDetailRow('Total Balance', '1.2345 BTC', 'var(--text-primary)', true)

// With tooltip
createDetailRow(
    'Confirmations', 
    '3/6', 
    'var(--text-warning)', 
    false, 
    'Transaction requires 6 confirmations'
)
```

## Parameters
1. **label** (string) - Left-aligned label text
2. **value** (string) - Right-aligned value text
3. **valueColor** (string) - CSS color for value (default: primary text)
4. **isImportant** (boolean) - Bold styling for important rows
5. **tooltip** (string) - Hover tooltip text (shows info icon)

## CSS Variables Used
- `--text-primary`: Default value color
- `--text-secondary`: Important label color
- `--text-dim`: Normal label color
- `--scale-factor`: Responsive scaling

## Accessibility
- **Title Attribute**: Native tooltip support
- **Cursor Style**: 'help' cursor for tooltip rows
- **Color Contrast**: Uses theme variables
- **Mobile Support**: Touch-friendly, no hover effects

## Performance
- **Render Strategy**: Single render, no updates
- **Hover Effects**: CSS transitions only
- **Text Overflow**: Ellipsis for long values

## Connected Components
- **Parent**: 
  - Transaction details
  - Wallet information panels
  - Settings displays
- **Children**: Text spans only
- **Events**: Hover events for tooltips

## Best Practices
1. **Keep labels concise** but descriptive
2. **Format values appropriately** (BTC decimals, dates)
3. **Use tooltips sparingly** for complex info
4. **Apply importance** only to totals/key values
5. **Consider mobile** - test tooltip visibility

## Common Use Cases
```javascript
// Transaction details
createDetailRow('Status', 'Confirmed', '#00ff00')
createDetailRow('Fee', '0.00012 BTC')
createDetailRow('Time', '2 hours ago')

// Wallet summary
createDetailRow('Available', '0.5 BTC', 'var(--text-primary)', true)
createDetailRow('Pending', '0.1 BTC', '#ffaa00')
createDetailRow('Total', '0.6 BTC', 'var(--text-primary)', true)

// Settings display
createDetailRow('Version', 'v2.1.0', 'var(--text-dim)')
createDetailRow('Network', 'Mainnet', '#00ff00')
```

## Mobile Considerations
- Fixed font sizes on mobile (11-12px)
- No hover effects on touch devices
- Responsive padding (4px on mobile)
- Value truncation with ellipsis
- Touch-friendly row height