import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3333;
const ROOT_DIR = path.join(__dirname, '../..');
const PUBLIC_DIR = path.join(__dirname, '../../public');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Parse URL and remove query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = url.pathname;
  
  // Handle health check endpoint
  if (filePath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'MOOSH Wallet UI Server',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Handle logo requests from any path
  if (filePath.includes('Moosh_logo.png')) {
    filePath = '/04_ASSETS/Brand_Assets/Logos/Moosh_logo.png';
  } else if (filePath === '/') {
    filePath = '/index.html';
  } else if (filePath === '/favicon.ico') {
    // Use the logo as favicon
    filePath = '/04_ASSETS/Brand_Assets/Logos/Moosh_logo.png';
  }
  
  // Security: prevent directory traversal
  filePath = filePath.replace(/\.\./g, '');
  
  // Determine which directory to serve from
  let absolutePath;
  if (filePath.startsWith('/public/')) {
    // Serve from public directory
    absolutePath = path.join(ROOT_DIR, filePath);
  } else if (filePath === '/index.html') {
    // Serve index.html from public directory
    absolutePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (filePath.startsWith('/css/') || filePath.startsWith('/js/') || filePath.startsWith('/images/')) {
    // Serve static assets from public directory
    absolutePath = path.join(PUBLIC_DIR, filePath);
  } else {
    // Try root directory first for other files
    absolutePath = path.join(ROOT_DIR, filePath);
  }
  
  // Check if file exists
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    serveFile(absolutePath, res);
  });
});

function serveFile(absolutePath, res) {
  // Get file extension
  const ext = path.extname(absolutePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Read and serve file
  fs.readFile(absolutePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    
    // Set proper headers
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      'Cache-Control': 'no-cache'
    });
    
    res.end(data);
  });
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 MOOSH Wallet Server - Professional Edition
============================================
🌐 Local:    http://localhost:${PORT}
🌐 Network:  http://0.0.0.0:${PORT}
📁 Serving:  ${ROOT_DIR}
🕐 Started:  ${new Date().toISOString()}
💻 Mode:     100% Pure JavaScript Implementation
============================================
  `);
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});