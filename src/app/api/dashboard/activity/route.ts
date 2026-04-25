import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/logger';


interface ActivityItem {
  type: string;
  title: string;
  date: string;
  link: string;
}

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const [recentEvals, recentAssessments, recentFills] = await Promise.all([
      prisma.evaluation.findMany({
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.governanceAssessment.findMany({
        select: { id: true, assessmentType: true, assessedAt: true, project: { select: { name: true } } },
        orderBy: { assessedAt: 'desc' },
        take: 5,
      }),
      prisma.templateFill.findMany({
        select: { id: true, title: true, updatedAt: true, template: { select: { slug: true, name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    const activities: ActivityItem[] = [
      ...recentEvals.map(e => ({
        type: 'evaluation',
        title: e.title,
        date: e.createdAt.toISOString(),
        link: `/evaluate/${e.id}`,
      })),
      ...recentAssessments.map(a => ({
        type: 'governance',
        title: `${a.assessmentType} — ${a.project?.name || 'Unknown'}`,
        date: a.assessedAt.toISOString(),
        link: `/governance/${a.id}`,
      })),
      ...recentFills.map(f => ({
        type: 'template',
        title: `${f.template.name}: ${f.title}`,
        date: f.updatedAt.toISOString(),
        link: `/templates/${f.template.slug}/${f.id}`,
      })),
    ];

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(activities.slice(0, 10));
  } catch (err) {
    logError('GET /api/dashboard/activity', err);
    return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 });
  }
}
