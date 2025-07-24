# MOOSHWalletApp

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 31267-31566)

## Overview
MOOSHWalletApp is the main application class that bootstraps and coordinates all components of the MOOSH Wallet. It initializes the state management, API services, routing, UI components, and manages the overall application lifecycle.

## Class Definition

```javascript
class MOOSHWalletApp {
    constructor() {
        this.state = new StateManager();
        this.styleManager = new StyleManager();
        this.apiService = new APIService(this.state);
        this.router = null;
        this.header = null;
        this.container = null;
    }
}
```

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | StateManager | Global application state management |
| `styleManager` | StyleManager | Dynamic CSS injection and theming |
| `apiService` | APIService | API communication layer |
| `router` | Router | Client-side routing system |
| `header` | HeaderComponent | Application header |
| `container` | HTMLElement | Main content container |
| `walletManager` | WalletManager | Wallet operations manager |
| `sparkWalletManager` | SparkWalletManager | Spark Protocol manager |
| `notificationSystem` | NotificationSystem | Toast notifications |

## Core Methods

### `init()`
Initializes the entire application.

```javascript
async init() {
    console.log('[App] Initializing MOOSH Wallet...');
    
    // Clear unlock status on every page load/refresh to force lock
    sessionStorage.removeItem('walletUnlocked');
    console.log('[App] Cleared unlock status - wallet will be locked');
    
    // Clear body and set up fonts
    this.setupDocument();
    console.log('[App] Document setup complete');
    
    // Inject styles
    this.styleManager.inject();
    console.log('[App] Styles injected');
    
    // Wait for fonts to load
    await this.loadFonts();
    console.log('[App] Fonts loaded');
    
    // Create app structure
    this.createAppStructure();
    console.log('[App] App structure created');
    
    // Initialize managers
    await this.initializeManagers();
    console.log('[App] Managers initialized');
    
    // Setup router and start
    this.setupRouter();
    console.log('[App] Router setup complete');
    
    // Initialize notification system
    this.notificationSystem = new NotificationSystem();
    console.log('[App] Notification system ready');
    
    // Check for existing wallets
    await this.checkExistingWallets();
    
    // Check lock status
    this.checkLockStatus();
    
    console.log('[App] MOOSH Wallet initialized successfully');
}
```

### `setupDocument()`
Prepares the document for the application.

```javascript
setupDocument() {
    // Clear body
    document.body.innerHTML = '';
    document.body.className = '';
    
    // Set base styles
    document.body.style.cssText = `
        margin: 0;
        padding: 0;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: 'JetBrains Mono', monospace;
        min-height: 100vh;
        overflow-x: hidden;
    `;
    
    // Add font preconnect
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);
    
    // Add font stylesheet
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
    
    // Set viewport meta
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
}
```

### `createAppStructure()`
Creates the main application DOM structure.

```javascript
createAppStructure() {
    // Create main app container
    const appDiv = ElementFactory.div({
        id: 'moosh-app',
        className: 'app-wrapper',
        style: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }
    });
    
    // Create and append header
    this.header = new HeaderComponent(this);
    appDiv.appendChild(this.header.render());
    
    // Create main content container
    this.container = ElementFactory.div({
        id: 'app-content',
        className: 'app-content',
        style: {
            flex: 1,
            padding: 'calc(var(--container-padding) * var(--scale-factor))',
            maxWidth: 'var(--container-lg)',
            width: '100%',
            margin: '0 auto',
            paddingBottom: 'calc(80px * var(--scale-factor))' // Space for footer
        }
    });
    appDiv.appendChild(this.container);
    
    // Create footer
    const footer = this.createFooter();
    appDiv.appendChild(footer);
    
    // Append to body
    document.body.appendChild(appDiv);
}
```

### `initializeManagers()`
Initializes all manager classes.

```javascript
async initializeManagers() {
    // Initialize wallet manager
    this.walletManager = new WalletManager(this);
    await this.walletManager.init();
    
    // Initialize Spark wallet manager
    this.sparkWalletManager = new SparkWalletManager();
    
    // Initialize other managers
    this.transactionManager = new TransactionManager(this);
    this.addressManager = new AddressManager(this);
    this.settingsManager = new SettingsManager(this);
    
    // Load saved settings
    await this.settingsManager.loadSettings();
    
    // Apply theme
    const savedTheme = this.settingsManager.get('theme');
    if (savedTheme === 'moosh') {
        document.body.classList.add('moosh-mode');
    }
}
```

