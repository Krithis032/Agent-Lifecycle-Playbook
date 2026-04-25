import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import PhaseProgress from './PhaseProgress';

interface ProjectDashboardProps {
  project: {
    name: string;
    status: string;
    framework: string | null;
    architecturePattern: string | null;
    description: string | null;
    currentPhase: { name: string; icon: string } | null;
  };
  phases: {
    phaseNum: number;
    name: string;
    icon: string;
    status: string;
    gateCompletion: number;
  }[];
}

export default function ProjectDashboard({ project, phases }: ProjectDashboardProps) {
  const completedPhases = phases.filter((p) => p.status === 'completed').length;
  const overallProgress = Math.round((completedPhases / phases.length) * 100);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{project.name}</h1>
          {project.description && (
            <p className="text-[14px] mt-1 max-w-[500px]" style={{ color: 'var(--text-tertiary)' }}>{project.description}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Badge variant={project.status === 'active' ? 'success' : 'default'}>{project.status}</Badge>
            {project.framework && <Badge variant="info">{project.framework}</Badge>}
            {project.architecturePattern && <Badge variant="info">{project.architecturePattern}</Badge>}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="text-[14px] font-bold mb-3">Phase Timeline</h2>
        <PhaseProgress phases={phases} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-[32px] font-bold leading-none" style={{ color: 'var(--brand-primary)' }}>{overallProgress}%</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-quaternary)' }}>Overall Progress</div>
        </Card>
        <Card>
          <div className="text-[32px] font-bold leading-none" style={{ color: '#15803d' }}>{completedPhases}/{phases.length}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-quaternary)' }}>Phases Complete</div>
        </Card>
        <Card>
          <div className="text-[32px] font-bold leading-none" style={{ color: '#6b3fa0' }}>
            {project.currentPhase?.icon || '--'}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-quaternary)' }}>
            {project.currentPhase?.name || 'Not started'}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <Card key={phase.phaseNum}>
            <div className="flex items-center gap-2 mb-2">
              <span>{phase.icon}</span>
              <span className="text-[13px] font-bold">{phase.name}</span>
            </div>
            <Badge variant={phase.status === 'completed' ? 'success' : phase.status === 'in_progress' ? 'brand' : 'default'}>
              {phase.status.replace('_', ' ')}
            </Badge>
            <div className="mt-3">
              <Progress value={phase.gateCompletion} label="Gates" color="var(--status-success)" size="sm" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
