# Component: Multi-Wallet Management

**Last Updated**: 2025-07-21
**Related Files**: 
- `/public/js/moosh-wallet.js` - Lines 18564-19600 (MultiAccountModal)
- `/public/js/moosh-wallet.js` - Lines 6000-6500 (Wallet creation/import)
- `/documentation/architecture/MULTI_WALLET_SYSTEM_MASTER_PLAN.md`

## Overview
The Multi-Wallet Management system allows users to create, import, and manage multiple Bitcoin wallets within a single MOOSH Wallet instance. Each wallet can have multiple accounts with independent balances and transaction histories.

## Component Architecture

### Core Components
1. **WalletManager** - Central wallet management logic
2. **MultiAccountModal** - UI for wallet/account management
3. **WalletStorage** - Secure storage and encryption
4. **AccountCreator** - New account generation

## Implementation Details

### Wallet Data Structure
```javascript
{
    id: 'wallet_1234567890',
    name: 'My Main Wallet',
    type: 'hd', // 'hd' | 'imported' | 'watch-only'
    created: 1627384920000,
    accounts: [
        {
            id: 'account_1',
            name: 'Savings',
            index: 0,
            color: '#69FD97',
            addresses: {
                bitcoin: 'bc1q...',
                spark: 'spark1...'
            },
            balances: {
                bitcoin: 0.00123,
                spark: 1000
            }
        }
    ],
    encrypted: true,
    metadata: {
        lastAccessed: 1627384920000,
        totalValue: 0.00123,
        accountCount: 1
    }
}
```

### Wallet Creation Flow
```javascript
async createNewWallet(name, strength = 128) {
    // Generate new seed phrase
    const mnemonic = await this.generateMnemonic(strength);
    
    // Derive master key
    const masterKey = await this.deriveMasterKey(mnemonic);
    
    // Create first account
    const firstAccount = await this.deriveAccount(masterKey, 0);
    
    // Create wallet object
    const wallet = {
        id: `wallet_${Date.now()}`,
        name: name || 'New Wallet',
        type: 'hd',
        created: Date.now(),
        accounts: [firstAccount],
        encrypted: false
    };
    
    // Encrypt and store
    await this.encryptAndStoreWallet(wallet, mnemonic);
    
    return wallet;
}
```

### Account Derivation
```javascript
async deriveAccount(masterKey, index) {
    // BIP44 derivation path: m/44'/0'/0'/0/index
    const path = `m/44'/0'/0'/0/${index}`;
    
    const bitcoinKey = await this.deriveKey(masterKey, path);
    const sparkKey = await this.deriveSparkKey(masterKey, index);
    
    return {
        id: `account_${Date.now()}_${index}`,
        name: `Account ${index + 1}`,
        index: index,
        color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
        addresses: {
            bitcoin: bitcoinKey.address,
            spark: sparkKey.address
        },
        privateKeys: {
            bitcoin: bitcoinKey.wif,
            spark: sparkKey.hex
        }
    };
}
```

## Visual Specifications

### Multi-Account Modal Layout
```css
.multi-account-modal {
    width: 90%;
    max-width: 800px;
    height: 80%;
    max-height: 600px;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 0;
}

.account-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    padding: 16px;
    overflow-y: auto;
}

