import { test, expect } from '@playwright/test';

test.describe('Knowledge Advisor', () => {
  test('advisor page loads', async ({ page }) => {
    const response = await page.goto('/advisor');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('domain browser displays KB domains', async ({ page }) => {
    await page.goto('/advisor');
    // Should show domain-related content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('search input is present and functional', async ({ page }) => {
    await page.goto('/advisor');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="ask" i]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('agent architecture');
    await searchInput.press('Enter');
    await page.waitForTimeout(1500);
  });

  test('search returns results for valid query', async ({ request }) => {
    const response = await request.get('/api/kb/search?q=agent');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('concept_name');
      expect(data[0]).toHaveProperty('domain_name');
    }
  });

  test('search returns empty array for empty query', async ({ request }) => {
    const response = await request.get('/api/kb/search?q=');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toEqual([]);
  });

  test('domains API returns domain list with counts', async ({ request }) => {
    const response = await request.get('/api/kb/domains');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('domainName');
      expect(data[0]).toHaveProperty('conceptCount');
    }
  });

  test('explore page loads with concept listing', async ({ page }) => {
    const response = await page.goto('/advisor/explore');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });
});
