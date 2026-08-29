# QA Automation — Academia sin Humo

Suite de pruebas automatizadas sobre [Academia sin Humo](https://playground.calidadsinhumo.com),
construida con Playwright y TypeScript como parte de la Ruta QA Automation con IA.

## Estado actual

Smoke CI estable que verifica que la aplicación responde (UI y API) y que el pipeline de
GitHub Actions genera evidencia real (`playwright-report`). Corresponde al cierre de la
unidad S16 — *Explicar tu primer CI*: el mismo comando corre local y en CI, y el run se
clasifica con evidencia, no por el color del check.

El siguiente paso es el proyecto final: el flujo integrado de inscripción (REQ-C06, paridad
de validación entre UI y API).

## Qué prueba y por qué

El objetivo del smoke es demostrar que la app está operativa sin depender de estado previo:

- **Disponibilidad (E2E)** — la home responde `200`, carga el título y el contenido principal.
- **Renderizado (E2E)** — `/registro` muestra el formulario completo (nombre, email, contraseña, edad).
- **Contrato de API** — `POST /api/enroll` sin `courseId` responde `400` (REQ-A03 de la especificación).

## Qué NO prueba

Quedan fuera del alcance actual: el rate limiting de login (REQ-L03), la máquina de estados
de `/mi-progreso` (REQ-P01–P05), la paridad UI-API de la inscripción (REQ-C06, pendiente para
el proyecto final) y las zonas de menor riesgo (`/reserva`, `/estudiantes`, `/perfil`).

## Arquitectura

- **Smoke de CI** (`tests/ci/`) — `ci-smoke.spec.ts`, tres tests estables sin sesión ni datos previos.
- **Configuración** (`playwright.config.ts`) — `baseURL` al playground, proyecto `chromium`,
  reporter HTML (`playwright-report/`).
- **CI en GitHub Actions** (`.github/workflows/playwright.yml`) — corre en cada push/PR a `main`
  (también con `workflow_dispatch`), instala dependencias con `npm ci`, instala Chromium y sube
  el artifact `playwright-report` aunque los tests fallen (`if: !cancelled()`).
- **Documentación** (`docs/`) — `cierre-s16.md` con el análisis completo de la entrega.

## Cómo correrlo

```bash
npm install
npx playwright install chromium
npm run test:smoke   # solo el smoke de CI
npm test             # toda la suite
npm run report       # ver el último reporte HTML
```

Ejemplo de run verde en CI:
https://github.com/D4v1D-lab/academia-sin-humo-qa/actions/runs/33259709688

## Integridad

- No se usa `skip` ni se debilitan aserciones para obtener verde.
- El reporte HTML se genera como artifact de Actions y **no se sube al repositorio**.
- No hay tokens, contraseñas ni `.env` versionados (ver `.gitignore`).