# Complete Wallet Service

**Status**: 🟢 Active
**Type**: Backend Service
**File**: /src/server/services/completeWalletService.js
**Lines**: 1-200
**Dependencies**: bip39, @scure/bip32, bitcoinjs-lib, tiny-secp256k1, crypto
**Security Critical**: Yes ✅

## Overview
Professional-grade wallet generation service that creates complete Bitcoin wallets with all address types (Legacy, Nested SegWit, Native SegWit, Taproot) and Spark Protocol addresses. Implements full BIP39/BIP32/BIP44 standards compliance.

## Core Methods

### generateCompleteWallet(wordCount = 12, network = 'MAINNET')
- **Purpose**: Generates a complete new wallet with all address types
- **Parameters**: 
  - `wordCount` (number): 12 or 24 words
  - `network` (string): 'MAINNET' or 'TESTNET'
- **Returns**: Complete wallet object with all addresses and keys
  ```javascript
  {
    mnemonic: string,
    wordCount: number,
    seed: string (hex),
    network: string,
    bitcoin: {
      legacy: { address, privateKeyWIF, privateKeyHEX, publicKey, path },
      nested: { address, privateKeyWIF, privateKeyHEX, publicKey, path },
      segwit: { address, privateKeyWIF, privateKeyHEX, publicKey, path },
      taproot: { address, privateKeyWIF, privateKeyHEX, publicKey, path }
    },
    spark: {
      primary: { address, privateKeyHEX, publicKey },
      lightning: { nodeId, capacity }
    },
    createdAt: ISO string
  }
  ```
- **Line**: 21-150
- **Security**: Full BIP standard compliance with proper key derivation

### Derivation Paths Used
```javascript
{
  legacy: "m/44'/0'/0'/0/0",    // P2PKH addresses (1...)
  nested: "m/49'/0'/0'/0/0",    // P2SH-P2WPKH addresses (3...)
  segwit: "m/84'/0'/0'/0/0",    // P2WPKH addresses (bc1q...)
  taproot: "m/86'/0'/0'/0/0"    // P2TR addresses (bc1p...)
}
```

## State Management
- Stateless service - generates new wallets on each call
- No wallet data persistence
- Each call produces unique wallet

## Error Handling
- Comprehensive try-catch blocks
- Validates network parameter
- Ensures proper entropy for key generation
- Safe error messages (no key exposure)

## Integration Points
- **Called By**: 
  - Wallet creation endpoints
  - Import/export operations
  - Testing utilities
- **Calls**: 
  - bip39 for mnemonic generation
  - bitcoinjs-lib for address creation
  - Spark SDK for Spark addresses
- **Events**: None

## Security Features
- ✅ Uses cryptographically secure randomness (bip39)
- ✅ Implements proper BIP32 HD key derivation
- ✅ Supports all modern Bitcoin address types
- ✅ Separate keys for each address type
- ✅ WIF private key encoding for compatibility
- ✅ Network validation (mainnet/testnet)

## Address Generation Details

### Legacy (P2PKH)
- **Path**: m/44'/0'/0'/0/0
- **Format**: 1... (mainnet), m/n... (testnet)
- **Usage**: Oldest format, wide compatibility

### Nested SegWit (P2SH-P2WPKH)
- **Path**: m/49'/0'/0'/0/0
- **Format**: 3... (mainnet), 2... (testnet)
- **Usage**: SegWit with legacy compatibility

### Native SegWit (P2WPKH)
- **Path**: m/84'/0'/0'/0/0
- **Format**: bc1q... (mainnet), tb1q... (testnet)
- **Usage**: Lower fees, modern standard

### Taproot (P2TR)
- **Path**: m/86'/0'/0'/0/0
- **Format**: bc1p... (mainnet), tb1p... (testnet)
- **Usage**: Privacy improvements, latest standard

## Testing
```bash
# Unit tests
npm test -- completeWalletService

# Generate test wallet
curl -X POST http://localhost:3001/api/wallet/generate-complete \
  -H "Content-Type: application/json" \
  -d '{"wordCount": 12, "network": "TESTNET"}'
```

## Common Issues

### Issue: Taproot addresses not recognized
**Solution**: Ensure wallet/service supports Taproot (Bitcoin Core 0.21.0+)

### Issue: Wrong network addresses
**Solution**: Explicitly pass network parameter, defaults to MAINNET

### Issue: Mnemonic validation fails
**Solution**: Ensure using standard BIP39 English wordlist

## Performance Optimization
- Generates all addresses in single pass
- Efficient key derivation using @scure/bip32
- Minimal memory allocation
- Average generation time: ~200ms

## Best Practices
1. **Never log or store private keys**
2. **Always validate network parameter**
3. **Use secure communication (HTTPS) for API**
4. **Implement rate limiting on generation endpoint**
5. **Consider hardware security module (HSM) for production**

## Example Usage
```javascript
import { generateCompleteWallet } from './completeWalletService.js';

// Generate a new wallet
const wallet = await generateCompleteWallet(12, 'MAINNET');

// Access different address types
console.log('Legacy:', wallet.bitcoin.legacy.address);
console.log('SegWit:', wallet.bitcoin.segwit.address);
console.log('Taproot:', wallet.bitcoin.taproot.address);
console.log('Spark:', wallet.spark.primary.address);
```

## Compliance Notes
- Implements BIP39 (Mnemonic code for generating deterministic keys)
- Implements BIP32 (Hierarchical Deterministic wallets)
- Implements BIP44 (Multi-Account Hierarchy)
- Implements BIP49 (Nested SegWit)
- Implements BIP84 (Native SegWit)
- Implements BIP86 (Taproot)