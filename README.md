# Evaluación Docente 2026 · Colegio Interamericano

Sistema de evaluación docente **mobile first**, estilo **shadcn/ui**, color principal `#364b87`, tipografía **Nunito**, **Vanilla JS**, backend en **Google Apps Script** y respuestas en **Google Sheets**.

- El estudiante **solo elige su grado** (bachillerato: 6° a 11°).
- Ve únicamente los docentes que dictan clase en ese grado.
- Evalúa a cada docente una sola vez, con **20 preguntas Sí/No** y recursos de aula.
- La evaluación es **anónima** (sin nombre ni documento).
- El dashboard vive en una ruta aparte (`/dashboard/`) y se protege con clave validada en el backend.

---

## 1. Arquitectura

```
Navegador (sitio estático)                     Google
┌─────────────────────────┐        JSONP      ┌──────────────────────────┐
│ index.html              │ ───────────────▶ │ Web App (Apps Script)     │
│ dashboard/index.html    │                   │  doGet → API JSON         │
│ assets/…                │ ◀─────────────── │  LockService + validación │
└─────────────────────────┘                   └────────────┬─────────────┘
                                                          │ appendRow
                                                          ▼
                                               ┌──────────────────────────┐
                                               │ Hoja "Respuestas" (Sheets)│
                                               └──────────────────────────┘
```

- **El frontend NO vive dentro de Apps Script.** Se publica aparte (GitHub Pages u otro hosting estático).
- Apps Script solo expone la API y escribe/lee la hoja de cálculo vinculada.
- La comunicación usa **JSONP** porque los Web Apps de Apps Script no envían cabeceras CORS.

### Endpoints (GET)

| Acción | Parámetros | Uso |
|---|---|---|
| `?action=bootstrap` | — | Grados, docentes, preguntas, recursos |
| `?action=progress` | `id` (anónimo) | Docentes ya evaluados por ese dispositivo |
| `?action=submit` | `payload` (JSON) | Valida y agrega una fila a `Respuestas` |
| `?action=dashboard` | `key` | Devuelve las respuestas para el dashboard |
| `?action=ping` | — | Prueba de vida del backend |

Todas aceptan `&callback=nombre` para JSONP.

---

## 2. Demo local

```bash
npm run dev
```

- App: http://localhost:5173
- Dashboard: http://localhost:5173/dashboard/
- En local cualquier clave no vacía abre el dashboard (los datos se guardan en `localStorage`).

No requiere conexión con Google. Es solo para validar diseño y flujo en celular.

---

## 3. Backend en Google Apps Script

Proyecto vinculado a la hoja:
**https://docs.google.com/spreadsheets/d/1YDwuoJgECrjnEfvwRsAc8S33eO2f7PKnM9aUcQ4Xa8k**

Archivos del proyecto:

- `Código.gs` → `apps-script/Code.gs`
- `Config.gs` → `apps-script/Config.gs`

Pasos (ya realizados, para referencia):

1. Abrir la hoja → **Extensiones → Apps Script**.
2. Pegar `Code.gs` y `Config.gs`.
3. Ejecutar `setup` una vez (autoriza permisos y crea la hoja `Respuestas`).
4. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
5. Copiar la URL `/exec` y ponerla en `site.json`:

```json
{ "apiUrl": "https://script.google.com/macros/s/…/exec" }
```

6. `npm run build` y volver a publicar el sitio.

> La clave del dashboard se valida en el backend (`DASHBOARD_KEY`).
> Valor actual: **`KDKairos*7`**.
> Se puede cambiar en **Configuración del proyecto → Propiedades del script**.

### Guardado de respuestas

Cada envío agrega **una fila** a la hoja `Respuestas` del mismo libro al que está vinculado el script:

`ID · Fecha · Periodo · Grado · DocenteID · Docente · Área · Asignatura · EstudianteID · q1…q20 · Promedio · Recursos · Comentario`

- `q1…q20` se guardan como `SI` / `NO`.
- `Promedio` es el **% de favorabilidad** (Sí / total).
- `EstudianteID` es un identificador **anónimo del dispositivo** (no contiene datos personales).
- `LockService` evita duplicados por condiciones de carrera.

### Regla de una evaluación por docente

El servidor verifica `EstudianteID + DocenteID + Periodo`. Si ya existe, rechaza el envío.
El identificador anónimo se guarda en `localStorage` y **cambia al usar “Finalizar encuesta”**, dejando el dispositivo listo para el siguiente estudiante.

---

## 4. Sitio estático y dashboard

```
web/
  index.html              App del estudiante
  dashboard/index.html    Dashboard (ruta /dashboard/)
  styles.css              Sistema de diseño mobile first
  app.js                  Flujo de evaluación
  dashboard.js            KPIs, gráficas y CSV
  api.js                  Cliente JSONP / mock local
  config.js               Generado (grados, docentes, preguntas)
  assets/logo.svg         Logo institucional
  assets/photos/          Fotos de docentes
```

Generar configuración y assets:

```bash
npm run refresh      # seed desde Excel + build
npm run build        # solo config.js + Config.gs + assets
```

`data/seed.json` se genera desde `data/Carga_Academica.xlsx` filtrando **solo Bachillerato**.
Las fotos se emparejan por nombre con `scripts/photos.js`.

### Dashboard

- KPIs: evaluaciones, docentes evaluados, favorabilidad y **participación** (estudiantes que respondieron / matrícula).
- Favorabilidad por docente, por dimensión, por grado y por pregunta.
- Distribución Sí/No y recursos reportados.
- Filtros por grado, docente y búsqueda.
- Tabla detallada, exportación CSV e impresión.
- Datos **preliminares** cuando un docente tiene menos de 3 respuestas.

Matrícula usada para participación (total **289**):

| Grado | Cursos | Estudiantes |
|---|---|---|
| 6° | 601 (23), 602 (24) | 47 |
| 7° | 701 (27), 702 (28) | 55 |
| 8° | 801 (22), 802 (25) | 47 |
| 9° | 901 (21), 902 (23) | 44 |
| 10° | 10-1 (24), 10-2 (26) | 50 |
| 11° | 11-1 (20), 11-2 (26) | 46 |

---

## 5. Instrumento

20 preguntas de **Sí / No**, en dos dimensiones:

- **El profesor** (q1–q15)
- **Las clases** (q16–q20)

Además, una pregunta de selección múltiple sobre recursos: Tablero, Películas y videos, Láminas/mapas, Computadores.

Para modificar preguntas o matrícula: editar `scripts/generate-seed.js` y ejecutar `npm run refresh`; luego actualizar `Config.gs` en Apps Script.

---

## 6. Publicación del sitio

Con GitHub Actions (`.github/workflows/pages.yml`) se publica la carpeta `web/` en GitHub Pages en cada push a `main`.

URL esperada:

- App: `https://danielrozocom.github.io/evaluacion-docente-2026/`
- Dashboard: `https://danielrozocom.github.io/evaluacion-docente-2026/dashboard/`

> GitHub Pages para repositorios privados requiere plan pago. Si el repositorio sigue privado, se puede publicar la misma carpeta `web/` en Netlify, Vercel, Cloudflare Pages o cualquier hosting estático.

---

## 7. Comandos

```bash
npm run dev        # servidor local (demo)
npm run seed       # Excel → data/seed.json
npm run build      # config + Config.gs + assets
npm run refresh    # seed + build
```

---

## 8. Privacidad

- No se piden nombres ni documentos de estudiantes.
- El identificador es anónimo y se regenera al finalizar la encuesta.
- Los reportes son agregados.
- Las fotos y nombres de docentes son los usados institucionalmente para la evaluación.
