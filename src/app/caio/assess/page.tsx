'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
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
    fetch('/api/projects')
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
      const res = await fetch('/api/caio/assess', {
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

  const scoreLabels = ['', '1 — Ad Hoc', '2 — Initial', '3 — Defined', '4 — Managed', '5 — Optimized'];
  const avgScore = domains.reduce((s, d) => s + d.score, 0) / domains.length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">New CAIO Assessment</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">12-domain maturity assessment with AI-generated findings.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => i < 2 && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                i === step
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                  : i < step
                  ? 'bg-[var(--success-soft)] text-[var(--success)]'
                  : 'text-[var(--text-4)]'
              }`}
            >
              {i < step ? <Check size={14} /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[var(--text-4)] mx-1 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mb-6">
        {step === 0 && (
          <Card>
            <h2 className="text-[15px] font-bold mb-4">Assessment Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-[var(--text-2)] block mb-1">Initiative Name *</label>
                <input
                  type="text"
                  value={initiativeName}
                  onChange={(e) => setInitiativeName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="e.g., Customer Support AI Agent"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[var(--text-2)] block mb-1">Assessment Mode</label>
                <div className="flex gap-2">
                  {[
                    { value: 'audit', label: 'Audit', desc: 'Guided questionnaire' },
                    { value: 'design', label: 'Design', desc: 'Proactive for new initiatives' },
                    { value: 'folder_analysis', label: 'Folder Analysis', desc: 'Scan project artifacts' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setAssessmentMode(m.value as typeof assessmentMode)}
                      className={`flex-1 p-3 rounded-[var(--radius-sm)] text-left transition-colors ${
                        assessmentMode === m.value
                          ? 'bg-[var(--accent-soft)] border-2 border-[var(--accent)]'
                          : 'bg-[var(--surface)] border-2 border-transparent hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <div className="text-[13px] font-bold">{m.label}</div>
                      <div className="text-[11px] text-[var(--text-3)]">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-[var(--text-2)] block mb-1">Linked Project (optional)</label>
                  <select
                    value={projectId || ''}
                    onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[var(--text-2)] block mb-1">Target Maturity Level</label>
                  <select
                    value={targetMaturity}
                    onChange={(e) => setTargetMaturity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(l => (
                      <option key={l} value={l}>{l} — {scoreLabels[l]?.split(' — ')[1]}</option>
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
              <span className="text-[13px] font-semibold text-[var(--text-2)]">Avg Score:</span>
              <span className="text-xl font-bold text-[var(--accent)]">{avgScore.toFixed(1)}/5</span>
              <Badge variant={avgScore >= 4 ? 'success' : avgScore >= 3 ? 'info' : avgScore >= 2 ? 'warning' : 'error'}>
                {scoreLabels[Math.round(avgScore)]?.split(' — ')[1] || 'Unknown'}
              </Badge>
            </Card>

            {CAIO_DOMAIN_GROUPS.map(group => (
              <div key={group}>
                <h3 className="text-[13px] font-bold text-[var(--text)] uppercase tracking-wider mb-3">{group}</h3>
                <div className="space-y-4">
                  {CAIO_DOMAINS.filter(d => d.group === group).map((domain) => {
                    const di = domains.findIndex(d => d.domainKey === domain.key);
                    const d = domains[di];
                    return (
                      <div key={domain.key} className="border border-[var(--border)] rounded-[var(--radius-sm)] p-5 bg-[var(--surface)]">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-[14px] font-bold text-[var(--text)]">{domain.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {domain.frameworks.map((f, fi) => (
                                <span key={fi} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-4)]">{f}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-[var(--accent)]">{d.score.toFixed(1)}</span>
                            <span className="text-[12px] text-[var(--text-4)]">/5</span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {domain.questions.map((q, qi) => (
                            <div key={qi} className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-3">
                              <p className="text-[12px] text-[var(--text-2)] mb-2">{q}</p>
                              <div className="flex gap-1.5 mb-2">
                                {[1, 2, 3, 4, 5].map(score => (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() => updateQuestion(di, qi, 'score', score)}
                                    className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold transition-colors ${
                                      d.questionScores[qi]?.score === score
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-3)] hover:border-[var(--accent)]'
                                    }`}
                                  >
                                    {score}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={d.questionScores[qi]?.evidence || ''}
                                onChange={(e) => updateQuestion(di, qi, 'evidence', e.target.value)}
                                className="w-full px-2 py-1 border border-[var(--border)] rounded-[var(--radius-sm)] text-[12px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
                                placeholder="Evidence / notes..."
                              />
                            </div>
                          ))}
                        </div>

                        <textarea
                          rows={2}
                          value={d.currentState}
                          onChange={(e) => updateDomainField(di, 'currentState', e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none resize-none mt-3"
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
                <Loader2 size={48} className="mx-auto mb-4 text-[var(--accent)] animate-spin" />
                <h3 className="text-lg font-bold mb-2">Generating AI Analysis...</h3>
                <p className="text-[13px] text-[var(--text-3)] max-w-md mx-auto">
                  Claude Opus is analyzing your domain scores and generating executive findings, risk assessments, and phased action items. This may take a moment.
                </p>
              </div>
            ) : generated ? (
              <div className="text-left max-w-xl mx-auto">
                <h3 className="text-lg font-bold mb-4 text-center">✅ Analysis Complete</h3>
                <p className="text-[13px] text-[var(--text-2)]">{generated.executiveSummary?.substring(0, 300)}...</p>
                <div className="flex gap-4 justify-center mt-4">
                  <Badge variant="accent">Maturity: {generated.maturityLevel} — {generated.maturityLabel}</Badge>
                  <Badge variant="info">{generated.findings?.length || 0} Findings</Badge>
                  <Badge variant="success">{generated.actionItems?.length || 0} Actions</Badge>
                </div>
              </div>
            ) : (
              <div>
                <Sparkles size={48} className="mx-auto mb-4 text-[var(--accent)]" />
                <h3 className="text-lg font-bold mb-2">Ready for AI Analysis</h3>
                <p className="text-[13px] text-[var(--text-3)] max-w-md mx-auto mb-6">
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
