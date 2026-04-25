'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import SectionPanel from '@/components/ui/SectionPanel';
import TrustLayerForm from '@/components/governance/TrustLayerForm';
import WhartonDomainForm from '@/components/governance/WhartonDomainForm';
import ComplianceChecklist from '@/components/governance/ComplianceChecklist';
import PeriodicTableGrid from '@/components/governance/PeriodicTableGrid';
import ElementScoringForm from '@/components/governance/ElementScoringForm';
import { TRUST_LAYERS, WHARTON_DOMAINS, COMPLIANCE_FRAMEWORKS } from '@/lib/governance-constants';
import { PERIODIC_TABLE_CATEGORIES, CATEGORY_WEIGHTS, classifyRisk } from '@/lib/periodic-table-constants';
import type { PeriodicElement } from '@/lib/periodic-table-constants';
import type { TrustLayerScore, WhartonDomainInput, ComplianceCheck, RiskItemInput, PeriodicCategoryScore } from '@/types/governance';
import { ChevronLeft, ChevronRight, Check, Shield, AlertTriangle, Grid3X3 } from 'lucide-react';

const STEPS = [
  'Project & Type',
  'Trust Layers (7)',
  'Wharton Domains (10)',
  'Compliance',
  'Periodic Table (36)',
  'Risk Items',
  'Review & Submit',
];

interface ProjectOption {
  id: number;
  name: string;
}

function initTrustScores(): TrustLayerScore[] {
  return TRUST_LAYERS.map(l => ({
    layerNum: l.num,
    layerName: l.name,
    slug: l.slug,
    score: 5,
    evidence: '',
    gaps: [],
    riskLevel: 'medium' as const,
  }));
}

function initWhartonDomains(): WhartonDomainInput[] {
  return WHARTON_DOMAINS.map(d => ({
    domainKey: d.key,
    domainName: d.name,
    questions: d.questions.map(q => ({ question: q, score: 2, evidence: '' })),
    overallScore: 0.67,
    riskLevel: 'medium' as const,
    currentState: '',
    gaps: [],
    actions: [],
  }));
}

function initCompliance(): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  for (const fw of COMPLIANCE_FRAMEWORKS) {
    for (const req of fw.requirements) {
      checks.push({
        framework: fw.framework,
        requirement: req,
        status: 'not_applicable',
        notes: '',
      });
    }
  }
  return checks;
}

function initPeriodicTable(): PeriodicCategoryScore[] {
  return PERIODIC_TABLE_CATEGORIES.map(cat => ({
    categoryId: cat.id,
    categoryName: cat.name,
    weight: cat.weight,
    avgScore: 0,
    percentage: 0,
    elementScores: cat.elements.map(el => ({
      code: el.code,
      score: 0,
      notes: '',
      checklist: new Array(el.implementationChecklist.length).fill(false),
    })),
  }));
}

function calcPeriodicTableScore(categories: PeriodicCategoryScore[]): { weightedScore: number; riskLabel: string } {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const cat of categories) {
    const w = CATEGORY_WEIGHTS[cat.categoryId] || 0;
    totalWeight += w;
    weightedSum += cat.percentage * w;
  }
  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const risk = classifyRisk(weightedScore);
  return { weightedScore, riskLabel: risk.label };
}

