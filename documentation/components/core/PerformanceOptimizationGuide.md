# Performance Optimization Guide

**Last Updated**: 2025-07-21  
**Critical**: YES - Performance directly impacts user experience and wallet usability  
**Target Metrics**: Page load < 3s, API response < 500ms, Memory < 200MB

## Overview

MOOSH Wallet must remain performant even with multiple wallets, thousands of transactions, and real-time price updates. This guide provides concrete optimization patterns that MUST be implemented.

## Performance Principles

1. **Measure First** - Never optimize without data
2. **User-Perceived Performance** - Optimize what users notice
3. **Progressive Enhancement** - Fast initial load, enhance later
4. **Resource Efficiency** - Minimize memory and CPU usage
5. **Batch Operations** - Combine multiple operations

## Critical Performance Patterns

### Pattern 1: Debouncing and Throttling

**Essential for all rapid-fire events:**

```javascript
class PerformanceUtils {
    // Debounce - Delays execution until activity stops
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle - Limits execution frequency
    static throttle(func, limit = 100) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    // RequestAnimationFrame throttle - For visual updates
    static rafThrottle(func) {
        let rafId = null;
        let lastArgs = null;
        
        const throttled = (...args) => {
            lastArgs = args;
            
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    func.apply(this, lastArgs);
                    rafId = null;
                });
            }
        };
        
        throttled.cancel = () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };
        
        return throttled;
    }
}

// USAGE EXAMPLES:

// Search input - Wait for user to stop typing
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', PerformanceUtils.debounce((e) => {
    performSearch(e.target.value);
}, 300));

// Scroll handler - Limit frequency
window.addEventListener('scroll', PerformanceUtils.throttle(() => {
    updateScrollPosition();
}, 100));

// Animation updates - Sync with browser
const updateChart = PerformanceUtils.rafThrottle((data) => {
    renderChart(data);
});

// Window resize - Debounce expensive recalculations
window.addEventListener('resize', PerformanceUtils.debounce(() => {
    recalculateLayout();
}, 250));
```

### Pattern 2: Virtual Scrolling for Large Lists

**Handle thousands of items efficiently:**

```javascript
class VirtualScroller {
    constructor(container, options = {}) {
        this.container = container;
        this.itemHeight = options.itemHeight || 50;
        this.bufferSize = options.bufferSize || 5;
        this.items = [];
        this.visibleRange = { start: 0, end: 0 };
        
        this.scrollHandler = PerformanceUtils.throttle(() => {
            this.updateVisibleItems();
        }, 16); // ~60fps
        
        this.init();
    }
    
    init() {
        // Create viewport structure
        this.viewport = $.div({ 
            className: 'virtual-viewport',
            style: {
                overflow: 'auto',
                height: '100%',
                position: 'relative'
            }
        });
        
        this.content = $.div({ 
            className: 'virtual-content',
            style: {
                position: 'relative',
                width: '100%'
            }
        });
        
        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);
        
        // Attach scroll listener
        this.viewport.addEventListener('scroll', this.scrollHandler);
    }
    
    setItems(items) {
        this.items = items;
        
        // Set total height
        const totalHeight = items.length * this.itemHeight;
        this.content.style.height = `${totalHeight}px`;
        
        // Initial render
        this.updateVisibleItems();
    }
    
    updateVisibleItems() {
        const scrollTop = this.viewport.scrollTop;
        const viewportHeight = this.viewport.clientHeight;
        
        // Calculate visible range with buffer
        const startIndex = Math.max(0, 
            Math.floor(scrollTop / this.itemHeight) - this.bufferSize
        );
        const endIndex = Math.min(this.items.length - 1,
            Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.bufferSize
        );
        
        // Only update if range changed
        if (startIndex === this.visibleRange.start && 
            endIndex === this.visibleRange.end) {
            return;
        }
        
        this.visibleRange = { start: startIndex, end: endIndex };
        this.renderVisibleItems();
    }
    
    renderVisibleItems() {
        // Clear existing items
        this.content.innerHTML = '';
        
        // Render only visible items
        for (let i = this.visibleRange.start; i <= this.visibleRange.end; i++) {
            const item = this.items[i];
            if (!item) continue;
            
            const element = this.renderItem(item, i);
            element.style.position = 'absolute';
            element.style.top = `${i * this.itemHeight}px`;
            element.style.height = `${this.itemHeight}px`;
            element.style.width = '100%';
            
            this.content.appendChild(element);
        }
        
        ComplianceUtils.log('VirtualScroller', 
            `Rendering ${this.visibleRange.end - this.visibleRange.start + 1} of ${this.items.length} items`
        );
    }
    
    renderItem(item, index) {
        // Override this method for custom rendering
        return $.div({ className: 'virtual-item' }, item.toString());
    }
    
    destroy() {
        this.viewport.removeEventListener('scroll', this.scrollHandler);
        this.container.innerHTML = '';
    }
}

// USAGE EXAMPLE:
class TransactionList extends VirtualScroller {
    renderItem(transaction, index) {
        return $.div({ className: 'transaction-item' }, [
            $.span({ className: 'tx-date' }, 
                new Date(transaction.timestamp).toLocaleDateString()
            ),
            $.span({ className: 'tx-amount' }, 
                `${transaction.amount} BTC`
            ),
            $.span({ className: 'tx-status' }, 
                ComplianceUtils.getStatusIndicator(transaction.status)
            )
        ]);
    }
}

// Create list with 10,000 transactions
const txList = new TransactionList(document.getElementById('tx-container'), {
    itemHeight: 60,
    bufferSize: 10
});

txList.setItems(transactions); // Renders only ~20 visible items
```

