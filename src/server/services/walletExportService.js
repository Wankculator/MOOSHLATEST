/**
 * Wallet Export Service
 * Handles secure export of wallet data with encryption
 * Part of OPERATION THUNDERSTRIKE - BRAVO Division
 */

import crypto from 'crypto';
import { promisify } from 'util';

// Promisify crypto functions for async/await
const scrypt = promisify(crypto.scrypt);
const randomBytes = promisify(crypto.randomBytes);

export class WalletExportService {
    constructor() {
        // Encryption configuration
        this.SALT_LENGTH = 32;
        this.IV_LENGTH = 16;
        this.TAG_LENGTH = 16;
        this.KEY_LENGTH = 32; // 256 bits for AES-256
        
        // Scrypt parameters (following best practices)
        this.SCRYPT_N = 32768; // CPU/memory cost parameter (2^15)
        this.SCRYPT_R = 8;     // Block size parameter
        this.SCRYPT_P = 1;     // Parallelization parameter
        
        // Export format options
        this.FORMATS = {
            JSON: 'json',
            QR: 'qr',
            PAPER: 'paper'
        };
    }

    /**
     * Export a single wallet with encryption
     * @param {Object} walletData - The wallet data to export
     * @param {string} password - Password for encryption
     * @param {string} format - Export format (json, qr, paper)
     * @returns {Object} Encrypted wallet bundle
     */
    async exportWallet(walletData, password, format = 'json') {
        try {
            // Validate inputs
            if (!walletData || !walletData.walletId) {
                throw new Error('Invalid wallet data');
            }
            
            if (!password || password.length < 12) {
                throw new Error('Password must be at least 12 characters');
            }
            
            if (!Object.values(this.FORMATS).includes(format)) {
                throw new Error(`Invalid format. Must be one of: ${Object.values(this.FORMATS).join(', ')}`);
            }

            // Prepare wallet data for export
            const exportData = this.prepareWalletData(walletData);
            
            // Encrypt the wallet data
            const encryptedBundle = await this.encryptWalletData(exportData, password);
            
            // Format the output based on requested format
            const formattedOutput = await this.formatOutput(encryptedBundle, format);
            
            return {
                success: true,
                data: formattedOutput,
                metadata: {
                    exportedAt: new Date().toISOString(),
                    format: format,
                    version: '1.0',
                    walletId: walletData.walletId
                }
            };
            
        } catch (error) {
            console.error('Export wallet error:', error);
            throw error;
        }
    }

    /**
     * Export multiple wallets with batch processing
     * @param {Array} walletIds - Array of wallet IDs to export
     * @param {Object} walletsData - Map of wallet ID to wallet data
     * @param {string} password - Password for encryption
     * @param {Function} progressCallback - Optional callback for progress updates
     * @returns {Object} Batch export result
     */
    async exportMultiple(walletIds, walletsData, password, progressCallback) {
        try {
            if (!Array.isArray(walletIds) || walletIds.length === 0) {
                throw new Error('No wallets specified for export');
            }
            
            if (!password || password.length < 12) {
                throw new Error('Password must be at least 12 characters');
            }

            const results = [];
            const errors = [];
            
            // Process wallets in batches to avoid memory issues
            const BATCH_SIZE = 10;
            for (let i = 0; i < walletIds.length; i += BATCH_SIZE) {
                const batch = walletIds.slice(i, i + BATCH_SIZE);
                
                // Process batch in parallel
                const batchPromises = batch.map(async (walletId, index) => {
                    try {
                        const walletData = walletsData[walletId];
                        if (!walletData) {
                            throw new Error(`Wallet ${walletId} not found`);
                        }
                        
                        const exported = await this.exportWallet(walletData, password, 'json');
                        
                        // Report progress
                        if (progressCallback) {
                            const progress = ((i + index + 1) / walletIds.length) * 100;
                            progressCallback({
                                current: i + index + 1,
                                total: walletIds.length,
                                percentage: Math.round(progress),
                                walletId: walletId
                            });
                        }
                        
                        return {
                            walletId,
                            success: true,
                            data: exported.data
                        };
                    } catch (error) {
                        errors.push({
                            walletId,
                            error: error.message
                        });
                        return null;
                    }
                });
                
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults.filter(r => r !== null));
            }
            
            // Create combined export bundle
            const combinedBundle = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                walletCount: results.length,
                wallets: results.map(r => r.data)
            };
            
            // Encrypt the combined bundle
            const encryptedCombined = await this.encryptWalletData(
                JSON.stringify(combinedBundle),
                password
            );
            
