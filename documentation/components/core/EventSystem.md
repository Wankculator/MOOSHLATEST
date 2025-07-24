# EventSystem

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 2567-2833)

## Overview
The EventSystem provides a centralized event handling mechanism for MOOSH Wallet, implementing the publish-subscribe pattern. It enables loose coupling between components by allowing them to communicate through events without direct references.

## Class Definition

```javascript
class EventSystem {
    constructor() {
        this.events = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
        this.debugMode = false;
    }
}
```

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `events` | Map | Event name to listeners mapping |
| `eventHistory` | Array | Recent event history for debugging |
| `maxHistorySize` | Number | Maximum events to keep in history |
| `debugMode` | Boolean | Enable verbose logging |

## Core Methods

### `on(eventName, callback, options = {})`
Subscribes to an event with a callback function.

```javascript
on(eventName, callback, options = {}) {
    if (typeof eventName !== 'string') {
        throw new Error('Event name must be a string');
    }
    
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
    }
    
    // Get or create listener array
    if (!this.events.has(eventName)) {
        this.events.set(eventName, []);
    }
    
    const listeners = this.events.get(eventName);
    
    // Create listener object
    const listener = {
        callback,
        once: options.once || false,
        priority: options.priority || 0,
        id: this.generateListenerId(),
        context: options.context || null
    };
    
    // Add listener in priority order
    const insertIndex = listeners.findIndex(l => l.priority < listener.priority);
    if (insertIndex === -1) {
        listeners.push(listener);
    } else {
        listeners.splice(insertIndex, 0, listener);
    }
    
    if (this.debugMode) {
        console.log(`[EventSystem] Listener added for '${eventName}'`);
    }
    
    // Return unsubscribe function
    return () => this.off(eventName, listener.id);
}
```

### `once(eventName, callback, options = {})`
Subscribes to an event that will only fire once.

```javascript
once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
}
```

### `emit(eventName, data = null)`
Emits an event to all registered listeners.

```javascript
emit(eventName, data = null) {
    if (!this.events.has(eventName)) {
        if (this.debugMode) {
            console.log(`[EventSystem] No listeners for '${eventName}'`);
        }
        return;
    }
    
    const listeners = this.events.get(eventName);
    const listenersToRemove = [];
    
    // Record in history
    this.recordEvent(eventName, data);
    
    // Execute listeners
    for (const listener of listeners) {
        try {
            // Call with context if provided
            if (listener.context) {
                listener.callback.call(listener.context, data);
            } else {
                listener.callback(data);
            }
            
            // Remove if one-time listener
            if (listener.once) {
                listenersToRemove.push(listener.id);
            }
        } catch (error) {
            console.error(`[EventSystem] Error in listener for '${eventName}':`, error);
        }
    }
    
    // Remove one-time listeners
    listenersToRemove.forEach(id => this.off(eventName, id));
    
    if (this.debugMode) {
        console.log(`[EventSystem] Emitted '${eventName}' to ${listeners.length} listeners`);
    }
}
```

### `off(eventName, listenerId)`
Removes a specific listener or all listeners for an event.

```javascript
off(eventName, listenerId = null) {
    if (!this.events.has(eventName)) {
        return;
    }
    
    if (listenerId === null) {
        // Remove all listeners for this event
        this.events.delete(eventName);
        if (this.debugMode) {
            console.log(`[EventSystem] All listeners removed for '${eventName}'`);
        }
    } else {
        // Remove specific listener
        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(l => l.id === listenerId);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            // Clean up empty listener arrays
            if (listeners.length === 0) {
                this.events.delete(eventName);
            }
            
            if (this.debugMode) {
                console.log(`[EventSystem] Listener removed for '${eventName}'`);
            }
        }
    }
}
```

### `emitAsync(eventName, data = null)`
Emits an event asynchronously, waiting for all listeners to complete.

