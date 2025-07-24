# Complete Firecrawl Technical Documentation & Source Analysis

## Updated: July 10, 2025

This document contains the complete technical analysis of Firecrawl's capabilities, API documentation, and source code insights for potential integration with MOOSH Wallet.

## Firecrawl Complete API Reference

### Authentication & Base Configuration
```bash
Base URL: https://api.firecrawl.dev
Authentication: Authorization: Bearer fc-YOUR_API_KEY
Rate Limiting: Production rate limits with 429 responses
```

### Core API Endpoints

#### 1. Scraping (`/v1/scrape`)
Extract content from single URLs in multiple formats.

**Python Implementation:**
```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

scrape_result = app.scrape_url(
    'https://example.com',
    formats=['markdown', 'html', 'json'],
    actions=[
        {"type": "wait", "milliseconds": 2000},
        {"type": "click", "selector": "button.load-more"},
        {"type": "screenshot"}
    ]
)
```

**cURL Implementation:**
```bash
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html"],
    "actions": [
      {"type": "wait", "milliseconds": 2000},
      {"type": "screenshot"}
    ]
  }'
```

#### 2. Crawling (`/v1/crawl`)
Crawl entire websites with intelligent subpage discovery.

**Python Implementation:**
```python
crawl_result = app.crawl_url(
    'https://example.com',
    limit=100,
    scrape_options=ScrapeOptions(formats=['markdown', 'html']),
    poll_interval=30
)
```

**Response Structure:**
```json
{
  "success": true,
  "id": "123-456-789",
  "url": "https://api.firecrawl.dev/v1/crawl/123-456-789"
}
```

#### 3. Mapping (`/v1/map`)
Fast URL discovery across entire websites.

**Implementation:**
```python
map_result = app.map_url('https://example.com')
```

**With Search:**
```bash
curl -X POST https://api.firecrawl.dev/v1/map \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "url": "https://example.com",
    "search": "documentation"
  }'
```

#### 4. Search (`/v1/search`)
Web search with full content extraction.

**Implementation:**
```bash
curl -X POST https://api.firecrawl.dev/v1/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fc-YOUR_API_KEY" \
  -d '{
    "query": "cryptocurrency wallet features",
    "limit": 10,
    "scrapeOptions": {
      "formats": ["markdown", "links"]
    }
  }'
```

#### 5. Extract (`/v1/extract`)
AI-powered structured data extraction.

**With Schema:**
```python
from pydantic import BaseModel

class ExtractSchema(BaseModel):
    title: str
    price: float
    features: list[str]
    rating: float

json_config = JsonConfig(schema=ExtractSchema)

result = app.scrape_url(
    'https://example.com',
    formats=["json"],
    json_options=json_config
)
```

**Without Schema (Prompt-based):**
```bash
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "url": "https://example.com",
    "formats": ["json"],
    "jsonOptions": {
      "prompt": "Extract pricing information and key features"
    }
  }'
```

#### 6. Batch Scraping (`/v1/batch/scrape`)
Process multiple URLs simultaneously.

**Implementation:**
```bash
curl -X POST https://api.firecrawl.dev/v1/batch/scrape \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -d '{
    "urls": [
      "https://example1.com",
      "https://example2.com",
      "https://example3.com"
    ],
    "formats": ["markdown", "html"]
  }'
```

## Advanced Features

### Interactive Actions
Firecrawl supports sophisticated browser automation:

```python
actions = [
    {"type": "wait", "milliseconds": 2000},
    {"type": "click", "selector": "button#connect-wallet"},
    {"type": "wait", "milliseconds": 3000},
    {"type": "write", "text": "wallet_address"},
    {"type": "press", "key": "ENTER"},
    {"type": "screenshot"}
]

result = app.scrape_url(
    'https://dapp.example.com',
    formats=['markdown'],
    actions=actions
)
```

### Custom Headers & Authentication
```python
scrape_result = app.scrape_url(
    'https://api.example.com',
    formats=['json'],
    headers={
        'User-Agent': 'MOOSH-Wallet/1.0',
        'Authorization': 'Bearer your_token'
    }
)
```

