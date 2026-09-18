import { request as pwRequest } from '@playwright/test';
import { test, expect } from '@playwright/test';

/**
 * Tests que documentan BUGs reales del playground contra la spec.
 *
 * Cada uno afirma lo que DICE la especificación y falla porque el producto
 * se comporta distinto. Se documentan con test.fail(): el test corre, la
 * aserción falla y Playwright lo contabiliza como fallo esperado (el CI
 * queda operativo). Si el producto corrige el bug, el test pasa y la suite
 * se pone roja con "unexpectedly passed" — la señal de que el hallazgo se
 * resolvió. La evidencia de cada bug está en docs/reporte-de-bugs.md.
 *
 * Clasificación: DISCREPANCIA_CONTRATO_PRODUCTO.
 */
test.describe('BUG-01 · API inscribe sin validar prerequisito (REQ-C06/REQ-A03)', () => {
  test('enroll a un curso con prerequisito pendiente debe responder 403', async ({ request }) => {
    test.fail(true, 'BUG-01: POST /api/enroll responde 200 para un curso con prerequisito pendiente (REQ-A03 pide 403)');

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
    test.fail(true, 'BUG-02: GET /api/courses no refleja las inscripciones — enrolled nunca sube');

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
    test.fail(true, 'BUG-12: POST /api/enroll responde 500 con body null en vez de 400');

    const ctx = await pwRequest.newContext({ baseURL: 'https://playground.calidadsinhumo.com' });
    const response = await ctx.post('/api/enroll', {
      data: 'null',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400); // respuesta real: 500 (error interno)
    await ctx.dispose();
  });
});