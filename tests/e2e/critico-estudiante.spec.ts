import { test } from '@playwright/test';
import { RegistroPage } from '../../pages/registro.page';
import { LoginPage } from '../../pages/login.page';
import { CursosPage } from '../../pages/cursos.page';
import { ProgresoPage } from '../../pages/progreso.page';

/**
 * Flujo crítico del estudiante (Fase 0 de la estrategia):
 * registro → login → inscripción a un curso sin prerequisito → verificación en /mi-progreso.
 *
 * Nota: la sesión no sobrevive una recarga (BUG-04), así que toda la navegación
 * posterior al login se hace por enlaces del SPA, nunca con goto()/reload().
 */
test.describe('Flujo crítico del estudiante', () => {
  test('registro, login, inscripción y progreso', async ({ page }) => {
    const email = `estudiante_${Date.now()}@test.com`;

    // 1. Registro (REQ-R01)
    const registro = new RegistroPage(page);
    await registro.goto();
    await registro.registrar({
      nombre: 'David Martínez',
      email,
      contrasena: 'ClaveCorrecta1',
      edad: '27',
    });
    await registro.expectRegistroExitoso();

    // 2. Login y bienvenida (REQ-L02, REQ-L04)
    const login = new LoginPage(page);
    await login.goto();
    await login.iniciarSesion(email, 'ClaveCorrecta1');
    await login.expectBienvenida('David');

    // 3. Catálogo e inscripción sin prerequisito (REQ-C01, REQ-C02)
    const cursos = new CursosPage(page);
    await cursos.navegar();
    await cursos.expectCursoVisible('Fundamentos de Testing');
    await cursos.inscribirse('Fundamentos de Testing');
    await cursos.expectInscrito('Fundamentos de Testing');

    // 4. El curso aparece en mi progreso con estado Inscrito (REQ-P01)
    const progreso = new ProgresoPage(page);
    await progreso.navegar();
    await progreso.expectCursoEnEstado('Fundamentos de Testing', 'Inscrito');
  });
});