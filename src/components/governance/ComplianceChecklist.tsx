'use client';

import { COMPLIANCE_FRAMEWORKS } from '@/lib/governance-constants';
import type { ComplianceCheck } from '@/types/governance';

interface ComplianceChecklistProps {
  checks: ComplianceCheck[];
  onChange: (checks: ComplianceCheck[]) => void;
}

const statusOptions = [
  { value: 'compliant', label: 'Compliant', color: 'bg-[var(--success-soft)] text-[var(--success)]' },
  { value: 'partial', label: 'Partial', color: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  { value: 'non_compliant', label: 'Non-Compliant', color: 'bg-[var(--error-soft)] text-[var(--error)]' },
  { value: 'not_applicable', label: 'N/A', color: 'bg-[var(--surface)] text-[var(--text-4)]' },
] as const;

export default function ComplianceChecklist({ checks, onChange }: ComplianceChecklistProps) {
  const updateCheck = (index: number, field: string, value: string) => {
    const updated = [...checks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  let checkIndex = 0;

  return (
    <div className="space-y-6">
      {COMPLIANCE_FRAMEWORKS.map((fw) => (
        <div key={fw.framework} className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)]">
          <h3 className="text-[14px] font-semibold text-[var(--text)] mb-1">{fw.name}</h3>
          <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">{fw.framework}</span>
          <div className="mt-4 space-y-3">
            {fw.requirements.map((req) => {
              const ci = checkIndex++;
              const check = checks[ci];
              return (
                <div key={ci} className="bg-[var(--surface)] rounded-md p-3">
                  <p className="text-[12px] text-[var(--text-2)] mb-2">{req}</p>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateCheck(ci, 'status', opt.value)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                          check?.status === opt.value ? opt.color + ' ring-1 ring-current' : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-4)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={check?.notes || ''}
                    onChange={(e) => updateCheck(ci, 'notes', e.target.value)}
                    className="w-full px-2 py-1 border border-[var(--border)] rounded text-[12px] bg-[var(--bg)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Notes..."
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
