'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import type { GovernanceAssessment } from '@/types/governance';

export function useGovernanceList() {
  const [assessments, setAssessments] = useState<GovernanceAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    setLoading(true);
    fetchWithAuth('/api/governance/assess')
      .then(r => r.json())
      .then(data => { setAssessments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAssessments([]); setLoading(false); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchWithAuth('/api/governance/assess', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (!controller.signal.aborted) { setAssessments(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => { if (!controller.signal.aborted) { setAssessments([]); setLoading(false); } });
    return () => controller.abort();
  }, []);

  return { assessments, loading, refetch: fetchAll };
}

export function useGovernanceDetail(id: number | null) {
  const [assessment, setAssessment] = useState<GovernanceAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDetail = useCallback(() => {
    if (!id) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetchWithAuth(`/api/governance/detail/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (!controller.signal.aborted) { setAssessment(data); setLoading(false); } })
      .catch(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [id]);

  useEffect(() => {
    fetchDetail();
    return () => abortRef.current?.abort();
  }, [fetchDetail]);

  return { assessment, loading, refetch: fetchDetail };
}

export async function createAssessment(data: Record<string, unknown>) {
  const res = await fetchWithAuth('/api/governance/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create assessment');
  return res.json();
}

export async function createRiskItem(data: Record<string, unknown>) {
  const res = await fetchWithAuth('/api/governance/risks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create risk');
  return res.json();
}

export async function updateRiskItem(id: number, data: Record<string, unknown>) {
  const res = await fetchWithAuth(`/api/governance/risks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update risk');
  return res.json();
}

export async function deleteRiskItem(id: number) {
  const res = await fetchWithAuth(`/api/governance/risks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete risk');
  return res.json();
}