## SDK Implementations

### Python SDK (`firecrawl-py`)
```bash
pip install firecrawl-py
```

**Advanced Usage:**
```python
from firecrawl import FirecrawlApp, JsonConfig, ScrapeOptions
from pydantic import BaseModel, Field

class CryptoData(BaseModel):
    token_name: str
    price_usd: float
    market_cap: str
    volume_24h: str
    price_change_24h: float

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Extract crypto data
crypto_config = JsonConfig(schema=CryptoData)
result = app.scrape_url(
    'https://coinmarketcap.com/currencies/bitcoin/',
    formats=["json"],
    json_options=crypto_config
)
```

### Node.js SDK (`@mendable/firecrawl-js`)
```bash
npm install @mendable/firecrawl-js
```

**Implementation:**
```javascript
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY"
});

const schema = z.object({
  walletFeatures: z.array(z.string()),
  securityLevel: z.string(),
  supportedChains: z.array(z.string())
});

const result = await app.scrapeUrl("https://wallet.example.com", {
  jsonOptions: { extractionSchema: schema }
});
```

## Integration Strategies for MOOSH Wallet

### 1. DeFi Data Aggregation
```python
# Monitor DeFi protocols
defi_urls = [
    'https://uniswap.org/',
    'https://compound.finance/',
    'https://aave.com/',
    'https://sushiswap.org/'
]

for url in defi_urls:
    result = app.scrape_url(url, formats=['json'], 
                           json_options=JsonConfig(
                               prompt="Extract protocol features, TVL, and supported tokens"
                           ))
    # Process and store data
```

### 2. Market Intelligence
```python
# Track competitor wallets
wallet_competitors = [
    'https://metamask.io/',
    'https://trustwallet.com/',
    'https://phantom.app/',
    'https://rainbow.me/'
]

competitor_data = []
for wallet_url in wallet_competitors:
    data = app.scrape_url(wallet_url, formats=['json'],
                         json_options=JsonConfig(
                             prompt="Extract wallet features, supported chains, and security measures"
                         ))
    competitor_data.append(data)
```

### 3. News & Updates Monitoring
```python
# Crypto news aggregation
news_sources = [
    'https://cointelegraph.com/',
    'https://coindesk.com/',
    'https://decrypt.co/',
    'https://theblock.co/'
]

def monitor_crypto_news():
    for source in news_sources:
        articles = app.crawl_url(source, limit=20,
                                scrape_options=ScrapeOptions(
                                    formats=['json'],
                                    json_options=JsonConfig(
                                        prompt="Extract article title, summary, and relevance to DeFi wallets"
                                    )
                                ))
        # Filter and process relevant news
```

### 4. Technical Documentation Mining
```python
# Extract blockchain documentation
blockchain_docs = [
    'https://docs.ethereum.org/',
    'https://docs.solana.com/',
    'https://docs.polygon.technology/',
    'https://docs.avalanche.org/'
]

def extract_technical_specs():
    for doc_url in blockchain_docs:
        specs = app.crawl_url(doc_url, 
                             scrape_options=ScrapeOptions(
                                 formats=['markdown', 'json'],
                                 json_options=JsonConfig(
                                     prompt="Extract API endpoints, integration guides, and technical requirements"
                                 )
                             ))
        # Build comprehensive technical knowledge base
```

## Implementation Architecture for MOOSH Wallet

### 1. Data Pipeline Design
```python
class MooshDataPipeline:
    def __init__(self, firecrawl_api_key):
        self.firecrawl = FirecrawlApp(api_key=firecrawl_api_key)
        
    def aggregate_defi_data(self):
        """Aggregate data from DeFi protocols"""
        pass
        
    def monitor_market_trends(self):
        """Track market trends and competitor analysis"""
        pass
        
    def extract_technical_docs(self):
        """Mine technical documentation from blockchain projects"""
        pass
        
    def crawl_news_updates(self):
        """Monitor crypto news and updates"""
        pass
```

