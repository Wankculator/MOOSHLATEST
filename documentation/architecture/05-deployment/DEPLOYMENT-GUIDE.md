# 🚀 MOOSH Wallet - Professional Deployment Guide
## From Development to Production - Complete Deployment Blueprint

### 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Production Build Process](#production-build-process)
4. [Server Deployment](#server-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] No hardcoded API keys or secrets
- [ ] Code linting passed (`npm run lint`)
- [ ] Security audit passed (`npm audit`)

### Documentation
- [ ] README.md updated
- [ ] API documentation current
- [ ] Deployment notes updated
- [ ] Environment variables documented

### Security
- [ ] HTTPS certificates ready
- [ ] Environment variables configured
- [ ] Rate limiting configured
- [ ] CORS settings reviewed
- [ ] Input validation active

---

## 💻 Local Development Setup

### Requirements
```bash
# System Requirements
- Node.js 18+ LTS
- npm 8+
- Git
- 4GB RAM minimum
- 10GB disk space
```

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/yourusername/moosh-wallet.git
cd moosh-wallet

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start development servers
# Terminal 1 - API Server
npm run dev:api

# Terminal 2 - Frontend Server
npm run dev:ui

# Or use the batch file (Windows)
START_BOTH_SERVERS.bat
```

### Environment Variables
```env
# .env file
NODE_ENV=development
API_PORT=3001
UI_PORT=3333
API_URL=http://localhost:3001

# Production only
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

---

## 🏗️ Production Build Process

### 1. Optimize Frontend
```bash
# Minify JavaScript
npx terser public/js/moosh-wallet.js -o public/js/moosh-wallet.min.js \
  --compress \
  --mangle \
  --source-map

# Optimize CSS
npx cssnano public/css/styles.css public/css/styles.min.css

# Compress assets
find public/images -name "*.png" -exec pngquant --ext .png --force {} \;
```

### 2. Create Production Bundle
```javascript
// build.js
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function build() {
  // Read source file
  const source = fs.readFileSync('./public/js/moosh-wallet.js', 'utf8');
  
  // Minify with production settings
  const result = await minify(source, {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info']
    },
    mangle: {
      toplevel: true
    },
    output: {
      comments: false
    }
  });
  
  // Write minified file
  fs.writeFileSync('./dist/moosh-wallet.min.js', result.code);
  
  // Copy other assets
  copyAssets();
}

build();
```

### 3. Production Configuration
```javascript
// config/production.js
module.exports = {
  api: {
    port: process.env.PORT || 3001,
    cors: {
      origin: process.env.FRONTEND_URL || 'https://mooshwallet.com',
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://mempool.space", "https://blockstream.info"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  }
};
```

---

## 🖥️ Server Deployment

### 1. VPS Setup (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Deploy Application
```bash
# Create app directory
sudo mkdir -p /var/www/moosh-wallet
sudo chown -R $USER:$USER /var/www/moosh-wallet

# Clone repository
cd /var/www
git clone https://github.com/yourusername/moosh-wallet.git

# Install dependencies
cd moosh-wallet
npm ci --production

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'moosh-api',
      script: './src/server/api-server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'moosh-ui',
      script: './src/server/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/moosh-wallet
server {
    listen 80;
    server_name mooshwallet.com www.mooshwallet.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mooshwallet.com www.mooshwallet.com;

    ssl_certificate /etc/letsencrypt/live/mooshwallet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mooshwallet.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }
    
    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

### 4. SSL Setup
```bash
# Obtain SSL certificate
sudo certbot --nginx -d mooshwallet.com -d www.mooshwallet.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🐳 Docker Deployment

### 1. Dockerfile
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/server/server.js ./server.js
EXPOSE 3333
CMD ["node", "server.js"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - RATE_LIMIT_MAX=100
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - API_URL=http://api:3001
    depends_on:
      - api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - api
    restart: unless-stopped
```

### 3. Deploy with Docker
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale API servers
docker-compose up -d --scale api=3
```

---

## ☁️ Cloud Deployment

### AWS Deployment
```bash
# 1. Create EC2 instance (t3.medium recommended)
# 2. Configure security groups (ports 80, 443, 22)
# 3. Assign Elastic IP

# Deploy using AWS CLI
aws s3 sync ./public s3://moosh-wallet-static --delete
aws cloudfront create-invalidation --distribution-id ABCD1234 --paths "/*"
```

### Vercel Deployment
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server/api-server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server/api-server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### Heroku Deployment
```json
// package.json
{
  "scripts": {
    "start": "node src/server/api-server.js",
    "heroku-postbuild": "npm run build"
  }
}
```

```bash
# Deploy to Heroku
heroku create moosh-wallet
heroku config:set NODE_ENV=production
git push heroku main
```

---

## 🔒 Security Hardening

### 1. Application Security
```javascript
// security-middleware.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://mempool.space"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP"
});

app.use('/api', limiter);
```

### 2. Server Hardening
```bash
# Firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban setup
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
```

---

## 📊 Monitoring & Logging

### 1. Logging Setup
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Monitoring
```bash
# Install monitoring
npm install @sentry/node

# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 💾 Backup & Recovery

### Backup Strategy
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/moosh-wallet"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/moosh-wallet

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_$DATE.json

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3001
# Kill process
sudo kill -9 <PID>
```

#### PM2 Not Starting
```bash
# Check logs
pm2 logs moosh-api --lines 100
# Restart
pm2 restart all
```

#### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --force-renewal
# Restart nginx
sudo systemctl restart nginx
```

---

## 📚 Post-Deployment

### Health Checks
```bash
# API health
curl https://mooshwallet.com/api/health

# Frontend health
curl https://mooshwallet.com

# SSL check
openssl s_client -connect mooshwallet.com:443
```

### Performance Testing
```bash
# Load testing
npm install -g artillery
artillery quick --count 50 --num 10 https://mooshwallet.com/api/health
```

---

**This deployment guide ensures MOOSH Wallet is deployed professionally with security, performance, and reliability in mind.**