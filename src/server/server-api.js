const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import services - use mock wallet service as fallback
let generateSparkWallet, importSparkWallet;
try {
    const sparkService = require('./services/sparkWalletService.js');
    generateSparkWallet = sparkService.generateSparkWallet;
    importSparkWallet = sparkService.importSparkWallet;
} catch (err) {
    console.log('⚠️ Using mock wallet service');
    const mockService = require('./services/mockWalletService.js');
    generateSparkWallet = mockService.generateSparkWallet;
    importSparkWallet = mockService.importSparkWallet;
}

const { getAddressBalance, getTransactionHistory } = require('./services/simpleBalanceService.js');
const { getNetworkInfo } = require('./services/simpleNetworkService.js');

// Configuration
const PORT = process.env.PORT || 3001;
const ROOT_DIR = path.join(__dirname, '../..');
const PUBLIC_DIR = path.join(__dirname, '../../public');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ═══════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════

// Generate new Spark wallet
app.post('/api/spark/generate', async (req, res) => {
    try {
        console.log('🔑 Generating new Spark wallet...');
        const { network = 'MAINNET', strength = 128 } = req.body; // Default to 12 words (128 bits)
        console.log(`   Strength: ${strength} bits (${strength === 256 ? '24' : '12'} words)`);
        const walletData = await generateSparkWallet(network, strength);
        
        if (walletData.success) {
            console.log('✅ Wallet generated successfully');
            res.json(walletData);
        } else {
            console.error('❌ Wallet generation failed:', walletData.error);
            res.status(500).json(walletData);
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Import existing wallet from seed phrase
app.post('/api/spark/import', async (req, res) => {
    try {
        console.log('📥 Importing Spark wallet...');
        const { mnemonic, network = 'MAINNET' } = req.body;
        
        if (!mnemonic) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mnemonic phrase is required' 
            });
        }
        
        const walletData = await importSparkWallet(mnemonic, network);
        
        if (walletData.success) {
            console.log('✅ Wallet imported successfully');
            res.json(walletData);
        } else {
            console.error('❌ Wallet import failed:', walletData.error);
            res.status(400).json(walletData);
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get address balance
app.get('/api/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { network = 'mainnet' } = req.query;
        
        console.log(`💰 Fetching balance for ${address} on ${network}...`);
        const balanceData = await getAddressBalance(address, network);
        
        res.json(balanceData);
    } catch (error) {
        console.error('❌ Balance API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get transaction history
app.get('/api/transactions/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { network = 'mainnet', limit = 10 } = req.query;
        
        console.log(`📜 Fetching transactions for ${address}...`);
        const transactions = await getTransactionHistory(address, network, parseInt(limit));
        
        res.json({
            success: true,
            address,
            transactions
        });
    } catch (error) {
        console.error('❌ Transaction API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get network info
app.get('/api/network/info', async (req, res) => {
    try {
        const { network = 'mainnet' } = req.query;
        
        console.log(`🌐 Fetching network info for ${network}...`);
        const networkInfo = await getNetworkInfo(network);
        
        res.json({
            success: true,
            ...networkInfo
        });
    } catch (error) {
        console.error('❌ Network API Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        apis: {
            spark: 'ready',
            bitcoin: 'ready',
            network: 'ready'
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════
// STATIC FILE SERVING (Fallback to React routes)
// ═══════════════════════════════════════════════════════════════════════

// Handle logo requests
app.get('*/Moosh_logo.png', (req, res) => {
    const logoPath = path.join(__dirname, '../../04_ASSETS/Brand_Assets/Logos/Moosh_logo.png');
    if (fs.existsSync(logoPath)) {
        res.sendFile(logoPath);
    } else {
        res.status(404).send('Logo not found');
    }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ═══════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ═══════════════════════════════════════════════════════════════════════
// SERVER INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 MOOSH Wallet API Server - Enhanced Edition
============================================
🌐 Local:    http://localhost:${PORT}
🌐 Network:  http://0.0.0.0:${PORT}
📁 Serving:  ${PUBLIC_DIR}
🕐 Started:  ${new Date().toISOString()}
💻 Mode:     API + Static Server
🔌 APIs:     /api/spark/*, /api/balance/*, /api/network/*
============================================

Available endpoints:
  POST /api/spark/generate        - Generate new Spark wallet
  POST /api/spark/import          - Import from seed phrase
  GET  /api/balance/:address      - Get address balance
  GET  /api/transactions/:address - Get transaction history
  GET  /api/network/info          - Get network information
  GET  /api/health                - Health check
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
    }
});

module.exports = app;