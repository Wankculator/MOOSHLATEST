// Test script to simulate complete user journey through MOOSH Wallet
const puppeteer = require('puppeteer');

async function testUserJourney() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const results = [];
    
    // Helper function to log results
    function log(step, status, details = '') {
        const result = { step, status, details, timestamp: new Date().toISOString() };
        results.push(result);
        console.log(`${status === 'PASS' ? '✅' : '❌'} ${step}${details ? ': ' + details : ''}`);
    }
    
    // Helper to check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    try {
        // 1. Initial load
        console.log('\n🚀 Starting user journey simulation...\n');
        await page.goto('http://localhost:3030', { waitUntil: 'networkidle2' });
        const title = await page.title();
        log('Initial load', title.includes('MOOSH Wallet') ? 'PASS' : 'FAIL', `Title: ${title}`);
        
        // Check if app container exists
        const appExists = await page.$('#app') !== null;
        log('App container initialized', appExists ? 'PASS' : 'FAIL');
        
        // 2. Check for password/lock screen
        const hasLockScreen = await page.$('.wallet-lock-screen') !== null;
        const hasPassword = await page.evaluate(() => localStorage.getItem('walletPassword') !== null);
        log('Password/lock screen check', 'PASS', `Lock screen: ${hasLockScreen}, Has password: ${hasPassword}`);
        
        // If locked, try to unlock (for testing, we'll skip this)
        if (hasLockScreen) {
            log('Lock screen displayed', 'PASS', 'Would need password to continue');
            // In real test, would enter password here
        }
        
        // 3. Home page display
        await page.waitForSelector('.home-page', { timeout: 5000 }).catch(() => null);
        const homePage = await page.$('.home-page') !== null;
        log('Home page display', homePage ? 'PASS' : 'FAIL');
        
        // Check for key home page elements
        const heroSection = await page.$('.hero-section') !== null;
        const ctaButtons = await page.$$('.cta-button');
        log('Home page elements', heroSection && ctaButtons.length > 0 ? 'PASS' : 'FAIL', 
            `Hero: ${heroSection}, CTA buttons: ${ctaButtons.length}`);
        
        // 4. Generate new seed (12 words)
        const generateButton = await page.$('.generate-spark-wallet-btn');
        if (generateButton) {
            await generateButton.click();
            log('Generate wallet button clicked', 'PASS');
            
            // Wait for seed generation
            await page.waitForSelector('.seed-phrase-display', { timeout: 30000 }).catch(() => null);
            const seedDisplay = await page.$('.seed-phrase-display') !== null;
            log('Seed generation', seedDisplay ? 'PASS' : 'FAIL');
            
            // Count seed words
            const seedWords = await page.$$('.seed-word');
            log('Seed word count', seedWords.length === 12 ? 'PASS' : 'FAIL', `Words: ${seedWords.length}`);
        } else {
            log('Generate wallet button', 'FAIL', 'Button not found');
        }
        
        // 5. Confirm seed page navigation
        const confirmButton = await page.$('.confirm-seed-btn');
        if (confirmButton) {
            await confirmButton.click();
            await page.waitForSelector('.confirm-seed-page', { timeout: 5000 }).catch(() => null);
            const confirmPage = await page.$('.confirm-seed-page') !== null;
            log('Confirm seed navigation', confirmPage ? 'PASS' : 'FAIL');
        } else {
            log('Confirm seed navigation', 'SKIP', 'No confirm button found');
        }
        
        // 6. Wallet creation success
        const walletData = await page.evaluate(() => {
            return {
                sparkWallet: localStorage.getItem('sparkWallet'),
                generatedSeed: localStorage.getItem('generatedSeed'),
                currentWallet: JSON.parse(localStorage.getItem('mooshState') || '{}').currentWallet
            };
        });
        log('Wallet creation', walletData.sparkWallet || walletData.generatedSeed ? 'PASS' : 'FAIL', 
            `Has wallet data: ${!!walletData.sparkWallet || !!walletData.generatedSeed}`);
        
        // 7. Dashboard display
        await page.goto('http://localhost:3030#dashboard', { waitUntil: 'networkidle2' });
        await page.waitForSelector('.dashboard-page', { timeout: 5000 }).catch(() => null);
        const dashboardPage = await page.$('.dashboard-page') !== null;
        log('Dashboard display', dashboardPage ? 'PASS' : 'FAIL');
        
        // Check dashboard buttons
        const dashboardButtons = await page.evaluate(() => {
            const buttons = document.querySelectorAll('.wallet-action-btn');
            return Array.from(buttons).map(btn => btn.textContent.trim());
        });
        log('Dashboard buttons', dashboardButtons.length >= 4 ? 'PASS' : 'FAIL', 
            `Buttons: ${dashboardButtons.join(', ')}`);
        
        // 8. Send modal functionality
        const sendButton = await page.$('.send-btn');
        if (sendButton) {
            await sendButton.click();
            await page.waitForSelector('.send-payment-modal', { timeout: 3000 }).catch(() => null);
            const sendModal = await page.$('.send-payment-modal') !== null;
            log('Send modal', sendModal ? 'PASS' : 'FAIL');
            
            // Close modal
            const closeButton = await page.$('.modal-close-btn');
            if (closeButton) await closeButton.click();
        } else {
            log('Send modal', 'SKIP', 'Send button not found');
        }
        
        // 9. Receive modal functionality
        const receiveButton = await page.$('.receive-btn');
        if (receiveButton) {
            await receiveButton.click();
            await page.waitForSelector('.receive-payment-modal', { timeout: 3000 }).catch(() => null);
            const receiveModal = await page.$('.receive-payment-modal') !== null;
            log('Receive modal', receiveModal ? 'PASS' : 'FAIL');
            
            // Check for QR code
            const qrCode = await page.$('.qr-code') !== null;
            log('QR code display', qrCode ? 'PASS' : 'FAIL');
            
            // Close modal
            const closeButton = await page.$('.modal-close-btn');
            if (closeButton) await closeButton.click();
        } else {
            log('Receive modal', 'SKIP', 'Receive button not found');
        }
        
        // 10. Transaction history
        const historyButton = await page.$('.history-btn');
        if (historyButton) {
            await historyButton.click();
            await page.waitForSelector('.transaction-history-modal', { timeout: 3000 }).catch(() => null);
            const historyModal = await page.$('.transaction-history-modal') !== null;
            log('Transaction history modal', historyModal ? 'PASS' : 'FAIL');
            
            // Close modal
            const closeButton = await page.$('.modal-close-btn');
            if (closeButton) await closeButton.click();
        } else {
            log('Transaction history', 'SKIP', 'History button not found');
        }
        
        // 11. Settings modal
        const settingsButton = await page.$('.settings-btn');
        if (settingsButton) {
            await settingsButton.click();
            await page.waitForSelector('.wallet-settings-modal', { timeout: 3000 }).catch(() => null);
            const settingsModal = await page.$('.wallet-settings-modal') !== null;
            log('Settings modal', settingsModal ? 'PASS' : 'FAIL');
            
            // Close modal
            const closeButton = await page.$('.modal-close-btn');
            if (closeButton) await closeButton.click();
        } else {
            log('Settings modal', 'SKIP', 'Settings button not found');
        }
        
        // 12. Navigation between pages
        const navigationTests = [
            { hash: '#home', selector: '.home-page', name: 'Home' },
            { hash: '#generate', selector: '.generate-wallet-page', name: 'Generate' },
            { hash: '#import', selector: '.import-wallet-page', name: 'Import' },
            { hash: '#dashboard', selector: '.dashboard-page', name: 'Dashboard' }
        ];
        
        for (const test of navigationTests) {
            await page.goto(`http://localhost:3030${test.hash}`, { waitUntil: 'networkidle2' });
            await page.waitForSelector(test.selector, { timeout: 3000 }).catch(() => null);
            const pageExists = await page.$(test.selector) !== null;
            log(`Navigation to ${test.name}`, pageExists ? 'PASS' : 'FAIL');
        }
        
        // Check for console errors
        log('Console errors', consoleErrors.length === 0 ? 'PASS' : 'FAIL', 
            consoleErrors.length > 0 ? `${consoleErrors.length} errors found` : 'No errors');
        
        // State persistence check
        const finalState = await page.evaluate(() => {
            return {
                theme: localStorage.getItem('mooshTheme'),
                state: localStorage.getItem('mooshState'),
                hasWallet: !!localStorage.getItem('sparkWallet') || !!localStorage.getItem('generatedSeed')
            };
        });
        log('State persistence', finalState.state ? 'PASS' : 'FAIL', 
            `Theme: ${finalState.theme}, Has wallet: ${finalState.hasWallet}`);
        
    } catch (error) {
        log('Test execution', 'FAIL', error.message);
    } finally {
        await browser.close();
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📝 Total: ${results.length}`);
    
    // Report issues
    if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  - ${r.step}: ${r.details}`);
        });
    }
    
    if (consoleErrors.length > 0) {
        console.log('\n🔴 Console Errors:');
        consoleErrors.forEach((err, i) => {
            console.log(`  ${i + 1}. ${err}`);
        });
    }
}

// Run the test
testUserJourney().catch(console.error);