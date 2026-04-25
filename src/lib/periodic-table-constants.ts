// =============================================================================
// AI GOVERNANCE PERIODIC TABLE CONSTANTS
// Parsed from ai-governance-periodic-table-kb.yaml
// =============================================================================

export interface PeriodicElement {
  code: string;
  name: string;
  fullDescription: string;
  whyItMatters: string;
  implementationChecklist: string[];
  codeScaffolding: string[];
  crossReferences: { primary: string; secondary?: string };
  agentLayer: 'orchestrator' | 'individual_agents' | 'data_layer' | 'inter_agent_communication' | 'output_layer' | 'compliance_layer';
}

export interface PeriodicCategory {
  id: string;
  name: string;
  color: string;
  colorName: string;
  weight: number;
  elementCount: number;
  purpose: string;
  elements: PeriodicElement[];
}

export interface ScoringLevel {
  score: number;
  label: string;
  meaning: string;
}

export interface RiskClassRange {
  range: string;
  min: number;
  max: number;
  label: string;
  description: string;
}

// =============================================================================
// SCORING SCALE (0–4)
// =============================================================================

export const SCORING_SCALE: ScoringLevel[] = [
  { score: 0, label: 'Not Implemented', meaning: 'No evidence this element exists' },
  { score: 1, label: 'Ad Hoc', meaning: 'Some awareness but no formal process' },
  { score: 2, label: 'Defined', meaning: 'Formal process exists but inconsistently applied' },
  { score: 3, label: 'Managed', meaning: 'Consistently applied with monitoring' },
  { score: 4, label: 'Optimized', meaning: 'Continuously improved with metrics-driven optimization' },
];

// =============================================================================
// CATEGORY WEIGHTS
// =============================================================================

export const CATEGORY_WEIGHTS: Record<string, number> = {
  iac: 0.20,
  dp: 0.18,
  rm: 0.18,
  cg: 0.20,
  mo: 0.12,
  aa: 0.12,
};

// =============================================================================
// RISK CLASSIFICATION RANGES
// =============================================================================

export const RISK_CLASSIFICATIONS: RiskClassRange[] = [
  { range: '80-100', min: 80, max: 100, label: 'STRONG', description: 'Mature governance posture, focus on continuous improvement' },
  { range: '60-79', min: 60, max: 79, label: 'MODERATE', description: 'Foundations in place, critical gaps need attention' },
  { range: '40-59', min: 40, max: 59, label: 'WEAK', description: 'Significant gaps, prioritise high-risk elements immediately' },
  { range: '0-39', min: 0, max: 39, label: 'CRITICAL', description: 'Minimal governance, systemic risk exposure' },
];

export function classifyRisk(score: number): RiskClassRange {
  return RISK_CLASSIFICATIONS.find(r => score >= r.min && score <= r.max) || RISK_CLASSIFICATIONS[3];
}

// =============================================================================
// CATEGORIES & ELEMENTS (36 total across 6 categories)
// =============================================================================

