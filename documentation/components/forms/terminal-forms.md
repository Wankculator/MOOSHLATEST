# Terminal Forms Documentation

## Overview
Terminal forms provide command-line interfaces within MOOSH Wallet for advanced operations, debugging, and Spark Protocol interactions.

## 1. Main Terminal Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 27834-27837
- **Component**: TerminalInterface

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'terminal-command-input',
    placeholder: 'Type a command...',
    className: 'terminal-input',
    autocomplete: 'off',
    spellcheck: false,
    style: {
        width: '100%',
        background: 'transparent',
        border: 'none',
        color: '#00ff00',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '14px',
        outline: 'none'
    },
    onkeydown: (e) => this.handleTerminalKey(e),
    oninput: (e) => this.handleTerminalInput(e)
})
```

### Command History Navigation
```javascript
handleTerminalKey(event) {
    switch(event.key) {
        case 'Enter':
            event.preventDefault();
            this.executeCommand(event.target.value);
            this.commandHistory.push(event.target.value);
            this.historyIndex = this.commandHistory.length;
            event.target.value = '';
            break;
            
        case 'ArrowUp':
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                event.target.value = this.commandHistory[this.historyIndex];
            }
            break;
            
        case 'ArrowDown':
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                event.target.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                event.target.value = '';
            }
            break;
            
        case 'Tab':
            event.preventDefault();
            this.autocompleteCommand(event.target);
            break;
            
        case 'Escape':
            event.target.value = '';
            this.clearSuggestions();
            break;
    }
}
```

---

## 2. Spark Terminal Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 9702-9705, 12597-12600, 14746-14749, 28770-28773
- **Component**: SparkTerminal

### Implementation
```javascript
$.input({
    className: 'terminal-input',
    placeholder: 'Enter Spark command...',
    autocomplete: 'off',
    spellcheck: false,
    onkeypress: (e) => {
        if (e.key === 'Enter') {
            const command = e.target.value.trim();
            if (command) {
                this.executeSparkCommand(command);
                e.target.value = '';
            }
        }
    },
    onfocus: () => this.showCommandHints(),
    onblur: () => setTimeout(() => this.hideCommandHints(), 200)
})
```

### Spark Command Parser
```javascript
executeSparkCommand(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    const commands = {
        'balance': () => this.showSparkBalance(),
        'send': (address, amount) => this.sendSpark(address, amount),
        'receive': (amount) => this.generateSparkInvoice(amount),
        'history': () => this.showSparkHistory(),
        'channels': () => this.listChannels(),
        'connect': (nodeUri) => this.connectPeer(nodeUri),
        'open': (pubkey, amount) => this.openChannel(pubkey, amount),
        'close': (channelId) => this.closeChannel(channelId),
        'help': () => this.showSparkHelp(),
        'clear': () => this.clearTerminal()
    };
    
    if (commands[command]) {
        try {
            commands[command](...args);
            this.addToHistory(input);
        } catch (error) {
            this.showError(`Error executing ${command}: ${error.message}`);
        }
    } else {
        this.showError(`Unknown command: ${command}. Type 'help' for available commands.`);
    }
}
```

---

## 3. Ordinals Terminal

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 22866-22869
- **Component**: OrdinalsTerminal

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'ordinals-terminal-input',
    placeholder: 'Type "help" for commands',
    className: 'terminal-input ordinals-terminal',
    autocomplete: 'off',
    spellcheck: false,
    style: {
        background: '#000',
        border: '1px solid #ff6b00',
        color: '#ff6b00',
        fontFamily: 'JetBrains Mono, monospace'
    },
    onkeydown: (e) => {
        if (e.key === 'Enter') {
            this.executeOrdinalsCommand(e.target.value);
            e.target.value = '';
        }
    }
})
```

### Ordinals Commands
```javascript
const ordinalsCommands = {
    'list': {
        description: 'List all inscriptions',
        usage: 'list [address]',
        handler: (args) => this.listInscriptions(args[0])
    },
    'view': {
        description: 'View inscription details',
        usage: 'view <inscription_id>',
        handler: (args) => this.viewInscription(args[0])
    },
    'send': {
        description: 'Send inscription',
        usage: 'send <inscription_id> <address>',
        handler: (args) => this.sendInscription(args[0], args[1])
    },
    'inscribe': {
        description: 'Create new inscription',
        usage: 'inscribe <file> [fee_rate]',
        handler: (args) => this.createInscription(args[0], args[1])
    },
    'decode': {
        description: 'Decode inscription data',
        usage: 'decode <inscription_id>',
        handler: (args) => this.decodeInscription(args[0])
    }
};
```

---

## 4. Debug Console Input

### Location
- **File**: `/public/js/moosh-wallet.js`
- **Component**: DebugConsole

### Implementation
```javascript
$.input({
    type: 'text',
    id: 'debug-console',
    placeholder: 'Enter debug command or JS expression...',
    className: 'debug-input',
    autocomplete: 'off',
    style: {
        fontFamily: 'Consolas, Monaco, monospace',
        fontSize: '12px',
        background: '#1a1a1a',
        color: '#00ff00'
    },
    onkeydown: (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.evaluateDebugCommand(e.target.value);
        }
    }
})
```

