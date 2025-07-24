# 🔬 Wallet Compatibility Research & Auto-Detection Guide

## Executive Summary

Professional wallet import requires understanding how different wallet software uses derivation paths. This research provides comprehensive analysis of major Bitcoin wallets and proposes an advanced auto-detection system.

---

## 📊 Major Bitcoin Wallets Analysis

### 1. **Sparrow Wallet**
- **Type**: Advanced Bitcoin wallet
- **Default**: Native SegWit (bc1q)
- **Derivation Paths**:
  - Native SegWit: `m/84'/0'/0'` (default)
  - Taproot: `m/86'/0'/0'`
  - Nested SegWit: `m/49'/0'/0'`
  - Legacy: `m/44'/0'/0'`
- **Special Features**:
  - Custom derivation paths
  - Multi-signature support
  - Hardware wallet integration

### 2. **Electrum**
- **Type**: Lightweight Bitcoin wallet
- **Default**: Native SegWit or Legacy
- **Derivation Paths**:
  - Native SegWit: `m/0'` (non-standard!)
  - Legacy: `m/0` (non-standard!)
  - BIP39 SegWit: `m/84'/0'/0'`
  - BIP39 Legacy: `m/44'/0'/0'`
- **Special Features**:
  - Non-BIP39 seed format (default)
  - Custom word list
  - 2FA wallets

### 3. **BlueWallet**
- **Type**: Mobile-first wallet
- **Default**: Native SegWit
- **Derivation Paths**:
  - Native SegWit: `m/84'/0'/0'`
  - Legacy: `m/44'/0'/0'`
  - Lightning: Custom implementation
- **Special Features**:
  - Lightning Network support
  - Watch-only wallets
  - Vault (multisig)

### 4. **Wasabi Wallet**
- **Type**: Privacy-focused wallet
- **Default**: Native SegWit
- **Derivation Paths**:
  - Native SegWit: `m/84'/0'/0'`
  - Custom gaps for privacy
- **Special Features**:
  - CoinJoin implementation
  - Strict UTXO management
  - Tor integration

### 5. **Ledger Live**
- **Type**: Hardware wallet companion
- **Default**: Native SegWit
- **Derivation Paths**:
  - Native SegWit: `m/84'/0'/0'`
  - Taproot: `m/86'/0'/0'`
  - Nested SegWit: `m/49'/0'/0'`
  - Legacy: `m/44'/0'/0'`
- **Special Features**:
  - Multiple accounts per type
  - Hardware security
  - Multi-coin support

### 6. **Trezor Suite**
- **Type**: Hardware wallet companion
- **Default**: Native SegWit
- **Derivation Paths**:
  - Native SegWit: `m/84'/0'/0'`
  - Taproot: `m/86'/0'/0'`
  - Nested SegWit: `m/49'/0'/0'`
  - Legacy: `m/44'/0'/0'`
- **Special Features**:
  - Coinjoin support
  - Multiple accounts
  - Custom backends

### 7. **Bitcoin Core**
- **Type**: Full node wallet
- **Default**: Legacy (transitioning to descriptors)
- **Derivation Paths**:
  - Non-HD legacy addresses
  - Descriptor wallets (flexible)
- **Special Features**:
  - Full blockchain validation
  - Custom scripts
  - Descriptor wallets

### 8. **Exodus**
- **Type**: Multi-currency wallet
- **Default**: Legacy
- **Derivation Paths**:
  - Legacy: `m/44'/0'/0'`
  - SegWit: `m/84'/0'/0'` (newer versions)
- **Special Features**:
  - Multi-currency
  - Built-in exchange
  - Portfolio tracking

---

## 🔍 Advanced Auto-Detection Algorithm

