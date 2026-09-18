import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Anexo opcional — accesibilidad con axe-core (WCAG 2A/2AA) sobre /registro.
 * Si aparecen violaciones no se borra la aserción: se documentan como
 * hallazgo en docs/reporte-de-bugs.md, igual que cualquier otro bug.
 */
test('la página de registro no tiene violaciones críticas de accesibilidad', async ({ page }) => {
  await page.goto('/registro');

  const resultados = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

  console.log(JSON.stringify(resultados.violations, null, 2));
  expect(resultados.violations).toEqual([]);
});