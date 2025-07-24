# Changelog

All notable changes to MOOSH Wallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-signature wallet support (2-of-3 threshold)
- Real-time balance fetching with fallback APIs
- Import account UI improvements
- Professional project structure

### Fixed
- Spark address generation now produces correct addresses
- Balance display shows real blockchain data
- Import account UI matches terminal theme
- ES module vs CommonJS compatibility issues

### Security
- Server-side only seed generation
- Input validation on all API endpoints
- Constant-time cryptographic operations

## [2.0.0] - 2025-01-14

### Added
- Complete rewrite with pure JavaScript
- Spark Protocol integration
- Multi-account system
- Retro terminal UI theme
- PWA support

### Changed
- Migrated from React to vanilla JavaScript
- New API architecture with Express.js
- Enhanced security measures

### Removed
- Third-party UI frameworks
- Client-side seed generation

## [1.0.0] - 2024-12-01

### Added
- Initial Bitcoin wallet implementation
- Basic seed generation
- Simple transaction signing
- Web interface

[Unreleased]: https://github.com/Wankculator/Moosh/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Wankculator/Moosh/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Wankculator/Moosh/releases/tag/v1.0.0