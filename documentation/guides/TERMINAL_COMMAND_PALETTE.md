# Terminal Command Palette Implementation

## Overview
The terminal prompt `~/moosh/wallet/dashboard $` on the dashboard is now interactive and opens a command palette when clicked.

## Features

### 1. Click Functionality
- **Hover Effect**: Terminal header highlights on hover with orange background
- **Visual Feedback**: Text color changes to orange on hover
- **Cursor**: Shows pointer cursor to indicate it's clickable
- **Tooltip**: "Click to show terminal commands"

### 2. Command Palette
When clicked, a dropdown command palette appears with:
- **Command Input**: Type commands directly with `$` prompt
- **Available Commands**:
  - `balance` - Show detailed balance information
  - `export` - Export wallet data (coming soon)
  - `history` - Show transaction history (coming soon)
  - `refresh` - Refresh all data
  - `accounts` - Manage accounts
  - `help` - Show available commands

### 3. Interactive Features
- **Search/Filter**: Type to filter commands in real-time
- **Keyboard Shortcuts**:
  - `Enter` - Execute typed command
  - `Escape` - Close command palette
- **Click to Execute**: Click any command to run it
- **Click Outside**: Closes the palette

### 4. Command Actions
- **balance**: Shows total BTC across all accounts
- **refresh**: Refreshes dashboard data
- **accounts**: Opens account manager modal
- **help**: Shows list of available commands

## Technical Implementation

### Method: handleTerminalClick()
```javascript
handleTerminalClick() {
    // Creates command palette with:
    // - Input field for typing commands
    // - List of available commands
    // - Real-time filtering
    // - Keyboard navigation
}
```

### Styling
- Black background with orange border
- Monospace font (JetBrains Mono)
- Hover effects on commands
- Drop shadow for depth

## User Experience

1. **Discovery**: Users see hover effect on terminal prompt
2. **Interaction**: Click opens command palette
3. **Execution**: Type or click commands
4. **Feedback**: Immediate action or notification

## Future Enhancements
- Add more commands (send, receive, settings)
- Command history with up/down arrows
- Tab completion for commands
- Custom command aliases
- Command parameters (e.g., `balance btc`)

## Result
The terminal prompt is now an interactive element that provides quick access to common wallet functions through a terminal-style interface, enhancing the terminal aesthetic while adding practical functionality.