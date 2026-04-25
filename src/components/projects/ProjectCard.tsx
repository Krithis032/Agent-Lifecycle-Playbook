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

const statusVariant: Record<string, 'success' | 'warning' | 'brand' | 'default'> = {
  active: 'success',
  paused: 'warning',
  completed: 'brand',
  archived: 'default',
};

const statusTip: Record<string, string> = {
  active: 'Project is currently being worked on',
  paused: 'Project is temporarily paused',
  completed: 'Project has been fully deployed',
  archived: 'Project is archived and read-only',
};

const frameworkTip: Record<string, string> = {
  langgraph: 'LangGraph — Graph-based agent orchestration by LangChain',
  crewai: 'CrewAI — Role-based multi-agent framework',
  ag2: 'AG2 (AutoGen) — Microsoft multi-agent conversation framework',
  claude_sdk: 'Claude Agent SDK — Anthropic native agent toolkit',
  semantic_kernel: 'Semantic Kernel — Microsoft enterprise AI framework',
  phidata: 'Phidata — Production-ready AI assistant framework',
};

const patternTip: Record<string, string> = {
  single_agent: 'Single Agent — One agent handles all tasks',
  pipeline: 'Pipeline — Sequential multi-step agent chain',
  supervisor_workers: 'Supervisor-Workers — Central agent delegates to specialists',
  swarm: 'Swarm — Collaborative agents coordinate peer-to-peer',
  hierarchical: 'Hierarchical — Tree-structured agent delegation',
};

export default function ProjectCard({
  id, name, status, framework, architecturePattern, currentPhase, gateCompletion,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} title={`Click to open project: ${name}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{name}</h3>
          <span title={statusTip[status] || `Status: ${status}`}>
            <Badge variant={statusVariant[status] || 'default'}>{status}</Badge>
          </span>
        </div>
        {currentPhase && (
          <p className="text-[13px] mb-2" style={{ color: 'var(--text-tertiary)' }} title={`Current lifecycle phase: ${currentPhase.name}`}>
            {currentPhase.icon} {currentPhase.name}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {framework && (
            <span title={frameworkTip[framework] || `Framework: ${framework}`}>
              <Badge variant="info">{framework}</Badge>
            </span>
          )}
          {architecturePattern && (
            <span title={patternTip[architecturePattern] || `Architecture: ${architecturePattern}`}>
              <Badge variant="info">{architecturePattern}</Badge>
            </span>
          )}
        </div>
        <span title={`${gateCompletion}% of lifecycle phase gates completed`}>
          <Progress value={gateCompletion} label="Gate Completion" color="var(--module-projects)" size="sm" />
        </span>
      </Card>
    </Link>
  );
}
