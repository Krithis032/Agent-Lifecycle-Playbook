import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';

interface ProjectCardProps {
  id: number;
  name: string;
  status: string;
  framework: string | null;
  architecturePattern: string | null;
  currentPhase: { name: string; icon: string } | null;
  gateCompletion: number;
}

const statusVariant: Record<string, 'green' | 'amber' | 'accent' | 'default'> = {
  active: 'green',
  paused: 'amber',
  completed: 'accent',
  archived: 'default',
};

export default function ProjectCard({
  id, name, status, framework, architecturePattern, currentPhase, gateCompletion,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-[var(--text)]">{name}</h3>
          <Badge variant={statusVariant[status] || 'default'}>{status}</Badge>
        </div>
        {currentPhase && (
          <p className="text-[13px] text-[var(--text-3)] mb-2">
            {currentPhase.icon} {currentPhase.name}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {framework && <Badge variant="purple">{framework}</Badge>}
          {architecturePattern && <Badge variant="cyan">{architecturePattern}</Badge>}
        </div>
        <Progress value={gateCompletion} label="Gate Completion" color="var(--green)" size="sm" />
      </Card>
    </Link>
  );
}
