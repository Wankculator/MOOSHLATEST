# Crypto Wallet Service

**Status**: 🟢 Active
**Type**: Backend Service
**File**: /src/server/services/cryptoWalletService.js
**Lines**: 1-150
**Dependencies**: crypto (native)
**Security Critical**: Yes ⚠️

## Overview
Cryptographic wallet generation service using Node.js native crypto module. Generates deterministic wallets without external dependencies. **Note**: This implementation uses simplified cryptographic methods and should be reviewed for production use.

## Core Methods

### generateRealMnemonic(wordCount = 12)
- **Purpose**: Generates mnemonic-like phrases using crypto-secure randomness
- **Parameters**: `wordCount` (number): 12 or 24 words
- **Returns**: Object with phrase and entropy
  ```javascript
  {
    phrase: string, // Space-separated words
    entropy: string // Hex string of entropy
  }
  ```
- **Line**: 12-43
- **Security**: ⚠️ Uses crypto.randomBytes() for entropy (good), but generates custom words instead of BIP39 standard

### generateWalletFromSeed(seedHex)
- **Purpose**: Creates HD wallet master key from seed
- **Parameters**: `seedHex` (string): Hexadecimal seed
- **Returns**: Master key components
  ```javascript
  {
    privateKey: string (hex),
    chainCode: string (hex)
  }
  ```
- **Line**: 48-62
- **Security**: Uses HMAC-SHA512 with "Bitcoin seed" as per BIP32 standard

### generateBitcoinAddress(privateKeyHex)
- **Purpose**: Derives Bitcoin address from private key
- **Parameters**: `privateKeyHex` (string): Private key in hex
- **Returns**: Bitcoin address string (bc1p...)
- **Line**: 67-72
- **Security**: ⚠️ Generates simplified Taproot-like addresses, not standard compliant

### generateSparkAddress(privateKeyHex)
- **Purpose**: Creates Spark Protocol address
- **Parameters**: `privateKeyHex` (string): Private key in hex
- **Returns**: Spark address string (sp1...)
- **Line**: 77-82
- **Security**: Custom implementation for Spark addresses

### generateRealWallet()
- **Purpose**: Main entry point for complete wallet generation
- **Parameters**: None
- **Returns**: Complete wallet object
  ```javascript
  {
    success: true,
    data: {
      mnemonic: string,
      seed: string (hex),
      addresses: {
        bitcoin: string,
        spark: string
      },
      privateKeys: {
        bitcoin: { wif: string, hex: string },
        spark: { hex: string }
      }
    }
  }
  ```
- **Line**: 87-130
- **Security**: Combines all generation methods

## State Management
- Stateless service
- No key storage or persistence
- All operations are deterministic from entropy

## Error Handling
- Try-catch wrapper on main generation function
- Returns standardized error responses
- No sensitive data in error messages
- Clears sensitive variables after use

## Integration Points
- **Called By**: 
  - Alternative to standard walletService
  - Testing and development endpoints
- **Calls**: Only native crypto module
- **Events**: None

## Security Considerations

### ⚠️ CRITICAL WARNINGS:
1. **Non-standard Implementation**: This service doesn't follow BIP39/BIP32 standards strictly
2. **Address Generation**: Simplified address generation may not be compatible with real Bitcoin network
3. **Word Generation**: Custom word generation instead of standard BIP39 wordlist
4. **Production Use**: Should use established libraries (bip39, bitcoinjs-lib) for production

### Good Security Practices:
- ✅ Uses crypto.randomBytes() for entropy (not Math.random())
- ✅ Implements HMAC-SHA512 for key derivation
- ✅ No hardcoded secrets or keys
- ✅ Clears sensitive data after use

## Testing
```bash
# Unit tests
npm test -- cryptoWalletService

# Generate test wallet
node -e "const {generateRealWallet} = require('./src/server/services/cryptoWalletService.js'); generateRealWallet().then(console.log)"
```

## Common Issues

### Issue: Generated addresses not recognized by wallets
**Solution**: This service generates simplified addresses. Use standard libraries for real addresses.

### Issue: Mnemonic phrases not BIP39 compatible
**Solution**: Use proper bip39 library for standard-compliant mnemonics

### Issue: Private key format incompatibility
**Solution**: WIF generation is simplified; use bitcoinjs-lib for proper WIF encoding

## Migration Path to Production
```javascript
// Replace with standard implementation:
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';

// Proper mnemonic generation
const mnemonic = bip39.generateMnemonic(wordCount === 24 ? 256 : 128);

// Standard HD wallet derivation
const seed = await bip39.mnemonicToSeed(mnemonic);
const root = bip32.fromSeed(seed);
```

## Performance Characteristics
- Fast generation (< 100ms)
- Minimal memory usage
- No external API calls
- Synchronous crypto operations

## Development Notes
This service appears to be a simplified implementation for development/testing. For production:
1. Use established cryptographic libraries
2. Follow BIP39/BIP32/BIP44 standards strictly
3. Implement proper address encoding
4. Add comprehensive test coverage
5. Security audit before production use