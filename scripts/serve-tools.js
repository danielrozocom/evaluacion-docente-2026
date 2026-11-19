// Servidor auxiliar (solo desarrollo) que sirve la raíz del repositorio con CORS.
// Uso: node scripts/serve-tools.js  →  http://localhost:5174
// Sirve para cargar apps-script/Code.gs desde el editor de Apps Script.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 5174;

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '');
  const file = path.join(ROOT, url);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
}).listen(PORT, () => console.log('tools server http://localhost:' + PORT));
