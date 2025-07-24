const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Configuration object - modify this to customize behavior
const config = {
    url: 'http://localhost:8080',
    headless: false,
    viewport: null, // null for full screen, or {width: 1920, height: 1080}
    
    // List of actions to perform automatically
    actions: [
        // Example actions (uncomment to use):
        // { type: 'wait', selector: 'body', timeout: 2000 },
        // { type: 'screenshot', filename: 'before-changes.png' },
        // { type: 'removeElement', selector: '.annoying-popup' },
        // { type: 'hideElement', selector: '.advertisement' },
        // { type: 'modifyStyle', selector: 'body', styles: { backgroundColor: '#1a1a1a' } },
        // { type: 'setAttribute', selector: '#myButton', attribute: 'disabled', value: 'true' },
        // { type: 'injectCSS', css: 'body { font-family: Arial !important; }' },
        // { type: 'click', selector: '#generateWalletBtn' },
        // { type: 'type', selector: '#password', text: 'mypassword' },
        // { type: 'screenshot', filename: 'after-changes.png' }
    ],
    
    // Custom CSS to inject on page load
    customCSS: `
        /* Add your custom CSS here */
        /* Example: 
        .modal-backdrop { display: none !important; }
        body { background: #f0f0f0 !important; }
        */
    `,
    
    // Common UI modifications presets
    presets: {
        darkMode: {
            css: `
                * { background-color: #1a1a1a !important; color: #e0e0e0 !important; }
                input, textarea { background-color: #2a2a2a !important; border-color: #444 !important; }
                button { background-color: #333 !important; border-color: #555 !important; }
            `
        },
        removePopups: {
            selectors: ['.modal-backdrop', '.popup', '.overlay', '.cookie-banner', '.newsletter-popup']
        },
        simplify: {
            hideSelectors: ['.advertisement', '.sidebar-ads', '.banner', '.social-media-links'],
            css: `
                * { animation: none !important; transition: none !important; }
                img[src*="ad"], iframe[src*="ad"] { display: none !important; }
            `
        }
    }
};

class UIModifier {
    constructor(config) {
        this.config = config;
        this.browser = null;
        this.page = null;
    }

    async init() {
        const launchOptions = {
            headless: this.config.headless,
            args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        };
        
        if (this.config.viewport === null) {
            launchOptions.defaultViewport = null;
        } else if (this.config.viewport) {
            launchOptions.defaultViewport = this.config.viewport;
        }

        this.browser = await puppeteer.launch(launchOptions);
        this.page = await this.browser.newPage();
        
        // Set up console message logging
        this.page.on('console', msg => console.log('Browser console:', msg.text()));
        
        await this.page.goto(this.config.url, { waitUntil: 'networkidle2' });
        console.log(`Page loaded: ${this.config.url}`);
        
        // Inject custom CSS if provided
        if (this.config.customCSS && this.config.customCSS.trim()) {
            await this.injectCSS(this.config.customCSS);
        }
    }

    // Click element by CSS selector or XPath
    async clickElement(selector, options = {}) {
        try {
            if (selector.startsWith('//')) {
                // XPath selector
                const [element] = await this.page.$x(selector);
                if (element) {
                    await element.click(options);
                    console.log(`✓ Clicked XPath: ${selector}`);
                } else {
                    console.log(`✗ Element not found: ${selector}`);
                }
            } else {
                // CSS selector
                await this.page.click(selector, options);
                console.log(`✓ Clicked: ${selector}`);
            }
        } catch (error) {
            console.log(`✗ Failed to click ${selector}: ${error.message}`);
        }
    }

    // Type text into element
    async typeText(selector, text, options = { delay: 50 }) {
        try {
            await this.page.type(selector, text, options);
            console.log(`✓ Typed "${text}" into ${selector}`);
        } catch (error) {
            console.log(`✗ Failed to type into ${selector}: ${error.message}`);
        }
    }

    // Modify element styles
    async modifyStyle(selector, styles) {
        try {
            await this.page.evaluate((sel, styleObj) => {
                const elements = document.querySelectorAll(sel);
                elements.forEach(el => {
                    Object.assign(el.style, styleObj);
                });
                return elements.length;
            }, selector, styles);
            console.log(`✓ Modified styles for ${selector}`);
        } catch (error) {
            console.log(`✗ Failed to modify styles: ${error.message}`);
        }
    }

    // Set element attribute
    async setAttribute(selector, attribute, value) {
        try {
            const count = await this.page.evaluate((sel, attr, val) => {
                const elements = document.querySelectorAll(sel);
                elements.forEach(el => {
                    if (val === null) {
                        el.removeAttribute(attr);
                    } else {
                        el.setAttribute(attr, val);
                    }
                });
                return elements.length;
            }, selector, attribute, value);
            console.log(`✓ Set ${attribute}="${value}" on ${count} elements matching ${selector}`);
        } catch (error) {
            console.log(`✗ Failed to set attribute: ${error.message}`);
        }
    }

