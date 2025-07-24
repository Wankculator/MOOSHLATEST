# MOOSH Wallet Complete Design System

## Design Philosophy

MOOSH Wallet employs a **Terminal-First Design System** that combines professional cryptocurrency wallet functionality with a nostalgic terminal aesthetic. The design system is built on these core principles:

1. **Monospace Everything** - Terminal authenticity
2. **High Contrast** - Optimal readability
3. **Responsive Scaling** - Mobile to 4K support
4. **Dual Theme System** - Orange (default) and Green (MOOSH mode)
5. **Accessibility First** - WCAG compliance where possible

## Color System

### Primary Palette - Orange Theme

```css
/* Core Colors */
--text-primary: #f57315;        /* Primary Orange - Main brand color */
--text-secondary: #ffffff;      /* Pure White - High contrast text */
--bg-primary: #000000;          /* Pure Black - Terminal background */
--bg-secondary: #000000;        /* Consistent black background */
--bg-tertiary: #0a0a0a;         /* Slightly lighter black */
--bg-hover: #1a1a1a;           /* Hover state background */

/* Text Hierarchy */
--text-accent: #f57315;         /* Orange - Links, CTAs */
--text-dim: #888888;            /* Gray - Secondary information */
--text-comment: #888888;        /* Gray - Help text, hints */

/* Borders & Accents */
--border-color: #333333;        /* Dark gray - Default borders */
--border-active: #f57315;       /* Orange - Active/focus borders */
--accent-bg: rgba(245, 115, 21, 0.1);       /* 10% Orange - Subtle backgrounds */
--accent-bg-hover: rgba(245, 115, 21, 0.2); /* 20% Orange - Hover states */
```

### MOOSH Mode Palette - Green Theme

```css
/* Core Colors */
--text-primary: #69fd97;        /* MOOSH Green - Primary brand */
--text-accent: #69fd97;         /* MOOSH Green - Accents */
--text-dim: #71767b;            /* Muted gray - Secondary text */
--text-comment: #71767b;        /* Muted gray - Comments */

/* Borders & Accents */
--border-color: #232b2b;        /* Dark green-gray - Borders */
--border-active: #69fd97;       /* MOOSH Green - Active state */
--accent-bg: rgba(105, 253, 151, 0.1);      /* 10% Green - Subtle backgrounds */
--accent-bg-hover: rgba(105, 253, 151, 0.2); /* 20% Green - Hover states */
```

### Semantic Colors

```css
/* Status Colors */
--color-error: #ff4444;         /* Red - Errors, failures */
--color-success: #009f6b;       /* Green - Success, confirmations */
--color-warning: #ffd93d;       /* Yellow - Warnings (not actively used) */

/* Utility Colors */
--overlay-bg: rgba(0, 0, 0, 0.95); /* Near-opaque black - Modal overlays */
```

## Typography System

### Font Stack

```css
font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 
             'Fira Code', 'Roboto Mono', 'Consolas', monospace;
```

### Dynamic Font Sizing

The system uses a sophisticated responsive scaling approach:

```css
/* Base font size by viewport */
--font-base: 13px;  /* < 480px */
--font-base: 14px;  /* 480px - 767px */
--font-base: 15px;  /* 768px - 1023px */
--font-base: 16px;  /* 1024px - 1599px */
--font-base: 17px;  /* 1600px+ */

/* Fluid scaling with clamp() */
--font-scale: clamp(0.875rem, 2vw + 0.5rem, 1.125rem);

/* Size scale multipliers */
--font-xs: calc(var(--font-scale) * 0.75);    /* ~10-13px */
--font-sm: calc(var(--font-scale) * 0.875);   /* ~12-15px */
--font-md: var(--font-scale);                 /* ~14-18px */
--font-lg: calc(var(--font-scale) * 1.25);    /* ~17-22px */
--font-xl: calc(var(--font-scale) * 1.5);     /* ~21-27px */
--font-2xl: calc(var(--font-scale) * 2);      /* ~28-36px */
--font-3xl: calc(var(--font-scale) * 2.5);    /* ~35-45px */
```

### Font Weights

- **400** - Normal (body text)
- **500** - Medium (subtle emphasis)
- **600** - Semi-bold (headings)
- **bold** - Bold (strong emphasis)

### Line Heights

- **1.2** - Tight (headings)
- **1.4** - Mobile default
- **1.5** - Desktop default
- **1.6** - Relaxed (body text)

## Spacing System

### Base Unit System

```css
--spacing-unit: 6px;
--space-unit: clamp(0.25rem, 1vw, 0.5rem); /* 4-8px fluid */
```

### Spacing Scale

```css
--space-xs: calc(var(--space-unit) * 0.5);  /* 2-4px */
--space-sm: var(--space-unit);              /* 4-8px */
--space-md: calc(var(--space-unit) * 2);    /* 8-16px */
--space-lg: calc(var(--space-unit) * 4);    /* 16-32px */
--space-xl: calc(var(--space-unit) * 6);    /* 24-48px */
--space-2xl: calc(var(--space-unit) * 8);   /* 32-64px */
```

### Container Padding

Responsive padding that scales with viewport:

