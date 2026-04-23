/**
 * Shared test data factories for ADP Playwright tests.
 * © 2026 Padmasani Srimadhan. All rights reserved.
 */

export const TestData = {
  project: (overrides: Record<string, unknown> = {}) => ({
    name: `Test Project ${Date.now()}`,
    description: 'Automated test project for ADP portal validation',
    status: 'active',
    architecturePattern: 'orchestrator_worker',
    framework: 'langgraph',
    ...overrides,
  }),

  projectMinimal: () => ({
    name: `Minimal Project ${Date.now()}`,
  }),

  kbSearchQuery: (overrides: Record<string, unknown> = {}) => ({
    q: 'agent architecture patterns',
    ...overrides,
  }),

  kbAskQuestion: (overrides: Record<string, unknown> = {}) => ({
    question: 'What is the ReAct pattern for agentic AI?',
    projectId: null,
    ...overrides,
  }),

  evaluation: (overrides: Record<string, unknown> = {}) => ({
    evalType: 'framework_comparison',
    title: `Test Evaluation ${Date.now()}`,
    options: [
      { id: 'opt1', name: 'LangGraph' },
      { id: 'opt2', name: 'AutoGen' },
    ],
    criteria: [
      { id: 'crit1', name: 'Multi-Agent Support', weight: 5 },
      { id: 'crit2', name: 'Production Readiness', weight: 4 },
    ],
    scores: [
      { optionId: 'opt1', criterionId: 'crit1', score: 4 },
      { optionId: 'opt1', criterionId: 'crit2', score: 5 },
      { optionId: 'opt2', criterionId: 'crit1', score: 3 },
      { optionId: 'opt2', criterionId: 'crit2', score: 3 },
    ],
    ...overrides,
  }),

  governanceAssessment: (projectId: number) => ({
    projectId,
    assessmentType: 'initial',
    overallScore: 72.5,
    riskClassification: 'medium',
    trustLayerScores: { transparency: 0.8, fairness: 0.7, safety: 0.6, privacy: 0.75, security: 0.8, accountability: 0.7, reliability: 0.65 },
    whartonDomains: [
      { domainKey: 'strategy', domainName: 'Strategy & Vision', overallScore: 0.75, riskLevel: 'medium' },
      { domainKey: 'data', domainName: 'Data Governance', overallScore: 0.60, riskLevel: 'high' },
    ],
    riskItems: [
      { category: 'privacy', severity: 'high', title: 'PII Data Exposure Risk', description: 'Agent may process sensitive PII data without proper anonymization', mitigation: 'Implement data masking pipeline' },
    ],
    notes: 'Initial governance assessment for test project',
  }),

  caioAssessment: (projectId?: number) => ({
    projectId: projectId || null,
    initiativeName: `CAIO Test Assessment ${Date.now()}`,
    assessmentMode: 'audit',
    targetMaturity: 4,
    domainScores: [
      { domainKey: 'vision', domainName: 'AI Vision & Strategy', score: 3, currentState: 'Partial vision defined' },
      { domainKey: 'governance', domainName: 'Governance Framework', score: 2, currentState: 'Ad hoc governance' },
      { domainKey: 'talent', domainName: 'AI Talent & Skills', score: 4, currentState: 'Dedicated team' },
    ],
  }),

  templateFill: (templateSlug: string) => ({
    title: `Test Fill ${Date.now()}`,
    fieldValues: {
      project_name: 'Test Agent Project',
      description: 'An agent for automated testing',
      team_lead: 'Padmasani Srimadhan',
    },
  }),
};

/** SQL injection payloads */
export const INJECTION_PAYLOADS = [
  "'; DROP TABLE projects; --",
  "1' OR '1'='1",
  "1; SELECT * FROM kb_concepts; --",
  "' UNION SELECT * FROM users --",
  "1' AND SLEEP(5) --",
  "admin'/*",
  "1; EXEC xp_cmdshell('whoami'); --",
  "Robert'); DROP TABLE projects;--",
  "1 OR 1=1",
  "' OR '' = '",
];

/** XSS payloads */
export const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(1)>',
  "javascript:alert('XSS')",
  '<iframe src="data:text/html,<script>alert(1)</script>">',
  '{{constructor.constructor("return this")()}}',
  '${7*7}',
  '<body onload=alert(1)>',
  "'-alert(1)-'",
  '"><img src=x onerror=alert(document.cookie)>',
];

/** Path traversal payloads */
export const TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..%2F..%2F..%2Fetc%2Fpasswd',
  '....//....//....//etc/passwd',
  '%252e%252e%252f',
  '..\\..\\..\\etc\\passwd',
  '..%5c..%5c..%5cetc%5cpasswd',
];
