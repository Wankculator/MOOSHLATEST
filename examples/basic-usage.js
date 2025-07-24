/**
 * Basic usage example for MOOSH Wallet API
 * This demonstrates how to interact with the wallet programmatically
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Example 1: Generate a new wallet
async function generateWallet() {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spark/generate-wallet`, {
      strength: 256 // 24-word seed phrase
    });
    
    console.log('✅ Wallet generated successfully!');
    console.log('Seed phrase:', response.data.data.mnemonic);
    console.log('Bitcoin address:', response.data.data.addresses.bitcoin);
    console.log('Spark address:', response.data.data.addresses.spark);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error generating wallet:', error.message);
  }
}

// Example 2: Import existing wallet
async function importWallet(mnemonic) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spark/import`, {
      mnemonic: mnemonic
    });
    
    console.log('✅ Wallet imported successfully!');
    console.log('Bitcoin address:', response.data.data.addresses.bitcoin);
    console.log('Spark address:', response.data.data.addresses.spark);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error importing wallet:', error.message);
  }
}

// Example 3: Check balance
async function checkBalance(address) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/balance/${address}`);
    
    console.log('💰 Balance information:');
    console.log('Address:', response.data.data.address);
    console.log('Balance:', response.data.data.balance, response.data.data.currency);
    console.log('Unconfirmed:', response.data.data.unconfirmed, response.data.data.currency);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
  }
}

// Example 4: Get transactions
async function getTransactions(address) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/transactions/${address}`);
    
    console.log('📄 Transaction history:');
    console.log('Total transactions:', response.data.data.count);
    response.data.data.transactions.forEach((tx, index) => {
      console.log(`${index + 1}. Amount: ${tx.amount}, Hash: ${tx.hash}`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
  }
}

// Example 5: Setup multi-signature wallet
async function setupMultiSig(threshold, publicKeys) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spark/setup-multisig`, {
      threshold: threshold,
      pubkeys: publicKeys
    });
    
    console.log('🔐 Multi-sig wallet created!');
    console.log('Multi-sig address:', response.data.address);
    console.log(`Requires ${threshold} of ${publicKeys.length} signatures`);
    
    return response.data.address;
  } catch (error) {
    console.error('❌ Error setting up multi-sig:', error.message);
  }
}

// Main demo function
async function runDemo() {
  console.log('🚀 MOOSH Wallet API Demo\n');
  
  // Generate new wallet
  console.log('1️⃣ Generating new wallet...');
  const wallet = await generateWallet();
  console.log('\n');
  
  // Check balance
  if (wallet) {
    console.log('2️⃣ Checking balance...');
    await checkBalance(wallet.addresses.bitcoin);
    console.log('\n');
  }
  
  // Import wallet example
  console.log('3️⃣ Importing test wallet...');
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
  const importedWallet = await importWallet(testMnemonic);
  console.log('\n');
  
  // Get transactions
  if (importedWallet) {
    console.log('4️⃣ Fetching transactions...');
    await getTransactions(importedWallet.addresses.bitcoin);
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = {
  generateWallet,
  importWallet,
  checkBalance,
  getTransactions,
  setupMultiSig
};