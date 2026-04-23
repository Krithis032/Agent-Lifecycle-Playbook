import Link from 'next/link';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  FolderKanban, BookOpen, Plus, ArrowRight, Activity,
  Shield, BarChart3, FileText, Award, AlertTriangle, Sparkles, BookMarked
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
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
    { label: 'Active Projects', value: activeCount, icon: FolderKanban, color: 'var(--accent)', bg: 'var(--accent-soft)', href: '/projects' },
    { label: 'Evaluations', value: evalCount, icon: BarChart3, color: '#6b3fa0', bg: '#f3e8ff', href: '/evaluate' },
    { label: 'Governance', value: assessmentCount, icon: Shield, color: 'var(--success)', bg: 'var(--success-soft)', href: '/governance' },
    { label: 'CAIO Assessments', value: caioCount, icon: Award, color: '#b45309', bg: '#fef3c7', href: '/caio' },
    { label: 'Documents', value: fillCount, icon: FileText, color: '#0e7490', bg: '#e0f2fe', href: '/templates' },
    { label: 'KB Concepts', value: conceptCount, icon: BookOpen, color: '#64748b', bg: '#f1f5f9', href: '/advisor' },
    { label: 'Open Risks', value: openRisks, icon: AlertTriangle, color: 'var(--error)', bg: 'var(--error-soft)', href: '/governance' },
  ];

  const quickActions = [
    { label: 'New Agent Project', href: '/projects/new', icon: Plus, desc: 'Start a new deployment' },
    { label: 'Run Evaluation', href: '/evaluate/new', icon: BarChart3, desc: 'Compare frameworks or architectures' },
    { label: 'Governance Assessment', href: '/governance/assess', icon: Shield, desc: 'TRiSM trust & risk review' },
    { label: 'Fill Template', href: '/templates', icon: FileText, desc: 'Generate project documents' },
    { label: 'CAIO Assessment', href: '/caio/assess', icon: Award, desc: 'AI maturity evaluation' },
    { label: 'Query Advisor', href: '/advisor', icon: Sparkles, desc: 'Ask the knowledge base' },
    { label: 'User Guide', href: '/user-guide', icon: BookMarked, desc: 'PDF & PPTX portal guides' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Command Center</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">Agent Deployment Playbook — 1,468 concepts across 5 KB tiers, 9 modules, real-time overview.</p>
        </div>
        <Link href="/projects/new" className="bg-[var(--accent)] text-white px-4 py-2 rounded-[6px] text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> New Deployment
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Link key={m.label} href={m.href} className="group">
              <Card className="flex flex-col items-center gap-2 text-center py-4 group-hover:border-[var(--accent)] transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: m.bg, color: m.color }}>
                  <Icon size={18} />
                </div>
                <div className="text-2xl font-bold text-[var(--text)] leading-none">{m.value}</div>
                <div className="text-[11px] text-[var(--text-3)] font-medium">{m.label}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
              <h2 className="text-[15px] font-semibold text-[var(--text)] flex items-center gap-2">
                <Activity size={16} className="text-[var(--text-3)]" /> Recent Projects
              </h2>
              <Link href="/projects" className="text-[13px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--surface-hover)] text-[var(--text-3)] font-medium">
                  <tr>
                    <th className="px-6 py-3 border-b border-[var(--border)]">Agent Name</th>
                    <th className="px-6 py-3 border-b border-[var(--border)]">Status</th>
                    <th className="px-6 py-3 border-b border-[var(--border)]">Phase</th>
                    <th className="px-6 py-3 border-b border-[var(--border)] text-right">Framework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentProjects.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--surface)] transition-colors group">
                      <td className="px-6 py-4 font-medium text-[var(--text)]">
                        <Link href={`/projects/${p.id}`} className="group-hover:text-[var(--accent)] transition-colors">{p.name}</Link>
                      </td>
                      <td className="px-6 py-4"><Badge variant={p.status === 'active' ? 'accent' : 'default'}>{p.status}</Badge></td>
                      <td className="px-6 py-4 text-[var(--text-2)]">{p.currentPhase?.name || 'Initialization'}</td>
                      <td className="px-6 py-4 text-right"><Badge variant="purple">{p.framework || 'N/A'}</Badge></td>
                    </tr>
                  ))}
                  {recentProjects.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--text-3)]">No projects yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <h2 className="text-[15px] font-semibold text-[var(--text)]">Quick Actions</h2>
            </div>
            <div className="p-2 flex flex-col gap-0.5">
              {quickActions.map(a => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} href={a.href} className="flex items-center gap-3 px-4 py-3 rounded-[6px] hover:bg-[var(--surface-hover)] transition-colors group">
                    <Icon size={16} className="text-[var(--accent)] shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-[var(--text-2)] group-hover:text-[var(--text)]">{a.label}</div>
                      <div className="text-[11px] text-[var(--text-4)]">{a.desc}</div>
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
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
            <h2 className="text-[15px] font-semibold text-[var(--text)] flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-500" /> Recent Evaluations
            </h2>
            <Link href="/evaluate" className="text-[13px] font-medium text-[var(--accent)] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentEvals.map(e => (
              <Link key={e.id} href={`/evaluate/${e.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-[var(--surface)] transition-colors">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{e.title}</div>
                  <div className="text-xs text-[var(--text-4)]">{e.recommendation || 'Pending'}</div>
                </div>
                <ArrowRight size={14} className="text-[var(--text-4)]" />
              </Link>
            ))}
            {recentEvals.length === 0 && (
              <div className="px-6 py-6 text-center text-sm text-[var(--text-4)]">No evaluations yet</div>
            )}
          </div>
        </Card>

        {/* Recent Documents */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
            <h2 className="text-[15px] font-semibold text-[var(--text)] flex items-center gap-2">
              <FileText size={16} className="text-cyan-600" /> Recent Documents
            </h2>
            <Link href="/templates" className="text-[13px] font-medium text-[var(--accent)] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentFills.map(f => (
              <Link key={f.id} href={`/templates/${f.template.slug}/${f.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-[var(--surface)] transition-colors">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{f.title}</div>
                  <div className="text-xs text-[var(--text-4)]">{f.template.name}</div>
                </div>
                <ArrowRight size={14} className="text-[var(--text-4)]" />
              </Link>
            ))}
            {recentFills.length === 0 && (
              <div className="px-6 py-6 text-center text-sm text-[var(--text-4)]">No documents yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
