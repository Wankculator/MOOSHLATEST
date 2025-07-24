# Spark SDK Service Documentation

## Overview
The Spark SDK Service is the critical integration layer for Spark Protocol wallet operations. It handles real Spark address generation using either the official SDK or a bech32m fallback implementation.

## Service Details

- **File**: `/src/server/services/sparkSDKService.js`
- **Purpose**: Generate real Spark Protocol addresses and wallets
- **Dependencies**: 
  - `@buildonspark/spark-sdk` (optional)
  - `bip39`, `bip32`, `tiny-secp256k1`
  - Native `crypto` module

## Main Functions

### `generateRealSparkWallet(network = 'MAINNET', existingMnemonic = null)`
Generates a complete Spark wallet with Bitcoin and Spark addresses.

**Parameters:**
- `network` (string): 'MAINNET' or 'TESTNET'
- `existingMnemonic` (string|null): Optional existing mnemonic to restore

**Returns:**
```javascript
{
    success: true,
    data: {
        mnemonic: "twelve word mnemonic phrase here",
        addresses: {
            bitcoin: "bc1q...",
            spark: "sp1p..."
        },
        privateKeys: {
            wif: "K...",
            hex: "..."
        },
        network: "mainnet",
        createdAt: "2024-01-20T10:00:00.000Z"
    }
}
```

### `importSparkWallet(mnemonic, network = 'MAINNET')`
Imports an existing wallet from a mnemonic phrase.

**Parameters:**
- `mnemonic` (string): 12 or 24 word mnemonic phrase
- `network` (string): 'MAINNET' or 'TESTNET'

**Returns:** Same structure as `generateRealSparkWallet`

### `generateSparkFromMnemonic(mnemonic)`
Generates Spark addresses from an existing mnemonic.

**Parameters:**
- `mnemonic` (string): Existing mnemonic phrase

**Returns:** Same structure as `generateRealSparkWallet`

## Implementation Details

### SDK vs Fallback Mode
The service attempts to use the official Spark SDK first. If unavailable, it falls back to a custom bech32m implementation:

```javascript
// Module loading strategy
async function ensureModulesLoaded() {
    if (!bip39) {
        try {
            // Load official SDK
            SparkWallet = sparkSDK.SparkWallet;
            sdkAvailable = true;
        } catch (error) {
            // Use fallback
            sdkAvailable = false;
        }
    }
}
```

### Bech32m Implementation
For addresses when SDK is unavailable:
- Uses witness version 1 (Taproot-like)
- HRP (Human Readable Part): 'sp' for Spark
- Full bech32m checksum implementation
- Proper bit conversion (8-bit to 5-bit)

### Key Derivation
- **Path**: `m/84'/0'/0'/0/0` (BIP84 for SegWit)
- **Entropy**: 128 bits (12 words) or 256 bits (24 words)
- **PBKDF2**: 2048 rounds for seed generation

## Error Handling

### Common Errors
1. **SDK Not Available**
   - Falls back to bech32m implementation
   - Logs warning but continues operation

2. **Invalid Mnemonic**
   - Returns error for wrong word count
   - Validates mnemonic format

3. **Network Errors**
   - Timeout handling
   - Graceful degradation

### Error Response Format
```javascript
{
    success: false,
    error: "Error message here"
}
```

## Security Measures

### Cryptographic Security
1. **Random Generation**
   ```javascript
   const entropy = crypto.randomBytes(strength / 8);
   ```
   - Uses crypto.randomBytes() for entropy
   - Never uses Math.random()

2. **Private Key Handling**
   - Keys derived using BIP32
   - WIF encoding for Bitcoin compatibility
   - Secure memory handling

3. **Checksum Validation**
   - SHA256 checksum for mnemonics
   - Bech32m checksum for addresses

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**
   - Modules loaded on first use
   - Reduces startup time

2. **Caching**
   - SDK availability cached
   - Module references cached

3. **Async Operations**
   - All wallet operations are async
   - Non-blocking implementation

### Performance Metrics
- **Generation Time**: ~10-60 seconds (with SDK)
- **Fallback Time**: <1 second
- **Memory Usage**: ~50MB peak

## External API Connections
This service does NOT make external API calls. It operates entirely offline for security.

## Testing Approach

### Unit Tests
```javascript
// Test wallet generation
const wallet = await generateRealSparkWallet('MAINNET');
assert(wallet.success === true);
assert(wallet.data.mnemonic.split(' ').length === 12);
```

### Integration Tests
- Test with and without SDK
- Verify address formats
- Check key derivation

### Edge Cases
- Empty mnemonic handling
- Invalid network parameter
- Module loading failures

## Common Issues and Solutions

### Issue 1: SDK Loading Timeout
**Problem**: Spark SDK takes too long to initialize
**Solution**: Frontend timeout set to 60 seconds

### Issue 2: Address Format Mismatch
**Problem**: Generated addresses don't match expected format
**Solution**: Use bech32m encoding with correct witness version

### Issue 3: Memory Leaks
**Problem**: Module references not cleaned up
**Solution**: Proper module caching strategy

## Integration Patterns

### API Endpoint Integration
```javascript
// In api-server.js
app.post('/api/spark/generate-wallet', async (req, res) => {
    const { strength = 256 } = req.body;
    const result = await generateRealSparkWallet('MAINNET');
    res.json(result);
});
```

### Frontend Integration
```javascript
// Frontend expects this exact structure
const response = await fetch('/api/spark/generate-wallet');
const { data } = await response.json();
// Use data.mnemonic, data.addresses, etc.
```

## Dependencies

### Required Packages
```json
{
    "@buildonspark/spark-sdk": "optional",
    "bip39": "^3.0.4",
    "bip32": "^4.0.0",
    "tiny-secp256k1": "^2.2.3"
}
```

### Environment Variables
None required - service is self-contained

## Future Enhancements

1. **Planned Features**
   - Multi-signature support
   - Hardware wallet integration
   - Advanced derivation paths

2. **Performance Improvements**
   - WebAssembly bech32m implementation
   - Parallel key derivation
   - Optimized checksum calculation

3. **Security Enhancements**
   - HSM support
   - Secure enclave integration
   - Zero-knowledge proofs