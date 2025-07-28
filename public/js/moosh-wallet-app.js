// MOOSH WALLET - Main Application
// Professional-grade Bitcoin wallet with Spark Protocol support
// Version: 2.0 - Fully modularized architecture

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // MAIN APPLICATION CLASS
    // ═══════════════════════════════════════════════════════════════════════
    class MOOSHWalletApp {
        constructor() {
            // Core services
            this.stateManager = new (window.StateManager || StateManager)();
            this.apiService = new (window.APIService || APIService)(this.stateManager);
            this.router = new (window.Router || Router)(this);
            this.styleManager = new (window.StyleManager || StyleManager)();
            this.secureStorage = new (window.SecureStorage || SecureStorage)();
            
            // Features
            this.walletManager = new (window.MultiWalletManager || MultiWalletManager)(this);
            this.ordinalsManager = new (window.OrdinalsManager || OrdinalsManager)(this);
            this.sparkWalletManager = new (window.SparkWalletManager || SparkWalletManager)();
            
            // Bind state manager to secure storage
            this.secureStorage.app = this;
            
            // Global reference
            window.app = this;
            
            // Initialize
            this.init();
        }

        async init() {
            ComplianceUtils.log('App', 'Initializing MOOSH Wallet...');
            
            // Inject styles
            this.styleManager.inject();
            
            // Initialize state
            await this.stateManager.initialize();
            
            // Set up routes
            this.setupRoutes();
            
            // Initialize router
            this.router.init();
            
            // Check for existing wallet
            this.checkWalletStatus();
            
            // Set up global event listeners
            this.setupGlobalListeners();
            
            ComplianceUtils.log('App', 'Initialization complete');
        }

        setupRoutes() {
            // Page routes
            this.router.register('home', window.HomePage || HomePage);
            this.router.register('dashboard', window.DashboardPage || DashboardPage);
            this.router.register('generate-seed', window.GenerateSeedPage || GenerateSeedPage);
            this.router.register('confirm-seed', window.ConfirmSeedPage || ConfirmSeedPage);
            this.router.register('import-seed', window.ImportSeedPage || ImportSeedPage);
            this.router.register('wallet-created', window.WalletCreatedPage || WalletCreatedPage);
            this.router.register('wallet-imported', window.WalletImportedPage || WalletImportedPage);
            this.router.register('wallet-details', window.WalletDetailsPage || WalletDetailsPage);
        }

        checkWalletStatus() {
            const hasWallet = this.stateManager.hasWallet();
            const currentPage = this.stateManager.get('currentPage');
            
            if (hasWallet && currentPage === 'home') {
                // Redirect to dashboard if wallet exists
                this.router.navigate('dashboard');
            }
        }

        setupGlobalListeners() {
            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 300);
            });
            
            // Handle online/offline
            window.addEventListener('online', () => {
                this.showNotification('Connection restored', 'success');
            });
            
            window.addEventListener('offline', () => {
                this.showNotification('No internet connection', 'warning');
            });
            
            // Handle unload
            window.addEventListener('beforeunload', (e) => {
                if (this.stateManager.hasUnsavedChanges()) {
                    e.preventDefault();
                    e.returnValue = '';
                }
            });
        }

        handleResize() {
            const breakpoint = ResponsiveUtils.getBreakpoint();
            this.stateManager.set('breakpoint', breakpoint);
            ComplianceUtils.log('App', `Viewport changed to ${breakpoint}`);
        }

        // Public API methods
        async getBitcoinPrice() {
            try {
                return await this.apiService.getBitcoinPrice();
            } catch (error) {
                ComplianceUtils.log('App', 'Failed to get Bitcoin price', 'error');
                return this.stateManager.getLastKnownPrice();
            }
        }

        showNotification(message, type = 'info', duration = 3000) {
            const notification = this.createNotification(message, type);
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Auto remove
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }

        createNotification(message, type) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                className: `notification notification-${type}`,
                style: {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: type === 'error' ? '#ff4444' : 
                               type === 'success' ? '#00ff00' : 
                               type === 'warning' ? '#ffaa00' : '#0088ff',
                    color: '#000',
                    padding: '15px 20px',
                    borderRadius: '0',
                    border: '2px solid #000',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    transform: 'translateX(400px)',
                    transition: 'transform 0.3s ease',
                    zIndex: '10000',
                    fontWeight: '600',
                    maxWidth: '300px'
                }
            }, [message]);
        }

        // State shortcuts
        get state() {
            return this.stateManager;
        }

        set(key, value) {
            return this.stateManager.set(key, value);
        }

        get(key) {
            return this.stateManager.get(key);
        }

        update(updates) {
            return this.stateManager.update(updates);
        }

        // Navigation shortcuts
        navigate(page, options) {
            return this.router.navigate(page, options);
        }

        goBack() {
            return this.router.goBack();
        }

        // Spark Protocol integration
        async initializeSparkProtocol() {
            try {
                const wallet = await this.sparkWalletManager.getActiveWallet();
                if (wallet) {
                    ComplianceUtils.log('App', 'Spark Protocol initialized');
                    return true;
                }
                return false;
            } catch (error) {
                ComplianceUtils.log('App', 'Failed to initialize Spark Protocol', 'error');
                return false;
            }
        }

        // Modal helpers
        showSendModal() {
            const modal = new (window.SendModal || SendModal)(this);
            modal.show();
        }

        showReceiveModal() {
            const modal = new (window.ReceiveModal || ReceiveModal)(this);
            modal.show();
        }

        showOrdinalsModal() {
            const modal = new (window.OrdinalsModal || OrdinalsModal)(this);
            modal.show();
        }

        showOrdinalsTerminal() {
            const modal = new (window.OrdinalsTerminalModal || OrdinalsTerminalModal)(this);
            modal.show();
        }

        showWalletManager() {
            const modal = new (window.WalletManagerModal || WalletManagerModal)(this);
            modal.show();
        }

        // Utility methods
        formatBitcoin(sats, showUnit = true) {
            const btc = sats / 100000000;
            const formatted = btc.toFixed(8);
            return showUnit ? `${formatted} BTC` : formatted;
        }

        formatFiat(amount, currency = 'USD') {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return formatter.format(amount);
        }

        copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('Copied to clipboard', 'success');
            } catch (err) {
                this.showNotification('Failed to copy', 'error');
            }
            
            document.body.removeChild(textarea);
        }

        // Debug helpers
        debug() {
            console.log('=== MOOSH Wallet Debug Info ===');
            console.log('State:', this.stateManager.state);
            console.log('Accounts:', this.stateManager.getAccounts());
            console.log('Current Page:', this.stateManager.get('currentPage'));
            console.log('Breakpoint:', ResponsiveUtils.getBreakpoint());
            console.log('===============================');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GLOBAL STYLE INJECTION
    // ═══════════════════════════════════════════════════════════════════════
    const globalStyles = `
        .notification.show {
            transform: translateX(0) !important;
        }
        
        body.lock-screen-active {
            overflow: hidden;
        }
        
        .touch-active {
            opacity: 0.8 !important;
            transform: scale(0.98) !important;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = globalStyles;
    document.head.appendChild(styleEl);

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════
    
    // Wait for DOM and all modules to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    function initializeApp() {
        // Check for required modules
        const requiredModules = [
            'ElementFactory', 'ResponsiveUtils', 'ComplianceUtils', 
            'StyleManager', 'StateManager', 'APIService', 'Router',
            'Component', 'HomePage', 'DashboardPage'
        ];
        
        const missingModules = requiredModules.filter(module => !window[module]);
        
        if (missingModules.length > 0) {
            console.error('Missing required modules:', missingModules);
            console.error('Make sure all module files are loaded in index.html');
            return;
        }
        
        // Create global shorthand
        window.$ = window.ElementFactory;
        
        // Initialize application
        window.MOOSHWalletApp = MOOSHWalletApp;
        new MOOSHWalletApp();
    }

})(window);