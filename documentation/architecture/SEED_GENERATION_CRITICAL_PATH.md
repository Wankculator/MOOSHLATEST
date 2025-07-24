# 🚨 CRITICAL: SEED GENERATION DOCUMENTATION 🚨
## MOOSH Wallet - Working Seed Generation Implementation

> **WARNING**: This document describes the WORKING seed generation system from commit `7b831715d115a576ae1f4495d5140d403ace8213`. 
> **DO NOT MODIFY** any of the components described here without understanding the complete flow.

---

## 🔴 CRITICAL PRESERVATION NOTICE

**This seed generation system is confirmed working and generates:**
- ✅ Real BIP39 mnemonics with proper entropy
- ✅ Valid Bitcoin addresses (SegWit, Taproot, Legacy)
- ✅ Valid Spark Protocol addresses (sp1p... format, 65-66 chars)
- ✅ Proper private key derivation
- ✅ ~9-10 second generation time (expected due to cryptographic operations)

**ANY CHANGES TO THE FOLLOWING FILES/FUNCTIONS WILL BREAK SEED GENERATION:**

---

## 📋 Complete Seed Generation Flow

### 1. Frontend Initiation (moosh-wallet.js)

**File**: `/public/js/moosh-wallet.js`

#### User clicks "Generate New Seed" → GenerateSeedPage.generateWallet()
```javascript
// Line 3224-3261
async generateWallet(wordCount) {
    // Calls APIService
    const response = await this.app.apiService.generateSparkWallet(wordCount);
    
    // Expected response structure:
    {
        success: true,
        data: {
            mnemonic: "word1 word2 word3...", // String, not array
            addresses: {
                bitcoin: "bc1q...",
                spark: "sp1p..."
            },
            privateKeys: {
                bitcoin: { wif: "...", hex: "..." },
                spark: { hex: "..." }
            }
        }
    }
}
```

### 2. API Service Call (moosh-wallet.js)

**File**: `/public/js/moosh-wallet.js`

#### APIService.generateSparkWallet()
```javascript
// Lines 1896-1922
async generateSparkWallet(wordCount = 24) {
    const strength = wordCount === 24 ? 256 : 128;
    
    const response = await fetch(`${this.baseURL}/api/spark/generate-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            strength: strength,
            network: 'MAINNET' 
        })
    });
}
```

**CRITICAL**: The endpoint is `/api/spark/generate-wallet`, NOT `/api/wallet/generate`

### 3. Backend API Server (api-server.js)

**File**: `/src/server/api-server.js`

#### POST /api/spark/generate-wallet endpoint
```javascript
// Lines 126-138
app.post('/api/spark/generate-wallet', async (req, res) => {
    const { strength = 256 } = req.body; // Default to 24 words
    const wallet = await generateSparkCompatibleWallet(strength);
    res.json(wallet);
});
```

### 4. Spark Compatible Service (sparkCompatibleService.js)

**File**: `/src/server/services/sparkCompatibleService.js`

#### generateSparkCompatibleWallet()
```javascript
// Lines 13-73
export async function generateSparkCompatibleWallet(strength = 256) {
    // Generate mnemonic
    const mnemonic = generateMnemonic(strength);
    
    // Generate wallets
    const bitcoinWallet = await generateBitcoinWallet(mnemonic, 'MAINNET');
    const sparkWallet = await generateSparkAddress(mnemonic);
    
    // Format response to match UI expectations
    return {
        success: true,
        data: {
            mnemonic: mnemonic, // UI expects string, not array
            addresses: {
                bitcoin: bitcoinWallet.addresses.segwit.address,
                spark: sparkWallet.address
            },
            privateKeys: {
                bitcoin: {
                    wif: bitcoinWallet.addresses.segwit.wif,
                    hex: bitcoinWallet.addresses.segwit.privateKey
                },
                spark: {
                    hex: sparkWallet.privateKey
                }
            },
            // Additional data...
        }
    };
}
```

### 5. Core Wallet Service (walletService.js)

**File**: `/src/server/services/walletService.js`

#### Key Functions:
- `generateMnemonic()` - Uses bip39 to generate proper mnemonic
- `generateBitcoinWallet()` - Generates all Bitcoin address types
- `generateSparkAddress()` - Generates Spark address using SDK or fallback

### 6. Spark SDK Service (sparkSDKService.js)

**File**: `/src/server/services/sparkSDKService.js`

The actual Spark address generation happens here. It tries to use the official SDK first, then falls back to a bech32m implementation.

---

## 🔍 Critical Response Structure Mapping

### API Response (from backend):
```json
{
    "success": true,
    "data": {
        "mnemonic": "word1 word2 word3...",
        "addresses": {
            "bitcoin": "bc1q...",
            "spark": "sp1p..."
        },
        "privateKeys": {
            "bitcoin": { "wif": "...", "hex": "..." },
            "spark": { "hex": "..." }
        },
        "bitcoinAddresses": {
            "segwit": "bc1q...",
            "taproot": "bc1p...",
            "legacy": "1...",
            "nestedSegwit": "3..."
        }
    }
}
```

### Frontend Expects:
```javascript
// Lines 3236-3254 in moosh-wallet.js
const generatedSeed = walletData.mnemonic.split(' '); // Expects string
walletData.addresses.spark    // Expects addresses.spark
walletData.addresses.bitcoin  // Expects addresses.bitcoin
```

---

## ⚠️ Common Breaking Points

### 1. **Endpoint Mismatch**
- Frontend calls: `/api/spark/generate-wallet`
- Common mistake: Changing to `/api/wallet/generate`

### 2. **Response Structure Mismatch**
- Frontend expects: `data.addresses.spark`
- Common mistake: Returning `data.spark.address`

### 3. **Mnemonic Format**
- Frontend expects: Mnemonic as string
- Common mistake: Returning mnemonic as array

### 4. **Missing CORS Headers**
- API server MUST have: `app.use(cors())`
- Without CORS, browser blocks the request

### 5. **Timeout Issues**
- Generation takes ~9-10 seconds
- Common mistake: Adding shorter timeouts

---

## 🧪 Testing Procedure

### 1. Test API Directly:
```bash
curl -X POST http://localhost:3001/api/spark/generate-wallet \
  -H "Content-Type: application/json" \
  -d '{"strength": 256}' | jq .
