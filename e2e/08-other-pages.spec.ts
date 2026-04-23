import { test, expect } from '@playwright/test';

test.describe('Interview Angles Page', () => {
  test('renders interview page with heading', async ({ page }) => {
    await page.goto('/interview');
    await expect(page.getByText('CAIO Preparation')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Interview Angles/i })).toBeVisible();
  });

  test('shows phase sections with interview angles', async ({ page }) => {
    await page.goto('/interview');

    // Should have phase sections
    await expect(page.getByText(/Phase 1/i).first()).toBeVisible();
  });

  test('shows cross-cutting questions section', async ({ page }) => {
    await page.goto('/interview');
    await expect(page.getByText(/Cross-Cutting/i)).toBeVisible();
  });
});

test.describe('Governance Page', () => {
  test('renders governance page', async ({ page }) => {
    await page.goto('/governance');
    await expect(page.getByText('TRiSM Framework')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Governance Dashboard/i })).toBeVisible();
  });

  test('shows coming soon notice', async ({ page }) => {
    await page.goto('/governance');
    await expect(page.getByText(/Coming in Session 2/i)).toBeVisible();
  });
});

test.describe('Evaluation Page', () => {
  test('renders evaluation page', async ({ page }) => {
    await page.goto('/evaluate');
    await expect(page.getByText('Decision Matrix')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Evaluation Matrix/i })).toBeVisible();
  });

  test('shows coming soon notice', async ({ page }) => {
    await page.goto('/evaluate');
    await expect(page.getByText(/Coming in Session 3/i)).toBeVisible();
  });
});

test.describe('CAIO Page', () => {
  test('renders CAIO page', async ({ page }) => {
    const response = await page.goto('/caio');
    expect(response?.status()).toBe(200);
  });
});

test.describe('Playbook Reference', () => {
  test('renders reference page', async ({ page }) => {
    const response = await page.goto('/playbook/reference');
    expect(response?.status()).toBe(200);
  });
});
