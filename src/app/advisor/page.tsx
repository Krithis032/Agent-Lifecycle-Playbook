import ChatInterface from '@/components/advisor/ChatInterface';

export const dynamic = 'force-dynamic';

export default function AdvisorPage() {
  return (
    <div className="animate-fade-in">
      <div className="eyebrow mb-4">Knowledge Base</div>
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
        KB <span className="font-light italic" style={{ color: 'var(--brand-primary)' }}>Advisor</span>
      </h1>
      <p className="text-[15px] max-w-[640px] mb-4" style={{ color: 'var(--text-tertiary)' }}>
        Search across <strong>1,468 concepts</strong> from five knowledge base tiers — Core Agentic AI, RAG &amp; MCP, Enterprise Patterns, Agents &amp; Tools, and Strategy &amp; Governance — or ask the AI advisor for grounded answers with source citations.
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { label: 'Core KB', count: '1,022', color: '#0052cc' },
          { label: 'RAG & MCP', count: '76', color: '#6b3fa0' },
          { label: 'Enterprise', count: '85', color: '#0e7490' },
          { label: 'Agents & Tools', count: '111', color: '#0077b5' },
          { label: 'Strategy', count: '174', color: '#15803d' },
        ].map((tier) => (
          <span
            key={tier.label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: tier.color }}
          >
            {tier.label} <span className="opacity-80">·</span> {tier.count}
          </span>
        ))}
      </div>
      <ChatInterface />
    </div>
  );
}
