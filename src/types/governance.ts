export interface TrustLayerScore {
  layerNum: number;
  layerName: string;
  slug: string;
  score: number; // 1-10
  evidence: string;
  gaps: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface WhartonDomainInput {
  domainKey: string;
  domainName: string;
  questions: {
    question: string;
    score: number; // 1-3
    evidence: string;
  }[];
  overallScore: number; // avg of question scores, normalized to 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  currentState: string;
  gaps: string[];
  actions: string[];
}

export interface ComplianceCheck {
  framework: string;
  requirement: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  notes: string;
}

export interface RiskItemInput {
  category: 'data' | 'model' | 'security' | 'compliance' | 'operational' | 'ethical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  mitigation?: string;
}

export interface GovernanceAssessmentFull {
  id: number;
  projectId: number;
  assessmentType: 'initial' | 'periodic' | 'incident';
  trustLayerScores: TrustLayerScore[];
  riskClassification: string;
  complianceStatus: ComplianceCheck[];
  overallScore: number;
  assessor: string;
  assessedAt: string;
  notes: string;
  riskItems: RiskItemInput & { id: number; status: string }[];
  whartonScores: WhartonDomainInput & { id: number }[];
  project?: { id: number; name: string; status: string };
}

// DB model types (from Prisma)
export interface GovernanceAssessment {
  id: number;
  projectId: number;
  assessmentType: string;
  trustLayerScores: TrustLayerScore[] | null;
  riskClassification: string | null;
  complianceStatus: ComplianceCheck[] | null;
  overallScore: number | null;
  assessor: string | null;
  assessedAt: string;
  notes: string | null;
  riskItems?: RiskItem[];
  whartonScores?: WhartonDomainScore[];
  project?: { id: number; name: string; status: string };
}

export interface RiskItem {
  id: number;
  assessmentId: number;
  category: string;
  severity: string;
  title: string;
  description: string | null;
  mitigation: string | null;
  status: string;
}

export interface WhartonDomainScore {
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
