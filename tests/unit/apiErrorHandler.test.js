/**
 * Unit tests for ApiErrorHandler
 * Tests error parsing, handling, and retry logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock window.app
global.window = {
    app: {
        showNotification: vi.fn()
    },
    location: {
        hostname: 'localhost'
    }
};

// Import after mocking
import { ApiErrorHandler } from '../../public/js/modules/core/api-error-handler.js';

describe('ApiErrorHandler', () => {
    let errorHandler;

    beforeEach(() => {
        errorHandler = new ApiErrorHandler();
        vi.clearAllMocks();
    });

    describe('Error Parsing', () => {
        it('should parse network errors correctly', () => {
            const error = new Error('Network request failed');
            error.response = null;
            
            const parsed = errorHandler.parseError(error);
            
            expect(parsed.type).toBe('NETWORK_ERROR');
            expect(parsed.message).toBe('Network connection failed');
            expect(parsed.retryable).toBe(true);
        });

        it('should parse API error responses', () => {
            const error = {
                response: {
                    status: 400,
                    data: {
                        error: {
                            type: 'VALIDATION_ERROR',
                            message: 'Invalid input',
                            details: [{ field: 'address', message: 'Invalid format' }]
                        }
                    }
                }
            };
            
            const parsed = errorHandler.parseError(error);
            
            expect(parsed.type).toBe('VALIDATION_ERROR');
            expect(parsed.message).toBe('Invalid input');
            expect(parsed.details).toEqual([{ field: 'address', message: 'Invalid format' }]);
            expect(parsed.retryable).toBe(false);
        });

        it('should handle missing error data', () => {
            const error = {
                response: {
                    status: 500,
                    data: null
                }
            };
            
            const parsed = errorHandler.parseError(error);
            
            expect(parsed.type).toBe('SERVER_ERROR');
            expect(parsed.message).toBe('Server error');
            expect(parsed.retryable).toBe(true);
        });
    });

    describe('Error Type Detection', () => {
        it('should correctly identify error types from status codes', () => {
            expect(errorHandler.getErrorTypeFromStatus(400)).toBe('VALIDATION_ERROR');
            expect(errorHandler.getErrorTypeFromStatus(401)).toBe('AUTHENTICATION_ERROR');
            expect(errorHandler.getErrorTypeFromStatus(403)).toBe('AUTHORIZATION_ERROR');
            expect(errorHandler.getErrorTypeFromStatus(404)).toBe('NOT_FOUND');
            expect(errorHandler.getErrorTypeFromStatus(429)).toBe('RATE_LIMIT');
            expect(errorHandler.getErrorTypeFromStatus(500)).toBe('SERVER_ERROR');
            expect(errorHandler.getErrorTypeFromStatus(418)).toBe('CLIENT_ERROR');
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors with retry', () => {
            const errorInfo = {
                type: 'NETWORK_ERROR',
                message: 'Network failed'
            };
            
            const result = errorHandler.handleNetworkError(errorInfo, {});
            
            expect(result.retry).toBe(true);
            expect(result.delay).toBe(5000);
            expect(window.app.showNotification).toHaveBeenCalledWith(
                'No internet connection. Please check your network.',
                'error',
                5000
            );
        });

        it('should handle validation errors without retry', () => {
            const errorInfo = {
                type: 'VALIDATION_ERROR',
                message: 'Invalid address',
                details: [
                    { message: 'Must be Bitcoin address' },
                    { message: 'Required field' }
                ]
            };
            
            const result = errorHandler.handleValidationError(errorInfo, {});
            
            expect(result.retry).toBe(false);
            expect(window.app.showNotification).toHaveBeenCalledWith(
                'Must be Bitcoin address, Required field',
                'error'
            );
        });

        it('should handle rate limit errors with delay', () => {
            const errorInfo = {
                type: 'RATE_LIMIT',
                details: { retryAfter: 30 }
            };
            
            const result = errorHandler.handleRateLimitError(errorInfo, {});
            
            expect(result.retry).toBe(true);
            expect(result.delay).toBe(30000);
            expect(window.app.showNotification).toHaveBeenCalledWith(
                'Rate limit exceeded. Please wait 30 seconds.',
                'warning',
                5000
            );
        });
    });

    describe('Retry Logic', () => {
        it('should execute function successfully without retry', async () => {
            const mockFn = vi.fn().mockResolvedValue('success');
            
            const result = await errorHandler.executeWithRetry(mockFn, '/api/test');
            
            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should retry on retryable errors', async () => {
            const mockFn = vi.fn()
                .mockRejectedValueOnce({
                    response: { status: 503, data: {} }
                })
                .mockResolvedValue('success');
            
            errorHandler.configureRetry('/api/test', {
                maxRetries: 2,
                initialDelay: 10
            });
            
            const result = await errorHandler.executeWithRetry(mockFn, '/api/test');
            
            expect(result).toBe('success');
            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        it('should not retry on non-retryable errors', async () => {
            const mockFn = vi.fn().mockRejectedValue({
                response: { 
                    status: 400, 
                    data: { error: { type: 'VALIDATION_ERROR' } }
                }
            });
            
            await expect(
                errorHandler.executeWithRetry(mockFn, '/api/test')
            ).rejects.toThrow();
            
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should respect max retries', async () => {
            const mockFn = vi.fn().mockRejectedValue({
                response: { status: 503, data: {} }
            });
            
            errorHandler.configureRetry('/api/test', {
                maxRetries: 3,
                initialDelay: 10
            });
            
            await expect(
                errorHandler.executeWithRetry(mockFn, '/api/test')
            ).rejects.toThrow();
            
            expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
        });

        it('should use exponential backoff', async () => {
            const delays = [];
            const originalSleep = errorHandler.sleep;
            
            errorHandler.sleep = vi.fn((ms) => {
                delays.push(ms);
                return Promise.resolve();
            });
            
            const mockFn = vi.fn()
                .mockRejectedValueOnce({ response: { status: 503 } })
                .mockRejectedValueOnce({ response: { status: 503 } })
                .mockResolvedValue('success');
            
            errorHandler.configureRetry('/api/test', {
                maxRetries: 3,
                backoff: 'exponential',
                initialDelay: 100,
                maxDelay: 1000
            });
            
            await errorHandler.executeWithRetry(mockFn, '/api/test');
            
            expect(delays[0]).toBe(100);
            expect(delays[1]).toBe(200);
            
            errorHandler.sleep = originalSleep;
        });
    });

    describe('Custom Error Handlers', () => {
        it('should use custom error handler when registered', () => {
            const customHandler = vi.fn().mockReturnValue({ handled: true });
            
            errorHandler.registerErrorHandler('CUSTOM_ERROR', customHandler);
            
            const result = errorHandler.handleError({
                response: {
                    status: 400,
                    data: { error: { type: 'CUSTOM_ERROR' } }
                }
            });
            
            expect(customHandler).toHaveBeenCalled();
        });
    });

    describe('Error Logging', () => {
        it('should log errors with context', () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: { message: 'Server error' } }
                }
            };
            
            errorHandler.handleError(error, { endpoint: '/api/test' });
            
            const log = errorHandler.getErrorLog();
            expect(log).toHaveLength(1);
            expect(log[0].error.type).toBe('SERVER_ERROR');
            expect(log[0].context.endpoint).toBe('/api/test');
        });

        it('should limit error log size', () => {
            errorHandler.maxLogSize = 5;
            
            for (let i = 0; i < 10; i++) {
                errorHandler.logError({ type: 'TEST' }, { index: i });
            }
            
            const log = errorHandler.getErrorLog();
            expect(log).toHaveLength(5);
            expect(log[0].context.index).toBe(5); // Oldest should be index 5
        });

        it('should clear error log', () => {
            errorHandler.logError({ type: 'TEST' }, {});
            expect(errorHandler.getErrorLog()).toHaveLength(1);
            
            errorHandler.clearErrorLog();
            expect(errorHandler.getErrorLog()).toHaveLength(0);
        });
    });

    describe('Retryable Detection', () => {
        it('should correctly identify retryable status codes', () => {
            expect(errorHandler.isRetryable(408)).toBe(true); // Timeout
            expect(errorHandler.isRetryable(429)).toBe(true); // Rate limit
            expect(errorHandler.isRetryable(500)).toBe(true); // Server error
            expect(errorHandler.isRetryable(502)).toBe(true); // Bad gateway
            expect(errorHandler.isRetryable(503)).toBe(true); // Service unavailable
            
            expect(errorHandler.isRetryable(400)).toBe(false); // Bad request
            expect(errorHandler.isRetryable(401)).toBe(false); // Unauthorized
            expect(errorHandler.isRetryable(404)).toBe(false); // Not found
        });
    });
});