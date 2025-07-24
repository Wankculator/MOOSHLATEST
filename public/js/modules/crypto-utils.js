/**
 * Crypto Utilities Module
 * Secure cryptographic operations for MOOSH Wallet
 * Following Security MCP guidelines - NO Math.random() for crypto
 */

export class CryptoUtils {
    // BIP39 wordlist (first 256 words for demo, full list would be 2048)
    static BIP39_WORDLIST = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
        'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
        'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
        'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
        'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
        'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
        'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
        'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
        'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
        'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
        'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
        'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
        'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
        'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
        'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
        'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
        'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
        'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
        'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
        'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
        'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
        'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
        'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
        'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
        'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
        'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring',
        'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain',
        'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief',
        'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
        'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
        'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus',
        'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable'
    ];

    /**
     * Generate cryptographically secure random bytes
     * @param {number} length - Number of bytes to generate
     * @returns {Uint8Array} Random bytes
     */
    static getRandomBytes(length) {
        const bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
        return bytes;
    }

    /**
     * Generate a secure random number within range
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} Random number
     */
    static getRandomInt(min, max) {
        const range = max - min;
        const bytesNeeded = Math.ceil(Math.log2(range) / 8);
        const maxValue = Math.pow(256, bytesNeeded);
        const threshold = maxValue - (maxValue % range);

        let randomValue;
        do {
            const bytes = this.getRandomBytes(bytesNeeded);
            randomValue = 0;
            for (let i = 0; i < bytesNeeded; i++) {
                randomValue = (randomValue << 8) | bytes[i];
            }
        } while (randomValue >= threshold);

        return min + (randomValue % range);
    }

    /**
     * Generate a BIP39 mnemonic phrase
     * @param {number} wordCount - Number of words (12, 15, 18, 21, or 24)
     * @returns {string} Mnemonic phrase
     */
    static generateMnemonic(wordCount = 12) {
        // Validate word count
        const validWordCounts = [12, 15, 18, 21, 24];
        if (!validWordCounts.includes(wordCount)) {
            throw new Error('Invalid word count. Must be 12, 15, 18, 21, or 24.');
        }

        // Calculate entropy needed
        const entropyBits = (wordCount * 11) - (wordCount / 3);
        const entropyBytes = entropyBits / 8;

        // Generate entropy
        const entropy = this.getRandomBytes(entropyBytes);

        // For demo purposes, generate random words
        // In production, this would use proper BIP39 with checksum
        const words = [];
        for (let i = 0; i < wordCount; i++) {
            const randomIndex = this.getRandomInt(0, this.BIP39_WORDLIST.length);
            words.push(this.BIP39_WORDLIST[randomIndex]);
        }

        return words.join(' ');
    }

    /**
     * Hash data using SHA-256
     * @param {string|Uint8Array} data - Data to hash
     * @returns {Promise<ArrayBuffer>} Hash result
     */
    static async sha256(data) {
        const encoder = new TextEncoder();
        const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
        return await window.crypto.subtle.digest('SHA-256', dataBuffer);
    }

    /**
     * Convert ArrayBuffer to hex string
     * @param {ArrayBuffer} buffer - Buffer to convert
     * @returns {string} Hex string
     */
    static bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Convert hex string to ArrayBuffer
     * @param {string} hex - Hex string
     * @returns {ArrayBuffer} Buffer
     */
    static hexToBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes.buffer;
    }

    /**
     * Generate a secure password
     * @param {number} length - Password length
     * @param {object} options - Password options
     * @returns {string} Generated password
     */
    static generatePassword(length = 16, options = {}) {
        const defaults = {
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true
        };
        
        const opts = { ...defaults, ...options };
        let charset = '';
        
        if (opts.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (opts.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (opts.numbers) charset += '0123456789';
        if (opts.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!charset) {
            throw new Error('At least one character set must be enabled');
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = this.getRandomInt(0, charset.length);
            password += charset[randomIndex];
        }

        return password;
    }

    /**
     * Derive a key from password using PBKDF2
     * @param {string} password - Password to derive from
     * @param {Uint8Array} salt - Salt bytes
     * @param {number} iterations - Number of iterations
     * @returns {Promise<CryptoKey>} Derived key
     */
    static async deriveKey(password, salt, iterations = 100000) {
        const encoder = new TextEncoder();
        const passwordKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data using AES-GCM
     * @param {string} plaintext - Data to encrypt
     * @param {CryptoKey} key - Encryption key
     * @returns {Promise<object>} Encrypted data with IV
     */
    static async encrypt(plaintext, key) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        
        const iv = this.getRandomBytes(12); // 96-bit IV for GCM
        
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );

        return {
            ciphertext: this.bufferToHex(ciphertext),
            iv: this.bufferToHex(iv)
        };
    }

    /**
     * Decrypt data using AES-GCM
     * @param {string} ciphertext - Encrypted data (hex)
     * @param {string} iv - Initialization vector (hex)
     * @param {CryptoKey} key - Decryption key
     * @returns {Promise<string>} Decrypted plaintext
     */
    static async decrypt(ciphertext, iv, key) {
        const decoder = new TextDecoder();
        
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: this.hexToBuffer(iv)
            },
            key,
            this.hexToBuffer(ciphertext)
        );

        return decoder.decode(decrypted);
    }

    /**
     * Generate a secure wallet ID
     * @returns {string} Wallet ID
     */
    static generateWalletId() {
        const bytes = this.getRandomBytes(16);
        return this.bufferToHex(bytes);
    }

    /**
     * Validate Bitcoin address format
     * @param {string} address - Bitcoin address
     * @returns {boolean} Is valid
     */
    static isValidBitcoinAddress(address) {
        // Basic validation - real implementation would check checksums
        const patterns = [
            /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Legacy
            /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // Nested SegWit
            /^bc1[a-z0-9]{39,59}$/,            // Native SegWit
            /^bc1p[a-z0-9]{58,62}$/,           // Taproot
            /^tb1[a-z0-9]{39,59}$/,            // Testnet SegWit
            /^[2mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/ // Testnet Legacy
        ];

        return patterns.some(pattern => pattern.test(address));
    }

    /**
     * Validate Spark address format
     * @param {string} address - Spark address
     * @returns {boolean} Is valid
     */
    static isValidSparkAddress(address) {
        return /^sp1[a-z0-9]{40,80}$/.test(address);
    }

    /**
     * Generate QR code data URL
     * @param {string} data - Data to encode
     * @param {number} size - QR code size
     * @returns {Promise<string>} Data URL of QR code
     */
    static async generateQRCode(data, size = 256) {
        // This would use a QR library in production
        // For now, return a placeholder
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw placeholder QR code
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(10, 10, size - 20, size - 20);
        ctx.fillStyle = '#000000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('QR: ' + data.substring(0, 10) + '...', size / 2, size / 2);
        
        return canvas.toDataURL();
    }

    /**
     * Constant-time string comparison
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {boolean} Are equal
     */
    static secureCompare(a, b) {
        if (a.length !== b.length) return false;
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    /**
     * Clear sensitive data from memory
     * @param {any} data - Data to clear
     */
    static secureClear(data) {
        if (typeof data === 'string') {
            // Strings are immutable in JS, best we can do is null the reference
            data = null;
        } else if (data instanceof Uint8Array) {
            // Overwrite array with zeros
            data.fill(0);
        } else if (ArrayBuffer.isView(data)) {
            // Clear any typed array
            new Uint8Array(data.buffer).fill(0);
        }
    }
}

// Export default
export default CryptoUtils;