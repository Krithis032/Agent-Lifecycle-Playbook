import { askClaude } from './claude';

const EVAL_SYSTEM_PROMPT = `You are an AI architecture advisor. Given evaluation scores for different options across weighted criteria, provide:
1. A concise recommendation (2-3 sentences)
2. Key trade-offs to consider
3. Risk factors for the recommended option
4. Conditions under which the runner-up might be preferred

Be specific, referencing actual scores and criteria. Respond in JSON:
{
  "recommendation": "...",
  "tradeoffs": ["...", "..."],
  "risks": ["...", "..."],
  "alternativeConditions": "..."
}`;

export interface EvalAnalysisResult {
  recommendation: string;
  tradeoffs: string[];
  risks: string[];
  alternativeConditions: string;
}

export async function getEvalAnalysis(
  evalType: string,
  title: string,
  options: { name: string; totalScore: number; rank: number }[],
  criteria: { name: string; weight: number }[],
  projectContext?: string
): Promise<EvalAnalysisResult> {
  const userMessage = `
Evaluation Type: ${evalType}
Title: ${title}
${projectContext ? `Project Context: ${projectContext}` : ''}

Results (ranked):
${options.map(o => `${o.rank}. ${o.name}: ${o.totalScore.toFixed(2)}/5.00`).join('\n')}

Criteria (weighted):
${criteria.map(c => `- ${c.name} (${(c.weight * 100).toFixed(0)}%)`).join('\n')}

Provide your analysis.`;

  const result = await askClaude(EVAL_SYSTEM_PROMPT, userMessage, 'advisor', 2048);

  try {
    return JSON.parse(result.text) as EvalAnalysisResult;
  } catch {
    return {
      recommendation: result.text,
      tradeoffs: [],
      risks: [],
      alternativeConditions: '',
    };
  }
}
