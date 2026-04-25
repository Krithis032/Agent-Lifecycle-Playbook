import Accordion from '@/components/ui/Accordion';
import Badge from '@/components/ui/Badge';

interface StepAccordionProps {
  stepNum: number;
  title: string;
  body: string;
  deliverables: string[];
  tools: string[];
  codeExample: string | null;
  proTip: string | null;
  color: string;
}

export default function StepAccordion({
  stepNum, title, body, deliverables, tools, codeExample, proTip, color,
}: StepAccordionProps) {
  return (
    <Accordion number={stepNum} numberColor={color} title={title}>
      <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{body}</p>

      {deliverables.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-extrabold tracking-[2px] uppercase mb-2" style={{ color: 'var(--status-success)' }}>
            Deliverables
          </div>
          <ul className="space-y-1">
            {deliverables.map((d, i) => (
              <li key={i} className="text-[13px] pl-4 relative flex items-start gap-2" style={{ color: 'var(--text-tertiary)' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                  style={{ background: 'var(--status-success)' }}
                />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tools.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-extrabold tracking-[2px] uppercase mb-2" style={{ color: 'var(--status-info)' }}>
            Tools
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tools.map((t, i) => (
              <Badge key={i} variant="info">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {codeExample && (
        <div className="mb-4">
          <div className="text-[10px] font-extrabold tracking-[2px] uppercase mb-2" style={{ color: 'var(--module-templates)' }}>
            Code Example
          </div>
          <pre
            className="text-xs rounded-[var(--radius-md)] p-4 overflow-x-auto"
            style={{
              background: 'var(--surface-1)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            {codeExample}
          </pre>
        </div>
      )}

      {proTip && (
        <div
          className="rounded-[var(--radius-md)] p-4"
          style={{
            background: 'var(--status-warning-soft)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 20%, transparent)',
          }}
        >
          <div className="text-[10px] font-extrabold tracking-[2px] uppercase mb-1.5" style={{ color: 'var(--status-warning)' }}>
            Pro Tip
          </div>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{proTip}</p>
        </div>
      )}
    </Accordion>
  );
}
