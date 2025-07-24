/**
 * API Service Module
 * Handles all API communication with proper CORS proxy and error handling
 * Following Security MCP guidelines - no direct external API calls
 */

export class APIService {
    constructor(baseURL = null) {
        this.baseURL = baseURL || `${window.location.protocol}//${window.location.hostname}:3001`;
        this.timeout = 60000; // 60 seconds for wallet generation
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Request queue for rate limiting
        this.requestQueue = [];
        this.requestsInFlight = 0;
        this.maxConcurrentRequests = 5;
        
        // Abort controllers for cancellation
        this.abortControllers = new Map();
    }

    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            cache = true,
            timeout = this.timeout,
            retry = 3,
            signal = null
        } = options;

        // Generate cache key
        const cacheKey = `${method}:${endpoint}:${JSON.stringify(body)}`;
        
        // Check cache for GET requests
        if (method === 'GET' && cache) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        // Create abort controller
        const abortController = new AbortController();
        const requestId = Date.now() + Math.random();
        this.abortControllers.set(requestId, abortController);

        // Combine signals
        const combinedSignal = signal || abortController.signal;

        // Build full URL
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

        // Default headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers
        };

        // Build fetch options
        const fetchOptions = {
            method,
            headers: defaultHeaders,
            signal: combinedSignal
        };
        
        // Only include credentials for same-origin requests
        if (url.startsWith(this.baseURL)) {
            fetchOptions.credentials = 'include';
        }

        if (body && method !== 'GET') {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        // Add timeout
        const timeoutId = setTimeout(() => abortController.abort(), timeout);

        try {
            // Rate limiting
            await this.waitForRateLimit();
            this.requestsInFlight++;

            // Make request with retry logic
            let lastError;
            for (let attempt = 1; attempt <= retry; attempt++) {
                try {
                    const response = await fetch(url, fetchOptions);
                    
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const error = await this.handleErrorResponse(response);
                        throw error;
                    }

                    const data = await response.json();

                    // Cache successful GET requests
                    if (method === 'GET' && cache) {
                        this.addToCache(cacheKey, data);
                    }

                    return data;

                } catch (error) {
                    lastError = error;
                    
                    // Don't retry on abort or client errors
                    if (error.name === 'AbortError' || (error.status && error.status < 500)) {
                        throw error;
                    }

                    // Wait before retry with exponential backoff
                    if (attempt < retry) {
                        await this.delay(Math.pow(2, attempt - 1) * 1000);
                    }
                }
            }

            throw lastError;

        } finally {
            clearTimeout(timeoutId);
            this.requestsInFlight--;
            this.abortControllers.delete(requestId);
            this.processQueue();
        }
    }

    async handleErrorResponse(response) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            // Response wasn't JSON
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = response;
        
        return error;
    }

    // Cache management
    addToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Clean old cache entries
        this.cleanCache();
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Check if cache is expired
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // Rate limiting
    async waitForRateLimit() {
        if (this.requestsInFlight >= this.maxConcurrentRequests) {
            return new Promise((resolve) => {
                this.requestQueue.push(resolve);
            });
        }
    }

    processQueue() {
        if (this.requestQueue.length > 0 && this.requestsInFlight < this.maxConcurrentRequests) {
            const resolve = this.requestQueue.shift();
            resolve();
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cancel all pending requests
    cancelAll() {
        for (const controller of this.abortControllers.values()) {
            controller.abort();
        }
        this.abortControllers.clear();
    }

    // Convenience methods for common operations
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // Bitcoin-specific endpoints (using proxy)
    async getBitcoinPrice() {
        return this.get('/api/proxy/bitcoin-price', { cache: true });
    }

    async getBitcoinBalance(address) {
        return this.get(`/api/bitcoin/balance/${address}`);
    }

    async getBitcoinTransactions(address) {
        return this.get(`/api/bitcoin/transactions/${address}`);
    }

    async broadcastTransaction(txHex) {
        return this.post('/api/bitcoin/broadcast', { tx: txHex });
    }

    // Spark Protocol endpoints
    async generateSparkWallet(strength = 128) {
        return this.post('/api/spark/generate-wallet', { strength }, { 
            timeout: 120000, // 2 minutes for Spark SDK
            cache: false 
        });
    }

    async importSparkWallet(mnemonic) {
        return this.post('/api/spark/import-wallet', { mnemonic }, {
            timeout: 120000,
            cache: false
        });
    }

    async getSparkBalance(address) {
        return this.get(`/api/spark/balance/${address}`);
    }

    // Ordinals endpoints
    async getOrdinals(address) {
        return this.get(`/api/ordinals/${address}`);
    }

    async getInscription(inscriptionId) {
        return this.get(`/api/ordinals/inscription/${inscriptionId}`);
    }

    // Session management
    async checkSession() {
        return this.get('/api/session/check');
    }

    async createSession(data) {
        return this.post('/api/session/create', data);
    }

    async destroySession() {
        return this.post('/api/session/destroy');
    }

    // Health check
    async healthCheck() {
        return this.get('/api/health', { cache: false });
    }

    // Debug method
    debug() {
        console.group('API Service Debug');
        console.log('Base URL:', this.baseURL);
        console.log('Cache Size:', this.cache.size);
        console.log('Requests in Flight:', this.requestsInFlight);
        console.log('Queue Length:', this.requestQueue.length);
        console.groupEnd();
    }

    // Cleanup
    destroy() {
        this.cancelAll();
        this.clearCache();
        this.requestQueue = [];
    }
}

// Export singleton instance
export const apiService = new APIService();

// Default export
export default APIService;