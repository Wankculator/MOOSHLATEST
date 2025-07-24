// MOOSH WALLET - Ordinals Manager Module
// Handles Bitcoin Ordinals and Inscriptions functionality
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class OrdinalsManager {
        constructor(app) {
            this.app = app;
            this.inscriptions = [];
            this.isLoading = false;
            this.filterType = 'all';
            this.sortBy = 'newest';
            this.selectionMode = false;
            this.selectedInscriptions = new Set();
            this.viewSize = localStorage.getItem('moosh_ordinals_view_size') || 'medium';
            this.cache = new Map();
        }

        async fetchOrdinalsCount() {
            try {
                const currentAccount = this.app.state.getCurrentAccount();
                if (!currentAccount || !currentAccount.addresses?.taproot) {
                    console.log('[OrdinalsManager] No taproot address available');
                    return { count: 0, inscriptions: [] };
                }

                const address = currentAccount.addresses.taproot;
                
                // Check cache first
                if (this.cache.has(address)) {
                    const cached = this.cache.get(address);
                    if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache
                        return cached.data;
                    }
                }

                // Fetch from API
                const response = await this.app.apiService.request('/api/ordinals/count', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                });

                if (response.success) {
                    const data = {
                        count: response.data.count || 0,
                        inscriptions: response.data.inscriptions || []
                    };
                    
                    // Cache the result
                    this.cache.set(address, {
                        data,
                        timestamp: Date.now()
                    });
                    
                    return data;
                }

                return { count: 0, inscriptions: [] };
            } catch (error) {
                console.error('[OrdinalsManager] Error fetching ordinals count:', error);
                return { count: 0, inscriptions: [] };
            }
        }

        async loadInscriptions() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            
            try {
                const result = await this.fetchOrdinalsCount();
                this.inscriptions = result.inscriptions || [];
                
                // Sort inscriptions
                this.sortInscriptions();
                
                // Notify listeners
                if (this.onInscriptionsLoaded) {
                    this.onInscriptionsLoaded(this.inscriptions);
                }
            } catch (error) {
                console.error('[OrdinalsManager] Error loading inscriptions:', error);
                this.inscriptions = [];
            } finally {
                this.isLoading = false;
            }
        }

        sortInscriptions() {
            switch (this.sortBy) {
                case 'newest':
                    this.inscriptions.sort((a, b) => b.inscriptionNumber - a.inscriptionNumber);
                    break;
                case 'oldest':
                    this.inscriptions.sort((a, b) => a.inscriptionNumber - b.inscriptionNumber);
                    break;
                case 'rarest':
                    this.inscriptions.sort((a, b) => a.inscriptionNumber - b.inscriptionNumber);
                    break;
                case 'size':
                    this.inscriptions.sort((a, b) => (b.contentLength || 0) - (a.contentLength || 0));
                    break;
            }
        }

        getFilteredInscriptions() {
            if (this.filterType === 'all') {
                return this.inscriptions;
            }

            return this.inscriptions.filter(inscription => {
                const contentType = inscription.contentType || '';
                
                switch (this.filterType) {
                    case 'images':
                        return contentType.startsWith('image/');
                    case 'text':
                        return contentType.startsWith('text/plain');
                    case 'json':
                        return contentType.includes('json');
                    case 'html':
                        return contentType.includes('html');
                    case 'other':
                        return !contentType.startsWith('image/') && 
                               !contentType.startsWith('text/plain') && 
                               !contentType.includes('json') && 
                               !contentType.includes('html');
                    default:
                        return true;
                }
            });
        }

        toggleSelectionMode() {
            this.selectionMode = !this.selectionMode;
            if (!this.selectionMode) {
                this.selectedInscriptions.clear();
            }
        }

        toggleInscriptionSelection(inscriptionId) {
            if (this.selectedInscriptions.has(inscriptionId)) {
                this.selectedInscriptions.delete(inscriptionId);
            } else {
                this.selectedInscriptions.add(inscriptionId);
            }
        }

        getSelectedInscriptions() {
            return this.inscriptions.filter(i => this.selectedInscriptions.has(i.id));
        }

        setFilter(filterType) {
            this.filterType = filterType;
            this.sortInscriptions();
        }

        setSortBy(sortBy) {
            this.sortBy = sortBy;
            this.sortInscriptions();
        }

        setViewSize(size) {
            this.viewSize = size;
            localStorage.setItem('moosh_ordinals_view_size', size);
        }

        getInscriptionById(id) {
            return this.inscriptions.find(i => i.id === id);
        }

        // Helper methods for inscription data
        formatInscriptionNumber(num) {
            if (num < 1000) return `#${num}`;
            if (num < 10000) return `#${(num / 1000).toFixed(1)}k`;
            if (num < 1000000) return `#${Math.floor(num / 1000)}k`;
            return `#${(num / 1000000).toFixed(1)}M`;
        }

        getContentTypeLabel(contentType) {
            if (!contentType) return 'Unknown';
            
            if (contentType.startsWith('image/')) return 'Image';
            if (contentType.startsWith('text/plain')) return 'Text';
            if (contentType.includes('json')) return 'JSON';
            if (contentType.includes('html')) return 'HTML';
            if (contentType.startsWith('audio/')) return 'Audio';
            if (contentType.startsWith('video/')) return 'Video';
            if (contentType.includes('javascript')) return 'JS';
            if (contentType.includes('css')) return 'CSS';
            
            return 'Other';
        }

        getInscriptionPreviewUrl(inscription) {
            // Use ordinals.com for preview
            return `https://ordinals.com/content/${inscription.id}`;
        }

        getInscriptionExplorerUrl(inscription) {
            // Use ordinals.com for explorer
            return `https://ordinals.com/inscription/${inscription.id}`;
        }

        // Mock data generator for testing
        generateMockInscriptions(count = 20) {
            const mockInscriptions = [];
            const contentTypes = [
                'image/png',
                'image/jpeg',
                'image/webp',
                'text/plain',
                'application/json',
                'text/html',
                'image/svg+xml'
            ];

            for (let i = 0; i < count; i++) {
                const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
                const inscriptionNumber = Math.floor(Math.random() * 50000000);
                
                mockInscriptions.push({
                    id: this.generateRandomId(),
                    inscriptionNumber,
                    address: 'bc1p' + this.generateRandomId().substring(0, 58),
                    contentType,
                    contentLength: Math.floor(Math.random() * 100000) + 1000,
                    timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
                    genesisHeight: 750000 + Math.floor(Math.random() * 50000),
                    genesisFee: Math.floor(Math.random() * 10000) + 1000,
                    outputValue: Math.floor(Math.random() * 100000) + 10000
                });
            }

            return mockInscriptions;
        }

        generateRandomId() {
            const bytes = new Uint8Array(32);
            window.crypto.getRandomValues(bytes);
            return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        }
    }

    // Make available globally
    window.OrdinalsManager = OrdinalsManager;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.OrdinalsManager = OrdinalsManager;
    }

})(window);