/**
 * Firecrawl configuration for MOOSH Wallet
 * Scrapes blockchain data and Ordinals info
 */
const Firecrawl = require('firecrawl').default || require('firecrawl');

class FirecrawlMCP {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.firecrawl = null;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
            try {
                this.firecrawl = new Firecrawl({ apiKey });
            } catch (e) {
                console.warn('Firecrawl initialization failed. Please check your API key.');
            }
        } else {
            console.warn('Firecrawl API key not configured. Get one from https://firecrawl.dev');
        }
    }

    async scrapeOrdinals(walletAddress) {
        if (!this.firecrawl) {
            console.warn('Firecrawl not initialized. Please set API key in .mcp-config.json');
            return null;
        }

        const cacheKey = `ordinals-${walletAddress}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const url = `https://ordinals.com/address/${walletAddress}`;
            const result = await this.firecrawl.scrape(url, {
                formats: ['markdown', 'html'],
                waitFor: 2000
            });

            const data = this.parseOrdinalsData(result);
            
            // Cache result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Firecrawl error:', error.message);
            return null;
        }
    }

    parseOrdinalsData(result) {
        // Parse inscription data from scraped content
        const content = result.markdown || result.html || '';
        
        // Basic parsing - would need refinement based on actual structure
        const inscriptionMatches = content.match(/inscription #\d+/gi) || [];
        
        return {
            inscriptions: inscriptionMatches.map(match => ({
                id: match.replace(/inscription #/i, ''),
                text: match
            })),
            totalCount: inscriptionMatches.length,
            rawContent: content.substring(0, 1000) // First 1000 chars for debugging
        };
    }

    async scrapeMarketData() {
        if (!this.firecrawl) {
            console.warn('Firecrawl not initialized');
            return { price: 0, volume: 0, marketCap: 0 };
        }

        try {
            // Scrape CoinGecko
            const url = 'https://www.coingecko.com/en/coins/bitcoin';
            const result = await this.firecrawl.scrape(url, {
                formats: ['markdown'],
                onlyMainContent: true
            });

            return this.parseMarketData(result);
        } catch (error) {
            console.error('Market data scrape failed:', error.message);
            return { price: 0, volume: 0, marketCap: 0 };
        }
    }

    parseMarketData(result) {
        const content = result.markdown || '';
        
        // Extract price (look for $ followed by numbers)
        const priceMatch = content.match(/\$([0-9,]+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
        
        return {
            price,
            volume: 0, // Would need more sophisticated parsing
            marketCap: 0,
            lastUpdated: new Date()
        };
    }

    async testConnection() {
        if (!this.firecrawl) {
            return {
                status: 'error',
                message: 'Firecrawl not initialized. Please configure API key.'
            };
        }

        try {
            // Test with a simple page
            const result = await this.firecrawl.scrape('https://example.com', {
                formats: ['markdown']
            });
            
            return {
                status: 'success',
                message: 'Firecrawl connection successful',
                test: result.markdown ? 'Content retrieved' : 'No content'
            };
        } catch (error) {
            return {
                status: 'error',
                message: `Firecrawl test failed: ${error.message}`
            };
        }
    }
}

module.exports = FirecrawlMCP;