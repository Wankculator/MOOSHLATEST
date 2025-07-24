# 🏗️ MOOSH Multi-Wallet System - Master Implementation Plan

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Challenges & Solutions](#technical-challenges--solutions)
3. [Infrastructure Architecture](#infrastructure-architecture)
4. [Data Structure Design](#data-structure-design)
5. [State Management Logic](#state-management-logic)
6. [Performance Optimization Strategy](#performance-optimization-strategy)
7. [Security Considerations](#security-considerations)
8. [Error Handling & Edge Cases](#error-handling--edge-cases)
9. [Implementation Phases](#implementation-phases)
10. [Testing Strategy](#testing-strategy)

---

## 🎯 Executive Summary

### Vision
MOOSH will pioneer the first true multi-wallet aggregation system in the Bitcoin ecosystem, allowing users to manage and view up to 8 wallets simultaneously with combined balances, unified Ordinals galleries, and seamless switching.

### Core Innovation
- **Industry First**: No Bitcoin wallet currently offers true multi-wallet aggregation
- **Unique Value**: See ALL your Bitcoin assets across multiple wallets in one view
- **Technical Edge**: Smart caching and parallel processing for instant updates

---

## 🚀 Recommended Features Before Multi-Wallet Implementation

### 1. **Account Visual Identity System** 🎨
**Priority**: HIGH
**Effort**: 2-3 days
**Value**: Makes multi-wallet selection intuitive

**Implementation**:
- Color-coded account cards (already partially implemented)
- Custom emoji/icon selector for each account
- Account type badges (Hardware/Hot/Cold/Trading)
- Visual activity indicators (last transaction, active/dormant)

**Benefits**:
- Users can quickly identify accounts in multi-wallet mode
- Reduces confusion when managing multiple wallets
- Professional appearance

### 2. **Quick Actions Menu** ⚡
**Priority**: HIGH
**Effort**: 3-4 days
**Value**: Improves single-wallet UX before multi-wallet complexity

**Features**:
- Right-click context menu on account cards
- Quick copy address (with address type selector)
- Instant QR code popup
- Quick send from specific account
- Export account details
- Archive/Hide account option

### 3. **Smart Address Management** 📍
**Priority**: CRITICAL
**Effort**: 4-5 days
**Value**: Fixes current import issues

**Implementation**:
- Auto-detect used address types on import
- Show address derivation paths clearly
- Address usage indicators (which addresses have transactions)
- One-click "Scan for all address types" button
- Address book with labels

**Benefits**:
- Eliminates "Fix Addresses" button need
- Better wallet compatibility
- Users understand their wallet structure

### 4. **Transaction History Enhancement** 📊
**Priority**: MEDIUM
**Effort**: 3-4 days
**Value**: Essential for multi-wallet context

**Features**:
- Per-account transaction history
- Transaction tags/categories
- Export to CSV/JSON
- Search and filter capabilities
- Running balance column

### 5. **Security Enhancements** 🔒
**Priority**: HIGH
**Effort**: 2-3 days
**Value**: Critical before managing multiple wallets

**Implementation**:
- Session timeout settings
- View-only mode toggle
- Export wallet warning system
- Backup reminder system
- Optional PIN for account switching

### 6. **Import Wizard 2.0** 🧙‍♂️
**Priority**: CRITICAL
**Effort**: 5-6 days
**Value**: Smooth onboarding for multi-wallet users

**Features**:
- Step-by-step guided import
- Wallet type detection (Xverse, Electrum, etc.)
- Preview addresses before import
- Batch import multiple wallets
- Import validation and health check

### 7. **Account Templates** 🏗️
**Priority**: LOW
**Effort**: 2 days
**Value**: Quick setup for common use cases

**Templates**:
- Trading Wallet (all address types)
- Ordinals Wallet (taproot focused)
- Hardware Wallet (native segwit)
- Privacy Wallet (spark enabled)

---

## 🎯 Implementation Order Recommendation

**Before Multi-Wallet Phase:**
1. **Week 1**: Smart Address Management + Import Wizard 2.0
2. **Week 2**: Account Visual Identity + Quick Actions Menu  
3. **Week 3**: Security Enhancements + Transaction History

**Why This Order?**
- Fixes critical import issues first
- Builds visual system needed for multi-wallet
- Enhances security before complexity increases
- Each feature works in single-wallet mode

---

## 🚨 Technical Challenges & Solutions

### Challenge 1: Performance at Scale
**Problem**: Loading data for 8 wallets × 5 address types × multiple addresses = potential 200+ API calls

**Solution: Smart Request Batching**
```javascript
class RequestBatcher {
    constructor() {
        this.queue = new Map();
        this.batchTimer = null;
        this.batchSize = 10;
        this.batchDelay = 100; // ms
    }
    
    async addRequest(endpoint, params) {
        return new Promise((resolve, reject) => {
            const key = `${endpoint}:${JSON.stringify(params)}`;
            
            if (!this.queue.has(key)) {
                this.queue.set(key, []);
            }
            
            this.queue.get(key).push({ resolve, reject });
            
            if (!this.batchTimer) {
                this.batchTimer = setTimeout(() => this.processBatch(), this.batchDelay);
            }
        });
    }
    
    async processBatch() {
        const batches = this.createBatches();
        
        for (const batch of batches) {
            await Promise.all(batch.map(req => this.executeRequest(req)));
        }
        
        this.queue.clear();
        this.batchTimer = null;
    }
    
    createBatches() {
        const allRequests = Array.from(this.queue.entries());
        const batches = [];
        
        for (let i = 0; i < allRequests.length; i += this.batchSize) {
            batches.push(allRequests.slice(i, i + this.batchSize));
        }
        
        return batches;
    }
}
```

### Challenge 2: State Synchronization
**Problem**: Keeping UI, cache, and blockchain data in sync across multiple wallets

**Solution: Event-Driven Architecture**
```javascript
class MultiWalletEventBus {
    constructor() {
        this.events = new Map();
        this.subscribers = new Map();
    }
    
    emit(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event handler error for ${event}:`, error);
                }
            });
        }
    }
    
    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
        
        // Return unsubscribe function
        return () => this.subscribers.get(event).delete(callback);
    }
}

// Usage
const eventBus = new MultiWalletEventBus();

eventBus.on('wallet:selected', (walletId) => {
    updateUI(walletId);
    refreshBalance(walletId);
    loadOrdinals(walletId);
});

eventBus.on('balance:updated', ({ walletId, balance }) => {
    updateBalanceCache(walletId, balance);
    recalculateAggregates();
});
```

### Challenge 3: Memory Management
**Problem**: Storing data for 8 wallets could consume significant memory

**Solution: Intelligent Data Lifecycle**
```javascript
class SmartCache {
    constructor(maxSize = 50 * 1024 * 1024) { // 50MB default
        this.cache = new Map();
        this.accessTime = new Map();
        this.dataSize = new Map();
        this.maxSize = maxSize;
        this.currentSize = 0;
    }
    
    set(key, value, priority = 'normal') {
        const size = this.calculateSize(value);
        
        // Evict if necessary
        while (this.currentSize + size > this.maxSize) {
            this.evictLRU();
        }
        
        this.cache.set(key, value);
        this.dataSize.set(key, size);
        this.accessTime.set(key, Date.now());
        this.currentSize += size;
    }
    
    get(key) {
        if (this.cache.has(key)) {
            this.accessTime.set(key, Date.now());
            return this.cache.get(key);
        }
        return null;
    }
    
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, time] of this.accessTime) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            const size = this.dataSize.get(oldestKey);
            this.cache.delete(oldestKey);
            this.accessTime.delete(oldestKey);
            this.dataSize.delete(oldestKey);
            this.currentSize -= size;
        }
    }
}
```

### Challenge 4: Ordinals Deduplication
**Problem**: Same ordinal could appear in multiple wallets (transferred between user's wallets)

**Solution: Smart Deduplication Logic**
```javascript
class OrdinalDeduplicator {
    deduplicateOrdinals(ordinalsArrays) {
        const uniqueOrdinals = new Map();
        const transferMap = new Map(); // Track transfers between wallets
        
        // First pass: identify all ordinals
        ordinalsArrays.forEach((ordinals, walletIndex) => {
            ordinals.forEach(ordinal => {
                const key = ordinal.inscriptionId || `${ordinal.txid}:${ordinal.vout}`;
                
                if (!uniqueOrdinals.has(key)) {
                    uniqueOrdinals.set(key, {
                        ...ordinal,
                        wallets: [walletIndex],
                        primaryWallet: walletIndex
                    });
                } else {
                    // Found duplicate - track transfer
                    const existing = uniqueOrdinals.get(key);
                    existing.wallets.push(walletIndex);
                    
                    // Determine current owner based on UTXO status
                    if (ordinal.spent === false && existing.spent !== false) {
                        existing.primaryWallet = walletIndex;
                        existing.spent = false;
                    }
                }
            });
        });
        
        return Array.from(uniqueOrdinals.values())
            .filter(ordinal => !ordinal.spent) // Only show unspent
            .sort((a, b) => a.inscriptionNumber - b.inscriptionNumber);
    }
}
```

### Challenge 5: Transaction Complexity
**Problem**: Sending from specific wallet when multiple are selected

**Solution: Smart Transaction Router**
```javascript
class MultiWalletTransactionManager {
    constructor(app) {
        this.app = app;
    }
    
