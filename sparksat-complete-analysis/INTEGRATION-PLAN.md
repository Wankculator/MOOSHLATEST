# MOOSH Wallet Spark Integration Plan

## Integration Strategy

Based on the complete SparkSat analysis, here's how to integrate Spark protocol features into the existing MOOSH Wallet:

## 1. Current MOOSH Wallet Analysis

### Existing Structure
```
MOOSH WALLET/
├── public/
│   ├── index.html (Main wallet interface)
│   ├── css/ (Styling)
│   ├── js/
│   │   └── moosh-wallet.js (Core wallet logic)
│   └── images/
├── server.js (Backend server)
├── package.json
└── Various documentation files
```

### Current Features (Based on files)
- Web-based wallet interface
- Server backend (Node.js)
- Dashboard functionality
- User interface components

## 2. Spark Integration Architecture

### Phase 1: Foundation Setup

#### Install Spark SDK
```bash
cd "c:\Users\sk84l\OneDrive\Desktop\MOOSH WALLET"
npm install @buildonspark/spark-sdk
```

#### Update package.json
```json
{
  "dependencies": {
    "@buildonspark/spark-sdk": "^latest",
    "ws": "^8.0.0",
    "dotenv": "^16.0.0"
  }
}
```

### Phase 2: Backend Integration (server.js)

#### Add Spark Wallet Service
```javascript
// Add to server.js
const { SparkWallet } = require('@buildonspark/spark-sdk');

class SparkWalletService {
  constructor() {
    this.wallet = null;
    this.isInitialized = false;
  }

  async initialize(mnemonic = null, network = 'MAINNET') {
    try {
      const config = {
        options: { network }
      };
      
      if (mnemonic) {
        config.mnemonicOrSeed = mnemonic;
      }

      const { wallet, mnemonic: generatedMnemonic } = await SparkWallet.initialize(config);
      
      this.wallet = wallet;
      this.isInitialized = true;
      
      // Set up event listeners
      this.setupEventListeners();
      
      return { 
        success: true, 
        mnemonic: generatedMnemonic || 'Wallet restored',
        sparkAddress: await wallet.getSparkAddress()
      };
    } catch (error) {
      console.error('Spark wallet initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  setupEventListeners() {
    this.wallet.on('transfer:claimed', (transferId, updatedBalance) => {
      console.log(`Transfer ${transferId} claimed. New balance: ${updatedBalance}`);
      // Emit to connected clients via WebSocket
    });

    this.wallet.on('deposit:confirmed', (depositId, updatedBalance) => {
      console.log(`Deposit ${depositId} confirmed. New balance: ${updatedBalance}`);
      // Emit to connected clients via WebSocket
    });
  }

  async getBalance() {
    if (!this.isInitialized) throw new Error('Wallet not initialized');
    return await this.wallet.getBalance();
  }

  async createDepositAddress() {
    if (!this.isInitialized) throw new Error('Wallet not initialized');
    return await this.wallet.getSingleUseDepositAddress();
  }

  async transfer(receiverAddress, amountSats) {
    if (!this.isInitialized) throw new Error('Wallet not initialized');
    return await this.wallet.transfer({
      receiverSparkAddress: receiverAddress,
      amountSats: parseInt(amountSats)
    });
  }

  async payLightningInvoice(invoice, maxFeeSats) {
    if (!this.isInitialized) throw new Error('Wallet not initialized');
    return await this.wallet.payLightningInvoice({
      invoice,
      maxFeeSats: parseInt(maxFeeSats)
    });
  }

  async createLightningInvoice(amountSats, memo) {
    if (!this.isInitialized) throw new Error('Wallet not initialized');
    return await this.wallet.createLightningInvoice({
      amountSats: parseInt(amountSats),
      memo,
      includeSparkAddress: true
    });
  }
}

// Add to server.js
const sparkService = new SparkWalletService();

// API Routes for Spark functionality
app.post('/api/spark/initialize', async (req, res) => {
  const { mnemonic, network } = req.body;
  const result = await sparkService.initialize(mnemonic, network);
  res.json(result);
});

app.get('/api/spark/balance', async (req, res) => {
  try {
    const balance = await sparkService.getBalance();
    res.json({ success: true, balance });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/spark/deposit-address', async (req, res) => {
  try {
    const address = await sparkService.createDepositAddress();
    res.json({ success: true, address });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/spark/transfer', async (req, res) => {
  const { receiverAddress, amountSats } = req.body;
  try {
    const result = await sparkService.transfer(receiverAddress, amountSats);
    res.json({ success: true, transfer: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/spark/lightning/pay', async (req, res) => {
  const { invoice, maxFeeSats } = req.body;
  try {
    const result = await sparkService.payLightningInvoice(invoice, maxFeeSats);
    res.json({ success: true, payment: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/spark/lightning/invoice', async (req, res) => {
  const { amountSats, memo } = req.body;
  try {
    const result = await sparkService.createLightningInvoice(amountSats, memo);
    res.json({ success: true, invoice: result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
```

