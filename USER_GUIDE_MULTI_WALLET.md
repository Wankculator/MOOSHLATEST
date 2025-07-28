# MOOSH Wallet Multi-Wallet System User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Managing Multiple Wallets](#managing-multiple-wallets)
4. [Common Use Cases](#common-use-cases)
5. [Security Features](#security-features)
6. [Backup and Recovery](#backup-and-recovery)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Introduction

The MOOSH Wallet Multi-Wallet System allows you to create and manage multiple Bitcoin and Spark Protocol wallets from a single interface. Each wallet is completely isolated with its own:
- Seed phrase and private keys
- Multiple accounts (addresses)
- Settings and preferences
- Transaction history
- Balance tracking

This guide will walk you through all features of the multi-wallet system.

---

## Getting Started

### First Time Setup

When you first open MOOSH Wallet, a default wallet called "Main Wallet" is automatically created for you.

1. **Launch MOOSH Wallet**
   - Open your browser and navigate to the wallet URL
   - The loading screen shows "MOOSH Wallet loading: X%"
   - Once loaded, you'll see the home page

2. **Create Your First Account**
   - Click "Generate New Wallet" to create a new seed phrase
   - Or click "Import Existing Wallet" if you have a seed phrase
   - Follow the seed generation/import process
   - Your first account will be created in the default "Main Wallet"

### Understanding the Interface

The wallet interface consists of:
- **Header**: Shows MOOSH logo and wallet switcher (top-right)
- **Dashboard**: Main area showing balance, charts, and quick actions
- **Account Selector**: Dropdown to switch between accounts within current wallet
- **Action Buttons**: Send, Receive, Settings, History, etc.

---

## Managing Multiple Wallets

### Accessing the Wallet Manager

1. **Via Header Button**
   - Look for the wallet icon in the top-right corner
   - Click the dropdown arrow next to current wallet name
   - Select "Manage Wallets" from the dropdown

2. **Via Keyboard Shortcut**
   - Press `Ctrl+Shift+W` (Windows/Linux) or `Cmd+Shift+W` (Mac)

### Creating a New Wallet

1. **Open Wallet Manager**
   - Click the wallet dropdown → "Manage Wallets"
   - The Wallet Manager modal opens

2. **Click "NEW WALLET"**
   - A form appears for wallet creation

3. **Configure Your Wallet**
   - **Name**: Enter a descriptive name (e.g., "Trading", "Savings", "Business")
   - **Theme Color**: Select from 7 color options:
     - Orange (default): #f57315
     - Green: #69fd97
     - Red: #ff4444
     - Blue: #4444ff
     - Yellow: #ffff44
     - Magenta: #ff44ff
     - Cyan: #44ffff

4. **Click "CREATE WALLET"**
   - New wallet is created and becomes active
   - You'll need to generate/import accounts for this wallet

### Switching Between Wallets

#### Method 1: Quick Switch (Header Dropdown)
1. Click the wallet name in the header
2. Select desired wallet from dropdown
3. Wallet switches immediately

#### Method 2: Wallet Manager
1. Open Wallet Manager
2. Click on any wallet card
3. Or click "SWITCH" button on non-active wallet

#### What Happens When You Switch:
- All accounts from new wallet are loaded
- Balance updates to show new wallet's total
- Transaction history refreshes
- Any open account-specific modals close
- Theme color updates to match wallet preference

### Renaming a Wallet

1. Open Wallet Manager
2. Find the wallet you want to rename
3. Click "RENAME" button
4. Type new name in the input field
5. Press Enter or click outside to save

### Deleting a Wallet

⚠️ **Warning**: Deleting a wallet removes all associated accounts and data. Always backup first!

1. Open Wallet Manager
2. Find wallet to delete (cannot delete active wallet)
3. Click "DELETE" button
4. Confirm deletion in popup dialog

**Note**: You cannot delete your last wallet. At least one wallet must exist.

### Wallet Information Display

Each wallet card shows:
- **Name**: Custom wallet name
- **Status**: "ACTIVE" badge for current wallet
- **Accounts**: Number of accounts in wallet
- **Created**: Wallet creation date
- **Last Used**: How recently accessed
- **Last Backup**: When last exported (if applicable)

---

## Common Use Cases

### Use Case 1: Personal vs Business Separation

**Scenario**: Keep personal Bitcoin separate from business transactions

1. **Create "Personal" Wallet**
   - Color: Blue
   - Generate new seed phrase
   - Create multiple accounts for different purposes

2. **Create "Business" Wallet**
   - Color: Green (for money/growth)
   - Import existing business seed
   - Label accounts: "Client Payments", "Expenses", etc.

3. **Daily Usage**
   - Switch to Business during work hours
   - Switch to Personal for personal transactions
   - Export Business wallet monthly for accounting

### Use Case 2: Trading vs HODLing

**Scenario**: Separate long-term holdings from active trading

1. **Create "HODL" Wallet**
   - Color: Yellow (gold)
   - Generate high-security seed (24 words)
   - Single account for cold storage
   - Password protect this wallet

2. **Create "Trading" Wallet**
   - Color: Red (active/hot)
   - Multiple accounts for different exchanges
   - Quick access without password

### Use Case 3: Family Member Management

**Scenario**: Manage wallets for family members

1. **Create Individual Wallets**
   - "Dad's Wallet" (Blue)
   - "Mom's Wallet" (Magenta)
   - "Kids' Savings" (Cyan)

2. **Set Appropriate Security**
   - Password protect parent wallets
   - Limited access for kids' wallet

3. **Regular Backups**
   - Export all wallets monthly
   - Store backups securely

### Use Case 4: Multi-Currency Strategy

**Scenario**: Organize by cryptocurrency type

1. **"Bitcoin Only" Wallet**
   - Pure Bitcoin addresses
   - Legacy and SegWit accounts

2. **"Spark Protocol" Wallet**
   - Spark-enabled addresses
   - Lightning Network integration

3. **"Ordinals Collection" Wallet**
   - Taproot addresses only
   - For NFTs and inscriptions

---

## Security Features

### Password Protection

1. **Setting a Password**
   - Open wallet in Wallet Manager
   - Click "Settings" for that wallet
   - Enable "Password Protection"
   - Enter strong password
   - Password is hashed using SHA-256

2. **Auto-Lock Feature**
   - Wallets auto-lock after 5 minutes (configurable)
   - Must re-enter password to access
   - Prevents unauthorized access

### Security Best Practices

1. **Unique Names**: Use descriptive names to avoid confusion
2. **Color Coding**: Use consistent colors for wallet types
3. **Regular Backups**: Export wallets after major changes
4. **Password Variety**: Different passwords for different wallets
5. **Minimal Exposure**: Keep only active trading wallets unlocked

---

## Backup and Recovery

### Exporting a Single Wallet

1. Open Wallet Manager
2. Click "EXPORT" on desired wallet
3. File downloads: `moosh-wallet-[name]-[timestamp].json`
4. Contains:
   - Wallet configuration
   - All accounts (encrypted)
   - Settings and preferences
   - Metadata

### Exporting All Wallets

1. Open Wallet Manager
2. Click "EXPORT ALL" button
3. File downloads: `moosh-all-wallets-[timestamp].json`
4. Single file with all wallet data

### Importing Wallet Backups

1. Open Wallet Manager
2. Click "Import" (if available)
3. Select backup JSON file
4. Choose:
   - **Merge**: Add to existing wallets
   - **Overwrite**: Replace wallet with same ID

### Backup File Structure
```json
{
  "version": "1.0",
  "exportDate": 1234567890,
  "wallet": {
    "id": "unique-wallet-id",
    "name": "My Wallet",
    "settings": {...},
    "metadata": {...}
  },
  "accounts": [...]
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### Wallet Won't Switch
**Problem**: Clicking switch doesn't change wallet

**Solutions**:
1. Refresh the page (F5)
2. Check browser console for errors
3. Clear localStorage and re-import
4. Ensure wallet data isn't corrupted

#### Lost Wallet After Browser Clear
**Problem**: Browser data cleared, wallets gone

**Solutions**:
1. Import from backup file
2. Re-create wallet with seed phrases
3. Check if data exists in different browser profile

#### Cannot Delete Wallet
**Problem**: Delete button not working

**Reasons**:
1. It's the active wallet (switch first)
2. It's the last wallet (need at least one)
3. Browser storage is full

#### Password Not Working
**Problem**: Password rejected for protected wallet

**Solutions**:
1. Check Caps Lock
2. Try variations (case sensitive)
3. Reset by deleting and re-importing
4. Use wallet backup without password

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cannot delete the last wallet" | Must have at least one wallet | Create new wallet first |
| "Wallet already exists" | Duplicate wallet ID during import | Choose overwrite option |
| "Failed to save wallet data" | Browser storage full | Clear old data or increase quota |
| "Invalid wallet export data" | Corrupted backup file | Use different backup or recreate |

---

## FAQ

### General Questions

**Q: How many wallets can I create?**
A: Limited only by browser storage (typically 50-100 wallets)

**Q: Are wallets stored online?**
A: No, all wallet data is stored locally in your browser

**Q: Can I use same seed in multiple wallets?**
A: Yes, but not recommended for security reasons

**Q: Do wallets sync across devices?**
A: No, each device has separate wallet storage

### Security Questions

**Q: Is wallet password the same as seed phrase?**
A: No, wallet password only locks access to the UI

**Q: What happens if I forget wallet password?**
A: Export wallet without password, delete, re-import

**Q: Are private keys encrypted?**
A: Yes, using browser's secure storage mechanisms

**Q: Can others see my wallet names?**
A: Only if they have physical access to your device

### Technical Questions

**Q: Where is wallet data stored?**
A: Browser's localStorage (domain-specific)

**Q: What's the wallet ID format?**
A: 32-character hex string (cryptographically random)

**Q: Can I manually edit wallet files?**
A: Yes, but be careful not to corrupt the JSON

**Q: Is there an API for wallet management?**
A: Currently UI-only, no external API

### Best Practices

**Q: How often should I backup?**
A: After creating new accounts or major changes

**Q: Should I password-protect all wallets?**
A: Protect high-value wallets, keep daily-use accessible

**Q: Best way to organize wallets?**
A: By purpose (Personal/Business) or by security level

**Q: Can I share wallet exports?**
A: Only with trusted parties - contains sensitive data

---

## Tips and Tricks

### Power User Features

1. **Keyboard Shortcuts**
   - `Ctrl/Cmd + Shift + W`: Open Wallet Manager
   - `Ctrl/Cmd + 1-9`: Quick switch to wallet 1-9
   - `Escape`: Close Wallet Manager

2. **Bulk Operations**
   - Export all wallets for migration
   - Import multiple wallets at once
   - Batch rename using export/edit/import

3. **Advanced Organization**
   - Prefix names: "01-Main", "02-Trading"
   - Use emojis in names (if supported)
   - Color code by risk level

### Performance Tips

1. **Regular Maintenance**
   - Delete unused wallets
   - Archive old transaction data
   - Clear browser cache periodically

2. **Optimal Usage**
   - Keep 5-10 active wallets maximum
   - Use single wallet for related accounts
   - Minimize switching during high activity

---

## Conclusion

The MOOSH Multi-Wallet System provides powerful organization and security features for managing multiple Bitcoin portfolios. By following this guide and best practices, you can:

- Organize funds effectively
- Maintain security separation
- Streamline your workflow
- Protect against loss

Remember to always backup your wallets and keep your seed phrases secure!

---

*Last Updated: January 2025*
*MOOSH Wallet Version: 2.0*