import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const revalidate = 60; // cache for 60 seconds

export default async function HomePage() {
  // Redirect to setup if no users exist (first-time deployment)
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    redirect('/setup');
  }

  const [
    activeCount, , conceptCount, ,
    evalCount, assessmentCount, caioCount, fillCount, openRisks,
    recentProjects, recentEvals, recentFills,
  ] = await Promise.all([
    prisma.project.count({ where: { status: 'active' } }),
    prisma.project.count(),
    prisma.kbConcept.count(),
    prisma.kbQuery.count(),
    prisma.evaluation.count(),
    prisma.governanceAssessment.count(),
    prisma.caioAssessment.count(),
    prisma.templateFill.count(),
    prisma.riskItem.count({ where: { status: 'open' } }),
    prisma.project.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { currentPhase: { select: { name: true } } },
    }),
    prisma.evaluation.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, recommendation: true, createdAt: true },
    }),
    prisma.templateFill.findMany({
      take: 3,
      orderBy: { updatedAt: 'desc' },
      include: { template: { select: { slug: true, name: true } } },
    }),
  ]);

  return (
    <DashboardClient
      stats={{
        activeCount,
        conceptCount,
        evalCount,
        assessmentCount,
        caioCount,
        fillCount,
        openRisks,
      }}
      recentProjects={recentProjects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        framework: p.framework,
        phaseName: p.currentPhase?.name || 'Initialization',
      }))}
      recentEvals={recentEvals.map(e => ({
        id: e.id,
        title: e.title,
        recommendation: e.recommendation,
        createdAt: e.createdAt.toISOString(),
      }))}
      recentFills={recentFills.map(f => ({
        id: f.id,
        title: f.title,
        templateSlug: f.template.slug,
        templateName: f.template.name,
      }))}
    />
  );
}
