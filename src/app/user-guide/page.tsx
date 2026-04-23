import Link from 'next/link';
import { FileText, Presentation, BookMarked, ArrowDownToLine, ExternalLink, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

const GUIDE_SECTIONS = [
  'Getting Started & Portal Overview',
  'Module Walkthroughs (All 9 Modules)',
  'Phase Guides: Strategize / Build / Govern',
  'Role-Based Access Control Reference',
  'Admin Setup Guide',
  'Common Workflows',
  'Troubleshooting & FAQ',
];

const GUIDE_FORMATS = [
  {
    id: 'pdf',
    title: 'PDF Guide',
    description:
      'Complete 10+ page reference document with table of contents, detailed module walkthroughs, RBAC permission tables, admin setup instructions, and troubleshooting FAQs.',
    icon: FileText,
    href: '/api/user-guide/pdf',
    format: 'PDF',
    size: '~180 KB',
    action: 'Open in Browser',
    actionIcon: ExternalLink,
    color: '#b45309',
    bg: '#fef3c7',
  },
  {
    id: 'pptx',
    title: 'Presentation Deck',
    description:
      '13-slide dark navy deck covering portal overview, three phase sections (Strategize / Build / Govern), admin setup, key workflows, and troubleshooting. Ideal for team onboarding and stakeholder presentations.',
    icon: Presentation,
    href: '/api/user-guide/pptx',
    format: 'PPTX',
    size: '225 KB',
    action: 'Download Deck',
    actionIcon: ArrowDownToLine,
    color: '#6b3fa0',
    bg: '#f3e8ff',
  },
];

export default function UserGuidePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="eyebrow mb-2">Documentation</div>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#e0f2fe', color: '#0e7490' }}
          >
            <BookMarked size={22} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            User Guide
          </h1>
        </div>
        <p className="text-[15px] text-[var(--text-3)] max-w-[640px]">
          Comprehensive guides for the Agent Deployment Playbook portal — covering all 9 modules,
          role-based access, admin configuration, and common workflows.
        </p>
      </div>

      {/* Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GUIDE_FORMATS.map((guide) => {
          const Icon = guide.icon;
          const ActionIcon = guide.actionIcon;
          return (
            <Card key={guide.id} className="flex flex-col gap-4 hover:border-[var(--accent)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: guide.bg, color: guide.color }}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded"
                  style={{ color: guide.color, backgroundColor: guide.bg }}
                >
                  {guide.format} · {guide.size}
                </span>
              </div>

              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text)] mb-1.5">
                  {guide.title}
                </h2>
                <p className="text-[13px] text-[var(--text-3)] leading-relaxed">
                  {guide.description}
                </p>
              </div>

              <Link
                href={guide.href}
                target={guide.id === 'pdf' ? '_blank' : undefined}
                className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: guide.color }}
              >
                <ActionIcon size={15} />
                {guide.action}
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Contents Summary */}
      <Card>
        <h2 className="text-[15px] font-semibold text-[var(--text)] mb-4">
          What&apos;s Covered
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GUIDE_SECTIONS.map((section) => (
            <div key={section} className="flex items-start gap-2.5">
              <CheckCircle
                size={15}
                className="text-[var(--success)] shrink-0 mt-0.5"
              />
              <span className="text-[13px] text-[var(--text-2)]">{section}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* KB Tier Reference */}
      <Card>
        <h2 className="text-[15px] font-semibold text-[var(--text)] mb-4">
          Knowledge Base Coverage (as of April 2026)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--text-3)] text-xs font-medium border-b border-[var(--border)]">
              <tr>
                <th className="pb-2 pr-6">Knowledge Base Tier</th>
                <th className="pb-2 pr-6">Concepts</th>
                <th className="pb-2 pr-6">Files</th>
                <th className="pb-2">Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                { tier: 'Core Agentic AI KB', concepts: '1,022', files: '10 YAML', sources: '8 domains, 109 topic nodes', color: '#0052cc' },
                { tier: 'RAG & MCP Deep KB', concepts: '76', files: '1 YAML', sources: 'Code scaffolds + deep concepts', color: '#6b3fa0' },
                { tier: 'IBM Courses KB', concepts: '85', files: '1 YAML', sources: '6 IBM courses', color: '#0e7490' },
                { tier: 'LinkedIn Learning KB', concepts: '111', files: '3 YAML + index', sources: '16 curated sources (LL01–LL16)', color: '#0077b5' },
                { tier: 'Strategy & Governance KB', concepts: '174', files: '3 YAML', sources: 'Cross-source synthesis', color: '#15803d' },
              ].map((row) => (
                <tr key={row.tier} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-medium text-[var(--text)]">{row.tier}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-6 font-bold text-[var(--text)]">{row.concepts}</td>
                  <td className="py-3 pr-6 text-[var(--text-3)]">{row.files}</td>
                  <td className="py-3 text-[var(--text-3)]">{row.sources}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[var(--border)] font-bold">
                <td className="py-3 pr-6 text-[var(--text)]">Total</td>
                <td className="py-3 pr-6 text-[var(--accent)]">1,468</td>
                <td className="py-3 pr-6 text-[var(--text-3)]">20 YAML</td>
                <td className="py-3 text-[var(--text-3)]">34+ sources</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
