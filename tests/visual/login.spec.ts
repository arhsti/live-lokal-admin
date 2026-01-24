import { test, expect } from '@playwright/test';

test('Login page visual regression', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="main-container"]');
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('login-page.png');
});
