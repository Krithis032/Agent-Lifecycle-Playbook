import { test, expect } from '@playwright/test';
import { TestData } from '../fixtures/test-data';

test.describe('Concurrent Users', () => {
  test('handle 30 concurrent KB searches', async ({ request }) => {
    const queries = ['agent architecture', 'MCP protocol', 'RAG pipeline', 'TRiSM governance', 'CAIO leadership'];
    const requests = [];
    for (let i = 0; i < 30; i++) {
      const q = queries[i % queries.length];
      requests.push(request.get(`/api/kb/search?q=${encodeURIComponent(q)}`));
    }
    const results = await Promise.all(requests);
    const failures = results.filter(r => !r.ok());
    expect(failures.length).toBe(0);
  });

  test('handle 10 concurrent project creates', async ({ request }) => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      request.post('/api/projects', {
        data: TestData.project({ name: `Concurrency Test ${Date.now()}_${i}` }),
      })
    );
    const results = await Promise.all(requests);
    const successes = results.filter(r => r.ok());
    expect(successes.length).toBe(10);
  });

  test('handle 20 concurrent page loads', async ({ request }) => {
    const pages = ['/', '/playbook', '/projects', '/advisor', '/evaluate', '/templates', '/governance', '/caio', '/user-guide', '/interview'];
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(request.get(pages[i % pages.length]));
    }
    const results = await Promise.all(requests);
    const failures = results.filter(r => r.status() >= 500);
    expect(failures.length).toBe(0);
  });
});

test.describe('API Response Times', () => {
  test('GET /api/playbook/phases responds under 2s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/playbook/phases');
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('GET /api/projects responds under 2s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/projects');
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('GET /api/kb/search responds under 3s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/kb/search?q=agent');
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(3000);
  });

  test('GET /api/kb/domains responds under 2s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/kb/domains');
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('GET /api/templates responds under 2s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/templates');
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('GET /api/user-guide/pdf responds under 5s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/user-guide/pdf');
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(5000);
  });

  test('POST /api/projects responds under 3s', async ({ request }) => {
    const start = Date.now();
    const response = await request.post('/api/projects', { data: TestData.project() });
    const duration = Date.now() - start;
    expect(response.status()).toBe(201);
    expect(duration).toBeLessThan(3000);
  });

  test('POST /api/evaluate responds under 3s', async ({ request }) => {
    const start = Date.now();
    const response = await request.post('/api/evaluate', { data: TestData.evaluation() });
    const duration = Date.now() - start;
    expect(response.status()).toBe(201);
    expect(duration).toBeLessThan(3000);
  });

  test('page load LCP under 5s for all modules', async ({ page }) => {
    const routes = ['/', '/playbook', '/projects', '/advisor', '/evaluate', '/templates', '/governance', '/caio', '/user-guide'];
    for (const route of routes) {
      const start = Date.now();
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    }
  });
});
