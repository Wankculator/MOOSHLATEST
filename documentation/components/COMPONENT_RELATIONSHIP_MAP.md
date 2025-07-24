# MOOSH Wallet Component Relationship Map

**Last Updated**: 2025-07-21
**Purpose**: Master visualization of how all components connect and interact within MOOSH Wallet

## 🗺️ Component Hierarchy Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          MOOSH WALLET APPLICATION STRUCTURE                          │
│                               Main File: moosh-wallet.js                             │
│                                  33,000+ lines                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🏗️ CORE FRAMEWORK LAYER                                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐          │
│  │     App     │  │    Router    │  │ StateManager  │  │  APIService  │          │
│  │   (Main)    │◄─┤ (Navigation) ├─▶│ (Global State)│◄─┤   (HTTP)     │          │
│  │             │  │              │  │               │  │              │          │
│  └──────┬──────┘  └──────────────┘  └───────────────┘  └──────────────┘          │
│         │                                                                           │
│         ▼                                                                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────────────┐       │
│  │ ElementFactory  │  │  StyleManager    │  │    ResponsiveUtils        │       │
│  │ (DOM Creation)  │  │   (Theming)      │  │  (Breakpoint Detection)    │       │
│  └─────────────────┘  └──────────────────┘  └────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 📄 PAGES LAYER                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐ │
│  │      HomePage        │    │  GenerateSeedPage   │    │   DashboardPage      │ │
│  │  Lines: 6191-6250    │───▶│  Lines: 1896-1922   │───▶│  Lines: 13700-14500  │ │
│  │  ┌────────────────┐  │    │  ┌───────────────┐  │    │  ┌────────────────┐  │ │
│  │  │    Header      │  │    │  │ SeedDisplay   │  │    │  │  Navigation    │  │ │
│  │  ├────────────────┤  │    │  ├───────────────┤  │    │  ├────────────────┤  │ │
│  │  │ WalletOptions  │  │    │  │  CopyButton   │  │    │  │ DashSections   │  │ │
│  │  ├────────────────┤  │    │  ├───────────────┤  │    │  │ • Balance      │  │ │
│  │  │    Footer      │  │    │  │ Confirmation  │  │    │  │ • QuickActions │  │ │
│  │  └────────────────┘  │    │  └───────────────┘  │    │  │ • TxList       │  │ │
│  └──────────────────────┘    └─────────────────────┘    │  │ • Market       │  │ │
│                                                          │  └────────────────┘  │ │
│                                                          └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🔧 FEATURES LAYER                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌─────────────────────────┐  │
│  │ AccountSwitchingSystem│  │ TransactionHistory │  │ MultiWalletManagement   │  │
│  │  Lines: 4319-4560     │  │ Lines: 20267-20500 │  │  Lines: 18564-19600     │  │
│  │  ┌─────────────────┐  │  │  ┌──────────────┐  │  │  ┌───────────────────┐  │  │
│  │  │AccountDropdown  │  │  │  │ TxList       │  │  │  │ WalletCreation    │  │  │
│  │  ├─────────────────┤  │  │  ├──────────────┤  │  │  ├───────────────────┤  │  │
│  │  │MultiAccountModal│  │  │  │ TxDetails    │  │  │  │ WalletImport      │  │  │
│  │  └─────────────────┘  │  │  └──────────────┘  │  │  ├───────────────────┤  │  │
│  └───────────────────────┘  └────────────────────┘  │  │ AccountDerivation │  │  │
│                                                      │  └───────────────────┘  │  │
│  ┌───────────────────────┐  ┌────────────────────┐  └─────────────────────────┘  │
│  │   SecurityFeatures    │  │ RealTimePriceUpdate│                                │
│  │  ┌─────────────────┐  │  │  ┌──────────────┐  │                                │
│  │  │  LockScreen     │  │  │  │ PriceService │  │                                │
│  │  ├─────────────────┤  │  │  ├──────────────┤  │                                │
│  │  │PasswordProtect │  │  │  │  PriceChart  │  │                                │
│  │  ├─────────────────┤  │  │  ├──────────────┤  │                                │
│  │  │  PrivacyMode    │  │  │  │CurrencyConv. │  │                                │
│  │  └─────────────────┘  │  │  └──────────────┘  │                                │
│  └───────────────────────┘  └────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🎨 UI COMPONENTS LAYER                                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Modals     │  │  UI Sections   │  │   Buttons    │  │     Forms        │   │
│  │               │  │                │  │              │  │                  │   │
│  │ • SendModal   │  │ • Navigation   │  │ • Send       │  │ • Transaction    │   │
│  │ • ReceiveModal│  │ • Header       │  │ • Receive    │  │ • Seed Phrase    │   │
│  │ • Settings    │  │ • Footer       │  │ • Copy       │  │ • Account        │   │
│  │ • Import      │  │ • AccountDrop  │  │ • Theme      │  │ • Settings       │   │
│  │ • TxHistory   │  │ • BalanceDisp  │  │              │  │                  │   │
│  └───────────────┘  └────────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🔌 SERVICES LAYER (Backend)                                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────┐  ┌──────────────────┐  ┌───────────────────┐  ┌────────────┐ │
│  │ WalletService  │  │ NetworkService   │  │SparkCompatService │  │SparkSDKSvc │ │
│  │               │  │                  │  │                   │  │            │ │
│  │ • Generate    │  │ • Balance        │  │ • Spark Address   │  │ • SDK Init │ │
│  │ • Import      │  │ • Transactions   │  │ • Compatibility   │  │ • Fallback │ │
│  │ • Derive      │  │ • Broadcasting   │  │ • Integration     │  │ • Bech32m  │ │
│  └────────────────┘  └──────────────────┘  └───────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Component Relationships

