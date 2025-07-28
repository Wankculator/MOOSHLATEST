/**
 * Performance Monitor Module
 * Tracks and optimizes runtime performance of MOOSH Wallet
 * Provides real-time metrics and optimization suggestions
 */

(function() {
    'use strict';

    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                pageLoadTime: 0,
                moduleLoadTimes: new Map(),
                apiCallTimes: new Map(),
                renderTimes: new Map(),
                memoryUsage: [],
                longTasks: []
            };
            
            this.thresholds = {
                pageLoad: 3000, // 3 seconds
                moduleLoad: 500, // 500ms
                apiCall: 1000, // 1 second
                render: 16, // 16ms (60 fps)
                memory: 50 * 1024 * 1024, // 50MB
                longTask: 50 // 50ms
            };
            
            this.observers = new Map();
            this.isMonitoring = false;
            
            // Initialize if Performance API is available
            if ('performance' in window) {
                this.initializeMonitoring();
            }
        }

        /**
         * Initialize performance monitoring
         */
        initializeMonitoring() {
            // Monitor page load
            this.monitorPageLoad();
            
            // Monitor long tasks
            this.monitorLongTasks();
            
            // Monitor memory usage
            this.monitorMemory();
            
            // Monitor API calls
            this.interceptFetch();
            
            this.isMonitoring = true;
        }

        /**
         * Monitor page load performance
         */
        monitorPageLoad() {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                
                this.metrics.pageLoadTime = loadTime;
                
                if (loadTime > this.thresholds.pageLoad) {
                    console.warn(`[Performance] Page load time (${loadTime}ms) exceeds threshold (${this.thresholds.pageLoad}ms)`);
                }
                
                // Detailed timing breakdown
                const timingBreakdown = {
                    dns: timing.domainLookupEnd - timing.domainLookupStart,
                    tcp: timing.connectEnd - timing.connectStart,
                    request: timing.responseStart - timing.requestStart,
                    response: timing.responseEnd - timing.responseStart,
                    dom: timing.domComplete - timing.domLoading,
                    load: timing.loadEventEnd - timing.loadEventStart
                };
                
                this.metrics.timingBreakdown = timingBreakdown;
            }
        }

        /**
         * Monitor long tasks using PerformanceObserver
         */
        monitorLongTasks() {
            if (!('PerformanceObserver' in window)) return;
            
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > this.thresholds.longTask) {
                            this.metrics.longTasks.push({
                                duration: entry.duration,
                                startTime: entry.startTime,
                                name: entry.name
                            });
                            
                            console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', observer);
            } catch (error) {
                console.log('[Performance] Long task monitoring not supported');
            }
        }

        /**
         * Monitor memory usage
         */
        monitorMemory() {
            if (!performance.memory) return;
            
            const checkMemory = () => {
                const memoryInfo = {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                this.metrics.memoryUsage.push(memoryInfo);
                
                // Keep only last 100 measurements
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
                
                // Check for memory leaks
                if (memoryInfo.usedJSHeapSize > this.thresholds.memory) {
                    console.warn(`[Performance] High memory usage: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
                }
                
                // Detect potential memory leak (continuous growth)
                if (this.metrics.memoryUsage.length > 10) {
                    const recent = this.metrics.memoryUsage.slice(-10);
                    const isGrowing = recent.every((m, i) => 
                        i === 0 || m.usedJSHeapSize > recent[i - 1].usedJSHeapSize
                    );
                    
                    if (isGrowing) {
                        console.warn('[Performance] Potential memory leak detected');
                    }
                }
            };
            
            // Check memory every 30 seconds
            setInterval(checkMemory, 30000);
            checkMemory(); // Initial check
        }

        /**
         * Intercept fetch calls to monitor API performance
         */
        interceptFetch() {
            const originalFetch = window.fetch;
            
            window.fetch = async (...args) => {
                const startTime = performance.now();
                const url = args[0];
                const method = args[1]?.method || 'GET';
                
                try {
                    const response = await originalFetch(...args);
                    const duration = performance.now() - startTime;
                    
                    this.recordApiCall(url, method, duration, response.status);
                    
                    return response;
                } catch (error) {
                    const duration = performance.now() - startTime;
                    this.recordApiCall(url, method, duration, 0);
                    throw error;
                }
            };
        }

        /**
         * Record API call performance
         */
        recordApiCall(url, method, duration, status) {
            const key = `${method} ${url}`;
            
            if (!this.metrics.apiCallTimes.has(key)) {
                this.metrics.apiCallTimes.set(key, []);
            }
            
            const callData = { duration, status, timestamp: Date.now() };
            this.metrics.apiCallTimes.get(key).push(callData);
            
            if (duration > this.thresholds.apiCall) {
                console.warn(`[Performance] Slow API call: ${key} took ${duration.toFixed(2)}ms`);
            }
        }

        /**
         * Measure render performance
         */
        measureRender(componentName, renderFn) {
            const startTime = performance.now();
            
            const result = renderFn();
            
            const duration = performance.now() - startTime;
            
            if (!this.metrics.renderTimes.has(componentName)) {
                this.metrics.renderTimes.set(componentName, []);
            }
            
            this.metrics.renderTimes.get(componentName).push(duration);
            
            if (duration > this.thresholds.render) {
                console.warn(`[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
            }
            
            return result;
        }

        /**
         * Get performance report
         */
        getReport() {
            const report = {
                pageLoad: {
                    total: this.metrics.pageLoadTime,
                    breakdown: this.metrics.timingBreakdown
                },
                modules: this.getModuleStats(),
                api: this.getApiStats(),
                rendering: this.getRenderStats(),
                memory: this.getMemoryStats(),
                longTasks: this.metrics.longTasks.length,
                recommendations: this.getRecommendations()
            };
            
            return report;
        }

        /**
         * Get module loading statistics
         */
        getModuleStats() {
            const stats = [];
            
            for (const [module, times] of this.metrics.moduleLoadTimes) {
                const average = times.reduce((a, b) => a + b, 0) / times.length;
                stats.push({
                    module,
                    average,
                    count: times.length,
                    max: Math.max(...times),
                    min: Math.min(...times)
                });
            }
            
            return stats.sort((a, b) => b.average - a.average);
        }

        /**
         * Get API call statistics
         */
        getApiStats() {
            const stats = [];
            
            for (const [endpoint, calls] of this.metrics.apiCallTimes) {
                const durations = calls.map(c => c.duration);
                const average = durations.reduce((a, b) => a + b, 0) / durations.length;
                const failures = calls.filter(c => c.status >= 400).length;
                
                stats.push({
                    endpoint,
                    average,
                    count: calls.length,
                    failures,
                    successRate: ((calls.length - failures) / calls.length * 100).toFixed(1) + '%',
                    max: Math.max(...durations),
                    min: Math.min(...durations)
                });
            }
            
            return stats.sort((a, b) => b.average - a.average);
        }

        /**
         * Get render performance statistics
         */
        getRenderStats() {
            const stats = [];
            
            for (const [component, times] of this.metrics.renderTimes) {
                const average = times.reduce((a, b) => a + b, 0) / times.length;
                const slowRenders = times.filter(t => t > this.thresholds.render).length;
                
                stats.push({
                    component,
                    average,
                    count: times.length,
                    slowRenders,
                    performance: slowRenders === 0 ? 'Good' : 
                               slowRenders < times.length * 0.1 ? 'Fair' : 'Poor'
                });
            }
            
            return stats.sort((a, b) => b.average - a.average);
        }

        /**
         * Get memory statistics
         */
        getMemoryStats() {
            if (this.metrics.memoryUsage.length === 0) {
                return { available: false };
            }
            
            const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
            const oldest = this.metrics.memoryUsage[0];
            
            return {
                current: (latest.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
                limit: (latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
                usage: ((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100).toFixed(1) + '%',
                trend: latest.usedJSHeapSize > oldest.usedJSHeapSize ? 'increasing' : 'stable'
            };
        }

        /**
         * Get performance recommendations
         */
        getRecommendations() {
            const recommendations = [];
            
            // Page load recommendations
            if (this.metrics.pageLoadTime > this.thresholds.pageLoad) {
                recommendations.push({
                    type: 'page-load',
                    severity: 'high',
                    message: 'Page load time is too high. Consider code splitting and lazy loading.',
                    actions: [
                        'Implement lazy loading for heavy modules',
                        'Optimize bundle size',
                        'Use CDN for static assets'
                    ]
                });
            }
            
            // API performance recommendations
            const slowApis = Array.from(this.metrics.apiCallTimes.entries())
                .filter(([_, calls]) => {
                    const avg = calls.reduce((sum, c) => sum + c.duration, 0) / calls.length;
                    return avg > this.thresholds.apiCall;
                });
            
            if (slowApis.length > 0) {
                recommendations.push({
                    type: 'api-performance',
                    severity: 'medium',
                    message: `${slowApis.length} API endpoints are slow`,
                    actions: [
                        'Implement request caching',
                        'Add loading states',
                        'Consider pagination for large datasets'
                    ]
                });
            }
            
            // Memory recommendations
            const memoryStats = this.getMemoryStats();
            if (memoryStats.trend === 'increasing') {
                recommendations.push({
                    type: 'memory-leak',
                    severity: 'high',
                    message: 'Potential memory leak detected',
                    actions: [
                        'Check for event listener cleanup',
                        'Verify DOM element references are released',
                        'Review closure usage'
                    ]
                });
            }
            
            // Render performance recommendations
            const slowComponents = Array.from(this.metrics.renderTimes.entries())
                .filter(([_, times]) => {
                    const slowCount = times.filter(t => t > this.thresholds.render).length;
                    return slowCount > times.length * 0.1;
                });
            
            if (slowComponents.length > 0) {
                recommendations.push({
                    type: 'render-performance',
                    severity: 'medium',
                    message: `${slowComponents.length} components have render performance issues`,
                    actions: [
                        'Implement React.memo or shouldComponentUpdate',
                        'Optimize expensive calculations',
                        'Use virtualization for long lists'
                    ]
                });
            }
            
            return recommendations;
        }

        /**
         * Export performance data
         */
        exportData() {
            return {
                timestamp: new Date().toISOString(),
                metrics: this.metrics,
                report: this.getReport()
            };
        }

        /**
         * Clear all metrics
         */
        clear() {
            this.metrics = {
                pageLoadTime: 0,
                moduleLoadTimes: new Map(),
                apiCallTimes: new Map(),
                renderTimes: new Map(),
                memoryUsage: [],
                longTasks: []
            };
        }

        /**
         * Stop all monitoring
         */
        stop() {
            for (const observer of this.observers.values()) {
                observer.disconnect();
            }
            this.observers.clear();
            this.isMonitoring = false;
        }
    }

    // Export for use in other modules
    window.PerformanceMonitor = PerformanceMonitor;
    
    // Create singleton instance
    window.performanceMonitor = new PerformanceMonitor();
})();