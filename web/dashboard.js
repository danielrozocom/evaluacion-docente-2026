/* ============================================================
   Dashboard de resultados · Evaluación Docente 2026
   Instrumento Sí / No → se reporta % de favorabilidad.
   ============================================================ */
(function () {
  'use strict';

  var LS_KEY = 'ed_dash_key';
  var LS_CACHE = 'ed_dash_cache';
  var COLORS = { yes: '#2f7d5b', no: '#c4553f' };

  function getSavedKey() {
    try {
      return localStorage.getItem(LS_KEY) || sessionStorage.getItem(LS_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setSavedKey(key) {
    try {
      localStorage.setItem(LS_KEY, key);
      sessionStorage.setItem(LS_KEY, key);
    } catch (e) {}
  }

  function clearSavedKey() {
    try {
      localStorage.removeItem(LS_KEY);
      sessionStorage.removeItem(LS_KEY);
      localStorage.removeItem(LS_CACHE);
    } catch (e) {}
  }

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
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  function photoHTML(t) {
    if (!t || !t.photo) return '';
    var src = (t.photo.startsWith('http') || t.photo.startsWith('/')) ? t.photo : ('../' + t.photo);
    return '<img src="' + esc(src) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()" />';
  }
  function avatarHTML(t, cls) {
    return '<span class="avatar ' + (cls || '') + '">' + esc(initials(t ? t.name : '')) + photoHTML(t) + '</span>';
  }

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

    var tId = String(r.teacherId != null ? r.teacherId : '');
    var tName = (r.teacherName || '').trim();

    // Reconciliar con state.config.teachers si el ID no coincide directamente (ej. si en la hoja se guardó un número o id alterno)
    if (state.config && state.config.teachers) {
      var found = state.config.teachers.filter(function (t) { return t.id === tId; })[0];
      if (!found && tName) {
        var foundByName = state.config.teachers.filter(function (t) {
          return t.name.toLowerCase().trim() === tName.toLowerCase();
        })[0];
        if (foundByName) {
          tId = foundByName.id;
        }
      }
    }

    return {
      timestamp: r.timestamp,
      period: r.period,
      grade: r.grade,
      gradeId: r.gradeId != null ? String(r.gradeId) : '',
      course: r.course,
      teacherId: tId,
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

  var AUTO_INTERVAL_MS = 30000;
  var autoTimer = null;
  var countdownTimer = null;
  var nextRefreshTime = 0;
  var autoRefreshEnabled = true;
  var isRefreshing = false;

  function loadData(key, isSilent) {
    if (!isSilent && !state.rows.length) {
      showLoading(true);
    }
    return Api.getDashboardData(key).then(function (res) {
      if (!res || res.ok === false) throw new Error((res && res.message) || 'No autorizado.');
      state.key = key;
      state.config = res.config;
      state.meta = (res.config && res.config.meta) || {};
      state.rows = (res.rows || []).map(normalizeRow);
      state.mock = !!res.mock;
      setSavedKey(key);

      // Guardar caché local para que futuras aperturas carguen en 0ms
      try {
        localStorage.setItem(LS_CACHE, JSON.stringify({
          config: res.config,
          meta: (res.config && res.config.meta) || {},
          rows: res.rows
        }));
      } catch (e) {}

      showLoading(false);
      setupDashboard();
      showDash();

      // Si el modal de detalle por docente está abierto, refrescarlo en vivo con los nuevos datos
      var modal = $('#modalTeacherDetail');
      if (modal && !modal.hidden && state.currentDetailTeacherId) {
        openTeacherDetail(state.currentDetailTeacherId);
      }

      if (!autoTimer && autoRefreshEnabled) {
        startAutoRefresh();
      }
    });
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    if (!autoRefreshEnabled || !state.key) return;

    nextRefreshTime = Date.now() + AUTO_INTERVAL_MS;
    updateAutoRefreshUI();

    autoTimer = setInterval(function () {
      if (document.hidden) return;
      silentRefresh();
    }, AUTO_INTERVAL_MS);

    countdownTimer = setInterval(updateCountdown, 1000);
  }

  function stopAutoRefresh() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    updateAutoRefreshUI();
  }

  function silentRefresh() {
    if (isRefreshing || !state.key) return;
    isRefreshing = true;
    var icon = $('#iconRefresh');
    if (icon) icon.classList.add('is-spinning');

    loadData(state.key, true)
      .catch(function (e) {
        console.warn('Auto-refresh silencioso:', e);
      })
      .then(function () {
        isRefreshing = false;
        if (icon) icon.classList.remove('is-spinning');
        nextRefreshTime = Date.now() + AUTO_INTERVAL_MS;
        updateCountdown();
      });
  }

  function updateCountdown() {
    if (!autoRefreshEnabled || !state.key) return;
    var remaining = Math.max(0, Math.round((nextRefreshTime - Date.now()) / 1000));
    var textEl = $('#autoRefreshText');
    if (textEl) {
      textEl.textContent = 'Auto ' + remaining + 's';
    }
  }

  function updateAutoRefreshUI() {
    var dot = $('#liveDot');
    var textEl = $('#autoRefreshText');
    var btn = $('#btnAutoRefresh');
    if (!dot || !textEl || !btn) return;

    if (autoRefreshEnabled && state.key) {
      dot.classList.remove('paused');
      btn.setAttribute('title', 'Auto-actualización cada 30s. Clic para pausar.');
    } else {
      dot.classList.add('paused');
      textEl.textContent = 'Auto Pausado';
      btn.setAttribute('title', 'Auto-actualización pausada. Clic para activar.');
    }
  }

  function toggleAutoRefresh() {
    autoRefreshEnabled = !autoRefreshEnabled;
    if (autoRefreshEnabled) {
      toast('Actualización automática activada (cada 30s).');
      silentRefresh();
      startAutoRefresh();
    } else {
      stopAutoRefresh();
      toast('Actualización automática pausada.');
    }
    updateAutoRefreshUI();
  }

  /* ---------------- Acceso ---------------- */
  function showGate(error) {
    showLoading(false);
    $('#dash').hidden = true;
    $('#gate').hidden = false;
    if (error) $('#gateError').classList.remove('hidden');
    else $('#gateError').classList.add('hidden');
    icons();
  }
  function showLoading(show) {
    var l = $('#gateLoading');
    if (l) l.hidden = !show;
    if (show) {
      $('#gate').hidden = true;
      $('#dash').hidden = true;
      icons();
    }
  }
  function showDash() {
    showLoading(false);
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

    var prevGrade = state.filters.grade;
    var prevTeacher = state.filters.teacher;
    var prevSearch = state.filters.search;

    $('#fGrade').innerHTML = '<option value="">Todos los grados</option>' + cfg.grades.map(function (g) {
      return '<option value="' + esc(g.id) + '">' + esc(g.name) + '</option>';
    }).join('');

    var teachers = cfg.teachers.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    $('#fTeacher').innerHTML = '<option value="">Todos los docentes</option>' + teachers.map(function (t) {
      return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>';
    }).join('');

    if (prevGrade) $('#fGrade').value = prevGrade;
    if (prevTeacher) $('#fTeacher').value = prevTeacher;
    if (prevSearch && $('#fSearch')) $('#fSearch').value = prevSearch;

    bindFilters();
    bindInteractions();
    renderAll();
  }

  function bindInteractions() {
    if (state.interactionsBound) return;
    state.interactionsBound = true;

    var tbody = $('#tableTeachers tbody');
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var row = e.target.closest('[data-teacher-id]');
        if (row) {
          var id = row.getAttribute('data-teacher-id');
          if (id) openTeacherDetail(id);
        }
      });
    }

    var chart = $('#chartTeachers');
    if (chart) {
      chart.addEventListener('click', function (e) {
        var row = e.target.closest('[data-teacher-id]');
        if (row) {
          var id = row.getAttribute('data-teacher-id');
          if (id) openTeacherDetail(id);
        }
      });
    }

    var closeBtn = $('#modalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeTeacherDetail);

    var closeBottom = $('#modalCloseBottomBtn');
    if (closeBottom) closeBottom.addEventListener('click', closeTeacherDetail);

    var modal = $('#modalTeacherDetail');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target.id === 'modalTeacherDetail') closeTeacherDetail();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeTeacherDetail();
    });
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

    // Total de matrícula esperada según filtros aplicados (sin truncar por grados que ya respondieron)
    var expected = 0;
    if (state.filters.teacher) {
      var tObj = (state.config.teachers || []).filter(function (t) { return t.id === state.filters.teacher; })[0];
      if (tObj && tObj.assignments) {
        var relAssigns = tObj.assignments;
        if (state.filters.grade) {
          relAssigns = relAssigns.filter(function (a) { return a.gradeId === state.filters.grade; });
        }
        var teacherCourses = new Set(relAssigns.map(function (a) { return a.course; }));
        var studentsSum = 0;
        (state.config.grades || []).forEach(function (g) {
          (g.courseStudents || []).forEach(function (cs) {
            if (teacherCourses.has(cs.course)) studentsSum += (Number(cs.students) || 0);
          });
        });
        expected = studentsSum;
      }
    } else if (state.filters.grade) {
      var gObj = (state.config.grades || []).filter(function (g) { return g.id === state.filters.grade; })[0];
      expected = gObj ? (Number(gObj.students) || 0) : 0;
    } else {
      expected = (state.config.grades || []).reduce(function (a, g) { return a + (Number(g.students) || 0); }, 0);
    }

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
      var w = Math.min(100, Math.max(0, t.avg)).toFixed(1);
      return '<div class="bar-row is-clickable" data-teacher-id="' + esc(t.id) + '" title="Clic para ver detalle de ' + esc(t.name) + '">' +
        '<span class="bar-name">' + esc(t.name) + (low ? ' <span class="badge badge-warning" style="margin-left:4px;">preliminar</span>' : '') + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + w + '%"></span></span>' +
        '<span class="bar-value">' + fmtPct(t.avg) + '</span></div>';
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
      ' · ' + s.total + (s.total === 1 ? ' evaluación' : ' evaluaciones') + ' · Clic en un docente para ver el detalle';
    $('#tableCount').textContent = s.total + ' registros';

    if (!s.byTeacher.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty">No hay evaluaciones con estos filtros.</div></td></tr>';
      return;
    }

    tbody.innerHTML = s.byTeacher.map(function (t) {
      var lv = level(t.avg, t.n);
      var teacher = (state.config.teachers || []).filter(function (x) {
        return x.id === t.id || (t.name && x.name.toLowerCase().trim() === t.name.toLowerCase().trim());
      })[0];

      return '<tr class="is-clickable" data-teacher-id="' + esc(t.id) + '" title="Clic para ver detalle de ' + esc(t.name) + '">' +
        '<td data-label="Docente">' +
          '<div class="teacher-cell">' +
            avatarHTML(teacher || { name: t.name, photo: '' }) +
            '<div class="teacher-info">' +
              '<div class="cell-strong">' + esc(t.name) + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td data-label="Grados"><div class="chips-wrap">' + t.grades.map(function (g) { return '<span class="chip">' + esc(g) + '</span>'; }).join(' ') + '</div></td>' +
        '<td data-label="Evaluaciones" class="text-right-dt"><span class="td-val">' + t.n + '</span>' + (minN && t.n < minN ? ' <span class="badge badge-warning">bajo</span>' : '') + '</td>' +
        '<td data-label="Favorabilidad" class="text-right-dt"><span class="num-tag ' + lv.tag + '">' + fmtPct(t.avg) + '</span></td>' +
        '<td data-label="Nivel" class="text-right-dt"><span class="badge ' + lv.cls + '">' + lv.text + '</span></td>' +
        '<td data-label="Acción" class="text-right-dt">' +
          '<button class="btn btn-outline btn-sm btn-detail" type="button" data-teacher-id="' + esc(t.id) + '">' +
            '<i data-lucide="eye"></i><span>Ver detalle</span>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
    icons();
  }

  /* ---------------- Modal de Detalle por Docente ---------------- */
  function openTeacherDetail(teacherId) {
    state.currentDetailTeacherId = teacherId;
    var teacher = (state.config.teachers || []).filter(function (t) {
      return t.id === teacherId || (t.name && t.name.toLowerCase().trim() === String(teacherId).toLowerCase().trim());
    })[0];
    var realId = (teacher && teacher.id) || teacherId;

    var teacherRows = state.filtered.filter(function (r) {
      return r.teacherId === teacherId || r.teacherId === realId || (teacher && r.teacherName === teacher.name);
    });

    if (!teacherRows.length) {
      teacherRows = state.rows.filter(function (r) {
        return r.teacherId === teacherId || r.teacherId === realId || (teacher && r.teacherName === teacher.name);
      });
    }

    var name = (teacher && teacher.name) || (teacherRows[0] && teacherRows[0].teacherName) || 'Docente';
    var tObj = teacher || (teacherRows[0] ? (state.config.teachers || []).filter(function (x) { return x.name === teacherRows[0].teacherName; })[0] : null) || { name: name, photo: '' };

    var subjects = teacher && teacher.assignments
      ? Array.from(new Set(teacher.assignments.map(function (a) { return a.subject; }).filter(Boolean))).join(', ')
      : (teacherRows[0] ? teacherRows[0].subject : '');

    var subtitle = subjects || 'Docente de bachillerato';

    $('#modalTeacherAvatar').innerHTML = esc(initials(name)) + photoHTML(tObj);
    $('#modalTeacherName').textContent = name;
    $('#modalTeacherSubjects').textContent = subtitle;

    if (!teacherRows.length) {
      $('#modalTeacherKpis').innerHTML =
        '<div class="kpi"><div class="kpi-label">Evaluaciones</div><div class="kpi-value">0</div><div class="kpi-sub">Sin respuestas</div></div>' +
        '<div class="kpi"><div class="kpi-label">Favorabilidad</div><div class="kpi-value">—</div><div class="kpi-sub"><span class="badge">Sin datos</span></div></div>';
      $('#modalTeacherBreakdown').innerHTML = '<div class="card card-pad" style="grid-column:1/-1;"><div class="empty">Este docente aún no tiene evaluaciones registradas.</div></div>';
      $('#modalTeacherResources').innerHTML = '<div class="empty">Sin datos de recursos.</div>';
      $('#modalTeacherQuestions').innerHTML = '<div class="empty">No hay preguntas respondidas aún para este docente.</div>';
      $('#modalCommentsCount').textContent = '0 comentarios';
      $('#modalTeacherComments').innerHTML = '<div class="empty">No hay comentarios aún.</div>';
      $('#modalTeacherDetail').hidden = false;
      document.body.style.overflow = 'hidden';
      icons();
      return;
    }

    var vals = [];
    teacherRows.forEach(function (r) {
      Object.keys(r.answers).forEach(function (k) { vals.push(r.answers[k]); });
    });
    var yes = vals.filter(function (v) { return v === 1; }).length;
    var no = vals.length - yes;
    var avg = vals.length ? (yes / vals.length) * 100 : 0;
    var lv = level(avg, teacherRows.length);

    var comments = teacherRows
      .map(function (r) { return { text: (r.comment || '').trim(), grade: r.grade, timestamp: r.timestamp }; })
      .filter(function (c) { return c.text.length > 0; });

    // 1. KPIs
    $('#modalTeacherKpis').innerHTML =
      '<div class="kpi">' +
        '<div class="kpi-label">Evaluaciones</div>' +
        '<div class="kpi-value">' + teacherRows.length + '</div>' +
        '<div class="kpi-sub">Estudiantes evaluaron</div>' +
      '</div>' +
      '<div class="kpi">' +
        '<div class="kpi-label">Favorabilidad</div>' +
        '<div class="kpi-value">' + fmtPct(avg) + '</div>' +
        '<div class="kpi-sub"><span class="badge ' + lv.cls + '">' + lv.text + '</span></div>' +
      '</div>' +
      '<div class="kpi">' +
        '<div class="kpi-label">Respuestas Sí / No</div>' +
        '<div class="kpi-value" style="font-size:22px;">' + yes + ' <span class="small muted">/ ' + no + '</span></div>' +
        '<div class="kpi-sub">' + fmtPct(vals.length ? (yes / vals.length) * 100 : 0) + ' respuestas Sí</div>' +
      '</div>' +
      '<div class="kpi">' +
        '<div class="kpi-label">Comentarios</div>' +
        '<div class="kpi-value">' + comments.length + '</div>' +
        '<div class="kpi-sub">' + (comments.length === 1 ? 'Opinión escrita' : 'Opiniones escritas') + '</div>' +
      '</div>';

    // 2. Desglose por dimensiones y por grados
    var dimHtml = (state.config.dimensions || []).map(function (d) {
      var dVals = [];
      teacherRows.forEach(function (r) {
        Object.keys(r.answers).forEach(function (k) {
          var q = questionOf(k);
          if (q && q.dimension === d.id) dVals.push(r.answers[k]);
        });
      });
      var dYes = dVals.filter(function (v) { return v === 1; }).length;
      var dAvg = dVals.length ? (dYes / dVals.length) * 100 : 0;
      var dLv = level(dAvg, teacherRows.length);
      return '<div style="margin-bottom:10px;">' +
        '<div class="row-between small" style="margin-bottom:4px;">' +
          '<span class="fw-bold">' + esc(d.name) + '</span>' +
          '<span class="num-tag ' + dLv.tag + '" style="font-size:11px;height:20px;">' + fmtPct(dAvg) + '</span>' +
        '</div>' +
        '<div class="bar-track" style="height:6px;"><span class="bar-fill ' + dLv.tag + '" style="width:' + dAvg.toFixed(1) + '%"></span></div>' +
      '</div>';
    }).join('');

    var gradesSet = Array.from(new Set(teacherRows.map(function (r) { return r.grade; }).filter(Boolean)));
    var gradeHtml = gradesSet.map(function (gName) {
      var gRows = teacherRows.filter(function (r) { return r.grade === gName; });
      var gVals = [];
      gRows.forEach(function (r) { Object.keys(r.answers).forEach(function (k) { gVals.push(r.answers[k]); }); });
      var gYes = gVals.filter(function (v) { return v === 1; }).length;
      var gAvg = gVals.length ? (gYes / gVals.length) * 100 : 0;
      var gLv = level(gAvg, gRows.length);
      return '<div class="row-between" style="padding:6px 0;border-bottom:1px solid #f1f3f9;">' +
        '<div><span class="chip">' + esc(gName) + '</span> <span class="small muted">(' + gRows.length + ' eval.)</span></div>' +
        '<span class="num-tag ' + gLv.tag + '" style="font-size:11px;height:20px;">' + fmtPct(gAvg) + '</span>' +
      '</div>';
    }).join('');

    $('#modalTeacherBreakdown').innerHTML =
      '<div class="card card-pad">' +
        '<div class="chart-title">Favorabilidad por dimensión</div>' +
        '<div class="chart-sub" style="margin-bottom:12px;">Desempeño según dimensiones</div>' +
        dimHtml +
      '</div>' +
      '<div class="card card-pad">' +
        '<div class="chart-title">Evaluaciones por grado</div>' +
        '<div class="chart-sub" style="margin-bottom:12px;">Resultados por cada grado</div>' +
        (gradeHtml || '<div class="empty">Sin desglose de grados</div>') +
      '</div>';

    // 3. Recursos de aula
    var resOpts = (state.config.resources && state.config.resources.options) || [];
    var totalTeacherEvals = teacherRows.length || 1;
    var resHtml = resOpts.map(function (opt) {
      var count = teacherRows.filter(function (r) {
        return (r.resources || []).some(function (res) {
          var s = String(res || '').toLowerCase();
          return s === opt.id.toLowerCase() || s === opt.label.toLowerCase();
        });
      }).length;
      var p = (count / totalTeacherEvals) * 100;
      return '<div class="bar-row">' +
        '<div class="bar-name" title="' + esc(opt.label) + '">' + esc(opt.label) + '</div>' +
        '<div class="bar-track"><span class="bar-fill" style="width:' + p.toFixed(1) + '%"></span></div>' +
        '<div class="bar-value" style="font-size:11.5px;">' + count + ' <small class="muted">(' + Math.round(p) + '%)</small></div>' +
      '</div>';
    }).join('');
    $('#modalTeacherResources').innerHTML = resHtml || '<div class="empty">No hay datos de recursos.</div>';

    // 4. Preguntas (q1 a q20)
    var qs = state.config.questions || [];
    var questionsHtml = qs.map(function (q, idx) {
      var qYes = teacherRows.filter(function (r) { return r.answers[q.id] === 1; }).length;
      var qNo = teacherRows.filter(function (r) { return r.answers[q.id] === 0; }).length;
      var qTotal = qYes + qNo;
      var qPct = qTotal ? (qYes / qTotal) * 100 : 0;
      var qLv = level(qPct, qTotal);
      var dim = (state.config.dimensions || []).filter(function (d) { return d.id === q.dimension; })[0];
      var dimName = dim ? dim.name : q.dimension;

      return '<div style="padding:10px 0;border-bottom:1px solid #eef1f7;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px;">' +
          '<div style="font-size:13px;line-height:1.45;flex:1;">' +
            '<span class="badge" style="margin-right:6px;font-size:10px;vertical-align:1px;">P' + (idx + 1) + '</span>' +
            esc(q.text) +
          '</div>' +
          '<div style="text-align:right;white-space:nowrap;">' +
            '<span class="num-tag ' + qLv.tag + '">' + fmtPct(qPct) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="bar-track" style="height:7px;"><span class="bar-fill ' + qLv.tag + '" style="width:' + qPct.toFixed(1) + '%"></span></div>' +
        '<div class="row-between small muted" style="font-size:11px;margin-top:4px;">' +
          '<span>Dimensión: ' + esc(dimName) + '</span>' +
          '<span><strong>' + qYes + ' Sí</strong> (' + fmtPct(qPct) + ') · <strong>' + qNo + ' No</strong></span>' +
        '</div>' +
      '</div>';
    }).join('');
    $('#modalTeacherQuestions').innerHTML = questionsHtml;

    // 5. Comentarios
    $('#modalCommentsCount').textContent = comments.length + (comments.length === 1 ? ' comentario' : ' comentarios');
    if (!comments.length) {
      $('#modalTeacherComments').innerHTML = '<div class="empty">No se registraron comentarios de texto para este docente.</div>';
    } else {
      $('#modalTeacherComments').innerHTML = comments.map(function (c) {
        var dStr = c.timestamp ? new Date(c.timestamp).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
        return '<div class="comment-card">' +
          '<div class="comment-text">“' + esc(c.text) + '”</div>' +
          '<div class="row-between small muted" style="font-size:11px;">' +
            '<span>' + (c.grade ? ('Grado ' + esc(c.grade)) : 'Estudiante anónimo') + '</span>' +
            '<span>' + esc(dStr) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    $('#modalTeacherDetail').hidden = false;
    document.body.style.overflow = 'hidden';
    icons();
  }

  function closeTeacherDetail() {
    state.currentDetailTeacherId = null;
    var m = $('#modalTeacherDetail');
    if (m) m.hidden = true;
    document.body.style.overflow = '';
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
      if (gate && !document.getElementById('mockNote')) {
        var note = document.createElement('p');
        note.id = 'mockNote';
        note.className = 'hint text-center';
        note.style.marginTop = '10px';
        note.textContent = 'Modo local de prueba: escribe cualquier clave para ver el dashboard.';
        gate.appendChild(note);
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
      var icon = $('#iconRefresh');
      if (icon) icon.classList.add('is-spinning');
      loadData(state.key).then(function () { toast('Datos actualizados.'); })
        .catch(function () { toast('No se pudieron actualizar los datos.', 'error'); })
        .then(function () {
          $('#btnRefresh').disabled = false;
          if (icon) icon.classList.remove('is-spinning');
          nextRefreshTime = Date.now() + AUTO_INTERVAL_MS;
          updateCountdown();
        });
    });

    var autoBtn = $('#btnAutoRefresh');
    if (autoBtn) autoBtn.addEventListener('click', toggleAutoRefresh);

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && autoRefreshEnabled && state.key && (Date.now() > nextRefreshTime)) {
        silentRefresh();
      }
    });

    $('#btnLogout').addEventListener('click', function () {
      stopAutoRefresh();
      clearSavedKey();
      state.key = '';
      showGate(false);
      $('#gateKey').value = '';
    });

    $('#btnPrint').addEventListener('click', function () { window.print(); });
    $('#btnCsv').addEventListener('click', exportCsv);

    var savedKey = getSavedKey();
    if (savedKey) {
      // 1. Cargar instantáneamente (0ms) desde caché local si existe
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem(LS_CACHE) || 'null'); } catch (e) {}
      if (cached && cached.config && cached.rows) {
        state.key = savedKey;
        state.config = cached.config;
        state.meta = cached.meta || {};
        state.rows = (cached.rows || []).map(normalizeRow);
        setupDashboard();
        showDash();
      } else {
        showLoading(true);
      }

      // 2. Traer en segundo plano los datos actualizados del servidor
      loadData(savedKey, true).catch(function () {
        clearSavedKey();
        showGate(true);
      });
    } else {
      showGate(false);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

