import { test, expect } from '@playwright/test';
import { TestData } from '../fixtures/test-data';

// Run cross-module tests serially to avoid dev server webpack contention
test.describe.configure({ mode: 'serial' });

test.describe('Cross-Module Linking', () => {
  let projectId: number;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/projects', { data: TestData.project({ name: `CrossLink Test ${Date.now()}` }) });
    const project = await res.json();
    projectId = project.id;
  });

  test('project links to playbook phase (currentPhaseId FK)', async ({ request }) => {
    const res = await request.get(`/api/projects/${projectId}`);
    const project = await res.json();
    expect(project.currentPhaseId).toBeTruthy();
    expect(project.currentPhase).toHaveProperty('name');
  });

  test('project initializes all 7 phase progress records', async ({ request }) => {
    const res = await request.get(`/api/projects/${projectId}`);
    const project = await res.json();
    expect(project.phaseProgress.length).toBe(7);
    const statuses = project.phaseProgress.map((p: { status: string }) => p.status);
    expect(statuses).toContain('in_progress'); // First phase
    expect(statuses.filter((s: string) => s === 'not_started').length).toBe(6);
  });

  test('evaluation can link to project', async ({ request }) => {
    const evalData = TestData.evaluation();
    (evalData as Record<string, unknown>).projectId = projectId;
    const res = await request.post('/api/evaluate', { data: evalData });
    expect(res.status()).toBe(201);
    const eval_ = await res.json();
    expect(eval_.projectId).toBe(projectId);
  });

  test('governance assessment links to project', async ({ request }) => {
    const govData = TestData.governanceAssessment(projectId);
    const res = await request.post('/api/governance/assess', { data: govData });
    expect(res.status()).toBe(201);
    const assessment = await res.json();
    expect(assessment.projectId).toBe(projectId);
  });

  test('CAIO assessment links to project', async ({ request }) => {
    test.setTimeout(90_000); // CAIO calls Claude Opus which can take > 30s
    const caioData = TestData.caioAssessment(projectId);
    const res = await request.post('/api/caio/assess', { data: caioData });
    // Claude API may be transiently unavailable — skip rather than fail
    if (res.status() === 500) {
      const body = await res.json().catch(() => ({}));
      test.skip(true, `CAIO API returned 500 (external dependency): ${JSON.stringify(body).slice(0, 200)}`);
      return;
    }
    expect(res.status()).toBe(201);
    const assessment = await res.json();
    expect(assessment.projectId).toBe(projectId);
  });

  test('project export includes all linked data', async ({ request }) => {
    test.setTimeout(60_000);
    // Dev server webpack may transiently fail under heavy load (MODULE_NOT_FOUND);
    // retry up to 3 times with increasing delay
    let res = await request.get(`/api/projects/${projectId}/export/pdf`);
    for (let attempt = 1; attempt <= 3 && !res.ok(); attempt++) {
      await new Promise((r) => setTimeout(r, attempt * 2000));
      res = await request.get(`/api/projects/${projectId}/export/pdf`);
    }
    expect(res.ok()).toBeTruthy();
    const body = await res.body();
    const text = body.toString('latin1');
    expect(text.toLowerCase()).toContain('executive summary');
  });
});

test.describe('Database Integrity', () => {
  test('project creation initializes gate checks via phases', async ({ request }) => {
    const res = await request.post('/api/projects', { data: TestData.project() });
    const project = await res.json();
    const detail = await request.get(`/api/projects/${project.id}`);
    const data = await detail.json();
    expect(data.phaseProgress.length).toBe(7);
  });

  test('duplicate project names are allowed', async ({ request }) => {
    const name = `Duplicate Test ${Date.now()}`;
    const res1 = await request.post('/api/projects', { data: { name } });
    const res2 = await request.post('/api/projects', { data: { name } });
    expect(res1.status()).toBe(201);
    expect(res2.status()).toBe(201);
  });

  test('JSON columns store and retrieve correctly', async ({ request }) => {
    const data = TestData.project({
      modelStrategy: { primary: 'claude-sonnet', fallback: 'claude-haiku' },
      teamMembers: [{ name: 'Test User', role: 'Lead' }],
    });
    const res = await request.post('/api/projects', { data });
    expect(res.status()).toBe(201);
    const project = await res.json();
    expect(project.modelStrategy).toEqual({ primary: 'claude-sonnet', fallback: 'claude-haiku' });
  });

  test('evaluation stores weighted scores correctly', async ({ request }) => {
    const data = TestData.evaluation();
    const res = await request.post('/api/evaluate', { data });
    const eval_ = await res.json();
    expect(eval_.weightedScores).toBeTruthy();
    expect(Object.keys(eval_.weightedScores).length).toBeGreaterThan(0);
  });
});
