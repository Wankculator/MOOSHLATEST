# Offline Functionality

**Status**: 🟡 Beta
**Type**: Enhancement
**Security Critical**: No
**Implementation**: Distributed throughout /public/js/moosh-wallet.js with localStorage caching

## Overview
Offline functionality ensures users can access critical wallet features without an internet connection. The system caches essential data locally and provides graceful degradation when network connectivity is lost.

## User Flow
```
[Network Lost] → [Offline Mode Activated] → [Cached Data Used] → [Limited Features Available] → [Sync on Reconnect]
```

## Technical Implementation

### Frontend
- **Entry Point**: Network detection and cache management
- **UI Components**: 
  - Offline indicator badge
  - Sync status display
  - Cached data indicators
  - Limited feature notices
- **State Changes**: 
  - Online/offline status
  - Cache validity
  - Pending operations queue

### Backend
- **API Endpoints**: None (offline by definition)
- **Services Used**: 
  - localStorage for persistence
  - IndexedDB (planned)
  - Service Workers (planned)
- **Data Flow**: 
  1. Monitor network status
  2. Cache critical data when online
  3. Detect offline state
  4. Switch to cached data
  5. Queue operations for sync

## Code Example
```javascript
// Offline functionality implementation
class OfflineManager {
    constructor(app) {
        this.app = app;
        this.isOnline = navigator.onLine;
        this.cache = new Map();
        this.pendingOperations = [];
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        this.initializeOfflineSupport();
    }
    
    initializeOfflineSupport() {
        // Network status monitoring
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Load cached data
        this.loadCache();
        
        // Periodic cache cleanup
        setInterval(() => this.cleanupCache(), 60000); // Every minute
    }
    
    handleOnline() {
        this.isOnline = true;
        this.app.showNotification('Connection restored', 'success');
        
        // Update UI
        this.updateOfflineIndicator(false);
        
        // Sync pending operations
        this.syncPendingOperations();
        
        // Refresh stale data
        this.refreshCachedData();
    }
    
    handleOffline() {
        this.isOnline = false;
        this.app.showNotification('Working offline - limited functionality', 'warning');
        
        // Update UI
        this.updateOfflineIndicator(true);
        
        // Switch to offline mode
        this.enableOfflineMode();
    }
    
    updateOfflineIndicator(isOffline) {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.style.display = isOffline ? 'flex' : 'none';
            indicator.textContent = isOffline ? '🔴 Offline' : '';
        }
    }
    
    enableOfflineMode() {
        // Disable features that require network
        this.disableNetworkFeatures();
        
        // Show cached data notice
        this.showCachedDataNotice();
    }
    
    disableNetworkFeatures() {
        // Disable send transaction buttons
        document.querySelectorAll('.send-btn').forEach(btn => {
            btn.disabled = true;
            btn.title = 'Cannot send transactions while offline';
        });
        
        // Disable price updates
        document.querySelectorAll('.price-update').forEach(el => {
            el.classList.add('disabled');
        });
        
        // Disable import features
        document.querySelectorAll('.import-btn').forEach(btn => {
            btn.disabled = true;
        });
    }
    
    async cacheData(key, data, ttl = this.cacheExpiry) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            expiry: Date.now() + ttl
        };
        
        this.cache.set(key, cacheEntry);
        
        // Also persist to localStorage
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
        } catch (e) {
            console.error('Cache storage failed:', e);
        }
    }
    
    getCachedData(key) {
        // Check memory cache first
        let cacheEntry = this.cache.get(key);
        
        // Fallback to localStorage
        if (!cacheEntry) {
            try {
                const stored = localStorage.getItem(`cache_${key}`);
                if (stored) {
                    cacheEntry = JSON.parse(stored);
                    this.cache.set(key, cacheEntry);
                }
            } catch (e) {
                console.error('Cache retrieval failed:', e);
            }
        }
        
        if (cacheEntry && cacheEntry.expiry > Date.now()) {
            return cacheEntry.data;
        }
        
        return null;
    }
    
    loadCache() {
        // Load all cached items from localStorage
        const cacheKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('cache_'));
        
        cacheKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const actualKey = key.replace('cache_', '');
                this.cache.set(actualKey, data);
            } catch (e) {
                // Invalid cache entry, remove it
                localStorage.removeItem(key);
            }
        });
    }
    
    cleanupCache() {
        const now = Date.now();
        
        // Clean memory cache
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiry < now) {
                this.cache.delete(key);
                localStorage.removeItem(`cache_${key}`);
            }
        }
    }
    
    queueOperation(operation) {
        this.pendingOperations.push({
            id: Date.now(),
            operation: operation,
            timestamp: Date.now()
        });
        
        // Persist queue
        localStorage.setItem('pendingOperations', 
            JSON.stringify(this.pendingOperations));
        
        this.app.showNotification(
            'Operation queued - will sync when online',
            'info'
        );
    }
    
    async syncPendingOperations() {
        if (!this.isOnline || this.pendingOperations.length === 0) {
            return;
        }
        
        this.app.showNotification('Syncing pending operations...', 'info');
        
        const results = [];
        
        for (const pending of this.pendingOperations) {
            try {
                const result = await pending.operation();
                results.push({ success: true, result });
            } catch (error) {
                results.push({ success: false, error });
                console.error('Sync failed for operation:', error);
            }
        }
        
        // Clear successfully synced operations
        const failed = this.pendingOperations.filter((_, index) => 
            !results[index].success
        );
        
        this.pendingOperations = failed;
        localStorage.setItem('pendingOperations', 
            JSON.stringify(this.pendingOperations));
        
        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
            this.app.showNotification(
                `Synced ${successCount} operations successfully`,
                'success'
            );
        }
    }
    
    // Offline-capable balance check
    async getBalance(address) {
        if (this.isOnline) {
            try {
                const balance = await this.app.apiService.fetchBalance(address);
                // Cache the balance
                this.cacheData(`balance_${address}`, balance, 5 * 60 * 1000); // 5 min TTL
                return balance;
            } catch (error) {
                // Fall through to cache
            }
        }
        
        // Try cache
        const cached = this.getCachedData(`balance_${address}`);
        if (cached !== null) {
            return { ...cached, cached: true };
        }
        
        return { balance: '0.00000000', cached: true, error: 'No data available' };
    }
}
```

