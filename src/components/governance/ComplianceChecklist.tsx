'use client';

import { COMPLIANCE_FRAMEWORKS } from '@/lib/governance-constants';
import type { ComplianceCheck } from '@/types/governance';

interface ComplianceChecklistProps {
  checks: ComplianceCheck[];
  onChange: (checks: ComplianceCheck[]) => void;
}

const statusOptions = [
  { value: 'compliant', label: 'Compliant', bg: 'var(--status-success-soft)', color: 'var(--status-success)' },
  { value: 'partial', label: 'Partial', bg: 'var(--status-warning-soft)', color: 'var(--status-warning)' },
  { value: 'non_compliant', label: 'Non-Compliant', bg: 'var(--status-error-soft)', color: 'var(--status-error)' },
  { value: 'not_applicable', label: 'N/A', bg: 'var(--surface-0)', color: 'var(--text-quaternary)' },
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
        <div key={fw.framework} className="rounded-lg p-5" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
          <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{fw.name}</h3>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--module-governance)' }}>{fw.framework}</span>
          <div className="mt-4 space-y-3">
            {fw.requirements.map((req) => {
              const ci = checkIndex++;
              const check = checks[ci];
              return (
                <div key={ci} className="rounded-md p-3" style={{ background: 'var(--surface-0)' }}>
                  <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>{req}</p>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateCheck(ci, 'status', opt.value)}
                        className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors"
                        style={{
                          background: check?.status === opt.value ? opt.bg : 'var(--surface-0)',
                          color: check?.status === opt.value ? opt.color : 'var(--text-quaternary)',
                          border: `1px solid ${check?.status === opt.value ? opt.color : 'var(--border-default)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={check?.notes || ''}
                    onChange={(e) => updateCheck(ci, 'notes', e.target.value)}
                    className="w-full px-2 py-1 rounded text-[12px] transition-all focus:outline-none focus:ring-2"
                    style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
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
