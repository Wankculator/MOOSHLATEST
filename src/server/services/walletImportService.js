/**
 * Wallet Import Service
 * Handles secure import of encrypted wallet data
 * Part of OPERATION THUNDERSTRIKE - BRAVO Division
 */

import crypto from 'crypto';
import { promisify } from 'util';
import * as bip39 from 'bip39';

// Promisify crypto functions
const scrypt = promisify(crypto.scrypt);

export class WalletImportService {
    constructor() {
        // Supported import formats
        this.SUPPORTED_FORMATS = ['json', 'qr', 'paper'];
        
        // Supported encryption versions
        this.SUPPORTED_VERSIONS = ['1.0'];
        
        // Decryption parameters
        this.KEY_LENGTH = 32; // 256 bits
    }

    /**
     * Import wallet from encrypted data
     * @param {Object|string} encryptedData - Encrypted wallet data
     * @param {string} password - Decryption password
     * @returns {Object} Decrypted wallet data
     */
    async importWallet(encryptedData, password) {
        try {
            // Validate inputs
            if (!encryptedData) {
                throw new Error('No encrypted data provided');
            }
            
            if (!password || password.length < 12) {
                throw new Error('Invalid password');
            }

            // Parse encrypted data if it's a string
            const encryptedBundle = typeof encryptedData === 'string' 
                ? JSON.parse(encryptedData) 
                : encryptedData;

            // Validate encrypted bundle structure
            this.validateEncryptedBundle(encryptedBundle);

            // Decrypt the wallet data
            const decryptedData = await this.decryptWalletData(encryptedBundle, password);

            // Validate decrypted wallet data
            const walletData = await this.validateImportData(decryptedData);

            // Check for duplicates
            const duplicateCheck = await this.checkForDuplicates(walletData);
            
            return {
                success: true,
                data: walletData,
                metadata: {
                    importedAt: new Date().toISOString(),
                    isDuplicate: duplicateCheck.isDuplicate,
                    duplicateInfo: duplicateCheck.info
                }
            };

        } catch (error) {
            console.error('Import wallet error:', error);
            throw error;
        }
    }

