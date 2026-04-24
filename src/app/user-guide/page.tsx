import Link from 'next/link';
import {
  BookMarked, FolderKanban, BookOpen, Sparkles, Shield, Award,
  BarChart3, FileText, Mic, Home, Users,
  Info, ChevronRight, AlertTriangle, CheckCircle, Lightbulb,
  ArrowRight, Layers, Target, Settings, Search, Upload,
} from 'lucide-react';
import Card from '@/components/ui/Card';

/* ─── Table of Contents ─── */
const TOC = [
  { id: 'overview', label: '1. Portal Overview' },
  { id: 'getting-started', label: '2. Getting Started' },
  { id: 'home', label: '3. Home (Command Center)' },
  { id: 'playbook', label: '4. Playbook Module' },
  { id: 'projects', label: '5. Projects Module' },
  { id: 'advisor', label: '6. KB Advisor Module' },
  { id: 'governance', label: '7. Governance Module' },
  { id: 'caio', label: '8. CAIO Module' },
  { id: 'evaluate', label: '9. Evaluate Module' },
  { id: 'templates', label: '10. Template Studio' },
  { id: 'documents', label: '11. Documents Module' },
  { id: 'interview', label: '12. Interview Prep' },
  { id: 'settings', label: '13. Settings & Administration' },
  { id: 'rbac', label: '14. Role-Based Access Control' },
  { id: 'workflows', label: '15. Common Workflows' },
  { id: 'kb-reference', label: '16. Knowledge Base Reference' },
  { id: 'troubleshooting', label: '17. Troubleshooting & FAQ' },
];

