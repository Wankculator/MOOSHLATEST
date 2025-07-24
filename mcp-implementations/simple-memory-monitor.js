/**
 * Simple Memory Monitor for MOOSH Wallet
 * No native dependencies required
 */

const fs = require('fs');
const path = require('path');

class SimpleMemoryMonitor {
    constructor() {
        this.measurements = [];
        this.warningThreshold = 400 * 1024 * 1024; // 400MB
        this.criticalThreshold = 600 * 1024 * 1024; // 600MB
    }

    checkMemory() {
        const usage = process.memoryUsage();
        const heapUsedMB = usage.heapUsed / 1024 / 1024;
        const heapTotalMB = usage.heapTotal / 1024 / 1024;
        const rssMB = usage.rss / 1024 / 1024;
        
        const measurement = {
            timestamp: new Date(),
            heapUsed: usage.heapUsed,
            heapUsedMB: heapUsedMB,
            heapTotalMB: heapTotalMB,
            rssMB: rssMB,
            external: usage.external,
            arrayBuffers: usage.arrayBuffers
        };
        
        this.measurements.push(measurement);
        
        // Keep only last 100 measurements
        if (this.measurements.length > 100) {
            this.measurements.shift();
        }
        
        // Check thresholds
        let status = 'OK';
        let recommendations = [];
        
        if (usage.heapUsed > this.criticalThreshold) {
            status = 'CRITICAL';
            recommendations.push('Memory usage critical! Consider restarting the application.');
            recommendations.push('Implement code splitting for the 33KB+ JavaScript file.');
        } else if (usage.heapUsed > this.warningThreshold) {
            status = 'WARNING';
            recommendations.push('Memory usage high. Monitor for leaks.');
            recommendations.push('Clear unused wallet instances.');
        }
        
        return {
            status,
            usage: measurement,
            recommendations
        };
    }

    detectLeaks() {
        if (this.measurements.length < 10) {
            return { hasLeak: false, message: 'Not enough data' };
        }
        
        // Simple leak detection: check if memory consistently increases
        const recent = this.measurements.slice(-10);
        let increasingCount = 0;
        
        for (let i = 1; i < recent.length; i++) {
            if (recent[i].heapUsed > recent[i-1].heapUsed) {
                increasingCount++;
            }
        }
        
        const hasLeak = increasingCount > 7; // 70% increasing
        
        return {
            hasLeak,
            message: hasLeak ? 'Possible memory leak detected' : 'No leak detected',
            trend: `${increasingCount}/9 measurements increasing`
        };
    }

    analyzeFile(filePath) {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const analysis = {
            path: filePath,
            sizeKB: stats.size / 1024,
            sizeMB: stats.size / 1024 / 1024,
            lines: content.split('\n').length,
            functions: (content.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]*)=>/g) || []).length,
            eventListeners: (content.match(/addEventListener/g) || []).length,
            removeListeners: (content.match(/removeEventListener/g) || []).length,
            recommendations: []
        };
        
        // Recommendations based on analysis
        if (analysis.sizeKB > 1000) {
            analysis.recommendations.push({
                type: 'CODE_SPLIT',
                message: `File is ${analysis.sizeMB.toFixed(2)}MB. Consider splitting into:`,
                suggestions: [
                    'moosh-wallet-core.js - Core wallet functions',
                    'moosh-wallet-ui.js - UI components',
                    'moosh-wallet-crypto.js - Crypto operations',
                    'moosh-wallet-api.js - API integrations'
                ]
            });
        }
        
        if (analysis.eventListeners > analysis.removeListeners * 2) {
            analysis.recommendations.push({
                type: 'MEMORY_LEAK',
                message: 'More event listeners added than removed',
                count: `${analysis.eventListeners} added, ${analysis.removeListeners} removed`
            });
        }
        
        return analysis;
    }

    getReport() {
        const current = this.checkMemory();
        const leakStatus = this.detectLeaks();
        
        return {
            timestamp: new Date(),
            memory: current,
            leak: leakStatus,
            history: {
                measurements: this.measurements.length,
                averageHeapMB: this.measurements.reduce((sum, m) => sum + m.heapUsedMB, 0) / this.measurements.length
            }
        };
    }
}

module.exports = SimpleMemoryMonitor;