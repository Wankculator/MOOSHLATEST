# SECURITY QUICK CHECK - walletExportService.js
**Specialist**: CHARLIE-3-3  
**Date**: 2025-07-28  
**Status**: ⚠️ CRITICAL ISSUES FOUND

## 🔴 CRITICAL SECURITY ISSUES

### 1. ❌ INCORRECT KEY DERIVATION FUNCTION
**Location**: Line 218  
**Issue**: Using `scrypt` but claiming PBKDF2 in comments/specs
```javascript
// Line 217: Comment says "Derive key using PBKDF2"
// Line 218: const key = await scrypt(password, salt, this.KEY_LENGTH);
```
**Impact**: Misleading documentation, potential confusion about security parameters
**Fix Required**: Either use PBKDF2 as documented OR update documentation to reflect scrypt usage

### 2. ❌ MISSING SCRYPT PARAMETERS
**Location**: Line 218  
**Issue**: scrypt called with only 3 parameters (missing N, r, p)
```javascript
// Current: scrypt(password, salt, this.KEY_LENGTH)
// Should be: scrypt(password, salt, keyLength, { N: 16384, r: 8, p: 1 })
```
**Impact**: Using default parameters which may be insecure
**Severity**: HIGH - Weak key derivation

### 3. ⚠️ UNUSED PBKDF2 CONFIGURATION
**Location**: Line 17  
**Issue**: `this.PBKDF2_ITERATIONS = 100000` defined but never used
**Impact**: Confusing configuration that suggests PBKDF2 usage

## ✅ CORRECT IMPLEMENTATIONS

### 1. ✅ AES-256-GCM Implementation
- Correct algorithm usage (Line 221)
- Proper auth tag extraction (Line 230)
- Correct cipher mode

### 2. ✅ Random IV Generation
- Using crypto.randomBytes (Line 215)
- Correct IV length (16 bytes)
- Properly async implementation

### 3. ✅ Salt Generation
- Using crypto.randomBytes (Line 214)
- Adequate salt length (32 bytes)

## 🔧 IMMEDIATE FIXES REQUIRED

### 1. Fix scrypt implementation:
```javascript
// Replace line 218 with:
const key = await scrypt(password, salt, this.KEY_LENGTH, {
    N: 16384,  // CPU/memory cost (2^14)
    r: 8,      // Block size
    p: 1,      // Parallelization
    maxmem: 32 * 1024 * 1024  // 32MB max memory
});
```

### 2. Update metadata to reflect actual implementation:
```javascript
// Line 237: Update keyDerivation object
keyDerivation: {
    method: 'scrypt',
    salt: salt.toString('base64'),
    keyLength: this.KEY_LENGTH,
    N: 16384,
    r: 8,
    p: 1
}
```

### 3. Remove unused PBKDF2 configuration or implement PBKDF2:
```javascript
// Option A: Remove line 17
// Option B: Implement PBKDF2 as originally intended:
const key = await promisify(crypto.pbkdf2)(
    password,
    salt,
    this.PBKDF2_ITERATIONS,
    this.KEY_LENGTH,
    'sha256'
);
```

## 📊 SECURITY SCORE: 6/10

**Positive**: Core encryption primitives are correct  
**Negative**: Key derivation implementation has critical issues  
**Risk Level**: MEDIUM-HIGH until fixes are applied

## 🚨 RECOMMENDATION

**IMMEDIATE ACTION REQUIRED**: Fix the scrypt implementation parameters before production use. The current implementation may be using weak default parameters that could compromise wallet security.

---
*End of CHARLIE-3-3 Security Quick Check*