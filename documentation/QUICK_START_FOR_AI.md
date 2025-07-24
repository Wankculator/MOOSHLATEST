# Quick Start Guide for AI Development on MOOSH Wallet

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Time to Productivity**: 5 minutes

## 🚀 Start Here - The 5-Minute Guide

### Step 1: Understand What You're Working With
- **Project**: MOOSH Wallet - Professional Bitcoin/Spark Protocol wallet
- **Codebase**: 33,000+ lines of JavaScript
- **Architecture**: Dual-server (UI + API), non-custodial wallet
- **Key Features**: Multi-wallet, Ordinals, Spark Protocol integration

### Step 2: Know the Critical Rules
```bash
# ALWAYS run before starting work:
npm run mcp:validate-all

# NEVER modify these without reading docs:
- Seed generation endpoints
- Cryptographic functions
- API response structures
```

### Step 3: Quick Navigation Map
```
Need to understand architecture? → /documentation/architecture/
Need to find a component? → /documentation/components/
Need to fix something? → /documentation/testing/
Need API info? → /documentation/components/api/
```

## 📍 Essential Documents (Read These First!)

### Priority 1 - Critical Rules
1. [`CLAUDE.md`](../CLAUDE.md) - **MANDATORY** development rules
2. [`SEED_GENERATION_CRITICAL_PATH.md`](./architecture/SEED_GENERATION_CRITICAL_PATH.md) - Never break seed generation
3. [`CRITICAL_UI_DIRECTIVE.md`](./architecture/CRITICAL_UI_DIRECTIVE.md) - UI implementation rules

### Priority 2 - Architecture Understanding
1. [`AI-START-HERE.md`](./architecture/00-START-HERE/AI-START-HERE.md) - Complete AI guide
2. [`COMPLETE-ARCHITECTURE-BLUEPRINT.md`](./architecture/01-architecture/COMPLETE-ARCHITECTURE-BLUEPRINT.md) - System design
3. [`COMPONENT_RELATIONSHIP_MAP.md`](./components/COMPONENT_RELATIONSHIP_MAP.md) - How components connect

### Priority 3 - Implementation Guides
1. [`DEVELOPER_GUIDE.md`](./architecture/02-development/DEVELOPER_GUIDE.md) - Development handbook
2. [`ERROR_PREVENTION_IMPLEMENTATION_GUIDE.md`](./development/ERROR_PREVENTION_IMPLEMENTATION_GUIDE.md) - Avoid common mistakes

## 🎯 Common Tasks - Quick Reference

### "I need to add a new button"
```bash
1. Check existing buttons: /documentation/components/buttons/
2. Follow pattern from similar button
3. Use ElementFactory: $.button({ className: 'my-button' })
4. Run MCP validation: npm run mcp:validate-all
```

### "I need to fix a bug"
```bash
1. Check bug reports: /documentation/testing/BUG-REPORT-AND-FIXES.md
2. Find related component: /documentation/components/
3. Test the fix: npm test
4. Validate: npm run mcp:validate-all
```

### "I need to add an API endpoint"
```bash
1. Check API docs: /documentation/components/api/api-endpoints.md
2. Add to api-server.js
3. Add service if needed: /src/server/services/
4. Update documentation
5. Test with curl
```

### "I need to modify the UI"
```bash
1. Find component: /documentation/components/
2. Use ElementFactory patterns
3. Follow CRITICAL_UI_DIRECTIVE.md
4. Test responsiveness
5. Run TestSprite: npm test
```

## ⚡ Speed Tips for AI Development

### 1. Use Multiple File Operations
```javascript
// Good - Edit multiple files at once
- Edit moosh-wallet.js for UI
- Edit api-server.js for backend
- Update documentation
// All in one operation
```

### 2. Always Run MCP Validations
```bash
# Before starting
npm run mcp:validate-all

# During development (keep running)
npm run mcp:watch

# Before committing
npm run mcp:final-check
```

### 3. Follow Existing Patterns
- **Don't reinvent**: Check similar components first
- **Use ElementFactory**: No direct DOM manipulation
- **Use app.apiService**: No direct fetch() calls
- **Follow naming**: camelCase for functions, PascalCase for classes

## 🚨 Critical Warnings

### NEVER Do These:
```javascript
// ❌ NEVER use Math.random() for crypto
Math.random() 

// ❌ NEVER store sensitive data in localStorage
localStorage.setItem('privateKey', key)

// ❌ NEVER use direct DOM manipulation
document.innerHTML = '<div>content</div>'

// ❌ NEVER skip MCP validation
// Always run before committing
```

