# Bulk Account Operations (Multi-Select)

## Overview

MOOSH Wallet now supports bulk operations on multiple accounts through a multi-select interface. Users can select multiple accounts and perform batch operations like export, color changes, and deletion.

## Implementation Details

### Files Modified
- `/public/js/modules/modals/AccountListModal.js` - Added complete multi-select functionality

### Key Features

1. **Multi-Select Mode**
   - Toggle button in toolbar to enable/disable
   - Visual checkboxes appear on all account cards
   - Selected accounts highlighted with border and background

2. **Selection Methods**
   - **Click**: Select/deselect single account
   - **Ctrl/Cmd + Click**: Toggle individual selection
   - **Shift + Click**: Select range of accounts
   - **Clear Selection**: Button to deselect all

3. **Bulk Operations**
   - **Export**: Export multiple accounts to single JSON file
   - **Change Color**: Apply same color to all selected accounts
   - **Delete**: Remove multiple accounts at once
   - Protection against deleting all accounts

4. **Visual Feedback**
   - Checkboxes show selection state
   - Selected cards have distinctive styling
   - Bulk actions bar appears at bottom when accounts selected
   - Count of selected accounts displayed

### Technical Implementation

1. **State Management**
   ```javascript
   // Multi-select state
   this.isMultiSelectMode = false;
   this.selectedAccounts = new Set();
   this.lastSelectedIndex = null;
   ```

2. **Selection Logic**
   - Uses Set for efficient selection tracking
   - Supports standard OS selection patterns
   - Maintains last selected index for range selection

3. **Bulk Actions Bar**
   - Fixed position at bottom of modal
   - Only visible when accounts selected
   - Responsive button layout

### User Experience

1. **Enabling Multi-Select**
   - Click "MULTI-SELECT" button in toolbar
   - Checkboxes appear on all cards
   - Drag & drop disabled in this mode

2. **Selecting Accounts**
   - Click checkbox or card to select
   - Use keyboard modifiers for advanced selection
   - Visual feedback immediate

3. **Performing Operations**
   - Select desired accounts
   - Choose operation from bulk actions bar
   - Confirmation dialogs for destructive actions

### CSS Styling

```css
/* Selected account styling */
.account-card.selected {
    border-color: var(--primary-color) !important;
    background: var(--primary-color)20 !important;
    box-shadow: 0 0 0 2px var(--primary-color);
}

/* Checkbox styling */
.account-card .select-checkbox {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 20px;
    height: 20px;
    border: 2px solid var(--primary-color);
    background: #000;
}

/* Bulk actions bar */
.bulk-actions-bar {
    position: fixed;
    bottom: 20px;
    background: #000;
    border: 2px solid var(--primary-color);
    padding: 15px 20px;
}
```

### Export Format

Bulk exports use the following JSON structure:
```json
{
    "version": "2.0",
    "exportDate": "2024-01-26T12:00:00Z",
    "accounts": [
        {
            "name": "Account 1",
            "mnemonic": "...",
            "createdAt": "...",
            "type": "HD Wallet",
            "color": "#f57315",
            "order": 0
        }
    ]
}
```

### Safety Features

1. **Delete Protection**
   - Cannot delete all accounts
   - Confirmation dialog required
   - Automatic account switching if current deleted

2. **Data Preservation**
   - Export includes all account data
   - Mnemonics included for recovery
   - Timestamped exports

3. **State Consistency**
   - Selection cleared after operations
   - UI updates immediately
   - No orphaned selections

## Testing

### Manual Testing Steps

1. **Basic Multi-Select**
   - Open Account List Modal
   - Click "MULTI-SELECT" button
   - Select 2-3 accounts
   - Verify checkboxes and styling

2. **Range Selection**
   - Enable multi-select
   - Click first account
   - Shift+click last account
   - Verify all in-between selected

3. **Bulk Export**
   - Select multiple accounts
   - Click "EXPORT" in actions bar
   - Verify JSON file downloaded
   - Check file contains all selected accounts

4. **Bulk Color Change**
   - Select 3+ accounts
   - Click "CHANGE COLOR"
   - Select a color
   - Verify all accounts updated

5. **Bulk Delete**
   - Create test accounts
   - Select multiple (not all)
   - Click "DELETE"
   - Confirm dialog
   - Verify accounts removed

### Expected Behavior

- Smooth selection animations
- No lag with many accounts
- Clear visual feedback
- Proper keyboard support
- Safe deletion process

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ All modern browsers

## Keyboard Shortcuts

- **Click**: Toggle single selection
- **Ctrl/Cmd + Click**: Add/remove from selection
- **Shift + Click**: Select range
- **Ctrl/Cmd + A**: Select all (when implemented)
- **Escape**: Clear selection (when implemented)

## MCP Validation

The implementation passes all MCP checks:
- ✅ TestSprite - No external API calls
- ✅ Memory MCP - Proper cleanup, no leaks
- ✅ Security MCP - No security issues

## Future Enhancements

1. **Select All/None** - Keyboard shortcuts and buttons
2. **Smart Selection** - Select by criteria (balance, date, etc.)
3. **Bulk Import** - Import multiple accounts from file
4. **Group Operations** - Create account groups
5. **Batch Transactions** - Send from multiple accounts

## Troubleshooting

### Common Issues

1. **Checkboxes not appearing**
   - Ensure multi-select mode is enabled
   - Check browser console for errors
   - Verify CSS loaded correctly

2. **Selection not working**
   - Click on card body, not buttons
   - Check if drag mode is active
   - Disable browser extensions

3. **Bulk operations failing**
   - Ensure accounts are selected
   - Check for network issues
   - Verify sufficient permissions

## Security Considerations

1. **Export Security**
   - Exports contain mnemonics
   - Files should be encrypted externally
   - Store exports securely

2. **Deletion Safety**
   - Always backs up before bulk delete
   - Confirmation required
   - No undo functionality

3. **Color Changes**
   - Purely cosmetic
   - No security impact
   - Persisted to state