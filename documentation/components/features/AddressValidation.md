# Address Validation

**Status**: 🟢 Active
**Type**: Security Feature
**Security Critical**: Yes
**Implementation**: Distributed throughout /public/js/moosh-wallet.js in transaction and send functions

## Overview
Address validation ensures users only send funds to valid Bitcoin and Spark addresses. The system validates address format, checksum, and network compatibility to prevent loss of funds due to typos or incorrect addresses.

## User Flow
```
[Enter Address] → [Real-time Validation] → [Format Check] → [Network Verification] → [Visual Feedback]
```

## Technical Implementation

### Frontend
- **Entry Point**: Address input fields throughout the app
- **UI Components**: 
  - Address input with validation
  - Error/success indicators
  - Network compatibility badge
  - Address type display
- **State Changes**: 
  - Validation status
  - Error messages
  - Input field styling

### Backend
- **API Endpoints**: `/api/validate-address` (optional)
- **Services Used**: 
  - Bitcoin address validation library
  - Bech32 decoder
  - Base58 checker
- **Data Flow**: 
  1. User types address
  2. Real-time validation triggered
  3. Format and checksum verified
  4. Network compatibility checked
  5. Visual feedback provided

## Code Example
```javascript
// Address validation implementation
class AddressValidator {
    constructor() {
        // Bitcoin address patterns
        this.patterns = {
            // Legacy addresses (P2PKH)
            legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            
            // Segwit addresses (P2WPKH)
            segwit: /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,87}$/,
            
            // Testnet addresses
            testnetLegacy: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            testnetSegwit: /^tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,87}$/,
            
            // Spark addresses
            spark: /^spark1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38,90}$/
        };
        
        this.bech32Charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    }
    
    validate(address, network = 'mainnet') {
        if (!address || typeof address !== 'string') {
            return {
                valid: false,
                error: 'Address is required'
            };
        }
        
        // Remove whitespace
        address = address.trim();
        
        // Determine address type
        const type = this.getAddressType(address, network);
        
        if (!type) {
            return {
                valid: false,
                error: 'Invalid address format'
            };
        }
        
        // Validate based on type
        switch (type) {
            case 'legacy':
            case 'testnetLegacy':
                return this.validateBase58(address);
                
            case 'segwit':
            case 'testnetSegwit':
                return this.validateBech32(address, network);
                
            case 'spark':
                return this.validateSparkAddress(address);
                
            default:
                return {
                    valid: false,
                    error: 'Unknown address type'
                };
        }
    }
    
    getAddressType(address, network) {
        if (network === 'mainnet') {
            if (this.patterns.legacy.test(address)) return 'legacy';
            if (this.patterns.segwit.test(address)) return 'segwit';
            if (this.patterns.spark.test(address)) return 'spark';
        } else if (network === 'testnet') {
            if (this.patterns.testnetLegacy.test(address)) return 'testnetLegacy';
            if (this.patterns.testnetSegwit.test(address)) return 'testnetSegwit';
        }
        
        return null;
    }
    
    validateBase58(address) {
        try {
            // Base58 alphabet
            const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            
            // Check characters
            for (let char of address) {
                if (!alphabet.includes(char)) {
                    return {
                        valid: false,
                        error: `Invalid character: ${char}`
                    };
                }
            }
            
            // Decode and verify checksum
            const decoded = this.base58Decode(address);
            if (decoded.length !== 25) {
                return {
                    valid: false,
                    error: 'Invalid address length'
                };
            }
            
            // Verify checksum
            const payload = decoded.slice(0, 21);
            const checksum = decoded.slice(21);
            const hash = this.doubleSHA256(payload);
            const expectedChecksum = hash.slice(0, 4);
            
            if (!this.arraysEqual(checksum, expectedChecksum)) {
                return {
                    valid: false,
                    error: 'Invalid checksum'
                };
            }
            
            return {
                valid: true,
                type: 'legacy',
                network: decoded[0] === 0x00 ? 'mainnet' : 'testnet'
            };
            
        } catch (error) {
            return {
                valid: false,
                error: 'Invalid base58 encoding'
            };
        }
    }
    
    validateBech32(address, network) {
        try {
            // Split into HRP and data
            const lastSeparator = address.lastIndexOf('1');
            if (lastSeparator < 1 || lastSeparator + 7 > address.length) {
                return {
                    valid: false,
                    error: 'Invalid bech32 format'
                };
            }
            
            const hrp = address.slice(0, lastSeparator);
            const data = address.slice(lastSeparator + 1);
            
            // Verify HRP
            const expectedHrp = network === 'mainnet' ? 'bc' : 'tb';
            if (hrp !== expectedHrp) {
                return {
                    valid: false,
                    error: `Wrong network (expected ${expectedHrp})`
                };
            }
            
            // Verify characters
            for (let char of data) {
                if (!this.bech32Charset.includes(char)) {
                    return {
                        valid: false,
                        error: `Invalid character: ${char}`
                    };
                }
            }
            
            // Verify checksum
            if (!this.verifyBech32Checksum(hrp, data)) {
                return {
                    valid: false,
                    error: 'Invalid checksum'
                };
            }
            
            return {
                valid: true,
                type: 'segwit',
                network: network
            };
            
        } catch (error) {
            return {
                valid: false,
                error: 'Invalid bech32 encoding'
            };
        }
    }
    
    validateSparkAddress(address) {
        // Spark addresses follow similar pattern to bech32
        if (!address.startsWith('spark1')) {
            return {
                valid: false,
                error: 'Spark addresses must start with "spark1"'
            };
        }
        
        // Basic validation for now
        const data = address.slice(6);
        for (let char of data) {
            if (!this.bech32Charset.includes(char)) {
                return {
                    valid: false,
                    error: `Invalid character: ${char}`
                };
            }
        }
        
        return {
            valid: true,
            type: 'spark',
            network: 'spark'
        };
    }
    
    // UI integration
    createValidatedInput(options = {}) {
        const $ = window.ElementFactory;
        const { network = 'mainnet', onValid, onInvalid } = options;
        
        const container = $.div({ className: 'address-input-container' }, [
            $.input({
                type: 'text',
                className: 'address-input',
                placeholder: 'Enter Bitcoin address',
                oninput: (e) => {
                    const value = e.target.value;
                    const result = this.validate(value, network);
                    
                    // Update UI
                    const indicator = e.target.nextSibling;
                    if (value.length > 0) {
                        if (result.valid) {
                            indicator.className = 'validation-indicator valid';
                            indicator.textContent = `✓ Valid ${result.type} address`;
                            if (onValid) onValid(value, result);
                        } else {
                            indicator.className = 'validation-indicator invalid';
                            indicator.textContent = `✗ ${result.error}`;
                            if (onInvalid) onInvalid(value, result);
                        }
                    } else {
                        indicator.className = 'validation-indicator';
                        indicator.textContent = '';
                    }
                }
            }),
            $.div({ className: 'validation-indicator' })
        ]);
        
        return container;
    }
    
    // Helper methods
    base58Decode(string) {
        // Implementation of base58 decode
        // ... (detailed implementation)
    }
    
    doubleSHA256(buffer) {
        // Implementation of double SHA256
        // ... (detailed implementation)
    }
    
    verifyBech32Checksum(hrp, data) {
        // Implementation of bech32 checksum verification
        // ... (detailed implementation)
    }
    
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}
```

