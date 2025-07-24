# PasswordModal Component Documentation

## Overview
The PasswordModal component provides secure password verification and password management functionality throughout the MOOSH Wallet application. It's used for transaction confirmations, accessing sensitive information, and password changes.

## Component Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 25757-25874
- **Class Definition**: `class PasswordModal`

## Visual Design

### ASCII Layout
```
┌─────────────────────────────────────┐
│        [Modal Title]                │
│  ┌─────────────────────────────┐    │
│  │     [Modal Message]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password:                          │
│  ┌─────────────────────────────┐    │
│  │ ••••••••••                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [New Password Section - optional]  │
│  New Password:                      │
│  ┌─────────────────────────────┐    │
│  │ ••••••••••                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  Confirm Password:                  │
│  ┌─────────────────────────────┐    │
│  │ ••••••••••                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │  Submit  │    │  Cancel  │      │
│  └──────────┘    └──────────┘      │
└─────────────────────────────────────┘
```

### Specifications
- **Width**: 400px (max)
- **Background**: #1A1D29
- **Border**: 1px solid #333333
- **Border Radius**: 12px
- **Shadow**: 0 4px 24px rgba(0, 0, 0, 0.3)
- **Theme Support**: Adapts to moosh-mode with green accent (#69fd97)

## Constructor

```javascript
class PasswordModal {
    constructor(app, options = {}) {
        this.app = app;
        this.options = {
            title: options.title || 'Password Required',
            message: options.message || 'Enter your password to continue',
            requireNewPassword: options.requireNewPassword || false,
            onSuccess: options.onSuccess || (() => {}),
            onCancel: options.onCancel || (() => {})
        };
        this.modal = null;
    }
}
```

### Options
- **title** (string): Modal title text
- **message** (string): Descriptive message for the user
- **requireNewPassword** (boolean): Show new password fields for password changes
- **onSuccess** (function): Callback when password is successfully verified/set
- **onCancel** (function): Callback when modal is cancelled

## Key Methods

### show()
**Location**: Lines 25775-25874
Creates and displays the password modal with appropriate input fields.

```javascript
show() {
    const $ = window.ElementFactory;
    const isMooshMode = document.body.classList.contains('moosh-mode');
    
    this.modal = $.div({
        className: 'modal-overlay',
        onclick: (e) => {
            if (e.target.className === 'modal-overlay') {
                this.hide();
                this.options.onCancel();
            }
        }
    }, [
        // Modal content...
    ]);
    
    document.body.appendChild(this.modal);
}
```

### hide()
Removes the modal from the DOM.

```javascript
hide() {
    if (this.modal && this.modal.parentNode) {
        this.modal.remove();
    }
}
```

## Usage Examples

### 1. Transaction Confirmation
**Location**: Line 10611
```javascript
const passwordModal = new PasswordModal(this.app, {
    title: 'Confirm Transaction',
    message: `Enter password to send ${amount} BTC to ${this.formatAddress(address)}`,
    onSuccess: () => {
        // Process transaction
        this.processSendTransaction(address, amount);
    }
});
passwordModal.show();
```

### 2. Viewing Seed Phrase
**Location**: Line 25429
```javascript
const passwordModal = new PasswordModal(this.app, {
    title: 'Password Required',
    message: 'Enter your password to view seed phrase',
    onSuccess: () => {
        this.displaySeedPhrase();
    }
});
passwordModal.show();
```

### 3. Setting New Password
**Location**: Line 25622
```javascript
const setModal = new PasswordModal(this.app, {
    title: 'Set Wallet Password',
    requireNewPassword: true,
    onSuccess: (password) => {
        this.app.state.setPassword(password);
        this.app.showNotification('Password set successfully', 'success');
    }
});
setModal.show();
```

### 4. Changing Password
**Location**: Lines 25604-25628
```javascript
// First verify current password
const verifyModal = new PasswordModal(this.app, {
    title: 'Verify Current Password',
    message: 'Enter your current password',
    onSuccess: () => {
        // Then show new password dialog
        const changeModal = new PasswordModal(this.app, {
            title: 'Set New Password',
            requireNewPassword: true,
            onSuccess: (newPassword) => {
                this.app.state.setPassword(newPassword);
                this.app.showNotification('Password changed successfully', 'success');
            }
        });
        changeModal.show();
    }
});
verifyModal.show();
```

## Modal Elements

### Password Input Field
- **Type**: password
- **ID**: wallet-password
- **Styling**: 
  ```css
  width: 100%
  padding: 12px
  border: 1px solid #333333
  border-radius: 8px
  background: rgba(255, 255, 255, 0.05)
  color: #ffffff
  ```

### New Password Fields (when requireNewPassword = true)
- **New Password Input**: ID = new-password
- **Confirm Password Input**: ID = confirm-password
- **Validation**: Ensures passwords match before submission

### Action Buttons
- **Submit Button**: 
  - Background: Theme color (#f57315 or #69fd97 in moosh mode)
  - Text: "Submit" or "Set Password"
- **Cancel Button**: 
  - Background: transparent
  - Border: 1px solid #666666

## Security Considerations

1. **Password Verification**
   - Uses app.state.verifyPassword() for authentication
   - No password stored in component state
   - Clears input fields after use

2. **Password Strength** (for new passwords)
   - Minimum 8 characters required
   - Visual feedback for password mismatch
   - Confirmation field required

3. **Event Handling**
   - Click outside modal to cancel
   - Enter key submits form
   - Escape key cancels (not implemented but recommended)

## Mobile Responsiveness

- **Width**: Adjusts to 90% of viewport on mobile
- **Max Width**: 400px maintained
- **Input Fields**: Larger touch targets on mobile (48px min height)
- **Buttons**: Full width on mobile devices

## Integration Points

### State Management
- Reads: `app.state.hasPassword()`
- Writes: `app.state.setPassword(newPassword)`
- Verifies: `app.state.verifyPassword(password)`

### Notification System
- Success notifications after password operations
- Error notifications for incorrect passwords

### Other Modals
- Often chains to other modals after successful verification
- Used as a gateway to sensitive operations

## Error States

1. **Incorrect Password**
   - Shows error notification
   - Clears password field
   - Keeps modal open

2. **Password Mismatch** (new password)
   - Shows inline error message
   - Highlights mismatched fields
   - Prevents submission

3. **Empty Password**
   - Shows error notification
   - Focuses empty field

## Best Practices

1. Always provide clear context in the message
2. Use specific titles for different operations
3. Handle both success and cancel callbacks
4. Clear sensitive data from memory after use
5. Test on mobile devices for touch interactions