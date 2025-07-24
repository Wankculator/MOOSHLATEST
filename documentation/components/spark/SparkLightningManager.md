# SparkLightningManager

**Last Updated**: 2025-07-21
**Location**: `/public/js/moosh-wallet.js` - Lines 5836-5939
**Type**: Lightning Network Integration Component

## Overview

The `SparkLightningManager` handles Lightning Network operations within the Spark Protocol ecosystem. It manages Lightning payments, invoice creation, channel balances, and route finding for instant Bitcoin transactions.

## Class Definition

```javascript
class SparkLightningManager {
    constructor()
    async sendSparkLightning(invoice, amount)
    async createSparkInvoice(amount, description)
    async decodeLightningInvoice(invoice)
    async findSparkRoute(destination, amount)
    async generateQRCode(text)
    getChannelBalance()
}
```

## Properties

### Core Properties

- **lightningNode** (`string`): Spark Lightning node endpoint
- **channels** (`Map`): Active Lightning channels
- **invoices** (`Map`): Created and received invoices

## Methods

### sendSparkLightning(invoice, amount)

Sends a Lightning payment through Spark Protocol's Lightning integration.

**Parameters:**
- `invoice` (string): Lightning invoice (BOLT11 format)
- `amount` (number): Amount to send in satoshis

**Returns:**
- `Promise<Object>`: Payment result
  - `preimage`: Payment preimage (proof of payment)
  - `fee`: Fee paid in satoshis
  - `route`: Payment route details
  - `sparkConfirmed`: Spark Protocol confirmation
  - `timestamp`: Payment timestamp

**Example:**
```javascript
const payment = await sparkLightningManager.sendSparkLightning(
    'lnbc1000n1p3...',
    1000
);
console.log(`Payment completed: ${payment.preimage}`);
console.log(`Fee: ${payment.fee} sats`);
```

### createSparkInvoice(amount, description)

Creates a Lightning invoice for receiving payments.

**Parameters:**
- `amount` (number): Amount in satoshis
- `description` (string): Invoice description/memo

**Returns:**
- `Promise<Object>`: Invoice details
  - `payment_request`: BOLT11 invoice string
  - `payment_hash`: Payment hash
  - `expires_at`: Expiration timestamp
  - `sparkEnabled`: Spark Protocol support flag
  - `qr_code`: QR code data URL

**Example:**
```javascript
const invoice = await sparkLightningManager.createSparkInvoice(
    5000,
    'Coffee payment'
);
console.log(`Invoice: ${invoice.payment_request}`);
// Display QR code
document.getElementById('qr').src = invoice.qr_code;
```

### decodeLightningInvoice(invoice)

Decodes a Lightning invoice to extract payment details.

**Parameters:**
- `invoice` (string): BOLT11 invoice to decode

**Returns:**
- `Promise<Object>`: Decoded invoice
  - `destination`: Recipient node ID
  - `amount`: Amount in satoshis
  - `description`: Payment description
  - `expires_at`: Expiration timestamp

### findSparkRoute(destination, amount)

Finds an optimal Lightning route through Spark nodes.

**Parameters:**
- `destination` (string): Destination node ID
- `amount` (number): Amount to route

**Returns:**
- `Promise<Object>`: Route information
  - `hops`: Array of routing hops
  - `total_fee`: Total routing fee
  - `estimated_time`: Estimated completion time

### generateQRCode(text)

Generates a QR code for Lightning invoices.

**Parameters:**
- `text` (string): Text to encode (usually invoice)

**Returns:**
- `Promise<string>`: Data URL of QR code image

### getChannelBalance()

Returns current Lightning channel balance information.

**Returns:**
- `Object`: Channel balance details
  - `local`: Local balance in satoshis
  - `remote`: Remote balance in satoshis
  - `total`: Total channel capacity

## Integration Examples

### Complete Lightning Payment Flow

```javascript
// Initialize manager
const lightningManager = new SparkLightningManager();

// Create and pay an invoice
async function lightningPaymentFlow() {
    try {
        // 1. Create invoice for receiving
        const invoice = await lightningManager.createSparkInvoice(
            10000,  // 0.0001 BTC
            'Product purchase'
        );
        
        console.log('Invoice created:', invoice.payment_request);
        
        // 2. Decode invoice before paying
        const decoded = await lightningManager.decodeLightningInvoice(
            invoice.payment_request
        );
        
        console.log('Invoice details:', decoded);
        
        // 3. Send payment
        const payment = await lightningManager.sendSparkLightning(
            invoice.payment_request,
            decoded.amount
        );
        
        console.log('Payment successful:', payment);
        
        return {
            invoice,
            payment,
            success: true
        };
    } catch (error) {
        console.error('Lightning payment failed:', error);
        throw error;
    }
}
```

