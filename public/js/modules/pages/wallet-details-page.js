// MOOSH WALLET - Wallet Details Page Module
// Shows all wallet addresses, private keys, and recovery phrase
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class WalletDetailsPage extends Component {
        render() {
            const $ = window.ElementFactory || window.$;
            
            // Get wallet type from URL params, default to 'all' to show all wallets
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const selectedType = urlParams.get('type') || 'all';
            
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
            
            // Get the real wallet data from localStorage or state
            const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            // Use the real addresses from the API
            const allAddresses = this.getRealWalletAddresses(sparkWallet, currentWallet);
            const privateKeys = this.getRealPrivateKeys(sparkWallet, currentWallet);
            
            const card = $.div({ className: 'card' }, [
                this.createTitle('All Wallets'), // Changed title
                this.createAddressesSection(allAddresses, 'all'), // Show all addresses
                this.createPrivateKeysSection(privateKeys, 'all'), // Show all private keys
                this.createRecoveryPhraseSection(generatedSeed),
                this.createActionButtons()
            ]);

            return card;
        }

        createTitle(selectedType) {
            const $ = window.ElementFactory || window.$;
            const typeNames = {
                'taproot': 'Bitcoin Taproot',
                'nativeSegWit': 'Bitcoin Native SegWit',
                'nestedSegWit': 'Bitcoin Nested SegWit',
                'legacy': 'Bitcoin Legacy',
                'spark': 'Spark Protocol',
                'all': 'All Generated Wallets'
            };
            
            const walletTypeName = typeNames[selectedType] || 'All Generated Wallets';
            
            return $.div({
                style: {
                    textAlign: 'center',
                    marginBottom: 'calc(32px * var(--scale-factor))'
                }
            }, [
                $.h1({
                    style: {
                        fontSize: 'calc(24px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
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
                    $.span({ className: 'moosh-flash' }, ['WALLET']),
                    ' ',
                    $.span({ className: 'text-dim' }, ['DETAILS'])
                ]),
                $.p({
                    className: 'token-site-subtitle',
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        color: 'var(--text-dim)',
                        marginBottom: 0,
                        opacity: 0.8,
                        cursor: 'pointer',
                        transition: 'color 0.3s ease'
                    },
                    onmouseover: function() { 
                        this.style.color = 'var(--text-primary)';
                        this.style.opacity = '1';
                    },
                    onmouseout: function() { 
                        this.style.color = 'var(--text-dim)';
                        this.style.opacity = '0.8';
                    }
                }, [`${walletTypeName} Account Details`])
            ]);
        }

        createAddressesSection(allAddresses, selectedType) {
            const $ = window.ElementFactory || window.$;
            
            // Handle both array and object formats
            const addressRows = Array.isArray(allAddresses) 
                ? allAddresses.map(addr => this.createAddressRow(addr.label, addr.address))
                : Object.entries(allAddresses).map(([type, address]) => this.createAddressRow(type, address));
            
            return $.div({
                style: {
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(20px * var(--scale-factor))',
                    marginBottom: 'calc(20px * var(--scale-factor))'
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
                    ' ALL WALLET ADDRESSES ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                ...addressRows
            ]);
        }

        createAddressRow(type, address) {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: {
                    marginBottom: 'calc(16px * var(--scale-factor))',
                    padding: 'calc(12px * var(--scale-factor))',
                    border: '1px solid #333333'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        textTransform: 'uppercase'
                    }
                }, [this.getAddressTypeName(type)]),
                $.div({
                    style: {
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(11px * var(--scale-factor))',
                        color: 'var(--text-primary)',
                        wordBreak: 'break-all',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        lineHeight: '1.4'
                    }
                }, [address]),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--text-primary)',
                        color: 'var(--text-primary)',
                        padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        cursor: 'pointer'
                    },
                    onclick: () => this.copyToClipboard(address, `${this.getAddressTypeName(type)} address copied!`)
                }, ['Copy Address'])
            ]);
        }

        createPrivateKeysSection(privateKeys, selectedType) {
            const $ = window.ElementFactory || window.$;
            const keyRows = [];
            
            // Handle both array and object formats
            if (Array.isArray(privateKeys)) {
                // Array format - filtered keys
                privateKeys.forEach(keyData => {
                    if (keyData.spark && keyData.spark.hex !== 'Not available') {
                        keyRows.push(
                            $.div({ style: { marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF9900', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, ['SPARK PRIVATE KEY']),
                            this.createPrivateKeyRow('HEX', keyData.spark.hex)
                        );
                    }
                    if (keyData.bitcoin && (keyData.bitcoin.hex !== 'Not available' || keyData.bitcoin.wif !== 'Not available')) {
                        keyRows.push(
                            $.div({ style: { marginTop: keyRows.length > 0 ? 'calc(16px * var(--scale-factor))' : '0', marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF9900', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, [`${keyData.label.toUpperCase()} PRIVATE KEY`]),
                            this.createPrivateKeyRow('HEX', keyData.bitcoin.hex),
                            this.createPrivateKeyRow('WIF', keyData.bitcoin.wif)
                        );
                    }
                });
            } else {
                // Object format - Check sparkWallet.allPrivateKeys first
                const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                const allPrivateKeys = sparkWallet.allPrivateKeys || {};
                
                // Add Spark private key if available
                if (privateKeys.spark && privateKeys.spark.hex !== 'Not available') {
                    keyRows.push(
                        $.div({ style: { marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF9900', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, ['SPARK PRIVATE KEY']),
                        this.createPrivateKeyRow('HEX', privateKeys.spark.hex)
                    );
                }
                
                // Add Bitcoin private keys if available
                if (privateKeys.bitcoin && (privateKeys.bitcoin.hex !== 'Not available' || privateKeys.bitcoin.wif !== 'Not available')) {
                    keyRows.push(
                        $.div({ style: { marginTop: keyRows.length > 0 ? 'calc(16px * var(--scale-factor))' : '0', marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF9900', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, ['BITCOIN PRIVATE KEY']),
                        this.createPrivateKeyRow('HEX', privateKeys.bitcoin.hex),
                        this.createPrivateKeyRow('WIF', privateKeys.bitcoin.wif)
                    );
                }
                
                // Add all other private keys when showing all
                if (selectedType === 'all') {
                    // Check all possible key types from privateKeys parameter first, then allPrivateKeys
                    const keyTypes = ['segwit', 'taproot', 'legacy', 'nestedSegwit'];
                    keyTypes.forEach(format => {
                        // Check privateKeys parameter first
                        if (privateKeys[format] && (privateKeys[format].hex !== 'Not available' || privateKeys[format].wif !== 'Not available')) {
                            const formatName = this.getAddressTypeName(format);
                            keyRows.push(
                                $.div({ style: { marginTop: 'calc(16px * var(--scale-factor))', marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF9900', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, [formatName.toUpperCase() + ' PRIVATE KEY']),
                                this.createPrivateKeyRow(`${format}-HEX`, privateKeys[format].hex),
                                this.createPrivateKeyRow(`${format}-WIF`, privateKeys[format].wif)
                            );
                        }
                        // If not found in privateKeys, check allPrivateKeys
                        else if (allPrivateKeys[format] && (allPrivateKeys[format].hex !== 'Not available' || allPrivateKeys[format].wif !== 'Not available')) {
                            const formatName = this.getAddressTypeName(format);
                            keyRows.push(
                                $.div({ style: { marginTop: 'calc(16px * var(--scale-factor))', marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF9900', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, [formatName.toUpperCase() + ' PRIVATE KEY']),
                                this.createPrivateKeyRow(`${format}-HEX`, allPrivateKeys[format].hex || 'Not available'),
                                this.createPrivateKeyRow(`${format}-WIF`, allPrivateKeys[format].wif || 'Not available')
                            );
                        }
                    });
                }
            }
            
            // If no keys available, show fallback
            if (keyRows.length === 0) {
                keyRows.push(
                    this.createPrivateKeyRow('HEX', 'Not available'),
                    this.createPrivateKeyRow('WIF', 'Not available')
                );
            }
            
            return $.div({
                style: {
                    background: '#000000',
                    border: '2px solid #ff4444',
                    borderRadius: '0',
                    padding: 'calc(20px * var(--scale-factor))',
                    marginBottom: 'calc(20px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: '#ff4444',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, [
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    ' PRIVATE KEYS - KEEP SECRET ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                ...keyRows,
                $.div({
                    style: {
                        color: '#ff4444',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        textAlign: 'center',
                        marginTop: 'calc(12px * var(--scale-factor))'
                    }
                }, ['Never share your private keys with anyone. Store them securely offline.'])
            ]);
        }

        createPrivateKeyRow(type, key) {
            const $ = window.ElementFactory || window.$;
            // Generate unique IDs using timestamp and random number
            const bytes = new Uint8Array(9);
            window.crypto.getRandomValues(bytes);
            const id = Array.from(bytes).map(b => b.toString(36)).join('').substring(0, 9);
            const uniqueId = `${Date.now()}_${id}`;
            const overlayId = `${type.toLowerCase().replace(/[^a-z0-9]/g, '')}KeyOverlay_${uniqueId}`;
            const displayId = `${type.toLowerCase().replace(/[^a-z0-9]/g, '')}KeyDisplay_${uniqueId}`;
            
            return $.div({
                style: {
                    marginBottom: 'calc(16px * var(--scale-factor))',
                    padding: 'calc(12px * var(--scale-factor))',
                    border: '1px solid #ff4444',
                    background: 'rgba(255, 68, 68, 0.05)'
                }
            }, [
                $.div({
                    style: {
                        color: '#CCCCCC',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))',
                        textTransform: 'uppercase'
                    }
                }, [`${type} PRIVATE KEY`]),
                $.div({
                    style: {
                        position: 'relative',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    $.div({
                        id: displayId,
                        style: {
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(11px * var(--scale-factor))',
                            color: 'var(--text-primary)',
                            wordBreak: 'break-all',
                            lineHeight: '1.4'
                        }
                    }, [key]),
                    $.div({
                        className: 'key-overlay',
                        'data-overlay-id': overlayId,
                        'data-display-id': displayId,
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            background: '#666666',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000000',
                            fontSize: 'calc(10px * var(--scale-factor))',
                            fontWeight: '600',
                            transition: 'opacity 0.3s ease'
                        },
                        onclick: (e) => {
                            const overlay = e.currentTarget;
                            const displayId = overlay.getAttribute('data-display-id');
                            if (overlay.style.display === 'none' || overlay.style.display === '') {
                                overlay.style.display = 'flex';
                                this.app.showNotification(`${type} private key hidden`, 'success');
                            } else {
                                overlay.style.display = 'none';
                                this.app.showNotification(`${type} private key revealed`, 'success');
                            }
                        }
                    }, [`Click to Reveal ${type} Key`])
                ]),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid #ff4444',
                        color: '#ff4444',
                        padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        cursor: 'pointer',
                        marginRight: 'calc(8px * var(--scale-factor))'
                    },
                    onclick: () => this.copyToClipboard(key, `${type} private key copied!`)
                }, ['Copy']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid #ff4444',
                        color: '#ff4444',
                        padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        cursor: 'pointer'
                    },
                    onclick: () => {
                        const overlay = document.querySelector(`[data-overlay-id="${overlayId}"]`);
                        if (overlay) {
                            if (overlay.style.display === 'none' || overlay.style.display === '') {
                                overlay.style.display = 'flex';
                                this.app.showNotification(`${type} private key hidden`, 'success');
                            } else {
                                overlay.style.display = 'none';
                                this.app.showNotification(`${type} private key revealed`, 'success');
                            }
                        }
                    }
                }, ['Reveal'])
            ]);
        }

        createRecoveryPhraseSection(generatedSeed) {
            const $ = window.ElementFactory || window.$;
            return $.div({
                style: {
                    background: '#000000',
                    border: '2px solid #ff4444',
                    borderRadius: '0',
                    padding: 'calc(20px * var(--scale-factor))',
                    marginBottom: 'calc(20px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: '#ff4444',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        textAlign: 'center'
                    }
                }, [
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    ' RECOVERY PHRASE ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                $.div({
                    style: {
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(11px * var(--scale-factor))',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        textAlign: 'center'
                    }
                }, [generatedSeed.join(' ')]),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--text-primary)',
                        color: 'var(--text-primary)',
                        padding: 'calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        cursor: 'pointer',
                        marginTop: 'calc(12px * var(--scale-factor))',
                        width: '100%'
                    },
                    onclick: () => this.copyToClipboard(generatedSeed.join(' '), 'Recovery phrase copied!')
                }, ['Copy Recovery Phrase'])
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
                    text: 'Access Wallet Dashboard',
                    onClick: () => this.openWalletDashboard()
                }).render(),
                new Button(this.app, {
                    text: 'Back Esc',
                    variant: 'back',
                    onClick: () => this.app.router.goBack()
                }).render()
            ]);
        }

        getAddressTypeName(type) {
            const names = {
                'spark': 'Spark Protocol (Lightning)',
                'taproot': 'Bitcoin Taproot (P2TR)',
                'segwit': 'Bitcoin SegWit (P2WPKH)', 
                'nestedSegwit': 'Bitcoin Nested SegWit (P2SH)',
                'legacy': 'Bitcoin Legacy (P2PKH)',
                'bitcoin': 'Bitcoin SegWit', // Default bitcoin address
                'native-segwit': 'Bitcoin Native SegWit (P2WPKH)',
                'nested-segwit': 'Bitcoin Nested SegWit (P2SH)'
            };
            return names[type] || type.toUpperCase();
        }
        
        copyToClipboard(text, successMessage) {
            // Enhanced copy function with fallback for older browsers
            const copyToClipboardFallback = () => {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        this.app.showNotification(successMessage || 'Copied to clipboard!', 'success');
                        return true;
                    } else {
                        throw new Error('Copy command failed');
                    }
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    this.app.showNotification('Failed to copy. Please copy manually.', 'error');
                    
                    // Show the text in a prompt as last resort
                    prompt('Copy the text below:', text);
                    return false;
                } finally {
                    document.body.removeChild(textArea);
                }
            };
            
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    this.app.showNotification(successMessage || 'Copied to clipboard!', 'success');
                    
                    // Add visual feedback to the button that was clicked
                    if (event && event.target) {
                        const button = event.target;
                        const originalBg = button.style.background;
                        const originalColor = button.style.color;
                        button.style.background = 'var(--text-accent)';
                        button.style.color = '#000000';
                        setTimeout(() => {
                            button.style.background = originalBg;
                            button.style.color = originalColor;
                        }, 300);
                    }
                }).catch((err) => {
                    console.error('Clipboard API failed:', err);
                    copyToClipboardFallback();
                });
            } else {
                // Use fallback for older browsers or non-secure contexts
                copyToClipboardFallback();
            }
        }
        
        getRealWalletAddresses(sparkWallet, currentWallet) {
            // Get real addresses from stored wallet data
            const addresses = {};
            
            // Priority: sparkWallet > currentWallet
            if (sparkWallet && sparkWallet.addresses) {
                addresses.spark = sparkWallet.addresses.spark || 'Not available';
                
                // Check for additional bitcoin addresses in different formats
                if (sparkWallet.bitcoinAddresses) {
                    // Only include each address type once
                    addresses.segwit = sparkWallet.bitcoinAddresses.segwit || sparkWallet.addresses.bitcoin || 'Not available';
                    addresses.taproot = sparkWallet.bitcoinAddresses.taproot || 'Not available';
                    addresses.nestedSegwit = sparkWallet.bitcoinAddresses.nestedSegwit || sparkWallet.bitcoinAddresses.nestedSegWit || 'Not available';
                    addresses.legacy = sparkWallet.bitcoinAddresses.legacy || 'Not available';
                } else {
                    // Fallback if bitcoinAddresses not available
                    addresses.segwit = sparkWallet.addresses.bitcoin || 'Not available';
                    // Infer from bitcoin address format
                    if (addresses.bitcoin && addresses.bitcoin.startsWith('bc1p') || addresses.bitcoin && addresses.bitcoin.startsWith('tb1p')) {
                        addresses.taproot = addresses.bitcoin;
                    } else if (addresses.bitcoin && addresses.bitcoin.startsWith('bc1q') || addresses.bitcoin && addresses.bitcoin.startsWith('tb1q')) {
                        addresses.segwit = addresses.bitcoin;
                    }
                }
            } else if (currentWallet) {
                addresses.spark = currentWallet.sparkAddress || 'Not available';
                // Only include segwit once
                addresses.segwit = currentWallet.addresses?.segwit || currentWallet.bitcoinAddress || 'Not available';
                addresses.taproot = currentWallet.addresses?.taproot || 'Not available';
                addresses.nestedSegwit = currentWallet.addresses?.nestedSegwit || currentWallet.addresses?.nestedSegWit || 'Not available';
                addresses.legacy = currentWallet.addresses?.legacy || 'Not available';
            }
            
            return addresses;
        }
        
        getRealPrivateKeys(sparkWallet, currentWallet) {
            // Get real private keys from stored wallet data
            const keys = {};
            
            // Priority: sparkWallet > currentWallet
            if (sparkWallet && sparkWallet.privateKeys) {
                const privateKeys = sparkWallet.privateKeys;
                const allPrivateKeys = sparkWallet.allPrivateKeys || {};
                
                // Spark key
                if (privateKeys.spark?.hex) {
                    keys.spark = { hex: privateKeys.spark.hex };
                }
                
                // Bitcoin keys - check multiple sources
                if (privateKeys.bitcoin) {
                    keys.bitcoin = {
                        hex: privateKeys.bitcoin.hex || 'Not available',
                        wif: privateKeys.bitcoin.wif || 'Not available'
                    };
                    
                    // Check allPrivateKeys for specific keys
                    if (allPrivateKeys.taproot) {
                        keys.taproot = allPrivateKeys.taproot;
                    }
                    if (allPrivateKeys.segwit) {
                        keys.segwit = allPrivateKeys.segwit;
                    }
                    if (allPrivateKeys.nestedSegwit) {
                        keys.nestedSegwit = allPrivateKeys.nestedSegwit;
                    }
                    if (allPrivateKeys.legacy) {
                        keys.legacy = allPrivateKeys.legacy;
                    }
                }
            } else if (currentWallet && currentWallet.privateKeys) {
                const privateKeys = currentWallet.privateKeys;
                
                if (privateKeys.spark?.hex) {
                    keys.spark = { hex: privateKeys.spark.hex };
                }
                
                if (privateKeys.bitcoin) {
                    keys.bitcoin = {
                        hex: privateKeys.bitcoin.hex || 'Not available',
                        wif: privateKeys.bitcoin.wif || 'Not available'
                    };
                    
                    // Use the same key for all Bitcoin types
                    keys.taproot = keys.bitcoin;
                    keys.segwit = keys.bitcoin;
                    keys.nestedSegwit = keys.bitcoin;
                    keys.legacy = keys.bitcoin;
                }
            }
            
            // Private keys loaded
            return keys;
        }

        async openWalletDashboard() {
            this.app.showNotification('Opening wallet dashboard...', 'success');
            
            // Initialize multi-account system if needed
            const accounts = this.app.state.getAccounts();
            console.log('[WalletDetails] Current accounts:', accounts.length);
            
            if (accounts.length === 0) {
                console.log('[WalletDetails] No accounts found, initializing multi-account system');
                
                // Get the seed and wallet data
                const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
                const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                
                if (generatedSeed.length > 0) {
                    // Create the first account using the generated seed
                    const mnemonic = Array.isArray(generatedSeed) ? generatedSeed.join(' ') : generatedSeed;
                    const isImport = !!localStorage.getItem('importedSeed');
                    
                    try {
                        await this.app.state.createAccount('Main Account', mnemonic, isImport);
                        console.log('[WalletDetails] First account created successfully');
                        this.app.showNotification('Account initialized successfully', 'success');
                    } catch (error) {
                        console.error('[WalletDetails] Failed to create first account:', error);
                        this.app.showNotification('Failed to initialize account', 'error');
                    }
                }
            }
            
            // Mark wallet as ready and navigate properly through router
            localStorage.setItem('walletReady', 'true');
            this.app.state.set('walletReady', true);
            
            // Unlock the wallet for this session (user just created/imported it)
            sessionStorage.setItem('walletUnlocked', 'true');
            console.log('[WalletDetails] Wallet unlocked for this session');
            
            this.app.router.navigate('dashboard');
        }
    }

    // Make available globally and maintain compatibility
    window.WalletDetailsPage = WalletDetailsPage;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.WalletDetailsPage = WalletDetailsPage;
    }

})(window);