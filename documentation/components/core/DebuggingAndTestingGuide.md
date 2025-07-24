# Debugging and Testing Guide

**Component**: Testing & Debugging Strategies
**Type**: Development Guide
**Critical**: YES
**Last Updated**: 2025-01-21

## Overview

This comprehensive guide covers debugging techniques, testing patterns, and troubleshooting strategies for MOOSH Wallet development.

## Debugging Strategies

### Console Logging Best Practices

```javascript
// Development-only logging with ComplianceUtils
class DebugLogger {
    constructor(module) {
        this.module = module;
        this.enabled = window.location.hostname === 'localhost';
    }
    
    log(message, data) {
        if (!this.enabled) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${this.module}] ${timestamp}`;
        
        console.log(
            `%c${prefix}%c ${message}`,
            'color: #f57315; font-weight: bold;',
            'color: inherit;',
            data || ''
        );
    }
    
    error(message, error) {
        if (!this.enabled) return;
        
        console.error(`[${this.module}] ERROR:`, message, error);
        
        // Also log to error tracking service in production
        if (window.errorTracker) {
            window.errorTracker.captureException(error, {
                module: this.module,
                message
            });
        }
    }
    
    table(data, columns) {
        if (!this.enabled || !data) return;
        
        console.log(`[${this.module}] Table Data:`);
        console.table(data, columns);
    }
    
    time(label) {
        if (!this.enabled) return;
        console.time(`[${this.module}] ${label}`);
    }
    
    timeEnd(label) {
        if (!this.enabled) return;
        console.timeEnd(`[${this.module}] ${label}`);
    }
}

// Usage
const logger = new DebugLogger('WalletService');
logger.log('Generating wallet', { strength: 24 });
logger.time('wallet-generation');
// ... operation ...
logger.timeEnd('wallet-generation');
```

### Browser DevTools Integration

```javascript
// Add custom formatters for DevTools
class WalletDebugFormatter {
    static setup() {
        if (!window.devtoolsFormatters) {
            window.devtoolsFormatters = [];
        }
        
        window.devtoolsFormatters.push({
            header: (obj) => {
                if (obj instanceof Wallet) {
                    return ['div', { style: 'color: #f57315' },
                        ['span', {}, '💰 Wallet: '],
                        ['span', { style: 'font-weight: bold' }, obj.address.slice(0, 8) + '...']
                    ];
                }
                return null;
            },
            
            hasBody: (obj) => obj instanceof Wallet,
            
            body: (obj) => {
                return ['div', {},
                    ['div', {}, `Address: ${obj.address}`],
                    ['div', {}, `Balance: ${obj.balance} BTC`],
                    ['div', {}, `Type: ${obj.type}`],
                    ['div', {}, `Created: ${obj.createdAt}`]
                ];
            }
        });
    }
}

// Enable in development
if (window.location.hostname === 'localhost') {
    WalletDebugFormatter.setup();
}
```

### Performance Profiling

```javascript
class PerformanceProfiler {
    static profile(name, fn) {
        if (!window.performance || !window.performance.mark) {
            return fn();
        }
        
        const startMark = `${name}-start`;
        const endMark = `${name}-end`;
        const measureName = `${name}-duration`;
        
        performance.mark(startMark);
        
        try {
            const result = fn();
            
            if (result instanceof Promise) {
                return result.finally(() => {
                    performance.mark(endMark);
                    performance.measure(measureName, startMark, endMark);
                    this.logMeasure(measureName);
                });
            }
            
            performance.mark(endMark);
            performance.measure(measureName, startMark, endMark);
            this.logMeasure(measureName);
            
            return result;
        } catch (error) {
            performance.mark(endMark);
            performance.measure(measureName, startMark, endMark);
            this.logMeasure(measureName);
            throw error;
        }
    }
    
