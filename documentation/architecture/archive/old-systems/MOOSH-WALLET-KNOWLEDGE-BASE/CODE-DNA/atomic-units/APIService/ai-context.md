# APIService - AI Context Guide

## Critical Understanding

APIService is the **EXTERNAL DATA GATEWAY** for MOOSH Wallet. It handles all blockchain queries, price feeds, and backend communication. This service implements a robust fallback pattern ensuring the wallet remains functional even when APIs fail.

## Architecture Overview

```
Component → APIService → Primary API → Success
                    ↓                      ↓
              Fallback API           Cache Update
                    ↓                      ↓
              Default Value          StateManager
```

## When Modifying APIService

### Pre-Flight Checklist
- [ ] Have you tested all fallback scenarios?
- [ ] Have you handled CORS issues?
- [ ] Have you implemented proper timeouts?
- [ ] Have you respected API rate limits?
- [ ] Have you cached appropriately?

### Absolute Rules
1. **NEVER expose private keys** - Only public data
2. **ALWAYS implement fallbacks** - APIs fail frequently
3. **ALWAYS handle errors gracefully** - No app crashes
4. **RESPECT rate limits** - Avoid getting banned
5. **CACHE when sensible** - Reduce API load

## URL Configuration

### Dynamic Base URL
```javascript
// CORRECT - Adapts to environment
const currentHost = window.location.hostname;
if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    this.baseURL = 'http://localhost:3001';
} else {
    // WSL or remote access
    this.baseURL = `http://${currentHost}:3001`;
}

// Override mechanism
this.baseURL = window.MOOSH_API_URL || this.baseURL;
```

### Network Selection
```javascript
// Mainnet vs Testnet endpoints
const isMainnet = this.stateManager.get('isMainnet') !== false;
this.endpoints = {
    blockstream: isMainnet 
        ? 'https://blockstream.info/api' 
        : 'https://blockstream.info/testnet/api'
};
```

## API Fallback Patterns

### Price Fetching with Cache
```javascript
// CORRECT - Cache-first approach
async fetchBitcoinPrice() {
    // 1. Check cache (5 min TTL)
    const cache = this.stateManager.get('apiCache');
    const now = Date.now();
    if (cache.prices?.bitcoin && (now - cache.lastUpdate) < 300000) {
        return cache.prices.bitcoin;
    }
    
    // 2. Fetch fresh data
    try {
        const data = await fetch(...);
        // 3. Update cache
        cache.prices = { bitcoin: data.bitcoin };
        cache.lastUpdate = now;
        this.stateManager.set('apiCache', cache);
        return data.bitcoin;
    } catch (error) {
        // 4. Return safe default
        return { usd: 0, usd_24h_change: 0 };
    }
}
```

### Multiple Endpoint Fallback
```javascript
// CORRECT - Try each endpoint sequentially
async fetchBlockHeight() {
    const endpoints = [
        'https://blockstream.info/api/blocks/tip/height',
        'https://mempool.space/api/blocks/tip/height',
        'https://api.blockcypher.com/v1/btc/main'
    ];
    
    for (const endpoint of endpoints) {
        try {
            // Timeout control
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(endpoint, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            if (!response.ok) continue;
            
            // Success - cache and return
            const height = await parseResponse(response);
            updateCache(height);
            return height;
        } catch (error) {
            console.warn(`Failed: ${endpoint}`);
            // Continue to next endpoint
        }
    }
    
    // All failed - return cached or default
    return getCachedOrDefault();
}
```

## Common API Patterns

### Balance Query with Fallback
```javascript
// Primary: Blockstream
// Fallback: BlockCypher
// Last resort: Zero balance

async fetchAddressBalance(address) {
    try {
        // Primary API
        const response = await fetch(`${this.endpoints.blockstream}/address/${address}`);
        if (response.ok) {
            const data = await response.json();
            return {
                balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
                txCount: data.chain_stats.tx_count
            };
        }
    } catch (error) {
        // Try fallback
        try {
            const altResponse = await fetch(`blockcypher...`);
            // Process alternative response
        } catch (altError) {
            // Both failed
        }
    }
    
    // Safe default
    return { balance: 0, txCount: 0 };
}
```

### Transaction Value Calculation
```javascript
// CRITICAL - Correct net value calculation
calculateTxValue(tx, address) {
    let value = 0;
    
    // Incoming (outputs TO address)
    tx.vout.forEach(output => {
        if (output.scriptpubkey_address === address) {
            value += output.value; // Positive
        }
    });
    
    // Outgoing (inputs FROM address)
    tx.vin.forEach(input => {
        if (input.prevout?.scriptpubkey_address === address) {
            value -= input.prevout.value; // Negative
        }
    });
    
    return value; // Net change
}
```

## Error Handling Strategies

### Timeout Management
```javascript
// CORRECT - AbortController pattern
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
    const response = await fetch(url, {
        signal: controller.signal
    });
    clearTimeout(timeoutId);
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('Request timed out');
    }
}
```

### CORS Handling
```javascript
// Backend proxy for CORS issues
try {
    // Try direct API call
    const response = await fetch('https://external-api.com/data');
} catch (error) {
    // Fallback to backend proxy
    const response = await fetch(`${this.baseURL}/api/proxy/external`);
}
```

## Common AI Hallucinations to Avoid

### 1. API Key Exposure
```javascript
// HALLUCINATION - Never put API keys in frontend!
fetch('https://api.service.com/data', {
    headers: {
        'X-API-Key': 'secret-key-123' // WRONG!
    }
});

