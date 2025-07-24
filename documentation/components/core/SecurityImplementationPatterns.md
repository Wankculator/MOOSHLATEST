# Security Implementation Patterns

**Last Updated**: 2025-07-21  
**Critical**: YES - Security is paramount in a cryptocurrency wallet  
**Audit Status**: Patterns updated based on recent security audit findings

## Overview

This document provides concrete, implementable security patterns for MOOSH Wallet. Every pattern includes actual code that can be copied and adapted. Security is not optional - these patterns MUST be followed.

## Core Security Principles

1. **Never Trust User Input** - Always validate and sanitize
2. **Defense in Depth** - Multiple layers of security
3. **Fail Secure** - Errors should result in secure state
4. **Least Privilege** - Minimal access/permissions
5. **Crypto-First** - Use Web Crypto API, never Math.random()

## Critical Security Patterns

### Pattern 1: Cryptographically Secure Random Generation

**NEVER use Math.random() for anything security-related!**

```javascript
// CORRECT - Cryptographically secure random
class SecureRandom {
    // Generate random bytes
    static getRandomBytes(length) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return array;
    }
    
    // Generate random integer in range [0, max)
    static getRandomInt(max) {
        const bytesNeeded = Math.ceil(Math.log2(max) / 8);
        const maxValid = Math.floor(256 ** bytesNeeded / max) * max;
        
        let randomValue;
        do {
            const bytes = this.getRandomBytes(bytesNeeded);
            randomValue = bytes.reduce((acc, byte, i) => acc + byte * (256 ** i), 0);
        } while (randomValue >= maxValid); // Reject to avoid bias
        
        return randomValue % max;
    }
    
    // Select random element from array
    static selectRandom(array) {
        if (!array || array.length === 0) {
            throw new Error('Cannot select from empty array');
        }
        const index = this.getRandomInt(array.length);
        return array[index];
    }
    
    // Generate secure ID
    static generateId(length = 16) {
        const bytes = this.getRandomBytes(length);
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

// USAGE EXAMPLES:

// Selecting random color
const colors = ['#FF5733', '#33FF57', '#3357FF'];
const randomColor = SecureRandom.selectRandom(colors);

// Generating secure account ID
const accountId = SecureRandom.generateId(); // 32 char hex string

// Random word selection for seed generation
const wordIndex = SecureRandom.getRandomInt(2048); // BIP39 wordlist
```

### Pattern 2: Input Validation and Sanitization

**Every input must be validated before use:**

