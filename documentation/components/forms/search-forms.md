# Search Forms Documentation

## Overview
Search forms in MOOSH Wallet enable users to find accounts, transactions, addresses, and other data quickly through various search interfaces.

## 1. Account Search Input

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
    className: 'search-input account-search',
    autocomplete: 'off',
    oninput: debounce((e) => {
        this.searchQuery = e.target.value;
        this.filterAccounts();
        this.updateSearchHighlight();
    }, 300),
    onkeydown: (e) => {
        if (e.key === 'Escape') {
            e.target.value = '';
            this.searchQuery = '';
            this.filterAccounts();
            e.target.blur();
        }
        if (e.key === 'Enter') {
            this.selectFirstResult();
        }
    },
    onfocus: () => this.showSearchSuggestions(),
    onblur: () => setTimeout(() => this.hideSearchSuggestions(), 200)
})
```

### Multi-field Search Logic
```javascript
filterAccounts() {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
        this.displayedAccounts = this.allAccounts;
        return;
    }
    
    // Search across multiple fields
    this.displayedAccounts = this.allAccounts.filter(account => {
        const searchableFields = [
            account.name,
            account.addresses?.bitcoin,
            account.addresses?.spark,
            account.addresses?.legacy,
            account.addresses?.taproot,
            account.id,
            account.color,
            account.tags?.join(' ')
        ];
        
        // Check each field
        return searchableFields.some(field => 
            field && field.toLowerCase().includes(query)
        );
    });
    
    // Sort by relevance
    this.sortByRelevance(query);
}
```

### Relevance Scoring
```javascript
sortByRelevance(query) {
    this.displayedAccounts.sort((a, b) => {
        const scoreA = this.calculateRelevance(a, query);
        const scoreB = this.calculateRelevance(b, query);
        return scoreB - scoreA;
    });
}

calculateRelevance(account, query) {
    let score = 0;
    
    // Exact name match
    if (account.name.toLowerCase() === query) score += 100;
    
    // Name starts with query
    if (account.name.toLowerCase().startsWith(query)) score += 50;
    
    // Name contains query
    if (account.name.toLowerCase().includes(query)) score += 25;
    
    // Address match (partial)
    const addresses = Object.values(account.addresses || {});
    addresses.forEach(addr => {
        if (addr && addr.toLowerCase().includes(query)) score += 10;
    });
    
    // Recent activity bonus
    if (account.lastActivity > Date.now() - 86400000) score += 5;
    
    return score;
}
```

---

## 2. Transaction Search

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: TransactionHistory

### Implementation
```javascript
$.input({
    type: 'text',
    placeholder: 'Search transactions (ID, address, amount, memo)...',
    className: 'transaction-search',
    value: this.txSearchQuery,
    oninput: debounce((e) => {
        this.txSearchQuery = e.target.value;
        this.filterTransactions();
    }, 300),
    onkeydown: (e) => {
        if (e.key === '/') {
            e.preventDefault();
            this.showAdvancedSearch();
        }
    }
})
```

### Transaction Filter Logic
```javascript
filterTransactions() {
    const query = this.txSearchQuery.toLowerCase().trim();
    
    if (!query) {
        this.filteredTransactions = this.allTransactions;
        return;
    }
    
    // Parse special filters
    const filters = this.parseSearchFilters(query);
    
    this.filteredTransactions = this.allTransactions.filter(tx => {
        // Amount filter
        if (filters.amount) {
            const txAmount = Math.abs(tx.amount);
            if (!this.matchesAmountFilter(txAmount, filters.amount)) {
                return false;
            }
        }
        
        // Date filter
        if (filters.date) {
            if (!this.matchesDateFilter(tx.timestamp, filters.date)) {
                return false;
            }
        }
        
        // Type filter
        if (filters.type) {
            if (tx.type !== filters.type) {
                return false;
            }
        }
        
        // General search
        if (filters.query) {
            const searchFields = [
                tx.id,
                tx.address,
                tx.memo,
                tx.amount.toString(),
                new Date(tx.timestamp).toLocaleDateString()
            ];
            
            return searchFields.some(field => 
                field && field.toLowerCase().includes(filters.query)
            );
        }
        
        return true;
    });
}
```

### Search Filter Parser
```javascript
parseSearchFilters(query) {
    const filters = {};
    
    // Amount filters: >0.1, <1, =0.5
    const amountMatch = query.match(/([<>=])(\d+\.?\d*)/);
    if (amountMatch) {
        filters.amount = {
            operator: amountMatch[1],
            value: parseFloat(amountMatch[2])
        };
        query = query.replace(amountMatch[0], '').trim();
    }
    
    // Date filters: after:2024-01-01, before:2024-12-31
    const dateMatch = query.match(/(after|before):(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        filters.date = {
            type: dateMatch[1],
            value: new Date(dateMatch[2])
        };
        query = query.replace(dateMatch[0], '').trim();
    }
    
    // Type filters: type:send, type:receive
    const typeMatch = query.match(/type:(send|receive|internal)/);
    if (typeMatch) {
        filters.type = typeMatch[1];
        query = query.replace(typeMatch[0], '').trim();
    }
    
    // Remaining query
    if (query) {
        filters.query = query;
    }
    
    return filters;
}
```

---

## 3. Address Book Search

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: AddressBook

### Implementation
```javascript
$.input({
    type: 'text',
    placeholder: 'Search contacts...',
    className: 'address-book-search',
    value: this.contactSearchQuery,
    oninput: (e) => {
        this.contactSearchQuery = e.target.value;
        this.filterContacts();
        this.highlightMatches();
    },
    onkeydown: (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectNextContact();
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectPreviousContact();
        }
    }
})
```

### Contact Search with Fuzzy Matching
```javascript
filterContacts() {
    const query = this.contactSearchQuery.toLowerCase().trim();
    
    if (!query) {
        this.displayedContacts = this.allContacts;
        return;
    }
    
    // Fuzzy search implementation
    this.displayedContacts = this.allContacts
        .map(contact => ({
            ...contact,
            score: this.fuzzyScore(query, contact)
        }))
        .filter(contact => contact.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ score, ...contact }) => contact);
}

