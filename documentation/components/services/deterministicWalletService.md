# Deterministic Wallet Service

**Status**: 🟢 Active
**Type**: Backend Service
**File**: /src/server/services/deterministicWalletService.js
**Lines**: 1-150
**Dependencies**: crypto, bip39, bip32, tiny-secp256k1
**Security Critical**: Yes ✅

## Overview
Implements deterministic wallet generation following BIP32/BIP39 standards. Provides hierarchical deterministic (HD) wallet functionality with proper key derivation for both Bitcoin and Spark Protocol addresses.

## Core Methods

### generateFromMnemonic(mnemonic)
- **Purpose**: Creates complete wallet from existing mnemonic phrase
- **Parameters**: `mnemonic` (string): BIP39 mnemonic phrase
- **Returns**: Wallet object with addresses and keys
  ```javascript
  {
    mnemonic: string,
    addresses: {
      spark: string,
      bitcoin: string
    },
    privateKeys: {
      wif: string,
      hex: string
    },
    publicKeys: {
      spark: string (hex),
      bitcoin: string (hex)
    },
    derivationPaths: {
      spark: string,
      bitcoin: string
    }
  }
  ```
- **Line**: 15-75
- **Security**: Uses proper BIP32 derivation with hardened paths

### createSparkAddress(hash)
- **Purpose**: Generates Spark Protocol address from hash
- **Parameters**: `hash` (Buffer): SHA256 hash
- **Returns**: Spark address string (sp1...)
- **Line**: 80-95
- **Security**: ⚠️ Simplified implementation - production should use proper bech32m encoding

### generateWallet(network = 'MAINNET', strength = 128)
- **Purpose**: Creates new wallet with fresh mnemonic
- **Parameters**: 
  - `network` (string): 'MAINNET' or 'TESTNET'
  - `strength` (number): 128 (12 words) or 256 (24 words)
- **Returns**: Complete wallet object
- **Line**: 100-140
- **Security**: Generates cryptographically secure mnemonic

## Derivation Paths
```javascript
// Bitcoin - BIP84 Native SegWit
"m/84'/0'/0'/0/0"

// Spark - Ethereum-style (mock implementation)
"m/44'/60'/0'/0/0"
```

## State Management
- Class-based service with static methods
- No instance state maintained
- All operations are deterministic from seed

## Error Handling
- Validates mnemonic format before processing
- Comprehensive error logging
- Throws errors for upstream handling
- No sensitive data in error messages

## Integration Points
- **Called By**: 
  - Wallet import/export operations
  - HD wallet derivation endpoints
  - Multi-account generation
- **Calls**: 
  - bip39 for mnemonic operations
  - bip32 for key derivation
  - tiny-secp256k1 for elliptic curve operations
- **Events**: None

## Security Considerations

### Strengths:
- ✅ Uses BIP32Factory for proper HD derivation
- ✅ Implements hardened derivation paths
- ✅ Generates WIF format for Bitcoin compatibility
- ✅ No key material logged
- ✅ Deterministic address generation

### Limitations:
- ⚠️ Simplified Spark address generation (not production-ready)
- ⚠️ Mock Bitcoin address encoding (needs proper implementation)
- ⚠️ Limited to single address per derivation

## Testing
```bash
# Unit tests
npm test -- deterministicWalletService

# Test mnemonic import
const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const wallet = await DeterministicWalletService.generateFromMnemonic(mnemonic);
```

## Common Issues

### Issue: Invalid mnemonic error
**Solution**: Ensure mnemonic is valid BIP39 phrase with correct checksum

### Issue: Wrong network addresses
**Solution**: Pass network parameter explicitly for testnet

### Issue: Spark addresses not recognized
**Solution**: Current implementation is simplified; integrate real Spark SDK for production

## Performance Characteristics
- Key derivation: ~50ms per address
- Mnemonic validation: ~10ms
- Total wallet generation: ~150ms
- Memory efficient (no key storage)

## Migration to Production

For production use, replace simplified implementations:

```javascript
// Proper Bitcoin address generation
import * as bitcoin from 'bitcoinjs-lib';

const payment = bitcoin.payments.p2wpkh({
  pubkey: bitcoinChild.publicKey,
  network: bitcoin.networks.bitcoin
});
const bitcoinAddress = payment.address;

// Proper Spark address generation
import { SparkSDK } from '@spark-protocol/sdk';

const sparkAddress = await SparkSDK.generateAddress(sparkChild);
```

## Best Practices
1. **Validate all mnemonics** before processing
2. **Use proper address encoding** libraries
3. **Implement comprehensive tests** for all derivation paths
4. **Clear sensitive data** from memory after use
5. **Rate limit** wallet generation endpoints

## Future Enhancements
- Support for multiple addresses per wallet
- BIP44 account structure implementation
- Hardware wallet integration
- Shamir's Secret Sharing for mnemonic backup
- Support for custom derivation paths