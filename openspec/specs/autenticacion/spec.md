# Spec: autenticacion

## Propósito

Inicio de sesión con credenciales de usuarios registrados, mensaje de bienvenida y protección anti fuerza bruta.

## Requirements

| ID | Requirement |
|---|---|
| REQ-L01 | El login requiere email y contraseña. Ambos son obligatorios. |
| REQ-L02 | Las credenciales se validan contra los usuarios registrados. Un email no registrado o una contraseña incorrecta muestran un mensaje de error. |
| REQ-L03 | Rate limiting: después de 5 intentos fallidos consecutivos, la cuenta se bloquea por 30 segundos. Durante el bloqueo: el botón de login debe estar deshabilitado, un timer visual muestra los segundos restantes, y el botón se habilita exactamente cuando el timer llega a 0. |
| REQ-L04 | Tras un login exitoso, el sistema muestra un mensaje de bienvenida con el nombre del usuario. |