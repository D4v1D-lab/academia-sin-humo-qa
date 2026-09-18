# Spec: api-inscripcion

## Propósito

Contrato de la API de inscripción: misma validación que la UI y códigos de respuesta definidos.

## Requirements

| ID | Requirement |
|---|---|
| REQ-A01 | `POST /api/enroll` acepta un body JSON con el campo `courseId`. |
| REQ-A02 | La API debe validar: que el curso exista, que haya cupos, y que el prerequisito esté completado. Las mismas reglas que la UI. |
| REQ-A03 | Respuestas esperadas: `200` con `status: "inscrito"` — inscripción exitosa; `200` con `status: "lista-espera"` — sin cupos; `400` — falta courseId; `403` — prerequisito no completado; `404` — curso no encontrado. |