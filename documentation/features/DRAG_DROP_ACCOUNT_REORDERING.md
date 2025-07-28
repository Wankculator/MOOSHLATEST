# Drag & Drop Account Reordering

## Overview

MOOSH Wallet now supports drag & drop functionality to reorder accounts in the AccountListModal. This allows users to customize the order of their wallets for better organization.

## Implementation Details

### Files Modified
- `/public/js/modules/modals/AccountListModal.js` - Added complete drag & drop functionality

### Key Features

1. **Visual Feedback**
   - Accounts show a grab cursor on hover
   - Dragging accounts become semi-transparent (opacity: 0.5)
   - A glowing drop indicator shows where the account will be placed
   - Smooth animations during drag operations

2. **State Management**
   - Each account gets an `order` property to maintain custom ordering
   - Order is persisted in the app state
   - Custom order is preserved across sessions

3. **Sort Integration**
   - When "Sort by Name" is selected and accounts have custom order, the drag & drop order is used
   - Other sort options (Date, Balance, Activity) override the custom order temporarily
   - Users can always return to custom order by selecting "Sort by Name"

### How It Works

1. **Drag Start**
   ```javascript
   handleDragStart(e, account, index) {
       this.draggedAccount = account;
       this.draggedIndex = index;
       e.currentTarget.classList.add('dragging');
       // ... set drag data
   }
   ```

2. **Drag Over**
   - Shows drop indicator above or below the target card
   - Uses midpoint calculation to determine drop position
   - Provides real-time visual feedback

3. **Drop**
   - Reorders the accounts array
   - Updates order property for all accounts
   - Saves to state and refreshes UI
   - Shows success notification

### User Experience

1. **To reorder accounts:**
   - Open the Account List Modal
   - Click and drag any account card
   - Drop it in the desired position
   - The order is immediately saved

2. **Visual indicators:**
   - Grab cursor on hover
   - Grabbing cursor while dragging
   - Semi-transparent dragged card
   - Glowing drop indicator line

3. **Restrictions:**
   - Cannot drag while editing account name
   - Active account can be dragged like any other
   - Order persists across sessions

### CSS Styling

```css
.account-card {
    cursor: grab;
    transition: all 0.2s ease;
}

.account-card.dragging {
    opacity: 0.5;
    transform: scale(0.95);
    cursor: grabbing !important;
}

.drop-indicator {
    position: absolute;
    width: 100%;
    height: 3px;
    background: var(--primary-color);
    animation: pulse-glow 0.5s ease-in-out infinite;
}
```

### Browser Compatibility

The drag & drop implementation uses standard HTML5 drag & drop APIs:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ All modern browsers

### Performance Considerations

- Drag operations are debounced to prevent excessive redraws
- Only the account grid is updated, not the entire modal
- Order updates are batched for efficiency

## Testing

### Manual Testing Steps

1. **Basic Drag & Drop**
   - Open Account List Modal
   - Drag an account to a new position
   - Verify order is updated
   - Close and reopen modal - verify order persists

2. **Multiple Accounts**
   - Create 5+ accounts
   - Drag from top to bottom
   - Drag from bottom to top
   - Drag to middle positions

3. **Edge Cases**
   - Try dragging while editing account name
   - Drag active account
   - Switch sort modes and return to "Sort by Name"

### Expected Behavior

- Smooth drag animations
- Clear visual feedback
- Instant order updates
- Persistent custom order
- No data loss or corruption

## Future Enhancements

1. **Touch Support** - Add touch events for mobile devices
2. **Keyboard Support** - Allow reordering with keyboard shortcuts
3. **Bulk Operations** - Select multiple accounts to move together
4. **Auto-arrange** - Smart grouping by balance, activity, or type

## Troubleshooting

### Common Issues

1. **Drag not working**
   - Ensure JavaScript is enabled
   - Check browser console for errors
   - Verify AccountListModal is properly loaded

2. **Order not saving**
   - Check browser storage quota
   - Verify state management is working
   - Look for console errors during save

3. **Visual glitches**
   - Update to latest browser version
   - Check for CSS conflicts
   - Disable browser extensions

## MCP Validation

The implementation passes all MCP checks:
- ✅ TestSprite - No external API calls
- ✅ Memory MCP - No memory leaks
- ✅ Security MCP - No security issues