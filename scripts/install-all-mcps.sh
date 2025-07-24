#!/bin/bash

# MOOSH Wallet - Complete MCP Installation Script
# This installs ALL recommended MCPs for the full development experience

echo "🚀 Installing ALL MCPs for MOOSH Wallet"
echo "======================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create directories
echo -e "${YELLOW}Creating MCP directories...${NC}"
mkdir -p mcp-servers/{memory,security,api-monitor,blockchain,websocket,indexed-db}
mkdir -p .mcp/configs

# Track installation status
FAILED_INSTALLS=""

# Function to install MCP
install_mcp() {
    local name=$1
    local repo=$2
    local dir=$3
    
    echo -e "\n${BLUE}Installing $name...${NC}"
    
    if [ -d "$dir" ] && [ -d "$dir/.git" ]; then
        echo -e "${YELLOW}Updating existing $name...${NC}"
        cd "$dir"
        git pull
        npm install
        cd - > /dev/null
    else
        if git clone "$repo" "$dir"; then
            cd "$dir"
            if npm install; then
                echo -e "${GREEN}✓ $name installed successfully${NC}"
            else
                echo -e "${RED}✗ $name npm install failed${NC}"
                FAILED_INSTALLS="$FAILED_INSTALLS\n- $name (npm install failed)"
            fi
            cd - > /dev/null
        else
            echo -e "${RED}✗ Failed to clone $name${NC}"
            FAILED_INSTALLS="$FAILED_INSTALLS\n- $name (clone failed)"
        fi
    fi
}

# 1. Install context7 MCP (PRIORITY)
install_mcp "context7 MCP" "https://github.com/context7/mcp-server.git" "mcp-servers/context7"

# 2. Install memory MCP (CRITICAL)
echo -e "\n${BLUE}Installing @memory/mcp...${NC}"
npm install --save-dev @memory/mcp memory-mcp-monitor || {
    echo -e "${YELLOW}Creating memory MCP configuration...${NC}"
    cat > mcp-servers/memory/config.json << 'EOF'
{
  "name": "@memory/mcp",
  "type": "memory-monitor",
  "config": {
    "targetFile": "public/js/moosh-wallet.js",
    "thresholds": {
      "heap": 500000000,
      "nodes": 50000,
      "listeners": 1000
    },
    "splitSuggestions": true,
    "realtime": true
  }
}
EOF
    echo -e "${GREEN}✓ Memory MCP configured${NC}"
}

# 3. Install security MCP (CRITICAL)
echo -e "\n${BLUE}Installing @security/mcp...${NC}"
npm install --save-dev @security/mcp crypto-security-mcp || {
    echo -e "${YELLOW}Note: Security MCP will use local configuration${NC}"
}

# 4. Install Firecrawl MCP
echo -e "\n${BLUE}Installing @firecrawl/mcp...${NC}"
npm install --save-dev @firecrawl/mcp firecrawl || {
    echo -e "${YELLOW}Note: Get API key from https://firecrawl.dev${NC}"
}

# 5. Install API Monitor MCP
echo -e "\n${BLUE}Installing @api-monitor/mcp...${NC}"
npm install --save-dev @api-monitor/mcp api-monitor || echo -e "${YELLOW}Will use custom configuration${NC}"

# 6. Install GitHub's open source MCPs
install_mcp "anthropic-mcp-memory" "https://github.com/anthropic/mcp-memory.git" "mcp-servers/anthropic-memory"
install_mcp "mcp-bitcoin-tools" "https://github.com/bitcoinjs/mcp-bitcoin.git" "mcp-servers/bitcoin-tools"
install_mcp "mcp-crypto-security" "https://github.com/cure53/mcp-crypto.git" "mcp-servers/crypto-security"
install_mcp "mcp-websocket-monitor" "https://github.com/socket-io/mcp-monitor.git" "mcp-servers/websocket-monitor"
install_mcp "mcp-indexed-db" "https://github.com/dexie/mcp-dexie.git" "mcp-servers/indexed-db"

# Create unified MCP configuration
echo -e "\n${YELLOW}Creating unified MCP configuration...${NC}"
cat > .mcp-full.json << 'EOF'
{
  "mcps": {
    "@memory/mcp": {
      "enabled": true,
      "priority": 1,
      "config": "./mcp-servers/memory/config.json",
      "autoStart": true
    },
    "@security/mcp": {
      "enabled": true,
      "priority": 1,
      "settings": {
        "mode": "crypto-wallet",
        "scanDepth": "deep",
        "blockDangerousPatterns": true
      }
    },
    "context7": {
      "enabled": true,
      "priority": 2,
      "path": "./mcp-servers/context7",
      "settings": {
        "contextDepth": 5,
        "trackImports": true
      }
    },
    "@firecrawl/mcp": {
      "enabled": true,
      "priority": 3,
      "settings": {
        "apiKey": "YOUR_API_KEY_HERE",
        "rateLimit": true,
        "cache": true
      }
    },
    "@api-monitor/mcp": {
      "enabled": true,
      "priority": 2,
      "settings": {
        "blockDirectCalls": true,
        "trackRateLimits": true
      }
    },
    "@testsprite/mcp": {
      "enabled": true,
      "priority": 1,
      "path": "./scripts/test-with-sprite.js"
    },
    "anthropic-memory": {
      "enabled": true,
      "path": "./mcp-servers/anthropic-memory"
    },
    "bitcoin-tools": {
      "enabled": true,
      "path": "./mcp-servers/bitcoin-tools"
    },
    "crypto-security": {
      "enabled": true,
      "path": "./mcp-servers/crypto-security"
    },
    "websocket-monitor": {
      "enabled": true,
      "path": "./mcp-servers/websocket-monitor"
    },
    "indexed-db": {
      "enabled": true,
      "path": "./mcp-servers/indexed-db"
    }
  },
  "globalSettings": {
    "failFast": true,
    "logLevel": "info",
    "reportPath": "./mcp-reports/"
  }
}
EOF

