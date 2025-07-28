/**
 * MOOSH Wallet API Server
 * Provides wallet generation and management endpoints
 */

import express from 'express';
import cors from 'cors';
import * as bip39 from 'bip39';
import { generateMnemonic, generateBitcoinWallet, generateSparkAddress, importWallet, validateAddress } from './services/walletService.js';
import { generateSparkCompatibleWallet, importSparkCompatibleWallet, getBalance, getTransactions } from './services/sparkCompatibleService.js';
import { walletExportService } from './services/walletExportService.js';
import { walletImportService } from './services/walletImportService.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Parse origin to check if it's localhost/127.0.0.1
        try {
            const url = new URL(origin);
            const hostname = url.hostname;
            const port = url.port;
            
            // Allow localhost and 127.0.0.1 on any port
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // In production, enforce HTTPS
                if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
                    return callback(new Error('HTTPS required in production'));
                }
                
                // Check allowed ports
                const allowedPorts = ['3000', '3001', '3030', '3333', '5173'];
                if (allowedPorts.includes(port) || !port) {
                    return callback(null, true);
                }
            }
            
            // In production, add your domain here
            if (process.env.NODE_ENV === 'production') {
                const allowedDomains = process.env.ALLOWED_ORIGINS?.split(',') || [];
                if (allowedDomains.includes(origin)) {
                    return callback(null, true);
                }
            }
            
            // Default: reject
            callback(new Error('Not allowed by CORS'));
        } catch (e) {
            callback(new Error('Invalid origin'));
        }
    },
    credentials: true, // Allow cookies and credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'MOOSH Wallet API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'MOOSH Wallet API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Session endpoints
app.get('/api/session/check', (req, res) => {
    res.json({
        active: false,
        walletData: null
    });
});

app.post('/api/session/create', (req, res) => {
    res.json({
        success: true,
        sessionId: Date.now().toString()
    });
});

app.post('/api/session/destroy', (req, res) => {
    res.json({
        success: true
    });
});

