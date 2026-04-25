'use client';

interface ScoreCellProps {
  score: number;
  onChange: (score: number) => void;
}

export default function ScoreCell({ score, onChange }: ScoreCellProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(val => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className="w-8 h-8 rounded-md text-xs font-bold transition-all duration-150"
          style={{
            background: score === val ? 'var(--module-evaluate)' : 'var(--surface-1)',
            color: score === val ? '#fff' : 'var(--text-quaternary)',
            transform: score === val ? 'scale(1.1)' : 'scale(1)',
            boxShadow: score === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
          onMouseEnter={(e) => { if (score !== val) { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
          onMouseLeave={(e) => { if (score !== val) { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-quaternary)'; } }}
        >
          {val}
        </button>
      ))}
    </div>
  );
}
