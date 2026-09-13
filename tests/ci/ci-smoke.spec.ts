import { test, expect } from '@playwright/test';

/**
 * Smoke CI — Academia sin Humo (playground)
 *
 * Objetivo: verificar de forma estable que la app responde y que sus
 * superficies principales (UI y API) están operativas, sin depender de
 * datos previos ni de estado de sesión.
 *
 * Alcance:
 *  1. La home carga y muestra su hero, navegación principal y CTA.
 *  2. El formulario de registro se renderiza completo.
 *  3. La API de inscripción responde y valida el cuerpo de la petición (REQ-A03).
 */

test.describe('Smoke CI — Academia sin Humo', () => {
  test('la home carga y muestra el contenido principal', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Academia sin Humo/);
    await expect(
      page.getByRole('heading', { name: /¿Quieres aprender automatización/ }),
    ).toBeVisible();
    // Navegación principal y CTA del hero: elementos actuales y estables
    // (el enlace "Docs" que se asertaba antes ya no existe en el playground).
    await expect(
      page.getByRole('link', { name: 'Ver cursos', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Empezar a practicar', exact: true }),
    ).toBeVisible();
  });

  test('la página de registro muestra el formulario completo', async ({ page }) => {
    const response = await page.goto('/registro');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Nombre completo' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Contraseña' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Edad' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
  });

  test('la API de inscripción valida el cuerpo de la petición (REQ-A03)', async ({ request }) => {
    // Sin courseId -> 400 con mensaje claro, según REQ-A03 de la especificación.
    const response = await request.post('/api/enroll', { data: {} });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: 'El campo courseId es obligatorio' });
  });
});