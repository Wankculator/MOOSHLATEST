# UI Components Index

**Last Updated**: 2025-07-21
**Purpose**: Complete index of all UI components and sections in MOOSH Wallet

## 🎯 Component Categories

### Core Layout Components
1. **[Header](./Header.md)** - Main application header with navigation
2. **[NavigationBar](./NavigationBar.md)** - Primary navigation system
3. **[Footer](./Footer.md)** - Application footer with links and info

### Display Components
4. **[BalanceDisplaySection](./BalanceDisplaySection.md)** - Wallet balance visualization
5. **[TransactionList](./TransactionList.md)** - Transaction history display
6. **[DashboardSections](./DashboardSections.md)** - Main dashboard layout
7. **[AccountDropdown](./AccountDropdown.md)** - Multi-account selector

### Overlay & Modal Components
8. **[NotificationSystem](./NotificationSystem.md)** - Toast notifications
9. **[WalletLockOverlay](./WalletLockOverlay.md)** - Security lock screen
10. **[ModalOverlay](./ModalOverlay.md)** - Base modal system

### Status & Feedback Components
11. **[LoadingIndicator](./LoadingIndicator.md)** - Loading states
12. **[StatusIndicator](./StatusIndicator.md)** - Connection/sync status
13. **[ErrorDisplay](./ErrorDisplay.md)** - Error message display
14. **[EmptyStates](./EmptyStates.md)** - No data displays

### Layout Systems
15. **[TabSystem](./TabSystem.md)** - Tab navigation
16. **[GridAndCardLayouts](./GridAndCardLayouts.md)** - Responsive grids
17. **[DetailRow](./DetailRow.md)** - Key-value display rows

## 📊 Component Matrix

| Component | Mobile | Theme | Accessibility | Performance |
|-----------|--------|-------|---------------|-------------|
| Header | ✅ | ✅ | ✅ | Optimized |
| NavigationBar | ✅ | ✅ | ✅ | Optimized |
| Footer | ✅ | ✅ | ✅ | Static |
| BalanceDisplay | ✅ | ✅ | ✅ | Real-time |
| TransactionList | ✅ | ✅ | ✅ | Virtualized |
| DashboardSections | ✅ | ✅ | ✅ | Lazy loaded |
| AccountDropdown | ✅ | ✅ | ✅ | On-demand |
| NotificationSystem | ✅ | ✅ | ✅ | Auto-dismiss |
| WalletLockOverlay | ✅ | ✅ | ✅ | Blocking |
| ModalOverlay | ✅ | ✅ | ✅ | On-demand |
| LoadingIndicator | ✅ | ✅ | ✅ | Minimal |
| StatusIndicator | ✅ | ✅ | ✅ | CSS only |
| ErrorDisplay | ✅ | ✅ | ✅ | Auto-dismiss |
| EmptyStates | ✅ | ✅ | ✅ | Static |
| TabSystem | ✅ | ✅ | ✅ | Instant |
| GridAndCardLayouts | ✅ | ✅ | ✅ | CSS Grid |
| DetailRow | ✅ | ✅ | ✅ | Static |

## 🔧 Common Patterns

### State Management
- All components use the central `SparkStateManager`
- Real-time updates via event listeners
- No component-specific state stores

### Styling Approach
- Inline styles with CSS variables
- Responsive using `calc()` and `clamp()`
- Dark/Light theme support via CSS classes

### Mobile Optimization
- Touch-friendly targets (min 44px)
- Responsive typography
- Reduced animations on mobile
- Optimized for viewport changes

### Accessibility Standards
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly

### Performance Strategies
- Lazy loading for heavy content
- CSS animations (GPU accelerated)
- Minimal DOM manipulation
- Event delegation where possible

## 🚀 Usage Guidelines

### Creating New Components
1. Follow existing patterns (see similar components)
2. Use `ElementFactory` for DOM creation
3. Support both themes from the start
4. Test on mobile devices
5. Add proper documentation

### Component Integration
```javascript
// Example: Adding a new dashboard section
class CustomSection extends Component {
    render() {
        const $ = window.ElementFactory || ElementFactory;
        return $.div({ className: 'custom-section' }, [
            this.createHeader(),
            this.createContent(),
            this.createFooter()
        ]);
    }
}
```

### Best Practices
1. **Consistency** - Match existing UI patterns
2. **Responsiveness** - Test all screen sizes
3. **Accessibility** - Include keyboard support
4. **Performance** - Profile before shipping
5. **Documentation** - Update this index

## 📱 Mobile-First Considerations

### Breakpoints
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px
- Small mobile: < 360px

### Touch Interactions
- Swipe gestures for modals
- Touch-friendly button sizes
- Hover states disabled on touch
- Optimized scrolling performance

## 🎨 Theme System

### CSS Variables
- `--bg-primary`: Main background
- `--bg-secondary`: Card backgrounds
- `--text-primary`: Main text color
- `--text-dim`: Secondary text
- `--text-accent`: Highlight color
- `--border-color`: Border colors

### Theme Classes
- `.moosh-mode`: Green theme
- `.original-mode`: Orange theme
- Applied to `document.body`

## 🔍 Component Location Reference

All components are in `/public/js/moosh-wallet.js`:
- Header: Lines 1000-1500
- Navigation: Lines 1500-2000
- Notifications: Lines 31446-31497
- Lock Screen: Lines 4050-4300
- Modals: Lines 6158-6191, 10927-10947
- And more...

## 📝 Documentation Standards

Each component doc includes:
1. Visual representation (ASCII)
2. Structure breakdown
3. Implementation examples
4. CSS requirements
5. Accessibility notes
6. Performance considerations
7. Mobile optimizations
8. Connected components

## 🤝 Contributing

When adding new UI components:
1. Create component following patterns
2. Add comprehensive documentation
3. Update this index
4. Test on all platforms
5. Submit PR with screenshots

---

This index serves as the primary reference for all UI components in MOOSH Wallet. Keep it updated as new components are added or existing ones are modified.