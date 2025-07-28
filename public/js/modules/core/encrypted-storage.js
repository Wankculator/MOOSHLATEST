/**
 * Encrypted Storage Module
 * Provides client-side encryption for sensitive data persistence
 * Uses Web Crypto API for secure encryption/decryption
 */

(function() {
    'use strict';

    class EncryptedStorage {
        constructor() {
            this.algorithm = 'AES-GCM';
            this.keyDerivationAlgorithm = 'PBKDF2';
            this.iterations = 100000;
            this.saltLength = 16;
            this.ivLength = 12;
            this.tagLength = 128;
            this.storageKey = 'moosh_encrypted_vault';
            this.metadataKey = 'moosh_vault_metadata';
        }

        /**
         * Generate a new encryption key from password
         * @param {string} password - User's password
         * @param {Uint8Array} salt - Salt for key derivation
         * @returns {Promise<CryptoKey>} Derived key
         */
        async deriveKey(password, salt) {
            const encoder = new TextEncoder();
            const passwordKey = await window.crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            return window.crypto.subtle.deriveKey(
                {
                    name: this.keyDerivationAlgorithm,
                    salt: salt,
                    iterations: this.iterations,
                    hash: 'SHA-256'
                },
                passwordKey,
                {
                    name: this.algorithm,
                    length: 256
                },
                false,
                ['encrypt', 'decrypt']
            );
        }

        /**
         * Encrypt data with password
         * @param {Object} data - Data to encrypt
         * @param {string} password - User's password
         * @returns {Promise<Object>} Encrypted data with metadata
         */
        async encrypt(data, password) {
            try {
                // Generate random salt and IV
                const salt = window.crypto.getRandomValues(new Uint8Array(this.saltLength));
                const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));

                // Derive key from password
                const key = await this.deriveKey(password, salt);

                // Convert data to JSON string
                const encoder = new TextEncoder();
                const plaintext = encoder.encode(JSON.stringify(data));

                // Encrypt the data
                const ciphertext = await window.crypto.subtle.encrypt(
                    {
                        name: this.algorithm,
                        iv: iv,
                        tagLength: this.tagLength
                    },
                    key,
                    plaintext
                );

                // Combine salt, iv, and ciphertext
                const encryptedData = new Uint8Array(
                    salt.length + iv.length + ciphertext.byteLength
                );
                encryptedData.set(salt, 0);
                encryptedData.set(iv, salt.length);
                encryptedData.set(new Uint8Array(ciphertext), salt.length + iv.length);

                // Return base64 encoded result
                return {
                    encrypted: this.arrayBufferToBase64(encryptedData),
                    timestamp: Date.now(),
                    version: '1.0'
                };
            } catch (error) {
                console.error('Encryption failed:', error);
                throw new Error('Failed to encrypt data');
            }
        }

        /**
         * Decrypt data with password
         * @param {Object} encryptedData - Encrypted data object
         * @param {string} password - User's password
         * @returns {Promise<Object>} Decrypted data
         */
        async decrypt(encryptedData, password) {
            try {
                // Decode from base64
                const data = this.base64ToArrayBuffer(encryptedData.encrypted);
                const dataArray = new Uint8Array(data);

                // Extract salt, iv, and ciphertext
                const salt = dataArray.slice(0, this.saltLength);
                const iv = dataArray.slice(this.saltLength, this.saltLength + this.ivLength);
                const ciphertext = dataArray.slice(this.saltLength + this.ivLength);

                // Derive key from password
                const key = await this.deriveKey(password, salt);

                // Decrypt the data
                const decrypted = await window.crypto.subtle.decrypt(
                    {
                        name: this.algorithm,
                        iv: iv,
                        tagLength: this.tagLength
                    },
                    key,
                    ciphertext
                );

                // Convert back to object
                const decoder = new TextDecoder();
                const jsonString = decoder.decode(decrypted);
                return JSON.parse(jsonString);
            } catch (error) {
                console.error('Decryption failed:', error);
                throw new Error('Failed to decrypt data - invalid password or corrupted data');
            }
        }

        /**
         * Save encrypted data to localStorage
         * @param {Object} data - Data to save
         * @param {string} password - User's password
         * @returns {Promise<void>}
         */
        async save(data, password) {
            const encryptedData = await this.encrypt(data, password);
            
            // Save encrypted data
            localStorage.setItem(this.storageKey, JSON.stringify(encryptedData));
            
            // Save metadata separately (non-sensitive)
            const metadata = {
                lastSaved: Date.now(),
                version: encryptedData.version,
                hasData: true
            };
            localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
        }

        /**
         * Load and decrypt data from localStorage
         * @param {string} password - User's password
         * @returns {Promise<Object|null>} Decrypted data or null
         */
        async load(password) {
            try {
                const encryptedString = localStorage.getItem(this.storageKey);
                if (!encryptedString) {
                    return null;
                }

                const encryptedData = JSON.parse(encryptedString);
                return await this.decrypt(encryptedData, password);
            } catch (error) {
                console.error('Failed to load encrypted data:', error);
                return null;
            }
        }

        /**
         * Check if encrypted data exists
         * @returns {boolean}
         */
        hasEncryptedData() {
            const metadata = localStorage.getItem(this.metadataKey);
            if (!metadata) return false;
            
            try {
                const meta = JSON.parse(metadata);
                return meta.hasData === true;
            } catch {
                return false;
            }
        }

        /**
         * Clear all encrypted data
         */
        clear() {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.metadataKey);
        }

        /**
         * Change password for encrypted data
         * @param {string} oldPassword - Current password
         * @param {string} newPassword - New password
         * @returns {Promise<boolean>} Success status
         */
        async changePassword(oldPassword, newPassword) {
            try {
                // Load data with old password
                const data = await this.load(oldPassword);
                if (!data) {
                    throw new Error('Failed to decrypt with old password');
                }

                // Re-encrypt with new password
                await this.save(data, newPassword);
                return true;
            } catch (error) {
                console.error('Failed to change password:', error);
                return false;
            }
        }

        /**
         * Export encrypted data for backup
         * @returns {Object|null} Encrypted backup data
         */
        exportBackup() {
            const encryptedData = localStorage.getItem(this.storageKey);
            const metadata = localStorage.getItem(this.metadataKey);
            
            if (!encryptedData) return null;

            return {
                data: encryptedData,
                metadata: metadata,
                exportedAt: Date.now(),
                version: '1.0'
            };
        }

        /**
         * Import encrypted backup
         * @param {Object} backup - Backup data to import
         * @returns {boolean} Success status
         */
        importBackup(backup) {
            try {
                if (!backup.data || !backup.metadata) {
                    throw new Error('Invalid backup format');
                }

                localStorage.setItem(this.storageKey, backup.data);
                localStorage.setItem(this.metadataKey, backup.metadata);
                return true;
            } catch (error) {
                console.error('Failed to import backup:', error);
                return false;
            }
        }

        /**
         * Helper: Convert ArrayBuffer to Base64
         * @param {ArrayBuffer} buffer
         * @returns {string}
         */
        arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }

        /**
         * Helper: Convert Base64 to ArrayBuffer
         * @param {string} base64
         * @returns {ArrayBuffer}
         */
        base64ToArrayBuffer(base64) {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes.buffer;
        }

        /**
         * Generate a secure random password
         * @param {number} length - Password length
         * @returns {string} Random password
         */
        generateSecurePassword(length = 32) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
            const values = window.crypto.getRandomValues(new Uint8Array(length));
            let password = '';
            
            for (let i = 0; i < length; i++) {
                password += charset[values[i] % charset.length];
            }
            
            return password;
        }

        /**
         * Test if Web Crypto API is available
         * @returns {boolean}
         */
        isSupported() {
            return !!(window.crypto && window.crypto.subtle);
        }
    }

    // Export for use in other modules
    window.EncryptedStorage = EncryptedStorage;
})();