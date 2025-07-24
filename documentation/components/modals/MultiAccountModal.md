# MultiAccountModal Component Documentation

## Overview
The MultiAccountModal provides comprehensive multi-account management functionality, allowing users to create, import, switch between, rename, and delete wallet accounts. It features a terminal-style interface and supports wallet type detection for imported accounts.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 16053-17086
- **Class Definition**: `class MultiAccountModal`

## Visual Design

### ASCII Layout - Main View
```
┌─────────────────────────────────────────────────────────┐
│ ~/moosh/accounts $                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your Accounts                                          │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Account 1 (Active)                    [Rename][X]  │  │
│  │ Created: 2024-01-15                               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Trading Account                       [Rename][X]  │  │
│  │ Created: 2024-01-20                               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Hardware Import                       [Rename][X]  │  │
│  │ Created: 2024-02-01                               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [+ Create New Account] [Import Account] [Close]       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ASCII Layout - Create Account View
```
┌─────────────────────────────────────────────────────────┐
│ ~/moosh/accounts $                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Create New Account                                     │
│                                                         │
│  Account Name                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Account 3                                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│        [Create Account]        [Cancel]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ASCII Layout - Import Account View
```
┌─────────────────────────────────────────────────────────┐
│ ~/moosh/accounts $                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Import Account                                         │
│                                                         │
│  Account Name                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Imported 1                                        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Seed Phrase                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Enter your 12 or 24 word seed phrase             │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│        [Import Account]        [Cancel]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Specifications
- **Max Width**: 600px
- **Width**: 90% of viewport
- **Background**: var(--bg-primary)
- **Border**: 1px solid #f57315 (orange theme)
- **Terminal Header**: Classic terminal style
- **Z-Index**: 10000 (highest priority)

## Constructor

```javascript
class MultiAccountModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.isCreating = false;
        this.isImporting = false;
    }
}
```

## Key Methods

### show()
**Location**: Lines 16061-16130
Main method that displays the modal and handles view switching.

```javascript
show() {
    // Clean up any existing modals
    if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
        this.modal = null;
    }
    
    const $ = window.ElementFactory || ElementFactory;
    const accounts = this.app.state.get('accounts') || [];
    const currentAccountId = this.app.state.get('currentAccountId');
    
    this.modal = $.div({
        className: 'modal-overlay',
        // ... modal creation
    }, [
        $.div({
            className: 'terminal-box',
            // ... terminal styling
        }, [
            // Terminal header
            $.div({ className: 'terminal-header' }, [
                $.span({}, ['~/moosh/accounts $ '])
            ]),
            // Dynamic content based on state
            $.div({ className: 'terminal-content' }, [
                this.isCreating ? this.createNewAccountForm() :
                this.isImporting ? this.createImportForm() :
                $.div({}, [
                    this.createAccountList(accounts, currentAccountId),
                    this.createActions()
                ])
            ])
        ])
    ]);
    
    document.body.appendChild(this.modal);
}
```

### createAccountItem(account, isActive)
**Location**: Lines 16147-16231
Creates individual account display items with action buttons.

```javascript
createAccountItem(account, isActive) {
    return $.div({
        style: {
            padding: '15px',
            border: `1px solid ${isActive ? '#f57315' : '#333'}`,
            marginBottom: '10px',
            cursor: 'pointer',
            background: isActive ? 'rgba(245, 115, 21, 0.1)' : 'transparent',
            transition: 'all 0.2s ease'
        },
        onclick: async () => {
            if (!isActive) {
                // Switch account logic
                const switched = this.app.state.switchAccount(account.id);
                if (switched) {
                    this.app.showNotification(`Switched to ${account.name}`, 'success');
                    this.close();
                    // Trigger UI updates
                }
            }
        }
    }, [
        // Account info and action buttons
    ]);
}
```

### handleCreateAccount()
**Location**: Lines 16363-16407
Handles new account creation with seed generation.

```javascript
async handleCreateAccount() {
    const nameInput = document.getElementById('newAccountName');
    const name = nameInput.value.trim();
    
    if (!name) {
        this.app.showNotification('Please enter an account name', 'error');
        return;
    }
    
    try {
        this.app.showNotification('Generating new wallet...', 'info');
        
        // Generate new seed
        const response = await this.app.apiService.generateSparkWallet(12);
        const mnemonic = response.data.mnemonic;
        
        // Create account
        await this.app.state.createAccount(name, mnemonic, false);
        
        this.app.showNotification(`Account "${name}" created successfully`, 'success');
        this.isCreating = false;
        this.close();
        this.app.router.render();
    } catch (error) {
        this.app.showNotification('Failed to create account: ' + error.message, 'error');
    }
}
```

### handleImportAccount()
**Location**: Lines 16409-16458
Handles account import with wallet type detection.

```javascript
async handleImportAccount() {
    const nameInput = document.getElementById('importAccountName');
    const seedInput = document.getElementById('importSeedPhrase');
    const name = nameInput.value.trim();
    const seed = seedInput.value.trim();
    
    // Validation
    const words = seed.split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
        this.app.showNotification('Seed phrase must be 12 or 24 words', 'error');
        return;
    }
    
    try {
        this.showImportLoadingScreen();
        
        // Use WalletDetector for wallet type detection
        const detector = new WalletDetector(this.app);
        const detection = await detector.detectWalletType(seed);
        
        if (detection.detected && detection.activePaths.length > 0) {
            // Show detection results
            this.showDetectionResults(detection, name, seed);
        } else {
            // Import as new MOOSH wallet
            await this.app.state.createAccount(name, seed, true, 'moosh', null);
            this.app.showNotification(`Account "${name}" imported successfully`, 'success');
            this.close();
        }
    } catch (error) {
        this.app.showNotification('Failed to import account: ' + error.message, 'error');
    }
}
```

## Modal States

### Main View (Default)
Shows list of existing accounts with these features:
- Account switching on click
- Active account highlighting
- Rename and delete buttons
- Create/Import/Close actions

### Create Account View
Displayed when `isCreating = true`:
- Account name input (auto-incremented default)
- Create Account button
- Cancel button returns to main view

### Import Account View
Displayed when `isImporting = true`:
- Account name input
- Seed phrase textarea
- Validation for 12/24 words
- Import Account button
- Cancel button returns to main view

## Account Management Features

### Account Switching
- Click any non-active account to switch
- Clears cached data for proper refresh
- Updates UI automatically
- Shows success notification

### Account Actions
- **Rename**: Opens rename dialog (method not shown)
- **Delete**: Removes account (disabled if only one exists)
- **Create New**: Generates fresh seed phrase
- **Import**: Supports wallet type detection

## Wallet Type Detection

### Detection Process
1. Uses WalletDetector class
2. Checks multiple derivation paths
3. Identifies wallet provider (Xverse, Leather, etc.)
4. Shows selection dialog if multiple types detected

### Wallet Selection Dialog
**Location**: Lines 16460-16599
```javascript
showWalletSelectionDialog(accountName, mnemonic, variants) {
    // Creates dialog with wallet type options
    // Each option shows:
    // - Wallet provider name
    // - Detected addresses
    // - Special notes (e.g., Xverse Ordinals)
}
```

## Styling Details

### Terminal Theme
- Terminal header with command prompt
- Monospace font throughout
- Sharp corners (border-radius: 0)
- Orange accent color (#f57315)

### Interactive Elements
- Hover effects on accounts and buttons
- Active account has orange border and background
- Smooth transitions (0.2s ease)

### Form Styling
- Inputs have focus border color change
- Consistent padding and spacing
- Error states shown via notifications

## State Management

### Internal State
- `isCreating`: Boolean for create form display
- `isImporting`: Boolean for import form display
- `modal`: DOM reference

### App State Integration
- Reads: accounts, currentAccountId
- Writes: createAccount, switchAccount
- Clears: walletData on switch

## Error Handling

### Validation Errors
- Empty account name
- Invalid seed phrase length
- Missing form inputs

### API Errors
- Wallet generation failures
- Import detection failures
- Account creation failures

### User Feedback
- Info notifications during processing
- Success messages on completion
- Error messages with details

## Security Considerations

1. **Seed Phrase Handling**
   - Not stored in component state
   - Cleared after successful import
   - Validated before processing

2. **Account Switching**
   - Clears sensitive cached data
   - Verifies switch success
   - Updates all UI components

3. **Modal Cleanup**
   - Removes existing modals before creating new
   - Cleans up orphaned modals
   - Proper event handler cleanup

## Integration Points

### API Calls
- `app.apiService.generateSparkWallet(12)`: New seed generation
- `WalletDetector.detectWalletType(seed)`: Import detection

### State Updates
- `app.state.createAccount()`: New account creation
- `app.state.switchAccount()`: Account switching
- `app.router.render()`: UI refresh

### Notifications
- Info: Processing states
- Success: Completed actions
- Error: Failure messages

## Usage Examples

### Opening the Modal
```javascript
// From dashboard
toggleAccountDropdown() {
    const modal = new MultiAccountModal(this.app);
    modal.show();
}

// For new account
handleAddAccount() {
    const modal = new MultiAccountModal(this.app);
    modal.show();
}
```

### Direct State Setting
```javascript
// Open directly to create form
const modal = new MultiAccountModal(this.app);
modal.isCreating = true;
modal.show();

// Open directly to import form
const modal = new MultiAccountModal(this.app);
modal.isImporting = true;
modal.show();
```

## Best Practices

1. **Always clean up** existing modals before showing
2. **Validate inputs** before API calls
3. **Show loading states** during async operations
4. **Clear sensitive data** after use
5. **Handle all error cases** with user feedback
6. **Test account switching** thoroughly
7. **Verify UI updates** after state changes