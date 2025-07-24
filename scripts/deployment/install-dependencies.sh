#!/bin/bash

echo "🔧 MOOSH Wallet Dependency Installation Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Cleaning old installations..."
rm -rf node_modules package-lock.json

echo "📥 Installing production dependencies..."
npm install --production

echo "📥 Installing development dependencies..."
npm install --save-dev

echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 To start the wallet:"
echo "   1. Start both servers: node start-all.js"
echo "   2. Or individually:"
echo "      - UI Server: node src/server/server.js"
echo "      - API Server: node src/server/wallet-api-server.js"
echo ""
echo "🌐 Access the wallet at: http://localhost:3333"
echo "📡 API endpoints at: http://localhost:3001"