    static logMeasure(measureName) {
        const measure = performance.getEntriesByName(measureName)[0];
        if (measure) {
            console.log(`⏱️ ${measureName}: ${measure.duration.toFixed(2)}ms`);
            
            // Alert if operation is too slow
            if (measure.duration > 1000) {
                console.warn(`⚠️ Slow operation detected: ${measureName} took ${measure.duration.toFixed(2)}ms`);
            }
        }
    }
    
    static async profileAsync(name, asyncFn) {
        return this.profile(name, asyncFn);
    }
}

// Usage
const wallet = await PerformanceProfiler.profileAsync('generate-wallet', async () => {
    return await walletService.generateWallet(24);
});
```

### Memory Leak Detection

```javascript
class MemoryMonitor {
    constructor() {
        this.snapshots = [];
        this.leakThreshold = 50 * 1024 * 1024; // 50MB
    }
    
    takeSnapshot(label) {
        if (!performance.memory) {
            console.warn('Memory API not available');
            return;
        }
        
        const snapshot = {
            label,
            timestamp: Date.now(),
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        this.snapshots.push(snapshot);
        
        // Check for potential leaks
        if (this.snapshots.length > 1) {
            const previous = this.snapshots[this.snapshots.length - 2];
            const increase = snapshot.usedJSHeapSize - previous.usedJSHeapSize;
            
            if (increase > this.leakThreshold) {
                console.error(`🚨 Potential memory leak detected!
                    Previous: ${(previous.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
                    Current: ${(snapshot.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
                    Increase: ${(increase / 1024 / 1024).toFixed(2)}MB`);
            }
        }
        
        return snapshot;
    }
    
    compareSnapshots(label1, label2) {
        const snap1 = this.snapshots.find(s => s.label === label1);
        const snap2 = this.snapshots.find(s => s.label === label2);
        
        if (!snap1 || !snap2) {
            console.error('Snapshots not found');
            return;
        }
        
        const diff = snap2.usedJSHeapSize - snap1.usedJSHeapSize;
        
        console.table([{
            'From': label1,
            'To': label2,
            'Memory Change': `${(diff / 1024 / 1024).toFixed(2)}MB`,
            'Time Elapsed': `${((snap2.timestamp - snap1.timestamp) / 1000).toFixed(2)}s`
        }]);
    }
    
    detectLeaks() {
        // Check for common leak patterns
        const listeners = [];
        document.querySelectorAll('*').forEach(el => {
            const events = getEventListeners(el);
            if (events && Object.keys(events).length > 0) {
                listeners.push({
                    element: el.tagName + (el.id ? `#${el.id}` : ''),
                    events: Object.keys(events).join(', '),
                    count: Object.values(events).reduce((sum, arr) => sum + arr.length, 0)
                });
            }
        });
        
        if (listeners.length > 100) {
            console.warn('⚠️ Many event listeners detected:', listeners.length);
            console.table(listeners.slice(0, 10));
        }
    }
}

// Usage
const memoryMonitor = new MemoryMonitor();
memoryMonitor.takeSnapshot('before-operation');
// ... perform operation ...
memoryMonitor.takeSnapshot('after-operation');
memoryMonitor.compareSnapshots('before-operation', 'after-operation');
```

## Testing Patterns

### Unit Testing with Jest

```javascript
// walletService.test.js
import { WalletService } from '../services/walletService';
import { ComplianceUtils } from '../utils/ComplianceUtils';

describe('WalletService', () => {
    let walletService;
    
    beforeEach(() => {
        walletService = new WalletService();
        jest.clearAllMocks();
    });
    
    describe('generateWallet', () => {
        it('should generate a valid 12-word wallet', async () => {
            const wallet = await walletService.generateWallet(12);
            
            expect(wallet).toBeDefined();
            expect(wallet.mnemonic.split(' ')).toHaveLength(12);
            expect(wallet.addresses.bitcoin).toMatch(/^[13bc1]/);
            expect(wallet.addresses.spark).toBeTruthy();
        });
        
        it('should generate a valid 24-word wallet', async () => {
            const wallet = await walletService.generateWallet(24);
            
            expect(wallet.mnemonic.split(' ')).toHaveLength(24);
        });
        
        it('should use crypto.getRandomValues for entropy', async () => {
            const spy = jest.spyOn(crypto, 'getRandomValues');
            
            await walletService.generateWallet(12);
            
            expect(spy).toHaveBeenCalled();
        });
        
        it('should timeout after 60 seconds', async () => {
            jest.setTimeout(65000);
            
            // Mock slow SDK
            jest.spyOn(walletService, 'initializeSDK').mockImplementation(() => {
                return new Promise(resolve => setTimeout(resolve, 65000));
            });
            
            await expect(walletService.generateWallet(12)).rejects.toThrow('timeout');
        });
    });
});
```

### Integration Testing

```javascript
// Full wallet flow test
describe('Wallet Integration', () => {
    let app;
    
    beforeEach(async () => {
        // Setup test environment
        document.body.innerHTML = '<div id="app"></div>';
        app = new MOOSHWalletApp();
        await app.initialize();
    });
    
    afterEach(() => {
        app.cleanup();
        localStorage.clear();
    });
    
    it('should complete full wallet creation flow', async () => {
        // Navigate to home
        app.router.navigate('home');
        await waitFor(() => document.querySelector('.home-page'));
        
        // Click create wallet
        const createButton = document.querySelector('.create-wallet-button');
        createButton.click();
        
        // Wait for seed generation
        await waitFor(() => document.querySelector('.seed-display'), {
            timeout: 65000
        });
        
        // Verify seed displayed
        const seedWords = document.querySelectorAll('.seed-word');
        expect(seedWords).toHaveLength(12);
        
        // Continue to dashboard
        const continueButton = document.querySelector('.continue-button');
        continueButton.click();
        
        // Verify dashboard loaded
        await waitFor(() => document.querySelector('.dashboard'));
        expect(app.state.get('currentWallet')).toBeDefined();
    });
});
```

### Component Testing

```javascript
// Test individual components
describe('AccountSwitcher Component', () => {
    let accountSwitcher;
    let mockApp;
    
    beforeEach(() => {
        mockApp = {
            state: {
                get: jest.fn(),
                set: jest.fn(),
                subscribe: jest.fn()
            },
            notify: jest.fn()
        };
        
        accountSwitcher = new AccountSwitcher(mockApp);
    });
    
    it('should render correctly', () => {
        const element = accountSwitcher.render();
        
        expect(element.classList.contains('account-switcher')).toBe(true);
        expect(element.querySelector('.current-account')).toBeTruthy();
    });
    
    it('should open dropdown on click', () => {
        const element = accountSwitcher.render();
        const trigger = element.querySelector('.dropdown-trigger');
        
        trigger.click();
        
        expect(element.querySelector('.dropdown-menu')).toBeTruthy();
    });
    
    it('should switch accounts', () => {
        mockApp.state.get.mockReturnValue([
            { id: '1', name: 'Account 1' },
            { id: '2', name: 'Account 2' }
        ]);
        
        const element = accountSwitcher.render();
        trigger.click();
        
        const accountItem = element.querySelector('[data-account-id="2"]');
        accountItem.click();
        
        expect(mockApp.state.set).toHaveBeenCalledWith('currentAccount', '2');
    });
});
```

### E2E Testing with Cypress

```javascript
// cypress/integration/wallet.spec.js
describe('MOOSH Wallet E2E', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });
    
    it('should create a new wallet', () => {
        // Click create wallet
        cy.contains('Create New Wallet').click();
        
        // Select 12 words
        cy.contains('12 Words').click();
        
        // Wait for generation (with extended timeout)
        cy.contains('Generating', { timeout: 65000 }).should('not.exist');
        
        // Verify seed phrase
        cy.get('.seed-word').should('have.length', 12);
        
        // Copy seed phrase
        cy.contains('Copy Seed Phrase').click();
        
        // Verify copied
        cy.window().then(win => {
            win.navigator.clipboard.readText().then(text => {
                expect(text.split(' ')).to.have.length(12);
            });
        });
        
        // Continue
        cy.contains('Continue').click();
        
        // Should be on dashboard
        cy.url().should('include', '/dashboard');
        cy.contains('Balance').should('exist');
    });
    
    it('should handle errors gracefully', () => {
        // Simulate network error
        cy.intercept('POST', '/api/spark/generate-wallet', {
            statusCode: 500,
            body: { error: 'Server error' }
        });
        
        cy.contains('Create New Wallet').click();
        cy.contains('12 Words').click();
        
        // Should show error
        cy.contains('Error').should('exist');
        cy.contains('Try Again').should('exist');
    });
});
```

## MCP Validation Testing

### Running MCP Tests

```javascript
// Run all MCP validations
npm run mcp:validate-all