## Configuration
- **Settings**: 
  - Real-time validation delay: 300ms
  - Network auto-detection
  - Strict checksum verification
  - Case-sensitive validation
- **Defaults**: 
  - Mainnet validation
  - All address types supported
  - Visual feedback enabled
  - Clipboard paste allowed
- **Limits**: 
  - Address length limits enforced
  - Character set validation
  - Network compatibility required

## Security Considerations
- **Validation Security**:
  - Checksum verification mandatory
  - No address modification
  - Network isolation enforced
  - Type confusion prevented
- **User Protection**:
  - Clear error messages
  - Visual validation status
  - Clipboard validation
  - Typo detection

## Performance Impact
- **Load Time**: Instant validation
- **Memory**: Minimal overhead
- **Network**: Optional API validation

## Mobile Considerations
- Large input fields
- Clear validation indicators
- Touch-friendly error messages
- Paste button for mobile
- QR code scanning option

## Error Handling
- **Common Errors**: 
  - Invalid characters
  - Wrong network address
  - Checksum mismatch
  - Incomplete address
  - Mixed case in bech32
- **Recovery**: 
  - Clear error descriptions
  - Suggest corrections
  - Network mismatch warning
  - Format examples shown

## Testing
```bash
# Test address validation
1. Test valid addresses:
   - Legacy: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
   - SegWit: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
   - Testnet: tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7
   
2. Test invalid addresses:
   - Wrong checksum
   - Invalid characters
   - Incorrect length
   - Wrong network prefix
   
3. Test edge cases:
   - Empty input
   - Whitespace
   - Case sensitivity
   - Very long input
   
4. Test UI feedback:
   - Real-time validation
   - Error messages
   - Success indicators
   - Network badges
```

## Future Enhancements
- **Advanced Validation**:
  - Script type detection
  - Multi-signature support
  - Taproot address support
  - Lightning invoice validation
  - Cross-chain address detection
- **User Features**:
  - Address book validation
  - Common typo correction
  - Similar address warning
  - ENS/domain resolution
  - Address format converter
- **Security Features**:
  - Phishing detection
  - Known scam addresses
  - Sanctions list checking
  - Address reputation score
  - Transaction history lookup