/* ─── Reusable Section Components ─── */
function SectionHeader({ id, number, title, icon: Icon, color, bg }: {
  id: string; number: string; title: string; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div id={id} className="scroll-mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
          <Icon size={18} />
        </div>
        <h2 className="text-[18px] font-bold text-[var(--text)]">
          <span className="text-[var(--text-4)] mr-1.5">{number}</span>{title}
        </h2>
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-[14px] font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
        <ChevronRight size={14} className="text-[var(--accent)]" />{title}
      </h3>
      <div className="text-[13px] text-[var(--text-2)] leading-relaxed pl-5">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 mb-4">
      <Lightbulb size={14} className="text-blue-600 mt-0.5 shrink-0" />
      <p className="text-[12px] text-blue-700 leading-relaxed">{children}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mb-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-[7px]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-1.5 mb-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-[var(--accent)] font-bold text-[12px] min-w-[18px] mt-[1px]">{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/* ─── Main Page ─── */
export default function UserGuidePage() {
  return (
    <div className="flex flex-col gap-6 max-w-[900px]">
      {/* Header */}
      <div>
        <div className="eyebrow mb-2">Documentation</div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e0f2fe', color: '#0e7490' }}>
            <BookMarked size={22} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">User Guide</h1>
        </div>
        <p className="text-[15px] text-[var(--text-3)] max-w-[720px]">
          Complete reference for the Agent Deployment Playbook (ADP) portal. This guide covers every module, workflow,
          governance framework, and administrative function available in the platform.
        </p>
      </div>

      {/* Table of Contents */}
      <Card>
        <h2 className="text-[15px] font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <Layers size={16} className="text-[var(--accent)]" /> Table of Contents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {TOC.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent)] transition-colors">
              <ArrowRight size={12} className="text-[var(--text-4)]" />
              {item.label}
            </a>
          ))}
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: PORTAL OVERVIEW */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="overview" number="1." title="Portal Overview" icon={Info} color="#0e7490" bg="#e0f2fe" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The <strong>Agent Deployment Playbook (ADP)</strong> is a comprehensive operational portal designed by Padmasani Srimadhan
            for managing the full lifecycle of AI agent deployments. It provides a structured methodology from initial ideation through
            production operations and continuous evolution.
          </p>
          <p>
            The platform combines a <strong>7-phase deployment lifecycle</strong> with integrated governance, evaluation, and knowledge management
            capabilities. It is powered by <strong>1,468 knowledge base concepts</strong> across 5 curated tiers, 21 document templates,
            TRiSM governance assessments, CAIO maturity evaluations, and AI-powered advisory features using Claude.
          </p>

          <SubSection title="Core Capabilities">
            <BulletList items={[
              'Structured 7-phase agent deployment methodology (Ideation, Architecture, Prototype, Pilot, Production, Operations, Evolution)',
              'Project tracking with phase progression, step deliverables, and gate check approvals',
              'TRiSM governance assessments with 7 trust layers and 10 Wharton domain scoring',
              'CAIO 12-domain AI maturity evaluations powered by Claude Opus analysis',
              'Weighted decision matrix for framework, architecture, and model comparisons',
              'Template studio with 21 document templates, AI-assisted completion, and DOCX export',
              'Knowledge base advisor with 1,468 searchable concepts and Claude-powered Q&A',
              'Document management for file uploads and organization',
              'Role-based access control (Admin, User, Viewer) with team management',
              'Interview preparation with C-suite articulation guidance per phase',
            ]} />
          </SubSection>

          <SubSection title="Technology Stack">
            <BulletList items={[
              'Frontend: Next.js 14 with App Router, React 18, Tailwind CSS',
              'Backend: Next.js API Routes with Prisma ORM',
              'Database: MySQL with full relational schema',
              'AI: Anthropic Claude (Opus for governance, Sonnet for advisory, Haiku for routing)',
              'Authentication: NextAuth.js with JWT sessions and credential-based login',
              'Export: jsPDF for PDF generation, PptxGenJS for presentations, Docx for Word documents',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: GETTING STARTED */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="getting-started" number="2." title="Getting Started" icon={Target} color="#15803d" bg="#dcfce7" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <SubSection title="First-Time Setup">
            <p className="mb-3">
              When ADP is deployed for the first time (with an empty database), you will be automatically redirected to the
              <strong> /setup</strong> page. This one-time setup page allows you to create your admin account securely.
            </p>
            <NumberedList items={[
              'Visit the portal URL. You will be redirected to the Initial Setup page.',
              'Enter your full name, email address, and a strong password (minimum 8 characters).',
              'Click "Create Admin Account". You will be redirected to the login page.',
              'Sign in with the credentials you just created.',
              'You are now in the Command Center dashboard and can begin using all modules.',
            ]} />
            <Tip>
              The setup page is self-sealing: once the first admin account is created, the page permanently disables itself
              and returns a 403 error if accessed again. This ensures no unauthorized accounts can be created through this route.
            </Tip>
          </SubSection>

          <SubSection title="Logging In">
            <p className="mb-3">
              Navigate to the portal URL. If you are not signed in, you will be redirected to the login page.
              Enter your email and password to authenticate. Sessions last 24 hours before requiring re-authentication.
            </p>
          </SubSection>

          <SubSection title="Password Reset">
            <p className="mb-3">
              If you forget your password, click the <strong>&quot;Forgot password?&quot;</strong> link on the login page.
              Enter your email address and a reset link will be sent via the configured email service (Resend).
              Click the link in the email to set a new password.
            </p>
          </SubSection>

          <SubSection title="Navigation">
            <p className="mb-3">
              The left sidebar provides access to all 10 primary modules. Click any module name to navigate.
              The sidebar is visible on all authenticated pages and highlights your current location.
              Use the <strong>Sign Out</strong> button at the bottom of the sidebar to end your session.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: HOME (COMMAND CENTER) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="home" number="3." title="Home (Command Center)" icon={Home} color="#0052cc" bg="#dbeafe" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Command Center is your dashboard and primary entry point. It provides a real-time overview of all activity
            across the portal with key metrics, quick actions, and recent activity feeds.
          </p>

          <SubSection title="Metrics Row">
            <p className="mb-2">Seven metric cards displayed at the top:</p>
            <BulletList items={[
              'Active Projects: Count of projects with status "active"',
              'Evaluations: Total number of framework/architecture evaluations created',
              'Governance: Total TRiSM governance assessments completed',
              'CAIO Assessments: Total CAIO maturity assessments completed',
              'Documents: Total template fills (generated documents)',
              'KB Concepts: Total knowledge base concepts indexed (1,468)',
              'Open Risks: Count of risk items with status "open" from governance assessments',
            ]} />
            <p>Click any metric card to navigate directly to that module.</p>
          </SubSection>

          <SubSection title="Quick Actions">
            <p className="mb-2">Seven primary entry points for the most common tasks:</p>
            <BulletList items={[
              'New Agent Project: Create a new deployment project',
              'Run Evaluation: Start a framework or architecture comparison',
              'Governance Assessment: Launch a TRiSM trust and risk review',
              'Fill Template: Generate a project document from a template',
              'CAIO Assessment: Run an AI maturity evaluation',
              'Query Advisor: Ask a question to the knowledge base',
              'User Guide: This page',
            ]} />
          </SubSection>

          <SubSection title="Recent Activity">
            <p>
              Two panels show the 5 most recently updated projects (with status, current phase, and framework) and
              the 3 most recent evaluations and documents. Click any item to navigate to its detail page.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: PLAYBOOK MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="playbook" number="4." title="Playbook Module" icon={BookOpen} color="#6b3fa0" bg="#f3e8ff" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Playbook is the core methodology engine of ADP. It defines a <strong>7-phase agent deployment lifecycle</strong>,
            each with structured steps, deliverables, tools, pro tips, and gate checks. All content is loaded from YAML configuration
            and stored in the database.
          </p>

          <SubSection title="The 7 Phases">
            <div className="space-y-4">
              {[
                { phase: 'Phase 1: Ideation & Scoping', duration: '1-2 weeks', color: '#2d3a8c',
                  desc: 'Define the problem, validate agent fit, align stakeholders, and establish kill criteria. Key deliverables include the problem statement, workflow map, cost analysis, agent-fit score, and stakeholder RACI mapping.',
                  steps: ['Problem Statement & Opportunity Mapping', 'Success Metrics & Constraints Definition', 'Stakeholder Alignment & Risk Identification', 'Scope Boundary & Architecture Hypothesis'] },
                { phase: 'Phase 2: Architecture & Design', duration: '2-3 weeks', color: '#6b3fa0',
                  desc: 'Select architecture patterns, evaluate frameworks, design model tiering strategy, and define the cognitive architecture. Create Architecture Decision Records (ADRs) and tool integration specifications.',
                  steps: ['Architecture Pattern Selection (Single Agent, Pipeline, Supervisor, Swarm)', 'Framework Evaluation (LangGraph, CrewAI, Claude SDK, etc.)', 'Model Tiering Strategy (Opus/Sonnet/Haiku routing)', 'Tool & MCP Integration Design'] },
                { phase: 'Phase 3: Prototype & Evaluation', duration: '2-3 weeks', color: '#b45309',
                  desc: 'Build the initial agent scaffold, create test case datasets, run evaluation reports with confidence scoring. Conduct initial safety and governance testing.',
                  steps: ['Agent Scaffold Development', 'Test Case Dataset Creation', 'Evaluation Framework Setup', 'Initial Safety & Governance Testing'] },
                { phase: 'Phase 4: Pilot & Validation', duration: '2-4 weeks', color: '#0e7490',
                  desc: 'Execute limited rollout with monitoring, collect stakeholder feedback, validate risk mitigation strategies, and establish go/no-go decision criteria.',
                  steps: ['Operational Runbook Creation', 'Monitoring Plan Setup', 'Feedback Collection & Analysis', 'Go/No-Go Decision Framework'] },
                { phase: 'Phase 5: Production Deployment', duration: '1-2 weeks', color: '#15803d',
                  desc: 'Full production rollout with readiness checklists covering technical, governance, and operational preparedness. Execute change management and obtain stakeholder sign-off.',
                  steps: ['Production Readiness Checklist', 'Security Review & Hardening', 'Performance Validation & Load Testing', 'Stakeholder Sign-Off & Change Management'] },
                { phase: 'Phase 6: Operations & Monitoring', duration: 'Ongoing', color: '#dc2626',
                  desc: 'Continuous monitoring of performance, safety, and costs. Incident response planning with severity classification, detection mechanisms, containment actions, and post-mortem templates.',
                  steps: ['Incident Response Plans', 'On-Call Procedures & SLA Management', 'Feedback Loop to Training Data', 'Quarterly Governance Reviews'] },
                { phase: 'Phase 7: Optimization & Scaling', duration: 'Ongoing', color: '#7c3aed',
                  desc: 'Portfolio expansion, cost optimization, model and architecture refinement. Autonomy progression tracking and industry benchmarking.',
                  steps: ['Capability Expansion Planning', 'Autonomy Progression Tracking', 'Cost Optimization & Model Refinement', 'Industry Benchmarking'] },
              ].map((p) => (
                <div key={p.phase} className="border-l-2 pl-4" style={{ borderColor: p.color }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--text)]">{p.phase}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-3)]">{p.duration}</span>
                  </div>
                  <p className="mb-2">{p.desc}</p>
                  <p className="text-[12px] text-[var(--text-3)]">
                    <strong>Steps:</strong> {p.steps.join(' / ')}
                  </p>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Gate Checks">
            <p className="mb-2">
              Each phase has a gate check that must be completed before advancing to the next phase.
              Gate checks contain a list of approval items (e.g., &quot;Business problem clearly articulated&quot;,
              &quot;Agent-fit score confirms viability&quot;). All items must be checked off for the phase to be marked complete.
            </p>
          </SubSection>

          <SubSection title="Reference Data">
            <p>
              The <strong>Playbook Reference</strong> page (<Link href="/playbook/reference" className="text-[var(--accent)] hover:underline">/playbook/reference</Link>) provides
              lookup tables for architecture patterns, framework comparisons, model tier recommendations, and the risk classification matrix.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: PROJECTS MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="projects" number="5." title="Projects Module" icon={FolderKanban} color="#0052cc" bg="#dbeafe" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Projects module is where you create and manage AI agent deployment projects. Each project tracks through
            the 7-phase lifecycle with step-level deliverables, phase progress, and gate approvals.
          </p>

          <SubSection title="Creating a Project">
            <NumberedList items={[
              'Click "New Agent Project" from the Command Center or navigate to /projects.',
              'Enter the project name, description, architecture pattern (Single Agent, Pipeline, Supervisor, Swarm), and framework.',
              'Optionally configure model strategy (which Claude models for which tasks) and add team members.',
              'Click "Create Project". The project is initialized at Phase 1 with all phases set to "not_started".',
            ]} />
          </SubSection>

          <SubSection title="Project Detail Page">
            <p className="mb-2">Each project detail page shows:</p>
            <BulletList items={[
              'Project overview: name, description, status, architecture, framework, model strategy, team members',
              'Phase progression: visual timeline of all 7 phases with current phase highlighted',
              'Step tracking: expandable steps within each phase with deliverable fields, notes, and completion status',
              'Gate checks: checklist items that must be completed before advancing to the next phase',
              'Export: export the full project as PDF or JSON',
            ]} />
          </SubSection>

          <SubSection title="Project Statuses">
            <BulletList items={[
              'Active: Project is currently in progress',
              'Paused: Project is temporarily on hold',
              'Completed: All phases completed and signed off',
              'Archived: Project is no longer active but retained for reference',
            ]} />
          </SubSection>

          <SubSection title="Phase Advancement">
            <p>
              To advance a project to the next phase, complete all gate check items for the current phase.
              Phase status transitions: <strong>not_started → in_progress → completed</strong>.
              Each step within a phase also tracks its own status with optional notes and deliverable data.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: KB ADVISOR MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="advisor" number="6." title="KB Advisor Module" icon={Sparkles} color="#b45309" bg="#fef3c7" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Knowledge Base Advisor provides intelligent search and AI-powered Q&A across 1,468 curated concepts
            covering agentic AI, RAG, MCP, governance, and deployment strategies.
          </p>

          <SubSection title="Search">
            <p className="mb-2">
              Use the search bar to perform full-text search across all KB concepts. Results are ranked by relevance
              and show the concept name, domain, definition preview, and source tier. Click any result to view the
              full concept detail including definition, explanation, relationships, code scaffolds, and source attributions.
            </p>
          </SubSection>

          <SubSection title="AI-Powered Q&A">
            <p className="mb-2">
              The chat interface allows you to ask natural language questions. The system retrieves relevant KB concepts,
              sends them as context to Claude, and returns a grounded answer with source citations.
            </p>
            <BulletList items={[
              'Answers are grounded in the KB — Claude uses retrieved concepts as context, not general knowledge',
              'Source citations link back to specific KB concepts for verification',
              'Token usage is tracked per query for cost monitoring',
              'Query history is stored and can be linked to specific projects',
            ]} />
          </SubSection>

          <SubSection title="KB Explorer">
            <p>
              The <strong>Explore</strong> page (<Link href="/advisor/explore" className="text-[var(--accent)] hover:underline">/advisor/explore</Link>)
              provides a browsable view of all KB domains and their concepts. Filter by domain or source tier to navigate
              the knowledge base hierarchically.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: GOVERNANCE MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="governance" number="7." title="Governance Module (TRiSM)" icon={Shield} color="#15803d" bg="#dcfce7" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Governance module implements the <strong>TRiSM (Trust, Risk, and Security Management)</strong> framework
            for AI agent assessments. It evaluates projects across 7 trust layers, 10 Wharton AI governance domains,
            and 6 compliance frameworks.
          </p>

          <SubSection title="Assessment Types">
            <BulletList items={[
              'Initial: First-time governance assessment for a new project or initiative',
              'Periodic: Scheduled recurring review (quarterly recommended)',
              'Incident: Triggered by a specific event, failure, or concern',
            ]} />
          </SubSection>

          <SubSection title="7 Trust Layers">
            <p className="mb-2">Each layer is scored 1-10 with supporting evidence and gap analysis:</p>
            <div className="space-y-2">
              {[
                { name: 'Intent Alignment', desc: 'Problem-solution fit, objective clarity, stakeholder consensus on agent purpose' },
                { name: 'Data Integrity', desc: 'Training and operational data quality, bias detection, data provenance and lineage' },
                { name: 'Behavioral Guardrails', desc: 'Authority boundaries, tool-use constraints, output validation rules, scope limits' },
                { name: 'Transparency & Explainability', desc: 'Decision reasoning visibility, stakeholder communication, audit-friendly outputs' },
                { name: 'Human Oversight', desc: 'Human-in-the-loop gates, override capability, escalation paths, approval workflows' },
                { name: 'Accountability & Audit', desc: 'Comprehensive logging, ownership assignment, tamper-resistant audit trails' },
                { name: 'Continuous Improvement', desc: 'Feedback loops, failure cataloguing, drift detection, retraining triggers' },
              ].map((layer) => (
                <div key={layer.name} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-green-600 shrink-0 mt-[3px]" />
                  <span><strong>{layer.name}:</strong> {layer.desc}</span>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="10 Wharton AI Governance Domains">
            <p className="mb-2">Normalized scoring (0-1) across research-backed governance dimensions:</p>
            <NumberedList items={[
              'AI Strategy Alignment: Organizational strategy fit, project portfolio balance',
              'Innovation & Org Readiness: Innovation type classification, organizational structure, skill distribution',
              'Algorithmic Bias & Fairness: Data audit depth, proxy variable detection, fairness definition trade-offs, disparate impact testing',
              'Manipulation & Ethical Boundaries: User understanding, vulnerable population protections, Belmont principles compliance',
              'Data Protection & Privacy: Privacy lifecycle (5 stages), consent management, aggregation risks, technical privacy measures',
              'Governance, Explainability & Transparency: HITL configuration, stakeholder transparency, audit/stress-test procedures, explainability fit',
              'Enterprise AI Readiness & Maturity: PEEK maturity scale assessment across People, Ethics, Engineering, Knowledge',
              'Implementation & Technology Architecture: AI Scaling Pyramid, BRIDGE roadmap, ownership model, SCALE criteria evaluation',
              'Change Management & Culture: ADAPT model implementation, psychological safety, innovation rituals, resistance mitigation',
              'Measurement & ROI: Leading/lagging indicators, 5Q Impact Framework, GARD governance process, metrics pyramid design',
            ]} />
          </SubSection>

          <SubSection title="Compliance Frameworks">
            <p className="mb-2">Each assessment checks compliance against 6 frameworks:</p>
            <BulletList items={[
              'DPDP (Digital Personal Data Protection Act, India)',
              'GDPR (General Data Protection Regulation, EU)',
              'ISACA AI Governance Framework',
              'OWASP LLM Top 10 Security Risks',
              'Harvard 8 AI Ethics Principles',
              'Belmont Principles (Respect, Beneficence, Justice)',
            ]} />
          </SubSection>

          <SubSection title="Risk Management">
            <p className="mb-2">
              Risk items captured during assessments are tracked with full lifecycle management:
            </p>
            <BulletList items={[
              'Categories: Data, Model, Security, Compliance, Operational, Ethical',
              'Severity levels: Low, Medium, High, Critical',
              'Status tracking: Open → Mitigated → Accepted → Closed',
              'Mitigation strategies documented per risk with owner assignment',
              'Risk dashboard shows open risks count on the Command Center',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8: CAIO MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="caio" number="8." title="CAIO Module (AI Maturity)" icon={Award} color="#b45309" bg="#fef3c7" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The CAIO module provides a <strong>12-domain AI maturity assessment</strong> designed for Chief AI Officer-level visibility.
            Assessments are powered by Claude Opus which generates findings, action items, and executive summaries based on your inputs.
          </p>

          <SubSection title="Assessment Modes">
            <BulletList items={[
              'Audit: Review and score current implementation against the 12-domain framework',
              'Design: Plan future state maturity targets and identify gaps',
              'Folder Analysis: Analyze uploaded documents against the maturity framework',
            ]} />
          </SubSection>

          <SubSection title="12 Assessment Domains">
            <p className="mb-2">Organized into 4 groups:</p>

            <p className="font-semibold text-[var(--text)] mt-3 mb-1">Strategic & Governance</p>
            <NumberedList items={[
              'Strategic Vision & CAIO Leadership: Vision clarity, CAIO authority, portfolio balance, business outcomes',
              'AI Governance Framework: NIST AI RMF alignment, governance board effectiveness, policy documentation',
              'Ethical AI & Responsible Innovation: 6 ethical principles adherence, ethics review process, compliance checklist',
            ]} />

            <p className="font-semibold text-[var(--text)] mt-3 mb-1">Data & Fairness</p>
            <NumberedList items={[
              'Data Strategy & Governance: 7-component governance model, data architecture, quality metrics, privacy lifecycle',
              'Algorithmic Fairness & Bias: Data audit depth, proxy variable detection, fairness definition trade-offs, team diversity',
              'Privacy & Data Protection: GDPR/DPDP/CCPA compliance, federated learning, differential privacy, privacy by design',
            ]} />

            <p className="font-semibold text-[var(--text)] mt-3 mb-1">Organization & Technology</p>
            <NumberedList items={[
              'AI Talent & Organizational Culture: Competency framework, talent mix (20/30/50 rule), psychological safety metrics',
              'Technology Architecture & MLOps: AI system classification (deterministic/probabilistic/generative), CI/CD pipelines, 5-category monitoring, SCALE assessment',
            ]} />

            <p className="font-semibold text-[var(--text)] mt-3 mb-1">Execution & Measurement</p>
            <NumberedList items={[
              'AI Project & Portfolio Management: 5-phase project framework, cross-functional ownership, vendor selection criteria',
              'AI Security & Risk Management: Risk assessment methodology, adversarial attack surface analysis, incident response readiness',
              'Implementation & Change Management: ADAPT model, change champions network, hard/soft metrics tracking',
              'Measurement & ROI: Metrics pyramid design, 5Q Impact Framework, GARD governance, leading/lagging indicator balance',
            ]} />
          </SubSection>

          <SubSection title="Maturity Levels">
            <div className="space-y-1.5">
              {[
                { level: 'Level 1 — Ad Hoc', desc: 'No formal strategy, isolated experiments, reactive approach', color: '#dc2626' },
                { level: 'Level 2 — Initial', desc: 'Strategy emerging, some governance, early centralization', color: '#f59e0b' },
                { level: 'Level 3 — Defined', desc: 'Formal policies established, cross-functional ownership, documented processes', color: '#3b82f6' },
                { level: 'Level 4 — Managed', desc: 'Metrics-driven optimization, systematic governance, proactive risk management', color: '#22c55e' },
                { level: 'Level 5 — Optimized', desc: 'Continuous improvement, industry-leading practices, fully integrated AI operations', color: '#7c3aed' },
              ].map((m) => (
                <div key={m.level} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-[7px]" style={{ backgroundColor: m.color }} />
                  <span><strong>{m.level}:</strong> {m.desc}</span>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="AI-Generated Outputs">
            <BulletList items={[
              'Domain scores with evidence-based justification',
              'Findings classified as Critical, Warning, or Good',
              'Action items assigned to Immediate, Short-term, or Long-term phases with ownership',
              'Executive summary generated by Claude Opus for C-suite reporting',
              'Radar chart visualization of domain scores',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 9: EVALUATE MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="evaluate" number="9." title="Evaluate Module" icon={BarChart3} color="#6b3fa0" bg="#f3e8ff" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Evaluate module provides a <strong>weighted decision matrix</strong> for comparing options across configurable criteria.
            It supports framework selection, architecture pattern comparison, model tier decisions, and custom evaluations.
          </p>

          <SubSection title="Evaluation Types">
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[var(--text)] mb-1">Framework Selection</p>
                <p>Compare agent frameworks (LangGraph, CrewAI, Claude Agent SDK, AutoGen, etc.) using default criteria:
                  Production Readiness (20%), Learning Curve (15%), Pattern Support (20%), Claude Integration (15%),
                  Controllability (15%), Scalability (10%), Cost Efficiency (5%).</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text)] mb-1">Architecture Pattern</p>
                <p>Compare patterns (Single Agent, Pipeline, Supervisor, Swarm) using criteria:
                  Complexity Fit (20%), Controllability (20%), Latency (15%), Team Capability (15%),
                  Scalability (10%), Cost (10%), Governance Compatibility (10%).</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text)] mb-1">Model Tier Selection</p>
                <p>Compare Claude model tiers (Opus, Sonnet, Haiku) for specific use cases with presets for
                  Customer Support, Code Generation, Research, Data Analysis, and more.</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text)] mb-1">Custom Evaluation</p>
                <p>Define your own options and criteria with custom weights for any comparison scenario.</p>
              </div>
            </div>
          </SubSection>

          <SubSection title="5-Step Wizard">
            <NumberedList items={[
              'Select evaluation type (framework, architecture, model tier, or custom)',
              'Configure options to compare (add, remove, rename)',
              'Define criteria with percentage weights (must total 100%)',
              'Score each option against each criterion (1-5 scale)',
              'Review results with weighted scores, rankings, and AI-generated recommendation',
            ]} />
          </SubSection>

          <SubSection title="Results & Comparison">
            <BulletList items={[
              'Score matrix showing raw scores per option per criterion',
              'Weighted score calculation: sum(raw_score x weight) for final ranking',
              'Bar chart and radar chart visualizations',
              'Side-by-side comparison view for top options',
              'AI-powered recommendation with rationale (uses Claude for analysis)',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 10: TEMPLATE STUDIO */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="templates" number="10." title="Template Studio" icon={FileText} color="#0e7490" bg="#e0f2fe" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Template Studio provides <strong>21 document templates</strong> organized by deployment phase. Templates
            enable consistent, structured documentation for every stage of your agent project.
          </p>

          <SubSection title="Template Gallery">
            <p className="mb-2">
              Templates are organized by phase (Ideation, Architecture, Prototype, Pilot, Production, Operations, Optimization).
              Each template shows its name, description, associated phase, and field count.
              Click a template to start a new fill or view existing fills.
            </p>
          </SubSection>

          <SubSection title="Filling a Template">
            <NumberedList items={[
              'Select a template from the gallery (e.g., Agent Charter, Architecture Decision Record).',
              'Fill in the form fields. Fields are organized into logical sections.',
              'Use the AI Assist button on any field to get Claude-generated suggestions based on context.',
              'Optionally link the fill to a specific project.',
              'Save the fill. It can be edited later.',
              'Export the completed document as DOCX for sharing.',
            ]} />
          </SubSection>

          <SubSection title="Key Templates">
            <BulletList items={[
              'Agent Charter: Project scope, objectives, stakeholders, success metrics',
              'Use Case Assessment: Agent-fit scoring, complexity analysis, feasibility evaluation',
              'Stakeholder Analysis: RACI mapping, influence/interest matrix, communication plan',
              'Risk Register: Risk identification, severity classification, mitigation strategies',
              'Architecture Decision Record (ADR): Context, decision, consequences, alternatives considered',
              'Tool & Integration Spec: MCP server registry, API integrations, data flow diagrams',
              'Deployment Runbook: Step-by-step production deployment procedures',
              'Incident Response Plan: Severity classification, detection, containment, recovery, post-mortem',
            ]} />
          </SubSection>

          <SubSection title="AI Assist">
            <p>
              Each template field has an AI Assist button that sends the field label, description, and other
              filled fields as context to Claude. Claude generates a contextually appropriate suggestion
              that you can accept, modify, or dismiss.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 11: DOCUMENTS MODULE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="documents" number="11." title="Documents Module" icon={Upload} color="#64748b" bg="#f1f5f9" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Documents module provides centralized file management for project-related documents.
            Upload, organize, search, and manage files associated with your agent deployments.
          </p>

          <SubSection title="Features">
            <BulletList items={[
              'Upload files with title, category, and optional project association',
              'Supported categories for organization (e.g., architecture, governance, evaluation)',
              'Search documents by title or filename',
              'View file details including size, MIME type, upload date, and uploader',
              'Delete documents when no longer needed',
              'Files are stored on the server filesystem with metadata in the database',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 12: INTERVIEW PREP */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="interview" number="12." title="Interview Prep" icon={Mic} color="#dc2626" bg="#fee2e2" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Interview module provides <strong>C-suite articulation guidance</strong> for each deployment phase.
            It helps you frame conversations with executives, board members, and stakeholders using the appropriate
            business language for each stage of the agent lifecycle.
          </p>

          <SubSection title="Per-Phase Articulation">
            <BulletList items={[
              'Phase 1 (Ideation): Frame the cost of status quo, ROI targets, risk profile, and strategic alignment',
              'Phase 2 (Architecture): Discuss control vs. resilience trade-offs, observability depth, and pattern selection rationale',
              'Phase 3 (Prototype): Present model selection decisions, failure mode analysis, and safety testing methodology',
              'Phase 4 (Pilot): Communicate monitoring strategy, rollback procedures, and stakeholder feedback channels',
              'Phase 5 (Production): Define SLAs, governance checkpoints, change management plans',
              'Phase 6 (Operations): Report on metrics pyramid, incident postmortems, continuous improvement signals',
              'Phase 7 (Optimization): Discuss portfolio management, model tiering optimization, and industry benchmarking',
            ]} />
          </SubSection>

          <SubSection title="Cross-Cutting Questions">
            <p>
              Each phase also includes cross-cutting question guidance on ROI measurement methodology,
              governance framework alignment, agent failure handling, and model tiering strategy.
              These are designed to prepare you for the toughest executive questions at each stage.
            </p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 13: SETTINGS & ADMINISTRATION */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="settings" number="13." title="Settings & Administration" icon={Settings} color="#64748b" bg="#f1f5f9" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Settings page is the admin control panel for managing users, teams, API configuration, and system information.
            Full access is restricted to users with the <strong>Admin</strong> role.
          </p>

          <SubSection title="Users Tab">
            <BulletList items={[
              'View all registered users with name, email, role, status, and team assignment',
              'Create new users with email, name, password, and role (Admin, User, Viewer)',
              'Edit user roles and team assignments',
              'Suspend or reactivate user accounts',
              'Delete user accounts (with confirmation)',
            ]} />
          </SubSection>

          <SubSection title="Teams Tab">
            <BulletList items={[
              'Create teams with name and description',
              'View team members and member count',
              'Assign or remove users from teams',
              'Delete teams (members become unassigned)',
            ]} />
          </SubSection>

          <SubSection title="Keys Tab">
            <p>View and manage API key configuration for Claude model integrations. Shows which model
              is assigned to each function (default, advisor, governance, router).</p>
          </SubSection>

          <SubSection title="Database Tab">
            <p>View database connection information, table counts, and system health status.</p>
          </SubSection>

          <SubSection title="Info Tab">
            <p>System information including version, deployment environment, and build metadata.</p>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 14: ROLE-BASED ACCESS CONTROL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="rbac" number="14." title="Role-Based Access Control" icon={Users} color="#6b3fa0" bg="#f3e8ff" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            ADP implements three user roles with different permission levels. All authenticated routes
            are protected by NextAuth middleware. API endpoints enforce role checks server-side.
          </p>

          <SubSection title="Permission Matrix">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="text-[var(--text-3)] font-medium border-b border-[var(--border)]">
                  <tr>
                    <th className="pb-2 pr-4 font-semibold">Module</th>
                    <th className="pb-2 pr-4 font-semibold">Admin</th>
                    <th className="pb-2 pr-4 font-semibold">User</th>
                    <th className="pb-2 font-semibold">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { module: 'Home Dashboard', admin: 'Full', user: 'Full', viewer: 'Full' },
                    { module: 'Playbook', admin: 'Full', user: 'Full', viewer: 'View Only' },
                    { module: 'Projects', admin: 'Full (CRUD)', user: 'Full (CRUD)', viewer: 'View Only' },
                    { module: 'KB Advisor', admin: 'Full', user: 'Full', viewer: 'Query Only' },
                    { module: 'Governance', admin: 'Full', user: 'View + Run', viewer: 'View Only' },
                    { module: 'CAIO', admin: 'Full', user: 'View + Run', viewer: 'View Only' },
                    { module: 'Evaluate', admin: 'Full', user: 'Full', viewer: 'View Only' },
                    { module: 'Templates', admin: 'Full', user: 'Full', viewer: 'View Only' },
                    { module: 'Documents', admin: 'Full', user: 'Upload + View', viewer: 'View Only' },
                    { module: 'Settings', admin: 'Full', user: 'View Only', viewer: 'No Access' },
                    { module: 'User Management', admin: 'Full', user: 'No Access', viewer: 'No Access' },
                  ].map((row) => (
                    <tr key={row.module} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="py-2 pr-4 font-medium text-[var(--text)]">{row.module}</td>
                      <td className="py-2 pr-4">{row.admin}</td>
                      <td className="py-2 pr-4">{row.user}</td>
                      <td className="py-2">{row.viewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 15: COMMON WORKFLOWS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="workflows" number="15." title="Common Workflows" icon={ArrowRight} color="#0052cc" bg="#dbeafe" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">

          <SubSection title="End-to-End Agent Project">
            <NumberedList items={[
              'Create a new project (Projects → New Agent Project) with name, architecture pattern, and framework.',
              'Review the Playbook phases to understand the lifecycle and gate criteria.',
              'Complete Phase 1 steps: define the problem statement, success metrics, stakeholders, and risk register.',
              'Fill the Agent Charter template (Templates → Agent Charter) and link it to your project.',
              'Complete the Phase 1 gate check to unlock Phase 2.',
              'Run a Framework Evaluation (Evaluate → New) to compare framework options for your use case.',
              'Run an Architecture Evaluation to validate your pattern selection.',
              'Continue through phases, completing steps and gate checks at each stage.',
              'Run a Governance Assessment at Phase 5 (pre-production) to evaluate trust and risk.',
              'Run a CAIO Assessment to benchmark your organizational AI maturity.',
              'Advance through production, operations, and optimization phases.',
            ]} />
          </SubSection>

          <SubSection title="Governance Assessment Workflow">
            <NumberedList items={[
              'Navigate to Governance → Run Assessment.',
              'Select the assessment type (Initial, Periodic, or Incident) and link to a project.',
              'Score each of the 7 trust layers (1-10) with evidence and gap descriptions.',
              'Answer the 10 Wharton domain questionnaires with current state analysis.',
              'Check compliance status against 6 governance frameworks.',
              'Submit the assessment. Review the overall trust score and risk classification.',
              'Navigate to the Risks tab to view, update, and track identified risk items.',
            ]} />
          </SubSection>

          <SubSection title="CAIO Assessment Workflow">
            <NumberedList items={[
              'Navigate to CAIO → Run Assessment.',
              'Select the assessment mode (Audit, Design, or Folder Analysis).',
              'Score each of the 12 domains with current state description and gap analysis.',
              'Submit for Claude Opus analysis. The AI generates findings, action items, and an executive summary.',
              'Review the maturity level (1-5) and domain scores on the radar chart.',
              'Navigate to the Actions tab to distribute and track action items across teams.',
            ]} />
          </SubSection>

          <SubSection title="Framework / Architecture Evaluation">
            <NumberedList items={[
              'Navigate to Evaluate → New Evaluation.',
              'Select the evaluation type and choose a preset or create custom options.',
              'Configure criteria and weights (must total 100%).',
              'Score each option against each criterion (1-5 scale).',
              'Review weighted scores, rankings, and the AI-generated recommendation.',
              'Use the comparison view to analyze top options side by side.',
            ]} />
          </SubSection>

          <SubSection title="KB Research Workflow">
            <NumberedList items={[
              'Navigate to Advisor and use the search bar for keyword-based concept lookup.',
              'Click any result to view the full concept detail with definition, explanation, and code scaffolds.',
              'Use the chat interface to ask natural language questions grounded in the KB.',
              'Review source citations to verify answers against original KB concepts.',
              'Link queries to specific projects for traceability.',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 16: KB REFERENCE */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="kb-reference" number="16." title="Knowledge Base Reference" icon={Search} color="#0e7490" bg="#e0f2fe" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">
          <p>
            The Knowledge Base contains <strong>1,468 curated concepts</strong> across 5 tiers, sourced from
            Anthropic documentation, IBM courses, LinkedIn Learning, and cross-source synthesis.
          </p>

          <SubSection title="KB Tier Breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="text-[var(--text-3)] font-medium border-b border-[var(--border)]">
                  <tr>
                    <th className="pb-2 pr-6">Tier</th>
                    <th className="pb-2 pr-6">Concepts</th>
                    <th className="pb-2 pr-6">Files</th>
                    <th className="pb-2">Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { tier: 'Core Agentic AI KB', concepts: '1,022', files: '10 YAML', sources: '8 domains — foundations, architecture, multi-agent, memory, tools, infrastructure, enterprise safety, blueprints', color: '#0052cc' },
                    { tier: 'RAG & MCP Deep KB', concepts: '76', files: '1 YAML', sources: 'Deep concepts with code scaffolds for Retrieval-Augmented Generation and Model Context Protocol', color: '#6b3fa0' },
                    { tier: 'IBM Courses KB', concepts: '85', files: '1 YAML', sources: '6 IBM agentic AI courses covering enterprise patterns, governance, and deployment', color: '#0e7490' },
                    { tier: 'LinkedIn Learning KB', concepts: '111', files: '3 YAML + index', sources: '16 curated sources (LL01-LL16) covering agents, MCP strategy, and productivity tools', color: '#0077b5' },
                    { tier: 'Strategy & Governance KB', concepts: '174', files: '3 YAML', sources: 'Cross-source synthesis covering governance (NIST/TRiSM/CAIO), evolution patterns, and build & deploy strategies', color: '#15803d' },
                  ].map((row) => (
                    <tr key={row.tier} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="py-3 pr-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                          <span className="font-medium text-[var(--text)]">{row.tier}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-6 font-bold text-[var(--text)]">{row.concepts}</td>
                      <td className="py-3 pr-6 text-[var(--text-3)]">{row.files}</td>
                      <td className="py-3 text-[var(--text-3)]">{row.sources}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[var(--border)] font-bold">
                    <td className="py-3 pr-6 text-[var(--text)]">Total</td>
                    <td className="py-3 pr-6 text-[var(--accent)]">1,468</td>
                    <td className="py-3 pr-6 text-[var(--text-3)]">20 YAML</td>
                    <td className="py-3 text-[var(--text-3)]">34+ sources</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SubSection>

          <SubSection title="Concept Structure">
            <p className="mb-2">Each KB concept includes:</p>
            <BulletList items={[
              'Concept Key: Unique identifier (e.g., "agent_memory_persistence")',
              'Concept Name: Human-readable title',
              'Definition: Concise one-paragraph definition',
              'Explanation: Extended multi-paragraph explanation with context',
              'Sources: Attribution to original source material with references',
              'Code Scaffold: Executable code example (where applicable)',
              'Relationships: Links to related concepts (depends_on, enables, compare_with)',
              'Metadata: Additional classification and tagging data',
            ]} />
          </SubSection>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 17: TROUBLESHOOTING & FAQ */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHeader id="troubleshooting" number="17." title="Troubleshooting & FAQ" icon={AlertTriangle} color="#dc2626" bg="#fee2e2" />
        <div className="text-[13px] text-[var(--text-2)] leading-relaxed space-y-3">

          <SubSection title="Common Issues">
            <div className="space-y-4">
              {[
                { q: 'The portal shows "Application error: a server-side exception has occurred"',
                  a: 'Check the deployment logs for the specific error. Common causes: database connection failure (verify DATABASE_URL), missing environment variables (check all required vars are set), or build errors. Redeploy after fixing.' },
                { q: 'Database seed fails or KB Advisor shows 0 concepts',
                  a: 'Ensure DATABASE_URL is correct and the MySQL server is running. Run "npx prisma db push" to create tables, then "npx prisma db seed" to populate data. Check that content/kb/ directory contains the YAML files.' },
                { q: 'Claude API errors (Advisor, CAIO, Templates AI Assist)',
                  a: 'Verify ANTHROPIC_API_KEY is set correctly in environment variables. Check that the API key has sufficient credits and the specified models (Opus, Sonnet, Haiku) are available on your plan.' },
                { q: 'Login fails with "Invalid email or password"',
                  a: 'Ensure the user exists in the database. If this is a fresh deployment, visit /setup to create the first admin account. Check that the password meets the minimum 8-character requirement.' },
                { q: 'Pages load but show empty data (all zeros on dashboard)',
                  a: 'The database is empty. Run the seed script to populate KB concepts, playbook phases, and templates: "npx prisma db seed". Projects, evaluations, and assessments are created through the UI.' },
                { q: 'Password reset email not received',
                  a: 'Verify RESEND_API_KEY and RESEND_FROM_EMAIL are configured. Check the Resend dashboard for delivery status. Ensure the email address is valid and not blocked by spam filters.' },
                { q: 'Build fails on Railway with "Can\'t reach database server"',
                  a: 'This happens when prisma db push runs during build. Railway\'s internal network is only available at runtime. Move "npx prisma db push" to the Start Command instead of the Build Command.' },
                { q: 'TypeScript build errors after code changes',
                  a: 'Run "npx tsc --noEmit" locally to identify type errors. Fix all errors before pushing. Ensure all imports reference existing files and exported types.' },
                { q: 'Template export (DOCX) fails',
                  a: 'Ensure the "docx" package is installed (npm install). Check that all template fields have valid data. Review the server logs for the specific export error.' },
                { q: 'CAIO assessment returns no AI analysis',
                  a: 'CAIO assessments require Claude Opus (CLAUDE_GOVERNANCE_MODEL). Verify the model name is correct and your API key has access to Opus. Check for API rate limiting.' },
              ].map((item) => (
                <div key={item.q} className="border-l-2 border-[var(--border)] pl-4">
                  <p className="font-semibold text-[var(--text)] mb-1">Q: {item.q}</p>
                  <p>A: {item.a}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Environment Variables Reference">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="text-[var(--text-3)] font-medium border-b border-[var(--border)]">
                  <tr>
                    <th className="pb-2 pr-4 font-semibold">Variable</th>
                    <th className="pb-2 pr-4 font-semibold">Required</th>
                    <th className="pb-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { name: 'DATABASE_URL', req: 'Yes', desc: 'MySQL connection string (mysql://user:pass@host:port/db)' },
                    { name: 'ANTHROPIC_API_KEY', req: 'Yes', desc: 'Anthropic API key for Claude models' },
                    { name: 'NEXTAUTH_SECRET', req: 'Yes', desc: 'Random secret for JWT token signing (min 32 chars)' },
                    { name: 'NEXTAUTH_URL', req: 'Yes', desc: 'Full URL of the portal (e.g., https://your-app.up.railway.app)' },
                    { name: 'CLAUDE_DEFAULT_MODEL', req: 'No', desc: 'Default Claude model (default: claude-sonnet-4-6)' },
                    { name: 'CLAUDE_ADVISOR_MODEL', req: 'No', desc: 'Model for KB Advisor (default: claude-sonnet-4-6)' },
                    { name: 'CLAUDE_GOVERNANCE_MODEL', req: 'No', desc: 'Model for CAIO assessments (default: claude-opus-4-6)' },
                    { name: 'CLAUDE_ROUTER_MODEL', req: 'No', desc: 'Model for routing decisions (default: claude-haiku-4-5)' },
                    { name: 'RESEND_API_KEY', req: 'No', desc: 'Resend API key for password reset emails' },
                    { name: 'RESEND_FROM_EMAIL', req: 'No', desc: 'Sender email for password reset notifications' },
                    { name: 'KB_CONTENT_DIR', req: 'No', desc: 'Path to KB YAML files (default: ./content/kb)' },
                    { name: 'PLAYBOOK_CONTENT_DIR', req: 'No', desc: 'Path to playbook content (default: ./content)' },
                    { name: 'NODE_ENV', req: 'No', desc: 'Environment (development or production)' },
                  ].map((row) => (
                    <tr key={row.name} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="py-2 pr-4 font-mono text-[11px] text-[var(--text)]">{row.name}</td>
                      <td className="py-2 pr-4">{row.req}</td>
                      <td className="py-2 text-[var(--text-3)]">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SubSection>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-[11px] text-[var(--text-4)] pb-4">
        Agent Deployment Playbook User Guide v1.0 — April 2026 — Built by Padmasani Srimadhan
      </div>
    </div>
  );
}
