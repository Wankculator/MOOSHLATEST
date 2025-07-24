/**
 * Global test setup for Vitest
 * Configures test environment and global mocks
 */

import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import crypto from 'crypto';

// Polyfill for Web Crypto API in Node.js environment
if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SESSION_SECRET = 'test-secret-key';

// Global test hooks
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

afterEach(() => {
  // Clear all mocks after each test
  if (global.fetch) {
    global.fetch.mockClear?.();
  }
});

// Mock fetch for tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);