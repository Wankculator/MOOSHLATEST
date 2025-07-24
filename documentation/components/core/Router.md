# Router

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 2834-3057)

## Overview
The Router class provides client-side routing functionality for MOOSH Wallet, enabling single-page application (SPA) navigation without page reloads. It supports dynamic routes, route parameters, navigation guards, and history management.

## Class Definition

```javascript
class Router {
    constructor(app) {
        this.app = app;
        this.routes = new Map();
        this.currentPath = null;
        this.currentComponent = null;
        this.params = {};
        this.notFoundHandler = null;
        this.beforeNavigateCallbacks = [];
        this.afterNavigateCallbacks = [];
    }
}
```

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `app` | MOOSHWalletApp | Main application instance |
| `routes` | Map | Route path to component mapping |
| `currentPath` | String | Currently active route path |
| `currentComponent` | Component | Currently rendered component |
| `params` | Object | Current route parameters |
| `notFoundHandler` | Function | 404 page handler |
| `beforeNavigateCallbacks` | Array | Pre-navigation hooks |
| `afterNavigateCallbacks` | Array | Post-navigation hooks |

## Core Methods

### `init()`
Initializes the router and starts listening for navigation events.

```javascript
init() {
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        this.handleRoute(window.location.pathname);
    });
    
    // Handle link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.href.startsWith(window.location.origin)) {
            e.preventDefault();
            const path = new URL(link.href).pathname;
            this.navigate(path);
        }
    });
    
    // Handle initial route
    this.handleRoute(window.location.pathname);
}
```

### `addRoute(path, componentFactory)`
Registers a new route with its component factory.

```javascript
addRoute(path, componentFactory) {
    if (typeof path !== 'string') {
        throw new Error('Route path must be a string');
    }
    
    if (typeof componentFactory !== 'function') {
        throw new Error('Component factory must be a function');
    }
    
    this.routes.set(path, {
        path: path,
        regex: this.pathToRegex(path),
        paramNames: this.extractParamNames(path),
        factory: componentFactory
    });
    
    console.log(`[Router] Route added: ${path}`);
}
```

### `navigate(path, options = {})`
Programmatically navigates to a new route.

```javascript
async navigate(path, options = {}) {
    // Normalize path
    path = this.normalizePath(path);
    
    // Check if same path
    if (path === this.currentPath && !options.force) {
        console.log(`[Router] Already at ${path}`);
        return;
    }
    
    // Run before navigate callbacks
    for (const callback of this.beforeNavigateCallbacks) {
        const shouldContinue = await callback(path, this.currentPath);
        if (shouldContinue === false) {
            console.log(`[Router] Navigation cancelled by guard`);
            return;
        }
    }
    
    // Update browser history
    if (!options.replace) {
        window.history.pushState({ path }, '', path);
    } else {
        window.history.replaceState({ path }, '', path);
    }
    
    // Handle the route
    await this.handleRoute(path);
    
    // Run after navigate callbacks
    for (const callback of this.afterNavigateCallbacks) {
        await callback(path, this.currentPath);
    }
}
```

### `handleRoute(path)`
Processes route changes and renders the appropriate component.

```javascript
async handleRoute(path) {
    console.log(`[Router] Handling route: ${path}`);
    
    // Find matching route
    const match = this.findMatchingRoute(path);
    
    if (!match) {
        console.log(`[Router] No route found for ${path}`);
        this.handle404();
        return;
    }
    
    // Extract params
    this.params = this.extractParams(path, match.route);
    
    // Cleanup current component
    if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
        await this.currentComponent.cleanup();
    }
    
    try {
        // Create new component
        const component = match.route.factory();
        this.currentComponent = component;
        this.currentPath = path;
        
        // Check if component needs authentication
        if (component.requiresAuth && !this.checkAuth()) {
            console.log(`[Router] Route requires authentication`);
            this.navigate('/');
            return;
        }
        
        // Render component
        const element = await component.render();
        
        // Update DOM
        const container = document.getElementById('app-content');
        if (container) {
            // Add fade transition
            container.style.opacity = '0';
            
            setTimeout(() => {
                container.innerHTML = '';
                if (element instanceof Node) {
                    container.appendChild(element);
                } else {
                    console.error('[Router] Component did not return a valid DOM element');
                }
                
                // Fade in
                container.style.opacity = '1';
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Call component lifecycle method
                if (typeof component.onMount === 'function') {
                    component.onMount();
                }
            }, 150);
        }
        
    } catch (error) {
        console.error(`[Router] Error rendering component:`, error);
        this.handleError(error);
    }
}
```

