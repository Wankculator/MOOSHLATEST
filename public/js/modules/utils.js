/**
 * Utilities Module
 * Common utility functions for MOOSH Wallet
 */

import { REGEX_PATTERNS, BREAKPOINTS } from './constants.js';

/**
 * Format Bitcoin amount
 * @param {string|number} amount - Amount in BTC
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted amount
 */
export function formatBitcoin(amount, decimals = 8) {
    const num = parseFloat(amount) || 0;
    return num.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Format currency amount
 * @param {string|number} amount - Amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, currency = 'USD') {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(num);
}

/**
 * Format date/time
 * @param {string|Date} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
    const d = new Date(date);
    const defaultOptions = {
        dateStyle: 'medium',
        timeStyle: 'short'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(d);
}

/**
 * Format relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now - d) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
}

/**
 * Truncate address for display
 * @param {string} address - Bitcoin/Spark address
 * @param {number} startLen - Characters to show at start
 * @param {number} endLen - Characters to show at end
 * @returns {string} Truncated address
 */
export function truncateAddress(address, startLen = 6, endLen = 4) {
    if (!address || address.length <= startLen + endLen) return address;
    return `${address.slice(0, startLen)}...${address.slice(-endLen)}`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validate Bitcoin address
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid
 */
export function isValidBitcoinAddress(address) {
    return REGEX_PATTERNS.BITCOIN_ADDRESS.test(address);
}

/**
 * Validate Spark address
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid
 */
export function isValidSparkAddress(address) {
    return REGEX_PATTERNS.SPARK_ADDRESS.test(address);
}

/**
 * Validate transaction ID
 * @param {string} txid - Transaction ID
 * @returns {boolean} Is valid
 */
export function isValidTransactionId(txid) {
    return REGEX_PATTERNS.TRANSACTION_ID.test(txid);
}

/**
 * Validate amount format
 * @param {string} amount - Amount to validate
 * @returns {boolean} Is valid
 */
export function isValidAmount(amount) {
    return REGEX_PATTERNS.AMOUNT.test(amount) && parseFloat(amount) > 0;
}

/**
 * Parse query string
 * @param {string} query - Query string
 * @returns {object} Parsed parameters
 */
export function parseQueryString(query) {
    const params = {};
    const searchParams = new URLSearchParams(query);
    
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    
    return params;
}

/**
 * Build query string
 * @param {object} params - Parameters object
 * @returns {string} Query string
 */
export function buildQueryString(params) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, value);
        }
    });
    
    return searchParams.toString();
}

/**
 * Get device type
 * @returns {string} Device type (mobile, tablet, desktop)
 */
export function getDeviceType() {
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.SM) return 'mobile';
    if (width < BREAKPOINTS.LG) return 'tablet';
    return 'desktop';
}

/**
 * Check if mobile device
 * @returns {boolean} Is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get browser info
 * @returns {object} Browser information
 */
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) {
        browser = 'Chrome';
        version = ua.match(/Chrome\/(\d+)/)?.[1];
    } else if (ua.indexOf('Safari') > -1) {
        browser = 'Safari';
        version = ua.match(/Version\/(\d+)/)?.[1];
    } else if (ua.indexOf('Firefox') > -1) {
        browser = 'Firefox';
        version = ua.match(/Firefox\/(\d+)/)?.[1];
    } else if (ua.indexOf('Edge') > -1) {
        browser = 'Edge';
        version = ua.match(/Edge\/(\d+)/)?.[1];
    }
    
    return { browser, version, userAgent: ua };
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    // Use crypto-secure randomness for ID generation
    const randomBytes = new Uint8Array(5);
    window.crypto.getRandomValues(randomBytes);
    const random = Array.from(randomBytes)
        .map(b => b.toString(36))
        .join('')
        .substring(0, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await sleep(delay * Math.pow(2, i));
        }
    }
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Escape HTML
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Get contrast color (black or white) for background
 * @param {string} hexColor - Hex color
 * @returns {string} 'black' or 'white'
 */
export function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? 'black' : 'white';
}

// Export all utilities
export default {
    formatBitcoin,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    truncateAddress,
    copyToClipboard,
    debounce,
    throttle,
    isValidBitcoinAddress,
    isValidSparkAddress,
    isValidTransactionId,
    isValidAmount,
    parseQueryString,
    buildQueryString,
    getDeviceType,
    isMobile,
    getBrowserInfo,
    generateId,
    deepClone,
    sleep,
    retry,
    calculatePercentage,
    formatFileSize,
    escapeHtml,
    getContrastColor
};