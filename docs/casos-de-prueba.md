# Casos de prueba — Academia sin Humo

**Proyecto final · Ruta QA Automation con IA · TesteandoYa**
Diseñados leyendo la especificación (https://playground.calidadsinhumo.com/documentacion), no la pantalla.
Alcance y técnicas según `docs/estrategia.md`.

---

## Técnicas usadas

| Zona | Técnica | Casos |
|---|---|---|
| REQ-R02/R04/R05 (límites de nombre, contraseña, edad) | Valores límite | CP-03, CP-04, CP-05 |
| REQ-C02 (prerequisito × cupo) | Tabla de decisión | CP-08 a CP-11 |
| REQ-P01/P02 (estados del progreso) | Transición de estados | CP-12, CP-13 |
| REQ-L03 (rate limiting) | Comportamiento temporal | CP-06, CP-07 |
| REQ-S01/S02 (sesión y autorización) | Autorización y estado | CP-14, CP-15 |

---

## Registro

### CP-01 · Registro exitoso de un estudiante nuevo
- **REQ que valida:** REQ-R01, REQ-R06
- **Precondición:** no existe una cuenta con el email a usar.
- **Pasos:** completar nombre, email, contraseña y edad válidos → enviar.
- **Resultado esperado (según la spec):** se crea la cuenta, todos los campos son obligatorios y el formulario se limpia completamente.
- **Resultado obtenido:** la cuenta se crea (mensaje "¡Registro exitoso!"), pero **el formulario conserva los cuatro campos llenos**.
- **Estado:** FALLA → **BUG-08** (REQ-R06)

### CP-02 · Registro con email duplicado
- **REQ que valida:** REQ-R07
- **Precondición:** una cuenta con ese email ya existe.
- **Pasos:** completar el formulario con el email existente → enviar.
- **Resultado esperado:** el sistema rechaza el registro con un mensaje.
- **Resultado obtenido:** mensaje "Este email ya está registrado".
- **Estado:** PASA

### CP-03 · Nombre con valores límite (1, 2, 50, 51 caracteres)
- **REQ que valida:** REQ-R02
- **Precondición:** cuenta nueva.
- **Pasos:** probar nombre de 1, 2, 50 y 51 caracteres (resto de campos válidos) → enviar.
- **Resultado esperado:** se rechaza 1 y 51; se acepta 2 y 50.
- **Resultado obtenido:** no automatizado (fuera del alcance elegido; el flujo crítico usa nombre válido). Diseñado para prueba manual/ampliación.
- **Estado:** NO EJECUTADO (declarado)

### CP-04 · Contraseña con valores límite (7, 8, 64, 65 caracteres)
- **REQ que valida:** REQ-R04
- **Precondición:** cuenta nueva.
- **Pasos:** probar contraseñas de 7, 8, 64 y 65 caracteres → enviar.
- **Resultado esperado:** se rechaza 7 y 65; se acepta 8 y 64.
- **Resultado obtenido:** con 65 caracteres el registro **se completa exitosamente**.
- **Estado:** FALLA → **BUG-07** (REQ-R04)

### CP-05 · Edad con valores límite (15, 16, 99, 100)
- **REQ que valida:** REQ-R05
- **Precondición:** cuenta nueva.
- **Pasos:** probar edades 15, 16, 99 y 100 → enviar.
- **Resultado esperado:** se rechaza 15 y 100; se acepta 16 y 99.
- **Resultado obtenido:** no automatizado (fuera del alcance elegido).
- **Estado:** NO EJECUTADO (declarado)

### CP-06 · Email sin dominio válido (formato)
- **REQ que valida:** REQ-R03
- **Precondición:** cuenta nueva.
- **Pasos:** completar con `a@b` (sin dominio con punto) → enviar.
- **Resultado esperado:** el sistema rechaza el email con un mensaje.
- **Resultado obtenido:** el formulario no muestra ningún mensaje de rechazo (ni de éxito): la validación falla en silencio. El desafío oficial del playground declara este bug (R-2: "Email acepta formato sin dominio").
- **Estado:** FALLA → **BUG-09** (REQ-R03)

## Login y rate limiting

### CP-07 · Login exitoso muestra bienvenida
- **REQ que valida:** REQ-L01, REQ-L04
- **Precondición:** cuenta creada y formulario de login accesible.
- **Pasos:** ingresar email y contraseña correctos → enviar.
- **Resultado esperado:** mensaje de bienvenida con el nombre del usuario.
- **Resultado obtenido:** "¡Hola, David! Has iniciado sesión correctamente."
- **Estado:** PASA

### CP-08 · Bloqueo tras intentos fallidos (comportamiento temporal)
- **REQ que valida:** REQ-L03
- **Precondición:** cuenta existente.
- **Pasos:** 5 intentos fallidos consecutivos → observar botón, timer y habilitación.
- **Resultado esperado:** tras 5 fallos la cuenta se bloquea 30 s; botón deshabilitado; se habilita exactamente cuando el timer llega a 0.
- **Resultado obtenido:** el bloqueo se dispara al **4.º** intento (no al 5.º), aparece el timer de 30 s, pero el botón vuelve a habilitarse **con el timer aún en curso** ("5 segundos" visibles); desde la API el contador nunca persiste (`remaining` siempre 4).
- **Estado:** FALLA → **BUG-05** (REQ-L03)

### CP-09 · Login por API con credenciales válidas
- **REQ que valida:** REQ-L02 (aplicado al contrato API)
- **Precondición:** usuario registrado vía `POST /api/register`.
- **Pasos:** `POST /api/login` con email y contraseña correctos.
- **Resultado esperado (según la spec):** `200` y sesión válida.
- **Resultado obtenido:** `401 {"error":"Email o contraseña incorrectos"}` con credenciales correctas.
- **Estado:** FALLA → **BUG-03** (REQ-L02)

## Catálogo e inscripción (tabla de decisión)

| Caso | Prerequisito completado | Cupo disponible | Resultado esperado (REQ-C02) | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| CP-10 | Sí | Sí | Inscrito | Inscrito (UI y API) | PASA |
| CP-11 | Sí | No | Lista de espera | `status: "lista-espera"` pero `displayStatus: "inscrito"` | FALLA → **BUG-06** |
| CP-12 | No | Sí | Rechazado (prerequisito pendiente) | UI: botón bloqueado (PASA); API: `200 inscrito` | FALLA → **BUG-01** |
| CP-13 | No | No | Rechazado | UI: botón bloqueado | PASA (UI) |

- **CP-12 es el caso estrella del proyecto (REQ-C06):** la UI rechaza y la API acepta. La paridad está rota.
- **CP-10 nota:** el cupo **no decrementa** tras la inscripción exitosa (`enrolled` 24 → 24). Revisar **BUG-02** (REQ-C04).

## Progreso (transición de estados)

### CP-14 · Curso inscrito aparece en mi progreso
- **REQ que valida:** REQ-P01
- **Precondición:** estudiante con un curso recién inscrito.
- **Pasos:** abrir `/mi-progreso`.
- **Resultado esperado:** el curso aparece con estado Inscrito.
- **Resultado obtenido:** "Fundamentos de Testing — Inscrito".
- **Estado:** PASA

### CP-15 · Transición prohibida Inscrito → Completado
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** curso en estado Inscrito.
- **Pasos:** intentar la transición Inscrito → Completado.
- **Resultado esperado:** la transición se rechaza con un mensaje de error.
- **Resultado obtenido:** no automatizado (depende de completar un curso; declarado fuera de alcance en la estrategia).
- **Estado:** NO EJECUTADO (declarado)

## Sesión

### CP-16 · Páginas protegidas sin sesión
- **REQ que valida:** REQ-S01
- **Precondición:** usuario no logueado.
- **Pasos:** abrir `/cursos` y `/mi-progreso`.
- **Resultado esperado:** mensaje pidiendo iniciar sesión.
- **Resultado obtenido:** "Necesitas iniciar sesión para acceder a esta página."
- **Estado:** PASA

### CP-17 · La sesión sobrevive a una recarga
- **REQ que valida:** REQ-S01/REQ-L04 (lectura de la spec: una sesión válida debe persistir)
- **Precondición:** usuario logueado con cookie de sesión activa.
- **Pasos:** recargar la página.
- **Resultado esperado:** el usuario sigue logueado.
- **Resultado obtenido:** la sesión se pierde (vuelve a pedir login) pese a conservar la cookie `ash_session`; `GET /api/auth/me` devuelve `{"realUser":null}`.
- **Estado:** FALLA → **BUG-04** (caracterizado en el reporte; no automatizado para no fabricar un flaky)

---

## Evaluación del juez (revisión estática según skill de QA ISTQB)

El "juez" de la ruta se construyó como una skill de revisión de casos de prueba. Para esta entrega apliqué la revisión estática de la skill `qa-manual-istqb` (del repo de referencia fugazi/test-automation-skills-agents: flujo de *static testing* y *quality gates* del framework CTFL): checklist de atomicidad, oráculo observable, trazabilidad al requisito y cobertura, actuando como mi propio revisor.

**Calificaciones emitidas por la revisión:**

- **Conexión (trazabilidad REQ ↔ caso):** 26 de 27 REQs en alcance tienen al menos un caso que los cita (96 %). REQ-S02 (reinicio del progreso al cerrar sesión) no tiene caso propio.
- **Suficiencia de casos:** 17 casos para 8 zonas de la spec; las técnicas exigidas están representadas (valores límite, tabla de decisión, transición de estados, comportamiento temporal, autorización). Las zonas D (reserva), N (paginación) y U (CV) quedaron sin casos por alcance declarado en la Fase 0.
- **Seguridad/confianza de la suite:** ALTA para el riesgo principal (C04, C06 y L02 tienen tests ejecutables con evidencia), MEDIA para L03 (solo caracterización manual) y BAJA para P02-P05 (transiciones y certificado sin automatización).

**Feedback de la revisión (hallazgos sobre los casos):**

1. **Atomicidad:** CP-08 mezcla comportamiento de UI y de API en un solo caso. → **Aceptado parcialmente:** se separó el comportamiento del contrato API en CP-09 y se documentó que el resto del rate limiting es caracterización (BUG-05).
2. **Oráculo explícito:** CP-03 y CP-05 (límites de nombre y edad) no tienen resultado obtenido verificado. → **Aceptado:** se marcaron como NO EJECUTADO y se declararon fuera del alcance automatizado en la estrategia; la suite no los afirma como verificados.
3. **Cobertura faltante:** no hay caso para REQ-S02 (el progreso se reinicia al cerrar sesión). → **Rechazado:** verificarlo requiere un flujo con sesión estable tras logout, y la sesión no sobrevive una recarga (BUG-04); se documenta como hallazgo en lugar de escribir un test frágil.
4. **Trazabilidad literal:** CP-12 citaba REQ-C06 sin transcribir la regla. → **Aceptado:** la regla textual de REQ-C06 quedó citada en CP-12 y en `tests/integrado/req-c06.spec.ts`.

**Decisión final (supervisión del autor):** los puntos 2 y 4 se incorporaron al documento y a los tests; los puntos 1 y 3 se resolvieron con alcance declarado, no con tests frágiles. La justificación de cada decisión queda escrita aquí y en `docs/estrategia.md` (§ Alcance elegido).