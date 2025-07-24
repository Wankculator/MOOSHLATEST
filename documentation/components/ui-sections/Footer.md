# UI Section: Footer

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 31410-31424 (createFooter)
- `/public/js/moosh-wallet.js` - Lines 19517-19550, 23483-23520, 25374-25400 (Modal footers)

## Overview
The Footer component appears at the bottom of the application and in various modals, providing copyright information, links, and action buttons depending on the context.

## Component Architecture

### Main App Footer
```javascript
createFooter() {
    const $ = window.ElementFactory || ElementFactory;
    
    const footer = $.div({ 
        className: 'app-footer',
        role: 'contentinfo',
        style: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100
        }
    }, [
        this.createCopyright(),
        this.createFooterLinks(),
        this.createSocialLinks()
    ]);
    
    document.body.appendChild(footer);
}
```

## Visual Specifications

### App Footer Styles
```css
.app-footer {
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.9);
}

.copyright {
    font-size: 12px;
    color: var(--text-dim);
    font-family: 'JetBrains Mono', monospace;
}

.tagline {
    font-size: 11px;
    color: var(--text-dim);
    opacity: 0.8;
    margin-top: 4px;
}

.footer-links {
    display: flex;
    gap: 24px;
}

.footer-link {
    color: var(--text-dim);
    text-decoration: none;
    font-size: 12px;
    transition: color 0.2s ease;
}

.footer-link:hover {
    color: var(--text-primary);
}

.social-links {
    display: flex;
    gap: 16px;
}

.social-link {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    transition: all 0.2s ease;
}

.social-link:hover {
    color: var(--text-accent);
    transform: translateY(-2px);
}
```

### Modal Footer Styles
```css
.modal-footer {
    padding: 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: var(--bg-secondary);
}

.modal-footer.space-between {
    justify-content: space-between;
}

.footer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-dim);
}

.footer-actions {
    display: flex;
    gap: 12px;
}
```

## DOM Structure

### App Footer
```html
<div class="app-footer" role="contentinfo">
    <div class="footer-left">
        <p class="copyright">© 2025 MOOSH Wallet Limited. All rights reserved.</p>
        <p class="tagline">World's First AI-Powered Bitcoin Wallet</p>
    </div>
    
    <nav class="footer-links" role="navigation" aria-label="Footer navigation">
        <a href="#privacy" class="footer-link">Privacy Policy</a>
        <a href="#terms" class="footer-link">Terms of Service</a>
        <a href="#support" class="footer-link">Support</a>
        <a href="#docs" class="footer-link">Documentation</a>
    </nav>
    
    <div class="social-links">
        <a href="https://twitter.com/mooshwallet" class="social-link" aria-label="Twitter">
            <svg><!-- Twitter icon --></svg>
        </a>
        <a href="https://github.com/mooshwallet" class="social-link" aria-label="GitHub">
            <svg><!-- GitHub icon --></svg>
        </a>
        <a href="https://discord.gg/moosh" class="social-link" aria-label="Discord">
            <svg><!-- Discord icon --></svg>
        </a>
    </div>
</div>
```

### Modal Footer
```html
<div class="modal-footer">
    <div class="footer-info">
        <span class="info-icon">ℹ️</span>
        <span>Transaction fee: 0.00001 BTC</span>
    </div>
    
    <div class="footer-actions">
        <button class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary">Confirm</button>
    </div>
</div>
```

## Implementation Variations

### Send Modal Footer
```javascript
createSendModalFooter() {
    const $ = window.ElementFactory || ElementFactory;
    const canSend = this.validateSendForm();
    
    return $.div({ className: 'modal-footer space-between' }, [
        $.div({ className: 'footer-info' }, [
            $.span({ className: 'info-icon' }, ['ℹ️']),
            $.span({}, [`Fee: ${this.formatBtc(this.fee)} BTC`])
        ]),
        $.div({ className: 'footer-actions' }, [
            $.button({
                className: 'btn btn-secondary',
                onclick: () => this.close()
            }, ['Cancel']),
            $.button({
                className: 'btn btn-primary',
                disabled: !canSend,
                onclick: () => this.sendTransaction()
            }, ['Send'])
        ])
    ]);
}
```

### Settings Modal Footer
```javascript
createSettingsModalFooter() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'modal-footer' }, [
        $.button({
            className: 'btn btn-secondary',
            onclick: () => this.resetToDefaults()
        }, ['Reset to Defaults']),
        $.div({ className: 'footer-actions' }, [
            $.button({
                className: 'btn btn-secondary',
                onclick: () => this.close()
            }, ['Cancel']),
            $.button({
                className: 'btn btn-primary',
                onclick: () => this.saveSettings()
            }, ['Save Settings'])
        ])
    ]);
}
```

## Responsive Behavior

### Mobile Adjustments
```css
@media (max-width: 768px) {
    .app-footer {
        flex-direction: column;
        gap: 16px;
        padding: 20px 16px;
        text-align: center;
    }
    
    .footer-links {
        order: 2;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
    }
    
    .social-links {
        order: 3;
    }
    
    .modal-footer {
        padding: 16px;
    }
    
    .modal-footer.space-between {
        flex-direction: column;
        gap: 16px;
    }
    
    .footer-info {
        width: 100%;
        justify-content: center;
    }
}
```

## Dynamic Content

### Version Display
```javascript
createVersionInfo() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'version-info' }, [
        $.span({ className: 'version-label' }, ['Version:']),
        $.span({ className: 'version-number' }, [APP_VERSION]),
        $.span({ className: 'network-indicator' }, [
            this.app.network === 'mainnet' ? '🟢' : '🟡'
        ])
    ]);
}
```

### Status Indicators
```javascript
createStatusIndicators() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'status-indicators' }, [
        $.div({ 
            className: 'status-item',
            title: 'Connection status'
        }, [
            $.span({ className: `status-dot ${this.connectionStatus}` }),
            $.span({ className: 'status-label' }, ['Connected'])
        ]),
        $.div({ 
            className: 'status-item',
            title: 'Sync status'
        }, [
            $.span({ className: 'sync-icon rotating' }, ['🔄']),
            $.span({ className: 'status-label' }, ['Syncing...'])
        ])
    ]);
}
```

## Accessibility Features
- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader announcements

## State Management
- Network status from `app.state.network`
- Connection status from WebSocket state
- Version from build configuration

## Testing
```bash
# Test footer rendering
npm run test:ui:footer

# Test responsive behavior
npm run test:ui:footer:responsive

# Test link functionality
npm run test:ui:footer:links
```

## Known Issues
1. Footer can overlap content on small screens
2. Social links need proper icons
3. Version number not updating in production builds

## Git Recovery Commands
```bash
# Restore footer implementation
git checkout 1981e5a -- public/js/moosh-wallet.js

# View footer history
git log -p --grep="footer" -- public/js/moosh-wallet.js
```

## Related Components
- [Navigation Bar](./NavigationBar.md)
- [Modal Components](../modals/)
- [App Layout](./AppLayout.md)