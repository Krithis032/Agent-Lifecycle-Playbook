import { askClaude } from './claude';

const CAIO_SYSTEM_PROMPT = `You are a Chief AI Officer advisor grounded in three frameworks:
1. The Chief AI Officer's Handbook (Jarrod Anderson, Packt 2025)
2. Wharton AI Strategy and Governance (Hosanagar, Wu, Tamba, Werbach)
3. Enterprise AI Strategy (PEEK, BRIDGE, SCALE, ADAPT, GARD)

Given domain scores (1-5) with evidence, generate:
1. An executive summary (2-3 paragraphs)
2. Findings categorized as critical (score 1-2), warning (score 2-3), or good (score 4-5)
3. Action items phased as immediate (0-30 days), short_term (1-3 months), long_term (3-12 months)

Each finding MUST reference a specific framework (e.g., "NIST AI RMF - Map function", "Wharton Domain 3 - Bias & Fairness").
Each action MUST include a suggested owner role (CAIO, CTO, CDO, Legal, HR, PM).

Respond ONLY in valid JSON with this exact structure:
{
  "executiveSummary": "...",
  "maturityLevel": 1-5,
  "maturityLabel": "Ad Hoc|Initial|Defined|Managed|Optimized",
  "findings": [
    {"domainKey": "...", "severity": "critical|warning|good", "title": "...", "finding": "...", "rationale": "...", "frameworkRef": "..."}
  ],
  "actionItems": [
    {"phase": "immediate|short_term|long_term", "domainKey": "...", "action": "...", "frameworkRef": "...", "owner": "CAIO|CTO|CDO|Legal|HR|PM"}
  ]
}`;

export async function generateCaioAssessment(
  initiativeName: string,
  domainScores: { domainKey: string; domainName: string; score: number; evidence: string; gaps: string[] }[],
  projectContext?: string
) {
  const userMessage = `
Initiative: ${initiativeName}
${projectContext ? `Project Context: ${projectContext}` : ''}

Domain Scores:
${domainScores.map(d => `- ${d.domainName} (${d.domainKey}): ${d.score}/5
  Evidence: ${d.evidence || 'No evidence provided'}
  Gaps: ${d.gaps.length > 0 ? d.gaps.join('; ') : 'None identified'}`).join('\n')}

Generate the CAIO assessment with findings and action items.`;

  const result = await askClaude(CAIO_SYSTEM_PROMPT, userMessage, 'governance', 8192);

  try {
    // Try to extract JSON from the response
    const text = result.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch {
    // If Opus returns non-JSON, create a fallback
    const avgScore = domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length;
    const level = Math.round(avgScore);
    const labels = ['', 'Ad Hoc', 'Initial', 'Defined', 'Managed', 'Optimized'];
    return {
      executiveSummary: result.text,
      maturityLevel: level,
      maturityLabel: labels[level] || 'Initial',
      findings: domainScores
        .filter(d => d.score <= 2)
        .map(d => ({
          domainKey: d.domainKey,
          severity: d.score <= 1 ? 'critical' : 'warning',
          title: `${d.domainName} requires attention`,
          finding: `Score of ${d.score}/5 indicates significant gaps.`,
          rationale: d.gaps.join('; ') || 'Low score detected',
          frameworkRef: 'CAIO Handbook',
        })),
      actionItems: [],
    };
  }
}
