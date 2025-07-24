# TESTSPRITE INTEGRATION GUIDELINES

## What is TestSprite?

TestSprite is an automated testing and validation system that prevents common errors in MOOSH Wallet development.

## Core Validation Rules

### 1. CORS Validation
- Scans for direct external API calls
- Enforces proxy usage for all external APIs
- Catches fetch() calls to coingecko, blockchain.info, etc.

### 2. ElementFactory Validation
- Verifies only existing methods are used
- Prevents $.li(), $.ul(), $.nav() usage
- Ensures proper element creation patterns

### 3. Performance Monitoring
- Detects duplicate API calls
- Warns about excessive updateLiveData()
- Monitors fetchBitcoinPrice() frequency

### 4. State Management
- Ensures proper StateManager usage
- Flags direct localStorage access
- Validates state persistence patterns

### 5. Endpoint Testing
- Verifies critical API endpoints work
- Tests response structures
- Validates data formats

## Running TestSprite

### Basic Commands:
```bash
# Full validation
npm test

# Watch mode (continuous)
npm run test:watch

# Quick endpoint check
npm run test:quick

# Performance audit
npm run test:performance
```

### Reading Reports:
```bash
# View detailed report
cat test-results/validation-report.json

# Check specific errors
grep "error" test-results/validation-report.json
```

## Common TestSprite Errors

### "Found direct API call"
**Fix**: Use app.apiService or proxy endpoint

### "Found prohibited method: $.li()"
**Fix**: Use $.div() with bullet points

### "High direct localStorage usage"
**Fix**: Use app.state.set() instead

### "Endpoint validation failed"
**Fix**: Check servers are running

## TestSprite Workflow

1. **Before Starting**:
   ```bash
   npm test  # Clean baseline
   ```

2. **During Development**:
   ```bash
   npm run test:watch  # Keep running
   ```

3. **After Each Change**:
   - Wait for TestSprite result
   - Fix any errors immediately
   - Don't accumulate errors

4. **Before Committing**:
   ```bash
   npm test  # Final validation
   ```

## Configuration

TestSprite config is in `/scripts/test-with-sprite.js`

Key sections:
- `validateNoCorsViolations()` - API call rules
- `validateElementFactoryUsage()` - DOM method rules
- `checkPerformanceIssues()` - Performance thresholds
- `testCriticalEndpoints()` - Endpoint health

## Integration with Development

### VS Code Integration:
- Install TestSprite MCP extension
- Get real-time validation
- See errors as you type

### Git Hooks:
- Pre-commit runs TestSprite
- Blocks commits if tests fail
- Ensures clean history

### CI/CD:
- GitHub Actions run TestSprite
- PRs require passing tests
- Deployment blocked on failures

## Best Practices

1. **Trust TestSprite Over Assumptions**
   - If it fails, there's a reason
   - Don't try to bypass

2. **Fix Errors Immediately**
   - Don't let them accumulate
   - Each error makes debugging harder

3. **Use Watch Mode**
   - Instant feedback
   - Catch errors as they happen

4. **Read the Full Error**
   - TestSprite gives specific fixes
   - Follow its suggestions

## Troubleshooting

### TestSprite Won't Run:
```bash
# Check Node version
node --version  # Need 18+

# Reinstall dependencies
npm install

# Check servers
npm run dev
```

### False Positives:
- Rare but possible
- Check `/scripts/test-with-sprite.js`
- Adjust patterns if needed

### Performance Issues:
- TestSprite should run in < 5 seconds
- If slow, check file sizes
- Large files may need optimization

## Advanced Usage

### Custom Validators:
Add to `/scripts/test-with-sprite.js`:
```javascript
async validateCustomRule() {
    // Your validation logic
}
```

### Exclude Patterns:
```javascript
const excluded = [
    'test-files/**',
    'backup/**'
];
```

### Threshold Adjustments:
```javascript
const thresholds = {
    maxApiCalls: 15,
    maxStateWrites: 50
};
```

---

Remember: TestSprite is your safety net. Use it constantly.