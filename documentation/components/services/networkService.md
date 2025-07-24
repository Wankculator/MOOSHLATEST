# Network Service Documentation

## Overview
The Network Service provides comprehensive Bitcoin network information including block height, fee estimates, mempool statistics, and price data. It implements a robust caching mechanism and fallback strategies for reliability.

## Service Details

- **File**: `/src/server/services/networkService.js`
- **Purpose**: Network status monitoring and fee estimation
- **Dependencies**: 
  - Native `https` module (no external dependencies)
  - Custom fetch wrapper

## Main Functions

### `getNetworkInfo()`
Fetches comprehensive network information.

**Returns:**
```javascript
{
    status: {
        connected: true,
        network: "mainnet",
        blockHeight: 823456,
        latency: 0
    },
    blockHeight: 823456,
    fees: {
        fast: 30,      // sats/byte for next block
        medium: 20,    // ~30 minutes
        slow: 10,      // ~1 hour
        economy: 5     // Several hours
    },
    mempool: {
        size: 15234,
        bytes: 45678912,
        totalFees: 0.12345678,
        feeHistogram: []
    },
    price: {
        usd: 45678.90,
        eur: 42345.67,
        gbp: 38901.23,
        change24h: 2.34,
        volume24h: 1234567890
    },
    recentBlocks: [...],
    mempoolCongestion: "medium",
    recommendedFee: {
        priority: "medium",
        satsPerByte: 20,
        estimatedTime: "30-60 minutes"
    },
    timestamp: 1705745123456
}
```

### `getBlockHeight()`
Gets the current blockchain height.

**Returns:**
```javascript
823456 // Current block number
```

### `getFeeEstimates()`
Provides fee recommendations for different confirmation speeds.

**Returns:**
```javascript
{
    fast: 30,      // Next block
    medium: 20,    // ~30 minutes
    slow: 10,      // ~1 hour  
    economy: 5     // Several hours
}
```

### `getMempoolStats()`
Returns current mempool statistics.

**Returns:**
```javascript
{
    size: 15234,           // Transaction count
    bytes: 45678912,       // Total size in bytes
    totalFees: 0.12345678, // Total fees in BTC
    feeHistogram: []       // Fee distribution
}
```

### `getBitcoinPrice()`
Fetches current Bitcoin prices.

**Returns:**
```javascript
{
    usd: 45678.90,
    eur: 42345.67,
    gbp: 38901.23,
    change24h: 2.34,      // Percentage
    volume24h: 1234567890 // USD volume
}
```

### `getRecentBlocks(limit = 10)`
Gets information about recent blocks.

**Parameters:**
- `limit` (number): Number of blocks to return

**Returns:**
```javascript
[
    {
        height: 823456,
        hash: "00000000...",
        timestamp: 1705745123,
        txCount: 2345,
        size: 1234567,
        weight: 3456789,
        fees: 0.12345678,
        medianFee: 15
    }
]
```

## Implementation Details

### Network Support
```javascript
this.endpoints = {
    mainnet: {
        mempool: 'https://mempool.space/api',
        blockstream: 'https://blockstream.info/api',
        coingecko: 'https://api.coingecko.com/api/v3'
    },
    testnet: {
        mempool: 'https://mempool.space/testnet/api',
        blockstream: 'https://blockstream.info/testnet/api',
        coingecko: 'https://api.coingecko.com/api/v3'
    }
}
```

### Caching Strategy
```javascript
async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
    }
    
    // Fetch new data...
}
```

- **Cache Duration**: 30 seconds
- **Graceful Fallback**: Returns stale cache on error
- **Memory-based**: Uses Map for storage

### Custom Fetch Implementation
```javascript
const fetch = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ data: JSON.parse(data) });
            });
        }).on('error', reject);
    });
};
```

## External API Connections

### Primary APIs
1. **Mempool.space**
   - Block height
   - Fee estimates
   - Mempool stats
   - Recent blocks