    async initiateSend(amount, recipient) {
        const mode = this.app.state.get('walletMode');
        
        if (mode === 'single') {
            return this.singleWalletSend(amount, recipient);
        }
        
        // Multi-wallet mode
        const selectedWallets = this.getSelectedWalletsWithBalance();
        
        if (selectedWallets.length === 0) {
            throw new Error('No selected wallets have sufficient balance');
        }
        
        // Show wallet selector modal
        return this.showWalletSelectorForSend(selectedWallets, amount, recipient);
    }
    
    getSelectedWalletsWithBalance() {
        const selected = Array.from(this.app.state.get('selectedWallets'));
        return selected
            .map(id => ({
                id,
                wallet: this.app.state.getWalletById(id),
                balance: this.app.state.getWalletBalance(id)
            }))
            .filter(w => w.balance > 0)
            .sort((a, b) => b.balance - a.balance);
    }
    
    showWalletSelectorForSend(wallets, amount, recipient) {
        const modal = new WalletSelectorModal({
            title: 'Select Wallet to Send From',
            wallets,
            amount,
            onSelect: (walletId) => {
                this.executeSend(walletId, amount, recipient);
            }
        });
        
        modal.show();
    }
}
```

---

## 🏛️ Infrastructure Architecture

### System Components
```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │MultiWallet   │  │ Aggregation  │  │  Smart    ││
│  │  Manager     │  │   Engine     │  │  Cache    ││
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘│
│         │                  │                 │      │
│  ┌──────▼──────────────────▼─────────────────▼────┐│
│  │           Event Bus & State Manager            ││
│  └────────────────────┬───────────────────────────┘│
│                       │                             │
├───────────────────────┼─────────────────────────────┤
│                       │                             │
│  ┌────────────────────▼───────────────────────────┐│
│  │              API Gateway Layer                  ││
│  │  ┌─────────┐  ┌─────────┐  ┌────────────┐    ││
│  │  │ Request │  │  Rate   │  │   Error    │    ││
│  │  │ Batcher │  │ Limiter │  │  Handler   │    ││
│  │  └─────────┘  └─────────┘  └────────────┘    ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
├─────────────────────────────────────────────────────┤
│                  External Services                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐│
│  │Mempool  │  │Blockchain│  │Ordinals │  │Price   ││
│  │  API    │  │   APIs   │  │  APIs   │  │Feeds   ││
│  └─────────┘  └─────────┘  └─────────┘  └────────┘│
└─────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### MultiWallet Manager
- Wallet selection logic
- Mode switching (single/multi)
- Wallet lifecycle management
- State persistence

