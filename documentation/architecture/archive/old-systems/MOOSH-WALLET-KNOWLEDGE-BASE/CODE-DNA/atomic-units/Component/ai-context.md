# Component - AI Context Guide

## Critical Understanding

Component is the **BASE CLASS** for ALL UI components in MOOSH Wallet. Every page, modal, and complex UI element extends this class. It provides lifecycle management, state integration, and memory leak prevention. Breaking Component breaks EVERY UI element.

## Architecture Overview

```
Component (Base)
    ↓
Pages & Modals (Extend Component)
    ↓
render() → DOM Element
    ↓
mount() → Attach to DOM
    ↓
listenToState() → Reactive Updates
    ↓
destroy() → Cleanup
```

## When Modifying Component

### Pre-Flight Checklist
- [ ] Do you understand the lifecycle flow?
- [ ] Have you considered memory management?
- [ ] Will changes affect ALL subclasses?
- [ ] Have you maintained the abstract pattern?
- [ ] Is backward compatibility preserved?

### Absolute Rules
1. **NEVER break the render() contract** - Must return element
2. **ALWAYS track state listeners** - Memory leaks otherwise
3. **ALWAYS call super() in subclasses** - Breaks without it
4. **NEVER skip destroy()** - Memory leaks guaranteed
5. **MAINTAIN the lifecycle order** - Components depend on it

## Lifecycle Flow

### 1. Construction Phase
```javascript
class MyComponent extends Component {
    constructor(app) {
        super(app); // CRITICAL - Must call super
        // Now safe to use:
        // - this.app (application reference)
        // - this.element (null initially)
        // - this.stateListeners (empty array)
    }
}
```

### 2. Render Phase
```javascript
render() {
    // MUST return an HTMLElement
    return $.div({ className: 'my-component' }, [
        $.h1({}, ['Title']),
        $.button({ onclick: () => this.handleClick() }, ['Click'])
    ]);
    
    // WRONG - Common mistakes:
    // return null; // Breaks mounting
    // return '<div>...</div>'; // String not element
    // No return statement // undefined breaks mounting
}
```

### 3. Mount Phase
```javascript
// Framework calls this - don't override unless necessary
mount(parent) {
    this.element = this.render(); // Get DOM element
    if (this.element) {
        parent.appendChild(this.element); // Attach to DOM
        this.afterMount(); // Call hook
    }
}
```

### 4. Post-Mount Phase
```javascript
afterMount() {
    // Safe to:
    // - Access this.element
    // - Query child elements
    // - Start timers
    // - Make API calls
    // - Focus inputs
    
    // Example:
    const input = this.element.querySelector('input');
    if (input) input.focus();
    
    // Start listening to state
    this.listenToState('currentUser', (user) => {
        this.updateUserDisplay(user);
    });
}
```

### 5. Destroy Phase
```javascript
destroy() {
    // Custom cleanup first
    clearInterval(this.updateTimer);
    this.ws?.close();
    
    // THEN call super - CRITICAL!
    super.destroy(); // Handles listeners and unmounting
}
```

## State Management Integration

### Correct State Listening
```javascript
// CORRECT - Tracked for cleanup
this.listenToState('balance', (newBalance, oldBalance) => {
    this.updateBalance(newBalance);
});

// WRONG - Memory leak!
this.app.state.subscribe('balance', () => {}); // Not tracked!
```

### Multiple State Subscriptions
```javascript
afterMount() {
    // All tracked automatically
    this.listenToState('user', this.updateUser.bind(this));
    this.listenToState('theme', this.updateTheme.bind(this));
    this.listenToState('balance', this.updateBalance.bind(this));
    
    // All cleaned up on destroy()
}
```

## Common Patterns

### Basic Component
```javascript
class StatusDisplay extends Component {
    render() {
        const status = this.app.state.get('status') || 'offline';
        
        return $.div({ className: 'status' }, [
            $.span({ className: `status-${status}` }, [status])
        ]);
    }
    
    afterMount() {
        this.listenToState('status', () => {
            // Re-render on status change
            const newElement = this.render();
            this.element.replaceWith(newElement);
            this.element = newElement;
        });
    }
}
```

