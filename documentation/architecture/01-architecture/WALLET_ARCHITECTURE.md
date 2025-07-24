# MOOSH Wallet - Complete Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Technical Stack](#technical-stack)
5. [Features & Functionality](#features--functionality)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [API Endpoints](#api-endpoints)
9. [Frontend Architecture](#frontend-architecture)
10. [Wallet Generation Process](#wallet-generation-process)
11. [Multi-Account System](#multi-account-system)
12. [Balance & Transaction Management](#balance--transaction-management)

---

## Overview

MOOSH Wallet is a professional-grade cryptocurrency wallet supporting both Bitcoin and Spark Protocol. It features a terminal-inspired UI with comprehensive wallet management capabilities.

### Key Characteristics
- **Non-custodial**: Users control their private keys
- **Multi-currency**: Bitcoin (multiple address types) + Spark Protocol
- **Multi-account**: Support for multiple wallets/accounts
- **Real-time balances**: Live blockchain data integration
- **Terminal UI**: Unique terminal-style interface with MOOSH branding

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOOSH WALLET                            │
├─────────────────────────┬───────────────────────────────────────┤
│    Frontend (Client)    │         Backend (Server)              │
├─────────────────────────┼───────────────────────────────────────┤
│                         │                                       │
│  ┌─────────────────┐   │   ┌─────────────────────────────┐   │
│  │   moosh-wallet.js│   │   │      api-server.js          │   │
│  │                 │   │   │                             │   │
│  │  - UI/UX Logic  │◄──┼───┤  - Wallet Generation       │   │
│  │  - State Mgmt   │   │   │  - Address Derivation      │   │
│  │  - DOM Handling │   │   │  - Balance Fetching        │   │
│  │  - Routing      │   │   │  - Blockchain Integration  │   │
│  └─────────────────┘   │   └──────────┬──────────────────┘   │
│                         │              │                       │
│  ┌─────────────────┐   │   ┌──────────▼──────────────────┐   │
│  │   LocalStorage  │   │   │     Service Modules         │   │
│  │                 │   │   │                             │   │
│  │  - Accounts     │   │   │  - walletService.js        │   │
│  │  - Settings     │   │   │  - sparkSDKService.js      │   │
│  │  - Theme        │   │   │  - sparkCompatibleService  │   │
│  └─────────────────┘   │   └─────────────────────────────┘   │
└─────────────────────────┴───────────────────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │   External Services           │
                        │                               │
                        │  - Blockchain APIs           │
                        │  - Spark Protocol SDK        │
                        │  - Price Feeds              │
                        └───────────────────────────────┘
```

---

## Core Components

### 1. Frontend (`/public/js/moosh-wallet.js`)
Single-file pure JavaScript implementation with:
- **No framework dependencies** - Vanilla JS for maximum performance
- **Component-based architecture** - Classes for each UI component
- **Event-driven design** - Custom event system for state changes
- **Reactive state management** - Automatic UI updates on state changes

### 2. Backend (`/src/server/`)
Node.js/Express API server providing:
- **RESTful API** - Clean endpoint design
- **Service layer** - Modular service architecture
- **Blockchain integration** - Multiple fallback APIs
- **Cryptographic operations** - Secure wallet generation

### 3. Service Modules (`/src/server/services/`)
- **walletService.js** - Core wallet operations (BIP39/BIP32)
- **sparkSDKService.js** - Spark Protocol integration
- **sparkCompatibleService.js** - UI-compatible data formatting

---

## Technical Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Cryptography**: 
  - bip39 (mnemonic generation)
  - bip32 (HD wallet derivation)
  - tiny-secp256k1 (elliptic curve)
  - @buildonspark/spark-sdk
- **HTTP Client**: node-fetch
- **Utilities**: cors, dotenv

### Frontend
- **Language**: Pure JavaScript (ES6+)
- **Styling**: CSS3 with CSS Variables
- **Font**: JetBrains Mono
- **Storage**: LocalStorage API
- **No external dependencies**

---

## Features & Functionality

### Wallet Management
1. **Wallet Generation**
   - BIP39 compliant seed phrases (12/24 words)
   - Deterministic key derivation
   - Multiple address types

2. **Address Types Supported**
   - Bitcoin SegWit (bc1q...)
   - Bitcoin Taproot (bc1p...)
   - Bitcoin Legacy (1...)
   - Bitcoin Nested SegWit (3...)
   - Spark Protocol (sp1pgss...)

3. **Import/Export**
   - Seed phrase import
   - Private key display (WIF & HEX)
   - QR code generation

### Multi-Account System
- Create unlimited accounts
- Switch between accounts seamlessly
- Per-account balance tracking
- Account naming and management

### Real-Time Features
- Live balance updates
- Transaction history
- USD price conversion
- Network status indicators

---

## Data Flow

### 1. Wallet Generation Flow
```
User Request → API Server → walletService
                              ↓
                         Generate Entropy
                              ↓
                         Create Mnemonic
                              ↓
                         Derive HD Wallet
                              ↓
                    sparkSDKService (Spark address)
                              ↓
                    Format Response → Client
```

### 2. Balance Check Flow
```
Client Request → API Server → sparkCompatibleService
                                      ↓
                              Check Address Type
                                    ↙     ↘
                          Bitcoin         Spark
                              ↓              ↓
                     Blockchain APIs    Mock Data
                              ↓              ↓
                          Aggregate → Format → Client
```

### 3. Account Switching Flow
```
User Selection → Update State → Save to LocalStorage
                      ↓
              Load Account Data
                      ↓
              Refresh Balances
                      ↓
              Update UI Components
```

---

## Security Architecture

### Client-Side Security
- **No private key storage** in code
- **LocalStorage encryption** consideration
- **XSS protection** via content sanitization
- **HTTPS only** in production

### Server-Side Security
- **Stateless API** - No key storage
- **CORS configuration** - Restrict origins
- **Input validation** - All user inputs validated
- **Rate limiting** recommended

### Cryptographic Security
- **CSPRNG** for entropy generation
- **BIP39/32** standard compliance
- **Secure random** via crypto module
- **No key transmission** over network

---

## API Endpoints

### Wallet Generation
```
POST /api/spark/generate-wallet
Body: { strength: 256 }  // 128 for 12 words, 256 for 24 words
Response: {
  success: true,
  data: {
    mnemonic: "word1 word2...",
    addresses: { bitcoin: "bc1q...", spark: "sp1pgss..." },
    privateKeys: { bitcoin: {...}, spark: {...} }
  }
}
```

### Wallet Import
```
POST /api/spark/import
Body: { mnemonic: "word1 word2..." }
Response: { ...same as generation... }
```

### Balance Check
```
GET /api/balance/:address
Response: {
  success: true,
  data: {
    balance: "0.00128000",
    unconfirmed: "0.00000000",
    currency: "BTC"
  }
}
```

---

## Frontend Architecture

### Component Structure
```
MooshWalletApp (Main Application)
├── StateManager (Reactive State)
├── Router (SPA Navigation)
├── Pages
│   ├── HomePage
│   ├── CreateWalletPage
│   ├── ImportWalletPage
│   ├── DashboardPage
│   └── WalletDetailsPage
├── Components
│   ├── Header
│   ├── Navigation
│   ├── WalletSelector
│   ├── MultiAccountModal
│   ├── SwapModal
│   └── NotificationSystem
└── Services
    ├── WalletService
    ├── APIService
    └── StorageService
```

### State Management
- **Reactive updates** - Automatic UI refresh
- **Event-driven** - Custom event system
- **LocalStorage backed** - Persistent state
- **Memory cache** - Performance optimization

---

## Wallet Generation Process

### 1. Entropy Generation
```javascript
// 256 bits for 24 words, 128 bits for 12 words
const entropy = crypto.randomBytes(strength / 8);
```

### 2. Mnemonic Creation
```javascript
const mnemonic = bip39.entropyToMnemonic(entropy);
// Validates checksum automatically
```

### 3. Seed Generation
```javascript
const seed = bip39.mnemonicToSeedSync(mnemonic);
// 512-bit seed for key derivation
```

### 4. HD Wallet Derivation
```javascript
// Bitcoin addresses
const root = bip32.fromSeed(seed);
const account = root.derivePath("m/84'/0'/0'"); // SegWit
```

### 5. Spark Address Generation
```javascript
// Uses Spark SDK or compatible derivation
const sparkAddress = await generateSparkAddress(mnemonic);
```

---

## Multi-Account System

### Account Structure
```javascript
{
  id: "unique-id",
  name: "Account 1",
  createdAt: timestamp,
  addresses: {
    bitcoin: "bc1q...",
    spark: "sp1pgss..."
  },
  // Private keys never stored
}
```

### Account Management
1. **Creation** - Generate new wallet
2. **Import** - From seed phrase
3. **Switching** - Update active account
4. **Deletion** - Remove account data
5. **Export** - Display seed/keys

---

## Balance & Transaction Management

### Balance Sources
1. **Primary**: mempool.space API
2. **Fallback 1**: blockstream.info API
3. **Fallback 2**: blockchain.info API
4. **Spark**: Currently mock data

### Caching Strategy
- **5-minute cache** for balance data
- **Force refresh** option available
- **Automatic refresh** on account switch

### Transaction Display
- **Recent transactions** from APIs
- **Transaction details** modal
- **Status indicators** (confirmed/pending)
- **Amount formatting** with USD conversion

---

## Future Enhancements

### Planned Features
1. **Hardware wallet** support
2. **Transaction broadcasting**
3. **Address book**
4. **Export transactions** (CSV)
5. **Multi-language** support

### Technical Improvements
1. **WebSocket** for real-time updates
2. **Service Worker** for offline mode
3. **IndexedDB** for better storage
4. **WebAssembly** for performance
5. **Progressive Web App** features

---

## Conclusion

MOOSH Wallet represents a professional, secure, and user-friendly cryptocurrency wallet implementation. Its modular architecture, comprehensive feature set, and unique terminal-inspired UI make it a standout solution in the wallet ecosystem. The clean separation between frontend and backend, coupled with strong security practices and real blockchain integration, provides users with a reliable and trustworthy wallet experience.