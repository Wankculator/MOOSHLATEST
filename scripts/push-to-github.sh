#!/bin/bash

# Script to push MOOSH Wallet to GitHub repository
# Usage: ./scripts/push-to-github.sh <github_token>

set -e

# Check if token is provided
if [ -z "$1" ]; then
    echo "❌ Error: GitHub token not provided"
    echo "Usage: ./scripts/push-to-github.sh <github_token>"
    exit 1
fi

GITHUB_TOKEN=$1
REPO_URL="https://github.com/Wankculator/MOOSH888.git"

echo "🚀 Starting push to MOOSH888 repository..."

# Initialize git if not already
if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Set up git config
git config user.name "MOOSH Wallet Developer"
git config user.email "noreply@mooshwallet.com"

# Add all files
echo "📝 Adding all files..."
git add -A

# Create commit
echo "💾 Creating commit..."
git commit -m "🚀 Complete MOOSH Wallet - Professional Grade Bitcoin/Spark Wallet

Features:
- Non-custodial Bitcoin & Spark Protocol support
- BIP39/BIP32 seed generation
- Multiple address types (SegWit, Taproot, Legacy)
- Real-time price tracking
- Transaction history
- QR code generation
- Secure key management

Security:
- Fixed all Math.random() vulnerabilities
- Removed localStorage for sensitive data
- Added CORS proxy endpoints
- Fixed memory leaks
- Enhanced security scanning

Professional Standards:
- 12 MCP tools integrated
- Comprehensive test suite
- Full documentation
- Claude Opus 4 optimized
- Memory and security validated

🤖 Generated with Claude Code (Claude Opus 4)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Add remote
echo "🔗 Setting up remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://${GITHUB_TOKEN}@github.com/Wankculator/MOOSH888.git

# Create main branch if needed
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main --force

echo "✅ Successfully pushed to https://github.com/Wankculator/MOOSH888"
echo "🎉 MOOSH Wallet is now live on GitHub!"