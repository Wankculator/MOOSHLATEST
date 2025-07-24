# 🛡️ MOOSH Wallet Error Prevention Implementation Guide

## 📍 Quick Reference - Where to Find Everything

### Critical Files & Locations
```
/public/js/moosh-wallet.js          - Main wallet logic (28,000+ lines)
/src/server/api-server.js           - API endpoints
/src/server/services/               - Service layer
/CLAUDE.md                          - Critical rules (MUST READ)
/package.json                       - Scripts and dependencies
```

### Terminal Commands to Remember
```bash
# Start UI Server
npm run dev
# Access at: http://localhost:3333/

# Start API Server (in separate terminal)
npm run start
# API runs at: http://localhost:3001/

# Check logs
tail -f api-server.log

# Test seed generation
curl -X POST http://localhost:3001/api/spark/generate-wallet \
  -H "Content-Type: application/json" \
  -d '{"strength": 256}'
```

---

## 🏗️ Implementation Locations

### 1. **API Response Validator**
**Location**: Create new file `/src/server/validators/apiResponseValidator.js`
```javascript
// This validates ALL API responses before sending
export class APIResponseValidator {
    static schemas = {
        '/api/spark/generate-wallet': {
            success: 'boolean',
            data: {
                mnemonic: 'string',  // CRITICAL: Must be string, not array!
                addresses: {
                    bitcoin: 'string',
                    spark: 'string'
                },
                privateKeys: 'object'
            }
        }
    };
    
    static validate(endpoint, response) {
        const schema = this.schemas[endpoint];
        if (!schema) return true; // No schema = no validation
        
        // Validate structure matches
        return this.validateStructure(response, schema);
    }
}
```

**Integration Point**: In `/src/server/api-server.js`, wrap all responses:
```javascript
// Line ~126 - Seed generation endpoint
app.post('/api/spark/generate-wallet', async (req, res) => {
    try {
        const result = await generateWallet(req.body);
        
        // ADD THIS VALIDATION
        if (!APIResponseValidator.validate('/api/spark/generate-wallet', result)) {
            throw new Error('Response validation failed');
        }
        
        res.json(result);
    } catch (error) {
        // existing error handling
    }
});
```

---

### 2. **Circuit Breaker for External APIs**
**Location**: Create new file `/public/js/utils/circuitBreaker.js`
```javascript
class CircuitBreaker {
    constructor(request, options = {}) {
        this.request = request;
        this.failureThreshold = options.failureThreshold || 5;
        this.cooldownPeriod = options.cooldownPeriod || 60000;
        this.failures = 0;
        this.nextAttempt = Date.now();
        this.fallbackFn = options.fallback;
    }
    
    async call(...args) {
        // If circuit is open, use fallback
        if (this.failures >= this.failureThreshold) {
            if (Date.now() < this.nextAttempt) {
                console.warn('[CircuitBreaker] Circuit OPEN, using fallback');
                return this.fallbackFn ? this.fallbackFn(...args) : null;
            }
            // Reset after cooldown
            this.failures = 0;
        }
        
        try {
            const result = await this.request(...args);
            this.failures = 0;
            return result;
        } catch (error) {
            this.failures++;
            if (this.failures >= this.failureThreshold) {
                this.nextAttempt = Date.now() + this.cooldownPeriod;
                console.error(`[CircuitBreaker] Opening circuit after ${this.failures} failures`);
            }
            throw error;
        }
    }
}
```

**Integration Point**: In `/public/js/moosh-wallet.js` at line ~17666 (fetchBTCPrice method):
```javascript
// Create circuit breakers for each API
this.btcPriceBreaker = new CircuitBreaker(
    () => fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'),
    {
        failureThreshold: 3,
        fallback: () => ({ bitcoin: { usd: 40000 } }) // Default price
    }
);

async fetchBTCPrice() {
    try {
        const response = await this.btcPriceBreaker.call();
        // rest of existing code
    } catch (error) {
        // existing error handling
    }
}
```

---

### 3. **State Validation & Migration**
**Location**: Add to `/public/js/moosh-wallet.js` at the beginning of SparkStateManager class (~line 2500)

