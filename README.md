# QA Automation — Academia sin Humo

Suite de pruebas automatizadas sobre [Academia sin Humo](https://playground.calidadsinhumo.com), construida con **Playwright + TypeScript** como proyecto final de la ruta **QA Automation con IA (TesteandoYa)**.

## Qué prueba y por qué

El riesgo principal que elegí es la **paridad UI-API en la inscripción a cursos** (REQ-C06): si la API no aplica las mismas reglas que la UI, un estudiante puede quedar inscrito sin cumplir el prerequisito y el progreso del producto pierde coherencia. Sobre ese riesgo, la suite cubre el flujo crítico del estudiante (registro → login → inscripción → progreso), el contrato de `POST /api/enroll` (REQ-A03), el flujo integrado de la regla estrella y un anexo de accesibilidad (WCAG 2A/2AA).

## Qué NO prueba

- La máquina de estados completa (`/mi-progreso`) ni los certificados (REQ-P02 a P05): requieren completar un curso entero y dependen de una sesión cuyo comportamiento roto está reportado (BUG-04).
- Reserva de fechas (REQ-D), subida de CV (REQ-U) y paginación (REQ-N): flujos de menor riesgo; la paginación tiene un hallazgo reportado (BUG-10).
- El rate limiting (REQ-L03): se documentó el hallazgo (BUG-05) con evidencia en lugar de escribir un test dependiente de timers de 30 s y de un bloqueo compartido por IP.
- Que la suite sea hermética al entorno: el playground es compartido y no existe endpoint de borrado; se usan datos dinámicos (emails únicos) y todos los tests corren en serie (`workers: 1`) porque el rate limiter de login es por IP.

## Arquitectura

- **Page Object Model** — `pages/`: `registro`, `login`, `cursos` y `progreso`, con locators por `data-testid` (capa estable del producto) y sin `waitForTimeout`.
- **Cuatro capas de tests** — `tests/e2e/` (flujo crítico), `tests/api/` (contrato + bugs), `tests/integrado/` (REQ-C06 y BUG-03) y `tests/a11y/` (axe-core, anexo opcional).
- **CI en GitHub Actions** — corre la suite completa en cada push, chequea tipos con `tsc --noEmit` y sube el artifact `playwright-report`. Run del proyecto: https://github.com/D4v1D-lab/academia-sin-humo-qa/actions/runs/35301055645 (verde: 11 tests, incluidos los 5 que documentan bugs con `test.fail()`).

## Hallazgos

La suite documenta **12 discrepancias reales contra la spec** en `docs/reporte-de-bugs.md`. Las tres de mayor impacto:

- **BUG-01 (REQ-C06, ALTO):** la API inscribe sin validar prerequisitos — `200 inscrito` donde la spec exige `403`. La UI bloquea el mismo curso: la paridad está rota.
- **BUG-02 (REQ-C04, ALTO):** el cupo no decrementa al inscribirse (`enrolled` queda igual) — riesgo de overbooking.
- **BUG-03 (REQ-L02, ALTO):** el login por API solo funciona conservando la cookie de registro; desde otra sesión, `401` con credenciales correctas.

**Los 5 tests que documentan bugs usan `test.fail()`**: ejecutan la aserción de la spec, Playwright espera que falle y la suite queda en verde. Si el producto corrige un bug, el test pasa y el CI se pone rojo con "unexpectedly passed" — la señal de que el hallazgo se resolvió. No hay `skip`, ni tests borrados, ni aserciones debilitadas. El método de cada hallazgo, su reproducción y su evidencia están en `docs/reporte-de-bugs.md`.

## Cómo correrlo

```bash
npm ci
npx playwright install chromium
npm test                 # suite completa (11 tests en verde)
npm run test:e2e         # flujo crítico E2E
npm run test:api         # contrato de la API (y bugs con test.fail)
npm run test:integrado   # REQ-C06 (UI + API) y BUG-03
npm run test:a11y        # accesibilidad del registro (axe-core)
npm run report           # abre el reporte HTML del último run
```

Los tests corren contra el playground público (https://playground.calidadsinhumo.com): no necesitan credenciales ni variables de entorno. Con datos reales: cada ejecución genera emails únicos.

## Cómo se construyó

Este proyecto se armó en conversación con un agente de IA (asistente de código), explorando el producto en vivo (curl + navegador real) y no generando tests a ciegas desde la spec: cada bug reportado se reprodujo primero manualmente — leyendo response bodies, cookies y el estado real de `/api/courses`, `/api/progress` y `/api/auth/me` — antes de escribir la aserción que lo documenta. Los casos de `docs/casos-de-prueba.md` tienen "resultado obtenido" real de esa exploración, y la evaluación del juez se aplicó con la revisión estática de la skill `qa-manual-istqb` (repo de referencia fugazi/test-automation-skills-agents): checklist de atomicidad, oráculo, trazabilidad y cobertura, actuando como revisor propio. El veredicto y las decisiones aceptadas/rechazadas están documentados al final de `docs/casos-de-prueba.md`.

## Documentación del proyecto

- `docs/estrategia.md` — riesgo, matriz de decisión y alcance declarado.
- `docs/casos-de-prueba.md` — casos con técnicas (valores límite, tabla de decisión, transición de estados) y evaluación del juez.
- `docs/reporte-de-bugs.md` — los 12 hallazgos con evidencia.
- `docs/cierre-s16.md` — cierre de la semana 16 (CI + flujo integrado inicial).