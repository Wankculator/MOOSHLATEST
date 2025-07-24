# 🚀 MOOSH Wallet - Quick Start Commands

## Start Both Servers (Copy & Paste)

### Terminal 1 - API Server:
```bash
cd "/mnt/c/Users/sk84l/OneDrive/Desktop/MOOSH WALLET/src/server" && node simple-server.js
```

### Terminal 2 - Main Wallet:
```bash
cd "/mnt/c/Users/sk84l/OneDrive/Desktop/MOOSH WALLET" && node src/server/server.js
```

## Access Your Wallet
Open your browser and go to: **http://localhost:3333**

## Test API is Working
```bash
curl http://localhost:3001/api/health
```

## Stop All Servers
```bash
pkill -f node
```

That's it! Your MOOSH Wallet is now running with real data integration! 🎉