const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function openAndAnalyzeWallet() {
    console.log('Starting wallet analysis...');
    
    let browser;
    try {
        // Launch browser with various fallback options
        const launchOptions = {
            headless: false,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        };

        // Try different executable paths
        const executablePaths = [
            '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
            '/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe',
            '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            'chromium-browser',
            'chromium',
            'google-chrome',
            undefined // Let Puppeteer use its bundled Chromium
        ];

        for (const execPath of executablePaths) {
            try {
                console.log(`Trying to launch browser${execPath ? ' at: ' + execPath : ' (bundled Chromium)'}...`);
                if (execPath) {
                    launchOptions.executablePath = execPath;
                }
                browser = await puppeteer.launch(launchOptions);
                console.log('Browser launched successfully!');
                break;
            } catch (err) {
                console.log(`Failed: ${err.message}`);
                if (execPath === undefined) {
                    throw new Error('Could not launch any browser');
                }
            }
        }

        const page = await browser.newPage();
        
        // Set up console logging
        page.on('console', msg => console.log('Browser console:', msg.text()));
        page.on('error', err => console.error('Page error:', err));
        
        // Navigate to wallet
        console.log('\nNavigating to http://localhost:8080...');
        await page.goto('http://localhost:8080', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait a bit for any dynamic content
        await page.waitForTimeout(3000);
        
        // Take screenshot
        const screenshotPath = path.join(__dirname, 'wallet-current-state.png');
        await page.screenshot({ 
            path: screenshotPath, 
            fullPage: true 
        });
        console.log(`\nScreenshot saved to: ${screenshotPath}`);
        
        // Analyze page structure
        console.log('\n=== WALLET UI ANALYSIS ===\n');
        
        // Get page title
        const title = await page.title();
        console.log(`Page Title: ${title}`);
        
        // Get current URL
        const url = page.url();
        console.log(`Current URL: ${url}`);
        
        // Check body classes
        const bodyClasses = await page.$eval('body', el => el.className);
        console.log(`Body Classes: ${bodyClasses || '(none)'}`);
        
        // Find all buttons
        console.log('\n--- BUTTONS ---');
        const buttons = await page.$$eval('button', btns => 
            btns.map(btn => ({
                text: btn.innerText.trim(),
                id: btn.id,
                classes: btn.className,
                visible: btn.offsetParent !== null,
                disabled: btn.disabled
            }))
        );
        buttons.forEach(btn => {
            console.log(`Button: "${btn.text}" | ID: ${btn.id || '(none)'} | Classes: ${btn.classes || '(none)'} | Visible: ${btn.visible} | Disabled: ${btn.disabled}`);
        });
        
        // Find navigation items
        console.log('\n--- NAVIGATION ---');
        const navItems = await page.$$eval('.nav-link, .navbar-nav a, nav a', links => 
            links.map(link => ({
                text: link.innerText.trim(),
                href: link.href,
                active: link.classList.contains('active'),
                classes: link.className
            }))
        );
        navItems.forEach(nav => {
            console.log(`Nav: "${nav.text}" | Href: ${nav.href} | Active: ${nav.active}`);
        });
        
        // Check for modals
        console.log('\n--- MODALS ---');
        const modals = await page.$$eval('.modal', modals => 
            modals.map(modal => ({
                id: modal.id,
                visible: modal.classList.contains('show') || modal.style.display !== 'none',
                title: modal.querySelector('.modal-title')?.innerText || ''
            }))
        );
        if (modals.length > 0) {
            modals.forEach(modal => {
                console.log(`Modal: ${modal.id} | Visible: ${modal.visible} | Title: "${modal.title}"`);
            });
        } else {
            console.log('No modals found');
        }
        
        // Check for forms
        console.log('\n--- FORMS ---');
        const forms = await page.$$eval('form', forms => 
            forms.map(form => ({
                id: form.id,
                action: form.action,
                method: form.method,
                inputs: Array.from(form.querySelectorAll('input')).map(input => ({
                    type: input.type,
                    name: input.name,
                    id: input.id,
                    placeholder: input.placeholder
                }))
            }))
        );
        if (forms.length > 0) {
            forms.forEach(form => {
                console.log(`Form: ${form.id} | Action: ${form.action} | Method: ${form.method}`);
                form.inputs.forEach(input => {
                    console.log(`  Input: ${input.type} | Name: ${input.name} | ID: ${input.id}`);
                });
            });
        } else {
            console.log('No forms found');
        }
        
        // Check for specific wallet elements
        console.log('\n--- WALLET SPECIFIC ELEMENTS ---');
        const walletElements = await page.evaluate(() => {
            const elements = {};
            
            // Check for wallet display areas
            elements.seedPhrase = document.querySelector('#seedPhrase') !== null;
            elements.walletInfo = document.querySelector('#walletInfo') !== null;
            elements.addressDisplay = document.querySelector('.address-display, #addressDisplay') !== null;
            elements.generateButton = document.querySelector('#generateWalletBtn') !== null;
            elements.dashboardContent = document.querySelector('#dashboardContent') !== null;
            
            // Check for password/security elements
            elements.passwordModal = document.querySelector('#passwordModal') !== null;
            elements.unlockButton = document.querySelector('#unlockWalletBtn') !== null;
            elements.lockOverlay = document.querySelector('#lockOverlay') !== null;
            
            // Get any visible text content
            const mainContent = document.querySelector('main, .container, #app');
            elements.visibleText = mainContent ? mainContent.innerText.substring(0, 500) : '';
            
            return elements;
        });
        
        console.log(`Seed Phrase Display: ${walletElements.seedPhrase ? 'Found' : 'Not found'}`);
        console.log(`Wallet Info Display: ${walletElements.walletInfo ? 'Found' : 'Not found'}`);
        console.log(`Address Display: ${walletElements.addressDisplay ? 'Found' : 'Not found'}`);
        console.log(`Generate Button: ${walletElements.generateButton ? 'Found' : 'Not found'}`);
        console.log(`Dashboard Content: ${walletElements.dashboardContent ? 'Found' : 'Not found'}`);
        console.log(`Password Modal: ${walletElements.passwordModal ? 'Found' : 'Not found'}`);
        console.log(`Unlock Button: ${walletElements.unlockButton ? 'Found' : 'Not found'}`);
        console.log(`Lock Overlay: ${walletElements.lockOverlay ? 'Found' : 'Not found'}`);
        
        if (walletElements.visibleText) {
            console.log(`\nVisible Text Preview:\n${walletElements.visibleText}`);
        }
        
        // Get any error messages
        console.log('\n--- ERRORS/ALERTS ---');
        const alerts = await page.$$eval('.alert, .error, .warning', alerts => 
            alerts.map(alert => ({
                text: alert.innerText.trim(),
                classes: alert.className
            }))
        );
        if (alerts.length > 0) {
            alerts.forEach(alert => {
                console.log(`Alert: "${alert.text}" | Classes: ${alert.classes}`);
            });
        } else {
            console.log('No alerts/errors visible');
        }
        
        console.log('\n=== END OF ANALYSIS ===\n');
        console.log('Browser will remain open for manual inspection.');
        console.log('Press Ctrl+C to close.\n');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\nError occurred:', error);
        if (browser) {
            await browser.close();
        }
        process.exit(1);
    }
}

// Run the analysis
openAndAnalyzeWallet().catch(console.error);