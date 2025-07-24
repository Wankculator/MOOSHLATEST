# Blockchain Service

**Status**: 🟢 Active
**Type**: Backend Service
**File**: /src/server/services/blockchainService.js
**Lines**: 1-300
**Dependencies**: node-fetch
**Security Critical**: Yes

## Overview
Core blockchain interaction service that provides real-time Bitcoin balance and transaction data from public blockchain APIs. Implements fallback mechanisms for reliability and handles both mainnet and testnet operations.

## Core Methods

### getBitcoinBalance(address, network = 'mainnet')
- **Purpose**: Fetches real-time Bitcoin balance from blockchain
- **Parameters**: 
  - `address` (string): Bitcoin address to query
  - `network` (string): 'mainnet' or 'testnet'
- **Returns**: Object with balance data
  ```javascript
  {
    success: true,
    data: {
      address: string,
      balance: string (BTC formatted),
      unconfirmed: string (BTC formatted),
      total: string (BTC formatted),
      currency: 'BTC',
      txCount: number,
      fundedTxoCount: number,
      spentTxoCount: number
    }
  }
  ```
- **Line**: 28-116
- **Security**: Validates address format, handles 404 for new addresses

### getTransactionHistory(address, network = 'mainnet')
- **Purpose**: Retrieves transaction history for an address
- **Parameters**: 
  - `address` (string): Bitcoin address
  - `network` (string): Network type
- **Returns**: Array of transaction objects
- **Line**: 120-185
- **Security**: Implements pagination for large histories

### getSparkBalance(address)
- **Purpose**: Handles Spark Protocol address balance queries
- **Parameters**: `address` (string): Spark address (sp1...)
- **Returns**: Spark balance data
- **Line**: 36-37
- **Security**: Delegates to Spark-specific handling

### estimateFee(priority = 'medium')
- **Purpose**: Estimates current network fees
- **Parameters**: `priority` (string): 'low', 'medium', 'high'
- **Returns**: Fee rate in sat/vB
- **Line**: 190-220
- **Security**: Caches fee estimates for performance

## State Management
- Stateless service - no internal state
- Uses external blockchain APIs for all data
- Implements caching for fee estimates (30-second TTL)

## Error Handling
- Primary API: Blockstream (blockstream.info)
- Fallback API: Mempool.space
- Returns zero balance for 404 (new addresses)
- Comprehensive error logging with context
- Graceful degradation on API failures

## Integration Points
- **Called By**: 
  - API endpoints (/api/bitcoin/balance, /api/bitcoin/transactions)
  - balanceService for unified balance queries
  - Mobile apps via REST API
- **Calls**: 
  - Blockstream API (primary)
  - Mempool.space API (fallback)
- **Events**: None (stateless service)

## API Endpoints Used
```javascript
// Blockstream API
mainnet: 'https://blockstream.info/api'
testnet: 'https://blockstream.info/testnet/api'

// Mempool.space API (fallback)
mainnet: 'https://mempool.space/api'
testnet: 'https://mempool.space/testnet/api'
```

## Testing
```bash
# Unit tests
npm test -- blockchainService

# Integration test
curl http://localhost:3001/api/bitcoin/balance/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

## Common Issues

### Issue: API Rate Limiting
**Solution**: Implement caching layer or use multiple API providers in rotation

### Issue: Slow Response Times
**Solution**: 
- Enable response caching (30-second TTL)
- Use Promise.all for parallel requests
- Consider Redis for persistent cache

### Issue: Invalid Address Format
**Solution**: Service validates address format and returns appropriate error

## Performance Optimization
- Caches fee estimates for 30 seconds
- Implements connection pooling
- Uses compression for API responses
- Parallel requests for multiple addresses

## Security Considerations
- No private keys handled by this service
- All API calls use HTTPS
- Input validation on all addresses
- No sensitive data logged
- Rate limiting recommended for production