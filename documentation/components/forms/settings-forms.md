# Settings Forms Documentation

## Overview
Settings forms configure application preferences, security options, network settings, and display preferences in MOOSH Wallet.

## 1. Currency Selector

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25218-25222, 18835-18838
- **Component**: GeneralSettings

### Implementation
```javascript
$.select({ 
    className: 'setting-input',
    value: this.currentCurrency,
    onchange: (e) => this.updateCurrency(e.target.value)
}, [
    $.option({ value: 'USD' }, 'USD - US Dollar'),
    $.option({ value: 'EUR' }, 'EUR - Euro'),
    $.option({ value: 'GBP' }, 'GBP - British Pound'),
    $.option({ value: 'JPY' }, 'JPY - Japanese Yen'),
    $.option({ value: 'CAD' }, 'CAD - Canadian Dollar'),
    $.option({ value: 'AUD' }, 'AUD - Australian Dollar'),
    $.option({ value: 'CHF' }, 'CHF - Swiss Franc'),
    $.option({ value: 'CNY' }, 'CNY - Chinese Yuan')
])
```

### Currency Update Handler
```javascript
updateCurrency(currency) {
    // Validate currency code
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    if (!validCurrencies.includes(currency)) {
        return;
    }
    
    // Update state
    this.app.state.set('currency', currency);
    
    // Update display
    this.refreshPriceDisplays();
    
    // Persist preference
    localStorage.setItem('preferredCurrency', currency);
}
```

---

## 2. Language Selector

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25229-25233
- **Component**: GeneralSettings

### Implementation
```javascript
$.select({ 
    className: 'setting-input',
    value: this.currentLanguage,
    onchange: (e) => this.updateLanguage(e.target.value)
}, [
    $.option({ value: 'en' }, 'English'),
    $.option({ value: 'es' }, 'Español'),
    $.option({ value: 'fr' }, 'Français'),
    $.option({ value: 'de' }, 'Deutsch'),
    $.option({ value: 'it' }, 'Italiano'),
    $.option({ value: 'pt' }, 'Português'),
    $.option({ value: 'ru' }, 'Русский'),
    $.option({ value: 'ja' }, '日本語'),
    $.option({ value: 'ko' }, '한국어'),
    $.option({ value: 'zh' }, '中文')
])
```

---

## 3. Theme Selector

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25240-25244
- **Component**: DisplaySettings

### Implementation
```javascript
$.select({ 
    className: 'setting-input',
    value: this.currentTheme,
    onchange: (e) => this.updateTheme(e.target.value)
}, [
    $.option({ value: 'dark' }, 'Dark'),
    $.option({ value: 'light' }, 'Light'),
    $.option({ value: 'auto' }, 'Auto (System)')
])
```

### Theme Application
```javascript
updateTheme(theme) {
    if (theme === 'auto') {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update CSS variables
    const root = document.documentElement;
    if (theme === 'dark') {
        root.style.setProperty('--bg-primary', '#000000');
        root.style.setProperty('--text-primary', '#ffffff');
    } else {
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--text-primary', '#000000');
    }
    
    // Persist
    localStorage.setItem('theme', theme);
}
```

---

## 4. Auto-Lock Timer

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25250-25254
- **Component**: SecuritySettings

### Implementation
```javascript
$.select({ 
    className: 'setting-input',
    value: this.autoLockMinutes,
    onchange: (e) => this.updateAutoLock(e.target.value)
}, [
    $.option({ value: '5' }, '5 minutes'),
    $.option({ value: '15' }, '15 minutes'),
    $.option({ value: '30' }, '30 minutes'),
    $.option({ value: '60' }, '1 hour'),
    $.option({ value: '0' }, 'Never')
])
```

### Auto-Lock Logic
```javascript
updateAutoLock(minutes) {
    const mins = parseInt(minutes);
    
    // Clear existing timer
    if (this.autoLockTimer) {
        clearTimeout(this.autoLockTimer);
    }
    
    // Set new timer if not "Never"
    if (mins > 0) {
        this.resetAutoLockTimer();
        
        // Add activity listeners
        ['mousedown', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => this.resetAutoLockTimer());
        });
    }
    
    // Persist setting
    localStorage.setItem('autoLockMinutes', minutes);
}

resetAutoLockTimer() {
    clearTimeout(this.autoLockTimer);
    
    const minutes = parseInt(localStorage.getItem('autoLockMinutes') || '15');
    if (minutes > 0) {
        this.autoLockTimer = setTimeout(() => {
            this.app.lockWallet();
        }, minutes * 60 * 1000);
    }
}
```

---

## 5. Network Settings

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25301-25304, 25311-25314
- **Component**: NetworkSettings

### Implementation
```javascript
// Network selector
$.select({ 
    className: 'setting-input',
    value: this.currentNetwork,
    onchange: (e) => this.switchNetwork(e.target.value)
}, [
    $.option({ value: 'mainnet' }, 'Mainnet'),
    $.option({ value: 'testnet' }, 'Testnet'),
    $.option({ value: 'signet' }, 'Signet'),
    $.option({ value: 'regtest' }, 'Regtest (Local)')
])

// Custom Electrum server
$.input({
    type: 'text',
    className: 'setting-input',
    value: this.electrumServer || 'electrum.blockstream.info:50002',
    placeholder: 'host:port',
    pattern: '^[a-zA-Z0-9.-]+:[0-9]+$',
    onblur: (e) => this.updateElectrumServer(e.target.value)
})
```

