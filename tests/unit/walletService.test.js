/**
 * Unit tests for walletService.js
 * Following TDD principles with >95% coverage target
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as walletService from '../../src/server/services/walletService.js';
import * as bip39 from 'bip39';

describe('WalletService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMnemonic', () => {
    test('should generate 12-word mnemonic with 128-bit entropy', () => {
      const mnemonic = walletService.generateMnemonic(128);
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(12);
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    test('should generate 24-word mnemonic with 256-bit entropy', () => {
      const mnemonic = walletService.generateMnemonic(256);
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(24);
      expect(bip39.validateMnemonic(mnemonic)).toBe(true);
    });

    test('should throw error for invalid entropy', () => {
      expect(() => walletService.generateMnemonic(64)).toThrow();
      expect(() => walletService.generateMnemonic(512)).toThrow();
    });
  });

  describe('generateBitcoinWallet', () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    test('should generate all Bitcoin address types', async () => {
      const wallet = await walletService.generateBitcoinWallet(testMnemonic, 'MAINNET');
      
      expect(wallet.addresses).toHaveProperty('segwit');
      expect(wallet.addresses).toHaveProperty('taproot');
      expect(wallet.addresses).toHaveProperty('legacy');
      expect(wallet.addresses).toHaveProperty('nestedSegwit');
      
      // Validate address formats
      expect(wallet.addresses.segwit.address).toMatch(/^bc1q[a-z0-9]{38,39}$/);
      expect(wallet.addresses.taproot.address).toMatch(/^bc1p[a-z0-9]{58,62}$/);
      expect(wallet.addresses.legacy.address).toMatch(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/);
      expect(wallet.addresses.nestedSegwit.address).toMatch(/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/);
    });

    test('should include private keys for all address types', async () => {
      const wallet = await walletService.generateBitcoinWallet(testMnemonic, 'MAINNET');
      
      Object.values(wallet.addresses).forEach(addr => {
        expect(addr).toHaveProperty('privateKey');
        expect(addr).toHaveProperty('wif');
        expect(addr.privateKey).toMatch(/^[0-9a-f]{64}$/);
      });
    });

    test('should generate testnet addresses when specified', async () => {
      const wallet = await walletService.generateBitcoinWallet(testMnemonic, 'TESTNET');
      
      expect(wallet.addresses.segwit.address).toMatch(/^tb1q[a-z0-9]{38,39}$/);
      expect(wallet.addresses.taproot.address).toMatch(/^tb1p[a-z0-9]{58,62}$/);
    });
  });

  describe('generateSparkAddress', () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

    test('should generate valid Spark address', async () => {
      const sparkWallet = await walletService.generateSparkAddress(testMnemonic);
      
      expect(sparkWallet).toHaveProperty('address');
      expect(sparkWallet).toHaveProperty('privateKey');
      expect(sparkWallet).toHaveProperty('path');
      expect(sparkWallet.address).toMatch(/^sp1[a-z0-9]+$/);
    });

    test('should use correct derivation path', async () => {
      const sparkWallet = await walletService.generateSparkAddress(testMnemonic);
      
      expect(sparkWallet.path).toBe("m/44'/0'/0'/0/0");
    });
  });

  describe('importWallet', () => {
    const validMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const invalidMnemonic = 'invalid mnemonic phrase that should fail validation';

    test('should import wallet with valid mnemonic', async () => {
      const wallet = await walletService.importWallet(validMnemonic, 'MAINNET');
      
      expect(wallet).toHaveProperty('bitcoin');
      expect(wallet).toHaveProperty('spark');
      expect(wallet.bitcoin.addresses).toHaveProperty('segwit');
      expect(wallet.spark).toHaveProperty('address');
    });

    test('should throw error for invalid mnemonic', async () => {
      await expect(
        walletService.importWallet(invalidMnemonic, 'MAINNET')
      ).rejects.toThrow('Invalid mnemonic phrase');
    });

    test('should normalize mnemonic input', async () => {
      const extraSpaces = '  abandon   abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  about  ';
      const wallet = await walletService.importWallet(extraSpaces, 'MAINNET');
      
      expect(wallet).toHaveProperty('bitcoin');
    });
  });

  describe('validateAddress', () => {
    test('should validate Bitcoin mainnet addresses', () => {
      const validAddresses = [
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // SegWit
        'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', // Taproot
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Legacy
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' // Nested SegWit
      ];

      validAddresses.forEach(addr => {
        expect(walletService.validateAddress(addr, 'bitcoin')).toBe(true);
      });
    });

    test('should validate Spark addresses', () => {
      const validSparkAddress = 'sp1pgss95lze9m3eqvls7us6xz7yz5txu6p49h244wxutckly8sdxupf4v3veny2p';
      expect(walletService.validateAddress(validSparkAddress, 'spark')).toBe(true);
    });

    test('should reject invalid addresses', () => {
      const invalidAddresses = [
        'invalid_address',
        '1234567890',
        'bc1qinvalid',
        '',
        null,
        undefined
      ];

      invalidAddresses.forEach(addr => {
        expect(walletService.validateAddress(addr, 'bitcoin')).toBe(false);
      });
    });
  });

  describe('Security Tests', () => {
    test('should use secure random for entropy', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');
      walletService.generateMnemonic(128);
      
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(expect.any(Uint8Array));
    });

    test('should never expose private keys in logs', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const wallet = walletService.generateBitcoinWallet(
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'MAINNET'
      );
      
      // Check that console.log was never called with private key data
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('privateKey')
      );
    });

    test('should sanitize mnemonic input', async () => {
      const maliciousMnemonic = '<script>alert("xss")</script> abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      
      await expect(
        walletService.importWallet(maliciousMnemonic, 'MAINNET')
      ).rejects.toThrow();
    });
  });
});