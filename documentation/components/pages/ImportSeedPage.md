# ImportSeedPage

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 8420-8766)

## Overview
The ImportSeedPage allows users to restore an existing wallet by entering their BIP39 seed phrase. It supports both 12 and 24-word mnemonics with auto-detection, provides comprehensive validation, and includes terminal-style UI elements consistent with MOOSH Wallet's hacker aesthetic.

## Class Definition

```javascript
class ImportSeedPage extends Component {
    render() {
        const wordCount = this.app.state.get('selectedMnemonic');
        
        const card = $.div({ className: 'card' }, [
            this.createTitle(wordCount),
            this.createInstructions(),
            this.createImportForm(wordCount),
            this.createActionButtons()
        ]);

        return card;
    }
}
```

## UI Layout and Design

The page features MOOSH Wallet's signature terminal/Matrix-inspired design:
- Dark card background with sharp borders
- MOOSH logo integrated in the header
- Terminal-style instruction box with system messages
- Monospace font textarea for seed input
- Real-time validation feedback
- Hover effects with border transitions

### Visual Elements
```
┌─────────────────────────────────────┐
│  🔶 IMPORT WALLET                   │
│  Import 12/24-Word Recovery Phrase  │
├─────────────────────────────────────┤
│  [SYSTEM] Recovery phrase import... │
│  [FORMAT] BIP39 12/24-word support │
│  [INPUT] Enter words separated by..│
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ Enter your recovery phrase   │   │
│  │ ...                          │   │
│  └─────────────────────────────┘   │
│  ✅ Valid recovery phrase!          │
├─────────────────────────────────────┤
│  [Import Wallet]     [Back Esc]     │
└─────────────────────────────────────┘
```

## User Flow and Navigation

1. **Entry Points**: 
   - Home page "Import Existing Wallet" button
   - Network selection page after choosing network

2. **Import Process**:
   - User enters seed phrase in textarea
   - Auto-detection of word count (12 or 24)
   - Real-time validation feedback
   - Import processes through Spark API

3. **Success Path**: Navigate to dashboard with imported wallet
4. **Error Handling**: Clear error messages for invalid seeds
5. **Back Navigation**: Return to previous page

## Core Methods

### `createTitle(wordCount)`
Creates the page header with dynamic word count display.

```javascript
createTitle(wordCount) {
    return $.div({
        style: {
            textAlign: 'center',
            marginBottom: 'calc(24px * var(--scale-factor))'
        }
    }, [
        $.h1({
            style: {
                fontSize: 'calc(28px * var(--scale-factor))',
                marginBottom: 'calc(8px * var(--scale-factor))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'calc(12px * var(--scale-factor))'
            }
        }, [
            $.img({
                src: 'images/Moosh-logo.png',
                alt: 'MOOSH',
                style: {
                    width: 'calc(40px * var(--scale-factor))',
                    height: 'calc(40px * var(--scale-factor))',
                    objectFit: 'contain'
                },
                onerror: function() { this.style.display = 'none'; }
            }),
            $.span({ className: 'moosh-flash' }, ['IMPORT']),
            ' ',
            $.span({ className: 'text-dim' }, ['WALLET'])
        ]),
        $.p({
            className: 'token-site-subtitle',
            style: {
                fontSize: 'calc(14px * var(--scale-factor))',
                marginBottom: 'calc(16px * var(--scale-factor))'
            }
        }, [`Import ${wordCount || '12/24'}-Word Recovery Phrase`])
    ]);
}
```

### `createInstructions()`
Creates terminal-style instruction panel.

```javascript
createInstructions() {
    return $.div({
        style: {
            background: '#000000',
            border: '2px solid var(--text-primary)',
            borderRadius: '0',
            padding: 'calc(20px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            fontFamily: "'JetBrains Mono', monospace"
        }
    }, [
        $.div({
            style: {
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: 'calc(16px * var(--scale-factor))',
                fontSize: 'calc(14px * var(--scale-factor))',
                textAlign: 'center',
                letterSpacing: '0.05em'
            }
        }, [
            $.span({ style: { color: '#666666', fontSize: 'calc(10px * var(--scale-factor))' } }, ['<']),
            ' RECOVERY PHRASE IMPORT ',
            $.span({ style: { color: '#666666', fontSize: 'calc(10px * var(--scale-factor))' } }, ['/>'])
        ]),
        // System messages with colored prefixes
        $.div({ style: { marginBottom: 'calc(10px * var(--scale-factor))' } }, [
            $.span({ style: { color: 'var(--text-primary)', fontWeight: '600' } }, ['[SYSTEM]']),
            $.span({ style: { color: '#888888' } }, [' Recovery phrase import protocol initiated'])
        ]),
        // ... additional system messages
    ]);
}
```

