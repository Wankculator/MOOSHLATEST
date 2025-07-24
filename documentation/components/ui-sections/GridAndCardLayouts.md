# GridAndCardLayouts

**Status**: 🟢 Active
**Type**: Layout System
**Location**: /public/js/moosh-wallet.js:266-276, 6209-6350
**Mobile Support**: Yes (responsive grid)
**Theme Support**: Dark/Light

## Visual Design

```
Responsive Grid:
┌─────────┬─────────┬─────────┐
│ Card 1  │ Card 2  │ Card 3  │
├─────────┼─────────┼─────────┤
│ Card 4  │ Card 5  │ Card 6  │
└─────────┴─────────┴─────────┘

Mobile (stacked):
┌─────────────────┐
│     Card 1      │
├─────────────────┤
│     Card 2      │
├─────────────────┤
│     Card 3      │
└─────────────────┘

Card Structure:
┌─────────────────────────┐
│ Icon/Title              │
│                         │
│ Description text here   │
│                         │
│ [Action Button]         │
└─────────────────────────┘
```

## Grid Types

### 1. Responsive Grid Helper
```javascript
createResponsiveGrid(items, options = {}) {
    const { minItemWidth = 250, gap = 'var(--space-md)' } = options;
    
    return $.div({
        className: 'responsive-grid',
        style: {
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}px), 1fr))`,
            gap: gap,
            width: '100%'
        }
    }, items);
}
```

### 2. Stats Grid
```javascript
createSparkStats() {
    return ElementFactory.div({
        className: 'spark-stats-grid',
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            padding: '20px',
            background: 'rgba(0, 212, 255, 0.1)',
            margin: '0 20px',
            borderRadius: '15px',
            border: '1px solid rgba(0, 212, 255, 0.3)'
        }
    }, [/* stat cards */]);
}
```

### 3. Feature Grid
```javascript
createFeatureGrid() {
    return ElementFactory.div({
        className: 'spark-features',
        style: {
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
        }
    }, [/* feature cards */]);
}
```

## Card Components

### Stat Card
```javascript
createStatCard(title, value, subtitle, icon) {
    return ElementFactory.div({
        className: 'spark-stat-card',
        style: {
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
        }
    }, [
        ElementFactory.div({ style: { fontSize: '24px' } }, [icon]),
        ElementFactory.h3({}, [title]),
        ElementFactory.div({ style: { fontSize: '18px', fontWeight: 'bold' } }, [value]),
        ElementFactory.div({ style: { fontSize: '10px', opacity: '0.7' } }, [subtitle])
    ]);
}
```

### Feature Card
```javascript
createFeatureCard(title, description, buttonText, clickHandler) {
    return ElementFactory.div({
        className: 'spark-feature-card',
        style: {
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease'
        },
        onmouseenter: function() {
            this.style.background = 'rgba(0, 212, 255, 0.1)';
            this.style.borderColor = '#00D4FF';
        },
        onmouseleave: function() {
            this.style.background = 'rgba(255, 255, 255, 0.05)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
    }, [
        // Card content
    ]);
}
```

## CSS Requirements
```css
/* Responsive grid system */
.responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: var(--space-md);
    width: 100%;
}

/* Stats grid */
.spark-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    padding: 20px;
}

/* Feature grid */
.spark-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    padding: 20px;
}

/* Card hover effects */
.spark-feature-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.spark-feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .spark-stats-grid,
    .spark-features {
        grid-template-columns: 1fr;
        gap: 10px;
        padding: 10px;
    }
}
```

## Grid Configuration Options

### Auto-Fit vs Auto-Fill
```javascript
// Auto-fit: Expands items to fill space
gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'

// Auto-fill: Maintains item size, leaves space
gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
```

### Responsive Breakpoints
```javascript
// Desktop: 3-4 columns
// Tablet: 2 columns  
// Mobile: 1 column
minmax(min(100%, 250px), 1fr)
```

## Usage Patterns

### Dashboard Stats
```javascript
// Create a stats dashboard
const statsGrid = createResponsiveGrid([
    createStatCard('Balance', '1.234 BTC', '$45,678', '₿'),
    createStatCard('24h Change', '+5.67%', '$2,345', '📈'),
    createStatCard('Portfolio', '5 Assets', 'Diversified', '💼'),
    createStatCard('Yield', '8.5% APY', 'Staking', '💰')
]);
```

### Feature Showcase
```javascript
// Feature cards for services
const features = createFeatureGrid([
    createFeatureCard('Send', 'Transfer Bitcoin instantly', 'Send Now', handleSend),
    createFeatureCard('Receive', 'Generate payment requests', 'Get Address', handleReceive),
    createFeatureCard('Exchange', 'Swap cryptocurrencies', 'Trade', handleExchange)
]);
```

## Accessibility
- **Semantic HTML**: Use appropriate heading levels
- **Keyboard Navigation**: Tab through cards
- **Focus Indicators**: Visible focus states
- **Screen Reader**: Descriptive labels and alt text
- **Touch Targets**: Minimum 44x44px on mobile

## Performance
- **CSS Grid**: Hardware accelerated
- **Lazy Loading**: Load card content on demand
- **Virtualization**: For large grids (100+ items)
- **Image Optimization**: Lazy load card images

## Best Practices
1. **Consistent Spacing**: Use CSS variables for gaps
2. **Responsive Design**: Test all breakpoints
3. **Hover States**: Subtle animations only
4. **Loading States**: Show skeletons while loading
5. **Empty States**: Handle no-data gracefully

## Mobile Considerations
- Stack cards vertically on small screens
- Increase touch targets for mobile
- Reduce padding on mobile for space
- Consider horizontal scrolling for certain grids
- Test on various device sizes

## Advanced Patterns
```javascript
// Masonry layout
.masonry-grid {
    column-count: 3;
    column-gap: 1rem;
}

// Asymmetric grid
.featured-grid {
    display: grid;
    grid-template-areas:
        "featured featured sidebar"
        "card1 card2 sidebar";
}

// Animated grid
.animated-grid > * {
    animation: fadeInUp 0.5s ease;
    animation-fill-mode: both;
}
```