// MOOSH WALLET - 100% PURE JAVASCRIPT IMPLEMENTATION
// Professional-grade wallet UI with 50 years of development expertise
// Version: 2.0 - Complete rewrite for pixel-perfect accuracy

(function(window) {

    // ═══════════════════════════════════════════════════════════════════════
    // MODULE LOADING SECTION
    // ═══════════════════════════════════════════════════════════════════════
    // All core modules are loaded from separate files in index.html:
    // 
    // Core Modules:
    // - /js/modules/core/element-factory.js
    // - /js/modules/core/responsive-utils.js
    // - /js/modules/core/compliance-utils.js
    // - /js/modules/core/style-manager.js
    // - /js/modules/core/secure-storage.js
    // - /js/modules/core/state-manager.js
    // - /js/modules/core/api-service.js
    // - /js/modules/core/router.js
    // - /js/modules/core/component.js
    //
    // UI Components:
    // - /js/modules/ui/terminal.js
    // - /js/modules/ui/button.js
    // - /js/modules/ui/header.js
    //
    // Page Components:
    // - /js/modules/pages/home-page.js
    // - /js/modules/pages/dashboard-page.js
    // - /js/modules/pages/generate-seed-page.js
    // - /js/modules/pages/confirm-seed-page.js
    // - /js/modules/pages/import-seed-page.js
    // - /js/modules/pages/wallet-created-page.js
    // - /js/modules/pages/wallet-imported-page.js
    // - /js/modules/pages/wallet-details-page.js
    //
    // Modals:
    // - /js/modules/modals/modal-base.js
    // - /js/modules/modals/send-modal.js
    // - /js/modules/modals/receive-modal.js
    // - /js/modules/modals/ordinals-modal.js
    // - /js/modules/modals/ordinals-terminal-modal.js
    // - /js/modules/modals/token-menu-modal.js
    //
    // Spark Protocol:
    // - /js/modules/spark/spark-state-manager.js
    // - /js/modules/spark/spark-bitcoin-manager.js
    // - /js/modules/spark/spark-lightning-manager.js
    // - /js/modules/spark/spark-wallet-manager.js
    //
    // Features:
    // - /js/modules/features/ordinals-manager.js
    // - /js/modules/features/wallet-manager.js
    // - /js/modules/features/wallet-detector.js

    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // ELEMENT FACTORY - Professional DOM Creation Pattern
    // ═══════════════════════════════════════════════════════════════════════
    class ElementFactory {
        static create(tag, attrs = {}, children = []) {
            const element = document.createElement(tag);

            // Handle attributes
            Object.entries(attrs).forEach(([key, value]) => {
                if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else if (key.startsWith('on')) {
                    const eventName = key.slice(2).toLowerCase();
                    element.addEventListener(eventName, value);
                } else if (key === 'className') {
                    element.className = value;
                } else {
                    element.setAttribute(key, value);
                }
            });

            // Handle children
            children.forEach(child => {
                if (child === null || child === undefined) return;
                if (typeof child === 'string' || typeof child === 'number') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                } else if (Array.isArray(child)) {
                    child.forEach(subChild => {
                        if (subChild instanceof Node) {
                            element.appendChild(subChild);
                        }
                    });
                }
            });

            return element;
        }

        static div(attrs = {}, children = []) {
            return this.create('div', attrs, children);
        }

        static span(attrs = {}, children = []) {
            return this.create('span', attrs, children);
        }

        static button(attrs = {}, children = []) {
            return this.create('button', attrs, children);
        }

        static input(attrs = {}) {
            return this.create('input', attrs);
        }

        static img(attrs = {}) {
            return this.create('img', attrs);
        }

        static h1(attrs = {}, children = []) {
            return this.create('h1', attrs, children);
        }

        static h2(attrs = {}, children = []) {
            return this.create('h2', attrs, children);
        }

        static h3(attrs = {}, children = []) {
            return this.create('h3', attrs, children);
        }

        static h4(attrs = {}, children = []) {
            return this.create('h4', attrs, children);
        }

        static p(attrs = {}, children = []) {
            return this.create('p', attrs, children);
        }

        static label(attrs = {}, children = []) {
            return this.create('label', attrs, children);
        }

        static textarea(attrs = {}, children = []) {
            return this.create('textarea', attrs, children);
        }

        static nav(attrs = {}, children = []) {
            return this.create('nav', attrs, children);
        }

        static br(attrs = {}) {
            return this.create('br', attrs);
        }

        static header(attrs = {}, children = []) {
            return this.create('header', attrs, children);
        }

        static footer(attrs = {}, children = []) {
            return this.create('footer', attrs, children);
        }

        static a(attrs = {}, children = []) {
            return this.create('a', attrs, children);
        }

        static svg(attrs = {}, children = []) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            Object.entries(attrs).forEach(([key, value]) => {
                svg.setAttribute(key, value);
            });
            children.forEach(child => svg.appendChild(child));
            return svg;
        }

        static select(attrs = {}, children = []) {
            return this.create('select', attrs, children);
        }

        static option(attrs = {}, children = []) {
            return this.create('option', attrs, children);
        }
    }

    const $ = ElementFactory; // Shorthand

    // ═══════════════════════════════════════════════════════════════════════
    // RESPONSIVE UTILITIES - Professional Mobile/Desktop Optimization
    // ═══════════════════════════════════════════════════════════════════════
    class ResponsiveUtils {
        static BREAKPOINTS = {
            xs: 320,    // Ultra-small phones
            sm: 375,    // Standard phones
            md: 414,    // Large phones
            lg: 768,    // Tablets
            xl: 1024,   // Small desktops
            xxl: 1440,  // Standard desktops
            xxxl: 1920  // Large desktops
        };

        static getBreakpoint() {
            const width = window.innerWidth;
            if (width < this.BREAKPOINTS.sm) return 'xs';
            if (width < this.BREAKPOINTS.md) return 'sm';
            if (width < this.BREAKPOINTS.lg) return 'md';
            if (width < this.BREAKPOINTS.xl) return 'lg';
            if (width < this.BREAKPOINTS.xxl) return 'xl';
            if (width < this.BREAKPOINTS.xxxl) return 'xxl';
            return 'xxxl';
        }

        static isMobile() {
            return ['xs', 'sm', 'md'].includes(this.getBreakpoint());
        }

        static isTablet() {
            return ['lg'].includes(this.getBreakpoint());
        }

        static isDesktop() {
            return ['xl', 'xxl', 'xxxl'].includes(this.getBreakpoint());
        }

        static getResponsiveValue(mobileValue, tabletValue, desktopValue) {
            if (this.isMobile()) return mobileValue;
            if (this.isTablet()) return tabletValue || desktopValue;
            return desktopValue;
        }

        static createResponsiveStyle(styles) {
            const breakpoint = this.getBreakpoint();
            const baseStyles = styles.base || {};
            const breakpointStyles = styles[breakpoint] || {};
            return { ...baseStyles, ...breakpointStyles };
        }

        static addTouchFeedback(element) {
            let touchTimeout;

            // Store handlers for cleanup
            const touchStartHandler = () => {
                element.classList.add('touch-active');
                clearTimeout(touchTimeout);
            };

            const touchEndHandler = () => {
                touchTimeout = setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            };

            element.addEventListener('touchstart', touchStartHandler, { passive: true });
            element.addEventListener('touchend', touchEndHandler, { passive: true });

            // Store cleanup function on element
            element._cleanupTouch = () => {
                element.removeEventListener('touchstart', touchStartHandler);
                element.removeEventListener('touchend', touchEndHandler);
                clearTimeout(touchTimeout);
            };

            return element;
        }

        static createResponsiveButton(attrs = {}, children = []) {
            const isMobile = this.isMobile();
            const isCompact = this.getBreakpoint() === 'xs';

            const defaultStyle = {
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: 'var(--font-md)',
                minHeight: 'var(--touch-target)',
                minWidth: isCompact ? 'auto' : 'var(--touch-target)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-xs)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
            };

            const button = $.button({
                ...attrs,
                style: { ...defaultStyle, ...(attrs.style || {}) }
            }, children);

            if (isMobile) {
                this.addTouchFeedback(button);
            }

            return button;
        }

        static createResponsiveContainer(children, options = {}) {
            const { maxWidth = 'var(--container-lg)', padding = true } = options;

            return $.div({
                className: 'responsive-container',
                style: {
                    width: '100%',
                    maxWidth: maxWidth,
                    margin: '0 auto',
                    padding: padding ? 'clamp(1rem, 5vw, 2rem)' : '0',
                    boxSizing: 'border-box'
                }
            }, children);
        }

        static createResponsiveGrid(items, options = {}) {
            const { minItemWidth = 250, gap = 'var(--space-md)' } = options;

            return $.div({
                className: 'responsive-grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}px), 1fr))`,
                    gap: gap,
                    width: '100%'
                }
            }, items);
        }

        static getResponsiveTextStyle(type) {
            const styles = {
                title: {
                    fontSize: 'var(--font-2xl)',
                    lineHeight: '1.2',
                    fontWeight: '700'
                },
                subtitle: {
                    fontSize: 'var(--font-lg)',
                    lineHeight: '1.4',
                    fontWeight: '600'
                },
                body: {
                    fontSize: 'var(--font-md)',
                    lineHeight: '1.5',
                    fontWeight: '400'
                },
                small: {
                    fontSize: 'var(--font-sm)',
                    lineHeight: '1.4',
                    fontWeight: '400'
                },
                tiny: {
                    fontSize: 'var(--font-xs)',
                    lineHeight: '1.3',
                    fontWeight: '400'
                }
            };

            return styles[type] || styles.body;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMPLIANCE UTILITIES - 100% MOOSH Standards Enforcement
    // ═══════════════════════════════════════════════════════════════════════
    class ComplianceUtils {
        // Debounce utility - REQUIRED for all rapid actions
        static debounce(func, wait = 300) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Input validation - REQUIRED for all user inputs
        static validateInput(value, type) {
            switch(type) {
                case 'accountName':
                    if (!value || !value.trim()) {
                        return { valid: false, error: 'Account name required' };
                    }
                    if (value.trim().length > 50) {
                        return { valid: false, error: 'Name too long (max 50 characters)' };
                    }
                    // Check for HTML/script injection
                    if (/<[^>]*>/g.test(value)) {
                        return { valid: false, error: 'Invalid characters detected' };
                    }
                    return { valid: true, sanitized: value.trim() };

                case 'color':
                    if (!value || typeof value !== 'string') {
                        return { valid: false, error: 'Color value required' };
                    }
                    if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        return { valid: false, error: 'Invalid color format (use #RRGGBB)' };
                    }
                    return { valid: true, value: value.toUpperCase() };

                case 'mnemonic':
                    if (!value || !value.trim()) {
                        return { valid: false, error: 'Seed phrase required' };
                    }
                    const words = value.trim().split(/\s+/);
                    if (words.length !== 12 && words.length !== 24) {
                        return { valid: false, error: 'Seed phrase must be 12 or 24 words' };
                    }
                    return { valid: true, sanitized: words.join(' ') };

                case 'password':
                    if (!value || value.length < 8) {
                        return { valid: false, error: 'Password must be at least 8 characters' };
                    }
                    if (value.length > 128) {
                        return { valid: false, error: 'Password too long (max 128 characters)' };
                    }
                    return { valid: true };

                default:
                    return { valid: false, error: 'Unknown input type' };
            }
        }

        // ASCII indicators - NO EMOJIS
        static getStatusIndicator(status) {
            const indicators = {
                'success': '[OK]',
                'error': '[XX]',
                'warning': '[!!]',
                'info': '[..]',
                'loading': '[~~]',
                'ready': '[>>]',
                'stop': '[X]',
                'unknown': '[??]',
                'money': '[$$]',
                'settings': '[~]',
                'count': '[#]'
            };
            return indicators[status] || '[??]';
        }

        // Safe array access with bounds checking
        static safeArrayAccess(array, index, defaultValue = null) {
            if (!Array.isArray(array) || index < 0 || index >= array.length) {
                return defaultValue;
            }
            return array[index];
        }

        // Fix array index after deletion
        static fixArrayIndex(currentIndex, arrayLength) {
            if (arrayLength === 0) return -1;
            if (currentIndex >= arrayLength) {
                return Math.max(0, arrayLength - 1);
            }
            return Math.max(0, currentIndex);
        }

        // Format console log with component prefix
        static log(component, message, type = 'log') {
            const prefix = `[${component}]`;
            const timestamp = new Date().toISOString();

            switch(type) {
                case 'error':
                    console.error(`${prefix} ${message}`, { timestamp });
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}`, { timestamp });
                    break;
                default:
                    console.log(`${prefix} ${message}`, { timestamp });
            }
        }

        // Check if we can delete (prevent last item deletion)
        static canDelete(currentCount, minimum = 1) {
            return currentCount > minimum;
        }

        // Mobile detection
        static isMobileDevice() {
            return window.innerWidth <= 768 ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        // Performance timing
        static measurePerformance(operation, callback) {
            const start = performance.now();
            const result = callback();
            const duration = performance.now() - start;

            if (duration > 100) {
                this.log('Performance', `${operation} took ${duration.toFixed(2)}ms`, 'warn');
            }

            return result;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STYLE MANAGER - Dynamic CSS Injection System
    // ═══════════════════════════════════════════════════════════════════════
    class StyleManager {
        constructor() {
            this.styleElement = null;
            this.rules = new Map();
        }

        inject() {
            this.styleElement = $.create('style');
            document.head.appendChild(this.styleElement);
            this.addCoreStyles();
            this.addComponentStyles();
            this.addAnimations();
            this.addResponsiveStyles();
            this.addLockScreenStyles();
        }

        addCoreStyles() {
            const coreCSS = `
                
                body.moosh-mode .cursor-container,
                body.moosh-mode .cursor-content,
                body.moosh-mode .wallet-container,
                body.moosh-mode .warning-box,
                body.moosh-mode .address-section,
                body.moosh-mode .radio-option {
                    border-color: #232b2b !important;
                    transition: border-color 0.2s ease !important;
                }

                body.moosh-mode .cursor-container:hover,
                body.moosh-mode .cursor-content:hover,
                body.moosh-mode .wallet-container:hover,
                body.moosh-mode .warning-box:hover,
                body.moosh-mode .address-section:hover,
                body.moosh-mode .radio-option:hover {
                    border-color: #69fd97 !important;
                }

                
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(calc(120px * var(--scale-factor)), 1fr));
                    gap: calc(16px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }

                .action-button {
                    background: var(--bg-primary);
                    border: calc(2px * var(--scale-factor)) solid var(--text-primary);
                    color: var(--text-primary);
                    padding: calc(20px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                    font-family: 'JetBrains Mono', monospace;
                }

                .action-button:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }

                .action-icon {
                    font-size: calc(24px * var(--scale-factor));
                    margin-bottom: calc(8px * var(--scale-factor));
                }

                .action-label {
                    font-size: calc(14px * var(--scale-factor));
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                
                #ordinals-inscription-list::-webkit-scrollbar {
                    width: 8px;
                }

                #ordinals-inscription-list::-webkit-scrollbar-track {
                    background: #000000;
                    border: 1px solid #333333;
                }

                #ordinals-inscription-list::-webkit-scrollbar-thumb {
                    background: #f57315;
                    border-radius: 0;
                }

                #ordinals-inscription-list::-webkit-scrollbar-thumb:hover {
                    background: #ff8c42;
                }

                
                .modal-overlay > div::-webkit-scrollbar,
                #inscription-text-content::-webkit-scrollbar {
                    width: 8px;
                }

                .modal-overlay > div::-webkit-scrollbar-track,
                #inscription-text-content::-webkit-scrollbar-track {
                    background: #000000;
                    border: 1px solid #333333;
                }

                .modal-overlay > div::-webkit-scrollbar-thumb,
                #inscription-text-content::-webkit-scrollbar-thumb {
                    background: #f57315;
                    border-radius: 0;
                }

                .modal-overlay > div::-webkit-scrollbar-thumb:hover,
                #inscription-text-content::-webkit-scrollbar-thumb:hover {
                    background: #ff8c42;
                }

                 // End of OrdinalsModal extraction

    // ═══════════════════════════════════════════════════════════════════════
    // ORDINALS TERMINAL MODAL
    // ═══════════════════════════════════════════════════════════════════════
     // End of OrdinalsTerminalModal extraction

    // ═══════════════════════════════════════════════════════════════════════
    // SWAP MODAL
    // ═══════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════
    // WALLET SETTINGS MODAL
    // ═══════════════════════════════════════════════════════════════════════