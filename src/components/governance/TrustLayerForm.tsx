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

  const riskColors: Record<string, string> = {
    low: 'text-[var(--success)]',
    medium: 'text-[var(--warning)]',
    high: 'text-orange-600',
    critical: 'text-[var(--error)]',
  };

  return (
    <div className="space-y-6">
      {TRUST_LAYERS.map((layer, i) => {
        const score = scores[i];
        return (
          <div key={layer.slug} className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--text)]">
                  Layer {layer.num}: {layer.name}
                </h3>
                <p className="text-[12px] text-[var(--text-3)] mt-1">{layer.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-2xl font-bold text-[var(--accent)]">{score.score}</span>
                <span className="text-[12px] text-[var(--text-4)]">/10</span>
                <div className={`text-[11px] font-bold uppercase ${riskColors[score.riskLevel]}`}>
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
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-4)] mt-1">
                <span>1 — Critical</span>
                <span>5 — Moderate</span>
                <span>10 — Excellent</span>
              </div>
            </div>

            {/* Assessment Questions */}
            <div className="mb-4 bg-[var(--surface)] rounded-md p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-4)] mb-2">
                Key Questions
              </div>
              <ul className="text-[12px] text-[var(--text-2)] space-y-1">
                {layer.questions.map((q, qi) => (
                  <li key={qi} className="flex items-start gap-2">
                    <span className="text-[var(--accent)] mt-0.5">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence */}
            <div className="mb-3">
              <label className="text-[12px] font-semibold text-[var(--text-2)] block mb-1">Evidence</label>
              <textarea
                rows={2}
                value={score.evidence}
                onChange={(e) => updateScore(i, 'evidence', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-[13px] bg-[var(--bg)] focus:border-[var(--accent)] focus:outline-none resize-none"
                placeholder="Describe evidence supporting this score..."
              />
            </div>

            {/* Gaps */}
            <div>
              <label className="text-[12px] font-semibold text-[var(--text-2)] block mb-1">Identified Gaps</label>
              {score.gaps.map((gap, gi) => (
                <div key={gi} className="flex items-center gap-2 mb-1.5">
                  <input
                    type="text"
                    value={gap}
                    onChange={(e) => updateGap(i, gi, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-md text-[13px] bg-[var(--bg)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Describe gap..."
                  />
                  <button
                    type="button"
                    onClick={() => removeGap(i, gi)}
                    className="text-[var(--text-4)] hover:text-[var(--error)] text-[12px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addGap(i)}
                className="text-[12px] font-medium text-[var(--accent)] hover:underline"
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