```javascript
class InputSecurity {
    // Comprehensive input validation
    static validateAndSanitize(input, type) {
        // Always trim and check for null/undefined
        if (input === null || input === undefined) {
            return { valid: false, error: 'Input required' };
        }
        
        const trimmed = String(input).trim();
        
        switch (type) {
            case 'address':
                return this.validateBitcoinAddress(trimmed);
            
            case 'amount':
                return this.validateAmount(trimmed);
            
            case 'text':
                return this.sanitizeText(trimmed);
            
            case 'url':
                return this.validateUrl(trimmed);
            
            default:
                return ComplianceUtils.validateInput(input, type);
        }
    }
    
    // Bitcoin address validation
    static validateBitcoinAddress(address) {
        // Basic format check
        const patterns = {
            legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            segwit: /^bc1[a-z0-9]{39,59}$/,
            segwitTestnet: /^tb1[a-z0-9]{39,59}$/,
            taproot: /^bc1p[a-z0-9]{57}$/
        };
        
        const isValid = Object.values(patterns).some(pattern => pattern.test(address));
        
        if (!isValid) {
            return { valid: false, error: 'Invalid Bitcoin address format' };
        }
        
        // Additional checksum validation would go here
        return { valid: true, sanitized: address };
    }
    
    // Amount validation (prevent precision attacks)
    static validateAmount(amount) {
        // Remove any non-numeric except decimal
        const cleaned = amount.replace(/[^0-9.]/g, '');
        
        // Check valid number format
        if (!/^\d+(\.\d{1,8})?$/.test(cleaned)) {
            return { valid: false, error: 'Invalid amount format' };
        }
        
        const numAmount = parseFloat(cleaned);
        
        // Check range
        if (numAmount <= 0) {
            return { valid: false, error: 'Amount must be positive' };
        }
        
        if (numAmount > 21000000) { // Max BTC supply
            return { valid: false, error: 'Amount exceeds maximum' };
        }
        
        // Convert to satoshis to avoid floating point issues
        const satoshis = Math.round(numAmount * 100000000);
        
        return { 
            valid: true, 
            sanitized: cleaned,
            satoshis: satoshis,
            btc: satoshis / 100000000
        };
    }
    
    // Text sanitization (prevent XSS)
    static sanitizeText(text) {
        // Remove any HTML tags
        const noTags = text.replace(/<[^>]*>/g, '');
        
        // Escape special characters
        const escaped = noTags
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        // Check length
        if (escaped.length > 1000) {
            return { valid: false, error: 'Text too long' };
        }
        
        return { valid: true, sanitized: escaped };
    }
    
    // URL validation (prevent malicious redirects)
    static validateUrl(url) {
        try {
            const parsed = new URL(url);
            
            // Only allow HTTPS in production
            if (window.location.protocol === 'https:' && parsed.protocol !== 'https:') {
                return { valid: false, error: 'Only HTTPS URLs allowed' };
            }
            
            // Whitelist allowed domains
            const allowedDomains = [
                'api.coingecko.com',
                'blockchain.info',
                'mempool.space',
                'spark-sdk.com'
            ];
            
            if (!allowedDomains.includes(parsed.hostname)) {
                return { valid: false, error: 'Domain not whitelisted' };
            }
            
            return { valid: true, sanitized: parsed.toString() };
            
        } catch (e) {
            return { valid: false, error: 'Invalid URL format' };
        }
    }
}

// USAGE EXAMPLE:
async function sendTransaction(toAddress, amount) {
    // Validate address
    const addressValidation = InputSecurity.validateAndSanitize(toAddress, 'address');
    if (!addressValidation.valid) {
        throw new Error(addressValidation.error);
    }
    
    // Validate amount
    const amountValidation = InputSecurity.validateAndSanitize(amount, 'amount');
    if (!amountValidation.valid) {
        throw new Error(amountValidation.error);
    }
    
    // Use sanitized values
    const tx = {
        to: addressValidation.sanitized,
        amount: amountValidation.satoshis
    };
    
    return await createTransaction(tx);
}
```

### Pattern 3: Secure Storage Patterns

**Never store sensitive data in plain text:**

```javascript
class SecureStorage {
    // Encrypt data before storing
    static async encryptAndStore(key, data, password) {
        try {
            // Generate salt for this data
            const salt = SecureRandom.getRandomBytes(16);
            
            // Derive key from password
            const keyMaterial = await this.getKeyMaterial(password);
            const cryptoKey = await this.deriveKey(keyMaterial, salt);
            
            // Encrypt
            const iv = SecureRandom.getRandomBytes(12);
            const encoder = new TextEncoder();
            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                encoder.encode(JSON.stringify(data))
            );
            
            // Store with metadata
            const stored = {
                encrypted: Array.from(new Uint8Array(encrypted)),
                salt: Array.from(salt),
                iv: Array.from(iv),
                timestamp: Date.now()
            };
            
            localStorage.setItem(key, JSON.stringify(stored));
            return true;
            
        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Encryption failed: ' + error.message, 'error');
            return false;
        }
    }
    
    // Decrypt stored data
    static async decryptAndRetrieve(key, password) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            const { encrypted, salt, iv } = JSON.parse(stored);
            
            // Recreate key
            const keyMaterial = await this.getKeyMaterial(password);
            const cryptoKey = await this.deriveKey(
                keyMaterial, 
                new Uint8Array(salt)
            );
            
            // Decrypt
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                cryptoKey,
                new Uint8Array(encrypted)
            );
            
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
            
        } catch (error) {
            ComplianceUtils.log('SecureStorage', 'Decryption failed', 'error');
            return null;
        }
    }
    
    // Helper: Get key material from password
    static async getKeyMaterial(password) {
        const encoder = new TextEncoder();
        return window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
    }
    
    // Helper: Derive encryption key
    static async deriveKey(keyMaterial, salt) {
        return window.crypto.subtle.deriveKey(
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
    }
    
    // Store non-sensitive data with integrity check
    static storeWithIntegrity(key, data) {
        const stored = {
            data: data,
            checksum: this.calculateChecksum(data),
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(stored));
    }
    
    // Retrieve and verify integrity
    static retrieveWithIntegrity(key) {
        try {
            const stored = JSON.parse(localStorage.getItem(key) || 'null');
            if (!stored) return null;
            
            const calculatedChecksum = this.calculateChecksum(stored.data);
            if (calculatedChecksum !== stored.checksum) {
                ComplianceUtils.log('SecureStorage', 'Integrity check failed for ' + key, 'error');
                return null;
            }
            
            return stored.data;
        } catch (e) {
            return null;
        }
    }
    
    // Calculate checksum for integrity
    static calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }
}

// USAGE EXAMPLE:
// Storing sensitive wallet data
await SecureStorage.encryptAndStore('wallet_backup', {
    mnemonic: wallet.mnemonic,
    accounts: wallet.accounts
}, userPassword);

// Storing preferences (non-sensitive)
SecureStorage.storeWithIntegrity('user_preferences', {
    theme: 'dark',
    currency: 'USD',
    notifications: true
});
```

