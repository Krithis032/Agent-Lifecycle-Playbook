import { APIRequestContext } from '@playwright/test';

/**
 * Type-safe API test client for ADP portal endpoints.
 * © 2026 Padmasani Srimadhan. All rights reserved.
 */
export class AdpApiClient {
  constructor(private request: APIRequestContext) {}

  // ── Projects ──
  async listProjects() {
    const res = await this.request.get('/api/projects');
    return res.json();
  }

  async createProject(data: Record<string, unknown>) {
    return this.request.post('/api/projects', { data });
  }

  async getProject(id: number) {
    return this.request.get(`/api/projects/${id}`);
  }

  async updateProject(id: number, data: Record<string, unknown>) {
    return this.request.patch(`/api/projects/${id}`, { data });
  }

  async exportProjectPdf(id: number) {
    return this.request.get(`/api/projects/${id}/export/pdf`);
  }

  async exportProjectPptx(id: number) {
    return this.request.get(`/api/projects/${id}/export/pptx`);
  }

  // ── Playbook ──
  async getPhases() {
    const res = await this.request.get('/api/playbook/phases');
    return res.json();
  }

  async getPhaseBySlug(slug: string) {
    return this.request.get(`/api/playbook/phases/${slug}`);
  }

  // ── KB ──
  async searchKb(q: string) {
    const res = await this.request.get(`/api/kb/search?q=${encodeURIComponent(q)}`);
    return res.json();
  }

  async getDomains() {
    const res = await this.request.get('/api/kb/domains');
    return res.json();
  }

  // ── Evaluate ──
  async createEvaluation(data: Record<string, unknown>) {
    return this.request.post('/api/evaluate', { data });
  }

  // ── Governance ──
  async createGovernanceAssessment(data: Record<string, unknown>) {
    return this.request.post('/api/governance/assess', { data });
  }

  // ── CAIO ──
  async createCaioAssessment(data: Record<string, unknown>) {
    return this.request.post('/api/caio/assess', { data });
  }

  // ── Templates ──
  async listTemplates() {
    const res = await this.request.get('/api/templates');
    return res.json();
  }

  // ── User Guide ──
  async downloadUserGuidePdf() {
    return this.request.get('/api/user-guide/pdf');
  }

  async downloadUserGuidePptx() {
    return this.request.get('/api/user-guide/pptx');
  }
}
