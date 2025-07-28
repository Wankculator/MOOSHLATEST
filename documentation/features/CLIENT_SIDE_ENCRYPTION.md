# Client-Side Encryption for State Persistence

## Overview

MOOSH Wallet now includes a comprehensive client-side encryption system for securely persisting wallet state. This ensures that sensitive data like account information, transaction history, and wallet metadata are encrypted before being stored in the browser's localStorage.

## Architecture

### Components

1. **EncryptedStorage** (`/public/js/modules/core/encrypted-storage.js`)
   - Provides low-level encryption/decryption functionality
   - Uses Web Crypto API for cryptographic operations
   - Implements AES-GCM encryption with PBKDF2 key derivation

2. **SecureStatePersistence** (`/public/js/modules/core/secure-state-persistence.js`)
   - High-level integration with StateManager
   - Manages data segregation by security level
   - Handles auto-save and session management

3. **StateManager Integration**
   - Extended with secure persistence methods
   - Manages wallet lock/unlock functionality
   - Coordinates encrypted backup/restore operations

## Security Features

### Encryption Parameters
- **Algorithm**: AES-GCM (256-bit)
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **Salt Length**: 16 bytes
- **IV Length**: 12 bytes
- **Tag Length**: 128 bits

### Data Segregation

Data is categorized into three security levels:

1. **Blacklisted Keys** (Never Persisted)
   - privateKeys
   - seedPhrase
   - mnemonic
   - password
   - sessionKey
   - tempData

2. **Encrypted Keys** (Stored Encrypted)
   - accounts
   - transactions
   - contacts
   - settings
   - labels
   - notes

3. **Public Keys** (Stored in Plain Text)
   - currentPage
   - theme
   - language
   - currency
   - lastSync
   - version

## Usage

### Initialization

```javascript
// Initialize secure persistence when user sets password
const password = 'user-master-password';
const initialized = await app.state.initializeSecurePersistence(password);
```

### Locking/Unlocking

```javascript
// Lock wallet (clears sensitive data from memory)
app.state.lockWallet();

// Unlock wallet with password
const unlocked = await app.state.unlockWallet(password);
```

### Password Management

```javascript
// Change master password
const changed = await app.state.changeMasterPassword(oldPassword, newPassword);
```

### Backup/Restore

```javascript
// Create encrypted backup
const backup = app.state.createSecureBackup();

// Restore from backup
const restored = await app.state.restoreSecureBackup(backup, password);
```

## Implementation Details

### Auto-Save Mechanism
- Automatically saves state changes after 30 seconds of activity
- Minimum 10 seconds between saves to prevent excessive writes
- Saves are triggered by changes to critical state keys

### Session Management
- Session keys are derived from the master password
- Sessions timeout after 15 minutes of inactivity
- Session keys are never persisted to storage

### Browser Compatibility
- Requires Web Crypto API support
- Falls back to unencrypted storage if Web Crypto is unavailable
- Tested on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Security Considerations

1. **Password Strength**
   - Enforce minimum password requirements
   - Consider implementing password strength meter
   - Recommend using password managers

2. **Key Management**
   - Keys are derived from user passwords
   - No key escrow or recovery mechanism
   - Lost passwords mean lost data

3. **Browser Security**
   - Encryption happens in the browser
   - Vulnerable to XSS attacks
   - Use Content Security Policy (CSP)

4. **Storage Limits**
   - localStorage has ~5-10MB limit
   - Large wallets may hit storage limits
   - Consider implementing data pruning

## Migration from Unencrypted Storage

The system automatically migrates existing unencrypted data:

1. Detects legacy localStorage entries
2. Prompts user to set master password
3. Encrypts existing data with new password
4. Removes unencrypted entries

## Testing

Unit tests are provided in `/tests/unit/encryptedStorage.test.js`:
- Encryption/decryption functionality
- Key derivation
- Storage operations
- Password management
- Backup/restore

## Future Enhancements

1. **Hardware Security Module Integration**
   - Support for hardware wallets
   - WebAuthn integration

2. **Cloud Backup**
   - Encrypted cloud sync
   - Multi-device support

3. **Advanced Cryptography**
   - Support for post-quantum algorithms
   - Threshold encryption for multi-sig

## References

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) - Password-Based Key Derivation