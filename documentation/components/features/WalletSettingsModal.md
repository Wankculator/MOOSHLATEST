# WalletSettingsModal Component

## Component Name
WalletSettingsModal

## Exact Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 24634-25395
- **Class Definition**: `class WalletSettingsModal`
- **Key Methods**:
  - `show()`: Lines 24640-24705
  - `createSettingsTabs()`: Lines 25120-25137
  - `createSecuritySettings()`: Lines 25260-25290

## UI Design (Visual Details for AI Recreation)

### Modal Structure
- **Overlay**: Full screen, semi-transparent black (rgba(0,0,0,0.8))
- **Container**: 
  - Max width: 800px (desktop), 95% (mobile)
  - Background: #000000
  - Border: 2px solid #f57315 (MOOSH mode: #69fd97)
  - Border radius: 0 (sharp corners)
  - Min height: 600px

### Header
- **Title**: "⚙ Wallet Settings"
- **Font**: JetBrains Mono, 24px, weight 600
- **Close Button**: "×" in top right, 32px size
- **Bottom Border**: 1px solid #333333

### Tab Navigation
- **Tabs**: Accounts, General, Security, Network, Advanced
- **Active Tab Style**:
  - Background: #f57315
  - Color: #000000
  - Border bottom: 3px solid
- **Inactive Tab Style**:
  - Background: transparent
  - Color: #888888
  - Hover: Color becomes #f57315

### Content Sections

#### Accounts Tab
- **Description**: "Click on any account to view its details"
- **Account List**:
  - Each wallet type in separate box
  - Shows: Name, Address prefix, Type (BIP44/49/84)
  - Click action: Opens account details
  - Hover: Border becomes orange

#### General Tab
- **Display Currency**: Dropdown (USD, EUR, GBP, BTC)
- **Language**: Dropdown (English, Español, Français, Deutsch)
- **Theme Toggle**: MOOSH Mode switch
- **Notification Settings**: Checkboxes for various alerts

#### Security Tab
- **Show Seed Phrase**: Warning button (requires password)
- **Export Private Key**: Warning button (requires password)
- **Change Password**: Opens password change dialog
- **Auto-lock Timer**: Dropdown (15, 30, 60 minutes, never)

#### Network Tab
- **Bitcoin Network**: Dropdown (Mainnet, Testnet, Signet)
- **Electrum Server**: Text input with default
- **API Endpoint**: Text input for custom API
- **Connection Status**: Live indicator

#### Advanced Tab
- **Address Gap Limit**: Number input (1-100)
- **Fee Rate**: Dropdown (Low, Medium, High, Custom)
- **Developer Mode**: Toggle switch
- **Export All Data**: Button with warning
- **Delete Wallet**: Danger zone with confirmation

## Function (What It Does)

1. **Settings Management**: Central hub for all wallet configurations
2. **Account Viewing**: Access to wallet details and keys
3. **Security Controls**: Password management and key export
4. **Network Configuration**: Switch between networks and servers
5. **Advanced Options**: Power user features and data export

## Architecture (Code Structure)

```javascript
class WalletSettingsModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.activeTab = 'Accounts';
    }
    
    show() {
        // Create modal overlay and container
        this.modal = $.div({ className: 'modal-overlay' }, [
            $.div({ className: 'modal-container settings-modal' }, [
                this.createHeader(),
                this.createSettingsTabs()
            ])
        ]);
        
        // Add to DOM and animate
        document.body.appendChild(this.modal);
        this.addStyles();
        setTimeout(() => this.modal.classList.add('show'), 10);
    }
    
    switchTab(tabName) {
        this.activeTab = tabName;
        const panel = document.getElementById('settings-panel');
        
        // Clear and render new content
        panel.innerHTML = '';
        switch(tabName) {
            case 'Accounts': 
                panel.appendChild(this.createAccountsSettings());
                break;
            case 'Security':
                panel.appendChild(this.createSecuritySettings());
                break;
            // ... other tabs
        }
    }
    
    close() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(this.modal);
        }, 300);
    }
}
```

## Connections (Related Components)

### Parent Components
- **DashboardPage** - Opens settings via action button
- **WalletDetailsPage** - Alternative entry point

### Child Components
- **PasswordModal** - For password verification
- **SeedPhraseModal** - Shows seed with security
- **ExportModal** - For data/key export

### Data Dependencies
- **LocalStorage**: Settings preferences
- **State**: Current account, network settings
- **Secure Storage**: For sensitive operations

### Navigation Flow
1. **To Settings**: Dashboard → Settings button click
2. **Within Settings**: Tab navigation
3. **From Settings**: Close modal or navigate to account details

## Purpose in Wallet

1. **Configuration Center**: All wallet settings in one place
2. **Security Management**: Control access and export keys
3. **Network Flexibility**: Switch between mainnet/testnet
4. **User Preferences**: Customize display and behavior
5. **Advanced Features**: Power user tools and data management

## MCP Validation Status

### TestSprite Compliance
- ✅ Uses ElementFactory throughout
- ✅ No direct external API calls
- ✅ Proper modal lifecycle management
- ✅ Event handlers cleaned up on close

### Memory Management
- ✅ Modal removed from DOM on close
- ✅ Event listeners properly managed
- ✅ No memory leaks detected
- ✅ State updates are reactive

### Security
- ✅ Password required for sensitive actions
- ✅ No sensitive data in DOM
- ✅ Secure storage for exports
- ✅ Confirmation dialogs for destructive actions

## Backtrack Info (Git Commands)

### View Settings Modal Implementation
```bash
# Current implementation
git show HEAD:public/js/moosh-wallet.js | grep -A 800 "class WalletSettingsModal"

# Original implementation
git log --follow -p -S "WalletSettingsModal" -- public/js/moosh-wallet.js
```

### Find Related Changes
```bash
# Settings-related commits
git log --grep="settings" --oneline

# Tab implementation
git blame -L 25120,25137 public/js/moosh-wallet.js
```

## Implementation Notes for AI

### Modal Pattern
1. **Always use overlay** for background click-to-close
2. **Add show class** after DOM insertion for animation
3. **Clean up on close** - remove from DOM completely
4. **Handle escape key** for keyboard users

### Tab System
1. Store active tab in component state
2. Clear panel before rendering new content
3. Update tab styling to show active state
4. Preserve form values when switching tabs

### Security Considerations
1. **Password verification** before showing seeds/keys
2. **Copy to clipboard** with visual feedback
3. **Clear clipboard** after timeout
4. **Warn before destructive actions**

### Common Pitfalls
1. Don't forget to remove modal from DOM
2. Handle edge cases (no wallet, locked state)
3. Validate inputs before saving
4. Show feedback for all actions

### Testing Checklist
1. All tabs render correctly
2. Settings persist after close/reopen
3. Password required for sensitive actions
4. Network switch updates API calls
5. Export functions work correctly
6. Mobile layout is responsive
7. Escape key closes modal