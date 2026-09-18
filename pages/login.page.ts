import { Page, expect } from '@playwright/test';

/**
 * Page Object de /login (REQ-L01 a REQ-L04).
 * Locators por data-testid.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  get email() {
    return this.page.getByTestId('login-email');
  }

  get contrasena() {
    return this.page.getByTestId('login-password');
  }

  get botonIniciarSesion() {
    return this.page.getByTestId('login-submit');
  }

  get bienvenida() {
    return this.page.getByTestId('login-welcome');
  }

  get errorCredenciales() {
    return this.page.getByTestId('login-error');
  }

  get usuarioEnHeader() {
    return this.page.getByTestId('user-name');
  }

  get botonCerrarSesion() {
    return this.page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async iniciarSesion(email: string, contrasena: string) {
    await this.email.fill(email);
    await this.contrasena.fill(contrasena);
    await this.botonIniciarSesion.click();
  }

  /**
   * Login con un reintento de seguridad: el rate limiter del playground es
   * por IP y se dispara antes de tiempo (BUG-05), así que un login válido
   * puede fallar dentro de la ventana de bloqueo. Si la bienvenida no
   * aparece, espera 30 s (la ventana de la spec) y reintenta una vez.
   */
  async iniciarSesionConReintento(email: string, contrasena: string) {
    await this.iniciarSesion(email, contrasena);
    try {
      await this.bienvenida.waitFor({ timeout: 5_000 });
      return;
    } catch {
      await this.page.waitForTimeout(30_000);
      await this.iniciarSesion(email, contrasena);
      await this.bienvenida.waitFor({ timeout: 10_000 });
    }
  }

  async expectBienvenida(primerNombre: string) {
    await expect(this.bienvenida).toContainText(`¡Hola, ${primerNombre}!`);
  }

  async expectErrorCredenciales() {
    await expect(this.errorCredenciales).toBeVisible();
  }
}