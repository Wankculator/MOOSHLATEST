# 🎯 How to Access the MOOSH Wallet Dashboard

## Current User Flow (Step-by-Step)

The dashboard is **not directly accessible** via URL. You must complete the wallet setup process first:

### Option 1: Create New Wallet

1. **Go to:** http://localhost:3333
2. **On Welcome Screen:**
   - Enter a password in "Create Password" field
   - Enter the same password in "Re-enter Password" field
   - Select either 12 or 24 words (radio button)
3. **Click:** "Create Wallet" button
4. **On Seed Generation Screen:**
   - Your seed phrase will be displayed
   - **Important:** Save/remember some words for verification
   - Click "Continue"
5. **On Seed Verification Screen:**
   - Enter the requested words from your seed phrase
   - Click "Verify Seed"
6. **On Success Screen:**
   - You'll see "WALLET CREATED!"
   - **Click: "Open Wallet" button**
7. **Dashboard appears!**

### Option 2: Import Existing Wallet

1. **Go to:** http://localhost:3333
2. **On Welcome Screen:**
   - Enter a password in both fields
   - Select 12 or 24 words
3. **Click:** "Import Wallet" button
4. **On Import Screen:**
   - Enter a valid BIP39 seed phrase
   - Click "Import Wallet"
5. **On Success Screen:**
   - **Click: "Open Wallet" button**
6. **Dashboard appears!**

## 🚨 Current Limitations

1. **No Direct URL**: You cannot go directly to the dashboard
2. **No Persistence**: Refreshing the page loses the dashboard
3. **No Back Navigation**: Browser back button doesn't work properly
4. **Must Complete Setup**: You must go through wallet creation/import every time

## 🎯 What You'll See in the Dashboard

Once you reach the dashboard, you'll see:

### Header Section
- Terminal title: `<Moosh_Spark_Wallet_Dashboard />`
- Account selector dropdown
- Action buttons (+, ↻, 👁)

### Balance Section
- Total Balance: 0.00000000 BTC
- USD equivalent: ≈ $0.00 USD
- Token cards: MOOSH, USDT, SPARK

### Quick Actions
- **Send** - Opens Send Bitcoin modal ✅
- **Receive** - Opens Receive Bitcoin modal ✅
- **Swap** - Shows "coming soon" notification
- **Settings** - Shows "coming soon" notification

### Transaction History
- Shows "No transactions yet"

## 🔧 Testing the Modals

1. Click **Send** button → Send modal appears
2. Click **Receive** button → Receive modal appears
3. Click outside modal or X button to close

## 💡 Quick Test Seed Phrase

If you want to test the import function, here's a valid 12-word test phrase:
```
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
```

This is a well-known test seed phrase that should work for importing.