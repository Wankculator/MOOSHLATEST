# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to security@mooshwallet.com.

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the issue
- Location of affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Preferred Languages

We prefer all communications to be in English.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions

## Security Best Practices for Contributors

When contributing code, please follow these security guidelines:

### Cryptographic Operations
- Use `crypto.getRandomValues()` for entropy
- Implement constant-time operations for sensitive comparisons
- Never log private keys or seed phrases
- Use established libraries (Web Crypto API, @buildonspark/spark-sdk)

### Input Validation
- Sanitize all user inputs
- Validate Bitcoin addresses using proper regex
- Implement rate limiting on API endpoints
- Use parameterized queries (if database is added)

### Storage
- Encrypt sensitive data with AES-256-GCM
- Use secure key derivation (PBKDF2, Argon2)
- Never store unencrypted private keys
- Clear sensitive data from memory after use

### Network
- Always use HTTPS in production
- Implement CORS properly
- Add CSP headers
- Use secure WebSocket connections

### Dependencies
- Regularly update dependencies
- Use `npm audit` to check for vulnerabilities
- Pin dependency versions in production
- Review new dependencies for security

## Bug Bounty Program

We're planning to launch a bug bounty program. Details will be announced on our website.

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.