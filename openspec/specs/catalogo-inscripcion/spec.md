# Spec: catalogo-inscripcion

## Propósito

Catálogo de cursos con prerequisitos y cupos limitados, reglas de inscripción por tabla de decisión y paridad UI-API.

## Requirements

| ID | Requirement |
|---|---|
| REQ-C01 | El catálogo muestra todos los cursos disponibles con: título, descripción, nivel, duración, prerequisito y cupos disponibles. |
| REQ-C02 | Reglas de inscripción (tabla de decisión): Prerequisito completado=Si + Cupo disponible=Si → Inscrito; Si + No → Lista de espera; No + Si → Rechazado (prerequisito pendiente); No + No → Rechazado. |
| REQ-C03 | Un curso solo se desbloquea cuando el estudiante ha completado su prerequisito. Estar inscrito o en progreso no cuenta como completado. |
| REQ-C04 | Al inscribirse exitosamente, el número de cupos disponibles debe reducirse en 1. |
| REQ-C05 | Si el estudiante queda en lista de espera, el badge debe mostrar "Lista de espera" (no "Inscrito"). |
| REQ-C06 | La API de inscripción (`POST /api/enroll`) debe aplicar las mismas reglas de validación que la UI. Un curso con prerequisito pendiente debe ser rechazado tanto en la UI como en la API. |

## Mapa de prerequisitos

- Fundamentos de Testing — sin prerequisito
- Playwright desde cero — requiere Fundamentos
- Diseño de casos de prueba — requiere Fundamentos
- API Testing con Playwright — requiere Playwright desde cero
- CI/CD para QA — requiere Playwright desde cero
- Liderazgo QA — requiere Diseño de casos
- Programación básica para QA — sin prerequisito
- Automatización con Playwright: de cero a cazador de bugs — requiere Programación básica
- IA para QA — requiere Automatización con Playwright
- API cazador de bugs — requiere IA para QA
- CI/CD para QA (avanzado) — requiere Automatización con Playwright