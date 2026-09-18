# QA Automation — Academia sin Humo

Suite de pruebas automatizadas sobre [Academia sin Humo](https://playground.calidadsinhumo.com), construida con **Playwright + TypeScript** como proyecto final de la ruta **QA Automation con IA (TesteandoYa)**.

## Qué prueba y por qué

El riesgo principal que elegí es la **paridad UI-API en la inscripción a cursos** (REQ-C06): si la API no aplica las mismas reglas que la UI, un estudiante puede quedar inscrito sin cumplir el prerequisito y el progreso del producto pierde coherencia. Sobre ese riesgo, la suite cubre el flujo crítico del estudiante (registro → login → inscripción → progreso), el contrato de `POST /api/enroll` (REQ-A03) y el caso estrella de la integración entre capas.

## Qué NO prueba

- La máquina de estados completa (`/mi-progreso`) ni los certificados (REQ-P02 a P05): requieren completar un curso entero y dependen de una sesión cuyo comportamiento roto está reportado (BUG-04).
- Reserva de fechas (REQ-D), subida de CV (REQ-U) y paginación (REQ-N): flujos de menor riesgo; la paginación tiene un hallazgo reportado (BUG-10).
- El rate limiting (REQ-L03): automatizarlo exigiría timers de 30 s sobre un bloqueo compartido por IP; se documentó el hallazgo (BUG-05) con evidencia.
- Que la suite sea hermética al entorno: el playground es compartido y no existe endpoint de borrado; se usan datos dinámicos (emails únicos) y los **5 tests en rojo son el hallazgo, no un fallo de la suite** (ver más abajo).

## Arquitectura

- **Page Object Model** — `pages/`: `registro`, `login`, `cursos` y `progreso`, con locators semánticos por rol y nombre accesible.
- **Tres capas de tests** — `tests/e2e/` (flujo crítico), `tests/api/` (contrato + bugs) y `tests/integrado/` (REQ-C06 UI+API).
- **CI en GitHub Actions** — corre la suite completa en cada push y sube el artifact `playwright-report`. Run del proyecto: https://github.com/D4v1D-lab/academia-sin-humo-qa/actions/runs/35298263102 (el run queda rojo a propósito: los 5 tests de bugs fallan contra la spec, con el reporte adjunto).

## Hallazgos

La suite documenta **12 discrepancias reales contra la spec** en `docs/reporte-de-bugs.md`. Las tres de mayor impacto:

- **BUG-01 (REQ-C06, ALTO):** la API inscribe sin validar prerequisitos — `200 inscrito` donde la spec exige `403`. La UI bloquea el mismo curso: la paridad está rota.
- **BUG-02 (REQ-C04, ALTO):** el cupo no decrementa al inscribirse (`enrolled` queda igual) — riesgo de overbooking.
- **BUG-03 (REQ-L02, ALTO):** el login por API solo funciona conservando la cookie de registro; desde otra sesión, `401` con credenciales correctas.

**Los 5 tests en rojo son a propósito** (`tests/api/z-bugs-api.spec.ts` y `tests/integrado/req-c06.spec.ts`): afirman lo que dice la spec y fallan mientras el producto no la cumpla. El pipeline queda rojo documentado y el reporte adjunta la evidencia de cada uno. No hay `skip`, ni tests borrados, ni aserciones debilitadas para forzar verde.

## Cómo correrlo

```bash
npm ci
npx playwright install chromium
npm test                 # suite completa (5 verdes + 5 rojos documentados)
npm run test:e2e         # flujo crítico E2E
npm run test:api         # contrato de la API
npm run test:integrado   # REQ-C06 (UI + API)
npm run report           # abre el reporte HTML del último run
```

`workers: 1`: el playground es compartido y el rate limiter de login es por IP; correr en serie evita que un test bloquee a otro. Con datos reales: los tests usan emails únicos por ejecución.

## Herramientas de IA que construí en la ruta

- **@pom-agent** — genera page objects (usado como base de `pages/`, revisado y ajustado a mano antes de aceptarlo).
- **@api-project-agent** — arranca/continúa proyectos de test de API (usado para estructurar `tests/api/`).
- **Juez con rúbrica** — evalúa casos de prueba contra una rúbrica propia; su veredicto y mi decisión están registrados en `docs/casos-de-prueba.md`.

## Documentación del proyecto

- `docs/estrategia.md` — riesgo, matriz de decisión y alcance declarado.
- `docs/casos-de-prueba.md` — casos con técnicas (valores límite, tabla de decisión, transición de estados) y veredicto del juez.
- `docs/reporte-de-bugs.md` — los 12 hallazgos con evidencia.
- `docs/cierre-s16.md` — cierre de la semana 16 (CI + flujo integrado inicial).