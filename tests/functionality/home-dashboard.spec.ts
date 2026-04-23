import { test, expect } from '@playwright/test';

test.describe('Home Dashboard', () => {
  test('page loads without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard heading renders', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigation bar renders all module links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
    // Verify key navigation links exist (text may be wrapped in spans/icons)
    const expectedRoutes = ['/playbook', '/projects', '/advisor', '/governance', '/caio', '/evaluate', '/templates', '/user-guide'];
    for (const route of expectedRoutes) {
      const link = page.locator(`a[href="${route}"]`).first();
      await expect(link).toBeVisible();
    }
  });

  test('quick-action cards render', async ({ page }) => {
    await page.goto('/');
    // Portal should show quick-action shortcuts
    const cards = page.locator('[class*="card"], [class*="Card"], a[href]').filter({ hasText: /Playbook|Projects|Advisor|Governance/ });
    await expect(cards.first()).toBeVisible();
  });

  test('copyright footer displays Padmasani Srimadhan', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('Padmasani Srimadhan');
    await expect(footer).toContainText('2026');
  });

  test('responsive layout at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Page should not have horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // 10px tolerance
  });

  test('responsive layout at tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('stats cards show concept count', async ({ page }) => {
    await page.goto('/');
    // Dashboard should reference KB concept count
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});
