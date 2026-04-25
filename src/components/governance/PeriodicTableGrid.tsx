'use client';

import { useState } from 'react';
import { PERIODIC_TABLE_CATEGORIES, SCORING_SCALE, classifyRisk } from '@/lib/periodic-table-constants';
import type { PeriodicElementScore, PeriodicCategoryScore } from '@/types/governance';
import type { PeriodicElement } from '@/lib/periodic-table-constants';
import Badge from '@/components/ui/Badge';

interface PeriodicTableGridProps {
  categoryScores: PeriodicCategoryScore[];
  onElementClick?: (element: PeriodicElement, categoryId: string) => void;
  weightedScore?: number;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 3.5) return 'var(--status-success)';
  if (score >= 2.5) return '#22c55e';
  if (score >= 1.5) return 'var(--status-warning)';
  if (score >= 0.5) return '#ea580c';
  return 'var(--status-error)';
}

function getScoreLabel(score: number): string {
  const level = SCORING_SCALE.find(s => s.score === Math.round(score));
  return level?.label || 'N/A';
}

const LAYER_SHORT: Record<string, string> = {
  orchestrator: 'Orch',
  individual_agents: 'Agent',
  data_layer: 'Data',
  inter_agent_communication: 'Comms',
  output_layer: 'Output',
  compliance_layer: 'Comply',
};

export default function PeriodicTableGrid({ categoryScores, onElementClick, weightedScore, compact }: PeriodicTableGridProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const getElementScore = (code: string): PeriodicElementScore | undefined => {
    for (const cat of categoryScores) {
      const el = cat.elementScores.find(e => e.code === code);
      if (el) return el;
    }
    return undefined;
  };

  const riskInfo = weightedScore != null ? classifyRisk(weightedScore) : null;

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      {weightedScore != null && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)' }}>
              Periodic Table Score
            </span>
            <div className="text-2xl font-bold" style={{ color: 'var(--module-governance)' }}>
              {weightedScore.toFixed(1)}%
            </div>
          </div>
          {riskInfo && (
            <Badge variant={riskInfo.label === 'STRONG' ? 'success' : riskInfo.label === 'MODERATE' ? 'warning' : 'error'}>
              {riskInfo.label}
            </Badge>
          )}
          <div className="flex gap-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {SCORING_SCALE.map(s => (
              <div key={s.score} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: getScoreColor(s.score) }} />
                <span>{s.score} {s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Rows */}
      {PERIODIC_TABLE_CATEGORIES.map(cat => {
        const catScore = categoryScores.find(cs => cs.categoryId === cat.id);
        return (
          <div key={cat.id}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-sm" style={{ background: cat.color }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                {cat.name}
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-quaternary)' }}>
                ({cat.elementCount} elements, weight: {(cat.weight * 100).toFixed(0)}%)
              </span>
              {catScore && (
                <span className="text-[12px] font-bold ml-auto" style={{ color: cat.color }}>
                  {catScore.percentage.toFixed(0)}%
                </span>
              )}
            </div>

            {/* Element Tiles */}
            <div className={`grid gap-2 ${compact ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-7' : 'grid-cols-3 md:grid-cols-5 lg:grid-cols-7'}`}>
              {cat.elements.map(el => {
                const elScore = getElementScore(el.code);
                const score = elScore?.score ?? 0;
                const isHovered = hoveredElement === el.code;

                return (
                  <button
                    key={el.code}
                    type="button"
                    onClick={() => onElementClick?.(el, cat.id)}
                    onMouseEnter={() => setHoveredElement(el.code)}
                    onMouseLeave={() => setHoveredElement(null)}
                    className="relative rounded-lg p-2 text-left transition-all min-h-[82px] flex flex-col"
                    style={{
                      background: isHovered ? `color-mix(in srgb, ${cat.color} 12%, var(--surface-elevated))` : 'var(--surface-elevated)',
                      border: `2px solid ${isHovered ? cat.color : 'var(--border-default)'}`,
                      boxShadow: isHovered ? `0 4px 12px color-mix(in srgb, ${cat.color} 20%, transparent)` : 'none',
                      cursor: onElementClick ? 'pointer' : 'default',
                    }}
                  >
                    {/* Element Code */}
                    <div className="text-[15px] font-bold tracking-tight leading-none mb-0.5" style={{ color: cat.color }}>
                      {el.code}
                    </div>
                    {/* Element Name */}
                    <div className="text-[8px] font-medium leading-snug" style={{ color: 'var(--text-tertiary)', minHeight: '20px' }}>
                      {el.name}
                    </div>
                    {/* Score Indicator */}
                    <div className="flex items-center gap-1 mt-auto pt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(score / 4) * 100}%`,
                            background: getScoreColor(score),
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: getScoreColor(score) }}>
                        {score}
                      </span>
                    </div>
                    {/* Agent Layer Tag */}
                    {!compact && (
                      <div className="mt-1">
                        <span
                          className="text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                          style={{
                            background: `color-mix(in srgb, ${cat.color} 10%, transparent)`,
                            color: cat.color,
                          }}
                        >
                          {LAYER_SHORT[el.agentLayer] || el.agentLayer}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Hovered Element Tooltip */}
      {hoveredElement && !compact && (
        <div className="px-4 py-3 rounded-lg text-[12px]" style={{ background: 'var(--surface-0)', border: '1px solid var(--border-default)' }}>
          {(() => {
            const el = PERIODIC_TABLE_CATEGORIES.flatMap(c => c.elements).find(e => e.code === hoveredElement);
            const elScore = getElementScore(hoveredElement);
            if (!el) return null;
            return (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{el.code} - {el.name}</span>
                  <Badge variant="default">{getScoreLabel(elScore?.score ?? 0)}</Badge>
                </div>
                <p style={{ color: 'var(--text-tertiary)' }}>{el.fullDescription}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
