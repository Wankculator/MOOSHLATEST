# ImportWalletModal Documentation

## Overview
The ImportWalletModal allows users to import existing wallets using seed phrases (mnemonic words). It's a critical security component that handles sensitive wallet recovery data with proper validation and security measures.

## Location in Codebase
- **File**: `/public/js/moosh-wallet.js`
- **Note**: Import functionality is integrated into the wallet creation flow rather than a standalone modal
- **Related**: Look for "import" functionality in WelcomePage and wallet creation flows
- **Security**: Password-protected import process

## Component Structure

### Modal Container
The import modal follows the standard MOOSH modal pattern:
```javascript
const overlay = $.div({ 
    className: 'modal-overlay',
    onclick: (e) => {
        if (e.target.className === 'modal-overlay') {
            this.closeModal();
        }
    }
})
```

### Modal Dimensions and Styling
- **Container Class**: `modal-container import-wallet-modal`
- **Width**: 600px maximum
- **Height**: Auto-adjusting
- **Background**: `var(--bg-primary)`
- **Border**: 2px solid theme color
- **Padding**: 32px

## Modal Sections

### 1. Header Section
```javascript
$.div({ className: 'modal-header' }, [
    $.h2({ className: 'modal-title' }, [
        $.span({ className: 'text-dim' }, ['<']),
        ' Import Wallet ',
        $.span({ className: 'text-dim' }, ['/>'])
    ]),
    $.button({
        className: 'modal-close',
        onclick: () => this.closeModal()
    }, ['×'])
])
```

### 2. Import Method Selection
Radio button options:
1. **Seed Phrase** (Default)
   - 12 or 24 word mnemonic
   - BIP39 standard
   
2. **Private Key** (Optional)
   - WIF format
   - Hex format
   
3. **Hardware Wallet** (Future)
   - Ledger integration
   - Trezor integration

### 3. Seed Phrase Input Section
Features:
- **Large Textarea**:
  - ID: `seed-phrase-input`
  - Placeholder: "Enter your 12 or 24 word seed phrase..."
  - Rows: 4
  - Word wrap enabled
  - Spellcheck disabled
  
- **Word Count Display**:
  - Real-time word counting
  - Shows "X/12" or "X/24"
  - Color coding for validity

- **Word Grid Option**:
  - 12 or 24 individual inputs
  - Tab navigation between words
  - Auto-advance on space

### 4. Validation Section
Shows real-time validation:
- ✓ Valid word count (12 or 24)
- ✓ All words in BIP39 wordlist
- ✓ Valid checksum
- ✗ Invalid words highlighted

### 5. Account Options
- **Account Name**:
  - Default: "Imported Wallet"
  - Customizable
  - Max 50 characters
  
- **Color Selection**:
  - Account color picker
  - 8 preset colors
  - Custom hex input

### 6. Advanced Options (Collapsible)
- **Derivation Path**:
  - Default: m/84'/0'/0'/0/0
  - Custom path input
  - Path validation
  
- **Passphrase** (Optional):
  - BIP39 passphrase
  - Hidden by default
  - Warning about forgetting

### 7. Footer Actions
Two buttons:
- **Cancel**: Closes without importing
- **Import Wallet**: Validates and imports

## Form Fields and Validation

### Seed Phrase Validation
```javascript
validateSeedPhrase(phrase) {
    const words = phrase.trim().split(/\s+/);
    
    // Check word count
    if (![12, 24].includes(words.length)) {
        return { valid: false, error: 'Must be 12 or 24 words' };
    }
    
    // Validate each word against BIP39 wordlist
    for (const word of words) {
        if (!BIP39_WORDLIST.includes(word)) {
            return { valid: false, error: `Invalid word: ${word}` };
        }
    }
    
    // Verify checksum
    if (!validateMnemonic(words.join(' '))) {
        return { valid: false, error: 'Invalid seed phrase checksum' };
    }
    
    return { valid: true };
}
```

### Private Key Validation
- WIF format validation
- Checksum verification
- Network byte checking
- Hex format support

## Security Measures

### 1. Input Security
- No autocomplete/autofill
- Paste event handling
- No browser password saving
- Clear clipboard after paste

### 2. Display Security
- Password field masking
- Option to show/hide seed
- Timeout-based hiding
- No screenshots (CSS)

### 3. Memory Security
- Clear variables after use
- No console logging
- Secure deletion
- Garbage collection hints

## API Calls

### 1. Wallet Import
```javascript
this.app.walletService.importWallet({
    mnemonic: seedPhrase,
    name: accountName,
    color: accountColor,
    passphrase: optionalPassphrase,
    derivationPath: customPath
})
```

### 2. Address Generation
```javascript
// Generate addresses for imported wallet
this.app.walletService.generateAddresses({
    mnemonic: seedPhrase,
    types: ['taproot', 'segwit', 'legacy']
})
```

### 3. Balance Check
```javascript
// Check if wallet has existing balance
this.app.apiService.checkBalance(addresses)
```

## State Updates

### On Import Success
1. Add wallet to accounts list
2. Set as current account
3. Fetch balances
4. Load transaction history
5. Navigate to dashboard

### Error Handling
1. Invalid seed phrase
2. Duplicate wallet
3. Network errors
4. Derivation failures

## Import Flow

### Step-by-Step Process
1. User enters seed phrase
2. Real-time validation
3. Optional: Set custom name/color
4. Optional: Advanced settings
5. Click import
6. Show loading state
7. Generate addresses
8. Check balances
9. Add to wallet list
10. Navigate to dashboard

## Visual Feedback

### Validation States
- **Invalid**: Red border, error message
- **Valid**: Green border, checkmark
- **Processing**: Orange border, spinner

### Word Highlighting
- Valid words: Normal
- Invalid words: Red background
- Active word: Blue outline

## Mobile Considerations
- Larger touch targets
- Simplified word entry
- Native keyboard optimization
- Reduced visual complexity
- Swipe between word inputs

## Error Messages
- "Invalid word count. Expected 12 or 24 words."
- "Word 'X' is not in the BIP39 wordlist."
- "Invalid seed phrase checksum."
- "This wallet is already imported."
- "Failed to generate addresses."
- "Network error. Please try again."

## Connected Components
- **WalletService**: For import logic
- **StateManager**: For account management
- **ValidationUtils**: For input validation
- **NotificationSystem**: For feedback

## Usage Example
```javascript
// Trigger from welcome screen or settings
showImportModal() {
    const modal = new ImportWalletModal(this.app);
    modal.show();
}
```

## Advanced Features

### Multi-Account Import
- Import multiple accounts from same seed
- Different derivation paths
- Account discovery

### Watch-Only Import
- Import public key only
- No spending capability
- Balance monitoring

## Security Best Practices
1. Always validate on both client and server
2. Never log sensitive data
3. Clear memory after operations
4. Use secure random for any generation
5. Implement rate limiting
6. Add password confirmation

## Notes for Recreation
1. BIP39 wordlist must be available
2. Implement proper checksum validation
3. Use secure clipboard handling
4. Add comprehensive error handling
5. Follow accessibility guidelines
6. Test with various wallet types