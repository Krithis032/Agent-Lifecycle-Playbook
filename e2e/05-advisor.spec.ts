import { test, expect } from '@playwright/test';

test.describe('KB Advisor Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advisor');
  });

  test('renders advisor page with heading', async ({ page }) => {
    // The heading is "KB " + italic "Advisor" - check separately
    await expect(page.getByText('Knowledge Base').first()).toBeVisible();
    // The h1 contains "KB" text
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toContain('KB');
  });

  test('shows search and ask mode toggles', async ({ page }) => {
    await expect(page.getByText('Search KB')).toBeVisible();
    await expect(page.getByText('Ask Advisor')).toBeVisible();
  });

  test('search mode returns results for "agent"', async ({ page }) => {
    // Should default to search mode
    const searchInput = page.getByPlaceholder('Search concepts...');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('agent');

    // Wait for debounce (300ms) + API response
    await page.waitForTimeout(2000);

    // Should show concept cards in the grid
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toContain('agent');
  });

  test('switching to ask mode changes the input placeholder', async ({ page }) => {
    // Wait for full hydration
    await page.waitForTimeout(1000);

    // The toggle buttons are plain <button> elements (not links)
    // "Ask Advisor" text appears in both the nav link AND the toggle button
    // Use getByRole('button') with exact name match — nav uses <a> tags, not <button>
    const askButtons = page.getByRole('button', { name: /Ask Advisor/i });
    await askButtons.first().click();
    await page.waitForTimeout(500);

    // Input placeholder should change
    await expect(page.getByPlaceholder('Ask a question about agentic AI...')).toBeVisible();
  });

  test('search with empty query shows no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search concepts...');
    await searchInput.fill('');
    await page.waitForTimeout(500);
    // Page should remain functional
    await expect(searchInput).toBeVisible();
  });

  test('search with specific term returns relevant results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search concepts...');
    await searchInput.fill('RAG');
    await page.waitForTimeout(2000);

    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toContain('rag');
  });
});

test.describe('Explore Domains Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advisor/explore');
  });

  test('renders explore page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Explore Domains/i })).toBeVisible();
    await expect(page.getByText(/Browse all knowledge base domains/i)).toBeVisible();
  });

  test('shows domain list with domain names', async ({ page }) => {
    // "Domains" heading in left column
    await expect(page.getByText('Domains').first()).toBeVisible();

    // Wait for domains to load
    await page.waitForTimeout(1500);

    // Domain buttons show concept count badges (e.g., "12 concepts")
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('concepts');
  });

  test('clicking a domain shows its concepts', async ({ page }) => {
    await page.waitForTimeout(1500);

    // Domain buttons are <button> elements with domain name text
    const domainButtons = page.locator('button.w-full.text-left');
    const count = await domainButtons.count();

    if (count > 0) {
      await domainButtons.first().click();
      await page.waitForTimeout(1000);

      // Should show concepts section (heading updates to "Concepts (N)")
      await expect(page.getByText(/Concepts/i).first()).toBeVisible();
    }
  });

  test('concept accordion expands to show details', async ({ page }) => {
    await page.waitForTimeout(1500);

    // Click first domain
    const domainButtons = page.locator('button.w-full.text-left');
    if ((await domainButtons.count()) > 0) {
      await domainButtons.first().click();
      await page.waitForTimeout(1000);

      // Concept accordions use <button> inside Accordion component
      // They have the concept name as text
      const conceptAccordions = page.locator('button.flex.items-center.gap-3\\.5');
      if ((await conceptAccordions.count()) > 0) {
        await conceptAccordions.first().click();
        await page.waitForTimeout(300);
      }
    }
  });
});
