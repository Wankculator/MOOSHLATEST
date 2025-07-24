# 🔄 MOOSH Wallet Development Workflows
## Common Development Scenarios & Best Practices

### 📋 Table of Contents
1. [Daily Development Workflow](#daily-development-workflow)
2. [Adding New Features](#adding-new-features)
3. [Fixing Bugs](#fixing-bugs)
4. [Performance Optimization](#performance-optimization)
5. [Security Updates](#security-updates)
6. [Code Review Process](#code-review-process)
7. [Emergency Procedures](#emergency-procedures)
8. [AI Development Workflow](#ai-development-workflow)

---

## 🌅 Daily Development Workflow

### Morning Startup Routine
```bash
# 1. Pull latest changes
git pull origin ordinals-performance-fix

# 2. Check system status
node -v  # Should be 18+
npm -v   # Should be 8+

# 3. Install any new dependencies
npm install

# 4. Start development servers
START_BOTH_SERVERS.bat

# 5. Verify services are running
curl http://localhost:3001/health
curl http://localhost:3333
```

### Before Starting Work
1. **Check current TODOs** in moosh-wallet.js
2. **Review recent commits** for context
3. **Test current functionality** to ensure nothing is broken
4. **Read relevant documentation** for your task

### During Development
```javascript
// 1. Make changes in the correct section
// Lines 1-5000: Utilities
// Lines 5001-10000: Services  
// Lines 10001-20000: Components
// Lines 20001-24951: App

// 2. Test frequently in browser console
console.log('Testing component:', app.currentPage);

// 3. Check for errors
// Open DevTools Console (F12)
// Look for red errors

// 4. Verify terminal styling maintained
// Should see green on black everywhere
```

### End of Day Checklist
- [ ] All console.logs removed
- [ ] Code follows existing patterns
- [ ] Terminal theme maintained
- [ ] No forbidden patterns used
- [ ] Changes tested in browser
- [ ] Commit with clear message

---

## 🚀 Adding New Features

### Feature Planning Template
```markdown
## Feature: [Feature Name]
### Description
What does this feature do?

### Requirements
- [ ] User stories defined
- [ ] UI mockups created
- [ ] API endpoints designed
- [ ] Security considerations
- [ ] Performance impact assessed

### Implementation Plan
1. Backend changes needed
2. Frontend components to add
3. State management updates
4. Testing requirements
```

### Implementation Workflow

#### Step 1: Backend First
```javascript
// 1. Add to API server (src/server/api-server.js)
app.post('/api/wallet/new-feature', async (req, res) => {
  try {
    const result = await walletService.newFeature(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Implement in service (src/server/services/walletService.js)
async function newFeature(params) {
  // Validate inputs
  if (!params.required) {
    throw new Error('Missing required parameter');
  }
  
  // Implement logic
  const result = await processFeature(params);
  
  return result;
}
```

#### Step 2: Frontend Integration
```javascript
// 1. Find the right location in moosh-wallet.js
// 2. Add new component (following patterns)
class NewFeatureModal extends Component {
  constructor() {
    super();
    this.state = { /* ... */ };
  }
  
  render() {
    return `
      <div class="new-feature-modal">
        <!-- HTML content -->
      </div>
    `;
  }
}

// 3. Integrate with existing pages
class DashboardPage {
  showNewFeature() {
    const modal = new NewFeatureModal();
    modal.show();
  }
}
```

#### Step 3: Testing
```bash
# 1. Test API endpoint
curl -X POST http://localhost:3001/api/wallet/new-feature \
  -H "Content-Type: application/json" \
  -d '{"required": "value"}'

# 2. Test UI in browser
# - Click through all flows
# - Check console for errors
# - Verify styling matches

# 3. Test edge cases
# - Invalid inputs
# - Network failures
# - Empty states
```

---

## 🐛 Fixing Bugs

### Bug Investigation Process

#### 1. Reproduce the Bug
```javascript
// Document exact steps
1. Go to http://localhost:3333
2. Click "Create Wallet"
3. Wait for generation
4. Click "Send" - BUG: Nothing happens

// Check console for errors
// Take screenshots if UI bug
```

#### 2. Locate the Problem
```javascript
// Search strategies
// 1. Search for UI text
grep -n "Send" public/js/moosh-wallet.js

// 2. Search for function names
grep -n "handleSend\|sendTransaction" public/js/moosh-wallet.js

// 3. Check event handlers
// Look for onclick="..." in the area
```

#### 3. Fix Pattern
```javascript
// Before fixing, understand:
// 1. Why did it break?
// 2. What's the correct pattern?
// 3. Are there similar bugs?

// Common fixes:

// Fix 1: Binding issue
constructor() {
  this.handleSend = this.handleSend.bind(this); // Add this
}

// Fix 2: Missing implementation
handleSend() {
  // TODO: Implement send logic
  NotificationService.info('Send feature coming soon!');
}

// Fix 3: Wrong event handler
// Change from: onClick={this.handleSend}
// To: onclick="app.currentPage.handleSend()"
```

---

## ⚡ Performance Optimization

### Performance Checklist
- [ ] Minimize API calls (use caching)
- [ ] Debounce user inputs
- [ ] Lazy load heavy components
- [ ] Optimize loops and iterations
- [ ] Remove unnecessary re-renders

### Common Optimizations

#### 1. API Response Caching
```javascript
class CachedAPIService extends APIService {
  constructor() {
    super();
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
  }
  
  async get(endpoint, options = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    
    const response = await super.get(endpoint, options);
    
    this.cache.set(cacheKey, {
      data: response,
      expires: Date.now() + this.cacheTimeout
    });
    
    return response;
  }
}
```

#### 2. Debouncing User Input
```javascript
class SearchComponent {
  constructor() {
    this.searchDebounced = this.debounce(this.search, 300);
  }
  
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}
```

---

## 🔒 Security Updates

### Security Review Process
1. **Identify sensitive operations**
   - Key generation
   - Private key handling
   - Transaction signing
   - API communications

2. **Apply security patterns**
```javascript
// Pattern 1: Never log sensitive data
function generateWallet() {
  const wallet = createWallet();
  console.log('Wallet generated'); // OK
  // console.log('Wallet:', wallet); // NEVER!
  return wallet;
}

// Pattern 2: Validate all inputs
function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address');
  }
  
  const patterns = {
    bitcoin: /^[13bc][\w]{25,62}$/,
    spark: /^sp1p[\w]{62}$/
  };
  
  const isValid = Object.values(patterns).some(p => p.test(address));
  if (!isValid) {
    throw new Error('Invalid address format');
  }
  
  return true;
}

// Pattern 3: Sanitize user inputs
function sanitizeInput(input) {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}
```

---

## 👀 Code Review Process

### Self-Review Checklist
Before committing:
- [ ] Code follows monolithic structure
- [ ] No imports/exports used
- [ ] Terminal styling maintained
- [ ] Event handlers use correct pattern
- [ ] No console.logs in production
- [ ] Security best practices followed
- [ ] Error handling in place
- [ ] Code is readable and clear

### Commit Message Format
```bash
# Format: <type>: <description>

# Types:
feat: New feature
fix: Bug fix
perf: Performance improvement
security: Security update
docs: Documentation only
refactor: Code restructuring
test: Adding tests
style: Formatting only

# Examples:
git commit -m "feat: Add multi-signature wallet support"
git commit -m "fix: Send transaction button not responding"
git commit -m "perf: Cache ordinals API responses"
git commit -m "security: Sanitize address inputs"
```

---

## 🚨 Emergency Procedures

### When You Break Everything

#### 1. Don't Panic!
```bash
# Check what changed
git status
git diff

# If really broken, reset to last commit
git reset --hard HEAD

# Or reset to specific working commit
git reset --hard 7b831715d115a576ae1f4495d5140d403ace8213
```

#### 2. Restore Working State
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Clear any corrupted state
localStorage.clear()  # Run in browser console

# Restart servers
START_BOTH_SERVERS.bat
```

#### 3. Debug Systematically
```javascript
// Add debug logging
console.log('=== DEBUG: Component init ===');
console.log('State:', this.state);
console.log('Config:', this.config);

// Use browser debugger
debugger; // Execution will pause here

// Check specific issues
if (!window.app) {
  console.error('App not initialized!');
}
```

---

## 🤖 AI Development Workflow

### Starting AI Development Session

#### 1. Provide Context
```markdown
"I'm working on MOOSH Wallet. Please read AI-START-HERE.md first."

Key points:
- Single file: moosh-wallet.js (24,951 lines)
- No frameworks (vanilla JS only)
- Terminal UI (green/black)
- Current task: [describe task]
```

#### 2. Verify AI Understanding
Ask the AI to confirm:
- No imports/exports will be used
- ElementFactory for DOM creation
- Terminal color scheme
- Event handler patterns

#### 3. Review AI Code
```javascript
// Check for forbidden patterns
const forbidden = [
  'import', 'export', 'React', 'Vue',
  '=>', '...', '?.', '??'
];

// Verify correct patterns
const required = [
  'ElementFactory.create',
  'onclick="app.',
  'var(--color-primary)'
];
```

#### 4. Test AI Changes
1. Copy AI code to correct location
2. Save and refresh browser
3. Check console for errors
4. Test functionality
5. Verify styling maintained

---

## 📊 Metrics to Track

### Development Metrics
- **Lines changed per commit**: Keep small
- **Time to implement feature**: Track for estimates
- **Bugs per feature**: Identify problem areas
- **Performance impact**: Before/after measurements

### Quality Metrics
- **Console errors**: Should be zero
- **Load time**: Under 3 seconds
- **API response time**: Under 500ms
- **Memory usage**: Monitor for leaks

---

## 🎯 Best Practices Summary

1. **Always work in the monolith** - Don't split files
2. **Test frequently** - Every 10-15 minutes
3. **Follow patterns exactly** - Don't innovate on basics
4. **Security first** - Every line matters
5. **Document complex logic** - Future you will thank you
6. **Commit often** - Small, focused commits
7. **Ask for help** - Check docs, ask AI, review code

---

**Remember: MOOSH Wallet is a carefully crafted monolith. Respect the patterns, maintain the aesthetic, and build amazing features!**