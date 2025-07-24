# WalletImportedPage

**Last Updated**: 2025-07-21 - Claude Opus 4
**Related Files**: 
- `/public/js/moosh-wallet.js` (Lines 8848-9021)

## Overview
The WalletImportedPage displays success confirmation after importing an existing wallet from a seed phrase. It shows recovered wallet information, existing balance, and provides options to access the wallet or scan for additional funds.

## Class Definition

```javascript
class WalletImportedPage extends Component {
    constructor(app) {
        super(app);
        this.importedWallet = null;
        this.scanProgress = 0;
    }
}
```

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `app` | MOOSHWalletApp | Main application instance |
| `importedWallet` | Object | Imported wallet data |
| `scanProgress` | Number | Progress of address scanning (0-100) |

## Core Methods

### `render()`
Main render method that creates the import success interface.

```javascript
render() {
    // Get imported wallet data
    this.importedWallet = this.app.state.get('importedWallet') || 
                         JSON.parse(sessionStorage.getItem('importedWallet') || '{}');
    
    if (!this.importedWallet.address) {
        // Redirect if no wallet data
        this.app.router.navigate('/');
        return $.div();
    }
    
    const card = $.div({ className: 'card import-success-card' }, [
        this.createSuccessHeader(),
        this.createWalletSummary(),
        this.createBalanceDisplay(),
        this.createAddressInfo(),
        this.createScanStatus(),
        this.createActionButtons()
    ]);
    
    // Start background scanning for funds
    this.startAddressScanning();
    
    return card;
}
```

### `createSuccessHeader()`
Creates the import success header.

```javascript
createSuccessHeader() {
    return $.div({
        style: {
            textAlign: 'center',
            marginBottom: 'calc(32px * var(--scale-factor))'
        }
    }, [
        $.div({
            className: 'import-icon',
            style: {
                width: 'calc(80px * var(--scale-factor))',
                height: 'calc(80px * var(--scale-factor))',
                margin: '0 auto calc(24px * var(--scale-factor)) auto',
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-accent) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'calc(36px * var(--scale-factor))',
                color: 'var(--bg-primary)'
            }
        }, ['↓']),
        
        $.h2({
            className: 'gradient-text',
            style: {
                fontSize: 'calc(28px * var(--scale-factor))',
                marginBottom: 'calc(8px * var(--scale-factor))',
                fontWeight: '600'
            }
        }, ['Wallet Imported Successfully!']),
        
        $.p({
            className: 'text-dim',
            style: {
                fontSize: 'calc(16px * var(--scale-factor))',
                lineHeight: '1.6'
            }
        }, ['Your wallet has been restored from the seed phrase'])
    ]);
}
```

### `createWalletSummary()`
Shows summary of imported wallet information.

```javascript
createWalletSummary() {
    const { name, createdAt, lastActivity } = this.importedWallet;
    
    return $.div({
        className: 'wallet-summary',
        style: {
            background: 'var(--bg-secondary)',
            borderRadius: 'calc(12px * var(--scale-factor))',
            padding: 'calc(20px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            border: '1px solid var(--border-color)'
        }
    }, [
        $.h3({
            style: {
                fontSize: 'calc(18px * var(--scale-factor))',
                marginBottom: 'calc(16px * var(--scale-factor))',
                color: 'var(--text-secondary)'
            }
        }, ['Wallet Information']),
        
        this.createInfoRow('Wallet Name', name || 'Imported Wallet'),
        this.createInfoRow('Created', this.formatDate(createdAt)),
        this.createInfoRow('Last Activity', this.formatDate(lastActivity) || 'No activity found'),
        this.createInfoRow('Addresses Found', this.importedWallet.addressCount || '1')
    ]);
}
```

### `createBalanceDisplay()`
Shows recovered wallet balance.