### Pattern 3: Efficient DOM Manipulation

**Batch DOM updates for better performance:**

```javascript
class DOMBatcher {
    constructor() {
        this.pendingUpdates = [];
        this.rafId = null;
    }
    
    // Queue update for batching
    queueUpdate(updateFn) {
        this.pendingUpdates.push(updateFn);
        
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => {
                this.flush();
            });
        }
    }
    
    // Execute all pending updates
    flush() {
        const updates = this.pendingUpdates.slice();
        this.pendingUpdates = [];
        this.rafId = null;
        
        // Measure performance
        const start = performance.now();
        
        // Execute in single batch
        updates.forEach(update => update());
        
        const duration = performance.now() - start;
        if (duration > 16) { // Longer than one frame
            ComplianceUtils.log('DOMBatcher', 
                `Batch update took ${duration.toFixed(2)}ms for ${updates.length} operations`, 
                'warn'
            );
        }
    }
    
    // Fragment-based batch insertion
    static batchInsert(container, elements) {
        const fragment = document.createDocumentFragment();
        elements.forEach(el => fragment.appendChild(el));
        container.appendChild(fragment);
    }
    
    // Efficient class updates
    static batchClassUpdate(elements, className, add = true) {
        // Use single reflow
        const method = add ? 'add' : 'remove';
        requestAnimationFrame(() => {
            elements.forEach(el => el.classList[method](className));
        });
    }
    
    // Efficient style updates
    static batchStyleUpdate(elements, styles) {
        requestAnimationFrame(() => {
            elements.forEach(el => {
                Object.assign(el.style, styles);
            });
        });
    }
}

// USAGE EXAMPLE:
const batcher = new DOMBatcher();

// Instead of immediate DOM updates
accounts.forEach(account => {
    batcher.queueUpdate(() => {
        const element = document.getElementById(`account-${account.id}`);
        element.textContent = account.balance;
        element.className = account.isActive ? 'active' : 'inactive';
    });
});

// Batch element creation
const newElements = data.map(item => $.div({ className: 'item' }, item.name));
DOMBatcher.batchInsert(container, newElements);
```

### Pattern 4: Lazy Loading and Code Splitting

**Load resources only when needed:**

