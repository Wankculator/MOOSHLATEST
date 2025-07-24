# Core Documentation - CRITICAL FOR ALL DEVELOPERS

**Last Updated**: 2025-07-21  
**IMPORTANT**: Every developer MUST read and understand these documents before writing any code for MOOSH Wallet

## Overview

This directory contains the most critical documentation for MOOSH Wallet development. These are not optional reading - they define mandatory patterns and security requirements that MUST be followed.

## Required Reading Order

1. **[ComplianceUtils.md](./ComplianceUtils.md)** - START HERE
   - The foundation of all MOOSH code
   - Every utility method explained with examples
   - Required for TestSprite compliance

2. **[SecurityImplementationPatterns.md](./SecurityImplementationPatterns.md)** - SECURITY CRITICAL
   - Concrete code examples for secure operations
   - Crypto API usage patterns
   - XSS prevention techniques
   - Never use Math.random() for security!

3. **[ErrorHandlingPatterns.md](./ErrorHandlingPatterns.md)** - USER EXPERIENCE
   - Standard error handling patterns
   - User notification strategies
   - Logging requirements
   - Recovery procedures

4. **[PerformanceOptimizationGuide.md](./PerformanceOptimizationGuide.md)** - PERFORMANCE
   - Debouncing/throttling patterns (MANDATORY)
   - Virtual scrolling implementation
   - Memory management strategies
   - Animation optimization

5. **[StoragePatternsGuide.md](./StoragePatternsGuide.md)** - DATA PERSISTENCE
   - What can/cannot be stored
   - Encryption requirements
   - Storage limits and cleanup
   - Migration strategies

## Quick Reference

### Most Critical Rules

1. **ALWAYS use ComplianceUtils** for:
   - Input validation (`validateInput`)
   - Event debouncing (`debounce`)
   - Logging (`log`)
   - Performance measurement (`measurePerformance`)

2. **NEVER do these**:
   - Use `Math.random()` for security
   - Store sensitive data unencrypted
   - Use `innerHTML` with user data
   - Skip input validation
   - Ignore error handling

3. **ALWAYS do these**:
   - Validate ALL user inputs
   - Encrypt sensitive data before storage
   - Use HTTPS for external APIs
   - Clean up event listeners
   - Handle errors gracefully

### Common Patterns

#### Secure Random Generation
```javascript
// NEVER
const random = Math.floor(Math.random() * max);

// ALWAYS
const random = SecureRandom.getRandomInt(max);
```

#### Input Validation
```javascript
// NEVER
const name = inputElement.value;

// ALWAYS
const validation = ComplianceUtils.validateInput(inputElement.value, 'accountName');
if (!validation.valid) {
    throw new Error(validation.error);
}
const name = validation.sanitized;
```

#### Event Handling
```javascript
// NEVER
element.addEventListener('input', handleInput);

// ALWAYS
element.addEventListener('input', ComplianceUtils.debounce(handleInput, 300));
```

#### Error Handling
```javascript
// NEVER
try {
    riskyOperation();
} catch (e) {
    // Silent fail
}

// ALWAYS
try {
    ComplianceUtils.log('Component', 'Starting operation');
    await riskyOperation();
} catch (error) {
    ComplianceUtils.log('Component', 'Operation failed: ' + error.message, 'error');
    this.app.showNotification('Operation failed. Please try again.', 'error');
}
```

## Testing Your Code

Before committing ANY code:

1. **Run all MCPs**:
   ```bash
   npm run mcp:validate-all
   ```

2. **Check these patterns are followed**:
   - ✓ All inputs validated
   - ✓ All events debounced/throttled
   - ✓ All errors handled
   - ✓ No Math.random() usage
   - ✓ No sensitive data in localStorage

3. **Verify performance**:
   - Page load < 3 seconds
   - API responses < 500ms
   - Memory usage < 200MB
   - 60fps animations

## Getting Help

If you're unsure about any pattern:

1. **Check existing code** - Find similar functionality and follow its pattern
2. **Read the full guide** - Each document has detailed examples
3. **Run TestSprite** - It will catch common mistakes
4. **Ask questions** - Better to ask than implement incorrectly

## Important Notes

- These patterns are based on production experience and security audits
- They are not suggestions - they are requirements
- TestSprite validates many of these patterns automatically
- Memory MCP will catch performance issues
- Security MCP will catch security vulnerabilities

## Updates

These documents are living guides and will be updated as new patterns emerge or security requirements change. Check the "Last Updated" date at the top of each document.

Remember: **Quality and security are not optional in a cryptocurrency wallet!**