import Link from 'next/link';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BarChart3, Plus, ArrowRight, Layers, Cpu, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const typeBadge = (t: string) => {
  const map: Record<string, { variant: 'accent' | 'success' | 'purple' | 'amber'; label: string }> = {
    framework: { variant: 'accent', label: 'Framework' },
    architecture: { variant: 'success', label: 'Architecture' },
    model_tier: { variant: 'purple', label: 'Preset' },
    custom: { variant: 'amber', label: 'Custom' },
  };
  return map[t] || { variant: 'accent' as const, label: t };
};

export default async function EvaluatePage() {
  const evaluations = await prisma.evaluation.findMany({
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const total = evaluations.length;
  const byType = evaluations.reduce((acc, e) => {
    acc[e.evalType] = (acc[e.evalType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Evaluation Matrix</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">Weighted scoring for framework, architecture, and custom decisions.</p>
        </div>
        <Link
          href="/evaluate/new"
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> New Evaluation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">{total}</div>
            <div className="text-xs text-[var(--text-3)]">Total Evaluations</div>
          </div>
        </Card>
        {(['framework', 'architecture', 'custom'] as const).map(t => {
          const tb = typeBadge(t);
          return (
            <Card key={t} className="flex items-center gap-3">
              <Badge variant={tb.variant}>{tb.label}</Badge>
              <span className="text-lg font-bold text-[var(--text)]">{byType[t] || 0}</span>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/evaluate/new?type=framework" className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-active)] hover:border-[var(--accent)] transition-all">
          <Layers size={18} className="text-[var(--accent)]" />
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">Compare Frameworks</div>
            <div className="text-xs text-[var(--text-4)]">LangGraph vs CrewAI vs Claude SDK...</div>
          </div>
        </Link>
        <Link href="/evaluate/new?type=architecture" className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-active)] hover:border-[var(--accent)] transition-all">
          <Cpu size={18} className="text-[var(--success)]" />
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">Architecture Selection</div>
            <div className="text-xs text-[var(--text-4)]">Single Agent vs Pipeline vs Supervisor...</div>
          </div>
        </Link>
        <Link href="/evaluate/new?type=model_tier" className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-active)] hover:border-[var(--accent)] transition-all">
          <Sparkles size={18} style={{ color: '#a78bfa' }} />
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">Use Preset</div>
            <div className="text-xs text-[var(--text-4)]">Customer Support, Code Gen, Research...</div>
          </div>
        </Link>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">All Evaluations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-hover)] text-[var(--text-3)] font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-[var(--border)]">Title</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Type</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Recommendation</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Project</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Date</th>
                <th className="px-6 py-3 border-b border-[var(--border)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {evaluations.map(e => {
                const tb = typeBadge(e.evalType);
                return (
                  <tr key={e.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--text)]">{e.title}</td>
                    <td className="px-6 py-4"><Badge variant={tb.variant}>{tb.label}</Badge></td>
                    <td className="px-6 py-4 text-[var(--text-2)]">{e.recommendation || '—'}</td>
                    <td className="px-6 py-4 text-[var(--text-3)]">{e.project?.name || '—'}</td>
                    <td className="px-6 py-4 text-[var(--text-3)]">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Link href={`/evaluate/${e.id}`} className="text-[var(--accent)] hover:underline flex items-center gap-1 text-[13px] font-medium">
                        View <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-3)]">
                    <BarChart3 size={32} className="mx-auto mb-3 text-[var(--text-4)]" />
                    <p className="font-medium">No evaluations yet</p>
                    <p className="text-[13px] text-[var(--text-4)] mt-1">Create your first evaluation to compare frameworks, architectures, or custom options.</p>
                    <Link href="/evaluate/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-[var(--radius-sm)] hover:opacity-90">
                      <Plus size={14} /> New Evaluation
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
