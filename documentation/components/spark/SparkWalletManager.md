# SparkWalletManager

**Last Updated**: 2025-07-21
**Location**: `/public/js/moosh-wallet.js` - Lines 5941-6145
**Type**: Wallet Management Component

## Overview

The `SparkWalletManager` is the central wallet management component for Spark Protocol wallets in MOOSH. It handles wallet creation, balance management, transaction creation, and coordinates between the various Spark Protocol components.

## Class Definition

```javascript
class SparkWalletManager {
    constructor()
    async createSparkWallet(name, password)
    async getSparkBalance(walletId)
    async createSparkTransaction(fromWallet, toAddress, amount, type)
    async createSparkStateTransaction(wallet, toAddress, amount)
    generateWalletId()
    generateBitcoinAddress()
    generateSparkAddress()
    entropyToMnemonic(entropy)
    async encryptMnemonic(mnemonic, password)
    async getBitcoinBalance(address)
}
```

## Properties

### Core Properties

- **wallets** (`Map`): Collection of managed wallets
- **activeWallet** (`Object`): Currently active wallet
- **sparkProtocol** (`SparkStateManager`): State management instance
- **bitcoinManager** (`SparkBitcoinManager`): Bitcoin operations instance
- **lightningManager** (`SparkLightningManager`): Lightning operations instance
- **sparkDerivationPath** (`string`): HD wallet derivation path ("m/84'/0'/0'")

## Methods

### createSparkWallet(name, password)

Creates a new Spark Protocol wallet with integrated Bitcoin and Lightning support.

**Parameters:**
- `name` (string): Wallet name (default: 'Spark Wallet')
- `password` (string, optional): Encryption password

**Returns:**
- `Promise<Object>`: Created wallet object
  - `id`: Unique wallet identifier
  - `name`: Wallet name
  - `type`: Wallet type ('spark')
  - `addresses`: Address collection
  - `balance`: Balance information
  - `sparkState`: Spark Protocol state
  - `transactions`: Transaction history
  - `created`: Creation timestamp
  - `mnemonic`: Encrypted or plain mnemonic

**Example:**
```javascript
const wallet = await sparkWalletManager.createSparkWallet(
    'My Spark Wallet',
    'strongpassword123'
);
console.log(`Wallet created: ${wallet.id}`);
console.log(`Bitcoin address: ${wallet.addresses.receive}`);
console.log(`Spark address: ${wallet.addresses.spark}`);
```

### getSparkBalance(walletId)

Retrieves comprehensive balance information across all protocols.

**Parameters:**
- `walletId` (string, optional): Wallet ID (uses active wallet if not provided)

**Returns:**
- `Promise<Object>`: Balance information
  - `bitcoin`: Bitcoin mainnet balance
  - `spark`: Spark Protocol balance
  - `lightning`: Lightning Network balance
  - `total`: Combined total balance

**Example:**
```javascript
const balance = await sparkWalletManager.getSparkBalance();
console.log(`Bitcoin: ${balance.bitcoin} sats`);
console.log(`Spark L2: ${balance.spark} sats`);
console.log(`Lightning: ${balance.lightning} sats`);
console.log(`Total: ${balance.total} sats`);
```

### createSparkTransaction(fromWallet, toAddress, amount, type)

Creates transactions across different protocol types.

**Parameters:**
- `fromWallet` (string): Source wallet ID
- `toAddress` (string): Destination address
- `amount` (number): Amount in satoshis
- `type` (string): Transaction type ('bitcoin', 'spark', 'lightning')

**Returns:**
- `Promise<Object>`: Transaction object with type-specific details

**Example:**
```javascript
// Bitcoin transaction
const btcTx = await sparkWalletManager.createSparkTransaction(
    wallet.id,
    'bc1qrecipient...',
    50000,
    'bitcoin'
);

// Spark Protocol transaction
const sparkTx = await sparkWalletManager.createSparkTransaction(
    wallet.id,
    'spark1qrecipient...',
    10000,
    'spark'
);

// Lightning payment
const lnTx = await sparkWalletManager.createSparkTransaction(
    wallet.id,
    'lnbc1000n1p3...',
    1000,
    'lightning'
);
```

### createSparkStateTransaction(wallet, toAddress, amount)

Creates a Spark Protocol state transition transaction.

**Parameters:**
- `wallet` (Object): Source wallet object
- `toAddress` (string): Recipient Spark address
- `amount` (number): Amount in satoshis

**Returns:**
- `Promise<Object>`: State transaction details
  - `txid`: Transaction identifier
  - `proof`: Merkle proof
  - `sparkConfirmed`: Confirmation status

## Wallet Structure

### Complete Wallet Object

```javascript
{
    id: 'wallet_1642536000000_abc123def',
    name: 'My Spark Wallet',
    type: 'spark',
    addresses: {
        receive: 'bc1q...',      // Bitcoin receive address
        change: 'bc1q...',       // Bitcoin change address
        spark: 'spark1q...'      // Spark Protocol address
    },
    balance: {
        bitcoin: 100000,         // Satoshis on Bitcoin
        spark: 50000,           // Satoshis on Spark L2
        lightning: 10000,       // Satoshis in Lightning
        total: 160000          // Total across all
    },
    sparkState: {
        stateRoot: '0x...',     // Current state root
        lastUpdate: 1642536000000,
        operatorSigs: [],       // Operator signatures
        nonce: 0               // Transaction nonce
    },
    transactions: [],          // Transaction history
    created: 1642536000000,    // Creation timestamp
    mnemonic: 'encrypted...'   // Encrypted seed phrase
}
```

