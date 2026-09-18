# Proyecto — Academia sin Humo

**Fuente de verdad:** Especificación de producto (https://playground.calidadsinhumo.com/documentacion)

## Descripción

Academia sin Humo es un playground de práctica para automatización QA: cursos con prerequisitos y cupos, ciclo de vida de progreso, sesión de estudiantes y una API de inscripción. Este proyecto contiene la suite de QA automation sobre ese producto (Playwright + TypeScript) y la especificación en formato OpenSpec, para que cada comportamiento del producto sea un requisito versionable y trazable a los tests.

## Capacidades (specs)

- `registro` — REQ-R01 a R07 · Formulario de registro de estudiantes
- `autenticacion` — REQ-L01 a L04 · Inicio de sesión y rate limiting
- `sesion` — REQ-S01 a S02 · Páginas protegidas y reinicio de progreso
- `catalogo-inscripcion` — REQ-C01 a C06 · Catálogo e inscripción a cursos
- `progreso` — REQ-P01 a P05 · Ciclo de vida del curso (estados y certificado)
- `api-inscripcion` — REQ-A01 a A03 · API de inscripción
- `reserva` — REQ-D01 a D03 · Reserva de fecha de inicio
- `estudiantes` — REQ-N01 a N03 · Listado paginado de estudiantes
- `perfil` — REQ-U01 a U03 · Subida de CV

## Trazabilidad

- Specs → casos de prueba: `docs/casos-de-prueba.md`
- Specs → hallazgos: `docs/reporte-de-bugs.md` (12 discrepancias contra estos requisitos)
- Specs → tests: `tests/` (e2e, api, integrado, a11y)