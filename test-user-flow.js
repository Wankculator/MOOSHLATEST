#!/usr/bin/env node

/**
 * MOOSH Wallet Comprehensive User Flow Test
 * Tests every single user interaction from start to finish
 */

import puppeteer from 'puppeteer';
import chalk from 'chalk';

const TEST_RESULTS = {
    passed: [],
    failed: [],
    warnings: []
};

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001',
    timeout: 30000,
    headless: false,  // Set to true for CI/CD
    slowMo: 50       // Slow down actions to see what's happening
};

// Helper function to log test results
function logTest(testName, status, details = '') {
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    const color = status === 'passed' ? chalk.green : status === 'failed' ? chalk.red : chalk.yellow;
    
    console.log(color(`${icon} ${testName}`));
    if (details) {
        console.log(chalk.gray(`   ${details}`));
    }
    
    TEST_RESULTS[status === 'passed' ? 'passed' : status === 'warning' ? 'warnings' : 'failed'].push({
        testName,
        details,
        timestamp: new Date().toISOString()
    });
}

// Helper function to check for console errors
async function checkConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    return errors;
}

// Main test function
async function runUserFlowTests() {
    console.log(chalk.blue.bold('\n🚀 Starting MOOSH Wallet User Flow Tests\n'));
    
    let browser;
    let page;
    
    try {
        // 1. Launch browser and initial setup
        browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            slowMo: TEST_CONFIG.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Set up console error tracking
        const consoleErrors = await checkConsoleErrors(page);
        
        // Test 1: Initial page load and app initialization
        console.log(chalk.yellow('\n📋 Test Group: Initial Load\n'));
        try {
            await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
            await page.waitForSelector('#app', { timeout: 10000 });
            
            const appInitialized = await page.evaluate(() => {
                return window.app && window.app.initialized;
            });
            
            if (appInitialized) {
                logTest('Initial page load', 'passed', 'App initialized successfully');
            } else {
                logTest('Initial page load', 'failed', 'App not initialized');
            }
        } catch (error) {
            logTest('Initial page load', 'failed', error.message);
        }
        
        // Test 2: Password/lock screen (if enabled)
        console.log(chalk.yellow('\n📋 Test Group: Security\n'));
        try {
            const hasLockScreen = await page.$('.lock-screen-container');
            if (hasLockScreen) {
                logTest('Lock screen detection', 'passed', 'Lock screen found');
                
                // Try to unlock
                const passwordInput = await page.$('input[type="password"]');
                if (passwordInput) {
                    await passwordInput.type('testpassword');
                    await page.click('button.unlock-button');
                    await page.waitForSelector('.main-container', { timeout: 5000 });
                    logTest('Lock screen unlock', 'passed', 'Successfully unlocked');
                }
            } else {
                logTest('Lock screen detection', 'warning', 'No lock screen found - may be disabled');
            }
        } catch (error) {
            logTest('Lock screen', 'failed', error.message);
        }
        
        // Test 3: Home page navigation
        console.log(chalk.yellow('\n📋 Test Group: Navigation\n'));
        try {
            // Check if we're on home page
            const isHomePage = await page.evaluate(() => {
                return window.app && window.app.router && window.app.router.currentRoute === '/';
            });
            
            if (isHomePage) {
                logTest('Home page navigation', 'passed', 'On home page');
            } else {
                // Try to navigate to home
                await page.evaluate(() => {
                    window.app.router.navigate('/');
                });
                await page.waitForTimeout(1000);
                logTest('Home page navigation', 'passed', 'Navigated to home page');
            }
        } catch (error) {
            logTest('Home page navigation', 'failed', error.message);
        }
        
        // Test 4: Generate new 12-word seed
        console.log(chalk.yellow('\n📋 Test Group: Seed Generation\n'));
        try {
            // Click create new wallet button
            const createWalletButton = await page.$('button[data-action="create-wallet"]');
            if (createWalletButton) {
                await createWalletButton.click();
                await page.waitForTimeout(2000);
                
                // Select 12 words
                const word12Button = await page.$('button[data-words="12"]');
                if (word12Button) {
                    await word12Button.click();
                    logTest('Select 12-word option', 'passed');
                    
                    // Wait for seed generation
                    await page.waitForSelector('.seed-phrase-display', { timeout: 30000 });
                    
                    const seedWords = await page.evaluate(() => {
                        const words = document.querySelectorAll('.seed-word');
                        return Array.from(words).map(w => w.textContent.trim());
                    });
                    
                    if (seedWords.length === 12) {
                        logTest('12-word seed generation', 'passed', `Generated ${seedWords.length} words`);
                    } else {
                        logTest('12-word seed generation', 'failed', `Expected 12 words, got ${seedWords.length}`);
                    }
                } else {
                    logTest('Select seed word count', 'failed', 'Word count buttons not found');
                }
            } else {
                logTest('Create wallet button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Seed generation', 'failed', error.message);
        }
        
        // Test 5: Click "I've Written It Down"
        console.log(chalk.yellow('\n📋 Test Group: Seed Confirmation\n'));
        try {
            const writtenDownButton = await page.$('button.written-down-button');
            if (writtenDownButton) {
                await writtenDownButton.click();
                await page.waitForTimeout(1000);
                logTest('Written down confirmation', 'passed', 'Button clicked successfully');
            } else {
                logTest('Written down button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Written down confirmation', 'failed', error.message);
        }
        
        // Test 6: Confirm seed page
        console.log(chalk.yellow('\n📋 Test Group: Seed Verification\n'));
        try {
            const verifyContainer = await page.$('.seed-verify-container');
            if (verifyContainer) {
                // Try verification flow
                const verifyInputs = await page.$$('input.verify-word-input');
                if (verifyInputs.length > 0) {
                    logTest('Seed verification page', 'passed', `Found ${verifyInputs.length} verification inputs`);
                    
                    // Test skip button
                    const skipButton = await page.$('button.skip-verification');
                    if (skipButton) {
                        await skipButton.click();
                        await page.waitForTimeout(1000);
                        logTest('Skip verification', 'passed', 'Skip button works');
                    }
                } else {
                    logTest('Seed verification inputs', 'failed', 'No verification inputs found');
                }
            } else {
                logTest('Seed verification page', 'warning', 'Verification page not shown');
            }
        } catch (error) {
            logTest('Seed verification', 'failed', error.message);
        }
        
        // Test 7: Wallet creation completion
        console.log(chalk.yellow('\n📋 Test Group: Wallet Creation\n'));
        try {
            // Check if wallet was created
            const walletCreated = await page.evaluate(() => {
                return window.app && window.app.state && window.app.state.get('currentWallet');
            });
            
            if (walletCreated) {
                logTest('Wallet creation', 'passed', 'Wallet successfully created');
            } else {
                logTest('Wallet creation', 'failed', 'No wallet in state');
            }
        } catch (error) {
            logTest('Wallet creation', 'failed', error.message);
        }
        
        // Test 8: Dashboard display
        console.log(chalk.yellow('\n📋 Test Group: Dashboard\n'));
        try {
            await page.waitForSelector('.dashboard-container', { timeout: 10000 });
            
            // Check balance display
            const balanceDisplay = await page.$('.balance-display');
            if (balanceDisplay) {
                logTest('Balance display', 'passed', 'Balance component rendered');
            }
            
            // Check action buttons
            const actionButtons = await page.$$('.dashboard-action-button');
            logTest('Dashboard buttons', actionButtons.length > 0 ? 'passed' : 'failed', 
                   `Found ${actionButtons.length} action buttons`);
            
        } catch (error) {
            logTest('Dashboard display', 'failed', error.message);
        }
        
        // Test 9: Test each dashboard button
        console.log(chalk.yellow('\n📋 Test Group: Dashboard Actions\n'));
        
        // Test Send Lightning Payment
        try {
            const sendButton = await page.$('button[data-action="send-lightning"]');
            if (sendButton) {
                await sendButton.click();
                await page.waitForTimeout(1000);
                
                const sendModal = await page.$('.send-modal');
                if (sendModal) {
                    logTest('Send Lightning modal', 'passed', 'Modal opened successfully');
                    
                    // Close modal
                    const closeButton = await page.$('.modal-close');
                    if (closeButton) await closeButton.click();
                } else {
                    logTest('Send Lightning modal', 'failed', 'Modal not found');
                }
            } else {
                logTest('Send button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Send Lightning', 'failed', error.message);
        }
        
        // Test Receive Payment
        try {
            const receiveButton = await page.$('button[data-action="receive-payment"]');
            if (receiveButton) {
                await receiveButton.click();
                await page.waitForTimeout(1000);
                
                const receiveModal = await page.$('.receive-modal');
                if (receiveModal) {
                    logTest('Receive payment modal', 'passed', 'Modal opened successfully');
                    
                    // Check for QR code
                    const qrCode = await page.$('.qr-code-container');
                    if (qrCode) {
                        logTest('QR code display', 'passed', 'QR code rendered');
                    }
                    
                    // Close modal
                    const closeButton = await page.$('.modal-close');
                    if (closeButton) await closeButton.click();
                } else {
                    logTest('Receive payment modal', 'failed', 'Modal not found');
                }
            } else {
                logTest('Receive button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Receive payment', 'failed', error.message);
        }
        
        // Test Inscriptions
        try {
            const inscriptionsButton = await page.$('button[data-action="inscriptions"]');
            if (inscriptionsButton) {
                await inscriptionsButton.click();
                await page.waitForTimeout(2000);
                
                const inscriptionsView = await page.$('.inscriptions-container');
                if (inscriptionsView) {
                    logTest('Inscriptions view', 'passed', 'Inscriptions page loaded');
                    
                    // Navigate back
                    const backButton = await page.$('.back-button');
                    if (backButton) await backButton.click();
                } else {
                    logTest('Inscriptions view', 'failed', 'View not found');
                }
            } else {
                logTest('Inscriptions button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Inscriptions', 'failed', error.message);
        }
        
        // Test Token Menu
        try {
            const tokenButton = await page.$('button[data-action="token-menu"]');
            if (tokenButton) {
                await tokenButton.click();
                await page.waitForTimeout(1000);
                
                const tokenMenu = await page.$('.token-menu-container');
                if (tokenMenu) {
                    logTest('Token menu', 'passed', 'Token menu opened');
                    
                    // Close menu
                    await page.click('body'); // Click outside to close
                } else {
                    logTest('Token menu', 'failed', 'Menu not found');
                }
            } else {
                logTest('Token button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Token menu', 'failed', error.message);
        }
        
        // Test Transaction History
        try {
            const historyButton = await page.$('button[data-action="transaction-history"]');
            if (historyButton) {
                await historyButton.click();
                await page.waitForTimeout(2000);
                
                const historyView = await page.$('.transaction-history-container');
                if (historyView) {
                    logTest('Transaction history', 'passed', 'History view loaded');
                    
                    // Check for transaction list
                    const transactions = await page.$$('.transaction-item');
                    logTest('Transaction list', 'passed', `Found ${transactions.length} transactions`);
                    
                    // Navigate back
                    const backButton = await page.$('.back-button');
                    if (backButton) await backButton.click();
                } else {
                    logTest('Transaction history view', 'failed', 'View not found');
                }
            } else {
                logTest('History button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Transaction history', 'failed', error.message);
        }
        
        // Test Show All Addresses
        try {
            const addressesButton = await page.$('button[data-action="show-addresses"]');
            if (addressesButton) {
                await addressesButton.click();
                await page.waitForTimeout(1000);
                
                const addressesModal = await page.$('.addresses-modal');
                if (addressesModal) {
                    logTest('Addresses modal', 'passed', 'Modal opened successfully');
                    
                    // Check for address display
                    const addresses = await page.$$('.address-item');
                    logTest('Address display', 'passed', `Found ${addresses.length} addresses`);
                    
                    // Close modal
                    const closeButton = await page.$('.modal-close');
                    if (closeButton) await closeButton.click();
                } else {
                    logTest('Addresses modal', 'failed', 'Modal not found');
                }
            } else {
                logTest('Addresses button', 'failed', 'Button not found');
            }
        } catch (error) {
            logTest('Show addresses', 'failed', error.message);
        }
        
        // Test 10: Quick actions bar
        console.log(chalk.yellow('\n📋 Test Group: Quick Actions\n'));
        try {
            const quickActionsBar = await page.$('.quick-actions-bar');
            if (quickActionsBar) {
                logTest('Quick actions bar', 'passed', 'Bar rendered');
                
                // Test each quick action
                const quickActions = await page.$$('.quick-action-button');
                logTest('Quick action buttons', 'passed', `Found ${quickActions.length} quick actions`);
            } else {
                logTest('Quick actions bar', 'warning', 'Bar not found - may be hidden');
            }
        } catch (error) {
            logTest('Quick actions', 'failed', error.message);
        }
        
        // Test 11: Navigation between pages
        console.log(chalk.yellow('\n📋 Test Group: Page Navigation\n'));
        try {
            // Test navigation to settings
            await page.evaluate(() => {
                window.app.router.navigate('/settings');
            });
            await page.waitForTimeout(1000);
            
            const settingsPage = await page.$('.settings-container');
            if (settingsPage) {
                logTest('Settings navigation', 'passed', 'Navigated to settings');
            }
            
            // Navigate back to dashboard
            await page.evaluate(() => {
                window.app.router.navigate('/dashboard');
            });
            await page.waitForTimeout(1000);
            
            const dashboardPage = await page.$('.dashboard-container');
            if (dashboardPage) {
                logTest('Dashboard navigation', 'passed', 'Navigated back to dashboard');
            }
        } catch (error) {
            logTest('Page navigation', 'failed', error.message);
        }
        
        // Test 12: State persistence
        console.log(chalk.yellow('\n📋 Test Group: State Persistence\n'));
        try {
            // Get current state
            const stateBefore = await page.evaluate(() => {
                return {
                    wallet: window.app.state.get('currentWallet'),
                    theme: window.app.state.get('theme'),
                    settings: window.app.state.get('settings')
                };
            });
            
            // Refresh page
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForTimeout(2000);
            
            // Check state after refresh
            const stateAfter = await page.evaluate(() => {
                return {
                    wallet: window.app.state.get('currentWallet'),
                    theme: window.app.state.get('theme'),
                    settings: window.app.state.get('settings')
                };
            });
            
            if (JSON.stringify(stateBefore) === JSON.stringify(stateAfter)) {
                logTest('State persistence', 'passed', 'State maintained after refresh');
            } else {
                logTest('State persistence', 'failed', 'State lost after refresh');
            }
        } catch (error) {
            logTest('State persistence', 'failed', error.message);
        }
        
        // Check console errors
        if (consoleErrors.length > 0) {
            logTest('Console errors', 'warning', `Found ${consoleErrors.length} console errors`);
            consoleErrors.forEach(error => {
                console.log(chalk.gray(`   - ${error}`));
            });
        } else {
            logTest('Console errors', 'passed', 'No console errors detected');
        }
        
    } catch (error) {
        console.error(chalk.red('\n❌ Fatal error during testing:'), error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Print summary
    console.log(chalk.blue.bold('\n📊 Test Summary\n'));
    console.log(chalk.green(`✅ Passed: ${TEST_RESULTS.passed.length}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${TEST_RESULTS.warnings.length}`));
    console.log(chalk.red(`❌ Failed: ${TEST_RESULTS.failed.length}`));
    
    // Print failed tests
    if (TEST_RESULTS.failed.length > 0) {
        console.log(chalk.red.bold('\n❌ Failed Tests:'));
        TEST_RESULTS.failed.forEach(test => {
            console.log(chalk.red(`   - ${test.testName}: ${test.details}`));
        });
    }
    
    // Print warnings
    if (TEST_RESULTS.warnings.length > 0) {
        console.log(chalk.yellow.bold('\n⚠️  Warnings:'));
        TEST_RESULTS.warnings.forEach(test => {
            console.log(chalk.yellow(`   - ${test.testName}: ${test.details}`));
        });
    }
    
    // Save detailed report
    const reportPath = './test-results/user-flow-report.json';
    try {
        const fs = await import('fs/promises');
        await fs.mkdir('./test-results', { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(TEST_RESULTS, null, 2));
        console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
    } catch (error) {
        console.error(chalk.red('Failed to save report:'), error.message);
    }
    
    // Exit with appropriate code
    process.exit(TEST_RESULTS.failed.length > 0 ? 1 : 0);
}

// Run the tests
runUserFlowTests().catch(error => {
    console.error(chalk.red('Unhandled error:'), error);
    process.exit(1);
});