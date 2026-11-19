/**
 * ============================================================
 *  EVALUACIÓN DOCENTE · BACHILLERATO 2026
 *  Backend Google Apps Script (solo API)
 *
 *  El sitio web (HTML/CSS/JS) NO vive aquí: se publica aparte
 *  (GitHub Pages u otro hosting estático) y consume esta API
 *  mediante JSONP.
 *
 *  API (GET):
 *    ?action=bootstrap
 *    ?action=progress&doc=...
 *    ?action=submit&payload=<JSON>
 *    ?action=dashboard&key=...
 *    ?action=ping
 *
 *  Todas aceptan &callback=nombreFuncion para JSONP.
 * ============================================================
 */

const SHEET_RESPONSES = 'Respuestas';
const PROP_DASHBOARD_KEY = 'DASHBOARD_KEY';
const DEFAULT_DASHBOARD_KEY = 'KDKairos*7';
const MAX_COMMENT = 600;

/* ------------------------------------------------------------
   ROUTER / API
   ------------------------------------------------------------ */
function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = String(params.action || 'bootstrap');
  const callback = params.callback || '';
  let result;

  try {
    switch (action) {
      case 'bootstrap':
        result = getBootstrap();
        break;
      case 'progress':
        result = getStudentProgress(params.id);
        break;
      case 'submit':
        result = submitEvaluation(parsePayload_(params.payload));
        break;
      case 'dashboard':
        result = getDashboardData(params.key);
        break;
      case 'ping':
        result = { ok: true, service: 'evaluacion-docente', version: '1.0', timestamp: new Date().toISOString() };
        break;
      default:
        throw new Error('Acción no válida.');
    }
  } catch (err) {
    result = { ok: false, message: (err && err.message) ? err.message : 'Error inesperado del servidor.' };
  }

  return output_(result, callback);
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  const cb = String(callback || '');
  if (/^[A-Za-z_$][\w$]*$/.test(cb)) {
    return ContentService
      .createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePayload_(raw) {
  if (!raw) throw new Error('No se recibieron datos de la evaluación.');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error('Los datos de la evaluación están mal formados. Intenta de nuevo.');
  }
}

function getWebAppUrl_() {
  try { return ScriptApp.getService().getUrl() || ''; }
  catch (err) { return ''; }
}

/* ------------------------------------------------------------
   API: CONFIGURACIÓN
   ------------------------------------------------------------ */
function getBootstrap() {
  return { ok: true, config: publicConfig_() };
}

/* ------------------------------------------------------------
   API: PROGRESO DEL ESTUDIANTE
   ------------------------------------------------------------ */
function getStudentProgress(estudianteId) {
  const id = sanitize_(estudianteId, 64).replace(/\s+/g, '');
  if (!id) return { ok: true, evaluated: [] };

  const sh = getResponsesSheet_();
  const last = sh.getLastRow();
  if (last < 2) return { ok: true, evaluated: [] };

  const period = CONFIG.meta.period;
  // Columnas C..I: C=Periodo, D=Grado, E=DocenteID, F=Docente,
  //                G=Área, H=Asignatura, I=EstudianteID
  const values = sh.getRange(2, 3, last - 1, 7).getValues();
  const evaluated = [];
  values.forEach(function (row) {
    if (String(row[6]).trim() !== id) return;
    if (String(row[0]).trim() !== String(period)) return;
    const teacherId = String(row[2]).trim();
    if (teacherId && evaluated.indexOf(teacherId) === -1) evaluated.push(teacherId);
  });
  return { ok: true, evaluated: evaluated };
}

/* ------------------------------------------------------------
   API: GUARDAR EVALUACIÓN
   ------------------------------------------------------------ */
