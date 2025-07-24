# 🏗️ MOOSH Multi-Wallet System - Step-by-Step Implementation Plan

## 📋 Executive Summary

This plan outlines how to build a professional multi-wallet system for MOOSH that:
1. **Preserves** all existing single-wallet functionality
2. **Adds** optional multi-wallet selection (up to 8 wallets)
3. **Aggregates** ordinals from multiple taproot addresses
4. **Detects** wallet types on import automatically
5. **Builds** incrementally without breaking anything

---

## 🔍 Current System Analysis

### What's Working Now
✅ **Ordinals Gallery**
- Fetches from taproot addresses via Hiro/OrdAPI
- Modal with filtering/sorting
- Performance caching
- Only shows when taproot is selected

✅ **Basic Account System**
- Multiple accounts stored in `state.accounts`
- Account switching via `currentAccountId`
- Create/Import functionality exists

### What Needs Fixing
❌ **Import Issues**
- Doesn't auto-detect wallet types
- Missing addresses after import
- Need manual "Fix Addresses" button

❌ **Account Management**
- No visual indicators for active account
- Can't rename accounts
- No wallet management center

✅ **RECENTLY FIXED** (January 2025)
- ~~Drag & drop account ordering~~ - Removed as unnecessary
- ~~Balance not displaying on account cards~~ - Now shows BTC & USD
- ~~Real-time balance updates~~ - Implemented with caching

---

## 🎯 Implementation Strategy

### Core Principles
1. **Single wallet mode stays default** - Multi-wallet is optional feature
2. **No breaking changes** - Every step maintains existing functionality
3. **Progressive enhancement** - Add features incrementally
4. **Test at each step** - Verify nothing breaks before proceeding

---

## 📅 Phase-by-Phase Implementation

### Phase 0: Pre-Implementation Fixes (Week 0)
**Goal**: Fix existing issues before adding new features

```javascript
// Step 1: Fix address generation in createAccount
async createAccount(name, mnemonic, isImport = false) {
    // Ensure ALL addresses are generated and saved
    const addresses = await this.generateAllAddressTypes(mnemonic);
    
    // Step 2: Add wallet detection for imports
    if (isImport) {
        const detectedType = await this.detectWalletType(mnemonic);
        console.log('[Import] Detected wallet type:', detectedType);
    }
    
    // Step 3: Ensure state persistence
    this.persist();
}

// Step 4: Fix balance fetching per wallet type
async fetchBalanceForAddressType(addressType) {
    const address = this.getAddressForType(addressType);
    return await this.fetchBalance(address);
}
```

### Phase 1: Foundation Enhancement (Week 1)
**Goal**: Upgrade state structure while maintaining compatibility

#### Step 1: Extend State Structure
```javascript
// ADD to existing state (don't replace)
state = {
    // Existing fields remain unchanged
    accounts: [...],
    currentAccountId: 'id',
    
    // NEW: Multi-wallet fields (with defaults)
    walletMode: 'single',  // Default to single mode
    selectedWalletIds: new Set(),  // Empty by default
    multiWalletSettings: {
        enabled: false,  // Feature flag
        maxSelection: 8,
        aggregateData: null
    }
}
```

#### Step 2: Add Mode Toggle (Hidden Initially)
```javascript
// In Dashboard render, add toggle button (hidden by CSS)
createModeToggle() {
    const $ = window.ElementFactory || ElementFactory;
    return $.div({ 
        className: 'wallet-mode-toggle',
        style: 'display: none;'  // Hidden initially
    }, [
        $.button({
            className: state.walletMode === 'single' ? 'active' : '',
            onclick: () => this.setMode('single')
        }, ['Single']),
        $.button({
            className: state.walletMode === 'multi' ? 'active' : '',
            onclick: () => this.setMode('multi')
        }, ['Multi'])
    ]);
}
```