### Data Flow Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW ARCHITECTURE                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   App Instance  │
                              │  (Entry Point)  │
                              └────────┬────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
                  ▼                   ▼                   ▼
          ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
          │ StateManager │   │    Router    │   │  APIService  │
          │             │   │              │   │              │
          └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                 │                   │                   │
                 │                   │                   │
    ┌────────────┴────────────┐     │      ┌────────────┴────────────┐
    │                         │     │      │                         │
    ▼                         ▼     │      ▼                         ▼
┌────────┐  ┌─────────┐  ┌────────┐│  ┌────────────┐  ┌──────────────┐
│ Pages  │  │ Modals  │  │Features││  │WalletSvc   │  │NetworkSvc    │
│        │  │         │  │        ││  │            │  │              │
└───┬────┘  └────┬────┘  └───┬────┘│  └────────────┘  └──────────────┘
    │            │            │     │          │                │
    └────────────┴────────────┘     │          └────────────────┘
                 │                  │                   │
                 ▼                  │                   ▼
         ┌──────────────┐           │          ┌──────────────┐
         │UI Components │           │          │  Blockchain  │
         │              │           │          │   Networks   │
         └──────────────┘           │          └──────────────┘
                                    │
                              Navigation
                               Events

DATA FLOW PATTERNS:
━━━━━━━━━━━━━━━━━━
1. User Action → Component → State Update → Re-render
2. API Call → Service → Response → State Update → UI Update
3. Navigation → Router → Page Load → Component Init → Data Fetch
4. State Change → Event Emission → Subscriber Updates
```

### Event Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              EVENT FLOW ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

   USER                    COMPONENT              STATE               EVENTS            UI
    │                         │                     │                   │                │
    │  Mouse/Keyboard         │                     │                   │                │
    ├────────────────────────▶│                     │                   │                │
    │  onClick/onInput        │  handleEvent()      │                   │                │
    │                         ├────────────────────▶│                   │                │
    │                         │  setState(key,val)  │  update()         │                │
    │                         │                     ├──────────────────▶│                │
    │                         │                     │  emit('change')   │  notify()      │
    │                         │                     │                   ├───────────────▶│
    │                         │                     │                   │  render()      │
    │                         │◀────────────────────┼───────────────────┼───────────────┤
    │                         │  callback()         │                   │  DOM Update    │
    │◀────────────────────────┼────────────────────┼───────────────────┼───────────────┤
    │  Visual Feedback        │                     │                   │                │

EVENT TYPES:
───────────
• User Events: click, input, keypress, scroll
• State Events: walletChanged, balanceUpdate, priceUpdate
• System Events: pageLoad, networkStatus, error
• Custom Events: modalOpen, transactionSent, accountAdded

EVENT FLOW EXAMPLE:
─────────────────
1. User clicks "Send" button
2. SendButton.handleClick() triggered
3. State.set('modalVisible', true)
4. Event 'modalOpen' emitted
5. SendModal.show() called by event listener
6. DOM updated via ElementFactory
7. Modal appears to user
```

### Component Communication Patterns

