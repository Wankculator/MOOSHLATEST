# Network Communication Patterns Guide

**Last Updated**: 2025-07-21  
**Component**: Core Network Communication  
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 2863-3150 - APIService)
- `/src/server/api-server.js`
- `/src/server/services/networkService.js`

## Overview

MOOSH Wallet implements a sophisticated network communication layer with proxy support, CORS handling, retry strategies, and robust error recovery. All external API calls are routed through the internal proxy server to avoid CORS issues and ensure security.

## Architecture

### API Service Structure

```javascript
class APIService {
    constructor(stateManager) {
        // Dynamic base URL based on environment
        this.baseURL = this.determineBaseURL();
        
        // Network-specific endpoints
        this.endpoints = {
            coingecko: 'https://api.coingecko.com/api/v3',
            blockstream: isMainnet ? 
                'https://blockstream.info/api' : 
                'https://blockstream.info/testnet/api',
            blockcypher: isMainnet ? 
                'https://api.blockcypher.com/v1/btc/main' : 
                'https://api.blockcypher.com/v1/btc/test3'
        };
    }
}
```

## Request Patterns

### 1. Proxy-Based Requests (CORS Compliance)

**Pattern**: All external API calls MUST go through the proxy server.

```javascript
// ✅ CORRECT - Using proxy endpoint
const response = await fetch(`${this.baseURL}/api/proxy/bitcoin-price`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// ❌ WRONG - Direct external API call
const response = await fetch('https://api.coingecko.com/api/v3/simple/price');
```

### 2. Request with Timeout

**Pattern**: Implement request timeouts using AbortController.

```javascript
async fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}
```

### 3. Multi-Endpoint Fallback

**Pattern**: Try multiple endpoints in sequence for resilience.

```javascript
async fetchBlockHeight() {
    const endpoints = [
        `${this.endpoints.blockstream}/blocks/tip/height`,
        'https://mempool.space/api/blocks/tip/height',
        'https://api.blockcypher.com/v1/btc/main'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await this.fetchWithTimeout(endpoint);
            if (response.ok) {
                return await this.parseResponse(response, endpoint);
            }
        } catch (error) {
            console.warn(`Endpoint failed: ${endpoint}`, error);
            continue;
        }
    }
    
    throw new Error('All endpoints failed');
}
```

## Retry Strategies

### 1. Exponential Backoff

**Pattern**: Implement exponential backoff for transient failures.

```javascript
async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Don't retry on 4xx errors (client errors)
            if (error.status >= 400 && error.status < 500) {
                throw error;
            }
            
            // Calculate exponential backoff
            const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
            
            console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}
```

### 2. Circuit Breaker Pattern

**Pattern**: Prevent cascade failures by tracking endpoint health.

```javascript
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.failures = new Map();
        this.threshold = threshold;
        this.timeout = timeout;
    }
    
    async execute(endpoint, fn) {
        const failures = this.failures.get(endpoint) || 0;
        
        // Circuit is open
        if (failures >= this.threshold) {
            throw new Error(`Circuit breaker open for ${endpoint}`);
        }
        
        try {
            const result = await fn();
            // Reset on success
            this.failures.delete(endpoint);
            return result;
        } catch (error) {
            // Increment failure count
            this.failures.set(endpoint, failures + 1);
            
            // Reset after timeout
            setTimeout(() => {
                this.failures.delete(endpoint);
            }, this.timeout);
            
            throw error;
        }
    }
}
```

## Error Handling

### 1. Graceful Degradation

**Pattern**: Always provide fallback values and cache results.

```javascript
async fetchBitcoinPrice() {
    try {
        // Try primary source
        const price = await this.fetchFromPrimary();
        this.cachePrice(price);
        return price;
    } catch (primaryError) {
        console.warn('Primary source failed:', primaryError);
        
        try {
            // Try backup source
            const price = await this.fetchFromBackup();
            this.cachePrice(price);
            return price;
        } catch (backupError) {
            console.warn('Backup source failed:', backupError);
            
            // Return cached value
            const cached = this.getCachedPrice();
            if (cached) {
                console.log('Using cached price');
                return cached;
            }
            
            // Last resort: return last known value
            return this.getLastKnownPrice() || { usd: 0, usd_24h_change: 0 };
        }
    }
}
```

### 2. Error Response Handling

**Pattern**: Normalize error responses across different APIs.

```javascript
async handleAPIResponse(response) {
    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        
        try {
            const errorData = await response.json();
            error.message = errorData.message || error.message;
            error.details = errorData;
        } catch {
            // Response wasn't JSON
        }
        
        throw error;
    }
    
    return response.json();
}
```

## Caching Strategies

### 1. Time-Based Cache

**Pattern**: Cache responses with TTL (Time To Live).

```javascript
class APICache {
    constructor() {
        this.cache = new Map();
    }
    
    set(key, value, ttl = 300000) { // 5 minutes default
        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
}
```

### 2. Smart Cache Invalidation

**Pattern**: Invalidate cache based on events.

```javascript
class SmartCache extends APICache {
    constructor() {
        super();
        this.dependencies = new Map();
    }
    
    setWithDependencies(key, value, deps = [], ttl) {
        super.set(key, value, ttl);
        this.dependencies.set(key, deps);
    }
    
    invalidate(trigger) {
        // Invalidate all entries dependent on trigger
        for (const [key, deps] of this.dependencies) {
            if (deps.includes(trigger)) {
                this.cache.delete(key);
                this.dependencies.delete(key);
            }
        }
    }
}
```

