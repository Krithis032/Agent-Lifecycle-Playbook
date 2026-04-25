'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import SectionPanel from '@/components/ui/SectionPanel';
import Badge from '@/components/ui/Badge';
import PeriodicTableGrid from '@/components/governance/PeriodicTableGrid';
import ElementScoringForm from '@/components/governance/ElementScoringForm';
import {
  PERIODIC_TABLE_CATEGORIES,
  CATEGORY_WEIGHTS,
  CROSS_REGULATION_PRIORITY,
  AGENT_ARCHITECTURE_LAYERS,
  SYSTEM_TYPE_EMPHASIS,
} from '@/lib/periodic-table-constants';
import type { PeriodicElement } from '@/lib/periodic-table-constants';
import type { PeriodicCategoryScore } from '@/types/governance';
import { Grid3X3, ChevronLeft, Layers, Shield, Globe } from 'lucide-react';

function initCategories(): PeriodicCategoryScore[] {
  return PERIODIC_TABLE_CATEGORIES.map(cat => ({
    categoryId: cat.id,
    categoryName: cat.name,
    weight: cat.weight,
    avgScore: 0,
    percentage: 0,
    elementScores: cat.elements.map(el => ({
      code: el.code,
      score: 0,
      notes: '',
      checklist: new Array(el.implementationChecklist.length).fill(false),
    })),
  }));
}