### Phase 1: Quick Detection
```javascript
async function detectWalletType(mnemonic, options = {}) {
    const { 
        knownAddress, 
        transactionCount,
        approximateBalance 
    } = options;
    
    // Common derivation paths to check
    const pathsToCheck = [
        // Standard BIP paths
        { path: "m/84'/0'/0'/0/0", type: 'segwit', name: 'Native SegWit (BIP84)' },
        { path: "m/86'/0'/0'/0/0", type: 'taproot', name: 'Taproot (BIP86)' },
        { path: "m/49'/0'/0'/0/0", type: 'nestedSegwit', name: 'Nested SegWit (BIP49)' },
        { path: "m/44'/0'/0'/0/0", type: 'legacy', name: 'Legacy (BIP44)' },
        
        // Electrum non-standard paths
        { path: "m/0'/0", type: 'electrum-segwit', name: 'Electrum SegWit' },
        { path: "m/0/0", type: 'electrum-legacy', name: 'Electrum Legacy' },
        
        // Hardware wallet variations
        { path: "m/84'/0'/0'/0/0", type: 'ledger-segwit', name: 'Ledger SegWit' },
        { path: "m/84'/0'/1'/0/0", type: 'ledger-segwit-2', name: 'Ledger Account #2' },
        
        // Other common variations
        { path: "m/0'", type: 'electrum-old', name: 'Old Electrum' },
        { path: "m", type: 'bip32-root', name: 'BIP32 Root' }
    ];
    
    const results = [];
    
    // Generate addresses for each path
    for (const pathInfo of pathsToCheck) {
        const address = await deriveAddress(mnemonic, pathInfo.path);
        const balance = await checkBalance(address);
        
        results.push({
            ...pathInfo,
            address,
            balance,
            hasActivity: balance.transactionCount > 0
        });
        
        // If we have a known address, check for match
        if (knownAddress && address === knownAddress) {
            return {
                detected: true,
                wallet: pathInfo,
                confidence: 1.0
            };
        }
    }
    
    // Sort by likelihood (addresses with activity first)
    results.sort((a, b) => {
        if (a.hasActivity && !b.hasActivity) return -1;
        if (!a.hasActivity && b.hasActivity) return 1;
        return b.balance.total - a.balance.total;
    });
    
    return {
        detected: results[0].hasActivity,
        wallet: results[0],
        allResults: results,
        confidence: results[0].hasActivity ? 0.8 : 0.3
    };
}
```

### Phase 2: Deep Scan
```javascript
async function deepWalletScan(mnemonic, options = {}) {
    const { 
        maxAccounts = 5,
        maxAddresses = 20,
        maxGap = 20 
    } = options;
    
    const walletProfiles = {
        sparrow: {
            paths: ["m/84'/0'/0'", "m/86'/0'/0'", "m/49'/0'/0'", "m/44'/0'/0'"],
            gapLimit: 20,
            features: ['psbt', 'multipath']
        },
        electrum: {
            paths: ["m/0'", "m/0", "m/84'/0'/0'", "m/44'/0'/0'"],
            gapLimit: 5,
            features: ['non-bip39', 'custom-seed']
        },
        bluewallet: {
            paths: ["m/84'/0'/0'", "m/44'/0'/0'"],
            gapLimit: 20,
            features: ['lightning', 'mobile']
        },
        ledger: {
            paths: ["m/84'/0'/0'", "m/86'/0'/0'", "m/49'/0'/0'", "m/44'/0'/0'"],
            gapLimit: 20,
            features: ['hardware', 'multi-account']
        }
    };
    
    const detectedProfiles = [];
    
    for (const [walletName, profile] of Object.entries(walletProfiles)) {
        let matchScore = 0;
        const matchedPaths = [];
        
        for (const basePath of profile.paths) {
            // Check multiple accounts
            for (let account = 0; account < maxAccounts; account++) {
                const accountPath = basePath.replace(/0'$/, `${account}'`);
                
                // Check addresses with gap limit
                let consecutiveEmpty = 0;
                let addressesWithBalance = 0;
                
                for (let index = 0; index < maxAddresses; index++) {
                    const fullPath = `${accountPath}/0/${index}`;
                    const address = await deriveAddress(mnemonic, fullPath);
                    const hasBalance = await checkActivity(address);
                    
                    if (hasBalance) {
                        addressesWithBalance++;
                        consecutiveEmpty = 0;
                        matchedPaths.push({ path: fullPath, address });
                    } else {
                        consecutiveEmpty++;
                        if (consecutiveEmpty >= profile.gapLimit) break;
                    }
                }
                
                if (addressesWithBalance > 0) {
                    matchScore += addressesWithBalance;
                }
            }
        }
        
        if (matchScore > 0) {
            detectedProfiles.push({
                wallet: walletName,
                score: matchScore,
                matchedPaths,
                confidence: Math.min(matchScore / 10, 1.0)
            });
        }
    }
    
    // Sort by score
    detectedProfiles.sort((a, b) => b.score - a.score);
    
    return {
        mostLikely: detectedProfiles[0],
        allMatches: detectedProfiles
    };
}
```

### Phase 3: Smart Import UI
```javascript
class SmartWalletImport {
    constructor(app) {
        this.app = app;
        this.detectionResults = null;
    }
    
