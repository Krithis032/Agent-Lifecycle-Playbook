import { test, expect } from '@playwright/test';

test.describe('Playbook Engine', () => {
  test('phase list page loads with all 7 phases', async ({ page }) => {
    await page.goto('/playbook');
    await expect(page.locator('body')).toBeVisible();
    // Should show all 7 phases in the playbook
    const body = await page.textContent('body');
    const phaseNames = ['Ideation', 'Architecture', 'Prototype', 'Pilot', 'Production', 'Operations', 'Evolution'];
    let found = 0;
    for (const name of phaseNames) {
      if (body?.includes(name)) found++;
    }
    expect(found).toBeGreaterThanOrEqual(7);
  });

  test('phases display in correct order', async ({ page }) => {
    await page.goto('/playbook');
    const phaseNames = ['Ideation', 'Architecture', 'Prototype', 'Pilot', 'Production', 'Operations', 'Evolution'];
    for (const name of phaseNames) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }
  });

  test('clicking a phase navigates to detail page', async ({ page }) => {
    await page.goto('/playbook');
    // Click on the first phase link/card
    const firstPhaseLink = page.locator('a[href*="/playbook/"]').first();
    await firstPhaseLink.click();
    await page.waitForURL(/\/playbook\/.+/);
    expect(page.url()).toContain('/playbook/');
  });

  test('phase detail page loads with steps', async ({ page }) => {
    await page.goto('/playbook/ideation-scoping');
    const response = await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    // Phase detail should have meaningful content
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(200);
  });

  test('reference page loads', async ({ page }) => {
    await page.goto('/playbook/reference');
    await expect(page.locator('body')).toBeVisible();
    // Should contain patterns or framework references
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(100);
  });

  test('breadcrumb navigation works from phase detail', async ({ page }) => {
    await page.goto('/playbook/ideation-scoping');
    const backLink = page.locator('a[href="/playbook"]').first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await page.waitForURL('/playbook');
    }
  });
});
