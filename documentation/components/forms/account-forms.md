# Account Forms Documentation

## Overview
Account forms manage wallet account creation, import, renaming, and organization within MOOSH Wallet.

## 1. New Account Name Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 16281-16284, 17699-17702
- **Component**: NewAccountModal

### Implementation
```javascript
$.input({
    id: 'newAccountName',
    type: 'text',
    placeholder: 'Enter account name',
    className: 'form-input',
    maxlength: 50,
    autocomplete: 'off',
    oninput: (e) => this.validateAccountName(e.target.value),
    onkeypress: (e) => {
        if (e.key === 'Enter') {
            this.createAccount();
        }
    }
})
```

### Validation Rules
```javascript
validateAccountName(name) {
    // ComplianceUtils validation
    const validation = ComplianceUtils.validateInput(name, 'accountName');
    
    if (!validation.valid) {
        return validation;
    }
    
    // Additional custom validation
    const sanitized = validation.sanitized;
    
    // Check for duplicates
    const accounts = this.app.state.getAccounts();
    const duplicate = accounts.find(acc => 
        acc.name.toLowerCase() === sanitized.toLowerCase()
    );
    
    if (duplicate) {
        return { 
            valid: false, 
            error: 'Account name already exists' 
        };
    }
    
    // Reserved names
    const reserved = ['admin', 'system', 'test', 'demo'];
    if (reserved.includes(sanitized.toLowerCase())) {
        return { 
            valid: false, 
            error: 'This name is reserved' 
        };
    }
    
    return { valid: true, sanitized };
}
```

### Character Restrictions
- **Allowed**: Alphanumeric, spaces
- **Max Length**: 50 characters
- **Min Length**: 1 character (after trim)
- **Sanitization**: Remove special characters
- **Case**: Preserved but compared case-insensitive

---

## 2. Account Rename Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 16849-16852, 17465-17468, 19238-19241
- **Component**: RenameAccountModal

### Implementation
```javascript
$.input({
    id: 'rename-input-modal',
    type: 'text',
    value: account.name,
    className: 'form-input',
    maxlength: 50,
    autocomplete: 'off',
    placeholder: 'Enter new name',
    style: {
        width: '100%',
        padding: '12px',
        background: '#000',
        border: '1px solid #00ff00',
        color: '#fff',
        fontSize: '14px'
    },
    onkeypress: (e) => {
        if (e.key === 'Enter') {
            this.confirmRename();
        }
        if (e.key === 'Escape') {
            this.cancelRename();
        }
    }
})
```

### Inline Rename (Alternative)
```javascript
$.input({
    type: 'text',
    value: account.name,
    style: {
        background: 'transparent',
        border: '1px solid #00ff00',
        color: '#fff',
        padding: '2px 8px',
        fontSize: 'inherit',
        fontFamily: 'inherit'
    },
    onblur: (e) => this.saveRename(account.id, e.target.value),
    onkeydown: (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
        if (e.key === 'Escape') {
            e.target.value = account.name;
            e.target.blur();
        }
    }
})
```

---

## 3. Account Search Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 18805-18808
- **Component**: AccountListView

### Implementation
```javascript
$.input({
    type: 'text',
    placeholder: 'Search accounts...',
    value: this.searchQuery,
    className: 'search-input',
    oninput: debounce((e) => {
        this.searchQuery = e.target.value;
        this.filterAccounts();
    }, 300),
    onkeydown: (e) => {
        if (e.key === 'Escape') {
            e.target.value = '';
            this.searchQuery = '';
            this.filterAccounts();
        }
    }
})
```

### Search Logic
```javascript
filterAccounts() {
    const query = this.searchQuery.toLowerCase();
    const accounts = this.app.state.getAccounts();
    
    if (!query) {
        return accounts;
    }
    
    return accounts.filter(account => {
        // Search in multiple fields
        return (
            account.name.toLowerCase().includes(query) ||
            account.addresses.bitcoin?.toLowerCase().includes(query) ||
            account.addresses.spark?.toLowerCase().includes(query) ||
            account.balance?.toString().includes(query)
        );
    });
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
// Account name for import
$.input({
    id: 'importAccountName',
    type: 'text',
    placeholder: 'Enter account name',
    className: 'form-input',
    maxlength: 50,
    autocomplete: 'off'
})

// Import type selector
$.select({
    id: 'importType',
    className: 'form-select',
    onchange: (e) => this.updateImportView(e.target.value),
    children: [
        $.option({ value: 'seed' }, 'Seed Phrase'),
        $.option({ value: 'private' }, 'Private Key'),
        $.option({ value: 'watch' }, 'Watch Only (Address)')
    ]
})
```

