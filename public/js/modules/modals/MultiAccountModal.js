/**
 * MultiAccountModal Module
 * 
 * Modal for managing multiple wallet accounts - create, import, switch between accounts.
 * Provides full account management functionality including renaming and deletion.
 * 
 * Dependencies:
 * - ElementFactory ($)
 * - ComplianceUtils
 * - ResponsiveUtils
 * - State management (app.state)
 * 
 * @class MultiAccountModal
 */

(function(window) {
    'use strict';

    // Import dependencies from window
    const $ = window.ElementFactory || window.$;
    const ComplianceUtils = window.ComplianceUtils;
    const ResponsiveUtils = window.ResponsiveUtils;
    class MultiAccountModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.isCreating = false;
            this.isImporting = false;
        }
        
        show() {
            console.log('[MultiAccountModal] Show called, states:', {
                isCreating: this.isCreating,
                isImporting: this.isImporting
            });
            
            // Clean up any existing modal first
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
                this.modal = null;
            }
            
            // Remove any orphaned modals
            const existingModals = document.querySelectorAll('.modal-overlay');
            existingModals.forEach(modal => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
            
            const $ = window.ElementFactory || ElementFactory;
            const accounts = this.app.state.get('accounts') || [];
            const currentAccountId = this.app.state.get('currentAccountId');
            
            this.modal = $.div({
                className: 'modal-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10000'
                },
                onclick: (e) => {
                    if (e.target === this.modal) this.close();
                }
            }, [
                $.div({
                    className: 'terminal-box',
                    style: {
                        background: 'var(--bg-primary)',
                        border: '1px solid #f57315',
                        borderRadius: '0',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }
                }, [
                    $.div({ className: 'terminal-header' }, [
                        $.span({}, ['~/moosh/accounts $ '])
                    ]),
                    $.div({ className: 'terminal-content', style: 'padding: 20px;' }, [
                        this.isCreating ? this.createNewAccountForm() :
                        this.isImporting ? this.createImportForm() :
                        $.div({}, [
                            this.createAccountList(accounts, currentAccountId),
                            this.createActions()
                        ])
                    ])
                ])
            ]);
            
            document.body.appendChild(this.modal);
        }
        
        createAccountList(accounts, currentAccountId) {
            const $ = window.ElementFactory || ElementFactory;
            
            if (accounts.length === 0) {
                return $.div({ style: 'text-align: center; padding: 40px; color: #666;' }, [
                    $.p({}, ['No accounts found. Create your first account!'])
                ]);
            }
            
            return $.div({ style: 'margin-bottom: 20px;' }, [
                $.h3({ style: 'margin-bottom: 15px; color: var(--text-primary);' }, ['Your Accounts']),
                ...accounts.map(account => this.createAccountItem(account, account.id === currentAccountId))
            ]);
        }
        
        createAccountItem(account, isActive) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    padding: '15px',
                    border: `1px solid ${isActive ? '#f57315' : '#333'}`,
                    marginBottom: '10px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(245, 115, 21, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease'
                },
                onmouseover: (e) => {
                    if (!isActive) e.currentTarget.style.borderColor = '#666';
                },
                onmouseout: (e) => {
                    if (!isActive) e.currentTarget.style.borderColor = '#333';
                },
                onclick: async () => {
                    if (!isActive) {
                        console.log(`[MultiAccountModal] Switching to account: ${account.name}`);
                        
                        // Switch account using enhanced method
                        const switched = this.app.state.switchAccount(account.id);
                        
                        if (switched) {
                            this.app.showNotification(`Switched to ${account.name}`, 'success');
                            
                            // Clear any cached data for proper refresh
                            this.app.state.set('walletData', {
                                addresses: {},
                                balances: {},
                                transactions: []
                            });
                            
                            // Close modal immediately
                            this.close();
                            
                            // The enhanced switchAccount already handles UI updates
                            // If on dashboard, trigger balance refresh
                            if (this.app.state.get('currentPage') === 'dashboard') {
                                setTimeout(() => {
                                    // Trigger balance refresh if dashboard is loaded
                                    const dashboardPage = document.querySelector('.dashboard-page');
                                    if (dashboardPage) {
                                        console.log('[MultiAccountModal] Triggering dashboard refresh after account switch');
                                        // The dashboard will automatically fetch new balances on render
                                    }
                                }, 100);
                            }
                        } else {
                            this.app.showNotification('Failed to switch account', 'error');
                        }
                    }
                }
            }, [
                $.div({ style: 'display: flex; justify-content: space-between; align-items: center;' }, [
                    $.div({}, [
                        $.div({ tag: 'h4', style: 'color: var(--text-primary); margin-bottom: 5px;' }, [
                            account.name,
                            isActive ? $.span({ style: 'color: #f57315; margin-left: 10px; font-size: 12px;' }, ['(Active)']) : null
                        ]),
                        $.p({ style: 'font-size: 12px; color: #666;' }, [
                            `Created: ${new Date(account.createdAt).toLocaleDateString()}`
                        ])
                    ]),
                    $.div({ style: 'display: flex; gap: 10px;' }, [
                        $.button({
                            style: 'background: transparent; border: 1px solid #666; color: #666; padding: 5px 10px; font-size: 12px;',
                            onclick: (e) => {
                                e.stopPropagation();
                                this.renameAccount(account);
                            }
                        }, ['Rename']),
                        accounts.length > 1 ? $.button({
                            style: 'background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 5px 10px; font-size: 12px;',
                            onclick: (e) => {
                                e.stopPropagation();
                                this.deleteAccount(account);
                            }
                        }, ['Delete']) : null
                    ])
                ])
            ]);
        }
        
        createActions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ style: 'display: flex; gap: 10px; justify-content: center; margin-top: 20px;' }, [
                $.button({
                    style: 'background: #000; border: 2px solid #f57315; color: #f57315; padding: 10px 20px; cursor: pointer; transition: all 0.2s;',
                    onmouseover: (e) => { e.target.style.background = '#f57315'; e.target.style.color = '#000'; },
                    onmouseout: (e) => { e.target.style.background = '#000'; e.target.style.color = '#f57315'; },
                    onclick: () => { 
                        this.isCreating = true; 
                        this.isImporting = false;
                        // Remove existing modal first
                        if (this.modal) {
                            this.modal.remove();
                        }
                        this.show(); 
                    }
                }, ['+ Create New Account']),
                $.button({
                    style: 'background: #000; border: 2px solid #666; color: #666; padding: 10px 20px; cursor: pointer; transition: all 0.2s;',
                    onmouseover: (e) => { e.target.style.borderColor = '#999'; e.target.style.color = '#999'; },
                    onmouseout: (e) => { e.target.style.borderColor = '#666'; e.target.style.color = '#666'; },
                    onclick: () => { 
                        this.isImporting = true; 
                        this.isCreating = false;
                        // Remove existing modal first
                        if (this.modal) {
                            this.modal.remove();
                        }
                        this.show(); 
                    }
                }, ['Import Account']),
                $.button({
                    style: 'background: #000; border: 2px solid #666; color: #666; padding: 10px 20px; cursor: pointer; transition: all 0.2s;',
                    onmouseover: (e) => { e.target.style.borderColor = '#999'; e.target.style.color = '#999'; },
                    onmouseout: (e) => { e.target.style.borderColor = '#666'; e.target.style.color = '#666'; },
                    onclick: () => this.close()
                }, ['Close'])
            ]);
        }
        
        createNewAccountForm() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({}, [
                $.h3({ style: 'margin-bottom: 20px; color: var(--text-primary); font-family: "JetBrains Mono", monospace;' }, ['Create New Account']),
                $.div({ style: 'margin-bottom: 20px;' }, [
                    $.label({ style: 'display: block; margin-bottom: 5px; color: var(--text-dim); font-family: "JetBrains Mono", monospace; font-size: 12px;' }, ['Account Name']),
                    $.input({
                        id: 'newAccountName',
                        type: 'text',
                        placeholder: 'Enter account name',
                        style: 'width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        value: `Account ${(this.app.state.get('accounts') || []).length + 1}`,
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = 'var(--border-color)'; }
                    })
                ]),
                $.div({ style: 'display: flex; gap: 10px; justify-content: center;' }, [
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-primary); color: var(--text-primary); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.background = 'var(--text-primary)'; e.target.style.color = 'var(--bg-primary)'; },
                        onmouseout: (e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; },
                        onclick: () => this.handleCreateAccount()
                    }, ['Create Account']),
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-dim); color: var(--text-dim); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.color = 'var(--text-secondary)'; },
                        onmouseout: (e) => { e.target.style.borderColor = 'var(--text-dim)'; e.target.style.color = 'var(--text-dim)'; },
                        onclick: () => { this.isCreating = false; this.show(); }
                    }, ['Cancel'])
                ])
            ]);
        }
        
        createImportForm() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({}, [
                $.h3({ style: 'margin-bottom: 20px; color: var(--text-primary); font-family: "JetBrains Mono", monospace;' }, ['Import Account']),
                $.div({ style: 'margin-bottom: 20px;' }, [
                    $.label({ style: 'display: block; margin-bottom: 5px; color: var(--text-dim); font-family: "JetBrains Mono", monospace; font-size: 12px;' }, ['Account Name']),
                    $.input({
                        id: 'importAccountName',
                        type: 'text',
                        placeholder: 'Enter account name',
                        style: 'width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); margin-bottom: 15px; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        value: `Imported ${(this.app.state.get('accounts') || []).length + 1}`,
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = 'var(--border-color)'; }
                    }),
                    $.label({ style: 'display: block; margin-bottom: 5px; color: var(--text-dim); font-family: "JetBrains Mono", monospace; font-size: 12px;' }, ['Seed Phrase']),
                    $.textarea({
                        id: 'importSeedPhrase',
                        placeholder: 'Enter your 12 or 24 word seed phrase',
                        style: 'width: 100%; height: 80px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); resize: none; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = 'var(--border-color)'; }
                    })
                ]),
                $.div({ style: 'display: flex; gap: 10px; justify-content: center;' }, [
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-primary); color: var(--text-primary); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.background = 'var(--text-primary)'; e.target.style.color = 'var(--bg-primary)'; },
                        onmouseout: (e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; },
                        onclick: () => this.handleImportAccount()
                    }, ['Import Account']),
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-dim); color: var(--text-dim); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.color = 'var(--text-secondary)'; },
                        onmouseout: (e) => { e.target.style.borderColor = 'var(--text-dim)'; e.target.style.color = 'var(--text-dim)'; },
                        onclick: () => { 
                            console.log('[MultiAccountModal] Cancel clicked in import form');
                            this.isImporting = false;
                            this.isCreating = false;
                            // Remove current modal
                            if (this.modal) {
                                this.modal.remove();
                                this.modal = null;
                            }
                            // Show main modal after brief delay
                            setTimeout(() => {
                                this.show();
                            }, 50);
                        }
                    }, ['Cancel'])
                ])
            ]);
        }
        
        async handleCreateAccount() {
            console.log('[MultiAccountModal] handleCreateAccount called');
            
            const nameInput = document.getElementById('newAccountName');
            if (!nameInput) {
                console.error('[MultiAccountModal] Name input not found!');
                this.app.showNotification('Error: Name input not found', 'error');
                return;
            }
            
            const name = nameInput.value.trim();
            console.log('[MultiAccountModal] Account name:', name);
            
            if (!name) {
                this.app.showNotification('Please enter an account name', 'error');
                return;
            }
            
            try {
                this.app.showNotification('Generating new wallet...', 'info');
                console.log('[MultiAccountModal] Calling generateSparkWallet...');
                
                // Generate new seed
                const response = await this.app.apiService.generateSparkWallet(12);
                console.log('[MultiAccountModal] Generate response:', response);
                
                if (!response || !response.data || !response.data.mnemonic) {
                    throw new Error('Invalid response from wallet generation');
                }
                
                const mnemonic = response.data.mnemonic;
                ComplianceUtils.log('MultiAccountModal', 'New wallet generated successfully');
                
                // Create account
                await this.app.state.createAccount(name, mnemonic, false);
                
                this.app.showNotification(`Account "${name}" created successfully`, 'success');
                this.isCreating = false;
                this.close();
                this.app.router.render();
            } catch (error) {
                console.error('[MultiAccountModal] Create account error:', error);
                this.app.showNotification('Failed to create account: ' + error.message, 'error');
            }
        }
        
        async handleImportAccount() {
            const nameInput = document.getElementById('importAccountName');
            const seedInput = document.getElementById('importSeedPhrase');
            const name = nameInput.value.trim();
            const seed = seedInput.value.trim();
            
            if (!name) {
                this.app.showNotification('Please enter an account name', 'error');
                return;
            }
            
            if (!seed) {
                this.app.showNotification('Please enter a seed phrase', 'error');
                return;
            }
            
            const words = seed.split(/\s+/);
            if (words.length !== 12 && words.length !== 24) {
                this.app.showNotification('Seed phrase must be 12 or 24 words', 'error');
                return;
            }
            
            try {
                this.showImportLoadingScreen();
                this.app.showNotification('Detecting wallet type...', 'info');
                
                // Use WalletDetector instead of API
                const detector = new WalletDetector(this.app);
                const detection = await detector.detectWalletType(seed);
                
                this.hideImportLoadingScreen();
                
                if (detection.detected && detection.activePaths.length > 0) {
                    // Show detection results
                    this.showDetectionResults(detection, name, seed);
                } else {
                    // No activity detected - import as new MOOSH wallet
                    this.showImportLoadingScreen();
                    await this.app.state.createAccount(name, seed, true, 'moosh', null);
                    this.hideImportLoadingScreen();
                    this.app.showNotification(`Account "${name}" imported successfully as new MOOSH wallet`, 'success');
                    this.isImporting = false;
                    this.close();
                    this.app.router.render();
                }
            } catch (error) {
                this.hideImportLoadingScreen();
                this.app.showNotification('Failed to import account: ' + error.message, 'error');
            }
        }
        
        showWalletSelectionDialog(accountName, mnemonic, variants) {
            const $ = window.ElementFactory || ElementFactory;
            
            const dialog = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10001'
                },
                onclick: (e) => {
                    if (e.target === e.currentTarget) {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({
                    className: 'wallet-selection-dialog',
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }
                }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '16px',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, ['Select Wallet Type']),
                    $.p({
                        style: {
                            color: 'var(--text-dim)',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }
                    }, ['Multiple wallet types detected. Select your wallet provider:']),
                    $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: '12px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            color: 'var(--text-dim)'
                        }
                    }, ['ℹ️ Xverse uses different addresses for regular Bitcoin and Ordinals. If importing from Xverse, select "Xverse" for regular use or "Xverse Ordinals" for inscriptions.']),
                    $.div({
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }
                    }, Object.entries(variants).map(([type, variant]) => 
                        $.button({
                            style: {
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '16px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            onmouseover: (e) => {
                                e.currentTarget.style.borderColor = 'var(--text-primary)';
                                e.currentTarget.style.background = 'var(--bg-primary)';
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                            },
                            onclick: async () => {
                                dialog.remove();
                                await this.completeImport(accountName, mnemonic, type, variant);
                            }
                        }, [
                            $.div({
                                style: {
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px',
                                    textTransform: 'capitalize'
                                }
                            }, [
                                type === 'standard' ? 'Standard (BIP86)' : 
                                type === 'xverse' ? 'Xverse' :
                                type === 'xverse_ordinals' ? 'Xverse (Ordinals)' :
                                type === 'unisat' ? 'UniSat' :
                                type === 'magiceden' ? 'Magic Eden' :
                                type === 'okx' ? 'OKX' :
                                type === 'sparrow' ? 'Sparrow' :
                                type === 'electrum' ? 'Electrum' :
                                type.charAt(0).toUpperCase() + type.slice(1)
                            ]),
                            $.div({
                                style: {
                                    fontSize: '12px',
                                    color: 'var(--text-dim)',
                                    fontFamily: "'JetBrains Mono', monospace"
                                }
                            }, [`Taproot: ${variant.address}`]),
                            $.div({
                                style: {
                                    fontSize: '11px',
                                    color: 'var(--text-dim)',
                                    marginTop: '4px'
                                }
                            }, [`Path: ${variant.path}`])
                        ])
                    ))
                ])
            ]);
            
            document.body.appendChild(dialog);
            
            const style = document.createElement('style');
            style.textContent = `
                .wallet-selection-dialog::-webkit-scrollbar {
                    width: 12px;
                }
                .wallet-selection-dialog::-webkit-scrollbar-track {
                    background: var(--bg-primary);
                    border-left: 1px solid var(--border-color);
                }
                .wallet-selection-dialog::-webkit-scrollbar-thumb {
                    background: var(--text-accent);
                    border: 1px solid var(--border-color);
                }
                .wallet-selection-dialog::-webkit-scrollbar-thumb:hover {
                    background: var(--text-primary);
                }
            `;
            document.head.appendChild(style);
        }
        
        async completeImport(accountName, mnemonic, walletType, selectedVariant) {
            try {
                this.showImportLoadingScreen();
                
                await this.app.state.createAccount(accountName, mnemonic, true, walletType, selectedVariant);
                
                this.hideImportLoadingScreen();
                this.app.showNotification(`Account "${accountName}" imported as ${walletType} wallet`, 'success');
                this.isImporting = false;
                this.close();
                this.app.router.render();
            } catch (error) {
                this.hideImportLoadingScreen();
                this.app.showNotification('Failed to complete import: ' + error.message, 'error');
            }
        }
        
        showImportLoadingScreen() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.loadingOverlay = $.div({
                id: 'import-loading-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10002'
                }
            }, [
                $.div({
                    style: {
                        textAlign: 'center',
                        color: 'var(--text-accent)'
                    }
                }, [
                    $.div({
                        style: {
                            width: '80px',
                            height: '80px',
                            border: '3px solid var(--text-dim)',
                            borderTopColor: 'var(--text-accent)',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    $.h3({
                        style: {
                            color: 'var(--text-accent)',
                            fontSize: '24px',
                            fontFamily: "'JetBrains Mono', monospace",
                            marginBottom: '10px'
                        }
                    }, ['Importing Wallet...']),
                    $.p({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: '14px',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, ['Generating addresses and setting up your account'])
                ])
            ]);
            
            document.body.appendChild(this.loadingOverlay);
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        hideImportLoadingScreen() {
            if (this.loadingOverlay) {
                this.loadingOverlay.remove();
                this.loadingOverlay = null;
            }
        }
        
        showDetectionResults(detection, accountName, seed) {
            const $ = window.ElementFactory || ElementFactory;
            
            const content = $.div({ style: 'padding: 20px;' }, [
                $.h3({ style: 'color: var(--text-primary); margin-bottom: 20px;' }, ['Wallet Detection Results']),
                
                detection.detected ? 
                    $.div({ 
                        style: 'background: rgba(76, 175, 80, 0.1); padding: 15px; border: 1px solid #4CAF50; margin-bottom: 20px;' 
                    }, [
                        $.p({ style: 'color: #4CAF50; margin-bottom: 10px;' }, [`DETECTED: ${detection.walletName}`]),
                        $.p({ style: 'color: var(--text-dim);' }, [`Type: ${detection.walletType}`]),
                        $.p({ style: 'color: var(--text-dim);' }, [`Active Paths: ${detection.activePaths.length}`])
                    ]) :
                    $.p({ style: 'color: var(--text-dim); margin-bottom: 20px;' }, 
                        ['No existing wallet activity found. Will import as new MOOSH wallet.']),
                
                detection.activePaths.length > 0 && $.div({ 
                    style: 'margin-bottom: 20px; background: var(--bg-secondary); padding: 15px;' 
                }, [
                    $.div({ tag: 'h4', style: 'color: var(--text-primary); margin-bottom: 10px;' }, ['Found Activity On:']),
                    ...detection.activePaths.map(path => 
                        $.div({ 
                            style: 'display: flex; justify-content: space-between; padding: 5px 0; color: var(--text-dim);' 
                        }, [
                            $.span({}, [`${path.walletName}: `]),
                            $.span({}, [`${path.balance} BTC`]),
                            $.span({ style: 'font-size: 0.9em; color: #888;' }, [`(${path.path})`])
                        ])
                    )
                ]),
                
                $.div({ style: 'display: flex; gap: 10px; justify-content: center;' }, [
                    $.button({
                        style: 'background: var(--text-primary); color: var(--bg-primary); padding: 12px 24px; border: none; cursor: pointer;',
                        onclick: async () => {
                            this.proceedWithImport(accountName, seed, detection.walletType, detection);
                        }
                    }, [`Import as ${detection.walletName}`]),
                    
                    detection.detected && $.button({
                        style: 'background: transparent; border: 1px solid var(--text-primary); color: var(--text-primary); padding: 12px 24px; cursor: pointer;',
                        onclick: async () => {
                            this.proceedWithImport(accountName, seed, 'moosh', null);
                        }
                    }, ['Import as New MOOSH Wallet']),
                    
                    $.button({
                        style: 'background: transparent; border: 1px solid var(--text-dim); color: var(--text-dim); padding: 12px 24px; cursor: pointer;',
                        onclick: () => {
                            this.cancelImport();
                        }
                    }, ['Cancel'])
                ])
            ]);
            
            // Replace current modal content
            if (this.modal) {
                const modalContent = this.modal.querySelector('.modal-content') || 
                                   this.modal.querySelector('[style*="background: var(--bg-primary)"]');
                if (modalContent) {
                    modalContent.innerHTML = '';
                    modalContent.appendChild(content);
                }
            }
        }
        
        async proceedWithImport(accountName, seed, walletType, detectionData) {
            try {
                this.showImportLoadingScreen();
                
                await this.app.state.createAccount(
                    accountName, 
                    seed, 
                    true, // isImport
                    walletType,
                    detectionData?.suggestedPath
                );
                
                this.hideImportLoadingScreen();
                this.app.showNotification(`Account "${accountName}" imported successfully as ${walletType} wallet`, 'success');
                
                // If we detected balances, refresh them
                if (detectionData?.balances && Object.keys(detectionData.balances).length > 0) {
                    setTimeout(() => {
                        if (this.app.refreshBalances) {
                            this.app.refreshBalances();
                        }
                    }, 1000);
                }
                
                this.isImporting = false;
                this.close();
                this.app.router.render();
                
            } catch (error) {
                this.hideImportLoadingScreen();
                this.app.showNotification('Failed to complete import: ' + error.message, 'error');
            }
        }
        
        cancelImport() {
            // Clear import form
            const seedInput = document.getElementById('importSeedPhrase');
            if (seedInput) seedInput.value = '';
            
            this.isImporting = false;
            this.isCreating = false;
            
            // Remove current modal
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            
            // Show main modal after brief delay
            setTimeout(() => {
                this.show();
            }, 50);
        }
        
        renameAccount(account) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Create terminal-style dialog
            const dialog = $.div({
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: '20px',
                    zIndex: '10001',
                    minWidth: '400px'
                }
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: {
                        borderBottom: '1px solid var(--text-primary)',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }
                }, [
                    $.span({}, ['~/moosh/accounts/rename $ '])
                ]),
                $.div({ style: 'marginBottom: 15px' }, [
                    $.label({ 
                        style: 'display: block; marginBottom: 5px; color: var(--text-primary)' 
                    }, ['Enter new name for account:']),
                    $.input({
                        id: 'rename-input-modal',
                        type: 'text',
                        value: account.name,
                        style: {
                            width: '100%',
                            padding: '8px',
                            background: '#000',
                            border: '1px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onkeydown: (e) => {
                            if (e.key === 'Enter') {
                                const input = document.getElementById('rename-input-modal');
                                if (input && input.value.trim()) {
                                    account.name = input.value.trim();
                                    this.app.state.persistAccounts();
                                    dialog.remove();
                                    backdrop.remove();
                                    this.close();
                                    this.show();
                                    this.app.showNotification(`Account renamed to "${input.value.trim()}"`, 'success');
                                }
                            } else if (e.key === 'Escape') {
                                dialog.remove();
                                backdrop.remove();
                            }
                        }
                    })
                ]),
                $.div({ 
                    style: 'display: flex; gap: 10px; justifyContent: flex-end' 
                }, [
                    $.button({
                        style: {
                            background: '#000',
                            border: '2px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            const input = document.getElementById('rename-input-modal');
                            if (input && input.value.trim()) {
                                account.name = input.value.trim();
                                this.app.state.persistAccounts();
                                dialog.remove();
                                backdrop.remove();
                                this.close();
                                this.show();
                                this.app.showNotification(`Account renamed to "${input.value.trim()}"`, 'success');
                            }
                        }
                    }, ['Rename']),
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid var(--text-dim)',
                            borderRadius: '0',
                            color: 'var(--text-dim)',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            dialog.remove();
                            backdrop.remove();
                        }
                    }, ['Cancel'])
                ])
            ]);
            
            // Add backdrop
            const backdrop = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: '10000'
                },
                onclick: () => {
                    dialog.remove();
                    backdrop.remove();
                }
            });
            
            document.body.appendChild(backdrop);
            document.body.appendChild(dialog);
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById('rename-input-modal');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        }
        
        deleteAccount(account) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Create terminal-style confirmation dialog
            const dialog = $.div({
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000000',
                    border: '2px solid #ff4444',
                    borderRadius: '0',
                    padding: '20px',
                    zIndex: '10001',
                    minWidth: '400px'
                }
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: {
                        borderBottom: '1px solid #ff4444',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }
                }, [
                    $.span({ style: 'color: #ff4444' }, ['~/moosh/accounts/delete $ '])
                ]),
                $.div({ style: 'marginBottom: 20px' }, [
                    $.p({ 
                        style: 'color: var(--text-primary); marginBottom: 10px' 
                    }, [`Are you sure you want to delete "${account.name}"?`]),
                    $.p({ 
                        style: 'color: #ff4444; fontSize: 12px' 
                    }, ['WARNING: This action cannot be undone.'])
                ]),
                $.div({ 
                    style: 'display: flex; gap: 10px; justifyContent: flex-end' 
                }, [
                    $.button({
                        style: {
                            background: '#000',
                            border: '2px solid #ff4444',
                            borderRadius: '0',
                            color: '#ff4444',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            try {
                                this.app.state.deleteAccount(account.id);
                                this.app.showNotification(`Account "${account.name}" deleted`, 'success');
                                dialog.remove();
                                backdrop.remove();
                                this.close();
                                this.app.router.render();
                            } catch (error) {
                                this.app.showNotification(error.message, 'error');
                                dialog.remove();
                                backdrop.remove();
                            }
                        }
                    }, ['Delete']),
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid var(--text-dim)',
                            borderRadius: '0',
                            color: 'var(--text-dim)',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            dialog.remove();
                            backdrop.remove();
                        }
                    }, ['Cancel'])
                ])
            ]);
            
            // Add backdrop
            const backdrop = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: '10000'
                },
                onclick: () => {
                    dialog.remove();
                    backdrop.remove();
                }
            });
            
            document.body.appendChild(backdrop);
            document.body.appendChild(dialog);
        }
        
        close() {
            console.log('[MultiAccountModal] Closing modal...');
            
            // Reset all states
            this.isCreating = false;
            this.isImporting = false;
            
            if (this.modal) {
                // Add fade out animation
                this.modal.style.opacity = '0';
                this.modal.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    if (this.modal && this.modal.parentNode) {
                        this.modal.parentNode.removeChild(this.modal);
                    }
                    this.modal = null;
                }, 300);
            }
            
            // Navigate to dashboard
            if (this.app && this.app.router) {
                const currentPage = this.app.router.currentPage;
                if (currentPage !== 'dashboard') {
                    this.app.router.navigate('dashboard');
                }
            }
        }
        
        // Add a proper show method if it's missing
        showAlt() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.modal = $.div({
                className: 'modal-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10000'
                },
                onclick: (e) => {
                    if (e.target === this.modal) this.close();
                }
            }, [
                $.div({
                    className: 'modal',
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }
                }, [
                    $.div({
                        style: {
                            padding: 'calc(24px * var(--scale-factor))'
                        }
                    }, [
                        this.createHeader(),
                        this.isCreating ? this.createNewAccountForm() :
                        this.isImporting ? this.createImportForm() :
                        $.div({}, [
                            this.createAccountList(),
                            this.createActions()
                        ])
                    ])
                ])
            ]);
            
            document.body.appendChild(this.modal);
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 'calc(16px * var(--scale-factor))'
                }
            }, [
                $.h2({
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(20px * var(--scale-factor))',
                        fontWeight: '600',
                        fontFamily: "'JetBrains Mono', monospace"
                    }
                }, ['MULTI_ACCOUNT_MANAGER']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        padding: '0',
                        width: 'calc(32px * var(--scale-factor))',
                        height: 'calc(32px * var(--scale-factor))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    onclick: () => this.close()
                }, ['×'])
            ]);
        }
        
        createAccountList() {
            const $ = window.ElementFactory || ElementFactory;
            const accounts = this.app.state.get('accounts');
            const currentAccountId = this.app.state.get('currentAccountId');
            
            if (accounts.length === 0) {
                return $.div({
                    style: {
                        textAlign: 'center',
                        padding: 'calc(40px * var(--scale-factor))',
                        color: 'var(--text-dim)'
                    }
                }, ['No accounts yet. Create your first account.']);
            }
            
            return $.div({
                style: {
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, accounts.map((account, index) => {
                const isActive = account.id === currentAccountId;
                
                return $.div({
                    className: 'account-item',
                    style: {
                        border: `2px solid ${isActive ? 'var(--text-primary)' : 'var(--border-color)'}`,
                        borderRadius: '0',
                        padding: 'calc(16px * var(--scale-factor))',
                        marginBottom: 'calc(12px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isActive ? 'rgba(245, 115, 21, 0.1)' : 'var(--bg-primary)'
                    },
                    onclick: () => this.switchToAccount(index)
                }, [
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'calc(12px * var(--scale-factor))'
                        }
                    }, [
                        $.div({
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'calc(12px * var(--scale-factor))'
                            }
                        }, [
                            $.div({
                                style: {
                                    width: 'calc(32px * var(--scale-factor))',
                                    height: 'calc(32px * var(--scale-factor))',
                                    background: isActive ? 'var(--text-primary)' : 'var(--border-color)',
                                    borderRadius: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isActive ? '#000' : 'var(--text-primary)',
                                    fontWeight: 'bold',
                                    fontSize: 'calc(14px * var(--scale-factor))'
                                }
                            }, [(index + 1).toString()]),
                            $.div({}, [
                                $.div({
                                    style: {
                                        color: 'var(--text-primary)',
                                        fontWeight: '600',
                                        fontSize: 'calc(14px * var(--scale-factor))'
                                    }
                                }, [account.name]),
                                $.div({
                                    style: {
                                        color: 'var(--text-dim)',
                                        fontSize: 'calc(11px * var(--scale-factor))'
                                    }
                                }, [`${account.type || 'Wallet'} • Created ${new Date(account.createdAt).toLocaleDateString()}`]),
                                $.div({
                                    style: {
                                        color: 'var(--text-dim)',
                                        fontSize: 'calc(10px * var(--scale-factor))',
                                        marginTop: 'calc(4px * var(--scale-factor))',
                                        fontFamily: "'JetBrains Mono', monospace"
                                    }
                                }, [this.formatAddress(account.addresses?.taproot || account.addresses?.spark || 'No address')])
                            ])
                        ]),
                        isActive && $.div({
                            style: {
                                color: 'var(--text-accent)',
                                fontSize: 'calc(12px * var(--scale-factor))',
                                fontWeight: '600'
                            }
                        }, ['ACTIVE'])
                    ]),
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }
                    }, [
                        $.div({
                            style: {
                                fontSize: 'calc(12px * var(--scale-factor))',
                                color: 'var(--text-dim)'
                            }
                        }, [`Balance: ${((account.balances?.bitcoin || 0) / 100000000).toFixed(8)} BTC`]),
                        $.div({
                            style: {
                                display: 'flex',
                                gap: 'calc(8px * var(--scale-factor))'
                            }
                        }, [
                            $.button({
                                style: {
                                    background: 'transparent',
                                    border: '1px solid var(--text-dim)',
                                    borderRadius: '0',
                                    color: 'var(--text-dim)',
                                    padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                                    fontSize: 'calc(10px * var(--scale-factor))',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.renameAccount(index);
                                }
                            }, ['Rename']),
                            accounts.length > 1 ? $.button({
                                style: {
                                    background: 'transparent',
                                    border: '1px solid #ff4444',
                                    borderRadius: '0',
                                    color: '#ff4444',
                                    padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                                    fontSize: 'calc(10px * var(--scale-factor))',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                },
                                onclick: (e) => {
                                    e.stopPropagation();
                                    this.deleteAccount(account);
                                }
                            }, ['Delete']) : null
                        ])
                    ])
                ]);
            }));
        }
        
        createActions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'flex',
                    gap: 'calc(12px * var(--scale-factor))',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }
            }, [
                $.button({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '600'
                    },
                    onclick: () => {
                        this.isCreating = true;
                        this.isImporting = false;
                        if (this.modal) {
                            this.modal.remove();
                        }
                        this.show();
                    }
                }, ['+ Create New Account']),
                $.button({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-accent)',
                        borderRadius: '0',
                        color: 'var(--text-accent)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '600'
                    },
                    onclick: () => {
                        this.isImporting = true;
                        this.isCreating = false;
                        if (this.modal) {
                            this.modal.remove();
                        }
                        this.show();
                    }
                }, ['Import Account']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-dim)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.close()
                }, ['Close'])
            ]);
        }
        
        formatAddress(address) {
            if (!address || address === 'No address') return address;
            // Show first 8 and last 6 characters
            return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
        }
        
        switchToAccount(index) {
            const accounts = this.app.state.get('accounts') || [];
            const account = accounts[index];
            if (account) {
                const switched = this.app.state.switchAccount(account.id);
                if (switched) {
                    this.app.showNotification(`Switched to ${account.name}`, 'success');
                    this.close();
                    
                    // Refresh dashboard
                    if (this.app.state.get('currentPage') === 'dashboard') {
                        this.app.router.navigate('dashboard');
                    }
                }
            }
        }
        
        renameAccount(index) {
            const account = this.app.state.get('accounts')[index];
            this.showRenameDialog(account, index);
        }
        
        showRenameDialog(account, index) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Create terminal-style dialog
            const dialog = $.div({
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: '20px',
                    zIndex: '10001',
                    minWidth: '400px'
                }
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: {
                        borderBottom: '1px solid var(--text-primary)',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }
                }, [
                    $.span({}, ['~/moosh/accounts/rename $ '])
                ]),
                $.div({ style: 'marginBottom: 15px' }, [
                    $.label({ 
                        style: 'display: block; marginBottom: 5px; color: var(--text-primary)' 
                    }, ['Enter new name for account:']),
                    $.input({
                        id: 'rename-input',
                        type: 'text',
                        value: account.name,
                        style: {
                            width: '100%',
                            padding: '8px',
                            background: '#000',
                            border: '1px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onkeydown: (e) => {
                            if (e.key === 'Enter') {
                                const input = document.getElementById('rename-input');
                                if (input && input.value.trim()) {
                                    const accounts = [...this.app.state.get('accounts')];
                                    accounts[index].name = input.value.trim();
                                    this.app.state.set('accounts', accounts);
                                    this.app.state.persistAccounts();
                                    dialog.remove();
                                    this.close();
                                    this.show();
                                    this.app.showNotification(`Account renamed to "${input.value.trim()}"`, 'success');
                                }
                            } else if (e.key === 'Escape') {
                                dialog.remove();
                            }
                        }
                    })
                ]),
                $.div({ 
                    style: 'display: flex; gap: 10px; justifyContent: flex-end' 
                }, [
                    $.button({
                        style: {
                            background: '#000',
                            border: '2px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            const input = document.getElementById('rename-input');
                            if (input && input.value.trim()) {
                                const accounts = [...this.app.state.get('accounts')];
                                accounts[index].name = input.value.trim();
                                this.app.state.set('accounts', accounts);
                                this.app.state.persistAccounts();
                                dialog.remove();
                                this.close();
                                this.show();
                                this.app.showNotification(`Account renamed to "${input.value.trim()}"`, 'success');
                            }
                        }
                    }, ['Rename']),
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid var(--text-dim)',
                            borderRadius: '0',
                            color: 'var(--text-dim)',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => dialog.remove()
                    }, ['Cancel'])
                ])
            ]);
            
            // Add backdrop
            const backdrop = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: '10000'
                },
                onclick: () => {
                    dialog.remove();
                    backdrop.remove();
                }
            });
            
            document.body.appendChild(backdrop);
            document.body.appendChild(dialog);
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById('rename-input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        }
        
        deleteAccount(account) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Create terminal-style confirmation dialog
            const dialog = $.div({
                style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000000',
                    border: '2px solid #ff4444',
                    borderRadius: '0',
                    padding: '20px',
                    zIndex: '10001',
                    minWidth: '400px'
                }
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: {
                        borderBottom: '1px solid #ff4444',
                        paddingBottom: '10px',
                        marginBottom: '15px'
                    }
                }, [
                    $.span({ style: 'color: #ff4444' }, ['~/moosh/accounts/delete $ '])
                ]),
                $.div({ style: 'marginBottom: 20px' }, [
                    $.p({ 
                        style: 'color: var(--text-primary); marginBottom: 10px' 
                    }, [`Are you sure you want to delete "${account.name}"?`]),
                    $.p({ 
                        style: 'color: #ff4444; fontSize: 12px' 
                    }, ['WARNING: This action cannot be undone.'])
                ]),
                $.div({ 
                    style: 'display: flex; gap: 10px; justifyContent: flex-end' 
                }, [
                    $.button({
                        style: {
                            background: '#000',
                            border: '2px solid #ff4444',
                            borderRadius: '0',
                            color: '#ff4444',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            try {
                                this.app.state.deleteAccount(account.id);
                                this.app.showNotification(`Account "${account.name}" deleted`, 'success');
                                dialog.remove();
                                backdrop.remove();
                                this.close();
                                this.app.router.render();
                            } catch (error) {
                                this.app.showNotification(error.message, 'error');
                                dialog.remove();
                                backdrop.remove();
                            }
                        }
                    }, ['Delete']),
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid var(--text-dim)',
                            borderRadius: '0',
                            color: 'var(--text-dim)',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => {
                            dialog.remove();
                            backdrop.remove();
                        }
                    }, ['Cancel'])
                ])
            ]);
            
            // Add backdrop
            const backdrop = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: '10000'
                },
                onclick: () => {
                    dialog.remove();
                    backdrop.remove();
                }
            });
            
            document.body.appendChild(backdrop);
            document.body.appendChild(dialog);
        }
        
        async createNewAccount() {
            // This method is now just used for the old button - it should show the form instead
            this.isCreating = true;
            this.isImporting = false;
            if (this.modal) {
                this.modal.remove();
            }
            this.show();
        }
        
        async importAccount() {
            // Show the import form
            this.isImporting = true;
            this.isCreating = false;
            if (this.modal) {
                this.modal.remove();
            }
            this.show();
        }
        
        createNewAccountForm() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({}, [
                $.h3({ style: 'margin-bottom: 20px; color: var(--text-primary); font-family: "JetBrains Mono", monospace;' }, ['Create New Account']),
                $.div({ style: 'margin-bottom: 20px;' }, [
                    $.label({ style: 'display: block; margin-bottom: 5px; color: var(--text-dim); font-family: "JetBrains Mono", monospace; font-size: 12px;' }, ['Account Name']),
                    $.input({
                        id: 'newAccountName',
                        type: 'text',
                        placeholder: 'Enter account name',
                        style: 'width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        value: `Account ${(this.app.state.get('accounts') || []).length + 1}`,
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = 'var(--border-color)'; }
                    })
                ]),
                $.div({ style: 'display: flex; gap: 10px; justify-content: center;' }, [
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-primary); color: var(--text-primary); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.background = 'var(--text-primary)'; e.target.style.color = 'var(--bg-primary)'; },
                        onmouseout: (e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; },
                        onclick: () => this.handleCreateAccount()
                    }, ['Create Account']),
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-dim); color: var(--text-dim); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.color = 'var(--text-secondary)'; },
                        onmouseout: (e) => { e.target.style.borderColor = 'var(--text-dim)'; e.target.style.color = 'var(--text-dim)'; },
                        onclick: () => { this.isCreating = false; this.show(); }
                    }, ['Cancel'])
                ])
            ]);
        }
        
        createImportForm() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({}, [
                $.h3({ style: 'margin-bottom: 20px; color: var(--text-primary); font-family: "JetBrains Mono", monospace;' }, ['Import Account']),
                $.div({ style: 'margin-bottom: 20px;' }, [
                    $.label({ style: 'display: block; margin-bottom: 5px; color: var(--text-dim); font-family: "JetBrains Mono", monospace; font-size: 12px;' }, ['Account Name']),
                    $.input({
                        id: 'importAccountName',
                        type: 'text',
                        placeholder: 'Enter account name',
                        style: 'width: 100%; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); margin-bottom: 15px; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        value: `Imported ${(this.app.state.get('accounts') || []).length + 1}`,
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = 'var(--border-color)'; }
                    }),
                    $.label({ style: 'display: block; margin-bottom: 5px; color: var(--text-dim); font-family: "JetBrains Mono", monospace; font-size: 12px;' }, ['Seed Phrase']),
                    $.textarea({
                        id: 'importSeedPhrase',
                        placeholder: 'Enter your 12 or 24 word seed phrase',
                        style: 'width: 100%; height: 80px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); resize: none; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onfocus: (e) => { e.target.style.borderColor = 'var(--text-primary)'; },
                        onblur: (e) => { e.target.style.borderColor = 'var(--border-color)'; }
                    })
                ]),
                $.div({ style: 'display: flex; gap: 10px; justify-content: center;' }, [
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-primary); color: var(--text-primary); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.background = 'var(--text-primary)'; e.target.style.color = 'var(--bg-primary)'; },
                        onmouseout: (e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; },
                        onclick: () => this.handleImportAccount()
                    }, ['Import Account']),
                    $.button({
                        style: 'background: transparent; border: 2px solid var(--text-dim); color: var(--text-dim); padding: 12px 24px; cursor: pointer; font-family: "JetBrains Mono", monospace; font-size: 12px; border-radius: 0; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.color = 'var(--text-secondary)'; },
                        onmouseout: (e) => { e.target.style.borderColor = 'var(--text-dim)'; e.target.style.color = 'var(--text-dim)'; },
                        onclick: () => { 
                            console.log('[MultiAccountModal] Cancel clicked in import form');
                            this.isImporting = false;
                            this.isCreating = false;
                            // Remove current modal
                            if (this.modal) {
                                this.modal.remove();
                                this.modal = null;
                            }
                            // Show main modal after brief delay
                            setTimeout(() => {
                                this.show();
                            }, 50);
                        }
                    }, ['Cancel'])
                ])
            ]);
        }
        
        async handleCreateAccount() {
            console.log('[MultiAccountModal] handleCreateAccount called');
            
            const nameInput = document.getElementById('newAccountName');
            if (!nameInput) {
                console.error('[MultiAccountModal] Name input not found!');
                this.app.showNotification('Error: Name input not found', 'error');
                return;
            }
            
            const name = nameInput.value.trim();
            console.log('[MultiAccountModal] Account name:', name);
            
            if (!name) {
                this.app.showNotification('Please enter an account name', 'error');
                return;
            }
            
            try {
                this.app.showNotification('Generating new wallet...', 'info');
                console.log('[MultiAccountModal] Calling generateSparkWallet...');
                
                // Generate new seed
                const response = await this.app.apiService.generateSparkWallet(12);
                console.log('[MultiAccountModal] Generate response:', response);
                
                if (!response || !response.data || !response.data.mnemonic) {
                    throw new Error('Invalid response from wallet generation');
                }
                
                const mnemonic = response.data.mnemonic;
                ComplianceUtils.log('MultiAccountModal', 'New wallet generated successfully');
                
                // Create account
                await this.app.state.createAccount(name, mnemonic, false);
                
                this.app.showNotification(`Account "${name}" created successfully`, 'success');
                this.isCreating = false;
                this.close();
                this.app.router.render();
            } catch (error) {
                console.error('[MultiAccountModal] Create account error:', error);
                this.app.showNotification('Failed to create account: ' + error.message, 'error');
            }
        }
        
        async handleImportAccount() {
            const nameInput = document.getElementById('importAccountName');
            const seedInput = document.getElementById('importSeedPhrase');
            const name = nameInput.value.trim();
            const seed = seedInput.value.trim();
            
            if (!name) {
                this.app.showNotification('Please enter an account name', 'error');
                return;
            }
            
            if (!seed) {
                this.app.showNotification('Please enter a seed phrase', 'error');
                return;
            }
            
            const words = seed.split(/\s+/);
            if (words.length !== 12 && words.length !== 24) {
                this.app.showNotification('Seed phrase must be 12 or 24 words', 'error');
                return;
            }
            
            try {
                this.showImportLoadingScreen();
                this.app.showNotification('Detecting wallet type...', 'info');
                
                // Use WalletDetector instead of API
                const detector = new WalletDetector(this.app);
                const detection = await detector.detectWalletType(seed);
                
                this.hideImportLoadingScreen();
                
                if (detection.detected && detection.activePaths.length > 0) {
                    // Show detection results
                    this.showDetectionResults(detection, name, seed);
                } else {
                    // No activity detected - import as new MOOSH wallet
                    this.showImportLoadingScreen();
                    await this.app.state.createAccount(name, seed, true, 'moosh', null);
                    this.hideImportLoadingScreen();
                    this.app.showNotification(`Account "${name}" imported successfully as new MOOSH wallet`, 'success');
                    this.isImporting = false;
                    this.close();
                    this.app.router.render();
                }
            } catch (error) {
                this.hideImportLoadingScreen();
                this.app.showNotification('Failed to import account: ' + error.message, 'error');
            }
        }
        
        showWalletSelectionDialog(accountName, mnemonic, variants) {
            const $ = window.ElementFactory || ElementFactory;
            
            const dialog = $.div({
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10001'
                },
                onclick: (e) => {
                    if (e.target === e.currentTarget) {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({
                    className: 'wallet-selection-dialog',
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }
                }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '16px',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, ['Select Wallet Type']),
                    $.p({
                        style: {
                            color: 'var(--text-dim)',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }
                    }, ['Multiple wallet types detected. Select your wallet provider:']),
                    $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: '12px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            color: 'var(--text-dim)'
                        }
                    }, ['ℹ️ Xverse uses different addresses for regular Bitcoin and Ordinals. If importing from Xverse, select "Xverse" for regular use or "Xverse Ordinals" for inscriptions.']),
                    $.div({
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }
                    }, Object.entries(variants).map(([type, variant]) => 
                        $.button({
                            style: {
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '16px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            onmouseover: (e) => {
                                e.currentTarget.style.borderColor = 'var(--text-primary)';
                                e.currentTarget.style.background = 'var(--bg-primary)';
                            },
                            onmouseout: (e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                            },
                            onclick: async () => {
                                dialog.remove();
                                await this.completeImport(accountName, mnemonic, type, variant);
                            }
                        }, [
                            $.div({
                                style: {
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px',
                                    textTransform: 'capitalize'
                                }
                            }, [
                                type === 'standard' ? 'Standard (BIP86)' : 
                                type === 'xverse' ? 'Xverse' :
                                type === 'xverse_ordinals' ? 'Xverse (Ordinals)' :
                                type === 'unisat' ? 'UniSat' :
                                type === 'magiceden' ? 'Magic Eden' :
                                type === 'okx' ? 'OKX' :
                                type === 'sparrow' ? 'Sparrow' :
                                type === 'electrum' ? 'Electrum' :
                                type.charAt(0).toUpperCase() + type.slice(1)
                            ]),
                            $.div({
                                style: {
                                    fontSize: '12px',
                                    color: 'var(--text-dim)',
                                    fontFamily: "'JetBrains Mono', monospace"
                                }
                            }, [`Taproot: ${variant.address}`]),
                            $.div({
                                style: {
                                    fontSize: '11px',
                                    color: 'var(--text-dim)',
                                    marginTop: '4px'
                                }
                            }, [`Path: ${variant.path}`])
                        ])
                    ))
                ])
            ]);
            
            document.body.appendChild(dialog);
            
            const style = document.createElement('style');
            style.textContent = `
                .wallet-selection-dialog::-webkit-scrollbar {
                    width: 12px;
                }
                .wallet-selection-dialog::-webkit-scrollbar-track {
                    background: var(--bg-primary);
                    border-left: 1px solid var(--border-color);
                }
                .wallet-selection-dialog::-webkit-scrollbar-thumb {
                    background: var(--text-accent);
                    border: 1px solid var(--border-color);
                }
                .wallet-selection-dialog::-webkit-scrollbar-thumb:hover {
                    background: var(--text-primary);
                }
            `;
            document.head.appendChild(style);
        }
        
        async completeImport(accountName, mnemonic, walletType, selectedVariant) {
            try {
                this.showImportLoadingScreen();
                
                await this.app.state.createAccount(accountName, mnemonic, true, walletType, selectedVariant);
                
                this.hideImportLoadingScreen();
                this.app.showNotification(`Account "${accountName}" imported as ${walletType} wallet`, 'success');
                this.isImporting = false;
                this.close();
                this.app.router.render();
            } catch (error) {
                this.hideImportLoadingScreen();
                this.app.showNotification('Failed to complete import: ' + error.message, 'error');
            }
        }
        
        showImportLoadingScreen() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.loadingOverlay = $.div({
                id: 'import-loading-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10002'
                }
            }, [
                $.div({
                    style: {
                        textAlign: 'center',
                        color: 'var(--text-accent)'
                    }
                }, [
                    $.div({
                        style: {
                            width: '80px',
                            height: '80px',
                            border: '3px solid var(--text-dim)',
                            borderTopColor: 'var(--text-accent)',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    $.h3({
                        style: {
                            color: 'var(--text-accent)',
                            fontSize: '24px',
                            fontFamily: "'JetBrains Mono', monospace",
                            marginBottom: '10px'
                        }
                    }, ['Importing Wallet...']),
                    $.p({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: '14px',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, ['Generating addresses and setting up your account'])
                ])
            ]);
            
            document.body.appendChild(this.loadingOverlay);
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        hideImportLoadingScreen() {
            if (this.loadingOverlay) {
                this.loadingOverlay.remove();
                this.loadingOverlay = null;
            }
        }
        
        generateMnemonic() {
            // Use the global BIP39_WORDS if available
            if (BIP39_WORDS && BIP39_WORDS.length > 0) {
                const mnemonic = [];
                const crypto = window.crypto || window.msCrypto;
                
                if (crypto && crypto.getRandomValues) {
                    const randomValues = new Uint32Array(12);
                    crypto.getRandomValues(randomValues);
                    
                    for (let i = 0; i < 12; i++) {
                        const index = randomValues[i] % BIP39_WORDS.length;
                        mnemonic.push(BIP39_WORDS[index]);
                    }
                } else {
                    // Fallback to Math.random
                    for (let i = 0; i < 12; i++) {
                        // Use crypto.getRandomValues even in fallback
                        const randomBytes = new Uint32Array(1);
                        window.crypto.getRandomValues(randomBytes);
                        mnemonic.push(BIP39_WORDS[randomBytes[0] % BIP39_WORDS.length]);
                    }
                }
                
                return mnemonic.join(' ');
            }
            
            // If no wordlist, return empty string to force API usage
            console.error('No BIP39 wordlist available for local generation');
            return '';
        }
        
        close() {
            if (this.modal) {
                this.modal.classList.remove('show');
                setTimeout(() => {
                    this.modal.remove();
                    this.modal = null;
                }, 300);
            }
        }
    }

    // Export to window
    window.MultiAccountModal = MultiAccountModal;

})(window);
