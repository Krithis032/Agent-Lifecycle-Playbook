export type EvalType = 'framework' | 'architecture' | 'model_tier' | 'custom';

export interface EvalOption {
  key: string;
  name: string;
  description?: string;
}

export interface EvalCriterion {
  key: string;
  name: string;
  weight: number; // 0.0 - 1.0
  description?: string;
  metric?: string;
  thresholdGood?: number | string;
  thresholdAcceptable?: number | string;
}

export interface EvalScore {
  optionKey: string;
  criterionKey: string;
  score: number; // 1-5
  evidence?: string;
}

export interface EvalPreset {
  slug: string;
  name: string;
  description: string;
  dimensions: {
    name: string;
    weight: number;
    metric: string;
    threshold_good: number | string;
    threshold_acceptable: number | string;
    measurement: string;
  }[];
}

export interface EvaluationFull {
  id: number;
  projectId?: number | null;
  evalType: EvalType;
  title: string;
  options: EvalOption[];
  criteria: EvalCriterion[];
  scores: EvalScore[];
  recommendation?: string | null;
  rationale?: string | null;
  createdAt: string;
  projectName?: string;
  // Computed
  weightedScores?: WeightedScoreResult[];
}

export interface WeightedScoreResult {
  optionKey: string;
  optionName: string;
  totalScore: number;
  criterionScores: { criterionKey: string; raw: number; weighted: number }[];
  rank: number;
}

// Default criteria for Framework Selection evaluations
export const FRAMEWORK_EVAL_CRITERIA: EvalCriterion[] = [
  { key: 'production_readiness', name: 'Production Readiness', weight: 0.20, description: 'Stability, documentation, community support, enterprise adoption' },
  { key: 'learning_curve', name: 'Learning Curve', weight: 0.15, description: 'Time to proficiency for the team' },
  { key: 'pattern_support', name: 'Architecture Pattern Support', weight: 0.20, description: 'How well it supports the target architecture pattern' },
  { key: 'claude_integration', name: 'Claude Model Integration', weight: 0.15, description: 'Native support for Claude models and Anthropic ecosystem' },
  { key: 'controllability', name: 'Controllability & Debugging', weight: 0.15, description: 'Ability to inspect, debug, and control agent behavior' },
  { key: 'scalability', name: 'Scalability', weight: 0.10, description: 'Performance and scaling characteristics for production workloads' },
  { key: 'cost_efficiency', name: 'Cost Efficiency', weight: 0.05, description: 'Framework overhead on LLM token costs' },
];

// Default criteria for Architecture Pattern Selection evaluations
export const ARCHITECTURE_EVAL_CRITERIA: EvalCriterion[] = [
  { key: 'complexity_fit', name: 'Complexity Fit', weight: 0.20, description: 'Does the pattern complexity match the use case complexity?' },
  { key: 'controllability', name: 'Controllability', weight: 0.20, description: 'Determinism, auditability, and debugging ease' },
  { key: 'latency', name: 'Latency Profile', weight: 0.15, description: 'Expected end-to-end response time' },
  { key: 'team_capability', name: 'Team Capability Match', weight: 0.15, description: 'Does the team have the skills to build and maintain this?' },
  { key: 'scalability', name: 'Scalability', weight: 0.10, description: 'Can it handle growth in users, data, and agents?' },
  { key: 'cost', name: 'Cost Efficiency', weight: 0.10, description: 'Token cost and infrastructure overhead' },
  { key: 'governance', name: 'Governance Compatibility', weight: 0.10, description: 'How well it supports HITL, audit trails, and compliance' },
];
