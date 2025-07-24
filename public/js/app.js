/**
 * MOOSH Wallet Application Entry Point
 * Modern modular architecture with ES6 modules
 * Version: 3.0
 */

// Import core modules
import { $ } from './modules/element-factory.js';
import { stateManager } from './modules/state-manager.js';
import { apiService } from './modules/api-service.js';
import { walletManager } from './modules/wallet-manager.js';
import CryptoUtils from './modules/crypto-utils.js';

// Import UI components
import { Component, Button, Modal, LoadingSpinner, Toast } from './modules/ui-components.js';

// Import utilities
import * as utils from './modules/utils.js';
import * as constants from './modules/constants.js';

// Import pages (to be created)
// import HomePage from './pages/home.js';
// import DashboardPage from './pages/dashboard.js';
// import GenerateSeedPage from './pages/generate-seed.js';

/**
 * Main Application Class
 */
class MOOSHWalletApp {
    constructor() {
        this.currentPage = null;
        this.router = null;
        this.container = null;
        this.initialized = false;
        
        // Bind methods
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing MOOSH Wallet v3.0...');

            // Set up container
            this.container = document.getElementById('app');
            if (!this.container) {
                throw new Error('App container not found');
            }

            // Show loading screen
            this.showLoadingScreen();

            // Initialize core services
            await this.initializeServices();

            // Set up router
            this.setupRouter();

            // Set up global error handling
            this.setupErrorHandling();

            // Check session
            await this.checkSession();

            // Initialize UI
            this.initializeUI();

            // Mark as initialized
            this.initialized = true;
            stateManager.set('app.initialized', true);

            console.log('✅ MOOSH Wallet initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showErrorScreen(error.message);
        }
    }

    /**
     * Initialize core services
     */
    async initializeServices() {
        // Initialize wallet manager
        await walletManager.initialize();

        // Set up state listeners
        this.setupStateListeners();

        // Check API health
        try {
            await apiService.healthCheck();
        } catch (error) {
            console.warn('API health check failed:', error);
        }
    }

    /**
     * Set up state listeners
     */
    setupStateListeners() {
        // Listen for wallet changes
        stateManager.on('wallet.*', this.handleStateChange);
        
        // Listen for UI changes
        stateManager.on('ui.modal', (modal) => {
            if (modal) {
                this.showModal(modal);
            } else {
                this.closeModal();
            }
        });

        // Listen for navigation
        stateManager.on('app.route', (route) => {
            this.navigate(route);
        });
    }

    /**
     * Set up router
     */
    setupRouter() {
        // Simple hash-based routing
        this.router = {
            routes: new Map(),
            current: null
        };

        // Define routes
        this.router.routes.set('/', () => this.showHomePage());
        this.router.routes.set('/dashboard', () => this.showDashboard());
        this.router.routes.set('/generate', () => this.showGenerateSeed());
        this.router.routes.set('/import', () => this.showImportSeed());
        this.router.routes.set('/settings', () => this.showSettings());

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // Handle initial route
        this.handleRoute();
    }

    /**
     * Handle route changes
     */
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const handler = this.router.routes.get(hash);
        
