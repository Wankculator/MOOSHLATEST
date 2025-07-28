/**
 * MOOSH Wallet - Validation Schemas
 * Input validation for API endpoints
 */

import Joi from 'joi';

// Custom validators
const bitcoinAddress = Joi.string().custom((value, helpers) => {
    // Bitcoin address validation patterns
    const patterns = [
        /^1[a-zA-Z0-9]{25,34}$/,        // Legacy
        /^3[a-zA-Z0-9]{25,34}$/,        // Nested SegWit
        /^bc1[a-z0-9]{39,59}$/,         // Native SegWit
        /^bc1p[a-z0-9]{58}$/,           // Taproot
        /^tb1[a-z0-9]{39,59}$/,         // Testnet SegWit
        /^[mn2][a-zA-Z0-9]{25,34}$/     // Testnet Legacy
    ];
    
    if (!patterns.some(pattern => pattern.test(value))) {
        return helpers.error('any.invalid');
    }
    
    return value;
}).messages({
    'any.invalid': 'Invalid Bitcoin address format'
});

const mnemonic = Joi.string().custom((value, helpers) => {
    const words = value.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
        return helpers.error('any.invalid');
    }
    return value;
}).messages({
    'any.invalid': 'Mnemonic must be 12 or 24 words'
});

// Schema definitions
export const schemas = {
    // Wallet generation
    generateWallet: Joi.object({
        wordCount: Joi.number().valid(12, 24).default(12),
        network: Joi.string().valid('MAINNET', 'TESTNET').default('MAINNET'),
        strength: Joi.number().valid(128, 256).optional()
    }),

    // Spark wallet generation
    generateSparkWallet: Joi.object({
        strength: Joi.number().valid(128, 256).default(128)
    }),

    // Wallet import
    importWallet: Joi.object({
        mnemonic: Joi.alternatives().try(
            mnemonic,
            Joi.array().items(Joi.string()).length(12),
            Joi.array().items(Joi.string()).length(24)
        ).required(),
        network: Joi.string().valid('MAINNET', 'TESTNET').default('MAINNET'),
        walletType: Joi.string().valid('standard', 'spark').optional()
    }),

    // Spark wallet import
    importSparkWallet: Joi.object({
        mnemonic: Joi.alternatives().try(
            mnemonic,
            Joi.array().items(Joi.string()).length(12),
            Joi.array().items(Joi.string()).length(24)
        ).required()
    }),

    // Address validation
    validateAddress: Joi.object({
        address: bitcoinAddress.required(),
        network: Joi.string().valid('MAINNET', 'TESTNET').default('MAINNET')
    }),

    // Balance query
    getBalance: Joi.object({
        address: bitcoinAddress.required(),
        includeUnconfirmed: Joi.boolean().default(true)
    }),

    // Transaction query
    getTransactions: Joi.object({
        address: bitcoinAddress.required(),
        limit: Joi.number().min(1).max(100).default(20),
        offset: Joi.number().min(0).default(0)
    }),

    // Send transaction
    sendTransaction: Joi.object({
        from: bitcoinAddress.required(),
        to: bitcoinAddress.required(),
        amount: Joi.number().positive().required(),
        fee: Joi.number().positive().optional(),
        feeRate: Joi.string().valid('slow', 'medium', 'fast').default('medium'),
        privateKey: Joi.string().required(),
        message: Joi.string().max(80).optional()
    }),

    // UTXO query
    getUTXOs: Joi.object({
        address: bitcoinAddress.required(),
        minConfirmations: Joi.number().min(0).default(1)
    }),

    // Fee estimation
    estimateFee: Joi.object({
        blocks: Joi.number().min(1).max(25).default(6),
        priority: Joi.string().valid('low', 'medium', 'high').default('medium')
    }),

    // Ordinals query
    getOrdinals: Joi.object({
        address: bitcoinAddress.required(),
        limit: Joi.number().min(1).max(100).default(20),
        offset: Joi.number().min(0).default(0)
    }),

    // Inscription creation
    createInscription: Joi.object({
        address: bitcoinAddress.required(),
        content: Joi.string().required(),
        contentType: Joi.string().valid('text/plain', 'image/png', 'image/jpeg', 'application/json').required(),
        fee: Joi.number().positive().optional(),
        privateKey: Joi.string().required()
    }),

    // Multi-signature wallet creation
    createMultisig: Joi.object({
        publicKeys: Joi.array().items(Joi.string()).min(2).max(15).required(),
        requiredSignatures: Joi.number().min(1).required(),
        network: Joi.string().valid('MAINNET', 'TESTNET').default('MAINNET')
    }),

    // Price data query
    getPriceData: Joi.object({
        currency: Joi.string().valid('usd', 'eur', 'gbp', 'jpy', 'cad', 'aud').default('usd'),
        includeChange: Joi.boolean().default(true)
    }),

    // Backup wallet
    backupWallet: Joi.object({
        walletId: Joi.string().required(),
        password: Joi.string().min(8).required(),
        includePrivateKeys: Joi.boolean().default(false)
    }),

    // Restore wallet
    restoreWallet: Joi.object({
        backup: Joi.string().required(),
        password: Joi.string().required()
    })
};

// Validation error formatter
export const formatValidationError = (error) => {
    return error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
    }));
};

// Create validation middleware
export const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        
        if (!schema) {
            return next(new Error(`Validation schema '${schemaName}' not found`));
        }
        
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    type: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: formatValidationError(error)
                }
            });
        }
        
        // Replace request body with validated value
        req.body = value;
        next();
    };
};