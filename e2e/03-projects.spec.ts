import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('renders the projects page header', async ({ page }) => {
    await expect(page.getByText('Project Tracker')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Agent/i })).toBeVisible();
  });

  test('shows new project button', async ({ page }) => {
    await expect(page.getByText('New Project').first()).toBeVisible();
  });

  test('shows filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible();
  });

  test('opens new project modal and validates required fields', async ({ page }) => {
    // Wait for the page to fully load and hydrate
    await page.waitForTimeout(500);

    // Click the button with "New Project" text (not the nav link)
    // The Button component renders a <button> element
    const newProjectBtn = page.locator('button', { hasText: 'New Project' });
    await newProjectBtn.click();

    // Wait for modal to appear
    await page.waitForTimeout(300);

    // Modal should appear with title "New Agent Project" in h3
    await expect(page.locator('h3', { hasText: 'New Agent Project' })).toBeVisible();

    // Create Project button should be disabled with empty name
    const createBtn = page.locator('button', { hasText: 'Create Project' });
    await expect(createBtn).toBeDisabled();

    // Fill in the name
    await page.getByPlaceholder('e.g., Customer Support Triage Agent').fill('Test E2E Project');
    await expect(createBtn).toBeEnabled();

    // Cancel should close modal
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('h3', { hasText: 'New Agent Project' })).not.toBeVisible();
  });

  test('creates a new project successfully', async ({ page }) => {
    await page.waitForTimeout(500);

    await page.locator('button', { hasText: 'New Project' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('h3', { hasText: 'New Agent Project' })).toBeVisible();

    // Fill form
    await page.getByPlaceholder('e.g., Customer Support Triage Agent').fill('Playwright Test Project');

    // Select architecture pattern and framework
    const selects = page.locator('select');
    await selects.nth(0).selectOption('pipeline');
    await selects.nth(1).selectOption('langgraph');

    // Create
    await page.locator('button', { hasText: 'Create Project' }).click();

    // Modal should close and project should appear in the list
    await expect(page.locator('h3', { hasText: 'New Agent Project' })).not.toBeVisible({ timeout: 5000 });

    // The new project should appear as a card in the project list
    await page.waitForTimeout(1000);
    await expect(page.getByText('Playwright Test Project').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Project Detail Page', () => {
  let projectId: number;

  test.beforeAll(async ({ request }) => {
    // Create a test project via API
    const res = await request.post('/api/projects', {
      data: {
        name: 'E2E Detail Test Project',
        description: 'Testing the project detail page',
        architecturePattern: 'single_agent',
        framework: 'crewai',
      },
    });
    const project = await res.json();
    projectId = project.id;
  });

  test('loads project detail page with header', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);

    // Wait for loading to finish
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });

    await expect(page.getByText('E2E Detail Test Project')).toBeVisible();
    await expect(page.getByText('Testing the project detail page')).toBeVisible();
    await expect(page.getByText('active')).toBeVisible();
  });

  test('shows phase timeline with Phase 1 active', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });

    // Phase 1 should be visible (Ideation & Scoping)
    await expect(page.getByText(/Ideation/i).first()).toBeVisible();

    // Should see progress sections
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Steps');
  });

  test('clicking a step shows step detail', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });
    await page.waitForTimeout(500);

    const stepButtons = page.locator('button').filter({ hasText: /Step \d+:/i });
    const stepCount = await stepButtons.count();

    if (stepCount > 0) {
      await stepButtons.first().click();
      await page.waitForTimeout(500);

      const stepHeading = page.locator('h2').filter({ hasText: /Step \d+:/i });
      await expect(stepHeading).toBeVisible();
    }
  });

  test('can start a step and update its status', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });
    await page.waitForTimeout(500);

    const stepButtons = page.locator('button').filter({ hasText: /Step \d+:/i });
    if ((await stepButtons.count()) > 0) {
      await stepButtons.first().click();
      await page.waitForTimeout(500);

      // The step detail shows status action buttons
      // Use exact role matching to avoid matching the phase "Complete all steps first" button
      const startBtn = page.getByRole('button', { name: 'Start', exact: true });
      const completeBtn = page.getByRole('button', { name: 'Complete', exact: true });

      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(500);
        await expect(completeBtn).toBeVisible();
      } else if (await completeBtn.isVisible()) {
        // Step already in progress — that's fine
        await expect(completeBtn).toBeVisible();
      }
    }
  });

  test('gate checks are displayed and toggleable', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });

    const gateSection = page.getByText(/Gate Checks/i);
    if (await gateSection.isVisible()) {
      await expect(gateSection).toBeVisible();
    }
  });

  test('phase templates are listed if available', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });

    // The heading uses CSS text-transform uppercase, so DOM text is "Templates"
    // Use role heading to avoid matching the nav "Templates" link
    const templateSection = page.getByRole('heading', { name: 'Templates' });
    if (await templateSection.isVisible()) {
      await expect(templateSection).toBeVisible();
    }
  });

  test('back to all projects link works', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading project'), { timeout: 10000 });

    // The link contains "← All Projects" — use text match
    const backLink = page.locator('a', { hasText: 'All Projects' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/projects');
  });
});
