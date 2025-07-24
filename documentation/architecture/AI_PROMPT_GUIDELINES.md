# AI Prompt Guidelines for MOOSH Wallet Development

This document contains the master prompts and guidelines for using AI assistants (particularly Claude) to develop the MOOSH Wallet project.

## Master Prompt Location

The complete master prompt is stored at: `/MASTER_PROMPT.md`

## Quick Start

1. Copy the entire contents of `MASTER_PROMPT.md`
2. Paste it as your system prompt in Claude
3. Use one of the shortcut commands listed below

## Shortcut Commands

### Development Commands

- **`qnew`** - Create new feature with best practices
- **`qfix`** - Debug and fix issues with security focus
- **`qtest`** - Generate comprehensive test suite
- **`qsec`** - Perform security audit
- **`qscale`** - Optimize for mobile/responsive
- **`qcrypto`** - Apply Bitcoin wallet security measures
- **`qdeploy`** - Prepare cross-platform deployment
- **`qvalidate`** - Run validation checklist
- **`qmulti`** - Implement multi-signature features
- **`qultra`** - Deep analysis with ultrathink
- **`qbranch`** - Plan branch merges
- **`qmoosh`** - MOOSH-specific enhancements
- **`qcheck`** - Run complete validation

### Example Usage

```
qtest Generate comprehensive test suite for sparkCompatibleService.js with >95% coverage
```

## Development Workflow

1. **Analysis** - Use `qcheck` to audit current state
2. **Planning** - Use `qultra` for complex features
3. **Implementation** - Use `qnew` or specific commands
4. **Testing** - Use `qtest` for test generation
5. **Security** - Use `qsec` for security audit
6. **Deployment** - Use `qdeploy` for deployment prep

## Best Practices

1. Always include context about what you're working on
2. Be specific about file paths and desired outcomes
3. Use the shortcut commands for consistency
4. Request diffs when modifying existing files
5. Ask for validation after implementation

## Security-First Development

When using AI assistance, always:
- Validate cryptographic implementations
- Check for exposed private keys
- Verify input sanitization
- Test for timing attacks
- Ensure constant-time operations

## MOOSH-Specific Considerations

1. **Retro Terminal UI** - Preserve the terminal aesthetic
2. **Server-Side Security** - Seed generation must be server-side only
3. **Multi-Account Support** - Consider account switching in all features
4. **Real Blockchain Data** - Use fallback APIs for reliability
5. **Test Coverage** - Maintain >95% test coverage

## Prompt Engineering Tips

1. **Be Explicit** - Clear instructions yield better results
2. **Provide Context** - Explain why something is important
3. **Use Structure** - XML tags help organize complex prompts
4. **Request Validation** - Always ask for checks against standards
5. **Iterate** - Refine prompts based on results

## Common Tasks

### Adding a New API Endpoint
```
qnew Add POST /api/wallet/backup endpoint to api-server.js that exports encrypted wallet data with tests
```

### Fixing a Bug
```
qfix Balance not updating after account switch in Dashboard - investigate state management and API calls
```

### Improving Security
```
qsec Audit walletService.js for timing attacks and suggest constant-time implementations
```

### Mobile Optimization
```
qscale Optimize ImportWallet modal for mobile devices while maintaining terminal theme
```

## Resources

- Full Master Prompt: `/MASTER_PROMPT.md`
- API Documentation: `/docs/API_DOCUMENTATION.md`
- Architecture Guide: `/WALLET_ARCHITECTURE.md`
- Security Policy: `/SECURITY.md`

## Updates

This guide should be updated whenever:
- New shortcuts are added to the master prompt
- Development patterns change
- Security requirements evolve
- New tools or frameworks are adopted