// Generate new wallet
app.post('/api/wallet/generate', async (req, res) => {
    try {
        const { wordCount = 12, network = 'MAINNET' } = req.body;
        const strength = wordCount === 24 ? 256 : 128;
        
        // Generate mnemonic
        const mnemonic = generateMnemonic(strength);
        
        // Generate wallets
        const bitcoinWallet = await generateBitcoinWallet(mnemonic, network);
        const sparkWallet = generateSparkAddress(mnemonic);
        
        res.json({
            success: true,
            data: {
                mnemonic: mnemonic.split(' '),
                wordCount,
                network,
                bitcoin: {
                    addresses: {
                        segwit: bitcoinWallet.addresses.segwit.address,
                        taproot: bitcoinWallet.addresses.taproot.address,
                        legacy: bitcoinWallet.addresses.legacy.address,
                        nestedSegwit: bitcoinWallet.addresses.nestedSegwit.address
                    },
                    paths: {
                        segwit: bitcoinWallet.addresses.segwit.path,
                        taproot: bitcoinWallet.addresses.taproot.path,
                        legacy: bitcoinWallet.addresses.legacy.path,
                        nestedSegwit: bitcoinWallet.addresses.nestedSegwit.path
                    },
                    privateKeys: {
                        segwit: bitcoinWallet.addresses.segwit.privateKey,
                        taproot: bitcoinWallet.addresses.taproot.privateKey,
                        legacy: bitcoinWallet.addresses.legacy.privateKey,
                        nestedSegwit: bitcoinWallet.addresses.nestedSegwit.privateKey
                    },
                    xpub: bitcoinWallet.xpub
                },
                spark: sparkWallet
            }
        });
    } catch (error) {
        console.error('Wallet generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Import existing wallet
app.post('/api/wallet/import', async (req, res) => {
    try {
        const { mnemonic, network = 'MAINNET', walletType } = req.body;
        
        if (!mnemonic) {
            return res.status(400).json({
                success: false,
                error: 'Mnemonic phrase is required'
            });
        }
        
        const mnemonicString = Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic;
        
        const wallet = await importWallet(mnemonicString, network);
        
        // Ensure all Bitcoin address types are included in the response
        const response = {
            success: true,
            data: {
                mnemonic: wallet.bitcoin.mnemonic,
                bitcoin: {
                    addresses: {
                        segwit: wallet.bitcoin.addresses.segwit.address,
                        taproot: wallet.bitcoin.addresses.taproot.address,
                        legacy: wallet.bitcoin.addresses.legacy.address,
                        nestedSegwit: wallet.bitcoin.addresses.nestedSegwit.address
                    },
                    paths: {
                        segwit: wallet.bitcoin.addresses.segwit.path,
                        taproot: wallet.bitcoin.addresses.taproot.path,
                        legacy: wallet.bitcoin.addresses.legacy.path,
                        nestedSegwit: wallet.bitcoin.addresses.nestedSegwit.path
                    },
                    privateKeys: {
                        segwit: wallet.bitcoin.addresses.segwit.privateKey,
                        taproot: wallet.bitcoin.addresses.taproot.privateKey,
                        legacy: wallet.bitcoin.addresses.legacy.privateKey,
                        nestedSegwit: wallet.bitcoin.addresses.nestedSegwit.privateKey
                    }
                },
                spark: wallet.spark,
                walletType: walletType || 'auto-detected'
            }
        };
        
        console.log('[API] Import wallet response:', response.data);
        res.json(response);
    } catch (error) {
        console.error('Wallet import error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get UTXOs for a Bitcoin address
app.get('/api/bitcoin/utxos/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required'
            });
        }
        
        // For now, return mock UTXOs for testing
        // In production, this would query a Bitcoin node or blockchain API
        const mockUtxos = [
            {
                txid: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                vout: 0,
                value: 100000, // 0.001 BTC in satoshis
                confirmations: 6
            },
            {
                txid: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
                vout: 1,
                value: 50000, // 0.0005 BTC in satoshis
                confirmations: 3
            }
        ];
        
        res.json({
            success: true,
            data: mockUtxos
        });
    } catch (error) {
        console.error('Error fetching UTXOs:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Broadcast a signed Bitcoin transaction
app.post('/api/bitcoin/broadcast', async (req, res) => {
    try {
        const { hex } = req.body;
        
        if (!hex) {
            return res.status(400).json({
                success: false,
                error: 'Transaction hex is required'
            });
        }
        
        // Validate hex format
        if (!/^[0-9a-fA-F]+$/.test(hex)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction hex format'
            });
        }
        
        // In production, this would broadcast to the Bitcoin network
        // For now, simulate a successful broadcast
        const txId = crypto.createHash('sha256').update(hex).digest('hex');
        
        console.log(`[Bitcoin] Broadcasting transaction: ${txId.substring(0, 10)}...`);
        
        res.json({
            success: true,
            data: {
                txId: txId,
                message: 'Transaction broadcast successfully'
            }
        });
    } catch (error) {
        console.error('Error broadcasting transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get Bitcoin transaction history for an address
app.get('/api/bitcoin/transactions/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required'
            });
        }
        
        // For now, return mock transaction history
        // In production, this would query a Bitcoin node or blockchain API
        const mockTransactions = [
            {
                txid: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
                type: 'receive',
                amount: 100000,
                fee: 0,
                confirmations: 12,
                timestamp: Date.now() - 86400000, // 1 day ago
                from: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
                to: [address],
                status: 'confirmed'
            },
            {
                txid: 'def456abc123def456abc123def456abc123def456abc123def456abc123def4',
                type: 'send',
                amount: 50000,
                fee: 1000,
                confirmations: 6,
                timestamp: Date.now() - 172800000, // 2 days ago
                from: [address],
                to: ['bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
                status: 'confirmed'
            }
        ];
        
        res.json({
            success: true,
            data: {
                transactions: mockTransactions.slice(offset, offset + limit),
                total: mockTransactions.length,
                limit,
                offset
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Detect wallet type from mnemonic
app.post('/api/wallet/detect', async (req, res) => {
    try {
        const { mnemonic, knownAddress } = req.body;
        
        if (!mnemonic) {
            return res.status(400).json({
                success: false,
                error: 'Mnemonic phrase is required'
            });
        }
        
        const mnemonicString = Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic;
        const wallet = await generateBitcoinWallet(mnemonicString);
        
        let detectedType = 'unknown';
        let matchedAddress = null;
        
        if (knownAddress && wallet.taprootVariants) {
            for (const [walletType, variant] of Object.entries(wallet.taprootVariants)) {
                if (variant.address === knownAddress) {
                    detectedType = walletType;
                    matchedAddress = variant;
                    break;
                }
            }
        }
        
        res.json({
            success: true,
            data: {
                detectedType,
                matchedAddress,
                allVariants: wallet.taprootVariants,
                standardAddresses: wallet.addresses
            }
        });
    } catch (error) {
        console.error('Wallet detection error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Validate address
app.post('/api/wallet/validate', (req, res) => {
    try {
        const { address, type = 'bitcoin' } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required'
            });
        }
        
        const isValid = validateAddress(address, type);
        
        res.json({
            success: true,
            data: {
                address,
                type,
                isValid
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate new Spark wallet - Main endpoint used by UI
app.post('/api/spark/generate-wallet', async (req, res) => {
    try {
        const { strength = 256 } = req.body; // Default to 24 words
        const wallet = await generateSparkCompatibleWallet(strength);
        res.json(wallet);
    } catch (error) {
        console.error('Spark wallet generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Import Spark wallet
app.post('/api/spark/import', async (req, res) => {
    try {
        const { mnemonic } = req.body;
        
        if (!mnemonic) {
            return res.status(400).json({
                success: false,
                error: 'Mnemonic phrase is required'
            });
        }
        
        const wallet = await importSparkCompatibleWallet(mnemonic);
        res.json(wallet);
    } catch (error) {
        console.error('Spark wallet import error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get balance for address
app.get('/api/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await getBalance(address);
        res.json(balance);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transactions for address
app.get('/api/transactions/:address', (req, res) => {
    try {
        const { address } = req.params;
        const transactions = getTransactions(address);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate Spark address - handles both new generation and from existing mnemonic
app.post('/api/spark/generate', async (req, res) => {
    try {
        const { mnemonic, strength } = req.body;
        
        // If strength is provided, generate new wallet
        if (strength) {
            const wallet = await generateSparkCompatibleWallet(strength);
            res.json(wallet);
        } 
        // If mnemonic is provided, generate from existing
        else if (mnemonic) {
            const mnemonicString = Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic;
            const sparkWallet = generateSparkAddress(mnemonicString);
            res.json({
                success: true,
                data: sparkWallet
            });
        } 
        else {
            return res.status(400).json({
                success: false,
                error: 'Either mnemonic or strength is required'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper to normalize content types with enhanced detection
const normalizeContentType = (type) => {
    if (!type || type === 'unknown') {
        return 'application/octet-stream';
    }
    
    // Handle common variations
    const normalized = type.toLowerCase().trim();
    
    // Image types
    if (normalized.includes('svg')) return 'image/svg+xml';
    if (normalized.includes('webp')) return 'image/webp';
    if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'image/jpeg';
    if (normalized.includes('png')) return 'image/png';
    if (normalized.includes('gif')) return 'image/gif';
    if (normalized.includes('avif')) return 'image/avif';
    
    // 3D Model types - IMPORTANT FOR ORDINALS
    if (normalized.includes('gltf-binary') || normalized.includes('glb')) return 'model/gltf-binary';
    if (normalized.includes('gltf+json') || normalized.includes('gltf')) return 'model/gltf+json';
    if (normalized.includes('obj')) return 'model/obj';
    if (normalized.includes('stl')) return 'model/stl';
    
    // Audio types
    if (normalized.includes('mp3') || normalized.includes('mpeg')) return 'audio/mpeg';
    if (normalized.includes('wav')) return 'audio/wav';
    if (normalized.includes('ogg')) return 'audio/ogg';
    if (normalized.includes('m4a')) return 'audio/mp4';
    
    // Video types
    if (normalized.includes('mp4')) return 'video/mp4';
    if (normalized.includes('webm')) return 'video/webm';
    if (normalized.includes('avi')) return 'video/avi';
    
    // Document types
    if (normalized.includes('pdf')) return 'application/pdf';
    if (normalized.includes('json')) return 'application/json';
    if (normalized.includes('xml')) return 'application/xml';
    
    // Text types
    if (normalized.includes('html')) return 'text/html';
    if (normalized.includes('css')) return 'text/css';
    if (normalized.includes('javascript') || normalized.includes('js')) return 'application/javascript';
    if (normalized.includes('text/plain') || normalized.includes('txt')) return 'text/plain';
    if (normalized.includes('markdown') || normalized.includes('md')) return 'text/markdown';
    
    // Binary/unknown types
    if (normalized === 'application/octet-stream' || !normalized.includes('/')) {
        return 'application/octet-stream';
    }
    
    return normalized;
};

// Get Ordinals inscriptions for a Taproot address
app.post('/api/ordinals/inscriptions', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Taproot address is required'
            });
        }
        
        if (!address.startsWith('bc1p')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Taproot address. Must start with bc1p'
            });
        }

        console.log(`[Ordinals API] Checking inscriptions for address: ${address}`);
        
        // Try to get ALL inscriptions with pagination
        let allInscriptions = [];
        let apiUsed = null;
        
        // First try Hiro with pagination
        try {
            console.log('[Ordinals API] Trying Hiro API with pagination...');
            let offset = 0;
            let hasMore = true;
            
            while (hasMore && offset < 1000) { // Safety limit
                const url = `https://api.hiro.so/ordinals/v1/inscriptions?address=${address}&limit=60&offset=${offset}`;
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    signal: AbortSignal.timeout(10000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const batch = data.results || [];
                    
                    if (batch.length === 0) {
                        hasMore = false;
                    } else {
                        allInscriptions = allInscriptions.concat(batch.map(ins => ({
                            id: ins.id || '',
                            number: ins.number || ins.inscription_number || 0,
                            content_type: normalizeContentType(ins.mime_type || ins.content_type || 'unknown'),
                            content_length: ins.content_length || ins.value || 0,
                            timestamp: ins.timestamp ? new Date(ins.timestamp).getTime() : Date.now(),
                            fee: ins.genesis_fee || ins.fee || 0,
                            sat: ins.sat_ordinal || ins.sat || 0,
                            genesis_height: ins.genesis_block_height || ins.block_height || 0,
                            genesis_fee: ins.genesis_fee || ins.fee || 0,
                            output_value: ins.value || ins.output_value || 0,
                            location: ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${ins.id}`,
                            preview: `https://ordinals.com/preview/${ins.id}`,
                            owner: ins.address || address
                        })));
                        
                        offset += batch.length;
                        console.log(`[Ordinals API] Fetched ${allInscriptions.length} inscriptions so far...`);
                        
                        // Check if we got less than limit, meaning no more data
                        if (batch.length < 60) {
                            hasMore = false;
                        }
                    }
                } else {
                    break;
                }
            }
            
            if (allInscriptions.length > 0) {
                apiUsed = 'hiro-paginated';
                console.log(`[Ordinals API] Total inscriptions fetched: ${allInscriptions.length}`);
                res.json({
                    success: true,
                    data: {
                        address,
                        total: allInscriptions.length,
                        inscriptions: allInscriptions,
                        apiUsed
                    }
                });
                return;
            }
        } catch (error) {
            console.log('[Ordinals API] Hiro pagination failed:', error.message);
        }
        
        // Fallback to single request endpoints
        const endpoints = [
            {
                url: `https://ordapi.xyz/address/${address}/inscriptions`,
                name: 'ordapi-simple',
                headers: {
                    'Accept': 'application/json'
                }
            }
        ];
        
        let inscriptions = [];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`[Ordinals API] Trying ${endpoint.name}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(endpoint.url, {
                    signal: controller.signal,
                    headers: {
                        ...endpoint.headers,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(`[Ordinals API] ${endpoint.name} returned ${response.status}: ${errorText.substring(0, 200)}`);
                    continue;
                }
                
                const data = await response.json();
                console.log(`[Ordinals API] ${endpoint.name} returned data:`, data ? 'yes' : 'no');
                console.log(`[Ordinals API] ${endpoint.name} data structure:`, {
                    hasData: !!data,
                    hasResults: !!(data && data.results),
                    hasDataField: !!(data && data.data),
                    isArray: Array.isArray(data),
                    keys: data ? Object.keys(data) : []
                });
                
                // Log sample data to understand structure
                if (data) {
                    const sample = Array.isArray(data) ? data[0] : (data.results?.[0] || data.data?.[0] || data.inscriptions?.[0]);
                    if (sample) {
                        console.log(`[Ordinals API] ${endpoint.name} sample inscription:`, JSON.stringify(sample, null, 2));
                    }
                }
                
                if (endpoint.name === 'unisat' || endpoint.name === 'unisat-open') {
                    // Unisat API format
                    const items = data.data?.inscription || data.list || data.inscriptions || [];
                    inscriptions = items.map(ins => {
                        const inscriptionId = ins.inscriptionId || ins.id;
                        return {
                            id: inscriptionId,
                            number: ins.inscriptionNumber || ins.number || 0,
                            content_type: normalizeContentType(ins.contentType || ins.content_type || 'unknown'),
                            content_length: ins.contentLength || ins.size || 0,
                            timestamp: ins.timestamp || ins.timeStamp || Date.now(),
                            fee: ins.fee || 0,
                            sat: ins.offset || ins.sat || 0,
                            genesis_height: ins.height || ins.genesisHeight || 0,
                            genesis_fee: ins.fee || 0,
                            output_value: ins.outputValue || ins.value || 0,
                            location: ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${inscriptionId}`,
                            preview: `https://ordinals.com/preview/${inscriptionId}`,
                            owner: address
                        };
                    });
                    apiUsed = 'unisat';
                    if (inscriptions.length > 0) break;
                } else if (endpoint.name === 'ordiscan') {
                    console.log(`[Ordinals API] Ordiscan raw response:`, JSON.stringify(data).substring(0, 500));
                    const items = data.data || data.inscriptions || [];
                    inscriptions = items.map(ins => {
                        const inscriptionId = ins.id || ins.inscription_id;
                        console.log(`[Ordinals API] Processing inscription: ${inscriptionId}`);
                        return {
                            id: inscriptionId,
                            number: ins.number || ins.inscription_number || 0,
                            content_type: normalizeContentType(ins.mime_type || ins.content_type || ins.contentType || 'unknown'),
                            content_length: ins.content_length || ins.size || ins.file_size || 0,
                            timestamp: ins.created_at ? new Date(ins.created_at).getTime() : Date.now(),
                            fee: ins.fee || 0,
                            sat: ins.sat || ins.satoshi || 0,
                            genesis_height: ins.genesis_height || ins.block_height || 0,
                            genesis_fee: ins.genesis_fee || ins.fee || 0,
                            output_value: ins.output_value || 0,
                            location: ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${inscriptionId}`,
                            preview: `https://ordinals.com/preview/${inscriptionId}`,
                            owner: address
                        };
                    });
                    apiUsed = 'ordiscan';
                    if (inscriptions.length > 0) break;
                } else if (endpoint.name === 'hiro') {
                    const items = data.results || [];
                    inscriptions = items.map(ins => {
                        const inscriptionId = ins.id || '';
                        // Extract actual content type and size from Hiro response
                        const contentType = ins.mime_type || ins.content_type || 'unknown';
                        const contentLength = ins.content_length || ins.value || 0;
                        const timestamp = ins.timestamp || ins.genesis_timestamp || ins.created_at;
                        
                        return {
                            id: inscriptionId,
                            number: ins.number || ins.inscription_number || 0,
                            content_type: normalizeContentType(contentType),
                            content_length: contentLength,
                            timestamp: timestamp ? new Date(timestamp).getTime() : Date.now(),
                            fee: ins.genesis_fee || ins.fee || 0,
                            sat: ins.sat_ordinal || ins.sat || 0,
                            genesis_height: ins.genesis_block_height || ins.block_height || 0,
                            genesis_fee: ins.genesis_fee || ins.fee || 0,
                            output_value: ins.value || ins.output_value || 0,
                            location: ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${inscriptionId}`,
                            preview: `https://ordinals.com/preview/${inscriptionId}`,
                            owner: ins.address || address
                        };
                    });
                    
                    console.log(`[Ordinals API] Hiro returned ${inscriptions.length} inscriptions`);
                    if (inscriptions.length > 0) {
                        console.log(`[Ordinals API] First inscription:`, inscriptions[0]);
                    }
                    
                    apiUsed = 'hiro';
                    if (inscriptions.length > 0) break;
                } else if (endpoint.name === 'ordinals.com') {
                    const items = Array.isArray(data) ? data : (data.inscriptions || data.results || []);
                    inscriptions = items.map(ins => {
                        const inscriptionId = ins.id || ins.inscription_id || '';
                        return {
                            id: inscriptionId,
                            number: ins.inscription_number || ins.number || 0,
                            content_type: normalizeContentType(ins.content_type || ins.mime_type || ins.contentType || 'unknown'),
                            content_length: ins.content_length || ins.size || 0,
                            timestamp: ins.timestamp || Date.now(),
                            fee: ins.fee || 0,
                            sat: ins.sat || 0,
                            genesis_height: ins.genesis_height || ins.block_height || 0,
                            genesis_fee: ins.genesis_fee || ins.fee || 0,
                            output_value: ins.output_value || ins.value || 0,
                            location: ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${inscriptionId}`,
                            preview: `https://ordinals.com/preview/${inscriptionId}`,
                            owner: address
                        };
                    });
                    apiUsed = 'ordinals.com';
                    if (inscriptions.length > 0) break;
                } else if (endpoint.name === 'ordapi-simple') {
                    // OrdAPI simple format
                    const items = Array.isArray(data) ? data : (data.inscriptions || data.results || []);
                    inscriptions = items.map(ins => {
                        const inscriptionId = ins.id || ins.inscription_id || ins.outpoint?.split(':')[0] + 'i0';
                        return {
                            id: inscriptionId,
                            number: ins.num || ins.number || ins.inscription_number || 0,
                            content_type: normalizeContentType(ins.content_type || ins.mime_type || ins.type || 'unknown'),
                            content_length: ins.content_length || ins.size || 0,
                            timestamp: ins.timestamp || ins.created_at || Date.now(),
                            fee: ins.fee || 0,
                            sat: ins.sat || 0,
                            genesis_height: ins.height || ins.block_height || 0,
                            genesis_fee: ins.fee || 0,
                            output_value: ins.value || 0,
                            location: ins.outpoint || ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${inscriptionId}`,
                            preview: `https://ordinals.com/preview/${inscriptionId}`,
                            owner: address
                        };
                    });
                    apiUsed = 'ordapi';
                    if (inscriptions.length > 0) break;
                } else if (endpoint.includes('ordapi')) {
                    inscriptions = (data.data || data || []).map(ins => ({
                        id: ins.id,
                        number: ins.number || ins.inscription_number,
                        content_type: normalizeContentType(ins.content_type || ins.mime_type || 'unknown'),
                        content_length: ins.content_length || 0,
                        timestamp: ins.timestamp ? new Date(ins.timestamp).getTime() : Date.now(),
                        fee: ins.genesis_fee || 0,
                        sat: ins.sat || 0,
                        genesis_height: ins.genesis_height || 0,
                        genesis_fee: ins.genesis_fee || 0,
                        output_value: ins.value || 0,
                        location: ins.location || `${address}:0:0`,
                        content: ins.content || null,
                        owner: address
                    }));
                    apiUsed = 'ordapi';
                    break;
                } else if (endpoint.name === 'ordiscan') {
                    console.log(`[Ordinals API] Ordiscan raw response:`, JSON.stringify(data).substring(0, 500));
                    const items = data.data || data.inscriptions || [];
                    inscriptions = items.map(ins => {
                        const inscriptionId = ins.id || ins.inscription_id;
                        console.log(`[Ordinals API] Processing inscription: ${inscriptionId}`);
                        return {
                            id: inscriptionId,
                            number: ins.number || ins.inscription_number || 0,
                            content_type: normalizeContentType(ins.mime_type || ins.content_type || ins.contentType || 'unknown'),
                            content_length: ins.content_length || ins.size || ins.file_size || 0,
                            timestamp: ins.created_at ? new Date(ins.created_at).getTime() : Date.now(),
                            fee: ins.fee || 0,
                            sat: ins.sat || ins.satoshi || 0,
                            genesis_height: ins.genesis_height || ins.block_height || 0,
                            genesis_fee: ins.genesis_fee || ins.fee || 0,
                            output_value: ins.output_value || 0,
                            location: ins.location || `${address}:0:0`,
                            content: `https://ordinals.com/content/${inscriptionId}`,
                            preview: `https://ordinals.com/preview/${inscriptionId}`,
                            owner: address
                        };
                    });
                    apiUsed = 'ordiscan';
                    if (inscriptions.length > 0) break;
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${endpoint}:`, error.message);
            }
        }
        
        if (inscriptions.length === 0) {
            console.log('[Ordinals API] No inscriptions found from any API');
        }
        
        res.json({
            success: true,
            data: {
                address,
                total: inscriptions.length,
                inscriptions: inscriptions,
                apiUsed: apiUsed || 'none'
            }
        });
        
    } catch (error) {
        console.error('Ordinals query error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test different derivation paths
app.post('/api/wallet/test-paths', async (req, res) => {
    try {
        const { mnemonic, customPath, addressCount = 5 } = req.body;
        
        if (!mnemonic) {
            return res.status(400).json({
                success: false,
                error: 'Mnemonic phrase is required'
            });
        }
        
        const mnemonicString = Array.isArray(mnemonic) ? mnemonic.join(' ') : mnemonic;
        
        // If custom path provided, generate addresses for that specific path
        if (customPath) {
            const addresses = [];
            const seed = await bip39.mnemonicToSeed(mnemonicString);
            const { HDKey } = await import('@scure/bip32');
            const bitcoin = await import('bitcoinjs-lib');
            const ecc = await import('tiny-secp256k1');
            bitcoin.initEccLib(ecc);
            const root = HDKey.fromMasterSeed(seed);
            const btcNetwork = bitcoin.networks.bitcoin;
            
            // Generate addresses for the custom path
            for (let i = 0; i < addressCount; i++) {
                try {
                    const fullPath = `${customPath}/0/${i}`;
                    const child = root.derive(fullPath);
                    
                    let address;
                    // Determine address type based on path
                    if (customPath.includes("84'")) {
                        // Native SegWit (bc1q...)
                        const { address: segwitAddr } = bitcoin.payments.p2wpkh({ 
                            pubkey: Buffer.from(child.publicKey),
                            network: btcNetwork 
                        });
                        address = segwitAddr;
                    } else if (customPath.includes("86'")) {
                        // Taproot (bc1p...)
                        const xOnlyPubkey = Buffer.from(child.publicKey.slice(1, 33));
                        const { address: taprootAddr } = bitcoin.payments.p2tr({ 
                            internalPubkey: xOnlyPubkey,
                            network: btcNetwork 
                        });
                        address = taprootAddr;
                    } else if (customPath.includes("49'")) {
                        // Nested SegWit (3...)
                        const { address: nestedAddr } = bitcoin.payments.p2sh({
                            redeem: bitcoin.payments.p2wpkh({ 
                                pubkey: Buffer.from(child.publicKey),
                                network: btcNetwork 
                            }),
                            network: btcNetwork
                        });
                        address = nestedAddr;
                    } else {
                        // Legacy (1...)
                        const { address: legacyAddr } = bitcoin.payments.p2pkh({ 
                            pubkey: Buffer.from(child.publicKey),
                            network: btcNetwork 
                        });
                        address = legacyAddr;
                    }
                    
                    addresses.push({
                        address,
                        index: i,
                        path: fullPath
                    });
                } catch (e) {
                    console.error(`Failed to generate address for path ${customPath}/0/${i}:`, e);
                }
            }
            
            return res.json({
                success: true,
                addresses,
                path: customPath
            });
        }
        
        // Original test-paths functionality
        const wallet = await generateBitcoinWallet(mnemonicString);
        
        const extraPaths = {
            "m/86'/0'/0'/0/0": null,
            "m/86'/0'/0'/0/1": null,
            "m/84'/0'/0'/0/0": null,
            "m/84'/0'/0'/0/1": null,
            "m/44'/0'/0'/0/0": null,
            "m/44'/0'/0'/0/1": null
        };
        
        const seed = await bip39.mnemonicToSeed(mnemonicString);
        const { HDKey } = await import('@scure/bip32');
        const bitcoin = await import('bitcoinjs-lib');
        const ecc = await import('tiny-secp256k1');
        bitcoin.initEccLib(ecc);
        const root = HDKey.fromMasterSeed(seed);
        const btcNetwork = bitcoin.networks.bitcoin;
        
        for (const path of Object.keys(extraPaths)) {
            try {
                const child = root.derive(path);
                const xOnlyPubkey = Buffer.from(child.publicKey).slice(1, 33);
                const { address } = bitcoin.payments.p2tr({ 
                    internalPubkey: xOnlyPubkey,
                    network: btcNetwork 
                });
                extraPaths[path] = address;
            } catch (e) {
                extraPaths[path] = `Error: ${e.message}`;
            }
        }
        
        res.json({
            success: true,
            data: {
                standardAddresses: wallet.addresses,
                taprootVariants: wallet.taprootVariants,
                extraPaths
            }
        });
    } catch (error) {
        console.error('Path testing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export wallet endpoint - OPERATION THUNDERSTRIKE
app.post('/api/wallet/export/:walletId', async (req, res) => {
    try {
        const { walletId } = req.params;
        const { password, format = 'json' } = req.body;
        
        if (!walletId) {
            return res.status(400).json({
                success: false,
                error: 'Wallet ID is required'
            });
        }
        
        if (!password || password.length < 12) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 12 characters'
            });
        }
        
        // In production, this would fetch wallet data from database
        // For now, we'll use mock data
        const walletData = {
            walletId: walletId,
            name: 'My Bitcoin Wallet',
            mnemonic: 'example mnemonic phrase here would be stored encrypted',
            network: 'MAINNET',
            addresses: {
                bitcoin: 'bc1q...',
                spark: 'sp1...'
            },
            privateKeys: {
                // These would be encrypted in production
                bitcoin: { wif: '...', hex: '...' },
                spark: { hex: '...' }
            },
            createdAt: new Date().toISOString()
        };
        
        const exportResult = await walletExportService.exportWallet(
            walletData,
            password,
            format
        );
        
        res.json(exportResult);
    } catch (error) {
        console.error('Export wallet error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Import wallet from encrypted backup
app.post('/api/wallet/import/encrypted', async (req, res) => {
    try {
        const { encryptedData, password } = req.body;
        
        if (!encryptedData) {
            return res.status(400).json({
                success: false,
                error: 'Encrypted data is required'
            });
        }
        
        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required'
            });
        }
        
        const importResult = await walletImportService.importWallet(
            encryptedData,
            password
        );
        
        res.json(importResult);
    } catch (error) {
        console.error('Import wallet error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Batch export multiple wallets
app.post('/api/wallet/export/batch', async (req, res) => {
    try {
        const { walletIds, password } = req.body;
        
        if (!walletIds || !Array.isArray(walletIds) || walletIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Wallet IDs array is required'
            });
        }
        
        if (!password || password.length < 12) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 12 characters'
            });
        }
        
        // In production, fetch wallet data from database
        // Mock data for demonstration
        const walletsData = {};
        for (const id of walletIds) {
            walletsData[id] = {
                walletId: id,
                name: `Wallet ${id}`,
                mnemonic: 'example mnemonic phrase',
                network: 'MAINNET',
                addresses: {
                    bitcoin: `bc1q...${id}`,
                    spark: `sp1...${id}`
                },
                privateKeys: {
                    bitcoin: { wif: '...', hex: '...' },
                    spark: { hex: '...' }
                }
            };
        }
        
        // Progress tracking
        const progressUpdates = [];
        const progressCallback = (progress) => {
            progressUpdates.push(progress);
            // In production, could send SSE or WebSocket updates
        };
        
        const batchResult = await walletExportService.exportMultiple(
            walletIds,
            walletsData,
            password,
            progressCallback
        );
        
        res.json(batchResult);
    } catch (error) {
        console.error('Batch export error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Batch import multiple wallets
app.post('/api/wallet/import/batch', async (req, res) => {
    try {
        const { batchData, password } = req.body;
        
        if (!batchData) {
            return res.status(400).json({
                success: false,
                error: 'Batch data is required'
            });
        }
        
        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required'
            });
        }
        
        // Progress tracking
        const progressUpdates = [];
        const progressCallback = (progress) => {
            progressUpdates.push(progress);
        };
        
        const importResult = await walletImportService.importBatch(
            batchData,
            password,
            progressCallback
        );
        
        res.json(importResult);
    } catch (error) {
        console.error('Batch import error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get available export formats
app.get('/api/wallet/export/formats', (req, res) => {
    res.json({
        success: true,
        formats: [
            {
                id: 'json',
                name: 'JSON File',
                description: 'Encrypted JSON file for easy backup and restore',
                fileExtension: '.json',
                recommended: true
            },
            {
                id: 'qr',
                name: 'QR Codes',
                description: 'Split into multiple QR codes for paper storage',
                fileExtension: '.json',
                maxSize: '2KB per QR code'
            },
            {
                id: 'paper',
                name: 'Paper Wallet',
                description: 'Printable HTML format for physical backup',
                fileExtension: '.html',
                features: ['Printable', 'Includes checksum', 'Offline storage']
            }
        ]
    });
});

// Validate import data before decryption
app.post('/api/wallet/validate-import', async (req, res) => {
    try {
        const { fileData } = req.body;
        
        if (!fileData) {
            return res.status(400).json({
                success: false,
                error: 'File data is required'
            });
        }
        
        const validationResult = await walletImportService.preValidateImport(fileData);
        
        res.json({
            success: true,
            validation: validationResult
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Process QR code chunks
app.post('/api/wallet/import/qr-chunks', async (req, res) => {
    try {
        const { chunks } = req.body;
        
        if (!chunks || !Array.isArray(chunks)) {
            return res.status(400).json({
                success: false,
                error: 'QR chunks array is required'
            });
        }
        
        const reassembled = await walletImportService.processQRChunks(chunks);
        
        res.json({
            success: true,
            data: reassembled
        });
    } catch (error) {
        console.error('QR processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Extract from paper wallet HTML
app.post('/api/wallet/import/paper', async (req, res) => {
    try {
        const { htmlContent } = req.body;
        
        if (!htmlContent) {
            return res.status(400).json({
                success: false,
                error: 'HTML content is required'
            });
        }
        
        const extracted = walletImportService.extractFromPaperWallet(htmlContent);
        
        res.json({
            success: true,
            data: extracted
        });
    } catch (error) {
        console.error('Paper wallet extraction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Proxy endpoints for external APIs to avoid CORS issues
app.get('/api/proxy/bitcoin-price', async (req, res) => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Bitcoin price proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/proxy/mempool/fees', async (req, res) => {
    try {
        const response = await fetch('https://mempool.space/api/v1/fees/recommended');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Mempool fees proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/proxy/mempool/blocks', async (req, res) => {
    try {
        const response = await fetch('https://mempool.space/api/blocks');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Mempool blocks proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Additional proxy endpoints for CORS compliance
app.get('/api/proxy/coingecko-price', async (req, res) => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('CoinGecko price proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/proxy/blockstream/address/:address/utxo', async (req, res) => {
    try {
        const { address } = req.params;
        const response = await fetch(`https://blockstream.info/api/address/${address}/utxo`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Blockstream UTXO proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/proxy/blockstream/fee-estimates', async (req, res) => {
    try {
        const response = await fetch('https://blockstream.info/api/fee-estimates');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Blockstream fee proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/proxy/bip39-wordlist', async (req, res) => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt');
        const text = await response.text();
        const words = text.trim().split('\n');
        res.json({ words });
    } catch (error) {
        console.error('BIP39 wordlist proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/proxy/blockchain/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
        const satoshis = await response.text();
        res.json({ 
            success: true,
            balance: satoshis.trim(),
            address: address
        });
    } catch (error) {
        console.error('Blockchain balance proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 MOOSH Wallet API Server
==========================
🌐 URL: https://localhost:${PORT}
📡 Health: https://localhost:${PORT}/health
🔧 Endpoints:
   POST /api/wallet/generate
   POST /api/wallet/import
   POST /api/wallet/validate
   POST /api/wallet/detect
   POST /api/wallet/test-paths
   POST /api/spark/generate
   POST /api/ordinals/inscriptions
==========================
    `);
});

// Error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Unhandled errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;