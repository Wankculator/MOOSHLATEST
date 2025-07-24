# Accessibility Features

**Status**: 🟡 Beta
**Type**: Enhancement
**Security Critical**: No
**Implementation**: Partial implementation throughout /public/js/moosh-wallet.js

## Overview
Accessibility features ensure MOOSH Wallet is usable by everyone, including users with disabilities. The system implements WCAG 2.1 guidelines, keyboard navigation, screen reader support, and visual accessibility options.

## User Flow
```
[User with Accessibility Needs] → [Enable Features] → [Navigate with Assistive Tech] → [Complete Tasks] → [Equal Access]
```

## Technical Implementation

### Frontend
- **Entry Point**: Accessibility utilities and ARIA attributes
- **UI Components**: 
  - Keyboard navigation system
  - Screen reader announcements
  - Focus indicators
  - Color contrast options
  - Text size controls
- **State Changes**: 
  - Focus management
  - Announcement queue
  - Preference storage

### Backend
- **API Endpoints**: None (client-side only)
- **Services Used**: 
  - Browser accessibility APIs
  - ARIA live regions
  - Focus trap utilities
- **Data Flow**: 
  1. User enables features
  2. DOM updated with ARIA
  3. Keyboard handlers attached
  4. Screen reader announces
  5. Visual aids activated

## Code Example
```javascript
// Accessibility features implementation
class AccessibilityManager {
    constructor(app) {
        this.app = app;
        this.announcer = null;
        this.focusTrap = null;
        this.keyboardNav = true;
        this.highContrast = false;
        this.reducedMotion = false;
        this.fontSize = 'medium';
        
        this.initializeAccessibility();
    }
    
    initializeAccessibility() {
        // Create screen reader announcer
        this.createAnnouncer();
        
        // Set up keyboard navigation
        this.setupKeyboardNavigation();
        
        // Check user preferences
        this.loadUserPreferences();
        
        // Monitor preference changes
        this.watchPreferenceChanges();
        
        // Apply initial settings
        this.applyAccessibilitySettings();
    }
    
    createAnnouncer() {
        // Create live region for screen reader announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('role', 'status');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only'; // Visually hidden
        document.body.appendChild(this.announcer);
    }
    
    announce(message, priority = 'polite') {
        if (!this.announcer) return;
        
        // Clear previous announcement
        this.announcer.textContent = '';
        
        // Set priority
        this.announcer.setAttribute('aria-live', priority);
        
        // Announce after a brief delay (ensures screen readers catch the change)
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 100);
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardNav) return;
            
            switch (e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                    
                case 'Escape':
                    this.handleEscapeKey(e);
                    break;
                    
                case 'Enter':
                case ' ':
                    this.handleActionKey(e);
                    break;
                    
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(e);
                    break;
                    
                case '?':
                    if (e.shiftKey) {
                        this.showKeyboardShortcuts();
                    }
                    break;
            }
        });
    }
    
    handleTabNavigation(e) {
        // Custom tab order for complex components
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Backward tab
            if (currentIndex === 0 && this.focusTrap) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Forward tab
            if (currentIndex === focusableElements.length - 1 && this.focusTrap) {
                e.preventDefault();
                focusableElements[0].focus();
            }
        }
    }
    
    getFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');
        
        const container = this.focusTrap || document;
        return Array.from(container.querySelectorAll(selector));
    }
    
    createFocusTrap(element) {
        this.focusTrap = element;
        
        // Store last focused element
        this.lastFocusedElement = document.activeElement;
        
        // Focus first focusable element
        const focusable = this.getFocusableElements();
        if (focusable.length > 0) {
            focusable[0].focus();
        }
    }
    
    releaseFocusTrap() {
        this.focusTrap = null;
        
        // Restore focus
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    }
    
    makeAccessibleButton(element, options = {}) {
        const { label, description, pressed } = options;
        
        // Ensure button role
        if (!element.hasAttribute('role')) {
            element.setAttribute('role', 'button');
        }
        
        // Add label
        if (label) {
            element.setAttribute('aria-label', label);
        }
        
        // Add description
        if (description) {
            const descId = `desc-${Date.now()}`;
            const descElement = document.createElement('span');
            descElement.id = descId;
            descElement.className = 'sr-only';
            descElement.textContent = description;
            element.appendChild(descElement);
            element.setAttribute('aria-describedby', descId);
        }
        
        // Add pressed state
        if (pressed !== undefined) {
            element.setAttribute('aria-pressed', pressed);
        }
        
        // Make keyboard accessible
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
    }
    
    applyAccessibilitySettings() {
        const body = document.body;
        
        // High contrast mode
        body.classList.toggle('high-contrast', this.highContrast);
        
        // Reduced motion
        body.classList.toggle('reduced-motion', this.reducedMotion);
        
        // Font size
        body.setAttribute('data-font-size', this.fontSize);
        
        // Update CSS variables
        this.updateCSSVariables();
    }
    
    updateCSSVariables() {
        const root = document.documentElement;
        
        if (this.highContrast) {
            root.style.setProperty('--contrast-ratio', '7:1');
            root.style.setProperty('--focus-outline-width', '3px');
        } else {
            root.style.setProperty('--contrast-ratio', '4.5:1');
            root.style.setProperty('--focus-outline-width', '2px');
        }
        
        // Font size multipliers
        const fontSizes = {
            small: 0.875,
            medium: 1,
            large: 1.125,
            xlarge: 1.25
        };
        
        root.style.setProperty('--font-size-multiplier', fontSizes[this.fontSize]);
    }
    
    createAccessibleModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        
        const title = document.createElement('h2');
        title.id = 'modal-title';
        title.textContent = options.title || 'Dialog';
        
        const closeButton = document.createElement('button');
        closeButton.setAttribute('aria-label', 'Close dialog');
        closeButton.textContent = '×';
        closeButton.onclick = () => this.closeModal(modal);
        
        modal.appendChild(title);
        modal.appendChild(content);
        modal.appendChild(closeButton);
        
        // Create focus trap
        this.createFocusTrap(modal);
        
        // Announce to screen readers
        this.announce(`${options.title || 'Dialog'} opened`);
        
        return modal;
    }
    
    createSkipLinks() {
        const skipNav = document.createElement('nav');
        skipNav.className = 'skip-links';
        skipNav.setAttribute('aria-label', 'Skip links');
        
        const links = [
            { href: '#main-content', text: 'Skip to main content' },
            { href: '#navigation', text: 'Skip to navigation' },
            { href: '#wallet-balance', text: 'Skip to wallet balance' }
        ];
        
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            a.className = 'skip-link';
            skipNav.appendChild(a);
        });
        
        document.body.insertBefore(skipNav, document.body.firstChild);
    }
    
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Tab', description: 'Navigate between elements' },
            { key: 'Enter/Space', description: 'Activate buttons' },
            { key: 'Escape', description: 'Close dialogs' },
            { key: 'Arrow keys', description: 'Navigate within components' },
            { key: '?', description: 'Show this help' },
            { key: 'Alt + W', description: 'Go to wallet' },
            { key: 'Alt + S', description: 'Go to settings' }
        ];
        
        const content = document.createElement('div');
        content.innerHTML = `
            <h3>Keyboard Shortcuts</h3>
            <dl>
                ${shortcuts.map(s => `
                    <dt><kbd>${s.key}</kbd></dt>
                    <dd>${s.description}</dd>
                `).join('')}
            </dl>
        `;
        
        const modal = this.createAccessibleModal(content, {
            title: 'Keyboard Shortcuts'
        });
        
        document.body.appendChild(modal);
    }
}

// CSS for accessibility features
const accessibilityStyles = `
/* Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
}

/* Skip links */
.skip-links {
    position: absolute;
    top: -40px;
    left: 0;
    z-index: 9999;
}

