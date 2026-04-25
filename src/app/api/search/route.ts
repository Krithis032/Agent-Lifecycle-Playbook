import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/logger';

export const revalidate = 30;

export async function GET(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const q = req.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const [projects, evaluations, assessments, fills] = await Promise.all([
      prisma.project.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true },
        take: 5,
      }),
      prisma.evaluation.findMany({
        where: { title: { contains: q } },
        select: { id: true, title: true },
        take: 5,
      }),
      prisma.governanceAssessment.findMany({
        where: { assessmentType: { contains: q } },
        select: { id: true, assessmentType: true },
        take: 5,
      }),
      prisma.templateFill.findMany({
        where: { title: { contains: q } },
        select: { id: true, title: true, template: { select: { slug: true } } },
        take: 5,
      }),
    ]);

    const results = [
      ...projects.map(p => ({ type: 'project', id: p.id, title: p.name, link: `/projects/${p.id}` })),
      ...evaluations.map(e => ({ type: 'evaluation', id: e.id, title: e.title, link: `/evaluate/${e.id}` })),
      ...assessments.map(a => ({ type: 'governance', id: a.id, title: a.assessmentType, link: `/governance/${a.id}` })),
      ...fills.map(f => ({ type: 'template', id: f.id, title: f.title, link: `/templates/${f.template.slug}/${f.id}` })),
    ];

    return NextResponse.json(results);
  } catch (err) {
    logError('GET /api/search', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
