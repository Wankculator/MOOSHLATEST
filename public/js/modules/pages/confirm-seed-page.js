// MOOSH WALLET - Confirm Seed Page Module
// Handles seed phrase verification with random word checks
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class ConfirmSeedPage extends Component {
        constructor(app) {
            super(app);
            this.verificationWords = [];
        }

        render() {
            const $ = window.ElementFactory || window.$;
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || '[]');
            this.verificationWords = this.selectRandomWords(generatedSeed);
            this.app.state.set('verificationWords', this.verificationWords);
            
            const card = $.div({ className: 'card' }, [
                this.createTitle(),
                this.createVerificationForm(),
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
                    $.span({ className: 'moosh-flash' }, ['CONFIRM']),
                    ' ',
                    $.span({ className: 'text-dim' }, ['SEED'])
                ]),
                $.p({
                    className: 'token-site-subtitle',
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, ['Verify your recovery phrase'])
            ]);
        }

        createVerificationForm() {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: {
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, [
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    ' Verify Your Words ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                ...this.verificationWords.map((item, i) => this.createWordInput(item, i)),
                $.div({
                    id: 'verificationError',
                    style: {
                        color: '#ff4444',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginTop: 'calc(12px * var(--scale-factor))',
                        display: 'none',
                        textAlign: 'center'
                    }
                })
            ]);
        }

        createWordInput(item, index) {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: { marginBottom: 'calc(16px * var(--scale-factor))' }
            }, [
                $.label({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        display: 'block'
                    }
                }, [`Word #${item.index}:`]),
                $.input({
                    type: 'text',
                    id: `word${index}`,
                    placeholder: `Enter word ${item.index}`,
                    className: 'input-field verification-input',
                    style: {
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor))',
                        borderRadius: '0',
                        transition: 'border-color 0.2s ease'
                    },
                    onmouseover: function() {
                        this.style.borderColor = 'var(--text-primary)';
                    },
                    onmouseout: function() {
                        if (this !== document.activeElement) {
                            this.style.borderColor = 'var(--border-color)';
                        }
                    },
                    onfocus: function() {
                        this.style.borderColor = 'var(--text-primary)';
                    },
                    onblur: function() {
                        this.style.borderColor = 'var(--border-color)';
                    }
                })
            ]);
        }

        createActionButtons() {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'calc(16px * var(--scale-factor))'
                }
            }, [
                new Button(this.app, {
                    text: 'Verify Seed',
                    onClick: () => this.verifySeedPhrase()
                }).render(),
                $.button({
                    style: {
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%'
                    },
                    onclick: () => {
                        // Get the wallet data before navigating
                        const sparkWallet = this.app.state.get('sparkWallet');
                        const generatedSeed = this.app.state.get('generatedSeed');
                        
                        if (sparkWallet && generatedSeed) {
                            // Store verification status
                            localStorage.setItem('walletVerified', 'false');
                            this.app.state.set('walletVerified', false);
                            
                            // Navigate to wallet details to show ALL generated wallets
                            this.app.router.navigate('wallet-details?type=all');
                        } else {
                            // If no wallet data exists, show error
                            this.app.showNotification('No wallet data found. Please generate a new wallet.', 'error');
                            this.app.router.navigate('home');
                        }
                    },
                    onmouseover: function() {
                        const pipes = this.querySelectorAll('.pipe-left, .pipe-right');
                        pipes.forEach(p => p.style.opacity = '1');
                    },
                    onmouseout: function() {
                        const pipes = this.querySelectorAll('.pipe-left, .pipe-right');
                        pipes.forEach(p => p.style.opacity = '0');
                    }
                }, [
                    $.span({
                        className: 'pipe-left',
                        style: { opacity: '0', transition: 'opacity 0.2s' }
                    }, ['|']),
                    ' <Skip Verification/> ',
                    $.span({
                        className: 'pipe-right',
                        style: { opacity: '0', transition: 'opacity 0.2s' }
                    }, ['|'])
                ]),
                new Button(this.app, {
                    text: 'Back to Seed',
                    variant: 'back',
                    onClick: () => this.app.router.navigate('generate-seed')
                }).render()
            ]);
        }

        selectRandomWords(seed) {
            const randomWords = [];
            const wordIndices = [];
            
            // Select 4 random words for verification using crypto-secure random
            const randomBytes = new Uint8Array(4);
            window.crypto.getRandomValues(randomBytes);
            
            while (randomWords.length < 4) {
                const randomIndex = randomBytes[randomWords.length] % seed.length;
                if (!wordIndices.includes(randomIndex)) {
                    wordIndices.push(randomIndex);
                    randomWords.push({ 
                        index: randomIndex + 1, 
                        word: seed[randomIndex] 
                    });
                }
            }
            
            return randomWords.sort((a, b) => a.index - b.index);
        }

        verifySeedPhrase() {
            const errorDiv = document.getElementById('verificationError');
            let allCorrect = true;
            let incorrectWords = [];
            
            errorDiv.style.display = 'none';
            
            for (let i = 0; i < this.verificationWords.length; i++) {
                const input = document.getElementById(`word${i}`);
                const expectedWord = this.verificationWords[i].word;
                
                if (!input || !input.value.trim()) {
                    incorrectWords.push(`Word #${this.verificationWords[i].index} is empty`);
                    allCorrect = false;
                } else if (input.value.trim().toLowerCase() !== expectedWord.toLowerCase()) {
                    incorrectWords.push(`Word #${this.verificationWords[i].index} is incorrect`);
                    allCorrect = false;
                }
            }
            
            if (allCorrect) {
                this.app.showNotification('Seed verified successfully!', 'success');
                setTimeout(() => {
                    this.app.router.navigate('wallet-created');
                }, 1000);
            } else {
                errorDiv.textContent = incorrectWords.join(', ') + '. Please check and try again.';
                errorDiv.style.display = 'block';
                this.app.showNotification('Verification failed', 'error');
            }
        }
    }

    // Make available globally and maintain compatibility
    window.ConfirmSeedPage = ConfirmSeedPage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ConfirmSeedPage = ConfirmSeedPage;
    }

})(window);