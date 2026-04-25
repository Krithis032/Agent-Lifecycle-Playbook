'use client';

import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import type { EvalOption } from '@/types/evaluation';

interface OptionConfiguratorProps {
  options: EvalOption[];
  onChange: (options: EvalOption[]) => void;
  maxOptions?: number;
  minOptions?: number;
}

export default function OptionConfigurator({
  options,
  onChange,
  maxOptions = 6,
  minOptions = 2,
}: OptionConfiguratorProps) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const addOption = () => {
    if (!newName.trim() || options.length >= maxOptions) return;
    const key = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (options.some(o => o.key === key)) return;
    onChange([...options, { key, name: newName.trim(), description: newDesc.trim() || undefined }]);
    setNewName('');
    setNewDesc('');
  };

  const removeOption = (key: string) => {
    if (options.length <= minOptions) return;
    onChange(options.filter(o => o.key !== key));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((option, i) => (
          <div
            key={option.key}
            className="flex items-center gap-3 p-3 rounded-lg group"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}
          >
            <GripVertical size={16} className="shrink-0" style={{ color: 'var(--text-quaternary)' }} />
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0" style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{option.name}</div>
              {option.description && (
                <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{option.description}</div>
              )}
            </div>
            <button
              onClick={() => removeOption(option.key)}
              disabled={options.length <= minOptions}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
              style={{ color: 'var(--text-quaternary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--status-error-soft)'; e.currentTarget.style.color = 'var(--status-error)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-quaternary)'; }}
              aria-label={`Remove ${option.name}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {options.length < maxOptions && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Option name"
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
              style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
              onKeyDown={e => e.key === 'Enter' && addOption()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Description (optional)</label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Brief description"
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
              style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
              onKeyDown={e => e.key === 'Enter' && addOption()}
            />
          </div>
          <button
            onClick={addOption}
            disabled={!newName.trim() || options.length >= maxOptions}
            className="px-3 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1 shrink-0"
            style={{ background: 'var(--module-evaluate)' }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      )}

      <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>
        {options.length} of {maxOptions} options · minimum {minOptions}
      </div>
    </div>
  );
}
