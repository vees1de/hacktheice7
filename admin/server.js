const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');

const PORT = 3001;
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : __dirname;
const API_TARGET = process.env.API_TARGET || 'http://localhost:8000';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    // Проксируем запрос к бэкенду (порт 8000)
    const targetUrl = new URL(req.url, API_TARGET);
    const proxy = http.request(
      targetUrl,
      {
        method: req.method,
        headers: req.headers
      },
      proxyRes => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    req.pipe(proxy, { end: true });
    proxy.on('error', () => {
      res.writeHead(502);
      res.end('Backend unavailable');
    });
    return;
  }

  const urlPath = req.url.split('?')[0];
  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const absolutePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(absolutePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, absolutePath);
      return;
    }

    // fallback to index for unknown routes (simple SPA-like behavior)
    sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
  });
});

server.listen(PORT, () => {
  console.log(`Admin UI available at http://localhost:${PORT}`);
});
