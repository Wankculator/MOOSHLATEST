// MOOSH WALLET - Header Component Module
// Main application header with branding and navigation
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class Header extends Component {
        render() {
            const $ = window.ElementFactory || window.$;
            const brandBox = this.createBrandBox();
            const navLinks = this.createNavLinks();
            
            console.log('[Header] Rendering - Brand box:', brandBox);
            console.log('[Header] Rendering - Nav links:', navLinks);
            console.log('[Header] Brand box className:', brandBox.className);
            console.log('[Header] Nav links className:', navLinks.className);
            
            const header = $.div({
                className: 'cursor-header',
                role: 'banner'
            }, [
                brandBox,
                navLinks
            ]);

            return header;
        }

        createBrandBox() {
            const $ = window.ElementFactory || window.$;
            return $.div({ className: 'brand-box' }, [
                $.img({
                    src: '/images/Moosh-logo.png',
                    alt: 'MOOSH Logo',
                    className: 'brand-logo',
                    onerror: function() { 
                        console.log('[Header] Logo failed to load from:', this.src);
                        // Try PNG fallback
                        if (this.src.includes('.svg')) {
                            this.src = '/images/moosh-logo.png';
                        } else {
                            // Final fallback - create text logo
                            this.style.display = 'none';
                            const textLogo = document.createElement('div');
                            textLogo.style.cssText = 'width: 32px; height: 32px; background: #f57315; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000;';
                            textLogo.textContent = 'M';
                            this.parentNode.replaceChild(textLogo, this);
                        }
                        this.style.borderRadius = '50%';
                    }
                }),
                $.div({ className: 'brand-text' }, [
                    $.span({ className: 'text-dim' }, ['~/']),
                    $.span({ className: 'text-primary' }, ['moosh']),
                    $.span({ className: 'text-dim' }, ['/']),
                    $.span({ className: 'text-primary' }, ['wallet']),
                    $.span({ className: 'text-dim' }, ['.ts']),
                    $.span({
                        className: 'beta-badge',
                        style: {
                            fontSize: 'calc(7px * var(--scale-factor))',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            marginLeft: 'calc(4px * var(--scale-factor))',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }
                    }, ['BETA'])
                ])
            ]);
        }

        createNavLinks() {
            const $ = window.ElementFactory || window.$;
            const currentPage = this.app.state.get('currentPage');
            const isDashboard = currentPage === 'dashboard';
            const hasPassword = localStorage.getItem('walletPassword');
            
            const elements = [
                this.createThemeToggle()
            ];
            
            // Add lock button when has password
            if (hasPassword) {
                elements.push(this.createLockButton());
            }
            
            // Add Moosh.money link
            elements.push(
                $.a({
                    href: '#',
                    className: 'nav-link',
                    style: {
                        fontSize: 'calc(12px * var(--scale-factor))',
                        fontWeight: '600'
                    },
                    onclick: (e) => {
                        e.preventDefault();
                        this.openTokenSite();
                    },
                    onmouseover: function() {
                        const pipes = this.querySelectorAll('.nav-pipe');
                        pipes.forEach(pipe => pipe.style.opacity = '1');
                    },
                    onmouseout: function() {
                        const pipes = this.querySelectorAll('.nav-pipe');
                        pipes.forEach(pipe => pipe.style.opacity = '0');
                    }
                }, [
                    $.span({ 
                        className: 'nav-pipe',
                        style: { 
                            opacity: '0', 
                            transition: 'opacity 0.2s ease',
                            color: 'var(--text-primary)',
                            marginRight: '4px'
                        }
                    }, ['|']),
                    ' ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    'Moosh.money',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, [' />']),
                    ' ',
                    $.span({ 
                        className: 'nav-pipe',
                        style: { 
                            opacity: '0', 
                            transition: 'opacity 0.2s ease',
                            color: 'var(--text-primary)',
                            marginLeft: '4px'
                        }
                    }, ['|'])
                ])
            );
            
            return $.div({ 
                className: 'nav-links',
                role: 'navigation'
            }, elements);
        }

        createLockButton() {
            const $ = window.ElementFactory || window.$;
            const isLocked = sessionStorage.getItem('walletUnlocked') !== 'true';
            
            const lockToggle = $.div({
                className: 'theme-toggle',
                onclick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleLock();
                },
                title: 'Toggle Lock'
            }, [
                $.span({
                    className: 'theme-toggle-icon'
                }, ['.lock']),
                $.div({
                    className: 'theme-toggle-button'
                }, [
                    $.div({ className: 'theme-toggle-inner' })
                ])
            ]);

            return lockToggle;
        }

        createThemeToggle() {
            const $ = window.ElementFactory || window.$;
            const toggle = $.div({
                className: 'theme-toggle',
                onclick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleTheme();
                },
                title: 'Toggle Theme'
            }, [
                $.span({
                    id: 'themeIcon',
                    className: 'theme-toggle-icon'
                }, ['.theme']),
                $.div({
                    id: 'themeToggle',
                    className: 'theme-toggle-button'
                }, [
                    $.div({ className: 'theme-toggle-inner' })
                ])
            ]);

            return toggle;
        }

        toggleTheme() {
            const isMooshMode = !this.app.state.get('isMooshMode');
            this.app.state.set('isMooshMode', isMooshMode);
            this.app.state.set('theme', isMooshMode ? 'moosh' : 'original');
            
            if (isMooshMode) {
                document.body.classList.add('moosh-mode');
                document.body.classList.remove('original-mode');
                this.app.showNotification('MOOSH Mode ON', 'moosh');
            } else {
                document.body.classList.add('original-mode');
                document.body.classList.remove('moosh-mode');
                this.app.showNotification('Original Mode ON', 'original');
            }
            
            localStorage.setItem('mooshTheme', isMooshMode ? 'moosh' : 'original');
            
            // Refresh the dashboard chart to update colors
            const currentPageName = this.app.state.get('currentPage');
            console.log('[Theme] Current page:', currentPageName);
            
            if (currentPageName === 'dashboard') {
                // Try to use the stored dashboard instance first
                if (this.app.dashboard && this.app.dashboard.refreshDashboard) {
                    console.log('[Theme] Refreshing dashboard via stored instance');
                    this.app.dashboard.refreshDashboard();
                } else {
                    // Fallback: Force re-render by navigating to dashboard again
                    console.log('[Theme] Re-rendering dashboard page');
                    this.app.router.navigate('dashboard');
                }
            }
        }

        openTokenSite() {
            this.app.showNotification('Opening MOOSH.money...', 'success');
            setTimeout(() => {
                window.open('https://www.moosh.money/', '_blank');
            }, 500);
        }
        
        toggleLock() {
            const isUnlocked = sessionStorage.getItem('walletUnlocked') === 'true';
            
            if (isUnlocked) {
                // Lock the wallet
                sessionStorage.removeItem('walletUnlocked');
                this.app.showNotification('Wallet locked', 'success');
                
                // Re-render to show lock screen
                this.app.router.render();
            } else {
                // Already locked, just show notification
                this.app.showNotification('Wallet is already locked', 'info');
            }
        }
    }

    // Make available globally and maintain compatibility
    window.Header = Header;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.Header = Header;
    }

})(window);