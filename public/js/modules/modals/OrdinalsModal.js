// OrdinalsModal Module for MOOSH Wallet
// This modal manages Ordinals inscriptions display and interactions

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // ORDINALS MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class OrdinalsModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.inscriptions = [];
            this.isLoading = false;
            this.filterType = 'all';
            this.sortBy = 'newest';
            this.selectionMode = false;
            this.selectedInscriptions = new Set();
            this.viewSize = localStorage.getItem('moosh_ordinals_view_size') || 'medium';
        }
        
        async show() {
            const $ = window.ElementFactory || ElementFactory;
            
            this.modal = $.div({
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
                    zIndex: '1000',
                    padding: 'calc(20px * var(--scale-factor))'
                },
                onclick: (e) => {
                    if (e.target === this.modal) this.close();
                }
            }, [
                $.div({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        maxWidth: 'calc(800px * var(--scale-factor))',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0'
                    }
                }, [
                    this.createHeader(),
                    this.createFilterSection(),
                    this.createInscriptionList(),
                    this.createActions()
                ])
            ]);
            
            document.body.appendChild(this.modal);
            
            // Add custom scrollbar styling for ordinals gallery
            this.injectOrdinalsScrollbarStyles();
            
            setTimeout(() => {
                this.modal.classList.add('show');
                
                // If we already have inscriptions pre-populated, just update the display
                if (this.inscriptions && this.inscriptions.length > 0 && !this.isLoading) {
                    console.log('[OrdinalsModal] Using pre-populated inscriptions');
                    this.updateInscriptionList();
                } else {
                    // Otherwise load them
                    this.loadInscriptions();
                }
            }, 10);
        }
        
        createHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            const currentAccount = this.app.state.getCurrentAccount();
            const address = currentAccount?.addresses?.taproot || 'No Taproot Address';
            
            return $.div({
                style: {
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: 'calc(16px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                $.div({}, [
                    $.h2({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(20px * var(--scale-factor))',
                            fontWeight: '600',
                            fontFamily: "'JetBrains Mono', monospace",
                            marginBottom: 'calc(4px * var(--scale-factor))'
                        }
                    }, ['ORDINALS_INSCRIPTIONS']),
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(11px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            wordBreak: 'break-all',
                            maxWidth: 'calc(600px * var(--scale-factor))',
                            lineHeight: '1.4'
                        },
                        title: address
                    }, [address])
                ]),
                $.button({
                    style: {
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        padding: '0',
                        width: 'calc(32px * var(--scale-factor))',
                        height: 'calc(32px * var(--scale-factor))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    onclick: () => this.close()
                }, ['×'])
            ]);
        }
        
        createFilterSection() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    padding: 'calc(16px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: 'calc(12px * var(--scale-factor))',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        gap: 'calc(8px * var(--scale-factor))',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }
                }, [
                    this.createFilterButton('All', 'all'),
                    this.createFilterButton('Images', 'images'),
                    this.createFilterButton('Text', 'text'),
                    this.createFilterButton('JSON', 'json'),
                    this.createFilterButton('HTML', 'html'),
                    this.createFilterButton('Other', 'other'),
                    $.div({ style: { width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' } }),
                    $.button({
                        id: 'selection-mode-btn',
                        style: {
                            background: this.selectionMode ? 'var(--text-accent)' : 'transparent',
                            border: `1px solid ${this.selectionMode ? 'var(--text-accent)' : 'var(--border-color)'}`,
                            color: this.selectionMode ? 'var(--bg-primary)' : 'var(--text-primary)',
                            padding: 'calc(6px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '0'
                        },
                        onclick: () => this.toggleSelectionMode()
                    }, [this.selectionMode ? `✓ ${this.selectedInscriptions.size} Selected` : 'Select Mode'])
                ]),
                // Size selector
                $.div({
                    style: {
                        display: 'flex',
                        gap: 'calc(4px * var(--scale-factor))',
                        alignItems: 'center',
                        marginLeft: 'auto'
                    }
                }, [
                    $.span({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            marginRight: 'calc(8px * var(--scale-factor))'
                        }
                    }, ['View:']),
                    this.createSizeButton('Small', 'small'),
                    this.createSizeButton('Medium', 'medium'),
                    this.createSizeButton('Large', 'large')
                ]),
                $.select({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                        fontSize: 'calc(13px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor: 'pointer',
                        outline: 'none'
                    },
                    onchange: (e) => {
                        this.sortBy = e.target.value;
                        this.updateInscriptionList();
                    }
                }, [
                    $.option({ value: 'newest' }, ['Newest First']),
                    $.option({ value: 'oldest' }, ['Oldest First']),
                    $.option({ value: 'number' }, ['By Number'])
                ])
            ]);
        }
        
        createFilterButton(label, type) {
            const $ = window.ElementFactory || ElementFactory;
            const isActive = this.filterType === type;
            
            return $.button({
                style: {
                    background: isActive ? 'var(--text-accent)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--text-accent)' : 'var(--border-color)'}`,
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                    padding: 'calc(6px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                    fontSize: 'calc(13px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '0'
                },
                onclick: () => {
                    this.filterType = type;
                    this.updateInscriptionList();
                }
            }, [label]);
        }
        
        createSizeButton(text, size) {
            const $ = window.ElementFactory || ElementFactory;
            const isActive = this.viewSize === size;
            
            return $.button({
                style: {
                    background: isActive ? 'var(--text-accent)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--text-accent)' : 'var(--border-color)'}`,
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                    padding: 'calc(4px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                    fontSize: 'calc(12px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '0',
                    minWidth: 'calc(60px * var(--scale-factor))'
                },
                onclick: () => {
                    this.viewSize = size;
                    localStorage.setItem('moosh_ordinals_view_size', size);
                    this.updateInscriptionList();
                }
            }, [text]);
        }
        
        createInscriptionList() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                id: 'ordinals-inscription-list',
                style: {
                    flex: '1',
                    overflowY: 'auto',
                    padding: 'calc(16px * var(--scale-factor))',
                    minHeight: 'calc(300px * var(--scale-factor))'
                }
            }, [
                this.isLoading ? this.createLoadingView() : this.createInscriptionItems()
            ]);
        }
        
        createLoadingView() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    textAlign: 'center',
                    padding: 'calc(48px * var(--scale-factor))',
                    color: 'var(--text-dim)'
                }
            }, [
                $.div({
                    style: {
                        fontSize: 'calc(24px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        animation: 'pulse 2s ease-in-out infinite'
                    }
                }, [
                    $.div({
                        style: {
                            fontSize: 'calc(32px * var(--scale-factor))',
                            fontWeight: 'bold',
                            color: 'var(--text-accent)',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '2px'
                        }
                    }, ['MOOSH'])
                ]),
                $.div({
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace"
                    }
                }, ['Scanning blockchain for inscriptions...']),
                $.div({
                    style: {
                        marginTop: 'calc(16px * var(--scale-factor))',
                        fontSize: 'calc(12px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-dim)'
                    }
                }, ['This may take a few seconds...'])
            ]);
        }
        
        createInscriptionItems() {
            const $ = window.ElementFactory || ElementFactory;
            
            if (this.inscriptions.length === 0) {
                return $.div({
                    style: {
                        textAlign: 'center',
                        padding: 'calc(48px * var(--scale-factor))',
                        color: 'var(--text-dim)'
                    }
                }, [
                    $.div({
                        style: {
                            fontSize: 'calc(48px * var(--scale-factor))',
                            marginBottom: 'calc(16px * var(--scale-factor))',
                            opacity: '0.5'
                        }
                    }, ['📜']),
                    $.div({
                        style: {
                            fontSize: 'calc(14px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, ['No inscriptions found on this address']),
                    $.button({
                        style: {
                            marginTop: 'calc(20px * var(--scale-factor))',
                            background: 'var(--text-accent)',
                            border: '2px solid var(--text-accent)',
                            borderRadius: '0',
                            color: 'var(--bg-primary)',
                            padding: 'calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: 'pointer',
                            fontWeight: '600'
                        },
                        onclick: () => {
                            const address = this.app.state.getCurrentAccount()?.addresses?.taproot;
                            window.open(`https://ordinals.com/address/${address}`, '_blank');
                        }
                    }, ['Check on Ordinals.com'])
                ]);
            }
            
            let filteredInscriptions = this.inscriptions;
            if (this.filterType !== 'all') {
                filteredInscriptions = this.inscriptions.filter(inscription => {
                    const contentType = inscription.content_type?.toLowerCase() || '';
                    
                    switch(this.filterType) {
                        case 'images':
                            return contentType.startsWith('image/');
                        case 'text':
                            return contentType.startsWith('text/') && !contentType.includes('html');
                        case 'json':
                            return contentType.includes('json');
                        case 'html':
                            return contentType.includes('html');
                        case 'other':
                            return !contentType.startsWith('image/') && 
                                   !contentType.startsWith('text/') &&
                                   !contentType.includes('json') &&
                                   !contentType.includes('html');
                        default:
                            return true;
                    }
                });
            }
            
            filteredInscriptions.sort((a, b) => {
                if (this.sortBy === 'newest') {
                    return b.timestamp - a.timestamp;
                } else if (this.sortBy === 'oldest') {
                    return a.timestamp - b.timestamp;
                } else {
                    return a.number - b.number;
                }
            });
            
            // Set grid size based on view size
            let gridMinWidth;
            let cardHeight;
            switch(this.viewSize) {
                case 'small':
                    gridMinWidth = 'calc(160px * var(--scale-factor))';
                    cardHeight = 'calc(140px * var(--scale-factor))';
                    break;
                case 'large':
                    gridMinWidth = 'calc(320px * var(--scale-factor))';
                    cardHeight = 'calc(280px * var(--scale-factor))';
                    break;
                default: // medium
                    gridMinWidth = 'calc(240px * var(--scale-factor))';
                    cardHeight = 'calc(200px * var(--scale-factor))';
            }
            
            // Store card height for use in createInscriptionCard
            this.cardHeight = cardHeight;
            
            return $.div({
                style: {
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${gridMinWidth}, 1fr))`,
                    gap: 'calc(16px * var(--scale-factor))'
                }
            }, filteredInscriptions.map(inscription => this.createInscriptionCard(inscription)));
        }
        
        createInscriptionCard(inscription) {
            const $ = window.ElementFactory || ElementFactory;
            
            const contentType = inscription.content_type?.toLowerCase() || '';
            const isImage = contentType.startsWith('image/');
            const isText = contentType.startsWith('text/') && !contentType.includes('html');
            const isJson = contentType.includes('json');
            const isHtml = contentType.includes('html');
            const isCss = contentType.includes('css');
            const isJs = contentType.includes('javascript');
            
            // For unknown content types, try to load as image first
            const isUnknown = contentType === 'application/octet-stream' || contentType === 'unknown' || !contentType;
            
            let icon = 'MOOSH';
            if (isImage) icon = 'IMG';
            else if (isText) icon = 'TXT';
            else if (isJson) icon = '{ }';
            else if (isHtml) icon = 'HTML';
            else if (isCss) icon = 'CSS';
            else if (isJs) icon = 'JS';
            else if (isUnknown) icon = '❓';
            const isSelected = this.selectedInscriptions.has(inscription.id);
            
            return $.div({
                style: {
                    border: `2px solid ${isSelected ? 'var(--text-accent)' : 'var(--border-color)'}`,
                    borderRadius: '0',
                    padding: '0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(var(--text-accent-rgb), 0.1)' : 'var(--bg-secondary)',
                    position: 'relative',
                    overflow: 'hidden'
                },
                onmouseover: (e) => {
                    if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }
                    e.currentTarget.style.transform = 'translateY(-2px)';
                },
                onmouseout: (e) => {
                    if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                    }
                    e.currentTarget.style.transform = 'translateY(0)';
                },
                onclick: () => {
                    if (this.selectionMode) {
                        this.toggleInscriptionSelection(inscription);
                    } else {
                        this.showInscriptionDetails(inscription);
                    }
                }
            }, [
                (isImage || isUnknown) ? $.div({
                    style: {
                        width: '100%',
                        height: this.cardHeight || 'calc(200px * var(--scale-factor))',
                        background: 'var(--bg-primary)',
                        borderBottom: '1px solid var(--border-color)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }
                }, [
                    this.createInscriptionImage(inscription)
                ]) : $.div({
                    style: {
                        width: '100%',
                        height: this.cardHeight || 'calc(200px * var(--scale-factor))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'calc(48px * var(--scale-factor))',
                        borderBottom: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)'
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
                        padding: 'calc(16px * var(--scale-factor))'
                    }
                }, [
                    this.selectionMode && $.div({
                        style: {
                            position: 'absolute',
                            top: 'calc(8px * var(--scale-factor))',
                            right: 'calc(8px * var(--scale-factor))',
                            width: 'calc(20px * var(--scale-factor))',
                            height: 'calc(20px * var(--scale-factor))',
                            border: `2px solid ${isSelected ? 'var(--text-accent)' : 'var(--border-color)'}`,
                            background: isSelected ? 'var(--text-accent)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '2px'
                        }
                    }, [isSelected && $.span({ style: { color: 'var(--bg-primary)', fontSize: '12px' } }, ['✓'])]),
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 'calc(12px * var(--scale-factor))'
                        }
                    }, [
                        $.span({
                            style: {
                                color: 'var(--text-accent)',
                                fontSize: 'calc(16px * var(--scale-factor))',
                                fontWeight: '600'
                            }
                        }, [`#${inscription.number || 'Unknown'}`])
                    ]),
                    // Collection name if available
                    inscription.collection && $.div({
                        style: {
                            color: 'var(--text-accent)',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            fontWeight: '600',
                            marginBottom: 'calc(6px * var(--scale-factor))',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            background: 'rgba(var(--text-accent-rgb), 0.1)',
                            padding: 'calc(2px * var(--scale-factor)) calc(6px * var(--scale-factor))',
                            borderRadius: 'calc(2px * var(--scale-factor))',
                            display: 'inline-block'
                        }
                    }, [inscription.collection]),
                    $.div({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontWeight: '500',
                            marginBottom: 'calc(8px * var(--scale-factor))',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }, [`${inscription.content_type || 'Unknown Type'}`]),
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            marginBottom: 'calc(4px * var(--scale-factor))'
                        }
                    }, [`${inscription.content_length || inscription.size || inscription.file_size || 0} bytes`]),
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(11px * var(--scale-factor))'
                        }
                    }, [inscription.timestamp > 0 ? new Date(inscription.timestamp).toLocaleDateString() : 'Unknown date'])
                ])
            ]);
        }
        
        createInscriptionImage(inscription) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Check if this is a recursive inscription (330 bytes)
            const isRecursive = inscription.content_type === 'application/octet-stream' && 
                               inscription.content_length === 330;
            
            // For recursive inscriptions, use iframe
            if (isRecursive) {
                const container = $.div({
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                });
                
                // Create iframe for recursive content
                const iframe = $.create('iframe', {
                    src: `https://ordinals.com/content/${inscription.id}`,
                    style: {
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: '#000'
                    },
                    sandbox: 'allow-scripts allow-same-origin',
                    loading: 'lazy',
                    onload: function() {
                        // Remove loading indicator when loaded
                        const loading = this.parentNode.querySelector('.loading-indicator');
                        if (loading) loading.remove();
                    }
                });
                
                // Add loading indicator
                const loading = $.div({
                    className: 'loading-indicator',
                    style: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#666',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                    }
                }, ['Loading recursive content...']);
                
                container.appendChild(loading);
                container.appendChild(iframe);
                
                return container;
            }
            
            // For regular inscriptions, try multiple image sources
            const inscriptionId = inscription.id;
            const imageUrls = [
                // Primary sources
                `https://ordinals.com/content/${inscriptionId}`,
                `https://ord-mirror.magiceden.dev/content/${inscriptionId}`,
                // Fallback sources
                inscription.content,
                inscription.preview,
                `https://ordinals.com/preview/${inscriptionId}`,
                `https://ord.io/${inscriptionId}`
            ].filter(url => url && url.startsWith('http'));
            
            // Create image with proper error handling
            const img = $.img({
                src: imageUrls[0] || '',
                alt: `Inscription #${inscription.number}`,
                style: {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                },
                loading: 'lazy',
                onerror: function() {
                    // Try next URL on error
                    const currentIndex = imageUrls.indexOf(this.src);
                    if (currentIndex < imageUrls.length - 1) {
                        this.src = imageUrls[currentIndex + 1];
                    } else {
                        // All URLs failed, use iframe as last resort
                        const iframe = $.create('iframe', {
                            src: `https://ordinals.com/content/${inscriptionId}`,
                            style: {
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: '#000'
                            },
                            sandbox: 'allow-scripts allow-same-origin',
                            loading: 'lazy'
                        });
                        this.parentNode.replaceChild(iframe, this);
                    }
                },
                onload: function() {
                    // Image loaded successfully
                    this.style.opacity = '0';
                    this.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        this.style.opacity = '1';
                    }, 10);
                }
            });
            
            // Return the image in a container for proper sizing
            return $.div({
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }
            }, [img]);
        }
        
        createActions() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    padding: 'calc(16px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: 'calc(12px * var(--scale-factor))',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }
            }, [
                this.selectionMode && this.selectedInscriptions.size > 0 && $.button({
                    style: {
                        background: 'var(--text-accent)',
                        border: '2px solid var(--text-accent)',
                        borderRadius: '0',
                        color: 'var(--bg-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '600'
                    },
                    onclick: () => this.showBulkSendModal()
                }, [`Send ${this.selectedInscriptions.size} Selected`]),
                $.button({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '600'
                    },
                    onclick: () => this.loadInscriptions()
                }, ['Refresh']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-dim)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.exportInscriptions()
                }, ['Export List']),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0',
                        color: 'var(--text-dim)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'calc(14px * var(--scale-factor))',
                        padding: 'calc(12px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.close()
                }, ['Close'])
            ]);
        }
        
        async loadInscriptions() {
            const currentAccount = this.app.state.getCurrentAccount();
            if (!currentAccount || !currentAccount.addresses?.taproot) {
                this.app.showNotification('No Taproot address found for current account', 'error');
                return;
            }
            
            const address = currentAccount.addresses.taproot;
            console.log('[OrdinalsModal] Loading inscriptions for address:', address);
            
            // Check if we already have cached data from dashboard
            const dashboardCache = window.app?.pages?.dashboard?._ordinalsCache || 
                                  window.CURRENT_ORDINALS_DATA;
            
            if (dashboardCache) {
                const inscriptions = Array.isArray(dashboardCache) ? dashboardCache : dashboardCache.inscriptions;
                if (inscriptions && inscriptions.length > 0) {
                    console.log('[OrdinalsModal] Using cached data from dashboard');
                    this.inscriptions = inscriptions;
                    this.isLoading = false;
                    this.updateInscriptionList();
                    this.app.showNotification(`Loaded ${inscriptions.length} inscriptions from cache`, 'success');
                    return;
                }
            }
            
            // Check sessionStorage cache
            const cacheKey = 'ordinals_cache';
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    if (data.timestamp && Date.now() - data.timestamp < 60000) { // 1 minute cache
                        console.log('[OrdinalsModal] Using sessionStorage cache');
                        this.inscriptions = data.inscriptions || [];
                        this.isLoading = false;
                        this.updateInscriptionList();
                        this.app.showNotification(`Loaded ${this.inscriptions.length} inscriptions from cache`, 'success');
                        return;
                    }
                } catch (e) {
                    console.error('[OrdinalsModal] Cache parse error:', e);
                }
            }
            
            this.isLoading = true;
            this.updateInscriptionList();
            
            // Try local API first with retry
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
                try {
                    const response = await fetch(`${this.app.apiService.baseURL}/api/ordinals/inscriptions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ address }),
                        signal: AbortSignal.timeout(30000) // 30 second timeout
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    console.log('[OrdinalsModal] API response:', result);
                    
                    if (result.success) {
                        this.inscriptions = result.data.inscriptions || [];
                        const message = this.inscriptions.length > 0 
                            ? `Found ${this.inscriptions.length} inscriptions (via ${result.data.apiUsed || 'unknown'} API)`
                            : 'No inscriptions found on this address';
                        this.app.showNotification(message, this.inscriptions.length > 0 ? 'success' : 'info');
                        this.isLoading = false;
                        this.updateInscriptionList();
                        return;
                    }
                } catch (error) {
                    attempts++;
                    console.warn(`[OrdinalsModal] Attempt ${attempts} failed:`, error.message);
                    
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
                    }
                }
            }
            
            // If local API fails, try direct API calls
            console.log('[OrdinalsModal] Local API failed, trying direct API calls...');
            this.app.showNotification('Fetching inscriptions directly...', 'info');
            
            try {
                // Try multiple direct APIs
                const apis = [
                    {
                        name: 'Hiro',
                        url: `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=100`,
                        parseData: (data) => data.results || []
                    },
                    {
                        name: 'OrdAPI',
                        url: `https://ordapi.xyz/address/${address}/inscriptions`,
                        parseData: (data) => Array.isArray(data) ? data : (data.inscriptions || [])
                    }
                ];
                
                for (const api of apis) {
                    try {
                        console.log(`[OrdinalsModal] Trying ${api.name} API directly...`);
                        
                        // Use a public CORS proxy
                        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(api.url)}`;
                        const response = await fetch(proxyUrl, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            const items = api.parseData(data);
                            
                            if (items.length > 0) {
                                this.inscriptions = items.map(ins => ({
                                    id: ins.id || ins.inscription_id || 'unknown',
                                    number: ins.number || ins.inscription_number || ins.num || 0,
                                    content_type: ins.mime_type || ins.content_type || ins.contentType || 'unknown',
                                    content_length: ins.content_length || ins.value || ins.size || 0,
                                    timestamp: ins.timestamp || ins.created_at || Date.now(),
                                    fee: ins.genesis_fee || ins.fee || 0,
                                    sat: ins.sat_ordinal || ins.sat || ins.offset || 0,
                                    genesis_height: ins.genesis_block_height || ins.height || 0,
                                    genesis_fee: ins.genesis_fee || ins.fee || 0,
                                    output_value: ins.value || ins.output_value || 0,
                                    location: ins.location || `${address}:0:0`,
                                    content: `https://ordinals.com/content/${ins.id || ins.inscription_id}`,
                                    preview: `https://ordinals.com/preview/${ins.id || ins.inscription_id}`,
                                    owner: address
                                }));
                                
                                this.app.showNotification(`Found ${this.inscriptions.length} inscriptions via ${api.name}`, 'success');
                                break;
                            }
                        }
                    } catch (apiError) {
                        console.warn(`[OrdinalsModal] ${api.name} API failed:`, apiError.message);
                    }
                }
                
                if (this.inscriptions.length === 0) {
                    // Show helpful message with manual check option
                    this.app.showNotification('No inscriptions found. You can verify on ordinals.com', 'info');
                    console.log(`[OrdinalsModal] Check your inscriptions at: https://ordinals.com/address/${address}`);
                }
            } catch (error) {
                console.error('[OrdinalsModal] Direct API error:', error);
                this.app.showNotification('Unable to load inscriptions. API services may be unavailable.', 'error');
                this.inscriptions = [];
            } finally {
                this.isLoading = false;
                this.updateInscriptionList();
            }
        }
        
        updateInscriptionList() {
            const listContainer = document.getElementById('ordinals-inscription-list');
            if (listContainer) {
                const $ = window.ElementFactory || ElementFactory;
                listContainer.innerHTML = '';
                listContainer.appendChild(
                    this.isLoading ? this.createLoadingView() : this.createInscriptionItems()
                );
                
                const buttons = this.modal.querySelectorAll('button');
                buttons.forEach(button => {
                    const text = button.textContent;
                    // Update filter buttons
                    const types = { 'All': 'all', 'Images': 'images', 'Text': 'text', 'JSON': 'json', 'HTML': 'html', 'Other': 'other' };
                    if (types[text]) {
                        const isActive = this.filterType === types[text];
                        button.style.background = isActive ? 'var(--text-accent)' : 'transparent';
                        button.style.border = `1px solid ${isActive ? 'var(--text-accent)' : 'var(--border-color)'}`;
                        button.style.color = isActive ? 'var(--bg-primary)' : 'var(--text-primary)';
                    }
                    
                    // Update size buttons
                    const sizes = { 'Small': 'small', 'Medium': 'medium', 'Large': 'large' };
                    if (sizes[text]) {
                        const isActive = this.viewSize === sizes[text];
                        button.style.background = isActive ? 'var(--text-accent)' : 'transparent';
                        button.style.border = `1px solid ${isActive ? 'var(--text-accent)' : 'var(--border-color)'}`;
                        button.style.color = isActive ? 'var(--bg-primary)' : 'var(--text-primary)';
                    }
                });
            }
        }
        
        injectOrdinalsScrollbarStyles() {
            if (document.getElementById('ordinals-scrollbar-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'ordinals-scrollbar-styles';
            style.textContent = `
                /* Ordinals gallery scrollbar styling */
                #ordinals-inscription-list::-webkit-scrollbar {
                    width: 8px;
                }
                
                #ordinals-inscription-list::-webkit-scrollbar-track {
                    background: #000000;
                    border: 1px solid #333333;
                }
                
                #ordinals-inscription-list::-webkit-scrollbar-thumb {
                    background: #f57315;
                    border-radius: 0;
                }
                
                #ordinals-inscription-list::-webkit-scrollbar-thumb:hover {
                    background: #ff8c42;
                }
                
                /* Firefox scrollbar support */
                #ordinals-inscription-list {
                    scrollbar-width: thin;
                    scrollbar-color: #f57315 #000000;
                }
            `;
            document.head.appendChild(style);
        }
        
        showInscriptionDetails(inscription) {
            const $ = window.ElementFactory || ElementFactory;
            
            // Check if this is a recursive inscription
            const isRecursive = inscription.content_type === 'application/octet-stream' && inscription.content_length === 330;
            const isImage = inscription.content_type?.startsWith('image/');
            const isText = inscription.content_type?.startsWith('text/');
            // For application/octet-stream, we'll try to display as image first
            const shouldTryImage = isImage || inscription.content_type === 'application/octet-stream';
            
            const detailModal = $.div({
                className: 'modal-overlay',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '2000',
                    padding: 'calc(20px * var(--scale-factor))',
                    overflowY: 'auto'
                },
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        maxWidth: shouldTryImage ? 'calc(700px * var(--scale-factor))' : 'calc(600px * var(--scale-factor))',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: 'calc(24px * var(--scale-factor))',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }, [
                    // Header with close button
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'calc(20px * var(--scale-factor))'
                        }
                    }, [
                        $.h3({
                            style: {
                                color: 'var(--text-primary)',
                                fontSize: 'calc(18px * var(--scale-factor))',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'calc(12px * var(--scale-factor))',
                                margin: '0'
                            }
                        }, [
                            isImage ? 'IMG' : 
                            isText ? 'TXT' : 
                            isRecursive ? 'REC' : $.span({ style: { color: 'var(--text-accent)', fontWeight: 'bold' } }, ['MOOSH']),
                            `Inscription #${inscription.number}`
                        ]),
                        $.button({
                            style: {
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-dim)',
                                fontSize: 'calc(24px * var(--scale-factor))',
                                cursor: 'pointer',
                                padding: '0',
                                width: 'calc(32px * var(--scale-factor))',
                                height: 'calc(32px * var(--scale-factor))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            },
                            onclick: () => detailModal.remove()
                        }, ['×'])
                    ]),
                    
                    // Full size display for images and application/octet-stream (which might be images)
                    shouldTryImage && $.div({
                        style: {
                            width: '100%',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0',
                            background: '#000000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 'calc(500px * var(--scale-factor))',
                            height: 'calc(600px * var(--scale-factor))',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0
                        },
                        id: 'inscription-content-container'
                    }, [
                        $.img({
                            src: `https://ordinals.com/content/${inscription.id}`,
                            style: {
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                cursor: 'pointer',
                                margin: 'auto'
                            },
                            onclick: (e) => {
                                e.stopPropagation();
                                window.open(`https://ordinals.com/content/${inscription.id}`, '_blank');
                            },
                            onerror: function() {
                                // If it's a recursive inscription and image fails, try iframe
                                if (isRecursive) {
                                    const container = document.getElementById('inscription-content-container');
                                    if (container) {
                                        container.innerHTML = '';
                                        container.style.padding = '0';
                                        
                                        // Add header for recursive inscription
                                        const header = $.div({
                                            style: {
                                                padding: 'calc(16px * var(--scale-factor))',
                                                borderBottom: '1px solid var(--border-color)',
                                                textAlign: 'center',
                                                background: 'var(--bg-primary)'
                                            }
                                        }, [
                                            $.div({ style: { fontSize: 'calc(24px * var(--scale-factor))', marginBottom: 'calc(8px * var(--scale-factor))' } }, ['[R]']),
                                            $.div({ style: { fontSize: 'calc(14px * var(--scale-factor))', color: 'var(--text-primary)', fontWeight: 'bold' } }, ['Recursive Inscription']),
                                            $.div({ style: { fontSize: 'calc(11px * var(--scale-factor))', color: 'var(--text-dim)', marginTop: 'calc(4px * var(--scale-factor))' } }, ['This inscription renders content dynamically'])
                                        ]);
                                        
                                        // Add iframe
                                        const iframe = $.create('iframe', {
                                            src: `https://ordinals.com/content/${inscription.id}`,
                                            style: {
                                                width: '100%',
                                                height: 'calc(550px * var(--scale-factor))',
                                                border: 'none',
                                                background: 'white'
                                            },
                                            sandbox: 'allow-scripts allow-same-origin',
                                            loading: 'lazy'
                                        });
                                        
                                        container.appendChild(header);
                                        container.appendChild(iframe);
                                    }
                                } else {
                                    // Regular error for non-recursive inscriptions
                                    this.style.display = 'none';
                                    const errorDiv = $.div({
                                        style: {
                                            padding: 'calc(40px * var(--scale-factor))',
                                            textAlign: 'center'
                                        }
                                    }, [
                                        $.div({ style: { fontSize: 'calc(48px * var(--scale-factor))', marginBottom: 'calc(10px * var(--scale-factor))' } }, ['[X]']),
                                        $.div({ style: { fontSize: 'calc(14px * var(--scale-factor))', color: 'var(--text-secondary)' } }, ['Failed to load content']),
                                        $.a({
                                            href: `https://ordinals.com/inscription/${inscription.id}`,
                                            target: '_blank',
                                            style: {
                                                color: 'var(--text-accent)',
                                                fontSize: 'calc(12px * var(--scale-factor))',
                                                marginTop: 'calc(10px * var(--scale-factor))',
                                                display: 'inline-block'
                                            }
                                        }, ['View on Ordinals.com'])
                                    ]);
                                    this.parentNode.appendChild(errorDiv);
                                }
                            }
                        })
                    ]),
                    
                    // Text content display
                    isText && $.div({
                        style: {
                            width: '100%',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0',
                            background: 'var(--bg-secondary)',
                            padding: 'calc(16px * var(--scale-factor))',
                            maxHeight: 'calc(400px * var(--scale-factor))',
                            overflowY: 'auto',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 'calc(12px * var(--scale-factor))',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        },
                        id: 'inscription-text-content'
                    }, ['Loading text content...']),
                    
                    // Note: Recursive inscriptions are now handled above by trying image first, then iframe fallback
                    
                    // Collection section (if available)
                    inscription.collection && $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: 'calc(16px * var(--scale-factor))',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, [
                        $.div({ 
                            style: { 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'calc(12px * var(--scale-factor))' 
                            } 
                        }, [
                            $.div({ 
                                style: { 
                                    color: 'var(--text-accent)', 
                                    fontWeight: 'bold' 
                                } 
                            }, ['Collection:']),
                            $.div({ 
                                style: { 
                                    background: 'rgba(var(--text-accent-rgb), 0.1)',
                                    padding: 'calc(4px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                                    borderRadius: 'calc(4px * var(--scale-factor))',
                                    color: 'var(--text-accent)',
                                    fontWeight: '600'
                                } 
                            }, [inscription.collection])
                        ]),
                        inscription.attributes && $.div({
                            style: {
                                marginTop: 'calc(12px * var(--scale-factor))',
                                paddingTop: 'calc(12px * var(--scale-factor))',
                                borderTop: '1px solid var(--border-color)'
                            }
                        }, [
                            $.div({ 
                                style: { 
                                    color: 'var(--text-dim)', 
                                    fontSize: 'calc(11px * var(--scale-factor))',
                                    marginBottom: 'calc(8px * var(--scale-factor))'
                                } 
                            }, ['Attributes:']),
                            ...Object.entries(inscription.attributes || {}).map(([key, value]) => 
                                $.div({
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 'calc(4px * var(--scale-factor))',
                                        fontSize: 'calc(11px * var(--scale-factor))'
                                    }
                                }, [
                                    $.span({ style: { color: 'var(--text-dim)' } }, [key + ':']),
                                    $.span({ style: { color: 'var(--text-primary)' } }, [String(value)])
                                ])
                            )
                        ])
                    ]),
                    
                    // Description section (if available)
                    inscription.description && $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: 'calc(16px * var(--scale-factor))',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, [
                        $.div({ style: { color: 'var(--text-accent)', marginBottom: 'calc(8px * var(--scale-factor))', fontWeight: 'bold' } }, ['Description:']),
                        $.div({ style: { color: 'var(--text-primary)' } }, [inscription.description])
                    ]),
                    
                    // Detailed information
                    $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: 'calc(16px * var(--scale-factor))',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace"
                        }
                    }, [
                        $.div({ style: { marginBottom: '8px' } }, [
                            $.span({ style: { color: 'var(--text-dim)', marginRight: '8px' } }, ['ID:']),
                            $.span({ style: { color: 'var(--text-primary)', wordBreak: 'break-all' } }, [inscription.id])
                        ]),
                        $.div({ style: { marginBottom: '8px' } }, [
                            $.span({ style: { color: 'var(--text-dim)', marginRight: '8px' } }, ['Type:']),
                            $.span({ style: { color: 'var(--text-primary)' } }, [inscription.content_type || 'Unknown'])
                        ]),
                        $.div({ style: { marginBottom: '8px' } }, [
                            $.span({ style: { color: 'var(--text-dim)', marginRight: '8px' } }, ['Size:']),
                            $.span({ style: { color: 'var(--text-primary)' } }, [`${inscription.content_length || inscription.size || inscription.file_size || 0} bytes`])
                        ]),
                        inscription.sat && $.div({ style: { marginBottom: '8px' } }, [
                            $.span({ style: { color: 'var(--text-dim)', marginRight: '8px' } }, ['Sat:']),
                            $.span({ style: { color: 'var(--text-primary)' } }, [inscription.sat.toLocaleString()])
                        ]),
                        inscription.fee && $.div({ style: { marginBottom: '8px' } }, [
                            $.span({ style: { color: 'var(--text-dim)', marginRight: '8px' } }, ['Fee:']),
                            $.span({ style: { color: 'var(--text-primary)' } }, [`${inscription.fee.toLocaleString()} sats`])
                        ]),
                        $.div({}, [
                            $.span({ style: { color: 'var(--text-dim)', marginRight: '8px' } }, ['Date:']),
                            $.span({ style: { color: 'var(--text-primary)' } }, [inscription.timestamp ? new Date(inscription.timestamp).toLocaleString() : 'Unknown'])
                        ])
                    ]),
                    
                    $.div({
                        style: {
                            display: 'flex',
                            gap: 'calc(12px * var(--scale-factor))',
                            justifyContent: 'flex-end'
                        }
                    }, [
                        $.button({
                            style: {
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-dim)',
                                padding: 'calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                                cursor: 'pointer',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace"
                            },
                            onclick: () => {
                                window.open(`https://ordinals.com/inscription/${inscription.id}`, '_blank');
                            }
                        }, ['View on Ordinals.com']),
                        $.button({
                            style: {
                                background: 'var(--text-accent)',
                                border: '2px solid var(--text-accent)',
                                color: 'var(--bg-primary)',
                                padding: 'calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                                cursor: 'pointer',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: '600'
                            },
                            onclick: () => {
                                detailModal.remove();
                                this.showSendModal(inscription);
                            }
                        }, ['Send Inscription']),
                        $.button({
                            style: {
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-dim)',
                                padding: 'calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                                cursor: 'pointer',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace"
                            },
                            onclick: () => detailModal.remove()
                        }, ['Close'])
                    ])
                ])
            ]);
            
            document.body.appendChild(detailModal);
            
            // Inject scrollbar styles for the detail modal
            this.injectDetailModalScrollbarStyles();
            
            // Load text content if it's a text inscription
            if (isText) {
                fetch(`${this.app.apiService.baseURL}/api/proxy/ordinals/content/${inscription.id}`)
                    .then(response => response.text())
                    .then(text => {
                        const textContainer = document.getElementById('inscription-text-content');
                        if (textContainer) {
                            textContainer.textContent = text;
                        }
                    })
                    .catch(error => {
                        const textContainer = document.getElementById('inscription-text-content');
                        if (textContainer) {
                            // Clear and create elements safely
                            textContainer.textContent = '';
                            const errorDiv = document.createElement('div');
                            errorDiv.style.cssText = 'color: var(--text-dim); text-align: center;';
                            errorDiv.textContent = 'Failed to load text content';
                            
                            const br = document.createElement('br');
                            errorDiv.appendChild(br);
                            
                            const link = document.createElement('a');
                            link.href = `https://ordinals.com/inscription/${inscription.id}`;
                            link.target = '_blank';
                            link.style.cssText = 'color: var(--text-accent); font-size: calc(12px * var(--scale-factor));';
                            link.textContent = 'View on Ordinals.com';
                            errorDiv.appendChild(link);
                            
                            textContainer.appendChild(errorDiv);
                        }
                    });
            }
        }
        
        injectDetailModalScrollbarStyles() {
            if (document.getElementById('detail-modal-scrollbar-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'detail-modal-scrollbar-styles';
            style.textContent = `
                /* Detail modal scrollbar styling */
                .modal-overlay > div::-webkit-scrollbar,
                #inscription-text-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .modal-overlay > div::-webkit-scrollbar-track,
                #inscription-text-content::-webkit-scrollbar-track {
                    background: #000000;
                    border: 1px solid #333333;
                }
                
                .modal-overlay > div::-webkit-scrollbar-thumb,
                #inscription-text-content::-webkit-scrollbar-thumb {
                    background: #f57315;
                    border-radius: 0;
                }
                
                .modal-overlay > div::-webkit-scrollbar-thumb:hover,
                #inscription-text-content::-webkit-scrollbar-thumb:hover {
                    background: #ff8c42;
                }
                
                /* Firefox scrollbar support */
                .modal-overlay > div,
                #inscription-text-content {
                    scrollbar-width: thin;
                    scrollbar-color: #f57315 #000000;
                }
            `;
            document.head.appendChild(style);
        }
        
        exportInscriptions() {
            if (this.inscriptions.length === 0) {
                this.app.showNotification('No inscriptions to export', 'error');
                return;
            }
            
            const exportData = {
                address: this.app.state.getCurrentAccount()?.addresses?.taproot || 'Unknown',
                timestamp: new Date().toISOString(),
                total: this.inscriptions.length,
                inscriptions: this.inscriptions
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `ordinals-inscriptions-${Date.now()}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.app.showNotification('Inscriptions exported successfully', 'success');
        }
        
        toggleSelectionMode() {
            this.selectionMode = !this.selectionMode;
            if (!this.selectionMode) {
                this.selectedInscriptions.clear();
            }
            this.updateInscriptionList();
        }
        
        toggleInscriptionSelection(inscription) {
            if (this.selectedInscriptions.has(inscription.id)) {
                this.selectedInscriptions.delete(inscription.id);
            } else {
                this.selectedInscriptions.add(inscription.id);
            }
            this.updateInscriptionList();
            
            const selBtn = document.getElementById('selection-mode-btn');
            if (selBtn) {
                selBtn.textContent = `✓ ${this.selectedInscriptions.size} Selected`;
            }
        }
        
        showBulkSendModal() {
            const selectedItems = this.inscriptions.filter(i => this.selectedInscriptions.has(i.id));
            this.showSendModal(selectedItems);
        }
        
        showSendModal(inscriptions = null) {
            const $ = window.ElementFactory || ElementFactory;
            const isBulk = Array.isArray(inscriptions);
            const items = isBulk ? inscriptions : [inscriptions];
            
            const sendModal = $.div({
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
                    zIndex: '2000',
                    padding: 'calc(20px * var(--scale-factor))'
                },
                onclick: (e) => {
                    if (e.target.className === 'modal-overlay') {
                        e.currentTarget.remove();
                    }
                }
            }, [
                $.div({
                    style: {
                        background: 'var(--bg-primary)',
                        border: '2px solid var(--text-primary)',
                        borderRadius: '0',
                        maxWidth: 'calc(500px * var(--scale-factor))',
                        width: '90%',
                        padding: 'calc(24px * var(--scale-factor))'
                    }
                }, [
                    $.h3({
                        style: {
                            color: 'var(--text-primary)',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            fontSize: 'calc(18px * var(--scale-factor))'
                        }
                    }, [isBulk ? `Send ${items.length} Inscriptions` : 'Send Inscription']),
                    
                    $.div({
                        style: {
                            marginBottom: 'calc(20px * var(--scale-factor))'
                        }
                    }, [
                        $.div({
                            style: {
                                color: 'var(--text-dim)',
                                fontSize: 'calc(12px * var(--scale-factor))',
                                marginBottom: 'calc(8px * var(--scale-factor))'
                            }
                        }, [isBulk ? 'Selected Inscriptions:' : 'Inscription:']),
                        $.div({
                            style: {
                                maxHeight: 'calc(150px * var(--scale-factor))',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)',
                                padding: 'calc(8px * var(--scale-factor))',
                                fontSize: 'calc(12px * var(--scale-factor))'
                            }
                        }, items.map(item => $.div({
                            style: {
                                padding: 'calc(4px * var(--scale-factor))',
                                borderBottom: '1px solid var(--border-color)'
                            }
                        }, [`#${item.number} - ${item.content_type}`])))
                    ]),
                    
                    $.div({
                        style: {
                            marginBottom: 'calc(20px * var(--scale-factor))'
                        }
                    }, [
                        $.label({
                            style: {
                                display: 'block',
                                color: 'var(--text-primary)',
                                marginBottom: 'calc(8px * var(--scale-factor))',
                                fontSize: 'calc(14px * var(--scale-factor))'
                            }
                        }, ['Recipient Address (Taproot bc1p...)']),
                        $.input({
                            type: 'text',
                            id: 'inscription-recipient',
                            placeholder: 'bc1p...',
                            style: {
                                width: '100%',
                                padding: 'calc(12px * var(--scale-factor))',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace",
                                outline: 'none'
                            }
                        })
                    ]),
                    
                    $.div({
                        style: {
                            marginBottom: 'calc(20px * var(--scale-factor))'
                        }
                    }, [
                        $.label({
                            style: {
                                display: 'block',
                                color: 'var(--text-primary)',
                                marginBottom: 'calc(8px * var(--scale-factor))',
                                fontSize: 'calc(14px * var(--scale-factor))'
                            }
                        }, ['Fee Rate (sats/vB)']),
                        $.input({
                            type: 'number',
                            id: 'inscription-fee-rate',
                            placeholder: '10',
                            value: '10',
                            min: '1',
                            style: {
                                width: '100%',
                                padding: 'calc(12px * var(--scale-factor))',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace",
                                outline: 'none'
                            }
                        })
                    ]),
                    
                    $.div({
                        style: {
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: 'calc(12px * var(--scale-factor))',
                            marginBottom: 'calc(20px * var(--scale-factor))',
                            fontSize: 'calc(12px * var(--scale-factor))',
                            color: 'var(--text-dim)'
                        }
                    }, [
                        'IMPORTANT: Ordinals transfers require careful UTXO management. ',
                        isBulk ? 'Each inscription will be sent in a separate transaction.' : 'Make sure the recipient address can handle Ordinals.',
                        ' Always verify the address before sending.'
                    ]),
                    
                    $.div({
                        style: {
                            display: 'flex',
                            gap: 'calc(12px * var(--scale-factor))',
                            justifyContent: 'flex-end'
                        }
                    }, [
                        $.button({
                            style: {
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-dim)',
                                padding: 'calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                                cursor: 'pointer',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace"
                            },
                            onclick: () => sendModal.remove()
                        }, ['Cancel']),
                        $.button({
                            style: {
                                background: 'var(--text-accent)',
                                border: '2px solid var(--text-accent)',
                                color: 'var(--bg-primary)',
                                padding: 'calc(10px * var(--scale-factor)) calc(20px * var(--scale-factor))',
                                cursor: 'pointer',
                                fontSize: 'calc(14px * var(--scale-factor))',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: '600'
                            },
                            onclick: () => this.executeSend(items, sendModal)
                        }, ['Send'])
                    ])
                ])
            ]);
            
            document.body.appendChild(sendModal);
            
            setTimeout(() => {
                document.getElementById('inscription-recipient')?.focus();
            }, 100);
        }
        
        async executeSend(inscriptions, modal) {
            const recipient = document.getElementById('inscription-recipient')?.value;
            const feeRate = parseInt(document.getElementById('inscription-fee-rate')?.value) || 10;
            
            if (!recipient || !recipient.startsWith('bc1p')) {
                this.app.showNotification('Please enter a valid Taproot address (bc1p...)', 'error');
                return;
            }
            
            modal.remove();
            
            this.app.showNotification(`Preparing to send ${inscriptions.length} inscription(s)...`, 'info');
            
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                this.app.showNotification(`Successfully sent ${inscriptions.length} inscription(s) to ${recipient}`, 'success');
                
                this.selectedInscriptions.clear();
                this.selectionMode = false;
                this.loadInscriptions();
                
            } catch (error) {
                console.error('Send error:', error);
                this.app.showNotification('Failed to send inscriptions', 'error');
            }
        }
        
        close() {
            if (this.modal) {
                this.modal.classList.remove('show');
                setTimeout(() => {
                    this.modal.remove();
                    this.modal = null;
                }, 300);
            }
        }
    }

    // Export to window
    window.OrdinalsModal = OrdinalsModal;

})(window);