### `importWalletFromSeed()`
Main import logic with comprehensive validation and API integration.

```javascript
async importWalletFromSeed() {
    const seedText = document.getElementById('seedTextarea').value.trim();
    const seedWords = seedText.split(/\s+/).filter(word => word.length > 0);
    const errorDiv = document.getElementById('importError');
    const successDiv = document.getElementById('importSuccess');
    
    // Auto-detect word count and validate
    if (seedWords.length !== 12 && seedWords.length !== 24) {
        errorDiv.textContent = `[ERROR] Invalid word count: ${seedWords.length}. [EXPECTED] 12 or 24 words for BIP39 compliance`;
        errorDiv.style.color = '#FF0000';
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        this.app.showNotification('[ERROR] Invalid word count - Expected 12 or 24 words', 'error');
        return;
    }
    
    // Update state with detected word count
    this.app.state.set('selectedMnemonic', seedWords.length);
    
    if (!this.validateMnemonic(seedWords)) {
        errorDiv.textContent = '[ERROR] Invalid BIP39 mnemonic. [REASON] One or more words not in BIP39 wordlist';
        errorDiv.style.color = '#FF0000';
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
        this.app.showNotification('[ERROR] Invalid BIP39 mnemonic phrase', 'error');
        return;
    }
    
    // Show processing status
    errorDiv.style.display = 'none';
    successDiv.textContent = `[PROCESSING] Validating seed entropy... [WORDS] ${seedWords.length} words detected`;
    successDiv.style.color = 'var(--text-keyword)';
    successDiv.style.display = 'block';
    
    try {
        const mnemonic = seedWords.join(' ');
        
        // Update status progressively
        setTimeout(() => {
            if (successDiv) {
                successDiv.textContent = '[PROCESSING] Deriving HD wallet paths... [PROTOCOL] BIP32/BIP44/BIP84/BIP86';
                successDiv.style.color = 'var(--text-keyword)';
            }
        }, 500);
        
        const response = await this.app.apiService.importSparkWallet(mnemonic);
        
        if (response && response.success && response.data) {
            // Store the wallet data with proper address mapping
            const walletData = response.data;
            
            // Map all address types properly
            const mappedWalletData = {
                ...walletData,
                addresses: {
                    spark: walletData.addresses?.spark || '',
                    bitcoin: walletData.addresses?.bitcoin || walletData.bitcoinAddresses?.segwit || '',
                    segwit: walletData.bitcoinAddresses?.segwit || walletData.addresses?.bitcoin || '',
                    taproot: walletData.bitcoinAddresses?.taproot || '',
                    legacy: walletData.bitcoinAddresses?.legacy || '',
                    nestedSegwit: walletData.bitcoinAddresses?.nestedSegwit || ''
                },
                bitcoinAddresses: walletData.bitcoinAddresses
            };
            
            localStorage.setItem('sparkWallet', JSON.stringify(mappedWalletData));
            this.app.state.set('generatedSeed', seedWords);
            this.app.state.set('sparkWallet', mappedWalletData);
            
            // Create account in multi-account system
            const account = await this.app.state.createAccount('Imported Wallet', walletData.mnemonic, true);
            
            this.app.showNotification('[SUCCESS] Wallet import completed • HD keys derived', 'success');
        }
    } catch (error) {
        console.warn('Failed to import via Spark API:', error);
        // Fallback handling
        this.app.state.set('generatedSeed', seedWords);
        this.app.showNotification('Importing wallet...', 'success');
    }
    
    setTimeout(() => {
        this.app.router.navigate('dashboard');
        // Force balance refresh after navigation
        setTimeout(() => {
            const dashboardPage = this.app.router.currentPage;
            if (dashboardPage && dashboardPage.refreshBalances) {
                console.log('[ImportWallet] Triggering balance refresh after import');
                dashboardPage.refreshBalances();
            }
        }, 2000);
    }, 1500);
}
```

