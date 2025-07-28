// @ts-check

/**
 * Example of using TypeScript definitions in JavaScript files
 * This file demonstrates various patterns for type-safe JavaScript development
 */

// Import types using JSDoc
/** @type {import('../types').MOOSHWalletApp} */
const app = window.app;

/**
 * Example 1: Using core types
 * @param {import('../types/modules/core').StateManager} state
 * @param {string} key
 * @param {any} value
 */
function updateState(state, key, value) {
    // IDE will show available methods: get, set, delete, has, clear, subscribe
    state.set(key, value);
    
    // Type checking prevents errors
    // state.set(); // Error: Expected 2 arguments, but got 0
}

/**
 * Example 2: Using component types
 * @returns {import('../types/modules/ui').Button}
 */
function createButton() {
    const button = new window.Button({
        text: 'Click me',
        variant: 'primary', // IDE shows: 'primary' | 'secondary' | 'danger' | 'success'
        onClick: (event) => {
            console.log('Button clicked');
        }
    });
    
    // Type-safe method calls
    button.setLoading(true);
    button.setText('Loading...');
    
    return button;
}

/**
 * Example 3: Using feature types
 * @param {import('../types/modules/features').SparkWallet} wallet
 * @param {import('../types/modules/features').SparkBalance} balance
 */
function displayWalletInfo(wallet, balance) {
    console.log(`Wallet: ${wallet.address}`);
    console.log(`Total balance: ${balance.total} sats`);
    console.log(`Lightning: ${balance.lightning} sats`);
    console.log(`On-chain: ${balance.onchain} sats`);
}

/**
 * Example 4: Using union types
 * @param {'success' | 'error' | 'warning' | 'info'} type
 * @param {string} message
 */
function showNotification(type, message) {
    app.showNotification(message, type, 5000);
}

/**
 * Example 5: Async functions with typed returns
 * @returns {Promise<import('../types/modules/features').SparkTransaction[]>}
 */
async function getRecentTransactions() {
    const response = await app.apiService.get('/api/spark/transactions', {
        limit: 10,
        orderBy: 'timestamp'
    });
    
    return response.data;
}

/**
 * Example 6: Event handlers with proper types
 * @param {MouseEvent} event
 */
function handleClick(event) {
    event.preventDefault();
    const target = /** @type {HTMLButtonElement} */ (event.target);
    console.log('Clicked:', target.textContent);
}

/**
 * Example 7: Complex type usage
 * @typedef {import('../types/modules/ui').TransactionFilter} TransactionFilter
 * @param {TransactionFilter} filter
 * @returns {import('../types/modules/ui').Transaction[]}
 */
function filterTransactions(filter) {
    const history = app.components.transactionHistory;
    return history.filterTransactions(filter);
}

/**
 * Example 8: Type guards
 * @param {any} value
 * @returns {value is import('../types/modules/features').SparkChannel}
 */
function isSparkChannel(value) {
    return value && 
           typeof value.id === 'string' &&
           typeof value.capacity === 'number' &&
           typeof value.localBalance === 'number';
}

/**
 * Example 9: Generic-like patterns
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
function getSettingWithDefault(key, defaultValue) {
    const value = app.settings.get(key);
    return value !== undefined ? value : defaultValue;
}

/**
 * Example 10: Class with types
 */
class WalletManager {
    /**
     * @param {import('../types').MOOSHWalletApp} app
     */
    constructor(app) {
        /** @type {import('../types').MOOSHWalletApp} */
        this.app = app;
        
        /** @type {Map<string, import('../types/modules/features').SparkWallet>} */
        this.wallets = new Map();
    }
    
    /**
     * @param {string} mnemonic
     * @returns {Promise<import('../types/modules/features').SparkGenerateResult>}
     */
    async createWallet(mnemonic) {
        const result = await this.app.apiService.post('/api/spark/generate-wallet', {
            mnemonic,
            strength: 256
        });
        
        return result.data;
    }
    
    /**
     * @param {string} address
     * @returns {import('../types/modules/features').SparkWallet | undefined}
     */
    getWallet(address) {
        return this.wallets.get(address);
    }
}

// Example usage
if (typeof window !== 'undefined' && window.app) {
    // All these calls are type-checked
    showNotification('success', 'Wallet loaded');
    
    const button = createButton();
    button.element?.addEventListener('click', handleClick);
    
    // Async example
    getRecentTransactions().then(transactions => {
        console.log(`Found ${transactions.length} transactions`);
    });
    
    // Settings example with type inference
    const theme = getSettingWithDefault('theme', 'dark');
    const timeout = getSettingWithDefault('autoLockTimeout', 300000);
}