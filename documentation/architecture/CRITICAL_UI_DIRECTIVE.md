# 🚨 CRITICAL: MOOSH WALLET UI DIRECTIVE

## ⛔ NEVER CREATE NEW UI FILES

### THE OFFICIAL MOOSH WALLET UI:
```
📍 Location: /public/js/moosh-wallet.js
📍 Entry: /public/index.html
📍 Server: src/server/server.js (port 3333)
📍 URL: http://localhost:3333
```

## 🎯 THIS IS THE ONLY UI - DO NOT CREATE ALTERNATIVES

### Current UI Structure:
- **12,441 lines** of professional code
- **Single Page Application** built in vanilla JavaScript
- **Dynamic UI generation** - no static HTML dashboards
- **Professional architecture** with modular components

### UI Features (Already Built):
✅ Landing page with gradient animations  
✅ Dashboard with wallet management  
✅ Send/Receive/Swap modals  
✅ Settings with theme toggle  
✅ MOOSH mode (purple/green theme)  
✅ Mobile-responsive design  
✅ Terminal/code aesthetic  
✅ Real wallet integration  

## ❌ DO NOT:
- Create new HTML files with inline wallets
- Make "simple" test UIs
- Build alternative dashboards
- Create duplicate implementations
- Make "quick demo" versions

## ✅ DO:
- Use ONLY `/public/js/moosh-wallet.js`
- Modify existing code following the patterns
- Maintain the professional architecture
- Follow the established design system
- Keep the terminal aesthetic

## 📋 Development Rules:

### 1. **UI Modifications**
- Edit `/public/js/moosh-wallet.js` ONLY
- Follow existing code patterns
- Maintain modular structure
- Use existing components

### 2. **Design System**
- Background: #000000 (pure black)
- Primary: #f57315 (MOOSH orange)
- Font: JetBrains Mono
- Sharp corners (border-radius: 0)
- Mobile-first responsive

### 3. **Architecture**
- Single Page Application
- Dynamic UI generation
- Event-driven updates
- State management system

## 🔧 How to Work with the UI:

### To modify features:
1. Open `/public/js/moosh-wallet.js`
2. Find the relevant class/component
3. Make changes following existing patterns
4. Test at http://localhost:3333

### To add features:
1. Create new methods in existing classes
2. Use the established component system
3. Follow the event bus pattern
4. Maintain responsive design

## 📝 Reference Documentation:
- `/docs/development/ENHANCED_BUILD_RULES_v5.md`
- `/docs/development/WALLET_DEVELOPMENT_DIRECTIVE.md`
- `/docs/MODULE_STRUCTURE.md`
- `/05_DOCUMENTATION/MOBILE_FIRST_UI_DEVELOPMENT_GUIDE.md`

## 🚫 FINAL WARNING:
**Any AI, developer, or contributor MUST use the existing UI at `/public/js/moosh-wallet.js`. Creating new UI files is STRICTLY FORBIDDEN. This is a professional project with established architecture.**

---
**Last Updated**: ${new Date().toISOString()}
**UI Version**: Real Wallet Implementation Branch
**Status**: PRODUCTION READY - DO NOT REPLACE