```javascript
class LazyLoader {
    constructor() {
        this.loaded = new Set();
        this.loading = new Map();
    }
    
    // Lazy load JavaScript modules
    async loadModule(moduleName) {
        if (this.loaded.has(moduleName)) {
            return true;
        }
        
        if (this.loading.has(moduleName)) {
            return this.loading.get(moduleName);
        }
        
        const loadPromise = this.performLoad(moduleName);
        this.loading.set(moduleName, loadPromise);
        
        try {
            await loadPromise;
            this.loaded.add(moduleName);
            this.loading.delete(moduleName);
            return true;
        } catch (error) {
            this.loading.delete(moduleName);
            throw error;
        }
    }
    
    async performLoad(moduleName) {
        const start = performance.now();
        
        switch (moduleName) {
            case 'ordinals':
                // Lazy load ordinals functionality
                const script = document.createElement('script');
                script.src = '/js/modules/ordinals.js';
                script.async = true;
                
                return new Promise((resolve, reject) => {
                    script.onload = () => {
                        const duration = performance.now() - start;
                        ComplianceUtils.log('LazyLoader', 
                            `Loaded ${moduleName} in ${duration.toFixed(2)}ms`
                        );
                        resolve();
                    };
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                
            case 'charts':
                // Lazy load charting library
                return import('/js/modules/charts.js');
                
            default:
                throw new Error(`Unknown module: ${moduleName}`);
        }
    }
    
    // Intersection Observer for lazy loading
    observeLazyElements() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const module = element.dataset.lazy;
                    
                    this.loadModule(module).then(() => {
                        element.classList.add('lazy-loaded');
                        
                        // Trigger module initialization
                        const event = new CustomEvent('lazyloaded', {
                            detail: { module }
                        });
                        element.dispatchEvent(event);
                    }).catch(error => {
                        ComplianceUtils.log('LazyLoader', 
                            `Failed to load ${module}: ${error.message}`, 
                            'error'
                        );
                    });
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before visible
        });
        
        lazyElements.forEach(el => observer.observe(el));
    }
}

// USAGE EXAMPLE:
const loader = new LazyLoader();

// Lazy load ordinals when user navigates to ordinals page
async function showOrdinalsPage() {
    try {
        await loader.loadModule('ordinals');
        
        // Module loaded, now safe to use
        window.OrdinalsManager.initialize();
    } catch (error) {
        app.showNotification('Failed to load ordinals module', 'error');
    }
}

// Lazy load images
class LazyImage {
    static observe() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load image
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        img.src = tempImg.src;
                        img.classList.add('loaded');
                    };
                    tempImg.src = img.dataset.src;
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}
```

### Pattern 5: Memory Management

**Prevent memory leaks and optimize usage:**

```javascript
class MemoryManager {
    constructor() {
        this.cache = new Map();
        this.listeners = new WeakMap();
        this.timers = new Set();
    }
    
    // Cache with size limit and TTL
    createCache(maxSize = 100, ttlMs = 300000) { // 5 min default
        return {
            data: new Map(),
            timestamps: new Map(),
            
            set(key, value) {
                // Evict oldest if at capacity
                if (this.data.size >= maxSize) {
                    const oldestKey = this.getOldestKey();
                    this.delete(oldestKey);
                }
                
                this.data.set(key, value);
                this.timestamps.set(key, Date.now());
            },
            
            get(key) {
                const timestamp = this.timestamps.get(key);
                if (!timestamp) return null;
                
                // Check TTL
                if (Date.now() - timestamp > ttlMs) {
                    this.delete(key);
                    return null;
                }
                
                return this.data.get(key);
            },
            
            delete(key) {
                this.data.delete(key);
                this.timestamps.delete(key);
            },
            
            getOldestKey() {
                let oldestKey = null;
                let oldestTime = Infinity;
                
                for (const [key, time] of this.timestamps) {
                    if (time < oldestTime) {
                        oldestTime = time;
                        oldestKey = key;
                    }
                }
                
                return oldestKey;
            },
            
            clear() {
                this.data.clear();
                this.timestamps.clear();
            }
        };
    }
    
    // Automatic cleanup for event listeners
    addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        // Track for cleanup
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        
        const elementListeners = this.listeners.get(element);
        if (!elementListeners.has(event)) {
            elementListeners.set(event, new Set());
        }
        
        elementListeners.get(event).add(handler);
        
        // Return cleanup function
        return () => this.removeEventListener(element, event, handler);
    }
    
    removeEventListener(element, event, handler) {
        element.removeEventListener(event, handler);
        
        const elementListeners = this.listeners.get(element);
        if (elementListeners) {
            const eventHandlers = elementListeners.get(event);
            if (eventHandlers) {
                eventHandlers.delete(handler);
                
                if (eventHandlers.size === 0) {
                    elementListeners.delete(event);
                }
                
                if (elementListeners.size === 0) {
                    this.listeners.delete(element);
                }
            }
        }
    }
    
    // Clean all listeners for an element
    cleanupElement(element) {
        const elementListeners = this.listeners.get(element);
        if (!elementListeners) return;
        
        for (const [event, handlers] of elementListeners) {
            for (const handler of handlers) {
                element.removeEventListener(event, handler);
            }
        }
        
        this.listeners.delete(element);
    }
    
    // Timer management
    setTimeout(callback, delay) {
        const timerId = setTimeout(() => {
            this.timers.delete(timerId);
            callback();
        }, delay);
        
        this.timers.add(timerId);
        return timerId;
    }
    
    clearTimeout(timerId) {
        if (this.timers.has(timerId)) {
            clearTimeout(timerId);
            this.timers.delete(timerId);
        }
    }
    
    // Cleanup all timers
    clearAllTimers() {
        for (const timerId of this.timers) {
            clearTimeout(timerId);
        }
        this.timers.clear();
    }
    
    // Object pool for frequent allocations
    createObjectPool(factory, reset, maxSize = 50) {
        const pool = [];
        
        return {
            acquire() {
                if (pool.length > 0) {
                    return pool.pop();
                }
                return factory();
            },
            
            release(obj) {
                if (pool.length < maxSize) {
                    reset(obj);
                    pool.push(obj);
                }
            },
            
            clear() {
                pool.length = 0;
            }
        };
    }
}

// USAGE EXAMPLE:
const memoryManager = new MemoryManager();

// Cache API responses
const apiCache = memoryManager.createCache(50, 60000); // 50 items, 1 minute TTL

async function fetchWithCache(url) {
    const cached = apiCache.get(url);
    if (cached) {
        ComplianceUtils.log('Cache', 'Cache hit for ' + url);
        return cached;
    }
    
    const data = await fetch(url).then(r => r.json());
    apiCache.set(url, data);
    return data;
}

// Managed event listeners
class Component {
    constructor() {
        this.cleanup = [];
    }
    
    init() {
        // Auto-cleanup listeners
        this.cleanup.push(
            memoryManager.addEventListener(
                window, 
                'resize', 
                () => this.handleResize()
            )
        );
        
        this.cleanup.push(
            memoryManager.addEventListener(
                document.getElementById('button'),
                'click',
                () => this.handleClick()
            )
        );
    }
    
    destroy() {
        // Clean up all listeners at once
        this.cleanup.forEach(cleanupFn => cleanupFn());
        this.cleanup = [];
    }
}

// Object pooling for frequent operations
const transactionPool = memoryManager.createObjectPool(
    // Factory
    () => ({ id: null, amount: 0, timestamp: 0, status: null }),
    // Reset
    (tx) => {
        tx.id = null;
        tx.amount = 0;
        tx.timestamp = 0;
        tx.status = null;
    }
);

// Use pooled objects
function processTransactions(data) {
    const transactions = data.map(item => {
        const tx = transactionPool.acquire();
        tx.id = item.id;
        tx.amount = item.amount;
        tx.timestamp = item.timestamp;
        tx.status = item.status;
        return tx;
    });
    
    // Process...
    
    // Return to pool when done
    transactions.forEach(tx => transactionPool.release(tx));
}
```

