'use strict';
// PulseCover local/Render server: serves public/ and hands /api/* to lib/app.js (the same code Vercel runs as a function).
// Needs DATABASE_URL (Supabase connection string). Copy .env.example to .env for local use.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

try { // tiny .env loader (no dependency)
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* no .env file */ }

const { handleApi } = require('./lib/app');
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// ---- static files ----
const MIME = { '.webmanifest': 'application/manifest+json', '.apk': 'application/vnd.android.package-archive', '.ipa': 'application/octet-stream', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.jpeg': 'image/jpeg' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'same-origin' };

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname); if (rel.endsWith('/')) rel += 'index.html';
  let file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!path.extname(file) && !fs.existsSync(file)) file += '.html';
  // family invite links (/invite/<token>) all open the invite page; the page reads the token from the address
  if (rel.startsWith('/invite/') && !path.extname(rel)) file = path.join(PUBLIC, 'invite.html');
  // single-page web app mounted at /m: unknown sub-paths open the app shell (client-side routing)
  if (rel.startsWith('/m/') && !path.extname(rel) && !fs.existsSync(file)) file = path.join(PUBLIC, 'm', 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SEC });
      return fs.readFile(path.join(PUBLIC, '404.html'), (e, d) => res.end(e ? 'Not found' : d));
    }
    const type = MIME[path.extname(file)] || 'application/octet-stream';
    const cache = rel.startsWith('/img/') ? { 'Cache-Control': 'public, max-age=86400' } : {};
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && type.startsWith('video/')) { // byte-range support so video plays in Safari
      const start = range[1] ? parseInt(range[1], 10) : 0;
      const end = range[2] ? Math.min(parseInt(range[2], 10), data.length - 1) : data.length - 1;
      if (start > end || start >= data.length) { res.writeHead(416, { 'Content-Range': `bytes */${data.length}` }); return res.end(); }
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1, ...cache, ...SEC });
      return res.end(data.subarray(start, end + 1));
    }
    const dl = /\.(apk|ipa)$/.test(file) ? { 'Content-Disposition': `attachment; filename="${path.basename(file)}"`, 'Cache-Control': 'no-cache' } : {};
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', ...cache, ...dl, ...SEC });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) return handleApi(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => console.log(`PulseCover running at http://localhost:${PORT}`));
