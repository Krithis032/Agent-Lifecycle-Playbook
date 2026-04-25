import { Prisma, PrismaClient } from '@prisma/client';
import path from 'path';
import {
  parseKbYaml,
  parsePlaybookYaml,
  parseTemplatesYaml,
  getAllKbFiles,
} from '../src/lib/yaml-parser';

const prisma = new PrismaClient();

function detectKbSource(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('ibm')) return 'ibm';
  if (lower.includes('rag_mcp') || lower.includes('rag-mcp')) return 'rag_mcp';
  if (lower.includes('linkedin')) return 'linkedin';
  // Periodic table file is the governance & security KB
  if (lower.includes('periodic-table') || lower.includes('periodic_table')) return 'governance';
  // Strategy files (including kb_strategy_governance) remain in strategy tier
  if (lower.includes('strategy')) return 'strategy';
  return 'core';
}

async function main() {
  console.log('Seeding database...');

  // 1. Seed KB domains and concepts
  const kbDir = path.resolve(process.cwd(), 'content/kb');
  const kbFiles = getAllKbFiles(kbDir);
  let totalDomains = 0;
  let totalConcepts = 0;

  for (const filePath of kbFiles) {
    const filename = path.basename(filePath);
    const kbSource = detectKbSource(filename);
    const domains = parseKbYaml(filePath, kbSource);

    for (const domain of domains) {
      const dbDomain = await prisma.kbDomain.upsert({
        where: {
          uq_domain: { kbSource, domainKey: domain.domainKey },
        },
        update: {
          domainName: domain.domainName,
          description: domain.description,
          conceptCount: domain.concepts.length,
        },
        create: {
          kbSource,
          domainKey: domain.domainKey,
          domainName: domain.domainName,
          description: domain.description,
          conceptCount: domain.concepts.length,
        },
      });
      totalDomains++;

      // Delete existing concepts to prevent duplicates on re-seed
      await prisma.kbConcept.deleteMany({ where: { domainId: dbDomain.id } });

      for (const concept of domain.concepts) {
        await prisma.kbConcept.create({
          data: {
            domainId: dbDomain.id,
            conceptKey: concept.conceptKey,
            conceptName: concept.conceptName,
            definition: concept.definition || null,
            explanation: concept.explanation || null,
            sources: concept.sources.length > 0 ? (concept.sources as unknown as Prisma.InputJsonValue) : undefined,
            codeScaffold: concept.codeScaffold || null,
            relationships: concept.relationships ? (concept.relationships as unknown as Prisma.InputJsonValue) : undefined,
            metadata: concept.metadata ? (concept.metadata as unknown as Prisma.InputJsonValue) : undefined,
          },
        });
        totalConcepts++;
      }
    }
  }

  console.log(`Seeded ${totalDomains} KB domains, ${totalConcepts} concepts`);

  // 2. Seed playbook phases, steps, and gates
  const playbookPath = path.resolve(process.cwd(), 'content/playbook.yaml');
  let totalPhases = 0;
  let totalSteps = 0;
  let totalGates = 0;

  try {
    const phases = parsePlaybookYaml(playbookPath);
    for (const phase of phases) {
      const dbPhase = await prisma.playbookPhase.upsert({
        where: { slug: phase.slug },
        update: {
          phaseNum: phase.phaseNum,
          name: phase.name,
          icon: phase.icon,
          color: phase.color,
          duration: phase.duration,
          subtitle: phase.subtitle,
          interviewAngle: phase.interviewAngle,
          sortOrder: phase.phaseNum,
        },
        create: {
          phaseNum: phase.phaseNum,
          slug: phase.slug,
          name: phase.name,
          icon: phase.icon,
          color: phase.color,
          duration: phase.duration,
          subtitle: phase.subtitle,
          interviewAngle: phase.interviewAngle,
          sortOrder: phase.phaseNum,
        },
      });
      totalPhases++;

      // Delete existing steps and gates to prevent duplicates on re-seed
      // Must delete child ProjectGateCheck rows before parent GateCheck rows (FK constraint)
      const existingGates = await prisma.gateCheck.findMany({ where: { phaseId: dbPhase.id }, select: { id: true } });
      if (existingGates.length > 0) {
        await prisma.projectGateCheck.deleteMany({ where: { gateCheckId: { in: existingGates.map(g => g.id) } } });
      }
      await prisma.playbookStep.deleteMany({ where: { phaseId: dbPhase.id } });
      await prisma.gateCheck.deleteMany({ where: { phaseId: dbPhase.id } });

      for (const step of phase.steps) {
        await prisma.playbookStep.create({
          data: {
            phaseId: dbPhase.id,
            stepNum: step.stepNum,
            title: step.title,
            body: step.body,
            codeExample: step.codeExample || null,
            proTip: step.proTip || null,
            deliverables: step.deliverables as unknown as Prisma.InputJsonValue,
            tools: step.tools as unknown as Prisma.InputJsonValue,
            tableData: step.tableData ? (step.tableData as unknown as Prisma.InputJsonValue) : undefined,
            sortOrder: step.stepNum,
          },
        });
        totalSteps++;
      }

      if (phase.gate.checkItems.length > 0) {
        await prisma.gateCheck.create({
          data: {
            phaseId: dbPhase.id,
            gateTitle: phase.gate.gateTitle,
            checkItems: phase.gate.checkItems as unknown as Prisma.InputJsonValue,
          },
        });
        totalGates++;
      }
    }
  } catch (e) {
    console.log('No playbook.yaml found or parse error:', e);
  }

  console.log(`Seeded ${totalPhases} phases, ${totalSteps} steps, ${totalGates} gates`);

  // 3. Seed templates
  const templatesPath = path.resolve(process.cwd(), 'content/templates.yaml');
  let totalTemplates = 0;

  try {
    const templates = parseTemplatesYaml(templatesPath);
    for (const template of templates) {
      let phaseId: number | null = null;
      if (template.phaseSlug) {
        const phase = await prisma.playbookPhase.findUnique({
          where: { slug: template.phaseSlug },
        });
        if (phase) phaseId = phase.id;
      }

      await prisma.template.upsert({
        where: { slug: template.slug },
        update: {
          name: template.name,
          description: template.description,
          phaseId,
          fields: template.fields as unknown as Prisma.InputJsonValue,
        },
        create: {
          slug: template.slug,
          name: template.name,
          description: template.description,
          phaseId,
          fields: template.fields as unknown as Prisma.InputJsonValue,
        },
      });
      totalTemplates++;
    }
  } catch (e) {
    console.log('No templates.yaml found or parse error:', e);
  }

  console.log(`Seeded ${totalTemplates} templates`);

  // 4. Admin user creation is handled via the /setup page on first visit.
  //    This ensures no credentials are logged or hardcoded.
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('\nNo admin user found. Visit /setup in your browser to create one.');
  } else {
    console.log(`${userCount} user(s) already exist, skipping admin setup.`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
