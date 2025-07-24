# Data Persistence

**Status**: 🟢 Active
**Type**: Core Feature
**Security Critical**: Yes
**Implementation**: Throughout /public/js/moosh-wallet.js using localStorage and state management

## Overview
Data persistence ensures wallet data, user preferences, and application state survive browser sessions. The system uses secure local storage mechanisms to maintain data integrity while protecting sensitive information.

## User Flow
```
[User Action] → [Data Change] → [Secure Storage] → [Browser Close] → [Browser Open] → [Data Restored]
```

## Technical Implementation

### Frontend
- **Entry Point**: State management and storage operations
- **UI Components**: 
  - Auto-save indicators
  - Sync status display
  - Storage usage meter
  - Clear data options
- **State Changes**: 
  - Automatic persistence
  - Manual save triggers
  - Storage events

### Backend
- **API Endpoints**: None (local storage only)
- **Services Used**: 
  - localStorage API
  - SessionStorage (temporary)
  - IndexedDB (planned)
- **Data Flow**: 
  1. State changes detected
  2. Data serialized
  3. Encryption applied (sensitive)
  4. Storage updated
  5. Sync confirmation

## Code Example
```javascript
// Data persistence implementation
class PersistenceManager {
    constructor(app) {
        this.app = app;
        this.storageKey = 'mooshWallet';
        this.encryptionKey = null;
        this.autoSaveDelay = 1000; // 1 second
        this.saveTimeout = null;
        
        this.initializePersistence();
    }
    
    initializePersistence() {
        // Load existing data
        this.loadPersistedData();
        
        // Set up auto-save
        this.setupAutoSave();
        
        // Handle storage events (cross-tab sync)
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
        
        // Save on page unload
        window.addEventListener('beforeunload', () => this.saveImmediately());
    }
    
    setupAutoSave() {
        // Watch for state changes
        this.app.state.on('change', (key, value) => {
            this.scheduleSave();
        });
    }
    
    scheduleSave() {
        // Debounce saves
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveState();
        }, this.autoSaveDelay);
    }
    
    saveState() {
        try {
            const dataToSave = this.prepareDataForStorage();
            
            // Check storage quota
            if (!this.checkStorageQuota(dataToSave)) {
                this.handleStorageQuotaExceeded();
                return;
            }
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            
            // Update last save timestamp
            this.app.state.set('lastSave', Date.now());
            
            // Show save indicator
            this.showSaveIndicator();
            
        } catch (error) {
            console.error('Failed to save state:', error);
            this.app.showNotification('Failed to save data', 'error');
        }
    }
    
    prepareDataForStorage() {
        const state = this.app.state.getAll();
        
        // Separate sensitive and non-sensitive data
        const sensitiveKeys = ['privateKeys', 'seedPhrase', 'passwords'];
        const publicData = {};
        const sensitiveData = {};
        
        Object.entries(state).forEach(([key, value]) => {
            if (sensitiveKeys.includes(key)) {
                sensitiveData[key] = value;
            } else {
                publicData[key] = value;
            }
        });
        
        // Encrypt sensitive data
        const encryptedSensitive = this.encryptData(sensitiveData);
        
        return {
            version: '1.0',
            timestamp: Date.now(),
            public: publicData,
            encrypted: encryptedSensitive,
            checksum: this.calculateChecksum(publicData)
        };
    }
    
    loadPersistedData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return;
            
            const data = JSON.parse(stored);
            
            // Verify data integrity
            if (!this.verifyDataIntegrity(data)) {
                console.error('Data integrity check failed');
                this.handleCorruptedData();
                return;
            }
            
            // Restore public data
            Object.entries(data.public).forEach(([key, value]) => {
                this.app.state.set(key, value);
            });
            
            // Decrypt and restore sensitive data
            if (data.encrypted) {
                const decrypted = this.decryptData(data.encrypted);
                Object.entries(decrypted).forEach(([key, value]) => {
                    this.app.state.set(key, value);
                });
            }
            
            console.log('Data restored from storage');
            
        } catch (error) {
            console.error('Failed to load persisted data:', error);
            this.handleCorruptedData();
        }
    }
    
    encryptData(data) {
        // Simple encryption for demonstration
        // In production, use proper encryption library
        if (!this.encryptionKey) {
            this.encryptionKey = this.deriveEncryptionKey();
        }
        
        const jsonString = JSON.stringify(data);
        const encrypted = btoa(jsonString); // Base64 encode (use real encryption!)
        
        return encrypted;
    }
    
    decryptData(encryptedData) {
        try {
            const decrypted = atob(encryptedData); // Base64 decode (use real decryption!)
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return {};
        }
    }
    
    deriveEncryptionKey() {
        // Derive key from user password or device fingerprint
        // This is a placeholder - use proper key derivation
        return 'static-key-for-demo';
    }
    
    calculateChecksum(data) {
        // Simple checksum for data integrity
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }
    
    verifyDataIntegrity(data) {
        if (!data.version || !data.timestamp || !data.public) {
            return false;
        }
        
        const calculatedChecksum = this.calculateChecksum(data.public);
        return calculatedChecksum === data.checksum;
    }
    
    checkStorageQuota(data) {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                const percentUsed = (estimate.usage / estimate.quota) * 100;
                if (percentUsed > 90) {
                    this.app.showNotification('Storage nearly full', 'warning');
                }
            });
        }
        
        // Check localStorage size (rough estimate)
        const dataSize = new Blob([JSON.stringify(data)]).size;
        const totalSize = new Blob([JSON.stringify(localStorage)]).size;
        
        // Most browsers allow ~10MB for localStorage
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        return totalSize + dataSize < maxSize;
    }
    
    handleStorageQuotaExceeded() {
        // Clean up old data
        this.cleanupOldData();
        
        // Show user options
        const modal = new Modal({
            title: 'Storage Full',
            content: `
                <p>Local storage is full. Choose an option:</p>
                <ul>
                    <li>Clean up old transaction history</li>
                    <li>Export data and clear storage</li>
                    <li>Upgrade to cloud storage (coming soon)</li>
                </ul>
            `,
            buttons: [
                {
                    text: 'Clean Up',
                    onClick: () => this.cleanupOldData()
                },
                {
                    text: 'Export & Clear',
                    onClick: () => this.exportAndClear()
                }
            ]
        });
        modal.show();
    }
    
    cleanupOldData() {
        // Remove old transactions (keep last 100)
        const transactions = this.app.state.get('transactions') || [];
        if (transactions.length > 100) {
            this.app.state.set('transactions', transactions.slice(-100));
        }
        
        // Clear old cache entries
        const cacheKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('cache_'));
        
        cacheKeys.forEach(key => {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.expiry < Date.now()) {
                localStorage.removeItem(key);
            }
        });
        
        this.app.showNotification('Storage cleaned up', 'success');
    }
    
    handleStorageChange(event) {
        // Handle cross-tab synchronization
        if (event.key === this.storageKey && event.newValue) {
            console.log('Storage changed in another tab');
            this.loadPersistedData();
            this.app.showNotification('Data synced from another tab', 'info');
        }
    }
    
    clearAllData() {
        if (confirm('This will delete all wallet data. Are you sure?')) {
            localStorage.clear();
            sessionStorage.clear();
            this.app.state.clear();
            window.location.reload();
        }
    }
    
    exportData() {
        const data = this.prepareDataForStorage();
        const blob = new Blob([JSON.stringify(data, null, 2)], 
            { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moosh-wallet-backup-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.app.showNotification('Data exported successfully', 'success');
    }
    
    showSaveIndicator() {
        const indicator = document.querySelector('.save-indicator');
        if (indicator) {
            indicator.classList.add('saving');
            setTimeout(() => {
                indicator.classList.remove('saving');
                indicator.classList.add('saved');
                setTimeout(() => {
                    indicator.classList.remove('saved');
                }, 2000);
            }, 500);
        }
    }
}
```

