import { test, expect } from '@playwright/test';

test('Events page visual regression', async ({ page }) => {
  // Mock /api/events for Playwright
  await page.route('**/api/events', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          eventId: 'evt-1',
          clubId: '12345',
          matchId: '1234567',
          timestamp: new Date().toISOString(),
          status: 'received',
        },
        {
          eventId: 'evt-2',
          clubId: '12345',
          matchId: '1234568',
          timestamp: new Date().toISOString(),
          status: 'received',
        },
        {
          eventId: 'evt-3',
          clubId: '12345',
          matchId: '1234569',
          timestamp: new Date().toISOString(),
          status: 'received',
        },
      ]),
    });
  });
  // Set ll_club cookie for API auth
  await page.context().addCookies([
    {
      name: 'll_club',
      value: '12345',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  await page.goto('/admin/events');
  await page.waitForSelector('[data-testid="events-container"]');
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('events-page.png');
});
