# Claude Code Setup Guide

## Status
✅ Claude CLI is already installed (version 1.0.44)
✅ Claude CLI path found: `/home/sk84l/.nvm/versions/node/v24.3.0/bin/claude`

## Next Steps

### 1. Authenticate Claude CLI (REQUIRED)
Open a new terminal and run:
```bash
claude auth login
```
This will open a browser window where you need to log in with your Claude account.

### 2. Verify Authentication
After logging in, verify the authentication:
```bash
claude auth status
```

### 3. Configure Cline in VS Code
1. Open VS Code
2. Open the Cline extension (should be in the sidebar)
3. Click the settings icon (⚙️) in Cline
4. In the API Provider dropdown, select "Claude Code"
5. In the "Claude executable path" field, enter: `claude`
   - Since claude is in your PATH, you can just use `claude`
   - Alternatively, use the full path: `/home/sk84l/.nvm/versions/node/v24.3.0/bin/claude`

### 4. Select a Model
After configuring, you can select from these models:
- `claude-sonnet-4-20250514` (Recommended)
- `claude-opus-4-20250514`
- `claude-3-7-sonnet-20250219`
- `claude-3-5-sonnet-20241022`
- `claude-3-5-haiku-20241022`

## Quick Commands for Terminal

```bash
# 1. Authenticate (do this first!)
claude auth login

# 2. Check status
claude auth status

# 3. Test Claude CLI
claude --version
```

## Troubleshooting
- If authentication fails, try: `claude auth logout` then `claude auth login`
- If Cline can't find claude, use the full path: `/home/sk84l/.nvm/versions/node/v24.3.0/bin/claude`