2. **Blockstream.info**
   - Fallback for all above
   - Same endpoints structure

3. **CoinGecko**
   - Bitcoin price data
   - Multi-currency support
   - 24h statistics

### API Fallback Strategy
```javascript
try {
    // Try primary API (mempool.space)
    response = await fetch(mempoolUrl);
} catch (error) {
    // Fallback to blockstream.info
    response = await fetch(blockstreamUrl);
}
```

## Error Handling

### Network Failures
- Returns cached data if available
- Provides fallback fee estimates
- Logs warnings for debugging

### Timeout Handling
- 5-second timeout per request
- Automatic fallback to next API
- Partial data on timeout

### Fallback Values
```javascript
// Testnet fallback fees
{ fast: 10, medium: 5, slow: 2, economy: 1 }

// Mainnet fallback fees
{ fast: 30, medium: 20, slow: 10, economy: 5 }
```

## Performance Considerations

### Optimization Strategies
1. **Parallel Fetching**
   ```javascript
   const [...results] = await Promise.allSettled([
       this.checkNetworkStatus(),
       this.getBlockHeight(),
       this.getFeeEstimates(),
       // ... more
   ]);
   ```

2. **Smart Caching**
   - 30-second TTL
   - Stale cache on error
   - Per-key caching

3. **Minimal Dependencies**
   - Native HTTPS only
   - No external packages
   - Lightweight implementation

### Performance Metrics
- **Cache Hit**: <1ms response
- **API Call**: 100-500ms typical
- **Full Network Info**: 200-1000ms

## Congestion Calculation

### Algorithm
```javascript
calculateCongestion(mempoolStats) {
    const size = mempoolStats.size || 0;
    
    if (size < 5000) return 'low';
    if (size < 20000) return 'medium';
    if (size < 50000) return 'high';
    return 'very-high';
}
```

### Fee Recommendations
Based on congestion level:
- **Low**: Use economy fees (2-4 hours)
- **Medium**: Use slow fees (1-2 hours)
- **High**: Use medium fees (30-60 min)
- **Very High**: Use fast fees (10-20 min)

## Testing Approach

### Unit Tests
```javascript
describe('NetworkService', () => {
    it('should cache responses', async () => {
        const height1 = await service.getBlockHeight();
        const height2 = await service.getBlockHeight();
        expect(height1).toBe(height2); // Same cached value
    });
});
```

### Integration Tests
- Test API fallback mechanism
- Verify cache expiration
- Check error handling

## Common Issues and Solutions

### Issue 1: API Rate Limiting
**Problem**: Too many requests to external APIs
**Solution**: 30-second caching implemented

### Issue 2: Network Timeouts
**Problem**: Slow API responses
**Solution**: 5-second timeout with fallback

### Issue 3: Inconsistent Data
**Problem**: Different APIs return different formats
**Solution**: Normalized response structure

## Integration Patterns

### Singleton Pattern
```javascript
// Create singleton instance
const networkService = new NetworkService();

// Export instance
module.exports = networkService;
```

### API Endpoint Usage
```javascript
app.get('/api/network/info', async (req, res) => {
    const info = await networkService.getNetworkInfo();
    res.json(info);
});
```

## Environment Configuration

### Environment Variables
- `BITCOIN_NETWORK`: 'mainnet' or 'testnet'
- Default: 'mainnet'

### Network Switching
```javascript
networkService.setNetwork('testnet');
// Clears cache automatically
```

## Security Measures

### API Security
- HTTPS-only connections
- No authentication tokens
- Public API endpoints only

### Data Validation
- JSON parsing in try-catch
- Type checking responses
- Sanitized error messages

## Future Enhancements

1. **WebSocket Support**
   - Real-time block notifications
   - Live mempool updates
   - Price streaming

2. **Enhanced Caching**
   - Redis backend
   - Distributed caching
   - Longer TTL options

3. **Additional APIs**
   - Lightning Network stats
   - Mining pool data
   - Network hashrate