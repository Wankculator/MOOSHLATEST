// MOOSH WALLET - Wallet Settings Modal
// Comprehensive wallet customization interface with multi-wallet support
// Following MOOSH design patterns and security guidelines

(function(window) {
    'use strict';

    class WalletSettingsModal extends (window.ModalBase || class {}) {
        constructor(app) {
            if (window.ModalBase) {
                super(app);
            } else {
                this.app = app;
                this.modal = null;
                this.overlay = null;
            }
            
            // Available customization options
            this.themeColors = [
                { value: '#f57315', name: 'MOOSH Orange', class: 'theme-orange' },
                { value: '#69fd97', name: 'Terminal Green', class: 'theme-green' },
                { value: '#ff4444', name: 'Bitcoin Red', class: 'theme-red' },
                { value: '#4444ff', name: 'Lightning Blue', class: 'theme-blue' },
                { value: '#ffff44', name: 'Satoshi Yellow', class: 'theme-yellow' },
                { value: '#ff44ff', name: 'Ordinals Pink', class: 'theme-pink' },
                { value: '#44ffff', name: 'Cyber Cyan', class: 'theme-cyan' }
            ];
            
            this.walletIcons = [
                { value: 'wallet', icon: '💰', name: 'Wallet' },
                { value: 'briefcase', icon: '💼', name: 'Briefcase' },
                { value: 'safe', icon: '🔐', name: 'Safe' },
                { value: 'vault', icon: '🏦', name: 'Vault' },
                { value: 'bitcoin', icon: '₿', name: 'Bitcoin' },
                { value: 'lightning', icon: '⚡', name: 'Lightning' },
                { value: 'rocket', icon: '🚀', name: 'Rocket' }
            ];
            
            this.currencies = [
                { value: 'USD', symbol: '$', name: 'US Dollar' },
                { value: 'EUR', symbol: '€', name: 'Euro' },
                { value: 'GBP', symbol: '£', name: 'British Pound' },
                { value: 'JPY', symbol: '¥', name: 'Japanese Yen' },
                { value: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
                { value: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
                { value: 'BTC', symbol: '₿', name: 'Bitcoin' },
                { value: 'SAT', symbol: 'sats', name: 'Satoshis' }
            ];
            
            this.explorers = [
                { value: 'mempool', name: 'Mempool.space', url: 'https://mempool.space' },
                { value: 'blockchain', name: 'Blockchain.info', url: 'https://blockchain.info' },
                { value: 'blockchair', name: 'Blockchair', url: 'https://blockchair.com' },
                { value: 'blockstream', name: 'Blockstream', url: 'https://blockstream.info' },
                { value: 'btc', name: 'BTC.com', url: 'https://btc.com' }
            ];
            
            this.autoLockOptions = [
                { value: 60000, label: '1 minute' },
                { value: 300000, label: '5 minutes' },
                { value: 600000, label: '10 minutes' },
                { value: 1800000, label: '30 minutes' },
                { value: 3600000, label: '1 hour' },
                { value: 0, label: 'Never' }
            ];
            
            this.currentWallet = null;
            this.tempSettings = null;
            this.hasChanges = false;
            
            // Add styles
            this.addStyles();
        }
        
        show(walletId = null) {
            const $ = window.ElementFactory || window.$;
            
            // Get multi-wallet manager
            const multiWalletManager = this.app.multiWalletManager;
            if (!multiWalletManager) {
                this.app.showNotification('Multi-wallet system not available', 'error');
                return;
            }
            
            // Get wallet to edit (current wallet if not specified)
            this.currentWallet = walletId ? 
                multiWalletManager.getWallet(walletId) : 
                multiWalletManager.getActiveWallet();
                
            if (!this.currentWallet) {
                this.app.showNotification('No wallet selected', 'error');
                return;
            }
            
            // Clone settings for editing
            this.tempSettings = JSON.parse(JSON.stringify(this.currentWallet.settings));
            this.hasChanges = false;
            
            // Create modal content
            const modalContent = $.div({ className: 'wallet-settings-modal' }, [
                this.createHeader(),
                this.createContent(),
                this.createFooter()
            ]);
            
            // Create overlay
            this.overlay = this.createOverlay(modalContent);
            
            // Show modal
            if (window.ModalBase && this.show !== WalletSettingsModal.prototype.show) {
                super.show();
            } else {
                document.body.appendChild(this.overlay);
                setTimeout(() => {
                    this.overlay.classList.add('show');
                }, 10);
            }
        }
        
        createHeader() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'settings-header' }, [
                $.div({ className: 'settings-header-content' }, [
                    $.h2({ className: 'settings-title' }, [
                        $.span({ className: 'text-dim' }, ['<']),
                        ` Wallet Settings `,
                        $.span({ className: 'text-dim' }, ['/>']),
                        $.span({ 
                            className: 'wallet-name-badge',
                            style: {
                                marginLeft: '15px',
                                fontSize: '14px',
                                color: this.tempSettings.color || '#f57315',
                                border: `1px solid ${this.tempSettings.color || '#f57315'}`,
                                padding: '4px 12px',
                                borderRadius: '0'
                            }
                        }, [this.currentWallet.name])
                    ]),
                    $.button({
                        className: 'settings-close',
                        onclick: () => this.handleClose()
                    }, ['×'])
                ])
            ]);
        }
        
        createContent() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'settings-content' }, [
                // Wallet Name Section
                this.createSection('Wallet Identity', [
                    this.createNameInput(),
                    this.createIconSelector(),
                    this.createColorSelector()
                ]),
                
                // Preferences Section
                this.createSection('Preferences', [
                    this.createCurrencySelector(),
                    this.createExplorerSelector()
                ]),
                
                // Security Section
                this.createSection('Security', [
                    this.createPasswordToggle(),
                    this.createAutoLockSelector()
                ]),
                
                // Advanced Section
                this.createSection('Advanced', [
                    this.createDeleteWalletButton()
                ])
            ]);
        }
        
        createSection(title, content) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'settings-section' }, [
                $.h3({ className: 'settings-section-title' }, [title]),
                $.div({ className: 'settings-section-content' }, content)
            ]);
        }
        
        createNameInput() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Wallet Name']),
                $.div({ className: 'setting-input-wrapper' }, [
                    $.input({
                        type: 'text',
                        className: 'setting-input wallet-name-input',
                        value: this.currentWallet.name,
                        placeholder: 'Enter wallet name',
                        maxLength: 50,
                        oninput: (e) => {
                            this.tempSettings.name = e.target.value;
                            this.markChanged();
                            this.updatePreview();
                        }
                    }),
                    $.span({ className: 'input-hint' }, ['Max 50 characters'])
                ])
            ]);
        }
        
        createIconSelector() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Wallet Icon']),
                $.div({ className: 'icon-selector' }, 
                    this.walletIcons.map(icon => 
                        $.div({
                            className: `icon-option ${this.tempSettings.icon === icon.value ? 'selected' : ''}`,
                            'data-value': icon.value,
                            onclick: () => this.selectIcon(icon.value)
                        }, [
                            $.span({ className: 'icon-symbol' }, [icon.icon]),
                            $.span({ className: 'icon-name' }, [icon.name])
                        ])
                    )
                )
            ]);
        }
        
        createColorSelector() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Theme Color']),
                $.div({ className: 'color-selector' }, 
                    this.themeColors.map(color => 
                        $.div({
                            className: `color-option ${this.tempSettings.color === color.value ? 'selected' : ''}`,
                            'data-value': color.value,
                            style: {
                                backgroundColor: color.value,
                                borderColor: this.tempSettings.color === color.value ? '#fff' : color.value
                            },
                            onclick: () => this.selectColor(color.value),
                            title: color.name
                        })
                    )
                )
            ]);
        }
        
        createCurrencySelector() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Default Currency']),
                $.select({
                    className: 'setting-select',
                    value: this.tempSettings.currency || 'USD',
                    onchange: (e) => {
                        this.tempSettings.currency = e.target.value;
                        this.markChanged();
                    }
                }, 
                    this.currencies.map(currency => 
                        $.option({ 
                            value: currency.value,
                            selected: (this.tempSettings.currency || 'USD') === currency.value
                        }, [`${currency.symbol} ${currency.name}`])
                    )
                )
            ]);
        }
        
        createExplorerSelector() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Block Explorer']),
                $.select({
                    className: 'setting-select',
                    value: this.tempSettings.explorerPreference || 'mempool',
                    onchange: (e) => {
                        this.tempSettings.explorerPreference = e.target.value;
                        this.markChanged();
                    }
                }, 
                    this.explorers.map(explorer => 
                        $.option({ 
                            value: explorer.value,
                            selected: (this.tempSettings.explorerPreference || 'mempool') === explorer.value
                        }, [explorer.name])
                    )
                )
            ]);
        }
        
        createPasswordToggle() {
            const $ = window.ElementFactory || window.$;
            const isProtected = this.tempSettings.passwordProtected;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Password Protection']),
                $.div({ className: 'password-toggle-wrapper' }, [
                    $.div({ 
                        className: `toggle-switch ${isProtected ? 'active' : ''}`,
                        onclick: () => this.togglePasswordProtection()
                    }, [
                        $.div({ className: 'toggle-slider' })
                    ]),
                    $.span({ 
                        className: 'toggle-label',
                        style: { marginLeft: '10px' }
                    }, [isProtected ? 'Enabled' : 'Disabled']),
                    isProtected && $.button({
                        className: 'btn btn-small btn-secondary',
                        style: { marginLeft: 'auto' },
                        onclick: () => this.changePassword()
                    }, ['Change Password'])
                ])
            ]);
        }
        
        createAutoLockSelector() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'setting-item' }, [
                $.label({ className: 'setting-label' }, ['Auto-Lock Timeout']),
                $.select({
                    className: 'setting-select',
                    value: this.tempSettings.autoLockTimeout || 300000,
                    onchange: (e) => {
                        this.tempSettings.autoLockTimeout = parseInt(e.target.value);
                        this.markChanged();
                    }
                }, 
                    this.autoLockOptions.map(option => 
                        $.option({ 
                            value: option.value,
                            selected: (this.tempSettings.autoLockTimeout || 300000) === option.value
                        }, [option.label])
                    )
                )
            ]);
        }
        
        createDeleteWalletButton() {
            const $ = window.ElementFactory || window.$;
            
            // Can't delete if it's the only wallet
            const multiWalletManager = this.app.multiWalletManager;
            const walletCount = multiWalletManager ? multiWalletManager.wallets.length : 1;
            const canDelete = walletCount > 1;
            
            return $.div({ className: 'setting-item danger-zone' }, [
                $.label({ className: 'setting-label danger' }, ['Danger Zone']),
                $.button({
                    className: 'btn btn-danger',
                    disabled: !canDelete,
                    onclick: () => this.confirmDeleteWallet(),
                    title: canDelete ? 'Delete this wallet' : 'Cannot delete the last wallet'
                }, ['Delete Wallet']),
                !canDelete && $.span({ 
                    className: 'input-hint',
                    style: { marginLeft: '10px', color: '#ff4444' }
                }, ['Cannot delete the only wallet'])
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ className: 'settings-footer' }, [
                $.button({
                    className: 'btn btn-secondary',
                    onclick: () => this.handleClose()
                }, ['Cancel']),
                $.button({
                    className: `btn btn-primary ${!this.hasChanges ? 'disabled' : ''}`,
                    disabled: !this.hasChanges,
                    onclick: () => this.saveSettings()
                }, ['Save Changes'])
            ]);
        }
        
        selectIcon(iconValue) {
            this.tempSettings.icon = iconValue;
            this.markChanged();
            
            // Update UI
            document.querySelectorAll('.icon-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.value === iconValue);
            });
        }
        
        selectColor(colorValue) {
            this.tempSettings.color = colorValue;
            this.markChanged();
            
            // Update UI
            document.querySelectorAll('.color-option').forEach(option => {
                const isSelected = option.dataset.value === colorValue;
                option.classList.toggle('selected', isSelected);
                option.style.borderColor = isSelected ? '#fff' : colorValue;
            });
            
            // Update preview
            this.updatePreview();
        }
        
        updatePreview() {
            // Update wallet name badge color
            const badge = document.querySelector('.wallet-name-badge');
            if (badge) {
                badge.style.color = this.tempSettings.color;
                badge.style.borderColor = this.tempSettings.color;
                badge.textContent = this.tempSettings.name || this.currentWallet.name;
            }
        }
        
        togglePasswordProtection() {
            const $ = window.ElementFactory || window.$;
            
            if (!this.tempSettings.passwordProtected) {
                // Enable password protection
                const modal = $.div({
                    className: 'modal-overlay password-setup-modal',
                    onclick: (e) => {
                        if (e.target.className.includes('modal-overlay')) {
                            e.currentTarget.remove();
                        }
                    }
                }, [
                    $.div({ className: 'modal-container small' }, [
                        $.div({ className: 'modal-header' }, [
                            $.h3({}, ['Set Wallet Password'])
                        ]),
                        $.div({ className: 'modal-content' }, [
                            $.div({ className: 'form-group' }, [
                                $.label({}, ['Password']),
                                $.input({
                                    type: 'password',
                                    className: 'form-input',
                                    id: 'wallet-password',
                                    placeholder: 'Enter password',
                                    autofocus: true
                                })
                            ]),
                            $.div({ className: 'form-group' }, [
                                $.label({}, ['Confirm Password']),
                                $.input({
                                    type: 'password',
                                    className: 'form-input',
                                    id: 'wallet-password-confirm',
                                    placeholder: 'Confirm password'
                                })
                            ])
                        ]),
                        $.div({ className: 'modal-footer' }, [
                            $.button({
                                className: 'btn btn-secondary',
                                onclick: () => modal.remove()
                            }, ['Cancel']),
                            $.button({
                                className: 'btn btn-primary',
                                onclick: () => {
                                    const password = document.getElementById('wallet-password').value;
                                    const confirm = document.getElementById('wallet-password-confirm').value;
                                    
                                    if (!password) {
                                        this.app.showNotification('Password cannot be empty', 'error');
                                        return;
                                    }
                                    
                                    if (password !== confirm) {
                                        this.app.showNotification('Passwords do not match', 'error');
                                        return;
                                    }
                                    
                                    if (password.length < 8) {
                                        this.app.showNotification('Password must be at least 8 characters', 'error');
                                        return;
                                    }
                                    
                                    // Set password
                                    this.tempSettings.passwordProtected = true;
                                    this.tempSettings.tempPassword = password; // Store temporarily for saving
                                    this.markChanged();
                                    
                                    // Update UI
                                    this.refreshPasswordToggle();
                                    modal.remove();
                                    
                                    this.app.showNotification('Password protection enabled', 'success');
                                }
                            }, ['Set Password'])
                        ])
                    ])
                ]);
                
                document.body.appendChild(modal);
                setTimeout(() => modal.classList.add('show'), 10);
                
            } else {
                // Disable password protection - require current password
                if (window.PasswordModal) {
                    const passwordModal = new window.PasswordModal(this.app, {
                        title: 'Verify Password',
                        message: 'Enter current password to disable protection',
                        walletId: this.currentWallet.id,
                        onSuccess: () => {
                            this.tempSettings.passwordProtected = false;
                            this.tempSettings.passwordHash = null;
                            this.markChanged();
                            this.refreshPasswordToggle();
                            this.app.showNotification('Password protection disabled', 'success');
                        }
                    });
                    passwordModal.show();
                } else {
                    // Fallback if PasswordModal not available
                    if (confirm('Disable password protection for this wallet?')) {
                        this.tempSettings.passwordProtected = false;
                        this.tempSettings.passwordHash = null;
                        this.markChanged();
                        this.refreshPasswordToggle();
                    }
                }
            }
        }
        
        changePassword() {
            const $ = window.ElementFactory || window.$;
            
            // First verify current password
            if (window.PasswordModal) {
                const verifyModal = new window.PasswordModal(this.app, {
                    title: 'Verify Current Password',
                    message: 'Enter your current password',
                    walletId: this.currentWallet.id,
                    onSuccess: () => {
                        // Show change password dialog
                        this.showChangePasswordDialog();
                    }
                });
                verifyModal.show();
            } else {
                this.showChangePasswordDialog();
            }
        }
        
        showChangePasswordDialog() {
            const $ = window.ElementFactory || window.$;
            
            const modal = $.div({
                className: 'modal-overlay password-change-modal',
                onclick: (e) => {
                    if (e.target.className.includes('modal-overlay')) {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({ className: 'modal-container small' }, [
                    $.div({ className: 'modal-header' }, [
                        $.h3({}, ['Change Wallet Password'])
                    ]),
                    $.div({ className: 'modal-content' }, [
                        $.div({ className: 'form-group' }, [
                            $.label({}, ['New Password']),
                            $.input({
                                type: 'password',
                                className: 'form-input',
                                id: 'new-wallet-password',
                                placeholder: 'Enter new password',
                                autofocus: true
                            })
                        ]),
                        $.div({ className: 'form-group' }, [
                            $.label({}, ['Confirm New Password']),
                            $.input({
                                type: 'password',
                                className: 'form-input',
                                id: 'new-wallet-password-confirm',
                                placeholder: 'Confirm new password'
                            })
                        ])
                    ]),
                    $.div({ className: 'modal-footer' }, [
                        $.button({
                            className: 'btn btn-secondary',
                            onclick: () => modal.remove()
                        }, ['Cancel']),
                        $.button({
                            className: 'btn btn-primary',
                            onclick: () => {
                                const password = document.getElementById('new-wallet-password').value;
                                const confirm = document.getElementById('new-wallet-password-confirm').value;
                                
                                if (!password) {
                                    this.app.showNotification('Password cannot be empty', 'error');
                                    return;
                                }
                                
                                if (password !== confirm) {
                                    this.app.showNotification('Passwords do not match', 'error');
                                    return;
                                }
                                
                                if (password.length < 8) {
                                    this.app.showNotification('Password must be at least 8 characters', 'error');
                                    return;
                                }
                                
                                // Store new password temporarily
                                this.tempSettings.tempPassword = password;
                                this.markChanged();
                                
                                modal.remove();
                                this.app.showNotification('Password will be updated when you save', 'info');
                            }
                        }, ['Update Password'])
                    ])
                ])
            ]);
            
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);
        }
        
        refreshPasswordToggle() {
            // Re-render the password toggle section
            const wrapper = document.querySelector('.password-toggle-wrapper');
            if (wrapper) {
                const parent = wrapper.parentElement;
                parent.innerHTML = '';
                parent.appendChild(this.createPasswordToggle());
            }
        }
        
        confirmDeleteWallet() {
            const $ = window.ElementFactory || window.$;
            
            const modal = $.div({
                className: 'modal-overlay confirm-delete-modal',
                onclick: (e) => {
                    if (e.target.className.includes('modal-overlay')) {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({ className: 'modal-container small danger' }, [
                    $.div({ className: 'modal-header danger' }, [
                        $.h3({}, ['⚠️ Delete Wallet'])
                    ]),
                    $.div({ className: 'modal-content' }, [
                        $.p({}, ['Are you sure you want to delete this wallet?']),
                        $.p({ className: 'wallet-delete-info' }, [
                            $.strong({}, [this.currentWallet.name])
                        ]),
                        $.p({ className: 'danger-text' }, [
                            'This action cannot be undone. All accounts and data associated with this wallet will be permanently deleted.'
                        ]),
                        $.div({ className: 'confirm-input-wrapper' }, [
                            $.label({}, ['Type the wallet name to confirm:']),
                            $.input({
                                type: 'text',
                                className: 'form-input danger-input',
                                id: 'confirm-wallet-name',
                                placeholder: this.currentWallet.name
                            })
                        ])
                    ]),
                    $.div({ className: 'modal-footer' }, [
                        $.button({
                            className: 'btn btn-secondary',
                            onclick: () => modal.remove()
                        }, ['Cancel']),
                        $.button({
                            className: 'btn btn-danger',
                            onclick: () => {
                                const confirmName = document.getElementById('confirm-wallet-name').value;
                                if (confirmName !== this.currentWallet.name) {
                                    this.app.showNotification('Wallet name does not match', 'error');
                                    return;
                                }
                                
                                // Delete the wallet
                                const multiWalletManager = this.app.multiWalletManager;
                                if (multiWalletManager.deleteWallet(this.currentWallet.id)) {
                                    modal.remove();
                                    this.close();
                                }
                            }
                        }, ['Delete Wallet'])
                    ])
                ])
            ]);
            
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);
        }
        
        markChanged() {
            this.hasChanges = true;
            
            // Enable save button
            const saveBtn = document.querySelector('.settings-footer .btn-primary');
            if (saveBtn) {
                saveBtn.classList.remove('disabled');
                saveBtn.disabled = false;
            }
        }
        
        async saveSettings() {
            const multiWalletManager = this.app.multiWalletManager;
            if (!multiWalletManager) return;
            
            // Handle name change
            if (this.tempSettings.name && this.tempSettings.name !== this.currentWallet.name) {
                multiWalletManager.renameWallet(this.currentWallet.id, this.tempSettings.name);
            }
            
            // Handle password change
            if (this.tempSettings.tempPassword) {
                await multiWalletManager.setWalletPassword(this.currentWallet.id, this.tempSettings.tempPassword);
                delete this.tempSettings.tempPassword;
            }
            
            // Update all other settings
            const settingsToSave = {
                color: this.tempSettings.color,
                icon: this.tempSettings.icon,
                currency: this.tempSettings.currency,
                explorerPreference: this.tempSettings.explorerPreference,
                passwordProtected: this.tempSettings.passwordProtected,
                autoLockTimeout: this.tempSettings.autoLockTimeout
            };
            
            multiWalletManager.updateWalletSettings(this.currentWallet.id, settingsToSave);
            
            this.app.showNotification('Settings saved successfully', 'success');
            this.close();
            
            // Refresh UI if needed
            if (this.currentWallet.id === multiWalletManager.activeWalletId) {
                // Trigger wallet change event to refresh UI
                const event = new CustomEvent('walletChanged', {
                    detail: {
                        walletId: this.currentWallet.id,
                        walletName: this.tempSettings.name || this.currentWallet.name
                    }
                });
                window.dispatchEvent(event);
            }
        }
        
        handleClose() {
            if (this.hasChanges) {
                if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                    this.close();
                }
            } else {
                this.close();
            }
        }
        
        close() {
            if (window.ModalBase && this.close !== WalletSettingsModal.prototype.close) {
                super.close();
            } else {
                if (this.overlay) {
                    this.overlay.classList.remove('show');
                    setTimeout(() => {
                        if (this.overlay && this.overlay.parentNode) {
                            this.overlay.parentNode.removeChild(this.overlay);
                        }
                        this.overlay = null;
                        this.modal = null;
                    }, 300);
                }
            }
        }
        
        addStyles() {
            if (document.getElementById('wallet-settings-modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'wallet-settings-modal-styles';
            style.textContent = `
                /* Wallet Settings Modal Styles */
                .wallet-settings-modal {
                    background: var(--bg-primary);
                    border: 2px solid var(--text-primary);
                    border-radius: 0;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    font-family: monospace;
                }
                
                .settings-header {
                    border-bottom: 1px solid var(--border-color);
                }
                
                .settings-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                }
                
                .settings-title {
                    margin: 0;
                    font-size: 24px;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                }
                
                .wallet-name-badge {
                    font-size: 14px;
                    padding: 4px 12px;
                    transition: all 0.3s ease;
                }
                
                .settings-close {
                    background: transparent;
                    border: none;
                    color: var(--text-dim);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s ease;
                }
                
                .settings-close:hover {
                    color: var(--text-primary);
                }
                
                .settings-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .settings-section {
                    margin-bottom: 30px;
                    padding-bottom: 30px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .settings-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                .settings-section-title {
                    color: var(--text-primary);
                    font-size: 18px;
                    margin: 0 0 20px 0;
                    font-weight: bold;
                }
                
                .setting-item {
                    margin-bottom: 20px;
                }
                
                .setting-item:last-child {
                    margin-bottom: 0;
                }
                
                .setting-label {
                    display: block;
                    color: var(--text-dim);
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                
                .setting-label.danger {
                    color: #ff4444;
                }
                
                .setting-input-wrapper {
                    position: relative;
                }
                
                .setting-input,
                .setting-select {
                    width: 100%;
                    padding: 10px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: monospace;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }
                
                .setting-input:focus,
                .setting-select:focus {
                    outline: none;
                    border-color: var(--text-primary);
                }
                
                .input-hint {
                    display: block;
                    color: var(--text-dim);
                    font-size: 12px;
                    margin-top: 5px;
                }
                
                /* Icon Selector */
                .icon-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 10px;
                }
                
                .icon-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 15px 10px;
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .icon-option:hover {
                    border-color: var(--text-primary);
                    transform: translateY(-2px);
                }
                
                .icon-option.selected {
                    border-color: var(--text-primary);
                    background: var(--bg-primary);
                }
                
                .icon-symbol {
                    font-size: 24px;
                    margin-bottom: 5px;
                }
                
                .icon-name {
                    font-size: 12px;
                    color: var(--text-dim);
                }
                
                /* Color Selector */
                .color-selector {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .color-option {
                    width: 40px;
                    height: 40px;
                    border: 3px solid;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }
                
                .color-option:hover {
                    transform: scale(1.1);
                }
                
                .color-option.selected {
                    transform: scale(1.1);
                }
                
                .color-option.selected::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #000;
                    font-size: 20px;
                    font-weight: bold;
                }
                
                /* Password Toggle */
                .password-toggle-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .toggle-switch {
                    width: 50px;
                    height: 26px;
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .toggle-switch.active {
                    background: var(--text-primary);
                    border-color: var(--text-primary);
                }
                
                .toggle-slider {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background: var(--text-primary);
                    transition: transform 0.3s ease;
                }
                
                .toggle-switch.active .toggle-slider {
                    transform: translateX(24px);
                    background: var(--bg-primary);
                }
                
                .toggle-label {
                    color: var(--text-dim);
                    font-size: 14px;
                }
                
                /* Danger Zone */
                .danger-zone {
                    background: rgba(255, 68, 68, 0.1);
                    padding: 15px;
                    border: 1px solid #ff4444;
                }
                
                .btn-danger {
                    background: #ff4444;
                    border-color: #ff4444;
                    color: #fff;
                }
                
                .btn-danger:hover:not(:disabled) {
                    background: #ff6666;
                    border-color: #ff6666;
                }
                
                .btn-danger:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                /* Footer */
                .settings-footer {
                    border-top: 1px solid var(--border-color);
                    padding: 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                /* Small modals */
                .modal-container.small {
                    max-width: 400px;
                }
                
                .modal-container.danger .modal-header {
                    background: rgba(255, 68, 68, 0.1);
                    border-bottom: 1px solid #ff4444;
                }
                
                .danger-text {
                    color: #ff4444;
                    font-size: 14px;
                    margin: 15px 0;
                }
                
                .wallet-delete-info {
                    background: var(--bg-secondary);
                    padding: 10px;
                    margin: 15px 0;
                    border: 1px solid var(--border-color);
                    text-align: center;
                }
                
                .confirm-input-wrapper {
                    margin-top: 20px;
                }
                
                .danger-input {
                    border-color: #ff4444;
                }
                
                /* Form groups */
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: var(--text-dim);
                    font-size: 14px;
                }
                
                .form-input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: monospace;
                    font-size: 14px;
                }
                
                .form-input:focus {
                    outline: none;
                    border-color: var(--text-primary);
                }
                
                /* Button styles */
                .btn-small {
                    padding: 5px 10px;
                    font-size: 12px;
                }
                
                /* Scrollbar */
                .settings-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .settings-content::-webkit-scrollbar-track {
                    background: var(--bg-secondary);
                }
                
                .settings-content::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 0;
                }
                
                .settings-content::-webkit-scrollbar-thumb:hover {
                    background: var(--text-dim);
                }
                
                /* Responsive */
                @media (max-width: 600px) {
                    .wallet-settings-modal {
                        width: 95%;
                        max-height: 95vh;
                    }
                    
                    .settings-header-content {
                        padding: 15px;
                    }
                    
                    .settings-title {
                        font-size: 20px;
                    }
                    
                    .wallet-name-badge {
                        display: none;
                    }
                    
                    .icon-selector {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }
    
    // Export to window
    window.WalletSettingsModal = WalletSettingsModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.WalletSettingsModal = WalletSettingsModal;
    }
    
})(window);