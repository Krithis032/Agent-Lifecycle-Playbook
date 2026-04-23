import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

const COPYRIGHT = '\u00a9 2026 Padmasani Srimadhan. All rights reserved.';
const NAVY: [number, number, number] = [10, 22, 40];
const ACCENT: [number, number, number] = [59, 130, 246];
const GRAY: [number, number, number] = [148, 163, 184];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ format: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { format } = await params;
  if (!['pdf', 'pptx'].includes(format)) {
    return NextResponse.json({ error: 'Format must be pdf or pptx' }, { status: 400 });
  }

  try {
    if (format === 'pdf') {
      const buffer = generateUserGuidePdf();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="ADP_User_Guide.pdf"',
        },
      });
    } else {
      const buffer = await generateUserGuidePptx();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': 'attachment; filename="ADP_User_Guide.pptx"',
        },
      });
    }
  } catch (err) {
    logError('GET /api/user-guide', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

// ─── PDF ───
function generateUserGuidePdf(): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const addFooter = () => {
    const H = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...GRAY);
    doc.line(20, H - 18, W - 20, H - 18);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(COPYRIGHT, 20, H - 12);
    doc.text(`Page ${doc.getNumberOfPages()}`, W - 35, H - 12);
  };

  // ─ Title Page ─
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 110, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...ACCENT);
  doc.text('AGENT DEPLOYMENT PLAYBOOK', 20, 28);
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('User Guide', 20, 50);
  doc.setFontSize(14);
  doc.setTextColor(...GRAY);
  doc.text('Version 1.0  \u00b7  April 2026', 20, 65);
  doc.setFontSize(12);
  doc.text('Built by Padmasani Srimadhan', 20, 80);
  doc.setFontSize(9);
  doc.text(COPYRIGHT, 20, 92);
  addFooter();

  const sectionHeader = (title: string) => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, 16, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), 20, 11);
    return 24;
  };

  // ─ TOC ─
  doc.addPage();
  let y = sectionHeader('TABLE OF CONTENTS');
  const toc = [
    '1. Portal Overview & Getting Started',
    '2. Module Walkthroughs (All 9 Modules)',
    '3. Phase Guide \u2014 Strategize',
    '4. Phase Guide \u2014 Build',
    '5. Phase Guide \u2014 Govern',
    '6. Role-Based Access Control',
    '7. Admin Setup Guide',
    '8. Common Workflows',
    '9. KB Reference (1,468 Concepts)',
    '10. Troubleshooting & FAQ',
  ];
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  toc.forEach((item) => { doc.text(item, 25, y); y += 8; });
  addFooter();

  // ─ Section helper ─
  const addSection = (title: string, paragraphs: string[]) => {
    doc.addPage();
    y = sectionHeader(title);
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    for (const p of paragraphs) {
      const lines = doc.splitTextToSize(p, W - 40);
      if (y + lines.length * 5 > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 20, y);
      y += lines.length * 5 + 4;
    }
    addFooter();
  };

  addSection('PORTAL OVERVIEW', [
    'The Agent Deployment Playbook (ADP) is a comprehensive operational portal built by Padmasani Srimadhan for managing the full lifecycle of AI agent deployments.',
    'It provides a structured 7-phase methodology (Ideation \u2192 Architecture \u2192 Prototype \u2192 Pilot \u2192 Production \u2192 Operations \u2192 Evolution) supported by 1,468 knowledge base concepts, 21 document templates, TRiSM governance assessments, and CAIO maturity evaluations.',
    'Modules: Home (Command Center), Playbook, Projects, KB Advisor, Governance, CAIO, Evaluate, Templates, Interview Prep, User Guide.',
  ]);

  addSection('PHASE GUIDE \u2014 STRATEGIZE', [
    'Ideation Phase: Use-case assessment with agent-fit scoring, stakeholder analysis with RACI mapping, agent project charter, and pre-mortem risk register.',
    'Architecture Phase: Architecture Decision Records (ADR), tool & integration specs with MCP server registry, state & memory design with persistence strategy.',
    'Templates available: Agent Charter, Use Case Assessment, Stakeholder Analysis, Risk Register, ADR, Tool & Integration Spec, State & Memory Design.',
  ]);

  addSection('PHASE GUIDE \u2014 BUILD', [
    'Prototype Phase: Agent scaffold development, test case datasets, evaluation reports with confidence scoring.',
    'Pilot Phase: Operational runbooks with monitoring plans, feedback collection, go/no-go decision criteria.',
    'Production Phase: Readiness checklist covering technical, governance, and operational readiness with stakeholder sign-off.',
  ]);

  addSection('PHASE GUIDE \u2014 GOVERN', [
    'Operations Phase: Incident response plans with severity classification, detection mechanisms, containment actions, and post-mortem templates.',
    'Evolution Phase: Capability expansion plans, autonomy progression tracking, validation planning.',
    'Governance: TRiSM trust & risk assessments with Wharton 12-domain scoring, CAIO maturity evaluations across 12 domains.',
  ]);

  addSection('ROLE-BASED ACCESS CONTROL', [
    'Admin: Full access to all modules including Settings, user management, and data export.',
    'Manager: Full access to Projects, Templates, and KB Advisor. View/Run access for Governance and CAIO. View-only Settings.',
    'Viewer: View-only access to Projects and Templates. Query-only KB Advisor access. No Settings access.',
  ]);

  addSection('ADMIN SETUP GUIDE', [
    '1. Clone the repository and run npm install',
    '2. Configure .env.local with DATABASE_URL (MySQL) and ANTHROPIC_API_KEY (Claude Opus)',
    '3. Run: npx prisma db push && npx prisma db seed',
    '4. Place ADP_User_Guide files in content/guides/ (optional)',
    '5. Run npm run dev for development or npm run build && npm start for production',
    '6. Create your admin account via the registration page or seed script',
  ]);

  addSection('COMMON WORKFLOWS', [
    '1. Create New Project \u2192 Assign phases \u2192 Track steps \u2192 Gate reviews \u2192 Phase advancement',
    '2. Run Governance Assessment \u2192 TRiSM scoring \u2192 Risk identification \u2192 Action tracker',
    '3. CAIO Maturity Audit \u2192 12-domain questionnaire \u2192 Claude Opus analysis \u2192 Export report',
    '4. Framework Evaluation \u2192 Add options & criteria \u2192 Score \u2192 AI recommendation',
    '5. KB Search \u2192 Full-text across 1,468 concepts \u2192 Source-attributed results',
    '6. Template Fill \u2192 Complete fields \u2192 AI-assist \u2192 Export as DOCX',
  ]);

  addSection('KB REFERENCE (1,468 CONCEPTS)', [
    'Core Agentic AI KB: 1,022 concepts across 8 domains (foundations, architecture, multi-agent, memory, tools, infrastructure, enterprise safety, blueprints)',
    'RAG & MCP Deep KB: 76 concepts with code scaffolds',
    'IBM Courses KB: 85 concepts from 6 IBM agentic AI courses',
    'LinkedIn Learning KB: 111 concepts from 16 curated sources (LL01\u2013LL16) covering agents, MCP strategy, and productivity',
    'Strategy & Governance KB: 174 concepts synthesized across governance (NIST/TRiSM/CAIO), evolution patterns, and build & deploy',
  ]);

  addSection('TROUBLESHOOTING & FAQ', [
    'Q: Database seed fails? A: Check DATABASE_URL in .env.local and ensure MySQL is running.',
    'Q: Advisor returns no results? A: Run npx prisma db seed to index KB concepts.',
    'Q: PDF/PPTX 404? A: Place ADP_User_Guide.pdf and .pptx in content/guides/ directory.',
    'Q: Claude API errors? A: Verify ANTHROPIC_API_KEY is set and has sufficient credits.',
    'Q: Build fails? A: Run npm install, then npx tsc --noEmit to check for TypeScript errors.',
  ]);

  return Buffer.from(doc.output('arraybuffer'));
}

