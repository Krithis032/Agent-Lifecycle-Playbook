import { Prisma, PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import path from 'path';
import {
  parseKbYaml,
  parsePlaybookYaml,
  parseTemplatesYaml,
  getAllKbFiles,
} from '../src/lib/yaml-parser';

const prisma = new PrismaClient();

async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

function detectKbSource(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('ibm')) return 'ibm';
  if (lower.includes('rag_mcp') || lower.includes('rag-mcp')) return 'rag_mcp';
  if (lower.includes('linkedin')) return 'linkedin';
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

  // 4. Seed default admin user (generate random password if creating)
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@adp.local' } });
  if (!existingAdmin) {
    const generatedPassword = randomBytes(16).toString('hex');
    await prisma.user.create({
      data: {
        email: 'admin@adp.local',
        passwordHash: await hashPassword(generatedPassword),
        name: 'Admin',
        role: 'admin',
      },
    });
    console.log('\n========================================');
    console.log('  ADMIN CREDENTIALS (save these now!)');
    console.log('  Email:    admin@adp.local');
    console.log(`  Password: ${generatedPassword}`);
    console.log('========================================\n');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
