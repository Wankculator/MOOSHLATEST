// MOOSH WALLET - Element Factory Module
// Professional DOM Creation Pattern
// Extracted from moosh-wallet.js for better code organization

(function(window) {
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

    // Make available globally and maintain compatibility
    window.ElementFactory = ElementFactory;
    
    // CRITICAL: Maintain the $ shorthand globally
    window.$ = ElementFactory;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ElementFactory = ElementFactory;
        window.MOOSHWalletApp.$ = ElementFactory;
    }

})(window);