import DomainBrowser from '@/components/advisor/DomainBrowser';

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return (
    <div>
      <div className="eyebrow mb-4">Knowledge Base</div>
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
        Explore <span className="font-light italic" style={{ color: 'var(--brand-primary)' }}>Domains</span>
      </h1>
      <p className="text-[15px] max-w-[640px] mb-8" style={{ color: 'var(--text-tertiary)' }}>
        Browse all knowledge base domains and their concepts. Click a domain to see its concepts, definitions, and code scaffolds.
      </p>
      <DomainBrowser />
    </div>
  );
}
