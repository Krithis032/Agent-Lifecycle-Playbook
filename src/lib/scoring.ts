export interface ScoringCriterion {
  name: string;
  weight: number;
}

export interface ScoringOption {
  name: string;
  scores: Record<string, number>;
}

export interface ScoringResult {
  option: string;
  weightedTotal: number;
  breakdown: { criterion: string; weight: number; score: number; weighted: number }[];
}

export function calculateWeightedScores(
  criteria: ScoringCriterion[],
  options: ScoringOption[]
): ScoringResult[] {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return options
    .map((option) => {
      const breakdown = criteria.map((criterion) => {
        const score = option.scores[criterion.name] ?? 0;
        const normalizedWeight = criterion.weight / totalWeight;
        return {
          criterion: criterion.name,
          weight: criterion.weight,
          score,
          weighted: score * normalizedWeight,
        };
      });

      return {
        option: option.name,
        weightedTotal: breakdown.reduce((sum, b) => sum + b.weighted, 0),
        breakdown,
      };
    })
    .sort((a, b) => b.weightedTotal - a.weightedTotal);
}

export function getRecommendation(results: ScoringResult[]): {
  winner: string;
  score: number;
  margin: number;
} | null {
  if (results.length === 0) return null;
  const winner = results[0];
  const runnerUp = results[1];
  return {
    winner: winner.option,
    score: Math.round(winner.weightedTotal * 100) / 100,
    margin: runnerUp
      ? Math.round((winner.weightedTotal - runnerUp.weightedTotal) * 100) / 100
      : 0,
  };
}

/* ── Evaluation Decision Matrix scoring (Sprint 7) ── */

import type { EvalOption, EvalCriterion, EvalScore, WeightedScoreResult } from '@/types/evaluation';

export function calculateEvalWeightedScores(
  options: EvalOption[],
  criteria: EvalCriterion[],
  scores: EvalScore[]
): WeightedScoreResult[] {
  const results = options.map(option => {
    const criterionScores = criteria.map(criterion => {
      const score = scores.find(
        s => s.optionKey === option.key && s.criterionKey === criterion.key
      );
      return {
        criterionKey: criterion.key,
        raw: score?.score || 0,
        weighted: (score?.score || 0) * criterion.weight,
      };
    });
    return {
      optionKey: option.key,
      optionName: option.name,
      totalScore: criterionScores.reduce((sum, cs) => sum + cs.weighted, 0),
      criterionScores,
      rank: 0,
    };
  });

  results.sort((a, b) => b.totalScore - a.totalScore);
  results.forEach((r, i) => {
    r.rank = i + 1;
  });
  return results;
}

export function generateRecommendation(
  results: WeightedScoreResult[]
): { recommendation: string; rationale: string } {
  if (results.length === 0) {
    return { recommendation: 'N/A', rationale: 'No options were evaluated.' };
  }

  const winner = results[0];
  const runnerUp = results[1];
  const gap = winner.totalScore - (runnerUp?.totalScore || 0);
  const confidence = gap > 0.5 ? 'strong' : gap > 0.2 ? 'moderate' : 'marginal';

  return {
    recommendation: winner.optionName,
    rationale: `${winner.optionName} scored ${winner.totalScore.toFixed(2)}/5.00 (${confidence} lead of ${gap.toFixed(2)} over ${runnerUp?.optionName || 'N/A'}). ${
      confidence === 'marginal'
        ? 'Consider prototyping both top options before committing.'
        : ''
    }`.trim(),
  };
}