export default function GovernanceAssessPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0: Project & Type
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState<number>(0);
  const [assessmentType, setAssessmentType] = useState<'initial' | 'periodic' | 'incident'>('initial');

  // Step 1: Trust Layers
  const [trustScores, setTrustScores] = useState<TrustLayerScore[]>(initTrustScores());

  // Step 2: Wharton Domains
  const [whartonDomains, setWhartonDomains] = useState<WhartonDomainInput[]>(initWhartonDomains());

  // Step 3: Compliance
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>(initCompliance());

  // Step 4: Periodic Table
  const [ptCategories, setPtCategories] = useState<PeriodicCategoryScore[]>(initPeriodicTable());
  const [activeElement, setActiveElement] = useState<{ element: PeriodicElement; categoryId: string } | null>(null);

  // Step 5: Risk Items
  const [riskItems, setRiskItems] = useState<RiskItemInput[]>([]);
  const [newRisk, setNewRisk] = useState<RiskItemInput>({
    category: 'data', severity: 'medium', title: '', description: '', mitigation: '',
  });

  // Load projects
  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data.map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })) : []))
      .catch(() => {});
  }, []);

  // Check URL params for pre-selected project
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('projectId');
    if (pid) setProjectId(parseInt(pid));
  }, []);

  // Periodic table helpers
  const updateElementScore = (categoryId: string, code: string, field: string, value: unknown) => {
    setPtCategories(prev => {
      const updated = prev.map(cat => {
        if (cat.categoryId !== categoryId) return cat;
        const newScores = cat.elementScores.map(es => {
          if (es.code !== code) return es;
          return { ...es, [field]: value };
        });
        const avgScore = newScores.reduce((s, e) => s + e.score, 0) / newScores.length;
        return { ...cat, elementScores: newScores, avgScore, percentage: (avgScore / 4) * 100 };
      });
      return updated;
    });
  };

  const handleElementClick = (element: PeriodicElement, categoryId: string) => {
    setActiveElement({ element, categoryId });
  };

  const handleCloseElement = () => {
    setActiveElement(null);
  };

  // Risk helpers
  const addRisk = () => {
    if (!newRisk.title.trim()) return;
    setRiskItems(prev => [...prev, { ...newRisk }]);
    setNewRisk({ category: 'data', severity: 'medium', title: '', description: '', mitigation: '' });
  };

  const removeRisk = (index: number) => {
    setRiskItems(prev => prev.filter((_, i) => i !== index));
  };

  // Scores
  const trustAvg = trustScores.reduce((s, t) => s + t.score, 0) / trustScores.length;
  const whartonAvg = whartonDomains.reduce((s, d) => s + d.overallScore, 0) / whartonDomains.length;
  const ptResult = calcPeriodicTableScore(ptCategories);
  const overallScore = Math.round(((trustAvg / 10) * 0.35 + whartonAvg * 0.35 + (ptResult.weightedScore / 100) * 0.30) * 100) / 10;

  const getRiskClass = () => {
    if (overallScore >= 8) return 'low';
    if (overallScore >= 6) return 'medium';
    if (overallScore >= 4) return 'high';
    return 'critical';
  };

  const handleSubmit = async () => {
    if (!projectId) return alert('Please select a project');
    setSaving(true);
    try {
      const res = await fetch('/api/governance/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          assessmentType,
          trustLayerScores: trustScores,
          whartonDomains,
          complianceChecks,
          periodicTableScores: ptCategories,
          riskClassification: getRiskClass(),
          riskItems,
          overallScore,
          notes: '',
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const result = await res.json();
      router.push(`/governance/${result.id}`);
    } catch (err) {
      alert('Failed to save assessment. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <PageHeader
        eyebrow="GOVERNANCE"
        title="New Governance Assessment"
        subtitle="Complete the TRiSM assessment across all governance layers."
      />

      {/* Progress Steps */}
      <div className="mb-8">
        {/* Connected progress track */}
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
              onClick={() => setStep(i)}
              className="relative z-10 flex flex-col items-center gap-1.5 group"
              style={{ cursor: 'pointer' }}
            >
              {/* Step circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0"
                style={{
                  background: i === step
                    ? 'var(--brand-primary)'
                    : i < step
                    ? 'var(--status-success)'
                    : 'var(--surface-elevated)',
                  color: i <= step
                    ? 'white'
                    : 'var(--text-quaternary)',
                  border: i > step ? '2px solid var(--border-default)' : 'none',
                  boxShadow: i === step ? '0 0 0 3px var(--brand-soft)' : 'none',
                }}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              {/* Step label */}
              <span
                className="text-[10px] font-semibold text-center leading-tight max-w-[72px]"
                style={{
                  color: i === step
                    ? 'var(--brand-primary)'
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

      {/* Step Content */}
      <div className="mb-6">
        {step === 0 && (
          <SectionPanel title="Select Project & Assessment Type" icon={Shield}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option value={0}>-- Select Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Assessment Type</label>
                <div className="flex gap-2">
                  {(['initial', 'periodic', 'incident'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setAssessmentType(t)}
                      className="px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-bold transition-colors"
                      style={{
                        background: assessmentType === t ? 'var(--brand-primary)' : 'var(--surface-0)',
                        color: assessmentType === t ? 'white' : 'var(--text-tertiary)',
                        border: assessmentType === t ? 'none' : '1px solid var(--border-default)',
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionPanel>
        )}

        {step === 1 && (
          <TrustLayerForm scores={trustScores} onChange={setTrustScores} />
        )}

        {step === 2 && (
          <WhartonDomainForm domains={whartonDomains} onChange={setWhartonDomains} />
        )}

        {step === 3 && (
          <ComplianceChecklist checks={complianceChecks} onChange={setComplianceChecks} />
        )}

        {step === 4 && (
          <div className="space-y-6">
            <SectionPanel title="AI Governance Periodic Table" icon={Grid3X3}>
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Score each of the 36 governance elements on a 0-4 maturity scale. Click any element tile to score it and complete its implementation checklist.
              </p>
              <PeriodicTableGrid
                categoryScores={ptCategories}
                onElementClick={handleElementClick}
                weightedScore={ptResult.weightedScore}
              />
            </SectionPanel>

            {activeElement && (() => {
              const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.id === activeElement.categoryId);
              const catScore = ptCategories.find(c => c.categoryId === activeElement.categoryId);
              const elScore = catScore?.elementScores.find(e => e.code === activeElement.element.code);
              if (!cat || !elScore) return null;
              return (
                <ElementScoringForm
                  element={activeElement.element}
                  categoryColor={cat.color}
                  categoryName={cat.name}
                  score={elScore}
                  onScoreChange={(score) => updateElementScore(activeElement.categoryId, activeElement.element.code, 'score', score)}
                  onNotesChange={(notes) => updateElementScore(activeElement.categoryId, activeElement.element.code, 'notes', notes)}
                  onChecklistToggle={(idx) => {
                    const newChecklist = [...elScore.checklist];
                    newChecklist[idx] = !newChecklist[idx];
                    updateElementScore(activeElement.categoryId, activeElement.element.code, 'checklist', newChecklist);
                  }}
                  onClose={handleCloseElement}
                />
              );
            })()}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <SectionPanel title="Add Risk Items" icon={AlertTriangle}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={newRisk.category}
                  onChange={(e) => setNewRisk(p => ({ ...p, category: e.target.value as RiskItemInput['category'] }))}
                  className="px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {['data', 'model', 'security', 'compliance', 'operational', 'ethical'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <select
                  value={newRisk.severity}
                  onChange={(e) => setNewRisk(p => ({ ...p, severity: e.target.value as RiskItemInput['severity'] }))}
                  className="px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {['low', 'medium', 'high', 'critical'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Risk title..."
                value={newRisk.title}
                onChange={(e) => setNewRisk(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2 mb-2"
                style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <textarea
                rows={2}
                placeholder="Description..."
                value={newRisk.description}
                onChange={(e) => setNewRisk(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2 resize-none mb-2"
                style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <Button size="sm" onClick={addRisk} disabled={!newRisk.title.trim()}>
                <AlertTriangle size={14} /> Add Risk
              </Button>
            </SectionPanel>

            {riskItems.length > 0 && (
              <div className="space-y-2">
                {riskItems.map((r, i) => (
                  <Card key={i} padding="sm" className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant={r.severity === 'critical' ? 'error' : r.severity === 'high' ? 'warning' : 'default'}>{r.severity}</Badge>
                        <Badge variant="brand">{r.category}</Badge>
                      </div>
                    </div>
                    <button onClick={() => removeRisk(i)} className="text-sm transition-colors" style={{ color: 'var(--text-quaternary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--status-error)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}>Remove</button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <SectionPanel title="Assessment Summary" icon={Shield}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--surface-0)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--module-governance)' }}>{overallScore}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Overall Score</div>
              </div>
              <div className="text-center p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--surface-0)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{trustAvg.toFixed(1)}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Trust Avg (/10)</div>
              </div>
              <div className="text-center p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--surface-0)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{(whartonAvg * 100).toFixed(0)}%</div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Wharton Avg</div>
              </div>
              <div className="text-center p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--surface-0)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{ptResult.weightedScore.toFixed(0)}%</div>
                <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Periodic Table</div>
              </div>
              <div className="text-center p-3 rounded-[var(--radius-sm)]" style={{ background: 'var(--surface-0)' }}>
                <Badge variant={getRiskClass() === 'low' ? 'success' : getRiskClass() === 'critical' ? 'error' : 'warning'} className="text-[14px]">
                  {getRiskClass().toUpperCase()}
                </Badge>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Risk Level</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[13px] mb-4">
              <div>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Compliance Checks: </span>
                <span style={{ color: 'var(--text-tertiary)' }}>{complianceChecks.filter(c => c.status === 'compliant').length} compliant / {complianceChecks.length} total</span>
              </div>
              <div>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Risk Items: </span>
                <span style={{ color: 'var(--text-tertiary)' }}>{riskItems.length} identified</span>
              </div>
            </div>

            {/* Periodic Table Category Summary */}
            <div className="mt-4">
              <h3 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Periodic Table by Category</h3>
              <div className="space-y-2">
                {ptCategories.map(cat => {
                  const catDef = PERIODIC_TABLE_CATEGORIES.find(c => c.id === cat.categoryId);
                  return (
                    <div key={cat.categoryId} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: catDef?.color }} />
                      <span className="text-[12px] font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{cat.categoryName}</span>
                      <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, background: catDef?.color }} />
                      </div>
                      <span className="text-[11px] font-bold w-10 text-right" style={{ color: catDef?.color }}>{cat.percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionPanel>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft size={16} /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}>
            Next <ChevronRight size={16} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving || !projectId}>
            {saving ? 'Saving...' : 'Submit Assessment'}
          </Button>
        )}
      </div>
    </div>
  );
}