### `setupRouter()`
Configures the client-side router.

```javascript
setupRouter() {
    this.router = new Router(this);
    
    // Define routes
    this.router.addRoute('/', () => new HomePage(this));
    this.router.addRoute('/create-wallet', () => new CreateWalletPage(this));
    this.router.addRoute('/import-wallet', () => new ImportWalletPage(this));
    this.router.addRoute('/generate-seed', () => new GenerateSeedPage(this));
    this.router.addRoute('/confirm-seed', () => new ConfirmSeedPage(this));
    this.router.addRoute('/account-details', () => new AccountDetailsPage(this));
    this.router.addRoute('/wallet-created', () => new WalletCreatedPage(this));
    this.router.addRoute('/wallet-imported', () => new WalletImportedPage(this));
    this.router.addRoute('/dashboard', () => new DashboardPage(this));
    this.router.addRoute('/wallet/:id', () => new WalletDetailsPage(this));
    this.router.addRoute('/settings', () => new SettingsPage(this));
    this.router.addRoute('/about', () => new AboutPage(this));
    
    // Handle 404
    this.router.setNotFoundHandler(() => new NotFoundPage(this));
    
    // Start router
    this.router.init();
}
```

### `checkLockStatus()`
Checks and enforces wallet lock status.

```javascript
checkLockStatus() {
    const hasWallets = this.walletManager.getAllWallets().length > 0;
    const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
    
    console.log('[App] Lock status check:', { hasWallets, isUnlocked });
    
    if (hasWallets && !isUnlocked) {
        console.log('[App] Wallets exist but locked - showing lock screen');
        this.showLockScreen();
    }
}

showLockScreen() {
    const lockScreen = new WalletLockScreen(this);
    const lockOverlay = lockScreen.render();
    document.body.appendChild(lockOverlay);
}
```

### `showNotification(message, type)`
Displays a notification to the user.

```javascript
showNotification(message, type = 'info') {
    if (this.notificationSystem) {
        this.notificationSystem.show(message, type);
    } else {
        // Fallback to console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
```

### `navigateTo(path)`
Programmatic navigation helper.

```javascript
navigateTo(path) {
    if (this.router) {
        this.router.navigate(path);
    } else {
        console.error('[App] Router not initialized');
    }
}
```

### `checkExistingWallets()`
Checks for existing wallets and redirects accordingly.

```javascript
async checkExistingWallets() {
    const wallets = this.walletManager.getAllWallets();
    
    if (wallets.length > 0) {
        // Has wallets, check current route
        const currentPath = window.location.pathname;
        const publicRoutes = ['/', '/about', '/import-wallet'];
        
        if (!publicRoutes.includes(currentPath)) {
            // On protected route, ensure unlocked
            const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
            if (!isUnlocked) {
                this.showLockScreen();
            }
        }
    } else {
        // No wallets, redirect to home if on protected route
        const currentPath = window.location.pathname;
        const protectedRoutes = ['/dashboard', '/wallet', '/settings'];
        
        if (protectedRoutes.some(route => currentPath.startsWith(route))) {
            this.navigateTo('/');
        }
    }
}
```

### `createFooter()`
Creates the application footer.

```javascript
createFooter() {
    return ElementFactory.footer({
        className: 'app-footer',
        style: {
            marginTop: 'auto',
            padding: 'calc(20px * var(--scale-factor))',
            textAlign: 'center',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-primary)'
        }
    }, [
        ElementFactory.p({
            className: 'copyright',
            style: {
                margin: 0,
                fontSize: 'calc(12px * var(--scale-factor))',
                color: 'var(--text-dim)'
            }
        }, ['© 2024 MOOSH Wallet. All rights reserved.']),
        
        ElementFactory.p({
            className: 'tagline',
            style: {
                margin: 'calc(4px * var(--scale-factor)) 0 0 0',
                fontSize: 'calc(12px * var(--scale-factor))',
                color: 'var(--text-primary)'
            }
        }, ['Built with love for the Bitcoin community'])
    ]);
}
```

## Event System

### Global Event Listeners
```javascript
setupGlobalListeners() {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause unnecessary operations
            this.pauseBackgroundOperations();
        } else {
            // Resume operations
            this.resumeBackgroundOperations();
        }
    });
    
    // Handle online/offline
    window.addEventListener('online', () => {
        this.showNotification('Connection restored', 'success');
        this.syncAllWallets();
    });
    
    window.addEventListener('offline', () => {
        this.showNotification('No internet connection', 'warning');
    });
    
    // Handle unload
    window.addEventListener('beforeunload', (e) => {
        // Save any pending data
        this.saveApplicationState();
        
        // Warn if there are pending transactions
        if (this.hasPendingTransactions()) {
            e.preventDefault();
            e.returnValue = 'You have pending transactions';
        }
    });
}
```

