# MOOSH Wallet - Complete Function Documentation

## Table of Contents
1. [Core Application Classes](#core-application-classes)
2. [State Management Functions](#state-management-functions)
3. [Account Management Functions](#account-management-functions)
4. [UI Component Functions](#ui-component-functions)
5. [Utility Functions](#utility-functions)
6. [Compliance Functions](#compliance-functions)
7. [API Integration Functions](#api-integration-functions)

---

## Core Application Classes

### SparkWallet (Main Application Class)
**Location**: Lines 16990-17200+

```javascript
class SparkWallet {
    constructor()
```
- **Purpose**: Initializes the main wallet application
- **Key Properties**:
  - `state`: SparkStateManager instance
  - `currentView`: Current active view
  - `components`: Map of UI components
  - `eventListeners`: Event handling system
- **Initialization Flow**:
  1. Creates state manager
  2. Sets up event listeners
  3. Initializes UI components
  4. Checks for existing wallet
  5. Renders appropriate view

### SparkStateManager
**Location**: Lines 1960-3500+

```javascript
class SparkStateManager {
    constructor()
```
- **Purpose**: Manages application state and persistence
- **Key Methods**:
  - `setState()`: Updates state with validation
  - `getState()`: Returns current state
  - `persist()`: Saves to localStorage with encryption
  - `load()`: Loads from localStorage
  - `reset()`: Clears all state

---

## State Management Functions

### setState(updates)
```javascript
setState(updates) {
    // Validates and merges updates
    // Triggers state change events
    // Persists to storage
}
```
- **Parameters**: `updates` - Object with state changes
- **Validation**: Checks data types and constraints
- **Side Effects**: Emits 'stateChanged' event

### persistAccounts()
```javascript
persistAccounts() {
    // Encrypts and stores accounts
    // Uses ComplianceUtils for validation
}
```
- **Purpose**: Saves account data securely
- **Encryption**: Uses password-based encryption
- **Storage Key**: 'mooshAccounts'

### loadAccounts()
```javascript
loadAccounts() {
    // Decrypts and loads accounts
    // Validates data integrity
}
```
- **Returns**: Array of account objects
- **Error Handling**: Returns empty array on failure

---

## Account Management Functions

### createAccount(name, mnemonic, isImport = false)
**Location**: Lines 3000-3200+

```javascript
async createAccount(name, mnemonic, isImport = false)
```
- **Purpose**: Creates new wallet account
- **Parameters**:
  - `name`: Account name (validated)
  - `mnemonic`: Optional seed phrase
  - `isImport`: Boolean for import mode
- **Process**:
  1. Validates account name with ComplianceUtils
  2. Generates seed if not provided
  3. Derives all address types
  4. Stores encrypted seed
  5. Persists account data
- **Returns**: Account object with ID, addresses, metadata

### switchAccount(accountId)
```javascript
switchAccount(accountId) {
    // Updates currentAccountId
    // Emits accountSwitched event
    // Refreshes UI components
}
```
- **Validation**: Checks if account exists
- **Events**: Triggers full UI update

### deleteAccount(accountId)
```javascript
async deleteAccount(accountId) {
    // Shows confirmation modal
    // Prevents deleting last account
    // Cleans up associated data
}
```
- **Safety**: Cannot delete last remaining account
- **Confirmation**: Two-step deletion process

### importWallet(seedPhrase, accountName)
```javascript
async importWallet(seedPhrase, accountName)
```
- **Process**:
  1. Validates seed phrase format
  2. Checks for duplicates
  3. Attempts wallet type detection
  4. Generates all addresses
  5. Creates account
- **Issues**: Address generation sometimes incomplete

---

## UI Component Functions

### Dashboard.render()
**Location**: Lines 8500-9000+

```javascript
render() {
    // Creates main dashboard layout
    // Shows account selector
    // Displays balance
    // Renders action buttons
}
```
- **Components**:
  - Account selector button
  - Balance display (BTC/USD)
  - Send/Receive buttons
  - Settings menu
- **Responsive**: Adapts to screen size

### AccountModal.render()
```javascript
render() {
    // Shows account management UI
    // Lists all accounts with balances
    // Provides create/import options
}
```
- **Features**:
  - Account cards with colors
  - Balance per account
  - Quick actions menu
  - Delete functionality

### OrdinalsModal.render()
```javascript
render() {
    // Displays ordinals gallery
    // Only for taproot addresses
    // Includes filtering/sorting
}
```
- **Performance**: Implements lazy loading
- **Caching**: 5-minute cache for API data

---

## Utility Functions

### ComplianceUtils (Global Utility Object)
**Location**: Lines 500-1000+

```javascript
const ComplianceUtils = {
    validateInput(value, type),
    debounce(func, wait),
    log(component, message, type),
    safeArrayAccess(array, index, defaultValue),
    getStatusIndicator(status),
    isMobileDevice(),
    measurePerformance(operation, callback)
}
```

### validateInput(value, type)
```javascript
validateInput(value, type) {
    // Types: 'accountName', 'color', 'mnemonic', 'password'
    // Returns: { valid: boolean, error?: string, sanitized?: string }
}
```
- **Account Name**: 1-50 chars, alphanumeric + spaces
- **Color**: Valid hex color
- **Mnemonic**: 12/24 words from BIP39 list
- **Password**: Minimum 8 characters

### debounce(func, wait)
```javascript
debounce(func, wait) {
    // Standard debouncing implementation
    // Default: 300ms desktop, 500ms mobile
}
```
- **Usage**: All rapid user actions
- **Examples**: Color picker, search, API calls

### ResponsiveUtils
```javascript
const ResponsiveUtils = {
    getCurrentBreakpoint(),
    isMobile(),
    isTablet(),
    setupTouchHandlers(element)
}
```
- **Breakpoints**: 320px, 480px, 768px, 1024px
- **Touch**: Handles both mouse and touch events

---

## Compliance Functions

### getStatusIndicator(status)
```javascript
getStatusIndicator(status) {
    // Maps status to ASCII indicator
    // 'success' -> '[OK]'
    // 'error' -> '[X]'
    // 'warning' -> '[!!]'
    // 'loading' -> '[..]'
}
```

### enforceThemeColors(color)
```javascript
enforceThemeColors(color) {
    // Validates against approved palette
    // Orange shades + black/gray only
}
```

### stripEmojis(text)
```javascript
stripEmojis(text) {
    // Removes all emoji characters
    // Replaces with ASCII equivalents
}
```

---

## API Integration Functions

### fetchBalance(address)
```javascript
async fetchBalance(address) {
    // Uses mempool.space API
    // Implements caching (60 seconds)
    // Returns satoshi amount
}
```
- **Cache Key**: `balance_${address}`
- **Error Handling**: Returns cached on failure

### fetchBTCPrice()
```javascript
async fetchBTCPrice() {
    // CoinGecko API integration
    // 5-minute cache
    // Returns USD price
}
```
- **Fallback**: Returns last known price on error

### fetchOrdinals(taprootAddress)
```javascript
async fetchOrdinals(taprootAddress) {
    // Hiro/OrdAPI integration
    // Paginated results
    // 5-minute cache
}
```
- **Performance**: Virtual scrolling for large sets

---

## Critical Functions to Never Modify

### generateSparkWallet()
**Location**: Lines 1896-1922
```javascript
async generateSparkWallet(mnemonic)
```
- **CRITICAL**: Do not modify seed generation logic
- **Security**: Server-side generation required

### generateWallet()
**Location**: Lines 3224-3261
```javascript
async generateWallet()
```
- **CRITICAL**: Core wallet generation
- **Returns**: Required response structure

---

## Common Issues and Solutions

### Issue: Import Missing Addresses
**Function**: `createAccount()` during import
**Problem**: Not all address types generated
**Solution**: Manual "Fix Addresses" button
**TODO**: Implement comprehensive address detection

### Issue: Balance Not Updating
**Function**: `fetchBalance()`
**Problem**: Cache not invalidating
**Solution**: Manual refresh button
**TODO**: Implement WebSocket updates

### Issue: Multi-Wallet Not Implemented
**Functions**: Need new classes/methods
**Status**: Architecture planned, not built
**Next Steps**: Implement Phase 1 from plans

---

## Performance Considerations

1. **Debouncing**: All user inputs debounced (300ms)
2. **Caching**: API responses cached (60s-5min)
3. **Virtual Scrolling**: For lists >50 items
4. **Lazy Loading**: Components load on demand
5. **State Persistence**: Debounced to prevent thrashing

---

## Security Measures

1. **Seed Encryption**: Never stored in plain text
2. **Input Validation**: All inputs sanitized
3. **XSS Prevention**: No innerHTML with user data
4. **CORS**: API calls use proper headers
5. **Session Timeout**: Auto-lock after inactivity

---

## Testing Approach

1. **Unit Tests**: Individual function validation
2. **Integration Tests**: Component interaction
3. **Visual Tests**: UI compliance checks
4. **User Scenarios**: End-to-end workflows
5. **Performance Tests**: Load and response times

---

## Development Guidelines

1. **NO EMOJIS**: Use ASCII indicators only
2. **Validate Everything**: Use ComplianceUtils
3. **Debounce Actions**: Prevent rapid firing
4. **Handle Errors**: Try-catch all async
5. **Mobile First**: Test at 320px width
6. **Document Changes**: Update this guide