## WebSocket Implementation (Future)

### Connection Management

```javascript
class WebSocketManager {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }
    
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.scheduleReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.ws.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }
        
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
}
```

## Request Queue Management

### Pattern: Queue requests to prevent overwhelming the server

```javascript
class RequestQueue {
    constructor(maxConcurrent = 3) {
        this.queue = [];
        this.active = 0;
        this.maxConcurrent = maxConcurrent;
    }
    
    async add(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        if (this.active >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        
        this.active++;
        const { requestFn, resolve, reject } = this.queue.shift();
        
        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.active--;
            this.process();
        }
    }
}
```

## Offline Support

### Pattern: Queue operations when offline

```javascript
class OfflineQueue {
    constructor() {
        this.queue = [];
        this.online = navigator.onLine;
        
        window.addEventListener('online', () => {
            this.online = true;
            this.flush();
        });
        
        window.addEventListener('offline', () => {
            this.online = false;
        });
    }
    
    async execute(operation) {
        if (this.online) {
            try {
                return await operation();
            } catch (error) {
                if (this.isNetworkError(error)) {
                    this.online = false;
                    return this.enqueue(operation);
                }
                throw error;
            }
        } else {
            return this.enqueue(operation);
        }
    }
    
    enqueue(operation) {
        const promise = new Promise((resolve, reject) => {
            this.queue.push({ operation, resolve, reject });
        });
        
        // Persist queue to localStorage
        this.persistQueue();
        
        return promise;
    }
    
    async flush() {
        const queue = [...this.queue];
        this.queue = [];
        
        for (const { operation, resolve, reject } of queue) {
            try {
                const result = await operation();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }
    }
}
```

## Best Practices

### 1. Always Use Request Wrapper

```javascript
async request(endpoint, options = {}) {
    return ComplianceUtils.measurePerformance(`API: ${endpoint}`, async () => {
        const response = await this.retryWithBackoff(
            () => this.fetchWithTimeout(endpoint, options)
        );
        
        return this.handleAPIResponse(response);
    });
}
```

### 2. Validate Responses

```javascript
validateBitcoinPrice(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
    }
    
    if (typeof data.usd !== 'number' || data.usd <= 0) {
        throw new Error('Invalid price value');
    }
    
    return true;
}
```

### 3. Log Network Activity

```javascript
async loggedRequest(endpoint, options) {
    const startTime = Date.now();
    
    try {
        const result = await this.request(endpoint, options);
        ComplianceUtils.log('Network', `Success: ${endpoint} (${Date.now() - startTime}ms)`, 'info');
        return result;
    } catch (error) {
        ComplianceUtils.log('Network', `Failed: ${endpoint} - ${error.message}`, 'error');
        throw error;
    }
}
```

## Testing Network Code

### Mock API Responses

```javascript
class MockAPIService extends APIService {
    constructor() {
        super();
        this.mockResponses = new Map();
    }
    
    setMockResponse(endpoint, response) {
        this.mockResponses.set(endpoint, response);
    }
    
    async request(endpoint) {
        const mock = this.mockResponses.get(endpoint);
        if (mock) {
            return Promise.resolve(mock);
        }
        return super.request(endpoint);
    }
}
```

### Test Network Failures

```javascript
describe('Network Error Handling', () => {
    it('should retry on network failure', async () => {
        let attempts = 0;
        const api = new APIService();
        
        api.fetchWithTimeout = async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Network error');
            }
            return { ok: true, json: async () => ({ success: true }) };
        };
        
        const result = await api.retryWithBackoff(() => api.fetchWithTimeout('/test'));
        expect(attempts).toBe(3);
        expect(result.ok).toBe(true);
    });
});
```

## Security Considerations

1. **Never expose API keys in frontend code**
2. **Always validate and sanitize API responses**
3. **Use HTTPS for all requests**
4. **Implement rate limiting on proxy server**
5. **Log suspicious activity**
6. **Validate SSL certificates**
7. **Use Content Security Policy headers**

## Performance Optimization

1. **Batch requests when possible**
2. **Use HTTP/2 for multiplexing**
3. **Implement request deduplication**
4. **Use compression for large payloads**
5. **Cache static data aggressively**
6. **Monitor and alert on slow endpoints**
7. **Use CDN for static assets**

## Monitoring and Debugging

### Request Logging

```javascript
class NetworkLogger {
    static log(request, response, duration) {
        const log = {
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            status: response.status,
            duration: duration,
            size: response.headers.get('content-length')
        };
        
        console.table([log]);
        
        // Send to monitoring service
        this.sendToMonitoring(log);
    }
}
```

### Performance Tracking

```javascript
class NetworkPerformance {
    static track() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.initiatorType === 'fetch') {
                    console.log(`API call to ${entry.name} took ${entry.duration}ms`);
                }
            }
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
}
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Use proxy server for all external APIs |
| Timeout errors | Implement retry with exponential backoff |
| Rate limiting | Cache responses and implement request queue |
| Network offline | Queue requests and flush when online |
| SSL errors | Validate certificates on proxy server |
| Large payloads | Implement pagination and compression |
| Stale data | Use smart cache invalidation |

## Future Enhancements

1. **GraphQL Integration**: For more efficient data fetching
2. **WebSocket Support**: For real-time price updates
3. **Service Worker**: For advanced offline support
4. **Request Batching**: To reduce API calls
5. **Response Streaming**: For large data sets
6. **HTTP/3 Support**: For improved performance
7. **Edge Computing**: For reduced latency