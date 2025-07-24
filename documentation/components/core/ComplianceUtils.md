# ComplianceUtils Class Documentation

**Last Updated**: 2025-07-21  
**Location**: `/public/js/moosh-wallet.js` (Lines 315-453)  
**Critical**: YES - Core utility class used throughout the entire application

## Overview

ComplianceUtils is THE most critical utility class in MOOSH Wallet. It enforces code standards, provides essential utilities, and ensures consistent behavior across all components. EVERY developer MUST understand and use these utilities correctly.

## Class Structure

```javascript
class ComplianceUtils {
    // Core utilities for consistent application behavior
}
```

## Method Reference

### 1. `debounce(func, wait = 300)`

**Purpose**: Prevents rapid function execution - REQUIRED for all user input handlers  
**Usage**: Wrap any function that could be called rapidly (typing, scrolling, clicking)  
**Returns**: Debounced function

```javascript
// CORRECT - Prevents API spam
const debouncedSearch = ComplianceUtils.debounce((query) => {
    searchOrdinals(query);
}, 300);

// CORRECT - Prevents excessive state updates
this.updateAccountColorDebounced = ComplianceUtils.debounce((accountId, color) => {
    this.updateAccountColor(accountId, color);
}, 300);

// WRONG - Will cause performance issues
inputElement.addEventListener('input', (e) => {
    searchOrdinals(e.target.value); // NO debouncing!
});
```

**Common Mistakes**:
- Not using debounce for input handlers
- Setting wait time too low (< 300ms)
- Creating multiple debounced instances of the same function

### 2. `validateInput(value, type)`

**Purpose**: Validates and sanitizes ALL user inputs - SECURITY CRITICAL  
**Supported Types**: `accountName`, `color`, `mnemonic`, `password`  
**Returns**: `{ valid: boolean, error?: string, sanitized?: string }`

```javascript
// CORRECT - Always validate before using
const nameValidation = ComplianceUtils.validateInput(userInput, 'accountName');
if (!nameValidation.valid) {
    throw new Error(nameValidation.error);
}
const safeName = nameValidation.sanitized;

// CORRECT - Validate colors
const colorValidation = ComplianceUtils.validateInput(color, 'color');
if (!colorValidation.valid) {
    console.warn('Invalid color:', colorValidation.error);
    return;
}

// WRONG - Never use raw input
const accountName = inputElement.value; // DANGEROUS!
account.name = accountName; // XSS vulnerability!
```

**Validation Rules**:

#### accountName:
- Required (non-empty)
- Max 50 characters
- No HTML/script tags
- Returns trimmed value

