# StateManager - AI Context Guide

## Critical Understanding

StateManager is the **HEART** of MOOSH Wallet. It manages ALL application state, handles persistence, and provides the reactive system that drives UI updates. Breaking StateManager breaks EVERYTHING.

## Architecture Overview

```
Components → StateManager.set() → State Update → Event Emission → Component Re-render
                    ↓
              LocalStorage
                    ↓
            Persistence Layer
```

## When Modifying StateManager

### Pre-Flight Checklist
- [ ] Have you identified ALL components that use the state key you're modifying?
- [ ] Have you checked if the key needs persistence?
- [ ] Have you verified no duplicate method implementations?
- [ ] Have you considered backward compatibility for stored data?
- [ ] Have you handled all error cases (localStorage full, parse errors)?

### Absolute Rules
1. **NEVER store private keys or seeds** - Only temporary during creation
2. **ALWAYS use set() for updates** - Direct mutation breaks reactivity
3. **ALWAYS handle localStorage errors** - It can be full or disabled
4. **NEVER break the event system** - Components depend on it

## State Property Guidelines

### Persistent State (Saved to LocalStorage)
```javascript
// These MUST be serializable and safe to store
- accounts: Array of account objects
- currentAccountId: String identifier
- isBalanceHidden: Boolean privacy setting
- apiCache: Object with API responses
```

### Temporary State (Memory only)
```javascript
// These MUST NOT be persisted
- walletPassword: User's password (security!)
- generatedSeed: Mnemonic during creation
- verificationWords: Temporary for verification
- currentPage: Handled by Router
```

## Code Patterns to Preserve

### State Update Pattern
```javascript
// CORRECT - Triggers events and persistence
this.set('accounts', newAccounts);
this.set('currentAccountId', accountId);

// WRONG - Bypasses reactivity!
this.state.accounts = newAccounts; // NO EVENTS!
this.state.currentAccountId = accountId; // NO PERSISTENCE!
```

### Event Subscription Pattern
```javascript
// CORRECT - Clean subscription/unsubscription
const handler = (newValue, oldValue) => {
    console.log('State changed:', oldValue, '→', newValue);
};
stateManager.on('accounts', handler);
// Later...
stateManager.off('accounts', handler);

// WRONG - Memory leak!
stateManager.on('accounts', () => {}); // Can't unsubscribe!
```

### Account Creation Pattern
```javascript
// CORRECT - Full error handling
try {
    const account = await stateManager.createAccount(
        name,
        mnemonic,
        isImport,
        walletType,
        selectedVariant
    );
    // Success handling
} catch (error) {
    // Error handling - REQUIRED!
}

// WRONG - No error handling
const account = await stateManager.createAccount(...); // Could throw!
```

## Common AI Hallucinations to Avoid

### 1. Redux-like Patterns
```javascript
// HALLUCINATION - This is NOT Redux!
dispatch({ type: 'SET_ACCOUNT', payload: account }); // WRONG
stateManager.reducer(state, action); // WRONG
```

### 2. Storing Sensitive Data
```javascript
// HALLUCINATION - NEVER store these!
this.set('privateKey', key); // SECURITY BREACH!
this.set('mnemonic', words); // SECURITY BREACH!
this.state.password = pass; // SECURITY BREACH!
```

### 3. Direct State Access
```javascript
// HALLUCINATION - Always use methods!
const accounts = stateManager.state.accounts; // FRAGILE
accounts.push(newAccount); // BREAKS REACTIVITY!

// CORRECT
const accounts = [...stateManager.getAccounts()];
accounts.push(newAccount);
stateManager.set('accounts', accounts);
```

## Multi-Account System

