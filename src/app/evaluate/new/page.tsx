'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import EvalWizard from '@/components/evaluate/EvalWizard';
import EvalTypeSelector from '@/components/evaluate/EvalTypeSelector';
import OptionConfigurator from '@/components/evaluate/OptionConfigurator';
import CriteriaConfigurator from '@/components/evaluate/CriteriaConfigurator';
import ScoreMatrix from '@/components/evaluate/ScoreMatrix';
import EvalResults from '@/components/evaluate/EvalResults';
import PageHeader from '@/components/ui/PageHeader';
import { calculateEvalWeightedScores, generateRecommendation } from '@/lib/scoring';
import type { EvalType, EvalOption, EvalCriterion, EvalScore, EvalPreset } from '@/types/evaluation';
import { FRAMEWORK_EVAL_CRITERIA, ARCHITECTURE_EVAL_CRITERIA } from '@/types/evaluation';

const STEPS = [
  { label: 'Choose Type', description: 'Select the type of evaluation to perform.' },
  { label: 'Configure Options', description: 'Define the items being compared.' },
  { label: 'Set Criteria', description: 'Define weighted criteria for evaluation.' },
  { label: 'Score', description: 'Score each option against each criterion (1-5).' },
  { label: 'Results', description: 'Review results and save.' },
];

function NewEvaluationPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [evalType, setEvalType] = useState<EvalType | null>(null);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<EvalOption[]>([]);
  const [criteria, setCriteria] = useState<EvalCriterion[]>([]);
  const [scores, setScores] = useState<EvalScore[]>([]);
  const [presets, setPresets] = useState<EvalPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-select type from URL param
  useEffect(() => {
    const type = searchParams.get('type') as EvalType | null;
    if (type && ['framework', 'architecture', 'model_tier', 'custom'].includes(type)) {
      setEvalType(type);
    }
  }, [searchParams]);

  const loadFrameworks = useCallback(async () => {
    const res = await fetchWithAuth('/api/evaluate/frameworks');
    const data = await res.json();
    setOptions(data.map((f: Record<string, string>) => ({
      key: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: f.name,
      description: f.best_for,
    })));
    setCriteria(FRAMEWORK_EVAL_CRITERIA);
    setTitle('Framework Selection');
  }, []);

  const loadPatterns = useCallback(async () => {
    const res = await fetchWithAuth('/api/evaluate/patterns');
    const data = await res.json();
    setOptions(data.map((p: Record<string, string>) => ({
      key: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: p.name,
      description: p.best_for,
    })));
    setCriteria(ARCHITECTURE_EVAL_CRITERIA);
    setTitle('Architecture Pattern Selection');
  }, []);

  const loadPresets = useCallback(async () => {
    const res = await fetchWithAuth('/api/evaluate/presets');
    const data = await res.json();
    setPresets(data);
  }, []);

  useEffect(() => {
    if (evalType === 'framework') loadFrameworks();
    else if (evalType === 'architecture') loadPatterns();
    else if (evalType === 'model_tier') loadPresets();
    else if (evalType === 'custom') {
      setOptions([]);
      setCriteria([]);
      setTitle('');
    }
  }, [evalType, loadFrameworks, loadPatterns, loadPresets]);

  const selectPreset = (slug: string) => {
    const preset = presets.find(p => p.slug === slug);
    if (!preset) return;
    setSelectedPreset(slug);
    setTitle(`${preset.name} Evaluation`);
    setCriteria(preset.dimensions.map(d => ({
      key: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: d.name,
      weight: d.weight,
      description: d.measurement,
      metric: d.metric,
    })));
    setOptions([
      { key: 'option_1', name: 'Option A', description: 'First option to evaluate' },
      { key: 'option_2', name: 'Option B', description: 'Second option to evaluate' },
    ]);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return evalType !== null && (evalType !== 'model_tier' || selectedPreset !== null);
      case 1: return options.length >= 2 && title.trim().length > 0;
      case 2: {
        const tw = criteria.reduce((s, c) => s + c.weight, 0);
        return criteria.length >= 3 && Math.abs(tw - 1.0) < 0.02;
      }
      case 3: {
        const expected = options.length * criteria.length;
        const filled = scores.filter(s => s.score > 0).length;
        return filled === expected;
      }
      case 4: return true;
      default: return false;
    }
  };

  const results = calculateEvalWeightedScores(options, criteria, scores);
  const rec = generateRecommendation(results);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetchWithAuth('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evalType, title, options, criteria, scores }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/evaluate/${data.id}`);
    } catch (e) {
      console.error('Submit error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <PageHeader
        eyebrow="Evaluate"
        title="New Evaluation"
        subtitle="Compare options across weighted criteria to make data-driven decisions."
      />

      <EvalWizard
        steps={STEPS}
        currentStep={step}
        onBack={() => setStep(s => Math.max(0, s - 1))}
        onNext={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
        canProceed={canProceed()}
        isLastStep={step === STEPS.length - 1}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        {/* Step 0: Choose Type */}
        {step === 0 && (
          <div className="space-y-6">
            <EvalTypeSelector selected={evalType} onSelect={setEvalType} />
            {evalType === 'model_tier' && presets.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Select a Preset</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => selectPreset(p.slug)}
                      className="text-left p-3 rounded-lg transition-all text-sm"
                      style={{
                        border: selectedPreset === p.slug ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        background: selectedPreset === p.slug ? 'var(--brand-soft)' : 'var(--surface-elevated)',
                      }}
                    >
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Configure Options */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Evaluation Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Q4 Framework Selection"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <OptionConfigurator options={options} onChange={setOptions} />
          </div>
        )}

        {/* Step 2: Set Criteria */}
        {step === 2 && <CriteriaConfigurator criteria={criteria} onChange={setCriteria} />}

        {/* Step 3: Score */}
        {step === 3 && (
          <ScoreMatrix options={options} criteria={criteria} scores={scores} onChange={setScores} />
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <EvalResults
            results={results}
            criteria={criteria}
            scores={scores}
            recommendation={rec.recommendation}
            rationale={rec.rationale}
          />
        )}
      </EvalWizard>
    </div>
  );
}

export default function NewEvaluationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>Loading...</div>}>
      <NewEvaluationPageInner />
    </Suspense>
  );
}
