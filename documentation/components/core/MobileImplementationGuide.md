# Mobile Implementation Guide

**Component**: Mobile-Specific Patterns
**Type**: Development Guide  
**Critical**: YES
**Last Updated**: 2025-01-21

## Overview

This guide documents all mobile-specific implementations in MOOSH Wallet, including responsive design, touch handling, and mobile optimizations.

## ResponsiveUtils Class

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 1050-1250
- **Class**: ResponsiveUtils

### Core Implementation

```javascript
class ResponsiveUtils {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        };
        
        this.currentBreakpoint = this.getBreakpoint();
        this.listeners = new Map();
        
        // Listen for resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });
    }
    
    getBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        return 'desktop';
    }
    
    isMobile() {
        return this.currentBreakpoint === 'mobile';
    }
    
    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }
    
    isDesktop() {
        return this.currentBreakpoint === 'desktop';
    }
    
    isTouchDevice() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 ||
               navigator.msMaxTouchPoints > 0;
    }
}
```

## Touch Event Handling

### Touch-Friendly Buttons

```javascript
class TouchButton {
    constructor(element) {
        this.element = element;
        this.touchStartTime = 0;
        this.touchTimeout = null;
        
        // Prevent double-tap zoom
        this.element.style.touchAction = 'manipulation';
        
        // Add touch feedback
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
    }
    
    handleTouchStart(e) {
        this.touchStartTime = Date.now();
        this.element.classList.add('touch-active');
        
        // Prevent ghost clicks
        e.preventDefault();
        
        // Long press detection
        this.touchTimeout = setTimeout(() => {
            this.handleLongPress();
        }, 500);
    }
    
    handleTouchEnd(e) {
        const touchDuration = Date.now() - this.touchStartTime;
        
        clearTimeout(this.touchTimeout);
        this.element.classList.remove('touch-active');
        
        // Only trigger if it was a tap (not a long press)
        if (touchDuration < 500) {
            this.element.click();
        }
    }
    
    handleTouchCancel() {
        clearTimeout(this.touchTimeout);
        this.element.classList.remove('touch-active');
    }
    
    handleLongPress() {
        // Trigger context menu or special action
        this.element.dispatchEvent(new CustomEvent('longpress'));
    }
}
```

### Swipe Gestures

```javascript
class SwipeHandler {
    constructor(element, options = {}) {
        this.element = element;
        this.threshold = options.threshold || 50;
        this.restraint = options.restraint || 100;
        this.allowedTime = options.allowedTime || 300;
        
        this.touchStart = { x: 0, y: 0, time: 0 };
        
        this.element.addEventListener('touchstart', this.handleStart.bind(this));
        this.element.addEventListener('touchmove', this.handleMove.bind(this));
        this.element.addEventListener('touchend', this.handleEnd.bind(this));
    }
    
    handleStart(e) {
        const touch = e.touches[0];
        this.touchStart = {
            x: touch.pageX,
            y: touch.pageY,
            time: Date.now()
        };
    }
    
    handleMove(e) {
        // Prevent scrolling if swiping horizontally
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.touchStart.x;
        const deltaY = touch.pageY - this.touchStart.y;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
        }
    }
    
    handleEnd(e) {
        const touch = e.changedTouches[0];
        const deltaX = touch.pageX - this.touchStart.x;
        const deltaY = touch.pageY - this.touchStart.y;
        const deltaTime = Date.now() - this.touchStart.time;
        
        if (deltaTime > this.allowedTime) return;
        
        if (Math.abs(deltaX) >= this.threshold && Math.abs(deltaY) <= this.restraint) {
            const direction = deltaX < 0 ? 'left' : 'right';
            this.element.dispatchEvent(new CustomEvent('swipe', {
                detail: { direction, deltaX }
            }));
        }
    }
}
```

## Mobile-Specific Styling

### Touch Target Sizing

```javascript
// Ensure minimum touch target size (44x44px)
function ensureTouchTargets() {
    const buttons = document.querySelectorAll('button, a, .clickable');
    
    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        
        if (rect.width < 44 || rect.height < 44) {
            button.style.minWidth = '44px';
            button.style.minHeight = '44px';
            button.style.padding = '10px';
        }
    });
}
```

### Mobile Layout Adjustments

