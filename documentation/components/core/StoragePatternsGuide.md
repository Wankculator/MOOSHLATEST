# Storage Patterns Guide

**Last Updated**: 2025-07-21  
**Critical**: YES - Improper storage can compromise security and lose user data  
**Storage Limits**: localStorage ~10MB, sessionStorage ~10MB

## Overview

MOOSH Wallet uses multiple storage strategies to balance security, performance, and reliability. This guide documents what can and cannot be stored, encryption requirements, and migration strategies.

## Storage Principles

1. **Never Store Sensitive Data Unencrypted** - Private keys, mnemonics require encryption
2. **Respect Storage Limits** - Monitor and clean up old data
3. **Plan for Migration** - Storage schemas will evolve
4. **Handle Failures Gracefully** - Storage can fail or be disabled
5. **Use Appropriate Storage Type** - localStorage vs sessionStorage vs memory

## Storage Decision Tree

```
Is the data sensitive (keys, mnemonics)?
├─ YES → Encrypt before storage OR keep in memory only
└─ NO → Is it needed across sessions?
    ├─ YES → Use localStorage with integrity checks
    └─ NO → Is it needed across tabs?
        ├─ YES → Use sessionStorage
        └─ NO → Keep in memory only
```

## What CAN and CANNOT Be Stored

### ❌ NEVER Store Unencrypted

```javascript
// NEVER store these without encryption:
- Private keys
- Seed phrases / Mnemonics  
- Passwords
- API keys
- Personal information
- Transaction signing data

// BAD EXAMPLES:
localStorage.setItem('privateKey', wallet.privateKey); // NEVER!
localStorage.setItem('mnemonic', seedPhrase); // NEVER!
localStorage.setItem('password', userPassword); // NEVER!
```

### ✅ Safe to Store (Non-Sensitive)

```javascript
// These can be stored in plain text:
- Public addresses
- Account names/labels
- UI preferences
- Price cache (with expiry)
- Transaction history (public data)
- Language settings
- Theme preferences

// GOOD EXAMPLES:
localStorage.setItem('theme', 'dark');
localStorage.setItem('currency', 'USD');
localStorage.setItem('accountLabels', JSON.stringify(labels));
```

### ⚠️ Store with Caution

```javascript
// These need integrity checks or encryption:
- Account balances (integrity check)
- Transaction cache (integrity check)
- Wallet metadata (partial encryption)
- Session tokens (sessionStorage only)
- Temporary data (with expiry)
```

## Storage Implementation Patterns

### Pattern 1: Secure Encrypted Storage

