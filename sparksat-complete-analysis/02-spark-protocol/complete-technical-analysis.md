# Spark Protocol Complete Technical Analysis

## Overview
This document provides a comprehensive technical breakdown of the Spark Protocol and SparkSat wallet based on complete documentation analysis.

## Core Architecture

### Protocol Foundation
- **Type**: Off-chain scaling solution built on Statechains
- **Consensus**: No blockchain, VM, or smart contracts
- **Integration**: Native Bitcoin integration without bridges
- **Trust Model**: 1/n trust assumptions or minority/n setup
- **Signing**: Shared signing protocol using FROST (Flexible Round-Optimized Schnorr Threshold signatures)

### Key Components

#### 1. Spark Operators (SOs)
- Distributed signers helping with transaction signing
- Cannot move funds without user participation
- Required for all transfer operations
- Part of multi-signature setup on Layer 1

#### 2. Statechain Implementation
- Operates as distributed ledger
- Maps transaction history in real-time tree structure
- L1 appears as chain of multi-sigs
- L2 operates as tree structure for balance tracking

#### 3. Lightning Network Compatibility
- Native Lightning Network support
- Can send/receive Lightning payments
- Embedded Spark addresses in Lightning invoices
- Automatic routing between Spark and Lightning

## Technical Specifications

### Network Support
- **Mainnet**: Production Bitcoin network
- **Testnet**: Bitcoin test network
- **Regtest**: Local development network
- **Signet**: Signet test network

### Address Types
- **L1 Deposits**: Pay to Taproot (P2TR) addresses starting with "bc1p"
- **Spark Addresses**: Custom format for Spark network transfers
- **Lightning**: Standard BOLT11 invoices with optional Spark integration

### Transaction Types
1. **Deposits**: L1 Bitcoin to Spark network
2. **Transfers**: Spark-to-Spark native transfers
3. **Lightning**: Lightning Network payments
4. **Withdrawals**: Cooperative exits to L1
5. **Token Operations**: Token minting, burning, transfers

## SDK Integration Architecture

### Installation
```bash
npm install @buildonspark/spark-sdk
# or
yarn add @buildonspark/spark-sdk
```

### Core Classes

#### SparkWallet
- Main interface for wallet operations
- Extends EventEmitter for real-time updates
- Supports both custody and self-custody models
- Thread-safe and connection-managed

#### SparkSigner
- Interface for custom signing implementations
- Supports hardware wallets and custom HSMs
- Identity key management
- Message signing capabilities

### Wallet Initialization Patterns

#### 1. New Wallet Creation
```javascript
const { wallet, mnemonic } = await SparkWallet.initialize({
  options: { network: "MAINNET" }
});
```

#### 2. Wallet Restoration
```javascript
const { wallet } = await SparkWallet.initialize({
  mnemonicOrSeed: "existing mnemonic phrase",
  accountNumber: 1,
  options: { network: "MAINNET" }
});
```

#### 3. Custom Signer Integration
```javascript
const { wallet } = await SparkWallet.initialize({
  signer: customSparkSigner,
  options: { network: "MAINNET" }
});
```

## Feature Implementation Guide

### 1. Deposit Management

#### Single-Use Addresses
- Generate unique P2TR addresses per deposit
- Automatic claiming of confirmed deposits
- Single-use for security

#### Static Deposit Addresses
- Reusable deposit addresses
- Manual claiming process with quotes
- Refund capability if needed

#### Implementation Pattern:
```javascript
// Single-use deposit
const depositAddress = await wallet.getSingleUseDepositAddress();
const txId = await monitorDeposit(depositAddress);
const claimed = await wallet.claimDeposit(txId);

// Static deposit
const staticAddress = await wallet.getStaticDepositAddress();
const quote = await wallet.getClaimStaticDepositQuote(txId);
const result = await wallet.claimStaticDeposit(quote);
```

### 2. Balance Management

#### Multi-Asset Support
- Native Bitcoin balance tracking
- Token balance mapping
- Real-time balance updates via events

#### Implementation:
```javascript
const { balance, tokenBalances } = await wallet.getBalance();
console.log(`Bitcoin: ${balance} sats`);
tokenBalances.forEach((tokenBalance, tokenKey) => {
  console.log(`Token ${tokenKey}: ${tokenBalance.balance}`);
});
```

### 3. Transfer Operations

#### Spark-to-Spark Transfers
- Instant settlement
- Near-zero fees
- Native protocol transfers

#### Lightning Network Integration
- Standard BOLT11 invoice support
- Zero-amount invoice handling
- Automatic fee estimation
- Spark address embedding in invoices