```javascript
createBalanceDisplay() {
    const { balance = {} } = this.importedWallet;
    const totalBalance = (balance.confirmed || 0) + (balance.unconfirmed || 0);
    
    return $.div({
        className: 'balance-display',
        style: {
            background: 'linear-gradient(135deg, var(--accent-bg) 0%, var(--accent-bg-hover) 100%)',
            borderRadius: 'calc(12px * var(--scale-factor))',
            padding: 'calc(24px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            border: '1px solid var(--border-active)',
            textAlign: 'center'
        }
    }, [
        $.div({
            style: {
                fontSize: 'calc(14px * var(--scale-factor))',
                color: 'var(--text-dim)',
                marginBottom: 'calc(8px * var(--scale-factor))'
            }
        }, ['Total Balance']),
        
        $.div({
            style: {
                fontSize: 'calc(36px * var(--scale-factor))',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'calc(8px * var(--scale-factor))'
            }
        }, [this.formatSatoshis(totalBalance) + ' sats']),
        
        $.div({
            style: {
                fontSize: 'calc(16px * var(--scale-factor))',
                color: 'var(--text-secondary)'
            }
        }, [`≈ ${this.convertToUSD(totalBalance)} USD`]),
        
        // Show breakdown if there's unconfirmed balance
        balance.unconfirmed > 0 ? this.createBalanceBreakdown(balance) : null
    ]);
}
```

### `createScanStatus()`
Shows the status of address scanning.

```javascript
createScanStatus() {
    return $.div({
        id: 'scan-status',
        className: 'scan-status',
        style: {
            background: 'var(--bg-secondary)',
            borderRadius: 'calc(12px * var(--scale-factor))',
            padding: 'calc(20px * var(--scale-factor))',
            marginBottom: 'calc(24px * var(--scale-factor))',
            border: '1px solid var(--border-color)'
        }
    }, [
        $.h4({
            style: {
                fontSize: 'calc(16px * var(--scale-factor))',
                marginBottom: 'calc(12px * var(--scale-factor))',
                color: 'var(--text-secondary)'
            }
        }, ['Scanning for Additional Addresses']),
        
        $.div({
            className: 'progress-bar',
            style: {
                width: '100%',
                height: 'calc(8px * var(--scale-factor))',
                background: 'var(--bg-primary)',
                borderRadius: 'calc(4px * var(--scale-factor))',
                overflow: 'hidden',
                marginBottom: 'calc(12px * var(--scale-factor))'
            }
        }, [
            $.div({
                id: 'scan-progress-bar',
                style: {
                    width: '0%',
                    height: '100%',
                    background: 'var(--text-primary)',
                    transition: 'width 0.3s ease'
                }
            })
        ]),
        
        $.p({
            id: 'scan-status-text',
            className: 'text-dim',
            style: {
                fontSize: 'calc(14px * var(--scale-factor))',
                margin: 0
            }
        }, ['Initializing scan...'])
    ]);
}
```

### `startAddressScanning()`
Initiates background scanning for used addresses.

```javascript
async startAddressScanning() {
    const scanStatusText = document.getElementById('scan-status-text');
    const progressBar = document.getElementById('scan-progress-bar');
    
    try {
        // Scan different derivation paths
        const paths = [
            { path: "m/84'/0'/0'", type: 'Native SegWit (bc1...)' },
            { path: "m/49'/0'/0'", type: 'Nested SegWit (3...)' },
            { path: "m/44'/0'/0'", type: 'Legacy (1...)' }
        ];
        
        let totalAddresses = 0;
        let totalBalance = 0;
        
        for (let i = 0; i < paths.length; i++) {
            const pathInfo = paths[i];
            
            // Update status
            if (scanStatusText) {
                scanStatusText.textContent = `Scanning ${pathInfo.type} addresses...`;
            }
            
            // Scan addresses for this path
            const result = await this.scanDerivationPath(pathInfo.path);
            totalAddresses += result.addressCount;
            totalBalance += result.balance;
            
            // Update progress
            this.scanProgress = ((i + 1) / paths.length) * 100;
            if (progressBar) {
                progressBar.style.width = `${this.scanProgress}%`;
            }
            
            // Update wallet data
            this.importedWallet.addressCount = totalAddresses;
            this.importedWallet.balance.confirmed = totalBalance;
            
            // Refresh balance display
            this.refreshBalanceDisplay();
        }
        
        // Scan complete
        if (scanStatusText) {
            scanStatusText.textContent = `Scan complete. Found ${totalAddresses} addresses with funds.`;
        }
        
        // Save updated wallet data
        this.saveImportedWallet();
        
    } catch (error) {
        console.error('[WalletImportedPage] Scan error:', error);
        if (scanStatusText) {
            scanStatusText.textContent = 'Scan failed. You can retry from the wallet dashboard.';
        }
    }
}
```

