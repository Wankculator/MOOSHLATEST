# 🎯 Professional Multi-Account System Specification

## Executive Summary

A world-class multi-account system that surpasses MetaMask, Phantom, and other leading wallets by providing intuitive account management with full Bitcoin protocol support.

---

## 🌟 Best Practices from Leading Wallets

### MetaMask
- ✅ **Quick account switching** via dropdown
- ✅ **Visual account identicons** for recognition
- ✅ **Account labels** with rename capability
- ❌ Limited to Ethereum addresses

### Phantom (Solana)
- ✅ **Beautiful account switcher** with animations
- ✅ **Account groups** for organization
- ✅ **Hardware wallet integration**
- ❌ Single blockchain focus

### Exodus
- ✅ **Portfolio view** across accounts
- ✅ **Multi-asset support** per account
- ❌ Complex UI for beginners

### Electrum
- ✅ **Multiple wallet types** (legacy, segwit, etc.)
- ✅ **Watch-only accounts**
- ❌ Poor UX/UI design

---

## 🚀 MOOSH Wallet - Superior Implementation

### Core Principles
1. **One Seed, Multiple Identities** - Each account derives from same seed but different paths
2. **All Protocols, One Account** - Each account has ALL Bitcoin address types
3. **Privacy First** - Accounts help separate financial activities
4. **Lightning Fast** - Instant switching with cached data

---

## 📋 Detailed Functionality Specification

### 1. Account Button Behavior

#### Current State Indicator
```
┌─────────────────────────────┐
│ 👤 Main Wallet       ▼     │  <- Shows active account name
└─────────────────────────────┘
```

#### On Click - Dropdown Menu
```
┌─────────────────────────────┐
│ 👤 Main Wallet       ▼     │
├─────────────────────────────┤
│ ✓ Main Wallet              │  <- Current (checkmark)
│   Balance: 0.5 BTC         │
│                            │
│   Trading Account          │
│   Balance: 0.2 BTC         │
│                            │
│   Savings Vault            │
│   Balance: 2.1 BTC         │
│                            │
│ ─────────────────────────  │
│ + Create New Account       │
│ ⬇ Import Account          │
│ ⚙ Manage Accounts         │
└─────────────────────────────┘
```

### 2. Account Creation Flow

#### Option A: Create New Account
```
1. Click "+ Create New Account"
2. Modal appears:

   ┌─ Create New Account ──────────────┐
   │                                   │
   │ Account Name:                     │
   │ ┌─────────────────────────────┐  │
   │ │ My New Account              │  │
   │ └─────────────────────────────┘  │
   │                                   │
   │ Derivation Path: m/84'/0'/X'/0/0 │
   │ [Advanced ▼]                      │
   │                                   │
   │ This will create:                 │
   │ ✓ Bitcoin SegWit (bc1q...)       │
   │ ✓ Bitcoin Taproot (bc1p...)      │
   │ ✓ Bitcoin Legacy (1...)          │
   │ ✓ Bitcoin Nested (3...)          │
   │ ✓ Spark Protocol (sp1...)        │
   │                                   │
   │ [Cancel]  [Create Account]        │
   └───────────────────────────────────┘

3. On Create:
   - Derives new account from existing seed
   - Generates ALL 5 address types
   - Saves to account list
   - Switches to new account
   - Shows success notification
```

#### Option B: Import Account
```
1. Click "⬇ Import Account"
2. Modal appears:

   ┌─ Import Account ──────────────────┐
   │                                   │
   │ Import Method:                    │
   │ ○ Seed Phrase (12/24 words)      │
   │ ● Private Key                     │
   │ ○ Extended Public Key (xpub)     │
   │                                   │
   │ Private Key:                      │
   │ ┌─────────────────────────────┐  │
   │ │ **********************      │  │
   │ └─────────────────────────────┘  │
   │                                   │
   │ Account Name:                     │
   │ ┌─────────────────────────────┐  │
   │ │ Imported Account            │  │
   │ └─────────────────────────────┘  │
   │                                   │
   │ ⚠️ This creates a separate       │
   │ account not derived from your     │
   │ main seed phrase                  │
   │                                   │
   │ [Cancel]  [Import]                │
   └───────────────────────────────────┘
```

### 3. Account Management Modal

