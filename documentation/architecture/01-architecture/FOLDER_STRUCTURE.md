# 🗂️ MOOSH Wallet - Clean Folder Structure

## 📁 Main Structure:
```
MOOSH WALLET/
├── 📁 public/               # Your wallet UI (KEEP THIS!)
│   ├── index.html          # Entry point with loading screen
│   ├── favicon.ico         
│   ├── 📁 css/            
│   │   └── styles.css      # Additional styles
│   ├── 📁 js/             
│   │   └── moosh-wallet.js # Main wallet app (12k+ lines)
│   └── 📁 images/         # UI images
│
├── 📁 src/                 # Source code
│   ├── 📁 server/         
│   │   ├── server.js       # UI server (port 3333)
│   │   ├── api-server.js   # API server (port 3001)
│   │   └── 📁 services/   
│   │       ├── walletService.js           # Core wallet logic
│   │       └── sparkCompatibleService.js  # UI compatibility
│   └── 📁 web/            # Additional web resources
│
├── 📁 docs/                # All documentation
│   ├── All .md files moved here
│   ├── 📁 development/    
│   ├── 📁 handoff/        
│   ├── 📁 reports/        
│   └── 📁 user-guides/    
│
├── 📁 scripts/             # Build and utility scripts
│   ├── 📁 batch/          # Windows .bat files
│   ├── All .sh files      
│   └── build.js           
│
├── 📁 04_ASSETS/           # Brand assets
│   └── 📁 Brand_Assets/   
│       └── 📁 Logos/      # MOOSH logos
│
├── 📁 backup_before_cleanup/  # Backup folder (can delete later)
│
├── 📄 package.json         # Project config
├── 📄 .gitignore          
├── 📄 START_BOTH_SERVERS.bat  # Quick start script
└── 📄 FOLDER_STRUCTURE.md  # This file
```

## 🚀 How to Run Your Wallet:

### Windows (Easy):
```
Double-click: START_BOTH_SERVERS.bat
```

### Manual:
```bash
# Terminal 1 - UI Server:
node src/server/server.js

# Terminal 2 - API Server:
node src/server/api-server.js
```

### Open Wallet:
```
http://localhost:3333
```

## ✅ What We Kept:
- Your working UI in `/public`
- Essential servers in `/src/server`
- Wallet services for real crypto generation
- Documentation in `/docs`
- Scripts in `/scripts`
- Brand assets

## 🗑️ What We Removed:
- 15+ test files (test*.html, test*.js)
- Duplicate server files
- Temporary demo files
- Log files
- Verification scripts
- Duplicate wallet implementations

## 📝 Your Working Setup:
- **UI**: `/public/js/moosh-wallet.js` (your main wallet)
- **Server**: `src/server/server.js` (serves the UI)
- **API**: `src/server/api-server.js` (wallet generation)
- **Services**: Real BIP39 wallet generation

Your folder is now clean and organized! The wallet at http://localhost:3333 is your main working version with real crypto generation.