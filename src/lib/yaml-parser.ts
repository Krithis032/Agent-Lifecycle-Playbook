import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export interface ParsedConcept {
  conceptKey: string;
  conceptName: string;
  definition: string;
  explanation: string;
  sources: string[];
  codeScaffold: string | null;
  relationships: {
    depends_on: string[];
    enables: string[];
    compare_with: string[];
  } | null;
  metadata: Record<string, unknown> | null;
}

export interface ParsedDomain {
  domainKey: string;
  domainName: string;
  description: string;
  concepts: ParsedConcept[];
}

export interface ParsedPhase {
  slug: string;
  phaseNum: number;
  name: string;
  icon: string;
  color: string;
  duration: string;
  subtitle: string;
  interviewAngle: string;
  steps: {
    stepNum: number;
    title: string;
    body: string;
    codeExample?: string;
    proTip?: string;
    deliverables: string[];
    tools: string[];
    tableData?: Record<string, unknown>;
  }[];
  gate: {
    gateTitle: string;
    checkItems: string[];
  };
}

export interface ParsedTemplate {
  slug: string;
  name: string;
  description: string;
  phaseSlug?: string;
  fields: {
    key: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    section?: string;
    helpText?: string;
    options?: string[];
    defaultValue?: string;
  }[];
}

