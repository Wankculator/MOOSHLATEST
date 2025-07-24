# ConfirmSeedPage

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 8147-8415)

## Overview
The ConfirmSeedPage is a critical security component that verifies users have correctly recorded their seed phrase. It randomly selects 4 words from the generated mnemonic and asks users to input them, ensuring they have properly backed up their wallet recovery phrase.

## Class Definition

```javascript
class ConfirmSeedPage extends Component {
    constructor(app) {
        super(app);
        this.verificationWords = [];
    }
}
```

## UI Layout and Design

The page follows MOOSH Wallet's signature terminal/hacker aesthetic with:
- Centered card layout with dark background
- MOOSH logo integration in the title
- Terminal-style verification form with brackets and dim text styling
- Monospace font for input fields
- Color-coded validation feedback (green/orange/red borders)

## User Flow and Navigation

1. **Entry Point**: Users arrive from GenerateSeedPage after writing down their seed
2. **Verification Process**: 
   - 4 random words are selected from the seed phrase
   - Users must enter these specific words in the correct order
   - Real-time validation provides visual feedback
3. **Success Path**: Navigate to WalletCreatedPage
4. **Alternative Path**: Skip verification (warning provided) → WalletDetailsPage
5. **Back Navigation**: Return to GenerateSeedPage

## Core Methods

### `render()`
Main render method that creates the verification interface.

```javascript
render() {
    const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || '[]');
    this.verificationWords = this.selectRandomWords(generatedSeed);
    this.app.state.set('verificationWords', this.verificationWords);
    
    const card = $.div({ className: 'card' }, [
        this.createTitle(),
        this.createVerificationForm(),
        this.createActionButtons()
    ]);

    return card;
}
```

### `selectRandomWords(seed)`
Selects 4 random words from the seed phrase using crypto-secure randomness.

```javascript
selectRandomWords(seed) {
    const randomWords = [];
    const wordIndices = [];
    
    // Select 4 random words for verification using crypto-secure random
    const randomBytes = new Uint8Array(4);
    window.crypto.getRandomValues(randomBytes);
    
    while (randomWords.length < 4) {
        const randomIndex = randomBytes[randomWords.length] % seed.length;
        if (!wordIndices.includes(randomIndex)) {
            wordIndices.push(randomIndex);
            randomWords.push({ 
                index: randomIndex + 1,  // 1-based index for display
                word: seed[randomIndex] 
            });
        }
    }
    
    return randomWords.sort((a, b) => a.index - b.index);
}
```

### `createTitle()`
Creates the page header with MOOSH branding.

```javascript
createTitle() {
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
            $.span({ className: 'moosh-flash' }, ['CONFIRM']),
            ' ',
            $.span({ className: 'text-dim' }, ['SEED'])
        ]),
        $.p({
            className: 'token-site-subtitle',
            style: {
                fontSize: 'calc(14px * var(--scale-factor))',
                marginBottom: 'calc(16px * var(--scale-factor))'
            }
        }, ['Verify your recovery phrase'])
    ]);
}
```

### `createVerificationForm()`
Creates the terminal-style verification form.

```javascript
createVerificationForm() {
    return $.div({
        style: {
            background: '#000000',
            border: '2px solid var(--text-primary)',
            borderRadius: '0',
            padding: 'calc(24px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))'
        }
    }, [
        $.div({
            style: {
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: 'calc(16px * var(--scale-factor))',
                fontSize: 'calc(14px * var(--scale-factor))',
                textAlign: 'center'
            }
        }, [
            $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
            ' Verify Your Words ',
            $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
        ]),
        ...this.verificationWords.map((item, i) => this.createWordInput(item, i)),
        $.div({
            id: 'verificationError',
            style: {
                color: '#ff4444',
                fontSize: 'calc(10px * var(--scale-factor))',
                marginTop: 'calc(12px * var(--scale-factor))',
                display: 'none',
                textAlign: 'center'
            }
        })
    ]);
}
```

### `verifySeedPhrase()`
Validates all entered words and handles navigation.