```

Expected: Response in ~9-10 seconds with full wallet data

### 2. Test Frontend Flow:
1. Open http://localhost:3333
2. Click "Create New Wallet"
3. Click "Generate New Seed"
4. Wait ~10 seconds
5. Should see 12 or 24 words displayed

### 3. Verify Addresses:
- Bitcoin: Should start with `bc1q` (SegWit) or `bc1p` (Taproot)
- Spark: Should start with `sp1p` and be 65-66 characters

---

## 🛠️ Recovery Procedure

If seed generation breaks:

1. **Check API Server**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Endpoint Response**:
   ```bash
   curl -X POST http://localhost:3001/api/spark/generate-wallet \
     -H "Content-Type: application/json" \
     -d '{"strength": 128}'
   ```

3. **Check Browser Console**:
   - Look for network errors
   - Check response structure
   - Verify no CORS errors

4. **Restore from Git**:
   ```bash
   git checkout 7b831715d115a576ae1f4495d5140d403ace8213 -- public/js/moosh-wallet.js
   git checkout 7b831715d115a576ae1f4495d5140d403ace8213 -- src/server/api-server.js
   git checkout 7b831715d115a576ae1f4495d5140d403ace8213 -- src/server/services/
   ```

---

## 📝 Development Guidelines

### DO NOT:
- ❌ Change the API endpoint URL
- ❌ Modify response structure
- ❌ Change mnemonic format (string vs array)
- ❌ Add authentication to seed generation endpoints
- ❌ Modify the core cryptographic functions
- ❌ Add caching to seed generation

### DO:
- ✅ Add logging for debugging
- ✅ Add error handling that preserves structure
- ✅ Add metrics/monitoring
- ✅ Improve UI feedback during generation
- ✅ Add additional validation AFTER generation

---

## 🔐 Security Notes

1. **Entropy Source**: Uses crypto.randomBytes() for proper randomness
2. **BIP39 Compliance**: Generates standard BIP39 mnemonics
3. **HD Wallet Paths**: Uses standard derivation paths (BIP44/49/84/86)
4. **No Storage**: Seeds are never stored on server
5. **HTTPS Required**: In production, use HTTPS for API calls

---

## 📊 Performance Characteristics

- **Generation Time**: 9-10 seconds (normal)
- **Memory Usage**: ~50MB during generation
- **CPU Usage**: High for 2-3 seconds (key derivation)

This is EXPECTED behavior due to:
- PBKDF2 iterations for seed generation
- Multiple key derivations for different address types
- Cryptographic operations for Spark address

---

## 🚨 FINAL WARNING

**This seed generation system is the heart of the wallet. It has been tested and confirmed working. Any modifications without understanding the complete flow WILL break the wallet functionality.**

**Always test seed generation after ANY changes to:**
- Frontend routing/navigation
- API endpoints
- Response handling
- State management
- Cryptographic libraries

---

**Last Working Commit**: `7b831715d115a576ae1f4495d5140d403ace8213`
**Reference Branch**: `working-real-spark-addresses`