// ─── PPTX ───
async function generateUserGuidePptx(): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = 'Padmasani Srimadhan';
  pptx.company = 'Agent Deployment Playbook';
  pptx.title = 'ADP User Guide';

  const PNAVY = '0a1628';
  const PWHITE = 'FFFFFF';
  const PACCENT = '3b82f6';
  const PGRAY = '94a3b8';

  const addF = (s: PptxGenJS.Slide) => {
    s.addText(COPYRIGHT, {
      x: 0.8, y: 5.2, w: 8.4, h: 0.2,
      fontSize: 7, fontFace: 'Calibri', color: PGRAY, italic: true,
    });
  };
  const addH = (s: PptxGenJS.Slide, t: string) => {
    s.addShape('rect' as never, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: PNAVY } });
    s.addText(t, {
      x: 0.8, y: 0.1, w: 8.4, h: 0.5,
      fontSize: 13, fontFace: 'Calibri', color: PWHITE, bold: true,
    });
  };

  // Title
  const s1 = pptx.addSlide();
  s1.background = { color: PNAVY };
  s1.addText('Agent Deployment Playbook', {
    x: 0.8, y: 1.2, w: 8.4, h: 0.8, fontSize: 32, fontFace: 'Calibri', color: PWHITE, bold: true,
  });
  s1.addText('User Guide v1.0', {
    x: 0.8, y: 2.2, w: 8.4, h: 0.5, fontSize: 18, fontFace: 'Calibri', color: PACCENT,
  });
  s1.addText('Built by Padmasani Srimadhan', {
    x: 0.8, y: 3.2, w: 8.4, h: 0.4, fontSize: 14, fontFace: 'Calibri', color: PGRAY,
  });
  s1.addText('April 2026', {
    x: 0.8, y: 3.7, w: 8.4, h: 0.3, fontSize: 11, fontFace: 'Calibri', color: PGRAY,
  });
  addF(s1);

  // Content slide helper
  const addSlide = (title: string, bullets: string[]) => {
    const s = pptx.addSlide();
    s.background = { color: PWHITE };
    addH(s, title);
    bullets.forEach((b, i) => {
      s.addText(b, {
        x: 0.8, y: 1.0 + i * 0.55, w: 8.4, h: 0.5,
        fontSize: 11, fontFace: 'Calibri', color: '334155', lineSpacing: 16, valign: 'top',
      });
    });
    addF(s);
  };

  addSlide('TABLE OF CONTENTS', [
    '1. Portal Overview & Getting Started',
    '2. Module Walkthroughs (All 9 Modules)',
    '3. Phase Guide \u2014 Strategize',
    '4. Phase Guide \u2014 Build',
    '5. Phase Guide \u2014 Govern',
    '6. Role-Based Access Control',
    '7. Admin Setup & Common Workflows',
    '8. KB Reference (1,468 Concepts) & Troubleshooting',
  ]);

  addSlide('PORTAL OVERVIEW', [
    'The ADP is a comprehensive operational portal built by Padmasani Srimadhan',
    'for managing the full lifecycle of AI agent deployments.',
    '7-phase methodology: Ideation \u2192 Architecture \u2192 Prototype \u2192 Pilot \u2192 Production \u2192 Operations \u2192 Evolution',
    '1,468 KB concepts across 5 tiers, 21 templates, TRiSM governance, CAIO maturity',
    '9 modules: Home, Playbook, Projects, Advisor, Governance, CAIO, Evaluate, Templates, Interview',
  ]);

  addSlide('PHASE GUIDE \u2014 STRATEGIZE', [
    'Ideation: Use-case assessment, stakeholder analysis, agent charter, risk register',
    'Architecture: ADR creation, tool integration spec, state & memory design',
    'Evaluation: Framework comparison, architecture selection, scoring matrices',
  ]);

  addSlide('PHASE GUIDE \u2014 BUILD', [
    'Prototype: Agent scaffold, tool integration, test case datasets',
    'Pilot: Runbook creation, monitoring setup, feedback collection',
    'Production: Readiness checklist, security review, performance validation',
  ]);

  addSlide('PHASE GUIDE \u2014 GOVERN', [
    'Operations: Incident response plans, on-call procedures, SLA management',
    'Evolution: Capability expansion, autonomy progression, continuous improvement',
    'Governance: TRiSM assessments, CAIO maturity, Wharton 12-domain scoring',
  ]);

  // RBAC Table
  const s7 = pptx.addSlide();
  s7.background = { color: PWHITE };
  addH(s7, 'ROLE-BASED ACCESS CONTROL');
  s7.addTable(
    [
      [{ text: 'Role' }, { text: 'Projects' }, { text: 'Templates' }, { text: 'Governance' }, { text: 'KB Advisor' }, { text: 'Settings' }],
      [{ text: 'Admin' }, { text: 'Full' }, { text: 'Full' }, { text: 'Full' }, { text: 'Full' }, { text: 'Full' }],
      [{ text: 'Manager' }, { text: 'Full' }, { text: 'Full' }, { text: 'View/Run' }, { text: 'Full' }, { text: 'View' }],
      [{ text: 'Viewer' }, { text: 'View' }, { text: 'View' }, { text: 'View' }, { text: 'Query' }, { text: 'None' }],
    ],
    {
      x: 0.8, y: 1.0, w: 8.4, fontSize: 10, fontFace: 'Calibri', color: '334155',
      border: { type: 'solid', pt: 0.5, color: 'cbd5e1' },
      colW: [1.4, 1.4, 1.4, 1.4, 1.4, 1.4],
      autoPage: false,
    }
  );
  addF(s7);

  addSlide('ADMIN SETUP & WORKFLOWS', [
    '1. Clone repo \u2192 npm install \u2192 configure .env.local',
    '2. npx prisma db push && npx prisma db seed',
    '3. npm run dev (development) or npm run build && npm start',
    '4. Default admin: admin@adp.local / changeme',
    '',
    'Key Workflows: Create Project \u2192 Track Steps \u2192 Gate Reviews \u2192 Export Reports',
  ]);

  // KB Reference Table
  const s9 = pptx.addSlide();
  s9.background = { color: PWHITE };
  addH(s9, 'KB REFERENCE (1,468 CONCEPTS)');
  s9.addTable(
    [
      [{ text: 'KB Tier' }, { text: 'Concepts' }, { text: 'Sources' }],
      [{ text: 'Core Agentic AI' }, { text: '1,022' }, { text: '8 domains, 109 topic nodes' }],
      [{ text: 'RAG & MCP Deep' }, { text: '76' }, { text: 'Code scaffolds + deep concepts' }],
      [{ text: 'IBM Courses' }, { text: '85' }, { text: '6 IBM courses' }],
      [{ text: 'LinkedIn Learning' }, { text: '111' }, { text: '16 curated sources (LL01\u2013LL16)' }],
      [{ text: 'Strategy & Governance' }, { text: '174' }, { text: 'Cross-source synthesis' }],
      [{ text: 'Total' }, { text: '1,468' }, { text: '34+ sources' }],
    ],
    {
      x: 0.8, y: 1.0, w: 8.4, fontSize: 10, fontFace: 'Calibri', color: '334155',
      border: { type: 'solid', pt: 0.5, color: 'cbd5e1' },
      colW: [2.8, 1.4, 4.2],
      autoPage: false,
    }
  );
  addF(s9);

  // Closing
  const sC = pptx.addSlide();
  sC.background = { color: PNAVY };
  sC.addText('Agent Deployment Playbook', {
    x: 0.8, y: 1.5, w: 8.4, h: 0.6, fontSize: 28, fontFace: 'Calibri', color: PWHITE, bold: true, align: 'center',
  });
  sC.addText('Built by Padmasani Srimadhan', {
    x: 0.8, y: 2.4, w: 8.4, h: 0.4, fontSize: 14, fontFace: 'Calibri', color: PACCENT, align: 'center',
  });
  sC.addText(COPYRIGHT, {
    x: 0.8, y: 3.4, w: 8.4, h: 0.3, fontSize: 10, fontFace: 'Calibri', color: PGRAY, italic: true, align: 'center',
  });

  const ab = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
  return Buffer.from(ab);
}
