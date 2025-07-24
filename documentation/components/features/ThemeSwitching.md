# Theme Switching

**Status**: 🟢 Active
**Type**: Enhancement
**Security Critical**: No
**Implementation**: /public/js/moosh-wallet.js:599-690, 2010-2011

## Overview
Theme switching allows users to toggle between different visual themes, including the signature "MOOSH mode" with its distinctive green-on-black aesthetic. The system provides instant theme changes without requiring a page reload.

## User Flow
```
[Access Theme Toggle] → [Select Theme] → [UI Updates Instantly] → [Theme Persisted] → [Applied on Next Visit]
```

## Technical Implementation

### Frontend
- **Entry Point**: Theme state in `SparkStateManager`
- **UI Components**: 
  - Theme toggle button
  - Theme preview
  - Color scheme indicators
  - Smooth transitions
- **State Changes**: 
  - `isSparkTheme` state flag
  - CSS class on body element
  - localStorage persistence

### Backend
- **API Endpoints**: None (client-side only)
- **Services Used**: Browser localStorage
- **Data Flow**: 
  1. User toggles theme
  2. State updates
  3. CSS classes applied
  4. Theme saved to storage
  5. UI transitions smoothly

## Code Example
```javascript
// Theme switching implementation
class ThemeManager {
    constructor(app) {
        this.app = app;
        this.themes = {
            default: {
                name: 'Default Theme',
                className: '',
                colors: {
                    primary: '#f57315',
                    secondary: '#ffffff',
                    background: '#1a1a1a',
                    accent: '#ff6b6b'
                }
            },
            moosh: {
                name: 'MOOSH Mode',
                className: 'moosh-mode',
                colors: {
                    primary: '#69fd97',
                    secondary: '#ffffff',
                    background: '#000000',
                    accent: '#69fd97'
                }
            }
        };
        
        this.currentTheme = 'default';
        this.initializeTheme();
    }
    
    initializeTheme() {
        // Load saved theme
        const savedTheme = localStorage.getItem('walletTheme') || 'default';
        this.applyTheme(savedTheme, false); // No transition on load
        
        // Listen for theme changes
        this.app.state.on('isSparkTheme', (isSparkTheme) => {
            this.applyTheme(isSparkTheme ? 'moosh' : 'default');
        });
    }
    
    applyTheme(themeName, animate = true) {
        if (!this.themes[themeName]) {
            console.error(`Unknown theme: ${themeName}`);
            return;
        }
        
        const theme = this.themes[themeName];
        const body = document.body;
        
        // Add transition class if animating
        if (animate) {
            body.classList.add('theme-transitioning');
        }
        
        // Remove all theme classes
        Object.values(this.themes).forEach(t => {
            if (t.className) {
                body.classList.remove(t.className);
            }
        });
        
        // Apply new theme class
        if (theme.className) {
            body.classList.add(theme.className);
        }
        
        // Update current theme
        this.currentTheme = themeName;
        
        // Save preference
        localStorage.setItem('walletTheme', themeName);
        
        // Update any theme-dependent components
        this.updateThemedComponents();
        
        // Remove transition class after animation
        if (animate) {
            setTimeout(() => {
                body.classList.remove('theme-transitioning');
            }, 300);
        }
        
        // Notify user
        if (animate) {
            this.app.showNotification(
                `Switched to ${theme.name}`,
                'success'
            );
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'default' ? 'moosh' : 'default';
        this.applyTheme(newTheme);
        
        // Update state
        this.app.state.set('isSparkTheme', newTheme === 'moosh');
    }
    
    updateThemedComponents() {
        // Update logo
        const logo = document.querySelector('.wallet-logo');
        if (logo) {
            logo.src = this.currentTheme === 'moosh' 
                ? '/assets/logo-moosh.svg' 
                : '/assets/logo-default.svg';
        }
        
        // Update charts/graphs
        if (window.chartInstances) {
            window.chartInstances.forEach(chart => {
                chart.options.theme = this.currentTheme;
                chart.update();
            });
        }
        
        // Update status bar
        this.updateStatusBar();
    }
    
    updateStatusBar() {
        const theme = this.themes[this.currentTheme];
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        
        if (metaTheme) {
            metaTheme.content = theme.colors.background;
        }
    }
    
    createThemeToggle() {
        const $ = window.ElementFactory;
        const isMoosh = this.currentTheme === 'moosh';
        
        return $.button({
            className: 'theme-toggle',
            onclick: () => this.toggleTheme(),
            title: `Switch to ${isMoosh ? 'Default' : 'MOOSH'} theme`
        }, [
            $.span({ className: 'theme-icon' }, [
                isMoosh ? '☀️' : '🌙'
            ]),
            $.span({ className: 'theme-label' }, [
                isMoosh ? 'Default' : 'MOOSH'
            ])
        ]);
    }
}

// CSS for MOOSH mode
const mooshModeStyles = `
/* MOOSH MODE - GREEN THEME */
body.moosh-mode {
    --text-primary: #69fd97 !important;
    --text-secondary: #ffffff !important;
    --text-accent: #69fd97 !important;
    --text-string: #69fd97 !important;
    --text-keyword: #69fd97 !important;
    --text-comment: #71767b !important;
    --text-dim: #71767b !important;
    --bg-primary: #000000 !important;
    --bg-secondary: #000000 !important;
    --bg-tertiary: #0a0a0a !important;
    --bg-hover: #1a1a1a !important;
    --accent-color: #1d1d1d !important;
    --border-color: #232b2b !important;
    --border-active: #69fd97 !important;
    --accent-bg: rgba(105, 253, 151, 0.1) !important;
    --accent-bg-hover: rgba(105, 253, 151, 0.2) !important;
}

