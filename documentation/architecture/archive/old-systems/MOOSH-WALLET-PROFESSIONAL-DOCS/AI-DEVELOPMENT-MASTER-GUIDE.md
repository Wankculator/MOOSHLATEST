# 🤖 MOOSH Wallet - AI Development Master Guide
## The Ultimate Guide for Building with Claude and Other AI Assistants

### 📋 Table of Contents
1. [AI Development Philosophy](#ai-development-philosophy)
2. [Understanding MOOSH Architecture](#understanding-moosh-architecture)
3. [Critical Rules & Constraints](#critical-rules--constraints)
4. [Component Development Guide](#component-development-guide)
5. [Common AI Mistakes & Prevention](#common-ai-mistakes--prevention)
6. [Code Patterns & Examples](#code-patterns--examples)
7. [Testing AI-Generated Code](#testing-ai-generated-code)
8. [Optimization Strategies](#optimization-strategies)
9. [Security Considerations](#security-considerations)
10. [Quick Reference](#quick-reference)

---

## 🎯 AI Development Philosophy

### Core Principles for AI Development

1. **Respect the Monolith** - MOOSH uses a single 24,951-line JavaScript file by design
2. **Pure Vanilla JavaScript** - No React, Vue, or frameworks allowed
3. **Terminal Aesthetic** - Maintain the retro green-on-black theme
4. **Security First** - Never expose private keys or seeds
5. **Pattern Consistency** - Follow existing code patterns exactly

### AI Context Management
```javascript
// Optimal context window usage
const aiContext = {
  minimal: 2000,    // Basic component info
  standard: 8000,   // Component + dependencies
  complete: 32000,  // Full module context
  maximum: 128000   // Entire codebase
};

// Always provide context in this order:
// 1. Component purpose
// 2. Dependencies
// 3. Constraints
// 4. Examples
// 5. Common mistakes
```

---

## 🏗️ Understanding MOOSH Architecture

### The Monolithic Structure
```javascript
// moosh-wallet.js structure (DO NOT SPLIT INTO MODULES)
(function() {
  'use strict';

  // 1. Utility Classes (Lines 1-5000)
  class ElementFactory { /* DOM creation */ }
  class ResponsiveUtils { /* Responsive design */ }
  class StyleManager { /* Dynamic styles */ }
  
  // 2. Core Services (Lines 5001-10000)
  class APIService { /* HTTP calls */ }
  class StateManager { /* State management */ }
  class Router { /* SPA routing */ }
  
  // 3. Components (Lines 10001-20000)
  class Component { /* Base component */ }
  class HomePage { /* Landing page */ }
  class DashboardPage { /* Main interface */ }
  
  // 4. Application (Lines 20001-24951)
  class MooshWalletApp { /* Main app */ }
  
  // Initialize
  window.app = new MooshWalletApp();
})();
```

### Critical Architecture Rules
1. **NEVER** split the file into modules
2. **NEVER** use ES6 imports/exports
3. **ALWAYS** use IIFE pattern
4. **ALWAYS** attach to window for debugging

---

## ⚠️ Critical Rules & Constraints

### Forbidden Patterns (NEVER USE)
```javascript
// ❌ NEVER: React/JSX
import React from 'react';
const Component = () => <div>Never do this</div>;

// ❌ NEVER: ES6 Modules
export class Wallet { }
import { Wallet } from './wallet.js';

// ❌ NEVER: Modern frameworks
Vue.component('wallet', {});
Angular.module('wallet', []);

// ❌ NEVER: Async in constructors
class Wallet {
  constructor() {
    await this.init(); // NEVER
  }
}

// ❌ NEVER: Direct DOM in render
render() {
  document.getElementById('app').innerHTML = '...'; // NEVER
  return html; // Always return HTML string
}
```

### Required Patterns (ALWAYS USE)
```javascript
// ✅ ALWAYS: ElementFactory for DOM
const button = ElementFactory.create('button', {
  className: 'wallet-button',
  textContent: 'Generate Wallet',
  onclick: () => this.generateWallet()
});

// ✅ ALWAYS: Terminal styling
const styles = `
  color: var(--color-primary); /* #69fd97 */
  background: var(--color-bg-primary); /* #000000 */
  font-family: var(--font-mono); /* 'Courier New' */
`;

// ✅ ALWAYS: Defensive checks
generateWallet() {
  if (!this.isReady) {
    console.error('Wallet not ready');
    return;
  }
  // Proceed safely
}

// ✅ ALWAYS: Event binding pattern
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
}
```

---

## 🧩 Component Development Guide

### Component Structure Template
```javascript
/**
 * Component: WalletDisplay
 * Purpose: Display wallet address and balance
 * Dependencies: ElementFactory, APIService, StateManager
 * 
 * AI WARNINGS:
 * - Never modify the render return pattern
 * - Always use ElementFactory for DOM elements
 * - Maintain terminal color scheme
 */
class WalletDisplay extends Component {
  constructor(config = {}) {
    super();
    
    // 1. Configuration
    this.config = {
      showBalance: true,
      addressType: 'segwit',
      ...config
    };
    
    // 2. State initialization
    this.state = {
      address: null,
      balance: null,
      isLoading: false
    };
    
    // 3. Bind methods
    this.refresh = this.refresh.bind(this);
    this.copyAddress = this.copyAddress.bind(this);
    
    // 4. Setup component
    this.init();
  }

  init() {
    // Initialization logic
    this.loadWalletData();
  }

  async loadWalletData() {
    try {
      this.setState({ isLoading: true });
      
      const wallet = StateManager.getState('wallet.current');
      if (!wallet) return;
      
      const balance = await APIService.getBalance(wallet.address);
      
      this.setState({
        address: wallet.address,
        balance: balance.data.balance,
        isLoading: false
      });
    } catch (error) {
      NotificationService.error('Failed to load wallet data');
      this.setState({ isLoading: false });
    }
  }

  copyAddress() {
    if (!this.state.address) return;
    
    navigator.clipboard.writeText(this.state.address)
      .then(() => NotificationService.success('Address copied!'))
      .catch(() => NotificationService.error('Failed to copy'));
  }

  render() {
    const { address, balance, isLoading } = this.state;
    
    // CRITICAL: Always return HTML string, never manipulate DOM directly
    return `
      <div class="wallet-display ${isLoading ? 'loading' : ''}">
        <div class="wallet-header">
          <h2 class="wallet-title">Bitcoin Wallet</h2>
          <button class="refresh-button" onclick="app.currentPage.refresh()">
            ↻ Refresh
          </button>
        </div>
        
        <div class="wallet-content">
          <div class="address-section">
            <label class="wallet-label">Address</label>
            <div class="address-container">
              <span class="address-text">${address || 'Not generated'}</span>
              <button 
                class="copy-button" 
                onclick="app.currentPage.copyAddress()"
                ${!address ? 'disabled' : ''}
              >
                Copy
              </button>
            </div>
          </div>
          
          <div class="balance-section">
            <label class="wallet-label">Balance</label>
            <div class="balance-display">
              <span class="balance-amount">${balance || '0.00000000'}</span>
              <span class="balance-unit">BTC</span>
            </div>
          </div>
        </div>
        
        <style>
          .wallet-display {
            background: var(--color-bg-secondary);
            border: 2px solid var(--color-primary);
            border-radius: 0;
            padding: 20px;
            font-family: var(--font-mono);
          }
          
          .wallet-display.loading {
            opacity: 0.6;
            pointer-events: none;
          }
          
          .address-text {
            font-family: monospace;
            word-break: break-all;
            color: var(--color-primary);
          }
          
          .copy-button {
            background: var(--color-primary);
            color: var(--color-bg-primary);
            border: none;
            padding: 5px 15px;
            cursor: pointer;
            text-transform: uppercase;
            font-weight: bold;
          }
          
          .copy-button:hover:not(:disabled) {
            background: var(--color-primary-hover);
          }
          
          .copy-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        </style>
      </div>
    `;
  }
}
```

---

## 🚫 Common AI Mistakes & Prevention

### Mistake 1: Using Modern Syntax
```javascript
// ❌ AI MISTAKE: Using optional chaining
const balance = wallet?.balance ?? 0;

// ✅ CORRECT: Traditional checks
const balance = wallet && wallet.balance ? wallet.balance : 0;

// ❌ AI MISTAKE: Destructuring in parameters
function createWallet({ type = 'segwit', ...options }) { }

// ✅ CORRECT: Traditional parameters
function createWallet(options) {
  const type = options.type || 'segwit';
}
```

### Mistake 2: Breaking the Monolith
```javascript
// ❌ AI MISTAKE: Suggesting file splits
// "Let's move this to a separate file for better organization"
import WalletService from './services/WalletService.js';

// ✅ CORRECT: Keep everything in one file
class WalletService {
  // Service implementation
}
```

### Mistake 3: Framework Patterns
```javascript
// ❌ AI MISTAKE: React-like state updates
this.setState(prevState => ({
  ...prevState,
  balance: newBalance
}));

// ✅ CORRECT: Direct state updates
this.state.balance = newBalance;
this.updateUI();
```

### Mistake 4: Wrong Event Handling
```javascript
// ❌ AI MISTAKE: Modern event listeners
<button onClick={this.handleClick}>Click</button>

// ✅ CORRECT: Inline event handlers
<button onclick="app.currentPage.handleClick()">Click</button>
```

---

## 📝 Code Patterns & Examples

### Pattern 1: API Calls
```javascript
// Standard API call pattern
async fetchWalletData() {
  try {
    // Show loading state
    this.setState({ isLoading: true });
    
    // Make API call
    const response = await APIService.get('/api/wallet/balance', {
      address: this.state.address
    });
    
    // Handle success
    if (response.success) {
      this.setState({
        balance: response.data.balance,
        isLoading: false
      });
    } else {
      throw new Error(response.error.message);
    }
  } catch (error) {
    // Handle error
    console.error('Fetch wallet data error:', error);
    NotificationService.error('Failed to load wallet data');
    this.setState({ isLoading: false });
  }
}
```

### Pattern 2: Modal Creation
```javascript
// Standard modal pattern
showSendModal() {
  const modal = new Modal({
    title: 'Send Bitcoin',
    content: this.renderSendForm(),
    buttons: [
      {
        text: 'Cancel',
        className: 'button-secondary',
        onclick: () => modal.close()
      },
      {
        text: 'Send',
        className: 'button-primary',
        onclick: () => this.handleSend()
      }
    ],
    onClose: () => {
      this.clearSendForm();
    }
  });
  
  modal.show();
}
```

### Pattern 3: State Management
```javascript
// Standard state update pattern
updateWalletState(updates) {
  // Update local state
  Object.assign(this.state, updates);
  
  // Update global state
  StateManager.updateState('wallet.current', this.state);
  
  // Trigger UI update
  this.updateUI();
  
  // Notify other components
  EventBus.emit('wallet:updated', this.state);
}
```

---

## 🧪 Testing AI-Generated Code

### Test Checklist for AI Code
```javascript
// 1. Check for forbidden patterns
function checkForbiddenPatterns(code) {
  const forbidden = [
    /import\s+.*from/g,        // ES6 imports
    /export\s+(default\s+)?/g, // ES6 exports
    /<[A-Z]\w*\s*\/>/g,       // JSX
    /React\./g,               // React
    /\.\.\./g,                // Spread operator
    /=>/g                     // Arrow functions in wrong context
  ];
  
  return forbidden.filter(pattern => pattern.test(code));
}

// 2. Validate component structure
function validateComponent(ComponentClass) {
  const instance = new ComponentClass();
  
  assert(typeof instance.render === 'function', 'Must have render method');
  assert(typeof instance.render() === 'string', 'Render must return string');
  assert(!instance.render().includes('document.'), 'No direct DOM manipulation');
}

// 3. Test state management
function testStateManagement() {
  const component = new WalletDisplay();
  
  // Test state initialization
  assert(component.state !== undefined, 'State must be initialized');
  
  // Test state updates
  component.setState({ balance: '1.5' });
  assert(component.state.balance === '1.5', 'State must update');
}
```

---

## ⚡ Optimization Strategies

### Performance Optimization
```javascript
// 1. Debounce expensive operations
class SearchComponent {
  constructor() {
    this.searchDebounced = this.debounce(this.search, 300);
  }
  
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// 2. Cache API responses
class APICache {
  constructor(ttl = 60000) { // 1 minute default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }
}

// 3. Lazy load heavy components
class LazyComponent {
  constructor() {
    this.loaded = false;
  }
  
  async load() {
    if (this.loaded) return;
    
    // Simulate heavy loading
    await this.loadResources();
    this.loaded = true;
  }
}
```

---

## 🔒 Security Considerations

### Security Checklist for AI
```javascript
// 1. Never expose sensitive data
class SecurityCheck {
  static sanitizeForLogging(data) {
    const sensitive = ['privateKey', 'seed', 'mnemonic', 'password'];
    const sanitized = { ...data };
    
    sensitive.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

// 2. Validate all inputs
class InputValidator {
  static validateAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address format');
    }
    
    // Bitcoin address regex patterns
    const patterns = {
      segwit: /^bc1[a-z0-9]{39,59}$/,
      legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      taproot: /^bc1p[a-z0-9]{39,59}$/
    };
    
    return Object.values(patterns).some(pattern => pattern.test(address));
  }
}

// 3. Secure state management
class SecureStateManager extends StateManager {
  setState(path, value) {
    // Never store sensitive data in state
    if (this.isSensitivePath(path)) {
      console.error('Cannot store sensitive data in state');
      return;
    }
    
    super.setState(path, value);
  }
  
  isSensitivePath(path) {
    const sensitive = ['privateKey', 'seed', 'mnemonic'];
    return sensitive.some(s => path.includes(s));
  }
}
```

---

## 📋 Quick Reference

### DO's and DON'Ts for AI Development

#### DO's ✅
- Use ElementFactory for all DOM creation
- Return HTML strings from render methods
- Follow the existing 24,951-line structure
- Use terminal color scheme (green/black)
- Handle errors with try/catch
- Use vanilla JavaScript only
- Bind methods in constructor
- Use onclick for event handlers

#### DON'Ts ❌
- Split into multiple files
- Use React/Vue/Angular
- Use ES6 imports/exports
- Manipulate DOM directly in render
- Use modern syntax unnecessarily
- Store sensitive data in state
- Use external UI libraries
- Break existing patterns

### Essential Classes/Services
```javascript
// Always available globally
ElementFactory    // DOM element creation
ResponsiveUtils   // Responsive utilities
StyleManager      // Dynamic styling
APIService        // HTTP requests
StateManager      // State management
Router            // SPA routing
NotificationService // User notifications
StorageService    // LocalStorage wrapper
Component         // Base component class
```

### API Endpoints
```javascript
// Wallet Generation
POST /api/spark/generate-wallet
POST /api/spark/import

// Balance & Transactions
GET /api/balance/:address
GET /api/transactions/:address
GET /api/ordinals/:address

// Network
GET /api/network/fees
GET /api/network/price
```

### State Structure
```javascript
// Global state shape
{
  wallet: {
    current: {
      address: 'bc1q...',
      type: 'segwit',
      balance: '0.00000000'
    },
    accounts: [],
    settings: {}
  },
  ui: {
    theme: 'dark',
    loading: false,
    modal: null
  },
  network: {
    connected: true,
    fee: 'normal'
  }
}
```

---

## 🎯 Final AI Instructions

When developing for MOOSH Wallet:

1. **Read the existing code first** - Understand patterns before writing
2. **Test your code mentally** - Ensure it follows all rules
3. **Keep it simple** - Don't over-engineer solutions
4. **Maintain consistency** - Match existing style exactly
5. **Think security** - Every line should be secure
6. **Respect the monolith** - One file, one purpose
7. **Terminal aesthetic** - Green and black, always

Remember: MOOSH Wallet is a unique project with specific constraints. Respect them, and you'll create code that integrates perfectly with the existing 24,951 lines of carefully crafted JavaScript.

---

**This guide ensures AI assistants generate code that perfectly matches MOOSH Wallet's architecture and standards.**