```javascript
class SecureWalletStorage {
    constructor() {
        this.storageKey = 'moosh_secure_vault';
        this.metadataKey = 'moosh_vault_metadata';
    }
    
    // Store sensitive wallet data
    async storeWallet(walletData, password) {
        try {
            // Validate input
            if (!walletData.mnemonic || !walletData.accounts) {
                throw new Error('Invalid wallet data');
            }
            
            // Generate unique salt for this wallet
            const salt = SecureRandom.getRandomBytes(16);
            
            // Derive encryption key
            const keyMaterial = await this.deriveKeyMaterial(password);
            const cryptoKey = await this.deriveKey(keyMaterial, salt);
            
            // Prepare data for encryption
            const sensitiveData = {
                mnemonic: walletData.mnemonic,
                accounts: walletData.accounts.map(acc => ({
                    privateKey: acc.privateKey,
                    seed: acc.seed
                })),
                timestamp: Date.now()
            };
            
            // Encrypt
            const iv = SecureRandom.getRandomBytes(12);
            const encrypted = await this.encrypt(sensitiveData, cryptoKey, iv);
            
            // Store encrypted data
            const vault = {
                version: 1,
                encrypted: Array.from(new Uint8Array(encrypted)),
                salt: Array.from(salt),
                iv: Array.from(iv)
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(vault));
            
            // Store non-sensitive metadata separately
            this.storeMetadata(walletData);
            
            ComplianceUtils.log('SecureStorage', 'Wallet stored securely');
            return true;
            
        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Failed to store wallet: ' + error.message, 'error');
            return false;
        }
    }
    
    // Retrieve and decrypt wallet
    async retrieveWallet(password) {
        try {
            const vaultData = localStorage.getItem(this.storageKey);
            if (!vaultData) {
                return null;
            }
            
            const vault = JSON.parse(vaultData);
            
            // Check version for migration
            if (vault.version !== 1) {
                throw new Error('Unsupported vault version');
            }
            
            // Derive key with stored salt
            const keyMaterial = await this.deriveKeyMaterial(password);
            const cryptoKey = await this.deriveKey(
                keyMaterial,
                new Uint8Array(vault.salt)
            );
            
            // Decrypt
            const decrypted = await this.decrypt(
                new Uint8Array(vault.encrypted),
                cryptoKey,
                new Uint8Array(vault.iv)
            );
            
            // Merge with metadata
            const metadata = this.retrieveMetadata();
            
            return {
                ...decrypted,
                ...metadata
            };
            
        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Failed to retrieve wallet', 'error');
            return null;
        }
    }
    
    // Store non-sensitive metadata
    storeMetadata(walletData) {
        const metadata = {
            accounts: walletData.accounts.map(acc => ({
                id: acc.id,
                name: acc.name,
                color: acc.color,
                addresses: acc.addresses, // Public addresses are safe
                createdAt: acc.createdAt
            })),
            preferences: walletData.preferences,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    }
    
    retrieveMetadata() {
        try {
            const data = localStorage.getItem(this.metadataKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }
    
    // Encryption helpers
    async deriveKeyMaterial(password) {
        const encoder = new TextEncoder();
        return crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
    }
    
    async deriveKey(keyMaterial, salt) {
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }
    
    async encrypt(data, key, iv) {
        const encoder = new TextEncoder();
        return crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(JSON.stringify(data))
        );
    }
    
    async decrypt(encrypted, key, iv) {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        );
        
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    }
    
    // Check if wallet exists
    hasStoredWallet() {
        return localStorage.getItem(this.storageKey) !== null;
    }
    
    // Remove all wallet data
    clearWallet() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.metadataKey);
        ComplianceUtils.log('SecureStorage', 'Wallet data cleared');
    }
}

// USAGE:
const storage = new SecureWalletStorage();

// Store wallet
await storage.storeWallet({
    mnemonic: 'word1 word2 ...',
    accounts: [...],
    preferences: {...}
}, userPassword);

// Retrieve wallet
const wallet = await storage.retrieveWallet(userPassword);
if (!wallet) {
    // Wrong password or no wallet
}
```

### Pattern 2: Cache Storage with Expiry

