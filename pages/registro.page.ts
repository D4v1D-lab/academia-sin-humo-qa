import { Page, expect } from '@playwright/test';

/**
 * Page Object de /registro (REQ-R01 a REQ-R07).
 * Locators por data-testid (capa estable del producto), nunca por clases.
 */
export class RegistroPage {
  constructor(private readonly page: Page) {}

  get nombre() {
    return this.page.getByTestId('register-name');
  }

  get email() {
    return this.page.getByTestId('register-email');
  }

  get contrasena() {
    return this.page.getByTestId('register-password');
  }

  get edad() {
    return this.page.getByTestId('register-age');
  }

  get botonCrearCuenta() {
    return this.page.getByTestId('register-submit');
  }

  get mensajeExito() {
    return this.page.getByTestId('register-success');
  }

  async goto() {
    await this.page.goto('/registro');
  }

  async registrar(datos: { nombre: string; email: string; contrasena: string; edad: string }) {
    await this.nombre.fill(datos.nombre);
    await this.email.fill(datos.email);
    await this.contrasena.fill(datos.contrasena);
    await this.edad.fill(datos.edad);
    await this.botonCrearCuenta.click();
  }

  async expectRegistroExitoso() {
    await expect(this.mensajeExito).toContainText('¡Registro exitoso!');
  }

  async expectEmailDuplicado() {
    await expect(this.page.getByTestId('register-email-error')).toContainText(
      'ya está registrado',
    );
  }
}