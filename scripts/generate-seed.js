// Genera data/seed.json desde la carga académica en Excel.
//
// Uso:  node scripts/generate-seed.js [ruta-al-xlsx]
// Por defecto lee: data/Carga_Academica.xlsx
//
// Lee la hoja "Carga Académica", filtra únicamente la sección Bachillerato
// y construye grados, cursos, docentes y asignaciones por grado.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const XLSX = process.argv[2] || path.join(ROOT, 'data', 'Carga_Academica.xlsx');
const BACH = 'Bachillerato';
const GRADES = ['6°', '7°', '8°', '9°', '10°', '11°'];

// Matrícula por curso (dato administrativo) para calcular participación.
const STUDENTS_BY_COURSE = {
  '601': 23, '602': 24,
  '701': 27, '702': 28,
  '801': 22, '802': 25,
  '901': 21, '902': 23,
  '10-1': 24, '10-2': 26,
  '11-1': 20, '11-2': 26,
};

// Identificador público del docente: no exponemos la cédula en el sitio web.
function publicTeacherId(documento) {
  return 'doc_' + crypto.createHash('sha256').update('ed2026:' + documento).digest('hex').slice(0, 10);
}

/* ---------------- Lector mínimo de XLSX (ZIP + XML) ---------------- */
function readZip(file) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Archivo XLSX inválido (no se encontró el directorio central).');

  const count = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const files = {};

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error('Directorio central corrupto.');
    const method = buf.readUInt16LE(ptr + 10);
    const compSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.slice(ptr + 46, ptr + 46 + nameLen).toString('utf8');

    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + lNameLen + lExtraLen;
    const raw = buf.slice(dataStart, dataStart + compSize);

    files[name] = method === 0 ? raw : zlib.inflateRawSync(raw);
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function decodeXml(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d))
    .replace(/&amp;/g, '&');
}