```javascript
class CacheStorage {
    constructor(prefix = 'moosh_cache_') {
        this.prefix = prefix;
        this.maxAge = 3600000; // 1 hour default
    }
    
    // Store with automatic expiry
    set(key, value, maxAgeMs = this.maxAge) {
        const cacheData = {
            value: value,
            timestamp: Date.now(),
            expiry: Date.now() + maxAgeMs
        };
        
        try {
            localStorage.setItem(
                this.prefix + key,
                JSON.stringify(cacheData)
            );
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.cleanup();
                // Try once more
                try {
                    localStorage.setItem(
                        this.prefix + key,
                        JSON.stringify(cacheData)
                    );
                    return true;
                } catch (e2) {
                    ComplianceUtils.log('CacheStorage', 'Storage quota exceeded', 'error');
                    return false;
                }
            }
            return false;
        }
    }
    
    // Get with expiry check
    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            if (!data) return null;
            
            const cacheData = JSON.parse(data);
            
            // Check expiry
            if (Date.now() > cacheData.expiry) {
                this.delete(key);
                return null;
            }
            
            return cacheData.value;
        } catch (e) {
            return null;
        }
    }
    
    // Delete specific key
    delete(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        
        // Find expired keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key.startsWith(this.prefix)) continue;
            
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.expiry && data.expiry < now) {
                    keysToDelete.push(key);
                }
            } catch (e) {
                // Invalid data, delete it
                keysToDelete.push(key);
            }
        }
        
        // Delete expired keys
        keysToDelete.forEach(key => localStorage.removeItem(key));
        
        ComplianceUtils.log('CacheStorage', `Cleaned up ${keysToDelete.length} expired entries`);
        return keysToDelete.length;
    }
    
    // Get cache statistics
    getStats() {
        let count = 0;
        let totalSize = 0;
        let expired = 0;
        const now = Date.now();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key.startsWith(this.prefix)) continue;
            
            count++;
            const value = localStorage.getItem(key);
            totalSize += key.length + value.length;
            
            try {
                const data = JSON.parse(value);
                if (data.expiry < now) expired++;
            } catch (e) {
                // Invalid entry
            }
        }
        
        return {
            entries: count,
            sizeKB: (totalSize / 1024).toFixed(2),
            expired: expired
        };
    }
}

// USAGE:
const priceCache = new CacheStorage('price_');

// Cache API response for 5 minutes
priceCache.set('btc_usd', {
    price: 45000,
    change24h: 2.5
}, 300000);

// Retrieve (returns null if expired)
const cachedPrice = priceCache.get('btc_usd');

// Clean up periodically
setInterval(() => {
    priceCache.cleanup();
}, 600000); // Every 10 minutes
```

### Pattern 3: Storage with Integrity Checks

```javascript
class IntegrityStorage {
    // Store with checksum
    static store(key, data) {
        const stored = {
            data: data,
            checksum: this.calculateChecksum(data),
            timestamp: Date.now(),
            version: 1
        };
        
        try {
            localStorage.setItem(key, JSON.stringify(stored));
            return true;
        } catch (e) {
            ComplianceUtils.log('IntegrityStorage', 'Failed to store: ' + e.message, 'error');
            return false;
        }
    }
    
    // Retrieve and verify
    static retrieve(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            const parsed = JSON.parse(stored);
            
            // Version check
            if (parsed.version !== 1) {
                ComplianceUtils.log('IntegrityStorage', 'Version mismatch for ' + key, 'warn');
                return null;
            }
            
            // Integrity check
            const calculatedChecksum = this.calculateChecksum(parsed.data);
            if (calculatedChecksum !== parsed.checksum) {
                ComplianceUtils.log('IntegrityStorage', 'Integrity check failed for ' + key, 'error');
                localStorage.removeItem(key); // Remove corrupted data
                return null;
            }
            
            return {
                data: parsed.data,
                timestamp: parsed.timestamp
            };
            
        } catch (e) {
            ComplianceUtils.log('IntegrityStorage', 'Failed to retrieve: ' + e.message, 'error');
            return null;
        }
    }
    
    // Calculate checksum using Web Crypto API
    static async calculateChecksum(data) {
        const encoder = new TextEncoder();
        const dataStr = JSON.stringify(data);
        const encoded = encoder.encode(dataStr);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        return hashArray
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    // Simple checksum for sync operations
    static calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
}

// USAGE:
// Store account balances with integrity check
IntegrityStorage.store('account_balances', {
    accounts: [
        { id: 'acc1', balance: 1.5 },
        { id: 'acc2', balance: 0.3 }
    ]
});

// Retrieve and verify
const balances = IntegrityStorage.retrieve('account_balances');
if (balances) {
    // Data is verified
    console.log('Balances loaded:', balances.data);
} else {
    // Data corrupted or missing
    console.log('Need to fetch fresh balances');
}
```

### Pattern 4: Session Storage for Temporary Data

