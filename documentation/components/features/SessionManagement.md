# Session Management

**Status**: 🟢 Active
**Type**: Security Feature
**Security Critical**: Yes
**Implementation**: Distributed throughout /public/js/moosh-wallet.js with localStorage and state management

## Overview
Session management controls user authentication state, wallet access, and security timeouts. The system maintains secure sessions while protecting against unauthorized access through automatic lockouts and session expiration.

## User Flow
```
[User Login] → [Session Created] → [Activity Monitoring] → [Auto-Lock/Timeout] → [Re-authentication Required]
```

## Technical Implementation

### Frontend
- **Entry Point**: Session state in `SparkStateManager` and localStorage
- **UI Components**: 
  - Lock screen overlay
  - Session timer display
  - Activity indicators
  - Logout button
  - Re-authentication modal
- **State Changes**: 
  - Authentication status
  - Last activity timestamp
  - Session expiration
  - Lock state

### Backend
- **API Endpoints**: None (client-side sessions)
- **Services Used**: 
  - Browser localStorage
  - Session storage
  - Idle detection
- **Data Flow**: 
  1. User authenticates
  2. Session token created
  3. Activity monitored
  4. Timeout warnings shown
  5. Auto-lock on idle

## Code Example
```javascript
// Session management implementation
class SessionManager {
    constructor(app) {
        this.app = app;
        this.sessionTimeout = 15 * 60 * 1000; // 15 minutes
        this.warningTime = 2 * 60 * 1000; // 2 minutes before timeout
        this.lastActivity = Date.now();
        this.sessionTimer = null;
        this.isLocked = false;
        
        this.initializeSession();
        this.startActivityMonitoring();
    }
    
    initializeSession() {
        // Check for existing session
        const savedSession = localStorage.getItem('walletSession');
        if (savedSession) {
            const session = JSON.parse(savedSession);
            if (this.isSessionValid(session)) {
                this.restoreSession(session);
            } else {
                this.clearSession();
            }
        }
        
        // Set up event listeners
        this.setupActivityListeners();
    }
    
    isSessionValid(session) {
        if (!session || !session.timestamp) return false;
        
        const elapsed = Date.now() - session.timestamp;
        return elapsed < this.sessionTimeout;
    }
    
    createSession(walletData) {
        const session = {
            timestamp: Date.now(),
            walletId: walletData.id,
            locked: false,
            attempts: 0
        };
        
        localStorage.setItem('walletSession', JSON.stringify(session));
        this.startSessionTimer();
        
        return session;
    }
    
    setupActivityListeners() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), {
                passive: true,
                capture: true
            });
        });
    }
    
    updateActivity() {
        if (this.isLocked) return;
        
        this.lastActivity = Date.now();
        this.resetSessionTimer();
        
        // Update session timestamp
        const session = JSON.parse(localStorage.getItem('walletSession') || '{}');
        session.timestamp = this.lastActivity;
        localStorage.setItem('walletSession', JSON.stringify(session));
    }
    
    startSessionTimer() {
        this.clearSessionTimer();
        
        // Warning timer
        setTimeout(() => {
            if (!this.isLocked) {
                this.showTimeoutWarning();
            }
        }, this.sessionTimeout - this.warningTime);
        
        // Timeout timer
        this.sessionTimer = setTimeout(() => {
            this.lockSession();
        }, this.sessionTimeout);
    }
    
    resetSessionTimer() {
        this.clearSessionTimer();
        this.startSessionTimer();
    }
    
    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }
    
    showTimeoutWarning() {
        this.app.showNotification(
            'Your session will expire in 2 minutes due to inactivity',
            'warning'
        );
    }
    
    lockSession() {
        this.isLocked = true;
        this.clearSessionTimer();
        
        // Update session
        const session = JSON.parse(localStorage.getItem('walletSession') || '{}');
        session.locked = true;
        localStorage.setItem('walletSession', JSON.stringify(session));
        
        // Clear sensitive data from memory
        this.app.state.set('currentWallet', null);
        this.app.state.set('privateKeys', null);
        
        // Show lock screen
        this.showLockScreen();
    }
    
    showLockScreen() {
        const lockScreen = new LockScreen({
            onUnlock: (password) => this.unlockSession(password),
            onLogout: () => this.logout()
        });
        lockScreen.show();
    }
    
    async unlockSession(password) {
        const session = JSON.parse(localStorage.getItem('walletSession') || '{}');
        
        // Verify password
        const isValid = await this.verifyPassword(password);
        
        if (isValid) {
            session.locked = false;
            session.attempts = 0;
            session.timestamp = Date.now();
            localStorage.setItem('walletSession', JSON.stringify(session));
            
            this.isLocked = false;
            this.startSessionTimer();
            
            // Restore wallet data
            await this.restoreWalletData();
            
            return true;
        } else {
            session.attempts = (session.attempts || 0) + 1;
            
            if (session.attempts >= 5) {
                // Too many attempts, force logout
                this.logout();
                this.app.showNotification('Too many failed attempts. Please log in again.', 'error');
            } else {
                localStorage.setItem('walletSession', JSON.stringify(session));
                this.app.showNotification(`Invalid password. ${5 - session.attempts} attempts remaining.`, 'error');
            }
            
            return false;
        }
    }
    
    logout() {
        // Clear all session data
        this.clearSession();
        
        // Clear wallet data
        localStorage.removeItem('sparkWallet');
        localStorage.removeItem('accounts');
        
        // Clear state
        this.app.state.clear();
        
        // Redirect to login
        this.app.router.navigate('/');
        
        this.app.showNotification('You have been logged out', 'info');
    }
    
    clearSession() {
        localStorage.removeItem('walletSession');
        this.clearSessionTimer();
        this.isLocked = false;
    }
}
```

