import { test, expect } from '@playwright/test';

/**
 * Contrato de POST /api/enroll (REQ-A01 a REQ-A03).
 * El status esperado sale de la spec, no de lo que la API devuelve.
 * Datos dinámicos: se valida el tipo de los campos, no valores fijos.
 */
test.describe('API · contrato de inscripción (verde)', () => {
  test('camino feliz: inscripción a un curso sin prerequisito', async ({ request }) => {
    const response = await request.post('/api/enroll', {
      data: { courseId: 'fundamentos' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('inscrito');
    expect(typeof body.spotsLeft).toBe('number');
    expect(typeof body.enrolledAt).toBe('number');
    expect(body.message).toContain('Fundamentos de Testing');
  });

  test('contrato: body sin courseId responde 400', async ({ request }) => {
    const response = await request.post('/api/enroll', { data: {} });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'El campo courseId es obligatorio' });
  });

  test('contrato: courseId inexistente responde 404', async ({ request }) => {
    const response = await request.post('/api/enroll', {
      data: { courseId: 'curso-inexistente-xyz' },
    });

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Curso no encontrado' });
  });

  test('robustez: body con courseId null o array responde 400', async ({ request }) => {
    const nulo = await request.post('/api/enroll', { data: { courseId: null } });
    const array = await request.post('/api/enroll', { data: [] });

    expect(nulo.status()).toBe(400);
    expect(array.status()).toBe(400);
    expect(await nulo.json()).toEqual({ error: 'El campo courseId es obligatorio' });
  });
});