# Spark Compatible Service Documentation

## Overview
The Spark Compatible Service acts as a transformation layer between the core wallet services and the MOOSH Wallet UI. It ensures that wallet data is formatted exactly as the frontend expects, maintaining backward compatibility.

## Service Details

- **File**: `/src/server/services/sparkCompatibleService.js`
- **Purpose**: Transform wallet data to match UI expectations
- **Dependencies**: 
  - `./walletService.js`
  - `node-fetch` for external API calls

## Main Functions

### `generateSparkCompatibleWallet(strength = 256)`
Generates a wallet with UI-compatible formatting.

**Parameters:**
- `strength` (number): 128 for 12 words, 256 for 24 words

**Returns:**
```javascript
{
    success: true,
    data: {
        mnemonic: "string format not array",
        addresses: {
            bitcoin: "bc1q...",  // Primary SegWit address
            spark: "sp1p..."
        },
        privateKeys: {
            bitcoin: { wif: "K...", hex: "..." },
            spark: { hex: "..." }
        },
        bitcoinAddresses: {
            segwit: "bc1q...",
            taproot: "bc1p...",
            legacy: "1...",
            nestedSegwit: "3..."
        },
        allPrivateKeys: {
            segwit: { wif: "...", hex: "..." },
            taproot: { wif: "...", hex: "..." },
            legacy: { wif: "...", hex: "..." },
            nestedSegwit: { wif: "...", hex: "..." },
            spark: { hex: "..." }
        },
        xpub: "xpub...",
        xpriv: "xprv...",
        sparkPath: "m/84'/0'/0'/0/0",
        wordCount: 24
    }
}
```

### `importSparkCompatibleWallet(mnemonic)`
Imports a wallet and formats for UI.

**Parameters:**
- `mnemonic` (string): Seed phrase to import

**Returns:** Same structure as generate function

### `getBalance(address)`
Fetches real-time balance from blockchain APIs.

**Parameters:**
- `address` (string): Bitcoin or Spark address

**Returns:**
```javascript
{
    success: true,
    data: {
        address: "bc1q...",
        balance: "0.12345678",
        unconfirmed: "0.00000000",
        total: "0.12345678",
        currency: "BTC",
        txCount: 42
    }
}
```

### `getTransactions(address)`
Returns transaction history (currently mock data).

**Parameters:**
- `address` (string): Bitcoin or Spark address

**Returns:**
```javascript
{
    success: true,
    data: {
        address: "bc1q...",
        transactions: [],
        count: 0
    }
}
```

## Implementation Details

### Data Transformation
The service transforms internal wallet format to UI format:

```javascript
// Internal format from walletService
bitcoinWallet.addresses.segwit.address

// Transformed to UI format
data.addresses.bitcoin = bitcoinWallet.addresses.segwit.address
```

### Multi-Address Support
Provides all Bitcoin address types:
- **SegWit** (bc1q...): Primary address
- **Taproot** (bc1p...): Latest standard
- **Legacy** (1...): Backward compatibility
- **Nested SegWit** (3...): P2SH-wrapped SegWit

## External API Connections

### Balance APIs (Fallback Strategy)
1. **Primary**: mempool.space
   ```
   https://mempool.space/api/address/{address}
   ```

2. **Secondary**: blockstream.info
   ```
   https://blockstream.info/api/address/{address}
   ```

3. **Tertiary**: blockchain.info
   ```
   https://blockchain.info/q/addressbalance/{address}
   ```

### API Response Handling
```javascript
// Robust fallback mechanism
let balanceData = null;

// Try multiple APIs
for (const api of [mempool, blockstream, blockchain]) {
    try {
        balanceData = await fetchFromAPI(api);
        if (balanceData) break;
    } catch (e) {
        continue; // Try next API
    }
}
```

## Error Handling

### Balance Fetch Errors
- Returns zero balance on failure
- Includes error message in response
- Logs failures for debugging

### Network Timeouts
- 5-second timeout per API
- Automatic fallback to next API
- Graceful degradation

## Security Measures

### API Security
- No authentication tokens exposed
- HTTPS-only connections
- Input validation for addresses

### Data Sanitization
- Address format validation
- Response data validation
- Error message sanitization

## Performance Considerations

### Optimization Strategies
1. **Parallel Generation**
   ```javascript
   const [bitcoinWallet, sparkWallet] = await Promise.all([
       generateBitcoinWallet(mnemonic),
       generateSparkAddress(mnemonic)
   ]);
   ```

2. **API Fallback**
   - Quick timeout (5 seconds)
   - Sequential fallback
   - Cached responses where applicable

### Performance Metrics
- **Wallet Generation**: <1 second
- **Balance Fetch**: 1-5 seconds
- **Import Speed**: <500ms

## Testing Approach

### Unit Tests
```javascript
describe('SparkCompatibleService', () => {
    it('should generate wallet with correct format', async () => {
        const wallet = await generateSparkCompatibleWallet(256);
        expect(wallet.data.mnemonic).toBeString();
        expect(wallet.data.wordCount).toBe(24);
    });
});
```

### Integration Tests
- Test all address type generation
- Verify API fallback mechanism
- Check response formatting

## Common Issues and Solutions

### Issue 1: UI Expects String Mnemonic
**Problem**: Some services return mnemonic as array
**Solution**: Always return as space-separated string

### Issue 2: Missing Address Types
**Problem**: UI expects all address types
**Solution**: Generate all types, use empty string if unavailable

### Issue 3: Balance API Failures
**Problem**: External APIs unreliable
**Solution**: Multiple fallback APIs implemented

## Integration Patterns

### API Endpoint Usage
```javascript
// Generate wallet endpoint
app.post('/api/spark/generate-wallet', async (req, res) => {
    const result = await generateSparkCompatibleWallet(256);
    res.json(result);
});

// Balance endpoint
app.get('/api/balance/:address', async (req, res) => {
    const result = await getBalance(req.params.address);
    res.json(result);
});
```

### Frontend Integration
```javascript
// Frontend expects this exact structure
const wallet = await apiService.request('/api/spark/generate-wallet');
// Access wallet.data.addresses.bitcoin, wallet.data.addresses.spark
```

## Data Structures

### Address Detection
- Bitcoin patterns: 1..., 3..., bc1...
- Spark patterns: sp1...
- Network detection: mainnet vs testnet

### Response Consistency
All responses follow the pattern:
```javascript
{
    success: boolean,
    data: object | null,
    error?: string
}
```

## Dependencies

### Internal Dependencies
- `walletService.js`: Core wallet operations
- Bitcoin wallet generation
- Spark address generation

### External Dependencies
```json
{
    "node-fetch": "^3.3.0"
}
```

## Future Enhancements

1. **Real Transaction History**
   - Implement actual transaction fetching
   - Pagination support
   - Transaction details

2. **WebSocket Support**
   - Real-time balance updates
   - Transaction notifications
   - Price alerts

3. **Enhanced Caching**
   - Redis integration
   - Longer cache TTL
   - Smart cache invalidation