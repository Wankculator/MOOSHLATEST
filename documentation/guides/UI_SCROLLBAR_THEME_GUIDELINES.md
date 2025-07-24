# 🎨 MOOSH Wallet UI Scrollbar & Theme Guidelines

## 📜 Scrollbar Styling Requirements

### ✅ CRITICAL: All Scrollbars Must Match Theme

**NEVER** use default browser scrollbars (white/grey). All scrollable elements MUST implement custom scrollbar styling that matches the current theme.

### 🎨 Theme Detection

```javascript
// Always check current theme mode
const isMooshMode = document.body.classList.contains('moosh-mode');
const themeColor = isMooshMode ? '#69fd97' : '#f57315';
```

### 📐 Scrollbar Implementation Template

```javascript
// For any scrollable element, add these styles:
const styleId = 'unique-scrollbar-styles-id';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        #your-element-id::-webkit-scrollbar {
            width: 8px;
        }
        #your-element-id::-webkit-scrollbar-track {
            background: #000;
            border-left: 1px solid ${themeColor};
        }
        #your-element-id::-webkit-scrollbar-thumb {
            background: ${themeColor};
            border-radius: 0;
        }
        #your-element-id::-webkit-scrollbar-thumb:hover {
            background: ${isMooshMode ? '#7fffb3' : '#ff8c42'};
        }
        
        /* Firefox scrollbar */
        #your-element-id {
            scrollbar-width: thin;
            scrollbar-color: ${themeColor} #000;
        }
    `;
    document.head.appendChild(style);
}
```

### 🧹 Cleanup Requirements

Always remove custom scrollbar styles when the element is removed:

```javascript
const styleEl = document.getElementById(styleId);
if (styleEl) styleEl.remove();
```

## 🎨 Theme Color Reference

### Original Mode (Orange Theme)
- Primary: `#f57315`
- Hover: `#ff8c42`
- Background: `#000`
- Border: `#333`

### Moosh Mode (Green Theme)
- Primary: `#69fd97`
- Hover: `#7fffb3`
- Background: `#000`
- Border: `#232b2b`

## 📋 Implementation Checklist

When creating ANY scrollable UI element:

- [ ] Detect current theme mode
- [ ] Apply custom scrollbar styles
- [ ] Use theme-appropriate colors
- [ ] Include Firefox compatibility
- [ ] Add cleanup on element removal
- [ ] Test in both theme modes

## 🚫 Common Mistakes to Avoid

1. **DON'T** hardcode orange colors - always check theme
2. **DON'T** forget Firefox scrollbar support
3. **DON'T** leave orphaned style elements after cleanup
4. **DON'T** use rounded scrollbar thumbs (border-radius: 0)
5. **DON'T** make scrollbars too wide (8px is standard)

## 📝 Example: Currency Dropdown Implementation

See `/public/js/moosh-wallet.js` - `showCurrencyDropdown()` method (line ~28932) for a complete reference implementation that:
- Detects theme dynamically
- Applies proper scrollbar styling
- Handles cleanup correctly
- Supports both Webkit and Firefox

## 🔧 Testing Requirements

Before committing any scrollable element:
1. Test in Original mode (orange)
2. Test in Moosh mode (green)
3. Test scrollbar visibility and styling
4. Test in Chrome/Safari (Webkit)
5. Test in Firefox
6. Verify cleanup removes styles

---

**Remember**: Consistency is key! Every scrollbar in the wallet should follow these guidelines to maintain the professional terminal aesthetic.