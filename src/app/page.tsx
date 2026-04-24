import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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

  const metrics = [
    { label: 'Active Projects', value: activeCount, icon: FolderKanban, color: 'var(--accent)', bg: 'var(--accent-soft)', href: '/projects', tip: 'Agent projects currently in progress. Click to view all projects.' },
    { label: 'Evaluations', value: evalCount, icon: BarChart3, color: '#7c3aed', bg: 'rgba(139,92,246,0.1)', href: '/evaluate', tip: 'Weighted decision-matrix evaluations for comparing frameworks, architectures, or agent performance.' },
    { label: 'Governance', value: assessmentCount, icon: Shield, color: 'var(--success)', bg: 'var(--success-soft)', href: '/governance', tip: 'TRiSM governance assessments measuring trust across 7 layers, 10 Wharton domains, and compliance frameworks.' },
    { label: 'CAIO Assessments', value: caioCount, icon: Award, color: '#b8860b', bg: 'rgba(212,168,83,0.1)', href: '/caio', tip: 'AI maturity assessments across 12 domains using the CAIO framework (5 maturity levels).' },
    { label: 'Documents', value: fillCount, icon: FileText, color: '#0891b2', bg: 'rgba(34,211,238,0.08)', href: '/templates', tip: 'Filled lifecycle phase documents (charters, ADRs, runbooks, checklists, etc.).' },
    { label: 'KB Concepts', value: conceptCount, icon: BookOpen, color: 'var(--text-3)', bg: 'var(--surface-hover)', href: '/advisor', tip: 'Knowledge base concepts across 5 tiers: Core, RAG/MCP, IBM, LinkedIn, and Strategy.' },
    { label: 'Open Risks', value: openRisks, icon: AlertTriangle, color: 'var(--error)', bg: 'var(--error-soft)', href: '/governance', tip: 'Risk items flagged during governance assessments that remain open and unmitigated.' },
  ];

  const quickActions = [
    { label: 'New Agent Project', href: '/projects/new', icon: Plus, desc: 'Start a new deployment' },
    { label: 'Run Evaluation', href: '/evaluate/new', icon: BarChart3, desc: 'Compare frameworks or architectures' },
    { label: 'Governance Assessment', href: '/governance/assess', icon: Shield, desc: 'TRiSM trust & risk review' },
    { label: 'Fill Template', href: '/templates', icon: FileText, desc: 'Generate project documents' },
    { label: 'CAIO Assessment', href: '/caio/assess', icon: Award, desc: 'AI maturity evaluation' },
    { label: 'Query Advisor', href: '/advisor', icon: Sparkles, desc: 'Ask the knowledge base' },
    { label: 'User Guide', href: '/user-guide', icon: BookMarked, desc: 'Comprehensive portal reference' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Mission Control</p>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Command Center</h1>
          <p className="text-[13px] text-[var(--text-3)] mt-1">1,468 concepts across 5 KB tiers, 9 modules, real-time overview.</p>
        </div>
        <Link href="/projects/new" className="bg-[var(--accent)] text-white px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2 shadow-[0_1px_8px_rgba(196,154,60,0.2)]">
          <Plus size={15} /> New Deployment
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 stagger-children">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Link key={m.label} href={m.href} className="group" title={m.tip}>
              <Card className="flex flex-col items-center gap-2.5 text-center py-5 group-hover:border-[var(--border-hover)] group-hover:shadow-[var(--shadow-card)] transition-all">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: m.bg, color: m.color }}>
                  <Icon size={16} />
                </div>
                <div className="text-xl font-bold text-[var(--text)] leading-none">{m.value}</div>
                <div className="text-[10px] text-[var(--text-4)] font-medium tracking-wide uppercase">{m.label}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="divider-glow" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2">
                <Activity size={14} className="text-[var(--text-4)]" /> Recent Projects
              </h2>
              <Link href="/projects" className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="px-5 py-3 text-[9px] font-bold tracking-[1.5px] uppercase text-[var(--text-4)] border-b border-[var(--border)]">Agent Name</th>
                    <th className="px-5 py-3 text-[9px] font-bold tracking-[1.5px] uppercase text-[var(--text-4)] border-b border-[var(--border)]">Status</th>
                    <th className="px-5 py-3 text-[9px] font-bold tracking-[1.5px] uppercase text-[var(--text-4)] border-b border-[var(--border)]">Phase</th>
                    <th className="px-5 py-3 text-[9px] font-bold tracking-[1.5px] uppercase text-[var(--text-4)] border-b border-[var(--border)] text-right">Framework</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map(p => (
                    <tr key={p.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors group">
                      <td className="px-5 py-3.5 font-medium text-[var(--text-2)]">
                        <Link href={`/projects/${p.id}`} className="group-hover:text-[var(--accent)] transition-colors">{p.name}</Link>
                      </td>
                      <td className="px-5 py-3.5"><Badge variant={p.status === 'active' ? 'accent' : 'default'}>{p.status}</Badge></td>
                      <td className="px-5 py-3.5 text-[var(--text-3)]">{p.currentPhase?.name || 'Initialization'}</td>
                      <td className="px-5 py-3.5 text-right"><Badge variant="purple">{p.framework || 'N/A'}</Badge></td>
                    </tr>
                  ))}
                  {recentProjects.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-[var(--text-4)] text-[13px]">No projects yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-[13px] font-semibold text-[var(--text)]">Quick Actions</h2>
            </div>
            <div className="p-2 flex flex-col gap-0.5">
              {quickActions.map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] transition-all group">
                    <Icon size={14} className="text-[var(--accent-muted)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                    <div>
                      <div className="text-[13px] font-medium text-[var(--text-3)] group-hover:text-[var(--text-2)] transition-colors">{a.label}</div>
                      <div className="text-[10px] text-[var(--text-4)]">{a.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Evaluations */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2">
              <BarChart3 size={14} className="text-[#7c3aed]" /> Recent Evaluations
            </h2>
            <Link href="/evaluate" className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {recentEvals.map(e => (
              <Link key={e.id} href={`/evaluate/${e.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-2)]">{e.title}</div>
                  <div className="text-[11px] text-[var(--text-4)]">{e.recommendation || 'Pending'}</div>
                </div>
                <ArrowRight size={12} className="text-[var(--text-4)]" />
              </Link>
            ))}
            {recentEvals.length === 0 && (
              <div className="px-5 py-6 text-center text-[13px] text-[var(--text-4)]">No evaluations yet</div>
            )}
          </div>
        </Card>

        {/* Recent Documents */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2">
              <FileText size={14} className="text-[#0891b2]" /> Recent Documents
            </h2>
            <Link href="/templates" className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {recentFills.map(f => (
              <Link key={f.id} href={`/templates/${f.template.slug}/${f.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-2)]">{f.title}</div>
                  <div className="text-[11px] text-[var(--text-4)]">{f.template.name}</div>
                </div>
                <ArrowRight size={12} className="text-[var(--text-4)]" />
              </Link>
            ))}
            {recentFills.length === 0 && (
              <div className="px-5 py-6 text-center text-[13px] text-[var(--text-4)]">No documents yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