#### Aggregation Engine
- Combine balances
- Merge ordinals collections
- Deduplicate transactions
- Calculate portfolio metrics

#### Smart Cache
- LRU eviction
- TTL management
- Size constraints
- Priority caching

#### Event Bus
- State change notifications
- UI update triggers
- Cache invalidation
- Error propagation

---

## 📊 Data Structure Design

### Core State Structure
```javascript
const multiWalletState = {
    // Version for migrations
    version: 2,
    
    // Wallet mode
    mode: 'single' | 'multi',
    
    // All wallets
    wallets: {
        'wallet_uuid_1': {
            id: 'wallet_uuid_1',
            name: 'Main Wallet',
            type: 'generated' | 'imported',
            origin: 'moosh' | 'xverse' | 'electrum' | 'other',
            
            // Encrypted seed storage
            encryptedSeed: 'encrypted_base64_string',
            
            // Derivation paths used
            derivationPaths: {
                legacy: "m/44'/0'/0'",
                nestedSegwit: "m/49'/0'/0'",
                nativeSegwit: "m/84'/0'/0'",
                taproot: "m/86'/0'/0'"
            },
            
            // All addresses by type
            addresses: {
                legacy: {
                    external: ['1abc...', '1def...'],
                    change: ['1ghi...', '1jkl...'],
                    used: new Set(['1abc...'])
                },
                nestedSegwit: { /* same structure */ },
                nativeSegwit: { /* same structure */ },
                taproot: { /* same structure */ },
                spark: {
                    addresses: ['sp1...'],
                    viewKey: 'view_key_hex'
                }
            },
            
            // Balances by address type
            balances: {
                legacy: { confirmed: 0, unconfirmed: 0 },
                nestedSegwit: { confirmed: 0, unconfirmed: 0 },
                nativeSegwit: { confirmed: 0, unconfirmed: 0 },
                taproot: { confirmed: 0, unconfirmed: 0 },
                spark: { confirmed: 0, unconfirmed: 0 },
                total: { confirmed: 0, unconfirmed: 0 },
                lastUpdate: 1234567890
            },
            
            // Metadata
            metadata: {
                createdAt: 1234567890,
                lastAccessed: 1234567890,
                color: '#FF6B6B',
                icon: '💰',
                tags: ['trading', 'hot-wallet'],
                notes: 'Main trading wallet'
            },
            
            // Performance data
            cache: {
                utxos: { data: [], timestamp: 0 },
                transactions: { data: [], timestamp: 0 },
                ordinals: { data: [], timestamp: 0 }
            }
        }
    },
    
    // Active selections
    activeWalletId: 'wallet_uuid_1', // For single mode
    selectedWalletIds: Set(['wallet_uuid_1', 'wallet_uuid_2']), // For multi mode
    
    // Aggregated data (computed)
    aggregated: {
        balances: {
            total: { confirmed: 0, unconfirmed: 0 },
            byWallet: {},
            byCurrency: { btc: 0, spark: 0, usd: 0 }
        },
        ordinals: {
            items: [],
            count: 0,
            totalValue: 0,
            lastUpdate: 0
        },
        transactions: {
            recent: [],
            count: 0,
            lastUpdate: 0
        }
    },
    
    // UI State
    ui: {
        ordinalsView: 'grid' | 'list' | 'grouped',
        sortBy: 'number' | 'recent' | 'wallet',
        filterBy: null | { wallet: 'id', type: 'filter_type' },
        isLoading: {
            balances: false,
            ordinals: false,
            transactions: false
        }
    },
    
    // Settings
    settings: {
        maxSelectedWallets: 8,
        autoRefreshInterval: 60000, // 1 minute
        cacheExpiry: 300000, // 5 minutes
        enableNotifications: true,
        defaultView: 'single'
    }
};
```

