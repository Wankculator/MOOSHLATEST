# Keyboard Shortcuts

**Status**: 🟡 Beta
**Type**: Enhancement
**Security Critical**: No
**Implementation**: /public/js/moosh-wallet.js:4117-4123, 12071-12077, 14220-14226, keyboard event handlers

## Overview
Keyboard shortcuts provide power users with efficient navigation and control of wallet functions. The system implements common shortcuts for navigation, actions, and accessibility, enhancing productivity without requiring mouse interaction.

## User Flow
```
[Press Shortcut Key] → [Action Triggered] → [Visual Feedback] → [Task Completed] → [Focus Updated]
```

## Technical Implementation

### Frontend
- **Entry Point**: Global keydown event listeners
- **UI Components**: 
  - Shortcut help modal
  - Visual key indicators
  - Focus management
  - Action feedback
- **State Changes**: 
  - Current focus tracking
  - Shortcut mode flags
  - Action history

### Backend
- **API Endpoints**: None (client-side only)
- **Services Used**: Browser keyboard events
- **Data Flow**: 
  1. Keydown event captured
  2. Shortcut combination checked
  3. Action executed
  4. UI updated
  5. Focus managed

## Code Example
```javascript
// Keyboard shortcuts implementation
class KeyboardShortcutManager {
    constructor(app) {
        this.app = app;
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.currentChord = null;
        this.chordTimeout = null;
        
        this.initializeShortcuts();
    }
    
    initializeShortcuts() {
        // Define shortcuts
        this.defineShortcuts();
        
        // Set up global listener
        document.addEventListener('keydown', (e) => this.handleKeydown(e), true);
        document.addEventListener('keyup', (e) => this.handleKeyup(e), true);
        
        // Load user preferences
        this.loadUserShortcuts();
    }
    
    defineShortcuts() {
        // Navigation shortcuts
        this.addShortcut('Alt+W', 'Go to Wallet', () => {
            this.app.router.navigate('/dashboard');
        });
        
        this.addShortcut('Alt+S', 'Go to Settings', () => {
            this.app.router.navigate('/settings');
        });
        
        this.addShortcut('Alt+T', 'Go to Transactions', () => {
            this.app.router.navigate('/transactions');
        });
        
        // Action shortcuts
        this.addShortcut('Ctrl+N', 'New Wallet', () => {
            this.app.createNewWallet();
        });
        
        this.addShortcut('Ctrl+R', 'Receive', () => {
            this.app.showReceiveModal();
        });
        
        this.addShortcut('Ctrl+S', 'Send', () => {
            this.app.showSendModal();
        });
        
        this.addShortcut('Ctrl+C', 'Copy Address', () => {
            this.copyCurrentAddress();
        });
        
        // View shortcuts
        this.addShortcut('Ctrl+/', 'Toggle Terminal', () => {
            this.app.toggleTerminal();
        });
        
        this.addShortcut('Ctrl+K', 'Command Palette', () => {
            this.showCommandPalette();
        });
        
        this.addShortcut('?', 'Show Help', () => {
            this.showShortcutHelp();
        });
        
        // Wallet switching (1-9)
        for (let i = 1; i <= 9; i++) {
            this.addShortcut(`Alt+${i}`, `Switch to Wallet ${i}`, () => {
                this.app.switchToWallet(i - 1);
            });
        }
        
        // Modal shortcuts
        this.addShortcut('Escape', 'Close Modal', () => {
            this.closeActiveModal();
        });
        
        this.addShortcut('Enter', 'Confirm Action', () => {
            this.confirmActiveAction();
        });
        
        // Advanced shortcuts (vim-style)
        this.addShortcut('g g', 'Go to Top', () => {
            window.scrollTo(0, 0);
        });
        
        this.addShortcut('G', 'Go to Bottom', () => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        
        this.addShortcut('/', 'Search', () => {
            this.focusSearch();
        });
    }
    
    addShortcut(keys, description, handler) {
        const normalizedKeys = this.normalizeKeys(keys);
        this.shortcuts.set(normalizedKeys, {
            keys: keys,
            description: description,
            handler: handler,
            enabled: true
        });
    }
    
    normalizeKeys(keys) {
        // Normalize key combination for consistent matching
        return keys
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .split(' ')
            .map(part => {
                return part
                    .split('+')
                    .map(key => {
                        // Normalize modifier keys
                        switch (key) {
                            case 'ctrl':
                            case 'control':
                                return 'ctrl';
                            case 'alt':
                            case 'option':
                                return 'alt';
                            case 'shift':
                                return 'shift';
                            case 'cmd':
                            case 'command':
                            case 'meta':
                                return 'meta';
                            default:
                                return key;
                        }
                    })
                    .sort()
                    .join('+');
            })
            .join(' ');
    }
    
    handleKeydown(e) {
        if (!this.isEnabled) return;
        
        // Skip if in input field (unless specific override)
        if (this.isInputElement(e.target) && !e.ctrlKey && !e.metaKey) {
            return;
        }
        
        const key = this.getKeyCombo(e);
        
        // Check for chord continuation
        if (this.currentChord) {
            const fullCombo = `${this.currentChord} ${key}`;
            const shortcut = this.shortcuts.get(fullCombo);
            
            if (shortcut && shortcut.enabled) {
                e.preventDefault();
                e.stopPropagation();
                
                this.executeShortcut(shortcut);
                this.clearChord();
                return;
            }
            
            // Clear chord if no match
            this.clearChord();
        }
        
        // Check for single key shortcut
        const shortcut = this.shortcuts.get(key);
        if (shortcut && shortcut.enabled) {
            e.preventDefault();
            e.stopPropagation();
            
            this.executeShortcut(shortcut);
            return;
        }
        
        // Check if this starts a chord
        const isChordStart = Array.from(this.shortcuts.keys()).some(k => 
            k.startsWith(key + ' ')
        );
        
        if (isChordStart) {
            e.preventDefault();
            this.startChord(key);
        }
    }
    
    getKeyCombo(e) {
        const modifiers = [];
        if (e.ctrlKey) modifiers.push('ctrl');
        if (e.altKey) modifiers.push('alt');
        if (e.shiftKey) modifiers.push('shift');
        if (e.metaKey) modifiers.push('meta');
        
        let key = e.key.toLowerCase();
        
        // Normalize special keys
        switch (key) {
            case ' ':
                key = 'space';
                break;
            case 'arrowup':
                key = 'up';
                break;
            case 'arrowdown':
                key = 'down';
                break;
            case 'arrowleft':
                key = 'left';
                break;
            case 'arrowright':
                key = 'right';
                break;
        }
        
        modifiers.push(key);
        return modifiers.sort().join('+');
    }
    
    startChord(key) {
        this.currentChord = key;
        
        // Show chord indicator
        this.showChordIndicator(key);
        
        // Set timeout to clear chord
        this.chordTimeout = setTimeout(() => {
            this.clearChord();
        }, 1000);
    }
    
    clearChord() {
        this.currentChord = null;
        clearTimeout(this.chordTimeout);
        this.hideChordIndicator();
    }
    
    executeShortcut(shortcut) {
        try {
            shortcut.handler();
            
            // Show feedback
            this.showShortcutFeedback(shortcut.description);
            
            // Log for analytics
            console.log(`Shortcut executed: ${shortcut.keys}`);
            
        } catch (error) {
            console.error(`Shortcut error: ${shortcut.keys}`, error);
            this.app.showNotification('Shortcut action failed', 'error');
        }
    }
    
    isInputElement(element) {
        const tagName = element.tagName.toLowerCase();
        return tagName === 'input' || 
               tagName === 'textarea' || 
               tagName === 'select' ||
               element.contentEditable === 'true';
    }
    
    showShortcutHelp() {
        const modal = document.createElement('div');
        modal.className = 'shortcut-help-modal';
        
        const shortcuts = Array.from(this.shortcuts.entries())
            .filter(([_, s]) => s.enabled)
            .sort((a, b) => a[1].keys.localeCompare(b[1].keys));
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Keyboard Shortcuts</h2>
                <div class="shortcut-sections">
                    ${this.groupShortcuts(shortcuts)}
                </div>
                <div class="modal-footer">
                    <kbd>?</kbd> to toggle this help
                    <kbd>Esc</kbd> to close
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus trap
        this.app.accessibility.createFocusTrap(modal);
    }
    
    groupShortcuts(shortcuts) {
        const groups = {
            Navigation: [],
            Actions: [],
            Wallet: [],
            Other: []
        };
        
        shortcuts.forEach(([key, shortcut]) => {
            if (shortcut.description.includes('Go to')) {
                groups.Navigation.push(shortcut);
            } else if (shortcut.description.includes('Wallet')) {
                groups.Wallet.push(shortcut);
            } else if (['Send', 'Receive', 'Copy'].some(a => 
                shortcut.description.includes(a))) {
                groups.Actions.push(shortcut);
            } else {
                groups.Other.push(shortcut);
            }
        });
        
        return Object.entries(groups)
            .filter(([_, shortcuts]) => shortcuts.length > 0)
            .map(([group, shortcuts]) => `
                <div class="shortcut-group">
                    <h3>${group}</h3>
                    <dl>
                        ${shortcuts.map(s => `
                            <dt><kbd>${this.formatKeys(s.keys)}</kbd></dt>
                            <dd>${s.description}</dd>
                        `).join('')}
                    </dl>
                </div>
            `).join('');
    }
    
    formatKeys(keys) {
        return keys
            .split('+')
            .map(k => k.charAt(0).toUpperCase() + k.slice(1))
            .join(' + ');
    }
    
    showCommandPalette() {
        // Command palette for quick actions
        const palette = new CommandPalette({
            commands: this.getCommands(),
            onSelect: (command) => command.action()
        });
        palette.show();
    }
    
    getCommands() {
        const commands = [];
        
        // Add shortcut commands
        this.shortcuts.forEach((shortcut, keys) => {
            commands.push({
                name: shortcut.description,
                keywords: keys.split(/[\s+]+/),
                action: shortcut.handler,
                shortcut: shortcut.keys
            });
        });
        
        // Add additional commands
        commands.push({
            name: 'Toggle Dark Mode',
            keywords: ['theme', 'dark', 'light'],
            action: () => this.app.toggleTheme()
        });
        
        return commands;
    }
}

// CSS for keyboard shortcuts
const keyboardShortcutStyles = `
/* Shortcut indicators */
kbd {
    display: inline-block;
    padding: 0.2em 0.4em;
    font-size: 0.875em;
    font-family: monospace;
    line-height: 1;
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 3px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.2);
}