            return {
                success: true,
                data: {
                    bundle: encryptedCombined,
                    summary: {
                        exported: results.length,
                        failed: errors.length,
                        errors: errors
                    }
                }
            };
            
        } catch (error) {
            console.error('Batch export error:', error);
            throw error;
        }
    }

    /**
     * Prepare wallet data for export (remove sensitive metadata)
     * @param {Object} walletData - Raw wallet data
     * @returns {Object} Cleaned wallet data
     */
    prepareWalletData(walletData) {
        // Extract only necessary data for export
        const cleanData = {
            walletId: walletData.walletId,
            name: walletData.name,
            mnemonic: walletData.mnemonic,
            network: walletData.network || 'MAINNET',
            addresses: walletData.addresses,
            privateKeys: walletData.privateKeys,
            createdAt: walletData.createdAt,
            type: walletData.type || 'standard'
        };
        
        // Remove any server-side metadata
        delete cleanData.lastAccessed;
        delete cleanData.sessionId;
        delete cleanData.apiKeys;
        
        return cleanData;
    }

    /**
     * Encrypt wallet data using AES-256-GCM
     * @param {Object|string} data - Data to encrypt
     * @param {string} password - Encryption password
     * @returns {Object} Encrypted bundle
     */
    async encryptWalletData(data, password) {
        try {
            // Convert data to string if it's an object
            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            
            // Generate random salt and IV
            const salt = await randomBytes(this.SALT_LENGTH);
            const iv = await randomBytes(this.IV_LENGTH);
            
            // Derive key using scrypt with proper parameters
            const key = await scrypt(password, salt, this.KEY_LENGTH, {
                N: this.SCRYPT_N,
                r: this.SCRYPT_R,
                p: this.SCRYPT_P,
                maxmem: 128 * this.SCRYPT_N * this.SCRYPT_R * 2
            });
            
            // Create cipher
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            
            // Encrypt data
            const encrypted = Buffer.concat([
                cipher.update(dataString, 'utf8'),
                cipher.final()
            ]);
            
            // Get the authentication tag
            const authTag = cipher.getAuthTag();
            
            // Create encrypted bundle
            const bundle = {
                version: '1.0',
                algorithm: 'AES-256-GCM',
                keyDerivation: {
                    method: 'scrypt',
                    salt: salt.toString('base64'),
                    keyLength: this.KEY_LENGTH,
                    N: this.SCRYPT_N,
                    r: this.SCRYPT_R,
                    p: this.SCRYPT_P
                },
                encryption: {
                    iv: iv.toString('base64'),
                    authTag: authTag.toString('base64'),
                    data: encrypted.toString('base64')
                },
                metadata: {
                    encrypted: true,
                    timestamp: new Date().toISOString()
                }
            };
            
            return bundle;
            
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt wallet data');
        }
    }

    /**
     * Format encrypted bundle based on export format
     * @param {Object} encryptedBundle - Encrypted data bundle
     * @param {string} format - Target format
     * @returns {Object} Formatted output
     */
    async formatOutput(encryptedBundle, format) {
        switch (format) {
            case this.FORMATS.JSON:
                return {
                    format: 'json',
                    content: encryptedBundle,
                    filename: `moosh-wallet-export-${Date.now()}.json`
                };
                
            case this.FORMATS.QR:
                // For QR codes, we need to create chunks as QR codes have size limits
                const jsonString = JSON.stringify(encryptedBundle);
                const chunks = this.createQRChunks(jsonString);
                return {
                    format: 'qr',
                    content: chunks,
                    totalChunks: chunks.length,
                    filename: `moosh-wallet-export-${Date.now()}-qr.json`
                };
                
            case this.FORMATS.PAPER:
                // Paper wallet format includes printable version
                return {
                    format: 'paper',
                    content: {
                        encrypted: encryptedBundle,
                        printable: this.createPrintableVersion(encryptedBundle)
                    },
                    filename: `moosh-wallet-export-${Date.now()}-paper.html`
                };
                
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Create QR code chunks for large data
     * @param {string} data - Data to chunk
     * @returns {Array} Array of QR chunks
     */
    createQRChunks(data) {
        const MAX_QR_SIZE = 2000; // Characters per QR code
        const chunks = [];
        const chunkCount = Math.ceil(data.length / MAX_QR_SIZE);
        
        for (let i = 0; i < chunkCount; i++) {
            const start = i * MAX_QR_SIZE;
            const end = Math.min(start + MAX_QR_SIZE, data.length);
            
            chunks.push({
                index: i + 1,
                total: chunkCount,
                data: data.substring(start, end),
                checksum: this.calculateChecksum(data.substring(start, end))
            });
        }
        
        return chunks;
    }

    /**
     * Create printable HTML version for paper wallet
     * @param {Object} encryptedBundle - Encrypted data
     * @returns {string} HTML content
     */
    createPrintableVersion(encryptedBundle) {
        const data = JSON.stringify(encryptedBundle, null, 2);
        const checksum = this.calculateChecksum(data);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>MOOSH Wallet Paper Backup</title>
    <style>
        body {
            font-family: monospace;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .warning {
            background: #ffeb3b;
            padding: 10px;
            border: 2px solid #f44336;
            margin: 20px 0;
            font-weight: bold;
        }
        .data {
            background: #f5f5f5;
            padding: 10px;
            word-break: break-all;
            font-size: 10px;
            line-height: 1.5;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #000;
            text-align: center;
        }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MOOSH Wallet Paper Backup</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Checksum: ${checksum}</p>
    </div>
    
    <div class="warning">
        ⚠️ WARNING: This is an encrypted backup of your wallet.
        Store this paper in a secure location. Anyone with access
        to this paper and your password can access your funds.
    </div>
    
    <div class="data">
        ${data}
    </div>
    
    <div class="footer">
        <p>MOOSH Wallet - Secure Bitcoin & Spark Protocol Wallet</p>
        <p class="no-print">
            <button onclick="window.print()">Print This Backup</button>
        </p>
    </div>
</body>
</html>
        `;
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
}

// Export singleton instance
export const walletExportService = new WalletExportService();