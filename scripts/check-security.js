#!/usr/bin/env node

/**
 * Security MCP - Crypto wallet security scanner
 * Critical for MOOSH Wallet security validation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔐 Security MCP - Scanning MOOSH Wallet for vulnerabilities...\n');

let securityIssues = [];
let warnings = [];

// Files to scan
const filesToScan = [
    'public/js/moosh-wallet.js',
    'src/server/api-server.js',
    'src/server/services/walletService.js',
    'src/server/services/sparkSDKService.js'
];

// Security patterns to check
const dangerousPatterns = [
    { pattern: /eval\s*\(/, name: 'eval() usage', severity: 'CRITICAL' },
    { pattern: /innerHTML\s*=\s*`[^`]*\$\{/, name: 'innerHTML with template literal', severity: 'HIGH' },
    { pattern: /innerHTML\s*\=\s*[^'"`\s]+\s*\+/, name: 'innerHTML with concatenation', severity: 'HIGH' },
    { pattern: /document\.write/, name: 'document.write usage', severity: 'HIGH' },
    { pattern: /crypto\.randomBytes\(\d+\)/, name: 'Weak random bytes', severity: 'MEDIUM', checkSize: true },
    { pattern: /localStorage\.setItem\(['"].*(?:key|seed|mnemonic|private)/, name: 'Sensitive data in localStorage', severity: 'CRITICAL' },
    { pattern: /console\.log\(.*(?:privateKey|mnemonic|seed)/, name: 'Logging sensitive data', severity: 'CRITICAL' },
    { pattern: /\bhttp:\/\/(?!www\.w3\.org\/2000\/svg)/, name: 'Insecure HTTP usage', severity: 'HIGH' },
    { pattern: /Math\.random\(\).*(?:key|seed|mnemonic|private|wallet|address|entropy)/i, name: 'Math.random for crypto', severity: 'CRITICAL' },
    { pattern: /Math\.random\(\)/, name: 'Math.random usage', severity: 'LOW' }
];

// Good security patterns to validate
const requiredPatterns = [
    { pattern: /crypto\.randomBytes\(32\)/, name: 'Proper 256-bit entropy' },
    { pattern: /\.replace\(/g, name: 'Input sanitization' },
    { pattern: /try\s*{[\s\S]*?}\s*catch/, name: 'Error handling' }
];

console.log('📋 Scanning files for security issues...\n');

filesToScan.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} (not found)`);
        return;
    }
    
    console.log(`🔍 Scanning: ${filePath}`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check dangerous patterns
    dangerousPatterns.forEach(({ pattern, name, severity, checkSize, customCheck }) => {
        const matches = content.match(pattern);
        if (matches) {
            if (checkSize && pattern.toString().includes('randomBytes')) {
                // Check if randomBytes has proper size
                matches.forEach(match => {
                    const sizeMatch = match.match(/randomBytes\((\d+)\)/);
                    if (sizeMatch && parseInt(sizeMatch[1]) < 32) {
                        securityIssues.push({
                            file: filePath,
                            issue: `${name} - Only ${sizeMatch[1]} bytes (need 32+)`,
                            severity
                        });
                    }
                });
            } else if (customCheck && name.includes('innerHTML')) {
                // Custom check for innerHTML - exclude safe patterns
                const actualDangerousMatches = matches.filter(match => {
                    // Skip if it's just clearing content (innerHTML = '' or innerHTML = "")
                    return !match.match(/innerHTML\s*=\s*['"`]\s*['"`]/);
                });
                if (actualDangerousMatches.length > 0) {
                    console.log(`   Found dangerous innerHTML patterns: ${actualDangerousMatches.join(', ')}`);
                    securityIssues.push({
                        file: filePath,
                        issue: name,
                        severity,
                        count: actualDangerousMatches.length
                    });
                }
            } else {
                securityIssues.push({
                    file: filePath,
                    issue: name,
                    severity,
                    count: matches.length
                });
            }
        }
    });
    
    // Check for required patterns
    let hasGoodPatterns = 0;
    requiredPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
            hasGoodPatterns++;
        }
    });
    
    if (hasGoodPatterns < 2) {
        warnings.push({
            file: filePath,
            warning: 'Missing security best practices'
        });
    }
});

// Check for exposed API keys
console.log('\n🔑 Checking for exposed API keys...');
const configFiles = ['package.json', '.env', 'config.json'];
configFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const apiKeyPatterns = [
            /['"]api[_-]?key['"]\s*:\s*['"][^'"]+['"]/i,
            /APIKEY\s*=\s*[^\s]+/,
            /['"]secret['"]\s*:\s*['"][^'"]+['"]/i
        ];
        
        apiKeyPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                securityIssues.push({
                    file,
                    issue: 'Possible API key exposure',
                    severity: 'HIGH'
                });
            }
        });
    }
});

// Check CORS configuration
console.log('\n🌐 Checking CORS configuration...');
const apiServerPath = path.join(__dirname, '../src/server/api-server.js');
if (fs.existsSync(apiServerPath)) {
    const apiContent = fs.readFileSync(apiServerPath, 'utf-8');
    if (apiContent.includes('Access-Control-Allow-Origin: *')) {
        warnings.push({
            file: 'api-server.js',
            warning: 'CORS allows all origins - consider restricting'
        });
    }
}

// Check for proper HTTPS enforcement
console.log('\n🔒 Checking HTTPS enforcement...');
const hasHTTPSRedirect = filesToScan.some(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.includes('https://') || content.includes('forceSSL');
    }
    return false;
});

if (!hasHTTPSRedirect) {
    warnings.push({
        warning: 'No HTTPS enforcement detected'
    });
}

// Report results
console.log('\n📊 Security Scan Results:');
console.log('========================\n');

if (securityIssues.length === 0) {
    console.log('✅ No critical security issues found!');
} else {
    console.log(`❌ Found ${securityIssues.length} security issues:\n`);
    
    // Group by severity
    const critical = securityIssues.filter(i => i.severity === 'CRITICAL');
    const high = securityIssues.filter(i => i.severity === 'HIGH');
    const medium = securityIssues.filter(i => i.severity === 'MEDIUM');
    const low = securityIssues.filter(i => i.severity === 'LOW');
    
    if (critical.length > 0) {
        console.log('🚨 CRITICAL Issues:');
        critical.forEach(issue => {
            console.log(`   - ${issue.file}: ${issue.issue}${issue.count ? ` (${issue.count} occurrences)` : ''}`);
        });
    }
    
    if (high.length > 0) {
        console.log('\n⚠️  HIGH Priority Issues:');
        high.forEach(issue => {
            console.log(`   - ${issue.file}: ${issue.issue}${issue.count ? ` (${issue.count} occurrences)` : ''}`);
        });
    }
    
    if (medium.length > 0) {
        console.log('\n⚡ MEDIUM Priority Issues:');
        medium.forEach(issue => {
            console.log(`   - ${issue.file}: ${issue.issue}${issue.count ? ` (${issue.count} occurrences)` : ''}`);
        });
    }
    
    if (low.length > 0) {
        console.log('\n💡 LOW Priority Issues:');
        low.forEach(issue => {
            console.log(`   - ${issue.file}: ${issue.issue}${issue.count ? ` (${issue.count} occurrences)` : ''}`);
        });
    }
}

if (warnings.length > 0) {
    console.log('\n💡 Security Warnings:');
    warnings.forEach(warning => {
        console.log(`   - ${warning.file || 'General'}: ${warning.warning}`);
    });
}

// Recommendations
console.log('\n🛡️ Security Recommendations:');
console.log('   1. Use crypto.randomBytes(32) for all key generation');
console.log('   2. Never store private keys in localStorage - use encrypted storage');
console.log('   3. Sanitize all user inputs before display');
console.log('   4. Implement Content Security Policy (CSP)');
console.log('   5. Use HTTPS everywhere, including local development');
console.log('   6. Implement rate limiting on all API endpoints');
console.log('   7. Add input validation for all wallet addresses');
console.log('   8. Use constant-time comparison for sensitive data');

// Exit with error if critical or high severity issues found
const criticalOrHigh = securityIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
if (criticalOrHigh.length > 0) {
    console.log('\n❌ Security MCP: FAILED - Critical/High issues must be fixed!');
    process.exit(1);
} else if (securityIssues.length > 0) {
    console.log('\n⚠️  Security MCP: PASSED with warnings - Please address security issues');
} else {
    console.log('\n✅ Security MCP: PASSED - Good security practices detected');
}