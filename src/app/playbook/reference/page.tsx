import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

interface Pattern {
  name: string;
  description: string;
  best_for: string;
  complexity: string;
  scalability: string;
}

interface Framework {
  name: string;
  language: string;
  control_level: string;
  learning_curve: string;
  best_for: string;
}

interface ModelTier {
  model: string;
  tier: string;
  capability: string;
  cost: string;
  latency: string;
  best_for: string;
}

interface RiskEntry {
  stakes: string;
  error_visibility: string;
  classification: string;
  approach: string;
}

function loadRef(): {
  architecture_patterns: Pattern[];
  frameworks: Framework[];
  model_tiers: ModelTier[];
  risk_matrix: RiskEntry[];
} {
  try {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), 'content/reference.yaml'),
      'utf-8'
    );
    return yaml.load(content) as ReturnType<typeof loadRef>;
  } catch {
    return { architecture_patterns: [], frameworks: [], model_tiers: [], risk_matrix: [] };
  }
}

export default function ReferencePage() {
  const ref = loadRef();

  const patternColumns = [
    { key: 'name', header: 'Pattern', render: (r: Pattern) => <strong>{r.name}</strong> },
    { key: 'description', header: 'Description' },
    { key: 'best_for', header: 'Best For' },
    { key: 'complexity', header: 'Complexity', render: (r: Pattern) => <Badge>{r.complexity}</Badge> },
    { key: 'scalability', header: 'Scalability' },
  ];

  const frameworkColumns = [
    { key: 'name', header: 'Framework', render: (r: Framework) => <strong>{r.name}</strong> },
    { key: 'language', header: 'Language' },
    { key: 'control_level', header: 'Control' },
    { key: 'learning_curve', header: 'Learning Curve' },
    { key: 'best_for', header: 'Best For' },
  ];

  const modelColumns = [
    { key: 'model', header: 'Model', render: (r: ModelTier) => <strong>{r.model}</strong> },
    { key: 'tier', header: 'Tier', render: (r: ModelTier) => <Badge variant="accent">{r.tier}</Badge> },
    { key: 'capability', header: 'Capability' },
    { key: 'cost', header: 'Cost' },
    { key: 'latency', header: 'Latency' },
    { key: 'best_for', header: 'Best For' },
  ];

  const riskColumns = [
    { key: 'stakes', header: 'Stakes', render: (r: RiskEntry) => <strong>{r.stakes}</strong> },
    { key: 'error_visibility', header: 'Error Visibility' },
    { key: 'classification', header: 'Classification', render: (r: RiskEntry) => {
      const v = r.classification.includes('Critical') ? 'coral' as const :
                r.classification.includes('Medium') ? 'amber' as const : 'green' as const;
      return <Badge variant={v}>{r.classification}</Badge>;
    }},
    { key: 'approach', header: 'Approach' },
  ];

  return (
    <div>
      <div className="eyebrow mb-4">Quick Reference</div>
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-[var(--text)]">
        Reference <span className="text-[var(--accent)] font-light italic">Materials</span>
      </h1>

      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4 pb-3 border-b-2 border-[var(--border)]">
          Architecture Patterns
        </h2>
        <Table<Pattern> columns={patternColumns} data={ref.architecture_patterns} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4 pb-3 border-b-2 border-[var(--border)]">
          Framework Comparison
        </h2>
        <Table<Framework> columns={frameworkColumns} data={ref.frameworks} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4 pb-3 border-b-2 border-[var(--border)]">
          Model Tier Strategy
        </h2>
        <Table<ModelTier> columns={modelColumns} data={ref.model_tiers} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4 pb-3 border-b-2 border-[var(--border)]">
          Risk Classification Matrix
        </h2>
        <Table<RiskEntry> columns={riskColumns} data={ref.risk_matrix} />
      </section>
    </div>
  );
}
