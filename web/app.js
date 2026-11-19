/* ============================================================
   Evaluación Docente · Bachillerato 2026
   Lógica de la aplicación del estudiante (Vanilla JS)
   ============================================================ */
(function () {
  'use strict';

  var LS_STUDENT = 'ed_student_v1';
  var LS_PROGRESS = 'ed_progress_v1';

  var state = {
    config: null,
    settings: {},
    meta: {},
    grades: [],
    teachers: [],
    questions: [],
    dimensions: [],
    student: null,
    gradeTeachers: [],
    evaluated: new Set(),
    currentTeacher: null,
    answers: {},
    resources: [],
    mock: false
  };

  /* ---------------- Utilidades DOM ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function icons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  function pct(part, total) { return total ? Math.round((part / total) * 100) : 0; }
  function photoHTML(t) {
    if (!t || !t.photo) return '';
    return '<img src="' + esc(t.photo) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()" />';
  }
  function avatarHTML(t, cls) {
    return '<span class="avatar ' + (cls || '') + '">' + esc(initials(t.name)) + photoHTML(t) + '</span>';
  }

  function toast(message, type) {
    var wrap = $('#toastWrap');
    var t = document.createElement('div');
    t.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    t.innerHTML = '<i data-lucide="' + (type === 'error' ? 'circle-alert' : 'circle-check') + '"></i><div>' + esc(message) + '</div>';
    wrap.appendChild(t);
    icons();
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transition = 'opacity 200ms ease';
      setTimeout(function () { t.remove(); }, 220);
    }, 3600);
  }

  function showScreen(id) {
    ['screen-welcome', 'screen-teachers', 'screen-eval', 'screen-done'].forEach(function (s) {
      var node = document.getElementById(s);
      if (node) node.hidden = s !== id;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    icons();
  }

  /* ---------------- Modal de confirmación ---------------- */
  var modalResolve = null;

  function showConfirm(opts) {
    return new Promise(function (resolve) {
      modalResolve = resolve;
      var el = document.getElementById('appModal');
      document.getElementById('modalTitle').textContent = opts.title || 'Confirmar';
      document.getElementById('modalText').textContent = opts.message || '';
      document.getElementById('modalOk').textContent = opts.confirmText || 'Confirmar';
      document.getElementById('modalCancel').textContent = opts.cancelText || 'Cancelar';
      document.getElementById('modalIcon').innerHTML = '<i data-lucide="' + (opts.icon || 'triangle-alert') + '"></i>';
      el.hidden = false;
      document.body.style.overflow = 'hidden';
      icons();
      setTimeout(function () {
        var b = document.getElementById('modalOk');
        if (b) b.focus();
      }, 40);
    });
  }

  function closeModal(result) {
    var el = document.getElementById('appModal');
    if (!el || el.hidden) return;
    el.hidden = true;
    document.body.style.overflow = '';
    if (modalResolve) {
      var r = modalResolve;
      modalResolve = null;
      r(result);
    }
  }

  /* ---------------- Persistencia local ---------------- */
  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado */ }
  }
  function saveStudent(student) { writeJSON(LS_STUDENT, student); }
  function loadStudent() { return readJSON(LS_STUDENT, null); }

  // Identificador anónimo del dispositivo (sin pedir datos personales).
  function anonId() {
    var key = 'ed_anon_id';
    var id = '';
    try { id = localStorage.getItem(key) || ''; } catch (e) {}
    if (!id) {
      id = 'anon-' + ((window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
      try { localStorage.setItem(key, id); } catch (e) {}
    }
    return id;
  }

  function localProgress(doc) {
    var all = readJSON(LS_PROGRESS, {});
    var period = (state.meta && state.meta.period) || 'default';
    return (all[doc] && all[doc][period]) || [];
  }
  function addLocalProgress(doc, teacherId) {
    var all = readJSON(LS_PROGRESS, {});
    var period = (state.meta && state.meta.period) || 'default';
    all[doc] = all[doc] || {};
    var list = all[doc][period] || [];
    if (list.indexOf(teacherId) === -1) list.push(teacherId);
    all[doc][period] = list;
    writeJSON(LS_PROGRESS, all);
  }

  /* ---------------- Datos académicos ---------------- */
  function teachersForGrade(gradeId) {
    var out = [];
    state.teachers.forEach(function (t) {
      var has = (t.assignments || []).some(function (a) { return String(a.gradeId) === String(gradeId); });
      if (!has) return;
      out.push({ id: String(t.id), name: t.name, photo: t.photo || null });
    });
    return out.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
  }

  function currentGrade() {
    if (!state.student) return null;
    return state.grades.filter(function (g) { return String(g.id) === String(state.student.gradeId); })[0] || null;
  }

  /* ---------------- Pantalla 1: datos ---------------- */
  function initSelects() {
    var gradeSel = $('#selGrade');
    gradeSel.innerHTML = '<option value="">Selecciona tu grado</option>' +
      state.grades.map(function (g) {
        return '<option value="' + esc(g.id) + '">' + esc(g.name) + '</option>';
      }).join('');
  }

  function markInvalid(fieldId, invalid) {
    var f = document.getElementById(fieldId);
    if (!f) return;
    f.classList.toggle('is-invalid', !!invalid);
    var input = f.querySelector('input, select');
    if (input) input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function validateStudent() {
    var gradeId = $('#selGrade').value;
    if (!gradeId) { markInvalid('fieldGrade', true); return null; }
    markInvalid('fieldGrade', false);
    return { id: anonId(), gradeId: gradeId };
  }

  function onStudentSubmit(e) {
    e.preventDefault();
    var student = validateStudent();
    if (!student) {
      toast('Selecciona tu grado para continuar.', 'error');
      return;
    }
    var g = state.grades.filter(function (x) { return String(x.id) === String(student.gradeId); })[0];
    var name = g ? g.name : '';

    showConfirm({
      title: 'Confirma tu grado',
      message: 'Vas a evaluar a los docentes de ' + name + '.\n\nAl iniciar no podrás cambiar de grado en esta sesión. Tu evaluación es anónima.',
      confirmText: 'Sí, comenzar',
      cancelText: 'Cancelar',
      icon: 'school'
    }).then(function (ok) {
      if (ok) enterAsStudent(student);
    });
  }

  function enterAsStudent(student) {
    state.student = student;
    saveStudent(student);

    $('#btnStart').disabled = true;
    Api.getStudentProgress(student.id).then(function (res) {
      var serverList = (res && res.evaluated) || [];
      var localList = localProgress(student.id);
      var merged = serverList.concat(localList);
      state.evaluated = new Set(merged.map(String));

      state.gradeTeachers = teachersForGrade(student.gradeId);

      renderTeachers();
      showScreen('screen-teachers');
      if (res && res.ok === false) toast('No se pudo verificar tu avance en línea.', 'error');
    }).catch(function () {
      state.gradeTeachers = teachersForGrade(student.gradeId);
      state.evaluated = new Set(localProgress(student.id).map(String));
      renderTeachers();
      showScreen('screen-teachers');
      toast('Sin conexión con el servidor: tu avance se guardó en este dispositivo.', 'error');
    }).then(function () {
      $('#btnStart').disabled = false;
    });
  }

  /* ---------------- Pantalla 2: docentes ---------------- */
  function renderStudentHeader() {
    var g = currentGrade();
    $('#teacherEyebrow').textContent = 'Docentes de ' + (g ? g.name : '');
    $('#teacherTitle').textContent = 'Elige un docente para evaluar';
    var badge = $('#gradeBadge');
    if (badge) badge.querySelector('span').textContent = g ? ('Grado ' + g.name) : '—';
  }

  function renderProgress() {
    var total = state.gradeTeachers.length;
    var done = state.gradeTeachers.filter(function (t) { return state.evaluated.has(String(t.id)); }).length;
    var p = pct(done, total);
    $('#progressBar').style.width = p + '%';
    $('#progressPct').textContent = p + '%';
    $('#progressBadge').querySelector('span').textContent = done + ' de ' + total + ' evaluados';
    $('#progressText').textContent = done === 0
      ? 'Aún no has evaluado ningún docente.'
      : (done === total ? '¡Completaste todos los docentes de tu grado!' : 'Te faltan ' + (total - done) + ' docentes por evaluar.');
    $('#teachersFooter').hidden = done < total || total === 0;
  }

  function renderTeachers() {
    renderStudentHeader();

    var grid = $('#teacherGrid');
    grid.innerHTML = state.gradeTeachers.map(function (t) {
      var done = state.evaluated.has(String(t.id));
      return '' +
        '<article class="teacher-card' + (done ? ' is-done' : '') + '" data-teacher="' + esc(t.id) + '">' +
          avatarHTML(t) +
          '<div class="teacher-main">' +
            '<div class="teacher-name">' + esc(t.name) + '</div>' +
            (done ? '<span class="done-flag"><i data-lucide="badge-check"></i>Evaluado</span>' : '') +
          '</div>' +
          (done
            ? '<span class="badge badge-success"><i data-lucide="check"></i>Listo</span>'
            : '<button class="btn btn-sm" type="button" data-action="evaluate" data-teacher="' + esc(t.id) + '"><span>Evaluar</span><i data-lucide="arrow-right"></i></button>') +
        '</article>';
    }).join('');

    if (!state.gradeTeachers.length) {
      grid.innerHTML = '<div class="card empty">No hay docentes registrados para este grado.</div>';
    }

    grid.onclick = function (ev) {
      var btn = ev.target.closest('[data-action="evaluate"]');
      if (!btn) return;
      openEvaluation(btn.getAttribute('data-teacher'));
    };

    renderProgress();
    icons();
  }

  /* ---------------- Pantalla 3: cuestionario ---------------- */
  function openEvaluation(teacherId) {
    var teacher = state.gradeTeachers.filter(function (t) { return String(t.id) === String(teacherId); })[0];
    if (!teacher) return;

    if (state.evaluated.has(String(teacher.id))) {
      toast('Ya evaluaste a este docente. Solo se permite una vez.', 'error');
      return;
    }

    state.currentTeacher = teacher;
    state.answers = {};
    state.resources = [];
    renderEvaluation();
    showScreen('screen-eval');
  }

  function renderEvaluation() {
    var t = state.currentTeacher;

    $('#evalAvatar').innerHTML = esc(initials(t.name)) + photoHTML(t);
    $('#evalName').textContent = t.name;

    var dimIcons = { profesor: 'presentation', clases: 'school' };
    var qNumber = 0;
    var html = '';

    if (state.meta.intro) {
      html += '<div class="card intro-card">' +
        '<i data-lucide="info"></i>' +
        '<p>' + esc(state.meta.intro) + '</p>' +
        '</div>';
    }

    state.dimensions.forEach(function (dim) {
      var qs = state.questions.filter(function (q) { return q.dimension === dim.id; });
      if (!qs.length) return;
      html += '<section class="card" data-dimension="' + esc(dim.id) + '">' +
        '<div class="dimension-head">' +
          '<div class="dimension-icon"><i data-lucide="' + (dimIcons[dim.id] || 'sparkles') + '"></i></div>' +
          '<div><div class="dimension-title">' + esc(dim.name) + '</div>' +
          '<div class="dimension-desc">' + esc(dim.description || '') + '</div></div>' +
        '</div>' +
        '<div class="card-body" style="padding-top:4px;padding-bottom:4px;">' +
        qs.map(function (q) {
          qNumber++;
          return '<div class="question-block" data-question="' + esc(q.id) + '">' +
            '<div class="question-text"><span class="qnum">' + qNumber + '</span><span>' + esc(q.text) + '</span></div>' +
            '<div class="scale scale-yesno" role="radiogroup" aria-label="' + esc(q.text) + '">' +
              '<label class="scale-option"><input type="radio" name="' + esc(q.id) + '" value="1" />' +
                '<span class="scale-label"><i data-lucide="check"></i><span class="txt">Sí</span></span></label>' +
              '<label class="scale-option"><input type="radio" name="' + esc(q.id) + '" value="0" />' +
                '<span class="scale-label"><i data-lucide="x"></i><span class="txt">No</span></span></label>' +
            '</div></div>';
        }).join('') +
        '</div></section>';
    });

    var res = state.config.resources;
    if (res && res.options && res.options.length) {
      html += '<section class="card" id="resourcesCard">' +
        '<div class="dimension-head">' +
          '<div class="dimension-icon"><i data-lucide="shapes"></i></div>' +
          '<div><div class="dimension-title">' + esc(res.title || 'Recursos') + '</div>' +
          '<div class="dimension-desc">' + esc(res.hint || '') + '</div></div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="check-grid">' +
          res.options.map(function (o) {
            return '<label class="check-option">' +
              '<input type="checkbox" name="resource" value="' + esc(o.id) + '" />' +
              '<span>' + esc(o.label) + '</span></label>';
          }).join('') +
          '</div>' +
        '</div></section>';
    }

    $('#questionsContainer').innerHTML = html;
    $('#answeredHint').textContent = '0 de ' + state.questions.length + ' preguntas respondidas';
    $('#txtComment').value = '';
    updateCommentCount();
    $('#commentCard').hidden = state.settings.allowComment === false;
    $('#btnSubmit').disabled = false;

    $('#questionsContainer').onchange = function (ev) {
      var input = ev.target;
      if (!input) return;

      if (input.type === 'radio') {
        state.answers[input.name] = Number(input.value);
        var block = input.closest('[data-question]');
        if (block) block.classList.remove('is-invalid');
        updateAnswered();
      }

      if (input.type === 'checkbox' && input.name === 'resource') {
        var idx = state.resources.indexOf(input.value);
        if (input.checked && idx === -1) state.resources.push(input.value);
        if (!input.checked && idx !== -1) state.resources.splice(idx, 1);
      }
    };

    icons();
  }

  function updateAnswered() {
    var n = Object.keys(state.answers).length;
    $('#answeredHint').textContent = n + ' de ' + state.questions.length + ' preguntas respondidas';
  }

  function updateCommentCount() {
    var v = $('#txtComment').value || '';
    $('#commentCount').textContent = v.length + ' / 600';
  }

  function onSubmitEvaluation(e) {
    e.preventDefault();
    var t = state.currentTeacher;
    if (!t) return;

    var missing = state.questions.filter(function (q) { return state.answers[q.id] === undefined; });
    if (missing.length) {
      missing.forEach(function (q) {
        var block = document.querySelector('[data-question="' + q.id + '"]');
        if (block) block.classList.add('is-invalid');
      });
      toast('Responde todas las preguntas antes de enviar.', 'error');
      var first = document.querySelector('.question-block.is-invalid');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var btn = $('#btnSubmit');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Enviando…';

    var g = currentGrade();
    var payload = {
      period: (state.meta && state.meta.period) || '2026',
      grade: g ? g.name : '',
      gradeId: g ? g.id : '',
      teacherId: t.id,
      teacherName: t.name,
      studentId: state.student.id,
      answers: state.answers,
      resources: state.resources.slice(),
      comment: ($('#txtComment').value || '').trim()
    };

    Api.submitEvaluation(payload).then(function (res) {
      if (res && res.ok === false) throw new Error(res.message || 'No se pudo guardar.');
      completeEvaluation(t);
    }).catch(function (err) {
      var msg = (err && err.message) || 'No se pudo guardar la evaluación.';
      if (err && err.code === 'DUPLICATE' || /ya evaluaste|duplicad/i.test(msg)) {
        completeEvaluation(t, true);
        return;
      }
      toast(msg, 'error');
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Enviar evaluación';
    });
  }

  function completeEvaluation(teacher, duplicated) {
    state.evaluated.add(String(teacher.id));
    addLocalProgress(state.student.id, String(teacher.id));
    state.currentTeacher = null;
    state.answers = {};
    state.resources = [];
    renderTeachers();
    renderDone(duplicated);
    showScreen('screen-done');
    toast(duplicated ? 'Este docente ya había sido evaluado.' : '¡Evaluación enviada con éxito!');
  }

  /* ---------------- Pantalla 4: resumen ---------------- */
  function renderDone(duplicated) {
    var total = state.gradeTeachers.length;
    var done = state.gradeTeachers.filter(function (t) { return state.evaluated.has(String(t.id)); }).length;
    var pending = state.gradeTeachers.filter(function (t) { return !state.evaluated.has(String(t.id)); });
    var p = pct(done, total);

    $('#doneTitle').textContent = pending.length ? '¡Gracias por tu evaluación!' : '¡Completaste la evaluación!';
    $('#doneText').textContent = pending.length
      ? (duplicated ? 'Ya teníamos registrada tu evaluación de este docente.' : 'Tus respuestas se registraron correctamente.') +
        ' Aún puedes evaluar a ' + pending.length + ' docente' + (pending.length === 1 ? '' : 's') + ' más.'
      : 'Evaluaste a los ' + total + ' docentes de tu grado. Tu opinión cuenta muchísimo.';

    $('#doneEvaluated').textContent = done;
    $('#donePending').textContent = pending.length;
    $('#donePct').innerHTML = p + '<small>%</small>';
    $('#doneBar').style.width = p + '%';

    $('#pendingList').innerHTML = pending.map(function (t) {
      return '<div class="card card-pad" style="display:flex;align-items:center;gap:12px;text-align:left;">' +
        avatarHTML(t) +
        '<div class="teacher-main" style="flex:1;min-width:0;"><div class="teacher-name">' + esc(t.name) + '</div></div>' +
        '<button class="btn btn-sm" type="button" data-next="' + esc(t.id) + '"><span>Evaluar</span><i data-lucide="arrow-right"></i></button>' +
        '</div>';
    }).join('');

    $('#pendingList').onclick = function (ev) {
      var b = ev.target.closest('[data-next]');
      if (b) openEvaluation(b.getAttribute('data-next'));
    };

    $('#btnDoneNext').hidden = !pending.length;
    $('#btnDoneNext').onclick = function () { if (pending[0]) openEvaluation(pending[0].id); };
    icons();
  }

  /* ---------------- Cierre de sesión anónima ---------------- */
  function finishSession() {
    var total = state.gradeTeachers.length;
    var done = state.gradeTeachers.filter(function (t) { return state.evaluated.has(String(t.id)); }).length;
    var pending = total - done;

    var message = pending > 0
      ? 'Aún faltan ' + pending + (pending === 1 ? ' docente' : ' docentes') + ' por evaluar.\n\nSi finalizas ahora, el dispositivo quedará listo para otro estudiante y no podrás continuar con este identificador anónimo.'
      : 'La encuesta quedará cerrada.\n\nEl dispositivo quedará listo para otro estudiante con un nuevo identificador anónimo.';

    showConfirm({
      title: 'Finalizar encuesta',
      message: message,
      confirmText: 'Finalizar encuesta',
      cancelText: 'Seguir evaluando',
      icon: 'log-out'
    }).then(function (ok) {
      if (!ok) return;

      try { localStorage.removeItem('ed_anon_id'); } catch (e) {}
      try { localStorage.removeItem(LS_STUDENT); } catch (e) {}

      state.student = null;
      state.evaluated = new Set();
      state.gradeTeachers = [];
      state.currentTeacher = null;
      state.answers = {};
      state.resources = [];

      var sel = document.getElementById('selGrade');
      if (sel) sel.value = '';

      showScreen('screen-welcome');
      toast('Encuesta finalizada. Lista para el siguiente estudiante.');
    });
  }

  /* ---------------- Arranque ---------------- */
  function boot() {
    $('#footerYear').textContent = new Date().getFullYear();

    Api.getBootstrap().then(function (res) {
      if (!res || res.ok === false) throw new Error((res && res.message) || 'No se pudo cargar la configuración.');
      var cfg = res.config;
      state.config = cfg;
      state.settings = cfg.settings || {};
      state.meta = cfg.meta || {};
      state.grades = (cfg.grades || []).slice();
      state.teachers = cfg.teachers || [];
      state.questions = cfg.questions || [];
      state.dimensions = cfg.dimensions || [];
      state.mock = !!res.mock;

      if (state.settings.showDashboardLink) {
        var d = $('#btnDash');
        d.hidden = false;
        d.onclick = function () { window.open('dashboard/', '_blank'); };
      }

      var pb = $('#periodBadge');
      if (pb) pb.querySelector('span').textContent = 'Periodo ' + (state.meta.period || '');

      initSelects();

      var saved = loadStudent();
      if (saved && saved.gradeId) {
        $('#selGrade').value = saved.gradeId;
        enterAsStudent({ id: anonId(), gradeId: saved.gradeId });
      } else {
        showScreen('screen-welcome');
      }

      icons();
    }).catch(function (err) {
      showScreen('screen-welcome');
      toast((err && err.message) || 'Error al cargar la aplicación.', 'error');
    });

    $('#formStudent').addEventListener('submit', onStudentSubmit);
    $('#formEval').addEventListener('submit', onSubmitEvaluation);
    $('#txtComment').addEventListener('input', updateCommentCount);
    $('#btnBackTeachers').addEventListener('click', function () {
      state.currentTeacher = null;
      renderTeachers();
      showScreen('screen-teachers');
    });
    $('#btnFinish').addEventListener('click', function () { renderDone(false); showScreen('screen-done'); });
    $('#btnDoneBack').addEventListener('click', function () { renderTeachers(); showScreen('screen-teachers'); });
    $('#btnFinishSession').addEventListener('click', finishSession);
    $('#btnFinishSessionDone').addEventListener('click', finishSession);

    $('#modalCancel').addEventListener('click', function () { closeModal(false); });
    $('#modalOk').addEventListener('click', function () { closeModal(true); });
    $('#appModal').addEventListener('click', function (ev) {
      if (ev.target.id === 'appModal') closeModal(false);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeModal(false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
