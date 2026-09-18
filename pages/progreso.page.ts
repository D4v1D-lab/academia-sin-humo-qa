import { Page, expect } from '@playwright/test';

/**
 * Page Object de /mi-progreso (REQ-P01 a REQ-P05).
 * El ciclo de vida del curso se muestra como título + estado.
 */
export class ProgresoPage {
  constructor(private readonly page: Page) {}

  async navegar() {
    // Navegación por enlace (SPA); ver nota de sesión en cursos.page.ts.
    await this.page.getByRole('link', { name: 'Mi progreso' }).click();
  }

  async expectCursoEnEstado(titulo: string, estado: string) {
    // La tarjeta del curso agrupa el título y su estado actual (REQ-P01).
    const item = this.page
      .locator('div')
      .filter({ hasText: titulo })
      .filter({ hasText: estado })
      .first();
    await expect(item).toBeVisible();
  }
}