#### Step 3: Backward Compatible State Manager
```javascript
class EnhancedStateManager extends SparkStateManager {
    constructor() {
        super();
        // Ensure new fields exist without breaking old state
        this.state.walletMode = this.state.walletMode || 'single';
        this.state.selectedWalletIds = this.state.selectedWalletIds || new Set();
    }
    
    // All existing methods remain unchanged
    getCurrentAccount() {
        // Works exactly as before in single mode
        if (this.state.walletMode === 'single') {
            return super.getCurrentAccount();
        }
        // Multi-mode logic (inactive initially)
        return this.getSelectedAccounts()[0];
    }
}
```

### Phase 2: Import Detection System (Week 2)
**Goal**: Auto-detect wallet types on import

#### Step 1: Wallet Detection Engine
```javascript
class WalletDetector {
    static async detectWalletType(mnemonic) {
        const paths = {
            xverse: "m/84'/0'/0'",      // Native SegWit
            electrum: "m/0'",           // Legacy
            exodus: "m/44'/0'/0'",      // Legacy BIP44
            ledger: "m/84'/0'/0'",      // Native SegWit
            sparrow: "m/86'/0'/0'"      // Taproot
        };
        
        const results = [];
        
        // Check each path for transactions
        for (const [wallet, path] of Object.entries(paths)) {
            const hasActivity = await this.checkPathActivity(mnemonic, path);
            if (hasActivity) {
                results.push({ wallet, path, ...hasActivity });
            }
        }
        
        return results;
    }
    
    static async checkPathActivity(mnemonic, path) {
        // Derive first 5 addresses
        const addresses = await this.deriveAddresses(mnemonic, path, 5);
        
        // Check blockchain for activity
        for (const addr of addresses) {
            const balance = await this.checkBalance(addr);
            if (balance.totalReceived > 0) {
                return {
                    hasActivity: true,
                    balance: balance.final,
                    address: addr
                };
            }
        }
        
        return { hasActivity: false };
    }
}
```

#### Step 2: Enhanced Import Flow
```javascript
async importWallet() {
    const seed = document.getElementById('importSeedPhrase').value;
    
    // Show loading with progress
    this.showImportProgress('Detecting wallet type...');
    
    // Detect wallet type
    const detected = await WalletDetector.detectWalletType(seed);
    
    if (detected.length > 0) {
        // Show detected wallets
        this.showDetectedWallets(detected);
    } else {
        // No activity found - generate all types
        this.showImportProgress('Generating all address types...');
        await this.importAsNewWallet(seed);
    }
}
```

### Phase 3: Account Management UI (Week 3)
**Goal**: Professional account management interface

#### Step 1: Enhanced Account Button
```javascript
createAccountSelector() {
    const $ = window.ElementFactory || ElementFactory;
    const account = this.getCurrentDisplayAccount();
    
    return $.div({ className: 'account-selector-enhanced' }, [
        $.button({
            className: 'account-button',
            onclick: () => this.showAccountDropdown()
        }, [
            $.span({ className: 'account-icon' }, [account.icon || '👤']),
            $.div({ className: 'account-info' }, [
                $.div({ className: 'account-name' }, [account.name]),
                $.div({ className: 'account-balance' }, [`${account.balance} BTC`])
            ]),
            $.span({ className: 'dropdown-arrow' }, ['▼'])
        ])
    ]);
}
```

#### Step 2: Account Management Modal
```javascript
class AccountManagementCenter {
    render() {
        const $ = window.ElementFactory || ElementFactory;
        const accounts = this.app.state.getAccounts();
        
        return $.div({ className: 'account-management-center' }, [
            $.h2({}, ['Wallet Management Center']),
            
            // Portfolio overview
            $.div({ className: 'portfolio-overview' }, [
                $.h3({}, ['Total Portfolio']),
                $.div({}, [`${accounts.length} wallets`]),
                $.div({}, [`${this.getTotalBalance()} BTC`])
            ]),
            
            // Account list
            $.div({ className: 'accounts-list' }, 
                accounts.map(acc => this.renderAccountCard(acc))
            ),
            
            // Actions
            $.div({ className: 'actions' }, [
                $.button({ onclick: () => this.createNewAccount() }, ['+ Create New']),
                $.button({ onclick: () => this.importAccount() }, ['📥 Import'])
            ])
        ]);
    }
    
    renderAccountCard(account) {
        return $.div({ className: 'account-card' }, [
            $.div({ className: 'account-header' }, [
                $.input({
                    value: account.name,
                    onblur: (e) => this.renameAccount(account.id, e.target.value)
                }),
                $.button({ onclick: () => this.deleteAccount(account.id) }, ['🗑'])
            ]),
            $.div({ className: 'addresses' }, [
                $.div({}, [`SegWit: ${this.truncate(account.addresses.segwit)}`]),
                $.div({}, [`Taproot: ${this.truncate(account.addresses.taproot)}`]),
                $.div({}, [`Spark: ${this.truncate(account.addresses.spark)}`])
            ])
        ]);
    }
}
```