## Configuration
- **Settings**: 
  - Cache expiry: 24 hours default
  - Balance cache: 5 minutes
  - Price cache: 1 minute
  - Queue persistence: localStorage
- **Defaults**: 
  - Auto-detect network status
  - Cache all API responses
  - Queue write operations
  - Show offline indicators
- **Limits**: 
  - localStorage: ~10MB
  - Cache entries: 1000 max
  - Queue size: 100 operations

## Security Considerations
- No private keys in cache
- Encrypted sensitive data
- Cache cleared on logout
- No transaction signing offline
- Read-only operations only

## Performance Impact
- **Load Time**: Faster with cache
- **Memory**: Cache storage overhead
- **Network**: Reduced API calls

## Mobile Considerations
- Background sync when online
- Aggressive caching on mobile
- Battery-conscious sync
- Offline indicator prominent
- Data usage reduction

## Error Handling
- **Common Errors**: 
  - Cache storage full
  - Sync conflicts
  - Stale data issues
  - Queue corruption
- **Recovery**: 
  - Cache size limits
  - Conflict resolution
  - Force refresh option
  - Queue validation

## Testing
```bash
# Test offline functionality
1. Test offline detection:
   - Disable network
   - Verify offline indicator
   - Check disabled features
   - Enable network
   
2. Test data caching:
   - Load balances online
   - Go offline
   - Verify cached data shown
   - Check cache expiry
   
3. Test operation queue:
   - Go offline
   - Attempt transaction
   - Verify queued
   - Go online and verify sync
   
4. Test cache management:
   - Fill cache to limit
   - Verify cleanup works
   - Test manual refresh
```

## Future Enhancements
- **Service Workers**:
  - Full PWA support
  - Background sync
  - Push notifications
  - Offline page caching
  - Asset caching
- **Advanced Caching**:
  - IndexedDB for large data
  - Selective sync
  - Delta updates
  - Compression
  - Encrypted cache
- **Offline Features**:
  - Transaction construction
  - Address generation
  - QR code creation
  - Basic calculations
  - Offline-first architecture