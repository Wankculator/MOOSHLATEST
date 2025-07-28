/**
 * Security Validator Service
 * Part of OPERATION THUNDERSTRIKE - CHARLIE Division
 * Implements comprehensive security validation and threat detection
 */

import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

export class SecurityValidator {
    constructor() {
        // Password policies
        this.PASSWORD_MIN_LENGTH = 12;
        this.PASSWORD_MAX_LENGTH = 256;
        this.PASSWORD_REQUIRE_UPPERCASE = true;
        this.PASSWORD_REQUIRE_LOWERCASE = true;
        this.PASSWORD_REQUIRE_NUMBERS = true;
        this.PASSWORD_REQUIRE_SPECIAL = true;
        
        // Rate limiting configuration
        this.RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
        this.MAX_ATTEMPTS_PER_WINDOW = 5;
        this.LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
        
        // File upload security
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.ALLOWED_MIME_TYPES = ['application/json', 'text/plain'];
        this.MAGIC_NUMBERS = {
            'json': [0x7B], // { character
            'text': [0x20, 0x09, 0x0A, 0x0D] // whitespace characters
        };
        
        // Initialize rate limiting store
        this.rateLimitStore = new Map();
        this.lockedOutIPs = new Map();
        
        // Common malware signatures (simplified)
        this.malwareSignatures = [
            /eval\s*\(/gi,
            /Function\s*\(/gi,
            /<script[^>]*>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi, // Event handlers
            /vbscript:/gi,
            /data:text\/html/gi
        ];
        
        // SQL injection patterns
        this.sqlInjectionPatterns = [
            /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
            /('|(\')|"|(\")|(--)|(\#)|(\*)|(;)|(\\))/g,
            /(=|%3D)([^=]*)(OR|AND)(\s|%20)/gi
        ];
        
        // XSS patterns
        this.xssPatterns = [
            /<[^>]+>/g,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /&lt;script/gi,
            /&#x3C;script/gi,
            /%3Cscript/gi
        ];
    }

    /**
     * Validate password strength with comprehensive checks
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with score and feedback
     */
    validatePasswordStrength(password) {
        const result = {
            valid: false,
            score: 0,
            feedback: [],
            strength: 'weak'
        };
        
        // Basic validation
        if (!password || typeof password !== 'string') {
            result.feedback.push('Password is required');
            return result;
        }
        
        // Length check
        if (password.length < this.PASSWORD_MIN_LENGTH) {
            result.feedback.push(`Password must be at least ${this.PASSWORD_MIN_LENGTH} characters`);
        } else if (password.length > this.PASSWORD_MAX_LENGTH) {
            result.feedback.push(`Password must not exceed ${this.PASSWORD_MAX_LENGTH} characters`);
        } else {
            result.score += 20;
        }
        
        // Complexity checks
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        
        if (this.PASSWORD_REQUIRE_UPPERCASE && !hasUppercase) {
            result.feedback.push('Password must contain uppercase letters');
        } else if (hasUppercase) {
            result.score += 20;
        }
        
        if (this.PASSWORD_REQUIRE_LOWERCASE && !hasLowercase) {
            result.feedback.push('Password must contain lowercase letters');
        } else if (hasLowercase) {
            result.score += 20;
        }
        
        if (this.PASSWORD_REQUIRE_NUMBERS && !hasNumbers) {
            result.feedback.push('Password must contain numbers');
        } else if (hasNumbers) {
            result.score += 20;
        }
        
        if (this.PASSWORD_REQUIRE_SPECIAL && !hasSpecial) {
            result.feedback.push('Password must contain special characters');
        } else if (hasSpecial) {
            result.score += 20;
        }
        
        // Check for common passwords
        const commonPasswords = [
            'password123', 'admin123', 'bitcoin123', 'wallet123',
            'mooshwallet', 'thunderstrike', 'qwerty123', 'abc123'
        ];
        
        if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
            result.score -= 40;
            result.feedback.push('Password contains common patterns');
        }
        
        // Check for repeated characters
        if (/(.)\1{2,}/.test(password)) {
            result.score -= 10;
            result.feedback.push('Avoid repeated characters');
        }
        
        // Check for sequential characters
        if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
            result.score -= 10;
            result.feedback.push('Avoid sequential characters');
        }
        
        // Calculate strength
        if (result.score >= 80 && result.feedback.length === 0) {
            result.strength = 'strong';
            result.valid = true;
        } else if (result.score >= 60) {
            result.strength = 'medium';
            result.valid = result.feedback.length === 0;
        } else {
            result.strength = 'weak';
        }
        
        // Entropy calculation
        const charset = 
            (hasUppercase ? 26 : 0) +
            (hasLowercase ? 26 : 0) +
            (hasNumbers ? 10 : 0) +
            (hasSpecial ? 32 : 0);
        
        const entropy = password.length * Math.log2(charset);
        result.entropy = Math.round(entropy);
        
        // Time to crack estimation (simplified)
        const guessesPerSecond = 1e12; // 1 trillion guesses/second
        const possibleCombinations = Math.pow(charset, password.length);
        const secondsToCrack = possibleCombinations / guessesPerSecond / 2; // Average case
        
        if (secondsToCrack < 60) {
            result.timeToCrack = 'Instant';
        } else if (secondsToCrack < 3600) {
            result.timeToCrack = `${Math.round(secondsToCrack / 60)} minutes`;
        } else if (secondsToCrack < 86400) {
            result.timeToCrack = `${Math.round(secondsToCrack / 3600)} hours`;
        } else if (secondsToCrack < 31536000) {
            result.timeToCrack = `${Math.round(secondsToCrack / 86400)} days`;
        } else {
            result.timeToCrack = `${Math.round(secondsToCrack / 31536000)} years`;
        }
        
        return result;
    }

    /**
     * Validate import file for security threats
     * @param {Buffer|string} fileData - File data to validate
     * @param {Object} metadata - File metadata
     * @returns {Object} Validation result
     */
    async validateImportFile(fileData, metadata = {}) {
        const result = {
            valid: false,
            threats: [],
            warnings: []
        };
        
        try {
            // Size validation
            const size = Buffer.isBuffer(fileData) ? fileData.length : Buffer.byteLength(fileData);
            if (size > this.MAX_FILE_SIZE) {
                result.threats.push(`File too large: ${size} bytes (max: ${this.MAX_FILE_SIZE})`);
                return result;
            }
            
            // Convert to string for analysis
            const content = Buffer.isBuffer(fileData) ? fileData.toString('utf8') : fileData;
            
            // Check for malware signatures
            for (const signature of this.malwareSignatures) {
                if (signature.test(content)) {
                    result.threats.push(`Potential malware detected: ${signature.source}`);
                }
            }
            
            // Check for SQL injection attempts
            for (const pattern of this.sqlInjectionPatterns) {
                if (pattern.test(content)) {
                    result.threats.push('Potential SQL injection attempt detected');
                    break;
                }
            }
            
            // Check for XSS attempts
            for (const pattern of this.xssPatterns) {
                if (pattern.test(content)) {
                    result.threats.push('Potential XSS attempt detected');
                    break;
                }
            }
            
            // Validate JSON structure if expected
            if (metadata.expectedFormat === 'json' || content.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(content);
                    
                    // Deep scan for suspicious keys
                    this.deepScanObject(parsed, result);
                    
                } catch (error) {
                    result.warnings.push('Invalid JSON structure');
                }
            }
            
            // Check for binary content in text file
            const binaryPattern = /[\x00-\x08\x0E-\x1F\x80-\xFF]/;
            if (binaryPattern.test(content)) {
                result.warnings.push('Binary content detected in text file');
            }
            
            // If no threats found, mark as valid
            result.valid = result.threats.length === 0;
            
        } catch (error) {
            result.threats.push(`Validation error: ${error.message}`);
        }
        
        return result;
    }