### Debug Command Evaluation
```javascript
evaluateDebugCommand(command) {
    // Log the command
    this.logDebug('> ' + command, 'input');
    
    try {
        // Check for special debug commands
        if (command.startsWith(':')) {
            this.executeDebugCommand(command.slice(1));
            return;
        }
        
        // Evaluate as JavaScript in wallet context
        const result = (function() {
            return eval(command);
        }).call(this.app);
        
        // Log result
        this.logDebug(this.formatResult(result), 'output');
        
    } catch (error) {
        this.logDebug(`Error: ${error.message}`, 'error');
        this.logDebug(error.stack, 'trace');
    }
}
```

---

## 5. Command Autocomplete

### Implementation
```javascript
autocompleteCommand(input) {
    const value = input.value;
    const cursorPos = input.selectionStart;
    const beforeCursor = value.slice(0, cursorPos);
    const afterCursor = value.slice(cursorPos);
    
    // Get current word being typed
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    
    // Find matching commands
    const matches = this.availableCommands
        .filter(cmd => cmd.startsWith(currentWord))
        .sort();
    
    if (matches.length === 0) return;
    
    if (matches.length === 1) {
        // Complete the command
        const completion = matches[0].slice(currentWord.length);
        input.value = beforeCursor + completion + afterCursor;
        input.setSelectionRange(cursorPos + completion.length, cursorPos + completion.length);
    } else {
        // Show suggestions
        this.showSuggestions(matches, currentWord);
    }
}
```

### Suggestion Display
```javascript
showSuggestions(suggestions, prefix) {
    const suggestionBox = $.div({
        className: 'terminal-suggestions',
        style: {
            position: 'absolute',
            bottom: '100%',
            left: '0',
            background: '#1a1a1a',
            border: '1px solid #00ff00',
            padding: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
        }
    });
    
    suggestions.forEach(suggestion => {
        suggestionBox.appendChild(
            $.div({
                className: 'suggestion-item',
                onclick: () => this.completeSuggestion(suggestion),
                children: [
                    $.span({ style: { color: '#00ff00' } }, prefix),
                    $.span({ style: { color: '#888' } }, suggestion.slice(prefix.length))
                ]
            })
        );
    });
    
    this.terminalContainer.appendChild(suggestionBox);
}
```

---

## Common Patterns

### 1. Command Parsing
```javascript
parseCommand(input) {
    // Handle quoted arguments
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const args = [];
    let match;
    
    while ((match = regex.exec(input)) !== null) {
        args.push(match[1] || match[2] || match[0]);
    }
    
    return {
        command: args[0],
        args: args.slice(1),
        raw: input
    };
}
```

### 2. Output Formatting
```javascript
formatTerminalOutput(data, type = 'info') {
    const colors = {
        info: '#00ff00',
        error: '#ff0000',
        warning: '#ffff00',
        success: '#00ff00',
        debug: '#888888'
    };
    
    return $.div({
        className: `terminal-output ${type}`,
        style: { color: colors[type] || '#ffffff' },
        children: [
            $.span({ className: 'timestamp' }, new Date().toLocaleTimeString()),
            $.span({ className: 'output-text' }, data)
        ]
    });
}
```

### 3. Terminal State Management
```javascript
class TerminalState {
    constructor() {
        this.history = [];
        this.historyIndex = 0;
        this.suggestions = [];
        this.context = {};
        this.aliases = {
            'ls': 'list',
            'rm': 'remove',
            'mv': 'move',
            'cp': 'copy'
        };
    }
    
    addToHistory(command) {
        if (command && command !== this.history[this.history.length - 1]) {
            this.history.push(command);
            if (this.history.length > 100) {
                this.history.shift();
            }
        }
        this.historyIndex = this.history.length;
    }
}
```

## Mobile Considerations

### Virtual Keyboard
```javascript
// Prevent keyboard from covering terminal
handleKeyboardShow() {
    const terminal = document.querySelector('.terminal-container');
    terminal.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Adjust terminal height
adjustTerminalHeight() {
    const visualViewport = window.visualViewport;
    if (visualViewport) {
        const height = visualViewport.height;
        this.terminalContainer.style.maxHeight = `${height * 0.4}px`;
    }
}
```

### Touch Gestures
- Swipe up: Show command history
- Swipe down: Hide terminal
- Double tap: Clear terminal

## Security Considerations

### Command Sanitization
```javascript
sanitizeCommand(command) {
    // Prevent injection attacks
    const dangerous = ['eval', 'Function', 'setTimeout', 'setInterval'];
    
    dangerous.forEach(keyword => {
        if (command.includes(keyword)) {
            throw new Error(`Security: '${keyword}' is not allowed`);
        }
    });
    
    return command;
}
```

### Restricted Commands
- No direct file system access
- No network requests without confirmation
- No access to private keys
- Logging of all executed commands

## Testing Checklist

- [ ] Command history navigation
- [ ] Tab completion
- [ ] Argument parsing (quoted strings)
- [ ] Error handling
- [ ] Suggestion display
- [ ] Mobile keyboard behavior
- [ ] Command aliases
- [ ] Output scrolling
- [ ] Security restrictions
- [ ] Performance with long output