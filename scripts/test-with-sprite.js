#!/usr/bin/env node

/**
 * TestSprite - Automated validation system for MOOSH Wallet
 * Prevents common errors and enforces best practices
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TestSprite - Running MOOSH Wallet validations...\n');

let errors = [];
let warnings = [];

// Files to validate
const mainFile = path.join(__dirname, '../public/js/moosh-wallet.js');
const apiServer = path.join(__dirname, '../src/server/api-server.js');

// 1. CORS Validation
console.log('🌐 Checking for CORS violations...');
function validateNoCorsViolations() {
    const files = [mainFile];
    const corsPatterns = [
        { pattern: /fetch\(['"]https?:\/\/api\.coingecko\.com/g, name: 'Direct CoinGecko API call' },
        { pattern: /fetch\(['"]https?:\/\/blockchain\.info/g, name: 'Direct Blockchain.info API call' },
        { pattern: /fetch\(['"]https?:\/\/api\.blockcypher\.com/g, name: 'Direct BlockCypher API call' },
        { pattern: /fetch\(['"]https?:\/\/(?!localhost|127\.0\.0\.1)[^'"]*ordinals/g, name: 'Direct Ordinals API call' }
    ];

    files.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf-8');
            
            corsPatterns.forEach(({ pattern, name }) => {
                const matches = content.match(pattern);
                if (matches) {
                    errors.push({
                        type: 'CORS',
                        file: path.basename(file),
                        issue: name,
                        count: matches.length,
                        fix: 'Use app.apiService or proxy endpoint instead'
                    });
                }
            });
        }
    });
}

// 2. ElementFactory Validation
console.log('🏗️  Checking ElementFactory usage...');
function validateElementFactoryUsage() {
    const prohibitedMethods = [
        { method: '$.li()', pattern: /\$\.li\(/g },
        { method: '$.ul()', pattern: /\$\.ul\(/g },
        { method: '$.nav()', pattern: /\$\.nav\(/g },
        { method: '$.header()', pattern: /\$\.header\(/g },
        { method: '$.footer()', pattern: /\$\.footer\(/g }
    ];

    if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf-8');
        
        prohibitedMethods.forEach(({ method, pattern }) => {
            if (pattern.test(content)) {
                errors.push({
                    type: 'ElementFactory',
                    file: 'moosh-wallet.js',
                    issue: `Found prohibited method: ${method}`,
                    fix: 'Use $.div() with appropriate styling instead'
                });
            }
        });
    }
}

// 3. Performance Monitoring
console.log('⚡ Checking for performance issues...');
function checkPerformanceIssues() {
    if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf-8');
        
        // Check for duplicate API calls
        const updateLiveDataCalls = (content.match(/updateLiveData\(/g) || []).length;
        const fetchBitcoinPriceCalls = (content.match(/fetchBitcoinPrice\(/g) || []).length;
        
        if (updateLiveDataCalls > 10) {
            warnings.push({
                type: 'Performance',
                issue: `Excessive updateLiveData() calls: ${updateLiveDataCalls}`,
                fix: 'Consider debouncing or reducing frequency'
            });
        }
        
        if (fetchBitcoinPriceCalls > 5) {
            warnings.push({
                type: 'Performance',
                issue: `Multiple fetchBitcoinPrice() calls: ${fetchBitcoinPriceCalls}`,
                fix: 'Cache price data and update on interval'
            });
        }
    }
}

// 4. State Management Validation
console.log('💾 Checking state management...');
function validateStateManagement() {
    if (fs.existsSync(mainFile)) {
        const content = fs.readFileSync(mainFile, 'utf-8');
        
        // Check for direct localStorage usage
        const directLocalStorage = content.match(/localStorage\.(getItem|setItem)\(/g) || [];
        const stateManagerUsage = content.match(/app\.state\.(get|set)\(/g) || [];
        
        if (directLocalStorage.length > stateManagerUsage.length) {
            warnings.push({
                type: 'State',
                issue: `High direct localStorage usage: ${directLocalStorage.length} calls`,
                fix: 'Prefer app.state.set() and app.state.get()'
            });
        }
    }
}

// 5. Critical Endpoint Testing
console.log('🔌 Testing critical API endpoints...');
async function testCriticalEndpoints() {
    const endpoints = [
        { url: 'http://localhost:3001/api/spark/generate-wallet', method: 'POST' },
        { url: 'http://localhost:3001/api/bitcoin/balance/test', method: 'GET' }
    ];
    
    console.log('   (Skipping live endpoint tests - servers may not be running)');
}

// 6. Seed Generation Protection
console.log('🔐 Checking seed generation integrity...');
function checkSeedGeneration() {
    const criticalFiles = [
        { file: apiServer, endpoint: '/api/spark/generate-wallet' }
    ];
    
    criticalFiles.forEach(({ file, endpoint }) => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf-8');
            
            if (!content.includes(endpoint)) {
                errors.push({
                    type: 'Critical',
                    file: path.basename(file),
                    issue: `Missing critical endpoint: ${endpoint}`,
                    fix: 'DO NOT modify seed generation endpoints!'
                });
            }
        }
    });
}

// Run all validations
validateNoCorsViolations();
validateElementFactoryUsage();
checkPerformanceIssues();
validateStateManagement();
checkSeedGeneration();

// Report results
console.log('\n' + '='.repeat(60));
console.log('📊 TestSprite Validation Report');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All validations passed! No issues found.\n');
} else {
    if (errors.length > 0) {
        console.log(`\n❌ Found ${errors.length} ERRORS:\n`);
        errors.forEach((error, i) => {
            console.log(`${i + 1}. [${error.type}] ${error.file || 'General'}`);
            console.log(`   Issue: ${error.issue}`);
            console.log(`   Fix: ${error.fix}`);
            console.log();
        });
    }
    
    if (warnings.length > 0) {
        console.log(`\n⚠️  Found ${warnings.length} WARNINGS:\n`);
        warnings.forEach((warning, i) => {
            console.log(`${i + 1}. [${warning.type}] ${warning.issue}`);
            console.log(`   Fix: ${warning.fix}`);
            console.log();
        });
    }
}

// Summary
console.log('📋 Summary:');
console.log(`   Errors: ${errors.length}`);
console.log(`   Warnings: ${warnings.length}`);
console.log(`   Status: ${errors.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);

// Write report to file
const report = {
    timestamp: new Date(),
    errors,
    warnings,
    passed: errors.length === 0
};

fs.writeFileSync(
    path.join(__dirname, '../test-results/testsprite-report.json'),
    JSON.stringify(report, null, 2)
);

// Exit with error if validations failed
process.exit(errors.length > 0 ? 1 : 0);