    /**
     * Import multiple wallets from a batch export
     * @param {Object} batchData - Encrypted batch data
     * @param {string} password - Decryption password
     * @param {Function} progressCallback - Progress callback
     * @returns {Object} Import results
     */
    async importBatch(batchData, password, progressCallback) {
        try {
            // First decrypt the batch bundle
            const decryptedBundle = await this.decryptWalletData(batchData.bundle, password);
            const batchInfo = JSON.parse(decryptedBundle);

            if (!batchInfo.wallets || !Array.isArray(batchInfo.wallets)) {
                throw new Error('Invalid batch format');
            }

            const results = [];
            const errors = [];

            // Import each wallet
            for (let i = 0; i < batchInfo.wallets.length; i++) {
                try {
                    const walletBundle = batchInfo.wallets[i];
                    const imported = await this.importWallet(walletBundle, password);
                    
                    results.push({
                        walletId: imported.data.walletId,
                        success: true,
                        data: imported.data
                    });

                    // Report progress
                    if (progressCallback) {
                        const progress = ((i + 1) / batchInfo.wallets.length) * 100;
                        progressCallback({
                            current: i + 1,
                            total: batchInfo.wallets.length,
                            percentage: Math.round(progress),
                            currentWallet: imported.data.name
                        });
                    }

                } catch (error) {
                    errors.push({
                        index: i,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                summary: {
                    imported: results.length,
                    failed: errors.length,
                    totalInBatch: batchInfo.wallets.length
                },
                results,
                errors
            };

        } catch (error) {
            console.error('Batch import error:', error);
            throw error;
        }
    }

    /**
     * Validate import data before processing
     * @param {Object|string} data - Data to validate
     * @returns {Object} Validated wallet data
     */
    async validateImportData(data) {
        try {
            // Parse if string
            const walletData = typeof data === 'string' ? JSON.parse(data) : data;

            // Check required fields
            const requiredFields = ['walletId', 'mnemonic', 'addresses'];
            for (const field of requiredFields) {
                if (!walletData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Validate mnemonic
            const mnemonic = Array.isArray(walletData.mnemonic) 
                ? walletData.mnemonic.join(' ') 
                : walletData.mnemonic;

            if (!bip39.validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }

            // Validate addresses structure
            if (!walletData.addresses.bitcoin && !walletData.addresses.spark) {
                throw new Error('No valid addresses found in wallet data');
            }

            // Clean and prepare wallet data
            const cleanedData = {
                walletId: walletData.walletId,
                name: walletData.name || `Imported Wallet ${Date.now()}`,
                mnemonic: mnemonic,
                network: walletData.network || 'MAINNET',
                addresses: walletData.addresses,
                privateKeys: walletData.privateKeys,
                type: walletData.type || 'imported',
                createdAt: walletData.createdAt || new Date().toISOString(),
                importedAt: new Date().toISOString()
            };

            return cleanedData;

        } catch (error) {
            console.error('Validation error:', error);
            throw new Error(`Invalid wallet data: ${error.message}`);
        }
    }

    /**
     * Validate encrypted bundle structure
     * @param {Object} bundle - Encrypted bundle to validate
     */
    validateEncryptedBundle(bundle) {
        // Check version
        if (!this.SUPPORTED_VERSIONS.includes(bundle.version)) {
            throw new Error(`Unsupported version: ${bundle.version}`);
        }

        // Check encryption algorithm
        if (bundle.algorithm !== 'AES-256-GCM') {
            throw new Error(`Unsupported algorithm: ${bundle.algorithm}`);
        }

        // Check required fields
        const required = ['keyDerivation', 'encryption'];
        for (const field of required) {
            if (!bundle[field]) {
                throw new Error(`Missing encryption field: ${field}`);
            }
        }

        // Check key derivation fields
        if (!bundle.keyDerivation.salt || !bundle.keyDerivation.method) {
            throw new Error('Invalid key derivation parameters');
        }

        // Check encryption fields
        if (!bundle.encryption.iv || !bundle.encryption.authTag || !bundle.encryption.data) {
            throw new Error('Invalid encryption parameters');
        }
    }

    /**
     * Decrypt wallet data using AES-256-GCM
     * @param {Object} encryptedBundle - Encrypted data bundle
     * @param {string} password - Decryption password
     * @returns {string} Decrypted data
     */
    async decryptWalletData(encryptedBundle, password) {
        try {
            // Extract encryption parameters
            const salt = Buffer.from(encryptedBundle.keyDerivation.salt, 'base64');
            const iv = Buffer.from(encryptedBundle.encryption.iv, 'base64');
            const authTag = Buffer.from(encryptedBundle.encryption.authTag, 'base64');
            const encryptedData = Buffer.from(encryptedBundle.encryption.data, 'base64');

            // Derive key using same method as encryption
            const keyDerivation = encryptedBundle.keyDerivation;
            const key = await scrypt(password, salt, this.KEY_LENGTH, {
                N: keyDerivation.N || 32768,
                r: keyDerivation.r || 8,
                p: keyDerivation.p || 1,
                maxmem: 128 * (keyDerivation.N || 32768) * (keyDerivation.r || 8) * 2
            });

            // Create decipher
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);

            // Decrypt data
            const decrypted = Buffer.concat([
                decipher.update(encryptedData),
                decipher.final()
            ]);

            return decrypted.toString('utf8');

        } catch (error) {
            console.error('Decryption error:', error);
            // Don't leak specific crypto errors
            throw new Error('Failed to decrypt wallet data. Please check your password.');
        }
    }

    /**
     * Check for duplicate wallets
     * @param {Object} walletData - Wallet data to check
     * @returns {Object} Duplicate check result
     */
    async checkForDuplicates(walletData) {
        // This would typically check against a database
        // For now, we'll return a simple check based on wallet ID
        // In production, this would query the wallet storage
        
        return {
            isDuplicate: false,
            info: null
        };
    }

    /**
     * Process QR code chunks for import
     * @param {Array} chunks - Array of QR code chunks
     * @returns {Object} Reassembled encrypted data
     */
    async processQRChunks(chunks) {
        try {
            // Sort chunks by index
            const sortedChunks = chunks.sort((a, b) => a.index - b.index);

            // Validate we have all chunks
            const expectedCount = sortedChunks[0].total;
            if (sortedChunks.length !== expectedCount) {
                throw new Error(`Missing QR chunks. Expected ${expectedCount}, got ${sortedChunks.length}`);
            }

            // Validate chunk continuity
            for (let i = 0; i < sortedChunks.length; i++) {
                if (sortedChunks[i].index !== i + 1) {
                    throw new Error(`Missing chunk ${i + 1}`);
                }
            }

            // Reassemble data
            const fullData = sortedChunks.map(chunk => chunk.data).join('');

            // Verify checksum of reassembled data
            const calculatedChecksum = this.calculateChecksum(fullData);
            
            // Parse and return
            return JSON.parse(fullData);

        } catch (error) {
            console.error('QR processing error:', error);
            throw new Error(`Failed to process QR codes: ${error.message}`);
        }
    }

    /**
     * Extract encrypted data from paper wallet HTML
     * @param {string} htmlContent - HTML content of paper wallet
     * @returns {Object} Extracted encrypted data
     */
    extractFromPaperWallet(htmlContent) {
        try {
            // Extract JSON data from HTML
            // Look for the data div content
            const dataMatch = htmlContent.match(/<div class="data">\s*([\s\S]*?)\s*<\/div>/);
            if (!dataMatch) {
                throw new Error('Could not find wallet data in paper backup');
            }

            const jsonData = dataMatch[1].trim();
            return JSON.parse(jsonData);

        } catch (error) {
            console.error('Paper wallet extraction error:', error);
            throw new Error('Failed to extract data from paper wallet');
        }
    }

    /**
     * Calculate checksum for data verification
     * @param {string} data - Data to checksum
     * @returns {string} Checksum hex string
     */
    calculateChecksum(data) {
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex')
            .substring(0, 8);
    }

    /**
     * Pre-validate import file
     * @param {Object} fileData - File data to validate
     * @returns {Object} Validation result
     */
    async preValidateImport(fileData) {
        try {
            const validationResult = {
                isValid: false,
                format: null,
                version: null,
                encrypted: false,
                errors: []
            };

            // Check if it's encrypted
            if (fileData.version && fileData.algorithm) {
                validationResult.encrypted = true;
                validationResult.version = fileData.version;
                validationResult.format = 'encrypted';

                // Validate structure
                try {
                    this.validateEncryptedBundle(fileData);
                    validationResult.isValid = true;
                } catch (error) {
                    validationResult.errors.push(error.message);
                }
            } else {
                // Check if it's plain wallet data (shouldn't be, but check anyway)
                validationResult.errors.push('File does not appear to be encrypted');
            }

            return validationResult;

        } catch (error) {
            return {
                isValid: false,
                errors: [error.message]
            };
        }
    }
}

// Export singleton instance
export const walletImportService = new WalletImportService();