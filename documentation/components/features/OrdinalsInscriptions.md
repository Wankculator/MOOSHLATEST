# Component: Ordinals & Inscriptions Support

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 21500-22800 (Ordinals functionality)
- `/src/server/api-server.js` - Lines 450-520 (Ordinals API endpoints)
- `/documentation/architecture/ORDINALS_PERFORMANCE_FIX_SUMMARY.md`

## Overview
MOOSH Wallet provides comprehensive support for Bitcoin Ordinals and inscriptions, allowing users to view, manage, and interact with their digital artifacts on the Bitcoin blockchain.

## Component Architecture

### Main Components
1. **OrdinalsGallery** - Grid view of inscriptions
2. **InscriptionViewer** - Detailed inscription display
3. **OrdinalsFilter** - Search and filtering system
4. **InscriptionMetadata** - Properties and attributes display

## Implementation Details

### Ordinals Fetching
```javascript
async fetchOrdinals(address) {
    // Implements efficient pagination and caching
    try {
        const cacheKey = `ordinals_${address}`;
        const cached = this.ordinalsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
            return cached.data;
        }
        
        const response = await this.apiService.request(
            `/api/ordinals/${address}?limit=50`
        );
        
        if (response.success) {
            this.ordinalsCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
            return response.data;
        }
    } catch (error) {
        console.error('Failed to fetch ordinals:', error);
        return [];
    }
}
```

### Lazy Loading Implementation
```javascript
createOrdinalsGallery() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({
        className: 'ordinals-gallery',
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            padding: '16px'
        }
    }, [
        this.createOrdinalsHeader(),
        $.div({
            className: 'ordinals-grid',
            id: 'ordinalsGrid'
        }, this.renderVisibleOrdinals()),
        this.hasMore && this.createLoadMoreButton()
    ]);
}
```

## Visual Specifications

### Gallery Layout
```css
.ordinals-gallery {
    max-height: 600px;
    overflow-y: auto;
    background: var(--bg-secondary);
    border-radius: 8px;
}

.ordinal-item {
    position: relative;
    aspect-ratio: 1;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
}

.ordinal-item:hover {
    border-color: var(--text-accent);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.ordinal-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.ordinal-number {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0,0,0,0.8);
    color: var(--text-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
}
```

## DOM Structure
```html
<div class="ordinals-container">
    <div class="ordinals-header">
        <h3>Your Inscriptions</h3>
        <div class="ordinals-filters">
            <input type="text" placeholder="Search inscriptions...">
            <select class="filter-type">
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="text">Text</option>
                <option value="json">JSON</option>
            </select>
        </div>
    </div>
    
    <div class="ordinals-gallery">
        <div class="ordinal-item" data-inscription-id="123">
            <img src="..." class="ordinal-image" loading="lazy">
            <span class="ordinal-number">#123456</span>
            <div class="ordinal-overlay">
                <span class="ordinal-type">Image</span>
                <span class="ordinal-size">2.3 KB</span>
            </div>
        </div>
    </div>
    
    <div class="ordinals-pagination">
        <button class="load-more-btn">Load More</button>
    </div>
</div>
```

## Performance Optimizations

### Intersection Observer for Lazy Loading
```javascript
initializeIntersectionObserver() {
    const options = {
        root: document.querySelector('.ordinals-gallery'),
        rootMargin: '50px',
        threshold: 0.01
    };
    
    this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                this.observer.unobserve(img);
            }
        });
    }, options);
    
    // Observe all inscription images
    document.querySelectorAll('.ordinal-image[data-src]').forEach(img => {
        this.observer.observe(img);
    });
}
```

### Caching Strategy
```javascript
class OrdinalsCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 1000;
        this.maxAge = 300000; // 5 minutes
    }
    
    set(key, value) {
        // LRU eviction if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
}
```

## Inscription Viewer
```javascript
showInscriptionDetails(inscriptionId) {
    const modal = new InscriptionViewerModal(this.app, inscriptionId);
    modal.show();
}

class InscriptionViewerModal {
    render() {
        return $.div({ className: 'inscription-viewer' }, [
            this.createHeader(),
            this.createImageDisplay(),
            this.createMetadata(),
            this.createActions()
        ]);
    }
    
    createMetadata() {
        return $.div({ className: 'inscription-metadata' }, [
            $.div({ className: 'metadata-item' }, [
                $.span({ className: 'label' }, ['Inscription #']),
                $.span({ className: 'value' }, [this.inscription.number])
            ]),
            $.div({ className: 'metadata-item' }, [
                $.span({ className: 'label' }, ['Content Type']),
                $.span({ className: 'value' }, [this.inscription.contentType])
            ]),
            // More metadata fields...
        ]);
    }
}
```

## API Endpoints
- `GET /api/ordinals/:address` - Fetch ordinals for address
- `GET /api/ordinals/inscription/:id` - Get inscription details
- `GET /api/ordinals/content/:id` - Get inscription content
- `POST /api/ordinals/transfer` - Transfer inscription

## State Management
- Ordinals cached per address
- Filter state persisted in component
- Selected inscriptions tracked for bulk operations

## Testing
```bash
# Test ordinals fetching
npm run test:ordinals-fetch

# Test lazy loading
npm run test:ordinals-lazy-load

# Test performance with large collections
npm run test:ordinals-performance
```

## Known Issues
1. Large image inscriptions can cause memory pressure
2. Some content types not fully supported (3D models)
3. Pagination needs improvement for 1000+ inscriptions

## Performance Fixes Applied
Based on `/documentation/architecture/ORDINALS_PERFORMANCE_FIX_SUMMARY.md`:
- Implemented virtual scrolling
- Added intersection observer for lazy loading
- Optimized image loading with progressive enhancement
- Added content caching with LRU eviction

## Git Recovery Commands
```bash
# Restore ordinals functionality
git checkout 1981e5a -- public/js/moosh-wallet.js

# View ordinals implementation history
git log -p --grep="ordinals" -- public/js/moosh-wallet.js

# Restore performance optimizations
git checkout HEAD -- documentation/architecture/ORDINALS_PERFORMANCE_FIX_SUMMARY.md
```

## Related Components
- [Dashboard](../pages/DashboardPage.md)
- [Gallery Modal](../modals/OrdinalsGalleryModal.md)
- [Transfer Modal](../modals/TransferInscriptionModal.md)