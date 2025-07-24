# Anthropic API Setup for Cline

## Step 1: Get Your API Key

1. **Open your browser** and go to: https://console.anthropic.com/settings/keys
   
2. **Sign in** with your Anthropic account (same as your Claude account)

3. **Create a new API key:**
   - Click "Create Key"
   - Give it a name like "Cline VS Code"
   - Copy the key immediately (it won't be shown again!)
   - Save it somewhere safe

## Step 2: Configure Cline in VS Code

1. **Open VS Code**

2. **Open Cline:**
   - Look for the Cline icon in the sidebar (usually looks like a chat or AI icon)
   - Or press `Ctrl+Shift+P` and search for "Cline"

3. **Open Cline Settings:**
   - Click the settings gear icon (⚙️) in the Cline panel

4. **Configure API:**
   - **API Provider**: Select "Anthropic" from the dropdown
   - **API Key**: Paste your API key here
   - **Model**: Select one of these:
     - `claude-3-5-sonnet-20241022` (Recommended - best balance)
     - `claude-3-5-haiku-20241022` (Faster, cheaper)
     - `claude-3-opus-20240229` (Most capable)

5. **Save** and you're done!

## Step 3: Test Your Setup

1. In Cline, type: "Hello, can you see this?"
2. If it responds, you're all set!

## Important Notes

- **Keep your API key secret** - don't share it or commit it to git
- **Monitor usage** at: https://console.anthropic.com/settings/usage
- **Set spending limits** at: https://console.anthropic.com/settings/limits

## Pricing (as of 2024)
- Sonnet: $3/$15 per million tokens (input/output)
- Haiku: $0.25/$1.25 per million tokens
- Opus: $15/$75 per million tokens

## Troubleshooting

If Cline can't connect:
1. Check your API key is correct (no extra spaces)
2. Check your internet connection
3. Verify your account has API access enabled

## Environment Variable (Optional)

You can also set your API key as an environment variable:

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your-api-key-here", "User")
```

**WSL/Linux:**
```bash
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

Then in Cline, you can leave the API key field empty and it will use the environment variable.