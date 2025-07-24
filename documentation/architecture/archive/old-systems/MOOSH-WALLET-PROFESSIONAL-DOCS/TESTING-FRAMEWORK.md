# 🧪 MOOSH Wallet - Comprehensive Testing Framework
## Professional Testing Strategy for Cryptocurrency Wallet

### 📋 Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Security Testing](#security-testing)
7. [Performance Testing](#performance-testing)
8. [Test Data Management](#test-data-management)
9. [Continuous Integration](#continuous-integration)
10. [Test Coverage Requirements](#test-coverage-requirements)

---

## 🎯 Testing Philosophy

### Core Principles
1. **Test First** - Write tests before implementation
2. **100% Critical Path Coverage** - All wallet operations must be tested
3. **Security Focus** - Every test considers security implications
4. **Real-World Scenarios** - Test actual user workflows
5. **Fast Feedback** - Tests must run quickly

### Test Pyramid
```
        ╱─────╲
       ╱  E2E  ╲      10% - Critical user journeys
      ╱─────────╲
     ╱Integration╲    20% - API & service tests  
    ╱─────────────╲
   ╱  Unit Tests   ╲  70% - Component & function tests
  ╱─────────────────╲
```

---

## 🛠️ Test Environment Setup

### 1. Install Testing Dependencies
```bash
# Core testing framework
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8

# Testing utilities
npm install --save-dev @testing-library/dom @testing-library/user-event
npm install --save-dev jsdom happy-dom

# Mocking and assertions
npm install --save-dev msw sinon chai

# Security testing
npm install --save-dev node-security-test

# Performance testing
npm install --save-dev artillery lighthouse
```

### 2. Test Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js'
      ],
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95
    },
    testTimeout: 30000
  }
});
```

### 3. Test Setup File
```javascript
// tests/setup.js
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with DOM matchers
expect.extend(matchers);

// Mock crypto for consistent tests
global.crypto = {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }
};

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
```

---

## 🔬 Unit Testing

### Wallet Service Tests
```javascript
// tests/unit/walletService.test.js
import { describe, test, expect, beforeEach } from 'vitest';
import { WalletService } from '../../src/server/services/walletService.js';
import * as bip39 from 'bip39';