```javascript
class SessionManager {
    constructor() {
        this.prefix = 'moosh_session_';
        this.initSession();
    }
    
    initSession() {
        // Generate session ID if not exists
        if (!sessionStorage.getItem(this.prefix + 'id')) {
            const sessionId = SecureRandom.generateId();
            sessionStorage.setItem(this.prefix + 'id', sessionId);
            sessionStorage.setItem(this.prefix + 'start', Date.now().toString());
        }
    }
    
    // Store temporary session data
    setTemp(key, value) {
        try {
            sessionStorage.setItem(
                this.prefix + key,
                JSON.stringify({
                    value: value,
                    timestamp: Date.now()
                })
            );
            return true;
        } catch (e) {
            // SessionStorage might be full or disabled
            ComplianceUtils.log('SessionManager', 'Failed to store temp data', 'warn');
            return false;
        }
    }
    
    // Get temporary data
    getTemp(key) {
        try {
            const data = sessionStorage.getItem(this.prefix + key);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return parsed.value;
        } catch (e) {
            return null;
        }
    }
    
    // Clear specific temp data
    clearTemp(key) {
        sessionStorage.removeItem(this.prefix + key);
    }
    
    // Get session info
    getSessionInfo() {
        const id = sessionStorage.getItem(this.prefix + 'id');
        const start = parseInt(sessionStorage.getItem(this.prefix + 'start') || '0');
        
        return {
            id: id,
            duration: Date.now() - start,
            itemCount: this.getSessionItemCount()
        };
    }
    
    // Count session items
    getSessionItemCount() {
        let count = 0;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith(this.prefix)) count++;
        }
        return count;
    }
    
    // Clear entire session
    clearSession() {
        const keysToRemove = [];
        
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        ComplianceUtils.log('SessionManager', 'Session cleared');
    }
}

// USAGE:
const session = new SessionManager();

// Store transaction draft (temporary)
session.setTemp('tx_draft', {
    to: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amount: 0.001,
    fee: 'medium'
});

// Retrieve when needed
const draft = session.getTemp('tx_draft');

// Clear after use
session.clearTemp('tx_draft');
```

### Pattern 5: Storage Migration System

