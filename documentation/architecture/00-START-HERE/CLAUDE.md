# 🤖 CLAUDE.md - Quick Context for Claude AI
## Essential MOOSH Wallet Development Context

**Hey Claude!** You're working on MOOSH Wallet. Here's what you need to know:

### 🎯 Project Overview
- **Bitcoin & Spark Protocol wallet** with terminal UI (green/black theme)
- **ONE JavaScript file**: `public/js/moosh-wallet.js` (24,951 lines)
- **NO frameworks**: Pure vanilla JS only (no React/Vue/Angular)
- **Current branch**: `ordinals-performance-fix`

### 📁 Key Files to Read
1. **Start Here**: `/AI-START-HERE.md` - Complete AI guide
2. **Architecture**: `/MOOSH-WALLET-PROFESSIONAL-DOCS/COMPLETE-ARCHITECTURE-BLUEPRINT.md`
3. **Implementation**: `/docs/COMPLETE_WALLET_IMPLEMENTATION_GUIDE.md`
4. **AI Rules**: `/MOOSH-WALLET-PROFESSIONAL-DOCS/AI-DEVELOPMENT-MASTER-GUIDE.md`

### ⚠️ Critical Rules
```javascript
// NEVER DO:
import/export          // No ES6 modules
React/JSX             // No frameworks
Split files           // Keep monolith
Modern syntax         // Use traditional JS

// ALWAYS DO:
ElementFactory.create()     // For DOM
Return HTML strings         // From render()
Terminal colors only        // Green/black
One file architecture       // Don't split
```

### 🚀 Current Status
- ✅ Working: Wallet generation, import, balances, Ordinals
- ❌ TODO: Send transactions, TX history, password features

### 💡 Quick Commands
```bash
# Start servers
START_BOTH_SERVERS.bat

# Access points
UI: http://localhost:3333
API: http://localhost:3001
```

**Full details in `/AI-START-HERE.md`** - Read it for complete context!