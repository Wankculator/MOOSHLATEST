# 🎨 Theme Switching Implementation Guide

## Overview
This document explains how theme switching works in MOOSH Wallet, particularly for the dashboard chart components.

## Theme System Architecture

### 1. Theme Toggle Flow
```javascript
toggleTheme() → Update Classes → Refresh Dashboard → Update Chart Colors
```

### 2. Key Components

#### Theme Toggle Method (`Header.toggleTheme()`)
Located in: `/public/js/moosh-wallet.js` (line ~4675)

```javascript
toggleTheme() {
    // 1. Toggle theme state
    const isMooshMode = !this.app.state.get('isMooshMode');
    
    // 2. Update body classes
    if (isMooshMode) {
        document.body.classList.add('moosh-mode');
        document.body.classList.remove('original-mode');
    } else {
        document.body.classList.add('original-mode');
        document.body.classList.remove('moosh-mode');
    }
    
    // 3. Refresh dashboard if active
    if (currentPageName === 'dashboard') {
        if (this.app.dashboard?.refreshDashboard) {
            this.app.dashboard.refreshDashboard();
        } else {
            this.app.router.navigate('dashboard');
        }
    }
}
```

#### Dashboard Instance Storage
- Dashboard page instance is stored at `this.app.dashboard` when created
- This allows other components to access dashboard methods
- Stored in Router during page mounting (line ~3716)

#### Chart Refresh Method (`DashboardPage.refreshDashboard()`)
Located in: `/public/js/moosh-wallet.js` (line ~26829)

```javascript
refreshDashboard() {
    // Re-create chart with new theme colors
    const chartSection = document.getElementById('balanceChartSection');
    if (chartSection) {
        chartSection.innerHTML = '';
        chartSection.appendChild(this.createBalanceChart());
    }
    
    // Update existing elements
    this.updateChartTheme();
}
```

## Theme Colors

### Original Mode (Orange)
- Primary: `#f57315`
- Text: Orange with various opacities
- Borders: 2px solid orange

### Moosh Mode (Green)
- Primary: `#69fd97`
- Text: Green with various opacities
- Borders: 2px solid green

## Chart Theme Implementation

### Chart Structure
```
┌─────────────────────────────────┐
│ #priceChart (Main Container)    │ ← 2px theme border
│ ┌─────────────────────────────┐ │
│ │ BTC Price    My Balance     │ │ ← Theme colored text
│ │ $45,000.00   $5,555.56      │ │ ← Theme colored values
│ │              0.12345678 BTC  │ │ ← Theme colored (0.6 opacity)
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ #miniChart                   │ │ ← 1px theme border
│ │ ▅▄▃▅▅▆▇▆▅▆█▇▅▄▃▃▁▂▂▁       │ │ ← Theme colored sparkline
│ └─────────────────────────────┘ │
│  24h: +2.3%  7d: +5.7%  30d:... │ ← Red/green for +/-
└─────────────────────────────────┘
```

### Color Updates
1. **Container Border**: `border: 2px solid ${themeColor}`
2. **Labels**: `color: ${themeColor}; opacity: 0.7`
3. **Values**: `color: ${themeColor}`
4. **BTC Amount**: `color: ${themeColor}; opacity: 0.6`
5. **Sparkline**: `color: ${themeColor}`
6. **Percentages**: Green (#00ff88) for positive, Red (#ff4444) for negative

## Best Practices

### 1. Always Use Theme Variables
```javascript
const isMooshMode = document.body.classList.contains('moosh-mode');
const themeColor = isMooshMode ? '#69fd97' : '#f57315';
```

### 2. Store Page Instances
- Store important page instances on the app object
- Allows cross-component communication
- Example: `this.app.dashboard = page;`

### 3. Provide Fallbacks
- Try to refresh existing components first
- Fall back to full re-render if needed
- Add console logs for debugging

### 4. Test Both Themes
- Always test UI changes in both Original and Moosh modes
- Ensure all text remains readable
- Verify borders and backgrounds update

## Troubleshooting

### Chart Not Updating?
1. Check console for theme switching logs
2. Verify dashboard instance exists: `console.log(this.app.dashboard)`
3. Ensure you're on dashboard page when testing
4. Check for JavaScript errors

### Colors Not Applying?
1. Verify theme class on body element
2. Check inline style specificity
3. Ensure ElementFactory creates elements with theme variables
4. Use browser DevTools to inspect computed styles

## Future Improvements
- Consider using CSS variables for easier theme management
- Add transition animations for smoother theme switches
- Cache chart data to avoid regeneration on theme change

---

*Last Updated: Theme switching implementation with real-time chart updates*