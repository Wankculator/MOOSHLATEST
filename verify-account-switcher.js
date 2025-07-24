#!/usr/bin/env node

/**
 * Verification script specifically for AccountSwitcher functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AccountSwitcher Verification Script\n');
console.log('══════════════════════════════════════\n');

const mooshWalletPath = path.join(__dirname, 'public/js/moosh-wallet.js');
const content = fs.readFileSync(mooshWalletPath, 'utf8');

// Find AccountSwitcher class
const accountSwitcherMatch = content.match(/class\s+AccountSwitcher\s+extends\s+Component\s*{[\s\S]*?^\s*}\s*$/m);

if (accountSwitcherMatch) {
    console.log('✅ AccountSwitcher class found!');
    const accountSwitcherCode = accountSwitcherMatch[0];
    
    // Count lines
    const lineCount = accountSwitcherCode.split('\n').length;
    console.log(`   Lines of code: ${lineCount}`);
    
    // Check methods
    console.log('\n📋 Method Verification:');
    const methods = [
        'constructor',
        'render',
        'mount',
        'toggleDropdown',
        'switchToAccount',
        'updateDisplay',
        'handleClickOutside',
        'setState',
        'unmount'
    ];
    
    methods.forEach(method => {
        const hasMethod = accountSwitcherCode.includes(`${method}(`);
        console.log(`   ${hasMethod ? '✅' : '❌'} ${method}()`);
    });
    
    // Check integration
    console.log('\n📋 Integration Check:');
    
    // Check if it's instantiated in DashboardPage
    const dashboardIntegration = content.includes('new AccountSwitcher(this.app)');
    console.log(`   ${dashboardIntegration ? '✅' : '❌'} Created in DashboardPage`);
    
    // Check if mount is called
    const mountCall = content.includes('accountSwitcher.mount(');
    console.log(`   ${mountCall ? '✅' : '❌'} Mount method called`);
    
    // Check if container exists
    const containerExists = content.includes('accountSwitcherContainer');
    console.log(`   ${containerExists ? '✅' : '❌'} Container element exists`);
    
    // Check styles
    console.log('\n📋 Styling Check:');
    const hasStyles = content.includes('addAccountSwitcherStyles');
    console.log(`   ${hasStyles ? '✅' : '❌'} Style method exists`);
    
    const styleClasses = [
        'account-switcher',
        'account-switcher-trigger',
        'account-dropdown',
        'account-item',
        'account-name',
        'account-balance'
    ];
    
    console.log('   CSS Classes:');
    styleClasses.forEach(className => {
        const hasClass = content.includes(`.${className}`);
        console.log(`     ${hasClass ? '✅' : '❌'} .${className}`);
    });
    
    // Check state integration
    console.log('\n📋 State Management Integration:');
    const stateChecks = [
        { method: 'getCurrentAccount', desc: 'Get current account' },
        { method: 'getAccounts', desc: 'Get all accounts' },
        { method: 'switchAccount', desc: 'Switch account' }
    ];
    
    stateChecks.forEach(check => {
        const hasMethod = accountSwitcherCode.includes(`state.${check.method}(`);
        console.log(`   ${hasMethod ? '✅' : '❌'} Uses state.${check.method}()`);
    });
    
} else {
    console.log('❌ AccountSwitcher class not found!');
}

// Check for potential issues
console.log('\n⚠️  Potential Issues Check:');

// Check for console.log statements
const consoleLogs = (content.match(/console\.log\(/g) || []).length;
console.log(`   Console.log statements: ${consoleLogs} ${consoleLogs > 50 ? '(Consider removing some)' : '✅'}`);

// Check for TODO comments
const todos = (content.match(/TODO:/gi) || []).length;
console.log(`   TODO comments: ${todos} ${todos > 0 ? '(Review these)' : '✅'}`);

// Check file size
const stats = fs.statSync(mooshWalletPath);
const fileSizeKB = Math.round(stats.size / 1024);
console.log(`   File size: ${fileSizeKB}KB ${fileSizeKB > 2000 ? '(Large file!)' : '✅'}`);

console.log('\n✅ Verification complete!');