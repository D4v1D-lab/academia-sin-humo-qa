import { request as pwRequest } from '@playwright/test';
import { test, expect } from '@playwright/test';

/**
 * Tests que documentan BUGs reales del playground contra la spec.
 *
 * Cada test afirma lo que DICE la especificación y falla porque el producto
 * se comporta distinto. NO se debilitan ni se marcan como skip: la falla es
 * el hallazgo (regla 2 de la consigna) y está reportada con evidencia en
 * docs/reporte-de-bugs.md. El CI corre la suite completa y queda rojo por
 * estos tests mientras los bugs existan; el artifact se sube igual.
 *
 * Clasificación: DISCREPANCIA_CONTRATO_PRODUCTO (el contrato de la spec no
 * coincide con el comportamiento real del producto).
 */

test.describe('BUG-01 · API inscribe sin validar prerequisito (REQ-C06/REQ-A03)', () => {
  test('enroll a un curso con prerequisito pendiente debe responder 403', async ({ request }) => {
    // "playwright-cero" requiere "fundamentos" (REQ-C06, REQ-A03: 403 cuando
    // el prerequisito no está completado). Un usuario nuevo nunca lo completó.
    const response = await request.post('/api/enroll', {
      data: { courseId: 'playwright-cero' },
    });

    expect(response.status()).toBe(403); // respuesta real: 200 {status: "inscrito"}
  });
});

test.describe('BUG-02 · el cupo no decrementa al inscribirse (REQ-C04)', () => {
  test('enrolled sube en 1 tras una inscripción exitosa', async ({ request }) => {
    const antes = (await (await request.get('/api/courses')).json()).courses.find(
      (c: { id: string }) => c.id === 'fundamentos',
    );

    const enrollment = await request.post('/api/enroll', { data: { courseId: 'fundamentos' } });
    expect(enrollment.status()).toBe(200);

    const despues = (await (await request.get('/api/courses')).json()).courses.find(
      (c: { id: string }) => c.id === 'fundamentos',
    );
    // respuesta real: despues.enrolled === antes.enrolled (no baja el cupo)
    expect(despues.enrolled).toBe(antes.enrolled + 1);
  });
});

test.describe('BUG-12 · body JSON null responde 500 en vez de 400 (REQ-A03)', () => {
  test('un body null (sin courseId) debe rechazarse con 400', async () => {
    const ctx = await pwRequest.newContext({ baseURL: 'https://playground.calidadsinhumo.com' });
    const response = await ctx.post('/api/enroll', {
      data: 'null',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400); // respuesta real: 500 (error interno)
    await ctx.dispose();
  });
});

test.describe('BUG-03 · POST /api/login exige la cookie de registro (REQ-L02)', () => {
  // Último del archivo a propósito: su login fallido (1 por corrida) no debe
  // preceder a los logins exitosos del E2E en la ventana de bloqueo por IP.
  test('login con credenciales correctas desde una sesión nueva responde 200', async () => {
    const email = `bug03_${Date.now()}@test.com`;

    // Sesión A: registra al usuario (y conserva su cookie ash_session).
    const ctxA = await pwRequest.newContext({
      baseURL: 'https://playground.calidadsinhumo.com',
    });
    const registro = await ctxA.post('/api/register', {
      data: { name: 'Bug Tres', email, password: 'ClaveCorrecta1', age: 30 },
    });
    expect(registro.status()).toBe(201);
    await ctxA.dispose();

    // Sesión B: sesión nueva, sin la cookie de registro — el escenario real de
    // un usuario que inicia sesión desde otro dispositivo o navegador.
    const ctxB = await pwRequest.newContext({
      baseURL: 'https://playground.calidadsinhumo.com',
    });
    const login = await ctxB.post('/api/login', {
      data: { email, password: 'ClaveCorrecta1' },
    });
    // respuesta real: 401 "Email o contraseña incorrectos" pese a ser correctas
    expect(login.status()).toBe(200);
    await ctxB.dispose();
  });
});