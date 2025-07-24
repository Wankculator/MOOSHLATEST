# HomePage Component

## Component Name
HomePage

## Exact Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 6986-7437
- **Class Definition**: `class HomePage extends Component`

## UI Design (Visual Details for AI Recreation)

### Layout Structure
- Full-screen dark background (#000000)
- Centered card container with 32px border radius
- Maximum width of 600px
- Padding: 48px (desktop) / 24px (mobile)

### Title Section
- **Text**: "MOOSH WALLET"
- **Font**: JetBrains Mono, 32px, weight 700
- **Color**: #f57315 (MOOSH orange)
- **Alignment**: Center
- **Margin Bottom**: 8px

### Subtitle Section
- **Text**: "Professional Bitcoin & Spark Protocol Wallet"
- **Font**: JetBrains Mono, 16px, weight 400
- **Color**: #888888 (dim gray)
- **Alignment**: Center
- **Margin Bottom**: 32px

### Address Types Display
- Grid layout with 2 columns on desktop, 1 on mobile
- Each address type in a bordered box:
  - Border: 1px solid #333333
  - Background: #0a0a0a
  - Padding: 16px
  - Border radius: 8px
- Address types shown:
  - SEGWIT (bc1...)
  - TAPROOT (bc1p...)
  - LEGACY (1...)
  - NESTED SEGWIT (3...)
  - SPARK (lnsp1...)
- Each shows example address format

### Terminal Section
- Embedded Terminal component
- Radio buttons for 12/24 word selection
- Network toggle (Mainnet/Testnet)

### Action Buttons
- Two primary buttons stacked vertically
- **Create New Wallet** button:
  - Full width
  - Background: transparent
  - Border: 2px solid #f57315
  - Color: #f57315
  - Hover: Background becomes #f57315, text becomes #000000
- **Import Existing Wallet** button:
  - Same styling as Create button
  - Positioned below with 16px gap

## Function (What It Does)

1. **Entry Point**: First screen users see when opening MOOSH Wallet
2. **User Options**: Presents two primary paths:
   - Create a new wallet (generates new seed phrase)
   - Import existing wallet (recover from seed phrase)
3. **Configuration**: Allows users to select:
   - Seed phrase length (12 or 24 words)
   - Network (Mainnet or Testnet)
4. **Education**: Shows all supported address types with examples

## Architecture (Code Structure)

```javascript
class HomePage extends Component {
    render() {
        // Creates main card container
        const card = $.div({ className: 'card' }, [
            this.createTitle(),
            this.createAddressTypes(),
            new Terminal(this.app, { radioSection: true, showNetworkToggle: true }).render(),
            this.createButtons()
        ]);
        
        // Returns full page layout
        return $.div({ className: 'container' }, [
            new Header(this.app).render(),
            $.div({ className: 'content' }, [card])
        ]);
    }
    
    createTitle() { /* Title and subtitle creation */ }
    createAddressTypes() { /* Address type grid */ }
    createButtons() { /* Action buttons */ }
}
```

## Connections (Related Components)

### Parent Components
- **MooshWallet** (main app) - Instantiates HomePage
- **Navigator** - Routes to HomePage when navigation state is 'home'

### Child Components
- **Header** - Top navigation bar
- **Terminal** - Configuration section with radio buttons
- **Button** - Reusable button components

### Navigation Targets
- **GenerateSeedPage** - When "Create New Wallet" clicked
- **ImportSeedPage** - When "Import Existing Wallet" clicked

## Purpose in Wallet

1. **User Onboarding**: Primary entry point for new and returning users
2. **Path Selection**: Directs users to appropriate wallet creation flow
3. **Configuration**: Sets initial wallet parameters before creation
4. **Education**: Introduces users to different Bitcoin address types

## MCP Validation Status

### TestSprite Compliance
- ✅ Uses ElementFactory for all DOM creation
- ✅ No direct external API calls
- ✅ Proper event handler cleanup
- ✅ State management through app.state

### Memory Management
- ✅ Event listeners properly managed
- ✅ No memory leaks detected
- ✅ Components cleaned up on navigation

### Security
- ✅ No sensitive data stored
- ✅ No innerHTML usage
- ✅ Input validation in place

## Backtrack Info (Git Commands)

### View Original Implementation
```bash
git show 7b831715:public/js/moosh-wallet.js | grep -A 450 "class HomePage"
```

### Find All References
```bash
git grep "HomePage" --line-number
```

### View History
```bash
git log -p --follow -S "class HomePage" -- public/js/moosh-wallet.js
```

### Restore If Broken
```bash
git checkout 7b831715 -- public/js/moosh-wallet.js
# Then extract HomePage section
```

## Implementation Notes for AI

### Key Patterns to Follow
1. Always use `$.div()` not `document.createElement()`
2. Pass `this.app` to all child components
3. Use `this.app.navigate()` for navigation
4. Access state via `this.app.state.get()`

### Common Pitfalls to Avoid
1. Don't use jQuery or direct DOM manipulation
2. Don't forget to pass app instance to components
3. Don't hardcode URLs or paths
4. Always check responsive breakpoints

### Testing Checklist
1. Verify both buttons navigate correctly
2. Check Terminal radio selection persists
3. Ensure network toggle updates state
4. Test on mobile viewport (375px width)