    async showImportModal() {
        const modal = new Modal({
            title: 'Import Wallet',
            content: this.createImportForm()
        });
        
        modal.show();
    }
    
    createImportForm() {
        return $.div({}, [
            // Seed phrase input
            $.textarea({
                id: 'import-seed',
                placeholder: 'Enter your 12 or 24 word seed phrase...',
                rows: 4,
                onchange: () => this.validateAndDetect()
            }),
            
            // Detection status
            $.div({ id: 'detection-status' }, [
                $.div({ className: 'detecting', style: 'display: none;' }, [
                    $.span({ className: 'spinner' }),
                    ' Detecting wallet type...'
                ])
            ]),
            
            // Detection results
            $.div({ id: 'detection-results', style: 'display: none;' }),
            
            // Manual override
            $.details({ style: 'margin-top: 20px;' }, [
                $.summary({}, ['Advanced Options']),
                $.div({}, [
                    $.label({}, ['Wallet Software']),
                    $.select({ id: 'wallet-software' }, [
                        $.option({ value: 'auto' }, ['Auto-detect']),
                        $.option({ value: 'sparrow' }, ['Sparrow Wallet']),
                        $.option({ value: 'electrum' }, ['Electrum']),
                        $.option({ value: 'bluewallet' }, ['BlueWallet']),
                        $.option({ value: 'ledger' }, ['Ledger']),
                        $.option({ value: 'trezor' }, ['Trezor']),
                        $.option({ value: 'wasabi' }, ['Wasabi']),
                        $.option({ value: 'custom' }, ['Custom'])
                    ]),
                    
                    $.label({}, ['Derivation Path']),
                    $.input({ 
                        id: 'custom-path',
                        placeholder: "m/84'/0'/0'/0/0",
                        disabled: true
                    })
                ])
            ])
        ]);
    }
    
    async validateAndDetect() {
        const seedPhrase = document.getElementById('import-seed').value.trim();
        const words = seedPhrase.split(/\s+/).filter(w => w.length > 0);
        
        if (words.length !== 12 && words.length !== 24) {
            return;
        }
        
        // Show detecting status
        document.getElementById('detection-status').style.display = 'block';
        
        try {
            // Quick detection first
            const quickResults = await detectWalletType(seedPhrase);
            
            // If high confidence, show results
            if (quickResults.confidence > 0.7) {
                this.showDetectionResults(quickResults);
            } else {
                // Deep scan for better results
                const deepResults = await deepWalletScan(seedPhrase);
                this.showDetectionResults(deepResults);
            }
        } catch (error) {
            this.showError('Detection failed. You can still import manually.');
        }
    }
    
