# MOOSH Wallet Implementation Best Practices

## Purpose
These practices ensure code quality, security, and maintainability while preserving MOOSH's unique retro terminal aesthetic. They're tailored specifically for the MOOSH Wallet JavaScript/Node.js architecture.

---

## 1 — Before Coding

- **BP-1 (MUST)** Read existing code thoroughly before making changes
  - Understand current implementation patterns
  - Identify dependencies and side effects
  - Check for TODO/FIXME comments in the area

- **BP-2 (MUST)** Test existing functionality first
  - Run the wallet locally
  - Verify current features work
  - Document any existing bugs

- **BP-3 (SHOULD)** For major features, outline your approach
  - List files that need modification
  - Identify potential breaking changes
  - Consider security implications

---

## 2 — JavaScript/Node.js Standards

- **JS-1 (MUST)** Use CommonJS (`require/module.exports`) in Node.js files
  ```javascript
  // ✅ Correct for Node.js files
  const express = require('express');
  module.exports = { walletService };
  
  // ❌ Wrong - ES6 modules not configured
  import express from 'express';
  export default walletService;
  ```

- **JS-2 (MUST)** Use the existing ElementFactory pattern for UI
  ```javascript
  // ✅ Correct - using MOOSH's pattern
  const button = $.button({
    className: 'wallet-button',
    onclick: handleClick
  }, ['Generate Wallet']);
  
  // ❌ Wrong - raw DOM manipulation
  const button = document.createElement('button');
  ```

- **JS-3 (MUST)** Follow existing naming conventions
  - camelCase for functions and variables
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
  - Match existing file naming patterns

- **JS-4 (SHOULD)** Avoid modern JS features that might break compatibility
  - Optional chaining (?.) - check browser support
  - Nullish coalescing (??) - use || when appropriate
  - Test in multiple browsers

---

## 3 — Security Practices

- **SEC-1 (MUST)** Never expose private keys or seeds client-side
  ```javascript
  // ❌ NEVER do this
  res.json({ 
    seed: mnemonic,
    privateKey: wallet.privateKey 
  });
  
  // ✅ Only return public information
  res.json({ 
    address: wallet.address,
    publicKey: wallet.publicKey 
  });
  ```

- **SEC-2 (MUST)** Validate all API inputs
  ```javascript
  // ✅ Good - validate before processing
  app.post('/api/wallet/generate', (req, res) => {
    const { wordCount } = req.body;
    
    if (![12, 24].includes(wordCount)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid word count'
      });
    }
    // ... continue processing
  });
  ```

- **SEC-3 (MUST)** Use crypto.getRandomValues for entropy
  ```javascript
  // ✅ Secure random generation
  const entropy = crypto.getRandomValues(new Uint8Array(16));
  
  // ❌ Never use Math.random() for crypto
  const entropy = Math.random();
  ```

- **SEC-4 (SHOULD)** Sanitize error messages
  ```javascript
  // ❌ Don't expose internal details
  catch (error) {
    res.status(500).json({ error: error.stack });
  }
  
  // ✅ Generic error for production
  catch (error) {
    console.error('Wallet generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate wallet' 
    });
  }
  ```

---

## 4 — UI/UX Standards