```javascript
class StorageMigration {
    constructor() {
        this.currentVersion = 3;
        this.versionKey = 'moosh_storage_version';
    }
    
    // Run migrations if needed
    async runMigrations() {
        const currentVersion = this.getCurrentVersion();
        
        if (currentVersion >= this.currentVersion) {
            return; // Already up to date
        }
        
        ComplianceUtils.log('Migration', `Migrating from v${currentVersion} to v${this.currentVersion}`);
        
        // Run migrations in sequence
        for (let v = currentVersion + 1; v <= this.currentVersion; v++) {
            await this.runMigration(v);
        }
        
        // Update version
        localStorage.setItem(this.versionKey, this.currentVersion.toString());
        ComplianceUtils.log('Migration', 'Migrations completed successfully');
    }
    
    getCurrentVersion() {
        const stored = localStorage.getItem(this.versionKey);
        return stored ? parseInt(stored) : 0;
    }
    
    async runMigration(version) {
        switch (version) {
            case 1:
                await this.migration1_EncryptSensitiveData();
                break;
                
            case 2:
                await this.migration2_AddIntegrityChecks();
                break;
                
            case 3:
                await this.migration3_OptimizeStructure();
                break;
                
            default:
                throw new Error(`Unknown migration version: ${version}`);
        }
    }
    
    // Migration 1: Encrypt previously unencrypted data
    async migration1_EncryptSensitiveData() {
        const oldWallet = localStorage.getItem('wallet');
        if (!oldWallet) return;
        
        try {
            const data = JSON.parse(oldWallet);
            
            // Check if already encrypted
            if (data.encrypted) return;
            
            // Prompt for password
            const password = await this.promptForPassword(
                'Security Update: Please enter a password to encrypt your wallet'
            );
            
            if (!password) {
                throw new Error('Password required for migration');
            }
            
            // Encrypt and store
            const storage = new SecureWalletStorage();
            await storage.storeWallet(data, password);
            
            // Remove old unencrypted data
            localStorage.removeItem('wallet');
            
            ComplianceUtils.log('Migration', 'Wallet data encrypted successfully');
            
        } catch (e) {
            ComplianceUtils.log('Migration', 'Failed to encrypt wallet data', 'error');
            throw e;
        }
    }
    
    // Migration 2: Add integrity checks to existing data
    async migration2_AddIntegrityChecks() {
        const keysToMigrate = ['preferences', 'accountLabels', 'priceCache'];
        
        for (const key of keysToMigrate) {
            const data = localStorage.getItem(key);
            if (!data) continue;
            
            try {
                const parsed = JSON.parse(data);
                
                // Re-store with integrity
                IntegrityStorage.store(key, parsed);
                
            } catch (e) {
                // Remove corrupted data
                localStorage.removeItem(key);
            }
        }
    }
    
    // Migration 3: Optimize storage structure
    async migration3_OptimizeStructure() {
        // Consolidate scattered keys into organized structure
        const oldKeys = {
            'theme': 'preferences.theme',
            'currency': 'preferences.currency',
            'language': 'preferences.language'
        };
        
        const preferences = {};
        
        for (const [oldKey, prefKey] of Object.entries(oldKeys)) {
            const value = localStorage.getItem(oldKey);
            if (value) {
                const keys = prefKey.split('.');
                let obj = preferences;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!obj[keys[i]]) obj[keys[i]] = {};
                    obj = obj[keys[i]];
                }
                
                obj[keys[keys.length - 1]] = value;
                localStorage.removeItem(oldKey);
            }
        }
        
        if (Object.keys(preferences).length > 0) {
            IntegrityStorage.store('user_preferences', preferences);
        }
    }
    
    // Helper to prompt for password during migration
    async promptForPassword(message) {
        // This would show a modal in real implementation
        return new Promise((resolve) => {
            const modal = $.div({ className: 'migration-modal' }, [
                $.h3({}, 'Storage Migration Required'),
                $.p({}, message),
                $.input({
                    type: 'password',
                    placeholder: 'Enter password',
                    onkeyup: (e) => {
                        if (e.key === 'Enter') {
                            resolve(e.target.value);
                            modal.remove();
                        }
                    }
                }),
                $.button({
                    onclick: () => {
                        const input = modal.querySelector('input');
                        resolve(input.value);
                        modal.remove();
                    }
                }, 'Continue')
            ]);
            
            document.body.appendChild(modal);
        });
    }
}

// Run migrations on app start
async function initializeStorage() {
    const migration = new StorageMigration();
    
    try {
        await migration.runMigrations();
    } catch (error) {
        ComplianceUtils.log('Storage', 'Migration failed: ' + error.message, 'error');
        
        // Handle migration failure
        app.showNotification(
            'Storage upgrade failed. Some features may not work correctly.',
            'error'
        );
    }
}
```

## Storage Cleanup Strategies

### Automatic Cleanup

