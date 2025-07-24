# Contributing to MOOSH Wallet

Thank you for your interest in contributing to MOOSH Wallet! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Wankculator/Moosh/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing [Issues](https://github.com/Wankculator/Moosh/issues) for similar suggestions
2. Create a new issue with the `enhancement` label
3. Provide detailed use case and implementation ideas

### Code Contributions

#### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/Wankculator/Moosh.git
cd Moosh

# Install dependencies
npm install

# Start development servers
npm run dev:api  # API server on port 3001
npm run dev:ui   # UI server on port 8080
```

#### Development Workflow

1. Fork the repository
2. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Follow our coding standards:
   - Use TypeScript for new code
   - Follow existing code style
   - Write tests (aim for >95% coverage)
   - Update documentation

4. Commit your changes:
   ```bash
   git commit -m "feat: add new feature"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/)

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request

#### Coding Standards

- **Security First**: All cryptographic operations must use approved libraries
- **Test Coverage**: Maintain >95% test coverage
- **Documentation**: Update relevant docs for any API changes
- **Accessibility**: Ensure WCAG 2.2 AA compliance
- **Performance**: Profile code for performance impacts

#### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/walletService.test.js
```

#### Code Review Process

1. All PRs require at least one review
2. CI must pass (tests, linting, security scan)
3. No decrease in test coverage
4. Follow security guidelines for crypto code

### Security Vulnerabilities

For security vulnerabilities, please email security@mooshwallet.com instead of using public issues. See [SECURITY.md](SECURITY.md) for details.

## Branch Structure

- `master` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## Release Process

We use semantic versioning (MAJOR.MINOR.PATCH). Releases are automated through CI/CD when tags are pushed.

## Questions?

Feel free to ask questions in our [Discussions](https://github.com/Wankculator/Moosh/discussions) section.

Thank you for contributing to MOOSH Wallet! 🚀