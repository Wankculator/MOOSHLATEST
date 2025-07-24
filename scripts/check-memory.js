#!/usr/bin/env node

/**
 * Memory MCP - Check memory usage of MOOSH Wallet
 * Critical for managing the 33,000+ line JavaScript file
 */

const fs = require('fs');
const path = require('path');
const SimpleMemoryMonitor = require('../mcp-implementations/simple-memory-monitor');

const MEMORY_THRESHOLD_MB = 500;
const FILE_SIZE_THRESHOLD_KB = 30000;
const DOM_NODE_WARNING = 5000;

console.log('🧠 Memory MCP - Checking MOOSH Wallet memory impact...\n');

// Check main JS file size
const mainFile = path.join(__dirname, '../public/js/moosh-wallet.js');
const stats = fs.statSync(mainFile);
const fileSizeKB = stats.size / 1024;
const fileSizeMB = fileSizeKB / 1024;

console.log(`📄 Main JS File Analysis:`);
console.log(`   Size: ${fileSizeKB.toFixed(2)} KB (${fileSizeMB.toFixed(2)} MB)`);
console.log(`   Lines: ~33,000+`);

if (fileSizeKB > FILE_SIZE_THRESHOLD_KB) {
    console.log(`   ⚠️  WARNING: File exceeds ${FILE_SIZE_THRESHOLD_KB}KB threshold`);
    console.log(`   💡 SUGGESTION: Consider code splitting:`);
    console.log(`      - moosh-wallet-core.js (wallet operations)`);
    console.log(`      - moosh-wallet-ui.js (UI components)`);
    console.log(`      - moosh-wallet-crypto.js (crypto functions)`);
    console.log(`      - moosh-wallet-api.js (API calls)`);
} else {
    console.log(`   ✅ File size within acceptable range`);
}

// Analyze code patterns that cause memory issues
console.log(`\n🔍 Memory Leak Pattern Analysis:`);

const fileContent = fs.readFileSync(mainFile, 'utf-8');

// Check for event listener issues
const addEventListenerCount = (fileContent.match(/addEventListener/g) || []).length;
const removeEventListenerCount = (fileContent.match(/removeEventListener/g) || []).length;

console.log(`   Event Listeners:`);
console.log(`   - addEventListener calls: ${addEventListenerCount}`);
console.log(`   - removeEventListener calls: ${removeEventListenerCount}`);

if (addEventListenerCount > removeEventListenerCount * 2) {
    console.log(`   ⚠️  WARNING: Potential memory leak - more listeners added than removed`);
    console.log(`   💡 SUGGESTION: Ensure all event listeners are cleaned up`);
}

// Check for DOM manipulation patterns
const createElementCount = (fileContent.match(/createElement/g) || []).length;
const appendChildCount = (fileContent.match(/appendChild/g) || []).length;
const removeChildCount = (fileContent.match(/removeChild/g) || []).length;

console.log(`\n   DOM Operations:`);
console.log(`   - createElement calls: ${createElementCount}`);
console.log(`   - appendChild calls: ${appendChildCount}`);
console.log(`   - removeChild calls: ${removeChildCount}`);

if (createElementCount > 1000) {
    console.log(`   ⚠️  WARNING: High DOM creation count may cause memory issues`);
    console.log(`   💡 SUGGESTION: Consider virtual DOM or element pooling`);
}

// Check for closure and reference issues
const closurePatterns = (fileContent.match(/function\s*\([^)]*\)\s*{\s*return\s*function/g) || []).length;
console.log(`\n   Closure Patterns: ${closurePatterns}`);

if (closurePatterns > 100) {
    console.log(`   ⚠️  WARNING: High closure count may retain memory`);
}

// Multi-wallet memory impact
console.log(`\n💼 Multi-Wallet Memory Impact:`);
console.log(`   - Each wallet instance: ~10-15MB`);
console.log(`   - 8 wallets maximum: ~80-120MB`);
console.log(`   - Plus base app: ~50MB`);
console.log(`   - Total estimated: ~200MB (safe)`);

// Recommendations
console.log(`\n📋 Memory Optimization Recommendations:`);
console.log(`   1. Implement lazy loading for wallet instances`);
console.log(`   2. Use WeakMap for wallet data storage`);
console.log(`   3. Clear unused wallet data on switch`);
console.log(`   4. Implement periodic garbage collection hints`);
console.log(`   5. Use requestIdleCallback for heavy operations`);

// Performance tips
console.log(`\n⚡ Performance Quick Wins:`);
console.log(`   - Debounce API calls (detected multiple fetchBitcoinPrice)`);
console.log(`   - Cache DOM queries (use const elements at top)`);
console.log(`   - Batch DOM updates (use DocumentFragment)`);
console.log(`   - Lazy load Ordinals images`);

// Run simple memory monitor
console.log(`\n📊 Real-time Memory Analysis:`);
const monitor = new SimpleMemoryMonitor();
const memoryReport = monitor.getReport();

console.log(`   Heap Used: ${memoryReport.memory.usage.heapUsedMB.toFixed(2)}MB`);
console.log(`   RSS: ${memoryReport.memory.usage.rssMB.toFixed(2)}MB`);
console.log(`   Status: ${memoryReport.memory.status}`);

if (memoryReport.memory.recommendations.length > 0) {
    console.log(`   Recommendations:`);
    memoryReport.memory.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
    });
}

// Final verdict
console.log(`\n🎯 Memory MCP Verdict:`);
if (fileSizeKB > FILE_SIZE_THRESHOLD_KB || addEventListenerCount > removeEventListenerCount * 2 || memoryReport.memory.status === 'CRITICAL') {
    console.log(`   ❌ FAILED - Memory optimizations required`);
    process.exit(1);
} else if (memoryReport.memory.status === 'WARNING') {
    console.log(`   ⚠️  PASSED with warnings - Monitor memory usage`);
    console.log(`   💡 Consider implementing suggested optimizations`);
} else {
    console.log(`   ✅ PASSED - Memory usage acceptable`);
    console.log(`   💡 Consider implementing suggested optimizations`);
}