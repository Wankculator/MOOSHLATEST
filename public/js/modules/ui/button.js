// MOOSH WALLET - Button Component Module
// Reusable button component with multiple variants
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class Button extends Component {
        constructor(app, props = {}) {
            super(app);
            this.props = {
                text: '',
                onClick: () => {},
                variant: 'primary', // 'primary', 'secondary', 'back'
                fullWidth: true,
                ...props
            };
        }

        render() {
            const $ = window.ElementFactory || window.$;
            const styles = this.getStyles();
            
            const button = $.button({
                style: styles,
                onclick: this.props.onClick,
                onmouseover: (e) => this.handleMouseOver(e),
                onmouseout: (e) => this.handleMouseOut(e)
            }, this.getContent());

            return button;
        }

        getStyles() {
            const baseStyles = {
                background: '#000000',
                border: '2px solid var(--text-primary)',
                borderRadius: '0',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: this.props.fullWidth ? '100%' : 'auto',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
            };

            if (this.props.variant === 'primary') {
                return {
                    ...baseStyles,
                    fontSize: 'calc(16px * var(--scale-factor))',
                    padding: 'calc(16px * var(--scale-factor)) calc(32px * var(--scale-factor))',
                    height: 'calc(56px * var(--scale-factor))'
                };
            } else if (this.props.variant === 'secondary') {
                return {
                    ...baseStyles,
                    fontSize: 'calc(12px * var(--scale-factor))',
                    padding: 'calc(12px * var(--scale-factor)) calc(20px * var(--scale-factor))'
                };
            } else if (this.props.variant === 'back') {
                return {
                    ...baseStyles,
                    fontSize: 'calc(14px * var(--scale-factor))',
                    padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))'
                };
            }

            return baseStyles;
        }

        getContent() {
            const $ = window.ElementFactory || window.$;
            
            if (this.props.variant === 'back') {
                return [
                    $.span({
                        className: 'pipe-left',
                        style: { opacity: '0', transition: 'opacity 0.2s' }
                    }, ['|']),
                    ' ',
                    `<${this.props.text}/>`,
                    ' ',
                    $.span({
                        className: 'pipe-right',
                        style: { opacity: '0', transition: 'opacity 0.2s' }
                    }, ['|'])
                ];
            }
            
            return [`<${this.props.text}/>`];
        }

        handleMouseOver(e) {
            e.target.style.background = 'var(--text-primary)';
            e.target.style.color = 'var(--bg-primary)';
            
            if (this.props.variant === 'back') {
                const pipeLeft = e.target.querySelector('.pipe-left');
                const pipeRight = e.target.querySelector('.pipe-right');
                if (pipeLeft) pipeLeft.style.opacity = '1';
                if (pipeRight) pipeRight.style.opacity = '1';
            }
        }

        handleMouseOut(e) {
            e.target.style.background = '#000000';
            e.target.style.color = 'var(--text-primary)';
            
            if (this.props.variant === 'back') {
                const pipeLeft = e.target.querySelector('.pipe-left');
                const pipeRight = e.target.querySelector('.pipe-right');
                if (pipeLeft) pipeLeft.style.opacity = '0';
                if (pipeRight) pipeRight.style.opacity = '0';
            }
        }
    }

    // Make available globally and maintain compatibility
    window.Button = Button;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.Button = Button;
    }

})(window);