```javascript
verifySeedPhrase() {
    const errorDiv = document.getElementById('verificationError');
    let allCorrect = true;
    let incorrectWords = [];
    
    errorDiv.style.display = 'none';
    
    for (let i = 0; i < this.verificationWords.length; i++) {
        const input = document.getElementById(`word${i}`);
        const expectedWord = this.verificationWords[i].word;
        
        if (!input || !input.value.trim()) {
            incorrectWords.push(`Word #${this.verificationWords[i].index} is empty`);
            allCorrect = false;
        } else if (input.value.trim().toLowerCase() !== expectedWord.toLowerCase()) {
            incorrectWords.push(`Word #${this.verificationWords[i].index} is incorrect`);
            allCorrect = false;
        }
    }
    
    if (allCorrect) {
        this.app.showNotification('Seed verified successfully!', 'success');
        setTimeout(() => {
            this.app.router.navigate('wallet-created');
        }, 1000);
    } else {
        errorDiv.textContent = incorrectWords.join(', ') + '. Please check and try again.';
        errorDiv.style.display = 'block';
        this.app.showNotification('Verification failed', 'error');
    }
}
```

## State Management

The component interacts with app state in the following ways:

1. **Reads**: 
   - `generatedSeed` from localStorage
   - `sparkWallet` from state (for skip verification)

2. **Writes**:
   - `verificationWords` to state
   - `walletVerified` to localStorage (when skipping)

3. **Navigation State**:
   - Sets verification status before navigating
   - Preserves wallet data for next page

## Form Validation

### Input Validation
- Each word input has hover and focus states
- No real-time validation during typing (security consideration)
- Validation only occurs on "Verify Seed" button click

### Error Handling
- Empty inputs are detected and reported
- Case-insensitive comparison for word matching
- Specific error messages indicate which words are incorrect
- Visual error display below the form

## Error States

1. **Empty Input**: "Word #X is empty"
2. **Incorrect Word**: "Word #X is incorrect"
3. **Multiple Errors**: Comma-separated list of all errors
4. **No Wallet Data**: Redirects to home if sparkWallet is missing

## Integration with Other Components

### Dependencies
- **ElementFactory ($)**: For DOM element creation
- **Component**: Base class providing app context
- **Button**: Reusable button component for actions
- **Router**: For navigation between pages
- **NotificationSystem**: For success/error messages

### Data Flow
1. Receives seed phrase from `GenerateSeedPage` via localStorage
2. Stores verification words in app state
3. On success, navigates to `WalletCreatedPage`
4. On skip, navigates to `WalletDetailsPage` with type=all parameter

## Security Considerations

1. **Crypto-Secure Random**: Uses `window.crypto.getRandomValues()` instead of Math.random()
2. **No Logging**: Never logs the seed phrase or verification words
3. **Memory Cleanup**: Consideration for clearing sensitive data after use
4. **Skip Warning**: Allows skipping but marks wallet as unverified

## Styling Details

```css
/* Key styling patterns used */
.card {
    background: var(--bg-secondary);
    border-radius: calc(16px * var(--scale-factor));
    padding: calc(32px * var(--scale-factor));
}

.verification-input {
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: calc(14px * var(--scale-factor));
    padding: calc(12px * var(--scale-factor));
    border-radius: 0;
    transition: border-color 0.2s ease;
}

/* Hover states */
.verification-input:hover {
    border-color: var(--text-primary);
}

/* Focus states */
.verification-input:focus {
    border-color: var(--text-primary);
}
```

## Accessibility Features

- Proper label associations for screen readers
- Keyboard navigation support
- Clear error messages
- High contrast borders for validation states
- Responsive scaling with --scale-factor

## Known Issues and Edge Cases

1. **Random Distribution**: Using modulo with crypto.getRandomValues may have slight bias
2. **Word Collision**: Rare chance of selecting same word index multiple times
3. **Mobile Keyboards**: Auto-capitalization may interfere with word entry
4. **Browser Back**: Seed may be lost if user navigates back after verification

## Testing Recommendations

1. Test with both 12 and 24-word seed phrases
2. Verify correct words are accepted case-insensitively
3. Test error messages for various failure scenarios
4. Ensure navigation works correctly for both success and skip paths
5. Verify security measures (no logging, proper randomness)
6. Test on mobile devices for input handling