### Account Object Structure
```javascript
{
    id: "acc_1234567890_abc123",          // Unique identifier
    name: "Main Wallet",                   // User-friendly name
    addresses: {
        spark: "spark1...",                // Spark protocol
        bitcoin: "bc1q...",                // Primary Bitcoin
        segwit: "bc1q...",                 // SegWit address
        taproot: "bc1p...",                // Taproot address
        legacy: "1A1z...",                 // Legacy address
        nestedSegwit: "3Kz..."             // Nested SegWit
    },
    type: "Generated",                     // or "Imported"
    walletType: "standard",                // Wallet variant
    derivationPath: "m/86'/0'/0'/0/0",    // BIP path
    createdAt: 1642000000000,             // Timestamp
    seedHash: "x7y9z2",                    // Seed identifier
    balances: {
        spark: 0,
        bitcoin: 128000,
        total: 128000
    }
}
```

### Account Management Rules
1. **Never delete the last account** - Check length first
2. **Always update currentAccountId** - When deleting active
3. **Persist immediately** - After any account change
4. **Handle missing accounts** - getCurrentAccount can return null

## Persistence Strategy

### What Gets Saved
```javascript
// mooshWalletState in localStorage
{
    accounts: [...],
    currentAccountId: "acc_123",
    isBalanceHidden: false,
    apiCache: {...}
}

// mooshAccounts in localStorage (duplicate?)
{
    accounts: [...],
    currentAccountId: "acc_123",
    lastSaved: 1642000000000
}
```

### Migration Handling
```javascript
// Legacy index-based system
if (data.activeAccountIndex !== undefined) {
    // Migrate to ID-based system
    const account = data.accounts[data.activeAccountIndex];
    if (account) this.state.currentAccountId = account.id;
}
```

## API Integration

### Account Creation Flow
1. Prepare mnemonic string
2. Call `/api/spark/import` (Spark addresses)
3. Call `/api/wallet/import` (Bitcoin addresses)
4. Handle both responses
5. Create account object
6. Update state and persist

### Error Handling
```javascript
// Both API calls MUST succeed
if (!sparkResult.success || !bitcoinResult.success) {
    throw new Error(sparkResult.error || bitcoinResult.error);
}
```

## Performance Considerations

### Current Performance Profile
- **State Updates**: ~1ms per set()
- **Event Emission**: ~0.1ms per listener
- **Persistence**: ~5-10ms (synchronous!)
- **Account Creation**: ~500ms (API calls)

### Optimization Opportunities
1. **Debounce persistence** - Batch rapid updates
2. **Async localStorage** - Use IndexedDB
3. **Memoize getCurrentAccount** - Called frequently
4. **Lazy load accounts** - For many accounts

## Testing Requirements

Before ANY modification:
1. Test state persistence across reload
2. Test account creation/deletion
3. Test event emission with multiple listeners
4. Test localStorage quota errors
5. Test corrupted data recovery

## Red Flags 🚨

These indicate you're about to break something:
1. "Let me optimize the event system..." - It works, don't break it
2. "We should store the seed for convenience..." - NEVER!
3. "Direct state access is faster..." - But breaks reactivity
4. "Let's use a different storage method..." - Migration nightmare

## Recovery Procedures

If you break StateManager:
1. **Check browser console** - Look for errors
2. **Clear localStorage** - `localStorage.clear()`
3. **Reload page** - Force fresh state
4. **Check event listeners** - Use browser debugger
5. **Rollback changes** - Git revert

## Debugging Tips

```javascript
// Add debug logging
const originalSet = stateManager.set.bind(stateManager);
stateManager.set = function(key, value) {
    console.log(`[StateManager] Setting ${key}:`, value);
    return originalSet(key, value);
};

// Monitor all events
stateManager.on('*', (key, newValue, oldValue) => {
    console.log(`[StateManager] ${key} changed:`, oldValue, '→', newValue);
});
```

## AI Instructions Summary

When asked to modify StateManager:
1. **UNDERSTAND** the reactive system first
2. **TRACE** all components using affected state
3. **PRESERVE** event emission patterns
4. **TEST** persistence and recovery
5. **SECURE** against storing sensitive data

Remember: StateManager is the central nervous system. Every component depends on it working correctly. Extreme caution required!