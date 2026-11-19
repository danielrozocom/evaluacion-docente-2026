/**
 * Genera la configuración compartida entre el sitio estático y el backend.
 *
 *   node scripts/build.js
 *
 * Salidas:
 *   web/config.js          → configuración pública del frontend
 *   apps-script/Config.gs  → CONFIG del backend (Apps Script)
 *
 * El sitio web NO se empaqueta dentro de Apps Script: se publica aparte
 * (GitHub Pages) y consume la API por JSONP.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, content) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), content, 'utf8');
};

const seed = JSON.parse(read('data/seed.json'));
const site = JSON.parse(read('site.json'));
const apiUrl = String(site.apiUrl || '').trim();

write('web/config.js',
  '/* Generado por scripts/build.js — no editar a mano. */\n' +
  'window.APP_CONFIG = ' + JSON.stringify(seed, null, 2) + ';\n' +
  'window.APP_API_URL = ' + JSON.stringify(apiUrl) + ';\n');

write('apps-script/Config.gs',
  '/**\n * Generado por scripts/build.js — no editar a mano.\n' +
  ' * Fuente: data/seed.json\n */\n' +
  'const CONFIG = ' + JSON.stringify(seed, null, 2) + ';\n');

// Archivos que ya no se usan (el frontend vive fuera de Apps Script).
['apps-script/Index.html', 'apps-script/Dashboard.html'].forEach((f) => {
  const abs = path.join(ROOT, f);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
});

/* ---------- Fotos de docentes ---------- */
const photosSrc = path.join(ROOT, 'data', 'photos');
const photosDest = path.join(ROOT, 'web', 'assets', 'photos');
if (fs.existsSync(photosSrc)) {
  fs.mkdirSync(photosDest, { recursive: true });
  fs.readdirSync(photosSrc).forEach((f) => {
    const src = path.join(photosSrc, f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(photosDest, f));
  });
}

/* ---------- Logo institucional ---------- */
const logoSrc = path.join(ROOT, 'data', 'logo.svg');
if (fs.existsSync(logoSrc)) {
  fs.mkdirSync(path.join(ROOT, 'web', 'assets'), { recursive: true });
  fs.copyFileSync(logoSrc, path.join(ROOT, 'web', 'assets', 'logo.svg'));
}

console.log('✔ web/config.js');
console.log('✔ apps-script/Config.gs');
console.log('✔ web/assets/photos/');
console.log('✔ web/assets/logo.svg');
console.log(apiUrl
  ? '  API configurada: ' + apiUrl
  : '  ⚠ apiUrl vacío en site.json → el sitio usará el modo demo local.');