    showDetectionResults(results) {
        const resultsDiv = document.getElementById('detection-results');
        
        if (results.detected || results.mostLikely) {
            const wallet = results.wallet || results.mostLikely;
            
            resultsDiv.innerHTML = `
                <div class="detection-success">
                    <h4>✅ Wallet Detected!</h4>
                    <p>Type: <strong>${wallet.name || wallet.wallet}</strong></p>
                    <p>Confidence: ${Math.round(wallet.confidence * 100)}%</p>
                    ${wallet.matchedPaths ? 
                        `<p>Found ${wallet.matchedPaths.length} addresses with history</p>` : 
                        ''}
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="detection-warning">
                    <h4>⚠️ No Activity Detected</h4>
                    <p>This might be a new wallet or use a non-standard path.</p>
                    <p>We'll import all standard wallet types to be safe.</p>
                </div>
            `;
        }
        
        resultsDiv.style.display = 'block';
    }
}
```

---

## 🎯 Implementation Recommendations

### 1. **Immediate Improvements**
- Add wallet software dropdown in import modal
- Show detection progress with specific paths being checked
- Display found addresses during detection
- Allow manual path override

### 2. **Advanced Features**
- Multi-account detection (scan first 5 accounts)
- Gap limit analysis (detect wallet's gap limit)
- Transaction pattern analysis (identify wallet software by patterns)
- Hardware wallet detection (check common hardware paths)

### 3. **User Experience**
- Show visual progress: "Checking Sparrow paths... ✓"
- Display found balances during scan
- Offer quick presets for common wallets
- Remember last imported wallet type

### 4. **Performance Optimization**
- Parallel address checking
- Cache API responses
- Progressive detection (quick → deep)
- Stop on first match option

---

## 📊 Wallet Compatibility Matrix

| Wallet | SegWit | Taproot | Legacy | Nested | Custom Paths | Multi-Account |
|--------|--------|---------|---------|---------|--------------|---------------|
| Sparrow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Electrum | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| BlueWallet | ✅ | ⚠️ | ✅ | ❌ | ❌ | ✅ |
| Wasabi | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ledger | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Trezor | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Exodus | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Bitcoin Core | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ |

---

## 🚀 Pro Features to Implement

### 1. **Wallet Fingerprinting**
```javascript
// Detect wallet by transaction patterns
async function fingerprintWallet(addresses) {
    const patterns = {
        wasabi: {
            // CoinJoin transactions
            equalOutputs: true,
            minInputs: 50
        },
        sparrow: {
            // PSBT usage
            rbfEnabled: true,
            batchTransactions: true
        }
    };
    
    // Analyze transaction patterns
    const txPatterns = await analyzeTransactions(addresses);
    return matchPatterns(txPatterns, patterns);
}
```

### 2. **Smart Gap Detection**
```javascript
// Intelligently detect gap limit
async function detectGapLimit(mnemonic, basePath) {
    let gap = 0;
    let maxGap = 0;
    
    for (let i = 0; i < 100; i++) {
        const address = await deriveAddress(mnemonic, `${basePath}/0/${i}`);
        const hasActivity = await checkActivity(address);
        
        if (hasActivity) {
            maxGap = Math.max(maxGap, gap);
            gap = 0;
        } else {
            gap++;
            if (gap > 50) break; // Safety limit
        }
    }
    
    return maxGap + 5; // Add safety margin
}
```

### 3. **Multi-Wallet Import**
```javascript
// Import from multiple wallet software simultaneously
async function multiWalletImport(mnemonic) {
    const wallets = await Promise.all([
        importAsSparrow(mnemonic),
        importAsElectrum(mnemonic),
        importAsLedger(mnemonic)
    ]);
    
    // Merge all discovered addresses
    return mergeWalletData(wallets);
}
```

---

## 📚 References

1. **BIP Standards**
   - BIP32: HD Wallets
   - BIP39: Mnemonic Seeds
   - BIP44: Multi-Account Hierarchy
   - BIP49: Nested SegWit
   - BIP84: Native SegWit
   - BIP86: Taproot

2. **Wallet Documentation**
   - Sparrow: https://sparrowwallet.com/docs
   - Electrum: https://electrum.readthedocs.io
   - BlueWallet: https://bluewallet.io/docs

3. **Best Practices**
   - Always scan multiple derivation paths
   - Check first 20 addresses minimum
   - Support non-standard paths
   - Provide manual override options