import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import SectionPanel from '@/components/ui/SectionPanel';
import {
  FolderKanban, BookOpen, Plus, ArrowRight, Activity,
  Shield, BarChart3, FileText, Award, AlertTriangle, Sparkles, BookMarked
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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

  const quickActions = [
    { label: 'New Agent Project', href: '/projects/new', icon: Plus, desc: 'Start a new deployment' },
    { label: 'Run Evaluation', href: '/evaluate/new', icon: BarChart3, desc: 'Compare frameworks' },
    { label: 'Governance Assessment', href: '/governance/assess', icon: Shield, desc: 'TRiSM review' },
    { label: 'Fill Template', href: '/templates', icon: FileText, desc: 'Generate documents' },
    { label: 'CAIO Assessment', href: '/caio/assess', icon: Award, desc: 'AI maturity' },
    { label: 'Query Advisor', href: '/advisor', icon: Sparkles, desc: 'Ask the KB' },
    { label: 'User Guide', href: '/user-guide', icon: BookMarked, desc: 'Portal reference' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        eyebrow="COMMAND CENTRE"
        title="Agent Deployment Playbook"
        subtitle={`${activeCount} active projects \u00b7 ${evalCount} evaluations \u00b7 ${assessmentCount} governance assessments \u00b7 ${conceptCount} KB concepts`}
        action={
          <Link
            href="/projects/new"
            className="adp-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-[var(--radius-md)] transition-all duration-200"
          >
            <Plus size={15} /> New Deployment
          </Link>
        }
      />

      {/* StatCard Grid — animated stagger entrance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-grid">
        <StatCard icon={FolderKanban} value={activeCount} label="Active Projects" color="var(--module-projects)" href="/projects" />
        <StatCard icon={BarChart3} value={evalCount} label="Evaluations" color="var(--module-evaluate)" href="/evaluate" />
        <StatCard icon={Shield} value={assessmentCount} label="Governance" color="var(--module-governance)" href="/governance" />
        <StatCard icon={Award} value={caioCount} label="CAIO Assessments" color="var(--module-caio)" href="/caio" />
        <StatCard icon={FileText} value={fillCount} label="Documents" color="var(--module-templates)" href="/templates" />
        <StatCard icon={BookOpen} value={conceptCount} label="KB Concepts" color="var(--module-advisor)" href="/advisor" />
        <StatCard icon={AlertTriangle} value={openRisks} label="Open Risks" color="var(--status-error)" href="/governance" />
      </div>

      {/* Quick Actions — horizontal grid to eliminate dead space */}
      <SectionPanel title="Quick Actions" icon={Sparkles}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 p-2">
          {quickActions.map(a => {
            const QIcon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all hover:bg-[var(--surface-0)] group"
              >
                <QIcon size={16} className="shrink-0 transition-colors text-[var(--text-tertiary)] group-hover:text-[var(--brand-primary)]" />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium transition-colors text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">{a.label}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] truncate">{a.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionPanel>

      {/* Recent Projects — full width */}
      <SectionPanel
        title="Recent Projects"
        icon={Activity}
        action={
          <Link href="/projects" className="text-[12px] font-medium flex items-center gap-1 transition-colors text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
            View All <ArrowRight size={12} />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--surface-0)]">
                <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--text-tertiary)] border-b border-[var(--border-default)]">Agent Name</th>
                <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--text-tertiary)] border-b border-[var(--border-default)]">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--text-tertiary)] border-b border-[var(--border-default)]">Phase</th>
                <th className="px-6 py-3 text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--text-tertiary)] border-b border-[var(--border-default)] text-right">Framework</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(p => (
                <tr key={p.id} className="border-b border-[var(--border-default)] hover:bg-[var(--surface-0)] transition-colors">
                  <td className="px-6 py-3.5 font-medium text-[var(--text-secondary)]">
                    <Link href={`/projects/${p.id}`} className="hover:text-[var(--brand-primary)] transition-colors">{p.name}</Link>
                  </td>
                  <td className="px-6 py-3.5"><Badge variant={p.status === 'active' ? 'brand' : 'default'}>{p.status}</Badge></td>
                  <td className="px-6 py-3.5 text-[var(--text-tertiary)]">{p.currentPhase?.name || 'Initialization'}</td>
                  <td className="px-6 py-3.5 text-right"><Badge variant="info">{p.framework || 'N/A'}</Badge></td>
                </tr>
              ))}
              {recentProjects.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-[13px] text-[var(--text-tertiary)]">No projects yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionPanel>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Evaluations */}
        <SectionPanel
          title="Recent Evaluations"
          icon={BarChart3}
          action={
            <Link href="/evaluate" className="text-[12px] font-medium transition-colors text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
              View All
            </Link>
          }
        >
          <div className="divide-y divide-[var(--border-default)]">
            {recentEvals.map(e => (
              <Link
                key={e.id}
                href={`/evaluate/${e.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[var(--surface-0)]"
              >
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-secondary)]">{e.title}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{e.recommendation || 'Pending'}</div>
                </div>
                <ArrowRight size={12} className="text-[var(--text-tertiary)]" />
              </Link>
            ))}
            {recentEvals.length === 0 && (
              <div className="px-6 py-6 text-center text-[13px] text-[var(--text-tertiary)]">No evaluations yet</div>
            )}
          </div>
        </SectionPanel>

        {/* Recent Documents */}
        <SectionPanel
          title="Recent Documents"
          icon={FileText}
          action={
            <Link href="/templates" className="text-[12px] font-medium transition-colors text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
              View All
            </Link>
          }
        >
          <div className="divide-y divide-[var(--border-default)]">
            {recentFills.map(f => (
              <Link
                key={f.id}
                href={`/templates/${f.template.slug}/${f.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[var(--surface-0)]"
              >
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-secondary)]">{f.title}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{f.template.name}</div>
                </div>
                <ArrowRight size={12} className="text-[var(--text-tertiary)]" />
              </Link>
            ))}
            {recentFills.length === 0 && (
              <div className="px-6 py-6 text-center text-[13px] text-[var(--text-tertiary)]">No documents yet</div>
            )}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