---

## 🧠 State Management Logic

### State Manager Extensions
```javascript
class EnhancedStateManager extends SparkStateManager {
    constructor() {
        super();
        this.initializeMultiWalletState();
        this.setupEventListeners();
        this.startAutoRefresh();
    }
    
    initializeMultiWalletState() {
        // Ensure backward compatibility
        if (!this.state.wallets) {
            this.migrateToMultiWalletStructure();
        }
        
        // Initialize aggregation engine
        this.aggregationEngine = new AggregationEngine(this);
        
        // Initialize cache manager
        this.cacheManager = new SmartCache();
        
        // Initialize event bus
        this.eventBus = new MultiWalletEventBus();
    }
    
    // Smart wallet switching logic
    async switchWalletMode(newMode) {
        const oldMode = this.state.mode;
        
        if (oldMode === newMode) return;
        
        this.state.mode = newMode;
        
        if (newMode === 'multi') {
            // Initialize with current single wallet
            this.state.selectedWalletIds = new Set([this.state.activeWalletId]);
            await this.refreshAggregatedData();
        } else {
            // Switch to most recently used wallet
            const lastUsed = this.getMostRecentlyUsedWallet();
            this.state.activeWalletId = lastUsed.id;
        }
        
        this.eventBus.emit('mode:changed', { oldMode, newMode });
        this.persist();
    }
    
    // Intelligent wallet selection
    async toggleWalletSelection(walletId) {
        if (this.state.mode !== 'multi') {
            await this.switchWalletMode('multi');
        }
        
        const selected = this.state.selectedWalletIds;
        
        if (selected.has(walletId)) {
            // Prevent removing last wallet
            if (selected.size > 1) {
                selected.delete(walletId);
                this.eventBus.emit('wallet:deselected', walletId);
            } else {
                this.app.showNotification('Cannot deselect last wallet', 'warning');
                return;
            }
        } else {
            // Check limit
            if (selected.size >= this.state.settings.maxSelectedWallets) {
                this.app.showNotification(
                    `Maximum ${this.state.settings.maxSelectedWallets} wallets can be selected`,
                    'warning'
                );
                return;
            }
            
            selected.add(walletId);
            this.eventBus.emit('wallet:selected', walletId);
        }
        
        // Refresh aggregated data
        await this.refreshAggregatedData();
        this.persist();
    }
    
    // Efficient data aggregation
    async refreshAggregatedData() {
        const selectedIds = Array.from(this.state.selectedWalletIds);
        
        // Set loading states
        this.setLoadingState('aggregation', true);
        
        try {
            // Parallel fetch with progress tracking
            const results = await this.parallelFetchWithProgress(selectedIds, {
                balances: this.fetchWalletBalance.bind(this),
                ordinals: this.fetchWalletOrdinals.bind(this),
                transactions: this.fetchWalletTransactions.bind(this)
            });
            
            // Aggregate results
            this.state.aggregated = {
                balances: this.aggregateBalances(results.balances),
                ordinals: this.aggregateOrdinals(results.ordinals),
                transactions: this.aggregateTransactions(results.transactions),
                lastUpdate: Date.now()
            };
            
            this.eventBus.emit('aggregation:complete', this.state.aggregated);
            
        } catch (error) {
            console.error('[MultiWallet] Aggregation failed:', error);
            this.eventBus.emit('aggregation:error', error);
            throw error;
            
        } finally {
            this.setLoadingState('aggregation', false);
            this.persist();
        }
    }
    
    // Smart caching with TTL
    async fetchWithCache(key, fetcher, ttl = 300000) {
        const cached = this.cacheManager.get(key);
        
        if (cached && (Date.now() - cached.timestamp < ttl)) {
            return cached.data;
        }
        
        const data = await fetcher();
        this.cacheManager.set(key, { data, timestamp: Date.now() });
        
        return data;
    }
}
```

