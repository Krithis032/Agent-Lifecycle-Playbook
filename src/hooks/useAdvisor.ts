'use client';

import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import type { KbSearchResult, KbAskResponse, KbDomain } from '@/types/kb';

export function useAdvisor() {
  const [searchResults, setSearchResults] = useState<KbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [answer, setAnswer] = useState<KbAskResponse | null>(null);
  const [asking, setAsking] = useState(false);
  const [domains, setDomains] = useState<KbDomain[]>([]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetchWithAuth(`/api/kb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const ask = useCallback(async (question: string, projectId?: number) => {
    setAsking(true);
    setAnswer(null);
    try {
      const res = await fetchWithAuth('/api/kb/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, projectId }),
      });
      const data = await res.json();
      setAnswer(data);
    } catch {
      setAnswer(null);
    } finally {
      setAsking(false);
    }
  }, []);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/kb/domains');
      const data = await res.json();
      setDomains(data);
    } catch {
      setDomains([]);
    }
  }, []);

  return { searchResults, searching, search, answer, asking, ask, domains, fetchDomains };
}