### 2. Real-time Data Updates
```python
import asyncio

async def real_time_data_updater():
    while True:
        try:
            # Update DeFi protocol data
            await update_defi_protocols()
            
            # Check for new market data
            await update_market_data()
            
            # Monitor competitor updates
            await check_competitor_updates()
            
            await asyncio.sleep(300)  # Update every 5 minutes
        except Exception as e:
            logger.error(f"Data update error: {e}")
```

### 3. AI-Powered Insights
```python
def generate_market_insights():
    """Use Firecrawl's AI extraction to generate market insights"""
    
    market_analysis = app.scrape_url(
        'https://coinmarketcap.com/',
        formats=['json'],
        json_options=JsonConfig(
            prompt="""
            Analyze the current crypto market conditions and provide:
            1. Top trending cryptocurrencies
            2. Market sentiment indicators
            3. Notable price movements
            4. DeFi protocol performance
            5. Recommendations for wallet users
            """
        )
    )
    return market_analysis
```

## Cost Optimization Strategies

### 1. Smart Caching
```python
import redis
import hashlib

class SmartCache:
    def __init__(self):
        self.redis_client = redis.Redis()
        self.cache_duration = {
            'static_content': 3600,  # 1 hour
            'market_data': 300,      # 5 minutes
            'news': 900,             # 15 minutes
            'technical_docs': 86400  # 24 hours
        }
    
    def get_cached_or_scrape(self, url, content_type='static_content'):
        cache_key = hashlib.md5(url.encode()).hexdigest()
        cached_data = self.redis_client.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        # Scrape fresh data
        result = app.scrape_url(url, formats=['json'])
        self.redis_client.setex(
            cache_key, 
            self.cache_duration[content_type], 
            json.dumps(result)
        )
        return result
```

### 2. Selective Scraping
```python
def intelligent_content_selection():
    """Only scrape relevant content based on user preferences"""
    
    user_interests = get_user_interests()  # From MOOSH Wallet user profile
    
    if 'defi' in user_interests:
        scrape_defi_protocols()
    if 'nft' in user_interests:
        scrape_nft_marketplaces()
    if 'trading' in user_interests:
        scrape_exchange_data()
```

## Production Deployment Considerations

### 1. Error Handling & Retry Logic
```python
import time
import random

def robust_scraping(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = app.scrape_url(url, formats=['json'])
            return result
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            
            # Exponential backoff with jitter
            delay = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(delay)
```

### 2. Rate Limit Management
```python
import asyncio
from asyncio import Semaphore

class RateLimitedScraper:
    def __init__(self, max_concurrent=5, delay_between_requests=1):
        self.semaphore = Semaphore(max_concurrent)
        self.delay = delay_between_requests
        
    async def scrape_with_limit(self, url):
        async with self.semaphore:
            result = app.scrape_url(url, formats=['json'])
            await asyncio.sleep(self.delay)
            return result
```

### 3. Monitoring & Analytics
```python
import logging
from datadog import DogStatsdClient

statsd = DogStatsdClient()

def monitor_scraping_performance():
    """Monitor Firecrawl API usage and performance"""
    
    @statsd.timed('firecrawl.scrape_duration')
    def timed_scrape(url):
        result = app.scrape_url(url, formats=['json'])
        statsd.increment('firecrawl.requests.success')
        return result
    
    return timed_scrape
```

## Summary

This comprehensive Firecrawl documentation provides everything needed to integrate powerful web scraping and AI extraction capabilities into MOOSH Wallet. Key benefits include:

1. **Real-time DeFi Data**: Aggregate data from multiple DeFi protocols
2. **Competitive Intelligence**: Monitor competitor wallets and features
3. **Market Analysis**: AI-powered market insights and trend analysis
4. **Technical Documentation**: Automated extraction of blockchain technical specs
5. **News Monitoring**: Real-time crypto news aggregation and filtering

The implementation can be scaled from basic data extraction to sophisticated AI-powered market intelligence, making MOOSH Wallet a more informed and competitive platform in the DeFi ecosystem.
