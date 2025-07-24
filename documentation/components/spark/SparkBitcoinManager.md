# SparkBitcoinManager

**Last Updated**: 2025-07-21
**Location**: `/public/js/moosh-wallet.js` - Lines 5726-5834
**Type**: Bitcoin Integration Component

## Overview

The `SparkBitcoinManager` handles all Bitcoin-related operations for the Spark Protocol, including UTXO management, deposit creation, and network fee estimation. It provides the bridge between Bitcoin mainnet and Spark Layer 2.

## Class Definition

```javascript
class SparkBitcoinManager {
    constructor()
    async getSparkUTXOs(address)
    async createSparkDeposit(amount, fromAddress)
    async getNetworkFees()
    selectUTXOs(utxos, amount)
    calculateFee()
    isSparkReserved(utxo)
}
```

## Properties

### Core Properties

- **network** (`string`): Bitcoin network type ('mainnet' or 'testnet')
- **sparkAddress** (`string`): Official Spark Protocol deposit address
- **nodeUrl** (`string`): Bitcoin node API endpoint (defaults to Blockstream)

## Methods

### getSparkUTXOs(address)

Fetches and analyzes UTXOs for a Bitcoin address with Spark Protocol awareness.

**Parameters:**
- `address` (string): Bitcoin address to query

**Returns:**
- `Promise<Array>`: Array of UTXO objects
  - `txid`: Transaction ID
  - `vout`: Output index
  - `value`: Amount in satoshis
  - `scriptPubKey`: Script public key
  - `sparkReserved`: Whether UTXO is reserved for Spark

**Example:**
```javascript
const utxos = await sparkBitcoinManager.getSparkUTXOs('bc1q...');
console.log(`Found ${utxos.length} UTXOs`);
console.log(`Total value: ${utxos.reduce((sum, u) => sum + u.value, 0)} sats`);
```

### createSparkDeposit(amount, fromAddress)

Creates a Bitcoin transaction to deposit funds into Spark Protocol.

**Parameters:**
- `amount` (number): Amount to deposit in satoshis
- `fromAddress` (string): Source Bitcoin address

**Returns:**
- `Promise<Object>`: Transaction object
  - `version`: Transaction version
  - `inputs`: Array of transaction inputs
  - `outputs`: Array of transaction outputs
  - `locktime`: Transaction locktime
  - `txid`: Transaction ID

**Example:**
```javascript
const depositTx = await sparkBitcoinManager.createSparkDeposit(
    100000,  // 0.001 BTC
    'bc1quser...'
);
console.log(`Deposit transaction: ${depositTx.txid}`);
console.log(`Spark output: ${depositTx.outputs[0].value} sats`);
```

### getNetworkFees()

Fetches current Bitcoin network fee estimates.

**Returns:**
- `Promise<Object>`: Fee estimates in sat/vByte
  - `fast`: Next block confirmation
  - `medium`: ~1 hour confirmation
  - `slow`: ~24 hour confirmation

**Example:**
```javascript
const fees = await sparkBitcoinManager.getNetworkFees();
console.log(`Fast: ${fees.fast} sat/vByte`);
console.log(`Medium: ${fees.medium} sat/vByte`);
console.log(`Slow: ${fees.slow} sat/vByte`);
```

### selectUTXOs(utxos, amount)

Selects optimal UTXOs for a transaction using coin selection algorithm.

**Parameters:**
- `utxos` (Array): Available UTXOs
- `amount` (number): Target amount in satoshis

**Returns:**
- `Array`: Selected UTXOs that cover the amount plus fees

### calculateFee()

Calculates transaction fee based on estimated size.

**Returns:**
- `number`: Fee amount in satoshis

### isSparkReserved(utxo)

Checks if a UTXO is reserved for Spark Protocol operations.

**Parameters:**
- `utxo` (Object): UTXO to check

**Returns:**
- `boolean`: True if reserved for Spark

## Integration Examples

### Creating a Spark Deposit

