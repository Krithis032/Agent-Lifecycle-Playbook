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
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">{project.name}</h1>
          {project.description && (
            <p className="text-[14px] text-[var(--text-3)] mt-1 max-w-[500px]">{project.description}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Badge variant={project.status === 'active' ? 'green' : 'default'}>{project.status}</Badge>
            {project.framework && <Badge variant="purple">{project.framework}</Badge>}
            {project.architecturePattern && <Badge variant="cyan">{project.architecturePattern}</Badge>}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="text-[14px] font-bold mb-3">Phase Timeline</h2>
        <PhaseProgress phases={phases} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-[32px] font-extrabold text-[var(--accent)] leading-none">{overallProgress}%</div>
          <div className="text-[11px] font-semibold text-[var(--text-4)] uppercase tracking-wider mt-1">Overall Progress</div>
        </Card>
        <Card>
          <div className="text-[32px] font-extrabold text-[var(--green)] leading-none">{completedPhases}/{phases.length}</div>
          <div className="text-[11px] font-semibold text-[var(--text-4)] uppercase tracking-wider mt-1">Phases Complete</div>
        </Card>
        <Card>
          <div className="text-[32px] font-extrabold text-[var(--purple)] leading-none">
            {project.currentPhase?.icon || '--'}
          </div>
          <div className="text-[11px] font-semibold text-[var(--text-4)] uppercase tracking-wider mt-1">
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
            <Badge variant={phase.status === 'completed' ? 'green' : phase.status === 'in_progress' ? 'accent' : 'default'}>
              {phase.status.replace('_', ' ')}
            </Badge>
            <div className="mt-3">
              <Progress value={phase.gateCompletion} label="Gates" color="var(--green)" size="sm" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