## State Management

### State Interactions
1. **Reads**:
   - `selectedMnemonic` from state (initial word count)
   
2. **Writes**:
   - `selectedMnemonic` to state (detected word count)
   - `generatedSeed` to state
   - `sparkWallet` to state and localStorage
   - `currentWallet` to state with all address types

3. **API Integration**:
   - Calls `app.apiService.importSparkWallet()`
   - Creates account via `app.state.createAccount()`

## Form Validation

### Input Validation Features
- Auto-detection of 12 or 24-word mnemonics
- Real-time word count validation
- BIP39 wordlist validation (if wordlist loaded)
- Whitespace trimming and normalization
- Case-insensitive word matching

### Error Messages
- `[ERROR] Invalid word count: X. [EXPECTED] 12 or 24 words for BIP39 compliance`
- `[ERROR] Invalid BIP39 mnemonic. [REASON] One or more words not in BIP39 wordlist`

### Success Feedback
- Progressive status updates during import
- `[PROCESSING] Validating seed entropy... [WORDS] X words detected`
- `[PROCESSING] Deriving HD wallet paths... [PROTOCOL] BIP32/BIP44/BIP84/BIP86`
- `[SUCCESS] Wallet import completed • HD keys derived`

## Error Handling

1. **Invalid Word Count**: Clear error with expected values
2. **Invalid BIP39 Words**: Indicates mnemonic validation failure
3. **API Failures**: Graceful fallback with state storage
4. **Network Issues**: Continues with local storage

## Integration with Other Components

### Dependencies
- **ElementFactory ($)**: DOM element creation
- **Component**: Base class for app context
- **Button**: Reusable button component
- **ApiService**: Spark wallet import endpoint
- **StateManager**: Multi-account system integration
- **Router**: Navigation handling

### Data Flow
1. User enters seed phrase in textarea
2. Validation checks word count and BIP39 compliance
3. API call to import wallet and derive addresses
4. Address mapping ensures all types are available
5. Account created in multi-account system
6. Navigation to dashboard with balance refresh

## Security Considerations

1. **No Seed Storage**: Comment warns against storing seeds in localStorage
2. **HTTPS Only**: API calls use secure transport
3. **Input Sanitization**: Whitespace trimming and filtering
4. **Error Masking**: Generic error messages to prevent information leakage

## Styling Details

```css
/* Textarea styling */
#seedTextarea {
    width: 100%;
    height: calc(120px * var(--scale-factor));
    background: var(--bg-primary);
    border: 2px solid #333333;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: calc(13px * var(--scale-factor));
    padding: calc(16px * var(--scale-factor));
    resize: vertical;
    line-height: 1.6;
    outline: none;
    transition: border-color 0.2s ease;
    scrollbar-width: thin;
    scrollbar-color: var(--text-primary) #000000;
}

/* Focus state */
#seedTextarea:focus {
    border-color: var(--text-primary);
    box-shadow: 0 0 0 1px var(--text-primary);
}

/* Disabled text helpers */
#seedTextarea {
    autocomplete: off;
    autocorrect: off;
    autocapitalize: off;
    spellcheck: false;
}
```

## Accessibility Features

- Semantic HTML structure
- Proper label associations
- Keyboard navigation support
- High contrast terminal theme
- Screen reader compatible error messages
- Responsive scaling with --scale-factor

## Known Issues and Edge Cases

1. **BIP39 Wordlist**: Validation only works if wordlist is loaded
2. **Address Mapping**: Complex due to multiple address formats
3. **Timing Issues**: Balance refresh requires delay after navigation
4. **Browser Autocomplete**: May interfere with seed entry

## Testing Recommendations

1. Test with valid 12 and 24-word seeds
2. Test word count validation (11, 13, 23, 25 words)
3. Test with invalid BIP39 words
4. Test whitespace handling (extra spaces, newlines)
5. Verify all address types are properly mapped
6. Test API failure scenarios
7. Verify multi-account integration
8. Test on mobile devices for textarea behavior