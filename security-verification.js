#!/usr/bin/env node

/**
 * Security verification script to ensure no sensitive data is exposed
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Security Verification Script\n');
console.log('═══════════════════════════════════\n');

const mooshWalletPath = path.join(__dirname, 'public/js/moosh-wallet.js');
const content = fs.readFileSync(mooshWalletPath, 'utf8');

let securityIssues = 0;
let passed = 0;

function checkSecurity(description, pattern, shouldNotExist = true) {
    const matches = content.match(pattern);
    const found = matches && matches.length > 0;
    
    if (shouldNotExist && !found) {
        console.log(`✅ ${description}: Not found (secure)`);
        passed++;
    } else if (!shouldNotExist && found) {
        console.log(`✅ ${description}: Found (expected)`);
        passed++;
    } else {
        console.log(`❌ ${description}: ${found ? 'Found' : 'Not found'} (${shouldNotExist ? 'security risk' : 'missing required'})`);
        if (matches) {
            console.log(`   Found ${matches.length} instance(s):`);
            matches.slice(0, 3).forEach(match => {
                console.log(`   - "${match.substring(0, 80)}..."`);
            });
        }
        securityIssues++;
    }
}

console.log('🔍 Checking for sensitive data exposure:\n');

// Check for seed/mnemonic logging
checkSecurity(
    'Seed phrase in console.log',
    /console\.log\s*\([^)]*seed[^)]*\)/gi
);

checkSecurity(
    'Mnemonic in console.log', 
    /console\.log\s*\([^)]*mnemonic[^)]*\)/gi
);

// Check for hardcoded credentials
checkSecurity(
    'Hardcoded passwords',
    /(?:password|pass|pwd)\s*[:=]\s*["'][^"']+["']/gi
);

checkSecurity(
    'Hardcoded API keys',
    /(?:api_?key|apikey|key)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/gi
);

checkSecurity(
    'Hardcoded secrets',
    /(?:secret|token)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/gi
);

// Check for private key exposure
checkSecurity(
    'Private key logging',
    /console\.log\s*\([^)]*(?:private|priv)[\s_-]?key[^)]*\)/gi
);

// Check for proper password handling
console.log('\n🔍 Checking password handling:\n');
checkSecurity(
    'Password from localStorage',
    /localStorage\.getItem\s*\(\s*['"]walletPassword['"]\s*\)/,
    false // This SHOULD exist
);

checkSecurity(
    'Password encryption/hashing',
    /(?:hash|encrypt|bcrypt|scrypt|pbkdf2)/i,
    false // This SHOULD exist for security
);

// Summary
console.log('\n═══════════════════════════════════');
console.log(`\n📊 Security Summary:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Issues: ${securityIssues}`);
console.log(`   📈 Security Score: ${Math.round((passed / (passed + securityIssues)) * 100)}%`);

if (securityIssues === 0) {
    console.log('\n🎉 All security checks passed!');
    console.log('✅ No sensitive data exposure detected.');
} else {
    console.log('\n⚠️  Security issues detected!');
    console.log('Please fix the issues above before deployment.');
}

// Additional recommendations
console.log('\n💡 Security Recommendations:');
if (!content.includes('hash') && !content.includes('encrypt')) {
    console.log('   - Consider hashing passwords before storage');
}
if (content.match(/console\.log/g)?.length > 100) {
    console.log('   - Remove debug console.log statements for production');
}
console.log('   - Always use HTTPS in production');
console.log('   - Implement rate limiting for API endpoints');

console.log('\n✅ Security verification complete!');