export const PERIODIC_TABLE_CATEGORIES: PeriodicCategory[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 1: IDENTITY & ACCESS CONTROL
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'iac',
    name: 'Identity & Access Control',
    color: '#4CAF50',
    colorName: 'green',
    weight: 0.20,
    elementCount: 7,
    purpose: 'Ensure only authorised users and systems access AI resources with appropriate permissions',
    elements: [
      {
        code: 'RBAC',
        name: 'Role-Based Access Control',
        fullDescription: 'Assign permissions based on user roles across AI systems and workflows',
        whyItMatters: 'Without RBAC, any user can access any AI model endpoint, training data, or output — creating data leakage and unauthorized model manipulation risks',
        implementationChecklist: [
          'Role definitions exist for AI system users (admin, developer, data scientist, auditor, viewer)',
          'Permissions matrix maps roles to AI operations (train, deploy, query, retrain, delete)',
          'Role assignments are documented and reviewed quarterly',
          'Least-privilege principle applied — no role has more access than needed',
          'Role changes trigger audit log entries',
        ],
        codeScaffolding: ['RBAC middleware config', 'Role-permission matrix JSON', 'Access control decorators'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework - access control)', secondary: 'wharton-ai-governance (Governance domain)' },
        agentLayer: 'orchestrator',
      },
      {
        code: 'ABAC',
        name: 'Attribute-Based Access Control',
        fullDescription: 'Dynamic access using user, data, and environment attributes',
        whyItMatters: 'RBAC alone is too coarse for AI systems where access should vary by data sensitivity, model risk tier, user department, time of day, or geographic location',
        implementationChecklist: [
          'Attribute schema defined (user attributes, resource attributes, environment attributes)',
          'Policy engine configured to evaluate attribute combinations',
          'High-risk AI models have additional attribute gates',
          'Attribute values are validated against authoritative sources',
          'Dynamic access decisions are logged with full attribute context',
        ],
        codeScaffolding: ['ABAC policy engine config', 'Attribute schema definitions', 'Policy evaluation middleware'],
        crossReferences: { primary: 'chief-ai-security-officer (frameworks - access tiers)' },
        agentLayer: 'orchestrator',
      },
      {
        code: 'MFA',
        name: 'Multi-Factor Authentication',
        fullDescription: 'Adds extra security layers beyond passwords for AI system access',
        whyItMatters: 'AI systems contain sensitive training data, model weights, and can produce outputs with real-world impact. Single-factor auth is insufficient',
        implementationChecklist: [
          'MFA required for all AI model management interfaces',
          'MFA required for training data access and modification',
          'MFA required for production model deployment',
          'Hardware tokens or biometric options available for high-risk operations',
          'MFA bypass attempts are logged and alerted',
        ],
        codeScaffolding: ['MFA integration config', 'Authentication flow middleware'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework)' },
        agentLayer: 'inter_agent_communication',
      },
      {
        code: 'SSO',
        name: 'Single Sign-On',
        fullDescription: 'Unified authentication across multiple AI tools and enterprise platforms',
        whyItMatters: 'AI practitioners use many tools (MLflow, notebooks, model registries, monitoring dashboards). Fragmented auth creates credential sprawl and shadow AI risks',
        implementationChecklist: [
          'SSO provider integrated with all AI development tools',
          'SSO covers model registries, experiment tracking, monitoring dashboards',
          'Session management policies defined (timeout, re-authentication for sensitive ops)',
          'SSO integration tested across all AI platform components',
          'Offboarding immediately revokes access across all AI tools',
        ],
        codeScaffolding: ['SSO provider config', 'SAML/OIDC integration templates'],
        crossReferences: { primary: 'chief-ai-security-officer (operating model - CoE access)' },
        agentLayer: 'inter_agent_communication',
      },
      {
        code: 'IAM',
        name: 'Identity & Access Management',
        fullDescription: 'Centralized system for managing identities and permissions',
        whyItMatters: 'The foundational layer — without IAM, RBAC, ABAC, MFA, and SSO cannot be coordinated. IAM ensures a single source of truth for who can do what with AI systems',
        implementationChecklist: [
          'Centralized identity provider manages all AI system users',
          'Service accounts for AI pipelines have scoped permissions',
          'API keys for model endpoints are rotated on schedule',
          'Identity lifecycle management (provisioning, modification, deprovisioning) is automated',
          'Privileged access to AI infrastructure requires approval workflows',
        ],
        codeScaffolding: ['IAM provider config', 'Service account templates', 'API key rotation scripts'],
        crossReferences: { primary: 'chief-ai-security-officer (operating model)', secondary: 'caio-assessment (Domain 10 Security)' },
        agentLayer: 'orchestrator',
      },
      {
        code: 'ZTA',
        name: 'Zero Trust Architecture',
        fullDescription: 'Never trust, always verify access to AI systems and data',
        whyItMatters: 'AI systems span cloud, edge, and on-premises. Perimeter-based security fails in distributed AI architectures. Every request must be authenticated and authorized',
        implementationChecklist: [
          'No implicit trust for any network segment accessing AI systems',
          'Every API call to AI models is authenticated and authorized',
          'Micro-segmentation isolates AI training environments from production',
          'Continuous verification — not just at login but throughout sessions',
          'Data flows between AI components are encrypted and authenticated',
        ],
        codeScaffolding: ['Zero trust network config', 'Micro-segmentation policies', 'Mutual TLS configs'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework - network security)' },
        agentLayer: 'orchestrator',
      },
      {
        code: 'DLP',
        name: 'Data Loss Prevention',
        fullDescription: 'Prevent sensitive data leakage across prompts, outputs, and pipelines',
        whyItMatters: 'AI systems can inadvertently leak PII, trade secrets, or sensitive data through model outputs, training data exposure, or prompt injection attacks',
        implementationChecklist: [
          'DLP policies scan AI model inputs for sensitive data patterns',
          'DLP policies scan AI model outputs for PII/sensitive data leakage',
          'Training data pipelines have DLP gates before ingestion',
          'Model artifacts (weights, embeddings) are classified and protected',
          'DLP alerts trigger incident response workflows',
        ],
        codeScaffolding: ['DLP scanner middleware', 'Regex/pattern configs for PII detection', 'Output sanitization'],
        crossReferences: { primary: 'wharton-ai-governance (Privacy domain)', secondary: 'chief-ai-security-officer (risk-taxonomy - data risks)' },
        agentLayer: 'individual_agents',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 2: DATA PROTECTION
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'dp',
    name: 'Data Protection',
    color: '#FF9800',
    colorName: 'salmon_orange',
    weight: 0.18,
    elementCount: 6,
    purpose: 'Protect the data that flows through AI systems — at rest, in transit, and during processing',
    elements: [
      {
        code: 'RISK',
        name: 'Risk Scoring',
        fullDescription: 'Evaluate potential risks in AI outputs and system behavior',
        whyItMatters: 'Not all AI outputs carry equal risk. A product recommendation has different risk than a medical diagnosis. Risk scoring enables proportionate governance',
        implementationChecklist: [
          'Risk scoring framework defined (impact x likelihood matrix)',
          'AI use cases classified by risk tier (minimal, limited, high, unacceptable)',
          'Risk scores assigned to each AI model/pipeline in inventory',
          'Risk thresholds trigger different governance requirements',
          'Risk scores reviewed when models are retrained or data changes',
        ],
        codeScaffolding: ['Risk scoring engine', 'Risk matrix config', 'Tiered governance trigger rules'],
        crossReferences: { primary: 'chief-ai-security-officer (risk-taxonomy)', secondary: 'melodic-software-ai-governance (EU AI Act risk tiers)' },
        agentLayer: 'data_layer',
      },
      {
        code: 'VDB',
        name: 'Secure Vector Database',
        fullDescription: 'Protect embeddings and retrieval systems from unauthorized access',
        whyItMatters: 'Vector databases in RAG systems contain encoded representations of proprietary data. Unauthorized access to embeddings can reveal sensitive information even without accessing raw data',
        implementationChecklist: [
          'Vector database access requires authentication and authorization',
          'Embedding namespaces are isolated by data sensitivity level',
          'Retrieval queries are logged with user identity and context',
          'Vector database backups are encrypted',
          'Access to embedding generation pipelines is restricted',
        ],
        codeScaffolding: ['Vector DB access control config', 'Namespace isolation templates', 'Query audit logging'],
        crossReferences: { primary: 'caio-assessment (Domain 8 Technology Architecture)' },
        agentLayer: 'data_layer',
      },
      {
        code: 'PIPE',
        name: 'Secure Data Pipelines',
        fullDescription: 'Ensure safe data flow across ingestion, processing, and storage',
        whyItMatters: 'AI data pipelines move sensitive data through multiple stages. Each stage is an attack surface and a potential compliance violation point',
        implementationChecklist: [
          'Data lineage tracked from source through transformation to model input',
          'Pipeline stages have access controls and encryption',
          'Data validation gates at ingestion prevent poisoned data',
          'Pipeline failures trigger alerts and block downstream processing',
          'Pipeline configurations are version-controlled and auditable',
        ],
        codeScaffolding: ['Pipeline config templates', 'Data validation schemas', 'Lineage tracking setup'],
        crossReferences: { primary: 'caio-assessment (Domain 5 Data Governance)', secondary: 'wharton-ai-governance (Data Infrastructure)' },
        agentLayer: 'data_layer',
      },
      {
        code: 'TOKEN',
        name: 'Tokenization',
        fullDescription: 'Replace sensitive data with non-sensitive tokens',
        whyItMatters: 'AI models often do not need raw PII to function. Tokenization lets models work with de-identified data while maintaining analytical value',
        implementationChecklist: [
          'Tokenization applied to PII before it enters AI training pipelines',
          'Token vault is access-controlled and encrypted',
          'De-tokenization requires separate authorization',
          'Tokenization scheme preserves data utility for AI model training',
          'Token mappings are included in data lineage documentation',
        ],
        codeScaffolding: ['Tokenization service config', 'Token vault setup', 'De-tokenization access controls'],
        crossReferences: { primary: 'wharton-ai-governance (Privacy domain - de-identification)' },
        agentLayer: 'data_layer',
      },
      {
        code: 'ENC',
        name: 'Encryption',
        fullDescription: 'Protect data at rest and in transit across AI systems',
        whyItMatters: 'AI training data, model weights, inference results, and inter-service communications all contain sensitive information that must be encrypted',
        implementationChecklist: [
          'Data at rest encrypted (training data, model artifacts, vector databases)',
          'Data in transit encrypted (TLS 1.3 minimum for all AI API endpoints)',
          'Encryption keys managed through a centralized key management service',
          'Key rotation scheduled and automated',
          'Encryption standards documented and compliant with regulatory requirements',
        ],
        codeScaffolding: ['TLS config templates', 'KMS integration', 'Encryption-at-rest configs'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework)', secondary: 'melodic-software-ai-governance (NIST AI RMF security)' },
        agentLayer: 'data_layer',
      },
      {
        code: 'MASK',
        name: 'Data Masking',
        fullDescription: 'Hide or obfuscate sensitive data during AI processing',
        whyItMatters: 'Development and testing environments often use production data. Masking ensures sensitive data is not exposed in non-production AI contexts',
        implementationChecklist: [
          'Masking rules defined for each sensitive data category',
          'Non-production AI environments use masked data',
          'Masking preserves statistical properties needed for model training',
          'Dynamic masking applied based on user role and context',
          'Masking effectiveness validated — no re-identification possible',
        ],
        codeScaffolding: ['Data masking pipeline config', 'Masking rule definitions', 'Validation tests'],
        crossReferences: { primary: 'wharton-ai-governance (Privacy domain)', secondary: 'chief-ai-security-officer (data risks)' },
        agentLayer: 'data_layer',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 3: RISK MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'rm',
    name: 'Risk Management',
    color: '#FFEB3B',
    colorName: 'yellow',
    weight: 0.18,
    elementCount: 5,
    purpose: 'Identify, assess, and mitigate risks specific to AI systems',
    elements: [
      {
        code: 'DRIFT',
        name: 'Model Drift',
        fullDescription: 'Detect performance degradation over time',
        whyItMatters: 'AI models degrade as the real world changes. A model trained on 2024 data may produce increasingly wrong results in 2026. Drift detection prevents silent failures',
        implementationChecklist: [
          'Drift detection metrics defined (PSI, KL divergence, accuracy decay)',
          'Drift monitoring runs on scheduled intervals',
          'Drift thresholds trigger alerts and human review',
          'Retraining pipelines can be triggered by drift alerts',
          'Historical drift data is retained for trend analysis',
        ],
        codeScaffolding: ['Drift detection service', 'Monitoring dashboard config', 'Alert rules and retraining triggers'],
        crossReferences: { primary: 'caio-assessment (Domain 12 Continuous Improvement)', secondary: 'wharton-ai-governance (Overfitting risks)' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'BIAS',
        name: 'Bias Detection',
        fullDescription: 'Identify unfair or skewed AI outputs',
        whyItMatters: 'Biased AI causes real harm — unfair hiring, discriminatory lending, unequal healthcare. Detection is the first step toward mitigation',
        implementationChecklist: [
          'Fairness metrics selected and documented (demographic parity, equalized odds, etc.)',
          'Bias testing performed pre-deployment and post-deployment',
          'Protected attributes identified and tested across',
          'Bias detection results documented in model cards',
          'Bias remediation actions are tracked to completion',
        ],
        codeScaffolding: ['Bias detection pipeline', 'Fairness metrics calculator', 'Model card bias section template'],
        crossReferences: { primary: 'wharton-ai-governance (Domain 3 Algorithmic Bias and Fairness)', secondary: 'chief-ai-security-officer (risk-taxonomy)' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'HALL',
        name: 'Hallucination Detection',
        fullDescription: 'Monitor incorrect or fabricated responses',
        whyItMatters: 'LLMs generate plausible-sounding but factually wrong content. In enterprise contexts, hallucinations can cause financial, legal, or safety harm',
        implementationChecklist: [
          'Hallucination detection mechanisms in place for generative AI outputs',
          'Ground truth comparison for factual claims where possible',
          'Confidence scoring attached to model outputs',
          'High-stakes outputs require human verification before action',
          'Hallucination rates tracked as a quality metric over time',
        ],
        codeScaffolding: ['Hallucination detection middleware', 'Confidence scoring service', 'Ground truth comparison'],
        crossReferences: { primary: 'caio-assessment (Domain 7 Ethics)', secondary: 'wharton-ai-governance (Explainability)' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'THREAT',
        name: 'Threat Intelligence',
        fullDescription: 'Identify emerging AI vulnerabilities and attack vectors',
        whyItMatters: 'AI systems face unique attacks — adversarial inputs, prompt injection, model extraction, data poisoning. Threat intelligence keeps defenses current',
        implementationChecklist: [
          'AI-specific threat intelligence feeds monitored',
          'OWASP Top 10 for LLM Applications reviewed and mitigated',
          'Prompt injection defenses implemented and tested',
          'Adversarial input testing performed regularly',
          'Threat landscape reviewed quarterly and controls updated',
        ],
        codeScaffolding: ['Threat monitoring config', 'Prompt injection defense middleware', 'Adversarial testing suite'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework - attack surfaces)', secondary: 'chief-ai-security-officer (risk-taxonomy - security risks)' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'REDT',
        name: 'Red Team Testing',
        fullDescription: 'Simulate attacks to identify system weaknesses',
        whyItMatters: 'Defensive measures alone are insufficient. Red teaming validates that security controls actually work against realistic attack scenarios',
        implementationChecklist: [
          'Red team exercises scheduled (at least annually or before major releases)',
          'Red team scope covers prompt injection, data extraction, model manipulation',
          'Red team findings are documented and prioritized',
          'Remediation actions tracked to completion',
          'Red team methodology is documented and repeatable',
        ],
        codeScaffolding: ['Red team playbook templates', 'Attack scenario configs', 'Findings tracker'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework)', secondary: 'melodic-software-ai-governance (NIST AI RMF MANAGE)' },
        agentLayer: 'individual_agents',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 4: COMPLIANCE & GOVERNANCE
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cg',
    name: 'Compliance & Governance',
    color: '#2196F3',
    colorName: 'blue',
    weight: 0.20,
    elementCount: 6,
    purpose: 'Ensure AI systems meet regulatory and organisational policy requirements',
    elements: [
      {
        code: 'DOC',
        name: 'Documentation',
        fullDescription: 'Maintain clear records of models, data, and workflows',
        whyItMatters: 'Without documentation, AI systems are black boxes. Regulators, auditors, and teams need documentation to understand, verify, and improve AI systems',
        implementationChecklist: [
          'Model cards created for every production AI model',
          'Data sheets created for every training/evaluation dataset',
          'Architecture documentation current and accessible',
          'Change logs maintained for model updates and retraining',
          'Documentation reviewed and updated on a defined schedule',
        ],
        codeScaffolding: ['Model card templates', 'Data sheet templates', 'Architecture doc templates', 'Changelog formats'],
        crossReferences: { primary: 'caio-assessment (Domain 9 Documentation)', secondary: 'wharton-ai-governance (Transparency)' },
        agentLayer: 'compliance_layer',
      },
      {
        code: 'AUDIT',
        name: 'Auditability',
        fullDescription: 'Enable review and verification of AI system behavior',
        whyItMatters: 'Regulators, internal auditors, and affected individuals need to verify AI decisions. Auditability is a prerequisite for accountability',
        implementationChecklist: [
          'Audit trail captures all AI model decisions with inputs and outputs',
          'Audit logs are tamper-proof and retained per policy',
          'Audit access controls separate auditors from operators',
          'Audit reports can be generated on demand',
          'External audit readiness tested annually',
        ],
        codeScaffolding: ['Audit logging service', 'Tamper-proof storage config', 'Audit report generator'],
        crossReferences: { primary: 'wharton-ai-governance (Governance domain)', secondary: 'caio-assessment (Domain 11 Governance)' },
        agentLayer: 'compliance_layer',
      },
      {
        code: 'TRACE',
        name: 'Traceability',
        fullDescription: 'Maintain logs of AI decisions and data usage',
        whyItMatters: 'When an AI system makes a wrong or harmful decision, traceability lets you understand what happened — what data was used, what model version, what parameters',
        implementationChecklist: [
          'Every AI inference logged with input, output, model version, timestamp, user',
          'Data lineage tracked from source to model output',
          'Model version history maintained with deployment timestamps',
          'Trace data linked to business outcomes for impact analysis',
          'Trace retention policy defined and enforced',
        ],
        codeScaffolding: ['Tracing middleware', 'OpenTelemetry config for AI pipelines', 'Lineage tracking'],
        crossReferences: { primary: 'caio-assessment (Domain 9 Documentation)', secondary: 'wharton-ai-governance (Explainability)' },
        agentLayer: 'compliance_layer',
      },
      {
        code: 'ISO42K',
        name: 'ISO 42001',
        fullDescription: 'AI management system standard for governance and compliance',
        whyItMatters: 'ISO 42001 is the first international standard specifically for AI management systems. Certification signals governance maturity to customers, regulators, and partners',
        implementationChecklist: [
          'Gap analysis performed against ISO 42001 requirements',
          'AI management system (AIMS) established with defined scope',
          'Risk assessment process aligned with ISO 42001 Annex A controls',
          'Internal audit program established for AIMS',
          'Management review of AIMS conducted at planned intervals',
        ],
        codeScaffolding: ['ISO 42001 gap analysis template', 'AIMS documentation structure', 'Audit checklist'],
        crossReferences: { primary: 'chief-ai-security-officer (regulatory - ISO/IEC 42001)', secondary: 'melodic-software-ai-governance (NIST AI RMF mapping)' },
        agentLayer: 'compliance_layer',
      },
      {
        code: 'AIACT',
        name: 'EU AI Act',
        fullDescription: 'Regulatory framework for risk-based AI governance',
        whyItMatters: 'The EU AI Act applies to any AI system affecting EU citizens — regardless of where the provider is based. Non-compliance carries fines up to 7% of global revenue',
        implementationChecklist: [
          'All AI systems classified by EU AI Act risk tier',
          'High-risk systems meet conformity assessment requirements',
          'Transparency obligations met for limited-risk systems',
          'Prohibited AI practices identified and eliminated',
          'Compliance timeline tracked against EU AI Act implementation dates',
        ],
        codeScaffolding: ['Risk classification engine', 'Conformity assessment checklist', 'Compliance tracker'],
        crossReferences: { primary: 'melodic-software-ai-governance (EU AI Act classification)', secondary: 'wharton-ai-governance (Governance)' },
        agentLayer: 'compliance_layer',
      },
      {
        code: 'GDPR',
        name: 'General Data Protection Regulation',
        fullDescription: 'Ensure AI systems comply with data privacy laws',
        whyItMatters: 'AI processing of personal data triggers GDPR obligations. Automated decision-making has specific GDPR requirements including the right to human review',
        implementationChecklist: [
          'DPIA completed for AI systems processing personal data',
          'Legal basis for processing established (consent, legitimate interest, etc.)',
          'Data subject rights implemented (access, rectification, erasure, objection)',
          'Article 22 compliance for automated decision-making (human review option)',
          'Data processing agreements in place with AI service providers',
        ],
        codeScaffolding: ['DPIA template', 'Data subject rights API endpoints', 'Consent management config'],
        crossReferences: { primary: 'wharton-ai-governance (Privacy domain)', secondary: 'melodic-software-ai-governance (GDPR checklist)' },
        agentLayer: 'compliance_layer',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 5: MONITORING & OBSERVABILITY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mo',
    name: 'Monitoring & Observability',
    color: '#9C27B0',
    colorName: 'purple',
    weight: 0.12,
    elementCount: 6,
    purpose: 'Provide visibility into AI system behaviour, performance, and usage patterns',
    elements: [
      {
        code: 'MON',
        name: 'Monitoring',
        fullDescription: 'Track system performance and reliability in real time',
        whyItMatters: 'AI systems can fail silently — accuracy degrades, latency increases, errors go unnoticed. Real-time monitoring catches problems before they impact users',
        implementationChecklist: [
          'Real-time monitoring dashboards for all production AI models',
          'Key metrics tracked (accuracy, latency, throughput, error rate)',
          'Alerting configured for metric threshold breaches',
          'Monitoring covers model performance AND infrastructure health',
          'Historical metrics retained for trend analysis and SLA compliance',
        ],
        codeScaffolding: ['Monitoring dashboard config', 'Prometheus/Grafana templates', 'Alert rules'],
        crossReferences: { primary: 'caio-assessment (Domain 12 Continuous Improvement)' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'ANOM',
        name: 'Anomaly Detection',
        fullDescription: 'Identify unusual patterns in AI behavior',
        whyItMatters: 'Anomalies can indicate attacks (adversarial inputs, data poisoning), model degradation, or data quality issues. Early detection prevents cascading failures',
        implementationChecklist: [
          'Anomaly detection monitors AI model inputs for distribution shifts',
          'Anomaly detection monitors AI model outputs for unexpected patterns',
          'Baseline behavior profiles established for each production model',
          'Anomaly alerts trigger investigation workflows',
          'False positive rate tracked and detection tuned accordingly',
        ],
        codeScaffolding: ['Anomaly detection service', 'Baseline profiling', 'Statistical monitoring config'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework)', secondary: 'caio-assessment (Domain 12)' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'LOG',
        name: 'Logging',
        fullDescription: 'Record inputs, outputs, and system actions',
        whyItMatters: 'Logging is the raw material for auditing, monitoring, tracing, and incident investigation. Without comprehensive logging, all other observability elements are incomplete',
        implementationChecklist: [
          'Structured logging format standardized across all AI components',
          'Log levels defined (DEBUG, INFO, WARN, ERROR, CRITICAL)',
          'Sensitive data redacted from logs (PII, credentials)',
          'Log aggregation and search infrastructure in place',
          'Log retention policy defined and enforced',
        ],
        codeScaffolding: ['Logging config templates', 'Log format standards', 'Aggregation pipeline config'],
        crossReferences: { primary: 'All skills — logging is foundational' },
        agentLayer: 'individual_agents',
      },
      {
        code: 'LAT',
        name: 'Latency Monitoring',
        fullDescription: 'Track response times across AI systems',
        whyItMatters: 'AI latency directly impacts user experience and can indicate system health issues. SLA compliance requires latency tracking',
        implementationChecklist: [
          'Latency measured at each stage of AI inference pipeline',
          'Latency SLAs defined for each AI service',
          'Latency alerts trigger when SLAs are at risk',
          'Latency trends tracked for capacity planning',
          'Latency optimization recommendations generated from monitoring data',
        ],
        codeScaffolding: ['Latency monitoring middleware', 'SLA config', 'Performance dashboard'],
        crossReferences: { primary: 'caio-assessment (Domain 8 Technology Architecture)' },
        agentLayer: 'inter_agent_communication',
      },
      {
        code: 'USAGE',
        name: 'Usage Analytics',
        fullDescription: 'Monitor how AI systems are used across teams',
        whyItMatters: 'Understanding usage patterns reveals shadow AI, underutilized investments, unexpected use cases, and potential misuse',
        implementationChecklist: [
          'Usage metrics collected for all AI systems (queries, users, departments)',
          'Usage trends analyzed monthly',
          'Shadow AI discovery process identifies unauthorized AI tool usage',
          'Usage data informs capacity planning and cost optimization',
          'Usage patterns reviewed for potential misuse indicators',
        ],
        codeScaffolding: ['Usage analytics dashboard', 'Shadow AI scanner', 'Usage reporting templates'],
        crossReferences: { primary: 'caio-assessment (Domain 4 AI Portfolio Management)' },
        agentLayer: 'output_layer',
      },
      {
        code: 'PERF',
        name: 'Performance Tracking',
        fullDescription: 'Evaluate accuracy, efficiency, and output quality',
        whyItMatters: 'Performance tracking closes the loop — it tells you whether your AI systems are actually delivering value and whether governance measures are working',
        implementationChecklist: [
          'Performance metrics defined for each AI model (accuracy, precision, recall, F1)',
          'Performance baselines established and tracked over time',
          'Performance degradation triggers review and potential retraining',
          'Performance reports generated for stakeholders on schedule',
          'Performance compared against business KPIs to measure value delivery',
        ],
        codeScaffolding: ['Performance tracking dashboard', 'Metric calculation pipeline', 'Reporting templates'],
        crossReferences: { primary: 'wharton-ai-governance (Metrics Pyramid)', secondary: 'caio-assessment (Domain 12)' },
        agentLayer: 'output_layer',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 6: AUDIT & ACCOUNTABILITY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'aa',
    name: 'Audit & Accountability',
    color: '#E91E63',
    colorName: 'pink_rose',
    weight: 0.12,
    elementCount: 6,
    purpose: 'Establish clear responsibility chains and human oversight for AI decisions',
    elements: [
      {
        code: 'POLICY',
        name: 'Policy Enforcement',
        fullDescription: 'Ensure AI actions follow predefined rules and constraints',
        whyItMatters: 'Policies translate governance principles into enforceable rules. Without enforcement, policies are just documents gathering dust',
        implementationChecklist: [
          'AI acceptable use policy published and acknowledged by all users',
          'Automated policy checks in CI/CD pipelines for AI models',
          'Policy violations trigger alerts and block deployment',
          'Policy exceptions require documented approval',
          'Policy compliance reported to governance board regularly',
        ],
        codeScaffolding: ['Policy-as-code configs', 'CI/CD policy gates', 'Policy violation alerting'],
        crossReferences: { primary: 'chief-ai-security-officer (operating model - governance committees)', secondary: 'wharton-ai-governance (Governance domain)' },
        agentLayer: 'output_layer',
      },
      {
        code: 'RESP',
        name: 'Responsibility Mapping',
        fullDescription: 'Define ownership of AI decisions and outcomes',
        whyItMatters: 'When an AI system causes harm, someone must be accountable. Without clear responsibility mapping, organizations face legal liability and governance gaps',
        implementationChecklist: [
          'RACI matrix defined for each AI system (Responsible, Accountable, Consulted, Informed)',
          'Model owners assigned for every production AI model',
          'Data owners assigned for every training/evaluation dataset',
          'Escalation paths documented for AI incidents',
          'Responsibility reviewed when team changes occur',
        ],
        codeScaffolding: ['RACI matrix template', 'Ownership registry', 'Escalation workflow config'],
        crossReferences: { primary: 'wharton-ai-governance (Governance domain)', secondary: 'caio-assessment (Domain 11 Governance)' },
        agentLayer: 'orchestrator',
      },
      {
        code: 'RCAUSE',
        name: 'Root Cause Analysis',
        fullDescription: 'Identify reasons behind AI failures or incorrect outputs',
        whyItMatters: 'Fixing symptoms without understanding root causes leads to recurring failures. Structured RCA prevents the same AI failures from happening again',
        implementationChecklist: [
          'RCA process defined for AI incidents (5 Whys, fishbone, fault tree)',
          'RCA triggered automatically for high-severity AI incidents',
          'RCA findings documented and shared across AI teams',
          'Corrective actions tracked to implementation and verification',
          'RCA database maintained for pattern analysis across incidents',
        ],
        codeScaffolding: ['RCA template', 'Incident tracking integration', 'Corrective action tracker'],
        crossReferences: { primary: 'chief-ai-security-officer (risk-taxonomy)', secondary: 'caio-assessment (Domain 12)' },
        agentLayer: 'output_layer',
      },
      {
        code: 'ESC',
        name: 'Escalation',
        fullDescription: 'Route high-risk cases to human reviewers',
        whyItMatters: 'Not all AI decisions should be autonomous. Escalation ensures that edge cases, high-risk scenarios, and confidence-low outputs get human attention',
        implementationChecklist: [
          'Escalation criteria defined (confidence thresholds, risk levels, anomaly flags)',
          'Escalation routing rules map to appropriate human reviewers',
          'Escalation response time SLAs defined',
          'Escalated cases tracked and outcomes fed back to model improvement',
          'Escalation volume monitored — too many escalations indicates model problems',
        ],
        codeScaffolding: ['Escalation engine config', 'Routing rules', 'SLA monitoring', 'Feedback loop'],
        crossReferences: { primary: 'chief-ai-security-officer (AIRS framework)', secondary: 'wharton-ai-governance (Governance)' },
        agentLayer: 'output_layer',
      },
      {
        code: 'APPROVE',
        name: 'Approval Systems',
        fullDescription: 'Require human validation before critical outputs are executed',
        whyItMatters: 'For high-stakes AI outputs (financial decisions, medical recommendations, legal actions), automated execution without human approval creates unacceptable risk',
        implementationChecklist: [
          'Critical AI outputs identified that require human approval',
          'Approval workflows defined with appropriate approvers',
          'Approval decisions logged with approver identity and rationale',
          'Approval SLAs balance speed with governance requirements',
          'Override mechanisms exist with additional documentation requirements',
        ],
        codeScaffolding: ['Approval workflow engine', 'Approval UI components', 'Decision logging'],
        crossReferences: { primary: 'chief-ai-security-officer (operating model)', secondary: 'wharton-ai-governance (Governance)' },
        agentLayer: 'output_layer',
      },
      {
        code: 'HITL',
        name: 'Human-in-the-Loop',
        fullDescription: 'Introduce human oversight in critical decision workflows',
        whyItMatters: 'HITL is the overarching principle — humans must remain in control of AI systems, especially for decisions affecting people\'s lives, livelihoods, and rights',
        implementationChecklist: [
          'HITL requirements defined based on AI risk classification',
          'Human review points designed into AI decision workflows',
          'Humans have sufficient information and tools to meaningfully review AI outputs',
          'HITL effectiveness measured (are humans actually catching errors?)',
          'HITL does not create rubber-stamping — reviewers are empowered to override',
        ],
        codeScaffolding: ['HITL workflow orchestrator', 'Review UI templates', 'Override mechanisms'],
        crossReferences: { primary: 'wharton-ai-governance (Governance domain - explainability for reviewers)', secondary: 'caio-assessment (Domain 7)' },
        agentLayer: 'output_layer',
      },
    ],
  },
];

// =============================================================================
// AGENT ARCHITECTURE LAYERS
// =============================================================================

export interface AgentArchLayer {
  layer: string;
  description: string;
  criticalElements: string[];
  rationale: string;
}

export const AGENT_ARCHITECTURE_LAYERS: AgentArchLayer[] = [
  {
    layer: 'orchestrator',
    description: 'Central coordination agent that routes tasks and manages workflow',
    criticalElements: ['RBAC', 'IAM', 'ZTA', 'POLICY', 'AUDIT', 'RESP', 'ESC', 'APPROVE'],
    rationale: 'The orchestrator has highest privilege — it can invoke any sub-agent. Access control, policy enforcement, and accountability are paramount.',
  },
  {
    layer: 'individual_agents',
    description: 'Specialized agents that perform domain-specific tasks',
    criticalElements: ['LOG', 'TRACE', 'BIAS', 'HALL', 'DLP', 'MASK', 'MON', 'DRIFT'],
    rationale: 'Each agent processes data and generates outputs. Monitor for bias, hallucination, and data leakage at the individual agent level.',
  },
  {
    layer: 'data_layer',
    description: 'Vector databases, embeddings, training data, retrieval systems',
    criticalElements: ['VDB', 'PIPE', 'TOKEN', 'ENC', 'RISK'],
    rationale: 'The data layer contains the raw material. Protect it with encryption, tokenization, and secure pipeline controls.',
  },
  {
    layer: 'inter_agent_communication',
    description: 'Messages and data passed between agents',
    criticalElements: ['SSO', 'MFA', 'TRACE', 'ANOM', 'LAT'],
    rationale: 'Agent-to-agent communication is an attack surface. Authenticate, trace, and monitor all inter-agent messages.',
  },
  {
    layer: 'output_layer',
    description: 'Final outputs delivered to users or downstream systems',
    criticalElements: ['HITL', 'APPROVE', 'ESC', 'PERF', 'USAGE', 'RCAUSE'],
    rationale: 'Outputs have real-world impact. Gate high-risk outputs with human review, track performance, and enable root cause analysis for failures.',
  },
  {
    layer: 'compliance_layer',
    description: 'Cross-cutting compliance and documentation requirements',
    criticalElements: ['DOC', 'ISO42K', 'AIACT', 'GDPR', 'POLICY'],
    rationale: 'Compliance applies across all layers. Documentation, regulatory adherence, and policy enforcement are continuous obligations.',
  },
];

// =============================================================================
// CROSS-REGULATION PRIORITY
// =============================================================================

export const CROSS_REGULATION_PRIORITY = {
  universalMustHaves: { description: 'Required by 5+ regulations', elements: ['DOC', 'AUDIT', 'LOG', 'POLICY', 'HITL', 'MON'] },
  highPriority: { description: 'Required by 3-4 regulations', elements: ['RISK', 'BIAS', 'RESP', 'PERF', 'DLP', 'MASK', 'TOKEN', 'ENC'] },
  standard: { description: 'Required by 1-2 regulations', elements: ['DRIFT', 'TRACE', 'HALL', 'THREAT', 'REDT', 'VDB', 'PIPE', 'ANOM', 'USAGE', 'LAT'] },
};

// =============================================================================
// SYSTEM TYPE EMPHASIS
// =============================================================================

export interface SystemTypeEmphasis {
  key: string;
  description: string;
  emphasize: string[];
  rationale: string;
}

export const SYSTEM_TYPE_EMPHASIS: SystemTypeEmphasis[] = [
  { key: 'agentic_ai', description: 'Multi-agent systems, autonomous workflows', emphasize: ['RBAC', 'ZTA', 'HITL', 'APPROVE', 'ESC', 'TRACE', 'ANOM', 'THREAT'], rationale: 'Agents take autonomous actions — accountability and access control are critical' },
  { key: 'rag_systems', description: 'Retrieval-augmented generation pipelines', emphasize: ['VDB', 'PIPE', 'HALL', 'DLP', 'MASK', 'TOKEN', 'TRACE'], rationale: 'Protect the retrieval layer, prevent data leakage, detect hallucinations' },
  { key: 'customer_facing', description: 'Chatbots, recommendation engines, decision support', emphasize: ['BIAS', 'GDPR', 'AIACT', 'HITL', 'PERF', 'LAT', 'USAGE', 'DOC'], rationale: 'User-facing risks and regulatory exposure are the priorities' },
  { key: 'internal_tools', description: 'Analytics, automation, productivity tools', emphasize: ['RBAC', 'LOG', 'MON', 'DOC', 'USAGE', 'POLICY'], rationale: 'Lighter governance but essential controls still apply' },
];

// =============================================================================
// HELPER: Flatten all elements for lookup
// =============================================================================

export function getAllElements(): PeriodicElement[] {
  return PERIODIC_TABLE_CATEGORIES.flatMap(c => c.elements);
}

export function getElementByCode(code: string): PeriodicElement | undefined {
  return getAllElements().find(e => e.code === code);
}

export function getCategoryForElement(code: string): PeriodicCategory | undefined {
  return PERIODIC_TABLE_CATEGORIES.find(c => c.elements.some(e => e.code === code));
}

// Grid layout: 7 cols, arranged for periodic-table aesthetic
// Row 0: IAC (7 elements)
// Row 1: DP (6 elements, offset)
// Row 2: RM (5 elements, offset)
// Row 3: CG (6 elements, offset)
// Row 4: MO (6 elements, offset)
// Row 5: AA (6 elements, offset)
export const GRID_LAYOUT = PERIODIC_TABLE_CATEGORIES.map(cat => ({
  categoryId: cat.id,
  categoryName: cat.name,
  color: cat.color,
  elements: cat.elements.map(e => e.code),
}));
