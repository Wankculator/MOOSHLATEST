# Theme Toggle Button

## Overview
The Theme Toggle Button switches between dark and light themes in the wallet interface. It provides immediate visual feedback and persists user preference.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 5048-5057, 5072-5081 (renderThemeToggle methods)

### Visual Specifications
- **Dark Mode Icon**: 🌙 (moon)
- **Light Mode Icon**: ☀️ (sun)
- **Class**: `theme-toggle`
- **Background**: Transparent
- **Size**: 32px × 32px
- **Border Radius**: 50%
- **Transition**: transform 0.3s ease

### Implementation

```javascript
renderThemeToggle() {
    const isDark = this.app.state.get('theme') === 'dark';
    
    return $.button({
        className: 'theme-toggle',
        onclick: (e) => {
            e.preventDefault();
            this.toggleTheme();
        },
        title: isDark ? 'Switch to light mode' : 'Switch to dark mode'
    }, [isDark ? '☀️' : '🌙']);
}
```

### Alternative Icon Implementation
```javascript
renderThemeToggleAlt() {
    const isDark = this.app.state.get('theme') === 'dark';
    
    return $.button({
        className: 'theme-toggle',
        onclick: (e) => {
            e.preventDefault();
            this.toggleTheme();
        }
    }, [
        $.svg({
            width: '20',
            height: '20',
            viewBox: '0 0 24 24',
            fill: 'currentColor'
        }, [
            isDark ? 
            // Sun icon
            $.path({ d: 'M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z' }) :
            // Moon icon
            $.path({ d: 'M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7Z' })
        ])
    ]);
}
```

### Toggle Handler

```javascript
toggleTheme() {
    const currentTheme = this.app.state.get('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Start transition
    document.body.classList.add('theme-transitioning');
    
    // Update theme
    this.app.setTheme(newTheme);
    
    // Apply theme class
    document.body.className = `theme-${newTheme}`;
    
    // Save preference
    localStorage.setItem('wallet_theme', newTheme);
    
    // Update state
    this.app.state.set('theme', newTheme);
    
    // End transition
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 300);
    
    // Announce change for accessibility
    this.announceToScreenReader(`Switched to ${newTheme} mode`);
}
```

### CSS Styles
```css
.theme-toggle {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: transform 0.3s ease, background 0.2s ease;
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
}

.theme-toggle:active {
    transform: scale(0.95);
}

/* Theme transition */
.theme-transitioning * {
    transition: background-color 0.3s ease, 
                color 0.3s ease, 
                border-color 0.3s ease !important;
}
```

### Theme Variables
```css
/* Dark theme (default) */
.theme-dark {
    --bg-primary: #000000;
    --bg-secondary: #111111;
    --text-primary: #ffffff;
    --text-secondary: #999999;
    --border-color: #333333;
    --accent-color: #f57315;
}

/* Light theme */
.theme-light {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #000000;
    --text-secondary: #666666;
    --border-color: #dddddd;
    --accent-color: #f57315;
}
```

### Features
1. **Instant Switching**: No page reload required
2. **Smooth Transitions**: All colors transition smoothly
3. **Persistent Preference**: Saved in localStorage
4. **System Integration**: Can detect system preference
5. **Accessibility**: High contrast maintained in both themes

### System Preference Detection
```javascript
initTheme() {
    // Check saved preference
    const savedTheme = localStorage.getItem('wallet_theme');
    
    if (savedTheme) {
        this.app.setTheme(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.app.setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('wallet_theme')) {
            this.app.setTheme(e.matches ? 'dark' : 'light');
        }
    });
}
```

### Mobile Behavior
- Larger touch target on mobile
- Respects system theme by default
- No hover effects on touch devices
- Smooth transitions maintained

### Accessibility
- Clear aria-label
- Keyboard accessible
- Screen reader announcements
- High contrast maintained
- Focus visible indicator

### Theme-Specific Adjustments
```javascript
// Components that need theme-specific handling
- Charts and graphs
- QR codes (inverted for light theme)
- Images and icons
- Shadows and gradients
- Status indicators
```

### Related Components
- Settings Panel
- System Preference Detector
- Color Scheme Manager
- Icon Sets
- Chart Themes