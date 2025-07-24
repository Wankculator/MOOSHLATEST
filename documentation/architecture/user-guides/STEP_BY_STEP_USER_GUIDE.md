# 📚 MOOSH Wallet - Step-by-Step User Guide

## 🚀 Quick Start

### Option A: Direct Dashboard Access
```
URL: http://localhost:3333#dashboard
```
- Instant access to wallet dashboard
- No setup required for testing
- All features available immediately

### Option B: Complete Wallet Setup
```
URL: http://localhost:3333
```
- Full wallet creation experience
- Secure seed phrase generation
- Import existing wallet option

---

## 📝 Detailed Step-by-Step Instructions

### 🆕 Creating a New Wallet

#### Step 1: Access the Wallet
1. Open your browser
2. Navigate to `http://localhost:3333`
3. You'll see the MOOSH Wallet welcome screen

#### Step 2: Set Your Password
1. Enter a secure password in "Create Password" field
2. Re-enter the same password in "Re-enter Password" field
3. ⚠️ Remember this password - it protects your wallet!

#### Step 3: Choose Seed Phrase Length
1. Select either:
   - **12 Words** - Standard security (faster to write)
   - **24 Words** - Enhanced security (recommended)
2. The radio button will show an orange dot for your selection

#### Step 4: Create Your Wallet
1. Click the **"Create Wallet"** button
2. Wait for seed phrase generation

#### Step 5: Save Your Seed Phrase
1. **CRITICAL**: Write down all words in order
2. Store them safely offline
3. Click **"Copy Recovery Phrase"** for digital backup
4. Click **"Continue"** when ready

#### Step 6: Verify Your Seed
1. Enter the requested words (usually 3 random positions)
2. Type carefully - spelling must be exact
3. Click **"Verify Seed"**

#### Step 7: Success!
1. You'll see "WALLET CREATED!"
2. Your Spark Protocol address is displayed
3. Click **"Copy"** to save your address
4. Click **"Open Wallet Dashboard"** to continue

---

### 📥 Importing an Existing Wallet

#### Step 1: Start Import Process
1. From welcome screen, click **"Import Wallet"**
2. Enter your password in both fields

#### Step 2: Enter Seed Phrase
1. Type or paste your recovery phrase
2. Separate words with spaces
3. Ensure correct word count (12 or 24)

#### Step 3: Complete Import
1. Click **"Import Wallet"**
2. Wait for verification
3. Click **"Open Wallet Dashboard"** on success

---

### 💰 Using the Dashboard

#### Dashboard Overview
```
Components:
1. Header - Account info and controls
2. Balance - BTC and token balances
3. Quick Actions - Send, Receive, Swap, Settings
4. Transaction History - Past transactions
```

#### Sending Bitcoin
1. Click **SEND** button (↗ icon)
2. In the modal:
   - Enter recipient's Bitcoin address
   - Enter amount in BTC or USD
   - Select network fee speed
   - Review transaction summary
3. Click **"Send Bitcoin"** to confirm

#### Receiving Bitcoin
1. Click **RECEIVE** button (↙ icon)
2. In the modal:
   - See your Bitcoin address
   - Click **"Copy"** to copy address
   - Optional: Enter specific amount
   - Share via Email/Message/Link
3. Click **"Done"** when finished

#### Privacy Features
1. Click the **👁** (eye) icon
2. Balances hide showing ••••••••
3. Click again to show balances

#### Other Features
- **+ Button**: Add new accounts (coming soon)
- **↻ Button**: Refresh wallet data
- **Account Dropdown**: Switch between accounts
- **Network Toggle**: Switch MAINNET/TESTNET

---

## 🔐 Security Best Practices

### DO's ✅
- Save seed phrase offline in multiple locations
- Use a strong, unique password
- Verify website URL before entering sensitive data
- Test with small amounts first
- Keep software updated

### DON'T's ❌
- Share your seed phrase with anyone
- Store seed phrase digitally only
- Use wallet on public WiFi without VPN
- Ignore security warnings
- Rush transactions

---

## 🛠️ Troubleshooting

### Common Issues

#### Can't Access Dashboard
- **Solution**: Use direct URL `http://localhost:3333#dashboard`

#### Forgot Password
- **Solution**: You'll need your seed phrase to recover

#### Seed Verification Fails
- Check spelling exactly
- Ensure correct word positions
- No extra spaces

#### Modal Won't Close
- Click the X button
- Click outside the modal
- Refresh page if needed

---

## ⌨️ Keyboard Shortcuts

- **Esc**: Go back / Close modals
- **Enter**: Confirm actions
- **Tab**: Navigate between fields

---

## 📱 Mobile Usage

The wallet works on mobile devices:
1. All features scale automatically
2. Touch-friendly buttons
3. Responsive modals
4. Optimized text sizes

---

## 🎯 Quick Actions Reference

| Action | Button | Function |
|--------|--------|----------|
| Send | ↗ | Open send modal |
| Receive | ↙ | Show receive address |
| Swap | ⇄ | Token swap (soon) |
| Settings | ⚙ | Wallet settings (soon) |
| Privacy | 👁 | Hide/show balances |
| Refresh | ↻ | Update wallet data |
| Add | + | Add account (soon) |

---

## 📞 Need Help?

- Check the troubleshooting section
- Review security best practices
- Ensure server is running at `http://localhost:3333`
- For dashboard: `http://localhost:3333#dashboard`

Remember: Your seed phrase is your wallet. Keep it safe!