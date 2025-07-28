// MOOSH WALLET - General Utilities Module
// Extracted from moosh-wallet.js for better code organization
// This module contains general utility functions

(function(window) {
    'use strict';

    class GeneralUtils {
        static formatBitcoin(satoshis) {
            if (!satoshis || isNaN(satoshis)) return '0.00000000';
            const btc = satoshis / 100000000;
            return btc.toFixed(8);
        }

        static formatUSD(amount) {
            if (!amount || isNaN(amount)) return '$0.00';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }

        static truncateAddress(address, startLength = 6, endLength = 4) {
            if (!address || address.length < startLength + endLength + 3) return address;
            return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
        }

        static formatDate(timestamp) {
            if (!timestamp) return 'Unknown';
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }

        static async copyToClipboard(text, showNotification = true) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'absolute';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                    } finally {
                        document.body.removeChild(textArea);
                    }
                }
                
                if (showNotification && window.app && window.app.showNotification) {
                    window.app.showNotification('Copied to clipboard', 'success');
                }
                
                return true;
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                if (showNotification && window.app && window.app.showNotification) {
                    window.app.showNotification('Failed to copy', 'error');
                }
                return false;
            }
        }

        static generateUniqueId() {
            // Use crypto-secure randomness for unique ID generation
            const randomBytes = new Uint8Array(5);
            window.crypto.getRandomValues(randomBytes);
            const random = Array.from(randomBytes)
                .map(b => b.toString(36))
                .join('')
                .substring(0, 9);
            return `${Date.now()}-${random}`;
        }

        static sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        static parseError(error) {
            if (typeof error === 'string') return error;
            if (error.message) return error.message;
            if (error.error) return error.error;
            return 'An unknown error occurred';
        }

        static isObjectEmpty(obj) {
            return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
        }

        static deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (obj instanceof Object) {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        }
    }

    // Make available globally and maintain compatibility
    window.GeneralUtils = GeneralUtils;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.GeneralUtils = GeneralUtils;
    }

})(window);