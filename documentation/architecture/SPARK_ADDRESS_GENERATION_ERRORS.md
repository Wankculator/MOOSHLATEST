# SPARK ADDRESS GENERATION ERRORS & FIX PLAN

## Current Issues

### 1. **Incorrect Address Generation**
- **Expected**: `sp1pgss8u5vh4cldqxarcl2hnqgqelhupdt6g9e9y5x489t8ky355f3veh6dln5pf`
- **Generated**: `sp1vch4fyaslqg42w7fhgg25humughe2yx5rg5ttnshg6vu74yxeyvfvxq2e2w`
- **Problem**: Not using proper Spark protocol derivation

### 2. **Test Results Summary**

#### 12-Word Seeds
```
Seed: boost inject evil laptop mirror what shift upon junk better crime uncle
Expected Spark: sp1pgss88jsfr948dtgvvwueyk8l4cev3xaf6qn8hhc724kje44mny6cae8h9s0ml
Generated: INCORRECT ❌
```

#### 24-Word Seeds
```
Seed: huge gap avoid dentist age dutch attend zero bridge upon amazing ring enforce smile blush cute engage gown marble goose yellow vanish like search
Expected Spark: sp1pgss9y6fyhznnl22juqntfrg0yaylx4meaefe9c2k9trmp4n5hdvhswfat7rca
Generated: INCORRECT ❌
```

#### Custom Test Seed
```
Seed: front anger move cradle expect rescue theme blood crater taste knee extra
Expected Spark: sp1pgss8u5vh4cldqxarcl2hnqgqelhupdt6g9e9y5x489t8ky355f3veh6dln5pf
Generated: INCORRECT ❌
```

## Root Causes

1. **Mock Implementation Issues**
   - Using simple SHA256 hash instead of proper derivation
   - Not implementing bech32m encoding correctly
   - Missing Spark protocol-specific derivation path

2. **SDK Integration Issues**
   - Real Spark SDK (@buildonspark/spark-sdk) hangs when initialized
   - Timeout issues preventing proper address generation
   - SDK may require specific environment or configuration

3. **Address Format Issues**
   - All real Spark addresses start with `sp1pgss` (7 characters)
   - Total length is exactly 65 characters
   - Uses bech32m encoding (not bech32)
   - Requires specific checksum calculation

## Fix Plan

### Option 1: Fix SDK Integration (Preferred)
1. Debug why Spark SDK hangs
2. Check if it needs specific Node.js version
3. Ensure all dependencies are properly installed
4. Add timeout handling and proper error recovery

### Option 2: Implement Proper Bech32m Encoding
1. Implement full bech32m encoder with:
   - Correct polymod calculation
   - Proper constant (0x2bc830a3)
   - 5-bit grouping
   - Checksum generation
2. Determine correct derivation path for Spark
3. Match the exact encoding used by spark.money

### Option 3: Use Hardcoded Test Vectors (Temporary)
1. Create a mapping of known seeds to addresses
2. For unknown seeds, show warning that real SDK is needed
3. This ensures at least test cases work correctly

## Implementation Steps

### Step 1: Create Proper Bech32m Implementation
```javascript
// Bech32m constants
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
const BECH32M_CONST = 0x2bc830a3;

function bech32mEncode(hrp, data) {
    // Implementation here
}
```

### Step 2: Fix Derivation Path
- Research exact derivation path used by Spark
- Implement proper HD key derivation
- Match the reference implementation

### Step 3: Create Comprehensive Test Suite
- Test all known vectors
- Validate address format
- Ensure deterministic generation

## Expected Outcomes

After fixes, the wallet should:
1. Generate correct Spark addresses for all test vectors
2. Produce deterministic addresses from seeds
3. Match the format used by spark.money
4. Work for both 12 and 24 word seeds

## Testing Requirements

1. **Unit Tests**
   - Test each component separately
   - Validate bech32m encoding
   - Check derivation paths

2. **Integration Tests**
   - Full wallet generation flow
   - Import/export functionality
   - API endpoint validation

3. **User Acceptance Tests**
   - Generate wallet → verify addresses
   - Import known seed → check addresses match
   - Ensure UI displays correct information

## References
- Spark Protocol: https://www.spark.money/
- BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Bech32m: https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki