#!/usr/bin/env node

/**
 * Firecrawl MCP Implementation for MOOSH Wallet
 * Web scraping for Ordinals data, blockchain explorers, and market data
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

class FirecrawlMCP {
    constructor() {
        this.apiKey = process.env.FIRECRAWL_API_KEY || '';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Scraping targets for MOOSH Wallet
        this.targets = {
            ordinals: {
                'ordinals.com': {
                    patterns: ['/inscription/*', '/sat/*', '/collection/*'],
                    selectors: {
                        inscription: '.inscription-content',
                        metadata: '.inscription-metadata',
                        owner: '.inscription-owner'
                    }
                },
                'ord.io': {
                    patterns: ['/*/inscription/*'],
                    selectors: {
                        content: '.inscription-preview',
                        details: '.inscription-details'
                    }
                }
            },
            blockchain: {
                'mempool.space': {
                    patterns: ['/tx/*', '/address/*', '/block/*'],
                    selectors: {
                        transaction: '.transaction-details',
                        fee: '.transaction-fee',
                        confirmations: '.confirmations'
                    }
                },
                'blockstream.info': {
                    patterns: ['/tx/*', '/address/*'],
                    selectors: {
                        txData: '.transaction-data',
                        balance: '.address-balance'
                    }
                }
            },
            market: {
                'coingecko.com': {
                    patterns: ['/en/coins/bitcoin'],
                    selectors: {
                        price: '.coin-price',
                        marketCap: '.market-cap',
                        volume: '.trading-volume'
                    }
                }
            }
        };
        
        // Rate limiting
        this.rateLimits = new Map();
        this.requestQueue = [];
        this.processing = false;
    }

    /**
     * Initialize Firecrawl MCP
     */
    async initialize() {
        console.log('🔥 Firecrawl MCP - Initializing web scraping service...\n');
        
        if (!this.apiKey) {
            console.log('⚠️  No Firecrawl API key found. Using basic scraping mode.');
            console.log('   Set FIRECRAWL_API_KEY environment variable for full features.\n');
        }
        
        // Test connectivity
        const testResult = await this.testConnectivity();
        if (testResult) {
            console.log('✅ Firecrawl MCP initialized successfully!\n');
            return true;
        } else {
            console.error('❌ Failed to initialize Firecrawl MCP\n');
            return false;
        }
    }

    /**
     * Test connectivity to target sites
     */
    async testConnectivity() {
        const testUrls = [
            'https://mempool.space/api/v1/fees/recommended',
            'https://api.coingecko.com/api/v3/ping'
        ];
        
        for (const url of testUrls) {
            try {
                await this.fetchUrl(url);
                console.log(`   ✅ Connected to ${new URL(url).hostname}`);
            } catch (error) {
                console.log(`   ❌ Failed to connect to ${new URL(url).hostname}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Scrape ordinals data
     */
    async scrapeOrdinals(inscriptionId) {
        console.log(`🎨 Scraping ordinals data for ${inscriptionId}...`);
        
        // Check cache
        const cacheKey = `ordinals:${inscriptionId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('   Using cached data');
            return cached;
        }
        
        const results = {
            inscriptionId,
            content: null,
            metadata: {},
            owner: null,
            collection: null,
            timestamp: Date.now()
        };
        
        try {
            // Try multiple sources
            for (const [site, config] of Object.entries(this.targets.ordinals)) {
                const url = `https://${site}/inscription/${inscriptionId}`;
                const data = await this.scrapePage(url, config.selectors);
                
                if (data) {
                    Object.assign(results, data);
                    break;
                }
            }
            
            // Cache results
            this.setCache(cacheKey, results);
            
            console.log('   ✅ Ordinals data scraped successfully');
            return results;
        } catch (error) {
            console.error('   ❌ Failed to scrape ordinals:', error.message);
            return null;
        }
    }

    /**
     * Scrape blockchain data
     */
    async scrapeBlockchain(type, identifier) {
        console.log(`⛓️  Scraping blockchain data for ${type}: ${identifier}...`);
        
        const cacheKey = `blockchain:${type}:${identifier}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('   Using cached data');
            return cached;
        }
        
        const results = {
            type,
            identifier,
            data: {},
            timestamp: Date.now()
        };
        
        try {
            // Use appropriate blockchain explorer
            const site = 'mempool.space';
            const config = this.targets.blockchain[site];
            const url = `https://${site}/${type}/${identifier}`;
            
            const data = await this.scrapePage(url, config.selectors);
            if (data) {
                results.data = data;
            }
            
            // Also try API if available
            const apiData = await this.fetchBlockchainAPI(type, identifier);
            if (apiData) {
                results.data = { ...results.data, ...apiData };
            }
            
            this.setCache(cacheKey, results);
            console.log('   ✅ Blockchain data scraped successfully');
            return results;
        } catch (error) {
            console.error('   ❌ Failed to scrape blockchain:', error.message);
            return null;
        }
    }

    /**
     * Scrape market data
     */
    async scrapeMarketData(coin = 'bitcoin') {
        console.log(`📈 Scraping market data for ${coin}...`);
        
        const cacheKey = `market:${coin}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('   Using cached data');
            return cached;
        }
        
        try {
            // Try API first
            const apiUrl = `https://api.coingecko.com/api/v3/coins/${coin}`;
            const apiData = await this.fetchUrl(apiUrl);
            
            if (apiData) {
                const parsed = JSON.parse(apiData);
                const results = {
                    coin,
                    price: parsed.market_data.current_price.usd,
                    marketCap: parsed.market_data.market_cap.usd,
                    volume24h: parsed.market_data.total_volume.usd,
                    priceChange24h: parsed.market_data.price_change_percentage_24h,
                    timestamp: Date.now()
                };
                
                this.setCache(cacheKey, results);
                console.log('   ✅ Market data fetched successfully');
                return results;
            }
            
            // Fallback to scraping
            const site = 'coingecko.com';
            const config = this.targets.market[site];
            const url = `https://www.${site}/en/coins/${coin}`;
            
            const data = await this.scrapePage(url, config.selectors);
            this.setCache(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('   ❌ Failed to scrape market data:', error.message);
            return null;
        }
    }

    /**
     * Scrape a web page
     */
    async scrapePage(url, selectors) {
        // If we have Firecrawl API key, use it
        if (this.apiKey) {
            return this.scrapeWithFirecrawl(url, selectors);
        }
        
        // Otherwise, use basic scraping
        return this.basicScrape(url, selectors);
    }

    /**
     * Scrape using Firecrawl API
     */
    async scrapeWithFirecrawl(url, selectors) {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                selectors: Object.values(selectors),
                waitForSelector: Object.values(selectors)[0],
                screenshot: false
            })
        };
        
        try {
            const response = await this.fetchUrl('https://api.firecrawl.dev/v1/scrape', options);
            return JSON.parse(response);
        } catch (error) {
            console.error('Firecrawl API error:', error);
            // Fallback to basic scraping
            return this.basicScrape(url, selectors);
        }
    }

    /**
     * Basic web scraping (without Firecrawl API)
     */
    async basicScrape(url, selectors) {
        try {
            const html = await this.fetchUrl(url);
            
            // Very basic parsing - in production, use a proper HTML parser
            const results = {};
            
            for (const [key, selector] of Object.entries(selectors)) {
                // Simple regex-based extraction (not recommended for production)
                const pattern = new RegExp(`${selector.replace('.', '\\.')}[^>]*>([^<]+)<`, 'i');
                const match = html.match(pattern);
                if (match) {
                    results[key] = match[1].trim();
                }
            }
            
            return results;
        } catch (error) {
            console.error('Basic scrape error:', error);
            return null;
        }
    }

    /**
     * Fetch blockchain data from API
     */
    async fetchBlockchainAPI(type, identifier) {
        const apis = {
            tx: `https://mempool.space/api/tx/${identifier}`,
            address: `https://mempool.space/api/address/${identifier}`,
            block: `https://mempool.space/api/block/${identifier}`
        };
        
        const url = apis[type];
        if (!url) return null;
        
        try {
            const data = await this.fetchUrl(url);
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    /**
     * Fetch URL with rate limiting
     */
    async fetchUrl(url, options = {}) {
        // Check rate limit
        const hostname = new URL(url).hostname;
        if (this.isRateLimited(hostname)) {
            throw new Error(`Rate limited for ${hostname}`);
        }
        
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol === 'https:' ? https : http;
            
            const requestOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {
                    'User-Agent': 'MOOSH-Wallet-Firecrawl/1.0'
                }
            };
            
            const req = protocol.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        this.updateRateLimit(hostname);
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            });
            
            req.on('error', reject);
            
            if (options.body) {
                req.write(options.body);
            }
            
            req.end();
        });
    }

    /**
     * Check if hostname is rate limited
     */
    isRateLimited(hostname) {
        const limit = this.rateLimits.get(hostname);
        if (!limit) return false;
        
        const timeSinceLastRequest = Date.now() - limit.lastRequest;
        return timeSinceLastRequest < limit.minInterval;
    }

    /**
     * Update rate limit tracking
     */
    updateRateLimit(hostname) {
        const limits = {
            'api.coingecko.com': 10000, // 10 seconds
            'mempool.space': 1000, // 1 second
            'ordinals.com': 5000, // 5 seconds
            'default': 2000 // 2 seconds
        };
        
        const minInterval = limits[hostname] || limits.default;
        
        this.rateLimits.set(hostname, {
            lastRequest: Date.now(),
            minInterval
        });
    }

    /**
     * Get from cache
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const age = Date.now() - cached.timestamp;
        if (age > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Set cache
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Batch scrape multiple items
     */
    async batchScrape(items) {
        console.log(`🔥 Batch scraping ${items.length} items...`);
        
        const results = [];
        
        for (const item of items) {
            try {
                let result;
                
                switch (item.type) {
                    case 'ordinals':
                        result = await this.scrapeOrdinals(item.id);
                        break;
                    case 'blockchain':
                        result = await this.scrapeBlockchain(item.subtype, item.id);
                        break;
                    case 'market':
                        result = await this.scrapeMarketData(item.coin);
                        break;
                    default:
                        result = null;
                }
                
                results.push({ ...item, result });
                
                // Respect rate limits
                await this.sleep(1000);
            } catch (error) {
                results.push({ ...item, error: error.message });
            }
        }
        
        console.log(`   ✅ Batch scraping completed: ${results.filter(r => r.result).length}/${items.length} successful`);
        return results;
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get scraping statistics
     */
    getStats() {
        const stats = {
            cacheSize: this.cache.size,
            rateLimits: {},
            performance: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0
            }
        };
        
        for (const [hostname, limit] of this.rateLimits) {
            stats.rateLimits[hostname] = {
                lastRequest: new Date(limit.lastRequest).toISOString(),
                minInterval: limit.minInterval
            };
        }
        
        return stats;
    }
}

