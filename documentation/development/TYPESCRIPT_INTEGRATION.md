# TypeScript Integration Guide

## Overview

MOOSH Wallet now includes comprehensive TypeScript definitions for improved development experience, type safety, and IDE support. While the core application remains in JavaScript, these type definitions provide:

- **IntelliSense support** in VS Code and other IDEs
- **Type checking** for better code quality
- **Auto-completion** for faster development
- **Documentation** through JSDoc comments
- **Refactoring support** with confidence

## Structure

```
/types/
├── index.d.ts          # Main entry point and app-level types
├── global.d.ts         # Global type augmentations
└── modules/
    ├── index.d.ts      # Module exports
    ├── core.d.ts       # Core system types (StateManager, Router, etc.)
    ├── ui.d.ts         # UI component types
    ├── features.d.ts   # Feature types (Spark, Ordinals, etc.)
    ├── pages.d.ts      # Page component types
    ├── utils.d.ts      # Utility function types
    └── modals.d.ts     # Modal component types
```

## Usage

### In JavaScript Files

Add JSDoc type annotations to get TypeScript benefits in JavaScript:

```javascript
/**
 * @type {import('./types').MOOSHWalletApp}
 */
const app = window.app;

/**
 * @param {import('./types/modules/core').StateManager} state
 * @returns {void}
 */
function updateState(state) {
    state.set('balance', 100000);
}
```

### Type Checking JavaScript

Enable type checking in VS Code by adding to the top of JavaScript files:

```javascript
// @ts-check
```

Or create a `jsconfig.json`:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "types": ["./types"]
  },
  "include": ["src/**/*", "public/**/*"],
  "exclude": ["node_modules"]
}
```

### In TypeScript Files

If migrating parts to TypeScript:

```typescript
import { MOOSHWalletApp, NotificationType } from 'moosh-wallet';
import { StateManager, Router } from 'moosh-wallet/modules/core';

const app: MOOSHWalletApp = window.app;

function showNotification(message: string, type: NotificationType = 'info'): void {
    app.showNotification(message, type, 5000);
}
```

## Key Types

### Application Types

- **MOOSHWalletApp**: Main application interface
- **NotificationType**: 'success' | 'error' | 'warning' | 'info'
- **AppEvent**: Application event names
- **BitcoinNetwork**: 'mainnet' | 'testnet' | 'regtest'

### Core Module Types

- **StateManager**: Application state management
- **Router**: Navigation and routing
- **APIService**: Backend API communication
- **Component**: Base component class
- **ElementFactory**: DOM element creation

### Feature Types

- **SparkStateManager**: Spark Protocol state
- **SparkSDKService**: Spark SDK integration
- **OrdinalsManager**: Bitcoin Ordinals/NFTs
- **PriceTicker**: Real-time price updates
- **SettingsManager**: Application settings

### UI Component Types

- **Header**: Top navigation
- **Terminal**: Command-line interface
- **Button**: Button component
- **TransactionHistory**: Transaction list
- **QRCode**: QR code generator

## Benefits

### 1. Development Speed

```javascript
// Before: Need to remember exact API
app.state.set('wallet', { ... });

// After: IDE shows available methods and parameters
app.state. // Auto-complete shows: get, set, delete, has, clear, subscribe
```

### 2. Error Prevention

```javascript
// TypeScript catches typos and wrong types
app.showNotification('Success!', 'succes'); // Error: Did you mean 'success'?
app.state.set('balance', '1000'); // Warning: Expected number, got string
```

### 3. Refactoring Safety

When renaming methods or changing signatures, TypeScript helps find all usages:

```javascript
// If changing state.set() to state.update()
// TypeScript will highlight all places that need updating
```

### 4. Documentation

Hover over any typed element to see documentation:

```javascript
app.router.navigate(
    // Hover shows: (method) Router.navigate(path: string, params?: Record<string, any>): void
);
```

## Best Practices

### 1. Use Type Imports in JSDoc

```javascript
/**
 * @param {import('./types/modules/features').SparkWallet} wallet
 * @param {import('./types/modules/features').SparkBalance} balance
 */
function updateWalletDisplay(wallet, balance) {
    // Implementation
}
```

### 2. Define Return Types

```javascript
/**
 * @returns {Promise<import('./types/modules/features').SparkTransaction[]>}
 */
async function getTransactions() {
    return app.apiService.get('/api/spark/transactions');
}
```

### 3. Type Event Handlers

```javascript
/**
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleClick(event) {
    event.preventDefault();
    // Handle click
}
```

### 4. Use Union Types

```javascript
/**
 * @param {'bitcoin' | 'spark' | 'lightning'} network
 */
function switchNetwork(network) {
    // Implementation
}
```

## Extending Types

### Adding New Types

Create new type definition files in `/types/modules/`:

```typescript
// types/modules/my-feature.d.ts
export interface MyFeature {
    id: string;
    name: string;
    process(): Promise<void>;
}
```

### Extending Existing Types

Use declaration merging:

```typescript
// types/extensions.d.ts
declare module 'moosh-wallet' {
    interface MOOSHWalletApp {
        myNewMethod(): void;
    }
}
```

## IDE Configuration

### VS Code

Install recommended extensions:
- **JavaScript and TypeScript Nightly**
- **ESLint**
- **Path IntelliSense**

Settings (`/.vscode/settings.json`):

```json
{
    "typescript.validate.enable": true,
    "javascript.validate.enable": true,
    "javascript.suggest.paths": true,
    "typescript.suggest.paths": true
}
```

### WebStorm

TypeScript support is built-in. Enable:
- **Settings → Languages & Frameworks → JavaScript → Libraries**
- Add `/types` directory as a library

## Migration Path

For gradually adopting TypeScript:

1. **Phase 1**: Use type definitions with JSDoc (current)
2. **Phase 2**: Convert utilities to TypeScript
3. **Phase 3**: Convert components to TypeScript
4. **Phase 4**: Convert core modules to TypeScript
5. **Phase 5**: Full TypeScript migration

## Troubleshooting

### Types Not Recognized

```bash
# Restart TypeScript service in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Module Resolution Issues

Check `tsconfig.json` paths:

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "moosh-wallet": ["./types/index.d.ts"],
            "moosh-wallet/*": ["./types/*"]
        }
    }
}
```

### Type Conflicts

If seeing duplicate identifier errors:

```json
{
    "compilerOptions": {
        "skipLibCheck": true
    }
}
```

## Conclusion

TypeScript definitions provide immediate value without requiring a full rewrite. Use them to:

- ✅ Catch errors early
- ✅ Improve code quality
- ✅ Speed up development
- ✅ Document APIs
- ✅ Enable safe refactoring

The investment in type definitions pays off through reduced bugs and improved developer experience.