#### 1. Parent-Child Communication
```javascript
// Parent (DashboardPage) → Child (BalanceDisplay)
<BalanceDisplay 
    balance={this.state.balance}
    onRefresh={() => this.refreshBalance()}
/>

// Child → Parent via callbacks
this.props.onRefresh(); // Calls parent method
```

#### 2. Sibling Communication via State
```javascript
// Component A updates state
this.app.state.set('currentWallet', wallet);

// Component B listens to state
this.app.state.on('currentWallet', (wallet) => {
    this.updateDisplay(wallet);
});
```

#### 3. Global Event System
```javascript
// Emitter
this.app.events.emit('priceUpdate', { price: 45000 });

// Listeners
this.app.events.on('priceUpdate', (data) => {
    this.updatePrice(data.price);
});
```

## 📊 Critical Component Dependencies

### Dashboard Page Dependencies
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD PAGE DEPENDENCIES                                 │
│                           Lines: 13700-14500                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │  DashboardPage  │
                              │                 │
                              └────────┬────────┘
                                      │
                    DEPENDS ON        │        CONTAINS
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            │                            ▼
┌──────────────────┐                  │                   ┌──────────────────┐
│   StateManager   │                  │                   │  NavigationBar   │
│ • currentWallet  │                  │                   │ • Menu items     │
│ • wallets[]      │                  │                   │ • Active state   │
│ • preferences    │                  │                   └──────────────────┘
└──────────────────┘                  │                            │
         │                            │                            ▼
         ▼                            │                   ┌──────────────────┐
┌──────────────────┐                  │                   │ AccountSwitcher  │
│   APIService     │                  │                   │ • Dropdown       │
│ • fetchBalance() │                  │                   │ • Multi-account  │
│ • getTxHistory() │                  │                   └──────────────────┘
│ • getPrice()     │                  │                            │
└──────────────────┘                  │                            ▼
         │                            │                   ┌──────────────────┐
         ▼                            │                   │  BalanceDisplay  │
┌──────────────────┐                  │                   │ • BTC amount     │
│  PriceService    │                  │                   │ • USD value      │
│ • USD rates      │                  │                   │ • 24h change     │
│ • Conversion     │                  │                   └──────────────────┘
└──────────────────┘                  │                            │
         │                            │                            ▼
         ▼                            │                   ┌──────────────────┐
┌──────────────────┐                  │                   │  QuickActions    │
│     Router       │                  │                   │ • Send button    │
│ • navigation     │                  │                   │ • Receive button │
│ • history        │                  │                   │ • History link   │
└──────────────────┘                  │                   └──────────────────┘
                                      │                            │
                                      │                            ▼
                              EMITS EVENTS                ┌──────────────────┐
                                      │                   │ TransactionList  │
                         ┌────────────┼────────────┐      │ • Recent TXs     │
                         │            │            │      │ • Status icons   │
                         ▼            ▼            ▼      └──────────────────┘
                 'balanceRefresh' 'accountSwitch' 'modalOpen'      │
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │     Footer       │
                                                          │ • Version info   │
                                                          │ • Links          │
                                                          └──────────────────┘
```

### Send Transaction Flow
```
SendButton Click
    → SendModal.show()
        → Form Validation
            → APIService.sendTransaction()
                → WalletService.signTransaction()
                    → NetworkService.broadcast()
                        → State Update
                            → Event: 'transactionSent'
                                → Balance Refresh
                                → Transaction List Update
                                → Notification Display
```

### Account Switching Flow
```
AccountDropdown Click
    → Dropdown Menu Display
        → Account Selection
            → State.set('currentWallet')
                → Event: 'walletChanged'
                    → BalanceDisplay.refresh()
                    → TransactionList.refresh()
                    → AddressDisplay.update()
                    → Router.navigate('dashboard')
