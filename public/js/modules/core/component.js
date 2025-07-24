// MOOSH WALLET - Component Base Class Module
// Base class for all UI components
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class Component {
        constructor(app) {
            this.app = app;
            this.element = null;
            this.stateListeners = [];
        }

        render() {
            throw new Error('render() must be implemented by subclass');
        }

        mount(parent) {
            this.element = this.render();
            if (this.element) {
                parent.appendChild(this.element);
                this.afterMount();
            } else {
                console.error('[Component] render() returned null or undefined');
            }
        }

        afterMount() {
            // Override in subclass if needed
        }

        unmount() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            // Also check if the element is directly in body
            const lockOverlay = document.querySelector('.wallet-lock-overlay');
            if (lockOverlay && lockOverlay.parentNode) {
                lockOverlay.parentNode.removeChild(lockOverlay);
            }
        }
        
        destroy() {
            // Remove all state listeners
            this.stateListeners.forEach(({ key, callback }) => {
                if (this.app.state.removeListener) {
                    this.app.state.removeListener(key, callback);
                }
            });
            this.stateListeners = [];
            this.unmount();
        }
        
        listenToState(key, callback) {
            if (this.app.state.subscribe) {
                this.app.state.subscribe(key, callback);
                this.stateListeners.push({ key, callback });
            }
        }
    }

    // Make available globally and maintain compatibility
    window.Component = Component;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.Component = Component;
    }

})(window);