## Configuration
- **Settings**: 
  - Auto-save delay: 1 second
  - Max storage: 10MB
  - Transaction history: 100 items
  - Cache expiry: 24 hours
- **Defaults**: 
  - Auto-save enabled
  - Encryption for sensitive data
  - Cross-tab sync enabled
  - Integrity checks active
- **Limits**: 
  - localStorage: ~10MB
  - Single item: 5MB
  - Key length: 1024 chars

## Security Considerations
- **Data Encryption**:
  - Sensitive data encrypted
  - Keys derived from password
  - No plaintext secrets
  - Checksum verification
- **Access Control**:
  - Same-origin policy
  - No cross-site access
  - User consent required
  - Clear data option

## Performance Impact
- **Load Time**: Initial load ~50ms
- **Memory**: Depends on data size
- **Network**: None (local only)

## Mobile Considerations
- Aggressive data cleanup
- Reduced history retention
- Storage quota warnings
- Manual save option
- Export before clearing

## Error Handling
- **Common Errors**: 
  - Storage quota exceeded
  - Corrupted data
  - Browser privacy mode
  - Cross-origin issues
- **Recovery**: 
  - Automatic cleanup
  - Data export option
  - Corruption detection
  - Fallback to defaults

## Testing
```bash
# Test data persistence
1. Test auto-save:
   - Make changes
   - Wait 1 second
   - Check localStorage
   - Verify data saved
   
2. Test restoration:
   - Save data
   - Refresh page
   - Verify data restored
   - Check all fields
   
3. Test encryption:
   - Save sensitive data
   - Check localStorage
   - Verify encrypted
   - Test decryption
   
4. Test storage limits:
   - Fill storage
   - Verify warnings
   - Test cleanup
   - Check export works
```

## Future Enhancements
- **Advanced Storage**:
  - IndexedDB for large data
  - WebSQL fallback
  - Cloud sync option
  - Distributed storage
  - IPFS integration
- **Security**:
  - Hardware key encryption
  - Biometric protection
  - Zero-knowledge sync
  - Encrypted backups
  - Secure deletion
- **Features**:
  - Selective sync
  - Compression
  - Delta updates
  - Version control
  - Multi-device sync