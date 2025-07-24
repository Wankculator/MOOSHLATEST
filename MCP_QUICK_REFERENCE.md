# MOOSH Wallet MCP Quick Reference

## 🚨 TOP 5 MUST-HAVE MCPs

### 1. **@memory/mcp** - CRITICAL
- Your 33KB+ JS file NEEDS this
- Prevents browser crashes
- Suggests code splits
- `npm install @memory/mcp`

### 2. **@security/mcp** - CRITICAL
- Crypto wallet = security first
- Detects key exposure
- Validates entropy
- `npm install @security/mcp`

### 3. **context7** - REQUESTED
- Better code understanding
- Faster development
- `git clone github.com/context7/mcp-server`

### 4. **@firecrawl/mcp** - RECOMMENDED
- Scrapes Ordinals data
- Gets market prices
- Handles rate limits
- `npm install @firecrawl/mcp`

### 5. **@api-monitor/mcp** - ESSENTIAL
- Stops CORS errors
- Monitors API health
- Tracks rate limits
- `npm install @api-monitor/mcp`

## Quick Commands

```bash
# Check memory usage
mcp memory --check moosh-wallet.js

# Validate security
mcp security --scan

# Start monitoring
mcp monitor --watch

# Test everything
npm run mcp:validate
```

## Memory Tips for MOOSH

Your main JS file is HUGE. Memory MCP will help by:
- Detecting wallet switching leaks
- Finding orphaned event listeners
- Suggesting where to split code
- Monitoring real-time usage

## Firecrawl for Ordinals

Perfect for your NFT features:
- Scrapes ordinals.com
- Gets floor prices
- Fetches metadata
- Respects rate limits

Remember: Memory + Security first, then add others!