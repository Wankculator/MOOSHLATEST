// MOOSH WALLET - Ordinals Terminal Modal Module
// Terminal-style interface for Ordinals operations
// Extracted from moosh-wallet.js for better code organization

(function(window) {
    'use strict';

    class OrdinalsTerminalModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.terminalOutput = [];
            this.isLoading = false;
            this.currentCommand = '';
            this.commandHistory = [];
            this.historyIndex = -1;
        }

        show() {
            this.createModal();
            this.initializeTerminal();
        }

        createModal() {
            const $ = window.ElementFactory || window.$;
            
            // Create modal overlay
            const overlay = $.div({ 
                className: 'modal-overlay ordinals-terminal-overlay',
                onclick: (e) => {
                    if (e.target.className.includes('modal-overlay')) {
                        this.close();
                    }
                }
            });

            // Create modal content
            const modal = $.div({ className: 'modal-container ordinals-terminal-modal' }, [
                // Header
                $.div({ className: 'modal-header terminal-header' }, [
                    $.h2({ className: 'modal-title' }, [
                        $.span({ className: 'text-primary' }, ['ORDINALS']),
                        $.span({ className: 'text-dim' }, [' TERMINAL'])
                    ]),
                    $.button({
                        className: 'modal-close',
                        onclick: () => this.close()
                    }, ['×'])
                ]),

                // Terminal display
                $.div({ className: 'terminal-body' }, [
                    $.div({ 
                        id: 'ordinals-terminal-output',
                        className: 'terminal-output'
                    }),
                    $.div({ className: 'terminal-input-line' }, [
                        $.span({ className: 'terminal-prompt' }, ['ordinals> ']),
                        $.input({
                            type: 'text',
                            id: 'ordinals-terminal-input',
                            className: 'terminal-input',
                            placeholder: 'Type "help" for commands...',
                            onkeydown: (e) => this.handleKeydown(e)
                        })
                    ])
                ])
            ]);

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            this.modal = overlay;
            
            // Focus input
            setTimeout(() => {
                document.getElementById('ordinals-terminal-input')?.focus();
            }, 100);

            // Add styles
            this.addStyles();
        }

        initializeTerminal() {
            this.addOutput('╔═══════════════════════════════════════════════╗', 'header');
            this.addOutput('║        MOOSH ORDINALS TERMINAL v1.0           ║', 'header');
            this.addOutput('║     Bitcoin Ordinals & Inscriptions CLI       ║', 'header');
            this.addOutput('╚═══════════════════════════════════════════════╝', 'header');
            this.addOutput('');
            this.addOutput('Type "help" for available commands', 'info');
            this.addOutput('');
        }

        handleKeydown(e) {
            const input = e.target;
            
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.executeCommand(input.value);
                    this.commandHistory.unshift(input.value);
                    this.historyIndex = -1;
                    input.value = '';
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.historyIndex < this.commandHistory.length - 1) {
                        this.historyIndex++;
                        input.value = this.commandHistory[this.historyIndex];
                    }
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.historyIndex > 0) {
                        this.historyIndex--;
                        input.value = this.commandHistory[this.historyIndex];
                    } else if (this.historyIndex === 0) {
                        this.historyIndex = -1;
                        input.value = '';
                    }
                    break;
                    
                case 'Tab':
                    e.preventDefault();
                    this.autocomplete(input);
                    break;
            }
        }

        async executeCommand(command) {
            if (!command.trim()) return;
            
            this.addOutput(`ordinals> ${command}`, 'command');
            
            const [cmd, ...args] = command.trim().toLowerCase().split(' ');
            
            switch(cmd) {
                case 'help':
                    this.showHelp();
                    break;
                    
                case 'scan':
                    await this.scanForOrdinals(args[0]);
                    break;
                    
                case 'list':
                    await this.listOrdinals();
                    break;
                    
                case 'view':
                    if (args[0]) {
                        await this.viewOrdinal(args[0]);
                    } else {
                        this.addOutput('Usage: view <ordinal_id>', 'error');
                    }
                    break;
                    
                case 'inscribe':
                    this.addOutput('Inscription feature coming soon...', 'info');
                    break;
                    
                case 'export':
                    await this.exportOrdinals();
                    break;
                    
                case 'stats':
                    await this.showStats();
                    break;
                    
                case 'clear':
                    this.clearTerminal();
                    break;
                    
                case 'exit':
                    this.close();
                    break;
                    
                default:
                    this.addOutput(`Unknown command: ${cmd}`, 'error');
                    this.addOutput('Type "help" for available commands', 'info');
            }
        }

        showHelp() {
            this.addOutput('');
            this.addOutput('Available Commands:', 'header');
            this.addOutput('  help      - Show this help message', 'success');
            this.addOutput('  scan      - Scan wallet for ordinals', 'success');
            this.addOutput('  list      - List found ordinals', 'success');
            this.addOutput('  view <id> - View ordinal details', 'success');
            this.addOutput('  inscribe  - Create new inscription', 'success');
            this.addOutput('  export    - Export ordinals data', 'success');
            this.addOutput('  stats     - Show ordinals statistics', 'success');
            this.addOutput('  clear     - Clear terminal output', 'success');
            this.addOutput('  exit      - Close terminal', 'success');
            this.addOutput('');
        }

        async scanForOrdinals(address) {
            this.setLoading(true);
            this.addOutput('Scanning for ordinals...', 'info');
            
            try {
                // Simulate scanning
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Mock data
                const ordinals = [
                    { id: 'ord1234...', number: 12345, rarity: 'uncommon' },
                    { id: 'ord5678...', number: 67890, rarity: 'rare' },
                    { id: 'ord9012...', number: 90123, rarity: 'common' }
                ];
                
                this.addOutput(`Found ${ordinals.length} ordinals:`, 'success');
                ordinals.forEach(ord => {
                    this.addOutput(`  ${ord.id} - #${ord.number} (${ord.rarity})`, 'data');
                });
                
            } catch (error) {
                this.addOutput(`Error: ${error.message}`, 'error');
            } finally {
                this.setLoading(false);
            }
        }

        async listOrdinals() {
            this.addOutput('Fetching ordinals list...', 'info');
            
            // Mock ordinals data
            const ordinals = this.app.state.get('ordinals') || [];
            
            if (ordinals.length === 0) {
                this.addOutput('No ordinals found. Run "scan" first.', 'warning');
            } else {
                this.addOutput(`Total ordinals: ${ordinals.length}`, 'success');
                this.addOutput('');
                ordinals.forEach((ord, index) => {
                    this.addOutput(`[${index + 1}] ${ord.id} - ${ord.type}`, 'data');
                });
            }
        }

        async viewOrdinal(ordinalId) {
            this.addOutput(`Fetching ordinal ${ordinalId}...`, 'info');
            
            // Mock ordinal details
            setTimeout(() => {
                this.addOutput('');
                this.addOutput('Ordinal Details:', 'header');
                this.addOutput(`  ID: ${ordinalId}`, 'data');
                this.addOutput('  Number: 12345', 'data');
                this.addOutput('  Rarity: Uncommon', 'data');
                this.addOutput('  Block: 750000', 'data');
                this.addOutput('  Timestamp: 2023-06-15', 'data');
                this.addOutput('');
            }, 1000);
        }

        async exportOrdinals() {
            this.addOutput('Exporting ordinals data...', 'info');
            
            const ordinals = this.app.state.get('ordinals') || [];
            const exportData = {
                wallet: this.app.state.get('currentWallet'),
                ordinals: ordinals,
                exportDate: new Date().toISOString()
            };
            
            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `ordinals_export_${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.addOutput('Export completed successfully', 'success');
        }

        async showStats() {
            this.addOutput('Calculating statistics...', 'info');
            
            setTimeout(() => {
                this.addOutput('');
                this.addOutput('Ordinals Statistics:', 'header');
                this.addOutput('  Total Ordinals: 42', 'data');
                this.addOutput('  Common: 35', 'data');
                this.addOutput('  Uncommon: 5', 'data');
                this.addOutput('  Rare: 2', 'data');
                this.addOutput('  Total Value: 0.0025 BTC', 'data');
                this.addOutput('');
            }, 1000);
        }

        autocomplete(input) {
            const commands = ['help', 'scan', 'list', 'view', 'inscribe', 'export', 'stats', 'clear', 'exit'];
            const currentValue = input.value.toLowerCase();
            
            const matches = commands.filter(cmd => cmd.startsWith(currentValue));
            
            if (matches.length === 1) {
                input.value = matches[0];
            } else if (matches.length > 1) {
                this.addOutput(`Possible commands: ${matches.join(', ')}`, 'info');
            }
        }

        addOutput(text, type = 'default') {
            const output = document.getElementById('ordinals-terminal-output');
            if (!output) return;
            
            const line = document.createElement('div');
            line.className = `terminal-line ${type}`;
            line.textContent = text;
            
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
        }

        clearTerminal() {
            const output = document.getElementById('ordinals-terminal-output');
            if (output) {
                while (output.firstChild) {
                    output.removeChild(output.firstChild);
                }
            }
            this.initializeTerminal();
        }

        setLoading(loading) {
            this.isLoading = loading;
            const input = document.getElementById('ordinals-terminal-input');
            if (input) {
                input.disabled = loading;
                input.placeholder = loading ? 'Processing...' : 'Type "help" for commands...';
            }
        }

        close() {
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
        }

        addStyles() {
            if (document.getElementById('ordinals-terminal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'ordinals-terminal-styles';
            style.textContent = `
                .ordinals-terminal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .ordinals-terminal-modal {
                    width: 90%;
                    max-width: 800px;
                    height: 80vh;
                    background: #000;
                    border: 2px solid var(--text-primary);
                    display: flex;
                    flex-direction: column;
                }
                
                .terminal-header {
                    padding: 15px;
                    border-bottom: 1px solid var(--text-primary);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .terminal-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    overflow: hidden;
                }
                
                .terminal-output {
                    flex: 1;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    padding-bottom: 10px;
                }
                
                .terminal-line {
                    margin: 2px 0;
                }
                
                .terminal-line.header {
                    color: var(--text-primary);
                    font-weight: bold;
                }
                
                .terminal-line.command {
                    color: #00ff00;
                }
                
                .terminal-line.success {
                    color: #00ff00;
                }
                
                .terminal-line.error {
                    color: #ff0000;
                }
                
                .terminal-line.warning {
                    color: #ffaa00;
                }
                
                .terminal-line.info {
                    color: #00aaff;
                }
                
                .terminal-line.data {
                    color: #ffffff;
                }
                
                .terminal-input-line {
                    display: flex;
                    align-items: center;
                    margin-top: 10px;
                    border-top: 1px solid #333;
                    padding-top: 10px;
                }
                
                .terminal-prompt {
                    color: var(--text-primary);
                    margin-right: 10px;
                    font-family: monospace;
                }
                
                .terminal-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #00ff00;
                    font-family: monospace;
                    font-size: 14px;
                    outline: none;
                }
                
                .terminal-input:disabled {
                    color: #666;
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    // Make available globally
    window.OrdinalsTerminalModal = OrdinalsTerminalModal;
    
    // Also attach to MOOSHWalletApp namespace if it exists
    if (window.MOOSHWalletApp) {
        window.MOOSHWalletApp.OrdinalsTerminalModal = OrdinalsTerminalModal;
    }

})(window);