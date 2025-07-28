// MOOSH WALLET - API Error Handler Module
// Client-side error handling for API calls
// Provides consistent error handling and user feedback

(function(window) {
    'use strict';

    class ApiErrorHandler {
        constructor() {
            this.errorCallbacks = new Map();
            this.retryConfigs = new Map();
            this.errorLog = [];
            this.maxLogSize = 100;
        }

        /**
         * Handle API errors with appropriate user feedback
         */
        handleError(error, context = {}) {
            const errorInfo = this.parseError(error);
            this.logError(errorInfo, context);

            // Check for specific error handlers
            if (this.errorCallbacks.has(errorInfo.type)) {
                return this.errorCallbacks.get(errorInfo.type)(errorInfo, context);
            }

            // Default error handling
            switch (errorInfo.type) {
                case 'NETWORK_ERROR':
                    return this.handleNetworkError(errorInfo, context);
                
                case 'VALIDATION_ERROR':
                    return this.handleValidationError(errorInfo, context);
                
                case 'AUTHENTICATION_ERROR':
                    return this.handleAuthError(errorInfo, context);
                
                case 'RATE_LIMIT':
                    return this.handleRateLimitError(errorInfo, context);
                
                case 'TIMEOUT_ERROR':
                    return this.handleTimeoutError(errorInfo, context);
                
                case 'SERVER_ERROR':
                    return this.handleServerError(errorInfo, context);
                
                default:
                    return this.handleGenericError(errorInfo, context);
            }
        }

        /**
         * Parse error response into structured format
         */
        parseError(error) {
            // Network errors (no response)
            if (!error.response) {
                return {
                    type: 'NETWORK_ERROR',
                    message: 'Network connection failed',
                    details: error.message,
                    code: 'NETWORK_FAILURE',
                    retryable: true
                };
            }

            const { status, data } = error.response;

            // Parse API error response
            if (data && data.error) {
                return {
                    type: data.error.type || this.getErrorTypeFromStatus(status),
                    message: data.error.message || 'An error occurred',
                    details: data.error.details || null,
                    code: data.error.code || status,
                    correlationId: data.error.correlationId,
                    retryable: this.isRetryable(status)
                };
            }

            // Fallback parsing
            return {
                type: this.getErrorTypeFromStatus(status),
                message: this.getDefaultMessage(status),
                code: status,
                retryable: this.isRetryable(status)
            };
        }

        /**
         * Get error type from HTTP status code
         */
        getErrorTypeFromStatus(status) {
            if (status >= 400 && status < 500) {
                switch (status) {
                    case 400: return 'VALIDATION_ERROR';
                    case 401: return 'AUTHENTICATION_ERROR';
                    case 403: return 'AUTHORIZATION_ERROR';
                    case 404: return 'NOT_FOUND';
                    case 409: return 'CONFLICT';
                    case 429: return 'RATE_LIMIT';
                    default: return 'CLIENT_ERROR';
                }
            } else if (status >= 500) {
                return 'SERVER_ERROR';
            }
            return 'UNKNOWN_ERROR';
        }

        /**
         * Get default error message based on status
         */
        getDefaultMessage(status) {
            const messages = {
                400: 'Invalid request',
                401: 'Authentication required',
                403: 'Access denied',
                404: 'Resource not found',
                409: 'Conflict with existing data',
                429: 'Too many requests',
                500: 'Server error',
                502: 'Service temporarily unavailable',
                503: 'Service maintenance',
                504: 'Request timeout'
            };
            return messages[status] || 'An unexpected error occurred';
        }

        /**
         * Check if error is retryable
         */
        isRetryable(status) {
            return status === 408 || status === 429 || status >= 500;
        }

        /**
         * Handle network errors
         */
        handleNetworkError(errorInfo, context) {
            if (window.app) {
                window.app.showNotification(
                    'No internet connection. Please check your network.',
                    'error',
                    5000
                );
            }
            return { retry: true, delay: 5000 };
        }

        /**
         * Handle validation errors
         */
        handleValidationError(errorInfo, context) {
            let message = errorInfo.message;
            
            if (errorInfo.details && Array.isArray(errorInfo.details)) {
                message = errorInfo.details.map(d => d.message).join(', ');
            }
            
            if (window.app) {
                window.app.showNotification(message, 'error');
            }
            return { retry: false };
        }

        /**
         * Handle authentication errors
         */
        handleAuthError(errorInfo, context) {
            if (window.app) {
                window.app.showNotification(
                    'Authentication required. Please log in.',
                    'error'
                );
                // Could redirect to login if needed
            }
            return { retry: false };
        }

        /**
         * Handle rate limit errors
         */
        handleRateLimitError(errorInfo, context) {
            const retryAfter = errorInfo.details?.retryAfter || 60;
            
            if (window.app) {
                window.app.showNotification(
                    `Rate limit exceeded. Please wait ${retryAfter} seconds.`,
                    'warning',
                    5000
                );
            }
            return { retry: true, delay: retryAfter * 1000 };
        }

        /**
         * Handle timeout errors
         */
        handleTimeoutError(errorInfo, context) {
            if (window.app) {
                window.app.showNotification(
                    'Request timed out. Retrying...',
                    'warning'
                );
            }
            return { retry: true, delay: 3000 };
        }

        /**
         * Handle server errors
         */
        handleServerError(errorInfo, context) {
            if (window.app) {
                window.app.showNotification(
                    'Server error. We\'re working on it.',
                    'error'
                );
            }
            return { retry: true, delay: 10000 };
        }

        /**
         * Handle generic errors
         */
        handleGenericError(errorInfo, context) {
            if (window.app) {
                window.app.showNotification(
                    errorInfo.message || 'An error occurred',
                    'error'
                );
            }
            return { retry: false };
        }

        /**
         * Register custom error handler
         */
        registerErrorHandler(errorType, handler) {
            this.errorCallbacks.set(errorType, handler);
        }

        /**
         * Configure retry behavior
         */
        configureRetry(endpoint, config) {
            this.retryConfigs.set(endpoint, {
                maxRetries: config.maxRetries || 3,
                backoff: config.backoff || 'exponential',
                initialDelay: config.initialDelay || 1000,
                maxDelay: config.maxDelay || 30000
            });
        }

        /**
         * Execute with retry logic
         */
        async executeWithRetry(fn, endpoint, context = {}) {
            const config = this.retryConfigs.get(endpoint) || {
                maxRetries: 3,
                backoff: 'exponential',
                initialDelay: 1000,
                maxDelay: 30000
            };

            let lastError;
            let delay = config.initialDelay;

            for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    lastError = error;
                    const errorInfo = this.parseError(error);
                    
                    if (!errorInfo.retryable || attempt === config.maxRetries) {
                        throw error;
                    }

                    // Calculate delay
                    if (config.backoff === 'exponential') {
                        delay = Math.min(delay * 2, config.maxDelay);
                    }

                    ComplianceUtils.log('ApiErrorHandler', 
                        `Retry attempt ${attempt + 1} for ${endpoint} after ${delay}ms`
                    );

                    await this.sleep(delay);
                }
            }

            throw lastError;
        }

        /**
         * Sleep helper
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * Log error for debugging
         */
        logError(errorInfo, context) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                error: errorInfo,
                context,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            this.errorLog.push(logEntry);

            // Limit log size
            if (this.errorLog.length > this.maxLogSize) {
                this.errorLog.shift();
            }

            // Log to console in development
            if (window.location.hostname === 'localhost') {
                console.error('API Error:', logEntry);
            }
        }

        /**
         * Get error log
         */
        getErrorLog() {
            return [...this.errorLog];
        }

        /**
         * Clear error log
         */
        clearErrorLog() {
            this.errorLog = [];
        }

        /**
         * Export error log
         */
        exportErrorLog() {
            const data = JSON.stringify(this.errorLog, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `moosh-wallet-errors-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
        }
    }

    // Make available globally
    window.ApiErrorHandler = ApiErrorHandler;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ApiErrorHandler = ApiErrorHandler;
    }

})(window);