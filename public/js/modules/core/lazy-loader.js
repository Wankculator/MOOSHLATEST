/**
 * Lazy Loader Module
 * Implements dynamic module loading for performance optimization
 * Reduces initial bundle size by loading modules on demand
 */

(function() {
    'use strict';

    class LazyLoader {
        constructor() {
            this.loadedModules = new Map();
            this.loadingModules = new Map();
            this.moduleManifest = {
                // Heavy modals that can be lazy loaded
                'OrdinalsModal': '/js/modules/modals/OrdinalsModal.js',
                'SwapModal': '/js/modules/modals/SwapModal.js',
                'AccountListModal': '/js/modules/modals/AccountListModal.js',
                'TransactionHistoryModal': '/js/modules/modals/TransactionHistoryModal.js',
                'MultiAccountModal': '/js/modules/modals/MultiAccountModal.js',
                'SparkDashboardModal': '/js/modules/modals/SparkDashboardModal.js',
                'OrdinalsTerminalModal': '/js/modules/modals/OrdinalsTerminalModal.js',
                
                // Heavy features that can be lazy loaded
                'OrdinalsManager': '/js/modules/features/ordinals-manager.js',
                
                // Pages that might not be immediately needed
                'WalletDetailsPage': '/js/modules/pages/WalletDetailsPage.js',
                'DashboardPage': '/js/modules/pages/DashboardPage.js'
            };
            
            // Modules that should be preloaded after initial load
            this.preloadQueue = [
                'DashboardPage', // Most users go here after login
                'WalletDetailsPage' // Common navigation target
            ];
            
            // Performance monitoring
            this.loadTimes = new Map();
        }

        /**
         * Load a module dynamically
         * @param {string} moduleName - Name of the module to load
         * @returns {Promise<any>} The loaded module
         */
        async loadModule(moduleName) {
            // Return if already loaded
            if (this.loadedModules.has(moduleName)) {
                return this.loadedModules.get(moduleName);
            }
            
            // Return existing promise if currently loading
            if (this.loadingModules.has(moduleName)) {
                return this.loadingModules.get(moduleName);
            }
            
            // Check if module exists in manifest
            if (!this.moduleManifest[moduleName]) {
                throw new Error(`Module ${moduleName} not found in lazy loading manifest`);
            }
            
            // Start loading
            const startTime = performance.now();
            const loadPromise = this._loadScript(moduleName);
            
            this.loadingModules.set(moduleName, loadPromise);
            
            try {
                const module = await loadPromise;
                const loadTime = performance.now() - startTime;
                
                this.loadedModules.set(moduleName, module);
                this.loadingModules.delete(moduleName);
                this.loadTimes.set(moduleName, loadTime);
                
                console.log(`[LazyLoader] Loaded ${moduleName} in ${loadTime.toFixed(2)}ms`);
                
                return module;
            } catch (error) {
                this.loadingModules.delete(moduleName);
                console.error(`[LazyLoader] Failed to load ${moduleName}:`, error);
                throw error;
            }
        }

        /**
         * Load multiple modules in parallel
         * @param {string[]} moduleNames - Array of module names
         * @returns {Promise<Map>} Map of loaded modules
         */
        async loadModules(moduleNames) {
            const promises = moduleNames.map(name => 
                this.loadModule(name).then(module => [name, module])
            );
            
            const results = await Promise.all(promises);
            return new Map(results);
        }

        /**
         * Preload modules for better performance
         * @param {string[]} moduleNames - Optional specific modules to preload
         */
        async preloadModules(moduleNames = null) {
            const modulesToPreload = moduleNames || this.preloadQueue;
            
            // Use requestIdleCallback if available
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => {
                    this._preloadInBackground(modulesToPreload);
                }, { timeout: 2000 });
            } else {
                // Fallback to setTimeout
                setTimeout(() => {
                    this._preloadInBackground(modulesToPreload);
                }, 1000);
            }
        }

        /**
         * Private method to preload modules in background
         * @param {string[]} moduleNames
         */
        async _preloadInBackground(moduleNames) {
            console.log('[LazyLoader] Starting background preload...');
            
            for (const moduleName of moduleNames) {
                if (!this.loadedModules.has(moduleName)) {
                    try {
                        await this.loadModule(moduleName);
                    } catch (error) {
                        console.warn(`[LazyLoader] Failed to preload ${moduleName}:`, error);
                    }
                }
            }
        }

        /**
         * Load a script dynamically
         * @param {string} moduleName
         * @returns {Promise<any>}
         */
        _loadScript(moduleName) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                const modulePath = this.moduleManifest[moduleName];
                
                script.src = modulePath;
                script.async = true;
                
                // Set up load handler
                script.onload = () => {
                    // Check if module was added to window
                    if (window[moduleName]) {
                        resolve(window[moduleName]);
                    } else {
                        // Try to find it in various namespaces
                        const module = this._findModule(moduleName);
                        if (module) {
                            resolve(module);
                        } else {
                            reject(new Error(`Module ${moduleName} not found after loading`));
                        }
                    }
                };
                
                // Set up error handler
                script.onerror = () => {
                    reject(new Error(`Failed to load script: ${modulePath}`));
                };
                
                // Add to document
                document.head.appendChild(script);
            });
        }

        /**
         * Try to find module in various locations
         * @param {string} moduleName
         * @returns {any|null}
         */
        _findModule(moduleName) {
            // Check common namespaces
            const namespaces = [
                window,
                window.MOOSHWallet,
                window.MOOSHWalletApp,
                window.modules
            ];
            
            for (const ns of namespaces) {
                if (ns && ns[moduleName]) {
                    return ns[moduleName];
                }
            }
            
            return null;
        }

        /**
         * Get performance statistics
         * @returns {Object}
         */
        getStats() {
            const stats = {
                loadedCount: this.loadedModules.size,
                totalLoadTime: 0,
                averageLoadTime: 0,
                modules: []
            };
            
            for (const [name, time] of this.loadTimes) {
                stats.totalLoadTime += time;
                stats.modules.push({ name, time });
            }
            
            if (stats.loadedCount > 0) {
                stats.averageLoadTime = stats.totalLoadTime / stats.loadedCount;
            }
            
            // Sort by load time
            stats.modules.sort((a, b) => b.time - a.time);
            
            return stats;
        }

        /**
         * Clear loaded modules (useful for testing)
         */
        clear() {
            this.loadedModules.clear();
            this.loadingModules.clear();
            this.loadTimes.clear();
        }

        /**
         * Create a lazy component that loads on first use
         * @param {string} moduleName
         * @param {string} componentName
         * @returns {Function}
         */
        createLazyComponent(moduleName, componentName) {
            return async (...args) => {
                const module = await this.loadModule(moduleName);
                const Component = module[componentName] || module.default || module;
                
                if (typeof Component === 'function') {
                    return new Component(...args);
                } else {
                    throw new Error(`${componentName} is not a constructor in ${moduleName}`);
                }
            };
        }

        /**
         * Intersection Observer for lazy loading on scroll
         * @param {Element} element
         * @param {string} moduleName
         */
        observeElement(element, moduleName) {
            if (!('IntersectionObserver' in window)) {
                // Fallback: load immediately
                this.loadModule(moduleName);
                return;
            }
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadModule(moduleName);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px' // Start loading 50px before element is visible
            });
            
            observer.observe(element);
        }
    }

    // Export for use in other modules
    window.LazyLoader = LazyLoader;
    
    // Create singleton instance
    window.lazyLoader = new LazyLoader();
})();