```javascript
class MobileLayout {
    static applyMobileStyles() {
        if (!app.responsive.isMobile()) return;
        
        // Adjust font sizes
        document.documentElement.style.setProperty('--base-font-size', '16px');
        document.documentElement.style.setProperty('--heading-font-size', '24px');
        
        // Increase spacing
        document.documentElement.style.setProperty('--spacing-unit', '20px');
        
        // Simplify layouts
        const complexGrids = document.querySelectorAll('.grid-complex');
        complexGrids.forEach(grid => {
            grid.classList.remove('grid-complex');
            grid.classList.add('grid-simple');
        });
    }
    
    static optimizeForMobile() {
        // Disable hover effects
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) {
                *:hover {
                    color: inherit !important;
                    background-color: inherit !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Optimize animations
        if (this.shouldReduceMotion()) {
            document.documentElement.style.setProperty('--animation-duration', '0.001ms');
        }
    }
    
    static shouldReduceMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
}
```

## Keyboard Handling

### Virtual Keyboard Management

```javascript
class VirtualKeyboardHandler {
    constructor() {
        this.viewportHeight = window.innerHeight;
        this.keyboardHeight = 0;
        
        // Detect virtual keyboard
        window.visualViewport?.addEventListener('resize', () => {
            this.handleViewportChange();
        });
    }
    
    handleViewportChange() {
        const currentHeight = window.visualViewport.height;
        this.keyboardHeight = this.viewportHeight - currentHeight;
        
        if (this.keyboardHeight > 100) {
            this.onKeyboardShow();
        } else {
            this.onKeyboardHide();
        }
    }
    
    onKeyboardShow() {
        document.body.classList.add('keyboard-visible');
        
        // Scroll input into view
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
        
        // Adjust layout
        const footer = document.querySelector('.app-footer');
        if (footer) {
            footer.style.display = 'none';
        }
    }
    
    onKeyboardHide() {
        document.body.classList.remove('keyboard-visible');
        
        // Restore layout
        const footer = document.querySelector('.app-footer');
        if (footer) {
            footer.style.display = '';
        }
    }
}
```

### Input Handling

```javascript
class MobileInputHandler {
    static setupInput(input) {
        // Set appropriate input types
        if (input.type === 'number') {
            input.inputMode = 'decimal';
            input.pattern = '[0-9]*';
        }
        
        // Prevent zoom on focus (iOS)
        input.addEventListener('focus', (e) => {
            if (app.responsive.isMobile()) {
                e.target.style.fontSize = '16px';
            }
        });
        
        // Auto-capitalize appropriately
        if (input.dataset.capitalize) {
            input.autocapitalize = input.dataset.capitalize;
        }
        
        // Disable autocorrect for sensitive fields
        if (input.type === 'password' || input.dataset.sensitive) {
            input.autocorrect = 'off';
            input.autocomplete = 'off';
            input.spellcheck = false;
        }
    }
}
```

## Performance Optimizations

### Mobile-Specific Performance

```javascript
class MobilePerformance {
    static optimize() {
        if (!app.responsive.isMobile()) return;
        
        // Reduce particle effects
        this.reduceVisualEffects();
        
        // Optimize scrolling
        this.enableSmoothScrolling();
        
        // Lazy load images
        this.setupLazyLoading();
        
        // Reduce animation complexity
        this.simplifyAnimations();
    }
    
    static reduceVisualEffects() {
        // Disable complex backgrounds
        document.body.classList.add('reduce-effects');
        
        // Remove shadows on mobile
        const style = document.createElement('style');
        style.textContent = `
            .reduce-effects * {
                box-shadow: none !important;
                text-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    static enableSmoothScrolling() {
        // Use native smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Optimize scroll performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            document.body.classList.add('is-scrolling');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 100);
        }, { passive: true });
    }
    
    static setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    static simplifyAnimations() {
        // Reduce animation duration
        document.documentElement.style.setProperty('--animation-duration', '200ms');
        
        // Use transform instead of position
        const animatedElements = document.querySelectorAll('.animated');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });
    }
}
```

## Viewport Management

### Safe Area Handling (iPhone X+)

```javascript
class SafeAreaManager {
    static setup() {
        // Add viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        
        // Apply safe area padding
        this.applySafeAreaPadding();
    }
    
    static applySafeAreaPadding() {
        const style = document.createElement('style');
        style.textContent = `
            .app-container {
                padding-top: env(safe-area-inset-top);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
                padding-bottom: env(safe-area-inset-bottom);
            }
            
            .modal {
                margin-top: env(safe-area-inset-top);
                max-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
            }
        `;
        document.head.appendChild(style);
    }
}
```

## Mobile Navigation Patterns

### Bottom Navigation

```javascript
class MobileNavigation {
    static createBottomNav() {
        if (!app.responsive.isMobile()) return;
        
        const nav = $.nav({ className: 'mobile-bottom-nav' });
        
        const navItems = [
            { icon: '🏠', label: 'Home', route: 'home' },
            { icon: '💰', label: 'Wallet', route: 'dashboard' },
            { icon: '📊', label: 'History', route: 'history' },
            { icon: '⚙️', label: 'Settings', route: 'settings' }
        ];
        
        navItems.forEach(item => {
            const button = $.button({
                className: 'nav-item',
                innerHTML: `
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                `,
                onclick: () => app.router.navigate(item.route)
            });
            
            nav.appendChild(button);
        });
        
        document.body.appendChild(nav);
    }
}
```

## Mobile-Specific Features

### Pull to Refresh

```javascript
class PullToRefresh {
    constructor(element, onRefresh) {
        this.element = element;
        this.onRefresh = onRefresh;
        this.threshold = 80;
        
        this.startY = 0;
        this.currentY = 0;
        this.isPulling = false;
        
        this.setupListeners();
    }
    
