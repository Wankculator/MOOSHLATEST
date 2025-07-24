# Ordinals Forms Documentation

## Overview
Ordinals forms handle inscription transfers, viewing, and management within MOOSH Wallet's Ordinals protocol support.

## 1. Inscription Transfer Forms

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 22531-22534, 22561-22564
- **Component**: InscriptionTransferModal

### Implementation
```javascript
// Recipient address input
$.input({
    type: 'text',
    id: 'inscription-recipient',
    placeholder: 'bc1p...',
    className: 'form-input inscription-address',
    autocomplete: 'off',
    spellcheck: false,
    pattern: '^bc1p[a-z0-9]{58}$',
    oninput: (e) => this.validateInscriptionAddress(e.target.value),
    style: {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px'
    }
})

// Fee rate input
$.input({
    type: 'number',
    id: 'inscription-fee-rate',
    placeholder: '10',
    min: '1',
    max: '500',
    step: '1',
    className: 'form-input fee-input',
    oninput: (e) => this.updateInscriptionFee(e.target.value),
    style: {
        width: '100px'
    }
})
```

### Inscription Address Validation
```javascript
validateInscriptionAddress(address) {
    // Must be Taproot address for inscriptions
    const taprootPattern = /^bc1p[a-z0-9]{58}$/;
    
    if (!address) {
        return { valid: false, error: 'Address required' };
    }
    
    if (!taprootPattern.test(address)) {
        return { 
            valid: false, 
            error: 'Inscriptions require Taproot address (bc1p...)' 
        };
    }
    
    // Additional validation
    try {
        // Decode and verify checksum
        const decoded = this.decodeBech32(address);
        if (!decoded || decoded.prefix !== 'bc' || decoded.version !== 1) {
            return { 
                valid: false, 
                error: 'Invalid Taproot address' 
            };
        }
    } catch (e) {
        return { 
            valid: false, 
            error: 'Invalid address format' 
        };
    }
    
    return { valid: true, address };
}
```

---

## 2. Inscription Search

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: OrdinalsExplorer

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'inscription-search',
    placeholder: 'Search by inscription ID, address, or number...',
    className: 'inscription-search',
    oninput: debounce((e) => {
        this.searchInscriptions(e.target.value);
    }, 500),
    onkeydown: (e) => {
        if (e.key === 'Enter') {
            this.executeInscriptionSearch();
        }
    }
})
```

### Search Logic
```javascript
searchInscriptions(query) {
    query = query.trim();
    
    if (!query) {
        this.displayAllInscriptions();
        return;
    }
    
    // Detect search type
    const searchType = this.detectInscriptionSearchType(query);
    
    switch (searchType) {
        case 'id':
            // Full inscription ID (64 chars + 'i' + number)
            this.searchByInscriptionId(query);
            break;
            
        case 'number':
            // Inscription number (e.g., #21000000)
            const number = query.replace(/^#/, '');
            this.searchByInscriptionNumber(number);
            break;
            
        case 'address':
            // Bitcoin address holding inscriptions
            this.searchByAddress(query);
            break;
            
        case 'content':
            // Search in inscription metadata
            this.searchByContent(query);
            break;
    }
}

detectInscriptionSearchType(query) {
    // Inscription ID pattern
    if (/^[a-f0-9]{64}i\d+$/.test(query)) {
        return 'id';
    }
    
    // Inscription number
    if (/^#?\d+$/.test(query)) {
        return 'number';
    }
    
    // Bitcoin address
    if (/^(bc1|1|3)/.test(query)) {
        return 'address';
    }
    
    // Default to content search
    return 'content';
}
```

---

## 3. Inscription Creation (Inscribe)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: InscribeModal

### Implementation
```javascript
// File input for inscription content
$.input({
    type: 'file',
    id: 'inscription-file',
    accept: 'image/*,text/*,application/json',
    className: 'file-input',
    onchange: (e) => this.handleFileSelection(e),
    style: { display: 'none' }
})

// File preview and metadata
$.div({ className: 'inscription-preview' }, [
    $.div({ id: 'file-preview' }),
    $.input({
        type: 'text',
        id: 'inscription-name',
        placeholder: 'Name (optional)',
        maxlength: '64',
        className: 'form-input'
    }),
    $.textarea({
        id: 'inscription-description',
        placeholder: 'Description (optional)',
        maxlength: '256',
        rows: 3,
        className: 'form-textarea'
    })
])
```

### File Handling
```javascript
handleFileSelection(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file
    const validation = this.validateInscriptionFile(file);
    if (!validation.valid) {
        this.showError(validation.error);
        return;
    }
    
    // Read file content
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const content = e.target.result;
        
        // Preview based on type
        if (file.type.startsWith('image/')) {
            this.previewImage(content);
        } else if (file.type.startsWith('text/')) {
            this.previewText(content);
        } else {
            this.previewBinary(file);
        }
        
        // Calculate inscription cost
        this.calculateInscriptionCost(file.size);
    };
    
    if (file.type.startsWith('text/')) {
        reader.readAsText(file);
    } else {
        reader.readAsDataURL(file);
    }
}

