# walletService.js Documentation

## Service Overview
- **File**: `/src/server/services/walletService.js`
- **Purpose**: Core wallet generation and management service
- **Dependencies**: BIP39, BIP32, Bitcoin libraries

## Key Functions

### generateMnemonic(strength)
#### Purpose
Generates a BIP39 mnemonic seed phrase

#### Parameters
- `strength`: Number (128 for 12 words, 256 for 24 words)

#### Returns
```javascript
"word1 word2 word3 word4..."  // String format
```

#### Implementation Notes
- Uses crypto.randomBytes for secure entropy
- Validates against BIP39 wordlist
- Always returns string format (not array)

### generateBitcoinWallet(mnemonic, network)
#### Purpose
Derives all Bitcoin address types from mnemonic

#### Parameters
- `mnemonic`: String - The seed phrase
- `network`: String - "MAINNET" or "TESTNET"

#### Returns
```javascript
{
    mnemonic: "original mnemonic string",
    addresses: {
        segwit: {
            address: "bc1q...",
            path: "m/84'/0'/0'/0/0",
            privateKey: "..."
        },
        taproot: {
            address: "bc1p...",
            path: "m/86'/0'/0'/0/0",
            privateKey: "..."
        },
        legacy: {
            address: "1...",
            path: "m/44'/0'/0'/0/0",
            privateKey: "..."
        },
        nestedSegwit: {
            address: "3...",
            path: "m/49'/0'/0'/0/0",
            privateKey: "..."
        }
    },
    xpub: "xpub..."
}
```

#### Derivation Paths
- **Legacy (P2PKH)**: m/44'/0'/0'/0/0
- **Nested SegWit (P2SH-P2WPKH)**: m/49'/0'/0'/0/0
- **Native SegWit (P2WPKH)**: m/84'/0'/0'/0/0
- **Taproot (P2TR)**: m/86'/0'/0'/0/0

### generateSparkAddress(mnemonic)
#### Purpose
Generates Spark Protocol address from mnemonic

#### Parameters
- `mnemonic`: String - The seed phrase

#### Returns
```javascript
{
    address: "sp1q...",
    publicKey: "02...",
    privateKey: "..."
}
```

#### Implementation Notes
- Uses Spark SDK for address generation
- Follows Spark Protocol specification
- Compatible with Lightning Network

### importWallet(mnemonic, network)
#### Purpose
Imports existing wallet from seed phrase

#### Parameters
- `mnemonic`: String - The seed phrase to import
- `network`: String - Target network

#### Returns
```javascript
{
    bitcoin: {
        // Same structure as generateBitcoinWallet
    },
    spark: {
        // Same structure as generateSparkAddress
    }
}
```

#### Validation
- Validates mnemonic checksum
- Normalizes mnemonic (lowercase, trimmed)
- Checks word count (12 or 24)

### validateAddress(address, network)
#### Purpose
Validates Bitcoin/Spark address format

#### Parameters
- `address`: String - Address to validate
- `network`: String - Expected network

#### Returns
```javascript
{
    valid: true,
    type: "taproot",  // or "segwit", "legacy", etc.
    network: "mainnet"
}
```

## Critical Implementation Details

### Seed Generation Security
```javascript
// CORRECT - Use crypto.randomBytes
const entropy = crypto.randomBytes(strength / 8);
const mnemonic = bip39.entropyToMnemonic(entropy);

// WRONG - Never use Math.random()
const randomWords = []; // DON'T DO THIS
```

### Network Configuration
```javascript
const networks = {
    MAINNET: bitcoin.networks.bitcoin,
    TESTNET: bitcoin.networks.testnet
};
```

### Error Handling
All functions should handle:
- Invalid mnemonic format
- Unsupported derivation paths
- Network mismatches
- SDK initialization failures

## Common Issues & Solutions

### Issue: Slow Spark address generation
**Solution**: SDK initialization can take 10-60 seconds. Ensure frontend has appropriate timeout.

### Issue: Wrong address format
**Solution**: Always use correct network parameter and derivation path.

### Issue: Mnemonic validation fails
**Solution**: Normalize input (trim, lowercase) and check BIP39 validity.

## Testing

### Unit Test Coverage
- Mnemonic generation with different strengths
- All address type derivations
- Network switching (mainnet/testnet)
- Import validation
- Error cases

### Integration Points
- API server endpoints
- Frontend wallet creation flow
- State management updates

## Dependencies
```json
{
    "bip39": "^3.0.4",
    "@scure/bip32": "^1.1.0",
    "bitcoinjs-lib": "^6.1.0",
    "@lightsparkdev/core": "latest"
}
```

## Git Recovery Commands

### View original implementation
```bash
git show 7b831715:src/server/services/walletService.js
```

### Check modification history
```bash
git log --follow -p src/server/services/walletService.js
```

### Restore if broken
```bash
git checkout 7b831715 -- src/server/services/walletService.js
```

## Critical Warnings

1. **NEVER modify** the response structure without updating all consumers
2. **ALWAYS use** crypto.randomBytes for entropy, never Math.random()
3. **MAINTAIN** backward compatibility with existing wallets
4. **TEST** with real Bitcoin addresses on both networks
5. **PRESERVE** the 60-second timeout for Spark operations