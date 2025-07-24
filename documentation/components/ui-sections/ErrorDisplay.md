# ErrorDisplay

**Status**: 🟢 Active
**Type**: UI Component
**Location**: /public/js/moosh-wallet.js:4264-4280
**Mobile Support**: Yes
**Theme Support**: Dark/Light

## Visual Design

```
Within Container:
┌─────────────────────────────────────┐
│                                     │
│    ⚠️ Incorrect password            │  <- Red text, centered
│                                     │
└─────────────────────────────────────┘

Error Types:
- "Please enter a password"
- "Incorrect password"
- "Invalid address format"
- "Insufficient balance"
- "Network error"
```

## Structure
- **Container**: `div#lockErrorContainer` (or similar)
- **Children**: Error message div
- **Layout**: Centered text within container

## Styling
- **Base Classes**: None (inline styles)
- **Color**: #ff4444 (red)
- **Font**: 12px, inherits family
- **Positioning**: Centered text alignment

## State Management
- **States**: 
  - Hidden (empty container)
  - Visible (with message)
  - Auto-hiding (after timeout)
- **Updates**: 
  - Shows immediately on error
  - Auto-dismisses after 3 seconds
  - Clears on new attempt

## Implementation
```javascript
showError(message) {
    const errorContainer = document.getElementById('lockErrorContainer');
    if (errorContainer) {
        // Clear existing errors
        errorContainer.innerHTML = '';
        
        // Create error element
        const errorDiv = ElementFactory.div({ 
            style: 'color: #ff4444; font-size: 12px; text-align: center;'
        }, [message]);
        
        errorContainer.appendChild(errorDiv);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (errorContainer) {
                errorContainer.innerHTML = '';
            }
        }, 3000);
    }
}
```

## Usage Patterns
1. **Form Validation**
   ```javascript
   if (!password) {
       this.showError('Please enter a password');
       return;
   }
   ```

2. **Authentication Errors**
   ```javascript
   if (password !== storedPassword) {
       this.showError('Incorrect password');
   }
   ```

3. **Network Errors**
   ```javascript
   catch (error) {
       this.showError('Network error. Please try again.');
   }
   ```

## CSS Requirements
```css
/* Error container setup */
#lockErrorContainer {
    min-height: 20px;
    margin-bottom: 20px;
}

/* Error message styling */
.error-message {
    color: #ff4444;
    font-size: 12px;
    text-align: center;
    padding: 8px;
    margin: 4px 0;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Shake animation for container */
.error-shake {
    animation: shake 0.5s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}
```

## Error Types & Messages

### Validation Errors
- "Please enter a password"
- "Password must be at least 8 characters"
- "Please fill in all required fields"

### Authentication Errors
- "Incorrect password"
- "Maximum attempts exceeded"
- "Session expired"

### Transaction Errors
- "Invalid address format"
- "Insufficient balance"
- "Amount must be greater than 0"

### Network Errors
- "Network error. Please try again."
- "Connection timeout"
- "Server unavailable"

## Accessibility
- **ARIA Labels**: 
  - `role="alert"` for immediate attention
  - `aria-live="assertive"` for screen readers
- **Screen Reader**: 
  - Announces errors immediately
  - Clear, actionable messages
- **Visual Design**: 
  - High contrast red (#ff4444)
  - Sufficient padding for readability

## Performance
- **Render Strategy**: Direct DOM manipulation
- **Updates**: Replaces content (no accumulation)
- **Cleanup**: Auto-removes after timeout
- **Memory**: Clears references after removal

## Connected Components
- **Parent**: 
  - WalletLockScreen
  - Form containers
  - Modal dialogs
- **Children**: Text content only
- **Events**: None
- **Triggers**: 
  - Form validation
  - API errors
  - User input errors

## Best Practices
1. **Keep messages concise** and actionable
2. **Auto-dismiss** after reasonable time (3s)
3. **Clear previous errors** before showing new ones
4. **Use consistent language** across app
5. **Provide helpful guidance** not just "Error"

## Integration Examples
```javascript
// With forms
class LoginForm {
    validateAndSubmit() {
        if (!this.emailInput.value) {
            this.showError('Please enter your email');
            this.emailInput.focus();
            return;
        }
        // Continue validation...
    }
}

// With async operations
async sendTransaction() {
    try {
        await this.processTransaction();
    } catch (error) {
        if (error.code === 'INSUFFICIENT_FUNDS') {
            this.showError('Insufficient balance for this transaction');
        } else {
            this.showError('Transaction failed. Please try again.');
        }
    }
}
```

## Mobile Considerations
- Touch-friendly minimum height (20px)
- Readable font size (12px minimum)
- Sufficient contrast on all screens
- Positioned above keyboard when visible
- Doesn't block important UI elements

## Improvements Suggestions
1. Add error icons for visual reinforcement
2. Implement error log for debugging
3. Add "retry" action buttons where appropriate
4. Support multiple errors (list format)
5. Add haptic feedback on mobile devices