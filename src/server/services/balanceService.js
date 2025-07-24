const https = require('https');

// Simple fetch wrapper using native https
const fetch = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
};

// API endpoints for different networks
const API_ENDPOINTS = {
  bitcoin: {
    mainnet: 'https://blockstream.info/api',
    testnet: 'https://blockstream.info/testnet/api'
  },
  spark: {
    mainnet: process.env.SPARK_RPC_ENDPOINT || 'http://localhost:8332',
    testnet: process.env.SPARK_TESTNET_RPC_ENDPOINT || 'http://localhost:18332'
  }
};

// Helper function to detect address type
function detectAddressType(address) {
  // Bitcoin address patterns
  const bitcoinPatterns = {
    // P2PKH addresses start with 1
    p2pkh: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    // P2SH addresses start with 3
    p2sh: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    // Bech32 addresses start with bc1
    bech32: /^bc1[a-z0-9]{39,59}$/,
    // Testnet addresses
    testnetP2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    testnetP2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    testnetBech32: /^tb1[a-z0-9]{39,59}$/
  };

  // Spark address patterns (example patterns - adjust based on actual Spark format)
  const sparkPatterns = {
    mainnet: /^spark1[a-z0-9]{39,59}$/,
    testnet: /^tspark1[a-z0-9]{39,59}$/
  };

  // Check Bitcoin patterns
  for (const [type, pattern] of Object.entries(bitcoinPatterns)) {
    if (pattern.test(address)) {
      return {
        type: 'bitcoin',
        network: type.includes('testnet') ? 'testnet' : 'mainnet',
        addressType: type
      };
    }
  }

  // Check Spark patterns
  for (const [network, pattern] of Object.entries(sparkPatterns)) {
    if (pattern.test(address)) {
      return {
        type: 'spark',
        network,
        addressType: 'spark'
      };
    }
  }

  return null;
}

