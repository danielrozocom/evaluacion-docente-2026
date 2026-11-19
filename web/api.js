/* ============================================================
   Capa de datos del frontend
   - Producción: backend en Google Apps Script vía JSONP.
     (El sitio es estático y vive fuera de Apps Script.)
   - Local: si no hay API configurada, usa un mock en localStorage.
   ============================================================ */
(function (global) {
  'use strict';

  var API_URL = String(global.APP_API_URL || '').trim();
  var MOCK = !API_URL;
  var SAME_ORIGIN = API_URL.charAt(0) === '/';
  var MOCK_KEY = 'ed_mock_responses_v1';
  var TIMEOUT = 30000;

  function config() {
    if (!global.APP_CONFIG) throw new Error('No se cargó la configuración del sitio.');
    return global.APP_CONFIG;
  }

  /* ---------------- JSONP ---------------- */
  function jsonp(action, params) {
    return new Promise(function (resolve, reject) {
      var cb = '__edcb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      var query = 'action=' + encodeURIComponent(action) + '&callback=' + cb;

      Object.keys(params || {}).forEach(function (k) {
        var v = params[k];
        if (v === undefined || v === null) return;
        query += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(v);
      });

      var script = document.createElement('script');
      var timer = setTimeout(function () {
        cleanup();
        reject(new Error('El servidor tardó demasiado en responder. Revisa tu conexión.'));
      }, TIMEOUT);

      function cleanup() {
        clearTimeout(timer);
        try { delete global[cb]; } catch (e) { global[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      global[cb] = function (data) {
        cleanup();
        resolve(data);
      };

      script.onerror = function () {
        cleanup();
        reject(new Error('No se pudo conectar con el servidor de evaluaciones.'));
      };

      script.src = API_URL + '?' + query + '&_=' + Date.now();
      document.head.appendChild(script);
    });
  }

  /* ---------------- Transporte ---------------- */
  function request(action, params) {
    if (!SAME_ORIGIN) return jsonp(action, params);

    var qs = new URLSearchParams({ action: action });
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null) return;
      qs.set(k, v);
    });

    return fetch(API_URL + '?' + qs.toString(), { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('El servidor respondió ' + res.status + '.');
        return res.json();
      })
      .catch(function (err) {
        if (err && err.message && (err.message.indexOf('El servidor respondió') !== -1 || err.code === 'DUPLICATE')) {
          throw err;
        }
        throw new Error('No se pudo conectar con el servidor de evaluaciones.');
      });
  }

  /* ---------------- Mock local ---------------- */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function readMock() {
    try { return JSON.parse(global.localStorage.getItem(MOCK_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function writeMock(rows) {
    try { global.localStorage.setItem(MOCK_KEY, JSON.stringify(rows)); } catch (e) {}
  }

  var api = {
    isMock: MOCK,

    getBootstrap: function () {
      if (global.APP_CONFIG) {
        return Promise.resolve({ ok: true, config: config(), mock: MOCK });
      }
      return request('bootstrap').then(function (res) {
        if (!res || res.ok === false) throw new Error((res && res.message) || 'Error de configuración.');
        return res;
      });
    },

    getStudentProgress: function (doc) {
      if (!MOCK) return request('progress', { id: doc });

      var rows = readMock();
      var evaluated = rows
        .filter(function (r) { return String(r.studentDoc) === String(doc); })
        .map(function (r) { return String(r.teacherId); });
      return sleep(120).then(function () {
        return { ok: true, evaluated: Array.from(new Set(evaluated)) };
      });
    },

    submitEvaluation: function (payload) {
      if (!MOCK) return request('submit', { payload: JSON.stringify(payload) });

      var rows = readMock();
      var sid = String(payload.studentId || '');
      var dup = rows.some(function (r) {
        return String(r.studentDoc) === sid &&
          String(r.teacherId) === String(payload.teacherId) &&
          String(r.period) === String(payload.period);
      });
      return sleep(420).then(function () {
        if (dup) {
          var e = new Error('Ya evaluaste a este docente.');
          e.code = 'DUPLICATE';
          throw e;
        }
        var yes = 0, n = 0;
        Object.keys(payload.answers || {}).forEach(function (k) {
          if (Number(payload.answers[k]) === 1) yes++;
          n++;
        });
        var resOpts = (config().resources && config().resources.options) || [];
        var resLabels = (payload.resources || [])
          .map(function (id) { var o = resOpts.filter(function (x) { return x.id === id; })[0]; return o ? o.label : id; });
        rows.push({
          timestamp: new Date().toISOString(),
          period: payload.period,
          grade: payload.grade,
          gradeId: payload.gradeId,
          course: payload.course,
          teacherId: payload.teacherId,
          teacherName: payload.teacherName,
          area: payload.area,
          subject: payload.subject,
          studentDoc: sid,
          studentName: '',
          answers: payload.answers,
          resources: resLabels,
          average: n ? (yes / n) * 100 : 0,
          comment: payload.comment || ''
        });
        writeMock(rows);
        return { ok: true, message: 'Evaluación registrada.' };
      });
    },

    getDashboardData: function (key) {
      if (!MOCK) return request('dashboard', { key: key });

      return sleep(320).then(function () {
        if (!String(key || '').trim()) {
          var e = new Error('Ingresa la clave del dashboard.');
          e.code = 'UNAUTHORIZED';
          throw e;
        }
        return {
          ok: true,
          config: config(),
          rows: readMock(),
          mock: true,
          meta: { lastUpdated: new Date().toISOString() }
        };
      });
    }
  };

  global.Api = api;
})(window);

