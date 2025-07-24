// MOOSH WALLET - Validation Utilities Module
// Extracted from moosh-wallet.js for better code organization
// This module contains all validation functions

(function(window) {
    'use strict';

    class ValidationUtils {
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
                    return { valid: true };
                    
                case 'password':
                    if (!value || value.length < 8) {
                        return { valid: false, error: 'Password must be at least 8 characters' };
                    }
                    return { valid: true };
                    
                case 'seedPhrase':
                    if (!value || !value.trim()) {
                        return { valid: false, error: 'Seed phrase required' };
                    }
                    const words = value.trim().split(/\s+/);
                    if (words.length !== 12 && words.length !== 24) {
                        return { valid: false, error: 'Seed phrase must be 12 or 24 words' };
                    }
                    return { valid: true };
                    
                case 'bitcoinAddress':
                    if (!value || !value.trim()) {
                        return { valid: false, error: 'Bitcoin address required' };
                    }
                    // Basic Bitcoin address validation
                    const addressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
                    if (!addressRegex.test(value.trim())) {
                        return { valid: false, error: 'Invalid Bitcoin address format' };
                    }
                    return { valid: true };
                    
                case 'amount':
                    if (!value || isNaN(value) || parseFloat(value) <= 0) {
                        return { valid: false, error: 'Invalid amount' };
                    }
                    return { valid: true };
                    
                default:
                    return { valid: true };
            }
        }

        static sanitizeInput(value) {
            if (typeof value !== 'string') return value;
            // Remove any HTML tags
            return value.replace(/<[^>]*>/g, '').trim();
        }

        static isValidBitcoinAddress(address) {
            if (!address) return false;
            // Basic validation for different Bitcoin address types
            const patterns = {
                // Legacy (P2PKH) - starts with 1
                legacy: /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
                // P2SH - starts with 3
                p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
                // Native SegWit (P2WPKH) - starts with bc1q
                segwit: /^bc1q[a-z0-9]{39,59}$/,
                // Taproot (P2TR) - starts with bc1p
                taproot: /^bc1p[a-z0-9]{58}$/
            };
            
            return Object.values(patterns).some(pattern => pattern.test(address));
        }

        static isValidMnemonic(mnemonic) {
            if (!mnemonic || typeof mnemonic !== 'string') return false;
            const words = mnemonic.trim().split(/\s+/);
            return words.length === 12 || words.length === 24;
        }
    }

    // Make available globally and maintain compatibility
    window.ValidationUtils = ValidationUtils;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ValidationUtils = ValidationUtils;
    }

})(window);