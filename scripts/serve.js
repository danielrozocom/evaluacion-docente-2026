// Servidor local para previsualizar el sitio (modo demo con localStorage).
// Uso: npm run dev  →  http://localhost:5173
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'web');
const PORT = process.env.PORT || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (!url.startsWith('/')) url = '/' + url;
  if (url.endsWith('/')) url += 'index.html';
  if (!path.extname(url)) url += '/index.html';

  const file = path.join(ROOT, url.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Prohibido');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('Evaluación Docente (demo local)');
  console.log('  App:       http://localhost:' + PORT);
  console.log('  Dashboard: http://localhost:' + PORT + '/dashboard/');
  console.log('  Clave demo: demo2026');
});
