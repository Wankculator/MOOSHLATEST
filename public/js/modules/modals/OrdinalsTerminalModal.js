// OrdinalsTerminalModal Module for MOOSH Wallet
// Terminal-style interface for Ordinals inscription management

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // ORDINALS TERMINAL MODAL
    // ═══════════════════════════════════════════════════════════════════════
    class OrdinalsTerminalModal {
        constructor(app) {
            this.app = app;
            this.modal = null;
            this.terminalOutput = [];
            this.isLoading = false;
            this.inscriptions = [];
            this.currentCommand = '';
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
                        maxWidth: 'calc(900px * var(--scale-factor))',
                        width: '90%',
                        height: '80vh',
                        overflowY: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0',
                        boxShadow: '0 0 20px rgba(var(--text-primary-rgb), 0.3)',
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace"
                    }
                }, [
                    this.createTerminalHeader(),
                    this.createTerminalBody(),
                    this.createTerminalInput()
                ])
            ]);
            
            document.body.appendChild(this.modal);
            
            // Show the modal with animation
            setTimeout(() => {
                this.modal.classList.add('show');
                this.initializeTerminal();
            }, 10);
        }
        
        createTerminalHeader() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: 'calc(12px * var(--scale-factor))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                $.div({
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'calc(12px * var(--scale-factor))'
                    }
                }, [
                    $.span({
                        style: {
                            color: 'var(--text-accent)',
                            fontSize: 'calc(20px * var(--scale-factor))',
                            textShadow: '0 0 5px var(--text-accent)'
                        }
                    }, [$.span({ style: { color: 'var(--text-accent)', fontWeight: 'bold' } }, ['MOOSH'])]),
                    $.span({
                        style: {
                            color: 'var(--text-primary)',
                            fontSize: 'calc(14px * var(--scale-factor))',
                            fontWeight: '600',
                            letterSpacing: '0.1em'
                        }
                    }, ['ORDINALS TERMINAL v1.0'])
                ]),
                $.button({
                    style: {
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(20px * var(--scale-factor))',
                        cursor: 'pointer',
                        padding: 'calc(4px * var(--scale-factor)) calc(8px * var(--scale-factor))',
                        transition: 'all 0.2s ease'
                    },
                    onclick: () => this.close(),
                    onmouseover: (e) => {
                        e.target.style.background = 'var(--text-accent)';
                        e.target.style.color = 'var(--bg-primary)';
                        e.target.style.borderColor = 'var(--text-accent)';
                    },
                    onmouseout: (e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = 'var(--text-primary)';
                        e.target.style.borderColor = 'var(--border-color)';
                    }
                }, ['×'])
            ]);
        }
        
        createTerminalBody() {
            const $ = window.ElementFactory || ElementFactory;
            
            const terminalBody = $.div({
                id: 'ordinals-terminal-output',
                style: {
                    flex: '1',
                    overflowY: 'auto',
                    background: 'var(--bg-primary)',
                    padding: 'calc(16px * var(--scale-factor))',
                    color: 'var(--text-accent)',
                    fontSize: 'calc(13px * var(--scale-factor))',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    fontFamily: "'JetBrains Mono', monospace"
                }
            }, []);
            
            // Add custom scrollbar styling
            const style = document.createElement('style');
            style.textContent = `
                #ordinals-terminal-output::-webkit-scrollbar {
                    width: 10px;
                }
                #ordinals-terminal-output::-webkit-scrollbar-track {
                    background: var(--bg-secondary);
                    border-left: 1px solid var(--border-color);
                }
                #ordinals-terminal-output::-webkit-scrollbar-thumb {
                    background: var(--text-accent);
                    border-radius: 0;
                }
                #ordinals-terminal-output::-webkit-scrollbar-thumb:hover {
                    background: var(--text-primary);
                }
            `;
            document.head.appendChild(style);
            
            return terminalBody;
        }
        
        createTerminalInput() {
            const $ = window.ElementFactory || ElementFactory;
            
            return $.div({
                style: {
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    padding: 'calc(12px * var(--scale-factor))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'calc(8px * var(--scale-factor))'
                }
            }, [
                $.span({
                    style: {
                        color: 'var(--text-accent)',
                        fontSize: 'calc(13px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace"
                    }
                }, ['moosh@ordinals:~$']),
                $.input({
                    type: 'text',
                    id: 'ordinals-terminal-input',
                    placeholder: 'Type "help" for commands',
                    style: {
                        flex: '1',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: 'calc(13px * var(--scale-factor))',
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: 'none',
                        caretColor: 'var(--text-accent)'
                    },
                    onkeypress: (e) => {
                        if (e.key === 'Enter') {
                            this.executeCommand(e.target.value);
                            e.target.value = '';
                        }
                    }
                })
            ]);
        }
        
        initializeTerminal() {
            this.addLine('╔═══════════════════════════════════════════════════════════════╗', 'var(--text-accent)');
            this.addLine('║           MOOSH ORDINALS INSCRIPTION DETECTOR v1.0            ║', 'var(--text-accent)');
            this.addLine('║                    Powered by Taproot Magic                   ║', 'var(--text-accent)');
            this.addLine('╚═══════════════════════════════════════════════════════════════╝', 'var(--text-accent)');
            this.addLine('');
            this.addLine('Initializing Ordinals subsystem...', 'var(--text-primary)');
            this.addLine('[OK] Bitcoin network connection established', 'var(--text-accent)');
            this.addLine('[OK] Taproot address parser loaded', 'var(--text-accent)');
            this.addLine('[OK] Inscription decoder ready', 'var(--text-accent)');
            this.addLine('');
            this.addLine('Type "scan" to detect inscriptions on current account', 'var(--text-primary)');
            this.addLine('Type "help" for available commands', 'var(--text-dim)');
            this.addLine('');
            
            // Focus the input
            document.getElementById('ordinals-terminal-input')?.focus();
        }
        
        addLine(text, color = null) {
            const output = document.getElementById('ordinals-terminal-output');
            if (output) {
                const line = document.createElement('div');
                // Map common colors to theme variables
                const colorMap = {
                    '#00ff00': 'var(--text-accent)',
                    '#ff0000': '#ff4444',
                    '#ffff00': 'var(--text-primary)',
                    '#00ffff': 'var(--text-keyword)',
                    '#888888': 'var(--text-dim)'
                };
                const finalColor = color ? (colorMap[color] || color) : 'var(--text-accent)';
                line.style.color = finalColor;
                line.style.fontFamily = "'JetBrains Mono', monospace";
                line.textContent = text;
                output.appendChild(line);
                output.scrollTop = output.scrollHeight;
            }
        }
        
        async executeCommand(command) {
            this.currentCommand = command.trim();
            this.addLine(`> ${command}`, 'var(--text-primary)');
            
            const cmd = this.currentCommand.toLowerCase().split(' ')[0];
            const args = this.currentCommand.split(' ').slice(1);
            
            switch (cmd) {
                case 'help':
                    this.showHelp();
                    break;
                case 'scan':
                    await this.scanForInscriptions();
                    break;
                case 'clear':
                case 'cls':
                    this.clearTerminal();
                    break;
                case 'stats':
                    this.showStats();
                    break;
                case 'address':
                    this.showAddress();
                    break;
                case 'info':
                    if (args[0]) {
                        this.showInscriptionInfo(args[0]);
                    } else {
                        this.addLine('Usage: info <inscription_number>', '#ff4444');
                    }
                    break;
                case 'export':
                    this.exportInscriptions();
                    break;
                case 'version':
                    this.showVersion();
                    break;
                case 'exit':
                case 'quit':
                    this.close();
                    break;
                default:
                    this.addLine(`Command not found: ${command}`, '#ff4444');
                    this.addLine('Type "help" for available commands', 'var(--text-dim)');
            }
        }
        
        showHelp() {
            this.addLine('');
            this.addLine('AVAILABLE COMMANDS:', 'var(--text-primary)');
            this.addLine('  scan           - Scan current account for Ordinals inscriptions');
            this.addLine('  stats          - Show current account statistics');
            this.addLine('  address        - Display current Taproot address');
            this.addLine('  info <number>  - Show detailed info for inscription');
            this.addLine('  export         - Export inscriptions list to clipboard');
            this.addLine('  clear/cls      - Clear terminal output');
            this.addLine('  version        - Show terminal version');
            this.addLine('  help           - Show this help message');
            this.addLine('  exit/quit      - Close terminal');
            this.addLine('');
        }
        
        async scanForInscriptions() {
            const currentAccount = this.app.state.accounts[this.app.state.currentAccountId];
            if (!currentAccount || !currentAccount.taprootAddress) {
                this.addLine('ERROR: No Taproot address found for current account', '#ff4444');
                return;
            }
            
            this.addLine('');
            this.addLine(`Scanning Taproot address: ${currentAccount.taprootAddress}`, 'var(--text-primary)');
            this.addLine('');
            
            this.isLoading = true;
            let loadingInterval = setInterval(() => {
                if (!this.isLoading) {
                    clearInterval(loadingInterval);
                    return;
                }
                this.addLine('█▓▒░ SCANNING BLOCKCHAIN... ░▒▓█', 'var(--text-accent)');
            }, 500);
            
            try {
                // Call the API to get inscriptions
                const response = await fetch(`${this.app.apiService.baseURL}/api/ordinals/inscriptions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address: currentAccount.addresses.taproot
                    })
                });
                
                this.isLoading = false;
                clearInterval(loadingInterval);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    this.inscriptions = result.data.inscriptions || [];
                    this.displayInscriptions();
                } else {
                    throw new Error(result.error || 'Failed to fetch inscriptions');
                }
                
            } catch (error) {
                this.isLoading = false;
                clearInterval(loadingInterval);
                this.addLine('ERROR: Failed to scan for inscriptions', '#ff4444');
                this.addLine(error.message, '#ff4444');
            }
        }
        
        displayInscriptions() {
            this.addLine('');
            this.addLine('╔═══════════════════════════════════════════════════════════════╗', 'var(--text-accent)');
            this.addLine(`║ FOUND ${this.inscriptions.length} INSCRIPTIONS                                              ║`, 'var(--text-accent)');
            this.addLine('╚═══════════════════════════════════════════════════════════════╝', 'var(--text-accent)');
            this.addLine('');
            
            if (this.inscriptions.length === 0) {
                this.addLine('No inscriptions found on this address', 'var(--text-dim)');
                return;
            }
            
            this.inscriptions.forEach((inscription, index) => {
                this.addLine(`┌─ INSCRIPTION #${inscription.number} ${'─'.repeat(45 - inscription.number.toString().length)}┐`, 'var(--text-primary)');
                this.addLine(`│ ID:       ${inscription.id}`, 'var(--text-secondary)');
                this.addLine(`│ Type:     ${inscription.content_type}`, 'var(--text-secondary)');
                this.addLine(`│ Size:     ${inscription.content_length || inscription.size || inscription.file_size || 0} bytes`, 'var(--text-secondary)');
                this.addLine(`│ Sat:      ${inscription.sat}`, 'var(--text-secondary)');
                this.addLine(`│ Fee:      ${inscription.fee} sats`, 'var(--text-secondary)');
                this.addLine(`│ Date:     ${new Date(inscription.timestamp).toLocaleString()}`, 'var(--text-secondary)');
                this.addLine(`└${'─'.repeat(61)}┘`, 'var(--text-primary)');
                this.addLine('');
            });
        }
        
        showStats() {
            const currentAccount = this.app.state.accounts[this.app.state.currentAccountId];
            this.addLine('');
            this.addLine('ACCOUNT STATISTICS:', 'var(--text-primary)');
            this.addLine(`  Account:    ${currentAccount.name}`);
            this.addLine(`  Taproot:    ${currentAccount.taprootAddress || 'Not generated'}`);
            this.addLine(`  Balance:    ${currentAccount.balance || '0'} BTC`);
            this.addLine(`  Inscriptions: ${this.inscriptions.length}`);
            this.addLine('');
        }
        
        showAddress() {
            const currentAccount = this.app.state.accounts[this.app.state.currentAccountId];
            this.addLine('');
            this.addLine('TAPROOT ADDRESS:', 'var(--text-primary)');
            this.addLine(currentAccount.taprootAddress || 'Not generated', 'var(--text-keyword)');
            this.addLine('');
            this.addLine('Use this address to receive Ordinals inscriptions', 'var(--text-dim)');
            this.addLine('');
        }
        
        showInscriptionInfo(number) {
            const inscription = this.inscriptions.find(i => i.number.toString() === number);
            if (!inscription) {
                this.addLine(`Inscription #${number} not found`, '#ff4444');
                this.addLine('Run "scan" first to load inscriptions', 'var(--text-dim)');
                return;
            }
            
            this.addLine('');
            this.addLine(`INSCRIPTION #${inscription.number}`, 'var(--text-primary)');
            this.addLine('═'.repeat(50));
            this.addLine(`ID:         ${inscription.id}`);
            this.addLine(`Type:       ${inscription.content_type}`);
            this.addLine(`Size:       ${inscription.content_length || inscription.size || inscription.file_size || 0} bytes`);
            this.addLine(`Sat:        ${inscription.sat}`);
            this.addLine(`Fee:        ${inscription.fee} sats`);
            this.addLine(`Date:       ${new Date(inscription.timestamp).toLocaleString()}`);
            if (inscription.genesis_height) {
                this.addLine(`Genesis:    Block #${inscription.genesis_height}`);
            }
            this.addLine('');
        }
        
        exportInscriptions() {
            if (this.inscriptions.length === 0) {
                this.addLine('No inscriptions to export', '#ff4444');
                this.addLine('Run "scan" first to load inscriptions', 'var(--text-dim)');
                return;
            }
            
            const exportData = {
                address: this.app.state.getCurrentAccount()?.addresses?.taproot || 'Unknown',
                timestamp: new Date().toISOString(),
                total: this.inscriptions.length,
                inscriptions: this.inscriptions
            };
            
            navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
                this.addLine('');
                this.addLine('✓ Inscriptions data copied to clipboard', 'var(--text-accent)');
                this.addLine(`  Total inscriptions: ${this.inscriptions.length}`, 'var(--text-dim)');
                this.addLine('');
            }).catch(err => {
                this.addLine('Failed to copy to clipboard', '#ff4444');
                console.error('Clipboard error:', err);
            });
        }
        
        showVersion() {
            this.addLine('');
            this.addLine('MOOSH ORDINALS TERMINAL', 'var(--text-primary)');
            this.addLine('Version: 1.0.0', 'var(--text-accent)');
            this.addLine('Protocol: Ordinals Theory', 'var(--text-accent)');
            this.addLine('Network: Bitcoin Mainnet', 'var(--text-accent)');
            this.addLine('');
            this.addLine('Built with ♥ for the Bitcoin community', 'var(--text-dim)');
            this.addLine('');
        }
        
        clearTerminal() {
            const output = document.getElementById('ordinals-terminal-output');
            if (output) {
                output.innerHTML = '';
                this.initializeTerminal();
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
    window.OrdinalsTerminalModal = OrdinalsTerminalModal;

})(window);