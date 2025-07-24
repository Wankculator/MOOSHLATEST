# ElementFactory - AI Context Guide

## Critical Understanding

ElementFactory is the **FOUNDATION** of the entire UI rendering system in MOOSH Wallet. Every single visual element passes through this factory. Breaking this breaks EVERYTHING.

## When Modifying ElementFactory

### Pre-Flight Checklist
- [ ] Have you loaded the ENTIRE moosh-wallet.js file?
- [ ] Have you identified ALL components that use ElementFactory?
- [ ] Have you checked for any custom element types beyond standard HTML?
- [ ] Have you verified browser compatibility requirements?
- [ ] Have you considered memory implications of changes?

### Absolute Rules
1. **NEVER use innerHTML** - This is a security boundary
2. **NEVER modify the method signatures** - Every component depends on them
3. **ALWAYS handle null/undefined** - Defensive programming is critical
4. **ALWAYS preserve the event handler pattern** - on* prefix convention

## Code Patterns to Preserve

### Attribute Handling Pattern
```javascript
// CORRECT - Current Implementation
if (key === 'style' && typeof value === 'object') {
    Object.assign(element.style, value);
} else if (key === 'dataset') {
    Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
    });
}

// WRONG - Do NOT simplify to
element[key] = value; // This breaks special cases!
```

### Children Handling Pattern
```javascript
// CORRECT - Handles all edge cases
children.forEach(child => {
    if (child === null || child === undefined) return;
    if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
        element.appendChild(child);
    } else if (Array.isArray(child)) {
        // Nested array handling
    }
});

// WRONG - Too simplistic
children.forEach(child => element.appendChild(child)); // Breaks on strings!
```

## Common AI Hallucinations to Avoid

### 1. React-like Patterns
```javascript
// HALLUCINATION - This is NOT React!
static create(tag, props, ...children) { // WRONG - uses rest params
    return React.createElement(tag, props, children); // WRONG - no React!
}
```

### 2. Modern JS Features Not Used
```javascript
// HALLUCINATION - Over-modernization
static create(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // WRONG - Original doesn't use destructuring in parameters
    const { style, dataset, className, ...otherAttrs } = attrs;
}
```

### 3. jQuery Patterns
```javascript
// HALLUCINATION - No jQuery!
$(element).attr(attrs).append(children); // WRONG
```

## Performance Considerations

### Current Performance Profile
- **Creation Time**: ~0.1ms per element
- **Memory**: ~200 bytes per element
- **GC Impact**: Minimal due to direct returns

### What NOT to Add
1. **Caching** - Elements must be fresh instances
2. **Validation** - Keep it fast, browser validates
3. **Logging** - Would slow down entire UI

## Integration Points

### Used By (Critical Components)
1. **StateManager** - For reactive UI updates
2. **Router** - For page rendering
3. **All Page Components** - Every single one
4. **Modal System** - For overlays
5. **Notification System** - For alerts

### Change Impact Analysis
- Modifying `create()` affects: **100% of UI**
- Adding parameters: **Breaking change**
- Changing return type: **Application crash**
- Performance regression: **Entire app slows**

## Safe Modification Patterns

### Adding New Element Type
```javascript
// SAFE - Follows existing pattern exactly
static article(attrs = {}, children = []) {
    return this.create('article', attrs, children);
}
```

### Adding New Attribute Handler
```javascript
// SAFE - Extends without breaking
} else if (key === 'newSpecialCase') {
    // Handle new case
    handleNewSpecialCase(element, value);
} else if (key.startsWith('on')) {
    // Existing code preserved
```

## Testing Requirements

Before ANY modification:
1. Create 1000 elements rapidly - check memory
2. Test all attribute types - style, dataset, events
3. Test nested children 5 levels deep
4. Test null/undefined in every position
5. Test in Chrome, Firefox, Safari, Edge

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me simplify this..." - NO! Complexity handles edge cases
2. "We could use innerHTML here..." - NEVER! Security risk
3. "Modern syntax would be cleaner..." - Compatibility matters
4. "This seems redundant..." - It's handling an edge case

## Recovery Procedures

If you break ElementFactory:
1. **Immediate**: Revert all changes
2. **Check**: Browser console for errors
3. **Test**: Can you create a simple div?
4. **Verify**: All pages still render
5. **Rollback**: Use git to restore

## AI Instructions Summary

When asked to modify ElementFactory:
1. **LOAD** the entire context first
2. **ANALYZE** all usage patterns
3. **PRESERVE** existing patterns exactly
4. **TEST** mentally through all edge cases
5. **WARN** about any breaking changes

Remember: ElementFactory is the foundation. Like replacing the foundation of a house - extreme caution required!