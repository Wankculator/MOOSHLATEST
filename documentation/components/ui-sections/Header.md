# UI Section: Header

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 6191-6250 (createHeader)
- `/public/js/moosh-wallet.js` - Lines 17140-17200 (Modal headers)
- `/public/js/moosh-wallet.js` - Lines 13844-13900 (Dashboard header)

## Overview
The Header component provides consistent top-level navigation and branding across different pages and modals in MOOSH Wallet. It includes the logo, page title, and contextual action buttons.

## Component Architecture

### Page Header Implementation
```javascript
createHeader() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.header({
        className: 'page-header',
        style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'calc(24px * var(--scale-factor))',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: 'calc(24px * var(--scale-factor))'
        }
    }, [
        this.createHeaderTitle(),
        this.createHeaderActions()
    ]);
}
```

## Visual Specifications

### Header Styles
```css
.page-header {
    background: var(--bg-primary);
    position: relative;
    z-index: 10;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.header-text {
    font-size: calc(24px * var(--scale-factor));
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
}

.header-subtitle {
    font-size: calc(14px * var(--scale-factor));
    color: var(--text-dim);
    margin-left: 8px;
    opacity: 0.8;
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* Terminal-style header */
.terminal-header {
    background: var(--bg-secondary);
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-accent);
}
```

## DOM Structure

### Dashboard Header
```html
<header class="page-header">
    <div class="header-title">
        <img src="images/Moosh-logo.png" alt="MOOSH" class="header-logo">
        <h1 class="header-text">
            <span class="moosh-flash">MOOSH WALLET</span>
            <span class="header-subtitle">Dashboard</span>
        </h1>
    </div>
    
    <div class="header-actions">
        <div class="account-indicator" onclick="showMultiAccountManager()">
            <span class="account-color"></span>
            <span class="account-name">Main Account</span>
        </div>
        <button class="btn-secondary" onclick="handleRefresh()">Refresh</button>
        <button class="btn-secondary visibility-toggle" onclick="togglePrivacy()">👁</button>
    </div>
</header>
```

### Modal Header
```html
<div class="modal-header">
    <h2 class="modal-title">Send Bitcoin</h2>
    <button class="close-btn" aria-label="Close modal">×</button>
</div>
```

### Terminal-Style Header
```html
<div class="terminal-box">
    <div class="terminal-header">
        <span class="terminal-prompt">~/moosh/wallet/dashboard $</span>
        <span class="terminal-cursor">_</span>
    </div>
    <div class="terminal-content">
        <!-- Content -->
    </div>
</div>
```

## Header Variations

### Dashboard Header
```javascript
createDashboardHeader() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ 
        className: 'terminal-box',
        style: 'margin-bottom: calc(24px * var(--scale-factor));'
    }, [
        $.div({ className: 'terminal-header' }, [
            $.span({}, ['~/moosh/wallet/dashboard $'])
        ]),
        $.div({ className: 'terminal-content' }, [
            $.div({ 
                style: 'display: flex; justify-content: space-between; align-items: center;'
            }, [
                $.h2({ 
                    style: 'font-size: calc(20px * var(--scale-factor)); font-weight: 600;'
                }, ['Wallet Overview']),
                this.createHeaderButtons()
            ])
        ])
    ]);
}
```

### Modal Header
```javascript
createModalHeader(title, onClose) {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'modal-header' }, [
        $.h2({ className: 'modal-title' }, [title]),
        $.button({
            className: 'close-btn',
            'aria-label': 'Close modal',
            onclick: onClose
        }, ['×'])
    ]);
}
```

### Page Header with Breadcrumbs
```javascript
createPageHeaderWithBreadcrumbs() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.header({ className: 'page-header with-breadcrumbs' }, [
        $.nav({ className: 'breadcrumbs', 'aria-label': 'Breadcrumb' }, [
            $.a({ href: '#dashboard' }, ['Dashboard']),
            $.span({ className: 'separator' }, ['/']),
            $.a({ href: '#wallet' }, ['Wallet']),
            $.span({ className: 'separator' }, ['/']),
            $.span({ className: 'current' }, ['Settings'])
        ]),
        $.div({ className: 'header-main' }, [
            this.createHeaderTitle(),
            this.createHeaderActions()
        ])
    ]);
}
```

