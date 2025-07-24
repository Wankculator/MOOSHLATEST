/**
 * Element Factory Module
 * Professional DOM creation pattern for MOOSH Wallet
 * Exports: ElementFactory class and $ shorthand
 */

export class ElementFactory {
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
        console.warn('[ElementFactory] nav() is deprecated. Use div() with role="navigation" instead.');
        return this.create('div', { ...attrs, role: 'navigation' }, children);
    }

    static header(attrs = {}, children = []) {
        console.warn('[ElementFactory] header() is deprecated. Use div() with role="banner" instead.');
        return this.create('div', { ...attrs, role: 'banner' }, children);
    }

    static footer(attrs = {}, children = []) {
        console.warn('[ElementFactory] footer() is deprecated. Use div() with role="contentinfo" instead.');
        return this.create('div', { ...attrs, role: 'contentinfo' }, children);
    }

    static section(attrs = {}, children = []) {
        return this.create('section', attrs, children);
    }

    static article(attrs = {}, children = []) {
        return this.create('article', attrs, children);
    }

    static form(attrs = {}, children = []) {
        return this.create('form', attrs, children);
    }

    static select(attrs = {}, children = []) {
        return this.create('select', attrs, children);
    }

    static option(attrs = {}, children = []) {
        return this.create('option', attrs, children);
    }

    static canvas(attrs = {}) {
        return this.create('canvas', attrs);
    }

    static svg(attrs = {}, children = []) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        children.forEach(child => {
            if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        return element;
    }

    static path(attrs = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }
}

// Create shorthand
export const $ = ElementFactory;

// Default export
export default ElementFactory;