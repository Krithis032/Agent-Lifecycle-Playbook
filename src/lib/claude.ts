import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ModelTier = 'router' | 'advisor' | 'governance';

const MODEL_MAP: Record<ModelTier, string> = {
  router: process.env.CLAUDE_ROUTER_MODEL || 'claude-haiku-4-5-20251001',
  advisor: process.env.CLAUDE_ADVISOR_MODEL || 'claude-sonnet-4-6',
  governance: process.env.CLAUDE_GOVERNANCE_MODEL || 'claude-opus-4-6',
};

export async function askClaude(
  systemPrompt: string,
  userMessage: string,
  tier: ModelTier = 'advisor',
  maxTokens: number = 4096
) {
  const response = await client.messages.create({
    model: MODEL_MAP[tier],
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return {
    text: response.content[0].type === 'text' ? response.content[0].text : '',
    model: MODEL_MAP[tier],
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
