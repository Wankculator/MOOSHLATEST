# 🗺️ MOOSH Wallet Visual System Architecture
**Last Updated**: 2025-07-21
**Purpose**: Comprehensive visual ASCII diagrams for AI understanding

## 📊 Master System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    MOOSH WALLET ECOSYSTEM                                │
│                              Professional Bitcoin & Spark Wallet                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🖥️ FRONTEND LAYER (Port 3333)                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────────┐    ┌─────────────────────────┐    ┌───────────────────┐ │
│  │   🏠 HomePage            │    │  🔑 GenerateSeedPage    │    │ 📊 DashboardPage  │ │
│  │  Lines: 6191-6250        │───▶│  Lines: 1896-1922       │───▶│ Lines: 13700+    │ │
│  │  • Welcome Screen        │    │  • Seed Generation      │    │ • Main Interface  │ │
│  │  • Create/Import Options │    │  • Mnemonic Display     │    │ • All Features    │ │
│  └──────────────────────────┘    └─────────────────────────┘    └───────────────────┘ │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          🧩 CORE COMPONENTS                                       │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │  ElementFactory    StateManager    Router         APIService    StyleManager     │  │
│  │  (DOM Creation)    (Global State)  (Navigation)   (HTTP)       (Theming)        │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          💼 FEATURE COMPONENTS                                    │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │  AccountSwitcher   TransactionHistory   MultiWallet    Security    RealTimePrice │  │
│  │  Lines: 4319-4560  Lines: 20267-20500   Lines: 18564+ Lines: N/A  Lines: N/A    │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                     ▼ API Calls ▼                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    🔽 HTTP/HTTPS 🔽

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🚀 API LAYER (Port 3001)                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────────┐    ┌─────────────────────────┐    ┌───────────────────┐ │
│  │   API Gateway            │    │  Route Handlers         │    │  Middleware       │ │
│  │  /src/server/api-server  │───▶│  • /api/spark/*        │───▶│ • CORS           │ │
│  │  Express.js Application  │    │  • /api/bitcoin/*      │    │ • Rate Limiting   │ │
│  │                          │    │  • /api/ordinals/*     │    │ • Error Handling  │ │
│  └──────────────────────────┘    └─────────────────────────┘    └───────────────────┘ │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          🔧 SERVICE LAYER                                         │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │  WalletService         SparkService        NetworkService      SecurityService   │  │
│  │  • Seed Generation     • Spark Addresses   • Balance Fetch     • Validation      │  │
│  │  • Key Derivation      • SDK Integration   • TX History        • Sanitization    │  │
│  │  • Address Types       • Fallback Logic    • Broadcasting      • Crypto Ops      │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                     ▼ External APIs ▼                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    🔽 HTTPS Only 🔽

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ⛓️ BLOCKCHAIN LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────────┐    ┌─────────────────────────┐    ┌───────────────────┐ │
│  │   Bitcoin Network        │    │  Spark Protocol         │    │  Price Oracles    │ │
│  │  • Mainnet/Testnet       │    │  • Layer 2 Solution     │    │  • CoinGecko      │ │
│  │  • Multiple Providers    │    │  • Fast Transactions    │    │  • Binance        │ │
│  │  • Mempool.space         │    │  • Low Fees             │    │  • Kraken         │ │
│  │  • Blockstream.info      │    │  • SDK Integration      │    │                   │ │
│  └──────────────────────────┘    └─────────────────────────┘    └───────────────────┘ │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          📜 ORDINALS & INSCRIPTIONS                               │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │  Hiro API              Ordinals.com           Ordiscan            Custom APIs     │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. Wallet Generation Flow (Critical Path)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              WALLET GENERATION FLOW                                     │
│                         ⚠️ CRITICAL - DO NOT MODIFY ⚠️                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

USER                    FRONTEND                    API                     SERVICES
 │                         │                         │                         │
 │  Click "Generate"       │                         │                         │
 ├────────────────────────▶│                         │                         │
 │                         │  Show Loading            │                         │
 │                         ├─────────────────────────▶                         │
 │                         │  POST /api/spark/       │                         │
 │                         │  generate-wallet        │                         │
 │                         │  {strength: 256}        │                         │
 │                         │                         ├────────────────────────▶│
 │                         │                         │  walletService.        │
 │                         │                         │  generateWallet()      │
 │                         │                         │                        │
 │                         │                         │                        ├──┐
 │                         │                         │                        │  │ Generate
 │                         │                         │                        │  │ Entropy
 │                         │                         │                        │◀─┘ (crypto)
 │                         │                         │                        │
 │                         │                         │                        ├──┐
 │                         │                         │                        │  │ Create
 │                         │                         │                        │  │ Mnemonic
 │                         │                         │                        │◀─┘ (BIP39)
 │                         │                         │                        │
 │                         │                         │                        ├──┐
 │                         │                         │                        │  │ Derive
 │                         │                         │                        │  │ Keys &
 │                         │                         │                        │  │ Addresses
 │                         │                         │                        │◀─┘ (BIP32/44)
 │                         │                         │                        │
 │                         │                         │◀───────────────────────┤
 │                         │                         │  {                     │
 │                         │                         │    mnemonic: "word..",│
 │                         │                         │    addresses: {...},  │
 │                         │                         │    privateKeys: {...} │
 │                         │                         │  }                     │
 │                         │◀────────────────────────┤                        │
 │                         │  JSON Response          │                        │
 │                         │  (10-60 seconds)        │                        │
 │                         │                         │                        │
 │◀────────────────────────┤                         │                        │
 │  Display Seed Phrase    │                         │                        │
 │  Show Addresses         │                         │                        │
 │  Enable Copy/Save       │                         │                        │
 │                         │                         │                        │

CRITICAL POINTS:
• Frontend timeout: 60+ seconds (Line 1896-1922)
• Endpoint MUST be: /api/spark/generate-wallet (Line 126 api-server.js)
• Response format MUST match structure above
• Mnemonic MUST be string, not array
```

### 2. Transaction Send Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRANSACTION SEND FLOW                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘

USER                    FRONTEND                    API                     BLOCKCHAIN
 │                         │                         │                         │
 │  Click "Send"           │                         │                         │
 ├────────────────────────▶│                         │                         │
 │                         │  Show SendModal         │                         │
 │                         ├──┐                      │                         │
 │  Enter Details          │  │ Validate:            │                         │
 │  • To Address           │  │ • Address Format     │                         │
 │  • Amount               │  │ • Amount > 0         │                         │
 │  • Fee Rate             │  │ • Balance Check      │                         │
 │◀────────────────────────┤◀─┘                      │                         │
 │                         │                         │                         │
 │  Click "Confirm"        │                         │                         │
 ├────────────────────────▶│                         │                         │
 │                         │  Build Transaction      │                         │
 │                         ├─────────────────────────▶                         │
 │                         │  POST /api/transaction/ │                         │
 │                         │  create                 │                         │
 │                         │                         ├──┐                      │
 │                         │                         │  │ Build PSBT          │
 │                         │                         │  │ Calculate Fees      │
 │                         │                         │  │ Select UTXOs        │
 │                         │                         │◀─┘                      │
 │                         │◀────────────────────────┤                        │
 │                         │  Unsigned TX            │                        │
 │                         │                         │                        │
 │                         ├──┐                      │                        │
 │                         │  │ Sign with            │                        │
 │                         │  │ Private Key          │                        │
 │                         │◀─┘ (Client-side)        │                        │
 │                         │                         │                        │
 │  Review & Approve       │                         │                        │
 ├────────────────────────▶│                         │                        │
 │                         │  Broadcast Transaction  │                        │
 │                         ├─────────────────────────▶                        │
 │                         │  POST /api/transaction/ │                        │
 │                         │  broadcast              │                        │
 │                         │                         ├───────────────────────▶│
 │                         │                         │  Submit to Network    │
 │                         │                         │                       │
 │                         │                         │◀──────────────────────┤
 │                         │                         │  TXID: abc123...      │
 │                         │◀────────────────────────┤                       │
 │                         │  Success + TXID         │                       │
 │◀────────────────────────┤                         │                       │
 │  Show Success           │                         │                       │
 │  Display TXID           │                         │                       │
 │  Update Balance         │                         │                       │

KEY COMPONENTS:
• SendModal: Lines ~15000-16000
• Transaction validation: Client-side first
• PSBT construction: Server-side
• Signing: Client-side only (security)
• Broadcasting: Server proxies to blockchain
```

### 3. State Management Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE MANAGEMENT FLOW                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  StateManager   │
                              │  (Global State) │
                              └────────┬────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
        │ currentWallet │    │   wallets[]   │    │  preferences  │
        │               │    │               │    │               │
        │ • address     │    │ • wallet1     │    │ • theme       │
        │ • balance     │    │ • wallet2     │    │ • currency    │
        │ • type        │    │ • wallet3     │    │ • network     │
        └───────┬───────┘    └───────┬───────┘    └───────┬───────┘
                │                     │                     │
                └─────────────────────┴─────────────────────┘
                                      │
                              STATE CHANGES
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        │                                                           │
        ▼                                                           ▼
EVENT EMISSION                                              COMPONENT UPDATES
app.events.emit('walletChanged', wallet)                   
        │                                                           │
        ├──▶ BalanceDisplay.onWalletChange()                       │
        ├──▶ TransactionList.onWalletChange()                      │
        ├──▶ AddressDisplay.onWalletChange()                       │
        └──▶ AccountDropdown.onWalletChange()                      │
                                                                    │
                                                            RE-RENDER
                                                                    │
                                                         ┌──────────▼──────────┐
                                                         │  DOM Updates via    │
                                                         │  ElementFactory     │
                                                         └───────────────────┘

STATE UPDATE PATTERN:
1. Action triggers state change
2. StateManager updates internal state
3. StateManager emits event
4. Subscribed components receive event
5. Components update their view
6. ElementFactory efficiently updates DOM
```

### 4. Security Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              🔐 CLIENT-SIDE SECURITY                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐ │
│  │  Key Generation      │    │  Key Storage        │    │  Key Usage               │ │
│  │                      │    │                     │    │                          │ │
│  │  • crypto.random()   │───▶│  • Memory only      │───▶│  • Sign transactions     │ │
│  │  • BIP39 compliance  │    │  • No persistence   │    │  • Derive addresses      │ │
│  │  • Client-side only  │    │  • Session lifetime │    │  • Encrypt/decrypt       │ │
│  └──────────────────────┘    └─────────────────────┘    └──────────────────────────┘ │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          INPUT VALIDATION                                         │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │  • Address format validation (regex + checksum)                                   │  │
│  │  • Amount validation (positive, within balance)                                   │  │
│  │  • Mnemonic validation (BIP39 wordlist check)                                    │  │
│  │  • XSS prevention (no innerHTML with user data)                                   │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    🔽 HTTPS/WSS 🔽

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              🛡️ TRANSPORT SECURITY                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  • HTTPS enforced in production                                                          │
│  • CORS properly configured                                                             │
│  • Rate limiting (100 req/min)                                                          │
│  • Request size limits                                                                  │
│  • API key rotation support                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    🔽 Validated 🔽

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              🏰 SERVER-SIDE SECURITY                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐ │
│  │  Stateless Design    │    │  Input Sanitization │    │  Secure Operations      │ │
│  │                      │    │                     │    │                          │ │
│  │  • No key storage    │    │  • SQL injection    │    │  • Crypto operations     │ │
│  │  • No user sessions  │    │  • XSS prevention   │    │  • Secure randomness     │ │
│  │  • No sensitive data │    │  • Path traversal   │    │  • Constant-time ops    │ │
│  └──────────────────────┘    └─────────────────────┘    └──────────────────────────┘ │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                          AUDIT & MONITORING                                       │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │  • Request logging (no sensitive data)                                            │  │
│  │  • Error tracking (sanitized)                                                     │  │
│  │  • Performance monitoring                                                         │  │
│  │  • Anomaly detection                                                             │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

SECURITY PRINCIPLES:
• Defense in depth (multiple layers)
• Principle of least privilege
• Zero trust architecture
• Fail securely (deny by default)
• Regular security audits
```

## 📐 Component Relationship Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT DEPENDENCY MATRIX                                      │
├─────────────────────┬───────────────┬────────────────┬─────────────┬─────────────────┤
│     Component       │ Depends On    │ Used By        │ Events      │ State Keys      │
├─────────────────────┼───────────────┼────────────────┼─────────────┼─────────────────┤
│ DashboardPage       │ • Router      │ • App          │ • pageLoad  │ • currentWallet │
│                     │ • StateManager│                │ • refresh   │ • wallets       │
│                     │ • APIService  │                │             │ • preferences   │
├─────────────────────┼───────────────┼────────────────┼─────────────┼─────────────────┤
│ AccountSwitcher     │ • StateManager│ • Dashboard    │ • walletChange│ • currentWallet│
│ Lines: 4319-4560    │ • Router      │ • Navigation   │ • accountAdd │ • wallets      │
│                     │               │                │              │                 │
├─────────────────────┼───────────────┼────────────────┼─────────────┼─────────────────┤
│ BalanceDisplay      │ • APIService  │ • Dashboard    │ • balanceUpdate│ • balance     │
│ Lines: 9114-9200    │ • StateManager│ • WalletCard   │ • priceUpdate │ • prices       │
│                     │               │                │               │                │
├─────────────────────┼───────────────┼────────────────┼─────────────┼─────────────────┤
│ TransactionList     │ • APIService  │ • Dashboard    │ • txUpdate   │ • transactions  │
│ Lines: 20267-20500  │ • StateManager│ • TxModal      │ • newTx      │ • currentWallet │
│                     │               │                │              │                 │
├─────────────────────┼───────────────┼────────────────┼─────────────┼─────────────────┤
│ SendModal           │ • APIService  │ • QuickActions │ • sendStart  │ • currentWallet │
│ Lines: ~15000-16000 │ • StateManager│ • Dashboard    │ • sendComplete│ • balance      │
│                     │ • Router      │                │ • sendError  │                 │
├─────────────────────┼───────────────┼────────────────┼─────────────┼─────────────────┤
│ MultiAccountModal   │ • StateManager│ • AccountSwitcher│ • show     │ • wallets       │
│ Lines: 18564-19600  │ • APIService  │                │ • hide       │ • currentWallet │
│                     │               │                │ • create     │                 │
└─────────────────────┴───────────────┴────────────────┴─────────────┴─────────────────┘
```

## 🔍 API Endpoint Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINT STRUCTURE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

/api
│
├── /health                           GET     → System health check
│
├── /spark
│   ├── /generate-wallet             POST    → Generate Spark + Bitcoin wallet ⚠️
│   └── /import                      POST    → Import existing Spark wallet
│
├── /bitcoin
│   ├── /balance/:address            GET     → Get Bitcoin balance
│   ├── /transactions/:address       GET     → Get transaction history
│   ├── /utxos/:address             GET     → Get unspent outputs
│   ├── /fees                       GET     → Current fee estimates
│   └── /price                      GET     → BTC/USD price
│
├── /transaction
│   ├── /create                     POST    → Build unsigned transaction
│   ├── /sign                       POST    → Sign transaction (client-side)
│   └── /broadcast                  POST    → Broadcast to network
│
├── /ordinals
│   ├── /inscriptions/:address      GET     → Get Ordinals/inscriptions
│   └── /metadata/:inscriptionId    GET     → Get inscription metadata
│
└── /network
    ├── /status                     GET     → Network connection status
    └── /info                       GET     → Network information

Each endpoint returns:
{
  "success": boolean,
  "data": {...} | null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error"
  } | null,
  "meta": {
    "timestamp": "ISO 8601",
    "version": "1.0.0"
  }
}
```

## 📝 Quick Reference Guide

### Critical Files & Line Numbers
- **Main App**: `/public/js/moosh-wallet.js` (33,000+ lines)
- **API Server**: `/src/server/api-server.js`
- **Seed Generation Frontend**: Lines 1896-1922, 3224-3261
- **Account Switcher**: Lines 4319-4560
- **Balance Display**: Lines 9114-9200
- **Transaction History**: Lines 20267-20500
- **Multi-Account Modal**: Lines 18564-19600

### Never Modify Without Reading Docs
- Seed generation endpoints
- Response data structures
- State management patterns
- Security implementations

### Common Integration Points
- StateManager for all persistent data
- APIService for all backend calls
- ElementFactory for all DOM creation
- Router for all navigation

---

**This visual architecture document provides comprehensive diagrams for understanding MOOSH Wallet's structure at a glance.**