// Bitcoin balance fetching
async function getBitcoinBalance(address, network = 'mainnet') {
  try {
    const baseUrl = API_ENDPOINTS.bitcoin[network];
    const response = await fetch(`${baseUrl}/address/${address}`);
    
    const balanceSatoshis = response.chain_stats.funded_txo_sum - 
                           response.chain_stats.spent_txo_sum;
    
    return {
      address,
      network,
      currency: 'BTC',
      balance: {
        satoshis: balanceSatoshis,
        btc: balanceSatoshis / 100000000,
        formatted: `${(balanceSatoshis / 100000000).toFixed(8)} BTC`
      },
      confirmed: {
        satoshis: balanceSatoshis,
        btc: balanceSatoshis / 100000000
      },
      unconfirmed: {
        satoshis: response.mempool_stats.funded_txo_sum - 
                 response.mempool_stats.spent_txo_sum,
        btc: (response.mempool_stats.funded_txo_sum - 
              response.mempool_stats.spent_txo_sum) / 100000000
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch Bitcoin balance: ${error.message}`);
  }
}

// Spark balance fetching
async function getSparkBalance(address, network = 'mainnet') {
  try {
    const rpcUrl = API_ENDPOINTS.spark[network];
    
    // Spark RPC call format (adjust based on actual Spark RPC spec)
    // Mock Spark balance for now
    return { error: 'Spark RPC not implemented' };
    /* const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'getbalance',
      params: [address]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPARK_RPC_USER || 'user'}:${process.env.SPARK_RPC_PASS || 'pass'}`
        ).toString('base64')}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const balanceSpark = response.result || 0;
    
    return {
      address,
      network,
      currency: 'SPARK',
      balance: {
        satoshis: balanceSpark * 100000000, // Convert to satoshi equivalent
        spark: balanceSpark,
        formatted: `${balanceSpark.toFixed(8)} SPARK`
      },
      confirmed: {
        satoshis: balanceSpark * 100000000,
        spark: balanceSpark
      },
      unconfirmed: {
        satoshis: 0,
        spark: 0
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch Spark balance: ${error.message}`);
  }
}

// Main balance fetching function
async function getAddressBalance(address) {
  try {
    // Validate address
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address provided');
    }

    // Detect address type
    const addressInfo = detectAddressType(address);
    
    if (!addressInfo) {
      throw new Error('Unrecognized address format');
    }

    // Fetch balance based on address type
    if (addressInfo.type === 'bitcoin') {
      return await getBitcoinBalance(address, addressInfo.network);
    } else if (addressInfo.type === 'spark') {
      return await getSparkBalance(address, addressInfo.network);
    }

    throw new Error('Unsupported address type');
  } catch (error) {
    console.error('Balance fetch error:', error);
    throw error;
  }
}

// Bitcoin transaction history
async function getBitcoinTransactionHistory(address, network = 'mainnet', limit = 25) {
  try {
    const baseUrl = API_ENDPOINTS.bitcoin[network];
    const response = await axios.get(`${baseUrl}/address/${address}/txs`);
    
    const transactions = response.slice(0, limit).map(tx => ({
      txid: tx.txid,
      timestamp: tx.status.block_time || Date.now() / 1000,
      confirmations: tx.status.confirmed ? tx.status.block_height : 0,
      value: calculateTxValue(tx, address),
      fee: tx.fee,
      status: tx.status.confirmed ? 'confirmed' : 'pending',
      inputs: tx.vin.map(input => ({
        address: input.prevout?.scriptpubkey_address,
        value: input.prevout?.value
      })),
      outputs: tx.vout.map(output => ({
        address: output.scriptpubkey_address,
        value: output.value
      }))
    }));

    return transactions;
  } catch (error) {
    throw new Error(`Failed to fetch Bitcoin transaction history: ${error.message}`);
  }
}

// Calculate transaction value for an address
function calculateTxValue(tx, address) {
  let received = 0;
  let sent = 0;

  // Calculate received amount
  tx.vout.forEach(output => {
    if (output.scriptpubkey_address === address) {
      received += output.value;
    }
  });

  // Calculate sent amount
  tx.vin.forEach(input => {
    if (input.prevout?.scriptpubkey_address === address) {
      sent += input.prevout.value;
    }
  });

  return received - sent;
}

// Spark transaction history
async function getSparkTransactionHistory(address, network = 'mainnet', limit = 25) {
  try {
    const rpcUrl = API_ENDPOINTS.spark[network];
    
    // Spark RPC call for transaction history
    // Mock Spark balance for now
    return { error: 'Spark RPC not implemented' };
    /* const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'listtransactions',
      params: [address, limit]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPARK_RPC_USER || 'user'}:${process.env.SPARK_RPC_PASS || 'pass'}`
        ).toString('base64')}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const transactions = (response.result || []).map(tx => ({
      txid: tx.txid,
      timestamp: tx.time,
      confirmations: tx.confirmations,
      value: tx.amount * 100000000, // Convert to satoshi equivalent
      fee: tx.fee ? tx.fee * 100000000 : 0,
      status: tx.confirmations > 0 ? 'confirmed' : 'pending',
      category: tx.category,
      address: tx.address
    }));

    return transactions;
  } catch (error) {
    throw new Error(`Failed to fetch Spark transaction history: ${error.message}`);
  }
}

// Main transaction history function
async function getTransactionHistory(address, limit = 25) {
  try {
    // Validate parameters
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address provided');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    // Detect address type
    const addressInfo = detectAddressType(address);
    
    if (!addressInfo) {
      throw new Error('Unrecognized address format');
    }

    // Fetch transaction history based on address type
    if (addressInfo.type === 'bitcoin') {
      return await getBitcoinTransactionHistory(address, addressInfo.network, limit);
    } else if (addressInfo.type === 'spark') {
      return await getSparkTransactionHistory(address, addressInfo.network, limit);
    }

    throw new Error('Unsupported address type');
  } catch (error) {
    console.error('Transaction history fetch error:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  getAddressBalance,
  getTransactionHistory,
  detectAddressType,
  API_ENDPOINTS
};