.account-card {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.account-card.selected {
    border-color: var(--text-accent);
    background: rgba(105, 253, 151, 0.1);
}

.account-card.dragging {
    opacity: 0.5;
    transform: scale(0.95);
}
```

## DOM Structure
```html
<div class="multi-account-modal">
    <div class="modal-header">
        <h2>Manage Wallets & Accounts</h2>
        <div class="header-actions">
            <button class="btn-create-wallet">Create New Wallet</button>
            <button class="btn-import-wallet">Import Wallet</button>
        </div>
    </div>
    
    <div class="wallet-tabs">
        <div class="wallet-tab active" data-wallet-id="wallet_1">
            <span class="wallet-name">Main Wallet</span>
            <span class="account-count">(3 accounts)</span>
        </div>
        <div class="wallet-tab" data-wallet-id="wallet_2">
            <span class="wallet-name">Trading Wallet</span>
            <span class="account-count">(1 account)</span>
        </div>
    </div>
    
    <div class="account-grid">
        <div class="account-card" draggable="true" data-account-id="account_1">
            <div class="account-color"></div>
            <div class="account-info">
                <h3 class="account-name">Savings</h3>
                <div class="account-balance">0.00123 BTC</div>
                <div class="account-address">bc1q...xyz</div>
            </div>
            <div class="account-actions">
                <button class="btn-rename">✏️</button>
                <button class="btn-delete">🗑️</button>
            </div>
        </div>
    </div>
</div>
```

## Drag & Drop Implementation
```javascript
initializeDragAndDrop() {
    const cards = document.querySelectorAll('.account-card');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', this.handleDragStart.bind(this));
        card.addEventListener('dragend', this.handleDragEnd.bind(this));
        card.addEventListener('dragover', this.handleDragOver.bind(this));
        card.addEventListener('drop', this.handleDrop.bind(this));
    });
}

handleDragStart(e) {
    this.draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

handleDrop(e) {
    if (e.target.classList.contains('account-card')) {
        const draggedId = this.draggedElement.dataset.accountId;
        const targetId = e.target.dataset.accountId;
        
        // Reorder accounts
        this.reorderAccounts(draggedId, targetId);
    }
}
```

## Security Features

### Wallet Encryption
```javascript
async encryptWallet(wallet, password) {
    const salt = crypto.randomBytes(32);
    const key = await this.deriveKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: crypto.randomBytes(16)
        },
        key,
        new TextEncoder().encode(JSON.stringify(wallet))
    );
    
    return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        salt: Array.from(salt),
        iv: Array.from(iv)
    };
}
```

### Access Control
```javascript
async unlockWallet(walletId, password) {
    const encryptedData = await this.storage.getWallet(walletId);
    
    try {
        const decrypted = await this.decryptWallet(encryptedData, password);
        
        // Set session timeout
        this.setWalletSession(walletId, {
            unlocked: true,
            timeout: Date.now() + (15 * 60 * 1000) // 15 minutes
        });
        
        return decrypted;
    } catch (error) {
        throw new Error('Invalid password');
    }
}
```

## State Management
- **wallets**: Array of all wallets
- **currentWalletId**: Active wallet ID
- **currentAccountId**: Active account within wallet
- **sessions**: Wallet unlock sessions with timeouts

## API Integration
- Balance updates fetch for all active accounts
- Transaction history aggregated across accounts
- Separate API calls per account for isolation

## Testing
```bash
# Test wallet creation
npm run test:wallet-creation

# Test account derivation
npm run test:account-derivation

# Test encryption/decryption
npm run test:wallet-encryption

# Test drag & drop
npm run test:e2e:drag-drop
```

## Known Issues
1. Drag & drop can be laggy with many accounts
2. Password recovery not implemented
3. Import validation needs strengthening

## Performance Considerations
1. Lazy load account balances
2. Cache decrypted wallets in memory
3. Batch API calls for multiple accounts
4. Virtual scrolling for large account lists

## Git Recovery Commands
```bash
# Restore multi-wallet functionality
git checkout 690aca1 -- public/js/moosh-wallet.js

# View implementation history
git log -p --grep="multi.*wallet" -- public/js/moosh-wallet.js

# Restore wallet service
git checkout 4a1397e -- src/server/services/walletService.js
```

## Related Components
- [Account Switching System](./AccountSwitchingSystem.md)
- [Import Wallet Modal](../modals/ImportWalletModal.md)
- [Wallet Settings Modal](./WalletSettingsModal.md)
- [Security Features](./SecurityFeatures.md)