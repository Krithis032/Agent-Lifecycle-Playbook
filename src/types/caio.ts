export interface CaioDomainScoreInput {
  domainKey: string;
  domainName: string;
  score: number; // 1-5
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  currentState: string;
  gaps: string[];
  actions: string[];
  questionScores: { question: string; score: number; evidence: string }[];
}

export interface CaioFindingInput {
  domainKey: string;
  severity: 'critical' | 'warning' | 'good';
  title: string;
  finding: string;
  rationale: string;
  frameworkRef: string;
}

export interface CaioActionItemInput {
  phase: 'immediate' | 'short_term' | 'long_term';
  domainKey: string;
  action: string;
  frameworkRef: string;
  owner: 'CAIO' | 'CTO' | 'CDO' | 'Legal' | 'HR' | 'PM';
}

export interface CaioAssessmentFull {
  id: number;
  projectId?: number;
  initiativeName: string;
  assessmentMode: 'audit' | 'design' | 'folder_analysis';
  overallScore: number;
  maturityLevel: number;
  maturityLabel: string;
  targetMaturity: number;
  riskClassification: string;
  executiveSummary: string;
  assessor: string;
  assessedAt: string;
  domainScores: CaioDomainScoreInput[];
  findings: CaioFindingInput[];
  actionItems: CaioActionItemInput[];
}

export const MATURITY_LEVELS = [
  { level: 1, label: 'Ad Hoc', description: 'No formal AI strategy. Isolated experiments.', color: '#ef4444' },
  { level: 2, label: 'Initial', description: 'Strategy emerging, some governance.', color: '#f59e0b' },
  { level: 3, label: 'Defined', description: 'Formal policies, cross-functional ownership.', color: '#3b82f6' },
  { level: 4, label: 'Managed', description: 'Metrics-driven, systematic optimization.', color: '#22c55e' },
  { level: 5, label: 'Optimized', description: 'Continuous improvement, industry-leading.', color: '#6b3fa0' },
] as const;

// DB model types (from Prisma)
export interface CaioAssessment {
  id: number;
  projectId: number | null;
  initiativeName: string;
  assessmentMode: string;
  overallScore: number | null;
  maturityLevel: number | null;
  maturityLabel: string | null;
  targetMaturity: number | null;
  riskClassification: string | null;
  executiveSummary: string | null;
  assessor: string | null;
  assessedAt: string;
  project?: { id: number; name: string } | null;
  domainScores?: CaioDomainScore[];
  findings?: CaioFinding[];
  actionItems?: CaioActionItem[];
}

export interface CaioDomainScore {
  id: number;
  assessmentId: number;
  domainKey: string;
  domainName: string;
  score: number;
  riskLevel: string | null;
  currentState: string | null;
  gaps: string[] | null;
  actions: string[] | null;
  questionScores: Record<string, number> | null;
}

export interface CaioFinding {
  id: number;
  assessmentId: number;
  domainKey: string;
  severity: string;
  title: string;
  finding: string;
  rationale: string | null;
  frameworkRef: string | null;
}

export interface CaioActionItem {
  id: number;
  assessmentId: number;
  phase: string;
  domainKey: string;
  action: string;
  frameworkRef: string | null;
  owner: string | null;
  status: string;
}
