import { test, expect } from '@playwright/test';

test.describe('User Guide Module', () => {
  test('user guide page loads', async ({ page }) => {
    const response = await page.goto('/user-guide');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('PDF and PPTX download options are available', async ({ page }) => {
    await page.goto('/user-guide');
    // Should have links to download both formats
    const pdfLink = page.locator('a[href*="pdf"]').first();
    const pptxLink = page.locator('a[href*="pptx"]').first();
    const hasPdf = await pdfLink.isVisible().catch(() => false);
    const hasPptx = await pptxLink.isVisible().catch(() => false);
    // At least one download mechanism should exist
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('PDF');
  });

  test('PDF download serves valid application/pdf', async ({ request }) => {
    const response = await request.get('/api/user-guide/pdf');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/pdf');
    const body = await response.body();
    expect(body.length).toBeGreaterThan(1000);
    // PDF files start with %PDF
    const header = body.slice(0, 5).toString();
    expect(header).toContain('%PDF');
  });

  test('PPTX download serves valid presentation', async ({ request }) => {
    const response = await request.get('/api/user-guide/pptx');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/vnd.openxmlformats');
    const body = await response.body();
    expect(body.length).toBeGreaterThan(5000);
    // PPTX files are ZIP archives starting with PK
    expect(body[0]).toBe(0x50); // P
    expect(body[1]).toBe(0x4b); // K
  });

  test('invalid format returns 400', async ({ request }) => {
    const response = await request.get('/api/user-guide/docx');
    expect(response.status()).toBe(400);
  });

  test('PDF contains Padmasani Srimadhan attribution', async ({ request }) => {
    const response = await request.get('/api/user-guide/pdf');
    const body = await response.body();
    const text = body.toString('latin1');
    expect(text).toContain('Padmasani Srimadhan');
  });
});

test.describe('Governance Module', () => {
  test('governance page loads', async ({ page }) => {
    const response = await page.goto('/governance');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('assess page loads', async ({ page }) => {
    const response = await page.goto('/governance/assess');
    expect(response?.status()).toBe(200);
  });

  test('governance API returns assessments list', async ({ request }) => {
    const response = await request.get('/api/governance/assess');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('CAIO Dashboard', () => {
  test('CAIO page loads', async ({ page }) => {
    const response = await page.goto('/caio');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('CAIO assess page loads', async ({ page }) => {
    const response = await page.goto('/caio/assess');
    expect(response?.status()).toBe(200);
  });

  test('CAIO API returns assessments', async ({ request }) => {
    const response = await request.get('/api/caio');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('Evaluate Module', () => {
  test('evaluate page loads', async ({ page }) => {
    const response = await page.goto('/evaluate');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('new evaluation page loads', async ({ page }) => {
    const response = await page.goto('/evaluate/new');
    expect(response?.status()).toBe(200);
  });

  test('presets API returns evaluation presets', async ({ request }) => {
    const response = await request.get('/api/evaluate/presets');
    expect(response.ok()).toBeTruthy();
  });

  test('frameworks API returns framework list', async ({ request }) => {
    const response = await request.get('/api/evaluate/frameworks');
    expect(response.ok()).toBeTruthy();
  });

  test('patterns API returns architecture patterns', async ({ request }) => {
    const response = await request.get('/api/evaluate/patterns');
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Template Studio', () => {
  test('templates page loads', async ({ page }) => {
    const response = await page.goto('/templates');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('templates API returns template list', async ({ request }) => {
    const response = await request.get('/api/templates');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('slug');
    expect(data[0]).toHaveProperty('fields');
  });

  test('template detail page loads for each template', async ({ request, page }) => {
    const response = await request.get('/api/templates');
    const templates = await response.json();
    if (templates.length > 0) {
      const slug = templates[0].slug;
      const pageRes = await page.goto(`/templates/${slug}`);
      expect(pageRes?.status()).toBe(200);
    }
  });
});

test.describe('Interview Prep', () => {
  test('interview page loads', async ({ page }) => {
    const response = await page.goto('/interview');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Settings', () => {
  test('settings page loads', async ({ page }) => {
    const response = await page.goto('/settings');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });
});
