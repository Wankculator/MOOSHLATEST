// MOOSH WALLET - Responsive Utilities Module
// Professional Mobile/Desktop Optimization
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

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
            
            // Note: This depends on $ (ElementFactory) being available
            const $ = window.$ || window.ElementFactory;
            if (!$) {
                console.error('ResponsiveUtils: ElementFactory not found. Make sure element-factory.js is loaded first.');
                return null;
            }
            
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
            
            // Note: This depends on $ (ElementFactory) being available
            const $ = window.$ || window.ElementFactory;
            if (!$) {
                console.error('ResponsiveUtils: ElementFactory not found. Make sure element-factory.js is loaded first.');
                return null;
            }
            
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
            
            // Note: This depends on $ (ElementFactory) being available
            const $ = window.$ || window.ElementFactory;
            if (!$) {
                console.error('ResponsiveUtils: ElementFactory not found. Make sure element-factory.js is loaded first.');
                return null;
            }
            
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

    // Make available globally and maintain compatibility
    window.ResponsiveUtils = ResponsiveUtils;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ResponsiveUtils = ResponsiveUtils;
    }

})(window);