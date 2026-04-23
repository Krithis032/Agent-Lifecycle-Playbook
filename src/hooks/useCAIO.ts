'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CaioAssessment } from '@/types/caio';

export function useCaioList() {
  const [assessments, setAssessments] = useState<CaioAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    setLoading(true);
    fetch('/api/caio')
      .then(r => r.json())
      .then(data => { setAssessments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAssessments([]); setLoading(false); });
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { assessments, loading, refetch: fetchAll };
}

export function useCaioDetail(id: number | null) {
  const [assessment, setAssessment] = useState<CaioAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/caio/${id}`)
      .then(r => r.json())
      .then(data => { setAssessment(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  return { assessment, loading, refetch: fetchDetail };
}

export async function updateActionItem(actionId: number, data: Record<string, unknown>) {
  const res = await fetch(`/api/caio/actions/${actionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update action');
  return res.json();
}
