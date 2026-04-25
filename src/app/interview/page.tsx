import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import InterviewAngle from '@/components/playbook/InterviewAngle';

export const revalidate = 30;

export default async function InterviewPage() {
  const phases = await prisma.playbookPhase.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { phaseNum: true, name: true, icon: true, interviewAngle: true },
  });

  return (
    <div className="animate-fade-in">
      <div className="eyebrow mb-4">CAIO Preparation</div>
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
        Interview <span className="font-light italic" style={{ color: 'var(--module-caio)' }}>Angles</span>
      </h1>
      <p className="text-[15px] max-w-[640px] mb-8" style={{ color: 'var(--text-tertiary)' }}>
        CAIO-level articulation for each deployment phase. Use these to frame conversations with executives and stakeholders.
      </p>

      <div className="space-y-6">
        {phases.map((phase) => (
          <div key={phase.phaseNum}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{phase.icon}</span>
              <h2 className="text-lg font-bold tracking-tight">
                Phase {phase.phaseNum}: {phase.name}
              </h2>
            </div>
            {phase.interviewAngle && (
              <InterviewAngle angle={phase.interviewAngle} />
            )}
          </div>
        ))}
      </div>

      <Card className="mt-10">
        <h2 className="text-lg font-bold tracking-tight mb-4">Cross-Cutting Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How do you measure agent ROI?', a: 'We track cost per task versus manual baseline, task completion rate, error rate reduction, and time-to-resolution improvement. ROI is calculated quarterly against the total cost of orchestration, monitoring, and governance.' },
            { q: 'What is your governance framework?', a: 'We use TRiSM (Trust, Risk, Security Management) with seven trust layers scored per deployment. Every agent gets a governance assessment at inception, quarterly reviews, and incident-triggered reassessments.' },
            { q: 'How do you handle agent failures?', a: 'Defense in depth: circuit breakers prevent cascading failures, graceful degradation falls back to manual processes, kill switches allow immediate shutdown, and post-mortem analysis feeds back into evaluation datasets.' },
            { q: 'What is your model tiering strategy?', a: 'We use Opus for complex governance and strategic analysis, Sonnet for advisory and generation tasks, and Haiku for classification, routing, and high-volume extraction. This optimizes cost without sacrificing quality where it matters.' },
          ].map((item, i) => (
            <div key={i} className="border-l-2 pl-4" style={{ borderColor: 'var(--module-caio)' }}>
              <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.q}</p>
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
