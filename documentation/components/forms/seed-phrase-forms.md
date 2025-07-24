# Seed Phrase Forms Documentation

## Overview
Seed phrase forms handle the most critical security aspect of MOOSH Wallet - the generation, import, and recovery of BIP39 mnemonic phrases.

## 1. Seed Phrase Import (Textarea)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 8549-8552, 16325-16328, 17743-17746
- **Component**: ImportWalletModal

### Implementation
```javascript
$.textarea({
    id: 'seedTextarea',
    placeholder: `Enter your 12 or 24-word BIP39 recovery phrase...

Example format:
word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12`,
    style: {
        width: '100%',
        height: '120px',
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: '0',
        color: '#ffffff',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '14px',
        padding: '12px',
        resize: 'vertical'
    },
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: false
})
```

### Validation
```javascript
validateMnemonic(words) {
    // Clean input
    const seedWords = value.trim().toLowerCase().split(/\s+/);
    
    // Word count validation
    if (seedWords.length !== 12 && seedWords.length !== 24) {
        return { 
            valid: false, 
            error: 'Seed phrase must be exactly 12 or 24 words' 
        };
    }
    
    // BIP39 wordlist validation
    const invalidWords = seedWords.filter(word => !BIP39_WORDS.includes(word));
    if (invalidWords.length > 0) {
        return { 
            valid: false, 
            error: `Invalid words: ${invalidWords.join(', ')}` 
        };
    }
    
    // Checksum validation (optional, done server-side)
    return { valid: true, sanitized: seedWords.join(' ') };
}
```

### Security Features
- No autocomplete/autocorrect
- Monospace font for clarity
- Immediate memory clearing after use
- No browser history storage
- Paste event sanitization

### Error Messages
- "Seed phrase must be exactly 12 or 24 words"
- "Invalid BIP39 mnemonic. [REASON] One or more words not in BIP39 wordlist"
- "Invalid checksum for seed phrase"
- "Please enter your seed phrase"

---

## 2. Individual Word Input (Recovery)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 8257-8260
- **Component**: SeedRecoveryWizard

### Implementation
```javascript
// For each word position
$.input({
    type: 'text',
    id: `word${index}`,
    placeholder: `Enter word ${item.index}`,
    className: 'word-input',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: false,
    maxlength: 8, // Longest BIP39 word
    oninput: (e) => this.handleWordInput(index, e.target.value),
    onkeydown: (e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
            this.focusNextWord(index);
        }
    }
})
```

### Features
- Individual word validation
- Auto-focus next field
- Word suggestion dropdown
- Tab/Enter navigation
- Backspace to previous field

### Word Suggestion Logic
```javascript
suggestWords(partial) {
    if (partial.length < 2) return [];
    
    return BIP39_WORDS
        .filter(word => word.startsWith(partial.toLowerCase()))
        .slice(0, 5)
        .map(word => ({
            word,
            similarity: this.calculateSimilarity(partial, word)
        }))
        .sort((a, b) => b.similarity - a.similarity);
}
```

---

## 3. Seed Phrase Display (Read-only)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 8005, 13467, 26507
- **Component**: ShowSeedPhraseModal

### Implementation
```javascript
const textArea = document.createElement('textarea');
textArea.value = mnemonic;
textArea.readOnly = true;
textArea.className = 'seed-display';
textArea.style.cssText = `
    width: 100%;
    height: 120px;
    background: #1a1a1a;
    border: 2px solid #00ff00;
    color: #00ff00;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    padding: 12px;
    resize: none;
    cursor: text;
    user-select: all;
`;
```

### Security Measures
- Read-only display
- Copy button with confirmation
- Auto-hide after 60 seconds
- Blur detection to hide
- No print styling

### Copy Functionality
```javascript
async copySeedPhrase() {
    try {
        await navigator.clipboard.writeText(this.mnemonic);
        this.showNotification('Seed phrase copied', 'success');
        
        // Security: Clear clipboard after 30 seconds
        setTimeout(() => {
            navigator.clipboard.writeText('');
        }, 30000);
    } catch (err) {
        // Fallback for older browsers
        this.manualCopy();
    }
}
```

---

## 4. Account Import Forms

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 16315-16328, 17733-17746
- **Component**: ImportAccountModal

### Implementation
```javascript
// Account name input
$.input({
    id: 'importAccountName',
    type: 'text',
    placeholder: 'Enter account name',
    className: 'form-input',
    maxlength: 50
})

// Seed phrase textarea
$.textarea({
    id: 'importSeedPhrase',
    placeholder: 'Enter your 12 or 24 word seed phrase',
    style: 'width: 100%; height: 80px; ...',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: false
})
```

### Import Validation Flow
1. Validate account name (alphanumeric, max 50 chars)
2. Validate seed phrase format
3. Check for duplicate seeds
4. Verify BIP39 checksum
5. Generate addresses
6. Check for existing accounts

---

## Common Security Patterns

### 1. Input Sanitization
```javascript
sanitizeSeedPhrase(input) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z\s]/g, '') // Remove non-letters
        .replace(/\s+/g, ' ')     // Normalize spaces
        .split(' ')
        .filter(word => word.length > 0);
}
```

### 2. Memory Clearing
```javascript
clearSensitiveData() {
    // Clear input values
    const inputs = document.querySelectorAll('[id*="seed"], [id*="word"]');
    inputs.forEach(input => {
        input.value = '';
        input.setAttribute('value', '');
    });
    
    // Clear variables
    this.mnemonic = null;
    this.seedWords = null;
    
    // Force garbage collection hint
    if (global.gc) global.gc();
}
```

### 3. Clipboard Security
```javascript
secureClipboardWrite(text) {
    // Write to clipboard
    navigator.clipboard.writeText(text);
    
    // Schedule clearing
    this.clipboardTimeout = setTimeout(() => {
        navigator.clipboard.writeText('');
        this.showNotification('Clipboard cleared for security', 'info');
    }, 30000); // 30 seconds
}
```

## Mobile Considerations

### Touch Interactions
- Larger input areas (min 44px height)
- No hover states
- Touch-friendly word suggestions
- Swipe to navigate words

### Keyboard Handling
```javascript
// Prevent keyboard from covering inputs
handleKeyboardShow() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.scrollIntoView) {
        activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}
```

## Accessibility

### Screen Reader Support
- Proper labeling for each word input
- Announcement of validation errors
- Progress indication (word X of Y)
- Clear instructions

### Keyboard Navigation
- Tab through word inputs
- Enter to proceed
- Escape to cancel
- Arrow keys for suggestions

## Testing Checklist

- [ ] 12-word phrase validation
- [ ] 24-word phrase validation
- [ ] Invalid word detection
- [ ] Checksum validation
- [ ] Copy/paste functionality
- [ ] Auto-clear after timeout
- [ ] Mobile keyboard behavior
- [ ] Word suggestion accuracy
- [ ] Memory leak testing
- [ ] Accessibility compliance