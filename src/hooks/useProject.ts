'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project, CreateProjectInput, PlaybookPhaseData, TemplateData } from '@/types/project';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch('/api/projects', { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setProjects(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((e) => { if (!controller.signal.aborted) { setError(e.message); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const createProject = async (input: CreateProjectInput) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create project');
    const project = await res.json();
    fetchProjects();
    return project;
  };

  return { projects, loading, error, createProject, refetch: fetchProjects };
}

export function useProject(id: number) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchProject = useCallback(() => {
    if (!id) return;
    // Abort any in-flight request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetch(`/api/projects/${id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!controller.signal.aborted) { setProject(data); setLoading(false); } })
      .catch((e) => { if (!controller.signal.aborted) { setError(e.message); setLoading(false); } });
  }, [id]);

  useEffect(() => {
    fetchProject();
    return () => abortRef.current?.abort();
  }, [fetchProject]);

  const toggleGate = async (gateCheckId: number, itemIndex: number, checked: boolean) => {
    await fetch(`/api/projects/${id}/gates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateCheckId, itemIndex, checked }),
    });
    fetchProject();
  };

  const updateStepProgress = async (stepId: number, data: { status?: string; notes?: string; deliverableData?: Record<string, string> }) => {
    await fetch(`/api/projects/${id}/steps`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId, ...data }),
    });
    fetchProject();
  };

  const updatePhaseStatus = async (phaseId: number, status: string) => {
    await fetch(`/api/projects/${id}/phases`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseId, status }),
    });
    fetchProject();
  };

  return { project, loading, error, toggleGate, updateStepProgress, updatePhaseStatus, refetch: fetchProject };
}

export function usePlaybookPhases() {
  const [phases, setPhases] = useState<PlaybookPhaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/playbook/phases', { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!controller.signal.aborted) { setPhases(data); setLoading(false); } })
      .catch(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return { phases, loading };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/templates', { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!controller.signal.aborted) { setTemplates(data); setLoading(false); } })
      .catch(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return { templates, loading };
}
