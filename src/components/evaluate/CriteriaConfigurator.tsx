'use client';

import { useState } from 'react';
import { Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { EvalCriterion } from '@/types/evaluation';

interface CriteriaConfiguratorProps {
  criteria: EvalCriterion[];
  onChange: (criteria: EvalCriterion[]) => void;
  maxCriteria?: number;
  minCriteria?: number;
}

export default function CriteriaConfigurator({
  criteria,
  onChange,
  maxCriteria = 10,
  minCriteria = 3,
}: CriteriaConfiguratorProps) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isValidWeight = Math.abs(totalWeight - 1.0) < 0.01;

  const addCriterion = () => {
    if (!newName.trim() || criteria.length >= maxCriteria) return;
    const key = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (criteria.some(c => c.key === key)) return;
    const remainingWeight = Math.max(0, 1.0 - totalWeight);
    const defaultWeight = Math.round(Math.min(remainingWeight, 0.1) * 100) / 100;
    onChange([
      ...criteria,
      { key, name: newName.trim(), weight: defaultWeight, description: newDesc.trim() || undefined },
    ]);
    setNewName('');
    setNewDesc('');
  };

  const removeCriterion = (key: string) => {
    if (criteria.length <= minCriteria) return;
    onChange(criteria.filter(c => c.key !== key));
  };

  const updateWeight = (key: string, weight: number) => {
    onChange(criteria.map(c => (c.key === key ? { ...c, weight } : c)));
  };

  const normalizeWeights = () => {
    if (totalWeight === 0) return;
    onChange(criteria.map(c => ({ ...c, weight: Math.round((c.weight / totalWeight) * 100) / 100 })));
  };

  return (
    <div className="space-y-4">
      {/* Weight validation */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
        isValidWeight
          ? 'bg-[var(--success-soft)] text-[var(--success)]'
          : 'bg-[var(--warning-soft)] text-[var(--warning)]'
      }`}>
        {isValidWeight ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <span>Total weight: {(totalWeight * 100).toFixed(0)}%</span>
        {!isValidWeight && (
          <button onClick={normalizeWeights} className="ml-auto text-xs underline">
            Auto-normalize to 100%
          </button>
        )}
      </div>

      {/* Criteria list */}
      <div className="space-y-3">
        {criteria.map(criterion => (
          <div
            key={criterion.key}
            className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--text)]">{criterion.name}</div>
                {criterion.description && (
                  <div className="text-xs text-[var(--text-3)] mt-0.5">{criterion.description}</div>
                )}
              </div>
              <button
                onClick={() => removeCriterion(criterion.key)}
                disabled={criteria.length <= minCriteria}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--error-soft)] text-[var(--text-4)] hover:text-[var(--error)] transition-colors disabled:opacity-30 opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(criterion.weight * 100)}
                onChange={e => updateWeight(criterion.key, parseInt(e.target.value) / 100)}
                className="flex-1 accent-[var(--accent)]"
              />
              <span className="text-sm font-bold text-[var(--accent)] w-12 text-right tabular-nums">
                {(criterion.weight * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add new criterion */}
      {criteria.length < maxCriteria && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Criterion Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g., Performance"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
              onKeyDown={e => e.key === 'Enter' && addCriterion()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-3)] mb-1">Description (optional)</label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="What does this measure?"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
              onKeyDown={e => e.key === 'Enter' && addCriterion()}
            />
          </div>
          <button
            onClick={addCriterion}
            disabled={!newName.trim()}
            className="px-3 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center gap-1 shrink-0"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      )}

      <div className="text-xs text-[var(--text-4)]">
        {criteria.length} of {maxCriteria} criteria · minimum {minCriteria}
      </div>
    </div>
  );
}
