import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface PhaseCardProps {
  slug: string;
  phaseNum: number;
  name: string;
  icon: string;
  duration: string;
  subtitle: string;
  stepCount: number;
  gateCheckCount: number;
  color: string;
}

export default function PhaseCard({
  slug, phaseNum, name, icon, duration, subtitle, stepCount, gateCheckCount, color,
}: PhaseCardProps) {
  return (
    <Link href={`/playbook/${slug}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <span
            className="text-[9px] font-extrabold tracking-[2.5px] uppercase"
            style={{ color }}
          >
            Phase {phaseNum}
          </span>
        </div>
        <h3 className="text-[15px] font-bold tracking-tight mb-2 text-[var(--text)]">
          {name}
        </h3>
        <p className="text-[13px] text-[var(--text-3)] mb-4 line-clamp-2">
          {subtitle}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="accent">{duration}</Badge>
          <Badge>{stepCount} steps</Badge>
          <Badge variant="green">{gateCheckCount} gates</Badge>
        </div>
      </Card>
    </Link>
  );
}