### Pattern 6: Animation Performance

**Smooth 60fps animations:**

```javascript
class AnimationOptimizer {
    // Use CSS transforms for animations
    static optimizeElement(element) {
        // Promote to GPU layer
        element.style.willChange = 'transform, opacity';
        
        // Cleanup after animation
        element.addEventListener('transitionend', () => {
            element.style.willChange = 'auto';
        }, { once: true });
    }
    
    // Smooth number animations
    static animateNumber(element, start, end, duration = 300) {
        const startTime = performance.now();
        const range = end - start;
        
        function update() {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (range * eased);
            
            element.textContent = current.toFixed(2);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // Stagger animations for lists
    static staggerAnimation(elements, animationClass, delayMs = 50) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    element.classList.add(animationClass);
                });
            }, index * delayMs);
        });
    }
    
    // FLIP animation technique
    static flipAnimate(element, updateFn) {
        // First: record initial position
        const first = element.getBoundingClientRect();
        
        // Execute update
        updateFn();
        
        // Last: record final position
        const last = element.getBoundingClientRect();
        
        // Invert: calculate delta
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        const deltaW = first.width / last.width;
        const deltaH = first.height / last.height;
        
        // Play: animate from inverted to final
        element.style.transformOrigin = 'top left';
        element.style.transform = 
            `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        element.style.transition = 'none';
        
        // Force reflow
        element.offsetHeight;
        
        // Enable transitions and remove transform
        requestAnimationFrame(() => {
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = '';
            
            element.addEventListener('transitionend', () => {
                element.style.transition = '';
                element.style.transformOrigin = '';
            }, { once: true });
        });
    }
}

// USAGE EXAMPLE:
// Optimize hover effects
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        AnimationOptimizer.optimizeElement(card);
        card.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// Animate balance update
function updateBalance(newBalance) {
    const balanceEl = document.getElementById('balance');
    const currentBalance = parseFloat(balanceEl.textContent) || 0;
    
    AnimationOptimizer.animateNumber(
        balanceEl, 
        currentBalance, 
        newBalance, 
        500
    );
}