## Configuration
- **Settings**: 
  - Session timeout: 15 minutes
  - Warning time: 2 minutes before
  - Max login attempts: 5
  - Activity events tracked
- **Defaults**: 
  - Auto-lock on timeout
  - Activity monitoring enabled
  - Session persistence
  - Failed attempt tracking
- **Limits**: 
  - One active session per device
  - No concurrent sessions
  - Local storage only

## Security Considerations
- **Session Security**:
  - No sensitive data in session
  - Timestamp validation
  - Automatic expiration
  - Secure password verification
- **Data Protection**:
  - Memory cleared on lock
  - No session sharing
  - HTTPS required
  - XSS protection
- **Attack Prevention**:
  - Brute force protection
  - Session fixation prevention
  - CSRF tokens (planned)
  - Secure logout

## Performance Impact
- **Load Time**: Minimal session check
- **Memory**: Small session object
- **Network**: None (local only)

## Mobile Considerations
- Background tab handling
- App switching detection
- Touch events for activity
- Reduced timeout on mobile
- Biometric unlock option (planned)

## Error Handling
- **Common Errors**: 
  - Session corruption
  - Storage quota exceeded
  - Clock skew issues
  - Browser privacy mode
- **Recovery**: 
  - Session validation
  - Automatic cleanup
  - Force re-login
  - Clear error messages

## Testing
```bash
# Test session management
1. Session creation:
   - Log in to wallet
   - Verify session created
   - Check localStorage
   
2. Activity monitoring:
   - Stay idle for 13 minutes
   - Verify warning appears
   - Move mouse to reset
   
3. Auto-lock testing:
   - Stay idle for 15 minutes
   - Verify lock screen appears
   - Test unlock with password
   
4. Failed attempts:
   - Enter wrong password 5 times
   - Verify force logout
   - Check session cleared
   
5. Manual logout:
   - Click logout button
   - Verify complete cleanup
   - Check redirect to login
```

## Future Enhancements
- **Advanced Security**:
  - Biometric authentication
  - Hardware key support
  - Multi-factor authentication
  - Device binding
  - Session encryption
- **User Experience**:
  - Remember me option
  - Session transfer
  - Activity heatmap
  - Custom timeout settings
  - Quick lock shortcut
- **Monitoring**:
  - Session analytics
  - Security event logs
  - Anomaly detection
  - Geographic tracking
  - Device fingerprinting