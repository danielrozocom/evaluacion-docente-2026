/* ============================================================
   Dashboard de resultados · Evaluación Docente 2026
   Instrumento Sí / No → se reporta % de favorabilidad.
   ============================================================ */
(function () {
  'use strict';

  var SS_KEY = 'ed_dash_key';
  var COLORS = { yes: '#2f7d5b', no: '#c4553f' };

  var state = {
    key: '',
    config: null,
    meta: {},
    rows: [],
    filtered: [],
    filters: { grade: '', teacher: '', search: '' },
    mock: false
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function fmtPct(n) { return Number(n).toFixed(1).replace('.', ',') + '%'; }
  function pct(part, total) { return total ? Math.round((part / total) * 100) : 0; }

  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    t.innerHTML = '<i data-lucide="' + (type === 'error' ? 'circle-alert' : 'circle-check') + '"></i><div>' + esc(msg) + '</div>';
    $('#toastWrap').appendChild(t);
    icons();
    setTimeout(function () {
      t.style.transition = 'opacity 200ms'; t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 220);
    }, 3400);
  }

  /* ---------------- Datos ---------------- */
  function yn(v) {
    if (v === true || v === 1 || v === '1') return 1;
    if (v === false || v === 0 || v === '0') return 0;
    if (typeof v === 'string') {
      var s = v.trim().toUpperCase();
      if (s === 'SI' || s === 'SÍ') return 1;
      if (s === 'NO') return 0;
    }
    return null;
  }

  function normalizeRow(r) {
    var answers = {};
    var raw = r.answers || {};
    if (r.q1 != null) {
      Object.keys(r).forEach(function (k) { if (/^q\d+$/.test(k)) raw[k] = r[k]; });
    }
    Object.keys(raw).forEach(function (k) {
      var v = yn(raw[k]);
      if (v !== null) answers[k] = v;
    });

    var vals = Object.keys(answers).map(function (k) { return answers[k]; });
    var yes = vals.filter(function (v) { return v === 1; }).length;
    var avg = r.average != null ? Number(r.average) : (vals.length ? (yes / vals.length) * 100 : 0);

    var resources = r.resources;
    if (!Array.isArray(resources)) {
      resources = String(resources || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean);
    }

    return {
      timestamp: r.timestamp,
      period: r.period,
      grade: r.grade,
      gradeId: r.gradeId != null ? String(r.gradeId) : '',
      course: r.course,
      teacherId: String(r.teacherId != null ? r.teacherId : ''),
      teacherName: r.teacherName,
      area: r.area,
      subject: r.subject,
      studentDoc: r.studentDoc,
      studentName: r.studentName,
      answers: answers,
      resources: resources,
      comment: r.comment || '',
      average: avg
    };
  }

  function loadData(key) {
    return Api.getDashboardData(key).then(function (res) {
      if (!res || res.ok === false) throw new Error((res && res.message) || 'No autorizado.');
      state.key = key;
      state.config = res.config;
      state.meta = (res.config && res.config.meta) || {};
      state.rows = (res.rows || []).map(normalizeRow);
      state.mock = !!res.mock;
      try { sessionStorage.setItem(SS_KEY, key); } catch (e) {}
      setupDashboard();
      showDash();
    });
  }

  /* ---------------- Acceso ---------------- */
  function showGate(error) {
    $('#dash').hidden = true;
    $('#gate').hidden = false;
    if (error) $('#gateError').classList.remove('hidden');
    icons();
  }
  function showDash() {
    $('#gate').hidden = true;
    $('#dash').hidden = false;
    icons();
  }

  /* ---------------- Filtros ---------------- */
  function setupDashboard() {
    var cfg = state.config;
    $('#dashSub').textContent = (cfg.meta.institution || 'Colegio Interamericano') + ' · ' + (cfg.meta.year || '');
    if (cfg.meta.period) document.title = 'Dashboard · Evaluación Docente ' + cfg.meta.period;
    $('#footerYear').textContent = new Date().getFullYear();
    $('#mockBadge').hidden = !state.mock;

    $('#fGrade').innerHTML = '<option value="">Todos los grados</option>' + cfg.grades.map(function (g) {
      return '<option value="' + esc(g.id) + '">' + esc(g.name) + '</option>';
    }).join('');

    var teachers = cfg.teachers.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    $('#fTeacher').innerHTML = '<option value="">Todos los docentes</option>' + teachers.map(function (t) {
      return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>';
    }).join('');

    bindFilters();
    renderAll();
  }

  function bindFilters() {
    if (state.bound) return;
    state.bound = true;
    function onChange() {
      state.filters.grade = $('#fGrade').value;
      state.filters.teacher = $('#fTeacher').value;
      state.filters.search = $('#fSearch').value.trim().toLowerCase();
      renderAll();
    }
    $('#fGrade').addEventListener('change', onChange);
    $('#fTeacher').addEventListener('change', onChange);
    $('#fSearch').addEventListener('input', onChange);
    $('#btnClear').addEventListener('click', function () {
      $('#fGrade').value = ''; $('#fTeacher').value = ''; $('#fSearch').value = '';
      onChange();
    });
  }

  /* ---------------- Agregaciones ---------------- */
  function applyFilters() {
    var f = state.filters;
    state.filtered = state.rows.filter(function (r) {
      if (f.grade && r.gradeId !== f.grade) return false;
      if (f.teacher && r.teacherId !== f.teacher) return false;
      if (f.search && String(r.teacherName || '').toLowerCase().indexOf(f.search) === -1) return false;
      return true;
    });
  }

  function meanPct(values) {
    if (!values.length) return 0;
    var yes = values.filter(function (v) { return v === 1; }).length;
    return (yes / values.length) * 100;
  }

  function groupBy(rows, keyFn) {
    var map = new Map();
    rows.forEach(function (r) {
      var k = keyFn(r);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return map;
  }

  function questionOf(qid) {
    return (state.config.questions || []).filter(function (q) { return q.id === qid; })[0];
  }

  function computeStats(rows) {
    var all = [];
    rows.forEach(function (r) {
      Object.keys(r.answers).forEach(function (k) { all.push(r.answers[k]); });
    });

    var yes = all.filter(function (v) { return v === 1; }).length;
    var no = all.length - yes;

    var byTeacher = [];
    groupBy(rows, function (r) { return r.teacherId; }).forEach(function (rs, id) {
      var vals = [];
      rs.forEach(function (r) { Object.keys(r.answers).forEach(function (k) { vals.push(r.answers[k]); }); });
      byTeacher.push({
        id: id,
        name: rs[0].teacherName,
        n: rs.length,
        grades: Array.from(new Set(rs.map(function (r) { return r.grade; }).filter(Boolean))),
        avg: meanPct(vals),
        yes: vals.filter(function (v) { return v === 1; }).length,
        total: vals.length
      });
    });
    byTeacher.sort(function (a, b) { return b.avg - a.avg; });

    var byDimension = (state.config.dimensions || []).map(function (d) {
      var vals = [];
      rows.forEach(function (r) {
        Object.keys(r.answers).forEach(function (k) {
          var q = questionOf(k);
          if (q && q.dimension === d.id) vals.push(r.answers[k]);
        });
      });
      return { id: d.id, name: d.name, avg: meanPct(vals), n: vals.length };
    });

    var byGrade = (state.config.grades || []).map(function (g) {
      var rs = rows.filter(function (r) { return r.gradeId === g.id; });
      var vals = [];
      rs.forEach(function (r) { Object.keys(r.answers).forEach(function (k) { vals.push(r.answers[k]); }); });
      var people = new Set(rs.map(function (r) { return r.studentDoc || r.studentName; }).filter(Boolean));
      return {
        id: g.id, name: g.name, avg: meanPct(vals), n: rs.length,
        students: Number(g.students) || 0, participants: people.size
      };
    });

    var activeGrades = new Set(rows.map(function (r) { return r.gradeId; }));
    var expected = (state.config.grades || [])
      .filter(function (g) { return activeGrades.has(g.id); })
      .reduce(function (a, g) { return a + (Number(g.students) || 0); }, 0);

    var byQuestion = (state.config.questions || []).map(function (q) {
      var vals = [];
      rows.forEach(function (r) { if (r.answers[q.id] != null) vals.push(r.answers[q.id]); });
      return { id: q.id, text: q.text, avg: meanPct(vals), n: vals.length };
    }).filter(function (q) { return q.n > 0; });

    var resourceCounts = {};
    rows.forEach(function (r) {
      (r.resources || []).forEach(function (label) {
        resourceCounts[label] = (resourceCounts[label] || 0) + 1;
      });
    });
    var byResource = Object.keys(resourceCounts).map(function (label) {
      return { label: label, count: resourceCounts[label] };
    }).sort(function (a, b) { return b.count - a.count; });

    var students = Array.from(new Set(rows.map(function (r) { return r.studentDoc || r.studentName; }).filter(Boolean)));

    return {
      total: rows.length,
      avg: meanPct(all),
      answers: all.length,
      yes: yes,
      no: no,
      byTeacher: byTeacher,
      byDimension: byDimension,
      byGrade: byGrade,
      byQuestion: byQuestion,
      byResource: byResource,
      students: students.length,
      expected: expected,
      participation: expected ? (students.length / expected) * 100 : 0,
      teachersEvaluated: byTeacher.length
    };
  }

  /* ---------------- Render ---------------- */
  function renderAll() {
    applyFilters();
    var s = computeStats(state.filtered);

    renderKpis(s);
    renderTeacherChart(s);
    renderDonut(s);
    renderDimensions(s);
    renderGrades(s);
    renderParticipation(s);
    renderQuestions(s);
    renderResources(s);
    renderTable(s);

    var stamp = new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
    $('#lastUpdated').textContent = 'Actualizado: ' + stamp + ' · ' + state.filtered.length + ' evaluaciones en la vista';
    $('#footStamp').textContent = stamp;
    icons();
  }

  function kpi(icon, label, value, foot) {
    return '<div class="card kpi">' +
      '<div class="kpi-top"><span class="kpi-label">' + esc(label) + '</span>' +
      '<span class="kpi-icon"><i data-lucide="' + icon + '"></i></span></div>' +
      '<div class="kpi-value">' + value + '</div>' +
      '<div class="kpi-foot">' + esc(foot) + '</div></div>';
  }

  function renderKpis(s) {
    var totalTeachers = (state.config.teachers || []).length;
    var coverage = pct(s.teachersEvaluated, totalTeachers);
    $('#kpiGrid').innerHTML = [
      kpi('clipboard-list', 'Evaluaciones', s.total, 'Respuestas por docente'),
      kpi('users-round', 'Docentes evaluados', s.teachersEvaluated + '<small> / ' + totalTeachers + '</small>', coverage + '% de cobertura'),
      kpi('thumbs-up', 'Favorabilidad', fmtPct(s.avg), s.yes + ' de ' + s.answers + ' respuestas Sí'),
      kpi('user-check', 'Participación', fmtPct(s.participation), s.students + ' de ' + s.expected + ' estudiantes')
    ].join('');
  }

  function barRow(name, value, extra, display) {
    var w = Math.max(0, Math.min(100, value));
    return '<div class="bar-row" title="' + esc(name) + '">' +
      '<span class="bar-name">' + esc(name) + (extra || '') + '</span>' +
      '<span class="bar-track"><span class="bar-fill" style="width:' + w + '%"></span></span>' +
      '<span class="bar-value">' + (display != null ? display : fmtPct(value)) + '</span></div>';
  }

  function renderTeacherChart(s) {
    var minN = (state.config.settings && state.config.settings.minResponsesForDisplay) || 0;
    $('#teacherChartCount').textContent = s.byTeacher.length + (s.byTeacher.length === 1 ? ' docente' : ' docentes');
    if (!s.byTeacher.length) {
      $('#chartTeachers').innerHTML = '<div class="empty">Sin datos para los filtros seleccionados.</div>';
      return;
    }
    $('#chartTeachers').innerHTML = s.byTeacher.map(function (t) {
      var low = minN && t.n < minN;
      return barRow(t.name, t.avg, low ? ' <span class="badge badge-warning" style="margin-left:4px;">preliminar</span>' : '');
    }).join('');
  }

  function renderDonut(s) {
    var total = s.yes + s.no;
    var r = 62, C = 2 * Math.PI * r;
    var segments = '';

    if (total) {
      var yesLen = (s.yes / total) * C;
      var noLen = C - yesLen;
      segments = '<circle cx="76" cy="76" r="' + r + '" fill="none" stroke="' + COLORS.yes + '" stroke-width="20" ' +
        'stroke-dasharray="' + yesLen + ' ' + noLen + '"></circle>' +
        '<circle cx="76" cy="76" r="' + r + '" fill="none" stroke="' + COLORS.no + '" stroke-width="20" ' +
        'stroke-dasharray="' + noLen + ' ' + yesLen + '" stroke-dashoffset="' + (-yesLen) + '"></circle>';
    }

    $('#donut').innerHTML =
      '<svg viewBox="0 0 152 152" aria-hidden="true">' +
      '<circle cx="76" cy="76" r="' + r + '" fill="none" stroke="#eef1f7" stroke-width="20"></circle>' +
      segments + '</svg>' +
      '<div class="donut-center"><strong>' + (total ? fmtPct(s.avg) : '—') + '</strong><span>favorabilidad</span></div>';

    $('#donutLegend').innerHTML =
      '<div class="legend-row"><span class="legend-dot" style="background:' + COLORS.yes + '"></span>' +
      '<span>Sí</span><span class="legend-value">' + (total ? pct(s.yes, total) + '%' : '0%') + '</span></div>' +
      '<div class="legend-row"><span class="legend-dot" style="background:' + COLORS.no + '"></span>' +
      '<span>No</span><span class="legend-value">' + (total ? pct(s.no, total) + '%' : '0%') + '</span></div>' +
      '<div class="legend-row" style="margin-top:2px;color:var(--muted-foreground)">' +
      '<span style="font-size:11px;">' + s.yes + ' Sí · ' + s.no + ' No</span></div>';
  }

  function renderDimensions(s) {
    if (!s.byDimension.length) { $('#chartDimensions').innerHTML = '<div class="empty">Sin datos.</div>'; return; }
    $('#chartDimensions').innerHTML = s.byDimension.map(function (d) {
      return barRow(d.name, d.avg);
    }).join('');
  }

  function renderGrades(s) {
    var withData = s.byGrade.filter(function (g) { return g.n > 0; });
    if (!withData.length) { $('#chartGrades').innerHTML = '<div class="empty">Sin datos.</div>'; return; }
    $('#chartGrades').innerHTML = withData.map(function (g) {
      return barRow(g.name, g.avg, ' <span class="badge" style="margin-left:4px;">' + g.n + '</span>');
    }).join('');
  }

  function renderParticipation(s) {
    if (!s.byGrade.length) { $('#chartParticipation').innerHTML = '<div class="empty">Sin datos.</div>'; return; }
    $('#chartParticipation').innerHTML = s.byGrade.map(function (g) {
      var p = g.students ? (g.participants / g.students) * 100 : 0;
      var extra = ' <span class="badge" style="margin-left:4px;">' + g.participants + '/' + g.students + '</span>';
      return barRow(g.name, p, extra);
    }).join('');
  }

  function renderQuestions(s) {
    if (!s.byQuestion.length) { $('#chartQuestions').innerHTML = '<div class="empty">Sin datos.</div>'; return; }
    var sorted = s.byQuestion.slice().sort(function (a, b) { return a.avg - b.avg; });
    $('#chartQuestions').innerHTML = sorted.map(function (q) {
      var short = q.text.length > 70 ? q.text.slice(0, 67) + '…' : q.text;
      return barRow(short, q.avg);
    }).join('');
  }

  function renderResources(s) {
    if (!s.byResource.length) {
      $('#chartResources').innerHTML = '<div class="empty">Aún no hay recursos reportados.</div>';
      return;
    }
    var max = Math.max.apply(null, s.byResource.map(function (x) { return x.count; }));
    $('#chartResources').innerHTML = s.byResource.map(function (x) {
      return barRow(x.label, (x.count / max) * 100, '', x.count + '');
    }).join('');
  }

  function level(avg, n) {
    var t = (state.config.settings && state.config.settings.thresholds) || { excellent: 80, good: 60, acceptable: 40 };
    var minN = (state.config.settings && state.config.settings.minResponsesForDisplay) || 0;
    if (minN && n < minN) return { text: 'Preliminar', cls: 'badge-warning', tag: 'num' };
    if (avg >= t.excellent) return { text: 'Excelente', cls: 'badge-success', tag: 'num-good' };
    if (avg >= t.good) return { text: 'Bueno', cls: 'badge-primary', tag: 'num-good' };
    if (avg >= t.acceptable) return { text: 'Aceptable', cls: 'badge-warning', tag: 'num-mid' };
    return { text: 'Bajo', cls: 'badge', tag: 'num-low' };
  }

  function renderTable(s) {
    var minN = (state.config.settings && state.config.settings.minResponsesForDisplay) || 0;
    var tbody = $('#tableTeachers tbody');
    $('#tableSub').textContent = s.byTeacher.length + (s.byTeacher.length === 1 ? ' docente' : ' docentes') +
      ' · ' + s.total + (s.total === 1 ? ' evaluación' : ' evaluaciones');
    $('#tableCount').textContent = s.total + ' registros';

    if (!s.byTeacher.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty">No hay evaluaciones con estos filtros.</div></td></tr>';
      return;
    }

    tbody.innerHTML = s.byTeacher.map(function (t) {
      var lv = level(t.avg, t.n);
      return '<tr>' +
        '<td><div class="cell-strong">' + esc(t.name) + '</div></td>' +
        '<td>' + t.grades.map(function (g) { return '<span class="chip">' + esc(g) + '</span>'; }).join(' ') + '</td>' +
        '<td class="text-right">' + t.n + (minN && t.n < minN ? ' <span class="badge badge-warning">bajo</span>' : '') + '</td>' +
        '<td class="text-right"><span class="num-tag ' + lv.tag + '">' + fmtPct(t.avg) + '</span></td>' +
        '<td class="text-right"><span class="badge ' + lv.cls + '">' + lv.text + '</span></td>' +
      '</tr>';
    }).join('');
  }

  /* ---------------- CSV ---------------- */
  function exportCsv() {
    if (!state.filtered.length) { toast('No hay datos para exportar.', 'error'); return; }
    var qs = state.config.questions || [];
    var header = ['Periodo', 'Fecha', 'Grado', 'Docente']
      .concat(qs.map(function (q) { return q.id.toUpperCase(); }))
      .concat(['% Favorabilidad', 'Recursos', 'Comentario']);

    var lines = state.filtered.map(function (r) {
      var base = [r.period, r.timestamp, r.grade, r.teacherName];
      var answers = qs.map(function (q) { return r.answers[q.id] === 1 ? 'SI' : (r.answers[q.id] === 0 ? 'NO' : ''); });
      return base.concat(answers).concat([r.average.toFixed(1), (r.resources || []).join('; '), r.comment]);
    });

    function cell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
    var csv = [header].concat(lines).map(function (row) { return row.map(cell).join(';'); }).join('\r\n');
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'evaluacion_docente_' + (state.meta.period || '2026') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    toast('CSV exportado.');
  }

  /* ---------------- Arranque ---------------- */
  function boot() {
    $('#footerYear').textContent = new Date().getFullYear();
    icons();

    var back = document.getElementById('backLink');
    if (back && !Api.isMock) {
      back.href = location.href.split('?')[0].replace(/\/dashboard\/?$/, '/') || '../';
    }

    if (Api.isMock) {
      var gate = $('#gateForm');
      if (gate && !document.getElementById('mockHint')) {
        var p = document.createElement('p');
        p.id = 'mockHint';
        p.className = 'hint text-center';
        p.style.marginTop = '10px';
        p.innerHTML = 'Modo local: la clave de prueba es <strong>demo2026</strong>.';
        gate.appendChild(p);
      }
    }

    var toggle = $('#toggleKey');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var input = $('#gateKey');
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.innerHTML = '<i data-lucide="' + (show ? 'eye-off' : 'eye') + '"></i>';
        toggle.setAttribute('aria-label', show ? 'Ocultar clave' : 'Mostrar clave');
        toggle.setAttribute('title', show ? 'Ocultar clave' : 'Mostrar clave');
        icons();
        input.focus();
      });
    }

    $('#gateForm').addEventListener('submit', function (e) {      e.preventDefault();
      var key = $('#gateKey').value.trim();
      if (!key) { $('#gateError').classList.remove('hidden'); return; }
      $('#gateBtn').disabled = true;
      loadData(key).catch(function () {
        $('#gateError').classList.remove('hidden');
        $('#gateBtn').disabled = false;
        $('#gateKey').select();
      });
    });

    $('#btnRefresh').addEventListener('click', function () {
      if (!state.key) return;
      $('#btnRefresh').disabled = true;
      loadData(state.key).then(function () { toast('Datos actualizados.'); })
        .catch(function () { toast('No se pudieron actualizar los datos.', 'error'); })
        .then(function () { $('#btnRefresh').disabled = false; });
    });

    $('#btnLogout').addEventListener('click', function () {
      try { sessionStorage.removeItem(SS_KEY); } catch (e) {}
      state.key = '';
      showGate(false);
      $('#gateKey').value = '';
    });

    $('#btnPrint').addEventListener('click', function () { window.print(); });
    $('#btnCsv').addEventListener('click', exportCsv);

    var savedKey = '';
    try { savedKey = sessionStorage.getItem(SS_KEY) || ''; } catch (e) {}
    if (savedKey) loadData(savedKey).catch(function () { showGate(false); });
    else showGate(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

