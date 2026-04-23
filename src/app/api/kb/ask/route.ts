import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { searchConceptsFallback } from '@/lib/search';
import { askClaude } from '@/lib/claude';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const limited = rateLimit(req, { maxRequests: 10, windowMs: 60_000, keyPrefix: 'kb-ask' });
  if (limited) return limited;

  const { question, projectId } = await req.json();
  if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

  // Sanitize user input: truncate to 2000 chars and strip control characters
  const sanitizedQuestion = question
    .toString()
    .slice(0, 2000)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Retrieve top 10 concepts
  const concepts = await searchConceptsFallback(sanitizedQuestion, 10);

  const conceptContext = concepts
    .map(
      (c, i) =>
        `[${i + 1}] ${c.concept_name} (${c.domain_name})\nDefinition: ${c.definition || 'N/A'}\nExplanation: ${c.explanation || 'N/A'}\nSources: ${JSON.stringify(c.sources) || 'N/A'}`
    )
    .join('\n\n');

  const systemPrompt = `You are the KB Advisor for the Agent Deployment Playbook (ADP).
Answer the user's question using ONLY the knowledge base concepts below.
Cite concepts by name and source. If the KB doesn't cover it, say so.

## Knowledge Base Tiers (1,468 total concepts across 5 tiers)
1. **Core Agentic AI KB** — 1,022 concepts (foundations, architecture, multi-agent, memory, tools, infrastructure, enterprise safety, blueprints)
2. **RAG & MCP Deep KB** — 76 concepts with code scaffolds
3. **IBM Courses KB** — 85 concepts from IBM agentic AI curriculum
4. **LinkedIn Learning KB** — 111 concepts (LL01–LL16) covering agents, MCP strategy, productivity
5. **Strategy & Governance KB** — 174 concepts: governance (NIST/TRiSM/CAIO), agent evolution patterns, build & deploy

## Source Attribution Guide
- Sources starting with B01–B18 → Book chapters
- Sources starting with LL01–LL16 → LinkedIn Learning courses
- Sources containing "strategy", "governance", "evolution", or "build_deploy" → Strategy KB synthesis

## Retrieved Concepts (Top ${concepts.length})
${conceptContext}

## Instructions
- Ground every claim in a specific concept above
- Cite sources in [SourceCode] format (e.g., [B07 Ch3], [LL04], [Strategy-Governance])
- For market trends, adoption stats, paradigm comparisons → prefer LinkedIn Learning concepts
- For NIST/TRiSM/CAIO/McKinsey governance → prefer Strategy Governance concepts
- For CI/CD, MLOps, scaling patterns → prefer Strategy Build & Deploy concepts
- Be concise but thorough`;

  // Wrap user question in XML tags to prevent prompt injection
  const userPrompt = `<user_question>${sanitizedQuestion}</user_question>`;

  try {
    const result = await askClaude(systemPrompt, userPrompt, 'advisor');

    // Log the query
    await prisma.kbQuery.create({
      data: {
        projectId: projectId || null,
        queryText: sanitizedQuestion,
        response: result.text,
        conceptsUsed: concepts.map((c) => c.id),
        modelUsed: result.model,
        tokensUsed: result.tokensUsed,
      },
    });

    return NextResponse.json({
      answer: result.text,
      conceptsCited: concepts.slice(0, 5).map((c) => ({
        id: c.id,
        name: c.concept_name,
        domain: c.domain_name,
        source: Array.isArray(c.sources) ? (c.sources as string[])[0] || '' : '',
      })),
      confidence: concepts.length > 3 ? 'high' : concepts.length > 0 ? 'medium' : 'low',
      modelUsed: result.model,
      tokensUsed: result.tokensUsed,
    });
  } catch {
    return NextResponse.json(
      { error: 'Advisor unavailable' },
      { status: 500 }
    );
  }
}
