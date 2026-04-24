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
      <p className="text-[14px] text-[var(--text-2)] leading-relaxed mb-4">{body}</p>

      {deliverables.length > 0 && (
        <div className="mb-4">
          <div className="text-[9px] font-bold tracking-[2.5px] uppercase text-[var(--green)] mb-2">
            Deliverables
          </div>
          <ul className="space-y-1">
            {deliverables.map((d, i) => (
              <li key={i} className="text-[13px] text-[var(--text-3)] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--green)]">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tools.length > 0 && (
        <div className="mb-4">
          <div className="text-[9px] font-bold tracking-[2.5px] uppercase text-[var(--purple)] mb-2">
            Tools
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tools.map((t, i) => (
              <Badge key={i} variant="purple">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {codeExample && (
        <div className="mb-4">
          <div className="text-[9px] font-bold tracking-[2.5px] uppercase text-[var(--cyan)] mb-2">
            Code Example
          </div>
          <pre className="text-xs">{codeExample}</pre>
        </div>
      )}

      {proTip && (
        <div className="bg-[var(--amber-soft)] border border-[var(--amber)] border-opacity-20 rounded-lg p-4">
          <div className="text-[9px] font-bold tracking-[2.5px] uppercase text-[var(--amber)] mb-1.5">
            Pro Tip
          </div>
          <p className="text-[13px] text-[var(--text-2)]">{proTip}</p>
        </div>
      )}
    </Accordion>
  );
}
