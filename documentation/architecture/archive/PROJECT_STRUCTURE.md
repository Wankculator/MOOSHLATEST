# MOOSH Wallet Project Structure

## Overview
This document outlines the professional organization of the MOOSH Wallet project.

## Directory Structure

```
moosh-wallet/
├── config/                 # Configuration files
│   ├── .babelrc           # Babel configuration
│   └── .eslintrc.json     # ESLint configuration
│
├── docs/                   # Documentation
│   ├── development/       # Development guides
│   ├── user-guides/       # User documentation
│   └── reports/           # Test reports and analyses
│
├── logs/                   # Application logs (git-ignored)
│   ├── api.log
│   ├── server.log
│   └── *.log
│
├── public/                 # Public assets
│   ├── css/               # Stylesheets
│   ├── fonts/             # Web fonts
│   ├── images/            # Images and icons
│   ├── js/                # Client-side JavaScript
│   └── index.html         # Main HTML file
│
├── scripts/                # Utility scripts
│   ├── windows/           # Windows batch/PowerShell scripts
│   ├── unix/              # Unix/Linux shell scripts
│   └── README.md          # Scripts documentation
│
├── src/                    # Source code
│   ├── client/            # Frontend code
│   ├── server/            # Backend code
│   │   ├── api-server.js  # Main API server
│   │   └── services/      # Service modules
│   └── shared/            # Shared utilities
│
├── .gitignore             # Git ignore rules
├── package.json           # NPM dependencies
├── package-lock.json      # NPM lock file
└── README.md              # Project documentation
```

## Key Directories

### `/src`
Contains all source code for the application:
- **server/**: Node.js backend with Express API
- **client/**: Frontend JavaScript (if separated from public)
- **shared/**: Common utilities and constants

### `/public`
Static assets served by the web server:
- **js/moosh-wallet.js**: Main wallet UI implementation
- **css/**: Styling files
- **fonts/**: JetBrains Mono and other fonts

### `/scripts`
Organized by platform for easy execution:
- **windows/**: `.bat` and `.ps1` scripts
- **unix/**: `.sh` scripts for Linux/macOS

### `/config`
Centralized configuration files for build tools and linters.

### `/docs`
Comprehensive documentation organized by purpose.

## Clean Code Practices

1. **No test files in root** - All tests should be in appropriate directories
2. **No temporary files** - Use `/tmp` or proper cleanup
3. **Organized scripts** - Platform-specific directories
4. **Gitignored logs** - Logs directory is excluded from version control
5. **Clear naming** - Descriptive file and directory names

## Running the Application

```bash
# Start API server
npm run start:api

# Start both servers (Windows)
./scripts/windows/START_BOTH_SERVERS.bat

# Start API server (Unix)
./scripts/unix/start-api.sh
```