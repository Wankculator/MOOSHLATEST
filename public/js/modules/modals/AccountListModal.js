/**
 * AccountListModal Module
 * 
 * Advanced account management with grid view, filtering, sorting, and currency conversion.
 * Phase 1 of the multi-account management system.
 * 
 * Dependencies:
 * - ElementFactory ($)
 * - ComplianceUtils
 * - ResponsiveUtils
 * - State management (app.state)
 */

(function(window) {
    'use strict';

    // Import dependencies from window
    const $ = window.ElementFactory || window.$;
    const ComplianceUtils = window.ComplianceUtils;
    const ResponsiveUtils = window.ResponsiveUtils;    class AccountListModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.searchQuery = '';
            this.selectedAccounts = new Set();
            
            // Balance tracking
            this.balanceLoading = new Map();
            this.lastBalanceUpdate = new Map();
            this.editingAccountId = null;
            this.sortBy = 'name'; // name, date, balance, activity
            this.sortOrder = 'asc'; // asc, desc
            this.balanceCache = new Map();
            this.btcPrice = 0;
            
            // Multi-currency support
            this.selectedCurrency = 'usd'; // Default to USD
            this.currencyPrices = new Map(); // Cache for all currency prices
            this.supportedCurrencies = [
                { code: 'usd', symbol: '$', name: 'US Dollar' },
                { code: 'eur', symbol: '€', name: 'Euro' },
                { code: 'gbp', symbol: '£', name: 'British Pound' },
                { code: 'jpy', symbol: '¥', name: 'Japanese Yen' },
                { code: 'cny', symbol: '¥', name: 'Chinese Yuan' },
                { code: 'cad', symbol: 'C$', name: 'Canadian Dollar' },
                { code: 'aud', symbol: 'A$', name: 'Australian Dollar' },
                { code: 'chf', symbol: 'Fr', name: 'Swiss Franc' },
                { code: 'inr', symbol: '₹', name: 'Indian Rupee' },
                { code: 'krw', symbol: '₩', name: 'South Korean Won' },
                { code: 'brl', symbol: 'R$', name: 'Brazilian Real' },
                { code: 'mxn', symbol: 'Mex$', name: 'Mexican Peso' },
                { code: 'rub', symbol: '₽', name: 'Russian Ruble' },
                { code: 'zar', symbol: 'R', name: 'South African Rand' },
                { code: 'aed', symbol: 'د.إ', name: 'UAE Dirham' },
                { code: 'sgd', symbol: 'S$', name: 'Singapore Dollar' },
                { code: 'hkd', symbol: 'HK$', name: 'Hong Kong Dollar' },
                { code: 'nzd', symbol: 'NZ$', name: 'New Zealand Dollar' },
                { code: 'sek', symbol: 'kr', name: 'Swedish Krona' },
                { code: 'nok', symbol: 'kr', name: 'Norwegian Krone' },
                { code: 'try', symbol: '₺', name: 'Turkish Lira' },
                { code: 'thb', symbol: '฿', name: 'Thai Baht' },
                { code: 'pln', symbol: 'zł', name: 'Polish Złoty' },
                { code: 'php', symbol: '₱', name: 'Philippine Peso' },
                { code: 'idr', symbol: 'Rp', name: 'Indonesian Rupiah' }
            ];
            
            // Load saved currency preference
            const savedCurrency = localStorage.getItem('mooshPreferredCurrency');
            if (savedCurrency && this.supportedCurrencies.find(c => c.code === savedCurrency)) {
                this.selectedCurrency = savedCurrency;
            }
            
            // View modes
            this.viewMode = 'grid'; // grid, list, details
            this.groupBy = 'none'; // none, balance, type, activity
            this.showFilters = false;
            this.filters = {
                balance: 'all', // all, empty, low, medium, high
                activity: 'all', // all, active, inactive
                type: 'all' // all, hd, imported
            };
        }
        
        // Theme helper method
        getThemeColor(variant = 'primary') {
            const isMooshMode = document.body.classList.contains('moosh-mode');
            if (variant === 'hover') {
                return isMooshMode ? '#7fffb3' : '#ff8c42';
            }
            return isMooshMode ? '#69fd97' : '#f57315';
        }
        
        // Balance fetching methods
        async fetchBTCPrice() {
            try {
                // Fetch prices for all major currencies at once
                const currencies = this.supportedCurrencies.map(c => c.code).join(',');
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencies}`);
                const data = await response.json();
                
                // Store all currency prices
                if (data.bitcoin) {
                    for (const [currency, price] of Object.entries(data.bitcoin)) {
                        this.currencyPrices.set(currency, price);
                    }
                }
                
                // Keep backward compatibility
                this.btcPrice = this.currencyPrices.get('usd') || 40000;
                
                ComplianceUtils.log('AccountListModal', `BTC Prices fetched for ${this.currencyPrices.size} currencies`);
                return this.currencyPrices.get(this.selectedCurrency) || this.btcPrice;
            } catch (error) {
                console.error('[AccountListModal] Failed to fetch BTC prices:', error);
                // Fallback prices
                this.currencyPrices.set('usd', 40000);
                this.currencyPrices.set('eur', 37000);
                this.currencyPrices.set('gbp', 32000);
                this.btcPrice = 40000;
                return this.btcPrice;
            }
        }
        
        async refreshAccountBalance(account) {
            if (this.balanceLoading.get(account.id)) {
                ComplianceUtils.log('AccountListModal', `Balance already loading for ${account.name}`);
                return;
            }
            
            this.balanceLoading.set(account.id, true);
            const btcElement = document.querySelector(`.balance-btc-${account.id}`);
            const usdElement = document.querySelector(`.balance-usd-${account.id}`);
            
            if (btcElement) {
                btcElement.textContent = 'Refreshing...';
                btcElement.style.color = '#faa307';
            }
            
            try {
                // Fetch BTC price if not already fetched
                if (!this.btcPrice || Date.now() - (this.lastPriceUpdate || 0) > 60000) {
                    await this.fetchBTCPrice();
                    this.lastPriceUpdate = Date.now();
                }
                
                // Get the primary address for balance checking
                const address = account.addresses?.segwit || 
                              account.addresses?.bech32 || 
                              account.addresses?.bitcoin || 
                              account.addresses?.taproot;
                
                if (!address) {
                    throw new Error('No valid address found');
                }
                
                // Fetch balance from API
                const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
                const satoshis = await response.text();
                const btcBalance = parseInt(satoshis) / 100000000;
                
                // Get current currency info
                const currencyInfo = this.supportedCurrencies.find(c => c.code === this.selectedCurrency) || 
                                   { code: 'usd', symbol: '$', name: 'US Dollar' };
                const currencyPrice = this.currencyPrices.get(this.selectedCurrency) || this.btcPrice;
                
                // Update cache with all currency values
                const cacheData = {
                    btc: btcBalance,
                    timestamp: Date.now()
                };
                
                // Add all currency values to cache
                for (const [currency, price] of this.currencyPrices.entries()) {
                    cacheData[currency] = btcBalance * price;
                }
                
                this.balanceCache.set(account.id, cacheData);
                
                // Update UI
                if (btcElement) {
                    btcElement.textContent = `${btcBalance.toFixed(8)} BTC`;
                    btcElement.style.color = '#f57315';
                }
                
                if (usdElement && currencyPrice) {
                    const fiatValue = btcBalance * currencyPrice;
                    const displayValue = this.formatCurrencyValue(fiatValue, this.selectedCurrency);
                    usdElement.textContent = `${currencyInfo.symbol}${displayValue} ${currencyInfo.code.toUpperCase()}`;
                }
                
                this.lastBalanceUpdate.set(account.id, Date.now());
                ComplianceUtils.log('AccountListModal', `Balance updated for ${account.name}: ${btcBalance} BTC`);
                
            } catch (error) {
                console.error(`[AccountListModal] Failed to fetch balance for ${account.name}:`, error);
                
                if (btcElement) {
                    btcElement.textContent = 'Error loading';
                    btcElement.style.color = '#ff4444';
                }
                
                if (usdElement) {
                    usdElement.textContent = 'Unable to fetch price';
                }
            } finally {
                this.balanceLoading.set(account.id, false);
            }
        }
        
        formatCurrencyValue(value, currency) {
            // Format based on currency - some need no decimals (JPY, KRW), others need 2
            const noDecimalCurrencies = ['jpy', 'krw', 'idr', 'vnd'];
            
            if (noDecimalCurrencies.includes(currency)) {
                return Math.round(value).toLocaleString();
            }
            
            return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        changeCurrency(newCurrency) {
            this.selectedCurrency = newCurrency;
            localStorage.setItem('mooshPreferredCurrency', newCurrency);
            
            // Get the price for the new currency
            const currencyPrice = this.currencyPrices.get(newCurrency);
            if (!currencyPrice) {
                console.warn(`[AccountListModal] No price data for ${newCurrency}`);
                return;
            }
            
            // Update all displayed balances
            const accounts = this.app.state.get('accounts') || [];
            accounts.forEach(account => {
                const cached = this.balanceCache.get(account.id);
                if (cached && cached.btc !== undefined) {
                    // Calculate the value in the new currency
                    const fiatValue = cached.btc * currencyPrice;
                    this.updateBalanceDisplay(account.id, cached.btc, fiatValue);
                }
            });
            
            // Update currency selector if it exists
            const selector = document.getElementById('currency-selector');
            if (selector) {
                selector.value = newCurrency;
            }
            
            ComplianceUtils.log('AccountListModal', `Currency changed to ${newCurrency.toUpperCase()}`);
        }
        
        updateBalanceDisplay(accountId, btcBalance, fiatValue) {
            const btcElement = document.querySelector(`.balance-btc-${accountId}`);
            const fiatElement = document.querySelector(`.balance-usd-${accountId}`);
            
            if (btcElement) {
                btcElement.textContent = `${btcBalance.toFixed(8)} BTC`;
            }
            
            if (fiatElement) {
                const currencyInfo = this.supportedCurrencies.find(c => c.code === this.selectedCurrency) || 
                                   { code: 'usd', symbol: '$', name: 'US Dollar' };
                const displayValue = this.formatCurrencyValue(fiatValue, this.selectedCurrency);
                fiatElement.textContent = `${currencyInfo.symbol}${displayValue} ${currencyInfo.code.toUpperCase()}`;
                
                // Debug log
                console.log(`[AccountListModal] Updated balance for ${accountId}: ${btcBalance} BTC = ${currencyInfo.symbol}${displayValue} ${currencyInfo.code.toUpperCase()}`);
            }
        }
        
        async loadAllBalances() {
            const accounts = this.app.state.get('accounts') || [];
            
            // First fetch BTC price
            await this.fetchBTCPrice();
            
            // Then fetch all account balances in parallel with rate limiting
            const batchSize = 3; // Process 3 accounts at a time
            for (let i = 0; i < accounts.length; i += batchSize) {
                const batch = accounts.slice(i, i + batchSize);
                await Promise.all(batch.map(account => this.refreshAccountBalance(account)));
                
                // Small delay between batches to avoid rate limiting
                if (i + batchSize < accounts.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        show() {
            ComplianceUtils.log('AccountListModal', 'Opening account management interface');
            
            // Set up account update listener
            this.accountUpdateHandler = () => {
                ComplianceUtils.log('AccountListModal', 'Accounts updated, refreshing display');
                if (this.modal) {
                    this.updateAccountGrid();
                }
            };
            this.app.state.on('accounts', this.accountUpdateHandler);
            
            // Add scrollbar styles for AccountListModal
            // Remove old styles if they exist to refresh theme colors
            const existingScrollbarStyles = document.getElementById('account-list-modal-scrollbar-styles');
            if (existingScrollbarStyles) {
                existingScrollbarStyles.remove();
            }
            
            // Check theme and set colors
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const primaryColor = isMooshMode ? '#69fd97' : '#f57315';
            const hoverColor = isMooshMode ? '#7fffb3' : '#ff8c42';
            
            const style = document.createElement('style');
            style.id = 'account-list-modal-scrollbar-styles';
            style.textContent = `
                /* AccountListModal Scrollbar Styles */
                .account-grid::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .account-grid::-webkit-scrollbar-track {
                    background: #000000;
                    border: 1px solid #333333;
                }
                
                .account-grid::-webkit-scrollbar-thumb {
                    background: ${primaryColor};
                    border-radius: 0;
                }
                
                /* Drag and Drop Styles */
                .account-card {
                    transition: all 0.2s ease;
                }
                
                .account-card.dragging {
                    opacity: 0.5;
                    transform: scale(0.95);
                    cursor: grabbing !important;
                }
                
                .account-card:not(.dragging):hover {
                    cursor: grab;
                }
                
                .drop-indicator {
                    position: absolute;
                    width: 100%;
                    height: 3px;
                    background: ${primaryColor};
                    left: 0;
                    pointer-events: none;
                    z-index: 1000;
                    animation: pulse-glow 0.5s ease-in-out infinite;
                }
                
                @keyframes pulse-glow {
                    0% { opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { opacity: 0.8; }
                }
                }
                
                .account-grid::-webkit-scrollbar-thumb:hover {
                    background: ${hoverColor};
                }
                
                /* Firefox Scrollbar */
                .account-grid {
                    scrollbar-width: thin;
                    scrollbar-color: ${primaryColor} #000000;
                }
            `;
            document.head.appendChild(style);
            
            // Clean up any existing modal
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
                this.modal = null;
            }
            
            // Initialize balance cache
            this.balanceCache = new Map();
            this.btcPrice = 0;
            
            const $ = window.ElementFactory || ElementFactory;
            const accounts = this.app.state.get('accounts') || [];
            const currentAccountId = this.app.state.get('currentAccountId');
            
            this.modal = $.div({
                className: 'modal-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10000'
                },
                onclick: (e) => {
                    if (e.target === this.modal) this.close();
                }
            }, [
                $.div({
                    className: 'account-list-modal terminal-box',
                    style: {
                        background: 'var(--bg-primary)',
                        border: `2px solid ${this.getThemeColor()}`,
                        borderRadius: '0',
                        width: '90%',
                        maxWidth: '900px',
                        height: '90vh',
                        maxHeight: '800px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }
                }, [
                    this.createHeader(),
                    this.createToolbar(),
                    this.showFilters && this.createFilterPanel(),
                    this.createAccountGrid(accounts, currentAccountId),
                    this.createFooter()
                ])
            ]);
            
            document.body.appendChild(this.modal);
            
            // Add custom styles for currency selector - ALWAYS refresh for theme
            this.addCurrencySelectorStyles();
            
            // Set up theme change observer to refresh styles
            if (!this.themeObserver) {
                this.themeObserver = new MutationObserver(() => {
                    // Refresh currency selector styles when theme changes
                    this.addCurrencySelectorStyles();
                });
                
                this.themeObserver.observe(document.body, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
            
            // Fetch Bitcoin price and account balances
            this.initializeBalances();
        }
        
        addCurrencySelectorStyles() {
            // Remove old styles if they exist to refresh theme colors
            const existingStyles = document.getElementById('currency-selector-styles');
            if (existingStyles) {
                existingStyles.remove();
            }
            
            // Check if we're in Moosh mode - MUST check every time
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const primaryColor = isMooshMode ? '#69fd97' : '#f57315';
            const hoverColor = isMooshMode ? '#7fffb3' : '#ff8c42';
            const shadowColorRgba = isMooshMode ? 'rgba(105, 253, 151, 0.2)' : 'rgba(245, 115, 21, 0.2)';
            
            // Encode the primary color for SVG
            const encodedColor = primaryColor.replace('#', '%23');
            
            const style = document.createElement('style');
            style.id = 'currency-selector-styles';
            style.textContent = `
                /* Currency selector theme styles - matching dashboard exactly */
                #currency-selector {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background: #000 !important;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodedColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                    background-size: 16px;
                    padding-right: 35px !important;
                    border-color: ${primaryColor} !important;
                    color: ${primaryColor} !important;
                }
                
                #currency-selector:hover {
                    border-color: ${hoverColor} !important;
                    color: ${hoverColor} !important;
                    background: #000 !important;
                }
                
                #currency-selector:focus {
                    border-color: ${hoverColor} !important;
                    box-shadow: 0 0 0 2px ${shadowColorRgba} !important;
                    outline: none !important;
                    background: #000 !important;
                }
                
                /* Remove ALL scrollbars from select dropdown */
                #currency-selector {
                    scrollbar-width: none !important; /* Firefox */
                    -ms-overflow-style: none !important; /* IE/Edge */
                }
                
                #currency-selector::-webkit-scrollbar {
                    display: none !important; /* Chrome/Safari/Opera */
                }
                
                /* Style the dropdown options */
                #currency-selector option {
                    background: #000 !important;
                    color: ${primaryColor} !important;
                    padding: 8px !important;
                    font-family: 'JetBrains Mono', monospace !important;
                }
                
                #currency-selector option:hover,
                #currency-selector option:focus,
                #currency-selector option:checked {
                    background: #1a1a1a !important;
                    color: ${hoverColor} !important;
                    box-shadow: 0 0 10px 100px #1a1a1a inset !important;
                }
                
                /* Remove scrollbar from option list */
                #currency-selector optgroup {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
                
                #currency-selector optgroup::-webkit-scrollbar {
                    display: none !important;
                }
                
                /* Firefox specific */
                @-moz-document url-prefix() {
                    #currency-selector {
                        background: #000 !important;
                        scrollbar-width: none !important;
                    }
                    
                    #currency-selector option {
                        background: #000 !important;
                        color: ${primaryColor} !important;
                    }
                    
                    #currency-selector option:hover,
                    #currency-selector option:checked {
                        background: #1a1a1a !important;
                        color: ${hoverColor} !important;
                    }
                }
                
                /* Webkit browsers */
                @media screen and (-webkit-min-device-pixel-ratio:0) {
                    #currency-selector {
                        background: #000 !important;
                    }
                    
                    #currency-selector option {
                        background: #000 !important;
                        color: ${primaryColor} !important;
                    }
                    
                    #currency-selector option:checked {
                        background: linear-gradient(#1a1a1a, #1a1a1a) !important;
                        color: ${hoverColor} !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        async initializeBalances() {
            try {
                // Fetch Bitcoin prices for all currencies
                await this.fetchBTCPrice();
                console.log('[AccountListModal] Bitcoin prices fetched for', this.currencyPrices.size, 'currencies');
                
                // Fetch balances for all accounts
                const accounts = this.app.state.get('accounts') || [];
                await this.loadAllBalances();
            } catch (error) {
                console.error('[AccountListModal] Error initializing balances:', error);
            }
        }
        
        // Remove duplicate methods - using the currency-aware versions above
        
        async refreshAccountBalance(account) {
            // Show loading state
            const btcElement = document.querySelector(`.balance-btc-${account.id}`);
            if (btcElement) {
                btcElement.textContent = 'Refreshing...';
                btcElement.style.color = '#666';
            }
            
            // Clear cache for this account
            this.balanceCache.delete(account.id);
            
            // Fetch fresh balance
            await this.fetchAccountBalance(account);
            
            this.app.showNotification('Balance refreshed', 'success');
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            const accounts = this.app.state.get('accounts') || [];
            
            return $.div({ 
                className: 'terminal-header',
                style: {
                    padding: '10px 15px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                $.span({}, [`~/moosh/accounts $ manage (${accounts.length} account${accounts.length !== 1 ? 's' : ''})`]),
                $.button({
                    style: {
                        background: '#000',
                        border: `2px solid ${this.getThemeColor()}`,
                        color: this.getThemeColor(),
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '6px 12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'all 0.2s ease'
                    },
                    onmouseover: (e) => {
                        const hoverColor = this.getThemeColor('hover');
                        e.currentTarget.style.background = hoverColor;
                        e.currentTarget.style.color = '#000';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000';
                        e.currentTarget.style.color = this.getThemeColor();
                    },
                    onclick: () => this.close()
                }, ['CLOSE'])
            ]);
        }
        
        createToolbar() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'account-toolbar',
                style: {
                    padding: '20px',
                    borderBottom: '2px solid #333',
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }
            }, [
                // Search bar
                $.div({ style: { flex: '1', minWidth: '200px' } }, [
                    $.input({
                        type: 'text',
                        placeholder: 'Search accounts...',
                        value: this.searchQuery,
                        style: {
                            width: '100%',
                            padding: '10px 15px',
                            background: '#000',
                            border: '2px solid #333',
                            color: '#fff',
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'border-color 0.2s ease'
                        },
                        onfocus: (e) => {
                            e.target.style.borderColor = '#f57315';
                        },
                        onblur: (e) => {
                            e.target.style.borderColor = '#333';
                        },
                        oninput: (e) => {
                            this.searchQuery = e.target.value;
                            this.updateAccountGrid();
                        }
                    })
                ]),
                
                // Currency selector
                $.div({ style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
                    $.span({ style: { color: this.getThemeColor(), fontSize: '14px', fontWeight: '500' } }, ['Currency:']),
                    $.select({
                        id: 'currency-selector',
                        value: this.selectedCurrency,
                        style: {
                            padding: '8px 12px',
                            background: '#000',
                            border: `2px solid ${this.getThemeColor()}`,
                            color: this.getThemeColor(),
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono, monospace',
                            cursor: 'pointer',
                            minWidth: '120px',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        },
                        onfocus: (e) => {
                            const hoverColor = this.getThemeColor('hover');
                            e.target.style.boxShadow = `0 0 0 1px ${this.getThemeColor()}`;
                            e.target.style.borderColor = hoverColor;
                        },
                        onblur: (e) => {
                            e.target.style.boxShadow = 'none';
                            e.target.style.borderColor = this.getThemeColor();
                        },
                        onchange: (e) => {
                            this.changeCurrency(e.target.value);
                        }
                    }, this.supportedCurrencies.map(currency => 
                        $.option({ 
                            value: currency.code,
                            style: {
                                background: '#000',
                                color: this.getThemeColor(),
                                padding: '5px'
                            }
                        }, [
                            `${currency.symbol} ${currency.code.toUpperCase()}`
                        ])
                    ))
                ]),
                
                // View mode selector
                $.div({ style: { display: 'flex', gap: '5px' } }, [
                    $.button({
                        style: {
                            padding: '8px 12px',
                            background: this.viewMode === 'grid' ? this.getThemeColor() : '#000',
                            border: `2px solid ${this.getThemeColor()}`,
                            color: this.viewMode === 'grid' ? '#000' : this.getThemeColor(),
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => {
                            this.viewMode = 'grid';
                            this.updateAccountGrid();
                        }
                    }, ['GRID']),
                    $.button({
                        style: {
                            padding: '8px 12px',
                            background: this.viewMode === 'list' ? this.getThemeColor() : '#000',
                            border: `2px solid ${this.getThemeColor()}`,
                            color: this.viewMode === 'list' ? '#000' : this.getThemeColor(),
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => {
                            this.viewMode = 'list';
                            this.updateAccountGrid();
                        }
                    }, ['LIST']),
                    $.button({
                        style: {
                            padding: '8px 12px',
                            background: this.viewMode === 'details' ? this.getThemeColor() : '#000',
                            border: `2px solid ${this.getThemeColor()}`,
                            color: this.viewMode === 'details' ? '#000' : this.getThemeColor(),
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => {
                            this.viewMode = 'details';
                            this.updateAccountGrid();
                        }
                    }, ['DETAILS'])
                ]),
                
                // Sort dropdown
                $.div({ style: { display: 'flex', gap: '10px', alignItems: 'center' } }, [
                    $.select({
                        style: {
                            padding: '8px 12px',
                            background: '#000',
                            border: '2px solid #333',
                            color: this.getThemeColor(),
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            cursor: 'pointer'
                        },
                        value: this.sortBy,
                        onchange: (e) => {
                            this.sortBy = e.target.value;
                            this.updateAccountGrid();
                        }
                    }, [
                        $.option({ value: 'name' }, ['Sort: Name']),
                        $.option({ value: 'date' }, ['Sort: Date']),
                        $.option({ value: 'balance' }, ['Sort: Balance']),
                        $.option({ value: 'activity' }, ['Sort: Activity'])
                    ]),
                    $.button({
                        style: {
                            padding: '8px',
                            background: '#000',
                            border: '2px solid #333',
                            color: '#f57315',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => {
                            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                            this.updateAccountGrid();
                        },
                        title: this.sortOrder === 'asc' ? 'Ascending' : 'Descending'
                    }, [this.sortOrder === 'asc' ? '↑' : '↓'])
                ]),
                
                // Filter button
                $.button({
                    style: {
                        padding: '8px 16px',
                        background: this.showFilters ? '#f57315' : '#000',
                        border: '2px solid #f57315',
                        color: this.showFilters ? '#000' : '#f57315',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'all 0.2s ease',
                        marginLeft: 'auto'
                    },
                    onclick: () => {
                        this.showFilters = !this.showFilters;
                        this.updateAccountGrid();
                    }
                }, ['FILTERS']),
                
                // Actions
                $.div({ style: { display: 'flex', gap: '10px' } }, [
                    $.button({
                        style: {
                            padding: '8px 16px',
                            background: '#000',
                            border: '2px solid #f57315',
                            color: '#f57315',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = '#f57315';
                            e.currentTarget.style.color = '#000';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.color = '#f57315';
                        },
                        onclick: () => this.createNewAccount()
                    }, ['+ New Account']),
                    $.button({
                        style: {
                            padding: '8px 16px',
                            background: '#000',
                            border: '2px solid #666',
                            color: '#666',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = '#222';
                            e.currentTarget.style.color = '#fff';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.color = '#666';
                        },
                        onclick: () => this.importAccount()
                    }, ['Import'])
                ])
            ]);
        }
        
        createFilterPanel() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    padding: '20px',
                    background: '#111',
                    borderBottom: '2px solid #333',
                    display: 'flex',
                    gap: '30px',
                    flexWrap: 'wrap'
                }
            }, [
                // Balance filter
                $.div({ style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
                    $.label({ style: { color: '#f57315', fontSize: '12px', fontWeight: 'bold' } }, ['BALANCE FILTER']),
                    $.div({ style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } }, [
                        ['all', 'empty', 'low', 'medium', 'high'].map(value => 
                            $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: this.filters.balance === value ? '#f57315' : '#000',
                                    border: '2px solid #f57315',
                                    color: this.filters.balance === value ? '#000' : '#f57315',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: () => {
                                    this.filters.balance = value;
                                    this.updateAccountGrid();
                                }
                            }, [value.toUpperCase()])
                        )
                    ])
                ]),
                
                // Activity filter
                $.div({ style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
                    $.label({ style: { color: '#69fd97', fontSize: '12px', fontWeight: 'bold' } }, ['ACTIVITY FILTER']),
                    $.div({ style: { display: 'flex', gap: '10px' } }, [
                        ['all', 'active', 'inactive'].map(value => 
                            $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: this.filters.activity === value ? '#69fd97' : '#000',
                                    border: '2px solid #69fd97',
                                    color: this.filters.activity === value ? '#000' : '#69fd97',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: () => {
                                    this.filters.activity = value;
                                    this.updateAccountGrid();
                                }
                            }, [value.toUpperCase()])
                        )
                    ])
                ]),
                
                // Type filter
                $.div({ style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
                    $.label({ style: { color: '#00d4ff', fontSize: '12px', fontWeight: 'bold' } }, ['TYPE FILTER']),
                    $.div({ style: { display: 'flex', gap: '10px' } }, [
                        ['all', 'hd', 'imported'].map(value => 
                            $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: this.filters.type === value ? '#00d4ff' : '#000',
                                    border: '2px solid #00d4ff',
                                    color: this.filters.type === value ? '#000' : '#00d4ff',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: () => {
                                    this.filters.type = value;
                                    this.updateAccountGrid();
                                }
                            }, [value.toUpperCase()])
                        )
                    ])
                ])
            ]);
        }
        
        createAccountGrid(accounts, currentAccountId) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Filter and sort accounts
            let filteredAccounts = this.filterAccounts(accounts);
            filteredAccounts = this.sortAccounts(filteredAccounts);
            
            if (filteredAccounts.length === 0) {
                return $.div({
                    style: {
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '16px',
                        padding: '20px'
                    }
                }, [
                    this.searchQuery ? 
                        `No accounts found matching "${this.searchQuery}"` : 
                        'No accounts yet. Create your first account!'
                ]);
            }
            
            // Render based on view mode
            switch (this.viewMode) {
                case 'list':
                    return this.createListView(filteredAccounts, currentAccountId);
                case 'details':
                    return this.createDetailsView(filteredAccounts, currentAccountId);
                case 'grid':
                default:
                    return $.div({
                        className: 'account-grid',
                        style: {
                            flex: '1',
                            overflow: 'auto',
                            padding: '20px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '20px',
                            alignContent: 'start'
                        }
                    }, filteredAccounts.map(account => this.createAccountCard(account, account.id === currentAccountId)));
            }
        }
        
        createAccountCard(account, isActive) {
            const $ = window.ElementFactory || ElementFactory;
            const isEditing = this.editingAccountId === account.id;
            
            const accountColor = account.color || '#f57315';
            
            return $.div({
                className: 'account-card',
                'data-account-id': account.id,
                draggable: false,
                style: {
                    background: isActive ? `${accountColor}20` : '#111',
                    border: `2px solid ${isActive ? accountColor : (account.color || '#333')}`,
                    borderLeft: `5px solid ${accountColor}`,
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    userSelect: 'none'
                },
                onclick: (e) => {
                    e.stopPropagation();
                    if (!isActive) {
                        this.switchToAccount(account);
                    }
                },
                onmouseover: (e) => {
                    if (!isActive) {
                        e.currentTarget.style.borderColor = accountColor;
                        e.currentTarget.style.background = `${accountColor}10`;
                    }
                },
                onmouseout: (e) => {
                    if (!isActive) {
                        e.currentTarget.style.borderColor = account.color || '#333';
                        e.currentTarget.style.background = '#111';
                    }
                }
            }, [
                // Active indicator (separate row)
                isActive && $.div({
                    style: {
                        background: accountColor,
                        color: '#000',
                        padding: '8px 12px',
                        margin: '-20px -20px 15px -20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }
                }, ['ACTIVE ACCOUNT']),
                
                // Account name on its own line
                isEditing ? 
                    $.div({
                        style: {
                            background: '#000',
                            border: `2px solid ${accountColor}`,
                            padding: '8px',
                            marginBottom: '15px'
                        }
                    }, [
                        $.input({
                            type: 'text',
                            value: account.name,
                            style: {
                                background: '#000',
                                border: 'none',
                                color: accountColor,
                                padding: '4px',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                width: '100%',
                                fontFamily: 'JetBrains Mono, monospace',
                                textAlign: 'center',
                                outline: 'none'
                            },
                            onclick: (e) => e.stopPropagation(),
                            onkeydown: (e) => {
                                if (e.key === 'Enter') {
                                    this.saveAccountName(account.id, e.target.value);
                                } else if (e.key === 'Escape') {
                                    this.editingAccountId = null;
                                    this.updateAccountGrid();
                                }
                            },
                            onblur: (e) => {
                                this.saveAccountName(account.id, e.target.value);
                            }
                        })
                    ]) :
                    $.div({
                        style: {
                            background: '#000',
                            border: `2px solid ${accountColor}`,
                            padding: '12px 20px',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }
                    }, [
                        $.div({ 
                            tag: 'h3',
                            style: { 
                                color: accountColor,
                                margin: '0',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                fontFamily: 'JetBrains Mono, monospace'
                            } 
                        }, [account.name])
                    ]),
                
                // Action buttons in a row
                $.div({ 
                    style: { 
                        display: 'flex', 
                        gap: '5px',
                        justifyContent: 'center',
                        marginBottom: '15px'
                    } 
                }, [
                        !isEditing && $.button({
                            style: {
                                background: '#000',
                                border: '1px solid #333',
                                color: '#f57315',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono, monospace',
                                transition: 'all 0.2s ease'
                            },
                            onmouseover: (e) => {
                                e.currentTarget.style.background = '#111';
                                e.currentTarget.style.borderColor = '#f57315';
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.background = '#000';
                                e.currentTarget.style.borderColor = '#333';
                            },
                            onclick: (e) => {
                                e.stopPropagation();
                                this.editingAccountId = account.id;
                                this.updateAccountGrid();
                            }
                        }, ['EDIT']),
                        
                        !isEditing && $.button({
                            style: {
                                background: '#000',
                                border: '1px solid #333',
                                color: accountColor,
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono, monospace',
                                transition: 'all 0.2s ease'
                            },
                            onmouseover: (e) => {
                                e.currentTarget.style.background = '#111';
                                e.currentTarget.style.borderColor = accountColor;
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.background = '#000';
                                e.currentTarget.style.borderColor = '#333';
                            },
                            onclick: (e) => {
                                e.stopPropagation();
                                this.showColorPicker(account.id);
                            }
                        }, ['COLOR']),
                        
                        $.button({
                            style: {
                                background: '#000',
                                border: '1px solid #333',
                                color: '#69fd97',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono, monospace',
                                transition: 'all 0.2s ease'
                            },
                            onmouseover: (e) => {
                                e.currentTarget.style.background = '#111';
                                e.currentTarget.style.borderColor = '#69fd97';
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.background = '#000';
                                e.currentTarget.style.borderColor = '#333';
                            },
                            onclick: (e) => {
                                e.stopPropagation();
                                this.exportAccount(account);
                            }
                        }, ['EXPORT']),
                        
                        (this.app.state.get('accounts').length > 1 && !isActive) && $.button({
                            style: {
                                background: '#000',
                                border: '1px solid #ff4444',
                                color: '#ff4444',
                                padding: '4px 8px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontFamily: 'JetBrains Mono, monospace',
                                transition: 'all 0.2s ease'
                            },
                            onmouseover: (e) => {
                                e.currentTarget.style.background = '#220000';
                                e.currentTarget.style.borderColor = '#ff6666';
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.background = '#000';
                                e.currentTarget.style.borderColor = '#ff4444';
                            },
                            onclick: (e) => {
                                e.stopPropagation();
                                this.confirmDeleteAccount(account);
                            }
                        }, ['DELETE'])
                ]),
                
                // Account info
                $.div({ style: { fontSize: '12px', color: '#666' } }, [
                    $.p({ style: { margin: '5px 0' } }, [
                        `Created: ${new Date(account.createdAt).toLocaleDateString()}`
                    ]),
                    $.p({ style: { margin: '5px 0' } }, [
                        `Type: ${account.type || 'HD Wallet'}`
                    ])
                ]),
                
                // Balance display
                $.div({ 
                    className: 'account-balance-display',
                    style: { 
                        marginTop: '10px',
                        padding: '10px',
                        background: '#000',
                        border: '1px solid #333',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    } 
                }, [
                    $.div({}, [
                        $.span({ 
                            className: `balance-btc-${account.id}`,
                            style: { color: '#f57315', fontWeight: 'bold' } 
                        }, ['Loading...']),
                        $.br({}),
                        $.span({ 
                            className: `balance-usd-${account.id}`,
                            style: { fontSize: '12px', color: '#888' } 
                        }, [''])
                    ]),
                    $.button({
                        style: {
                            background: '#000',
                            border: '2px solid #f57315',
                            color: '#f57315',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = 'rgba(245, 115, 21, 0.1)';
                            e.currentTarget.style.borderColor = '#f57315';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.borderColor = '#f57315';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.refreshAccountBalance(account);
                        }
                    }, ['REFRESH'])
                ]),
                
                // Address preview
                $.div({ 
                    style: { 
                        marginTop: '10px',
                        padding: '8px',
                        background: '#000',
                        border: '1px solid #333',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    } 
                }, [
                    (account.addresses && (account.addresses.segwit || account.addresses.bitcoin || account.addresses.taproot || account.addresses.legacy)) 
                        ? (account.addresses.segwit || account.addresses.bitcoin || account.addresses.taproot || account.addresses.legacy)
                        : 'Loading addresses...'
                ]),
                
                // Make Active button (only show if not active)
                !isActive && $.div({
                    style: {
                        marginTop: '15px',
                        display: 'flex',
                        justifyContent: 'center'
                    }
                }, [
                    $.button({
                        style: {
                            padding: '10px 20px',
                            background: '#000',
                            border: '2px solid #f57315',
                            color: '#f57315',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease',
                            width: '100%'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = '#f57315';
                            e.currentTarget.style.color = '#000';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.color = '#f57315';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.switchToAccount(account);
                        }
                    }, ['MAKE ACTIVE'])
                ])
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || ElementFactory;
            const selectedCount = this.selectedAccounts.size;
            
            return $.div({
                style: {
                    padding: '15px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                $.div({ style: { color: '#666', fontSize: '14px' } }, [
                    `${(this.app.state.get('accounts') || []).length} account${(this.app.state.get('accounts') || []).length !== 1 ? 's' : ''} total`
                ]),
                $.button({
                    style: {
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid #666',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '14px'
                    },
                    onclick: () => this.close()
                }, ['Close'])
            ]);
        }
        
        createListView(accounts, currentAccountId) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'account-grid',
                style: {
                    flex: '1',
                    overflow: 'auto',
                    padding: '20px'
                }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }
                }, accounts.map(account => {
                    const isActive = account.id === currentAccountId;
                    const balance = this.balanceCache.get(account.id);
                    const accountColor = account.color || '#f57315';
                    
                    return $.div({
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            padding: '15px 20px',
                            background: isActive ? `${accountColor}20` : '#111',
                            border: `2px solid ${isActive ? accountColor : '#333'}`,
                            borderLeft: `5px solid ${accountColor}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            gap: '20px'
                        },
                        onclick: (e) => e.stopPropagation(),
                        onmouseover: (e) => {
                            if (!isActive) {
                                e.currentTarget.style.borderColor = accountColor;
                                e.currentTarget.style.background = `${accountColor}10`;
                            }
                        },
                        onmouseout: (e) => {
                            if (!isActive) {
                                e.currentTarget.style.borderColor = '#333';
                                e.currentTarget.style.background = '#111';
                            }
                        }
                    }, [
                        // Name
                        $.div({ style: { flex: '1', minWidth: '150px' } }, [
                            $.div({ style: { fontWeight: 'bold', fontSize: '14px', color: accountColor } }, [account.name]),
                            $.div({ style: { fontSize: '11px', color: '#666', marginTop: '4px' } }, [
                                `Created: ${new Date(account.createdAt).toLocaleDateString()}`
                            ])
                        ]),
                        
                        // Address preview
                        $.div({ 
                            style: { 
                                flex: '2', 
                                fontSize: '12px', 
                                color: '#888',
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            } 
                        }, [account.addresses?.segwit || account.addresses?.taproot || 'No address']),
                        
                        // Balance
                        $.div({ style: { minWidth: '120px', textAlign: 'right' } }, [
                            $.div({ 
                                style: { 
                                    color: balance?.btc > 0 ? '#f57315' : '#666',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                } 
                            }, [balance ? `${balance.btc.toFixed(8)} BTC` : 'Loading...']),
                            balance && $.div({ 
                                style: { fontSize: '11px', color: '#888', marginTop: '2px' } 
                            }, [`≈ $${balance.usd.toFixed(2)}`])
                        ]),
                        
                        // Actions
                        $.div({ style: { display: 'flex', gap: '10px' } }, [
                            !isActive && $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: '#000',
                                    border: '2px solid #f57315',
                                    color: '#f57315',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onmouseover: (e) => {
                                    e.currentTarget.style.background = '#f57315';
                                    e.currentTarget.style.color = '#000';
                                },
                                onmouseout: (e) => {
                                    e.currentTarget.style.background = '#000';
                                    e.currentTarget.style.color = '#f57315';
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.switchToAccount(account);
                                }
                            }, ['MAKE ACTIVE']),
                            $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: '#000',
                                    border: '2px solid #333',
                                    color: '#f57315',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.editingAccountId = account.id;
                                    this.updateAccountGrid();
                                }
                            }, ['EDIT']),
                            $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: '#000',
                                    border: '2px solid #333',
                                    color: '#f57315',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.showColorPicker(account.id);
                                }
                            }, ['COLOR']),
                            $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: '#000',
                                    border: '2px solid #69fd97',
                                    color: '#69fd97',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.exportAccount(account);
                                }
                            }, ['EXPORT']),
                            this.app.state.get('accounts').length > 1 && !isActive && $.button({
                                style: {
                                    padding: '6px 12px',
                                    background: '#000',
                                    border: '2px solid #ff4444',
                                    color: '#ff4444',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.confirmDeleteAccount(account);
                                }
                            }, ['DELETE'])
                        ])
                    ]);
                }))
            ]);
        }
        
        createDetailsView(accounts, currentAccountId) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                className: 'account-grid',
                style: {
                    flex: '1',
                    overflow: 'auto',
                    padding: '20px'
                }
            }, [
                // Table header
                $.div({
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '30px 200px 1fr 150px 120px 100px',
                        gap: '15px',
                        padding: '10px 15px',
                        background: '#000',
                        borderBottom: '2px solid #333',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#f57315',
                        position: 'sticky',
                        top: '0',
                        zIndex: '10'
                    }
                }, [
                    $.span({}, ['#']),
                    $.span({}, ['NAME']),
                    $.span({}, ['ADDRESS']),
                    $.span({ style: { textAlign: 'right' } }, ['BALANCE']),
                    $.span({ style: { textAlign: 'center' } }, ['CREATED']),
                    $.span({ style: { textAlign: 'center' } }, ['ACTIONS'])
                ]),
                
                // Table rows
                $.div({
                    style: {
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }, accounts.map((account, index) => {
                    const isActive = account.id === currentAccountId;
                    const balance = this.balanceCache.get(account.id);
                    const accountColor = account.color || '#f57315';
                    
                    return $.div({
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '30px 200px 1fr 150px 120px 100px',
                            gap: '15px',
                            padding: '15px',
                            background: isActive ? `${accountColor}20` : (index % 2 === 0 ? '#111' : '#0a0a0a'),
                            borderBottom: '1px solid #222',
                            borderLeft: `5px solid ${accountColor}`,
                            alignItems: 'center',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        onclick: (e) => e.stopPropagation(),
                        onmouseover: (e) => {
                            if (!isActive) e.currentTarget.style.background = `${accountColor}10`;
                        },
                        onmouseout: (e) => {
                            if (!isActive) e.currentTarget.style.background = index % 2 === 0 ? '#111' : '#0a0a0a';
                        }
                    }, [
                        $.span({ style: { color: '#666' } }, [(index + 1).toString()]),
                        $.span({ style: { fontWeight: isActive ? 'bold' : 'normal', color: accountColor } }, [account.name]),
                        $.span({ 
                            style: { 
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                color: '#888',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            } 
                        }, [account.addresses?.segwit || account.addresses?.taproot || 'No address']),
                        $.div({ style: { textAlign: 'right' } }, [
                            $.span({ 
                                style: { 
                                    color: balance?.btc > 0 ? '#f57315' : '#666',
                                    fontWeight: 'bold'
                                } 
                            }, [balance ? `${balance.btc.toFixed(8)}` : '-']),
                            balance && balance.btc > 0 && $.span({ 
                                style: { fontSize: '10px', color: '#888', marginLeft: '5px' } 
                            }, [`($${balance.usd.toFixed(2)})`])
                        ]),
                        $.span({ 
                            style: { textAlign: 'center', color: '#666', fontSize: '11px' } 
                        }, [new Date(account.createdAt).toLocaleDateString()]),
                        $.div({ 
                            style: { 
                                display: 'flex', 
                                gap: '5px',
                                justifyContent: 'center'
                            } 
                        }, [
                            !isActive && $.button({
                                style: {
                                    padding: '4px 8px',
                                    background: '#000',
                                    border: '1px solid #f57315',
                                    color: '#f57315',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.switchToAccount(account);
                                }
                            }, ['ACTIVE']),
                            $.button({
                                style: {
                                    padding: '4px 8px',
                                    background: '#000',
                                    border: '1px solid #69fd97',
                                    color: '#69fd97',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontFamily: 'JetBrains Mono, monospace'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.exportAccount(account);
                                }
                            }, ['EXP'])
                        ])
                    ]);
                }))
            ]);
        }
        
        filterAccounts(accounts) {
            let filtered = [...accounts];
            
            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(account => {
                    return account.name.toLowerCase().includes(query) ||
                           (account.addresses && Object.values(account.addresses).some(addr => 
                               addr.toLowerCase().includes(query)
                           ));
                });
            }
            
            // Balance filter
            if (this.filters.balance !== 'all') {
                filtered = filtered.filter(account => {
                    const balance = this.balanceCache.get(account.id);
                    const btc = balance?.btc || 0;
                    
                    switch (this.filters.balance) {
                        case 'empty':
                            return btc === 0;
                        case 'low':
                            return btc > 0 && btc < 0.001; // Less than 0.001 BTC
                        case 'medium':
                            return btc >= 0.001 && btc < 0.1; // 0.001 to 0.1 BTC
                        case 'high':
                            return btc >= 0.1; // 0.1 BTC or more
                        default:
                            return true;
                    }
                });
            }
            
            // Activity filter (based on last transaction or usage)
            if (this.filters.activity !== 'all') {
                const now = Date.now();
                const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
                
                filtered = filtered.filter(account => {
                    // For now, use creation date as activity indicator
                    // In a real implementation, you'd track actual usage
                    const lastActivity = new Date(account.createdAt).getTime();
                    
                    switch (this.filters.activity) {
                        case 'active':
                            return lastActivity > weekAgo;
                        case 'inactive':
                            return lastActivity <= weekAgo;
                        default:
                            return true;
                    }
                });
            }
            
            // Type filter
            if (this.filters.type !== 'all') {
                filtered = filtered.filter(account => {
                    const isImported = account.imported || false;
                    
                    switch (this.filters.type) {
                        case 'hd':
                            return !isImported;
                        case 'imported':
                            return isImported;
                        default:
                            return true;
                    }
                });
            }
            
            return filtered;
        }
        
        sortAccounts(accounts) {
            const sorted = [...accounts];
            
            sorted.sort((a, b) => {
                let compareValue = 0;
                
                switch (this.sortBy) {
                    case 'name':
                        compareValue = a.name.localeCompare(b.name);
                        break;
                    case 'date':
                        compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                        break;
                    case 'activity':
                        // For now, use creation date as activity indicator
                        compareValue = new Date(a.createdAt) - new Date(b.createdAt);
                        break;
                    case 'balance':
                        // Sort by cached balance if available
                        const balanceA = this.balanceCache.get(a.id);
                        const balanceB = this.balanceCache.get(b.id);
                        if (balanceA && balanceB) {
                            compareValue = balanceA.btc - balanceB.btc;
                        } else {
                            compareValue = 0;
                        }
                        break;
                }
                
                return this.sortOrder === 'asc' ? compareValue : -compareValue;
            });
            
            return sorted;
        }
        
        updateAccountGrid() {
            if (!this.modal) return;
            
            const $ = window.ElementFactory || ElementFactory;
            const accounts = this.app.state.get('accounts') || [];
            const currentAccountId = this.app.state.get('currentAccountId');
            
            // Find and replace the account grid
            const oldGrid = this.modal.querySelector('.account-grid');
            if (oldGrid) {
                const newGrid = this.createAccountGrid(accounts, currentAccountId);
                oldGrid.parentNode.replaceChild(newGrid, oldGrid);
            }
        }
        
        switchToAccount(account) {
            console.log(`[AccountListModal] Switching to account: ${account.name}`);
            
            const switched = this.app.state.switchAccount(account.id);
            
            if (switched) {
                this.app.showNotification(`Switched to ${account.name}`, 'success');
                
                // Update the account grid to show new active account
                this.updateAccountGrid();
                
                // Refresh UI if on dashboard
                if (this.app.state.get('currentPage') === 'dashboard' && this.app.dashboard) {
                    setTimeout(() => {
                        this.app.dashboard.refreshBalances();
                    }, 100);
                }
            } else {
                this.app.showNotification('Failed to switch account', 'error');
            }
        }
        
        saveAccountName(accountId, newName) {
            if (!newName || newName.trim() === '') {
                this.editingAccountId = null;
                this.updateAccountGrid();
                return;
            }
            
            const accounts = this.app.state.get('accounts') || [];
            const account = accounts.find(a => a.id === accountId);
            
            if (account) {
                account.name = newName.trim();
                this.app.state.set('accounts', accounts);
                this.app.showNotification(`Account renamed to "${newName.trim()}"`, 'success');
            }
            
            this.editingAccountId = null;
            this.updateAccountGrid();
        }
        
        confirmDeleteAccount(account) {
            if (confirm(`Are you sure you want to delete "${account.name}"?\n\nThis action cannot be undone!`)) {
                this.deleteAccount(account);
            }
        }
        
        deleteAccount(account) {
            const accounts = this.app.state.get('accounts') || [];
            const currentAccountId = this.app.state.get('currentAccountId');
            
            // Remove the account
            const updatedAccounts = accounts.filter(a => a.id !== account.id);
            
            if (updatedAccounts.length === 0) {
                this.app.showNotification('Cannot delete the last account', 'error');
                return;
            }
            
            this.app.state.set('accounts', updatedAccounts);
            
            // If deleting the current account, switch to the first one
            if (account.id === currentAccountId) {
                this.app.state.switchAccount(updatedAccounts[0].id);
            }
            
            this.app.showNotification(`Account "${account.name}" deleted`, 'success');
            this.updateAccountGrid();
        }
        
        exportAccount(account) {
            // Create export data
            const exportData = {
                name: account.name,
                mnemonic: account.mnemonic,
                createdAt: account.createdAt,
                type: account.type,
                color: account.color
            };
            
            // Create download
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const $ = window.ElementFactory || ElementFactory;
            const link = $.a({
                href: url,
                download: `moosh-wallet-${account.name.replace(/\s+/g, '-').toLowerCase()}.json`
            });
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.app.showNotification(`Account "${account.name}" exported`, 'success');
        }
        
        showColorPicker(accountId) {
            const $ = window.ElementFactory || ElementFactory;
            const account = this.app.state.get('accounts').find(a => a.id === accountId);
            if (!account) return;
            
            // Create color picker overlay
            const overlay = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10000'
                },
                onclick: (e) => {
                    if (e.target === e.currentTarget) {
                        document.body.removeChild(overlay);
                    }
                }
            }, [
                $.div({
                    style: {
                        background: '#111',
                        border: '2px solid #333',
                        padding: '20px',
                        minWidth: '300px'
                    }
                }, [
                    $.h3({ 
                        style: { 
                            color: '#f57315', 
                            marginBottom: '20px',
                            fontSize: '18px'
                        } 
                    }, ['Choose Account Color']),
                    
                    $.div({
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 60px)',
                            gap: '10px',
                            marginBottom: '20px'
                        }
                    }, this.app.state.getAccountColors().map(color => {
                        const colorDiv = document.createElement('div');
                        colorDiv.style.cssText = `
                            width: 60px;
                            height: 60px;
                            background-color: ${color} !important;
                            background: ${color} !important;
                            border: ${account.color === color ? '3px solid #fff' : '2px solid #333'};
                            cursor: pointer;
                            transition: all 0.2s;
                            border-radius: 0;
                            display: block;
                        `;
                        
                        colorDiv.addEventListener('mouseover', (e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.border = '2px solid #fff';
                        });
                        
                        colorDiv.addEventListener('mouseout', (e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.border = account.color === color ? '3px solid #fff' : '2px solid #333';
                        });
                        
                        colorDiv.addEventListener('click', () => {
                            // Use debounced version for color updates
                            this.app.state.updateAccountColorDebounced(accountId, color);
                            this.updateAccountGrid();
                            document.body.removeChild(overlay);
                            this.app.showNotification('Account color updated', 'success');
                        });
                        
                        return colorDiv;
                    })),
                    
                    $.button({
                        style: {
                            width: '100%',
                            padding: '10px',
                            background: '#000',
                            border: '2px solid #333',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono, monospace'
                        },
                        onclick: () => {
                            document.body.removeChild(overlay);
                        }
                    }, ['CANCEL'])
                ])
            ]);
            
            document.body.appendChild(overlay);
        }
        
        createNewAccount() {
            this.close();
            // Create new MultiAccountModal instance
            const modal = new MultiAccountModal(this.app);
            modal.isCreating = true;
            modal.show();
        }
        
        importAccount() {
            this.close();
            // Create new MultiAccountModal instance
            const modal = new MultiAccountModal(this.app);
            modal.isImporting = true;
            modal.show();
        }
        
        close() {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
                this.modal = null;
            }
            
            // Remove account update listener
            if (this.accountUpdateHandler) {
                this.app.state.off('accounts', this.accountUpdateHandler);
                this.accountUpdateHandler = null;
            }
            
            // Clean up theme observer
            if (this.themeObserver) {
                this.themeObserver.disconnect();
                this.themeObserver = null;
            }
            
            this.searchQuery = '';
            this.selectedAccounts.clear();
            this.editingAccountId = null;
        }
    }

    // Export to window
    window.AccountListModal = AccountListModal;

})(window);