    /**
     * Deep scan object for suspicious patterns
     * @private
     */
    deepScanObject(obj, result, depth = 0) {
        if (depth > 10) {
            result.warnings.push('Object depth exceeds safe limit');
            return;
        }
        
        for (const [key, value] of Object.entries(obj)) {
            // Check for suspicious keys
            if (/__proto__|constructor|prototype/.test(key)) {
                result.threats.push(`Potential prototype pollution: ${key}`);
            }
            
            // Check string values
            if (typeof value === 'string') {
                // Check for encoded payloads
                if (value.length > 1000 && /^[A-Za-z0-9+/]+=*$/.test(value)) {
                    result.warnings.push('Large base64 encoded content detected');
                }
                
                // Check for script tags
                if (/<script|javascript:|eval\(|Function\(/.test(value)) {
                    result.threats.push('Script content detected in data');
                }
            }
            
            // Recurse into nested objects
            if (typeof value === 'object' && value !== null) {
                this.deepScanObject(value, result, depth + 1);
            }
        }
    }

    /**
     * Implement rate limiting for security endpoints
     * @param {string} identifier - IP address or user ID
     * @param {string} action - Action being rate limited
     * @returns {Object} Rate limit result
     */
    checkRateLimit(identifier, action = 'default') {
        const now = Date.now();
        const key = `${identifier}:${action}`;
        
        // Check if IP is locked out
        const lockoutEnd = this.lockedOutIPs.get(key);
        if (lockoutEnd && lockoutEnd > now) {
            return {
                allowed: false,
                retryAfter: Math.ceil((lockoutEnd - now) / 1000),
                reason: 'Account locked due to too many attempts'
            };
        }
        
        // Get or create rate limit entry
        let entry = this.rateLimitStore.get(key);
        if (!entry) {
            entry = {
                attempts: [],
                windowStart: now
            };
            this.rateLimitStore.set(key, entry);
        }
        
        // Clean old attempts
        entry.attempts = entry.attempts.filter(
            timestamp => timestamp > now - this.RATE_LIMIT_WINDOW
        );
        
        // Check if limit exceeded
        if (entry.attempts.length >= this.MAX_ATTEMPTS_PER_WINDOW) {
            // Lock out the IP
            this.lockedOutIPs.set(key, now + this.LOCKOUT_DURATION);
            
            return {
                allowed: false,
                retryAfter: Math.ceil(this.LOCKOUT_DURATION / 1000),
                reason: 'Rate limit exceeded'
            };
        }
        
        // Record attempt
        entry.attempts.push(now);
        
        return {
            allowed: true,
            remaining: this.MAX_ATTEMPTS_PER_WINDOW - entry.attempts.length,
            resetAt: entry.windowStart + this.RATE_LIMIT_WINDOW
        };
    }

    /**
     * Generate secure CSRF token
     * @returns {Promise<string>} CSRF token
     */
    async generateCSRFToken() {
        const token = await randomBytes(32);
        return token.toString('base64url');
    }

    /**
     * Validate CSRF token
     * @param {string} token - Token to validate
     * @param {string} sessionToken - Session token to compare
     * @returns {boolean} Valid or not
     */
    validateCSRFToken(token, sessionToken) {
        if (!token || !sessionToken) return false;
        
        // Convert to buffers for constant-time comparison
        const tokenBuffer = Buffer.from(token);
        const sessionBuffer = Buffer.from(sessionToken);
        
        if (tokenBuffer.length !== sessionBuffer.length) return false;
        
        return crypto.timingSafeEqual(tokenBuffer, sessionBuffer);
    }

    /**
     * Sanitize user input to prevent injection attacks
     * @param {string} input - User input
     * @param {string} context - Context of sanitization (html, sql, etc)
     * @returns {string} Sanitized input
     */
    sanitizeInput(input, context = 'general') {
        if (!input || typeof input !== 'string') return '';
        
        let sanitized = input;
        
        switch (context) {
            case 'html':
                // HTML entity encoding
                sanitized = sanitized
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
                break;
                
            case 'sql':
                // Basic SQL escaping (use parameterized queries in production!)
                sanitized = sanitized
                    .replace(/'/g, "''")
                    .replace(/;/g, '')
                    .replace(/--/g, '')
                    .replace(/\/\*/g, '')
                    .replace(/\*\//g, '');
                break;
                
            case 'filename':
                // Safe filename
                sanitized = sanitized
                    .replace(/[^a-zA-Z0-9._-]/g, '_')
                    .replace(/\.{2,}/g, '_');
                break;
                
            default:
                // General sanitization
                sanitized = sanitized
                    .replace(/[<>'"]/g, '')
                    .trim();
        }
        
        return sanitized;
    }

    /**
     * Validate blockchain address format
     * @param {string} address - Address to validate
     * @param {string} type - Address type (bitcoin, spark)
     * @returns {Object} Validation result
     */
    validateAddress(address, type = 'bitcoin') {
        const result = {
            valid: false,
            type: null,
            network: null
        };
        
        if (!address || typeof address !== 'string') {
            return result;
        }
        
        switch (type) {
            case 'bitcoin':
                // P2PKH addresses (Legacy)
                if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
                    result.valid = true;
                    result.type = 'p2pkh';
                    result.network = address.startsWith('1') ? 'mainnet' : 'testnet';
                }
                // P2SH addresses
                else if (/^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
                    result.valid = true;
                    result.type = 'p2sh';
                    result.network = 'mainnet';
                }
                // Bech32 addresses (SegWit)
                else if (/^(bc1|tb1)[a-z0-9]{39,87}$/.test(address)) {
                    result.valid = true;
                    result.type = 'bech32';
                    result.network = address.startsWith('bc1') ? 'mainnet' : 'testnet';
                }
                break;
                
            case 'spark':
                // Simplified Spark address validation
                if (/^sp[a-zA-Z0-9]{40,80}$/.test(address)) {
                    result.valid = true;
                    result.type = 'spark';
                    result.network = 'spark';
                }
                break;
        }
        
        return result;
    }

    /**
     * Perform security audit on wallet data
     * @param {Object} walletData - Wallet data to audit
     * @returns {Object} Audit report
     */
    auditWalletSecurity(walletData) {
        const report = {
            passed: true,
            critical: [],
            warnings: [],
            info: []
        };
        
        // Check for plaintext sensitive data
        if (walletData.mnemonic && typeof walletData.mnemonic === 'string') {
            if (!walletData.encrypted) {
                report.critical.push('Mnemonic stored in plaintext');
                report.passed = false;
            }
        }
        
        // Check for exposed private keys
        if (walletData.privateKeys) {
            report.critical.push('Private keys found in wallet data');
            report.passed = false;
        }
        
        // Check password in data
        if (walletData.password || walletData.pin) {
            report.critical.push('Password/PIN found in wallet data');
            report.passed = false;
        }
        
        // Check for weak encryption indicators
        if (walletData.encrypted && walletData.encryptionMethod) {
            const weakMethods = ['des', '3des', 'rc4', 'md5', 'sha1'];
            if (weakMethods.includes(walletData.encryptionMethod.toLowerCase())) {
                report.warnings.push(`Weak encryption method: ${walletData.encryptionMethod}`);
            }
        }
        
        // Check for missing security headers
        if (!walletData.version) {
            report.info.push('Missing version information');
        }
        
        if (!walletData.createdAt) {
            report.info.push('Missing creation timestamp');
        }
        
        return report;
    }

    /**
     * Clean up expired rate limit entries
     * @private
     */
    cleanupRateLimits() {
        const now = Date.now();
        
        // Clean rate limit store
        for (const [key, entry] of this.rateLimitStore.entries()) {
            if (entry.windowStart + this.RATE_LIMIT_WINDOW < now) {
                this.rateLimitStore.delete(key);
            }
        }
        
        // Clean lockout store
        for (const [key, lockoutEnd] of this.lockedOutIPs.entries()) {
            if (lockoutEnd < now) {
                this.lockedOutIPs.delete(key);
            }
        }
    }
}

// Export singleton instance
export const securityValidator = new SecurityValidator();

// Cleanup expired entries every 5 minutes
setInterval(() => {
    securityValidator.cleanupRateLimits();
}, 5 * 60 * 1000);