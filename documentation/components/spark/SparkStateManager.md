# SparkStateManager

**Last Updated**: 2025-07-21
**Location**: `/public/js/moosh-wallet.js` - Lines 5601-5724
**Type**: Core State Management Component

## Overview

The `SparkStateManager` is the core state management component for the Spark Protocol in MOOSH Wallet. It handles the Layer 2 state tree, operator network interactions, and manages state transitions including deposits and exits from the Spark Protocol.

## Class Definition

```javascript
class SparkStateManager {
    constructor()
    async updateSparkState(transaction)
    async initiateSparkExit(amount, proof)
    hashStateLeaf(leaf)
    calculateMerkleRoot()
    generateMerkleProof(leafHash)
    async broadcastToOperators(stateLeaf)
    sha256(data)
    buildMerkleTree(leaves)
    getMerkleProof(leafHash)
    async getOperatorSignature(transaction)
    async createBitcoinExitTransaction(exitRequest)
}
```

## Properties

### Core Properties

- **operatorNetwork** (`Array`): List of Spark Protocol operators
- **stateTree** (`Map`): Merkle tree structure storing Layer 2 state
- **sparkContracts** (`Object`): Contract addresses for Spark Protocol
  - `mainContract`: Main Spark Protocol contract address
  - `stateRoot`: Current state root contract
  - `exitProcessor`: Exit processing contract
- **networkType** (`string`): Network type ('mainnet' or 'testnet')

## Methods

### updateSparkState(transaction)

Updates the Spark Protocol state tree with a new transaction.

**Parameters:**
- `transaction` (Object): Transaction object containing:
  - `from`: Sender address
  - `newBalance`: Updated balance after transaction
  - `nonce`: Transaction nonce

**Returns:**
- `Promise<Object>`: State update result
  - `stateRoot`: New Merkle root
  - `proof`: Merkle proof for the update
  - `sparkConfirmed`: Confirmation status

**Example:**
```javascript
const stateUpdate = await sparkStateManager.updateSparkState({
    from: 'spark1q123...',
    newBalance: 50000,
    nonce: 1
});
```

### initiateSparkExit(amount, proof)

Initiates an exit from Spark Protocol back to Bitcoin mainnet.

**Parameters:**
- `amount` (number): Amount to exit in satoshis
- `proof` (Object): Merkle proof for the exit claim

**Returns:**
- `Promise<Object>`: Exit transaction details
  - `transaction`: Bitcoin transaction object
  - `challengePeriod`: Exit challenge period timestamp
  - `sparkProof`: Cryptographic proof
  - `txid`: Transaction ID

**Example:**
```javascript
const exitTx = await sparkStateManager.initiateSparkExit(100000, merkleProof);
console.log(`Exit initiated: ${exitTx.txid}`);
console.log(`Challenge period ends: ${new Date(exitTx.challengePeriod)}`);
```

### hashStateLeaf(leaf)

Generates a hash for a state leaf in the Merkle tree.

**Parameters:**
- `leaf` (Object): State leaf object

**Returns:**
- `string`: Hash of the state leaf

### calculateMerkleRoot()

Calculates the current Merkle root of the state tree.

**Returns:**
- `string`: Current Merkle root hash

### generateMerkleProof(leafHash)

Generates a Merkle proof for a specific leaf in the state tree.

**Parameters:**
- `leafHash` (string): Hash of the leaf to prove

**Returns:**
- `Object`: Merkle proof containing:
  - `leaf`: The leaf hash
  - `path`: Proof path array
  - `root`: Current Merkle root

### broadcastToOperators(stateLeaf)

Broadcasts state updates to the Spark Protocol operator network.

**Parameters:**
- `stateLeaf` (Object): State leaf to broadcast

**Returns:**
- `Promise<boolean>`: Success status

## Integration Examples

### Creating a State Update

```javascript
// Initialize SparkStateManager
const sparkState = new SparkStateManager();

// Create a transaction
const transaction = {
    from: 'spark1q123...',
    to: 'spark1q456...',
    amount: 50000,
    newBalance: 150000,
    nonce: 5
};

// Update state
try {
    const result = await sparkState.updateSparkState(transaction);
    console.log('State updated:', result.stateRoot);
    console.log('Proof generated:', result.proof);
} catch (error) {
    console.error('State update failed:', error);
}
```

### Initiating an Exit

```javascript
// Get current balance proof
const leafHash = sparkState.hashStateLeaf({
    owner: wallet.addresses.spark,
    balance: wallet.balance.spark,
    nonce: wallet.sparkState.nonce
});

const proof = sparkState.generateMerkleProof(leafHash);

// Initiate exit
try {
    const exitTx = await sparkState.initiateSparkExit(
        wallet.balance.spark,
        proof
    );
    
    console.log('Exit transaction:', exitTx.txid);
    console.log('Challenge period:', exitTx.challengePeriod);
    
    // Monitor exit status
    const exitDate = new Date(exitTx.challengePeriod);
    console.log(`Funds available after: ${exitDate}`);
} catch (error) {
    console.error('Exit failed:', error);
}
```

### Verifying State

```javascript
// Verify current state
const currentRoot = sparkState.calculateMerkleRoot();
console.log('Current state root:', currentRoot);

// Check operator signatures
const transaction = { /* ... */ };
const operatorSig = await sparkState.getOperatorSignature(transaction);
console.log('Operator signature:', operatorSig);
```

## State Tree Structure

The state tree maintains the following structure for each leaf:

```javascript
{
    owner: 'spark1q...',           // Owner's Spark address
    balance: 100000,               // Balance in satoshis
    nonce: 5,                      // Transaction nonce
    timestamp: 1642536000000,      // Unix timestamp
    sparkOperatorSig: 'sig_...'    // Operator signature
}
```

## Security Considerations

1. **Challenge Period**: 7-day challenge period for exits
2. **Operator Signatures**: All state updates require operator signatures
3. **Merkle Proofs**: Cryptographic proofs for all state transitions
4. **Non-Custodial**: Users maintain control of their funds

## Error Handling

```javascript
try {
    const result = await sparkState.updateSparkState(transaction);
} catch (error) {
    if (error.message.includes('insufficient balance')) {
        // Handle insufficient balance
    } else if (error.message.includes('invalid nonce')) {
        // Handle nonce mismatch
    } else {
        // Handle other errors
    }
}
```

## Performance Notes

- State updates are batched for efficiency
- Merkle tree operations are optimized for large state trees
- Operator broadcasts are asynchronous to prevent blocking

## Dependencies

- Requires `SparkBitcoinManager` for exit transactions
- Works with `SparkWalletManager` for wallet state
- Integrates with operator network endpoints

## Future Enhancements

- Multi-operator consensus mechanisms
- Optimistic rollup support
- State compression techniques
- Enhanced privacy features