### `pathToRegex(path)`
Converts route path to regex for matching.

```javascript
pathToRegex(path) {
    // Convert :param to named capture groups
    const pattern = path
        .replace(/\//g, '\\/')
        .replace(/:(\w+)/g, '(?<$1>[^/]+)')
        .replace(/\*/g, '.*');
    
    return new RegExp(`^${pattern}$`);
}
```

### `extractParamNames(path)`
Extracts parameter names from route path.

```javascript
extractParamNames(path) {
    const matches = path.matchAll(/:(\w+)/g);
    return Array.from(matches).map(match => match[1]);
}
```

### `findMatchingRoute(path)`
Finds the route that matches the given path.

```javascript
findMatchingRoute(path) {
    for (const [routePath, route] of this.routes) {
        const match = path.match(route.regex);
        if (match) {
            return { route, match };
        }
    }
    return null;
}
```

### `extractParams(path, route)`
Extracts parameters from the matched path.

```javascript
extractParams(path, route) {
    const match = path.match(route.regex);
    if (!match || !match.groups) return {};
    
    const params = {};
    for (const paramName of route.paramNames) {
        params[paramName] = match.groups[paramName];
    }
    
    return params;
}
```

### `setNotFoundHandler(handler)`
Sets the 404 page handler.

```javascript
setNotFoundHandler(handler) {
    if (typeof handler !== 'function') {
        throw new Error('Not found handler must be a function');
    }
    
    this.notFoundHandler = handler;
}
```

### `handle404()`
Handles 404 errors.

```javascript
handle404() {
    if (this.notFoundHandler) {
        const component = this.notFoundHandler();
        const element = component.render();
        
        const container = document.getElementById('app-content');
        if (container) {
            container.innerHTML = '';
            container.appendChild(element);
        }
    } else {
        // Default 404 page
        const container = document.getElementById('app-content');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h1 style="font-size: 48px; margin-bottom: 20px;">404</h1>
                    <p style="font-size: 18px; color: var(--text-dim);">Page not found</p>
                    <a href="/" style="color: var(--text-primary);">Go Home</a>
                </div>
            `;
        }
    }
}
```

### `beforeNavigate(callback)`
Registers a pre-navigation guard.

```javascript
beforeNavigate(callback) {
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
    }
    
    this.beforeNavigateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
        const index = this.beforeNavigateCallbacks.indexOf(callback);
        if (index > -1) {
            this.beforeNavigateCallbacks.splice(index, 1);
        }
    };
}
```

### `checkAuth()`
Checks if user is authenticated for protected routes.

```javascript
checkAuth() {
    const hasWallets = this.app.walletManager.getAllWallets().length > 0;
    const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
    
    return !hasWallets || isUnlocked;
}
```

## Usage Examples

### Basic Route Setup
```javascript
const app = new MOOSHWalletApp();
const router = new Router(app);

// Add routes
router.addRoute('/', () => new HomePage(app));
router.addRoute('/about', () => new AboutPage(app));
router.addRoute('/wallet/:id', () => new WalletPage(app));
router.addRoute('/settings', () => new SettingsPage(app));

// Set 404 handler
router.setNotFoundHandler(() => new NotFoundPage(app));

// Initialize
router.init();
```

### Using Route Parameters
```javascript
// In component
class WalletPage extends Component {
    render() {
        const walletId = this.app.router.params.id;
        const wallet = this.app.walletManager.getWallet(walletId);
        
        return $.div({}, [
            $.h1({}, [`Wallet: ${wallet.name}`])
        ]);
    }
}
```

### Navigation Guards
```javascript
// Protect routes
router.beforeNavigate(async (to, from) => {
    const protectedRoutes = ['/wallet', '/settings', '/dashboard'];
    
    if (protectedRoutes.some(route => to.startsWith(route))) {
        const isAuthenticated = sessionStorage.getItem('walletUnlocked') === 'true';
        
        if (!isAuthenticated) {
            // Redirect to home
            router.navigate('/');
            return false; // Cancel navigation
        }
    }
    
    return true; // Allow navigation
});

// Track navigation
router.afterNavigate((to, from) => {
    console.log(`Navigated from ${from} to ${to}`);
    
    // Analytics tracking
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: to
        });
    }
});
```

### Programmatic Navigation
```javascript
// Navigate with options
router.navigate('/dashboard', { replace: true }); // Replace history entry
router.navigate('/wallet/123', { force: true }); // Force re-render

