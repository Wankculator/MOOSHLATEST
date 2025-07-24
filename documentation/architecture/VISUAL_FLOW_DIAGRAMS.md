# 🔄 MOOSH Wallet Visual Flow Diagrams
**Last Updated**: 2025-07-21
**Purpose**: Detailed ASCII flow diagrams for critical wallet operations

## 🔑 Wallet Generation Flow (CRITICAL)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         WALLET GENERATION FLOW - DO NOT MODIFY                           │
│                              Lines: 1896-1922, 3224-3261                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

START                                                                                    END
  │                                                                                       │
  ▼                                                                                       ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   User      │    │   Frontend   │    │   API Call  │    │   Backend    │    │   Display    │
│  Action     │───▶│  Validation  │───▶│   Request   │───▶│  Processing  │───▶│   Result     │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘    └──────────────┘
      │                    │                   │                   │                    │
      │                    │                   │                   │                    │
  Click "Generate"    Check Network      POST Request        Generate Keys         Show Seed
  Select Strength     Show Loading       /api/spark/         • Entropy            Display Keys
  (12/24 words)       Disable Buttons    generate-wallet     • Mnemonic           Copy Button
                                        Timeout: 60s         • Addresses          Save Option
                                                            • Private Keys

DETAILED BACKEND PROCESSING:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              WALLET SERVICE OPERATIONS                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

     Request                Entropy              Mnemonic            Derivation          Response
        │                     │                     │                    │                  │
        ▼                     ▼                     ▼                    ▼                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│  Validate    │     │  Generate    │     │   Create     │     │   Derive     │    │   Format     │
│  Strength    │────▶│  256 bits    │────▶│  BIP39 Words │────▶│  Addresses   │───▶│  Response    │
│  128/256     │     │  crypto.     │     │  24 words    │     │  • Bitcoin   │    │  JSON        │
└──────────────┘     │  randomBytes │     └──────────────┘     │  • Spark     │    └──────────────┘
                     └──────────────┘                           └──────────────┘
                            │                                          │
                            │                                          │
                     NEVER Math.random()                        BIP32/44/49/84/86
                     Use crypto only!                           Hierarchical Keys

RESPONSE FORMAT (CRITICAL - DO NOT CHANGE):
{
  "success": true,
  "data": {
    "mnemonic": "word1 word2 word3 ... word24",  // STRING not array!
    "addresses": {
      "bitcoin": {
        "legacy": "1...",      // P2PKH
        "nestedSegwit": "3...", // P2SH-P2WPKH
        "nativeSegwit": "bc1q...", // P2WPKH
        "taproot": "bc1p..."   // P2TR
      },
      "spark": "sp1..."        // Spark address
    },
    "privateKeys": {
      "bitcoin": {
        "wif": "L...",         // Wallet Import Format
        "hex": "0x..."         // Hex format
      },
      "spark": {
        "hex": "0x..."         // Hex format only
      }
    }
  }
}