fuzzyScore(query, contact) {
    const fields = [
        { value: contact.name, weight: 3 },
        { value: contact.address, weight: 2 },
        { value: contact.label, weight: 1 },
        { value: contact.notes, weight: 0.5 }
    ];
    
    let totalScore = 0;
    
    fields.forEach(({ value, weight }) => {
        if (!value) return;
        
        const fieldScore = this.calculateFuzzyScore(
            query, 
            value.toLowerCase()
        );
        totalScore += fieldScore * weight;
    });
    
    return totalScore;
}

calculateFuzzyScore(needle, haystack) {
    let score = 0;
    let j = 0;
    
    for (let i = 0; i < needle.length; i++) {
        const char = needle[i];
        const index = haystack.indexOf(char, j);
        
        if (index === -1) return 0;
        
        // Bonus for consecutive matches
        if (index === j) score += 2;
        else score += 1;
        
        j = index + 1;
    }
    
    // Bonus for shorter haystacks (more relevant)
    score = score * (needle.length / haystack.length);
    
    return score;
}
```

---

## 4. Global Search (Omnibar)

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: GlobalSearch

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'global-search',
    placeholder: 'Search everything... (Ctrl+K)',
    className: 'omnibar',
    autocomplete: 'off',
    oninput: debounce((e) => {
        this.performGlobalSearch(e.target.value);
    }, 200),
    onkeydown: (e) => {
        if (e.key === 'Escape') {
            this.closeGlobalSearch();
        }
        if (e.key === 'Enter') {
            this.executeSelectedResult();
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
        }
    }
})
```

### Multi-category Search
```javascript
async performGlobalSearch(query) {
    if (!query || query.length < 2) {
        this.searchResults = [];
        return;
    }
    
    // Search in parallel across categories
    const [accounts, transactions, addresses, settings, commands] = 
        await Promise.all([
            this.searchAccounts(query),
            this.searchTransactions(query),
            this.searchAddresses(query),
            this.searchSettings(query),
            this.searchCommands(query)
        ]);
    
    // Combine and sort results
    this.searchResults = [
        ...accounts.map(r => ({ ...r, category: 'Accounts' })),
        ...transactions.map(r => ({ ...r, category: 'Transactions' })),
        ...addresses.map(r => ({ ...r, category: 'Addresses' })),
        ...settings.map(r => ({ ...r, category: 'Settings' })),
        ...commands.map(r => ({ ...r, category: 'Commands' }))
    ].sort((a, b) => b.relevance - a.relevance);
    
    this.displaySearchResults();
}
```

---

## 5. Search Result Highlighting

### Implementation
```javascript
highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// React-style component
renderHighlightedText(text, query) {
    const parts = text.split(new RegExp(`(${this.escapeRegex(query)})`, 'gi'));
    
    return $.span({}, parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase()
            ? $.mark({ className: 'highlight' }, part)
            : part
    ));
}
```

---

## Common Patterns

### 1. Search Debouncing
```javascript
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
```

### 2. Search History
```javascript
class SearchHistory {
    constructor(maxItems = 10) {
        this.history = JSON.parse(
            localStorage.getItem('searchHistory') || '[]'
        );
        this.maxItems = maxItems;
    }
    
    add(query) {
        // Remove if exists
        this.history = this.history.filter(h => h.query !== query);
        
        // Add to beginning
        this.history.unshift({
            query,
            timestamp: Date.now()
        });
        
        // Limit size
        if (this.history.length > this.maxItems) {
            this.history.pop();
        }
        
        this.save();
    }
    
    save() {
        localStorage.setItem(
            'searchHistory', 
            JSON.stringify(this.history)
        );
    }
}
```

### 3. Search Shortcuts
```javascript
// Global keyboard shortcut
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for global search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openGlobalSearch();
    }
    
    // / for quick search (when not in input)
    if (e.key === '/' && !this.isInputFocused()) {
        e.preventDefault();
        this.focusSearch();
    }
});
```

## Mobile Considerations

### Touch-friendly Search
```css
.search-input {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 12px 40px 12px 16px; /* Space for clear button */
}

.clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
}
```

### Voice Search
```javascript
// Voice search button
$.button({
    className: 'voice-search',
    onclick: () => this.startVoiceSearch(),
    'aria-label': 'Voice search'
})

startVoiceSearch() {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.searchInput.value = transcript;
        this.performSearch(transcript);
    };
    
    recognition.start();
}
```

## Testing Checklist

- [ ] Basic text search
- [ ] Filter syntax parsing
- [ ] Fuzzy matching accuracy
- [ ] Search result relevance
- [ ] Highlighting accuracy
- [ ] Keyboard navigation
- [ ] Search history
- [ ] Debouncing performance
- [ ] Mobile keyboard behavior
- [ ] Voice search (if supported)