function formatDomainName(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ── helpers for concept extraction ────────────────────────── */

function extractCodeScaffold(c: Record<string, unknown>): string | null {
  if (c.implementation && typeof c.implementation === 'object') {
    const impl = c.implementation as Record<string, unknown>;
    if (impl.code_scaffold) return String(impl.code_scaffold);
    if (impl.pseudocode) return String(impl.pseudocode);
  }
  return null;
}

function extractRelationships(c: Record<string, unknown>) {
  const rels = c.relationships as Record<string, unknown> | undefined;
  if (!rels) return null;
  return {
    depends_on: Array.isArray(rels.depends_on) ? rels.depends_on.map(String) : [],
    enables: Array.isArray(rels.enables) ? rels.enables.map(String) : [],
    compare_with: Array.isArray(rels.compare_with) ? rels.compare_with.map(String) : [],
  };
}

function buildExplanation(c: Record<string, unknown>): string {
  const parts: string[] = [];

  // how_it_works — may be string or array of step objects
  if (c.how_it_works) {
    if (typeof c.how_it_works === 'string') {
      parts.push(c.how_it_works);
    } else if (Array.isArray(c.how_it_works)) {
      for (const step of c.how_it_works) {
        if (step && typeof step === 'object' && 'description' in step) {
          parts.push(`Step ${(step as Record<string, unknown>).step ?? ''}: ${(step as Record<string, unknown>).description}`);
        }
      }
    }
  }

  // design_decisions — may be string or array
  if (c.design_decisions) {
    if (typeof c.design_decisions === 'string') {
      parts.push(c.design_decisions);
    } else if (Array.isArray(c.design_decisions)) {
      parts.push(c.design_decisions.map(String).join('\n'));
    }
  }

  // core_concepts explanations
  const coreConcepts = Array.isArray(c.core_concepts) ? c.core_concepts : [];
  for (const cc of coreConcepts) {
    if (cc && typeof cc === 'object') {
      const obj = cc as Record<string, unknown>;
      if (obj.explanation) parts.push(String(obj.explanation));
    }
  }

  return parts.join('\n\n');
}

function extractSources(c: Record<string, unknown>): string[] {
  if (Array.isArray(c.sources)) return c.sources.map(String);
  return [];
}

function extractMetadata(c: Record<string, unknown>): Record<string, unknown> | null {
  if (c.real_world_analogies) return { real_world_analogies: c.real_world_analogies };
  if (c.real_world_applications) return { real_world_applications: c.real_world_applications };
  return null;
}

/**
 * Parse a single concept object (Format A — core KB files).
 * Top-level domain → concept_key → { definition, core_concepts, how_it_works, ... }
 */
function parseCoreConceptObject(conceptKey: string, c: Record<string, unknown>): ParsedConcept {
  return {
    conceptKey,
    conceptName: c.concept_name ? String(c.concept_name) : formatDomainName(conceptKey),
    definition: c.definition ? String(c.definition) : '',
    explanation: buildExplanation(c),
    sources: extractSources(c),
    codeScaffold: extractCodeScaffold(c),
    relationships: extractRelationships(c),
    metadata: extractMetadata(c),
  };
}

/* ── Format A: core KB (kb_foundations.yaml, kb_architecture.yaml, etc.) ── */
/* Structure: domain_key.concept_key.{definition, core_concepts, how_it_works, ...} */

function parseCoreKb(data: Record<string, unknown>, kbSource: string): ParsedDomain[] {
  const domains: ParsedDomain[] = [];

  for (const [domainKey, domainData] of Object.entries(data)) {
    if (domainKey.startsWith('_') || domainKey === 'metadata') continue;
    if (typeof domainData !== 'object' || domainData === null) continue;

    // Skip scaffold/status-only entries
    const dd = domainData as Record<string, unknown>;
    if (dd.status && typeof dd.status === 'string' && !dd.definition) continue;

    const concepts: ParsedConcept[] = [];

    for (const [conceptKey, conceptData] of Object.entries(dd)) {
      if (typeof conceptData !== 'object' || conceptData === null) continue;
      if (typeof conceptData === 'string') continue; // skip scalar fields like 'status'
      concepts.push(parseCoreConceptObject(conceptKey, conceptData as Record<string, unknown>));
    }

    if (concepts.length > 0) {
      domains.push({
        domainKey,
        domainName: formatDomainName(domainKey),
        description: `${kbSource} domain: ${formatDomainName(domainKey)}`,
        concepts,
      });
    }
  }

  return domains;
}

/* ── Format B: RAG_MCP.yaml ── */
/* Structure: knowledge_base.domains.domain_key.{description, nodes[].{description, core_concepts[]}} */

function parseRagMcpKb(data: Record<string, unknown>, kbSource: string): ParsedDomain[] {
  const kb = data.knowledge_base as Record<string, unknown> | undefined;
  if (!kb?.domains || typeof kb.domains !== 'object') return [];

  const domainsMap = kb.domains as Record<string, Record<string, unknown>>;
  const domains: ParsedDomain[] = [];

  for (const [domainKey, domainData] of Object.entries(domainsMap)) {
    if (typeof domainData !== 'object' || domainData === null) continue;

    const desc = domainData.description ? String(domainData.description) : `${kbSource}: ${formatDomainName(domainKey)}`;
    const concepts: ParsedConcept[] = [];
    const nodes = domainData.nodes as Record<string, Record<string, unknown>> | undefined;

    if (nodes && typeof nodes === 'object') {
      for (const [nodeKey, nodeData] of Object.entries(nodes)) {
        if (typeof nodeData !== 'object' || nodeData === null) continue;
        const nd = nodeData as Record<string, unknown>;

        // Each node may itself be a concept
        const nodeDef = nd.description ? String(nd.description) : '';
        const coreConcepts = Array.isArray(nd.core_concepts) ? nd.core_concepts : [];

        // If the node has core_concepts, each sub-concept becomes a ParsedConcept
        if (coreConcepts.length > 0) {
          for (const cc of coreConcepts) {
            if (!cc || typeof cc !== 'object') continue;
            const sub = cc as Record<string, unknown>;
            const subKey = sub.name ? String(sub.name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : nodeKey;

            const explanation: string[] = [];
            if (sub.how_it_works) explanation.push(String(sub.how_it_works));
            if (sub.design_decisions && Array.isArray(sub.design_decisions)) {
              explanation.push(sub.design_decisions.map(String).join('\n'));
            }

            let codeScaffold: string | null = null;
            if (sub.implementation && typeof sub.implementation === 'object') {
              const impl = sub.implementation as Record<string, unknown>;
              codeScaffold = impl.code_scaffold ? String(impl.code_scaffold) : impl.pseudocode ? String(impl.pseudocode) : null;
            }

            concepts.push({
              conceptKey: subKey,
              conceptName: sub.name ? String(sub.name) : formatDomainName(nodeKey),
              definition: sub.definition ? String(sub.definition) : nodeDef,
              explanation: explanation.join('\n\n'),
              sources: Array.isArray(sub.sources) ? sub.sources.map(String) : [],
              codeScaffold,
              relationships: null,
              metadata: sub.real_world_analogies ? { real_world_analogies: sub.real_world_analogies } : null,
            });
          }
        } else {
          // Node itself is the concept
          concepts.push(parseCoreConceptObject(nodeKey, nd));
        }
      }
    }

    if (concepts.length > 0) {
      domains.push({ domainKey, domainName: formatDomainName(domainKey), description: desc, concepts });
    }
  }

  return domains;
}

/* ── Format C: IBM_RAG_MCP.yaml ── */
/* Structure: domains.domain_key.{description, concepts.concept_key.{source_file, content}} */

function parseIbmKb(data: Record<string, unknown>, kbSource: string): ParsedDomain[] {
  const domainsMap = data.domains as Record<string, Record<string, unknown>> | undefined;
  if (!domainsMap || typeof domainsMap !== 'object') return [];

  const domains: ParsedDomain[] = [];

  for (const [domainKey, domainData] of Object.entries(domainsMap)) {
    if (typeof domainData !== 'object' || domainData === null) continue;

    const desc = domainData.description ? String(domainData.description) : `${kbSource}: ${formatDomainName(domainKey)}`;
    const concepts: ParsedConcept[] = [];
    const conceptsMap = domainData.concepts as Record<string, Record<string, unknown>> | undefined;

    if (conceptsMap && typeof conceptsMap === 'object') {
      for (const [cKey, cData] of Object.entries(conceptsMap)) {
        if (typeof cData !== 'object' || cData === null) continue;
        const cd = cData as Record<string, unknown>;

        // These have a 'content' field with long transcript text
        const contentText = cd.content ? String(cd.content) : '';
        // Truncate very long transcript content to first 2000 chars for definition,
        // keep full text in explanation for search
        const definition = contentText.length > 2000 ? contentText.slice(0, 2000) + '...' : contentText;
        const sourceFile = cd.source_file ? String(cd.source_file) : '';

        concepts.push({
          conceptKey: cKey,
          conceptName: formatDomainName(cKey),
          definition,
          explanation: contentText,
          sources: sourceFile ? [sourceFile] : [],
          codeScaffold: null,
          relationships: null,
          metadata: null,
        });
      }
    }

    if (concepts.length > 0) {
      domains.push({ domainKey, domainName: formatDomainName(domainKey), description: desc, concepts });
    }
  }

  return domains;
}

/* ── Format D: glossary / course_materials ── */
/* Structure: course_materials.concept_glossary.entries[].{term, definition, chapter, real_world_example} */

function parseGlossaryKb(data: Record<string, unknown>, kbSource: string): ParsedDomain[] {
  const domains: ParsedDomain[] = [];

  for (const [topKey, topVal] of Object.entries(data)) {
    if (topKey.startsWith('_') || topKey === 'metadata') continue;
    if (typeof topVal !== 'object' || topVal === null) continue;
    const section = topVal as Record<string, unknown>;

    // Look for concept_glossary.entries
    if (section.concept_glossary && typeof section.concept_glossary === 'object') {
      const glossary = section.concept_glossary as Record<string, unknown>;
      const entries = Array.isArray(glossary.entries) ? glossary.entries : [];
      if (entries.length === 0) continue;

      const concepts: ParsedConcept[] = [];
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;
        const e = entry as Record<string, unknown>;
        const term = e.term ? String(e.term) : '';
        if (!term) continue;

        concepts.push({
          conceptKey: term.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
          conceptName: term,
          definition: e.definition ? String(e.definition) : '',
          explanation: e.real_world_example ? `Real-world example: ${e.real_world_example}` : '',
          sources: e.chapter ? [`Chapter ${e.chapter}`] : [],
          codeScaffold: null,
          relationships: null,
          metadata: null,
        });
      }

      if (concepts.length > 0) {
        domains.push({
          domainKey: `${topKey}_glossary`,
          domainName: `${formatDomainName(topKey)} Glossary`,
          description: glossary.description ? String(glossary.description) : `${kbSource}: ${formatDomainName(topKey)}`,
          concepts,
        });
      }
    }
  }

  return domains;
}

/* ── Main entry point: auto-detect format ── */

export function parseKbYaml(filePath: string, kbSource: string): ParsedDomain[] {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    console.warn(`Could not read KB file: ${filePath}`);
    return [];
  }

  let data: Record<string, unknown>;
  try {
    data = yaml.load(content) as Record<string, unknown>;
  } catch (e) {
    // Attempt partial parse: truncate content at the error line and retry
    const err = e as { mark?: { line?: number } };
    if (err.mark?.line && err.mark.line > 50) {
      const lines = content.split('\n');
      const truncated = lines.slice(0, err.mark.line - 1).join('\n');
      try {
        data = yaml.load(truncated) as Record<string, unknown>;
        console.warn(`Partially parsed ${filePath} (${err.mark.line} of ${lines.length} lines)`);
      } catch {
        console.warn(`YAML parse error in ${filePath}:`, e);
        return [];
      }
    } else {
      console.warn(`YAML parse error in ${filePath}:`, e);
      return [];
    }
  }

  if (!data || typeof data !== 'object') return [];

  // Skip pure metadata files
  const topKeys = Object.keys(data);
  if (topKeys.length === 1 && topKeys[0] === 'metadata') return [];
  if (topKeys.every((k) => k === 'metadata' || k.startsWith('_source'))) return [];

  // Format B: knowledge_base.domains.* (RAG_MCP.yaml)
  if (data.knowledge_base && typeof data.knowledge_base === 'object') {
    return parseRagMcpKb(data, kbSource);
  }

  // Format C: domains.* with concepts.*.content (IBM_RAG_MCP.yaml)
  if (data.domains && typeof data.domains === 'object' && data.metadata) {
    return parseIbmKb(data, kbSource);
  }

  // Format D: glossary entries (course_materials, custom_knowledge with glossary)
  const hasGlossary = Object.values(data).some(
    (v) => v && typeof v === 'object' && 'concept_glossary' in (v as Record<string, unknown>)
  );
  if (hasGlossary) {
    return parseGlossaryKb(data, kbSource);
  }

  // Check if it's a scaffold/status-only file
  const hasRealConcepts = Object.entries(data).some(([key, val]) => {
    if (key === 'metadata' || key.startsWith('_')) return false;
    if (typeof val !== 'object' || val === null) return false;
    const v = val as Record<string, unknown>;
    // A real domain has nested objects (concepts), not just 'status' and 'planned_structure'
    return Object.values(v).some((inner) => typeof inner === 'object' && inner !== null && !Array.isArray(inner));
  });

  if (!hasRealConcepts) return [];

  // Format A: core KB (default)
  return parseCoreKb(data, kbSource);
}

