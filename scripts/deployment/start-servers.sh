#!/bin/bash

echo "🚀 Starting MOOSH Wallet Servers..."
echo "=================================="

# Kill any existing node servers
echo "🔄 Stopping any existing servers..."
pkill -f "node.*server" 2>/dev/null
sleep 2

# Start API server
echo "📡 Starting API server on port 3001..."
cd src/server
node simple-server.js &
API_PID=$!
echo "   API Server PID: $API_PID"

# Wait for API server to start
sleep 3

# Start main wallet server
echo "🌐 Starting main wallet server on port 3333..."
cd ../..
node src/server/server.js &
MAIN_PID=$!
echo "   Main Server PID: $MAIN_PID"

echo ""
echo "✅ Both servers are now running!"
echo "=================================="
echo "📍 API Server:    http://localhost:3001"
echo "📍 Wallet App:    http://localhost:3333"
echo "=================================="
echo ""
echo "To stop servers, press Ctrl+C or run: pkill -f 'node.*server'"
echo ""

# Keep script running
wait