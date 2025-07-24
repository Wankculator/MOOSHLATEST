# Settings Button

## Overview
The Settings Button opens the wallet configuration panel where users can manage security settings, display preferences, and wallet options. It's typically represented by a gear icon.

## Component Details

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 9265-9269 (Dashboard button)
- **Context**: Main dashboard action buttons

### Visual Specifications
- **Class**: `btn-secondary`
- **Icon**: ⚙️ (gear) or custom SVG
- **Background**: Black (`#000000`)
- **Border**: 2px solid `var(--border-active)`
- **Text**: "Settings" or icon only
- **Width**: 100% in dashboard
- **Transition**: all 0.2s ease

### Implementation

```javascript
$.button({
    className: 'btn-secondary',
    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
    onclick: () => this.showSettings(),
    onmouseover: function() { 
        this.style.background = 'var(--text-accent)'; 
        this.style.color = '#000000'; 
    },
    onmouseout: function() { 
        this.style.background = '#000000'; 
        this.style.color = 'var(--text-primary)'; 
    }
}, ['⚙️ Settings'])
```

### Click Handler

```javascript
showSettings() {
    const settingsModal = new SettingsModal({
        currentSettings: this.app.getSettings(),
        onSave: (settings) => this.saveSettings(settings),
        sections: [
            'security',
            'display',
            'network',
            'advanced',
            'about'
        ]
    });
    
    settingsModal.show();
}
```

### Settings Categories

#### 1. Security Settings
```javascript
renderSecuritySettings() {
    return $.div({ className: 'settings-section' }, [
        $.h3({}, ['Security']),
        
        // Password change
        this.renderPasswordChange(),
        
        // Auto-lock timeout
        this.renderAutoLockSetting(),
        
        // Biometric authentication
        this.renderBiometricToggle(),
        
        // 2FA settings
        this.render2FASettings(),
        
        // Show seed phrase
        this.renderShowSeedPhrase(),
        
        // Export wallet
        this.renderExportWallet()
    ]);
}
```

#### 2. Display Settings
```javascript
renderDisplaySettings() {
    return $.div({ className: 'settings-section' }, [
        $.h3({}, ['Display']),
        
        // Theme toggle
        this.renderThemeToggle(),
        
        // Currency display
        this.renderCurrencySelector(),
        
        // Language
        this.renderLanguageSelector(),
        
        // Balance visibility
        this.renderPrivacyToggle(),
        
        // Decimal places
        this.renderDecimalSetting()
    ]);
}
```

#### 3. Network Settings
```javascript
renderNetworkSettings() {
    return $.div({ className: 'settings-section' }, [
        $.h3({}, ['Network']),
        
        // Network toggle (mainnet/testnet)
        this.renderNetworkToggle(),
        
        // Custom node URL
        this.renderNodeSettings(),
        
        // Fee preferences
        this.renderFeeSettings(),
        
        // API endpoints
        this.renderAPISettings()
    ]);
}
```

#### 4. Advanced Settings
```javascript
renderAdvancedSettings() {
    return $.div({ className: 'settings-section danger-zone' }, [
        $.h3({}, ['Advanced']),
        
        // UTXO management
        this.renderUTXOSettings(),
        
        // Address type preference
        this.renderAddressTypeSelector(),
        
        // Debug mode
        this.renderDebugToggle(),
        
        // Clear cache
        this.renderClearCache(),
        
        // Reset wallet
        this.renderResetWallet()
    ]);
}
```

### Settings Modal Structure

```javascript
class SettingsModal {
    render() {
        return $.div({ className: 'settings-modal' }, [
            // Header
            $.div({ className: 'settings-header' }, [
                $.h2({}, ['Settings']),
                this.renderCloseButton()
            ]),
            
            // Navigation tabs
            $.div({ className: 'settings-tabs' }, [
                this.renderTabs()
            ]),
            
            // Content area
            $.div({ className: 'settings-content' }, [
                this.renderActiveSection()
            ]),
            
            // Footer with save button
            $.div({ className: 'settings-footer' }, [
                this.renderSaveButton(),
                this.renderCancelButton()
            ])
        ]);
    }
}
```

### Setting Components

1. **Toggle Switch**
   ```javascript
   renderToggleSetting(setting) {
       return $.div({ className: 'setting-item' }, [
           $.label({}, [setting.label]),
           $.div({ 
               className: `toggle ${setting.value ? 'on' : 'off'}`,
               onclick: () => this.toggleSetting(setting.key)
           })
       ]);
   }
   ```

2. **Select Dropdown**
   ```javascript
   renderSelectSetting(setting) {
       return $.div({ className: 'setting-item' }, [
           $.label({}, [setting.label]),
           $.select({
               value: setting.value,
               onchange: (e) => this.updateSetting(setting.key, e.target.value)
           }, setting.options.map(opt => 
               $.option({ value: opt.value }, [opt.label])
           ))
       ]);
   }
   ```

3. **Input Field**
   ```javascript
   renderInputSetting(setting) {
       return $.div({ className: 'setting-item' }, [
           $.label({}, [setting.label]),
           $.input({
               type: setting.type || 'text',
               value: setting.value,
               onchange: (e) => this.updateSetting(setting.key, e.target.value)
           })
       ]);
   }
   ```

### Saving Settings

```javascript
async saveSettings(newSettings) {
    try {
        // Validate settings
        this.validateSettings(newSettings);
        
        // Apply changes
        await this.app.updateSettings(newSettings);
        
        // Save to storage
        localStorage.setItem('wallet_settings', JSON.stringify(newSettings));
        
        // Apply immediate changes
        this.applySettingsChanges(newSettings);
        
        // Show success
        this.showToast('Settings saved successfully', 'success');
        
        // Close modal
        this.close();
        
    } catch (error) {
        this.showError(`Failed to save settings: ${error.message}`);
    }
}
```

### Mobile Behavior
- Full-screen modal on mobile
- Sectioned navigation
- Touch-friendly controls
- Responsive layout

### Related Components
- Settings Modal
- Toggle Switches
- Select Dropdowns
- Input Fields
- Danger Zone Actions