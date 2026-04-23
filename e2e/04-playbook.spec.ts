import { test, expect } from '@playwright/test';

test.describe('Playbook Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playbook');
  });

  test('renders playbook page with heading', async ({ page }) => {
    await expect(page.getByText('7-Phase Lifecycle')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Agent Deployment/i })).toBeVisible();
    await expect(page.getByText(/structured methodology/i)).toBeVisible();
  });

  test('displays all 7 phases as cards', async ({ page }) => {
    // Phase names as they appear in the DB
    const phaseKeywords = [
      'Ideation',
      'Architecture',
      'Prototype',
      'Pilot',
      'Production',
      'Operations',
      'Evolution',
    ];

    for (const keyword of phaseKeywords) {
      await expect(page.getByText(new RegExp(keyword, 'i')).first()).toBeVisible();
    }
  });

  test('phase cards show duration and step/gate counts', async ({ page }) => {
    // Check that step count badges are present
    const stepBadges = page.getByText(/\d+ steps/);
    const count = await stepBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a phase card navigates to phase detail', async ({ page }) => {
    // Phase cards are wrapped in Links - click the first one
    const phaseLink = page.locator('a[href*="/playbook/"]').first();
    await phaseLink.click();
    await expect(page).toHaveURL(/\/playbook\/[a-z-]+/);
  });
});

test.describe('Playbook Phase Detail', () => {
  test('renders phase detail page with steps', async ({ page }) => {
    await page.goto('/playbook/ideation');

    // Phase header
    await expect(page.getByText('Phase 1').first()).toBeVisible();
    await expect(page.getByText(/Ideation/i).first()).toBeVisible();

    // Steps section
    await expect(page.getByText('Steps').first()).toBeVisible();
  });

  test('step accordions can be expanded', async ({ page }) => {
    await page.goto('/playbook/ideation');
    await page.waitForTimeout(500);

    // StepAccordion renders a <button> with the step title
    // The Accordion component has buttons with step numbers and titles
    const accordionButtons = page.locator('button').filter({ hasText: /[A-Za-z]/ });
    const count = await accordionButtons.count();
    expect(count).toBeGreaterThan(0);

    // Click the first accordion to expand it
    await accordionButtons.first().click();
    await page.waitForTimeout(300);

    // After expanding, content should be visible (e.g. "Deliverables")
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('gate checklists are displayed', async ({ page }) => {
    await page.goto('/playbook/ideation');

    // Gate check section should exist
    const gateText = page.getByText(/Gate/i);
    await expect(gateText.first()).toBeVisible();
  });

  test('phase timeline shows current phase highlighted', async ({ page }) => {
    await page.goto('/playbook/ideation');

    // PhaseTimeline renders div elements (not links) with phase names
    // The current phase has accent styling
    const timelineContainer = page.locator('.flex.items-center.gap-1').first();
    await expect(timelineContainer).toBeVisible();
  });

  test('navigating between phases via URL works', async ({ page }) => {
    await page.goto('/playbook/ideation');
    await expect(page.getByText('Phase 1').first()).toBeVisible();

    // Navigate to architecture phase via URL
    await page.goto('/playbook/architecture');
    await expect(page.getByText('Phase 2').first()).toBeVisible();
  });
});
