#!/bin/bash

echo "=========================================="
echo "    RUNNING YOUR REAL MOOSH WALLET UI"
echo "=========================================="
echo

echo "Starting your actual wallet UI (Port 8080)..."
node moosh-ui-server.js &
UI_PID=$!

echo "Starting API Server (Port 3001)..."
node src/server/api-server.js &
API_PID=$!

sleep 3

echo
echo "=========================================="
echo "   YOUR MOOSH WALLET IS RUNNING!"
echo "=========================================="
echo
echo "Open in browser: http://localhost:8080"
echo
echo "Your real MOOSH Wallet UI includes:"
echo "- Landing page with 'Get Started'"
echo "- Dashboard with wallet info"
echo "- Send/Receive/Swap buttons"
echo "- Settings and theme toggle"
echo "- All your custom styling"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "kill $UI_PID $API_PID; exit" INT
wait