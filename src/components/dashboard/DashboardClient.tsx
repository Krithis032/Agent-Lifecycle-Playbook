'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import SectionPanel from '@/components/ui/SectionPanel';
import {
  FolderKanban, BookOpen, Plus, ArrowRight, Activity,
  Shield, BarChart3, FileText, Award, AlertTriangle, Sparkles, BookMarked
} from 'lucide-react';

interface DashboardStats {
  activeCount: number;
  conceptCount: number;
  evalCount: number;
  assessmentCount: number;
  caioCount: number;
  fillCount: number;
  openRisks: number;
}

interface RecentProject {
  id: number;
  name: string;
  status: string;
  framework: string | null;
  phaseName: string;
}

interface RecentEval {
  id: number;
  title: string;
  recommendation: string | null;
  createdAt: string;
}

interface RecentFill {
  id: number;
  title: string;
  templateSlug: string;
  templateName: string;
}

const quickActions = [
  { label: 'New Agent Project', href: '/projects/new', icon: Plus, desc: 'Start a new deployment' },
  { label: 'Run Evaluation', href: '/evaluate/new', icon: BarChart3, desc: 'Compare frameworks' },
  { label: 'Governance Assessment', href: '/governance/assess', icon: Shield, desc: 'TRiSM review' },
  { label: 'Fill Template', href: '/templates', icon: FileText, desc: 'Generate documents' },
  { label: 'CAIO Assessment', href: '/caio/assess', icon: Award, desc: 'AI maturity' },
  { label: 'Query Advisor', href: '/advisor', icon: Sparkles, desc: 'Ask the KB' },
  { label: 'User Guide', href: '/user-guide', icon: BookMarked, desc: 'Portal reference' },
];

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    activeCount: 0, conceptCount: 0, evalCount: 0,
    assessmentCount: 0, caioCount: 0, fillCount: 0, openRisks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentEvals, setRecentEvals] = useState<RecentEval[]>([]);
  const [recentFills, setRecentFills] = useState<RecentFill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const opts = { signal: controller.signal };

    Promise.all([
      fetch('/api/dashboard/stats', opts).then(r => r.ok ? r.json() : null),
      fetch('/api/projects', opts).then(r => r.ok ? r.json() : []),
      fetch('/api/evaluate', opts).then(r => r.ok ? r.json() : []),
      fetch('/api/templates/fills', opts).then(r => r.ok ? r.json() : []),
      fetch('/api/kb/domains', opts).then(r => r.ok ? r.json() : []),
    ])
      .then(([dashStats, projects, evals, fills, domains]) => {
        if (controller.signal.aborted) return;

        // Build stats from dashboard/stats API + project count
        const projectArr = Array.isArray(projects) ? projects : [];
        const evalArr = Array.isArray(evals) ? evals : [];
        const fillArr = Array.isArray(fills) ? fills : [];

        // Count concepts from domains response
        let conceptCount = 0;
        if (Array.isArray(domains)) {
          domains.forEach((d: { conceptCount?: number }) => {
            conceptCount += d.conceptCount || 0;
          });
        }

        setStats({
          activeCount: projectArr.filter((p: { status: string }) => p.status === 'active').length,
          conceptCount,
          evalCount: dashStats?.evaluations ?? evalArr.length,
          assessmentCount: dashStats?.assessments ?? 0,
          caioCount: dashStats?.caioAssessments ?? 0,
          fillCount: dashStats?.templateFills ?? fillArr.length,
          openRisks: dashStats?.openRisks ?? 0,
        });

        setRecentProjects(
          projectArr.slice(0, 5).map((p: { id: number; name: string; status: string; framework: string | null; currentPhase?: { name: string } | null }) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            framework: p.framework,
            phaseName: p.currentPhase?.name || 'Initialization',
          }))
        );

        setRecentEvals(
          evalArr.slice(0, 3).map((e: { id: number; title: string; recommendation: string | null; createdAt: string }) => ({
            id: e.id,
            title: e.title,
            recommendation: e.recommendation,
            createdAt: e.createdAt,
          }))
        );

        setRecentFills(
          fillArr.slice(0, 3).map((f: { id: number; title: string; template: { slug: string; name: string } }) => ({
            id: f.id,
            title: f.title,
            templateSlug: f.template.slug,
            templateName: f.template.name,
          }))
        );

        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-10 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="h-5 bg-[var(--surface-1)] rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-[var(--surface-1)] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-[var(--surface-1)] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="COMMAND CENTRE"
        title="Agent Deployment Playbook"
        subtitle={`${stats.activeCount} active projects \u00b7 ${stats.evalCount} evaluations \u00b7 ${stats.assessmentCount} governance assessments \u00b7 ${stats.conceptCount} KB concepts`}
        action={
          <Link
            href="/projects/new"
            className="adp-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-[var(--radius-md)] transition-all duration-200"
          >
            <Plus size={15} /> New Deployment
          </Link>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-grid">
        <StatCard icon={FolderKanban} value={stats.activeCount} label="Active Projects" color="var(--module-projects)" href="/projects" />
        <StatCard icon={BarChart3} value={stats.evalCount} label="Evaluations" color="var(--module-evaluate)" href="/evaluate" />
        <StatCard icon={Shield} value={stats.assessmentCount} label="Governance" color="var(--module-governance)" href="/governance" />
        <StatCard icon={Award} value={stats.caioCount} label="CAIO Assessments" color="var(--module-caio)" href="/caio" />
        <StatCard icon={FileText} value={stats.fillCount} label="Documents" color="var(--module-templates)" href="/templates" />
        <StatCard icon={BookOpen} value={stats.conceptCount} label="KB Concepts" color="var(--module-advisor)" href="/advisor" />
        <StatCard icon={AlertTriangle} value={stats.openRisks} label="Open Risks" color="var(--status-error)" href="/governance" />
      </div>

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
                  <td className="px-6 py-3.5 text-[var(--text-tertiary)]">{p.phaseName}</td>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                href={`/templates/${f.templateSlug}/${f.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[var(--surface-0)]"
              >
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-secondary)]">{f.title}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{f.templateName}</div>
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
