# Update Checking

**Status**: 🔴 Planned
**Type**: Enhancement
**Security Critical**: Yes
**Implementation**: Planned for future release

## Overview
Update checking ensures users run the latest, most secure version of MOOSH Wallet. The system will periodically check for updates, notify users of new releases, and provide secure update mechanisms while maintaining user control over the update process.

## User Flow
```
[Automatic Check] → [Update Available] → [User Notified] → [Review Changes] → [User Confirms] → [Update Applied]
```

## Technical Implementation

### Frontend
- **Entry Point**: Update service initialization
- **UI Components**: 
  - Update notification banner
  - Changelog modal
  - Update progress indicator
  - Version display
  - Update settings
- **State Changes**: 
  - Current version tracking
  - Update availability
  - User preferences

### Backend
- **API Endpoints**: 
  - `/api/version/check` (planned)
  - `/api/version/changelog` (planned)
  - `/api/version/download` (planned)
- **Services Used**: 
  - GitHub Releases API
  - Semantic versioning
  - Signature verification
- **Data Flow**: 
  1. Periodic version check
  2. Compare with current
  3. Fetch changelog if newer
  4. Notify user
  5. Handle update process

## Code Example
```javascript
// Update checking implementation (planned)
class UpdateManager {
    constructor(app) {
        this.app = app;
        this.currentVersion = '2.0.0'; // From package.json
        this.updateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.lastCheck = null;
        this.updateAvailable = null;
        this.autoCheck = true;
        
        this.initializeUpdateChecking();
    }
    
    initializeUpdateChecking() {
        // Load user preferences
        this.loadPreferences();
        
        // Check on startup
        if (this.autoCheck) {
            this.checkForUpdates();
        }
        
        // Set up periodic checks
        this.scheduleUpdateChecks();
        
        // Listen for manual check requests
        this.setupEventListeners();
    }
    
    loadPreferences() {
        const prefs = localStorage.getItem('updatePreferences');
        if (prefs) {
            const { autoCheck, checkInterval } = JSON.parse(prefs);
            this.autoCheck = autoCheck !== false;
            this.updateCheckInterval = checkInterval || this.updateCheckInterval;
        }
    }
    
    async checkForUpdates(silent = true) {
        try {
            // Check if enough time has passed
            if (this.lastCheck && Date.now() - this.lastCheck < 60000) {
                // Prevent checking more than once per minute
                return;
            }
            
            this.lastCheck = Date.now();
            
            if (!silent) {
                this.app.showNotification('Checking for updates...', 'info');
            }
            
            // Fetch latest version info
            const response = await fetch('https://api.github.com/repos/moosh-wallet/releases/latest');
            const release = await response.json();
            
            const latestVersion = release.tag_name.replace('v', '');
            
            // Compare versions
            if (this.isNewerVersion(latestVersion, this.currentVersion)) {
                this.updateAvailable = {
                    version: latestVersion,
                    changelog: release.body,
                    downloadUrl: release.assets[0]?.browser_download_url,
                    publishedAt: release.published_at,
                    size: release.assets[0]?.size
                };
                
                this.notifyUpdateAvailable();
            } else if (!silent) {
                this.app.showNotification('You are running the latest version', 'success');
            }
            
        } catch (error) {
            console.error('Update check failed:', error);
            if (!silent) {
                this.app.showNotification('Failed to check for updates', 'error');
            }
        }
    }
    
    isNewerVersion(latest, current) {
        const latestParts = latest.split('.').map(Number);
        const currentParts = current.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if (latestParts[i] > currentParts[i]) return true;
            if (latestParts[i] < currentParts[i]) return false;
        }
        
        return false;
    }
    
    notifyUpdateAvailable() {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🎉</div>
                <div class="update-text">
                    <h4>Update Available!</h4>
                    <p>Version ${this.updateAvailable.version} is now available</p>
                </div>
                <div class="update-actions">
                    <button onclick="window.updateManager.showUpdateDetails()">
                        View Details
                    </button>
                    <button onclick="window.updateManager.dismissUpdate()">
                        Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Store reference
        window.updateManager = this;
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }
    
    showUpdateDetails() {
        const modal = document.createElement('div');
        modal.className = 'update-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Update to Version ${this.updateAvailable.version}</h2>
                
                <div class="update-info">
                    <p><strong>Released:</strong> ${new Date(this.updateAvailable.publishedAt).toLocaleDateString()}</p>
                    <p><strong>Size:</strong> ${this.formatBytes(this.updateAvailable.size)}</p>
                </div>
                
                <div class="changelog">
                    <h3>What's New:</h3>
                    <div class="changelog-content">
                        ${this.parseChangelog(this.updateAvailable.changelog)}
                    </div>
                </div>
                
                <div class="update-warnings">
                    <h4>⚠️ Important:</h4>
                    <ul>
                        <li>Backup your wallet before updating</li>
                        <li>Verify the update signature</li>
                        <li>Updates cannot be reversed</li>
                    </ul>
                </div>
                
                <div class="modal-actions">
                    <button onclick="window.updateManager.startUpdate()">
                        Update Now
                    </button>
                    <button onclick="window.updateManager.closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus trap
        this.app.accessibility?.createFocusTrap(modal);
    }
    
    parseChangelog(markdown) {
        // Simple markdown to HTML conversion
        return markdown
            .replace(/### (.*)/g, '<h4>$1</h4>')
            .replace(/## (.*)/g, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*)\*/g, '<em>$1</em>')
            .replace(/- (.*)/g, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }
    
    async startUpdate() {
        try {
            // Verify user wants to proceed
            if (!confirm('Are you sure you want to update? Make sure you have backed up your wallet.')) {
                return;
            }
            
            this.app.showNotification('Preparing update...', 'info');
            
            // In a real implementation:
            // 1. Download update package
            // 2. Verify signature
            // 3. Apply update
            // 4. Restart application
            
            // For web app, redirect to latest version
            window.location.href = this.updateAvailable.downloadUrl;
            
        } catch (error) {
            console.error('Update failed:', error);
            this.app.showNotification('Update failed. Please try again later.', 'error');
        }
    }
    
    scheduleUpdateChecks() {
        // Clear existing interval
        if (this.updateCheckTimer) {
            clearInterval(this.updateCheckTimer);
        }
        
        // Set up periodic checks
        this.updateCheckTimer = setInterval(() => {
            if (this.autoCheck) {
                this.checkForUpdates(true); // Silent check
            }
        }, this.updateCheckInterval);
    }
    
    dismissUpdate() {
        // Hide notification
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
        
        // Don't notify again for this version
        localStorage.setItem('dismissedUpdate', this.updateAvailable.version);
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Settings UI
    createSettingsUI() {
        const $ = window.ElementFactory;
        
        return $.div({ className: 'update-settings' }, [
            $.h3({}, ['Update Settings']),
            
            $.div({ className: 'setting-item' }, [
                $.label({}, [
                    $.input({
                        type: 'checkbox',
                        checked: this.autoCheck,
                        onchange: (e) => {
                            this.autoCheck = e.target.checked;
                            this.savePreferences();
                        }
                    }),
                    ' Automatically check for updates'
                ])
            ]),
            
            $.div({ className: 'setting-item' }, [
                $.label({}, ['Check frequency:']),
                $.select({
                    value: String(this.updateCheckInterval),
                    onchange: (e) => {
                        this.updateCheckInterval = Number(e.target.value);
                        this.savePreferences();
                        this.scheduleUpdateChecks();
                    }
                }, [
                    $.option({ value: '3600000' }, ['Every hour']),
                    $.option({ value: '86400000' }, ['Daily']),
                    $.option({ value: '604800000' }, ['Weekly']),
                    $.option({ value: '2592000000' }, ['Monthly'])
                ])
            ]),
            
            $.div({ className: 'setting-item' }, [
                $.button({
                    onclick: () => this.checkForUpdates(false)
                }, ['Check for Updates Now'])
            ]),
            
            $.div({ className: 'version-info' }, [
                `Current version: ${this.currentVersion}`
            ])
        ]);
    }
    
    savePreferences() {
        localStorage.setItem('updatePreferences', JSON.stringify({
            autoCheck: this.autoCheck,
            checkInterval: this.updateCheckInterval
        }));
    }
}

// CSS for update notifications
const updateStyles = `
.update-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 2px solid var(--text-accent);
    border-radius: 8px;
    padding: 20px;
    max-width: 400px;
    transform: translateX(450px);
    transition: transform 0.3s ease;
    z-index: 9999;
}

