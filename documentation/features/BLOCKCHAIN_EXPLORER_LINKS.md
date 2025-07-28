# Blockchain Explorer Links

## Overview

MOOSH Wallet now includes enhanced blockchain explorer integration for transactions. Users can easily view transaction details on their preferred blockchain explorer, copy transaction IDs, and explore addresses with a single click.

## Implementation Details

### Files Modified
- `/public/js/modules/ui/transaction-history.js` - Added comprehensive explorer functionality

### Key Features

1. **Multiple Explorer Support**
   - Mempool.space (default)
   - Blockstream.info
   - Blockchain.com
   - BTC.com
   - User preference saved in localStorage

2. **Enhanced Transaction Display**
   - Transaction ID with copy button [⧉]
   - Address with explorer link [→]
   - Confirmation count with status indicator
   - Visual hint on hover: "View on explorer →"

3. **Quick Actions**
   - Click transaction to view on explorer
   - Copy transaction ID to clipboard
   - View address on explorer separately
   - Change preferred explorer from dropdown

4. **Visual Enhancements**
   - Confirmation status colors (green ✓ for 6+, orange ⏳ for pending)
   - Hover effects show explorer hint
   - Clear clickable areas with visual feedback
   - ASCII indicators for better accessibility

### Technical Implementation

1. **Explorer Configuration**
   ```javascript
   this.explorers = {
       mempool: {
           name: 'Mempool.space',
           url: 'https://mempool.space/tx/',
           addressUrl: 'https://mempool.space/address/'
       },
       blockstream: {
           name: 'Blockstream.info',
           url: 'https://blockstream.info/tx/',
           addressUrl: 'https://blockstream.info/address/'
       },
       blockchain: {
           name: 'Blockchain.com',
           url: 'https://www.blockchain.com/btc/tx/',
           addressUrl: 'https://www.blockchain.com/btc/address/'
       },
       btc: {
           name: 'BTC.com',
           url: 'https://btc.com/btc/transaction/',
           addressUrl: 'https://btc.com/btc/address/'
       }
   };
   ```

2. **Enhanced Transaction Item Display**
   - Transaction type and direction
   - Address with truncation and explorer link
   - Transaction ID with copy functionality
   - Amount with color coding
   - Time ago format
   - Confirmation count with status
   - Hover hint for explorer

3. **User Preferences**
   - Explorer preference saved to localStorage
   - Persists across sessions
   - Instant switching without reload
   - Visual notification on change

### User Experience

1. **Viewing Transactions**
   - Click anywhere on transaction row → Opens in explorer
   - Hover shows "View on explorer →" hint
   - New tab opens with transaction details

2. **Copying Transaction ID**
   - Click [⧉] button next to transaction ID
   - Shows success notification
   - Clipboard contains full transaction ID

3. **Viewing Addresses**
   - Click [→] next to address
   - Opens address page in explorer
   - Useful for tracking payment sources/destinations

4. **Changing Explorer**
   - Dropdown in transaction header
   - Changes apply immediately
   - Preference saved automatically
   - Notification confirms change

### Visual Indicators

```
Transaction Row:
┌─────────────────────────────────────────────────────┐
│ [↗] Sent                              -0.00125000 BTC│
│     bc1q...7x8k [→]                          2h ago │
│     TX: 3a4f...9b2c [⧉]                    ✓ 12 conf│
│                                    View on explorer →│
└─────────────────────────────────────────────────────┘

Legend:
[↗] = Sent transaction
[↙] = Received transaction
[→] = View address on explorer
[⧉] = Copy to clipboard
✓ = Confirmed (6+ confirmations)
⏳ = Pending (< 6 confirmations)
```

### CSS Styling

- Orange (#f57315) for explorer links and hints
- Green (#69fd97) for confirmed transactions
- Subtle opacity changes on hover
- Smooth transitions for all interactions
- ASCII symbols for universal compatibility

### Testing

#### Manual Testing Steps

1. **Basic Explorer Links**
   - Open Transaction History
   - Click on any transaction
   - Verify opens in new tab
   - Check correct explorer URL

2. **Explorer Selection**
   - Change explorer from dropdown
   - Click transaction
   - Verify uses new explorer
   - Refresh page - verify preference saved

3. **Copy Functionality**
   - Click [⧉] next to transaction ID
   - Check notification appears
   - Paste to verify copied correctly

4. **Address Links**
   - Click [→] next to address
   - Verify opens address page
   - Check correct explorer used

5. **Visual Feedback**
   - Hover over transaction
   - Verify hint appears
   - Check all hover states work
   - Verify confirmation colors

### Expected Behavior

- All links open in new tabs
- Preferences persist across sessions
- Copy works on all browsers
- Visual feedback is immediate
- No page reloads needed

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ All modern browsers

Note: Clipboard API requires HTTPS in production

## MCP Validation

The implementation passes all MCP checks:
- ✅ TestSprite - No direct external API calls
- ✅ Memory MCP - Proper event cleanup
- ✅ Security MCP - Safe URL construction

## Future Enhancements

1. **More Explorers** - Add OXT, Blockcypher, etc.
2. **Network Detection** - Auto-switch for testnet
3. **QR Codes** - Generate QR for addresses
4. **Deep Linking** - Link to specific outputs
5. **Explorer API** - Fetch additional data inline

## Troubleshooting

### Common Issues

1. **Links not working**
   - Check popup blocker settings
   - Verify explorer sites accessible
   - Check browser console for errors

2. **Copy not working**
   - Requires HTTPS in production
   - Check browser permissions
   - Try keyboard shortcut fallback

3. **Preferences not saving**
   - Check localStorage enabled
   - Clear browser data and retry
   - Check for browser extensions

## Security Considerations

1. **URL Construction** - All URLs properly escaped
2. **External Links** - Open in new tabs (no opener)
3. **Clipboard Access** - Uses secure API with fallback
4. **No Tracking** - No analytics on explorer usage