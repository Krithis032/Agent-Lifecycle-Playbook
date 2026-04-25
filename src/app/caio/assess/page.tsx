'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { CAIO_DOMAINS, CAIO_DOMAIN_GROUPS } from '@/lib/caio-constants';
import { ChevronLeft, ChevronRight, Check, Sparkles, Loader2 } from 'lucide-react';

const STEPS = ['Setup', 'Domain Assessment', 'AI Analysis', 'Review & Save'];

interface DomainState {
  domainKey: string;
  domainName: string;
  score: number;
  currentState: string;
  gaps: string[];
  actions: string[];
  questionScores: { question: string; score: number; evidence: string }[];
}

function initDomains(): DomainState[] {
  return CAIO_DOMAINS.map(d => ({
    domainKey: d.key,
    domainName: d.name,
    score: 3,
    currentState: '',
    gaps: [],
    actions: [],
    questionScores: d.questions.map(q => ({ question: q, score: 3, evidence: '' })),
  }));
}

export default function CaioAssessPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Step 1
  const [initiativeName, setInitiativeName] = useState('');
  const [assessmentMode, setAssessmentMode] = useState<'audit' | 'design' | 'folder_analysis'>('audit');
  const [projectId, setProjectId] = useState<number | undefined>();
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [targetMaturity, setTargetMaturity] = useState(3);

  // Step 2
  const [domains, setDomains] = useState<DomainState[]>(initDomains());

  // Step 3
  const [generated, setGenerated] = useState<{
    executiveSummary: string;
    maturityLevel: number;
    maturityLabel: string;
    findings: Record<string, unknown>[];
    actionItems: Record<string, unknown>[];
  } | null>(null);

  useEffect(() => {
    fetchWithAuth('/api/projects')
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const updateQuestion = (domainIdx: number, qIdx: number, field: string, value: unknown) => {
    const updated = [...domains];
    const qs = [...updated[domainIdx].questionScores];
    qs[qIdx] = { ...qs[qIdx], [field]: value };
    updated[domainIdx] = { ...updated[domainIdx], questionScores: qs };
    // Recalculate domain score
    const avg = qs.reduce((s, q) => s + q.score, 0) / qs.length;
    updated[domainIdx].score = Math.round(avg * 10) / 10;
    setDomains(updated);
  };

  const updateDomainField = (domainIdx: number, field: string, value: unknown) => {
    const updated = [...domains];
    updated[domainIdx] = { ...updated[domainIdx], [field]: value };
    setDomains(updated);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetchWithAuth('/api/caio/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          initiativeName,
          assessmentMode,
          domainScores: domains,
          targetMaturity,
          projectContext: projects.find(p => p.id === projectId)?.name,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const result = await res.json();
      setGenerated(result.generated);
      // Auto-advance to review once we have the ID
      router.push(`/caio/${result.id}`);
    } catch (err) {
      console.error(err);
      alert('Assessment generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const scoreLabels = ['', '1 \u2014 Ad Hoc', '2 \u2014 Initial', '3 \u2014 Defined', '4 \u2014 Managed', '5 \u2014 Optimized'];
  const avgScore = domains.reduce((s, d) => s + d.score, 0) / domains.length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <PageHeader
          eyebrow="CAIO"
          title="New CAIO Assessment"
          subtitle="12-domain maturity assessment with AI-generated findings."
        />
      </div>

      {/* Progress Steps — Connected dot stepper */}
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5" style={{ background: 'var(--border-default)' }} />
          {/* Completed line overlay */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%`, background: 'var(--status-success)' }}
          />

          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => i < 2 && setStep(i)}
              className="relative z-10 flex flex-col items-center gap-1.5 group"
              style={{ cursor: i < 2 ? 'pointer' : 'default' }}
            >
              {/* Step circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0"
                style={{
                  background: i === step
                    ? 'var(--module-caio)'
                    : i < step
                    ? 'var(--status-success)'
                    : 'var(--surface-elevated)',
                  color: i <= step
                    ? 'white'
                    : 'var(--text-quaternary)',
                  border: i > step ? '2px solid var(--border-default)' : 'none',
                  boxShadow: i === step ? '0 0 0 3px color-mix(in srgb, var(--module-caio) 20%, transparent)' : 'none',
                }}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              {/* Step label */}
              <span
                className="text-[10px] font-semibold text-center leading-tight max-w-[80px]"
                style={{
                  color: i === step
                    ? 'var(--module-caio)'
                    : i < step
                    ? 'var(--status-success)'
                    : 'var(--text-quaternary)',
                }}
              >
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        {step === 0 && (
          <Card>
            <h2 className="text-[15px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Assessment Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Initiative Name *</label>
                <input
                  type="text"
                  value={initiativeName}
                  onChange={(e) => setInitiativeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] focus:outline-none focus:ring-2 transition-all"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="e.g., Customer Support AI Agent"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Assessment Mode</label>
                <div className="flex gap-2">
                  {[
                    { value: 'audit', label: 'Audit', desc: 'Guided questionnaire' },
                    { value: 'design', label: 'Design', desc: 'Proactive for new initiatives' },
                    { value: 'folder_analysis', label: 'Folder Analysis', desc: 'Scan project artifacts' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setAssessmentMode(m.value as typeof assessmentMode)}
                      className="flex-1 p-3 rounded-[var(--radius-sm)] text-left transition-all"
                      style={{
                        background: assessmentMode === m.value ? 'var(--brand-soft)' : 'var(--surface-elevated)',
                        border: assessmentMode === m.value ? '2px solid var(--brand-primary)' : '2px solid transparent',
                      }}
                    >
                      <div className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.label}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Linked Project (optional)</label>
                  <select
                    value={projectId || ''}
                    onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] focus:outline-none transition-all"
                    style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>Target Maturity Level</label>
                  <select
                    value={targetMaturity}
                    onChange={(e) => setTargetMaturity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] focus:outline-none transition-all"
                    style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  >
                    {[1, 2, 3, 4, 5].map(l => (
                      <option key={l} value={l}>{l} \u2014 {scoreLabels[l]?.split(' \u2014 ')[1]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <div className="space-y-6">
            {/* Quick Score Summary */}
            <Card className="flex items-center gap-4">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Avg Score:</span>
              <span className="text-xl font-bold" style={{ color: 'var(--module-caio)' }}>{avgScore.toFixed(1)}/5</span>
              <Badge variant={avgScore >= 4 ? 'success' : avgScore >= 3 ? 'info' : avgScore >= 2 ? 'warning' : 'error'}>
                {scoreLabels[Math.round(avgScore)]?.split(' \u2014 ')[1] || 'Unknown'}
              </Badge>
            </Card>

            {CAIO_DOMAIN_GROUPS.map(group => (
              <div key={group}>
                <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>{group}</h3>
                <div className="space-y-4">
                  {CAIO_DOMAINS.filter(d => d.group === group).map((domain) => {
                    const di = domains.findIndex(d => d.domainKey === domain.key);
                    const d = domains[di];
                    return (
                      <div
                        key={domain.key}
                        className="rounded-[var(--radius-sm)] p-5"
                        style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{domain.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {domain.frameworks.map((f, fi) => (
                                <span key={fi} className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-0)', color: 'var(--text-quaternary)' }}>{f}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold" style={{ color: 'var(--module-caio)' }}>{d.score.toFixed(1)}</span>
                            <span className="text-[12px]" style={{ color: 'var(--text-quaternary)' }}>/5</span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {domain.questions.map((q, qi) => (
                            <div key={qi} className="rounded-[var(--radius-sm)] p-3" style={{ background: 'var(--surface-0)' }}>
                              <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>{q}</p>
                              <div className="flex gap-1.5 mb-2">
                                {[1, 2, 3, 4, 5].map(score => (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() => updateQuestion(di, qi, 'score', score)}
                                    className="px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold transition-all"
                                    style={{
                                      background: d.questionScores[qi]?.score === score ? 'var(--module-caio)' : 'var(--surface-elevated)',
                                      color: d.questionScores[qi]?.score === score ? 'white' : 'var(--text-tertiary)',
                                      border: d.questionScores[qi]?.score === score ? 'none' : '1px solid var(--border-default)',
                                    }}
                                  >
                                    {score}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={d.questionScores[qi]?.evidence || ''}
                                onChange={(e) => updateQuestion(di, qi, 'evidence', e.target.value)}
                                className="w-full px-2 py-1 rounded-[var(--radius-sm)] text-[12px] focus:outline-none transition-all"
                                style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)', color: 'var(--text-primary)' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                                placeholder="Evidence / notes..."
                              />
                            </div>
                          ))}
                        </div>

                        <textarea
                          rows={2}
                          value={d.currentState}
                          onChange={(e) => updateDomainField(di, 'currentState', e.target.value)}
                          className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] focus:outline-none resize-none mt-3 transition-all"
                          style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                          placeholder="Current state / key observations..."
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <Card className="text-center py-12">
            {generating ? (
              <div>
                <Loader2 size={48} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--module-caio)' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Generating AI Analysis...</h3>
                <p className="text-[13px] max-w-md mx-auto" style={{ color: 'var(--text-tertiary)' }}>
                  Claude Opus is analyzing your domain scores and generating executive findings, risk assessments, and phased action items. This may take a moment.
                </p>
              </div>
            ) : generated ? (
              <div className="text-left max-w-xl mx-auto">
                <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>Analysis Complete</h3>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{generated.executiveSummary?.substring(0, 300)}...</p>
                <div className="flex gap-4 justify-center mt-4">
                  <Badge variant="brand">Maturity: {generated.maturityLevel} \u2014 {generated.maturityLabel}</Badge>
                  <Badge variant="info">{generated.findings?.length || 0} Findings</Badge>
                  <Badge variant="success">{generated.actionItems?.length || 0} Actions</Badge>
                </div>
              </div>
            ) : (
              <div>
                <Sparkles size={48} className="mx-auto mb-4" style={{ color: 'var(--module-caio)' }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Ready for AI Analysis</h3>
                <p className="text-[13px] max-w-md mx-auto mb-6" style={{ color: 'var(--text-tertiary)' }}>
                  Claude Opus will analyze your 12-domain scores and generate executive findings, severity assessments, and phased action items.
                </p>
                <Button onClick={handleGenerate} disabled={!initiativeName.trim()}>
                  <Sparkles size={16} /> Generate Assessment
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft size={16} /> Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !initiativeName.trim()}>
            Next <ChevronRight size={16} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
