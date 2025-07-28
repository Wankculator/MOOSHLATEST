/**
 * WalletDetailsPage Module
 * 
 * Displays detailed wallet information including addresses, private keys, and balances.
 * Handles both newly created and imported wallets.
 * 
 * Dependencies:
 * - Component (base class)
 * - ElementFactory ($)
 * - ComplianceUtils
 * - ResponsiveUtils
 * - MultiAccountModal
 * - TransactionHistoryModal
 * - WalletSettingsModal
 * - TokenMenuModal
 * - AccountSwitcher
 */

(function(window) {
    'use strict';

    // Import dependencies from window
    const Component = window.Component;
    const $ = window.ElementFactory || window.$;
    const ComplianceUtils = window.ComplianceUtils;
    const ResponsiveUtils = window.ResponsiveUtils;
    
    // Modal dependencies
    const MultiAccountModal = window.MultiAccountModal;
    const TransactionHistoryModal = window.TransactionHistoryModal;
    const WalletSettingsModal = window.WalletSettingsModal;
    const TokenMenuModal = window.TokenMenuModal;
    const AccountSwitcher = window.AccountSwitcher;
    class WalletDetailsPage extends Component {
        render() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Get wallet type from URL params, default to 'all' to show all wallets
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const selectedType = urlParams.get('type') || 'all';
            
            const generatedSeed = JSON.parse(localStorage.getItem('generatedSeed') || localStorage.getItem('importedSeed') || '[]');
            
            // Get the real wallet data from localStorage or state
            const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
            const currentWallet = this.app.state.get('currentWallet') || {};
            
            // Debug logging
            ComplianceUtils.log('WalletDetails', 'Selected type: ' + selectedType);
            ComplianceUtils.log('WalletDetails', 'SparkWallet loaded from storage');
            ComplianceUtils.log('WalletDetails', 'CurrentWallet loaded from state');
            ComplianceUtils.log('WalletDetails', 'Wallet data loaded successfully');
            
            // Use the real addresses from the API
            const allAddresses = this.getRealWalletAddresses(sparkWallet, currentWallet);
            const privateKeys = this.getRealPrivateKeys(sparkWallet, currentWallet);
            
            ComplianceUtils.log('WalletDetails', 'Address types available: ' + Object.keys(allAddresses).length);
            ComplianceUtils.log('WalletDetails', 'Keys retrieved from secure storage');
            
            // Show ALL addresses and private keys, not filtered
            ComplianceUtils.log('WalletDetails', 'Displaying wallet information');
            
            const card = $.div({ className: 'card' }, [
                this.createTitle('All Wallets'), // Changed title
                this.createAddressesSection(allAddresses, 'all'), // Show all addresses
                this.createPrivateKeysSection(privateKeys, 'all'), // Show all private keys
                this.createRecoveryPhraseSection(generatedSeed),
                this.createActionButtons()
            ]);

            return card;
        }
        
        filterByWalletType(addresses, type) {
            // Handle object format from getRealWalletAddresses
            if (!Array.isArray(addresses)) {
                // Convert object to filtered result based on type
                const typeToKey = {
                    'taproot': 'taproot',
                    'nativeSegWit': 'segwit',
                    'nestedSegWit': 'nestedSegwit',
                    'legacy': 'legacy',
                    'spark': 'spark'
                };
                
                const key = typeToKey[type];
                const address = addresses[key] || 'Not available';
                
                return {
                    [key]: address
                };
            }
            
            // Legacy array support
            const typeMapping = {
                'taproot': 'Taproot',
                'nativeSegWit': 'Native SegWit',
                'nestedSegWit': 'Nested SegWit',
                'legacy': 'Legacy',
                'spark': 'Spark Protocol'
            };
            
            const targetLabel = typeMapping[type];
            return addresses.filter(addr => addr.label === targetLabel);
        }
        
        filterPrivateKeysByType(privateKeys, type) {
            // Handle object format from getRealPrivateKeys
            if (!Array.isArray(privateKeys)) {
                // Convert object to filtered result based on type
                if (type === 'spark') {
                    return privateKeys.spark ? { spark: privateKeys.spark } : {};
                } else {
                    // For Bitcoin types, use the appropriate key
                    const typeToKey = {
                        'taproot': 'taproot',
                        'nativeSegWit': 'segwit',
                        'nestedSegWit': 'nestedSegwit',
                        'legacy': 'legacy'
                    };
                    
                    const key = typeToKey[type];
                    const keyData = privateKeys[key] || privateKeys.bitcoin;
                    
                    return keyData ? { bitcoin: keyData } : {};
                }
            }
            
            // Legacy array support
            const typeMapping = {
                'taproot': 'Taproot',
                'nativeSegWit': 'Native SegWit',
                'nestedSegWit': 'Nested SegWit',
                'legacy': 'Legacy',
                'spark': 'Spark Protocol'
            };
            
            const targetLabel = typeMapping[type];
            return privateKeys.filter(key => key.label === targetLabel);
        }

        createTitle(selectedType) {
            const $ = window.ElementFactory || ElementFactory;
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
            const $ = window.ElementFactory || ElementFactory;
            
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
            const $ = window.ElementFactory || ElementFactory;
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
            const $ = window.ElementFactory || ElementFactory;
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
                
                // Security: Removed private key logging
                
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
                
                // Add extended keys if available
                if (privateKeys.xpub) {
                    keyRows.push(
                        $.div({ style: { marginTop: 'calc(16px * var(--scale-factor))', marginBottom: 'calc(12px * var(--scale-factor))', color: '#00CC66', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, ['EXTENDED PUBLIC KEY']),
                        this.createPrivateKeyRow('XPUB', privateKeys.xpub)
                    );
                }
                if (privateKeys.xpriv) {
                    keyRows.push(
                        $.div({ style: { marginTop: 'calc(16px * var(--scale-factor))', marginBottom: 'calc(12px * var(--scale-factor))', color: '#FF4444', fontSize: 'calc(12px * var(--scale-factor))', fontWeight: '600' } }, ['EXTENDED PRIVATE KEY']),
                        this.createPrivateKeyRow('XPRIV', privateKeys.xpriv)
                    );
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
            const $ = window.ElementFactory || ElementFactory;
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
            const $ = window.ElementFactory || ElementFactory;
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
            const $ = window.ElementFactory || ElementFactory;
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

        generateWalletAddress(addressType = 'spark') {
            const isMainnet = this.app.state.get('isMainnet');
            const ADDRESS_TYPES = {
                'spark': { prefix: isMainnet ? 'sp1' : 'tsp1', length: 62, charset: 'qpzry9x8gf2tvdw0s3jn54khce6mua7l' },
                'taproot': { prefix: isMainnet ? 'bc1p' : 'tb1p', length: 62, charset: 'qpzry9x8gf2tvdw0s3jn54khce6mua7l' },
                'native-segwit': { prefix: isMainnet ? 'bc1' : 'tb1', length: 42, charset: 'qpzry9x8gf2tvdw0s3jn54khce6mua7l' },
                'nested-segwit': { prefix: isMainnet ? '3' : '2', length: 34, charset: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz' },
                'legacy': { prefix: isMainnet ? '1' : 'm', length: 34, charset: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz' }
            };
            const config = ADDRESS_TYPES[addressType] || ADDRESS_TYPES['spark'];
            let address = config.prefix;
            const remainingLength = config.length - config.prefix.length;
            for (let i = 0; i < remainingLength; i++) {
                const randomBytes = new Uint8Array(1);
                window.crypto.getRandomValues(randomBytes);
                address += config.charset[randomBytes[0] % config.charset.length];
            }
            return address;
        }

        generatePrivateKey() {
            const chars = '0123456789abcdef';
            let privateKey = '';
            for (let i = 0; i < 64; i++) {
                const randomBytes = new Uint8Array(1);
                window.crypto.getRandomValues(randomBytes);
                privateKey += chars[randomBytes[0] % chars.length];
            }
            return privateKey;
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
                    if (addresses.bitcoin.startsWith('bc1p') || addresses.bitcoin.startsWith('tb1p')) {
                        addresses.taproot = addresses.bitcoin;
                    } else if (addresses.bitcoin.startsWith('bc1q') || addresses.bitcoin.startsWith('tb1q')) {
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
                
                // Security: Removed private key logging
                
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
        
        generateAllWalletAddresses() {
            const types = ['spark', 'taproot', 'native-segwit', 'nested-segwit', 'legacy'];
            const addresses = {};
            types.forEach(type => {
                addresses[type] = this.generateWalletAddress(type);
            });
            return addresses;
        }
        
        generateAllPrivateKeyFormats() {
            const isMainnet = this.app.state.get('isMainnet');
            const hexPrivateKey = this.generatePrivateKey();
            const prefix = isMainnet ? '5' : '9';
            const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            let wif = prefix;
            for (let i = 0; i < 50; i++) {
                const randomBytes = new Uint8Array(1);
                window.crypto.getRandomValues(randomBytes);
                wif += chars[randomBytes[0] % chars.length];
            }
            return { hex: hexPrivateKey, wif: wif };
        }
        
        togglePrivateKeyVisibility(keyType) {
            const overlayId = keyType === 'WIF' ? 'wifKeyOverlay' : 'hexKeyOverlay';
            const messageType = keyType === 'WIF' ? 'WIF private key' : 'HEX private key';
            const overlay = document.getElementById(overlayId);
            
            if (overlay) {
                if (overlay.style.display === 'none') {
                    overlay.style.display = 'flex';
                    this.app.showNotification(messageType + ' hidden', 'success');
                } else {
                    overlay.style.display = 'none';
                    this.app.showNotification(messageType + ' revealed', 'success');
                }
            }
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
        
        createDashboard() {
            const $ = window.ElementFactory || ElementFactory;
            
            // Use the same card styling as other pages
            return $.div({ className: 'card' }, [
                this.createDashboardTitle(),
                this.createDashboardHeader(),
                this.createStatusBanner(),
                this.createBalanceSection(),
                this.createQuickActions(),
                this.createTransactionHistory()
            ]);
        }
        
        createQuickActions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 'calc(16px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))'
                }
            }, [
                this.createActionButton('Send', '↑', () => this.handleSend()),
                this.createActionButton('Receive', '↓', () => this.handleReceive()),
                this.createActionButton('Swap', '↔', () => this.handleSwap()),
                this.createActionButton('Settings', '⚙', () => this.handleSettings())
            ]);
        }
        
        createActionButton(label, icon, onClick) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.button({
                style: {
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--text-primary)',
                    color: 'var(--text-primary)',
                    padding: 'calc(20px * var(--scale-factor))',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    borderRadius: '0'
                },
                onclick: onClick,
                onmouseover: function() {
                    this.style.background = 'var(--text-primary)';
                    this.style.color = 'var(--bg-primary)';
                },
                onmouseout: function() {
                    this.style.background = 'var(--bg-primary)';
                    this.style.color = 'var(--text-primary)';
                }
            }, [
                $.div({
                    style: {
                        fontSize: 'calc(24px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    icon === 'MOOSH' ? 
                    $.span({ 
                        style: { 
                            color: 'var(--text-accent)', 
                            fontWeight: 'bold', 
                            fontSize: 'calc(24px * var(--scale-factor))',
                            letterSpacing: '2px'
                        } 
                    }, ['MOOSH']) : 
                    icon
                ]),
                $.div({
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }
                }, [label])
            ]);
        }
        
        createDashboardTitle() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    textAlign: 'center',
                    marginBottom: 'calc(24px * var(--scale-factor))'
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
                    $.span({ className: 'text-dim' }, ['DASHBOARD'])
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
                }, ['Your wallet control center'])
            ]);
        }
        
        createDashboardHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'calc(16px * var(--scale-factor))',
                    padding: 'calc(12px * var(--scale-factor))',
                    background: '#000000',
                    border: '1px solid var(--border-color)'
                }
            }, [
                // Account selector
                $.div({
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    $.span({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(12px * var(--scale-factor))'
                        }
                    }, ['Account:']),
                    $.span({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            fontWeight: '600'
                        }
                    }, ['Main Wallet'])
                ]),
                
                // Action buttons
                $.div({ 
                    style: {
                        display: 'flex',
                        gap: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-primary)',
                            color: 'var(--text-primary)',
                            padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            fontSize: 'calc(11px * var(--scale-factor))',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => this.handleRefresh()
                    }, ['Refresh']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-primary)',
                            color: 'var(--text-primary)',
                            padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            fontSize: 'calc(11px * var(--scale-factor))',
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace"
                        },
                        onclick: () => this.handlePrivacyToggle()
                    }, ['Hide'])
                ])
            ]);
        }
        
        createAccountSelector() {
            const $ = window.ElementFactory || ElementFactory;
            const accountName = this.getAccountDisplayName();
            
            return $.div({ className: 'account-selector' }, [
                $.button({
                    className: 'account-dropdown-btn',
                    onclick: () => this.toggleAccountDropdown()
                }, [
                    $.span({ className: 'account-name' }, [accountName]),
                    $.span({ className: 'dropdown-arrow' }, ['▼'])
                ])
            ]);
        }
        
        createHeaderButtons() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'header-buttons' }, [
                $.button({
                    className: 'header-btn',
                    title: 'Token Menu',
                    onclick: () => this.handleTokenMenu()
                }, ['💰']),
                
                $.button({
                    className: 'header-btn',
                    title: 'Add Account',
                    onclick: () => this.handleAddAccount()
                }, ['+']),
                
                $.button({
                    className: 'header-btn',
                    title: 'Refresh',
                    onclick: () => this.handleRefresh()
                }, ['REFRESH']),
                
                $.button({
                    className: 'header-btn privacy-toggle',
                    title: 'Toggle Privacy',
                    onclick: () => this.handlePrivacyToggle()
                }, ['👁'])
            ]);
        }
        
        createDashboardContent() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'dashboard-content' }, [
                this.createMainActionButtons()
            ]);
        }
        
        createBalanceSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    background: '#000000',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    textAlign: 'center'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(14px * var(--scale-factor))'
                    }
                }, [
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['<']),
                    ' WALLET BALANCE ',
                    $.span({ className: 'text-dim ui-bracket', style: { fontSize: 'calc(9px * var(--scale-factor))' } }, ['/>'])
                ]),
                
                // Bitcoin balance
                $.div({
                    style: {
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.div({
                        style: {
                            fontSize: 'calc(32px * var(--scale-factor))',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace",
                            marginBottom: 'calc(8px * var(--scale-factor))'
                        }
                    }, [
                        $.span({ id: 'btc-balance' }, ['Loading...']),
                        $.span({ style: { fontSize: 'calc(18px * var(--scale-factor))' } }, [' BTC'])
                    ]),
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(14px * var(--scale-factor))'
                        }
                    }, [
                        '≈ $',
                        $.span({ id: 'usd-balance' }, ['Loading...']),
                        ' USD'
                    ])
                ]),
                
                // Other balances
                $.div({
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'calc(16px * var(--scale-factor))',
                        marginTop: 'calc(24px * var(--scale-factor))',
                        paddingTop: 'calc(24px * var(--scale-factor))',
                        borderTop: '1px solid var(--border-color)'
                    }
                }, [
                    this.createMiniBalance('Lightning', '0 sats'),
                    this.createMiniBalance('MOOSH', '0.00'),
                    this.createMiniBalance('USDT', '0.00')
                ])
            ]);
        }
        
        createMiniBalance(label, amount) {
            const $ = window.ElementFactory || ElementFactory;
            return $.div({
                style: {
                    textAlign: 'center'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(10px * var(--scale-factor))',
                        marginBottom: 'calc(4px * var(--scale-factor))'
                    }
                }, [label]),
                $.div({
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontWeight: '600'
                    }
                }, [amount])
            ]);
        }
        
        createTokenCard(name, amount, value) {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'token-card' }, [
                $.div({ className: 'token-name' }, [name]),
                $.div({ className: 'token-amount' }, [amount]),
                $.div({ className: 'token-value' }, [value])
            ]);
        }
        
        createMainActionButtons() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'wallet-actions',
                style: 'display: flex; flex-direction: column; gap: calc(12px * var(--scale-factor)); margin-top: calc(24px * var(--scale-factor));'
            }, [
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showSendPayment()
                }, ['Send Lightning Payment']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showReceivePayment()
                }, ['Receive Payment']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--text-accent); color: var(--text-accent); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer; font-weight: 600;',
                    onclick: () => this.showOrdinalsTerminal(),
                    onmouseover: (e) => {
                        e.currentTarget.style.background = 'var(--text-accent)';
                        e.currentTarget.style.color = 'var(--bg-primary)';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = 'var(--text-accent)';
                    }
                }, ['Inscriptions - Ordinals']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showTokenMenu()
                }, ['Token Menu']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => this.showTransactionHistory()
                }, ['Transaction History']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid #f57315; color: #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => {
                        // Navigate to wallet details page to show private keys and all addresses
                        this.app.router.navigate('wallet-details?type=all');
                    },
                    onmouseover: (e) => {
                        e.currentTarget.style.background = '#1a0a00';
                        e.currentTarget.style.borderColor = '#ff8c42';
                        e.currentTarget.style.color = '#ff8c42';
                    },
                    onmouseout: (e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.borderColor = '#f57315';
                        e.currentTarget.style.color = '#f57315';
                    }
                }, ['View Private Keys & Addresses']),
                
                $.button({
                    className: 'btn-secondary',
                    style: 'width: 100%; font-size: calc(14px * var(--scale-factor)); background: #000000; border: 2px solid var(--border-active); color: var(--text-primary); border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.2s ease; cursor: pointer;',
                    onclick: () => {
                        console.log('[WalletSettings] Button clicked, this context:', this);
                        console.log('[WalletSettings] showWalletSettings exists:', !!this.showWalletSettings);
                        
                        // Try multiple approaches to show wallet settings
                        if (this.showWalletSettings && typeof this.showWalletSettings === 'function') {
                            console.log('[WalletSettings] Using this.showWalletSettings');
                            this.showWalletSettings();
                        } else if (window.DashboardPage && window.DashboardPage.showWalletSettingsStatic) {
                            console.log('[WalletSettings] Using static method');
                            window.DashboardPage.showWalletSettingsStatic(window.mooshWallet);
                        } else {
                            console.log('[WalletSettings] Direct modal creation');
                            // Direct approach - show password verification then settings
                            const showPasswordModal = () => {
                                const $ = window.ElementFactory;
                                const passwordOverlay = $.div({ 
                                    className: 'modal-overlay',
                                    style: {
                                        position: 'fixed',
                                        top: '0',
                                        left: '0',
                                        right: '0',
                                        bottom: '0',
                                        background: 'rgba(0, 0, 0, 0.8)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: '10000'
                                    },
                                    onclick: (e) => {
                                        if (e.target.className === 'modal-overlay') {
                                            e.currentTarget.remove();
                                        }
                                    }
                                }, [
                                    $.div({
                                        className: 'modal-container',
                                        style: {
                                            background: 'var(--bg-primary)',
                                            border: '2px solid #f57315',
                                            borderRadius: '0',
                                            padding: '30px',
                                            minWidth: '400px',
                                            maxWidth: '90%'
                                        }
                                    }, [
                                        $.h3({
                                            style: {
                                                color: '#f57315',
                                                marginBottom: '20px',
                                                fontSize: '18px'
                                            }
                                        }, ['Password Required']),
                                        
                                        $.p({
                                            style: {
                                                color: '#888888',
                                                marginBottom: '20px',
                                                fontSize: '14px'
                                            }
                                        }, ['Enter your wallet password to access settings']),
                                        
                                        $.input({
                                            type: 'password',
                                            id: 'settingsPasswordInput',
                                            placeholder: 'Enter password',
                                            style: {
                                                width: '100%',
                                                padding: '12px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid #f57315',
                                                color: '#f57315',
                                                fontSize: '14px',
                                                borderRadius: '0',
                                                marginBottom: '10px'
                                            },
                                            onkeydown: (e) => {
                                                if (e.key === 'Enter') {
                                                    const enteredPassword = e.target.value;
                                                    const storedPassword = localStorage.getItem('walletPassword');
                                                    if (enteredPassword === storedPassword) {
                                                        passwordOverlay.remove();
                                                        const modal = new WalletSettingsModal(window.mooshWallet);
                                                        modal.show();
                                                    } else {
                                                        const errorMsg = document.getElementById('passwordErrorMsg');
                                                        if (errorMsg) {
                                                            errorMsg.textContent = 'Incorrect password';
                                                            errorMsg.style.display = 'block';
                                                        }
                                                    }
                                                }
                                            }
                                        }),
                                        
                                        $.div({
                                            id: 'passwordErrorMsg',
                                            style: {
                                                color: '#ff4444',
                                                fontSize: '12px',
                                                marginTop: '10px',
                                                display: 'none'
                                            }
                                        }),
                                        
                                        $.div({ 
                                            style: {
                                                display: 'flex',
                                                gap: '10px',
                                                marginTop: '20px',
                                                justifyContent: 'flex-end'
                                            }
                                        }, [
                                            $.button({
                                                style: {
                                                    padding: '10px 20px',
                                                    background: 'var(--bg-primary)',
                                                    border: '1px solid #666666',
                                                    color: '#888888',
                                                    cursor: 'pointer',
                                                    borderRadius: '0'
                                                },
                                                onclick: () => passwordOverlay.remove()
                                            }, ['Cancel']),
                                            
                                            $.button({
                                                style: {
                                                    padding: '10px 20px',
                                                    background: '#f57315',
                                                    border: '1px solid #f57315',
                                                    color: '#000000',
                                                    cursor: 'pointer',
                                                    borderRadius: '0'
                                                },
                                                onclick: () => {
                                                    const passwordInput = document.getElementById('settingsPasswordInput');
                                                    const errorMsg = document.getElementById('passwordErrorMsg');
                                                    const enteredPassword = passwordInput.value;
                                                    const storedPassword = localStorage.getItem('walletPassword');
                                                    
                                                    if (!enteredPassword) {
                                                        errorMsg.textContent = 'Please enter a password';
                                                        errorMsg.style.display = 'block';
                                                        return;
                                                    }
                                                    
                                                    if (enteredPassword === storedPassword) {
                                                        passwordOverlay.remove();
                                                        const modal = new WalletSettingsModal(window.mooshWallet);
                                                        modal.show();
                                                    } else {
                                                        errorMsg.textContent = 'Incorrect password';
                                                        errorMsg.style.display = 'block';
                                                    }
                                                }
                                            }, ['Verify'])
                                        ])
                                    ])
                                ]);
                                
                                document.body.appendChild(passwordOverlay);
                                setTimeout(() => {
                                    const input = document.getElementById('settingsPasswordInput');
                                    if (input) input.focus();
                                }, 100);
                            };
                            
                            showPasswordModal();
                        }
                    }
                }, ['Wallet Settings'])
            ]);
        }
        
        createSparkProtocolSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: 'margin-top: 24px; padding-top: 24px; border-top: 1px solid #333333;'
            }, [
                $.h3({ 
                    className: 'text-white', style: 'margin-bottom: 16px;'
                }, ['Spark Protocol Features']),
                
                $.div({ 
                    style: 'background: rgba(105, 253, 151, 0.1); border: 1px solid #69fd97; border-radius: 8px; padding: 16px; margin-bottom: 16px;'
                }, [
                    $.div({ 
                        className: 'text-primary', style: 'font-weight: 600; margin-bottom: 8px;'
                    }, ['Lightning Network Integration']),
                    $.div({ 
                        className: 'text-dim',
                        style: 'font-size: 12px;'
                    }, [
                        'Send instant Bitcoin payments • Sub-second confirmations • Minimal fees',
                        $.br(),
                        'Compatible with all Lightning wallets and services'
                    ])
                ]),
                
                $.div({ 
                    className: 'wallet-actions',
                    style: 'display: flex; gap: 16px; margin-bottom: 24px;'
                }, [
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.showStablecoinSwap(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease; flex: 1;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, ['Swap BTC ↔ USDT']),
                    
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.openLightningChannel(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease; flex: 1;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, ['Open Lightning Channel']),
                    
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.createStablecoin(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease; flex: 1;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, ['Mint Stablecoins'])
                ]),
                
                $.div({ 
                    className: 'terminal-box',
                    style: 'margin-top: 24px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
                }, [
                    $.div({ 
                        className: 'terminal-header',
                        style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 14px;'
                    }, [
                        $.span({}, ['~/moosh/wallet/spark $']),
                        $.span({ 
                            id: 'sparkConnectionStatus',
                            className: 'text-accent',
                            style: 'margin-left: 8px;'
                        }, ['connected'])
                    ]),
                    $.div({ 
                        className: 'terminal-content',
                        id: 'sparkInfo',
                        style: 'padding: 16px; font-family: JetBrains Mono, monospace; font-size: 12px;'
                    }, [
                        $.span({ className: 'text-comment' }, ['# Spark Protocol Status']),
                        $.br(),
                        $.span({ className: 'text-keyword' }, ['const']),
                        ' ',
                        $.span({ className: 'text-variable text-primary' }, ['spark']),
                        ' = ',
                        $.span({ className: 'text-string' }, ['ready']),
                        ';',
                        $.br(),
                        $.span({ className: 'text-comment' }, ['# Mint MOOSH tokens for 0.0000058 BTC'])
                    ])
                ]),
                
                $.div({ 
                    className: 'wallet-actions',
                    style: 'margin-top: 24px;'
                }, [
                    $.button({
                        className: 'btn-secondary',
                        onclick: () => this.logout(),
                        className: 'btn-secondary text-white', style: 'background: #000000; border: 1px solid #888888; border-radius: 8px; font-weight: 600; font-size: 14px; padding: 12px 24px; font-family: inherit; cursor: pointer; transition: all 0.2s ease;',
                        onmouseover: (e) => { e.currentTarget.style.borderColor = '#ffffff'; },
                        onmouseout: (e) => { e.currentTarget.style.borderColor = '#888888'; }
                    }, [
                        '<Logout ',
                        $.span({ style: 'opacity: 0.7;' }, ['Esc />']),
                    ])
                ])
            ]);
        }
        
        createTransactionHistory() {
            // Use the new TransactionHistory component
            const transactionHistory = new TransactionHistory(this.app);
            return transactionHistory.render();
            
            // Original implementation below (kept for reference but unreachable)
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0',
                    padding: 'calc(24px * var(--scale-factor))'
                }
            }, [
                // Section header
                $.div({ 
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    $.h3({ 
                        style: {
                            fontSize: 'calc(16px * var(--scale-factor))',
                            color: 'var(--text-primary)',
                            margin: '0',
                            fontWeight: '600'
                        }
                    }, ['Recent Transactions']),
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-dim)',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(12px * var(--scale-factor))',
                            padding: 'calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => this.handleFilter(),
                        onmouseover: function() {
                            this.style.borderColor = 'var(--text-primary)';
                            this.style.color = 'var(--text-primary)';
                        },
                        onmouseout: function() {
                            this.style.borderColor = 'var(--border-color)';
                            this.style.color = 'var(--text-dim)';
                        }
                    }, ['Filter'])
                ]),
                
                // Transaction list
                $.div({ 
                    id: 'transaction-list',
                    style: {
                        minHeight: 'calc(100px * var(--scale-factor))'
                    }
                }, [
                    this.createEmptyTransactions()
                ])
            ]);
        }
        
        createEmptyTransactions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    textAlign: 'center',
                    padding: 'calc(40px * var(--scale-factor))',
                    color: 'var(--text-dim)',
                    fontFamily: "'JetBrains Mono', monospace"
                }
            }, [
                $.div({ 
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['No transactions yet']),
                $.div({ 
                    style: {
                        fontSize: 'calc(12px * var(--scale-factor))',
                        opacity: '0.7'
                    }
                }, ['Your transaction history will appear here'])
            ]);
        }
        
        // Missing dashboard component methods
        createStatusBanner() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                style: {
                    background: 'rgba(245, 115, 21, 0.1)',
                    border: '1px solid var(--text-primary)',
                    borderRadius: '0',
                    padding: 'calc(16px * var(--scale-factor))',
                    marginBottom: 'calc(24px * var(--scale-factor))',
                    textAlign: 'center'
                }
            }, [
                $.div({ 
                    style: {
                        color: 'var(--text-primary)',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        lineHeight: '1.5'
                    }
                }, [
                    $.span({ style: { fontWeight: '600' } }, ['Spark Protocol Active']),
                    ' • Lightning Network Ready • ',
                    $.span({ style: { color: 'var(--text-keyword)' } }, ['Live Data'])
                ])
            ]);
        }
        
        createWalletTypeSelector() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'terminal-box',
                style: 'margin-bottom: 20px; background: #1a1a1a; border: 1px solid #333333; border-radius: 0;'
            }, [
                $.div({ 
                    className: 'terminal-header',
                    style: 'padding: 12px; border-bottom: 1px solid #333333; font-family: JetBrains Mono, monospace; font-size: 14px;'
                }, [
                    $.span({}, ['~/moosh/wallet-selector $']),
                    $.span({ 
                        className: 'text-keyword',
                        id: 'walletSelectorStatus',
                        className: 'text-primary', style: 'margin-left: 8px;'
                    }, ['active'])
                ]),
                $.div({ 
                    className: 'terminal-content',
                    style: 'padding: 16px;'
                }, [
                    $.div({ style: 'margin-bottom: 12px;' }, [
                        $.label({ 
                            style: 'color: #ffffff; font-size: 12px; font-weight: 600; margin-bottom: 8px; display: block;'
                        }, ['Select Active Wallet:']),
                        $.select({
                            id: 'walletTypeSelector',
                            className: 'terminal-select',
                            style: 'width: 100%; background: #000000; border: 2px solid #ffffff; border-radius: 0; color: #ffffff; font-family: JetBrains Mono, monospace; font-size: 12px; padding: 8px; cursor: pointer; transition: all 0.2s ease;',
                            onchange: (e) => this.switchWalletType(e),
                            onmouseover: (e) => { e.target.style.borderColor = '#ff8c42'; e.target.style.background = '#000000'; },
                            onmouseout: (e) => { e.target.style.borderColor = '#ffffff'; e.target.style.background = '#000000'; },
                            onfocus: (e) => { e.target.style.borderColor = '#ff8c42'; e.target.style.boxShadow = '0 0 0 1px #ff8c42'; e.target.style.background = '#000000'; },
                            onblur: (e) => { e.target.style.borderColor = '#ffffff'; e.target.style.boxShadow = 'none'; e.target.style.background = '#000000'; }
                        }, [
                            $.option({ value: 'taproot' }, ['Bitcoin Taproot (bc1p...) - Primary']),
                            $.option({ value: 'nativeSegWit' }, ['Bitcoin Native SegWit (bc1q...) - BIP84']),
                            $.option({ value: 'nestedSegWit' }, ['Bitcoin Nested SegWit (3...) - BIP49']),
                            $.option({ value: 'legacy' }, ['Bitcoin Legacy (1...) - BIP44']),
                            $.option({ value: 'spark' }, ['Spark Protocol (sp1...) - Lightning'])
                        ])
                    ]),
                    
                    $.div({ 
                        id: 'selectedWalletDisplay',
                        style: 'margin-top: 12px;'
                    }, [
                        $.div({ 
                            style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;'
                        }, [
                            $.span({ 
                                style: 'color: #888888; font-size: 11px;',
                                id: 'selectedWalletLabel'
                            }, ['Bitcoin Taproot Address:']),
                            $.span({ 
                                style: 'color: #ffffff; font-size: 11px;',
                                id: 'selectedWalletBalance'
                            }, ['0.00000000 BTC'])
                        ]),
                        $.div({ 
                            style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: 8px; font-family: JetBrains Mono, monospace; word-break: break-all; color: #f57315; font-size: 11px; cursor: pointer; transition: all 0.2s ease; min-height: 20px;',
                            id: 'selectedWalletAddress',
                            onclick: () => this.openSelectedWalletExplorer(),
                            onmouseover: (e) => { e.target.style.borderColor = '#ff8c42'; e.target.style.color = '#ff8c42'; },
                            onmouseout: (e) => { e.target.style.borderColor = '#f57315'; e.target.style.color = '#f57315'; }
                        }, [this.getCurrentWalletAddress()])
                    ])
                ])
            ]);
        }
        
        createStatsGrid() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ 
                className: 'stats-grid',
                style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(calc(160px * var(--scale-factor)), 1fr)); gap: calc(12px * var(--scale-factor)); margin-bottom: calc(20px * var(--scale-factor));'
            }, [
                // Bitcoin Balance
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Bitcoin Balance']),
                    $.div({ 
                        id: 'btcBalance',
                        className: 'text-primary',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315; word-break: break-all;'
                    }, ['Loading...']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, [
                        '≈ ', 
                        $.span({ id: 'currencySymbol' }, ['$']),
                        $.span({ id: 'btcUsdValue' }, ['...']), 
                        ' ', 
                        $.span({ id: 'currencyCode' }, ['USD'])
                    ])
                ]),
                
                // Lightning Balance
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Lightning Balance']),
                    $.div({ 
                        id: 'lightningBalance',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315;'
                    }, ['0 sats']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, [$.span({ id: 'activeChannels' }, ['0']), ' active channels'])
                ]),
                
                // Stablecoins
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Stablecoins']),
                    $.div({ 
                        id: 'stablecoinBalance',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315;'
                    }, ['0 USDT']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['On Lightning Network'])
                ]),
                
                // Ordinals (NFTs)
                $.div({ 
                    id: 'ordinalsSection',
                    className: 'stats-grid-item',
                    style: `background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden; display: ${this.shouldShowOrdinals() ? 'block' : 'none'}; cursor: pointer;`,
                    onclick: () => this.openOrdinalsGallery(),
                    onmouseover: (e) => { e.currentTarget.style.borderColor = '#ff8c42'; e.currentTarget.style.background = '#1a1a1a'; },
                    onmouseout: (e) => { e.currentTarget.style.borderColor = '#f57315'; e.currentTarget.style.background = '#000000'; }
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Ordinals (NFTs)']),
                    $.div({ 
                        id: 'ordinalsCount',
                        className: 'text-accent',
                        style: 'font-size: calc(14px * var(--scale-factor)); font-weight: 600; color: #f57315;'
                    }, ['0 NFTs']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['Click to view gallery'])
                ]),
                
                // Network Status
                $.div({ 
                    className: 'stats-grid-item',
                    style: 'background: #000000; border: 2px solid #f57315; border-radius: 0; padding: calc(12px * var(--scale-factor)); transition: all 0.3s ease; overflow: hidden;'
                }, [
                    $.div({ style: 'color: #888888; margin-bottom: calc(6px * var(--scale-factor)); font-size: calc(12px * var(--scale-factor));' }, ['Network Status']),
                    $.div({ 
                        id: 'sparkNetworkStatus',
                        className: 'text-primary',
                        style: 'font-size: calc(14px * var(--scale-factor));'
                    }, ['Connected']),
                    $.div({ 
                        style: 'font-size: calc(10px * var(--scale-factor)); margin-top: calc(4px * var(--scale-factor)); color: #888888;'
                    }, ['Block ', $.span({ id: 'blockHeight' }, ['000000'])])
                ])
            ]);
        }
        
        createStatCard(title, primary, secondary, iconClass) {
            // No longer needed
            return null;
        }
        
        shouldShowOrdinals() {
            // Check if current wallet type is taproot
            const selectedWalletType = this.app.state.get('selectedWalletType') || 
                                       localStorage.getItem('selectedWalletType') || 
                                       'taproot'; // Default to taproot
            
            console.log('[Dashboard] Should show ordinals? Wallet type:', selectedWalletType);
            return selectedWalletType === 'taproot';
        }
        
        createSparkProtocolSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'spark-protocol-section' }, [
                $.div({ className: 'spark-header' }, [
                    $.h3({ className: 'spark-title' }, ['Spark Protocol Terminal']),
                    $.button({
                        className: 'spark-toggle',
                        onclick: () => this.toggleSparkTerminal()
                    }, ['Toggle'])
                ]),
                $.div({ id: 'spark-terminal', className: 'spark-terminal hidden' }, [
                    $.div({ className: 'terminal-output' }, [
                        $.div({ className: 'terminal-line' }, ['> Spark Protocol v2.0.0 initialized']),
                        $.div({ className: 'terminal-line' }, ['> Connection: ACTIVE']),
                        $.div({ className: 'terminal-line' }, ['> Nodes: 12 connected']),
                        $.div({ className: 'terminal-line' }, ['> Privacy: MAXIMUM'])
                    ]),
                    $.input({
                        className: 'terminal-input',
                        placeholder: 'Enter Spark command...',
                        onkeypress: (e) => {
                            if (e.key === 'Enter') this.handleSparkCommand(e.target.value);
                        }
                    })
                ])
            ]);
        }
        
        createNetworkCard() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({ className: 'token-card network-card' }, [
                $.div({ className: 'token-name' }, ['Network']),
                $.div({ className: 'network-status' }, ['● Connected']),
                $.div({ className: 'network-block' }, ['Block 000000'])
            ]);
        }
        
        // New event handlers
        handleWalletTypeChange(e) {
            const walletType = e.target.value;
            this.app.showNotification(`Switching to ${walletType} wallet...`, 'success');
            
            // Show/hide ordinals based on wallet type
            const ordinalsCard = document.querySelector('.ordinals-icon')?.parentElement?.parentElement;
            if (ordinalsCard) {
                ordinalsCard.style.display = walletType === 'taproot' ? 'flex' : 'none';
            }
            
            // Store selected wallet type
            if (this.app.state) {
                this.app.state.set('selectedWalletType', walletType);
            }
        }
        
        toggleSparkTerminal() {
            const terminal = document.getElementById('spark-terminal');
            if (terminal) {
                terminal.classList.toggle('hidden');
                this.app.showNotification(
                    terminal.classList.contains('hidden') ? 'Spark terminal hidden' : 'Spark terminal shown',
                    'success'
                );
            }
        }
        
        handleSparkCommand(command) {
            const terminal = document.querySelector('.terminal-output');
            const input = document.querySelector('.terminal-input');
            
            if (!terminal || !input) return;
            
            // Add user command to terminal
            const userLine = document.createElement('div');
            userLine.className = 'terminal-line';
            userLine.style.color = '#00ff00';
            userLine.textContent = `> ${command}`;
            terminal.appendChild(userLine);
            
            // Process command
            let response = '';
            const cmd = command.toLowerCase().trim();
            
            if (cmd === 'help') {
                response = 'Available commands: status, balance, network, privacy, clear, help';
            } else if (cmd === 'status') {
                response = 'Spark Protocol: ACTIVE | Privacy: MAXIMUM | Nodes: 12';
            } else if (cmd === 'balance') {
                const btcBalance = document.getElementById('btc-balance')?.textContent || '0.00000000';
                response = `Current balance: ${btcBalance} BTC`;
            } else if (cmd === 'network') {
                const networkBlock = document.querySelector('.network-block')?.textContent || 'Unknown';
                response = `Network: Mainnet | ${networkBlock}`;
            } else if (cmd === 'privacy') {
                response = 'Privacy mode: ENABLED | Tor: ACTIVE | VPN: CONNECTED';
            } else if (cmd === 'clear') {
                terminal.innerHTML = '';
                response = 'Terminal cleared.';
            } else if (cmd === '') {
                response = '';
            } else {
                response = `Unknown command: ${command}. Type 'help' for available commands.`;
            }
            
            // Add response to terminal
            if (response) {
                const responseLine = document.createElement('div');
                responseLine.className = 'terminal-line';
                responseLine.style.color = '#888888';
                responseLine.textContent = response;
                terminal.appendChild(responseLine);
            }
            
            // Clear input
            input.value = '';
            
            // Scroll to bottom
            terminal.scrollTop = terminal.scrollHeight;
            
            this.app.showNotification('Command executed', 'success');
        }
        
        // Dashboard action handlers
        handleTokenMenu() {
            const modal = new TokenMenuModal(this.app);
            modal.show();
        }
        
        toggleAccountDropdown() {
            const modal = new MultiAccountModal(this.app);
            modal.show();
        }
        
        handleAddAccount() {
            const modal = new MultiAccountModal(this.app);
            modal.show();
        }
        
        async handleRefresh() {
            this.app.showNotification('Refreshing wallet data...', 'success');
            
            try {
                // Fetch Bitcoin price
                const priceData = await this.app.apiService.fetchBitcoinPrice();
                console.log('[Dashboard] Price data received:', priceData);
                // Handle both nested and flat response structures
                const btcPrice = priceData?.bitcoin?.usd || priceData?.usd || 0;
                console.log('[Dashboard] BTC price extracted:', btcPrice);
                
                // Get current account
                const currentAccount = this.app.state.getCurrentAccount();
                if (currentAccount && currentAccount.addresses) {
                    // Fetch balance for the current address type
                    const walletType = this.app.state.get('selectedWalletType') || 'taproot';
                    let address = currentAccount.addresses.taproot;
                    
                    if (walletType === 'segwit') address = currentAccount.addresses.segwit;
                    else if (walletType === 'legacy') address = currentAccount.addresses.legacy;
                    
                    const balanceData = await this.app.apiService.fetchAddressBalance(address);
                    const btcBalance = balanceData.balance / 100000000; // Convert from satoshis
                    const usdBalance = (btcBalance * btcPrice).toFixed(2);
                    
                    // Update UI - check both ID variations
                    const btcElement = document.getElementById('btc-balance') || document.getElementById('btcBalance');
                    const usdElement = document.getElementById('usd-balance') || document.getElementById('btcUsdValue');
                    
                    if (btcElement) {
                        if (btcElement.id === 'btcBalance') {
                            btcElement.textContent = btcBalance.toFixed(8) + ' BTC';
                        } else {
                            btcElement.textContent = btcBalance.toFixed(8);
                        }
                    }
                    if (usdElement) {
                        if (usdElement.id === 'btcUsdValue') {
                            usdElement.textContent = usdBalance;
                        } else {
                            usdElement.textContent = usdBalance;
                        }
                    }
                    
                    // Update stats grid
                    const networkInfo = await this.app.apiService.fetchNetworkInfo();
                    const networkCard = document.querySelector('.network-block');
                    if (networkCard) {
                        networkCard.textContent = `Block ${networkInfo.height || '000000'}`;
                    }
                    
                    // Update network status elements
                    const sparkNetworkStatus = document.getElementById('sparkNetworkStatus');
                    if (sparkNetworkStatus) {
                        sparkNetworkStatus.textContent = networkInfo.connected ? 'Connected' : 'Disconnected';
                        sparkNetworkStatus.style.color = networkInfo.connected ? 'var(--primary)' : '#ff3333';
                    }
                    
                    const blockHeightElement = document.getElementById('blockHeight');
                    if (blockHeightElement) {
                        blockHeightElement.textContent = networkInfo.height ? networkInfo.height.toLocaleString() : '000000';
                    }
                    
                    this.app.showNotification('Wallet data refreshed!', 'success');
                } else {
                    this.app.showNotification('No wallet selected', 'error');
                }
            } catch (error) {
                console.error('Refresh error:', error);
                this.app.showNotification('Failed to refresh data', 'error');
            }
        }
        
        handlePrivacyToggle() {
            const balances = document.querySelectorAll('.btc-value, #usd-balance, .token-amount');
            const isHidden = balances[0]?.textContent === '••••••••';
            
            balances.forEach(el => {
                if (isHidden) {
                    // Show real values - restore from data-original attribute
                    const originalValue = el.getAttribute('data-original');
                    if (originalValue) {
                        el.textContent = originalValue;
                    }
                } else {
                    // Hide values
                    el.textContent = '••••••••';
                }
            });
            
            this.app.showNotification(isHidden ? 'Balances shown' : 'Balances hidden', 'success');
        }
        
        handleSend() {
            this.showSendModal();
        }
        
        handleReceive() {
            this.showReceiveModal();
        }
        
        handleSwap() {
            const modal = new SwapModal(this.app);
            modal.show();
        }
        
        handleSettings() {
            const modal = new WalletSettingsModal(this.app);
            modal.show();
        }
        
        handleFilter() {
            const modal = new TransactionHistoryModal(this.app);
            modal.show();
        }
        
        initializeDashboard() {
            // Add dashboard-specific styles
            this.addDashboardStyles();
            
            // Mount the AccountSwitcher component
            const accountSwitcherContainer = document.getElementById('accountSwitcherContainer');
            if (accountSwitcherContainer) {
                this.accountSwitcher = new AccountSwitcher(this.app);
                this.accountSwitcher.mount(accountSwitcherContainer);
                console.log('[Dashboard] AccountSwitcher mounted successfully');
            } else {
                console.log('[Dashboard] AccountSwitcher container not found');
            }
            
            // Start data loading
            setTimeout(() => {
                this.loadWalletData();
            }, 500);
        }
        
        addDashboardStyles() {
            const style = document.createElement('style');
            style.textContent = `
                /* Dashboard Container */
                .wallet-dashboard-container {
                    max-width: calc(800px * var(--scale-factor));
                    margin: 0 auto;
                    padding: calc(var(--spacing-unit) * 2 * var(--scale-factor));
                }
                
                /* Dashboard Header */
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: calc(16px * var(--scale-factor));
                    border-bottom: calc(1px * var(--scale-factor)) solid var(--border-color);
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .terminal-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(18px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                }
                
                .title-text {
                    color: var(--text-primary);
                }
                
                .cursor-blink {
                    color: var(--text-primary);
                    animation: blink 1s infinite;
                    margin-left: calc(2px * var(--scale-factor));
                }
                
                .header-actions {
                    display: flex;
                    gap: calc(12px * var(--scale-factor));
                    align-items: center;
                }
                
                .account-dropdown-btn {
                    background: transparent;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    padding: calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: calc(8px * var(--scale-factor));
                    transition: all 0.2s ease;
                }
                
                .account-dropdown-btn:hover {
                    border-color: var(--text-primary);
                }
                
                .dropdown-arrow {
                    font-size: calc(10px * var(--scale-factor));
                    opacity: 0.7;
                }
                
                .header-buttons {
                    display: flex;
                    gap: calc(8px * var(--scale-factor));
                }
                
                .header-btn {
                    background: transparent;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    width: calc(32px * var(--scale-factor));
                    height: calc(32px * var(--scale-factor));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: calc(16px * var(--scale-factor));
                    transition: all 0.2s ease;
                }
                
                .header-btn:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }
                
                /* Balance Section */
                .balance-section {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(24px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .primary-balance {
                    text-align: center;
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .balance-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-bottom: calc(8px * var(--scale-factor));
                }
                
                .balance-amount {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(32px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                    line-height: 1.2;
                }
                
                .btc-unit {
                    font-size: calc(18px * var(--scale-factor));
                    margin-left: calc(4px * var(--scale-factor));
                }
                
                .balance-usd {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(14px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-top: calc(8px * var(--scale-factor));
                }
                
                .token-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(calc(120px * var(--scale-factor)), 1fr));
                    gap: calc(16px * var(--scale-factor));
                    padding-top: calc(24px * var(--scale-factor));
                    border-top: calc(1px * var(--scale-factor)) solid var(--border-color);
                }
                
                .token-card {
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(12px * var(--scale-factor));
                    text-align: center;
                    transition: all 0.2s ease;
                }
                
                .token-card:hover {
                    border-color: var(--text-primary);
                }
                
                .token-name {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .token-amount {
                    font-size: calc(16px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                }
                
                .token-value {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-top: calc(4px * var(--scale-factor));
                }
                
                /* Quick Actions */
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(calc(120px * var(--scale-factor)), 1fr));
                    gap: calc(16px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .action-button {
                    background: var(--bg-primary);
                    border: calc(2px * var(--scale-factor)) solid var(--text-primary);
                    color: var(--text-primary);
                    padding: calc(20px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .action-button:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }
                
                .action-icon {
                    font-size: calc(24px * var(--scale-factor));
                    margin-bottom: calc(8px * var(--scale-factor));
                }
                
                .action-label {
                    font-size: calc(14px * var(--scale-factor));
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                /* Transaction History */
                .transaction-history {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(24px * var(--scale-factor));
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: calc(16px * var(--scale-factor));
                }
                
                .section-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(16px * var(--scale-factor));
                    color: var(--text-primary);
                    margin: 0;
                    font-weight: 600;
                }
                
                .filter-button {
                    background: transparent;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-dim);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    padding: calc(8px * var(--scale-factor)) calc(12px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .filter-button:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }
                
                .empty-transactions {
                    text-align: center;
                    padding: calc(40px * var(--scale-factor));
                    color: var(--text-dim);
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .empty-text {
                    font-size: calc(14px * var(--scale-factor));
                    margin-bottom: calc(8px * var(--scale-factor));
                }
                
                .empty-subtext {
                    font-size: calc(12px * var(--scale-factor));
                    opacity: 0.7;
                }
                
                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        gap: calc(16px * var(--scale-factor));
                        align-items: stretch;
                    }
                    
                    .header-actions {
                        justify-content: space-between;
                    }
                    
                    .balance-amount {
                        font-size: calc(24px * var(--scale-factor));
                    }
                    
                    .quick-actions {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Add additional styles for new dashboard components
            const additionalStyles = document.createElement('style');
            additionalStyles.textContent = `
                /* Status Banner */
                .status-banner {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                    padding: calc(12px * var(--scale-factor));
                    margin-bottom: calc(16px * var(--scale-factor));
                    border-radius: 0;
                }
                
                .status-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(8px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(14px * var(--scale-factor));
                }
                
                .status-indicator {
                    color: #00ff00;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                /* Wallet Type Selector */
                .wallet-type-selector {
                    display: flex;
                    align-items: center;
                    gap: calc(12px * var(--scale-factor));
                    padding: calc(16px * var(--scale-factor));
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    margin-bottom: calc(16px * var(--scale-factor));
                }
                
                .selector-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(14px * var(--scale-factor));
                    color: var(--text-dim);
                }
                
                .wallet-type-dropdown {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    padding: calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(14px * var(--scale-factor));
                    cursor: pointer;
                    min-width: calc(150px * var(--scale-factor));
                }
                
                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: calc(16px * var(--scale-factor));
                    margin-bottom: calc(24px * var(--scale-factor));
                }
                
                .stat-card {
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(16px * var(--scale-factor));
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .stat-card:hover {
                    border-color: var(--text-primary);
                    transform: translateY(-2px);
                }
                
                .stat-icon {
                    width: calc(40px * var(--scale-factor));
                    height: calc(40px * var(--scale-factor));
                    background: var(--text-primary);
                    color: var(--bg-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: calc(20px * var(--scale-factor));
                    font-weight: bold;
                    margin-bottom: calc(12px * var(--scale-factor));
                }
                
                .stat-content {
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .stat-title {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .stat-primary {
                    font-size: calc(14px * var(--scale-factor));
                    color: var(--text-primary);
                    font-weight: 600;
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .stat-secondary {
                    font-size: calc(12px * var(--scale-factor));
                    color: var(--text-dim);
                }
                
                /* Spark Protocol Section */
                .spark-protocol-section {
                    background: var(--bg-secondary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(20px * var(--scale-factor));
                    margin-top: calc(24px * var(--scale-factor));
                }
                
                .spark-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: calc(16px * var(--scale-factor));
                }
                
                .spark-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(16px * var(--scale-factor));
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .spark-toggle {
                    background: var(--bg-primary);
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    color: var(--text-primary);
                    padding: calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .spark-toggle:hover {
                    background: var(--text-primary);
                    color: var(--bg-primary);
                }
                
                .spark-terminal {
                    background: #000;
                    border: calc(1px * var(--scale-factor)) solid var(--border-color);
                    padding: calc(16px * var(--scale-factor));
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    height: calc(200px * var(--scale-factor));
                    overflow-y: auto;
                }
                
                .spark-terminal.hidden {
                    display: none;
                }
                
                .terminal-output {
                    margin-bottom: calc(16px * var(--scale-factor));
                }
                
                .terminal-line {
                    color: #00ff00;
                    margin-bottom: calc(4px * var(--scale-factor));
                }
                
                .terminal-input {
                    background: transparent;
                    border: none;
                    color: #00ff00;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: calc(12px * var(--scale-factor));
                    width: 100%;
                    outline: none;
                }
                
                /* Fix header button overflow */
                .dashboard-header {
                    position: relative;
                    overflow: visible !important;
                }
                
                .header-buttons {
                    display: flex;
                    gap: calc(8px * var(--scale-factor));
                    flex-shrink: 0;
                }
                
                .header-btn {
                    flex-shrink: 0;
                    box-sizing: border-box;
                }
                
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `;
            document.head.appendChild(additionalStyles);
        }
        
        loadWalletData() {
            // Placeholder for API integration
            this.app.showNotification('Wallet data loaded', 'success');
        }
        
        // Dashboard event handlers
        showMultiAccountManager() {
            const modal = new AccountListModal(this.app);
            modal.show();
        }
        
        getAccountDisplayName() {
            const accounts = this.app.state.get('accounts') || [];
            const currentAccountId = this.app.state.get('currentAccountId');
            
            console.log('[Dashboard] Getting account display name - accounts:', accounts.length, 'currentId:', currentAccountId);
            
            if (accounts.length === 0) {
                // Check if we have a legacy wallet without multi-account support
                const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                const hasLegacyWallet = sparkWallet.addresses || this.app.state.get('currentWallet')?.isInitialized;
                
                if (hasLegacyWallet) {
                    return 'Account 1'; // Default for legacy single account
                }
                return 'No Account';
            }
            
            const currentAccount = accounts.find(acc => acc.id === currentAccountId);
            console.log('[Dashboard] Current account:', currentAccount);
            
            return currentAccount ? `Active: ${currentAccount.name}` : 'Active: Account 1';
        }
        
        createLockIcon() {
            const $ = window.ElementFactory || ElementFactory;
            const isHidden = this.app.state.get('isBalanceHidden');
            
            // Create square lock icon
            return $.div({
                style: {
                    width: '20px',
                    height: '20px',
                    border: '2px solid currentColor',
                    borderRadius: '0',
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }, [
                isHidden ? null : $.div({
                    style: {
                        width: '8px',
                        height: '8px',
                        background: 'currentColor',
                        borderRadius: '0'
                    }
                })
            ]);
        }
        
        toggleBalanceVisibility() {
            // Toggle the hidden state
            const isHidden = this.app.state.get('isBalanceHidden');
            this.app.state.set('isBalanceHidden', !isHidden);
            
            // Get all balance elements
            const btcBalance = document.getElementById('btcBalance');
            const btcUsdValue = document.getElementById('btcUsdValue');
            const lightningBalance = document.getElementById('lightningBalance');
            const stablecoinBalance = document.getElementById('stablecoinBalance');
            const ordinalsCount = document.getElementById('ordinalsCount');
            
            if (!isHidden) {
                // Hide balances
                if (btcBalance) {
                    btcBalance.setAttribute('data-original', btcBalance.textContent);
                    btcBalance.textContent = '••••••••';
                }
                if (btcUsdValue) {
                    btcUsdValue.setAttribute('data-original', btcUsdValue.textContent);
                    btcUsdValue.textContent = '••••••••';
                }
                if (lightningBalance) {
                    lightningBalance.setAttribute('data-original', lightningBalance.textContent);
                    lightningBalance.textContent = '••••••••';
                }
                if (stablecoinBalance) {
                    stablecoinBalance.setAttribute('data-original', stablecoinBalance.textContent);
                    stablecoinBalance.textContent = '••••••••';
                }
                if (ordinalsCount) {
                    ordinalsCount.setAttribute('data-original', ordinalsCount.textContent);
                    ordinalsCount.textContent = '••••••••';
                }
            } else {
                // Show balances
                if (btcBalance) {
                    const original = btcBalance.getAttribute('data-original');
                    if (original) btcBalance.textContent = original;
                }
                if (btcUsdValue) {
                    const original = btcUsdValue.getAttribute('data-original');
                    if (original) btcUsdValue.textContent = original;
                }
                if (lightningBalance) {
                    const original = lightningBalance.getAttribute('data-original');
                    if (original) lightningBalance.textContent = original;
                }
                if (stablecoinBalance) {
                    const original = stablecoinBalance.getAttribute('data-original');
                    if (original) stablecoinBalance.textContent = original;
                }
                if (ordinalsCount) {
                    const original = ordinalsCount.getAttribute('data-original');
                    if (original) ordinalsCount.textContent = original;
                }
                
                // Refresh balances to get latest values
                if (this.refreshBalances) {
                    this.refreshBalances();
                }
            }
            
            // Update lock icon in all visibility toggle buttons
            const toggleButtons = document.querySelectorAll('.visibility-toggle');
            toggleButtons.forEach(button => {
                // Clear existing content
                button.innerHTML = '';
                // Add new lock icon
                const newIcon = this.createLockIcon();
                button.appendChild(newIcon);
            });
            
            this.app.showNotification(isHidden ? 'Balances shown' : 'Balances hidden', 'success');
        }
        
        switchWalletType(e) {
            const type = e.target.value;
            const label = document.getElementById('selectedWalletLabel');
            const address = document.getElementById('selectedWalletAddress');
            
            // Save selected wallet type
            this.app.state.set('selectedWalletType', type);
            localStorage.setItem('selectedWalletType', type);
            
            const typeLabels = {
                'taproot': 'Bitcoin Taproot Address:',
                'nativeSegWit': 'Bitcoin Native SegWit Address:',
                'nestedSegWit': 'Bitcoin Nested SegWit Address:',
                'legacy': 'Bitcoin Legacy Address:',
                'spark': 'Spark Protocol Address:'
            };
            
            if (label) label.textContent = typeLabels[type] || 'Bitcoin Address:';
            
            // Get the actual address for the selected type
            const currentAccount = this.app.state.getCurrentAccount();
            if (address && currentAccount && currentAccount.addresses) {
                const addressMap = {
                    'taproot': currentAccount.addresses.taproot || '',
                    'nativeSegWit': currentAccount.addresses.segwit || currentAccount.addresses.bitcoin || '',
                    'nestedSegWit': currentAccount.addresses.nestedSegwit || '',
                    'legacy': currentAccount.addresses.legacy || '',
                    'spark': currentAccount.addresses.spark || ''
                };
                
                let selectedAddress = addressMap[type] || '';
                
                // Special handling for Spark addresses - check sparkWallet if missing
                if (type === 'spark' && (!selectedAddress || selectedAddress === '')) {
                    const sparkWallet = JSON.parse(localStorage.getItem('sparkWallet') || '{}');
                    if (sparkWallet.addresses?.spark) {
                        selectedAddress = sparkWallet.addresses.spark;
                    }
                }
                
                address.textContent = selectedAddress || 'Not available';
            }
            
            // Show/hide ordinals section for taproot
            const ordinalsSection = document.getElementById('ordinalsSection');
            if (ordinalsSection) {
                if (type === 'taproot') {
                    console.log('[Dashboard] Switching to taproot - showing ordinals section');
                    ordinalsSection.style.display = 'block';
                    // Fetch ordinals count when switching to taproot
                    if (this.fetchOrdinalsCount) {
                        this.fetchOrdinalsCount().catch(err => {
                            console.error('[Dashboard] Failed to fetch ordinals on wallet switch:', err);
                        });
                    }
                } else {
                    ordinalsSection.style.display = 'none';
                }
            }
            
            // Update the main address display
            this.updateAddressDisplay();
            
            this.app.showNotification(`Switched to ${type} wallet`, 'success');
        }
        
        openSelectedWalletExplorer() {
            const addressElement = document.getElementById('selectedWalletAddress');
            if (!addressElement || !addressElement.textContent) {
                this.app.showNotification('No address selected', 'error');
                return;
            }
            
            const address = addressElement.textContent;
            const selectedType = this.app.state.get('selectedWalletType') || localStorage.getItem('selectedWalletType') || 'nativeSegWit';
            
            let explorerUrl = '';
            
            // Choose explorer based on wallet type
            if (selectedType === 'spark') {
                // Spark Protocol uses their own explorer
                explorerUrl = `https://sparkscan.io/address/${address}`;
            } else {
                // All Bitcoin address types use Mempool.space
                explorerUrl = `https://mempool.space/address/${address}`;
            }
            
            // Open in new tab
            window.open(explorerUrl, '_blank');
            this.app.showNotification('Opening blockchain explorer...', 'success');
        }
        
        showSendPayment() {
            const modal = new SendPaymentModal(this.app);
            modal.show();
        }
        
        showReceivePayment() {
            const modal = new ReceivePaymentModal(this.app);
            modal.show();
        }
        
        showTokenMenu() {
            const modal = new TokenMenuModal(this.app);
            modal.show();
        }
        
        showOrdinalsTerminal() {
            const modal = new OrdinalsModal(this.app);
            modal.show();
        }
        
        showTransactionHistory() {
            const modal = new TransactionHistoryModal(this.app);
            modal.show();
        }
        
        showWalletSettings() {
            console.log('[DashboardPage] showWalletSettings called');
            // First verify password before showing settings
            this.showPasswordVerification(() => {
                console.log('[DashboardPage] Password verified, showing settings modal');
                // Password verified, show settings modal
                const modal = new WalletSettingsModal(this.app);
                modal.show();
            });
        }
        
        // Static method to show wallet settings from anywhere
        static showWalletSettingsStatic(app) {
            console.log('[DashboardPage] showWalletSettingsStatic called');
            const dashboard = new DashboardPage(app);
            dashboard.showWalletSettings();
        }
        
        showPasswordVerification(onSuccess) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Get current theme
            const isMooshMode = document.body.classList.contains('moosh-mode');
            const themeColor = isMooshMode ? '#69fd97' : '#f57315';
            const borderColor = isMooshMode ? '#232b2b' : '#333333';
            
            // Create password verification modal
            const passwordOverlay = $.div({ 
                className: 'modal-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '10000'
                },
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({ 
                    className: 'modal-container password-modal',
                    style: {
                        background: 'var(--bg-primary)',
                        border: `2px solid ${themeColor}`,
                        borderRadius: '0',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '400px'
                    }
                }, [
                    $.div({ 
                        className: 'modal-header',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }
                    }, [
                        $.h2({ 
                            className: 'modal-title',
                            style: {
                                color: themeColor,
                                fontSize: '18px',
                                margin: '0'
                            }
                        }, ['Password Required']),
                        $.button({
                            className: 'modal-close',
                            style: {
                                background: 'none',
                                border: 'none',
                                color: themeColor,
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '0',
                                width: '30px',
                                height: '30px'
                            },
                            onclick: () => passwordOverlay.remove()
                        }, ['×'])
                    ]),
                    
                    $.div({ 
                        className: 'modal-body',
                        style: { padding: '20px 0' }
                    }, [
                        $.p({
                            style: {
                                color: '#888888',
                                marginBottom: '20px',
                                fontSize: '14px'
                            }
                        }, ['Enter your wallet password to access settings']),
                        
                        $.input({
                            type: 'password',
                            id: 'settingsPasswordInput',
                            placeholder: 'Enter password',
                            style: {
                                width: '100%',
                                padding: '12px',
                                background: 'var(--bg-primary)',
                                border: `2px solid ${themeColor}`,
                                color: themeColor,
                                fontSize: '14px',
                                borderRadius: '0',
                                outline: 'none'
                            },
                            onkeydown: (e) => {
                                if (e.key === 'Enter') {
                                    this.verifyPasswordForSettings(passwordOverlay, onSuccess);
                                }
                            }
                        }),
                        
                        $.div({
                            id: 'passwordErrorMsg',
                            style: {
                                color: '#ff4444',
                                fontSize: '12px',
                                marginTop: '10px',
                                display: 'none'
                            }
                        })
                    ]),
                    
                    $.div({ 
                        className: 'modal-footer',
                        style: {
                            display: 'flex',
                            gap: '10px',
                            marginTop: '20px'
                        }
                    }, [
                        $.button({
                            className: 'btn btn-secondary',
                            style: {
                                flex: '1',
                                padding: '12px',
                                background: 'var(--bg-primary)',
                                border: `2px solid ${themeColor}`,
                                color: themeColor,
                                borderRadius: '0',
                                cursor: 'pointer'
                            },
                            onclick: () => passwordOverlay.remove()
                        }, ['Cancel']),
                        $.button({
                            className: 'btn btn-primary',
                            style: {
                                flex: '1',
                                padding: '12px',
                                background: themeColor,
                                border: `2px solid ${themeColor}`,
                                color: '#000000',
                                borderRadius: '0',
                                cursor: 'pointer',
                                fontWeight: '600'
                            },
                            onclick: () => this.verifyPasswordForSettings(passwordOverlay, onSuccess)
                        }, ['Verify'])
                    ])
                ])
            ]);
            
            document.body.appendChild(passwordOverlay);
            
            // Focus password input
            setTimeout(() => {
                const input = document.getElementById('settingsPasswordInput');
                if (input) input.focus();
            }, 100);
        }
        
        verifyPasswordForSettings(modalElement, onSuccess) {
            const passwordInput = document.getElementById('settingsPasswordInput');
            const errorMsg = document.getElementById('passwordErrorMsg');
            
            if (!passwordInput) return;
            
            const enteredPassword = passwordInput.value;
            const storedPassword = localStorage.getItem('walletPassword');
            
            if (!enteredPassword) {
                errorMsg.textContent = 'Please enter a password';
                errorMsg.style.display = 'block';
                return;
            }
            
            if (enteredPassword === storedPassword) {
                // Success - close modal and call success callback
                modalElement.remove();
                onSuccess();
            } else {
                // Failed - show error
                errorMsg.textContent = 'Incorrect password';
                errorMsg.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
        
        showStablecoinSwap() {
            this.app.modalManager.createSwapModal();
        }
        
        openLightningChannel() {
            this.app.modalManager.createLightningChannelModal();
        }
        
        createStablecoin() {
            this.app.showNotification('Opening stablecoin minting interface...', 'info');
            // TODO: Implement stablecoin minting
        }
        
        openOrdinalsGallery() {
            console.log('[Dashboard] Opening Ordinals gallery...');
            
            // Check if we have a taproot address
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount || !currentAccount.addresses?.taproot) {
                this.app.showNotification('No Taproot address found. Ordinals require a Taproot wallet.', 'error');
                return;
            }
            
            // Create and show the OrdinalsModal
            if (!this.app.ordinalsModal) {
                this.app.ordinalsModal = new OrdinalsModal(this.app);
            }
            
            this.app.ordinalsModal.show();
        }
        
        async fetchOrdinalsCount() {
            try {
                const currentAccount = this.app.state.getCurrentAccount();
                if (!currentAccount || !currentAccount.addresses?.taproot) {
                    return 0;
                }
                
                const address = currentAccount.addresses.taproot;
                console.log('[Dashboard] Fetching ordinals count for:', address);
                
                // Call the API to get real inscription count
                const response = await fetch(`${this.app.apiService.baseURL}/api/ordinals/inscriptions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ address }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    console.error('[Dashboard] Failed to fetch ordinals:', response.status);
                    return 0;
                }
                
                const result = await response.json();
                if (result.success) {
                    const count = result.data.inscriptions.length;
                    console.log('[Dashboard] Found inscriptions:', count);
                    
                    // Update the display immediately
                    const ordinalsCountElement = document.getElementById('ordinalsCount');
                    if (ordinalsCountElement) {
                        ordinalsCountElement.textContent = count > 0 ? `${count} NFTs` : '0 NFTs';
                    }
                    
                    // Show ordinals section if inscriptions exist
                    const ordinalsSection = document.getElementById('ordinalsSection');
                    if (ordinalsSection && count > 0) {
                        ordinalsSection.style.display = 'block';
                    }
                    
                    return count;
                }
                
                return 0;
            } catch (error) {
                console.error('[Dashboard] Failed to fetch ordinals count:', error);
                return 0;
            }
        }
        
        logout() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear unlock status from session
                sessionStorage.removeItem('walletUnlocked');
                
                // Navigate to home page
                this.app.router.navigate('home');
                this.app.showNotification('Logged out successfully', 'success');
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MODAL CLASSES
    // ═══════════════════════════════════════════════════════════════════════

    // Export to window
    window.WalletDetailsPage = WalletDetailsPage;

})(window);
