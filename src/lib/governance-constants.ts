export const TRUST_LAYERS = [
  {
    num: 1, slug: 'intent-alignment', name: 'Intent Alignment',
    description: 'Is the agent solving the right problem? Does the objective align with organizational values and user needs?',
    questions: [
      'Does the agent\'s objective serve genuine user needs?',
      'Could the agent\'s goal be misinterpreted or gamed?',
      'Is there alignment between stated and actual optimization targets?',
    ],
  },
  {
    num: 2, slug: 'data-integrity', name: 'Data Integrity',
    description: 'Is the training and operational data accurate, representative, unbiased, and ethically sourced?',
    questions: [
      'Has training data been audited for bias and representation?',
      'Is operational data quality monitored continuously?',
      'Are data provenance and lineage documented?',
    ],
  },
  {
    num: 3, slug: 'behavioral-guardrails', name: 'Behavioral Guardrails',
    description: 'Does the agent stay within its authority boundary? Are there effective constraints on undesirable behaviors?',
    questions: [
      'Are input and output guardrails implemented?',
      'Is the authority boundary clearly defined and enforced?',
      'Can the agent be stopped or rolled back instantly?',
    ],
  },
  {
    num: 4, slug: 'transparency-explainability', name: 'Transparency & Explainability',
    description: 'Can stakeholders understand how and why the agent makes decisions?',
    questions: [
      'Can the agent explain its reasoning for any given output?',
      'Is the appropriate level of transparency provided to each audience?',
      'Are AI-generated outputs clearly labeled?',
    ],
  },
  {
    num: 5, slug: 'human-oversight', name: 'Human Oversight',
    description: 'Are there effective human-in-the-loop controls proportional to the stakes?',
    questions: [
      'Are HITL gates placed at appropriate decision points?',
      'Can humans effectively override agent decisions?',
      'Is the escalation path clear and tested?',
    ],
  },
  {
    num: 6, slug: 'accountability-audit', name: 'Accountability & Audit',
    description: 'Is there a clear chain of accountability? Can agent actions be audited and attributed?',
    questions: [
      'Is every agent action logged with full context?',
      'Is there clear ownership for agent failures?',
      'Are audit trails tamper-resistant?',
    ],
  },
  {
    num: 7, slug: 'continuous-improvement', name: 'Continuous Improvement',
    description: 'Is the agent getting better over time? Are failures systematically captured?',
    questions: [
      'Is there a feedback loop from production to training?',
      'Are failure modes catalogued and addressed?',
      'Is drift detected and corrected?',
    ],
  },
] as const;

