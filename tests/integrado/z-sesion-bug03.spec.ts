import { request as pwRequest } from '@playwright/test';
import { test, expect } from '@playwright/test';

/**
 * BUG-03 — POST /api/login exige la cookie de registro (REQ-L02).
 *
 * Se documenta con test.fail() igual que el resto de los BUG-xx, y vive en
 * tests/integrado/ (no en tests/api/) a propósito: su login fallido (1 por
 * corrida) alimenta el rate limiter por IP del playground (BUG-05) y no debe
 * preceder a los logins exitosos del E2E; tests/integrado/ es la última
 * carpeta que ejecuta Playwright (orden alfabético con workers: 1).
 */
test.describe('BUG-03 · POST /api/login exige la cookie de registro (REQ-L02)', () => {
  test('login con credenciales correctas desde una sesión nueva responde 200', async () => {
    test.fail(true, 'BUG-03: POST /api/login responde 401 desde una sesión sin la cookie de registro');

    const email = `bug03_${Date.now()}@test.com`;
    const baseURL = 'https://playground.calidadsinhumo.com';

    // Sesión A: registra al usuario (y conserva su cookie ash_session).
    const ctxA = await pwRequest.newContext({ baseURL });
    const registro = await ctxA.post('/api/register', {
      data: { name: 'Bug Tres', email, password: 'ClaveCorrecta1', age: 30 },
    });
    expect(registro.status()).toBe(201);
    await ctxA.dispose();

    // Sesión B: sesión nueva, sin la cookie de registro — el escenario real de
    // un usuario que inicia sesión desde otro dispositivo o navegador.
    const ctxB = await pwRequest.newContext({ baseURL });
    const login = await ctxB.post('/api/login', {
      data: { email, password: 'ClaveCorrecta1' },
    });
    // respuesta real: 401 "Email o contraseña incorrectos" pese a ser correctas
    expect(login.status()).toBe(200);
    await ctxB.dispose();
  });
});