function calcWeightedScore(categories: PeriodicCategoryScore[]): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const cat of categories) {
    const w = CATEGORY_WEIGHTS[cat.categoryId] || 0;
    totalWeight += w;
    weightedSum += cat.percentage * w;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export default function PeriodicTableDashboardPage() {
  const [categories, setCategories] = useState<PeriodicCategoryScore[]>(initCategories());
  const [activeElement, setActiveElement] = useState<{ element: PeriodicElement; categoryId: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'architecture' | 'regulatory' | 'systems'>('grid');

  const weightedScore = calcWeightedScore(categories);

  const updateElementScore = (categoryId: string, code: string, field: string, value: unknown) => {
    setCategories(prev => prev.map(cat => {
      if (cat.categoryId !== categoryId) return cat;
      const newScores = cat.elementScores.map(es => {
        if (es.code !== code) return es;
        return { ...es, [field]: value };
      });
      const avgScore = newScores.reduce((s, e) => s + e.score, 0) / newScores.length;
      return { ...cat, elementScores: newScores, avgScore, percentage: (avgScore / 4) * 100 };
    }));
  };

  const getElementScore = (code: string): number => {
    for (const cat of categories) {
      const el = cat.elementScores.find(e => e.code === code);
      if (el) return el.score;
    }
    return 0;
  };

  const tabs = [
    { key: 'grid' as const, label: 'Element Grid', icon: Grid3X3 },
    { key: 'architecture' as const, label: 'Agent Layers', icon: Layers },
    { key: 'regulatory' as const, label: 'Regulatory', icon: Globe },
    { key: 'systems' as const, label: 'System Types', icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Back Link */}
      <Link
        href="/governance"
        className="text-[12px] font-semibold transition-colors block"
        style={{ color: 'var(--text-quaternary)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}
      >
        <ChevronLeft size={14} className="inline" /> Back to Governance
      </Link>

      {/* Header */}
      <PageHeader
        eyebrow="GOVERNANCE"
        title="AI Governance Periodic Table"
        subtitle="36-element reference architecture for secure, scalable enterprise AI systems. Score each element on a 0-4 maturity scale."
      />

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[12px] font-semibold transition-all flex-1 justify-center"
              style={{
                background: activeTab === tab.key ? 'var(--brand-primary)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-tertiary)',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          <PeriodicTableGrid
            categoryScores={categories}
            onElementClick={(el, catId) => setActiveElement({ element: el, categoryId: catId })}
            weightedScore={weightedScore}
          />

          {activeElement && (() => {
            const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.id === activeElement.categoryId);
            const catScore = categories.find(c => c.categoryId === activeElement.categoryId);
            const elScore = catScore?.elementScores.find(e => e.code === activeElement.element.code);
            if (!cat || !elScore) return null;
            return (
              <ElementScoringForm
                element={activeElement.element}
                categoryColor={cat.color}
                categoryName={cat.name}
                score={elScore}
                onScoreChange={(score) => updateElementScore(activeElement.categoryId, activeElement.element.code, 'score', score)}
                onNotesChange={(notes) => updateElementScore(activeElement.categoryId, activeElement.element.code, 'notes', notes)}
                onChecklistToggle={(idx) => {
                  const newChecklist = [...elScore.checklist];
                  newChecklist[idx] = !newChecklist[idx];
                  updateElementScore(activeElement.categoryId, activeElement.element.code, 'checklist', newChecklist);
                }}
                onClose={() => setActiveElement(null)}
              />
            );
          })()}
        </div>
      )}

      {activeTab === 'architecture' && (
        <SectionPanel title="Agent Architecture Governance Mapping" icon={Layers}>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>
            When governing multi-agent systems, apply elements at each architectural layer. Critical elements are highlighted with their current scores.
          </p>
          <div className="space-y-4">
            {AGENT_ARCHITECTURE_LAYERS.map(layer => (
              <div key={layer.layer} className="rounded-lg p-4" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
                    {layer.layer.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>
                    {layer.criticalElements.length} critical elements
                  </span>
                </div>
                <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>{layer.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.criticalElements.map(code => {
                    const score = getElementScore(code);
                    const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.elements.some(e => e.code === code));
                    return (
                      <span
                        key={code}
                        className="px-2 py-1 rounded text-[11px] font-bold"
                        style={{
                          background: `color-mix(in srgb, ${cat?.color || '#666'} 12%, transparent)`,
                          color: cat?.color || 'var(--text-tertiary)',
                          border: `1px solid ${cat?.color || 'var(--border-default)'}`,
                        }}
                      >
                        {code}
                        <span className="ml-1 opacity-70">{score}/4</span>
                      </span>
                    );
                  })}
                </div>
                <p className="text-[10px] mt-2 italic" style={{ color: 'var(--text-quaternary)' }}>{layer.rationale}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}

      {activeTab === 'regulatory' && (
        <SectionPanel title="Cross-Regulation Element Priority" icon={Globe}>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Elements ranked by how many regulatory frameworks require them. Focus on universal must-haves first.
          </p>
          <div className="space-y-4">
            {/* Universal Must-Haves */}
            <div className="rounded-lg p-4" style={{ border: '2px solid var(--status-error)', background: 'var(--surface-elevated)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="error">Universal</Badge>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{CROSS_REGULATION_PRIORITY.universalMustHaves.description}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CROSS_REGULATION_PRIORITY.universalMustHaves.elements.map(code => {
                  const score = getElementScore(code);
                  const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.elements.some(e => e.code === code));
                  return (
                    <span key={code} className="px-2.5 py-1 rounded text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${cat?.color || '#666'} 12%, transparent)`, color: cat?.color, border: `1px solid ${cat?.color}` }}>
                      {code} <span className="opacity-70">{score}/4</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* High Priority */}
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--status-warning)', background: 'var(--surface-elevated)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="warning">High Priority</Badge>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{CROSS_REGULATION_PRIORITY.highPriority.description}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CROSS_REGULATION_PRIORITY.highPriority.elements.map(code => {
                  const score = getElementScore(code);
                  const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.elements.some(e => e.code === code));
                  return (
                    <span key={code} className="px-2.5 py-1 rounded text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${cat?.color || '#666'} 12%, transparent)`, color: cat?.color, border: `1px solid ${cat?.color}` }}>
                      {code} <span className="opacity-70">{score}/4</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Standard */}
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Standard</Badge>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{CROSS_REGULATION_PRIORITY.standard.description}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CROSS_REGULATION_PRIORITY.standard.elements.map(code => {
                  const score = getElementScore(code);
                  const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.elements.some(e => e.code === code));
                  return (
                    <span key={code} className="px-2.5 py-1 rounded text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${cat?.color || '#666'} 12%, transparent)`, color: cat?.color, border: `1px solid ${cat?.color}` }}>
                      {code} <span className="opacity-70">{score}/4</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionPanel>
      )}

      {activeTab === 'systems' && (
        <SectionPanel title="System Type Emphasis" icon={Shield}>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-tertiary)' }}>
            Different AI system types require different governance emphasis. Select your system type to see which elements to prioritize.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_TYPE_EMPHASIS.map(sys => (
              <div key={sys.key} className="rounded-lg p-4" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
                <h3 className="text-[13px] font-bold capitalize mb-1" style={{ color: 'var(--text-primary)' }}>
                  {sys.key.replace(/_/g, ' ')}
                </h3>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>{sys.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {sys.emphasize.map(code => {
                    const score = getElementScore(code);
                    const cat = PERIODIC_TABLE_CATEGORIES.find(c => c.elements.some(e => e.code === code));
                    return (
                      <span key={code} className="px-2 py-1 rounded text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${cat?.color || '#666'} 12%, transparent)`, color: cat?.color, border: `1px solid ${cat?.color}` }}>
                        {code} <span className="opacity-70">{score}/4</span>
                      </span>
                    );
                  })}
                </div>
                <p className="text-[10px] italic" style={{ color: 'var(--text-quaternary)' }}>{sys.rationale}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}
    </div>
  );
}