#### Implementation Patterns:
```javascript
// Spark transfer
const transfer = await wallet.transfer({
  receiverSparkAddress: "spark_address",
  amountSats: 1000
});

// Lightning payment
const payment = await wallet.payLightningInvoice({
  invoice: "lnbc...",
  maxFeeSats: 10,
  preferSpark: true
});

// Lightning invoice creation
const invoice = await wallet.createLightningInvoice({
  amountSats: 1000,
  memo: "Payment description",
  includeSparkAddress: true
});
```

### 4. Token Operations

#### Token Information Management
- Token metadata retrieval
- Balance tracking per token
- Transaction history

#### Token Transfers
- Native token transfer support
- Output selection for efficiency
- Atomic operations

#### Implementation:
```javascript
// Get token info
const tokens = await wallet.getTokenInfo();

// Transfer tokens
const transferId = await wallet.transferTokens({
  tokenPublicKey: "token_key",
  tokenAmount: BigInt(100),
  receiverSparkAddress: "recipient_address"
});

// Query token transactions
const transactions = await wallet.queryTokenTransactions(
  ["token_key_1", "token_key_2"]
);
```

### 5. Withdrawal (Cooperative Exit)

#### Exit Speed Options
- **FAST**: Higher fees, faster confirmation
- **MEDIUM**: Balanced fees and speed
- **SLOW**: Lower fees, slower confirmation

#### Fee Estimation
- Dynamic fee calculation
- Speed-based fee tiers
- User fee vs. broadcast fee breakdown

#### Implementation:
```javascript
// Get fee estimate
const feeEstimate = await wallet.getWithdrawalFeeEstimate({
  amountSats: 50000,
  withdrawalAddress: "bc1p..."
});

// Initiate withdrawal
const withdrawal = await wallet.withdraw({
  onchainAddress: "bc1p...",
  amountSats: 50000,
  exitSpeed: ExitSpeed.MEDIUM
});

// Monitor withdrawal status
const status = await wallet.getCoopExitRequest(withdrawal.id);
```

## Event-Driven Architecture

### Real-Time Updates
The SparkWallet implements EventEmitter pattern for real-time updates:

#### Key Events
1. **transfer:claimed**: Incoming transfer confirmed
2. **deposit:confirmed**: L1 deposit available
3. **stream:connected**: Connection established
4. **stream:disconnected**: Connection lost
5. **stream:reconnecting**: Attempting reconnection

#### Implementation:
```javascript
wallet.on('transfer:claimed', (transferId, newBalance) => {
  console.log(`Transfer ${transferId} claimed. Balance: ${newBalance}`);
});

wallet.on('deposit:confirmed', (depositId, newBalance) => {
  console.log(`Deposit ${depositId} confirmed. Balance: ${newBalance}`);
});

wallet.on('stream:disconnected', (reason) => {
  console.log(`Disconnected: ${reason}`);
});
```

## Security Model

### Key Management
- BIP-39 mnemonic support
- Account-based key derivation
- Identity key separation
- Hardware wallet compatibility

### Trust Assumptions
- 1/n trust with Spark Operators
- User required for all transactions
- Always-available unilateral exit
- No custodial risk

### Recovery Options
- Mnemonic-based recovery
- Unilateral exit to L1
- No dependence on external parties
- Full Bitcoin-level security

## Performance Characteristics

### Transaction Speed
- **Spark Transfers**: Instant (< 1 second)
- **Lightning Payments**: Near-instant
- **Deposits**: Bitcoin confirmation time
- **Withdrawals**: Variable by exit speed

### Fee Structure
- **Spark Transfers**: Near-zero fees
- **Lightning**: Standard Lightning fees
- **Deposits**: Bitcoin network fees
- **Withdrawals**: Variable by speed preference

### Scalability
- No blockchain consensus overhead
- No sequencer bottlenecks
- Unlimited transaction throughput
- Real-time balance updates

## Development Best Practices

### Error Handling
- Comprehensive error types
- Graceful degradation
- Automatic reconnection
- Status monitoring

### Testing Strategy
- Multiple network support
- Regtest for development
- Comprehensive test suites
- Integration testing

### Production Deployment
- Mainnet configuration
- Connection management
- Event monitoring
- Backup strategies

## Integration Patterns

### Self-Custody Wallets
- Full user control
- Local key management
- Direct SDK integration
- Real-time updates

### Custodial Services
- Server-side wallet management
- API-based integration
- Batch operations
- Multi-user support

### Hybrid Solutions
- Partial custody models
- Shared signing arrangements
- Custom signer implementations
- Enterprise integrations

## Future Roadmap Considerations

### Planned Features
- Enhanced token support
- Additional exit mechanisms
- Mobile SDK variants
- Hardware wallet improvements

### Ecosystem Growth
- Third-party integrations
- Developer tooling
- Documentation improvements
- Community contributions

This technical analysis provides the foundation for building Spark-compatible wallets and understanding the protocol's capabilities.
