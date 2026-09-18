# Estrategia de pruebas — Academia sin Humo

**Proyecto final · Ruta QA Automation con IA · TesteandoYa**
**Repositorio:** https://github.com/D4v1D-lab/academia-sin-humo-qa
**Fuente de verdad:** https://playground.calidadsinhumo.com/documentacion

---

## Riesgo principal

- **Riesgo:** la inscripción a cursos no aplica las mismas reglas en la UI y en la API. Un estudiante puede quedar "inscrito" sin cumplir el prerequisito, o el sistema puede mostrar cupos que no decrementan, comprometiendo la coherencia del progreso y la capacidad real de cada curso.
- **A quién afecta y cómo:** al estudiante, que avanza sobre una base que no completó y termina con un progreso/certificado inconsistente; y al negocio, que pierde control sobre la ocupación de sus cursos (overbooking) y sobre la integridad de los datos en los que se apoya su oferta.

## Flujos evaluados

| Flujo | Frecuencia | Valor/Riesgo | ¿Automatizo? | Capa (UI/API/integrado) | Por qué |
|---|---|---|---|---|---|
| Registro de estudiante | Alta | Alto | Sí (flujo crítico) | UI | Puerta de entrada; valida REQ-R01 a R07 |
| Inicio de sesión | Alta | Alto | Sí (flujo crítico) | UI | REQ-L01 a L04; requisito de todo lo demás |
| Inscripción a cursos | Alta | **Crítico** | Sí | UI + API + integrado | REQ-C02/C04/C06: la regla estrella del proyecto |
| Progreso del estudiante | Media | Alto | Parcial | UI | REQ-P01 (estado tras inscribirse); transiciones P02/P03 fuera |
| Sesión (recarga, logout) | Alta | Alto | No (caracterizado en reporte) | UI/API | Bug real detectado; es más valioso reportarlo que "esconderlo" en un test |
| Reserva de fecha de inicio | Baja | Medio | No | — | Flujo secundario; valores límite simples sin opción de automatizar por riesgo |
| Subida de CV | Baja | Medio | No | — | Validación nativa del input sin feedback accesible observable |
| Paginación de estudiantes | Baja | Bajo | No | — | Bug de `totalPages` documentado en el reporte |
| Certificado único (P04) | Baja | Medio | No | — | Requiere completar un curso entero; costo de preparación alto |

## Alcance elegido

- **Lo que SÍ entra:**
  - Un flujo crítico E2E completo por UI: registro → login → inscripción a un curso sin prerequisito → verificación en `/mi-progreso` (con Page Objects).
  - Contrato de `POST /api/enroll`: camino feliz, `400` sin `courseId`, `404` curso inexistente, robustez con body malformado (4+ tests).
  - Un flujo integrado UI+API sobre **REQ-C06**: la UI bloquea un curso con prerequisito pendiente y la API debe rechazarlo igual (si no lo hace, es el hallazgo central del reporte).
  - CI en GitHub Actions con la suite completa y artifact `playwright-report`.

- **Lo que NO entra, y por qué:**
  - Transiciones de estado completas (REQ-P02/P03) y certificado único (REQ-P04): requieren completar un curso (datos difíciles de preparar) y dependen de la sesión, cuyo comportamiento roto está reportado.
  - Reserva (REQ-D01-D03), CV (REQ-U01-U03) y paginación (REQ-N01-N03): flujos de menor frecuencia y riesgo, cubiertos con una pasada exploratoria y, en el caso de paginación, un hallazgo reportado con evidencia.
  - Rate limiting (REQ-L03): se documentó el hallazgo (el bloqueo no respeta la spec); automatizarlo produciría un test dependiente de timers de 30 s y de un bloqueo compartido por IP en un playground público.

- **Lo que NO voy a poder demostrar con estas pruebas:**
  - Que el cupo global del playground se comporte igual para todos los usuarios (es un entorno compartido: otros estudiantes inscriben en las mismas horas).
  - Que la sesión sobrevive a una recarga (es un bug conocido y reportado; ningún test verde puede afirmarlo).
  - Que la suite es 100 % hermética ante actividad externa: los tests usan emails únicos y curso con cupo, pero el estado del playground es compartido.
  - Que la API de login funciona (está rota y documentada en el reporte; por eso el flujo crítico autentica por UI).

## Notas de ejecución

- **`workers: 1`**: la suite corre en serie porque comparte el playground real y el rate limiter del login es por IP; serializar evita que un test falle por el bloqueo que genera otro.
- **Limpieza:** no existe endpoint de borrado; se usan datos dinámicos (emails únicos por ejecución) y la sesión se reinicia al final del flujo crítico.
- **Los tests que documentan bugs** (carpetas `tests/api`/`tests/integrado` nombradas como `BUG-xx`) fallan a propósito contra la spec: cada falla es un hallazgo reportado con evidencia en `docs/reporte-de-bugs.md`.