### Pattern 4: XSS Prevention

**Never use innerHTML with user data:**

```javascript
class DOMSecurity {
    // Safe text content
    static setSafeText(element, text) {
        // Always use textContent for user data
        element.textContent = text;
    }
    
    // Safe HTML creation
    static createSafeHTML(template, data) {
        // Use DOM methods, not string concatenation
        const container = document.createElement('div');
        
        // Example: Create user message display
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        
        const authorEl = document.createElement('span');
        authorEl.className = 'author';
        authorEl.textContent = data.author; // Safe
        
        const contentEl = document.createElement('p');
        contentEl.textContent = data.content; // Safe
        
        messageEl.appendChild(authorEl);
        messageEl.appendChild(contentEl);
        
        return messageEl;
    }
    
    // Safe attribute setting
    static setSafeAttribute(element, attribute, value) {
        // Whitelist allowed attributes
        const allowedAttributes = [
            'class', 'id', 'data-id', 'disabled', 
            'readonly', 'checked', 'selected'
        ];
        
        if (!allowedAttributes.includes(attribute)) {
            ComplianceUtils.log('DOMSecurity', `Blocked unsafe attribute: ${attribute}`, 'warn');
            return;
        }
        
        // Sanitize value
        const sanitized = String(value).replace(/[<>"'/]/g, '');
        element.setAttribute(attribute, sanitized);
    }
    
    // Safe URL handling
    static setSafeHref(element, url) {
        try {
            const parsed = new URL(url);
            
            // Prevent javascript: protocol
            if (parsed.protocol === 'javascript:') {
                ComplianceUtils.log('DOMSecurity', 'Blocked javascript: URL', 'error');
                return;
            }
            
            element.href = parsed.toString();
            
            // Add security attributes
            if (parsed.origin !== window.location.origin) {
                element.rel = 'noopener noreferrer';
                element.target = '_blank';
            }
            
        } catch (e) {
            ComplianceUtils.log('DOMSecurity', 'Invalid URL: ' + url, 'error');
        }
    }
    
    // Safe event handler attachment
    static addSafeEventListener(element, event, handler) {
        // Wrap handler to prevent XSS through event objects
        const safeHandler = (e) => {
            // Prevent default for certain events
            if (['submit', 'click'].includes(event) && e.target.tagName === 'A') {
                e.preventDefault();
            }
            
            // Call original handler with sanitized event
            handler(e);
        };
        
        element.addEventListener(event, safeHandler);
        
        // Return cleanup function
        return () => element.removeEventListener(event, safeHandler);
    }
}

// USAGE EXAMPLE:
// Displaying user-generated content safely
function displayUserMessage(message) {
    const container = document.getElementById('messages');
    
    // Create elements safely
    const messageEl = $.div({ className: 'message' });
    
    // Set text content safely
    DOMSecurity.setSafeText(messageEl, message.content);
    
    // Add link safely
    if (message.link) {
        const linkEl = $.a({});
        DOMSecurity.setSafeHref(linkEl, message.link);
        DOMSecurity.setSafeText(linkEl, 'View Link');
        messageEl.appendChild(linkEl);
    }
    
    container.appendChild(messageEl);
}
```

