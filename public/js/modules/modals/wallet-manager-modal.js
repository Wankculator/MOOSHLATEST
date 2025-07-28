// MOOSH WALLET - Wallet Manager Modal
// UI for managing multiple wallets
// Following MOOSH design patterns and security guidelines

(function(window) {
    'use strict';

    class WalletManagerModal extends ModalBase {
        constructor(app) {
            super(app);
            this.walletManager = app.walletManager;
            this.showCreateForm = false;
            this.editingWalletId = null;
        }
        
        getContent() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    width: 'min(90vw, 600px)',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    background: '#000',
                    border: '2px solid #f57315',
                    padding: '20px',
                    fontFamily: 'JetBrains Mono, monospace'
                }
            }, [
                this.createHeader(),
                this.createToolbar(),
                this.showCreateForm ? this.createWalletForm() : this.createWalletList(),
                this.createFooter()
            ]);
        }
        
        createHeader() {
            const $ = window.ElementFactory || window.$;
            const walletCount = this.walletManager.wallets.length;
            
            return $.div({
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #333'
                }
            }, [
                $.h2({
                    style: {
                        margin: '0',
                        fontSize: '20px',
                        color: '#f57315'
                    }
                }, [`Wallet Manager (${walletCount} wallet${walletCount !== 1 ? 's' : ''})`]),
                $.button({
                    style: {
                        background: '#000',
                        border: '2px solid #f57315',
                        color: '#f57315',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'all 0.2s ease'
                    },
                    onmouseover: (e) => {
                        e.currentTarget.style.background = '#f57315';
                        e.currentTarget.style.color = '#000';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000';
                        e.currentTarget.style.color = '#f57315';
                    },
                    onclick: () => this.close()
                }, ['CLOSE'])
            ]);
        }
        
        createToolbar() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px'
                }
            }, [
                $.button({
                    style: {
                        background: this.showCreateForm ? '#f57315' : '#000',
                        border: '2px solid #f57315',
                        color: this.showCreateForm ? '#000' : '#f57315',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'all 0.2s ease'
                    },
                    onmouseover: (e) => {
                        if (!this.showCreateForm) {
                            e.currentTarget.style.background = '#f57315';
                            e.currentTarget.style.color = '#000';
                        }
                    },
                    onmouseout: (e) => {
                        if (!this.showCreateForm) {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.color = '#f57315';
                        }
                    },
                    onclick: () => {
                        this.showCreateForm = !this.showCreateForm;
                        this.update();
                    }
                }, [this.showCreateForm ? 'CANCEL' : '+ NEW WALLET']),
                
                $.button({
                    style: {
                        background: '#000',
                        border: '2px solid #69fd97',
                        color: '#69fd97',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'all 0.2s ease'
                    },
                    onmouseover: (e) => {
                        e.currentTarget.style.background = '#69fd97';
                        e.currentTarget.style.color = '#000';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000';
                        e.currentTarget.style.color = '#69fd97';
                    },
                    onclick: () => this.exportAllWallets()
                }, ['EXPORT ALL'])
            ]);
        }
        
        createWalletForm() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    background: '#111',
                    border: '1px solid #333',
                    padding: '20px',
                    marginBottom: '20px'
                }
            }, [
                $.h3({
                    style: {
                        margin: '0 0 15px 0',
                        fontSize: '16px',
                        color: '#f57315'
                    }
                }, ['Create New Wallet']),
                
                $.div({
                    style: {
                        marginBottom: '15px'
                    }
                }, [
                    $.label({
                        style: {
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '12px',
                            color: '#888'
                        }
                    }, ['Wallet Name']),
                    $.input({
                        id: 'new-wallet-name',
                        type: 'text',
                        placeholder: 'Enter wallet name...',
                        style: {
                            width: '100%',
                            padding: '8px',
                            background: '#000',
                            border: '1px solid #333',
                            color: '#fff',
                            fontSize: '14px',
                            fontFamily: 'JetBrains Mono, monospace'
                        },
                        onkeydown: (e) => {
                            if (e.key === 'Enter') {
                                this.createNewWallet();
                            }
                        }
                    })
                ]),
                
                $.div({
                    style: {
                        marginBottom: '15px'
                    }
                }, [
                    $.label({
                        style: {
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '12px',
                            color: '#888'
                        }
                    }, ['Theme Color']),
                    $.div({
                        style: {
                            display: 'flex',
                            gap: '10px'
                        }
                    }, this.createColorOptions())
                ]),
                
                $.div({
                    style: {
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                    }
                }, [
                    $.button({
                        style: {
                            background: '#000',
                            border: '2px solid #69fd97',
                            color: '#69fd97',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.background = '#69fd97';
                            e.currentTarget.style.color = '#000';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.background = '#000';
                            e.currentTarget.style.color = '#69fd97';
                        },
                        onclick: () => this.createNewWallet()
                    }, ['CREATE WALLET'])
                ])
            ]);
        }
        
        createColorOptions() {
            const $ = window.ElementFactory || window.$;
            const colors = ['#f57315', '#69fd97', '#ff4444', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
            
            return colors.map(color => 
                $.button({
                    className: 'wallet-color-option',
                    'data-color': color,
                    style: {
                        width: '30px',
                        height: '30px',
                        background: color,
                        border: '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: (e) => {
                        // Remove previous selection
                        document.querySelectorAll('.wallet-color-option').forEach(btn => {
                            btn.style.border = '2px solid transparent';
                        });
                        // Mark as selected
                        e.currentTarget.style.border = '2px solid #fff';
                    }
                }, [''])
            );
        }
        
        createWalletList() {
            const $ = window.ElementFactory || window.$;
            const wallets = this.walletManager.getAllWallets();
            const activeWalletId = this.walletManager.activeWalletId;
            
            return $.div({
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }
            }, wallets.map(wallet => this.createWalletCard(wallet, wallet.id === activeWalletId)));
        }
        
        createWalletCard(wallet, isActive) {
            const $ = window.ElementFactory || window.$;
            const stats = this.walletManager.getWalletStats(wallet.id);
            
            return $.div({
                style: {
                    background: isActive ? `${wallet.settings.color}20` : '#111',
                    border: `2px solid ${isActive ? wallet.settings.color : '#333'}`,
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                },
                onmouseover: (e) => {
                    if (!isActive) {
                        e.currentTarget.style.borderColor = wallet.settings.color;
                        e.currentTarget.style.background = `${wallet.settings.color}10`;
                    }
                },
                onmouseout: (e) => {
                    if (!isActive) {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.background = '#111';
                    }
                },
                onclick: () => {
                    if (!isActive) {
                        this.walletManager.switchWallet(wallet.id);
                        this.update();
                    }
                }
            }, [
                // Active indicator
                isActive && $.div({
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: wallet.settings.color,
                        color: '#000',
                        padding: '4px 8px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }
                }, ['ACTIVE']),
                
                // Wallet name
                this.editingWalletId === wallet.id ?
                    $.input({
                        type: 'text',
                        value: wallet.name,
                        style: {
                            background: '#000',
                            border: `1px solid ${wallet.settings.color}`,
                            color: '#fff',
                            padding: '4px 8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            fontFamily: 'JetBrains Mono, monospace',
                            marginBottom: '10px',
                            width: '100%'
                        },
                        onclick: (e) => e.stopPropagation(),
                        onkeydown: (e) => {
                            if (e.key === 'Enter') {
                                this.saveWalletName(wallet.id, e.target.value);
                            } else if (e.key === 'Escape') {
                                this.editingWalletId = null;
                                this.update();
                            }
                        },
                        onblur: (e) => {
                            this.saveWalletName(wallet.id, e.target.value);
                        }
                    }) :
                    $.h3({
                        style: {
                            margin: '0 0 10px 0',
                            fontSize: '16px',
                            color: wallet.settings.color
                        }
                    }, [wallet.name]),
                
                // Wallet info
                $.div({
                    style: {
                        fontSize: '12px',
                        color: '#888',
                        marginBottom: '10px'
                    }
                }, [
                    $.div({}, [`Accounts: ${stats.accountCount}`]),
                    $.div({}, [`Created: ${new Date(wallet.createdAt).toLocaleDateString()}`]),
                    $.div({}, [`Last used: ${this.formatTimeAgo(wallet.lastAccessedAt)}`]),
                    wallet.metadata.backupDate && $.div({}, [
                        `Last backup: ${this.formatTimeAgo(wallet.metadata.backupDate)}`
                    ])
                ]),
                
                // Action buttons
                $.div({
                    style: {
                        display: 'flex',
                        gap: '5px'
                    }
                }, [
                    !isActive && $.button({
                        style: {
                            background: '#000',
                            border: '1px solid #333',
                            color: '#f57315',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.borderColor = '#f57315';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.borderColor = '#333';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.walletManager.switchWallet(wallet.id);
                            this.update();
                        }
                    }, ['SWITCH']),
                    
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid #333',
                            color: '#888',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.borderColor = '#888';
                            e.currentTarget.style.color = '#fff';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.borderColor = '#333';
                            e.currentTarget.style.color = '#888';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.editingWalletId = wallet.id;
                            this.update();
                        }
                    }, ['RENAME']),
                    
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid #333',
                            color: '#4444ff',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.borderColor = '#4444ff';
                            e.currentTarget.style.color = '#6666ff';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.borderColor = '#333';
                            e.currentTarget.style.color = '#4444ff';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.manageWalletAccounts(wallet);
                        }
                    }, ['ACCOUNTS']),
                    
                    $.button({
                        style: {
                            background: '#000',
                            border: '1px solid #333',
                            color: '#69fd97',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.borderColor = '#69fd97';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.borderColor = '#333';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.exportWallet(wallet.id);
                        }
                    }, ['EXPORT']),
                    
                    (this.walletManager.wallets.length > 1 && !isActive) && $.button({
                        style: {
                            background: '#000',
                            border: '1px solid #ff4444',
                            color: '#ff4444',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.2s ease'
                        },
                        onmouseover: (e) => {
                            e.currentTarget.style.borderColor = '#ff6666';
                            e.currentTarget.style.background = '#220000';
                        },
                        onmouseout: (e) => {
                            e.currentTarget.style.borderColor = '#ff4444';
                            e.currentTarget.style.background = '#000';
                        },
                        onclick: (e) => {
                            e.stopPropagation();
                            this.confirmDeleteWallet(wallet);
                        }
                    }, ['DELETE'])
                ])
            ]);
        }
        
        createFooter() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    marginTop: '20px',
                    paddingTop: '15px',
                    borderTop: '1px solid #333',
                    fontSize: '11px',
                    color: '#666',
                    textAlign: 'center'
                }
            }, [
                'Each wallet has its own accounts and settings. ',
                'Switch between wallets to manage different portfolios.'
            ]);
        }
        
        createNewWallet() {
            const nameInput = document.getElementById('new-wallet-name');
            const name = nameInput.value.trim();
            
            if (!name) {
                this.app.showNotification('Please enter a wallet name', 'error');
                return;
            }
            
            // Get selected color
            const selectedColorBtn = document.querySelector('.wallet-color-option[style*="border: 2px solid rgb(255, 255, 255)"]');
            const color = selectedColorBtn ? selectedColorBtn.getAttribute('data-color') : '#f57315';
            
            // Create wallet
            const wallet = this.walletManager.createWallet(name, {
                settings: { color }
            });
            
            // Reset form
            this.showCreateForm = false;
            this.update();
            
            this.app.showNotification(`Created wallet: ${name}`, 'success');
        }
        
        saveWalletName(walletId, newName) {
            if (!newName.trim()) {
                this.app.showNotification('Wallet name cannot be empty', 'error');
                this.editingWalletId = null;
                this.update();
                return;
            }
            
            this.walletManager.renameWallet(walletId, newName.trim());
            this.editingWalletId = null;
            this.update();
            
            this.app.showNotification('Wallet renamed', 'success');
        }
        
        confirmDeleteWallet(wallet) {
            if (confirm(`Delete wallet "${wallet.name}"?\n\nThis will remove all accounts in this wallet. This action cannot be undone.`)) {
                this.walletManager.deleteWallet(wallet.id);
                this.update();
            }
        }
        
        exportWallet(walletId) {
            const exportData = this.walletManager.exportWallet(walletId, true);
            const wallet = this.walletManager.getWallet(walletId);
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `moosh-wallet-${wallet.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
            link.click();
            
            this.app.showNotification(`Exported ${wallet.name}`, 'success');
        }
        
        exportAllWallets() {
            const exportData = {
                version: '1.0',
                exportDate: Date.now(),
                wallets: []
            };
            
            this.walletManager.wallets.forEach(wallet => {
                const walletExport = this.walletManager.exportWallet(wallet.id, true);
                exportData.wallets.push(walletExport);
            });
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `moosh-all-wallets-${Date.now()}.json`;
            link.click();
            
            this.app.showNotification(`Exported ${exportData.wallets.length} wallets`, 'success');
        }
        
        formatTimeAgo(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            
            if (diff < 3600000) { // Less than 1 hour
                const minutes = Math.floor(diff / 60000);
                return `${minutes}m ago`;
            } else if (diff < 86400000) { // Less than 24 hours
                const hours = Math.floor(diff / 3600000);
                return `${hours}h ago`;
            } else if (diff < 604800000) { // Less than 7 days
                const days = Math.floor(diff / 86400000);
                return `${days}d ago`;
            } else {
                return new Date(timestamp).toLocaleDateString();
            }
        }
        
        manageWalletAccounts(wallet) {
            // First switch to this wallet
            if (wallet.id !== this.walletManager.activeWalletId) {
                this.walletManager.switchWallet(wallet.id);
            }
            
            // Close this modal
            this.close();
            
            // Open account list modal after a brief delay to allow wallet switch
            setTimeout(() => {
                const AccountListModal = window.AccountListModal;
                if (AccountListModal) {
                    const modal = new AccountListModal(this.app);
                    modal.show();
                } else {
                    this.app.showNotification('Account manager not available', 'error');
                }
            }, 300);
        }
    }
    
    // Make available globally
    window.WalletManagerModal = WalletManagerModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.WalletManagerModal = WalletManagerModal;
    }
    
})(window);