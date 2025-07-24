// MOOSH WALLET - Ordinals Modal Module
// Display and manage Bitcoin Ordinals/Inscriptions
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class OrdinalsModal extends ModalBase {
        constructor(app) {
            super(app);
            this.ordinalsManager = new OrdinalsManager(app);
            this.inscriptions = [];
            this.isLoading = false;
            
            // Bind manager callbacks
            this.ordinalsManager.onInscriptionsLoaded = (inscriptions) => {
                this.inscriptions = inscriptions;
                this.updateInscriptionList();
            };
        }

        show() {
            const $ = window.ElementFactory || window.$;
            
            const content = $.div({
                style: {
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--text-primary)',
                    borderRadius: '0',
                    maxWidth: 'calc(900px * var(--scale-factor))',
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
            ]);
            
            this.createOverlay(content);
            this.addModalStyles();
            this.addOrdinalsStyles();
            super.show();
            
            // Load inscriptions after showing
            setTimeout(() => {
                this.loadInscriptions();
            }, 100);
        }

        createHeader() {
            const $ = window.ElementFactory || window.$;
            
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
                    }, [this.truncateAddress(address)])
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
            const $ = window.ElementFactory || window.$;
            const manager = this.ordinalsManager;
            
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
                // Filter buttons
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
                    
                    // Divider
                    $.div({ 
                        style: { 
                            width: '1px', 
                            height: '20px', 
                            background: 'var(--border-color)', 
                            margin: '0 8px' 
                        } 
                    }),
                    
                    // Selection mode button
                    $.button({
                        id: 'selection-mode-btn',
                        style: {
                            background: manager.selectionMode ? 'var(--text-accent)' : 'transparent',
                            border: `1px solid ${manager.selectionMode ? 'var(--text-accent)' : 'var(--border-color)'}`,
                            color: manager.selectionMode ? 'var(--bg-primary)' : 'var(--text-primary)',
                            padding: 'calc(6px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderRadius: '0'
                        },
                        onclick: () => this.toggleSelectionMode()
                    }, [manager.selectionMode ? `✓ ${manager.selectedInscriptions.size} Selected` : 'Select Mode'])
                ]),
                
                // View controls
                $.div({
                    style: {
                        display: 'flex',
                        gap: 'calc(12px * var(--scale-factor))',
                        alignItems: 'center'
                    }
                }, [
                    // Size selector
                    $.div({
                        style: {
                            display: 'flex',
                            gap: 'calc(4px * var(--scale-factor))',
                            alignItems: 'center'
                        }
                    }, [
                        $.span({
                            style: {
                                color: 'var(--text-dim)',
                                fontSize: 'calc(12px * var(--scale-factor))',
                                marginRight: 'calc(8px * var(--scale-factor))'
                            }
                        }, ['View:']),
                        this.createSizeButton('S', 'small'),
                        this.createSizeButton('M', 'medium'),
                        this.createSizeButton('L', 'large')
                    ]),
                    
                    // Sort selector
                    $.select({
                        id: 'sort-select',
                        style: {
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: 'pointer',
                            borderRadius: '0'
                        },
                        onchange: (e) => {
                            manager.setSortBy(e.target.value);
                            this.updateInscriptionList();
                        }
                    }, [
                        $.option({ value: 'newest' }, ['Newest First']),
                        $.option({ value: 'oldest' }, ['Oldest First']),
                        $.option({ value: 'rarest' }, ['Rarest First']),
                        $.option({ value: 'size' }, ['Largest First'])
                    ])
                ])
            ]);
        }

        createFilterButton(label, filterType) {
            const $ = window.ElementFactory || window.$;
            const isActive = this.ordinalsManager.filterType === filterType;
            
            return $.button({
                style: {
                    background: isActive ? 'var(--text-primary)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--text-primary)' : 'var(--border-color)'}`,
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                    padding: 'calc(6px * var(--scale-factor)) calc(12px * var(--scale-factor))',
                    fontSize: 'calc(12px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '0'
                },
                onclick: () => {
                    this.ordinalsManager.setFilter(filterType);
                    this.updateFilterButtons();
                    this.updateInscriptionList();
                }
            }, [label]);
        }

        createSizeButton(label, size) {
            const $ = window.ElementFactory || window.$;
            const isActive = this.ordinalsManager.viewSize === size;
            
            return $.button({
                style: {
                    background: isActive ? 'var(--text-primary)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--text-primary)' : 'var(--border-color)'}`,
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                    padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                    fontSize: 'calc(12px * var(--scale-factor))',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '0',
                    minWidth: 'calc(24px * var(--scale-factor))'
                },
                onclick: () => {
                    this.ordinalsManager.setViewSize(size);
                    this.updateInscriptionList();
                }
            }, [label]);
        }

        createInscriptionList() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                id: 'inscription-list-container',
                style: {
                    flex: '1',
                    overflowY: 'auto',
                    padding: 'calc(16px * var(--scale-factor))',
                    minHeight: 'calc(400px * var(--scale-factor))'
                }
            }, [
                this.createLoadingState()
            ]);
        }

        createLoadingState() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(300px * var(--scale-factor))',
                    color: 'var(--text-dim)'
                }
            }, [
                $.div({
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['Loading inscriptions...']),
                $.div({
                    className: 'loading-spinner',
                    style: {
                        width: 'calc(24px * var(--scale-factor))',
                        height: 'calc(24px * var(--scale-factor))',
                        border: '2px solid var(--text-dim)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }
                })
            ]);
        }

        createActions() {
            const $ = window.ElementFactory || window.$;
            const manager = this.ordinalsManager;
            
            return $.div({
                style: {
                    padding: 'calc(16px * var(--scale-factor)) calc(24px * var(--scale-factor))',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'calc(12px * var(--scale-factor))'
                }
            }, [
                $.div({
                    style: {
                        color: 'var(--text-dim)',
                        fontSize: 'calc(12px * var(--scale-factor))'
                    }
                }, [`${this.inscriptions.length} inscriptions`]),
                
                $.div({
                    style: {
                        display: 'flex',
                        gap: 'calc(8px * var(--scale-factor))'
                    }
                }, [
                    manager.selectionMode && manager.selectedInscriptions.size > 0 ? $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--text-primary)',
                            color: 'var(--text-primary)',
                            padding: 'calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => this.handleBulkSend()
                    }, [`Send ${manager.selectedInscriptions.size} Selected`]) : null,
                    
                    $.button({
                        style: {
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-dim)',
                            padding: 'calc(8px * var(--scale-factor)) calc(16px * var(--scale-factor))',
                            fontSize: 'calc(13px * var(--scale-factor))',
                            fontFamily: "'JetBrains Mono', monospace",
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        onclick: () => this.loadInscriptions()
                    }, ['Refresh'])
                ])
            ]);
        }

        async loadInscriptions() {
            this.isLoading = true;
            this.updateInscriptionList();
            
            await this.ordinalsManager.loadInscriptions();
            
            this.isLoading = false;
            this.inscriptions = this.ordinalsManager.inscriptions;
            this.updateInscriptionList();
        }

        updateInscriptionList() {
            const container = document.getElementById('inscription-list-container');
            if (!container) return;
            
            const $ = window.ElementFactory || window.$;
            const manager = this.ordinalsManager;
            
            if (this.isLoading) {
                container.innerHTML = '';
                container.appendChild(this.createLoadingState());
                return;
            }
            
            const filteredInscriptions = manager.getFilteredInscriptions();
            
            if (filteredInscriptions.length === 0) {
                container.innerHTML = '';
                container.appendChild(this.createEmptyState());
                return;
            }
            
            // Create grid
            const gridClass = `ordinals-grid-${manager.viewSize}`;
            const grid = $.div({
                className: `ordinals-grid ${gridClass}`,
                style: {
                    display: 'grid',
                    gap: 'calc(16px * var(--scale-factor))'
                }
            }, filteredInscriptions.map(inscription => this.createInscriptionCard(inscription)));
            
            container.innerHTML = '';
            container.appendChild(grid);
        }

        createInscriptionCard(inscription) {
            const $ = window.ElementFactory || window.$;
            const manager = this.ordinalsManager;
            const isSelected = manager.selectedInscriptions.has(inscription.id);
            
            return $.div({
                className: `inscription-card ${isSelected ? 'selected' : ''}`,
                style: {
                    background: 'var(--bg-secondary)',
                    border: `2px solid ${isSelected ? 'var(--text-accent)' : 'var(--border-color)'}`,
                    borderRadius: '0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                },
                onclick: () => {
                    if (manager.selectionMode) {
                        manager.toggleInscriptionSelection(inscription.id);
                        this.updateInscriptionList();
                        this.updateSelectionButton();
                    } else {
                        this.viewInscriptionDetails(inscription);
                    }
                },
                onmouseover: function() {
                    this.style.borderColor = 'var(--text-primary)';
                    this.style.transform = 'translateY(-2px)';
                },
                onmouseout: function() {
                    this.style.borderColor = isSelected ? 'var(--text-accent)' : 'var(--border-color)';
                    this.style.transform = 'translateY(0)';
                }
            }, [
                // Preview
                this.createInscriptionPreview(inscription),
                
                // Info
                $.div({
                    style: {
                        padding: 'calc(12px * var(--scale-factor))',
                        borderTop: '1px solid var(--border-color)'
                    }
                }, [
                    $.div({
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'calc(4px * var(--scale-factor))'
                        }
                    }, [
                        $.span({
                            style: {
                                color: 'var(--text-accent)',
                                fontSize: 'calc(13px * var(--scale-factor))',
                                fontWeight: '600'
                            }
                        }, [manager.formatInscriptionNumber(inscription.inscriptionNumber)]),
                        $.span({
                            style: {
                                color: 'var(--text-dim)',
                                fontSize: 'calc(11px * var(--scale-factor))'
                            }
                        }, [manager.getContentTypeLabel(inscription.contentType)])
                    ]),
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(11px * var(--scale-factor))',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }, [this.truncateId(inscription.id)])
                ])
            ]);
        }

        createInscriptionPreview(inscription) {
            const $ = window.ElementFactory || window.$;
            const manager = this.ordinalsManager;
            const contentType = inscription.contentType || '';
            
            const previewStyle = {
                width: '100%',
                aspectRatio: '1',
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
            };
            
            if (contentType.startsWith('image/')) {
                return $.div({ style: previewStyle }, [
                    $.img({
                        src: manager.getInscriptionPreviewUrl(inscription),
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        },
                        onerror: function() {
                            this.style.display = 'none';
                            this.parentNode.innerHTML = '<div style="color: var(--text-dim); font-size: 12px;">Failed to load</div>';
                        }
                    })
                ]);
            } else if (contentType.startsWith('text/')) {
                return $.div({ style: { ...previewStyle, padding: 'calc(8px * var(--scale-factor))' } }, [
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(10px * var(--scale-factor))',
                            fontFamily: 'monospace',
                            textAlign: 'center',
                            wordBreak: 'break-all',
                            maxHeight: '100%',
                            overflow: 'hidden'
                        }
                    }, ['Text inscription'])
                ]);
            } else {
                return $.div({ style: previewStyle }, [
                    $.div({
                        style: {
                            color: 'var(--text-dim)',
                            fontSize: 'calc(24px * var(--scale-factor))'
                        }
                    }, ['📄'])
                ]);
            }
        }

        createEmptyState() {
            const $ = window.ElementFactory || window.$;
            
            return $.div({
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(300px * var(--scale-factor))',
                    color: 'var(--text-dim)'
                }
            }, [
                $.div({
                    style: {
                        fontSize: 'calc(48px * var(--scale-factor))',
                        marginBottom: 'calc(16px * var(--scale-factor))',
                        opacity: '0.5'
                    }
                }, ['∅']),
                $.div({
                    style: {
                        fontSize: 'calc(14px * var(--scale-factor))',
                        marginBottom: 'calc(8px * var(--scale-factor))'
                    }
                }, ['No inscriptions found']),
                $.div({
                    style: {
                        fontSize: 'calc(12px * var(--scale-factor))',
                        opacity: '0.7'
                    }
                }, ['Inscriptions on your taproot address will appear here'])
            ]);
        }

        viewInscriptionDetails(inscription) {
            // Open in ordinals.com explorer
            window.open(this.ordinalsManager.getInscriptionExplorerUrl(inscription), '_blank');
        }

        handleBulkSend() {
            const selectedInscriptions = this.ordinalsManager.getSelectedInscriptions();
            this.app.showNotification(`Bulk send ${selectedInscriptions.length} inscriptions not yet implemented`, 'info');
        }

        toggleSelectionMode() {
            this.ordinalsManager.toggleSelectionMode();
            this.updateInscriptionList();
            this.updateSelectionButton();
        }

        updateSelectionButton() {
            const btn = document.getElementById('selection-mode-btn');
            if (!btn) return;
            
            const manager = this.ordinalsManager;
            btn.textContent = manager.selectionMode 
                ? `✓ ${manager.selectedInscriptions.size} Selected` 
                : 'Select Mode';
            
            btn.style.background = manager.selectionMode ? 'var(--text-accent)' : 'transparent';
            btn.style.borderColor = manager.selectionMode ? 'var(--text-accent)' : 'var(--border-color)';
            btn.style.color = manager.selectionMode ? 'var(--bg-primary)' : 'var(--text-primary)';
        }

        updateFilterButtons() {
            // This would update the visual state of filter buttons
            // Implementation depends on how buttons are tracked
        }

        truncateAddress(address) {
            if (!address || address.length < 16) return address;
            return `${address.slice(0, 8)}...${address.slice(-8)}`;
        }

        truncateId(id) {
            if (!id || id.length < 16) return id;
            return `${id.slice(0, 8)}...${id.slice(-8)}`;
        }

        addOrdinalsStyles() {
            if (document.getElementById('ordinals-modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'ordinals-modal-styles';
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .ordinals-grid {
                    width: 100%;
                }
                
                .ordinals-grid-small {
                    grid-template-columns: repeat(auto-fill, minmax(calc(120px * var(--scale-factor)), 1fr));
                }
                
                .ordinals-grid-medium {
                    grid-template-columns: repeat(auto-fill, minmax(calc(180px * var(--scale-factor)), 1fr));
                }
                
                .ordinals-grid-large {
                    grid-template-columns: repeat(auto-fill, minmax(calc(240px * var(--scale-factor)), 1fr));
                }
                
                .inscription-card {
                    transform: translateY(0);
                }
                
                .inscription-card.selected {
                    box-shadow: 0 0 0 3px var(--text-accent) inset;
                }
                
                #inscription-list-container::-webkit-scrollbar {
                    width: 8px;
                }
                
                #inscription-list-container::-webkit-scrollbar-track {
                    background: var(--bg-secondary);
                }
                
                #inscription-list-container::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 0;
                }
                
                #inscription-list-container::-webkit-scrollbar-thumb:hover {
                    background: var(--text-dim);
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    // Make available globally
    window.OrdinalsModal = OrdinalsModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.OrdinalsModal = OrdinalsModal;
    }

})(window);