export const WHARTON_DOMAINS = [
  { key: 'strategy', name: 'AI Strategy Alignment', source: 'Wharton',
    questions: [
      'Is this initiative aligned with broader organizational strategy?',
      'Is there a balanced portfolio of AI projects (short-term wins + long-term)?',
      'Is the necessary data infrastructure in place?',
    ]},
  { key: 'innovation', name: 'Innovation & Org Readiness', source: 'Wharton',
    questions: [
      'Is this using AI for recombination innovation (good fit) vs. radical pioneering?',
      'Does the organizational structure support AI-driven innovation?',
      'Are AI skills distributed broadly (not siloed)?',
    ]},
  { key: 'bias', name: 'Algorithmic Bias & Fairness', source: 'Wharton',
    questions: [
      'Has training data been audited for depth, diversity, and historical biases?',
      'Have proxy variables been identified and assessed?',
      'Which fairness definition is being applied, and is the trade-off documented?',
      'Has disparate impact analysis been conducted?',
    ]},
  { key: 'ethics', name: 'Manipulation & Ethical Boundaries', source: 'Wharton',
    questions: [
      'Would users choose this outcome if they fully understood the algorithmic relationship?',
      'Could this system exploit vulnerable populations?',
      'Does the initiative respect Belmont principles (consent, beneficence, justice)?',
    ]},
  { key: 'privacy', name: 'Data Protection & Privacy', source: 'Wharton',
    questions: [
      'Has the initiative been evaluated at each of the 5 privacy lifecycle stages?',
      'Is data used only for the context in which consent was given?',
      'Could aggregated data create inferential privacy violations?',
      'Are technical privacy measures in place (federated learning, differential privacy)?',
    ]},
  { key: 'governance', name: 'Governance, Explainability & Transparency', source: 'Wharton',
    questions: [
      'Is there a human in the loop for critical decisions?',
      'Is the appropriate level of transparency provided to each stakeholder?',
      'Is there a regular audit and stress-testing process?',
      'Is the model\'s explainability appropriate for its application domain?',
    ]},
  { key: 'readiness', name: 'Enterprise AI Readiness & Maturity', source: 'Enterprise AI',
    questions: [
      'Where is the organization on the PEEK maturity scale (Foundation/Enhancement/Transformation)?',
      'Is the organization trying to skip maturity levels?',
    ]},
  { key: 'implementation', name: 'Implementation & Technology Architecture', source: 'Enterprise AI',
    questions: [
      'Which layer of the AI Scaling Pyramid is the organization on?',
      'Is the BRIDGE roadmap being followed?',
      'Is there a cross-functional ownership model (business/technical/product)?',
      'Has the technology architecture been assessed using SCALE criteria?',
    ]},
  { key: 'change', name: 'Change Management & Culture', source: 'Enterprise AI',
    questions: [
      'Has the ADAPT model been followed (Assess, Design, Align, Prepare, Track)?',
      'Is there psychological safety for AI experimentation?',
      'Are there innovation rituals (weekly AI hours, monthly fail-forward)?',
    ]},
  { key: 'measurement', name: 'Measurement & ROI', source: 'Enterprise AI',
    questions: [
      'Are leading AND lagging indicators tracked?',
      'Is the 5Q Impact Framework being applied?',
      'Has the GARD risk governance process been implemented?',
      'Is there a metrics pyramid connecting operational → tactical → strategic metrics?',
    ]},
] as const;

export const COMPLIANCE_FRAMEWORKS = [
  {
    framework: 'DPDP',
    name: 'Digital Personal Data Protection Act 2023 (India)',
    requirements: [
      'Lawful purpose for data processing',
      'Consent obtained before processing personal data',
      'Data principal rights implemented (access, correction, erasure)',
      'Data fiduciary obligations met',
      'Cross-border data transfer compliant',
    ],
  },
  {
    framework: 'GDPR',
    name: 'General Data Protection Regulation (EU)',
    requirements: [
      'Lawful basis for processing identified',
      'Data minimization principle followed',
      'Purpose limitation enforced',
      'Right to explanation for automated decisions (Art. 22)',
      'Data Protection Impact Assessment completed',
      'Data subject rights implemented',
    ],
  },
  {
    framework: 'ISACA',
    name: 'ISACA 2025 AI Governance',
    requirements: [
      'AI governance framework established',
      'AI risk management process defined',
      'AI audit procedures in place',
      'AI ethics guidelines documented',
      'AI incident response plan exists',
    ],
  },
  {
    framework: 'OWASP',
    name: 'OWASP LLM Top 10',
    requirements: [
      'LLM01: Prompt injection mitigated',
      'LLM02: Insecure output handling addressed',
      'LLM03: Training data poisoning controls',
      'LLM04: Model denial of service protections',
      'LLM06: Sensitive information disclosure prevented',
      'LLM07: Insecure plugin/tool design reviewed',
      'LLM09: Overreliance on LLM output mitigated',
    ],
  },
  {
    framework: 'Harvard8',
    name: 'Harvard 8 AI Ethics Principles',
    requirements: [
      'Privacy protections implemented',
      'Accountability chain defined',
      'Safety & security measures in place',
      'Transparency & explainability provided',
      'Fairness & non-discrimination verified',
      'Human control maintained',
      'Professional responsibility embedded',
      'Promotion of human values considered',
    ],
  },
  {
    framework: 'Belmont',
    name: 'Belmont Principles',
    requirements: [
      'Informed consent: users understand algorithmic relationship',
      'Beneficence: system does no serious harm',
      'Justice: no exploitation of vulnerable populations',
      'Review board: ethics review process exists',
    ],
  },
] as const;