```
┌─ Manage Accounts ─────────────────────────────────┐
│ ~/moosh/accounts $ list --all                     │
├───────────────────────────────────────────────────┤
│                                                   │
│ 📊 Total Portfolio: 2.8 BTC ($167,348.80)        │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │ 👤 Main Wallet                   [Active] ✓ │  │
│ │ Created: 2024-01-15 | Type: HD Wallet       │  │
│ │                                             │  │
│ │ Bitcoin SegWit:  0.5 BTC ($29,848.00)      │  │
│ │ Bitcoin Taproot: 0.0 BTC ($0.00)           │  │
│ │ Spark Protocol:  1000 SPARK                │  │
│ │                                             │  │
│ │ [View Details] [Rename] [Export] [Delete]   │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │ 💼 Trading Account                          │  │
│ │ Created: 2024-02-20 | Type: HD Wallet       │  │
│ │                                             │  │
│ │ Bitcoin SegWit:  0.2 BTC ($11,939.20)      │  │
│ │ Bitcoin Taproot: 0.0 BTC ($0.00)           │  │
│ │ Spark Protocol:  0 SPARK                   │  │
│ │                                             │  │
│ │ [Switch To] [Rename] [Export] [Delete]      │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│ [+ Create New]  [⬇ Import]  [Close]              │
└───────────────────────────────────────────────────┘
```

### 4. Account Switching Behavior

When switching accounts:
1. **Instant UI Update** - No page reload
2. **Update ALL displays**:
   - Account name in header
   - All addresses in wallet selector
   - Balances for new account
   - Transaction history
   - Ordinals (if taproot selected)
3. **Persist Selection** - Remember last used account
4. **Visual Feedback** - Smooth transition animation

### 5. Account Data Structure

```javascript
{
  accounts: [
    {
      id: "acc_1234567890_abc123",
      name: "Main Wallet",
      type: "hd", // hd, imported, watch-only
      derivationIndex: 0, // For HD accounts
      addresses: {
        bitcoin: {
          segwit: "bc1q...",
          taproot: "bc1p...",
          legacy: "1...",
          nestedSegwit: "3..."
        },
        spark: "sp1..."
      },
      balances: {
        bitcoin: {
          segwit: 50000000, // satoshis
          taproot: 0,
          legacy: 0,
          nestedSegwit: 0
        },
        spark: 1000
      },
      metadata: {
        createdAt: 1234567890,
        lastUsed: 1234567890,
        color: "#FF6B6B", // For visual identification
        icon: "👤" // Customizable emoji
      }
    }
  ],
  activeAccountId: "acc_1234567890_abc123",
  settings: {
    hideEmptyAccounts: false,
    defaultAccountName: "Account {{index}}"
  }
}
```

---

## 🎨 UI/UX Best Practices

### Visual Hierarchy
1. **Active Account** - Bold with checkmark
2. **Account Balance** - Prominent display
3. **Quick Actions** - One-click access
4. **Smooth Animations** - 200ms transitions

### Color Coding
- **Active**: Primary orange (#f57315)
- **Hover**: Lighter shade
- **Disabled**: Gray (#666)
- **Success**: Green (#69fd97)

### Mobile Optimization
- **Bottom Sheet** for account switcher
- **Swipe gestures** for quick switch
- **Large touch targets** (44px minimum)

---

## 🔒 Security Considerations

1. **No Private Keys in State** - Only public addresses
2. **Seed Phrase Isolation** - Each import is separate
3. **Account Deletion** - Requires confirmation
4. **Export Protection** - Password required
5. **Session Management** - Clear on logout

---

## 📈 Advanced Features

### Future Enhancements
1. **Account Groups** - Organize by purpose
2. **Multi-Sig Accounts** - Shared wallets
3. **Hardware Wallet** - Ledger/Trezor support
4. **Account Analytics** - Performance tracking
5. **Account Templates** - Pre-configured setups

### Professional Features
1. **Batch Operations** - Multi-account actions
2. **Account Policies** - Spending limits
3. **Audit Trail** - Account history log
4. **API Access** - Programmatic control
5. **Backup/Restore** - Full account export

---

## 🚦 Implementation Priority

### Phase 1: Core Functionality ✅
- [x] Basic multi-account support
- [x] Account creation from seed
- [x] Account switching
- [ ] Visual account indicators

### Phase 2: Enhanced UX 🚧
- [ ] Beautiful account switcher dropdown
- [ ] Account management modal
- [ ] Rename/delete accounts
- [ ] Account colors/icons

### Phase 3: Advanced Features 📅
- [ ] Import via private key
- [ ] Watch-only accounts
- [ ] Account grouping
- [ ] Hardware wallet support

---

## 🎯 Success Metrics

1. **Account Creation** < 10 seconds
2. **Account Switching** < 500ms
3. **User Satisfaction** > 90%
4. **Zero Security Incidents**
5. **Mobile Performance** 60fps

---

## 📝 Developer Notes

### State Management
```javascript
// Account operations should be atomic
await state.transaction(() => {
  state.createAccount(name);
  state.switchAccount(id);
  state.persistAccounts();
});
```

### Performance
- Lazy load account balances
- Cache address data
- Debounce UI updates
- Virtual scroll for many accounts

### Testing
- Unit tests for account creation
- Integration tests for switching
- E2E tests for full flows
- Security audit annually