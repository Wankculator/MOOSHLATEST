// MOOSH WALLET - Home Page Module
// Main landing page with wallet creation/import options
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class HomePage extends Component {
        render() {
            const $ = window.ElementFactory || window.$;
            
            const card = $.div({ className: 'card' }, [
                this.createTitle(),
                this.createAddressTypes(),
                new Terminal(this.app, { radioSection: true, showNetworkToggle: true }).render(),
                this.createPasswordSection(),
                this.createWalletActions()
            ]);

            return card;
        }

        createTitle() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: { textAlign: 'center' }
            }, [
                $.h1({
                    style: {
                        textAlign: 'center',
                        fontSize: 'calc(32px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    $.img({
                        src: 'images/Moosh-logo.png',
                        alt: 'MOOSH',
                        style: {
                            width: 'calc(48px * var(--scale-factor))',
                            height: 'calc(48px * var(--scale-factor))',
                            objectFit: 'contain'
                        },
                        onerror: function() { this.style.display = 'none'; }
                    }),
                    $.span({ className: 'moosh-flash' }, ['MOOSH']),
                    ' ',
                    $.span({ className: 'text-dim' }, ['WALLET'])
                ]),
                $.p({
                    className: 'token-site-subtitle',
                    style: {
                        textAlign: 'center',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        cursor: 'pointer',
                        color: 'var(--text-dim)',
                        fontWeight: '400',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(var(--font-base) * var(--scale-factor))',
                        letterSpacing: '0.05em',
                        transition: 'color 0.3s ease'
                    },
                    onmouseover: function() { this.style.color = 'var(--text-primary)'; },
                    onmouseout: function() { this.style.color = 'var(--text-dim)'; }
                }, ['Moosh.money Native Bitcoin wallet'])
            ]);
        }

        createAddressTypes() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                className: 'address-types-list',
                style: {
                    textAlign: 'center',
                    marginBottom: 'calc(var(--spacing-unit) * 3 * var(--scale-factor))',
                    fontSize: 'calc(10px * var(--scale-factor))',
                    lineHeight: 'var(--mobile-line-height)',
                    color: 'var(--text-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    padding: '0 calc(var(--spacing-unit) * var(--scale-factor))'
                },
                onmouseover: function() {
                    this.style.color = 'var(--text-dim)';
                    Array.from(this.querySelectorAll('.address-type')).forEach(el => {
                        el.style.color = 'var(--text-dim)';
                    });
                },
                onmouseout: function() {
                    this.style.color = 'var(--text-primary)';
                    Array.from(this.querySelectorAll('.address-type')).forEach(el => {
                        el.style.color = 'var(--text-primary)';
                    });
                }
            }, [
                $.span({ 
                    className: 'text-dim address-bracket',
                    style: {
                        fontSize: 'calc(9px * var(--scale-factor))'
                    }
                }, ['<']),
                ' ',
                $.span({ className: 'address-type' }, ['Spark Protocol']),
                ' • ',
                $.span({ className: 'address-type' }, ['Taproot']),
                ' • ',
                $.span({ className: 'address-type' }, ['Native SegWit']),
                ' • ',
                $.span({ className: 'address-type' }, ['Nested SegWit']),
                ' • ',
                $.span({ className: 'address-type' }, ['Legacy']),
                ' ',
                $.span({ 
                    className: 'text-dim address-bracket',
                    style: {
                        fontSize: 'calc(9px * var(--scale-factor))'
                    }
                }, ['/>'])
            ]);
        }


        createPasswordSection() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                className: 'password-security-section',
                style: {
                    background: 'rgba(245, 115, 21, 0.1)',
                    border: '1px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(20px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [
                $.div({
                    className: 'password-security-title',
                    style: {
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: 'calc(12px * var(--scale-factor))',
                        fontSize: 'calc(16px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, ['Moosh Wallet Security']),
                $.div({
                    className: 'typing-text',
                    style: {
                        marginBottom: 'calc(20px * var(--scale-factor))',
                        textAlign: 'center',
                        lineHeight: '1.4'
                    }
                }, [
                    $.span({ 
                        className: 'text-dim password-bracket',
                        style: {
                            color: '#666666',
                            fontSize: 'calc(10px * var(--scale-factor))'
                        }
                    }, ['<']),
                    $.span({
                        className: 'password-text-hover',
                        style: {
                            cursor: 'pointer',
                            transition: 'color 0.3s ease',
                            color: '#666666',
                            fontSize: 'calc(10px * var(--scale-factor))'
                        },
                        onmouseover: function() { this.style.color = 'var(--text-primary)'; },
                        onmouseout: function() { this.style.color = '#666666'; }
                    }, ['Create a secure password to protect your wallet access']),
                    $.span({ 
                        className: 'text-dim password-bracket',
                        style: {
                            color: '#666666',
                            fontSize: 'calc(10px * var(--scale-factor))'
                        }
                    }, [' />']),
                    $.span({ 
                        className: 'typing-cursor',
                        style: {
                            height: 'calc(10px * var(--scale-factor))',
                            fontSize: 'calc(10px * var(--scale-factor))'
                        }
                    })
                ]),
                this.createPasswordInput('createPasswordInput', 'Create Password', 'Enter secure password...'),
                this.createPasswordInput('confirmPasswordInput', 'Re-enter Password', 'Confirm password...'),
                $.div({
                    id: 'passwordError',
                    style: {
                        color: '#ff4444',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginTop: 'calc(6px * var(--scale-factor))',
                        display: 'none'
                    }
                }),
                $.div({
                    id: 'passwordSuccess',
                    style: {
                        color: 'var(--text-keyword)',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginTop: 'calc(6px * var(--scale-factor))',
                        display: 'none'
                    }
                }, ['Passwords match!'])
            ]);
        }

        createPasswordInput(id, label, placeholder) {
            const $ = window.ElementFactory || window.$;
            
            return $.div({ style: { marginBottom: 'calc(16px * var(--scale-factor))' } }, [
                $.label({
                    className: 'text-dim',
                    style: {
                        display: 'block',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        fontSize: 'calc(11px * var(--scale-factor))',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'color 0.3s ease'
                    },
                    onmouseover: function() { this.style.color = 'var(--text-primary)'; },
                    onmouseout: function() { this.style.color = 'var(--text-dim)'; }
                }, [label]),
                $.div({
                    style: {
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }
                }, [
                    $.input({
                        id: id,
                        className: 'input-field',
                        type: 'password',
                        placeholder: placeholder,
                        style: {
                            width: '100%',
                            paddingRight: 'calc(40px * var(--scale-factor))'
                        },
                        oninput: () => this.validatePasswords()
                    }),
                    this.createPasswordToggle(id)
                ])
            ]);
        }

        createPasswordToggle(inputId) {
            const $ = window.ElementFactory || window.$;
            const toggleId = `toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`;
            
            return $.button({
                id: toggleId,
                type: 'button',
                style: {
                    position: 'absolute',
                    right: 'calc(12px * var(--scale-factor))',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 'calc(4px * var(--scale-factor))',
                    transition: 'color 0.2s ease',
                    width: 'calc(20px * var(--scale-factor))',
                    height: 'calc(20px * var(--scale-factor))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                onclick: () => this.togglePasswordVisibility(inputId, toggleId),
                onmouseover: function() { this.style.color = 'var(--text-primary)'; },
                onmouseout: function() { this.style.color = 'var(--text-dim)'; },
                title: 'Show password'
            }, [
                this.createEyeIcon()
            ]);
        }

        createEyeIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '12');
            circle.setAttribute('cy', '12');
            circle.setAttribute('r', '3');
            
            svg.appendChild(path1);
            svg.appendChild(circle);
            
            return svg;
        }

        togglePasswordVisibility(inputId, buttonId) {
            const passwordInput = document.getElementById(inputId);
            const toggleButton = document.getElementById(buttonId);
            
            if (passwordInput && toggleButton) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    toggleButton.title = 'Hide password';
                    // Create eye-off icon
                    toggleButton.innerHTML = '';
                    toggleButton.appendChild(this.createEyeOffIcon());
                } else {
                    passwordInput.type = 'password';
                    toggleButton.title = 'Show password';
                    toggleButton.innerHTML = '';
                    toggleButton.appendChild(this.createEyeIcon());
                }
            }
        }

        createEyeOffIcon() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24');
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '1');
            line.setAttribute('y1', '1');
            line.setAttribute('x2', '23');
            line.setAttribute('y2', '23');
            
            svg.appendChild(path1);
            svg.appendChild(line);
            
            return svg;
        }

        validatePasswords() {
            const password = document.getElementById('createPasswordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;
            const errorDiv = document.getElementById('passwordError');
            const successDiv = document.getElementById('passwordSuccess');
            
            if (confirmPassword && password === confirmPassword) {
                errorDiv.style.display = 'none';
                successDiv.style.display = 'block';
            } else if (confirmPassword) {
                errorDiv.textContent = 'Passwords do not match.';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
            }
        }

        createWalletActions() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                className: 'wallet-actions',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(20px * var(--scale-factor))',
                    alignItems: 'center',
                    margin: 'calc(24px * var(--scale-factor)) 0 0 0'
                }
            }, [
                new Button(this.app, {
                    text: 'Create Wallet',
                    onClick: () => this.createWallet()
                }).render(),
                new Button(this.app, {
                    text: 'Import Wallet',
                    onClick: () => this.importWallet()
                }).render()
            ]);
        }

        createWallet() {
            const password = document.getElementById('createPasswordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;
            
            if (!password || !confirmPassword) {
                this.showPasswordError('Please enter and confirm your password.');
                this.app.showNotification('Password required', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showPasswordError('Passwords do not match.');
                this.app.showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 8) {
                this.showPasswordError('Password must be at least 8 characters long.');
                this.app.showNotification('Password too short', 'error');
                return;
            }
            
            // Store password and navigate to seed generation
            localStorage.setItem('walletPassword', password);
            localStorage.setItem('walletType', 'create');
            this.app.state.set('walletPassword', password);
            this.app.state.set('walletType', 'create');
            
            this.app.showNotification('Creating MOOSH Wallet...', 'success');
            
            setTimeout(() => {
                this.app.router.navigate('generate-seed');
            }, 1000);
        }

        importWallet() {
            const password = document.getElementById('createPasswordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;
            
            if (!password || !confirmPassword) {
                this.showPasswordError('Please enter and confirm your password.');
                this.app.showNotification('Password required', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showPasswordError('Passwords do not match.');
                this.app.showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Store password and navigate to seed import
            localStorage.setItem('walletPassword', password);
            localStorage.setItem('walletType', 'import');
            this.app.state.set('walletPassword', password);
            this.app.state.set('walletType', 'import');
            
            this.app.showNotification('[SYSTEM] Initializing wallet import protocol...', 'success');
            
            setTimeout(() => {
                this.app.router.navigate('import-seed');
            }, 1000);
        }

        showPasswordError(message) {
            const errorDiv = document.getElementById('passwordError');
            const successDiv = document.getElementById('passwordSuccess');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }
    }

    // Make available globally and maintain compatibility
    window.HomePage = HomePage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.HomePage = HomePage;
    }

})(window);