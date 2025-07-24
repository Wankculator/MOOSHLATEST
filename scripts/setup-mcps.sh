#!/bin/bash

# MOOSH Wallet MCP Setup Script
# This script sets up recommended MCPs for optimal development workflow

echo "🚀 Setting up MCPs for MOOSH Wallet Development"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: node is not installed${NC}"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ required (current: $(node --version))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites satisfied${NC}"

# Create MCP directory if it doesn't exist
MCP_DIR="./mcp-servers"
if [ ! -d "$MCP_DIR" ]; then
    echo -e "${YELLOW}Creating MCP directory...${NC}"
    mkdir -p "$MCP_DIR"
fi

# Install context7 MCP
echo -e "\n${YELLOW}Installing context7 MCP...${NC}"
cd "$MCP_DIR"
if [ ! -d "context7-mcp" ]; then
    git clone https://github.com/context7/mcp-server.git context7-mcp
    cd context7-mcp
    npm install
    echo -e "${GREEN}✓ context7 MCP installed${NC}"
else
    echo -e "${GREEN}✓ context7 MCP already installed${NC}"
fi
cd ../..

# Install security MCP (placeholder - replace with actual when available)
echo -e "\n${YELLOW}Setting up security MCP configuration...${NC}"
cat > "$MCP_DIR/security-mcp-config.json" << EOF
{
  "name": "@security/mcp",
  "enabled": true,
  "rules": {
    "preventPrivateKeyExposure": true,
    "validateEntropy": true,
    "checkCryptoPatterns": true,
    "scanForHardcodedSecrets": true
  },
  "walletMode": "bitcoin",
  "alertLevel": "high"
}
EOF
echo -e "${GREEN}✓ Security MCP configured${NC}"

# Install API monitor MCP configuration
echo -e "\n${YELLOW}Setting up API monitor MCP...${NC}"
cat > "$MCP_DIR/api-monitor-config.json" << EOF
{
  "name": "@api-monitor/mcp",
  "enabled": true,
  "endpoints": {
    "api": "http://localhost:3001",
    "ui": "http://localhost:3333"
  },
  "externalAPIs": [
    "api.coingecko.com",
    "blockchain.info",
    "api.blockcypher.com"
  ],
  "corsPolicy": "proxy-only",
  "rateLimit": {
    "coingecko": "10/minute",
    "blockchain": "30/minute"
  }
}
EOF
echo -e "${GREEN}✓ API Monitor MCP configured${NC}"

# Create main MCP configuration
echo -e "\n${YELLOW}Creating main MCP configuration...${NC}"
cat > ".mcp.json" << EOF
{
  "mcps": {
    "@context/mcp": {
      "path": "./mcp-servers/context7-mcp",
      "enabled": true,
      "settings": {
        "maxDepth": 5,
        "includeTests": false,
        "watchFiles": ["*.js", "*.json", "*.md"]
      }
    },
    "@testsprite/mcp": {
      "path": "./scripts/test-with-sprite.js",
      "enabled": true,
      "autoRun": true
    },
    "@security/mcp": {
      "config": "./mcp-servers/security-mcp-config.json",
      "enabled": true
    },
    "@api-monitor/mcp": {
      "config": "./mcp-servers/api-monitor-config.json",
      "enabled": true
    }
  },
  "globalSettings": {
    "logLevel": "info",
    "enableNotifications": true,
    "failOnError": false
  }
}
EOF
echo -e "${GREEN}✓ Main MCP configuration created${NC}"

# Create MCP helper scripts
echo -e "\n${YELLOW}Creating MCP helper scripts...${NC}"

# MCP validate script
cat > "mcp-validate.sh" << 'EOF'
#!/bin/bash
echo "Running MCP validation..."
node ./scripts/test-with-sprite.js
if [ -f "./mcp-servers/context7-mcp/validate.js" ]; then
    node ./mcp-servers/context7-mcp/validate.js
fi
echo "Validation complete!"
EOF
chmod +x mcp-validate.sh

# MCP watch script
cat > "mcp-watch.sh" << 'EOF'
#!/bin/bash
echo "Starting MCP watchers..."
npm run test:watch &
if [ -f "./mcp-servers/context7-mcp/watch.js" ]; then
    node ./mcp-servers/context7-mcp/watch.js &
fi
echo "MCP watchers running. Press Ctrl+C to stop."
wait
EOF
chmod +x mcp-watch.sh

echo -e "${GREEN}✓ Helper scripts created${NC}"

# Update package.json scripts
echo -e "\n${YELLOW}Updating package.json scripts...${NC}"
if command_exists jq; then
    jq '.scripts += {
        "mcp:validate": "./mcp-validate.sh",
        "mcp:watch": "./mcp-watch.sh",
        "mcp:setup": "./scripts/setup-mcps.sh"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ package.json updated${NC}"
else
    echo -e "${YELLOW}! Please manually add these scripts to package.json:${NC}"
    echo '  "mcp:validate": "./mcp-validate.sh",'
    echo '  "mcp:watch": "./mcp-watch.sh",'
    echo '  "mcp:setup": "./scripts/setup-mcps.sh"'
fi

# Create VS Code settings for MCP integration
echo -e "\n${YELLOW}Creating VS Code MCP settings...${NC}"
mkdir -p .vscode
cat > ".vscode/mcp-settings.json" << EOF
{
  "mcp.enable": true,
  "mcp.servers": {
    "context7": {
      "command": "node",
      "args": ["./mcp-servers/context7-mcp/server.js"]
    }
  },
  "mcp.autoStart": true,
  "mcp.validateOnSave": true
}
EOF
echo -e "${GREEN}✓ VS Code MCP settings created${NC}"

# Final instructions
echo -e "\n${GREEN}✅ MCP Setup Complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Run: npm run mcp:validate - to validate your codebase"
echo "2. Run: npm run mcp:watch - for continuous monitoring"
echo "3. Install VS Code MCP extension for IDE integration"
echo "4. Review .mcp.json for additional configuration"
echo -e "\n${YELLOW}Available MCPs:${NC}"
echo "- context7: Enhanced code context management ✓"
echo "- testsprite: Automated validation (existing) ✓"
echo "- security: Security scanning (configured) ✓"
echo "- api-monitor: API monitoring (configured) ✓"
echo -e "\n${GREEN}Happy coding with MCPs! 🚀${NC}"