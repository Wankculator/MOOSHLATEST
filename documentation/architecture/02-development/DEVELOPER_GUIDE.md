# MOOSH Wallet - Developer Guide 🚀

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access wallet
http://localhost:3333
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Bundle modules for production
- `npm run build:watch` - Auto-rebuild on changes

### Testing
- `npm test` - Run all tests
- `npm run test:ui` - Run UI responsive tests only
- `npm run test:simulation` - Run user simulation tests only

### Code Quality
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix code issues
- `npm run validate:all` - Run all quality checks

## Project Structure

```
├── src/
│   └── server/         # Server-side code
├── public/
│   ├── index.html     # Entry point
│   ├── js/
│   │   ├── moosh-wallet.js    # Legacy monolithic file
│   │   └── src/               # Modular components
│   │       ├── app.js         # Main application
│   │       ├── components/    # UI components
│   │       ├── utils/         # Utilities
│   │       ├── services/      # Business logic
│   │       └── core/          # Core systems
│   └── css/           # Stylesheets
├── tests/             # Test suites
├── scripts/           # Build & utility scripts
└── docs/              # Documentation
```

## Development Workflow

1. **Make changes** in `public/js/src/`
2. **Test locally** with `npm run dev`
3. **Run tests** with `npm test`
4. **Check code** with `npm run lint`
5. **Build bundle** with `npm run build`

## Code Standards

### JavaScript
- ES6+ modules
- Single quotes for strings
- 4-space indentation
- Semicolons required
- Max line length: 120 chars

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/your-feature
```

## Adding New Components

1. Create component in `public/js/src/components/`
2. Export from the component file
3. Import in `app.js` or parent component
4. Add to build script if needed

Example:
```javascript
// public/js/src/components/WalletCard.js
import { $ } from '../utils/ElementFactory.js';

export class WalletCard {
    constructor(props) {
        this.props = props;
    }
    
    render() {
        return $.div({ className: 'wallet-card' }, [
            // Component content
        ]);
    }
}
```

## Testing

### Unit Tests
```javascript
// tests/components/Button.test.js
import { Button } from '@/components/Button.js';

describe('Button Component', () => {
    test('renders with correct text', () => {
        const button = new Button({ text: 'Click me' });
        expect(button.props.text).toBe('Click me');
    });
});
```

### Running Tests
```bash
# Run all tests with coverage
npm test -- --coverage

# Run specific test file
npm test Button.test.js

# Run in watch mode
npm test -- --watch
```

## Debugging

1. **Browser DevTools** - Use debugger statements
2. **Console Logging** - Check browser console
3. **Network Tab** - Monitor API calls
4. **Source Maps** - Coming soon with build system

## Performance Tips

1. Use `ResponsiveUtils` for device detection
2. Leverage `EventBus` for state management
3. Minimize DOM operations
4. Use CSS classes over inline styles
5. Lazy load heavy components

## Contributing

1. Follow the code standards
2. Write tests for new features
3. Update documentation
4. Run `npm run validate:all` before committing

## Need Help?

- Check `docs/` for detailed documentation
- Review existing code for patterns
- Open an issue on GitHub

Happy coding! 🚀