function submitEvaluation(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Datos inválidos.');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const student = payload.student || {};
    const studentId = sanitize_(payload.studentId || student.id || '', 64);
    const gradeId = sanitize_(payload.gradeId, 10);
    const teacherId = sanitize_(payload.teacherId, 40);
    const comment = sanitize_(payload.comment, MAX_COMMENT);

    if (!/^[A-Za-z0-9._-]{8,64}$/.test(studentId)) throw new Error('Identificador de estudiante inválido.');
    if (!gradeId) throw new Error('Grado inválido.');
    if (!teacherId) throw new Error('Docente inválido.');

    const grade = (CONFIG.grades || []).filter(function (g) { return String(g.id) === gradeId; })[0];
    if (!grade) throw new Error('El grado no existe.');

    const teacher = (CONFIG.teachers || []).filter(function (t) { return String(t.id) === teacherId; })[0];
    if (!teacher) throw new Error('El docente no existe.');
    const assignments = (teacher.assignments || []).filter(function (a) { return String(a.gradeId) === gradeId; });
    if (!assignments.length) throw new Error('El docente no dicta clase en este grado.');

    const area = assignments[0].area || '';
    const subjects = [];
    assignments.forEach(function (a) {
      if (a.subject && subjects.indexOf(a.subject) === -1) subjects.push(a.subject);
    });

    const answers = payload.answers || {};
    const cleanAnswers = {};
    let yes = 0;
    for (let i = 0; i < CONFIG.questions.length; i++) {
      const q = CONFIG.questions[i];
      const v = normalizeYesNo_(answers[q.id]);
      if (v === null) {
        throw new Error('Debes responder todas las preguntas con Sí o No.');
      }
      cleanAnswers[q.id] = v;
      yes += v;
    }
    const average = (yes / CONFIG.questions.length) * 100;

    const resourceIds = Array.isArray(payload.resources) ? payload.resources : [];
    const resourceLabels = [];
    if (CONFIG.resources && CONFIG.resources.options) {
      CONFIG.resources.options.forEach(function (o) {
        if (resourceIds.indexOf(o.id) !== -1) resourceLabels.push(o.label);
      });
    }

    const sh = getResponsesSheet_();
    const last = sh.getLastRow();
    if (last >= 2) {
      const period = String(CONFIG.meta.period);
      const values = sh.getRange(2, 3, last - 1, 7).getValues();
      for (let i = 0; i < values.length; i++) {
        if (String(values[i][6]).trim() !== studentId) continue;
        if (String(values[i][0]).trim() !== period) continue;
        if (String(values[i][2]).trim() !== teacherId) continue;
        throw new Error('Ya evaluaste a este docente. Solo se permite una evaluación por docente.');
      }
    }

    const headers = getHeaders_();
    const row = {
      'ID': Utilities.getUuid(),
      'Fecha': new Date(),
      'Periodo': CONFIG.meta.period,
      'Grado': grade.name,
      'DocenteID': teacherId,
      'Docente': teacher.name,
      'Área': area,
      'Asignatura': subjects.join(', '),
      'EstudianteID': studentId,
      'Promedio': average,
      'Recursos': resourceLabels.join('; '),
      'Comentario': comment,
    };
    if (CONFIG.questions) {
      CONFIG.questions.forEach(function (q) {
        row[q.id.toUpperCase()] = cleanAnswers[q.id] === 1 ? 'SI' : 'NO';
      });
    }

    sh.appendRow(headers.map(function (h) { return row[h] != null ? row[h] : ''; }));
    SpreadsheetApp.flush();

    return { ok: true, message: 'Evaluación registrada correctamente.' };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/* ------------------------------------------------------------
   API: DASHBOARD
   ------------------------------------------------------------ */
function getDashboardData(key) {
  checkDashboardKey_(key);

  const sh = getResponsesSheet_();
  const last = sh.getLastRow();
  let rows = [];
  if (last >= 2) {
    const headers = getHeaders_();
    const values = sh.getRange(2, 1, last - 1, headers.length).getValues();
    const tz = Session.getScriptTimeZone();

    rows = values.map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });

      const answers = {};
      CONFIG.questions.forEach(function (q) {
        const qKey = q.id.toUpperCase();
        const v = normalizeYesNo_(obj[qKey]);
        if (v !== null) answers[q.id] = v;
      });

      const resources = String(obj['Recursos'] || '')
        .split(';')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      const grade = (CONFIG.grades || []).filter(function (g) { return g.name === obj['Grado']; })[0];

      return {
        timestamp: obj['Fecha'] instanceof Date
          ? Utilities.formatDate(obj['Fecha'], tz, "yyyy-MM-dd'T'HH:mm:ss")
          : String(obj['Fecha'] || ''),
        period: obj['Periodo'],
        grade: obj['Grado'],
        gradeId: grade ? String(grade.id) : '',
        course: '',
        teacherId: String(obj['DocenteID']),
        teacherName: obj['Docente'],
        area: obj['Área'],
        subject: obj['Asignatura'],
        studentDoc: String(obj['EstudianteID'] || ''),
        studentName: '',
        answers: answers,
        resources: resources,
        average: Number(obj['Promedio']) || 0,
        comment: obj['Comentario'] || '',
      };
    });
  }

  return {
    ok: true,
    config: publicConfig_(),
    rows: rows,
    meta: { lastUpdated: new Date().toISOString() },
  };
}

function checkDashboardKey_(key) {
  const saved = PropertiesService.getScriptProperties().getProperty(PROP_DASHBOARD_KEY) || DEFAULT_DASHBOARD_KEY;
  if (String(key || '').trim() !== String(saved)) {
    throw new Error('Clave incorrecta. Verifica la clave del dashboard.');
  }
}

/* ------------------------------------------------------------
   INSTALACIÓN
   ------------------------------------------------------------ */
function setup() {
  const message = setupCore_();
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    Logger.log(message);
  }
}

function setupCore_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abre este script desde una hoja de cálculo (Extensiones → Apps Script).');

  const sh = createResponsesSheet_(ss);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty(PROP_DASHBOARD_KEY)) {
    props.setProperty(PROP_DASHBOARD_KEY, DEFAULT_DASHBOARD_KEY);
  }

  const key = props.getProperty(PROP_DASHBOARD_KEY);
  const url = getWebAppUrl_();
  return 'Backend configurado ✅\n\n' +
    'Hoja de respuestas: "' + sh.getName() + '"\n' +
    'Clave del dashboard: ' + key + '\n' +
    (url ? 'URL del backend: ' + url + '\n' : '') +
    '\nRecuerda publicar el Web App (Implementar → Nueva implementación → Aplicación web, acceso "Cualquier persona").\n' +
    'Esa URL se configura en site.json del sitio web: apiUrl.';
}

