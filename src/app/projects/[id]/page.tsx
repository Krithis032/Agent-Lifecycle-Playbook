'use client';

import { useEffect, useState } from 'react';
import { useProject, usePlaybookPhases, useTemplates } from '@/hooks/useProject';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import SectionPanel from '@/components/ui/SectionPanel';
import GateTracker from '@/components/projects/GateTracker';
import TemplateFillForm from '@/components/projects/TemplateFillForm';
import { ChevronRight, CheckCircle2, Circle, PlayCircle, Clock, FileText, Shield, Lightbulb, Code, ListChecks, ClipboardCheck } from 'lucide-react';
import type { PlaybookStepData, TemplateData } from '@/types/project';

const statusBadge: Record<string, 'default' | 'brand' | 'success' | 'warning'> = {
  not_started: 'default',
  in_progress: 'brand',
  completed: 'success',
  skipped: 'default',
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const projectId = parseInt(id);
  const { project, loading, toggleGate, updateStepProgress, updatePhaseStatus } = useProject(projectId);
  const { phases: playbookPhases } = usePlaybookPhases();
  const { templates } = useTemplates();
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [showTemplate, setShowTemplate] = useState<TemplateData | null>(null);
  const [gates, setGates] = useState<{ gateCheckId: number; gateTitle: string; itemIndex: number; label: string; checked: boolean }[]>([]);

  // Set active phase to current phase
  useEffect(() => {
    if (project?.currentPhaseId && !activePhaseId) {
      setActivePhaseId(project.currentPhaseId);
    }
  }, [project, activePhaseId]);

  // Build gates list for active phase
  useEffect(() => {
    if (!project || !activePhaseId || !playbookPhases.length) return;
    const phase = playbookPhases.find((p) => p.id === activePhaseId);
    if (!phase) return;
    const items: typeof gates = [];
    for (const gc of phase.gateChecks || []) {
      const checkItems = (gc.checkItems as string[]) || [];
      checkItems.forEach((label: string, idx: number) => {
        const existing = project.gateChecks?.find(
          (pg) => pg.gateCheckId === gc.id && pg.itemIndex === idx
        );
        items.push({
          gateCheckId: gc.id,
          gateTitle: gc.gateTitle,
          itemIndex: idx,
          label,
          checked: existing?.checked || false,
        });
      });
    }
    setGates(items);
  }, [project, activePhaseId, playbookPhases]);

  if (loading) return <p style={{ color: 'var(--text-tertiary)' }} className="py-12 text-center">Loading project...</p>;
  if (!project) return <p style={{ color: 'var(--text-tertiary)' }} className="py-12 text-center">Project not found</p>;

  const activePhase = playbookPhases.find((p) => p.id === activePhaseId);
  const activeStep = activePhase?.steps.find((s) => s.id === activeStepId);
  const phaseTemplates = templates.filter((t) => t.phaseId === activePhaseId);
  const phaseProgress = project.phaseProgress || [];

  const getStepStatus = (stepId: number) => {
    return project.stepProgress?.find((sp) => sp.stepId === stepId)?.status || 'not_started';
  };

  const getStepNotes = (stepId: number) => {
    return project.stepProgress?.find((sp) => sp.stepId === stepId)?.notes || '';
  };

  const getStepDeliverables = (stepId: number) => {
    return project.stepProgress?.find((sp) => sp.stepId === stepId)?.deliverableData || {};
  };

  const totalSteps = activePhase?.steps.length || 0;
  const completedSteps = activePhase?.steps.filter((s) => getStepStatus(s.id) === 'completed').length || 0;
  const totalGates = gates.length;
  const checkedGates = gates.filter((g) => g.checked).length;

  const handleGateToggle = async (gateCheckId: number, itemIndex: number, checked: boolean) => {
    await toggleGate(gateCheckId, itemIndex, checked);
    setGates((prev) =>
      prev.map((g) =>
        g.gateCheckId === gateCheckId && g.itemIndex === itemIndex ? { ...g, checked } : g
      )
    );
  };

  const handleCompletePhase = async () => {
    if (!activePhaseId) return;
    await updatePhaseStatus(activePhaseId, 'completed');
    // Move to next phase
    const currentIdx = phaseProgress.findIndex((pp) => pp.phaseId === activePhaseId);
    if (currentIdx >= 0 && currentIdx < phaseProgress.length - 1) {
      setActivePhaseId(phaseProgress[currentIdx + 1].phaseId);
      setActiveStepId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/projects"
            className="text-[12px] font-semibold transition-colors mb-2 block"
            style={{ color: 'var(--text-quaternary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-quaternary)'; }}
          >
            &larr; All Projects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-[14px] mt-1 max-w-[600px]" style={{ color: 'var(--text-tertiary)' }}>{project.description}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Badge variant={project.status === 'active' ? 'success' : project.status === 'completed' ? 'brand' : 'default'}>{project.status}</Badge>
            {project.framework && <Badge variant="info">{project.framework}</Badge>}
            {project.architecturePattern && <Badge variant="info">{project.architecturePattern.replace('_', ' ')}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/projects/${projectId}/export/pdf`}
            target="_blank"
            className="adp-btn-primary flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12px] font-semibold"
          >
            <FileText size={14} /> PDF Report
          </a>
        </div>
      </div>

      {/* Phase Timeline */}
      <Card className="mb-6">
        <div className="flex items-center gap-0.5 flex-wrap">
          {phaseProgress.map((pp, i) => {
            const isActive = pp.phaseId === activePhaseId;
            const isCurrent = pp.phaseId === project.currentPhaseId;
            return (
              <div key={pp.phaseId} className="flex items-center">
                <button
                  onClick={() => { setActivePhaseId(pp.phaseId); setActiveStepId(null); }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-sm)] text-[11px] font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: isActive ? 'var(--brand-soft)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : pp.status === 'completed' ? 'var(--status-success)' : 'var(--text-tertiary)',
                    boxShadow: isActive ? 'inset 0 0 0 1px var(--brand-primary)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-0)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {pp.status === 'completed' ? (
                    <CheckCircle2 size={12} />
                  ) : pp.status === 'in_progress' ? (
                    <PlayCircle size={12} />
                  ) : (
                    <Circle size={12} />
                  )}
                  <span className="text-sm">{pp.phase?.icon}</span>
                  <span>{pp.phase?.name}</span>
                  {isCurrent && <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--brand-primary)' }} />}
                </button>
                {i < phaseProgress.length - 1 && (
                  <ChevronRight size={12} className="mx-0 shrink-0" style={{ color: 'var(--text-quaternary)' }} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active Phase Content */}
      {activePhase && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Steps List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {activePhase.icon} Phase {activePhase.phaseNum}: {activePhase.name}
              </h2>
            </div>
            {activePhase.duration && (
              <p className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'var(--text-quaternary)' }}>
                <Clock size={12} /> {activePhase.duration}
              </p>
            )}

            {/* Step Completion Progress */}
            <Card padding="sm" className="mb-4">
              <Progress value={completedSteps} max={Math.max(totalSteps, 1)} label={`Steps (${completedSteps}/${totalSteps})`} color="var(--module-projects)" size="sm" />
              <div className="mt-2">
                <Progress value={checkedGates} max={Math.max(totalGates, 1)} label={`Gates (${checkedGates}/${totalGates})`} color="var(--status-success)" size="sm" />
              </div>
            </Card>

            {/* Step Cards */}
            <div className="space-y-1.5">
              {activePhase.steps.map((step) => {
                const stepStatus = getStepStatus(step.id);
                const isSelected = activeStepId === step.id;
                const nextStatus = stepStatus === 'not_started' ? 'in_progress' : stepStatus === 'in_progress' ? 'completed' : 'not_started';
                return (
                  <div
                    key={step.id}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-left transition-all"
                    style={{
                      background: isSelected ? 'var(--brand-soft)' : 'transparent',
                      boxShadow: isSelected ? 'inset 0 0 0 1px var(--brand-primary)' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-0)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'var(--brand-soft)' : 'transparent'; }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStepProgress(step.id, { status: nextStatus }); }}
                      className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                      title={stepStatus === 'not_started' ? 'Click to start' : stepStatus === 'in_progress' ? 'Click to complete' : 'Click to reopen'}
                    >
                      {stepStatus === 'completed' ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--status-success)' }} />
                      ) : stepStatus === 'in_progress' ? (
                        <PlayCircle size={18} style={{ color: 'var(--module-projects)' }} />
                      ) : (
                        <Circle size={18} style={{ color: 'var(--text-quaternary)' }} />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveStepId(step.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <span className="text-[12px] font-bold block leading-snug" style={{ color: 'var(--text-primary)' }}>
                        Step {step.stepNum}: {step.title}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-quaternary)' }}>
                        {(step.deliverables as string[] | null)?.length || 0} deliverables
                        {step.tools ? ` / ${(step.tools as string[]).length} tools` : ''}
                      </span>
                    </button>
                    <ChevronRight size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--text-quaternary)' }} />
                  </div>
                );
              })}
            </div>

            {/* Phase Templates */}
            {phaseTemplates.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-quaternary)' }}>Templates</h3>
                <div className="space-y-1.5">
                  {phaseTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setShowTemplate(t)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] transition-all text-left"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-0)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <FileText size={14} className="shrink-0" style={{ color: 'var(--module-templates)' }} />
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Actions */}
            <div className="mt-4 space-y-2">
              {phaseProgress.find((pp) => pp.phaseId === activePhaseId)?.status === 'in_progress' && (
                <Button
                  onClick={handleCompletePhase}
                  size="sm"
                  className="w-full"
                  disabled={completedSteps < totalSteps}
                >
                  <CheckCircle2 size={14} />
                  {completedSteps < totalSteps
                    ? `Complete all steps first (${completedSteps}/${totalSteps})`
                    : 'Complete Phase & Advance'}
                </Button>
              )}
              {phaseProgress.find((pp) => pp.phaseId === activePhaseId)?.status === 'not_started' && (
                <Button
                  onClick={() => activePhaseId && updatePhaseStatus(activePhaseId, 'in_progress')}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <PlayCircle size={14} /> Start This Phase
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT: Step Detail or Gate Tracker */}
          <div className="lg:col-span-2">
            {showTemplate ? (
              <TemplateFillForm
                template={showTemplate}
                projectId={projectId}
                existingFill={project.templateFills?.find((f) => f.templateId === showTemplate.id)}
                onClose={() => setShowTemplate(null)}
              />
            ) : activeStep ? (
              <StepDetail
                step={activeStep}
                status={getStepStatus(activeStep.id)}
                notes={getStepNotes(activeStep.id)}
                deliverableData={getStepDeliverables(activeStep.id)}
                onStatusChange={(status) => updateStepProgress(activeStep.id, { status })}
                onNotesChange={(notes) => updateStepProgress(activeStep.id, { notes })}
                onDeliverableChange={(key, value) => {
                  const current = getStepDeliverables(activeStep.id);
                  updateStepProgress(activeStep.id, { deliverableData: { ...current, [key]: value } });
                }}
              />
            ) : (
              <SectionPanel title="Gate Checks" icon={ClipboardCheck}>
                <div className="p-4">
                  {gates.length > 0 ? (
                    <GateTracker gates={gates} onToggle={handleGateToggle} />
                  ) : (
                    <div className="text-center py-12">
                      <Shield size={32} className="mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>No gate checks for this phase</p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--text-quaternary)' }}>Select a step from the left to see its details and deliverables.</p>
                    </div>
                  )}
                </div>
              </SectionPanel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Step Detail inline component
function StepDetail({
  step,
  status,
  notes,
  deliverableData,
  onStatusChange,
  onNotesChange,
  onDeliverableChange,
}: {
  step: PlaybookStepData;
  status: string;
  notes: string;
  deliverableData: Record<string, string>;
  onStatusChange: (status: string) => void;
  onNotesChange: (notes: string) => void;
  onDeliverableChange: (key: string, value: string) => void;
}) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [notesTimer, setNotesTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => { setLocalNotes(notes); }, [notes]);

  const handleNotesChange = (val: string) => {
    setLocalNotes(val);
    if (notesTimer) clearTimeout(notesTimer);
    const timer = setTimeout(() => onNotesChange(val), 1000);
    setNotesTimer(timer);
  };

  const deliverables = (step.deliverables || []) as string[];
  const tools = (step.tools || []) as string[];

  return (
    <div>
      {/* Step Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Step {step.stepNum}: {step.title}
          </h2>
          <Badge variant={statusBadge[status] || 'default'} className="mt-2">
            {status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex gap-2">
          {status === 'not_started' && (
            <Button size="sm" variant="secondary" onClick={() => onStatusChange('in_progress')}>
              <PlayCircle size={14} /> Start
            </Button>
          )}
          {status === 'in_progress' && (
            <Button size="sm" onClick={() => onStatusChange('completed')}>
              <CheckCircle2 size={14} /> Complete
            </Button>
          )}
          {status === 'completed' && (
            <Button size="sm" variant="ghost" onClick={() => onStatusChange('in_progress')}>
              Reopen
            </Button>
          )}
        </div>
      </div>

      {/* Step Body */}
      <SectionPanel title="Description" icon={ListChecks} className="mb-4">
        <div className="p-4">
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{step.body}</div>
        </div>
      </SectionPanel>

      {/* Pro Tip */}
      {step.proTip && (
        <div
          className="mb-4 rounded-[var(--radius-lg)] p-4"
          style={{
            background: 'var(--status-warning-soft)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 20%, transparent)',
            borderLeft: '4px solid var(--status-warning)',
          }}
        >
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--status-warning)' }} />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--status-warning)' }}>Pro Tip</h4>
              <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{step.proTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Code Example */}
      {step.codeExample && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Code size={14} style={{ color: 'var(--module-templates)' }} />
            <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-quaternary)' }}>Code Example</h4>
          </div>
          <pre
            className="rounded-[var(--radius-sm)] p-4 overflow-x-auto text-[12px] font-mono"
            style={{
              background: 'var(--surface-1)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            {step.codeExample}
          </pre>
        </Card>
      )}

      {/* Deliverables Checklist */}
      {deliverables.length > 0 && (
        <Card className="mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-quaternary)' }}>
            Deliverables ({Object.keys(deliverableData).filter((k) => deliverableData[k]).length}/{deliverables.length})
          </h4>
          <div className="space-y-3">
            {deliverables.map((d, i) => {
              const key = `deliverable_${i}`;
              const value = deliverableData[key] || '';
              return (
                <div key={i}>
                  <label className="flex items-center gap-2 text-[13px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {value ? (
                      <CheckCircle2 size={14} className="shrink-0" style={{ color: 'var(--status-success)' }} />
                    ) : (
                      <Circle size={14} className="shrink-0" style={{ color: 'var(--text-quaternary)' }} />
                    )}
                    {d}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[12px] resize-none focus:outline-none focus:ring-2"
                    style={{
                      border: '1px solid var(--border-default)',
                      background: 'var(--surface-0)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                    rows={2}
                    placeholder={`Notes or link for: ${d}`}
                    value={value}
                    onChange={(e) => onDeliverableChange(key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tools */}
      {tools.length > 0 && (
        <Card className="mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-quaternary)' }}>Tools & Resources</h4>
          <div className="flex flex-wrap gap-2">
            {tools.map((t, i) => (
              <Badge key={i} variant="info">{t}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <h4 className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-quaternary)' }}>Your Notes</h4>
        <textarea
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] resize-y focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--border-default)',
            background: 'var(--surface-0)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
          rows={4}
          placeholder="Add notes, observations, decisions..."
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
      </Card>
    </div>
  );
}