/* Theme transition */
body.theme-transitioning {
    transition: background-color 0.3s ease, color 0.3s ease;
}

body.theme-transitioning * {
    transition: background-color 0.3s ease, 
                color 0.3s ease, 
                border-color 0.3s ease !important;
}

/* MOOSH MODE - Buttons */
body.moosh-mode button,
body.moosh-mode .button {
    background: #000000 !important;
    border: 2px solid #232b2b !important;
    color: #69fd97 !important;
}

body.moosh-mode button:hover,
body.moosh-mode .button:hover {
    border: 2px solid #69fd97 !important;
    background: #000000 !important;
    color: #69fd97 !important;
}

/* MOOSH MODE - Inputs */
body.moosh-mode input,
body.moosh-mode textarea,
body.moosh-mode select {
    background: #000000 !important;
    border: 2px solid #232b2b !important;
    color: #69fd97 !important;
}

body.moosh-mode input:focus,
body.moosh-mode textarea:focus,
body.moosh-mode select:focus {
    border-color: #69fd97 !important;
}

/* MOOSH MODE - Terminal */
body.moosh-mode .terminal-box {
    background: #000000 !important;
    border: 2px solid #232b2b !important;
}

body.moosh-mode .terminal-box:hover {
    border-color: #69fd97 !important;
}
`;
```

## Configuration
- **Settings**: 
  - Available themes: Default, MOOSH
  - Theme persistence: localStorage
  - Transition duration: 300ms
  - Auto-detect preference: planned
- **Defaults**: 
  - Start with default theme
  - Smooth transitions enabled
  - Theme saved locally
  - No system preference sync
- **Limits**: 
  - Two themes currently
  - No custom themes yet
  - One theme at a time

## Security Considerations
- No security implications
- Theme stored locally only
- No sensitive data in themes
- CSS injection prevented

## Performance Impact
- **Load Time**: Instant theme switch
- **Memory**: Minimal CSS overhead
- **Network**: None (local only)

## Mobile Considerations
- Touch-friendly toggle button
- Smooth transitions on mobile
- Respects battery saver mode
- No motion if preferred
- Theme persists across sessions

## Error Handling
- **Common Errors**: 
  - Unknown theme name
  - localStorage unavailable
  - CSS transition failures
- **Recovery**: 
  - Fallback to default theme
  - Disable transitions
  - Clear theme preference
  - Reload with default

## Testing
```bash
# Test theme switching
1. Test theme toggle:
   - Click theme button
   - Verify instant change
   - Check all UI elements
   - Confirm smooth transition
   
2. Test persistence:
   - Switch to MOOSH mode
   - Refresh page
   - Verify theme retained
   - Clear storage and test
   
3. Test components:
   - Check buttons styling
   - Verify input colors
   - Test modal themes
   - Check chart colors
   
4. Test mobile:
   - Toggle on mobile
   - Check performance
   - Verify touch response
   - Test landscape mode
```

## Future Enhancements
- **Additional Themes**:
  - Dark mode (pure black)
  - Light mode (white)
  - High contrast mode
  - Custom color themes
  - Seasonal themes
- **Advanced Features**:
  - System preference sync
  - Time-based switching
  - Per-component themes
  - Theme marketplace
  - Custom CSS injection
- **Accessibility**:
  - Color blind modes
  - Contrast adjustment
  - Font size themes
  - Animation preferences
  - Reduced motion support