---

## ⚡ Performance Optimization Strategy

### 1. Progressive Loading
```javascript
class ProgressiveLoader {
    async loadWalletData(walletIds) {
        // Phase 1: Critical data (balances)
        const balances = await this.loadBalances(walletIds);
        this.updateUI({ balances });
        
        // Phase 2: Important data (recent transactions)
        const recentTx = await this.loadRecentTransactions(walletIds, 10);
        this.updateUI({ recentTx });
        
        // Phase 3: Nice-to-have (ordinals, full history)
        const [ordinals, fullHistory] = await Promise.all([
            this.loadOrdinals(walletIds),
            this.loadFullHistory(walletIds)
        ]);
        
        this.updateUI({ ordinals, fullHistory });
    }
}
```

### 2. Virtual Scrolling for Large Collections
```javascript
class VirtualOrdinalsList {
    constructor(container, items, itemHeight = 200) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleRange = { start: 0, end: 20 };
        
        this.setupScrollListener();
        this.render();
    }
    
    setupScrollListener() {
        this.container.addEventListener('scroll', 
            this.throttle(() => this.onScroll(), 100)
        );
    }
    
    onScroll() {
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;
        
        const start = Math.floor(scrollTop / this.itemHeight);
        const end = Math.ceil((scrollTop + containerHeight) / this.itemHeight);
        
        if (start !== this.visibleRange.start || end !== this.visibleRange.end) {
            this.visibleRange = { start, end };
            this.render();
        }
    }
    
    render() {
        const fragment = document.createDocumentFragment();
        const { start, end } = this.visibleRange;
        
        // Spacer for items above
        const spacerTop = document.createElement('div');
        spacerTop.style.height = `${start * this.itemHeight}px`;
        fragment.appendChild(spacerTop);
        
        // Visible items
        for (let i = start; i < end && i < this.items.length; i++) {
            fragment.appendChild(this.renderItem(this.items[i]));
        }
        
        // Spacer for items below
        const spacerBottom = document.createElement('div');
        spacerBottom.style.height = `${(this.items.length - end) * this.itemHeight}px`;
        fragment.appendChild(spacerBottom);
        
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }
}
```

