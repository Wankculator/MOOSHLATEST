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