### Channel Management

```javascript
// Monitor channel balance
function monitorChannelBalance() {
    const balance = lightningManager.getChannelBalance();
    
    console.log('Channel Status:');
    console.log(`  Local: ${(balance.local / 100000000).toFixed(8)} BTC`);
    console.log(`  Remote: ${(balance.remote / 100000000).toFixed(8)} BTC`);
    console.log(`  Total: ${(balance.total / 100000000).toFixed(8)} BTC`);
    
    // Check if rebalancing needed
    const localPercent = (balance.local / balance.total) * 100;
    if (localPercent < 20) {
        console.warn('Low local balance - consider rebalancing');
    }
    
    return balance;
}
```

### Invoice Management

```javascript
// Create recurring invoices
async function createRecurringInvoice(amount, interval) {
    const invoices = [];
    
    const createInvoice = async () => {
        const invoice = await lightningManager.createSparkInvoice(
            amount,
            `Recurring payment - ${new Date().toISOString()}`
        );
        
        invoices.push(invoice);
        
        // Monitor for payment
        console.log('New invoice created:', invoice.payment_hash);
        
        return invoice;
    };
    
    // Create first invoice
    await createInvoice();
    
    // Set up recurring creation
    setInterval(createInvoice, interval);
    
    return invoices;
}
```

### Route Optimization

```javascript
// Find optimal payment route
async function optimizePaymentRoute(invoice, amount) {
    const decoded = await lightningManager.decodeLightningInvoice(invoice);
    const route = await lightningManager.findSparkRoute(
        decoded.destination,
        amount
    );
    
    console.log('Route found:');
    console.log(`  Hops: ${route.hops.length}`);
    console.log(`  Total fee: ${route.total_fee} sats`);
    console.log(`  Time estimate: ${route.estimated_time}ms`);
    
    // Analyze route
    const feePercent = (route.total_fee / amount) * 100;
    if (feePercent > 1) {
        console.warn(`High fee: ${feePercent.toFixed(2)}%`);
    }
    
    return route;
}
```

## Lightning Invoice Format

### Standard BOLT11 Invoice Structure
```
lnbc[amount][timestamp][tagged-fields][signature]

Example: lnbc10n1p3f6gphpp5...
- lnbc: Lightning Network Bitcoin mainnet
- 10n: 10 nano-bitcoin (1000 sats)
- 1: Separator
- p3f6gph: Timestamp
- pp5...: Payment hash and other fields
```

## Channel State Management

```javascript
// Channel states
const CHANNEL_STATES = {
    PENDING_OPEN: 'pending_open',
    ACTIVE: 'active',
    PENDING_CLOSE: 'pending_close',
    CLOSED: 'closed'
};

// Monitor channel state
function getChannelState(channelId) {
    const channel = lightningManager.channels.get(channelId);
    return channel ? channel.state : null;
}
```

## Error Handling

```javascript
try {
    const payment = await lightningManager.sendSparkLightning(invoice, amount);
} catch (error) {
    if (error.message.includes('No Spark Lightning route')) {
        // No route available
        console.error('Payment routing failed');
    } else if (error.message.includes('insufficient balance')) {
        // Not enough channel balance
        console.error('Insufficient Lightning balance');
    } else if (error.message.includes('invoice expired')) {
        // Invoice has expired
        console.error('Invoice has expired');
    } else {
        // Other errors
        console.error('Lightning payment error:', error);
    }
}
```

## Performance Considerations

1. **Route Caching**: Routes are cached for 60 seconds
2. **Invoice Storage**: Invoices stored in memory with automatic cleanup
3. **Channel Updates**: Real-time channel balance updates
4. **QR Generation**: Async QR code generation to prevent blocking

## Security Best Practices

1. **Invoice Validation**: Always decode and validate invoices before payment
2. **Amount Verification**: Verify payment amounts match invoice
3. **Preimage Storage**: Store payment preimages as proof
4. **Channel Monitoring**: Monitor channel states for security

## Integration with Spark Protocol

The Lightning Manager integrates with Spark Protocol to provide:
- Instant Layer 2 to Lightning swaps
- Atomic swaps between chains
- Cross-protocol payment routing
- Unified balance management

## Dependencies

- Requires active Lightning node connection
- Works with `SparkWalletManager` for wallet operations
- Integrates with `SparkStateManager` for state updates

## Future Enhancements

- Multi-path payments (MPP) support
- Watchtower integration
- Submarine swaps
- Channel rebalancing automation
- Enhanced route finding algorithms