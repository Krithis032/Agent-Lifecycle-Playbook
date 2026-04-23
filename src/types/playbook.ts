export interface PlaybookPhase {
  id: number;
  phaseNum: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
  duration: string;
  subtitle: string;
  interviewAngle: string;
  sortOrder: number;
  steps: PlaybookStep[];
  gateChecks: GateCheck[];
}

export interface PlaybookStep {
  id: number;
  phaseId: number;
  stepNum: number;
  title: string;
  body: string;
  codeExample: string | null;
  proTip: string | null;
  deliverables: string[];
  tools: string[];
  tableData: Record<string, unknown> | null;
  sortOrder: number;
}

export interface GateCheck {
  id: number;
  phaseId: number;
  gateTitle: string;
  checkItems: string[];
}

export interface ReferenceData {
  architecturePatterns: ArchitecturePattern[];
  frameworks: FrameworkComparison[];
  modelTiers: ModelTier[];
  riskMatrix: RiskMatrixEntry[];
}

export interface ArchitecturePattern {
  name: string;
  description: string;
  bestFor: string;
  complexity: string;
  scalability: string;
}

export interface FrameworkComparison {
  name: string;
  language: string;
  controlLevel: string;
  learningCurve: string;
  bestFor: string;
  stateManagement: string;
}

export interface ModelTier {
  model: string;
  tier: string;
  capability: string;
  cost: string;
  latency: string;
  bestFor: string;
}

export interface RiskMatrixEntry {
  stakes: string;
  errorVisibility: string;
  classification: string;
  approach: string;
}
