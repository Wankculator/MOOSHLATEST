# GenerateSeedPage Component

## Component Name
GenerateSeedPage

## Exact Location
- **File**: `/public/js/moosh-wallet.js`
- **Lines**: 7439-8146
- **Class Definition**: `class GenerateSeedPage extends Component`
- **Core Generation Function**: `async generateWallet()` (lines 7497-7610)
- **API Call**: `generateSparkWallet()` (lines 3377-3434)

## UI Design (Visual Details for AI Recreation)

### Initial Loading State
- Dark background (#000000)
- Centered card with loading animation
- Progress bar showing generation steps:
  - "Initializing secure entropy..." (0-20%)
  - "Generating mnemonic phrase..." (20-40%)
  - "Deriving wallet keys..." (40-60%)
  - "Creating Spark addresses..." (60-80%)
  - "Finalizing wallet..." (80-100%)

### Success State (After Generation)
- **Title Section**:
  - "Wallet Generated!" text
  - Font: JetBrains Mono, 24px, weight 600
  - Color: #f57315
  - Success icon/indicator

- **Seed Phrase Display**:
  - Grid layout: 3 columns (desktop), 2 columns (mobile)
  - Each word in numbered box:
    - Background: #0a0a0a
    - Border: 1px solid #333333
    - Padding: 12px
    - Number prefix: dim gray (#888888)
    - Word: orange (#f57315)
    - Font: monospace, 14px
  - Hover effect: border color changes to #f57315

- **Warning Section**:
  - Red background panel (#1a0000)
  - Border: 2px solid #ff4444
  - Warning icon
  - Text: "CRITICAL: Write down these words in order. This is your only way to recover your wallet."

- **Action Buttons**:
  - "I've Written It Down" button:
    - Primary style (orange border/text)
    - Navigates to confirmation page
  - "Download Backup" button (optional):
    - Secondary style
    - Downloads encrypted backup file

### Error State
- Error message display
- "Try Again" button
- "Back" button to return home

## Function (What It Does)

1. **Entropy Generation**: Creates cryptographically secure random entropy
2. **Mnemonic Creation**: Generates BIP39 mnemonic phrase (12 or 24 words)
3. **Key Derivation**: Derives Bitcoin and Spark Protocol keys
4. **Address Generation**: Creates addresses for all supported types
5. **State Storage**: Temporarily stores generated seed in app state
6. **Navigation**: Proceeds to seed confirmation page

## Architecture (Code Structure)

```javascript
class GenerateSeedPage extends Component {
    constructor(app) {
        super(app);
        this.isGenerating = false;
        this.progressInterval = null;
        this.generatedWallet = null;
    }
    
    async generateWallet(wordCount) {
        // 1. Start progress animation
        this.animateProgress();
        
        // 2. Call API service
        const response = await this.app.apiService.generateSparkWallet(wordCount);
        
        // 3. Process response
        if (response.success) {
            const walletData = response.data;
            const generatedSeed = walletData.mnemonic.split(' ');
            
            // 4. Store in state
            this.app.state.set('generatedSeed', generatedSeed);
            this.app.state.set('sparkWallet', walletData);
            
            // 5. Render success UI
            this.render();
        }
    }
}
```

### API Integration Pattern
```javascript
// Frontend call (moosh-wallet.js:3377)
async generateSparkWallet(wordCount = 24) {
    const strength = wordCount === 24 ? 256 : 128;
    const response = await fetch(`${this.baseURL}/api/spark/generate-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strength, network: 'MAINNET' }),
        signal: controller.signal // 60 second timeout
    });
    return response.json();
}

// Backend endpoint (api-server.js:126)
app.post('/api/spark/generate-wallet', async (req, res) => {
    const { strength } = req.body;
    // Generates real wallet using Spark SDK
    // Returns mnemonic, addresses, and private keys
});
```

## Connections (Related Components)

### Parent Components
- **HomePage** - User navigates here from "Create New Wallet"
- **Router** - Manages page transitions

### Child Components
- **Header** - Navigation bar
- **Button** - Action buttons
- **Terminal** (optional) - Shows generation progress

### Navigation Flow
1. **HomePage** → GenerateSeedPage (user clicks "Create New Wallet")
2. **GenerateSeedPage** → ConfirmSeedPage (user clicks "I've Written It Down")
3. **GenerateSeedPage** → HomePage (user clicks "Back" on error)

### Data Flow
- Reads: `selectedMnemonic` (12 or 24 words)
- Writes: `generatedSeed`, `sparkWallet`, `currentWallet`
- API: POST `/api/spark/generate-wallet`

## Purpose in Wallet

1. **Security**: Generates cryptographically secure seed phrases
2. **Standards Compliance**: Follows BIP39/BIP32/BIP44 standards
3. **Multi-Protocol**: Generates both Bitcoin and Spark Protocol addresses
4. **User Experience**: Clear progress indication and error handling

## MCP Validation Status

### TestSprite Compliance
- ✅ Uses app.apiService for API calls (no direct fetch)
- ✅ Proper ElementFactory usage
- ✅ Clean event handler management
- ✅ Debounced actions where needed

### Memory Management
- ✅ Clears intervals on completion
- ✅ No lingering event listeners
- ⚠️ Stores seed temporarily in localStorage (migrated to secure storage later)

### Security
- ✅ Uses crypto.getRandomValues for entropy
- ✅ Never logs full seed phrases
- ✅ 60-second timeout on API calls
- ⚠️ Temporary localStorage usage (cleared after confirmation)

## Backtrack Info (Git Commands)

### View Seed Generation Implementation
```bash
# View the generateWallet function
git show 7b831715:public/js/moosh-wallet.js | grep -A 120 "async generateWallet"

# View API endpoint
git show 7b831715:src/server/api-server.js | grep -A 50 "/api/spark/generate-wallet"
```

### Critical Working Commit
```bash
# This commit has confirmed working seed generation
git checkout 7b831715
```

### Find Changes to Generation Logic
```bash
git log -p --follow -S "generateSparkWallet" -- public/js/moosh-wallet.js
```

## Implementation Notes for AI

### Critical Requirements
1. **NEVER change the API endpoint** from `/api/spark/generate-wallet`
2. **ALWAYS return mnemonic as string**, not array
3. **MAINTAIN response structure** exactly as documented
4. **RESPECT 60-second timeout** for SDK operations

### Required Response Format
```javascript
{
    success: true,
    data: {
        mnemonic: "word1 word2 word3...", // STRING format
        addresses: {
            bitcoin: "bc1q...",
            spark: "sp1q..."
        },
        privateKeys: {
            bitcoin: { wif: "...", hex: "..." },
            spark: { hex: "..." }
        }
    }
}
```

### Common Mistakes to Avoid
1. Don't return mnemonic as array (breaks compatibility)
2. Don't change timeout (SDK needs up to 60 seconds)
3. Don't modify endpoint URL (frontend expects exact path)
4. Don't skip progress animation (users expect feedback)

### Testing Checklist
1. Verify 12-word generation works
2. Verify 24-word generation works
3. Check progress bar updates smoothly
4. Ensure seed is stored in state
5. Confirm navigation to confirmation page
6. Test error handling with network offline