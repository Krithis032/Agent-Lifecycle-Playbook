'use client';

interface TrustLayerBarsProps {
  scores: { layerName: string; score: number; riskLevel?: string }[];
}

const riskColors: Record<string, string> = {
  low: 'var(--status-success)',
  medium: 'var(--status-warning)',
  high: '#ea580c',
  critical: 'var(--status-error)',
};

export default function TrustLayerBars({ scores }: TrustLayerBarsProps) {
  return (
    <div className="space-y-3">
      {scores.map((layer, i) => {
        const pct = (layer.score / 10) * 100;
        const color = riskColors[layer.riskLevel || 'low'] || 'var(--module-governance)';
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{layer.layerName}</span>
              <span className="text-[13px] font-bold" style={{ color }}>{layer.score}/10</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
