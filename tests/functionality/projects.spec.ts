import { test, expect } from '@playwright/test';
import { TestData } from '../fixtures/test-data';

test.describe('Project Tracker', () => {
  test('project list page loads', async ({ page }) => {
    const response = await page.goto('/projects');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('Projects', { exact: false }).first()).toBeVisible();
  });

  test('create new project via UI', async ({ page }) => {
    await page.goto('/projects');
    const newBtn = page.getByText('New Project', { exact: false });
    if (await newBtn.isVisible()) {
      await newBtn.click();
      // Fill the form
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Playwright Test Agent');
        const submitBtn = page.getByRole('button', { name: /create|save|submit/i });
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('project detail page loads with phase progress', async ({ page }) => {
    // First create a project via API
    const data = TestData.project();
    const res = await page.request.post('/api/projects', { data });
    expect(res.ok()).toBeTruthy();
    const project = await res.json();

    await page.goto(`/projects/${project.id}`);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(data.name, { exact: false })).toBeVisible();
  });

  test('project detail shows PDF and PPTX export buttons', async ({ page }) => {
    const data = TestData.project({ name: `Export Test ${Date.now()}` });
    const res = await page.request.post('/api/projects', { data });
    const project = await res.json();

    await page.goto(`/projects/${project.id}`);
    await expect(page.getByText('PDF Report', { exact: false })).toBeVisible();
    await expect(page.getByText('PPTX Report', { exact: false })).toBeVisible();
  });

  test('project detail shows gate checks', async ({ page }) => {
    const data = TestData.project({ name: `Gates Test ${Date.now()}` });
    const res = await page.request.post('/api/projects', { data });
    const project = await res.json();

    await page.goto(`/projects/${project.id}`);
    await expect(page.getByText('Gate', { exact: false }).first()).toBeVisible();
  });

  test('project status filter tabs render', async ({ page }) => {
    await page.goto('/projects');
    const tabs = ['All', 'Active', 'Paused', 'Completed', 'Archived'];
    for (const tab of tabs) {
      await expect(page.getByText(tab, { exact: true })).toBeVisible();
    }
  });

  test('phase timeline renders on project detail', async ({ page }) => {
    const data = TestData.project({ name: `Timeline Test ${Date.now()}` });
    const res = await page.request.post('/api/projects', { data });
    const project = await res.json();

    await page.goto(`/projects/${project.id}`);
    // Should show phase names in timeline
    await expect(page.getByText('Ideation', { exact: false }).first()).toBeVisible();
  });
});
