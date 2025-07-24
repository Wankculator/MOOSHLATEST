# 🚀 MOOSH WALLET - AI DEVELOPMENT START HERE
## The ONLY File You Need to Show AI Assistants

**ATTENTION AI ASSISTANT**: This is your master guide for developing MOOSH Wallet. Read this FIRST before doing anything else.

---

## 🎯 Quick Start for AI Assistants

### What is MOOSH Wallet?
- **Professional Bitcoin & Spark Protocol wallet**
- **24,951 lines of pure vanilla JavaScript** (ONE file - moosh-wallet.js)
- **Terminal-style UI** (green on black, retro aesthetic)
- **NO frameworks** (No React, Vue, Angular - EVER!)
- **Server-side seed generation** for security

### Current Status
- Branch: `ordinals-performance-fix`
- Servers: API (port 3001), UI (port 3333)
- Working: Wallet generation, import, balances, Ordinals
- Broken: Send transactions, TX history, some security features

---

## 📚 CRITICAL DOCUMENTATION MAP

### 1. **Architecture & Technical Specs**
```
📁 /MOOSH-WALLET-PROFESSIONAL-DOCS/
   ├── 🏗️ COMPLETE-ARCHITECTURE-BLUEPRINT.md    [MUST READ - System design]
   ├── 🚀 DEPLOYMENT-GUIDE.md                   [Production deployment]
   ├── 🧪 TESTING-FRAMEWORK.md                  [Testing strategies]
   └── 🤖 AI-DEVELOPMENT-MASTER-GUIDE.md        [AI coding rules]

📁 /docs/
   ├── 📋 COMPLETE_WALLET_IMPLEMENTATION_GUIDE.md [1,174 lines - THE BIBLE]
   ├── 🏛️ architecture/
   │   ├── WALLET_ARCHITECTURE.md               [System architecture]
   │   └── PRODUCT_REQUIREMENTS_DOCUMENT.md     [PRD]
   └── 🔧 guides/
       └── SEED_GENERATION_IMPLEMENTATION_GUIDE.md
```

### 2. **Component Documentation**
```
📁 /MOOSH-WALLET-KNOWLEDGE-BASE/
   ├── 📊 CODE-DNA/atomic-units/               [Every component documented]
   │   ├── ElementFactory/                     [DOM creation patterns]
   │   ├── StateManager/                       [State management]
   │   ├── Router/                            [SPA routing]
   │   └── [... 8 more components]
   ├── 🔒 FORENSIC-ANALYSIS/
   │   ├── architecture-overview.md            [Monolithic analysis]
   │   └── security-audit.md                   [Security assessment]
   └── 🎨 PIXEL-PERFECT-DESIGN/
       └── design-system-complete.md           [UI/UX guidelines]
```

### 3. **AI Development Kits**
```
📁 /MOOSH-WALLET-ENTERPRISE-DOCS/
   ├── 🤖 AI-DEVELOPMENT-KITS/
   │   ├── prompt-library/                     [Battle-tested prompts]
   │   └── ai-guardrails/
   │       └── forbidden-patterns.json         [NEVER do these!]
   ├── 📊 DASHBOARDS/
   │   ├── index.html                         [Live metrics]
   │   └── dependency-visualizer.html         [Component graph]
   └── 🔧 DEVELOPER-TOOLING/
       └── cli-tools/                          [Validation tools]
```

### 4. **The Master Prompt**
```
📄 /MASTER_PROMPT.md                           [592 lines of AI wisdom]
```

---

## ⚠️ CRITICAL RULES - MEMORIZE THESE!

### NEVER DO THIS ❌
```javascript
// ❌ NEVER split the monolithic file
import { Component } from './components/Component.js';

// ❌ NEVER use React/Vue/Angular
import React from 'react';
<MyComponent />

// ❌ NEVER use ES6 modules
export class Wallet {}

// ❌ NEVER manipulate DOM in render
render() {
  document.getElementById('app').innerHTML = html; // WRONG!
}
```

### ALWAYS DO THIS ✅
```javascript
// ✅ Everything in ONE file (moosh-wallet.js)
class Component { /* ... */ }

// ✅ Use ElementFactory for DOM
ElementFactory.create('button', { onclick: () => {} });

// ✅ Return HTML strings from render
render() {
  return `<div>${content}</div>`; // Return string!
}

// ✅ Terminal colors only
background: var(--color-bg-primary); /* #000000 */
color: var(--color-primary); /* #69fd97 */
```

---

## 🏗️ Code Structure Overview

