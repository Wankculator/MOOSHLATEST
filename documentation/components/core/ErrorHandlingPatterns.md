# Error Handling Patterns Guide

**Last Updated**: 2025-07-21  
**Critical**: YES - Improper error handling can crash the application or expose sensitive data

## Overview

MOOSH Wallet uses a comprehensive error handling strategy that prioritizes user experience, security, and debugging. This guide documents the standard patterns used throughout the codebase.

## Core Principles

1. **Never Silent Fail** - Always log errors
2. **User-Friendly Messages** - Technical details in logs, simple messages to users
3. **Graceful Degradation** - App should continue working despite errors
4. **Security First** - Never expose sensitive data in error messages
5. **Recovery Priority** - Always attempt to recover from errors

## Error Handling Patterns

### Pattern 1: Try-Catch with Logging

**Standard pattern for all async operations:**

```javascript
async function performOperation() {
    try {
        ComplianceUtils.log('Component', 'Starting operation');
        const result = await riskyOperation();
        ComplianceUtils.log('Component', 'Operation completed successfully');
        return result;
    } catch (error) {
        ComplianceUtils.log('Component', 'Operation failed: ' + error.message, 'error');
        
        // User notification - simple message
        this.app.showNotification('Operation failed. Please try again.', 'error');
        
        // Return safe default or rethrow if critical
        return null; // or throw error if caller needs to handle
    }
}
```

### Pattern 2: API Error Handling

**Comprehensive API error handling with fallbacks:**

```javascript
async fetchData() {
    try {
        // Primary attempt
        const response = await fetch(primaryUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (primaryError) {
        ComplianceUtils.log('APIService', 'Primary API failed: ' + primaryError.message, 'warn');
        
        // Try fallback
        try {
            const fallbackResponse = await fetch(fallbackUrl);
            const fallbackData = await fallbackResponse.json();
            ComplianceUtils.log('APIService', 'Fallback API succeeded', 'info');
            return fallbackData;
            
        } catch (fallbackError) {
            ComplianceUtils.log('APIService', 'All APIs failed: ' + fallbackError.message, 'error');
            
            // Return cached data if available
            const cached = this.getCachedData();
            if (cached) {
                ComplianceUtils.log('APIService', 'Using cached data', 'info');
                return cached;
            }
            
            // Final fallback - return safe default
            return { error: true, data: null };
        }
    }
}
```

### Pattern 3: Form Validation Errors

**User input validation with detailed feedback:**

```javascript
validateAndSubmit(formData) {
    try {
        // Validate each field
        const nameValidation = ComplianceUtils.validateInput(formData.name, 'accountName');
        if (!nameValidation.valid) {
            this.showFieldError('name', nameValidation.error);
            return false;
        }
        
        const mnemonicValidation = ComplianceUtils.validateInput(formData.mnemonic, 'mnemonic');
        if (!mnemonicValidation.valid) {
            this.showFieldError('mnemonic', mnemonicValidation.error);
            return false;
        }
        
        // All valid - proceed
        return this.submitForm({
            name: nameValidation.sanitized,
            mnemonic: mnemonicValidation.sanitized
        });
        
    } catch (error) {
        ComplianceUtils.log('Form', 'Validation error: ' + error.message, 'error');
        this.app.showNotification('Please check your input and try again', 'error');
        return false;
    }
}

showFieldError(fieldName, errorMessage) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('error');
        
        // Show error message near field
        const errorEl = $.div({ className: 'field-error' }, errorMessage);
        field.parentElement.appendChild(errorEl);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            field.classList.remove('error');
            errorEl.remove();
        }, 5000);
    }
}
```

### Pattern 4: State Management Errors

**Safe state updates with rollback:**

```javascript
updateState(updates) {
    // Backup current state
    const backup = { ...this.state };
    
    try {
        // Apply updates
        Object.assign(this.state, updates);
        
        // Validate new state
        if (!this.isValidState(this.state)) {
            throw new Error('Invalid state after update');
        }
        
        // Persist if valid
        this.persistState();
        ComplianceUtils.log('StateManager', 'State updated successfully');
        
    } catch (error) {
        // Rollback on error
        ComplianceUtils.log('StateManager', 'State update failed, rolling back: ' + error.message, 'error');
        this.state = backup;
        
        // Notify user
        this.app.showNotification('Failed to save changes', 'error');
        
        // Re-emit previous state
        this.emit('stateChange', this.state);
    }
}
```

### Pattern 5: Critical Operation Errors

**For operations that MUST succeed (like wallet creation):**