/* ── Playbook YAML ── */

export function parsePlaybookYaml(filePath: string): ParsedPhase[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = yaml.load(content) as { phases: Record<string, unknown>[] };
  if (!data?.phases || !Array.isArray(data.phases)) return [];

  return data.phases.map((p) => ({
    slug: String(p.slug),
    phaseNum: Number(p.num),
    name: String(p.name),
    icon: String(p.icon || ''),
    color: String(p.color || '#2d3a8c'),
    duration: String(p.duration || ''),
    subtitle: String(p.subtitle || ''),
    interviewAngle: String(p.interview_angle || ''),
    steps: Array.isArray(p.steps)
      ? p.steps.map((s: Record<string, unknown>, i: number) => ({
          stepNum: i + 1,
          title: String(s.title),
          body: String(s.body),
          codeExample: s.code_example ? String(s.code_example) : undefined,
          proTip: s.pro_tip ? String(s.pro_tip) : undefined,
          deliverables: Array.isArray(s.deliverables) ? s.deliverables.map(String) : [],
          tools: Array.isArray(s.tools) ? s.tools.map(String) : [],
          tableData: s.table_data as Record<string, unknown> | undefined,
        }))
      : [],
    gate: p.gate
      ? {
          gateTitle: String((p.gate as Record<string, unknown>).title || `Phase ${p.num} Gate`),
          checkItems: Array.isArray((p.gate as Record<string, unknown>).checks)
            ? ((p.gate as Record<string, unknown>).checks as unknown[]).map(String)
            : [],
        }
      : { gateTitle: `Phase ${p.num} Gate`, checkItems: [] },
  }));
}

