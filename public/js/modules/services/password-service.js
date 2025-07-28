/**
 * Secure Password Service
 * Implements PBKDF2 for password hashing with proper salt generation
 * 
 * Since bcrypt is not available in browsers, we use PBKDF2 which is
 * available via the Web Crypto API and provides similar security.
 */

(function() {
    'use strict';

    class PasswordService {
        constructor() {
            // PBKDF2 parameters (OWASP recommended)
            this.iterations = 100000; // 100k iterations
            this.keyLength = 256; // 256 bits
            this.saltLength = 16; // 128 bits
            this.algorithm = 'SHA-256';
        }

        /**
         * Generate a random salt
         * @returns {Uint8Array} Random salt
         */
        generateSalt() {
            return window.crypto.getRandomValues(new Uint8Array(this.saltLength));
        }

        /**
         * Convert array buffer to hex string
         * @param {ArrayBuffer} buffer
         * @returns {string} Hex string
         */
        bufferToHex(buffer) {
            return Array.from(new Uint8Array(buffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        /**
         * Convert hex string to array buffer
         * @param {string} hex
         * @returns {Uint8Array}
         */
        hexToBuffer(hex) {
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < bytes.length; i++) {
                bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
            }
            return bytes;
        }

        /**
         * Hash a password using PBKDF2
         * @param {string} password - Plain text password
         * @param {Uint8Array} salt - Salt (optional, will generate if not provided)
         * @returns {Promise<{hash: string, salt: string}>} Hash and salt as hex strings
         */
        async hashPassword(password, salt = null) {
            try {
                // Generate salt if not provided
                if (!salt) {
                    salt = this.generateSalt();
                }

                // Convert password to ArrayBuffer
                const encoder = new TextEncoder();
                const passwordBuffer = encoder.encode(password);

                // Import password as CryptoKey
                const passwordKey = await window.crypto.subtle.importKey(
                    'raw',
                    passwordBuffer,
                    'PBKDF2',
                    false,
                    ['deriveBits']
                );

                // Derive key using PBKDF2
                const derivedBits = await window.crypto.subtle.deriveBits(
                    {
                        name: 'PBKDF2',
                        salt: salt,
                        iterations: this.iterations,
                        hash: this.algorithm
                    },
                    passwordKey,
                    this.keyLength
                );

                // Convert to hex strings
                return {
                    hash: this.bufferToHex(derivedBits),
                    salt: this.bufferToHex(salt)
                };
            } catch (error) {
                console.error('Password hashing error:', error);
                throw new Error('Failed to hash password');
            }
        }

        /**
         * Verify a password against a hash
         * @param {string} password - Plain text password to verify
         * @param {string} hash - Stored hash (hex string)
         * @param {string} salt - Stored salt (hex string)
         * @returns {Promise<boolean>} True if password matches
         */
        async verifyPassword(password, hash, salt) {
            try {
                // Convert salt from hex to buffer
                const saltBuffer = this.hexToBuffer(salt);

                // Hash the provided password with the same salt
                const result = await this.hashPassword(password, saltBuffer);

                // Compare hashes (constant-time comparison)
                return this.secureCompare(result.hash, hash);
            } catch (error) {
                console.error('Password verification error:', error);
                return false;
            }
        }

        /**
         * Constant-time string comparison to prevent timing attacks
         * @param {string} a
         * @param {string} b
         * @returns {boolean}
         */
        secureCompare(a, b) {
            if (a.length !== b.length) {
                return false;
            }

            let result = 0;
            for (let i = 0; i < a.length; i++) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i);
            }

            return result === 0;
        }

        /**
         * Generate a secure random password
         * @param {number} length - Password length (default: 16)
         * @returns {string} Random password
         */
        generateSecurePassword(length = 16) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
            const values = new Uint8Array(length);
            window.crypto.getRandomValues(values);
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charset[values[i] % charset.length];
            }
            
            return password;
        }

        /**
         * Check password strength
         * @param {string} password
         * @returns {Object} Strength assessment
         */
        checkPasswordStrength(password) {
            const assessment = {
                score: 0,
                feedback: [],
                isStrong: false
            };

            // Length check
            if (password.length >= 12) {
                assessment.score += 2;
            } else if (password.length >= 8) {
                assessment.score += 1;
                assessment.feedback.push('Use at least 12 characters');
            } else {
                assessment.feedback.push('Password too short (minimum 8 characters)');
            }

            // Character variety checks
            if (/[a-z]/.test(password)) assessment.score += 1;
            if (/[A-Z]/.test(password)) assessment.score += 1;
            if (/[0-9]/.test(password)) assessment.score += 1;
            if (/[^a-zA-Z0-9]/.test(password)) assessment.score += 1;

            // Common patterns check
            if (/(.)\1{2,}/.test(password)) {
                assessment.score -= 1;
                assessment.feedback.push('Avoid repeated characters');
            }

            if (/^[0-9]+$/.test(password)) {
                assessment.score -= 2;
                assessment.feedback.push('Don\'t use only numbers');
            }

            // Set strength level
            if (assessment.score >= 5) {
                assessment.strength = 'Strong';
                assessment.isStrong = true;
            } else if (assessment.score >= 3) {
                assessment.strength = 'Medium';
                assessment.feedback.push('Add more character variety');
            } else {
                assessment.strength = 'Weak';
                assessment.feedback.push('Use a mix of uppercase, lowercase, numbers, and symbols');
            }

            return assessment;
        }

        /**
         * Migrate from old weak hash to new secure hash
         * @param {string} password - Plain text password
         * @param {string} oldHash - Old weak hash
         * @returns {Promise<{hash: string, salt: string}>} New secure hash
         */
        async migratePassword(password, oldHash) {
            // Verify against old hash first (using the weak function)
            const oldHashComputed = this.weakHash(password);
            
            if (oldHashComputed !== oldHash) {
                throw new Error('Invalid password');
            }

            // Generate new secure hash
            return await this.hashPassword(password);
        }

        /**
         * Legacy weak hash function (for migration only)
         * DO NOT USE FOR NEW PASSWORDS
         */
        weakHash(str) {
            let hash = 0;
            if (!str || str.length === 0) return hash.toString();
            
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            
            return Math.abs(hash).toString();
        }
    }

    // Export for use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PasswordService;
    } else {
        window.PasswordService = PasswordService;
    }
})();