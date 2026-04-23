'use client';

interface TrustLayerBarsProps {
  scores: { layerName: string; score: number; riskLevel?: string }[];
}

const riskColors: Record<string, string> = {
  low: '#15803d',
  medium: '#b45309',
  high: '#ea580c',
  critical: '#ba1a1a',
};

export default function TrustLayerBars({ scores }: TrustLayerBarsProps) {
  return (
    <div className="space-y-3">
      {scores.map((layer, i) => {
        const pct = (layer.score / 10) * 100;
        const color = riskColors[layer.riskLevel || 'low'] || '#0052cc';
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] font-medium text-[var(--text)]">{layer.layerName}</span>
              <span className="text-[13px] font-bold" style={{ color }}>{layer.score}/10</span>
            </div>
            <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
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
