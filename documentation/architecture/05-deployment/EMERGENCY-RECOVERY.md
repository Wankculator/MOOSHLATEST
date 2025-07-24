# 🚨 MOOSH Wallet Emergency Recovery Guide
## When Things Go Wrong - Quick Fixes & Recovery Procedures

### 🔥 CRITICAL: Emergency Commands

```bash
# PANIC BUTTON - Reset everything to working state
git reset --hard HEAD
taskkill /F /IM node.exe
START_BOTH_SERVERS.bat

# NUCLEAR OPTION - Reset to last known good commit
git reset --hard 7b831715d115a576ae1f4495d5140d403ace8213
```

---

## 🆘 Common Emergencies & Fixes

### 1. "I Broke The Monolith" 😱
**Symptoms**: Import errors, module not found, file splitting

**Fix**:
```bash
# 1. Revert the file split
git checkout -- public/js/moosh-wallet.js

# 2. If you created new files, delete them
del src\components\*.js
del src\services\*.js

# 3. Restart servers
START_BOTH_SERVERS.bat
```

### 2. "Nothing Loads - White Screen" 💀
**Symptoms**: Blank page, console errors, app undefined

**Fix**:
```javascript
// 1. Open browser console (F12)
// 2. Check for syntax errors
// 3. Look for the error line number

// Common fixes:
// - Missing closing bracket }
// - Missing comma in object
// - Typo in variable name
// - Wrong event handler syntax

// 4. Emergency patch in console:
window.app = new MooshWalletApp();
```

### 3. "Styles Are Broken" 🎨
**Symptoms**: Wrong colors, broken layout, no terminal theme

**Fix**:
```css
/* Add to browser console */
document.body.style.background = '#000000';
document.body.style.color = '#69fd97';
document.body.style.fontFamily = 'Courier New, monospace';

/* Check CSS variables */
:root {
  --color-primary: #69fd97;
  --color-bg-primary: #000000;
}
```

### 4. "API Not Responding" 🌐
**Symptoms**: Network errors, timeouts, 404s

**Fix**:
```bash
# 1. Check if API is running
curl http://localhost:3001/health

# 2. If not, check for port conflicts
netstat -ano | findstr :3001

# 3. Kill conflicting process
taskkill /F /PID [process_id]

# 4. Restart API
cd src\server
node api-server.js
```

### 5. "Lost My Seed/Wallet" 🔑
**Symptoms**: Wallet disappeared, can't find seed

**Fix**:
```javascript
// Check localStorage in browser console
localStorage.getItem('moosh_wallet_accounts');
localStorage.getItem('moosh_wallet_current');

// If empty, wallet was never saved (by design)
// This is a security feature, not a bug!
```

---

## 🛠️ Recovery Procedures

### Procedure 1: Full System Reset
```bash
# 1. Save any important changes
git stash

# 2. Reset to clean state
git reset --hard origin/ordinals-performance-fix

# 3. Clean everything
del /s *.log
rmdir /s /q node_modules

# 4. Reinstall
npm install

# 5. Start fresh
START_BOTH_SERVERS.bat

# 6. Apply your changes back
git stash pop
```

### Procedure 2: Database Reset (LocalStorage)
```javascript
// Run in browser console
// 1. Backup current data
const backup = {
  accounts: localStorage.getItem('moosh_wallet_accounts'),
  current: localStorage.getItem('moosh_wallet_current'),
  settings: localStorage.getItem('moosh_wallet_settings')
};
console.log('Backup:', backup);

// 2. Clear everything
localStorage.clear();

// 3. Reload page
location.reload();

// 4. Restore if needed
localStorage.setItem('moosh_wallet_accounts', backup.accounts);
```

### Procedure 3: Fix Corrupted State
```javascript
// If state is corrupted
app.stateManager.state = {};
app.stateManager.notifySubscribers();

// Reset to default state
app.stateManager.setState('wallet', {
  current: null,
  accounts: [],
  settings: {
    theme: 'dark',
    currency: 'USD'
  }
});

// Force UI refresh
app.router.navigate(app.router.currentPath);
```

---

## 🔍 Debugging Techniques

### 1. Console Debugging
```javascript
// Add strategic console logs
console.log('=== CHECKPOINT 1 ===');
console.log('State:', this.state);
console.log('===================');

// Use console.trace() to see call stack
console.trace('How did we get here?');

// Use console.table() for objects
console.table(walletData);
```

### 2. Breakpoint Debugging
```javascript
// Add debugger statement
function problematicFunction() {
  debugger; // Execution stops here
  // Step through code in DevTools
}

// Or set breakpoint in DevTools
// 1. Open DevTools (F12)
// 2. Go to Sources tab
// 3. Find moosh-wallet.js
// 4. Click line number to set breakpoint
```

### 3. Network Debugging
```javascript
// Override fetch to log all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('API Response:', response);
      return response;
    });
};
```

---

## 📋 Emergency Checklist

### Before Panicking, Check:
- [ ] Are both servers running? (API: 3001, UI: 3333)
- [ ] Any errors in browser console? (F12)
- [ ] Did you save the file?
- [ ] Did you refresh the browser? (Ctrl+F5)
- [ ] Is the syntax correct? (Missing brackets, commas)
- [ ] Are you on the right branch? (`git branch`)

### Quick Diagnostics
```javascript
// Run in browser console
console.log('App exists:', !!window.app);
console.log('Current page:', app.router.currentPath);
console.log('State:', app.stateManager.state);
console.log('Local Storage:', Object.keys(localStorage));
```

---

## 🏥 Recovery Tools

### Tool 1: State Inspector
```javascript
// Save as bookmark for quick access
javascript:(function(){
  console.group('MOOSH Wallet State');
  console.log('App:', window.app);
  console.log('State:', app.stateManager.state);
  console.log('Router:', app.router.currentPath);
  console.log('Storage:', localStorage);
  console.groupEnd();
})();
```

### Tool 2: Quick Fixes
```javascript
// Fix common issues
const QuickFix = {
  clearCache: () => {
    localStorage.clear();
    location.reload();
  },
  
  resetState: () => {
    app.stateManager.state = {};
    app.router.navigate('/');
  },
  
  forceRefresh: () => {
    app.currentPage = null;
    app.router.navigate(app.router.currentPath);
  },
  
  debugMode: () => {
    window.DEBUG = true;
    console.log('Debug mode enabled');
  }
};
```

---

## 📞 Getting Help

### Self-Help Resources
1. Check `AI-START-HERE.md`
2. Review `AI-DEVELOPMENT-MASTER-GUIDE.md`
3. Search in `moosh-wallet.js` for similar code
4. Check git history: `git log --oneline`

### Error Messages Decoder
```
"Cannot read property 'x' of undefined"
→ Object doesn't exist, check initialization

"unexpected token"
→ Syntax error, missing bracket or comma

"app is not defined"
→ Script didn't load, check for earlier errors

"CORS blocked"
→ API server not running or wrong port
```

---

## 🎯 Prevention Tips

1. **Commit often** - Easy to rollback
2. **Test small changes** - Don't write 500 lines without testing
3. **Use version control** - `git status` is your friend
4. **Keep backups** - Save working versions
5. **Document weird fixes** - Future you will thank you

---

## 🚀 Final Words

**Don't panic!** Every developer breaks things. The key is knowing how to fix them quickly. This guide has your back.

**Remember**: 
- The monolith is resilient
- Git can undo anything
- The terminal theme hides many sins
- When in doubt, restart everything

**You've got with!** 💚