// CLI interface
if (require.main === module) {
    const firecrawl = new FirecrawlMCP();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    async function run() {
        await firecrawl.initialize();
        
        switch (command) {
            case 'ordinals':
                const inscriptionId = args[1];
                if (!inscriptionId) {
                    console.error('Usage: node firecrawl.js ordinals <inscription-id>');
                    process.exit(1);
                }
                const ordinalsData = await firecrawl.scrapeOrdinals(inscriptionId);
                console.log(JSON.stringify(ordinalsData, null, 2));
                break;
                
            case 'blockchain':
                const type = args[1];
                const id = args[2];
                if (!type || !id) {
                    console.error('Usage: node firecrawl.js blockchain <tx|address|block> <id>');
                    process.exit(1);
                }
                const blockchainData = await firecrawl.scrapeBlockchain(type, id);
                console.log(JSON.stringify(blockchainData, null, 2));
                break;
                
            case 'market':
                const coin = args[1] || 'bitcoin';
                const marketData = await firecrawl.scrapeMarketData(coin);
                console.log(JSON.stringify(marketData, null, 2));
                break;
                
            case 'stats':
                const stats = firecrawl.getStats();
                console.log(JSON.stringify(stats, null, 2));
                break;
                
            default:
                console.log('Firecrawl MCP - Web scraping for MOOSH Wallet');
                console.log('\nUsage:');
                console.log('  node firecrawl.js ordinals <inscription-id>');
                console.log('  node firecrawl.js blockchain <tx|address|block> <id>');
                console.log('  node firecrawl.js market [coin]');
                console.log('  node firecrawl.js stats');
        }
    }
    
    run().catch(console.error);
}

module.exports = FirecrawlMCP;