CRITICAL TIMING:
• Frontend timeout: 60 seconds (MUST NOT be less)
• Backend processing: 10-60 seconds typical
• SDK initialization: Can take up to 30 seconds
• Total time: Up to 60 seconds is NORMAL
```

## 💸 Transaction Send Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRANSACTION SEND FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

USER INTERFACE                           VALIDATION                            EXECUTION
      │                                       │                                    │
      ▼                                       ▼                                    ▼
┌──────────────┐                    ┌──────────────────┐                 ┌──────────────────┐
│  Send Modal  │                    │  Input Checks    │                 │  Transaction     │
│              │                    │                  │                 │  Building        │
│ ┌──────────┐ │                    │ • Address format │                 │                  │
│ │ To:      │ │                    │ • Amount > 0     │                 │ • Select UTXOs   │
│ │ [______] │ │───────────────────▶│ • Amount <= bal  │────────────────▶│ • Calculate fee  │
│ │ Amount:  │ │                    │ • Fee rate valid │                 │ • Build PSBT     │
│ │ [______] │ │                    │ • Network match  │                 │ • Add change     │
│ │ Fee:     │ │                    └──────────────────┘                 └────────┬─────────┘
│ │ [______] │ │                                                                   │
│ └──────────┘ │                                                                   ▼
└──────────────┘                                                         ┌──────────────────┐
                                                                        │  Client Signing  │
      ▲                                                                 │                  │
      │                                                                 │ • Load priv key  │
      │                                                                 │ • Sign inputs    │
      └─────────────────────────────────────────────────────────────────│ • Verify sigs    │
                                                                        │ • Clear key      │
REVIEW & CONFIRM                                                        └────────┬─────────┘
      │                                                                          │
      ▼                                                                          ▼
┌──────────────┐                    ┌──────────────────┐                 ┌──────────────────┐
│  TX Review   │                    │  Broadcasting    │                 │  Confirmation    │
│              │                    │                  │                 │                  │
│ • To: addr   │                    │ • API endpoint   │                 │ • Show TXID      │
│ • Amount: X  │───────────────────▶│ • Network submit │────────────────▶│ • Update balance │
│ • Fee: Y     │   User Confirms    │ • Get TXID       │   Success       │ • Add to history │
│ • Total: Z   │                    │ • Handle errors  │                 │ • Close modal    │
│              │                    └──────────────────┘                 └──────────────────┘
└──────────────┘

TRANSACTION BUILDING DETAILS:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              UTXO SELECTION ALGORITHM                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

Available UTXOs                     Selection Process                      Transaction
     │                                    │                                    │
     ▼                                    ▼                                    ▼
┌──────────────┐              ┌──────────────────────┐              ┌──────────────────┐
│ UTXO List    │              │  1. Sort by value    │              │   Inputs:        │
│              │              │  2. Select largest   │              │   • UTXO 1       │
│ • 0.5 BTC    │─────────────▶│  3. Check if enough  │─────────────▶│   • UTXO 2       │
│ • 0.3 BTC    │              │  4. Add more if not  │              │                  │
│ • 0.1 BTC    │              │  5. Calculate change │              │   Outputs:       │
│ • 0.05 BTC   │              │  6. Optimize fee     │              │   • Recipient    │
└──────────────┘              └──────────────────────┘              │   • Change       │
                                                                    └──────────────────┘

ERROR HANDLING FLOW:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TRANSACTION ERROR HANDLING                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   Error Type              Detection                  User Feedback            Recovery
      │                       │                            │                      │
      ▼                       ▼                            ▼                      ▼
┌──────────────┐     ┌──────────────────┐      ┌──────────────────┐    ┌──────────────┐
│ Insufficient │     │ Balance < Amount │      │ "Not enough BTC" │    │ Adjust amt   │
│ Funds        │────▶│ + Fee estimate   │─────▶│ Show available   │───▶│ or cancel    │
└──────────────┘     └──────────────────┘      └──────────────────┘    └──────────────┘
      │                       │                            │                      │
      ▼                       ▼                            ▼                      ▼
┌──────────────┐     ┌──────────────────┐      ┌──────────────────┐    ┌──────────────┐
│ Invalid      │     │ Regex validation │      │ "Invalid address"│    │ Re-enter     │
│ Address      │────▶│ Checksum verify  │─────▶│ Highlight field  │───▶│ address      │
└──────────────┘     └──────────────────┘      └──────────────────┘    └──────────────┘
      │                       │                            │                      │
      ▼                       ▼                            ▼                      ▼
┌──────────────┐     ┌──────────────────┐      ┌──────────────────┐    ┌──────────────┐
│ Network      │     │ API timeout      │      │ "Network error"  │    │ Retry or     │
│ Error        │────▶│ 500/503 status   │─────▶│ Try again button │───▶│ save draft   │
└──────────────┘     └──────────────────┘      └──────────────────┘    └──────────────┘
```

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE MANAGEMENT ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   StateManager   │
                              │  (Single Source) │
                              └────────┬─────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ Wallet State │  │  UI State    │  │ Cache State  │
            │              │  │              │  │              │
            │ • Current    │  │ • Modals     │  │ • Prices     │
            │ • List       │  │ • Loading    │  │ • Balances   │
            │ • Balances   │  │ • Theme      │  │ • TXs        │
            └──────────────┘  └──────────────┘  └──────────────┘

STATE UPDATE FLOW:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              STATE UPDATE MECHANISM                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   Action                  Update                  Broadcast              Re-render
     │                       │                         │                      │
     ▼                       ▼                         ▼                      ▼
┌──────────┐         ┌──────────────┐         ┌──────────────┐      ┌──────────────┐
│ Trigger  │         │ Validate &   │         │ Notify       │      │ Update UI    │
│          │────────▶│ Transform    │────────▶│ Subscribers  │─────▶│              │
│ • User   │         │              │         │              │      │ • Efficient  │
│ • API    │         │ • Type check │         │ • Event emit │      │ • Batched    │
│ • Timer  │         │ • Sanitize   │         │ • Callbacks  │      │ • Optimized  │
└──────────┘         │ • Merge      │         └──────────────┘      └──────────────┘
                     └──────────────┘