```javascript
async emitAsync(eventName, data = null) {
    if (!this.events.has(eventName)) {
        return [];
    }
    
    const listeners = this.events.get(eventName);
    const results = [];
    
    // Record in history
    this.recordEvent(eventName, data);
    
    // Execute listeners sequentially
    for (const listener of listeners) {
        try {
            const result = listener.context
                ? await listener.callback.call(listener.context, data)
                : await listener.callback(data);
            
            results.push(result);
            
            if (listener.once) {
                this.off(eventName, listener.id);
            }
        } catch (error) {
            console.error(`[EventSystem] Async error in listener for '${eventName}':`, error);
            results.push({ error });
        }
    }
    
    return results;
}
```

### `clear(eventName = null)`
Clears specific or all event listeners.

```javascript
clear(eventName = null) {
    if (eventName) {
        this.events.delete(eventName);
        if (this.debugMode) {
            console.log(`[EventSystem] Cleared all listeners for '${eventName}'`);
        }
    } else {
        this.events.clear();
        if (this.debugMode) {
            console.log(`[EventSystem] Cleared all event listeners`);
        }
    }
}
```

### `hasListeners(eventName)`
Checks if an event has any listeners.

```javascript
hasListeners(eventName) {
    return this.events.has(eventName) && this.events.get(eventName).length > 0;
}
```

### `getListenerCount(eventName = null)`
Gets the count of listeners for an event or all events.

```javascript
getListenerCount(eventName = null) {
    if (eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).length : 0;
    }
    
    let total = 0;
    for (const listeners of this.events.values()) {
        total += listeners.length;
    }
    return total;
}
```

### `recordEvent(eventName, data)`
Records event in history for debugging.

```javascript
recordEvent(eventName, data) {
    const event = {
        name: eventName,
        data: this.debugMode ? data : undefined,
        timestamp: Date.now(),
        listenerCount: this.getListenerCount(eventName)
    };
    
    this.eventHistory.push(event);
    
    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
    }
}
```

## Event Types

### Wallet Events
```javascript
// Wallet created
eventSystem.emit('wallet:created', {
    walletId: 'wallet123',
    name: 'My Wallet',
    address: 'bc1q...'
});

// Balance updated
eventSystem.emit('wallet:balance:updated', {
    walletId: 'wallet123',
    oldBalance: 100000,
    newBalance: 150000
});

// Transaction received
eventSystem.emit('wallet:transaction:received', {
    walletId: 'wallet123',
    txid: 'abc123...',
    amount: 50000
});
```

### UI Events
```javascript
// Theme changed
eventSystem.emit('ui:theme:changed', {
    oldTheme: 'default',
    newTheme: 'moosh'
});

// Modal opened/closed
eventSystem.emit('ui:modal:opened', {
    modalId: 'send-modal',
    modalType: 'send'
});

// Navigation
eventSystem.emit('ui:navigation', {
    from: '/dashboard',
    to: '/wallet/123'
});
```

### Network Events
```javascript
// Connection status
eventSystem.emit('network:status:changed', {
    online: true,
    connectionType: 'wifi'
});

// API error
eventSystem.emit('network:error', {
    endpoint: '/api/balance',
    error: 'timeout',
    retryCount: 3
});
```

## Usage Examples

### Basic Event Handling
```javascript
const eventSystem = new EventSystem();

// Subscribe to event
const unsubscribe = eventSystem.on('wallet:created', (data) => {
    console.log('New wallet created:', data.name);
});

// Emit event
eventSystem.emit('wallet:created', {
    walletId: '123',
    name: 'My Bitcoin Wallet'
});

// Unsubscribe
unsubscribe();
```

### Priority Listeners
```javascript
// High priority listener (executes first)
eventSystem.on('transaction:pending', (tx) => {
    validateTransaction(tx);
}, { priority: 10 });

// Normal priority
eventSystem.on('transaction:pending', (tx) => {
    updateUI(tx);
}, { priority: 0 });

// Low priority (executes last)
eventSystem.on('transaction:pending', (tx) => {
    logTransaction(tx);
}, { priority: -10 });
```

### Async Event Handling
```javascript
// Async listeners
eventSystem.on('wallet:backup:requested', async (wallet) => {
    const encrypted = await encryptWallet(wallet);
    await saveToCloud(encrypted);
    return { success: true, backupId: '123' };
});

// Emit and wait for results
const results = await eventSystem.emitAsync('wallet:backup:requested', wallet);
console.log('Backup results:', results);
```

