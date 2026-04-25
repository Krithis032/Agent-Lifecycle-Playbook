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
    <Link href={`/playbook/${slug}`} className="block group">
      <Card hover className="relative overflow-hidden">
        {/* Left accent border */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[12px]"
          style={{ background: color }}
        />

        <div className="pl-3">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{icon}</span>
            <span
              className="text-[10px] font-bold tracking-[2px] uppercase"
              style={{ color }}
            >
              Phase {phaseNum}
            </span>
          </div>
          <h3
            className="text-[15px] font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </h3>
          <p
            className="text-[13px] mb-4 line-clamp-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {subtitle}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="brand">{duration}</Badge>
            <Badge>{stepCount} steps</Badge>
            <Badge variant="success">{gateCheckCount} gates</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