```javascript
async createWallet(name, mnemonic) {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            ComplianceUtils.log('WalletService', `Creating wallet (attempt ${attempt}/${maxRetries})`);
            
            // Critical operation
            const wallet = await this.generateWallet(mnemonic);
            
            // Verify wallet is valid
            if (!wallet.addresses || !wallet.addresses.bitcoin) {
                throw new Error('Invalid wallet generated - missing addresses');
            }
            
            ComplianceUtils.log('WalletService', 'Wallet created successfully');
            return wallet;
            
        } catch (error) {
            lastError = error;
            ComplianceUtils.log('WalletService', `Attempt ${attempt} failed: ${error.message}`, 'error');
            
            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    // All attempts failed
    ComplianceUtils.log('WalletService', 'All wallet creation attempts failed', 'error');
    
    // Show detailed error to user for critical failures
    this.app.showNotification(
        'Failed to create wallet. Please check your connection and try again.',
        'error',
        10000 // Show for 10 seconds
    );
    
    throw new Error(`Wallet creation failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

### Pattern 6: Network Error Handling

**Handle network-specific errors:**

```javascript
async makeNetworkRequest(url, options = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new NetworkError(`HTTP ${response.status}`, response.status);
        }
        
        return await response.json();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            ComplianceUtils.log('Network', 'Request timeout', 'error');
            throw new Error('Request timed out. Please check your connection.');
        }
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            ComplianceUtils.log('Network', 'Network connection error', 'error');
            throw new Error('Network connection failed. Please check your internet.');
        }
        
        if (error instanceof NetworkError) {
            if (error.status === 429) {
                ComplianceUtils.log('Network', 'Rate limited', 'warn');
                throw new Error('Too many requests. Please wait a moment.');
            }
            if (error.status >= 500) {
                ComplianceUtils.log('Network', 'Server error', 'error');
                throw new Error('Server error. Please try again later.');
            }
        }
        
        // Unknown error
        ComplianceUtils.log('Network', 'Unexpected error: ' + error.message, 'error');
        throw error;
    }
}

class NetworkError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'NetworkError';
    }
}
```

## User Notification Strategies

### Notification Types and When to Use

```javascript
// SUCCESS - Operation completed successfully
this.app.showNotification('Wallet created successfully', 'success');

// ERROR - Operation failed, user needs to know
this.app.showNotification('Failed to send transaction', 'error');

// WARNING - Something concerning but not critical
this.app.showNotification('Low balance warning', 'warning');

// INFO - General information
this.app.showNotification('Syncing with network...', 'info');
```

### Notification Duration Guidelines

```javascript
// Quick success/info - 3 seconds
this.app.showNotification('Copied to clipboard', 'success', 3000);

// Errors - 5 seconds (default)
this.app.showNotification('Invalid address', 'error', 5000);

// Critical errors - 10 seconds
this.app.showNotification('Wallet backup failed. Please try again.', 'error', 10000);

// Persistent until dismissed
this.app.showNotification('Network offline. Some features unavailable.', 'warning', 0);
```

## Logging Requirements

### What to Log

1. **Always Log**:
   - Function entry/exit for critical operations
   - All errors with stack traces
   - API request/response summaries
   - State changes
   - Performance warnings

2. **Never Log**:
   - Sensitive data (private keys, mnemonics)
   - Full API responses with personal data
   - User passwords
   - Detailed user activity

### Log Levels

```javascript
// INFO - Normal operation flow
ComplianceUtils.log('Component', 'Initializing', 'info');

// WARN - Potential issues but operation continues
ComplianceUtils.log('Component', 'Using fallback API', 'warn');

// ERROR - Operation failed
ComplianceUtils.log('Component', 'Failed to load: ' + error.message, 'error');
```

## Recovery Procedures

### Automatic Recovery Patterns

```javascript
class ResilientComponent {
    constructor() {
        this.failureCount = 0;
        this.maxFailures = 3;
    }
    
    async loadData() {
        try {
            const data = await this.fetchData();
            this.failureCount = 0; // Reset on success
            return data;
            
        } catch (error) {
            this.failureCount++;
            
            if (this.failureCount >= this.maxFailures) {
                // Switch to offline mode
                ComplianceUtils.log('Component', 'Switching to offline mode', 'warn');
                return this.getOfflineData();
            }
            
            // Retry with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, this.failureCount), 30000);
            ComplianceUtils.log('Component', `Retrying in ${delay}ms`, 'info');
            
            setTimeout(() => this.loadData(), delay);
            
            // Return cached data for now
            return this.getCachedData();
        }
    }
}
```

### Manual Recovery UI

