/**
 * Military-Grade Encryption Service
 * Part of OPERATION THUNDERSTRIKE - CHARLIE Division
 * Implements AES-256-GCM with PBKDF2 key derivation
 * 
 * SECURITY SPECIFICATIONS:
 * - Key Derivation: PBKDF2-SHA512 (100,000 iterations minimum)
 * - Encryption: AES-256-GCM with authentication
 * - Random: crypto.getRandomValues() only
 * - FIPS 140-2 compliance target
 */

import crypto from 'crypto';
import { promisify } from 'util';

// Promisify crypto functions for async/await
const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);
const scrypt = promisify(crypto.scrypt);

export class EncryptionService {
    constructor() {
        // Security parameters (military-grade)
        this.PBKDF2_ITERATIONS = 100000; // 100k iterations minimum
        this.PBKDF2_HASH = 'sha512';
        this.SALT_LENGTH = 32; // 256 bits
        this.IV_LENGTH = 16; // 128 bits for AES
        this.TAG_LENGTH = 16; // 128 bits
        this.KEY_LENGTH = 32; // 256 bits for AES-256
        
        // Scrypt parameters (alternative KDF)
        this.SCRYPT_N = 16384; // CPU/memory cost (2^14)
        this.SCRYPT_R = 8;     // Block size
        this.SCRYPT_P = 1;     // Parallelization factor
        
        // Algorithm configurations
        this.CIPHER_ALGORITHM = 'aes-256-gcm';
        this.MIN_PASSWORD_LENGTH = 12;
        
        // Version for future compatibility
        this.ENCRYPTION_VERSION = '2.0';
    }

