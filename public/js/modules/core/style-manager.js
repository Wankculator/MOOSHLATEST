// Style Manager Module
// This module handles all CSS injection and styling for the application

(function(window) {
    'use strict';

    // Import dependencies from window
    const $ = window.ElementFactory || window.$;

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
                /* MOBILE-FIRST RESPONSIVE DESIGN - Enhanced Build Rules v4.0 */
                :root {
                    --bg-primary: #000000;
                    --bg-secondary: #000000;
                    --bg-tertiary: #0a0a0a;
                    --bg-hover: #1a1a1a;
                    --text-primary: #f57315;
                    --text-secondary: #ffffff;
                    --text-accent: #f57315;
                    --text-string: #f57315;
                    --text-keyword: #f57315;
                    --text-comment: #888888;
                    --text-dim: #888888;
                    --accent-color: #1d1d1d;
                    --border-color: #333333;
                    --border-active: #f57315;
                    --border-width: 0.25px;
                    --transition-speed: 0.2s;
                    --border-radius: 16px;
                    --accent-bg: rgba(245, 115, 21, 0.1);
                    --accent-bg-hover: rgba(245, 115, 21, 0.2);
                    
                    /* DYNAMIC SCALING SYSTEM */
                    --scale-factor: 0.65;
                    --font-base: 13px;
                    --spacing-unit: 6px;
                    --container-padding: 12px;
                    --button-height: 40px;
                    --input-height: 36px;
                    --touch-target-min: 44px;
                    --mobile-line-height: 1.4;
                    
                    /* PROFESSIONAL RESPONSIVE ENHANCEMENTS */
                    --terminal-padding-mobile: max(3vw, 12px);
                    --terminal-padding-desktop: clamp(16px, 2vw, 24px);
                    --button-gap-responsive: clamp(4px, 1vw, 12px);
                    --font-size-responsive: clamp(10px, 2.5vw, 16px);
                    --terminal-max-width: min(100%, 1200px);
                    --header-font-mobile: clamp(14px, 4vw, 18px);
                    --button-font-mobile: clamp(9px, 2.5vw, 12px);
                    --compact-spacing: clamp(4px, 1vw, 8px);
                    
                    /* ULTIMATE RESPONSIVE FRAMEWORK */
                    /* Dynamic Typography System */
                    --font-scale: clamp(0.875rem, 2vw + 0.5rem, 1.125rem);
                    --font-xs: calc(var(--font-scale) * 0.75);
                    --font-sm: calc(var(--font-scale) * 0.875);
                    --font-md: var(--font-scale);
                    --font-lg: calc(var(--font-scale) * 1.25);
                    --font-xl: calc(var(--font-scale) * 1.5);
                    --font-2xl: calc(var(--font-scale) * 2);
                    --font-3xl: calc(var(--font-scale) * 2.5);
                    
                    /* Intelligent Spacing System */
                    --space-unit: clamp(0.25rem, 1vw, 0.5rem);
                    --space-xs: calc(var(--space-unit) * 0.5);
                    --space-sm: var(--space-unit);
                    --space-md: calc(var(--space-unit) * 2);
                    --space-lg: calc(var(--space-unit) * 4);
                    --space-xl: calc(var(--space-unit) * 6);
                    --space-2xl: calc(var(--space-unit) * 8);
                    
                    /* Touch-Optimized Dimensions */
                    --touch-target: max(44px, calc(var(--space-unit) * 11));
                    --button-height-responsive: clamp(40px, 10vw, 48px);
                    --input-height-responsive: clamp(36px, 9vw, 44px);
                    --icon-size: clamp(16px, 4vw, 24px);
                    
                    /* Container System */
                    --container-xs: min(100%, 320px);
                    --container-sm: min(100%, 640px);
                    --container-md: min(100%, 768px);
                    --container-lg: min(100%, 1024px);
                    --container-xl: min(100%, 1280px);
                    
                    /* Responsive Borders & Radii */
                    --border-width-responsive: max(1px, 0.0625rem);
                    --radius-sm: clamp(2px, 0.5vw, 4px);
                    --radius-md: clamp(4px, 1vw, 8px);
                    --radius-lg: clamp(8px, 2vw, 16px);
                }

                /* Responsive scaling */
                @media (min-width: 480px) {
                    :root {
                        --scale-factor: 0.75;
                        --font-base: 14px;
                        --container-padding: 16px;
                    }
                }
                
                @media (min-width: 768px) {
                    :root {
                        --scale-factor: 0.85;
                        --font-base: 15px;
                        --container-padding: 20px;
                        --button-height: 42px;
                        --input-height: 38px;
                    }
                }
                
                @media (min-width: 1024px) {
                    :root {
                        --scale-factor: 0.95;
                        --font-base: 16px;
                        --container-padding: 32px;
                    }
                }
                
                @media (min-width: 1200px) {
                    :root {
                        --scale-factor: 1;
                        --font-base: 16px;
                        --container-padding: 40px;
                    }
                }
                
                @media (min-width: 1600px) {
                    :root {
                        --scale-factor: 1.05;
                        --font-base: 17px;
                    }
                }

                /* MOOSH MODE - GREEN THEME */
                body.moosh-mode {
                    --text-primary: #69fd97 !important;
                    --text-secondary: #ffffff !important;
                    --text-accent: #69fd97 !important;
                    --text-string: #69fd97 !important;
                    --text-keyword: #69fd97 !important;
                    --text-comment: #71767b !important;
                    --text-dim: #71767b !important;
                    --bg-primary: #000000 !important;
                    --bg-secondary: #000000 !important;
                    --bg-tertiary: #0a0a0a !important;
                    --bg-hover: #1a1a1a !important;
                    --accent-color: #1d1d1d !important;
                    --border-color: #232b2b !important;
                    --border-active: #69fd97 !important;
                    --accent-bg: rgba(105, 253, 151, 0.1) !important;
                    --accent-bg-hover: rgba(105, 253, 151, 0.2) !important;
                }
                
                /* MOOSH MODE - Ensure buttons always have borders */
                body.moosh-mode button,
                body.moosh-mode .btn-primary,
                body.moosh-mode .btn-secondary,
                body.moosh-mode .button {
                    background: #000000 !important;
                    border: 2px solid #232b2b !important;
                    color: #69fd97 !important;
                    transition: all 0.2s ease !important;
                }
                
                body.moosh-mode button:hover,
                body.moosh-mode .btn-primary:hover,
                body.moosh-mode .btn-secondary:hover,
                body.moosh-mode .button:hover {
                    border: 2px solid #69fd97 !important;
                    background: #000000 !important;
                    color: #69fd97 !important;
                }
                
                /* MOOSH MODE - Input fields */
                body.moosh-mode input,
                body.moosh-mode textarea,
                body.moosh-mode select {
                    background: #000000 !important;
                    border: 2px solid #232b2b !important;
                    color: #69fd97 !important;
                    transition: border-color 0.2s ease !important;
                }
                
                body.moosh-mode input:hover,
                body.moosh-mode textarea:hover,
                body.moosh-mode select:hover,
                body.moosh-mode input:focus,
                body.moosh-mode textarea:focus,
                body.moosh-mode select:focus {
                    border-color: #69fd97 !important;
                }
                
                /* MOOSH MODE - Terminal boxes */
                body.moosh-mode .terminal-box {
                    background: #000000 !important;
                    border: 2px solid #232b2b !important;
                    transition: border-color 0.2s ease !important;
                }
                
                body.moosh-mode .terminal-box:hover {
                    border-color: #69fd97 !important;
                }
                
                /* MOOSH MODE - Nav links */
                body.moosh-mode .nav-link {
                    border: none !important;
                    color: #69fd97 !important;
                    transition: all 0.2s ease !important;
                    background: transparent !important;
                }
                
                body.moosh-mode .nav-link:hover {
                    border: none !important;
                    background: transparent !important;
                    color: #69fd97 !important;
                    border-radius: 0 !important;
                }
                
                /* Prevent dropdowns from causing overflow */
                .dropdown-content,
                [class*="dropdown"] {
                    position: absolute;
                    z-index: 1000;
                }
                
                /* MOOSH MODE - All frames and containers */
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
                
                /* MOOSH MODE - Password security text */
                body.moosh-mode .password-bracket,
                body.moosh-mode .password-text-hover,
                body.moosh-mode .typing-text {
                    color: #69fd97 !important;
                    transition: color 0.2s ease !important;
                }
                
                body.moosh-mode .password-bracket:hover,
                body.moosh-mode .password-text-hover:hover,
                body.moosh-mode .typing-text:hover {
                    color: #69fd97 !important;
                    opacity: 0.8;
                }
                
                /* MOOSH MODE - Password label hover */
                body.moosh-mode label.text-dim {
                    color: #71767b !important;
                }
                
                body.moosh-mode label.text-dim:hover {
                    color: #69fd97 !important;
                }
                
                /* MOOSH MODE - Icon buttons (no borders) */
                body.moosh-mode button[style*="background: none"],
                body.moosh-mode button[style*="border: none"],
                body.moosh-mode .hide-btn,
                body.moosh-mode .header-btn,
                body.moosh-mode .privacy-toggle,
                body.moosh-mode .theme-toggle-button,
                body.moosh-mode button[type="button"][style*="position: absolute"] {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                }
                
                body.moosh-mode button[style*="background: none"]:hover,
                body.moosh-mode button[style*="border: none"]:hover,
                body.moosh-mode .hide-btn:hover,
                body.moosh-mode .header-btn:hover,
                body.moosh-mode .privacy-toggle:hover,
                body.moosh-mode .theme-toggle-button:hover,
                body.moosh-mode button[type="button"][style*="position: absolute"]:hover {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                }

                * {
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Roboto Mono', 'Consolas', monospace;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    min-height: 100vh;
                    margin: 0;
                    padding: 0;
                    line-height: 1.5;
                    font-weight: 400;
                    font-size: calc(var(--font-base) * var(--scale-factor));
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    font-variant-numeric: tabular-nums;
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    display: flex;
                    flex-direction: column;
                    overflow-x: hidden;
                    width: 100%;
                }
                
                /* App container should grow to push footer down */
                .app-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    overflow-x: hidden;
                    position: relative;
                }
                
                /* Footer styles */
                .app-footer {
                    background: var(--bg-primary);
                    color: var(--text-dim);
                    padding: calc(20px * var(--scale-factor)) calc(var(--container-padding) * var(--scale-factor));
                    text-align: center;
                    font-size: calc(12px * var(--scale-factor));
                    border-top: 1px solid var(--border-color);
                    margin-top: auto;
                    width: 100%;
                }
                
                .app-footer p {
                    margin: 0;
                    line-height: 1.6;
                }
                
                .app-footer .copyright {
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .app-footer .tagline {
                    color: var(--text-primary);
                    font-weight: 500;
                }
                
                /* MOOSH mode footer */
                body.moosh-mode .app-footer {
                    border-top-color: #232b2b;
                }
                
                body.moosh-mode .app-footer .tagline {
                    color: #69fd97;
                }

                /* Typography */
                .gradient-text {
                    color: var(--text-accent);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .moosh-flash {
                    color: var(--text-dim);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    animation: mooshFlash 3s ease-in-out infinite;
                }

                .text-keyword { color: var(--text-keyword); }
                .text-string { color: var(--text-string); }
                .text-comment { color: var(--text-comment); }
                .text-variable { color: var(--text-secondary); }
                .text-primary { color: var(--text-primary); }
                .text-secondary { color: var(--text-secondary); }
                .text-accent { color: var(--text-accent); }
                .text-dim { color: var(--text-dim); }
                .text-string { color: var(--text-string); }
                .text-keyword { color: var(--text-keyword); }
                .text-comment { color: var(--text-comment); }
                .text-success { color: var(--text-primary); }
                .text-error { color: #ff4444; }
                .text-white { color: #ffffff; }
                .bg-accent { background: var(--accent-bg); }
                .bg-accent-hover:hover { background: var(--accent-bg-hover); }
                
                /* RESPONSIVE FEATURE TAGLINE */
                .feature-tagline {
                    color: var(--text-dim);
                    font-size: var(--font-xs) !important;
                    line-height: var(--mobile-line-height);
                    word-break: break-word;
                    hyphens: auto;
                    overflow-wrap: break-word;
                    max-width: 100%;
                    display: block;
                }
                
                @media (max-width: 479px) {
                    .feature-tagline {
                        font-size: clamp(9px, 2.2vw, 11px) !important;
                        line-height: 1.3;
                        letter-spacing: -0.01em;
                    }
                }
                
                @media (min-width: 480px) and (max-width: 767px) {
                    .feature-tagline {
                        font-size: clamp(10px, 2.3vw, 12px) !important;
                        line-height: 1.35;
                    }
                }
                
                @media (min-width: 768px) and (max-width: 1023px) {
                    .feature-tagline {
                        font-size: clamp(11px, 1.8vw, 13px) !important;
                        line-height: 1.4;
                    }
                }
                
                @media (min-width: 1024px) {
                    .feature-tagline {
                        font-size: calc(var(--font-xs) * 1.1) !important;
                        line-height: 1.4;
                    }
                }

                /* RESPONSIVE STATUS INDICATOR - Small version positioned below security seed box */
                .status-indicator-small {
                    color: #009f6b;
                    font-size: clamp(6px, 1.2vw, 8px) !important;
                    line-height: 1.2;
                    white-space: nowrap;
                    display: inline-flex;
                    align-items: center;
                    gap: 1px;
                    flex-shrink: 0;
                    position: relative;
                    float: right;
                    clear: both;
                    margin-top: calc(4px * var(--scale-factor));
                    margin-right: calc(8px * var(--scale-factor));
                    z-index: 5;
                    padding: calc(2px * var(--scale-factor)) calc(4px * var(--scale-factor));
                }

                @media (max-width: 479px) {
                    .status-indicator-small {
                        font-size: clamp(5px, 1vw, 7px) !important;
                        margin-top: calc(3px * var(--scale-factor));
                        margin-right: calc(6px * var(--scale-factor));
                        padding: calc(1px * var(--scale-factor)) calc(3px * var(--scale-factor));
                    }
                }

                @media (max-width: 360px) {
                    .status-indicator-small {
                        font-size: clamp(4px, 0.8vw, 6px) !important;
                        margin-top: calc(2px * var(--scale-factor));
                        margin-right: calc(4px * var(--scale-factor));
                    }
                }

                /* Mobile specific terminal header adjustments */
                @media (max-width: 480px) {
                    .terminal-header {
                        gap: calc(4px * var(--scale-factor));
                    }
                }
                
                @media (max-width: 360px) {
                    .terminal-header {
                        font-size: calc(10px * var(--scale-factor)) !important;
                    }
                }

                /* MOOSH MODE - ORANGE & BLACK THEME */
                .theme-spark {
                    --text-primary: #f57315 !important;
                    --text-secondary: #ffffff !important;
                    --text-accent: #f57315 !important;
                    --text-string: #f57315 !important;
                    --text-keyword: #f57315 !important;
                    --text-comment: #888888 !important;
                    --text-dim: #888888 !important;
                    --bg-primary: #000000 !important;
                    --bg-secondary: #000000 !important;
                    --bg-tertiary: #000000 !important;
                    --bg-hover: #1a1a1a !important;
                    --border-color: #333333 !important;
                    --border-active: #f57315 !important;
                }
            `;
            
            this.styleElement.textContent = coreCSS;
        }

        addComponentStyles() {
            const componentCSS = `
                /* Layout Components */
                .cursor-container {
                    background: var(--bg-primary);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    overflow-x: hidden;
                    position: relative;
                }

                .cursor-header {
                    background: var(--bg-primary);
                    padding: 0 var(--container-padding);
                    height: calc(53px * var(--scale-factor));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    margin-top: calc(10px * var(--scale-factor));
                    z-index: 1000;
                    box-sizing: border-box;
                }
                
                .cursor-header > * {
                    flex-shrink: 0;
                }

                .cursor-content {
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: calc(var(--spacing-unit) * 3) var(--container-padding) calc(var(--spacing-unit) * 2) var(--container-padding);
                    max-width: 1200px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                    position: relative;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card {
                    background: var(--bg-secondary);
                    border: var(--border-width) solid var(--border-color);
                    border-radius: 0;
                    position: relative;
                    transition: all var(--transition-speed) ease;
                    padding: 24px;
                    margin-bottom: 16px;
                    width: 100%;
                    max-width: 600px;
                }

                .card:hover {
                    background: #000000;
                    border-color: var(--text-primary);
                }

                /* Button System */
                .btn-primary {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                    border: none;
                    border-radius: 9999px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    font-size: 14px;
                    padding: 12px 24px;
                    font-family: inherit;
                    transform: translateZ(0);
                }

                .btn-primary:hover {
                    background: var(--text-secondary);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: transparent;
                    color: var(--text-dim);
                    border: none;
                    font-weight: 400;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    font-size: 14px;
                    padding: 8px 16px;
                    font-family: inherit;
                }

                .btn-secondary:hover {
                    color: var(--text-primary);
                    transform: translateY(-1px);
                }

                /* Navigation */
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: calc(var(--spacing-unit) * 0.5 * var(--scale-factor));
                    margin-left: auto;
                    order: 2;
                }
                
                .nav-link {
                    color: var(--text-primary);
                    font-weight: 600;
                    text-decoration: none;
                    position: relative;
                    transition: color var(--transition-speed) ease;
                    font-size: calc(var(--font-base) * var(--scale-factor) * 0.875);
                    padding: calc(var(--spacing-unit) * var(--scale-factor)) calc(var(--spacing-unit) * 1.5 * var(--scale-factor));
                    border-radius: 0;
                    font-family: inherit;
                    white-space: nowrap;
                    display: inline-block;
                    background: transparent !important;
                    border: none !important;
                }

                .nav-link:hover {
                    color: var(--text-primary);
                    border-radius: 0;
                    background: transparent !important;
                    border: none !important;
                }

                /* Brand System */
                .brand-box {
                    background: transparent;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    gap: calc(var(--spacing-unit) * var(--scale-factor));
                    font-family: inherit;
                    min-width: 200px;
                    flex-shrink: 0;
                    order: 1;
                }

                .brand-text {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    font-size: calc(12px * var(--scale-factor));
                    font-weight: 600;
                }

                .brand-logo {
                    width: calc(32px * var(--scale-factor));
                    height: calc(32px * var(--scale-factor));
                    object-fit: contain;
                    border-radius: 50%;
                }

                /* Form Elements */
                .input-field {
                    background: var(--bg-primary);
                    border: var(--border-width) solid var(--border-color);
                    border-radius: 0;
                    color: var(--text-primary);
                    font-family: inherit;
                    transition: all var(--transition-speed) ease;
                    font-size: calc(12px * var(--scale-factor));
                    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
                    width: 100%;
                    height: var(--input-height);
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    touch-action: manipulation;
                    box-sizing: border-box;
                }

                .input-field:focus {
                    border-color: var(--text-primary);
                    outline: none;
                    background: var(--bg-primary);
                }

                .input-field:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }

                /* Terminal Box - Professional Responsive System */
                .terminal-box {
                    background: #000000;
                    border: 2px solid var(--text-primary);
                    border-radius: 0;
                    padding: var(--terminal-padding-mobile);
                    font-family: 'JetBrains Mono', monospace;
                    overflow: hidden;
                    overflow-x: hidden;
                    margin-bottom: calc(16px * var(--scale-factor));
                    position: relative;
                    isolation: isolate;
                    contain: layout style;
                    max-width: var(--terminal-max-width);
                    margin-left: auto;
                    margin-right: auto;
                    box-sizing: border-box;
                }

                .terminal-header {
                    color: var(--text-primary);
                    margin-bottom: calc(8px * var(--scale-factor));
                    border-bottom: 1px solid var(--text-primary);
                    padding-bottom: calc(4px * var(--scale-factor));
                    padding-right: clamp(80px, 20vw, 120px);
                    font-size: calc(12px * var(--scale-factor));
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    white-space: nowrap;
                    overflow: hidden;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    position: relative;
                    min-height: calc(24px * var(--scale-factor));
                }
                
                .terminal-content {
                    background: var(--bg-primary);
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                }
                
                /* Terminal Box Mobile Optimizations */
                @media (max-width: 480px) {
                    .terminal-box {
                        padding: var(--compact-spacing);
                    }
                    
                    .terminal-box .header-buttons {
                        flex-wrap: wrap;
                        gap: var(--compact-spacing);
                    }
                    
                    .terminal-box h2 {
                        font-size: var(--header-font-mobile) !important;
                    }
                    
                    .terminal-box .btn-secondary {
                        font-size: var(--button-font-mobile) !important;
                        padding: var(--compact-spacing) !important;
                    }
                }
                
                @media (max-width: 360px) {
                    .terminal-box h2 span {
                        font-size: calc(12px * var(--scale-factor));
                    }
                    
                    .terminal-content > div:first-child {
                        flex-direction: column;
                        align-items: stretch !important;
                        gap: calc(8px * var(--scale-factor));
                    }
                    
                    .terminal-box .header-buttons {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                .terminal-content {
                    color: var(--text-primary);
                    line-height: 1.2;
                    font-size: 10px;
                    overflow: hidden;
                    overflow-x: hidden;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* Dashboard Header Row */
                .dashboard-header-row {
                    overflow: visible !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }

                /* Header Buttons Container */
                .header-buttons {
                    flex-shrink: 0 !important;
                    overflow: visible !important;
                    max-width: 60% !important;
                    justify-content: flex-end !important;
                    gap: 8px !important;
                    display: flex !important;
                    align-items: center !important;
                    flex-wrap: nowrap !important;
                }

                /* Dashboard Button Overrides - Fixed with scaling */
                .dashboard-btn {
                    flex-shrink: 0 !important;
                    min-width: calc(60px * var(--scale-factor)) !important;
                    max-width: calc(90px * var(--scale-factor)) !important;
                    width: auto !important;
                    height: calc(32px * var(--scale-factor)) !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: calc(11px * var(--scale-factor)) !important;
                    padding: calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor)) !important;
                    border: calc(1px * var(--scale-factor)) solid #f57315 !important;
                    background: #000000 !important;
                    color: #f57315 !important;
                    box-sizing: border-box !important;
                    margin: 0 !important;
                    transition: all 0.2s ease !important;
                    border-radius: 0 !important;
                    cursor: pointer !important;
                    font-family: 'JetBrains Mono', monospace !important;
                }

                /* Mobile optimizations for dashboard buttons */
                @media (max-width: 480px) {
                    .dashboard-btn {
                        min-width: calc(50px * var(--scale-factor)) !important;
                        max-width: calc(70px * var(--scale-factor)) !important;
                        height: calc(28px * var(--scale-factor)) !important;
                        font-size: calc(9px * var(--scale-factor)) !important;
                        padding: calc(4px * var(--scale-factor)) calc(6px * var(--scale-factor)) !important;
                    }
                }

                @media (max-width: 360px) {
                    .dashboard-btn {
                        min-width: calc(45px * var(--scale-factor)) !important;
                        max-width: calc(60px * var(--scale-factor)) !important;
                        font-size: calc(8px * var(--scale-factor)) !important;
                        padding: calc(3px * var(--scale-factor)) calc(4px * var(--scale-factor)) !important;
                    }
                }

                /* Theme Toggle */
                .theme-toggle {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    padding: calc(var(--spacing-unit) * var(--scale-factor));
                    margin-right: calc(var(--spacing-unit) * 1.5 * var(--scale-factor));
                    min-height: calc(var(--touch-target-min) * 0.8 * var(--scale-factor));
                }
                
                .theme-toggle-button {
                    width: calc(12px * var(--scale-factor));
                    height: calc(12px * var(--scale-factor));
                    border: calc(1px * var(--scale-factor)) solid #333333;
                    border-radius: 50%;
                    margin-right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000000;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                
                .theme-toggle-button:hover {
                    border-color: var(--text-primary);
                }
                
                .theme-toggle-inner {
                    width: calc(4px * var(--scale-factor));
                    height: calc(4px * var(--scale-factor));
                    border-radius: 50%;
                    background: var(--text-primary);
                    transition: all 0.2s ease;
                }
                
                .theme-toggle-icon {
                    font-size: calc(8px * var(--scale-factor));
                    margin-right: calc(var(--spacing-unit) * 0.5 * var(--scale-factor));
                    color: var(--text-dim);
                    transition: all 0.2s ease;
                    user-select: none;
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 500;
                }

                /* Network Toggle */
                .network-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: calc(var(--spacing-unit) * 0.5 * var(--scale-factor));
                    margin-left: auto;
                    position: absolute;
                    top: calc(8px * var(--scale-factor));
                    right: calc(12px * var(--scale-factor));
                    z-index: 10;
                    max-width: clamp(60px, 15vw, 85px);
                    min-width: clamp(45px, 10vw, 60px);
                }
                
                .toggle-switch {
                    width: calc(8px * var(--scale-factor));
                    height: calc(8px * var(--scale-factor));
                    border: calc(1px * var(--scale-factor)) solid #333333;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000000;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    cursor: pointer;
                    position: relative;
                }
                
                .toggle-switch:hover {
                    border-color: var(--text-primary);
                }
                
                .toggle-slider {
                    width: calc(2.5px * var(--scale-factor));
                    height: calc(2.5px * var(--scale-factor));
                    border-radius: 50%;
                    background: var(--text-primary);
                    transition: all 0.2s ease;
                    position: relative;
                }
                
                .toggle-switch.testnet .toggle-slider {
                    background: #ff6b6b;
                }
                
                .network-label {
                    font-size: calc(7px * var(--scale-factor));
                    color: var(--text-dim);
                    font-weight: 400;
                    min-width: calc(35px * var(--scale-factor));
                }

                /* Custom Radio Buttons */
                .custom-radio {
                    width: calc(12px * var(--scale-factor));
                    height: calc(12px * var(--scale-factor));
                    border: calc(1px * var(--scale-factor)) solid #333333;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000000;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    position: relative;
                    box-sizing: border-box;
                }
                
                .radio-inner {
                    width: calc(4px * var(--scale-factor));
                    height: calc(4px * var(--scale-factor));
                    border-radius: 50%;
                    background: transparent;
                    transition: all 0.2s ease;
                    position: relative;
                    display: block;
                }

                /* Typing cursor */
                .typing-cursor {
                    display: inline-block;
                    background-color: var(--text-primary);
                    width: 2px;
                    height: 1em;
                    margin-left: 2px;
                    animation: blink 1s infinite;
                }

                /* Notifications */
                .notification {
                    position: fixed;
                    bottom: calc(var(--spacing-unit) * 4 * var(--scale-factor));
                    right: calc(var(--spacing-unit) * 4 * var(--scale-factor));
                    background: #000000;
                    color: #f57315;
                    border: calc(2px * var(--scale-factor)) solid #f57315;
                    border-radius: 0;
                    padding: calc(var(--spacing-unit) * 1.5 * var(--scale-factor)) calc(var(--spacing-unit) * 2 * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(11px * var(--scale-factor));
                    font-weight: 500;
                    z-index: 10000;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    width: auto;
                    min-width: calc(160px * var(--scale-factor));
                    max-width: calc(320px * var(--scale-factor));
                    text-align: center;
                    box-shadow: 0 calc(6px * var(--scale-factor)) calc(16px * var(--scale-factor)) rgba(0, 0, 0, 0.4);
                    line-height: 1.4;
                    opacity: 0;
                    transform: translateX(calc(20px * var(--scale-factor))) translateY(calc(10px * var(--scale-factor)));
                }

                .notification.show {
                    opacity: 1;
                    transform: translateX(0) translateY(0);
                }

                /* Mobile specific */
                @media (max-width: 768px) {
                    .notification {
                        position: fixed;
                        bottom: calc(var(--spacing-unit) * 8 * var(--scale-factor));
                        left: 50%;
                        right: auto;
                        transform: translateX(-50%) translateY(calc(10px * var(--scale-factor)));
                        max-width: calc(90vw);
                        min-width: calc(200px * var(--scale-factor));
                    }
                    
                    .notification.show {
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            
            this.styleElement.textContent += componentCSS;
        }

        addAnimations() {
            const animationCSS = `
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }

                .blink {
                    animation: blink 1s infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                @keyframes mooshFlash {
                    0%, 70%, 100% {
                        color: var(--text-dim);
                    }
                    15%, 55% {
                        color: var(--text-primary);
                        text-shadow: 0 0 10px rgba(245, 115, 21, 0.5);
                    }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes slideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100px); }
                }

                .fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
            `;
            
            this.styleElement.textContent += animationCSS;
        }

        addResponsiveStyles() {
            const responsiveCSS = `
                @media (max-width: 768px) {
                    .cursor-content {
                        padding: calc(var(--container-padding) * var(--scale-factor)) calc(var(--container-padding) * var(--scale-factor) * 0.75);
                    }
                    
                    h1 {
                        flex-direction: row !important;
                        gap: calc(var(--spacing-unit) * var(--scale-factor)) !important;
                        align-items: center !important;
                        justify-content: center !important;
                        flex-wrap: nowrap !important;
                        font-size: calc(28px * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    .moosh-flash, .text-dim {
                        font-size: calc(20px * var(--scale-factor)) !important;
                        white-space: nowrap;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    .moosh-logo, h1 img {
                        width: calc(32px * var(--scale-factor)) !important;
                        height: calc(32px * var(--scale-factor)) !important;
                        flex-shrink: 0;
                    }
                    
                    .token-site-subtitle {
                        font-size: calc(14px * var(--scale-factor)) !important;
                        margin-bottom: calc(var(--spacing-unit) * 3 * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    .address-types-list {
                        font-size: calc(9px * var(--scale-factor)) !important;
                        margin-bottom: calc(var(--spacing-unit) * 2.5 * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                        padding: calc(var(--spacing-unit) * var(--scale-factor)) !important;
                    }
                    
                    .nav-link {
                        font-size: calc(10px * var(--scale-factor)) !important;
                        padding: calc(var(--spacing-unit) * var(--scale-factor)) calc(var(--spacing-unit) * 1.5 * var(--scale-factor)) !important;
                        border-radius: 0 !important;
                        min-height: calc(var(--touch-target-min) * var(--scale-factor)) !important;
                        display: flex !important;
                        align-items: center !important;
                        background: transparent !important;
                        border: none !important;
                    }
                    
                    .brand-text {
                        font-size: calc(11px * var(--scale-factor)) !important;
                    }
                    
                    .brand-text .text-dim {
                        font-size: calc(10px * var(--scale-factor)) !important;
                    }
                    
                    .nav-link .text-dim {
                        font-size: calc(10px * var(--scale-factor)) !important;
                    }
                    
                    .password-bracket {
                        font-size: calc(9px * var(--scale-factor)) !important;
                    }
                    
                    .password-text-hover {
                        font-size: calc(9px * var(--scale-factor)) !important;
                    }
                    
                    .typing-text {
                        font-size: calc(10px * var(--scale-factor)) !important;
                    }
                    
                    .ui-bracket {
                        font-size: calc(8px * var(--scale-factor)) !important;
                    }
                    
                    .address-bracket {
                        font-size: calc(8px * var(--scale-factor)) !important;
                    }
                    
                    .cursor-header {
                        height: calc(var(--touch-target-min) * 1.2 * var(--scale-factor)) !important;
                        padding: 0 calc(var(--container-padding) * var(--scale-factor)) !important;
                    }
                    
                    .network-toggle {
                        margin-left: calc(var(--spacing-unit) * 0.5 * var(--scale-factor));
                        gap: calc(var(--spacing-unit) * 0.5 * var(--scale-factor));
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .toggle-switch {
                        width: calc(8px * var(--scale-factor)) !important;
                        height: calc(8px * var(--scale-factor)) !important;
                        border-radius: 50% !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        flex-shrink: 0 !important;
                    }
                    
                    .toggle-slider {
                        width: calc(2.5px * var(--scale-factor)) !important;
                        height: calc(2.5px * var(--scale-factor)) !important;
                        border-radius: 50% !important;
                        background: var(--text-primary) !important;
                        transition: all 0.2s ease !important;
                    }
                    
                    .toggle-switch.testnet .toggle-slider {
                        background: #ff6b6b !important;
                    }
                    
                    .network-label {
                        font-size: calc(7px * var(--scale-factor));
                        min-width: calc(35px * var(--scale-factor));
                        font-weight: 400;
                        line-height: var(--mobile-line-height);
                    }
                    
                    .input-field {
                        font-size: calc(var(--font-base) * var(--scale-factor)) !important;
                        padding: calc(var(--spacing-unit) * 1.5 * var(--scale-factor)) calc(var(--spacing-unit) * 2 * var(--scale-factor)) !important;
                        height: calc(var(--touch-target-min) * var(--scale-factor)) !important;
                        border-width: calc(1px * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    label.text-dim {
                        font-size: calc(10px * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    #passwordError, #passwordSuccess {
                        font-size: calc(11px * var(--scale-factor)) !important;
                        margin-top: calc(var(--spacing-unit) * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    .password-security-section {
                        padding: calc(var(--spacing-unit) * 2.5 * var(--scale-factor)) !important;
                        margin-bottom: calc(var(--spacing-unit) * 2 * var(--scale-factor)) !important;
                    }
                    
                    .password-security-title {
                        font-size: calc(16px * var(--scale-factor)) !important;
                        margin-bottom: calc(var(--spacing-unit) * 1.5 * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    .password-security-subtitle {
                        font-size: calc(9px * var(--scale-factor)) !important;
                        margin-bottom: calc(var(--spacing-unit) * 2 * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                    }
                    
                    .wallet-actions button {
                        font-size: calc(15px * var(--scale-factor)) !important;
                        padding: calc(var(--spacing-unit) * 2 * var(--scale-factor)) calc(var(--spacing-unit) * 3 * var(--scale-factor)) !important;
                        height: calc(var(--touch-target-min) * 1.2 * var(--scale-factor)) !important;
                        border-width: calc(2px * var(--scale-factor)) !important;
                        line-height: var(--mobile-line-height) !important;
                        min-height: calc(var(--touch-target-min) * var(--scale-factor)) !important;
                    }
                }
            `;
            
            this.styleElement.textContent += responsiveCSS;
        }
        
        addLockScreenStyles() {
            const lockScreenCSS = `
                /* Lock Screen Styles */
                .wallet-lock-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }
                
                .wallet-lock-container {
                    width: 90%;
                    max-width: 480px;
                    background: #000000;
                    border: 1px solid #f57315;
                    border-radius: 0;
                    padding: 0;
                }
                
                .wallet-lock-container.terminal-box .terminal-header {
                    background: #000000;
                    border-bottom: 1px solid #333333;
                    padding: 8px 12px;
                    font-size: 12px;
                    color: #666666;
                }
                
                .wallet-lock-container.terminal-box .terminal-content {
                    background: #000000;
                }
                
                .lock-terminal-header {
                    background: var(--text-primary);
                    color: #000000;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .lock-terminal-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .lock-terminal-controls {
                    display: flex;
                    gap: 8px;
                }
                
                .lock-terminal-button {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #000000;
                    opacity: 0.3;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }
                
                .lock-terminal-button:hover {
                    opacity: 0.6;
                }
                
                .lock-terminal-button.close {
                    background: #ff5f56;
                    opacity: 1;
                }
                
                .lock-terminal-button.close:hover {
                    opacity: 0.8;
                }
                
                .lock-terminal-body {
                    padding: 30px;
                }
                
                .lock-icon {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 48px;
                    color: var(--text-primary);
                }
                
                .lock-title {
                    text-align: center;
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                
                .lock-subtitle {
                    text-align: center;
                    font-size: 12px;
                    color: var(--text-dim);
                    margin-bottom: 30px;
                }
                
                .lock-input-group {
                    position: relative;
                    margin-bottom: 20px;
                }
                
                .lock-input {
                    width: 100%;
                    padding: 12px 40px 12px 12px;
                    background: #000000;
                    border: 2px solid #333333;
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }
                
                .lock-input:focus {
                    outline: none;
                    border-color: var(--text-primary);
                }
                
                .lock-input-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s ease;
                }
                
                .lock-input-toggle:hover {
                    color: var(--text-primary);
                }
                
                .lock-error {
                    color: #ff4444;
                    font-size: 12px;
                    margin-bottom: 20px;
                    text-align: center;
                    min-height: 16px;
                }
                
                .lock-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .lock-button {
                    flex: 1;
                    padding: 12px 24px;
                    background: #000000;
                    border: 2px solid var(--text-primary);
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .lock-button:hover {
                    background: var(--text-primary);
                    color: #000000;
                }
                
                .lock-button.secondary {
                    border-color: #333333;
                    color: var(--text-dim);
                }
                
                .lock-button.secondary:hover {
                    border-color: var(--text-dim);
                    background: transparent;
                    color: var(--text-primary);
                }
                
                .lock-attempts {
                    text-align: center;
                    font-size: 11px;
                    color: var(--text-dim);
                    margin-top: 20px;
                }
                
                .lock-attempts.warning {
                    color: #ff9900;
                }
                
                .lock-attempts.danger {
                    color: #ff4444;
                }
                
                /* MOOSH mode overrides for lock screen */
                body.moosh-mode .wallet-lock-container {
                    border-color: #69fd97;
                }
                
                body.moosh-mode .wallet-lock-container.terminal-box {
                    border-color: #232b2b;
                }
                
                body.moosh-mode .wallet-lock-container.terminal-box:hover {
                    border-color: #69fd97;
                }
                
                /* Lock screen shake animation */
                @keyframes lockShake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .lock-shake {
                    animation: lockShake 0.5s ease-in-out;
                }
                
                /* Responsive lock screen */
                @media (max-width: 480px) {
                    .wallet-lock-container {
                        width: 95%;
                        max-width: none;
                    }
                    
                    .lock-terminal-body {
                        padding: 20px;
                    }
                    
                    .lock-icon {
                        font-size: 36px;
                    }
                    
                    .lock-title {
                        font-size: 18px;
                    }
                }
            `;
            
            this.styleElement.textContent += lockScreenCSS;
        }
    }

    // Export to window
    window.StyleManager = StyleManager;

})(window);