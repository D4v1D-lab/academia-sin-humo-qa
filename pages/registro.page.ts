import { Page, expect } from '@playwright/test';

/**
 * Page Object de /registro (REQ-R01 a REQ-R07).
 * Locators semánticos por rol y nombre accesible (S4): nada de selectores
 * frágiles atados a clases de estilos.
 */
export class RegistroPage {
  constructor(private readonly page: Page) {}

  get nombre() {
    return this.page.getByRole('textbox', { name: 'Nombre completo' });
  }

  get email() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get contrasena() {
    return this.page.getByRole('textbox', { name: 'Contraseña' });
  }

  get edad() {
    return this.page.getByRole('spinbutton', { name: 'Edad' });
  }

  get botonCrearCuenta() {
    return this.page.getByRole('button', { name: 'Crear cuenta' });
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
    await expect(this.page.getByText(/¡Registro exitoso!/)).toBeVisible();
  }

  async expectEmailDuplicado() {
    await expect(this.page.getByText('Este email ya está registrado')).toBeVisible();
  }
}