.update-notification.show {
    transform: translateX(0);
}

.update-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.update-icon {
    font-size: 32px;
}

.update-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.changelog-content {
    max-height: 300px;
    overflow-y: auto;
    background: var(--bg-tertiary);
    padding: 15px;
    border-radius: 5px;
}

.update-warnings {
    background: rgba(255,152,0,0.1);
    border: 1px solid #ff9800;
    padding: 15px;
    border-radius: 5px;
    margin: 20px 0;
}
`;
```

## Configuration
- **Settings**: 
  - Auto-check: enabled/disabled
  - Check frequency: configurable
  - Update channel: stable/beta
  - Notification style: banner/modal
- **Defaults**: 
  - Daily checks
  - Stable channel only
  - Non-intrusive notifications
  - Manual update required
- **Limits**: 
  - Max 1 check per minute
  - Rate limit handling
  - Version validation

## Security Considerations
- **Update Security**:
  - HTTPS only for checks
  - Signature verification
  - Checksum validation
  - No auto-install
- **User Protection**:
  - Backup reminders
  - Changelog review
  - Manual confirmation
  - Rollback planning

## Performance Impact
- **Load Time**: None (async)
- **Memory**: Minimal
- **Network**: ~1KB per check

## Mobile Considerations
- App store updates (mobile apps)
- Data usage warnings
- Wi-Fi only option
- Background check support
- Push notifications

## Error Handling
- **Common Errors**: 
  - Network failures
  - Rate limiting
  - Invalid version format
  - Signature mismatch
- **Recovery**: 
  - Retry with backoff
  - Cached version info
  - Manual check option
  - Clear error messages

## Testing
```bash
# Test update checking
1. Mock update available:
   - Modify version check
   - Verify notification
   - Test UI elements
   
2. Test user flows:
   - View changelog
   - Dismiss update
   - Accept update
   - Cancel update
   
3. Test settings:
   - Toggle auto-check
   - Change frequency
   - Manual check
```

## Future Enhancements
- **Advanced Updates**:
  - Delta updates
  - Background downloads
  - Staged rollouts
  - A/B testing
  - Rollback mechanism
- **Channels**:
  - Beta channel
  - Nightly builds
  - Custom channels
  - Enterprise updates
  - Security patches
- **Integration**:
  - CI/CD pipeline
  - Auto-changelog
  - Release notes
  - Update analytics
  - User feedback