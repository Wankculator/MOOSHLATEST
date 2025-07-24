# Phase 2 Implementation Plan - Enhanced UX Features

## Overview
Based on ACCOUNT_SYSTEM_PRO_SPEC.md, Phase 2 focuses on enhanced user experience features for account management.

## Pro Coding Rules We'll Follow
1. **Single-file architecture** - All code in moosh-wallet.js
2. **No emojis** - Terminal-style UI only
3. **Orange/black theme** - Consistent color scheme (#f57315)
4. **Test everything** - Create test files for each feature
5. **No frameworks** - Vanilla JavaScript only
6. **Mobile-first** - Responsive design
7. **Performance** - Cache where possible, minimize API calls

## Phase 2 Features to Implement

### 1. Account Colors/Icons (Visual Identification)
**Purpose**: Help users quickly identify accounts visually
**Implementation**:
- Add color picker to account creation/edit
- Use colored borders/badges instead of emoji icons
- Store color preference in account metadata
- Default colors: orange variants (#f57315, #ff8c42, #ffb366, #ffd4a3)

### 2. Account Groups/Folders
**Purpose**: Organize accounts by purpose (Personal, Trading, Savings, etc.)
**Implementation**:
- Add `group` field to account object
- Create group management in AccountListModal
- Filter accounts by group
- Collapsible group sections in UI
- Default groups: "Personal", "Trading", "Savings", "Other"

### 3. Bulk Operations
**Purpose**: Perform actions on multiple accounts at once
**Implementation**:
- Add checkbox selection mode
- Bulk export selected accounts
- Bulk delete (with safety confirmation)
- Bulk refresh balances
- Select all/none functionality

### 4. Advanced Import Options
**Purpose**: More ways to import accounts
**Implementation**:
- Import from private key (WIF format)
- Import from xpub (watch-only)
- Import from JSON backup
- Batch import multiple accounts
- Import validation and preview

### 5. Account Templates
**Purpose**: Quick setup for common account types
**Implementation**:
- Pre-configured account settings
- Templates: "HODLing", "Daily Use", "Trading", "Lightning"
- Custom template creation
- Apply template during account creation

### 6. Enhanced Export Formats
**Purpose**: Multiple export options for different use cases
**Implementation**:
- JSON (current)
- CSV for spreadsheets
- PDF with QR codes
- Encrypted backup format
- Selective export (choose what to include)

### 7. Activity Monitoring
**Purpose**: Track account usage and transactions
**Implementation**:
- Last used timestamp
- Transaction count (from API)
- Active/Inactive status
- Activity sparkline chart
- Sort/filter by activity

## Implementation Order

### Week 1: Visual Enhancements
1. Account colors/badges
2. Group management system
3. Update UI to show groups

### Week 2: Bulk Operations
1. Selection mode UI
2. Bulk action toolbar
3. Implement bulk operations

### Week 3: Import/Export
1. Advanced import options
2. Enhanced export formats
3. Template system

### Week 4: Activity & Polish
1. Activity monitoring
2. Performance optimization
3. Comprehensive testing

## Technical Approach

### Data Structure Updates
```javascript
account: {
  id: "acc_xxx",
  name: "My Account",
  // New fields for Phase 2:
  color: "#f57315",      // Visual identification
  group: "Personal",      // Organization
  template: "HODLing",    // Template used
  activity: {
    lastUsed: Date.now(),
    transactionCount: 0,
    isActive: true
  },
  metadata: {
    tags: ["important", "long-term"],
    notes: "Main savings account"
  }
}
```

### State Management
- Extend existing StateManager
- Add group filtering methods
- Implement bulk selection state
- Cache activity data

### UI Components
- ColorPicker component
- GroupSelector component
- BulkActionBar component
- ActivityIndicator component
- TemplateSelector component

## Testing Strategy
1. Create test file for each new component
2. Test bulk operations with edge cases
3. Test import validation thoroughly
4. Performance test with 50+ accounts
5. Mobile testing for all features

## Success Criteria
- All features working without errors
- Performance: <100ms for bulk operations
- Mobile responsive
- 100% test coverage
- No breaking changes to existing features

## Next Steps
1. Start with account colors implementation
2. Create ColorPicker component
3. Update account data structure
4. Add color selection to create/edit flows
5. Test thoroughly before moving to next feature