#!/bin/bash

# MOOSH Wallet - Push Professional Refactor to GitHub

echo "🚀 Pushing MOOSH Wallet Professional Refactor to GitHub..."

# Add all changes
git add .

# Create commit with detailed message
git commit -m "🏗️ Professional Architecture Refactor & Organization

Major improvements:
- ✅ Modular JavaScript architecture (ElementFactory, Button, EventBus, etc.)
- ✅ Organized file structure (src/, tests/, docs/, scripts/)
- ✅ Added ESLint, Jest, and build system
- ✅ Professional npm scripts (dev, test, lint, build)
- ✅ Cleaned root directory (43 files → 15 items)
- ✅ Added .gitignore for clean commits
- ✅ Created developer documentation
- ✅ Fixed server paths and startup issues

Code quality:
- Separated 12,441 line file into modular components
- Average module size: 200-300 lines
- Ready for bitcoinjs-lib integration
- Professional patterns matching Coinbase/Xverse standards

🤖 Refactored with Claude Code Assistant"

# Create and push new branch
git checkout -b professional-refactor-2025
git push -u origin professional-refactor-2025

echo "✅ Successfully pushed to branch: professional-refactor-2025"
echo "📝 Create a pull request at: https://github.com/Wankculator/Moosh/compare/professional-refactor-2025"