/* Chord indicator */
.chord-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: var(--bg-secondary);
    border: 2px solid var(--text-accent);
    border-radius: 5px;
    font-family: monospace;
    z-index: 9999;
}

/* Shortcut feedback */
.shortcut-feedback {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background: var(--text-accent);
    color: var(--bg-primary);
    border-radius: 5px;
    animation: fadeInOut 2s ease;
    z-index: 9999;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
}

/* Help modal */
.shortcut-help-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.shortcut-sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-height: 70vh;
    overflow-y: auto;
}

.shortcut-group dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    align-items: center;
}
`;
```

## Configuration
- **Settings**: 
  - Shortcuts enabled by default
  - Customizable key bindings
  - Chord timeout: 1 second
  - Context-aware shortcuts
- **Defaults**: 
  - Standard OS conventions
  - Vim-style navigation
  - No conflicts with browser
  - Input field protection
- **Limits**: 
  - Max chord length: 2 keys
  - Timeout between chords
  - Platform-specific mods

## Security Considerations
- No security risks
- No sensitive actions on single key
- Confirmation for destructive actions
- No clipboard access without user action

## Performance Impact
- **Load Time**: Instant
- **Memory**: Minimal
- **Network**: None

## Mobile Considerations
- Physical keyboard only
- No touch shortcuts
- Bluetooth keyboard support
- Visual indicators larger
- Alternative touch actions

## Error Handling
- **Common Errors**: 
  - Key conflicts
  - Browser override
  - Focus issues
  - Platform differences
- **Recovery**: 
  - Fallback to mouse
  - Clear error messages
  - Help documentation
  - Disable shortcuts option

## Testing
```bash
# Test keyboard shortcuts
1. Navigation shortcuts:
   - Alt+W for wallet
   - Alt+S for settings
   - Alt+T for transactions
   
2. Action shortcuts:
   - Ctrl+N new wallet
   - Ctrl+R receive
   - Ctrl+S send
   
3. Modal control:
   - Escape to close
   - Enter to confirm
   - Tab navigation
   
4. Advanced features:
   - ? for help
   - Ctrl+K command palette
   - g g go to top
```

## Future Enhancements
- **Customization**:
  - User-defined shortcuts
  - Import/export configs
  - Per-page shortcuts
  - Macro recording
  - Shortcut themes
- **Advanced Features**:
  - Multi-key sequences
  - Context menus
  - Quick actions
  - Gesture combinations
  - Voice shortcuts
- **Integration**:
  - OS-level shortcuts
  - Browser extensions
  - Mobile keyboard
  - Gaming controllers
  - Accessibility devices