### Network Validation
```javascript
validateElectrumServer(server) {
    const pattern = /^([a-zA-Z0-9.-]+):([0-9]+)$/;
    const match = server.match(pattern);
    
    if (!match) {
        return { 
            valid: false, 
            error: 'Invalid format. Use host:port' 
        };
    }
    
    const [, host, port] = match;
    const portNum = parseInt(port);
    
    if (portNum < 1 || portNum > 65535) {
        return { 
            valid: false, 
            error: 'Invalid port number' 
        };
    }
    
    return { valid: true, host, port: portNum };
}
```

---

## 6. Fee Preference

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25353-25357, 25342-25344
- **Component**: TransactionSettings

### Implementation
```javascript
// Default fee level
$.select({ 
    className: 'setting-input',
    value: this.defaultFeeLevel,
    onchange: (e) => this.updateDefaultFee(e.target.value)
}, [
    $.option({ value: 'low' }, 'Low (Economy)'),
    $.option({ value: 'medium' }, 'Medium (Normal)'),
    $.option({ value: 'high' }, 'High (Priority)'),
    $.option({ value: 'custom' }, 'Always Ask')
])

// Max fee warning threshold
$.input({
    type: 'number',
    className: 'setting-input',
    value: this.maxFeeWarning || '20',
    min: '1',
    max: '1000',
    placeholder: 'sat/vB',
    onchange: (e) => this.updateMaxFeeWarning(e.target.value)
})
```

---

## 7. Privacy Settings

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25322-25325, 25364-25367
- **Component**: PrivacySettings

### Implementation
```javascript
// Tor usage
$.input({
    type: 'checkbox',
    className: 'setting-checkbox',
    checked: this.useTor,
    onchange: (e) => this.toggleTor(e.target.checked)
})

// Address reuse warning
$.input({
    type: 'checkbox',
    className: 'setting-checkbox',
    checked: this.warnAddressReuse,
    onchange: (e) => this.toggleAddressReuseWarning(e.target.checked)
})

// Analytics opt-out
$.input({
    type: 'checkbox',
    className: 'setting-checkbox',
    checked: !this.allowAnalytics,
    onchange: (e) => this.toggleAnalytics(!e.target.checked)
})
```

---

## 8. Backup Settings

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: BackupSettings

### Implementation
```javascript
// Auto-backup toggle
$.input({
    type: 'checkbox',
    className: 'setting-checkbox',
    checked: this.autoBackup,
    onchange: (e) => this.toggleAutoBackup(e.target.checked)
})

// Backup reminder frequency
$.select({
    className: 'setting-input',
    value: this.backupReminder,
    disabled: !this.autoBackup,
    onchange: (e) => this.updateBackupReminder(e.target.value)
}, [
    $.option({ value: 'daily' }, 'Daily'),
    $.option({ value: 'weekly' }, 'Weekly'),
    $.option({ value: 'monthly' }, 'Monthly'),
    $.option({ value: 'never' }, 'Never')
])
```

---

## Common Patterns

### 1. Setting Persistence
```javascript
saveSetting(key, value) {
    // Validate setting
    const validation = this.validateSetting(key, value);
    if (!validation.valid) {
        this.showError(validation.error);
        return false;
    }
    
    // Save to localStorage
    const settings = JSON.parse(localStorage.getItem('walletSettings') || '{}');
    settings[key] = validation.value;
    localStorage.setItem('walletSettings', JSON.stringify(settings));
    
    // Update app state
    this.app.state.set(`settings.${key}`, validation.value);
    
    // Trigger update
    this.app.emit('settingChanged', { key, value: validation.value });
    
    return true;
}
```

### 2. Setting Groups
```javascript
const settingGroups = {
    general: ['currency', 'language', 'theme'],
    security: ['autoLock', 'requirePassword', 'biometric'],
    network: ['network', 'electrumServer', 'torEnabled'],
    privacy: ['analytics', 'addressReuse', 'coinControl'],
    advanced: ['debug', 'experimental', 'developer']
};
```

### 3. Reset to Defaults
```javascript
resetSettings(group = 'all') {
    const defaults = {
        currency: 'USD',
        language: 'en',
        theme: 'dark',
        autoLock: '15',
        network: 'mainnet',
        defaultFee: 'medium'
    };
    
    if (group === 'all') {
        localStorage.setItem('walletSettings', JSON.stringify(defaults));
    } else {
        const settings = JSON.parse(localStorage.getItem('walletSettings') || '{}');
        settingGroups[group].forEach(key => {
            settings[key] = defaults[key];
        });
        localStorage.setItem('walletSettings', JSON.stringify(settings));
    }
    
    this.reloadSettings();
}
```

## Mobile Considerations

### Toggle Switches
```css
/* iOS-style toggle */
.setting-checkbox {
    position: relative;
    width: 51px;
    height: 31px;
    appearance: none;
    background: #ccc;
    border-radius: 15.5px;
    transition: 0.3s;
}

.setting-checkbox:checked {
    background: #00ff00;
}
```

### Select Styling
```css
/* Native select on mobile */
@media (max-width: 768px) {
    .setting-input[type="select"] {
        appearance: none;
        background-image: url('data:image/svg+xml;...');
        background-position: right 12px center;
        padding-right: 40px;
    }
}
```

## Testing Checklist

- [ ] Setting persistence across sessions
- [ ] Default value application
- [ ] Validation for each setting type
- [ ] Toggle/checkbox functionality
- [ ] Select dropdown behavior
- [ ] Number input constraints
- [ ] Mobile toggle switches
- [ ] Setting group management
- [ ] Reset functionality
- [ ] Change event propagation