### Phase 4: Multi-Wallet Selection (Week 4)
**Goal**: Enable multi-wallet mode with ordinals aggregation

#### Step 1: Enable Multi-Mode Toggle
```javascript
// Remove display: none from toggle
enableMultiWalletFeature() {
    const toggle = document.querySelector('.wallet-mode-toggle');
    if (toggle) {
        toggle.style.display = 'flex';
    }
    
    // Enable feature flag
    this.state.multiWalletSettings.enabled = true;
}
```

#### Step 2: Multi-Selection UI
```javascript
renderMultiWalletSelector() {
    if (this.state.walletMode !== 'multi') return null;
    
    const $ = window.ElementFactory || ElementFactory;
    const accounts = this.state.accounts;
    const selected = this.state.selectedWalletIds;
    
    return $.div({ className: 'multi-wallet-selector' }, [
        $.h3({}, [`Select Wallets (${selected.size}/8)`]),
        
        ...accounts.map(account => 
            $.label({ className: 'wallet-checkbox' }, [
                $.input({
                    type: 'checkbox',
                    checked: selected.has(account.id),
                    disabled: !selected.has(account.id) && selected.size >= 8,
                    onchange: (e) => this.toggleWalletSelection(account.id, e.target.checked)
                }),
                $.span({}, [account.name]),
                $.span({ className: 'balance' }, [`${account.balance} BTC`])
            ])
        ),
        
        $.div({ className: 'aggregated-info' }, [
            $.div({}, [`Combined Balance: ${this.getAggregatedBalance()} BTC`]),
            $.div({}, [`Total Ordinals: ${this.getAggregatedOrdinalsCount()}`])
        ])
    ]);
}
```

#### Step 3: Ordinals Aggregation
```javascript
class MultiWalletOrdinalsAggregator {
    async getAggregatedOrdinals() {
        const selectedIds = Array.from(this.state.selectedWalletIds);
        const allOrdinals = [];
        
        // Show progress
        this.showProgress('Loading ordinals from multiple wallets...');
        
        // Fetch in parallel with progress
        const promises = selectedIds.map(async (walletId, index) => {
            const wallet = this.state.getWalletById(walletId);
            if (!wallet?.addresses?.taproot) return [];
            
            const ordinals = await this.fetchOrdinalsForAddress(wallet.addresses.taproot);
            
            // Tag with wallet info
            return ordinals.map(ord => ({
                ...ord,
                walletId,
                walletName: wallet.name,
                walletColor: wallet.color
            }));
        });
        
        const results = await Promise.all(promises);
        
        // Flatten and deduplicate
        const aggregated = this.deduplicateOrdinals(results.flat());
        
        return aggregated;
    }
    
    deduplicateOrdinals(ordinals) {
        const unique = new Map();
        
        ordinals.forEach(ord => {
            const key = ord.inscriptionId || ord.id;
            
            if (!unique.has(key) || ord.confirmations > unique.get(key).confirmations) {
                unique.set(key, ord);
            }
        });
        
        return Array.from(unique.values());
    }
}
```

