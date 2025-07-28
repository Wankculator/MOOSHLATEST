// ExportWalletModal Module for MOOSH Wallet
// Handles wallet export with encryption options

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT WALLET MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class ExportWalletModal {
        constructor(app, wallet) {
            this.app = app;
            this.wallet = wallet;
            this.exportFormat = 'json'; // default format
            this.exportProgress = 0;
            this.encryptionEnabled = true;
        }
        
        show() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.backdrop = $.div({
                className: 'modal-backdrop',
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    animation: 'fadeIn 0.3s ease'
                }
            });
            
            this.modal = $.div({
                className: 'export-wallet-modal',
                style: {
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: '30px',
                    minWidth: '500px',
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    animation: 'slideUp 0.3s ease'
                }
            }, [
                // Terminal header
                $.div({
                    style: {
                        borderBottom: '1px solid var(--text-primary)',
                        paddingBottom: '10px',
                        marginBottom: '20px',
                        fontFamily: 'monospace'
                    }
                }, [
                    $.span({ style: { color: 'var(--text-accent)' } }, ['~/moosh/export $ '])
                ]),
                
                // Title
                $.h2({
                    style: {
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                        fontSize: '24px',
                        fontWeight: '300'
                    }
                }, ['Export Wallet']),
                
                // Wallet info
                $.div({
                    style: {
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '15px',
                        marginBottom: '20px',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                    }
                }, [
                    $.div({ style: { marginBottom: '5px' } }, [
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Wallet: ']),
                        $.span({ style: { color: 'var(--text-primary)' } }, [this.wallet.name || 'Unnamed Wallet'])
                    ]),
                    $.div([
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Type: ']),
                        $.span({ style: { color: 'var(--text-accent)' } }, [
                            this.wallet.spark ? 'Spark + Bitcoin' : 'Bitcoin Only'
                        ])
                    ])
                ]),
                
                // Export format selector
                $.div({ style: { marginBottom: '25px' } }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '15px',
                            fontSize: '16px'
                        }
                    }, ['Export Format']),
                    
                    $.div({
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px'
                        }
                    }, [
                        this.createFormatOption('json', 'JSON File', 'Standard encrypted backup file'),
                        this.createFormatOption('qr', 'QR Code', 'For mobile scanning'),
                        this.createFormatOption('paper', 'Paper Backup', 'Printable format')
                    ])
                ]),
                
                // Encryption settings
                $.div({ style: { marginBottom: '25px' } }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '15px',
                            fontSize: '16px'
                        }
                    }, ['Security Settings']),
                    
                    // Encryption toggle
                    $.div({
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }
                    }, [
                        $.input({
                            type: 'checkbox',
                            id: 'encryption-toggle',
                            checked: this.encryptionEnabled,
                            style: {
                                marginRight: '10px',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer'
                            },
                            onchange: (e) => {
                                this.encryptionEnabled = e.target.checked;
                                this.updatePasswordFields();
                            }
                        }),
                        $.label({
                            for: 'encryption-toggle',
                            style: {
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                userSelect: 'none'
                            }
                        }, ['Enable encryption (recommended)'])
                    ]),
                    
                    // Password fields container
                    $.div({
                        id: 'password-fields',
                        style: {
                            display: this.encryptionEnabled ? 'block' : 'none'
                        }
                    }, [
                        // Password input
                        $.div({ style: { marginBottom: '15px' } }, [
                            $.label({
                                style: {
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: 'var(--text-dim)',
                                    fontSize: '14px'
                                }
                            }, ['Encryption Password']),
                            $.input({
                                type: 'password',
                                id: 'export-password',
                                placeholder: 'Enter strong password',
                                style: {
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'monospace',
                                    fontSize: '14px'
                                },
                                oninput: (e) => this.checkPasswordStrength(e.target.value)
                            })
                        ]),
                        
                        // Confirm password
                        $.div({ style: { marginBottom: '15px' } }, [
                            $.label({
                                style: {
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: 'var(--text-dim)',
                                    fontSize: '14px'
                                }
                            }, ['Confirm Password']),
                            $.input({
                                type: 'password',
                                id: 'export-password-confirm',
                                placeholder: 'Confirm password',
                                style: {
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'monospace',
                                    fontSize: '14px'
                                }
                            })
                        ]),
                        
                        // Password strength indicator
                        $.div({
                            id: 'password-strength',
                            style: {
                                height: '4px',
                                background: 'var(--bg-secondary)',
                                marginBottom: '5px',
                                transition: 'all 0.3s ease'
                            }
                        }),
                        $.div({
                            id: 'password-strength-text',
                            style: {
                                fontSize: '12px',
                                color: 'var(--text-dim)',
                                marginBottom: '15px'
                            }
                        }, ['Password strength: Not entered'])
                    ])
                ]),
                
                // Progress indicator
                $.div({
                    id: 'export-progress',
                    style: {
                        display: 'none',
                        marginBottom: '20px'
                    }
                }, [
                    $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            height: '8px',
                            borderRadius: '0',
                            overflow: 'hidden',
                            marginBottom: '10px'
                        }
                    }, [
                        $.div({
                            id: 'progress-bar',
                            style: {
                                width: '0%',
                                height: '100%',
                                background: 'var(--text-accent)',
                                transition: 'width 0.3s ease'
                            }
                        })
                    ]),
                    $.div({
                        id: 'progress-text',
                        style: {
                            textAlign: 'center',
                            color: 'var(--text-dim)',
                            fontSize: '14px'
                        }
                    }, ['Preparing export...'])
                ]),
                
                // Error message
                $.div({
                    id: 'export-error',
                    style: {
                        color: '#ff4444',
                        fontSize: '14px',
                        marginBottom: '20px',
                        display: 'none',
                        padding: '10px',
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid #ff4444'
                    }
                }),
                
                // Buttons
                $.div({
                    style: {
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                    }
                }, [
                    $.button({
                        id: 'export-button',
                        style: {
                            background: 'var(--text-accent)',
                            border: '2px solid var(--text-accent)',
                            borderRadius: '0',
                            color: 'var(--bg-primary)',
                            padding: '12px 30px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        },
                        onclick: () => this.exportWallet()
                    }, ['Export Wallet']),
                    
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '2px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            padding: '12px 30px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontSize: '14px'
                        },
                        onclick: () => this.close()
                    }, ['Cancel'])
                ])
            ]);
            
            this.backdrop.appendChild(this.modal);
            document.body.appendChild(this.backdrop);
            
            // Focus password field if encryption is enabled
            if (this.encryptionEnabled) {
                setTimeout(() => {
                    document.getElementById('export-password')?.focus();
                }, 100);
            }
            
            // Add escape key handler
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }
        
        createFormatOption(format, title, description) {
            const $ = window.ElementFactory || ElementFactory;
            const isSelected = this.exportFormat === format;
            
            return $.div({
                className: `format-option ${isSelected ? 'selected' : ''}`,
                style: {
                    border: `2px solid ${isSelected ? 'var(--text-accent)' : 'var(--border-color)'}`,
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'rgba(0, 255, 0, 0.05)' : 'transparent'
                },
                onclick: () => {
                    this.exportFormat = format;
                    this.updateFormatSelection();
                }
            }, [
                $.h4({
                    style: {
                        color: 'var(--text-primary)',
                        marginBottom: '5px',
                        fontSize: '14px'
                    }
                }, [title]),
                $.p({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: '12px',
                        margin: 0
                    }
                }, [description])
            ]);
        }
        
        updateFormatSelection() {
            // Re-render format options to update selection
            const formatContainer = this.modal.querySelector('.format-option').parentElement;
            formatContainer.innerHTML = '';
            formatContainer.appendChild(this.createFormatOption('json', 'JSON File', 'Standard encrypted backup file'));
            formatContainer.appendChild(this.createFormatOption('qr', 'QR Code', 'For mobile scanning'));
            formatContainer.appendChild(this.createFormatOption('paper', 'Paper Backup', 'Printable format'));
        }
        
        updatePasswordFields() {
            const passwordFields = document.getElementById('password-fields');
            if (passwordFields) {
                passwordFields.style.display = this.encryptionEnabled ? 'block' : 'none';
            }
        }
        
        checkPasswordStrength(password) {
            const strengthBar = document.getElementById('password-strength');
            const strengthText = document.getElementById('password-strength-text');
            
            if (!strengthBar || !strengthText) return;
            
            let strength = 0;
            let strengthLabel = 'Too weak';
            let color = '#ff4444';
            
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;
            
            if (strength <= 1) {
                strengthLabel = 'Too weak';
                color = '#ff4444';
            } else if (strength === 2) {
                strengthLabel = 'Weak';
                color = '#ff8844';
            } else if (strength === 3) {
                strengthLabel = 'Fair';
                color = '#ffaa44';
            } else if (strength === 4) {
                strengthLabel = 'Good';
                color = '#44ff44';
            } else {
                strengthLabel = 'Strong';
                color = '#00ff00';
            }
            
            strengthBar.style.width = `${(strength / 5) * 100}%`;
            strengthBar.style.background = color;
            strengthText.textContent = `Password strength: ${strengthLabel}`;
        }
        
        async exportWallet() {
            const errorDiv = document.getElementById('export-error');
            const progressDiv = document.getElementById('export-progress');
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            const exportButton = document.getElementById('export-button');
            
            // Reset error
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            
            // Validate password if encryption is enabled
            if (this.encryptionEnabled) {
                const password = document.getElementById('export-password').value;
                const confirmPassword = document.getElementById('export-password-confirm').value;
                
                if (!password) {
                    errorDiv.textContent = 'Please enter an encryption password';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                if (password.length < 12) {
                    errorDiv.textContent = 'Password must be at least 12 characters long';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                if (password !== confirmPassword) {
                    errorDiv.textContent = 'Passwords do not match';
                    errorDiv.style.display = 'block';
                    return;
                }
            }
            
            // Show progress
            progressDiv.style.display = 'block';
            exportButton.disabled = true;
            exportButton.textContent = 'Exporting...';
            
            try {
                // Update progress
                this.updateProgress(10, 'Preparing wallet data...');
                
                // Prepare export data
                const exportData = {
                    walletId: this.wallet.id,
                    format: this.exportFormat,
                    encrypted: this.encryptionEnabled,
                    password: this.encryptionEnabled ? document.getElementById('export-password').value : null
                };
                
                // Update progress
                this.updateProgress(30, 'Encrypting wallet data...');
                
                // Call export API
                const response = await this.app.apiService.request('/api/wallet/export/' + this.wallet.id, {
                    method: 'POST',
                    body: JSON.stringify(exportData)
                });
                
                if (!response.success) {
                    throw new Error(response.error || 'Export failed');
                }
                
                // Update progress
                this.updateProgress(70, 'Generating export file...');
                
                // Handle different export formats
                switch (this.exportFormat) {
                    case 'json':
                        await this.downloadJSONExport(response.data);
                        break;
                    case 'qr':
                        await this.showQRExport(response.data);
                        break;
                    case 'paper':
                        await this.showPaperExport(response.data);
                        break;
                }
                
                // Update progress
                this.updateProgress(100, 'Export complete!');
                
                // Close modal after short delay
                setTimeout(() => {
                    this.close();
                    if (this.app.showNotification) {
                        this.app.showNotification('Wallet exported successfully', 'success');
                    }
                }, 1500);
                
            } catch (error) {
                console.error('Export error:', error);
                errorDiv.textContent = error.message || 'Failed to export wallet';
                errorDiv.style.display = 'block';
                exportButton.disabled = false;
                exportButton.textContent = 'Export Wallet';
                progressDiv.style.display = 'none';
            }
        }
        
        updateProgress(percent, message) {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = message;
        }
        
        async downloadJSONExport(data) {
            const blob = new Blob([data.encryptedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `moosh-wallet-${this.wallet.name || 'backup'}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        async showQRExport(data) {
            // This would show a QR code modal
            // For now, we'll just download as JSON
            console.log('QR export not yet implemented, downloading as JSON');
            await this.downloadJSONExport(data);
        }
        
        async showPaperExport(data) {
            // This would show a printable paper backup
            // For now, we'll just download as JSON
            console.log('Paper export not yet implemented, downloading as JSON');
            await this.downloadJSONExport(data);
        }
        
        close() {
            if (this.backdrop) {
                // Remove event listener
                document.removeEventListener('keydown', this.escapeHandler);
                
                // Fade out animation
                this.backdrop.style.animation = 'fadeOut 0.3s ease';
                this.modal.style.animation = 'slideDown 0.3s ease';
                
                setTimeout(() => {
                    this.backdrop.remove();
                }, 300);
            }
        }
    }

    // Export to window
    window.ExportWalletModal = ExportWalletModal;

})(window);