- **UI-1 (MUST)** Preserve the retro terminal aesthetic
  - Black background (#000000)
  - Green/orange text (#00ff00, #f57315)
  - Monospace fonts (JetBrains Mono)
  - Terminal-style borders and effects

- **UI-2 (MUST)** Maintain responsive design
  ```javascript
  // ✅ Use MOOSH's responsive utilities
  const fontSize = ResponsiveUtils.getResponsiveValue(
    '14px',  // mobile
    '16px',  // tablet
    '18px'   // desktop
  );
  ```

- **UI-3 (SHOULD)** Keep UI updates smooth
  - Show loading states during async operations
  - Provide user feedback for all actions
  - Handle errors gracefully with user-friendly messages

- **UI-4 (MUST)** Test on multiple screen sizes
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+

---

## 5 — Testing Practices

- **TEST-1 (MUST)** Add tests for new features
  ```javascript
  // Place in tests/unit/ or tests/integration/
  describe('Wallet Generation', () => {
    test('generates 12-word mnemonic', async () => {
      const wallet = await generateWallet(12);
      expect(wallet.mnemonic.split(' ')).toHaveLength(12);
    });
  });
  ```

- **TEST-2 (SHOULD)** Test error cases
  ```javascript
  test('rejects invalid word count', async () => {
    await expect(generateWallet(15))
      .rejects.toThrow('Invalid word count');
  });
  ```

- **TEST-3 (SHOULD)** Use existing test patterns
  - Vitest for test runner
  - Follow existing test structure
  - Run `npm test` before committing

---

## 6 — Code Organization

- **ORG-1 (MUST)** Keep file structure consistent
  ```
  public/js/        # Frontend JavaScript
  src/server/       # Backend Node.js
  src/server/services/  # Business logic
  tests/           # Test files
  docs/            # Documentation
  ```

- **ORG-2 (SHOULD)** Avoid creating unnecessary files
  - Add to existing files when logical
  - Only create new files for distinct features
  - Clean up experimental/temporary files

- **ORG-3 (MUST)** Update relevant documentation
  - Add JSDoc comments for complex functions
  - Update README if adding new features
  - Document API changes

---

## 7 — API Development

- **API-1 (MUST)** Follow existing endpoint patterns
  ```javascript
  // ✅ Consistent with MOOSH patterns
  app.post('/api/wallet/generate', async (req, res) => {
    try {
      // ... implementation
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  ```

- **API-2 (SHOULD)** Version breaking changes
  - Consider `/api/v2/` for major changes
  - Maintain backward compatibility when possible
  - Document deprecated endpoints

---

## 8 — Git Practices

- **GIT-1 (MUST)** Write clear commit messages
  ```bash
  # ✅ Good
  git commit -m "fix: wallet generation entropy validation"
  git commit -m "feat: add multi-signature support"
  
  # ❌ Bad
  git commit -m "fixed stuff"
  git commit -m "WIP"
  ```

- **GIT-2 (MUST)** Test before committing
  ```bash
  npm test        # Run tests
  npm run dev:api # Test manually
  git add .
  git commit -m "fix: resolve ordinals loading performance"
  ```

- **GIT-3 (SHOULD NOT)** Reference AI tools in commits
  - No "Generated by Claude"
  - No "AI-assisted implementation"
  - Focus on what changed, not how

---

## 9 — Performance Guidelines

- **PERF-1 (SHOULD)** Optimize heavy operations
  ```javascript
  // ✅ Cache expensive computations
  const balanceCache = new Map();
  
  async function getBalance(address) {
    if (balanceCache.has(address)) {
      return balanceCache.get(address);
    }
    const balance = await fetchBalance(address);
    balanceCache.set(address, balance);
    return balance;
  }
  ```

- **PERF-2 (MUST)** Handle large data sets carefully
  - Paginate ordinals gallery
  - Lazy load images
  - Use virtual scrolling for long lists

---

## 10 — Debugging & Logging

- **LOG-1 (SHOULD)** Use appropriate log levels
  ```javascript
  console.log('Server started on port 3001');      // Info
  console.warn('Deprecated endpoint used');        // Warnings
  console.error('Failed to generate wallet:', err); // Errors
  ```

- **LOG-2 (MUST NOT)** Log sensitive information
  ```javascript
  // ❌ Never log these
  console.log('Private key:', privateKey);
  console.log('Seed phrase:', mnemonic);
  
  // ✅ Log safe information
  console.log('Wallet generated for address:', address);
  ```

---

## Quick Reference Checklist

Before submitting code, ensure:

- [ ] Existing functionality still works
- [ ] No private keys/seeds exposed
- [ ] API inputs validated
- [ ] Tests added/updated
- [ ] Responsive on all screen sizes
- [ ] Terminal aesthetic preserved
- [ ] Error handling in place
- [ ] No sensitive data in logs
- [ ] Clear commit message
- [ ] Code follows existing patterns

---

## Common Pitfalls to Avoid

1. **Don't rewrite working code** - Enhance incrementally
2. **Don't break the UI theme** - Keep the retro terminal look
3. **Don't use TypeScript** - Project uses JavaScript
4. **Don't expose secrets** - Security first
5. **Don't skip testing** - Add tests for new features
6. **Don't ignore mobile** - Test responsive design
7. **Don't create duplicate services** - Use existing patterns
8. **Don't commit broken code** - Test thoroughly first

Remember: MOOSH Wallet is a working project in active development. Every change should improve stability, security, or functionality while maintaining the unique character that makes MOOSH special.