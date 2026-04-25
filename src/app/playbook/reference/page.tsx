import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import SectionPanel from '@/components/ui/SectionPanel';
import { Layers, GitCompare, Cpu, AlertTriangle } from 'lucide-react';


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
    { key: 'tier', header: 'Tier', render: (r: ModelTier) => <Badge variant="brand">{r.tier}</Badge> },
    { key: 'capability', header: 'Capability' },
    { key: 'cost', header: 'Cost' },
    { key: 'latency', header: 'Latency' },
    { key: 'best_for', header: 'Best For' },
  ];

  const riskColumns = [
    { key: 'stakes', header: 'Stakes', render: (r: RiskEntry) => <strong>{r.stakes}</strong> },
    { key: 'error_visibility', header: 'Error Visibility' },
    { key: 'classification', header: 'Classification', render: (r: RiskEntry) => {
      const v = r.classification.includes('Critical') ? 'error' as const :
                r.classification.includes('Medium') ? 'warning' as const : 'success' as const;
      return <Badge variant={v}>{r.classification}</Badge>;
    }},
    { key: 'approach', header: 'Approach' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="QUICK REFERENCE"
        title="Reference Materials"
        subtitle="Architecture patterns, framework comparisons, model tiers, and risk classification."
      />

      <SectionPanel title="Architecture Patterns" icon={Layers}>
        <div className="p-4">
          <Table<Pattern> columns={patternColumns} data={ref.architecture_patterns} />
        </div>
      </SectionPanel>

      <SectionPanel title="Framework Comparison" icon={GitCompare}>
        <div className="p-4">
          <Table<Framework> columns={frameworkColumns} data={ref.frameworks} />
        </div>
      </SectionPanel>

      <SectionPanel title="Model Tier Strategy" icon={Cpu}>
        <div className="p-4">
          <Table<ModelTier> columns={modelColumns} data={ref.model_tiers} />
        </div>
      </SectionPanel>

      <SectionPanel title="Risk Classification Matrix" icon={AlertTriangle}>
        <div className="p-4">
          <Table<RiskEntry> columns={riskColumns} data={ref.risk_matrix} />
        </div>
      </SectionPanel>
    </div>
  );
}