```javascript
class StorageManager {
    static async getStorageInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                percent: (estimate.usage / estimate.quota * 100).toFixed(2)
            };
        }
        
        // Fallback estimation
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        return {
            usage: totalSize,
            quota: 10485760, // 10MB estimate
            percent: (totalSize / 10485760 * 100).toFixed(2)
        };
    }
    
    static async performCleanup() {
        ComplianceUtils.log('StorageManager', 'Starting cleanup...');
        
        let cleaned = 0;
        
        // 1. Clean expired cache entries
        const cache = new CacheStorage();
        cleaned += cache.cleanup();
        
        // 2. Remove old session data
        this.cleanOldSessions();
        
        // 3. Compress transaction history
        cleaned += await this.compressOldTransactions();
        
        // 4. Remove orphaned data
        cleaned += this.removeOrphanedData();
        
        ComplianceUtils.log('StorageManager', `Cleanup complete. Removed ${cleaned} items`);
        
        return cleaned;
    }
    
    static cleanOldSessions() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key.includes('_session_') || key.includes('_temp_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.timestamp && data.timestamp < oneWeekAgo) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // Invalid data, remove it
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return keysToRemove.length;
    }
    
    static async compressOldTransactions() {
        const txKey = 'transaction_history';
        const history = IntegrityStorage.retrieve(txKey);
        
        if (!history || !history.data.transactions) return 0;
        
        const transactions = history.data.transactions;
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        // Separate old and recent
        const recent = [];
        const old = [];
        
        transactions.forEach(tx => {
            if (tx.timestamp > oneMonthAgo) {
                recent.push(tx);
            } else {
                // Compress old transactions
                old.push({
                    id: tx.id,
                    amount: tx.amount,
                    timestamp: tx.timestamp,
                    // Remove detailed data
                });
            }
        });
        
        // Store compressed version
        IntegrityStorage.store(txKey, {
            transactions: recent,
            archived: old.length,
            lastCompression: Date.now()
        });
        
        return old.length;
    }
    
    static removeOrphanedData() {
        const validPrefixes = [
            'moosh_',
            'price_',
            'cache_',
            'session_',
            'preference_'
        ];
        
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Check if key has valid prefix
            const hasValidPrefix = validPrefixes.some(prefix => 
                key.startsWith(prefix)
            );
            
            if (!hasValidPrefix && !this.isSystemKey(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return keysToRemove.length;
    }
    
    static isSystemKey(key) {
        const systemKeys = [
            'mooshWalletState',
            'sparkWallet',
            'currentWallet'
        ];
        return systemKeys.includes(key);
    }
}

// Schedule regular cleanup
setInterval(async () => {
    const info = await StorageManager.getStorageInfo();
    
    if (parseFloat(info.percent) > 80) {
        ComplianceUtils.log('StorageManager', 'Storage usage high: ' + info.percent + '%', 'warn');
        await StorageManager.performCleanup();
    }
}, 3600000); // Every hour
```

## Storage Security Checklist

Before storing any data:

- [ ] Is the data sensitive? → Encrypt it
- [ ] Can it be derived? → Don't store it
- [ ] Does it expire? → Add timestamp/TTL
- [ ] Is it user-specific? → Include account ID
- [ ] Can it be corrupted? → Add integrity check
- [ ] Is it large? → Consider compression
- [ ] Is it temporary? → Use sessionStorage
- [ ] Could it fail? → Handle quota errors
- [ ] Will schema change? → Plan migration
- [ ] Is it backed up? → Implement export

## Common Storage Mistakes

```javascript
// MISTAKE 1: Storing sensitive data unencrypted
localStorage.setItem('privateKey', wallet.privateKey); // NEVER!

// MISTAKE 2: No error handling
localStorage.setItem('data', hugeData); // Might throw QuotaExceededError!

// MISTAKE 3: Not checking for null
const data = JSON.parse(localStorage.getItem('key')); // Might throw!

// MISTAKE 4: No expiry on cached data
localStorage.setItem('price', bitcoinPrice); // Stale forever!

// MISTAKE 5: Storing derived data
localStorage.setItem('totalBalance', sum); // Can be calculated!

// MISTAKE 6: No integrity checks
const balance = localStorage.getItem('balance'); // Could be tampered!

// MISTAKE 7: Synchronous heavy operations
const bigData = JSON.parse(localStorage.getItem('huge')); // Blocks UI!

// MISTAKE 8: Not cleaning up
localStorage.setItem(`temp_${Date.now()}`, data); // Fills up storage!
```

## Storage Limits and Quotas

### Browser Limits:
- **localStorage**: ~5-10MB (varies by browser)
- **sessionStorage**: ~5-10MB (varies by browser)
- **Total origin**: ~50MB-100MB

### Strategies When Approaching Limits:
1. Run cleanup immediately
2. Compress old data
3. Move to IndexedDB for large data
4. Implement data archiving
5. Prompt user to export/backup

## Summary

Storage in MOOSH Wallet requires:
- **Encryption** for all sensitive data
- **Integrity checks** for critical data
- **Expiry/TTL** for cached data
- **Migration system** for schema changes
- **Cleanup strategies** for storage limits
- **Error handling** for quota exceeded

Remember: **If you're not sure whether to encrypt it, encrypt it!**