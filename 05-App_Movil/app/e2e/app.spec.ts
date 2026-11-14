import { expect, test } from '@playwright/test';

test('muestra el inicio de sesión al abrir la app', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Acceso al sistema' })).toBeVisible();
  await expect(page.getByAltText('TAMACHIHUA-ERP')).toBeVisible();
});

test('valida los campos obligatorios del inicio de sesión', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  await expect(page.getByText('El usuario es obligatorio.')).toBeVisible();
  await expect(page.getByText('La contraseña es obligatoria.')).toBeVisible();
});
