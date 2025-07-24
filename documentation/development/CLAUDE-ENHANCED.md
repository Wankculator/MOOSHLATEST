# MOOSH Wallet Development Guidelines - Enhanced Edition

## Table of Contents
1. [Critical Rules](#critical-rules)
2. [100% Compliance Standards](#100-compliance-standards)
3. [Code Style Guide](#code-style-guide)
4. [Bug Prevention Patterns](#bug-prevention-patterns)
5. [Testing Requirements](#testing-requirements)
6. [Performance Guidelines](#performance-guidelines)
7. [Mobile Development](#mobile-development)
8. [ASCII Art Reference](#ascii-art-reference)

---

## Critical Rules

### 1. NEVER MODIFY Seed Generation
**Files/Lines That MUST NOT Be Changed:**
```
/public/js/moosh-wallet.js - Lines 1896-1922 (generateSparkWallet)
/public/js/moosh-wallet.js - Lines 3224-3261 (generateWallet)
/src/server/api-server.js - Line 126 (POST /api/spark/generate-wallet)
```

**Required Response Structure:**
```javascript
{
    success: true,
    data: {
        mnemonic: "string format, not array",
        addresses: {
            bitcoin: "address",
            spark: "address"
        },
        privateKeys: {
            bitcoin: { wif: "...", hex: "..." },
            spark: { hex: "..." }
        }
    }
}
```

### 2. Single-File Architecture
- ALL wallet functionality in `/public/js/moosh-wallet.js`
- Test files are standalone HTML files
- No code fragmentation

---

## 100% Compliance Standards

### 1. NO EMOJIS - Use ASCII Only
```
BANNED: 🚀 ✅ ❌ 🔍 💰 ⚡ 🎨 📊
ALLOWED: [>] [OK] [X] [?] [$] [!] [*] [=]
```

**ASCII Indicator Reference:**
```
[>]  or >>   = Run/Start/Play
[X]  or XX   = Stop/Error/Failed
[OK] or ++   = Success/Pass
[!!] or !!   = Warning
[?]  or ??   = Search/Unknown
[$]  or $$   = Money/Bitcoin
[*]  or **   = Special/Important
[=]  or ==   = Stats/Data
[#]  or ##   = Number/Count
[~]  or ~~   = Settings/Config
```

### 2. Orange/Black Theme ONLY
```css
/* Primary Colors */
--primary-orange: #f57315;
--light-orange: #ff8c42;
--dark-orange: #e85d04;
--peach: #ffb366;
--red-orange: #dc2f02;
--yellow-orange: #faa307;
--bright-orange: #fb8500;
--gold: #ffba08;

/* Base Colors */
--black: #000000;
--dark-gray: #111111;
--gray: #333333;
```

### 3. Terminal Aesthetic
- Monospace fonts only: 'Courier New', monospace
- Sharp corners (border-radius: 0)
- ASCII borders and dividers
- No rounded elements

### 4. Input Validation Required
```javascript
// EVERY user input must be validated
function validateInput(value, type) {
    switch(type) {
        case 'accountName':
            if (!value || !value.trim()) return { valid: false, error: 'Name required' };
            if (value.length > 50) return { valid: false, error: 'Max 50 characters' };
            if (/<[^>]*>/g.test(value)) return { valid: false, error: 'Invalid characters' };
            return { valid: true, sanitized: value.trim() };
        
        case 'color':
            if (!value || !value.match(/^#[0-9A-Fa-f]{6}$/)) {
                return { valid: false, error: 'Invalid color format' };
            }
            return { valid: true, value };
        
        default:
            return { valid: false, error: 'Unknown input type' };
    }
}
```

### 5. Debouncing Required (300ms)
```javascript
// Utility function - MUST be used for all rapid actions
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Usage examples:
this.debouncedColorUpdate = debounce(this.updateColor, 300);
this.debouncedSearch = debounce(this.performSearch, 300);
this.debouncedSave = debounce(this.saveState, 300);
```

### 6. Mobile Responsive Breakpoints
```css
/* Required breakpoints */
@media (max-width: 768px) {
    /* Tablet adjustments */
}

@media (max-width: 480px) {
    /* Mobile adjustments */
}

@media (max-width: 320px) {
    /* Small mobile adjustments */
}
```

### 7. Error Handling Pattern
```javascript
// EVERY async operation must have try-catch
async function safeOperation() {
    try {
        // Show loading state
        this.setLoading(true);
        
        // Perform operation
        const result = await riskyOperation();
        
        // Success notification
        this.showNotification('Operation successful', 'success');
        return result;
        
    } catch (error) {
        console.error('[Component] Operation failed:', error);
        this.showNotification('Operation failed: ' + error.message, 'error');
        
        // Recovery attempt if possible
        if (this.canRecover) {
            return this.fallbackOperation();
        }
        
        throw error;
    } finally {
        this.setLoading(false);
    }
}
```

---

## Code Style Guide

### 1. Function Naming
```javascript
// Good - descriptive, camelCase
createAccount()
validateAccountName()
updateAccountColor()
deleteAccountWithConfirmation()

// Bad - unclear, wrong case
makeAcct()
check_name()
UpdateColor()
del()
```

### 2. Console Logging Format
```javascript
// Required format: [Component] Message
console.log('[StateManager] Creating account:', accountName);
console.error('[AccountModal] Failed to delete:', error);
console.warn('[Dashboard] Missing required field');
```

### 3. Comments
```javascript
// NO EMOJIS in comments
// Good: Clear, concise, no emojis
// TODO: Implement drag and drop
// FIXME: Handle edge case for empty accounts
// NOTE: This is a critical section

// Bad: Contains emojis
// TODO: 🚀 Implement drag and drop
// ⚠️ Warning: Critical section
```

---

## Bug Prevention Patterns

### 1. Array Bounds Checking
```javascript
// ALWAYS check bounds before array access
if (index >= 0 && index < array.length) {
    return array[index];
}

// After deletion, fix current index
if (this.currentIndex >= this.accounts.length) {
    this.currentIndex = Math.max(0, this.accounts.length - 1);
}
```

### 2. Null/Undefined Checks
```javascript
// Chain optional checks
const address = account?.addresses?.bitcoin || '';

// Guard clauses
if (!account || !account.id) {
    console.error('[Component] Invalid account');
    return;
}
```

### 3. State Persistence Pattern
```javascript
// Debounced persistence
this.persistState = debounce(() => {
    try {
        localStorage.setItem('state', JSON.stringify(this.state));
    } catch (error) {
        console.error('[StateManager] Failed to persist:', error);
        // Handle quota exceeded
        if (error.name === 'QuotaExceededError') {
            this.cleanupOldData();
        }
    }
}, 300);
```

---

## Testing Requirements

### 1. Test File Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOOSH Test - [Test Name]</title>
    <!-- NO EMOJIS, proper viewport, monospace font -->
</head>
<body>
    <!-- Terminal-style UI only -->
</body>
</html>
```

### 2. Test Coverage Requirements
- Input validation edge cases
- Mobile responsiveness (320px minimum)
- Performance benchmarks (<100ms response)
- Error recovery scenarios
- State persistence integrity

### 3. Test Utilities
```javascript
// Standard test logging
function testLog(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = {
        'INFO': '[..]',
        'PASS': '[OK]',
        'FAIL': '[XX]',
        'WARN': '[!!]'
    }[status] || '[??]';
    
    console.log(`${timestamp} ${prefix} ${message}`);
}
```

---

## Performance Guidelines

### 1. Caching Strategy
```javascript
class CacheManager {
    constructor(ttl = 300000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}
```

### 2. Virtual Scrolling (for 50+ items)
```javascript
// Implement virtual scrolling for large lists
class VirtualList {
    constructor(container, items, itemHeight) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleRange = { start: 0, end: 20 };
    }
    
    // Only render visible items
    render() {
        const { start, end } = this.visibleRange;
        const visibleItems = this.items.slice(start, end);
        // Render only visible items with spacers
    }
}
```

---

## Mobile Development

### 1. Touch Event Handling
```javascript
// Support both mouse and touch
element.addEventListener('mousedown', handleStart);
element.addEventListener('touchstart', handleStart);

// Prevent double-firing
function handleStart(e) {
    e.preventDefault();
    // Handle interaction
}
```

### 2. Responsive Font Sizes
```css
/* Base font size */
body { font-size: 16px; }

/* Scale down for mobile */
@media (max-width: 480px) {
    body { font-size: 14px; }
    button { padding: 8px 16px; }
}
```

### 3. Performance on Mobile
- Debounce all inputs (500ms on mobile)
- Lazy load non-critical content
- Use CSS transforms for animations
- Minimize reflows and repaints

---

## ASCII Art Reference

### Headers and Titles
```
+================================+
|     MOOSH WALLET TERMINAL      |
+================================+

[====================]
[  ACCOUNT MANAGER   ]
[====================]

----- Section Title -----
```

### Borders and Frames
```
+--------+     +-----------------+
| Simple |     | Extended Frame  |
+--------+     | With Content    |
               +-----------------+

[*]========================[*]
 |    Decorated Border     |
[*]========================[*]
```

### Status Indicators
```
[>] Ready        [OK] Success
[X] Error        [!!] Warning
[..] Loading     [??] Unknown
[##] Count       [$$] Balance
```

### Progress Bars
```
[##########          ] 50%
[====================] 100%
|>>>>>>>>>>>>        | 60%
```

### Separators
```
=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
--------------------------------
********************************
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

---

## Quick Reference Card

### DO:
- Use ASCII indicators: [OK], [X], [>]
- Validate ALL inputs
- Debounce rapid actions (300ms)
- Handle errors with try-catch
- Test on 320px screens
- Use monospace fonts
- Cache API responses
- Show loading states

### DON'T:
- Use ANY emojis
- Trust user input
- Make synchronous API calls
- Ignore mobile users
- Use rounded corners
- Store passwords in localStorage
- Modify seed generation code
- Fragment code across files

---

## Enforcement Checklist

Before ANY commit:
- [ ] Zero emojis in code, comments, or strings
- [ ] All inputs have validation
- [ ] All rapid actions are debounced
- [ ] All async operations have try-catch
- [ ] Mobile responsive (320px+)
- [ ] Only orange/black colors used
- [ ] ASCII art only for visuals
- [ ] Performance < 100ms
- [ ] No console errors
- [ ] Tests pass at all breakpoints

---

**Remember**: 100% compliance is not optional. Every rule must be followed for production code.