// CORRECT - Use backend proxy
fetch(`${this.baseURL}/api/external-data`);
```

### 2. Ignoring Rate Limits
```javascript
// HALLUCINATION - Spamming API
for (let i = 0; i < 100; i++) {
    fetch('/api/price'); // RATE LIMIT BAN!
}

// CORRECT - Use caching
if (cacheExpired) {
    fetch('/api/price');
}
```

### 3. No Error Handling
```javascript
// HALLUCINATION - Assuming success
const data = await fetch(url).json(); // CRASHES ON ERROR!

// CORRECT - Always check
const response = await fetch(url);
if (!response.ok) throw new Error();
const data = await response.json();
```

## Performance Optimization

### Caching Strategy
```javascript
// Price data: 5-minute cache
// Block height: No cache (always fresh)
// Balances: No cache (real-time critical)
// Transaction history: Consider caching
```

### Concurrent Requests
```javascript
// CAREFUL - Some APIs have rate limits
const [price, height, balance] = await Promise.all([
    this.fetchBitcoinPrice(),
    this.fetchBlockHeight(),
    this.fetchAddressBalance(address)
]);
```

## API Endpoint Reference

### External APIs
1. **CoinGecko**: Price data only
2. **Blockstream**: Full blockchain data
3. **BlockCypher**: Backup blockchain data
4. **Mempool.space**: Alternative blockchain data

### Internal Backend
1. **/api/spark/**: Spark protocol operations
2. **/api/wallet/**: Wallet operations
3. **/api/broadcast**: Transaction submission

## Testing Requirements

Before ANY modification:
1. Test with primary API down
2. Test with all APIs down
3. Test with slow network (timeouts)
4. Test with CORS errors
5. Verify cache behavior

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me add the API key here..." - NEVER in frontend!
2. "We don't need error handling..." - ALWAYS needed!
3. "Skip the cache check..." - Respect rate limits!
4. "Remove the timeout..." - APIs hang!
5. "Ignore CORS..." - Browser will block!

## Recovery Procedures

If APIs fail:
1. **Check browser console** - CORS or network errors
2. **Verify API status** - May be down
3. **Check rate limits** - May be banned
4. **Test fallbacks** - Should gracefully degrade
5. **Verify cache** - Should return last known

## AI Instructions Summary

When asked to modify APIService:
1. **IMPLEMENT** fallbacks for every call
2. **HANDLE** all error scenarios
3. **RESPECT** rate limits with caching
4. **USE** timeouts on all requests
5. **TEST** failure scenarios

Remember: APIService is the bridge to the blockchain. It must be resilient, fast, and never break the user experience!