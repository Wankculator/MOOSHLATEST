# Balance Service

**Status**: 🟢 Active
**Type**: Backend Service
**File**: /src/server/services/balanceService.js
**Lines**: 1-250
**Dependencies**: https (native), no external dependencies
**Security Critical**: No

## Overview
Unified balance fetching service that intelligently detects address types (Bitcoin vs Spark) and routes to appropriate APIs. Implements a lightweight HTTP client without external dependencies for minimal footprint.

## Core Methods

### detectAddressType(address)
- **Purpose**: Identifies whether an address is Bitcoin or Spark and its network
- **Parameters**: `address` (string): Cryptocurrency address
- **Returns**: Object with type detection
  ```javascript
  {
    type: 'bitcoin' | 'spark',
    network: 'mainnet' | 'testnet',
    addressType: 'p2pkh' | 'p2sh' | 'bech32' | 'spark' | etc
  }
  ```
- **Line**: 33-77
- **Security**: Pattern matching only, no network calls

### getBitcoinBalance(address, network = 'mainnet')
- **Purpose**: Fetches Bitcoin balance from Blockstream API
- **Parameters**: 
  - `address` (string): Bitcoin address
  - `network` (string): Network type
- **Returns**: Formatted balance object
  ```javascript
  {
    address: string,
    network: string,
    currency: 'BTC',
    balance: {
      satoshis: number,
      btc: number,
      formatted: string (e.g., "0.12345678 BTC")
    },
    confirmed: { satoshis, btc },
    unconfirmed: { satoshis, btc }
  }
  ```
- **Line**: 80-130
- **Security**: Read-only operation, no authentication required

### getSparkBalance(address, network = 'mainnet')
- **Purpose**: Retrieves Spark Protocol balance
- **Parameters**: 
  - `address` (string): Spark address
  - `network` (string): Network type
- **Returns**: Spark balance data
- **Line**: 135-180
- **Security**: Connects to configured Spark RPC endpoints

### getBalance(address)
- **Purpose**: Universal balance fetcher that auto-detects address type
- **Parameters**: `address` (string): Any supported address
- **Returns**: Balance data appropriate to address type
- **Line**: 185-210
- **Security**: Validates address before processing

### getMultipleBalances(addresses)
- **Purpose**: Batch balance fetching for efficiency
- **Parameters**: `addresses` (array): List of addresses
- **Returns**: Array of balance objects
- **Line**: 215-245
- **Security**: Parallel processing with error boundaries

## State Management
- Completely stateless service
- No caching (delegated to API layer)
- No persistent connections

## Error Handling
- Address validation before API calls
- Graceful handling of network errors
- Returns zero balance for invalid addresses
- Individual error handling in batch operations
- Timeout handling (30 seconds default)

## Integration Points
- **Called By**: 
  - API endpoints (/api/balance)
  - Wallet refresh operations
  - Dashboard balance updates
- **Calls**: 
  - Blockstream API for Bitcoin
  - Spark RPC endpoints for Spark
- **Events**: None

## Address Pattern Recognition
```javascript
// Bitcoin Mainnet
- P2PKH: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/
- P2SH: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/
- Bech32: /^bc1[a-z0-9]{39,59}$/

// Bitcoin Testnet
- P2PKH: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
- P2SH: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
- Bech32: /^tb1[a-z0-9]{39,59}$/

// Spark Protocol
- Mainnet: /^spark1[a-z0-9]{39,59}$/
- Testnet: /^tspark1[a-z0-9]{39,59}$/
```

## Testing
```bash
# Unit tests
npm test -- balanceService

# Manual testing
node -e "const {getBalance} = require('./src/server/services/balanceService.js'); getBalance('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh').then(console.log)"
```

## Common Issues

### Issue: Slow batch balance fetching
**Solution**: 
- Use Promise.all for parallel requests
- Implement request pooling
- Add caching layer at API level

### Issue: RPC connection failures for Spark
**Solution**: 
- Check SPARK_RPC_ENDPOINT environment variable
- Verify Spark node is running
- Implement retry logic with exponential backoff

### Issue: Address type misdetection
**Solution**: Update regex patterns to match latest address formats

## Performance Optimization
- Native HTTPS module (no external dependencies)
- Parallel processing for batch requests
- Minimal memory footprint
- Stream processing for large responses

## Environment Configuration
```bash
# Spark RPC endpoints
SPARK_RPC_ENDPOINT=http://localhost:8332
SPARK_TESTNET_RPC_ENDPOINT=http://localhost:18332
```