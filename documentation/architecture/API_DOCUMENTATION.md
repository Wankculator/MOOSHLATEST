# MOOSH Wallet API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
Currently, the API does not require authentication. In production, implement OAuth2 or API keys.

## Endpoints

### Health Check

#### GET /health
Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "service": "MOOSH Wallet API",
  "version": "2.0.0",
  "timestamp": "2025-01-14T12:00:00.000Z"
}
```

---

### Wallet Generation

#### POST /api/spark/generate-wallet
Generate a new wallet with Bitcoin and Spark Protocol addresses.

**Request Body:**
```json
{
  "strength": 256  // 128 for 12 words, 256 for 24 words
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mnemonic": "word1 word2 word3...",
    "addresses": {
      "bitcoin": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "spark": "sp1pgss95lze9m3eqvls7us6xz7yz5txu6p49h244wxutckly8sdxupf4v3veny2p"
    },
    "privateKeys": {
      "bitcoin": {
        "wif": "L1234...",
        "hex": "abcdef..."
      },
      "spark": {
        "hex": "123456..."
      }
    },
    "bitcoinAddresses": {
      "segwit": "bc1q...",
      "taproot": "bc1p...",
      "legacy": "1ABC...",
      "nestedSegwit": "3DEF..."
    },
    "wordCount": 24
  }
}
```

---

### Wallet Import

#### POST /api/spark/import
Import an existing wallet using a seed phrase.

**Request Body:**
```json
{
  "mnemonic": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
}
```

**Response:** Same format as generate-wallet

---

### Balance Check

#### GET /api/balance/:address
Get the balance for a Bitcoin or Spark address.

**Parameters:**
- `address` (string): Bitcoin or Spark address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "balance": "0.00128000",
    "unconfirmed": "0.00000000",
    "total": "0.00128000",
    "currency": "BTC",
    "txCount": 5
  }
}
```

---

### Transaction History

#### GET /api/transactions/:address
Get transaction history for an address.

**Parameters:**
- `address` (string): Bitcoin or Spark address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "transactions": [
      {
        "hash": "abc123...",
        "amount": "0.001",
        "type": "receive",
        "timestamp": "2025-01-14T12:00:00.000Z",
        "confirmations": 6
      }
    ],
    "count": 1
  }
}
```

---

### Multi-Signature Setup

#### POST /api/spark/setup-multisig
Create a multi-signature address.

**Request Body:**
```json
{
  "threshold": 2,
  "pubkeys": [
    "pubkey1...",
    "pubkey2...",
    "pubkey3..."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "3ABC...",
    "redeemScript": "52210...",
    "threshold": 2,
    "totalKeys": 3
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

API requests are limited to:
- 100 requests per minute per IP
- 1000 requests per hour per IP

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

## CORS

CORS is enabled for:
- `http://localhost:8080`
- `http://localhost:3000`

Configure additional origins in `.env` file.

---

## Webhooks (Future)

Webhook support for:
- Balance changes
- New transactions
- Multi-sig signature requests

---

## SDKs

Official SDKs:
- JavaScript/TypeScript (planned)
- Python (planned)
- Go (planned)

---

## Support

For API support:
- GitHub Issues: https://github.com/Wankculator/Moosh/issues
- Email: api@mooshwallet.com