#!/bin/bash

echo ""
echo "============================================"
echo "   STARTING MOOSH WALLET..."
echo "============================================"
echo ""

cd "$(dirname "$0")"

echo "Installing dependencies if needed..."
cd src/server
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

echo ""
echo "Starting wallet server..."
echo ""
node start-moosh-wallet.js