function colToNum(col) {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function parseSheetXml(xml, shared) {
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cm of rm[1].matchAll(/<c\s+([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cm[1];
      const body = cm[3] || '';
      const refM = attrs.match(/r="([A-Z]+)(\d+)"/);
      const tM = attrs.match(/t="([^"]+)"/);
      const type = tM ? tM[1] : 'n';
      let val = '';
      if (type === 'inlineStr') {
        val = [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => decodeXml(x[1])).join('');
      } else {
        const vm = body.match(/<v>([\s\S]*?)<\/v>/);
        if (vm) val = type === 's' ? (shared[+vm[1]] || '') : decodeXml(vm[1]);
      }
      if (refM) cells[colToNum(refM[1]) - 1] = val;
    }
    rows.push(cells);
  }
  return rows;
}

function loadWorkbook(file) {
  const files = readZip(file);
  const get = (name) => files[name] ? files[name].toString('utf8') : '';

  const shared = [];
  const ssXml = get('xl/sharedStrings.xml');
  if (ssXml) {
    for (const m of ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      shared.push([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => decodeXml(x[1])).join(''));
    }
  }

  const wbXml = get('xl/workbook.xml');
  const relsXml = get('xl/_rels/workbook.xml.rels');
  const rels = {};
  for (const m of relsXml.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    rels[m[1]] = m[2].replace(/^\/?xl\//, '').replace(/^\//, '');
  }

  const sheets = {};
  for (const m of wbXml.matchAll(/<sheet\s+[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    const name = decodeXml(m[1]);
    let target = rels[m[2]] || '';
    if (!target) continue;
    if (!target.startsWith('xl/')) target = target.replace(/^xl\//, '');
    sheets[name] = parseSheetXml(get('xl/' + target.replace(/^xl\//, '')), shared);
  }
  return sheets;
}

/* ---------------- Construcción del seed ---------------- */
const sheets = loadWorkbook(XLSX);
const sheetName = Object.keys(sheets).find((n) => /carga\s*acad/i.test(n)) ||
  Object.keys(sheets).find((n) => !/colaboradores/i.test(n));
if (!sheetName) throw new Error('No se encontró la hoja de carga académica.');

const rows = (sheets[sheetName] || []).slice(1).filter((r) => r && r[0]);
const bachRows = rows.filter((r) => String(r[9] || '').trim() === BACH);

if (!bachRows.length) throw new Error('La hoja no tiene filas de Bachillerato.');

const coursesByGrade = {};
bachRows.forEach((r) => {
  const g = String(r[8] || '').trim();
  const c = String(r[7] || '').trim();
  if (!g || !c) return;
  if (!coursesByGrade[g]) coursesByGrade[g] = [];
  if (!coursesByGrade[g].includes(c)) coursesByGrade[g].push(c);
});

// Director de curso: filas de "Aula Multigrado" traen el curso en "Curso que Dirige"
const homeroom = {};
rows.forEach((r) => {
  const dirigido = String(r[4] || '').trim();
  const isBachCourse = /^(6|7|8|9)\d{2}$/.test(dirigido) || /^(10|11)-[12]$/.test(dirigido);
  if (isBachCourse) homeroom[String(r[0]).trim()] = dirigido;
});

const teachers = new Map();
bachRows.forEach((r) => {
  const name = String(r[0]).trim();
  const id = String(r[2]).trim();
  const grade = String(r[8]).trim();
  const gradeId = String(GRADES.indexOf(grade) + 6);
  const course = String(r[7] || '').trim();
  const area = String(r[5] || '').trim();
  const subject = String(r[6] || '').trim();
  if (!id || !grade) return;

  if (!teachers.has(id)) {
    const pid = publicTeacherId(id);
    const photoFile = ['webp', 'jpg', 'jpeg', 'png']
      .map((ext) => path.join(ROOT, 'data', 'photos', pid + '.' + ext))
      .find((f) => fs.existsSync(f));
    teachers.set(id, {
      id: pid,
      name,
      homeroom: homeroom[name] || null,
      photo: photoFile ? 'assets/photos/' + path.basename(photoFile) : null,
      assignments: [],
    });
  }
  const t = teachers.get(id);
  const exists = t.assignments.some((a) =>
    a.gradeId === gradeId && a.course === course && a.subject === subject);
  if (!exists) t.assignments.push({ gradeId, grade, course, area, subject });
});

const seed = {
  meta: {
    institution: 'Colegio Interamericano',
    year: 2026,
    period: '2026',
    section: BACH,
    intro: 'Estimado(a) estudiante, tu opinión acerca de la forma como el profesor organiza, desarrolla y evalúa el curso es muy importante para nuestra institución educativa. A continuación se presentan una serie de aspectos relevantes para que valores el desempeño del docente con la mayor objetividad posible, marcando la respuesta que mejor represente tu opinión.',
    scale: { type: 'yesno', labels: ['No', 'Sí'], values: [0, 1] },
  },
  settings: {
    requireIdentification: true,
    allowComment: true,
    commentRequired: false,
    minResponsesForDisplay: 3,
    showDashboardLink: false,
    thresholds: { excellent: 80, good: 60, acceptable: 40 },
  },
  grades: GRADES.map((g, i) => {
    const courses = (coursesByGrade[g] || []).sort();
    const students = courses.reduce((sum, c) => sum + (STUDENTS_BY_COURSE[c] || 0), 0);
    return { id: String(6 + i), name: g, courses, students, courseStudents: courses.map((c) => ({ course: c, students: STUDENTS_BY_COURSE[c] || 0 })) };
  }),
  teachers: [...teachers.values()].sort((a, b) => a.name.localeCompare(b.name, 'es')),
  dimensions: [
    { id: 'profesor', name: 'El profesor', description: 'Cómo organiza, desarrolla y evalúa el curso.' },
    { id: 'clases', name: 'Las clases', description: 'Cómo son tus clases en general.' },
  ],
  questions: [
    { id: 'q1', dimension: 'profesor', text: 'El profesor entregó el programa de la asignatura al inicio del periodo (parcelación en la plataforma).' },
    { id: 'q2', dimension: 'profesor', text: 'Presenta los temas con claridad.' },
    { id: 'q3', dimension: 'profesor', text: 'Comunica claramente los objetivos de cada clase.' },
    { id: 'q4', dimension: 'profesor', text: 'Responde las dudas de los estudiantes en clase.' },
    { id: 'q5', dimension: 'profesor', text: 'Expresa expectativas positivas de los estudiantes.' },
    { id: 'q6', dimension: 'profesor', text: 'Explica los criterios de evaluación de la asignatura.' },
    { id: 'q7', dimension: 'profesor', text: 'Evalúa adecuadamente la asignatura.' },
    { id: 'q8', dimension: 'profesor', text: 'Programa y coordina actividades con uso de la tecnología como complemento a la asignatura.' },
    { id: 'q9', dimension: 'profesor', text: 'Atiende dudas académicas de los estudiantes fuera de clase.' },
    { id: 'q10', dimension: 'profesor', text: 'Realiza actividades de recuperación y refuerzo con estudiantes que lo necesitan.' },
    { id: 'q11', dimension: 'profesor', text: 'Indica normas de comportamiento en clase claras para todos.' },
    { id: 'q12', dimension: 'profesor', text: 'Es respetado por todos los estudiantes del curso.' },
    { id: 'q13', dimension: 'profesor', text: 'Realiza clases activas y dinámicas.' },
    { id: 'q14', dimension: 'profesor', text: 'Informa a padres de familia y acudientes sobre el desempeño de los estudiantes.' },
    { id: 'q15', dimension: 'profesor', text: 'Llega puntual a clase y sus orientaciones son seguidas por todos los estudiantes.' },
    { id: 'q16', dimension: 'clases', text: 'Son interesantes porque tratan temas llamativos.' },
    { id: 'q17', dimension: 'clases', text: 'Empiezan y terminan a la hora indicada.' },
    { id: 'q18', dimension: 'clases', text: 'Desarrollan los temas propuestos en el tiempo indicado.' },
    { id: 'q19', dimension: 'clases', text: 'Tratan temas importantes para el barrio, la zona o la comunidad.' },
    { id: 'q20', dimension: 'clases', text: '¿Quisieras que el docente continúe el próximo año brindándote clase?' },
  ],
  resources: {
    title: '¿Cuáles de los siguientes recursos usa el profesor para desarrollar sus clases?',
    hint: 'Puedes marcar más de uno.',
    options: [
      { id: 'tablero', label: 'Tablero' },
      { id: 'videos', label: 'Películas y videos' },
      { id: 'graficos', label: 'Láminas, mapas y otros materiales gráficos' },
      { id: 'computadores', label: 'Computadores' },
    ],
  },
};

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'seed.json'), JSON.stringify(seed, null, 2), 'utf8');

console.log(`Fuente: ${path.basename(XLSX)} · hoja "${sheetName}"`);
console.log(`OK: ${seed.teachers.length} docentes de bachillerato, ${seed.grades.length} grados, ${seed.questions.length} preguntas.`);
console.log(seed.grades.map((g) => `${g.name}: ${g.courses.join(', ')}`).join('\n'));

