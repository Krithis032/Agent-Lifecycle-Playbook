'use client';

import { WHARTON_DOMAINS } from '@/lib/governance-constants';
import type { WhartonDomainInput } from '@/types/governance';

interface WhartonDomainFormProps {
  domains: WhartonDomainInput[];
  onChange: (domains: WhartonDomainInput[]) => void;
}

export default function WhartonDomainForm({ domains, onChange }: WhartonDomainFormProps) {
  const updateQuestion = (domainIdx: number, qIdx: number, field: string, value: unknown) => {
    const updated = [...domains];
    const questions = [...updated[domainIdx].questions];
    questions[qIdx] = { ...questions[qIdx], [field]: value };
    updated[domainIdx] = { ...updated[domainIdx], questions };
    // Recalculate overall score
    const avg = questions.reduce((sum, q) => sum + q.score, 0) / questions.length;
    const normalized = avg / 3; // normalize 1-3 to 0-1
    updated[domainIdx].overallScore = Math.round(normalized * 100) / 100;
    updated[domainIdx].riskLevel = normalized >= 0.75 ? 'low' : normalized >= 0.5 ? 'medium' : normalized >= 0.33 ? 'high' : 'critical';
    onChange(updated);
  };

  const updateDomainField = (domainIdx: number, field: string, value: unknown) => {
    const updated = [...domains];
    updated[domainIdx] = { ...updated[domainIdx], [field]: value };
    onChange(updated);
  };

  const scoreLabels = ['', '1 — Weak', '2 — Adequate', '3 — Strong'];

  return (
    <div className="space-y-6">
      {WHARTON_DOMAINS.map((domain, di) => {
        const d = domains[di];
        return (
          <div key={domain.key} className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--text)]">{domain.name}</h3>
                <span className="text-[11px] font-medium text-[var(--text-4)] uppercase tracking-wider">{domain.source}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[var(--accent)]">{(d.overallScore * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-3 mb-4">
              {domain.questions.map((q, qi) => (
                <div key={qi} className="bg-[var(--surface)] rounded-md p-3">
                  <p className="text-[12px] text-[var(--text-2)] mb-2">{q}</p>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateQuestion(di, qi, 'score', score)}
                        className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                          d.questions[qi]?.score === score
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-3)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {scoreLabels[score]}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={d.questions[qi]?.evidence || ''}
                    onChange={(e) => updateQuestion(di, qi, 'evidence', e.target.value)}
                    className="w-full px-2 py-1 border border-[var(--border)] rounded text-[12px] bg-[var(--bg)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Evidence / notes..."
                  />
                </div>
              ))}
            </div>

            {/* Current State */}
            <textarea
              rows={2}
              value={d.currentState}
              onChange={(e) => updateDomainField(di, 'currentState', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-[13px] bg-[var(--bg)] focus:border-[var(--accent)] focus:outline-none resize-none mb-2"
              placeholder="Current state assessment..."
            />
          </div>
        );
      })}
    </div>
  );
}
