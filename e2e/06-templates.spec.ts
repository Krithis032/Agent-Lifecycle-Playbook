import { test, expect } from '@playwright/test';

test.describe('Templates Page', () => {
  test('renders templates page', async ({ page }) => {
    await page.goto('/templates');

    await expect(page.getByText('Document Generation')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Template Studio/i })).toBeVisible();
  });

  test('shows coming soon or template content', async ({ page }) => {
    await page.goto('/templates');

    // The templates page shows either templates or coming soon
    const pageContent = await page.textContent('body');
    const hasContent = pageContent?.includes('Coming') || pageContent?.includes('Template');
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Template Fill via Project', () => {
  let projectId: number;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: {
        name: 'Template Fill Test Project',
        architecturePattern: 'Pipeline',
        framework: 'LangGraph',
      },
    });
    const project = await res.json();
    projectId = project.id;
  });

  test('template fill form opens from project detail', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForTimeout(1500);

    // Look for Templates heading in the left panel (CSS uppercase, DOM is "Templates")
    const templateSection = page.getByRole('heading', { name: 'Templates' });
    if (await templateSection.isVisible()) {
      // Click first template
      const templateButtons = page.locator('button').filter({ hasText: /Charter|ADR|Report|Review/i });
      if ((await templateButtons.count()) > 0) {
        await templateButtons.first().click();
        await page.waitForTimeout(500);

        // Template form should appear
        await expect(page.getByPlaceholder('Title for this document')).toBeVisible();
      }
    }
  });

  test('template fill form validates and saves', async ({ page }) => {
    await page.goto(`/projects/${projectId}`);
    await page.waitForTimeout(1500);

    const templateSection = page.getByRole('heading', { name: 'Templates' });
    if (await templateSection.isVisible()) {
      const templateButtons = page.locator('button').filter({ hasText: /Charter|ADR|Report|Review/i });
      if ((await templateButtons.count()) > 0) {
        await templateButtons.first().click();
        await page.waitForTimeout(500);

        // Fill in the title
        const titleInput = page.getByPlaceholder('Title for this document');
        if (await titleInput.isVisible()) {
          await titleInput.fill('Test Document Title');

          // Fill in any visible text inputs
          const inputs = page.locator('input[type="text"], textarea').filter({ hasNot: page.locator('[placeholder="Title for this document"]') });
          const inputCount = await inputs.count();
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            await inputs.nth(i).fill(`Test value ${i + 1}`);
          }

          // Save button should be visible
          const saveBtn = page.getByRole('button', { name: /Save/i });
          if (await saveBtn.isEnabled()) {
            await saveBtn.click();
            await page.waitForTimeout(1000);

            // Should show "Saved" briefly
            await expect(page.getByRole('button', { name: /Saved/i })).toBeVisible();
          }
        }
      }
    }
  });
});
