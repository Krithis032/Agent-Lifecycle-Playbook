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
          className={`w-8 h-8 rounded-md text-xs font-bold transition-all duration-150 ${
            score === val
              ? 'bg-[var(--accent)] text-white shadow-sm scale-110'
              : 'bg-[var(--surface)] text-[var(--text-4)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-2)]'
          }`}
        >
          {val}
        </button>
      ))}
    </div>
  );
}