/* ── Templates YAML ── */

export function parseTemplatesYaml(filePath: string): ParsedTemplate[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = yaml.load(content) as { templates: Record<string, unknown>[] };
  if (!data?.templates || !Array.isArray(data.templates)) return [];

  return data.templates.map((t) => ({
    slug: String(t.slug),
    name: String(t.name),
    description: String(t.description || ''),
    phaseSlug: t.phase_slug ? String(t.phase_slug) : undefined,
    fields: Array.isArray(t.fields)
      ? t.fields.map((f: Record<string, unknown>) => ({
          key: String(f.key),
          label: String(f.label),
          type: String(f.type || 'text'),
          placeholder: f.placeholder ? String(f.placeholder) : undefined,
          required: Boolean(f.required),
          section: f.section ? String(f.section) : undefined,
          helpText: f.helpText ? String(f.helpText) : undefined,
          options: Array.isArray(f.options) ? f.options.map(String) : undefined,
          defaultValue: f.defaultValue ? String(f.defaultValue) : undefined,
        }))
      : [],
  }));
}

/* ── File discovery ── */

export function getAllKbFiles(kbDir: string): string[] {
  if (!fs.existsSync(kbDir)) return [];
  return fs
    .readdirSync(kbDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => path.join(kbDir, f));
}
