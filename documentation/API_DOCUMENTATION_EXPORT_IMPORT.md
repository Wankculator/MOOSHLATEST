# MOOSH Wallet Export/Import API Documentation

**Author**: Captain Echo-5-1, Documentation Dynasty  
**Version**: 1.0  
**Last Updated**: 2025-07-28  
**Security Level**: CRITICAL - Handles encrypted wallet data

## Table of Contents
1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [API Endpoints](#api-endpoints)
4. [Code Examples](#code-examples)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Testing & Validation](#testing-validation)

---

## Overview

The MOOSH Wallet Export/Import system provides secure wallet backup and restoration capabilities using military-grade encryption (AES-256-GCM) with scrypt key derivation. This system is part of **OPERATION THUNDERSTRIKE - BRAVO Division**.

### Key Features
- **Encrypted Exports**: All wallet data is encrypted with AES-256-GCM
- **Multiple Formats**: JSON, QR Code, and Paper wallet support
- **Batch Operations**: Export/import multiple wallets simultaneously
- **Progress Tracking**: Real-time progress updates for batch operations
- **Validation**: Pre-import validation to ensure data integrity

### Architecture Flow
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend UI    │────▶│  API Server      │────▶│ Export Service  │
│  (Modals)       │     │  (Express)       │     │ (Encryption)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ User Password   │     │ Validation Layer │     │ Encrypted File  │
│ Input           │     │                  │     │ (.json/.qr)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Security Architecture

### Encryption Specifications
- **Algorithm**: AES-256-GCM (Authenticated Encryption)
- **Key Derivation**: scrypt with 32-byte salt
- **Key Length**: 256 bits (32 bytes)
- **IV Length**: 128 bits (16 bytes)
- **Auth Tag Length**: 128 bits (16 bytes)
- **Password Requirements**: Minimum 12 characters

### Encrypted Bundle Structure
```json
{
  "version": "1.0",
  "algorithm": "AES-256-GCM",
  "keyDerivation": {
    "method": "scrypt",
    "salt": "base64_encoded_salt",
    "keyLength": 32
  },
  "encryption": {
    "iv": "base64_encoded_iv",
    "authTag": "base64_encoded_auth_tag",
    "data": "base64_encoded_encrypted_data"
  },
  "metadata": {
    "encrypted": true,
    "timestamp": "2025-07-28T10:00:00.000Z"
  }
}
```

---

## API Endpoints

### 1. Export Single Wallet
**Endpoint**: `POST /api/wallet/export/:walletId`

**Request**:
```json
{
  "password": "strong_password_minimum_12_chars",
  "format": "json" // Options: "json", "qr", "paper"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "format": "json",
    "content": { /* encrypted bundle */ },
    "filename": "moosh-wallet-export-1722169200000.json"
  },
  "metadata": {
    "exportedAt": "2025-07-28T10:00:00.000Z",
    "format": "json",
    "version": "1.0",
    "walletId": "wallet_123"
  }
}
```

### 2. Export Multiple Wallets (Batch)
**Endpoint**: `POST /api/wallet/export/batch`

**Request**:
```json
{
  "walletIds": ["wallet_1", "wallet_2", "wallet_3"],
  "password": "strong_password_minimum_12_chars"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "bundle": { /* combined encrypted bundle */ },
    "summary": {
      "exported": 3,
      "failed": 0,
      "errors": []
    }
  }
}
```

### 3. Import Encrypted Wallet
**Endpoint**: `POST /api/wallet/import/encrypted`

**Request**:
```json
{
  "encryptedData": { /* encrypted bundle object */ },
  "password": "decryption_password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "walletId": "wallet_123",
    "name": "My Bitcoin Wallet",
    "mnemonic": "word1 word2 ... word12",
    "network": "MAINNET",
    "addresses": {
      "bitcoin": "bc1q...",
      "spark": "spark1..."
    },
    "type": "imported",
    "importedAt": "2025-07-28T10:00:00.000Z"
  },
  "metadata": {
    "importedAt": "2025-07-28T10:00:00.000Z",
    "isDuplicate": false,
    "duplicateInfo": null
  }
}
```

### 4. Import Batch
**Endpoint**: `POST /api/wallet/import/batch`

**Request**:
```json
{
  "batchData": { /* batch encrypted bundle */ },
  "password": "decryption_password"
}
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "imported": 3,
    "failed": 0,
    "totalInBatch": 3
  },
  "results": [
    {
      "walletId": "wallet_1",
      "success": true,
      "data": { /* wallet data */ }
    }
  ],
  "errors": []
}
```

### 5. Get Export Formats
**Endpoint**: `GET /api/wallet/export/formats`

**Response**:
```json
{
  "success": true,
  "formats": [
    {
      "id": "json",
      "name": "JSON File",
      "description": "Encrypted JSON file for easy backup and restore",
      "fileExtension": ".json",
      "recommended": true
    },
    {
      "id": "qr",
      "name": "QR Code",
      "description": "QR codes for mobile scanning (may require multiple codes)",
      "fileExtension": ".qr",
      "recommended": false
    },
    {
      "id": "paper",
      "name": "Paper Wallet",
      "description": "Printable paper backup with encrypted data",
      "fileExtension": ".html",
      "recommended": false
    }
  ]
}
```

### 6. Pre-validate Import File
**Endpoint**: `POST /api/wallet/import/validate`

**Request**:
```json
{
  "fileData": { /* encrypted bundle to validate */ }
}
```

**Response**:
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "format": "encrypted",
    "version": "1.0",
    "encrypted": true,
    "errors": []
  }
}
```

### 7. Process QR Code Chunks
**Endpoint**: `POST /api/wallet/import/qr-chunks`

**Request**:
```json
{
  "chunks": [
    {
      "index": 1,
      "total": 3,
      "data": "chunk_data_here",
      "checksum": "abc123"
    },
    // ... more chunks
  ]
}
```

### 8. Extract from Paper Wallet
**Endpoint**: `POST /api/wallet/import/paper`

**Request**:
```json
{
  "htmlContent": "<html>...</html>"
}
```

---

## Code Examples

### Export Wallet (Node.js/JavaScript)

```javascript
// Export single wallet
async function exportWallet(walletId, password) {
    try {
        const response = await fetch(`http://localhost:3001/api/wallet/export/${walletId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                format: 'json'
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Save the encrypted data to file
            const blob = new Blob([JSON.stringify(result.data.content)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.data.filename;
            a.click();
        }
    } catch (error) {
        console.error('Export failed:', error);
    }
}

// Export with progress tracking
async function exportMultipleWallets(walletIds, password) {
    const response = await fetch('http://localhost:3001/api/wallet/export/batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            walletIds: walletIds,
            password: password
        })
    });

    const result = await response.json();
    console.log(`Exported ${result.data.summary.exported} wallets`);
}
```

### Import Wallet (Node.js/JavaScript)

```javascript
// Import encrypted wallet
async function importWallet(encryptedData, password) {
    try {
        // First validate the file
        const validationResponse = await fetch('http://localhost:3001/api/wallet/import/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileData: encryptedData
            })
        });

        const validation = await validationResponse.json();
        
        if (!validation.validation.isValid) {
            throw new Error('Invalid wallet file: ' + validation.validation.errors.join(', '));
        }

        // Import the wallet
        const importResponse = await fetch('http://localhost:3001/api/wallet/import/encrypted', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encryptedData: encryptedData,
                password: password
            })
        });

        const result = await importResponse.json();
        
        if (result.success) {
            console.log('Wallet imported successfully:', result.data.walletId);
            return result.data;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
}
```

### CURL Examples

```bash
# Export wallet
curl -X POST http://localhost:3001/api/wallet/export/wallet_123 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "my_secure_password_123",
    "format": "json"
  }' > wallet_backup.json

# Import wallet
curl -X POST http://localhost:3001/api/wallet/import/encrypted \
  -H "Content-Type: application/json" \
  -d '{
    "encryptedData": '$(cat wallet_backup.json)',
    "password": "my_secure_password_123"
  }'

# Get export formats
curl -X GET http://localhost:3001/api/wallet/export/formats

# Validate import file
curl -X POST http://localhost:3001/api/wallet/import/validate \
  -H "Content-Type: application/json" \
  -d '{
    "fileData": '$(cat wallet_backup.json)'
  }'
```

### Python Example

```python
import requests
import json
from pathlib import Path

class MOOSHWalletExporter:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
    
    def export_wallet(self, wallet_id, password, format="json"):
        """Export a single wallet with encryption"""
        url = f"{self.base_url}/api/wallet/export/{wallet_id}"
        
        response = requests.post(url, json={
            "password": password,
            "format": format
        })
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                # Save to file
                filename = result["data"]["filename"]
                with open(filename, 'w') as f:
                    json.dump(result["data"]["content"], f, indent=2)
                print(f"Wallet exported to {filename}")
                return result["data"]
        
        raise Exception(f"Export failed: {response.text}")
    
    def import_wallet(self, file_path, password):
        """Import wallet from encrypted backup"""
        # Load encrypted data
        with open(file_path, 'r') as f:
            encrypted_data = json.load(f)
        
        # Validate first
        validate_url = f"{self.base_url}/api/wallet/import/validate"
        validation = requests.post(validate_url, json={
            "fileData": encrypted_data
        }).json()
        
        if not validation["validation"]["isValid"]:
            raise Exception(f"Invalid file: {validation['validation']['errors']}")
        
        # Import
        import_url = f"{self.base_url}/api/wallet/import/encrypted"
        response = requests.post(import_url, json={
            "encryptedData": encrypted_data,
            "password": password
        })
        
        result = response.json()
        if result["success"]:
            print(f"Wallet imported: {result['data']['walletId']}")
            return result["data"]
        else:
            raise Exception(f"Import failed: {result['error']}")

# Usage
exporter = MOOSHWalletExporter()

# Export
wallet_data = exporter.export_wallet("wallet_123", "secure_password_123")

# Import
imported_wallet = exporter.import_wallet("wallet_backup.json", "secure_password_123")
```

---

## Security Best Practices

### 1. Password Requirements
- **Minimum Length**: 12 characters (enforced by API)
- **Recommended**: 16+ characters with mixed case, numbers, and symbols
- **Storage**: NEVER store passwords in plaintext or logs

### 2. Secure Password Generation
```javascript
// Generate secure password
function generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    
    return Array.from(values, (v) => charset[v % charset.length]).join('');
}
```

### 3. File Handling
```javascript
// Secure file handling
async function secureFileRead(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // Clear the result from memory
                e.target.result = null;
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid file format'));
            }
        };
        
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsText(file);
    });
}
```

### 4. Network Security
- Always use HTTPS in production
- Implement request timeouts
- Use CORS properly
- Add rate limiting

```javascript
// Secure API request
async function secureApiRequest(endpoint, data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCSRFToken() // Add CSRF protection
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}
```

### 5. Memory Security
```javascript
// Clear sensitive data from memory
function clearSensitiveData(data) {
    if (typeof data === 'string') {
        // For strings, we can't directly clear, but we can null the reference
        data = null;
    } else if (data instanceof Uint8Array) {
        // For typed arrays, we can overwrite
        crypto.getRandomValues(data);
        data.fill(0);
    } else if (typeof data === 'object') {
        // For objects, recursively clear
        Object.keys(data).forEach(key => {
            if (key === 'password' || key === 'mnemonic' || key === 'privateKey') {
                data[key] = null;
                delete data[key];
            }
        });
    }
}
```

### 6. Audit Logging
```javascript
// Log export/import operations (without sensitive data)
function logOperation(operation, walletId, success) {
    const log = {
        timestamp: new Date().toISOString(),
        operation: operation,
        walletId: walletId,
        success: success,
        userAgent: navigator.userAgent,
        // NEVER log passwords, mnemonics, or private keys
    };
    
    console.log('[AUDIT]', JSON.stringify(log));
}
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Invalid password" Error
**Symptoms**: Import fails with password error despite correct password

**Solutions**:
- Verify password has no trailing spaces
- Check password encoding (UTF-8)
- Ensure minimum 12 character length
- Try copy/paste instead of typing

```javascript
// Debug password issues
function debugPassword(password) {
    console.log('Password length:', password.length);
    console.log('Has spaces:', password !== password.trim());
    console.log('Character codes:', Array.from(password).map(c => c.charCodeAt(0)));
}
```

#### 2. "Corrupted file" Error
**Symptoms**: Cannot import previously exported file

**Solutions**:
- Verify file wasn't modified by text editor
- Check file encoding (must be UTF-8)
- Validate JSON structure
- Use binary mode for file operations

```javascript
// Validate file structure
function validateExportFile(fileContent) {
    try {
        const data = typeof fileContent === 'string' 
            ? JSON.parse(fileContent) 
            : fileContent;
        
        // Check required fields
        const required = ['version', 'algorithm', 'keyDerivation', 'encryption'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            console.error('Missing fields:', missing);
            return false;
        }
        
        // Validate base64 encoding
        const base64Fields = [
            data.keyDerivation.salt,
            data.encryption.iv,
            data.encryption.authTag,
            data.encryption.data
        ];
        
        for (const field of base64Fields) {
            if (!isValidBase64(field)) {
                console.error('Invalid base64 encoding');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
}

function isValidBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}
```

#### 3. Large Wallet Export Timeout
**Symptoms**: Export fails for wallets with many transactions

**Solutions**:
- Increase timeout settings
- Use batch export for multiple wallets
- Implement progress tracking

```javascript
// Export with extended timeout
async function exportLargeWallet(walletId, password) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 minutes
    
    try {
        const response = await fetch(`/api/wallet/export/${walletId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, format: 'json' }),
            signal: controller.signal
        });
        
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}
```

#### 4. QR Code Generation Issues
**Symptoms**: QR codes too dense or won't scan

**Solutions**:
- Check chunk size (max 2000 chars)
- Verify QR error correction level
- Use multiple QR codes for large data

```javascript
// QR code chunk validation
function validateQRChunks(chunks) {
    const errors = [];
    
    // Check chunk size
    chunks.forEach((chunk, index) => {
        if (chunk.data.length > 2000) {
            errors.push(`Chunk ${index + 1} too large: ${chunk.data.length} chars`);
        }
    });
    
    // Check continuity
    const indices = chunks.map(c => c.index).sort((a, b) => a - b);
    for (let i = 0; i < indices.length; i++) {
        if (indices[i] !== i + 1) {
            errors.push(`Missing chunk ${i + 1}`);
        }
    }
    
    // Verify total count
    const totalCounts = [...new Set(chunks.map(c => c.total))];
    if (totalCounts.length > 1) {
        errors.push('Inconsistent total chunk count');
    }
    
    return errors;
}
```

#### 5. Memory Issues During Batch Operations
**Symptoms**: Browser crashes during large batch export/import

**Solutions**:
- Process wallets in smaller batches
- Implement streaming for large operations
- Clear processed data from memory

```javascript
// Memory-efficient batch processing
async function* batchProcessor(items, batchSize = 10) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        yield batch;
        
        // Give browser time to garbage collect
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Usage
async function exportWalletsEfficiently(walletIds, password) {
    const results = [];
    
    for await (const batch of batchProcessor(walletIds, 5)) {
        const batchResults = await Promise.all(
            batch.map(id => exportSingleWallet(id, password))
        );
        results.push(...batchResults);
        
        // Clear references to allow GC
        batchResults.length = 0;
    }
    
    return results;
}
```

---

## Testing & Validation

### Unit Test Examples

```javascript
// Test encryption/decryption roundtrip
describe('Wallet Export/Import', () => {
    test('should encrypt and decrypt wallet data correctly', async () => {
        const walletData = {
            walletId: 'test_123',
            name: 'Test Wallet',
            mnemonic: 'test mnemonic phrase here',
            addresses: {
                bitcoin: 'bc1qtest...',
                spark: 'spark1test...'
            }
        };
        
        const password = 'test_password_12345';
        
        // Export
        const exportResult = await walletExportService.exportWallet(
            walletData, 
            password, 
            'json'
        );
        
        expect(exportResult.success).toBe(true);
        expect(exportResult.data.content).toBeDefined();
        
        // Import
        const importResult = await walletImportService.importWallet(
            exportResult.data.content,
            password
        );
        
        expect(importResult.success).toBe(true);
        expect(importResult.data.walletId).toBe(walletData.walletId);
        expect(importResult.data.mnemonic).toBe(walletData.mnemonic);
    });
    
    test('should fail with incorrect password', async () => {
        const encrypted = { /* valid encrypted data */ };
        
        await expect(
            walletImportService.importWallet(encrypted, 'wrong_password')
        ).rejects.toThrow('Failed to decrypt wallet data');
    });
});
```

### Integration Test Script

```bash
#!/bin/bash
# test-export-import.sh

API_URL="http://localhost:3001"
WALLET_ID="test_wallet_123"
PASSWORD="secure_test_password_123"

echo "=== Testing Wallet Export/Import API ==="

# 1. Test export formats endpoint
echo -e "\n1. Testing export formats..."
curl -s "$API_URL/api/wallet/export/formats" | jq '.'

# 2. Test single wallet export
echo -e "\n2. Testing single wallet export..."
EXPORT_RESULT=$(curl -s -X POST "$API_URL/api/wallet/export/$WALLET_ID" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"$PASSWORD\", \"format\": \"json\"}")

echo "$EXPORT_RESULT" | jq '.success'

# 3. Extract encrypted data
ENCRYPTED_DATA=$(echo "$EXPORT_RESULT" | jq '.data.content')

# 4. Test validation
echo -e "\n3. Testing import validation..."
curl -s -X POST "$API_URL/api/wallet/import/validate" \
  -H "Content-Type: application/json" \
  -d "{\"fileData\": $ENCRYPTED_DATA}" | jq '.'

# 5. Test import
echo -e "\n4. Testing wallet import..."
curl -s -X POST "$API_URL/api/wallet/import/encrypted" \
  -H "Content-Type: application/json" \
  -d "{\"encryptedData\": $ENCRYPTED_DATA, \"password\": \"$PASSWORD\"}" | jq '.'

echo -e "\n=== All tests completed ==="
```

### Performance Testing

```javascript
// Performance test for batch operations
async function performanceTest() {
    const walletIds = Array.from({length: 100}, (_, i) => `wallet_${i}`);
    const password = 'test_password_123';
    
    console.time('Batch Export 100 Wallets');
    const exportResult = await fetch('/api/wallet/export/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletIds, password })
    });
    console.timeEnd('Batch Export 100 Wallets');
    
    const data = await exportResult.json();
    console.log('Export summary:', data.data.summary);
    
    console.time('Batch Import 100 Wallets');
    const importResult = await fetch('/api/wallet/import/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            batchData: data.data.bundle, 
            password 
        })
    });
    console.timeEnd('Batch Import 100 Wallets');
    
    const importData = await importResult.json();
    console.log('Import summary:', importData.summary);
}
```

---

## Appendix: Error Codes

| Code | Error | Description | Solution |
|------|-------|-------------|----------|
| 400 | Invalid Request | Missing or invalid parameters | Check request format |
| 401 | Authentication Failed | Invalid password | Verify password |
| 404 | Wallet Not Found | Wallet ID doesn't exist | Check wallet ID |
| 413 | Payload Too Large | Export data exceeds limit | Use batch export |
| 422 | Validation Failed | Invalid encrypted data | Check file integrity |
| 500 | Server Error | Internal error | Check server logs |

---

## Support & Contact

For issues or questions regarding the Export/Import API:

1. Check the [Troubleshooting Guide](#troubleshooting-guide)
2. Review server logs: `/logs/api-server.log`
3. Test with the provided examples
4. Create an issue with:
   - Error messages
   - API endpoint used
   - Request/response data (exclude passwords)
   - Browser/environment details

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-28  
**Maintained by**: MOOSH Wallet Development Team  
**Security Classification**: HIGH - Contains encryption implementation details