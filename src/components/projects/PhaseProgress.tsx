import Badge from '@/components/ui/Badge';

interface PhaseProgressProps {
  phases: {
    phaseNum: number;
    name: string;
    icon: string;
    status: string;
  }[];
}

const statusColors: Record<string, string> = {
  not_started: 'var(--text-quaternary)',
  in_progress: 'var(--module-projects)',
  completed: 'var(--status-success)',
  skipped: 'var(--text-quaternary)',
};

const statusVariant: Record<string, 'default' | 'brand' | 'success' | 'warning'> = {
  not_started: 'default',
  in_progress: 'brand',
  completed: 'success',
  skipped: 'default',
};

export default function PhaseProgress({ phases }: PhaseProgressProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {phases.map((phase, i) => (
        <div key={phase.phaseNum} className="flex items-center">
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
              style={{ borderColor: statusColors[phase.status] || 'var(--border-default)' }}
            >
              {phase.icon}
            </div>
            <span
              className="text-[10px] font-semibold text-center whitespace-nowrap"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {phase.name}
            </span>
            <Badge variant={statusVariant[phase.status] || 'default'}>
              {phase.status.replace('_', ' ')}
            </Badge>
          </div>
          {i < phases.length - 1 && (
            <div className="w-6 h-px mx-1" style={{ background: 'var(--border-default)' }} />
          )}
        </div>
      ))}
    </div>
  );
}
