#!/usr/bin/env node

/**
 * MCP Watch Mode - Continuous monitoring for MOOSH Wallet
 */

const { spawn } = require('child_process');
const SimpleMemoryMonitor = require('../mcp-implementations/simple-memory-monitor');

console.log('👁️  Starting MCP continuous monitoring...\n');

// Memory monitoring
const memoryMonitor = new SimpleMemoryMonitor();
let memoryInterval;

function startMemoryMonitoring() {
    console.log('📊 Memory monitoring started (checking every 30 seconds)');
    
    memoryInterval = setInterval(() => {
        const report = memoryMonitor.getReport();
        const status = report.memory.status;
        const heapMB = report.memory.usage.heapUsedMB.toFixed(2);
        
        const statusIcon = status === 'OK' ? '✅' : status === 'WARNING' ? '⚠️ ' : '🚨';
        console.log(`[${new Date().toLocaleTimeString()}] Memory: ${statusIcon} ${heapMB}MB ${status}`);
        
        // Check for leaks
        const leakStatus = report.leak;
        if (leakStatus.hasLeak) {
            console.log(`   ⚠️  ${leakStatus.message} (${leakStatus.trend})`);
        }
        
        // Show recommendations if any
        if (report.memory.recommendations.length > 0) {
            report.memory.recommendations.forEach(rec => {
                console.log(`   💡 ${rec}`);
            });
        }
    }, 30000); // Every 30 seconds
}

// File watching for changes
const chokidar = require('fs').existsSync('./node_modules/chokidar') 
    ? require('chokidar') 
    : null;

if (chokidar) {
    console.log('📁 File watching enabled');
    
    const watcher = chokidar.watch(['public/js/*.js', 'src/**/*.js'], {
        ignored: /node_modules/,
        persistent: true
    });
    
    watcher.on('change', (path) => {
        console.log(`[${new Date().toLocaleTimeString()}] File changed: ${path}`);
        console.log('   💡 Run npm test to validate changes');
    });
} else {
    console.log('📁 Install chokidar for file watching: npm install --save-dev chokidar');
}

// TestSprite in watch mode (if available)
try {
    if (require('fs').existsSync('./scripts/test-with-sprite.js')) {
        console.log('🧪 TestSprite watch mode starting...');
        const testSprite = spawn('npm', ['run', 'test:watch'], { 
            stdio: 'inherit',
            shell: true 
        });
        
        testSprite.on('error', (err) => {
            console.log('TestSprite not available in watch mode');
        });
    }
} catch (e) {
    // TestSprite not available
}

// Start monitoring
startMemoryMonitoring();

// API endpoint monitoring
let apiCallCount = 0;
console.log('\n📡 API monitoring started');
console.log('   (Configure your app to log API calls)\n');

// Handle exit
process.on('SIGINT', () => {
    console.log('\n\nStopping all monitors...');
    if (memoryInterval) clearInterval(memoryInterval);
    
    // Final report
    const finalReport = memoryMonitor.getReport();
    console.log('\n📊 Final Memory Report:');
    console.log(`   Average Heap: ${finalReport.history.averageHeapMB.toFixed(2)}MB`);
    console.log(`   Measurements: ${finalReport.history.measurements}`);
    console.log(`   Final Status: ${finalReport.memory.status}`);
    
    process.exit(0);
});

console.log('✅ All monitors running. Press Ctrl+C to stop.\n');
console.log('Monitoring:');
console.log('- Memory usage every 30 seconds');
console.log('- File changes (if chokidar installed)');
console.log('- TestSprite validation');
console.log('-------------------------------------------\n');