// Individual MCP tests
npm test                 // TestSprite
npm run mcp:memory       // Memory analysis
npm run mcp:security     // Security scan
```

### Custom MCP Test Implementation

```javascript
// test-with-mcp.js
const { runTestSprite } = require('./scripts/test-with-sprite');
const { runMemoryCheck } = require('./scripts/check-memory');
const { runSecurityScan } = require('./scripts/check-security');

async function validateCode(filePath) {
    console.log('🔍 Running MCP Validation Suite...\n');
    
    const results = {
        testSprite: false,
        memory: false,
        security: false
    };
    
    try {
        // Run TestSprite
        console.log('1. Running TestSprite...');
        results.testSprite = await runTestSprite(filePath);
        console.log(results.testSprite ? '✅ PASSED' : '❌ FAILED');
        
        // Run Memory Check
        console.log('\n2. Running Memory Check...');
        results.memory = await runMemoryCheck(filePath);
        console.log(results.memory ? '✅ PASSED' : '❌ FAILED');
        
        // Run Security Scan
        console.log('\n3. Running Security Scan...');
        results.security = await runSecurityScan(filePath);
        console.log(results.security ? '✅ PASSED' : '❌ FAILED');
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`TestSprite: ${results.testSprite ? '✅' : '❌'}`);
    console.log(`Memory: ${results.memory ? '✅' : '❌'}`);
    console.log(`Security: ${results.security ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\nOverall: ${allPassed ? '✅ ALL PASSED' : '❌ FAILED'}`);
    
    return allPassed;
}
```

## Debugging Common Issues

### Issue 1: Seed Generation Timeout

```javascript
// Debug seed generation
async function debugSeedGeneration() {
    const logger = new DebugLogger('SeedGenDebug');
    
    logger.log('Starting seed generation debug');
    logger.time('total-generation');
    
    try {
        // Check API endpoint
        logger.time('api-check');
        const response = await fetch('http://localhost:3001/api/spark/generate-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strength: 128 })
        });
        logger.timeEnd('api-check');
        
        if (!response.ok) {
            logger.error('API request failed', response.status);
            return;
        }
        
        const data = await response.json();
        logger.log('Response received', data);
        
        // Validate response structure
        if (!data.success || !data.data.mnemonic) {
            logger.error('Invalid response structure', data);
        }
        
    } catch (error) {
        logger.error('Generation failed', error);
    } finally {
        logger.timeEnd('total-generation');
    }
}
```

### Issue 2: Memory Leaks

```javascript
// Debug memory leaks
class LeakDetector {
    static findEventListenerLeaks() {
        const elements = document.querySelectorAll('*');
        const leaks = [];
        
        elements.forEach(el => {
            // Check for inline handlers
            const attributes = el.attributes;
            for (let attr of attributes) {
                if (attr.name.startsWith('on')) {
                    leaks.push({
                        element: el.tagName,
                        type: 'inline',
                        event: attr.name
                    });
                }
            }
        });
        
        if (leaks.length > 0) {
            console.warn('🚨 Event listener leaks found:');
            console.table(leaks);
        }
        
        return leaks;
    }
    
