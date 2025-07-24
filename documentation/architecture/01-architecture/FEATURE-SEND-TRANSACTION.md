# 🔧 Feature Architecture: Send Transaction

## Overview
The Send Transaction feature allows users to send Bitcoin from their wallet to any valid Bitcoin address. This is a critical feature that requires multiple layers of security and validation.

## Current Architecture

### Components Involved
1. **DashboardPage** - Contains the Send button and modal trigger
2. **SendTransactionModal** - UI for transaction input
3. **PasswordModal** - Security layer for transaction confirmation
4. **APIService** - Handles API communication
5. **StateManager** - Manages wallet state and password verification
6. **Backend API** - Creates and broadcasts transactions

### Data Flow
```
User Clicks Send → SendModal Opens → User Enters Details → Password Verification → 
API Call → Transaction Creation → Blockchain Broadcast → UI Update
```

## Implementation Details

### Frontend Components

#### SendTransactionModal (Lines 8200-8300)
- Handles transaction form UI
- Validates Bitcoin addresses
- Converts BTC to satoshis
- Shows fee selection

#### PasswordModal (Lines 21364-21736)
- Verifies user password before sending
- Implements 3-attempt limit
- 15-minute timeout for security

### API Integration

#### sendTransaction Method (Lines 2605-2626)
```javascript
async sendTransaction(txData) {
    // POST to /api/transaction/send
    // Includes: from, to, amount, feeRate, privateKey
}
```

### Backend Requirements
- UTXO fetching from blockchain
- Transaction building with bitcoinjs-lib
- Fee calculation
- Transaction broadcasting

## Security Considerations

### Current Implementation
- Password verification required
- Session-based password storage
- Amount validation (dust limit)
- Address format validation

### Vulnerabilities
⚠️ **Private keys sent to server** - This is extremely insecure for production

### Production Requirements
1. Client-side transaction signing
2. Hardware wallet integration
3. Multi-signature support
4. Rate limiting

## Testing Requirements

### Unit Tests
- Address validation
- Amount conversion
- Fee calculation
- Error handling

### Integration Tests
- Full transaction flow
- API communication
- Blockchain verification

### Security Tests
- Password brute force protection
- Session timeout verification
- XSS prevention

## Improvements Needed

### High Priority
1. **Client-side signing** - Never send private keys
2. **Transaction preview** - Show fees before confirming
3. **Address book** - Save frequent recipients
4. **RBF support** - Replace-by-fee for stuck transactions

### Medium Priority
1. Batch transactions
2. Custom fee input
3. Transaction templates
4. QR code scanning

### Low Priority
1. Transaction scheduling
2. Recurring payments
3. Payment requests

## Error Handling

### Current Errors
- Invalid address format
- Insufficient balance
- Network errors
- API failures

### Needed Improvements
- Better error messages
- Recovery mechanisms
- Transaction status tracking
- Retry logic

## Performance Considerations

### Current Performance
- Single transaction at a time
- Synchronous UTXO fetching
- No caching

### Optimizations
1. UTXO caching
2. Parallel API calls
3. Transaction queue
4. Background broadcasting

## Dependencies

### NPM Packages
- bitcoinjs-lib
- ecpair
- tiny-secp256k1

### External APIs
- Mempool.space
- Blockstream.info
- Internal API server

## Monitoring & Logs

### Current Logging
- Console errors only
- No transaction history

### Needed Monitoring
1. Transaction success rate
2. Average confirmation time
3. Fee optimization metrics
4. Error tracking

## Future Enhancements

### Lightning Integration
- Open channels
- Lightning payments
- Submarine swaps

### Advanced Features
- CoinJoin support
- PayJoin implementation
- Atomic swaps
- Cross-chain swaps