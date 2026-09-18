import { Page, expect } from '@playwright/test';

/**
 * Page Object del catálogo /cursos (REQ-C01 a REQ-C06).
 *
 * Las cards de curso no exponen data-testid: se localizan por su título
 * único dentro del grid. Cualquier cambio de estructura se corrige aquí,
 * en un solo lugar.
 */
export class CursosPage {
  constructor(private readonly page: Page) {}

  get titulo() {
    return this.page.getByTestId('courses-title');
  }

  async navegar() {
    // Navegación por enlace (SPA): la sesión no sobrevive una recarga (BUG-04).
    await this.page.getByRole('link', { name: 'Ver cursos' }).click();
    await expect(this.titulo).toBeVisible();
  }

  private cardCurso(titulo: string) {
    const grid = this.page.locator('div.grid.grid-cols-1');
    return grid.locator('> div').filter({ hasText: titulo }).first();
  }

  async expectCursoVisible(titulo: string) {
    await expect(this.cardCurso(titulo)).toBeVisible();
  }

  async expectRechazoPorPrerequisito(titulo: string) {
    // REQ-C03: sin prerequisito completado el curso permanece bloqueado.
    await expect(this.cardCurso(titulo).getByRole('button', { name: 'Bloqueado' })).toBeVisible();
  }

  async inscribirse(titulo: string) {
    await this.cardCurso(titulo).getByRole('button', { name: 'Inscribirse' }).click();
  }

  async expectInscrito(titulo: string) {
    // Después de inscribirse la card pasa a estado "Ya inscrito".
    await expect(this.cardCurso(titulo).getByText('Ya inscrito')).toBeVisible();
  }
}