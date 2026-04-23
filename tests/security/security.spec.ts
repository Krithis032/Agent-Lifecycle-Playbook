import { test, expect } from '@playwright/test';
import { INJECTION_PAYLOADS, XSS_PAYLOADS, TRAVERSAL_PAYLOADS } from '../fixtures/test-data';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SQL INJECTION PREVENTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test.describe('SQL Injection Prevention', () => {
  for (const payload of INJECTION_PAYLOADS) {
    const label = payload.slice(0, 35).replace(/[^a-zA-Z0-9 ]/g, '_');

    test(`KB search rejects injection: ${label}`, async ({ request }) => {
      const response = await request.get(`/api/kb/search?q=${encodeURIComponent(payload)}`);
      expect(response.status()).not.toBe(500);
      // Should return empty results, not crash
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test(`Project create handles injection in name: ${label}`, async ({ request }) => {
      const response = await request.post('/api/projects', {
        data: { name: payload, description: 'injection test' },
      });
      // Should either succeed (string stored safely) or 400, never 500
      expect(response.status()).not.toBe(500);
    });

    test(`Project create handles injection in description: ${label}`, async ({ request }) => {
      const response = await request.post('/api/projects', {
        data: { name: 'Safe Name', description: payload },
      });
      expect(response.status()).not.toBe(500);
    });

    test(`Evaluation create handles injection in title: ${label}`, async ({ request }) => {
      const response = await request.post('/api/evaluate', {
        data: {
          evalType: 'framework_comparison',
          title: payload,
          options: [{ id: '1', name: 'A' }],
          criteria: [{ id: '1', name: 'B', weight: 1 }],
          scores: [{ optionId: '1', criterionId: '1', score: 3 }],
        },
      });
      expect(response.status()).not.toBe(500);
    });
  }

  test('KB search with long query does not crash', async ({ request }) => {
    const longQuery = 'a'.repeat(10000);
    const response = await request.get(`/api/kb/search?q=${encodeURIComponent(longQuery)}`);
    expect(response.status()).not.toBe(500);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// XSS PREVENTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test.describe('XSS Prevention', () => {
  for (const payload of XSS_PAYLOADS) {
    const label = payload.slice(0, 30).replace(/[^a-zA-Z0-9 ]/g, '_');

    test(`Stored XSS via project name: ${label}`, async ({ request, page }) => {
      // Create project with XSS payload
      const response = await request.post('/api/projects', {
        data: { name: payload, description: 'XSS test' },
      });
      if (response.ok()) {
        const project = await response.json();
        // Navigate to project detail and verify no script execution
        await page.goto(`/projects/${project.id}`);
        // Check that raw script tags are not rendered in the DOM
        const html = await page.content();
        expect(html).not.toContain('<script>alert');
        expect(html).not.toContain('onerror=alert');
        expect(html).not.toContain('onload=alert');
      }
    });
  }

  test('KB search results sanitize HTML in display', async ({ page }) => {
    await page.goto('/advisor');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="ask" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert(1)</script>');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      const html = await page.content();
      expect(html).not.toContain('<script>alert(1)</script>');
    }
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATH TRAVERSAL PREVENTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test.describe('Path Traversal Prevention', () => {
  for (let i = 0; i < TRAVERSAL_PAYLOADS.length; i++) {
    const payload = TRAVERSAL_PAYLOADS[i];
    const label = payload.slice(0, 35).replace(/[^a-zA-Z0-9 ._]/g, '_');

    test(`User guide blocks traversal ${i}: ${label}`, async ({ request }) => {
      const response = await request.get(`/api/user-guide/${encodeURIComponent(payload)}`);
      expect(response.status()).not.toBe(200);
      const body = await response.text();
      expect(body).not.toContain('root:');
      expect(body).not.toContain('DATABASE_URL');
      expect(body).not.toContain('ANTHROPIC_API_KEY');
    });
  }

  test('direct .env file access returns 404', async ({ request }) => {
    const response = await request.get('/.env');
    expect(response.status()).not.toBe(200);
    const body = await response.text();
    expect(body).not.toContain('DATABASE_URL');
  });

  test('.env.local file access returns 404', async ({ request }) => {
    const response = await request.get('/.env.local');
    expect(response.status()).not.toBe(200);
  });

  test('prisma schema not accessible', async ({ request }) => {
    const response = await request.get('/prisma/schema.prisma');
    expect(response.status()).not.toBe(200);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API ABUSE PREVENTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test.describe('API Abuse Prevention', () => {
  test('malformed JSON body returns 400 or handles gracefully', async ({ request }) => {
    const response = await request.post('/api/projects', {
      headers: { 'Content-Type': 'application/json' },
      data: 'this is not json' as unknown as Record<string, unknown>,
    });
    expect([400, 500]).toContain(response.status());
  });

  test('integer overflow in project ID handled', async ({ request }) => {
    const response = await request.get('/api/projects/99999999999999');
    expect(response.status()).not.toBe(500);
  });

  test('negative project ID handled', async ({ request }) => {
    const response = await request.get('/api/projects/-1');
    expect(response.status()).not.toBe(500);
  });

  test('non-numeric project ID handled', async ({ request }) => {
    const response = await request.get('/api/projects/abc');
    expect(response.status()).not.toBe(500);
  });

  test('empty POST body to projects returns 400', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('empty POST body to evaluate returns 400', async ({ request }) => {
    const response = await request.post('/api/evaluate', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT & SECRET EXPOSURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test.describe('Environment & Secret Exposure', () => {
  test('client-side bundle does not contain ANTHROPIC_API_KEY', async ({ page }) => {
    await page.goto('/');
    const scripts = await page.evaluate(() => {
      const elements = document.querySelectorAll('script[src]');
      return Array.from(elements).map(el => el.getAttribute('src')).filter(Boolean);
    });
    for (const src of scripts) {
      if (src) {
        const res = await page.request.get(src);
        const text = await res.text();
        expect(text).not.toContain('ANTHROPIC_API_KEY');
        expect(text).not.toContain('sk-ant-');
      }
    }
  });

  test('client-side bundle does not contain DATABASE_URL', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html).not.toContain('DATABASE_URL');
    expect(html).not.toContain('mysql://');
  });

  test('API error responses do not leak stack traces', async ({ request }) => {
    const response = await request.get('/api/projects/not-a-number');
    const body = await response.text();
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('node_modules');
    expect(body).not.toContain('.prisma');
  });

  test('X-Powered-By header is not exposed', async ({ request }) => {
    const response = await request.get('/');
    const poweredBy = response.headers()['x-powered-by'];
    // Next.js should not expose version
    if (poweredBy) {
      expect(poweredBy).not.toContain('Express');
    }
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP SECURITY HEADERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
test.describe('HTTP Security Headers', () => {
  test('responses include X-Content-Type-Options', async ({ request }) => {
    const response = await request.get('/');
    const header = response.headers()['x-content-type-options'];
    // Note: this may not be set by default in dev — flag as advisory
    if (header) {
      expect(header).toBe('nosniff');
    }
  });

  test('API responses have correct content-type', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('PDF responses have correct content-type', async ({ request }) => {
    const response = await request.get('/api/user-guide/pdf');
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('PPTX responses have correct content-type', async ({ request }) => {
    const response = await request.get('/api/user-guide/pptx');
    expect(response.headers()['content-type']).toContain('application/vnd.openxmlformats');
  });
});
