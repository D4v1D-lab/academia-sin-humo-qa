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
 * Patrón de S16: la API prepara/verifica y la UI consume el mismo escenario.
 * El dato dinámico compartido es el courseId "playwright-cero" (prerequisito
 * "fundamentos") y el email único del estudiante. Se usa `page.request` para
 * que la llamada a la API comparta el mismo browser context — y por lo tanto
 * la misma identidad — que la UI logueada.
 *
 * Qué demuestra la UI: que el curso con prerequisito pendiente está bloqueado.
 * Qué demuestra la API: la regla que aplica al mismo curso (200 en vez de 403).
 * Qué NO demuestra el conjunto: el cupo global (compartido) ni el resto de
 * combinaciones de la tabla de decisión (REQ-C02).
 *
 * El hallazgo (BUG-01) se documenta con test.fail(): el test corre, la
 * aserción de 403 falla porque la API responde 200, y Playwright lo marca
 * como fallo esperado. Si alguien corrige la API, el test pasa y la suite se
 * pone roja con "unexpectedly passed" — la señal automática de que el bug
 * quedó resuelto.
 */
const CURSO_CON_PREREQUISITO_PENDIENTE = 'playwright-cero'; // requiere 'fundamentos'

test.describe('Integrado · REQ-C06: paridad UI-API en la inscripción', () => {
  test('UI bloquea el prerequisito pendiente y la API debe rechazarlo igual', async ({
    page,
  }) => {
    test.fail(true, 'BUG-01: POST /api/enroll acepta un curso con prerequisito pendiente que la UI bloquea');

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
    await login.iniciarSesionConReintento(email, 'ClaveCorrecta1');
    await login.expectBienvenida('Integrado');

    // La API consume el mismo escenario, con la misma identidad de la UI.
    const enrollResponse = await page.request.post('/api/enroll', {
      data: { courseId: CURSO_CON_PREREQUISITO_PENDIENTE },
    });

    // La UI verifica lo visible: el mismo curso bloqueado (REQ-C03).
    const cursos = new CursosPage(page);
    await cursos.navegar();
    await cursos.expectCursoVisible('Playwright desde cero');
    await cursos.expectRechazoPorPrerequisito(CURSO_CON_PREREQUISITO_PENDIENTE);

    // REQ-C06 exige que la API rechace igual (403). En la realidad responde
    // 200 con status "inscrito" — BUG-01 (evidencia en docs/reporte-de-bugs.md).
    expect(enrollResponse.status()).toBe(403);
  });
});