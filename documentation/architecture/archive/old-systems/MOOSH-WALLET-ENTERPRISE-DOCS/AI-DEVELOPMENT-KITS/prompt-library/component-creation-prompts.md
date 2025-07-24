# Component Creation Prompts Library

## 🎯 Purpose
This library contains battle-tested prompts for AI-assisted component creation in MOOSH Wallet. Each prompt is designed to prevent hallucinations and ensure consistent, high-quality code generation.

## 📋 Pre-Flight Checklist Prompt

```markdown
Before creating any component, ensure you have:
1. Loaded the Component base class documentation
2. Reviewed ElementFactory usage patterns
3. Checked StateManager integration requirements
4. Understood the Router navigation flow
5. Reviewed the style guide and design system

Confirm each item before proceeding.
```

## 🏗️ Basic Component Creation

### Prompt Template
```markdown
Create a new component called [ComponentName] that extends the Component base class.

Requirements:
- Must extend Component class properly with super(app) in constructor
- Must implement render() method that returns an HTMLElement
- Must use ElementFactory (available as $) for all DOM creation
- Must follow the terminal-style UI design
- Must handle cleanup in destroy() method if needed

The component should [describe functionality].

Style requirements:
- Use CSS variables for all colors (--text-primary, --bg-primary, etc.)
- Follow mobile-first responsive design
- Use monospace font family

State integration:
- Listen to these state keys: [list state keys]
- Update these state values: [list state updates]

CRITICAL: 
- NO React patterns (no setState, no JSX)
- NO innerHTML usage
- NO modern ES6+ features not in the codebase
- MUST use the exact patterns from existing components
```

### Example Usage
```markdown
Create a new component called WalletBalanceCard that extends the Component base class.

Requirements:
- Must extend Component class properly with super(app) in constructor
- Must implement render() method that returns an HTMLElement
- Must use ElementFactory (available as $) for all DOM creation
- Must follow the terminal-style UI design
- Must handle cleanup in destroy() method if needed

The component should display the current wallet balance with BTC and USD values, updating in real-time.

Style requirements:
- Use CSS variables for all colors (--text-primary, --bg-primary, etc.)
- Follow mobile-first responsive design
- Use monospace font family

State integration:
- Listen to these state keys: ['currentAccount', 'bitcoinPrice']
- Update these state values: none

CRITICAL: 
- NO React patterns (no setState, no JSX)
- NO innerHTML usage
- NO modern ES6+ features not in the codebase
- MUST use the exact patterns from existing components
```

## 🎨 Modal Component Creation

### Prompt Template
```markdown
Create a modal component called [ModalName] that follows the MOOSH Wallet modal pattern.

Base requirements:
- Extend Component class
- Create overlay with dark background
- Center modal container
- Include close button (X) in top-right
- Handle ESC key to close
- Handle click outside to close

Modal should contain:
[describe modal content]

Terminal styling:
- Border: 1px solid var(--primary-color)
- Background: var(--bg-primary)
- No border-radius (terminal style)
- Modal width: 90% max-width: [specify]px

State handling:
- Clean up all listeners in destroy()
- Remove from DOM completely when closed

Reference the existing modal pattern from MultiAccountModal or TransactionHistoryModal.
```

## 📄 Page Component Creation

### Prompt Template
```markdown
Create a page component called [PageName]Page for route #[route-name].

Page requirements:
- Extend Component class
- Include terminal-style header
- Implement responsive layout
- Handle back navigation if needed

Page functionality:
[describe what the page does]

Router integration:
- Page will be instantiated by Router
- Must mount correctly to parent container
- Must clean up in destroy()

Layout structure:
- Terminal box container
- Header with title
- Content area with [describe sections]
- Action buttons if needed

State requirements:
- Check for required state before rendering
- Navigate away if prerequisites not met
- Listen to relevant state changes

Follow the pattern from existing pages like GenerateSeedPage or DashboardPage.
```

## 🔧 Utility Component Creation

### Prompt Template
```markdown
Create a utility component called [UtilityName] that provides [functionality].

This should be a small, reusable component that:
- Extends Component base class
- Has a single, clear purpose
- Can be used in multiple places
- Handles its own state subscriptions

Functionality:
[detailed description]

API:
- Constructor parameters: [list any additional params beyond app]
- Public methods: [list if any]
- Events emitted: [list if any]

Example usage:
```javascript
const utility = new [UtilityName](this.app);
utility.mount(container);
```

Keep it simple and focused. Reference components like WalletSelector for patterns.
```

## ⚡ Performance-Optimized Component

### Prompt Template
```markdown
Create a performance-optimized component called [ComponentName] that handles [large data set/frequent updates].

Performance requirements:
- Minimize DOM manipulations
- Use event delegation for repeated elements
- Implement virtual scrolling if list > 100 items
- Debounce rapid state updates
- Clean up all timers/intervals

Component should:
[describe functionality]

Optimization strategies:
- Update only changed DOM elements (no full re-renders)
- Use requestAnimationFrame for animations
- Batch state updates if multiple
- Lazy load images if present

Memory management:
- Clear all references in destroy()
- Remove all event listeners
- Cancel any pending operations

Reference the ordinals gallery optimization for patterns.
```

## 🔐 Secure Input Component

### Prompt Template
```markdown
Create a secure input component called [ComponentName] for handling [sensitive data type].

Security requirements:
- NO storage of sensitive data in component state
- Clear input values on unmount
- Use type="password" for sensitive fields
- No console.log of values
- Validate input before processing

Component features:
[describe the input component]

Validation:
- [list validation rules]
- Show inline error messages
- Prevent invalid submissions

Styling:
- Follow terminal input style
- Show focus state clearly
- Error state with red border

Reference ImportSeedPage for secure input patterns.
```

## 🎯 Best Practices Reminder

### Always Include This
```markdown
CRITICAL REMINDERS:
1. The codebase is vanilla JavaScript - no frameworks
2. Use ElementFactory ($) for ALL DOM creation
3. Follow existing patterns exactly - don't modernize
4. Test destroy() method thoroughly
5. Use CSS variables for all styling
6. Handle loading and error states
7. Make it responsive (mobile-first)
8. Follow terminal aesthetic strictly

DO NOT:
- Use React patterns or JSX
- Use innerHTML
- Add external dependencies
- Use modern syntax not in codebase
- Create global variables
- Forget cleanup in destroy()
```

## 📝 Testing Prompt

### After Component Creation
```markdown
Now create a test plan for [ComponentName] that verifies:

1. Component renders without errors
2. All DOM elements are created correctly
3. State subscriptions work properly
4. User interactions trigger correct behavior
5. Component cleans up properly on destroy()
6. No memory leaks occur
7. Works on mobile viewports

Write specific test cases for each verification.
```

## 🔄 Refactoring Prompt

### For Existing Components
```markdown
Refactor [ComponentName] to improve [performance/readability/maintainability].

Current issues:
- [list specific problems]

Requirements:
- Maintain exact same functionality
- Keep same public API
- Improve [specific aspect]
- Add comments explaining changes

Constraints:
- Cannot change method signatures
- Must remain backward compatible
- Follow existing code style
- Test thoroughly after changes

Document what was changed and why.
```

---

## Usage Guidelines

1. **Always start with the pre-flight checklist**
2. **Choose the most specific prompt template**
3. **Fill in all bracketed placeholders**
4. **Include the best practices reminder**
5. **Follow up with testing prompt**

These prompts have been tested to produce consistent, high-quality components that follow MOOSH Wallet patterns exactly.