```javascript
showRecoveryOptions(error) {
    const modal = $.div({ className: 'recovery-modal' }, [
        $.h3({}, 'Something went wrong'),
        $.p({}, 'We encountered an error while processing your request.'),
        $.div({ className: 'error-details' }, error.userMessage || 'Unknown error'),
        $.div({ className: 'recovery-actions' }, [
            $.button({
                onclick: () => {
                    this.retry();
                    modal.remove();
                }
            }, 'Retry'),
            $.button({
                onclick: () => {
                    this.useOfflineMode();
                    modal.remove();
                }
            }, 'Continue Offline'),
            $.button({
                onclick: () => {
                    this.reportIssue(error);
                    modal.remove();
                }
            }, 'Report Issue')
        ])
    ]);
    
    document.body.appendChild(modal);
}
```

## Security Considerations

### Safe Error Messages

```javascript
// BAD - Exposes internal details
catch (error) {
    this.app.showNotification(`Database error: ${error.stack}`, 'error');
}

// GOOD - Generic user message, detailed logging
catch (error) {
    ComplianceUtils.log('Database', error.stack, 'error');
    this.app.showNotification('Failed to save data. Please try again.', 'error');
}
```

### Sanitizing Error Data

```javascript
function sanitizeErrorForLogging(error) {
    const sanitized = {
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
    };
    
    // Remove sensitive data
    const sensitivePatterns = [
        /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g, // Bitcoin addresses
        /\b[A-Za-z]{3,}\s+(?:[A-Za-z]{3,}\s+){10,23}[A-Za-z]{3,}\b/g, // Seed phrases
        /[a-fA-F0-9]{64}/g // Private keys
    ];
    
    sensitivePatterns.forEach(pattern => {
        sanitized.message = sanitized.message.replace(pattern, '[REDACTED]');
    });
    
    return sanitized;
}
```

## Testing Error Conditions

### Simulating Errors for Testing

```javascript
// Development only - error injection
if (process.env.NODE_ENV === 'development') {
    window.debugErrorInjection = {
        networkFailure: false,
        apiError: false,
        validationError: false
    };
    
    // In your code
    if (window.debugErrorInjection?.networkFailure) {
        throw new Error('Simulated network failure');
    }
}
```

## Common Anti-Patterns to Avoid

```javascript
// ANTI-PATTERN 1: Silent failures
try {
    doSomething();
} catch (e) {
    // NEVER empty catch blocks!
}

// ANTI-PATTERN 2: Generic error handling
catch (error) {
    alert('Error!'); // Too generic!
}

// ANTI-PATTERN 3: Logging sensitive data
catch (error) {
    console.log('Failed to process wallet:', wallet); // Might contain private keys!
}

// ANTI-PATTERN 4: No error boundaries
async function riskyOperation() {
    const data = await fetch(url); // What if this throws?
    return data.json(); // What if this throws?
}

// ANTI-PATTERN 5: Assuming error structure
catch (error) {
    // Error might not have .response.data!
    const message = error.response.data.message; 
}
```

## Integration with Components

### Example: Complete Error-Handled Component

```javascript
class RobustComponent {
    constructor(app) {
        this.app = app;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    
    async initialize() {
        try {
            ComplianceUtils.log('RobustComponent', 'Initializing');
            
            // Load required data
            await this.loadData();
            
            // Setup UI
            this.render();
            
            ComplianceUtils.log('RobustComponent', 'Initialized successfully');
            
        } catch (error) {
            ComplianceUtils.log('RobustComponent', 'Initialization failed: ' + error.message, 'error');
            
            // Show recovery UI
            this.showErrorState(error);
            
            // Try auto-recovery
            this.scheduleRetry();
        }
    }
    
    async loadData() {
        try {
            const data = await ComplianceUtils.measurePerformance('Data Load', async () => {
                return await this.app.apiService.fetchData();
            });
            
            if (!this.validateData(data)) {
                throw new Error('Invalid data format');
            }
            
            this.data = data;
            
        } catch (error) {
            // Try cache
            const cached = this.loadFromCache();
            if (cached) {
                ComplianceUtils.log('RobustComponent', 'Using cached data', 'info');
                this.data = cached;
                return;
            }
            
            throw error; // Re-throw if no cache
        }
    }
    
    showErrorState(error) {
        this.container.innerHTML = '';
        this.container.appendChild(
            $.div({ className: 'error-state' }, [
                $.h3({}, 'Unable to load data'),
                $.p({}, 'Please check your connection and try again.'),
                $.button({
                    onclick: () => this.retry()
                }, 'Retry')
            ])
        );
    }
    
    async retry() {
        this.retryCount++;
        
        if (this.retryCount > this.maxRetries) {
            this.app.showNotification('Maximum retries exceeded', 'error');
            return;
        }
        
        await this.initialize();
    }
}
```

## Summary

Error handling in MOOSH Wallet is not optional - it's critical for:
- **User Experience**: Clear, actionable error messages
- **Security**: Never expose sensitive data
- **Reliability**: Graceful degradation and recovery
- **Debugging**: Comprehensive logging for troubleshooting

Always follow these patterns. When in doubt, look at existing error handling in similar components.