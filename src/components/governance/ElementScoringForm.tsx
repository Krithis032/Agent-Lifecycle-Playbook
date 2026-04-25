'use client';

import { SCORING_SCALE } from '@/lib/periodic-table-constants';
import type { PeriodicElement } from '@/lib/periodic-table-constants';
import type { PeriodicElementScore } from '@/types/governance';
import Badge from '@/components/ui/Badge';

interface ElementScoringFormProps {
  element: PeriodicElement;
  categoryColor: string;
  categoryName: string;
  score: PeriodicElementScore;
  onScoreChange: (score: number) => void;
  onNotesChange: (notes: string) => void;
  onChecklistToggle: (index: number) => void;
  onClose: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 3.5) return 'var(--status-success)';
  if (score >= 2.5) return '#22c55e';
  if (score >= 1.5) return 'var(--status-warning)';
  if (score >= 0.5) return '#ea580c';
  return 'var(--status-error)';
}

const layerLabels: Record<string, string> = {
  orchestrator: 'Orchestrator',
  individual_agents: 'Individual Agents',
  data_layer: 'Data Layer',
  inter_agent_communication: 'Inter-Agent Comm',
  output_layer: 'Output Layer',
  compliance_layer: 'Compliance Layer',
};

export default function ElementScoringForm({
  element,
  categoryColor,
  categoryName,
  score,
  onScoreChange,
  onNotesChange,
  onChecklistToggle,
  onClose,
}: ElementScoringFormProps) {
  const completedCount = score.checklist.filter(Boolean).length;
  const totalChecklist = element.implementationChecklist.length;
  const completionPct = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  return (
    <div className="rounded-xl p-6 animate-fade-in" style={{ background: 'var(--surface-elevated)', border: `2px solid ${categoryColor}` }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold" style={{ color: categoryColor }}>{element.code}</span>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{element.name}</span>
          </div>
          <div className="flex gap-1.5">
            <Badge variant="brand">{categoryName}</Badge>
            <Badge variant="default">{layerLabels[element.agentLayer] || element.agentLayer}</Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[14px] font-bold transition-colors px-2 py-1 rounded"
          style={{ color: 'var(--text-quaternary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--status-error)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}
        >
          Close
        </button>
      </div>

      {/* Description */}
      <p className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>{element.fullDescription}</p>
      <div className="text-[12px] mb-4 p-3 rounded-lg" style={{ background: 'var(--surface-0)', color: 'var(--text-tertiary)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Why it matters: </span>
        {element.whyItMatters}
      </div>

      {/* Score Selection (0–4) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)' }}>
            Maturity Score
          </label>
          <span className="text-lg font-bold" style={{ color: getScoreColor(score.score) }}>
            {score.score}/4
          </span>
        </div>
        <div className="flex gap-1.5 mb-2">
          {SCORING_SCALE.map(s => (
            <button
              key={s.score}
              type="button"
              onClick={() => onScoreChange(s.score)}
              className="flex-1 py-2 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: score.score === s.score ? categoryColor : 'var(--surface-0)',
                color: score.score === s.score ? 'white' : 'var(--text-tertiary)',
                border: score.score === s.score ? 'none' : '1px solid var(--border-default)',
              }}
            >
              {s.score}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-quaternary)' }}>
          <span>Not Implemented</span>
          <span>Optimized</span>
        </div>
        {/* Score Meaning */}
        <div className="text-[11px] mt-2 px-3 py-1.5 rounded" style={{ background: `color-mix(in srgb, ${categoryColor} 8%, transparent)`, color: categoryColor }}>
          <span className="font-bold">{SCORING_SCALE[score.score]?.label}:</span> {SCORING_SCALE[score.score]?.meaning}
        </div>
      </div>

      {/* Implementation Checklist */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)' }}>
            Implementation Checklist
          </label>
          <span className="text-[11px] font-semibold" style={{ color: completionPct >= 80 ? 'var(--status-success)' : completionPct >= 40 ? 'var(--status-warning)' : 'var(--text-quaternary)' }}>
            {completedCount}/{totalChecklist} ({completionPct}%)
          </span>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'var(--surface-1)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${completionPct}%`, background: categoryColor }} />
        </div>
        <div className="space-y-1.5">
          {element.implementationChecklist.map((item, idx) => (
            <label
              key={idx}
              className="flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors"
              style={{ background: score.checklist[idx] ? `color-mix(in srgb, ${categoryColor} 6%, transparent)` : 'transparent' }}
            >
              <input
                type="checkbox"
                checked={score.checklist[idx] || false}
                onChange={() => onChecklistToggle(idx)}
                className="mt-0.5 accent-current"
                style={{ accentColor: categoryColor }}
              />
              <span
                className="text-[12px] leading-snug"
                style={{ color: score.checklist[idx] ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="text-[12px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-quaternary)' }}>
          Evidence / Notes
        </label>
        <textarea
          rows={3}
          value={score.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2 resize-none"
          style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = `0 0 0 2px color-mix(in srgb, ${categoryColor} 15%, transparent)`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
          placeholder="Describe evidence or observations for this element..."
        />
      </div>

      {/* Cross-References */}
      <div className="text-[11px] p-2 rounded" style={{ background: 'var(--surface-0)' }}>
        <span className="font-bold" style={{ color: 'var(--text-quaternary)' }}>Cross-References: </span>
        <span style={{ color: 'var(--text-tertiary)' }}>{element.crossReferences.primary}</span>
        {element.crossReferences.secondary && (
          <span style={{ color: 'var(--text-tertiary)' }}> | {element.crossReferences.secondary}</span>
        )}
      </div>
    </div>
  );
}
