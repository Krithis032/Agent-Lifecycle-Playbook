import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test.describe('Projects API', () => {
    test('GET /api/projects returns array', async ({ request }) => {
      const res = await request.get('/api/projects');
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test('POST /api/projects creates a project with phase progress', async ({ request }) => {
      const res = await request.post('/api/projects', {
        data: {
          name: 'API Test Project',
          description: 'Created by Playwright API test',
          architecturePattern: 'supervisor_workers',
          framework: 'ag2',
        },
      });
      // POST returns 201
      expect(res.status()).toBe(201);
      const data = await res.json();

      expect(data.name).toBe('API Test Project');
      expect(data.description).toBe('Created by Playwright API test');
      expect(data.status).toBe('active');
      expect(data.currentPhaseId).toBeTruthy();
      expect(data.phaseProgress).toBeDefined();
      expect(data.phaseProgress.length).toBe(7);

      // First phase should be in_progress
      const firstPhase = data.phaseProgress.find(
        (p: { phaseId: number }) => p.phaseId === data.currentPhaseId
      );
      expect(firstPhase?.status).toBe('in_progress');
    });

    test('GET /api/projects/:id returns full project with relations', async ({ request }) => {
      // Create a project first
      const createRes = await request.post('/api/projects', {
        data: { name: 'GET Detail Test' },
      });
      const created = await createRes.json();

      const res = await request.get(`/api/projects/${created.id}`);
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(data.id).toBe(created.id);
      expect(data.name).toBe('GET Detail Test');
      expect(data.currentPhase).toBeDefined();
      expect(data.phaseProgress).toBeDefined();
      expect(data.gateChecks).toBeDefined();
      expect(data.stepProgress).toBeDefined();
      expect(data.templateFills).toBeDefined();
    });

    test('PATCH /api/projects/:id updates project', async ({ request }) => {
      // Create a project first
      const createRes = await request.post('/api/projects', {
        data: { name: 'PATCH Test' },
      });
      const created = await createRes.json();

      const res = await request.patch(`/api/projects/${created.id}`, {
        data: { description: 'Updated description' },
      });
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.description).toBe('Updated description');
    });

    test('GET /api/projects/:id returns 404 for nonexistent', async ({ request }) => {
      const res = await request.get('/api/projects/999999');
      expect(res.status()).toBe(404);
    });
  });

  test.describe('Steps API', () => {
    let testProjectId: number;

    test.beforeAll(async ({ request }) => {
      const res = await request.post('/api/projects', {
        data: { name: 'Steps API Test Project' },
      });
      const data = await res.json();
      testProjectId = data.id;
    });

    test('GET /api/projects/:id/steps returns empty array initially', async ({ request }) => {
      const res = await request.get(`/api/projects/${testProjectId}/steps`);
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBe(0);
    });

    test('PATCH /api/projects/:id/steps creates step progress', async ({ request }) => {
      const res = await request.patch(`/api/projects/${testProjectId}/steps`, {
        data: {
          stepId: 1,
          status: 'in_progress',
          notes: 'Starting step 1',
        },
      });
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('in_progress');
      expect(data.notes).toBe('Starting step 1');
      expect(data.startedAt).toBeTruthy();
    });

    test('PATCH /api/projects/:id/steps updates existing step', async ({ request }) => {
      const res = await request.patch(`/api/projects/${testProjectId}/steps`, {
        data: {
          stepId: 1,
          status: 'completed',
        },
      });
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('completed');
      expect(data.completedAt).toBeTruthy();
    });

    test('PATCH /api/projects/:id/steps rejects missing stepId', async ({ request }) => {
      const res = await request.patch(`/api/projects/${testProjectId}/steps`, {
        data: { status: 'in_progress' },
      });
      expect(res.status()).toBe(400);
    });
  });

  test.describe('Gates API', () => {
    let testProjectId: number;

    test.beforeAll(async ({ request }) => {
      const res = await request.post('/api/projects', {
        data: { name: 'Gates API Test Project' },
      });
      const data = await res.json();
      testProjectId = data.id;
    });

    test('PATCH /api/projects/:id/gates toggles a gate check', async ({ request }) => {
      const res = await request.patch(`/api/projects/${testProjectId}/gates`, {
        data: {
          gateCheckId: 1,
          itemIndex: 0,
          checked: true,
        },
      });
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.success).toBeTruthy();
    });

    test('gate check persists after toggle', async ({ request }) => {
      // Verify by fetching the project
      const res = await request.get(`/api/projects/${testProjectId}`);
      const project = await res.json();
      const gateCheck = project.gateChecks?.find(
        (g: { gateCheckId: number; itemIndex: number }) => g.gateCheckId === 1 && g.itemIndex === 0
      );
      expect(gateCheck?.checked).toBeTruthy();
    });

    test('can uncheck a gate', async ({ request }) => {
      const res = await request.patch(`/api/projects/${testProjectId}/gates`, {
        data: {
          gateCheckId: 1,
          itemIndex: 0,
          checked: false,
        },
      });
      expect(res.status()).toBe(200);

      // Verify
      const projectRes = await request.get(`/api/projects/${testProjectId}`);
      const project = await projectRes.json();
      const gateCheck = project.gateChecks?.find(
        (g: { gateCheckId: number; itemIndex: number }) => g.gateCheckId === 1 && g.itemIndex === 0
      );
      expect(gateCheck?.checked).toBeFalsy();
    });
  });

  test.describe('Phases API', () => {
    test('PATCH /api/projects/:id/phases completes a phase and advances', async ({ request }) => {
      // Create a fresh project
      const createRes = await request.post('/api/projects', {
        data: { name: 'Phases API Test Project' },
      });
      const created = await createRes.json();
      const testProjectId = created.id;
      const firstPhaseId = created.currentPhaseId;

      // Complete phase 1
      const res = await request.patch(`/api/projects/${testProjectId}/phases`, {
        data: {
          phaseId: firstPhaseId,
          status: 'completed',
        },
      });
      expect(res.status()).toBe(200);
      const data = await res.json();

      // Should have advanced currentPhaseId
      expect(data.currentPhaseId).not.toBe(firstPhaseId);

      // Phase 1 should be completed, Phase 2 should be in_progress
      const phase1 = data.phaseProgress.find(
        (p: { phaseId: number }) => p.phaseId === firstPhaseId
      );
      expect(phase1?.status).toBe('completed');

      const phase2 = data.phaseProgress.find(
        (p: { phaseId: number }) => p.phaseId === data.currentPhaseId
      );
      expect(phase2?.status).toBe('in_progress');
    });
  });

  test.describe('Playbook API', () => {
    test('GET /api/playbook/phases returns all phases with steps', async ({ request }) => {
      const res = await request.get('/api/playbook/phases');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBe(7);

      // Each phase should have steps and gateChecks
      for (const phase of data) {
        expect(phase.name).toBeTruthy();
        expect(phase.phaseNum).toBeTruthy();
        expect(phase.slug).toBeTruthy();
        expect(Array.isArray(phase.steps)).toBeTruthy();
        expect(Array.isArray(phase.gateChecks)).toBeTruthy();
      }
    });

    test('GET /api/playbook/phases/ideation returns ideation phase', async ({ request }) => {
      const res = await request.get('/api/playbook/phases/ideation');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(data.name).toContain('Ideation');
      expect(data.phaseNum).toBe(1);
      expect(data.steps.length).toBeGreaterThan(0);
    });

    test('GET /api/playbook/phases/nonexistent returns 404', async ({ request }) => {
      const res = await request.get('/api/playbook/phases/nonexistent');
      expect(res.status()).toBe(404);
    });
  });

  test.describe('Templates API', () => {
    test('GET /api/templates returns all templates', async ({ request }) => {
      const res = await request.get('/api/templates');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThanOrEqual(6);

      // Each template should have fields
      for (const template of data) {
        expect(template.name).toBeTruthy();
        expect(template.slug).toBeTruthy();
        expect(Array.isArray(template.fields)).toBeTruthy();
        expect(template.fields.length).toBeGreaterThan(0);
      }
    });

    test('POST /api/templates/:id/fills creates a template fill', async ({ request }) => {
      // Get first template
      const templatesRes = await request.get('/api/templates');
      const templates = await templatesRes.json();
      const templateId = templates[0].id;

      // Create a fill - POST returns 201
      const res = await request.post(`/api/templates/${templateId}/fills`, {
        data: {
          title: 'API Test Fill',
          fieldValues: { test_field: 'test value' },
        },
      });
      expect(res.status()).toBe(201);
      const data = await res.json();
      expect(data.title).toBe('API Test Fill');
      expect(data.templateId).toBe(templateId);
    });

    test('GET /api/templates/:id/fills returns fills', async ({ request }) => {
      const templatesRes = await request.get('/api/templates');
      const templates = await templatesRes.json();
      const templateId = templates[0].id;

      const res = await request.get(`/api/templates/${templateId}/fills`);
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  test.describe('KB API', () => {
    test('GET /api/kb/search returns results for "agent"', async ({ request }) => {
      const res = await request.get('/api/kb/search?q=agent');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);

      // Each result should have concept_name
      const first = data[0];
      expect(first.concept_name || first.conceptName).toBeTruthy();
    });

    test('GET /api/kb/search returns empty for gibberish', async ({ request }) => {
      const res = await request.get('/api/kb/search?q=xyznonexistent12345');
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBe(0);
    });

    test('GET /api/kb/domains returns domains', async ({ request }) => {
      const res = await request.get('/api/kb/domains');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
    });

    test('GET /api/kb/domains?domainId=1 returns domain with concepts', async ({ request }) => {
      const res = await request.get('/api/kb/domains?domainId=1');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(data.id || data.domain_name).toBeTruthy();
    });

    test('GET /api/kb/concepts/1 returns a concept', async ({ request }) => {
      const res = await request.get('/api/kb/concepts/1');
      expect(res.status()).toBe(200);
      const data = await res.json();

      expect(data.id).toBe(1);
      expect(data.concept_name || data.conceptName).toBeTruthy();
    });
  });
});