#### Step 4: Enhanced Ordinals Gallery
```javascript
// Update OrdinalsModal to support multi-wallet
class EnhancedOrdinalsModal extends OrdinalsModal {
    async loadInscriptions() {
        if (this.app.state.walletMode === 'single') {
            // Original single wallet logic
            return super.loadInscriptions();
        }
        
        // Multi-wallet aggregation
        const aggregator = new MultiWalletOrdinalsAggregator(this.app);
        this.inscriptions = await aggregator.getAggregatedOrdinals();
        
        // Update UI to show wallet badges
        this.updateInscriptionList();
    }
    
    renderInscriptionCard(inscription) {
        const card = super.renderInscriptionCard(inscription);
        
        // Add wallet badge for multi-mode
        if (this.app.state.walletMode === 'multi' && inscription.walletName) {
            const badge = $.div({ 
                className: 'wallet-badge',
                style: `background: ${inscription.walletColor}`
            }, [inscription.walletName]);
            
            card.appendChild(badge);
        }
        
        return card;
    }
}
```

### Phase 5: Polish & Optimization (Week 5)
**Goal**: Performance, UX, and edge cases

#### Step 1: Smart Caching
```javascript
class SmartCache {
    constructor() {
        this.ordinalsCache = new Map();
        this.balanceCache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutes
    }
    
    getCachedOrdinals(address) {
        const cached = this.ordinalsCache.get(address);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            return cached.data;
        }
        return null;
    }
    
    setCachedOrdinals(address, data) {
        this.ordinalsCache.set(address, {
            data,
            timestamp: Date.now()
        });
    }
}
```

#### Step 2: Error Recovery
```javascript
// Graceful degradation
async loadWithFallback() {
    try {
        return await this.loadAggregatedData();
    } catch (error) {
        console.error('[MultiWallet] Aggregation failed:', error);
        
        // Fallback to single wallet
        this.app.showNotification(
            'Multi-wallet loading failed. Showing current wallet only.',
            'warning'
        );
        
        return await this.loadSingleWalletData();
    }
}
```

---

## 🧪 Testing at Each Phase

### Phase 0 Tests
- [ ] Import wallet generates all addresses
- [ ] Address fixing no longer needed
- [ ] Balances show correctly

### Phase 1 Tests
- [ ] Existing single wallet works unchanged
- [ ] State migration successful
- [ ] No UI changes visible

### Phase 2 Tests
- [ ] Import detects Xverse wallets
- [ ] Import detects Electrum wallets
- [ ] Shows detection results

### Phase 3 Tests
- [ ] Account renaming works
- [ ] Account deletion with confirmation
- [ ] Management center shows all info

### Phase 4 Tests
- [ ] Multi-mode toggle appears
- [ ] Can select up to 8 wallets
- [ ] Ordinals aggregate correctly
- [ ] Deduplication works

### Phase 5 Tests
- [ ] Performance < 3s for 8 wallets
- [ ] Cache works properly
- [ ] Error recovery functions

---

## ⚠️ Critical Considerations

### What Could Go Wrong
1. **State corruption** - Always backup state before changes
2. **Performance issues** - Use progressive loading
3. **API rate limits** - Implement request batching
4. **Memory leaks** - Clear old data properly

### Security Concerns
1. **Multiple seeds in memory** - Clear after use
2. **State persistence** - Encrypt sensitive data
3. **Cross-wallet contamination** - Strict isolation

### Edge Cases
1. **User deletes active wallet** - Auto-switch to first
2. **Import same seed twice** - Detect and handle
3. **No taproot addresses** - Hide ordinals gracefully
4. **API failures** - Cache and retry logic

---

## 📊 Success Metrics

1. **Zero Breaking Changes** - All existing features work
2. **Performance** - Multi-wallet loads < 3 seconds
3. **Reliability** - 99.9% uptime, graceful failures
4. **User Satisfaction** - Intuitive, fast, beautiful

---

## 🚀 Conclusion

This step-by-step plan ensures we build the multi-wallet system without breaking anything. Each phase is independent and adds value. The key is incremental progress with thorough testing at each step.

**Next Step**: Start with Phase 0 - Fix existing issues before adding new features.