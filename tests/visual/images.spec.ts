import { test, expect } from '@playwright/test';

test('Images page visual regression', async ({ page }) => {
  // Mock /api/images for Playwright
  await page.route('**/api/images', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'test-image-1',
          imageUrl: 'https://placehold.co/360x640/png?text=Test+Image+1',
          fiksid_livelokal: '12345',
          created_at: new Date().toISOString(),
          tags: {
            number: '',
            eventType: 'Alle',
            description: '',
            type: 'processed',
            sourceImageId: undefined,
            fiksid_livelokal: '12345',
          },
        },
        {
          id: 'test-image-2',
          imageUrl: 'https://placehold.co/360x640/png?text=Test+Image+2',
          fiksid_livelokal: '12345',
          created_at: new Date().toISOString(),
          tags: {
            number: '',
            eventType: 'Alle',
            description: '',
            type: 'processed',
            sourceImageId: undefined,
            fiksid_livelokal: '12345',
          },
        },
        {
          id: 'test-image-3',
          imageUrl: 'https://placehold.co/360x640/png?text=Test+Image+3',
          fiksid_livelokal: '12345',
          created_at: new Date().toISOString(),
          tags: {
            number: '',
            eventType: 'Alle',
            description: '',
            type: 'processed',
            sourceImageId: undefined,
            fiksid_livelokal: '12345',
          },
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
  await page.goto('/admin/images');
  await page.waitForSelector('[data-testid="image-grid"]');
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('images-page.png');
});
