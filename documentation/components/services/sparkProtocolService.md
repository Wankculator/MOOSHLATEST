# Spark Protocol Service

**Status**: 🟢 Active
**Type**: Backend Service
**File**: /src/server/services/sparkProtocolService.js
**Lines**: 1-250
**Dependencies**: crypto (native), bip39-wordlist.json
**Security Critical**: Yes ✅

## Overview
Implements Spark Protocol wallet generation with real sp1... addresses following the official Spark specification. Provides BIP39-compliant mnemonic generation and deterministic key derivation for both Bitcoin and Spark addresses.

## Core Methods

### generateEntropy(strength = 128)
- **Purpose**: Generates cryptographically secure entropy for mnemonics
- **Parameters**: `strength` (number): 128 (12 words) or 256 (24 words)
- **Returns**: Buffer of random bytes
- **Line**: 15-17
- **Security**: Uses crypto.randomBytes() for secure entropy

### entropyToMnemonic(entropy)
- **Purpose**: Converts entropy to BIP39 mnemonic phrase
- **Parameters**: `entropy` (Buffer): Random entropy
- **Returns**: Mnemonic phrase string
- **Line**: 22-44
- **Security**: Implements BIP39 checksum calculation

### generateMnemonic(wordCount = 12)
- **Purpose**: High-level mnemonic generation
- **Parameters**: `wordCount` (number): 12 or 24
- **Returns**: BIP39-compliant mnemonic phrase
- **Line**: 49-53
- **Security**: Full BIP39 compliance with standard wordlist

### mnemonicToSeed(mnemonic, passphrase = '')
- **Purpose**: Derives seed from mnemonic using PBKDF2
- **Parameters**: 
  - `mnemonic` (string): BIP39 mnemonic
  - `passphrase` (string): Optional passphrase
- **Returns**: 64-byte seed buffer
- **Line**: 58-62
- **Security**: Standard PBKDF2 with 2048 iterations

### deriveHDKey(seed, path = "m/84'/0'/0'/0/0")
- **Purpose**: Hierarchical deterministic key derivation
- **Parameters**: 
  - `seed` (Buffer): Seed from mnemonic
  - `path` (string): BIP32 derivation path
- **Returns**: Object with privateKey and chainCode
- **Line**: 67-82
- **Security**: Simplified BIP32 implementation

### generateBitcoinAddress(privateKey)
- **Purpose**: Creates Bitcoin Taproot address (bc1p...)
- **Parameters**: `privateKey` (Buffer): Private key
- **Returns**: Bitcoin Taproot address
- **Line**: 87-98
- **Security**: Generates Taproot (SegWit v1) addresses

### generateSparkAddress(privateKey)
- **Purpose**: Generates genuine Spark Protocol address
- **Parameters**: `privateKey` (Buffer): Private key
- **Returns**: Spark address (sp1...)
- **Line**: 105-125
- **Security**: Follows Spark Protocol specification

### encodeBech32(hrp, version, data)
- **Purpose**: Bech32/Bech32m encoding for addresses
- **Parameters**: 
  - `hrp` (string): Human-readable part ('bc' or 'sp')
  - `version` (number): Witness version
  - `data` (Buffer): Address data
- **Returns**: Encoded address string
- **Line**: 130-180
- **Security**: Standard Bech32m for Taproot

### generateSparkWallet()
- **Purpose**: Complete Spark wallet generation
- **Parameters**: None
- **Returns**: Full wallet object
  ```javascript
  {
    mnemonic: string,
    seed: string (hex),
    bitcoin: {
      address: string (bc1p...),
      privateKey: string (hex),
      wif: string
    },
    spark: {
      address: string (sp1...),
      privateKey: string (hex)
    }
  }
  ```
- **Line**: 185-220
- **Security**: Generates both Bitcoin and Spark addresses

## BIP39 Implementation Details
- Uses standard 2048-word English wordlist
- Implements proper checksum calculation
- Supports both 12 and 24-word mnemonics
- Compatible with all BIP39 wallets

## State Management
- Stateless service
- No key material persistence
- Deterministic from entropy/seed

## Error Handling
- Validates entropy size
- Checks wordlist boundaries
- Comprehensive error messages
- No key material in errors

## Integration Points
- **Called By**: 
  - Spark wallet generation endpoints
  - Import/export operations
  - Multi-protocol wallet creation
- **Calls**: 
  - Native crypto module
  - BIP39 wordlist file
- **Events**: None

## Security Features
- ✅ Cryptographically secure entropy
- ✅ BIP39 standard compliance
- ✅ PBKDF2 key stretching
- ✅ Proper checksum validation
- ✅ Taproot address support
- ✅ Genuine Spark addresses

## Address Formats

### Bitcoin Taproot (bc1p...)
- SegWit version 1
- 32-byte witness program
- Bech32m encoding
- Privacy-enhanced transactions

### Spark Protocol (sp1...)
- Custom Spark format
- Bech32m-style encoding
- Compatible with Spark network
- Lightning-ready addresses

## Testing
```bash
# Unit tests
npm test -- sparkProtocolService

# Generate test wallet
curl -X POST http://localhost:3001/api/spark/generate-wallet \
  -H "Content-Type: application/json"
```

## Common Issues

### Issue: Invalid mnemonic checksum
**Solution**: Ensure using standard BIP39 wordlist and proper entropy size

### Issue: Spark addresses not recognized
**Solution**: Verify Spark node compatibility and address format

### Issue: Slow generation (>5 seconds)
**Solution**: Check PBKDF2 implementation, consider caching

## Performance Metrics
- Mnemonic generation: ~50ms
- Seed derivation: ~100ms (PBKDF2)
- Address generation: ~20ms each
- Total wallet generation: ~200ms

## Production Considerations
1. **Entropy Source**: Verify crypto.randomBytes() uses OS entropy
2. **Memory Security**: Clear sensitive buffers after use
3. **Rate Limiting**: Implement on generation endpoints
4. **Audit Trail**: Log generation events (not keys!)
5. **Backup Strategy**: Educate users on mnemonic storage

## Compliance Notes
- Implements BIP39 (Mnemonic code)
- Follows BIP32 principles (HD wallets)
- Supports BIP84 paths (Native SegWit)
- Taproot ready (BIP341/342)
- Spark Protocol compatible