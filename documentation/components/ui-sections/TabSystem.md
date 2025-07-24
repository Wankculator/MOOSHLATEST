# TabSystem

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:25124-25426
**Mobile Support**: Yes
**Theme Support**: Dark/Light

## Visual Design

```
┌─────────────────────────────────────────────────┐
│ Accounts │ General │ Security │ Network │ Advanced│  <- Tab buttons
├─────────────────────────────────────────────────┤
│                                                 │
│           Active Tab Content                    │
│                                                 │
│  - Dynamic content based on selection           │
│  - Forms, settings, lists, etc.                 │
│                                                 │
└─────────────────────────────────────────────────┘

Active tab highlighted with:
- Border bottom
- Different background
- Text color change
```

## Structure
- **Container**: `div.settings-tabs`
- **Children**: 
  - Tab buttons (`button.settings-tab`)
  - Content panel (`div.settings-panel`)
- **Layout**: Horizontal flex for tabs, block for content

## Styling
- **Base Classes**: 
  - `settings-tabs` - Tab container
  - `settings-tab` - Individual tab button
  - `active` - Active tab state
  - `settings-panel` - Content container
- **Responsive**: Adapts to container width
- **Animations**: Smooth transitions on tab switch

## State Management
- **States**: 
  - Active tab (visual indicator)
  - Inactive tabs
  - Content switching
- **Updates**: 
  - Click handler updates active class
  - Content replaced on tab switch

## Implementation
```javascript
// Create tabs
$.div({ className: 'settings-tabs' }, 
    tabs.map((tab, index) => 
        $.button({
            className: `settings-tab ${index === 0 ? 'active' : ''}`,
            onclick: () => this.switchTab(tab)
        }, [tab])
    )
)

// Tab switching logic
switchTab(tabName) {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    
    // Update active tab
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update panel content
    panel.innerHTML = '';
    let content;
    
    switch(tabName) {
        case 'Accounts':
            content = this.createAccountsSettings();
            break;
        case 'General':
            content = this.createGeneralSettings();
            break;
        case 'Security':
            content = this.createSecuritySettings();
            break;
        // ... more cases
    }
    
    if (content) {
        panel.appendChild(content);
    }
}
```

## CSS Requirements
```css
.settings-tabs {
    background: #000000;
    border-bottom: 1px solid #333333;
    padding: 0 20px;
    display: flex;
    gap: 0;
}

.settings-tab {
    background: transparent;
    border: none;
    color: var(--text-dim);
    padding: 12px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
}

.settings-tab:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}

.settings-tab.active {
    color: var(--text-accent);
    background: var(--bg-primary);
    border-bottom: 2px solid var(--text-accent);
}

.settings-panel {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}
```

## Tab Types in MOOSH Wallet

### Settings Tabs
1. **Accounts** - Multi-account management
2. **General** - Basic preferences
3. **Security** - Password, backups
4. **Network** - Connection settings
5. **Advanced** - Developer options

### Other Potential Tab Uses
- Transaction filters (All/Sent/Received)
- Wallet types (Bitcoin/Spark/Lightning)
- Time periods (Day/Week/Month/Year)

## Accessibility
- **ARIA Labels**: 
  - `role="tablist"` on container
  - `role="tab"` on buttons
  - `aria-selected="true/false"`
  - `aria-controls` linking to panel
- **Keyboard Support**: 
  - Arrow keys for navigation
  - Enter/Space to select
  - Tab to move through tabs
- **Focus Management**: 
  - Clear focus indicators
  - Logical tab order

## Performance
- **Render Strategy**: Replace content entirely
- **Memory**: Previous content garbage collected
- **Animations**: CSS only, GPU accelerated

## Connected Components
- **Parent**: Settings modal, main views
- **Children**: Dynamic based on tab
- **Events**: 
  - Tab click events
  - Content load events

## Best Practices
1. **Default to first tab** on initial load
2. **Persist tab selection** in session
3. **Lazy load content** for performance
4. **Clear indication** of active tab
5. **Responsive design** - stack on mobile if needed

## Mobile Considerations
```css
@media (max-width: 768px) {
    .settings-tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 0 10px;
    }
    
    .settings-tab {
        padding: 10px 15px;
        font-size: 12px;
        white-space: nowrap;
    }
}
```

## Advanced Patterns
```javascript
// Tab with badges
$.button({
    className: 'settings-tab',
    onclick: () => this.switchTab('Notifications')
}, [
    'Notifications',
    $.span({ className: 'tab-badge' }, ['3'])
])

// Disabled tab
$.button({
    className: 'settings-tab disabled',
    disabled: true,
    title: 'Coming soon'
}, ['Beta Features'])

// Tab with icon
$.button({
    className: 'settings-tab',
    onclick: () => this.switchTab('Security')
}, [
    $.i({ className: 'icon-lock' }),
    ' Security'
])
```

## Common Issues & Solutions
1. **Content flicker** - Use transitions
2. **Lost form data** - Save before switching
3. **Deep linking** - Add URL hash support
4. **Mobile overflow** - Horizontal scroll
5. **Accessibility** - Proper ARIA labels