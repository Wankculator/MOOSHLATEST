/**
 * Unit tests for Enhanced API Service
 * Tests API communication, caching, and error recovery
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock dependencies
const mockStateManager = {
    get: vi.fn(),
    set: vi.fn()
};

const mockErrorHandler = {
    executeWithRetry: vi.fn((fn) => fn()),
    handleError: vi.fn(),
    configureRetry: vi.fn()
};

// Import after mocking
import { EnhancedAPIService } from '../../public/js/modules/core/api-service-enhanced.js';

describe('EnhancedAPIService', () => {
    let apiService;
    
    beforeEach(() => {
        vi.clearAllMocks();
        fetch.mockClear();
        
        // Default mock implementations
        mockStateManager.get.mockImplementation((key) => {
            if (key === 'isMainnet') return true;
            return null;
        });
        
        // Create service instance
        apiService = new EnhancedAPIService(mockStateManager, mockErrorHandler);
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should set correct base URL for localhost', () => {
            expect(apiService.baseURL).toMatch(/127\.0\.0\.1:3001/);
        });

        it('should configure retry settings for critical endpoints', () => {
            expect(mockErrorHandler.configureRetry).toHaveBeenCalledWith(
                '/api/spark/generate-wallet',
                expect.objectContaining({
                    maxRetries: 5,
                    backoff: 'exponential'
                })
            );
        });
    });

    describe('Request Handling', () => {
        it('should make GET request with proper headers', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ success: true })
            });
            
            const result = await apiService.get('/api/test');
            
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    })
                })
            );
            
            expect(result).toEqual({ success: true });
        });

        it('should make POST request with body', async () => {
            const postData = { key: 'value' };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ success: true })
            });
            
            await apiService.post('/api/test', postData);
            
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(postData)
                })
            );
        });

        it('should handle request timeout', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            
            fetch.mockRejectedValueOnce(abortError);
            mockErrorHandler.executeWithRetry.mockRejectedValueOnce(abortError);
            
            await expect(apiService.get('/api/test')).rejects.toThrow('Aborted');
        });
    });

    describe('Caching', () => {
        it('should cache GET requests', async () => {
            const responseData = { data: 'test' };
            
            fetch.mockResolvedValue({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => responseData
            });
            
            // First call - should fetch
            const result1 = await apiService.get('/api/cached', { cache: true });
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(result1).toEqual(responseData);
            
            // Second call - should use cache
            const result2 = await apiService.get('/api/cached', { cache: true });
            expect(fetch).toHaveBeenCalledTimes(1); // No additional fetch
            expect(result2).toEqual(responseData);
        });

        it('should respect cache types and expiry', async () => {
            const priceData = { usd: 50000 };
            
            fetch.mockResolvedValue({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => priceData
            });
            
            // Cache price data
            await apiService.get('/api/price', { 
                cache: true, 
                cacheType: 'price' 
            });
            
            // Should be cached for 5 minutes
            expect(apiService.cache.has('GET:/api/price:undefined')).toBe(true);
            
            // Clear specific cache type
            apiService.clearCache('price');
            expect(apiService.cache.has('GET:/api/price:undefined')).toBe(false);
        });

        it('should not cache POST requests', async () => {
            fetch.mockResolvedValue({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ id: 1 })
            });
            
            await apiService.post('/api/create', { data: 'test' });
            await apiService.post('/api/create', { data: 'test' });
            
            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        it('should handle HTTP errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({
                    error: {
                        type: 'VALIDATION_ERROR',
                        message: 'Invalid input'
                    }
                })
            });
            
            mockErrorHandler.executeWithRetry.mockImplementationOnce(async (fn) => {
                try {
                    return await fn();
                } catch (error) {
                    throw error;
                }
            });
            
            await expect(apiService.get('/api/test')).rejects.toThrow();
        });

        it('should use fallback on error when provided', async () => {
            const fallbackData = { balance: 0 };
            
            fetch.mockRejectedValueOnce(new Error('Network error'));
            mockErrorHandler.executeWithRetry.mockRejectedValueOnce(new Error('Network error'));
            mockErrorHandler.handleError.mockResolvedValueOnce({ retry: false });
            
            const result = await apiService.get('/api/balance', {
                fallback: fallbackData
            });
            
            expect(result).toEqual(fallbackData);
        });
    });

    describe('Bitcoin-specific Methods', () => {
        it('should get Bitcoin price with caching', async () => {
            const priceData = { usd: 65000, usd_24h_change: 2.5 };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => priceData
            });
            
            const price = await apiService.getBitcoinPrice();
            
            expect(price).toEqual(priceData);
            expect(mockStateManager.set).toHaveBeenCalledWith(
                'lastKnownBTCPrice',
                expect.objectContaining({ price: 65000 })
            );
        });

        it('should use last known price on failure', async () => {
            mockStateManager.get.mockImplementation((key) => {
                if (key === 'lastKnownBTCPrice') {
                    return { price: 60000, timestamp: Date.now() };
                }
                return null;
            });
            
            fetch.mockRejectedValueOnce(new Error('API down'));
            mockErrorHandler.executeWithRetry.mockRejectedValueOnce(new Error('API down'));
            
            const price = await apiService.getBitcoinPrice();
            
            expect(price).toEqual({ usd: 60000, usd_24h_change: 0 });
        });

        it('should handle Bitcoin balance requests', async () => {
            const balanceData = { balance: 100000, txCount: 5 };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => balanceData
            });
            
            const balance = await apiService.getBitcoinBalance('bc1qtest...');
            
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/bitcoin/balance/bc1qtest...'),
                expect.any(Object)
            );
            expect(balance).toEqual(balanceData);
        });
    });

    describe('Spark Protocol Methods', () => {
        it('should generate Spark wallet with timeout', async () => {
            const walletData = {
                mnemonic: 'test words...',
                addresses: { spark: 'spark1...' }
            };
            
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => walletData
            });
            
            const wallet = await apiService.generateSparkWallet(256);
            
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/spark/generate-wallet'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ strength: 256 })
                })
            );
            expect(wallet).toEqual(walletData);
        });
    });

    describe('Health Check', () => {
        it('should perform health check', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ status: 'ok' })
            });
            
            const isHealthy = await apiService.healthCheck();
            
            expect(isHealthy).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/health'),
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        it('should return false on health check failure', async () => {
            fetch.mockRejectedValueOnce(new Error('Server down'));
            mockErrorHandler.executeWithRetry.mockRejectedValueOnce(new Error('Server down'));
            
            const isHealthy = await apiService.healthCheck();
            
            expect(isHealthy).toBe(false);
        });
    });

    describe('Cache Management', () => {
        it('should limit cache size', async () => {
            // Set cache limit
            apiService.cache.clear();
            
            // Add more than 100 items
            for (let i = 0; i < 105; i++) {
                apiService.setCache(`key${i}`, { data: i });
            }
            
            // Should only have 100 items
            expect(apiService.cache.size).toBeLessThanOrEqual(100);
        });

        it('should clear all cache', () => {
            apiService.setCache('key1', { data: 1 });
            apiService.setCache('key2', { data: 2 });
            
            expect(apiService.cache.size).toBe(2);
            
            apiService.clearCache();
            
            expect(apiService.cache.size).toBe(0);
        });
    });

    describe('Response Parsing', () => {
        it('should parse JSON responses', async () => {
            const jsonData = { key: 'value' };
            const response = {
                headers: {
                    get: () => 'application/json'
                },
                json: vi.fn().mockResolvedValue(jsonData)
            };
            
            const result = await apiService.parseResponse(response);
            
            expect(result).toEqual(jsonData);
            expect(response.json).toHaveBeenCalled();
        });

        it('should parse text responses', async () => {
            const textData = 'plain text';
            const response = {
                headers: {
                    get: () => 'text/plain'
                },
                text: vi.fn().mockResolvedValue(textData)
            };
            
            const result = await apiService.parseResponse(response);
            
            expect(result).toBe(textData);
            expect(response.text).toHaveBeenCalled();
        });

        it('should parse blob responses', async () => {
            const blobData = new Blob(['data']);
            const response = {
                headers: {
                    get: () => 'image/png'
                },
                blob: vi.fn().mockResolvedValue(blobData)
            };
            
            const result = await apiService.parseResponse(response);
            
            expect(result).toBe(blobData);
            expect(response.blob).toHaveBeenCalled();
        });
    });
});