### The Monolithic Architecture
```javascript
// public/js/moosh-wallet.js (24,951 lines)
(function() {
  'use strict';
  
  // Lines 1-5000: Utility Classes
  class ElementFactory { }      // DOM creation
  class ResponsiveUtils { }     // Responsive design
  class StyleManager { }        // Dynamic styling
  
  // Lines 5001-10000: Core Services  
  class APIService { }          // HTTP client
  class StateManager { }        // State management
  class Router { }              // SPA routing
  
  // Lines 10001-20000: Components
  class HomePage { }            // Landing
  class DashboardPage { }       // Main wallet
  class WalletDetailsPage { }   // Details
  
  // Lines 20001-24951: App
  class MooshWalletApp { }      // Main application
  
  // Initialize
  window.app = new MooshWalletApp();
})();
```

### Backend Structure
```
src/server/
├── api-server.js              // Express API (port 3001)
├── server.js                  // Static server (port 3333)
└── services/
    ├── walletService.js       // Core wallet operations
    ├── sparkService.js        // Spark Protocol
    └── networkService.js      // Blockchain interaction
```

---

## 🚀 Development Workflow

### 1. Starting Development
```bash
# First time? Read these in order:
1. This file (AI-START-HERE.md)
2. COMPLETE-ARCHITECTURE-BLUEPRINT.md
3. AI-DEVELOPMENT-MASTER-GUIDE.md
4. Component docs in CODE-DNA/

# Start servers
cd "MOOSH WALLET"
START_BOTH_SERVERS.bat

# Access
UI: http://localhost:3333
API: http://localhost:3001/health
```

### 2. Before Writing Code
1. Check forbidden patterns: `/ai-guardrails/forbidden-patterns.json`
2. Find component examples: `/CODE-DNA/atomic-units/[component]/`
3. Review similar code in `moosh-wallet.js`
4. Check the master prompt: `/MASTER_PROMPT.md`

### 3. Common Tasks

#### Adding a New Feature
```javascript
// 1. Find the right section in moosh-wallet.js
// 2. Follow existing patterns EXACTLY
// 3. Use ElementFactory for ALL DOM
// 4. Return HTML strings from render()
// 5. Bind methods in constructor
// 6. Use terminal colors
```

#### Fixing Broken Features
```javascript
// Current TODOs:
- Send transactions (see line ~15000)
- Transaction history (see APIService)
- Password verification (see PasswordModal)
- Real Spark integration (see sparkService.js)
```

#### Testing Your Code
```bash
# No automated tests yet, so:
1. Test in browser console
2. Check for console errors
3. Verify terminal styling maintained
4. Ensure no forbidden patterns used
```

---

## 📋 Quick Reference

### Global Objects Available
```javascript
window.app                    // Main application instance
ElementFactory               // DOM creation
ResponsiveUtils             // Responsive utilities
StyleManager                // Dynamic styling
APIService                  // HTTP requests
StateManager                // State management
Router                      // SPA routing
NotificationService         // User notifications
```

### API Endpoints
```javascript
POST /api/spark/generate-wallet    // Generate new wallet
POST /api/spark/import            // Import from seed
GET  /api/balance/:address        // Get balance
GET  /api/transactions/:address   // Get transactions
GET  /api/ordinals/:address       // Get NFTs
```

### CSS Variables (Terminal Theme)
```css
--color-primary: #69fd97;        /* Green */
--color-bg-primary: #000000;     /* Black */
--color-bg-secondary: #0a0a0a;   /* Dark grey */
--font-mono: 'Courier New';      /* Terminal font */
```

---

## 🆘 Getting Help

### If You're Stuck:
1. Search in `moosh-wallet.js` for similar code
2. Check component docs: `/CODE-DNA/atomic-units/`
3. Review `/AI-DEVELOPMENT-MASTER-GUIDE.md`
4. Look at `/forbidden-patterns.json`

### Common Issues:
- **Module errors**: You're using imports - DON'T!
- **DOM not updating**: Return HTML string, don't manipulate DOM
- **Styling broken**: Use CSS variables, not custom colors
- **Event handlers not working**: Use `onclick="app.method()"`

---

## ✅ Checklist Before Committing

- [ ] No imports/exports used
- [ ] No React/Vue/Angular patterns
- [ ] All DOM via ElementFactory
- [ ] Terminal theme maintained
- [ ] No console.log in production
- [ ] Security: No private keys logged
- [ ] Code added to correct section
- [ ] Patterns match existing code

---

## 🎯 Your Mission

**Current Priority**: Fix broken features
1. Transaction sending
2. Transaction history  
3. Security features (password verification)
4. Error handling improvements

**Next**: Build new features
1. Multi-signature support
2. Hardware wallet integration
3. Lightning Network
4. DeFi integrations

---

## 📍 REMEMBER

**MOOSH Wallet = One File + Terminal UI + Pure JavaScript + Security First**

This is your bible. Everything you need is documented. The codebase is 24,951 lines of carefully crafted JavaScript that works perfectly when you follow the patterns.

**Now go build something amazing! 🚀**

---

*Last Updated: January 2025*
*Version: 2.0.0*
*Status: Production Ready with TODOs*