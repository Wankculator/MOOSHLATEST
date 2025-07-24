#!/bin/bash

# MOOSH Wallet Folder Cleanup and Organization Script
# This script will clean up and organize the MOOSH Wallet project structure
# Run with: bash CLEANUP-AND-ORGANIZE.sh

echo "🧹 MOOSH Wallet Cleanup and Organization Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Please run this script from the MOOSH Wallet root directory"
    exit 1
fi

echo "⚠️  This script will:"
echo "  - Remove all log files"
echo "  - Clean up duplicate files"
echo "  - Organize folder structure"
echo "  - Remove unnecessary files"
echo ""
read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting cleanup..."
echo ""

# 1. Remove all log files
echo "📝 Removing log files..."
find . -name "*.log" -type f -delete
echo "✅ Removed all .log files"

# 2. Remove backup directory
echo "📦 Removing backup directory..."
rm -rf backups/
echo "✅ Removed backups directory"

# 3. Create proper test directory structure
echo "🧪 Organizing test files..."
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures

# Move test files to proper location
mv src/server/final-spark-test.cjs tests/integration/ 2>/dev/null || true
mv src/server/real-100-percent-wallet-test.cjs tests/integration/ 2>/dev/null || true
mv src/server/test-wif-generation.cjs tests/unit/ 2>/dev/null || true
mv test-ordinals-performance.html tests/fixtures/ 2>/dev/null || true
mv test-seed-generation.cjs tests/unit/ 2>/dev/null || true
echo "✅ Moved test files to tests/ directory"

# 4. Clean up server services
echo "🛠️  Organizing server services..."
# Create a services backup directory temporarily
mkdir -p src/server/services/_archive

# Move unused service files to archive
cd src/server/services/
for file in *mock*.js *test*.js *old*.js *backup*.js; do
    if [ -f "$file" ]; then
        mv "$file" _archive/ 2>/dev/null || true
    fi
done
cd ../../../
echo "✅ Organized service files"

# 5. Remove nested node_modules
echo "📦 Cleaning up nested node_modules..."
rm -rf src/server/node_modules/
rm -f src/server/package.json
rm -f src/server/package-lock.json
echo "✅ Removed nested node_modules"

# 6. Consolidate documentation
echo "📚 Organizing documentation..."
mkdir -p docs/archive
mkdir -p docs/api
mkdir -p docs/guides
mkdir -p docs/architecture

# Move duplicate files to archive
mv PROJECT_STRUCTURE.md docs/archive/ 2>/dev/null || true
mv MASTER_PROMPT_IMPROVED.md docs/archive/ 2>/dev/null || true

# Move architecture docs
mv WALLET_ARCHITECTURE.md docs/architecture/ 2>/dev/null || true
mv PRODUCT_REQUIREMENTS_DOCUMENT.md docs/architecture/ 2>/dev/null || true

# Move implementation guides
mv docs/COMPLETE_WALLET_IMPLEMENTATION_GUIDE.md docs/guides/ 2>/dev/null || true
mv docs/SEED_GENERATION_IMPLEMENTATION_GUIDE.md docs/guides/ 2>/dev/null || true

echo "✅ Organized documentation"

# 7. Clean up scripts directory
echo "📜 Consolidating scripts..."
mkdir -p scripts/archive

# Move duplicate scripts to archive
mv scripts/windows/* scripts/archive/ 2>/dev/null || true
rmdir scripts/windows/ 2>/dev/null || true

# Keep only essential scripts
echo "✅ Consolidated scripts"

# 8. Remove temporary files
echo "🗑️  Removing temporary files..."
rm -f optimize-ordinals-loading.js 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
echo "✅ Removed temporary files"

# 9. Update .gitignore
echo "📝 Updating .gitignore..."
cat >> .gitignore << EOL

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Backups
backups/
*backup*
*_old*
*_archive*

# OS files
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# Build directories
build/
dist/

# IDE files
.idea/
.vscode/
*.swp
*.swo
EOL

echo "✅ Updated .gitignore"

# 10. Create recommended structure
echo "🏗️  Creating recommended directory structure..."
mkdir -p src/client 2>/dev/null || true
mkdir -p src/shared 2>/dev/null || true
mkdir -p config 2>/dev/null || true
mkdir -p .github/workflows 2>/dev/null || true

# 11. Generate cleanup report
echo ""
echo "📊 Cleanup Report"
echo "================"
echo ""
echo "✅ Removed all log files"
echo "✅ Deleted backup directory"
echo "✅ Organized test files into tests/"
echo "✅ Cleaned up service files"
echo "✅ Removed nested node_modules"
echo "✅ Consolidated documentation"
echo "✅ Organized scripts"
echo "✅ Updated .gitignore"
echo ""

# 12. Show current structure
echo "📁 New folder structure:"
echo ""
tree -L 3 -I 'node_modules|coverage|dist|build' 2>/dev/null || {
    echo "Directory structure:"
    find . -type d -not -path '*/\.*' -not -path '*/node_modules*' | head -20
}

echo ""
echo "🎉 Cleanup complete! Your MOOSH Wallet is now professionally organized."
echo ""
echo "⚠️  Important next steps:"
echo "1. Review src/server/services/_archive/ and delete unneeded files"
echo "2. Commit these changes: git add -A && git commit -m '🧹 Professional folder structure cleanup'"
echo "3. Update any import paths that may have changed"
echo "4. Run 'npm install' to ensure dependencies are correct"
echo ""