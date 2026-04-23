import { Prisma, PrismaClient } from '@prisma/client';
import path from 'path';
import { parseKbYaml, getAllKbFiles } from '../src/lib/yaml-parser';

const prisma = new PrismaClient();

function detectKbSource(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('ibm')) return 'ibm';
  if (lower.includes('rag_mcp') || lower.includes('rag-mcp')) return 'rag_mcp';
  return 'core';
}

async function main() {
  const kbDir = path.resolve(process.cwd(), process.env.KB_CONTENT_DIR || './content/kb');
  const files = getAllKbFiles(kbDir);

  console.log(`Found ${files.length} KB files in ${kbDir}`);

  // Clear existing concepts (re-sync)
  await prisma.kbConcept.deleteMany({});
  await prisma.kbDomain.deleteMany({});

  let totalDomains = 0;
  let totalConcepts = 0;

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const kbSource = detectKbSource(filename);
    const domains = parseKbYaml(filePath, kbSource);

    for (const domain of domains) {
      const dbDomain = await prisma.kbDomain.create({
        data: {
          kbSource,
          domainKey: domain.domainKey,
          domainName: domain.domainName,
          description: domain.description,
          conceptCount: domain.concepts.length,
        },
      });
      totalDomains++;

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

  console.log(`Synced ${totalDomains} domains, ${totalConcepts} concepts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
