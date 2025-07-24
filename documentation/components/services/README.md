# MOOSH Wallet Services Documentation

This directory contains comprehensive documentation for all backend services in the MOOSH Wallet application.

## Service Categories

### 🔐 Core Wallet Services
- **[walletService.md](./walletService.md)** - Primary wallet operations (BIP39, HD wallets) ✅
- **[completeWalletService.md](./completeWalletService.md)** - Full wallet generation with all address types
- **[deterministicWalletService.md](./deterministicWalletService.md)** - HD wallet derivation using BIP32
- **[secureWalletService.md](./secureWalletService.md)** - Security-focused wallet operations ⚠️
- **[cryptoWalletService.md](./cryptoWalletService.md)** - Simplified crypto operations ⚠️

### ⚡ Spark Protocol Services
- **[sparkSDKService.md](./sparkSDKService.md)** - Spark Protocol SDK integration ✅
- **[sparkCompatibleService.md](./sparkCompatibleService.md)** - UI compatibility layer ✅
- **[sparkProtocolService.md](./sparkProtocolService.md)** - Spark Protocol implementation
- **[sparkAddressService.md](./sparkAddressService.md)** - Spark address generation with test vectors

### 🔗 Blockchain Services
- **[blockchainService.md](./blockchainService.md)** - Blockchain interaction and API calls
- **[balanceService.md](./balanceService.md)** - Balance fetching and management
- **[networkService.md](./networkService.md)** - Network status and fee estimation ✅

## Service Status Legend
- ✅ **Production Ready** - Fully tested and deployed
- 🟢 **Active** - In use but may need improvements
- ⚠️ **Development Only** - Not for production use
- 🔄 **Deprecated** - Being phased out

## Critical Services

### For Seed Generation (DO NOT MODIFY)
1. **sparkCompatibleService** - Lines 1896-1922, 3224-3261
2. **sparkSDKService** - Spark Protocol integration
3. **walletService** - Core BIP39 implementation

### For Production Use
1. **walletService** - Standard BIP39/BIP32 compliant
2. **completeWalletService** - All Bitcoin address types
3. **sparkSDKService** - Official Spark integration
4. **blockchainService** - Real blockchain data

### Development/Testing Only
1. **cryptoWalletService** - Simplified implementation
2. **secureWalletService** - Custom word list (non-BIP39)
3. **Mock services** - For testing

## Security Critical Services

These services handle sensitive cryptographic operations:

1. **walletService** - Private key generation
2. **completeWalletService** - Multi-address key derivation
3. **deterministicWalletService** - HD wallet operations
4. **sparkSDKService** - Spark Protocol keys

⚠️ **Never log or expose private keys from these services!**

## Integration Patterns

### Standard Response Format
```javascript
{
  success: boolean,
  data: object | null,
  error: string | null,
  timestamp?: ISO string
}
```

### Error Handling
```javascript
try {
  // Service operation
  return { success: true, data: result };
} catch (error) {
  console.error('Service error:', error);
  return { success: false, error: error.message };
}
```

### ES Module Usage
```javascript
import { serviceFunction } from './services/serviceName.js';
export { myFunction };
```

## Testing Services

Each service can be tested individually:

```bash
# Unit tests
npm test -- [serviceName]

# Integration test example
curl -X POST http://localhost:3001/api/[endpoint] \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

## Common Issues & Solutions

### Issue: Service timeout
- Check external API availability
- Implement caching for frequent requests
- Add timeout configuration

### Issue: Memory leaks
- Clear sensitive data after use
- Implement proper error boundaries
- Use weak references for large objects

### Issue: Wrong network addresses
- Always specify network parameter
- Validate address format
- Check derivation paths

## Future Enhancements

### Planned Services
- Lightning Network integration
- Ordinals/Inscriptions support
- Multi-signature wallet service
- Hardware wallet integration

### Performance Improvements
- Redis caching layer
- Connection pooling
- WebSocket real-time updates
- Service worker optimization

## Contributing

When adding new services:

1. Follow the existing documentation template
2. Include security considerations
3. Add comprehensive error handling
4. Document all public methods
5. Provide testing examples
6. Update this README

## Related Documentation
- [SERVICE_ARCHITECTURE.md](./SERVICE_ARCHITECTURE.md) - Overall architecture
- [API Documentation](../api/api-endpoints.md) - REST endpoints
- [Security Patterns](../../development/SECURITY_PATTERNS.md) - Security best practices