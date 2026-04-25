'use client';

import { BarChart3, Layers, Cpu, Sparkles } from 'lucide-react';
import type { EvalType } from '@/types/evaluation';

interface EvalTypeSelectorProps {
  selected: EvalType | null;
  onSelect: (type: EvalType) => void;
}

const evalTypes = [
  {
    type: 'framework' as EvalType,
    label: 'Framework Selection',
    description: 'Compare agentic frameworks (LangGraph, CrewAI, AG2, Claude SDK, etc.)',
    icon: Layers,
    color: '#0052cc',
  },
  {
    type: 'architecture' as EvalType,
    label: 'Architecture Pattern',
    description: 'Compare architecture patterns (Single Agent, Pipeline, Supervisor, etc.)',
    icon: Cpu,
    color: '#15803d',
  },
  {
    type: 'model_tier' as EvalType,
    label: 'Agent Evaluation Preset',
    description: 'Use a pre-configured evaluation for a specific agent domain',
    icon: Sparkles,
    color: '#6b3fa0',
  },
  {
    type: 'custom' as EvalType,
    label: 'Custom Evaluation',
    description: 'Define your own options and criteria for any decision',
    icon: BarChart3,
    color: '#b45309',
  },
];

export default function EvalTypeSelector({ selected, onSelect }: EvalTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {evalTypes.map(et => {
        const Icon = et.icon;
        const isSelected = selected === et.type;
        return (
          <button
            key={et.type}
            onClick={() => onSelect(et.type)}
            className="text-left p-5 rounded-xl border-2 transition-all duration-200"
            style={{
              borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-default)',
              background: isSelected ? 'var(--brand-soft)' : 'var(--surface-elevated)',
              boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: et.color + '12', color: et.color }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{et.label}</div>
                <div className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{et.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
