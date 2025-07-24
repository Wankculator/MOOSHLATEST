/**
 * Constants Module
 * Application-wide constants and configuration
 */

// API Endpoints
export const API_ENDPOINTS = {
    BASE_URL: `${window.location.protocol}//${window.location.hostname}:3001`,
    BITCOIN: {
        BALANCE: '/api/bitcoin/balance',
        TRANSACTIONS: '/api/bitcoin/transactions',
        BROADCAST: '/api/bitcoin/broadcast',
        PRICE: '/api/proxy/bitcoin-price'
    },
    SPARK: {
        GENERATE: '/api/spark/generate-wallet',
        IMPORT: '/api/spark/import-wallet',
        BALANCE: '/api/spark/balance'
    },
    ORDINALS: {
        LIST: '/api/ordinals',
        INSCRIPTION: '/api/ordinals/inscription'
    },
    SESSION: {
        CHECK: '/api/session/check',
        CREATE: '/api/session/create',
        DESTROY: '/api/session/destroy'
    }
};

// Wallet Configuration
export const WALLET_CONFIG = {
    MAX_WALLETS: 8,
    MNEMONIC_LENGTHS: [12, 24],
    DEFAULT_WORD_COUNT: 12,
    GENERATION_TIMEOUT: 120000, // 2 minutes
    BALANCE_REFRESH_INTERVAL: 60000, // 1 minute
    TRANSACTION_REFRESH_INTERVAL: 30000, // 30 seconds
    SESSION_TIMEOUT: 900000 // 15 minutes
};

// UI Configuration
export const UI_CONFIG = {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    MODAL_SIZES: ['small', 'medium', 'large', 'fullscreen'],
    BUTTON_VARIANTS: ['primary', 'secondary', 'success', 'danger', 'warning'],
    BUTTON_SIZES: ['small', 'medium', 'large'],
    THEME_OPTIONS: ['dark', 'light', 'auto']
};

// Network Configuration
export const NETWORK_CONFIG = {
    MAINNET: {
        name: 'Bitcoin Mainnet',
        symbol: 'BTC',
        explorer: 'https://mempool.space',
        bech32: 'bc'
    },
    TESTNET: {
        name: 'Bitcoin Testnet',
        symbol: 'tBTC',
        explorer: 'https://mempool.space/testnet',
        bech32: 'tb'
    }
};

// Bitcoin Address Types
export const ADDRESS_TYPES = {
    LEGACY: {
        name: 'Legacy (P2PKH)',
        pattern: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    NESTED_SEGWIT: {
        name: 'Nested SegWit (P2SH)',
        pattern: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        example: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'
    },
    NATIVE_SEGWIT: {
        name: 'Native SegWit (Bech32)',
        pattern: /^bc1[a-z0-9]{39,59}$/,
        example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    },
    TAPROOT: {
        name: 'Taproot (Bech32m)',
        pattern: /^bc1p[a-z0-9]{58,62}$/,
        example: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'
    }
};

// Transaction Types
export const TRANSACTION_TYPES = {
    SEND: 'send',
    RECEIVE: 'receive',
    SWAP: 'swap',
    ORDINAL_TRANSFER: 'ordinal_transfer',
    LIGHTNING_OPEN: 'lightning_open',
    LIGHTNING_CLOSE: 'lightning_close'
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    INVALID_MNEMONIC: 'Invalid seed phrase. Please check and try again.',
    INVALID_ADDRESS: 'Invalid Bitcoin address format.',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
    WALLET_GENERATION_FAILED: 'Failed to generate wallet. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please unlock your wallet.',
    MAX_WALLETS_REACHED: 'Maximum wallet limit reached.',
    TRANSACTION_FAILED: 'Transaction failed. Please try again.',
    API_ERROR: 'Server error. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    WALLET_CREATED: 'Wallet created successfully!',
    WALLET_IMPORTED: 'Wallet imported successfully!',
    TRANSACTION_SENT: 'Transaction sent successfully!',
    ADDRESS_COPIED: 'Address copied to clipboard!',
    SEED_COPIED: 'Seed phrase copied to clipboard!',
    BACKUP_CREATED: 'Backup created successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    THEME: 'moosh_theme',
    LANGUAGE: 'moosh_language',
    CURRENCY: 'moosh_currency',
    NETWORK: 'moosh_network',
    LAST_ACTIVE: 'moosh_last_active',
    WALLET_METADATA: 'moosh_wallet_metadata'
};

// Regex Patterns
export const REGEX_PATTERNS = {
    BITCOIN_ADDRESS: /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,62}|tb1[a-z0-9]{39,62})$/,
    SPARK_ADDRESS: /^sp1[a-z0-9]{40,80}$/,
    TRANSACTION_ID: /^[a-f0-9]{64}$/,
    AMOUNT: /^\d*\.?\d{0,8}$/,
    URL: /^https?:\/\/.+/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Currency Options
export const CURRENCY_OPTIONS = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
];

// Language Options
export const LANGUAGE_OPTIONS = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' }
];

// Fee Levels
export const FEE_LEVELS = {
    LOW: { name: 'Low', description: '~60 minutes', multiplier: 0.5 },
    MEDIUM: { name: 'Medium', description: '~30 minutes', multiplier: 1 },
    HIGH: { name: 'High', description: '~10 minutes', multiplier: 1.5 },
    CUSTOM: { name: 'Custom', description: 'Set manually', multiplier: 1 }
};

// QR Code Configuration
export const QR_CONFIG = {
    SIZE: 256,
    MARGIN: 4,
    ERROR_CORRECTION: 'M',
    COLORS: {
        DARK: '#000000',
        LIGHT: '#FFFFFF'
    }
};

// Animation Easings
export const EASINGS = {
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// Breakpoints
export const BREAKPOINTS = {
    XS: 320,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536
};

// Z-Index Layers
export const Z_INDEX = {
    DROPDOWN: 1000,
    MODAL_BACKDROP: 2000,
    MODAL: 2001,
    TOAST: 3000,
    TOOLTIP: 4000
};

// Export all constants
export default {
    API_ENDPOINTS,
    WALLET_CONFIG,
    UI_CONFIG,
    NETWORK_CONFIG,
    ADDRESS_TYPES,
    TRANSACTION_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    STORAGE_KEYS,
    REGEX_PATTERNS,
    CURRENCY_OPTIONS,
    LANGUAGE_OPTIONS,
    FEE_LEVELS,
    QR_CONFIG,
    EASINGS,
    BREAKPOINTS,
    Z_INDEX
};