// Navigate with data
router.navigate('/transaction', {
    state: { 
        amount: 100000,
        recipient: 'bc1q...'
    }
});
```

## Advanced Features

### Lazy Loading Routes
```javascript
// Lazy load heavy components
router.addRoute('/analytics', async () => {
    const module = await import('./components/AnalyticsPage.js');
    return new module.default(app);
});
```

### Route Transitions
```javascript
// Custom transitions between routes
router.beforeNavigate((to, from) => {
    const container = document.getElementById('app-content');
    container.classList.add('route-transition-out');
});

router.afterNavigate((to, from) => {
    const container = document.getElementById('app-content');
    container.classList.remove('route-transition-out');
    container.classList.add('route-transition-in');
    
    setTimeout(() => {
        container.classList.remove('route-transition-in');
    }, 300);
});
```

## Common Issues

### Issue: Routes Not Matching
**Problem**: Dynamic routes not working
**Solution**: 
```javascript
// Debug route matching
findMatchingRoute(path) {
    console.log(`[Router] Trying to match: ${path}`);
    
    for (const [routePath, route] of this.routes) {
        console.log(`[Router] Testing against: ${routePath}`);
        const match = path.match(route.regex);
        if (match) {
            console.log(`[Router] Matched with params:`, match.groups);
            return { route, match };
        }
    }
    
    console.log(`[Router] No match found`);
    return null;
}
```

### Issue: Memory Leaks
**Problem**: Components not cleaning up properly
**Solution**:
```javascript
// Ensure proper cleanup
async handleRoute(path) {
    // Always cleanup previous component
    if (this.currentComponent) {
        try {
            // Call cleanup if available
            if (typeof this.currentComponent.cleanup === 'function') {
                await this.currentComponent.cleanup();
            }
            
            // Remove event listeners
            if (this.currentComponent.eventListeners) {
                this.currentComponent.eventListeners.forEach(({ target, event, handler }) => {
                    target.removeEventListener(event, handler);
                });
            }
            
            // Clear references
            this.currentComponent = null;
        } catch (error) {
            console.error('[Router] Cleanup error:', error);
        }
    }
    
    // Continue with route handling...
}
```

## Testing Approaches

### Unit Testing
```javascript
describe('Router', () => {
    let app, router;
    
    beforeEach(() => {
        app = new MOOSHWalletApp();
        router = new Router(app);
        
        // Mock window.history
        delete window.location;
        window.location = { pathname: '/' };
        window.history.pushState = jest.fn();
    });
    
    test('should add routes correctly', () => {
        router.addRoute('/test', () => new TestComponent());
        expect(router.routes.has('/test')).toBe(true);
    });
    
    test('should extract params from routes', () => {
        router.addRoute('/wallet/:id', () => {});
        const route = router.routes.get('/wallet/:id');
        
        const params = router.extractParams('/wallet/123', route);
        expect(params.id).toBe('123');
    });
    
    test('should handle navigation guards', async () => {
        let guardCalled = false;
        router.beforeNavigate(() => {
            guardCalled = true;
            return false; // Cancel navigation
        });
        
        await router.navigate('/test');
        expect(guardCalled).toBe(true);
        expect(window.history.pushState).not.toHaveBeenCalled();
    });
});
```

## Best Practices

1. **Always cleanup components** to prevent memory leaks
2. **Use navigation guards** for authentication
3. **Normalize paths** to ensure consistency
4. **Handle errors gracefully** with fallback pages
5. **Implement loading states** for async routes

## Performance Optimization

```javascript
// Cache rendered components
class CachedRouter extends Router {
    constructor(app) {
        super(app);
        this.componentCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    async handleRoute(path) {
        const cacheKey = path;
        const cached = this.componentCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            // Use cached component
            this.renderCachedComponent(cached.component);
            return;
        }
        
        // Render normally and cache
        await super.handleRoute(path);
        
        if (this.currentComponent) {
            this.componentCache.set(cacheKey, {
                component: this.currentComponent,
                timestamp: Date.now()
            });
        }
    }
}
```

## Related Components

- [MOOSHWalletApp](./MOOSHWalletApp.md) - Main application
- [Component](./Component.md) - Base component class
- [NavigationGuard](./NavigationGuard.md) - Route protection
- [HeaderComponent](./HeaderComponent.md) - Navigation UI
- [StateManager](./StateManager.md) - Application state