    setupListeners() {
        this.element.addEventListener('touchstart', this.handleStart.bind(this));
        this.element.addEventListener('touchmove', this.handleMove.bind(this));
        this.element.addEventListener('touchend', this.handleEnd.bind(this));
    }
    
    handleStart(e) {
        if (this.element.scrollTop === 0) {
            this.startY = e.touches[0].pageY;
            this.isPulling = true;
        }
    }
    
    handleMove(e) {
        if (!this.isPulling) return;
        
        this.currentY = e.touches[0].pageY;
        const pullDistance = this.currentY - this.startY;
        
        if (pullDistance > 0) {
            e.preventDefault();
            
            const opacity = Math.min(pullDistance / this.threshold, 1);
            this.showPullIndicator(pullDistance, opacity);
        }
    }
    
    async handleEnd() {
        if (!this.isPulling) return;
        
        const pullDistance = this.currentY - this.startY;
        
        if (pullDistance > this.threshold) {
            await this.onRefresh();
        }
        
        this.hidePullIndicator();
        this.isPulling = false;
    }
    
    showPullIndicator(distance, opacity) {
        // Show refresh indicator
        let indicator = document.querySelector('.pull-indicator');
        if (!indicator) {
            indicator = $.div({ className: 'pull-indicator' });
            this.element.parentNode.insertBefore(indicator, this.element);
        }
        
        indicator.style.height = `${distance}px`;
        indicator.style.opacity = opacity;
        indicator.textContent = distance > this.threshold ? '↑ Release to refresh' : '↓ Pull to refresh';
    }
    
    hidePullIndicator() {
        const indicator = document.querySelector('.pull-indicator');
        if (indicator) {
            indicator.style.height = '0';
            indicator.style.opacity = '0';
        }
    }
}
```

## Testing Mobile Features

```javascript
// Test responsive breakpoints
describe('ResponsiveUtils', () => {
    it('should detect mobile correctly', () => {
        window.innerWidth = 400;
        const utils = new ResponsiveUtils();
        expect(utils.isMobile()).toBe(true);
    });
    
    it('should handle orientation changes', () => {
        const utils = new ResponsiveUtils();
        let callbackCalled = false;
        
        utils.onOrientationChange(() => {
            callbackCalled = true;
        });
        
        window.dispatchEvent(new Event('orientationchange'));
        expect(callbackCalled).toBe(true);
    });
});

// Test touch handling
describe('Touch Events', () => {
    it('should prevent ghost clicks', () => {
        const button = document.createElement('button');
        const touchButton = new TouchButton(button);
        
        const touchEvent = new TouchEvent('touchstart');
        button.dispatchEvent(touchEvent);
        
        expect(touchEvent.defaultPrevented).toBe(true);
    });
});
```

## Common Mobile Issues

### Issue 1: 300ms Click Delay
```css
/* Solution: Use touch-action */
* {
    touch-action: manipulation;
}
```

### Issue 2: Viewport Zooming
```html
<!-- Solution: Proper viewport meta -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Issue 3: Fixed Positioning Issues
```javascript
// Solution: Use transform instead
element.style.transform = 'translateY(0)';
element.style.position = 'fixed';
element.style.willChange = 'transform';
```

## Best Practices

1. **Always Test on Real Devices**
   - Chrome DevTools mobile emulation isn't enough
   - Test on iOS Safari and Android Chrome
   - Check different screen sizes

2. **Optimize Touch Targets**
   - Minimum 44x44px touch targets
   - Add padding around small buttons
   - Space interactive elements appropriately

3. **Handle Network Variability**
   - Implement offline support
   - Show loading states
   - Cache critical resources

4. **Respect User Preferences**
   - Check for reduced motion
   - Respect system dark mode
   - Honor font size preferences

## Related Documentation
- Performance Optimization: `/documentation/components/core/PerformanceOptimizationGuide.md`
- Network Patterns: `/documentation/components/core/NetworkCommunicationPatterns.md`
- UI Sections: `/documentation/components/ui-sections/`