// ImportWalletModal Module for MOOSH Wallet
// Handles wallet import from various sources with decryption

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // IMPORT WALLET MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class ImportWalletModal {
        constructor(app) {
            this.app = app;
            this.importMethod = 'file'; // file, text, qr
            this.importData = null;
            this.decryptedData = null;
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
                className: 'import-wallet-modal',
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
                    $.span({ style: { color: 'var(--text-accent)' } }, ['~/moosh/import $ '])
                ]),
                
                // Title
                $.h2({
                    style: {
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                        fontSize: '24px',
                        fontWeight: '300'
                    }
                }, ['Import Wallet']),
                
                // Description
                $.p({
                    style: {
                        color: 'var(--text-dim)',
                        marginBottom: '25px',
                        fontSize: '14px'
                    }
                }, ['Import a previously exported wallet backup']),
                
                // Import method selector
                $.div({ style: { marginBottom: '25px' } }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '15px',
                            fontSize: '16px'
                        }
                    }, ['Import Method']),
                    
                    $.div({
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px'
                        }
                    }, [
                        this.createMethodOption('file', 'File Upload', 'Upload backup file'),
                        this.createMethodOption('text', 'Text Input', 'Paste backup data'),
                        this.createMethodOption('qr', 'QR Code', 'Scan QR code')
                    ])
                ]),
                
                // Import input area
                $.div({
                    id: 'import-input-container',
                    style: { marginBottom: '25px' }
                }, [
                    this.createFileInput()
                ]),
                
                // Password section (hidden initially)
                $.div({
                    id: 'password-section',
                    style: {
                        display: 'none',
                        marginBottom: '25px'
                    }
                }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '15px',
                            fontSize: '16px'
                        }
                    }, ['Decryption Password']),
                    
                    $.div({ style: { marginBottom: '15px' } }, [
                        $.input({
                            type: 'password',
                            id: 'import-password',
                            placeholder: 'Enter decryption password',
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
                            onkeydown: (e) => {
                                if (e.key === 'Enter') {
                                    this.decryptAndPreview();
                                }
                            }
                        })
                    ])
                ]),
                
                // Preview section (hidden initially)
                $.div({
                    id: 'preview-section',
                    style: {
                        display: 'none',
                        marginBottom: '25px'
                    }
                }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '15px',
                            fontSize: '16px'
                        }
                    }, ['Import Preview']),
                    
                    $.div({
                        id: 'preview-content',
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: '15px',
                            fontFamily: 'monospace',
                            fontSize: '14px'
                        }
                    })
                ]),
                
                // Progress indicator
                $.div({
                    id: 'import-progress',
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
                    }, ['Processing...'])
                ]),
                
                // Error message
                $.div({
                    id: 'import-error',
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
                
                // Success message
                $.div({
                    id: 'import-success',
                    style: {
                        color: '#44ff44',
                        fontSize: '14px',
                        marginBottom: '20px',
                        display: 'none',
                        padding: '10px',
                        background: 'rgba(68, 255, 68, 0.1)',
                        border: '1px solid #44ff44'
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
                        id: 'decrypt-button',
                        style: {
                            background: 'transparent',
                            border: '2px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            padding: '12px 30px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            display: 'none'
                        },
                        onclick: () => this.decryptAndPreview()
                    }, ['Decrypt & Preview']),
                    
                    $.button({
                        id: 'import-button',
                        style: {
                            background: 'var(--text-accent)',
                            border: '2px solid var(--text-accent)',
                            borderRadius: '0',
                            color: 'var(--bg-primary)',
                            padding: '12px 30px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'none'
                        },
                        onclick: () => this.importWallet()
                    }, ['Import Wallet']),
                    
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
            
            // Add escape key handler
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }
        
        createMethodOption(method, title, description) {
            const $ = window.ElementFactory || ElementFactory;
            const isSelected = this.importMethod === method;
            
            return $.div({
                className: `method-option ${isSelected ? 'selected' : ''}`,
                style: {
                    border: `2px solid ${isSelected ? 'var(--text-accent)' : 'var(--border-color)'}`,
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'rgba(0, 255, 0, 0.05)' : 'transparent'
                },
                onclick: () => {
                    this.importMethod = method;
                    this.updateMethodSelection();
                    this.updateInputArea();
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
        
        updateMethodSelection() {
            // Re-render method options to update selection
            const methodContainer = this.modal.querySelector('.method-option').parentElement;
            methodContainer.innerHTML = '';
            methodContainer.appendChild(this.createMethodOption('file', 'File Upload', 'Upload backup file'));
            methodContainer.appendChild(this.createMethodOption('text', 'Text Input', 'Paste backup data'));
            methodContainer.appendChild(this.createMethodOption('qr', 'QR Code', 'Scan QR code'));
        }
        
        updateInputArea() {
            const container = document.getElementById('import-input-container');
            container.innerHTML = '';
            
            switch (this.importMethod) {
                case 'file':
                    container.appendChild(this.createFileInput());
                    break;
                case 'text':
                    container.appendChild(this.createTextInput());
                    break;
                case 'qr':
                    container.appendChild(this.createQRInput());
                    break;
            }
            
            // Reset state
            this.importData = null;
            this.decryptedData = null;
            document.getElementById('password-section').style.display = 'none';
            document.getElementById('preview-section').style.display = 'none';
            document.getElementById('decrypt-button').style.display = 'none';
            document.getElementById('import-button').style.display = 'none';
        }
        
        createFileInput() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div([
                $.div({
                    id: 'drop-zone',
                    style: {
                        border: '2px dashed var(--border-color)',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    },
                    ondragover: (e) => {
                        e.preventDefault();
                        e.target.style.borderColor = 'var(--text-accent)';
                        e.target.style.background = 'rgba(0, 255, 0, 0.05)';
                    },
                    ondragleave: (e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.background = 'transparent';
                    },
                    ondrop: (e) => {
                        e.preventDefault();
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.background = 'transparent';
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                            this.handleFileSelect(files[0]);
                        }
                    },
                    onclick: () => {
                        document.getElementById('file-input').click();
                    }
                }, [
                    $.div({
                        style: {
                            fontSize: '48px',
                            marginBottom: '10px',
                            opacity: '0.5'
                        }
                    }, ['📁']),
                    $.p({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: '5px'
                        }
                    }, ['Drop wallet backup file here']),
                    $.p({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: '14px'
                        }
                    }, ['or click to browse']),
                    $.input({
                        id: 'file-input',
                        type: 'file',
                        accept: '.json',
                        style: { display: 'none' },
                        onchange: (e) => {
                            if (e.target.files.length > 0) {
                                this.handleFileSelect(e.target.files[0]);
                            }
                        }
                    })
                ]),
                $.div({
                    id: 'file-info',
                    style: {
                        marginTop: '15px',
                        display: 'none'
                    }
                })
            ]);
        }
        
        createTextInput() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div([
                $.textarea({
                    id: 'text-input',
                    placeholder: 'Paste your wallet backup data here...',
                    style: {
                        width: '100%',
                        minHeight: '200px',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        resize: 'vertical'
                    },
                    oninput: (e) => {
                        if (e.target.value.trim()) {
                            this.handleTextInput(e.target.value);
                        }
                    }
                })
            ]);
        }
        
        createQRInput() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    textAlign: 'center',
                    padding: '40px'
                }
            }, [
                $.div({
                    style: {
                        fontSize: '48px',
                        marginBottom: '20px'
                    }
                }, ['📷']),
                $.p({
                    style: {
                        color: 'var(--text-primary)',
                        marginBottom: '20px'
                    }
                }, ['QR Code scanning not yet implemented']),
                $.p({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: '14px'
                    }
                }, ['Please use file upload or text input instead'])
            ]);
        }
        
        async handleFileSelect(file) {
            const errorDiv = document.getElementById('import-error');
            const fileInfo = document.getElementById('file-info');
            
            // Reset error
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            
            // Validate file
            if (!file.name.endsWith('.json')) {
                errorDiv.textContent = 'Please select a valid JSON backup file';
                errorDiv.style.display = 'block';
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                errorDiv.textContent = 'File too large (max 10MB)';
                errorDiv.style.display = 'block';
                return;
            }
            
            // Show file info
            const $ = window.ElementFactory || ElementFactory;
            fileInfo.innerHTML = '';
            fileInfo.appendChild(
                $.div({
                    style: {
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '10px',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                    }
                }, [
                    $.div({ style: { marginBottom: '5px' } }, [
                        $.span({ style: { color: 'var(--text-dim)' } }, ['File: ']),
                        $.span({ style: { color: 'var(--text-primary)' } }, [file.name])
                    ]),
                    $.div([
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Size: ']),
                        $.span({ style: { color: 'var(--text-primary)' } }, [
                            `${(file.size / 1024).toFixed(2)} KB`
                        ])
                    ])
                ])
            );
            fileInfo.style.display = 'block';
            
            // Read file
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.handleImportData(data);
                    } catch (error) {
                        errorDiv.textContent = 'Invalid backup file format';
                        errorDiv.style.display = 'block';
                    }
                };
                reader.readAsText(file);
            } catch (error) {
                errorDiv.textContent = 'Failed to read file';
                errorDiv.style.display = 'block';
            }
        }
        
        handleTextInput(text) {
            const errorDiv = document.getElementById('import-error');
            
            // Reset error
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            
            try {
                const data = JSON.parse(text);
                this.handleImportData(data);
            } catch (error) {
                errorDiv.textContent = 'Invalid backup data format';
                errorDiv.style.display = 'block';
            }
        }
        
        handleImportData(data) {
            this.importData = data;
            
            // Check if data is encrypted
            if (data.encrypted) {
                document.getElementById('password-section').style.display = 'block';
                document.getElementById('decrypt-button').style.display = 'inline-block';
                document.getElementById('import-password').focus();
            } else {
                // Unencrypted data, show preview directly
                this.showPreview(data);
            }
        }
        
        async decryptAndPreview() {
            const errorDiv = document.getElementById('import-error');
            const progressDiv = document.getElementById('import-progress');
            const password = document.getElementById('import-password').value;
            
            // Reset error
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            
            if (!password) {
                errorDiv.textContent = 'Please enter the decryption password';
                errorDiv.style.display = 'block';
                return;
            }
            
            // Show progress
            progressDiv.style.display = 'block';
            this.updateProgress(30, 'Decrypting wallet data...');
            
            try {
                // Validate import data first
                const validateResponse = await this.app.apiService.request('/api/wallet/validate-import', {
                    method: 'POST',
                    body: JSON.stringify({
                        encryptedData: this.importData,
                        password: password
                    })
                });
                
                if (!validateResponse.success) {
                    throw new Error(validateResponse.error || 'Invalid backup data');
                }
                
                this.updateProgress(70, 'Validating wallet data...');
                
                // Store decrypted data
                this.decryptedData = validateResponse.data;
                
                // Show preview
                this.showPreview(this.decryptedData);
                
                // Hide progress
                progressDiv.style.display = 'none';
                
            } catch (error) {
                console.error('Decrypt error:', error);
                errorDiv.textContent = error.message || 'Failed to decrypt wallet data';
                errorDiv.style.display = 'block';
                progressDiv.style.display = 'none';
            }
        }
        
        showPreview(data) {
            const $ = window.ElementFactory || ElementFactory;
            const previewSection = document.getElementById('preview-section');
            const previewContent = document.getElementById('preview-content');
            
            previewContent.innerHTML = '';
            previewContent.appendChild(
                $.div([
                    $.div({ style: { marginBottom: '10px' } }, [
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Wallet Name: ']),
                        $.span({ style: { color: 'var(--text-primary)' } }, [
                            data.walletName || 'Unnamed Wallet'
                        ])
                    ]),
                    $.div({ style: { marginBottom: '10px' } }, [
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Type: ']),
                        $.span({ style: { color: 'var(--text-accent)' } }, [
                            data.spark ? 'Spark + Bitcoin' : 'Bitcoin Only'
                        ])
                    ]),
                    $.div({ style: { marginBottom: '10px' } }, [
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Created: ']),
                        $.span({ style: { color: 'var(--text-primary)' } }, [
                            new Date(data.createdAt).toLocaleString()
                        ])
                    ]),
                    $.div([
                        $.span({ style: { color: 'var(--text-dim)' } }, ['Addresses: ']),
                        $.span({ style: { color: 'var(--text-primary)' } }, [
                            `Bitcoin: ${data.addresses?.bitcoin?.substring(0, 20)}...`
                        ])
                    ])
                ])
            );
            
            previewSection.style.display = 'block';
            document.getElementById('import-button').style.display = 'inline-block';
        }
        
        async importWallet() {
            const errorDiv = document.getElementById('import-error');
            const successDiv = document.getElementById('import-success');
            const progressDiv = document.getElementById('import-progress');
            const importButton = document.getElementById('import-button');
            
            // Reset messages
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            successDiv.style.display = 'none';
            successDiv.textContent = '';
            
            // Show progress
            progressDiv.style.display = 'block';
            importButton.disabled = true;
            importButton.textContent = 'Importing...';
            
            try {
                this.updateProgress(20, 'Preparing import...');
                
                // Prepare import request
                const importData = {
                    encryptedData: this.importData,
                    password: this.importData.encrypted ? 
                        document.getElementById('import-password').value : null
                };
                
                this.updateProgress(50, 'Importing wallet...');
                
                // Call import API
                const response = await this.app.apiService.request('/api/wallet/import', {
                    method: 'POST',
                    body: JSON.stringify(importData)
                });
                
                if (!response.success) {
                    throw new Error(response.error || 'Import failed');
                }
                
                this.updateProgress(80, 'Finalizing import...');
                
                // Add wallet to state
                if (this.app.walletManager) {
                    await this.app.walletManager.loadWallets();
                }
                
                this.updateProgress(100, 'Import complete!');
                
                // Show success message
                successDiv.textContent = 'Wallet imported successfully!';
                successDiv.style.display = 'block';
                
                // Close modal after delay
                setTimeout(() => {
                    this.close();
                    if (this.app.showNotification) {
                        this.app.showNotification('Wallet imported successfully', 'success');
                    }
                    // Refresh the dashboard
                    if (this.app.router) {
                        this.app.router.navigate('/dashboard');
                    }
                }, 2000);
                
            } catch (error) {
                console.error('Import error:', error);
                errorDiv.textContent = error.message || 'Failed to import wallet';
                errorDiv.style.display = 'block';
                importButton.disabled = false;
                importButton.textContent = 'Import Wallet';
                progressDiv.style.display = 'none';
            }
        }
        
        updateProgress(percent, message) {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = message;
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
    window.ImportWalletModal = ImportWalletModal;

})(window);