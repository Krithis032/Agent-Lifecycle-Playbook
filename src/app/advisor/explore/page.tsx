import DomainBrowser from '@/components/advisor/DomainBrowser';

export default function ExplorePage() {
  return (
    <div>
      <div className="eyebrow mb-4">Knowledge Base</div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text)]">
        Explore <span className="text-[var(--accent)] font-light italic">Domains</span>
      </h1>
      <p className="text-[15px] text-[var(--text-3)] max-w-[640px] mb-8">
        Browse all knowledge base domains and their concepts. Click a domain to see its concepts, definitions, and code scaffolds.
      </p>
      <DomainBrowser />
    </div>
  );
}
