# ResponsiveUtils - AI Context Guide

## Critical Understanding

ResponsiveUtils is the **RESPONSIVE DESIGN FOUNDATION** of MOOSH Wallet. It handles all viewport detection, mobile optimizations, and responsive component creation. This utility ensures the wallet works perfectly from 320px phones to 4K displays.

## Architecture Overview

```
Window Resize → ResponsiveUtils.getBreakpoint() → Component Adaptation
                           ↓
                    Device Detection
                           ↓
                 Responsive Styling/Behavior
```

## When Modifying ResponsiveUtils

### Pre-Flight Checklist
- [ ] Have you tested on actual mobile devices?
- [ ] Have you maintained the breakpoint values?
- [ ] Have you kept methods static (no instantiation)?
- [ ] Have you used CSS variables, not hardcoded values?
- [ ] Have you considered touch interactions?

### Absolute Rules
1. **NEVER change breakpoint values** - Entire app depends on them
2. **ALWAYS use static methods** - No instance creation
3. **ALWAYS return elements** - For method chaining
4. **NEVER hardcode sizes** - Use CSS variables
5. **ALWAYS use passive touch listeners** - Performance critical

## Breakpoint System

### Device Categories
```javascript
// CRITICAL - These breakpoints are used everywhere!
BREAKPOINTS = {
    xs: 320,    // iPhone SE, small Android
    sm: 375,    // iPhone 6/7/8/X
    md: 414,    // iPhone Plus, Pixel
    lg: 768,    // iPad, tablets
    xl: 1024,   // Small laptops
    xxl: 1440,  // Standard desktops
    xxxl: 1920  // Large monitors
}

// Device type mapping
Mobile: xs, sm, md (320-767px)
Tablet: lg (768-1023px)
Desktop: xl, xxl, xxxl (1024px+)
```

## Method Patterns

### Breakpoint Detection
```javascript
// CORRECT - Cascading checks from small to large
static getBreakpoint() {
    const width = window.innerWidth;
    if (width < this.BREAKPOINTS.sm) return 'xs';
    if (width < this.BREAKPOINTS.md) return 'sm';
    // ... continues
}

// WRONG - Don't use device detection
if (navigator.userAgent.match(/iPhone/)) { } // NO!
```

### Responsive Value Selection
```javascript
// CORRECT - Mobile-first with fallbacks
const padding = ResponsiveUtils.getResponsiveValue(
    '12px',     // Mobile
    '16px',     // Tablet (optional)
    '24px'      // Desktop
);

// Tablet fallback behavior
if (this.isTablet()) return tabletValue || desktopValue;
```

### Touch Feedback Pattern
```javascript
// CORRECT - Passive listeners with cleanup
element.addEventListener('touchstart', () => {
    element.classList.add('touch-active');
    clearTimeout(touchTimeout);
}, { passive: true }); // CRITICAL - Must be passive!

// WRONG - Active listeners
element.addEventListener('touchstart', handler); // Blocks scrolling!
```

## Component Creation Patterns

### Responsive Button
```javascript
// CORRECT - Uses all responsive features
static createResponsiveButton(attrs = {}, children = []) {
    const button = $.button({
        ...attrs,
        style: {
            minHeight: 'var(--touch-target)', // 44px minimum
            touchAction: 'manipulation',       // Faster tap response
            WebkitTapHighlightColor: 'transparent', // No flash
            ...attrs.style
        }
    }, children);
    
    if (this.isMobile()) {
        this.addTouchFeedback(button); // Mobile enhancement
    }
    
    return button;
}
```

### Responsive Container
```javascript
// CORRECT - Fluid padding with clamp()
padding: padding ? 'clamp(1rem, 5vw, 2rem)' : '0'
// Scales from 16px to 32px based on viewport

// WRONG - Fixed padding
padding: '20px' // Not responsive!
```

### Responsive Grid
```javascript
// CORRECT - CSS Grid with auto-fit
gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}px), 1fr))`

// This creates a grid that:
// 1. Auto-fits columns based on container
// 2. Minimum item width of 250px (default)
// 3. Never exceeds 100% on small screens
// 4. Grows to fill available space
```

## Common AI Hallucinations to Avoid

### 1. Media Query Patterns
```javascript
// HALLUCINATION - No CSS-in-JS media queries!
'@media (max-width: 768px)': { } // WRONG
window.matchMedia('(max-width: 768px)') // WRONG

// CORRECT - Use utility methods
if (ResponsiveUtils.isMobile()) { }
```

### 2. Instance Creation
```javascript
// HALLUCINATION - Not a class to instantiate!
const responsive = new ResponsiveUtils(); // WRONG

// CORRECT - Static methods only
ResponsiveUtils.isMobile();
```

### 3. Device Detection
```javascript
// HALLUCINATION - No user agent sniffing!
if (/Android|iPhone/i.test(navigator.userAgent)) { } // WRONG

// CORRECT - Viewport-based detection
if (ResponsiveUtils.isMobile()) { }
```

## Text Styling System

### Predefined Styles
```javascript
const styles = {
    title: {
        fontSize: 'var(--font-2xl)',  // ~32-40px
        lineHeight: '1.2',
        fontWeight: '700'
    },
    subtitle: {
        fontSize: 'var(--font-lg)',   // ~20-24px
        lineHeight: '1.4',
        fontWeight: '600'
    },
    body: {
        fontSize: 'var(--font-md)',   // ~14-18px
        lineHeight: '1.5',
        fontWeight: '400'
    }
    // ... more styles
}
```

## Performance Considerations

### Touch Event Optimization
```javascript
// CRITICAL - Always use passive for scroll performance
{ passive: true }

// Touch delay handling
touchTimeout = setTimeout(() => {
    element.classList.remove('touch-active');
}, 150); // 150ms feels responsive but not jumpy
```

### No Caching Strategy
- Breakpoint detection is instant (< 0.1ms)
- Always returns fresh values
- No memory overhead

## Testing Requirements

Before ANY modification:
1. Test on real iPhone (Safari)
2. Test on real Android (Chrome)
3. Test on iPad (tablet breakpoint)
4. Test viewport resize behavior
5. Test touch interactions

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me cache the breakpoint..." - Always needs fresh
2. "We should detect the device type..." - Use viewport only
3. "Let's add more breakpoints..." - Breaks existing layouts
4. "This should be a class instance..." - Keep it static

## Debugging Tips

```javascript
// Add responsive debugging
console.log('Current breakpoint:', ResponsiveUtils.getBreakpoint());
console.log('Is mobile:', ResponsiveUtils.isMobile());
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);

// Monitor breakpoint changes
let lastBreakpoint = ResponsiveUtils.getBreakpoint();
window.addEventListener('resize', () => {
    const current = ResponsiveUtils.getBreakpoint();
    if (current !== lastBreakpoint) {
        console.log('Breakpoint changed:', lastBreakpoint, '→', current);
        lastBreakpoint = current;
    }
});
```

## CSS Variable Dependencies

These CSS variables MUST exist (defined in StyleManager):
- `--touch-target` (44px minimum)
- `--space-xs`, `--space-sm`, `--space-md`
- `--font-xs` through `--font-2xl`
- `--container-lg`

## AI Instructions Summary

When asked to modify ResponsiveUtils:
1. **PRESERVE** breakpoint values exactly
2. **MAINTAIN** static method pattern
3. **USE** CSS variables always
4. **TEST** on real devices
5. **OPTIMIZE** touch interactions

Remember: ResponsiveUtils makes the wallet work everywhere. From tiny phones to huge monitors. Every pixel matters!