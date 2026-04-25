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

export interface ParsedTemplateColumn {
  key: string;
  header: string;
  type: string;
  width?: string;
  options?: string[];
  helpText?: string;
}

export interface ParsedTemplateSubField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

export interface ParsedTemplateField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  section?: string;
  helpText?: string;
  options?: string[];
  defaultValue?: string;
  columns?: ParsedTemplateColumn[];
  subFields?: ParsedTemplateSubField[];
  defaultRows?: number;
}

export interface ParsedTemplate {
  slug: string;
  name: string;
  description: string;
  phaseSlug?: string;
  fields: ParsedTemplateField[];
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

/* ── Format E: AI Governance Periodic Table ── */
/* Structure: categories[].{id, name, elements[].{code, name, full_description, why_it_matters, implementation_checklist, ...}} */
/* Also: agent_architecture_governance.layers[], regulatory_mappings.*, companion_skill_mapping.*, system_type_emphasis.* */

function parsePeriodicTableKb(data: Record<string, unknown>, kbSource: string): ParsedDomain[] {
  const domains: ParsedDomain[] = [];
  const categories = data.categories as Record<string, unknown>[] | undefined;
  if (!Array.isArray(categories)) return [];

  const metadata = data.metadata as Record<string, unknown> | undefined;
  const scoring = data.scoring as Record<string, unknown> | undefined;

  // Parse each category as a domain, each element as a concept
  for (const cat of categories) {
    if (!cat || typeof cat !== 'object') continue;
    const catId = cat.id ? String(cat.id) : '';
    const catName = cat.name ? String(cat.name) : '';
    const catPurpose = cat.purpose ? String(cat.purpose).trim() : '';
    const catColor = cat.color_name ? String(cat.color_name) : '';
    const elements = Array.isArray(cat.elements) ? cat.elements : [];

    const concepts: ParsedConcept[] = [];

    for (const elem of elements) {
      if (!elem || typeof elem !== 'object') continue;
      const el = elem as Record<string, unknown>;
      const code = el.code ? String(el.code) : '';
      const name = el.name ? String(el.name) : '';
      const fullDesc = el.full_description ? String(el.full_description) : '';
      const whyMatters = el.why_it_matters ? String(el.why_it_matters).trim() : '';
      const checklist = Array.isArray(el.implementation_checklist) ? el.implementation_checklist.map(String) : [];
      const codeScaffolding = Array.isArray(el.code_scaffolding) ? el.code_scaffolding.map(String) : [];
      const crossRefs = el.cross_references as Record<string, unknown> | undefined;
      const agentLayer = el.agent_layer ? String(el.agent_layer) : '';

      // Build explanation from why_it_matters + implementation_checklist
      const explanationParts: string[] = [];
      if (whyMatters) explanationParts.push(`Why it matters: ${whyMatters}`);
      if (checklist.length > 0) {
        explanationParts.push(`Implementation checklist:\n${checklist.map((item) => `- ${item}`).join('\n')}`);
      }
      if (agentLayer) {
        explanationParts.push(`Agent architecture layer: ${agentLayer.replace(/_/g, ' ')}`);
      }

      // Build relationships from cross_references
      const relationships: { depends_on: string[]; enables: string[]; compare_with: string[] } = {
        depends_on: [],
        enables: [],
        compare_with: [],
      };
      if (crossRefs) {
        if (crossRefs.primary) relationships.depends_on.push(String(crossRefs.primary));
        if (crossRefs.secondary) relationships.compare_with.push(String(crossRefs.secondary));
      }

      concepts.push({
        conceptKey: code.toLowerCase(),
        conceptName: `${code} — ${name}`,
        definition: fullDesc,
        explanation: explanationParts.join('\n\n'),
        sources: [`AI Governance Periodic Table 2026 — ${catName}`],
        codeScaffold: codeScaffolding.length > 0 ? codeScaffolding.map((s) => `• ${s}`).join('\n') : null,
        relationships: (relationships.depends_on.length > 0 || relationships.compare_with.length > 0) ? relationships : null,
        metadata: {
          element_code: code,
          category_id: catId,
          category_color: catColor,
          agent_layer: agentLayer,
        },
      });
    }

    if (concepts.length > 0) {
      domains.push({
        domainKey: `governance_${catId}`,
        domainName: `Governance: ${catName}`,
        description: catPurpose || `${kbSource}: ${catName}`,
        concepts,
      });
    }
  }

  // Parse agent_architecture_governance layers as a separate domain
  const archGov = data.agent_architecture_governance as Record<string, unknown> | undefined;
  if (archGov?.layers && Array.isArray(archGov.layers)) {
    const layerConcepts: ParsedConcept[] = [];

    for (const layer of archGov.layers as Record<string, unknown>[]) {
      if (!layer || typeof layer !== 'object') continue;
      const layerName = layer.layer ? String(layer.layer) : '';
      const layerDesc = layer.description ? String(layer.description) : '';
      const criticalElements = Array.isArray(layer.critical_elements) ? layer.critical_elements.map(String) : [];
      const rationale = layer.rationale ? String(layer.rationale).trim() : '';

      layerConcepts.push({
        conceptKey: `agent_layer_${layerName}`,
        conceptName: `Agent Layer: ${layerName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
        definition: layerDesc,
        explanation: `${rationale}\n\nCritical governance elements: ${criticalElements.join(', ')}`,
        sources: ['AI Governance Periodic Table 2026 — Agent Architecture Governance'],
        codeScaffold: null,
        relationships: {
          depends_on: criticalElements.map((e) => e.toLowerCase()),
          enables: [],
          compare_with: [],
        },
        metadata: { critical_elements: criticalElements },
      });
    }

    if (layerConcepts.length > 0) {
      domains.push({
        domainKey: 'governance_agent_architecture',
        domainName: 'Governance: Agent Architecture Layers',
        description: archGov.description ? String(archGov.description).trim() : 'Agent architecture governance mapping',
        concepts: layerConcepts,
      });
    }
  }

  // Parse regulatory_mappings as a separate domain
  const regMappings = data.regulatory_mappings as Record<string, unknown> | undefined;
  if (regMappings && typeof regMappings === 'object') {
    const regConcepts: ParsedConcept[] = [];

    for (const [regKey, regData] of Object.entries(regMappings)) {
      if (!regData || typeof regData !== 'object') continue;
      const rd = regData as Record<string, unknown>;
      const regName = rd.name ? String(rd.name) : formatDomainName(regKey);
      const regDesc = rd.description ? String(rd.description) : '';
      const requiredElements = Array.isArray(rd.required_elements) ? rd.required_elements.map(String) : [];

      // Build explanation from clause/article/section mappings
      const explanationParts: string[] = [];
      if (regDesc) explanationParts.push(regDesc);
      if (requiredElements.length > 0) {
        explanationParts.push(`Required governance elements: ${requiredElements.join(', ')}`);
      }

      // Process clause/article/section/function mappings
      const mappingTypes = ['clause_mapping', 'article_mapping', 'function_mapping', 'section_mapping'];
      for (const mapType of mappingTypes) {
        const mappings = rd[mapType] as Record<string, unknown>[] | undefined;
        if (Array.isArray(mappings)) {
          const label = mapType.replace('_mapping', '').replace(/\b\w/g, (c) => c.toUpperCase());
          const mappingLines = mappings.map((m) => {
            const clauseKey = m.clause || m.article || m.function || m.section || '';
            const elements = Array.isArray(m.elements) ? m.elements.map(String).join(', ') : '';
            return `${clauseKey}: [${elements}]`;
          });
          explanationParts.push(`${label} to Element Mapping:\n${mappingLines.join('\n')}`);
        }
      }

      // Handle EU AI Act risk tiers specifically
      if (rd.risk_tiers && typeof rd.risk_tiers === 'object') {
        const tiers = rd.risk_tiers as Record<string, Record<string, unknown>>;
        for (const [tierName, tierData] of Object.entries(tiers)) {
          if (!tierData || typeof tierData !== 'object') continue;
          const tierDesc = tierData.description ? String(tierData.description) : '';
          const tierElements = Array.isArray(tierData.required_elements) ? tierData.required_elements.map(String) : [];
          const recElements = Array.isArray(tierData.recommended_elements) ? tierData.recommended_elements.map(String) : [];
          const parts: string[] = [];
          if (tierDesc) parts.push(tierDesc);
          if (tierElements.length > 0) parts.push(`Required: ${tierElements.join(', ')}`);
          if (recElements.length > 0) parts.push(`Recommended: ${recElements.join(', ')}`);
          explanationParts.push(`Risk tier "${tierName}": ${parts.join('. ')}`);

          // Process article mappings within tier
          if (Array.isArray(tierData.article_mapping)) {
            const artLines = (tierData.article_mapping as Record<string, unknown>[]).map((m) => {
              const art = m.article ? String(m.article) : '';
              const els = Array.isArray(m.elements) ? m.elements.map(String).join(', ') : '';
              return `  ${art}: [${els}]`;
            });
            explanationParts.push(artLines.join('\n'));
          }
        }
      }

      regConcepts.push({
        conceptKey: `regulation_${regKey}`,
        conceptName: `Regulatory Mapping: ${regName}`,
        definition: `${regName} compliance mapping — identifies which governance elements satisfy ${regName} requirements`,
        explanation: explanationParts.join('\n\n'),
        sources: ['AI Governance Periodic Table 2026 — Regulatory Mappings'],
        codeScaffold: null,
        relationships: {
          depends_on: requiredElements.map((e) => e.toLowerCase()),
          enables: [],
          compare_with: [],
        },
        metadata: { regulation: regKey, required_elements: requiredElements },
      });
    }

    if (regConcepts.length > 0) {
      domains.push({
        domainKey: 'governance_regulatory_mappings',
        domainName: 'Governance: Regulatory Compliance Mappings',
        description: 'Maps governance elements to regulatory frameworks (ISO 42001, EU AI Act, GDPR, NIST AI RMF, India DPDP, COPPA)',
        concepts: regConcepts,
      });
    }
  }

  // Parse cross_regulation_priority as a concept within regulatory domain
  const crossRegPriority = data.cross_regulation_priority as Record<string, unknown> | undefined;
  if (crossRegPriority && typeof crossRegPriority === 'object') {
    const priorityConcepts: ParsedConcept[] = [];
    for (const [level, info] of Object.entries(crossRegPriority)) {
      if (!info || typeof info !== 'object') continue;
      const pi = info as Record<string, unknown>;
      const desc = pi.description ? String(pi.description) : '';
      const elements = Array.isArray(pi.elements) ? pi.elements.map(String) : [];

      priorityConcepts.push({
        conceptKey: `cross_reg_${level}`,
        conceptName: `Cross-Regulation Priority: ${formatDomainName(level)}`,
        definition: `${desc} — elements: ${elements.join(', ')}`,
        explanation: `These governance elements are ${desc.toLowerCase()}. Elements: ${elements.join(', ')}`,
        sources: ['AI Governance Periodic Table 2026 — Cross-Regulation Priority'],
        codeScaffold: null,
        relationships: {
          depends_on: elements.map((e) => e.toLowerCase()),
          enables: [],
          compare_with: [],
        },
        metadata: { priority_level: level, elements },
      });
    }

    if (priorityConcepts.length > 0) {
      domains.push({
        domainKey: 'governance_cross_regulation_priority',
        domainName: 'Governance: Cross-Regulation Element Priority',
        description: 'Element priority based on cross-regulation requirement frequency',
        concepts: priorityConcepts,
      });
    }
  }

  // Parse companion_skill_mapping as domains
  const skillMapping = data.companion_skill_mapping as Record<string, unknown> | undefined;
  if (skillMapping && typeof skillMapping === 'object') {
    // Wharton domains mapping
    const whartonMapping = skillMapping.wharton_domains_to_elements as Record<string, unknown>[] | undefined;
    if (Array.isArray(whartonMapping)) {
      const whartonConcepts: ParsedConcept[] = [];
      for (const mapping of whartonMapping) {
        if (!mapping || typeof mapping !== 'object') continue;
        const m = mapping as Record<string, unknown>;
        const domain = m.domain ? String(m.domain) : '';
        const primary = Array.isArray(m.primary_elements) ? m.primary_elements.map(String) : [];
        const secondary = Array.isArray(m.secondary_elements) ? m.secondary_elements.map(String) : [];

        const domKey = domain.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        whartonConcepts.push({
          conceptKey: `wharton_map_${domKey}`,
          conceptName: `Wharton Mapping: ${domain}`,
          definition: `Maps Wharton governance domain "${domain}" to periodic table elements`,
          explanation: `Primary elements: ${primary.join(', ')}\nSecondary elements: ${secondary.join(', ')}`,
          sources: ['AI Governance Periodic Table 2026 — Wharton Domain Mapping'],
          codeScaffold: null,
          relationships: {
            depends_on: primary.map((e) => e.toLowerCase()),
            enables: [],
            compare_with: secondary.map((e) => e.toLowerCase()),
          },
          metadata: { wharton_domain: domain, primary_elements: primary, secondary_elements: secondary },
        });
      }

      if (whartonConcepts.length > 0) {
        domains.push({
          domainKey: 'governance_wharton_element_mapping',
          domainName: 'Governance: Wharton Domain Element Mapping',
          description: 'Maps 10 Wharton AI governance domains to periodic table elements',
          concepts: whartonConcepts,
        });
      }
    }

    // CAIO domains mapping
    const caioMapping = skillMapping.caio_domains_to_elements as Record<string, unknown>[] | undefined;
    if (Array.isArray(caioMapping)) {
      const caioConcepts: ParsedConcept[] = [];
      for (const mapping of caioMapping) {
        if (!mapping || typeof mapping !== 'object') continue;
        const m = mapping as Record<string, unknown>;
        const domain = m.domain ? String(m.domain) : '';
        const elements = Array.isArray(m.elements) ? m.elements.map(String) : [];

        const domKey = domain.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        caioConcepts.push({
          conceptKey: `caio_map_${domKey}`,
          conceptName: `CAIO Mapping: ${domain}`,
          definition: `Maps CAIO maturity domain "${domain}" to periodic table elements`,
          explanation: `Required governance elements: ${elements.join(', ')}`,
          sources: ['AI Governance Periodic Table 2026 — CAIO Domain Mapping'],
          codeScaffold: null,
          relationships: {
            depends_on: elements.map((e) => e.toLowerCase()),
            enables: [],
            compare_with: [],
          },
          metadata: { caio_domain: domain, elements },
        });
      }

      if (caioConcepts.length > 0) {
        domains.push({
          domainKey: 'governance_caio_element_mapping',
          domainName: 'Governance: CAIO Domain Element Mapping',
          description: 'Maps CAIO AI maturity domains to periodic table elements',
          concepts: caioConcepts,
        });
      }
    }
  }

  // Parse system_type_emphasis as a domain
  const sysTypes = data.system_type_emphasis as Record<string, unknown> | undefined;
  if (sysTypes && typeof sysTypes === 'object') {
    const sysTypeConcepts: ParsedConcept[] = [];
    for (const [typeKey, typeData] of Object.entries(sysTypes)) {
      if (!typeData || typeof typeData !== 'object') continue;
      const td = typeData as Record<string, unknown>;
      const description = td.description ? String(td.description) : '';
      const emphasize = Array.isArray(td.emphasize) ? td.emphasize.map(String) : [];
      const rationale = td.rationale ? String(td.rationale) : '';

      sysTypeConcepts.push({
        conceptKey: `sys_type_${typeKey}`,
        conceptName: `System Type: ${formatDomainName(typeKey)}`,
        definition: `Governance emphasis for ${description.toLowerCase()} — prioritise: ${emphasize.join(', ')}`,
        explanation: `${rationale}\n\nEmphasised elements: ${emphasize.join(', ')}`,
        sources: ['AI Governance Periodic Table 2026 — System Type Emphasis'],
        codeScaffold: null,
        relationships: {
          depends_on: emphasize.map((e) => e.toLowerCase()),
          enables: [],
          compare_with: [],
        },
        metadata: { system_type: typeKey, emphasize },
      });
    }

    if (sysTypeConcepts.length > 0) {
      domains.push({
        domainKey: 'governance_system_type_emphasis',
        domainName: 'Governance: System Type Emphasis',
        description: 'Contextual governance emphasis based on AI system type (agentic, RAG, customer-facing, internal)',
        concepts: sysTypeConcepts,
      });
    }
  }

  // Parse scoring methodology as a concept
  if (scoring && typeof scoring === 'object') {
    const scoringConcepts: ParsedConcept[] = [];
    const scale = Array.isArray(scoring.element_scale) ? scoring.element_scale : [];
    const weights = scoring.category_weights as Record<string, unknown> | undefined;
    const riskClass = Array.isArray(scoring.risk_classification) ? scoring.risk_classification : [];

    const scaleDesc = scale.map((s: Record<string, unknown>) =>
      `Score ${s.score}: ${s.label} — ${s.meaning}`
    ).join('\n');

    const weightsDesc = weights ? Object.entries(weights).map(([k, v]) =>
      `${formatDomainName(k)}: ${(Number(v) * 100).toFixed(0)}%`
    ).join('\n') : '';

    const riskDesc = riskClass.map((r: Record<string, unknown>) =>
      `${r.range} (${r.label}): ${r.description}`
    ).join('\n');

    scoringConcepts.push({
      conceptKey: 'governance_scoring_methodology',
      conceptName: 'Governance Scoring Methodology',
      definition: 'Scoring framework for evaluating AI governance maturity across 42 elements using a 0-4 scale with weighted categories',
      explanation: `Element Scale (0-4):\n${scaleDesc}\n\nCategory Weights:\n${weightsDesc}\n\nRisk Classification:\n${riskDesc}`,
      sources: ['AI Governance Periodic Table 2026 — Scoring Methodology'],
      codeScaffold: null,
      relationships: null,
      metadata: {
        total_elements: metadata?.total_elements || 42,
        total_categories: metadata?.total_categories || 6,
        modes: metadata?.modes || [],
      },
    });

    domains.push({
      domainKey: 'governance_scoring',
      domainName: 'Governance: Scoring Methodology',
      description: 'Element scoring scale, category weights, and risk classification for governance assessment',
      concepts: scoringConcepts,
    });
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

  // Format E: AI Governance Periodic Table (categories[].elements[])
  if (Array.isArray(data.categories) && data.scoring && data.metadata) {
    return parsePeriodicTableKb(data, kbSource);
  }

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
      ? t.fields.map((f: Record<string, unknown>) => {
          const field: ParsedTemplateField = {
            key: String(f.key),
            label: String(f.label),
            type: String(f.type || 'text'),
            placeholder: f.placeholder ? String(f.placeholder) : undefined,
            required: Boolean(f.required),
            section: f.section ? String(f.section) : undefined,
            helpText: f.helpText ? String(f.helpText) : undefined,
            options: Array.isArray(f.options) ? f.options.map(String) : undefined,
            defaultValue: f.defaultValue ? String(f.defaultValue) : undefined,
          };

          // Table columns
          if (Array.isArray(f.columns)) {
            field.columns = f.columns.map((c: Record<string, unknown>) => ({
              key: String(c.key),
              header: String(c.header),
              type: String(c.type || 'text'),
              width: c.width ? String(c.width) : undefined,
              options: Array.isArray(c.options) ? c.options.map(String) : undefined,
              helpText: c.helpText ? String(c.helpText) : undefined,
            }));
          }

          // Repeatable sub-fields
          if (Array.isArray(f.subFields)) {
            field.subFields = f.subFields.map((sf: Record<string, unknown>) => ({
              key: String(sf.key),
              label: String(sf.label),
              type: String(sf.type || 'text'),
              placeholder: sf.placeholder ? String(sf.placeholder) : undefined,
              required: sf.required ? Boolean(sf.required) : undefined,
              helpText: sf.helpText ? String(sf.helpText) : undefined,
              options: Array.isArray(sf.options) ? sf.options.map(String) : undefined,
            }));
          }

          // Default rows for tables
          if (f.defaultRows !== undefined) {
            field.defaultRows = Number(f.defaultRows);
          }

          return field;
        })
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
