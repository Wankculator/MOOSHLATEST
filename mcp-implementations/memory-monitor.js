/**
 * Memory monitoring for MOOSH Wallet
 */
const memwatch = require('memwatch-next');
const heapdump = require('heapdump');
const fs = require('fs');
const path = require('path');

class MemoryMonitor {
    constructor() {
        this.stats = [];
        this.leaks = [];
        this.threshold = 500 * 1024 * 1024; // 500MB
        
        this.setupMonitoring();
    }

    setupMonitoring() {
        // Monitor for leaks
        memwatch.on('leak', (info) => {
            console.warn('Memory leak detected:', info);
            this.leaks.push({
                info,
                timestamp: new Date()
            });
        });

        // Monitor stats
        memwatch.on('stats', (stats) => {
            this.stats.push({
                ...stats,
                timestamp: new Date()
            });

            // Check threshold
            if (stats.current_base > this.threshold) {
                console.error(`Memory usage exceeds threshold: ${stats.current_base / 1024 / 1024}MB`);
                this.takeHeapSnapshot();
            }
        });
    }

    takeHeapSnapshot() {
        const filename = `heap-${Date.now()}.heapsnapshot`;
        const filepath = path.join(__dirname, '../../heap-dumps', filename);
        
        console.log(`Taking heap snapshot: ${filename}`);
        heapdump.writeSnapshot(filepath, (err, filename) => {
            if (err) {
                console.error('Heap snapshot failed:', err);
            } else {
                console.log('Heap snapshot written:', filename);
            }
        });
    }

    checkFileSize(filePath) {
        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / 1024 / 1024;
        
        if (sizeMB > 1) {
            console.warn(`Large file detected: ${filePath} (${sizeMB.toFixed(2)}MB)`);
            return {
                file: filePath,
                sizeMB,
                recommendation: 'Consider code splitting'
            };
        }
        
        return null;
    }

    getReport() {
        return {
            currentMemory: process.memoryUsage(),
            stats: this.stats.slice(-10), // Last 10 stats
            leaks: this.leaks,
            timestamp: new Date()
        };
    }
}

module.exports = MemoryMonitor;
