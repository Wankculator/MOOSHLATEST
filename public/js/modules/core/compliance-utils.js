// MOOSH WALLET - Compliance Utilities Module
// 100% MOOSH Standards Enforcement
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // COMPLIANCE UTILITIES - 100% MOOSH Standards Enforcement
    // ═══════════════════════════════════════════════════════════════════════
    class ComplianceUtils {
        // Debounce utility - REQUIRED for all rapid actions
        static debounce(func, wait = 300) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Input validation - REQUIRED for all user inputs
        static validateInput(value, type) {
            switch(type) {
                case 'accountName':
                    if (!value || !value.trim()) {
                        return { valid: false, error: 'Account name required' };
                    }
                    if (value.trim().length > 50) {
                        return { valid: false, error: 'Name too long (max 50 characters)' };
                    }
                    // Check for HTML/script injection
                    if (/<[^>]*>/g.test(value)) {
                        return { valid: false, error: 'Invalid characters detected' };
                    }
                    return { valid: true, sanitized: value.trim() };
                
                case 'color':
                    if (!value || typeof value !== 'string') {
                        return { valid: false, error: 'Color value required' };
                    }
                    if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        return { valid: false, error: 'Invalid color format (use #RRGGBB)' };
                    }
                    return { valid: true, value: value.toUpperCase() };
                
                case 'mnemonic':
                    if (!value || !value.trim()) {
                        return { valid: false, error: 'Seed phrase required' };
                    }
                    const words = value.trim().split(/\s+/);
                    if (words.length !== 12 && words.length !== 24) {
                        return { valid: false, error: 'Seed phrase must be 12 or 24 words' };
                    }
                    return { valid: true, sanitized: words.join(' ') };
                
                case 'password':
                    if (!value || value.length < 8) {
                        return { valid: false, error: 'Password must be at least 8 characters' };
                    }
                    if (value.length > 128) {
                        return { valid: false, error: 'Password too long (max 128 characters)' };
                    }
                    return { valid: true };
                
                default:
                    return { valid: false, error: 'Unknown input type' };
            }
        }

        // ASCII indicators - NO EMOJIS
        static getStatusIndicator(status) {
            const indicators = {
                'success': '[OK]',
                'error': '[XX]',
                'warning': '[!!]',
                'info': '[..]',
                'loading': '[~~]',
                'ready': '[>>]',
                'stop': '[X]',
                'unknown': '[??]',
                'money': '[$$]',
                'settings': '[~]',
                'count': '[#]'
            };
            return indicators[status] || '[??]';
        }

        // Safe array access with bounds checking
        static safeArrayAccess(array, index, defaultValue = null) {
            if (!Array.isArray(array) || index < 0 || index >= array.length) {
                return defaultValue;
            }
            return array[index];
        }

        // Fix array index after deletion
        static fixArrayIndex(currentIndex, arrayLength) {
            if (arrayLength === 0) return -1;
            if (currentIndex >= arrayLength) {
                return Math.max(0, arrayLength - 1);
            }
            return Math.max(0, currentIndex);
        }

        // Format console log with component prefix
        static log(component, message, type = 'log') {
            const prefix = `[${component}]`;
            const timestamp = new Date().toISOString();
            
            switch(type) {
                case 'error':
                    console.error(`${prefix} ${message}`, { timestamp });
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}`, { timestamp });
                    break;
                default:
                    console.log(`${prefix} ${message}`, { timestamp });
            }
        }

        // Check if we can delete (prevent last item deletion)
        static canDelete(currentCount, minimum = 1) {
            return currentCount > minimum;
        }

        // Mobile detection
        static isMobileDevice() {
            return window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        // Performance timing
        static measurePerformance(operation, callback) {
            const start = performance.now();
            const result = callback();
            const duration = performance.now() - start;
            
            if (duration > 100) {
                this.log('Performance', `${operation} took ${duration.toFixed(2)}ms`, 'warn');
            }
            
            return result;
        }
    }

    // Make available globally and maintain compatibility
    window.ComplianceUtils = ComplianceUtils;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ComplianceUtils = ComplianceUtils;
    }

})(window);