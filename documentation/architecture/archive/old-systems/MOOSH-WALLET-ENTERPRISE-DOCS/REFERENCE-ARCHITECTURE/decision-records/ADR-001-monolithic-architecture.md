# ADR-001: Monolithic Single-File Architecture

## Status
**Accepted** - Implemented in v2.0.0

## Context
When building a cryptocurrency wallet, we needed to decide on the application architecture. The options were:
1. Modern modular architecture with build tools (Webpack, Rollup, etc.)
2. Microservices/microfrontend architecture
3. Traditional multi-file structure
4. Monolithic single-file architecture

## Decision
We chose to implement a **monolithic single-file architecture** where the entire frontend application exists in a single `moosh-wallet.js` file containing 24,951+ lines of code.

## Rationale

### Advantages
1. **Zero Build Complexity**
   - No webpack configuration
   - No babel transpilation
   - No module bundling
   - No build pipeline maintenance

2. **Instant Deployment**
   - Copy one file = deployed
   - No build artifacts
   - No deployment scripts
   - Works on any web server

3. **Complete Transparency**
   - All code visible in one place
   - Easy to audit
   - No hidden dependencies
   - No black box modules

4. **Debugging Simplicity**
   - Single file in debugger
   - Complete stack traces
   - No source map complexity
   - No module boundaries to cross

5. **Performance Benefits**
   - Single HTTP request
   - No module loading overhead
   - No dynamic imports
   - Predictable loading time

6. **Security Benefits**
   - No supply chain attacks via npm
   - No dependency vulnerabilities
   - Complete code control
   - Easier security audits

### Disadvantages
1. **Collaboration Challenges**
   - Merge conflicts likely
   - No parallel development
   - Single point of failure

2. **Scalability Limits**
   - File size growing
   - Parse time increasing
   - Memory footprint larger

3. **No Code Splitting**
   - Everything loads upfront
   - No lazy loading
   - No tree shaking

4. **Development Experience**
   - Large file navigation
   - No IDE optimizations
   - Limited tooling support

## Consequences

### Positive
- **Achieved zero dependencies** - Most secure approach
- **Simplified deployment** - Copy and run anywhere
- **Complete control** - Every line of code is ours
- **Fast initial development** - No tooling setup

### Negative
- **Growing file size** - Currently 800KB+ uncompressed
- **Team scaling issues** - Hard for multiple developers
- **No modern features** - Limited to vanilla JavaScript
- **Performance ceiling** - Will hit limits eventually

## Mitigation Strategies

1. **For File Size**
   - Implement compression (gzip/brotli)
   - Consider splitting at 1MB threshold
   - Remove dead code regularly

2. **For Collaboration**
   - Clear component boundaries
   - Comprehensive documentation
   - Strict coding conventions
   - Feature flags for parallel work

3. **For Performance**
   - Optimize critical render path
   - Implement virtual scrolling
   - Use Web Workers for heavy ops

## Alternatives Considered

### 1. Modern Build System
```javascript
// What we avoided:
import { Component } from './base/Component.js';
import { StateManager } from './services/StateManager.js';
import { createWallet } from '@bitcoin/wallet';
```
**Rejected because**: Introduces complexity and dependencies

### 2. Multiple Script Tags
```html
<!-- What we avoided: -->
<script src="js/utils.js"></script>
<script src="js/components.js"></script>
<script src="js/pages.js"></script>
<script src="js/app.js"></script>
```
**Rejected because**: Multiple requests, load order issues

### 3. Dynamic Module Loading
```javascript
// What we avoided:
const DashboardPage = await import('./pages/DashboardPage.js');
```
**Rejected because**: Complexity without clear benefits

## Review Date
Next review: When file size exceeds 1MB or parse time exceeds 200ms

## Decision Makers
- Lead Developer
- Security Architect
- Performance Engineer

## References
- [The Cost of JavaScript in 2023](https://timkadlec.com/remembers/2023-02-13-the-cost-of-javascript/)
- [In Defense of Monoliths](https://martinfowler.com/bliki/MonolithFirst.html)
- [Zero Dependencies Manifesto](https://github.com/sindresorhus/awesome-nodejs#zero-dependencies)

---

## Appendix: Metrics

### Current Statistics
- File size: 812KB (uncompressed)
- Parse time: ~100ms (modern devices)
- Load time: ~200ms (3G network)
- Memory usage: ~50MB baseline

### Thresholds for Reconsideration
- File size > 1MB
- Parse time > 200ms
- Memory usage > 100MB
- Team size > 5 developers