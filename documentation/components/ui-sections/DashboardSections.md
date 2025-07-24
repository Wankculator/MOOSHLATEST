# UI Section: Dashboard Sections

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 13700-14500 (Dashboard layout)
- `/public/js/moosh-wallet.js` - Lines 27000-28500 (Dashboard components)
- `/documentation/guides/DASHBOARD-FEATURES-DOCUMENTATION.md`

## Overview
The Dashboard is composed of multiple sections that work together to provide a comprehensive wallet overview. Each section is modular and can be rearranged based on user preferences.

## Dashboard Layout Architecture

### Grid System
```javascript
createDashboardLayout() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ 
        className: 'dashboard-container',
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'auto',
            gap: 'calc(24px * var(--scale-factor))',
            padding: 'calc(24px * var(--scale-factor))',
            maxWidth: '1400px',
            margin: '0 auto'
        }
    }, [
        this.createTopSection(),      // Full width
        this.createMainSection(),      // 8 columns
        this.createSidebarSection(),   // 4 columns
        this.createBottomSection()     // Full width
    ]);
}
```

## Section Specifications

### Top Section (Welcome & Stats)
```css
.dashboard-top-section {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
}

.welcome-card {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(105, 253, 151, 0.1) 100%);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.stat-card {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Main Content Section
```css
.dashboard-main-section {
    grid-column: 1 / 9;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.balance-card {
    min-height: 250px;
}

.quick-actions-card {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.chart-card {
    min-height: 300px;
    position: relative;
}

.transactions-card {
    max-height: 400px;
    overflow: hidden;
}
```

### Sidebar Section
```css
.dashboard-sidebar {
    grid-column: 9 / -1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.market-overview-card {
    min-height: 200px;
}

.news-feed-card {
    max-height: 500px;
    overflow-y: auto;
}

.tools-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
```

## Section Components

### Welcome Section
```javascript
createWelcomeSection() {
    const $ = window.ElementFactory || ElementFactory;
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : 
                    currentHour < 18 ? 'Good afternoon' : 'Good evening';
    
    return $.div({ className: 'welcome-card' }, [
        $.h2({ className: 'welcome-greeting' }, [
            `${greeting}, ${this.getUserName()}`
        ]),
        $.p({ className: 'welcome-message' }, [
            'Your wallet is secure and synced.'
        ]),
        $.div({ className: 'welcome-stats' }, [
            $.div({ className: 'stat-item' }, [
                $.span({ className: 'stat-label' }, ['Portfolio Value']),
                $.span({ className: 'stat-value' }, ['$53,721.89'])
            ]),
            $.div({ className: 'stat-item' }, [
                $.span({ className: 'stat-label' }, ['24h Change']),
                $.span({ className: 'stat-value positive' }, ['+2.34%'])
            ])
        ])
    ]);
}
```

### Quick Stats Cards
```javascript
createStatsCards() {
    const stats = [
        { label: 'Total Transactions', value: '127', icon: '📊' },
        { label: 'Active Accounts', value: '3', icon: '👥' },
        { label: 'Network Fee', value: 'Low', icon: '⚡' }
    ];
    
    return stats.map(stat => 
        $.div({ className: 'stat-card' }, [
            $.div({ className: 'stat-icon' }, [stat.icon]),
            $.div({ className: 'stat-value' }, [stat.value]),
            $.div({ className: 'stat-label' }, [stat.label])
        ])
    );
}
```

### Market Overview Widget
```javascript
createMarketOverview() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'market-overview-card card' }, [
        $.h3({ className: 'card-title' }, ['Market Overview']),
        $.div({ className: 'market-stats' }, [
            $.div({ className: 'market-item' }, [
                $.span({ className: 'market-label' }, ['BTC Price']),
                $.span({ className: 'market-value' }, ['$43,567.89']),
                $.span({ className: 'market-change positive' }, ['+2.34%'])
            ]),
            $.div({ className: 'market-item' }, [
                $.span({ className: 'market-label' }, ['Market Cap']),
                $.span({ className: 'market-value' }, ['$851.2B'])
            ]),
            $.div({ className: 'market-item' }, [
                $.span({ className: 'market-label' }, ['24h Volume']),
                $.span({ className: 'market-value' }, ['$28.5B'])
            ])
        ])
    ]);
}
```

### News Feed Widget
```javascript
createNewsFeed() {
    const $ = window.ElementFactory || ElementFactory;
    
    return $.div({ className: 'news-feed-card card' }, [
        $.h3({ className: 'card-title' }, ['Bitcoin News']),
        $.div({ className: 'news-items' }, 
            this.newsItems.map(item => 
                $.div({ className: 'news-item' }, [
                    $.div({ className: 'news-time' }, [
                        this.getTimeAgo(item.timestamp)
                    ]),
                    $.h4({ className: 'news-title' }, [item.title]),
                    $.p({ className: 'news-summary' }, [item.summary]),
                    $.a({ 
                        href: item.url,
                        className: 'news-link',
                        target: '_blank'
                    }, ['Read more →'])
                ])
            )
        )
    ]);
}
```

### Tools Section
```javascript
createToolsSection() {
    const tools = [
        { icon: '🔧', label: 'Settings', action: 'settings' },
        { icon: '📱', label: 'Mobile', action: 'mobile' },
        { icon: '🔐', label: 'Security', action: 'security' },
        { icon: '💾', label: 'Backup', action: 'backup' }
    ];
    
    return $.div({ className: 'tools-card card' }, [
        $.h3({ className: 'card-title' }, ['Quick Tools']),
        $.div({ className: 'tools-grid' }, 
            tools.map(tool => 
                $.button({
                    className: 'tool-button',
                    onclick: () => this.handleToolAction(tool.action)
                }, [
                    $.span({ className: 'tool-icon' }, [tool.icon]),
                    $.span({ className: 'tool-label' }, [tool.label])
                ])
            )
        )
    ]);
}
```

## Responsive Layout

### Tablet Layout (768px - 1024px)
```css
@media (max-width: 1024px) {
    .dashboard-container {
        grid-template-columns: repeat(8, 1fr);
    }
    
    .dashboard-main-section {
        grid-column: 1 / -1;
    }
    
    .dashboard-sidebar {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    
    .quick-actions-card {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

### Mobile Layout (< 768px)
```css
@media (max-width: 768px) {
    .dashboard-container {
        grid-template-columns: 1fr;
        padding: 16px;
    }
    
    .dashboard-top-section {
        grid-template-columns: 1fr;
    }
    
    .stat-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: left;
    }
    
    .quick-actions-card {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .dashboard-sidebar {
        grid-template-columns: 1fr;
    }
    
    .chart-card {
        min-height: 200px;
    }
}
```

## Section State Management
```javascript
class DashboardSectionManager {
    constructor() {
        this.sectionStates = new Map();
        this.sectionOrder = this.loadSectionOrder();
    }
    
    toggleSection(sectionId) {
        const state = this.sectionStates.get(sectionId) || { visible: true };
        state.visible = !state.visible;
        this.sectionStates.set(sectionId, state);
        this.saveSectionStates();
        this.rerenderDashboard();
    }
    
    reorderSections(newOrder) {
        this.sectionOrder = newOrder;
        localStorage.setItem('dashboardSectionOrder', JSON.stringify(newOrder));
        this.rerenderDashboard();
    }
}
```

## Performance Optimizations
1. **Lazy loading** for news feed and market data
2. **Virtual scrolling** for transaction lists
3. **Debounced updates** for real-time data
4. **Section memoization** to prevent unnecessary re-renders

## Accessibility
- Semantic section elements
- ARIA labels for widgets
- Keyboard navigation between sections
- Screen reader announcements for updates

## Testing
```bash
# Test dashboard layout
npm run test:ui:dashboard-layout

# Test responsive behavior
npm run test:ui:dashboard-responsive

# Test section interactions
npm run test:ui:dashboard-sections
```

## Known Issues
1. Grid layout can break with custom zoom levels
2. News feed needs better error handling
3. Section reordering not fully implemented

## Git Recovery Commands
```bash
# Restore dashboard sections
git checkout 1981e5a -- public/js/moosh-wallet.js

# View dashboard implementation
git log -p --grep="dashboard.*section" -- public/js/moosh-wallet.js
```

## Related Components
- [Dashboard Page](../pages/DashboardPage.md)
- [Dashboard Widgets](../features/DashboardWidgets.md)
- [Balance Display Section](./BalanceDisplaySection.md)
- [Transaction List](./TransactionList.md)