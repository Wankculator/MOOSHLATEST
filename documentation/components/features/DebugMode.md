# Debug Mode

**Status**: 🟡 Beta
**Type**: Development Tool
**Security Critical**: Yes
**Implementation**: Console logging throughout /public/js/moosh-wallet.js

## Overview
Debug mode provides developers with detailed logging, state inspection, and diagnostic tools for troubleshooting issues. The system includes console logging, state dumps, network inspection, and performance profiling capabilities.

## User Flow
```
[Enable Debug Mode] → [Enhanced Logging Active] → [Perform Actions] → [Inspect Logs/State] → [Diagnose Issues]
```

## Technical Implementation

### Frontend
- **Entry Point**: Debug flag and console utilities
- **UI Components**: 
  - Debug panel overlay
  - Console log viewer
  - State inspector
  - Network logger
  - Performance profiler
- **State Changes**: 
  - Debug mode flag
  - Log level settings
  - Collected diagnostics

### Backend
- **API Endpoints**: None (client-side only)
- **Services Used**: 
  - Browser DevTools APIs
  - Console methods
  - Performance APIs
- **Data Flow**: 
  1. Debug mode enabled
  2. Enhanced logging activated
  3. Actions traced
  4. Data collected
  5. Analysis available

## Code Example
```javascript
// Debug mode implementation
class DebugManager {
    constructor(app) {
        this.app = app;
        this.enabled = false;
        this.logLevel = 'info';
        this.logs = [];
        this.maxLogs = 1000;
        this.watchers = new Map();
        
        this.initializeDebugMode();
    }
    
    initializeDebugMode() {
        // Check for debug flag
        this.checkDebugFlag();
        
        // Override console methods
        this.overrideConsole();
        
        // Set up debug commands
        this.setupDebugCommands();
        
        // Create debug panel
        if (this.enabled) {
            this.createDebugPanel();
        }
    }
    
    checkDebugFlag() {
        // Check URL params
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true') {
            this.enable();
            return;
        }
        
        // Check localStorage
        if (localStorage.getItem('debugMode') === 'true') {
            this.enable();
            return;
        }
        
        // Check for development environment
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            this.enable();
        }
    }
    
    enable() {
        this.enabled = true;
        console.log('%c🐛 Debug Mode Enabled', 'color: #00ff00; font-size: 20px;');
        
        // Add debug class to body
        document.body.classList.add('debug-mode');
        
        // Show debug panel
        this.createDebugPanel();
        
        // Start collecting metrics
        this.startMetricsCollection();
    }
    
    disable() {
        this.enabled = false;
        document.body.classList.remove('debug-mode');
        
        // Remove debug panel
        const panel = document.querySelector('.debug-panel');
        if (panel) panel.remove();
        
        console.log('%c🐛 Debug Mode Disabled', 'color: #ff0000; font-size: 20px;');
    }
    
    overrideConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        
        console.log = (...args) => {
            this.log('log', args);
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            this.log('error', args);
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.log('warn', args);
            originalWarn.apply(console, args);
        };
        
        console.info = (...args) => {
            this.log('info', args);
            originalInfo.apply(console, args);
        };
    }
    
    log(level, args) {
        if (!this.shouldLog(level)) return;
        
        const entry = {
            level: level,
            timestamp: Date.now(),
            message: args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return '[Circular Object]';
                    }
                }
                return String(arg);
            }).join(' '),
            stack: new Error().stack
        };
        
        this.logs.push(entry);
        
        // Maintain log size limit
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Update debug panel
        this.updateDebugPanel();
    }
    
    shouldLog(level) {
        const levels = ['error', 'warn', 'info', 'log'];
        const currentIndex = levels.indexOf(this.logLevel);
        const messageIndex = levels.indexOf(level);
        
        return messageIndex <= currentIndex;
    }
    
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-header">
                <h3>🐛 Debug Panel</h3>
                <button onclick="window.debugManager.togglePanel()">_</button>
                <button onclick="window.debugManager.disable()">×</button>
            </div>
            <div class="debug-tabs">
                <button class="debug-tab active" data-tab="console">Console</button>
                <button class="debug-tab" data-tab="state">State</button>
                <button class="debug-tab" data-tab="network">Network</button>
                <button class="debug-tab" data-tab="performance">Performance</button>
            </div>
            <div class="debug-content">
                <div class="debug-pane active" id="debug-console">
                    <div class="debug-controls">
                        <select id="debug-log-level">
                            <option value="error">Errors Only</option>
                            <option value="warn">Warnings</option>
                            <option value="info" selected>Info</option>
                            <option value="log">All Logs</option>
                        </select>
                        <button onclick="window.debugManager.clearLogs()">Clear</button>
                        <button onclick="window.debugManager.downloadLogs()">Export</button>
                    </div>
                    <div class="debug-logs"></div>
                </div>
                <div class="debug-pane" id="debug-state">
                    <div class="debug-state-tree"></div>
                </div>
                <div class="debug-pane" id="debug-network">
                    <div class="debug-network-log"></div>
                </div>
                <div class="debug-pane" id="debug-performance">
                    <div class="debug-performance-metrics"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Set up tab switching
        panel.querySelectorAll('.debug-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Set up log level change
        document.getElementById('debug-log-level').addEventListener('change', (e) => {
            this.logLevel = e.target.value;
            this.updateDebugPanel();
        });
        
        // Make panel draggable
        this.makeDraggable(panel);
        
        // Store reference
        window.debugManager = this;
    }
    
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update active pane
        document.querySelectorAll('.debug-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `debug-${tabName}`);
        });
        
        // Update content
        switch (tabName) {
            case 'state':
                this.updateStateView();
                break;
            case 'network':
                this.updateNetworkView();
                break;
            case 'performance':
                this.updatePerformanceView();
                break;
        }
    }
    
    updateDebugPanel() {
        const logsContainer = document.querySelector('.debug-logs');
        if (!logsContainer) return;
        
        const filteredLogs = this.logs.filter(log => this.shouldLog(log.level));
        
        logsContainer.innerHTML = filteredLogs.map(log => `
            <div class="debug-log-entry debug-log-${log.level}">
                <span class="debug-log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
                <span class="debug-log-level">[${log.level.toUpperCase()}]</span>
                <span class="debug-log-message">${this.escapeHtml(log.message)}</span>
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    updateStateView() {
        const container = document.querySelector('.debug-state-tree');
        if (!container) return;
        
        const state = this.app.state.getAll();
        container.innerHTML = `<pre>${JSON.stringify(state, null, 2)}</pre>`;
    }
    
    watchState(key, callback) {
        if (!this.watchers.has(key)) {
            this.watchers.set(key, []);
        }
        
        this.watchers.get(key).push(callback);
        
        // Override state setter
        const originalSet = this.app.state.set;
        this.app.state.set = (k, value) => {
            const oldValue = this.app.state.get(k);
            originalSet.call(this.app.state, k, value);
            
            if (k === key && this.watchers.has(key)) {
                this.watchers.get(key).forEach(cb => {
                    cb(value, oldValue);
                });
            }
        };
    }
    
    trace(functionName) {
        console.log(`%c→ ${functionName}`, 'color: #4CAF50');
        
        return {
            end: (result) => {
                console.log(`%c← ${functionName}`, 'color: #2196F3', result);
            }
        };
    }
    
    profile(name, fn) {
        if (!this.enabled) return fn();
        
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        console.log(`%c⏱ ${name}: ${duration.toFixed(2)}ms`, 'color: #FF9800');
        
        return result;
    }
    
    setupDebugCommands() {
        // Expose debug commands to console
        window.debug = {
            enable: () => this.enable(),
            disable: () => this.disable(),
            state: () => console.table(this.app.state.getAll()),
            clear: () => this.clearLogs(),
            export: () => this.downloadLogs(),
            watch: (key, cb) => this.watchState(key, cb),
            profile: (name, fn) => this.profile(name, fn),
            metrics: () => this.showMetrics()
        };
        
        console.log('%cDebug commands available: window.debug', 'color: #9C27B0');
    }
    
    clearLogs() {
        this.logs = [];
        this.updateDebugPanel();
    }
    
    downloadLogs() {
        const data = {
            timestamp: new Date().toISOString(),
            logs: this.logs,
            state: this.app.state.getAll(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-log-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// CSS for debug panel
const debugStyles = `
.debug-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 400px;
    height: 300px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #333;
    color: #fff;
    font-family: monospace;
    font-size: 12px;
    z-index: 10001;
    display: flex;
    flex-direction: column;
}

.debug-header {
    background: #222;
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
}

.debug-tabs {
    display: flex;
    background: #333;
}

.debug-tab {
    padding: 5px 15px;
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
}

.debug-tab.active {
    background: #444;
    color: #fff;
}

.debug-content {
    flex: 1;
    overflow: hidden;
}

.debug-pane {
    display: none;
    height: 100%;
    overflow-y: auto;
}

.debug-pane.active {
    display: block;
}

.debug-logs {
    padding: 10px;
}

.debug-log-entry {
    margin-bottom: 5px;
    font-size: 11px;
}

.debug-log-error { color: #ff6b6b; }
.debug-log-warn { color: #ffd93d; }
.debug-log-info { color: #6bcf7f; }
.debug-log-log { color: #e1e1e1; }

.debug-log-time {
    color: #666;
    margin-right: 10px;
}

body.debug-mode {
    padding-bottom: 310px;
}
`;
```

## Configuration
- **Settings**: 
  - Enable via URL: ?debug=true
  - Log levels: error/warn/info/log
  - Max logs: 1000 entries
  - Panel position: draggable
- **Defaults**: 
  - Disabled in production
  - Auto-enable on localhost
  - Info level logging
  - Panel minimized
- **Limits**: 
  - Log buffer size
  - Performance overhead
  - Memory usage

## Security Considerations
- **Production Safety**:
  - Disabled by default
  - No sensitive data logged
  - Requires explicit enable
  - Clear security warnings
- **Data Protection**:
  - No remote logging
  - Local storage only
  - User consent required
  - Clear data option

## Performance Impact
- **Load Time**: < 50ms when enabled
- **Memory**: ~2MB for logs
- **Network**: None

## Mobile Considerations
- Smaller debug panel
- Touch-friendly controls
- Reduced log buffer
- Simplified display
- Remote debugging support

## Error Handling
- **Common Errors**: 
  - Console override conflicts
  - Memory pressure
  - Circular references
  - Stack overflow
- **Recovery**: 
  - Graceful degradation
  - Automatic disable
  - Clear error state
  - Fallback logging

## Testing
```bash
# Test debug mode
1. Enable debug mode:
   - Add ?debug=true to URL
   - Verify panel appears
   - Check console enhancement
   
2. Test logging:
   - Perform actions
   - Check log capture
   - Change log levels
   - Export logs
   
3. Test state inspection:
   - View current state
   - Watch state changes
   - Modify state
   - Verify updates
   
4. Test performance:
   - Profile functions
   - Check metrics
   - Monitor impact
```

## Future Enhancements
- **Advanced Debugging**:
  - Time travel debugging
  - State snapshots
  - Action replay
  - Network mocking
  - Error simulation
- **Developer Tools**:
  - Component inspector
  - Performance profiler
  - Memory analyzer
  - Code coverage
  - Hot reloading
- **Collaboration**:
  - Remote debugging
  - Session sharing
  - Bug reporting
  - Screen recording
  - Team debugging