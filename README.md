# Academia sin Humo — suite de pruebas E2E + API

Suite personal de pruebas automatizadas sobre el playground
[Academia sin Humo](https://playground.calidadsinhumo.com), escrita en TypeScript con
Playwright. Es el cierre de la Ruta QA Automation: un smoke estable que corre igual en
local y en GitHub Actions, y un pipeline que deja evidencia descargable — porque el objetivo
no es fabricar un check verde, sino poder explicar qué se ejecutó y qué demuestra esa
ejecución.

## Qué cubre la suite

Tres pruebas pensadas para no depender de datos previos ni de sesión:

- **Disponibilidad** — la home responde `200` y muestra su título y contenido principal.
- **Registro** — `/registro` pinta el formulario completo: nombre, email, contraseña y edad.
- **API** — `POST /api/enroll` sin `courseId` responde `400`, tal como pide REQ-A03.

## Decisiones que tomé (y por qué)

- **`retries: 0`** — si el smoke es estable, un verde con reintentos no demuestra nada; el run
  verde es un verde real.
- **`if: ${{ !cancelled() }}`** en el upload del reporte — la evidencia se publica aunque fallen
  los tests; solo se omite cuando el run se cancela.
- **`if-no-files-found: error`** — si el reporte no se genera, el job falla en vez de pasar en
  silencio.
- **`permissions: contents: read`** — el token de CI solo lee el repositorio: permiso mínimo.
- **Sin `skip` ni aserciones debilitadas** — si algo no se puede probar aún, se declara fuera
  de alcance; no se esconde.

## Estructura del repo

```
tests/ci/ci-smoke.spec.ts     # smoke estable (E2E + API)
playwright.config.ts          # baseURL, proyecto chromium, reporter HTML
.github/workflows/playwright.yml
docs/cierre-s16.md            # entrega: análisis de los 8 pasos
```

## Cómo correrlo en local

```bash
npm install
npx playwright install chromium
npm run test:smoke   # solo el smoke de CI
npm run report       # abre el último reporte HTML
```

## CI en GitHub Actions

`.github/workflows/playwright.yml` dispara con **push** y **pull request** a `main` (y
manualmente vía `workflow_dispatch`). El job instala Node + `npm ci`, baja Chromium, ejecuta
el smoke y publica `playwright-report` como artifact (retención 14 días).

Run de referencia (verde, `SIN FALLO`):
https://github.com/D4v1D-lab/academia-sin-humo-qa/actions/runs/33259709688

El análisis completo de la entrega está en [`docs/cierre-s16.md`](docs/cierre-s16.md).

## Lo que sigue

El proyecto final va a girar alrededor del flujo integrado de inscripción (REQ-C06): la API y
la UI deben aplicar las mismas reglas de prerequisitos, y ese contrato UI-API es el riesgo que
quiero verificar primero.