function setDashboardKey() {
  PropertiesService.getScriptProperties().setProperty(PROP_DASHBOARD_KEY, DEFAULT_DASHBOARD_KEY);
  Logger.log('Clave del dashboard actualizada.');
  return DEFAULT_DASHBOARD_KEY;
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Evaluación Docente')
      .addItem('⚙️ Configurar sistema', 'setup')
      .addItem('🔗 Ver URL del backend', 'showUrls_')
      .addItem('🔑 Ver clave del dashboard', 'showKey_')
      .addToUi();
  } catch (err) {}
}

function showUrls_() {
  const url = getWebAppUrl_() || '(publica el Web App primero)';
  SpreadsheetApp.getUi().alert('URL del backend\n\n' + url + '\n\nPruébala con:\n' + url + '?action=ping');
}

function showKey_() {
  const key = PropertiesService.getScriptProperties().getProperty(PROP_DASHBOARD_KEY) || DEFAULT_DASHBOARD_KEY;
  SpreadsheetApp.getUi().alert('Clave del dashboard: ' + key);
}

/* ------------------------------------------------------------
   HOJA DE RESPUESTAS
   ------------------------------------------------------------ */
function getHeaders_() {
  const base = ['ID', 'Fecha', 'Periodo', 'Grado', 'DocenteID', 'Docente', 'Área', 'Asignatura', 'EstudianteID'];
  const questions = (CONFIG.questions || []).map(function (q) { return q.id.toUpperCase(); });
  return base.concat(questions).concat(['Promedio', 'Recursos', 'Comentario']);
}

function getResponsesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('El script no está vinculado a una hoja de cálculo.');
  return ss.getSheetByName(SHEET_RESPONSES) || createResponsesSheet_(ss);
}

function createResponsesSheet_(ss) {
  let sh = ss.getSheetByName(SHEET_RESPONSES);
  const headers = getHeaders_();
  if (!sh) sh = ss.insertSheet(SHEET_RESPONSES);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length)
      .setBackground('#364b87')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setVerticalAlignment('middle');
    sh.setRowHeight(1, 38);
  } else {
    // Si cambian las preguntas, actualiza encabezados sin borrar datos.
    const current = sh.getRange(1, 1, 1, headers.length).getValues()[0];
    if (String(current.join('|')) !== String(headers.join('|'))) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  // Identificador anónimo del dispositivo como texto.
  sh.getRange('I:I').setNumberFormat('@');

  const widths = [38, 150, 80, 70, 120, 200, 220, 200, 180];
  widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  const startQ = widths.length + 1;
  for (let i = 0; i < CONFIG.questions.length; i++) sh.setColumnWidth(startQ + i, 52);
  sh.setColumnWidth(startQ + CONFIG.questions.length, 80);
  sh.setColumnWidth(startQ + CONFIG.questions.length + 1, 240);
  sh.setColumnWidth(startQ + CONFIG.questions.length + 2, 320);

  if (sh.getLastRow() >= 2) {
    sh.getRange(2, 2, sh.getLastRow() - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm');
    sh.getRange(2, startQ + CONFIG.questions.length, Math.max(sh.getLastRow() - 1, 1), 1).setNumberFormat('0.0');
  }
  return sh;
}

/* ------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------ */
function publicConfig_() {
  return {
    meta: CONFIG.meta,
    settings: CONFIG.settings,
    grades: CONFIG.grades,
    teachers: CONFIG.teachers,
    dimensions: CONFIG.dimensions,
    questions: CONFIG.questions,
    resources: CONFIG.resources,
  };
}

function normalizeYesNo_(value) {
  if (value === true || value === 1 || value === '1') return 1;
  if (value === false || value === 0 || value === '0') return 0;
  if (typeof value === 'string') {
    const v = value.trim().toUpperCase();
    if (v === 'SI' || v === 'SÍ') return 1;
    if (v === 'NO') return 0;
  }
  return null;
}

function sanitize_(value, max) {
  return String(value == null ? '' : value).replace(/[<>]/g, '').trim().slice(0, max || 200);
}

/* ------------------------------------------------------------
   PRUEBAS RÁPIDAS (ejecutar desde el editor)
   ------------------------------------------------------------ */
function testPing() {
  const res = doGet({ parameter: { action: 'ping' } });
  Logger.log(res.getContent());
}

function testBootstrap() {
  const res = getBootstrap();
  Logger.log('Grados: ' + res.config.grades.length + ' · Docentes: ' + res.config.teachers.length);
}

function testDashboard() {
  const key = PropertiesService.getScriptProperties().getProperty(PROP_DASHBOARD_KEY) || DEFAULT_DASHBOARD_KEY;
  const res = getDashboardData(key);
  Logger.log('Filas: ' + res.rows.length);
}
