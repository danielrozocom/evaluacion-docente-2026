// Copia las fotos de los docentes a data/fotos/<id>.webp y las asigna en el seed.
//
// Uso: node scripts/photos.js "G:\\Mi unidad\\Fotos"
// Los nombres de archivo vienen en orden "Nombre Apellidos"; la carga académica
// usa "Apellidos Nombre". Se emparejan por conjunto de palabras (sin acentos).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = process.argv[2] || 'G:\\Mi unidad\\Fotos';
const DEST = path.join(ROOT, 'data', 'photos');

function norm(s) {
  return String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

if (!fs.existsSync(SRC)) {
  console.error('No existe la carpeta de fotos: ' + SRC);
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'seed.json'), 'utf8'));
const teachersByName = new Map(seed.teachers.map((t) => [norm(t.name), t]));

const files = fs.readdirSync(SRC).filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f));
fs.mkdirSync(DEST, { recursive: true });

let matched = 0;
const used = [];

files.forEach((file) => {
  const base = file.replace(/\.[^.]+$/, '');
  const key = norm(base);
  const teacher = teachersByName.get(key);
  if (!teacher) {
    console.log('⚠ Sin coincidencia: ' + file);
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const target = path.join(DEST, teacher.id + ext);
  fs.copyFileSync(path.join(SRC, file), target);
  used.push(teacher.name);
  matched++;
  console.log('✔ ' + file + '  →  ' + path.basename(target) + '  (' + teacher.name + ')');
});

const missing = seed.teachers.filter((t) => !used.includes(t.name));
if (missing.length) {
  console.log('\nDocentes sin foto:');
  missing.forEach((t) => console.log('  - ' + t.name));
}
console.log(`\n${matched} fotos copiadas a data/fotos/`);

