/**
 * MOOSH Wallet - Logger Utility
 * Structured logging for API server
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = '\n' + JSON.stringify(meta, null, 2);
        }
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? format : consoleFormat
    })
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    transports.push(
        // Error log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    levels,
    format,
    transports,
    exitOnError: false
});

// Create HTTP request logger
export const httpLogger = winston.createLogger({
    level: 'http',
    format,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                })
            )
        })
    ]
});

// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Export logging middleware for Express
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    httpLogger.http(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        httpLogger.http(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });
    
    next();
};

// Helper functions for structured logging
export const logError = (message, error, meta = {}) => {
    logger.error(message, {
        error: error.message,
        stack: error.stack,
        ...meta
    });
};

export const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
};

export const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

export const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

// API-specific logging helpers
export const logApiCall = (service, method, endpoint, data = {}) => {
    logger.info(`API Call: ${service}`, {
        service,
        method,
        endpoint,
        ...data
    });
};

export const logApiError = (service, method, endpoint, error) => {
    logger.error(`API Error: ${service}`, {
        service,
        method,
        endpoint,
        error: error.message,
        code: error.code,
        statusCode: error.response?.status
    });
};

export const logTransaction = (type, txData) => {
    logger.info(`Transaction: ${type}`, {
        type,
        ...txData,
        timestamp: new Date().toISOString()
    });
};

export const logWalletOperation = (operation, walletData) => {
    logger.info(`Wallet Operation: ${operation}`, {
        operation,
        ...walletData,
        timestamp: new Date().toISOString()
    });
};