validateInscriptionFile(file) {
    // Size limit (400KB for witness data)
    const maxSize = 400 * 1024;
    if (file.size > maxSize) {
        return { 
            valid: false, 
            error: `File too large. Max size: ${maxSize / 1024}KB` 
        };
    }
    
    // Allowed MIME types
    const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'text/plain',
        'text/html',
        'application/json'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        return { 
            valid: false, 
            error: 'File type not supported for inscriptions' 
        };
    }
    
    return { valid: true };
}
```

---

## 4. Inscription Filtering

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: InscriptionFilters

### Implementation
```javascript
// Collection filter
$.select({
    id: 'collection-filter',
    className: 'filter-select',
    onchange: (e) => this.filterByCollection(e.target.value),
    children: [
        $.option({ value: 'all' }, 'All Collections'),
        ...this.collections.map(col => 
            $.option({ value: col.id }, col.name)
        )
    ]
})

// Type filter
$.select({
    id: 'type-filter',
    className: 'filter-select',
    onchange: (e) => this.filterByType(e.target.value),
    children: [
        $.option({ value: 'all' }, 'All Types'),
        $.option({ value: 'image' }, 'Images'),
        $.option({ value: 'text' }, 'Text'),
        $.option({ value: 'json' }, 'JSON'),
        $.option({ value: 'html' }, 'HTML')
    ]
})

// Date range
$.input({
    type: 'date',
    id: 'date-from',
    className: 'date-input',
    onchange: (e) => this.updateDateFilter('from', e.target.value)
})
```

---

## 5. Inscription Details Form

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: InscriptionDetails

### Implementation
```javascript
// Inscription metadata display
$.div({ className: 'inscription-details' }, [
    // ID (read-only)
    $.input({
        type: 'text',
        value: inscription.id,
        readOnly: true,
        className: 'inscription-id',
        onclick: (e) => e.target.select()
    }),
    
    // Owner address (read-only)
    $.input({
        type: 'text',
        value: inscription.owner,
        readOnly: true,
        className: 'owner-address',
        onclick: (e) => this.copyAddress(e.target.value)
    }),
    
    // Custom name (editable)
    $.input({
        type: 'text',
        id: 'custom-name',
        placeholder: 'Add custom name',
        value: inscription.customName || '',
        maxlength: '50',
        onblur: (e) => this.saveCustomName(inscription.id, e.target.value)
    })
])
```

---

## Common Patterns

### 1. Inscription Preview
```javascript
renderInscriptionPreview(inscription) {
    switch (inscription.contentType) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
            return $.img({
                src: `data:${inscription.contentType};base64,${inscription.content}`,
                className: 'inscription-image',
                loading: 'lazy',
                onerror: (e) => {
                    e.target.src = '/images/inscription-error.png';
                }
            });
            
        case 'text/plain':
        case 'text/html':
            return $.pre({
                className: 'inscription-text',
                children: [inscription.content.slice(0, 1000)]
            });
            
        case 'application/json':
            return $.pre({
                className: 'inscription-json',
                children: [JSON.stringify(JSON.parse(inscription.content), null, 2)]
            });
            
        default:
            return $.div({
                className: 'inscription-binary',
                children: [`Binary data (${inscription.contentLength} bytes)`]
            });
    }
}
```

### 2. Batch Operations
```javascript
// Select multiple inscriptions
$.input({
    type: 'checkbox',
    className: 'inscription-select',
    value: inscription.id,
    onchange: (e) => this.toggleInscriptionSelection(e.target.value, e.target.checked)
})

// Batch transfer
batchTransferInscriptions() {
    const selected = this.getSelectedInscriptions();
    
    if (selected.length === 0) {
        this.showError('No inscriptions selected');
        return;
    }
    
    // Show batch transfer modal
    this.showBatchTransferModal(selected);
}
```

### 3. Inscription Cost Calculator
```javascript
calculateInscriptionCost(dataSize, feeRate = 10) {
    // Base transaction size
    let vBytes = 150; // Basic tx overhead
    
    // Witness data (inscription content)
    const witnessBytes = dataSize;
    const witnessVBytes = witnessBytes / 4; // Witness discount
    
    vBytes += witnessVBytes;
    
    // Calculate fees
    const networkFee = Math.ceil(vBytes * feeRate);
    const inscriptionFee = 10000; // Base inscription fee (sats)
    
    return {
        networkFee,
        inscriptionFee,
        totalFee: networkFee + inscriptionFee,
        estimatedVBytes: Math.ceil(vBytes)
    };
}
```

## Mobile Considerations

### File Selection
```javascript
// Mobile-friendly file picker
$.button({
    className: 'select-file-button',
    onclick: () => document.getElementById('inscription-file').click(),
    children: [
        $.i({ className: 'icon-upload' }),
        $.span({}, 'Select File')
    ]
})
```

### Touch Gallery
```css
.inscription-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
    .inscription-gallery {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

## Security Considerations

### Content Validation
- Sanitize HTML inscriptions before display
- Validate JSON structure
- Check for malicious scripts
- Limit preview sizes

### Transfer Safety
- Require password for transfers
- Show clear warnings for valuable inscriptions
- Double-check recipient addresses
- Estimate fees accurately

## Testing Checklist

- [ ] Address validation (Taproot only)
- [ ] File size limits
- [ ] File type restrictions
- [ ] Search functionality
- [ ] Filter combinations
- [ ] Batch selection
- [ ] Cost calculations
- [ ] Mobile file upload
- [ ] Preview rendering
- [ ] Security sanitization