SUBSCRIPTION PATTERN:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT SUBSCRIPTION MODEL                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

Component Lifecycle            Subscribe                 Update                 Cleanup
       │                          │                        │                      │
       ▼                          ▼                        ▼                      ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐      ┌──────────────┐
│ Mount        │         │ Register     │         │ On Change    │      │ Unmount      │
│              │         │              │         │              │      │              │
│ constructor()│────────▶│ on('key',fn) │────────▶│ callback()   │─────▶│ off('key')   │
│ init()       │         │ Store ref    │         │ Update view  │      │ Clear refs   │
└──────────────┘         └──────────────┘         └──────────────┘      └──────────────┘

STATE KEYS REFERENCE:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Key                  │ Type     │ Description              │ Updated By               │
├─────────────────────┼──────────┼──────────────────────────┼──────────────────────────┤
│ currentWallet       │ Object   │ Active wallet data       │ AccountSwitcher          │
│ wallets            │ Array    │ All wallet instances     │ MultiWallet, Import      │
│ balance            │ Object   │ Current balance cache    │ APIService, Timer        │
│ transactions       │ Array    │ Transaction history      │ APIService, WebSocket    │
│ prices             │ Object   │ BTC/USD rates            │ PriceService             │
│ modalVisible       │ String   │ Active modal ID          │ Modal components         │
│ loading            │ Object   │ Loading states           │ All async operations     │
│ preferences        │ Object   │ User settings            │ SettingsModal            │
│ theme              │ String   │ light/dark               │ ThemeToggle              │
│ network            │ String   │ mainnet/testnet          │ NetworkSelector          │
└─────────────────────┴──────────┴──────────────────────────┴──────────────────────────┘
```

## 🔒 Security Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

CLIENT-SIDE SECURITY LAYERS:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              INPUT → VALIDATION → PROCESSING → OUTPUT                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   User Input              Validation               Processing              Safe Output
       │                       │                         │                      │
       ▼                       ▼                         ▼                      ▼
┌──────────────┐      ┌──────────────────┐      ┌──────────────┐      ┌──────────────┐
│ Raw Data     │      │ Input Validation │      │ Sanitization │      │ DOM Update   │
│              │      │                  │      │              │      │              │
│ • Form input │─────▶│ • Type checking  │─────▶│ • XSS prevent│─────▶│ • textContent│
│ • API resp   │      │ • Range limits   │      │ • Escape HTML│      │ • Not innerHTML
│ • User paste │      │ • Format verify  │      │ • Validate   │      │ • Safe attrs │
└──────────────┘      └──────────────────┘      └──────────────┘      └──────────────┘

CRYPTOGRAPHIC OPERATIONS FLOW:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURE KEY GENERATION & USAGE                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   Entropy Source          Key Generation           Key Usage              Key Disposal
        │                       │                       │                      │
        ▼                       ▼                       ▼                      ▼
┌──────────────┐      ┌──────────────────┐    ┌──────────────┐      ┌──────────────┐
│ crypto.      │      │ BIP39 Process    │    │ Operations   │      │ Cleanup      │
│ getRandomVal │      │                  │    │              │      │              │
│              │─────▶│ • Entropy→Words  │───▶│ • Sign TX    │─────▶│ • Overwrite  │
│ • 256 bits   │      │ • Words→Seed     │    │ • Derive addr│      │ • Nullify    │
│ • CSPRNG     │      │ • Seed→Keys      │    │ • Encrypt    │      │ • No persist │
└──────────────┘      └──────────────────┘    └──────────────┘      └──────────────┘
        │                                              │
        │                                              │
  NEVER Math.random()                           Memory only, never stored

PASSWORD PROTECTION FLOW:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SENSITIVE OPERATION PROTECTION                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  Operation Request         Auth Check              Verification           Execute/Deny
        │                       │                        │                     │
        ▼                       ▼                        ▼                     ▼
┌──────────────┐      ┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Sensitive Op │      │ Check Auth State │     │ Password     │     │ Result       │
│              │      │                  │     │ Validation   │     │              │
│ • Export key │─────▶│ • Session valid? │────▶│              │────▶│ • Success    │
│ • Delete acc │      │ • Timeout check  │ NO  │ • Hash check │ OK  │   Continue   │
│ • Send large │      │ • Require auth?  │     │ • Attempts   │     │ • Failure    │
└──────────────┘      └──────────────────┘     │ • Lockout    │     │   Block op   │
                               │                └──────────────┘     └──────────────┘
                               │                        ▲
                               └────────────────────────┘
                                    Show Password Modal

API SECURITY FLOW:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              API REQUEST SECURITY PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  Frontend Request         Validation            API Gateway            Backend Process
        │                     │                      │                      │
        ▼                     ▼                      ▼                      ▼
┌──────────────┐     ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ API Call     │     │ Client Valid │      │ Server Valid │      │ Process      │
│              │     │              │      │              │      │              │
│ • Endpoint   │────▶│ • CORS check │─────▶│ • Rate limit │─────▶│ • Sanitize   │
│ • Headers    │     │ • Origin OK  │      │ • Size limit │      │ • Execute    │
│ • Payload    │     │ • Format OK  │      │ • Auth check │      │ • Log        │
└──────────────┘     └──────────────┘      └──────────────┘      └──────────────┘

SECURITY CHECKLIST:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ✓ No private keys in localStorage                                                       │
│ ✓ All crypto uses secure random (crypto.getRandomValues)                                │
│ ✓ XSS prevention (no innerHTML with user data)                                          │
│ ✓ CORS properly configured                                                              │
│ ✓ Rate limiting on all endpoints                                                        │
│ ✓ Input validation on client and server                                                 │
│ ✓ Secure headers (CSP, HSTS, etc.)                                                     │
│ ✓ No sensitive data in logs                                                            │
│ ✓ Memory cleanup after crypto operations                                                │
│ ✓ HTTPS only in production                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Performance Optimization Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              PERFORMANCE OPTIMIZATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

REQUEST OPTIMIZATION:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              API CALL BATCHING & CACHING                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  Multiple Requests         Batch Process           Cache Layer            Final Result
        │                        │                       │                     │
        ▼                        ▼                       ▼                     ▼
┌──────────────┐        ┌──────────────┐       ┌──────────────┐      ┌──────────────┐
│ Request Queue │        │ Batch API    │       │ Cache Check  │      │ Deliver Data │
│               │        │               │       │               │      │               │
│ • Balance     │───────▶│ • Combine     │──────▶│ • Hit? Return│─────▶│ • Update UI  │
│ • Price       │        │ • Dedupe      │       │ • Miss? Fetch│      │ • Fast resp  │
│ • TX History  │        │ • Send once   │       │ • Store result│     │ • Smooth UX  │
└──────────────┘        └──────────────┘       └──────────────┘      └──────────────┘

RENDER OPTIMIZATION:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DOM UPDATE OPTIMIZATION                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  State Changes           Batch Updates           Virtual Compare         Minimal DOM Ops
       │                       │                        │                      │
       ▼                       ▼                        ▼                      ▼
┌──────────────┐      ┌──────────────┐        ┌──────────────┐      ┌──────────────┐
│ Multiple     │      │ Queue Updates│        │ Diff Engine  │      │ Apply Changes│
│ Changes      │      │              │        │              │      │              │
│ • Price: $45k│─────▶│ • Collect    │───────▶│ • Old vs New │─────▶│ • Update text│
│ • Balance: 2 │      │ • Debounce   │        │ • Find delta │      │ • Add/remove │
│ • New TX     │      │ • Batch      │        │ • Plan ops   │      │ • Reposition │
└──────────────┘      └──────────────┘        └──────────────┘      └──────────────┘

MEMORY MANAGEMENT:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              MEMORY OPTIMIZATION STRATEGIES                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘

   Monitor Usage          Identify Leaks           Clean Up              Verify
       │                       │                       │                    │
       ▼                       ▼                       ▼                    ▼
┌──────────────┐      ┌──────────────┐       ┌──────────────┐     ┌──────────────┐
│ Memory Check │      │ Find Issues  │       │ Fix Leaks    │     │ Test Again   │
│              │      │              │       │              │     │              │
│ • Heap size  │─────▶│ • Event list │──────▶│ • Remove lis │────▶│ • Heap down  │
│ • Growth rate│      │ • Timers     │       │ • Clear time │     │ • Stable mem │
│ • GC frequency      │ • Closures   │       │ • Break refs │     │ • No growth  │
└──────────────┘      └──────────────┘       └──────────────┘     └──────────────┘
```

---

**These visual flow diagrams provide comprehensive understanding of MOOSH Wallet's critical operations and architectures.**