    // Inject custom CSS
    async injectCSS(css) {
        try {
            await this.page.addStyleTag({ content: css });
            console.log(`✓ Injected custom CSS`);
        } catch (error) {
            console.log(`✗ Failed to inject CSS: ${error.message}`);
        }
    }

    // Remove elements from DOM
    async removeElement(selector) {
        try {
            const count = await this.page.evaluate((sel) => {
                const elements = document.querySelectorAll(sel);
                elements.forEach(el => el.remove());
                return elements.length;
            }, selector);
            console.log(`✓ Removed ${count} elements matching ${selector}`);
        } catch (error) {
            console.log(`✗ Failed to remove elements: ${error.message}`);
        }
    }

    // Hide elements (display: none)
    async hideElement(selector) {
        try {
            await this.modifyStyle(selector, { display: 'none' });
            console.log(`✓ Hidden elements matching ${selector}`);
        } catch (error) {
            console.log(`✗ Failed to hide elements: ${error.message}`);
        }
    }

    // Show hidden elements
    async showElement(selector) {
        try {
            await this.modifyStyle(selector, { display: '' });
            console.log(`✓ Shown elements matching ${selector}`);
        } catch (error) {
            console.log(`✗ Failed to show elements: ${error.message}`);
        }
    }

    // Wait for element to appear
    async waitForElement(selector, timeout = 5000) {
        try {
            if (selector.startsWith('//')) {
                await this.page.waitForXPath(selector, { timeout });
            } else {
                await this.page.waitForSelector(selector, { timeout });
            }
            console.log(`✓ Element appeared: ${selector}`);
        } catch (error) {
            console.log(`✗ Element did not appear within ${timeout}ms: ${selector}`);
        }
    }

    // Take screenshot
    async takeScreenshot(filename = 'screenshot.png', fullPage = true) {
        try {
            await this.page.screenshot({ path: filename, fullPage });
            console.log(`✓ Screenshot saved: ${filename}`);
        } catch (error) {
            console.log(`✗ Failed to take screenshot: ${error.message}`);
        }
    }

    // Rearrange elements (move element A after element B)
    async moveElement(sourceSelector, targetSelector, position = 'after') {
        try {
            await this.page.evaluate((source, target, pos) => {
                const sourceEl = document.querySelector(source);
                const targetEl = document.querySelector(target);
                if (sourceEl && targetEl) {
                    if (pos === 'after') {
                        targetEl.parentNode.insertBefore(sourceEl, targetEl.nextSibling);
                    } else if (pos === 'before') {
                        targetEl.parentNode.insertBefore(sourceEl, targetEl);
                    } else if (pos === 'inside') {
                        targetEl.appendChild(sourceEl);
                    }
                    return true;
                }
                return false;
            }, sourceSelector, targetSelector, position);
            console.log(`✓ Moved ${sourceSelector} ${position} ${targetSelector}`);
        } catch (error) {
            console.log(`✗ Failed to move element: ${error.message}`);
        }
    }

    // Apply preset modifications
    async applyPreset(presetName) {
        const preset = this.config.presets[presetName];
        if (!preset) {
            console.log(`✗ Preset "${presetName}" not found`);
            return;
        }

        console.log(`Applying preset: ${presetName}`);
        
        if (preset.css) {
            await this.injectCSS(preset.css);
        }
        
        if (preset.selectors) {
            for (const selector of preset.selectors) {
                await this.removeElement(selector);
            }
        }
        
        if (preset.hideSelectors) {
            for (const selector of preset.hideSelectors) {
                await this.hideElement(selector);
            }
        }
    }

    // Execute custom JavaScript
    async executeScript(script) {
        try {
            const result = await this.page.evaluate(script);
            console.log(`✓ Script executed successfully`);
            return result;
        } catch (error) {
            console.log(`✗ Script execution failed: ${error.message}`);
        }
    }