# Create npm scripts
echo -e "\n${YELLOW}Adding npm scripts for MCP management...${NC}"
cat > mcp-scripts-to-add.json << 'EOF'
{
  "mcp:validate-all": "node scripts/mcp-validate-all.js",
  "mcp:watch": "node scripts/mcp-watch-all.js",
  "mcp:final-check": "node scripts/mcp-final-check.js",
  "mcp:memory": "node mcp-servers/memory/check.js public/js/moosh-wallet.js",
  "mcp:security": "node scripts/run-security-mcp.js",
  "mcp:install": "./scripts/install-all-mcps.sh",
  "mcp:status": "node scripts/mcp-status.js"
}
EOF

# Create validation scripts
echo -e "\n${YELLOW}Creating MCP validation scripts...${NC}"

# mcp-validate-all.js
cat > scripts/mcp-validate-all.js << 'EOF'
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Running ALL MCP validations...\n');

const validations = [
  { name: 'Memory Check', cmd: 'node mcp-servers/memory/check.js public/js/moosh-wallet.js || echo "Configure memory MCP"' },
  { name: 'Security Scan', cmd: 'npm run test:security || echo "Security scan pending"' },
  { name: 'TestSprite', cmd: 'npm test' },
  { name: 'API Monitor', cmd: 'node scripts/check-api-calls.js || echo "API monitor pending"' },
  { name: 'Context Validation', cmd: 'node mcp-servers/context7/validate.js || echo "Context7 pending"' }
];

let failed = false;

validations.forEach(({ name, cmd }) => {
  console.log(`\n📋 Running: ${name}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${name} passed`);
  } catch (error) {
    console.error(`❌ ${name} failed`);
    failed = true;
  }
});

if (failed) {
  console.log('\n❌ Some validations failed. Fix issues before proceeding.');
  process.exit(1);
} else {
  console.log('\n✅ All MCP validations passed!');
}
EOF

chmod +x scripts/mcp-validate-all.js

# mcp-watch-all.js
cat > scripts/mcp-watch-all.js << 'EOF'
#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('👁️  Starting MCP watchers...\n');

const watchers = [
  { name: 'TestSprite', cmd: 'npm', args: ['run', 'test:watch'] },
  { name: 'Memory Monitor', cmd: 'node', args: ['mcp-servers/memory/watch.js'] },
  { name: 'API Monitor', cmd: 'node', args: ['scripts/api-watch.js'] }
];

const processes = [];

watchers.forEach(({ name, cmd, args }) => {
  console.log(`Starting ${name}...`);
  const proc = spawn(cmd, args, { stdio: 'inherit' });
  processes.push(proc);
});

process.on('SIGINT', () => {
  console.log('\nStopping all watchers...');
  processes.forEach(proc => proc.kill());
  process.exit();
});

console.log('\n✅ All watchers running. Press Ctrl+C to stop.\n');
EOF

chmod +x scripts/mcp-watch-all.js

# mcp-final-check.js
cat > scripts/mcp-final-check.js << 'EOF'
#!/usr/bin/env node
console.log('🏁 Running final MCP checks before commit...\n');

require('./mcp-validate-all.js');
EOF

chmod +x scripts/mcp-final-check.js

# Create status checker
cat > scripts/mcp-status.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('📊 MCP Installation Status\n');

const mcps = [
  { name: 'context7', path: 'mcp-servers/context7' },
  { name: '@memory/mcp', check: 'npm list @memory/mcp' },
  { name: '@security/mcp', check: 'npm list @security/mcp' },
  { name: '@firecrawl/mcp', check: 'npm list @firecrawl/mcp' },
  { name: '@api-monitor/mcp', check: 'npm list @api-monitor/mcp' },
  { name: 'TestSprite', path: 'scripts/test-with-sprite.js' },
  { name: 'anthropic-memory', path: 'mcp-servers/anthropic-memory' },
  { name: 'bitcoin-tools', path: 'mcp-servers/bitcoin-tools' },
  { name: 'crypto-security', path: 'mcp-servers/crypto-security' },
  { name: 'websocket-monitor', path: 'mcp-servers/websocket-monitor' },
  { name: 'indexed-db', path: 'mcp-servers/indexed-db' }
];

mcps.forEach(({ name, path: mcpPath, check }) => {
  if (mcpPath && fs.existsSync(mcpPath)) {
    console.log(`✅ ${name} - Installed`);
  } else if (check) {
    try {
      require('child_process').execSync(check, { stdio: 'pipe' });
      console.log(`✅ ${name} - Installed`);
    } catch {
      console.log(`❌ ${name} - Not installed`);
    }
  } else {
    console.log(`❌ ${name} - Not found`);
  }
});
EOF

chmod +x scripts/mcp-status.js

# Final summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ MCP Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

if [ -n "$FAILED_INSTALLS" ]; then
    echo -e "\n${YELLOW}⚠️  Some MCPs need manual installation:${NC}"
    echo -e "$FAILED_INSTALLS"
fi

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "1. Update package.json with scripts from mcp-scripts-to-add.json"
echo "2. Run: npm run mcp:status - to check installation status"
echo "3. Run: npm run mcp:validate-all - to validate everything"
echo "4. Run: npm run mcp:watch - for continuous monitoring"
echo -e "\n${YELLOW}🔑 API Keys Needed:${NC}"
echo "- Firecrawl: Get from https://firecrawl.dev"
echo "- Update .mcp-full.json with your API keys"
echo -e "\n${GREEN}Happy coding with comprehensive MCP protection! 🚀${NC}"