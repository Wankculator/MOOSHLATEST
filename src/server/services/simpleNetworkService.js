/**
 * Simple Network Service
 * Provides network information without external dependencies
 */

const https = require('https');

// Simple fetch wrapper
const fetch = (url) => {
    return new Promise((resolve, reject) => {
        const urlParts = new URL(url);
        https.get({
            hostname: urlParts.hostname,
            path: urlParts.pathname + urlParts.search,
            headers: {
                'User-Agent': 'MOOSH-Wallet/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
};

/**
 * Get comprehensive network information
 */
async function getNetworkInfo(network = 'mainnet') {
    try {
        const [blockHeight, fees, price] = await Promise.all([
            getBlockHeight(network),
            getFeeEstimates(),
            getBitcoinPrice()
        ]);

        return {
            success: true,
            status: {
                connected: true,
                network,
                blockHeight,
                latency: 0
            },
            blockHeight,
            fees,
            mempool: {
                size: Math.floor(Math.random() * 20000) + 5000, // Mock data
                bytes: Math.floor(Math.random() * 50000000) + 10000000,
                totalFees: 0.5,
                feeHistogram: []
            },
            price,
            recentBlocks: [],
            mempoolCongestion: 'medium',
            recommendedFee: {
                priority: 'medium',
                satsPerByte: fees.medium,
                estimatedTime: '30-60 minutes'
            },
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Network info error:', error);
        return {
            success: false,
            error: error.message,
            status: {
                connected: false,
                network,
                blockHeight: 0,
                latency: 0
            }
        };
    }
}

/**
 * Get current block height
 */
async function getBlockHeight(network = 'mainnet') {
    try {
        const baseUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api' 
            : 'https://blockstream.info/api';
        
        const height = await fetch(`${baseUrl}/blocks/tip/height`);
        return parseInt(height) || 0;
    } catch (error) {
        console.error('Block height error:', error);
        return 0;
    }
}

/**
 * Get fee estimates
 */
async function getFeeEstimates() {
    try {
        const fees = await fetch('https://mempool.space/api/v1/fees/recommended');
        return {
            fast: fees.fastestFee || 20,
            medium: fees.halfHourFee || 10,
            slow: fees.hourFee || 5,
            economy: fees.economyFee || 3
        };
    } catch (error) {
        console.error('Fee estimate error:', error);
        // Return default fees
        return {
            fast: 20,
            medium: 10,
            slow: 5,
            economy: 3
        };
    }
}

/**
 * Get Bitcoin price
 */
async function getBitcoinPrice() {
    try {
        const data = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp&include_24hr_change=true&include_24hr_vol=true');
        
        return {
            usd: data.bitcoin.usd || 0,
            eur: data.bitcoin.eur || 0,
            gbp: data.bitcoin.gbp || 0,
            change24h: data.bitcoin.usd_24h_change || 0,
            volume24h: data.bitcoin.usd_24h_vol || 0
        };
    } catch (error) {
        console.error('Price fetch error:', error);
        // Return mock data if API fails
        return {
            usd: 45000,
            eur: 41000,
            gbp: 36000,
            change24h: 2.5,
            volume24h: 20000000000
        };
    }
}

module.exports = {
    getNetworkInfo,
    getBlockHeight,
    getFeeEstimates,
    getBitcoinPrice
};