/**
 * MOOSH Wallet - Error Handling Middleware
 * Comprehensive error handling for all API endpoints
 */

import { logger } from '../utils/logger.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error types enumeration
 */
export const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RATE_LIMIT: 'RATE_LIMIT',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

/**
 * Error messages
 */
export const ErrorMessages = {
    INVALID_MNEMONIC: 'Invalid mnemonic phrase provided',
    INVALID_ADDRESS: 'Invalid Bitcoin address format',
    INVALID_AMOUNT: 'Invalid amount specified',
    INSUFFICIENT_BALANCE: 'Insufficient balance for transaction',
    WALLET_NOT_FOUND: 'Wallet not found',
    TRANSACTION_FAILED: 'Transaction failed to broadcast',
    RATE_LIMITED: 'Too many requests. Please try again later',
    SERVICE_UNAVAILABLE: 'External service temporarily unavailable',
    INTERNAL_ERROR: 'An internal error occurred. Please try again',
    TIMEOUT: 'Request timed out. Please try again'
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 */
export const handleValidationError = (error) => {
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        return new ApiError(400, 'Validation failed', errors);
    }
    return error;
};

/**
 * External service error handler
 */
export const handleExternalServiceError = (error, serviceName) => {
    logger.error(`External service error from ${serviceName}:`, error);
    
    if (error.code === 'ECONNREFUSED') {
        return new ApiError(503, ErrorMessages.SERVICE_UNAVAILABLE, {
            service: serviceName,
            retryAfter: 60
        });
    }
    
    if (error.code === 'ETIMEDOUT') {
        return new ApiError(504, ErrorMessages.TIMEOUT, {
            service: serviceName
        });
    }
    
    return new ApiError(502, 'External service error', {
        service: serviceName,
        message: error.message
    });
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = err;
    
    // Log error details
    logger.error('API Error:', {
        method: req.method,
        path: req.path,
        error: err.message,
        stack: err.stack,
        body: req.body,
        query: req.query,
        ip: req.ip
    });
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    } else if (err.name === 'CastError') {
        error = new ApiError(400, 'Invalid ID format');
    } else if (err.code === 11000) {
        error = new ApiError(409, 'Duplicate entry');
    } else if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token');
    } else if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired');
    }
    
    // Default to 500 server error
    if (!(error instanceof ApiError)) {
        error = new ApiError(
            error.statusCode || 500,
            error.message || ErrorMessages.INTERNAL_ERROR
        );
    }
    
    // Send error response
    res.status(error.statusCode).json({
        success: false,
        error: {
            type: error.type || ErrorTypes.INTERNAL_ERROR,
            message: error.message,
            details: error.details,
            timestamp: error.timestamp,
            correlationId: req.id || generateCorrelationId()
        },
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Resource not found: ${req.originalUrl}`);
    next(error);
};

/**
 * Generate correlation ID for request tracking
 */
function generateCorrelationId() {
    return `moosh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Rate limiting error handler
 */
export const rateLimitHandler = (req, res) => {
    res.status(429).json({
        success: false,
        error: {
            type: ErrorTypes.RATE_LIMIT,
            message: ErrorMessages.RATE_LIMITED,
            retryAfter: req.rateLimit.resetTime
        }
    });
};

/**
 * Request timeout handler
 */
export const timeoutHandler = (req, res, next) => {
    res.status(504).json({
        success: false,
        error: {
            type: ErrorTypes.TIMEOUT_ERROR,
            message: ErrorMessages.TIMEOUT
        }
    });
};

/**
 * Validation middleware factory
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            
            return next(new ApiError(400, 'Validation failed', errors));
        }
        
        next();
    };
};