```css
--container-padding: 12px;  /* < 480px */
--container-padding: 16px;  /* 480px - 767px */
--container-padding: 20px;  /* 768px - 1023px */
--container-padding: 32px;  /* 1024px - 1199px */
--container-padding: 40px;  /* 1200px+ */
```

## Layout System

### Container Widths

```css
--container-xs: min(100%, 320px);
--container-sm: min(100%, 640px);
--container-md: min(100%, 768px);
--container-lg: min(100%, 1024px);
--container-xl: min(100%, 1280px);
--terminal-max-width: min(100%, 1200px);
```

### Responsive Breakpoints

- **Mobile**: < 480px
- **Small Tablet**: 480px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: 1200px - 1599px
- **Extra Large**: 1600px+

### Scale Factor System

Dynamic scaling for all UI elements:

```css
--scale-factor: 0.65;  /* Mobile */
--scale-factor: 0.75;  /* 480px+ */
--scale-factor: 0.85;  /* 768px+ */
--scale-factor: 0.95;  /* 1024px+ */
--scale-factor: 1.0;   /* 1200px+ */
--scale-factor: 1.05;  /* 1600px+ */
```

## Component Specifications

### Buttons

#### Primary Button
```css
height: 40px (mobile) / 42px (desktop)
padding: 12px 24px
border-radius: 9999px /* Pill shape */
font-weight: 600
transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

#### Secondary Button
```css
padding: 8px 16px
border: 2px solid var(--border-color)
background: transparent
```

### Input Fields

```css
height: 36px (mobile) / 38px (desktop)
padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2)
border: 2px solid var(--border-color)
border-radius: 0 /* Square corners for terminal aesthetic */
```

### Cards & Containers

```css
padding: 24px
border: 2px solid var(--border-color)
border-radius: 0 /* Terminal boxes are square */
background: var(--bg-secondary)
```

## Animation System

### Transition Speeds

```css
--transition-speed: 0.2s;
/* Default: 0.2s ease */
/* Buttons: 0.3s cubic-bezier(0.4, 0, 0.2, 1) */
```

### Animation Library

#### Cursor Blink
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
/* Duration: 1s, Iteration: infinite */
```

#### MOOSH Flash
```css
@keyframes mooshFlash {
  0%, 100% { 
    color: var(--text-primary);
    text-shadow: none;
  }
  50% { 
    color: var(--text-accent);
    text-shadow: 0 0 10px rgba(245, 115, 21, 0.5);
  }
}
```

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Shake (Error)
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}
```

## Shadow System

### Box Shadows

```css
/* Modals & Dropdowns */
box-shadow: 0 calc(6px * var(--scale-factor)) 
            calc(16px * var(--scale-factor)) 
            rgba(0, 0, 0, 0.4);

/* Card Hover */
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

/* Lock Screen */
box-shadow: 0 0 calc(20px * var(--scale-factor)) 
            rgba(0, 0, 0, 0.5);
```

## Z-Index Scale

```css
--z-cursor: 5;
--z-loading: 10;
--z-header: 1000;
--z-modal: 10000;
```

## Accessibility Features

### Touch Targets
- Minimum size: 44px × 44px
- Responsive scaling for mobile

### Color Contrast
- Primary text on black: 7.74:1 (WCAG AAA)
- White text on black: 21:1 (WCAG AAA)

### Focus States
- Clear border highlights
- Color changes for interactive elements
- Keyboard navigation support

## Terminal-Specific Elements

### ASCII Art Components
- Logo rendered in ASCII
- Box-drawing characters for borders
- Monospace alignment critical

### Terminal Box Style
```css
border: 2px solid var(--border-color);
border-radius: 0;
padding: var(--terminal-padding-mobile);
background: var(--bg-primary);
font-family: monospace;
```

### Cursor Animation
```css
content: '▊';
animation: blink 1s infinite;
color: var(--text-primary);
```

## Implementation Notes

### CSS Variable Usage
All design tokens are implemented as CSS custom properties, allowing for:
- Runtime theme switching
- Easy maintenance
- Consistent updates
- No build process required

### Responsive Strategy
1. **Fluid Typography**: clamp() functions for smooth scaling
2. **Dynamic Spacing**: Viewport-based calculations
3. **Breakpoint System**: Progressive enhancement
4. **Touch Optimization**: Larger targets on mobile

### Performance Considerations
- Single CSS injection on load
- No runtime style calculations
- Efficient variable inheritance
- Minimal repaints/reflows

## Usage Guidelines

### When to Use Each Color
- **Primary (Orange/Green)**: Main actions, links, emphasis
- **Secondary (White)**: Body text, important information
- **Dim (Gray)**: Supporting text, disabled states
- **Error (Red)**: Errors only, sparingly used
- **Success (Green)**: Confirmations, positive feedback

### Spacing Application
- **xs**: Inline elements, tight groups
- **sm**: Related elements
- **md**: Standard component spacing
- **lg**: Section separators
- **xl/2xl**: Major layout divisions

### Typography Hierarchy
1. **3xl**: Main headings (rare)
2. **2xl**: Page titles
3. **xl**: Section headers
4. **lg**: Subsection headers
5. **md**: Body text
6. **sm**: Supporting text
7. **xs**: Fine print, labels

This design system ensures consistency across the entire MOOSH Wallet application while maintaining the unique terminal aesthetic that defines the brand.