        if (handler) {
            handler();
        } else {
            // Default to home
            this.navigate('/');
        }
    }

    /**
     * Navigate to route
     */
    navigate(route) {
        window.location.hash = route;
    }

    /**
     * Set up error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }

    /**
     * Check session
     */
    async checkSession() {
        try {
            const session = await apiService.checkSession();
            
            if (session.active) {
                stateManager.set('app.locked', false);
                
                // Restore wallet state
                if (session.walletData) {
                    walletManager.importMetadata(session.walletData);
                }
            }
        } catch (error) {
            // Session check failed, continue as new session
            console.log('No active session found');
        }
    }

    /**
     * Initialize UI
     */
    initializeUI() {
        // Clear loading screen
        this.container.innerHTML = '';

        // Add main structure
        const mainStructure = this.createMainStructure();
        this.container.appendChild(mainStructure);

        // Wait for DOM to be ready
        setTimeout(() => {
            // Show appropriate initial page
            if (walletManager.hasWallet()) {
                if (stateManager.isLocked()) {
                    this.showLockScreen();
                } else {
                    this.showDashboard();
                }
            } else {
                this.showHomePage();
            }
        }, 0);
    }

    /**
     * Create main app structure
     */
    createMainStructure() {
        return $.div({ id: 'app-main', className: 'app-main' }, [
            $.div({ id: 'app-header', className: 'app-header' }),
            $.div({ id: 'app-content', className: 'app-content' }),
            $.div({ id: 'app-modals', className: 'app-modals' }),
            $.div({ id: 'app-toasts', className: 'app-toasts' })
        ]);
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        this.container.innerHTML = '';
        
        const loadingScreen = $.div({ className: 'loading-screen' }, [
            $.div({ className: 'loading-content' }, [
                $.h1({ className: 'loading-title' }, ['MOOSH WALLET']),
                $.div({ className: 'loading-spinner' }),
                $.p({ className: 'loading-text' }, ['Initializing secure wallet...'])
            ])
        ]);

        this.container.appendChild(loadingScreen);
    }

    /**
     * Show error screen
     */
    showErrorScreen(message) {
        this.container.innerHTML = '';
        
        const errorScreen = $.div({ className: 'error-screen' }, [
            $.div({ className: 'error-content' }, [
                $.h1({ className: 'error-title' }, ['Error']),
                $.p({ className: 'error-message' }, [message]),
                $.button({
                    className: 'btn btn-primary',
                    onclick: () => window.location.reload()
                }, ['Reload App'])
            ])
        ]);

        this.container.appendChild(errorScreen);
    }

    /**
     * Show home page
     */
    showHomePage() {
        const content = document.getElementById('app-content');
        if (!content) {
            console.error('app-content element not found');
            return;
        }
        
        content.innerHTML = '';

        const homePage = $.div({ className: 'page home-page' }, [
            $.div({ className: 'home-hero' }, [
                $.h1({ className: 'home-title' }, ['Welcome to MOOSH Wallet']),
                $.p({ className: 'home-subtitle' }, [
                    'Professional-grade Bitcoin & Spark Protocol wallet'
                ]),
                $.div({ className: 'home-actions' }, [
                    new Button({
                        label: 'Create New Wallet',
                        variant: 'primary',
                        size: 'large',
                        onClick: () => this.navigate('/generate')
                    }).render(),
                    new Button({
                        label: 'Import Existing Wallet',
                        variant: 'secondary',
                        size: 'large',
                        onClick: () => this.navigate('/import')
                    }).render()
                ])
            ])
        ]);

        content.appendChild(homePage);
    }

    /**
     * Show dashboard
     */
    async showDashboard() {
        const content = document.getElementById('app-content');
        content.innerHTML = '';

        // Show loading
        const spinner = new LoadingSpinner({ text: 'Loading wallet...' });
        content.appendChild(spinner.render());

        try {
            // Refresh wallet data
            await walletManager.refreshActiveWallet();

            // Get active wallet
            const wallet = walletManager.getActiveWallet();
            
            // Clear content
            content.innerHTML = '';

            // Create dashboard
            const dashboard = $.div({ className: 'page dashboard-page' }, [
                // Wallet info
                $.div({ className: 'wallet-info' }, [
                    $.h2({}, [wallet.label]),
                    $.p({ className: 'wallet-address' }, [
                        utils.truncateAddress(wallet.addresses.bitcoin)
                    ]),
                    $.div({ className: 'wallet-balance' }, [
                        $.h3({}, [utils.formatBitcoin(wallet.balance.bitcoin) + ' BTC']),
                        $.p({}, [utils.formatCurrency(wallet.balance.usd)])
                    ])
                ]),

                // Actions
                $.div({ className: 'wallet-actions' }, [
                    new Button({
                        label: 'Send',
                        variant: 'primary',
                        onClick: () => this.showSendModal()
                    }).render(),
                    new Button({
                        label: 'Receive',
                        variant: 'secondary',
                        onClick: () => this.showReceiveModal()
                    }).render()
                ])
            ]);

            content.appendChild(dashboard);

        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Show generate seed page
     */
    showGenerateSeed() {
        const content = document.getElementById('app-content');
        content.innerHTML = '';

        const generatePage = $.div({ className: 'page generate-page' }, [
            $.h1({}, ['Create New Wallet']),
            $.p({}, ['Choose your seed phrase length']),
            
            $.div({ className: 'seed-options' }, [
                new Button({
                    label: '12 Words (Recommended)',
                    variant: 'primary',
                    size: 'large',
                    onClick: () => this.generateWallet(12)
                }).render(),
                new Button({
                    label: '24 Words (Maximum Security)',
                    variant: 'secondary',
                    size: 'large',
                    onClick: () => this.generateWallet(24)
                }).render()
            ])
        ]);

        content.appendChild(generatePage);
    }

    /**
     * Generate wallet
     */
    async generateWallet(wordCount) {
        try {
            stateManager.set('ui.loading', true);

            const wallet = await walletManager.generateWallet({ wordCount });
            
            // Show seed phrase
            this.showSeedPhraseModal(wallet.mnemonic);

            // Navigate to dashboard
            this.navigate('/dashboard');

        } catch (error) {
            this.handleError(error);
        } finally {
            stateManager.set('ui.loading', false);
        }
    }

    /**
     * Show seed phrase modal
     */
    showSeedPhraseModal(mnemonic) {
        const words = mnemonic.split(' ');
        
        const content = $.div({ className: 'seed-phrase-modal' }, [
            $.h2({}, ['Your Seed Phrase']),
            $.p({ className: 'warning' }, [
                '⚠️ Write down these words in order. Never share them with anyone!'
            ]),
            $.div({ className: 'seed-words' }, 
                words.map((word, i) => 
                    $.div({ className: 'seed-word' }, [
                        $.span({ className: 'word-number' }, [`${i + 1}.`]),
                        $.span({ className: 'word-text' }, [word])
                    ])
                )
            ),
            new Button({
                label: 'I have written down my seed phrase',
                variant: 'primary',
                onClick: () => this.closeModal()
            }).render()
        ]);

        const modal = new Modal({
            title: 'Backup Your Wallet',
            content,
            size: 'large',
            closeOnBackdrop: false,
            closeOnEsc: false
        });

        document.getElementById('app-modals').appendChild(modal.render());
    }

    /**
     * Handle state changes
     */
    handleStateChange(value, oldValue, key) {
        console.log(`State changed: ${key}`, { oldValue, value });
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('App error:', error);
        
        const message = error.message || constants.ERROR_MESSAGES.API_ERROR;
        
        const toastsContainer = document.getElementById('app-toasts');
        if (!toastsContainer) {
            console.error('app-toasts element not found');
            return;
        }
        
        const toast = new Toast({
            type: 'error',
            title: 'Error',
            message: message,
            duration: 5000
        });

        toastsContainer.appendChild(toast.render());
        toast.mount();
    }

    /**
     * Handle success
     */
    handleSuccess(message) {
        const toast = new Toast({
            type: 'success',
            title: 'Success',
            message: message,
            duration: 3000
        });

        document.getElementById('app-toasts').appendChild(toast.render());
        toast.mount();
    }

    /**
     * Close modal
     */
    closeModal() {
        const modalsContainer = document.getElementById('app-modals');
        modalsContainer.innerHTML = '';
        stateManager.set('ui.modal', null);
    }

    /**
     * Clean up
     */
    destroy() {
        // Clean up listeners
        window.removeEventListener('hashchange', this.handleRoute);
        
        // Clean up services
        apiService.destroy();
        
        // Clear state
        stateManager.destroy();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new MOOSHWalletApp();
        window.app.initialize();
    });
} else {
    window.app = new MOOSHWalletApp();
    window.app.initialize();
}

// Export for debugging
export default MOOSHWalletApp;