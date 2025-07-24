# Spark Protocol Components Documentation

**Last Updated**: 2025-07-21
**MOOSH Wallet Version**: 1.0.0

## Overview

This directory contains comprehensive documentation for all Spark Protocol components integrated into MOOSH Wallet. The Spark Protocol is a Layer 2 Bitcoin scaling solution that provides instant transactions, ultra-low fees, and Lightning Network integration.

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌─────────────────┐        ┌──────────────────┐       │
│  │SparkDashboardModal│      │SparkDepositModal │       │
│  └────────┬────────┘        └────────┬─────────┘       │
│           │                           │                  │
├───────────┴───────────────────────────┴─────────────────┤
│                  Wallet Management                       │
│              ┌──────────────────────┐                   │
│              │ SparkWalletManager   │                   │
│              └──────────┬───────────┘                   │
│                         │                                │
├─────────────────────────┴────────────────────────────────┤
│                 Protocol Operations                       │
│  ┌──────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │SparkStateManager│ │SparkBitcoinManager│ │SparkLightning││
│  │                │ │                  │ │   Manager   ││
│  └──────────────┘  └─────────────────┘  └─────────────┘│
└──────────────────────────────────────────────────────────┘
```

## Component Index

### Core Protocol Components

1. **[SparkStateManager](./SparkStateManager.md)**
   - **Location**: Lines 5601-5724
   - **Purpose**: Manages Spark Protocol state tree and Layer 2 operations
   - **Key Features**:
     - Merkle tree state management
     - Exit mechanism implementation
     - Operator network communication
     - Cryptographic proof generation

2. **[SparkBitcoinManager](./SparkBitcoinManager.md)**
   - **Location**: Lines 5726-5834
   - **Purpose**: Handles Bitcoin integration for Spark Protocol
   - **Key Features**:
     - UTXO management
     - Deposit transaction creation
     - Network fee estimation
     - Coin selection algorithms

3. **[SparkLightningManager](./SparkLightningManager.md)**
   - **Location**: Lines 5836-5939
   - **Purpose**: Manages Lightning Network operations
   - **Key Features**:
     - Lightning payment processing
     - Invoice creation and decoding
     - Channel balance management
     - Route optimization

### Wallet Management

4. **[SparkWalletManager](./SparkWalletManager.md)**
   - **Location**: Lines 5941-6145
   - **Purpose**: Central wallet management for Spark Protocol
   - **Key Features**:
     - Multi-protocol wallet creation
     - Balance aggregation
     - Transaction orchestration
     - Address generation

### User Interface Components

5. **[SparkDashboardModal](./SparkDashboardModal.md)**
   - **Location**: Lines 6151-6518
   - **Purpose**: Main dashboard for Spark Protocol features
   - **Key Features**:
     - Balance visualization
     - Feature navigation
     - Wallet management UI
     - Real-time updates

6. **[SparkDepositModal](./SparkDepositModal.md)**
   - **Location**: Lines 6520-6690
   - **Purpose**: Interface for creating Spark deposits
   - **Key Features**:
     - Deposit amount input
     - Transaction creation
     - Benefits display
     - Error handling

## Integration Pattern

### Typical Usage Flow

```javascript
// 1. Initialize the wallet manager
const sparkWalletManager = new SparkWalletManager();

// 2. Create a Spark wallet
const wallet = await sparkWalletManager.createSparkWallet(
    'My Spark Wallet',
    'password123'
);

// 3. Show dashboard
const dashboard = new SparkDashboardModal(app);
dashboard.show();

// 4. User initiates deposit
const depositModal = new SparkDepositModal(app);
depositModal.show();

// 5. Process deposit transaction
const tx = await sparkBitcoinManager.createSparkDeposit(
    100000,  // satoshis
    wallet.addresses.receive
);

// 6. Update state
await sparkStateManager.updateSparkState({
    from: wallet.addresses.spark,
    newBalance: 100000,
    nonce: 1
});
```

## Key Concepts

### State Management

The Spark Protocol uses a Merkle tree-based state system where:
- Each state update creates a new leaf in the tree
- Operators sign state transitions
- Users can exit with cryptographic proofs
- 7-day challenge period for security

### Multi-Protocol Support

MOOSH Wallet's Spark integration supports:
1. **Bitcoin**: On-chain deposits and exits
2. **Spark Layer 2**: Instant off-chain transactions
3. **Lightning Network**: Payment channel integration

### Security Model

- **Non-Custodial**: Users control their private keys
- **Cryptographic Proofs**: All state transitions are provable
- **Exit Mechanism**: Users can always exit to Bitcoin
- **Operator Validation**: Multiple operators validate state

## Common Operations

### Creating a Spark Wallet

```javascript
const wallet = await sparkWalletManager.createSparkWallet();
console.log('Spark address:', wallet.addresses.spark);
```

### Making a Deposit

```javascript
const depositTx = await sparkBitcoinManager.createSparkDeposit(
    50000,  // 0.0005 BTC
    userBitcoinAddress
);
```

### Sending via Lightning

```javascript
const payment = await sparkLightningManager.sendSparkLightning(
    'lnbc1000n1p3...',  // Lightning invoice
    1000  // satoshis
);
```

### Checking Balance

```javascript
const balance = await sparkWalletManager.getSparkBalance();
console.log('Total:', balance.total, 'sats');
```

## Best Practices

1. **Always validate user input** before creating transactions
2. **Handle errors gracefully** with user-friendly messages
3. **Show transaction details** before confirmation
4. **Update UI reactively** when state changes
5. **Clean up resources** when modals close

## Testing

Each component can be tested independently:

```javascript
// Test state manager
const stateManager = new SparkStateManager();
const stateUpdate = await stateManager.updateSparkState({
    from: 'spark1qtest...',
    newBalance: 10000,
    nonce: 0
});

// Test bitcoin manager
const bitcoinManager = new SparkBitcoinManager();
const utxos = await bitcoinManager.getSparkUTXOs('bc1qtest...');

// Test lightning manager
const lightningManager = new SparkLightningManager();
const invoice = await lightningManager.createSparkInvoice(
    1000,
    'Test payment'
);
```

## Troubleshooting

### Common Issues

1. **Deposit not showing**: Check transaction confirmations
2. **Balance incorrect**: Refresh data or check network
3. **Lightning payment failed**: Verify route availability
4. **State update failed**: Check operator connectivity

### Debug Mode

Enable debug logging:
```javascript
window.SPARK_DEBUG = true;
```

## Future Development

Planned enhancements include:
- Hardware wallet support
- Multi-signature wallets
- Advanced routing algorithms
- Cross-chain atomic swaps
- Mobile app integration

## Resources

- [Spark Protocol Whitepaper](https://sparkprotocol.io/whitepaper)
- [Lightning Network Specs](https://github.com/lightning/bolts)
- [Bitcoin Developer Guide](https://bitcoin.org/en/developer-guide)

## Support

For issues or questions:
1. Check component documentation
2. Review error messages
3. Enable debug mode
4. Contact support with logs

---

*This documentation is part of MOOSH Wallet's comprehensive component documentation system.*