# Spec: estudiantes

## Propósito

Listado de estudiantes paginado con alcance completo y sin repeticiones.

## Requirements

| ID | Requirement |
|---|---|
| REQ-N01 | El listado muestra a los estudiantes paginados, 10 por página. |
| REQ-N02 | El total de páginas es `ceil(total / pageSize)`. Con 25 estudiantes y 10 por página son 3 páginas; ningún estudiante debe quedar inalcanzable. |
| REQ-N03 | Cada página muestra exactamente pageSize registros distintos. La página 1 empieza en el primer registro y ningún registro se repite entre páginas. |