# StyleManager - AI Context Guide

## Critical Understanding

StyleManager is the **VISUAL FOUNDATION** of MOOSH Wallet. It injects ALL CSS styles at runtime, manages the theme system, and provides the complete visual design system. Without StyleManager, the app has NO styling.

## Architecture Overview

```
App Init → StyleManager.inject() → Create <style> element → Inject CSS
                                            ↓
                                    All Components Styled
                                            ↓
                                    Theme Variables Active
```

## When Modifying StyleManager

### Pre-Flight Checklist
- [ ] Do you understand CSS variable inheritance?
- [ ] Have you tested both themes (orange/green)?
- [ ] Have you checked all responsive breakpoints?
- [ ] Are you using the correct CSS units?
- [ ] Have you maintained variable naming?

### Absolute Rules
1. **NEVER change CSS variable names** - Every component uses them
2. **ALWAYS test theme switching** - Body class controls theme
3. **INJECT ONCE ONLY** - No dynamic style updates
4. **MAINTAIN BREAKPOINTS** - Apps depends on these values
5. **USE !important FOR THEMES** - Required for override

## CSS Variable System

### Core Color Variables
```css
/* DEFAULT ORANGE THEME */
--text-primary: #f57315;      /* Main brand orange */
--text-secondary: #ffffff;    /* Pure white */
--bg-primary: #000000;        /* Black background */
--border-color: #333333;      /* Dark gray borders */

/* MOOSH GREEN THEME (body.moosh-mode) */
--text-primary: #69fd97 !important;    /* MOOSH green */
--border-color: #232b2b !important;    /* Dark green-gray */
```

### Typography Scale
```css
/* Base unit that scales with viewport */
--font-scale: clamp(0.875rem, 2vw + 0.5rem, 1.125rem);

/* Relative sizes */
--font-xs: calc(var(--font-scale) * 0.75);   /* ~10-13px */
--font-sm: calc(var(--font-scale) * 0.875);  /* ~12-15px */
--font-md: var(--font-scale);                /* ~14-18px */
--font-lg: calc(var(--font-scale) * 1.25);   /* ~17-22px */
--font-xl: calc(var(--font-scale) * 1.5);    /* ~21-27px */
--font-2xl: calc(var(--font-scale) * 2);     /* ~28-36px */
--font-3xl: calc(var(--font-scale) * 2.5);   /* ~35-45px */
```

### Spacing System
```css
/* Fluid spacing unit */
--space-unit: clamp(0.25rem, 1vw, 0.5rem);

/* Spacing scale */
--space-xs: calc(var(--space-unit) * 0.5);   /* 2-4px */
--space-sm: var(--space-unit);               /* 4-8px */
--space-md: calc(var(--space-unit) * 2);     /* 8-16px */
--space-lg: calc(var(--space-unit) * 4);     /* 16-32px */
```

## Theme System

### Theme Switching Pattern
```css
/* Default orange theme - no class needed */
body {
    --text-primary: #f57315;
}

/* MOOSH green theme - requires class */
body.moosh-mode {
    --text-primary: #69fd97 !important;  /* !important REQUIRED */
}
```

### Theme Override Rules
1. **Always use !important** - Ensures override
2. **Override ALL related colors** - Consistency
3. **Test hover states** - Often missed
4. **Check focus styles** - Accessibility

## Responsive Breakpoint System

### Breakpoint Values
```css
/* Mobile First Approach */
Base: < 480px     (--scale-factor: 0.65)
480px+            (--scale-factor: 0.75)
768px+ (tablet)   (--scale-factor: 0.85)
1024px+ (desktop) (--scale-factor: 0.95)
1200px+ (large)   (--scale-factor: 1.0)
1600px+ (xlarge)  (--scale-factor: 1.05)
```

### Media Query Pattern
```css
/* CORRECT - Mobile first */
/* Base styles */
.element { font-size: 14px; }

/* Tablet and up */
@media (min-width: 768px) {
    .element { font-size: 16px; }
}

/* WRONG - Desktop first */
@media (max-width: 768px) { } /* Don't use max-width */
```

