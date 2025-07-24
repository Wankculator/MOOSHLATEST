# 🔧 Fix: Send Transaction Functionality

## Current Issue
The send transaction feature shows a modal but has a TODO comment and doesn't actually send transactions.

## Complete Fix Implementation

### 1. Frontend Fix - Update processSend() in moosh-wallet.js

Find the `processSend()` method (around line ~11000) and replace with:

```javascript
async processSend() {
    const address = document.getElementById('recipient-address')?.value;
    const amount = document.getElementById('send-amount')?.value;
    const feeRate = document.getElementById('fee-rate')?.value || 'normal';
    
    if (!address || !amount) {
        this.app.showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate address
    if (!this.validateBitcoinAddress(address)) {
        this.app.showNotification('Invalid Bitcoin address', 'error');
        return;
    }
    
    // Validate amount
    const amountBTC = parseFloat(amount);
    if (isNaN(amountBTC) || amountBTC <= 0) {
        this.app.showNotification('Invalid amount', 'error');
        return;
    }
    
    // Convert to satoshis
    const amountSats = Math.floor(amountBTC * 100000000);
    
    // Check minimum amount (dust limit)
    if (amountSats < 546) {
        this.app.showNotification('Amount too small (minimum 546 satoshis)', 'error');
        return;
    }
    
    // Get current account
    const currentAccount = this.app.state.get('currentAccount');
    if (!currentAccount) {
        this.app.showNotification('No wallet selected', 'error');
        return;
    }
    
    // Show loading state
    const sendButton = document.querySelector('.btn-primary');
    const originalText = sendButton.textContent;
    sendButton.textContent = 'Processing...';
    sendButton.disabled = true;
    
    try {
        // Call API to create and broadcast transaction
        const response = await this.app.api.sendTransaction({
            from: currentAccount.addresses.bitcoin || currentAccount.addresses.segwit,
            to: address,
            amount: amountSats,
            feeRate: feeRate,
            privateKey: currentAccount.privateKeys?.bitcoin?.wif // This should be handled securely
        });
        
        if (response.success) {
            this.app.showNotification(`Transaction sent! TX ID: ${response.data.txid}`, 'success');
            this.closeModal();
            
            // Refresh balance
            this.loadWalletData();
        } else {
            throw new Error(response.error || 'Transaction failed');
        }
    } catch (error) {
        console.error('Send transaction error:', error);
        this.app.showNotification(error.message || 'Failed to send transaction', 'error');
    } finally {
        sendButton.textContent = originalText;
        sendButton.disabled = false;
    }
}

// Add this validation method if it doesn't exist
validateBitcoinAddress(address) {
    // Basic Bitcoin address validation
    const patterns = {
        segwit: /^bc1[a-z0-9]{39,59}$/,
        taproot: /^bc1p[a-z0-9]{58}$/,
        legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        testnet: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/
    };
    
    return Object.values(patterns).some(pattern => pattern.test(address));
}
```

### 2. Update Send Modal UI - Add fee selection

Update the `showSendModal()` method to include fee selection:

```javascript
// Add this after the amount input field
$.div({ className: 'form-group' }, [
    $.label({ 
        htmlFor: 'fee-rate',
        className: 'form-label'
    }, ['Transaction Fee']),
    $.select({
        id: 'fee-rate',
        className: 'form-input',
        style: 'width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: "JetBrains Mono", monospace;'
    }, [
        $.option({ value: 'slow' }, ['Slow (1 sat/byte) - ~60+ min']),
        $.option({ value: 'normal', selected: true }, ['Normal (5 sat/byte) - ~30 min']),
        $.option({ value: 'fast' }, ['Fast (20 sat/byte) - ~10 min']),
        $.option({ value: 'urgent' }, ['Urgent (50 sat/byte) - Next block'])
    ])
]),
```

### 3. Update APIService class - Add sendTransaction method

Add this method to the APIService class (around line 2400):

```javascript
async sendTransaction(txData) {
    try {
        const response = await fetch(`${this.baseURL}/api/transaction/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(txData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Send transaction error:', error);
        throw error;
    }
}
```

### 4. Backend Implementation - Add to api-server.js

Add this endpoint to handle transaction creation and broadcasting:

```javascript
// Add at the top with other imports
import { createTransaction, broadcastTransaction } from './services/transactionService.js';

