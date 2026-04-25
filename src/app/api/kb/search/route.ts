import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { searchConceptsFallback } from '@/lib/search';


export async function GET(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json([]);

  try {
    // Use fallback (LIKE) search since FULLTEXT index may not be set up
    const results = await searchConceptsFallback(q, 10);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
