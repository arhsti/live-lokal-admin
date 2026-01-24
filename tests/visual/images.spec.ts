import { test, expect } from '@playwright/test';

test('Images page visual regression', async ({ page }) => {
  // --- Assert grid has 4 columns on desktop ---
  await page.setViewportSize({ width: 1400, height: 900 });
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

  // Assert 4 cards in first row
  const cards = await page.locator('[data-testid="image-card"]');
  await expect(cards).toHaveCount(3); // 3 mocked images, but grid must support 4 per row

  // Assert grid columns
  const grid = await page.locator('[data-testid="image-grid"]');
  const gridBox = await grid.boundingBox();
  const cardBox = await cards.nth(0).boundingBox();
  expect(cardBox).not.toBeNull();
  if (gridBox && cardBox) {
    const colCount = Math.floor(gridBox.width / (cardBox.width + 24));
    expect(colCount).toBeGreaterThanOrEqual(4);
    expect(Math.round(cardBox.width)).toBeGreaterThanOrEqual(285);
    expect(Math.round(cardBox.width)).toBeLessThanOrEqual(300);
    expect(Math.round(cardBox.height)).toBeLessThanOrEqual(430);
  }

  // Assert visible gap between cards
  if (cardBox && cards.count() > 1) {
    const card2Box = await cards.nth(1).boundingBox();
    if (card2Box) {
      expect(Math.round(card2Box.x - (cardBox.x + cardBox.width))).toBeGreaterThanOrEqual(20);
    }
  }

  // Assert image is landscape, not portrait
  const img = await page.locator('[data-testid="image-card-image"] img').first();
  const imgBox = await img.boundingBox();
  if (imgBox) {
    expect(imgBox.width).toBeGreaterThan(imgBox.height);
  }

  // Assert button alignment and sizing
  const actions = await page.locator('[data-testid="image-card-actions"]');
  const actionBox = await actions.first().boundingBox();
  if (actionBox) {
    expect(Math.round(actionBox.height)).toBeLessThanOrEqual(48);
    expect(Math.round(actionBox.width)).toBeGreaterThanOrEqual(180);
  }

  // Visual regression snapshot
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('images-page.png');
});
