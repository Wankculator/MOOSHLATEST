# MOOSH Wallet

A professional Bitcoin and Spark Protocol wallet implementation with a retro terminal aesthetic.

## Features

- **Real BIP39 Seed Generation**: Cryptographically secure mnemonic generation (12/24 words)
- **Multi-Address Support**: SegWit, Taproot, Legacy, and Spark Protocol addresses
- **Professional UI**: Responsive design with dark/light themes
- **Secure Architecture**: Server-side seed generation with proper entropy
- **Dashboard Interface**: Complete wallet management dashboard
- **Cross-Platform**: Works on desktop and mobile browsers

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Wankculator/Moosh.git
cd Moosh
```

2. Install dependencies:
```bash
cd src/server
npm install
```

3. Start the servers:

**Windows:**
```bash
# From project root
START_BOTH_SERVERS.bat
```

**macOS/Linux:**
```bash
# Start API server (Terminal 1)
cd src/server
node api-server.js

# Start UI server (Terminal 2)
cd src/server
node server.js
```

4. Open your browser:
```
http://localhost:3333
```

## Architecture

```
MOOSH-WALLET/
├── public/              # Frontend assets
│   ├── index.html      # Main entry point
│   ├── js/             # JavaScript files
│   │   └── moosh-wallet.js  # Main application
│   └── css/            # Stylesheets
├── src/                # Source code
│   └── server/         # Backend services
│       ├── api-server.js    # API server (port 3001)
│       ├── server.js        # UI server (port 3333)
│       └── services/        # Wallet services
├── docs/               # Documentation
└── scripts/            # Utility scripts
```

## Development

### Key Files
- `public/js/moosh-wallet.js` - Main frontend application
- `src/server/api-server.js` - REST API endpoints
- `src/server/services/walletService.js` - Core wallet functionality
- `AI_DEVELOPMENT_GUIDELINES.md` - Development guidelines for AI assistants

### Testing Seed Generation
```bash
node test-seed-generation.cjs
```

### API Endpoints
- `POST /api/wallet/generate` - Generate new wallet
- `POST /api/spark/generate-wallet` - Generate Spark wallet
- `GET /health` - API health check

## Security

- Seeds are generated server-side with proper entropy
- No private keys are stored
- HTTPS recommended for production
- Input validation on all endpoints

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supported

## Contributing

Please read `AI_DEVELOPMENT_GUIDELINES.md` for development guidelines and best practices when working with AI assistants.

## Important Documentation

- `/docs/SEED_GENERATION_IMPLEMENTATION_GUIDE.md` - Complete seed generation implementation guide
- `/docs/SEED_GENERATION_CRITICAL_PATH.md` - Critical seed generation flow
- `/AI_DEVELOPMENT_GUIDELINES.md` - Guidelines for AI-assisted development
- `/05_DOCUMENTATION/MASTER_PROMPT_NEEDED.md` - Comprehensive AI assistant prompt
- `/docs/NAVIGATION_FIX_SUMMARY.md` - Recent navigation fixes
- `/docs/DEVELOPER_GUIDE.md` - Development guidelines

## License

[Your License Here]

## Support

For issues, please check:
1. `/docs/` folder for documentation
2. GitHub Issues
3. `AI_DEVELOPMENT_GUIDELINES.md` for AI-assisted development help

---

Built with [*] by the MOOSH team