### 3. Request Deduplication
```javascript
class RequestDeduplicator {
    constructor() {
        this.inFlight = new Map();
    }
    
    async request(key, fetcher) {
        // If request is already in flight, return same promise
        if (this.inFlight.has(key)) {
            return this.inFlight.get(key);
        }
        
        // Create new request
        const promise = fetcher().finally(() => {
            this.inFlight.delete(key);
        });
        
        this.inFlight.set(key, promise);
        return promise;
    }
}
```

---

## 🔒 Security Considerations

### 1. Seed Encryption
```javascript
class SecureWalletStorage {
    async encryptSeed(seed, password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(seed);
        
        // Derive key from password
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        
        // Encrypt
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        
        // Combine salt + iv + encrypted data
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        
        return btoa(String.fromCharCode(...combined));
    }
}
```

### 2. Memory Cleanup
```javascript
class SecureMemory {
    static clearSensitiveData(data) {
        if (typeof data === 'string') {
            // For strings, we can't truly clear them, but we can remove references
            data = null;
        } else if (data instanceof Uint8Array) {
            // For typed arrays, we can overwrite
            crypto.getRandomValues(data);
            data.fill(0);
        }
    }
    
    static createSecureString(value) {
        // Create a proxy that clears on access
        let secured = value;
        let accessed = false;
        
        return new Proxy({}, {
            get(target, prop) {
                if (prop === 'value' && !accessed) {
                    accessed = true;
                    const temp = secured;
                    secured = null;
                    return temp;
                }
                return undefined;
            }
        });
    }
}
```

---

## 🛡️ Error Handling & Edge Cases

### Comprehensive Error Handling
```javascript
class MultiWalletErrorHandler {
    constructor(app) {
        this.app = app;
        this.errorLog = [];
        this.maxLogSize = 100;
    }
    
    async handleError(error, context) {
        // Log error
        this.logError(error, context);
        
        // Categorize error
        const category = this.categorizeError(error);
        
        // Handle based on category
        switch (category) {
            case 'network':
                return this.handleNetworkError(error, context);
            case 'validation':
                return this.handleValidationError(error, context);
            case 'state':
                return this.handleStateError(error, context);
            case 'security':
                return this.handleSecurityError(error, context);
            default:
                return this.handleGenericError(error, context);
        }
    }
    
    handleNetworkError(error, context) {
        const retryCount = context.retryCount || 0;
        
        if (retryCount < 3) {
            // Exponential backoff
            const delay = Math.pow(2, retryCount) * 1000;
            
            this.app.showNotification(
                `Network error. Retrying in ${delay/1000}s...`,
                'warning'
            );
            
            setTimeout(() => {
                context.retry({ ...context, retryCount: retryCount + 1 });
            }, delay);
            
        } else {
            this.app.showNotification(
                'Network error. Please check your connection.',
                'error'
            );
        }
    }
    
    handleStateError(error, context) {
        console.error('[StateError]', error, context);
        
        // Attempt recovery
        if (context.recovery) {
            this.app.showNotification(
                'Recovering from state error...',
                'info'
            );
            
            try {
                context.recovery();
            } catch (recoveryError) {
                this.handleCriticalError(recoveryError);
            }
        } else {
            this.handleCriticalError(error);
        }
    }
    
    handleCriticalError(error) {
        // Last resort - reload with error state
        localStorage.setItem('error_recovery', JSON.stringify({
            error: error.toString(),
            timestamp: Date.now(),
            state: this.app.state.getRecoverySnapshot()
        }));
        
        this.app.showNotification(
            'Critical error occurred. Reloading...',
            'error'
        );
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}
```

