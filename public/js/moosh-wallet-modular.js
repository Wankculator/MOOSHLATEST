// MOOSH WALLET - Modular Loader
// This file loads the modular version of MOOSH Wallet
// It maintains 100% compatibility with the original moosh-wallet.js

(function(window) {
    'use strict';

    // Define module loading order
    const modules = [
        // Load utilities first (no dependencies)
        '/js/modules/utils/validation-utils.js',
        '/js/modules/utils/general-utils.js',
        '/js/modules/utils/crypto-utils.js',
        
        // Core modules (load in dependency order)
        '/js/modules/core/element-factory.js',    // Must load first - provides $
        '/js/modules/core/style-manager.js',      // CSS injection and styling
        '/js/modules/core/responsive-utils.js',   // Depends on ElementFactory
        '/js/modules/core/compliance-utils.js',   // Standards enforcement utilities
        '/js/modules/core/secure-storage.js',     // Secure storage (StateManager dependency)
        '/js/modules/core/state-manager.js',      // State management system
        '/js/modules/core/api-service.js',        // API integration and external data
        '/js/modules/core/component.js',          // Base class for UI components
        '/js/modules/core/router.js',             // SPA navigation system
        
        // Feature modules
        '/js/modules/features/wallet-detector.js', // Wallet type detection
        '/js/modules/features/ordinals-manager.js', // Ordinals/inscriptions management
        // '/js/modules/features/wallet-manager.js',
        // '/js/modules/features/transaction-manager.js',
        
        // UI modules
        '/js/modules/ui/button.js',               // Button component
        '/js/modules/ui/terminal.js',             // Terminal UI component
        '/js/modules/ui/header.js',               // Header component
        '/js/modules/ui/transaction-history.js',  // Transaction history component
        
        // Modal modules
        '/js/modules/modals/modal-base.js',       // Base modal class
        '/js/modules/modals/send-modal.js',       // Send Bitcoin modal
        '/js/modules/modals/receive-modal.js',    // Receive Bitcoin modal
        '/js/modules/modals/SendPaymentModal.js', // Send Lightning payment modal
        '/js/modules/modals/WalletSettingsModal.js', // Wallet settings modal
        '/js/modules/modals/MultiAccountModal.js', // Multi-account management modal
        '/js/modules/modals/AccountListModal.js', // Advanced account management
        '/js/modules/modals/OrdinalsModal.js',    // Ordinals/inscriptions modal
        '/js/modules/modals/TransactionHistoryModal.js', // Transaction history modal
        '/js/modules/modals/TokenMenuModal.js',   // Token menu modal
        '/js/modules/modals/OrdinalsTerminalModal.js', // Terminal interface for Ordinals
        '/js/modules/modals/SwapModal.js',        // Token swap modal
        '/js/modules/modals/PasswordModal.js',    // Password verification modal
        '/js/modules/modals/ReceivePaymentModal.js', // Receive payment modal
        '/js/modules/modals/SparkDashboardModal.js', // Spark Protocol dashboard modal
        '/js/modules/modals/SparkDepositModal.js', // Spark Protocol deposit modal
        '/js/modules/modals/LightningChannelModal.js', // Lightning Network channel modal
        
        // Page modules
        '/js/modules/pages/home-page.js',         // Home page component
        '/js/modules/pages/generate-seed-page.js', // Seed generation page
        '/js/modules/pages/confirm-seed-page.js',  // Seed confirmation page
        '/js/modules/pages/import-seed-page.js',   // Import wallet page
        '/js/modules/pages/WalletCreatedPage.js', // Wallet created confirmation
        '/js/modules/pages/wallet-imported-page.js', // Wallet imported confirmation
        '/js/modules/pages/WalletDetailsPage.js', // Wallet details display
        '/js/modules/pages/DashboardPage.js',     // Main wallet dashboard
        
        // Finally load the main app (with extracted code removed)
        '/js/moosh-wallet.js'
    ];

    // Track loading progress
    let loadedCount = 0;
    const totalModules = modules.length;
    
    // Show loading progress (optional)
    function updateLoadingProgress() {
        loadedCount++;
        const progress = Math.round((loadedCount / totalModules) * 100);
        console.log(`MOOSH Wallet loading: ${progress}%`);
        
        // You could update a loading bar here if desired
        const event = new CustomEvent('moosh-wallet-loading', {
            detail: { progress, loaded: loadedCount, total: totalModules }
        });
        window.dispatchEvent(event);
    }

    // Load modules sequentially to maintain order
    function loadNextModule(index) {
        if (index >= modules.length) {
            // All modules loaded
            console.log('MOOSH Wallet: All modules loaded successfully');
            
            // Dispatch ready event
            const event = new CustomEvent('moosh-wallet-ready');
            window.dispatchEvent(event);
            return;
        }

        const script = document.createElement('script');
        script.src = modules[index];
        script.onload = function() {
            updateLoadingProgress();
            loadNextModule(index + 1);
        };
        script.onerror = function() {
            console.error(`Failed to load module: ${modules[index]}`);
            // Continue loading other modules even if one fails
            updateLoadingProgress();
            loadNextModule(index + 1);
        };
        
        document.head.appendChild(script);
    }

    // Initialize the MOOSHWalletApp namespace
    window.MOOSHWalletApp = window.MOOSHWalletApp || {};

    // Start loading modules
    console.log('MOOSH Wallet: Starting modular load...');
    loadNextModule(0);

})(window);