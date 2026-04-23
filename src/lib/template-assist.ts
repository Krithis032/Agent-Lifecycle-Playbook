import { askClaude } from './claude';

export async function assistTemplateFill(
  templateName: string,
  fieldLabel: string,
  fieldHelpText: string,
  existingValues: Record<string, string>,
  projectContext?: string
): Promise<string> {
  const systemPrompt = `You are an expert AI architect helping fill in an "${templateName}" template.
The user needs help with the "${fieldLabel}" field.
${fieldHelpText ? `Field guidance: ${fieldHelpText}` : ''}

Based on the other fields already filled in, generate a professional, thorough draft for this field.
Write directly — no preamble. Be specific and actionable.`;

  const userMessage = `
Already filled fields:
${Object.entries(existingValues)
  .filter(([, v]) => v)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}
${projectContext ? `\nProject context: ${projectContext}` : ''}

Generate the content for "${fieldLabel}".`;

  const result = await askClaude(systemPrompt, userMessage, 'advisor', 2048);
  return result.text;
}
