import { Page, expect } from '@playwright/test';

/**
 * Page Object de /login (REQ-L01 a REQ-L04).
 * Locators semánticos por rol y nombre accesible.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  get email() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get contrasena() {
    return this.page.getByRole('textbox', { name: 'Contraseña' });
  }

  get botonIniciarSesion() {
    return this.page.getByRole('button', { name: 'Iniciar sesión' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async iniciarSesion(email: string, contrasena: string) {
    await this.email.fill(email);
    await this.contrasena.fill(contrasena);
    await this.botonIniciarSesion.click();
  }

  async expectBienvenida(primerNombre: string) {
    await expect(this.page.getByText(new RegExp(`¡Hola, ${primerNombre}!`))).toBeVisible();
  }

  async expectErrorCredenciales() {
    await expect(this.page.getByText(/Email o contraseña incorrectos/)).toBeVisible();
  }
}