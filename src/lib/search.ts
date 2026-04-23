import prisma from './prisma';

interface SearchResult {
  id: number;
  concept_name: string;
  definition: string | null;
  explanation: string | null;
  sources: unknown;
  code_scaffold: string | null;
  relationships: unknown;
  metadata: unknown;
  domain_name: string;
  kb_source: string;
  relevance: number;
}

// Prisma $queryRaw returns BigInt for integer literals and aggregates.
// JSON.stringify cannot serialize BigInt, so we convert to Number.
function serializeResults(rows: Record<string, unknown>[]): SearchResult[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = typeof v === 'bigint' ? Number(v) : v;
    }
    return out as unknown as SearchResult;
  });
}

export async function searchConcepts(query: string, limit: number = 10): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const raw = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT c.id, c.concept_name, c.definition, c.explanation, c.sources,
           c.code_scaffold, c.relationships, c.metadata,
           d.domain_name, d.kb_source,
           MATCH(c.search_text) AGAINST(${query} IN NATURAL LANGUAGE MODE) as relevance
    FROM kb_concepts c
    JOIN kb_domains d ON c.domain_id = d.id
    WHERE MATCH(c.search_text) AGAINST(${query} IN NATURAL LANGUAGE MODE)
    ORDER BY relevance DESC
    LIMIT ${limit}
  `;
  return serializeResults(raw);
}

export async function searchConceptsFallback(query: string, limit: number = 10): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  // Escape LIKE special characters to prevent wildcard injection
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  const likeQuery = `%${escaped}%`;
  const raw = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT c.id, c.concept_name, c.definition, c.explanation, c.sources,
           c.code_scaffold, c.relationships, c.metadata,
           d.domain_name, d.kb_source,
           CAST(1 AS SIGNED) as relevance
    FROM kb_concepts c
    JOIN kb_domains d ON c.domain_id = d.id
    WHERE c.concept_name LIKE ${likeQuery}
       OR c.definition LIKE ${likeQuery}
       OR c.explanation LIKE ${likeQuery}
    ORDER BY c.concept_name
    LIMIT ${limit}
  `;
  return serializeResults(raw);
}
