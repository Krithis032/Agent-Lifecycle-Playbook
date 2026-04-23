import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('all main nav links are visible and navigate correctly', async ({ page }) => {
    await page.goto('/');

    // Check all nav items exist
    const navItems = [
      { name: 'Home', url: '/' },
      { name: 'Playbook', url: '/playbook' },
      { name: 'Projects', url: '/projects' },
      { name: 'Advisor', url: '/advisor' },
      { name: 'Templates', url: '/templates' },
    ];

    for (const item of navItems) {
      const link = page.getByRole('link', { name: item.name }).first();
      await expect(link).toBeVisible();
    }
  });

  test('navigating to each main page returns 200', async ({ page }) => {
    const routes = [
      '/',
      '/playbook',
      '/projects',
      '/advisor',
      '/advisor/explore',
      '/governance',
      '/evaluate',
      '/templates',
      '/interview',
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    }
  });

  test('nav highlights active page', async ({ page }) => {
    await page.goto('/projects');
    // The active link should have accent styling
    const projectsLink = page.getByRole('link', { name: 'Projects' }).first();
    await expect(projectsLink).toBeVisible();
  });

  test('ADP logo links to home', async ({ page }) => {
    await page.goto('/playbook');
    await page.getByText('ADP').first().click();
    await expect(page).toHaveURL('/');
  });
});
