import { test, expect } from '@playwright/test';
import { RegistroPage } from '../../pages/registro.page';
import { LoginPage } from '../../pages/login.page';
import { CursosPage } from '../../pages/cursos.page';

/**
 * Flujo integrado UI + API — REQ-C06 (el caso estrella del proyecto).
 *
 * "La API de inscripción debe aplicar las mismas reglas de validación que la
 * UI. Un curso con prerequisito pendiente debe ser rechazado tanto en la UI
 * como en la API." — REQ-C06 (cita textual de la spec).
 *
 * Patrón de S16: la UI prepara/verifica lo visible y la API consume el mismo
 * escenario. El dato dinámico compartido es el courseId "playwright-cero"
 * (curso con prerequisito "fundamentos") y el email único del estudiante.
 *
 * Qué demuestra la UI: que el curso con prerequisito pendiente está bloqueado.
 * Qué demuestra la API: la regla que aplica al mismo curso.
 * Qué NO demuestra el conjunto: el cupo global (compartido) ni el resto de
 * combinaciones de la tabla de decisión (REQ-C02).
 *
 * Si la aserción de la API falla, NO se arregla: la falla es el hallazgo
 * BUG-01 (ver docs/reporte-de-bugs.md).
 */
test.describe('Integrado · REQ-C06: paridad UI-API en la inscripción', () => {
  test('UI bloquea el prerequisito pendiente y la API debe rechazarlo igual', async ({
    page,
    request,
  }) => {
    const email = `integrado_${Date.now()}@test.com`;

    // La UI prepara: estudiante nuevo que nunca completó "fundamentos".
    const registro = new RegistroPage(page);
    await registro.goto();
    await registro.registrar({
      nombre: 'Integrado Test',
      email,
      contrasena: 'ClaveCorrecta1',
      edad: '26',
    });
    await registro.expectRegistroExitoso();

    const login = new LoginPage(page);
    await login.goto();
    await login.iniciarSesion(email, 'ClaveCorrecta1');
    await login.expectBienvenida('Integrado');

    // La UI verifica lo visible: el curso con prerequisito pendiente está bloqueado (REQ-C03).
    const cursos = new CursosPage(page);
    await cursos.navegar();
    await cursos.expectCursoVisible('Playwright desde cero');
    await cursos.expectRechazoPorPrerequisito('Playwright desde cero');

    // La API consume el mismo escenario: debe rechazar igual que la UI (REQ-C06).
    const response = await request.post('/api/enroll', {
      data: { courseId: 'playwright-cero' },
    });

    // Respuesta real observada: 200 {status: "inscrito"} — la API NO aplica
    // la misma regla. Esta falla es el hallazgo BUG-01, reportado con evidencia.
    expect(response.status()).toBe(403);
  });
});