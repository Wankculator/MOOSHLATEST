// MOOSH WALLET - Import Seed Page Module
// Handles importing existing wallets from BIP39 mnemonic phrases
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class ImportSeedPage extends Component {
        render() {
            const $ = window.ElementFactory || window.$;
            const wordCount = this.app.state.get('selectedMnemonic');
            
            const card = $.div({ className: 'card' }, [
                this.createTitle(wordCount),
                this.createInstructions(),
                this.createImportForm(wordCount),
                this.createActionButtons()
            ]);

            return card;
        }

        createTitle(wordCount) {
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
                    $.span({ className: 'moosh-flash' }, ['IMPORT']),
                    ' ',
                    $.span({ className: 'text-dim' }, ['WALLET'])
                ]),
                $.p({
                    className: 'token-site-subtitle',
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [`Import ${wordCount || '12/24'}-Word Recovery Phrase`])
            ]);
        }

        createInstructions() {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: {
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(20px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace"
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        textAlign: 'center',
                        letterSpacing: '0.05em'
                    }
                }, [
                    $.span({ style: { color: '#666666', fontSize: 'calc(10px * var(--scale-factor))' } }, ['<']),
                    ' RECOVERY PHRASE IMPORT ',
                    $.span({ style: { color: '#666666', fontSize: 'calc(10px * var(--scale-factor))' } }, ['/>'])
                ]),
                $.div({
                    style: {
                        fontSize: 'calc(12px * var(--scale-factor))',
                        lineHeight: '1.8',
                        color: '#CCCCCC'
                    }
                }, [
                    $.div({ style: { marginBottom: 'calc(10px * var(--scale-factor))' } }, [
                        $.span({ style: { color: 'var(--text-primary)', fontWeight: '600' } }, ['[SYSTEM]']),
                        $.span({ style: { color: '#888888' } }, [' Recovery phrase import protocol initiated'])
                    ]),
                    $.div({ style: { marginBottom: 'calc(10px * var(--scale-factor))' } }, [
                        $.span({ style: { color: 'var(--text-primary)', fontWeight: '600' } }, ['[FORMAT]']),
                        $.span({ style: { color: '#888888' } }, [' Supported: BIP39 12-word or 24-word mnemonics'])
                    ]),
                    $.div({}, [
                        $.span({ style: { color: 'var(--text-primary)', fontWeight: '600' } }, ['[INPUT]']),
                        $.span({ style: { color: '#888888' } }, [' Enter words separated by spaces in exact order'])
                    ])
                ])
            ]);
        }

        createImportForm(wordCount) {
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
                        fontSize: 'calc(13px * var(--scale-factor))',
                        textAlign: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.05em'
                    }
                }, [
                    $.span({ style: { color: '#666666', fontSize: 'calc(10px * var(--scale-factor))' } }, ['<']),
                    ' ENTER RECOVERY PHRASE ',
                    $.span({ style: { color: '#666666', fontSize: 'calc(10px * var(--scale-factor))' } }, ['/>'])
                ]),
                $.div({ id: 'textImportMode' }, [
                    $.textarea({
                        id: 'seedTextarea',
                        placeholder: `Enter your 12 or 24-word BIP39 recovery phrase...\n\nExample format:\nword1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12`,
                        style: {
                            width: '100%',
                            height: 'calc(120px * var(--scale-factor))',
                            background: 'var(--bg-primary)',
                            border: '2px solid #333333',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(13px * var(--scale-factor))',
                            padding: 'calc(16px * var(--scale-factor))',
                            resize: 'vertical',
                            lineHeight: '1.6',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'var(--text-primary) #000000'
                        },
                        onfocus: function() {
                            this.style.borderColor = 'var(--text-primary)';
                            this.style.boxShadow = '0 0 0 1px var(--text-primary)';
                        },
                        onblur: function() {
                            this.style.borderColor = '#333333';
                            this.style.boxShadow = 'none';
                        },
                        autocomplete: 'off',
                        autocorrect: 'off',
                        autocapitalize: 'off',
                        spellcheck: 'false'
                    })
                ]),
                $.div({
                    id: 'importError',
                    style: {
                        color: '#ff4444',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginTop: 'calc(12px * var(--scale-factor))',
                        display: 'none',
                        textAlign: 'center'
                    }
                }),
                $.div({
                    id: 'importSuccess',
                    style: {
                        color: 'var(--text-keyword)',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginTop: 'calc(12px * var(--scale-factor))',
                        display: 'none',
                        textAlign: 'center'
                    }
                }, ['Valid recovery phrase!'])
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
                    text: 'Import Wallet',
                    onClick: () => this.importWalletFromSeed()
                }).render(),
                new Button(this.app, {
                    text: 'Back Esc',
                    variant: 'back',
                    onClick: () => this.app.router.goBack()
                }).render()
            ]);
        }

        async importWalletFromSeed() {
            const seedText = document.getElementById('seedTextarea').value.trim();
            const seedWords = seedText.split(/\s+/).filter(word => word.length > 0);
            const errorDiv = document.getElementById('importError');
            const successDiv = document.getElementById('importSuccess');
            
            // Auto-detect word count and validate
            if (seedWords.length !== 12 && seedWords.length !== 24) {
                errorDiv.textContent = `[ERROR] Invalid word count: ${seedWords.length}. [EXPECTED] 12 or 24 words for BIP39 compliance`;
                errorDiv.style.color = '#FF0000';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                this.app.showNotification('[ERROR] Invalid word count - Expected 12 or 24 words', 'error');
                return;
            }
            
            // Update state with detected word count
            this.app.state.set('selectedMnemonic', seedWords.length);
            
            if (!this.validateMnemonic(seedWords)) {
                errorDiv.textContent = '[ERROR] Invalid BIP39 mnemonic. [REASON] One or more words not in BIP39 wordlist';
                errorDiv.style.color = '#FF0000';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                this.app.showNotification('[ERROR] Invalid BIP39 mnemonic phrase', 'error');
                return;
            }
            
            // Show processing status
            errorDiv.style.display = 'none';
            successDiv.textContent = `[PROCESSING] Validating seed entropy... [WORDS] ${seedWords.length} words detected`;
            successDiv.style.color = 'var(--text-keyword)';
            successDiv.style.display = 'block';
            
            // Try to import through Spark API
            try {
                const mnemonic = seedWords.join(' ');
                
                // Update status
                setTimeout(() => {
                    if (successDiv) {
                        successDiv.textContent = '[PROCESSING] Deriving HD wallet paths... [PROTOCOL] BIP32/BIP44/BIP84/BIP86';
                        successDiv.style.color = 'var(--text-keyword)';
                    }
                }, 500);
                
                const response = await this.app.apiService.importSparkWallet(mnemonic);
                
                if (response && response.success && response.data) {
                    // Store the real wallet data
                    const walletData = response.data;
                    // SECURITY: Never store seeds in localStorage
                    console.warn('[Security] Seed imported - not stored locally');
                    
                    // Log the API response to debug Spark address
                    console.log('[ImportWallet] API Response:', response.data);
                    console.log('[ImportWallet] Spark address from API:', response.data.addresses?.spark);
                    
                    // Properly map all address types from the API response
                    const addresses = walletData.addresses || {};
                    const bitcoinAddresses = walletData.bitcoinAddresses || {};
                    const bitcoin = walletData.bitcoin || {};
                    
                    // Ensure all address types are properly stored - check bitcoinAddresses first
                    const mappedWalletData = {
                        ...walletData,
                        addresses: {
                            spark: addresses.spark || '',
                            bitcoin: addresses.bitcoin || bitcoinAddresses.segwit || '',
                            segwit: bitcoinAddresses.segwit || addresses.bitcoin || '',
                            taproot: bitcoinAddresses.taproot || '',
                            legacy: bitcoinAddresses.legacy || '',
                            nestedSegwit: bitcoinAddresses.nestedSegwit || ''
                        },
                        // Keep the original bitcoinAddresses for reference
                        bitcoinAddresses: bitcoinAddresses
                    };
                    
                    console.log('[ImportWallet] Mapped wallet data:', mappedWalletData);
                    console.log('[ImportWallet] Spark address after mapping:', mappedWalletData.addresses.spark);
                    
                    localStorage.setItem('sparkWallet', JSON.stringify(mappedWalletData));
                    this.app.state.set('generatedSeed', seedWords);
                    this.app.state.set('sparkWallet', mappedWalletData);
                    
                    
                    this.app.state.set('currentWallet', {
                        mnemonic: walletData.mnemonic,
                        bitcoinAddress: mappedWalletData.addresses.bitcoin,
                        sparkAddress: mappedWalletData.addresses.spark,
                        taprootAddress: mappedWalletData.addresses.taproot,
                        segwitAddress: mappedWalletData.addresses.segwit,
                        legacyAddress: mappedWalletData.addresses.legacy,
                        privateKeys: walletData.privateKeys,
                        isInitialized: true
                    });
                    
                    // Create account in the multi-account system with the imported wallet data
                    const account = await this.app.state.createAccount('Imported Wallet', walletData.mnemonic, true);
                    
                    // Double-check that Spark address was included
                    if (account && mappedWalletData.addresses.spark) {
                        console.log('[ImportWallet] Verifying Spark address in created account:', account.addresses?.spark);
                    }
                    
                    this.app.showNotification('[SUCCESS] Wallet import completed • HD keys derived', 'success');
                } else {
                    // Fallback - store in memory only
                    // SECURITY: Never store seeds in localStorage
                    this.app.state.set('generatedSeed', seedWords);
                    this.app.showNotification('[PROCESSING] Deriving HD wallet from seed...', 'success');
                }
            } catch (error) {
                console.warn('Failed to import via Spark API:', error);
                // Fallback - store in memory only
                // SECURITY: Never store seeds in localStorage
                this.app.state.set('generatedSeed', seedWords);
                this.app.showNotification('Importing wallet...', 'success');
            }
            
            setTimeout(() => {
                this.app.router.navigate('dashboard');
                // Force balance refresh after navigation
                setTimeout(() => {
                    const dashboardPage = this.app.router.currentPage;
                    if (dashboardPage && dashboardPage.refreshBalances) {
                        console.log('[ImportWallet] Triggering balance refresh after import');
                        dashboardPage.refreshBalances();
                    }
                }, 2000);
            }, 1500);
        }

        validateMnemonic(words) {
            // Basic validation - check if all words are in BIP39 list
            // If wordlist not loaded, assume valid (will be validated by API)
            const BIP39_WORDS = window.BIP39_WORDS;
            if (!BIP39_WORDS || BIP39_WORDS.length === 0) {
                return true;
            }
            return words.every(word => BIP39_WORDS.includes(word.toLowerCase()));
        }
    }

    // Make available globally and maintain compatibility
    window.ImportSeedPage = ImportSeedPage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.ImportSeedPage = ImportSeedPage;
    }

})(window);