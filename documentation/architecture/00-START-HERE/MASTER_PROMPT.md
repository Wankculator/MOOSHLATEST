# MOOSH Wallet - AI Development Assistant Prompt

## Project Overview
**MOOSH Wallet** is a Bitcoin and Spark Protocol wallet with a retro terminal UI aesthetic. The project is currently in active development and needs bug fixes, stability improvements, and feature completion.

**Repository**: https://github.com/Wankculator/Moosh  
**Version**: 2.0.0  
**Tech Stack**: JavaScript (CommonJS), Express.js, Node.js  
**Current Branch**: ordinals-performance-fix  

## Key Project Structure
```
MOOSH-WALLET/
├── public/
│   ├── index.html          # Entry point (minimal)
│   ├── js/
│   │   └── moosh-wallet.js # Main frontend (5000+ lines)
│   └── css/
│       └── styles.css      # Terminal theme styles
├── src/
│   └── server/
│       ├── api-server.js   # Express API (port 3001)
│       ├── server.js       # UI server (port 3333)
│       └── services/       # Wallet services
│           ├── walletService.js
│           ├── blockchainService.js
│           └── sparkCompatibleService.js
├── package.json            # Dependencies & scripts
└── docs/                   # Extensive documentation
```

## Current State & Issues
1. **Build Phase**: Wallet is functional but needs stability improvements
2. **Known Issues**:
   - Ordinals gallery performance problems
   - Incomplete test coverage
   - Missing multi-signature support
   - Some API endpoints need validation hardening
3. **Active Features**:
   - BIP39 seed generation (12/24 words)
   - Multiple address types (SegWit, Taproot, Legacy)
   - Spark Protocol integration
   - Dashboard with balance display
   - Transaction history
   - Ordinals support (needs optimization)

## Development Guidelines

### CRITICAL RULES
1. **NEVER BREAK EXISTING FUNCTIONALITY**
   - Always read existing code before modifying
   - Test changes incrementally
   - Preserve the retro terminal UI aesthetic
   - Maintain backwards compatibility

2. **JavaScript Only**
   - Project uses CommonJS modules, NOT TypeScript
   - No ES6 imports in Node.js files
   - Frontend uses vanilla JavaScript with custom DOM factory

3. **Security First**
   - Server-side seed generation only
   - Input validation on all endpoints
   - No private keys in logs or client-side
   - Use crypto.getRandomValues for entropy

4. **Testing Approach**
   - Use existing test structure (Vitest)
   - Expand from current tests, don't replace
   - Focus on edge cases and security

## AI Assistant Behavior

### When Asked to Fix/Improve Code:
1. **First**: Read the existing file completely
2. **Analyze**: Identify the specific issue without assumptions
3. **Plan**: Describe the fix approach
4. **Implement**: Make minimal, targeted changes
5. **Verify**: Ensure no regressions

### Code Generation Rules:
- Match existing code style exactly
- Use the project's ElementFactory pattern for UI
- Preserve all working functionality
- Add comprehensive error handling
- Include inline documentation for complex logic

### Common Tasks:

**Bug Fix Example**:
```javascript
// WRONG: Complete rewrite
function newImplementation() { /* ... */ }

// RIGHT: Targeted fix
function existingFunction() {
    // Existing code...
    
    // FIX: Add validation for edge case
    if (!input || typeof input !== 'string') {
        console.error('Invalid input:', input);
        return null;
    }
    
    // Rest of existing code...
}
```

**API Endpoint Enhancement**:
```javascript
// Add to existing endpoint, don't replace
app.post('/api/wallet/generate', async (req, res) => {
    try {
        // ADD: Input validation
        const { wordCount = 12, network = 'MAINNET' } = req.body;
        
        if (![12, 24].includes(wordCount)) {
            return res.status(400).json({
                success: false,
                error: 'Word count must be 12 or 24'
            });
        }
        
        // Existing implementation continues...
    } catch (error) {
        // Existing error handling...
    }
});
```

## Current Priorities

1. **Performance**: Fix ordinals gallery loading issues
2. **Stability**: Add proper error boundaries and fallbacks
3. **Testing**: Increase coverage for critical paths
4. **Security**: Harden input validation and API endpoints
5. **UI Polish**: Fix responsive issues on mobile

## File-Specific Notes

### `public/js/moosh-wallet.js`
- Main UI application (5000+ lines)
- Uses custom ElementFactory pattern
- Contains TODO/FIXME comments that need addressing
- Retro terminal theme must be preserved

### `src/server/api-server.js`
- Express API server on port 3001
- Handles wallet generation and management
- Needs better error handling and validation

### `src/server/services/walletService.js`
- Core wallet functionality
- BIP39/BIP32 implementation
- Needs multi-sig support addition

## Commands & Scripts
```bash
# Development
npm run dev:api    # Start API server (port 3001)
npm run dev:ui     # Start UI server (port 3333)

# Testing
npm test           # Run test suite
npm run test:unit  # Unit tests only

# Production
npm start          # Start API server
```

## Response Format

When providing code changes:
1. Explain the issue being fixed
2. Show the specific changes with context
3. Highlight any potential impacts
4. Suggest testing approach

## DO NOT:
- Rewrite entire files
- Change the terminal UI aesthetic
- Add TypeScript or modern ES6 imports to Node files
- Remove existing functionality
- Create new dependencies without justification
- Make assumptions about missing features

## FOCUS ON:
- Incremental improvements
- Bug fixes over new features
- Maintaining existing architecture
- Code stability and reliability
- Security hardening
- Performance optimization

Remember: This is a work-in-progress wallet application. The goal is to stabilize and improve what exists, not to rebuild from scratch. Every change should move the project toward production readiness while preserving its unique retro terminal character.