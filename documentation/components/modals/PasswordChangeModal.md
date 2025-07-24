# PasswordChangeModal Component Documentation

## Overview
The Password Change functionality in MOOSH Wallet is implemented using the existing PasswordModal component with special configuration. It provides a two-step process for changing passwords: first verifying the current password, then setting a new one.

## Component Location
- **Implementation**: Uses `PasswordModal` class (Lines 25757-25874)
- **Change Password Method**: Lines 25601-25631
- **Invocation**: From WalletDetails settings page

## Visual Design

### ASCII Layout - Step 1: Verify Current Password
```
┌─────────────────────────────────────┐
│      Verify Current Password        │
│  ┌─────────────────────────────┐    │
│  │ Enter your current password │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password:                          │
│  ┌─────────────────────────────┐    │
│  │ ••••••••••                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │  Submit  │    │  Cancel  │      │
│  └──────────┘    └──────────┘      │
└─────────────────────────────────────┘
```

### ASCII Layout - Step 2: Set New Password
```
┌─────────────────────────────────────┐
│        Set New Password             │
│                                     │
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
│  │Set Password│   │  Cancel  │      │
│  └──────────┘    └──────────┘      │
└─────────────────────────────────────┘
```

## Implementation

### changePassword() Method
**Location**: Lines 25601-25631

```javascript
changePassword() {
    if (this.app.state.hasPassword()) {
        // First verify current password
        const verifyModal = new PasswordModal(this.app, {
            title: 'Verify Current Password',
            message: 'Enter your current password',
            onSuccess: () => {
                // Then show new password dialog
                const changeModal = new PasswordModal(this.app, {
                    title: 'Set New Password',
                    requireNewPassword: true,
                    onSuccess: () => {
                        this.app.showNotification('Password changed successfully', 'success');
                    }
                });
                changeModal.show();
            }
        });
        verifyModal.show();
    } else {
        // No current password, just set new one
        const setModal = new PasswordModal(this.app, {
            title: 'Set Wallet Password',
            requireNewPassword: true,
            onSuccess: () => {
                this.app.showNotification('Password set successfully', 'success');
            }
        });
        setModal.show();
    }
}
```

## Password Change Flow

### Case 1: Existing Password
1. **Verification Modal**
   - Title: "Verify Current Password"
   - Message: "Enter your current password"
   - Single password input field
   - Validates against stored password

2. **New Password Modal** (on successful verification)
   - Title: "Set New Password"
   - Two input fields: new password and confirmation
   - Validates password match
   - Updates stored password on success

### Case 2: No Existing Password
1. **Direct to New Password Modal**
   - Title: "Set Wallet Password"
   - Two input fields: new password and confirmation
   - Sets initial password for wallet

## Modal Configuration

### Verification Modal Options
```javascript
{
    title: 'Verify Current Password',
    message: 'Enter your current password',
    requireNewPassword: false,  // implied
    onSuccess: () => { /* proceed to new password */ },
    onCancel: () => { /* close modal */ }
}
```

### New Password Modal Options
```javascript
{
    title: 'Set New Password',
    requireNewPassword: true,   // Shows two password fields
    onSuccess: () => { /* password changed */ },
    onCancel: () => { /* close modal */ }
}
```

## Integration Points

### Invocation
The password change functionality is typically accessed from:
1. **Wallet Details Page**: Settings section
2. **Security Settings**: Password management area

Example button:
```javascript
$.button({
    className: 'btn btn-secondary',
    onclick: () => this.changePassword()
}, ['Change Password'])
```

### State Management
- **Check Existing**: `app.state.hasPassword()`
- **Verify Password**: `app.state.verifyPassword(password)`
- **Update Password**: `app.state.setPassword(newPassword)`

## User Experience

### Success Flow
1. User clicks "Change Password"
2. If password exists:
   - Enter current password
   - Submit → Verification
   - Enter new password twice
   - Submit → Success notification
3. If no password:
   - Enter new password twice
   - Submit → Success notification

### Error Handling
1. **Incorrect Current Password**
   - Error notification
   - Modal remains open
   - User can retry

2. **Password Mismatch**
   - Inline error message
   - Fields highlighted
   - Cannot submit until matching

3. **Empty Fields**
   - Error notification
   - Focus on empty field

## Security Considerations

1. **Two-Step Verification**
   - Always verify current password first
   - Prevents unauthorized password changes

2. **Password Requirements**
   - Minimum 8 characters (enforced in PasswordModal)
   - Confirmation required
   - No password visible in plaintext

3. **State Updates**
   - Password updated atomically
   - No intermediate states
   - Encrypted storage

## Visual Specifications

### Modal Styling
- Inherits all styling from PasswordModal
- Theme-aware (orange/green accents)
- Consistent with wallet design language

### Form Elements
- Password inputs with bullet masking
- Clear labeling
- Responsive button layout

## Notifications

### Success Messages
- "Password changed successfully" - After successful change
- "Password set successfully" - For initial password

### Error Messages
- "Incorrect password" - Failed verification
- "Passwords do not match" - Mismatch in new password
- "Password must be at least 8 characters" - Too short

## Mobile Responsiveness

- Same responsive behavior as PasswordModal
- Touch-friendly inputs
- Appropriate keyboard types

## Best Practices

1. **Always use two-step process** for existing passwords
2. **Clear sensitive data** from memory after use
3. **Provide clear feedback** at each step
4. **Handle all error cases** gracefully
5. **Test password strength** (future enhancement)
6. **Consider adding password requirements display**

## Future Enhancements

1. **Password Strength Meter**
   - Visual feedback on password quality
   - Requirements checklist

2. **Password Recovery**
   - Security questions
   - Recovery phrase option

3. **Password History**
   - Prevent reuse of recent passwords
   - Configurable history length

4. **Two-Factor Authentication**
   - Additional security layer
   - TOTP support

## Related Components

- **PasswordModal**: Base implementation
- **WalletDetails**: Common invocation point
- **StateManager**: Password storage and verification