# Error Recovery

**Status**: 🟢 Active
**Type**: Core Feature
**Security Critical**: Yes
**Implementation**: Throughout /public/js/moosh-wallet.js, with key handlers at API calls and critical operations

## Overview
Error recovery ensures the wallet remains functional even when failures occur. The system implements comprehensive error handling, fallback mechanisms, and recovery strategies to prevent data loss and maintain user access to funds.

## User Flow
```
[Error Occurs] → [Error Caught] → [User Notified] → [Recovery Options] → [System Restored]
```

## Technical Implementation

### Frontend
- **Entry Point**: Error boundaries and try-catch blocks throughout
- **UI Components**: 
  - Error notification system
  - Recovery modals
  - Retry buttons
  - Fallback UI states
  - Error logs display
- **State Changes**: 
  - Error state tracking
  - Recovery mode flags
  - Fallback data usage

### Backend
- **API Endpoints**: All endpoints include error handling
- **Services Used**: 
  - Error logging service
  - Fallback data providers
  - Recovery mechanisms
- **Data Flow**: 
  1. Operation attempted
  2. Error caught and classified
  3. Recovery strategy selected
  4. User notified with options
  5. System attempts recovery

## Code Example
```javascript
// Comprehensive error recovery implementation
class ErrorRecovery {
    static async withRecovery(operation, options = {}) {
        const {
            maxRetries = 3,
            retryDelay = 1000,
            fallbackValue = null,
            onError = null,
            showNotification = true
        } = options;
        
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.error(`Attempt ${attempt} failed:`, error);
                
                // Classify error type
                const errorType = this.classifyError(error);
                
                // Handle based on type
                switch (errorType) {
                    case 'network':
                        if (attempt < maxRetries) {
                            await this.delay(retryDelay * attempt);
                            continue;
                        }
                        break;
                        
                    case 'auth':
                        // Don't retry auth errors
                        if (showNotification) {
                            app.showNotification('Authentication required', 'error');
                        }
                        throw error;
                        
                    case 'data':
                        // Try to recover from cache
                        const cached = this.getCachedData(operation.name);
                        if (cached) {
                            if (showNotification) {
                                app.showNotification('Using cached data', 'warning');
                            }
                            return cached;
                        }
                        break;
                        
                    case 'critical':
                        // Critical errors need immediate attention
                        this.handleCriticalError(error);
                        throw error;
                }
                
                if (onError) {
                    const handled = await onError(error, attempt);
                    if (handled) return handled;
                }
            }
        }
        
        // All retries failed
        if (fallbackValue !== null) {
            if (showNotification) {
                app.showNotification('Operation failed, using fallback', 'warning');
            }
            return fallbackValue;
        }
        
        throw lastError;
    }
    
    static classifyError(error) {
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
            return 'network';
        }
        if (error.status === 401 || error.status === 403) {
            return 'auth';
        }
        if (error.message?.includes('parse') || error.message?.includes('data')) {
            return 'data';
        }
        if (error.message?.includes('critical') || error.message?.includes('security')) {
            return 'critical';
        }
        return 'unknown';
    }
    
    static handleCriticalError(error) {
        // Log to error tracking
        console.error('CRITICAL ERROR:', error);
        
        // Save error state
        localStorage.setItem('lastCriticalError', JSON.stringify({
            timestamp: Date.now(),
            message: error.message,
            stack: error.stack
        }));
        
        // Show recovery modal
        this.showRecoveryModal(error);
    }
    
    static showRecoveryModal(error) {
        const modal = new Modal({
            title: 'Critical Error',
            content: `
                <p>A critical error has occurred:</p>
                <code>${error.message}</code>
                <p>Recovery options:</p>
                <ul>
                    <li>Refresh the page</li>
                    <li>Clear cache and reload</li>
                    <li>Contact support with error details</li>
                </ul>
            `,
            buttons: [
                {
                    text: 'Refresh Page',
                    onClick: () => window.location.reload()
                },
                {
                    text: 'Clear Cache',
                    onClick: () => {
                        localStorage.clear();
                        window.location.reload();
                    }
                }
            ]
        });
        modal.show();
    }
}

// Usage example with API calls
async fetchBalance(address) {
    return ErrorRecovery.withRecovery(
        async () => {
            const response = await this.apiService.request(`/api/bitcoin/balance/${address}`);
            return response.data.balance;
        },
        {
            maxRetries: 5,
            retryDelay: 2000,
            fallbackValue: this.getCachedBalance(address) || '0.00000000',
            showNotification: true,
            onError: (error, attempt) => {
                console.log(`Balance fetch attempt ${attempt} failed`);
                if (attempt === 3) {
                    // Try alternative API
                    return this.fetchBalanceFromBackup(address);
                }
            }
        }
    );
}
```

## Configuration
- **Settings**: 
  - Default retry count: 3
  - Retry delays: 1s, 2s, 4s (exponential)
  - Error log retention: 7 days
  - Cache duration: 1 hour
- **Defaults**: 
  - Auto-retry network errors
  - Show user notifications
  - Log all errors
  - Cache successful responses
- **Limits**: 
  - Maximum 10 retries
  - 30-second total timeout
  - 100 error log entries

## Security Considerations
- **Error Information**:
  - Sanitize error messages
  - No sensitive data in logs
  - Stack traces in dev only
  - User-friendly messages
- **Recovery Security**:
  - Validate cached data
  - No automatic auth retry
  - Secure fallback sources
  - Rate limit recovery attempts

## Performance Impact
- **Load Time**: Retry delays add latency
- **Memory**: Error log storage
- **Network**: Additional retry requests

## Mobile Considerations
- Offline detection and handling
- Reduced retry attempts on mobile
- Battery-conscious recovery
- Clear error messages
- Touch-friendly recovery buttons

## Error Handling
- **Common Errors**: 
  - Network timeouts
  - API rate limits
  - Invalid responses
  - Storage quota exceeded
  - Authentication failures
- **Recovery**: 
  - Automatic retry with backoff
  - Fallback to cached data
  - Alternative API endpoints
  - Graceful degradation
  - Manual recovery options

## Testing
```bash
# Test error recovery
1. Network error simulation:
   - Disable network
   - Attempt balance fetch
   - Verify retry behavior
   - Check fallback to cache
   
2. API error handling:
   - Mock 500 errors
   - Mock 401 errors
   - Mock malformed responses
   - Verify appropriate handling
   
3. Critical error recovery:
   - Trigger security error
   - Verify modal appears
   - Test recovery options
   - Check error logging
   
4. Mobile error handling:
   - Test offline scenarios
   - Verify reduced retries
   - Check error messages
   - Test recovery actions
```

## Future Enhancements
- **Advanced Recovery**:
  - Machine learning for error prediction
  - Preemptive error avoidance
  - Smart retry strategies
  - Cross-device error sync
  - Automated error reporting
- **User Experience**:
  - Inline error recovery
  - Progressive enhancement
  - Background recovery
  - Error analytics dashboard
  - Community error solutions
- **Resilience**:
  - Circuit breaker pattern
  - Bulkhead isolation
  - Timeout optimization
  - Health check system
  - Self-healing mechanisms