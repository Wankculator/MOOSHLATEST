#!/bin/bash

# Script to set up branch protection rules for MOOSH888 repository
# Usage: ./scripts/setup-branch-protection.sh <github_token>

set -e

# Check if token is provided
if [ -z "$1" ]; then
    echo "❌ Error: GitHub token not provided"
    echo "Usage: ./scripts/setup-branch-protection.sh <github_token>"
    exit 1
fi

GITHUB_TOKEN=$1
OWNER="Wankculator"
REPO="MOOSH888"
BRANCH="main"

echo "🔒 Setting up branch protection rules for ${OWNER}/${REPO}..."

# Branch protection API endpoint
API_URL="https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}/protection"

# Protection rules configuration
PROTECTION_RULES='{
  "required_status_checks": {
    "strict": true,
    "contexts": ["continuous-integration/travis-ci"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}'

# Apply branch protection
echo "📝 Applying protection rules..."
RESPONSE=$(curl -s -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d "${PROTECTION_RULES}" \
  "${API_URL}")

# Check if successful
if echo "$RESPONSE" | grep -q "url"; then
    echo "✅ Branch protection rules applied successfully!"
    echo ""
    echo "🔒 Protection enabled for '${BRANCH}' branch:"
    echo "   ✓ Require pull request reviews"
    echo "   ✓ Dismiss stale reviews on new commits"
    echo "   ✓ Include administrators"
    echo "   ✓ Restrict force pushes"
    echo "   ✓ Restrict branch deletion"
    echo "   ✓ Require conversation resolution"
else
    echo "❌ Failed to apply branch protection rules"
    echo "Response: $RESPONSE"
    exit 1
fi

# Create .github directory for workflows if it doesn't exist
echo ""
echo "📁 Setting up GitHub workflows directory..."
mkdir -p .github/workflows

# Create a basic CI workflow
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run security scan
      run: npm run mcp:security
    
    - name: Check memory usage
      run: npm run mcp:memory
    
    - name: Build
      run: npm run build
EOF

echo "✅ CI workflow created"

# Create issue templates
echo ""
echo "📋 Creating issue templates..."
mkdir -p .github/ISSUE_TEMPLATE

# Bug report template
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. chrome, safari]
 - Version: [e.g. 22]

**Additional context**
Add any other context about the problem here.
EOF

# Feature request template
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
EOF

echo "✅ Issue templates created"

# Create pull request template
cat > .github/pull_request_template.md << 'EOF'
## Description
Brief description of what this PR does.

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## MCP Validation
- [ ] Security MCP: PASSED
- [ ] Memory MCP: PASSED
- [ ] TestSprite: PASSED
- [ ] All linting passes

## Screenshots (if applicable)
Add screenshots to help reviewers understand the changes.
EOF

echo "✅ Pull request template created"

echo ""
echo "🎉 GitHub repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push these new files:"
echo "   git add .github/"
echo "   git commit -m '🔧 Add GitHub workflows and templates'"
echo "   git push"
echo ""
echo "2. Enable GitHub Actions in repository settings"
echo "3. Configure additional security settings at:"
echo "   https://github.com/${OWNER}/${REPO}/settings/security_analysis"
echo ""
echo "4. Remember to revoke this token at:"
echo "   https://github.com/settings/tokens"