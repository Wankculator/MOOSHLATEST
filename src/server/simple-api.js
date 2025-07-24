/**
 * Simplified API Server for MOOSH Wallet
 * Provides balance checking with multiple blockchain API providers
 * And wallet import functionality with full address derivation
 */

import https from 'https';
import { createServer } from 'http';
import { parse } from 'url';
import { importSparkCompatibleWallet } from './services/sparkCompatibleService.js';

const PORT = 3001;

// Balance cache
const balanceCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

// Helper function to make HTTPS requests
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'MOOSH-Wallet/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Invalid JSON'));
                    }
                }
            });
        }).on('error', reject);
    });
}

// Blockchain API providers
const PROVIDERS = {
    blockstream: async (address) => {
        const data = await httpsGet(`https://blockstream.info/api/address/${address}`);
        return (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
    },
    mempool: async (address) => {
        const data = await httpsGet(`https://mempool.space/api/address/${address}`);
        return (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
    }
};

// Get balance with fallback
async function getBalance(address) {
    // Check cache
    const cached = balanceCache.get(address);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[API] Returning cached balance for ${address}`);
        return cached.data;
    }

    // Try each provider
    for (const [name, provider] of Object.entries(PROVIDERS)) {
        try {
            console.log(`[API] Trying ${name} for ${address}`);
            const balance = await provider(address);
            const result = {
                success: true,
                data: {
                    address,
                    balance: balance.toFixed(8),
                    unconfirmed: '0.00000000',
                    total: balance.toFixed(8),
                    currency: 'BTC',
                    source: name
                }
            };
            
            // Cache result
            balanceCache.set(address, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
        } catch (error) {
            console.error(`[API] ${name} failed:`, error.message);
            continue;
        }
    }

    // All failed
    return {
        success: false,
        data: {
            address,
            balance: '0.00000000',
            unconfirmed: '0.00000000',
            total: '0.00000000',
            currency: 'BTC',
            error: 'All providers failed'
        }
    };
}

// Create HTTP server
const server = createServer(async (req, res) => {
    const { pathname } = parse(req.url);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Health check
    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'MOOSH Simple API' }));
        return;
    }
    
    // Balance endpoint
    const balanceMatch = pathname.match(/^\/api\/balance\/(.+)$/);
    if (balanceMatch && req.method === 'GET') {
        try {
            const address = balanceMatch[1];
            const result = await getBalance(address);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
        return;
    }
    
    // Import wallet endpoint
    if (pathname === '/api/spark/import' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { mnemonic } = JSON.parse(body);
                
                if (!mnemonic) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Mnemonic phrase is required'
                    }));
                    return;
                }
                
                console.log('[Import] Processing wallet import request...');
                const wallet = await importSparkCompatibleWallet(mnemonic);
                console.log('[Import] Wallet import successful, returning all addresses');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(wallet));
            } catch (error) {
                console.error('[Import] Wallet import error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
        return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
    console.log(`
🚀 MOOSH Simple API Server
========================
🌐 URL: http://localhost:${PORT}
📡 Health: http://localhost:${PORT}/health
🔧 Balance: GET /api/balance/{address}
🔑 Import: POST /api/spark/import
========================
    `);
});