// Add this endpoint after other routes
app.post('/api/transaction/send', async (req, res) => {
    try {
        const { from, to, amount, feeRate, privateKey } = req.body;
        
        // Validate inputs
        if (!from || !to || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Validate addresses
        if (!validateAddress(from) || !validateAddress(to)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid address format'
            });
        }
        
        // NOTE: In production, private keys should NEVER be sent over the network
        // This is for development only. Use hardware wallets or client-side signing
        
        // Create and broadcast transaction
        const txResult = await createTransaction({
            from,
            to,
            amount,
            feeRate: feeRate || 'normal',
            privateKey
        });
        
        res.json({
            success: true,
            data: {
                txid: txResult.txid,
                fee: txResult.fee,
                size: txResult.size
            }
        });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

### 5. Create Transaction Service - transactionService.js

Create a new file `src/server/services/transactionService.js`:

```javascript
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

// Fee rates in satoshis per byte
const FEE_RATES = {
    slow: 1,
    normal: 5,
    fast: 20,
    urgent: 50
};

export async function createTransaction({ from, to, amount, feeRate, privateKey }) {
    try {
        // Get UTXOs for the address
        const utxos = await getUTXOs(from);
        
        if (!utxos || utxos.length === 0) {
            throw new Error('No UTXOs available');
        }
        
        // Calculate total available
        const totalAvailable = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
        
        // Estimate transaction size and fee
        const estimatedSize = estimateTransactionSize(utxos.length, 2); // 2 outputs (recipient + change)
        const fee = estimatedSize * FEE_RATES[feeRate || 'normal'];
        
        if (totalAvailable < amount + fee) {
            throw new Error('Insufficient balance');
        }
        
        // Create transaction
        const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin });
        
        // Add inputs
        for (const utxo of utxos) {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: Buffer.from(utxo.scriptPubKey, 'hex'),
                    value: utxo.value
                }
            });
        }
        
        // Add outputs
        psbt.addOutput({
            address: to,
            value: amount
        });
        
        // Add change output if needed
        const change = totalAvailable - amount - fee;
        if (change > 546) { // Dust limit
            psbt.addOutput({
                address: from, // Send change back to sender
                value: change
            });
        }
        
        // Sign transaction
        const keyPair = ECPair.fromWIF(privateKey);
        psbt.signAllInputs(keyPair);
        psbt.finalizeAllInputs();
        
        // Get raw transaction
        const tx = psbt.extractTransaction();
        const rawTx = tx.toHex();
        
        // Broadcast transaction
        const txid = await broadcastTransaction(rawTx);
        
        return {
            txid,
            fee,
            size: tx.virtualSize()
        };
    } catch (error) {
        console.error('Create transaction error:', error);
        throw error;
    }
}

async function getUTXOs(address) {
    // Fetch UTXOs from blockchain API
    try {
        const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);
        if (!response.ok) throw new Error('Failed to fetch UTXOs');
        return await response.json();
    } catch (error) {
        console.error('Get UTXOs error:', error);
        throw error;
    }
}

export async function broadcastTransaction(rawTx) {
    try {
        // Try multiple broadcast endpoints
        const endpoints = [
            'https://mempool.space/api/tx',
            'https://blockstream.info/api/tx'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: rawTx
                });
                
                if (response.ok) {
                    return await response.text(); // Returns txid
                }
            } catch (err) {
                continue; // Try next endpoint
            }
        }
        
        throw new Error('Failed to broadcast transaction');
    } catch (error) {
        console.error('Broadcast error:', error);
        throw error;
    }
}

function estimateTransactionSize(inputCount, outputCount) {
    // Rough estimation for SegWit transactions
    // Base size + (input size * inputs) + (output size * outputs)
    return 10 + (148 * inputCount) + (34 * outputCount);
}
```

## Security Considerations

⚠️ **IMPORTANT**: The current implementation sends private keys to the server, which is EXTREMELY INSECURE for production use.

### Production-Ready Approach:

1. **Client-Side Signing**: Sign transactions in the browser, only send signed transactions to server
2. **Hardware Wallet Support**: Integrate Ledger/Trezor for secure signing
3. **Secure Key Storage**: Never store or transmit private keys
4. **Multi-Signature**: Implement multi-sig for additional security

## Testing the Fix

1. Make sure both servers are running
2. Generate or import a wallet
3. Fund it with testnet Bitcoin (for testing)
4. Try sending a small amount to another address
5. Check the transaction on a block explorer

## Next Steps

After implementing the basic send functionality:
1. Add transaction confirmation dialog
2. Show estimated fees before sending
3. Add address book functionality
4. Implement RBF (Replace-By-Fee)
5. Add batch sending support