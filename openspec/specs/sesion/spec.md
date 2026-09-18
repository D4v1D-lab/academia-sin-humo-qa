# Spec: sesion

## Propósito

Sesión de estudiante: páginas protegidas y reinicio del progreso al cerrar sesión.

## Requirements

| ID | Requirement |
|---|---|
| REQ-S01 | Las páginas `/cursos` y `/mi-progreso` requieren autenticación. Un usuario no logueado debe ver un mensaje pidiendo iniciar sesión. |
| REQ-S02 | Al cerrar sesión, todo el progreso del estudiante se reinicia. Al volver a iniciar sesión, el estudiante empieza sin cursos inscritos. |