### `scanDerivationPath(path)`
Scans addresses for a specific derivation path.

```javascript
async scanDerivationPath(path) {
    const gapLimit = 20; // BIP44 gap limit
    let addressIndex = 0;
    let consecutiveEmpty = 0;
    let totalBalance = 0;
    let usedAddresses = [];
    
    while (consecutiveEmpty < gapLimit) {
        // Derive address at index
        const address = await this.deriveAddress(path, addressIndex);
        
        // Check address balance and history
        const addressInfo = await this.app.apiService.getAddressInfo(address);
        
        if (addressInfo.totalReceived > 0) {
            // Address has been used
            consecutiveEmpty = 0;
            totalBalance += addressInfo.balance;
            usedAddresses.push({
                address,
                index: addressIndex,
                balance: addressInfo.balance,
                txCount: addressInfo.txCount
            });
        } else {
            // Empty address
            consecutiveEmpty++;
        }
        
        addressIndex++;
        
        // Update progress periodically
        if (addressIndex % 5 === 0) {
            this.updateScanProgress(path, addressIndex);
        }
    }
    
    return {
        addressCount: usedAddresses.length,
        balance: totalBalance,
        addresses: usedAddresses
    };
}
```

### `createActionButtons()`
Creates action buttons for wallet access.

```javascript
createActionButtons() {
    return $.div({
        style: {
            display: 'flex',
            gap: 'calc(12px * var(--scale-factor))',
            justifyContent: 'center',
            flexWrap: 'wrap'
        }
    }, [
        $.button({
            className: 'btn-primary',
            onclick: () => this.accessWallet(),
            disabled: this.scanProgress < 100,
            style: {
                minWidth: 'calc(150px * var(--scale-factor))'
            }
        }, ['Access Wallet']),
        
        $.button({
            className: 'btn-secondary',
            onclick: () => this.rescanAddresses(),
            style: {
                minWidth: 'calc(150px * var(--scale-factor))'
            }
        }, ['Rescan Addresses']),
        
        $.button({
            className: 'btn-secondary',
            onclick: () => this.exportAddresses(),
            style: {
                minWidth: 'calc(150px * var(--scale-factor))'
            }
        }, ['Export Address List'])
    ]);
}
```

## Advanced Features

