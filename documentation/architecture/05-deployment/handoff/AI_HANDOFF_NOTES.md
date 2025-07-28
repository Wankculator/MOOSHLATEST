# 🤖 AI ASSISTANT HANDOFF NOTES
*Complete Context for Continuing MOOSH Wallet Development*

## 📍 Current Status & Location

### **Git Branch**: `feature/wallet-selection-terminal`
### **Server**: Running on `http://localhost:8080` via `node server.js`
### **Last Commit**: UI Design System v1.0 + Radio Button Implementation

---

## 🎯 Project Overview

**MOOSH Wallet** - Professional Bitcoin wallet application with Enhanced Build Rules v5.0
- **Architecture**: Node.js server with HTML/CSS/JS frontend
- **Design**: Terminal-style developer interface
- **Colors**: Black, Orange (#f57315), Dark Grey (#333333)
- **Font**: JetBrains Mono monospace throughout
- **Approach**: Mobile-first responsive design

---

## 🛡️ CRITICAL RULES - NEVER VIOLATE

### Enhanced Build Rules v5.0 (in `.cursorrules`)
1. **ASK_FIRST**: Never modify/delete files without explicit permission
2. **NO_ASSUMPTIONS**: If unclear, ask for clarification
3. **STEP_BY_STEP**: Build incrementally from current foundation
4. **PROFESSIONAL_ONLY**: Follow numbered folder structure
5. **SECURITY_FIRST**: Client-side only, no private keys on server
6. **MOBILE_FIRST**: Every feature mobile-optimized before desktop

### Folder Structure (MANDATORY)
```
01_COMPANY/     - Business documents
02_PRODUCT/     - Product specifications  
03_DEVELOPMENT/ - Development code
04_ASSETS/      - Brand assets, media
05_DOCUMENTATION/ - All documentation
06_OPERATIONS/  - Operations, monitoring
07_PARTNERSHIPS/ - Partnership docs
```

**ROOT LEVEL ONLY**: server.js, index.html, README.md, package.json, .cursorrules

---

## 🎨 UI Design System (ESTABLISHED)

### Color Palette
```css
--text-primary: #f57315     /* Orange - Primary actions, selected states */
--text-dim: #888888         /* Medium grey - Secondary text, labels */
--text-keyword: #69fd97bd   /* Green - Code highlights, success */
--border-color: #333333     /* Dark grey - Borders, subtle elements */
--background: #000000       /* Black - All backgrounds */
```

### Typography
- **Font**: `JetBrains Mono, monospace` (everywhere)
- **Scaling**: `calc(size * var(--scale-factor))` for responsive design
- **Mobile Factor**: `--scale-factor: 0.85` on mobile, `1.0` on desktop

### Component Standards
**Radio Buttons** (PERFECTED):
- Circle: 10px, 1px border #333333, black background
- Inner dot: 4px orange when selected, transparent when not
- Text: 9px, font-weight 500, orange color
- Position: `top: 4px; right: 8px;` in terminal box

**Buttons**:
- Black background, 2px orange border
- Orange text, uppercase, letter-spacing 0.1em
- Hover: Orange background, black text

---

## 🏗️ Current Implementation

### Server Architecture
- **File**: `server.js` (main server file)
- **Port**: 8080
- **Features**: Static file serving, wallet interface
- **Status**: Fully functional

### Interface Components
1. **Header**: Brand logo + navigation
2. **Main Title**: MOOSH WALLET with logo
3. **Address Types**: `< Spark Protocol • Taproot • Native SegWit • Nested SegWit • Legacy />`
4. **Network Toggle**: MAINNET/TESTNET switch (top right)
5. **Terminal Box**: Spark-ready code display
6. **Radio Buttons**: 12/24 Word Mnemonic selector (PERFECTED)
7. **Security Section**: Password creation form
8. **Action Buttons**: Create Wallet / Import Wallet

### Recent Achievements
- ✅ Perfect radio button implementation
- ✅ Proper positioning in terminal box corner
- ✅ Dark grey borders (#333333, 1px)
- ✅ Orange text labels
- ✅ Professional spacing and alignment
- ✅ Complete UI design system documentation
- ✅ **ENHANCED MOBILE OPTIMIZATION v5.0** - Professional dynamic scaling
- ✅ **DYNAMIC SCALING PLAN v5.0** - Comprehensive mobile-first standards
- ✅ **44px+ Touch Targets** - Perfect mobile accessibility
- ✅ **Responsive Typography** - All text scales perfectly across devices

---

## 📋 Current TODO List

### Completed Tasks
- ✅ Analyze reference build features
- ✅ Extract core wallet features  
- ✅ Rebuild wallet creation and management system

### Pending Tasks (Priority Order)
1. **implement-multi-account**: Multi-account wallet system
2. **add-bitcoin-integration**: Real Bitcoin address generation/validation
3. **implement-ordinals**: Bitcoin Ordinals/NFT viewing capabilities
4. **add-payment-system**: Bitcoin and Lightning payment system
5. **optimize-mobile**: Mobile-first experience optimization
6. **add-security**: Encrypted storage and security features

---

## 🎯 Next Development Steps

### Immediate Priorities
1. **Multi-Account System**: Implement wallet account management
2. **Bitcoin Integration**: Add real address generation (sp1..., bc1p..., etc.)
3. **Mobile Optimization**: Enhance responsive design further

### Development Approach
- Follow step-by-step enhancement methodology
- Use existing UI design system components
- Maintain professional terminal aesthetic
- Test on mobile first, then desktop

---

## 🔧 Technical Details

### Key Files
- `server.js`: Main application server
- `05_DOCUMENTATION/UI_DESIGN_SYSTEM.md`: Complete design standards
- `.cursorrules`: Enhanced Build Rules v5.0
- `04_ASSETS/Brand_Assets/Logos/Moosh_logo.png`: Brand logo

### Development Environment
- **OS**: Windows 10
- **Shell**: PowerShell 7
- **Node.js**: Server running on localhost:8080
- **Git**: Feature branch `feature/wallet-selection-terminal`

### Logo Integration
- Path: `04_ASSETS/Brand_Assets/Logos/Moosh_logo.png`
- Usage: Header and main title
- Fallback: `onerror="this.style.display='none'"`

---

## 🚨 User Preferences & Requirements

### Design Expectations
- **Professional terminal aesthetic** (like developer tools)
- **Mobile-first approach** (always optimize mobile before desktop)
- **Consistent color usage** (black, orange, dark grey only)
- **Clean typography** (JetBrains Mono throughout)
- **Precise positioning** (user is very particular about alignment)

### Communication Style
- User expects **immediate implementation** of changes
- **Show, don't tell** - implement first, explain after
- **Step-by-step building** from current foundation
- **Ask permission** before major structural changes

### Quality Standards
- **Pixel-perfect positioning** required
- **Consistent sizing** across all components
- **Professional spacing** and alignment
- **Responsive design** that works on all devices

---

## 🎨 Visual Reference

### Current Interface State
```
┌─────────────────────────────────────────────────────────┐
│ ~/moosh/wallet.ts                    <Token Site />     │
├─────────────────────────────────────────────────────────┤
│                   🐭 MOOSH WALLET                       │
│              Moosh.money Spark Bitcoin wallet           │
│    < Spark Protocol • Taproot • Native SegWit... />    │
│                                           [+] MAINNET   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ~/moosh/spark-wallet $ spark-ready ●    < Select   │ │
│ │ # MOOSH Spark Protocol Wallet           Security   │ │
│ │ import { SparkWallet } from "..."        Seed />   │ │
│ │ const wallet = await SparkWallet...      ⚫ 12 Word │ │
│ │ # Real sp1... addresses + Bitcoin L2     ⚪ 24 Word │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Moosh Wallet Security ─────────────────────────────┐ │
│ │ <Create a secure password to protect wallet access/> │
│ │ [Password Input Fields]                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [<CREATE WALLET/>]  [<IMPORT WALLET/>]                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Success Criteria

### For Next AI Assistant
1. **Read this document completely** before starting
2. **Follow Enhanced Build Rules v5.0** exactly
3. **Use established UI design system** components
4. **Ask permission** before major changes
5. **Implement incrementally** from current state
6. **Test mobile-first** always
7. **Maintain professional quality** standards

### Key Success Metrics
- Zero violations of Enhanced Build Rules
- Consistent use of design system colors/typography
- Mobile-responsive implementation
- Professional terminal aesthetic maintained
- User satisfaction with implementation speed

---

## 📞 Emergency Protocols

### If Server Won't Start
```bash
cd "C:\Users\sk84l\OneDrive\Desktop\MOOSH WALLET"
node server.js
```

### If Git Issues
- Current branch: `feature/wallet-selection-terminal`
- Remote: `origin`
- Always commit before major changes

### If Design System Questions
- Reference: `05_DOCUMENTATION/UI_DESIGN_SYSTEM.md`
- Colors: Orange (#f57315), Dark Grey (#333333), Black (#000000)
- Font: JetBrains Mono everywhere
- Scaling: Use `calc(size * var(--scale-factor))`

---

## 🎯 Final Notes

This project represents **hours of careful refinement** to achieve the current professional state. The user has very high standards for:

1. **Visual consistency** and professional appearance
2. **Mobile-first responsive design** 
3. **Precise positioning** and alignment
4. **Clean, terminal-style aesthetic**
5. **Incremental, step-by-step development**

**The radio button implementation is PERFECT** - use it as a reference for future components. The UI design system is comprehensive and should guide all future development.

**Always ask permission before major changes. Build incrementally. Test mobile-first. Maintain professional quality.**

---

*Handoff completed: 2025-01-02*
*Next AI: You have everything needed to continue professional development*
*Good luck! 🚀* 