### Phase 3: Frontend Integration (moosh-wallet.js)

#### Add Spark Wallet Interface
```javascript
// Add to public/js/moosh-wallet.js

class SparkWalletUI {
  constructor() {
    this.isInitialized = false;
    this.sparkAddress = null;
    this.balance = { balance: 0, tokenBalances: new Map() };
  }

  async initializeSpark(mnemonic = null, network = 'MAINNET') {
    try {
      const response = await fetch('/api/spark/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic, network })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.isInitialized = true;
        this.sparkAddress = result.sparkAddress;
        this.showSparkInterface();
        this.updateBalance();
        
        if (result.mnemonic && result.mnemonic !== 'Wallet restored') {
          this.showMnemonicBackup(result.mnemonic);
        }
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Spark initialization failed:', error);
      throw error;
    }
  }

  showSparkInterface() {
    const sparkSection = document.createElement('div');
    sparkSection.id = 'spark-interface';
    sparkSection.innerHTML = `
      <div class="spark-wallet-section">
        <h2>⚡ Spark Layer 2 Wallet</h2>
        
        <div class="spark-balance">
          <h3>Balance</h3>
          <div id="spark-balance-display">0 sats</div>
          <button onclick="sparkWallet.updateBalance()">Refresh</button>
        </div>

        <div class="spark-address">
          <h3>Your Spark Address</h3>
          <div id="spark-address-display">${this.sparkAddress}</div>
          <button onclick="sparkWallet.copySparkAddress()">Copy</button>
        </div>

        <div class="spark-deposit">
          <h3>Deposit Bitcoin</h3>
          <button onclick="sparkWallet.generateDepositAddress()">Generate Deposit Address</button>
          <div id="deposit-address-display"></div>
        </div>

        <div class="spark-transfer">
          <h3>Send Spark Transfer</h3>
          <input type="text" id="transfer-address" placeholder="Recipient Spark Address">
          <input type="number" id="transfer-amount" placeholder="Amount (sats)">
          <button onclick="sparkWallet.sendSparkTransfer()">Send Transfer</button>
        </div>

        <div class="lightning-section">
          <h3>⚡ Lightning Network</h3>
          
          <div class="lightning-pay">
            <h4>Pay Lightning Invoice</h4>
            <input type="text" id="lightning-invoice" placeholder="Lightning Invoice">
            <input type="number" id="max-fee" placeholder="Max Fee (sats)" value="10">
            <button onclick="sparkWallet.payLightningInvoice()">Pay Invoice</button>
          </div>

          <div class="lightning-receive">
            <h4>Create Lightning Invoice</h4>
            <input type="number" id="invoice-amount" placeholder="Amount (sats)">
            <input type="text" id="invoice-memo" placeholder="Description">
            <button onclick="sparkWallet.createLightningInvoice()">Create Invoice</button>
            <div id="created-invoice-display"></div>
          </div>
        </div>

        <div class="spark-history">
          <h3>Transaction History</h3>
          <div id="spark-transaction-history"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(sparkSection);
  }

  async updateBalance() {
    try {
      const response = await fetch('/api/spark/balance');
      const result = await response.json();
      
      if (result.success) {
        this.balance = result.balance;
        document.getElementById('spark-balance-display').textContent = 
          `${result.balance.balance} sats`;
        
        // Update token balances if any
        if (result.balance.tokenBalances.size > 0) {
          // Display token balances
        }
      }
    } catch (error) {
      console.error('Balance update failed:', error);
    }
  }

  async generateDepositAddress() {
    try {
      const response = await fetch('/api/spark/deposit-address', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        document.getElementById('deposit-address-display').innerHTML = `
          <div class="deposit-address">
            <p>Send Bitcoin to this address:</p>
            <code>${result.address}</code>
            <button onclick="sparkWallet.copyText('${result.address}')">Copy</button>
          </div>
        `;
      }
    } catch (error) {
      console.error('Deposit address generation failed:', error);
    }
  }

  async sendSparkTransfer() {
    const address = document.getElementById('transfer-address').value;
    const amount = document.getElementById('transfer-amount').value;
    
    if (!address || !amount) {
      alert('Please enter both address and amount');
      return;
    }

    try {
      const response = await fetch('/api/spark/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverAddress: address,
          amountSats: amount
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Transfer sent successfully!');
        this.updateBalance();
        // Clear form
        document.getElementById('transfer-address').value = '';
        document.getElementById('transfer-amount').value = '';
      } else {
        alert('Transfer failed: ' + result.error);
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed: ' + error.message);
    }
  }

  async payLightningInvoice() {
    const invoice = document.getElementById('lightning-invoice').value;
    const maxFee = document.getElementById('max-fee').value;
    
    if (!invoice) {
      alert('Please enter a Lightning invoice');
      return;
    }

    try {
      const response = await fetch('/api/spark/lightning/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice,
          maxFeeSats: maxFee || 10
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Payment sent successfully!');
        this.updateBalance();
        document.getElementById('lightning-invoice').value = '';
      } else {
        alert('Payment failed: ' + result.error);
      }
    } catch (error) {
      console.error('Lightning payment failed:', error);
      alert('Payment failed: ' + error.message);
    }
  }

  async createLightningInvoice() {
    const amount = document.getElementById('invoice-amount').value;
    const memo = document.getElementById('invoice-memo').value;
    
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    try {
      const response = await fetch('/api/spark/lightning/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountSats: amount,
          memo: memo || ''
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        document.getElementById('created-invoice-display').innerHTML = `
          <div class="created-invoice">
            <p>Lightning Invoice Created:</p>
            <textarea readonly>${result.invoice.paymentRequest}</textarea>
            <button onclick="sparkWallet.copyText('${result.invoice.paymentRequest}')">Copy Invoice</button>
          </div>
        `;
      } else {
        alert('Invoice creation failed: ' + result.error);
      }
    } catch (error) {
      console.error('Invoice creation failed:', error);
      alert('Invoice creation failed: ' + error.message);
    }
  }

  copySparkAddress() {
    this.copyText(this.sparkAddress);
  }

  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  showMnemonicBackup(mnemonic) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
      align-items: center; justify-content: center;
    `;
    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 500px;">
        <h2>⚠️ IMPORTANT: Save Your Seed Phrase</h2>
        <p>Write down these 12 words in order. You'll need them to recover your wallet:</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <code style="font-size: 16px;">${mnemonic}</code>
        </div>
        <p style="color: red; font-weight: bold;">
          Store this safely and never share it with anyone!
        </p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
          I've Saved It Safely
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

// Initialize Spark wallet interface
const sparkWallet = new SparkWalletUI();

// Add to existing MOOSH wallet initialization
function initializeMooshWallet() {
  // Existing MOOSH wallet code...
  
  // Add Spark integration button
  const sparkButton = document.createElement('button');
  sparkButton.textContent = '⚡ Enable Spark Layer 2';
  sparkButton.onclick = () => {
    const mnemonic = prompt('Enter existing mnemonic (or leave empty to create new):');
    sparkWallet.initializeSpark(mnemonic || null)
      .then(() => {
        sparkButton.style.display = 'none';
      })
      .catch(error => {
        alert('Spark initialization failed: ' + error.message);
      });
  };
  
  document.body.appendChild(sparkButton);
}
```

### Phase 4: UI/UX Integration

#### Update CSS (public/css/)
```css
/* Add to existing CSS */
.spark-wallet-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.spark-balance, .spark-address, .spark-deposit, 
.spark-transfer, .lightning-section, .spark-history {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
}

.spark-balance h3, .spark-address h3, .spark-deposit h3,
.spark-transfer h3, .lightning-section h3, .spark-history h3 {
  margin-top: 0;
  color: #fff;
}

#spark-balance-display {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

#spark-address-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  word-break: break-all;
  margin: 10px 0;
}

.spark-transfer input, .lightning-pay input, .lightning-receive input {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.9);
}

.spark-transfer button, .lightning-pay button, .lightning-receive button,
.spark-balance button, .spark-address button, .spark-deposit button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
}

.spark-transfer button:hover, .lightning-pay button:hover, 
.lightning-receive button:hover, .spark-balance button:hover,
.spark-address button:hover, .spark-deposit button:hover {
  background: #ff5252;
}

.deposit-address code {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  display: block;
  margin: 10px 0;
  word-break: break-all;
}

.created-invoice textarea {
  width: 100%;
  height: 100px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  font-family: monospace;
  resize: vertical;
}
```

## 3. Testing and Deployment

### Testing Steps
1. Start with Regtest network for development
2. Test wallet creation and restoration
3. Test deposit address generation
4. Test Lightning invoice creation and payment
5. Test Spark transfers between addresses
6. Move to Testnet for integration testing
7. Deploy to Mainnet for production

### Environment Configuration
```javascript
// Add to server.js
const SPARK_CONFIG = {
  development: 'REGTEST',
  staging: 'TESTNET', 
  production: 'MAINNET'
};

const network = SPARK_CONFIG[process.env.NODE_ENV] || 'REGTEST';
```

This integration plan provides a complete roadmap for adding Spark protocol capabilities to your existing MOOSH Wallet while maintaining the current functionality.
