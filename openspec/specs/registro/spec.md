# Spec: registro

## Propósito

Registro de estudiantes con validaciones de nombre, email, contraseña y edad. Todos los campos son obligatorios y el formulario debe limpiarse tras un registro exitoso.

## Requirements

| ID | Requirement |
|---|---|
| REQ-R01 | El formulario requiere: nombre completo, email, contraseña y edad. Todos los campos son obligatorios. |
| REQ-R02 | El nombre debe tener entre 2 y 50 caracteres. |
| REQ-R03 | El email debe tener formato válido: debe contener un `@` seguido de un dominio con punto (ejemplo: `usuario@dominio.com`). Emails como `usuario@` o `usuario` no son válidos. |
| REQ-R04 | La contraseña debe tener entre 8 y 64 caracteres (inclusive). Una contraseña de 7 caracteres debe ser rechazada. Una de 65 también. |
| REQ-R05 | La edad debe estar entre 16 y 99 (inclusive). |
| REQ-R06 | Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior. |
| REQ-R07 | No se puede registrar un email que ya existe en el sistema. |