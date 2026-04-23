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
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-[var(--accent)] text-white'
                  : isComplete
                    ? 'bg-[var(--success-soft)] text-[var(--success)]'
                    : 'bg-[var(--surface)] text-[var(--text-4)]'
              }`}>
                {isComplete ? (
                  <Check size={14} />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-0.5 ${i < currentStep ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-[var(--surface-active)] border border-[var(--border)] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[var(--text)] mb-1">{steps[currentStep].label}</h2>
        {steps[currentStep].description && (
          <p className="text-sm text-[var(--text-3)] mb-6">{steps[currentStep].description}</p>
        )}
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-semibold text-[var(--text-2)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors disabled:opacity-30"
        >
          Back
        </button>
        {isLastStep ? (
          <button
            onClick={onSubmit}
            disabled={!canProceed || submitting}
            className="px-6 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
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
            className="px-6 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