.skip-link {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.skip-link:focus {
    position: static;
    width: auto;
    height: auto;
    padding: 0.5rem 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    text-decoration: none;
    outline: 3px solid var(--text-accent);
}

/* Focus indicators */
*:focus {
    outline: var(--focus-outline-width) solid var(--text-accent);
    outline-offset: 2px;
}

/* High contrast mode */
body.high-contrast {
    filter: contrast(1.5);
}

body.high-contrast * {
    border-width: 2px !important;
}

/* Reduced motion */
body.reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

/* Font sizing */
body[data-font-size="small"] {
    font-size: calc(14px * 0.875);
}

body[data-font-size="large"] {
    font-size: calc(14px * 1.125);
}

body[data-font-size="xlarge"] {
    font-size: calc(14px * 1.25);
}

/* Keyboard navigation indicators */
.keyboard-navigating *:focus {
    outline: 3px solid var(--text-accent);
    outline-offset: 3px;
}
`;
```

## Configuration
- **Settings**: 
  - Keyboard navigation: enabled
  - High contrast: optional
  - Reduced motion: auto-detect
  - Font sizes: 4 levels
  - Screen reader: always on
- **Defaults**: 
  - WCAG 2.1 AA compliance
  - Focus visible always
  - Semantic HTML
  - ARIA labels included
- **Limits**: 
  - Font size: 0.875x to 1.25x
  - Contrast: 4.5:1 minimum
  - Focus outline: 2-3px

## Security Considerations
- No security implications
- User preferences private
- No data collection
- Settings stored locally

## Performance Impact
- **Load Time**: Minimal overhead
- **Memory**: Small DOM additions
- **Network**: None

## Mobile Considerations
- Touch targets 48x48px minimum
- Voice control support
- Screen reader compatible
- Zoom up to 200%
- Orientation independent

## Error Handling
- **Common Errors**: 
  - Screen reader conflicts
  - Focus trap issues
  - Keyboard event conflicts
  - ARIA attribute errors
- **Recovery**: 
  - Fallback to defaults
  - Clear error messages
  - Alternative navigation
  - Help documentation

## Testing
```bash
# Test accessibility features
1. Keyboard navigation:
   - Tab through all elements
   - Use arrow keys in lists
   - Escape closes modals
   - Enter activates buttons
   
2. Screen reader testing:
   - Enable NVDA/JAWS/VoiceOver
   - Navigate all pages
   - Verify announcements
   - Check form labels
   
3. Visual accessibility:
   - Toggle high contrast
   - Change font sizes
   - Check color contrast
   - Test with color filters
   
4. Motion sensitivity:
   - Enable reduced motion
   - Verify animations stop
   - Check transitions
```

## Future Enhancements
- **Advanced Features**:
  - Voice commands
  - Eye tracking support
  - Switch control
  - Braille display support
  - Haptic feedback
- **Customization**:
  - Custom color themes
  - Adjustable animations
  - Sound cues
  - Visual indicators
  - Gesture controls
- **Standards**:
  - WCAG 3.0 compliance
  - ARIA 1.3 features
  - AOM integration
  - Multi-language support
  - RTL layout support