# Reporte de bugs — Academia sin Humo

**Proyecto final · Ruta QA Automation con IA · TesteandoYa**
Hallazgos de la exploración del producto contra su especificación (https://playground.calidadsinhumo.com/documentacion).
Clasificación según la regla del proyecto: cada discrepancia con un REQ es un **hallazgo**, no un error del test.

> El playground declara oficialmente estos defectos en su **Modo desafío** (https://playground.calidadsinhumo.com/desafio): los casos R-1, R-2 y R-3 de este reporte coinciden con bugs listados allí (evidencia externa cruzada).

---

## BUG-01 · La API de inscripción no valida prerequisitos (paridad UI-API rota)

- **REQ violado:** REQ-C06 — *"La API de inscripción debe aplicar las mismas reglas de validación que la UI. Un curso con prerequisito pendiente debe ser rechazado tanto en la UI como en la API."* (también REQ-A03: `403 — prerequisito no completado`)
- **Comportamiento esperado:** inscribirse por API a un curso cuyo prerequisito no está completado responde `403`.
- **Comportamiento real:** `POST /api/enroll` responde `200` con `status: "inscrito"` para el mismo curso que la UI mantiene bloqueado.
- **Pasos para reproducir:**
  1. (UI) Crear una cuenta nueva — nunca completa "Fundamentos de Testing".
  2. (UI) `/cursos`: la card de "Playwright desde cero" muestra el botón **Bloqueado**.
  3. (API) `POST /api/enroll` con `{"courseId":"playwright-cero"}`.
- **Evidencia:** test `tests/integrado/req-c06.spec.ts` (falla en la aserción `403`); respuesta real: `{"courseId":"playwright-cero","status":"inscrito","displayStatus":"inscrito","progress":0,"certificates":0,"enrolledAt":1789693313777,"message":"Inscripción exitosa a \"Playwright desde cero\"","spotsLeft":3}`.
- **Severidad y por qué:** **ALTA.** Es el caso estrella de la spec (REQ-C06): un estudiante puede quedar inscrito y avanzar en un curso cuya base no completó; el catálogo, el progreso y el certificado quedan inconsistentes.
- **Capa donde se detecta:** API (integrado UI + API)

---

## BUG-02 · El cupo del curso no decrementa al inscribirse

- **REQ violado:** REQ-C04 — *"Al inscribirse exitosamente, el número de cupos disponibles debe reducirse en 1."*
- **Comportamiento esperado:** tras una inscripción exitosa, `enrolled` del curso sube en 1 y `spotsLeft` baja en 1.
- **Comportamiento real:** el curso queda con el mismo `enrolled` y el mismo `spotsLeft` de la consulta previa.
- **Pasos para reproducir:**
  1. `GET /api/courses` → registrar `enrolled` de "fundamentos".
  2. `POST /api/enroll` con `{"courseId":"fundamentos"}` → `200 inscrito`.
  3. `GET /api/courses` → el `enrolled` no cambió.
- **Evidencia:** test `tests/api/z-bugs-api.spec.ts` (BUG-02). Valores observados: `enrolled` 24 antes y después de la inscripción; la respuesta del enroll reporta `spotsLeft: 6` (30 − 24), sin decremento.
- **Severidad y por qué:** **ALTA.** El negocio pierde el control de ocupación de sus cursos (overbooking): se puede inscribir a más estudiantes que el cupo declarado y el catálogo muestra datos falsos.
- **Capa donde se detecta:** API

---

## BUG-03 · El login por API solo funciona si se conserva la cookie de registro

- **REQ violado:** REQ-L02 — *"Las credenciales se validan contra los usuarios registrados. Un email no registrado o una contraseña incorrecta muestran un mensaje de error."* (implícito: un email registrado con la contraseña correcta debe autenticar)
- **Comportamiento esperado:** `POST /api/login` con las credenciales correctas de un usuario registrado responde `200`.
- **Comportamiento real:** responde `401 "Email o contraseña incorrectos"` cuando la petición viene de una sesión que no conserva la cookie `ash_session` emitida en el registro. Solo autentica si el login ocurre en la misma sesión que registró.
- **Pasos para reproducir:**
  1. Sesión A: `POST /api/register` con email/contraseña correctos → `201`.
  2. Sesión B (contexto nuevo, sin cookies): `POST /api/login` con el mismo email/contraseña → `401`.
- **Evidencia:** test `tests/api/z-bugs-api.spec.ts` (BUG-03). Respuesta real: `{"error":"Email o contraseña incorrectos","attempts":1,"remaining":4}`. Verificado también con `curl` (registro sin guardar cookie → login `401`).
- **Severidad y por qué:** **ALTA.** Un estudiante que se registró en un dispositivo no puede iniciar sesión desde otro (el caso de uso normal del producto). La autenticación queda ligada a una cookie de sesión en lugar de a las credenciales.
- **Capa donde se detecta:** API

---

## BUG-04 · La sesión no sobrevive una recarga y `/api/auth/me` nunca devuelve el usuario

- **REQ violado:** REQ-L04 y REQ-S01 en lectura de sesión — la bienvenida y las páginas protegidas presuponen una sesión persistente.
- **Comportamiento esperado:** un usuario logueado sigue logueado al recargar la página; `GET /api/auth/me` devuelve el usuario de la sesión.
- **Comportamiento real:** tras una recarga, la app vuelve a pedir login pese a conservar la cookie `ash_session`, y `GET /api/auth/me` devuelve `{"realUser":null}` incluso con esa cookie activa.
- **Pasos para reproducir:**
  1. Registrarse y loguearse por UI (se ve "¡Hola, [nombre]!").
  2. Recargar la página (F5).
  3. La app redirige y pide iniciar sesión; `GET /api/auth/me` → `{"realUser":null}`.
- **Evidencia:** exploración con navegador real: cookie `ash_session` de 164 caracteres presente tras el login; recarga → "Necesitas iniciar sesión". Endpoint `GET /api/auth/me` con la cookie de la UI: `{"status":200,"body":"{\"realUser\":null}"}`.
- **Severidad y por qué:** **MEDIA.** Degrada la experiencia central (cualquier recarga expulsa al usuario), y el contrato de `/api/auth/me` está roto para cualquier consumo externo.
- **Capa donde se detecta:** UI + API

---

## BUG-05 · El rate limiting no sigue la spec (bloqueo temprano, botón que se habilita antes de cero)

- **REQ violado:** REQ-L03 — *"después de 5 intentos fallidos consecutivos, la cuenta se bloquea por 30 segundos... El botón de login debe estar deshabilitado... El botón se habilita exactamente cuando el timer llega a 0."*
- **Comportamiento esperado:** bloqueo a partir del 5.º fallo de la cuenta, 30 s, botón deshabilitado todo ese tiempo.
- **Comportamiento real:** el bloqueo se dispara al **4.º** intento (y con emails distintos en la misma sesión/IP); el botón "Bloqueado" aparece deshabilitado pero se habilita de nuevo **con el timer aún en curso** ("5 segundos" en pantalla); por API el contador nunca persiste (`attempts: 1`, `remaining: 4` en cada intento, incluso el 6.º y 7.º).
- **Pasos para reproducir:**
  1. UI: 4 intentos fallidos de login → aparece botón "Bloqueado" + timer "30 segundos".
  2. Esperar ~1 s → el botón vuelve a "Iniciar sesión" (habilitado) con "4-5 segundos" aún visibles.
  3. API: 7 `POST /api/login` fallidos → siempre `attempts: 1, remaining: 4`, nunca bloquea.
- **Evidencia:** capturas de estado del botón en cada intento (deshabilitado → habilitado con timer activo) y respuestas de la API registradas en la exploración; documentado en `docs/casos-de-prueba.md` (CP-08).
- **Severidad y por qué:** **MEDIA.** La protección anti-fuerza bruta no cumple su contrato: bloquea más temprano de lo prometido (falso positivo que castiga al usuario) y a la vez permite reintentos ilimitados por API (falso negativo).
- **Capa donde se detecta:** UI + API

---

## BUG-06 · Lista de espera reporta `displayStatus: "inscrito"`

- **REQ violado:** REQ-C05 — *"Si el estudiante queda en lista de espera, el badge debe mostrar \"Lista de espera\" (no \"Inscrito\")."*
- **Comportamiento esperado:** al inscribirse a un curso sin cupos, el estado visible del estudiante es lista de espera.
- **Comportamiento real:** la respuesta combina `status: "lista-espera"` con `displayStatus: "inscrito"` (el campo que consume la UI para el badge).
- **Pasos para reproducir:**
  1. `POST /api/enroll` con `{"courseId":"api-testing"}` (curso con cupo lleno: 20/20).
  2. Leer la respuesta.
- **Evidencia:** respuesta real: `{"courseId":"api-testing","status":"lista-espera","displayStatus":"inscrito",...,"message":"Sin cupos para \"API Testing con Playwright\". Agregado a lista de espera.","spotsLeft":0}`.
- **Severidad y por qué:** **MEDIA.** El estudiante en lista de espera ve que está "inscrito" y puede creer que tiene cupo asegurado.
- **Capa donde se detecta:** API (define el badge de la UI)

---

## BUG-07 · La contraseña acepta 65 caracteres

- **REQ violado:** REQ-R04 — *"La contraseña debe tener entre 8 y 64 caracteres (inclusive). Una de 65 también debe ser rechazada."*
- **Comportamiento esperado:** el registro con contraseña de 65 caracteres se rechaza con mensaje.
- **Comportamiento real:** el formulario completa el registro con "¡Registro exitoso!".
- **Pasos para reproducir:** `/registro` → contraseña de 65 caracteres (resto de campos válidos) → Crear cuenta.
- **Evidencia:** registro exitoso observado; el playground lo declara como bug R-1 en el Modo desafío ("Password acepta 65 caracteres").
- **Severidad y por qué:** **BAJA.** Vulnera el límite documentado; impacto de seguridad bajo en un sandbox, pero rompe el contrato de REQ-R04.
- **Capa donde se detecta:** UI

---

## BUG-08 · El formulario de registro no se limpia tras el éxito

- **REQ violado:** REQ-R06 — *"Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior."*
- **Comportamiento esperado:** tras el registro exitoso, los cuatro campos quedan vacíos.
- **Comportamiento real:** los cuatro campos conservan nombre, email, contraseña y edad.
- **Pasos para reproducir:** `/registro` → registrar con datos válidos → observar el formulario tras "¡Registro exitoso!".
- **Evidencia:** estado del formulario tras el registro: `[["text","Prueba Limpieza"],["email","r3_...@test.com"],["password","ClaveCorrecta1"],["number","21"]]`; el playground lo declara como bug R-3.
- **Severidad y por qué:** **BAJA.** Riesgo de que el siguiente estudiante registre accidentalmente los datos del anterior; también filtra la contraseña en el DOM.
- **Capa donde se detecta:** UI

---

## BUG-09 · Email sin dominio válido no se rechaza con mensaje

- **REQ violado:** REQ-R03 — *"El email debe tener formato válido: debe contener un @ seguido de un dominio con punto... Emails como `usuario@` o `usuario` no son válidos."*
- **Comportamiento esperado:** `a@b` (sin dominio con punto) se rechaza mostrando un error.
- **Comportamiento real:** el formulario no muestra ningún mensaje de rechazo (ni error ni éxito): la validación falla en silencio.
- **Pasos para reproducir:** `/registro` → email `a@b` con el resto de campos válidos → Crear cuenta.
- **Evidencia:** formulario sin mensaje alguno tras el envío; el playground lo declara como bug R-2 ("Email acepta formato sin dominio").
- **Severidad y por qué:** **BAJA.** Del lado de la UI el registro no avanza (el dato no se acepta), pero el usuario no recibe explicación; del lado del contrato el formato declarado no se aplica.
- **Capa donde se detecta:** UI

---

## BUG-10 · `totalPages` de estudiantes contradice la fórmula de la spec

- **REQ violado:** REQ-N02 — *"El total de páginas es `ceil(total / pageSize)`. Con 25 estudiantes y 10 por página son 3 páginas; ningún estudiante debe quedar inalcanzable."*
- **Comportamiento esperado:** `totalPages: 3` con 25 estudiantes y `pageSize: 10`.
- **Comportamiento real:** `GET /api/students` responde `totalPages: 2`; la página 3 existe y devuelve los últimos 5 registros.
- **Pasos para reproducir:** `GET /api/students?page=1` → leer `totalPages`; `GET /api/students?page=3` → devuelve ids 21-25.
- **Evidencia:** `{"page":1,"pageSize":10,"total":25,"totalPages":2}`; `page=3` → `{"page":3,...,"items":[{...id 21...},...id 25]}`.
- **Severidad y por qué:** **BAJA.** El campo de metadata contradice la fórmula de la spec; una UI que use `totalPages` para pintar la paginación ocultaría la página 3 (pérdida de alcance de estudiantes).
- **Capa donde se detecta:** API

---

## BUG-11 · Los endpoints de sesión responden 200 sin autenticación

- **REQ violado:** observación de seguridad sobre REQ-S01 (las páginas protegidas sí exigen login; los endpoints de sesión no).
- **Comportamiento esperado (lectura de la spec):** los recursos de sesión/progreso exigen una sesión válida.
- **Comportamiento real:** `GET /api/auth/me` responde `200 {"realUser":null}` y `GET /api/progress` responde `200` con datos del portador de la cookie, sin exigir autenticación.
- **Pasos para reproducir:** `curl https://playground.calidadsinhumo.com/api/progress` sin ninguna cookie → `200 {"enrollments":[],"total":0}`.
- **Evidencia:** respuestas capturadas sin cookies ni sesión.
- **Severidad y por qué:** **INFO.** No expone datos de terceros (el progreso es del anónimo), pero el contrato no distingue anónimo de autenticado; cualquier cliente puede consumir la API como si tuviera sesión.
- **Capa donde se detecta:** API

---

## BUG-12 · Body `null` en la inscripción responde 500 en vez de 400

- **REQ violado:** REQ-A03 — *"`400` — falta courseId."*
- **Comportamiento esperado:** cualquier body sin `courseId` (incluido `null`) responde `400`.
- **Comportamiento real:** `POST /api/enroll` con body `null` (JSON válido) responde `500` (error interno del servidor).
- **Pasos para reproducir:** `curl -X POST /api/enroll -H "Content-Type: application/json" -d 'null'`.
- **Evidencia:** test `tests/api/z-bugs-api.spec.ts` (BUG-12); verificado también con `curl` (`[500]`).
- **Severidad y por qué:** **BAJA.** Un cliente mal formado recibe "error del servidor" en lugar de un error de contrato entendible; además puede exponer stack traces.
- **Capa donde se detecta:** API

---

## Resumen

| ID | REQ | Severidad | Capa | Test que lo documenta |
|---|---|---|---|---|
| BUG-01 | C06 / A03 | Alta | API | `tests/integrado/req-c06.spec.ts` |
| BUG-02 | C04 | Alta | API | `tests/api/z-bugs-api.spec.ts` |
| BUG-03 | L02 | Alta | API | `tests/api/z-bugs-api.spec.ts` |
| BUG-04 | S01/L04 | Media | UI + API | caracterizado manualmente |
| BUG-05 | L03 | Media | UI + API | caracterizado manualmente |
| BUG-06 | C05 | Media | API | caracterizado manualmente |
| BUG-07 | R04 | Baja | UI | caracterizado manualmente |
| BUG-08 | R06 | Baja | UI | caracterizado manualmente |
| BUG-09 | R03 | Baja | UI | caracterizado manualmente |
| BUG-10 | N02 | Baja | API | caracterizado manualmente |
| BUG-11 | S01 | Info | API | caracterizado manualmente |
| BUG-12 | A03 | Baja | API | `tests/api/z-bugs-api.spec.ts` |

Los tests que documentan bugs (**5 en rojo**) son intencionales: afirman la spec y fallan mientras el producto no la cumpla. No se usan `skip` ni aserciones debilitadas.