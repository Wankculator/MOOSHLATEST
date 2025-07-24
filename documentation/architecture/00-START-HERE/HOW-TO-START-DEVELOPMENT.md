# 🚀 How to Start Development on MOOSH Wallet

## Prerequisites
- Node.js 18+ installed
- Git installed
- Terminal/Command Prompt
- Code editor (VS Code recommended)

## Quick Start

### 1. Clone and Setup
```bash
git clone [repository-url]
cd "MOOSH WALLET"
npm install
```

### 2. Start Both Servers
```bash
# Terminal 1 - API Server
cd src/server
npm install
npm start

# Terminal 2 - UI Server  
npm run dev
```

### 3. Access Wallet
Open browser to: http://localhost:8080

## Understanding the Project

### Architecture Overview
- **Monolithic Frontend** - Single 25k line JavaScript file
- **RESTful API Backend** - Node.js/Express server
- **Pure Vanilla JS** - No React/Vue/Angular
- **Terminal UI Theme** - Green-on-black aesthetic

### Key Files
1. `/public/js/moosh-wallet.js` - Entire frontend application
2. `/src/server/api-server.js` - Backend API server
3. `/docs/00-START-HERE/AI-START-HERE.md` - AI development guide

## Development Workflow

### Before Making Changes
1. Read `/docs/00-START-HERE/CLAUDE.md` for critical rules
2. Check current branch: `git branch`
3. Create feature branch: `git checkout -b feature-name`

### Finding Code
```bash
# Search for a component
grep -n "class ComponentName" public/js/moosh-wallet.js

# Find a function
grep -n "functionName" public/js/moosh-wallet.js

# List all classes
grep "^class " public/js/moosh-wallet.js
```

### Making Changes

#### Frontend Changes
1. Open `/public/js/moosh-wallet.js`
2. Use line numbers from grep to navigate
3. Follow existing patterns (no comments!)
4. Test in browser immediately

#### Backend Changes
1. Edit files in `/src/server/`
2. Server auto-restarts on save
3. Check logs: `api-server.log`

### Testing Your Changes
1. **Manual Testing** - Use the UI
2. **Console Debugging** - F12 in browser
3. **API Testing** - Use Postman/cURL

## Common Tasks

### Add New Feature
1. Find similar existing feature
2. Copy pattern exactly
3. Add to router if needed
4. Test thoroughly

### Fix a Bug
1. Read fix documentation in `/docs/01-architecture/`
2. Locate code using grep
3. Make minimal changes
4. Verify fix works

### Update UI
1. Find component in moosh-wallet.js
2. Update DOM generation
3. Check responsive behavior
4. Maintain terminal theme

## Important Rules

### DO NOT:
- Add comments to code
- Use external UI libraries
- Break the terminal theme
- Change core architecture
- Use TypeScript
- Add build steps

### ALWAYS:
- Test changes immediately
- Follow existing patterns
- Preserve terminal aesthetic
- Keep pure vanilla JS
- Update documentation

## Debugging Tips

### Frontend Debugging
```javascript
// Add temporary console logs
console.log('[ComponentName] Debug:', variable);

// Check state
console.log(app.state.get('key'));

// Inspect DOM
console.log(document.querySelector('.class'));
```

### Backend Debugging
```javascript
// Check request data
console.log('[API] Request:', req.body);

// Log responses
console.log('[API] Response:', response);
```

## Getting Help

### Documentation Structure
- `/docs/00-START-HERE/` - Quick starts and guides
- `/docs/01-architecture/` - Feature documentation
- `/docs/02-development/` - Dev workflows
- `/docs/archive/old-systems/` - Historical docs

### Key Documents
1. **AI-START-HERE.md** - Comprehensive AI guide
2. **MASTER_PROMPT.md** - Detailed context
3. **FEATURE-*.md** - Individual feature docs

### Emergency Procedures
See `/docs/05-deployment/EMERGENCY-RECOVERY.md`

## Current State

### Working Features
- Wallet generation (BIP39)
- Multi-account support
- Address generation (Legacy, SegWit, Taproot)
- Balance checking
- Ordinals display
- Theme switching

### Recently Fixed
- Send transactions (with password)
- Transaction history display
- Password security system

### Known Issues
- Error handling needs improvement
- Module warnings in console
- Some features are stubs

## Next Steps

### For New Developers
1. Generate a wallet and explore
2. Read architecture documents
3. Try fixing a small bug
4. Add a simple feature

### For AI Assistants
1. Always read CLAUDE.md first
2. Use grep/search before asking
3. Test changes immediately
4. Preserve all patterns

## Git Workflow

### Committing Changes
```bash
git add -A
git commit -m "🔧 Fix: Brief description

- Detail 1
- Detail 2

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### If Commit Fails
```bash
# Skip linting
git commit --no-verify -m "message"
```

## Server Commands

### Windows
- `scripts/batch/START_BOTH_SERVERS.bat`
- `scripts/batch/RESTART_API_NOW.bat`

### Linux/Mac
- `scripts/deployment/start-servers.sh`
- `scripts/unix/start-api.sh`

## Questions?
1. Check documentation first
2. Search codebase
3. Read error messages carefully
4. Check console logs

Remember: This is a working wallet handling real cryptocurrency. Always test thoroughly and never expose private keys!