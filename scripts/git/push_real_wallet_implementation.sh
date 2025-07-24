#!/bin/bash

echo "🚀 Pushing Real Wallet Implementation to GitHub..."
echo "================================================"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    exit 1
fi

# Push to origin
echo ""
echo "📤 Pushing to origin/$CURRENT_BRANCH..."
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed real wallet implementation!"
    echo ""
    echo "🎉 Key Features Implemented:"
    echo "   - Real BIP39 seed generation (12/24 words)"
    echo "   - Correct Spark Protocol addresses (sp1pgss... format)"
    echo "   - Test vector matching implementation"
    echo "   - Fixed wallet details page"
    echo "   - Comprehensive documentation"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Create a pull request if needed"
    echo "   2. Test the implementation thoroughly"
    echo "   3. Deploy to production when ready"
    echo ""
    echo "🔗 GitHub URL: https://github.com/Wankculator/Moosh"
else
    echo ""
    echo "❌ Push failed. Please check your connection and try again."
    exit 1
fi