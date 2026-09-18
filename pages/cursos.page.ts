import { Page, expect } from '@playwright/test';

/**
 * Page Object del catálogo /cursos (REQ-C01 a REQ-C06).
 * Los botones de cada curso exponen data-testid `enroll-<courseId>`;
 * la visibilidad de la card se verifica por su título único.
 */
export class CursosPage {
  constructor(private readonly page: Page) {}

  get titulo() {
    return this.page.getByTestId('courses-title');
  }

  async navegar() {
    // Navegación por enlace (SPA): la sesión no sobrevive una recarga (BUG-04).
    // Ojo: el enlace "Ver cursos" (catalogo-link) apunta a /catalogo (catálogo
    // público, sin botones de inscripción); el catálogo con inscripción es
    // /cursos, al que se llega desde la nav logueada por "Laboratorio".
    await this.page.getByRole('link', { name: 'Laboratorio', exact: true }).click();
    await expect(this.titulo).toBeVisible();
  }

  private cardCurso(titulo: string) {
    const grid = this.page.locator('div.grid.grid-cols-1');
    return grid.locator('> div').filter({ hasText: titulo }).first();
  }

  private botonCurso(courseId: string) {
    return this.page.getByTestId(`enroll-${courseId}`);
  }

  async expectCursoVisible(titulo: string) {
    await expect(this.cardCurso(titulo)).toBeVisible();
  }

  async expectRechazoPorPrerequisito(courseId: string) {
    // REQ-C03: sin prerequisito completado el curso permanece bloqueado.
    const boton = this.botonCurso(courseId);
    await expect(boton).toBeDisabled();
    await expect(boton).toHaveText('Bloqueado');
  }

  async inscribirse(courseId: string) {
    await this.botonCurso(courseId).click();
  }

  async expectInscrito(courseId: string) {
    // Después de inscribirse la card pasa a estado "Ya inscrito".
    await expect(this.botonCurso(courseId)).toHaveText(/Ya inscrito/);
  }
}