'use client';

import { TRUST_LAYERS } from '@/lib/governance-constants';
import type { TrustLayerScore } from '@/types/governance';

interface TrustLayerFormProps {
  scores: TrustLayerScore[];
  onChange: (scores: TrustLayerScore[]) => void;
}

export default function TrustLayerForm({ scores, onChange }: TrustLayerFormProps) {
  const updateScore = (index: number, field: keyof TrustLayerScore, value: unknown) => {
    const updated = [...scores];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-calculate risk level from score
    if (field === 'score') {
      const s = value as number;
      updated[index].riskLevel = s >= 8 ? 'low' : s >= 6 ? 'medium' : s >= 4 ? 'high' : 'critical';
    }
    onChange(updated);
  };

  const addGap = (index: number) => {
    const updated = [...scores];
    updated[index] = { ...updated[index], gaps: [...updated[index].gaps, ''] };
    onChange(updated);
  };

  const updateGap = (layerIndex: number, gapIndex: number, value: string) => {
    const updated = [...scores];
    const gaps = [...updated[layerIndex].gaps];
    gaps[gapIndex] = value;
    updated[layerIndex] = { ...updated[layerIndex], gaps };
    onChange(updated);
  };

  const removeGap = (layerIndex: number, gapIndex: number) => {
    const updated = [...scores];
    updated[layerIndex] = {
      ...updated[layerIndex],
      gaps: updated[layerIndex].gaps.filter((_, i) => i !== gapIndex),
    };
    onChange(updated);
  };

  const riskColorMap: Record<string, string> = {
    low: 'var(--status-success)',
    medium: 'var(--status-warning)',
    high: '#ea580c',
    critical: 'var(--status-error)',
  };

  return (
    <div className="space-y-6">
      {TRUST_LAYERS.map((layer, i) => {
        const score = scores[i];
        return (
          <div key={layer.slug} className="rounded-lg p-5" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Layer {layer.num}: {layer.name}
                </h3>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{layer.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-2xl font-bold" style={{ color: 'var(--module-governance)' }}>{score.score}</span>
                <span className="text-[12px]" style={{ color: 'var(--text-quaternary)' }}>/10</span>
                <div className="text-[11px] font-bold uppercase" style={{ color: riskColorMap[score.riskLevel] }}>
                  {score.riskLevel}
                </div>
              </div>
            </div>

            {/* Score Slider */}
            <div className="mb-4">
              <input
                type="range"
                min={1}
                max={10}
                value={score.score}
                onChange={(e) => updateScore(i, 'score', parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--module-governance)' }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-quaternary)' }}>
                <span>1 — Critical</span>
                <span>5 — Moderate</span>
                <span>10 — Excellent</span>
              </div>
            </div>

            {/* Assessment Questions */}
            <div className="mb-4 rounded-md p-3" style={{ background: 'var(--surface-0)' }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-quaternary)' }}>
                Key Questions
              </div>
              <ul className="text-[12px] space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {layer.questions.map((q, qi) => (
                  <li key={qi} className="flex items-start gap-2">
                    <span style={{ color: 'var(--module-governance)' }} className="mt-0.5">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence */}
            <div className="mb-3">
              <label className="text-[12px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Evidence</label>
              <textarea
                rows={2}
                value={score.evidence}
                onChange={(e) => updateScore(i, 'evidence', e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2 resize-none"
                style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="Describe evidence supporting this score..."
              />
            </div>

            {/* Gaps */}
            <div>
              <label className="text-[12px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Identified Gaps</label>
              {score.gaps.map((gap, gi) => (
                <div key={gi} className="flex items-center gap-2 mb-1.5">
                  <input
                    type="text"
                    value={gap}
                    onChange={(e) => updateGap(i, gi, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
                    style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                    placeholder="Describe gap..."
                  />
                  <button
                    type="button"
                    onClick={() => removeGap(i, gi)}
                    className="text-[12px] transition-colors"
                    style={{ color: 'var(--text-quaternary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--status-error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addGap(i)}
                className="text-[12px] font-medium hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                + Add Gap
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