describe('WalletService', () => {
  let walletService;

  beforeEach(() => {
    walletService = new WalletService();
  });

  describe('generateMnemonic', () => {
    test('generates 24-word mnemonic with 256-bit entropy', () => {
      const mnemonic = walletService.generateMnemonic(256);
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(24);
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    test('generates 12-word mnemonic with 128-bit entropy', () => {
      const mnemonic = walletService.generateMnemonic(128);
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(12);
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    test('throws error for invalid entropy', () => {
      expect(() => walletService.generateMnemonic(64)).toThrow();
      expect(() => walletService.generateMnemonic(512)).toThrow();
    });
  });

  describe('generateBitcoinWallet', () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    test('generates correct SegWit address', async () => {
      const wallet = await walletService.generateBitcoinWallet(testMnemonic);
      
      expect(wallet.addresses.segwit.address).toBe('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
      expect(wallet.addresses.segwit.path).toBe("m/84'/0'/0'/0/0");
    });

    test('generates correct Taproot address', async () => {
      const wallet = await walletService.generateBitcoinWallet(testMnemonic);
      
      expect(wallet.addresses.taproot.address).toMatch(/^bc1p/);
      expect(wallet.addresses.taproot.path).toBe("m/86'/0'/0'/0/0");
    });

    test('generates valid WIF private keys', async () => {
      const wallet = await walletService.generateBitcoinWallet(testMnemonic);
      
      expect(wallet.addresses.segwit.wif).toMatch(/^[KL][1-9A-HJ-NP-Za-km-z]{51}$/);
      expect(wallet.addresses.legacy.wif).toMatch(/^[KL][1-9A-HJ-NP-Za-km-z]{51}$/);
    });
  });

  describe('validateAddress', () => {
    test('validates Bitcoin addresses correctly', () => {
      // Valid addresses
      expect(walletService.validateAddress('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu')).toBe(true);
      expect(walletService.validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
      expect(walletService.validateAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true);
      
      // Invalid addresses
      expect(walletService.validateAddress('invalid_address')).toBe(false);
      expect(walletService.validateAddress('bc1qinvalid')).toBe(false);
      expect(walletService.validateAddress('')).toBe(false);
    });
  });
});
```

### Frontend Component Tests
```javascript
// tests/unit/components/WalletCard.test.js
import { describe, test, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { WalletCard } from '../../public/js/components/WalletCard.js';

describe('WalletCard Component', () => {
  test('displays wallet address correctly', () => {
    const wallet = new WalletCard({
      address: 'bc1qtest123',
      balance: '1.5',
      type: 'segwit'
    });

    document.body.innerHTML = wallet.render();
    
    expect(screen.getByText('bc1qtest123')).toBeInTheDocument();
    expect(screen.getByText('1.5 BTC')).toBeInTheDocument();
  });

  test('copy button copies address to clipboard', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue()
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const wallet = new WalletCard({
      address: 'bc1qtest123'
    });

    document.body.innerHTML = wallet.render();
    const copyButton = screen.getByText('Copy');
    
    fireEvent.click(copyButton);
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('bc1qtest123');
  });

  test('hides balance when toggled', () => {
    const wallet = new WalletCard({
      balance: '1.5'
    });

    document.body.innerHTML = wallet.render();
    const toggleButton = screen.getByTestId('balance-toggle');
    
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('*****')).toBeInTheDocument();
    expect(screen.queryByText('1.5 BTC')).not.toBeInTheDocument();
  });
});
```

---

## 🔗 Integration Testing

### API Integration Tests
```javascript
// tests/integration/api.test.js
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api-server.js';

describe('API Integration Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Random port
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /api/spark/generate-wallet', () => {
    test('generates wallet with valid structure', async () => {
      const response = await request(server)
        .post('/api/spark/generate-wallet')
        .send({ strength: 256 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        mnemonic: expect.stringMatching(/^(\w+\s){23}\w+$/),
        addresses: {
          bitcoin: expect.stringMatching(/^bc1q/),
          spark: expect.stringMatching(/^sp1p/)
        },
        privateKeys: expect.any(Object),
        wordCount: 24
      });
    });

    test('handles invalid strength parameter', async () => {
      const response = await request(server)
        .post('/api/spark/generate-wallet')
        .send({ strength: 64 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid strength');
    });
  });

  describe('POST /api/spark/import', () => {
    test('imports valid mnemonic successfully', async () => {
      const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      
      const response = await request(server)
        .post('/api/spark/import')
        .send({ mnemonic: testMnemonic });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.addresses.bitcoin).toBe('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
    });

    test('rejects invalid mnemonic', async () => {
      const response = await request(server)
        .post('/api/spark/import')
        .send({ mnemonic: 'invalid mnemonic phrase' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid mnemonic');
    });
  });

  describe('GET /api/balance/:address', () => {
    test('returns balance for valid address', async () => {
      const response = await request(server)
        .get('/api/balance/bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        address: expect.any(String),
        balance: expect.any(String),
        unconfirmed: expect.any(String)
      });
    });
  });
});
```

### Service Integration Tests
```javascript
// tests/integration/services.test.js
describe('Service Integration', () => {
  test('wallet generation flow', async () => {
    // Generate wallet
    const wallet = await walletService.generateWallet();
    
    // Derive addresses
    const addresses = await addressService.deriveAddresses(wallet.seed);
    
    // Check balance
    const balance = await networkService.getBalance(addresses.bitcoin);
    
    expect(wallet).toBeDefined();
    expect(addresses).toHaveProperty('bitcoin');
    expect(balance).toBeDefined();
  });
});
```

---

## 🎭 End-to-End Testing

### User Journey Tests
```javascript
// tests/e2e/wallet-creation.test.js
import { test, expect } from '@playwright/test';

test.describe('Wallet Creation Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3333');
  });

  test('creates new wallet successfully', async ({ page }) => {
    // Click create wallet
    await page.click('text=Create New Wallet');
    
    // Select 24 words
    await page.click('text=24 Words');
    
    // Click generate
    await page.click('button:has-text("Generate Wallet")');
    
    // Wait for seed phrase
    await page.waitForSelector('.seed-phrase', { timeout: 60000 });
    
    // Verify seed phrase is displayed
    const seedPhrase = await page.textContent('.seed-phrase');
    expect(seedPhrase.split(' ')).toHaveLength(24);
    
    // Verify addresses are shown
    await expect(page.locator('.bitcoin-address')).toBeVisible();
    await expect(page.locator('.spark-address')).toBeVisible();
    
    // Copy seed phrase
    await page.click('button:has-text("Copy Seed")');
    
    // Verify copied
    await expect(page.locator('.notification')).toHaveText('Seed phrase copied!');
  });

  test('imports existing wallet', async ({ page }) => {
    const testSeed = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    // Navigate to import
    await page.click('text=Import Wallet');
    
    // Enter seed phrase
    await page.fill('textarea[placeholder*="seed phrase"]', testSeed);
    
    // Click import
    await page.click('button:has-text("Import")');
    
    // Verify correct address is shown
    await expect(page.locator('.bitcoin-address')).toHaveText('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
  });
});
```

### Critical Path Tests
```javascript
// tests/e2e/critical-paths.test.js
test.describe('Critical Security Paths', () => {
  test('never sends private keys to server', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        postData: request.postData()
      });
    });

    // Create wallet
    await page.goto('http://localhost:3333');
    await page.click('text=Create New Wallet');
    await page.click('button:has-text("Generate Wallet")');
    
    // Wait for completion
    await page.waitForSelector('.seed-phrase');
    
    // Verify no private data sent
    for (const req of requests) {
      if (req.postData) {
        expect(req.postData).not.toContain('privateKey');
        expect(req.postData).not.toContain('seed');
        expect(req.postData).not.toContain('mnemonic');
      }
    }
  });
});
```

---

## 🔒 Security Testing

### Vulnerability Tests
```javascript
// tests/security/vulnerabilities.test.js
describe('Security Vulnerability Tests', () => {
  test('prevents XSS attacks', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = securityService.sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('prevents SQL injection', () => {
    const maliciousInput = "'; DROP TABLE wallets; --";
    const sanitized = securityService.sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('DROP TABLE');
    expect(sanitized).not.toContain("'");
  });

  test('validates all API inputs', async () => {
    const invalidInputs = [
      { mnemonic: '<script>alert(1)</script>' },
      { mnemonic: "'; DROP TABLE; --" },
      { mnemonic: null },
      { mnemonic: {} },
      { mnemonic: [] }
    ];

    for (const input of invalidInputs) {
      const response = await request(app)
        .post('/api/spark/import')
        .send(input);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    }
  });
});
```

### Cryptographic Tests
```javascript
// tests/security/crypto.test.js
describe('Cryptographic Security', () => {
  test('uses sufficient entropy', () => {
    const entropy1 = walletService.generateEntropy();
    const entropy2 = walletService.generateEntropy();
    
    expect(entropy1).not.toBe(entropy2);
    expect(entropy1.length).toBe(32); // 256 bits
  });

  test('generates unique addresses', () => {
    const addresses = new Set();
    
    for (let i = 0; i < 1000; i++) {
      const wallet = walletService.generateWallet();
      addresses.add(wallet.addresses.bitcoin);
    }
    
    expect(addresses.size).toBe(1000);
  });
});
```

---

## ⚡ Performance Testing

### Load Tests
```yaml
# tests/performance/load-test.yml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Generate Wallet"
    flow:
      - post:
          url: "/api/spark/generate-wallet"
          json:
            strength: 256
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: data.mnemonic
```

### Performance Benchmarks
```javascript
// tests/performance/benchmarks.test.js
import { bench, describe } from 'vitest';

describe('Performance Benchmarks', () => {
  bench('mnemonic generation', () => {
    walletService.generateMnemonic(256);
  });

  bench('address derivation', () => {
    walletService.deriveAddress(testSeed, "m/84'/0'/0'/0/0");
  });

  bench('balance API call', async () => {
    await networkService.getBalance('bc1qtest...');
  });
});
```

---

## 📊 Test Data Management

### Test Fixtures
```javascript
// tests/fixtures/wallets.js
export const testWallets = {
  valid: {
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    addresses: {
      segwit: 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu',
      legacy: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
    }
  },
  invalid: {
    mnemonic: 'invalid seed phrase',
    shortMnemonic: 'abandon abandon',
    corruptedMnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'
  }
};
```

### Mock Data
```javascript
// tests/mocks/blockchain.js
export const mockBlockchainResponses = {
  balance: {
    address: 'bc1qtest...',
    balance: '1.23456789',
    unconfirmed: '0.00000000'
  },
  transactions: [
    {
      txid: 'abc123...',
      amount: '0.1',
      confirmations: 6
    }
  ]
};
```

---

## 🔄 Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run security tests
        run: npm run test:security
        
      - name: Generate coverage report
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 📈 Test Coverage Requirements

### Minimum Coverage Thresholds
```json
{
  "statements": 95,
  "branches": 90,
  "functions": 95,
  "lines": 95
}
```

### Critical Path 100% Coverage Required
- Wallet generation
- Address derivation
- Private key handling
- Transaction signing
- API endpoints
- Security functions

### Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# View coverage
npm run coverage:view
```

---

## 📋 Testing Checklist

### Before Each Release
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Security tests completed
- [ ] Performance benchmarks met
- [ ] E2E tests successful
- [ ] Coverage thresholds met
- [ ] No console errors in tests
- [ ] Test data cleaned up

---

**This testing framework ensures MOOSH Wallet maintains the highest quality and security standards through comprehensive automated testing.**