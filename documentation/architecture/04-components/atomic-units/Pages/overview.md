# Page Components Overview

## Page Component Architecture

All page components in MOOSH Wallet extend the base Component class and follow a consistent pattern for rendering, state management, and lifecycle handling.

## Page Components List

### 1. **HomePage** 
- **Route**: `#home`
- **Purpose**: Landing page with wallet creation/import options
- **Key Features**:
  - Create new wallet button
  - Import existing wallet button
  - Terminal-style interface
  - ASCII art branding

### 2. **GenerateSeedPage**
- **Route**: `#generate-seed`
- **Purpose**: Generate new 12/24 word mnemonic seed phrase
- **Key Features**:
  - Word count selection (12/24)
  - Network selection (Mainnet/Testnet)
  - Secure seed generation
  - Copy functionality
  - Warning messages

### 3. **ConfirmSeedPage**
- **Route**: `#confirm-seed`
- **Purpose**: Verify user has saved seed phrase correctly
- **Key Features**:
  - Random word verification
  - Drag-and-drop word selection
  - Security validation
  - Progress tracking

### 4. **ImportSeedPage**
- **Route**: `#import-seed`
- **Purpose**: Import existing wallet from seed phrase
- **Key Features**:
  - Multi-word input support (12/24)
  - Wallet type selection
  - BIP39 validation
  - Password setting
  - Import from backup

### 5. **WalletCreatedPage**
- **Route**: `#wallet-created`
- **Purpose**: Success confirmation after wallet creation
- **Key Features**:
  - Success animation
  - Security reminders
  - Navigation to dashboard
  - Wallet details preview

### 6. **WalletImportedPage**
- **Route**: `#wallet-imported`
- **Purpose**: Success confirmation after wallet import
- **Key Features**:
  - Import summary
  - Account information
  - Balance display (if available)
  - Dashboard navigation

### 7. **WalletDetailsPage**
- **Route**: `#wallet-details?type=[bitcoin|segwit|taproot|legacy|spark]`
- **Purpose**: Display wallet addresses and QR codes
- **Key Features**:
  - Address display by type
  - QR code generation
  - Copy to clipboard
  - Address derivation info
  - Export functionality

### 8. **DashboardPage**
- **Route**: `#dashboard`
- **Purpose**: Main wallet interface with full functionality
- **Key Features**:
  - Balance display
  - Transaction history
  - Send/Receive buttons
  - Multi-account management
  - Token operations
  - Ordinals gallery
  - Settings access

## Common Page Patterns

### Base Structure
```javascript
class PageName extends Component {
    constructor(app) {
        super(app);
        // Initialize page-specific properties
    }
    
    render() {
        // Return page DOM structure
        return $.div({ className: 'page-container' }, [
            this.renderHeader(),
            this.renderContent(),
            this.renderFooter()
        ]);
    }
    
    afterMount() {
        // Setup event listeners
        // Start data fetching
        // Initialize interactive elements
    }
    
    destroy() {
        // Clean up timers
        // Remove global listeners
        super.destroy();
    }
}
```

### State Integration
All pages integrate with StateManager for:
- User preferences
- Wallet data
- Navigation state
- Session information

### Security Considerations
- Password protection enforcement
- Secure data handling
- Session validation
- Input sanitization

### Responsive Design
- Mobile-first approach
- Touch-optimized interactions
- Viewport scaling
- Adaptive layouts

## Page Lifecycle

1. **Route Change** → Router identifies page
2. **Instantiation** → `new PageClass(app)`
3. **Rendering** → `render()` creates DOM
4. **Mounting** → `mount()` attaches to container
5. **Initialization** → `afterMount()` runs
6. **Updates** → State changes trigger updates
7. **Cleanup** → `destroy()` on navigation away

## Navigation Flow

```
HomePage
    ├── GenerateSeedPage → ConfirmSeedPage → WalletCreatedPage → DashboardPage
    └── ImportSeedPage → WalletImportedPage → DashboardPage
                                                      ↓
                                            WalletDetailsPage
```

## Performance Considerations

- Pages are created fresh on each navigation
- No page instance caching
- DOM is completely replaced
- State listeners cleaned up properly
- Memory leaks prevented via destroy()

## Testing Approach

Each page should be tested for:
1. Render without errors
2. State management integration
3. User interaction handling
4. Navigation flow
5. Error states
6. Responsive behavior
7. Memory cleanup