## Interactive Elements

### Account Indicator
```javascript
createAccountIndicator() {
    const $ = window.ElementFactory || ElementFactory;
    const currentWallet = this.app.state.get('currentWallet');
    
    return $.div({ 
        id: 'currentAccountIndicator',
        className: 'account-indicator',
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(105, 253, 151, 0.1)',
            border: '1px solid var(--text-accent)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        onclick: () => this.showMultiAccountManager(),
        onmouseover: (e) => {
            e.currentTarget.style.background = 'rgba(105, 253, 151, 0.2)';
        },
        onmouseout: (e) => {
            e.currentTarget.style.background = 'rgba(105, 253, 151, 0.1)';
        }
    }, [
        $.div({
            className: 'account-color',
            style: {
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentWallet?.color || '#69FD97'
            }
        }),
        $.span({ className: 'account-name' }, [
            currentWallet?.name || 'No Wallet Selected'
        ])
    ]);
}
```

### Action Buttons
```javascript
createHeaderButtons() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ 
        className: 'header-buttons',
        style: 'display: flex; gap: calc(8px * var(--scale-factor));'
    }, [
        $.button({
            className: 'btn-secondary dashboard-btn',
            onclick: () => this.showMultiAccountManager()
        }, ['+ Accounts']),
        $.button({
            className: 'btn-secondary dashboard-btn',
            onclick: () => this.handleRefresh()
        }, ['Refresh']),
        $.button({
            className: 'btn-secondary dashboard-btn visibility-toggle',
            onclick: () => this.toggleBalanceVisibility(),
            style: {
                padding: '8px 12px',
                minWidth: '60px'
            }
        }, [this.createLockIcon()])
    ]);
}
```

## Responsive Behavior

### Mobile Adjustments
```css
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }
    
    .header-title {
        flex-direction: column;
    }
    
    .header-actions {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .header-text {
        font-size: calc(18px * var(--scale-factor));
    }
    
    .header-subtitle {
        display: block;
        margin-left: 0;
        margin-top: 4px;
    }
    
    .breadcrumbs {
        font-size: 12px;
        overflow-x: auto;
        white-space: nowrap;
    }
}
```

## Animation Effects

### Logo Animation
```css
.moosh-flash {
    animation: flash 2s ease-in-out infinite;
}

@keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.header-logo {
    transition: transform 0.3s ease;
}

.header-logo:hover {
    transform: scale(1.1) rotate(5deg);
}
```

### Terminal Cursor
```css
.terminal-cursor {
    animation: blink 1s step-start infinite;
}

@keyframes blink {
    50% { opacity: 0; }
}
```

## State Management
- Current page/route for title
- Account information for indicator
- Refresh state for loading indicators
- Privacy mode state

## Accessibility
- Proper heading hierarchy
- ARIA labels for buttons
- Keyboard navigation support
- Focus management

## Testing
```bash
# Test header rendering
npm run test:ui:header

# Test responsive behavior
npm run test:ui:header:responsive

# Test interactive elements
npm run test:ui:header:interactions
```

## Known Issues
1. Logo image missing fallback
2. Breadcrumbs overflow on mobile
3. Account indicator text truncation

## Git Recovery Commands
```bash
# Restore header implementations
git checkout 1981e5a -- public/js/moosh-wallet.js

# View header history
git log -p --grep="header\|createHeader" -- public/js/moosh-wallet.js
```

## Related Components
- [Navigation Bar](./NavigationBar.md)
- [Account Dropdown](./AccountDropdown.md)
- [Dashboard Page](../pages/DashboardPage.md)
- [Modal Components](../modals/)