```javascript
class SparkStateManager {
    static STATE_VERSION = 3;
    
    constructor(app) {
        this.app = app;
        this.initializeState();
    }
    
    initializeState() {
        // Load existing state
        let state = this.load();
        
        // ADD: Validate and migrate
        state = this.validateAndMigrate(state);
        
        this.state = state;
    }
    
    validateAndMigrate(state) {
        // Ensure state has required structure
        const defaultState = this.getDefaultState();
        
        if (!state || typeof state !== 'object') {
            console.warn('[StateManager] Invalid state, using default');
            return defaultState;
        }
        
        // Version migration
        if (!state.version || state.version < SparkStateManager.STATE_VERSION) {
            state = this.migrateState(state);
        }
        
        // Validate critical fields
        const requiredFields = ['accounts', 'currentAccountId', 'addresses'];
        for (const field of requiredFields) {
            if (!(field in state)) {
                console.warn(`[StateManager] Missing field: ${field}, adding default`);
                state[field] = defaultState[field];
            }
        }
        
        return state;
    }
    
    migrateState(state) {
        const version = state.version || 1;
        
        if (version < 2) {
            // Migration v1 -> v2
            console.log('[StateManager] Migrating state v1 -> v2');
            state.balanceCache = {};
        }
        
        if (version < 3) {
            // Migration v2 -> v3
            console.log('[StateManager] Migrating state v2 -> v3');
            state.errorLog = [];
        }
        
        state.version = SparkStateManager.STATE_VERSION;
        return state;
    }
}
```

---

### 4. **Logger Implementation**
**Location**: Create new file `/public/js/utils/logger.js`

```javascript
class Logger {
    static LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };
    
    static currentLevel = this.LOG_LEVELS.INFO;
    static logs = [];
    static maxLogs = 1000;
    
    static log(level, component, message, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            ...data
        };
        
        // Store in memory
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Console output
        const levelName = Object.keys(this.LOG_LEVELS).find(
            key => this.LOG_LEVELS[key] === level
        );
        console.log(`[${levelName}] [${component}] ${message}`, data);
        
        // Send errors to monitoring (if implemented)
        if (level === this.LOG_LEVELS.ERROR) {
            this.sendToMonitoring(entry);
        }
    }
    
    static debug(component, message, data) {
        this.log(this.LOG_LEVELS.DEBUG, component, message, data);
    }
    
    static info(component, message, data) {
        this.log(this.LOG_LEVELS.INFO, component, message, data);
    }
    
    static warn(component, message, data) {
        this.log(this.LOG_LEVELS.WARN, component, message, data);
    }
    
    static error(component, message, error) {
        this.log(this.LOG_LEVELS.ERROR, component, message, {
            error: error.message,
            stack: error.stack
        });
    }
    
    static getLogs(filter = {}) {
        let filtered = this.logs;
        
        if (filter.level !== undefined) {
            filtered = filtered.filter(log => log.level >= filter.level);
        }
        
        if (filter.component) {
            filtered = filtered.filter(log => log.component === filter.component);
        }
        
        if (filter.since) {
            filtered = filtered.filter(log => new Date(log.timestamp) > filter.since);
        }
        
        return filtered;
    }
    
    static downloadLogs() {
        const logs = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moosh-logs-${Date.now()}.json`;
        a.click();
    }
}

// Make globally available
window.Logger = Logger;
```

**Integration Point**: Replace all console.log/error calls in `/public/js/moosh-wallet.js`:
```javascript
// Example: Line ~17670 in fetchBTCPrice
// OLD:
console.error('[AccountListModal] Failed to fetch BTC price:', error);

// NEW:
Logger.error('AccountListModal', 'Failed to fetch BTC price', error);
```

---

### 5. **Critical Path Tests**
**Location**: Create new file `/tests/critical-paths.test.js`

```javascript
// Critical tests that MUST pass before any commit
const assert = require('assert');
const fetch = require('node-fetch');