### Component with Cleanup
```javascript
class LivePrice extends Component {
    constructor(app) {
        super(app);
        this.updateInterval = null;
    }
    
    render() {
        return $.div({ className: 'price' }, ['Loading...']);
    }
    
    afterMount() {
        this.updatePrice();
        this.updateInterval = setInterval(() => {
            this.updatePrice();
        }, 60000);
    }
    
    async updatePrice() {
        const price = await this.app.api.fetchBitcoinPrice();
        this.element.textContent = `$${price.usd}`;
    }
    
    destroy() {
        clearInterval(this.updateInterval); // Clean up first
        super.destroy(); // Then parent cleanup
    }
}
```

## Memory Management

### Common Memory Leaks
```javascript
// LEAK 1 - Untracked listeners
this.app.state.subscribe('data', callback); // BAD!

// LEAK 2 - Window/document listeners
window.addEventListener('resize', this.handler); // Not cleaned!

// LEAK 3 - Timers
setInterval(() => this.update(), 1000); // Runs forever!

// LEAK 4 - Not calling destroy()
router.navigate('other-page'); // Component still listening!
```

### Proper Cleanup Pattern
```javascript
class SafeComponent extends Component {
    constructor(app) {
        super(app);
        this.resizeHandler = this.handleResize.bind(this);
        this.timers = [];
    }
    
    afterMount() {
        // Track everything
        window.addEventListener('resize', this.resizeHandler);
        
        const timer = setInterval(() => {
            this.update();
        }, 1000);
        this.timers.push(timer);
    }
    
    destroy() {
        // Clean up everything
        window.removeEventListener('resize', this.resizeHandler);
        this.timers.forEach(timer => clearInterval(timer));
        
        // Parent cleanup
        super.destroy();
    }
}
```

## Common AI Hallucinations to Avoid

### 1. React-like Patterns
```javascript
// HALLUCINATION - Not React!
setState({ count: 1 }); // WRONG
this.forceUpdate(); // WRONG
componentDidMount() {} // WRONG

// CORRECT
this.app.state.set('count', 1);
// Re-render manually if needed
afterMount() {} // Correct lifecycle
```

### 2. Virtual DOM
```javascript
// HALLUCINATION - No VDOM!
return <div>Hello</div>; // JSX doesn't work
diff(oldTree, newTree); // No diffing

// CORRECT - Real DOM
return $.div({}, ['Hello']);
```

### 3. Automatic Re-rendering
```javascript
// HALLUCINATION - No auto re-render!
// Changing state doesn't re-render components

// CORRECT - Manual updates
this.listenToState('data', (newData) => {
    // Manually update DOM
    this.element.querySelector('.data').textContent = newData;
});
```

## Testing Patterns

### Basic Component Test
```javascript
// Mock app
const mockApp = {
    state: {
        get: (key) => mockState[key],
        subscribe: (key, cb) => { /* track */ },
        removeListener: (key, cb) => { /* remove */ }
    }
};

// Test lifecycle
const component = new MyComponent(mockApp);
const element = component.render();
assert(element instanceof HTMLElement);

// Test mounting
const container = document.createElement('div');
component.mount(container);
assert(container.contains(component.element));

// Test cleanup
component.destroy();
assert(!container.contains(component.element));
```

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me override mount()..." - Usually unnecessary
2. "Skip calling super()..." - NEVER skip!
3. "I'll handle cleanup later..." - Memory leak!
4. "Direct DOM updates are fine..." - Use render()!
5. "Who needs destroy()..." - ALWAYS needed!

## AI Instructions Summary

When asked to modify Component:
1. **PRESERVE** the lifecycle contract
2. **MAINTAIN** memory safety patterns
3. **ENSURE** backward compatibility
4. **TEST** with actual subclasses
5. **DOCUMENT** any new requirements

Remember: Component is the foundation of EVERY UI element. Changes here affect the entire application. Extreme caution required!