## Usage Examples

### Application Bootstrap
```javascript
// Entry point - typically in index.js or main script
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new MOOSHWalletApp();
        await app.init();
        
        // Make app globally available for debugging
        window.mooshApp = app;
    } catch (error) {
        console.error('Failed to initialize MOOSH Wallet:', error);
        document.body.innerHTML = `
            <div style="padding: 20px; color: red;">
                Failed to initialize wallet. Please refresh the page.
            </div>
        `;
    }
});
```

### Accessing App Instance
```javascript
// From any component
class SomeComponent extends Component {
    constructor(app) {
        super(app);
        // Access app properties
        this.wallets = this.app.walletManager.getAllWallets();
        this.currentRoute = this.app.router.currentPath;
    }
    
    doSomething() {
        // Use app methods
        this.app.showNotification('Action completed!', 'success');
        this.app.navigateTo('/dashboard');
    }
}
```

## Common Issues

### Issue: App Not Initializing
**Problem**: Blank screen or initialization errors
**Solution**: 
```javascript
// Add comprehensive error handling
async init() {
    try {
        // Add timeout to each step
        await this.withTimeout(this.setupDocument(), 5000, 'Document setup');
        await this.withTimeout(this.loadFonts(), 10000, 'Font loading');
        // ... rest of init
    } catch (error) {
        console.error('[App] Initialization failed:', error);
        this.showInitError(error);
    }
}

async withTimeout(promise, timeout, operation) {
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${operation} timed out`)), timeout)
    );
    return Promise.race([promise, timeoutPromise]);
}
```

### Issue: Memory Leaks
**Problem**: App becomes slow over time
**Solution**:
```javascript
// Implement cleanup on route changes
this.router.on('beforeNavigate', () => {
    // Cleanup current page
    if (this.currentPage && typeof this.currentPage.cleanup === 'function') {
        this.currentPage.cleanup();
    }
    
    // Clear references
    this.clearUnusedReferences();
    
    // Run garbage collection hint
    if (window.gc) window.gc();
});
```

## Testing Approaches

### Unit Testing
```javascript
describe('MOOSHWalletApp', () => {
    let app;
    
    beforeEach(() => {
        // Mock DOM
        document.body.innerHTML = '';
        
        // Create app instance
        app = new MOOSHWalletApp();
    });
    
    test('should initialize with correct properties', () => {
        expect(app.state).toBeInstanceOf(StateManager);
        expect(app.apiService).toBeInstanceOf(APIService);
        expect(app.router).toBeNull(); // Not initialized yet
    });
    
    test('should setup document correctly', () => {
        app.setupDocument();
        expect(document.body.style.margin).toBe('0px');
        expect(document.querySelector('link[href*="JetBrains"]')).toBeTruthy();
    });
    
    test('should create app structure', () => {
        app.createAppStructure();
        expect(document.getElementById('moosh-app')).toBeTruthy();
        expect(document.getElementById('app-content')).toBeTruthy();
    });
});
```

## Best Practices

1. **Always await initialization** before using the app
2. **Implement proper error boundaries** for initialization failures
3. **Clean up resources** when components unmount
4. **Use the notification system** for user feedback
5. **Check lock status** before accessing sensitive data

## Performance Optimization

```javascript
// Lazy load heavy components
async loadHeavyComponent(componentName) {
    if (!this.loadedComponents[componentName]) {
        const module = await import(`./components/${componentName}.js`);
        this.loadedComponents[componentName] = module.default;
    }
    return this.loadedComponents[componentName];
}

// Debounce state saves
this.saveState = debounce(() => {
    const state = this.state.getAll();
    localStorage.setItem('mooshAppState', JSON.stringify(state));
}, 1000);
```

## Security Considerations

- Clear sensitive session data on initialization
- Implement automatic lock after inactivity
- Validate all route access based on wallet lock status
- Never store unencrypted sensitive data
- Implement CSP headers for production

## Related Components

- [StateManager](./StateManager.md) - Application state
- [Router](./Router.md) - Navigation system
- [WalletManager](./WalletManager.md) - Wallet operations
- [APIService](./APIService.md) - API communication
- [NotificationSystem](./NotificationSystem.md) - User notifications