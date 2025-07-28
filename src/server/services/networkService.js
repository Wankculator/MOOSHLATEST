const https = require('https');

// Simple fetch wrapper using native https
const fetch = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ data: JSON.parse(data) });
                } catch (e) {
                    resolve({ data });
                }
            });
        }).on('error', reject);
    });
};

class NetworkService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
    this.network = process.env.BITCOIN_NETWORK || 'mainnet';
    
    // API endpoints configuration
    this.endpoints = {
      mainnet: {
        mempool: 'https://mempool.space/api',
        blockstream: 'https://blockstream.info/api',
        coingecko: 'https://api.coingecko.com/api/v3'
      },
      testnet: {
        mempool: 'https://mempool.space/testnet/api',
        blockstream: 'https://blockstream.info/testnet/api',
        coingecko: 'https://api.coingecko.com/api/v3' // Same for price data
      }
    };
  }

  /**
   * Get cached data or fetch new data
   */
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      // If fetch fails and we have cached data (even expired), return it
      if (cached) {
        console.warn(`Using expired cache for ${key} due to error:`, error.message);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get current block height
   */
  async getBlockHeight() {
    return this.getCachedData('blockHeight', async () => {
      try {
        const response = await fetch(
          `${this.endpoints[this.network].mempool}/blocks/tip/height`,
          { timeout: 5000 }
        );
        return response.data;
      } catch (error) {
        // Fallback to blockstream
        const response = await fetch(
          `${this.endpoints[this.network].blockstream}/blocks/tip/height`,
          { timeout: 5000 }
        );
        return response.data;
      }
    });
  }

  /**
   * Get fee estimates for different confirmation targets
   */
  async getFeeEstimates() {
    return this.getCachedData('feeEstimates', async () => {
      try {
        const response = await fetch(
          `${this.endpoints[this.network].mempool}/v1/fees/recommended`,
          { timeout: 5000 }
        );
        
        return {
          fast: response.data.fastestFee,      // Next block
          medium: response.data.halfHourFee,   // ~30 minutes
          slow: response.data.hourFee,         // ~1 hour
          economy: response.data.economyFee    // Several hours
        };
      } catch (error) {
        // Fallback fee estimates based on network
        const fallbackFees = this.network === 'testnet' 
          ? { fast: 10, medium: 5, slow: 2, economy: 1 }
          : { fast: 30, medium: 20, slow: 10, economy: 5 };
        
        console.warn('Using fallback fee estimates:', error.message);
        return fallbackFees;
      }
    });
  }

  /**
   * Get mempool statistics
   */
  async getMempoolStats() {
    return this.getCachedData('mempoolStats', async () => {
      try {
        const response = await fetch(
          `${this.endpoints[this.network].mempool}/mempool`,
          { timeout: 5000 }
        );
        
        return {
          size: response.data.count || 0,
          bytes: response.data.vsize || 0,
          totalFees: response.data.total_fee || 0,
          feeHistogram: response.data.fee_histogram || []
        };
      } catch (error) {
        // Return default stats if API fails
        return {
          size: 0,
          bytes: 0,
          totalFees: 0,
          feeHistogram: []
        };
      }
    });
  }

  /**
   * Get Bitcoin price data
   */
  async getBitcoinPrice() {
    return this.getCachedData('bitcoinPrice', async () => {
      try {
        const response = await fetch(
          `${this.endpoints[this.network].coingecko}/simple/price`,
          {
            params: {
              ids: 'bitcoin',
              vs_currencies: 'usd,eur,gbp',
              include_24hr_change: true,
              include_24hr_vol: true
            },
            timeout: 5000
          }
        );
        
        const data = response.data.bitcoin;
        return {
          usd: data.usd,
          eur: data.eur,
          gbp: data.gbp,
          change24h: data.usd_24h_change,
          volume24h: data.usd_24h_vol
        };
      } catch (error) {
        console.warn('Failed to fetch Bitcoin price:', error.message);
        // Return null to indicate price unavailable
        return null;
      }
    });
  }

  /**
   * Check network connection status
   */
  async checkNetworkStatus() {
    try {
      // Try to fetch block height as a simple connectivity check
      const blockHeight = await this.getBlockHeight();
      return {
        connected: true,
        network: this.network,
        blockHeight,
        latency: 0 // Could implement actual latency measurement
      };
    } catch (error) {
      return {
        connected: false,
        network: this.network,
        error: error.message
      };
    }
  }

  /**
   * Get recent blocks
   */
  async getRecentBlocks(limit = 10) {
    return this.getCachedData(`recentBlocks_${limit}`, async () => {
      try {
        const response = await fetch(
          `${this.endpoints[this.network].mempool}/v1/blocks/0`,
          { timeout: 5000 }
        );
        
        return response.data.slice(0, limit).map(block => ({
          height: block.height,
          hash: block.id,
          timestamp: block.timestamp,
          txCount: block.tx_count,
          size: block.size,
          weight: block.weight,
          fees: block.fees,
          medianFee: block.medianFee
        }));
      } catch (error) {
        console.warn('Failed to fetch recent blocks:', error.message);
        return [];
      }
    });
  }

  /**
   * Get comprehensive network information
   */
  async getNetworkInfo() {
    try {
      // Fetch all data in parallel
      const [
        networkStatus,
        blockHeight,
        feeEstimates,
        mempoolStats,
        bitcoinPrice,
        recentBlocks
      ] = await Promise.allSettled([
        this.checkNetworkStatus(),
        this.getBlockHeight(),
        this.getFeeEstimates(),
        this.getMempoolStats(),
        this.getBitcoinPrice(),
        this.getRecentBlocks(5)
      ]);

      // Process results
      const info = {
        status: networkStatus.status === 'fulfilled' ? networkStatus.value : {
          connected: false,
          network: this.network,
          error: 'Network unreachable'
        },
        blockHeight: blockHeight.status === 'fulfilled' ? blockHeight.value : null,
        fees: feeEstimates.status === 'fulfilled' ? feeEstimates.value : {
          fast: 30,
          medium: 20,
          slow: 10,
          economy: 5
        },
        mempool: mempoolStats.status === 'fulfilled' ? mempoolStats.value : {
          size: 0,
          bytes: 0,
          totalFees: 0,
          feeHistogram: []
        },
        price: bitcoinPrice.status === 'fulfilled' ? bitcoinPrice.value : null,
        recentBlocks: recentBlocks.status === 'fulfilled' ? recentBlocks.value : [],
        timestamp: Date.now()
      };

      // Add computed properties
      info.mempoolCongestion = this.calculateCongestion(info.mempool);
      info.recommendedFee = this.getRecommendedFee(info.fees, info.mempoolCongestion);
      
      return info;
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error(`Network service error: ${error.message}`);
    }
  }

  /**
   * Calculate mempool congestion level
   */
  calculateCongestion(mempoolStats) {
    const mempoolSize = mempoolStats.size || 0;
    
    if (mempoolSize < 5000) return 'low';
    if (mempoolSize < 20000) return 'medium';
    if (mempoolSize < 50000) return 'high';
    return 'very-high';
  }

  /**
   * Get recommended fee based on congestion
   */
  getRecommendedFee(fees, congestion) {
    switch (congestion) {
      case 'low':
        return {
          priority: 'economy',
          satsPerByte: fees.economy,
          estimatedTime: '2-4 hours'
        };
      case 'medium':
        return {
          priority: 'slow',
          satsPerByte: fees.slow,
          estimatedTime: '1-2 hours'
        };
      case 'high':
        return {
          priority: 'medium',
          satsPerByte: fees.medium,
          estimatedTime: '30-60 minutes'
        };
      case 'very-high':
        return {
          priority: 'fast',
          satsPerByte: fees.fast,
          estimatedTime: '10-20 minutes'
        };
      default:
        return {
          priority: 'medium',
          satsPerByte: fees.medium,
          estimatedTime: '30-60 minutes'
        };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Set network (mainnet/testnet)
   */
  setNetwork(network) {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network. Must be "mainnet" or "testnet"');
    }
    this.network = network;
    this.clearCache(); // Clear cache when switching networks
  }
}

// Create singleton instance
const networkService = new NetworkService();

// Export both the instance and specific methods
module.exports = networkService;
module.exports.getNetworkInfo = async (network) => {
  if (network && network !== networkService.network) {
    networkService.setNetwork(network);
  }
  return networkService.getNetworkInfo();
};