### Event Context
```javascript
class WalletComponent {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.balance = 0;
        
        // Bind with context
        this.eventSystem.on('balance:updated', this.handleBalanceUpdate, {
            context: this
        });
    }
    
    handleBalanceUpdate(data) {
        // 'this' refers to the component instance
        this.balance = data.newBalance;
        this.render();
    }
}
```

## Common Patterns

### Event Bus Pattern
```javascript
// Global event bus
class AppEventBus extends EventSystem {
    constructor() {
        super();
        this.debugMode = true;
    }
    
    // Add app-specific methods
    emitWalletEvent(action, data) {
        this.emit(`wallet:${action}`, data);
    }
    
    emitUIEvent(action, data) {
        this.emit(`ui:${action}`, data);
    }
}

// Usage
const eventBus = new AppEventBus();
export default eventBus;
```

### Event Aggregation
```javascript
// Aggregate multiple events
class EventAggregator {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.pending = new Map();
    }
    
    waitForAll(events, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const results = new Map();
            const timer = setTimeout(() => {
                reject(new Error('Timeout waiting for events'));
            }, timeout);
            
            events.forEach(eventName => {
                this.eventSystem.once(eventName, (data) => {
                    results.set(eventName, data);
                    
                    if (results.size === events.length) {
                        clearTimeout(timer);
                        resolve(results);
                    }
                });
            });
        });
    }
}
```

## Testing

### Unit Testing
```javascript
describe('EventSystem', () => {
    let eventSystem;
    
    beforeEach(() => {
        eventSystem = new EventSystem();
    });
    
    test('should register and emit events', () => {
        const callback = jest.fn();
        eventSystem.on('test:event', callback);
        
        eventSystem.emit('test:event', { data: 'test' });
        
        expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });
    
    test('should handle once listeners', () => {
        const callback = jest.fn();
        eventSystem.once('test:once', callback);
        
        eventSystem.emit('test:once');
        eventSystem.emit('test:once');
        
        expect(callback).toHaveBeenCalledTimes(1);
    });
    
    test('should respect listener priority', () => {
        const order = [];
        
        eventSystem.on('test:priority', () => order.push(2), { priority: 0 });
        eventSystem.on('test:priority', () => order.push(1), { priority: 10 });
        eventSystem.on('test:priority', () => order.push(3), { priority: -10 });
        
        eventSystem.emit('test:priority');
        
        expect(order).toEqual([1, 2, 3]);
    });
});
```

## Best Practices

1. **Use namespaced events** (e.g., 'wallet:created' not just 'created')
2. **Always unsubscribe** when components are destroyed
3. **Handle errors** in event listeners
4. **Document event data structure** for each event type
5. **Use async events** for operations that return values

## Performance Considerations

```javascript
// Debounced event emission
class DebouncedEventSystem extends EventSystem {
    constructor() {
        super();
        this.debounceTimers = new Map();
    }
    
    emitDebounced(eventName, data, delay = 300) {
        // Clear existing timer
        if (this.debounceTimers.has(eventName)) {
            clearTimeout(this.debounceTimers.get(eventName));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            this.emit(eventName, data);
            this.debounceTimers.delete(eventName);
        }, delay);
        
        this.debounceTimers.set(eventName, timer);
    }
}

// Memory leak prevention
class SafeEventSystem extends EventSystem {
    constructor() {
        super();
        this.maxListenersPerEvent = 10;
    }
    
    on(eventName, callback, options = {}) {
        // Warn if too many listeners
        if (this.getListenerCount(eventName) >= this.maxListenersPerEvent) {
            console.warn(`[EventSystem] Possible memory leak: ${eventName} has ${this.getListenerCount(eventName)} listeners`);
        }
        
        return super.on(eventName, callback, options);
    }
}
```

## Related Components

- [StateManager](./StateManager.md) - State change events
- [NotificationSystem](./NotificationSystem.md) - UI notifications
- [WalletManager](./WalletManager.md) - Wallet events
- [Router](./Router.md) - Navigation events
- [Component](./Component.md) - Component lifecycle events