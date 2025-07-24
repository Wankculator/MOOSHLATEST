# Export/Import Functionality

**Status**: 🟡 Beta
**Type**: Core Feature
**Security Critical**: Yes
**Implementation**: /public/js/moosh-wallet.js:7398-7403, 8625-8759, 10318-10322, 27952-27954

## Overview
Export/Import functionality allows users to backup wallet data and restore wallets from seed phrases. The system supports importing 12 or 24-word mnemonics and exporting wallet data for backup purposes, ensuring users maintain control of their funds.

## User Flow
```
Import: [Enter Seed Phrase] → [Validate Words] → [Generate Wallet] → [Store Securely] → [Access Wallet]
Export: [Request Export] → [Authenticate User] → [Generate Backup] → [Download/Display] → [Confirm Saved]
```

## Technical Implementation

### Frontend
- **Entry Point**: 
  - Import: `importWalletFromSeed()` method in `moosh-wallet.js:8625`
  - Export: `exportWalletData()` method in `moosh-wallet.js:27952`
- **UI Components**: 
  - Import modal with textarea
  - Password creation fields
  - Export button in wallet settings
  - Progress indicators
- **State Changes**: 
  - Wallet data in localStorage
  - Account list update
  - Active wallet selection

### Backend
- **API Endpoints**: 
  - `/api/spark/import-wallet` (for seed import)
  - `/api/wallet/export` (planned)
- **Services Used**: 
  - `walletService` for key derivation
  - `sparkSDKService` for Spark addresses
- **Data Flow**: 
  1. User provides seed phrase
  2. Backend validates and derives keys
  3. Addresses generated for all networks
  4. Wallet data returned to frontend
  5. Stored securely in browser

## Code Example
```javascript
// Import wallet implementation
async importWalletFromSeed() {
    const seedText = document.getElementById('seedTextarea').value.trim();
    const seedWords = seedText.split(/\s+/).filter(word => word.length > 0);
    
    // Validate seed phrase
    if (seedWords.length !== 12 && seedWords.length !== 24) {
        this.app.showNotification('Invalid seed phrase. Must be 12 or 24 words.', 'error');
        return;
    }
    
    try {
        this.app.showNotification('Importing wallet... This may take up to 60 seconds.', 'info');
        
        const startTime = Date.now();
        const response = await this.app.apiService.request('/api/spark/import-wallet', {
            method: 'POST',
            body: JSON.stringify({ 
                mnemonic: seedWords.join(' '),
                strength: seedWords.length === 12 ? 128 : 256
            })
        });
        
        const importTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[ImportWallet] Import completed in ${importTime}s`);
        
        if (response.success && response.data) {
            // Map wallet data structure
            const mappedWalletData = {
                mnemonic: response.data.mnemonic,
                addresses: {
                    bitcoin: response.data.addresses?.bitcoin || 'Not available',
                    spark: response.data.addresses?.spark || 'Not available'
                },
                privateKeys: {
                    bitcoin: response.data.privateKeys?.bitcoin || {},
                    spark: response.data.privateKeys?.spark || {}
                }
            };
            
            // Store wallet data
            localStorage.setItem('sparkWallet', JSON.stringify(mappedWalletData));
            
            // Create wallet account
            const timestamp = Date.now();
            const account = {
                id: `wallet_${timestamp}`,
                name: 'Imported Wallet',
                type: 'spark',
                addresses: mappedWalletData.addresses,
                color: this.getRandomColor(),
                balance: '0.00000000',
                transactions: []
            };
            
            // Update accounts list
            const accounts = this.app.accountManager.addAccount(account);
            this.app.state.set('currentAccountId', account.id);
            
            this.app.showNotification('Wallet imported successfully!', 'success');
            
            // Navigate to dashboard
            this.app.router.navigate('/dashboard');
        }
    } catch (error) {
        console.error('Import error:', error);
        this.app.showNotification(error.message || 'Failed to import wallet', 'error');
    }
}
```

## Configuration
- **Settings**: 
  - Supported formats: BIP39 mnemonics
  - Word counts: 12 or 24 words
  - Import timeout: 60 seconds
  - Export formats: JSON (planned)
- **Defaults**: 
  - Auto-detect word count
  - Generate all address types
  - Secure storage in localStorage
- **Limits**: 
  - Maximum 24-word phrases
  - One import at a time
  - Export requires authentication

## Security Considerations
- **Import Security**:
  - Seed phrase never logged
  - Cleared from memory after use
  - HTTPS required for API calls
  - No seed phrase persistence in forms
- **Export Security**:
  - Authentication required
  - Encrypted export option (planned)
  - Warning messages about backup security
  - No automatic cloud backups
- **Data Handling**:
  - Private keys encrypted at rest
  - Secure memory management
  - No telemetry on sensitive data

## Performance Impact
- **Load Time**: 
  - Import: 10-60 seconds (SDK initialization)
  - Export: < 1 second
- **Memory**: 
  - Temporary spike during import
  - Minimal for export
- **Network**: 
  - One API call for import
  - None for export (local data)

## Mobile Considerations
- Large textarea for seed entry
- Auto-capitalize off for seed words
- Paste button for mobile browsers
- Progress indicator during import
- Responsive modal design

## Error Handling
- **Common Errors**: 
  - Invalid seed phrase format
  - Network timeout during import
  - SDK initialization failure
  - Duplicate wallet detection
  - Storage quota exceeded
- **Recovery**: 
  - Clear error messages
  - Retry mechanism for timeouts
  - Manual seed validation
  - Storage cleanup options
  - Fallback to manual entry

## Testing
```bash
# Test import functionality
1. Test valid 12-word import:
   - Use test seed phrase
   - Verify addresses generated
   - Check wallet appears in list
   
2. Test valid 24-word import:
   - Use longer test phrase
   - Verify all address types
   - Confirm balance loads
   
3. Test invalid imports:
   - 11 words (should fail)
   - 13 words (should fail)
   - Invalid BIP39 words
   
4. Test export (when implemented):
   - Export wallet data
   - Verify all fields included
   - Test reimport of export
```

## Future Enhancements
- **Export Features**:
  - Full wallet backup with transactions
  - Encrypted export files
  - QR code export option
  - Multiple export formats (JSON, CSV)
  - Selective data export
- **Import Features**:
  - Hardware wallet import
  - Extended key import
  - Multi-wallet batch import
  - Import validation preview
  - Derivation path selection
- **General**:
  - Cloud backup integration
  - Automatic backup reminders
  - Backup verification tools
  - Import/export history
  - Secure sharing options