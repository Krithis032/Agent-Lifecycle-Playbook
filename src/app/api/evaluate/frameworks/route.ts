import { NextResponse } from 'next/server';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const revalidate = 30;

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const refPath = path.resolve(process.cwd(), 'content/reference.yaml');
    const content = fs.readFileSync(refPath, 'utf-8');
    const data = yaml.load(content) as Record<string, unknown>;
    const frameworks = data.frameworks || [];
    return NextResponse.json(frameworks);
  } catch (err) {
    logError('GET /api/evaluate/frameworks', err);
    return NextResponse.json({ error: 'Failed to load frameworks' }, { status: 500 });
  }
}