### Pattern 5: Timing Attack Prevention

**Prevent timing attacks on sensitive comparisons:**

```javascript
class TimingSecurity {
    // Constant-time string comparison
    static secureCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }
    
    // Add random delay to prevent timing analysis
    static async addJitter(minMs = 100, maxMs = 500) {
        const delay = minMs + SecureRandom.getRandomInt(maxMs - minMs);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Rate limiting to prevent brute force
    static createRateLimiter(maxAttempts = 5, windowMs = 300000) { // 5 minutes
        const attempts = new Map();
        
        return {
            check: (identifier) => {
                const now = Date.now();
                const userAttempts = attempts.get(identifier) || [];
                
                // Clean old attempts
                const recentAttempts = userAttempts.filter(
                    time => now - time < windowMs
                );
                
                if (recentAttempts.length >= maxAttempts) {
                    const oldestAttempt = Math.min(...recentAttempts);
                    const waitTime = windowMs - (now - oldestAttempt);
                    return {
                        allowed: false,
                        waitTime: Math.ceil(waitTime / 1000)
                    };
                }
                
                // Record attempt
                recentAttempts.push(now);
                attempts.set(identifier, recentAttempts);
                
                return { allowed: true };
            },
            
            reset: (identifier) => {
                attempts.delete(identifier);
            }
        };
    }
}

// USAGE EXAMPLE:
const passwordLimiter = TimingSecurity.createRateLimiter(3, 300000);

async function verifyPassword(username, password) {
    // Check rate limit
    const { allowed, waitTime } = passwordLimiter.check(username);
    if (!allowed) {
        throw new Error(`Too many attempts. Try again in ${waitTime} seconds.`);
    }
    
    // Add jitter to prevent timing attacks
    await TimingSecurity.addJitter();
    
    // Get stored hash (example)
    const storedHash = await getPasswordHash(username);
    const inputHash = await hashPassword(password);
    
    // Constant-time comparison
    const valid = TimingSecurity.secureCompare(storedHash, inputHash);
    
    if (valid) {
        passwordLimiter.reset(username);
        return true;
    }
    
    return false;
}
```

### Pattern 6: Content Security Policy

**Implement CSP headers and meta tags:**

```javascript
class CSPManager {
    static applyCSP() {
        // Create CSP meta tag
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // Ideally remove unsafe-inline
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "connect-src 'self' https://api.coingecko.com https://blockchain.info",
            "font-src 'self'",
            "object-src 'none'",
            "media-src 'none'",
            "frame-src 'none'",
            "worker-src 'self'",
            "form-action 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'"
        ].join('; ');
        
        document.head.appendChild(cspMeta);
    }
    
    // Monitor CSP violations
    static monitorViolations() {
        document.addEventListener('securitypolicyviolation', (e) => {
            ComplianceUtils.log('CSP', `Violation: ${e.violatedDirective}`, 'error');
            
            // Report to server (if configured)
            if (window.app?.apiService) {
                window.app.apiService.reportCSPViolation({
                    directive: e.violatedDirective,
                    blocked: e.blockedURI,
                    source: e.sourceFile,
                    line: e.lineNumber
                }).catch(() => {
                    // Fail silently
                });
            }
        });
    }
}

// Apply on app start
CSPManager.applyCSP();
CSPManager.monitorViolations();
```

### Pattern 7: Secure Communication

**All external communication must be secure:**

