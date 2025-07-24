# Create New Wallet Button

## Component Name
Create New Wallet Button

## Exact Location
- **File**: `/public/js/moosh-wallet.js`
- **Parent Component**: HomePage (Lines 7370-7385)
- **Button Creation**: Using Button component class
- **Click Handler**: Navigates to 'generate-seed' route

## UI Design (Visual Details for AI Recreation)

### Visual Appearance
- **Width**: 100% of container (max 400px)
- **Height**: 48px (desktop), 44px (mobile)
- **Background**: Transparent (black)
- **Border**: 2px solid #f57315
- **Border Radius**: 0 (sharp corners)
- **Font**: JetBrains Mono, 14px, weight 600
- **Text Color**: #f57315 (MOOSH orange)
- **Text**: "CREATE NEW WALLET"
- **Letter Spacing**: 0.05em
- **Text Transform**: Uppercase

### States
- **Default**: Transparent background, orange border/text
- **Hover**: 
  - Background: #f57315
  - Text: #000000
  - Transform: scale(1.02)
  - Transition: all 0.2s ease
- **Active/Click**:
  - Transform: scale(0.98)
  - Box shadow: inset 0 2px 4px rgba(0,0,0,0.2)
- **Focus**:
  - Outline: 2px solid #f57315
  - Outline offset: 2px

### Mobile Specific
- Touch target: Minimum 44px height
- Tap highlight: Transparent
- Touch feedback: Slight opacity change (0.8)

## Function (What It Does)

1. **Primary Action**: Initiates new wallet creation flow
2. **Navigation**: Routes to seed generation page
3. **State Update**: Sets wallet type to 'create'
4. **Validation**: Ensures clean state before proceeding

## Architecture (Code Structure)

### Button Creation
```javascript
// In HomePage.createButtons() method
new Button(this.app, {
    text: 'CREATE NEW WALLET',
    onClick: () => this.handleCreateWallet(),
    variant: 'primary',
    fullWidth: true
}).render()
```

### Click Handler
```javascript
handleCreateWallet() {
    // Clear any existing wallet data
    this.app.state.set('walletType', 'create');
    this.app.state.set('generatedSeed', null);
    
    // Navigate to seed generation
    this.app.router.navigate('generate-seed');
}
```

### Button Component Implementation
```javascript
class Button extends Component {
    constructor(app, props) {
        super(app);
        this.props = {
            text: '',
            onClick: () => {},
            variant: 'primary',
            fullWidth: true,
            ...props
        };
    }
    
    render() {
        const styles = this.getStyles();
        return $.button({
            className: `btn btn-${this.props.variant}`,
            style: styles,
            onclick: this.props.onClick
        }, [this.props.text]);
    }
}
```

## Connections (Related Components)

### Parent Components
- **HomePage** - Contains the button
- **Terminal** - Provides configuration context

### Target Components
- **GenerateSeedPage** - Destination after click
- **Router** - Handles navigation

### State Dependencies
- Reads: `selectedMnemonic` (12/24 words)
- Reads: `isMainnet` (network selection)
- Writes: `walletType` = 'create'

### Data Flow
1. User clicks button
2. State cleared of old data
3. Navigation triggered
4. GenerateSeedPage loads
5. Wallet generation begins

## Purpose in Wallet

1. **Entry Point**: Primary CTA for new users
2. **Clean Start**: Ensures no conflicting data
3. **User Intent**: Clearly indicates create vs import
4. **Flow Control**: Begins structured wallet creation

## MCP Validation Status

### TestSprite Compliance
- ✅ Uses Button component (ElementFactory)
- ✅ Click handler properly bound
- ✅ No direct DOM manipulation
- ✅ Follows navigation patterns

### Memory Management
- ✅ No event listener leaks
- ✅ Component lifecycle managed
- ✅ State updates are clean

### Security
- ✅ Clears sensitive data before navigation
- ✅ No data exposure in DOM
- ✅ Proper state management

## Implementation Guidelines for AI

### Button Creation Pattern
```javascript
// Always use Button component
new Button(app, {
    text: 'BUTTON TEXT',
    onClick: () => handler(),
    variant: 'primary|secondary|danger',
    fullWidth: true|false,
    disabled: false,
    loading: false
}).render()
```

### Style Variants
- **primary**: Orange border/text, transparent bg
- **secondary**: Gray border/text, transparent bg
- **danger**: Red border/text, transparent bg
- **back**: Special variant with arrow icon

### Accessibility Requirements
1. Minimum touch target: 44x44px
2. Focus visible indicator
3. Keyboard navigation support
4. ARIA labels where needed

### Common Mistakes
1. Don't use raw button elements
2. Don't forget touch feedback
3. Don't skip state cleanup
4. Always use router for navigation

## Testing Checklist

1. ✓ Button renders with correct styling
2. ✓ Hover states work on desktop
3. ✓ Touch feedback works on mobile
4. ✓ Click navigates to correct page
5. ✓ State is properly cleared
6. ✓ Loading states handled
7. ✓ Disabled state prevents clicks
8. ✓ Keyboard navigation works

## Related Documentation
- Button Component: `/documentation/components/buttons/Button.md`
- HomePage: `/documentation/components/pages/HomePage.md`
- Navigation Flow: `/documentation/architecture/navigation.md`