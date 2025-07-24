// MOOSH WALLET - Crypto Utilities Module
// Extracted from moosh-wallet.js for better code organization
// This module contains cryptographic utility functions

(function(window) {
    'use strict';

    class CryptoUtils {
        // Generate cryptographically secure random values
        static generateSecureRandom(length = 32) {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            return array;
        }

        // Generate a secure random index for wordlist selection
        static generateSecureRandomIndex(max) {
            const randomBytes = new Uint32Array(1);
            window.crypto.getRandomValues(randomBytes);
            return randomBytes[0] % max;
        }

        // Simple hash function for passwords (in production, use bcrypt or similar)
        static hashPassword(password) {
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString(16);
        }

        // Verify password against hash
        static verifyPassword(password, hash) {
            return this.hashPassword(password) === hash;
        }

        // Simple encryption for demo purposes (in production, use proper crypto library)
        static async encryptData(data, password) {
            // This is a placeholder - in production use Web Crypto API or similar
            return btoa(JSON.stringify(data) + ':' + password);
        }

        // Simple decryption for demo purposes
        static async decryptData(encryptedData, password) {
            try {
                const decoded = atob(encryptedData);
                const parts = decoded.split(':');
                if (parts[parts.length - 1] === password) {
                    parts.pop(); // Remove password
                    return JSON.parse(parts.join(':'));
                }
                return null;
            } catch (error) {
                console.error('Decryption failed:', error);
                return null;
            }
        }

        // Convert hex to bytes
        static hexToBytes(hex) {
            const bytes = [];
            for (let i = 0; i < hex.length; i += 2) {
                bytes.push(parseInt(hex.substr(i, 2), 16));
            }
            return new Uint8Array(bytes);
        }

        // Convert bytes to hex
        static bytesToHex(bytes) {
            return Array.from(bytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        // Generate a random hex string
        static generateRandomHex(length = 32) {
            const bytes = this.generateSecureRandom(length);
            return this.bytesToHex(bytes);
        }

        // Basic entropy calculation
        static calculateEntropy(data) {
            if (!data || data.length === 0) return 0;
            
            const frequencies = {};
            for (let i = 0; i < data.length; i++) {
                const char = data[i];
                frequencies[char] = (frequencies[char] || 0) + 1;
            }
            
            let entropy = 0;
            const dataLength = data.length;
            
            Object.values(frequencies).forEach(freq => {
                const probability = freq / dataLength;
                entropy -= probability * Math.log2(probability);
            });
            
            return entropy;
        }

        // Check if running in secure context (HTTPS)
        static isSecureContext() {
            return window.isSecureContext === true;
        }

        // Validate entropy strength
        static validateEntropyStrength(entropy, requiredBits = 128) {
            return entropy >= requiredBits;
        }
    }

    // Make available globally and maintain compatibility
    window.CryptoUtils = CryptoUtils;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.CryptoUtils = CryptoUtils;
    }

})(window);