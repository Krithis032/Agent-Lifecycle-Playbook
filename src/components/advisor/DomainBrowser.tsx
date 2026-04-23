'use client';

import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Accordion from '@/components/ui/Accordion';

interface Domain {
  id: number;
  domainName: string;
  domainKey: string;
  kbSource: string;
  conceptCount: number;
}

interface Concept {
  id: number;
  conceptName: string;
  definition: string | null;
  explanation: string | null;
  sources: string[] | null;
  codeScaffold: string | null;
  relationships: { depends_on: string[]; enables: string[]; compare_with: string[] } | null;
}

export default function DomainBrowser() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kb/domains')
      .then((r) => r.json())
      .then((d) => { setDomains(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadConcepts = async (domainId: number) => {
    setSelectedDomain(domainId);
    const res = await fetch(`/api/kb/domains?domainId=${domainId}`);
    const data = await res.json();
    setConcepts(data.concepts || []);
  };

  if (loading) return <p className="text-[var(--text-3)]">Loading domains...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <h3 className="text-[14px] font-bold mb-3">Domains</h3>
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => loadConcepts(d.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              selectedDomain === d.id
                ? 'bg-[var(--accent-soft)] border border-[var(--accent)]'
                : 'bg-[var(--canvas)] border border-[var(--border)] hover:border-[var(--text-4)]'
            }`}
          >
            <div className="text-[13px] font-bold">{d.domainName}</div>
            <div className="flex gap-1.5 mt-1">
              <Badge>{d.conceptCount} concepts</Badge>
              <Badge variant={d.kbSource === 'core' ? 'default' : 'purple'}>{d.kbSource}</Badge>
            </div>
          </button>
        ))}
      </div>

      <div className="md:col-span-2">
        {concepts.length === 0 ? (
          <p className="text-[var(--text-3)] text-sm">Select a domain to browse concepts.</p>
        ) : (
          <div>
            <h3 className="text-[14px] font-bold mb-3">Concepts ({concepts.length})</h3>
            {concepts.map((c) => (
              <Accordion key={c.id} title={c.conceptName}>
                {c.definition && (
                  <div className="mb-3">
                    <div className="text-[9px] font-extrabold tracking-[2.5px] uppercase text-[var(--accent)] mb-1">Definition</div>
                    <p className="text-[13px] text-[var(--text-2)]">{c.definition}</p>
                  </div>
                )}
                {c.explanation && (
                  <div className="mb-3">
                    <div className="text-[9px] font-extrabold tracking-[2.5px] uppercase text-[var(--purple)] mb-1">Explanation</div>
                    <p className="text-[13px] text-[var(--text-2)] whitespace-pre-line">{c.explanation}</p>
                  </div>
                )}
                {c.codeScaffold && (
                  <div className="mb-3">
                    <div className="text-[9px] font-extrabold tracking-[2.5px] uppercase text-[var(--cyan)] mb-1">Code Scaffold</div>
                    <pre className="text-xs">{c.codeScaffold}</pre>
                  </div>
                )}
                {c.relationships && (
                  <div className="mb-3">
                    <div className="text-[9px] font-extrabold tracking-[2.5px] uppercase text-[var(--green)] mb-1">Relationships</div>
                    <div className="grid grid-cols-3 gap-2 text-[12px]">
                      <div><strong>Depends on:</strong> {c.relationships.depends_on.join(', ') || 'None'}</div>
                      <div><strong>Enables:</strong> {c.relationships.enables.join(', ') || 'None'}</div>
                      <div><strong>Compare:</strong> {c.relationships.compare_with.join(', ') || 'None'}</div>
                    </div>
                  </div>
                )}
                {c.sources && c.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.sources.map((s, i) => (
                      <span key={i} className="text-[10px] bg-[var(--surface)] px-2 py-0.5 rounded text-[var(--text-4)]">{s}</span>
                    ))}
                  </div>
                )}
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
