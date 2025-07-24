// MOOSH WALLET - Secure Storage Module
// Handles encrypted storage of sensitive data
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class SecureStorage {
        constructor() {
            // Use a simple key for now - in production should use PBKDF2 or similar
            this.encryptionKey = 'moosh-wallet-secure-key';
            
            // Initialize storage
            this.storage = window.localStorage;
        }

        // Simple XOR encryption (replace with proper encryption in production)
        encrypt(text) {
            if (!text) return '';
            
            let encrypted = '';
            for (let i = 0; i < text.length; i++) {
                encrypted += String.fromCharCode(
                    text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                );
            }
            
            // Base64 encode for storage
            return btoa(encrypted);
        }

        decrypt(encryptedText) {
            if (!encryptedText) return '';
            
            try {
                // Base64 decode
                const encrypted = atob(encryptedText);
                
                let decrypted = '';
                for (let i = 0; i < encrypted.length; i++) {
                    decrypted += String.fromCharCode(
                        encrypted.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
                    );
                }
                
                return decrypted;
            } catch (error) {
                console.error('[SecureStorage] Decryption failed:', error);
                return null;
            }
        }

        setItem(key, value) {
            try {
                const encrypted = this.encrypt(JSON.stringify(value));
                this.storage.setItem(`secure_${key}`, encrypted);
                return true;
            } catch (error) {
                console.error('[SecureStorage] Failed to store item:', error);
                return false;
            }
        }

        getItem(key) {
            try {
                const encrypted = this.storage.getItem(`secure_${key}`);
                if (!encrypted) return null;
                
                const decrypted = this.decrypt(encrypted);
                if (!decrypted) return null;
                
                return JSON.parse(decrypted);
            } catch (error) {
                console.error('[SecureStorage] Failed to retrieve item:', error);
                return null;
            }
        }

        removeItem(key) {
            try {
                this.storage.removeItem(`secure_${key}`);
                return true;
            } catch (error) {
                console.error('[SecureStorage] Failed to remove item:', error);
                return false;
            }
        }

        clear() {
            try {
                // Only clear secure storage items
                const keys = [];
                for (let i = 0; i < this.storage.length; i++) {
                    const key = this.storage.key(i);
                    if (key && key.startsWith('secure_')) {
                        keys.push(key);
                    }
                }
                
                keys.forEach(key => this.storage.removeItem(key));
                return true;
            } catch (error) {
                console.error('[SecureStorage] Failed to clear storage:', error);
                return false;
            }
        }

        // Check if secure storage is available
        isAvailable() {
            try {
                const testKey = '__secure_storage_test__';
                this.storage.setItem(testKey, 'test');
                this.storage.removeItem(testKey);
                return true;
            } catch (error) {
                return false;
            }
        }

        // Migrate old unencrypted data to secure storage
        migrateData(key, deleteOriginal = true) {
            try {
                const oldData = this.storage.getItem(key);
                if (oldData) {
                    // Parse if it's JSON
                    let data;
                    try {
                        data = JSON.parse(oldData);
                    } catch {
                        data = oldData;
                    }
                    
                    // Store encrypted
                    if (this.setItem(key, data)) {
                        // Remove old unencrypted data if requested
                        if (deleteOriginal) {
                            this.storage.removeItem(key);
                        }
                        return true;
                    }
                }
                return false;
            } catch (error) {
                console.error('[SecureStorage] Migration failed:', error);
                return false;
            }
        }
    }

    // Make available globally and maintain compatibility
    window.SecureStorage = SecureStorage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.SecureStorage = SecureStorage;
    }

})(window);