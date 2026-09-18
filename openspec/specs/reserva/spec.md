# Spec: reserva

## Propósito

Reserva de fecha de inicio con validación de rango y orden de fechas.

## Requirements

| ID | Requirement |
|---|---|
| REQ-D01 | El formulario pide fecha de inicio y fecha de fin. Ambas son obligatorias. |
| REQ-D02 | La fecha de inicio debe estar entre hoy y 30 días en el futuro (inclusive). Una fecha a 31 días debe ser rechazada. |
| REQ-D03 | La fecha de fin debe ser posterior a la de inicio. Una fecha de fin anterior o igual al inicio debe rechazarse. |