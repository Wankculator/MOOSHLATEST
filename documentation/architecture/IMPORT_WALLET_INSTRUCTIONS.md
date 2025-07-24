# 📋 STEP-BY-STEP INSTRUCTIONS TO IMPORT YOUR WALLET

## Step 1: Start the Fixed API Server

### Option A: Using Windows (Recommended)
1. **Double-click** the `START_API_SERVER.bat` file in your MOOSH WALLET folder
2. A command window will open showing:
   ```
   🚀 MOOSH Simple API Server
   ========================
   🌐 URL: http://localhost:3001
   📡 Health: http://localhost:3001/health
   🔧 Balance: GET /api/balance/{address}
   🔑 Import: POST /api/spark/import
   ========================
   ```
3. **Keep this window open** while using your wallet

### Option B: Using Terminal
1. Open a terminal/command prompt
2. Navigate to your MOOSH WALLET folder:
   ```
   cd "C:\Users\sk84l\OneDrive\Desktop\MOOSH WALLET"
   ```
3. Run:
   ```
   node src\server\simple-api.js
   ```

## Step 2: Import Your Wallet

1. **Open your browser** and go to your wallet (usually http://localhost:3333)
2. **Click "Import Wallet"**
3. **Enter your Unisat seed phrase** (12 or 24 words)
4. **Click the Import button**

## Step 3: Verify All Addresses Are Available

After importing, you should see:
- ✅ **Native SegWit address** (bc1q...)
- ✅ **Taproot address** (bc1p...)
- ✅ **Legacy address** (1...)
- ✅ **Nested SegWit address** (3...)
- ✅ **Your balance** from the address that has BTC

## What's Different Now?

Before the fix:
- ❌ Only one address was shown
- ❌ Other address types showed "Not available"
- ❌ Private keys weren't accessible

After the fix:
- ✅ All Bitcoin address types are derived from your seed
- ✅ You can switch between different address types
- ✅ Private keys are available for all addresses
- ✅ Your balance displays correctly

## Troubleshooting

If you see any errors:
1. Make sure the API server window is open and running
2. Check that it shows "MOOSH Simple API Server" in the console
3. Try refreshing your browser
4. If still having issues, close everything and start from Step 1

## Important Notes

- The API server must be running for wallet operations to work
- Your seed phrase derives all address types automatically
- All addresses are mathematically linked to your seed
- Your funds are safe on whichever address type has the balance

That's it! Your wallet now properly imports and shows all address types!