#### color:
- Must be hex format (#RRGGBB)
- 6 characters after #
- Returns uppercase value

#### mnemonic:
- Must be 12 or 24 words
- Whitespace normalized
- Returns space-separated words

#### password:
- Min 8 characters
- Max 128 characters
- No sanitization (preserves special chars)

### 3. `getStatusIndicator(status)`

**Purpose**: Returns ASCII indicators - NO EMOJIS allowed in MOOSH  
**Returns**: String indicator like `[OK]`, `[XX]`, `[!!]`

```javascript
// CORRECT - Use ASCII indicators
const status = ComplianceUtils.getStatusIndicator('success'); // Returns '[OK]'
console.log(`Operation completed ${status}`);

// WRONG - Never use emojis
const status = '✅'; // FORBIDDEN in MOOSH!
```

**Available Indicators**:
- `success` → `[OK]`
- `error` → `[XX]`
- `warning` → `[!!]`
- `info` → `[..]`
- `loading` → `[~~]`
- `ready` → `[>>]`
- `stop` → `[X]`
- `unknown` → `[??]`
- `money` → `[$$]`
- `settings` → `[~]`
- `count` → `[#]`

### 4. `safeArrayAccess(array, index, defaultValue = null)`

**Purpose**: Prevents array out-of-bounds errors  
**Returns**: Element at index or defaultValue

```javascript
// CORRECT - Safe access
const account = ComplianceUtils.safeArrayAccess(accounts, index, null);
if (account) {
    // Use account safely
}

// WRONG - Can throw errors
const account = accounts[index]; // What if index >= accounts.length?
```

### 5. `fixArrayIndex(currentIndex, arrayLength)`

**Purpose**: Fixes index after array deletions  
**Returns**: Valid index or -1 if array empty

```javascript
// CORRECT - After deleting array element
this.state.currentAccountIndex = ComplianceUtils.fixArrayIndex(
    this.state.currentAccountIndex, 
    accounts.length
);

// WRONG - Index might be invalid
accounts.splice(index, 1);
// currentIndex could now be >= accounts.length!
```

### 6. `log(component, message, type = 'log')`

**Purpose**: Standardized logging with component context  
**Types**: `log`, `warn`, `error`

```javascript
// CORRECT - Always include component name
ComplianceUtils.log('StateManager', 'Account created successfully');
ComplianceUtils.log('APIService', 'Failed to fetch: ' + error.message, 'error');
ComplianceUtils.log('Dashboard', 'Performance warning', 'warn');

// WRONG - Generic console.log
console.log('Something happened'); // Which component? When?
```

**Log Format**: `[Component] Message {timestamp: ISO}`

### 7. `canDelete(currentCount, minimum = 1)`

**Purpose**: Prevents deletion of last required item  
**Returns**: Boolean

```javascript
// CORRECT - Check before deletion
if (!ComplianceUtils.canDelete(accounts.length)) {
    this.app.showNotification('Cannot delete the last account', 'error');
    return;
}

// WRONG - Might delete last item
accounts.splice(index, 1); // What if this was the last account?
```

### 8. `isMobileDevice()`

**Purpose**: Reliable mobile detection  
**Returns**: Boolean

```javascript
// CORRECT - Adjust UI for mobile
if (ComplianceUtils.isMobileDevice()) {
    element.style.fontSize = '16px'; // Larger for touch
} else {
    element.style.fontSize = '14px';
}
```

### 9. `measurePerformance(operation, callback)`

**Purpose**: Performance monitoring with automatic warnings  
**Warns**: If operation takes > 100ms

```javascript
// CORRECT - Monitor expensive operations
const result = await ComplianceUtils.measurePerformance('Bitcoin Price Fetch', async () => {
    return await fetchBitcoinPrice();
});

// Output if slow: [Performance] Bitcoin Price Fetch took 245.32ms
```

## Performance Guidelines

### When to Use Each Method

1. **ALWAYS use `debounce`** for:
   - Input event handlers
   - Window resize handlers
   - Scroll event handlers
   - Any rapidly firing events

2. **ALWAYS use `validateInput`** for:
   - Form submissions
   - User-provided data
   - Before storing in state
   - Before API calls

3. **ALWAYS use `log`** instead of console.log for:
   - Error tracking
   - Debug information
   - State changes
   - API responses

4. **ALWAYS use `measurePerformance`** for:
   - API calls
   - Heavy computations
   - DOM manipulations
   - State updates

## Common Integration Patterns

### Pattern 1: Form Handling
```javascript
// Complete form handling pattern
class MyForm {
    constructor(app) {
        this.app = app;
        
        // Create debounced validator
        this.validateFormDebounced = ComplianceUtils.debounce(() => {
            this.validateForm();
        }, 300);
    }
    
    handleInput(e) {
        const validation = ComplianceUtils.validateInput(e.target.value, 'accountName');
        
        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }
        
        // Use sanitized value
        this.formData.name = validation.sanitized;
        this.validateFormDebounced();
    }
    
    async submit() {
        ComplianceUtils.log('MyForm', 'Submitting form');
        
        try {
            const result = await ComplianceUtils.measurePerformance('Form Submit', async () => {
                return await this.app.apiService.submitForm(this.formData);
            });
            
            ComplianceUtils.log('MyForm', 'Form submitted successfully');
        } catch (error) {
            ComplianceUtils.log('MyForm', 'Form submission failed: ' + error.message, 'error');
        }
    }
}
```

### Pattern 2: List Management
```javascript
// Safe list operations pattern
class ListManager {
    deleteItem(index) {
        const item = ComplianceUtils.safeArrayAccess(this.items, index);
        if (!item) {
            ComplianceUtils.log('ListManager', 'Invalid index: ' + index, 'warn');
            return;
        }
        
        if (!ComplianceUtils.canDelete(this.items.length)) {
            this.app.showNotification('Cannot delete last item', 'error');
            return;
        }
        
        this.items.splice(index, 1);
        this.currentIndex = ComplianceUtils.fixArrayIndex(this.currentIndex, this.items.length);
        
        ComplianceUtils.log('ListManager', `Deleted item at index ${index}`);
    }
}
```

### Pattern 3: Mobile-Responsive Components
```javascript
// Mobile-aware component pattern
class ResponsiveComponent {
    render() {
        const isMobile = ComplianceUtils.isMobileDevice();
        
        return $.div({
            className: isMobile ? 'mobile-layout' : 'desktop-layout',
            style: {
                padding: isMobile ? '10px' : '20px',
                fontSize: isMobile ? '16px' : '14px'
            }
        }, [
            $.button({
                onclick: ComplianceUtils.debounce(() => this.handleClick(), 300)
            }, `Click Me ${ComplianceUtils.getStatusIndicator('ready')}`)
        ]);
    }
}
```

## Critical Rules

1. **NEVER skip validation** - Always use `validateInput` for user data
2. **NEVER use console.log directly** - Always use `ComplianceUtils.log`
3. **NEVER forget debouncing** - Wrap all rapid-fire handlers
4. **NEVER use emojis** - Always use `getStatusIndicator` for status
5. **NEVER access arrays directly** - Use `safeArrayAccess` for safety
6. **NEVER skip performance monitoring** - Wrap expensive operations

## TestSprite Validation

TestSprite specifically checks for:
- Proper use of `debounce` on event handlers
- Use of `validateInput` before state storage
- Use of `log` instead of console methods
- Performance monitoring on API calls

## Memory Implications

- Debounced functions hold references - clean up in component destruction
- Log calls are lightweight - use freely for debugging
- Performance measurements are temporary - no memory concerns
- Validation creates new objects - original input unchanged

## Security Notes

- `validateInput` prevents XSS attacks by stripping HTML
- Always use sanitized values, never raw input
- Password validation doesn't log the actual password
- Mnemonic validation doesn't store the phrase

## Migration Guide

If you find code not using ComplianceUtils:

```javascript
// Old code:
element.addEventListener('input', (e) => {
    searchFunction(e.target.value);
});

// Migrate to:
element.addEventListener('input', ComplianceUtils.debounce((e) => {
    const validation = ComplianceUtils.validateInput(e.target.value, 'accountName');
    if (validation.valid) {
        searchFunction(validation.sanitized);
    }
}, 300));
```

## Debugging Tips

1. Enable verbose logging:
```javascript
// Temporarily wrap a section for detailed logs
ComplianceUtils.log('Debug', '=== Starting Operation ===');
// ... your code ...
ComplianceUtils.log('Debug', '=== Operation Complete ===');
```

2. Performance bottleneck detection:
```javascript
// Wrap suspected slow code
await ComplianceUtils.measurePerformance('Suspicious Operation', async () => {
    // This will warn if > 100ms
});
```

3. Validation debugging:
```javascript
const validation = ComplianceUtils.validateInput(value, type);
ComplianceUtils.log('Debug', `Validation result: ${JSON.stringify(validation)}`);
```

## Summary

ComplianceUtils is not optional - it's the foundation of MOOSH Wallet's stability, security, and performance. Every component must use these utilities correctly. When in doubt, look at existing usage patterns in the codebase.

Remember: **If you're not using ComplianceUtils, you're doing it wrong!**