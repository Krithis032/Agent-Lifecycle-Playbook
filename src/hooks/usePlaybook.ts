'use client';

import { useState, useEffect } from 'react';
import type { PlaybookPhase, ReferenceData } from '@/types/playbook';

export function usePlaybook() {
  const [phases, setPhases] = useState<PlaybookPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/playbook/phases')
      .then((r) => r.json())
      .then((data) => { setPhases(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return { phases, loading, error };
}

export function usePhase(slug: string) {
  const [phase, setPhase] = useState<PlaybookPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/playbook/phases/${slug}`)
      .then((r) => r.json())
      .then((data) => { setPhase(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [slug]);

  return { phase, loading, error };
}

export function useReference() {
  const [data, setData] = useState<ReferenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/playbook/reference')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}
