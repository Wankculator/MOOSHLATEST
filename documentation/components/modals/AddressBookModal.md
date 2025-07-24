# AddressBookModal Component Documentation

## Overview
The AddressBookModal is a planned feature for MOOSH Wallet that will allow users to save, manage, and quickly access frequently used Bitcoin addresses. This documentation outlines the intended design and functionality based on common wallet patterns.

## Component Status
- **Status**: Planned Feature
- **Priority**: Medium
- **Dependencies**: None

## Proposed Visual Design

### ASCII Layout
```
┌─────────────────────────────────────────────────────────┐
│  Address Book                                      [×]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ Add Contact]  [Import]  [Export]  🔍 [Search...]    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 👤 Alice                                          │  │
│  │ ₿  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkf...      │  │
│  │ 📝 Coffee shop owner                   [Edit][X]  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 👤 Bob's Hardware Store                           │  │
│  │ ₿  3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy           │  │
│  │ 📝 Monthly supplier payment            [Edit][X]  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 👤 Exchange Withdrawal                            │  │
│  │ ⚡ sp1qrp0qghu3ccgwpvmcx0xqfkgcqkgqyxv2cw...     │  │
│  │ 📝 Spark Protocol address               [Edit][X]  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Showing 3 of 3 contacts                               │
└─────────────────────────────────────────────────────────┘
```

## Proposed Implementation

### Class Structure
```javascript
class AddressBookModal {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.contacts = [];
        this.searchTerm = '';
        this.sortBy = 'name'; // name, date, type
    }
}
```

### Contact Data Structure
```javascript
{
    id: 'unique-id',
    name: 'Contact Name',
    address: 'bitcoin:address',
    type: 'bitcoin' | 'spark' | 'lightning',
    label: 'Optional description',
    createdAt: timestamp,
    lastUsed: timestamp,
    tags: ['supplier', 'exchange'],
    avatar: '👤' // or custom emoji/color
}
```

## Proposed Features

### Contact Management
1. **Add Contact**
   - Name (required)
   - Address (required, validated)
   - Type auto-detection
   - Optional label/notes
   - Tag assignment

2. **Edit Contact**
   - Update all fields
   - Change avatar/color
   - Add/remove tags

3. **Delete Contact**
   - Confirmation required
   - Batch delete option

### Search and Filter
1. **Search**
   - By name
   - By address (partial)
   - By label/notes
   - By tags

2. **Filter**
   - By address type
   - By tags
   - Recently used
   - Favorites

3. **Sort**
   - Alphabetical
   - Recently used
   - Date added
   - Frequency of use

### Import/Export
1. **Import Formats**
   - CSV file
   - JSON format
   - Other wallet formats

2. **Export Options**
   - Encrypted backup
   - Plain CSV
   - QR codes batch

## Integration Points

### Send Modal Integration
```javascript
// In send modal
showAddressBook() {
    const addressBook = new AddressBookModal(this.app);
    addressBook.show({
        onSelect: (contact) => {
            this.setRecipientAddress(contact.address);
            this.setRecipientName(contact.name);
        }
    });
}
```

### Quick Actions
```javascript
// Quick send to contact
sendToContact(contact) {
    this.app.router.navigate('send', {
        recipient: contact.address,
        label: contact.name
    });
}
```

## Security Considerations

1. **Address Validation**
   - Validate all addresses on entry
   - Check address type matches network
   - Prevent duplicate entries

2. **Data Storage**
   - Encrypted local storage
   - No cloud sync by default
   - Export requires password

3. **Privacy**
   - Optional contact hiding
   - No automatic address reuse warnings
   - Clear data option

## Mobile Design

### Responsive Layout
- Single column on mobile
- Swipe actions (edit/delete)
- Larger touch targets
- Simplified search bar

### Mobile-Specific Features
- Contact photos from device
- Share contact via QR
- Import from device contacts

## Accessibility

1. **Keyboard Navigation**
   - Tab through contacts
   - Enter to select
   - Delete key for removal

2. **Screen Reader Support**
   - Proper ARIA labels
   - Contact count announcements
   - Action confirmations

## State Management

### Local Storage
```javascript
// Proposed storage structure
{
    addressBook: {
        contacts: [...],
        settings: {
            sortBy: 'name',
            showAvatars: true,
            defaultTags: []
        },
        lastUpdated: timestamp
    }
}
```

### State Integration
```javascript
// Add to app state
this.app.state.set('addressBook', contacts);
this.app.state.on('addressBookUpdate', this.refreshContacts);
```

## Planned UI Components

### Contact Card
```javascript
createContactCard(contact) {
    return $.div({ className: 'contact-card' }, [
        $.div({ className: 'contact-avatar' }, [contact.avatar]),
        $.div({ className: 'contact-details' }, [
            $.div({ className: 'contact-name' }, [contact.name]),
            $.div({ className: 'contact-address' }, [
                this.formatAddress(contact.address)
            ]),
            $.div({ className: 'contact-label' }, [contact.label])
        ]),
        $.div({ className: 'contact-actions' }, [
            $.button({ onclick: () => this.editContact(contact) }, ['Edit']),
            $.button({ onclick: () => this.deleteContact(contact) }, ['×'])
        ])
    ]);
}
```

### Add Contact Form
```javascript
createAddContactForm() {
    return $.div({ className: 'add-contact-form' }, [
        $.input({
            type: 'text',
            placeholder: 'Contact Name',
            id: 'contact-name'
        }),
        $.input({
            type: 'text',
            placeholder: 'Bitcoin Address',
            id: 'contact-address'
        }),
        $.textarea({
            placeholder: 'Notes (optional)',
            id: 'contact-notes'
        }),
        $.div({ className: 'form-actions' }, [
            $.button({ onclick: () => this.saveContact() }, ['Save']),
            $.button({ onclick: () => this.cancelAdd() }, ['Cancel'])
        ])
    ]);
}
```

## Future Enhancements

1. **Advanced Features**
   - ENS/Unstoppable Domains support
   - Multi-signature address support
   - Payment request integration
   - Transaction history per contact

2. **Sync Options**
   - Encrypted cloud backup
   - Multi-device sync
   - Import from other wallets

3. **Analytics**
   - Most used contacts
   - Payment patterns
   - Address reuse warnings

## Implementation Priority

### Phase 1 (MVP)
- Basic add/edit/delete
- Simple search
- Address validation

### Phase 2
- Import/export
- Tags and filtering
- Mobile optimization

### Phase 3
- Advanced features
- Sync options
- Analytics

## Testing Considerations

1. **Address Validation**
   - Test all address types
   - Invalid address handling
   - Duplicate prevention

2. **Data Persistence**
   - Save/load cycles
   - Data migration
   - Backup/restore

3. **UI/UX Testing**
   - Contact limits (100+)
   - Search performance
   - Mobile usability