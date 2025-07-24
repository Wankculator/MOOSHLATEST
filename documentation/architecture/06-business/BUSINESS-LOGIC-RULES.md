# 💼 MOOSH Wallet Business Logic & Rules
## Critical Business Rules for Cryptocurrency Wallet Operations

### 📋 Table of Contents
1. [Transaction Rules](#transaction-rules)
2. [Fee Calculations](#fee-calculations)
3. [Address Validation](#address-validation)
4. [Balance Management](#balance-management)
5. [Security Policies](#security-policies)
6. [Spark Protocol Rules](#spark-protocol-rules)
7. [Compliance Requirements](#compliance-requirements)
8. [Error Handling Rules](#error-handling-rules)

---

## 💸 Transaction Rules

### Minimum Transaction Amounts
```javascript
const TRANSACTION_RULES = {
  // Minimum amounts (in satoshis)
  MIN_BITCOIN_SEND: 546,        // Dust limit
  MIN_SPARK_SEND: 1000,         // Spark minimum
  
  // Maximum amounts
  MAX_BITCOIN_SEND: 21000000 * 100000000, // 21M BTC in sats
  
  // Confirmation requirements
  CONFIRMATIONS_REQUIRED: {
    small: 1,      // < 0.01 BTC
    medium: 3,     // 0.01 - 1 BTC  
    large: 6       // > 1 BTC
  }
};

// Validation function
function validateTransaction(amount, type = 'bitcoin') {
  const amountSats = Math.floor(amount * 100000000);
  
  if (type === 'bitcoin') {
    if (amountSats < TRANSACTION_RULES.MIN_BITCOIN_SEND) {
      throw new Error(`Minimum send amount is ${TRANSACTION_RULES.MIN_BITCOIN_SEND} satoshis`);
    }
  }
  
  if (amountSats > TRANSACTION_RULES.MAX_BITCOIN_SEND) {
    throw new Error('Amount exceeds maximum possible');
  }
  
  return true;
}
```

### Transaction State Machine
```javascript
const TRANSACTION_STATES = {
  DRAFT: 'draft',
  SIGNED: 'signed',
  BROADCAST: 'broadcast',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

// State transitions
const VALID_TRANSITIONS = {
  [TRANSACTION_STATES.DRAFT]: ['signed', 'failed'],
  [TRANSACTION_STATES.SIGNED]: ['broadcast', 'failed'],
  [TRANSACTION_STATES.BROADCAST]: ['pending', 'failed'],
  [TRANSACTION_STATES.PENDING]: ['confirmed', 'failed'],
  [TRANSACTION_STATES.CONFIRMED]: [], // Final state
  [TRANSACTION_STATES.FAILED]: ['draft'] // Can retry
};
```

---

## 📊 Fee Calculations

### Dynamic Fee Structure
```javascript
const FEE_STRUCTURE = {
  // Satoshis per byte
  priority: {
    slow: 1,      // ~60+ minutes
    normal: 5,    // ~30 minutes
    fast: 20,     // ~10 minutes
    urgent: 50    // Next block
  },
  
  // Size calculations
  txSizes: {
    legacy: 250,        // ~250 bytes
    segwit: 141,        // ~141 vbytes
    taproot: 110,       // ~110 vbytes
    multisig: 370       // ~370 bytes
  }
};

function calculateFee(priority = 'normal', addressType = 'segwit', inputs = 1, outputs = 2) {
  const baseSize = FEE_STRUCTURE.txSizes[addressType];
  const inputSize = inputs * 148;  // ~148 bytes per input
  const outputSize = outputs * 34;  // ~34 bytes per output
  
  const totalSize = baseSize + inputSize + outputSize;
  const feeRate = FEE_STRUCTURE.priority[priority];
  
  return {
    totalBytes: totalSize,
    feeRate: feeRate,
    totalFee: totalSize * feeRate,
    totalFeeBTC: (totalSize * feeRate) / 100000000
  };
}

// Fee validation
function validateFee(fee, transactionSize) {
  const MIN_FEE_RATE = 1; // 1 sat/byte minimum
  const MAX_FEE_RATE = 1000; // 1000 sat/byte maximum (sanity check)
  
  const feeRate = fee / transactionSize;
  
  if (feeRate < MIN_FEE_RATE) {
    throw new Error('Fee too low - transaction may never confirm');
  }
  
  if (feeRate > MAX_FEE_RATE) {
    throw new Error('Fee unusually high - please verify');
  }
  
  return true;
}
```

### Fee Estimation API Integration
```javascript
async function getRecommendedFees() {
  try {
    // Primary: mempool.space API
    const response = await fetch('https://mempool.space/api/v1/fees/recommended');
    const fees = await response.json();
    
    return {
      slow: fees.hourFee,
      normal: fees.halfHourFee,
      fast: fees.fastestFee
    };
  } catch (error) {
    // Fallback to hardcoded values
    return FEE_STRUCTURE.priority;
  }
}
```

---

## ✅ Address Validation

### Address Format Rules
```javascript
const ADDRESS_RULES = {
  // Bitcoin address patterns
  patterns: {
    legacy: {
      regex: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      prefix: ['1', '3'],
      length: [26, 35]
    },
    segwit: {
      regex: /^bc1[a-z0-9]{39,59}$/,
      prefix: ['bc1'],
      length: [42, 62]
    },
    taproot: {
      regex: /^bc1p[a-z0-9]{58}$/,
      prefix: ['bc1p'],
      length: [62]
    },
    testnet: {
      regex: /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      prefix: ['m', 'n', '2'],
      length: [26, 35]
    }
  },
  
  // Spark Protocol
  spark: {
    regex: /^sp1p[a-z0-9]{58,62}$/,
    prefix: ['sp1p'],
    length: [62, 66]
  }
};

function validateAddress(address, network = 'mainnet') {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Invalid address format' };
  }
  
  // Check each pattern
  for (const [type, rule] of Object.entries(ADDRESS_RULES.patterns)) {
    if (rule.regex.test(address)) {
      return {
        valid: true,
        type: type,
        network: type === 'testnet' ? 'testnet' : 'mainnet'
      };
    }
  }
  
  // Check Spark
  if (ADDRESS_RULES.spark.regex.test(address)) {
    return {
      valid: true,
      type: 'spark',
      network: 'spark'
    };
  }
  
  return { valid: false, error: 'Unrecognized address format' };
}

// Checksum validation for legacy addresses
function validateLegacyChecksum(address) {
  // Implementation of Base58Check validation
  // This is critical for legacy address security
  return true; // Simplified
}
```

---

## 💰 Balance Management

### Balance Calculation Rules
```javascript
const BALANCE_RULES = {
  // Decimal precision
  DECIMAL_PLACES: 8,
  
  // Display formatting
  DISPLAY_THRESHOLD: {
    compact: 1000,      // Show as 1K
    scientific: 1000000 // Show as 1M
  },
  
  // UTXO management
  UTXO_RULES: {
    minConfirmations: 1,
    maxUTXOs: 100,     // Prevent too many inputs
    consolidationThreshold: 50 // Consolidate if > 50 UTXOs
  }
};

function calculateSpendableBalance(utxos, confirmations = 1) {
  const spendable = utxos
    .filter(utxo => utxo.confirmations >= confirmations)
    .reduce((sum, utxo) => sum + utxo.value, 0);
    
  const pending = utxos
    .filter(utxo => utxo.confirmations < confirmations)
    .reduce((sum, utxo) => sum + utxo.value, 0);
    
  return {
    confirmed: spendable,
    pending: pending,
    total: spendable + pending,
    utxoCount: utxos.length
  };
}

// Format balance for display
function formatBalance(satoshis, currency = 'BTC') {
  const btc = satoshis / 100000000;
  
  if (currency === 'BTC') {
    return btc.toFixed(8).replace(/\.?0+$/, '');
  }
  
  // USD conversion (simplified)
  const usdRate = 50000; // Should fetch real rate
  const usd = btc * usdRate;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(usd);
}
```

---

## 🔒 Security Policies

### Key Management Rules
```javascript
const SECURITY_POLICIES = {
  // Password requirements
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecial: true,
    prohibitedWords: ['password', 'moosh', '12345']
  },
  
  // Session management
  session: {
    timeout: 15 * 60 * 1000, // 15 minutes
    warningTime: 13 * 60 * 1000, // Warning at 13 minutes
    maxAttempts: 3
  },
  
  // Key derivation
  keyDerivation: {
    iterations: 100000, // PBKDF2 iterations
    saltLength: 32,
    keyLength: 32
  }
};

// Never store these
const FORBIDDEN_STORAGE = [
  'privateKey',
  'seed',
  'mnemonic',
  'password',
  'pin'
];

function validatePasswordStrength(password) {
  const checks = {
    length: password.length >= SECURITY_POLICIES.password.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    prohibited: !SECURITY_POLICIES.password.prohibitedWords.some(word => 
      password.toLowerCase().includes(word)
    )
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  
  return {
    valid: Object.values(checks).every(Boolean),
    strength: strength / Object.keys(checks).length,
    checks: checks
  };
}
```

---

## ⚡ Spark Protocol Rules

### Spark-Specific Business Logic
```javascript
const SPARK_RULES = {
  // Address format
  addressFormat: {
    prefix: 'sp1p',
    version: 1,
    length: 66
  },
  
  // Transaction rules
  transactions: {
    minAmount: 1000, // Minimum satoshis
    maxAmount: null, // No maximum
    confirmations: 3 // Required confirmations
  },
  
  // Protocol features
  features: {
    multisig: true,
    timelock: true,
    atomicSwaps: true
  },
  
  // Fee structure
  fees: {
    base: 100,      // Base fee in satoshis
    perByte: 1,     // Additional per byte
    priority: 2     // Priority multiplier
  }
};

function validateSparkTransaction(tx) {
  // Validate Spark-specific rules
  if (!tx.to.startsWith(SPARK_RULES.addressFormat.prefix)) {
    throw new Error('Invalid Spark address');
  }
  
  if (tx.amount < SPARK_RULES.transactions.minAmount) {
    throw new Error(`Minimum amount is ${SPARK_RULES.transactions.minAmount} satoshis`);
  }
  
  return true;
}
```

---

## 📜 Compliance Requirements

### Regulatory Compliance
```javascript
const COMPLIANCE_RULES = {
  // Non-custodial wallet rules
  nonCustodial: {
    noKYC: true,
    noUserData: true,
    noTracking: true
  },
  
  // Jurisdiction restrictions
  restrictedCountries: [
    // Add any restricted jurisdictions
  ],
  
  // Transaction reporting thresholds
  reporting: {
    largeTransaction: 10000, // USD value
    suspiciousPattern: {
      rapidTransactions: 10, // In 1 hour
      unusualAmount: 100000  // USD
    }
  },
  
  // Data retention
  dataRetention: {
    transactionHistory: 0, // Don't store
    userLogs: 0,          // Don't store
    errorLogs: 7          // Days
  }
};

// Privacy-preserving compliance check
function checkCompliance(transaction) {
  // Only check patterns, don't store data
  const flags = [];
  
  if (transaction.usdValue > COMPLIANCE_RULES.reporting.largeTransaction) {
    flags.push('LARGE_TRANSACTION');
  }
  
  // Return flags without storing
  return flags;
}
```

---

## ❌ Error Handling Rules

### Error Categories and Handling
```javascript
const ERROR_RULES = {
  // Error categories
  categories: {
    NETWORK: {
      retry: true,
      maxRetries: 3,
      backoff: 'exponential',
      userMessage: 'Network issue. Retrying...'
    },
    VALIDATION: {
      retry: false,
      userMessage: 'Please check your input'
    },
    INSUFFICIENT_FUNDS: {
      retry: false,
      userMessage: 'Insufficient balance'
    },
    SECURITY: {
      retry: false,
      log: true,
      userMessage: 'Security check failed'
    }
  },
  
  // Retry strategies
  retryStrategy: {
    exponential: [1000, 2000, 4000], // MS delays
    linear: [1000, 1000, 1000],
    immediate: [0, 0, 0]
  }
};

async function handleTransactionError(error, context) {
  const category = categorizeError(error);
  const rule = ERROR_RULES.categories[category];
  
  if (rule.retry) {
    return retryWithBackoff(
      context.operation,
      rule.maxRetries,
      ERROR_RULES.retryStrategy[rule.backoff]
    );
  }
  
  // Show user message
  NotificationService.error(rule.userMessage);
  
  // Log if required
  if (rule.log) {
    console.error(`[${category}]`, error, context);
  }
  
  throw error;
}
```

---

## 📊 Business Metrics

### Key Performance Indicators
```javascript
const BUSINESS_METRICS = {
  // Success rates
  targetMetrics: {
    transactionSuccess: 0.99,    // 99%
    apiUptime: 0.999,           // 99.9%
    userSatisfaction: 0.95      // 95%
  },
  
  // Performance thresholds
  performance: {
    walletGeneration: 5000,      // MS
    balanceCheck: 1000,         // MS
    transactionSend: 3000       // MS
  },
  
  // Usage limits
  limits: {
    apiCallsPerMinute: 60,
    walletsPerIP: 10,
    transactionsPerDay: 100
  }
};
```

---

## 🎯 Business Logic Summary

1. **Always validate** before processing
2. **Never store** sensitive data
3. **Follow fee markets** for optimal confirmation
4. **Respect minimums** to avoid dust
5. **Handle errors gracefully** with user-friendly messages
6. **Maintain privacy** while ensuring security
7. **Document decisions** for future reference

These rules ensure MOOSH Wallet operates professionally, securely, and in compliance with best practices for cryptocurrency wallets.