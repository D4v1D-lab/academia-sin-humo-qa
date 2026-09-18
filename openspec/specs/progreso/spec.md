# Spec: progreso

## Propósito

Ciclo de vida de cada curso inscrito: estados, transiciones válidas, certificado único y desbloqueo de prerequisitos.

## Requirements

| ID | Requirement |
|---|---|
| REQ-P01 | Cada curso inscrito tiene un ciclo de vida con los siguientes estados: Inscrito, En progreso, Completado, Certificado, Abandonado. |
| REQ-P02 | Transiciones válidas: Inscrito → En progreso, Abandonado; En progreso → Completado, Abandonado; Completado → Certificado; Certificado → ninguna (estado final); Abandonado → ninguna (estado terminal). |
| REQ-P03 | Cualquier transición no listada arriba debe ser rechazada con un mensaje de error. Por ejemplo: Inscrito → Completado, Abandonado → En progreso. |
| REQ-P04 | El certificado se genera una sola vez por curso. Múltiples clics en "Certificar" no deben crear certificados duplicados. |
| REQ-P05 | Completar un curso actualiza el estado de prerequisitos en el catálogo. Los cursos que dependen del completado deben desbloquearse. |