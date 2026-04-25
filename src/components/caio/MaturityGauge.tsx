'use client';

import { MATURITY_LEVELS } from '@/types/caio';

interface MaturityGaugeProps {
  level: number; // 1-5
  label?: string;
}

export default function MaturityGauge({ level, label }: MaturityGaugeProps) {
  const clampedLevel = Math.max(1, Math.min(5, level));
  const maturity = MATURITY_LEVELS.find(m => m.level === clampedLevel) || MATURITY_LEVELS[0];
  const percentage = (clampedLevel / 5) * 100;

  // SVG arc gauge
  const radius = 80;
  const strokeWidth = 12;
  const cx = 100;
  const cy = 100;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const filledAngle = startAngle + (totalAngle * percentage) / 100;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <div className="rounded-lg p-6 text-center" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
      <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Maturity Level</h3>
      <div className="relative inline-block">
        <svg width="200" height="140" viewBox="0 0 200 140">
          {/* Background arc */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="var(--surface-1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={describeArc(startAngle, filledAngle)}
            fill="none"
            stroke={maturity.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
          {/* Level text */}
          <text x={cx} y={cy - 5} textAnchor="middle" fill="var(--text-primary)" style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Urbanist' }}>
            {clampedLevel}
          </text>
          <text x={cx} y={cx + 18} textAnchor="middle" fill="var(--text-tertiary)" style={{ fontSize: '12px', fontFamily: 'Urbanist' }}>
            / 5
          </text>
        </svg>
      </div>
      <div className="mt-1">
        <span className="text-[14px] font-bold" style={{ color: maturity.color }}>
          {label || maturity.label}
        </span>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{maturity.description}</p>
      </div>
      {/* Level indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {MATURITY_LEVELS.map((m) => (
          <div
            key={m.level}
            className="w-8 h-2 rounded-full transition-colors"
            style={{ backgroundColor: m.level <= clampedLevel ? m.color : 'var(--surface-1)' }}
            title={m.label}
          />
        ))}
      </div>
    </div>
  );
}
