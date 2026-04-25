import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { requireAuth } from '@/lib/auth';

export const revalidate = 30;

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const refPath = path.resolve(process.cwd(), 'content/reference.yaml');
  try {
    const content = fs.readFileSync(refPath, 'utf-8');
    const data = yaml.load(content);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      architecture_patterns: [],
      frameworks: [],
      model_tiers: [],
      risk_matrix: [],
    });
  }
}