### Multi-Account Discovery
```javascript
async discoverAccounts() {
    const accounts = [];
    let accountIndex = 0;
    let emptyAccounts = 0;
    
    while (emptyAccounts < 3) { // Check 3 empty accounts
        const accountPath = `m/84'/0'/${accountIndex}'`;
        const result = await this.scanDerivationPath(accountPath);
        
        if (result.addressCount > 0) {
            accounts.push({
                index: accountIndex,
                path: accountPath,
                balance: result.balance,
                addresses: result.addresses
            });
            emptyAccounts = 0;
        } else {
            emptyAccounts++;
        }
        
        accountIndex++;
    }
    
    return accounts;
}
```

### Transaction History Recovery
```javascript
async recoverTransactionHistory() {
    const allAddresses = this.importedWallet.addresses || [];
    const transactions = [];
    
    for (const addr of allAddresses) {
        const txs = await this.app.apiService.getAddressTransactions(addr);
        transactions.push(...txs);
    }
    
    // Sort by timestamp
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Remove duplicates
    const uniqueTxs = transactions.filter((tx, index, self) =>
        index === self.findIndex(t => t.txid === tx.txid)
    );
    
    this.importedWallet.transactions = uniqueTxs;
    return uniqueTxs;
}
```

## Common Issues

### Issue: Scan Taking Too Long
**Problem**: Address scanning times out or takes too long
**Solution**: 
```javascript
// Implement batch scanning with timeout
async batchScanAddresses(addresses, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        
        try {
            const batchResults = await Promise.race([
                Promise.all(batch.map(addr => this.getAddressInfo(addr))),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Batch timeout')), 5000)
                )
            ]);
            
            results.push(...batchResults);
        } catch (error) {
            console.error('Batch scan failed:', error);
            // Continue with next batch
        }
        
        // Update progress
        this.updateScanProgress((i + batch.length) / addresses.length * 100);
    }
    
    return results;
}
```

### Issue: Missing Historical Data
**Problem**: Old transactions not showing up
**Solution**:
```javascript
// Deep scan with multiple data sources
async deepHistoricalScan(address) {
    const sources = [
        this.app.apiService.getAddressHistory,
        this.app.blockchainExplorer.getAddressData,
        this.app.electrumServer.getHistory
    ];
    
    const results = await Promise.allSettled(
        sources.map(source => source(address))
    );
    
    // Merge results from successful sources
    const mergedData = results
        .filter(r => r.status === 'fulfilled')
        .reduce((acc, r) => ({
            ...acc,
            ...r.value
        }), {});
    
    return mergedData;
}
```

## Testing Approaches

### Unit Testing
```javascript
describe('WalletImportedPage', () => {
    let app, page;
    
    beforeEach(() => {
        app = new MOOSHWalletApp();
        page = new WalletImportedPage(app);
        
        // Mock imported wallet data
        app.state.set('importedWallet', {
            name: 'Test Import',
            address: 'bc1qtest...',
            balance: { confirmed: 100000, unconfirmed: 0 }
        });
    });
    
    test('should display imported wallet info', () => {
        const element = page.render();
        expect(element.textContent).toContain('Test Import');
        expect(element.textContent).toContain('100,000 sats');
    });
    
    test('should scan addresses progressively', async () => {
        const mockScan = jest.spyOn(page, 'scanDerivationPath')
            .mockResolvedValue({ addressCount: 5, balance: 50000 });
        
        await page.startAddressScanning();
        
        expect(mockScan).toHaveBeenCalledTimes(3); // 3 derivation paths
        expect(page.scanProgress).toBe(100);
    });
});
```

## Best Practices

1. **Show scanning progress** clearly to users
2. **Save progress periodically** during long scans
3. **Allow scan interruption** and resumption
4. **Cache discovered addresses** for faster access
5. **Verify imported balance** against multiple sources

## Performance Optimization

```javascript
// Parallel address scanning
async parallelScan(paths) {
    const workers = [];
    const workerCount = navigator.hardwareConcurrency || 4;
    
    // Create worker pool
    for (let i = 0; i < workerCount; i++) {
        workers.push(new Worker('/workers/address-scanner.js'));
    }
    
    // Distribute paths among workers
    const pathChunks = this.chunkArray(paths, workerCount);
    
    const results = await Promise.all(
        pathChunks.map((chunk, index) => 
            this.scanWithWorker(workers[index], chunk)
        )
    );
    
    // Cleanup workers
    workers.forEach(w => w.terminate());
    
    return results.flat();
}
```

## Related Components

- [ImportSeedPage](./ImportSeedPage.md) - Previous step
- [WalletDashboard](./WalletDashboard.md) - Next destination
- [AddressScanner](../utilities/AddressScanner.md) - Scanning logic
- [BalanceChecker](../utilities/BalanceChecker.md) - Balance verification
- [NotificationSystem](../core/NotificationSystem.md) - Progress updates