# UI Section: Navigation Bar

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 4500-5000 (Navigation implementation)
- `/public/js/moosh-wallet.js` - Lines 31400-31500 (App header)

## Overview
The Navigation Bar provides the primary navigation interface for MOOSH Wallet, featuring the logo, main menu items, account switcher, and utility buttons. It's responsive and theme-aware.

## Component Architecture

### Structure
```javascript
createNavigationBar() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.nav({
        className: 'main-navigation',
        role: 'navigation',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px'
        }
    }, [
        this.createLogo(),
        this.createNavMenu(),
        this.createNavActions()
    ]);
}
```

## Visual Specifications

### Desktop Layout
```css
.main-navigation {
    display: grid;
    grid-template-columns: 200px 1fr auto;
    align-items: center;
    gap: 24px;
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: var(--text-primary);
}

.nav-menu {
    display: flex;
    gap: 32px;
    justify-content: center;
}

.nav-menu-item {
    color: var(--text-dim);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
    position: relative;
}

.nav-menu-item:hover,
.nav-menu-item.active {
    color: var(--text-primary);
}

.nav-menu-item.active::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--text-accent);
}
```

### Mobile Layout
```css
@media (max-width: 768px) {
    .main-navigation {
        grid-template-columns: auto 1fr auto;
    }
    
    .nav-menu {
        display: none;
    }
    
    .mobile-menu-toggle {
        display: block;
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 24px;
        cursor: pointer;
    }
    
    .mobile-menu {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: var(--bg-primary);
        border-bottom: 1px solid var(--border-color);
        padding: 16px;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }
    
    .mobile-menu.open {
        transform: translateY(0);
    }
}
```

## DOM Structure
```html
<nav class="main-navigation">
    <!-- Logo Section -->
    <a href="#" class="nav-logo">
        <img src="images/Moosh-logo.png" alt="MOOSH" class="logo-image">
        <span class="logo-text">MOOSH WALLET</span>
    </a>
    
    <!-- Desktop Menu -->
    <div class="nav-menu">
        <a href="#dashboard" class="nav-menu-item active">Dashboard</a>
        <a href="#wallet" class="nav-menu-item">Wallet</a>
        <a href="#ordinals" class="nav-menu-item">Ordinals</a>
        <a href="#settings" class="nav-menu-item">Settings</a>
    </div>
    
    <!-- Actions Section -->
    <div class="nav-actions">
        <div class="account-switcher-container">
            <!-- Account Switcher Component -->
        </div>
        <button class="theme-toggle">🌓</button>
        <button class="notification-toggle">
            <span class="notification-icon">🔔</span>
            <span class="notification-badge">3</span>
        </button>
        <button class="mobile-menu-toggle">☰</button>
    </div>
</nav>

<!-- Mobile Menu -->
<div class="mobile-menu">
    <a href="#dashboard" class="mobile-menu-item">Dashboard</a>
    <a href="#wallet" class="mobile-menu-item">Wallet</a>
    <a href="#ordinals" class="mobile-menu-item">Ordinals</a>
    <a href="#settings" class="mobile-menu-item">Settings</a>
</div>
```

## Implementation Details

### Logo Component
```javascript
createLogo() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.a({
        href: '#',
        className: 'nav-logo',
        onclick: (e) => {
            e.preventDefault();
            this.app.router.navigate('dashboard');
        }
    }, [
        $.img({
            src: 'images/Moosh-logo.png',
            alt: 'MOOSH',
            className: 'logo-image',
            style: {
                width: '32px',
                height: '32px',
                objectFit: 'contain'
            },
            onerror: function() { 
                this.style.display = 'none'; 
            }
        }),
        $.span({
            className: 'logo-text moosh-flash',
            style: {
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: "'JetBrains Mono', monospace"
            }
        }, ['MOOSH WALLET'])
    ]);
}
```

### Menu Items
```javascript
createNavMenu() {
    const $ = window.ElementFactory || ElementFactory;
    const currentRoute = this.app.router.currentRoute;
    
    const menuItems = [
        { label: 'Dashboard', route: 'dashboard', icon: '📊' },
        { label: 'Wallet', route: 'wallet', icon: '💰' },
        { label: 'Ordinals', route: 'ordinals', icon: '🎨' },
        { label: 'Settings', route: 'settings', icon: '⚙️' }
    ];
    
    return $.div({ className: 'nav-menu' }, 
        menuItems.map(item => 
            $.a({
                href: `#${item.route}`,
                className: `nav-menu-item ${currentRoute === item.route ? 'active' : ''}`,
                onclick: (e) => {
                    e.preventDefault();
                    this.app.router.navigate(item.route);
                }
            }, [
                window.innerWidth > 768 ? item.label : item.icon
            ])
        )
    );
}
```

### Action Buttons
```javascript
createNavActions() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'nav-actions' }, [
        // Account Switcher
        new AccountSwitcher(this.app).render(),
        
        // Theme Toggle
        $.button({
            className: 'theme-toggle',
            title: 'Toggle theme',
            onclick: () => this.app.themeManager.toggle()
        }, ['🌓']),
        
        // Notifications
        this.createNotificationButton(),
        
        // Mobile Menu Toggle
        $.button({
            className: 'mobile-menu-toggle',
            onclick: () => this.toggleMobileMenu()
        }, ['☰'])
    ]);
}
```

## Responsive Behavior

### Breakpoints
- **Desktop**: > 1024px - Full menu visible
- **Tablet**: 768px - 1024px - Condensed menu
- **Mobile**: < 768px - Hamburger menu

### Mobile Menu Handler
```javascript
toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const isOpen = mobileMenu.classList.contains('open');
    
    if (isOpen) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    } else {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    // Close on outside click
    if (!isOpen) {
        document.addEventListener('click', this.handleOutsideClick);
    } else {
        document.removeEventListener('click', this.handleOutsideClick);
    }
}
```

## State Management
- Active route tracked in `app.router.currentRoute`
- Mobile menu state in component state
- Theme preference in `app.state.theme`
- Notification count from `app.state.notifications`

## Accessibility
```javascript
// ARIA attributes
nav.setAttribute('role', 'navigation');
nav.setAttribute('aria-label', 'Main navigation');

// Keyboard navigation
menuItems.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});
```

## Testing
```bash
# Test navigation rendering
npm run test:ui:navigation

# Test responsive behavior
npm run test:ui:navigation:responsive

# Test route changes
npm run test:ui:navigation:routing
```

## Known Issues
1. Mobile menu can overlap with modals
2. Active state doesn't update on direct URL navigation
3. Logo image needs optimization for retina displays

## Git Recovery Commands
```bash
# Restore navigation implementation
git checkout 1981e5a -- public/js/moosh-wallet.js

# View navigation history
git log -p --grep="navigation\|nav" -- public/js/moosh-wallet.js
```

## Related Components
- [Account Dropdown](./AccountDropdown.md)
- [Theme Toggle Button](../buttons/ThemeToggleButton.md)
- [Router](../atomic-units/Router/ai-context.md)
- [Header](./Header.md)