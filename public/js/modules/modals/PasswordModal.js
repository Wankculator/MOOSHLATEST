// PasswordModal Module for MOOSH Wallet
// Handles password verification and password management

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // PASSWORD MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class PasswordModal {
        constructor(app, options = {}) {
            this.app = app;
            this.options = {
                title: options.title || 'Password Required',
                message: options.message || 'Enter your password to continue',
                onSuccess: options.onSuccess || (() => {}),
                onCancel: options.onCancel || (() => {}),
                showSetPassword: options.showSetPassword !== false,
                requireNewPassword: options.requireNewPassword || false
            };
            this.attempts = 0;
            this.maxAttempts = 3;
        }
        
        show() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Check if password is required but not set
            if (!this.app.state.hasPassword() && !this.options.requireNewPassword) {
                this.showSetPasswordDialog();
                return;
            }
            
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
                    zIndex: 10000
                }
            });
            
            this.modal = $.div({
                className: 'password-modal',
                style: {
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: '30px',
                    minWidth: '400px',
                    maxWidth: '500px',
                    width: '90%'
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
                    $.span({ style: { color: 'var(--text-accent)' } }, ['~/moosh/security $ '])
                ]),
                
                // Title
                $.h2({
                    style: {
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                        fontSize: '20px'
                    }
                }, [this.options.title]),
                
                // Message
                $.p({
                    style: {
                        color: 'var(--text-dim)',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }
                }, [this.options.message]),
                
                // Password input
                $.div({ style: { marginBottom: '20px' } }, [
                    $.input({
                        id: 'password-input',
                        type: 'password',
                        placeholder: 'Enter password',
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
                                this.verifyPassword();
                            } else if (e.key === 'Escape') {
                                this.cancel();
                            }
                        }
                    })
                ]),
                
                // Error message
                $.div({
                    id: 'password-error',
                    style: {
                        color: '#ff4444',
                        fontSize: '12px',
                        marginBottom: '20px',
                        display: 'none'
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
                        style: {
                            background: 'transparent',
                            border: '2px solid var(--text-primary)',
                            borderRadius: '0',
                            color: 'var(--text-primary)',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        },
                        onclick: () => this.verifyPassword()
                    }, ['Verify']),
                    
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-dim)',
                            borderRadius: '0',
                            color: 'var(--text-dim)',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        },
                        onclick: () => this.cancel()
                    }, ['Cancel'])
                ])
            ]);
            
            this.backdrop.appendChild(this.modal);
            document.body.appendChild(this.backdrop);
            
            // Focus password input
            setTimeout(() => {
                document.getElementById('password-input')?.focus();
            }, 100);
        }
        
        verifyPassword() {
            const input = document.getElementById('password-input');
            const errorDiv = document.getElementById('password-error');
            
            if (!input) return;
            
            const password = input.value;
            
            if (!password) {
                this.showError('Please enter a password');
                return;
            }
            
            // Verify the password
            if (this.app.state.verifyPassword(password)) {
                // Success
                this.close();
                this.options.onSuccess();
                
                // Reset password timeout
                this.app.state.startPasswordTimeout();
            } else {
                // Failed attempt
                this.attempts++;
                
                if (this.attempts >= this.maxAttempts) {
                    this.showError('Too many failed attempts. Please reload the page.');
                    this.closeTimeout = setTimeout(() => {
                        this.close();
                        this.options.onCancel();
                    }, 2000);
                } else {
                    this.showError(`Incorrect password. ${this.maxAttempts - this.attempts} attempts remaining.`);
                    input.value = '';
                    input.focus();
                }
            }
        }
        
        showSetPasswordDialog() {
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
                    zIndex: 10000
                }
            });
            
            this.modal = $.div({
                style: {
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--text-accent)',
                    padding: '30px',
                    minWidth: '400px',
                    maxWidth: '500px'
                }
            }, [
                $.h2({ style: { marginBottom: '20px' } }, ['Set Wallet Password']),
                
                $.p({
                    style: {
                        color: 'var(--text-dim)',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }
                }, ['Set a password to protect sensitive operations like viewing seed phrases and sending transactions.']),
                
                $.div({ style: { marginBottom: '15px' } }, [
                    $.label({ style: { display: 'block', marginBottom: '5px' } }, ['New Password']),
                    $.input({
                        id: 'new-password',
                        type: 'password',
                        placeholder: 'Enter password (min 8 characters)',
                        style: {
                            width: '100%',
                            padding: '12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace'
                        }
                    })
                ]),
                
                $.div({ style: { marginBottom: '15px' } }, [
                    $.label({ style: { display: 'block', marginBottom: '5px' } }, ['Confirm Password']),
                    $.input({
                        id: 'confirm-password',
                        type: 'password',
                        placeholder: 'Confirm password',
                        style: {
                            width: '100%',
                            padding: '12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace'
                        }
                    })
                ]),
                
                $.div({
                    id: 'password-error',
                    style: {
                        color: '#ff4444',
                        fontSize: '12px',
                        marginBottom: '20px',
                        display: 'none'
                    }
                }),
                
                $.div({
                    style: {
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                    }
                }, [
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '2px solid var(--text-accent)',
                            color: 'var(--text-accent)',
                            padding: '10px 20px',
                            cursor: 'pointer'
                        },
                        onclick: () => this.setNewPassword()
                    }, ['Set Password']),
                    
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-dim)',
                            color: 'var(--text-dim)',
                            padding: '10px 20px',
                            cursor: 'pointer'
                        },
                        onclick: () => {
                            this.close();
                            this.options.onCancel();
                        }
                    }, ['Skip'])
                ])
            ]);
            
            this.backdrop.appendChild(this.modal);
            document.body.appendChild(this.backdrop);
        }
        
        setNewPassword() {
            const newPwd = document.getElementById('new-password')?.value;
            const confirmPwd = document.getElementById('confirm-password')?.value;
            
            if (!newPwd || !confirmPwd) {
                this.showError('Please fill in both password fields');
                return;
            }
            
            if (newPwd.length < 8) {
                this.showError('Password must be at least 8 characters');
                return;
            }
            
            if (newPwd !== confirmPwd) {
                this.showError('Passwords do not match');
                return;
            }
            
            try {
                this.app.state.setWalletPassword(newPwd);
                this.app.showNotification('Password set successfully', 'success');
                this.close();
                this.options.onSuccess();
            } catch (error) {
                this.showError(error.message);
            }
        }
        
        showError(message) {
            const errorDiv = document.getElementById('password-error');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        }
        
        cancel() {
            this.close();
            this.options.onCancel();
        }
        
        close() {
            if (this.backdrop) {
                // Clear all event handlers
                const inputs = this.backdrop.querySelectorAll('input');
                inputs.forEach(input => {
                    input.onkeydown = null;
                });
                
                const buttons = this.backdrop.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.onclick = null;
                });
                
                // Clear any timeouts
                if (this.closeTimeout) {
                    clearTimeout(this.closeTimeout);
                    this.closeTimeout = null;
                }
                
                this.backdrop.remove();
                this.backdrop = null;
                this.modal = null;
            }
        }
    }

    // Export to window
    window.PasswordModal = PasswordModal;

})(window);