### ALWAYS Do These:
```javascript
// ✅ Use crypto.getRandomValues()
crypto.getRandomValues(new Uint32Array(1))

// ✅ Keep sensitive data in memory only
this.privateKey = key // in memory

// ✅ Use ElementFactory
$.div({ className: 'content' })

// ✅ Run MCP validation
npm run mcp:validate-all
```

## 🔍 Quick Search Patterns

### Finding Components
```bash
# Find all buttons
ls /documentation/components/buttons/

# Find specific component
grep -r "SendButton" /documentation/components/

# Find by feature
grep -r "transaction" /documentation/components/features/
```

### Finding Solutions
```bash
# Find bug fixes
grep -r "FIX" /documentation/testing/

# Find implementation guides
find /documentation -name "*IMPLEMENTATION*.md"

# Find architecture docs
find /documentation -name "*ARCHITECTURE*.md"
```

## 📊 Performance Optimization Checklist

- [ ] Check Memory MCP: `npm run mcp:memory`
- [ ] Debounce expensive operations
- [ ] Use Promise.all() for parallel operations
- [ ] Cache API responses when appropriate
- [ ] Clean up event listeners
- [ ] Avoid large DOM operations

## 🔒 Security Checklist

- [ ] Run Security MCP: `npm run mcp:security`
- [ ] Use crypto.getRandomValues() not Math.random()
- [ ] No sensitive data in localStorage
- [ ] Validate all inputs
- [ ] Use app.apiService for external calls
- [ ] Follow security patterns in docs

## 🎓 Learning Path for New AI Assistants

### Day 1: Understanding
1. Read [`CLAUDE.md`](../CLAUDE.md)
2. Read [`AI-START-HERE.md`](./architecture/00-START-HERE/AI-START-HERE.md)
3. Explore [`COMPONENT_RELATIONSHIP_MAP.md`](./components/COMPONENT_RELATIONSHIP_MAP.md)

### Day 2: Setup & Navigation
1. Set up development environment
2. Run the application
3. Explore component documentation
4. Try MCP tools

### Day 3: Implementation
1. Make a small UI change
2. Add a simple feature
3. Fix a reported bug
4. Run all validations

## 🛠️ Essential Commands

```bash
# Development
npm run dev              # Start both servers
npm run build           # Production build

# Validation (MUST USE)
npm run mcp:validate-all # Run all validations
npm test                # Run TestSprite
npm run mcp:memory      # Check memory usage
npm run mcp:security    # Security scan

# Testing
npm run test:watch      # Continuous testing
npm run lint           # Code linting

# Documentation
grep -r "keyword" documentation/  # Search docs
find documentation -name "*.md"   # List all docs
```

## 🎯 Quick Wins for First Day

1. **Fix a UI bug** - Check `/testing/BUG-REPORT-AND-FIXES.md`
2. **Add a tooltip** - Simple UI enhancement
3. **Improve error message** - Better UX
4. **Update documentation** - Always appreciated
5. **Add a test** - Increase coverage

## 📱 Mobile Development Notes

- Always test responsive design
- Use ResponsiveUtils for breakpoints
- Test touch interactions
- Check performance on mobile

## 🔄 Git Workflow

```bash
# Feature branch
git checkout -b feature/your-feature

# After changes
npm run mcp:validate-all  # MUST PASS
git add .
git commit -m "feat: description - MCPs ✅"

# Ready to push
npm run mcp:final-check
git push origin feature/your-feature
```

## 💡 Pro Tips

1. **Read error messages carefully** - They often tell you exactly what's wrong
2. **Use the documentation search** - 500+ files have answers
3. **Check test reports** - Learn from previous issues
4. **Follow patterns** - Consistency is key
5. **Ask for clarification** - Better than breaking things

## 🆘 When You're Stuck

1. Check relevant documentation category
2. Search for similar implementations
3. Review test reports for the feature
4. Check CLAUDE.md for rules
5. Run MCP tools for validation

## 🎉 You're Ready!

You now have everything needed to start development on MOOSH Wallet. Remember:

- **Always validate** with MCP tools
- **Follow patterns** in existing code
- **Check documentation** before implementing
- **Test everything** before committing
- **Keep security** in mind always

Welcome to MOOSH Wallet development! 🚀

---

*This quick start guide provides the essential information for AI assistants to begin productive work on MOOSH Wallet immediately.*