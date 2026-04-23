import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { assistTemplateFill } from '@/lib/template-assist';
import { logError } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const limited = rateLimit(req, { maxRequests: 10, windowMs: 60_000, keyPrefix: 'template-assist' });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { templateName, fieldLabel, fieldHelpText, existingValues, projectContext } = body;

    if (!templateName || !fieldLabel) {
      return NextResponse.json({ error: 'Missing templateName or fieldLabel' }, { status: 400 });
    }

    const text = await assistTemplateFill(
      templateName,
      fieldLabel,
      fieldHelpText || '',
      existingValues || {},
      projectContext
    );

    return NextResponse.json({ text });
  } catch (err) {
    logError('POST /api/templates/assist', err);
    return NextResponse.json({ error: 'AI assist failed' }, { status: 500 });
  }
}
