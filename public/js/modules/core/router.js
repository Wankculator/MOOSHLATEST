// MOOSH WALLET - Router Module
// Single Page Application Navigation System
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class Router {
        constructor(app) {
            this.app = app;
            this.routes = new Map();
            this.setupRoutes();
            this.bindEvents();
        }

        setupRoutes() {
            // Note: Page classes need to be available globally
            // They will be added via the page modules
            this.routes.set('home', () => new HomePage(this.app));
            this.routes.set('generate-seed', () => new GenerateSeedPage(this.app));
            this.routes.set('confirm-seed', () => new ConfirmSeedPage(this.app));
            this.routes.set('import-seed', () => new ImportSeedPage(this.app));
            this.routes.set('wallet-created', () => new WalletCreatedPage(this.app));
            this.routes.set('wallet-imported', () => new WalletImportedPage(this.app));
            this.routes.set('wallet-details', () => new WalletDetailsPage(this.app));
            this.routes.set('dashboard', () => new DashboardPage(this.app));
        }

        bindEvents() {
            // Store handler for cleanup
            this.hashChangeHandler = () => {
                const hash = window.location.hash.substring(1);
                console.log('[Router] Hash changed to:', hash);
                if (hash) {
                    this.navigate(hash);
                }
            };
            window.addEventListener('hashchange', this.hashChangeHandler);
        }
        
        // Add cleanup method
        cleanup() {
            if (this.hashChangeHandler) {
                window.removeEventListener('hashchange', this.hashChangeHandler);
                this.hashChangeHandler = null;
            }
        }

        navigate(pageId, options = {}) {
            const currentPage = this.app.state.get('currentPage');
            const currentPageFull = this.app.state.get('currentPageFull');
            console.log('[Router] Navigating from', currentPage, 'to', pageId);
            console.log('[Router] Routes available:', Array.from(this.routes.keys()));
            
            // Extract the page name without query parameters for routing
            const pageNameOnly = pageId.split('?')[0];
            console.log('[Router] Page name only:', pageNameOnly);
            console.log('[Router] Route exists for', pageNameOnly, ':', this.routes.has(pageNameOnly));
            
            // Force refresh option for same page navigation
            if (options.forceRefresh || pageId !== currentPageFull) {
                const history = [...this.app.state.get('navigationHistory')];
                history.push(pageId);
                this.app.state.update({
                    currentPage: pageNameOnly, // Store only the page name for routing
                    currentPageFull: pageId,    // Store full page with params for reference
                    navigationHistory: history
                });
                console.log('[Router] State updated. New currentPage:', pageNameOnly);
            }
            
            window.location.hash = pageId;
            console.log('[Router] Hash set to:', pageId);
            console.log('[Router] Calling render()...');
            this.render();
        }

        goBack() {
            const history = [...this.app.state.get('navigationHistory')];
            if (history.length > 1) {
                history.pop();
                const previousPage = history[history.length - 1];
                this.app.state.update({
                    currentPage: previousPage,
                    navigationHistory: history
                });
                window.location.hash = previousPage;
                this.render();
            } else {
                this.navigate('home');
            }
        }

        render() {
            console.log('[Router.render] Starting render...');
            
            // Check if wallet is locked before rendering any page
            const hasPassword = localStorage.getItem('walletPassword') !== null;
            const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
            
            console.log('[Router.render] hasPassword:', hasPassword, 'isUnlocked:', isUnlocked);
            
            // Get current page
            const currentPage = this.app.state.get('currentPage');
            
            // Skip lock check for seed generation flow pages
            const seedFlowPages = ['generate-seed', 'confirm-seed', 'wallet-created'];
            const isInSeedFlow = seedFlowPages.includes(currentPage);
            
            console.log('[Router.render] Current page:', currentPage, 'Is in seed flow:', isInSeedFlow);
            
            if (hasPassword && !isUnlocked && !isInSeedFlow) {
                console.log('[Router] Wallet is locked, showing lock screen instead of page');
                // Clear any existing lock screens
                const existingLock = document.querySelector('.wallet-lock-overlay');
                if (existingLock) {
                    existingLock.remove();
                }
                // Show lock screen
                // Note: WalletLockScreen needs to be available globally
                if (window.WalletLockScreen) {
                    const lockScreen = new WalletLockScreen(this.app);
                    const lockElement = lockScreen.render();
                    document.body.appendChild(lockElement);
                } else {
                    console.error('[Router] WalletLockScreen not available');
                }
                return; // Don't render the requested page
            }
            const PageClass = this.routes.get(currentPage);
            
            console.log('[Router] Rendering page:', currentPage);
            console.log('[Router] PageClass found:', !!PageClass);
            console.log('[Router] Available routes:', Array.from(this.routes.keys()));
            
            if (PageClass) {
                // Try multiple selectors to find content element
                let content = document.querySelector('.cursor-content');
                if (!content) {
                    content = document.querySelector('.content-area');
                }
                if (!content) {
                    content = document.getElementById('content');
                }
                
                console.log('[Router] Content element found:', !!content);
                console.log('[Router] Content element:', content);
                console.log('[Router] Content element class:', content?.className);
                
                if (content) {
                    // Clear any existing page instance
                    if (this.currentPageInstance && this.currentPageInstance.destroy) {
                        console.log('[Router] Destroying previous page instance');
                        this.currentPageInstance.destroy();
                    }
                    
                    content.innerHTML = '';
                    console.log('[Router] Creating new page instance for:', currentPage);
                    const page = PageClass();
                    this.currentPageInstance = page;
                    console.log('[Router] Page instance created:', !!page);
                    
                    // Store dashboard instance on app for easy access
                    if (currentPage === 'dashboard') {
                        this.app.dashboard = page;
                        console.log('[Router] Dashboard instance stored on app');
                    }
                    
                    // Mount the page
                    console.log('[Router] Mounting page...');
                    page.mount(content);
                    console.log('[Router] Page mounted, content children:', content.children.length);
                    
                    // Refresh header to show/hide lock button
                    if (this.app.header) {
                        const headerContainer = document.querySelector('.cursor-header');
                        if (headerContainer) {
                            headerContainer.innerHTML = '';
                            // Note: Header class needs to be available globally
                            if (window.Header) {
                                this.app.header = new Header(this.app);
                                this.app.header.mount(headerContainer);
                            }
                        }
                    }
                    
                    // Force focus on password input if lock screen is showing
                    setTimeout(() => {
                        const passwordInput = document.getElementById('lockPassword');
                        if (passwordInput) {
                            passwordInput.focus();
                            console.log('[Router] Lock screen password input focused');
                        }
                    }, 100);
                } else {
                    console.error('[Router] Content element not found! Attempting to create it...');
                    
                    // Try to find or create container
                    let container = document.querySelector('.cursor-container');
                    if (!container) {
                        container = document.getElementById('app');
                    }
                    if (!container) {
                        container = document.body;
                    }
                    
                    // Create content area using ElementFactory ($)
                    const newContent = $.div({ 
                        id: 'content',
                        className: 'content-area cursor-content'
                    });
                    container.appendChild(newContent);
                    
                    console.log('[Router] Created new content element, retrying render...');
                    
                    // Retry render with new content element
                    setTimeout(() => {
                        this.render();
                    }, 0);
                }
            } else {
                console.error('[Router] No PageClass found for:', currentPage);
            }
        }
    }

    // Make available globally and maintain compatibility
    window.Router = Router;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.Router = Router;
    }

})(window);