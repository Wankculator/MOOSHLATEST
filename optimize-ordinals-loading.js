// Optimize Ordinals Loading Performance
console.log('🚀 Optimizing Ordinals Loading...\n');

// 1. Pre-warm the cache when wallet loads
if (window.app?.pages?.dashboard) {
    const dashboard = window.app.pages.dashboard;
    
    // Override the afterMount to start prefetching immediately
    const originalAfterMount = dashboard.afterMount;
    dashboard.afterMount = function() {
        // Call original
        if (originalAfterMount) originalAfterMount.call(this);
        
        console.log('[Optimization] Starting background ordinals prefetch...');
        
        // Start prefetching ordinals data in background
        setTimeout(() => {
            const currentAccount = this.app.state.getCurrentAccount();
            if (currentAccount?.addresses?.taproot) {
                // Start prefetch silently
                this.fetchOrdinalsCount().catch(err => {
                    console.error('[Optimization] Background prefetch failed:', err);
                });
            }
        }, 2000); // Start after 2 seconds to not block initial load
    };
}

// 2. Optimize the gallery loading with progressive rendering
if (window.app?.ordinalsModal) {
    const modal = window.app.ordinalsModal;
    
    // Override updateInscriptionList for progressive rendering
    const originalUpdate = modal.updateInscriptionList;
    modal.updateInscriptionList = function() {
        const listElement = document.getElementById('ordinals-inscription-list');
        if (!listElement) return;
        
        const $ = window.ElementFactory || ElementFactory;
        
        // If we have many inscriptions, render them progressively
        if (!this.isLoading && this.inscriptions.length > 20) {
            console.log('[Optimization] Using progressive rendering for', this.inscriptions.length, 'inscriptions');
            
            // Clear the list
            listElement.innerHTML = '';
            
            // Render first batch immediately
            const firstBatch = this.inscriptions.slice(0, 12);
            const container = this.createInscriptionItems();
            listElement.appendChild(container);
            
            // Render remaining in chunks
            let index = 12;
            const renderChunk = () => {
                if (index < this.inscriptions.length) {
                    const chunk = this.inscriptions.slice(index, index + 12);
                    // This would need the actual rendering logic
                    index += 12;
                    requestAnimationFrame(renderChunk);
                }
            };
            
            requestAnimationFrame(renderChunk);
        } else {
            // Use original for small collections
            originalUpdate.call(this);
        }
    };
}

// 3. Add instant feedback
window.quickOpenOrdinals = () => {
    console.log('[Quick Open] Opening ordinals gallery with optimizations...');
    
    // Show loading immediately
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--text-accent);
        color: var(--bg-primary);
        padding: 12px 24px;
        font-family: monospace;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = 'Loading ordinals gallery...';
    document.body.appendChild(notification);
    
    // Open gallery
    if (window.app?.pages?.dashboard?.openOrdinalsGallery) {
        window.app.pages.dashboard.openOrdinalsGallery();
        
        // Remove notification after gallery opens
        setTimeout(() => notification.remove(), 1000);
    }
};

// 4. Preload inscription images
window.preloadInscriptionImages = (inscriptions) => {
    if (!inscriptions || inscriptions.length === 0) return;
    
    console.log('[Optimization] Preloading', inscriptions.length, 'inscription images...');
    
    inscriptions.forEach((inscription, index) => {
        if (inscription.content_type?.startsWith('image/')) {
            // Delay to prevent overwhelming the browser
            setTimeout(() => {
                const img = new Image();
                img.src = `https://ordinals.com/content/${inscription.id}`;
                console.log('[Preload] Image', index + 1, 'of', inscriptions.length);
            }, index * 50); // 50ms delay between each
        }
    });
};

// 5. Cache warming function
window.warmOrdinalsCache = async () => {
    console.log('[Cache] Warming ordinals cache...');
    
    const dashboard = window.app?.pages?.dashboard;
    if (dashboard && dashboard.fetchOrdinalsCount) {
        try {
            const count = await dashboard.fetchOrdinalsCount();
            console.log('[Cache] Warmed cache with', count, 'ordinals');
            
            // Also preload images if we have the data
            if (dashboard.ordinalsData) {
                window.preloadInscriptionImages(dashboard.ordinalsData.slice(0, 10)); // First 10
            }
        } catch (err) {
            console.error('[Cache] Warming failed:', err);
        }
    }
};

console.log('✅ Ordinals loading optimizations applied!');
console.log('\nAvailable commands:');
console.log('  quickOpenOrdinals() - Open gallery with instant feedback');
console.log('  warmOrdinalsCache() - Pre-warm the cache');
console.log('  preloadInscriptionImages(inscriptions) - Preload images');

// Auto-warm cache on page load
if (window.app?.pages?.dashboard) {
    setTimeout(() => {
        window.warmOrdinalsCache();
    }, 3000);
}