// Reorder list with animation
function reorderList(container, newOrder) {
    const items = Array.from(container.children);
    
    AnimationOptimizer.flipAnimate(container, () => {
        // Clear and re-add in new order
        container.innerHTML = '';
        newOrder.forEach(id => {
            const item = items.find(el => el.dataset.id === id);
            if (item) container.appendChild(item);
        });
    });
}
```

## Performance Monitoring

### Real-time Performance Tracking

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.thresholds = {
            apiCall: 1000,      // 1 second
            render: 16,         // 1 frame (60fps)
            interaction: 100    // 100ms response
        };
    }
    
    // Measure async operations
    async measure(name, operation, type = 'custom') {
        const start = performance.now();
        
        try {
            const result = await operation();
            const duration = performance.now() - start;
            
            this.recordMetric(name, duration, type);
            
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(name, duration, type, true);
            throw error;
        }
    }
    
    recordMetric(name, duration, type, failed = false) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                count: 0,
                total: 0,
                average: 0,
                min: Infinity,
                max: -Infinity,
                failures: 0
            });
        }
        
        const metric = this.metrics.get(name);
        metric.count++;
        metric.total += duration;
        metric.average = metric.total / metric.count;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);
        
        if (failed) {
            metric.failures++;
        }
        
        // Check threshold
        const threshold = this.thresholds[type] || 1000;
        if (duration > threshold) {
            ComplianceUtils.log('Performance', 
                `${name} exceeded threshold: ${duration.toFixed(2)}ms (limit: ${threshold}ms)`,
                'warn'
            );
        }
    }
    
    getReport() {
        const report = [];
        
        for (const [name, data] of this.metrics) {
            report.push({
                name,
                ...data,
                average: data.average.toFixed(2),
                min: data.min.toFixed(2),
                max: data.max.toFixed(2),
                successRate: ((data.count - data.failures) / data.count * 100).toFixed(1)
            });
        }
        
        return report.sort((a, b) => b.average - a.average);
    }
    
    // Monitor long tasks
    observeLongTasks() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        ComplianceUtils.log('Performance', 
                            `Long task detected: ${entry.duration.toFixed(2)}ms`,
                            'warn'
                        );
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    }
}

// Global performance monitor
const perfMonitor = new PerformanceMonitor();

// Monitor API calls
async function monitoredFetch(url, options) {
    return perfMonitor.measure(
        `API: ${new URL(url).pathname}`,
        () => fetch(url, options),
        'apiCall'
    );
}

// Monitor renders
function monitoredRender(component, data) {
    return perfMonitor.measure(
        `Render: ${component}`,
        () => renderComponent(component, data),
        'render'
    );
}
```

## Optimization Checklist

Before deploying, ensure:

- [ ] All event handlers are debounced/throttled
- [ ] Large lists use virtual scrolling
- [ ] DOM updates are batched
- [ ] Heavy modules are lazy loaded
- [ ] Memory leaks are prevented (cleanup listeners)
- [ ] Animations use CSS transforms
- [ ] API responses are cached appropriately
- [ ] Images lazy load on scroll
- [ ] Performance metrics are within thresholds
- [ ] No synchronous operations block UI

## Common Performance Mistakes

```javascript
// MISTAKE 1: Unbounded event listeners
window.addEventListener('scroll', handleScroll); // Fires too often!

// MISTAKE 2: Inefficient DOM queries in loops
for (let i = 0; i < 1000; i++) {
    document.getElementById(`item-${i}`).style.display = 'none'; // 1000 reflows!
}

// MISTAKE 3: Creating functions in loops
items.forEach(item => {
    button.addEventListener('click', () => processItem(item)); // New function each time!
});

// MISTAKE 4: Not cleaning up
setInterval(updatePrices, 1000); // Runs forever!

// MISTAKE 5: Synchronous operations
const data = JSON.parse(hugeJsonString); // Blocks UI!

// MISTAKE 6: Unnecessary re-renders
setState({ ...state, unrelatedField: value }); // Triggers full re-render!

// MISTAKE 7: Not caching expensive operations
function getComplexCalculation() {
    return performExpensiveOperation(); // Recalculated every call!
}
```

## Performance Budget

Target metrics for MOOSH Wallet:

- **Initial Load**: < 3 seconds
- **Time to Interactive**: < 4 seconds  
- **API Response**: < 500ms average
- **Frame Rate**: 60fps during animations
- **Memory Usage**: < 200MB with 8 wallets
- **Bundle Size**: < 500KB gzipped

## Summary

Performance optimization in MOOSH Wallet requires:
- **Debouncing** all user inputs
- **Virtual scrolling** for large datasets
- **Batching** DOM operations
- **Lazy loading** non-critical resources
- **Memory management** to prevent leaks
- **Smooth animations** using GPU acceleration

These aren't optional optimizations - they're required for a professional wallet experience.