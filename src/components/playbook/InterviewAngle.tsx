import { MessageSquare } from 'lucide-react';

interface InterviewAngleProps {
  angle: string;
}

export default function InterviewAngle({ angle }: InterviewAngleProps) {
  if (!angle) return null;

  return (
    <div
      className="rounded-[var(--radius-lg)] p-6"
      style={{
        background: 'var(--brand-soft)',
        border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={16} style={{ color: 'var(--brand-primary)' }} />
        <span
          className="text-[10px] font-bold tracking-[2px] uppercase"
          style={{ color: 'var(--brand-primary)' }}
        >
          CAIO Interview Angle
        </span>
      </div>
      <p className="text-[14px] leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
        &ldquo;{angle}&rdquo;
      </p>
    </div>
  );
}
