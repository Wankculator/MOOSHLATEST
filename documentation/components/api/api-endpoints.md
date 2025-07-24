# MOOSH Wallet API Endpoints Documentation

## API Server Overview
- **File**: `/src/server/api-server.js`
- **Port**: 3001
- **Base URL**: `http://localhost:3001` (development)
- **CORS**: Enabled for localhost ports 3000, 3001, 3333, 5173

## Critical Endpoints

### 1. Generate Spark Wallet
**CRITICAL: This endpoint MUST NOT be modified**

#### Endpoint
```
POST /api/spark/generate-wallet
```

#### Location
- **Lines**: 126-140 (primary endpoint)
- **Handler**: Uses `generateSparkCompatibleWallet` from sparkCompatibleService

#### Request
```json
{
    "strength": 256  // 128 for 12 words, 256 for 24 words
}
```

#### Response
```json
{
    "success": true,
    "data": {
        "mnemonic": "word1 word2 word3...",  // STRING format, NOT array
        "addresses": {
            "bitcoin": "bc1q...",
            "spark": "sp1q..."
        },
        "privateKeys": {
            "bitcoin": {
                "wif": "L1...",
                "hex": "0x..."
            },
            "spark": {
                "hex": "0x..."
            }
        }
    }
}
```

#### Important Notes
- Timeout: 60 seconds (SDK initialization can be slow)
- Returns mnemonic as STRING, not array
- This endpoint is used by GenerateSeedPage component
- Breaking changes will break wallet generation

### 2. Generate Bitcoin Wallet
#### Endpoint
```
POST /api/wallet/generate
```

#### Location
- **Lines**: 92-141

#### Request
```json
{
    "wordCount": 12,  // or 24
    "network": "MAINNET"  // or "TESTNET"
}
```

#### Response
```json
{
    "success": true,
    "data": {
        "mnemonic": ["word1", "word2", ...],  // Array format
        "wordCount": 12,
        "network": "MAINNET",
        "bitcoin": {
            "addresses": {
                "segwit": "bc1q...",
                "taproot": "bc1p...",
                "legacy": "1...",
                "nestedSegwit": "3..."
            },
            "paths": {
                "segwit": "m/84'/0'/0'/0/0",
                "taproot": "m/86'/0'/0'/0/0",
                "legacy": "m/44'/0'/0'/0/0",
                "nestedSegwit": "m/49'/0'/0'/0/0"
            },
            "privateKeys": {
                "segwit": "...",
                "taproot": "...",
                "legacy": "...",
                "nestedSegwit": "..."
            },
            "xpub": "xpub..."
        },
        "spark": {
            "address": "sp1...",
            "publicKey": "...",
            "privateKey": "..."
        }
    }
}
```

### 3. Import Wallet
#### Endpoint
```
POST /api/wallet/import
```

#### Location
- **Lines**: 144-198

#### Request
```json
{
    "mnemonic": "word1 word2 word3...",  // String or array
    "network": "MAINNET",
    "walletType": "auto-detected"
}
```

#### Response
Same structure as generate endpoint, but includes detected wallet type.

### 4. Get Balance
#### Endpoint
```
GET /api/balance/:address
```

#### Location
- **Lines**: 315-326

#### Response
```json
{
    "success": true,
    "balance": {
        "confirmed": 100000000,  // Satoshis
        "unconfirmed": 0
    }
}
```

### 5. Get Transactions
#### Endpoint
```
GET /api/transactions/:address
```

#### Location
- **Lines**: 329-340

#### Response
```json
{
    "success": true,
    "transactions": [
        {
            "txid": "...",
            "confirmations": 6,
            "value": 100000000,
            "timestamp": 1234567890
        }
    ]
}
```

### 6. Ordinals Inscriptions
#### Endpoint
```
POST /api/ordinals/inscriptions
```

#### Location
- **Lines**: 430-778

#### Request
```json
{
    "address": "bc1p..."  // Taproot address only
}
```

#### Response
```json
{
    "success": true,
    "data": {
        "address": "bc1p...",
        "total": 5,
        "inscriptions": [
            {
                "id": "inscription_id",
                "number": 12345,
                "content_type": "image/png",
                "content_length": 1024,
                "timestamp": 1234567890,
                "content": "https://ordinals.com/content/...",
                "preview": "https://ordinals.com/preview/..."
            }
        ],
        "apiUsed": "hiro"
    }
}
```

### 7. Health Check
#### Endpoint
```
GET /health
GET /api/health
```

#### Response
```json
{
    "status": "ok",
    "service": "MOOSH Wallet API",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 8. Session Management
#### Endpoints
```
GET /api/session/check
POST /api/session/create
POST /api/session/destroy
```

#### Location
- **Lines**: 71-89

## Service Dependencies

### walletService.js
- `generateMnemonic(strength)`
- `generateBitcoinWallet(mnemonic, network)`
- `generateSparkAddress(mnemonic)`
- `importWallet(mnemonic, network)`
- `validateAddress(address)`

### sparkCompatibleService.js
- `generateSparkCompatibleWallet(strength)`
- `importSparkCompatibleWallet(mnemonic)`
- `getBalance(address)`
- `getTransactions(address)`

## Error Handling

All endpoints follow consistent error format:
```json
{
    "success": false,
    "error": "Error message here"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad request (missing/invalid parameters)
- 500: Server error

## Security Considerations

1. **CORS**: Currently allows all origins in development
2. **Authentication**: No auth required (non-custodial wallet)
3. **Rate Limiting**: Not implemented (should add for production)
4. **Input Validation**: Basic validation on all endpoints

## Testing Endpoints

### Test wallet generation
```bash
curl -X POST http://localhost:3001/api/spark/generate-wallet \
  -H "Content-Type: application/json" \
  -d '{"strength": 128}'
```

### Test balance check
```bash
curl http://localhost:3001/api/balance/bc1qexampleaddress
```

### Test Ordinals
```bash
curl -X POST http://localhost:3001/api/ordinals/inscriptions \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

## Critical Notes for AI Development

1. **NEVER change** the `/api/spark/generate-wallet` endpoint URL
2. **ALWAYS return** mnemonic as string in Spark endpoints
3. **MAINTAIN** exact response structure for compatibility
4. **RESPECT** 60-second timeout for SDK operations
5. **TEST** all changes with actual frontend before committing

## Git Commands for Recovery

### View original endpoint implementation
```bash
git show 7b831715:src/server/api-server.js | grep -A 20 "/api/spark/generate-wallet"
```

### Find when endpoint was last modified
```bash
git log -p --follow -S "/api/spark/generate-wallet" -- src/server/api-server.js
```

### Restore working version if broken
```bash
git checkout 7b831715 -- src/server/api-server.js
```