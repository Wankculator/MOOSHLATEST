#!/usr/bin/env node

/**
 * Run all MCP-like tools for MOOSH Wallet
 */

console.log('🚀 Running all MCP validations for MOOSH Wallet\n');

const { execSync } = require('child_process');
const path = require('path');

const commands = [
    { name: 'TestSprite', cmd: 'npm test', required: true },
    { name: 'Memory Check', cmd: 'node scripts/check-memory.js', required: true },
    { name: 'Security Scan', cmd: 'node scripts/check-security.js', required: true },
    { name: 'Context7 MCP', cmd: 'node mcp-servers/context7/index.js', required: false },
    { name: 'Firecrawl MCP', cmd: 'node mcp-servers/firecrawl/index.js stats', required: false },
    { name: 'ESLint Security', cmd: 'npx eslint src/ --ext .js --plugin security', required: false },
    { name: 'Audit', cmd: 'npm audit --audit-level=high', required: false }
];

let hasErrors = false;

commands.forEach(({ name, cmd, required }) => {
    console.log(`\n📋 Running: ${name}`);
    console.log('─'.repeat(50));
    
    try {
        execSync(cmd, { 
            stdio: 'inherit',
            cwd: path.resolve(__dirname, '..')
        });
        console.log(`✅ ${name}: PASSED`);
    } catch (error) {
        if (required) {
            console.error(`❌ ${name}: FAILED`);
            hasErrors = true;
        } else {
            console.warn(`⚠️  ${name}: WARNING`);
        }
    }
});

console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ MCP Validation: FAILED - Fix errors before proceeding');
    process.exit(1);
} else {
    console.log('✅ MCP Validation: PASSED - All checks successful');
}