    // Get element information
    async getElementInfo(selector) {
        try {
            const info = await this.page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                
                const rect = el.getBoundingClientRect();
                const computed = window.getComputedStyle(el);
                
                return {
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    innerText: el.innerText?.substring(0, 100),
                    innerHTML: el.innerHTML?.substring(0, 100),
                    position: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    },
                    styles: {
                        display: computed.display,
                        visibility: computed.visibility,
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        fontSize: computed.fontSize
                    },
                    attributes: Array.from(el.attributes).reduce((acc, attr) => {
                        acc[attr.name] = attr.value;
                        return acc;
                    }, {})
                };
            }, selector);
            
            if (info) {
                console.log(`Element info for ${selector}:`, JSON.stringify(info, null, 2));
            } else {
                console.log(`✗ Element not found: ${selector}`);
            }
            return info;
        } catch (error) {
            console.log(`✗ Failed to get element info: ${error.message}`);
        }
    }

    // Process all configured actions
    async processActions() {
        for (const action of this.config.actions) {
            console.log(`\nExecuting action: ${action.type}`);
            
            switch (action.type) {
                case 'click':
                    await this.clickElement(action.selector, action.options);
                    break;
                case 'type':
                    await this.typeText(action.selector, action.text, action.options);
                    break;
                case 'modifyStyle':
                    await this.modifyStyle(action.selector, action.styles);
                    break;
                case 'setAttribute':
                    await this.setAttribute(action.selector, action.attribute, action.value);
                    break;
                case 'injectCSS':
                    await this.injectCSS(action.css);
                    break;
                case 'removeElement':
                    await this.removeElement(action.selector);
                    break;
                case 'hideElement':
                    await this.hideElement(action.selector);
                    break;
                case 'showElement':
                    await this.showElement(action.selector);
                    break;
                case 'wait':
                    await this.waitForElement(action.selector, action.timeout);
                    break;
                case 'screenshot':
                    await this.takeScreenshot(action.filename, action.fullPage);
                    break;
                case 'moveElement':
                    await this.moveElement(action.source, action.target, action.position);
                    break;
                case 'applyPreset':
                    await this.applyPreset(action.preset);
                    break;
                case 'executeScript':
                    await this.executeScript(action.script);
                    break;
                case 'getInfo':
                    await this.getElementInfo(action.selector);
                    break;
                case 'delay':
                    await this.page.waitForTimeout(action.ms || 1000);
                    console.log(`✓ Waited ${action.ms || 1000}ms`);
                    break;
                default:
                    console.log(`✗ Unknown action type: ${action.type}`);
            }
        }
    }

    // Interactive mode
    async startInteractive() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n=== Interactive Mode ===');
        console.log('Commands:');
        console.log('  click <selector>');
        console.log('  type <selector> <text>');
        console.log('  style <selector> <property> <value>');
        console.log('  attr <selector> <attribute> <value>');
        console.log('  css <css-code>');
        console.log('  remove <selector>');
        console.log('  hide <selector>');
        console.log('  show <selector>');
        console.log('  move <source-selector> <target-selector> [after|before|inside]');
        console.log('  info <selector>');
        console.log('  screenshot [filename]');
        console.log('  preset <name>');
        console.log('  eval <javascript-code>');
        console.log('  exit');
        console.log('========================\n');

        const prompt = () => {
            rl.question('> ', async (input) => {
                const parts = input.trim().split(' ');
                const command = parts[0];

                try {
                    switch (command) {
                        case 'click':
                            await this.clickElement(parts[1]);
                            break;
                        case 'type':
                            await this.typeText(parts[1], parts.slice(2).join(' '));
                            break;
                        case 'style':
                            await this.modifyStyle(parts[1], { [parts[2]]: parts[3] });
                            break;
                        case 'attr':
                            await this.setAttribute(parts[1], parts[2], parts[3]);
                            break;
                        case 'css':
                            await this.injectCSS(parts.slice(1).join(' '));
                            break;
                        case 'remove':
                            await this.removeElement(parts[1]);
                            break;
                        case 'hide':
                            await this.hideElement(parts[1]);
                            break;
                        case 'show':
                            await this.showElement(parts[1]);
                            break;
                        case 'move':
                            await this.moveElement(parts[1], parts[2], parts[3] || 'after');
                            break;
                        case 'info':
                            await this.getElementInfo(parts[1]);
                            break;
                        case 'screenshot':
                            await this.takeScreenshot(parts[1] || 'screenshot.png');
                            break;
                        case 'preset':
                            await this.applyPreset(parts[1]);
                            break;
                        case 'eval':
                            const script = parts.slice(1).join(' ');
                            const result = await this.executeScript(script);
                            if (result !== undefined) console.log('Result:', result);
                            break;
                        case 'exit':
                            await this.close();
                            process.exit(0);
                            break;
                        default:
                            console.log('Unknown command:', command);
                    }
                } catch (error) {
                    console.error('Error:', error.message);
                }

                prompt();
            });
        };

        prompt();
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Main execution
async function main() {
    const modifier = new UIModifier(config);
    
    try {
        await modifier.init();
        
        // Process configured actions
        if (config.actions && config.actions.length > 0) {
            console.log('Processing configured actions...\n');
            await modifier.processActions();
        }
        
        // Start interactive mode
        console.log('\nStarting interactive mode...');
        await modifier.startInteractive();
        
    } catch (error) {
        console.error('Error:', error);
        await modifier.close();
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = { UIModifier, config };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}