    static findDetachedNodes() {
        // Use Chrome DevTools Heap Profiler
        console.log(`
            To find detached DOM nodes:
            1. Open DevTools Memory tab
            2. Take heap snapshot
            3. Filter by "Detached"
            4. Look for DOM nodes not in document
        `);
    }
}
```

### Issue 3: Performance Problems

```javascript
// Performance debugging
class PerformanceDebugger {
    static analyzeRenderPerformance() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 16) { // Longer than 1 frame (60fps)
                    console.warn(`⚠️ Slow render: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure'] });
    }
    
    static profileFunction(fn, name = 'Anonymous') {
        return function(...args) {
            const start = performance.now();
            const result = fn.apply(this, args);
            const duration = performance.now() - start;
            
            if (duration > 100) {
                console.warn(`⚠️ Slow function: ${name} took ${duration.toFixed(2)}ms`);
            }
            
            return result;
        };
    }
}
```

## Debugging Tools Setup

### Chrome DevTools Configuration

```javascript
// Add to development environment
if (window.location.hostname === 'localhost') {
    // Enable React DevTools-like experience
    window.__MOOSH_DEVTOOLS__ = {
        version: '1.0.0',
        state: app.state,
        router: app.router,
        
        // Utility functions for console
        getWallet: (index = 0) => app.state.get('wallets')[index],
        getBalance: () => app.state.get('balance'),
        navigateTo: (route) => app.router.navigate(route),
        clearStorage: () => {
            localStorage.clear();
            console.log('✅ Storage cleared');
        },
        
        // Debug mode toggle
        enableDebug: () => {
            window.DEBUG = true;
            console.log('🐛 Debug mode enabled');
        }
    };
    
    console.log(`
        🎯 MOOSH Wallet DevTools loaded!
        
        Available commands:
        - __MOOSH_DEVTOOLS__.getWallet()
        - __MOOSH_DEVTOOLS__.getBalance()
        - __MOOSH_DEVTOOLS__.navigateTo('dashboard')
        - __MOOSH_DEVTOOLS__.clearStorage()
        - __MOOSH_DEVTOOLS__.enableDebug()
    `);
}
```

## Testing Checklist

### Before Committing

- [ ] Run all MCP validations: `npm run mcp:validate-all`
- [ ] Run unit tests: `npm test`
- [ ] Check for console.log statements
- [ ] Test seed generation (12 & 24 words)
- [ ] Test on mobile viewport
- [ ] Check memory usage
- [ ] Verify no security warnings

### Manual Testing Steps

1. **Wallet Creation Flow**
   - Create 12-word wallet
   - Create 24-word wallet
   - Copy seed phrase
   - Verify addresses display

2. **Import Wallet Flow**
   - Import valid seed phrase
   - Try invalid seed phrase
   - Import WIF private key
   - Verify error handling

3. **Transaction Flow**
   - Send transaction
   - Check fee calculation
   - Verify balance updates
   - Test insufficient funds

4. **Security Features**
   - Lock wallet
   - Unlock with password
   - Try wrong password
   - Test session timeout

5. **Performance Testing**
   - Load with 10+ wallets
   - Switch accounts rapidly
   - Generate multiple wallets
   - Check responsiveness

## Common Debug Commands

```bash
# Check for memory leaks
npm run mcp:memory -- --detailed

# Find security issues
npm run mcp:security -- --verbose

# Test specific component
npm test -- --testNamePattern="AccountSwitcher"

# Run with debug logging
DEBUG=* npm run dev

# Profile bundle size
npm run analyze:bundle
```

## Related Documentation
- Error Handling: `/documentation/components/core/ErrorHandlingPatterns.md`
- Performance Guide: `/documentation/components/core/PerformanceOptimizationGuide.md`
- Security Patterns: `/documentation/components/core/SecurityImplementationPatterns.md`
- ComplianceUtils: `/documentation/components/core/ComplianceUtils.md`