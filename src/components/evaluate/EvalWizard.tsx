'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface WizardStep {
  label: string;
  description?: string;
}

interface EvalWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLastStep: boolean;
  onSubmit?: () => void;
  submitting?: boolean;
  children: ReactNode;
}

export default function EvalWizard({
  steps,
  currentStep,
  onBack,
  onNext,
  canProceed,
  isLastStep,
  onSubmit,
  submitting,
  children,
}: EvalWizardProps) {
  return (
    <div className="space-y-6">
      {/* Connected dot stepper */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, i) => {
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center" style={{ minWidth: 32 }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: isCurrent ? 'var(--module-evaluate)' : isComplete ? 'var(--status-success)' : 'var(--surface-1)',
                    color: isCurrent || isComplete ? '#fff' : 'var(--text-quaternary)',
                  }}
                >
                  {isComplete ? <Check size={14} /> : i + 1}
                </div>
                <span className="text-[10px] mt-1 text-center hidden sm:block" style={{ color: isCurrent ? 'var(--text-primary)' : 'var(--text-quaternary)', fontWeight: isCurrent ? 600 : 400 }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-10 h-0.5 mx-1" style={{ background: i < currentStep ? 'var(--status-success)' : 'var(--border-default)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{steps[currentStep].label}</h2>
        {steps[currentStep].description && (
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>{steps[currentStep].description}</p>
        )}
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-30"
          style={{ color: 'var(--text-secondary)', background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}
        >
          Back
        </button>
        {isLastStep ? (
          <button
            onClick={onSubmit}
            disabled={!canProceed || submitting}
            className="px-6 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
            style={{ background: 'var(--module-evaluate)' }}
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              'Save Evaluation'
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ background: 'var(--module-evaluate)' }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