```javascript
// Initialize manager
const bitcoinManager = new SparkBitcoinManager();

// Create deposit transaction
async function depositToSpark(amount, userAddress) {
    try {
        // Check available UTXOs
        const utxos = await bitcoinManager.getSparkUTXOs(userAddress);
        const totalAvailable = utxos.reduce((sum, u) => sum + u.value, 0);
        
        if (totalAvailable < amount + bitcoinManager.calculateFee()) {
            throw new Error('Insufficient funds');
        }
        
        // Create deposit transaction
        const depositTx = await bitcoinManager.createSparkDeposit(
            amount,
            userAddress
        );
        
        console.log('Deposit transaction created:', depositTx);
        
        // Sign and broadcast (implementation specific)
        // const signedTx = await signTransaction(depositTx);
        // const txid = await broadcastTransaction(signedTx);
        
        return depositTx;
    } catch (error) {
        console.error('Deposit failed:', error);
        throw error;
    }
}
```

### Fee Estimation for Deposits

```javascript
async function estimateDepositCost(amount) {
    const fees = await bitcoinManager.getNetworkFees();
    const txFee = bitcoinManager.calculateFee();
    
    console.log('Deposit amount:', amount, 'sats');
    console.log('Network fee (medium):', fees.medium, 'sat/vByte');
    console.log('Estimated tx fee:', txFee, 'sats');
    console.log('Total cost:', amount + txFee, 'sats');
    
    return {
        depositAmount: amount,
        networkFee: txFee,
        totalCost: amount + txFee,
        feeRate: fees.medium
    };
}
```

### UTXO Management

```javascript
// Analyze UTXOs for Spark operations
async function analyzeUTXOs(address) {
    const utxos = await bitcoinManager.getSparkUTXOs(address);
    
    const analysis = {
        total: utxos.length,
        totalValue: 0,
        sparkReserved: 0,
        available: 0,
        largestUTXO: null
    };
    
    for (const utxo of utxos) {
        analysis.totalValue += utxo.value;
        
        if (utxo.sparkReserved) {
            analysis.sparkReserved++;
        } else {
            analysis.available++;
        }
        
        if (!analysis.largestUTXO || utxo.value > analysis.largestUTXO.value) {
            analysis.largestUTXO = utxo;
        }
    }
    
    console.log('UTXO Analysis:', analysis);
    return analysis;
}
```

## Transaction Structure

### Spark Deposit Transaction

```javascript
{
    version: 2,
    inputs: [
        {
            txid: 'previous_tx_hash',
            vout: 0,
            scriptSig: '',  // To be signed
            sequence: 0xffffffff
        }
    ],
    outputs: [
        {
            address: 'bc1qsparkprotocoladdress',  // Spark Protocol
            value: 100000  // Deposit amount
        },
        {
            address: 'bc1quser...',  // Change back to user
            value: 50000  // Change amount
        }
    ],
    locktime: 0,
    txid: 'spark_deposit_1234567890'
}
```

## Network Configuration

### Mainnet Configuration
```javascript
{
    network: 'mainnet',
    sparkAddress: 'bc1qsparkprotocoladdress',
    nodeUrl: 'https://blockstream.info/api'
}
```

### Testnet Configuration
```javascript
{
    network: 'testnet',
    sparkAddress: 'tb1qsparkprotocoltestnet',
    nodeUrl: 'https://blockstream.info/testnet/api'
}
```

## Error Handling

```javascript
try {
    const utxos = await bitcoinManager.getSparkUTXOs(address);
} catch (error) {
    if (error.message.includes('Failed to fetch')) {
        // Network error - use fallback data
        console.log('Using demo UTXOs due to network error');
    } else {
        // Other errors
        throw error;
    }
}
```

## Security Considerations

1. **UTXO Verification**: Always verify UTXOs before spending
2. **Fee Calculation**: Ensure adequate fees for timely confirmation
3. **Change Address**: Always return change to user's address
4. **Script Validation**: Validate all script public keys

## Performance Optimization

- UTXOs are fetched with caching to reduce API calls
- Coin selection algorithm optimizes for minimal inputs
- Fee estimation uses real-time network data

## Dependencies

- External API for UTXO queries (Blockstream by default)
- Works with `SparkStateManager` for state updates
- Integrates with `SparkWalletManager` for wallet operations

## API Endpoints Used

- `/address/{address}/utxo` - Fetch UTXOs
- `/fee-estimates` - Get fee estimates
- `/tx` - Broadcast transactions (when implemented)

## Future Enhancements

- Support for multiple Bitcoin nodes
- Advanced coin selection algorithms
- RBF (Replace-By-Fee) support
- Batch deposit transactions
- Hardware wallet integration