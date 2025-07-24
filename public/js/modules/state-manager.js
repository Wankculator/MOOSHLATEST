/**
 * State Manager Module
 * Centralized state management for MOOSH Wallet
 * Handles all application state with event-driven updates
 */

export class StateManager {
    constructor() {
        this.state = new Map();
        this.listeners = new Map();
        this.history = [];
        this.maxHistory = 50;
        
        // Initialize with default state
        this.initializeState();
    }

    initializeState() {
        // Default application state
        this.state.set('app.initialized', false);
        this.state.set('app.locked', true);
        this.state.set('app.network', 'MAINNET');
        this.state.set('app.currency', 'USD');
        
        // Wallet state
        this.state.set('wallet.exists', false);
        this.state.set('wallet.imported', false);
        this.state.set('wallet.type', null);
        this.state.set('wallet.address', null);
        this.state.set('wallet.balance', '0');
        
        // UI state
        this.state.set('ui.loading', false);
        this.state.set('ui.modal', null);
        this.state.set('ui.theme', 'dark');
        
        // Multi-wallet state
        this.state.set('wallets.list', []);
        this.state.set('wallets.activeIndex', 0);
        this.state.set('wallets.count', 0);
    }

    get(key) {
        return this.state.get(key);
    }

    set(key, value, options = {}) {
        const oldValue = this.state.get(key);
        
        // Skip if value hasn't changed (unless forced)
        if (oldValue === value && !options.force) {
            return;
        }

        // Set the new value
        this.state.set(key, value);

        // Add to history
        if (!options.silent) {
            this.addToHistory({ key, oldValue, newValue: value });
        }

        // Notify listeners
        this.notifyListeners(key, value, oldValue);

        // Notify wildcard listeners
        this.notifyWildcardListeners(key, value, oldValue);
    }

    update(updates, options = {}) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value, options);
        });
    }

    on(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    off(key, callback) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(key);
            }
        }
    }

    once(key, callback) {
        const unsubscribe = this.on(key, (value, oldValue) => {
            callback(value, oldValue);
            unsubscribe();
        });
        return unsubscribe;
    }

    notifyListeners(key, value, oldValue) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, oldValue, key);
                } catch (error) {
                    console.error(`Error in state listener for ${key}:`, error);
                }
            });
        }
    }

    notifyWildcardListeners(key, value, oldValue) {
        // Check for wildcard listeners (e.g., 'wallet.*')
        this.listeners.forEach((callbacks, pattern) => {
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
                if (regex.test(key)) {
                    callbacks.forEach(callback => {
                        try {
                            callback(value, oldValue, key);
                        } catch (error) {
                            console.error(`Error in wildcard listener for ${pattern}:`, error);
                        }
                    });
                }
            }
        });
    }

    addToHistory(change) {
        this.history.push({
            ...change,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
    }

    reset() {
        this.state.clear();
        this.history = [];
        this.initializeState();
        
        // Notify all listeners about reset
        this.listeners.forEach((callbacks, key) => {
            const value = this.state.get(key);
            callbacks.forEach(callback => {
                try {
                    callback(value, undefined, key);
                } catch (error) {
                    console.error(`Error notifying reset for ${key}:`, error);
                }
            });
        });
    }

    getState() {
        return Object.fromEntries(this.state);
    }

    setState(newState) {
        Object.entries(newState).forEach(([key, value]) => {
            this.set(key, value, { silent: true });
        });
    }

    // Utility methods for common operations
    isLocked() {
        return this.get('app.locked') === true;
    }

    isInitialized() {
        return this.get('app.initialized') === true;
    }

    hasWallet() {
        return this.get('wallet.exists') === true;
    }

    getActiveWallet() {
        const wallets = this.get('wallets.list') || [];
        const activeIndex = this.get('wallets.activeIndex') || 0;
        return wallets[activeIndex] || null;
    }

    // Debug method
    debug() {
        console.group('State Manager Debug');
        console.log('Current State:', this.getState());
        console.log('Listeners:', Array.from(this.listeners.keys()));
        console.log('History Length:', this.history.length);
        console.groupEnd();
    }

    // Clean up method
    destroy() {
        this.state.clear();
        this.listeners.clear();
        this.history = [];
    }
}

// Export singleton instance
export const stateManager = new StateManager();

// Default export
export default StateManager;