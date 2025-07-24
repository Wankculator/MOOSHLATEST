# Seed Generation Implementation Guide for MOOSH Wallet

## 🚨 CRITICAL: This Document Supersedes All Others for Seed Generation

**Last Updated**: July 12, 2025  
**Working Branch Reference**: `working-real-spark-addresses`  
**Commit Hash**: `7b831715d115a576ae1f4495d5140d403ace8213`

## Overview

This document provides the definitive guide for implementing and maintaining the seed generation functionality in MOOSH Wallet. The implementation MUST follow the exact pattern established in the `working-real-spark-addresses` branch.

## Critical Requirements

### 1. NEVER MODIFY These Core Files

- `/src/server/services/sparkSDKService.js` - Uses official @buildonspark/spark-sdk
- `/src/server/services/walletService.js` - Calls sparkSDKService for generation
- `/src/server/services/sparkCompatibleService.js` - Formats responses for UI

### 2. Expected Behavior

- **Generation Time**: 10-60 seconds (depends on Spark Protocol server response)
- **Frontend Timeout**: Must be at least 60 seconds
- **Progress Display**: Shows 0-95% during generation, completes to 100% on success

### 3. API Endpoint Structure

The endpoint MUST remain:
```
POST /api/spark/generate-wallet
```

Request body:
```json
{
  "strength": 128  // 128 for 12 words, 256 for 24 words
}
```

Response structure:
```json
{
  "success": true,
  "data": {
    "mnemonic": "word1 word2 word3...",  // String, NOT array
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
    },
    "allPrivateKeys": { /* all key types */ }
  }
}
```

## Implementation Details

### Backend Flow

1. **API Server** (`/src/server/api-server.js`):
   ```javascript
   app.post('/api/spark/generate-wallet', async (req, res) => {
     const { strength = 256 } = req.body;
     const wallet = await generateSparkCompatibleWallet(strength);
     res.json(wallet);
   });
   ```

2. **Spark Compatible Service** (`/src/server/services/sparkCompatibleService.js`):
   ```javascript
   export async function generateSparkCompatibleWallet(strength = 256) {
     const mnemonic = generateMnemonic(strength);
     const bitcoinWallet = await generateBitcoinWallet(mnemonic, 'MAINNET');
     const sparkWallet = await generateSparkAddress(mnemonic);
     // Returns formatted response
   }
   ```

3. **Wallet Service** (`/src/server/services/walletService.js`):
   ```javascript
   export async function generateSparkAddress(mnemonic) {
     const sparkSDK = require('./sparkSDKService.js');
     const result = await sparkSDK.generateSparkFromMnemonic(mnemonic);
     // Returns spark address data
   }
   ```

4. **Spark SDK Service** (`/src/server/services/sparkSDKService.js`):
   - Uses `@buildonspark/spark-sdk` when available
   - Falls back to bech32m generation if SDK unavailable
   - **IMPORTANT**: SDK initialization can take 10-60 seconds

### Frontend Implementation

1. **API Service** (`/public/js/moosh-wallet.js`):
   ```javascript
   async generateSparkWallet(wordCount = 24) {
     const strength = wordCount === 24 ? 256 : 128;
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
     
     const response = await fetch(`${this.baseURL}/api/spark/generate-wallet`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ strength, network: 'MAINNET' }),
       signal: controller.signal
     });
     
     clearTimeout(timeoutId);
     return await response.json();
   }
   ```

2. **Progress Animation**:
   - Shows progress from 0-95% during generation
   - Stays at 95% until API responds
   - Completes to 100% on success
   - DO NOT modify to skip or speed up

## Common Issues and Solutions

### Issue 1: "Request timeout - seed generation is taking longer than expected"

**Cause**: SDK taking longer than frontend timeout  
**Solution**: Ensure frontend timeout is at least 60 seconds

### Issue 2: Progress stuck at 95%

**Cause**: This is normal behavior while waiting for SDK  
**Solution**: Wait for SDK to complete (10-60 seconds)

### Issue 3: Fast generation (< 5 seconds)

**Cause**: Using fallback instead of real SDK  
**Solution**: Check if `@buildonspark/spark-sdk` is properly installed

## Testing Seed Generation

1. **Test via API**:
   ```bash
   time curl -X POST http://localhost:3001/api/spark/generate-wallet \
     -H "Content-Type: application/json" \
     -d '{"strength": 128}'
   ```

2. **Expected timing**:
   - With SDK: 10-60 seconds
   - Fallback only: < 1 second

3. **Verify response structure** matches the format above

## What NOT to Do

❌ **NEVER** modify sparkSDKService.js to skip SDK initialization  
❌ **NEVER** reduce timeouts below 60 seconds  
❌ **NEVER** change the API endpoint URL  
❌ **NEVER** modify response structure  
❌ **NEVER** return mnemonic as array (must be string)  
❌ **NEVER** remove the progress animation at 95%

## Recovery Instructions

If seed generation breaks:

1. **Check this guide first**
2. **Restore from working branch**:
   ```bash
   git checkout working-real-spark-addresses -- src/server/services/sparkSDKService.js
   git checkout working-real-spark-addresses -- src/server/services/walletService.js
   git checkout working-real-spark-addresses -- src/server/services/sparkCompatibleService.js
   ```
3. **Ensure frontend timeout is 60+ seconds**
4. **Test with curl command above**

## Related Documentation

- `/docs/SEED_GENERATION_CRITICAL_PATH.md` - Original critical path doc
- `/AI_DEVELOPMENT_GUIDELINES.md` - AI assistant guidelines  
- `/05_DOCUMENTATION/MASTER_PROMPT_NEEDED.md` - Comprehensive AI development prompt with shortcuts and validation

### Using the Master Prompt for Seed Generation Tasks

When making complex changes to seed generation:
1. Load the MASTER_PROMPT_NEEDED.md as system context
2. Use `qsec` to audit security implications
3. Use `qtest` to generate comprehensive tests
4. Use `qcheck` to validate against all checklists

---

**Remember**: The seed generation MUST work exactly as implemented in the `working-real-spark-addresses` branch. Any optimization that changes the core behavior is NOT acceptable.