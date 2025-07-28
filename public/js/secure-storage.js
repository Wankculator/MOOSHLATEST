/**
 * Secure Storage Utility for MOOSH Wallet
 * Handles encryption and secure storage of sensitive data
 * 100% CLAUDE.md Compliant - NO EMOJIS, ASCII only
 */

class SecureStorage {
    constructor(stateManager = null) {
        this.initialized = false;
        this.encryptionKey = null;
        this.stateManager = stateManager;
    }

    /**
     * Initialize secure storage with user password
     * @param {string} password - User's wallet password
     * @returns {boolean} Success status
     */
    async initialize(password) {
        try {
            if (!password || password.length < 8) {
                ComplianceUtils.log('SecureStorage', 'Password must be at least 8 characters', 'error');
                return false;
            }

            // Derive encryption key from password using PBKDF2
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            
            // Get or create salt
            let salt = this.getSalt();
            if (!salt) {
                salt = crypto.getRandomValues(new Uint8Array(16));
                this.setSalt(salt);
            }

            // Import password as key material
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            // Derive AES key from password
            this.encryptionKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            this.initialized = true;
            ComplianceUtils.log('SecureStorage', 'Initialized successfully', 'info');
            return true;

        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Initialization failed: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Encrypt sensitive data
     * @param {string} data - Data to encrypt
     * @returns {string|null} Encrypted data as base64 or null on error
     */
    async encrypt(data) {
        if (!this.initialized || !this.encryptionKey) {
            ComplianceUtils.log('SecureStorage', 'Not initialized', 'error');
            return null;
        }

        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            
            // Generate random IV for each encryption
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypt the data
            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                dataBuffer
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedData), iv.length);

            // Convert to base64 for storage
            return btoa(String.fromCharCode.apply(null, combined));

        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Encryption failed: ' + error.message, 'error');
            return null;
        }
    }

    /**
     * Decrypt sensitive data
     * @param {string} encryptedData - Base64 encrypted data
     * @returns {string|null} Decrypted data or null on error
     */
    async decrypt(encryptedData) {
        if (!this.initialized || !this.encryptionKey) {
            ComplianceUtils.log('SecureStorage', 'Not initialized', 'error');
            return null;
        }

        try {
            // Convert from base64
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);
            
            // Decrypt
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                data
            );

            // Convert back to string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);

        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Decryption failed: ' + error.message, 'error');
            return null;
        }
    }

    /**
     * Securely store encrypted seed phrase
     * @param {string} mnemonic - Seed phrase to store
     * @param {boolean} isImport - Whether this is an imported wallet
     * @returns {boolean} Success status
     */
    async storeSeed(mnemonic, isImport = false) {
        if (!mnemonic || typeof mnemonic !== 'string') {
            ComplianceUtils.log('SecureStorage', 'Invalid mnemonic provided', 'error');
            return false;
        }

        const encrypted = await this.encrypt(mnemonic);
        if (!encrypted) {
            return false;
        }

        const key = isImport ? 'moosh_encrypted_import' : 'moosh_encrypted_seed';
        try {
            if (this.stateManager) {
                this.stateManager.set(key, encrypted);
            } else {
                localStorage.setItem(key, encrypted);
            }
            ComplianceUtils.log('SecureStorage', 'Seed stored securely', 'info');
            return true;
        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Failed to store: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Retrieve and decrypt seed phrase
     * @param {boolean} isImport - Whether to retrieve imported wallet seed
     * @returns {string|null} Decrypted mnemonic or null
     */
    async retrieveSeed(isImport = false) {
        const key = isImport ? 'moosh_encrypted_import' : 'moosh_encrypted_seed';
        const encrypted = this.stateManager ? this.stateManager.get(key) : localStorage.getItem(key);
        
        if (!encrypted) {
            ComplianceUtils.log('SecureStorage', 'No encrypted seed found', 'warn');
            return null;
        }

        return await this.decrypt(encrypted);
    }

    /**
     * Clear all sensitive data
     */
    clearAll() {
        this.encryptionKey = null;
        this.initialized = false;
        
        // Clear encrypted seeds
        if (this.stateManager) {
            this.stateManager.remove('moosh_encrypted_seed');
            this.stateManager.remove('moosh_encrypted_import');
            
            // Clear old unencrypted seeds (migration)
            this.stateManager.remove('generatedSeed');
            this.stateManager.remove('importedSeed');
        } else {
            localStorage.removeItem('moosh_encrypted_seed');
            localStorage.removeItem('moosh_encrypted_import');
            
            // Clear old unencrypted seeds (migration)
            localStorage.removeItem('generatedSeed');
            localStorage.removeItem('importedSeed');
        }
        
        ComplianceUtils.log('SecureStorage', 'All sensitive data cleared', 'info');
    }

    /**
     * Get or create persistent salt for key derivation
     * @returns {Uint8Array} Salt bytes
     */
    getSalt() {
        const stored = this.stateManager ? this.stateManager.get('moosh_salt') : localStorage.getItem('moosh_salt');
        if (stored) {
            return Uint8Array.from(atob(stored), c => c.charCodeAt(0));
        }
        return null;
    }

    /**
     * Store salt for key derivation
     * @param {Uint8Array} salt - Salt bytes
     */
    setSalt(salt) {
        if (this.stateManager) {
            this.stateManager.set('moosh_salt', btoa(String.fromCharCode.apply(null, salt)));
        } else {
            localStorage.setItem('moosh_salt', btoa(String.fromCharCode.apply(null, salt)));
        }
    }

    /**
     * Check if secure storage is initialized
     * @returns {boolean} Initialization status
     */
    isInitialized() {
        return this.initialized && this.encryptionKey !== null;
    }

    /**
     * Verify password by attempting to decrypt a test value
     * @param {string} password - Password to verify
     * @returns {boolean} True if password is correct
     */
    async verifyPassword(password) {
        const testKey = 'moosh_password_check';
        const testValue = 'MOOSH_WALLET_CHECK';
        
        // First time - store encrypted test value
        const stored = this.stateManager ? this.stateManager.get(testKey) : localStorage.getItem(testKey);
        if (!stored) {
            await this.initialize(password);
            const encrypted = await this.encrypt(testValue);
            if (encrypted) {
                if (this.stateManager) {
                    this.stateManager.set(testKey, encrypted);
                } else {
                    localStorage.setItem(testKey, encrypted);
                }
                return true;
            }
            return false;
        }
        
        // Verify by decrypting test value
        await this.initialize(password);
        const decrypted = await this.decrypt(stored);
        return decrypted === testValue;
    }
}

// Export for use in main wallet
window.SecureStorage = SecureStorage;