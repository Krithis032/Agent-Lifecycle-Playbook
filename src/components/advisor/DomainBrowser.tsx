'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
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
    fetchWithAuth('/api/kb/domains')
      .then((r) => r.json())
      .then((d) => { setDomains(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadConcepts = async (domainId: number) => {
    setSelectedDomain(domainId);
    const res = await fetchWithAuth(`/api/kb/domains?domainId=${domainId}`);
    const data = await res.json();
    setConcepts(data.concepts || []);
  };

  if (loading) return <p style={{ color: 'var(--text-tertiary)' }}>Loading domains...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <h3 className="text-[14px] font-bold mb-3">Domains</h3>
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => loadConcepts(d.id)}
            className="w-full text-left px-4 py-3 rounded-lg transition-all"
            style={{
              background: selectedDomain === d.id ? 'var(--brand-soft)' : 'var(--surface-elevated)',
              border: selectedDomain === d.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
            }}
          >
            <div className="text-[13px] font-bold">{d.domainName}</div>
            <div className="flex gap-1.5 mt-1">
              <Badge>{d.conceptCount} concepts</Badge>
              <Badge variant={d.kbSource === 'core' ? 'default' : 'info'}>{d.kbSource}</Badge>
            </div>
          </button>
        ))}
      </div>

      <div className="md:col-span-2">
        {concepts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Select a domain to browse concepts.</p>
        ) : (
          <div>
            <h3 className="text-[14px] font-bold mb-3">Concepts ({concepts.length})</h3>
            {concepts.map((c) => (
              <Accordion key={c.id} title={c.conceptName}>
                {c.definition && (
                  <div className="mb-3">
                    <div className="text-[9px] font-bold tracking-[2.5px] uppercase mb-1" style={{ color: 'var(--brand-primary)' }}>Definition</div>
                    <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{c.definition}</p>
                  </div>
                )}
                {c.explanation && (
                  <div className="mb-3">
                    <div className="text-[9px] font-bold tracking-[2.5px] uppercase mb-1" style={{ color: '#6b3fa0' }}>Explanation</div>
                    <p className="text-[13px] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{c.explanation}</p>
                  </div>
                )}
                {c.codeScaffold && (
                  <div className="mb-3">
                    <div className="text-[9px] font-bold tracking-[2.5px] uppercase mb-1" style={{ color: '#0e7490' }}>Code Scaffold</div>
                    <pre className="text-xs">{c.codeScaffold}</pre>
                  </div>
                )}
                {c.relationships && (
                  <div className="mb-3">
                    <div className="text-[9px] font-bold tracking-[2.5px] uppercase mb-1" style={{ color: '#15803d' }}>Relationships</div>
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
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--surface-1)', color: 'var(--text-quaternary)' }}>{s}</span>
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
