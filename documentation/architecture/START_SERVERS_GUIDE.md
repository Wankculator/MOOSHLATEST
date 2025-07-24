# 🚀 How to Start MOOSH Wallet Servers

You need to run **TWO servers** for the full MOOSH Wallet experience:
1. **API Server** (port 3001) - Handles wallet generation, balance checking, etc.
2. **Main Wallet Server** (port 3333) - Serves the wallet UI

## Option 1: Using the Start Script (Recommended)

### On Windows:
```bash
# Just double-click the file:
start-servers.bat

# Or run in terminal:
./start-servers.bat
```

### On Linux/Mac/WSL:
```bash
# Make it executable first
chmod +x start-servers.sh

# Then run it
./start-servers.sh
```

## Option 2: Manual Start (Two Terminals)

### Terminal 1 - API Server:
```bash
cd "/mnt/c/Users/sk84l/OneDrive/Desktop/MOOSH WALLET/src/server"
node simple-server.js
```

You should see:
```
🚀 MOOSH Wallet API Server - Simple Edition
============================================
🌐 Local:    http://localhost:3001
🌐 Network:  http://0.0.0.0:3001
📁 Serving:  /mnt/c/Users/sk84l/OneDrive/Desktop/MOOSH WALLET/public
🕐 Started:  2025-07-07T11:54:13.960Z
💻 Mode:     API + Static Server
🔌 APIs:     /api/spark/*, /api/balance/*, /api/network/*
============================================
```

### Terminal 2 - Main Wallet Server:
```bash
cd "/mnt/c/Users/sk84l/OneDrive/Desktop/MOOSH WALLET"
node src/server/server.js
```

You should see:
```
🚀 MOOSH Wallet Server
====================
🌐 Local: http://localhost:3333
🌐 Network: http://YOUR_IP:3333
📁 Serving from: /public
🚀 Server is running...
====================
```

## 🌐 Access Your Wallet

Once both servers are running:

1. **Open the Wallet App**: http://localhost:3333
2. **API Health Check**: http://localhost:3001/api/health
3. **Test Integration**: Open `test-full-integration.html` in your browser

## 🛠️ Troubleshooting

### If ports are already in use:
```bash
# Kill all Node processes
pkill -f node
# or on Windows:
taskkill /F /IM node.exe

# Then try starting again
```

### Check if servers are running:
```bash
# Check API server
curl http://localhost:3001/api/health

# Check main server
curl http://localhost:3333
```

### View server logs:
The servers will print logs directly in the terminal showing:
- API requests
- Wallet generation
- Balance checks
- Any errors

## 📝 Important URLs

- **Wallet App**: http://localhost:3333
- **API Server**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **Generate Wallet** (POST): http://localhost:3001/api/spark/generate-wallet
- **Network Info**: http://localhost:3001/api/network/info

## 🛑 Stopping the Servers

- **Manual terminals**: Press `Ctrl+C` in each terminal
- **Script started**: Press `Ctrl+C` in the script terminal
- **Force stop all**: `pkill -f node` or `taskkill /F /IM node.exe`