## Integration Examples

### Complete Wallet Setup

```javascript
// Initialize wallet manager
const walletManager = new SparkWalletManager();

// Create new wallet with full setup
async function setupSparkWallet() {
    try {
        // 1. Create wallet
        const wallet = await walletManager.createSparkWallet(
            'Production Wallet',
            'securePassword123'
        );
        
        console.log('Wallet created:', wallet.id);
        
        // 2. Check initial balance
        const balance = await walletManager.getSparkBalance(wallet.id);
        console.log('Initial balance:', balance);
        
        // 3. Register with Spark Protocol
        console.log('Spark state registered:', wallet.sparkState);
        
        // 4. Save wallet reference
        localStorage.setItem('activeWalletId', wallet.id);
        
        return wallet;
    } catch (error) {
        console.error('Wallet setup failed:', error);
        throw error;
    }
}
```

### Multi-Protocol Transaction

```javascript
// Send funds using optimal protocol
async function smartSend(toAddress, amount) {
    const wallet = walletManager.activeWallet;
    if (!wallet) throw new Error('No active wallet');
    
    let transaction;
    
    // Determine protocol based on address format
    if (toAddress.startsWith('spark1')) {
        // Spark Protocol transaction
        transaction = await walletManager.createSparkTransaction(
            wallet.id,
            toAddress,
            amount,
            'spark'
        );
        console.log('Sent via Spark Protocol');
    } else if (toAddress.startsWith('lnbc')) {
        // Lightning invoice
        transaction = await walletManager.createSparkTransaction(
            wallet.id,
            toAddress,
            amount,
            'lightning'
        );
        console.log('Sent via Lightning Network');
    } else {
        // Regular Bitcoin
        transaction = await walletManager.createSparkTransaction(
            wallet.id,
            toAddress,
            amount,
            'bitcoin'
        );
        console.log('Sent via Bitcoin');
    }
    
    return transaction;
}
```

### Balance Monitoring

```javascript
// Monitor wallet balances
async function monitorWalletHealth() {
    const wallet = walletManager.activeWallet;
    if (!wallet) return;
    
    // Update balances
    const balance = await walletManager.getSparkBalance(wallet.id);
    
    // Calculate percentages
    const sparkPercent = (balance.spark / balance.total) * 100;
    const lightningPercent = (balance.lightning / balance.total) * 100;
    const bitcoinPercent = (balance.bitcoin / balance.total) * 100;
    
    console.log('Balance Distribution:');
    console.log(`  Bitcoin: ${bitcoinPercent.toFixed(1)}%`);
    console.log(`  Spark L2: ${sparkPercent.toFixed(1)}%`);
    console.log(`  Lightning: ${lightningPercent.toFixed(1)}%`);
    
    // Recommendations
    if (sparkPercent > 80) {
        console.log('Consider moving some funds to Bitcoin for security');
    }
    if (lightningPercent < 10 && balance.total > 1000000) {
        console.log('Consider opening Lightning channels for instant payments');
    }
    
    return {
        balance,
        distribution: {
            bitcoin: bitcoinPercent,
            spark: sparkPercent,
            lightning: lightningPercent
        }
    };
}
```

### Transaction History

```javascript
// Get transaction history with filtering
function getTransactionHistory(wallet, filter = {}) {
    const transactions = wallet.transactions;
    
    let filtered = transactions;
    
    // Filter by type
    if (filter.type) {
        filtered = filtered.filter(tx => tx.type === filter.type);
    }
    
    // Filter by date range
    if (filter.startDate) {
        filtered = filtered.filter(tx => tx.timestamp >= filter.startDate);
    }
    
    if (filter.endDate) {
        filtered = filtered.filter(tx => tx.timestamp <= filter.endDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    return filtered;
}

// Usage
const sparkTransactions = getTransactionHistory(wallet, { type: 'spark' });
const recentTransactions = getTransactionHistory(wallet, {
    startDate: Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
});
```

## Address Generation

### Bitcoin Address (P2WPKH)
```javascript
// Generates native SegWit addresses
const bitcoinAddress = walletManager.generateBitcoinAddress();
// Example: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

### Spark Protocol Address
```javascript
// Generates Spark-specific addresses
const sparkAddress = walletManager.generateSparkAddress();
// Example: spark1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wl
```

## Security Considerations

1. **Mnemonic Encryption**: Always encrypt mnemonics with user passwords
2. **Memory Management**: Clear sensitive data after use
3. **Address Validation**: Validate all addresses before transactions
4. **State Verification**: Verify Spark state with operators

## Error Handling

```javascript
try {
    const wallet = await walletManager.createSparkWallet('Test', 'password');
} catch (error) {
    if (error.message.includes('entropy')) {
        // Entropy generation failed
        console.error('Secure random generation failed');
    } else if (error.message.includes('Spark Protocol')) {
        // Spark registration failed
        console.error('Could not register with Spark Protocol');
    } else {
        // Other errors
        console.error('Wallet creation failed:', error);
    }
}
```

## Performance Notes

- Wallet creation uses crypto.getRandomValues for secure entropy
- Balance checks are cached for 30 seconds
- Transaction history limited to last 1000 transactions
- Spark state updates are batched for efficiency

## Dependencies

- `SparkStateManager`: For Spark Protocol operations
- `SparkBitcoinManager`: For Bitcoin transactions
- `SparkLightningManager`: For Lightning payments
- Web Crypto API: For secure random generation

## Future Enhancements

- Multi-signature wallet support
- Hardware wallet integration
- Wallet backup/restore functionality
- Advanced derivation paths
- Cross-chain atomic swaps