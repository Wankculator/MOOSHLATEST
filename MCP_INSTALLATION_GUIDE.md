# 🚀 MOOSH Wallet MCP Installation Guide

## Quick Start (Install Everything)

```bash
# Run this ONE command to install ALL MCPs:
./scripts/install-all-mcps.sh
```

## What Gets Installed

### 🔴 CRITICAL MCPs (Must Have)
1. **@memory/mcp** - Prevents crashes from 33k+ line JS file
2. **@security/mcp** - Crypto wallet security scanning
3. **@testsprite/mcp** - Code validation (already exists)
4. **context7** - Enhanced code understanding
5. **@api-monitor/mcp** - CORS error prevention

### 🟡 IMPORTANT MCPs (Highly Recommended)
6. **@firecrawl/mcp** - Ordinals/blockchain data scraping
7. **anthropic-mcp-memory** - Persistent context management
8. **mcp-bitcoin-tools** - Bitcoin operation helpers
9. **mcp-crypto-security** - Additional security layers
10. **mcp-websocket-monitor** - Live feed monitoring
11. **mcp-indexed-db** - Better storage than localStorage

## Verification Steps

### 1. Check Installation Status
```bash
npm run mcp:status
```

### 2. Run Initial Validation
```bash
npm run mcp:validate-all
```

### 3. Start Continuous Monitoring
```bash
npm run mcp:watch
```

## Daily Workflow

### Before Starting Work:
```bash
npm run mcp:validate-all  # MANDATORY
```

### While Coding:
```bash
npm run mcp:watch  # Keep in separate terminal
```

### Before Committing:
```bash
npm run mcp:final-check  # MUST PASS
```

## Configuration

### API Keys Required:
1. **Firecrawl**: Get from https://firecrawl.dev
2. Update `.mcp-full.json` with your API key

### Memory Settings:
Edit `mcp-servers/memory/config.json`:
```json
{
  "thresholds": {
    "heap": 500000000,  // 500MB limit
    "nodes": 50000,     // DOM node limit
    "listeners": 1000   // Event listener limit
  }
}
```

## Troubleshooting

### If installation fails:
```bash
# Check Node version (need 18+)
node --version

# Clear npm cache
npm cache clean --force

# Try manual install
cd mcp-servers/context7 && npm install
```

### If MCP validation fails:
1. Read the specific error message
2. Fix the issue (don't ignore it!)
3. Run validation again

## MCP Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run mcp:validate-all` | Run all validations | Before starting work |
| `npm run mcp:watch` | Continuous monitoring | During development |
| `npm run mcp:final-check` | Pre-commit validation | Before git commit |
| `npm run mcp:memory` | Check memory usage | When performance degrades |
| `npm run mcp:security` | Security scan | After auth changes |
| `npm run mcp:status` | Check what's installed | Troubleshooting |

## Important Notes

⚠️ **NEVER** skip MCP validations
⚠️ **ALWAYS** fix failures immediately  
⚠️ **Memory MCP is CRITICAL** - your JS file is huge
⚠️ **Security MCP is MANDATORY** - you're handling crypto

## Next Steps After Installation

1. ✅ Run `npm run mcp:status` to verify
2. ✅ Update package.json with scripts from `mcp-scripts-to-add.json`
3. ✅ Get Firecrawl API key
4. ✅ Run first validation
5. ✅ Start coding with confidence!

Remember: MCPs are your safety net. Use them!