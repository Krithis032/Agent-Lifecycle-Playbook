import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateProjectPdf } from '@/lib/pdf-export';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; format: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { id, format } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId) || format !== 'pdf') {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      currentPhase: true,
      phaseProgress: {
        include: { phase: { select: { name: true, phaseNum: true } } },
        orderBy: { phase: { sortOrder: 'asc' } },
      },
      stepProgress: {
        include: { step: { select: { stepNum: true, title: true, phaseId: true } } },
      },
      gateChecks: {
        include: { gateCheck: { select: { gateTitle: true } } },
      },
      templateFills: {
        include: { template: { select: { name: true, fields: true } } },
        orderBy: { updatedAt: 'desc' },
      },
      governance: {
        take: 5,
        orderBy: { assessedAt: 'desc' },
        include: {
          riskItems: true,
          whartonScores: { orderBy: { score: 'asc' }, take: 12 },
        },
      },
      evaluations: { take: 5, orderBy: { createdAt: 'desc' } },
      caioAssessments: {
        take: 3,
        orderBy: { assessedAt: 'desc' },
        include: {
          domainScores: { orderBy: { score: 'asc' }, take: 12 },
          findings: { orderBy: { severity: 'asc' }, take: 10 },
          actionItems: { take: 10 },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // ── Build Report Sections ──
  const sections = [];

  // ────────────────────────────────────────────
  // 1. EXECUTIVE SUMMARY WITH COMPREHENSIVE FINDINGS
  // ────────────────────────────────────────────
  const completedPhases = project.phaseProgress.filter((pp) => pp.status === 'completed').length;
  const totalPhases = project.phaseProgress.length;
  const completedSteps = project.stepProgress.filter((sp) => sp.status === 'completed').length;
  const totalSteps = project.stepProgress.length;
  const gatesPassed = project.gateChecks.filter((g) => g.checked).length;
  const totalGates = project.gateChecks.length;
  const latestGov = project.governance[0];
  const latestCaio = project.caioAssessments[0];
  const inProgressSteps = project.stepProgress.filter((sp) => sp.status === 'in_progress').length;
  const totalFills = project.templateFills.length;
  const openRisks = project.governance.reduce((sum, g) => sum + g.riskItems.filter(r => r.status === 'open').length, 0);

  sections.push({
    title: 'Executive Summary',
    items: [
      { label: 'Project', value: project.name },
      { label: 'Description', value: project.description || '\u2014' },
      { label: 'Status', value: project.status.toUpperCase() },
      { label: 'Current Phase', value: project.currentPhase?.name || '\u2014' },
      { label: 'Framework', value: project.framework || '\u2014' },
      { label: 'Architecture', value: project.architecturePattern?.replace(/_/g, ' ') || '\u2014' },
      { label: '\u2500 Progress Overview \u2500', value: '' },
      { label: 'Phase Completion', value: `${completedPhases} of ${totalPhases} phases completed (${totalPhases > 0 ? Math.round(completedPhases / totalPhases * 100) : 0}%)` },
      { label: 'Step Completion', value: `${completedSteps} of ${totalSteps} steps completed (${totalSteps > 0 ? Math.round(completedSteps / totalSteps * 100) : 0}%)` },
      { label: 'Steps In Progress', value: `${inProgressSteps} step${inProgressSteps !== 1 ? 's' : ''} currently in progress` },
      { label: 'Gate Readiness', value: `${gatesPassed} of ${totalGates} gate checks passed (${totalGates > 0 ? Math.round(gatesPassed / totalGates * 100) : 0}%)` },
      { label: '\u2500 Assessment Summary \u2500', value: '' },
      { label: 'Risk Classification', value: latestGov?.riskClassification?.toUpperCase() || latestCaio?.riskClassification?.toUpperCase() || 'Not assessed' },
      { label: 'Governance Score', value: latestGov?.overallScore ? `${latestGov.overallScore}/100` : 'Not assessed' },
      { label: 'CAIO Maturity', value: latestCaio?.maturityLabel ? `Level ${latestCaio.maturityLevel}: ${latestCaio.maturityLabel}` : 'Not assessed' },
      { label: 'Open Risks', value: `${openRisks} open risk${openRisks !== 1 ? 's' : ''} identified` },
      { label: 'Documents Created', value: `${totalFills} template document${totalFills !== 1 ? 's' : ''} completed` },
    ],
  });

  // ────────────────────────────────────────────
  // 2. PHASE-BY-PHASE OUTCOMES
  // ────────────────────────────────────────────
  sections.push({
    title: 'Phase Progress & Outcomes',
    items: project.phaseProgress.map((pp) => {
      const phaseSteps = project.stepProgress.filter((sp) => sp.step.phaseId === pp.phaseId);
      const done = phaseSteps.filter((s) => s.status === 'completed').length;
      const phasePct = phaseSteps.length > 0 ? Math.round(done / phaseSteps.length * 100) : 0;
      let statusLine = pp.status.replace(/_/g, ' ').toUpperCase();
      if (pp.startedAt) statusLine += ` \u00b7 Started: ${new Date(pp.startedAt).toLocaleDateString()}`;
      if (pp.completedAt) statusLine += ` \u00b7 Completed: ${new Date(pp.completedAt).toLocaleDateString()}`;
      statusLine += ` \u00b7 Steps: ${done}/${phaseSteps.length} (${phasePct}%)`;
      return {
        label: `Phase ${pp.phase.phaseNum}: ${pp.phase.name}`,
        value: statusLine,
      };
    }),
  });

  // ────────────────────────────────────────────
  // 3. STEP-LEVEL FINDINGS (completed steps with notes/deliverables)
  // ────────────────────────────────────────────
  const stepsWithNotes = project.stepProgress.filter((sp) => sp.notes || sp.deliverableData);
  if (stepsWithNotes.length > 0) {
    sections.push({
      title: 'Step Findings & Deliverables',
      items: stepsWithNotes.map((sp) => {
        const deliverables = sp.deliverableData as Record<string, string> | null;
        const filledCount = deliverables ? Object.values(deliverables).filter(Boolean).length : 0;
        let val = `Status: ${sp.status.replace(/_/g, ' ').toUpperCase()}`;
        if (filledCount > 0) val += ` \u00b7 ${filledCount} deliverables recorded`;
        if (sp.notes) val += `\n${sp.notes}`;
        if (deliverables) {
          const deliverableEntries = Object.entries(deliverables).filter(([, v]) => v?.trim());
          for (const [, v] of deliverableEntries) {
            val += `\n  \u2022 ${v}`;
          }
        }
        return {
          label: `Step ${sp.step.stepNum}: ${sp.step.title}`,
          value: val,
        };
      }),
    });
  }

  // ────────────────────────────────────────────
  // 4. ALL TEMPLATE FILL DATA (FULL FORM CONTENT)
  // ────────────────────────────────────────────
  if (project.templateFills.length > 0) {
    for (const tf of project.templateFills) {
      const values = tf.fieldValues as Record<string, string>;
      const fields = tf.template.fields as {
        key: string;
        label: string;
        type?: string;
        section?: string;
        columns?: { key: string; header: string }[];
        subFields?: { key: string; label: string }[];
      }[];

      // Include ALL fields, showing filled values and marking empty ones
      const filledFields = fields
        .filter((f) => {
          const v = values[f.key];
          if (!v) return false;
          // For tables/repeatables, check if there's actual content
          if (f.type === 'table' || f.type === 'repeatable') {
            try {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.some((row: Record<string, string>) =>
                  Object.values(row).some(val => val?.toString().trim())
                );
              }
              return false;
            } catch { return !!v.trim(); }
          }
          // For checkboxes, always show
          if (f.type === 'checkbox' || f.type === 'checkbox_with_rationale') return true;
          return v.trim().length > 0;
        })
        .map((f) => ({
          label: f.label,
          value: values[f.key],
          type: f.type,
          columns: f.columns,
          subFields: f.subFields,
        }));

      if (filledFields.length > 0) {
        sections.push({
          title: `${tf.template.name}: ${tf.title}`,
          items: filledFields,
        });
      }
    }
  }

  // ────────────────────────────────────────────
  // 5. GOVERNANCE ASSESSMENT FINDINGS
  // ────────────────────────────────────────────
  if (project.governance.length > 0) {
    for (const gov of project.governance.slice(0, 2)) {
      const items = [
        { label: 'Assessment Type', value: gov.assessmentType.toUpperCase() },
        { label: 'Overall Score', value: gov.overallScore ? `${gov.overallScore}/100` : '\u2014' },
        { label: 'Risk Classification', value: gov.riskClassification?.toUpperCase() || '\u2014' },
        { label: 'Assessed By', value: gov.assessor || '\u2014' },
        { label: 'Date', value: new Date(gov.assessedAt).toLocaleDateString() },
      ];

      // Wharton Domain Scores
      if (gov.whartonScores.length > 0) {
        items.push({ label: '\u2500 Domain Scores \u2500', value: '' });
        for (const ws of gov.whartonScores) {
          items.push({
            label: ws.domainName,
            value: `${(Number(ws.score) * 100).toFixed(0)}% \u00b7 Risk: ${ws.riskLevel || '\u2014'}`,
          });
        }
      }

      // Risk Items
      if (gov.riskItems.length > 0) {
        items.push({ label: '\u2500 Identified Risks \u2500', value: '' });
        for (const ri of gov.riskItems.slice(0, 8)) {
          items.push({
            label: `[${ri.severity.toUpperCase()}] ${ri.title}`,
            value: `${ri.description || ''} \u00b7 Mitigation: ${ri.mitigation || 'Not specified'} \u00b7 Status: ${ri.status}`,
          });
        }
      }

      if (gov.notes) {
        items.push({ label: 'Notes', value: gov.notes });
      }

      sections.push({
        title: `Governance Assessment \u2014 ${gov.assessmentType} (${new Date(gov.assessedAt).toLocaleDateString()})`,
        items,
      });
    }
  }

  // ────────────────────────────────────────────
  // 6. CAIO MATURITY ASSESSMENT
  // ────────────────────────────────────────────
  if (project.caioAssessments.length > 0) {
    for (const caio of project.caioAssessments.slice(0, 2)) {
      const items = [
        { label: 'Initiative', value: caio.initiativeName },
        { label: 'Mode', value: caio.assessmentMode.toUpperCase() },
        { label: 'Overall Score', value: caio.overallScore ? `${(Number(caio.overallScore) * 100).toFixed(0)}%` : '\u2014' },
        { label: 'Maturity Level', value: caio.maturityLabel ? `Level ${caio.maturityLevel}: ${caio.maturityLabel}` : '\u2014' },
        { label: 'Target Maturity', value: caio.targetMaturity ? `Level ${caio.targetMaturity}` : '\u2014' },
        { label: 'Risk Classification', value: caio.riskClassification?.toUpperCase() || '\u2014' },
      ];

      if (caio.executiveSummary) {
        items.push({ label: 'Executive Summary', value: caio.executiveSummary });
      }

      // Domain Scores
      if (caio.domainScores.length > 0) {
        items.push({ label: '\u2500 Domain Scores \u2500', value: '' });
        for (const ds of caio.domainScores) {
          items.push({
            label: ds.domainName,
            value: `${(Number(ds.score) * 100).toFixed(0)}% \u00b7 Risk: ${ds.riskLevel || '\u2014'}`,
          });
        }
      }

      // Findings
      if (caio.findings.length > 0) {
        items.push({ label: '\u2500 Key Findings \u2500', value: '' });
        for (const f of caio.findings.slice(0, 8)) {
          items.push({
            label: `[${f.severity.toUpperCase()}] ${f.title}`,
            value: `${f.finding}${f.rationale ? ` \u00b7 Rationale: ${f.rationale}` : ''}${f.frameworkRef ? ` \u00b7 Ref: ${f.frameworkRef}` : ''}`,
          });
        }
      }

      // Action Items
      if (caio.actionItems.length > 0) {
        items.push({ label: '\u2500 Action Items \u2500', value: '' });
        for (const a of caio.actionItems.slice(0, 8)) {
          items.push({
            label: `[${a.phase.toUpperCase()}] ${a.domainKey}`,
            value: `${a.action} \u00b7 Owner: ${a.owner || '\u2014'} \u00b7 Status: ${a.status}`,
          });
        }
      }

      sections.push({
        title: `CAIO Maturity \u2014 ${caio.initiativeName} (${new Date(caio.assessedAt).toLocaleDateString()})`,
        items,
      });
    }
  }

  // ────────────────────────────────────────────
  // 7. EVALUATION RESULTS
  // ────────────────────────────────────────────
  if (project.evaluations.length > 0) {
    for (const ev of project.evaluations.slice(0, 3)) {
      const options = ev.options as { id: string; name: string }[];
      const criteria = ev.criteria as { id: string; name: string; weight: number }[];
      const scores = ev.scores as Record<string, Record<string, number>>;
      const items = [
        { label: 'Evaluation Type', value: ev.evalType.replace(/_/g, ' ').toUpperCase() },
        { label: 'Recommendation', value: ev.recommendation || '\u2014' },
        { label: 'Rationale', value: ev.rationale || '\u2014' },
        { label: 'Options Compared', value: options?.map((o) => o.name).join(', ') || '\u2014' },
        { label: 'Criteria', value: criteria?.map((c) => `${c.name} (weight: ${c.weight})`).join(', ') || '\u2014' },
      ];

      // Score breakdown
      if (options && criteria && scores) {
        items.push({ label: '\u2500 Score Breakdown \u2500', value: '' });
        for (const opt of options) {
          const optScores = criteria.map((c) => {
            const raw = scores[opt.id]?.[c.id] ?? 0;
            return `${c.name}: ${raw}/5`;
          }).join(', ');
          const weighted = criteria.reduce((sum, c) => {
            return sum + (scores[opt.id]?.[c.id] ?? 0) * (c.weight || 1);
          }, 0);
          items.push({
            label: opt.name,
            value: `${optScores} \u00b7 Weighted: ${weighted.toFixed(1)}`,
          });
        }
      }

      sections.push({
        title: `Evaluation \u2014 ${ev.title}`,
        items,
      });
    }
  }

  const meta = {
    status: project.status,
    framework: project.framework || undefined,
    architecture: project.architecturePattern?.replace(/_/g, ' ') || undefined,
    createdAt: new Date(project.createdAt).toLocaleDateString(),
  };

  try {
    const buffer = generateProjectPdf(project.name, project.description || '', sections, meta);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${project.name.replace(/[^a-zA-Z0-9 ]/g, '')}_Report.pdf"`,
      },
    });
  } catch (err) {
    logError('GET /api/projects/export', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
