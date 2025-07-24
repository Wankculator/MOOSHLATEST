# AI Development Guidelines for MOOSH Wallet

## 📚 MASTER REFERENCE: `/05_DOCUMENTATION/MASTER_PROMPT_NEEDED.md`
**This file contains the comprehensive AI assistant prompt for MOOSH development**

When working with AI assistants on complex tasks:
1. **Always provide** the MASTER_PROMPT_NEEDED.md file as system context
2. **Use the shortcuts** defined in the master prompt (qsec, qtest, qscale, etc.)
3. **Follow the MCP structure** for complex multi-step tasks
4. **Apply the validation checklists** before implementing changes

## 🚨 CRITICAL: SEED GENERATION PRESERVATION RULES

### 📖 PRIMARY REFERENCE: `/docs/SEED_GENERATION_IMPLEMENTATION_GUIDE.md`
**ALWAYS read the implementation guide before making ANY changes to seed generation**

### NEVER MODIFY These Files Without Understanding Impact:

1. **Frontend API Calls**:
   - `/public/js/moosh-wallet.js` - Lines 1896-1922 (generateSparkWallet function)
   - `/public/js/moosh-wallet.js` - Lines 3224-3261 (generateWallet function)

2. **Backend Endpoints**:
   - `/src/server/api-server.js` - Line 126 (POST /api/spark/generate-wallet)
   - **CRITICAL**: The endpoint MUST remain `/api/spark/generate-wallet`

3. **Service Layer**:
   - `/src/server/services/sparkCompatibleService.js`
   - `/src/server/services/walletService.js`
   - `/src/server/services/sparkSDKService.js`

### Response Structure MUST Maintain:
```javascript
{
    success: true,
    data: {
        mnemonic: "string format, not array",
        addresses: {
            bitcoin: "address",
            spark: "address"
        },
        privateKeys: {
            bitcoin: { wif: "...", hex: "..." },
            spark: { hex: "..." }
        }
    }
}
```

### Before ANY Changes:

1. **Read** `/docs/SEED_GENERATION_IMPLEMENTATION_GUIDE.md` (Primary guide)
2. **Read** `/docs/SEED_GENERATION_CRITICAL_PATH.md` (Original reference)
3. **Test** seed generation is working:
   ```bash
   curl -X POST http://localhost:3001/api/spark/generate-wallet \
     -H "Content-Type: application/json" \
     -d '{"strength": 256}'
   ```
4. **Verify** response structure matches expected format

### Common Mistakes That Break Seed Generation:

- ❌ Changing endpoint from `/api/spark/generate-wallet` to anything else
- ❌ Returning mnemonic as array instead of string
- ❌ Changing response structure (e.g., `data.spark.address` instead of `data.addresses.spark`)
- ❌ Adding authentication middleware to seed generation
- ❌ Modifying timeout settings (generation takes 10-60 seconds, frontend timeout MUST be at least 60 seconds)
- ❌ Trying to "optimize" or speed up the SDK initialization

---

## General Development Rules

### 1. API Consistency
- Always maintain backward compatibility
- Never change existing endpoint URLs
- Add new endpoints instead of modifying existing ones

### 2. State Management
- Use the existing SparkStateManager for all state operations
- Don't create parallel state systems

### 3. Error Handling
- Preserve error response structures
- Add logging without changing response format

### 4. Testing Requirements
- Test seed generation after ANY frontend changes
- Test seed generation after ANY API changes
- Test seed generation after ANY service layer changes

### 5. Git Commit Rules
- Always mention if changes affect seed generation
- Reference this document in commits that touch critical paths

### 6. Recovery Procedure
If seed generation breaks, immediately restore from:
```bash
git checkout 7b831715d115a576ae1f4495d5140d403ace8213 -- [affected files]
```

---

## Working Reference
- **Last Confirmed Working**: Commit `7b831715d115a576ae1f4495d5140d403ace8213`
- **Branch**: `working-real-spark-addresses`
- **Documentation**: See `/docs/SEED_GENERATION_CRITICAL_PATH.md` for full details

---

## Development Checklist

Before submitting ANY changes:

- [ ] Seed generation still works (12 words)
- [ ] Seed generation still works (24 words)
- [ ] API returns in 10-60 seconds
- [ ] Response structure unchanged
- [ ] No console errors during generation
- [ ] Generated addresses are valid format
- [ ] Private keys are properly derived

---

## Contact for Issues
If you break seed generation:
1. Check `/docs/SEED_GENERATION_IMPLEMENTATION_GUIDE.md`
2. Run the test script
3. Restore from working commit
4. Document what caused the break

---

## AI Assistant Instructions

When working with AI assistants (Claude, GPT, etc.), always:

1. **Provide this file** as context before making any changes
2. **Emphasize** the importance of preserving seed generation
3. **Test thoroughly** after any AI-suggested changes
4. **Document** any AI-assisted modifications

### Key Phrases for AI Context
- "This project uses the Spark Protocol SDK for seed generation"
- "Seed generation MUST take 10-60 seconds - this is expected behavior"
- "The working-real-spark-addresses branch contains the reference implementation"
- "Never optimize or modify the core seed generation logic"

---

## Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

---

## Using the Master Prompt for Complex Tasks

For advanced development tasks, use the comprehensive prompt in `/05_DOCUMENTATION/MASTER_PROMPT_NEEDED.md`:

### Quick Command Reference:
- `qsec` - Security audit with crypto compliance
- `qtest` - Generate comprehensive test suite (>95% coverage)
- `qscale` - Mobile/responsive optimization
- `qmulti` - Multi-sig implementation
- `qbranch` - Branch merge planning
- `qultra` - Deep analysis with ultrathink
- `qcheck` - Run full validation checklist

### Example Usage:
1. Copy the entire MASTER_PROMPT_NEEDED.md content
2. Paste as system prompt to AI assistant
3. Use shortcuts: "qsec Audit MOOSH wallet endpoints"
4. AI will apply MCP layers, security checks, and generate production-ready code

This master prompt includes:
- Model Context Protocol (MCP) implementation
- Anti-hallucination validation
- Moosh-specific branch analysis
- Complete security and testing frameworks
- 83 verified sources for accuracy