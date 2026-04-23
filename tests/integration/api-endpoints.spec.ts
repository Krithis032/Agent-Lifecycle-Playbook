import { test, expect } from '@playwright/test';
import { TestData } from '../fixtures/test-data';

test.describe('Playbook API', () => {
  test('GET /api/playbook/phases returns all 7 phases', async ({ request }) => {
    const response = await request.get('/api/playbook/phases');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveLength(7);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('steps');
    expect(data[0]).toHaveProperty('gateChecks');
  });

  test('phases are returned in correct sort order', async ({ request }) => {
    const response = await request.get('/api/playbook/phases');
    const data = await response.json();
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].sortOrder).toBeLessThan(data[i + 1].sortOrder);
    }
  });

  test('each phase has steps with required fields', async ({ request }) => {
    const response = await request.get('/api/playbook/phases');
    const data = await response.json();
    for (const phase of data) {
      expect(phase.steps.length).toBeGreaterThan(0);
      for (const step of phase.steps) {
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('body');
        expect(step).toHaveProperty('stepNum');
      }
    }
  });

  test('each phase has gate checks', async ({ request }) => {
    const response = await request.get('/api/playbook/phases');
    const data = await response.json();
    for (const phase of data) {
      expect(phase.gateChecks.length).toBeGreaterThan(0);
      for (const gate of phase.gateChecks) {
        expect(gate).toHaveProperty('gateTitle');
        expect(gate).toHaveProperty('checkItems');
      }
    }
  });

  test('GET /api/playbook/phases/[slug] returns phase detail', async ({ request }) => {
    // First get all phases to find a valid slug
    const all = await request.get('/api/playbook/phases');
    const phases = await all.json();
    const slug = phases[0].slug;

    const response = await request.get(`/api/playbook/phases/${slug}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('name');
    expect(data.steps.length).toBeGreaterThan(0);
  });

  test('GET /api/playbook/phases/nonexistent returns 404', async ({ request }) => {
    const response = await request.get('/api/playbook/phases/this-phase-does-not-exist');
    expect(response.status()).toBe(404);
  });

  test('GET /api/playbook/reference returns reference data', async ({ request }) => {
    const response = await request.get('/api/playbook/reference');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toBeTruthy();
  });
});

test.describe('Projects API', () => {
  test('GET /api/projects returns project list', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST /api/projects creates a new project', async ({ request }) => {
    const data = TestData.project();
    const response = await request.post('/api/projects', { data });
    expect(response.status()).toBe(201);
    const project = await response.json();
    expect(project).toHaveProperty('id');
    expect(project.name).toBe(data.name);
    expect(project.phaseProgress.length).toBe(7); // All 7 phases initialized
  });

  test('POST /api/projects requires name', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: { description: 'No name' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/projects with minimal data works', async ({ request }) => {
    const data = TestData.projectMinimal();
    const response = await request.post('/api/projects', { data });
    expect(response.status()).toBe(201);
    const project = await response.json();
    expect(project.name).toBe(data.name);
  });

  test('GET /api/projects/[id] returns project detail', async ({ request }) => {
    // Create first
    const createRes = await request.post('/api/projects', { data: TestData.project() });
    const created = await createRes.json();

    const response = await request.get(`/api/projects/${created.id}`);
    expect(response.ok()).toBeTruthy();
    const project = await response.json();
    expect(project.id).toBe(created.id);
  });

  test('GET /api/projects/[id] with invalid ID returns 404', async ({ request }) => {
    const response = await request.get('/api/projects/999999');
    expect(response.status()).toBe(404);
  });

  test('PATCH /api/projects/[id] updates project', async ({ request }) => {
    const createRes = await request.post('/api/projects', { data: TestData.project() });
    const created = await createRes.json();

    const response = await request.patch(`/api/projects/${created.id}`, {
      data: { status: 'paused' },
    });
    expect(response.ok()).toBeTruthy();
    const updated = await response.json();
    expect(updated.status).toBe('paused');
  });

  test('project export PDF generates valid output', async ({ request }) => {
    const createRes = await request.post('/api/projects', { data: TestData.project() });
    const created = await createRes.json();

    const response = await request.get(`/api/projects/${created.id}/export/pdf`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/pdf');
    const body = await response.body();
    expect(body.length).toBeGreaterThan(500);
  });

  test('project export PPTX generates valid output', async ({ request }) => {
    const createRes = await request.post('/api/projects', { data: TestData.project() });
    const created = await createRes.json();

    const response = await request.get(`/api/projects/${created.id}/export/pptx`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/vnd.openxmlformats');
  });
});

test.describe('KB API', () => {
  test('GET /api/kb/domains returns domain list', async ({ request }) => {
    const response = await request.get('/api/kb/domains');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/kb/domains?domainId=N returns domain with concepts', async ({ request }) => {
    const domainsRes = await request.get('/api/kb/domains');
    const domains = await domainsRes.json();
    if (domains.length > 0) {
      const response = await request.get(`/api/kb/domains?domainId=${domains[0].id}`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('concepts');
    }
  });

  test('GET /api/kb/search returns results for valid query', async ({ request }) => {
    const response = await request.get('/api/kb/search?q=agent');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('GET /api/kb/search returns empty for empty query', async ({ request }) => {
    const response = await request.get('/api/kb/search?q=');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toEqual([]);
  });

  test('GET /api/kb/search handles special characters', async ({ request }) => {
    const response = await request.get('/api/kb/search?q=%25%26%3C%3E');
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/kb/concepts/[id] returns concept detail', async ({ request }) => {
    const searchRes = await request.get('/api/kb/search?q=agent');
    const results = await searchRes.json();
    if (results.length > 0) {
      const response = await request.get(`/api/kb/concepts/${results[0].id}`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('conceptName');
    }
  });
});

test.describe('Evaluate API', () => {
  test('GET /api/evaluate returns evaluations', async ({ request }) => {
    const response = await request.get('/api/evaluate');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('POST /api/evaluate creates evaluation with recommendation', async ({ request }) => {
    const data = TestData.evaluation();
    const response = await request.post('/api/evaluate', { data });
    expect(response.status()).toBe(201);
    const eval_ = await response.json();
    expect(eval_).toHaveProperty('id');
    expect(eval_).toHaveProperty('recommendation');
    expect(eval_).toHaveProperty('weightedScores');
  });

  test('POST /api/evaluate rejects missing fields', async ({ request }) => {
    const response = await request.post('/api/evaluate', {
      data: { title: 'Incomplete' },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe('Templates API', () => {
  test('GET /api/templates returns template list', async ({ request }) => {
    const response = await request.get('/api/templates');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('slug');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('fields');
    }
  });

  test('GET /api/templates/[slug] returns template detail', async ({ request }) => {
    const listRes = await request.get('/api/templates');
    const templates = await listRes.json();
    if (templates.length > 0) {
      const response = await request.get(`/api/templates/${templates[0].slug}`);
      expect(response.ok()).toBeTruthy();
    }
  });
});

test.describe('Dashboard Stats API', () => {
  test('GET /api/dashboard/stats returns stats', async ({ request }) => {
    const response = await request.get('/api/dashboard/stats');
    expect(response.ok()).toBeTruthy();
  });

  test('GET /api/dashboard/activity returns activity', async ({ request }) => {
    const response = await request.get('/api/dashboard/activity');
    expect(response.ok()).toBeTruthy();
  });
});
