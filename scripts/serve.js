// Servidor estático del sitio (local y producción).
// Local:      npm run dev   → http://localhost:5173
// Producción: npm run start → usa $PORT (Dokploy / Nixpacks / Bun)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'web');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const GAS_URL = process.env.GAS_URL ||
  'https://script.google.com/macros/s/AKfycbw38XFOFOPFHn92md0TPlfAZc-aPU3LAOz0tP2Jh1LhkvQqa2_4DXdXa6I0e35x4aR3Vg/exec';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    });
    res.end();
    return;
  }

  if (url === '/health' || url === '/healthz') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (url === '/api') {
    const query = (req.url || '').split('?')[1] || '';
    fetch(GAS_URL + (query ? '?' + query : ''), { redirect: 'follow' })
      .then(function (r) { return r.text().then(function (body) { return { status: r.status, body: body }; }); })
      .then(function (out) {
        res.writeHead(out.status >= 200 && out.status < 300 ? 200 : 502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(out.body);
      })
      .catch(function () {
        res.writeHead(502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ ok: false, message: 'No se pudo conectar con el backend.' }));
      });
    return;
  }

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
      'Cache-Control': /\.(webp|svg|png|jpg|jpeg|ico)$/i.test(file)
        ? 'public, max-age=3600'
        : 'no-cache, no-store, must-revalidate',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(PORT, HOST, () => {
  console.log('Evaluación Docente · Colegio Interamericano');
  console.log('  Servidor: http://' + HOST + ':' + PORT);
  console.log('  Dashboard: http://' + HOST + ':' + PORT + '/dashboard/');
});
