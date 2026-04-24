interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md';
  label?: string;
}

export default function Progress({ value, max = 100, color = 'var(--accent)', size = 'md', label }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const height = size === 'sm' ? 'h-1' : 'h-2';

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[var(--text-3)]">{label}</span>
          <span className="text-[11px] font-bold text-[var(--text-2)]">{pct}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-[var(--surface-hover)] rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: pct > 0 ? `0 0 8px ${color}30` : 'none',
          }}
        />
      </div>
    </div>
  );
}