### Edge Cases Handling
```javascript
const edgeCases = {
    // Empty wallet selection
    handleEmptySelection: () => {
        if (state.selectedWalletIds.size === 0) {
            // Auto-select first wallet
            const firstWallet = Object.keys(state.wallets)[0];
            if (firstWallet) {
                state.selectedWalletIds.add(firstWallet);
            } else {
                // No wallets at all - redirect to create
                router.navigate('/create-wallet');
            }
        }
    },
    
    // Duplicate ordinals across wallets
    handleDuplicateOrdinals: (ordinals) => {
        const seen = new Map();
        return ordinals.filter(ord => {
            const key = ord.inscriptionId;
            const existing = seen.get(key);
            
            if (!existing || ord.confirmations > existing.confirmations) {
                seen.set(key, ord);
                return true;
            }
            return false;
        });
    },
    
    // Wallet deletion while selected
    handleWalletDeletion: (deletedId) => {
        // Remove from selection
        state.selectedWalletIds.delete(deletedId);
        
        // If it was active in single mode
        if (state.mode === 'single' && state.activeWalletId === deletedId) {
            const remaining = Object.keys(state.wallets);
            if (remaining.length > 0) {
                state.activeWalletId = remaining[0];
            } else {
                router.navigate('/welcome');
            }
        }
        
        // Ensure at least one selected in multi mode
        if (state.mode === 'multi' && state.selectedWalletIds.size === 0) {
            switchToSingleMode();
        }
    },
    
    // Import collision
    handleImportCollision: async (existingSeed, newSeed) => {
        if (existingSeed === newSeed) {
            const existing = findWalletBySeed(existingSeed);
            
            const result = await showModal({
                title: 'Wallet Already Exists',
                message: `This seed is already imported as "${existing.name}"`,
                buttons: [
                    { text: 'Go to Wallet', value: 'goto' },
                    { text: 'Import Anyway', value: 'import' },
                    { text: 'Cancel', value: 'cancel' }
                ]
            });
            
            switch (result) {
                case 'goto':
                    switchToWallet(existing.id);
                    break;
                case 'import':
                    return createDuplicateWallet(newSeed);
                default:
                    return null;
            }
        }
    }
};
```

---

## 📅 Implementation Phases

### Phase 0: Pre-Implementation (COMPLETED ✅)
**Goal**: Fix critical issues before multi-wallet implementation

**Completed Tasks**:
1. ✅ Removed drag & drop account ordering (unnecessary feature)
2. ✅ Implemented real-time balance display on account cards
3. ✅ Added BTC/USD price conversion with CoinGecko API
4. ✅ Created smart caching system for balance data
5. ✅ Added refresh buttons for manual balance updates

**Results**:
- Account cards now show live BTC balances
- USD conversion displays below BTC amount
- 60-second cache reduces API calls
- Professional balance display with loading states

### Phase 1: Foundation (Week 1)
**Goal**: Establish multi-wallet infrastructure without breaking existing functionality

**Tasks**:
1. Implement new state structure with migration
2. Create MultiWalletManager class
3. Add mode toggle UI (disabled)
4. Set up event bus system
5. Create comprehensive test suite

**Deliverables**:
- Working state migration
- All existing features still functional
- Event system operational
- 90% test coverage

### Phase 2: Core Multi-Wallet (Week 2)
**Goal**: Enable basic multi-wallet selection and viewing

**Tasks**:
1. Enable mode toggle
2. Implement wallet selection UI
3. Create aggregation engine
4. Add combined balance display
5. Implement smart caching

**Deliverables**:
- Multi-wallet mode functional
- Can select up to 8 wallets
- See combined balances
- Fast switching performance

### Phase 3: Ordinals Integration (Week 3)
**Goal**: Unified ordinals gallery with smart features

