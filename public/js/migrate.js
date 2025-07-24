/**
 * Migration Script
 * Temporarily loads both old and new systems for smooth transition
 * Can be removed once fully migrated to modules
 */

(function() {
    'use strict';

    console.log('🔄 MOOSH Wallet Migration Script Running...');

    // Check if modules are supported
    const supportsModules = 'noModule' in HTMLScriptElement.prototype;

    if (supportsModules) {
        console.log('✅ Browser supports ES6 modules - using new modular architecture');
        
        // Remove old script tags if they exist
        const oldScripts = document.querySelectorAll('script[src*="moosh-wallet.js"]');
        oldScripts.forEach(script => {
            console.log('🗑️ Removing old script:', script.src);
            script.remove();
        });

        // The new modular app will be loaded via index.html module script
        
    } else {
        console.log('⚠️ Browser does not support ES6 modules - loading legacy bundle');
        
        // Load the old monolithic file for backward compatibility
        const script = document.createElement('script');
        script.src = '/js/moosh-wallet.js';
        script.onload = () => {
            console.log('✅ Legacy wallet loaded');
        };
        script.onerror = () => {
            console.error('❌ Failed to load legacy wallet');
        };
        document.body.appendChild(script);
    }

    // Migration helper for localStorage data
    window.migrateWalletData = function() {
        console.log('🔄 Migrating wallet data...');
        
        try {
            // Check for old wallet data
            const oldKeys = [
                'walletCreated',
                'walletImported',
                'multiWalletData',
                'activeWalletIndex',
                'walletSettings'
            ];

            const migratedData = {};
            let hasOldData = false;

            oldKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    hasOldData = true;
                    migratedData[key] = value;
                    console.log(`📦 Found old data: ${key}`);
                }
            });

            if (hasOldData) {
                // Convert to new format
                const newMetadata = {
                    wallets: [],
                    activeIndex: parseInt(migratedData.activeWalletIndex) || 0,
                    migrated: true,
                    migratedAt: new Date().toISOString()
                };

                // Parse multi-wallet data if exists
                if (migratedData.multiWalletData) {
                    try {
                        const oldWallets = JSON.parse(migratedData.multiWalletData);
                        newMetadata.wallets = oldWallets.map(w => ({
                            id: w.id || Date.now().toString(),
                            label: w.label || 'Migrated Wallet',
                            color: w.color || '#f57315',
                            created: w.created || new Date().toISOString(),
                            addresses: w.addresses || {},
                            imported: w.imported || false,
                            locked: false
                        }));
                    } catch (e) {
                        console.error('Failed to parse old wallet data:', e);
                    }
                }

                // Save to session storage (new location)
                sessionStorage.setItem('moosh_wallet_metadata', JSON.stringify(newMetadata));
                
                console.log('✅ Migration complete:', newMetadata);
                
                // Clean up old data (optional - comment out to keep backup)
                // oldKeys.forEach(key => localStorage.removeItem(key));
                
                return newMetadata;
            } else {
                console.log('ℹ️ No old wallet data found');
                return null;
            }

        } catch (error) {
            console.error('❌ Migration failed:', error);
            return null;
        }
    };

    // Auto-migrate on load if needed
    if (supportsModules && !sessionStorage.getItem('moosh_wallet_metadata')) {
        window.migrateWalletData();
    }

    // Development helper to switch between old and new
    window.toggleWalletMode = function(useOld = false) {
        if (useOld) {
            console.log('Switching to old wallet...');
            sessionStorage.setItem('use_old_wallet', 'true');
        } else {
            console.log('Switching to new modular wallet...');
            sessionStorage.removeItem('use_old_wallet');
        }
        window.location.reload();
    };

    // Version info
    window.walletVersion = {
        old: '2.0',
        new: '3.0',
        migrationDate: '2024-12-20'
    };

    console.log('📌 Migration script loaded. Use window.migrateWalletData() to manually migrate.');

})();