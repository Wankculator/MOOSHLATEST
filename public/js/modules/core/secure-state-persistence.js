/**
 * Secure State Persistence Module
 * Integrates encrypted storage with StateManager for secure data persistence
 * Handles sensitive wallet data with client-side encryption
 */

(function() {
    'use strict';

    class SecureStatePersistence {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.encryptedStorage = new window.EncryptedStorage();
            this.sessionKey = null;
            this.autoSaveInterval = null;
            this.autoSaveDelay = 30000; // 30 seconds
            this.lastSaveTime = 0;
            
            // Keys that should NEVER be persisted
            this.blacklistedKeys = new Set([
                'privateKeys',
                'seedPhrase',
                'mnemonic',
                'password',
                'sessionKey',
                'tempData'
            ]);
            
            // Keys that should be encrypted
            this.encryptedKeys = new Set([
                'accounts',
                'transactions',
                'contacts',
                'settings',
                'labels',
                'notes'
            ]);
            
            // Keys that can be stored in plain text
            this.publicKeys = new Set([
                'currentPage',
                'theme',
                'language',
                'currency',
                'lastSync',
                'version'
            ]);
        }

        /**
         * Initialize secure persistence with user password
         * @param {string} password - User's password
         * @returns {Promise<boolean>} Success status
         */
        async initialize(password) {
            try {
                if (!this.encryptedStorage.isSupported()) {
                    console.warn('Web Crypto API not supported - encryption disabled');
                    return false;
                }

                // Generate session key from password
                this.sessionKey = await this.deriveSessionKey(password);
                
                // Try to load existing encrypted state
                const existingState = await this.loadSecureState(password);
                if (existingState) {
                    // Merge with current state
                    this.mergeState(existingState);
                }
                
                // Start auto-save
                this.startAutoSave();
                
                return true;
            } catch (error) {
                console.error('Failed to initialize secure persistence:', error);
                return false;
            }
        }

        /**
         * Derive a session key from password
         * @param {string} password
         * @returns {Promise<string>} Session key
         */
        async deriveSessionKey(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + 'moosh-wallet-session');
            const hash = await window.crypto.subtle.digest('SHA-256', data);
            return this.encryptedStorage.arrayBufferToBase64(hash);
        }

        /**
         * Save current state securely
         * @param {string} password - Optional password (uses session key if not provided)
         * @returns {Promise<boolean>} Success status
         */
        async saveSecureState(password = null) {
            try {
                const pwd = password || this.sessionKey;
                if (!pwd) {
                    throw new Error('No password or session key available');
                }

                // Get current state
                const currentState = this.stateManager.getState();
                
                // Separate data by security level
                const dataToEncrypt = {};
                const publicData = {};
                
                for (const [key, value] of Object.entries(currentState)) {
                    if (this.blacklistedKeys.has(key)) {
                        // Skip blacklisted keys
                        continue;
                    } else if (this.encryptedKeys.has(key)) {
                        // Encrypt sensitive data
                        dataToEncrypt[key] = value;
                    } else if (this.publicKeys.has(key)) {
                        // Store public data separately
                        publicData[key] = value;
                    }
                }
                
                // Save encrypted data
                if (Object.keys(dataToEncrypt).length > 0) {
                    await this.encryptedStorage.save(dataToEncrypt, pwd);
                }
                
                // Save public data (unencrypted)
                localStorage.setItem('moosh_public_state', JSON.stringify({
                    data: publicData,
                    lastSaved: Date.now(),
                    version: '1.0'
                }));
                
                this.lastSaveTime = Date.now();
                return true;
            } catch (error) {
                console.error('Failed to save secure state:', error);
                return false;
            }
        }

        /**
         * Load secure state
         * @param {string} password - Optional password (uses session key if not provided)
         * @returns {Promise<Object|null>} Decrypted state or null
         */
        async loadSecureState(password = null) {
            try {
                const pwd = password || this.sessionKey;
                if (!pwd) {
                    throw new Error('No password or session key available');
                }

                // Load encrypted data
                const encryptedData = await this.encryptedStorage.load(pwd);
                
                // Load public data
                const publicDataString = localStorage.getItem('moosh_public_state');
                const publicData = publicDataString ? JSON.parse(publicDataString).data : {};
                
                // Merge all data
                return {
                    ...publicData,
                    ...encryptedData
                };
            } catch (error) {
                console.error('Failed to load secure state:', error);
                return null;
            }
        }

        /**
         * Merge loaded state with current state
         * @param {Object} loadedState
         */
        mergeState(loadedState) {
            // Only merge non-blacklisted keys
            for (const [key, value] of Object.entries(loadedState)) {
                if (!this.blacklistedKeys.has(key)) {
                    this.stateManager.set(key, value);
                }
            }
        }

        /**
         * Start auto-save timer
         */
        startAutoSave() {
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
            }
            
            this.autoSaveInterval = setInterval(() => {
                this.autoSave();
            }, this.autoSaveDelay);
        }

        /**
         * Stop auto-save timer
         */
        stopAutoSave() {
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
            }
        }

        /**
         * Auto-save if state has changed
         */
        async autoSave() {
            // Check if enough time has passed
            if (Date.now() - this.lastSaveTime < 10000) { // Min 10 seconds between saves
                return;
            }
            
            await this.saveSecureState();
        }

        /**
         * Change master password
         * @param {string} oldPassword
         * @param {string} newPassword
         * @returns {Promise<boolean>} Success status
         */
        async changePassword(oldPassword, newPassword) {
            try {
                // Load data with old password
                const state = await this.loadSecureState(oldPassword);
                if (!state) {
                    throw new Error('Invalid old password');
                }
                
                // Update session key
                this.sessionKey = await this.deriveSessionKey(newPassword);
                
                // Re-save with new password
                await this.saveSecureState(newPassword);
                
                return true;
            } catch (error) {
                console.error('Failed to change password:', error);
                return false;
            }
        }

        /**
         * Create secure backup
         * @returns {Object} Backup data
         */
        createBackup() {
            const encryptedBackup = this.encryptedStorage.exportBackup();
            const publicDataString = localStorage.getItem('moosh_public_state');
            
            return {
                encrypted: encryptedBackup,
                public: publicDataString ? JSON.parse(publicDataString) : null,
                createdAt: Date.now(),
                version: '1.0',
                walletVersion: this.stateManager.get('version') || '2.0.0'
            };
        }

        /**
         * Restore from backup
         * @param {Object} backup
         * @param {string} password
         * @returns {Promise<boolean>} Success status
         */
        async restoreBackup(backup, password) {
            try {
                // Validate backup format
                if (!backup.encrypted || !backup.version) {
                    throw new Error('Invalid backup format');
                }
                
                // Import encrypted data
                const imported = this.encryptedStorage.importBackup(backup.encrypted);
                if (!imported) {
                    throw new Error('Failed to import encrypted data');
                }
                
                // Import public data
                if (backup.public) {
                    localStorage.setItem('moosh_public_state', JSON.stringify(backup.public));
                }
                
                // Load and merge state
                const restoredState = await this.loadSecureState(password);
                if (restoredState) {
                    this.mergeState(restoredState);
                    return true;
                }
                
                return false;
            } catch (error) {
                console.error('Failed to restore backup:', error);
                return false;
            }
        }

        /**
         * Clear all persisted data
         */
        clearAll() {
            this.stopAutoSave();
            this.encryptedStorage.clear();
            localStorage.removeItem('moosh_public_state');
            this.sessionKey = null;
            this.lastSaveTime = 0;
        }

        /**
         * Lock the wallet (clear session key)
         */
        lock() {
            this.stopAutoSave();
            this.sessionKey = null;
        }

        /**
         * Unlock the wallet
         * @param {string} password
         * @returns {Promise<boolean>} Success status
         */
        async unlock(password) {
            try {
                // Test if password is correct by loading data
                const state = await this.loadSecureState(password);
                if (!state && this.encryptedStorage.hasEncryptedData()) {
                    // Wrong password
                    return false;
                }
                
                // Set session key
                this.sessionKey = await this.deriveSessionKey(password);
                
                // Start auto-save
                this.startAutoSave();
                
                return true;
            } catch (error) {
                console.error('Failed to unlock wallet:', error);
                return false;
            }
        }

        /**
         * Check if wallet is locked
         * @returns {boolean}
         */
        isLocked() {
            return !this.sessionKey;
        }

        /**
         * Get last save timestamp
         * @returns {number}
         */
        getLastSaveTime() {
            return this.lastSaveTime;
        }

        /**
         * Add a key to the encryption list
         * @param {string} key
         */
        addEncryptedKey(key) {
            this.encryptedKeys.add(key);
        }

        /**
         * Add a key to the blacklist
         * @param {string} key
         */
        addBlacklistedKey(key) {
            this.blacklistedKeys.add(key);
        }
    }

    // Export for use in other modules
    window.SecureStatePersistence = SecureStatePersistence;
})();