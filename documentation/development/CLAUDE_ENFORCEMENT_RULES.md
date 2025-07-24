# CLAUDE ENFORCEMENT RULES - MANDATORY WORKFLOW

## 🚨 STOP! THIS IS NOT OPTIONAL!

These rules ENFORCE the workflow that prevents broken features, CORS errors, and wasted time.

## 1. TESTSPRITE IS MANDATORY

### Before ANY Work:
```bash
npm test  # MUST show "All tests passed!"
```

### After EVERY Change:
```bash
npm test  # Not optional, not "later", NOW
```

### If TestSprite Fails:
- ❌ DO NOT make more changes
- ❌ DO NOT commit
- ✅ Fix ONLY what TestSprite reports
- ✅ Run npm test again

## 2. NO DIRECT API CALLS

### ❌ FORBIDDEN:
```javascript
fetch('https://api.coingecko.com/...')
fetch('https://blockchain.info/...')
fetch('https://any-external-api.com/...')
```

### ✅ REQUIRED:
```javascript
await this.app.apiService.fetchBitcoinPrice()
fetch(`${window.MOOSH_API_URL}/api/proxy/...`)
```

## 3. ELEMENTFACTORY RULES

### Available Methods ONLY:
- $.div(), $.span(), $.button(), $.input(), $.textarea()
- $.h1() through $.h6(), $.p(), $.a(), $.img()
- $.label(), $.select(), $.option(), $.form()
- $.table(), $.tr(), $.td(), $.th()
- $.strong() (via span), $.code(), $.pre()

### ❌ DO NOT USE:
- $.li(), $.ul(), $.ol() → Use $.div() with bullets
- $.nav(), $.section() → Use $.div()
- $.em(), $.i(), $.b() → Use $.span() with styles

## 4. INCREMENTAL CHANGES ONLY

### The ONLY Workflow:
1. Run `npm test` - Clean start
2. Make ONE small change
3. Run `npm test` - Verify
4. If fail → Revert immediately
5. If pass → Next small change

### ❌ FORBIDDEN:
- Multiple changes without testing
- "I'll test after I finish"
- "It's a small change, no need to test"

## 5. STATE MANAGEMENT

### ❌ NEVER:
```javascript
localStorage.setItem('key', value)
window.globalState = data
this.customState = data
```

### ✅ ALWAYS:
```javascript
this.app.state.set('key', value)
this.app.state.get('key')
```

## 6. RESPONSE STRUCTURES ARE SACRED

### NEVER Change:
- API endpoint URLs
- Response JSON structure
- Data types (string vs array)
- Property names

### Example - This Structure is LAW:
```javascript
{
    success: true,
    data: {
        mnemonic: "string not array",
        addresses: { bitcoin: "...", spark: "..." },
        privateKeys: { bitcoin: {}, spark: {} }
    }
}
```

## 7. COMMIT RULES

### Before ANY Commit:
```bash
npm test  # MUST pass
git status  # Review changes
```

### Commit Message MUST Include:
```bash
git commit -m "feat: [description] - TestSprite ✅"
```

## 8. DEBUGGING WORKFLOW

### When Something Breaks:
1. Run `npm test` first
2. Read TestSprite output
3. Fix what TestSprite says
4. Test again
5. Only then manual debug

### ❌ DO NOT:
- Debug without TestSprite
- Assume the problem
- Make random changes

## 9. PROTECTED FEATURES

### These CANNOT Be Modified:
- Lock screen design
- Terminal theme (green on black)
- Animation timings
- Button border styles
- Modal designs

TestSprite will BLOCK changes to these.

## 10. RECOVERY PROCEDURE

### If You Break Something:
```bash
# Find last working state
npm test
git log --oneline | grep "TestSprite ✅"

# Revert to working
git checkout [working-commit] -- .
npm test  # Verify fixed
```

## ENFORCEMENT MECHANISM

These rules are ENFORCED by:
1. TestSprite validation
2. Pre-commit hooks
3. Git commit checks
4. Code review requirements

**You CANNOT bypass these rules.**

## THE GOLDEN RULE

**If TestSprite says NO, the answer is NO.**

No exceptions. No "but I think...". No overrides.

TestSprite is the law. Follow it.

---

Remember: Every rule here exists because someone broke something. Don't be that someone.