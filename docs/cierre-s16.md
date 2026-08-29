# Tarea de cierre S16 — Explicar tu primer CI

**Estudiante:** David Martínez
**Fecha:** 2026-08-29
**Repositorio:** https://github.com/D4v1D-lab/academia-sin-humo-qa

---

## PARTE 1 · Flujo integrado

### Paso 1 — Mi escenario integrado (UI + API)

- **La API prepara:** un estudiante recién registrado con email único (generado durante la ejecución) que todavía no completó el prerequisito del curso al que se intentará inscribir.
- **Dato que devuelve la API:** el `courseId` del curso intentado y la regla aplicada por `POST /api/enroll` (200 `inscrito` / 403 por prerequisito pendiente).
- **La UI usa ese dato para:** mostrar el curso en el catálogo con su estado de inscripción.
- **Comportamiento visible que verifica:** el mensaje o badge de rechazo por prerequisito pendiente; la UI debe aplicar la misma regla que la API (REQ-C06).
- **La API limpia:** no existe endpoint de borrado; la limpieza es generar un usuario fresco por test (email único) y reiniciar la sesión (REQ-S02: al cerrar sesión el progreso se reinicia).
- **Este escenario NO demuestra:** la máquina de estados de `/mi-progreso` (REQ-P02/P03), el rate limiting del login (REQ-L03) ni la generación única del certificado (REQ-P04).

> Criterio cumplido: el dato compartido (email / `courseId`) nace durante la ejecución; nada se escribe a mano.

---

## PARTE 2 · Workflow

### Paso 2 — Smoke local

- **Archivo ejecutado:** `tests/ci/ci-smoke.spec.ts`
- **Comando exacto:** `npx playwright test tests/ci/ci-smoke.spec.ts --project=chromium`
- **Resultado:** 3 passed en ~3.5 s
- **Qué demuestra este smoke:** que la app responde (home 200), que `/registro` renderiza su formulario completo y que la API valida el cuerpo de la petición (400 sin `courseId`, REQ-A03).
- **Qué NO demuestra:** flujos con autenticación ni datos reales, la suite completa, ni el comportamiento dentro del runner de CI (Ubuntu headless).

### Paso 3 — Revisión de la propuesta (skill $generar-workflow-ci)

- **¿Ejecuta el mismo alcance?** Sí. El workflow corre el mismo archivo (`tests/ci/ci-smoke.spec.ts`), el mismo comando y el mismo proyecto (`chromium`) que probé localmente.
- **¿Guarda el reporte?** Sí. `upload-artifact@v4` con `if: ${{ !cancelled() }}` (sube aunque falle el test, no si el run se cancela), `path: playwright-report/` y `if-no-files-found: error`.
- **¿Creó solamente lo solicitado?** Sí. Un único job (`smoke`), sin pasos extra que no pueda explicar.
- **`contents: read`:** el `GITHUB_TOKEN` solo tiene permiso de lectura del repositorio: mínimo necesario para checkout y subir artifacts.
- **Decisión:** PLAN APROBADO.

> Un YAML correcto no demuestra CI: lo demuestra el run real del Paso 4.

---

## PARTE 3 · Run

### Paso 4 — Mi run

- **URL del run:** https://github.com/D4v1D-lab/academia-sin-humo-qa/actions/runs/33259709688
- **Evento:** push
- **Rama:** main
- **Commit:** `b782b4f`
- **Estado final:** success

### Paso 5 — Lectura del run (workflow → run → job → step → logs)

- **Nombre del workflow:** Playwright CI
- **Nombre visible del job:** smoke
- **Step donde se ejecuta el smoke:** "Ejecutar smoke"
- **Resultado del step:** success
- **Primer mensaje útil si quedó rojo:** no aplica (ningún step quedó rojo).
- **Mi clasificación:** `SIN FALLO` — el smoke terminó correctamente; no hubo fallo de test ni fallo de entorno.

---

## PARTE 4 · Evidencia

### Paso 6 — Reporte

- **Artifact disponible:** Sí (`playwright-report`, ~195 KB, retenido 14 días).
- **Pude abrir index.html:** Sí (descargado del artifact y abierto: muestra 3/3 Passed, 0 Failed, proyecto chromium).
- **Resultado observado:** los 3 tests del smoke en verde (home, registro, API).
- **Si no apareció, qué revisaría primero:** el `if: !cancelled()`, el `path: playwright-report/`, el `if-no-files-found: error` y el reporter HTML de Playwright.

### Paso 7 — Conclusión

- **Estado:** APROBADO
- **Evidencia que respalda mi conclusión:** run `success` en el commit `b782b4f` de `main` + artifact descargado con reporte HTML 3/3 verde.
- **Próximo paso:** ampliar la suite al flujo integrado del proyecto final (REQ-C06) sobre la base de este CI.

---

## PARTE 5 · Primer paso del proyecto final

### Paso 8 — Inicio de mi proyecto final

- **Riesgo principal que quiero investigar:** paridad UI-API en la inscripción a cursos (la API debe rechazar lo mismo que la UI).
- **A quién podría afectar:** estudiantes que se inscriben sin prerequisito; progreso inconsistente entre UI y datos.
- **Primer flujo que voy a probar:** registro → login → intentar inscribirse a un curso con prerequisito pendiente → verificar el rechazo visible en la UI y el 403 en `POST /api/enroll`.
- **Capa inicial:** integrado (UI + API).
- **Requerimiento que voy a verificar:** REQ-C06 (y REQ-A02/A03 de la API).
- **Algo que todavía necesito aclarar:** si el playground ofrece una vía por API para crear/limpiar usuarios, o conviene aislar con emails únicos + reinicio de sesión.

---

## Lista final de comprobación

### Integración
- [x] La API prepara y la UI verifica.
- [x] Identifiqué el dato compartido (email / `courseId`).
- [x] Expliqué qué no demuestra el escenario.

### Workflow
- [x] El comando local y el comando de CI coinciden.
- [x] Revisé la propuesta con las tres preguntas.
- [x] Puedo explicar `contents: read`.
- [x] El workflow guarda `playwright-report`.

### Run y evidencia
- [x] El run pertenece a mi repositorio y al commit declarado.
- [x] Identifiqué workflow, run, job, step y logs.
- [x] Clasifiqué el resultado con evidencia (`SIN FALLO`).
- [x] Revisé el artifact (descargado y abierto).
- [x] Elegí APROBADO.

### Integridad
- [x] No usé skip para fabricar verde.
- [x] No borré tests ni debilité aserciones.
- [x] No subí tokens, cookies, contraseñas, `.env` ni el ZIP del reporte.

### Proyecto final
- [x] Leí la especificación (https://playground.calidadsinhumo.com/documentacion).
- [x] Elegí un riesgo, un flujo y un requerimiento inicial.