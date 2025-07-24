# Router - AI Context Guide

## Critical Understanding

Router is the **NAVIGATION CONTROLLER** of MOOSH Wallet. It manages all page transitions, enforces security through lock screens, and maintains navigation history. Breaking Router breaks the entire user flow.

## Architecture Overview

```
URL Hash Change → Router.navigate() → Security Check → Page Render
                                            ↓
                                    Lock Screen (if locked)
                                            ↓
                                    Page Component Mount
```

## When Modifying Router

### Pre-Flight Checklist
- [ ] Have you understood the hash-based routing system?
- [ ] Have you checked all existing routes?
- [ ] Have you considered the lock screen flow?
- [ ] Have you handled page cleanup properly?
- [ ] Have you preserved query parameter handling?

### Absolute Rules
1. **NEVER bypass security checks** - Lock screen is mandatory
2. **ALWAYS destroy previous pages** - Memory leaks otherwise
3. **ALWAYS use factory functions** - Routes return new instances
4. **NEVER break hash format** - #page-name?params
5. **ALWAYS update state properly** - currentPage vs currentPageFull

## Route Management

### Route Definition Pattern
```javascript
// CORRECT - Factory function returning new instance
this.routes.set('home', () => new HomePage(this.app));
this.routes.set('dashboard', () => new DashboardPage(this.app));

// WRONG - Direct class reference
this.routes.set('home', HomePage); // NO INSTANCE!

// WRONG - Singleton instance
const homePage = new HomePage(this.app);
this.routes.set('home', () => homePage); // REUSED INSTANCE!
```

### Navigation State Management
```javascript
// CORRECT - Separate page name from full URL
const pageNameOnly = pageId.split('?')[0];  // 'wallet-details'
const pageIdFull = pageId;                  // 'wallet-details?type=bitcoin'

this.app.state.update({
    currentPage: pageNameOnly,     // For route lookup
    currentPageFull: pageIdFull,   // For query params
    navigationHistory: [...history, pageId]
});

// WRONG - Losing query parameters
this.app.state.set('currentPage', pageId); // Breaks param handling!
```

## Security Flow

### Lock Screen Integration
```javascript
// CRITICAL - This security check MUST happen first!
const hasPassword = localStorage.getItem('walletPassword') !== null;
const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';

if (hasPassword && !isUnlocked) {
    // Show lock screen overlay
    const lockScreen = new WalletLockScreen(this.app);
    document.body.appendChild(lockScreen.render());
    return; // STOP - Don't render requested page
}
```

### Security Rules
1. **Password exists** → Check unlock status
2. **Not unlocked** → Show lock screen
3. **Lock screen** → Blocks ALL navigation
4. **Unlock** → Stored in sessionStorage (temporary)

## Page Lifecycle

### Proper Page Transition
```javascript
// 1. Clean up previous page
if (this.currentPageInstance && this.currentPageInstance.destroy) {
    this.currentPageInstance.destroy(); // CRITICAL - Prevents memory leaks
}

// 2. Clear DOM
content.innerHTML = '';

// 3. Create new page instance
const page = PageClass(); // Factory function call
this.currentPageInstance = page; // Store for future cleanup

// 4. Mount to DOM
page.mount(content);
```

### Page Component Requirements
Every page must:
1. Extend Component base class
2. Implement mount(container) method
3. Implement destroy() for cleanup
4. Handle its own state subscriptions

## Common AI Hallucinations to Avoid

### 1. React Router Patterns
```javascript
// HALLUCINATION - This is NOT React Router!
<Route path="/home" component={HomePage} /> // WRONG
router.push('/home'); // WRONG
useNavigate(); // WRONG

// CORRECT - Hash-based navigation
router.navigate('home');
window.location.hash = 'home';
```

### 2. Modern Router Features
```javascript
// HALLUCINATION - No route guards!
beforeEnter: (to, from, next) => {} // WRONG
canActivate: [] // WRONG

// CORRECT - Security in render()
if (hasPassword && !isUnlocked) { /* show lock */ }
```

### 3. Async Route Loading
```javascript
// HALLUCINATION - No lazy loading!
const HomePage = lazy(() => import('./HomePage')); // WRONG

// CORRECT - Direct instantiation
() => new HomePage(this.app)
```

## Navigation Patterns

### Programmatic Navigation
```javascript
// Navigate to simple page
router.navigate('dashboard');

// Navigate with query params
router.navigate('wallet-details?type=bitcoin');

// Force refresh current page
router.navigate('dashboard', { forceRefresh: true });

// Go back
router.goBack();
```

### Hash Change Handling
```javascript
// Browser back/forward buttons trigger this
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash) {
        this.navigate(hash);
    }
});
```

## Query Parameter Handling

### Parsing in Pages
```javascript
// In page component
const fullPage = this.app.state.get('currentPageFull');
const [page, queryString] = fullPage.split('?');
const params = new URLSearchParams(queryString);
const type = params.get('type'); // 'bitcoin'
```

## Performance Considerations

### Current Performance
- **Route lookup**: ~0.1ms (Map lookup)
- **Page destruction**: ~5ms
- **Page creation**: ~10-50ms
- **DOM mounting**: ~5-10ms

### Memory Management
```javascript
// CRITICAL - Always clean up!
destroy() {
    // Remove event listeners
    this.listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    
    // Clear intervals/timeouts
    clearInterval(this.updateInterval);
    
    // Remove DOM references
    this.element = null;
}
```

## Testing Requirements

Before ANY modification:
1. Test all navigation paths
2. Test with wallet locked/unlocked
3. Test browser back/forward
4. Test direct hash navigation
5. Test page cleanup (memory profiler)

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me add route parameters..." - Use query params
2. "We need nested routes..." - Keep it flat
3. "Let's cache page instances..." - Memory leaks
4. "Skip the lock screen for this..." - NEVER!

## Recovery Procedures

If you break Router:
1. **Check console** - Route not found errors
2. **Verify hash format** - Must start with #
3. **Check lock screen** - May be blocking
4. **Verify cleanup** - Memory leaks
5. **Reset state** - Clear localStorage/sessionStorage

## Debugging Tips

```javascript
// Add route debugging
const originalNavigate = router.navigate.bind(router);
router.navigate = function(pageId, options) {
    console.log(`[Router Debug] Navigating to: ${pageId}`, options);
    console.log(`[Router Debug] Current state:`, {
        locked: localStorage.getItem('walletPassword') !== null,
        unlocked: sessionStorage.getItem('walletUnlocked') === 'true'
    });
    return originalNavigate(pageId, options);
};
```

## AI Instructions Summary

When asked to modify Router:
1. **PRESERVE** security flow always
2. **MAINTAIN** page lifecycle pattern
3. **HANDLE** query parameters properly
4. **CLEAN UP** previous pages
5. **TEST** lock screen integration

Remember: Router is the traffic controller. Every user journey flows through it. Security and cleanup are paramount!