**Tasks**:
1. Implement ordinals aggregation
2. Add deduplication logic
3. Create grouped view options
4. Add filtering/sorting
5. Implement virtual scrolling

**Deliverables**:
- Combined ordinals gallery
- Multiple view modes
- Smooth performance with 1000+ items
- Smart deduplication working

### Phase 4: Advanced Features (Week 4)
**Goal**: Polish and advanced functionality

**Tasks**:
1. Add wallet import detection
2. Implement transaction routing
3. Create wallet analytics
4. Add bulk operations
5. Performance optimization

**Deliverables**:
- Auto-detect wallet types on import
- Send from specific wallet in multi-mode
- Portfolio analytics
- < 500ms mode switching

### Phase 5: Testing & Polish (Week 5)
**Goal**: Production-ready quality

**Tasks**:
1. Comprehensive error handling
2. Edge case testing
3. Performance profiling
4. Security audit
5. User acceptance testing

**Deliverables**:
- Zero critical bugs
- All edge cases handled
- Security review passed
- 95% test coverage

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('MultiWalletManager', () => {
    describe('Wallet Selection', () => {
        it('should not exceed maximum wallet limit', async () => {
            const manager = new MultiWalletManager();
            
            // Add 8 wallets
            for (let i = 0; i < 8; i++) {
                await manager.selectWallet(`wallet_${i}`);
            }
            
            // Try to add 9th
            const result = await manager.selectWallet('wallet_9');
            expect(result.error).toBe('Maximum wallet limit reached');
            expect(manager.selectedWallets.size).toBe(8);
        });
        
        it('should handle duplicate ordinals correctly', async () => {
            const ordinals = [
                { inscriptionId: '123', wallet: 'A', block: 100 },
                { inscriptionId: '123', wallet: 'B', block: 200 }
            ];
            
            const deduplicated = manager.deduplicateOrdinals(ordinals);
            expect(deduplicated.length).toBe(1);
            expect(deduplicated[0].wallet).toBe('B'); // Most recent
        });
    });
});
```

### Integration Tests
```javascript
describe('Multi-Wallet System Integration', () => {
    it('should aggregate balances correctly', async () => {
        // Setup 3 test wallets
        const wallets = await createTestWallets(3);
        
        // Select all 3
        await multiWalletSystem.setMode('multi');
        await multiWalletSystem.selectWallets(wallets.map(w => w.id));
        
        // Verify aggregation
        const aggregated = await multiWalletSystem.getAggregatedData();
        
        expect(aggregated.balance.total).toBe(
            wallets.reduce((sum, w) => sum + w.balance, 0)
        );
    });
});
```

### Performance Tests
```javascript
describe('Performance', () => {
    it('should handle 8 wallets with 1000 ordinals each', async () => {
        const startTime = performance.now();
        
        // Create scenario
        const wallets = await createWalletsWithOrdinals(8, 1000);
        await multiWalletSystem.selectAll(wallets);
        
        // Measure aggregation time
        await multiWalletSystem.refreshAggregatedData();
        
        const duration = performance.now() - startTime;
        expect(duration).toBeLessThan(3000); // 3 seconds max
    });
});
```

---

## 🎯 Success Criteria

1. **Performance**
   - Mode switching: < 500ms
   - Aggregation refresh: < 3s for 8 wallets
   - UI remains responsive (60 fps)

2. **Reliability**
   - Zero data loss
   - Graceful error recovery
   - Offline capability

3. **User Experience**
   - Intuitive mode switching
   - Clear visual feedback
   - Smooth animations

4. **Scalability**
   - Handles 10,000+ ordinals
   - Supports 100+ wallets (though UI limits to 8 selected)
   - Efficient memory usage

---

## 🚀 Conclusion

This multi-wallet system will be a game-changer for Bitcoin power users. By following this plan, we'll build a robust, performant, and user-friendly feature that sets MOOSH apart from every other Bitcoin wallet.

The key to success is:
1. **Incremental implementation** - Don't break existing features
2. **Smart architecture** - Event-driven, cached, and efficient
3. **Comprehensive testing** - Cover all edge cases
4. **User-focused design** - Make it intuitive and fast

Ready to build the future of Bitcoin wallet management! 🚀