# 🔧 Account System Fix Plan

## Current Issues & Solutions

### 1. ❌ **Issue: Taproot showing "Not available"**
**Root Cause:** Addresses not being properly saved when account is created
**Solution:** 
- ✅ Added `fixMissingAddresses()` method
- ✅ Added "Fix Addresses" button
- Need to ensure addresses are saved correctly on first creation

### 2. ❌ **Issue: New wallets not showing in accounts**
**Root Cause:** Wallet creation doesn't always create account entry
**Solution:**
- ✅ Fixed by adding `createAccount()` call in wallet generation
- Need to verify it works consistently

### 3. ❌ **Issue: Import wallet missing wallet types**
**Root Cause:** API response not including all address types
**Solution:**
- ✅ Fixed API to return all address types
- ✅ Updated client to handle all addresses

### 4. ⚠️ **Issue: Account management unclear**
**Current State:** 
- ✅ MultiAccountModal exists
- ✅ "+ Accounts" button works
- ❌ Users don't understand the flow

**Needed Improvements:**
1. Better visual feedback for active account
2. Clear instructions in modal
3. Show all wallet types per account
4. Allow renaming accounts

### 5. ❌ **Issue: Balance not updating per wallet type**
**Root Cause:** Balance fetched for account, not specific address
**Solution:** Need to fetch balance for selected wallet type address

---

## What You Wanted vs What's Implemented

### ✅ What's Working:
1. **Import generates all types** - Fixed
2. **Multiple accounts** - MultiAccountModal exists
3. **Wallet type selector** - Works
4. **Address display** - Works (with fix button)

### ❌ What's Missing:
1. **Clear account workflow** - Needs better UX
2. **Balance per wallet type** - Not implemented
3. **Visual feedback** - Which account/type is active
4. **Account management** - Rename/delete functions

---

## Recommended User Flow

### For New Users:
```
1. Landing Page → Create New Wallet
2. Generate Seed → Verify → Continue
3. Automatically creates first account with all 5 wallet types
4. Dashboard shows account selector + wallet type selector
5. Can add more accounts via "+ Accounts"
```

### For Importing:
```
1. Landing Page → Import Wallet
2. Enter seed phrase
3. Automatically creates account with all 5 wallet types
4. Dashboard shows imported account
5. Can add more accounts from same seed
```

### Account Management:
```
1. Click "+ Accounts" 
2. Modal shows current accounts
3. Options: Create New / Import / Switch
4. Each account shows all 5 addresses
5. Can rename/delete accounts
```

---

## Implementation Priority

### High Priority:
1. Fix balance display per wallet type
2. Add visual indicators for active account/type
3. Improve MultiAccountModal UX

### Medium Priority:
1. Add account renaming
2. Add account deletion (with confirmation)
3. Show addresses in account list

### Low Priority:
1. Account export/backup
2. Account notes/labels
3. Advanced derivation paths