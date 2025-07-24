# Export Wallet Button

## Overview
The Export Wallet Button allows users to export their wallet data in various formats for backup or migration purposes. It's located in the wallet settings section.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 10318-10322 (renderExportWallet method)
- **Section**: Settings > Backup

### Visual Specifications
- **Class**: `btn btn-secondary`
- **Background**: Transparent
- **Border**: 2px solid `#666666`
- **Text Color**: `#999999`
- **Text**: "Export Wallet Data"
- **Icon**: 📥 (download icon)
- **Width**: Auto or full-width on mobile

### Implementation

```javascript
renderExportWallet() {
    return $.div({ className: 'setting-item' }, [
        $.button({
            className: 'btn btn-secondary',
            onclick: () => this.exportWalletData()
        }, ['Export Wallet Data'])
    ]);
}
```

### Click Handler

```javascript
async exportWalletData() {
    try {
        // Show export options modal
        const exportModal = new ExportOptionsModal({
            onExport: (options) => this.processExport(options)
        });
        
        exportModal.show();
        
    } catch (error) {
        console.error('Export failed:', error);
        this.showError('Failed to export wallet data');
    }
}
```

### Export Options Modal

```javascript
class ExportOptionsModal {
    render() {
        return $.div({ className: 'export-modal' }, [
            $.h3({}, ['Export Wallet Data']),
            
            // Format selection
            $.div({ className: 'export-formats' }, [
                this.renderFormatOption('json', 'JSON', 'Complete wallet backup'),
                this.renderFormatOption('csv', 'CSV', 'Transaction history only'),
                this.renderFormatOption('pdf', 'PDF', 'Printable backup')
            ]),
            
            // Data selection
            $.div({ className: 'export-data-options' }, [
                this.renderCheckbox('includePrivateKeys', 'Include private keys', true),
                this.renderCheckbox('includeTransactions', 'Include transaction history', true),
                this.renderCheckbox('includeSettings', 'Include settings', true),
                this.renderCheckbox('includeLabels', 'Include address labels', true)
            ]),
            
            // Password protection
            $.div({ className: 'export-security' }, [
                $.label({}, ['Password protect export (recommended)']),
                $.input({
                    type: 'password',
                    id: 'exportPassword',
                    placeholder: 'Enter password'
                })
            ]),
            
            // Action buttons
            $.div({ className: 'export-actions' }, [
                $.button({
                    className: 'btn btn-primary',
                    onclick: () => this.handleExport()
                }, ['Export']),
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.close()
                }, ['Cancel'])
            ])
        ]);
    }
}
```

### Export Processing

```javascript
async processExport(options) {
    const {
        format,
        includePrivateKeys,
        includeTransactions,
        includeSettings,
        includeLabels,
        password
    } = options;
    
    try {
        // Gather data
        const exportData = await this.gatherExportData(options);
        
        // Encrypt if password provided
        let finalData = exportData;
        if (password) {
            finalData = await this.encryptData(exportData, password);
        }
        
        // Generate file based on format
        switch (format) {
            case 'json':
                this.downloadJSON(finalData, password);
                break;
            case 'csv':
                this.downloadCSV(exportData.transactions);
                break;
            case 'pdf':
                await this.generatePDF(exportData);
                break;
        }
        
        // Log export event
        this.logSecurityEvent('WALLET_EXPORTED', { format });
        
        // Show success
        this.showToast('Wallet exported successfully', 'success');
        
    } catch (error) {
        throw error;
    }
}
```

### Data Gathering

```javascript
async gatherExportData(options) {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        network: this.app.state.get('network')
    };
    
    if (options.includePrivateKeys) {
        // Require password verification
        const verified = await this.verifyPassword();
        if (!verified) throw new Error('Password verification failed');
        
        data.wallet = {
            mnemonic: await this.getEncryptedMnemonic(),
            accounts: await this.getAccountsWithKeys()
        };
    }
    
    if (options.includeTransactions) {
        data.transactions = await this.getAllTransactions();
    }
    
    if (options.includeSettings) {
        data.settings = this.app.getSettings();
    }
    
    if (options.includeLabels) {
        data.labels = this.getAddressLabels();
    }
    
    return data;
}
```

### File Generation

```javascript
downloadJSON(data, isEncrypted) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    
    const filename = `moosh-wallet-backup-${Date.now()}${isEncrypted ? '.encrypted' : ''}.json`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
}

downloadCSV(transactions) {
    const csv = this.convertToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    
    const filename = `moosh-wallet-transactions-${Date.now()}.csv`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

async generatePDF(data) {
    // Use PDF generation library
    const pdf = new PDFDocument();
    
    // Add wallet information
    pdf.addPage()
       .setFont('Helvetica')
       .text('MOOSH Wallet Backup', 50, 50)
       .text(`Generated: ${new Date().toLocaleString()}`, 50, 70);
    
    // Add QR codes for addresses
    if (data.wallet) {
        for (const account of data.wallet.accounts) {
            pdf.addPage();
            const qrCode = await this.generateQRCode(account.address);
            pdf.image(qrCode, 50, 100, { width: 200 });
            pdf.text(`Account: ${account.name}`, 50, 320);
            pdf.text(`Address: ${account.address}`, 50, 340);
        }
    }
    
    // Download PDF
    pdf.save(`moosh-wallet-backup-${Date.now()}.pdf`);
}
```

### Security Features

1. **Password Protection**
   ```javascript
   async encryptData(data, password) {
       const salt = crypto.getRandomValues(new Uint8Array(16));
       const key = await this.deriveKey(password, salt);
       const encrypted = await crypto.subtle.encrypt(
           { name: 'AES-GCM', iv: salt },
           key,
           new TextEncoder().encode(JSON.stringify(data))
       );
       
       return {
           encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
           salt: btoa(String.fromCharCode(...salt))
       };
   }
   ```

2. **Verification Required**
   - Password verification for private keys
   - Confirmation dialog
   - Security warnings

### Export Formats

1. **JSON Format**
   - Complete wallet backup
   - Can be re-imported
   - Optional encryption
   - Human-readable

2. **CSV Format**
   - Transaction history only
   - Excel compatible
   - No sensitive data

3. **PDF Format**
   - Printable backup
   - QR codes included
   - Visual format
   - Paper storage

### Mobile Considerations
- File saving uses native APIs
- Share sheet integration
- Cloud storage options
- Simplified UI on mobile

### Related Components
- Export Options Modal
- Password Verification
- File Generator
- QR Code Generator
- Import Wallet Function