    /**
     * Encrypt wallet data with military-grade security
     * @param {Object|string} data - Data to encrypt
     * @param {string} password - Encryption password
     * @param {Object} options - Additional options
     * @returns {Object} Encrypted bundle with metadata
     */
    async encryptWalletData(data, password, options = {}) {
        try {
            // Validate inputs
            this.validatePassword(password);
            
            // Convert data to string if object
            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            
            // Generate cryptographically secure random values
            const salt = await randomBytes(this.SALT_LENGTH);
            const iv = await randomBytes(this.IV_LENGTH);
            
            // Derive encryption key using PBKDF2 or Scrypt
            const key = options.useScrypt 
                ? await this.deriveKeyScrypt(password, salt)
                : await this.deriveKeyPBKDF2(password, salt);
            
            // Add additional authenticated data (AAD) for extra security
            const aad = Buffer.from(JSON.stringify({
                version: this.ENCRYPTION_VERSION,
                timestamp: new Date().toISOString(),
                algorithm: this.CIPHER_ALGORITHM
            }));
            
            // Create cipher with authenticated encryption
            const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, key, iv);
            cipher.setAAD(aad);
            
            // Encrypt data
            const encrypted = Buffer.concat([
                cipher.update(dataString, 'utf8'),
                cipher.final()
            ]);
            
            // Get authentication tag
            const authTag = cipher.getAuthTag();
            
            // Create secure bundle with all necessary data
            const bundle = {
                version: this.ENCRYPTION_VERSION,
                algorithm: this.CIPHER_ALGORITHM,
                keyDerivation: {
                    method: options.useScrypt ? 'scrypt' : 'pbkdf2',
                    salt: salt.toString('base64'),
                    iterations: options.useScrypt ? undefined : this.PBKDF2_ITERATIONS,
                    hash: options.useScrypt ? undefined : this.PBKDF2_HASH,
                    scryptParams: options.useScrypt ? {
                        N: this.SCRYPT_N,
                        r: this.SCRYPT_R,
                        p: this.SCRYPT_P
                    } : undefined
                },
                encryption: {
                    iv: iv.toString('base64'),
                    authTag: authTag.toString('base64'),
                    data: encrypted.toString('base64'),
                    aad: aad.toString('base64')
                },
                metadata: {
                    encrypted: true,
                    timestamp: new Date().toISOString(),
                    checksum: this.calculateChecksum(encrypted)
                }
            };
            
            // Clear sensitive data from memory
            this.secureMemoryClear(key);
            
            return bundle;
            
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt wallet data securely');
        }
    }

    /**
     * Decrypt wallet data with verification
     * @param {Object} encryptedBundle - Encrypted data bundle
     * @param {string} password - Decryption password
     * @returns {string} Decrypted data
     */
    async decryptWalletData(encryptedBundle, password) {
        try {
            // Validate bundle structure
            this.validateEncryptedBundle(encryptedBundle);
            
            // Validate password
            this.validatePassword(password);
            
            // Extract parameters
            const salt = Buffer.from(encryptedBundle.keyDerivation.salt, 'base64');
            const iv = Buffer.from(encryptedBundle.encryption.iv, 'base64');
            const authTag = Buffer.from(encryptedBundle.encryption.authTag, 'base64');
            const encryptedData = Buffer.from(encryptedBundle.encryption.data, 'base64');
            const aad = Buffer.from(encryptedBundle.encryption.aad, 'base64');
            
            // Derive key using same method as encryption
            const key = encryptedBundle.keyDerivation.method === 'scrypt'
                ? await this.deriveKeyScrypt(password, salt, encryptedBundle.keyDerivation.scryptParams)
                : await this.deriveKeyPBKDF2(password, salt, encryptedBundle.keyDerivation);
            
            // Create decipher
            const decipher = crypto.createDecipheriv(encryptedBundle.algorithm, key, iv);
            decipher.setAuthTag(authTag);
            decipher.setAAD(aad);
            
            // Decrypt and verify
            const decrypted = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final()
            ]);
            
            // Verify checksum
            const expectedChecksum = encryptedBundle.metadata.checksum;
            const actualChecksum = this.calculateChecksum(encryptedData);
            if (expectedChecksum !== actualChecksum) {
                throw new Error('Data integrity check failed');
            }
            
            // Clear sensitive data
            this.secureMemoryClear(key);
            
            return decrypted.toString('utf8');
            
        } catch (error) {
            console.error('Decryption error:', error);
            // Don't leak specific crypto errors for security
            throw new Error('Failed to decrypt wallet data. Please check your password.');
        }
    }

    /**
     * Derive key using PBKDF2
     * @private
     */
    async deriveKeyPBKDF2(password, salt, params = {}) {
        const iterations = params.iterations || this.PBKDF2_ITERATIONS;
        const hash = params.hash || this.PBKDF2_HASH;
        
        return await pbkdf2(
            password,
            salt,
            iterations,
            this.KEY_LENGTH,
            hash
        );
    }

    /**
     * Derive key using Scrypt (more secure, memory-hard)
     * @private
     */
    async deriveKeyScrypt(password, salt, params = {}) {
        const N = params?.N || this.SCRYPT_N;
        const r = params?.r || this.SCRYPT_R;
        const p = params?.p || this.SCRYPT_P;
        
        // Scrypt options
        const options = {
            N: N,
            r: r,
            p: p,
            maxmem: 128 * N * r * 2 // Maximum memory usage
        };
        
        return await scrypt(password, salt, this.KEY_LENGTH, options);
    }

    /**
     * Generate secure random password
     * @param {number} length - Password length
     * @returns {string} Secure random password
     */
    async generateSecurePassword(length = 24) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        const randomValues = await randomBytes(length);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        
        return password;
    }

    /**
     * Validate password strength
     * @private
     */
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Invalid password');
        }
        
        if (password.length < this.MIN_PASSWORD_LENGTH) {
            throw new Error(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters`);
        }
        
        // Check for common weak patterns
        const weakPatterns = [
            /^(.)\1+$/,  // All same character
            /^123456/,   // Sequential numbers
            /^password/i, // Common passwords
            /^qwerty/i
        ];
        
        for (const pattern of weakPatterns) {
            if (pattern.test(password)) {
                throw new Error('Password is too weak. Please use a stronger password.');
            }
        }
    }

    /**
     * Validate encrypted bundle structure
     * @private
     */
    validateEncryptedBundle(bundle) {
        if (!bundle || typeof bundle !== 'object') {
            throw new Error('Invalid encrypted bundle');
        }
        
        // Check version compatibility
        const majorVersion = parseInt(bundle.version?.split('.')[0] || '0');
        const currentMajor = parseInt(this.ENCRYPTION_VERSION.split('.')[0]);
        if (majorVersion > currentMajor) {
            throw new Error('Encrypted data version not supported');
        }
        
        // Validate required fields
        const required = ['algorithm', 'keyDerivation', 'encryption', 'metadata'];
        for (const field of required) {
            if (!bundle[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate encryption parameters
        if (!bundle.encryption.iv || !bundle.encryption.authTag || !bundle.encryption.data) {
            throw new Error('Missing encryption parameters');
        }
        
        // Validate key derivation parameters
        if (!bundle.keyDerivation.salt || !bundle.keyDerivation.method) {
            throw new Error('Missing key derivation parameters');
        }
    }

    /**
     * Calculate SHA-256 checksum
     * @private
     */
    calculateChecksum(data) {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }

    /**
     * Securely clear memory (best effort)
     * @private
     */
    secureMemoryClear(buffer) {
        if (Buffer.isBuffer(buffer)) {
            buffer.fill(0);
        }
    }

    /**
     * Encrypt file with streaming (for large files)
     * @param {ReadStream} inputStream - Input file stream
     * @param {WriteStream} outputStream - Output file stream
     * @param {string} password - Encryption password
     * @returns {Promise<Object>} Encryption metadata
     */
    async encryptFileStream(inputStream, outputStream, password) {
        // Generate encryption parameters
        const salt = await randomBytes(this.SALT_LENGTH);
        const iv = await randomBytes(this.IV_LENGTH);
        const key = await this.deriveKeyPBKDF2(password, salt);
        
        // Create cipher stream
        const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, key, iv);
        
        // Write header with encryption metadata
        const header = {
            version: this.ENCRYPTION_VERSION,
            salt: salt.toString('base64'),
            iv: iv.toString('base64')
        };
        outputStream.write(JSON.stringify(header) + '\n');
        
        // Pipe streams
        return new Promise((resolve, reject) => {
            inputStream
                .pipe(cipher)
                .pipe(outputStream)
                .on('finish', () => {
                    const authTag = cipher.getAuthTag();
                    resolve({
                        authTag: authTag.toString('base64'),
                        bytesProcessed: cipher.bytesWritten
                    });
                })
                .on('error', reject);
        });
    }

    /**
     * Generate cryptographically secure nonce
     * @param {number} length - Nonce length in bytes
     * @returns {Promise<Buffer>} Random nonce
     */
    async generateNonce(length = 16) {
        return await randomBytes(length);
    }

    /**
     * Constant-time comparison to prevent timing attacks
     * @param {Buffer} a - First buffer
     * @param {Buffer} b - Second buffer
     * @returns {boolean} True if equal
     */
    constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return crypto.timingSafeEqual(a, b);
    }
}

// Export singleton instance
export const encryptionService = new EncryptionService();