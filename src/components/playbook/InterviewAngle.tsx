import { MessageSquare } from 'lucide-react';

interface InterviewAngleProps {
  angle: string;
}

export default function InterviewAngle({ angle }: InterviewAngleProps) {
  if (!angle) return null;

  return (
    <div className="bg-[var(--accent-soft)] border border-[var(--accent)] border-opacity-20 rounded-[14px] p-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={16} className="text-[var(--accent)]" />
        <span className="text-[9px] font-bold tracking-[2.5px] uppercase text-[var(--accent)]">
          CAIO Interview Angle
        </span>
      </div>
      <p className="text-[14px] text-[var(--text-2)] leading-relaxed italic">
        &ldquo;{angle}&rdquo;
      </p>
    </div>
  );
}
