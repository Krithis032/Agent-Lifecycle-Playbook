'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TrustLayerForm from '@/components/governance/TrustLayerForm';
import WhartonDomainForm from '@/components/governance/WhartonDomainForm';
import ComplianceChecklist from '@/components/governance/ComplianceChecklist';
import { TRUST_LAYERS, WHARTON_DOMAINS, COMPLIANCE_FRAMEWORKS } from '@/lib/governance-constants';
import type { TrustLayerScore, WhartonDomainInput, ComplianceCheck, RiskItemInput } from '@/types/governance';
import { ChevronLeft, ChevronRight, Check, Shield, AlertTriangle } from 'lucide-react';

const STEPS = [
  'Project & Type',
  'Trust Layers (7)',
  'Wharton Domains (10)',
  'Compliance',
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

export default function GovernanceAssessPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState<number>(0);
  const [assessmentType, setAssessmentType] = useState<'initial' | 'periodic' | 'incident'>('initial');

  // Step 2
  const [trustScores, setTrustScores] = useState<TrustLayerScore[]>(initTrustScores());

  // Step 3
  const [whartonDomains, setWhartonDomains] = useState<WhartonDomainInput[]>(initWhartonDomains());

  // Step 4
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>(initCompliance());

  // Step 5
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

  const addRisk = () => {
    if (!newRisk.title.trim()) return;
    setRiskItems(prev => [...prev, { ...newRisk }]);
    setNewRisk({ category: 'data', severity: 'medium', title: '', description: '', mitigation: '' });
  };

  const removeRisk = (index: number) => {
    setRiskItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate overall score
  const trustAvg = trustScores.reduce((s, t) => s + t.score, 0) / trustScores.length;
  const whartonAvg = whartonDomains.reduce((s, d) => s + d.overallScore, 0) / whartonDomains.length;
  const overallScore = Math.round(((trustAvg / 10) * 0.5 + whartonAvg * 0.5) * 100) / 10;

  // Risk classification
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">New Governance Assessment</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">Complete the TRiSM assessment across all governance layers.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                i === step
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                  : i < step
                  ? 'bg-[var(--success-soft)] text-[var(--success)]'
                  : 'text-[var(--text-4)] hover:bg-[var(--surface)]'
              }`}
            >
              {i < step ? <Check size={14} /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[var(--text-4)] mx-1 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {step === 0 && (
          <Card>
            <h2 className="text-[15px] font-semibold mb-4">Select Project & Assessment Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-[var(--text-2)] block mb-1">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value={0}>— Select Project —</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[var(--text-2)] block mb-1">Assessment Type</label>
                <div className="flex gap-2">
                  {(['initial', 'periodic', 'incident'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setAssessmentType(t)}
                      className={`px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-bold transition-colors ${
                        assessmentType === t
                          ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                          : 'bg-[var(--surface)] text-[var(--text-3)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
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
          <div className="space-y-4">
            <Card>
              <h2 className="text-[15px] font-bold mb-4">Add Risk Items</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={newRisk.category} onChange={(e) => setNewRisk(p => ({ ...p, category: e.target.value as RiskItemInput['category'] }))} className="px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none">
                  {['data', 'model', 'security', 'compliance', 'operational', 'ethical'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <select value={newRisk.severity} onChange={(e) => setNewRisk(p => ({ ...p, severity: e.target.value as RiskItemInput['severity'] }))} className="px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none">
                  {['low', 'medium', 'high', 'critical'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <input type="text" placeholder="Risk title..." value={newRisk.title} onChange={(e) => setNewRisk(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none mb-2" />
              <textarea rows={2} placeholder="Description..." value={newRisk.description} onChange={(e) => setNewRisk(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-[13px] bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none resize-none mb-2" />
              <Button size="sm" onClick={addRisk} disabled={!newRisk.title.trim()}>
                <AlertTriangle size={14} /> Add Risk
              </Button>
            </Card>

            {riskItems.length > 0 && (
              <div className="space-y-2">
                {riskItems.map((r, i) => (
                  <Card key={i} padding="sm" className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-medium text-[var(--text)]">{r.title}</span>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant={r.severity === 'critical' ? 'error' : r.severity === 'high' ? 'warning' : 'default'}>{r.severity}</Badge>
                        <Badge variant="accent">{r.category}</Badge>
                      </div>
                    </div>
                    <button onClick={() => removeRisk(i)} className="text-[var(--text-4)] hover:text-[var(--error)] text-sm">✕</button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <Card>
            <h2 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <Shield size={18} className="text-[var(--accent)]" /> Assessment Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-[var(--surface)] rounded-[var(--radius-sm)]">
                <div className="text-2xl font-bold text-[var(--accent)]">{overallScore}</div>
                <div className="text-[11px] text-[var(--text-3)]">Overall Score</div>
              </div>
              <div className="text-center p-3 bg-[var(--surface)] rounded-[var(--radius-sm)]">
                <div className="text-2xl font-bold text-[var(--text)]">{trustAvg.toFixed(1)}</div>
                <div className="text-[11px] text-[var(--text-3)]">Trust Avg (/10)</div>
              </div>
              <div className="text-center p-3 bg-[var(--surface)] rounded-[var(--radius-sm)]">
                <div className="text-2xl font-bold text-[var(--text)]">{(whartonAvg * 100).toFixed(0)}%</div>
                <div className="text-[11px] text-[var(--text-3)]">Wharton Avg</div>
              </div>
              <div className="text-center p-3 bg-[var(--surface)] rounded-[var(--radius-sm)]">
                <Badge variant={getRiskClass() === 'low' ? 'success' : getRiskClass() === 'critical' ? 'error' : 'warning'} className="text-[14px]">
                  {getRiskClass().toUpperCase()}
                </Badge>
                <div className="text-[11px] text-[var(--text-3)] mt-1">Risk Level</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="font-semibold text-[var(--text-2)]">Compliance Checks: </span>
                <span className="text-[var(--text-3)]">{complianceChecks.filter(c => c.status === 'compliant').length} compliant / {complianceChecks.length} total</span>
              </div>
              <div>
                <span className="font-semibold text-[var(--text-2)]">Risk Items: </span>
                <span className="text-[var(--text-3)]">{riskItems.length} identified</span>
              </div>
            </div>
          </Card>
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
