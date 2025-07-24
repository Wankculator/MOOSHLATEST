// MOOSH WALLET - Generate Seed Page Module
// Handles seed phrase generation with visual feedback
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class GenerateSeedPage extends Component {
        constructor(app) {
            super(app);
            this.progressInterval = null;
            this.isGenerating = false;
            this.generatingUI = null;
        }

        render() {
            const $ = window.ElementFactory || window.$;
            const card = $.div({ className: 'card' }, [
                this.createTitle(),
                this.createSeedDisplay(),
                this.createActionButtons()
            ]);

            return card;
        }

        createTitle() {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: {
                    textAlign: 'center',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [
                $.h1({
                    style: {
                        fontSize: 'calc(28px * var(--scale-factor))',
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
                            width: 'calc(40px * var(--scale-factor))',
                            height: 'calc(40px * var(--scale-factor))',
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
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, ['Your secure recovery phrase'])
            ]);
        }

        createSeedDisplay() {
            const $ = window.ElementFactory || window.$;
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || '[]');
            
            return $.div({
                id: 'seedDisplay',
                className: 'terminal-container',
                style: {
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace",
                    position: 'relative',
                    minHeight: 'calc(300px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--accent-primary)',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em'
                    }
                }, ['SEED PHRASE']),
                
                $.div({
                    id: 'seedWordsContainer',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth <= 480 ? 
                            'repeat(2, 1fr)' : 
                            'repeat(3, 1fr)',
                        gap: 'calc(16px * var(--scale-factor))',
                        marginTop: 'calc(24px * var(--scale-factor))'
                    }
                }, generatedSeed.length > 0 ? this.createSeedWords(generatedSeed) : [
                    $.div({
                        id: 'generatingMessage',
                        style: {
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            color: 'var(--text-dim)',
                            fontSize: 'calc(14px * var(--scale-factor))',
                            padding: 'calc(40px * var(--scale-factor)) 0'
                        }
                    }, ['Click GENERATE to create your seed phrase'])
                ])
            ]);
        }

        createSeedWords(seedWords) {
            const $ = window.ElementFactory || window.$;
            return seedWords.map((word, index) => {
                return $.div({
                    className: 'seed-word',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'calc(8px * var(--scale-factor))',
                        padding: 'calc(8px * var(--scale-factor))',
                        background: 'rgba(245, 115, 21, 0.1)',
                        border: '1px solid var(--accent-primary)',
                        borderRadius: '0',
                        opacity: '0',
                        animation: 'fadeIn 0.3s ease forwards',
                        animationDelay: `${index * 0.05}s`
                    }
                }, [
                    $.span({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(10px * var(--scale-factor))',
                            minWidth: 'calc(20px * var(--scale-factor))',
                            textAlign: 'right'
                        }
                    }, [`${index + 1}.`]),
                    $.span({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(14px * var(--scale-factor))',
                            fontWeight: '600',
                            letterSpacing: '0.05em'
                        }
                    }, [word])
                ]);
            });
        }

        createActionButtons() {
            const $ = window.ElementFactory || window.$;
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || '[]');
            
            return $.div({
                style: {
                    display: 'flex',
                    gap: 'calc(16px * var(--scale-factor))',
                    marginTop: 'calc(24px * var(--scale-factor))'
                }
            }, [
                generatedSeed.length === 0 ? 
                    new Button(this.app, {
                        text: 'GENERATE',
                        onClick: () => this.generateNewSeed(),
                        variant: 'primary'
                    }).render() :
                    $.div({
                        style: {
                            display: 'flex',
                            gap: 'calc(16px * var(--scale-factor))',
                            width: '100%'
                        }
                    }, [
                        new Button(this.app, {
                            text: 'COPY',
                            onClick: () => this.copySeed(),
                            variant: 'secondary',
                            fullWidth: true
                        }).render(),
                        new Button(this.app, {
                            text: 'CONTINUE',
                            onClick: () => this.app.router.navigate('/confirm-seed'),
                            variant: 'primary',
                            fullWidth: true
                        }).render()
                    ])
            ]);
        }

        async generateNewSeed() {
            if (this.isGenerating) return;
            
            this.isGenerating = true;
            const seedDisplay = document.getElementById('seedDisplay');
            const seedWordsContainer = document.getElementById('seedWordsContainer');
            
            // Clear any existing content and show generating UI
            seedWordsContainer.innerHTML = '';
            this.generatingUI = this.createGeneratingUI();
            seedWordsContainer.appendChild(this.generatingUI);
            
            // Start progress animation
            this.startProgressAnimation();
            
            try {
                const response = await this.app.apiService.request('/api/spark/generate-wallet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ strength: 128 })
                });

                if (response.success && response.data && response.data.mnemonic) {
                    const seedWords = response.data.mnemonic.split(' ');
                    
                    // Store the generated data
                    localStorage.setItem('generatedSeed', JSON.stringify(seedWords));
                    localStorage.setItem('generatedAddresses', JSON.stringify(response.data.addresses));
                    localStorage.setItem('generatedPrivateKeys', JSON.stringify(response.data.privateKeys));
                    
                    // Stop progress animation
                    this.stopProgressAnimation();
                    
                    // Show success animation
                    await this.showSuccessAnimation();
                    
                    // Re-render the component to show the seed
                    this.app.router.navigate('/generate-seed');
                } else {
                    this.stopProgressAnimation();
                    this.showError('Failed to generate seed phrase. Please try again.');
                }
            } catch (error) {
                console.error('Seed generation error:', error);
                this.stopProgressAnimation();
                this.showError('Error generating seed phrase. Please check your connection.');
            } finally {
                this.isGenerating = false;
            }
        }

        createGeneratingUI() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: 'calc(40px * var(--scale-factor)) 0'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--accent-primary)',
                        fontSize: 'calc(16px * var(--scale-factor))',
                        fontWeight: '600',
                        marginBottom: 'calc(24px * var(--scale-factor))',
                        letterSpacing: '0.1em'
                    }
                }, ['GENERATING SECURE SEED']),
                
                $.div({
                    id: 'progressContainer',
                    style: {
                        width: '100%',
                        maxWidth: 'calc(400px * var(--scale-factor))',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(20, 1fr)',
                        gap: 'calc(2px * var(--scale-factor))',
                        marginBottom: 'calc(24px * var(--scale-factor))'
                    }
                }, Array(100).fill(0).map((_, i) => 
                    $.div({
                        className: 'progress-block',
                        style: {
                            width: '100%',
                            paddingBottom: '100%',
                            background: 'rgba(245, 115, 21, 0.1)',
                            border: '1px solid rgba(245, 115, 21, 0.2)',
                            transition: 'all 0.3s ease',
                            position: 'relative'
                        }
                    })
                )),
                
                $.div({
                    id: 'progressText',
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.05em'
                    }
                }, ['Gathering entropy...'])
            ]);
        }

        startProgressAnimation() {
            let progress = 0;
            const blocks = document.querySelectorAll('.progress-block');
            const progressText = document.getElementById('progressText');
            const messages = [
                'Gathering entropy...',
                'Mixing random data...',
                'Generating seed words...',
                'Verifying checksum...',
                'Creating wallet keys...',
                'Finalizing...'
            ];
            
            this.progressInterval = setInterval(() => {
                if (progress < blocks.length) {
                    const block = blocks[progress];
                    block.style.background = 'var(--accent-primary)';
                    block.style.borderColor = 'var(--accent-primary)';
                    block.style.boxShadow = '0 0 10px rgba(245, 115, 21, 0.5)';
                    
                    // Update progress text
                    const messageIndex = Math.floor((progress / blocks.length) * messages.length);
                    if (progressText) {
                        progressText.textContent = messages[Math.min(messageIndex, messages.length - 1)];
                    }
                    
                    progress++;
                } else {
                    // Reset and continue
                    blocks.forEach(block => {
                        block.style.background = 'rgba(245, 115, 21, 0.1)';
                        block.style.borderColor = 'rgba(245, 115, 21, 0.2)';
                        block.style.boxShadow = 'none';
                    });
                    progress = 0;
                }
            }, 50);
        }

        async showSuccessAnimation() {
            const blocks = document.querySelectorAll('.progress-block');
            const progressText = document.getElementById('progressText');
            
            if (progressText) {
                progressText.textContent = 'Success!';
                progressText.style.color = 'var(--accent-primary)';
            }
            
            // Flash all blocks
            blocks.forEach(block => {
                block.style.background = 'var(--accent-primary)';
                block.style.borderColor = 'var(--accent-primary)';
                block.style.boxShadow = '0 0 20px rgba(245, 115, 21, 0.8)';
            });
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Fade out blocks
            blocks.forEach((block, index) => {
                setTimeout(() => {
                    block.style.opacity = '0';
                    block.style.transform = 'scale(0.8)';
                }, index * 10);
            });
            
            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        stopProgressAnimation() {
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
        }

        copySeed() {
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || '[]');
            const seedPhrase = generatedSeed.join(' ');
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(seedPhrase).then(() => {
                    this.showToast('Seed phrase copied to clipboard');
                }).catch(() => {
                    this.fallbackCopy(seedPhrase);
                });
            } else {
                this.fallbackCopy(seedPhrase);
            }
        }

        fallbackCopy(text) {
            const $ = window.ElementFactory || window.$;
            const textArea = $.textarea({
                value: text,
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '2em',
                    height: '2em',
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent'
                }
            });
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('Seed phrase copied to clipboard');
            } catch (err) {
                this.showToast('Failed to copy. Please select and copy manually.');
            }
            
            document.body.removeChild(textArea);
        }

        showToast(message) {
            const $ = window.ElementFactory || window.$;
            const toast = $.div({
                style: {
                    position: 'fixed',
                    bottom: 'calc(20px * var(--scale-factor))',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent-primary)',
                    color: '#000000',
                    padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                    borderRadius: '0',
                    fontWeight: '600',
                    fontSize: 'calc(14px * var(--scale-factor))',
                    zIndex: '10000',
                    animation: 'slideUp 0.3s ease'
                }
            }, [message]);
            
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 2000);
        }

        showError(message) {
            const seedWordsContainer = document.getElementById('seedWordsContainer');
            const $ = window.ElementFactory || window.$;
            
            seedWordsContainer.innerHTML = '';
            seedWordsContainer.appendChild($.div({
                style: {
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    color: '#ff4444',
                    fontSize: 'calc(14px * var(--scale-factor))',
                    padding: 'calc(40px * var(--scale-factor)) 0'
                }
            }, [message]));
        }

        unmount() {
            // Clean up any running animations
            this.stopProgressAnimation();
            super.unmount();
        }
    }

    // Make available globally and maintain compatibility
    window.GenerateSeedPage = GenerateSeedPage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.GenerateSeedPage = GenerateSeedPage;
    }

})(window);