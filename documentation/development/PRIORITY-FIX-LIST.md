# MOOSH Wallet - Priority Fix List

## [!!] Critical Issues (Fix First)

### 1. Import Address Generation Bug
**Problem**: When importing wallets, not all address types are generated automatically
**Impact**: Users must manually click "Fix Addresses" button
**Location**: `moosh-wallet.js` - `createAccount()` function
**Fix**: Ensure all address types (legacy, nestedSegwit, nativeSegwit, taproot, spark) are generated during import

### 2. Package.json Module Type Warning
**Problem**: Missing "type": "module" in package.json causing warnings
**Impact**: Performance overhead and console warnings
**Location**: `/src/server/package.json`
**Fix**: Add `"type": "module"` to package.json

## [!] High Priority Issues

### 3. Wallet Type Auto-Detection
**Problem**: Import doesn't detect wallet origin (Xverse, Electrum, etc.)
**Impact**: Users don't know which addresses have funds
**Location**: `moosh-wallet.js` - wallet detection logic
**Fix**: Implement proper wallet type detection using derivation paths

### 4. Balance Refresh Issues
**Problem**: Balances don't auto-update, require manual refresh
**Impact**: Users see stale balance data
**Location**: Balance fetching and caching logic
**Fix**: Implement proper cache invalidation or WebSocket updates

### 5. Missing Loading States
**Problem**: No visual feedback during long operations
**Impact**: Users think app is frozen during imports/loads
**Location**: Various async operations
**Fix**: Add loading indicators for all async operations

## [*] Medium Priority Enhancements

### 6. Account Color Persistence
**Problem**: Account colors sometimes reset
**Impact**: Users lose visual customization
**Location**: State persistence logic
**Fix**: Ensure colors are properly saved and loaded

### 7. Mobile Touch Targets
**Problem**: Some buttons too small on mobile
**Impact**: Difficult to use on phones
**Location**: CSS and button sizing
**Fix**: Increase touch target sizes to 44px minimum

### 8. Error Messages
**Problem**: Generic error messages not helpful
**Impact**: Users don't know how to fix issues
**Location**: Error handling throughout
**Fix**: Add specific, actionable error messages

## [-] Nice to Have

### 9. Transaction History
**Problem**: No transaction history view
**Impact**: Users can't see past transactions
**Location**: New feature needed
**Fix**: Add transaction history component

### 10. Export Features
**Problem**: Can't export wallet data
**Impact**: No backup besides seed phrase
**Location**: New feature needed
**Fix**: Add secure export functionality

## Implementation Order

1. **Fix import address generation** (2-3 hours)
2. **Add package.json module type** (5 minutes)
3. **Implement wallet type detection** (4-5 hours)
4. **Fix balance refresh** (3-4 hours)
5. **Add loading states** (2-3 hours)

## Quick Wins (Do First)
- Package.json fix (5 min)
- Increase button sizes for mobile (30 min)
- Better error messages (1 hour)

## Testing After Each Fix
- Import multiple wallet types
- Check all address types generated
- Verify balances update
- Test on mobile (320px)
- Ensure no console errors