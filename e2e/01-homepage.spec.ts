import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the main heading and description', async ({ page }) => {
    // Wait for hydration on first load (cold start may be slow)
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Command Center')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Agent Deployment/i })).toBeVisible();
    await expect(page.getByText(/Your personal operational tool/i)).toBeVisible();
  });

  test('displays stat cards', async ({ page }) => {
    // Stats are rendered with CSS text-transform: uppercase, but DOM text is lowercase
    // Check for the actual DOM text
    await expect(page.getByText('Projects').first()).toBeVisible();
    await expect(page.getByText('KB Concepts')).toBeVisible();
  });

  test('displays quick action cards', async ({ page }) => {
    await expect(page.getByText('New Project')).toBeVisible();
    await expect(page.getByText('Ask Advisor')).toBeVisible();
    await expect(page.getByText('Browse KB')).toBeVisible();
    await expect(page.getByText('View Playbook')).toBeVisible();
  });

  test('quick action links navigate correctly', async ({ page }) => {
    await page.getByRole('link', { name: /New Project/i }).click();
    await expect(page).toHaveURL('/projects');

    await page.goto('/');
    await page.getByRole('link', { name: /Ask Advisor/i }).click();
    await expect(page).toHaveURL('/advisor');

    await page.goto('/');
    await page.getByRole('link', { name: /Browse KB/i }).click();
    await expect(page).toHaveURL('/advisor/explore');

    await page.goto('/');
    await page.getByRole('link', { name: /View Playbook/i }).click();
    await expect(page).toHaveURL('/playbook');
  });

  test('shows coming soon section', async ({ page }) => {
    await expect(page.getByText(/Coming in Sessions 2 & 3/i)).toBeVisible();
  });
});