```

## 🎯 Key Integration Points

### 1. State Manager Integration
All components that need persistent data integrate with StateManager:
- Current wallet/account
- User preferences
- Transaction history
- Price data cache
- UI state (modals, dropdowns)

### 2. API Service Integration
Components requiring backend data:
- Balance updates → `/api/bitcoin/balance`
- Transaction history → `/api/bitcoin/transactions`
- Price data → `/api/bitcoin/price`
- Spark operations → `/api/spark/*`

### 3. Router Integration
Navigation-aware components:
- NavigationBar (active route highlighting)
- Pages (route handlers)
- Modals (route-based opening)
- Back buttons (history management)

### 4. Event System Integration
Real-time update components:
- BalanceDisplay (price/balance updates)
- TransactionList (new transactions)
- PriceChart (market data)
- NotificationSystem (alerts)

## 🔄 Component Lifecycle

### Initialization Order
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          COMPONENT INITIALIZATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

STEP 1: APP BOOTSTRAP                    STEP 2: SERVICE INIT
┌─────────────────────┐                  ┌─────────────────────┐
│   App Constructor   │                  │  Core Services      │
│                     │ ───────────────▶ │                     │
│ • new App()         │                  │ • StateManager      │
│ • DOMContentLoaded  │                  │ • Router            │
└─────────────────────┘                  │ • APIService        │
                                         │ • ElementFactory    │
                                         └──────────┬──────────┘
                                                    │
                                                    ▼
STEP 3: ROUTER SETUP                     STEP 4: PAGE CREATION
┌─────────────────────┐                  ┌─────────────────────┐
│   Route Registry    │                  │   Page Instance     │
│                     │ ───────────────▶ │                     │
│ • Define routes     │                  │ • Constructor       │
│ • Set handlers      │                  │ • Init components   │
│ • Listen to URL     │                  │ • Setup layout      │
└─────────────────────┘                  └──────────┬──────────┘
                                                    │
                                                    ▼
STEP 5: COMPONENT INIT                   STEP 6: EVENT SUBSCRIPTIONS
┌─────────────────────┐                  ┌─────────────────────┐
│  Child Components   │                  │   Event Bindings    │
│                     │ ───────────────▶ │                     │
│ • Create instances  │                  │ • State listeners   │
│ • Set properties    │                  │ • DOM events        │
│ • Bind methods      │                  │ • Custom events     │
└─────────────────────┘                  └──────────┬──────────┘
                                                    │
                                                    ▼
STEP 7: DATA FETCH                       STEP 8: RENDER
┌─────────────────────┐                  ┌─────────────────────┐
│   Initial Load      │                  │    UI Display       │
│                     │ ───────────────▶ │                     │
│ • Show loading      │                  │ • Update DOM        │
│ • Fetch from API    │                  │ • Hide loading      │
│ • Update state      │                  │ • Show content      │
└─────────────────────┘                  └─────────────────────┘

TIMING:
• Steps 1-4: < 100ms
• Steps 5-6: < 200ms
• Step 7: 200-2000ms (network dependent)
• Step 8: < 50ms
• Total: < 2.5 seconds typical
```

### Update Cycle
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT UPDATE CYCLE                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

   TRIGGER                    PROCESS                   RENDER                 COMPLETE
      │                          │                        │                       │
      ▼                          ▼                        ▼                       ▼
┌─────────────┐          ┌──────────────┐        ┌──────────────┐       ┌──────────────┐
│User Action  │          │State Update  │        │Component     │       │DOM Updated   │
│or Event     │ ───────▶ │              │ ─────▶ │Re-render     │ ────▶ │              │
│             │          │              │        │              │       │              │
│• Click      │          │• Validate    │        │• Diff state  │       │• Efficient   │
│• API resp   │          │• Transform   │        │• Update view │       │• Minimal ops │
│• Timer      │          │• Store       │        │• Queue render│       │• Smooth UX   │
└─────────────┘          └──────┬───────┘        └──────┬───────┘       └──────────────┘
                                │                        │
                                ▼                        ▼
                        ┌──────────────┐         ┌──────────────┐
                        │Event Emission│         │ElementFactory│
                        │              │         │              │
                        │• Notify subs │         │• Create els  │
                        │• Pass data   │         │• Update attrs│
                        │• Async safe  │         │• Apply styles│
                        └──────────────┘         └──────────────┘

UPDATE PATTERNS:
───────────────
1. Immediate Updates (< 16ms)
   • User input feedback
   • Hover states
   • Loading indicators

2. Debounced Updates (100-300ms)
   • Search queries
   • Form validation
   • Price updates

3. Throttled Updates (1000ms+)
   • Balance refresh
   • Transaction list
   • Network status
```

### Cleanup Process
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT CLEANUP FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

   TRIGGER                  CLEANUP SEQUENCE                    VERIFICATION
      │                            │                                 │
      ▼                            ▼                                 ▼
┌─────────────┐          ┌───────────────────┐           ┌──────────────────┐
│ Unmount     │          │ Event Listeners   │           │ Memory Check     │
│ Triggered   │ ───────▶ │                   │ ────────▶ │                  │
│             │          │ • removeEventList │           │ • Heap snapshot  │
│ • Route chg │          │ • Off() calls     │           │ • Ref counting   │
│ • Modal cls │          │ • Unbind DOM      │           │ • GC trigger     │
└─────────────┘          └────────┬──────────┘           └──────────────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │ Timers & Async    │
                         │                   │
                         │ • clearInterval() │
                         │ • clearTimeout()  │
                         │ • abort fetches   │
                         └────────┬──────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │ Connections       │
                         │                   │
                         │ • WebSocket.close │
                         │ • EventSource.cls │
                         │ • Worker.term     │
                         └────────┬──────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │ References        │
                         │                   │
                         │ • this.prop=null  │
                         │ • delete maps     │
                         │ • clear arrays    │
                         └───────────────────┘

CLEANUP CHECKLIST:
─────────────────
□ All addEventListener has matching removeEventListener
□ All setInterval has clearInterval
□ All setTimeout has clearTimeout (if active)
□ All subscriptions are unsubscribed
□ All external connections closed
□ All large objects nullified
□ All circular references broken
```

## 🚨 Critical Dependencies

### Must Load First
1. ElementFactory (DOM creation)
2. StateManager (data management)
3. APIService (backend communication)
4. Router (navigation)

### Can Load Async
1. PriceService (market data)
2. OrdinalsService (NFT data)
3. NewsService (news feed)
4. ThemeManager (appearance)

### Circular Dependency Prevention
- Components never import pages
- Services never import components
- State flows down, events bubble up
- Shared utilities in separate modules

## 📱 Responsive Behavior Chain

```
Window Resize Event
    → ResponsiveUtils.updateBreakpoint()
        → Event: 'breakpointChange'
            → NavigationBar.adjustLayout()
            → DashboardSections.reflow()
            → Modals.adjustSize()
            → Charts.resize()
```

## 🔒 Security Integration Points

### Password-Protected Operations
```
User Action Requiring Auth
    → SecurityManager.requireAuth()
        → PasswordModal.show()
            → Password Validation
                → Success: Continue Operation
                → Failure: Show Error
```

### Sensitive Data Flow
```
Wallet Data → Encryption Layer → Secure Storage
    ↓              ↓                  ↓
Private Keys   AES-256-GCM      localStorage
              Encryption         (encrypted)
```

## 🎨 Theme System Integration

All visual components integrate with theme system:
```
ThemeManager.setTheme('dark')
    → CSS Variables Updated
        → All Components Re-styled
            → Persistent Storage
                → Next Load Applies Theme
```

## 📝 Component Documentation Cross-Reference

### Feature Documentation
- [Account Switching System](./features/AccountSwitchingSystem.md)
- [Transaction History](./features/TransactionHistory.md)
- [Multi-Wallet Management](./features/MultiWalletManagement.md)
- [Security Features](./features/SecurityFeatures.md)
- [Dashboard Widgets](./features/DashboardWidgets.md)
- [Real-time Price Updates](./features/RealTimePriceUpdates.md)
- [Balance Display](./features/BalanceDisplay.md)
- [Ordinals & Inscriptions](./features/OrdinalsInscriptions.md)

### UI Section Documentation
- [Navigation Bar](./ui-sections/NavigationBar.md)
- [Account Dropdown](./ui-sections/AccountDropdown.md)
- [Balance Display Section](./ui-sections/BalanceDisplaySection.md)
- [Transaction List](./ui-sections/TransactionList.md)
- [Footer](./ui-sections/Footer.md)
- [Header](./ui-sections/Header.md)
- [Dashboard Sections](./ui-sections/DashboardSections.md)

### Core Component Documentation
- [API Service](./api/api-endpoints.md)
- [Router](./atomic-units/Router/ai-context.md)
- [State Manager](./atomic-units/StateManager/ai-context.md)
- [Element Factory](./atomic-units/ElementFactory/ai-context.md)

## 🔧 Debugging Component Issues

### Common Integration Problems
1. **State not updating**: Check event subscriptions
2. **Components not rendering**: Verify ElementFactory usage
3. **API calls failing**: Check CORS and proxy configuration
4. **Memory leaks**: Ensure cleanup in component unmount
5. **Style issues**: Verify CSS variable usage

### Component Testing Strategy
```bash
# Test individual component
npm run test:component -- --name=BalanceDisplay

# Test integration
npm run test:integration -- --flow=SendTransaction

# Test full user journey
npm run test:e2e -- --scenario=CreateWallet
```

This component relationship map serves as the master reference for understanding how all parts of MOOSH Wallet connect and interact. Use it when debugging, adding features, or optimizing performance.