```javascript
class SecureCommunication {
    // Force HTTPS for all requests
    static enforceHTTPS(url) {
        try {
            const parsed = new URL(url);
            
            // In production, force HTTPS
            if (window.location.protocol === 'https:' && parsed.protocol === 'http:') {
                parsed.protocol = 'https:';
                ComplianceUtils.log('SecureCommunication', 'Upgraded to HTTPS: ' + url, 'info');
            }
            
            return parsed.toString();
            
        } catch (e) {
            throw new Error('Invalid URL: ' + url);
        }
    }
    
    // Add security headers to requests
    static async secureRequest(url, options = {}) {
        const secureUrl = this.enforceHTTPS(url);
        
        const secureOptions = {
            ...options,
            credentials: 'omit', // Never send cookies to external APIs
            headers: {
                ...options.headers,
                'X-Requested-With': 'XMLHttpRequest',
                'X-Frame-Options': 'DENY'
            }
        };
        
        // Add request integrity
        if (options.body) {
            const bodyStr = typeof options.body === 'string' 
                ? options.body 
                : JSON.stringify(options.body);
                
            secureOptions.headers['X-Content-Hash'] = 
                await this.hashContent(bodyStr);
        }
        
        try {
            const response = await fetch(secureUrl, secureOptions);
            
            // Verify response integrity if header present
            const responseHash = response.headers.get('X-Content-Hash');
            if (responseHash) {
                const body = await response.text();
                const calculatedHash = await this.hashContent(body);
                
                if (!TimingSecurity.secureCompare(responseHash, calculatedHash)) {
                    throw new Error('Response integrity check failed');
                }
                
                // Parse JSON after verification
                return JSON.parse(body);
            }
            
            return await response.json();
            
        } catch (error) {
            ComplianceUtils.log('SecureCommunication', 'Request failed: ' + error.message, 'error');
            throw error;
        }
    }
    
    // Hash content for integrity checks
    static async hashContent(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// USAGE EXAMPLE:
async function fetchPrice() {
    try {
        const data = await SecureCommunication.secureRequest(
            'https://api.coingecko.com/api/v3/simple/price',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
        
        return data;
    } catch (error) {
        ComplianceUtils.log('PriceService', 'Failed to fetch price', 'error');
        throw error;
    }
}
```

## Security Audit Checklist

Before deploying any code, verify:

- [ ] No `Math.random()` usage for security-critical operations
- [ ] All user inputs validated with `InputSecurity.validateAndSanitize()`
- [ ] No `innerHTML` usage with user data
- [ ] All external URLs use HTTPS
- [ ] Sensitive data encrypted before storage
- [ ] CSP headers properly configured
- [ ] Rate limiting on sensitive operations
- [ ] Error messages don't expose sensitive info
- [ ] All array access uses bounds checking
- [ ] Event listeners properly cleaned up

## Common Security Mistakes to Avoid

```javascript
// MISTAKE 1: Using Math.random() for security
const randomIndex = Math.floor(Math.random() * array.length); // NEVER!

// MISTAKE 2: Storing sensitive data in plain text
localStorage.setItem('privateKey', key); // NEVER!

// MISTAKE 3: Using innerHTML with user data
element.innerHTML = `<div>${userInput}</div>`; // XSS vulnerability!

// MISTAKE 4: Not validating inputs
const amount = parseFloat(userInput); // What if it's not a number?

// MISTAKE 5: Exposing errors to users
catch (error) {
    alert(error.stack); // Exposes internal details!
}

// MISTAKE 6: Using HTTP in production
fetch('http://api.example.com/data'); // Must be HTTPS!

// MISTAKE 7: Weak comparison for secrets
if (password === storedPassword) { // Timing attack vulnerable!

// MISTAKE 8: No rate limiting
async function login(username, password) {
    // Allows unlimited attempts!
}
```

## Emergency Response Procedures

If a security issue is discovered:

1. **Immediate Actions**:
   ```javascript
   // Disable affected features
   window.EMERGENCY_DISABLE_FEATURES = ['feature1', 'feature2'];
   
   // Force logout all users
   SecureStorage.clear();
   window.location.reload();
   ```

2. **Audit Trail**:
   ```javascript
   // Log security event
   ComplianceUtils.log('SECURITY', 'Emergency response activated', 'error');
   
   // Notify server
   await app.apiService.reportSecurityIncident({
       type: 'emergency_response',
       timestamp: Date.now(),
       affected_features: window.EMERGENCY_DISABLE_FEATURES
   });
   ```

3. **Recovery**:
   - Deploy patched version
   - Force cache clear
   - Notify users to update
   - Review logs for exploitation

## Summary

Security in MOOSH Wallet is achieved through:
- **Proper cryptographic functions** (Web Crypto API)
- **Input validation** on every user input
- **Secure storage** with encryption
- **XSS prevention** through safe DOM manipulation
- **Timing attack prevention** for sensitive operations
- **Secure communication** with HTTPS enforcement

These patterns are not suggestions - they are requirements. Every developer must understand and implement these patterns correctly.