## Common AI Hallucinations to Avoid

### 1. Dynamic Style Updates
```javascript
// HALLUCINATION - No dynamic injection!
styleManager.addRule('.new-class', 'color: red'); // WRONG
styleManager.updateTheme('blue'); // WRONG

// CORRECT - All styles injected once
styleManager.inject(); // One time only
```

### 2. Scoped Styles
```css
/* HALLUCINATION - No CSS modules! */
.component_hash123 { } /* WRONG */
:local(.button) { } /* WRONG */

/* CORRECT - Global styles only */
.button { } /* Global class */
```

### 3. CSS-in-JS Patterns
```javascript
// HALLUCINATION - Not using CSS-in-JS!
const styles = styled.div`...`; // WRONG
css`color: red;` // WRONG

// CORRECT - String concatenation
const css = `
    .button {
        color: var(--text-primary);
    }
`;
```

## Style Injection Flow

### Initialization Order
```javascript
inject() {
    // 1. Create style element
    this.styleElement = $.create('style');
    
    // 2. Append to head
    document.head.appendChild(this.styleElement);
    
    // 3. Add styles in order (ORDER MATTERS!)
    this.addCoreStyles();      // Variables & reset
    this.addComponentStyles(); // Component styles
    this.addAnimations();      // Keyframes
    this.addResponsiveStyles(); // Media queries
    this.addLockScreenStyles(); // Special overlay
}
```

## Animation Definitions

### Available Animations
```css
@keyframes blink { }      /* Cursor blinking */
@keyframes shimmer { }    /* Loading effect */
@keyframes mooshFlash { } /* Brand animation */
@keyframes pulse { }      /* Attention getter */
@keyframes fadeIn { }     /* Entrance */
@keyframes shake { }      /* Error feedback */
```

## Performance Considerations

### CSS Size
- Total: ~1500+ lines
- Minified: ~50KB
- Injection time: ~10-20ms
- Runtime cost: Zero (after injection)

### Optimization Notes
- No tree shaking possible
- All styles loaded upfront
- CSS variables prevent duplication
- Single injection = best performance

## Testing Requirements

Before ANY modification:
1. Test orange theme (default)
2. Test green theme (moosh-mode)
3. Check all breakpoints (mobile → desktop)
4. Verify CSS variables work
5. Test in all browsers

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me rename this variable..." - NEVER!
2. "We can inject styles dynamically..." - NO!
3. "Let's use CSS modules..." - Global only!
4. "Forget the !important..." - Themes break!
5. "Let's optimize by removing..." - Measure first!

## Debugging Tips

```javascript
// Check if styles injected
console.log('Style element:', document.querySelector('style'));

// Verify CSS variables
const computed = getComputedStyle(document.documentElement);
console.log('Primary color:', computed.getPropertyValue('--text-primary'));

// Test theme switching
document.body.classList.add('moosh-mode');
console.log('Green active:', document.body.classList.contains('moosh-mode'));

// Check responsive
console.log('Scale factor:', computed.getPropertyValue('--scale-factor'));
```

## Critical CSS Variables

These MUST exist for the app to function:
```css
/* Colors */
--text-primary, --text-secondary, --bg-primary
--border-color, --border-active

/* Typography */
--font-scale, --font-xs through --font-3xl

/* Spacing */
--space-unit, --space-xs through --space-2xl

/* Responsive */
--scale-factor, --container-padding

/* Components */
--touch-target, --border-radius, --transition-speed
```

## AI Instructions Summary

When asked to modify StyleManager:
1. **PRESERVE** all CSS variable names
2. **TEST** both themes thoroughly
3. **MAINTAIN** responsive breakpoints
4. **USE** !important for theme overrides
5. **INJECT** styles only once

Remember: StyleManager is the visual soul of the app. Every pixel, every color, every animation flows from here. Handle with extreme care!