describe('Critical Path Tests', () => {
    const API_URL = 'http://localhost:3001';
    
    test('Seed generation maintains exact structure', async () => {
        const response = await fetch(`${API_URL}/api/spark/generate-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strength: 256 })
        });
        
        const result = await response.json();
        
        // CRITICAL: Verify exact structure
        assert(result.success === true, 'Response must have success: true');
        assert(typeof result.data === 'object', 'Response must have data object');
        assert(typeof result.data.mnemonic === 'string', 'Mnemonic must be string');
        assert(result.data.mnemonic.split(' ').length === 24, 'Must be 24 words');
        assert(typeof result.data.addresses === 'object', 'Must have addresses object');
        assert(typeof result.data.addresses.bitcoin === 'string', 'Must have bitcoin address');
        assert(typeof result.data.addresses.spark === 'string', 'Must have spark address');
    });
    
    test('Account state persistence', () => {
        // Test state save/load cycle
        const testState = {
            version: 3,
            accounts: [{ id: 'test', name: 'Test Account' }],
            currentAccountId: 'test'
        };
        
        localStorage.setItem('sparkWalletState', JSON.stringify(testState));
        const loaded = JSON.parse(localStorage.getItem('sparkWalletState'));
        
        assert.deepEqual(loaded, testState, 'State must persist correctly');
    });
});

// Run with: npm run test:critical
```

---

### 6. **Health Check System**
**Location**: Add to `/src/server/api-server.js` at line ~50

```javascript
// Health check endpoint with detailed status
app.get('/health/detailed', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {}
    };
    
    // Check external APIs
    try {
        const btcPrice = await fetch('https://api.coingecko.com/api/v3/ping');
        health.checks.coingecko = btcPrice.ok ? 'ok' : 'error';
    } catch {
        health.checks.coingecko = 'error';
    }
    
    try {
        const blockchain = await fetch('https://blockchain.info/q/getblockcount');
        health.checks.blockchain = blockchain.ok ? 'ok' : 'error';
    } catch {
        health.checks.blockchain = 'error';
    }
    
    // Overall status
    const hasErrors = Object.values(health.checks).includes('error');
    health.status = hasErrors ? 'degraded' : 'ok';
    
    res.status(hasErrors ? 503 : 200).json(health);
});
```

---

### 7. **Pre-commit Hook**
**Location**: Create file `/.githooks/pre-commit`

```bash
#!/bin/bash
echo "Running pre-commit checks..."

# Check if servers are running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "⚠️  WARNING: API server not running. Start with: npm run start"
fi

# Run critical tests
echo "Running critical path tests..."
npm run test:critical || {
    echo "❌ Critical tests failed. Fix before committing."
    exit 1
}

# Check for console.log (should use Logger instead)
if grep -r "console\.\(log\|error\)" public/js/moosh-wallet.js | grep -v "Logger"; then
    echo "⚠️  WARNING: Found console.log/error. Consider using Logger instead."
fi

echo "✅ Pre-commit checks passed!"
```

**Setup**: In terminal:
```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

---

## 📋 Quick Implementation Checklist

When implementing error prevention:

1. **Start with Logger** (30 mins)
   - Add logger.js file
   - Replace 10-20 console.logs as examples

2. **Add State Validation** (1 hour)
   - Add validateAndMigrate method
   - Test with corrupted state

3. **Implement Circuit Breakers** (2 hours)
   - Add for BTC price API
   - Add for balance APIs
   - Test by blocking network

4. **Create Critical Tests** (1 hour)
   - Test seed generation structure
   - Test state persistence
   - Add to package.json

5. **Setup Pre-commit Hook** (15 mins)
   - Create hook file
   - Configure git
   - Test with intentional break

---

## 🚨 Emergency Recovery

If something breaks:

```bash
# 1. Check what's failing
curl http://localhost:3001/health/detailed

# 2. Check logs
tail -n 100 api-server.log

# 3. Test seed generation
curl -X POST http://localhost:3001/api/spark/generate-wallet \
  -H "Content-Type": "application/json" \
  -d '{"strength": 256}'

# 4. Clear state if corrupted
# In browser console:
localStorage.removeItem('sparkWalletState');
location.reload();

# 5. Restore from working commit
git checkout 7b831715d115a576ae1f4495d5140d403ace8213 -- [broken-file]
```

---

## 📚 Reference Links

- Working commit: `7b831715d115a576ae1f4495d5140d403ace8213`
- Critical paths: `/docs/SEED_GENERATION_CRITICAL_PATH.md`
- Main rules: `/CLAUDE.md`

Remember: **ALWAYS** read CLAUDE.md before making changes to seed generation!