### Private Key Import
```javascript
$.input({
    type: 'password',
    id: 'privateKeyInput',
    placeholder: 'Enter private key (WIF or hex)',
    className: 'form-input',
    autocomplete: 'off',
    spellcheck: false,
    oninput: (e) => this.validatePrivateKey(e.target.value)
})
```

### Watch-Only Address
```javascript
$.input({
    type: 'text',
    id: 'watchAddress',
    placeholder: 'Enter Bitcoin address to watch',
    className: 'form-input',
    autocomplete: 'off',
    spellcheck: false,
    oninput: (e) => this.validateWatchAddress(e.target.value)
})
```

---

## 5. Account Color Picker

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: Account customization

### Implementation
```javascript
$.input({
    type: 'color',
    id: 'accountColor',
    value: account.color || '#00ff00',
    className: 'color-picker',
    onchange: (e) => this.updateAccountColor(account.id, e.target.value)
})
```

### Color Validation
```javascript
validateAccountColor(color) {
    // Must be valid hex color
    const hexPattern = /^#[0-9A-F]{6}$/i;
    
    if (!hexPattern.test(color)) {
        return { valid: false, error: 'Invalid color format' };
    }
    
    // Ensure sufficient contrast
    const rgb = this.hexToRgb(color);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    if (luminance < 0.2) {
        return { 
            valid: false, 
            error: 'Color too dark for visibility' 
        };
    }
    
    return { valid: true, value: color.toUpperCase() };
}
```

---

## 6. Account Derivation Path

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: Advanced account settings

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'derivationPath',
    placeholder: "m/84'/0'/0'/0/0",
    value: "m/84'/0'/0'/0/0",
    className: 'form-input monospace',
    pattern: "^m(/\\d+'?)*$",
    autocomplete: 'off',
    spellcheck: false,
    oninput: (e) => this.validateDerivationPath(e.target.value)
})
```

### Path Validation
```javascript
validateDerivationPath(path) {
    // BIP32 path validation
    const pathRegex = /^m(\/\d+'?)*$/;
    
    if (!pathRegex.test(path)) {
        return { 
            valid: false, 
            error: 'Invalid derivation path format' 
        };
    }
    
    // Parse path components
    const components = path.split('/').slice(1);
    
    // Validate purpose (first component)
    const purpose = parseInt(components[0]);
    const validPurposes = [44, 49, 84, 86]; // Legacy, Nested SegWit, Native SegWit, Taproot
    
    if (!validPurposes.includes(purpose)) {
        return { 
            valid: false, 
            error: `Invalid purpose: ${purpose}. Use 44, 49, 84, or 86` 
        };
    }
    
    return { valid: true, path, purpose };
}
```

---

## Common Patterns

### 1. Account Uniqueness Check
```javascript
ensureUniqueAccountName(proposedName) {
    const accounts = this.app.state.getAccounts();
    let name = proposedName;
    let suffix = 1;
    
    while (accounts.some(acc => acc.name === name)) {
        name = `${proposedName} ${suffix}`;
        suffix++;
    }
    
    return name;
}
```

### 2. Account Sorting
```javascript
sortAccounts(accounts, sortBy = 'created') {
    return [...accounts].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'balance':
                return (b.balance || 0) - (a.balance || 0);
            case 'created':
            default:
                return a.createdAt - b.createdAt;
        }
    });
}
```

### 3. Bulk Operations
```javascript
$.input({
    type: 'checkbox',
    className: 'account-select',
    value: account.id,
    onchange: (e) => this.toggleAccountSelection(e.target.value, e.target.checked)
})
```

## Mobile Considerations

### Touch Interactions
- Swipe to reveal actions
- Long press for context menu
- Drag to reorder accounts

### Responsive Design
```css
@media (max-width: 768px) {
    .account-name-input {
        font-size: 16px; /* Prevent zoom on iOS */
    }
}
```

## Accessibility

### Label Associations
```javascript
$.label({ for: 'newAccountName' }, 'Account Name'),
$.input({ 
    id: 'newAccountName',
    'aria-describedby': 'name-help'
}),
$.span({ id: 'name-help' }, 'Choose a memorable name')
```

## Testing Checklist

- [ ] Name validation (special chars, length)
- [ ] Duplicate name prevention
- [ ] Search functionality
- [ ] Color picker browser support
- [ ] Derivation path validation
- [ ] Import type switching
- [ ] Mobile keyboard behavior
- [ ] Accessibility labels
- [ ] Error message clarity
- [ ] Auto-save on blur